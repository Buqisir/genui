import { describe, expect, it } from 'vitest'
import { integrate } from './motion'
import { motionSpecOf } from './solvers'
import type { Scope } from './expr'
import { validateLesson } from './validate'

const g = 10
const d = Math.PI / 180
const run = (props: Record<string, unknown>, scope: Scope = {}) => {
  const spec = motionSpecOf(props)
  if (!spec) throw new Error('no spec')
  return integrate(spec, { g, ...scope })
}

describe('force-driven motion', () => {
  it('free body under gravity is a parabola', () => {
    const r = run({
      mass: 2,
      forces: [{ label: 'G', angle: -90, magnitude: 'm*g' }],
      state: { x: 0, y: 0, vx: 3, vy: 4 },
      until: 0.8,
    }, { m: 2 })
    const s = r.at(0.8)
    expect(s.x).toBeCloseTo(2.4, 9)
    expect(s.y).toBeCloseTo(4 * 0.8 - 5 * 0.64, 9)
    expect(s.accy).toBeCloseTo(-10, 12)
  })

  it('charged particle in a magnetic field moves on a circle (velocity-dependent force)', () => {
    // F = qvB perpendicular to v: r = mv/(qB) = 1, period 2π
    const r = run({
      mass: 1,
      forces: [{ label: 'F', angle: 'atan2(vy, vx) / pi * 180 + 90', magnitude: 'sqrt(vx^2 + vy^2)' }],
      state: { x: 0, y: -1, vx: 1, vy: 0 },
      until: '2*pi',
      steps: 2000,
    })
    const s = r.at(Math.PI)
    expect(s.x).toBeCloseTo(0, 6)
    expect(s.y).toBeCloseTo(1, 6)
    expect(r.at(2 * Math.PI).y).toBeCloseTo(-1, 6)
  })

  const incline = (muS: number) => ({
    mass: 'm',
    along: 30,
    forces: [
      { label: 'G', angle: -90, magnitude: 'm*g' },
      { label: 'N', angle: 120, solve: 'N' },
      { label: 'f', friction: { mu: 0.2, static: muS, normal: 'N' }, solve: 'f' },
    ],
    state: { x: 0, v: 10 },
    until: 3,
    events: [{ name: 'tTop', when: 'v', dir: 'down' }],
    read: { xTop: 'max(x)' },
  })

  it('block thrown up a rough incline: decelerates, stops, slides back', () => {
    const r = run(incline(0.2), { m: 1 })
    const up = g * (Math.sin(30 * d) + 0.2 * Math.cos(30 * d))
    const down = g * (Math.sin(30 * d) - 0.2 * Math.cos(30 * d))
    const t1 = 10 / up
    expect(r.events.tTop[0]).toBeCloseTo(t1, 9)
    expect(r.at(0.1).acc).toBeCloseTo(-up, 9)
    expect(r.at(0.1).N).toBeCloseTo(g * Math.cos(30 * d), 9)
    expect(r.at(0.1).f).toBeCloseTo(-0.2 * g * Math.cos(30 * d), 9)
    expect(r.at(t1 + 0.5).acc).toBeCloseTo(-down, 9)
    const xTop = 100 / (2 * up)
    expect(r.at(3).x).toBeCloseTo(xTop - 0.5 * down * (3 - t1) ** 2, 7)
  })

  it('block thrown up a steep-enough-friction incline sticks at the top', () => {
    const r = run(incline(0.7), { m: 1 })
    const up = g * (Math.sin(30 * d) + 0.2 * Math.cos(30 * d))
    const xTop = 100 / (2 * up)
    expect(r.at(3).x).toBeCloseTo(xTop, 7)
    expect(r.at(3).v).toBe(0)
    // Static friction now holds the block: f = +mg sinθ (up the slope)
    expect(r.at(2.5).f).toBeCloseTo(g * Math.sin(30 * d), 9)
    expect(r.at(2.5).acc).toBe(0)
  })

  it('force growing in time breaks static friction at μs·mg, then kinetic', () => {
    const k = 2
    const m = 1
    const r = run({
      mass: m,
      along: 0,
      forces: [
        { label: 'G', angle: -90, magnitude: 'm*g' },
        { label: 'N', angle: 90, solve: 'N' },
        { label: 'F', angle: 0, magnitude: 'k*t' },
        { label: 'f', friction: { mu: 0.4, static: 0.5, normal: 'N' }, solve: 'f' },
      ],
      state: { x: 0, v: 0 },
      until: 5,
      steps: 2000,
    }, { m, k })
    const tStar = (0.5 * m * g) / k // 2.5 s
    expect(r.at(2).x).toBe(0)
    expect(r.at(2).f).toBeCloseTo(-4, 9)
    // after release: a = (k t − 0.4 m g)/m, v = k(t² − t*²)/2 − 4(t − t*)
    const v = (t: number) => (k * (t * t - tStar * tStar)) / 2 - 0.4 * g * (t - tStar)
    expect(r.at(4).v).toBeCloseTo(v(4), 8)
    expect(r.at(4).f).toBeCloseTo(-4, 9)
  })

  it('Atwood machine: acceleration and rope tension', () => {
    const r = run({
      bodies: [
        { name: 'A', mass: 2, along: 90, forces: [{ label: 'G', angle: -90, magnitude: '2*g' }] },
        { name: 'B', mass: 3, along: -90, forces: [{ label: 'G', angle: -90, magnitude: '3*g' }] },
      ],
      ropes: [{ between: ['A', 'B'], solve: 'T' }],
      until: 1,
    })
    expect(r.at(0.5).accA).toBeCloseTo(2, 12)
    expect(r.at(0.5).accB).toBeCloseTo(2, 12)
    expect(r.at(0.5).T).toBeCloseTo(24, 9)
    expect(r.at(1).xA).toBeCloseTo(1, 9)
  })

  const table = (m2: number) => ({
    bodies: [
      {
        name: 'A', mass: 5, along: 0,
        forces: [
          { label: 'G', angle: -90, magnitude: '5*g' },
          { label: 'N', angle: 90, solve: 'NA' },
          { label: 'f', friction: { mu: 0.2, static: 0.25, normal: 'NA' } },
        ],
      },
      { name: 'B', mass: m2, along: -90, forces: [{ label: 'G', angle: -90, magnitude: `${m2}*g` }] },
    ],
    ropes: [['A', 'B']],
    until: 1,
  })

  it('block on a table pulled by a hanging mass: held by static friction, or sliding', () => {
    const held = run(table(1))
    expect(held.at(1).xA).toBe(0)
    expect(held.at(1).accA).toBe(0)
    const moving = run(table(2))
    expect(moving.at(0.5).accA).toBeCloseTo(10 / 7, 9)
    expect(moving.at(1).xB).toBeCloseTo(5 / 7, 8)
  })

  it('block sliding on a plank: kinetic friction until common velocity, then together', () => {
    const r = run({
      bodies: [
        {
          name: 'A', mass: 1, along: 0, v: 6,
          forces: [
            { label: 'G', angle: -90, magnitude: 'g' },
            { label: 'N', angle: 90, solve: 'NA' },
            { label: 'f', friction: { mu: 0.4, normal: 'NA', with: 'B' }, solve: 'fA' },
          ],
        },
        {
          name: 'B', mass: 2, along: 0,
          forces: [
            { label: 'G', angle: -90, magnitude: '2*g' },
            { label: "N'", angle: -90, magnitude: 'NA' },
            { label: 'N', angle: 90, solve: 'NB' },
          ],
        },
      ],
      events: [{ name: 'tSame', when: 'vA - vB', dir: 'down' }],
      until: 2,
    })
    expect(r.at(0.5).accA).toBeCloseTo(-4, 12)
    expect(r.at(0.5).accB).toBeCloseTo(2, 12)
    expect(r.at(0.5).NB).toBeCloseTo(30, 12)
    expect(r.events.tSame[0]).toBeCloseTo(1, 9)
    const s = r.at(2)
    expect(s.vA).toBeCloseTo(2, 8)
    expect(s.vB).toBeCloseTo(2, 8)
    expect(s.xA - s.xB).toBeCloseTo(3, 8)
    expect(r.at(1.5).fA).toBeCloseTo(0, 9)
  })

  it('plank pulled by a growing force: rests, moves with the block, then the block slips', () => {
    const r = run({
      bodies: [
        {
          name: 'A', mass: 1, along: 0,
          forces: [
            { label: 'G', angle: -90, magnitude: 'g' },
            { label: 'N', angle: 90, solve: 'NA' },
            { label: 'f', friction: { mu: 0.4, normal: 'NA', with: 'B' }, solve: 'fA' },
          ],
        },
        {
          name: 'B', mass: 2, along: 0,
          forces: [
            { label: 'G', angle: -90, magnitude: '2*g' },
            { label: "N'", angle: -90, magnitude: 'NA' },
            { label: 'N', angle: 90, solve: 'NB' },
            { label: 'F', angle: 0, magnitude: '2*t' },
            { label: 'f', friction: { mu: 0.1, normal: 'NB' } },
          ],
        },
      ],
      until: 9,
      steps: 3000,
    })
    expect(r.at(1).vB).toBe(0)
    expect(r.at(5).vA).toBeCloseTo(10 / 3 + 0.75, 7)
    expect(r.at(5).vB).toBeCloseTo(10 / 3 + 0.75, 7)
    expect(r.at(5).fA).toBeCloseTo((2 * 5 - 3) / 3, 7)
    expect(r.at(9).vA).toBeCloseTo(18, 6)
    expect(r.at(9).vB).toBeCloseTo(19.125, 6)
    expect(r.at(8).fA).toBeCloseTo(4, 9)
  })

  it('validator rejects malformed force-driven motions', () => {
    const lesson = (motion: string) =>
      ['---', 'id: t', 'title: t', 'subject: physics', 'topic: t', 'source: t', 'question: q', 'demo: true', '---', '<Param name="m" value={1} min={1} max={2} step={1} label="m" />', motion, '<Figure title="x" params={["m"]}>', 'figure({ draw() {} })', '</Figure>'].join('\n')
    const msgs = (motion: string) => validateLesson(lesson(motion)).errors.map((e) => e.message).join('\n')
    const ok = '<Motion name="b" mass="m" along={0} state={{x: 0, v: 1}} until={1} forces={[{label: "G", angle: -90, magnitude: "m*10"}, {label: "N", angle: 90, solve: "N"}, {label: "f", friction: {mu: 0.2, normal: "N", together: "tStop"}}]} read={{s: "x @ tStop"}} />'
    expect(msgs(ok)).toBe('')
    expect(msgs(ok.replace(' along={0}', ''))).toContain('摩擦力要有接触面')
    expect(msgs(ok.replace('magnitude: "m*10"}', 'solve: "G"}'))).toContain('最多一个力写 solve')
    expect(msgs(ok.replace(' mass="m"', ''))).toContain('需要质量')
    expect(msgs(ok.replace('state={{x: 0, v: 1}}', 'state={{y: 0, v: 1}}'))).toContain('state 要有 x')
    expect(msgs(ok.replace('normal: "N"', 'normal: "Q"'))).toContain('未声明的名字 Q')
    const two = '<Motion name="s" until={1} bodies={[{name: "A", mass: 1, along: 90, forces: []}, {name: "B", mass: 2, along: -90, forces: []}]} ropes={[["A", "C"]]} />'
    expect(msgs(two)).toContain('ropes[0]')
  })

  it('warns when the perpendicular forces do not balance', () => {
    const r = run({ mass: 1, along: 0, forces: [{ label: 'G', angle: -90, magnitude: 'g' }], state: { x: 0, v: 0 }, until: 1 })
    expect(r.warnings.join()).toContain('垂直于运动方向的力不平衡')
  })

  it('does not flag rounding when a falling body reaches terminal speed', () => {
    // Motion is downward (along -90); drag 5v points up and balances G at v = 2. Only cos(±90°) rounding is perpendicular.
    const r = run({ mass: 1, along: -90, forces: [{ label: 'G', angle: -90, magnitude: '10' }, { label: 'f', angle: 90, magnitude: '5*v' }], state: { x: 0, v: 0 }, until: 20 })
    expect(r.at(20).v).toBeCloseTo(2, 6)
    expect(r.warnings).toEqual([])
  })
})
