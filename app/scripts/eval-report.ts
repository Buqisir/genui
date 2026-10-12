// Summarises a generate.ts run directory: per-problem validator/answer outcome, attempts, time and cost,
// recurring validator errors, and which components / sandbox helpers the final lessons used.
// Usage: npx tsx scripts/eval-report.ts <out-dir> [--md <report.md>]
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'
import { checkAnswerKey } from './answerkey'
import { validateFile } from './validate'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2)
const mdAt = args.indexOf('--md')
const mdFile = mdAt >= 0 ? resolve(process.cwd(), args[mdAt + 1]) : undefined
const dirArg = args.find((a, i) => !a.startsWith('--') && (mdAt < 0 || i !== mdAt + 1)) ?? 'generated'
// Relative to the current directory when it exists there, otherwise to the project root.
const outDir = existsSync(resolve(process.cwd(), dirArg)) ? resolve(process.cwd(), dirArg) : resolve(root, dirArg)
const attemptsDir = join(outDir, '.attempts')
if (!existsSync(attemptsDir)) {
  console.error(`没有 ${attemptsDir}`)
  process.exit(2)
}

const front = (src: string): Record<string, unknown> => {
  const m = src.match(/^---\n([\s\S]*?)\n---/)
  try {
    return m ? (YAML.parse(m[1]) ?? {}) : {}
  } catch {
    return {}
  }
}

// Seconds and cost per attempt come from generate.log; the latest run for an id wins.
const timing = new Map<string, { secs: number; cost: number }>()
const logFile = join(outDir, 'generate.log')
if (existsSync(logFile)) {
  for (const line of readFileSync(logFile, 'utf8').split('\n')) {
    const m = line.match(/^\S+ (\S+) 第 (\d+) 次：\d+ 个错误，\d+ 个提醒（(\d+)s(?:，\$([\d.]+))?/)
    if (m) timing.set(`${m[1]}-${m[2]}`, { secs: Number(m[3]), cost: Number(m[4] ?? 0) })
  }
}

const byId = new Map<string, number[]>()
for (const f of readdirSync(attemptsDir)) {
  const m = f.match(/^(.+)-(\d+)\.md$/)
  if (m) byId.set(m[1], [...(byId.get(m[1]) ?? []), Number(m[2])].sort((a, b) => a - b))
}

// Names and numbers vary per lesson; strip them so the same kind of mistake groups together.
const normalise = (msg: string) =>
  msg
    .replace(/「[^」]*」/g, '「…」')
    .replace(/"[^"]*"/g, '"…"')
    .replace(/-?\d+(\.\d+)?(e-?\d+)?/g, 'N')
    .replace(/\b[a-zA-Z_][\w.]*\b/g, (w) => (/^[A-Z]/.test(w) ? w : 'x'))
    .slice(0, 90)

interface Row {
  id: string
  kind: string
  topic: string
  figures: number
  attempts: number
  valid: boolean
  keyOk: boolean | null
  firstValid: boolean
  firstKeyOk: boolean | null
  manual: string[]
  secs: number
  cost: number
  firstErrors: string[]
  components: string[]
}

const rows: Row[] = []
const errorKinds = new Map<string, { count: number; example: string; ids: Set<string> }>()
const compCount = new Map<string, number>()
const helperCount = new Map<string, number>()

