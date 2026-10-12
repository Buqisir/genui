// Old bank vs regenerated lessons: validate errors, layout issues, hand-drawn v.rect / v.path calls.
// usage: node plans/regen2-stats.mjs > plans/regen2-stats.md
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const genui = join(root, 'bin/genui')
const ids = readdirSync(join(root, 'generated-grok/bank')).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')).sort()

function oldFile(id) {
  const backup = join(root, 'plans/regen', id, 'old/lesson.md')
  return existsSync(backup) ? backup : join(root, 'generated-grok/bank', `${id}.md`)
}
function newFile(id) {
  for (const dir of ['plans/regen2', 'plans/regen']) {
    const f = join(root, dir, id, 'lesson.md')
    if (existsSync(f)) return f
  }
  return null
}
function json(args) {
  try {
    return JSON.parse(execFileSync(genui, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 180_000 }))
  } catch (e) {
    try {
      return JSON.parse(e.stdout)
    } catch {
      return null
    }
  }
}
function stats(file) {
  const src = readFileSync(file, 'utf8')
  const v = json(['validate', file, '--json'])
  const l = json(['layout', file, '--json'])
  return {
    errors: v ? v.errors.length : NaN,
    issues: l ? l.issues.length : NaN,
    rect: (src.match(/v\.rect\(/g) || []).length,
    path: (src.match(/v\.path\(/g) || []).length,
  }
}

const rows = []
for (const id of ids) {
  const nf = newFile(id)
  const o = stats(oldFile(id))
  const n = nf ? stats(nf) : null
  rows.push({ id, o, n })
  console.error(id, JSON.stringify(o), JSON.stringify(n))
}
// Answer key (problems/expected*.yaml): number of key items each version gets wrong or leaves out.
const pairs = rows.flatMap((r) => [{ id: r.id, file: oldFile(r.id) }, ...(r.n ? [{ id: r.id, file: newFile(r.id) }] : [])])
const keyOut = JSON.parse(
  execFileSync(join(root, 'app/node_modules/.bin/tsx'), [join(root, 'app/scripts/keycheck.ts')], { input: JSON.stringify(pairs), encoding: 'utf8', cwd: join(root, 'app') }),
)
const wrong = new Map(keyOut.map((k) => [k.file, k.checked ? k.missing.length : 0]))
for (const r of rows) {
  r.o.key = wrong.get(oldFile(r.id)) ?? 0
  if (r.n) r.n.key = wrong.get(newFile(r.id)) ?? 0
}
const sum = (pick) => rows.reduce((s, r) => s + (pick(r) || 0), 0)
const done = rows.filter((r) => r.n)
const lines = [
  '# 整库重新生成：新旧对比',
  '',
  `已生成 ${done.length} / ${rows.length} 道。下表只统计两版都有的题。`,
  '',
  '| 指标 | 旧版 | 新版 |',
  '|---|---|---|',
  `| 答案与标准答案不符（项） | ${sum((r) => r.n && r.o.key)} | ${sum((r) => r.n?.key)} |`,
  `| 校验错误 | ${sum((r) => r.n && r.o.errors)} | ${sum((r) => r.n?.errors)} |`,
  `| 排版问题 | ${sum((r) => r.n && r.o.issues)} | ${sum((r) => r.n?.issues)} |`,
  `| 有排版问题的课 | ${done.filter((r) => r.o.issues > 0).length} | ${done.filter((r) => r.n.issues > 0).length} |`,
  `| v.rect 调用 | ${sum((r) => r.n && r.o.rect)} | ${sum((r) => r.n?.rect)} |`,
  `| v.path 调用 | ${sum((r) => r.n && r.o.path)} | ${sum((r) => r.n?.path)} |`,
  `| 用了 v.rect/v.path 的课 | ${done.filter((r) => r.o.rect + r.o.path > 0).length} | ${done.filter((r) => r.n.rect + r.n.path > 0).length} |`,
  '',
  '| 题 | 答案错 旧→新 | 错误 旧→新 | 排版 旧→新 | rect 旧→新 | path 旧→新 |',
  '|---|---|---|---|---|---|',
  ...rows.map((r) => (r.n ? `| ${r.id} | ${r.o.key}→${r.n.key} | ${r.o.errors}→${r.n.errors} | ${r.o.issues}→${r.n.issues} | ${r.o.rect}→${r.n.rect} | ${r.o.path}→${r.n.path} |` : `| ${r.id} | ${r.o.key} | ${r.o.errors}→（未生成） | ${r.o.issues} | ${r.o.rect} | ${r.o.path} |`)),
  '',
]
console.log(lines.join('\n'))
