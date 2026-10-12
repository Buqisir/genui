import { buildRuntime } from '../sim/buildRuntime'
import { describe, expect, it } from 'vitest'
import type { Scope } from './expr'
import { motionPayload, motionValues, type MotionObject } from './motion'
import { checkSim } from './simcheck'
import { motionSpecOf, runMotion } from './solvers'
import { parseLesson } from './parse'
import { buildRegistry, ParamStore } from './store'
import { validateLesson } from './validate'

const g = 10
const scope0: Scope = { g, m: 1 }

function simulate(props: Record<string, unknown>, scope: Scope = {}) {
  const spec = motionSpecOf(props)
  if (!spec) throw new Error('no spec')
  const sc = { ...scope0, ...scope }
  const run = runMotion(spec, sc)
  const out = motionValues('ball', spec, run, sc)
  return { spec, run, out, ball: out.ball as MotionObject }
}

const G = [{ label: 'G', angle: -90, magnitude: 'm*g' }]
const num = (o: MotionObject, k: string, t: number) => (o[k] as (t: number) => number)(t)

describe('motion on a track', () => {
  it('frictionless loop: N at the top is mv²/R − mg', () => {
    const v0 = Math.sqrt(6 * g * 1)
    const { run, ball, out } = simulate({
      mass: 'm',
      until: 3,
      steps: 2000,
      state: { s: 0, v: v0 },
      track: {
        pieces: [
          { line: [0, 0, 1, 0] },
          { arc: [1, 1, 1, -90, 270] },
        ],
        friction: 'f',
      },
      forces: G,
      events: [{ name: 'tTop', when: 'vy', dir: 'down' }],
    })
    expect(run.warnings).toEqual([])
    const tTop = run.events.tTop[0]
    expect(Number.isFinite(tTop)).toBe(true)
    const top = run.at(tTop)
    expect(top.y).toBeCloseTo(2, 5)
    expect(top.x).toBeCloseTo(1, 5)
    expect(top.v ** 2).toBeCloseTo(20, 4)
    expect(top.N).toBeCloseTo(10, 4)
    expect(top.f).toBeCloseTo(0, 8)
    const payload = motionPayload(ball) as { vars: string[]; track: { line?: number[]; arc?: number[]; pipe: boolean }[] }
    expect(payload.vars).toEqual(expect.arrayContaining(['x', 'y', 's', 'v', 'N']))
    expect(payload.track).toEqual([
      { line: [0, 0, 1, 0], pipe: false, flip: false },
      { arc: [1, 1, 1, -90, 270], pipe: false, flip: false },
    ])
    expect(num(ball, 'x', tTop)).toBeCloseTo(1, 5)
    expect(out.tTop).toBeCloseTo(tTop, 12)
  })

  it('flies off at a junction onto a hump taken faster than √(gR)', () => {
    const v0 = Math.sqrt(2 * g * 1)
    const { run, out } = simulate({
      mass: 'm',
      until: 1,
      steps: 1000,
      state: { s: 0, v: v0 },
      track: {
        pieces: [
          { line: [0, 1, 1, 1] },
          { arc: [1, 0, 1, 90, 0] },
        ],
        leave: 'tLeave',
      },
      forces: G,
    })
    expect(run.warnings).toEqual([])
    expect(out.tLeave).toBeCloseTo(1 / v0, 9)
    const later = run.at(0.3)
    expect(later.x).toBeCloseTo(1 + v0 * (0.3 - 1 / v0), 6)
    expect(later.y).toBeCloseTo(1 - 0.5 * g * (0.3 - 1 / v0) ** 2, 6)
    expect(later.N).toBe(0)
  })

  it('stays on a hump taken slower than √(gR) and lets go at cos θ = (v0²/gR + 2)/3', () => {
    const v0 = 1
    const { out } = simulate({
      mass: 'm',
      until: 2,
      steps: 2000,
      state: { s: 0, v: v0 },
      track: { pieces: [{ line: [0, 1, 1, 1] }, { arc: [1, 0, 1, 90, 0] }], leave: 'tLeave' },
      forces: G,
      read: { yL: 'y @ tLeave' },
    })
    expect(out.yL).toBeCloseTo((v0 * v0 / g + 2) / 3, 5)
  })

  it('leaves the inside of a loop and then follows a parabola', () => {
    const v0 = Math.sqrt(3.5 * g)
    const { run, out } = simulate({
      mass: 'm',
      until: 3,
      steps: 2000,
      state: { s: 0, v: v0 },
      track: {
        pieces: [
          { line: [0, 0, 1, 0] },
          { arc: [1, 1, 1, -90, 270] },
        ],
        leave: 'tLeave',
      },
      forces: G,
    })
    expect(run.warnings).toEqual([])
    const tL = out.tLeave as number
    expect(Number.isFinite(tL)).toBe(true)
    const at = run.at(tL)
    expect(at.y).toBeCloseTo(1.5, 4)
    expect(at.speed ** 2).toBeCloseTo(5, 4)
    const dt = 0.2
    const later = run.at(tL + dt)
    expect(later.vx).toBeCloseTo(at.vx, 5)
    expect(later.vy).toBeCloseTo(at.vy - g * dt, 5)
    expect(later.x).toBeCloseTo(at.x + at.vx * dt, 5)
    expect(later.y).toBeCloseTo(at.y + at.vy * dt - 0.5 * g * dt * dt, 5)
  })

  it('leaves a convex hump where cosθ = (v0²/gR + 2)/3', () => {
    const v0 = 0.5
    const { run, out } = simulate({
      mass: 'm',
      until: 2,
      steps: 2000,
      state: { s: 0, v: v0 },
      track: { pieces: [{ arc: [0, 0, 1, 90, 0] }], leave: 'tLeave' },
      forces: G,
    })
    expect(run.warnings).toEqual([])
    const tL = out.tLeave as number
    expect(Number.isFinite(tL)).toBe(true)
    const at = run.at(tL)
    const cos = (v0 * v0 / g + 2) / 3
    expect(at.y).toBeCloseTo(cos, 4)
    expect(at.x ** 2 + at.y ** 2).toBeCloseTo(1, 4)
    expect(at.speed ** 2).toBeCloseTo(g * cos, 4)
  })

  it('a pipe does not let go when N becomes negative', () => {
    const v0 = Math.sqrt(3.5 * g)
    const { run, out } = simulate({
      mass: 'm',
      until: 4,
      steps: 2000,
      state: { s: 0, v: v0 },
      track: {
        pieces: [{ arc: [0, 1, 1, -90, 270], pipe: true }],
        leave: 'tLeave',
        together: 'tTurn',
        start: 'stop',
      },
      forces: G,
    })
    expect(run.warnings).toEqual([])
    expect(out.tLeave).toBeNaN()
    const tTurn = out.tTurn as number
    expect(Number.isFinite(tTurn)).toBe(true)
    const at = run.at(tTurn)
    expect(at.y).toBeCloseTo(1.75, 4)
    expect(at.N).toBeCloseTo(-7.5, 3)
    expect(Math.hypot(at.x, at.y - 1)).toBeCloseTo(1, 4)
    expect(run.end).toBeGreaterThan(tTurn)
    expect(Math.hypot(run.at(tTurn / 2).x, run.at(tTurn / 2).y - 1)).toBeCloseTo(1, 4)
    const payload = motionPayload(out.ball) as { track: { pipe: boolean }[] }
    expect(payload.track[0].pipe).toBe(true)
  })

  it('stops on a rough patch and stays stuck', () => {
    const v = 4
    const mu = 0.5
    const { run, out } = simulate({
      mass: 'm',
      until: 3,
      state: { s: 0, v },
      track: {
        pieces: [
          { line: [0, 0, 2, 0] },
          { line: [2, 0, 10, 0], mu },
        ],
        friction: 'f',
        together: 'tStop',
      },
      forces: G,
    })
    expect(run.warnings).toEqual([])
    const enter = 2 / v
    expect(out.tStop).toBeCloseTo(enter + v / (mu * g), 6)
    expect(run.at(out.tStop as number).s).toBeCloseTo(2 + v * v / (2 * mu * g), 6)
    expect(run.at(0.2).f).toBeCloseTo(0, 8)
    expect(run.at(enter + 0.2).f).toBeCloseTo(-mu * g, 6)
    expect(run.at(2).s).toBeCloseTo(2 + v * v / (2 * mu * g), 6)
    expect(run.at(2).v).toBe(0)
    expect(run.at(2).acc).toBe(0)
  })

  it('rests on an incline when tanθ < μs, and slides when it does not', () => {
    const th = 30 * Math.PI / 180
    const L = 5
    const line = [0, 1, L * Math.cos(th), 1 - L * Math.sin(th)]
    const held = simulate({
      mass: 'm',
      until: 1,
      state: { s: 0, v: 0 },
      track: { pieces: [{ line, mu: 0.5, static: 0.8 }], friction: 'f' },
      forces: G,
    })
    expect(held.run.warnings).toEqual([])
    expect(held.run.at(1).s).toBe(0)
    expect(held.run.at(1).v).toBe(0)
    expect(held.run.at(1).acc).toBe(0)
    expect(held.run.at(0.5).N).toBeCloseTo(g * Math.cos(th), 8)
    expect(held.run.at(0.5).f).toBeCloseTo(-g * Math.sin(th), 8)

    const mu = 0.2
    const slide = simulate({
      mass: 'm',
      until: 1,
      state: { s: 0, v: 0 },
      track: { pieces: [{ line, mu, static: mu }], friction: 'f' },
      forces: G,
    })
    const a = g * (Math.sin(th) - mu * Math.cos(th))
    expect(slide.run.at(0.4).acc).toBeCloseTo(a, 8)
    expect(slide.run.at(0.4).v).toBeCloseTo(a * 0.4, 8)
    expect(slide.run.at(1).s).toBeCloseTo(0.5 * a, 7)
  })

  it('bounces off the end with −e v, or stops the run there', () => {
    const back = simulate({
      mass: 'm',
      until: 1,
      state: { s: 0, v: 3 },
      track: { pieces: [{ line: [0, 0, 2, 0] }], end: { bounce: 1 } },
      forces: G,
    })
    expect(back.run.warnings).toEqual([])
    expect(back.run.at(1).v).toBeCloseTo(-3, 6)
    expect(back.run.at(1).s).toBeCloseTo(1, 6)
    expect(back.run.end).toBeCloseTo(1, 8)

    const stopped = simulate({
      mass: 'm',
      until: 2,
      state: { s: 0, v: 3 },
      track: { pieces: [{ line: [0, 0, 2, 0] }], end: 'stop' },
      forces: G,
    })
    expect(stopped.run.end).toBeCloseTo(2 / 3, 8)
    expect(stopped.run.at(stopped.run.end).s).toBeCloseTo(2, 6)
  })

  it('flies off a platform and lands a projectile flight later', () => {
    const v = 4
    const h = 5
    const L = 2
    const { run, out } = simulate({
      mass: 'm',
      until: 3,
      state: { s: 0, v },
      track: { pieces: [{ line: [0, h, L, h] }], leave: 'tLeave' },
      forces: G,
      events: [{ name: 'tLand', when: 'y', dir: 'down', stop: true }],
      read: { xLand: 'x @ tLand' },
    })
    expect(run.warnings).toEqual([])
    const flight = Math.sqrt((2 * h) / g)
    expect(out.tLeave).toBeCloseTo(L / v, 8)
    expect(out.tLand).toBeCloseTo(L / v + flight, 6)
    expect(out.xLand).toBeCloseTo(L + v * flight, 5)
    expect(run.at(1).vx).toBeCloseTo(v, 8)
    expect(run.at(1).y).toBeCloseTo(h - 0.5 * g * (1 - L / v) ** 2, 6)
  })

  it('charged ball in a loop with qE = mg moves in a uniform circle', () => {
    const { run, out } = simulate({
      mass: 'm',
      charge: 1,
      until: 2,
      steps: 2000,
      state: { s: 0, v: 2 },
      track: { pieces: [{ arc: [5, 0, 1, -90, 270] }] },
      forces: G,
      fields: [{ E: 'm*g', angle: 90, region: { xmin: 3 }, enter: 'tIn' }],
    })
    expect(run.warnings).toEqual([])
    expect(out.tIn).toBe(0)
    for (const t of [0, 0.4, 1, 1.7]) {
      const s = run.at(t)
      expect(s.N).toBeCloseTo(4, 4)
      expect(s.speed).toBeCloseTo(2, 4)
      expect(Math.hypot(s.x - 5, s.y)).toBeCloseTo(1, 4)
    }
  })

  it('lands on a line-to-arc junction and N jumps with the curvature', () => {
    const { run, out } = simulate({
      mass: 'm',
      until: 2,
      steps: 2000,
      state: { s: 0, v: 2 },
      track: {
        pieces: [
          { line: [0, 0, 2, 0] },
          { arc: [2, 1, 1, -90, 90] },
        ],
      },
      forces: G,
      events: [{ name: 'tJ', when: 's - 2', dir: 'up' }],
    })
    expect(run.warnings).toEqual([])
    const tJ = out.tJ as number
    expect(Math.abs(tJ - 1)).toBeLessThan(1e-8)
    expect(Math.abs(run.at(tJ).s - 2)).toBeLessThan(1e-8)
    expect(run.at(tJ - 1e-6).N).toBeCloseTo(g, 4)
    expect(run.at(tJ).N).toBeCloseTo(g + 4, 4)
    expect(run.at(tJ).y).toBeCloseTo(0, 5)
  })

  it('warns when the track is open, s0 is off it, or N is already negative', () => {
    const gap = simulate({
      mass: 'm',
      until: 0.2,
      state: { s: 0, v: 1 },
      track: { pieces: [{ line: [0, 0, 1, 0] }, { line: [1.01, 0, 2, 0] }] },
      forces: G,
    })
    expect(gap.run.warnings.join()).toContain('没有接上')

    const off = simulate({
      mass: 'm',
      until: 0.2,
      state: { s: 5, v: 1 },
      track: { pieces: [{ line: [0, 0, 1, 0] }] },
      forces: G,
    })
    expect(off.run.warnings.join()).toContain('不在轨道上')

    const drop = simulate({
      mass: 'm',
      until: 0.5,
      state: { s: 0, v: 0 },
      track: { pieces: [{ arc: [0, 0, 1, 90, 270] }], leave: 'tLeave' },
      forces: G,
    })
    expect(drop.run.warnings.join()).toContain('一开始支持力就小于零')
    expect(drop.out.tLeave).toBe(0)
    expect(drop.run.at(0.2).y).toBeCloseTo(1 - 0.5 * g * 0.04, 5)
    expect(drop.run.at(0.2).x).toBeCloseTo(0, 5)
  })
})

