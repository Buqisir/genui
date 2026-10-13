// Quasi-static gas column, liquid plug and piston in a tube (<GasTube>).
// The lesson states the initial contents; this solves the equilibrium at every
// value of the drive and publishes the results as functions of that drive.
// Work is the integral of p dV along the solved path (positive when the gas expands).

import { evaluateIn, symbolsOf, type Scope } from './expr'

type End = 'closed' | 'open'
type Units = 'SI' | 'cmHg'
type Stop = 'free' | 'min' | 'max'

interface GasC {
  kind: 'gas'
  name: string
  L: number | string
  p?: number | string
  T: number | string
  Tnow: number | string
  amount: number | string
  cv?: number | string
}
interface LiqC {
  kind: 'liquid'
  name: string
  L: number | string
  rho?: number | string
}
interface PisC {
  kind: 'piston'
  name: string
  m: number | string
  thick: number | string
  min?: number | string
  max?: number | string
  force: number | string
  leave?: string
  hit?: string
}
type Movable = LiqC | PisC
type Item = GasC | LiqC | PisC

interface Block {
  items: Movable[]
  /** left: held at s = 0 (closed start); right: end held at Ltot (closed end); both: fills the tube; free: unknown. */
  pin: 'free' | 'left' | 'right' | 'both'
}
type Piece = { kind: 'gas'; gas: GasC } | { kind: 'block'; block: Block }

interface GeomSeg {
  s0: number
  s1: number
  sin: number
  cos: number
  x0: number
  z0: number
  len: number
}
interface Geom {
  segs: GeomSeg[]
  Ltot: number
}

export interface TubeDraw {
  units: Units
  Ltot: number
  p0: number
  start: End
  end: End
  /** Centerline joints, physics coordinates, z upward. */
  axis: { x: number; z: number }[]
  pose: (s: number) => { x: number; z: number; sin: number; cos: number }
  gases: { name: string; s0: number; s1: number; p: number; L: number }[]
  liquids: { name: string; s0: number; s1: number }[]
  pistons: { name: string; s0: number; s1: number; mass: number }[]
  stops: { s: number }[]
  warnings: string[]
}

interface Spec {
  units: Units
  start: End
  end: End
  drive: string
  from: number | string
  to: number | string
  steps: number
  p0: number | string
  g: number | string
  S: number | string
  gap: number | string
  path: { length: number | string; angle: number | string }[]
  items: Item[]
  pieces: Piece[]
  blocks: Block[]
  gases: GasC[]
  pistons: PisC[]
  liquids: LiqC[]
}

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/
const DRIVE_IDENT = /^[\p{L}_][\p{L}\p{N}_]*$/u

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

function numOf(v: number | string | undefined, scope: Scope, fallback: number): number {
  if (typeof v === 'number') return v
  if (typeof v !== 'string') return fallback
  try {
    return evaluateIn(v, scope)
  } catch {
    return NaN
  }
}

/** Parse a structurally usable spec. Invalid props return null; the validator reports why. */
export function specOf(props: Record<string, unknown>): Spec | null {
  if (!Array.isArray(props.contents) || !Array.isArray(props.path) || !isObj(props.drive)) return null
  const drive = props.drive
  if (typeof drive.name !== 'string') return null
  const items: Item[] = []
  for (const raw of props.contents) {
    if (!isObj(raw)) return null
    const keys = ['gas', 'liquid', 'piston'].filter((k) => raw[k] !== undefined)
    if (keys.length !== 1) return null
    if (raw.gas !== undefined) {
      if (typeof raw.gas !== 'string') return null
      items.push({
        kind: 'gas',
        name: raw.gas,
        L: raw.L as number | string,
        p: raw.p as number | string | undefined,
        T: (raw.T ?? 300) as number | string,
        Tnow: (raw.Tnow ?? raw.T ?? 300) as number | string,
        amount: (raw.amount ?? 1) as number | string,
        cv: raw.cv as number | string | undefined,
      })
    } else if (raw.liquid !== undefined) {
      if (typeof raw.liquid !== 'string') return null
      items.push({ kind: 'liquid', name: raw.liquid, L: raw.L as number | string, rho: raw.rho as number | string | undefined })
    } else {
      if (typeof raw.piston !== 'string') return null
      const stops = isObj(raw.stops) ? raw.stops : undefined
      items.push({
        kind: 'piston',
        name: raw.piston,
        m: (raw.m ?? 0) as number | string,
        thick: (raw.thick ?? 0) as number | string,
        min: stops?.min as number | string | undefined,
        max: stops?.max as number | string | undefined,
        force: (raw.force ?? 0) as number | string,
        leave: typeof raw.leave === 'string' ? raw.leave : undefined,
        hit: typeof raw.hit === 'string' ? raw.hit : undefined,
      })
    }
  }
  const pieces: Piece[] = []
  for (const it of items) {
    if (it.kind === 'gas') pieces.push({ kind: 'gas', gas: it })
    else {
      const prev = pieces[pieces.length - 1]
      if (prev && prev.kind === 'block') prev.block.items.push(it)
      else pieces.push({ kind: 'block', block: { items: [it], pin: 'free' } })
    }
  }
  const start: End = props.start === 'open' ? 'open' : 'closed'
  const end: End = props.end === 'open' ? 'open' : 'closed'
  const units: Units = props.units === 'cmHg' ? 'cmHg' : 'SI'
  const first = pieces[0]
  const last = pieces[pieces.length - 1]
  // A block at an open end is pushed by p0 and moves like any other block.
  if (first?.kind === 'block' && start === 'closed') first.block.pin = 'left'
  if (last?.kind === 'block' && end === 'closed') {
    last.block.pin = last.block.pin === 'free' ? 'right' : 'both'
  }
  const blocks = pieces.flatMap((p) => (p.kind === 'block' ? [p.block] : []))
  return {
    units,
    start,
    end,
    drive: drive.name,
    from: drive.from as number | string,
    to: drive.to as number | string,
    steps: typeof drive.steps === 'number' ? drive.steps : 200,
    p0: (props.p0 ?? (units === 'cmHg' ? 76 : 1e5)) as number | string,
    g: (props.g ?? 10) as number | string,
    S: (props.S ?? 1) as number | string,
    gap: (props.gap ?? 0) as number | string,
    path: (props.path as { length: number | string; angle: number | string }[]).filter(isObj).map((s) => ({
      length: s.length as number | string,
      angle: s.angle as number | string,
    })),
    items,
    pieces,
    blocks,
    gases: items.filter((i): i is GasC => i.kind === 'gas'),
    pistons: items.filter((i): i is PisC => i.kind === 'piston'),
    liquids: items.filter((i): i is LiqC => i.kind === 'liquid'),
  }
}

export function gasTubeOutputs(props: Record<string, unknown>): string[] {
  const name = typeof props.name === 'string' ? props.name : ''
  const events: string[] = typeof props.stop === 'string' ? [props.stop] : []
  if (Array.isArray(props.contents)) {
    for (const raw of props.contents) {
      if (!isObj(raw)) continue
      if (typeof raw.leave === 'string') events.push(raw.leave)
      if (typeof raw.hit === 'string') events.push(raw.hit)
    }
  }
  return name ? [name, ...events] : events
}

/** External names the equilibrium depends on (drive name and piston position names are local). */
export function gasTubeInputs(props: Record<string, unknown>): string[] {
  const spec = specOf(props)
  const local = new Set<string>()
  if (spec) local.add(spec.drive)
  else if (isObj(props.drive) && typeof props.drive.name === 'string') local.add(props.drive.name)
  if (spec) for (const p of spec.pistons) local.add('x' + p.name)
  const names = new Set<string>()
  const take = (v: unknown) => {
    if (typeof v !== 'string') return
    try {
      for (const s of symbolsOf(v)) if (!local.has(s)) names.add(s)
    } catch {
      // the validator reports unparsable expressions
    }
  }
  const walk = (v: unknown) => {
    if (typeof v === 'string') take(v)
    else if (Array.isArray(v)) v.forEach(walk)
    else if (isObj(v)) for (const x of Object.values(v)) walk(x)
  }
  walk(props.path)
  walk(props.contents)
  walk(props.drive)
  take(props.p0)
  take(props.g)
  take(props.S)
  take(props.gap)
  for (const n of gasTubeOutputs(props)) names.delete(n)
  return [...names]
}

