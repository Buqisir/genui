// Charged particle in electric and magnetic fields for <Motion> (free motion, or on a track).
// Uniform: F = q(E + v × B). y is up; E's angle is degrees CCW from +x, the same as forces.
// B is perpendicular to the page: dir "out" is +z (toward the reader), "in" is −z.
// v × B with Bz = ±B is (vy·Bz, −vx·Bz), so a positive charge moving +x in an
// outward field is pushed toward −y and turns clockwise.
//
// A point charge contributes k Q q / r² along the line from the charge to the particle
// (k defaults to 9e9; repulsive when Q·q > 0). A radial entry has E along the outward
// direction from (cx, cy); its E expression may use r, the distance from that centre.
// Both are recomputed at every RK4 stage. Uniform E/B still freeze when they don't
// depend on t or the state.
//
// Each region has a hidden 0/1 flag. The force reads only the flag, and only a
// boundary event changes it, so every RK4 stage of one step sees the same regions.
// The boundary function g (positive inside) is a derived name the event watches.
// A ring (inner radius) adds the constraint dist − inner. A point charge may also
// stop the run when the particle reaches `radius` (event `hit`).

import { evaluateIn, symbolsOf, type Scope } from './expr'
import type { MotionEvent, MotionRun } from './motion'

export interface FieldRegion {
  xmin?: number
  xmax?: number
  ymin?: number
  ymax?: number
  cx?: number
  cy?: number
  r?: number
  /** Inner radius of a ring or annular sector. Present only when greater than 0. */
  inner?: number
  /** Sector angles in degrees, CCW from +x. Present only for a sector or semicircle. */
  from?: number
  to?: number
  /** Polygon vertices, in order. Present only for a polygonal region. */
  points?: [number, number][]
}

export interface FieldView {
  label?: string
  /** Degrees CCW from +x, present when this region has an electric field. */
  angle?: number
  /** Present when this region has a magnetic field. */
  dir?: 'in' | 'out'
  region: FieldRegion
  /**
   * When E, angle or B change during the run: the drawn direction from each time t[k]
   * until the next one (null = the field is zero then). Overrides angle / dir.
   * `sign` is the radial-field sense (+1 outward, −1 inward) on the same instants.
   */
  timeline?: { t: number[]; angle?: (number | null)[]; dir?: ('in' | 'out' | null)[]; sign?: (number | null)[] }
  /** Point charge drawn at (x, y). `lines` asks v.regions to trace its field lines. */
  charge?: { x: number; y: number; Q: number; lines?: boolean }
  /** Radial electric field. sign +1 is outward, −1 inward, 0 draws no arrows. */
  radial?: { cx: number; cy: number; sign: number }
}

interface FieldSpec {
  label?: string
  E?: number | string
  angle?: number | string
  B?: number | string
  dir?: string
  region?: Record<string, unknown>
  enter?: string
  exit?: string
  Q?: number | string
  x?: number | string
  y?: number | string
  k?: number | string
  radius?: number | string
  hit?: string
  radial?: boolean
  cx?: number | string
  cy?: number | string
  lines?: boolean
}

interface Pt {
  x: number
  y: number
}

interface Geo {
  xmin: number
  xmax: number
  ymin: number
  ymax: number
  cx: number
  cy: number
  r: number
  /** Inner radius. 0 means a solid disk (no hole). */
  inner: number
  circle: boolean
  /** CCW sweep in (0, 360). 360 is a full disk; 0 is empty. */
  sweep: number
  from: number
  to: number
  points: Pt[]
}

/** null = re-evaluate every stage (depends on t or the state); a number is fixed for the run. */
interface Amp {
  E: number | null
  ang: number | null
  B: number | null
}

interface Frozen {
  geos: Geo[]
  amps: Amp[]
  /** Point-charge position or radial centre, frozen like region geometry. Unused for a uniform field. */
  anchor: { x: number; y: number }[]
  /** Length that 1e-6 is measured against, so a close approach stays finite. */
  scale: number
}

