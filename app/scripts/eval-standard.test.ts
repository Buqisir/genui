import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { answerKey } from './answerkey'
import {
  generateCommand,
  loadStandard,
  parsePromptBytes,
  parseRunArgs,
  renderTotals,
  reportRun,
  runDirName,
  runLabel,
  summarizeMode,
  UsageError,
  type Standard,
} from './eval-standard'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const lesson = (name: string) => readFileSync(join(root, 'generated-grok', name), 'utf8')
const base: Record<string, string> = {
  'gd23-06': lesson('bank2/gd23-06.md'),
  'gd23-08': lesson('bank2/gd23-08.md'),
  'gd24-13': lesson('bank2/gd24-13.md'),
  'sd25-14': lesson('sd25/sd25-14.md'),
}
// Variants that break one thing each. Each yields a known validator code (checked below).
const noTitle = (s: string) => s.replace(/^title: .*\n/m, '') // front-matter
const withFoo = (s: string) => `${s}\n<Foo />\n` // unknown-component
const choiceCD = (s: string) => s.replace(/^choice: BCD$/m, 'choice: CD') // valid, answer wrong
const wrong200 = (s: string) => s.replace('value: 200, unit: mA', 'value: 250, unit: mA') // answer-mismatch

interface Att {
  text: string
  secs: number
  cost: number
}
const att = (text: string, secs: number, cost: number): Att => ({ text, secs, cost })

// Two modes over the same four problems. Expected numbers are worked out by hand in the assertions.
const PLAN: Record<string, Record<string, Att[]>> = {
  full: {
    'gd23-06': [att(base['gd23-06'], 10, 0.01)],
    'gd23-08': [att(noTitle(base['gd23-08']), 20, 0.02), att(choiceCD(base['gd23-08']), 30, 0.03)],
    'sd25-14': [att(withFoo(base['sd25-14']), 40, 0.04), att(noTitle(base['sd25-14']), 50, 0.05), att(wrong200(base['sd25-14']), 60, 0.06)],
    'gd24-13': [att(base['gd24-13'], 70, 0.07)],
  },
  single: {
    'gd23-06': [att(noTitle(base['gd23-06']), 5, 0.05), att(base['gd23-06'], 5, 0.05)],
    'gd23-08': [att(base['gd23-08'], 10, 0.05)],
    'sd25-14': [att(wrong200(base['sd25-14']), 10, 0.05), att(base['sd25-14'], 10, 0.05)],
    'gd24-13': [att(withFoo(base['gd24-13']), 20, 0.05), att(withFoo(base['gd24-13']), 20, 0.05), att(base['gd24-13'], 20, 0.05)],
  },
}
const PROMPT_BYTES: Record<string, Record<string, number>> = {
  full: { 'gd23-06': 1000, 'gd23-08': 2000, 'sd25-14': 3000, 'gd24-13': 4000 },
  single: { 'gd23-06': 500, 'gd23-08': 600, 'sd25-14': 700, 'gd24-13': 800 },
}
const IDS = Object.keys(base)
const fakeStd: Standard = { version: 1, problems: IDS.map((id) => ({ id, why: '' })) }

let tmp: string
let runDir: string

beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), 'eval-standard-'))
  runDir = join(tmp, 'runs', '2026-10-16-fake')
  for (const mode of Object.keys(PLAN)) {
    const modeDir = join(runDir, mode)
    const attempts = join(modeDir, '.attempts')
    mkdirSync(attempts, { recursive: true })
    const log: string[] = []
    for (const id of IDS) {
      log.push(`2026-10-16T10:00:00.000Z ${id} 第 1 次提示词 ${PROMPT_BYTES[mode][id]} 字节`)
      PLAN[mode][id].forEach((a, i) => {
        const n = i + 1
        writeFileSync(join(attempts, `${id}-${n}.md`), a.text + '\n')
        // Same shape as generate.ts storeAttempt() writes; the error count is not read back by the report.
        log.push(`2026-10-16T10:00:00.000Z ${id} 第 ${n} 次：0 个错误，0 个提醒（${a.secs}s，$${a.cost.toFixed(4)}，输入 1k / 输出 2k token，mode=${mode} engine=grok）`)
      })
    }
    writeFileSync(join(modeDir, 'generate.log'), log.join('\n') + '\n')
    // A patch reply is not an attempt and must not be counted.
    writeFileSync(join(attempts, 'gd23-08-2.patch.md'), 'not a lesson\n')
  }
  writeFileSync(
    join(runDir, 'run.json'),
    JSON.stringify({ date: '2026-10-16', label: 'fake', engine: 'grok', model: 'grok-4.7', modes: Object.keys(PLAN), rounds: 3, jobs: 3, effort: null, passthrough: [], version: 1, ids: IDS, commit: 'abc1234', startedAt: '2026-10-16T10:00:00.000Z', finishedAt: '2026-10-16T11:00:00.000Z' }, null, 2),
  )
})