function geomOf(lengths: number[], angles: number[]): Geom {
  let s = 0
  let x = 0
  let z = 0
  const segs: GeomSeg[] = []
  for (let i = 0; i < lengths.length; i++) {
    const rad = (angles[i] * Math.PI) / 180
    const sin = Math.sin(rad)
    const cos = Math.cos(rad)
    const len = lengths[i]
    segs.push({ s0: s, s1: s + len, sin, cos, x0: x, z0: z, len })
    x += len * cos
    z += len * sin
    s += len
  }
  return { segs, Ltot: s }
}

function poseAt(geom: Geom, s: number): { x: number; z: number; sin: number; cos: number } {
  const segs = geom.segs
  const last = segs[segs.length - 1]
  let g = last
  if (s < segs[0].s0) g = segs[0]
  else {
    for (const seg of segs) {
      if (s <= seg.s1 || seg === last) {
        g = seg
        break
      }
    }
  }
  const ds = s - g.s0
  return { x: g.x0 + ds * g.cos, z: g.z0 + ds * g.sin, sin: g.sin, cos: g.cos }
}

interface Env {
  geom: Geom
  p0: number
  g: number
  S: number
  gap: number
  rhoG: Map<LiqC, number>
  len: Map<Movable, number>
  mass: Map<PisC, number>
  tNow: Map<GasC, number>
  amount: Map<GasC, number>
  cv: Map<GasC, number>
  min: Map<PisC, number | undefined>
  max: Map<PisC, number | undefined>
}

interface GasInfo {
  L0: number
  T0: number
  amount0: number
  pInit: number
  c: number
  cv?: number
}

type Mode = Record<string, Stop>

interface Placed {
  item: Item
  s0: number
  s1: number
}

interface Solved {
  ok: boolean
  drive: number
  mode: Mode
  placed: Placed[]
  gasP: Map<string, number>
  gasL: Map<string, number>
  pistonR: Map<string, number>
  blockPos: number[]
  bad?: string
}

function envAt(spec: Spec, scope: Scope, drive: number): Env {
  const sc: Scope = { ...scope, [spec.drive]: drive }
  const lengths = spec.path.map((s) => numOf(s.length, sc, NaN))
  const angles = spec.path.map((s) => numOf(s.angle, sc, NaN))
  const rhoG = new Map<LiqC, number>()
  const len = new Map<Movable, number>()
  const mass = new Map<PisC, number>()
  const tNow = new Map<GasC, number>()
  const amount = new Map<GasC, number>()
  const cv = new Map<GasC, number>()
  const min = new Map<PisC, number | undefined>()
  const max = new Map<PisC, number | undefined>()
  for (const it of spec.items) {
    if (it.kind === 'gas') {
      tNow.set(it, numOf(it.Tnow, sc, NaN))
      amount.set(it, numOf(it.amount, sc, 1))
      if (it.cv !== undefined) cv.set(it, numOf(it.cv, sc, NaN))
    } else if (it.kind === 'liquid') {
      len.set(it, numOf(it.L, sc, NaN))
      rhoG.set(it, spec.units === 'cmHg' ? 1 : numOf(it.rho, sc, NaN) * numOf((spec.g ?? 10) as number | string, sc, 10))
    } else {
      len.set(it, numOf(it.thick, sc, 0))
      mass.set(it, numOf(it.m, sc, 0))
      min.set(it, it.min === undefined ? undefined : numOf(it.min, sc, NaN))
      max.set(it, it.max === undefined ? undefined : numOf(it.max, sc, NaN))
    }
  }
  return {
    geom: geomOf(lengths, angles),
    p0: numOf(spec.p0, sc, 0),
    g: numOf(spec.g, sc, 10),
    S: numOf(spec.S, sc, 1),
    gap: numOf(spec.gap, sc, 0),
    rhoG,
    len,
    mass,
    tNow,
    amount,
    cv,
    min,
    max,
  }
}

function withPositions(spec: Spec, scope: Scope, drive: number, env: Env, blockPos: number[]): Scope {
  const sc: Scope = { ...scope, [spec.drive]: drive }
  spec.blocks.forEach((b, i) => {
    let s = blockPos[i]
    for (const it of b.items) {
      if (it.kind === 'piston') sc['x' + it.name] = s
      s += env.len.get(it) ?? 0
    }
  })
  return sc
}

function layout(spec: Spec, env: Env, blockPos: number[]): Placed[] {
  const pos = new Map<Block, number>()
  spec.blocks.forEach((b, i) => pos.set(b, blockPos[i]))
  const out: Placed[] = []
  let prevEnd = spec.start === 'closed' ? 0 : env.gap
  for (const pc of spec.pieces) {
    if (pc.kind === 'block') {
      let s = pos.get(pc.block) ?? prevEnd
      for (const it of pc.block.items) {
        const L = env.len.get(it) ?? 0
        out.push({ item: it, s0: s, s1: s + L })
        s += L
      }
      prevEnd = s
    } else {
      const idx = spec.pieces.indexOf(pc)
      const next = spec.pieces[idx + 1]
      const s0 = prevEnd
      const s1 = next && next.kind === 'block' ? (pos.get(next.block) ?? s0) : spec.end === 'closed' ? env.geom.Ltot : s0
      out.push({ item: pc.gas, s0, s1 })
      prevEnd = s1
    }
  }
  return out
}

/** Where a free or stopped block sits. Stop wins over the unknown so a jaw cannot be crossed. */
function blockStart(spec: Spec, env: Env, block: Block, mode: Mode, unknown: Map<Block, number>): number {
  const len = block.items.reduce((s, it) => s + (env.len.get(it) ?? 0), 0)
  if (block.pin === 'left' || block.pin === 'both') return 0
  if (block.pin === 'right') return env.geom.Ltot - len
  let offset = 0
  for (const it of block.items) {
    if (it.kind === 'piston') {
      const stop = mode[it.name] ?? 'free'
      if (stop === 'min' && env.min.get(it) !== undefined) return (env.min.get(it) as number) - offset
      if (stop === 'max' && env.max.get(it) !== undefined) return (env.max.get(it) as number) - offset
    }
    offset += env.len.get(it) ?? 0
  }
  return unknown.get(block) ?? 0
}

