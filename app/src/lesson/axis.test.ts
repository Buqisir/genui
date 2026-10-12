import { describe, expect, it } from 'vitest'
import type { Scope } from './expr'
import { motionSpecOf, runMotion } from './solvers'
import { validateLesson } from './validate'

const g = 10

function simulate(props: Record<string, unknown>, scope: Scope = {}) {
  const spec = motionSpecOf(props)
  if (!spec) throw new Error('no spec')
  const run = runMotion(spec, { g, ...scope })
  return run
}

describe('rotation about a fixed axis', () => {
  const m = 2
  const L = 1.5
  const I = (m * L * L) / 3
  const rod = {
    mass: 'm',
    axis: { x: 0, y: 0, inertia: 'm*L*L/3', com: [0, '-L/2'], reaction: 'F_O' },
    forces: [{ label: 'G', angle: -90, magnitude: 'm*g', at: 'com' }],
  }
  const scope: Scope = { m, L }

  it('physical pendulum, small amplitude: period is 2π√(I / (mg L/2))', () => {
    const T = 2 * Math.PI * Math.sqrt(I / (m * g * (L / 2)))
    const th0 = 1e-3
    const run = simulate(
      {
        ...rod,
        until: T * 1.3,
        steps: 4000,
        state: { theta: th0, omega: 0 },
        events: [{ name: 'tPer', when: 'omega', dir: 'down' }],
      },
      scope,
    )
    expect(run.warnings).toEqual([])
    const s0 = run.at(0)
    expect(s0.tau).toBeCloseTo(-m * g * (L / 2) * Math.sin(th0), 10)
    expect(s0.alpha).toBeCloseTo(s0.tau / I, 10)
    expect(s0.comX).toBeCloseTo((L / 2) * Math.sin(th0), 8)
    expect(s0.comY).toBeCloseTo(-(L / 2) * Math.cos(th0), 8)
    expect(run.events.tPer[0]).toBeGreaterThan(0)
    expect(Math.abs(run.events.tPer[0] - T)).toBeLessThan(1e-4)
  })

  it('large amplitude: energy ½Iω² − mg(L/2)cosθ is conserved', () => {
    const th0 = 2
    const run = simulate({ ...rod, until: 3, steps: 8000, state: { theta: th0, omega: 0 } }, scope)
    expect(run.warnings).toEqual([])
    const E = (t: number) => {
      const s = run.at(t)
      return 0.5 * I * s.omega ** 2 - m * g * (L / 2) * Math.cos(s.theta)
    }
    const E0 = E(0)
    expect(Math.abs(E0)).toBeGreaterThan(1)
    expect(Math.abs(run.at(0.4).theta - th0)).toBeGreaterThan(0.05)
    for (const t of [0.2, 0.5, 1, 1.7, 2.4, 3]) {
      expect(Math.abs(E(t) - E0) / Math.abs(E0)).toBeLessThan(1e-8)
    }
  })

  it('rod released from horizontal: alpha = 3g/(2L), pivot force is mg/4 upward', () => {
    const alpha = (3 * g) / (2 * L)
    const run = simulate({ ...rod, until: 0.3, state: { theta: -Math.PI / 2, omega: 0 } }, scope)
    expect(run.warnings).toEqual([])
    const s = run.at(0)
    expect(s.alpha).toBeCloseTo(alpha, 10)
    expect(s.F_Ox).toBeCloseTo(0, 10)
    expect(s.F_Oy).toBeCloseTo((m * g) / 4, 10)
    expect(s.F_O).toBeCloseTo((m * g) / 4, 10)
    expect(s.comX).toBeCloseTo(-L / 2, 10)
    expect(s.comY).toBeCloseTo(0, 10)
    // The other horizontal (rod to the right) falls the other way; the pivot force does not.
    const other = simulate({ ...rod, until: 0.2, state: { theta: Math.PI / 2, omega: 0 } }, scope)
    expect(other.at(0).alpha).toBeCloseTo(-alpha, 10)
    expect(other.at(0).F_Ox).toBeCloseTo(0, 10)
    expect(other.at(0).F_Oy).toBeCloseTo((m * g) / 4, 10)
  })

  it('simple pendulum: reaction at the bottom is mg + mω²l from energy', () => {
    const mass = 1
    const len = 1
    const th0 = 1.2
    const run = simulate(
      {
        mass: 'm',
        until: 3,
        steps: 4000,
        axis: { inertia: 'm*l*l', com: [0, '-l'], reaction: 'F_O' },
        state: { theta: th0, omega: 0 },
        forces: [{ label: 'G', angle: -90, magnitude: 'm*g', at: 'com' }],
        events: [{ name: 'tBot', when: 'theta', dir: 'down' }],
      },
      { m: mass, l: len },
    )
    expect(run.warnings).toEqual([])
    const tBot = run.events.tBot[0]
    expect(Number.isFinite(tBot)).toBe(true)
    const s = run.at(tBot)
    const w2 = (2 * g * (1 - Math.cos(th0))) / len
    expect(s.omega ** 2).toBeCloseTo(w2, 6)
    expect(s.omega).toBeLessThan(0)
    expect(s.F_Ox).toBeCloseTo(0, 5)
    expect(s.F_Oy).toBeCloseTo(mass * g + mass * w2 * len, 5)
    expect(s.F_O).toBeCloseTo(mass * g + mass * w2 * len, 5)
    expect(s.comX).toBeCloseTo(0, 5)
    expect(s.comY).toBeCloseTo(-len, 5)
  })

  it('rod generator: drive torque and ampere torque meet at ω = 4Rτ0 / (B² r⁴)', () => {
    const B = 1
    const a = 1
    const R = 1
    const tau0 = 1
    const inertia = 0.25
    const wInf = (4 * R * tau0) / (B * B * a ** 4)
    const run = simulate(
      {
        until: 12,
        steps: 4000,
        axis: { inertia },
        state: { theta: 0, omega: 0 },
        torques: [
          { label: '驱动', magnitude: 'tau0' },
          { label: '安培', magnitude: '-B*I*a*a/2' },
        ],
        circuit: {
          source: { type: 'battery', emf: '0.5*B*omega*a*a', r: 'R', read: 'I' },
          load: { type: 'wire' },
        },
      },
      { B, a, R, tau0 },
    )
    expect(run.warnings).toEqual([])
    expect(run.at(0).I).toBeCloseTo(0, 8)
    expect(run.at(0).tau).toBeCloseTo(tau0, 8)
    expect(run.at(0).alpha).toBeCloseTo(tau0 / inertia, 8)
    const t = 1
    const w = wInf * (1 - Math.exp(-t))
    expect(run.at(t).omega).toBeCloseTo(w, 5)
    expect(run.at(t).I).toBeCloseTo((0.5 * B * w * a * a) / R, 5)
    expect(run.at(t).alpha).toBeCloseTo(wInf * Math.exp(-t), 5)
    expect(run.at(12).omega).toBeCloseTo(wInf * (1 - Math.exp(-12)), 5)
    expect(Math.abs(run.at(12).omega - wInf)).toBeLessThan(1e-4)
    expect(run.at(12).alpha).toBeCloseTo(wInf * Math.exp(-12), 5)
  })

  it('hanging rod in a vertical field: a smaller R damps the swing faster', () => {
    const th0 = 0.5
    const far = (R: number) => {
      const run = simulate(
        {
          mass: 'm',
          until: 3,
          steps: 3000,
          axis: { inertia: 'm*l*l', com: [0, '-l'], reaction: 'F_O' },
          state: { theta: th0, omega: 0 },
          forces: [
            { label: 'G', angle: -90, magnitude: 'm*g', at: 'com' },
            { label: 'FA', angle: 180, magnitude: 'B*I*L', at: [0, '-l'] },
          ],
          circuit: {
            source: { type: 'battery', emf: 'B*L*l*omega*cos(theta)', r: 'R', read: 'I' },
            load: { type: 'wire' },
          },
          events: [{ name: 'tFar', when: 'omega', dir: 'up' }],
        },
        { m: 1, l: 1, L: 1, B: 1, R },
      )
      expect(run.warnings).toEqual([])
      const t = run.events.tFar[0]
      expect(Number.isFinite(t)).toBe(true)
      return Math.abs(run.at(t).theta)
    }
    const light = far(20)
    const heavy = far(0.3)
    expect(light).toBeGreaterThan(0.9 * th0)
    expect(heavy).toBeLessThan(0.6 * th0)
    expect(heavy).toBeLessThan(light)
  })

  it('a body-fixed force perpendicular to the rod has torque magnitude·|r| at every theta', () => {
    const mag = 3
    const R = 0.4
    const torque = mag * R
    for (const th of [0, 0.7, 2.3, -1.2]) {
      const run = simulate({
        until: 0.3,
        steps: 400,
        axis: { inertia: 2 },
        state: { theta: th, omega: 0 },
        forces: [{ label: 'F', angle: 0, magnitude: mag, at: [0, -R], body: true, torque: 'tauF' }],
      })
      expect(run.warnings).toEqual([])
      expect(run.at(0).tauF).toBeCloseTo(torque, 10)
      expect(run.at(0).tau).toBeCloseTo(torque, 10)
      expect(run.at(0.2).tau).toBeCloseTo(torque, 8)
      expect(run.at(0.2).alpha).toBeCloseTo(torque / 2, 8)
      expect(run.at(0.2).theta).not.toBeCloseTo(th, 2)
    }
    // Off the rod axis: a body-radial force has no torque, a perpendicular one has |r|·F, both independent of theta.
    const mag2 = 1
    for (const th of [0.3, 1.7]) {
      const radial = simulate({
        until: 0.05,
        axis: { inertia: 1 },
        state: { theta: th, omega: 0 },
        forces: [{ label: 'F', angle: 45, magnitude: mag2, at: [1, 1], body: true }],
      })
      const perp = simulate({
        until: 0.05,
        axis: { inertia: 1 },
        state: { theta: th, omega: 0 },
        forces: [{ label: 'F', angle: 135, magnitude: mag2, at: [1, 1], body: true }],
      })
      expect(radial.at(0).tau).toBeCloseTo(0, 10)
      expect(perp.at(0).tau).toBeCloseTo(Math.SQRT2 * mag2, 10)
    }
  })
})

