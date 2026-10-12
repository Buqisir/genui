import { describe, expect, it } from 'vitest'
import { readNames, schematicNetlist, solveWiring, type SchematicNode } from './circuit'
import { motionValues, type MotionObject } from './motion'
import { motionSpecOf } from './solvers'
import { runTransient, transientSpec, type TransientProps } from './transient'
import { validateLesson } from './validate'

function solve(source: SchematicNode, load: SchematicNode, scope: Record<string, number> = {}) {
  const net = schematicNetlist(source, load, scope)
  const res = solveWiring(net.parts, net.wires, scope)
  const by: Record<string, number> = {}
  for (const r of readNames(net.parts)) {
    const v = res.parts[r.id]?.[r.q]
    if (v === undefined) throw new Error(`missing ${r.name}`)
    by[r.name] = v
  }
  return { by, res, net }
}

function run(source: SchematicNode, load: SchematicNode, tr: Omit<TransientProps, 'name'>, scope: Record<string, number> = {}) {
  const spec = transientSpec(source, load, { name: 'c', ...tr })
  const r = runTransient(spec, scope)
  const out = motionValues('c', spec, r, scope)
  return { c: out.c as MotionObject, out, warnings: r.warnings, run: r }
}
const f = (o: MotionObject, k: string) => o[k] as (t: number) => number

const lesson = (body: string) => ['---', 'title: t', 'demo: true', '---', body].join('\n')
const msgs = (body: string) => validateLesson(lesson(body)).errors.map((e) => e.message).join('\n')

describe('ideal transformer', () => {
  it('steps a resistive load up: U2 = k U1, n1 I1 = n2 I2, P1 = P2', () => {
    const { by, res } = solve(
      { type: 'generator', emf: 20, r: 0 },
      {
        type: 'transformer',
        n1: 2,
        n2: 5,
        read: { U1: 'U1', U2: 'U2', I1: 'I1', I2: 'I2', P: 'P1' },
        secondary: { type: 'resistor', R: 10, read: { U: 'UR', P: 'P2' } },
      },
    )
    expect(res.warnings).toEqual([])
    expect(by.U2 / by.U1).toBeCloseTo(5 / 2, 6)
    expect(2 * by.I1).toBeCloseTo(5 * by.I2, 6)
    expect(by.P1).toBeCloseTo(by.P2, 4)
    expect(by.U2).toBeCloseTo(by.UR, 6)
    expect(by.U1).toBeCloseTo(20, 3)
    expect(by.I2).toBeCloseTo(by.U2 / 10, 6)
  })

  it('transmission chain: step-up, line, step-down, against the ideal hand calculation', () => {
    // E = 100 V, step-up 1:10, line 10 Ω, step-down 10:1, load 10 Ω.
    // Referred to the line: Rload' = 10 · 10² = 1000 Ω. Iline = 1000 / 1010.
    const Rline = 10
    const Rload = 10
    const { by, res } = solve(
      { type: 'generator', emf: 100, r: 0 },
      {
        type: 'transformer',
        n1: 1,
        n2: 10,
        read: { U1: 'U1', I1: 'I1' },
        secondary: {
          series: [
            { type: 'resistor', R: Rline, read: { I: 'Iline', P: 'Ploss' } },
            {
              type: 'transformer',
              n1: 10,
              n2: 1,
              secondary: { type: 'resistor', R: Rload, read: { U: 'Uload', I: 'Iload', P: 'Pload' } },
            },
          ],
        },
      },
    )
    expect(res.warnings).toEqual([])
    const Iline = 1000 / (Rline + Rload * 100)
    const Uload = (Iline * Rload * 100) / 10
    expect(by.Iline).toBeCloseTo(Iline, 3)
    expect(by.Uload).toBeCloseTo(Uload, 2)
    expect(by.Ploss).toBeCloseTo(Iline * Iline * Rline, 3)
    expect(by.Pload).toBeCloseTo(Uload * Uload / Rload, 2)
    // The ideal source's tiny internal floor shifts the absolute volts; the ratios stay exact.
    expect(by.Uload / by.U1).toBeCloseTo(Uload / 100, 4)
  })

  it('two secondaries obey ampere-turn balance', () => {
    const { by, res } = solve(
      { type: 'generator', emf: 100, r: 0 },
      {
        type: 'transformer',
        n1: 10,
        read: { I1: 'I1', U1: 'U1', P: 'P1' },
        secondaries: [
          { n: 5, load: { type: 'resistor', R: 10, read: { I: 'Ia', U: 'Ua' } }, read: { I: 'I2', U: 'U2' } },
          { n: 20, load: { type: 'resistor', R: 40, read: { I: 'Ib' } }, read: { I: 'I3', U: 'U3' } },
        ],
      },
    )
    expect(res.warnings).toEqual([])
    expect(by.U2 / by.U1).toBeCloseTo(5 / 10, 6)
    expect(by.U3 / by.U1).toBeCloseTo(20 / 10, 6)
    expect(10 * by.I1).toBeCloseTo(5 * by.I2 + 20 * by.I3, 5)
    expect(by.Ia).toBeCloseTo(by.I2, 6)
    expect(by.P1).toBeCloseTo(by.U2 * by.I2 + by.U3 * by.I3, 3)
  })

  it('holds instantaneously for an AC source', () => {
    const { c, warnings } = run(
      { type: 'generator', emf: '10*sin(100*t)' },
      {
        type: 'transformer',
        n1: 1,
        n2: 2,
        read: { U1: 'U1', I1: 'I1' },
        secondary: { type: 'resistor', R: 10, read: { U: 'U2', I: 'I2' } },
      },
      { until: 0.05, steps: 400 },
    )
    expect(warnings).toEqual([])
    for (const t of [0.004, 0.012, 0.02]) {
      const u = 10 * Math.sin(100 * t)
      expect(f(c, 'U2')(t) / f(c, 'U1')(t)).toBeCloseTo(2, 4)
      expect(f(c, 'I1')(t)).toBeCloseTo(2 * f(c, 'I2')(t), 4)
      expect(f(c, 'U1')(t)).toBeCloseTo(u, 2)
    }
  })
})

