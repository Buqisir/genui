import { describe, expect, it } from 'vitest'
import { formatTick, formatTicks, niceTicks } from './layout'

describe('tick labels', () => {
  it('writes large and small values in textbook form', () => {
    expect(formatTick(110000)).toBe('1.1×10⁵')
    expect(formatTick(-0.00025)).toBe('−2.5×10⁻⁴')
    expect(formatTick(10000, { bare: true })).toBe('10⁴')
    expect(formatTick(0.0185)).toBe('0.0185')
    expect(formatTick(0)).toBe('0')
  })

  it('keeps neighbouring ticks distinguishable', () => {
    expect(formatTicks([100000, 105000, 110000])).toEqual(['1.00×10⁵', '1.05×10⁵', '1.10×10⁵'])
    expect(formatTicks(niceTicks(100000, 110000, 4))).toEqual(['1.00×10⁵', '1.02×10⁵', '1.04×10⁵', '1.06×10⁵', '1.08×10⁵', '1.10×10⁵'])
    expect(formatTicks([0.018, 1 / 55, 0.02])).toEqual(['0.018', '0.0182', '0.02'])
    expect(formatTicks([0, 30, 60])).toEqual(['0', '30', '60'])
    expect(formatTicks([0, 5000, 10000, 15000])).toEqual(['0', '5000', '1.0×10⁴', '1.5×10⁴'])
  })
})
