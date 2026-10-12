// Motion integrator for <Motion>: the lesson states the initial state and the rates
// (dx/dt = v, dv/dt = F/m …) as expressions; RK4 integrates them, zero crossings of
// event expressions are located by bisection (key times such as "reaches the top",
// "lands", "catches up"), and events may stop the run or reset the state (bounce,
// rope goes slack, phase change). Results flow back into the lesson as names:
//   name          an object whose fields are functions of time: ball.y(t), ball.v(t);
//                 ball.tEnd is when the run stopped
//   event names   the first time each named event happened (NaN if never)
//   read names    "v @ tHit", "y @ tEnd", "max(y)", "min(y)"

import { evaluateIn, num, type Scope } from './expr'

export interface MotionEvent {
  name?: string
  when: string
  dir?: 'up' | 'down' | 'any'
  stop?: boolean
  set?: Record<string, number | string>
}

export interface MotionSpec {
  state: Record<string, number | string>
  rates: Record<string, number | string>
  until: number | string
  events?: MotionEvent[]
  read?: Record<string, string>
  steps?: number
  /** Force-driven bodies (see dynamics.ts): fills accelerations and derived names into the scope. */
  derive?: (sc: Scope, warn: (m: string) => void) => void
  /** Adjusts hidden state at t = 0 (which friction contacts start stuck). */
  init?: (sc: Scope, warn: (m: string) => void) => Record<string, number>
  /** Derived names published as functions of time next to the state variables. */
  derived?: string[]
  /** Raw schematic of a coupled circuit, drawn by `<Circuit motion>`. */
  circuit?: { source?: unknown; load?: unknown }
  /** Hidden region flags (`__in`), so a particle that starts inside can publish enter = 0. */
  fieldFlags?: { flag: string; enter?: string; index: number }[]
  /** Regions to draw, evaluated at the current parameters; a field that changes during the run carries a timeline. */
  fieldDraw?: (scope: Scope, run?: MotionRun) => { label?: string; angle?: number; dir?: 'in' | 'out'; region: object }[]
  /** Frozen track pieces for v.track (pipe and flip already resolved). */
  trackDraw?: (scope: Scope) => object[]
  /** Leave-event name, so a body that starts already off the track can publish 0. */
  trackLeave?: string
}

export interface MotionRun {
  vars: string[]
  /** Sample times, ascending; an event with `set` appears twice (before and after). */
  t: number[]
  /** s[k][i]: value of vars[i] at t[k]. */
  s: number[][]
  end: number
  /** All occurrence times of each named event. */
  events: Record<string, number[]>
  warnings: string[]
  /** Accurate state at any time in [0, end] (one RK4 step from the nearest sample). */
  at(time: number): Record<string, number>
  /** Derived values (forces, accelerations) at sample k, for force-driven motions. */
  derivedAt?: (k: number) => Record<string, number>
}

/** What a <Motion> publishes under its own name: one function of time per variable. */
export type MotionObject = Record<string, ((t: number) => number) | number> & { tEnd: number }

const DEFAULT_STEPS = 800
const MAX_EVENTS = 400
const READ_AT = /^(.+?)\s*@\s*(.+)$/
const READ_EXT = /^(max|min)\s*\((.+)\)$/

// `end` is a reserved word in the expression language, hence tEnd.
export const MOTION_RESERVED = new Set(['t', 'tEnd'])

export function parseRead(spec: string): { kind: 'at'; expr: string; at: string } | { kind: 'max' | 'min'; expr: string } | null {
  const s = spec.trim()
  const ext = READ_EXT.exec(s)
  if (ext) return { kind: ext[1] as 'max' | 'min', expr: ext[2] }
  const at = READ_AT.exec(s)
  if (at) return { kind: 'at', expr: at[1], at: at[2] }
  return null
}