function gasConstants(spec: Spec, scope: Scope, from: number): { info: Map<GasC, GasInfo>; errors: string[] } {
  const env = envAt(spec, scope, from)
  const errors: string[] = []
  const cursor = new Map<Item, number>()
  let s = spec.start === 'open' ? env.gap : 0
  for (const it of spec.items) {
    cursor.set(it, s)
    if (it.kind === 'gas') s += numOf(it.L, { ...scope, [spec.drive]: from }, NaN)
    else s += env.len.get(it) ?? 0
  }
  const Ltot = env.geom.Ltot
  const tol = 1e-6 * Math.max(1, Ltot)
  if (spec.end === 'closed' && Math.abs(s - Ltot) > tol) {
    errors.push(`两端封闭，各段初始长度之和是 ${+s.toPrecision(6)}，管长是 ${+Ltot.toPrecision(6)}`)
  } else if (spec.end === 'open' && s > Ltot + tol) {
    errors.push(`内容的初始长度之和 ${+s.toPrecision(6)} 超过管长 ${+Ltot.toPrecision(6)}`)
  }
  const mode: Mode = {}
  for (const p of spec.pistons) {
    const sp = cursor.get(p) ?? 0
    const lo = env.min.get(p)
    const hi = env.max.get(p)
    const near = (a: number, b: number) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b), Ltot)
    if (lo !== undefined && sp < lo - 1e-6 * Math.max(1, Ltot)) errors.push(`活塞 ${p.name} 的初始位置 ${+sp.toPrecision(6)} 低于卡口 min`)
    if (hi !== undefined && sp > hi + 1e-6 * Math.max(1, Ltot)) errors.push(`活塞 ${p.name} 的初始位置 ${+sp.toPrecision(6)} 高于卡口 max`)
    mode[p.name] = lo !== undefined && near(sp, lo) ? 'min' : hi !== undefined && near(sp, hi) ? 'max' : 'free'
  }
  // Pressures at the left and right face of every item. A stopped piston blocks the walk:
  // the jaw's reaction is unknown, so a gas beyond it needs its own p.
  const n = spec.items.length
  const faceL: (number | undefined)[] = new Array(n)
  const faceR: (number | undefined)[] = new Array(n)
  if (spec.start === 'open') faceL[0] = env.p0
  if (spec.end === 'open') faceR[n - 1] = env.p0
  const sc0: Scope = { ...scope, [spec.drive]: from }
  for (const p of spec.pistons) {
    const sp = cursor.get(p) ?? 0
    sc0['x' + p.name] = sp
  }
  const given = new Map<GasC, number>()
  for (const g of spec.gases) if (g.p !== undefined) given.set(g, numOf(g.p, sc0, NaN))

  const dzOf = (it: LiqC) => {
    const s0 = cursor.get(it) ?? 0
    const s1 = s0 + (env.len.get(it) ?? 0)
    return poseAt(env.geom, s1).z - poseAt(env.geom, s0).z
  }
  const jumpOf = (it: PisC) => {
    const sp = cursor.get(it) ?? 0
    const sin = poseAt(env.geom, sp).sin
    const F = numOf(it.force, sc0, 0)
    return (F - (env.mass.get(it) ?? 0) * env.g * sin) / env.S
  }

  let guard = 0
  let changed = true
  while (changed && guard++ < n + 2) {
    changed = false
    for (let i = 0; i < n; i++) {
      const it = spec.items[i]
      if (it.kind === 'gas') {
        const gp = given.get(it)
        if (gp !== undefined) {
          if (faceL[i] === undefined) ((faceL[i] = gp), (changed = true))
          if (faceR[i] === undefined) ((faceR[i] = gp), (changed = true))
        } else {
          if (faceL[i] !== undefined && faceR[i] === undefined) ((faceR[i] = faceL[i]), (changed = true))
          if (faceR[i] !== undefined && faceL[i] === undefined) ((faceL[i] = faceR[i]), (changed = true))
        }
      } else if (it.kind === 'piston' && mode[it.name] !== 'free') {
        continue
      } else if (it.kind === 'liquid') {
        const drop = (env.rhoG.get(it) ?? NaN) * dzOf(it)
        const left = faceL[i]
        const right = faceR[i]
        if (left !== undefined && right === undefined) ((faceR[i] = left - drop), (changed = true))
        else if (right !== undefined && left === undefined) ((faceL[i] = right + drop), (changed = true))
      } else if (it.kind === 'piston') {
        const jump = jumpOf(it)
        const left = faceL[i]
        const right = faceR[i]
        if (left !== undefined && right === undefined) ((faceR[i] = left + jump), (changed = true))
        else if (right !== undefined && left === undefined) ((faceL[i] = right - jump), (changed = true))
      }
      if (i + 1 < n && faceR[i] !== undefined && faceL[i + 1] === undefined) ((faceL[i + 1] = faceR[i]), (changed = true))
      if (i > 0 && faceL[i] !== undefined && faceR[i - 1] === undefined) ((faceR[i - 1] = faceL[i]), (changed = true))
    }
  }

  const info = new Map<GasC, GasInfo>()
  const unitP = spec.units === 'cmHg' ? 'cmHg' : 'Pa'
  for (let i = 0; i < n; i++) {
    const it = spec.items[i]
    if (it.kind === 'gas') {
      const L0 = numOf(it.L, sc0, NaN)
      const T0 = numOf(it.T, sc0, 300)
      const amount0 = numOf(it.amount, sc0, 1)
      const inferred = faceL[i]
      const gp = given.get(it)
      if (gp === undefined && (inferred === undefined || !Number.isFinite(inferred))) {
        errors.push(`气柱 ${it.name} 的初始压强算不出来，请写 p`)
        continue
      }
      const pInit = gp ?? (inferred as number)
      if (!(L0 > 0) || !(T0 > 0) || !(amount0 > 0)) errors.push(`气柱 ${it.name} 的初始长度、温度和 amount 应为正数`)
      const Tfrom = env.tNow.get(it) ?? NaN
      if (Number.isFinite(Tfrom) && Math.abs(Tfrom - T0) > 1e-6 * Math.abs(T0)) {
        errors.push(`气柱 ${it.name} 在 ${spec.drive} = ${fmt(from)} 时 Tnow = ${fmt(Tfrom)}，和初温 T = ${fmt(T0)} 不一致（初态就是 drive.from 时的状态）`)
      }
      info.set(it, { L0, T0, amount0, pInit, c: (pInit * L0) / (amount0 * T0), cv: it.cv === undefined ? undefined : numOf(it.cv, sc0, NaN) })
    } else if (it.kind === 'liquid') {
      const drop = (env.rhoG.get(it) ?? NaN) * dzOf(it)
      if (faceL[i] !== undefined && faceR[i] !== undefined) {
        const got = faceL[i]! - faceR[i]!
        const scale = Math.max(1, Math.abs(faceL[i]!), Math.abs(faceR[i]!), Math.abs(drop))
        if (Math.abs(got - drop) > 1e-4 * scale) {
          errors.push(`液柱 ${it.name} 的初态不平衡：按高度差压强应变化 ${+drop.toPrecision(6)} ${unitP}，实际两端差 ${+got.toPrecision(6)} ${unitP}`)
        }
      }
    } else if (mode[it.name] === 'free') {
      const R = pistonForce(env, it, sc0, cursor.get(it) ?? 0, faceL[i], faceR[i])
      const scale = forceScale(env, it, sc0, faceL[i], faceR[i])
      if (faceL[i] === undefined || faceR[i] === undefined || Math.abs(R) > 1e-4 * scale) {
        errors.push(`活塞 ${it.name} 的初态不平衡：沿 +s 方向的合力为 ${+R.toPrecision(6)} N，平衡时应为 0`)
      }
    } else {
      const R = pistonForce(env, it, sc0, cursor.get(it) ?? 0, faceL[i], faceR[i])
      const stop = mode[it.name]
      const bad = (stop === 'min' && R > 1e-4 * forceScale(env, it, sc0, faceL[i], faceR[i])) || (stop === 'max' && R < -1e-4 * forceScale(env, it, sc0, faceL[i], faceR[i]))
      if (bad) {
        errors.push(`活塞 ${it.name} 停在${stop === 'min' ? '下' : '上'}卡口上，但其余力的合力沿 ${R > 0 ? '+s' : '−s'}（${+Math.abs(R).toPrecision(6)} N），卡口挡不住`)
      }
    }
  }
  return { info, errors }
}

function forceScale(env: Env, p: PisC, sc: Scope, pL: number | undefined, pR: number | undefined): number {
  const F = Math.abs(numOf(p.force, sc, 0))
  return Math.max(1, Math.abs(pL ?? 0) * env.S, Math.abs(pR ?? 0) * env.S, (env.mass.get(p) ?? 0) * env.g, F)
}

function pistonForce(env: Env, p: PisC, sc: Scope, s: number, pL: number | undefined, pR: number | undefined): number {
  if (pL === undefined || pR === undefined || !(env.S > 0)) return NaN
  const sin = poseAt(env.geom, s).sin
  const F = numOf(p.force, sc, 0)
  return (pL - pR) * env.S - (env.mass.get(p) ?? 0) * env.g * sin + F
}

