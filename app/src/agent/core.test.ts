import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { validateLesson as validateStructure } from '../lesson/validate'
import { repoRoot } from '../docs/index'
import { DOC_POINTERS, getDoc, listDocs, pointerFor, searchDocs, validateLesson } from './core'

function mdFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => join(dir, name))
}

/** Template literals in the lesson tests, with ${...} blanked out. Partial lessons still produce real messages. */
function fixtureSources(): string[] {
  const dir = join(repoRoot, 'app/src')
  const files: string[] = []
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      const path = join(d, name)
      if (name === 'node_modules' || name === 'agent') continue
      if (name.endsWith('.test.ts')) files.push(path)
      else if (!name.includes('.')) {
        try {
          walk(path)
        } catch {
          // not a directory
        }
      }
    }
  }
  walk(dir)
  const out: string[] = []
  for (const file of files) {
    const text = readFileSync(file, 'utf8')
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== '`' || text[i - 1] === '\\') continue
      let j = i + 1
      let depth = 0
      let buf = ''
      let closed = false
      while (j < text.length) {
        const c = text[j]
        if (depth === 0 && c === '\\') {
          buf += text[j + 1] ?? ''
          j += 2
          continue
        }
        if (depth === 0 && c === '`') {
          closed = true
          break
        }
        if (c === '$' && text[j + 1] === '{') {
          depth++
          buf += '0'
          j += 2
          continue
        }
        if (depth > 0 && c === '{') depth++
        else if (depth > 0 && c === '}') depth--
        else if (depth === 0) buf += c
        j++
      }
      if (!closed) break
      i = j
      if (buf.includes('<') && buf.length > 40 && !buf.includes('while (true)') && !buf.includes('while(true)')) out.push(buf)
    }
  }
  return out
}

describe('docs core', () => {
  const docs = listDocs()
  const ids = new Set(docs.map((d) => d.id))

  it('serves the L0 entry, which loadDocs does not', () => {
    const index = getDoc('index')
    expect('error' in index).toBe(false)
    if ('error' in index) return
    expect(index.layer).toBe('L0')
    expect(index.title).toBe('课件系统入口')
    expect(index.text).toContain('选型路由表')
    expect(docs.some((d) => d.id === 'index' && d.layer === 'L0' && d.bytes === Buffer.byteLength(index.text))).toBe(true)
  })

  it('lists every card and ref', () => {
    expect(ids.has('motion')).toBe(true)
    expect(ids.has('motion-forces')).toBe(true)
    expect(ids.has('sim-api')).toBe(true)
    expect(docs.length).toBeGreaterThanOrEqual(47)
  })

  it('names the closest ids when a doc is missing', () => {
    const missing = getDoc('motion-force')
    expect('error' in missing).toBe(true)
    if (!('error' in missing)) return
    expect(missing.error).toContain('没有这份文档')
    expect(missing.error).toContain('motion-forces')
  })

  it('ranks Chinese phrases and code identifiers', () => {
    const first = (q: string) => {
      const hits = searchDocs(q, 5)
      return { id: hits[0]?.id, ids: hits.map((h) => h.id).join(' > '), snippet: hits[0]?.snippet ?? '' }
    }
    const spdt = first('单刀双掷')
    expect(spdt.id, spdt.ids).toBe('circuit')
    expect(spdt.snippet).toContain('单刀双掷')
    const field = first('v.efield')
    expect(field.id, field.ids).toBe('sim-fields')
    expect(field.snippet.toLowerCase()).toContain('v.efield')
    const areas = first('areas')
    expect(areas.id, areas.ids).toBe('plot')
    const friction = first('摩擦')
    expect(friction.id, friction.ids).toBe('motion-forces')
    expect(friction.snippet).toContain('摩擦')
  })
})

