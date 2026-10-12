import { buildRuntime } from '../sim/buildRuntime'
import vm from 'node:vm'
import { describe, expect, it } from 'vitest'
import {
  E_CHARGE,
  ELECTRON_K,
  H_PLANCK,
  M_ELECTRON,
  electronLambdaPm,
  eyepieceHalfMm,
  fringeIntensity,
  fringeMarkMm,
  fringeRGB,
  fringeSpacingMm,
  fringeSpec,
  lightColor,
  lightColorCss,
  measurementOf,
  newtonRadiusMm,
  wedgeSpacingMm,
  wedgeThetaDeg,
} from './fringes'
import { validateLesson } from './validate'

const head = ['---', 'title: t', 'demo: true', '---', ''].join('\n')

describe('fringe spacings', () => {
  it('reproduces the 2017 Zhejiang double slit: Δx = Lλ/d = 0.500 mm', () => {
    // d = 0.80 mm, L = 0.80 m, λ = 500 nm
    expect(fringeSpacingMm(0.8, 500, 0.8)).toBeCloseTo(0.5, 10)
    const spec = fringeSpec({ type: 'double', lambdaNm: 500, dMm: 0.8, Lm: 0.8 }).spec!
    expect(spec.dxMm).toBeCloseTo(0.5, 10)
    expect(fringeMarkMm(spec, 1)).toBeCloseTo(0.5, 10)
    expect(fringeMarkMm(spec, 3)).toBeCloseTo(1.5, 10)
    expect(fringeMarkMm(spec, -2)).toBeCloseTo(-1, 10)
    expect(fringeIntensity(spec, 0)).toBeCloseTo(1, 8)
    expect(fringeIntensity(spec, 0.25)).toBeCloseTo(0, 8)
    expect(fringeIntensity(spec, 0.5)).toBeCloseTo(1, 8)
    // medium index replaces λ with λ/n
    expect(fringeSpacingMm(0.8, 500, 0.8, 1.5)).toBeCloseTo(0.5 / 1.5, 8)
  })

  it('multiplies by the single-slit envelope when a is set', () => {
    const spec = fringeSpec({ type: 'double', lambdaNm: 500, dMm: 0.8, aMm: 0.2, Lm: 0.8 }).spec!
    // first envelope zero at x = Lλ/a = 2 mm
    expect(fringeIntensity(spec, 0)).toBeCloseTo(1, 8)
    expect(fringeIntensity(spec, 2)).toBeCloseTo(0, 6)
    const sinc = Math.sin(Math.PI / 4) / (Math.PI / 4)
    expect(fringeIntensity(spec, 0.5)).toBeCloseTo(sinc * sinc, 6)
    expect(spec.widthMm).toBeCloseTo(4, 8)
  })

  it('gives a single slit or wire a central width 2Lλ/a and side spacing half of that', () => {
    const width = (2 * (1 * 632.8e-9)) / (0.605e-3) * 1e3
    const spec = fringeSpec({ type: 'single', lambdaNm: 632.8, aMm: 0.605, Lm: 1, wire: true }).spec!
    expect(width).toBeCloseTo(2.0919, 3)
    expect(spec.widthMm).toBeCloseTo(width, 8)
    expect(spec.dxMm).toBeCloseTo(width / 2, 8)
    expect(spec.wire).toBe(true)
    expect(fringeIntensity(spec, 0)).toBeCloseTo(1, 8)
    expect(fringeIntensity(spec, spec.dxMm)).toBeCloseTo(0, 6)
    const bare = fringeSpec({ type: 'single', lambdaNm: 632.8, aMm: 0.605, Lm: 1 }).spec!
    expect(bare.widthMm).toBeCloseTo(spec.widthMm, 10)
  })

  it('spaces an air wedge by λ/(2 n tanθ), from the shim when h and length are given', () => {
    expect(wedgeThetaDeg(0.05, 50)).toBeCloseTo((Math.atan(0.001) * 180) / Math.PI, 8)
    expect(wedgeSpacingMm(600, wedgeThetaDeg(0.05, 50))).toBeCloseTo(0.3, 8)
    const spec = fringeSpec({ type: 'wedge', lambdaNm: 600, hMm: 0.05, lengthMm: 50 }).spec!
    expect(spec.dxMm).toBeCloseTo(0.3, 8)
    expect(spec.thetaDeg).toBeCloseTo(wedgeThetaDeg(0.05, 50), 8)
    expect(fringeIntensity(spec, 0)).toBeCloseTo(0, 8)
    expect(fringeIntensity(spec, 0.15)).toBeCloseTo(1, 6)
    const transmitted = fringeSpec({ type: 'wedge', lambdaNm: 600, hMm: 0.05, lengthMm: 50, transmitted: true }).spec!
    expect(fringeIntensity(transmitted, 0)).toBeCloseTo(1, 8)
    // past the end of the film there is no light
    expect(fringeIntensity(spec, 50.1)).toBe(0)
  })

  it('places Newton dark rings at √(k R λ) and swaps transmitted light', () => {
    const r1 = Math.sqrt(589e-9) * 1e3
    expect(newtonRadiusMm(1, 1, 589)).toBeCloseTo(r1, 8)
    expect(r1).toBeCloseTo(0.7675, 3)
    expect(newtonRadiusMm(4, 1, 589)).toBeCloseTo(2 * r1, 8)
    const spec = fringeSpec({ type: 'newton', lambdaNm: 589, Rm: 1 }).spec!
    expect(fringeMarkMm(spec, 1)).toBeCloseTo(r1, 8)
    expect(fringeIntensity(spec, 0)).toBeCloseTo(0, 8)
    expect(fringeIntensity(spec, r1)).toBeCloseTo(0, 6)
    const transmitted = fringeSpec({ type: 'newton', lambdaNm: 589, Rm: 1, transmitted: true }).spec!
    expect(fringeIntensity(transmitted, 0)).toBeCloseTo(1, 8)
    expect(fringeMarkMm(transmitted, 1)).toBeCloseTo(r1, 8)
  })

  it('sets electron ring radii proportional to h/√(2meU)', () => {
    const lam = electronLambdaPm(5000)
    expect(lam).toBeGreaterThan(17.2)
    expect(lam).toBeLessThan(17.5)
    expect(lam).toBeCloseTo((H_PLANCK / Math.sqrt(2 * M_ELECTRON * E_CHARGE * 5000)) * 1e12, 6)
    const spec = fringeSpec({ type: 'electron', U: 5000, kGeom: ELECTRON_K }).spec!
    expect(spec.lambdaPm).toBeCloseTo(lam, 8)
    expect(spec.dxMm).toBeCloseTo(ELECTRON_K * lam, 8)
    expect(fringeMarkMm(spec, 3)).toBeCloseTo(3 * ELECTRON_K * lam, 8)
    // higher voltage, shorter wavelength, smaller ring
    const fast = fringeSpec({ type: 'electron', U: 20000 }).spec!
    expect(fast.lambdaPm).toBeCloseTo(lam / 2, 6)
    expect(fast.dxMm).toBeCloseTo(spec.dxMm / 2, 6)
  })
})

