import { buildRuntime } from '../sim/buildRuntime'
import { join } from 'node:path'
import vm from 'node:vm'
import { describe, expect, it } from 'vitest'
import {
  barFrame,
  coilMarks,
  coreSpan,
  dipoleB,
  fieldLinesFromPoles,
  gapLines,
  helixSample,
  horseshoeFrame,
  radialArrows,
  radialPoles,
  solenoidFrame,
  solenoidLocalLines,
  solenoidPolarity,
  toroidCCW,
} from '../sim/magnetics'
import { validateFile } from '../../scripts/validate'

const runtime = buildRuntime()

describe('solenoid polarity', () => {
  it('looking at end 2, counter-clockwise current means end 2 is N', () => {
    // sense +1, current > 0: from end 1 toward end 2 the current is clockwise,
    // so from outside end 2 it is counter-clockwise.
    expect(solenoidPolarity(1, 1)).toEqual({ northEnd: 2, southEnd: 1 })
    expect(solenoidPolarity(1, -3)).toEqual({ northEnd: 1, southEnd: 2 })
    expect(solenoidPolarity(-1, 2)).toEqual({ northEnd: 1, southEnd: 2 })
    expect(solenoidPolarity(-1, -0.4)).toEqual({ northEnd: 2, southEnd: 1 })
    expect(solenoidPolarity(1, 0).northEnd).toBeNull()
    expect(solenoidPolarity(1, NaN).southEnd).toBeNull()
  })

  // Near-side current heading to the right of the axis (axis turned clockwise), seen from
  // end 2 with the reader's side on the left, runs down on the left: counter-clockwise, so
  // end 2 is N. The drawn wire must agree with solenoidPolarity, or students reading the
  // picture with the right-hand rule get the opposite pole.
  it('draws the near wire of a right-handed helix descending to the right of the axis, matching the poles', () => {
    const climb = (sense: number) => {
      let sum = 0
      let prev: number | null = null
      const turns = 4
      for (let i = 0; i <= 480; i++) {
        const u = i / 480
        const h = helixSample(u, turns, sense, 0)
        if (!h.front) {
          prev = null
          continue
        }
        if (prev !== null) sum += h.n - prev
        prev = h.n
      }
      return sum
    }
    expect(climb(1)).toBeLessThan(0)
    expect(climb(-1)).toBeGreaterThan(0)
    expect(solenoidPolarity(1, 1).northEnd).toBe(2)
    expect(helixSample(0, 5, 1, 0).n).toBeCloseTo(-1, 6)
    expect(helixSample(1, 5, 1, 0).n).toBeCloseTo(-1, 6)
    expect(helixSample(0, 5, 1, Math.PI).n).toBeCloseTo(1, 6)
    const turns = 6
    const starts: number[] = []
    let on = false
    for (let i = 0; i <= 600; i++) {
      const u = i / 600
      const front = helixSample(u, turns, 1, 0).front
      if (front && !on) starts.push(u)
      on = front
    }
    expect(starts.length).toBe(turns)
    expect(starts[1] - starts[0]).toBeCloseTo(1 / turns, 2)
  })

  it('puts N at end 2 and drops both leads on the same side of the axis', () => {
    const f = solenoidFrame(0, 0, 4, 0, { r: 0.5, sense: 1, current: 1, terminals: 'below' })
    expect(f).not.toBeNull()
    if (!f) return
    expect(f.north).toEqual([4, 0])
    expect(f.south).toEqual([0, 0])
    expect(f.terminals[0][1]).toBeLessThan(-f.r)
    expect(f.terminals[1][1]).toBeLessThan(-f.r)
    expect(f.terminals[0][0]).toBeCloseTo(0, 6)
    expect(f.terminals[1][0]).toBeCloseTo(4, 6)
    expect(f.pt(0.5)).toEqual([2, 0])
    const up = solenoidFrame(0, 0, 4, 0, { r: 0.5, current: 1, terminals: 'above' })
    expect(up!.terminals[0][1]).toBeGreaterThan(up!.r)
    const dead = solenoidFrame(1, 2, 3, 2, { current: 0 })
    expect(dead!.north).toBeNull()
    expect(dead!.south).toBeNull()
  })

  it('points internal field lines at N and brings the outside lines back to S', () => {
    const lines = solenoidLocalLines(3, 2)
    const inside = lines.filter((l) => l.kind === 'in')
    const outside = lines.filter((l) => l.kind === 'out')
    expect(inside).toHaveLength(3)
    expect(inside.every((l) => l.sign > 0)).toBe(true)
    expect(outside[0].pts[0][0]).toBeCloseTo(1, 6)
    expect(outside[0].pts.at(-1)![0]).toBeCloseTo(0, 6)
    expect(Math.abs(outside[0].pts[9][1])).toBeGreaterThan(1)
    const flipped = solenoidLocalLines(3, 1)
    expect(flipped.filter((l) => l.kind === 'in').every((l) => l.sign < 0)).toBe(true)
    expect(flipped.find((l) => l.kind === 'out')!.pts[0][0]).toBeCloseTo(0, 6)
  })
})

