// Interference and diffraction patterns for <Fringes> and the double-slit
// measurement head. Spacing and radius are computed here; spectral colour lives in lightcolor.ts.
// Screen lengths are millimetres; lambda is nanometres (picometres for electrons);
// slit spacing d and width a are millimetres; L and the Newton radius R are metres;
// wedge angle theta is degrees; accelerating voltage U is volts.

import { num, symbolsOf, type Scope } from './expr'
import { lightColor, lightColorCss, type RGB } from './lightcolor'

export { lightColor, lightColorCss }
export type { RGB }

const IDENT = /^[A-Za-z][A-Za-z0-9_]*$/
const READ_KEY = /^(dx|width|lambda|theta|I|x|r(?:[1-9]|1\d|20))$/

export const FRINGE_TYPES = ['double', 'single', 'wedge', 'newton', 'electron'] as const
export type FringeType = (typeof FRINGE_TYPES)[number]

/** CODATA-scale constants for λ = h / √(2 m e U). */
export const H_PLANCK = 6.62607015e-34
export const M_ELECTRON = 9.1093837e-31
export const E_CHARGE = 1.602176634e-19

/** Default electron-ring geometry: r_n (mm) = n · k · λ (pm). */
export const ELECTRON_K = 0.4

const WHITE_STEP = 5
const WHITE_LAMBDAS: number[] = []
for (let w = 380; w <= 760; w += WHITE_STEP) WHITE_LAMBDAS.push(w)

const WHITE_RGB = WHITE_LAMBDAS.map((lam) => ({ lam, rgb: lightColor(lam) }))

/** Bright-fringe spacing Δx = L λ / (n d), in mm. */
export function fringeSpacingMm(Lm: number, lambdaNm: number, dMm: number, n = 1): number {
  return ((Lm * (lambdaNm * 1e-9)) / n / (dMm * 1e-3)) * 1e3
}

/** Air-wedge fringe spacing Δx = λ / (2 n tanθ), in mm. θ in degrees. */
export function wedgeSpacingMm(lambdaNm: number, thetaDeg: number, n = 1): number {
  const tan = Math.tan((thetaDeg * Math.PI) / 180)
  return ((lambdaNm * 1e-9) / (2 * n * tan)) * 1e3
}

export function wedgeThetaDeg(hMm: number, lengthMm: number): number {
  return (Math.atan(hMm / lengthMm) * 180) / Math.PI
}

/** Reflected Newton dark-ring radius r_k = √(k R λ / n), in mm. k = 0 is the centre. */
export function newtonRadiusMm(k: number, Rm: number, lambdaNm: number, n = 1): number {
  return Math.sqrt((k * Rm * (lambdaNm * 1e-9)) / n) * 1e3
}

/** Non-relativistic de Broglie wavelength in pm. */
export function electronLambdaPm(U: number): number {
  return (H_PLANCK / Math.sqrt(2 * M_ELECTRON * E_CHARGE * U)) * 1e12
}

export interface FringeInput {
  type: FringeType
  lambdaNm?: number
  dMm?: number
  aMm?: number
  Lm?: number
  n?: number
  thetaDeg?: number
  hMm?: number
  lengthMm?: number
  Rm?: number
  U?: number
  kGeom?: number
  spanMm?: number
  white?: boolean
  wire?: boolean
  transmitted?: boolean
}

export interface FringeSpec {
  type: FringeType
  lambdaNm: number
  n: number
  dMm: number
  aMm: number
  Lm: number
  thetaDeg: number
  hMm: number | null
  lengthMm: number
  Rm: number
  U: number
  kGeom: number
  lambdaPm: number
  /** Primary spacing in mm: bright fringes, side-lobe spacing, wedge spacing, or electron ring spacing. */
  dxMm: number
  /** Central bright width 2Lλ/a, or 0 when there is no single-slit envelope. */
  widthMm: number
  white: boolean
  wire: boolean
  transmitted: boolean
  /** Full width of the picture in mm. Radial patterns use this as the diameter. */
  spanMm: number
  /** Screen coordinate of the left edge. Radial patterns are centred, so this is −span/2. */
  x0: number
  radial: boolean
}

function finitePos(v: number | undefined): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v > 0
}