describe('spdt', () => {
  it('charge then discharge matches the two-switch idiom', () => {
    const tr = { until: 4, steps: 800 }
    const old = run(
      { series: [{ type: 'battery', emf: 6, r: 1 }, { type: 'resistor', R: 100 }, { type: 'switch', closed: 't < 1' }] },
      {
        parallel: [
          { type: 'capacitor', C: 1e-3, read: { U: 'UC' } },
          { series: [{ type: 'switch', closed: 't >= 1' }, { type: 'resistor', R: 1000 }] },
        ],
      },
      tr,
    )
    // The throw sits in series with the capacitor, so position 1 closes battery–R–C and position 2 closes R–C.
    const spdt = run(
      { type: 'wire' },
      {
        series: [
          { type: 'capacitor', C: 1e-3, read: { U: 'UC' } },
          {
            spdt: [
              { series: [{ type: 'battery', emf: 6, r: 1, positive: 'right' }, { type: 'resistor', R: 100 }] },
              { type: 'resistor', R: 1000 },
            ],
            position: 't < 1 ? 1 : 2',
          },
        ],
      },
      tr,
    )
    expect(old.warnings).toEqual([])
    expect(spdt.warnings).toEqual([])
    const samples = [0, 0.4, 0.99, 1, 1.0000001, 1.2, 2, 3.5]
    const worst = Math.max(...samples.map((t) => Math.abs(f(spdt.c, 'UC')(t) - f(old.c, 'UC')(t))))
    // The two topologies collapse ideal wires differently, so the 1 µΩ source floor
    // leaves a fraction of a microvolt between them.
    expect(worst).toBeLessThan(1e-6)
    expect(f(spdt.c, 'UC')(0.5)).toBeCloseTo(6, 5)
    expect(f(spdt.c, 'UC')(2)).toBeCloseTo(6 * Math.exp(-1), 4)
    expect(f(spdt.c, 'UC')(3.5)).toBeCloseTo(6 * Math.exp(-2.5), 4)
  })
})

