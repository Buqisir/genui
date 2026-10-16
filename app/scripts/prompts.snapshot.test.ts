// Snapshot test for the prompts sent to the model. The snapshots are plain text under
// scripts/fixtures/prompts/, so a changed prompt shows up as a readable diff in review.
// After an intended change, run `npm run prompts:update` (sets UPDATE_PROMPTS=1) and check the diff.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { firstPrompt, readProblem } from './genprompt'
import { buildSinglePrompt, type LessonProblem } from '../src/agent/prompt'

const here = dirname(fileURLToPath(import.meta.url))
const fixtureDir = join(here, 'fixtures', 'prompts')
const UPDATE = process.env.UPDATE_PROMPTS === '1'

const problemId = 'zj-23'
const cardIds = ['circuit', 'instrument']

function problem(): LessonProblem {
  return readProblem(problemId)
}

const cases: { name: string; file: string; generate: () => string }[] = [
  {
    name: '完整模式',
    file: 'full.txt',
    generate: () => firstPrompt(readProblem(problemId)),
  },
  {
    name: '单轮模式',
    file: 'single.txt',
    generate: () => buildSinglePrompt(problem(), cardIds).text,
  },
  {
    name: '精简模式',
    file: 'compact.txt',
    generate: () => buildSinglePrompt(problem(), cardIds, { signatures: true }).text,
  },
]

/** Failure message: first differing line (1-based) with two lines of old and new context on each side. */
function describeDiff(file: string, expected: string, actual: string): string {
  const oldLines = expected.split('\n')
  const newLines = actual.split('\n')
  const max = Math.max(oldLines.length, newLines.length)
  let at = 0
  while (at < max && oldLines[at] === newLines[at]) at++
  const from = Math.max(0, at - 2)
  const to = Math.min(max, at + 3)
  const show = (lines: string[], label: string) => {
    const rows: string[] = []
    for (let i = from; i < to; i++) {
      const mark = i === at ? '>' : ' '
      const text = i < lines.length ? lines[i] : '<文件结束>'
      rows.push(`${mark} ${String(i + 1).padStart(5)} | ${text}`)
    }
    return `${label}\n${rows.join('\n')}`
  }
  return [
    `提示词快照 ${file} 与当前生成结果不同，第一处不同在第 ${at + 1} 行（标 > 的行）。`,
    show(oldLines, '快照（旧）：'),
    show(newLines, '当前生成（新）：'),
    '如果这是有意的改动，运行 `cd app && npm run prompts:update` 更新快照，并检查 diff 里的变化。',
  ].join('\n')
}

describe('prompt snapshots', () => {
  for (const c of cases) {
    it(`${c.name} (${c.file}) matches its snapshot`, () => {
      const actual = c.generate()
      const path = join(fixtureDir, c.file)
      if (UPDATE) {
        mkdirSync(fixtureDir, { recursive: true })
        writeFileSync(path, actual, 'utf8')
        return
      }
      if (!existsSync(path)) {
        throw new Error(`缺少快照 ${c.file}。运行 \`cd app && npm run prompts:update\` 生成。`)
      }
      const expected = readFileSync(path, 'utf8')
      if (expected !== actual) throw new Error(describeDiff(c.file, expected, actual))
    })
  }

  it('same input generates the same prompt twice', () => {
    for (const c of cases) {
      expect(c.generate(), c.file).toBe(c.generate())
    }
  })
})
