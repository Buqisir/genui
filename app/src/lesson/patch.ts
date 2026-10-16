// Incremental editing: a patch carries only the blocks that change and is merged into the lesson by name.
// Format: a `<!-- patch -->` line, an optional front matter block, then component blocks only.
// All-or-nothing: any error leaves the lesson untouched.
import YAML from 'yaml'
import { openingTagLength, parseLesson, type Block, type Props } from './parse'

export const PATCH_MARK = '<!-- patch -->'

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

export function isPatch(text: string): boolean {
  return text.trimStart().startsWith(PATCH_MARK)
}

export interface BlockKey {
  key: string
  component: string
  line: number
  end: number
}

export interface PatchResult {
  ok: boolean
  text: string
  applied: string[]
  errors: string[]
}

type ComponentBlock = Extract<Block, { kind: 'component' }>

const isComponent = (b: Block): b is ComponentBlock => b.kind === 'component'

interface Info {
  component: string
  occurrence: number
  /** The first non-empty string among name, title, label. */
  value?: string
  key: string
  line: number
  end: number
}

type Found = { info: Info } | { missing: true } | { ambiguous: string }

function nameOf(props: Props): string | undefined {
  for (const k of ['name', 'title', 'label']) {
    const v = props[k]
    if (typeof v === 'string' && v !== '') return v
  }
  return undefined
}

/** Component blocks of a lesson with their keys. A named key is used only when no other block of the same component shares the name. */
function analyze(source: string): Info[] {
  const blocks = parseLesson(source).blocks.filter(isComponent)
  const counts = new Map<string, number>()
  const infos: Info[] = blocks.map((b) => {
    const occurrence = (counts.get(b.name) ?? 0) + 1
    counts.set(b.name, occurrence)
    return { component: b.name, occurrence, value: nameOf(b.props), key: '', line: b.line, end: b.end }
  })
  for (const info of infos) {
    const unique =
      info.value !== undefined && infos.filter((o) => o.component === info.component && o.value === info.value).length === 1
    info.key = unique ? `${info.component}:${info.value}` : `${info.component}#${info.occurrence}`
  }
  return infos
}

export function listKeys(source: string): BlockKey[] {
  return analyze(source).map(({ key, component, line, end }) => ({ key, component, line, end }))
}

export function formatKeys(source: string): string {
  return listKeys(source)
    .map((k) => `${k.key}（第 ${k.line}–${k.end} 行）`)
    .join('\n')
}

