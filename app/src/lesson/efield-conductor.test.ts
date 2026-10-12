import { buildRuntime } from '../sim/buildRuntime'
import vm from 'node:vm'
import { describe, expect, it } from 'vitest'

// Loads the sandbox runtime the same way simcheck does, then runs one draw and
// returns whatever the snippet stored on globalThis.__out.
const runtime = buildRuntime()

function run(body: string, src = runtime) {
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
    document: { getElementById: () => canvas, documentElement: { clientWidth: 640, clientHeight: 280 } },
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
    performance: { now: () => Date.now() },
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => undefined,
    addEventListener: (type: string, fn: (e: unknown) => void) => (listeners[type] ??= []).push(fn),
    __listeners: listeners,
    __colors: new Proxy({}, { get: () => '#888' }),
  }
  sandbox.window = sandbox
  sandbox.globalThis = sandbox
  const context = vm.createContext(sandbox)
  vm.runInContext(src, context, { timeout: 20000 })
  vm.runInContext(`sim({ at(){ return {} }, draw(ctx, s, v) { ${body} } })`, context, { timeout: 20000 })
  vm.runInContext('__simReady()', context)
  for (const fn of listeners.message || []) {
    fn({ source: parent, data: { source: 'genui-host', params: {}, t: 0, colors: sandbox.__colors, theme: 'light' } })
  }
  const err = posts.filter((p) => p.type === 'error').map((p) => p.message).join('\n')
  if (err) throw new Error(err)
  if (sandbox.__out === undefined) throw new Error('draw did not report a result')
  return sandbox.__out as Record<string, unknown>
}

