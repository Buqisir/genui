// One body constrained to a track of line and arc pieces for <Motion track>.
//
// s is arc length from the start of the first piece; v is the signed speed along +s.
// The normal force is the centripetal balance (not a user `solve`), friction is
// per piece, and a one-sided piece lets go when N falls through zero. After that
// the body is a free projectile: it does not land on the track again.
//
// Geometry matches v.track. Hatches sit on the right of travel; the body is on the
// left. n̂ is T̂ rotated +90° CCW, times −1 when the piece is flipped
// (piece.flip XOR track.flip). A left-to-right line therefore has the body above,
// a CCW arc has it inside, and a CW arc has it outside.
//
// Piece index, on-track flag, flight state and the friction stick flag are hidden
// state. Junctions, detach, ends and stick/slip are events, so each RK4 step sees
// one piece's smooth extension (a line continued, an arc continued on its circle).

import { evaluateIn, type Scope } from './expr'
import type { Dynamics } from './dynamics'
import type { MotionEvent, MotionRun } from './motion'

interface Force {
  angle?: number | string
  magnitude?: number | string
}

interface LinePiece {
  kind: 'line'
  x1: number
  y1: number
  x2: number
  y2: number
  len: number
  ux: number
  uy: number
  ang: number
  mu: number
  muS: number
  pipe: boolean
  flip: boolean
}

interface ArcPiece {
  kind: 'arc'
  cx: number
  cy: number
  r: number
  a1: number
  a2: number
  len: number
  dirn: number
  mu: number
  muS: number
  pipe: boolean
  flip: boolean
}

type Piece = LinePiece | ArcPiece

interface Pack {
  pieces: Piece[]
  /** starts[k] is the arc length at the start of piece k; starts[n] = L. */
  starts: number[]
  L: number
  scale: number
  draw: Record<string, unknown>[]
  warnings: string[]
}

type EndKind = { kind: 'fly' } | { kind: 'stop' } | { kind: 'bounce'; e: number | string }

const rad = Math.PI / 180
const EPS_V = 1e-9
const PACK = '__trk'

function val(v: unknown, sc: Scope): number {
  if (typeof v === 'number') return v
  if (typeof v !== 'string') return NaN
  try {
    return evaluateIn(v, sc)
  } catch {
    return NaN
  }
}

const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null)

const bagOf = (sc: Scope) => sc as unknown as Record<string, Pack>

function endBehavior(v: unknown): EndKind {
  if (v === 'stop') return { kind: 'stop' }
  const o = obj(v)
  if (o && 'bounce' in o) return { kind: 'bounce', e: o.bounce as number | string }
  return { kind: 'fly' }
}

function frame(p: Piece, sLocal: number) {
  const flipSign = p.flip ? -1 : 1
  let x: number
  let y: number
  let tx: number
  let ty: number
  let ang: number
  let kappa = 0
  if (p.kind === 'line') {
    x = p.x1 + p.ux * sLocal
    y = p.y1 + p.uy * sLocal
    tx = p.ux
    ty = p.uy
    ang = p.ang
  } else {
    const a = p.a1 + (p.dirn * sLocal) / (p.r || 1)
    x = p.cx + p.r * Math.cos(a)
    y = p.cy + p.r * Math.sin(a)
    ang = a + (p.dirn * Math.PI) / 2
    tx = Math.cos(ang)
    ty = Math.sin(ang)
    if (p.r > 0) kappa = (p.dirn * flipSign) / p.r
  }
  // n̂ = T̂ rotated +90° CCW, then flipped. Positive N pushes the body that way.
  const nx = -ty * flipSign
  const ny = tx * flipSign
  return {
    x,
    y,
    tx,
    ty,
    nx,
    ny,
    kappa,
    tangentDeg: (ang * 180) / Math.PI,
    normalDeg: (Math.atan2(ny, nx) * 180) / Math.PI,
  }
}

function sumForces(forces: Force[], sc: Scope) {
  let fx = 0
  let fy = 0
  for (const f of forces) {
    if (!f) continue
    const a = val(f.angle, sc) * rad
    const mag = val(f.magnitude, sc)
    fx += mag * Math.cos(a)
    fy += mag * Math.sin(a)
  }
  if (typeof sc.__Fx === 'number') fx += sc.__Fx
  if (typeof sc.__Fy === 'number') fy += sc.__Fy
  return { fx, fy }
}

