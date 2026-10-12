import { describe, expect, it } from 'vitest'
import { connectedWires, readNames, schematicNetlist, solveWiring, type WiringPart, type WiringWire } from './circuit'

// 分压接法 + 电流表外接 (demo 九（续）): E = 3 V, r = 0.5 Ω, rheostat 20 Ω,
// Rx = 5 Ω, ammeter 0.1 Ω, voltmeter 3 kΩ, wires connected one at a time.
const divider: WiringPart[] = [
  { id: 'V', type: 'voltmeter', r: 3000 },
  { id: 'A', type: 'ammeter', r: 0.1 },
  { id: 'Rx', type: 'resistor', R: 5 },
  { id: 'R', type: 'rheostat', R: 20, slider: 'sd' },
  { id: 'S', type: 'switch', closed: 'sw' },
  { id: 'E', type: 'battery', emf: 3, r: 0.5 },
]
const dividerWires: WiringWire[] = [
  { from: 'E.+', to: 'R.B' },
  { from: 'R.A', to: 'S.a' },
  { from: 'S.b', to: 'E.-' },
  { from: 'R.D', to: 'A.0.6' },
  { from: 'A.-', to: 'Rx.b' },
  { from: 'Rx.a', to: 'S.a' },
  { from: 'V.3', to: 'Rx.b' },
  { from: 'V.-', to: 'Rx.a' },
]

/** The hand-derived formulas the demo lesson used before the solver existed. */
function byHand(sd: number, sw: number, wk: number) {
  const RxV = wk >= 8 ? (5 * 3000) / 3005 : 5
  const RL = 0.1 + RxV
  const Rlo = 20 * sd
  const Rp = wk >= 6 ? (Rlo * RL) / (Rlo + RL) : Rlo
  const Itot = sw > 0 ? (wk >= 3 ? 3 / (0.5 + 20 * (1 - sd) + Rp) : 0) : 0
  const IA = wk >= 6 ? (Itot * Rp) / RL : 0
  return { IA, UV: wk >= 8 ? IA * RxV : 0 }
}