describe('efield conductors', () => {
  it('gives an isolated charged circle the 2-D Coulomb field', () => {
    const out = run(`
      const m = v.view({ xmin: -2, xmax: 2, ymin: -1.2, ymax: 1.2, equal: true })
      const f = v.efield(m, [], { conductors: [{ cx: 0, cy: 0, r: 0.5, q: 1 }], lines: false, equipotentials: false, soft: 0 })
      const sig = f.surface.map((s) => s.sigma)
      const mean = sig.reduce((a, b) => a + b, 0) / sig.length
      let dev = 0
      for (const s of sig) dev = Math.max(dev, Math.abs(s - mean) / Math.abs(mean))
      const samples = []
      for (const r of [0.8, 1, 1.4, 2]) {
        for (let k = 0; k < 8; k++) {
          const a = 2 * Math.PI * k / 8
          const [ex, ey] = f.E(r * Math.cos(a), r * Math.sin(a))
          const er = ex * Math.cos(a) + ey * Math.sin(a)
          const et = -ex * Math.sin(a) + ey * Math.cos(a)
          samples.push({ r, er, et })
        }
      }
      globalThis.__out = {
        dev, mean, expectSigma: 1 / (2 * Math.PI * 0.5),
        Q: f.surface.reduce((a, s) => a + s.sigma * s.len, 0),
        samples, n: f.surface.length,
        Ein: f.E(0, 0), Ein2: f.E(0.15, -0.1),
        phiIn: f.phi(0.1, 0.05), V: f.potential(0),
      }
    `) as {
      dev: number
      mean: number
      expectSigma: number
      Q: number
      samples: { r: number; er: number; et: number }[]
      n: number
      Ein: number[]
      Ein2: number[]
      phiIn: number
      V: number
    }
    expect(out.n).toBeGreaterThan(40)
    expect(Math.abs(out.Q - 1)).toBeLessThan(1e-9)
    expect(out.dev).toBeLessThan(0.01)
    expect(Math.abs(out.mean - out.expectSigma) / out.expectSigma).toBeLessThan(0.01)
    expect(out.Ein).toEqual([0, 0])
    expect(out.Ein2).toEqual([0, 0])
    expect(out.phiIn).toBe(out.V)
    for (const s of out.samples) {
      expect(Math.abs(s.er - 1 / s.r) / (1 / s.r)).toBeLessThan(1e-3)
      expect(Math.abs(s.et) / (1 / s.r)).toBeLessThan(1e-3)
    }
  })

  it('matches the image charge of a line charge by a grounded circle and a long plate', () => {
    const circle = run(`
      const m = v.view({ xmin: -2, xmax: 2.4, ymin: -1.6, ymax: 1.6, equal: true })
      const f = v.efield(m, [{ x: 1.6, y: 0, q: 1 }], { conductors: [{ cx: 0, cy: 0, r: 0.5, V: 0 }], lines: false, equipotentials: false, soft: 0 })
      const pts = [[0, 1.2], [-0.8, 0.6], [0.2, 0.9], [-1.1, -0.4], [2.2, 0.3]]
      globalThis.__out = { E: pts.map(([x, y]) => f.E(x, y)), V: f.potential(0) }
    `) as { E: number[][]; V: number }
    const R = 0.5
    const d = 1.6
    const dp = (R * R) / d
    const lc = Math.log(R / d) / Math.log(R)
    const image = (x: number, y: number) => {
      const add = (px: number, py: number, q: number) => {
        const dx = x - px
        const dy = y - py
        const r2 = dx * dx + dy * dy
        return [q * dx / r2, q * dy / r2]
      }
      const a = add(d, 0, 1)
      const b = add(dp, 0, -1)
      const c = add(0, 0, lc)
      return [a[0] + b[0] + c[0], a[1] + b[1] + c[1]]
    }
    expect(circle.V).toBeCloseTo(0, 8)
    circle.E.forEach((e, i) => {
      const pts = [[0, 1.2], [-0.8, 0.6], [0.2, 0.9], [-1.1, -0.4], [2.2, 0.3]]
      const ref = image(pts[i][0], pts[i][1])
      const rel = Math.hypot(e[0] - ref[0], e[1] - ref[1]) / Math.hypot(ref[0], ref[1])
      expect(rel).toBeLessThan(1e-2)
    })

    const plate = run(`
      const m = v.view({ xmin: -3, xmax: 3, ymin: -1.2, ymax: 2.2, equal: true })
      const f = v.efield(m, [{ x: 0, y: 1, q: 1 }], { conductors: [{ line: [-24, 0, 24, 0], V: 0 }], lines: false, equipotentials: false, soft: 0 })
      const pts = [[0, 2], [0.4, 0.35], [1, 1.5], [-0.6, 0.4]]
      globalThis.__out = { E: pts.map(([x, y]) => f.E(x, y)), n: f.surface.length }
    `) as { E: number[][]; n: number }
    const plateImage = (x: number, y: number) => {
      const add = (py: number, q: number) => {
        const dy = y - py
        const r2 = x * x + dy * dy
        return [q * x / r2, q * dy / r2]
      }
      const a = add(1, 1)
      const b = add(-1, -1)
      return [a[0] + b[0], a[1] + b[1]]
    }
    expect(plate.n).toBeGreaterThan(80)
    const pts = [[0, 2], [0.4, 0.35], [1, 1.5], [-0.6, 0.4]]
    plate.E.forEach((e, i) => {
      const ref = plateImage(pts[i][0], pts[i][1])
      const rel = Math.hypot(e[0] - ref[0], e[1] - ref[1]) / Math.hypot(ref[0], ref[1])
      expect(rel).toBeLessThan(1e-2)
    })
  })

  it('keeps a neutral polygon at one potential, with the field leaving perpendicular', () => {
    const poly = [[-0.6, -0.4], [0.8, -0.4], [0.8, 0.5], [-0.6, 0.5]]
    const out = run(`
      const poly = ${JSON.stringify(poly)}
      const m = v.view({ xmin: -0.85, xmax: 0.85, ymin: -0.32, ymax: 0.32, equal: true })
      const f = v.efield(m, [{ x: -2, y: 0, q: 1 }], { conductors: [{ points: poly }], lines: false, equipotentials: false, soft: 0 })
      const Q = f.surface.reduce((a, s) => a + s.sigma * s.len, 0)
      const V = f.potential(0)
      let dev = 0
      const edges = []
      for (let e = 0; e < poly.length; e++) {
        const a = poly[e], b = poly[(e + 1) % poly.length]
        for (let k = 1; k < 20; k++) {
          const t = k / 20
          const x = a[0] + (b[0] - a[0]) * t
          const y = a[1] + (b[1] - a[1]) * t
          dev = Math.max(dev, Math.abs(f.phi(x, y) - V))
        }
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2
        const L = Math.hypot(b[0] - a[0], b[1] - a[1])
        const nx = (b[1] - a[1]) / L, ny = -(b[0] - a[0]) / L
        const eps = 0.008
        const [ex, ey] = f.E(mx + nx * eps, my + ny * eps)
        const En = ex * nx + ey * ny
        const Et = ex * ny - ey * nx
        edges.push(Math.atan2(Math.abs(Et), Math.abs(En)) * 180 / Math.PI)
      }
      globalThis.__out = { Q, dev, scale: Math.abs(V), edges, n: f.surface.length, V }
    `) as { Q: number; dev: number; scale: number; edges: number[]; n: number }
    expect(out.n).toBeGreaterThan(200)
    expect(Math.abs(out.Q)).toBeLessThan(1e-9)
    expect(out.dev).toBeLessThan(1e-3 * out.scale)
    for (const ang of out.edges) expect(ang).toBeLessThan(3)
  })

  it('puts more charge at the sharp bend of a "<" plate than at mid-side', () => {
    const out = run(`
      const m = v.view({ xmin: -0.4, xmax: 1.8, ymin: -1.3, ymax: 1.3, equal: true })
      const f = v.efield(m, [], { conductors: [{ points: [[0, 1], [1.4, 0], [0, -1]], open: true, V: 1, label: '尖' }], lines: false, equipotentials: false, soft: 0 })
      const tip = f.surface.filter((s) => Math.hypot(s.x - 1.4, s.y) < 0.1)
      const mid = f.surface.filter((s) => Math.hypot(s.x - 0.7, s.y - 0.5) < 0.12)
      globalThis.__out = {
        tip: Math.max(...tip.map((s) => Math.abs(s.sigma))),
        mid: mid.reduce((a, s) => a + Math.abs(s.sigma), 0) / mid.length,
        nTip: tip.length, nMid: mid.length,
      }
    `) as { tip: number; mid: number; nTip: number; nMid: number }
    expect(out.nTip).toBeGreaterThan(0)
    expect(out.nMid).toBeGreaterThan(0)
    expect(out.tip).toBeGreaterThan(out.mid)
  })

  it('leaves the 3-D two-charge field unchanged when there are no conductors', () => {
    const out = run(`
      const m = v.view({ xmin: -3, xmax: 3, ymin: -2, ymax: 2, equal: true })
      const f = v.efield(m, [{ x: -1, y: 0, q: 1 }, { x: 1, y: 0, q: -1 }], { equipotentials: 4, density: 8 })
      const pts = [[0, 0], [0, 1], [-0.2, 0.3], [1.5, 0.5], [-2, 1]]
      const L = f.line(0, 0.5)
      globalThis.__out = {
        E: pts.map(([x, y]) => f.E(x, y)),
        phi: pts.map(([x, y]) => f.phi(x, y)),
        lineN: L.length,
        lineSample: L.filter((_, i) => i % 40 === 0),
        hasSurface: f.surface !== undefined,
      }
    `) as { E: number[][]; phi: number[]; lineN: number; lineSample: number[][]; hasSurface: boolean }
    expect(out.E).toEqual([
      [1.8708415932279305, 0],
      [0.6836396313375566, 0],
      [1.7782122109985237, 0.28757655028382406],
      [-1.0916915695345968, -1.2111219041335297],
      [-0.24759545547073544, 0.310411695602764],
    ])
    expect(out.phi).toEqual([0, 0, 0.3388594693703656, -0.9630699074329743, 0.38368561184617955])
    expect(out.lineN).toBe(49)
    expect(out.lineSample).toEqual([
      [-0.8907574153922233, 0.09014699005080327],
      [0.6214462024080148, 0.2863661522780005],
    ])
    expect(out.hasSurface).toBe(false)
  })

  it('solves 400 panels in under 150 ms', () => {
    const out = run(`
      const m = v.view({ xmin: -0.2, xmax: 0.2, ymin: -0.08, ymax: 0.08, equal: true })
      let best = Infinity
      let n = 0
      for (let i = 0; i < 3; i++) {
        const t0 = Date.now()
        const f = v.efield(m, [], { conductors: [{ line: [0, 0, 8 + i * 0.05, 0], V: 1 }], lines: false, equipotentials: false, soft: 0 })
        best = Math.min(best, Date.now() - t0)
        n = f.surface.length
      }
      globalThis.__out = { dt: best, n }
    `) as { dt: number; n: number }
    expect(out.n).toBeGreaterThanOrEqual(360)
    expect(out.n).toBeLessThanOrEqual(420)
    expect(out.dt).toBeLessThan(150)
  })

  // A finger above two thin grounded plates (2026 Zhejiang): before the far-field
  // expansion, field lines plus equipotentials took about 6 s, over the 2 s sandbox budget.
  const finger = `[
    { points: [[-0.4, 0.3], [0.4, 0.3], [0.4, 2.4], [0, 2.7], [-0.4, 2.4]], V: 100 },
    { points: [[-4, -0.2], [4, -0.2], [4, 0], [-4, 0]], V: 0 },
    { points: [[-4, -2.2], [4, -2.2], [4, -2], [-4, -2]], V: 0 },
  ]`

  it('matches the panel-by-panel sum away from the panels', () => {
    const body = `
      const m = v.view({ xmin: -5, xmax: 5, ymin: -2.8, ymax: 2.8, equal: true })
      const f = v.efield(m, [{ x: 2.5, y: 1.5, q: 0.5 }], { conductors: ${finger}, lines: false, equipotentials: false, soft: 0 })
      const E = []
      const phi = []
      for (let i = 0; i < 1500; i++) {
        const x = -5 + 10 * ((i * 0.6180339887) % 1)
        const y = -2.8 + 5.6 * ((i * 0.7548776662) % 1)
        E.push(f.E(x, y))
        phi.push(f.phi(x, y))
      }
      globalThis.__out = { E, phi }
    `
    const exactSrc = runtime.replace('const EFIELD_FAR = 2.5', 'const EFIELD_FAR = 1e9')
    expect(exactSrc).not.toBe(runtime)
    const fast = run(body) as { E: number[][]; phi: number[] }
    const exact = run(body, exactSrc) as { E: number[][]; phi: number[] }
    const mags = exact.E.map(([x, y]) => Math.hypot(x, y)).sort((a, b) => a - b)
    const median = mags[Math.floor(mags.length / 2)]
    const range = Math.max(...exact.phi) - Math.min(...exact.phi)
    let eMax = 0
    let pMax = 0
    for (let i = 0; i < exact.E.length; i++) {
      eMax = Math.max(eMax, Math.hypot(fast.E[i][0] - exact.E[i][0], fast.E[i][1] - exact.E[i][1]) / median)
      pMax = Math.max(pMax, Math.abs(fast.phi[i] - exact.phi[i]) / range)
    }
    expect(eMax).toBeLessThan(1e-3)
    expect(pMax).toBeLessThan(1e-4)
  })

  it('draws a finger over thin plates with lines and equipotentials within the sandbox budget', () => {
    const out = run(`
      const m = v.view({ xmin: -5, xmax: 5, ymin: -2.8, ymax: 2.8, equal: true })
      const t0 = Date.now()
      const f = v.efield(m, [], { conductors: ${finger}, equipotentials: [15, 30, 45, 60, 75, 90], density: 1, arrows: true })
      globalThis.__out = { dt: Date.now() - t0, n: f.surface.length }
    `) as { dt: number; n: number }
    expect(out.n).toBeGreaterThan(100)
    expect(out.dt).toBeLessThan(400)
  })
})