/** Frozen pieces for one run. Coordinates and μ are parameter-only, so they are evaluated once. */
export function buildTrack(props: Record<string, unknown>, sc: Scope): Pack {
  const track = obj(props.track) ?? {}
  const trackFlip = track.flip === true
  const trackPipe = track.pipe === true
  const warnings: string[] = []
  const pieces: Piece[] = []
  const draw: Record<string, unknown>[] = []
  let scale = 1
  const raw = Array.isArray(track.pieces) ? track.pieces : []
  if (!raw.length) warnings.push('track.pieces 是空的')
  raw.forEach((item, i) => {
    const p = obj(item)
    const where = `轨道第 ${i + 1} 段`
    if (!p || (p.line === undefined && p.arc === undefined)) {
      warnings.push(`${where}没有 line 或 arc`)
      return
    }
    const mu = p.mu === undefined ? 0 : val(p.mu, sc)
    const muS = p.static === undefined ? mu : val(p.static, sc)
    const pipe = p.pipe === true || trackPipe
    const flip = (p.flip === true) !== trackFlip
    const extra: Record<string, unknown> = {}
    if (p.hatch === false) extra.hatch = false
    if (p.dash !== undefined) extra.dash = p.dash
    const note = (x: number) => {
      if (Number.isFinite(x)) scale = Math.max(scale, Math.abs(x))
    }
    if (p.line !== undefined) {
      if (!Array.isArray(p.line) || p.line.length !== 4) {
        warnings.push(`${where}的 line 要有 4 个坐标`)
        return
      }
      const [x1, y1, x2, y2] = p.line.map((c) => val(c, sc))
      for (const c of [x1, y1, x2, y2]) note(c)
      if (![x1, y1, x2, y2].every(Number.isFinite)) {
        warnings.push(`${where}的坐标算不出来`)
        return
      }
      const len = Math.hypot(x2 - x1, y2 - y1)
      note(len)
      if (!(len > 1e-15)) warnings.push(`${where}长度为零`)
      const ux = len > 1e-15 ? (x2 - x1) / len : 1
      const uy = len > 1e-15 ? (y2 - y1) / len : 0
      pieces.push({ kind: 'line', x1, y1, x2, y2, len, ux, uy, ang: Math.atan2(uy, ux), mu, muS, pipe, flip })
      draw.push({ line: [x1, y1, x2, y2], pipe, flip, ...extra })
      return
    }
    if (!Array.isArray(p.arc) || p.arc.length !== 5) {
      warnings.push(`${where}的 arc 要有圆心、半径和起止角`)
      return
    }
    const [cx, cy, r, d1, d2] = p.arc.map((c) => val(c, sc))
    for (const c of [cx, cy, r]) note(c)
    if (![cx, cy, r, d1, d2].every(Number.isFinite)) {
      warnings.push(`${where}的坐标算不出来`)
      return
    }
    if (!(r > 0)) {
      warnings.push(`${where}的半径应为正数`)
      return
    }
    const a1 = d1 * rad
    const a2 = d2 * rad
    const len = Math.abs(a2 - a1) * r
    note(len)
    if (!(len > 1e-15)) warnings.push(`${where}长度为零`)
    const dirn = Math.sign(a2 - a1) || 1
    pieces.push({ kind: 'arc', cx, cy, r, a1, a2, len, dirn, mu, muS, pipe, flip })
    draw.push({ arc: [cx, cy, r, d1, d2], pipe, flip, ...extra })
  })
  const starts = [0]
  for (const p of pieces) starts.push(starts[starts.length - 1] + p.len)
  for (let k = 0; k < pieces.length - 1; k++) {
    const a = endpoint(pieces[k], true)
    const b = endpoint(pieces[k + 1], false)
    const dist = Math.hypot(a[0] - b[0], a[1] - b[1])
    if (dist > 1e-6 * scale) warnings.push(`轨道第 ${k + 1} 段的终点和第 ${k + 2} 段的起点没有接上（相距 ${+dist.toPrecision(3)}）`)
  }
  return { pieces, starts, L: starts[starts.length - 1] ?? 0, scale, draw, warnings }
}

function endpoint(p: Piece, end: boolean): [number, number] {
  if (p.kind === 'line') return end ? [p.x2, p.y2] : [p.x1, p.y1]
  const a = end ? p.a2 : p.a1
  return [p.cx + p.r * Math.cos(a), p.cy + p.r * Math.sin(a)]
}