/** Resolves `Comp:name` or `Comp#n` against the base blocks. */
function resolveKey(infos: Info[], key: string): Found {
  const m = /^([A-Z][A-Za-z0-9]*)([:#])(.+)$/.exec(key)
  if (!m) return { missing: true }
  const [, component, sep, rest] = m
  const same = infos.filter((i) => i.component === component)
  if (sep === '#') {
    const info = /^[1-9]\d*$/.test(rest) ? same[Number(rest) - 1] : undefined
    return info ? { info } : { missing: true }
  }
  const hits = same.filter((i) => i.value === rest)
  if (hits.length === 1) return { info: hits[0] }
  if (hits.length === 0) return { missing: true }
  return { ambiguous: `${key} 有 ${hits.length} 个同名块，请改用 ${component}#序号` }
}

/** Removes patch / after / before from the opening tag only. */
function stripDirectives(text: string): string {
  const lt = text.indexOf('<')
  const n = lt < 0 ? -1 : openingTagLength(text.slice(lt))
  if (n < 0) return text
  const head = text.slice(0, lt + n).replace(/\s+(?:patch|after|before)=(?:"[^"]*"|\{[^}]*\})/g, '')
  return head + text.slice(lt + n)
}

function preview(text: string): string {
  return Array.from(text.trim().replace(/\s+/g, ' ')).slice(0, 30).join('')
}

// ---- front matter: top-level key blocks ----

interface FmSeg {
  key?: string
  lines: string[]
}

/** Splits front matter lines into top-level key blocks. Trailing blank lines become keyless segments. */
function splitFront(lines: string[]): FmSeg[] {
  const segs: FmSeg[] = []
  for (const line of lines) {
    const m = /^([A-Za-z_][\w-]*):/.exec(line)
    const last = segs[segs.length - 1]
    if (m) segs.push({ key: m[1], lines: [line] })
    else if (last && last.key !== undefined) last.lines.push(line)
    else segs.push({ lines: [line] })
  }
  const out: FmSeg[] = []
  for (const seg of segs) {
    if (seg.key === undefined) {
      out.push(seg)
      continue
    }
    let n = seg.lines.length
    while (n > 1 && seg.lines[n - 1].trim() === '') n--
    out.push({ key: seg.key, lines: seg.lines.slice(0, n) })
    if (n < seg.lines.length) out.push({ lines: seg.lines.slice(n) })
  }
  return out
}

const isNullBlock = (seg: FmSeg): boolean => seg.lines.length === 1 && /^[A-Za-z_][\w-]*:\s*null\s*$/.test(seg.lines[0])

function mergeFront(base: FmSeg[], patch: FmSeg[], applied: string[]): string[] {
  const patchByKey = new Map<string, FmSeg>()
  for (const p of patch) if (p.key !== undefined) patchByKey.set(p.key, p)
  const inBase = new Set<string>()
  const out: string[] = []
  for (const seg of base) {
    const p = seg.key !== undefined ? patchByKey.get(seg.key) : undefined
    if (seg.key === undefined || !p) {
      out.push(...seg.lines)
      continue
    }
    inBase.add(seg.key)
    if (isNullBlock(p)) {
      applied.push(`删除头信息 ${seg.key}`)
      continue
    }
    applied.push(`头信息 ${seg.key}`)
    out.push(...p.lines)
  }
  for (const p of patch) {
    if (p.key === undefined || inBase.has(p.key) || isNullBlock(p)) continue
    applied.push(`头信息 ${p.key}`)
    out.push(...p.lines)
  }
  return out.length ? out : ['']
}

// ---- merge ----

interface Edit {
  start: number
  end: number
  lines: string[]
  order: number
}

type Op =
  | { kind: 'replace'; target: Info; text: string }
  | { kind: 'delete'; target: Info }
  | { kind: 'insert'; anchor: Info; where: 'after' | 'before'; text: string; label: string }

export function applyPatch(base: string, patch: string): PatchResult {
  const fail = (errors: string[]): PatchResult => ({ ok: false, text: base, applied: [], errors })
  if (!isPatch(patch)) return fail([`补丁要以 ${PATCH_MARK} 开头`])

  const patchLines = patch.split('\n')
  const markIdx = patchLines.findIndex((l) => l.trim() !== '')
  if (patchLines[markIdx].trim() !== PATCH_MARK) return fail([`补丁要以 ${PATCH_MARK} 开头`])
  let bodyStart = markIdx + 1
  while (bodyStart < patchLines.length && patchLines[bodyStart].trim() === '') bodyStart++
  const body = patchLines.slice(bodyStart).join('\n')
  const bodyLines = body.split('\n')

  const parsed = parseLesson(body)
  const errors: string[] = []
  for (const e of parsed.errors) errors.push(`补丁第 ${bodyStart + e.line} 行：${e.message}`)
  for (const b of parsed.blocks) {
    if (b.kind === 'markdown') errors.push(`补丁里只能写组件块和头信息：「${preview(b.text)}」`)
  }

  const patchFmMatch = FRONT_MATTER.exec(body)
  const patchFront = patchFmMatch ? splitFront(patchFmMatch[1].split('\n')) : []
  const frontKeys = patchFront.filter((s) => s.key !== undefined)
  const patchComps = parsed.blocks.filter(isComponent)
  if (!patchComps.length && !frontKeys.length) return fail(['补丁是空的'])

  const seenFront = new Set<string>()
  for (const s of frontKeys) {
    if (seenFront.has(s.key as string)) errors.push(`头信息 ${s.key} 在补丁里出现了两次`)
    seenFront.add(s.key as string)
  }

  // Component blocks: classify each as delete, replace or insert.
  const baseLines = base.split('\n')
  const infos = analyze(base)
  const ops: Op[] = []
  const targeted = new Set<Info>()
  const claim = (info: Info) => {
    if (targeted.has(info)) errors.push(`同一个块在补丁里出现了两次：${info.key}`)
    targeted.add(info)
  }

  for (const pb of patchComps) {
    const text = bodyLines.slice(pb.line - 1, pb.end).join('\n')

    if (pb.name === 'Remove') {
      const t = pb.props.target
      if (typeof t !== 'string') {
        errors.push('Remove 要写 target="KEY" 指明删除哪个块')
        continue
      }
      const found = resolveKey(infos, t)
      if ('info' in found) {
        claim(found.info)
        ops.push({ kind: 'delete', target: found.info })
      } else errors.push('ambiguous' in found ? found.ambiguous : `找不到要删除的块 ${t}`)
      continue
    }

    const own = nameOf(pb.props)
    const ownKey = own !== undefined ? `${pb.name}:${own}` : undefined
    let target: Info | undefined
    if (pb.props.patch !== undefined) {
      const p = pb.props.patch
      if (typeof p !== 'string') {
        errors.push(`${pb.name} 的 patch 要写成 "KEY"`)
        continue
      }
      const found = resolveKey(infos, p)
      if ('info' in found) target = found.info
      else {
        errors.push('ambiguous' in found ? found.ambiguous : `找不到要替换的块 ${p}`)
        continue
      }
    } else if (ownKey !== undefined) {
      const found = resolveKey(infos, ownKey)
      if ('info' in found) target = found.info
      else if ('ambiguous' in found) {
        errors.push(found.ambiguous)
        continue
      }
    }

    if (target) {
      if (target.component !== pb.name) {
        errors.push(`补丁里的 ${pb.name} 不能替换 ${target.component} 块 ${target.key}`)
        continue
      }
      claim(target)
      ops.push({ kind: 'replace', target, text: stripDirectives(text) })
      continue
    }

    const { after, before } = pb.props
    if (after !== undefined && before !== undefined) {
      errors.push(`新组件 ${pb.name} 不能同时写 after 和 before`)
      continue
    }
    const anchorKey = after ?? before
    if (anchorKey === undefined) {
      errors.push(`新组件 ${pb.name} 要写 after="…" 指明放在哪个块后面`)
      continue
    }
    if (typeof anchorKey !== 'string') {
      errors.push(`${pb.name} 的 ${after !== undefined ? 'after' : 'before'} 要写成 "KEY"`)
      continue
    }
    const found = resolveKey(infos, anchorKey)
    if (!('info' in found)) {
      errors.push('ambiguous' in found ? found.ambiguous : `找不到锚点块 ${anchorKey}`)
      continue
    }
    ops.push({
      kind: 'insert',
      anchor: found.info,
      where: after !== undefined ? 'after' : 'before',
      text: stripDirectives(text),
      label: ownKey ?? pb.name,
    })
  }

  const deleted = new Set<Info>()
  for (const op of ops) if (op.kind === 'delete') deleted.add(op.target)
  for (const op of ops) {
    if (op.kind === 'insert' && deleted.has(op.anchor)) errors.push(`锚点 ${op.anchor.key} 已被删除，不能放在它前后`)
  }

  // Front matter: merge key blocks.
  const applied: string[] = []
  const fmApplied: string[] = []
  const baseFmMatch = FRONT_MATTER.exec(base)
  const baseInner = baseFmMatch ? baseFmMatch[1].split('\n') : []
  let frontLines: string[] | undefined
  if (frontKeys.length) {
    frontLines = mergeFront(splitFront(baseInner), patchFront, fmApplied)
    try {
      YAML.parse(frontLines.join('\n'))
    } catch (e) {
      errors.push(`头信息合并后不是合法的 YAML：${(e as Error).message}`)
    }
  }

  if (errors.length) return fail(errors)

  const edits: Edit[] = []
  ops.forEach((op, order) => {
    if (op.kind === 'replace') {
      edits.push({ start: op.target.line - 1, end: op.target.end, lines: op.text.split('\n'), order })
      applied.push(`替换 ${op.target.key}`)
    } else if (op.kind === 'delete') {
      const start = op.target.line - 1
      let end = op.target.end
      // Drop one of two blank lines that would end up adjacent.
      if (baseLines[start - 1]?.trim() === '' && baseLines[end]?.trim() === '') end++
      edits.push({ start, end, lines: [], order })
      applied.push(`删除 ${op.target.key}`)
    } else if (op.where === 'after') {
      const pos = op.anchor.end
      const lines = ['', ...op.text.split('\n')]
      if (baseLines[pos] !== undefined && baseLines[pos].trim() !== '') lines.push('')
      edits.push({ start: pos, end: pos, lines, order })
      applied.push(`新增 ${op.label}（在 ${op.anchor.key} 之后）`)
    } else {
      const pos = op.anchor.line - 1
      const lines: string[] = []
      if (pos > 0 && baseLines[pos - 1].trim() !== '') lines.push('')
      lines.push(...op.text.split('\n'), '')
      edits.push({ start: pos, end: pos, lines, order })
      applied.push(`新增 ${op.label}（在 ${op.anchor.key} 之前）`)
    }
  })

  // Bottom-up, so earlier line numbers stay valid.
  const lines = baseLines.slice()
  edits.sort((a, b) => b.start - a.start || b.end - a.end || b.order - a.order)
  for (const e of edits) lines.splice(e.start, e.end - e.start, ...e.lines)

  if (frontLines) {
    if (baseFmMatch) lines.splice(1, baseInner.length, ...frontLines)
    else if (frontLines.some((l) => l.trim() !== '')) lines.unshift('---', ...frontLines, '---')
  }

  return { ok: true, text: lines.join('\n'), applied: [...applied, ...fmApplied], errors: [] }
}
