// Lints eval problem files and their answer keys.
// Usage: npx tsx scripts/check-problems.ts [id-prefix]   e.g. `gd23` checks problems/gd23-*.md
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

const dir = join(dirname(fileURLToPath(import.meta.url)), '../../problems')
const prefix = process.argv[2] ?? 'gd'
const problems: string[] = []
const fail = (id: string, msg: string) => problems.push(`${id}: ${msg}`)

const key: Record<string, unknown[]> = {}
for (const f of readdirSync(dir).filter((f) => /^expected(-.+)?\.yaml$/.test(f))) {
  const part = YAML.parse(readFileSync(join(dir, f), 'utf8')) as Record<string, unknown[]> | null
  for (const [id, entries] of Object.entries(part ?? {})) {
    if (id in key) fail(id, `答案键在多个文件里重复（${f}）`)
    key[id] = entries
  }
}

const KINDS = ['single', 'multi', 'experiment', 'calc', 'fill']
const files = readdirSync(dir).filter((f) => f.startsWith(prefix) && f.endsWith('.md'))
for (const f of files) {
  const id = f.slice(0, -3)
  const m = readFileSync(join(dir, f), 'utf8').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!m) {
    fail(id, '没有头信息')
    continue
  }
  let meta: Record<string, unknown>
  try {
    meta = YAML.parse(m[1])
  } catch (e) {
    fail(id, `头信息不是合法 YAML：${(e as Error).message.split('\n')[0]}`)
    continue
  }
  const body = m[2]
  if (meta.id !== id) fail(id, `头信息 id 是 ${String(meta.id)}，和文件名不一致`)
  for (const k of ['title', 'source', 'kind', 'topic', 'pages', 'figures', 'reference']) {
    if (meta[k] === undefined || meta[k] === '') fail(id, `头信息缺少 ${k}`)
  }
  if (meta.kind !== undefined && !KINDS.includes(String(meta.kind))) fail(id, `kind 只能是 ${KINDS.join(' / ')}`)
  if (/【(答案|解析|详解)】/.test(body)) fail(id, '正文里混进了答案或解析')
  const marks = (body.match(/【图/g) ?? []).length
  const figures = Number(meta.figures)
  if (Number.isFinite(figures) && figures > 0 && marks === 0) fail(id, `figures: ${figures}，但正文里没有【图】描述`)
  if (figures === 0 && marks > 0) fail(id, `figures: 0，但正文里有 ${marks} 处【图】`)

  const entries = key[id]
  if (!Array.isArray(entries) || entries.length === 0) {
    fail(id, '没有答案键')
    continue
  }
  const choices: string[] = []
  for (const e of entries as Record<string, unknown>[]) {
    const kinds = ['any', 'choice', 'text'].filter((k) => e[k] !== undefined)
    if (typeof e.q !== 'string' || kinds.length !== 1) {
      fail(id, `答案键条目要有 q，且 any / choice / text 三选一：${JSON.stringify(e)}`)
      continue
    }
    if (e.any !== undefined && !(Array.isArray(e.any) && e.any.length > 0 && e.any.every((v) => typeof v === 'number' && Number.isFinite(v)))) {
      fail(id, `any 要是非空的数字列表：${JSON.stringify(e)}`)
    }
    if (e.choice !== undefined) {
      const c = String(e.choice)
      if (!/^[A-D]+$/.test(c) || [...c].sort().join('') !== c || new Set(c).size !== c.length) fail(id, `choice 要是按顺序、不重复的 A–D 字母：${c}`)
      choices.push(c)
    }
    if (e.text !== undefined && e.manual !== true) fail(id, `text 条目要写 manual: true：${JSON.stringify(e)}`)
  }
  if (meta.kind === 'single' && !(choices.length === 1 && choices[0].length === 1)) fail(id, '单选题要有一条单个字母的 choice')
  if (meta.kind === 'multi' && !(choices.length === 1 && choices[0].length >= 2)) fail(id, '多选题要有一条至少两个字母的 choice')
}

for (const id of Object.keys(key)) {
  if (id.startsWith(prefix) && !existsSync(join(dir, `${id}.md`))) fail(id, '有答案键但没有题目文件')
}

for (const p of problems) console.log(p)
console.log(`检查了 ${files.length} 个题目文件，问题 ${problems.length} 条`)
process.exit(problems.length ? 1 : 0)