function solveLinear(A: number[][], b: number[]): number[] | null {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let k = 0; k < n; k++) {
    let piv = k
    for (let i = k + 1; i < n; i++) if (Math.abs(M[i][k]) > Math.abs(M[piv][k])) piv = i
    if (Math.abs(M[piv][k]) < 1e-14) return null
    if (piv !== k) [M[k], M[piv]] = [M[piv], M[k]]
    const div = M[k][k]
    for (let j = k; j <= n; j++) M[k][j] /= div
    for (let i = 0; i < n; i++) {
      if (i === k) continue
      const f = M[i][k]
      for (let j = k; j <= n; j++) M[i][j] -= f * M[k][j]
    }
  }
  return M.map((row) => row[n])
}

/**
 * Damped least-squares step for a singular Jacobian. A level tube open at both ends leaves the
 * position of a trapped column undetermined; this picks the smallest move that balances it.
 */
function dampedStep(J: number[][], r: number[]): number[] | null {
  const n = J[0]?.length ?? 0
  const A = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => J.reduce((s, row) => s + row[i] * row[j], 0)))
  const b = Array.from({ length: n }, (_, i) => J.reduce((s, row, k) => s + row[i] * r[k], 0))
  const mu = 1e-8 * Math.max(...A.map((row, i) => row[i]))
  if (!(mu > 0)) return null
  for (let i = 0; i < n; i++) A[i][i] += mu
  return solveLinear(A, b)
}

interface Engine {
  spec: Spec
  scope: Scope
  info: Map<GasC, GasInfo>
  from: number
  to: number
  /** +1 when the drive increases from `from` to `to`, −1 when it decreases. Samples are in sweep order. */
  dir: 1 | -1
  samples: Solved[]
  /** Drive where the process stopped (NaN if it ran to the end); everything past it is NaN. */
  cut: number
  warnings: string[]
  cache: Map<string, Solved>
}

function pastCut(engine: Engine, drive: number): boolean {
  return Number.isFinite(engine.cut) && engine.dir * (drive - engine.cut) >= 0
}

function unknownsOf(spec: Spec, env: Env, mode: Mode): Block[] {
  return spec.blocks.filter((b) => {
    if (b.pin !== 'free') return false
    return b.items.every((it) => it.kind !== 'piston' || (mode[it.name] ?? 'free') === 'free')
  })
}

/** Count of equilibrium assemblies since load. Tests diff it to bound solver work without timing the machine. */
export let gasTubeAssemblies = 0

function assemble(spec: Spec, scope: Scope, drive: number, env: Env, mode: Mode, values: Map<Block, number>, info: Map<GasC, GasInfo>): Solved {
  gasTubeAssemblies++
  const blockPos = spec.blocks.map((b) => blockStart(spec, env, b, mode, values))
  const sc = withPositions(spec, scope, drive, env, blockPos)
  // Force depends on the piston position, so masses and forces are read from sc inside the residual.
  const placed = layout(spec, env, blockPos)
  const byItem = new Map<Item, Placed>(placed.map((p) => [p.item, p]))
  const gasP = new Map<string, number>()
  const gasL = new Map<string, number>()
  let bad = ''
  for (const g of spec.gases) {
    const pl = byItem.get(g)
    const L = (pl?.s1 ?? 0) - (pl?.s0 ?? 0)
    gasL.set(g.name, L)
    const inf = info.get(g)
    const T = env.tNow.get(g) ?? NaN
    const amount = env.amount.get(g) ?? 1
    if (!(L > 0) || !inf) bad = bad || `气柱 ${g.name} 的长度趋于 0`
    else gasP.set(g.name, (inf.c * amount * T) / L)
  }
  const pLeft = new Map<Block, number | undefined>()
  const pRight = new Map<Block, number | undefined>()
  spec.pieces.forEach((pc, i) => {
    if (pc.kind !== 'block') return
    const prev = spec.pieces[i - 1]
    const next = spec.pieces[i + 1]
    pLeft.set(pc.block, prev ? (prev.kind === 'gas' ? gasP.get(prev.gas.name) : undefined) : spec.start === 'open' ? env.p0 : undefined)
    pRight.set(pc.block, next ? (next.kind === 'gas' ? gasP.get(next.gas.name) : undefined) : spec.end === 'open' ? env.p0 : undefined)
  })
  const pistonR = new Map<string, number>()
  for (const p of spec.pistons) {
    const block = spec.blocks.find((b) => b.items.includes(p))!
    const pl = byItem.get(p)!
    // A single piston's two faces are the block's two faces; a piston inside a block
    // (liquid stuck to it) uses the marched contact pressure.
    let left = pLeft.get(block)
    let right = pRight.get(block)
    if (block.items.length > 1) {
      let pCur = left
      for (const it of block.items) {
        if (it === p) {
          left = pCur
          break
        }
        pCur = marchItem(spec, env, sc, it, byItem.get(it)!, pCur)
      }
      let pBack = right
      for (let k = block.items.length - 1; k >= 0; k--) {
        const it = block.items[k]
        if (it === p) {
          right = pBack
          break
        }
        pBack = marchItemBack(spec, env, sc, it, byItem.get(it)!, pBack)
      }
    }
    pistonR.set(p.name, pistonForce(env, p, sc, pl.s0, left, right))
  }
  for (const pl of placed) {
    if (pl.item.kind === 'piston') {
      if (pl.s0 < -1e-8 * Math.max(1, env.geom.Ltot) || pl.s1 > env.geom.Ltot + 1e-8 * Math.max(1, env.geom.Ltot)) bad = bad || `活塞 ${pl.item.name} 被推出管口`
    }
    if (pl.item.kind === 'liquid') {
      const Ltot = env.geom.Ltot
      const tol = 1e-8 * Math.max(1, Ltot)
      // Liquid past an open mouth would spill and shorten the column, which this model does not follow.
      if (pl.s0 < -tol) bad = bad || (spec.start === 'closed' ? `液柱 ${pl.item.name} 被推进封闭端` : `液柱 ${pl.item.name} 到达开口，再往外会溢出`)
      if (pl.s1 > Ltot + tol) bad = bad || (spec.end === 'closed' ? `液柱 ${pl.item.name} 被推进封闭端` : `液柱 ${pl.item.name} 到达开口，再往外会溢出`)
    }
  }
  return { ok: !bad, drive, mode: { ...mode }, placed, gasP, gasL, pistonR, blockPos, bad: bad || undefined }
}

function marchItem(spec: Spec, env: Env, sc: Scope, it: Movable, pl: Placed, p: number | undefined): number | undefined {
  if (p === undefined) return undefined
  if (it.kind === 'liquid') {
    const dz = poseAt(env.geom, pl.s1).z - poseAt(env.geom, pl.s0).z
    return p - (env.rhoG.get(it) ?? NaN) * dz
  }
  const sin = poseAt(env.geom, pl.s0).sin
  const F = numOf(it.force, sc, 0)
  return p + (F - (env.mass.get(it) ?? 0) * env.g * sin) / env.S
}

function marchItemBack(spec: Spec, env: Env, sc: Scope, it: Movable, pl: Placed, p: number | undefined): number | undefined {
  if (p === undefined) return undefined
  if (it.kind === 'liquid') {
    const dz = poseAt(env.geom, pl.s1).z - poseAt(env.geom, pl.s0).z
    return p + (env.rhoG.get(it) ?? NaN) * dz
  }
  const sin = poseAt(env.geom, pl.s0).sin
  const F = numOf(it.force, sc, 0)
  return p - (F - (env.mass.get(it) ?? 0) * env.g * sin) / env.S
}

