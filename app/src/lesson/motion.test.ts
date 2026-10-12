import { describe, expect, it } from 'vitest'
import { integrate, motionPayload, motionValues, type MotionSpec } from './motion'
import { parseLesson } from './parse'
import { motionSpecOf, runMotion } from './solvers'
import { buildRegistry, ParamStore } from './store'
import { validateLesson } from './validate'
import type { Scope } from './expr'

describe('motion integrator', () => {
  const toss: MotionSpec = {
    state: { y: 'h', v: 'v0' },
    rates: { y: 'v', v: '-g' },
    until: 10,
    events: [
      { name: 'tTop', when: 'v', dir: 'down' },
      { name: 'tHit', when: 'y', dir: 'down', stop: true },
    ],
    read: { vHit: 'v @ tHit', H: 'max(y)', yHalf: 'y @ tTop/2' },
  }
  const scope = { h: 20, v0: 15, g: 10 }

  it('finds event times and readings of a vertical toss to machine-level accuracy', () => {
    const run = integrate(toss, scope)
    const tHit = (15 + Math.sqrt(15 * 15 + 2 * 10 * 20)) / 10
    expect(run.events.tTop[0]).toBeCloseTo(1.5, 9)
    expect(run.end).toBeCloseTo(tHit, 9)
    const out = motionValues('ball', toss, run, scope) as Record<string, number> & { ball: { y: (t: number) => number; tEnd: number } }
    expect(out.tHit).toBeCloseTo(tHit, 9)
    expect(out.vHit).toBeCloseTo(-Math.sqrt(15 * 15 + 2 * 10 * 20), 8)
    expect(out.H).toBeCloseTo(20 + (15 * 15) / 20, 8)
    expect(out.yHalf).toBeCloseTo(20 + 15 * 0.75 - 5 * 0.75 * 0.75, 9)
    expect(out.ball.y(1)).toBeCloseTo(20 + 15 - 5, 9)
    expect(out.ball.y(99)).toBeCloseTo(0, 6)
    expect(out.ball.tEnd).toBeCloseTo(tHit, 9)
  })

  it('bounces with a restitution reset and counts every impact', () => {
    const spec: MotionSpec = {
      state: { y: 5, v: 0 },
      rates: { y: 'v', v: '-10' },
      until: 4,
      events: [{ name: 'tBounce', when: 'y', dir: 'down', set: { v: '-0.5*v' } }],
    }
    const run = integrate(spec, {})
    const t1 = 1
    const t2 = t1 + 2 * (0.5 * 10 * t1) / 10
    expect(run.events.tBounce[0]).toBeCloseTo(t1, 9)
    expect(run.events.tBounce[1]).toBeCloseTo(t2, 9)
    expect(run.at(t1 + 0.5).v).toBeCloseTo(5 - 5, 9)
  })

  it('handles velocity-dependent forces (drag approaches terminal speed)', () => {
    const run = integrate({ state: { v: 0 }, rates: { v: 'g - k*v' }, until: 5 }, { g: 10, k: 2 })
    expect(run.at(5).v).toBeCloseTo(5 * (1 - Math.exp(-10)), 9)
  })

  it('serialises samples for the sandbox', () => {
    const run = integrate(toss, scope)
    const out = motionValues('ball', toss, run, scope)
    const p = motionPayload(out.ball) as { __motion: number; vars: string[]; t: number[]; s: number[][] }
    expect(p.__motion).toBe(1)
    expect(p.vars).toEqual(['y', 'v'])
    expect(p.s[0].length).toBe(p.t.length)
    expect(JSON.parse(JSON.stringify(p)).end).toBeCloseTo(run.end, 6)
  })
})