describe('circuit solver', () => {
  it('matches the hand-derived divider readings at every wiring step', () => {
    for (const sd of [0, 0.3, 0.6, 1]) {
      for (const sw of [0, 1]) {
        for (let wk = 0; wk <= 8; wk++) {
          const scope = { sd, sw, wk }
          const res = solveWiring(divider, connectedWires(dividerWires, 'wk', scope), scope)
          const want = byHand(sd, sw, wk)
          expect(res.parts.A.reading).toBeCloseTo(want.IA, 5)
          expect(res.parts.V.reading).toBeCloseTo(want.UV, 5)
          expect(res.warnings).toEqual([])
        }
      }
    }
  })

  it('limiting circuit with ideal meters gives E/(R+r) and the slider sets R', () => {
    const parts: WiringPart[] = [
      { id: 'E', type: 'battery', emf: 3, r: 1 },
      { id: 'A', type: 'ammeter' },
      { id: 'V', type: 'voltmeter' },
      { id: 'Rx', type: 'resistor', R: 5 },
      { id: 'R', type: 'rheostat', R: 20, slider: 0.5 },
    ]
    const wires: WiringWire[] = [
      { from: 'E.+', to: 'R.A' },
      { from: 'R.C', to: 'A.0.6' },
      { from: 'A.-', to: 'Rx.b' },
      { from: 'Rx.a', to: 'E.-' },
      { from: 'V.3', to: 'Rx.b' },
      { from: 'V.-', to: 'Rx.a' },
    ]
    const res = solveWiring(parts, wires, {})
    expect(res.parts.A.reading).toBeCloseTo(3 / 16, 6)
    expect(res.parts.V.reading).toBeCloseTo((3 / 16) * 5, 6)
    expect(res.parts.E.U).toBeCloseTo(3 - 3 / 16, 6)
    expect(res.parts.R.I).toBeCloseTo(3 / 16, 6)
    expect(res.parts.A.range).toBe(0.6)
  })

  it('warns about a reversed meter and an exceeded range', () => {
    const parts: WiringPart[] = [
      { id: 'E', type: 'battery', emf: 6, r: 0 },
      { id: 'A', type: 'ammeter' },
      { id: 'Rx', type: 'resistor', R: 5 },
    ]
    const reversed = solveWiring(parts, [
      { from: 'E.+', to: 'A.-' },
      { from: 'A.0.6', to: 'Rx.a' },
      { from: 'Rx.b', to: 'E.-' },
    ], {})
    expect(reversed.parts.A.reading).toBeCloseTo(-1.2, 6)
    expect(reversed.warnings.some((w) => w.includes('接反'))).toBe(true)
    const over = solveWiring(parts, [
      { from: 'E.+', to: 'A.0.6' },
      { from: 'A.-', to: 'Rx.a' },
      { from: 'Rx.b', to: 'E.-' },
    ], {})
    expect(over.warnings.some((w) => w.includes('超过所接量程'))).toBe(true)
  })

  it('flags a short circuit through an ammeter and a battery wired to itself', () => {
    const parts: WiringPart[] = [
      { id: 'E', type: 'battery', emf: 3 },
      { id: 'A', type: 'ammeter', ranges: [3] },
    ]
    const res = solveWiring(parts, [
      { from: 'E.+', to: 'A.3' },
      { from: 'A.-', to: 'E.-' },
    ], {})
    expect(res.warnings.some((w) => w.includes('短路'))).toBe(true)
    const self = solveWiring([{ id: 'E', type: 'battery', emf: 3 }], [{ from: 'E.+', to: 'E.-' }], {})
    expect(self.warnings[0]).toContain('短路')
    // With an internal resistance the short still has a current, E/r.
    const real = solveWiring([{ id: 'E', type: 'battery', emf: 3, r: 1.5 }], [{ from: 'E.+', to: 'E.-' }], {})
    expect(real.parts.E.I).toBeCloseTo(2, 9)
    expect(real.parts.E.U).toBe(0)
    expect(real.warnings[0]).toContain('E/r ≈ 2 A')
  })

  it('open switch, lamp brightness, galvanometer deflection', () => {
    const parts: WiringPart[] = [
      { id: 'E', type: 'battery', emf: 3, r: 0 },
      { id: 'S', type: 'switch', closed: 'on' },
      { id: 'G', type: 'galvanometer', r: 100, full: 0.001 },
      { id: 'RB', type: 'resistanceBox', value: 2900 },
      { id: 'L', type: 'lamp', R: 0, power: 1 },
    ]
    const wires: WiringWire[] = [
      { from: 'E.+', to: 'S.a' },
      { from: 'S.b', to: 'G.+' },
      { from: 'G.-', to: 'L.b' },
      { from: 'L.a', to: 'RB.b' },
      { from: 'RB.a', to: 'E.-' },
    ]
    const off = solveWiring(parts, wires, { on: 0 })
    expect(off.parts.G.I).toBeCloseTo(0, 12)
    expect(off.parts.L.lit).toBe(0)
    const on = solveWiring(parts, wires, { on: 1 })
    expect(on.parts.G.deflect).toBeCloseTo(1, 4)
  })

  it('publishes read names', () => {
    expect(readNames([
      { id: 'A', type: 'ammeter', read: 'IA' },
      { id: 'L', type: 'lamp', read: { U: 'UL', P: 'PL' } },
    ])).toEqual([
      { name: 'IA', id: 'A', q: 'reading' },
      { name: 'UL', id: 'L', q: 'U' },
      { name: 'PL', id: 'L', q: 'P' },
    ])
  })
})