export interface FieldFlag {
  flag: string
  enter?: string
  index: number
}

export interface FieldsModel {
  state: Record<string, number | string>
  events: MotionEvent[]
  derive: (sc: Scope, warn: (m: string) => void) => void
  init: (sc: Scope, warn: (m: string) => void) => Record<string, number>
  /** For the published motion: which regions to draw, at the current parameters (and over the run when given). */
  draw: (scope: Scope, run?: MotionRun) => FieldView[]
  flags: FieldFlag[]
}

const rad = Math.PI / 180
/** |g| below this counts as on the boundary: the side is decided by the velocity. */
const EDGE = 1e-8
const PACK = '__fld'

const flagName = (k: number) => `__in${k}`
const gapName = (k: number) => `__g${k}`
const hitName = (k: number) => `__h${k}`
/** Default Coulomb constant, SI. Lessons in scaled units pass k explicitly (often 1). */
const COULOMB_K = 9e9
/** Closer than this fraction of the scene scale, the 1/r² (or 1/r) force is capped. */
const SOFT = 1e-6

function val(v: unknown, sc: Scope): number {
  if (typeof v === 'number') return v
  if (typeof v !== 'string') return NaN
  try {
    return evaluateIn(v, sc)
  } catch {
    return NaN
  }
}

const mentions = (v: unknown, names: Set<string>) => {
  if (typeof v !== 'string') return false
  try {
    return symbolsOf(v).some((s) => names.has(s))
  } catch {
    return false
  }
}

const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null)

function geoOf(region: Record<string, unknown> | undefined, sc: Scope): Geo {
  const n = (v: unknown, fallback: number) => (v === undefined ? fallback : val(v, sc))
  const r = region ?? {}
  const radius = n(r.r, 0)
  const from = n(r.from, 0)
  const to = n(r.to, 0)
  let sweep = 360
  if (r.from !== undefined || r.to !== undefined) {
    const raw = to - from
    if (Math.abs(raw) < 1e-12) sweep = 0
    else {
      sweep = ((raw % 360) + 360) % 360
      if (sweep < 1e-9) sweep = 360
    }
  }
  const points: Pt[] = []
  if (Array.isArray(r.points)) {
    for (const p of r.points) {
      if (!Array.isArray(p) || p.length < 2) continue
      const x = n(p[0], NaN)
      const y = n(p[1], NaN)
      if (Number.isFinite(x) && Number.isFinite(y)) points.push({ x, y })
    }
  }
  return {
    xmin: n(r.xmin, -Infinity),
    xmax: n(r.xmax, Infinity),
    ymin: n(r.ymin, -Infinity),
    ymax: n(r.ymax, Infinity),
    cx: n(r.cx, 0),
    cy: n(r.cy, 0),
    r: radius,
    inner: n(r.inner, 0),
    circle: r.cx !== undefined && r.cy !== undefined && r.r !== undefined && radius > 0,
    sweep,
    from,
    to,
    points,
  }
}

/** Even-odd test. On an edge the result is unused: the gap is ~0 and the velocity decides. */
function insidePoly(pts: Pt[], x: number, y: number): boolean {
  let c = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].x
    const yi = pts[i].y
    const xj = pts[j].x
    const yj = pts[j].y
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}

/** Signed distance to a polygon (positive inside) and how fast it grows. */
function polyGap(pts: Pt[], x: number, y: number, vx: number, vy: number): { g: number; dg: number } {
  let best = Infinity
  const near: { dist: number; dg: number }[] = []
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const L2 = dx * dx + dy * dy
    let t = L2 > 0 ? ((x - a.x) * dx + (y - a.y) * dy) / L2 : 0
    t = Math.max(0, Math.min(1, t))
    const px = a.x + t * dx
    const py = a.y + t * dy
    const dist = Math.hypot(x - px, y - py)
    const len = Math.hypot(dx, dy) || 1
    let nx = -dy / len
    let ny = dx / len
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    const eps = 1e-4 * Math.max(1, len)
    if (!insidePoly(pts, mx + nx * eps, my + ny * eps)) ((nx = -nx), (ny = -ny))
    near.push({ dist, dg: vx * nx + vy * ny })
    if (dist < best) best = dist
  }
  const tol = 1e-9 * Math.max(1, best)
  let dg = Infinity
  for (const c of near) if (c.dist <= best + tol && c.dg < dg) dg = c.dg
  const g = best <= EDGE ? 0 : (insidePoly(pts, x, y) ? best : -best)
  return { g, dg: Number.isFinite(dg) ? dg : 0 }
}