describe('<Motion> in a lesson', () => {
  const src = [
    '---',
    'id: t',
    'title: t',
    'question: q',
    'answers:',
    '  - { name: tHit, value: 2 }',
    '  - { name: vHit, value: -20 }',
    '---',
    '',
    '<Param name="h" value={20} min={5} max={40} />',
    '',
    '<Param name="t" value={0} min={0} max={5} hidden />',
    '',
    '<Motion name="ball" state={{ y: "h", v: 0 }} rates={{ y: "v", v: "-10" }} until={10}',
    '  events={[{ name: "tHit", when: "y", dir: "down", stop: true }]}',
    '  read={{ vHit: "v @ tHit" }} />',
    '',
    '<Define name="yNow" expr="ball.y(t)" />',
    '',
    '<Figure params={["h"]}>',
    'figure({ draw() {} })',
    '</Figure>',
    '',
  ].join('\n')

  it('publishes event times, readings and functions of time, checked against answers', () => {
    const r = validateLesson(src)
    expect(r.errors).toEqual([])
    expect(r.scope?.tHit).toBeCloseTo(2, 9)
    const store = new ParamStore(buildRegistry(parseLesson(src).blocks))
    store.set({ t: 1 })
    expect(store.getScope().yNow).toBeCloseTo(15, 9)
    store.set({ h: 45 })
    expect(store.getScope().tHit).toBeCloseTo(3, 9)
    expect(store.paramRoots(['yNow']).has('h')).toBe(true)
    const wrong = validateLesson(src.replace('value: 2 }', 'value: 2.5 }'))
    expect(wrong.errors.some((e) => e.message.includes('答案不一致'))).toBe(true)
  })

  it('does not re-integrate when the initial scope is read alongside changed params', () => {
    const reg = buildRegistry(parseLesson(src).blocks)
    const solver = reg.order.find((d) => d.solver)!.solver!
    let runs = 0
    const run = solver.run
    solver.run = (sc) => (runs++, run(sc))
    const store = new ParamStore(reg)
    store.set({ h: 30 })
    runs = 0
    for (let f = 1; f <= 20; f++) {
      store.set({ t: f / 10 })
      expect(store.initialScope().tHit).toBeCloseTo(2, 9)
      store.scopeWith({ h: 20 })
    }
    expect(runs).toBe(0)
    expect(store.getScope().tHit).toBeCloseTo(Math.sqrt(6), 9)
  })

  it('rejects rates for undeclared state and bad read specs', () => {
    const bad = validateLesson(src.replace('rates={{ y: "v", v: "-10" }}', 'rates={{ y: "v", w: "-10" }}').replace('"v @ tHit"', '"v at tHit"'))
    expect(bad.errors.some((e) => e.message.includes('rates'))).toBe(true)
    expect(bad.errors.some((e) => e.message.includes('read'))).toBe(true)
  })
})