export function fringeSpec(input: FringeInput): { spec?: FringeSpec; error?: string } {
  const n = input.n === undefined ? 1 : input.n
  if (!(n > 0) || !Number.isFinite(n)) return { error: '折射率 n 应为正数' }
  const type = input.type
  const white = type === 'double' && input.white === true
  const lambdaNm = input.lambdaNm ?? (white ? 550 : NaN)
  let dxMm = NaN
  let widthMm = 0
  let thetaDeg = input.thetaDeg ?? NaN
  let lengthMm = input.lengthMm ?? NaN
  let hMm: number | null = finitePos(input.hMm) ? input.hMm : null
  let lambdaPm = 0
  let kGeom = input.kGeom ?? ELECTRON_K
  const aMm = input.aMm ?? 0
  const dMm = input.dMm ?? 0
  const Lm = input.Lm ?? 0
  const Rm = input.Rm ?? 0
  const U = input.U ?? 0

  if (type === 'double' || type === 'single') {
    if (!white && !finitePos(lambdaNm)) return { error: '波长 λ 应为正数（nm）' }
    if (!finitePos(Lm)) return { error: '缝到屏的距离 L 应为正数（m）' }
    if (type === 'double' && !finitePos(dMm)) return { error: '双缝间距 d 应为正数（mm）' }
    if (type === 'single' && !finitePos(aMm)) return { error: '缝宽（或丝径）a 应为正数（mm）' }
    if (input.aMm !== undefined && !(aMm > 0)) return { error: '缝宽 a 应为正数（mm）' }
    if (type === 'double') dxMm = fringeSpacingMm(Lm, white ? 550 : lambdaNm, dMm, n)
    else dxMm = fringeSpacingMm(Lm, lambdaNm, aMm, n)
    if (aMm > 0) widthMm = 2 * fringeSpacingMm(Lm, white ? lambdaNm || 550 : lambdaNm, aMm, n)
    if (type === 'single') widthMm = 2 * dxMm
  } else if (type === 'wedge') {
    if (!finitePos(lambdaNm)) return { error: '波长 λ 应为正数（nm）' }
    const hasH = finitePos(input.hMm) && finitePos(input.lengthMm)
    if (hasH) {
      thetaDeg = wedgeThetaDeg(input.hMm!, input.lengthMm!)
      lengthMm = input.lengthMm!
      hMm = input.hMm!
    } else if (!finitePos(thetaDeg)) return { error: '劈尖要有正的 θ（度），或正的末端厚度 h 和长度 length（mm）' }
    if (!finitePos(lengthMm)) lengthMm = finitePos(input.spanMm) ? input.spanMm : 20
    dxMm = wedgeSpacingMm(lambdaNm, thetaDeg, n)
  } else if (type === 'newton') {
    if (!finitePos(lambdaNm)) return { error: '波长 λ 应为正数（nm）' }
    if (!finitePos(Rm)) return { error: '曲率半径 R 应为正数（m）' }
    dxMm = newtonRadiusMm(1, Rm, lambdaNm, n)
  } else {
    if (!finitePos(U)) return { error: '加速电压 U 应为正数（V）' }
    if (!(kGeom > 0) || !Number.isFinite(kGeom)) return { error: '几何比例 k 应为正数（mm/pm）' }
    lambdaPm = electronLambdaPm(U)
    dxMm = kGeom * lambdaPm
  }
  if (!Number.isFinite(dxMm) || dxMm <= 0) return { error: '条纹间距不是有限的正数，检查波长、间距和角度' }

  const radial = type === 'newton' || type === 'electron'
  let spanMm = input.spanMm ?? 0
  if (!finitePos(spanMm)) {
    if (type === 'wedge') spanMm = lengthMm
    else if (type === 'newton') spanMm = 6
    else if (type === 'electron') spanMm = 50
    else spanMm = 8
  }
  const lamOut = type === 'electron' ? 0 : white ? input.lambdaNm ?? 550 : lambdaNm
  return {
    spec: {
      type,
      lambdaNm: lamOut,
      n,
      dMm,
      aMm,
      Lm,
      thetaDeg,
      hMm,
      lengthMm: type === 'wedge' ? lengthMm : 0,
      Rm,
      U,
      kGeom,
      lambdaPm,
      dxMm,
      widthMm,
      white,
      wire: type === 'single' && input.wire === true,
      transmitted: (type === 'wedge' || type === 'newton') && input.transmitted === true,
      spanMm,
      x0: type === 'wedge' ? 0 : -spanMm / 2,
      radial,
    },
  }
}

/** Physical intensity in [0, 1] at screen position x (mm). Radial patterns use the radius √(x²+y²). */
export function fringeIntensity(spec: FringeSpec, xMm: number, yMm = 0): number {
  const x = spec.radial ? Math.hypot(xMm, yMm) : xMm
  if (spec.type === 'double') return doubleI(spec, x, spec.white ? 550 : spec.lambdaNm)
  if (spec.type === 'single') return singleI(spec, x, spec.lambdaNm)
  if (spec.type === 'wedge') {
    if (x < 0 || (spec.lengthMm > 0 && x > spec.lengthMm + 1e-6)) return 0
    const phase = (Math.PI * x) / spec.dxMm
    const darkAtContact = Math.sin(phase) ** 2
    return spec.transmitted ? 1 - darkAtContact : darkAtContact
  }
  if (spec.type === 'newton') {
    const phase = (Math.PI * spec.n * x * x * 1000) / (spec.Rm * spec.lambdaNm)
    const dark = Math.sin(phase) ** 2
    return spec.transmitted ? 1 - dark : dark
  }
  return electronI(spec, x)
}

