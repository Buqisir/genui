import { describe, expect, it } from 'vitest'
import { settleSum, termSize } from '../lesson/expr'
import { formatNumber, formatValue } from './controls'

describe('readings that cancel', () => {
  // Two carts pushed apart from rest: m1·v1 + m2·v2 should be exactly 0.
  const scope = { m1: 3, m2: 2, v1: -0.1 * 7, v2: (0.1 * 7 * 3) / 2, q: 1.6e-19, E: 2.5e-3 }
  const defs: Record<string, string> = { p1: 'm1*v1', p2: 'm2*v2', ptot: 'p1 + p2' }
  const lookup = (n: string) => defs[n]

  it('measures the terms a sum adds up, through Defines', () => {
    expect(termSize('m1*v1 + m2*v2', scope)).toBeCloseTo(4.2, 12)
    expect(termSize('ptot', scope, lookup)).toBeCloseTo(4.2, 12)
    expect(termSize('-(m1*v1) / 2', scope)).toBeCloseTo(1.05, 12)
    expect(termSize('m1 > 1 ? m1*v1 - m2*v2 : 0', scope)).toBeCloseTo(4.2, 12)
    expect(termSize('m1*max(1 - m2/2, 0)', scope)).toBeCloseTo(6, 12)
    expect(termSize('m1*max(m2 - 5, 0)', scope)).toBe(0)
    expect(termSize('abs(m1*v1 + m2*v2)', scope)).toBeCloseTo(4.2, 12)
  })

  it('reads an exact cancellation as 0 but keeps small real values', () => {
    const p = scope.m1 * scope.v1 + scope.m2 * scope.v2
    expect(Math.abs(p)).toBeLessThan(1e-12)
    expect(settleSum(p, 'ptot', scope, lookup)).toBe(0)
    expect(settleSum(p, 'm1*v1 + m2*v2', scope)).toBe(0)
    expect(settleSum(1.6e-19 * 2.5e-3, 'q*E', scope)).toBe(1.6e-19 * 2.5e-3)
    expect(settleSum(4.2 - 4.1999, 'm1*v1*0 + 4.2 - 4.1999', scope)).toBeCloseTo(1e-4, 12)
    expect(settleSum(5, 'not an expression (', scope)).toBe(5)
  })
})

describe('readout numbers', () => {
  it('uses about three significant figures when no digits are given', () => {
    expect(formatNumber(0.15)).toBe('0.150')
    expect(formatNumber(0.96)).toBe('0.960')
    expect(formatNumber(38.46)).toBe('38.5')
    expect(formatNumber(9.996)).toBe('10.0')
    expect(formatNumber(300)).toBe('300')
    expect(formatNumber(-2)).toBe('-2')
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(6.2e-21)).toBe('6.20×10⁻²¹')
    expect(formatNumber(-2.4e-5)).toBe('-2.40×10⁻⁵')
    expect(formatNumber(1.6e6)).toBe('1.60×10⁶')
    expect(formatNumber(0.00099999)).toBe('1.00×10⁻³')
    expect(formatNumber(NaN)).toBe('—')
  })

  it('rounds the decimal value, not its binary approximation', () => {
    expect(formatNumber(0.15, 1)).toBe('0.2')
    expect(formatNumber(1.005, 2)).toBe('1.01')
    expect(formatNumber(-0.25, 1)).toBe('-0.3')
    expect(formatNumber(2.5, 0)).toBe('3')
  })

  it('never rounds a non-zero value to zero', () => {
    expect(formatNumber(6.2e-21, 2)).toBe('6.20×10⁻²¹')
    expect(formatNumber(0.004, 2)).toBe('0.00400')
    expect(formatNumber(0, 2)).toBe('0.00')
  })

  it('keeps the sci mantissa below ten', () => {
    expect(formatValue(42000, 1, 'sci')).toBe('4.2×10⁴')
    expect(formatValue(99999, 2, 'sci')).toBe('1.00×10⁵')
    expect(formatValue(0.5, undefined, 'percent')).toBe('50')
  })
})