export function integrate(spec: MotionSpec, scope: Scope): MotionRun {
  const vars = Object.keys(spec.state)
  const n = vars.length
  const warnings: string[] = []
  const rates = vars.map((v) => spec.rates[v])
  const events = spec.events ?? []
  const T = num(spec.until, scope, NaN)
  if (!(T > 0) || !Number.isFinite(T)) throw new Error(`until 应为正的有限时长：${String(spec.until)}`)
  const steps = Math.max(50, Math.min(20000, Math.round(spec.steps ?? DEFAULT_STEPS)))
  const h = T / steps

  // One scratch scope for every evaluation: outer names, then t and the state on top.
  const sc: Scope = { ...scope }
  const warned = new Set<string>()
  const warn = (m: string) => {
    if (warned.has(m)) return
    warned.add(m)
    warnings.push(m)
  }
  // Event checks reload the same (t, y) several times; deriving forces is the costly part.
  let lastT = NaN
  let lastY: number[] | null = null
  const load = (t: number, y: number[]) => {
    if (t === lastT && y === lastY) return
    sc.t = t
    for (let i = 0; i < n; i++) sc[vars[i]] = y[i]
    spec.derive?.(sc, warn)
    lastT = t
    lastY = y
  }
  const rate = (i: number) => {
    const r = rates[i]
    return r === undefined ? 0 : typeof r === 'number' ? r : evaluateIn(r, sc)
  }
  const deriv = (t: number, y: number[]) => {
    load(t, y)
    const d = new Array(n)
    for (let i = 0; i < n; i++) d[i] = rate(i)
    return d
  }
  const rk4 = (t: number, y: number[], dt: number) => {
    const k1 = deriv(t, y)
    const y2 = y.map((v, i) => v + (dt / 2) * k1[i])
    const k2 = deriv(t + dt / 2, y2)
    const y3 = y.map((v, i) => v + (dt / 2) * k2[i])
    const k3 = deriv(t + dt / 2, y3)
    const y4 = y.map((v, i) => v + dt * k3[i])
    const k4 = deriv(t + dt, y4)
    return y.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]))
  }
  const g = (e: MotionEvent, t: number, y: number[]) => {
    load(t, y)
    return evaluateIn(e.when, sc)
  }
  const crossed = (e: MotionEvent, a: number, b: number) => {
    const dir = e.dir ?? 'any'
    const up = a < 0 && b >= 0
    const down = a > 0 && b <= 0
    return dir === 'up' ? up : dir === 'down' ? down : up || down
  }

  sc.t = 0
  for (const v of vars) sc[v] = 0
  let y = vars.map((v) => {
    const x = num(spec.state[v], sc, NaN)
    sc[v] = x
    return x
  })
  if (spec.init) {
    for (const [k, v] of Object.entries(spec.init(sc, warn))) {
      const i = vars.indexOf(k)
      if (i >= 0) y[i] = v
    }
    y = y.slice()
  }
  let t = 0
  const ts = [0]
  const ss = [y.slice()]
  const hits: Record<string, number[]> = {}
  for (const e of events) if (e.name) hits[e.name] = []
  let gPrev = events.map((e) => g(e, t, y))
  let end = T
  let fired = 0

  outer: while (t < T - 1e-12 * T) {
    const dt = Math.min(h, T - t)
    const y1 = rk4(t, y, dt)
    const gNext = events.map((e) => g(e, t + dt, y1))
    // Events inside this step, each located by bisection on the step length.
    const taus = events.map((e, i) => {
      if (!crossed(e, gPrev[i], gNext[i])) return Infinity
      let lo = 0
      let hi = dt
      for (let it = 0; it < 60 && hi - lo > 1e-13 * Math.max(1, T); it++) {
        const mid = (lo + hi) / 2
        if (crossed(e, gPrev[i], g(e, t + mid, rk4(t, y, mid)))) hi = mid
        else lo = mid
      }
      return hi
    })
    const tau = Math.min(...taus)
    if (!Number.isFinite(tau)) {
      t += dt
      y = y1
      ts.push(t)
      ss.push(y.slice())
      gPrev = gNext
      for (const v of y) if (!Number.isFinite(v)) {
        warnings.push(`t = ${+t.toPrecision(4)} 时状态出现非有限数，积分提前结束`)
        end = t
        break outer
      }
      continue
    }
    t += tau
    y = rk4(ts[ts.length - 1], ss[ss.length - 1], tau)
    ts.push(t)
    ss.push(y.slice())
    // Events that coincide (a ball stops just as friction must decide to stick) all fire.
    const tol = 1e-9 * Math.max(1, T)
    const now = events.filter((_, i) => taus[i] <= tau + tol)
    for (const e of now) if (e.name) hits[e.name].push(t)
    if (now.some((e) => e.stop)) {
      end = t
      break
    }
    let changed = false
    for (const e of now) {
      if (!e.set) continue
      load(t, y)
      const next = y.slice()
      for (const [k, v] of Object.entries(e.set)) {
        const i = vars.indexOf(k)
        if (i >= 0) next[i] = num(v, sc, NaN)
      }
      y = next
      changed = true
    }
    if (changed) {
      ts.push(t)
      ss.push(y.slice())
    }
    // Bisection stops just past the crossing, so the event cannot fire again from here.
    gPrev = events.map((ev) => g(ev, t, y))
    if (++fired >= MAX_EVENTS) {
      warnings.push(`事件发生超过 ${MAX_EVENTS} 次，积分在 t = ${+t.toPrecision(4)} 停止（检查事件条件，或给反弹加 stop）`)
      end = t
      break
    }
  }

  const at = (time: number): Record<string, number> => {
    // An event that never fired is NaN; reading the state there must stay NaN, not fall back to t = 0.
    if (!Number.isFinite(time)) return Object.fromEntries([...vars, ...(spec.derived ?? [])].map((v) => [v, NaN]))
    const tt = Math.min(Math.max(time, 0), end)
    let lo = 0
    let hi = ts.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (ts[mid] <= tt) lo = mid
      else hi = mid - 1
    }
    const d = tt - ts[lo]
    const yy = d > 0 ? rk4(ts[lo], ss[lo], d) : ss[lo]
    const out = Object.fromEntries(vars.map((v, i) => [v, yy[i]]))
    if (spec.derive) {
      load(tt, yy)
      for (const k of spec.derived ?? []) out[k] = sc[k] as number
    }
    return out
  }
  const derivedAt = spec.derive
    ? (k: number) => {
        load(ts[k], ss[k])
        return Object.fromEntries((spec.derived ?? []).map((d) => [d, sc[d] as number]))
      }
    : undefined
  return { vars, t: ts, s: ss, end, events: hits, warnings, at, derivedAt }
}