describe('wavelength colour', () => {
  it('is red, green and blue in the right bands, and black outside', () => {
    const red = lightColor(650)
    expect(red).toEqual({ r: 255, g: 0, b: 0 })
    const green = lightColor(550)
    expect(green.g).toBeGreaterThan(green.r)
    expect(green.b).toBe(0)
    expect(green.r).toBeGreaterThan(80)
    const blue = lightColor(450)
    expect(blue.r).toBe(0)
    expect(blue.b).toBe(255)
    expect(blue.g).toBeGreaterThan(0)
    expect(blue.g).toBeLessThan(blue.b)
    expect(lightColor(300)).toEqual({ r: 0, g: 0, b: 0 })
    expect(lightColorCss(650)).toBe('rgb(255,0,0)')
  })

  it('paints a white centre and coloured edges for white-light fringes', () => {
    const spec = fringeSpec({ type: 'double', dMm: 0.2, Lm: 1, white: true }).spec!
    const mid = fringeRGB(spec, 0, 0)
    expect(mid.r).toBeGreaterThan(240)
    expect(mid.g).toBeGreaterThan(240)
    expect(mid.b).toBeGreaterThan(240)
    const edge = fringeRGB(spec, 1.6, 0)
    const spread = Math.max(edge.r, edge.g, edge.b) - Math.min(edge.r, edge.g, edge.b)
    expect(spread).toBeGreaterThan(15)
  })

  it('matches v.lightColor in the sandbox', () => {
    const runtime = buildRuntime()
    const posts: { type?: string; message?: string }[] = []
    const listeners: Record<string, ((e: unknown) => void)[]> = {}
    const canvas = {
      width: 0,
      height: 0,
      style: {},
      getContext: () =>
        new Proxy(
          {},
          {
            get: (_t, prop) => (prop === 'measureText' ? () => ({ width: 10 }) : () => undefined),
            set: () => true,
          },
        ),
    }
    const parent = { postMessage: (msg: { type?: string; message?: string }) => posts.push(msg) }
    const sandbox: Record<string, unknown> = {
      Math, JSON, Number, Array, Object, String, Boolean, Infinity, NaN, isFinite, isNaN, parseFloat, parseInt, Date,
      console,
      document: { getElementById: () => canvas, documentElement: { clientWidth: 640, clientHeight: 280 } },
      parent,
      devicePixelRatio: 1,
      performance: { now: () => 0 },
      requestAnimationFrame: () => 0,
      cancelAnimationFrame: () => undefined,
      addEventListener: (type: string, fn: (e: unknown) => void) => (listeners[type] ??= []).push(fn),
    }
    sandbox.window = sandbox
    sandbox.globalThis = sandbox
    const context = vm.createContext(sandbox)
    vm.runInContext(runtime, context, { timeout: 20000 })
    vm.runInContext(
      'sim({ at(){ return {} }, draw(ctx, s, v) { globalThis.__out = [380, 450, 550, 650, 780, 300].map((w) => v.lightColor(w)) } })',
      context,
      { timeout: 20000 },
    )
    vm.runInContext('__simReady()', context)
    for (const fn of listeners.message || []) fn({ source: parent, data: { source: 'genui-host', params: {}, t: 0, colors: {}, theme: 'light' } })
    const err = posts.filter((p) => p.type === 'error').map((p) => p.message).join('\n')
    expect(err).toBe('')
    const got = sandbox.__out as string[]
    expect(got).toEqual([380, 450, 550, 650, 780, 300].map((w) => lightColorCss(w)))
  })
})