describe('axis validator', () => {
  const head = ['---', 'title: t', 'demo: true', '---', ''].join('\n')
  const params = [
    '<Param name="m" value={1} min={0.5} max={2} step={0.1} label="m" />',
    '<Param name="L" value={1} min={0.5} max={2} step={0.1} label="L" />',
    '<Param name="g" value={10} min={1} max={20} step={1} label="g" />',
    '<Param name="B" value={1} min={0} max={2} step={0.1} label="B" />',
    '<Param name="Lb" value={0.4} min={0.1} max={1} step={0.1} label="Lb" />',
    '<Param name="k" value={0} min={0} max={1} step={0.1} label="k" />',
    '<Param name="R" value={1} min={0.1} max={5} step={0.1} label="R" />',
  ].join('\n')
  const lesson = (motion: string) => `${head}${params}\n${motion}`
  const msgs = (motion: string) => validateLesson(lesson(motion)).errors.map((e) => e.message).join('\n')
  const ok =
    '<Motion name="pend" mass="m" until={3} axis={{x: 0, y: 0, inertia: "m*L*L/3", com: [0, "-L/2"], reaction: "F_O"}} state={{theta: 0.2, omega: 0}} forces={[{label: "G", angle: -90, magnitude: "m*g", at: "com"}, {label: "FA", angle: 180, magnitude: "B*I*Lb", at: [0, "-L"], torque: "tauA"}]} torques={[{label: "阻", magnitude: "-k*omega"}]} circuit={{source: {type: "battery", label: "棒", emf: "B*Lb*L*omega*cos(theta)", r: "R", read: "I"}, load: {type: "wire"}}} events={[{name: "tHalf", when: "omega", dir: "up"}]} read={{th: "theta @ tHalf"}} />'

  it('rejects a missing at, com without com, solve, and axis combined with along', () => {
    const v = validateLesson(lesson(ok))
    expect(v.errors).toEqual([])
    expect(v.warnings).toEqual([])
    expect(msgs(ok.replace('magnitude: "m*g", at: "com"', 'magnitude: "m*g"'))).toContain('缺少 at')
    expect(msgs(ok.replace('inertia: "m*L*L/3", com: [0, "-L/2"], reaction: "F_O"', 'inertia: "m*L*L/3"'))).toContain('没有 com')
    expect(msgs(ok.replace('at: "com"', 'at: "com", solve: "N"'))).toContain('不要写 solve')
    expect(msgs(ok.replace('mass="m" until={3}', 'mass="m" along={0} until={3}'))).toContain('不能和')
    expect(msgs(ok.replace('x: 0', 'x: "theta"'))).toContain('只能用参数')
    expect(msgs(ok.replace('inertia: "m*L*L/3", ', ''))).toContain('inertia')
    expect(msgs(ok.replace('magnitude: "-k*omega"', 'magnitude: "-k*omega", solve: "x"'))).toContain('未知字段')
  })
})
