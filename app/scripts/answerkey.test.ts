import { describe, expect, it } from 'vitest'
import { checkAnswerKey } from './answerkey'

// gd22-13 key: N_1 = 8, N_2 = 5, v_1 = 8, h = 0.2 (or 20 cm).
const lesson = (values: number[], choice?: string) =>
  ['---', 'id: x', ...(choice ? [`choice: ${choice}`] : []), 'answers:', ...values.map((v, i) => `  - { name: a${i}, value: ${v} }`), '---', ''].join('\n')

describe('checkAnswerKey', () => {
  it('passes when every key value is present', () => {
    expect(checkAnswerKey('gd22-13', lesson([8, 5, 8, 0.2]))).toMatchObject({ checked: true, missing: [] })
  })

  it('does not let one value satisfy two entries', () => {
    const r = checkAnswerKey('gd22-13', lesson([6, 7, 8, 0.2]))
    expect(r.missing).toHaveLength(2)
    expect(r.missing).toContain('(1) 上滑时支持力 N_2')
  })

  it('accepts unit alternatives and order does not matter', () => {
    expect(checkAnswerKey('gd22-13', lesson([20, 8, 5, 8])).missing).toEqual([])
  })

  it('reassigns a value when a later entry needs it', () => {
    // 8 can serve N_1 or v_1; matching must still find room for both when two 8s exist.
    expect(checkAnswerKey('gd22-13', lesson([0.2, 8, 5, 8.05])).missing).toEqual([])
  })

  it('checks the option set for choice questions', () => {
    expect(checkAnswerKey('gd23-10', lesson([], 'BD')).missing).toEqual([])
    expect(checkAnswerKey('gd23-10', lesson([], 'CD')).missing).toEqual(['选项'])
  })

  it('pairs a choice list with the key choice entries in order', () => {
    // zj-23: (2) 选项 AD, (3) 波形 C.
    expect(checkAnswerKey('zj-23', lesson([34], '[AD, C]')).missing).toEqual([])
    expect(checkAnswerKey('zj-23', lesson([34], '[C, AD]')).missing).toEqual(['(2) 选项', '(3) 波形'])
  })

  it('reports the second choice entry when the lesson gives one string', () => {
    expect(checkAnswerKey('zj-23', lesson([34], 'AD')).missing).toEqual(['(3) 波形'])
  })

  it('checks three choice sub-questions from a list', () => {
    // zj-24: (1)① B, (1)② C, (1)③ D, and two numeric values.
    expect(checkAnswerKey('zj-24', lesson([0.78, 1.29], '[B, C, D]')).missing).toEqual([])
    expect(checkAnswerKey('zj-24', lesson([0.78, 1.29], '[B, C, A]')).missing).toEqual(['(1)③ 初速度'])
  })
})
