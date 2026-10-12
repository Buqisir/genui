import { buildRuntime } from '../sim/buildRuntime'
import { join } from 'node:path'
import vm from 'node:vm'
import { describe, expect, it } from 'vitest'
import {
  centripetalReadings,
  circleHalfCount,
  coverageCount,
  crtDeflection,
  hallPolarity,
  labTransformerLayout,
  oilFilmGeometry,
  platePair,
  platesAtFrame,
  pointInPoly,
  wireThickness,
} from '../sim/apparatus'
import { checkSim } from './simcheck'
import { validateFile } from '../../scripts/validate'

const runtime = buildRuntime()

describe('Hall polarity, F = q v × B', () => {
  // +x right, +y up, +z out. Electrons drift against I, holes with it.
  // UH is the sign of φ(上)−φ(下) for a horizontal current.
  const cases: [string, 'in' | 'out', 'left' | 'right', 'top' | 'bottom', 1 | -1][] = [
    ['electron', 'out', 'right', 'top', 1],
    ['electron', 'in', 'right', 'bottom', -1],
    ['electron', 'out', 'left', 'bottom', -1],
    ['electron', 'in', 'left', 'top', 1],
    ['hole', 'out', 'right', 'bottom', -1],
    ['hole', 'in', 'right', 'top', 1],
    ['hole', 'out', 'left', 'top', 1],
    ['hole', 'in', 'left', 'bottom', -1],
  ]
  it('matches the textbook for all 8 combinations', () => {
    for (const [carrier, B, I, positive, UH] of cases) {
      const got = hallPolarity(B, I, carrier as 'electron' | 'hole')
      expect(got.positive, `${carrier} ${B} ${I}`).toBe(positive)
      expect(got.negative).toBe(positive === 'top' ? 'bottom' : 'top')
      expect(got.UH).toBe(UH)
    }
  })

  it('turns the accumulation onto the left and right faces when the current is vertical', () => {
    // Electron, I up, B out: v is down, v×B is to the left, q<0 so F points right.
    // Electrons pile up on the right and the left face is positive. UH = φ(右)−φ(左) = −1.
    expect(hallPolarity('out', 'up', 'electron')).toEqual({ positive: 'left', negative: 'right', UH: -1 })
    // Hole, I down, B in: v is down, v×B = (vy)(−z) = +x, holes pile up on the right.
    expect(hallPolarity('in', 'down', 'hole').positive).toBe('right')
  })

  it('rejects a direction the cross product cannot read', () => {
    expect(() => hallPolarity('up' as 'in', 'right', 'electron')).toThrow(/B/)
    expect(() => hallPolarity('in', 'sideways' as 'right', 'hole')).toThrow(/I/)
    expect(() => hallPolarity('out', 'left', 'ion' as 'hole')).toThrow(/载流子/)
  })
})

describe('oil-film square count', () => {
  it('counts a cell only when more than half of it is covered', () => {
    const square = (x: number, y: number) => x >= 0 && y >= 0 && x <= 1.4 && y <= 1
    const cells = coverageCount(square, 0, 3, 0, 2, 1, 11)
    expect(cells.map((c) => c.i)).toEqual([0])
    expect(pointInPoly(0.2, 0.2, [[0, 0], [2, 0], [2, 2], [0, 2]])).toBe(true)
    expect(pointInPoly(3, 3, [[0, 0], [2, 0], [2, 2], [0, 2]])).toBe(false)
  })

  it('counts a circle of radius 0.45 and ignores one of radius 0.35 inside a unit cell', () => {
    const inside = circleHalfCount(0.45, 1, 0.5, 0.5)
    const outside = circleHalfCount(0.35, 1, 0.5, 0.5)
    expect(inside.count).toBe(1)
    expect(inside.area).toBe(1)
    expect(outside.count).toBe(0)
    expect(outside.exact).toBeCloseTo(Math.PI * 0.35 * 0.35, 6)
  })

  it('tracks πR² for a large circle', () => {
    const got = circleHalfCount(8, 1)
    expect(Math.abs(got.area - got.exact) / got.exact).toBeLessThan(0.04)
    expect(got.exact).toBeCloseTo(Math.PI * 64, 6)
  })

  it('is stable for a seed and scales to the requested area', () => {
    const a = oilFilmGeometry({ cells: 10, grid: 1, seed: 4, area: 28 })
    const b = oilFilmGeometry({ cells: 10, grid: 1, seed: 4, area: 28 })
    expect(a.count).toBe(b.count)
    expect(a.outline).toEqual(b.outline)
    expect(a.area).toBe(a.count * a.grid * a.grid)
    expect(a.exact).toBeCloseTo(28, 6)
    expect(oilFilmGeometry({ seed: 4, area: 28 }).outline).not.toEqual(oilFilmGeometry({ seed: 5, area: 28 }).outline)
    expect(() => oilFilmGeometry({ grid: 0 })).toThrow(/格子/)
  })
})