for (const [id, ns] of [...byId].sort(([a], [b]) => a.localeCompare(b))) {
  const problemFile = join(root, 'problems', `${id}.md`)
  const meta = existsSync(problemFile) ? front(readFileSync(problemFile, 'utf8')) : {}
  let secs = 0
  let cost = 0
  const results = ns.map((n) => {
    const file = join(attemptsDir, `${id}-${n}.md`)
    const src = readFileSync(file, 'utf8')
    const v = validateFile(file)
    const key = checkAnswerKey(id, src)
    const t = timing.get(`${id}-${n}`)
    secs += t?.secs ?? 0
    cost += t?.cost ?? 0
    for (const e of v.errors) {
      const k = normalise(e.message)
      const entry = errorKinds.get(k) ?? { count: 0, example: e.message, ids: new Set<string>() }
      entry.count++
      entry.ids.add(id)
      errorKinds.set(k, entry)
    }
    return { src, v, key }
  })
  const first = results[0]
  const last = results[results.length - 1]
  const components = [...new Set([...last.src.matchAll(/^<([A-Z][A-Za-z]+)/gm)].map((m) => m[1]))]
  for (const c of components) compCount.set(c, (compCount.get(c) ?? 0) + 1)
  for (const h of new Set([...last.src.matchAll(/\bv\.([a-zA-Z]+)\s*\(/g)].map((m) => m[1]))) helperCount.set(h, (helperCount.get(h) ?? 0) + 1)
  rows.push({
    id,
    kind: String(meta.kind ?? ''),
    topic: String(meta.topic ?? meta.title ?? ''),
    figures: Number(meta.figures ?? 0),
    attempts: ns.length,
    valid: last.v.errors.length === 0,
    keyOk: last.key.checked ? last.key.missing.length === 0 : null,
    firstValid: first.v.errors.length === 0,
    firstKeyOk: first.key.checked ? first.key.missing.length === 0 : null,
    manual: last.key.manual,
    secs,
    cost,
    firstErrors: first.v.errors.map((e) => e.message),
    components,
  })
}

const mark = (b: boolean | null) => (b === null ? '—' : b ? '✓' : '✗')
const pct = (n: number, d: number) => (d ? `${n}/${d}（${Math.round((100 * n) / d)}%）` : '0/0')
const out: string[] = []
out.push(`# 评测汇总：${outDir.replace(root + '/', '')}`, '')
const keyed = rows.filter((r) => r.keyOk !== null)
out.push(
  `- 题数 ${rows.length}；最终校验通过 ${pct(rows.filter((r) => r.valid).length, rows.length)}；第一次就通过校验 ${pct(rows.filter((r) => r.firstValid).length, rows.length)}`,
  `- 有自动答案键的 ${keyed.length} 题：最终答案正确 ${pct(keyed.filter((r) => r.keyOk).length, keyed.length)}；第一次答案正确 ${pct(keyed.filter((r) => r.firstKeyOk).length, keyed.length)}`,
  `- 校验通过且答案正确 ${pct(rows.filter((r) => r.valid && r.keyOk !== false).length, rows.length)}（无答案键的算作待人工）`,
  `- 总用时 ${Math.round(rows.reduce((s, r) => s + r.secs, 0) / 60)} 分钟，总费用 $${rows.reduce((s, r) => s + r.cost, 0).toFixed(2)}`,
  '',
)
const kinds = [...new Set(rows.map((r) => r.kind))]
if (kinds.length > 1) {
  out.push('| 题型 | 题数 | 校验通过 | 答案正确（有键） |', '|---|---:|---:|---:|')
  for (const k of kinds) {
    const rs = rows.filter((r) => r.kind === k)
    const ks = rs.filter((r) => r.keyOk !== null)
    out.push(`| ${k || '（旧题）'} | ${rs.length} | ${pct(rs.filter((r) => r.valid).length, rs.length)} | ${pct(ks.filter((r) => r.keyOk).length, ks.length)} |`)
  }
  out.push('')
}
out.push('| 题目 | 题型 | 知识点 | 图 | 次数 | 校验 | 答案 | 首次校验 | 首次答案 | 用时 | 费用 | 首次错误 |', '|---|---|---|---:|---:|:-:|:-:|:-:|:-:|---:|---:|---|')
for (const r of rows) {
  const errs = r.firstErrors.slice(0, 2).map((e) => e.replace(/\|/g, '\\|').slice(0, 70)).join('；') + (r.firstErrors.length > 2 ? ` 等 ${r.firstErrors.length} 条` : '')
  out.push(
    `| ${r.id} | ${r.kind} | ${r.topic} | ${r.figures} | ${r.attempts} | ${mark(r.valid)} | ${mark(r.keyOk)}${r.manual.length ? ` +${r.manual.length}人工` : ''} | ${mark(r.firstValid)} | ${mark(r.firstKeyOk)} | ${Math.round(r.secs / 60)}m | $${r.cost.toFixed(2)} | ${errs} |`,
  )
}
out.push('', '## 反复出现的校验错误', '', '| 次数 | 题数 | 例子 |', '|---:|---:|---|')
for (const e of [...errorKinds.values()].sort((a, b) => b.count - a.count).slice(0, 20)) {
  out.push(`| ${e.count} | ${e.ids.size} | ${e.example.replace(/\|/g, '\\|').slice(0, 120)} |`)
}
const top = (m: Map<string, number>) => [...m].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join('，')
out.push('', '## 最终课件用到的组件（按题数）', '', top(compCount), '', '## Sim / Figure 里用到的 v 工具（按题数）', '', top(helperCount), '')

const text = out.join('\n')
if (mdFile) writeFileSync(mdFile, text)
console.log(text)
