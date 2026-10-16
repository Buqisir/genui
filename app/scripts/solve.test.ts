import { describe, expect, it } from 'vitest'
import { checkAnswerKey } from './answerkey'
import { insertBeforeProblem, judgeSolve, parseSolution, readProblem, solutionKey, solutionSection, solvePrompt } from './genprompt'
import { parseRunArgs, splitMode, UsageError, generateCommand } from './eval-standard'

// Reply in the format solvePrompt asks for; zj-23 has a numeric answer (34 Ω) and choice [AD, C].
const reply = (answers: string, choice = 'choice: [AD, C]') =>
  ['## 解题过程', '', '(1) 欧姆 ×10 挡，指针 3.4，R = 34 Ω。', '', '(2) A 对，B 错，C 错，D 对。', '', '(3) 方波，选 C。', '', '## 答案', '', '```yaml', answers, choice, '```', ''].join('\n')
const good = reply('answers:\n  - { q: "(1)", value: 34, unit: Ω }')

describe('parseSolution', () => {
  it('reads answers and a choice list', () => {
    const r = parseSolution(good)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.answers).toEqual([{ q: '(1)', value: 34, unit: 'Ω' }])
    expect(r.choice).toEqual(['AD', 'C'])
    expect(r.text.startsWith('## 解题过程')).toBe(true)
  })

  it('keeps a string choice as a one-element list', () => {
    const r = parseSolution(reply('answers: []', 'choice: C'))
    expect(r).toMatchObject({ ok: true, answers: [], choice: ['C'] })
  })

  it('leaves choice out when the reply has none', () => {
    const r = parseSolution(reply('answers:\n  - { q: "(1)", value: 2 }', '').replace('\n\n```', '\n```'))
    expect(r.ok).toBe(true)
    if (r.ok) expect(r).not.toHaveProperty('choice')
  })

  it('fails with a message when the yaml block is missing', () => {
    const r = parseSolution('## 解题过程\n\n算了。\n\n## 答案\n\n34 Ω')
    expect(r).toMatchObject({ ok: false })
    expect(r.ok === false && r.error).toContain('yaml 代码块')
  })

  it('fails when there is no 答案 heading', () => {
    const r = parseSolution('## 解题过程\n\n```yaml\nanswers: []\n```\n')
    expect(r.ok === false && r.error).toContain('## 答案')
  })

  it('fails with the yaml error when the block does not parse', () => {
    const r = parseSolution(reply('answers: [\n  - { q: "(1)", value: 34'))
    expect(r.ok === false && r.error).toContain('yaml 解析失败')
  })

  it('fails when a value is not a number', () => {
    const r = parseSolution(reply('answers:\n  - { q: "(1)", value: "34 Ω" }'))
    expect(r.ok === false && r.error).toContain('value 要是数字')
  })

  it('fails when answers is not a list', () => {
    const r = parseSolution(reply('answers: 34'))
    expect(r.ok === false && r.error).toContain('answers 要写成列表')
  })

  it('fails when choice is not letters', () => {
    const r = parseSolution(reply('answers: []', 'choice: [1, 2]'))
    expect(r.ok === false && r.error).toContain('choice')
  })
})

describe('solutionKey with the answer key', () => {
  const key = (text: string) => {
    const r = parseSolution(text)
    if (!r.ok) throw new Error(r.error)
    return solutionKey(r)
  }

  it('passes zj-23 with 34 Ω and [AD, C]', () => {
    const k = checkAnswerKey('zj-23', key(good))
    expect(k).toMatchObject({ checked: true, missing: [] })
  })

  it('reports the wrong sub-question when (3) is A', () => {
    const k = checkAnswerKey('zj-23', key(reply('answers:\n  - { q: "(1)", value: 34 }', 'choice: [AD, A]')))
    expect(k.missing).toEqual(['(3) 波形'])
  })

  it('reports the number when it is off by more than 1%', () => {
    const k = checkAnswerKey('zj-23', key(reply('answers:\n  - { q: "(1)", value: 36 }')))
    expect(k.missing).toEqual(['(1) 阻值'])
  })

  it('solutionKey writes a header that starts and ends with ---', () => {
    const text = solutionKey({ answers: [{ q: '(1)', value: 34 }], choice: ['AD', 'C'] })
    expect(text.startsWith('---\n')).toBe(true)
    expect(text.endsWith('\n---\n')).toBe(true)
  })
})

