import { describe, expect, it } from 'vitest'
import { runGasTube } from './gastube'
import { validateLesson } from './validate'

function tube(props: Record<string, unknown>, scope: Record<string, number> = {}) {
  const run = runGasTube(props, scope)
  const name = String(props.name)
  return { obj: run.values[name] as Record<string, unknown>, values: run.values, warnings: run.warnings, errors: run.errors }
}
const call = (obj: Record<string, unknown>, key: string, x: number) => (obj[key] as (v: number) => number)(x)
const rel = (got: number, want: number) => {
  const scale = Math.max(1, Math.abs(want))
  expect(Math.abs(got - want) / scale).toBeLessThanOrEqual(1e-6)
}

describe('GasTube', () => {
  it('rotates a mercury thread from mouth-up to mouth-down', () => {
    const { obj, warnings, errors } = tube({
      name: 'tube',
      units: 'cmHg',
      p0: 75,
      path: [{ length: 100, angle: 'θ' }],
      start: 'closed',
      end: 'open',
      contents: [{ gas: 'A', L: 20 }, { liquid: 'h', L: 10 }],
      drive: { name: 'θ', from: 90, to: -90 },
    })
    expect(errors).toEqual([])
    expect(warnings).toEqual([])
    const p = (th: number) => 75 + 10 * Math.sin((th * Math.PI) / 180)
    for (const th of [90, 30, 0, -30, -90]) {
      rel(call(obj, 'pA', th), p(th))
      rel(call(obj, 'LA', th), (85 * 20) / p(th))
    }
    expect(call(obj, 'LA', 0)).toBeCloseTo(22.6667, 4)
    rel(call(obj, 'pA', -90), 65)
    rel(call(obj, 'LA', -90), 26.1538461538)
    expect(obj.from).toBe(90)
    expect(obj.to).toBe(-90)
    expect(Object.keys(obj)).not.toContain('__tube')
  })

  it('heats a jawed cylinder: isochoric, isobaric, isochoric', () => {
    const props = {
      name: 'cyl',
      units: 'SI',
      p0: 1e5,
      g: 10,
      S: 0.01,
      path: [{ length: 0.5, angle: 90 }],
      start: 'closed',
      end: 'open',
      contents: [
        { gas: 'A', L: 0.2, p: 1e5, T: 300, Tnow: 'Tg', cv: 2.5 },
        { piston: 'P', m: 10, thick: 0.02, stops: { min: 0.2, max: 0.3 }, leave: 'Tleave', hit: 'Thit' },
      ],
      drive: { name: 'Tg', from: 300, to: 600 },
    }
    const cpuMs = (fn: () => void) => {
      const start = process.cpuUsage()
      fn()
      const used = process.cpuUsage(start)
      return (used.user + used.system) / 1000
    }
    tube(props)
    const built = Math.min(cpuMs(() => tube(props)), cpuMs(() => tube(props)))
    const { obj, values, warnings, errors } = tube(props)
    expect(errors).toEqual([])
    expect(warnings).toEqual([])
    expect(built).toBeLessThan(30)
    rel(values.Tleave as number, 330)
    rel(values.Thit as number, 495)
    expect(Math.abs((values.Tleave as number) - 330) / 330).toBeLessThan(1e-9)
    expect(Math.abs((values.Thit as number) - 495) / 495).toBeLessThan(1e-9)
    // Held on the lower jaw: p ∝ T, no work.
    rel(call(obj, 'pA', 300), 1e5)
    rel(call(obj, 'pA', 315), 1.05e5)
    rel(call(obj, 'LA', 315), 0.2)
    rel(call(obj, 'WA', 330), 0)
    // Isobaric between the jaws. Off a sample, so this is a fresh solve, not an interpolation.
    rel(call(obj, 'pA', 400.5), 1.1e5)
    rel(call(obj, 'LA', 400.5), 400.5 / 1650)
    rel(call(obj, 'xP', 400.5), 400.5 / 1650)
    // Upper jaw, then the second isochoric leg.
    rel(call(obj, 'LA', 495), 0.3)
    rel(call(obj, 'pA', 600), (1.1e5 * 600) / 495)
    rel(call(obj, 'VA', 600), 0.003)
    rel(call(obj, 'WA', 600), 110)
    rel(call(obj, 'UA', 600), 500)
    rel(call(obj, 'QA', 600), 610)
    rel(call(obj, 'WA', 450), 1.1e5 * 0.01 * (450 / 1650 - 0.2))
    const perCall = cpuMs(() => {
      for (let i = 0; i < 20; i++) call(obj, 'pA', 300 + i * 13)
    }) / 20
    expect(perCall).toBeLessThan(0.2)
  })

  it('splits a closed horizontal cylinder into two columns', () => {
    const { obj, warnings, errors } = tube({
      name: 'box',
      p0: 1e5,
      S: 0.01,
      path: [{ length: 1, angle: 0 }],
      start: 'closed',
      end: 'closed',
      contents: [
        { gas: 'A', L: 0.5, p: 1e5, T: 300, Tnow: 'T' },
        { piston: 'P', m: 0 },
        { gas: 'B', L: 0.5, p: 1e5, T: 300 },
      ],
      drive: { name: 'T', from: 300, to: 450 },
    })
    expect(errors).toEqual([])
    expect(warnings).toEqual([])
    rel(call(obj, 'LA', 450), 0.6)
    rel(call(obj, 'LB', 450), 0.4)
    rel(call(obj, 'pA', 450), 1.25e5)
    rel(call(obj, 'pB', 450), 1.25e5)
  })

  it('pours mercury into a U-tube and infers the initial pressure', () => {
    const { obj, warnings, errors } = tube({
      name: 'u',
      units: 'cmHg',
      p0: 75,
      // The open surface ends at s = 91.2, so the right arm must be longer than 41.2 cm.
      path: [
        { length: 40, angle: -90 },
        { length: 10, angle: 0 },
        { length: 55, angle: 90 },
      ],
      start: 'closed',
      end: 'open',
      contents: [
        { gas: 'A', L: 20 },
        { liquid: 'h', L: '50 + d' },
      ],
      drive: { name: 'd', from: 0, to: 25 },
    })
    expect(errors).toEqual([])
    expect(warnings).toEqual([])
    rel(call(obj, 'pA', 0), 75)
    rel(call(obj, 'LA', 0), 20)
    rel(call(obj, 'dzh', 0), 0)
    const x = (70 - Math.sqrt(3900)) / 2
    const p = 1500 / (20 - x)
    rel(call(obj, 'xh', 25), 20 - x)
    rel(call(obj, 'pA', 25), p)
    rel(call(obj, 'LA', 25), 20 - x)
    // z increases upward, so the open (right) surface ends higher: dz = z_right − z_left = p − p0.
    rel(call(obj, 'dzh', 25), p - 75)
    rel(call(obj, 'pA', 25) * call(obj, 'LA', 25), 1500)
  })

  it('pumps a rigid container: pressure doubles and the gas does no work', () => {
    const { obj, warnings, errors } = tube({
      name: 'tank',
      p0: 1e5,
      S: 0.01,
      path: [{ length: 1, angle: 0 }],
      start: 'closed',
      end: 'closed',
      contents: [{ gas: 'A', L: 1, p: 1e5, T: 300, amount: '1 + k*0.0005/0.01' }],
      drive: { name: 'k', from: 0, to: 20 },
    })
    expect(errors).toEqual([])
    expect(warnings).toEqual([])
    rel(call(obj, 'pA', 20), 2e5)
    rel(call(obj, 'LA', 20), 1)
    rel(call(obj, 'WA', 20), 0)
    rel(call(obj, 'WA', 7), 0)
  })

  it('heats a spring-loaded piston onto the positive root', () => {
    const k = 1000
    const S = 0.01
    const { obj, warnings, errors } = tube(
      {
        name: 'cyl',
        p0: 1e5,
        S,
        g: 10,
        path: [{ length: 1, angle: 90 }],
        start: 'closed',
        end: 'open',
        contents: [
          { gas: 'A', L: 0.2, T: 300, Tnow: 'T' },
          { piston: 'P', m: 0, force: '-k*(xP - 0.2)' },
        ],
        drive: { name: 'T', from: 300, to: 450, steps: 5 },
      },
      { k },
    )
    expect(errors).toEqual([])
    expect(warnings).toEqual([])
    rel(call(obj, 'pA', 300), 1e5)
    // p·L = 1e5·0.2·1.5 and p = 1e5 + k·(L−0.2)/S
    const disc = 64 + 120
    const L = (-8 + Math.sqrt(disc)) / 20
    const p = 1e5 + (k * (L - 0.2)) / S
    rel(call(obj, 'LA', 450), L)
    rel(call(obj, 'pA', 450), p)
    rel(call(obj, 'LA', 375) * call(obj, 'pA', 375), 1e5 * 0.2 * (375 / 300))
  })

  it('lets a mercury plug at the open start move: heating is isobaric', () => {
    // The same tube as "closed bottom, gas, mercury, open top", listed from the open top downward.
    const { obj, warnings, errors } = tube({
      name: 'tube',
      units: 'cmHg',
      p0: 75,
      gap: 60,
      path: [{ length: 100, angle: -90 }],
      start: 'open',
      end: 'closed',
      contents: [{ liquid: 'h', L: 10 }, { gas: 'A', L: 30, T: 300, Tnow: 'T' }],
      drive: { name: 'T', from: 300, to: 400 },
    })
    expect(errors).toEqual([])
    expect(warnings).toEqual([])
    for (const T of [300, 350, 400]) {
      rel(call(obj, 'pA', T), 85)
      rel(call(obj, 'LA', T), (30 * T) / 300)
      rel(call(obj, 'xh', T), 100 - 10 - (30 * T) / 300)
    }
  })

  it('cools a jawed cylinder: a decreasing drive keeps modes, events and work', () => {
    const { obj, values, warnings, errors } = tube({
      name: 'cyl',
      p0: 1e5,
      g: 10,
      S: 0.01,
      path: [{ length: 0.5, angle: 90 }],
      start: 'closed',
      end: 'open',
      contents: [
        { gas: 'A', L: 0.3, p: '4e5/3', T: 600, Tnow: 'T', cv: 2.5 },
        { piston: 'P', m: 10, thick: 0.02, stops: { min: 0.2, max: 0.3 }, leave: 'Tleave', hit: 'Thit' },
      ],
      drive: { name: 'T', from: 600, to: 300 },
    })
    expect(errors).toEqual([])
    expect(warnings).toEqual([])
    rel(values.Tleave as number, 495)
    rel(values.Thit as number, 330)
    // Off the samples (step 1.5 K), so these are fresh solves in the mode the sweep has reached.
    rel(call(obj, 'pA', 520.7), ((4e5 / 3) * 520.7) / 600)
    rel(call(obj, 'LA', 520.7), 0.3)
    rel(call(obj, 'WA', 520.7), 0)
    rel(call(obj, 'pA', 400.7), 1.1e5)
    rel(call(obj, 'LA', 400.7), (0.3 * 400.7) / 495)
    rel(call(obj, 'WA', 400.7), 1.1e5 * 0.01 * ((0.3 * 400.7) / 495 - 0.3))
    rel(call(obj, 'pA', 300), 1e5)
    rel(call(obj, 'WA', 300), -110)
    rel(call(obj, 'UA', 300), 2.5 * (1e5 * 0.002 - (4e5 / 3) * 0.003))
    rel(call(obj, 'QA', 300), call(obj, 'UA', 300) - 110)
  })

  it('reports a switch that lands exactly on a sample at that sample', () => {
    // 300 → 600 in 200 steps of 1.5 K: the jaw changes at 330 and 495 fall on samples.
    const { values } = tube({
      name: 'cyl',
      p0: 1e5,
      g: 10,
      S: 0.01,
      path: [{ length: 0.5, angle: 90 }],
      start: 'closed',
      end: 'open',
      contents: [
        { gas: 'A', L: 0.2, p: 1e5, T: 300, Tnow: 'T' },
        { piston: 'P', m: 10, thick: 0.02, stops: { min: 0.2, max: 0.3 }, leave: 'Tleave', hit: 'Thit' },
      ],
      drive: { name: 'T', from: 300, to: 600 },
    })
    expect(Math.abs((values.Tleave as number) - 330)).toBeLessThan(1e-6)
    expect(Math.abs((values.Thit as number) - 495)).toBeLessThan(1e-6)
  })

  it('stops when the mercury reaches the mouth and publishes where', () => {
    const { obj, values, warnings, errors } = tube({
      name: 'tube',
      units: 'cmHg',
      p0: 75,
      path: [{ length: 50, angle: 90 }],
      start: 'closed',
      end: 'open',
      contents: [{ gas: 'A', L: 30, T: 300, Tnow: 'T' }, { liquid: 'h', L: 10 }],
      drive: { name: 'T', from: 300, to: 500 },
      stop: 'Tfull',
    })
    expect(errors).toEqual([])
    expect(warnings).toEqual([])
    rel(values.Tfull as number, 400)
    rel(call(obj, 'LA', 399), 39.9)
    expect(call(obj, 'LA', 401)).toBeNaN()
    expect(call(obj, 'WA', 450)).toBeNaN()
    const loud = tube({
      name: 'tube',
      units: 'cmHg',
      p0: 75,
      path: [{ length: 50, angle: 90 }],
      start: 'closed',
      end: 'open',
      contents: [{ gas: 'A', L: 30, T: 300, Tnow: 'T' }, { liquid: 'h', L: 10 }],
      drive: { name: 'T', from: 300, to: 500 },
    })
    expect(loud.warnings.join('\n')).toMatch(/液柱 h 到达开口/)
  })

  it('balances a column between two plugs in a level tube open at both ends', () => {
    const { obj, errors, warnings } = tube({
      name: 'tube',
      units: 'cmHg',
      p0: 75,
      gap: 30,
      path: [{ length: 100, angle: 0 }],
      start: 'open',
      end: 'open',
      contents: [{ liquid: 'a', L: 10 }, { gas: 'A', L: 20, T: 300, Tnow: 'T' }, { liquid: 'b', L: 10 }],
      drive: { name: 'T', from: 300, to: 360 },
    })
    expect(errors).toEqual([])
    expect(warnings).toEqual([])
    rel(call(obj, 'pA', 360), 75)
    rel(call(obj, 'LA', 360), 24)
  })

  it('treats amount as a ratio, whatever its scale', () => {
    const { obj, errors } = tube({
      name: 'box',
      p0: 1e5,
      S: 0.01,
      path: [{ length: 0.5, angle: 0 }],
      start: 'closed',
      end: 'closed',
      contents: [{ gas: 'A', L: 0.5, p: 1e5, amount: 'k', cv: 2.5 }],
      drive: { name: 'k', from: 2, to: 4 },
    })
    expect(errors).toEqual([])
    rel(call(obj, 'pA', 2), 1e5)
    rel(call(obj, 'pA', 3), 1.5e5)
    rel(call(obj, 'UA', 4), 2.5 * 1e5 * 0.005)
  })
})

