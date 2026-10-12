// Force-driven motion for <Motion>: instead of writing dv/dt by hand, the lesson lists
// the forces on each body and the component derives the accelerations from ΣF = ma.
//
//   free body (2-D)   forces only; state x, y, vx, vy; publishes accx, accy
//   along a line      `along` gives the +x direction; state x, v; the force marked
//                     `solve` (the normal force, a tension …) is fixed by the
//                     perpendicular balance; publishes acc
//   several bodies    `bodies`, each along its own line, joined by ropes (same speed)
//                     and touching through friction contacts
//   on a track        `track` (see track.ts): line and arc pieces, normal force from
//                     the centripetal balance, per-piece friction, detach / fly off
//   fixed axis        `axis` (see axis.ts): theta and omega; torques about the axis,
//                     optional pivot reaction from the centre-of-mass motion
//
// Friction is Coulomb friction with sticking: a contact slides with μ·N against the
// relative velocity; when the relative velocity reaches zero it sticks if static
// friction (≤ μs·N) can hold it, and it breaks loose again once the required force
// exceeds μs·N. Each contact's stick state is a hidden state variable switched by
// events, so the integrator still stops exactly at the moment of sticking/slipping.

import { evaluateIn, type Scope } from './expr'
import { solveOf, type SolvableForce } from './forces'
import type { MotionEvent } from './motion'
import { axisDynamics } from './axis'
import { trackDynamics } from './track'
import { beltAcceleration, beltRelative, beltWear } from './belt'
import { buoyancyMagnitude, downwardOf, effectiveG, fictitiousUp } from './buoyancy'
import { tipKeys, writeTip } from './tip'

export interface FrictionSpec {
  mu: number | string
  /** Static coefficient (default: same as mu). */
  static?: number | string
  /** Normal force pressing the surfaces together (often the name a `solve` produced). */
  normal: number | string
  /** The other body (default: the fixed ground / incline). */
  with?: string
  /** Event name: times the contact breaks loose and starts sliding. */
  slip?: string
  /** Event name: times the relative velocity reaches zero (common speed, or the block stops). */
  together?: string
  /** Belt surface speed along this body's +along (number or expression). Not another body. */
  belt?: number | string
}

export interface BuoyancySpec {
  rho: number | string
  V: number | string
}

export interface TipSpec {
  halfWidth: number | string
  comHeight: number | string
  mu?: number | string
  /** Frame acceleration, positive to the right. Omit to use this body's horizontal acceleration. */
  a?: number | string
}

export interface DynForce extends SolvableForce {
  label?: string
  friction?: FrictionSpec
  buoyancy?: BuoyancySpec
}

export interface BodySpec {
  name: string
  mass: number | string
  along: number | string
  x?: number | string
  v?: number | string
  forces: DynForce[]
  /** Container's downward acceleration. The motion is written in that frame. */
  aFrame?: number | string
  /** Name of the container body (multi-body only). Coordinates of this body are relative to it. */
  frame?: string
  /** Toppling check. Publishes nAt, tips, edge, slides, slidesFirst. */
  tip?: TipSpec
}

export interface RopeSpec {
  /** Rope pulls the first body along its +x and the second along its −x. */
  between: [string, string]
  solve?: string
}

export interface Dynamics {
  mode: 'free' | 'line' | 'bodies' | 'track' | 'axis'
  /** State entries the dynamics adds (bodies' x/v in multi-body mode, hidden stick flags). */
  state: Record<string, number | string>
  rates: Record<string, string>
  events: MotionEvent[]
  /** Time-dependent names published on the motion object (acc, N, f, T …). */
  derived: string[]
  /**
   * Track mode: position, velocity and the tangent frame, before fields and user
   * forces so expressions like `angle: "tangent + 180"` and field regions see them.
   */
  pre?(sc: Scope): void
  /** Fills accelerations and derived names into the scope at the current state. */
  derive(sc: Scope, warn: (m: string) => void): void
  /** Decides which contacts start stuck; returns values for the hidden flags. */
  init(sc: Scope, warn: (m: string) => void): Record<string, number>
}

