import { buildRuntime } from '../sim/buildRuntime'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import vm from 'node:vm'
import { describe, expect, it } from 'vitest'
import {
  decadeReading,
  divisionEstimate,
  electrometerDegrees,
  galvTerminalList,
  instrumentPropIssues,
  ohmFraction,
  ohmHint,
  readMultimeter,
  readSpringScale,
  selectorAngle,
  springHook,
} from './instruments'
import { validateLesson } from './validate'

const runtime = buildRuntime()
const head = ['---', 'title: t', 'demo: true', '---', ''].join('\n')

describe('multimeter readings', () => {
  it('puts the ohm needle at mid / (R/倍率 + mid) and multiplies the dial by the range', () => {
    const r = readMultimeter({ mode: 'ohm', range: 10, value: 260, mid: 15 })
    expect(r.ok).toBe(true)
    expect(r.dial).toBeCloseTo(26, 8)
    expect(r.result).toBeCloseTo(260, 6)
    expect(r.fraction).toBeCloseTo(ohmFraction(26, 15), 8)
    expect(r.fraction).toBeCloseTo(15 / 41, 8)
    expect(r.division).toBeCloseTo(2, 8)
    expect(r.hint).toBeNull()
    expect(r.line).toContain('示数 26')
    expect(r.line).toContain('260 Ω')
    // short circuit sits on 0 Ω, open circuit on ∞
    expect(ohmFraction(0, 15)).toBeCloseTo(1, 8)
    expect(ohmFraction(1e9, 15)).toBeCloseTo(0, 4)
  })

  it('asks for a larger multiplier when the needle is left of the middle third, and a smaller one on the right', () => {
    const high = readMultimeter({ mode: 'ohm', range: 10, value: 800 })
    expect(high.fraction).toBeLessThan(1 / 3)
    expect(high.hint).toBe('指针偏角太小，应换更大倍率')
    const low = readMultimeter({ mode: 'ohm', range: 10, value: 40 })
    expect(low.fraction).toBeGreaterThan(2 / 3)
    expect(low.hint).toBe('指针偏角太大，应换更小倍率')
    expect(ohmHint(0.1, 1000)).toBe('指针偏角太小，已是最大倍率')
    expect(ohmHint(0.9, 1)).toBe('指针偏角太大，已是最小倍率')
    expect(ohmHint(0.5, 10)).toBeNull()
  })

  it('reads the DC 10 V arc by the same 高考 estimate rule as a pointer meter', () => {
    expect(divisionEstimate(0.2)).toEqual({ grain: 0.1, digits: 1 })
    expect(divisionEstimate(0.1)).toEqual({ grain: 0.01, digits: 2 })
    const v = readMultimeter({ mode: 'dcv', range: 10, value: 6.44 })
    expect(v.division).toBeCloseTo(0.2, 8)
    expect(v.result).toBeCloseTo(6.4, 8)
    expect(v.fraction).toBeCloseTo(0.64, 8)
    expect(v.line).toContain('0–10 刻度')
    expect(v.line).toContain('6.4 V')
    const small = readMultimeter({ mode: 'dcv', range: 2.5, value: 1.25 })
    expect(small.division).toBeCloseTo(0.05, 8)
    expect(small.result).toBeCloseTo(1.25, 8)
    expect(small.line).toContain('÷100')
    const over = readMultimeter({ mode: 'dcv', range: 10, value: 12 })
    expect(over.over).toBe(true)
    expect(over.line).toContain('超过量程')
    const ac = readMultimeter({ mode: 'acv', range: 10, value: 6.4 })
    expect(ac.result).toBeCloseTo(6.4, 8)
    expect(ac.line).toContain('交流')
    const ma = readMultimeter({ mode: 'dcma', range: 1, value: 0.46 })
    expect(ma.division).toBeCloseTo(0.02, 8)
    expect(ma.result).toBeCloseTo(0.46, 8)
  })

  it('aims the selector at the chosen sector and parks OFF', () => {
    const ohm = selectorAngle('ohm', 10)!
    const dcv = selectorAngle('dcv', 10)!
    expect(ohm).toBeGreaterThan(198)
    expect(ohm).toBeLessThan(282)
    expect(dcv).not.toBeCloseTo(ohm, 0)
    expect(selectorAngle('off', 0)).not.toBeNull()
    expect(selectorAngle('dcv', 3)).toBeNull()
    const off = readMultimeter({ mode: 'off', range: 0, value: 3 })
    expect(off.line).toContain('OFF')
    expect(off.fraction).toBe(0)
  })
})

