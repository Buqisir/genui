// Shared core for the CLI, the function-calling tools, and (later) single-shot prompts.
// Docs are read by id; every validator issue points at the doc that explains how to fix it.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { docsRoot, loadDocs, type Doc } from '../docs/index'
import { validateSource } from '../../scripts/validate'
import type { Issue } from '../lesson/validate'

export type Layer = 'L0' | 'L1' | 'L2'

export interface DocText {
  id: string
  layer: Layer
  title: string
  text: string
}

export interface DocError {
  error: string
}

export interface DocListItem {
  id: string
  layer: Layer
  title: string
  bytes: number
}

export interface SearchHit {
  id: string
  layer: Layer
  title: string
  snippet: string
}

export interface PointedIssue {
  line?: number
  message: string
  doc: string
  /** Block key the line belongs to, e.g. `Define:R1`. */
  block?: string
  /** Correct one-line signature, for prop errors. */
  hint?: string
}

export interface ValidationReport {
  ok: boolean
  errors: PointedIssue[]
  warnings: PointedIssue[]
}

/** How a message was pointed at a doc. `fallback` is the entry page, used only when nothing else matched. */
export interface Pointer {
  doc: string
  via: 'refine' | 'tool' | 'card' | 'alias' | 'bare' | 'fallback'
}

interface AgentDoc {
  id: string
  layer: Layer
  title: string
  text: string
  bytes: number
  component?: string
  headings: string[]
  body: string
  lines: string[]
}

/**
 * One row of the doc-pointer table. First match wins.
 * Keyword rows are checked against the message with hint parentheses removed,
 * so a suggestion like "或者写 mass + forces" does not steal a generic error.
 * ASCII keywords match as whole identifiers (`solve` does not match `solver`).
 */
export interface PointerRule {
  doc: string
  /** Only messages whose `<Component>` prefix is this. */
  component?: string
  /** Only messages with no `<Component>` prefix. */
  bare?: boolean
  /** At least one keyword must appear. */
  any?: string[]
  /** Every keyword must appear. */
  all?: string[]
  /** Resolve the doc by the `v.name` call the message mentions. */
  tool?: boolean
}

const SANDBOX_SYMPTOMS = [
  'is not defined',
  'is not a function',
  '课件代码执行出错',
  '运行超时',
  '初始化：',
  '沙箱禁止',
  '空状态',
  '非有限数',
  'Failed to execute',
  'setLineDash',
]

export const DOC_POINTERS: PointerRule[] = [
  // L2 refinements. More specific props win over the component card.
  { doc: 'motion-circuit', component: 'Motion', any: ['circuit', '电路'] },
  { doc: 'motion-track', component: 'Motion', any: ['track', '沿轨道'] },
  { doc: 'motion-axis', component: 'Motion', any: ['axis', 'torques', 'torque', '转轴'] },
  { doc: 'motion-fields', component: 'Motion', any: ['fields', 'charge', '磁场', '电场'] },
  { doc: 'motion-forces', component: 'Motion', any: ['friction', 'bodies', 'solve', '摩擦', 'ropes', 'forces'] },
  { doc: 'circuit-transient', component: 'Circuit', any: ['transient', '暂态'] },
  { doc: 'circuit-ladder', component: 'Circuit', any: ['ladder'] },
  { doc: 'circuit-motion', component: 'Circuit', any: ['必须指向本课件里带 circuit'] },
  { doc: 'force-solve', component: 'ForceDiagram', any: ['ΣF', '无法满足', 'solve'] },

  // Sandbox code: a documented `v.name(` wins; other runtime failures go to the API reference.
  { doc: 'sim', component: 'Sim', any: ['代码读取了 p.'] },
  { doc: 'figure', component: 'Figure', any: ['代码读取了 p.'] },
  { doc: 'sim-api', component: 'Sim', tool: true },
  { doc: 'sim-api', component: 'Figure', tool: true },
  { doc: 'sim-api', component: 'Sim', any: SANDBOX_SYMPTOMS },
  { doc: 'sim-api', component: 'Figure', any: SANDBOX_SYMPTOMS },

  // Define has no card of its own; its text lives on the params card.
  { doc: 'params', component: 'Define' },

  // Messages that are not about one component.
  { doc: 'index', bare: true, any: ['不是白名单组件'] },
  { doc: 'rules', bare: true, any: ['没有画出物理情景'] },
  { doc: 'answer', bare: true, any: ['答案不一致', 'answers 里的'] },
  {
    doc: 'structure',
    bare: true,
    any: [
      '头信息',
      'answers 为空',
      'answers 条目',
      '组件标签没有闭合',
      '标签后面不能有其他内容',
      '缺少 </',
      '无法识别的属性写法',
      '属性值不是合法的 JSON5',
      '属性值要用',
    ],
  },
  { doc: 'instrument', bare: true, any: ['多用电表', '弹簧测力计'] },
  {
    doc: 'params',
    bare: true,
    any: ['重复声明', '未声明的名字', '表达式', '不合法', '循环引用', '缺少 expr', '求值失败', 'NaN', 'Infinity'],
  },
]