describe('accelerating frame, belt, buoyancy, tipping', () => {
  const snap = (props: Record<string, unknown>, scope: Scope) => {
    const spec = motionSpecOf({ until: 1, state: {}, ...props })
    if (!spec?.derive) throw new Error('no dynamics')
    const initial = props.state && typeof props.state === 'object' ? (props.state as Scope) : {}
    const sc: Scope = { ...initial, ...scope }
    Object.assign(sc, spec.init?.(sc, () => {}) ?? {})
    spec.derive(sc, () => {})
    return sc
  }

  it('an object at rest in a rising basket has no relative acceleration and the basket absolute acceleration', () => {
    // aFrame is positive downward, so −4 is a basket accelerating upward at 4.
    // N = m(g + 4) holds it at rest in the basket; the fictitious force is m·4 downward.
    const sc = snap(
      {
        mass: 2,
        aFrame: -4,
        forces: [
          { label: 'G', angle: -90, magnitude: 20 },
          { label: 'N', angle: 90, magnitude: 28 },
        ],
      },
      { g: 10 },
    )
    expect(sc.gEff).toBeCloseTo(14, 9)
    expect(sc.accx).toBeCloseTo(0, 9)
    expect(sc.accy).toBeCloseTo(0, 9)
    expect(sc.aAbsy).toBeCloseTo(4, 9)
  })

  it('neutral buoyancy floats in the basket frame, and free fall of the basket makes buoyancy vanish', () => {
    const floating = snap(
      {
        mass: 2,
        aFrame: -4,
        forces: [
          { label: 'G', angle: -90, magnitude: 20 },
          { label: 'Fb', angle: 90, buoyancy: { rho: 1000, V: 0.002 }, solve: 'Fb' },
        ],
      },
      { g: 10 },
    )
    expect(floating.Fb).toBeCloseTo(28, 9)
    expect(floating.accy).toBeCloseTo(0, 9)

    const falling = snap(
      {
        mass: 2,
        aFrame: 10,
        forces: [
          { label: 'G', angle: -90, magnitude: 20 },
          { label: 'Fb', angle: 90, buoyancy: { rho: 1000, V: 0.002 }, solve: 'Fb' },
        ],
      },
      { g: 10 },
    )
    expect(falling.gEff).toBeCloseTo(0, 9)
    expect(falling.Fb).toBeCloseTo(0, 9)
    expect(falling.accy).toBeCloseTo(0, 9)
    expect(falling.aAbsy).toBeCloseTo(-10, 9)
  })

  it('a block on a level belt speeds up to the belt and then the sliding mark stops growing', () => {
    const spec = motionSpecOf({
      mass: 1,
      along: 0,
      until: 3,
      state: { x: 0, v: 0 },
      forces: [
        { label: 'G', angle: -90, magnitude: 10 },
        { label: 'N', angle: 90, solve: 'N' },
        { label: 'f', solve: 'f', friction: { mu: 0.2, static: 0.5, normal: 'N', belt: 2 } },
      ],
    })
    if (!spec) throw new Error('no spec')
    const scope = { g: 10 }
    const start = snap(
      {
        mass: 1,
        along: 0,
        state: { x: 0, v: 0 },
        forces: [
          { label: 'G', angle: -90, magnitude: 10 },
          { label: 'N', angle: 90, solve: 'N' },
          { label: 'f', solve: 'f', friction: { mu: 0.2, static: 0.5, normal: 'N', belt: 2 } },
        ],
      },
      scope,
    )
    expect(start.N).toBeCloseTo(10, 8)
    expect(start.acc).toBeCloseTo(2, 8)
    expect(start.f).toBeCloseTo(2, 8)

    const run = runMotion(spec, scope)
    const box = motionValues('box', spec, run, scope).box as { v: (t: number) => number; slide: (t: number) => number; Q: (t: number) => number }
    expect(box.v(0.5)).toBeGreaterThan(0.5)
    expect(box.v(2)).toBeCloseTo(2, 2)
    // a = μg = 2, catch at t = v0/(μg) = 1, mark = v0²/(2μg) = 1, heat = ½mv0² = 2.
    expect(box.slide(2)).toBeCloseTo(1, 2)
    expect(box.Q(2)).toBeCloseTo(2, 2)
    const mid = box.slide(1.2)
    const late = box.slide(2.5)
    expect(mid).toBeGreaterThan(0.5)
    expect(late).toBeCloseTo(mid, 1)
  })

  it('an inclined belt sticks when μ > tanθ and keeps sliding when μ < tanθ', () => {
    const belt = (mu: number) =>
      snap(
        {
          mass: 1,
          along: 30,
          state: { x: 0, v: 0 },
          forces: [
            { label: 'G', angle: -90, magnitude: 10 },
            { label: 'N', angle: 120, solve: 'N' },
            { label: 'f', solve: 'f', friction: { mu, static: mu, normal: 'N', belt: 0 } },
          ],
        },
        { g: 10 },
      )
    const held = belt(0.8)
    expect(held.acc).toBeCloseTo(0, 6)
    const sliding = belt(0.2)
    const sin = 0.5
    const cos = Math.cos(Math.PI / 6)
    // +x is up the slope, so the downslope acceleration is negative.
    expect(sliding.acc).toBeCloseTo(-10 * (sin - 0.2 * cos), 5)
  })

  it('a block sent onto a belt running the other way slides until it matches the belt', () => {
    // 2019 二15: the belt turns counterclockwise, so the top surface runs left (belt speed negative).
    const spec = motionSpecOf({
      mass: 1,
      along: 0,
      until: 3,
      state: { x: 0, v: 2 },
      forces: [
        { label: 'G', angle: -90, magnitude: 10 },
        { label: 'N', angle: 90, solve: 'N' },
        { label: 'f', solve: 'f', friction: { mu: 0.2, static: 0.5, normal: 'N', belt: -2 } },
      ],
    })
    if (!spec) throw new Error('no spec')
    const run = runMotion(spec, { g: 10 })
    const box = motionValues('box', spec, run, { g: 10 }).box as { v: (t: number) => number; slide: (t: number) => number; Q: (t: number) => number }
    expect(box.v(0)).toBeCloseTo(2, 6)
    expect(box.v(2.2)).toBeCloseTo(-2, 2)
    // Relative speed starts at 4 and falls at 2 m/s², so the mark is 4²/(2·2) = 4 and Q = μN·mark = 8.
    expect(box.slide(2.5)).toBeCloseTo(4, 2)
    expect(box.Q(2.5)).toBeCloseTo(8, 2)
  })

  it('a spring in water keeps its force when the basket falls, so the ball heads for the natural length', () => {
    // Cup frame. x = 0 is the spring's natural length, +x up. k = 20.
    const ball = (x: number, cut: number) =>
      snap(
        {
          mass: 0.1,
          along: 90,
          aFrame: cut * 10,
          state: { x, v: 0 },
          forces: [
            { label: 'G', angle: -90, magnitude: 1 },
            { label: 'Fb', angle: 90, buoyancy: { rho: 1000, V: 0.0003 }, solve: 'Fb' },
            { label: 'Fs', angle: 90, magnitude: '-20*x' },
          ],
        },
        { g: 10, x },
      )
    const held = ball(0.1, 0)
    expect(held.Fb).toBeCloseTo(3, 8)
    expect(held.acc).toBeCloseTo(0, 6)
    const falling = ball(0.1, 1)
    expect(falling.gEff).toBeCloseTo(0, 8)
    expect(falling.Fb).toBeCloseTo(0, 8)
    // Weight and buoyancy are gone; the stretched spring still pulls down.
    expect(falling.acc).toBeCloseTo(-20, 6)
  })

  it('the tipping boundary a = g b/h does not tip, and just past it does', () => {
    const at = (a: number) =>
      snap(
        {
          mass: 1,
          along: 0,
          tip: { halfWidth: 0.5, comHeight: 1, mu: 0.8, a },
          state: { x: 0, v: 0 },
          forces: [
            { label: 'G', angle: -90, magnitude: 10 },
            { label: 'N', angle: 90, solve: 'N' },
          ],
        },
        { g: 10 },
      )
    expect(at(5).tips).toBe(0)
    expect(at(5).nAt).toBeCloseTo(-0.5, 8)
    expect(at(5.01).tips).toBe(1)
    expect(at(5.01).edge).toBe(-1)
  })

  it('a braking box tips about the back edge when a h exceeds g b, and slides first when μ is smaller than b/h', () => {
    const sc = snap(
      {
        mass: 2,
        along: 0,
        tip: { halfWidth: 0.5, comHeight: 1, mu: 0.4 },
        state: { x: 0, v: 0 },
        forces: [
          { label: 'F', angle: 0, magnitude: 12 },
          { label: 'G', angle: -90, magnitude: 20 },
          { label: 'N', angle: 90, solve: 'N' },
        ],
      },
      { g: 10 },
    )
    expect(sc.acc).toBeCloseTo(6, 8)
    expect(sc.nAt).toBeCloseTo(-0.5, 8)
    expect(sc.tips).toBe(1)
    expect(sc.edge).toBe(-1)
    expect(sc.slides).toBe(1)
    expect(sc.slidesFirst).toBe(1)
  })
})

