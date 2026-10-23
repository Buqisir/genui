import { describe, expect, it } from 'vitest'
import { colGap, columnWidths, detectLayout, groupTop, placeComps, rowGeom, soloWidth, zoneOf, type LayoutInput } from './layout'

const step = (names: (string | [string, Record<string, unknown>])[], frame?: string): LayoutInput => ({
  frame,
  comps: names.map((n) => (typeof n === 'string' ? { block: { name: n, props: {} } } : { block: { name: n[0], props: n[1] } })),
})

describe('detectLayout', () => {
  it('result: has a Result', () => expect(detectLayout(step(['Result', 'Def']))).toBe('result'))
  it('grid: has a Homework', () => expect(detectLayout(step(['Homework']))).toBe('grid'))
  it('fill: has a Fill, even with a picture', () => expect(detectLayout(step(['Collision', 'Fill']))).toBe('fill'))
  it('example: Stem with a picture', () => expect(detectLayout(step(['Stem', 'Collision', 'Choice']))).toBe('example'))
  it('quiz: Stem without a picture', () => expect(detectLayout(step(['Stem', 'Choice']))).toBe('quiz'))
  it('lab: picture and a Lab (also filled)', () => {
    expect(detectLayout(step(['Collision', 'Lab']))).toBe('lab')
    expect(detectLayout(step(['Sim', ['Lab', { filled: true }]]))).toBe('lab')
  })
  it('derive: no picture, Work with blocks', () => expect(detectLayout(step([['Work', { blocks: [{ title: 'a' }] }], 'Choice']))).toBe('derive'))
  it('a Work with only lines is not derive', () => expect(detectLayout(step([['Work', { lines: [] }], 'Choice']))).toBe('pic'))
  it('def: picture and a Def, no Choice', () => expect(detectLayout(step(['Figure', 'Def']))).toBe('def'))
  it('def with a Choice falls to pic', () => expect(detectLayout(step(['Figure', 'Def', 'Choice']))).toBe('pic'))
  it('pic: picture and a Choice', () => expect(detectLayout(step(['Sim', 'Choice']))).toBe('pic'))
  it('pic: only a picture', () => expect(detectLayout(step(['Circuit']))).toBe('pic'))
  it('the order decides: Stem and Lab with a picture is example', () => expect(detectLayout(step(['Stem', 'Sim', 'Lab']))).toBe('example'))
  it('frame overrides', () => {
    expect(detectLayout(step(['Stem', 'Choice'], 'lab'))).toBe('lab')
    expect(detectLayout(step(['Sim'], 'result'))).toBe('result')
  })
  it('an unknown frame is ignored', () => expect(detectLayout(step(['Stem', 'Choice'], 'wide'))).toBe('quiz'))
})

describe('zones', () => {
  it('pictures and stems left, choices right, Fill/Result/Homework span', () => {
    expect(zoneOf('Collision', 'lab')).toBe('left')
    expect(zoneOf('Stem', 'quiz')).toBe('left')
    expect(zoneOf('Choice', 'pic')).toBe('right')
    expect(zoneOf('Lab', 'lab')).toBe('right')
    expect(zoneOf('Fill', 'fill')).toBe('span')
    expect(zoneOf('Result', 'result')).toBe('span')
    expect(zoneOf('Homework', 'grid')).toBe('span')
    expect(zoneOf('Conclude', 'pic')).toBe('none')
  })
  it('Work is left only in derive', () => {
    expect(zoneOf('Work', 'derive')).toBe('left')
    expect(zoneOf('Work', 'example')).toBe('right')
  })
  it('placeComps splits in order', () => {
    const z = placeComps([{ block: { name: 'Stem' } }, { block: { name: 'Choice' } }, { block: { name: 'Sim' } }], 'example')
    expect(z.left.map((c) => c.block.name)).toEqual(['Stem', 'Sim'])
    expect(z.right.map((c) => c.block.name)).toEqual(['Choice'])
  })
})

describe('geometry', () => {
  it('right widths follow the spec at B = 17.3 (1440)', () => {
    const B = 17.28
    const w = (k: Parameters<typeof columnWidths>[0]) => columnWidths(k, 940, B, 64).rc
    expect(w('pic')).toBe(363)
    expect(w('def')).toBe(415)
    expect(w('lab')).toBe(449)
    expect(soloWidth('result', 940, B)).toBe(553)
    expect(columnWidths('quiz', 940, B, 64).lw).toBe(484)
    expect(columnWidths('pic', 940, B, 64).lw).toBe(940 - 363 - 64)
  })
  it('column gap: s7 from 1280, s6 below', () => {
    expect(colGap(1440)).toBe(64)
    expect(colGap(1100)).toBe(40)
  })
  it('right column is centred on the picture stack, not the play bar', () => {
    const g = rowGeom({ left: 100, right: 400, picture: 300, gap: 24, bar: 40 })
    expect(g.rt).toBe(12)
    expect(g.lt).toBe(0)
    const g2 = rowGeom({ left: 0, right: 200, picture: 300, gap: 24, bar: 40 })
    expect(g2.rt).toBe(50)
    expect(g2.h).toBe(340)
  })
  it('fill aligns the tops', () => {
    const g = rowGeom({ left: 300, right: 100, picture: 0, gap: 24, bar: 40, topAlign: true })
    expect(g.lt).toBe(0)
    expect(g.rt).toBe(0)
  })
  it('group top: centre at 0.42H, clamped', () => {
    expect(groupTop(500, 100)).toBeCloseTo(160)
    expect(groupTop(500, 400)).toBeCloseTo(10)
    expect(groupTop(500, 520)).toBe(0)
  })
})