describe('toroid, magnet and radial gap', () => {
  it('sends B counter-clockwise when the inner wire comes out of the page (Ampère around the centre circle)', () => {
    expect(toroidCCW(1, 1)).toBe(1)
    expect(toroidCCW(1, -2)).toBe(-1)
    expect(toroidCCW(-1, 1)).toBe(-1)
    expect(toroidCCW(1, 0)).toBe(0)
  })

  it('traces bar-magnet lines from the N face onto the S face, and keeps them bounded', () => {
    const north: [number, number] = [1, 0]
    const south: [number, number] = [-1, 0]
    const [bx, by] = dipoleB(1.4, 0, [
      { x: 1, y: 0, m: 1 },
      { x: -1, y: 0, m: -1 },
    ])
    expect(bx).toBeGreaterThan(0)
    expect(Math.abs(by)).toBeLessThan(1e-6)
    const equator = dipoleB(0, 0.8, [
      { x: 1, y: 0, m: 1 },
      { x: -1, y: 0, m: -1 },
    ])
    expect(equator[0]).toBeLessThan(0)
    const lines = fieldLinesFromPoles(north, south, 6)
    expect(lines.length).toBeGreaterThanOrEqual(4)
    for (const pts of lines) {
      const end = pts.at(-1)!
      expect(Math.hypot(end[0] - south[0], end[1] - south[1])).toBeLessThan(0.35)
      expect(Math.max(...pts.map((p) => Math.hypot(p[0], p[1])))).toBeLessThan(3.2)
      expect(Math.max(...pts.map((p) => Math.abs(p[1])))).toBeGreaterThan(0.4)
    }
  })

  it('puts the poles where north says, and crosses a horseshoe gap', () => {
    const left = barFrame(0, 0, 4, 0.8, 'left', 0)
    expect(left.north[0]).toBeCloseTo(-2, 6)
    expect(left.south[0]).toBeCloseTo(2, 6)
    const up = barFrame(0, 0, 4, 0.8, 'right', 90)
    expect(up.north[0]).toBeCloseTo(0, 5)
    expect(up.north[1]).toBeCloseTo(2, 5)
    const shoe = horseshoeFrame(0, 0, 2, 1.6, 'left', 0)
    expect(shoe.north[0]).toBeCloseTo(-0.824, 3)
    expect(shoe.south[0]).toBeCloseTo(0.824, 3)
    expect(shoe.north[1]).toBeCloseTo(shoe.south[1], 6)
    expect(shoe.south[0] - shoe.north[0]).toBeLessThan(2)
    const gap = gapLines(shoe.north, shoe.south, [0, -1], 5)
    expect(gap.length).toBeGreaterThanOrEqual(3)
    const bow = (pts: [number, number][]) => Math.min(...pts.map((p) => p[1]))
    expect(bow(gap[0])).toBeGreaterThan(bow(gap.at(-1)!))
    expect(Math.hypot(gap[0].at(-1)![0] - shoe.south[0], gap[0].at(-1)![1] - shoe.south[1])).toBeLessThan(0.4)
  })

  it('draws a uniform radial gap: into the core from N, out of the core toward S', () => {
    const shoes = radialArrows({ poles: 'shoes', north: 'left', count: 10 })
    const left = shoes.arrows.filter((a) => a.side === 'left')
    const right = shoes.arrows.filter((a) => a.side === 'right')
    expect(left.every((a) => a.outward === false)).toBe(true)
    expect(right.every((a) => a.outward === true)).toBe(true)
    const step = left[1].theta - left[0].theta
    for (let i = 1; i < left.length; i++) expect(left[i].theta - left[i - 1].theta).toBeCloseTo(step, 6)
    const flipped = radialArrows({ poles: 'shoes', north: 'right' })
    expect(flipped.arrows.filter((a) => a.side === 'left').every((a) => a.outward)).toBe(true)
    const ring = radialArrows({ poles: 'ring', dir: 'out', count: 12 })
    expect(ring.innerNorth).toBe(true)
    expect(ring.arrows.every((a) => a.outward)).toBe(true)
    expect(ring.arrows[1].theta - ring.arrows[0].theta).toBeCloseTo((2 * Math.PI) / 12, 6)
    const inn = radialArrows({ poles: 'ring', dir: 'in' })
    expect(inn.innerNorth).toBe(false)
    expect(inn.arrows.every((a) => !a.outward)).toBe(true)
    const poles = radialPoles(0, 0, 0.4, 1, { poles: 'shoes', north: 'left' })
    expect(poles.north[0]).toBeCloseTo(-1, 6)
    expect(poles.south[0]).toBeCloseTo(1, 6)
    const out = radialPoles(0, 0, 0.4, 1, { poles: 'ring', dir: 'out' })
    expect(out.north).toEqual([0, 0])
    expect(out.south[0]).toBeGreaterThan(1)
    const marks = coilMarks(90, 1)
    expect(marks[0].theta).toBeCloseTo(Math.PI / 2, 6)
    expect(marks[0].out).toBe(true)
    expect(marks[1].out).toBe(false)
    expect(coilMarks(0, -2)[0].out).toBe(false)
    expect(coilMarks(0, -2)[1].out).toBe(true)
  })

  it('lets an iron core stop short or stick out', () => {
    expect(coreSpan(true)).toEqual({ from: 0, to: 1 })
    expect(coreSpan('iron')).toEqual({ from: 0, to: 1 })
    expect(coreSpan({ from: -0.2, to: 1.4 })).toEqual({ from: -0.2, to: 1.4 })
    expect(coreSpan({ from: 0.8, to: 0.2 })).toEqual({ from: 0.2, to: 0.8 })
    expect(coreSpan(false)).toBeNull()
    expect(coreSpan(undefined)).toBeNull()
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
    addEventListener: (type: string, fn: (e: unknown) => void) => (listeners[type] ??= []).push(fn),
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

describe('sandbox drawing agrees with the geometry', () => {
  it('returns the computed poles, leads and toroid sense', () => {
    const opts = { r: 0.4, turns: 7, sense: 1, current: 1, terminals: 'below', labels: false, field: false }
    const frame = solenoidFrame(0, 1, 3, 1, opts)!
    const out = draw(`
      const m = v.view({ xmin: -8, xmax: 8, ymin: -6, ymax: 8, equal: true })
      const s = v.solenoid(m, 0, 1, 3, 1, { r: 0.4, turns: 7, sense: 1, current: 1, terminals: 'below', labels: false, field: false })
      const t = v.toroid(m, 0, 0, 1.2, { r: 0.3, turns: 12, sense: -1, current: 1, field: false })
      const bar = v.magnet(m, 0, 0, { kind: 'bar', w: 4, h: 0.6, north: 'left', field: false })
      const shoe = v.magnet(m, 0, -3, { kind: 'horseshoe', w: 2, h: 1.6, north: 'left', field: false })
      const rad = v.radialField(m, 5, 5, 0.4, 1, { poles: 'shoes', north: 'left', core: true })
      const ring = v.radialField(m, -5, 5, 0.4, 1, { poles: 'ring', dir: 'in', core: true })
      globalThis.__out = { s, t, bar, shoe, rad, ring }
    `) as {
      s: { north: number[]; south: number[]; terminals: number[][]; axis: { ux: number; uy: number }; pt: (u: number) => number[] }
      t: { ccw: number }
      bar: { north: number[]; south: number[] }
      shoe: { north: number[]; south: number[] }
      rad: { north: number[]; south: number[] }
      ring: { north: number[]; south: number[]; core: number[] }
    }
    expect(out.s.north[0]).toBeCloseTo(frame.north![0], 6)
    expect(out.s.north[1]).toBeCloseTo(frame.north![1], 6)
    expect(out.s.south[0]).toBeCloseTo(frame.south![0], 6)
    expect(out.s.terminals[0][1]).toBeCloseTo(frame.terminals[0][1], 6)
    expect(out.s.terminals[1][0]).toBeCloseTo(frame.terminals[1][0], 6)
    expect(out.s.axis).toEqual({ ux: 1, uy: 0 })
    expect(out.s.pt(0.25)[0]).toBeCloseTo(frame.pt(0.25)[0], 6)
    expect(out.t.ccw).toBe(toroidCCW(-1, 1))
    const bar = barFrame(0, 0, 4, 0.6, 'left', 0)
    expect(out.bar.north[0]).toBeCloseTo(bar.north[0], 6)
    expect(out.bar.south[0]).toBeCloseTo(bar.south[0], 6)
    const shoe = horseshoeFrame(0, -3, 2, 1.6, 'left', 0)
    expect(out.shoe.north[0]).toBeCloseTo(shoe.north[0], 5)
    expect(out.shoe.north[1]).toBeCloseTo(shoe.north[1], 5)
    expect(out.shoe.south[0]).toBeCloseTo(shoe.south[0], 5)
    const rad = radialPoles(5, 5, 0.4, 1, { poles: 'shoes', north: 'left' })
    expect(out.rad.north[0]).toBeCloseTo(rad.north[0], 6)
    expect(out.rad.south[0]).toBeCloseTo(rad.south[0], 6)
    const ring = radialPoles(-5, 5, 0.4, 1, { poles: 'ring', dir: 'in' })
    expect(out.ring.south[0]).toBeCloseTo(ring.south[0], 6)
    expect(out.ring.south[1]).toBeCloseTo(ring.south[1], 6)
    expect(out.ring.north[0]).toBeCloseTo(ring.north[0], 6)
    expect(out.ring.core).toEqual([-5, 5])
  })

  it('flips the solenoid poles with the current and rejects a zero-length axis', () => {
    const out = draw(`
      const m = v.view({ xmin: -1, xmax: 3, ymin: -2, ymax: 2, equal: true })
      const a = v.solenoid(m, 0, 0, 2, 0, { sense: 1, current: -1, field: 3, labels: true, core: { from: -0.2, to: 1.2 } })
      globalThis.__out = { north: a.north, south: a.south }
    `) as { north: number[]; south: number[] }
    expect(out.north[0]).toBeCloseTo(0, 5)
    expect(out.south[0]).toBeCloseTo(2, 5)
    const view = `const m = v.view({ xmin: -2, xmax: 2, ymin: -2, ymax: 2, equal: true });`
    expect(() => draw(`${view} v.solenoid(m, 0, 0, 0, 0, {})`)).toThrow(/两端不能重合/)
    expect(() => draw(`${view} v.toroid(m, 0, 0, 0.2, { r: 0.4 })`)).toThrow(/环半径/)
    expect(() => draw(`${view} v.radialField(m, 0, 0, 1, 0.4, {})`)).toThrow(/rIn/)
  })

  it('runs the module polarity formulas inside the sandbox', () => {
    const out = draw(`
      const s = globalThis.__genuiShared
      globalThis.__out = {
        h: s.helixSample(0.25, 4, -1, 0.4),
        p: s.solenoidPolarity(1, -2),
        c: s.toroidCCW(-1, 3),
      }
    `) as { h: { n: number; front: boolean }; p: { northEnd: number | null; southEnd: number | null }; c: number }
    expect(out.h).toEqual(helixSample(0.25, 4, -1, 0.4))
    expect(out.p).toEqual(solenoidPolarity(1, -2))
    expect(out.c).toBe(toroidCCW(-1, 3))
  })
})

describe('demo lesson', () => {
  it('validates with no errors', () => {
    const result = validateFile(join(__dirname, '../../../lessons/_demo-magnetics.md'))
    expect(result.errors).toEqual([])
  })
})