describe('current source', () => {
  it('forces U = I R through a resistor', () => {
    const { by, res } = solve(
      { type: 'currentSource', I: 2, read: { I: 'Is', U: 'Us' } },
      { type: 'resistor', R: 5, read: { U: 'U', I: 'I' } },
    )
    expect(res.warnings).toEqual([])
    expect(by.I).toBeCloseTo(2, 6)
    expect(by.U).toBeCloseTo(10, 6)
    expect(by.Is).toBeCloseTo(2, 6)
  })

  it('drives a rod at constant acceleration B I L / m', () => {
    const scope = { B: 0.5, L: 0.4 }
    const spec = motionSpecOf({
      until: 0.4,
      mass: 0.2,
      along: 0,
      state: { x: 0, v: 0 },
      forces: [{ label: 'F', angle: 0, magnitude: 'B*I*L' }],
      circuit: {
        source: { type: 'currentSource', I: 3, read: 'I' },
        load: { type: 'battery', emf: 'B*L*v', r: 0.4 },
      },
    })
    if (!spec) throw new Error('no spec')
    const runM = runTransient(spec, scope)
    const out = motionValues('rod', spec, runM, scope)
    const rod = out.rod as MotionObject
    expect(runM.warnings).toEqual([])
    const a = (0.5 * 3 * 0.4) / 0.2
    for (const t of [0.05, 0.2, 0.4]) {
      expect(f(rod, 'v')(t)).toBeCloseTo(a * t, 4)
      expect(f(rod, 'x')(t)).toBeCloseTo(0.5 * a * t * t, 4)
      expect(f(rod, 'I')(t)).toBeCloseTo(3, 6)
    }
  })
})

describe('ideal diode', () => {
  it('conducts forward and blocks reverse', () => {
    const forward = solve(
      { type: 'battery', emf: 10, r: 0 },
      { series: [{ type: 'diode', read: { I: 'Id', U: 'Ud' } }, { type: 'resistor', R: 10, read: 'I' }] },
    )
    expect(forward.res.warnings).toEqual([])
    expect(forward.by.I).toBeCloseTo(1, 4)
    expect(forward.by.Id).toBeCloseTo(1, 4)
    expect(forward.by.Ud).toBeCloseTo(0, 8)
    const reverse = solve(
      { type: 'battery', emf: 10, r: 0 },
      { series: [{ type: 'diode', reverse: true, read: { I: 'Id', U: 'Ud' } }, { type: 'resistor', R: 10 }] },
    )
    expect(reverse.res.warnings).toEqual([])
    expect(reverse.by.Id).toBeCloseTo(0, 8)
    expect(reverse.by.Ud).toBeCloseTo(10, 3)
  })

  it('two sources with diodes keep only the higher one conducting', () => {
    // Diodes point with the batteries' discharge (right→left in the load). The higher source back-biases the other.
    const { by, res } = solve(
      { type: 'resistor', R: 10, read: { I: 'IR', U: 'UR' } },
      {
        parallel: [
          { series: [{ type: 'battery', emf: 12, r: 1 }, { type: 'diode', reverse: true, read: { I: 'I12', U: 'U12' } }] },
          { series: [{ type: 'battery', emf: 6, r: 1 }, { type: 'diode', reverse: true, read: { I: 'I6', U: 'U6' } }] },
        ],
      },
    )
    expect(res.warnings).toEqual([])
    expect(by.I12).toBeCloseTo(-12 / 11, 3)
    expect(by.I6).toBeCloseTo(0, 6)
    expect(Math.abs(by.U6)).toBeGreaterThan(1)
    expect(Math.abs(by.IR)).toBeCloseTo(12 / 11, 3)
    expect(by.U12).toBeCloseTo(0, 6)
  })

  it('half-wave rectifies, switching at the emf zero crossings', () => {
    const w = 100
    const { c, warnings, run: raw } = run(
      { type: 'generator', emf: '10*sin(100*t)' },
      { series: [{ type: 'diode', read: { I: 'Id' } }, { type: 'resistor', R: 10 }] },
      { until: 0.1, steps: 2000 },
    )
    expect(warnings).toEqual([])
    for (const t of [0.004, 0.015]) expect(f(c, 'Id')(t)).toBeCloseTo(Math.sin(w * t), 3)
    for (const t of [0.04, 0.05]) expect(f(c, 'Id')(t)).toBeCloseTo(0, 6)
    const idx = raw.vars.indexOf('__d0')
    const flips: number[] = []
    for (let i = 1; i < raw.t.length; i++) {
      if (raw.s[i][idx] !== raw.s[i - 1][idx]) flips.push(raw.t[i])
    }
    const unique = [...new Set(flips.map((t) => +t.toPrecision(8)))]
    expect(unique[0]).toBeCloseTo(Math.PI / w, 6)
    expect(unique[1]).toBeCloseTo((2 * Math.PI) / w, 6)
  })
})