afterAll(() => {
  rmSync(tmp, { recursive: true, force: true })
})

describe('fixtures used by the report test', () => {
  it('produce the validator codes the expected numbers depend on', async () => {
    const { validateSource } = await import('./validate')
    const codes = (s: string) => validateSource(s).errors.map((e) => e.code)
    expect(codes(base['gd23-06'])).toEqual([])
    expect(codes(noTitle(base['gd23-08']))).toEqual(['front-matter'])
    expect(codes(withFoo(base['sd25-14']))).toEqual(['unknown-component'])
    expect(codes(noTitle(base['sd25-14']))).toEqual(['front-matter'])
    expect(codes(wrong200(base['sd25-14']))).toEqual(['answer-mismatch'])
    expect(codes(choiceCD(base['gd23-08']))).toEqual([])
  })
})

describe('summarizeMode', () => {
  it('counts the full mode by hand', () => {
    const s = summarizeMode(join(runDir, 'full'), 'full', IDS, 3)
    expect(s.firstPass).toBe(2) // gd23-06, gd24-13
    expect(s.withinRounds).toBe(3) // + gd23-08 at round 2; sd25-14 never passes
    expect(s.answerOk).toBe(2) // gd23-08's final lesson has choice CD; sd25-14's final has 250 mA
    expect(s.avgRounds).toBeCloseTo((1 + 2 + 3 + 1) / 4) // sd25-14 never passed, so it counts as 3
    expect(s.promptBytes).toBe(2500)
    expect(s.promptCount).toBe(4)
    expect(s.secs).toBe(280)
    expect(s.cost).toBeCloseTo(0.28)
    expect(s.codes).toEqual([
      { code: 'front-matter', count: 2, example: '头信息缺少 title' },
      { code: 'answer-mismatch', count: 1, example: expect.any(String) },
      { code: 'unknown-component', count: 1, example: expect.any(String) },
    ])
    expect(s.problems.find((p) => p.id === 'sd25-14')).toMatchObject({ attempts: 3, passAt: undefined, answerOk: false })
    expect(s.problems.find((p) => p.id === 'gd23-08')).toMatchObject({ attempts: 2, passAt: 2, answerOk: false })
  })

  it('counts the single mode by hand', () => {
    const s = summarizeMode(join(runDir, 'single'), 'single', IDS, 3)
    expect(s.firstPass).toBe(1) // gd23-08 only
    expect(s.withinRounds).toBe(4)
    expect(s.answerOk).toBe(4)
    expect(s.avgRounds).toBeCloseTo((2 + 1 + 2 + 3) / 4)
    expect(s.promptBytes).toBe(650)
    expect(s.secs).toBe(100)
    expect(s.cost).toBeCloseTo(0.4)
    expect(s.codes.map((c) => [c.code, c.count])).toEqual([
      ['unknown-component', 2],
      ['answer-mismatch', 1],
      ['front-matter', 1],
    ])
  })

  it('counts a problem with no attempts as not passed', () => {
    const s = summarizeMode(join(runDir, 'single'), 'single', [...IDS, 'zj-23'], 3)
    expect(s.problems).toHaveLength(5)
    expect(s.problems.find((p) => p.id === 'zj-23')).toMatchObject({ attempts: 0, passAt: undefined, answerOk: null, rounds: 3 })
    expect(s.withinRounds).toBe(4)
  })
})

describe('reportRun', () => {
  it('writes report.md with the totals, the per-problem table and the code table', () => {
    const r = reportRun(runDir, fakeStd)
    expect(readFileSync(r.file, 'utf8')).toBe(r.text)
    expect(r.text).toContain('# 标准评测报告：2026-10-16-fake')
    expect(r.text).toContain('git 提交 abc1234')
    expect(r.text).toContain('| 题目 | 说明 | full | single |')
    expect(r.text).toMatch(/\| sd25-14 \|\s+\| ✗ 答案✗ \| 2 \|/)
    expect(r.text).toMatch(/\| gd23-08 \|\s+\| 2 答案✗ \| 1 \|/)
    expect(r.text).toMatch(/\| 1 \| front-matter 2 \| unknown-component 2 \|/)
    expect(r.table).toContain('| full | 4 | 2/4（50%） | 3/4（75%） | 2/4（50%） | 1.75 | 2500 | 4.7 | $0.28 | front-matter 2，answer-mismatch 1，unknown-component 1 |')
    expect(r.table).toContain('| single | 4 | 1/4（25%） | 4/4（100%） | 4/4（100%） | 2.00 | 650 | 1.7 | $0.40 |')
  })

  it('renders the totals table for a summary list', () => {
    const s = summarizeMode(join(runDir, 'single'), 'single', IDS, 3)
    expect(renderTotals([s], IDS, 3).split('\n')[0]).toBe('| 模式 | 题数 | 首轮通过 | 3轮内通过 | 答案正确 | 平均轮次 | 提示词（第 1 轮，字节均值） | 耗时（分钟） | 花费 | 最常见报错（前 3） |')
  })
})

