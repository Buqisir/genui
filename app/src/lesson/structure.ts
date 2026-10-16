// Groups the validator's structural problems: unfinished blocks, names used but not declared, and
// names declared but never used. Callers print these first, and leave them out of the per-issue list.
import type { Issue } from './validate'

export interface Unresolved {
  name: string
  /** Where the name is used: a block key (`Define:sFormula`), `answers`, `变式「…」`, or `第 N 行`. */
  refs: string[]
  /** A close name from the message's 「（是不是 R？）」 suggestion. */
  suggest?: string
}

export interface Orphaned {
  name: string
  kind?: 'Param' | 'Define'
}

export interface Structure {
  /** Unclosed tags, missing scene, empty answers, missing front-matter fields. Original issues, in order. */
  incomplete: Issue[]
  unresolved: Unresolved[]
  orphaned: Orphaned[]
}

const UNRESOLVED_CODES = new Set(['undeclared-name', 'answer-unknown-name', 'variant-unknown-name'])

/** Tried in this order; the first match gives the name when the issue has no `name` field. */
const NAME_PATTERNS = [/引用了未声明的名字 ([^\s：（，]+)/, /answers 里的 (\S+?) 没有对应/, /expect 里的 (\S+?) 没有对应/]
const SUGGEST = /（是不是 ([^？]+)？）/
const VARIANT = /变式「([^」]+)」/
const ORPHAN_NAME = /^(Param|Define) (\S+) 声明了/
const ORPHAN_KIND = /^(Param|Define) /

/** The name an unresolved-name issue is about, from the field or, failing that, from its message. */
function nameOf(issue: Issue): string | undefined {
  if (issue.name) return issue.name
  for (const re of NAME_PATTERNS) {
    const m = re.exec(issue.message)
    if (m) return m[1]
  }
  return undefined
}

function isUnresolved(issue: Issue): boolean {
  return issue.code !== undefined && UNRESOLVED_CODES.has(issue.code) && nameOf(issue) !== undefined
}

function isIncomplete(issue: Issue): boolean {
  if (issue.unclosed) return true
  if (issue.code === 'no-scene' || issue.code === 'answers-empty') return true
  return issue.code === 'front-matter' && issue.message.startsWith('头信息缺少')
}

/** The place an unresolved name is used, as a short label. Empty when the issue says nothing about where. */
function refsOf(issue: Issue): string[] {
  if (issue.code === 'answer-unknown-name') return ['answers']
  if (issue.code === 'variant-unknown-name') {
    const label = VARIANT.exec(issue.message)?.[1]
    return [label ? `变式「${label}」` : '变式']
  }
  if (issue.block) return [issue.block]
  if (issue.line) return [`第 ${issue.line} 行`]
  return []
}

/** Whether the issue belongs in the structure summary (and so is not listed again on its own). */
export function isStructural(issue: Issue): boolean {
  if (issue.code === 'unused-name') return orphanName(issue) !== undefined
  if (isUnresolved(issue)) return true
  return isIncomplete(issue)
}

function orphanName(issue: Issue): string | undefined {
  return issue.name ?? ORPHAN_NAME.exec(issue.message)?.[2]
}

export function structureOf(result: { errors: Issue[]; warnings: Issue[] }): Structure {
  // Warnings too: whatever isStructural takes out of the per-issue list must show up here.
  const incomplete = [...result.errors, ...result.warnings].filter(isIncomplete)

  const byName = new Map<string, Unresolved>()
  for (const issue of result.errors) {
    if (!isUnresolved(issue)) continue
    const name = nameOf(issue)!
    let row = byName.get(name)
    if (!row) {
      row = { name, refs: [] }
      byName.set(name, row)
    }
    for (const ref of refsOf(issue)) if (!row.refs.includes(ref)) row.refs.push(ref)
    if (row.suggest === undefined) {
      const s = SUGGEST.exec(issue.message)?.[1]
      if (s) row.suggest = s
    }
  }

  const orphaned: Orphaned[] = []
  const seen = new Set<string>()
  for (const issue of [...result.warnings, ...result.errors]) {
    if (issue.code !== 'unused-name') continue
    const name = orphanName(issue)
    if (!name || seen.has(name)) continue
    seen.add(name)
    const kind = ORPHAN_KIND.exec(issue.message)?.[1] as Orphaned['kind'] | undefined
    orphaned.push(kind ? { name, kind } : { name })
  }

  return { incomplete, unresolved: [...byName.values()], orphaned }
}

/** `pointer` gives the doc to read for an unfinished item, printed after it in full-width parentheses. */
export function formatStructure(s: Structure, heading = '## 先补齐结构', pointer?: (issue: Issue) => string): string {
  const sections: string[] = []
  if (s.incomplete.length) {
    const doc = (i: Issue) => (pointer ? `（${pointer(i)}）` : '')
    const rows = s.incomplete.map((i) => (i.line ? `  - 第 ${i.line} 行：${i.message}${doc(i)}` : `  - ${i.message}${doc(i)}`))
    sections.push(['- 没写完：', ...rows].join('\n'))
  }
  if (s.unresolved.length) {
    const rows = s.unresolved.map((u) => {
      const name = `${u.name}${u.suggest ? `（是不是 ${u.suggest}？）` : ''}`
      return u.refs.length ? `  - ${name}：${u.refs.join('、')} 用到` : `  - ${name}`
    })
    sections.push(['- 引用了没定义（给每个名字补一条 <Param> 或 <Define>，或改成已声明的名字）：', ...rows].join('\n'))
  }
  if (s.orphaned.length) {
    const names = s.orphaned.map((o) => (o.kind ? `${o.kind} ${o.name}` : o.name))
    sections.push(`- 定义了没用（不需要就删掉）：${names.join('、')}`)
  }
  if (!sections.length) return ''
  return `${heading}\n\n${sections.join('\n')}`
}