/** Signed distance to one radial edge. `ccw` is the left side of the outward ray. */
function rayGap(deg: number, dx: number, dy: number, vx: number, vy: number, ccw: boolean): { g: number; dg: number } {
  const s = Math.sin(deg * rad)
  const c = Math.cos(deg * rad)
  if (ccw) return { g: -dx * s + dy * c, dg: -vx * s + vy * c }
  return { g: dx * s - dy * c, dg: vx * s - vy * c }
}

/**
 * Angular part of a sector, positive inside the CCW sweep from `from` to `to`.
 * A sweep of at most 180° is the intersection of the two half-planes; a wider
 * sweep is their union, so the gap is the max instead of the min.
 */
function wedgeGap(g: Geo, dx: number, dy: number, vx: number, vy: number): { g: number; dg: number } {
  if (g.sweep <= 1e-12) return { g: -1, dg: 0 }
  const a = rayGap(g.from, dx, dy, vx, vy, true)
  const b = rayGap(g.to, dx, dy, vx, vy, false)
  const wider = g.sweep > 180
  const tol = 1e-9 * Math.max(1, Math.abs(a.g), Math.abs(b.g))
  const aWins = wider ? a.g > b.g + tol : a.g < b.g - tol
  const bWins = wider ? b.g > a.g + tol : b.g < a.g - tol
  if (aWins) return a
  if (bWins) return b
  // On a corner, the tighter side decides for an intersection; either inward side does for a union.
  return (wider ? a.dg >= b.dg : a.dg <= b.dg) ? a : b
}

/** Signed gap, positive inside. A rectangle is the min of its edge distances; a circle is r − distance; both together is the intersection. */
function gapOf(g: Geo, x: number, y: number, vx: number, vy: number): { g: number; dg: number } {
  const parts: { g: number; dg: number }[] = []
  if (Number.isFinite(g.xmin)) parts.push({ g: x - g.xmin, dg: vx })
  if (Number.isFinite(g.xmax)) parts.push({ g: g.xmax - x, dg: -vx })
  if (Number.isFinite(g.ymin)) parts.push({ g: y - g.ymin, dg: vy })
  if (Number.isFinite(g.ymax)) parts.push({ g: g.ymax - y, dg: -vy })
  if (g.circle) {
    const dx = x - g.cx
    const dy = y - g.cy
    const dist = Math.hypot(dx, dy)
    parts.push({ g: g.r - dist, dg: dist > 1e-15 ? -(dx * vx + dy * vy) / dist : 0 })
    // A ring or annular sector: outside the hole, so dist − inner is positive in the material.
    if (g.inner > 0) parts.push({ g: dist - g.inner, dg: dist > 1e-15 ? (dx * vx + dy * vy) / dist : 0 })
    if (g.sweep < 360 - 1e-9) parts.push(wedgeGap(g, dx, dy, vx, vy))
  }
  if (g.points.length >= 3) parts.push(polyGap(g.points, x, y, vx, vy))
  if (!parts.length) return { g: 1, dg: 0 }
  let gg = Infinity
  for (const p of parts) if (p.g < gg) gg = p.g
  // The derivative of a min is the most restrictive active constraint.
  const tol = 1e-9 * Math.max(1, Math.abs(gg))
  let dg = Infinity
  for (const p of parts) if (p.g <= gg + tol && p.dg < dg) dg = p.dg
  return { g: gg, dg }
}