describe('validator for belt, buoyancy, frame, tipping', () => {
  const lesson = (body: string) =>
    [
      '---',
      'id: t',
      'title: t',
      'subject: physics',
      'topic: t',
      'source: 测试',
      'question: q',
      'answers:',
      '  - { name: sMark, value: 1 }',
      '  - { name: heat, value: 2 }',
      '---',
      '<Define name="g" expr="10" />',
      '<Param name="tk" value={2} min={0} max={3} hidden />',
      body,
    ].join('\n')

  const belt = `<Motion name="belt" mass={1} along={0} until={3} state={{x: 0, v: 0}}
  forces={[
    {label: "G", angle: -90, magnitude: "g"},
    {label: "N", angle: 90, solve: "N"},
    {label: "f", solve: "f", friction: {mu: 0.2, static: 0.5, normal: "N", belt: 2}}
  ]}
  read={{sMark: "slide @ tEnd", heat: "Q @ tEnd"}} />
<Motion name="box" mass={1} along={0} until={1} state={{x: 0, v: 0}}
  tip={{halfWidth: 0.5, comHeight: 1, mu: 0.4, a: 6}}
  forces={[
    {label: "G", angle: -90, magnitude: "g"},
    {label: "N2", angle: 90, solve: "N2"},
    {label: "F", angle: 0, magnitude: 6}
  ]} />
<Readout items={[
  {label: "滑痕", expr: "belt.slide(tk)"},
  {label: "热", expr: "belt.Q(tk)"},
  {label: "是否翻倒", expr: "box.tips(tk)"}
]} />
<ForceDiagram forces={[{label: "G", angle: -90, magnitude: "g"}]} />`

  it('accepts slide, Q and tips in a Readout', () => {
    const r = validateLesson(lesson(belt))
    expect(r.errors).toEqual([])
    expect(r.scope?.sMark).toBeCloseTo(1, 2)
    expect(r.scope?.heat).toBeCloseTo(2, 2)
  })

  it('rejects a belt that also names another body, a buoyancy without density, and a tip without a width', () => {
    const msgs = (extra: string) => validateLesson(lesson(extra)).errors.map((e) => e.message).join('\n')
    expect(msgs(belt.replace('belt: 2', 'belt: 2, with: "ground"'))).toContain('不要再写 with')
    expect(msgs(belt.replace('friction: {mu: 0.2, static: 0.5, normal: "N", belt: 2}', 'buoyancy: {V: 0.001}'))).toContain('rho')
    expect(msgs(belt.replace('tip={{halfWidth: 0.5, comHeight: 1, mu: 0.4, a: 6}}', 'tip={{comHeight: 1}}'))).toContain('halfWidth')
    expect(msgs(belt.replace('mass={1} along={0} until={3}', 'mass={1} along={0} until={3} aFrame="nope"'))).toContain('未声明')
  })
})