describe('track validator and drawing', () => {
  const head = ['---', 'title: t', 'demo: true', '---', ''].join('\n')
  const lesson = (motion: string, extra = '') =>
    head + '<Param name="m" value={1} min={1} max={2} step={1} label="m" />\n<Param name="mu" value={0.5} min={0.1} max={1} step={0.1} label="μ" />\n' + motion + extra
  const msgs = (motion: string) => validateLesson(lesson(motion)).errors.map((e) => e.message).join('\n')
  const ok =
    '<Motion name="b" mass="m" until={1} state={{s: 0, v: 1}} track={{pieces: [{line: [0, 0, 1, 0]}]}} forces={[{label: "G", angle: -90, magnitude: "m*10"}, {label: "f", angle: "tangent + 180", magnitude: 0}]} />'

  it('rejects friction written as a force, a missing s, and track combined with along', () => {
    expect(msgs(ok)).toBe('')
    expect(validateLesson(lesson(ok)).warnings).toEqual([])
    expect(msgs(ok.replace('magnitude: 0}]}', 'friction: {mu: 0.2, normal: "N"}}]}'))).toContain('不要在 forces 里写 solve')
    expect(msgs(ok.replace('state={{s: 0, v: 1}}', 'state={{v: 1}}'))).toContain('缺 s')
    expect(msgs(ok.replace('until={1}', 'along={0} until={1}'))).toContain('不能和')
    expect(msgs(ok.replace('line: [0, 0, 1, 0]', 'line: [0, 0, "t", 0]'))).toContain('只能用参数')
    expect(msgs(ok.replace('pieces: [{line: [0, 0, 1, 0]}]', 'pieces: []'))).toContain('非空')
  })

  it('re-integrates when a piece μ changes', () => {
    const src =
      lesson(
        '<Motion name="b" mass={1} until={3} state={{s: 0, v: 4}} track={{pieces: [{line: [0, 0, 10, 0], mu: "mu"}], together: "tStop"}} forces={[{label: "G", angle: -90, magnitude: 10}]} read={{sStop: "s @ tStop"}} />',
      )
    const v = validateLesson(src)
    expect(v.errors).toEqual([])
    const store = new ParamStore(buildRegistry(parseLesson(src).blocks))
    expect(store.paramRoots(['sStop']).has('mu')).toBe(true)
    expect(store.getScope().sStop).toBeCloseTo(4 * 4 / (2 * 0.5 * 10), 5)
    store.set({ mu: 0.4 })
    expect(store.getScope().sStop).toBeCloseTo(4 * 4 / (2 * 0.4 * 10), 5)
  })

  it('draws a pipe and accepts a motion object as the piece list', () => {
    const runtime = buildRuntime()
    const body = [
      'sim({ at(t) { return { t } }, draw(ctx, s, v) {',
      '  const m = v.view({xmin: -1, xmax: 4, ymin: -1, ymax: 3, equal: true})',
      '  const tr = v.track(m, [{line: [0, 0, 2, 0], pipe: true}, {arc: [2, 1, 1, -90, 90], pipe: true}])',
      '  const p = tr.at(2)',
      '  if (Math.abs(p[0] - 2) > 1e-9 || Math.abs(p[1]) > 1e-9) throw new Error("centerline at the joint")',
      '  const q = tr.at(2 + Math.PI / 2)',
      '  if (Math.abs(q[0] - 3) > 1e-9 || Math.abs(q[1] - 1) > 1e-9) throw new Error("arc centerline")',
      '  v.track(m, {track: [{line: [0, 0, 1, 0], pipe: true, flip: true}]}, {pipeWidth: 22})',
      '} })',
    ].join('\n')
    expect(checkSim(body, runtime, [{ label: '初始', params: {}, times: [0] }])).toEqual({ errors: [], warnings: [] })
  })
})