describe('run command line', () => {
  it('parses the flags and passes unknown generate.ts flags through in order', () => {
    expect(
      parseRunArgs(['--engine', 'grok', '--model', 'grok-4.7', '--modes', 'full,single', '--rounds', '2', '--jobs', '2', '--effort', 'high', '--label', 'g47', '--timeout', '30', '--select-engine', 'grok', '--blind']),
    ).toEqual({
      engine: 'grok',
      model: 'grok-4.7',
      modes: ['full', 'single'],
      rounds: 2,
      jobs: 2,
      effort: 'high',
      label: 'g47',
      passthrough: ['--timeout', '30', '--select-engine', 'grok'],
    })
  })

  it('has defaults: codex runs full, other engines three modes; 3 rounds, 3 jobs, codex-default label', () => {
    const o = parseRunArgs(['--engine', 'codex'])
    expect(o).toMatchObject({ engine: 'codex', modes: ['full'], rounds: 3, jobs: 3, passthrough: [] })
    expect(parseRunArgs(['--engine', 'grok']).modes).toEqual(['full', 'single', 'compact'])
    expect(runLabel(o)).toBe('codex-default')
    expect(runDirName('2026-10-16', runLabel({ engine: 'grok', model: 'grok-4.7' }))).toBe('2026-10-16-grok-grok-4.7')
  })

  it('rejects bad command lines', () => {
    const bad: string[][] = [
      [],
      ['--modes', 'full'],
      ['--engine', 'gpt'],
      ['--engine', 'codex', '--modes', 'single'],
      ['--engine', 'grok', '--modes', 'full,bogus'],
      ['--engine', 'grok', '--modes', 'full,full'],
      ['--engine', 'grok', '--rounds', '0'],
      ['--engine', 'grok', '--jobs', '1.5'],
      ['--engine', 'grok', 'gd23-06'],
      ['--engine', 'grok', '--out', 'x'],
      ['--engine', 'grok', '--label', 'a b'],
      ['--engine', 'grok', '--effort'],
    ]
    for (const argv of bad) expect(() => parseRunArgs(argv), argv.join(' ')).toThrow(UsageError)
  })

  it('builds the generate.ts command for one mode', () => {
    const std = loadStandard()
    const ids = std.problems.map((p) => p.id)
    const { cmd, args } = generateCommand({
      ids,
      engine: 'grok',
      model: 'grok-4.7',
      mode: 'single',
      rounds: 3,
      jobs: 3,
      out: 'evals/runs/2026-10-16-grok-grok-4.7/single',
      passthrough: ['--timeout', '30'],
    })
    expect(cmd).toBe('npx')
    expect(args).toEqual([
      'tsx',
      'scripts/generate.ts',
      ...ids,
      '--engine',
      'grok',
      '--model',
      'grok-4.7',
      '--mode',
      'single',
      '--blind',
      '--out',
      'evals/runs/2026-10-16-grok-grok-4.7/single',
      '--rounds',
      '3',
      '--jobs',
      '3',
      '--timeout',
      '30',
    ])
  })

  it('omits --model and --effort when not given', () => {
    const { args } = generateCommand({ ids: ['gd23-06'], engine: 'codex', mode: 'full', rounds: 3, jobs: 3, out: 'evals/runs/x/full' })
    expect(args).toEqual(['tsx', 'scripts/generate.ts', 'gd23-06', '--engine', 'codex', '--mode', 'full', '--blind', '--out', 'evals/runs/x/full', '--rounds', '3', '--jobs', '3'])
  })

  it('parses the prompt size lines', () => {
    expect(parsePromptBytes('2026 gd23-06 第 1 次提示词 1234 字节\n2026 gd23-06 第 1 次：0 个错误，0 个提醒（3s，mode=full engine=codex）')).toEqual(new Map([['gd23-06', 1234]]))
  })
})

describe('standard question list', () => {
  it('has the ten agreed problems, each with a problem file and an automatically checkable answer key', () => {
    const std = loadStandard()
    expect(std.version).toBe(1)
    expect(std.problems.map((p) => p.id)).toEqual([
      'gd24-13',
      'sd25-14',
      'zj-23',
      'gd23-08',
      'gd23-06',
      'r5-01-belt-loop',
      'r6-07-orbit-transfer',
      'r5-05-prism',
      'zj-27',
      'r6-08-wave-vibration',
    ])
    for (const { id } of std.problems) {
      expect(existsSync(join(root, 'problems', `${id}.md`)), id).toBe(true)
      const key = answerKey(id)
      expect(key, id).not.toBeNull()
      // An entry with neither `any` nor `choice` is manual-only (checked by a person).
      expect(key!.every((e) => e.any !== undefined || e.choice !== undefined), id).toBe(true)
    }
  })
})
