import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadDocs, repoRoot } from '../docs/index'
import { signature, signatureTable } from '../lesson/signature'
import {
  REQUIRED_CARDS,
  SINGLE_PROMPT_BUDGET,
  agentUserPrompt,
  appendPointedDocs,
  buildSinglePrompt,
  parseCardSelection,
  selectCards,
  type LessonProblem,
} from './prompt'

const problem: LessonProblem = {
  id: 'zj-01',
  title: '欹器何时翻转',
  source: '2022 浙江',
  text: '决定桶能否翻转的主要因素是重心高低。',
}

describe('single-round prompt', () => {
  it('keeps the output rules, L0, required cards, and reports the byte size', () => {
    const built = buildSinglePrompt(problem, ['plot', 'not-a-card'])
    expect(built.bytes).toBe(Buffer.byteLength(built.text))
    expect(built.bytes).toBeLessThanOrEqual(SINGLE_PROMPT_BUDGET)
    expect(built.cards.slice(0, 3)).toEqual([...REQUIRED_CARDS])
    expect(built.cards).toContain('plot')
    expect(built.cards).not.toContain('not-a-card')
    expect(built.text).toContain('选型路由表')
    expect(built.text).toContain('不要读写文件、不要运行命令')
    expect(built.text).toContain('id: zj-01')
    expect(built.text).toContain(problem.text)
    expect(built.text).toContain('### plot')
    expect(built.text).toContain('### structure')
    expect(built.included).toContain('index')
  })

  it('always includes selected refs, ahead of related refs, even past the budget', () => {
    const built = buildSinglePrompt(problem, ['sim'], { refs: ['sim-fields', 'motion-axis'] })
    expect(built.refs.slice(0, 2)).toEqual(['sim-fields', 'motion-axis'])
    const tight = buildSinglePrompt(problem, ['motion', 'sim'], { budget: 8 * 1024, refs: ['motion-track'] })
    expect(tight.refs).toEqual(['motion-track'])
    expect(tight.included).toContain('motion-track')
  })

  it('adds L2 refs from related only while the total stays under the budget', () => {
    const wide = buildSinglePrompt(problem, ['motion'], { budget: 1024 * 1024 })
    expect(wide.refs).toContain('motion-forces')
    expect(wide.refs).not.toContain('force-diagram')
    expect(wide.text).toContain('### motion-forces')
    expect(wide.omittedRefs).toEqual([])
    expect(wide.bytes).toBeLessThanOrEqual(1024 * 1024)

    const tight = buildSinglePrompt(problem, ['motion', 'sim'], { budget: 8 * 1024 })
    expect(tight.refs).toEqual([])
    expect(tight.omittedRefs.length).toBeGreaterThan(0)
    expect(tight.cards).toContain('motion')
    expect(tight.bytes).toBeGreaterThan(8 * 1024)
    expect(tight.text).not.toContain('## 深入参考')

    const capped = buildSinglePrompt(problem, ['sim'], { budget: SINGLE_PROMPT_BUDGET })
    if (capped.refs.length) expect(capped.bytes).toBeLessThanOrEqual(SINGLE_PROMPT_BUDGET)
    expect(capped.omittedRefs.every((id) => !capped.refs.includes(id))).toBe(true)
  })

  it('appends a pointed doc that was not already in the prompt', () => {
    const built = buildSinglePrompt(problem, ['plot'])
    expect(built.included).not.toContain('motion-forces')
    const grown = appendPointedDocs(built.text, built.included, [
      '头信息缺 id',
      '<Motion> friction 不能手写加速度',
    ])
    expect(grown.added).toEqual(['motion-forces'])
    expect(grown.appendix).toContain('## 需要补读的文档')
    expect(grown.text).toContain('### motion-forces')
    const again = appendPointedDocs(grown.text, [...built.included, ...grown.added], ['<Motion> friction 再次'])
    expect(again.added).toEqual([])
    expect(again.text).toBe(grown.text)
  })

  it('compact prompt adds the one-line component table after the output rules; single prompt has none', () => {
    const single = buildSinglePrompt(problem, ['plot'])
    const compact = buildSinglePrompt(problem, ['plot'], { signatures: true })
    expect(single.text).not.toContain('## 全部组件一览')
    expect(single.text).not.toContain(signature('Define')!)
    expect(compact.text).toContain('## 全部组件一览（一行一个；* 为必填；用法细节见下面的卡片）')
    expect(compact.text).toContain(signatureTable(loadDocs()))
    expect(compact.text).toContain(signature('Define')!)
    const at = compact.text.indexOf('## 全部组件一览')
    expect(compact.text.indexOf('不要读写文件')).toBeLessThan(at)
    expect(at).toBeLessThan(compact.text.indexOf('## 入口'))
    expect(compact.cards).toEqual(single.cards)
    expect(compact.bytes).toBeGreaterThan(single.bytes)
  })

  it('drops unknown card ids and always keeps the three required cards', async () => {
    expect(parseCardSelection('{"cards":["plot","nope","rules","plot"]}')).toEqual({
      cards: ['structure', 'params', 'rules', 'plot'],
      refs: [],
      unknown: ['nope'],
    })
    expect(() => parseCardSelection('not json')).toThrow(/JSON/)
    const selected = await selectCards(problem, {
      complete: async (user) => {
        expect(user).toContain('选型路由表')
        expect(user).toContain('sim-fields：')
        expect(user).toContain('v.efield')
        expect(user).toContain(problem.text)
        return '```json\n{"cards":["sim-api","circuit"],"refs":["circuit-solve","nope-ref"]}\n```'
      },
    })
    expect(selected.cards).toEqual(['structure', 'params', 'rules', 'circuit'])
    expect(selected.refs).toEqual(['sim-api', 'circuit-solve'])
    expect(selected.unknown).toEqual(['nope-ref'])
    expect(selected.costUsd).toBe(0)
  })

  it('agent prompt drops the no-tools line and keeps the answer rules', () => {
    const user = agentUserPrompt(problem)
    expect(user).not.toContain('不要读写文件')
    expect(user).toContain('submit_lesson')
    expect(user).toContain('answers')
    expect(user).toContain(problem.text)
    const onDisk = readFileSync(join(repoRoot, 'problems/zj-01.md'), 'utf8')
    expect(onDisk).toContain('id: zj-01')
  })
})