describe('validator', () => {
  const circuit = (source: string, load: string, extra = '') =>
    `<Circuit source={${source}} load={${load}} ${extra} />`

  it('rejects misuse of each new element', () => {
    expect(msgs(circuit('{type: "transformer", n1: 1}', '{type: "wire"}'))).toContain('n2')
    expect(msgs(circuit('{type: "transformer", n1: 0, n2: 1, secondary: {type: "wire"}}', '{type: "wire"}'))).toContain('正数')
    expect(msgs(circuit('{type: "transformer", n1: 1, n2: 1, secondary: {type: "resistor", R: 1}, read: {U: "Ux"}}', '{type: "wire"}'))).toContain('U1')
    expect(msgs(circuit('{type: "wire"}', '{spdt: [{type: "resistor", R: 1}], position: 1}'))).toContain('两个支路')
    expect(msgs(circuit('{type: "wire"}', '{spdt: [{type: "resistor", R: 1}, {type: "resistor", R: 2}], position: 4}'))).toContain('position')
    expect(msgs(circuit('{type: "currentSource"}', '{type: "resistor", R: 1}'))).toContain('电流 I')
    expect(msgs(circuit('{type: "currentSource", I: 1}', '{type: "capacitor", C: 1e-6}'))).toContain('电容')
    expect(msgs(circuit('{series: [{type: "currentSource", I: 1}, {type: "currentSource", I: 2}]}', '{type: "resistor", R: 5}'))).toContain('电流不相等')
    expect(msgs(circuit('{type: "diode", C: 1}', '{type: "resistor", R: 1}'))).toContain('C 只用于')
    expect(msgs(circuit('{type: "resistor", R: 1, reverse: true}', '{type: "wire"}'))).toContain('reverse')
    expect(
      msgs(circuit('{type: "battery", emf: 1}', '{type: "transformer", n1: 1, n2: 1, secondary: {type: "wire"}}', 'layout="ladder"')),
    ).toContain('ladder')
  })

  it('warns when a battery feeds a transformer and allows a generator', () => {
    const battery = validateLesson(lesson(circuit('{type: "battery", emf: 10}', '{type: "transformer", n1: 1, n2: 2, secondary: {type: "resistor", R: 10}}')))
    expect(battery.errors).toEqual([])
    expect(battery.warnings.map((w) => w.message).join('\n')).toContain('电池')
    const gen = validateLesson(
      lesson(circuit('{type: "generator", emf: 10, read: {I: "I"}}', '{type: "transformer", n1: 1, n2: 2, secondary: {type: "resistor", R: 10, read: {U: "U"}}}')),
    )
    expect(gen.errors).toEqual([])
    expect(gen.warnings).toEqual([])
  })

  it('accepts a current source with no battery emf', () => {
    expect(msgs(circuit('{type: "currentSource", I: 1, read: "I"}', '{type: "resistor", R: 4, read: {U: "U"}}'))).toBe('')
  })
})
