import { buildRuntime } from '../sim/buildRuntime'
import { describe, expect, it } from 'vitest'
import type { Scope } from './expr'
import { motionPayload, motionValues, type MotionObject } from './motion'
import { checkSim } from './simcheck'
import { motionSpecOf, runMotion } from './solvers'
import { parseLesson } from './parse'
import { buildRegistry, ParamStore } from './store'
import { validateLesson } from './validate'

function simulate(props: Record<string, unknown>, scope: Scope = {}) {
  const spec = motionSpecOf(props)
  if (!spec) throw new Error('no spec')
  const run = runMotion(spec, scope)
  const out = motionValues('pt', spec, run, scope)
  return { pt: out.pt as MotionObject, out, warnings: run.warnings }
}
const f = (o: MotionObject, k: string) => o[k] as (t: number) => number

describe('charged particle in E and B', () => {
  it('adds gravity from forces, bounces off a plate and changes charge through state', () => {
    // E pushes +x; gravity drops from h; after the bounce the charge switches to q2.
    const scope = { m: 1e-6, g: 10, h: 0.08, d: 0.3, U: 20, k: 0.5, q1: 1.5e-8, q2: 3e-8 }
    const { out, warnings } = simulate(
      {
        until: 1, mass: 'm', charge: 'hit < 0.5 ? q1 : q2',
        state: { x: 0, y: 'h', vx: 0, vy: 0, hit: 0 },
        forces: [{ label: 'G', angle: -90, magnitude: 'm*g' }],
        fields: [{ E: 'U/d', angle: 0, region: { xmin: 0, xmax: 'd', ymin: 0, ymax: 'h' } }],
        events: [
          { name: 'tHit', when: 'y', dir: 'down', set: { vy: '-k*vy', hit: 1 } },
          { name: 'tHit2', when: '(hit - 0.5)*y', dir: 'down', stop: true },
        ],
        read: { x1: 'x @ tHit', x2: 'x @ tHit2' },
      },
      scope,
    )
    expect(warnings).toEqual([])
    const t1 = Math.sqrt(0.16 / 10)
    const a1 = (1.5e-8 * 20) / 0.3 / 1e-6
    const a2 = (3e-8 * 20) / 0.3 / 1e-6
    expect(out.tHit).toBeCloseTo(t1, 6)
    expect(out.x1).toBeCloseTo(0.5 * a1 * t1 * t1, 6)
    expect(out.tHit2).toBeCloseTo(2 * t1, 6)
    expect(out.x2).toBeCloseTo(0.5 * a1 * t1 * t1 + a1 * t1 * t1 + 0.5 * a2 * t1 * t1, 6)
  })

  it('circles clockwise in a uniform outward field, and the other way for a negative charge', () => {
    const base = {
      until: 4,
      mass: 1,
      charge: 1,
      state: { x: 0, y: 0, vx: 4, vy: 0 },
      fields: [{ B: 2, dir: 'out' }],
    }
    const T = Math.PI
    const { pt, warnings } = simulate(base)
    expect(warnings).toEqual([])
    // r = mv/qB = 2, centre (0, −2).
    for (const t of [0.2, 0.8, 1.5, 2.4]) {
      const x = f(pt, 'x')(t)
      const y = f(pt, 'y')(t)
      expect(Math.hypot(x, y + 2)).toBeCloseTo(2, 6)
      expect(Math.hypot(f(pt, 'vx')(t), f(pt, 'vy')(t))).toBeCloseTo(4, 6)
    }
    expect(f(pt, 'x')(T / 4)).toBeCloseTo(2, 6)
    expect(f(pt, 'y')(T / 4)).toBeCloseTo(-2, 6)
    expect(f(pt, 'x')(T / 2)).toBeCloseTo(0, 6)
    expect(f(pt, 'y')(T / 2)).toBeCloseTo(-4, 6)
    expect(f(pt, 'vx')(T / 2)).toBeCloseTo(-4, 6)
    expect(f(pt, 'vy')(T / 2)).toBeCloseTo(0, 6)
    expect(f(pt, 'accy')(0)).toBeCloseTo(-8, 6)

    const neg = simulate({ ...base, charge: -1 }).pt
    expect(f(neg, 'x')(T / 4)).toBeCloseTo(2, 6)
    expect(f(neg, 'y')(T / 4)).toBeCloseTo(2, 6)
    expect(f(neg, 'x')(T / 2)).toBeCloseTo(0, 6)
    expect(f(neg, 'y')(T / 2)).toBeCloseTo(4, 6)
    expect(Math.hypot(f(neg, 'x')(1), f(neg, 'y')(1) - 2)).toBeCloseTo(2, 6)

    const payload = motionPayload(pt) as { fields: { dir?: string; angle?: number; region: object }[] }
    expect(payload.fields).toEqual([{ dir: 'out', region: {} }])
    expect(Object.keys(pt)).not.toContain('__fields')
  })

  it('deflects inside a plate gap and then flies straight into the screen', () => {
    const { pt, out, warnings } = simulate({
      until: 2,
      mass: 1,
      charge: 1,
      state: { x: 0, y: 0, vx: 2, vy: 0 },
      fields: [{ E: 0.8, angle: -90, region: { xmin: 0, xmax: 1, ymin: -0.5, ymax: 0.5 }, exit: 'tOut' }],
      events: [{ name: 'tHit', when: 'x - 3', dir: 'up', stop: true }],
      read: { yOut: 'y @ tOut', vyOut: 'vy @ tOut', Y: 'y @ tHit' },
    })
    expect(warnings).toEqual([])
    expect(out.tOut).toBeCloseTo(0.5, 6)
    expect(out.yOut).toBeCloseTo(-0.1, 6)
    expect(out.vyOut).toBeCloseTo(-0.4, 6)
    expect(out.tHit).toBeCloseTo(1.5, 6)
    expect(out.Y).toBeCloseTo(-0.5, 6)
    // Outside the plates the vertical speed no longer changes.
    expect(f(pt, 'vy')(0.7)).toBeCloseTo(-0.4, 6)
    expect(f(pt, 'vy')(1.2)).toBeCloseTo(-0.4, 6)
    expect(f(pt, 'y')(1.2)).toBeCloseTo(-0.1 + -0.4 * 0.7, 6)
    expect(f(pt, 'accy')(1.2)).toBeCloseTo(0, 6)
  })

  it('enters a circular field aimed at the centre and leaves along a radius', () => {
    const v = Math.sqrt(3)
    const { pt, out, warnings } = simulate({
      until: 3,
      mass: 1,
      charge: 1,
      state: { x: -2, y: 0, vx: v, vy: 0 },
      fields: [{ B: 1, dir: 'out', region: { cx: 0, cy: 0, r: 1 }, enter: 'tIn', exit: 'tOut' }],
      read: { xOut: 'x @ tOut', yOut: 'y @ tOut', vxOut: 'vx @ tOut', vyOut: 'vy @ tOut' },
    })
    expect(warnings).toEqual([])
    expect(out.tIn).toBeCloseTo(1 / v, 6)
    expect((out.tOut as number) - (out.tIn as number)).toBeCloseTo(Math.PI / 3, 6)
    expect(out.vxOut).toBeCloseTo(Math.sqrt(3) / 2, 6)
    expect(out.vyOut).toBeCloseTo(-1.5, 6)
    expect(Math.abs((out.xOut as number) * (out.vyOut as number) - (out.yOut as number) * (out.vxOut as number))).toBeLessThan(1e-6)
    // Still on the circle as it leaves.
    expect(Math.hypot(out.xOut as number, out.yOut as number)).toBeCloseTo(1, 6)
    const payload = motionPayload(pt) as { fields: { dir: string; region: { cx: number; cy: number; r: number } }[] }
    expect(payload.fields[0].dir).toBe('out')
    expect(payload.fields[0].region).toEqual({ cx: 0, cy: 0, r: 1 })
  })

  it('goes straight through a velocity selector and dips when it is too fast', () => {
    const straight = simulate({
      until: 1,
      mass: 1,
      charge: 1,
      state: { x: 0, y: 0, vx: 2, vy: 0 },
      fields: [{ E: 2, angle: 90, B: 1, dir: 'out' }],
    }).pt
    for (const t of [0, 0.3, 0.7, 1]) {
      expect(Math.abs(f(straight, 'y')(t))).toBeLessThan(1e-9)
      expect(f(straight, 'vy')(t)).toBeCloseTo(0, 8)
    }
    const fast = simulate({
      until: 1,
      mass: 1,
      charge: 1,
      state: { x: 0, y: 0, vx: 2.2, vy: 0 },
      fields: [{ E: 2, angle: 90, B: 1, dir: 'out' }],
    }).pt
    expect(f(fast, 'y')(1)).toBeLessThan(0)
  })

  it('counts a launch from the boundary as already inside, and leaves at the far end of the arc', () => {
    const vx = Math.cos(Math.PI / 6)
    const vy = Math.sin(Math.PI / 6)
    const run = (charge: number) =>
      simulate({
        until: 5,
        mass: 1,
        charge,
        state: { x: 0, y: 0, vx, vy },
        fields: [{ B: 1, dir: 'out', region: { xmin: 0 }, enter: 'tIn', exit: 'tOut' }],
        read: { xOut: 'x @ tOut', yOut: 'y @ tOut' },
      })
    const pos = run(1)
    expect(pos.warnings).toEqual([])
    expect(pos.out.tIn).toBe(0)
    expect(pos.out.tOut).toBeCloseTo((4 * Math.PI) / 3, 6)
    expect(pos.out.xOut).toBeCloseTo(0, 6)
    expect(pos.out.yOut).toBeCloseTo(-Math.sqrt(3), 6)
    const neg = run(-1)
    expect(neg.out.tIn).toBe(0)
    expect(neg.out.tOut).toBeCloseTo((2 * Math.PI) / 3, 6)
    expect(neg.out.xOut).toBeCloseTo(0, 6)
    expect(neg.out.yOut).toBeCloseTo(Math.sqrt(3), 6)
  })

  it('leaves an upper semicircle through the arc after starting on the diameter', () => {
    const { out, warnings } = simulate({
      until: 2,
      mass: 1,
      charge: 1,
      state: { x: 0, y: 0, vx: 0, vy: 1 },
      fields: [{ B: 1, dir: 'out', region: { cx: 0, cy: 0, r: 1, from: 0, to: 180 }, enter: 'tIn', exit: 'tOut' }],
      read: { xOut: 'x @ tOut', yOut: 'y @ tOut' },
    })
    expect(warnings).toEqual([])
    expect(out.tIn).toBe(0)
    expect(out.tOut).toBeCloseTo(Math.PI / 3, 6)
    expect(out.xOut).toBeCloseTo(0.5, 6)
    expect(out.yOut).toBeCloseTo(Math.sqrt(3) / 2, 6)
  })

  it('crosses a triangular region on a straight line at the edge times', () => {
    const { out, warnings } = simulate({
      until: 4,
      mass: 1,
      charge: 1,
      state: { x: -1, y: 0.5, vx: 1, vy: 0 },
      fields: [{ B: 0, dir: 'out', region: { points: [[0, 0], [2, 0], [0, 2]] }, enter: 'tIn', exit: 'tOut' }],
      read: { xOut: 'x @ tOut', yOut: 'y @ tOut' },
    })
    expect(warnings).toEqual([])
    expect(out.tIn).toBeCloseTo(1, 6)
    expect(out.tOut).toBeCloseTo(2.5, 6)
    expect(out.xOut).toBeCloseTo(1.5, 6)
    expect(out.yOut).toBeCloseTo(0.5, 6)
  })

  it('balances an oil drop, and lifts it when the field is stronger than the weight', () => {
    const drop = (E: number) =>
      simulate({
        until: 1,
        mass: 0.01,
        charge: 0.001,
        state: { x: 0, y: 0, vx: 0, vy: 0 },
        forces: [{ label: 'G', angle: -90, magnitude: '0.01*10' }],
        fields: [{ E, angle: 90 }],
      }).pt
    const still = drop(100)
    expect(f(still, 'y')(1)).toBeCloseTo(0, 6)
    expect(f(still, 'vy')(1)).toBeCloseTo(0, 6)
    expect(f(still, 'accy')(0.4)).toBeCloseTo(0, 6)
    const up = drop(120)
    expect(f(up, 'accy')(0.3)).toBeCloseTo(2, 6)
    expect(f(up, 'y')(1)).toBeCloseTo(1, 6)
    expect(f(up, 'vy')(1)).toBeCloseTo(2, 6)
  })

  it('follows an alternating electric field', () => {
    const { pt, warnings } = simulate(
      {
        until: 2,
        mass: 1,
        charge: 1,
        state: { x: 0, y: 0, vx: 0, vy: 0 },
        fields: [{ E: 'E0*sin(w*t)', angle: 90 }],
      },
      { E0: 1, w: 2 },
    )
    expect(warnings).toEqual([])
    for (const t of [0.2, 0.7, 1.1, 1.8]) {
      expect(f(pt, 'vy')(t)).toBeCloseTo((1 - Math.cos(2 * t)) / 2, 6)
      expect(f(pt, 'vx')(t)).toBeCloseTo(0, 6)
    }
  })

  it('publishes when a switched field reverses, so the arrows can follow it', () => {
    const { pt } = simulate(
      {
        until: 3.5,
        steps: 400,
        mass: 1,
        charge: 1,
        state: { x: 0, y: 0, vx: 0, vy: 0 },
        fields: [
          { E: 'E0*cos(pi*floor(t))', angle: 90 },
          { E: 'E0', angle: 0, region: { xmin: 5 } },
          { B: '1 - floor(t/2)*2', dir: 'out', region: { xmax: -5 } },
        ],
      },
      { E0: 2 },
    )
    type TL = { t: number[]; angle?: (number | null)[]; dir?: (string | null)[] }
    const payload = motionPayload(pt) as { fields: { angle?: number; dir?: string; timeline?: TL }[] }
    const [plate, fixed, magnet] = payload.fields
    expect(fixed.timeline).toBeUndefined()
    expect(fixed.angle).toBe(0)
    const tl = plate.timeline!
    expect(tl.angle).toEqual([90, 270, 90, 270])
    expect(tl.t[0]).toBe(0)
    tl.t.slice(1).forEach((time, k) => expect(time).toBeCloseTo(k + 1, 9))
    expect(magnet.timeline!.dir).toEqual(['out', 'in'])
    expect(magnet.timeline!.angle).toBeUndefined()
  })
})