describe('centripetal sleeves and CRT spot', () => {
  it('exposes stripes in proportion to m ω² r', () => {
    const same = centripetalReadings(1, 1, 1, 1, 2)
    expect(same.F1).toBeCloseTo(4, 8)
    expect(same.F2).toBeCloseTo(1, 8)
    expect(same.ratio).toBeCloseTo(4, 8)
    expect(same.n1).toBeCloseTo(8, 8)
    expect(same.n2).toBeCloseTo(2, 8)
    expect(same.pulley[0]).toBeCloseTo(0.5, 8)
    expect(same.pulley[1]).toBeCloseTo(1, 8)
    const scaled = centripetalReadings(2, 0.5, 1, 1, 1, 3)
    expect(scaled.F1).toBeCloseTo(1, 8)
    expect(scaled.n1).toBeCloseTo(3, 8)
    expect(scaled.n2).toBeCloseTo(3, 8)
    expect(() => centripetalReadings(1, -1, 1, 1, 1)).toThrow(/半径/)
    expect(() => centripetalReadings(1, 1, 1, 1, 0)).toThrow(/角速度/)
  })

  it('uses the linear model y = k Uy, x = k Ux, with L/d when k is omitted', () => {
    const lin = crtDeflection(2, -3, { k: 0.4 })
    expect(lin.k).toBeCloseTo(0.4, 8)
    expect(lin.x).toBeCloseTo(0.8, 8)
    expect(lin.y).toBeCloseTo(-1.2, 8)
    const fromLd = crtDeflection(1, 0.5, { L: 4, d: 2, arm: 3 })
    expect(fromLd.k).toBeCloseTo(6, 8)
    expect(fromLd.y).toBeCloseTo(3, 8)
    expect(crtDeflection(2, 2, { L: 4, d: 2, k: 0.5 }).k).toBe(0.5)
    expect(crtDeflection(0, 0).k).toBe(1)
  })
})

