// Side-by-side: answers in each generated lesson vs the reference answer kept in problems/.
// Usage: npx tsx scripts/compare.ts [dir]   (dir relative to the repo root, default generated; the r5/r6 run is in archive/generated)
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'
import { checkAnswerKey } from './answerkey'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const genDir = join(root, process.argv[2] ?? 'generated')
const front = (file: string) => {
  const m = readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/)
  return m ? (YAML.parse(m[1]) as Record<string, unknown>) : {}
}

for (const f of readdirSync(join(root, 'problems')).filter((f) => f.endsWith('.md')).sort()) {
  const id = f.replace(/\.md$/, '')
  const ref = String(front(join(root, 'problems', f)).reference ?? '').trim()
  const gen = join(genDir, f)
  console.log(`\n## ${id}\n参考：${ref}`)
  if (!existsSync(gen)) {
    console.log('生成：（无）')
    continue
  }
  const answers = (front(gen).answers ?? []) as { name: string; value: number; unit?: string }[]
  const key = checkAnswerKey(id, readFileSync(gen, 'utf8'))
  console.log(`核对：${!key.checked ? '（无标准数值，人工看）' : key.missing.length ? '✗ ' + key.missing.join('；') : '✓'}`)
  console.log('生成：' + answers.map((a) => `${a.name}=${+Number(a.value).toPrecision(5)}${a.unit && a.unit !== '1' ? ' ' + a.unit : ''}`).join('，'))
}