function beta(xMm: number, lambdaNm: number, gapMm: number, Lm: number, n: number): number {
  return (Math.PI * gapMm * xMm * n * 1000) / (lambdaNm * Lm)
}

function sinc2(alpha: number): number {
  if (Math.abs(alpha) < 1e-8) return 1
  return (Math.sin(alpha) / alpha) ** 2
}

function doubleI(spec: FringeSpec, xMm: number, lambdaNm: number): number {
  const cos = Math.cos(beta(xMm, lambdaNm, spec.dMm, spec.Lm, spec.n)) ** 2
  const env = spec.aMm > 0 ? sinc2(beta(xMm, lambdaNm, spec.aMm, spec.Lm, spec.n)) : 1
  return cos * env
}

function singleI(spec: FringeSpec, xMm: number, lambdaNm: number): number {
  return sinc2(beta(xMm, lambdaNm, spec.aMm, spec.Lm, spec.n))
}

function electronI(spec: FringeSpec, rMm: number): number {
  const sig = Math.max(spec.dxMm * 0.11, 0.05)
  let I = 1.35 * Math.exp(-(rMm * rMm) / (2 * (sig * 1.15) ** 2))
  const rings = Math.min(8, Math.ceil(spec.spanMm / 2 / spec.dxMm) + 1)
  for (let k = 1; k <= rings; k++) {
    const rk = k * spec.dxMm
    I += (0.9 / Math.sqrt(k)) * Math.exp(-((rMm - rk) ** 2) / (2 * sig * sig))
  }
  return Math.max(0, Math.min(1, I))
}

function tone(I: number, power = 1.35): number {
  const x = Math.min(1, Math.max(0, I))
  return Math.pow(x, power)
}

/** Display colour, already contrasted so bright fringes separate on the dark screen. */
export function fringeRGB(spec: FringeSpec, xMm: number, yMm = 0): RGB {
  if (spec.type === 'electron') {
    const v = Math.round(255 * Math.pow(Math.min(1, electronI(spec, Math.hypot(xMm, yMm))), 0.85))
    return { r: v, g: v, b: v }
  }
  if (spec.white && spec.type === 'double') {
    const x = xMm
    let r = 0
    let g = 0
    let b = 0
    let r0 = 0
    let g0 = 0
    let b0 = 0
    for (const s of WHITE_RGB) {
      const t = tone(doubleI(spec, x, s.lam))
      r += t * s.rgb.r
      g += t * s.rgb.g
      b += t * s.rgb.b
      r0 += s.rgb.r
      g0 += s.rgb.g
      b0 += s.rgb.b
    }
    const ch = (c: number, z: number) => (z <= 0 ? 0 : Math.max(0, Math.min(255, Math.round((255 * c) / z))))
    return { r: ch(r, r0), g: ch(g, g0), b: ch(b, b0) }
  }
  const x = spec.radial ? Math.hypot(xMm, yMm) : xMm
  // sinc² side lobes are only ~5% of the centre; a softer curve keeps them visible.
  const I = tone(fringeIntensity(spec, xMm, yMm), spec.type === 'single' ? 0.32 : 1.35)
  const lam = spec.type === 'double' && spec.white ? 550 : spec.lambdaNm
  const c = lightColor(lam)
  // wedge x < 0 is outside the film
  if (spec.type === 'wedge' && x < -1e-9) return { r: 0, g: 0, b: 0 }
  return { r: Math.round(c.r * I), g: Math.round(c.g * I), b: Math.round(c.b * I) }
}

/** Screen position (mm) of the k-th primary fringe. Radial types return the radius. */
export function fringeMarkMm(spec: FringeSpec, k: number, dark = false): number {
  if (spec.type === 'double') return (k + (dark ? 0.5 : 0)) * spec.dxMm
  if (spec.type === 'single') return k * (spec.widthMm / 2)
  // Wedge: order k is the fringe counted from the contact (dark in reflection). dark shifts half a spacing.
  if (spec.type === 'wedge') return (k + (dark ? 0.5 : 0)) * spec.dxMm
  if (spec.type === 'newton') return k <= 0 ? 0 : newtonRadiusMm(k, spec.Rm, spec.lambdaNm, spec.n)
  return k * spec.dxMm
}

export function orderValue(spec: FringeSpec, k: number): number {
  if (k <= 0) return NaN
  if (spec.type === 'newton') return newtonRadiusMm(k, spec.Rm, spec.lambdaNm, spec.n)
  if (spec.type === 'single') return k * (spec.widthMm / 2)
  if (spec.type === 'double') return k * spec.dxMm
  if (spec.type === 'wedge') return k * spec.dxMm
  return k * spec.dxMm
}