describe('tilted plates and the lab transformer', () => {
  it('rotates a parallel pair and cants the lower plate', () => {
    const flat = platePair(-2, 2, 1, -1, 0, 0)
    expect(flat.top[0][1]).toBeCloseTo(1, 8)
    expect(flat.top[1][0]).toBeCloseTo(2, 8)
    expect(flat.bot[0]).toEqual([-2, -1])
    const tilted = platePair(-2, 2, 0.4, -0.4, 90, 0)
    // 90° counter-clockwise puts the plate that was on top over on the left.
    expect(tilted.top[0][0]).toBeCloseTo(-0.4, 6)
    expect(tilted.top[0][1]).toBeCloseTo(-2, 6)
    expect(tilted.top[1][1]).toBeCloseTo(2, 6)
    const wedge = platePair(-2, 2, 0.5, -0.5, 0, 10)
    expect(wedge.top[0][1]).toBeCloseTo(0.5, 6)
    expect(wedge.bot[0][1]).not.toBeCloseTo(wedge.bot[1][1], 2)
    const along = platesAtFrame(0, 0, 4, 0, { gap: 1, angle: 0 })
    expect(along.top[0]).toEqual([0, 0.5])
    expect(() => platesAtFrame(1, 1, 1, 1, { gap: 1 })).toThrow(/重合/)
    expect(() => platesAtFrame(0, 0, 2, 0, { gap: 0 })).toThrow(/间距/)
  })

  it('highlights the chosen taps and lifts the yoke', () => {
    const on = labTransformerLayout({ n1: 200, n2: 800, yoke: true })
    expect(on.taps1.filter((t) => t.used).map((t) => t.turns).sort((a, b) => a - b)).toEqual([0, 200])
    expect(on.taps2.filter((t) => t.used).map((t) => t.turns).sort((a, b) => a - b)).toEqual([0, 800])
    expect(on.open).toBe(false)
    expect(on.used1[0].turns).toBe(200)
    expect(on.used1[1].turns).toBe(0)
    const off = labTransformerLayout({ yoke: false, n1: 400, n2: 200 })
    expect(off.yoke.dy).toBeLessThan(on.yoke.dy)
    expect(off.open).toBe(true)
    expect(on.taps1.map((t) => t.dx)).toEqual([...on.taps1.map((t) => t.dx)].sort((a, b) => a - b))
    // Yoke matches the core, sits on the leg tops, and the posts stay on the bobbin strips.
    expect(on.yoke.x1 - on.yoke.x0).toBeCloseTo(on.outerHalf * 2, 6)
    expect(on.yoke.dy + on.yoke.h / 2).toBeCloseTo(on.legTop, 6)
    expect(on.coil.y1).toBeCloseTo(on.barTop, 6)
    expect(on.coil.y0 - on.legTop).toBeGreaterThan(24)
    expect(on.legTop - (off.yoke.dy + off.yoke.h / 2)).toBeGreaterThan(24)
    for (const p of [...on.taps1, ...on.taps2]) {
      const cx = p.dx < 0 ? on.legCX[0] : on.legCX[1]
      expect(Math.abs(p.dx - cx)).toBeLessThan(on.legW / 2 + on.coil.over - 4)
      expect(p.dy).toBeGreaterThan(on.coil.y0)
      expect(p.dy).toBeLessThan(on.coil.y0 + on.coil.strip)
      expect(p.dy).toBeGreaterThan(on.yoke.dy + on.yoke.h / 2)
    }
    expect(() => labTransformerLayout({ n1: 50 })).toThrow(/抽头 50/)
    expect(() => labTransformerLayout({ n1: 0 })).toThrow(/同一接线柱/)
    expect(wireThickness(0.4, 10)).toBeCloseTo(5.6, 6)
    expect(wireThickness(5)).toBe(7)
    expect(wireThickness()).toBe(2.4)
  })
})

/** Text and line-segment calls from the latest draw(), in canvas pixels. */
let drawn: { texts: [string, number, number][]; lines: number } = { texts: [], lines: 0 }