describe('non-uniform electric fields', () => {
  it('holds a circular orbit in an attractive radial field E = a/r', () => {
    const r0 = 1
    const a = 1
    const v = 1 // m v² = q a
    const T = (2 * Math.PI * r0) / v
    const { pt, warnings } = simulate({
      until: 4 * T,
      steps: 6000,
      mass: 1,
      charge: 1,
      state: { x: r0, y: 0, vx: 0, vy: v },
      fields: [{ radial: true, cx: 0, cy: 0, E: `-${a}/r` }],
    })
    expect(warnings).toEqual([])
    for (let k = 1; k <= 16; k++) {
      const t = (4 * T * k) / 16
      const x = f(pt, 'x')(t)
      const y = f(pt, 'y')(t)
      expect(Math.abs(Math.hypot(x, y) - r0)).toBeLessThan(1e-6)
      expect(Math.abs(Math.hypot(f(pt, 'vx')(t), f(pt, 'vy')(t)) - v)).toBeLessThan(1e-6)
    }
    expect(f(pt, 'x')(T)).toBeCloseTo(r0, 5)
    expect(f(pt, 'y')(T)).toBeCloseTo(0, 5)
    expect(f(pt, 'x')(T / 4)).toBeCloseTo(0, 5)
    expect(f(pt, 'y')(T / 4)).toBeCloseTo(r0, 5)
  })

  it('scatters a repulsive point charge by the Rutherford angle', () => {
    const k = 1
    const Q = 1
    const q = 1
    const m = 1
    const v0 = 1
    const b = 2
    const theta = 2 * Math.atan((k * Q * q) / (m * v0 * v0 * b))
    // Start on the incoming asymptote, with the speed lowered so the speed at infinity is v0.
    const R = 160
    let y0 = b
    let vInit = v0
    for (let i = 0; i < 6; i++) {
      const r0 = Math.hypot(R, y0)
      vInit = Math.sqrt(v0 * v0 - (2 * k * Q * q) / (m * r0))
      y0 = (b * v0) / vInit
    }
    const { pt, warnings } = simulate({
      until: (2.4 * R) / v0,
      steps: 20000,
      mass: m,
      charge: q,
      state: { x: -R, y: y0, vx: vInit, vy: 0 },
      fields: [{ Q, x: 0, y: 0, k }],
    })
    expect(warnings).toEqual([])
    const tEnd = pt.tEnd as number
    const ang = Math.atan2(f(pt, 'vy')(tEnd), f(pt, 'vx')(tEnd))
    expect(Math.abs(ang - theta)).toBeLessThan(1e-4)
    expect(f(pt, 'x')(tEnd)).toBeGreaterThan(R * 0.5)
  })

  it('conserves energy in a point-charge field', () => {
    const k = 1
    const Q = 1
    const q = 1
    const m = 1
    const x0 = -5
    const y0 = 1.2
    const v0 = 1
    const { pt, warnings } = simulate({
      until: 12,
      steps: 8000,
      mass: m,
      charge: q,
      state: { x: x0, y: y0, vx: v0, vy: 0 },
      fields: [{ Q, x: 0, y: 0, k }],
    })
    expect(warnings).toEqual([])
    const energy = (t: number) => {
      const x = f(pt, 'x')(t)
      const y = f(pt, 'y')(t)
      const vx = f(pt, 'vx')(t)
      const vy = f(pt, 'vy')(t)
      return 0.5 * m * (vx * vx + vy * vy) + (k * Q * q) / Math.hypot(x, y)
    }
    const e0 = energy(0)
    for (const t of [0.4, 1.5, 3, 5, 8, 11]) {
      expect(Math.abs(energy(t) - e0) / Math.abs(e0)).toBeLessThan(1e-7)
    }
  })

  it('stops an attractive head-on charge at radius and publishes the hit', () => {
    const radius = 0.4
    const x0 = 3
    const v0 = 1
    const { pt, out, warnings } = simulate({
      until: 4,
      steps: 4000,
      mass: 1,
      charge: 1,
      state: { x: x0, y: 0, vx: -v0, vy: 0 },
      fields: [{ Q: -1, x: 0, y: 0, k: 1, radius, hit: 'tHit' }],
      read: { xHit: 'x @ tHit' },
    })
    expect(warnings).toEqual([])
    expect(out.tHit).toBeGreaterThan(0)
    expect(out.xHit).toBeCloseTo(radius, 6)
    expect(pt.tEnd).toBeCloseTo(out.tHit as number, 8)
    // Time to fall from x0 to radius under U = −1/r.
    const E = 0.5 * v0 * v0 + -1 / x0
    let tFall = 0
    let r = x0
    const n = 4000
    const dr = (x0 - radius) / n
    for (let i = 0; i < n; i++) {
      const rm = r - dr / 2
      const speed = Math.sqrt(2 * (E + 1 / rm))
      tFall += dr / speed
      r -= dr
    }
    expect(out.tHit).toBeCloseTo(tFall, 4)
  })

  it('crosses an annular sector on a cyclotron circle exactly at the inner arc', () => {
    // Clockwise circle, centre (0, 1), radius 1, from (0, 2). Hits the inner circle x²+y²=1 at (√3/2, 1/2) after 120°.
    const { out, warnings } = simulate({
      until: 3,
      mass: 1,
      charge: 1,
      state: { x: 0, y: 2, vx: 1, vy: 0 },
      fields: [{ B: 1, dir: 'out', region: { cx: 0, cy: 0, r: 3, inner: 1, from: 0, to: 180 }, enter: 'tIn', exit: 'tOut' }],
      read: { xOut: 'x @ tOut', yOut: 'y @ tOut' },
    })
    expect(warnings).toEqual([])
    expect(out.tIn).toBe(0)
    expect(out.tOut).toBeCloseTo((2 * Math.PI) / 3, 6)
    expect(out.xOut).toBeCloseTo(Math.sqrt(3) / 2, 6)
    expect(out.yOut).toBeCloseTo(0.5, 6)
    expect(Math.hypot(out.xOut as number, out.yOut as number)).toBeCloseTo(1, 6)
  })

  it('feels a radial field only between the inner and outer radius of a ring', () => {
    const { pt, out, warnings } = simulate({
      until: 2,
      mass: 1,
      charge: 1,
      state: { x: 0.5, y: 0, vx: 1, vy: 0 },
      fields: [{ radial: true, cx: 0, cy: 0, E: 2, region: { cx: 0, cy: 0, r: 2, inner: 1 }, enter: 'tIn', exit: 'tOut' }],
    })
    expect(warnings).toEqual([])
    const tau = (-1 + Math.sqrt(5)) / 2
    expect(out.tIn).toBeCloseTo(0.5, 6)
    expect(out.tOut).toBeCloseTo(0.5 + tau, 6)
    expect(f(pt, 'accx')(0.2)).toBeCloseTo(0, 8)
    expect(f(pt, 'y')(0.2)).toBeCloseTo(0, 8)
    expect(f(pt, 'accx')(0.7)).toBeCloseTo(2, 6)
    expect(f(pt, 'accx')((out.tOut as number) + 0.2)).toBeCloseTo(0, 6)
    expect(f(pt, 'vx')(out.tOut as number)).toBeCloseTo(Math.sqrt(5), 5)
    expect(f(pt, 'x')(out.tOut as number)).toBeCloseTo(2, 6)
  })

  it('puts charge, radial and inner on the draw payload and leaves a uniform field unchanged', () => {
    const { pt, warnings } = simulate({
      until: 0.4,
      mass: 1,
      charge: 1,
      state: { x: 1, y: 0, vx: 0, vy: 0 },
      fields: [
        { B: 1, dir: 'out', region: { cx: 0, cy: 0, r: 2, inner: 0.5 } },
        { label: '核', Q: 2, x: 1, y: -1, k: 1, lines: true },
        { radial: true, cx: -0.5, cy: 0.25, E: '-3/r' },
        { E: 1, angle: 0, region: { xmin: 0 } },
      ],
    })
    expect(warnings).toEqual([])
    const payload = motionPayload(pt) as {
      fields: { dir?: string; angle?: number; label?: string; region: Record<string, number>; charge?: { x: number; y: number; Q: number; lines?: boolean }; radial?: { cx: number; cy: number; sign: number } }[]
    }
    expect(payload.fields[0]).toEqual({ dir: 'out', region: { cx: 0, cy: 0, r: 2, inner: 0.5 } })
    expect(payload.fields[1].charge).toEqual({ x: 1, y: -1, Q: 2, lines: true })
    expect(payload.fields[1].label).toBe('核')
    expect(payload.fields[1].angle).toBeUndefined()
    expect(payload.fields[1].dir).toBeUndefined()
    expect(payload.fields[2].radial).toEqual({ cx: -0.5, cy: 0.25, sign: -1 })
    expect(payload.fields[2].angle).toBeUndefined()
    expect(payload.fields[3]).toEqual({ angle: 0, region: { xmin: 0 } })

    const runtime = buildRuntime()
    const body =
      'sim({ at(t, p) { return { x: 0, y: 0 } }, draw(ctx, s, v) { const m = v.view({ xmin: -3, xmax: 3, ymin: -3, ymax: 3, equal: true }); v.regions(m, v.p.pt, { lines: true }); if (!v.p.pt.fields[1].charge || v.p.pt.fields[2].radial.sign !== -1 || v.p.pt.fields[0].region.inner !== 0.5) throw new Error("payload"); } })'
    const checked = checkSim(body, runtime, [{ label: '场', params: { pt: payload }, times: [0, 0.2] }])
    expect(checked).toEqual({ errors: [], warnings: [] })
  })

  it('keeps Coulomb energy for a charge constrained to a straight pipe', () => {
    const { pt, warnings } = simulate({
      until: 1.2,
      steps: 3000,
      mass: 1,
      charge: 1,
      state: { s: 0, v: 1 },
      track: { pipe: true, pieces: [{ line: [-3, 0, 3, 0], pipe: true }] },
      fields: [{ Q: 1, x: 0, y: 1, k: 1 }],
    })
    expect(warnings).toEqual([])
    const energy = (t: number) => {
      const x = f(pt, 'x')(t)
      const y = f(pt, 'y')(t)
      const vx = f(pt, 'vx')(t)
      const vy = f(pt, 'vy')(t)
      return 0.5 * (vx * vx + vy * vy) + 1 / Math.hypot(x, y - 1)
    }
    const e0 = energy(0)
    expect(f(pt, 'x')(0)).toBeCloseTo(-3, 6)
    for (const t of [0.3, 0.7, 1.1]) {
      expect(Math.abs(f(pt, 'y')(t))).toBeLessThan(1e-6)
      expect(Math.abs(energy(t) - e0) / Math.abs(e0)).toBeLessThan(1e-6)
    }
  })
})