describe('spring scale, resistance box, electrometer', () => {
  it('estimates 0.1 N divisions to 0.01 N and 0.2 N divisions in place', () => {
    const fine = readSpringScale(2.35, 5, 50)
    expect(fine.division).toBeCloseTo(0.1, 8)
    expect(fine.q).toBeCloseTo(2.35, 8)
    expect(fine.digits).toBe(2)
    expect(fine.fraction).toBeCloseTo(2.35 / 5, 8)
    const coarse = readSpringScale(2.35, 5, 25)
    expect(coarse.division).toBeCloseTo(0.2, 8)
    expect(coarse.q).toBeCloseTo(2.4, 8)
    expect(coarse.digits).toBe(1)
    expect(readSpringScale(6, 5, 50).line).toContain('超过量程')
  })

  it('places the hook along the scale axis, extended by 0.22 of the case at full load', () => {
    const hook = springHook(0, 2, -90, 1.6, 2.5, 5)
    expect(hook.fraction).toBeCloseTo(0.5, 8)
    expect(hook.x).toBeCloseTo(0, 8)
    expect(hook.y).toBeCloseTo(2 - 1.6 * (1 + 0.22 * 0.5), 8)
    const side = springHook(1, 1, 0, 2, 0, 5)
    expect(side.x).toBeCloseTo(3, 8)
    expect(side.y).toBeCloseTo(1, 8)
  })

  it('reads the 2021 Zhejiang resistance box as 0×1000 + 0×100 + 0×10 + 5×1 = 5 Ω', () => {
    const box = decadeReading(5, [1000, 100, 10, 1])
    expect(box.digits).toEqual([0, 0, 0, 5])
    expect(box.total).toBe(5)
    expect(box.line).toBe('0 × 1000 + 0 × 100 + 0 × 10 + 5 × 1 = 5 Ω')
    expect(decadeReading(236, [1000, 100, 10, 1]).digits).toEqual([0, 2, 3, 6])
    expect(decadeReading(12.34, [10, 1, 0.1, 0.01]).digits).toEqual([1, 2, 3, 4])
  })

  it('opens the electrometer needle in proportion to voltage', () => {
    expect(electrometerDegrees(0, 300)).toBe(0)
    expect(electrometerDegrees(150, 300)).toBeCloseTo(30, 8)
    expect(electrometerDegrees(900, 300)).toBeCloseTo(60, 8)
    expect(electrometerDegrees(undefined, 300, 25)).toBe(25)
    expect(electrometerDegrees(0, 300, 25)).toBe(0)
  })

  it('names the galvanometer posts and keeps the common terminal', () => {
    expect(galvTerminalList(undefined)).toEqual(['+', '-'])
    expect(galvTerminalList(['−', 'G0', 'G1'])).toEqual(['-', 'G0', 'G1'])
    expect(galvTerminalList(['G'])).toEqual(['+', '-'])
  })
})

describe('instrument validator', () => {
  const issues = (props: Record<string, unknown>) => {
    const out: string[] = []
    instrumentPropIssues(props, (m) => out.push(m))
    return out.join('\n')
  }

  it('rejects a mode and range the selector does not have', () => {
    expect(issues({ type: 'multimeter', mode: 'ac', range: 10 })).toMatch(/mode 不合法/)
    expect(issues({ type: 'multimeter', mode: 'ohm' })).toMatch(/要写 range/)
    expect(issues({ type: 'multimeter', mode: 'ohm', range: 3 })).toMatch(/没有量程 3/)
    expect(issues({ type: 'multimeter', mode: 'dcv', range: 2.5 })).toBe('')
    expect(issues({ type: 'multimeter', mode: 'off', range: 10 })).toMatch(/不要写 range/)
    expect(issues({ type: 'springScale', value: 1 })).toMatch(/要写 max/)
    expect(issues({ type: 'vernier', mode: 'ohm' })).toMatch(/mode 只用于/)
    expect(issues({ type: 'meter', terminals: ['−', '3 V', '15 V'] })).toBe('')
    expect(issues({ type: 'ohmmeter', terminals: ['a', 'b'] })).toMatch(/terminals 只用于/)
  })

  it('accepts the demo and rejects a wire to a post the galvanometer does not have', () => {
    const demo = readFileSync(join(__dirname, '../../../lessons/_demo-instruments-2.md'), 'utf8')
    expect(validateLesson(demo).errors).toEqual([])
    const src =
      head +
      [
        '<Wiring parts={[{id: "G", type: "galvanometer", terminals: ["-", "G0", "G1"]}]} wires={[{from: "G.G0", to: "G.-"}]} />',
        '',
        '<Wiring parts={[{id: "G", type: "galvanometer", terminals: ["-", "G0", "G1"]}]} wires={[{from: "G.+", to: "G.-"}]} />',
        '',
        '<Wiring parts={[{id: "R", type: "resistor", terminals: ["a", "b"]}]} wires={[]} />',
        '',
        '<Instrument type="multimeter" mode="dcma" range={3} value={1} />',
      ].join('\n')
    const msgs = validateLesson(src).errors.map((e) => e.message).join('\n')
    expect(msgs).not.toMatch(/没有接线柱「G0」/)
    expect(msgs).toMatch(/没有接线柱「\+」/)
    expect(msgs).toMatch(/terminals 只用于 galvanometer/)
    expect(msgs).toMatch(/没有量程/)
  })
})