function residuals(spec: Spec, scope: Scope, drive: number, env: Env, mode: Mode, u: number[], info: Map<GasC, GasInfo>, free: Block[]): { R: number[]; solved: Solved } {
  const values = new Map<Block, number>()
  free.forEach((b, i) => values.set(b, u[i]))
  const solved = assemble(spec, scope, drive, env, mode, values, info)
  const byItem = new Map(solved.placed.map((p) => [p.item, p]))
  const sc = withPositions(spec, scope, drive, env, solved.blockPos)
  const R: number[] = []
  for (const b of free) {
    const i = spec.pieces.findIndex((p) => p.kind === 'block' && p.block === b)
    const prev = spec.pieces[i - 1]
    const next = spec.pieces[i + 1]
    const pL = prev ? (prev.kind === 'gas' ? solved.gasP.get(prev.gas.name) : undefined) : spec.start === 'open' ? env.p0 : undefined
    const pR = next ? (next.kind === 'gas' ? solved.gasP.get(next.gas.name) : undefined) : spec.end === 'open' ? env.p0 : undefined
    let p = pL
    for (const it of b.items) p = marchItem(spec, env, sc, it, byItem.get(it)!, p)
    const raw = (p ?? NaN) - (pR ?? NaN)
    const scale = Math.max(1, Math.abs(pL ?? 0), Math.abs(pR ?? 0), Math.abs(p ?? 0))
    R.push(raw / scale)
  }
  return { R, solved }
}

function newton(spec: Spec, scope: Scope, drive: number, mode: Mode, guess: number[], info: Map<GasC, GasInfo>): Solved {
  const env = envAt(spec, scope, drive)
  const free = unknownsOf(spec, env, mode)
  if (free.length === 0) {
    const solved = assemble(spec, scope, drive, env, mode, new Map(), info)
    solved.ok = solved.ok && solved.placed.every((p) => p.item.kind !== 'gas' || (solved.gasL.get(p.item.name) ?? 0) > 0)
    return solved
  }
  let u = free.map((b) => {
    const i = spec.blocks.indexOf(b)
    return guess[i] ?? 0
  })
  let last = residuals(spec, scope, drive, env, mode, u, info, free)
  for (let iter = 0; iter < 20; iter++) {
    const scaleR = Math.max(...last.R.map((r) => Math.abs(r)))
    if (scaleR < 1e-10) return last.solved
    const J = last.R.map(() => new Array(u.length).fill(0))
    for (let k = 0; k < u.length; k++) {
      const h = 1e-6 * Math.max(1, Math.abs(u[k]))
      const up = u.slice()
      up[k] += h
      const rp = residuals(spec, scope, drive, env, mode, up, info, free).R
      for (let i = 0; i < rp.length; i++) J[i][k] = (rp[i] - last.R[i]) / h
    }
    const step = solveLinear(J, last.R.map((r) => -r)) ?? dampedStep(J, last.R.map((r) => -r))
    if (!step) break
    let alpha = 1
    let improved = false
    for (let k = 0; k < 12; k++) {
      const trial = u.map((v, i) => v + alpha * step[i])
      const next = residuals(spec, scope, drive, env, mode, trial, info, free)
      const gasesOk = [...next.solved.gasL.values()].every((L) => L > 0)
      const norm = Math.max(...next.R.map((r) => Math.abs(r)))
      if (gasesOk && norm < scaleR) {
        u = trial
        last = next
        improved = true
        break
      }
      alpha *= 0.5
    }
    if (!improved) break
  }
  const scaleR = Math.max(...last.R.map((r) => Math.abs(r)))
  if (scaleR < 1e-8) return last.solved
  last.solved.ok = false
  last.solved.bad = last.solved.bad || '平衡没有收敛'
  return last.solved
}

function healthy(spec: Spec, sol: Solved, info: Map<GasC, GasInfo>): boolean {
  if (!sol.ok) return false
  for (const g of spec.gases) {
    const inf = info.get(g)
    const L = sol.gasL.get(g.name) ?? 0
    const floor = 1e-4 * Math.max(inf?.L0 ?? 0, 1e-9)
    if (!(L > floor)) return false
  }
  return true
}

function fmt(d: number): string {
  if (!Number.isFinite(d)) return String(d)
  return String(+d.toPrecision(6))
}

function runProcess(spec: Spec, scope: Scope, info: Map<GasC, GasInfo>, from: number, to: number): Engine {
  const env0 = envAt(spec, scope, from)
  const cursor = new Map<Item, number>()
  let s = spec.start === 'open' ? env0.gap : 0
  for (const it of spec.items) {
    cursor.set(it, s)
    if (it.kind === 'gas') s += info.get(it)?.L0 ?? 0
    else s += env0.len.get(it) ?? 0
  }
  const mode: Mode = {}
  const Ltot = env0.geom.Ltot
  const near = (a: number, b: number) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b), Ltot)
  for (const p of spec.pistons) {
    const sp = cursor.get(p) ?? 0
    const lo = env0.min.get(p)
    const hi = env0.max.get(p)
    mode[p.name] = lo !== undefined && near(sp, lo) ? 'min' : hi !== undefined && near(sp, hi) ? 'max' : 'free'
  }
  const guess0 = spec.blocks.map((b) => cursor.get(b.items[0]) ?? 0)
  const dir: 1 | -1 = to >= from ? 1 : -1
  const engine: Engine = { spec, scope, info, from, to, dir, samples: [], cut: NaN, warnings: [], cache: new Map() }
  const span = Math.max(Math.abs(to - from), 1e-9)
  const steps = Math.max(1, Math.min(20000, Math.round(spec.steps)))
  const keyOf = (drive: number, m: Mode) => `${Object.entries(m).join(',')}|${drive.toPrecision(14)}`

  const solve = (drive: number, m: Mode, guess: number[]): Solved => {
    const k = keyOf(drive, m)
    const hit = engine.cache.get(k)
    if (hit) return hit
    const sol = newton(spec, scope, drive, m, guess, info)
    engine.cache.set(k, sol)
    return sol
  }

  let m = { ...mode }
  let guess = guess0
  let prevDrive = from
  let prev = solve(from, m, guess)
  engine.samples.push(prev)
  guess = prev.blockPos

  const posTol = 1e-8 * Math.max(1, Ltot)
  const wants = (sol: Solved, p: PisC): 'leave' | 'hit-min' | 'hit-max' | null => {
    const stop = sol.mode[p.name] ?? 'free'
    const pl = sol.placed.find((x) => x.item === p)
    const sp = pl?.s0 ?? 0
    const lo = envAt(spec, scope, sol.drive).min.get(p)
    const hi = envAt(spec, scope, sol.drive).max.get(p)
    const R = sol.pistonR.get(p.name) ?? 0
    if (stop === 'free') {
      if (lo !== undefined && sp < lo - posTol) return 'hit-min'
      if (hi !== undefined && sp > hi + posTol) return 'hit-max'
      return null
    }
    // R is the other forces along +s. A jaw at min holds a push toward −s; at max, toward +s.
    if (stop === 'min' && R > 0) return 'leave'
    if (stop === 'max' && R < 0) return 'leave'
    return null
  }

  const bisect = (kind: 'leave' | 'hit-min' | 'hit-max', p: PisC, dLo: number, dHi: number, base: Mode, g0: number[]): number => {
    let lo = dLo
    let hi = dHi
    let gLo = g0
    for (let it = 0; it < 70 && Math.abs(hi - lo) > 1e-10 * span; it++) {
      const mid = (lo + hi) / 2
      const modeTry = kind === 'leave' ? base : { ...base, [p.name]: 'free' as Stop }
      const sol = solve(mid, modeTry, gLo)
      const bad = kind === 'leave' ? wants({ ...sol, mode: base }, p) === 'leave' : kind === 'hit-min' ? (sol.placed.find((x) => x.item === p)?.s0 ?? 0) < (envAt(spec, scope, mid).min.get(p) ?? 0) : (sol.placed.find((x) => x.item === p)?.s0 ?? 0) > (envAt(spec, scope, mid).max.get(p) ?? 0)
      if (bad) hi = mid
      else {
        lo = mid
        gLo = sol.blockPos
      }
    }
    return (lo + hi) / 2
  }

  outer: for (let i = 1; i <= steps; i++) {
    const dTarget = from + ((to - from) * i) / steps
    let guard = 0
    while (guard++ < 8) {
      const sol = solve(dTarget, m, guess)
      if (!healthy(spec, sol, info)) {
        let lo = prevDrive
        let hi = dTarget
        for (let it = 0; it < 70 && Math.abs(hi - lo) > 1e-10 * span; it++) {
          const mid = (lo + hi) / 2
          const sm = solve(mid, m, guess)
          if (healthy(spec, sm, info)) lo = mid
          else hi = mid
        }
        engine.cut = hi
        const reason = solve(dTarget, m, guess).bad || '气柱长度趋于 0'
        engine.warnings.push(`${reason}（${spec.drive} = ${fmt(hi)}），过程在这里停止，之后的值为 NaN`)
        break outer
      }
      const switching: { p: PisC; kind: 'leave' | 'hit-min' | 'hit-max' }[] = []
      for (const p of spec.pistons) {
        const k = wants(sol, p)
        if (k) switching.push({ p, kind: k })
      }
      if (!switching.length) {
        engine.samples.push(sol)
        prev = sol
        prevDrive = dTarget
        guess = sol.blockPos
        m = { ...sol.mode }
        break
      }
      // The first switch along the sweep wins.
      let best = switching[0]
      let bestD = NaN
      for (const sw of switching) {
        const dStar = bisect(sw.kind, sw.p, prevDrive, dTarget, m, guess)
        if (!Number.isFinite(bestD) || dir * (dStar - bestD) < 0) {
          bestD = dStar
          best = sw
        }
      }
      if (!(dir * (bestD - prevDrive) > 1e-14 * span)) bestD = prevDrive
      const arriving = solve(bestD, best.kind === 'leave' ? m : { ...m, [best.p.name]: 'free' }, guess)
      const nextMode: Mode = { ...m }
      if (best.kind === 'leave') nextMode[best.p.name] = 'free'
      else nextMode[best.p.name] = best.kind === 'hit-min' ? 'min' : 'max'
      const at = solve(bestD, nextMode, arriving.blockPos)
      // Pushed even when it repeats the last sample's drive: the first sample in the new mode marks the switch.
      engine.samples.push(at)
      prev = at
      prevDrive = bestD
      guess = at.blockPos
      m = nextMode
    }
  }
  return engine
}