describe('judgeSolve', () => {
  it('gives the format error as feedback when parsing fails', () => {
    const j = judgeSolve('zj-23', '只有解题过程')
    expect(j.parsed.ok).toBe(false)
    expect(j.feedback).toContain('- 格式：')
  })

  it('lists the missed answers with the answer-check wording', () => {
    const j = judgeSolve('zj-23', reply('answers:\n  - { q: "(1)", value: 99 }'))
    expect(j.missing).toEqual(['(1) 阻值'])
    expect(j.feedback).toContain('「(1) 阻值」与标准答案不符')
  })
})

describe('solution in the lesson prompt', () => {
  const problem = readProblem('zj-23')
  const sol = parseSolution(good)
  if (!sol.ok) throw new Error(sol.error)

  it('solvePrompt names the problem and asks for the two sections', () => {
    const text = solvePrompt(problem)
    expect(text).toContain(`## 题目（${problem.title}，${problem.source}）`)
    expect(text).toContain('## 解题过程')
    expect(text).toContain('## 答案')
    expect(text).not.toContain('课件语法规范')
  })

  it('solutionSection cuts the answer heading off the reasoning and keeps the yaml block as written', () => {
    const section = solutionSection(sol)
    expect(section.startsWith('## 已经做好的解答')).toBe(true)
    expect(section).toContain('(3) 方波，选 C。')
    expect(section).not.toContain('## 答案')
    expect(section).toContain('答案：\n```yaml\nanswers:\n  - { q: "(1)", value: 34, unit: Ω }\nchoice: [AD, C]\n```')
  })

  it('insertBeforeProblem puts the section right before the problem heading', () => {
    const base = `# 指令\n\n## 组件卡\n\n内容\n## 题目（${problem.title}，${problem.source}）\n\n${problem.text}\n`
    const out = insertBeforeProblem(base, solutionSection(sol))
    const at = out.indexOf('## 已经做好的解答')
    expect(at).toBeGreaterThan(out.indexOf('## 组件卡'))
    expect(at).toBeLessThan(out.indexOf('## 题目（'))
    expect(out).toMatch(/\n\n## 已经做好的解答/)
    expect(out.endsWith(base.slice(base.indexOf('## 题目（')))).toBe(true)
  })

  it('insertBeforeProblem refuses a prompt with no problem section', () => {
    expect(() => insertBeforeProblem('没有题目', 'x')).toThrow()
  })
})

describe('-solve mode names in eval-standard', () => {
  it('splits the suffix off', () => {
    expect(splitMode('single-solve')).toEqual({ mode: 'single', solveFirst: true })
    expect(splitMode('compact')).toEqual({ mode: 'compact', solveFirst: false })
  })

  it('accepts -solve on full, single and compact, and rejects it on agent', () => {
    expect(parseRunArgs(['--engine', 'grok', '--modes', 'single,single-solve,full-solve']).modes).toEqual(['single', 'single-solve', 'full-solve'])
    expect(() => parseRunArgs(['--engine', 'grok', '--modes', 'agent-solve'])).toThrow(UsageError)
    expect(() => parseRunArgs(['--engine', 'codex', '--modes', 'single-solve'])).toThrow(UsageError)
  })

  it('passes --solve-first to generate.ts only for a -solve mode', () => {
    const solve = generateCommand({ ids: ['zj-23'], engine: 'grok', mode: 'single', rounds: 3, jobs: 3, out: 'x/single-solve', solveFirst: true })
    expect(solve.args).toContain('--solve-first')
    expect(solve.args.slice(solve.args.indexOf('--mode'), solve.args.indexOf('--mode') + 2)).toEqual(['--mode', 'single'])
    const plain = generateCommand({ ids: ['zj-23'], engine: 'grok', mode: 'single', rounds: 3, jobs: 3, out: 'x/single' })
    expect(plain.args).not.toContain('--solve-first')
  })

  it('does not let --solve-first through as a passthrough flag', () => {
    expect(() => parseRunArgs(['--engine', 'grok', '--solve-first'])).toThrow(UsageError)
  })
})