/** Inside when g > 0. Exactly on the boundary, inside only if the velocity points inward. */
function inside(s: { g: number; dg: number }): boolean {
  if (s.g > EDGE) return true
  if (s.g < -EDGE) return false
  if (s.dg > 0) return true
  if (s.dg < 0) return false
  return s.g >= 0
}

function regionView(g: Geo): FieldRegion {
  const region: FieldRegion = {}
  if (Number.isFinite(g.xmin)) region.xmin = g.xmin
  if (Number.isFinite(g.xmax)) region.xmax = g.xmax
  if (Number.isFinite(g.ymin)) region.ymin = g.ymin
  if (Number.isFinite(g.ymax)) region.ymax = g.ymax
  if (g.circle) {
    region.cx = g.cx
    region.cy = g.cy
    region.r = g.r
    if (g.inner > 0) region.inner = g.inner
    if (g.sweep > 1e-9 && g.sweep < 360 - 1e-9) ((region.from = g.from), (region.to = g.from + g.sweep))
  }
  if (g.points.length >= 3) region.points = g.points.map((p) => [p.x, p.y])
  return region
}

/** Evaluate `fn` with `r` bound, then put the caller's `r` back. `r` is reserved only inside that expression. */
function withRadius<T>(scope: Scope, radius: number, fn: () => T): T {
  const had = Object.prototype.hasOwnProperty.call(scope, 'r')
  const prev = scope.r
  scope.r = radius
  try {
    return fn()
  } finally {
    if (had) scope.r = prev
    else delete scope.r
  }
}

/** Radius at which a radial E is sampled for the arrow direction (sign only; the force uses the real r). */
function sampleRadius(f: FieldSpec, scope: Scope): number {
  const region = f.region
  if (region) {
    const outer = val(region.r, scope)
    const inner = region.inner === undefined ? 0 : val(region.inner, scope)
    if (Number.isFinite(outer) && outer > 0) {
      const inn = Number.isFinite(inner) && inner > 0 && inner < outer ? inner : 0
      const mid = inn > 0 ? (outer + inn) / 2 : outer
      if (mid > 0) return mid
    }
  }
  return 1
}

function sceneScale(geos: Geo[], anchor: { x: number; y: number }[], sc: Scope): number {
  let s = 0
  const bump = (v: number) => {
    if (Number.isFinite(v)) s = Math.max(s, Math.abs(v))
  }
  bump(sc.x)
  bump(sc.y)
  for (const a of anchor) {
    bump(a.x)
    bump(a.y)
    if (Number.isFinite(sc.x) && Number.isFinite(sc.y) && Number.isFinite(a.x) && Number.isFinite(a.y)) bump(Math.hypot(sc.x - a.x, sc.y - a.y))
  }
  for (const g of geos) {
    bump(g.r)
    bump(g.inner)
  }
  return s > 0 ? s : 1
}

/**
 * `local` is every name that changes during the run (`t` and the state). Region
 * geometry never depends on those and is evaluated once in init. Uniform E, B and
 * angle are too, unless the expression actually uses a run-local name (an alternating
 * voltage). Point-charge and radial fields are recomputed at every stage.
 */