/** At an exact junction, v ≥ 0 takes the later piece (the one about to be entered). */
function indexAt(pack: Pack, s0: number, v0: number): number {
  const n = pack.pieces.length
  if (!n) return 0
  const tol = 1e-9 * Math.max(1, pack.L)
  for (let k = 0; k < n - 1; k++) {
    if (Math.abs(s0 - pack.starts[k + 1]) <= tol) return v0 < 0 ? k : k + 1
  }
  for (let k = 0; k < n; k++) if (s0 < pack.starts[k + 1] - tol) return k
  return n - 1
}

function clampIndex(pack: Pack, k: number): number {
  if (!pack.pieces.length) return 0
  const raw = Math.round(k)
  return Math.max(0, Math.min(pack.pieces.length - 1, Number.isFinite(raw) ? raw : 0))
}

function writeGeom(sc: Scope, pack: Pack) {
  const on = sc.__on > 0.5
  if (!pack.pieces.length) {
    if (!on) {
      sc.x = sc.__x
      sc.y = sc.__y
      sc.vx = sc.__vx
      sc.vy = sc.__vy
    }
    sc.tangent = 0
    sc.normalDir = 90
    sc.speed = Math.hypot(sc.vx || 0, sc.vy || 0)
    return
  }
  const k = clampIndex(pack, sc.__k)
  const g = frame(pack.pieces[k], sc.s - pack.starts[k])
  if (on) {
    sc.x = g.x
    sc.y = g.y
    sc.vx = sc.v * g.tx
    sc.vy = sc.v * g.ty
  } else {
    sc.x = sc.__x
    sc.y = sc.__y
    sc.vx = sc.__vx
    sc.vy = sc.__vy
  }
  // +s direction at this track point. In flight s is frozen, so this stays the departure tangent.
  sc.tangent = g.tangentDeg
  sc.normalDir = g.normalDeg
  sc.speed = Math.hypot(sc.vx, sc.vy)
}

function ensure(props: Record<string, unknown>, sc: Scope): Pack {
  const bag = bagOf(sc)
  if (bag[PACK]) return bag[PACK]
  const pack = buildTrack(props, sc)
  bag[PACK] = pack
  // First touch of this run is t = 0: pick the piece before fields read x, y.
  sc.__k = indexAt(pack, sc.s, sc.v)
  return pack
}

const holds = (Ft: number, limit: number) => Math.abs(Ft) <= limit + 1e-9 * (Math.abs(Ft) + Math.abs(limit) + 1)

/** Expressions the solver must treat as inputs: piece geometry, μ, and a bounce coefficient. */
export function trackExprs(props: Record<string, unknown>): unknown[] {
  const track = obj(props.track)
  if (!track) return []
  const out: unknown[] = [props.mass]
  if (Array.isArray(track.pieces)) {
    for (const item of track.pieces) {
      const p = obj(item)
      if (!p) continue
      if (Array.isArray(p.line)) out.push(...p.line)
      if (Array.isArray(p.arc)) out.push(...p.arc)
      out.push(p.mu, p.static)
    }
  }
  for (const end of [track.start, track.end]) {
    const o = obj(end)
    if (o) out.push(o.bounce)
  }
  return out
}

/** Numeric pieces for v.track, with track-level pipe / flip already resolved. */
export function trackDraw(props: Record<string, unknown>, scope: Scope): Record<string, unknown>[] {
  return buildTrack(props, scope).draw
}

function leaveEvent(when: string, dir: 'up' | 'down', leave?: string): MotionEvent {
  const ev: MotionEvent = { when, dir, set: { __on: 0, __x: 'x', __y: 'y', __vx: 'vx', __vy: 'vy' } }
  if (leave) ev.name = leave
  return ev
}

function endEvent(when: string, dir: 'up' | 'down', behavior: EndKind, leave?: string): MotionEvent {
  if (behavior.kind === 'stop') return { when, dir, stop: true }
  if (behavior.kind === 'bounce') {
    const e = typeof behavior.e === 'number' ? String(behavior.e) : `(${behavior.e})`
    // Sliding friction keeps the sign of __d; reversing v reverses that sign too.
    return { when, dir, set: { v: `-(${e})*v`, __d: '-__d' } }
  }
  return leaveEvent(when, dir, leave)
}

/**
 * A particle that starts already off the track (N < 0 at t = 0) never crosses
 * N = 0, so the leave event would stay empty. Publish 0 for that case.
 */