function draw(body: string) {
  const posts: { type?: string; message?: string }[] = []
  const listeners: Record<string, ((e: unknown) => void)[]> = {}
  const ctx2d = new Proxy(
    {},
    {
      get(_t, prop) {
        if (prop === 'measureText') return (s: unknown) => ({ width: String(s).length * 7 })
        if (typeof prop === 'string' && /^create/.test(prop)) return () => ({ addColorStop() {}, setTransform() {} })
        return () => undefined
      },
      set() {
        return true
      },
    },
  )
  const canvas = { width: 0, height: 0, style: {}, getContext: () => ctx2d }
  const parent = { postMessage: (msg: { type?: string; message?: string }) => posts.push(msg) }
  const sandbox: Record<string, unknown> = {
    Math, JSON, Number, Array, Object, String, Boolean, Infinity, NaN, isFinite, isNaN, parseFloat, parseInt, Date,
    console,
    document: { getElementById: () => canvas, documentElement: { clientWidth: 640, clientHeight: 360 } },
    parent,
    devicePixelRatio: 2,
    Path2D: class {
      moveTo() {}
      lineTo() {}
      arc() {}
      ellipse() {}
      rect() {}
      closePath() {}
    },
    performance: { now: () => 0 },
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => undefined,
    addEventListener: (type: string, fn: (e: unknown) => void) => {
      ;(listeners[type] ??= []).push(fn)
    },
    __listeners: listeners,
    __colors: new Proxy({}, { get: () => '#888' }),
  }
  sandbox.window = sandbox
  sandbox.globalThis = sandbox
  const context = vm.createContext(sandbox)
  vm.runInContext(runtime, context, { timeout: 20000 })
  vm.runInContext(`figure({ draw(ctx, p, v) { ${body} } })`, context, { timeout: 20000 })
  vm.runInContext('__simReady()', context)
  for (const fn of listeners.message || []) {
    fn({ source: parent, data: { source: 'genui-host', params: {}, t: 0, colors: sandbox.__colors, theme: 'light' } })
  }
  const err = posts.filter((p) => p.type === 'error').map((p) => p.message).join('\n')
  if (err) throw new Error(err)
  return sandbox.__out as Record<string, unknown>
}

describe('sandbox helpers agree with the module', () => {
  it('returns the same hook and the same electrometer angle', () => {
    const hook = springHook(0, 2, -90, 1.6, 2.5, 5)
    const out = draw(`
      const m = v.view({ xmin: -3, xmax: 3, ymin: -1, ymax: 3, equal: true })
      const s = v.springScale(m, 0, 2, { angle: -90, value: 2.5, max: 5, length: 1.6, divisions: 50 })
      const e = v.electrometer(m, 1, 0, { value: 150, max: 300 })
      const d = v.electrometer(m, -1, 0, { deflection: 25 })
      globalThis.__out = { hook: s.hook, fraction: s.fraction, angle: e.angle, ball: e.ball, def: d.angle }
    `) as { hook: number[]; fraction: number; angle: number; ball: number[]; def: number }
    expect(out.hook[0]).toBeCloseTo(hook.x, 6)
    expect(out.hook[1]).toBeCloseTo(hook.y, 6)
    expect(out.fraction).toBeCloseTo(hook.fraction, 6)
    expect(out.angle).toBeCloseTo(electrometerDegrees(150, 300), 6)
    expect(out.def).toBeCloseTo(25, 6)
    expect(out.ball[1]).toBeGreaterThan(0)
  })
})