export function fieldsModel(props: Record<string, unknown>, local: Set<string>): FieldsModel | null {
  if (!Array.isArray(props.fields)) return null
  const specs = props.fields.map(obj).filter((f): f is Record<string, unknown> => !!f) as unknown as FieldSpec[]
  const charge = props.charge as number | string
  const state: Record<string, number> = {}
  const events: MotionEvent[] = []
  const flags: FieldFlag[] = []

  specs.forEach((f, k) => {
    const flag = flagName(k)
    const gap = gapName(k)
    state[flag] = 0
    // Up sets the flag to 1 and down clears it. A toggle would flip the wrong way
    // when a step starts already inside and g is only a rounding-error negative.
    const enter = typeof f.enter === 'string' ? f.enter : undefined
    const exit = typeof f.exit === 'string' ? f.exit : undefined
    events.push({ name: enter, when: gap, dir: 'up', set: { [flag]: 1 } })
    events.push({ name: exit, when: gap, dir: 'down', set: { [flag]: 0 } })
    // Absorption / collision: stop when the distance to the point charge falls to `radius`.
    if (f.Q !== undefined && f.radius !== undefined && typeof f.hit === 'string') {
      events.push({ name: f.hit, when: hitName(k), dir: 'down', stop: true })
    }
    flags.push({ flag, enter, index: k + 1 })
  })

  const vary = (v: unknown) => mentions(v, local)
  const ampOf = (f: FieldSpec, sc: Scope): Amp => ({
    // A radial E depends on position (and on r) even when it names no run-local variable.
    E: f.radial === true || f.Q !== undefined ? null : f.E === undefined ? 0 : vary(f.E) ? null : val(f.E, sc),
    ang: f.angle === undefined ? 0 : vary(f.angle) ? null : val(f.angle, sc),
    B: f.B === undefined ? 0 : vary(f.B) ? null : val(f.B, sc),
  })

  const derive = (sc: Scope, warn?: (m: string) => void) => {
    const pack = (sc as unknown as Record<string, Frozen>)[PACK]
    let Fx = 0
    let Fy = 0
    const q = val(charge, sc)
    const x = sc.x
    const y = sc.y
    const vx = sc.vx
    const vy = sc.vy
    const eps = SOFT * (pack?.scale || 1)
    specs.forEach((f, k) => {
      const geo = pack?.geos[k]
      const s = geo ? gapOf(geo, x, y, vx, vy) : { g: 1, dg: 0 }
      sc[gapName(k)] = s.g
      const anc = pack?.anchor[k]
      if (f.Q !== undefined && anc && f.radius !== undefined) {
        sc[hitName(k)] = Math.hypot(x - anc.x, y - anc.y) - val(f.radius, sc)
      }
      if (!(sc[flagName(k)] > 0.5)) return
      if (f.Q !== undefined && anc) {
        const dx = x - anc.x
        const dy = y - anc.y
        const dist = Math.hypot(dx, dy)
        if (dist < eps && f.radius === undefined) warn?.(`粒子离第 ${k + 1} 个点电荷太近（小于场景尺度的百万分之一），库仑力按这个最小距离计算，避免发散`)
        const rUse = Math.max(dist, eps)
        if (dist > 0 && rUse > 0) {
          const kC = f.k === undefined ? COULOMB_K : val(f.k, sc)
          const Q = val(f.Q, sc)
          const scaleF = (kC * Q) / (rUse * rUse)
          Fx += q * scaleF * (dx / dist)
          Fy += q * scaleF * (dy / dist)
        }
        return
      }
      if (f.radial === true && anc) {
        const dx = x - anc.x
        const dy = y - anc.y
        const dist = Math.hypot(dx, dy)
        if (dist < eps) warn?.(`粒子离第 ${k + 1} 个径向场的中心太近（小于场景尺度的百万分之一），场强按这个最小距离计算，避免发散`)
        const rUse = Math.max(dist, eps)
        const Em = withRadius(sc, rUse, () => val(f.E, sc))
        if (dist > 0 && Number.isFinite(Em)) {
          Fx += q * Em * (dx / dist)
          Fy += q * Em * (dy / dist)
        }
        const amp = pack?.amps[k]
        const B = amp?.B === null || amp === undefined ? val(f.B, sc) : amp.B
        if (f.dir === 'in' || f.dir === 'out') {
          const Bz = f.dir === 'in' ? -B : B
          Fx += q * vy * Bz
          Fy += q * -vx * Bz
        }
        return
      }
      const amp = pack?.amps[k]
      const E = amp?.E === null || amp === undefined ? val(f.E, sc) : amp.E
      const ang = (amp?.ang === null || amp === undefined ? val(f.angle, sc) : amp.ang) * rad
      const B = amp?.B === null || amp === undefined ? val(f.B, sc) : amp.B
      if (!(f.dir === 'in' || f.dir === 'out') && !E) return
      const Bz = f.dir === 'in' ? -B : f.dir === 'out' ? B : 0
      Fx += q * (E * Math.cos(ang) + vy * Bz)
      Fy += q * (E * Math.sin(ang) - vx * Bz)
    })
    sc.__Fx = Fx
    sc.__Fy = Fy
  }

  const init = (sc: Scope) => {
    const geos = specs.map((f) => geoOf(f.region, sc))
    const amps = specs.map((f) => ampOf(f, sc))
    const anchor = specs.map((f) =>
      f.Q !== undefined ? { x: val(f.x, sc), y: val(f.y, sc) } : f.radial === true ? { x: val(f.cx, sc), y: val(f.cy, sc) } : { x: 0, y: 0 },
    )
    ;(sc as unknown as Record<string, Frozen>)[PACK] = { geos, amps, anchor, scale: sceneScale(geos, anchor, sc) }
    const out: Record<string, number> = {}
    specs.forEach((_, k) => {
      out[flagName(k)] = inside(gapOf(geos[k], sc.x, sc.y, sc.vx, sc.vy)) ? 1 : 0
    })
    return out
  }

  const look = (f: FieldSpec, scope: Scope): { angle?: number; dir?: 'in' | 'out'; sign?: number } => {
    const out: { angle?: number; dir?: 'in' | 'out'; sign?: number } = {}
    if (f.E !== undefined && f.angle !== undefined) {
      const Em = val(f.E, scope)
      let ang = val(f.angle, scope)
      if (Number.isFinite(Em) && Em < 0) ang += 180
      // A zero field draws no arrows; an expression of t that can't be sampled still shows the direction.
      if (Number.isFinite(ang) && !(Number.isFinite(Em) && Math.abs(Em) <= 1e-12)) out.angle = ang
    }
    if (f.radial === true && f.E !== undefined) {
      const Em = withRadius(scope, sampleRadius(f, scope), () => val(f.E, scope))
      if (Number.isFinite(Em) && Math.abs(Em) > 1e-12) out.sign = Em < 0 ? -1 : 1
    }
    if (f.B !== undefined && (f.dir === 'in' || f.dir === 'out')) {
      const Bm = val(f.B, scope)
      if (!(Number.isFinite(Bm) && Math.abs(Bm) <= 1e-12)) {
        const flip = Number.isFinite(Bm) && Bm < 0
        out.dir = (f.dir === 'in') !== flip ? 'in' : 'out'
      }
    }
    return out
  }
  const sameAngle = (a: number | null, b: number | null) =>
    a === null || b === null ? a === b : Math.abs((((a - b) % 360) + 540) % 360 - 180) < 1e-6
  // A switched or alternating field: sample the drawn direction at every step of the run, keep the changes.
  const timeline = (f: FieldSpec, scope: Scope, run: MotionRun): NonNullable<FieldView['timeline']> => {
    const hasE = f.E !== undefined && f.angle !== undefined
    const hasB = f.B !== undefined && (f.dir === 'in' || f.dir === 'out')
    const hasSign = f.radial === true
    const ts: number[] = []
    const as: (number | null)[] = []
    const ds: ('in' | 'out' | null)[] = []
    const zs: (number | null)[] = []
    const sc: Scope = { ...scope }
    const sample = (time: number, state: Record<string, number>) => {
      Object.assign(sc, state)
      sc.t = time
      const cur = look(f, sc)
      return { a: cur.angle === undefined ? null : +cur.angle.toPrecision(7), d: cur.dir ?? null, z: cur.sign ?? null }
    }
    const row = (k: number) => Object.fromEntries(run.vars.map((v, i) => [v, run.s[k][i]]))
    run.t.forEach((time, k) => {
      const { a, d, z } = sample(time, row(k))
      const n = ts.length
      if (n && sameAngle(as[n - 1], a) && ds[n - 1] === d && zs[n - 1] === z) return
      let at = time
      // A switch (reversal, on/off) lands between two samples; find the instant, so the frame at
      // exactly t = t₀ (a timeline mark) shows the same side as a reading evaluated there.
      const prev = as[n - 1]
      const jump = d !== ds[n - 1] || z !== zs[n - 1] || a === null || prev === null || prev === undefined || Math.abs((((a - prev) % 360) + 540) % 360 - 180) > 90
      if (n && k > 0 && jump) {
        let lo = run.t[k - 1]
        let hi = time
        for (let it = 0; it < 60 && hi - lo > 1e-12 * Math.max(1, Math.abs(hi)); it++) {
          const mid = (lo + hi) / 2
          const s = sample(mid, run.at(mid))
          if (sameAngle(s.a, as[n - 1]) && s.d === ds[n - 1] && s.z === zs[n - 1]) lo = mid
          else hi = mid
        }
        at = hi
      }
      ts.push(at)
      as.push(a)
      ds.push(d)
      zs.push(z)
    })
    return { t: ts, ...(hasE ? { angle: as } : {}), ...(hasB ? { dir: ds } : {}), ...(hasSign ? { sign: zs } : {}) }
  }

  const draw = (scope: Scope, run?: MotionRun): FieldView[] =>
    specs.map((f) => {
      const seen = look(f, scope)
      const { sign, ...rest } = seen
      const view: FieldView = { region: regionView(geoOf(f.region, scope)), ...rest }
      if (typeof f.label === 'string' && f.label) view.label = f.label
      if (f.Q !== undefined) {
        const dot: NonNullable<FieldView['charge']> = { x: val(f.x, scope), y: val(f.y, scope), Q: val(f.Q, scope) }
        if (f.lines === true) dot.lines = true
        view.charge = dot
      }
      if (f.radial === true) view.radial = { cx: val(f.cx, scope), cy: val(f.cy, scope), sign: sign ?? 0 }
      if (run && run.t.length && (vary(f.E) || vary(f.angle) || vary(f.B))) {
        const tl = timeline(f, scope, run)
        if (tl.t.length > 1) view.timeline = tl
        else {
          // Constant over the run after all: a plain direction is enough.
          delete view.angle
          delete view.dir
          if (tl.angle?.[0] != null) view.angle = tl.angle[0]
          if (tl.dir?.[0] != null) view.dir = tl.dir[0]
          if (tl.sign && view.radial && tl.sign[0] != null) view.radial = { ...view.radial, sign: tl.sign[0] }
        }
      }
      return view
    })

  return { state, events, derive, init, draw, flags }
}