function fmtIn(v: number): string {
  if (!Number.isFinite(v)) return '—'
  const a = Math.abs(v)
  if (a === 0) return '0'
  if (a >= 10000 || a < 0.001) return v.toPrecision(4)
  const r = Math.round(v * 1e6) / 1e6
  return String(r)
}

function fmtMm(v: number): string {
  if (!Number.isFinite(v)) return '—'
  const a = Math.abs(v)
  if (a >= 100) return fmtIn(v)
  return v.toFixed(a >= 0.01 ? 3 : 4)
}

export function fringeLines(spec: FringeSpec, cursor?: { x: number; I: number } | null): string[] {
  const lines: string[] = []
  if (spec.type === 'double') {
    if (spec.white) {
      lines.push('白光按 380–760 nm 每隔 5 nm 叠加：中央各色重合为白，两侧分开呈彩色')
      const sample = fringeSpacingMm(spec.Lm, 550, spec.dMm, spec.n)
      lines.push(`各色 Δx = Lλ/(n d)；550 nm 的间距是 ${fmtMm(sample)} mm（L = ${fmtIn(spec.Lm)} m，d = ${fmtIn(spec.dMm)} mm，n = ${fmtIn(spec.n)}）`)
    } else {
      const nBit = spec.n === 1 ? '' : '/n'
      lines.push(
        `Δx = Lλ${nBit}/d = ${fmtMm(spec.dxMm)} mm（L = ${fmtIn(spec.Lm)} m，λ = ${fmtIn(spec.lambdaNm)} nm，n = ${fmtIn(spec.n)}，d = ${fmtIn(spec.dMm)} mm）`,
      )
    }
    if (spec.aMm > 0) lines.push(`单缝包络把条纹裹在中央宽度 2Lλ/a = ${fmtMm(spec.widthMm)} mm 里（a = ${fmtIn(spec.aMm)} mm），不要手画包络`)
  } else if (spec.type === 'single') {
    const who = spec.wire ? '细丝（巴比涅原理，与等宽单缝的图样相同）' : '单缝'
    lines.push(
      `${who}：中央亮纹宽度 2Lλ/a = ${fmtMm(spec.widthMm)} mm，两侧亮纹间距为其一半 ${fmtMm(spec.dxMm)} mm（λ = ${fmtIn(spec.lambdaNm)} nm，a = ${fmtIn(spec.aMm)} mm，L = ${fmtIn(spec.Lm)} m）`,
    )
  } else if (spec.type === 'wedge') {
    const from = spec.hMm !== null ? `，tanθ = h/length = ${fmtIn(spec.hMm)}/${fmtIn(spec.lengthMm)}` : ''
    lines.push(
      `Δx = λ/(2 n tanθ) = ${fmtMm(spec.dxMm)} mm（λ = ${fmtIn(spec.lambdaNm)} nm，n = ${fmtIn(spec.n)}，θ = ${fmtIn(spec.thetaDeg)}°${from}）`,
    )
    lines.push(spec.transmitted ? '透射：接触端为亮纹' : '反射：接触端为暗纹（半波损失）。线性劈尖的条纹等间距，垫片变薄时间距变大')
  } else if (spec.type === 'newton') {
    const r1 = newtonRadiusMm(1, spec.Rm, spec.lambdaNm, spec.n)
    const r5 = newtonRadiusMm(5, spec.Rm, spec.lambdaNm, spec.n)
    lines.push(
      `${spec.transmitted ? '透射亮环' : '反射暗环'} r_k = √(k R λ/n)：r_1 = ${fmtMm(r1)} mm，r_5 = ${fmtMm(r5)} mm（R = ${fmtIn(spec.Rm)} m，λ = ${fmtIn(spec.lambdaNm)} nm，n = ${fmtIn(spec.n)}）`,
    )
    lines.push(spec.transmitted ? '透射：中心为亮斑，越往外环越密' : '反射：中心为暗斑，越往外环越密。半径由公式算出，不要手画圆')
  } else {
    const r1 = spec.dxMm
    lines.push(
      `λ = h/√(2 m e U) = ${spec.lambdaPm.toFixed(2)} pm（U = ${fmtIn(spec.U)} V）；第 n 环半径 r_n = n·k·λ = n × ${fmtMm(r1)} mm（k = ${fmtIn(spec.kGeom)} mm/pm）`,
    )
  }
  if (cursor && Number.isFinite(cursor.x)) {
    lines.push(`x = ${fmtMm(cursor.x)} mm 处相对光强 I = ${Number.isFinite(cursor.I) ? cursor.I.toFixed(2) : '—'}`)
  }
  const pxPer = 640 / spec.spanMm
  if (!spec.radial && spec.dxMm * pxPer < 2.2) lines.push('条纹比画面分辨率还密，看起来会发灰；把间距拉大（或加大 span）才能分开')
  return lines
}