describe('fields validator', () => {
  const head = ['---', 'title: t', 'demo: true', '---', ''].join('\n')
  const lesson = (motion: string, extra = '') => head + '<Param name="U" value={2} min={0} max={4} step={0.5} />\n\n<Param name="v0" value={2} min={1} max={4} step={0.5} />\n\n' + motion + extra
  const ok =
    '<Motion name="pt" until={3} mass={1} charge={1} state={{x: -1, y: 0, vx: "v0", vy: 0}} fields={[{label: "电场", E: "U", angle: -90, region: {xmin: 0, xmax: 1, ymin: -1, ymax: 1}, enter: "tIn", exit: "tOut"}]} read={{y1: "y @ tOut"}} />'
  const sim =
    '\n\n<Sim title="粒子穿过电场" height={200} duration={3} params={["pt"]}>\nsim({\n  at(t, p) { return p.pt.state(t) },\n  draw(ctx, s, v) {\n    const m = v.view({ xmin: -2, xmax: 2, ymin: -2, ymax: 2, equal: true })\n    v.regions(m, v.p.pt)\n    v.ball(m, s.x, s.y, 0.05, { charge: true })\n  },\n})\n</Sim>\n'
  const msgs = (motion: string) => validateLesson(lesson(motion)).errors.map((e) => e.message).join('\n')

  it('warns when a read depends on an event that never fires, and hints at gravity for a charge', () => {
    const noG =
      '<Motion name="pt" until={1} mass={1} charge={1} state={{x: 0, y: 1, vx: 0, vy: 0}} fields={[{E: "U", angle: 0}]} events={[{name: "tHit", when: "y", dir: "down", stop: true}]} read={{x1: "x @ tHit"}} />'
    const w = validateLesson(lesson(noG, sim)).warnings.map((x) => x.message).join('\n')
    expect(w).toContain('事件 tHit 在 until 内没有发生')
    expect(w).toContain('forces')
    const withG = noG.replace('fields=', 'forces={[{label: "G", angle: -90, magnitude: 10}]} fields=')
    expect(validateLesson(lesson(withG, sim)).warnings.map((x) => x.message).join('\n')).not.toContain('tHit')
  })

  it('accepts a lesson that draws its regions from the motion', () => {
    const src = lesson(ok, sim)
    const v = validateLesson(src)
    expect(v.errors).toEqual([])
    expect(v.warnings).toEqual([])
    const store = new ParamStore(buildRegistry(parseLesson(src).blocks))
    expect(store.paramRoots(['y1']).has('U')).toBe(true)
    expect(store.paramRoots(['y1']).has('v0')).toBe(true)
    expect(store.getScope().y1).toBeCloseTo(-0.25, 5)
    store.set({ U: 4 })
    expect(store.getScope().y1).toBeCloseTo(-0.5, 5)
    const scope = store.getScope()
    const runtime = buildRuntime()
    const body = 'sim({ at(t, p) { return p.pt.state(t) }, draw(ctx, s, v) { const m = v.view({ xmin: -2, xmax: 2, ymin: -2, ymax: 2, equal: true }); if (!v.p.pt.fields || v.p.pt.fields[0].angle !== -90) throw new Error("angle"); v.regions(m, v.p.pt); v.ball(m, s.x, s.y, 0.05) } })'
    const checked = checkSim(body, runtime, [{ label: '初始', params: { pt: motionPayload(scope.pt) }, times: [0, 0.5, 1] }])
    expect(checked).toEqual({ errors: [], warnings: [] })
  })

  it('rejects a field that is not a free-motion charge', () => {
    const free = (fields: string, extra = '') =>
      `<Motion name="pt" until={1} mass={1} charge={1} state={{x: 0, y: 0, vx: 1, vy: 0}} ${extra} fields={${fields}} />`
    expect(msgs(ok.replace(' charge={1}', ''))).toContain('charge 和 fields 要一起写')
    expect(msgs('<Motion name="pt" until={1} mass={1} charge={1} along={0} state={{x: 0, v: 1}} forces={[{label: "G", angle: -90, magnitude: 1}]} fields={[{B: 1, dir: "out"}]} />')).toContain('直线')
    expect(msgs(free('[{B: 1}]'))).toContain('就要写 dir')
    expect(msgs(free('[{B: 1, dir: "side"}]'))).toContain('只能是 in 或 out')
    expect(msgs(ok.replace(', angle: -90', ''))).toContain('angle')
    expect(msgs(ok.replace('xmin: 0', 'xmin: "t"'))).toContain('只能用参数')
    expect(msgs(ok.replace('region: {xmin: 0, xmax: 1, ymin: -1, ymax: 1}', 'region: {cx: 0, cy: 0}'))).toContain('一起写')
    expect(msgs(ok.replace('enter: "tIn"', 'enter: "x"'))).toContain('状态量')
    expect(msgs(free('[{B: 1, dir: "out", region: {points: [[0, 0], [1, 0]]}}]'))).toContain('至少要有 3')
    expect(msgs(free('[{B: 1, dir: "out", region: {cx: 0, cy: 0, r: 1, from: 0}}]'))).toContain('要一起写')
    expect(msgs(free('[{B: 1, dir: "out", region: {xmin: 0, from: 0, to: 180}}]'))).toContain('只和圆形')
    expect(msgs(free('[{B: 1, dir: "out", region: {points: [["t", 0], [1, 0], [0, 1]]}}]'))).toContain('只能用参数')
  })

  it('rejects a radial angle, a point charge with E, and an inner radius that is not a circle', () => {
    const fly = (fields: string) =>
      `<Motion name="pt" until={1} mass={1} charge={1} state={{x: 2, y: 0, vx: 0, vy: 1}} fields={${fields}} />`
    expect(msgs(fly('[{radial: true, cx: 0, cy: 0, E: "-1/r", angle: 90}]'))).toContain('不能再写 angle')
    expect(msgs(fly('[{Q: 1, x: 0, y: 0, k: 1, E: 2, angle: 0}]'))).toContain('不能再写 E')
    expect(msgs(fly('[{B: 1, dir: "out", region: {xmin: 0, inner: 0.2}}]'))).toContain('inner')
    expect(msgs(fly('[{B: 1, dir: "out", region: {xmin: 0, inner: 0.2}}]'))).toContain('圆形')
    const okNonuniform =
      '<Motion name="pt" until={2} mass={1} charge={1} state={{x: 3, y: 0.4, vx: -1, vy: 0.2}} fields={[{label: "核", Q: 1, x: 0, y: 0, k: 1}, {label: "扇环", radial: true, cx: 0, cy: 0, E: "-1/r", region: {cx: 0, cy: 0, r: 2, inner: 0.3, from: -30, to: 210}, enter: "tIn"}]} />'
    const v = validateLesson(lesson(okNonuniform))
    expect(v.errors).toEqual([])
  })

  it('warns when the particle never reaches a region', () => {
    const src = head + '<Motion name="pt" until={1} mass={1} charge={1} state={{x: -1, y: 0, vx: -2, vy: 0}} fields={[{B: 1, dir: "out", region: {xmin: 0}, enter: "tIn"}]} />\n'
    const v = validateLesson(src)
    expect(v.errors).toEqual([])
    const warnings = v.warnings.map((w) => w.message).join()
    expect(warnings).toContain('没有进入第 1 个场区')
    // The entry time is NaN by contract; the region warning above already says why.
    expect(warnings).not.toMatch(/tIn/)
  })
})