// Jaw changes are read off the stored samples (the first sample of a new mode is the switch).

function eventsOf(spec: Spec, samples: Solved[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const p of spec.pistons) {
    if (p.leave) out[p.leave] = NaN
    if (p.hit) out[p.hit] = NaN
  }
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1]
    const b = samples[i]
    for (const p of spec.pistons) {
      const before = a.mode[p.name] ?? 'free'
      const after = b.mode[p.name] ?? 'free'
      if (before === after) continue
      if ((before === 'min' || before === 'max') && after === 'free' && p.leave && !Number.isFinite(out[p.leave]!)) out[p.leave] = b.drive
      if (before === 'free' && (after === 'min' || after === 'max') && p.hit && !Number.isFinite(out[p.hit]!)) out[p.hit] = b.drive
    }
  }
  return out
}

/** Mode of the last sample reached by the sweep at this drive. */
function modeAt(samples: Solved[], drive: number, span: number, dir: 1 | -1): Mode {
  let m = samples[0].mode
  for (const s of samples) {
    if (dir * (s.drive - drive) <= 1e-12 * span) m = s.mode
    else break
  }
  return m
}

function stateAt(engine: Engine, drive: number): Solved {
  const { samples, spec, scope, info } = engine
  if (!samples.length || pastCut(engine, drive)) {
    const nan = samples.length ? { ...samples[samples.length - 1], ok: false } : (null as unknown as Solved)
    return nan
  }
  const span = Math.max(Math.abs(engine.to - engine.from), 1e-9)
  for (const s of samples) {
    if (Math.abs(s.drive - drive) <= 1e-12 * span) return s
  }
  const mode = modeAt(samples, drive, span, engine.dir)
  let nearest = samples[0]
  for (const s of samples) if (Math.abs(s.drive - drive) < Math.abs(nearest.drive - drive)) nearest = s
  return newton(spec, scope, drive, mode, nearest.blockPos, info)
}

/** ∫ p dV from the state at drive a to the state at drive b (either order), with no jaw change in between. */
function integrateWork(engine: Engine, gas: GasC, a: number, b: number, sa: Solved, sb: Solved): number {
  const inf = engine.info.get(gas)!
  const V = (s: Solved) => (s.gasL.get(gas.name) ?? 0) * (envAt(engine.spec, engine.scope, s.drive).S)
  const P = (s: Solved) => s.gasP.get(gas.name) ?? 0
  const panel = (aS: Solved, mS: Solved, bS: Solved) => {
    // Simpson on p(τ)·dV/dτ from a quadratic fit of V(τ). Exact for an isobar and a linear expansion.
    const Va = V(aS)
    const Vm = V(mS)
    const Vb = V(bS)
    return (1 / 6) * (P(aS) * (-3 * Va + 4 * Vm - Vb) + 4 * P(mS) * (Vb - Va) + P(bS) * (Va - 4 * Vm + 3 * Vb))
  }
  const scale = Math.max(1e-12, Math.abs(P(sa) * (V(sb) - V(sa))), Math.abs(inf.pInit * inf.L0 * envAt(engine.spec, engine.scope, a).S))
  const eps = 1e-9 * scale
  const rec = (d0: number, d1: number, s0: Solved, s1: Solved, whole: number, depth: number): number => {
    const mid = (d0 + d1) / 2
    const sm = stateAt(engine, mid)
    const left = panel(s0, stateAt(engine, (d0 + mid) / 2), sm)
    const right = panel(sm, stateAt(engine, (mid + d1) / 2), s1)
    const refined = left + right
    if (depth > 14 || Math.abs(refined - whole) <= 15 * eps) return refined + (refined - whole) / 15
    return rec(d0, mid, s0, sm, left, depth + 1) + rec(mid, d1, sm, s1, right, depth + 1)
  }
  if (a === b) return 0
  const sm = stateAt(engine, (a + b) / 2)
  const whole = panel(sa, sm, sb)
  return rec(a, b, sa, sb, whole, 0)
}

function cumulativeWork(engine: Engine): Map<string, number[]> {
  const out = new Map<string, number[]>()
  for (const g of engine.spec.gases) {
    const w = [0]
    for (let i = 1; i < engine.samples.length; i++) {
      const add = integrateWork(engine, g, engine.samples[i - 1].drive, engine.samples[i].drive, engine.samples[i - 1], engine.samples[i])
      w.push(w[i - 1] + add)
    }
    out.set(g.name, w)
  }
  return out
}

function workAt(engine: Engine, cum: Map<string, number[]>, gas: GasC, drive: number): number {
  if (!Number.isFinite(drive) || pastCut(engine, drive) || !engine.samples.length) return NaN
  const span = Math.max(Math.abs(engine.to - engine.from), 1e-9)
  const w = cum.get(gas.name)!
  if (Math.abs(drive - engine.from) <= 1e-12 * span) return 0
  // Start from the last sample the sweep passed before reaching this drive.
  let i = 0
  for (let k = 0; k < engine.samples.length; k++) {
    if (Math.abs(engine.samples[k].drive - drive) <= 1e-12 * span) return w[k]
    if (engine.dir * (engine.samples[k].drive - drive) < 0) i = k
  }
  const a = engine.samples[i]
  return w[i] + integrateWork(engine, gas, a.drive, drive, a, stateAt(engine, drive))
}

export interface GasRun {
  values: Record<string, unknown>
  warnings: string[]
  errors: string[]
}