export interface FringeRead {
  dx?: number
  width?: number
  lambda?: number
  theta?: number
  I?: number
  x?: number
  orders: Record<number, number>
}

export function fringeQuantities(spec: FringeSpec, cursorX?: number | null): FringeRead {
  const orders: Record<number, number> = {}
  for (let k = 1; k <= 20; k++) orders[k] = orderValue(spec, k)
  const I = cursorX === undefined || cursorX === null || !Number.isFinite(cursorX) ? undefined : fringeIntensity(spec, cursorX, 0)
  return {
    dx: spec.type === 'newton' ? undefined : spec.dxMm,
    width: spec.widthMm > 0 ? spec.widthMm : undefined,
    lambda: spec.type === 'electron' ? spec.lambdaPm : spec.lambdaNm / spec.n,
    theta: spec.type === 'wedge' ? spec.thetaDeg : undefined,
    I,
    x: cursorX === undefined || cursorX === null ? undefined : cursorX,
    orders,
  }
}

function collectNames(values: unknown[]): string[] {
  const out = new Set<string>()
  for (const v of values) {
    if (typeof v !== 'string') continue
    try {
      for (const s of symbolsOf(v)) out.add(s)
    } catch {
      // validator reports unparsable expressions
    }
  }
  return [...out]
}

function readMap(read: unknown): [string, string][] | null {
  if (!read || typeof read !== 'object' || Array.isArray(read)) return null
  return Object.entries(read).filter((e): e is [string, string] => typeof e[1] === 'string')
}

export function fringeOutputs(props: Record<string, unknown>): string[] {
  return (readMap(props.read) ?? []).map(([, name]) => name).filter((n) => IDENT.test(n))
}

export function fringeInputs(props: Record<string, unknown>): string[] {
  const bag: unknown[] = [props.lambda, props.d, props.a, props.L, props.n, props.theta, props.h, props.length, props.R, props.U, props.k, props.span]
  if (typeof props.cursor === 'string') bag.push(props.cursor)
  return collectNames(bag)
}

export interface SolvedFringes {
  values: Record<string, number>
  warnings: string[]
  spec?: FringeSpec
}

function readNumber(value: unknown, scope: Scope): number | undefined {
  if (value === undefined) return undefined
  return num(value, scope, NaN)
}

export function solveFringeProps(props: Record<string, unknown>, scope: Scope): SolvedFringes {
  const warnings: string[] = []
  const type = String(props.type)
  if (!(FRINGE_TYPES as readonly string[]).includes(type)) return { values: {}, warnings: ['type 不合法'] }
  const input: FringeInput = {
    type: type as FringeType,
    lambdaNm: readNumber(props.lambda, scope),
    dMm: readNumber(props.d, scope),
    aMm: readNumber(props.a, scope),
    Lm: readNumber(props.L, scope),
    n: readNumber(props.n, scope),
    thetaDeg: readNumber(props.theta, scope),
    hMm: readNumber(props.h, scope),
    lengthMm: readNumber(props.length, scope),
    Rm: readNumber(props.R, scope),
    U: readNumber(props.U, scope),
    kGeom: readNumber(props.k, scope),
    spanMm: readNumber(props.span, scope),
    white: props.white === true,
    wire: props.wire === true,
    transmitted: props.transmitted === true,
  }
  const built = fringeSpec(input)
  const map = readMap(props.read) ?? []
  if (built.error || !built.spec) {
    warnings.push(built.error ?? '无法计算')
    return { values: Object.fromEntries(map.map(([, name]) => [name, NaN])), warnings }
  }
  const cursorX = typeof props.cursor === 'string' ? Number(scope[props.cursor]) : undefined
  const q = fringeQuantities(built.spec, Number.isFinite(cursorX) ? cursorX : null)
  const values: Record<string, number> = {}
  for (const [key, name] of map) {
    if (!IDENT.test(name)) continue
    const order = /^r(\d+)$/.exec(key)
    if (order) values[name] = q.orders[Number(order[1])] ?? NaN
    else if (key === 'dx') values[name] = q.dx ?? NaN
    else if (key === 'width') values[name] = q.width ?? NaN
    else if (key === 'lambda') values[name] = q.lambda ?? NaN
    else if (key === 'theta') values[name] = q.theta ?? NaN
    else if (key === 'I') values[name] = q.I ?? NaN
    else if (key === 'x') values[name] = q.x ?? NaN
    else values[name] = NaN
  }
  for (const v of Object.values(values)) if (!Number.isFinite(v)) warnings.push('有读数不是有限数')
  return { values, warnings: [...new Set(warnings)], spec: built.spec }
}

export interface MeasurementResult {
  /** Drum reading in mm, clamped and rounded like the micrometer (0.001 mm). */
  q: number
  /** Screen coordinate under the crosshair: q − offset. */
  xScreen: number
  offset: number
  dx: number | null
  lambdaNm: number | null
  lines: string[]
  warnings: string[]
  values: Record<string, number>
  spec: FringeSpec | null
}