describe('measurement head', () => {
  it('recovers λ = d Δx / L from the two drum readings of the 2017 fringes', () => {
    const result = measurementOf(
      {
        type: 'measurementHead',
        value: 3.5,
        fringes: { lambda: 500, d: 0.8, L: 0.8, offset: 2 },
        pair: { x1: 2.5, n: 3 },
        read: { dx: 'mdx', lambda: 'mlam', x: 'xs' },
      },
      {},
    )
    expect(result.q).toBeCloseTo(3.5, 8)
    expect(result.xScreen).toBeCloseTo(1.5, 8)
    expect(result.dx).toBeCloseTo(0.5, 8)
    expect(result.lambdaNm).toBeCloseTo(500, 6)
    expect(result.values).toMatchObject({ mdx: 0.5, mlam: 500, xs: 1.5 })
    // the crosshair sits on the third bright fringe
    expect(fringeIntensity(result.spec!, result.xScreen)).toBeCloseTo(1, 6)
    expect(eyepieceHalfMm(result.spec!)).toBeGreaterThan(result.spec!.dxMm)
  })
})

describe('fringe validator', () => {
  it('publishes spacings and the measurement-head wavelength', () => {
    const src =
      head +
      [
        '<Param name="d" label="d" value={0.8} min={0.2} max={2} />',
        '',
        '<Param name="xc" label="x" value={0.25} min={-2} max={2} />',
        '',
        '<Fringes type="double" lambda={500} d="d" L={0.8} cursor="xc" marks={[{k: 1, label: "P1"}, {k: 3}]} read={{dx: "dx", r1: "p1", r3: "p3", I: "Iat"}} />',
        '',
        '<Instrument type="measurementHead" value="3*dx+2" fringes={{lambda: 500, d: "d", L: 0.8, offset: 2}} pair={{x1: "dx+2", n: 3}} read={{dx: "mdx", lambda: "mlam"}} />',
      ].join('\n')
    const result = validateLesson(src)
    expect(result.errors).toEqual([])
    expect(result.scope?.dx).toBeCloseTo(0.5, 8)
    expect(result.scope?.p1).toBeCloseTo(0.5, 8)
    expect(result.scope?.p3).toBeCloseTo(1.5, 8)
    expect(result.scope?.Iat).toBeCloseTo(0, 8)
    expect(result.scope?.mdx).toBeCloseTo(0.5, 8)
    expect(result.scope?.mlam).toBeCloseTo(500, 6)
  })

  it('rejects a bad type, a newton dx, and a measurement head without the pair it needs', () => {
    const src =
      head +
      [
        '<Param name="x" value={1} min={0} max={2} />',
        '',
        '<Fringes type="rings" lambda={500} />',
        '',
        '<Fringes type="newton" lambda={589} R={1} read={{dx: "dx"}} />',
        '',
        '<Fringes type="double" lambda={500} d={0.2} wire />',
        '',
        '<Fringes type="wedge" lambda={500} />',
        '',
        '<Instrument type="vernier" value="x" fringes={{lambda: 500, d: 0.2, L: 1}} />',
        '',
        '<Instrument type="measurementHead" value="x" read={{lambda: "lam"}} />',
        '',
        '<Instrument type="measurementHead" value="x" pair={{x1: 1, n: 1}} />',
      ].join('\n')
    const msgs = validateLesson(src).errors.map((e) => e.message).join('\n')
    expect(msgs).toMatch(/type 不合法：rings/)
    expect(msgs).toMatch(/不要读 dx/)
    expect(msgs).toMatch(/wire 只用于/)
    expect(msgs).toMatch(/wedge 要写 theta/)
    expect(msgs).toMatch(/只用于 type="measurementHead"/)
    expect(msgs).toMatch(/需要 pair/)
    expect(msgs).toMatch(/pair\.n 应大于 1/)
  })
})