interface Contact {
  body: number
  other: number // -1: ground or a driven belt
  mu: number | string
  muS?: number | string
  normal: number | string
  solve?: string
  slip?: string
  together?: string
  /** Belt speed along +along. Absent: the other body, or the ground at rest. */
  belt?: number | string
}

const rad = Math.PI / 180
const EPS_V = 1e-9

function val(v: unknown, sc: Scope): number {
  if (typeof v === 'number') return v
  if (typeof v !== 'string') return NaN
  try {
    return evaluateIn(v, sc)
  } catch {
    return NaN
  }
}

const objOf = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null)

function frameFields(o: Record<string, unknown>): Pick<BodySpec, 'aFrame' | 'frame' | 'tip'> {
  const tip = objOf(o.tip)
  return {
    aFrame: typeof o.aFrame === 'number' || typeof o.aFrame === 'string' ? o.aFrame : undefined,
    frame: typeof o.frame === 'string' ? o.frame : undefined,
    tip: tip
      ? { halfWidth: tip.halfWidth as number | string, comHeight: tip.comHeight as number | string, mu: tip.mu as number | string | undefined, a: tip.a as number | string | undefined }
      : undefined,
  }
}

export function bodiesOf(props: Record<string, unknown>): { mode: Dynamics['mode']; bodies: BodySpec[]; ropes: RopeSpec[] } | null {
  if (Array.isArray(props.bodies)) {
    const bodies = props.bodies.filter((b) => objOf(b)).map((b) => {
      const o = b as Record<string, unknown>
      return {
        name: String(o.name ?? ''),
        mass: o.mass as number | string,
        along: (o.along ?? 0) as number | string,
        x: o.x as number | string | undefined,
        v: o.v as number | string | undefined,
        forces: (Array.isArray(o.forces) ? o.forces.filter((f) => objOf(f)) : []) as DynForce[],
        ...frameFields(o),
      }
    })
    const ropes = (Array.isArray(props.ropes) ? props.ropes : [])
      .map((r) => (Array.isArray(r) ? { between: r } : objOf(r)))
      .filter((r): r is Record<string, unknown> => !!r && Array.isArray(r.between) && r.between.length === 2)
      .map((r) => ({ between: [String((r.between as unknown[])[0]), String((r.between as unknown[])[1])] as [string, string], solve: typeof r.solve === 'string' ? r.solve : undefined }))
    return { mode: 'bodies', bodies, ropes }
  }
  // mass + fields (no along) is a free body even when forces is omitted: the field forces are the whole right-hand side.
  const forces = Array.isArray(props.forces) ? (props.forces.filter((f) => objOf(f)) as DynForce[]) : null
  const fieldsOnly = Array.isArray(props.fields) && props.mass !== undefined && props.along === undefined
  if (!forces && !fieldsOnly) return null
  const body: BodySpec = { name: '', mass: props.mass as number | string, along: (props.along ?? 0) as number | string, forces: forces ?? [], ...frameFields(props) }
  return { mode: props.along === undefined ? 'free' : 'line', bodies: [body], ropes: [] }
}

/** State names of body i: x, v for a single body on a line; xA, vA in multi-body mode. */
export function bodyVars(mode: Dynamics['mode'], b: BodySpec): { x: string; v: string; acc: string } {
  return mode === 'bodies' ? { x: 'x' + b.name, v: 'v' + b.name, acc: 'acc' + b.name } : { x: 'x', v: 'v', acc: 'acc' }
}