/**
 * A particle that starts inside a region never crosses into it, so the enter
 * event would stay empty. Publish 0 for that case. Also warn when a region is
 * never visited at all (the flag stays 0 for the whole run).
 */
export function finishFields(flags: FieldFlag[] | undefined, run: MotionRun) {
  if (!flags?.length) return
  for (const f of flags) {
    const i = run.vars.indexOf(f.flag)
    if (i < 0) continue
    const on = (row: number[]) => row[i] > 0.5
    if (f.enter && run.s[0] && on(run.s[0])) {
      const ts = (run.events[f.enter] ??= [])
      if (!ts.length || ts[0] > 1e-12) ts.unshift(0)
    }
    if (!run.s.some(on)) run.warnings.push(`粒子在 until 内没有进入第 ${f.index} 个场区（检查区域位置或速度方向）`)
  }
}

/** Expressions a <Motion fields> reads, for the solver input set. */
export function fieldsExprs(props: Record<string, unknown>): unknown[] {
  const out: unknown[] = [props.charge]
  if (!Array.isArray(props.fields)) return out
  for (const f0 of props.fields) {
    const f = obj(f0)
    if (!f) continue
    out.push(f.E, f.angle, f.B, f.Q, f.x, f.y, f.k, f.radius, f.cx, f.cy)
    const region = obj(f.region)
    if (region) {
      for (const k of ['xmin', 'xmax', 'ymin', 'ymax', 'cx', 'cy', 'r', 'inner', 'from', 'to']) out.push(region[k])
      if (Array.isArray(region.points)) for (const p of region.points) if (Array.isArray(p)) out.push(p[0], p[1])
    }
  }
  return out
}
