import { describe, expect, it } from 'vitest'
import type { Scope } from './expr'
import { motionValues, type MotionObject } from './motion'
import { motionSpecOf } from './solvers'
import { runTransient } from './transient'
import { validateLesson } from './validate'

const g = 10

function simulate(props: Record<string, unknown>, scope: Scope = {}) {
  const spec = motionSpecOf(props)
  if (!spec) throw new Error('no spec')
  const run = runTransient(spec, scope)
  const out = motionValues('rod', spec, run, scope)
  return { rod: out.rod as MotionObject, out, warnings: run.warnings }
}
const f = (o: MotionObject, k: string) => o[k] as (t: number) => number

describe('induction: motion coupled to a circuit', () => {
  const rod = {
    B: 1,
    L: 0.5,
    m: 0.1,
    R: 0.4,
    r: 0.1,
    F: 0.5,
  }
  // vm = F·Rtot/(B²L²) = 1, τ = m·Rtot/(B²L²) = 0.2. I = BLv/Rtot = v.
  const vm = 1
  const tau = 0.2

  it('constant force: v, x and I approach the terminal speed', () => {
    const { rod: o, warnings } = simulate(
      {
        until: 2,
        mass: 'm',
        along: 0,
        state: { x: 0, v: 0 },
        forces: [
          { label: 'F', angle: 0, magnitude: 'F' },
          { label: 'FA', angle: 180, magnitude: 'B*I*L' },
        ],
        circuit: {
          source: { type: 'battery', emf: 'B*L*v', r: 'r', read: 'I' },
          load: { type: 'resistor', R: 'R', read: { U: 'UR' } },
        },
      },
      rod,
    )
    expect(warnings).toEqual([])
    for (const t of [0.1, 0.4, 1.5]) {
      const v = vm * (1 - Math.exp(-t / tau))
      const x = vm * (t - tau * (1 - Math.exp(-t / tau)))
      expect(f(o, 'v')(t)).toBeCloseTo(v, 5)
      expect(f(o, 'x')(t)).toBeCloseTo(x, 5)
      expect(f(o, 'I')(t)).toBeCloseTo((rod.B * rod.L * v) / (rod.R + rod.r), 5)
      expect(f(o, 'UR')(t)).toBeCloseTo(f(o, 'I')(t) * rod.R, 5)
    }
  })

  it('coasts to a stop: charge is m·v0/(BL) and the heat is the lost kinetic energy', () => {
    const v0 = 2
    const { rod: o, warnings } = simulate(
      {
        until: 3,
        mass: 'm',
        along: 0,
        state: { x: 0, v: v0, q: 0, Q: 0 },
        rates: { q: 'I', Q: 'I^2*0.5' },
        forces: [{ label: 'FA', angle: 180, magnitude: 'B*I*L' }],
        circuit: {
          source: { type: 'battery', emf: 'B*L*v', r: 'r', read: 'I' },
          load: { type: 'resistor', R: 'R' },
        },
      },
      rod,
    )
    expect(warnings).toEqual([])
    for (const t of [0.1, 0.4, 1.2]) expect(f(o, 'v')(t)).toBeCloseTo(v0 * Math.exp(-t / tau), 5)
    expect(f(o, 'x')(3)).toBeCloseTo(v0 * tau, 5)
    expect(f(o, 'q')(3)).toBeCloseTo((rod.m * v0) / (rod.B * rod.L), 5)
    expect(f(o, 'Q')(3)).toBeCloseTo(0.5 * rod.m * v0 * v0, 5)
  })

  it('incline with friction: terminal speed uses mg(sinθ − μ cosθ), and N = mg cosθ', () => {
    const th = (30 * Math.PI) / 180
    const Rtot = 0.5
    const speed = (rod.m * g * (Math.sin(th) - 0.2 * Math.cos(th)) * Rtot) / (rod.B * rod.L) ** 2
    const { rod: o, warnings } = simulate(
      {
        until: 2,
        mass: 'm',
        along: -30,
        state: { x: 0, v: 0 },
        forces: [
          { label: 'G', angle: -90, magnitude: 'm*g' },
          { label: 'N', angle: 60, solve: 'N' },
          { label: 'FA', angle: 150, magnitude: 'B*I*L' },
          { label: 'f', friction: { mu: 0.2, normal: 'N' } },
        ],
        circuit: {
          // Rails joined by a bare wire: the rod's own resistance is the whole loop resistance.
          source: { type: 'battery', emf: 'B*L*v', r: Rtot, read: 'I' },
          load: { type: 'wire' },
        },
      },
      { ...rod, g },
    )
    expect(warnings).toEqual([])
    for (const t of [0.15, 0.5, 1.4]) expect(f(o, 'v')(t)).toBeCloseTo(speed * (1 - Math.exp(-t / tau)), 5)
    expect(f(o, 'N')(0.4)).toBeCloseTo(rod.m * g * Math.cos(th), 5)
    expect(speed).toBeCloseTo(0.6536, 3)
  })

  it('two rods: momentum is conserved and the relative speed decays to a common velocity', () => {
    const B = 1
    const L = 0.5
    const m1 = 0.1
    const m2 = 0.2
    const v0 = 2
    const Rtot = 0.5
    const mu = (m1 * m2) / (m1 + m2)
    const taur = (mu * Rtot) / (B * L) ** 2
    const common = (m1 * v0) / (m1 + m2)
    const { rod: o, warnings } = simulate(
      {
        until: 3,
        bodies: [
          { name: 'A', mass: m1, along: 0, x: 0, v: v0, forces: [{ label: 'FA', angle: 180, magnitude: 'B*I*L' }] },
          { name: 'B', mass: m2, along: 0, x: 0, v: 0, forces: [{ label: 'FB', angle: 0, magnitude: 'B*I*L' }] },
        ],
        state: { Q: 0 },
        rates: { Q: 'I^2*0.5' },
        circuit: {
          source: {
            series: [
              { type: 'battery', emf: 'B*L*vA', r: 0.2, read: 'I' },
              { type: 'battery', emf: 'B*L*vB', r: 0.3, positive: 'right' },
            ],
          },
          load: { type: 'wire' },
        },
      },
      { B, L },
    )
    expect(warnings).toEqual([])
    expect(taur).toBeCloseTo(0.1333, 3)
    for (const t of [0, 0.05, 0.2, 0.8, 2.5]) {
      const dv = v0 * Math.exp(-t / taur)
      expect(m1 * f(o, 'vA')(t) + m2 * f(o, 'vB')(t)).toBeCloseTo(m1 * v0, 5)
      expect(f(o, 'vA')(t) - f(o, 'vB')(t)).toBeCloseTo(dv, 5)
    }
    expect(f(o, 'vA')(3)).toBeCloseTo(common, 5)
    expect(f(o, 'vB')(3)).toBeCloseTo(common, 5)
    expect(f(o, 'Q')(3)).toBeCloseTo(0.5 * m1 * v0 * v0 - 0.5 * (m1 + m2) * common * common, 4)
  })

  it('rod and capacitor: after the fast transient the acceleration is F/(m + B²L²C)', () => {
    const m = 0.1
    const B = 1
    const L = 0.5
    const F = 0.5
    const C = 0.5
    const aInf = F / (m + B * B * L * L * C)
    const { rod: o, warnings } = simulate(
      {
        until: 1,
        steps: 2000,
        mass: m,
        along: 0,
        state: { x: 0, v: 0 },
        forces: [
          { label: 'F', angle: 0, magnitude: F },
          { label: 'FA', angle: 180, magnitude: 'B*I*L' },
        ],
        circuit: {
          source: { type: 'battery', emf: 'B*L*v', r: 0.05, read: 'I' },
          load: { type: 'capacitor', C, read: { U: 'UC' } },
        },
      },
      { B, L },
    )
    expect(warnings).toEqual([])
    const a = (f(o, 'v')(0.8) - f(o, 'v')(0.6)) / 0.2
    expect(a).toBeCloseTo(aInf, 4)
    expect(f(o, 'I')(0.8)).toBeCloseTo(C * B * L * aInf, 4)
  })

  it('a switch closes at a time, or at the same instant written as a position', () => {
    const v0 = 2
    const run = (closed: string) =>
      simulate(
        {
          until: 2,
          mass: 'm',
          along: 0,
          state: { x: 0, v: v0 },
          forces: [{ label: 'FA', angle: 180, magnitude: 'B*I*L' }],
          circuit: {
            // Only the switch across the rod: once closed, the rod's resistance alone limits the current.
            source: { type: 'battery', emf: 'B*L*v', r: 0.5, read: 'I' },
            load: { type: 'switch', closed },
          },
        },
        rod,
      )
    const want = (t: number) => (t < 0.5 ? v0 : v0 * Math.exp(-(t - 0.5) / tau))
    for (const closed of ['t >= 0.5', 'x >= 1']) {
      const { rod: o, warnings } = run(closed)
      expect(warnings).toEqual([])
      for (const t of [0.3, 0.7, 1.2]) expect(f(o, 'v')(t)).toBeCloseTo(want(t), 5)
    }
  })

  it('validator: coupled circuit, motion drawing, and the names each side may use', () => {
    const lesson = (motion: string, extra = '') =>
      ['---', 'id: t', 'title: t', 'subject: physics', 'topic: t', 'source: t', 'question: q', 'demo: true', '---', '<Param name="tk" value={0.2} min={0} max={2} step={0.01} label="时刻" />', motion, extra].join('\n')
    const ok =
      '<Motion name="rod" until={2} mass={0.1} along={0} state={{x: 0, v: 0, q: 0}} rates={{q: "I"}} forces={[{label: "F", angle: 0, magnitude: 0.5}, {label: "FA", angle: 180, magnitude: "0.5*I"}]} circuit={{source: {type: "battery", emf: "0.5*v", r: 0.1, read: "I"}, load: {type: "resistor", R: 0.4, read: {U: "UR"}, note: {expr: "I", unit: "A"}}}} read={{vm: "v @ tEnd"}} />'
    const v = (motion: string, extra = '') => validateLesson(lesson(motion, extra))
    const msgs = (motion: string, extra = '') => v(motion, extra).errors.map((e) => e.message).join('\n')
    const good = v(ok, '<Circuit title="等效电路" motion="rod" at="tk" />\n<Readout items={[{label: "电流", expr: "rod.I(tk)", unit: "A"}]} />')
    expect(good.errors).toEqual([])
    expect(good.warnings).toEqual([])
    expect(msgs(ok.replace('emf: "0.5*v"', 'emf: "acc"'))).toContain('不能用 acc')
    const solved =
      '<Motion name="rod" until={2} mass={0.1} along={0} state={{x: 0, v: 0}} forces={[{label: "G", angle: -90, magnitude: 1}, {label: "N", angle: 90, solve: "N"}, {label: "FA", angle: 180, magnitude: 0.5}]} circuit={{source: {type: "battery", emf: "N", r: 0.1, read: "I"}, load: {type: "wire"}}} />'
    expect(msgs(solved)).toContain('不能用 N')
    expect(msgs(ok.replace('read: "I"', 'read: "v"'))).toContain('与状态量重名')
    expect(msgs(solved.replace('emf: "N"', 'emf: "0.5*v"').replace('read: "I"', 'read: "N"'))).toContain('与受力解出的量重名')
    expect(msgs(ok, '<Circuit motion="nope" />')).toContain('motion="nope"')
    expect(msgs(ok, '<Circuit motion="rod" source={{type: "battery", emf: 1}} load={{type: "wire"}} />')).toContain('二选一')
    expect(msgs(ok)).toBe('')
  })
})