export function dynamicsOf(props: Record<string, unknown>): Dynamics | null {
  // Fixed-axis rotation is not a free body, even with mass and forces and no `along`.
  if (props.axis !== undefined) {
    const axis = axisDynamics(props)
    if (axis) return axis
  }
  // A track is not a free body, even though it has mass and forces and no `along`.
  if (props.track !== undefined) {
    const track = trackDynamics(props)
    if (track) return track
  }
  const spec = bodiesOf(props)
  if (!spec) return null
  const { mode, bodies, ropes } = spec

  if (mode === 'free') return freeBody(bodies[0], props.aFrame)

  const index = new Map(bodies.map((b, i) => [b.name, i]))
  const vars = bodies.map((b) => bodyVars(mode, b))
  const contacts: Contact[] = []
  bodies.forEach((b, i) =>
    b.forces.forEach((f) => {
      if (!f.friction) return
      const belted = f.friction.belt !== undefined
      const other = belted || f.friction.with === undefined || f.friction.with === 'ground' ? -1 : index.get(f.friction.with) ?? -1
      contacts.push({ body: i, other, mu: f.friction.mu, muS: f.friction.static, normal: f.friction.normal, solve: typeof f.solve === 'string' ? f.solve : undefined, slip: f.friction.slip, together: f.friction.together, belt: f.friction.belt })
    }),
  )
  const ropeIdx = ropes.map((r) => [index.get(r.between[0]) ?? -1, index.get(r.between[1]) ?? -1] as const).filter(([a, b]) => a >= 0 && b >= 0)
  // __s: contact stuck (0/1); __d: sliding direction (sign of the relative velocity),
  // frozen between events so the right-hand side stays smooth inside an RK4 step.
  const flag = (k: number) => `__s${k}`
  const sdir = (k: number) => `__d${k}`
  const n = bodies.length
  const G = n // ground node

  const state: Record<string, number | string> = {}
  if (mode === 'bodies') bodies.forEach((b, i) => ((state[vars[i].x] = b.x ?? 0), (state[vars[i].v] = b.v ?? 0)))
  contacts.forEach((_, k) => ((state[flag(k)] = 0), (state[sdir(k)] = 0)))

  const rates: Record<string, string> = {}
  vars.forEach((v) => ((rates[v.x] = v.v), (rates[v.v] = v.acc)))
  // Sliding mark and heat, one pair per body that touches a belt. Integrated with the state.
  const beltOn = bodies.map(() => false)
  contacts.forEach((c) => {
    if (c.belt !== undefined) beltOn[c.body] = true
  })
  bodies.forEach((b, i) => {
    if (!beltOn[i]) return
    const slide = mode === 'bodies' ? 'slide' + b.name : 'slide'
    const heat = mode === 'bodies' ? 'Q' + b.name : 'Q'
    state[slide] = 0
    state[heat] = 0
    rates[slide] = `__sdot${i}`
    rates[heat] = `__qdot${i}`
  })

  // Bodies moving together through ropes: a stick to the ground stops all of them.
  const ropeGroup = (i: number): number[] => {
    const seen = new Set([i])
    const stack = [i]
    while (stack.length) {
      const b = stack.pop()!
      for (const [p, q] of ropeIdx) for (const [s, t] of [[p, q], [q, p]]) if (s === b && !seen.has(t)) (seen.add(t), stack.push(t))
    }
    return [...seen]
  }
  const events: MotionEvent[] = contacts.flatMap((c, k) => {
    // Relative velocity reaches zero: stick if static friction can hold, else reverse.
    const set: Record<string, string> = { [flag(k)]: `__hold${k}`, [sdir(k)]: `__hold${k} ? 0 : -${sdir(k)}` }
    // Ground is at rest (__belt = 0). A belt sticks at the belt speed, not at 0.
    if (c.other < 0) for (const b of ropeGroup(c.body)) set[vars[b].v] = `__hold${k} ? __belt${k} : ${vars[b].v}`
    return [
      { name: c.together, when: `${flag(k)} > 0.5 ? 1 : ${sdir(k)} * __rel${k}`, dir: 'down' as const, set },
      { name: c.slip, when: `${flag(k)} > 0.5 ? __need${k} : -1`, dir: 'up' as const, set: { [flag(k)]: 0, [sdir(k)]: `__tend${k}` } },
    ]
  })

  const motionAFrame = props.aFrame
  const inFrame = (b: BodySpec) => b.aFrame !== undefined || !!b.frame || motionAFrame !== undefined
  const framed = (b: BodySpec) => inFrame(b) || b.forces.some((f) => !!f.buoyancy)
  const gEffName = (b: BodySpec) => (mode === 'bodies' ? 'gEff' + b.name : 'gEff')
  // Absolute upward acceleration. The solved acc is relative to the container.
  const absName = (b: BodySpec) => (mode === 'bodies' ? 'aAbs' + b.name : 'aAbs')
  const derived = [
    ...vars.map((v) => v.acc),
    ...bodies.flatMap((b) => b.forces.flatMap((f) => (!f.friction && typeof solveOf(f).magnitude === 'string' ? [solveOf(f).magnitude!] : []))),
    ...contacts.flatMap((c) => (c.solve ? [c.solve] : [])),
    ...ropes.flatMap((r) => (r.solve ? [r.solve] : [])),
    ...bodies.flatMap((b) => (framed(b) ? [gEffName(b)] : [])),
    ...bodies.flatMap((b) => (inFrame(b) ? [absName(b)] : [])),
    ...bodies.flatMap((b) => (b.tip ? tipKeys(mode === 'bodies' ? b.name : '') : [])),
  ]

  interface Frame {
    m: number[]
    P: number[] // along-line force from everything except friction and ropes
    N: number[] // per contact
    rel: number[]
    v: number[]
  }

  // aDown[i]: container acceleration, positive down. 0 in an inertial frame.
  const aDownOf = (sc: Scope, acc: number[] | null): number[] =>
    bodies.map((b) => {
      if (b.aFrame !== undefined) return val(b.aFrame, sc)
      if (b.frame && acc) {
        const j = index.get(b.frame)
        if (j !== undefined) return downwardOf(acc[j], val(bodies[j].along, sc))
      }
      return motionAFrame !== undefined ? val(motionAFrame, sc) : 0
    })

  const frame = (sc: Scope, warn: (m: string) => void, aDown: number[]): Frame => {
    const m: number[] = []
    const P: number[] = []
    const v: number[] = []
    const g = typeof sc.g === 'number' ? sc.g : NaN
    bodies.forEach((b, i) => {
      const mass = val(b.mass, sc)
      m.push(mass)
      v.push(val(vars[i].v, sc))
      const th = val(b.along, sc) * rad
      const u = [Math.cos(th), Math.sin(th)]
      const nrm = [-Math.sin(th), Math.cos(th)]
      let sx = 0
      let sy = 0
      let size = 0
      let unknown: { name: string; d: number[] } | null = null
      const gEff = effectiveG(g, aDown[i] || 0)
      if (b.forces.some((f) => f.buoyancy) && !Number.isFinite(g)) warn('浮力需要课件里的 g（重力加速度）')
      for (const f of b.forces) {
        if (f.friction) continue
        const a = val(f.angle, sc) * rad
        if (f.buoyancy) {
          const mag = buoyancyMagnitude(val(f.buoyancy.rho, sc), val(f.buoyancy.V, sc), gEff)
          if (typeof f.solve === 'string') sc[f.solve] = mag
          sx += mag * Math.cos(a)
          sy += mag * Math.sin(a)
          size += Math.abs(mag)
          continue
        }
        const s = solveOf(f)
        if (typeof s.magnitude === 'string') {
          unknown = { name: s.magnitude, d: [Math.cos(a), Math.sin(a)] }
          continue
        }
        const mag = val(f.magnitude, sc)
        sx += mag * Math.cos(a)
        sy += mag * Math.sin(a)
        size += Math.abs(mag)
      }
      // Fictitious force in the container frame: upward when the container accelerates down.
      const up = fictitiousUp(mass, aDown[i] || 0)
      sy += up
      size += Math.abs(up)
      const perp = sx * nrm[0] + sy * nrm[1]
      if (unknown) {
        const dn = unknown.d[0] * nrm[0] + unknown.d[1] * nrm[1]
        const x = Math.abs(dn) < 1e-9 ? NaN : -perp / dn
        if (Number.isNaN(x)) warn(`${unknown.name} 沿运动方向，无法由垂直方向的平衡求出`)
        sc[unknown.name] = x
        sx += x * unknown.d[0]
        sy += x * unknown.d[1]
      } else if (Math.abs(perp) > 1e-6 * (size + 1e-9)) {
        // Relative to the force sizes, not the net force: at terminal speed the net is ~0 and the
        // cos(±90°) ≈ 6e-17 rounding alone would exceed a net-relative tolerance.
        warn(`${b.name ? b.name + ' ' : ''}垂直于运动方向的力不平衡（缺少支持力？给它写 solve）`)
      }
      P.push(sx * u[0] + sy * u[1])
    })
    const N = contacts.map((c) => Math.abs(val(c.normal, sc)))
    const rel = contacts.map((c) => beltRelative(v[c.body], c.belt !== undefined ? val(c.belt, sc) : c.other >= 0 ? v[c.other] : 0))
    return { m, P, N, rel, v }
  }

  // Accelerations for a given stick pattern and sliding directions (+1, −1, or 0 for
  // no friction). Bodies joined by ropes or stuck contacts move as one group.
  const accel = (fr: Frame, stuck: boolean[], dirs: number[], sc: Scope) => {
    const parent = Array.from({ length: n + 1 }, (_, i) => i)
    const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])))
    const join = (a: number, b: number) => (parent[find(a)] = find(b))
    for (const [a, b] of ropeIdx) join(a, b)
    contacts.forEach((c, k) => stuck[k] && join(c.body, c.other < 0 ? G : c.other))
    const f = contacts.map((c, k) => (stuck[k] ? 0 : -val(c.mu, sc) * fr.N[k] * dirs[k]))
    const E = fr.P.slice()
    contacts.forEach((c, k) => {
      E[c.body] += f[k]
      if (c.other >= 0) E[c.other] -= f[k]
    })
    const M = new Map<number, number>()
    const F = new Map<number, number>()
    for (let i = 0; i < n; i++) {
      const r = find(i)
      M.set(r, (M.get(r) ?? 0) + fr.m[i])
      F.set(r, (F.get(r) ?? 0) + E[i])
    }
    const a = Array.from({ length: n }, (_, i) => (find(i) === find(G) ? 0 : F.get(find(i))! / M.get(find(i))!))

    // Force carried by one rope or stuck contact: cut it, and the part on the first
    // body's side needs exactly that force to move with the group.
    const edges: [number, number][] = [...ropeIdx.map(([p, q]) => [p, q] as [number, number]), ...contacts.map((c) => [c.body, c.other < 0 ? G : c.other] as [number, number])]
    const live = (e: number) => e < ropeIdx.length || stuck[e - ropeIdx.length]
    const carried = (e: number): number => {
      const [from, to] = edges[e]
      const side = new Set([from])
      const stack = [from]
      while (stack.length) {
        const b = stack.pop()!
        edges.forEach(([p, q], j) => {
          if (j === e || !live(j)) return
          for (const [s, t] of [[p, q], [q, p]]) if (s === b && !side.has(t)) (side.add(t), stack.push(t))
        })
      }
      if (side.has(to) || side.has(G)) return NaN // statically indeterminate
      let sum = 0
      for (const b of side) sum += fr.m[b] * a[b] - E[b]
      return sum
    }
    return { a, f, carried, contactEdge: (k: number) => ropeIdx.length + k }
  }

  const limitOf = (fr: Frame, k: number, sc: Scope) => {
    const c = contacts[k]
    return (c.muS === undefined ? val(c.mu, sc) : val(c.muS, sc)) * fr.N[k]
  }
  // Which way contact k would start to slide if it let go (relative acceleration
  // with that contact frictionless).
  const tendency = (fr: Frame, stuck: boolean[], dirs: number[], k: number, sc: Scope) => {
    const s = stuck.slice()
    const d = dirs.slice()
    s[k] = false
    d[k] = 0
    const { a } = accel(fr, s, d, sc)
    const c = contacts[k]
    const t = a[c.body] - (c.other >= 0 ? a[c.other] : 0)
    return Math.abs(t) > 1e-12 ? Math.sign(t) : 0
  }

  const derive = (sc: Scope, warn: (m: string) => void) => {
    let aDown = aDownOf(sc, null)
    let fr = frame(sc, warn, aDown)
    const stuck = contacts.map((_, k) => val(flag(k), sc) > 0.5)
    const dirs = contacts.map((_, k) => Math.sign(val(sdir(k), sc)) || 0)
    let res = accel(fr, stuck, dirs, sc)
    if (bodies.some((b) => b.frame)) {
      const next = aDownOf(sc, res.a)
      if (next.some((a, i) => a !== aDown[i])) {
        aDown = next
        fr = frame(sc, warn, aDown)
        res = accel(fr, stuck, dirs, sc)
      }
    }
    // A block stuck to a belt whose speed changes has to accelerate with the belt.
    const beltAcc = contacts.map((c, k) =>
      stuck[k] && c.belt !== undefined ? beltAcceleration(c.belt, typeof sc.t === 'number' ? sc.t : 0, (time) => val(c.belt, { ...sc, t: time })) : 0,
    )
    beltAcc.forEach((ab, k) => {
      if (Math.abs(ab) >= 1e-8) res.a[contacts[k].body] += ab
    })
    vars.forEach((v, i) => {
      sc[v.acc] = res.a[i]
      if (inFrame(bodies[i])) sc[absName(bodies[i])] = (res.a[i] as number) * Math.sin(val(bodies[i].along, sc) * rad) - (aDown[i] || 0)
    })
    contacts.forEach((c, k) => {
      sc[`__belt${k}`] = c.belt !== undefined ? val(c.belt, sc) : 0
      const limit = limitOf(fr, k, sc)
      let force = res.f[k]
      if (stuck[k]) {
        const F0 = res.carried(res.contactEdge(k))
        const F = Number.isFinite(F0) ? F0 + fr.m[c.body] * beltAcc[k] : F0
        force = F
        sc[`__need${k}`] = Number.isFinite(F) ? Math.abs(F) - limit : -1
        sc[`__hold${k}`] = 1
        sc[`__tend${k}`] = tendency(fr, stuck, dirs, k, sc)
      } else {
        sc[`__need${k}`] = -1
        sc[`__tend${k}`] = dirs[k]
        const trial = stuck.slice()
        trial[k] = true
        const F = accel(fr, trial, dirs, sc).carried(res.contactEdge(k))
        sc[`__hold${k}`] = !Number.isFinite(F) || Math.abs(F) <= limit * (1 + 1e-12) + 1e-12 ? 1 : 0
      }
      sc[`__rel${k}`] = fr.rel[k]
      if (c.solve) sc[c.solve] = force
    })
    ropes.forEach((r, j) => {
      const T = res.carried(j)
      if (T < -1e-9 * (Math.abs(fr.P[ropeIdx[j][0]]) + 1)) warn(`绳 ${r.between.join('–')} 的拉力为负：绳会松弛（组件按绳一直绷紧计算）`)
      if (r.solve) sc[r.solve] = T
    })
    const g = typeof sc.g === 'number' ? sc.g : NaN
    bodies.forEach((b, i) => {
      if (framed(b)) sc[gEffName(b)] = effectiveG(g, aDown[i] || 0)
      if (beltOn[i]) {
        let slide = 0
        let heat = 0
        contacts.forEach((c, k) => {
          if (c.body !== i || c.belt === undefined) return
          const w = beltWear(fr.rel[k], stuck[k], val(c.mu, sc), fr.N[k])
          slide += w.slide
          heat += w.heat
        })
        sc[`__sdot${i}`] = slide
        sc[`__qdot${i}`] = heat
      }
      if (!b.tip) return
      const horiz = (res.a[i] as number) * Math.cos(val(b.along, sc) * rad)
      const a = b.tip.a !== undefined ? val(b.tip.a, sc) : horiz
      writeTip(sc, mode === 'bodies' ? b.name : '', {
        a,
        g,
        halfWidth: val(b.tip.halfWidth, sc),
        comHeight: val(b.tip.comHeight, sc),
        mu: b.tip.mu === undefined ? undefined : val(b.tip.mu, sc),
      })
    })
  }

  const init = (sc: Scope, warn: (m: string) => void): Record<string, number> => {
    let aDown = aDownOf(sc, null)
    let fr = frame(sc, warn, aDown)
    if (bodies.some((b) => b.frame)) {
      const stuck0 = contacts.map((_, k) => Math.abs(fr.rel[k]) <= EPS_V)
      const dirs0 = contacts.map((_, k) => (stuck0[k] ? 0 : Math.sign(fr.rel[k]) || 0))
      const next = aDownOf(sc, accel(fr, stuck0, dirs0, sc).a)
      if (next.some((a, i) => a !== aDown[i])) fr = frame(sc, warn, next)
    }
    const stuck = contacts.map((_, k) => Math.abs(fr.rel[k]) <= EPS_V)
    const dirs = contacts.map((_, k) => (stuck[k] ? 0 : Math.sign(fr.rel[k])))
    // Start with every resting contact stuck; let the most overloaded one slip, repeat.
    for (let guard = 0; guard <= contacts.length; guard++) {
      const res = accel(fr, stuck, dirs, sc)
      let worst = -1
      let worstNeed = 0
      contacts.forEach((_, k) => {
        if (!stuck[k]) return
        const F = res.carried(res.contactEdge(k))
        const need = Number.isFinite(F) ? Math.abs(F) - limitOf(fr, k, sc) : -1
        if (need > 1e-12 && need > worstNeed) ((worst = k), (worstNeed = need))
      })
      if (worst < 0) break
      dirs[worst] = tendency(fr, stuck, dirs, worst, sc)
      stuck[worst] = false
    }
    return Object.fromEntries(contacts.flatMap((_, k) => [[flag(k), stuck[k] ? 1 : 0], [sdir(k), dirs[k]]]))
  }

  return { mode, state, rates, events, derived, derive, init }
}

