import { describe, expect, it } from 'vitest'
import { markSeries } from './marks'

describe('Plot marks without series', () => {
  it('lands on the curve the label names', () => {
    expect(markSeries('v_y 回到 0', ['v_x', 'v_y'])).toBe(1)
    expect(markSeries('$v_{x}$ 最大', ['水平分速度 v_x', '竖直分速度 v_y'])).toBe(0)
    expect(markSeries('乙车追上', ['甲车', '乙车'])).toBe(1)
    expect(markSeries('E_k 最大', ['E_p', 'E_k', 'E'])).toBe(1)
  })

  it('gives up when the label names no curve or several', () => {
    expect(markSeries('t₁ 时刻', ['v_x', 'v_y'])).toBeUndefined()
    expect(markSeries('v_x = v_y', ['v_x', 'v_y'])).toBeUndefined()
    expect(markSeries('任意', ['唯一曲线'])).toBe(0)
  })
})