export function runGasTube(props: Record<string, unknown>, scope: Scope): GasRun {
  const spec = specOf(props)
  const name = typeof props.name === 'string' ? props.name : ''
  const outputs = gasTubeOutputs(props)
  const fail = (errors: string[], warnings: string[] = []): GasRun => ({
    values: Object.fromEntries(outputs.map((n) => [n, n === name ? emptyObj(spec, name) : NaN])),
    warnings,
    errors,
  })
  if (!spec || !name) return fail(['<GasTube> 结构不完整'])
  const from = numOf(spec.from, { ...scope, [spec.drive]: 0 }, NaN)
  const to = numOf(spec.to, { ...scope, [spec.drive]: 0 }, NaN)
  if (!Number.isFinite(from) || !Number.isFinite(to) || from === to) return fail(['drive.from 和 drive.to 需要是两个不同的数'])
  const { info, errors } = gasConstants(spec, scope, from)
  if (errors.length || [...info.values()].some((g) => !Number.isFinite(g.c))) return fail(errors)

  const engine = runProcess(spec, scope, info, from, to)
  const events = eventsOf(spec, engine.samples)
  const cum = cumulativeWork(engine)

  // Outside [from, to] the equilibrium is continued from the nearest sample.
  const read = (drive: number): Solved | null => {
    const d = typeof drive === 'number' ? drive : NaN
    if (!Number.isFinite(d) || pastCut(engine, d)) return null
    const sol = stateAt(engine, d)
    return sol.ok ? sol : null
  }

  const obj: Record<string, unknown> = { from, to }
  for (const g of spec.gases) {
    const inf = info.get(g)!
    obj['p' + g.name] = (drive: number) => read(drive)?.gasP.get(g.name) ?? NaN
    obj['L' + g.name] = (drive: number) => read(drive)?.gasL.get(g.name) ?? NaN
    obj['V' + g.name] = (drive: number) => {
      const sol = read(drive)
      if (!sol) return NaN
      return (sol.gasL.get(g.name) ?? NaN) * envAt(spec, scope, drive).S
    }
    obj['T' + g.name] = (drive: number) => (read(drive) ? (envAt(spec, scope, drive).tNow.get(g) ?? NaN) : NaN)
    obj['W' + g.name] = (drive: number) => workAt(engine, cum, g, drive)
    if (g.cv !== undefined) {
      obj['U' + g.name] = (drive: number) => {
        const sol = read(drive)
        if (!sol) return NaN
        const env = envAt(spec, scope, drive)
        const amount = env.amount.get(g) ?? 1
        const T = env.tNow.get(g) ?? NaN
        const cv = env.cv.get(g) ?? inf.cv ?? NaN
        return cv * inf.c * env.S * (amount * T - inf.amount0 * inf.T0)
      }
      obj['Q' + g.name] = (drive: number) => {
        const U = (obj['U' + g.name] as (d: number) => number)(drive)
        const W = (obj['W' + g.name] as (d: number) => number)(drive)
        return Number.isFinite(U) && Number.isFinite(W) ? U + W : NaN
      }
    }
  }
  for (const p of spec.pistons) {
    obj['x' + p.name] = (drive: number) => read(drive)?.placed.find((pl) => pl.item === p)?.s0 ?? NaN
  }
  for (const h of spec.liquids) {
    obj['x' + h.name] = (drive: number) => read(drive)?.placed.find((pl) => pl.item === h)?.s0 ?? NaN
    obj['dz' + h.name] = (drive: number) => {
      const sol = read(drive)
      const pl = sol?.placed.find((x) => x.item === h)
      if (!pl) return NaN
      const geom = envAt(spec, scope, drive).geom
      return poseAt(geom, pl.s1).z - poseAt(geom, pl.s0).z
    }
  }
  const draw = (drive: number): TubeDraw => {
    const d = Number.isFinite(drive) ? Math.min(Math.max(drive, Math.min(from, to)), Math.max(from, to)) : from
    const sol = pastCut(engine, d) ? engine.samples[engine.samples.length - 1] : stateAt(engine, d)
    const env = envAt(spec, scope, sol?.drive ?? from)
    const stops: { s: number }[] = []
    for (const p of spec.pistons) {
      const lo = env.min.get(p)
      const hi = env.max.get(p)
      // stops are positions of the piston's start-side face; the upper jaw touches the other face.
      if (lo !== undefined) stops.push({ s: lo })
      if (hi !== undefined) stops.push({ s: hi + (env.len.get(p) ?? 0) })
    }
    return {
      units: spec.units,
      Ltot: env.geom.Ltot,
      p0: env.p0,
      start: spec.start,
      end: spec.end,
      axis: env.geom.segs.length ? [{ x: env.geom.segs[0].x0, z: env.geom.segs[0].z0 }, ...env.geom.segs.map((g) => ({ x: g.x0 + g.len * g.cos, z: g.z0 + g.len * g.sin }))] : [],
      pose: (ss: number) => poseAt(env.geom, ss),
      gases: spec.gases.map((g) => {
        const pl = sol?.placed.find((x) => x.item === g)
        return { name: g.name, s0: pl?.s0 ?? 0, s1: pl?.s1 ?? 0, p: sol?.gasP.get(g.name) ?? NaN, L: sol?.gasL.get(g.name) ?? NaN }
      }),
      liquids: spec.liquids.map((h) => {
        const pl = sol?.placed.find((x) => x.item === h)
        return { name: h.name, s0: pl?.s0 ?? 0, s1: pl?.s1 ?? 0 }
      }),
      pistons: spec.pistons.map((p) => {
        const pl = sol?.placed.find((x) => x.item === p)
        return { name: p.name, s0: pl?.s0 ?? 0, s1: pl?.s1 ?? 0, mass: env.mass.get(p) ?? 0 }
      }),
      stops,
      warnings: engine.warnings,
    }
  }
  Object.defineProperty(obj, '__tube', { value: { frame: draw, warnings: engine.warnings, cut: engine.cut }, enumerable: false })
  const values: Record<string, unknown> = { [name]: obj }
  for (const [k, v] of Object.entries(events)) values[k] = v
  // A lesson that names the stop expects the process to end there, so the stop is not a warning.
  const stop = typeof props.stop === 'string' ? props.stop : ''
  if (stop) values[stop] = engine.cut
  return { values, warnings: stop ? [] : engine.warnings, errors: [] }
}

function emptyObj(spec: Spec | null, _name: string): Record<string, unknown> {
  const obj: Record<string, unknown> = { from: NaN, to: NaN }
  if (spec) {
    for (const g of spec.gases) {
      for (const k of ['p', 'L', 'V', 'T', 'W', 'U', 'Q']) obj[k + g.name] = () => NaN
    }
  }
  Object.defineProperty(obj, '__tube', { value: { frame: () => null, warnings: [], cut: 0 }, enumerable: false })
  return obj
}

const GAS_KEYS = ['gas', 'L', 'p', 'T', 'Tnow', 'amount', 'cv']
const LIQ_KEYS = ['liquid', 'L', 'rho']
const PIS_KEYS = ['piston', 'm', 'thick', 'stops', 'force', 'leave', 'hit']