/** The names a <Motion> publishes, and the scope entries it fills for them. */
export function motionOutputs(name: string, spec: MotionSpec): string[] {
  // One physical event (leaving a track) can be several integrator events sharing a name.
  const names = [name, ...(spec.events ?? []).flatMap((e) => (e.name ? [e.name] : [])), ...Object.keys(spec.read ?? {})]
  return [...new Set(names)]
}

export function motionValues(name: string, spec: MotionSpec, run: MotionRun, scope: Scope): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const obj: Record<string, unknown> = { tEnd: run.end }
  for (const v of [...run.vars, ...(spec.derived ?? [])]) if (!v.startsWith('__')) obj[v] = (time: number) => run.at(time)[v]
  // Hidden payload for the sandbox: samples it can interpolate without the solver.
  Object.defineProperty(obj, '__run', { value: run, enumerable: false })
  // The schematic <Circuit motion> draws; kept off the enumerable keys so it is not a sample.
  if (spec.circuit) Object.defineProperty(obj, '__circuit', { value: spec.circuit, enumerable: false })
  // Field regions for v.regions. Geometry is numbers at the current parameters.
  if (spec.fieldDraw) Object.defineProperty(obj, '__fields', { value: spec.fieldDraw(scope, run), enumerable: false })
  if (spec.trackDraw) Object.defineProperty(obj, '__track', { value: spec.trackDraw(scope), enumerable: false })
  out[name] = obj
  const firsts: Scope = { tEnd: run.end }
  for (const [k, ts] of Object.entries(run.events)) firsts[k] = ts.length ? ts[0] : NaN
  Object.assign(out, firsts)
  delete out.tEnd
  const evalState = (expr: string, time: number) => {
    const sc: Scope = { ...scope, ...firsts, ...run.at(time), t: time }
    return num(expr, sc, NaN)
  }
  for (const [key, spec0] of Object.entries(spec.read ?? {})) {
    const r = parseRead(spec0)
    if (!r) {
      out[key] = NaN
      continue
    }
    if (r.kind === 'at') {
      const time = num(r.at, { ...scope, ...firsts }, NaN)
      out[key] = Number.isFinite(time) ? evalState(r.expr, time) : NaN
      continue
    }
    // Extremum over the samples, then refined between neighbouring samples.
    const sign = r.kind === 'max' ? 1 : -1
    let best = 0
    let bestV = -Infinity
    run.t.forEach((time, k) => {
      const v = sign * evalState(r.expr, time)
      if (v > bestV) ((bestV = v), (best = k))
    })
    let a = run.t[Math.max(0, best - 1)]
    let b = run.t[Math.min(run.t.length - 1, best + 1)]
    const phi = (Math.sqrt(5) - 1) / 2
    for (let it = 0; it < 50 && b - a > 1e-12; it++) {
      const c = b - phi * (b - a)
      const d = a + phi * (b - a)
      if (sign * evalState(r.expr, c) > sign * evalState(r.expr, d)) b = d
      else a = c
    }
    out[key] = sign * Math.max(bestV, sign * evalState(r.expr, (a + b) / 2))
  }
  return out
}

/** Plain-data form of a published motion object for the sandbox (postMessage). */
const payloads = new WeakMap<MotionRun, unknown>()

export function motionPayload(obj: unknown): unknown {
  const run = obj && typeof obj === 'object' ? (obj as { __run?: MotionRun }).__run : undefined
  if (!run) return obj
  const hit = payloads.get(run)
  if (hit) return hit
  const round = (x: number) => (Number.isFinite(x) ? +x.toPrecision(7) : null)
  const derived = run.derivedAt ? run.s.map((_, k) => run.derivedAt!(k)) : []
  const names = [...run.vars, ...(derived[0] ? Object.keys(derived[0]) : [])]
  const fields = (obj as { __fields?: unknown }).__fields
  const track = (obj as { __track?: unknown }).__track
  const payload = {
    __motion: 1,
    vars: names.filter((v) => !v.startsWith('__')),
    end: run.end,
    t: run.t.map(round),
    s: names.flatMap((v, i) => (v.startsWith('__') ? [] : [run.s.map((row, k) => round(i < run.vars.length ? row[i] : derived[k][v]))])),
    events: run.events,
    ...(fields ? { fields } : {}),
    ...(track ? { track } : {}),
  }
  payloads.set(run, payload)
  return payload
}

export const isMotionObject = (v: unknown): v is MotionObject => !!v && typeof v === 'object' && '__run' in (v as object)