const head = ['---', 'id: t', 'title: t', 'question: q', 'answers:', '  - { name: pAt, value: 133333.333 }', '---', ''].join('\n')

function lesson(body: string, answers = '  - { name: pAt, value: 133333.333 }') {
  return ['---', 'id: t', 'title: t', 'question: q', 'answers:', answers, '---', '', body].join('\n')
}

describe('GasTube validation', () => {
  const ok = [
    '<Param name="Tk" value={600} min={300} max={600} step={15} />',
    '',
    '<GasTube name="cyl" units="SI" p0={1e5} g={10} S={0.01} path={[{length: 0.5, angle: 90}]} start="closed" end="open"',
    '  contents={[{gas: "A", L: 0.2, p: 1e5, T: 300, Tnow: "Tg", cv: 2.5}, {piston: "P", m: 10, thick: 0.02, stops: {min: 0.2, max: 0.3}, leave: "Tleave", hit: "Thit"}]}',
    '  drive={{name: "Tg", from: 300, to: 600}} at="Tk" />',
    '',
    '<Define name="pAt" expr="cyl.pA(Tk)" />',
  ].join('\n')

  it('accepts a solved cylinder with no errors and no warnings', () => {
    const res = validateLesson(head + ok)
    expect(res.errors).toEqual([])
    expect(res.warnings).toEqual([])
  })

  it('rejects an open end against a gas column', () => {
    const src = lesson(
      [
        '<GasTube name="cyl" p0={1e5} S={0.01} path={[{length: 1, angle: 90}]} start="open" end="closed"',
        '  contents={[{gas: "A", L: 0.2, p: 1e5}, {piston: "P", m: 1}]}',
        '  drive={{name: "Tg", from: 300, to: 400}} />',
        '',
        '<Define name="pAt" expr="1" />',
      ].join('\n'),
      '  - { name: pAt, value: 1 }',
    )
    expect(validateLesson(src).errors.map((e) => e.message).join('\n')).toMatch(/开口端不能紧挨气柱/)
  })

  it('rejects a liquid without density and a piston in cmHg', () => {
    const rho = lesson(
      [
        '<GasTube name="cyl" units="SI" p0={1e5} path={[{length: 1, angle: 0}]} start="closed" end="open"',
        '  contents={[{gas: "A", L: 0.2, p: 1e5}, {liquid: "h", L: 0.1}]}',
        '  drive={{name: "Tg", from: 1, to: 2}} />',
        '',
        '<Define name="pAt" expr="1" />',
      ].join('\n'),
      '  - { name: pAt, value: 1 }',
    )
    expect(validateLesson(rho).errors.map((e) => e.message).join('\n')).toMatch(/必须写 rho/)
    const piston = lesson(
      [
        '<GasTube name="cyl" units="cmHg" p0={75} path={[{length: 100, angle: 90}]} start="closed" end="open"',
        '  contents={[{gas: "A", L: 20, p: 75}, {piston: "P", m: 1}]}',
        '  drive={{name: "Tg", from: 1, to: 2}} />',
        '',
        '<Define name="pAt" expr="1" />',
      ].join('\n'),
      '  - { name: pAt, value: 1 }',
    )
    expect(validateLesson(piston).errors.map((e) => e.message).join('\n')).toMatch(/cmHg 模式下不能放活塞/)
  })

  it('rejects a repeated name and an unknown symbol', () => {
    const dup = lesson(
      [
        '<GasTube name="cyl" p0={1e5} S={0.01} path={[{length: 1, angle: 0}]} start="closed" end="closed"',
        '  contents={[{gas: "A", L: 0.5, p: 1e5}, {gas: "A", L: 0.5, p: 1e5}]}',
        '  drive={{name: "Tg", from: 1, to: 2}} />',
        '',
        '<Define name="pAt" expr="1" />',
      ].join('\n'),
      '  - { name: pAt, value: 1 }',
    )
    expect(validateLesson(dup).errors.map((e) => e.message).join('\n')).toMatch(/名字 A 重复/)
    const ghost = lesson(
      [
        '<GasTube name="cyl" p0="pAtm" S={0.01} path={[{length: 1, angle: 0}]} start="closed" end="closed"',
        '  contents={[{gas: "A", L: 1, p: 1e5}]}',
        '  drive={{name: "Tg", from: 1, to: 2}} />',
        '',
        '<Define name="pAt" expr="1" />',
      ].join('\n'),
      '  - { name: pAt, value: 1 }',
    )
    expect(validateLesson(ghost).errors.map((e) => e.message).join('\n')).toMatch(/未声明的名字 pAtm/)
  })

  it('rejects a gas whose initial pressure cannot be inferred', () => {
    const src = lesson(
      [
        '<GasTube name="cyl" p0={1e5} g={10} S={0.01} path={[{length: 1, angle: 90}]} start="closed" end="open"',
        '  contents={[{gas: "A", L: 0.2}, {piston: "P", m: 10, stops: {min: 0.2, max: 0.5}}]}',
        '  drive={{name: "Tg", from: 300, to: 400}} />',
        '',
        '<Define name="pAt" expr="1" />',
      ].join('\n'),
      '  - { name: pAt, value: 1 }',
    )
    expect(validateLesson(src).errors.map((e) => e.message).join('\n')).toMatch(/气柱 A 的初始压强算不出来/)
  })

  it('rejects an initial state that is not in equilibrium', () => {
    const src = lesson(
      [
        '<GasTube name="cyl" p0={1e5} g={10} S={0.01} path={[{length: 1, angle: 90}]} start="closed" end="open"',
        '  contents={[{gas: "A", L: 0.2, p: 1.2e5}, {piston: "P", m: 10}]}',
        '  drive={{name: "Tg", from: 300, to: 400}} />',
        '',
        '<Define name="pAt" expr="1" />',
      ].join('\n'),
      '  - { name: pAt, value: 1 }',
    )
    expect(validateLesson(src).errors.map((e) => e.message).join('\n')).toMatch(/初态不平衡/)
  })

  it('rejects stops whose min is not below max', () => {
    const src = lesson(
      [
        '<GasTube name="cyl" p0={1e5} S={0.01} path={[{length: 1, angle: 90}]} start="closed" end="open"',
        '  contents={[{gas: "A", L: 0.2, p: 1e5}, {piston: "P", m: 0, stops: {min: 0.3, max: 0.2}}]}',
        '  drive={{name: "Tg", from: 300, to: 400}} />',
        '',
        '<Define name="pAt" expr="1" />',
      ].join('\n'),
      '  - { name: pAt, value: 1 }',
    )
    expect(validateLesson(src).errors.map((e) => e.message).join('\n')).toMatch(/stops\.min 应小于 stops\.max/)
  })

  it('warns when a column is crushed to nothing', () => {
    const src = lesson(
      [
        '<GasTube name="cyl" p0={1e5} S={0.01} path={[{length: 1, angle: 0}]} start="closed" end="closed"',
        '  contents={[{gas: "A", L: 0.5, p: 1e5}, {liquid: "h", L: "0.5 + d", rho: 1000}]}',
        '  drive={{name: "d", from: 0, to: 0.5}} />',
        '',
        '<Define name="pAt" expr="1" />',
      ].join('\n'),
      '  - { name: pAt, value: 1 }',
    )
    const res = validateLesson(src)
    expect(res.errors).toEqual([])
    expect(res.warnings.map((w) => w.message).join('\n')).toMatch(/气柱 A 的长度趋于 0/)
  })

  it('rejects a drive that starts away from the initial temperature, and SI without S', () => {
    const hot = lesson(
      [
        '<GasTube name="cyl" units="cmHg" p0={75} path={[{length: 100, angle: 90}]} start="closed" end="open"',
        '  contents={[{gas: "A", L: 30, T: 300, Tnow: "Tg"}, {liquid: "h", L: 10}]}',
        '  drive={{name: "Tg", from: 280, to: 400}} />',
        '',
        '<Define name="pAt" expr="1" />',
      ].join('\n'),
      '  - { name: pAt, value: 1 }',
    )
    expect(validateLesson(hot).errors.map((e) => e.message).join('\n')).toMatch(/和初温 T = 300 不一致/)
    const noS = lesson(
      [
        '<GasTube name="cyl" p0={1e5} path={[{length: 1, angle: 90}]} start="closed" end="open"',
        '  contents={[{gas: "A", L: 0.2, p: 1.1e5}, {piston: "P", m: 10}]}',
        '  drive={{name: "Tg", from: 300, to: 400}} />',
        '',
        '<Define name="pAt" expr="1" />',
      ].join('\n'),
      '  - { name: pAt, value: 1 }',
    )
    expect(validateLesson(noS).errors.map((e) => e.message).join('\n')).toMatch(/必须写 S/)
  })

  it('accepts the example in syntax-spec.md', async () => {
    const { readFileSync } = await import('node:fs')
    const spec = readFileSync(new URL('../../../syntax-spec.md', import.meta.url), 'utf8')
    const section = spec.slice(spec.indexOf('### `<GasTube>`'))
    const example = section.slice(section.indexOf('```\n') + 4, section.indexOf('\n```', section.indexOf('```\n') + 4))
    expect(example).toMatch(/<GasTube/)
    const res = validateLesson(lesson(example + '\n\n<Define name="pAt" expr="cyl.pA(Tk)" />', '  - { name: pAt, value: 100000 }'))
    expect(res.errors).toEqual([])
    expect(res.warnings).toEqual([])
  })
})