export function measurementOf(props: Record<string, unknown>, scope: Scope): MeasurementResult {
  const warnings: string[] = []
  const raw = num(props.value, scope, NaN)
  const q = Number.isFinite(raw) ? Math.max(0, Math.round(raw * 1000) / 1000) : NaN
  const fr = props.fringes && typeof props.fringes === 'object' && !Array.isArray(props.fringes) ? (props.fringes as Record<string, unknown>) : null
  const pair = props.pair && typeof props.pair === 'object' && !Array.isArray(props.pair) ? (props.pair as Record<string, unknown>) : null
  const offset = fr && fr.offset !== undefined ? num(fr.offset, scope, 0) : 0
  const xScreen = Number.isFinite(q) ? q - (Number.isFinite(offset) ? offset : 0) : NaN
  let spec: FringeSpec | null = null
  if (fr && fr.lambda !== undefined && fr.d !== undefined && fr.L !== undefined) {
    const built = fringeSpec({
      type: 'double',
      lambdaNm: num(fr.lambda, scope, NaN),
      dMm: num(fr.d, scope, NaN),
      aMm: fr.a !== undefined ? num(fr.a, scope, NaN) : undefined,
      Lm: num(fr.L, scope, NaN),
      n: fr.n !== undefined ? num(fr.n, scope, NaN) : undefined,
    })
    if (built.spec) spec = built.spec
    else if (built.error) warnings.push(built.error)
  }
  let dx: number | null = null
  let lambdaNm: number | null = null
  const lines: string[] = []
  if (Number.isFinite(xScreen) && fr) lines.push(`分划板对准屏上 x = 读数 − 偏移 = ${fmtMm(xScreen)} mm`)
  if (pair && pair.x1 !== undefined && pair.n !== undefined && Number.isFinite(q)) {
    const x1raw = num(pair.x1, scope, NaN)
    const x1 = Number.isFinite(x1raw) ? Math.max(0, Math.round(x1raw * 1000) / 1000) : NaN
    const nFr = num(pair.n, scope, NaN)
    if (Number.isFinite(x1) && Number.isFinite(nFr) && nFr > 1) {
      dx = (q - x1) / (nFr - 1)
      lines.push(`Δx = (x_n − x_1)/(n − 1) = (${fmtMm(q)} − ${fmtMm(x1)})/(${fmtIn(nFr)} − 1) = ${fmtMm(dx)} mm`)
      const dMm = pair.d !== undefined ? num(pair.d, scope, NaN) : fr ? num(fr.d, scope, NaN) : NaN
      const Lm = pair.L !== undefined ? num(pair.L, scope, NaN) : fr ? num(fr.L, scope, NaN) : NaN
      if (Number.isFinite(dMm) && dMm > 0 && Number.isFinite(Lm) && Lm > 0 && Number.isFinite(dx)) {
        lambdaNm = ((dMm * 1e-3 * (dx * 1e-3)) / Lm) * 1e9
        lines.push(`λ = d·Δx/L = ${fmtMm(lambdaNm)} nm（d = ${fmtIn(dMm)} mm，L = ${fmtIn(Lm)} m）`)
      }
    } else warnings.push('pair 的 x1、n 算不出条纹间距')
  }
  const values: Record<string, number> = {}
  for (const [key, name] of readMap(props.read) ?? []) {
    if (!IDENT.test(name)) continue
    if (key === 'dx') values[name] = dx ?? NaN
    else if (key === 'lambda') values[name] = lambdaNm ?? NaN
    else if (key === 'x') values[name] = xScreen
    else values[name] = NaN
  }
  return { q, xScreen, offset: Number.isFinite(offset) ? offset : 0, dx, lambdaNm, lines, warnings, values, spec }
}

/** Half-width of the eyepiece field, in mm, so several real fringes sit in the circle. */
export function eyepieceHalfMm(spec: FringeSpec): number {
  if (!(spec.dxMm > 0)) return 2
  return Math.min(8, Math.max(0.5, 4.2 * spec.dxMm))
}

export function measurementOutputs(props: Record<string, unknown>): string[] {
  if (props.type !== 'measurementHead') return []
  return (readMap(props.read) ?? []).map(([, name]) => name).filter((n) => IDENT.test(n))
}

export function measurementInputs(props: Record<string, unknown>): string[] {
  const bag: unknown[] = [props.value]
  const fr = props.fringes
  if (fr && typeof fr === 'object' && !Array.isArray(fr)) {
    for (const k of ['lambda', 'd', 'L', 'n', 'a', 'offset'] as const) bag.push((fr as Record<string, unknown>)[k])
  }
  const pair = props.pair
  if (pair && typeof pair === 'object' && !Array.isArray(pair)) {
    for (const k of ['x1', 'n', 'd', 'L'] as const) bag.push((pair as Record<string, unknown>)[k])
  }
  return collectNames(bag)
}