function draw(body: string) {
  const posts: { type?: string; message?: string }[] = []
  const listeners: Record<string, ((e: unknown) => void)[]> = {}
  drawn = { texts: [], lines: 0 }
  const ctx2d = new Proxy(
    {},
    {
      get(_t, prop) {
        if (prop === 'measureText') return (s: unknown) => ({ width: String(s).length * 7 })
        if (prop === 'fillText') return (s: unknown, x: number, y: number) => drawn.texts.push([String(s), x, y])
        if (prop === 'lineTo') return () => drawn.lines++
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
  it('returns computed taps, sleeves, spot, film and Hall faces', () => {
    const lay = labTransformerLayout({ n1: 200, n2: 800, yoke: true })
    const offLay = labTransformerLayout({ yoke: false, n1: 100, n2: 1400 })
    const filmG = oilFilmGeometry({ cells: 8, grid: 1, seed: 3, area: 20 })
    const plates = platePair(-2, 2, 0.4, -0.4, 30, 0)
    const out = draw(`
      const m = v.view({ xmin: -4, xmax: 4, ymin: -3, ymax: 3, equal: true })
      const tf = v.transformer(m, 0, 0, { style: 'lab', n1: 200, n2: 800, yoke: true })
      const off = v.transformer(m, 0, 0, { style: 'lab', yoke: false, n1: 100, n2: 1400 })
      const sch = v.transformer(m, 0, 0, { n1: 4, n2: 2 })
      const film = v.oilFilm(m, 0, 0, { cells: 8, grid: 1, seed: 3, area: 20 })
      const demo = v.centripetalDemo(m, 0, 0, { m1: 1, r1: 1, m2: 1, r2: 1, omegaRatio: 2 })
      const tube = v.crt(m, 0, 0, { Ux: 2, Uy: -1, k: 0.3, screen: 2 })
      const clamped = v.crt(m, 1, 1, { Ux: 3, Uy: 4, k: 1, screen: 1 })
      const hall = ['electron', 'hole'].flatMap((carrier) =>
        ['in', 'out'].flatMap((B) =>
          ['right', 'left'].map((I) => ({ carrier, B, I, ...v.hall(m, 0, 0, { B, I, carrier, w: 1, h: 0.6, t: 0.1 }) }))))
      const plates = v.plates(m, -2, 2, 0.4, -0.4, { angle: 30 })
      const wire = v.sampleWire(m, -1, 1.5, 0, { d: 0.3, ruler: false, clips: true })
      globalThis.__out = { tf, off, sch, film, demo, tube, clamped, hall, plates, wire }
    `) as {
      tf: { p: number[][]; s: number[][]; open: boolean; taps1: { turns: number; used: boolean; at: number[] }[]; yoke: { at: number[] } }
      off: { open: boolean; yoke: { at: number[] }; taps2: { turns: number; used: boolean }[] }
      sch: { p: number[][]; s: number[][] }
      film: { count: number; area: number; exact: number }
      demo: { F1: number; n1: number; n2: number; ratio: number; pulley: number[] }
      tube: { spot: number[]; x: number; y: number; k: number }
      clamped: { spot: number[]; x: number; y: number }
      hall: { carrier: string; B: 'in' | 'out'; I: 'left' | 'right'; positive: string; UH: number }[]
      plates: { top: number[][]; bot: number[][] }
      wire: { ends: number[][]; clips: number[][] }
    }
    const cssW = 640
    const cssH = 360
    const pad = 20
    const xmin = -4
    const xmax = 4
    const ymin = -3
    const ymax = 3
    let kx = (cssW - pad * 2) / (xmax - xmin)
    let ky = (cssH - pad * 2) / (ymax - ymin)
    const k = Math.min(kx, ky)
    const ox = pad + ((xmax - xmin) * (kx - k)) / 2
    const oy = pad + ((ymax - ymin) * (ky - k)) / 2
    kx = k
    ky = k
    const ix = (px: number) => xmin + (px - ox) / kx
    const iy = (py: number) => ymin + (cssH - oy - py) / ky
    const X0 = ox + (0 - xmin) * kx
    const Y0 = cssH - oy - (0 - ymin) * ky
    const phys = (dx: number, dy: number) => [ix(X0 + dx), iy(Y0 + dy)]
    const p200 = phys(lay.used1[0].dx, lay.used1[0].dy)
    expect(out.tf.p[0][0]).toBeCloseTo(p200[0], 5)
    expect(out.tf.p[0][1]).toBeCloseTo(p200[1], 5)
    expect(out.tf.p[1][0]).toBeCloseTo(phys(lay.used1[1].dx, lay.used1[1].dy)[0], 5)
    expect(out.tf.s[0][1]).toBeCloseTo(phys(lay.used2[0].dx, lay.used2[0].dy)[1], 5)
    expect(out.tf.open).toBe(false)
    expect(out.tf.taps1.find((t) => t.turns === 100)?.used).toBe(false)
    expect(out.off.open).toBe(true)
    expect(out.off.yoke.at[1]).toBeGreaterThan(out.tf.yoke.at[1])
    expect(out.off.yoke.at[1]).toBeCloseTo(phys(offLay.yoke.dx, offLay.yoke.dy)[1], 5)
    expect(out.off.taps2.filter((t) => t.used).map((t) => t.turns).sort((a, b) => a - b)).toEqual([0, 1400])
    expect(out.sch.p[0][0]).toBeLessThan(out.sch.s[0][0])
    expect(out.film.count).toBe(filmG.count)
    expect(out.film.area).toBeCloseTo(filmG.area, 6)
    expect(out.film.exact).toBeCloseTo(filmG.exact, 6)
    expect(out.demo.ratio).toBeCloseTo(4, 6)
    expect(out.demo.n1).toBeCloseTo(8, 6)
    expect(out.demo.n2).toBeCloseTo(2, 6)
    expect(out.demo.F1).toBeCloseTo(4, 6)
    expect(out.demo.pulley[0]).toBeCloseTo(0.5, 6)
    expect(out.tube).toEqual({ spot: [0.6, -0.3], x: 0.6, y: -0.3, k: 0.3 })
    expect(out.clamped.x).toBeCloseTo(3, 6)
    expect(out.clamped.y).toBeCloseTo(4, 6)
    expect(out.clamped.spot[0]).toBeCloseTo(1 + 0.54, 6)
    expect(out.clamped.spot[1]).toBeCloseTo(1 + 0.72, 6)
    expect(out.hall).toHaveLength(8)
    for (const row of out.hall) {
      const want = hallPolarity(row.B, row.I, row.carrier as 'electron' | 'hole')
      expect(row.positive).toBe(want.positive)
      expect(row.UH).toBe(want.UH)
    }
    expect(out.plates.top[0][0]).toBeCloseTo(plates.top[0][0], 6)
    expect(out.plates.top[1][1]).toBeCloseTo(plates.top[1][1], 6)
    expect(out.plates.bot[0][1]).toBeCloseTo(plates.bot[0][1], 6)
    expect(out.wire.ends).toEqual([[-1, 0], [1.5, 0]])
    expect(out.wire.clips).toEqual([[-1, 0], [1.5, 0]])
  })

  it('flips plate signs and marks the sign on a charged ball', () => {
    const view = 'const m = v.view({ xmin: -2, xmax: 2, ymin: -2, ymax: 2, equal: true });'
    const signs = (o: string) => {
      draw(`${view} v.plates(m, -1, 1, 1, -1, ${o})`)
      return drawn.texts.filter(([s]) => s === '+' || s === '−').sort((a, b) => a[2] - b[2]).map(([s]) => s)
    }
    expect(signs('{}')).toEqual(['+', '−'])
    expect(signs("{ signs: 'flip' }")).toEqual(['−', '+'])
    expect(signs("{ signs: 'flip', angle: 90 }").sort()).toEqual(['+', '−'])
    expect(signs('{ signs: false }')).toEqual([])
    const lines = (o: string) => {
      draw(`${view} v.ball(m, 0, 0, 0.3, ${o})`)
      return drawn.lines
    }
    const plain = lines('{ charge: true }')
    expect(lines("{ charge: '+' }")).toBe(plain + 2)
    expect(lines("{ charge: '-' }")).toBe(plain + 1)
    expect(lines('{ charge: -2e-6 }')).toBe(plain + 1)
  })

  it('throws the Chinese messages for a bad tap, a bad Hall direction and a zero wire', () => {
    const view = 'const m = v.view({ xmin: -2, xmax: 2, ymin: -2, ymax: 2, equal: true });'
    expect(() => draw(`${view} v.transformer(m, 0, 0, { style: 'lab', n1: 7 })`)).toThrow(/抽头 7/)
    expect(() => draw(`${view} v.hall(m, 0, 0, { B: 'up', I: 'right', carrier: 'electron' })`)).toThrow(/B/)
    expect(() => draw(`${view} v.sampleWire(m, 0, 0, 0, {})`)).toThrow(/两端不能重合/)
    expect(() => draw(`${view} v.platesAt(m, 0, 0, 1, 0, { gap: -1 })`)).toThrow(/间距/)
  })

  it('runs the module apparatus formulas inside the sandbox', () => {
    const out = draw(`
      const s = globalThis.__genuiShared
      const film = s.oilFilmGeometry({ cells: 6, grid: 0.4, seed: 2, area: 1.2 })
      globalThis.__out = {
        hall: s.hallPolarity('in', 'left', 'hole'),
        count: film.count,
        demo: s.centripetalReadings(1, 1, 1, 1, 2),
      }
    `) as { hall: { positive: string; UH: number }; count: number; demo: { F1: number; n1: number } }
    const want = hallPolarity('in', 'left', 'hole')
    expect(out.hall.positive).toBe(want.positive)
    expect(out.hall.UH).toBe(want.UH)
    expect(out.count).toBe(oilFilmGeometry({ cells: 6, grid: 0.4, seed: 2, area: 1.2 }).count)
    expect(out.demo.F1).toBeCloseTo(4, 8)
    expect(out.demo.n1).toBeCloseTo(8, 8)
  })
})

describe('demo lesson', () => {
  it('validates with no errors', () => {
    const result = validateFile(join(__dirname, '../../../lessons/_demo-apparatus.md'))
    expect(result.errors).toEqual([])
  })

  it('smoke-checks the helpers and reports a bad tap', () => {
    const runtimeSrc = buildRuntime()
    const ok = [
      'figure({ draw(ctx, p, v) {',
      '  const m = v.view({ xmin: -6, xmax: 6, ymin: -4, ymax: 4, equal: true })',
      '  v.transformer(m, 0, 0.4, { style: "lab", yoke: false, n1: 200, n2: 800 })',
      '  v.sampleWire(m, -1, 1, -1, { d: 0.4, ruler: false })',
      '  v.oilFilm(m, 2, 2, { cells: 6, grid: 0.4, seed: 2, area: 1.2 })',
      '  v.centripetalDemo(m, -2, -2, { r1: 1, r2: 0.6, m1: 1, m2: 2, omegaRatio: 1.5 })',
      '  v.crt(m, 3, -1, { Ux: 1, Uy: -2, L: 0.08, d: 0.02 })',
      '  v.hall(m, -3, 1, { w: 1.2, h: 0.7, t: 0.15, B: "in", I: "right", carrier: "electron" })',
      '  v.plates(m, 0, 2, 0.4, -0.2, { angle: 30 })',
      '  v.platesAt(m, -2, -1, 0, 0, { gap: 0.3, tilt: 8 })',
      '} })',
    ].join('\n')
    const runs = [{ label: '装置', params: {}, times: [0] }]
    expect(checkSim(ok, runtimeSrc, runs).errors).toEqual([])
    const bad = 'figure({ draw(ctx, p, v) { const m = v.view({xmin:-1,xmax:1,ymin:-1,ymax:1}); v.transformer(m, 0, 0, {style: "lab", n1: 3}) } })'
    expect(checkSim(bad, runtimeSrc, runs).errors.join()).toMatch(/抽头 3/)
  })
})

describe('v.block pivot', () => {
  it('turns a panel about its centre when pivot is centre', () => {
    const out = draw(`
      const m = v.view({ xmin: -3, xmax: 3, ymin: -3, ymax: 3, equal: true })
      const panel = v.block(m, 1, 0.5, 2, 0.2, { angle: 30, pivot: 'center' })
      const flat = v.block(m, 1, 0.5, 2, 0.2, { pivot: 'center' })
      const onSlope = v.block(m, 1, 0.5, 2, 0.2, { angle: 30 })
      globalThis.__out = { panel, flat, onSlope }
    `) as { panel: { center: number[]; corners: number[][] }; flat: { top: number }; onSlope: { center: number[] } }
    expect(out.panel.center[0]).toBeCloseTo(1, 9)
    expect(out.panel.center[1]).toBeCloseTo(0.5, 9)
    const xs = out.panel.corners.map((p) => p[0])
    expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeCloseTo(1, 9)
    expect(out.flat.top).toBeCloseTo(0.6, 9)
    // Without pivot the bottom-edge midpoint stays on (x, y), so the centre sits off it.
    expect(out.onSlope.center[1]).toBeGreaterThan(0.5)
  })
})

describe('v.ruler angle', () => {
  it('draws a tilted ruler without disturbing the flat one', () => {
    expect(() =>
      draw(`
        const m = v.view({ xmin: -1, xmax: 7, ymin: -1, ymax: 4, equal: true })
        v.ruler(m, 0, 5, 0.25, { angle: 30, step: 1, minor: 0.5, unit: 'cm' })
        v.ruler(m, 0, 5, 3.2, { step: 1, unit: 'cm' })
        v.ruler(m, 0, 5, 2, { angle: -15, body: false })
        globalThis.__out = {}
      `),
    ).not.toThrow()
  })
})