export function finishTrack(leave: string | undefined, run: MotionRun) {
  if (!leave) return
  const i = run.vars.indexOf('__on')
  if (i < 0 || !run.s[0]) return
  const ts = (run.events[leave] ??= [])
  if (run.s[0][i] < 0.5) {
    if (!ts.length || ts[0] > 1e-12) ts.unshift(0)
    return
  }
  // Letting go at a junction happens inside the junction event, not the N = 0 event.
  if (ts.length) return
  for (let k = 1; k < run.s.length; k++) {
    if (run.s[k - 1][i] > 0.5 && run.s[k][i] < 0.5) {
      ts.push(run.t[k])
      return
    }
  }
}

export function trackDynamics(props: Record<string, unknown>): Dynamics | null {
  const track = obj(props.track)
  if (!track) return null
  const mass = props.mass as number | string
  const forces = (Array.isArray(props.forces) ? props.forces.filter((f) => obj(f)) : []) as Force[]
  const normalName = typeof track.normal === 'string' && track.normal ? track.normal : 'N'
  const frictionName = typeof track.friction === 'string' && track.friction ? track.friction : undefined
  const leave = typeof track.leave === 'string' ? track.leave : undefined
  const together = typeof track.together === 'string' ? track.together : undefined
  const slip = typeof track.slip === 'string' ? track.slip : undefined
  const start = endBehavior(track.start)
  const end = endBehavior(track.end)

  const state: Record<string, number> = { __k: 0, __on: 1, __x: 0, __y: 0, __vx: 0, __vy: 0, __s: 0, __d: 0 }
  const rates: Record<string, string> = {
    s: '__on > 0.5 ? v : 0',
    v: '__on > 0.5 ? acc : 0',
    __x: '__on > 0.5 ? 0 : __vx',
    __y: '__on > 0.5 ? 0 : __vy',
    __vx: '__on > 0.5 ? 0 : accx',
    __vy: '__on > 0.5 ? 0 : accy',
  }
  const events: MotionEvent[] = [
    { when: '__hi', dir: 'up', set: { __k: '__k + 1', __on: '__offHi > 0.5 ? 0 : __on', __x: 'x', __y: 'y', __vx: 'vx', __vy: 'vy' } },
    { when: '__lo', dir: 'down', set: { __k: '__k - 1', __on: '__offLo > 0.5 ? 0 : __on', __x: 'x', __y: 'y', __vx: 'vx', __vy: 'vy' } },
    leaveEvent('__Nd', 'down', leave),
    {
      name: together,
      when: '__s > 0.5 ? 1 : __d * v',
      dir: 'down',
      set: { __s: '__hold', __d: '__hold > 0.5 ? 0 : -__d', v: '__hold > 0.5 ? 0 : v' },
    },
    { name: slip, when: '__s > 0.5 ? __need : -1', dir: 'up', set: { __s: 0, __d: '__tend' } },
    endEvent('__end', 'up', end, leave),
    endEvent('__beg', 'down', start, leave),
  ]
  const derived = ['x', 'y', 'vx', 'vy', 'speed', 'tangent', 'normalDir', 'side', 'acc', 'accx', 'accy', normalName]
  if (frictionName) derived.push(frictionName)

  // Position and the track frame, before fields and user forces (they may use x, tangent, …).
  const pre = (sc: Scope) => {
    writeGeom(sc, ensure(props, sc))
  }

  const derive = (sc: Scope) => {
    const pack = ensure(props, sc)
    const on = sc.__on > 0.5
    const k = clampIndex(pack, sc.__k)
    const p = pack.pieces[k]
    const g = p ? frame(p, sc.s - pack.starts[k]) : frame({ kind: 'line', x1: 0, y1: 0, x2: 1, y2: 0, len: 1, ux: 1, uy: 0, ang: 0, mu: 0, muS: 0, pipe: true, flip: false }, 0)
    const n = pack.pieces.length
    sc.__hi = n && k < n - 1 ? sc.s - pack.starts[k + 1] : -1
    sc.__lo = k > 0 ? sc.s - pack.starts[k] : 1
    sc.__end = on ? sc.s - pack.L : -1
    sc.__beg = on ? sc.s : 1

    const m = val(mass, sc)
    const { fx, fy } = sumForces(forces, sc)
    const Ft = fx * g.tx + fy * g.ty
    const Fn = fx * g.nx + fy * g.ny
    if (!on || !p) {
      sc.acc = 0
      sc.accx = m ? fx / m : 0
      sc.accy = m ? fy / m : 0
      sc[normalName] = 0
      sc.side = 0
      if (frictionName) sc[frictionName] = 0
      sc.__Nd = 1
      sc.__offHi = 0
      sc.__offLo = 0
      sc.__need = -1
      sc.__hold = 1
      sc.__tend = 0
      return
    }
    // A one-sided piece entered with N already below zero (onto a hump faster than √(gR))
    // never sees N cross zero, so the junction event itself must let go.
    const offAt = (j: number) => {
      const q = pack.pieces[j]
      if (!q || q.pipe) return 0
      const h = frame(q, sc.s - pack.starts[j])
      const Nq = m * sc.v * sc.v * h.kappa - (fx * h.nx + fy * h.ny)
      return Nq < -1e-9 * (Math.abs(fx) + Math.abs(fy) + Math.abs(m) + 1) ? 1 : 0
    }
    sc.__offHi = k < n - 1 ? offAt(k + 1) : 0
    sc.__offLo = k > 0 ? offAt(k - 1) : 0
    // N > 0 pushes the body off the solid side. κ > 0 curves toward the body.
    const N = m * sc.v * sc.v * g.kappa - Fn
    sc[normalName] = N
    sc.side = p.pipe ? 0 : 1
    sc.__Nd = p.pipe ? 1 : N
    const limit = p.muS * Math.abs(N)
    const stuck = sc.__s > 0.5
    const dir = Math.sign(sc.__d) || 0
    let f: number
    let acc: number
    if (stuck) {
      f = -Ft
      acc = 0
      sc.__need = Math.abs(Ft) - limit
      sc.__tend = Math.abs(Ft) > 1e-12 ? Math.sign(Ft) : 0
      sc.__hold = 1
    } else {
      f = -p.mu * Math.abs(N) * dir
      acc = m ? (Ft + f) / m : 0
      sc.__need = -1
      sc.__tend = dir
      sc.__hold = holds(Ft, limit) ? 1 : 0
    }
    if (frictionName) sc[frictionName] = f
    sc.acc = acc
    sc.accx = acc * g.tx + sc.v * sc.v * g.kappa * g.nx
    sc.accy = acc * g.ty + sc.v * sc.v * g.kappa * g.ny
  }

  const init = (sc: Scope, warn: (m: string) => void): Record<string, number> => {
    const pack = ensure(props, sc)
    for (const w of pack.warnings) warn(w)
    const s0 = sc.s
    if (pack.pieces.length && (s0 < -1e-8 * pack.scale || s0 > pack.L + 1e-8 * pack.scale)) {
      warn(`初位置 s = ${+Number(s0).toPrecision(4)} 不在轨道上（轨道全长 ${+pack.L.toPrecision(4)}）`)
    }
    const k = clampIndex(pack, sc.__k)
    const p = pack.pieces[k]
    const g = p ? frame(p, s0 - pack.starts[k]) : { x: 0, y: 0, tx: 1, ty: 0, nx: 0, ny: 1, kappa: 0 }
    const m = val(mass, sc)
    const { fx, fy } = sumForces(forces, sc)
    const Ft = fx * g.tx + fy * g.ty
    const Fn = fx * g.nx + fy * g.ny
    const v0 = sc.v
    const N = p ? m * v0 * v0 * g.kappa - Fn : 0
    const out: Record<string, number> = {
      __k: k,
      __on: 1,
      __s: 0,
      __d: Math.sign(v0) || 0,
      __x: g.x,
      __y: g.y,
      __vx: v0 * g.tx,
      __vy: v0 * g.ty,
    }
    if (!p) {
      out.__on = 0
      return out
    }
    if (!p.pipe && N < -1e-6 * (Math.abs(Fn) + Math.abs(m) + 1)) {
      warn('一开始支持力就小于零：物体在 t = 0 就离开轨道（检查轨道方向或 flip）')
      out.__on = 0
      out.__s = 0
      out.__d = 0
      return out
    }
    if (Math.abs(v0) <= EPS_V) {
      const limit = p.muS * Math.abs(N)
      if (holds(Ft, limit)) {
        out.__s = 1
        out.__d = 0
      } else {
        out.__s = 0
        out.__d = Math.sign(Ft) || 0
      }
    }
    return out
  }

  return { mode: 'track', state, rates, events, derived, derive, init, pre }
}