type IssueFn = (m: string) => void
type ExprFn = (value: unknown, where: string, extra?: string[]) => void
type KeysFn = (obj: Record<string, unknown>, allowed: string[], where: string) => void

function posLit(v: unknown, err: IssueFn, label: string) {
  if (typeof v === 'number' && !(v > 0)) err(`${label} 应为正数`)
}

export function fringesIssues(
  props: Record<string, unknown>,
  declared: Set<string>,
  userNames: Set<string>,
  err: IssueFn,
  expr: ExprFn,
  keysOnly: KeysFn,
): void {
  const type = String(props.type ?? '')
  if (!(FRINGE_TYPES as readonly string[]).includes(type)) {
    err(`type 不合法：${type || '（空）'}（可用：${FRINGE_TYPES.join('、')}）`)
    return
  }
  for (const k of ['lambda', 'd', 'a', 'L', 'n', 'theta', 'h', 'length', 'R', 'U', 'k', 'span'] as const) {
    if (props[k] !== undefined) expr(props[k], k)
  }
  posLit(props.lambda, err, 'lambda（nm）')
  posLit(props.d, err, 'd（mm）')
  posLit(props.a, err, 'a（mm）')
  posLit(props.L, err, 'L（m）')
  posLit(props.R, err, 'R（m）')
  posLit(props.U, err, 'U（V）')
  posLit(props.h, err, 'h（mm）')
  posLit(props.length, err, 'length（mm）')
  posLit(props.span, err, 'span（mm）')
  posLit(props.k, err, 'k（mm/pm）')
  if (typeof props.n === 'number' && !(props.n > 0)) err('n 应为正数')
  if (typeof props.theta === 'number' && !(props.theta > 0)) err('theta 应为正的角度（度）')
  if (props.white === true && type !== 'double') err('white 只用于 type="double"')
  if (props.wire === true && type !== 'single') err('wire 只用于 type="single"（细丝与等宽单缝图样相同，只改说明）')
  if (props.transmitted === true && type !== 'wedge' && type !== 'newton') err('transmitted 只用于 wedge 或 newton')
  if (props.side === true && type !== 'wedge') err('side 只用于 wedge（侧视两块玻璃和垫片）')
  if (props.cursor !== undefined) {
    if (typeof props.cursor !== 'string' || !IDENT.test(props.cursor) || !declared.has(props.cursor)) {
      err(`cursor 应为已声明的参数名（屏上位置，mm）：${String(props.cursor)}`)
    }
  }
  if (props.marks !== undefined) {
    if (!Array.isArray(props.marks)) err('marks 应为数组')
    else {
      props.marks.forEach((raw, i) => {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return err(`marks[${i}] 应为 {k, label}`)
        const m = raw as Record<string, unknown>
        keysOnly(m, ['k', 'label', 'dark'], `marks[${i}]`)
        if (typeof m.k !== 'number' || !Number.isInteger(m.k)) err(`marks[${i}].k 应为整数（第几条，中央一侧为负）`)
        if (m.label !== undefined && typeof m.label !== 'string') err(`marks[${i}].label 应为字符串`)
      })
    }
  }
  if (type === 'double') {
    if (props.white !== true && props.lambda === undefined) err('double 需要 lambda（nm）；白光写 white')
    if (props.d === undefined) err('double 需要 d（双缝间距，mm）')
    if (props.L === undefined) err('double 需要 L（缝到屏，m）')
  } else if (type === 'single') {
    if (props.lambda === undefined) err('single 需要 lambda（nm）')
    if (props.a === undefined) err('single 需要 a（缝宽或丝径，mm）')
    if (props.L === undefined) err('single 需要 L（缝到屏，m）')
  } else if (type === 'wedge') {
    if (props.lambda === undefined) err('wedge 需要 lambda（nm）')
    const h = props.h !== undefined
    const len = props.length !== undefined
    const th = props.theta !== undefined
    if (!th && !(h && len)) err('wedge 要写 theta（度），或者 h 和 length（末端厚度和长度，mm）')
    if (h !== len && !th) err('h 和 length 要一起写（tanθ = h/length）')
    if ((h || len) && h !== len) err('h 和 length 要一起写')
  } else if (type === 'newton') {
    if (props.lambda === undefined) err('newton 需要 lambda（nm）')
    if (props.R === undefined) err('newton 需要 R（曲率半径，m）')
  } else if (props.U === undefined) err('electron 需要 U（加速电压，V）')

  if (props.read !== undefined) checkFringeRead(props, type, userNames, err)
}