describe('doc pointers', () => {
  const ids = new Set(listDocs().map((d) => d.id))

  it('only points at docs that exist', () => {
    for (const rule of DOC_POINTERS) expect(ids.has(rule.doc), rule.doc).toBe(true)
  })

  it('sends the known failures to the doc that explains the fix', () => {
    const gEff = [
      '---',
      'title: t',
      'demo: true',
      '---',
      '',
      '<Define name="gEff" expr="8" />',
      '',
      '<Motion name="blk" until={1} aFrame={2} mass={1} state={{x: 0, y: 0, vx: 0, vy: 0}} forces={[{label: "G", angle: 270, magnitude: 10}]} />',
      '',
    ].join('\n')
    const hud = [
      '---',
      'title: t',
      'demo: true',
      '---',
      '',
      '<Sim title="s" duration={1} hud={[{label: "v", expr: "1", color: "velocity"}]}>',
      'sim({ at(t) { return { t } }, draw() {} })',
      '</Sim>',
      '',
    ].join('\n')
    const areas = [
      '---',
      'title: t',
      'demo: true',
      '---',
      '',
      '<Plot x={{name: "t", min: 0, max: 1}} series={[{label: "s", expr: "1"}]} areas={[{from: 0, until: 1, label: "A"}]} />',
      '',
    ].join('\n')
    const locate = [
      '---',
      'title: t',
      'demo: true',
      '---',
      '',
      '<Sim title="s" duration={1}>',
      'sim({ at(t) { return { x: locate(t) } }, draw() {} })',
      '</Sim>',
      '',
    ].join('\n')

    const messages = (src: string) => validateLesson(src).errors.map((e) => e.message)
    const docOf = (src: string, pattern: RegExp) => {
      const hit = validateLesson(src).errors.find((e) => pattern.test(e.message))
      expect(hit, messages(src).join('\n')).toBeTruthy()
      return hit!.doc
    }

    // gEff is a name the Motion component publishes; the motion card shows this exact collision.
    expect(docOf(gEff, /gEff 是组件算出的/)).toBe('motion')
    // hud.color is a Sim prop mistake, documented on the sim card, not a sandbox failure.
    expect(docOf(hud, /hud\[0\].*color/)).toBe('sim')
    // areas[].series is a Plot prop; the plot card gives the fix.
    expect(docOf(areas, /areas\[0\]\.series/)).toBe('plot')
    // locate is not a sandbox function. sim-api is the list of what draw/at can call instead.
    expect(docOf(locate, /locate is not defined/)).toBe('sim-api')

    expect(pointerFor('<Sim> 课件代码执行出错：v.efield is not a function').doc).toBe('sim-fields')
    expect(pointerFor('<Sim> 初始状态：v.track is not a function').doc).toBe('sim-apparatus')
    expect(pointerFor('<Motion> track.pieces[0] 要恰好写 line 或 arc 一个').doc).toBe('motion-track')
    expect(pointerFor('<Motion> circuit 需要电源写上 emf，或用电流源 currentSource').doc).toBe('motion-circuit')
    expect(pointerFor('<Circuit> 暂态在初始参数下无法计算：时间常数太小').doc).toBe('circuit-transient')
    expect(pointerFor('课件没有画出物理情景：至少要有一个 Sim').doc).toBe('rules')
    expect(pointerFor('<Foo> 不是白名单组件（可用：Param）').doc).toBe('index')
    expect(pointerFor('头信息缺少 question').doc).toBe('structure')
    expect(pointerFor('第 3 行：名字 g 重复声明').doc).toBe('params')
    expect(pointerFor('答案不一致：x 按课件公式算出 1，answers 写的是 2').doc).toBe('answer')
  })

  it('points every message from the lesson corpus and test fixtures at a real doc', () => {
    const seen = new Map<string, { doc: string; via: string }>()
    const take = (message: string) => {
      if (seen.has(message)) return
      const hit = pointerFor(message)
      seen.set(message, hit)
    }
    const files = [
      ...mdFiles(join(repoRoot, 'lessons')),
      ...mdFiles(join(repoRoot, 'generated-grok/zj-final')),
      ...mdFiles(join(repoRoot, 'generated-grok/bank')),
    ]
    for (const file of files) {
      const report = validateLesson(readFileSync(file, 'utf8'))
      for (const issue of [...report.errors, ...report.warnings]) take(issue.message)
    }
    for (const src of fixtureSources()) {
      const report = validateStructure(src)
      for (const issue of [...report.errors, ...report.warnings]) take(issue.message)
    }
    const defaults: string[] = []
    const byDoc = new Map<string, number>()
    let l0 = 0
    let l1 = 0
    let l2 = 0
    for (const [message, hit] of seen) {
      const doc = listDocs().find((d) => d.id === hit.doc)
      expect(doc, message).toBeTruthy()
      byDoc.set(hit.doc, (byDoc.get(hit.doc) ?? 0) + 1)
      if (hit.via === 'fallback') defaults.push(message)
      if (doc?.layer === 'L0') l0++
      else if (doc?.layer === 'L1') l1++
      else l2++
    }
    const hist = [...byDoc.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([id, n]) => `${id} ${n}`).join('，')
    console.log(
      `指针覆盖：${seen.size} 条不同消息，L0 ${l0}，L1 ${l1}，L2 ${l2}，兜底 ${defaults.length}\n${hist}` +
        (defaults.length ? `\n兜底样例：\n${defaults.slice(0, 12).join('\n')}` : ''),
    )
    expect(seen.size).toBeGreaterThan(0)
  }, 240_000)
})
