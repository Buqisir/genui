// Joins screen.jsonl (validate + layout) and shoot.jsonl (figures + console errors) into one ranked table.
// Usage: node plans/audit/summarize.mjs > plans/audit/summary.md
import { readFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const lines = (f) => readFileSync(join(here, f), 'utf8').split('\n').filter(Boolean)
const parse = (s) => {
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}
const idOf = (file) => (file.startsWith('generated-grok/bank/') ? `grok-bank-${basename(file, '.md')}` : basename(file, '.md'))

const rows = new Map()
for (const l of lines('screen.jsonl')) {
  const r = parse(l)
  if (!r) {
    const file = (l.match(/"file":"([^"]+)"/) || [])[1]
    if (file) rows.set(idOf(file), { id: idOf(file), broken: true })
    continue
  }
  const v = r.validate || {}
  const lay = r.layout || {}
  rows.set(idOf(r.file), {
    id: idOf(r.file),
    vErr: (v.errors || []).length,
    vWarn: (v.warnings || []).length,
    layIssues: (lay.issues || []).length,
    layHints: (lay.hints || []).length,
    issueText: [...(v.errors || []), ...(lay.issues || [])].map((x) => (typeof x === 'string' ? x : x.message || JSON.stringify(x))).slice(0, 4),
  })
}
for (const l of lines('shoot.jsonl')) {
  const r = parse(l)
  if (!r) continue
  const row = rows.get(r.id) || { id: r.id }
  row.figures = r.figures
  row.errors = r.errors
  rows.set(r.id, row)
}
const score = (r) => (r.broken ? 100 : 0) + (r.errors?.length || 0) * 10 + (r.vErr || 0) * 5 + (r.layIssues || 0) * 3 + (r.figures === -1 ? 50 : 0)
const sorted = [...rows.values()].sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id))
console.log('| 课件 | 场景数 | 控制台报错 | 校验错误 | 排版问题 | 排版提示 | 摘要 |')
console.log('|---|---|---|---|---|---|---|')
for (const r of sorted) {
  const note = [...(r.errors || []), ...(r.issueText || [])].join('；').replace(/\|/g, '/').slice(0, 220)
  console.log(`| ${r.id} | ${r.figures ?? '?'} | ${r.errors?.length ?? '?'} | ${r.broken ? '解析失败' : r.vErr} | ${r.layIssues ?? '?'} | ${r.layHints ?? '?'} | ${note} |`)
}