function checkFringeRead(props: Record<string, unknown>, type: string, userNames: Set<string>, err: IssueFn) {
  const read = props.read
  if (!read || typeof read !== 'object' || Array.isArray(read)) {
    err('read 写成 { dx: "名字", width: "名字", lambda: "名字", r1: "名字" }')
    return
  }
  const seen = new Set<string>()
  for (const [key, name] of Object.entries(read)) {
    if (!READ_KEY.test(key)) err(`read 的键 ${key} 不可用（dx、width、lambda、theta、I、x、r1…r20）`)
    if (typeof name !== 'string' || !IDENT.test(name)) err(`read.${key} 的名字不合法`)
    else if (userNames.has(name)) err(`read.${key} 的名字 ${name} 与已声明的 Param/Define 重复`)
    else if (seen.has(name)) err(`read 的名字 ${name} 重复`)
    else seen.add(name)
  }
  if (('I' in read || 'x' in read) && props.cursor === undefined) err('read 的 I、x 需要 cursor（屏上的 x，mm）')
  if ('width' in read && type !== 'single' && !(type === 'double' && props.a !== undefined)) err('width 是中央亮纹宽度，只用于 single，或写了缝宽 a 的 double')
  if ('theta' in read && type !== 'wedge') err('theta 只由 wedge 算出')
  if ('dx' in read && type === 'newton') err('牛顿环不是等间距，不要读 dx；用 r1、r2… 读暗环半径（mm）')
}

export function measurementHeadIssues(
  props: Record<string, unknown>,
  _declared: Set<string>,
  userNames: Set<string>,
  err: IssueFn,
  expr: ExprFn,
  keysOnly: KeysFn,
): void {
  const fr = props.fringes
  if (fr !== undefined) {
    if (!fr || typeof fr !== 'object' || Array.isArray(fr)) err('fringes 应为 { lambda, d, L, offset }')
    else {
      const f = fr as Record<string, unknown>
      keysOnly(f, ['lambda', 'd', 'L', 'n', 'a', 'offset'], 'fringes')
      for (const k of ['lambda', 'd', 'L'] as const) {
        if (f[k] === undefined) err(`fringes 缺少 ${k}`)
        else expr(f[k], `fringes.${k}`)
      }
      for (const k of ['n', 'a', 'offset'] as const) if (f[k] !== undefined) expr(f[k], `fringes.${k}`)
      for (const k of ['lambda', 'd', 'L', 'a'] as const) posLit(f[k], err, `fringes.${k}`)
      if (typeof f.n === 'number' && !(f.n > 0)) err('fringes.n 应为正数')
    }
  }
  const pair = props.pair
  if (pair !== undefined) {
    if (!pair || typeof pair !== 'object' || Array.isArray(pair)) err('pair 应为 { x1, n, d, L }')
    else {
      const p = pair as Record<string, unknown>
      keysOnly(p, ['x1', 'n', 'd', 'L'], 'pair')
      if (p.x1 === undefined) err('pair.x1 缺少（第 1 条亮纹的手轮读数，mm）')
      else expr(p.x1, 'pair.x1')
      if (p.n === undefined) err('pair.n 缺少（这条是第 n 条亮纹，Δx = (x_n − x_1)/(n − 1)）')
      else {
        expr(p.n, 'pair.n')
        if (typeof p.n === 'number' && !(p.n > 1)) err('pair.n 应大于 1')
      }
      for (const k of ['d', 'L'] as const) {
        if (p[k] !== undefined) expr(p[k], `pair.${k}`)
        posLit(p[k], err, `pair.${k}`)
      }
    }
  }
  if (props.read === undefined) return
  const read = props.read
  if (!read || typeof read !== 'object' || Array.isArray(read)) {
    err('read 写成 { dx: "名字", lambda: "名字", x: "名字" }')
    return
  }
  const seen = new Set<string>()
  for (const [key, name] of Object.entries(read)) {
    if (!['dx', 'lambda', 'x'].includes(key)) err(`read 的键 ${key} 不可用（dx 条纹间距 mm、lambda 波长 nm、x 分划板的屏上坐标 mm）`)
    if (typeof name !== 'string' || !IDENT.test(name)) err(`read.${key} 的名字不合法`)
    else if (userNames.has(name)) err(`read.${key} 的名字 ${name} 与已声明的 Param/Define 重复`)
    else if (seen.has(name)) err(`read 的名字 ${name} 重复`)
    else seen.add(name)
  }
  if (('dx' in read || 'lambda' in read) && props.pair === undefined) err('read 的 dx、lambda 需要 pair（两条手轮读数才算得出）')
  if ('lambda' in read) {
    const p = (pair && typeof pair === 'object' && !Array.isArray(pair) ? pair : {}) as Record<string, unknown>
    const f = (fr && typeof fr === 'object' && !Array.isArray(fr) ? fr : {}) as Record<string, unknown>
    if (p.d === undefined && f.d === undefined) err('算波长需要 d：写在 pair.d 或 fringes.d（mm）')
    if (p.L === undefined && f.L === undefined) err('算波长需要 L：写在 pair.L 或 fringes.L（m）')
  }
}