describe('schematic solver', () => {
  it('solves a series/parallel tree with repeats, meters and an open capacitor branch', () => {
    // E = 12 V, r = 1 Ω; load: ammeter, then 3 × 6 Ω in parallel (2 Ω), then 3 Ω,
    // with a capacitor branch across the 3 Ω that carries no steady current.
    const source = { type: 'battery', emf: 12, r: 1 }
    const load = {
      series: [
        { type: 'ammeter', read: 'I' },
        { repeat: 'n', item: { type: 'resistor', R: 6, read: { I: 'I1' } } },
        { parallel: [{ type: 'resistor', R: 3, read: { U: 'U3' } }, { type: 'capacitor' }] },
      ],
    }
    const net = schematicNetlist(source, load, { n: 3 })
    const res = solveWiring(net.parts, net.wires, { n: 3 })
    const byRead = Object.fromEntries(readNames(net.parts).map((r) => [r.name, res.parts[r.id][r.q]]))
    expect(byRead.I).toBeCloseTo(2, 5)
    expect(byRead.I1).toBeCloseTo(2 / 3, 5)
    expect(byRead.U3).toBeCloseTo(6, 5)
    expect(readNames(net.parts)).toHaveLength(3)
    expect(res.warnings).toEqual([])
  })

  it('a bare wire across a battery with internal resistance is a drawn loop: I = E/r, no warning', () => {
    const net = schematicNetlist({ type: 'battery', emf: 1, r: 0.5, read: { I: 'I', U: 'U' } }, { type: 'wire' }, {})
    const res = solveWiring(net.parts, net.wires, {})
    const byRead = Object.fromEntries(readNames(net.parts).map((r) => [r.name, res.parts[r.id][r.q]]))
    expect(byRead.I).toBeCloseTo(2, 9)
    expect(byRead.U).toBe(0)
    expect(res.warnings).toEqual([])
    const ideal = schematicNetlist({ type: 'battery', emf: 1 }, { type: 'wire' }, {})
    expect(solveWiring(ideal.parts, ideal.wires, {}).warnings[0]).toContain('短路')
  })

  it('a battery with positive on the right drives current right to left', () => {
    const net = schematicNetlist({ type: 'battery', emf: 3, r: 0, positive: 'right' }, { type: 'resistor', R: 3, read: 'I' }, {})
    const res = solveWiring(net.parts, net.wires, {})
    expect(res.parts[readNames(net.parts)[0].id].I).toBeCloseTo(-1, 6)
  })

  it('meters and elements in the source chain read positive along the normal current', () => {
    // E = 6 V, r = 1 Ω, a 1 Ω resistor in the source chain and a 4 Ω load: I = 1 A.
    const source = (positive?: 'right') => ({
      series: [
        { parallel: [{ type: 'battery', emf: 6, r: 1, positive }, { type: 'voltmeter', read: 'Ut' }] },
        { type: 'ammeter', read: 'I' },
        { parallel: [{ type: 'resistor', R: 1, read: { I: 'Ir', U: 'UrR' } }, { type: 'voltmeter', read: 'Ur' }] },
      ],
    })
    const solve = (positive?: 'right') => {
      const net = schematicNetlist(source(positive), { type: 'resistor', R: 4, read: { I: 'IL' } }, {})
      const res = solveWiring(net.parts, net.wires, {})
      return { by: Object.fromEntries(readNames(net.parts).map((r) => [r.name, res.parts[r.id][r.q]])), warnings: res.warnings }
    }
    const { by, warnings } = solve()
    expect(by.I).toBeCloseTo(1, 6)
    expect(by.IL).toBeCloseTo(1, 6)
    expect(by.Ut).toBeCloseTo(5, 6)
    expect(by.Ir).toBeCloseTo(1, 6)
    expect(by.UrR).toBeCloseTo(1, 6)
    expect(by.Ur).toBeCloseTo(1, 6)
    expect(warnings).toEqual([])
    // Reversing the battery reverses the current, but the voltmeter across it still follows its + side.
    const flipped = solve('right').by
    expect(flipped.I).toBeCloseTo(-1, 6)
    expect(flipped.IL).toBeCloseTo(-1, 6)
    expect(flipped.Ut).toBeCloseTo(5, 6)
  })
})
