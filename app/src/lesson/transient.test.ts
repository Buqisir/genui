import { describe, expect, it } from 'vitest'
import { schematicNetlist, solveWiring, type SchematicNode } from './circuit'
import { validateLesson } from './validate'
import { motionValues, type MotionObject } from './motion'
import { runTransient, transientSpec, type TransientProps } from './transient'

function run(source: SchematicNode, load: SchematicNode, tr: Omit<TransientProps, 'name'>, scope = {}) {
  const spec = transientSpec(source, load, { name: 'c', ...tr })
  const r = runTransient(spec, scope)
  const out = motionValues('c', spec, r, scope)
  return { c: out.c as MotionObject, out, warnings: r.warnings }
}
const f = (o: MotionObject, k: string) => o[k] as (t: number) => number

describe('circuit transients', () => {
  it('RC charging follows U = E(1 − e^(−t/RC))', () => {
    const { c, warnings } = run(
      { series: [{ type: 'battery', emf: 6 }, { type: 'switch', closed: 't > 0' }] },
      { series: [{ type: 'resistor', R: 1000 }, { type: 'capacitor', C: 1e-3, read: { U: 'UC', I: 'IC', Q: 'QC' } }] },
      { until: 5 },
    )
    expect(warnings).toEqual([])
    for (const t of [0.3, 1, 2.5]) {
      expect(f(c, 'UC')(t)).toBeCloseTo(6 * (1 - Math.exp(-t)), 5)
      expect(f(c, 'IC')(t)).toBeCloseTo(0.006 * Math.exp(-t), 8)
      expect(f(c, 'QC')(t)).toBeCloseTo(6e-3 * (1 - Math.exp(-t)), 8)
    }
    expect(f(c, 'UC')(0)).toBe(0)
  })

  it('a capacitor charged before t = 0 discharges through R once the switch flips', () => {
    const { c, out } = run(
      { series: [{ type: 'battery', emf: 6 }, { type: 'resistor', R: 100 }, { type: 'switch', closed: 't < 1' }] },
      {
        parallel: [
          { type: 'capacitor', C: 1e-3, read: { U: 'UC' } },
          { series: [{ type: 'switch', closed: 't >= 1' }, { type: 'resistor', R: 1000, read: 'IR' }] },
        ],
      },
      { until: 4, events: [{ name: 'tHalf', when: 'UC - 3', dir: 'down' }], read: { Imax: 'max(IR)' } },
    )
    expect(f(c, 'UC')(0.5)).toBeCloseTo(6, 6)
    expect(f(c, 'IR')(0.5)).toBeCloseTo(0, 9)
    for (const t of [1.2, 2, 3.5]) expect(f(c, 'UC')(t)).toBeCloseTo(6 * Math.exp(-(t - 1)), 5)
    expect(out.tHalf).toBeCloseTo(1 + Math.LN2, 6)
    expect(out.Imax).toBeCloseTo(0.006, 6)
  })

  it('RL: current rises as I = E/R (1 − e^(−Rt/L))', () => {
    const { c } = run(
      { series: [{ type: 'battery', emf: 6 }, { type: 'switch', closed: 't > 0' }] },
      { series: [{ type: 'resistor', R: 2 }, { type: 'inductor', L: 1, read: { I: 'IL', U: 'UL' } }] },
      { until: 3 },
    )
    for (const t of [0.1, 0.5, 2]) {
      expect(f(c, 'IL')(t)).toBeCloseTo(3 * (1 - Math.exp(-2 * t)), 5)
      expect(f(c, 'UL')(t)).toBeCloseTo(6 * Math.exp(-2 * t), 5)
    }
  })

  it('opening the switch: the lamp beside the coil carries the coil current backwards', () => {
    const { c } = run(
      { series: [{ type: 'battery', emf: 6 }, { type: 'switch', closed: 't < 0.5' }] },
      { parallel: [{ type: 'lamp', R: 10, read: 'IA' }, { type: 'inductor', L: 0.2, r: 2, read: 'IL' }] },
      { until: 1 },
    )
    // Ideal parts carry a 1 µΩ floor, hence 5 digits rather than exact.
    expect(f(c, 'IL')(0.2)).toBeCloseTo(3, 5)
    expect(f(c, 'IA')(0.2)).toBeCloseTo(0.6, 6)
    // Just after opening: the lamp current jumps from 0.6 A to −3 A, then decays with τ = L/(R + r).
    expect(f(c, 'IA')(0.5 + 1e-7)).toBeCloseTo(-3, 4)
    const tau = 0.2 / 12
    for (const dt of [0.01, 0.03]) expect(f(c, 'IL')(0.5 + dt)).toBeCloseTo(3 * Math.exp(-dt / tau), 5)
  })

  it('LC oscillation: period 2π√(LC)', () => {
    const { c, out } = run(
      { series: [{ type: 'battery', emf: 6 }, { type: 'resistor', R: 1 }, { type: 'switch', closed: 't < 0' }] },
      { parallel: [{ type: 'capacitor', C: 1e-3, U0: 5, read: { U: 'UC' } }, { type: 'inductor', L: 0.1, I0: 0, read: 'IL' }] },
      { until: 0.2, steps: 2000, events: [{ name: 'tZero', when: 'UC', dir: 'down' }] },
    )
    const w = 1 / Math.sqrt(0.1 * 1e-3)
    expect(out.tZero).toBeCloseTo(Math.PI / 2 / w, 6)
    for (const t of [0.01, 0.05, 0.13]) expect(f(c, 'UC')(t)).toBeCloseTo(5 * Math.cos(w * t), 4)
    // Energy moves between the plates and the coil: ½CU0² = ½L·Imax².
    expect(Math.abs(f(c, 'IL')(Math.PI / 2 / w))).toBeCloseTo(5 * Math.sqrt(1e-3 / 0.1), 4)
  })

  it('sine source on RC: steady amplitude E/√(1 + (ωRC)²), lagging by atan(ωRC)', () => {
    const { c } = run(
      { type: 'generator', emf: '10*sin(100*t)' },
      { series: [{ type: 'resistor', R: 100 }, { type: 'capacitor', C: 1e-4, read: { U: 'UC' } }] },
      { until: 1, steps: 4000 },
    )
    for (const t of [0.9, 0.93]) expect(f(c, 'UC')(t)).toBeCloseTo((10 / Math.SQRT2) * Math.sin(100 * t - Math.PI / 4), 4)
  })

  it('a purely resistive AC circuit follows the source instant by instant', () => {
    const { c, warnings } = run(
      { type: 'generator', emf: '10*sqrt(2)*sin(100*pi*t)' },
      { type: 'resistor', R: 50, read: { U: 'uR', I: 'iR', P: 'pR' } },
      { until: 0.04, steps: 800 },
    )
    expect(warnings).toEqual([])
    for (const t of [0.005, 0.0123, 0.031]) {
      const u = 10 * Math.SQRT2 * Math.sin(100 * Math.PI * t)
      expect(f(c, 'uR')(t)).toBeCloseTo(u, 4)
      expect(f(c, 'iR')(t)).toBeCloseTo(u / 50, 6)
      expect(f(c, 'pR')(t)).toBeCloseTo((u * u) / 50, 4)
    }
  })

  it('validator: transient rules, local t and read names, published object', () => {
    const lesson = (circuit: string, extra = '') =>
      ['---', 'id: t', 'title: t', 'subject: physics', 'topic: t', 'source: t', 'question: q', 'demo: true', '---', '<Param name="tk" value={0} min={0} max={3} step={0.01} label="t" />', circuit, extra].join('\n')
    const ok =
      '<Circuit source={{series: [{type: "battery", emf: 6}, {type: "switch", closed: "t > 0"}]}} load={{series: [{type: "resistor", R: 1000}, {type: "capacitor", C: 0.001, read: {U: "UC", Q: "QC"}, note: {expr: "UC", unit: "V"}}]}} transient={{name: "rc", until: 5, at: "tk", events: [{name: "tHalf", when: "UC - 3", dir: "up"}], read: {Q5: "QC @ tEnd"}}} />'
    const v = (c: string, extra = '') => validateLesson(lesson(c, extra))
    const msgs = (c: string, extra = '') => v(c, extra).errors.map((e) => e.message).join('\n')
    expect(msgs(ok, '<Readout items={[{label: "U", expr: "rc.UC(tk)"}, {label: "t", expr: "tHalf"}, {label: "Q", expr: "Q5"}]} />')).toBe('')
    expect(v(ok).warnings).toEqual([])
    expect(msgs(ok.replace(', at: "tk"', ', at: "t"'))).toContain('transient.at 引用了未声明的名字 t')
    expect(msgs(ok.replace('C: 0.001, ', ''))).toContain('电容 C')
    const resistive = ok.replace('{type: "capacitor"', '{type: "resistor"').replace(', Q: "QC"', '')
    // A timed switch (or an AC emf) still varies with t, so a resistor-only transient is fine; a fixed one is not.
    expect(msgs(resistive)).not.toContain('需要电路随时间变化')
    expect(msgs(resistive.replace('closed: "t > 0"', 'closed: true'))).toContain('需要电路随时间变化')
    expect(msgs('<Circuit source={{type: "generator", emf: "10*sin(100*t)"}} load={{type: "resistor", R: 50, read: {U: "uR"}}} transient={{name: "ac", until: 0.1, at: "tk"}} />')).toBe('')
    expect(msgs(ok.replace('read: {U: "UC", Q: "QC"}', 'read: {Q: "QC"}, L: 1'))).toContain('L 只用于 inductor')
    expect(msgs(ok.replace(' transient={{name: "rc", until: 5, at: "tk", events: [{name: "tHalf", when: "UC - 3", dir: "up"}], read: {Q5: "QC @ tEnd"}}}', ''))).toContain('引用了未声明的名字 t')
    expect(msgs('<Circuit source={{type: "battery", emf: 6}} load={{repeat: 2, item: {type: "capacitor", C: 1}}} transient={{name: "rc", until: 1}} />')).toContain('不能放在 repeat 里')
  })

  it('a steady DC circuit reports the capacitor voltage and charge', () => {
    // E = 6 V, r = 1 Ω, R1 = 2 Ω in series with (R2 = 3 Ω ∥ C): U_C = 6·3/6 = 3 V, Q = 3 × 10 µF.
    const net = schematicNetlist(
      { type: 'battery', emf: 6, r: 1 },
      { series: [{ type: 'resistor', R: 2 }, { parallel: [{ type: 'resistor', R: 3 }, { type: 'capacitor', C: 1e-5, read: { U: 'UC', Q: 'QC', I: 'IC' } }] }] },
      {},
    )
    const res = solveWiring(net.parts, net.wires, {})
    const cap = res.parts[net.parts.find((p) => p.type === 'capacitor')!.id]
    expect(cap.U).toBeCloseTo(3, 9)
    expect(cap.Q).toBeCloseTo(3e-5, 12)
    expect(cap.I).toBe(0)
  })

  it('warns when the time constant is far below the step', () => {
    const { warnings } = run({ type: 'battery', emf: 6 }, { series: [{ type: 'switch', closed: 't > 0' }, { type: 'capacitor', C: 1e-6 }] }, { until: 1 })
    expect(warnings.some((w) => w.includes('时间常数'))).toBe(true)
  })
})
