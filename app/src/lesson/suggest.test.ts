import { describe, expect, it } from 'vitest'
import { closestName } from './suggest'

describe('closestName', () => {
  it('prefers a name that differs only in case', () => {
    expect(closestName('H', ['h', 'v'])).toBe('h')
    expect(closestName('vX', ['vx', 'VX'])).toBe('vx')
  })

  it('finds a name one or two letters off', () => {
    expect(closestName('Rtotal', ['Rtot', 'I'])).toBe('Rtot')
    expect(closestName('omgea', ['omega', 'm'])).toBe('omega')
  })

  it('gives no guess when the nearest name is too far away', () => {
    expect(closestName('Rtotal', ['mass', 'velocity'])).toBeUndefined()
    expect(closestName('abcdef', ['xyzuvw'])).toBeUndefined()
  })

  it('gives no guess for a single letter', () => {
    expect(closestName('x', ['y', 'z'])).toBeUndefined()
    expect(closestName('x', ['X'])).toBe('X')
  })

  it('never returns the name itself', () => {
    expect(closestName('v', ['v'])).toBeUndefined()
    expect(closestName('Rtot', ['Rtot', 'Rtotal'])).toBe('Rtotal')
  })

  it('breaks ties in favour of the candidate that comes first', () => {
    expect(closestName('ab', ['ac', 'ad'])).toBe('ac')
    expect(closestName('ab', ['ad', 'ac'])).toBe('ad')
  })

  it('returns undefined for no candidates', () => {
    expect(closestName('Rtotal', [])).toBeUndefined()
  })
})
