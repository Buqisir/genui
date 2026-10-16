import { describe, expect, it } from 'vitest'
import { formatProgress, progressOf, type ProgressIssue } from './progress'

const e = (code: string, block: string, message = `${code} ${block}`): ProgressIssue => ({ code, block, message })

describe('progressOf', () => {
  it('reports every previous error as fixed when the new round is clean', () => {
    const prev = [e('answer-mismatch', 'Define:R1'), e('component-invalid', 'Figure:电路图')]
    const p = progressOf(prev, [])
    expect(p.fixed).toEqual(prev)
    expect(p.remaining).toEqual([])
    expect(p.added).toEqual([])
  })

  it('splits a partly fixed round into fixed, remaining and added', () => {
    const a = e('answer-mismatch', 'Define:R1')
    const b = e('component-invalid', 'Figure:电路图')
    const c = e('unknown-prop', 'Readout#2')
    const p = progressOf([a, b, e('eval-failed', 'Sim:主图')], [b, c])
    expect(p.fixed.map((x) => x.code)).toEqual(['answer-mismatch', 'eval-failed'])
    expect(p.remaining).toEqual([b])
    expect(p.added).toEqual([c])
  })

  it('takes the current copy of a remaining error (the line may have moved)', () => {
    const now = { ...e('answer-mismatch', 'Define:R1'), line: 12 }
    const p = progressOf([{ ...e('answer-mismatch', 'Define:R1'), line: 3 }], [now])
    expect(p.remaining).toEqual([now])
  })

  it('counts repeated keys as a multiset', () => {
    const p = progressOf([e('unknown-prop', 'Readout#2'), e('unknown-prop', 'Readout#2')], [e('unknown-prop', 'Readout#2')])
    expect(p.fixed).toHaveLength(1)
    expect(p.remaining).toHaveLength(1)
    expect(p.added).toHaveLength(0)
  })

  it('treats an extra repeat in the new round as added', () => {
    const p = progressOf([e('unknown-prop', 'Readout#2')], [e('unknown-prop', 'Readout#2'), e('unknown-prop', 'Readout#2')])
    expect(p.fixed).toHaveLength(0)
    expect(p.remaining).toHaveLength(1)
    expect(p.added).toHaveLength(1)
  })

  it('compares the message when neither issue has a block', () => {
    const prev: ProgressIssue[] = [{ code: 'x', message: '甲' }, { code: 'x', message: '乙' }]
    const p = progressOf(prev, [{ code: 'x', message: '乙' }, { code: 'x', message: '丙' }])
    expect(p.fixed.map((i) => i.message)).toEqual(['甲'])
    expect(p.remaining.map((i) => i.message)).toEqual(['乙'])
    expect(p.added.map((i) => i.message)).toEqual(['丙'])
  })

  it('does not match a blockless issue with one that has a block', () => {
    const p = progressOf([{ code: 'x', message: 'm' }], [{ code: 'x', block: 'Define:R1', message: 'm' }])
    expect(p.fixed).toHaveLength(1)
    expect(p.added).toHaveLength(1)
  })

  it('treats different codes on the same block as different errors', () => {
    const p = progressOf([e('answer-mismatch', 'Define:R1')], [e('unknown-prop', 'Define:R1')])
    expect(p.fixed).toHaveLength(1)
    expect(p.added).toHaveLength(1)
  })

  it('returns everything as added when the previous round was empty', () => {
    const now = [e('answer-mismatch', 'Define:R1')]
    expect(progressOf([], now)).toEqual({ fixed: [], remaining: [], added: now })
  })
})

describe('formatProgress', () => {
  it('is empty when the previous round had no errors', () => {
    expect(formatProgress(progressOf([], [e('answer-mismatch', 'Define:R1')]))).toBe('')
    expect(formatProgress(progressOf([], []))).toBe('')
  })

  it('says all errors are fixed when nothing is left and nothing is new', () => {
    const prev = [e('answer-mismatch', 'Define:R1'), e('unknown-prop', 'Readout#2')]
    expect(formatProgress(progressOf(prev, []))).toBe('上一轮的 2 条错误都已改好。')
  })

  it('lists remaining and new errors by block and code', () => {
    const prev = [
      e('answer-mismatch', 'Define:R1'),
      e('component-invalid', 'Figure:电路图'),
      e('eval-failed', 'Sim:主图'),
      e('unknown-prop', 'Readout#1'),
      e('unknown-prop', 'Readout#3'),
    ]
    const now = [e('component-invalid', 'Figure:电路图'), e('unknown-prop', 'Readout#2')]
    expect(formatProgress(progressOf(prev, now))).toBe(
      '和上一轮比：上一轮 5 条错误，已改好 4 条；仍未解决 1 条（Figure:电路图 component-invalid）；新出现 1 条（Readout#2 unknown-prop）。',
    )
  })

  it('still reports the errors when nothing was fixed', () => {
    const prev = [e('answer-mismatch', 'Define:R1')]
    expect(formatProgress(progressOf(prev, prev))).toBe('和上一轮比：上一轮 1 条错误，已改好 0 条；仍未解决 1 条（Define:R1 answer-mismatch）；新出现 0 条。')
  })

  it('falls back to the line number, then to the message, when a block is missing', () => {
    const prev: ProgressIssue[] = [{ code: 'bad-token', line: 7, message: '坏的 token' }, { message: '孤立的一句话' }]
    const now: ProgressIssue[] = [{ code: 'bad-token', line: 9, message: '坏的 token' }]
    expect(formatProgress(progressOf(prev, now))).toBe(
      '和上一轮比：上一轮 2 条错误，已改好 1 条；仍未解决 1 条（第 9 行 bad-token）；新出现 0 条。',
    )
    expect(formatProgress(progressOf([{ message: '甲' }], [{ message: '甲' }, { message: '乙' }]))).toBe(
      '和上一轮比：上一轮 1 条错误，已改好 0 条；仍未解决 1 条（甲）；新出现 1 条（乙）。',
    )
  })
})

describe('formatProgress answer-key labels', () => {
  it('names an answer-key miss the way the report does', () => {
    const miss = { code: 'answer-key', block: '(3) 波形', message: '(3) 波形' }
    expect(formatProgress(progressOf([miss], [miss]))).toContain('答案核对「(3) 波形」')
  })
})