function freeBody(b: BodySpec, motionAFrame: unknown): Dynamics {
  const aFrame = b.aFrame !== undefined ? b.aFrame : motionAFrame
  const uses = aFrame !== undefined || b.forces.some((f) => !!f.buoyancy)
  const derived = ['accx', 'accy']
  if (uses) derived.push('gEff')
  if (aFrame !== undefined) derived.push('aAbsx', 'aAbsy')
  for (const f of b.forces) if (f.buoyancy && typeof f.solve === 'string') derived.push(f.solve)
  if (b.tip) derived.push(...tipKeys(''))
  return {
    mode: 'free',
    state: {},
    rates: { x: 'vx', y: 'vy', vx: 'accx', vy: 'accy' },
    events: [],
    derived,
    derive(sc) {
      const m = val(b.mass, sc)
      const g = typeof sc.g === 'number' ? sc.g : NaN
      const aDown = aFrame !== undefined ? val(aFrame, sc) : 0
      const gEff = effectiveG(g, aDown)
      if (uses) sc.gEff = gEff
      let sx = 0
      let sy = 0
      for (const f of b.forces) {
        if (f.friction) continue
        const a = val(f.angle, sc) * rad
        const mag = f.buoyancy ? buoyancyMagnitude(val(f.buoyancy.rho, sc), val(f.buoyancy.V, sc), gEff) : val(f.magnitude, sc)
        if (f.buoyancy && typeof f.solve === 'string') sc[f.solve] = mag
        sx += mag * Math.cos(a)
        sy += mag * Math.sin(a)
      }
      sy += fictitiousUp(m, aDown)
      // Field forces (fields.ts) are already resolved for this state. Absent when the motion has no fields.
      if (typeof sc.__Fx === 'number') sx += sc.__Fx
      if (typeof sc.__Fy === 'number') sy += sc.__Fy
      sc.accx = sx / m
      sc.accy = sy / m
      // acc is relative to the container. Absolute = relative + the container's acceleration (aFrame is positive down).
      if (aFrame !== undefined) {
        sc.aAbsx = sc.accx
        sc.aAbsy = (sc.accy as number) - aDown
      }
      if (b.tip) {
        writeTip(sc, '', {
          a: b.tip.a !== undefined ? val(b.tip.a, sc) : (sc.accx as number),
          g,
          halfWidth: val(b.tip.halfWidth, sc),
          comHeight: val(b.tip.comHeight, sc),
          mu: b.tip.mu === undefined ? undefined : val(b.tip.mu, sc),
        })
      }
    },
    init: () => ({}),
  }
}