/** Structural problems (no scope needed) plus, when scope is passed, the initial balance and the run. */
export function gasTubeIssues(
  props: Record<string, unknown>,
  scope: Scope | undefined,
  declared: Set<string>,
  userNames: Set<string>,
  err: (m: string) => void,
  warn: (m: string) => void,
  expr: (value: unknown, where: string, extra?: string[]) => void,
  keysOnly: (obj: Record<string, unknown>, allowed: string[], where: string) => void,
): void {
  const own = new Set(gasTubeOutputs(props))
  const drive = isObj(props.drive) && typeof props.drive.name === 'string' ? props.drive.name : ''
  const tubeExpr = (value: unknown, where: string, more: string[] = []) => {
    if (typeof value === 'number' || value === undefined) return
    if (typeof value !== 'string') {
      err(`${where} 应为数字或表达式字符串`)
      return
    }
    const extra = [drive, ...more].filter(Boolean)
    try {
      for (const s of symbolsOf(value)) {
        if (extra.includes(s)) continue
        if (own.has(s)) err(`${where} 不能用本组件算出的名字 ${s}`)
        else if (!declared.has(s)) err(`${where} 引用了未声明的名字 ${s}：${value}`)
      }
    } catch (e) {
      err(`${where} 表达式无法解析：${value}（${(e as Error).message}）`)
    }
  }

  if (props.units !== undefined && props.units !== 'SI' && props.units !== 'cmHg') err(`units 只能是 SI 或 cmHg：${String(props.units)}`)
  if (props.start !== undefined && props.start !== 'closed' && props.start !== 'open') err('start 只能是 closed 或 open')
  if (props.end !== undefined && props.end !== 'closed' && props.end !== 'open') err('end 只能是 closed 或 open')
  const units: Units = props.units === 'cmHg' ? 'cmHg' : 'SI'
  const start: End = props.start === 'open' ? 'open' : 'closed'
  const end: End = props.end === 'open' ? 'open' : 'closed'

  if (!Array.isArray(props.path) || props.path.length === 0) err('path 至少要有一段')
  else {
    props.path.forEach((seg, i) => {
      if (!isObj(seg)) return err(`path[${i}] 应为 {length, angle}`)
      keysOnly(seg, ['length', 'angle'], `path[${i}]`)
      tubeExpr(seg.length, `path[${i}].length`)
      tubeExpr(seg.angle, `path[${i}].angle`)
      if (typeof seg.length === 'number' && !(seg.length > 0)) err(`path[${i}].length 应为正数`)
    })
  }
  for (const k of ['p0', 'g', 'S', 'gap'] as const) if (props[k] !== undefined) tubeExpr(props[k], k)
  if (units === 'SI' && props.S === undefined) err('SI 单位下必须写 S（横截面积，m²）')
  if (props.at !== undefined) expr(props.at, 'at')

  if (!isObj(props.drive)) err('drive 应为 {name, from, to}')
  else {
    keysOnly(props.drive, ['name', 'from', 'to', 'steps'], 'drive')
    if (!DRIVE_IDENT.test(drive)) err('drive.name 应为名字（过程变量，如 T、θ）')
    else if (userNames.has(drive)) err(`drive.name ${drive} 与已声明的名字重复`)
    tubeExpr(props.drive.from, 'drive.from')
    tubeExpr(props.drive.to, 'drive.to')
    if (typeof props.drive.from === 'number' && typeof props.drive.to === 'number' && props.drive.from === props.drive.to) err('drive.from 和 drive.to 不能相同')
    if (props.drive.steps !== undefined && (typeof props.drive.steps !== 'number' || props.drive.steps < 1)) err('drive.steps 应为正数')
  }

  const names: string[] = []
  if (!Array.isArray(props.contents) || props.contents.length === 0) err('contents 至少要有一段气柱、液柱或活塞')
  else {
    props.contents.forEach((raw, i) => {
      if (!isObj(raw)) return err(`contents[${i}] 应为对象`)
      const kind = ['gas', 'liquid', 'piston'].filter((k) => raw[k] !== undefined)
      if (kind.length !== 1) return err(`contents[${i}] 要在 gas、liquid、piston 里恰好写一个`)
      const where = `contents[${i}]`
      if (kind[0] === 'gas') {
        keysOnly(raw, GAS_KEYS, where)
        if (typeof raw.gas !== 'string' || !IDENT.test(raw.gas)) err(`${where}.gas 应为名字`)
        else names.push(raw.gas)
        tubeExpr(raw.L, `${where}.L`)
        if (raw.p !== undefined) tubeExpr(raw.p, `${where}.p`)
        if (raw.T !== undefined) tubeExpr(raw.T, `${where}.T`)
        if (raw.Tnow !== undefined) tubeExpr(raw.Tnow, `${where}.Tnow`)
        if (raw.amount !== undefined) tubeExpr(raw.amount, `${where}.amount`)
        if (raw.cv !== undefined) tubeExpr(raw.cv, `${where}.cv`)
        if (typeof raw.L === 'number' && !(raw.L > 0)) err(`${where}.L 应为正数`)
      } else if (kind[0] === 'liquid') {
        keysOnly(raw, LIQ_KEYS, where)
        if (typeof raw.liquid !== 'string' || !IDENT.test(raw.liquid)) err(`${where}.liquid 应为名字`)
        else names.push(raw.liquid)
        tubeExpr(raw.L, `${where}.L`)
        if (units === 'SI' && raw.rho === undefined) err(`液柱 ${String(raw.liquid)} 在 SI 单位下必须写 rho（密度，kg/m³）`)
        if (raw.rho !== undefined) tubeExpr(raw.rho, `${where}.rho`)
      } else {
        keysOnly(raw, PIS_KEYS, where)
        if (typeof raw.piston !== 'string' || !IDENT.test(raw.piston)) err(`${where}.piston 应为名字`)
        else names.push(raw.piston)
        if (units === 'cmHg') err('cmHg 模式下不能放活塞（水银柱用液柱表示；活塞只用于 SI）')
        if (raw.m !== undefined) tubeExpr(raw.m, `${where}.m`)
        if (raw.thick !== undefined) tubeExpr(raw.thick, `${where}.thick`)
        if (raw.force !== undefined) tubeExpr(raw.force, `${where}.force`, ['x' + String(raw.piston)])
        const pos = 'x' + String(raw.piston)
        if (pos === drive) err(`活塞 ${String(raw.piston)} 的位置名 ${pos} 与 drive 重名`)
        else if (userNames.has(pos)) err(`活塞位置名 ${pos} 与已声明的名字重复`)
        for (const ev of ['leave', 'hit'] as const) {
          if (raw[ev] === undefined) continue
          if (typeof raw[ev] !== 'string' || !IDENT.test(raw[ev] as string)) err(`${where}.${ev} 应为名字`)
        }
        if (raw.stops !== undefined) {
          if (!isObj(raw.stops)) err(`${where}.stops 应为 {min, max}`)
          else {
            keysOnly(raw.stops, ['min', 'max'], `${where}.stops`)
            if (raw.stops.min !== undefined) tubeExpr(raw.stops.min, `${where}.stops.min`)
            if (raw.stops.max !== undefined) tubeExpr(raw.stops.max, `${where}.stops.max`)
            if (typeof raw.stops.min === 'number' && typeof raw.stops.max === 'number' && !(raw.stops.min < raw.stops.max)) err(`活塞 ${String(raw.piston)} 的 stops.min 应小于 stops.max`)
          }
        }
      }
    })
  }
  const dup = names.filter((n, i) => names.indexOf(n) !== i)
  if (dup.length) err(`名字 ${[...new Set(dup)].join('、')} 重复`)
  if (Array.isArray(props.contents) && props.contents.length) {
    const first = props.contents[0]
    const last = props.contents[props.contents.length - 1]
    if (start === 'open' && isObj(first) && first.gas !== undefined) err(`开口端不能紧挨气柱（开口端外面是大气，第一段不能是气柱 ${String(first.gas)}）`)
    if (end === 'open' && isObj(last) && last.gas !== undefined) err(`开口端不能紧挨气柱（开口端外面是大气，最后一段不能是气柱 ${String(last.gas)}）`)
  }
  const outs = gasTubeOutputs(props)
  const outDup = outs.filter((n, i) => outs.indexOf(n) !== i)
  if (outDup.length) err(`发布的名字 ${[...new Set(outDup)].join('、')} 重复`)
  for (const n of outs) {
    if (!IDENT.test(n)) err(`发布的名字 ${n} 不合法`)
    else if (userNames.has(n)) err(`发布的名字 ${n} 与已声明的名字重复`)
  }
  if (typeof props.name === 'string' && !IDENT.test(props.name)) err('name 应为名字')

  if (!scope) return
  // Balance and the swept process need numbers. Skip them when the structure is already unusable.
  if (!specOf(props)) return
  try {
    const run = runGasTube(props, scope)
    for (const e of run.errors) err(e)
    if (!run.errors.length) for (const w of run.warnings) warn(w)
  } catch (e) {
    err(`初始参数下无法计算：${(e as Error).message}`)
  }
}