const FALLBACK_DOC = 'index'

let cached: AgentDoc[] | null = null
let tools: Map<string, string> | null = null

function stripFront(text: string): string {
  if (!text.startsWith('---\n')) return text
  const end = text.indexOf('\n---\n', 4)
  return end < 0 ? text : text.slice(end + 5)
}

function headingsOf(text: string): string[] {
  return text
    .split('\n')
    .filter((line) => /^#{1,6}\s+\S/.test(line))
    .map((line) => line.replace(/^#{1,6}\s+/, '').trim())
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
}

function loadIndex(): AgentDoc {
  const text = readFileSync(join(docsRoot, 'index.md'), 'utf8')
  let title = '课件系统入口'
  if (text.startsWith('---\n')) {
    const end = text.indexOf('\n---\n', 4)
    if (end > 0) {
      try {
        const data = asRecord(parse(text.slice(4, end)))
        if (data && typeof data.title === 'string' && data.title.trim()) title = data.title.trim()
      } catch {
        // Keep the fallback title; the file is still served.
      }
    }
  }
  const body = stripFront(text)
  return {
    id: 'index',
    layer: 'L0',
    title,
    text,
    bytes: Buffer.byteLength(text, 'utf8'),
    headings: headingsOf(body),
    body,
    lines: body.split('\n'),
  }
}

function fromDoc(doc: Doc): AgentDoc {
  const body = stripFront(doc.text)
  return {
    id: doc.id,
    layer: doc.layer,
    title: doc.title,
    text: doc.text,
    bytes: doc.bytes,
    component: doc.component,
    headings: headingsOf(body),
    body,
    lines: body.split('\n'),
  }
}

function allDocs(): AgentDoc[] {
  if (cached) return cached
  const docs = [loadIndex(), ...loadDocs().map(fromDoc)]
  docs.sort((a, b) => layerOrder(a.layer) - layerOrder(b.layer) || a.id.localeCompare(b.id))
  cached = docs
  return docs
}

function layerOrder(layer: Layer): number {
  return layer === 'L0' ? 0 : layer === 'L1' ? 1 : 2
}

/** L2 ref that documents `v.name(`, preferring the sim-* catalogues. */
function toolDocs(): Map<string, string> {
  if (tools) return tools
  const hits = new Map<string, { id: string; count: number }[]>()
  for (const doc of allDocs()) {
    if (doc.layer !== 'L2') continue
    const re = /`v\.([A-Za-z][A-Za-z0-9]*)\(/g
    for (const m of doc.text.matchAll(re)) {
      const list = hits.get(m[1]) ?? []
      const row = list.find((r) => r.id === doc.id)
      if (row) row.count += 1
      else list.push({ id: doc.id, count: 1 })
      hits.set(m[1], list)
    }
  }
  const chosen = new Map<string, string>()
  for (const [name, list] of hits) {
    const sim = list.filter((r) => r.id.startsWith('sim-'))
    const pool = sim.length ? sim : list
    pool.sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))
    chosen.set(name, pool[0].id)
  }
  tools = chosen
  return tools
}

function cardFor(component: string): string | undefined {
  return allDocs().find((d) => d.component === component)?.id
}

export function listDocs(): DocListItem[] {
  return allDocs().map(({ id, layer, title, bytes }) => ({ id, layer, title, bytes }))
}

export function docTitle(id: string): string {
  return allDocs().find((d) => d.id === id)?.title ?? id
}

function closestIds(want: string): string[] {
  const w = want.toLowerCase()
  const scored = allDocs().map((d) => {
    const s = d.id.toLowerCase()
    let score = 0
    let i = 0
    while (i < s.length && i < w.length && s[i] === w[i]) i++
    score += i * 4
    if (s.includes(w) || w.includes(s)) score += 30
    score += Math.round(gramCoverage(w, s) * 40)
    score -= editDistance(s, w) * 3
    return { id: d.id, score }
  })
  scored.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
  return scored.filter((s) => s.score > 8).slice(0, 5).map((s) => s.id)
}

export function getDoc(id: string): DocText | DocError {
  const want = id.trim()
  const found = allDocs().find((d) => d.id === want) ?? allDocs().find((d) => d.id === want.toLowerCase())
  if (found) return { id: found.id, layer: found.layer, title: found.title, text: found.text }
  const near = closestIds(want)
  const tail = near.length ? `相近的有：${near.join('、')}。` : ''
  return { error: `没有这份文档：${want}。${tail}`.trim() }
}

export function searchDocs(query: string, limit = 8): SearchHit[] {
  const q = query.trim()
  if (!q || limit < 1) return []
  const ranked = allDocs()
    .map((doc) => ({ doc, score: scoreDoc(doc, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.doc.id.localeCompare(b.doc.id))
    .slice(0, limit)
  return ranked.map(({ doc }) => ({
    id: doc.id,
    layer: doc.layer,
    title: doc.title,
    snippet: snippetFor(doc, q),
  }))
}

function scoreDoc(doc: AgentDoc, query: string): number {
  const parts = query.split(/\s+/).filter(Boolean)
  if (parts.length > 1) {
    const full = scoreOne(doc, query)
    return parts.reduce((sum, part) => sum + scoreOne(doc, part), full)
  }
  return scoreOne(doc, query)
}

function scoreOne(doc: AgentDoc, query: string): number {
  const qf = query.toLowerCase()
  let score = 0
  const id = doc.id.toLowerCase()
  if (id === qf) score += 5000
  else if (id.includes(qf) || qf.includes(id)) score += 350

  const title = doc.title.toLowerCase()
  if (title.includes(qf)) score += 2000
  else score += Math.round(gramCoverage(qf, title) * 400)

  for (const heading of doc.headings) {
    const h = heading.toLowerCase()
    if (h.includes(qf)) score += 900
    else score += Math.round(gramCoverage(qf, h) * 200)
  }

  const body = doc.body.toLowerCase()
  const hits = countOf(body, qf)
  if (hits) score += 280 + 50 * Math.min(hits, 8)
  if (body.includes(`${qf}(`) || body.includes(`\`${qf}(`)) score += 900
  if (hasToken(doc.title, query) || hasToken(doc.body, query)) score += 180
  if (doc.lines.some((line) => isDefinitionLine(line, qf))) score += 450
  score += Math.round(gramCoverage(qf, body) * 220)
  return score
}

function isDefinitionLine(line: string, qf: string): boolean {
  const f = line.toLowerCase()
  if (!f.includes(qf)) return false
  return /^\s*[-|]/.test(line) || f.includes(`${qf}(`) || f.includes(`\`${qf}`)
}

function snippetFor(doc: AgentDoc, query: string): string {
  const qf = query.toLowerCase()
  const lines = doc.lines
  let best = -1
  let bestScore = 0
  for (let i = 0; i < lines.length; i++) {
    const s = lineScore(lines[i], qf)
    if (s > bestScore) {
      best = i
      bestScore = s
    }
  }
  if (best < 0) {
    if (doc.title.toLowerCase().includes(qf)) return doc.title
    return clip(doc.body.split('\n').find((l) => l.trim()) ?? doc.title, qf)
  }
  const picked = [lines[best]]
  const next = lines[best + 1]
  if (next && lineScore(next, qf) > 0 && !lines[best].toLowerCase().includes(qf)) picked.push(next)
  return picked.map((line) => clip(line.trim(), qf)).filter(Boolean).join('\n')
}

function lineScore(line: string, qf: string): number {
  const f = line.toLowerCase()
  const cover = gramCoverage(qf, f)
  if (!f.includes(qf) && cover < 0.5) return 0
  let score = f.includes(qf) ? 100 : 0
  if (hasToken(line, qf)) score += 40
  if (f.includes(`${qf}(`)) score += 80
  if (/^\s*[-|#]/.test(line)) score += 20
  score += Math.round(cover * 30)
  return score
}

function clip(line: string, qf: string): string {
  const f = line.toLowerCase()
  const at = f.indexOf(qf)
  const max = 180
  if (line.length <= max) return line
  if (at < 0) return line.slice(0, max - 1).trimEnd() + '…'
  const start = Math.max(0, at - 40)
  const end = Math.min(line.length, at + qf.length + 120)
  let out = line.slice(start, end).trim()
  if (start > 0) out = '…' + out
  if (end < line.length) out += '…'
  return out
}

function countOf(text: string, needle: string): number {
  if (!needle) return 0
  let n = 0
  let i = 0
  while (n < 12) {
    const at = text.indexOf(needle, i)
    if (at < 0) break
    n++
    i = at + needle.length
  }
  return n
}

function hasToken(text: string, query: string): boolean {
  const q = query.toLowerCase()
  const f = text.toLowerCase()
  let i = 0
  while (i <= f.length) {
    const at = f.indexOf(q, i)
    if (at < 0) return false
    const before = at === 0 ? '' : f[at - 1]
    const after = f[at + q.length] ?? ''
    if (!isIdent(before) && !isIdent(after)) return true
    i = at + q.length
  }
  return false
}

function isIdent(ch: string): boolean {
  return /[a-z0-9_]/i.test(ch)
}

function gramCoverage(query: string, text: string): number {
  if (!query || !text) return 0
  if (text.includes(query)) return 1
  const chars = [...query]
  const n = chars.length >= 3 ? 3 : 2
  const qg = ngrams(query, n)
  if (!qg.length) return 0
  const set = new Set(ngrams(text, n))
  let hit = 0
  for (const g of qg) if (set.has(g)) hit++
  return hit / qg.length
}

function ngrams(s: string, n: number): string[] {
  const chars = [...s]
  if (!chars.length) return []
  if (chars.length <= n) return [chars.join('')]
  const out: string[] = []
  for (let i = 0; i <= chars.length - n; i++) out.push(chars.slice(i, i + n).join(''))
  return out
}

function editDistance(a: string, b: string): number {
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cur = dp[j]
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost)
      prev = cur
    }
  }
  return dp[b.length]
}

const COMPONENT_PREFIX = /^<([A-Za-z][A-Za-z0-9]*)>\s*/

function signalOf(message: string): string {
  let s = message
  for (let i = 0; i < 4; i++) {
    const next = s.replace(/（[^）]*）/g, '')
    if (next === s) break
    s = next
  }
  return s
}

function hasKeyword(text: string, kw: string): boolean {
  if ([...kw].some((ch) => ch.charCodeAt(0) > 127) || /\s/.test(kw)) return text.includes(kw)
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?:^|[^A-Za-z0-9_])${escaped}(?:$|[^A-Za-z0-9_])`).test(text)
}

function keywordsMatch(rule: PointerRule, text: string): boolean {
  if (rule.any && !rule.any.some((kw) => hasKeyword(text, kw))) return false
  if (rule.all && !rule.all.every((kw) => hasKeyword(text, kw))) return false
  return true
}

function firstTool(message: string): string | undefined {
  const index = toolDocs()
  for (const m of message.matchAll(/v\.([A-Za-z][A-Za-z0-9]*)/g)) {
    const id = index.get(m[1])
    if (id) return id
  }
  return undefined
}

export function pointerFor(message: string): Pointer {
  const prefixed = COMPONENT_PREFIX.exec(message)
  const component = prefixed?.[1]
  const text = signalOf(message)

  for (const rule of DOC_POINTERS) {
    if (rule.bare) continue
    if (rule.component && rule.component !== component) continue
    if (!rule.component) continue
    if (rule.tool) {
      const id = firstTool(message)
      if (id) return { doc: id, via: 'tool' }
      continue
    }
    if (!rule.any && !rule.all) return { doc: rule.doc, via: 'alias' }
    if (keywordsMatch(rule, text)) return { doc: rule.doc, via: 'refine' }
  }

  if (component) {
    const card = cardFor(component)
    if (card) return { doc: card, via: 'card' }
  } else {
    for (const rule of DOC_POINTERS) {
      if (!rule.bare || rule.tool) continue
      if (keywordsMatch(rule, text)) return { doc: rule.doc, via: 'bare' }
    }
  }
  return { doc: FALLBACK_DOC, via: 'fallback' }
}

function point(issue: Issue): PointedIssue {
  const pointed: PointedIssue = { message: issue.message, doc: pointerFor(issue.message).doc }
  if (issue.line !== undefined) pointed.line = issue.line
  if (issue.block !== undefined) pointed.block = issue.block
  if (issue.hint !== undefined) pointed.hint = issue.hint
  return pointed
}

/** Structural checks plus the Sim/Figure smoke run. `ok` ignores warnings. */
export function validateLesson(source: string): ValidationReport {
  const result = validateSource(source)
  const errors = result.errors.map(point)
  const warnings = result.warnings.map(point)
  return { ok: errors.length === 0, errors, warnings }
}

export function formatIssue(kind: '错误' | '提醒', issue: PointedIssue): string {
  const at = issue.line ? ` 第 ${issue.line} 行${issue.block ? `（${issue.block}）` : ''}` : ''
  const head = `  ${kind}${at}：${issue.message}（读 genui docs ${issue.doc}）`
  return issue.hint ? `${head}\n    ${issue.hint}` : head
}

export function formatValidation(label: string, result: { errors: PointedIssue[]; warnings: PointedIssue[] }): string {
  const mark = result.errors.length ? '✗' : '✓'
  const lines = [`${mark} ${label}  (${result.errors.length} 个错误，${result.warnings.length} 个提醒)`]
  for (const e of result.errors) lines.push(formatIssue('错误', e))
  for (const w of result.warnings) lines.push(formatIssue('提醒', w))
  return lines.join('\n')
}
