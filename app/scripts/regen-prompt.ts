// Writes the same first prompt generate.ts gives a grok agent, for a subagent to run in plans/regen/<id>/.
// usage: npx tsx scripts/regen-prompt.ts <outRoot> <id>...
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import YAML from 'yaml'
import { outputRequirements, type LessonProblem } from '../src/agent/prompt'

const root = resolve(import.meta.dirname, '../..')
const [outRoot, ...ids] = process.argv.slice(2)
const genui = join(root, 'bin/genui')
const skill = readFileSync(join(root, 'skills/genui/SKILL.md'), 'utf8').replace(/^---\n[\s\S]*?\n---\n*/, '').trim()

for (const id of ids) {
  const raw = readFileSync(join(root, 'problems', `${id}.md`), 'utf8')
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!m) throw new Error(`problems/${id}.md 缺少头信息`)
  const meta = YAML.parse(m[1]) as { id: string; title: string; source: string }
  const p: LessonProblem = { id: meta.id, title: meta.title, source: meta.source, text: m[2].trim() }
  const dir = resolve(outRoot, id)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'prompt.md'), `${skill}

${outputRequirements(p, true)}

把课件写到 ${dir}/lesson.md（第一行就是 \`---\`，不要用代码围栏包住整个文件）。写完运行：

${genui} validate ${dir}/lesson.md

每条错误末尾写着该读的文档。用 \`${genui} docs <id>\` 读完再改，直到校验没有错误。然后运行：

${genui} layout ${dir}/lesson.md

按报告改掉压线和出界。不要联网，不要启动子代理。

## 题目（${p.title}，${p.source}）

${p.text}
`)
  console.log(join(dir, 'prompt.md'))
}
