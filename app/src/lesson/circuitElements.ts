// Ideal transformer, SPDT, current source and ideal diode for <Circuit>.
// The nodal solver stays in circuit.ts; this module stamps the extra unknowns
// (transformer currents), searches a consistent diode state, and walks the new
// schematic nodes. Steady values are rms; a battery (DC) plus a transformer is
// only a warning. In a transient the same transformer laws hold at each instant,
// and a diode's on/off state is a hidden flag flipped by events.

import { num, symbolsOf, type Scope } from './expr'
import type { MotionEvent } from './motion'
import type { CircuitResult, PartResult, SchematicNode, WiringPart, WiringWire } from './circuit'

export const DIODE_FLAG = (k: number) => `__d${k}`
const DIODE_I = (k: number) => `__dI${k}`
const DIODE_U = (k: number) => `__dU${k}`

const EPS_I = 1e-8
const EPS_U = 1e-5

type Node = SchematicNode & {
  spdt?: SchematicNode[]
  position?: number | string
  secondary?: SchematicNode
  secondaries?: { n?: number | string; load?: SchematicNode; label?: string; read?: unknown }[]
  I?: number | string
  n1?: number | string
  n2?: number | string
  reverse?: boolean
  on?: unknown
  diode?: number
  nu?: number | string
  lambda?: number | string
  W?: number | string
  Isat?: number | string
}

const asNode = (n: unknown): Node | null => (n && typeof n === 'object' && !Array.isArray(n) ? (n as Node) : null)

/** Child subtrees the series/parallel walkers also have to see. */
export function extensionChildren(node: SchematicNode): unknown[] {
  const n = asNode(node)
  if (!n) return []
  const out: unknown[] = []
  if (Array.isArray(n.spdt)) out.push(...n.spdt)
  if (n.secondary && typeof n.secondary === 'object') out.push(n.secondary)
  if (Array.isArray(n.secondaries)) for (const s of n.secondaries) if (s?.load) out.push(s.load)
  return out
}

export function extensionExprs(node: SchematicNode, out: unknown[]): void {
  const n = asNode(node)
  if (!n) return
  out.push(n.I, n.position, n.n1, n.n2, n.nu, n.lambda, n.W, n.Isat)
  if (Array.isArray(n.secondaries)) for (const s of n.secondaries) out.push(s?.n)
}

const mentionsT = (v: unknown) => {
  if (typeof v !== 'string') return false
  try {
    return symbolsOf(v).includes('t')
  } catch {
    return false
  }
}

/** True when an extension value (SPDT position, source current, …) depends on t. */
export function extensionDependsOnT(node: unknown): boolean {
  const n = asNode(node)
  if (!n) return false
  if (mentionsT(n.position) || mentionsT(n.I) || mentionsT(n.emf) || mentionsT(n.closed) || mentionsT(n.nu) || mentionsT(n.lambda) || mentionsT(n.W) || mentionsT(n.Isat)) return true
  if (Array.isArray(n.spdt) && n.spdt.some(extensionDependsOnT)) return true
  if (n.secondary && extensionDependsOnT(n.secondary)) return true
  if (Array.isArray(n.secondaries) && n.secondaries.some((s) => extensionDependsOnT(s?.load))) return true
  return false
}

export function readValueNames(read: unknown): string[] {
  if (typeof read === 'string') return [read]
  if (read && typeof read === 'object' && !Array.isArray(read)) {
    return Object.values(read as Record<string, unknown>).filter((v): v is string => typeof v === 'string')
  }
  return []
}

const spdtClosed = (pos: unknown, which: number): boolean | string => {
  if (typeof pos === 'number') return pos === which
  if (typeof pos === 'string') return `((${pos}) == ${which}) ? 1 : 0`
  return false
}

/** SPDT becomes two switched branches, so the existing switch-event machinery locates the throw. */
export function expandSpdt(node: SchematicNode | undefined): SchematicNode | undefined {
  const n = asNode(node)
  if (!n) return node
  const out: Node = { ...n }
  if (Array.isArray(n.series)) out.series = n.series.map((c) => expandSpdt(c)!)
  if (Array.isArray(n.parallel)) out.parallel = n.parallel.map((c) => expandSpdt(c)!)
  if (n.item) out.item = expandSpdt(n.item)
  if (n.secondary) out.secondary = expandSpdt(n.secondary as SchematicNode)
  if (Array.isArray(n.secondaries)) out.secondaries = n.secondaries.map((s) => ({ ...s, load: expandSpdt(s.load) }))
  if (Array.isArray(n.spdt)) {
    return {
      parallel: n.spdt.map((b, i) => ({
        series: [{ type: 'switch', closed: spdtClosed(n.position, i + 1) }, expandSpdt(b)!],
      })),
    }
  }
  return out
}

/** Number the diodes and point each `on` at a hidden 0/1 flag. Walk order matches the netlist. */
export function tagDiodes(node: SchematicNode | undefined, found: { n: number }): SchematicNode | undefined {
  const n = asNode(node)
  if (!n) return node
  const out: Node = { ...n }
  if (Array.isArray(n.series)) out.series = n.series.map((c) => tagDiodes(c, found)!)
  if (Array.isArray(n.parallel)) out.parallel = n.parallel.map((c) => tagDiodes(c, found)!)
  if (n.item) out.item = tagDiodes(n.item, found)
  if (n.secondary) out.secondary = tagDiodes(n.secondary as SchematicNode, found)
  if (Array.isArray(n.secondaries)) out.secondaries = n.secondaries.map((s) => ({ ...s, load: tagDiodes(s.load, found) }))
  if (n.type === 'diode') {
    const k = found.n++
    out.diode = k
    out.on = DIODE_FLAG(k)
  }
  return out
}

export function diodeEvents(count: number): MotionEvent[] {
  const out: MotionEvent[] = []
  for (let k = 0; k < count; k++) {
    // On → off when the forward current crosses zero downward; off → on when the forward voltage crosses zero upward.
    out.push(
      { when: `${DIODE_FLAG(k)} > 0.5 ? ${DIODE_I(k)} : -1`, dir: 'down', set: { [DIODE_FLAG(k)]: 0 } },
      { when: `${DIODE_FLAG(k)} > 0.5 ? -1 : ${DIODE_U(k)}`, dir: 'up', set: { [DIODE_FLAG(k)]: 1 } },
    )
  }
  return out
}

/** Forward current and voltage of every diode, so the switching events can watch them. */
export function publishDiodeProbes(parts: WiringPart[], solved: Record<string, PartResult>, sc: Scope): void {
  for (const p of parts) {
    if (p.type !== 'diode' || typeof p.diode !== 'number') continue
    const r = solved[p.id]
    const fwd = p.reverse === true ? -1 : 1
    sc[DIODE_I(p.diode)] = fwd * (r?.I ?? NaN)
    sc[DIODE_U(p.diode)] = fwd * (r?.U ?? NaN)
  }
}

export function stripDiodeOn(parts: WiringPart[]): WiringPart[] {
  return parts.map((p) => (p.type === 'diode' ? { ...p, on: undefined } : p))
}

interface EmitApi {
  parts: WiringPart[]
  join: (a: string, b: string) => void
  emit: (n: SchematicNode | undefined, keepRead: boolean, rev: boolean, vRev: boolean) => [string, string]
  keepRead: boolean
  rev: boolean
  labelOf: (n: SchematicNode) => string | undefined
}

const endsOf = (id: string, a: string, b: string, flip: boolean): [string, string] =>
  flip ? [`${id}.${b}`, `${id}.${a}`] : [`${id}.${a}`, `${id}.${b}`]

/** Maps a transformer's {U1,U2,I1,I2,P} onto the primary part (U,I,P) and the first winding (U,I). */
function splitTransformerRead(read: unknown): { primary?: Record<string, string>; first?: Record<string, string> } {
  if (!read || typeof read !== 'object' || Array.isArray(read)) {
    return typeof read === 'string' ? { primary: { I: read } } : {}
  }
  const r = read as Record<string, unknown>
  const primary: Record<string, string> = {}
  const first: Record<string, string> = {}
  if (typeof r.U1 === 'string') primary.U = r.U1
  if (typeof r.I1 === 'string') primary.I = r.I1
  if (typeof r.P === 'string') primary.P = r.P
  if (typeof r.U2 === 'string') first.U = r.U2
  if (typeof r.I2 === 'string') first.I = r.I2
  return {
    primary: Object.keys(primary).length ? primary : undefined,
    first: Object.keys(first).length ? first : undefined,
  }
}

function windingRead(read: unknown): Record<string, string> | undefined {
  if (!read || typeof read !== 'object' || Array.isArray(read)) return undefined
  const r = read as Record<string, unknown>
  const out: Record<string, string> = {}
  for (const k of ['U', 'I', 'P'] as const) if (typeof r[k] === 'string') out[k] = r[k]
  return Object.keys(out).length ? out : undefined
}

/**
 * Netlist for the new nodes. Returns null when `n` is an ordinary element.
 * A transformer's secondary loops are closed on themselves (no shared node).
 * An SPDT is two branches with complementary switches.
 */
export function emitExtension(n0: SchematicNode, api: EmitApi): [string, string] | null {
  const n = n0 as Node
  if (Array.isArray(n.spdt)) {
    const branches = n.spdt.map((b, i) => ({
      series: [{ type: 'switch', closed: spdtClosed(n.position, i + 1) }, b],
    }))
    return api.emit({ parallel: branches } as SchematicNode, api.keepRead, api.rev, api.rev)
  }
  if (n.type === 'currentSource') {
    const id = `e${api.parts.length}`
    const label = api.labelOf(n)
    const part: WiringPart = { id, type: 'currentSource', I: n.I, read: api.keepRead ? n.read : undefined }
    api.parts.push(label ? { ...part, label } : part)
    return endsOf(id, '+', '-', n.positive === 'right')
  }
  if (n.type === 'diode') {
    const id = `e${api.parts.length}`
    const label = api.labelOf(n)
    const part: WiringPart = {
      id,
      type: 'diode',
      reverse: n.reverse === true,
      on: n.on as boolean | string | undefined,
      diode: n.diode,
      read: api.keepRead ? n.read : undefined,
    }
    api.parts.push(label ? { ...part, label } : part)
    return endsOf(id, 'a', 'b', api.rev)
  }
  if (n.type === 'phototube') {
    const id = `e${api.parts.length}`
    const label = api.labelOf(n)
    const part: WiringPart = {
      id,
      type: 'phototube',
      nu: n.nu,
      lambda: n.lambda,
      W: n.W,
      Isat: n.Isat,
      reverse: n.reverse === true,
      read: api.keepRead ? n.read : undefined,
    }
    api.parts.push(label ? { ...part, label } : part)
    // Default: cathode K on the left, anode A on the right. reverse swaps them; the source rail flips too.
    return endsOf(id, 'K', 'A', api.rev !== (n.reverse === true))
  }
  if (n.type === 'transformer') {
    const id = `e${api.parts.length}`
    const label = api.labelOf(n)
    const split = api.keepRead ? splitTransformerRead(n.read) : {}
    const primary: WiringPart = { id, type: 'transformer', n1: n.n1, read: split.primary }
    api.parts.push(label ? { ...primary, label } : primary)
    const taps: Node['secondaries'] = Array.isArray(n.secondaries)
      ? n.secondaries
      : n.secondary
        ? [{ n: n.n2, load: n.secondary as SchematicNode }]
        : []
    taps.forEach((s, i) => {
      const wid = `e${api.parts.length}`
      const own = api.keepRead ? windingRead(s.read) : undefined
      const read = i === 0 ? { ...split.first, ...own } : own
      const w: WiringPart = { id: wid, type: 'winding', primary: id, n: s.n, read: read && Object.keys(read).length ? read : undefined }
      api.parts.push(s.label ? { ...w, label: s.label } : w)
      // rev = false: current out of the dotted terminal (a) into the load, left to right, is +I2.
      const load = api.emit(s.load, api.keepRead, false, false)
      api.join(`${wid}.a`, load[0])
      api.join(`${wid}.b`, load[1])
    })
    return endsOf(id, 'a', 'b', api.rev)
  }
  return null
}

// ---------- modified nodal analysis for ideal transformers ----------
// U_k = (n_k/n1)·U1 and n1·I1 = Σ n_k·I_k. I1 enters the primary's `a` terminal;
// I_k leaves the winding's `a` terminal into its load. Each loop already has its
// own ground, so the voltage constraints only relate differences.

export interface TLink {
  primaryId: string
  n1: number
  pa: string
  pb: string
  secs: { id: string; n: number; a: string; b: string }[]
}

export function transformerLinks(parts: WiringPart[], nodeOf: (id: string, term: string) => string, scope: Scope, warnings: string[]): TLink[] {
  const windings = parts.filter((p) => p.type === 'winding')
  const out: TLink[] = []
  for (const p of parts) {
    if (p.type !== 'transformer') continue
    const n1 = num(p.n1 as number | string | undefined, scope, NaN)
    const secs = windings
      .filter((w) => w.primary === p.id)
      .map((w) => ({ id: w.id, n: num(w.n as number | string | undefined, scope, NaN), a: nodeOf(w.id, 'a'), b: nodeOf(w.id, 'b') }))
    if (!(n1 > 0) || secs.length === 0 || secs.some((s) => !(s.n > 0))) {
      warnings.push(`${p.label ?? p.id} 的匝数必须是正数，并且至少要有一个副线圈`)
      continue
    }
    out.push({ primaryId: p.id, n1, pa: nodeOf(p.id, 'a'), pb: nodeOf(p.id, 'b'), secs })
  }
  return out
}

export const transformerUnknowns = (links: TLink[]) => links.reduce((s, link) => s + 1 + link.secs.length, 0)

/** Appends transformer current unknowns and their voltage / ampere-turn rows. `colOf` is undefined for a ground node. */
export function stampTransformers(A: number[][], links: TLink[], colOf: (node: string) => number | undefined, nV: number): void {
  let base = nV
  const putV = (row: number, node: string, coeff: number) => {
    const c = colOf(node)
    if (c !== undefined && coeff) A[row][c] += coeff
  }
  for (const link of links) {
    const k = link.secs.length
    const ia = colOf(link.pa)
    const ib = colOf(link.pb)
    if (ia !== undefined) A[ia][base] += 1
    if (ib !== undefined) A[ib][base] -= 1
    link.secs.forEach((s, i) => {
      const cI = base + 1 + i
      const ic = colOf(s.a)
      const id = colOf(s.b)
      if (ic !== undefined) A[ic][cI] -= 1
      if (id !== undefined) A[id][cI] += 1
      const row = base + i
      const ratio = s.n / link.n1
      putV(row, s.a, 1)
      putV(row, s.b, -1)
      putV(row, link.pa, -ratio)
      putV(row, link.pb, ratio)
    })
    const aRow = base + k
    A[aRow][base] += link.n1
    link.secs.forEach((s, i) => (A[aRow][base + 1 + i] -= s.n))
    base += 1 + k
  }
}

export function applyTransformers(
  out: Record<string, PartResult>,
  x: number[] | null,
  links: TLink[],
  nV: number,
  V: (node: string) => number,
): void {
  if (!x) return
  let base = nV
  for (const link of links) {
    const I1 = x[base] ?? 0
    const U1 = V(link.pa) - V(link.pb)
    const primary = out[link.primaryId]
    if (primary) Object.assign(primary, { U: U1, I: I1, P: U1 * I1 })
    link.secs.forEach((s, i) => {
      const I = x[base + 1 + i] ?? 0
      const U = V(s.a) - V(s.b)
      const r = out[s.id]
      if (r) Object.assign(r, { U, I, P: U * I })
    })
    base += 1 + link.secs.length
  }
}

/** Ideal on-state drop is exactly zero; an off diode is an open whose voltage is read off the nodes. */
export function finishDiodes(
  parts: WiringPart[],
  out: Record<string, PartResult>,
  scope: Scope,
  voltage: (id: string) => number,
): void {
  for (const p of parts) {
    if (p.type !== 'diode') continue
    const r = out[p.id]
    if (!r) continue
    const on = p.on === undefined ? true : typeof p.on === 'boolean' ? p.on : typeof p.on === 'number' ? p.on !== 0 : num(p.on as string, scope, 1) !== 0
    if (on) {
      r.U = 0
      r.P = 0
    } else {
      r.I = 0
      r.U = voltage(p.id)
      r.P = 0
    }
  }
}

type SolveFn = (parts: WiringPart[], wires: WiringWire[], scope: Scope, memory?: Record<string, number>) => CircuitResult

/**
 * Piecewise-linear ideal diodes. Starts with every diode on and flips the worst
 * violator (on but I_forward < 0, or off but U_forward > 0) until the state is
 * consistent. `solve` must honour a boolean `on` and must not search again.
 */
export function solveIdealDiodes(parts: WiringPart[], wires: WiringWire[], scope: Scope, memory: Record<string, number> | undefined, solve: SolveFn): CircuitResult {
  const diodes = parts.filter((p) => p.type === 'diode')
  const state = diodes.map(() => true)
  const seen = new Set<string>()
  let last: CircuitResult | null = null
  const limit = Math.min(32, diodes.length * 4 + 2)
  for (let iter = 0; iter < limit; iter++) {
    const key = state.map((s) => (s ? '1' : '0')).join('')
    if (seen.has(key)) break
    seen.add(key)
    const trial = parts.map((p) => (p.type === 'diode' ? { ...p, on: state[diodes.findIndex((d) => d.id === p.id)] } : p))
    const res = solve(trial, wires, scope, memory)
    last = res
    const singular = res.warnings.some((w) => w.includes('无解'))
    let worst = -1
    let worstBad = 0
    diodes.forEach((d, i) => {
      const r = res.parts[d.id]
      if (!r) return
      const fwd = d.reverse === true ? -1 : 1
      let bad = 0
      if (singular) bad = 1e3
      else if (state[i] && fwd * r.I < -EPS_I) bad = -fwd * r.I
      else if (!state[i] && fwd * r.U > EPS_U) bad = fwd * r.U
      if (bad > worstBad) {
        worstBad = bad
        worst = i
      }
    })
    if (worst < 0) return { ...res, diodeOn: Object.fromEntries(diodes.map((d, i) => [d.id, state[i]])) }
    state[worst] = !state[worst]
  }
  const failed = last ?? { parts: {}, warnings: [] }
  return { ...failed, warnings: [...failed.warnings, '二极管没有一致的通断状态'], diodeOn: Object.fromEntries(diodes.map((d, i) => [d.id, state[i]])) }
}

// ---------- validator ----------

export interface WalkCtx {
  err: (message: string) => void
  expr: (value: unknown, where: string, extra?: string[]) => void
  keysOnly: (obj: Record<string, unknown>, allowed: string[], where: string) => void
  valueNames: string[]
  displayNames?: string[]
  blocked?: Set<string>
}

const checkExpr = (value: unknown, where: string, ctx: WalkCtx) => {
  if (typeof value === 'string' && ctx.blocked?.size) {
    try {
      const bad = symbolsOf(value).filter((s) => ctx.blocked!.has(s))
      if (bad.length) {
        ctx.err(`${where} 不能用 ${bad.join('、')}：电路在受力之前求解，读不到加速度、支持力、拉力或电路自己读数的当前值（这里只能用 t 和状态量）`)
        return
      }
    } catch {
      // expr reports the parse error
    }
  }
  ctx.expr(value, where, ctx.valueNames)
}

const TRANSFORMER_READ = new Set(['U1', 'U2', 'I1', 'I2', 'P'])
const WINDING_READ = new Set(['U', 'I', 'P'])

/**
 * SPDT, and the extra checks on transformer / current source / diode.
 * Returns true when the node was fully handled (SPDT). Element nodes return
 * false so the ordinary element checks still run; call {@link afterElement}
 * for those.
 */
export function walkSpdt(n: Record<string, unknown>, at: string, repeated: boolean, ctx: WalkCtx, visit: (cur: unknown, at: string, repeated: boolean) => void): boolean {
  if (!('spdt' in n)) return false
  ctx.keysOnly(n, ['spdt', 'label', 'position', 'note'], at)
  if (!Array.isArray(n.spdt) || n.spdt.length !== 2) ctx.err(`${at}.spdt 应为两个支路 [支路1, 支路2]`)
  else {
    if (repeated) ctx.err(`${at}：单刀双掷开关不能放在 repeat 里，逐个写出来`)
    if (n.position === undefined) ctx.err(`${at} 要写 position：1 接通第一支路，2 接通第二支路，0 断开；暂态里可以写成 t 的表达式`)
    else if (typeof n.position === 'number') {
      if (n.position !== 0 && n.position !== 1 && n.position !== 2) ctx.err(`${at}.position 只能是 0、1 或 2`)
    } else checkExpr(n.position, `${at}.position`, ctx)
    n.spdt.forEach((b, i) => visit(b, `${at}.spdt[${i}]`, repeated))
  }
  if (n.note !== undefined) ctx.expr((n.note as Record<string, unknown>)?.expr, `${at}.note.expr`, ctx.displayNames ?? ctx.valueNames)
  return true
}

/** Requirements that the generic element walk cannot see (nested secondary loops, required fields). */
export function afterElement(
  n: Record<string, unknown>,
  at: string,
  repeated: boolean,
  ctx: WalkCtx,
  visit: (cur: unknown, at: string, repeated: boolean) => void,
  addRead: (name: string) => void,
): void {
  const type = String(n.type)
  if (type === 'currentSource') {
    if (n.I === undefined) ctx.err(`${at} 要写电流 I（方向与电池正极相同，positive 默认 left）`)
    if (n.positive !== undefined && n.positive !== 'left' && n.positive !== 'right') ctx.err(`${at}.positive 只能是 left 或 right`)
  }
  if (type === 'diode') {
    if (n.reverse !== undefined && typeof n.reverse !== 'boolean') ctx.err(`${at}.reverse 应为 true 或 false（true 时沿树的反方向导通）`)
    if (repeated) ctx.err(`${at}：二极管在 repeat 里会随只数复制，读数和通断都对不上，请逐个写出来`)
  }
  if (type === 'phototube') {
    const hasNu = n.nu !== undefined
    const hasLam = n.lambda !== undefined
    if (hasNu === hasLam) ctx.err(`${at} 要写 nu（入射光频率，Hz）或 lambda（波长，nm）其中一个`)
    if (n.W === undefined) ctx.err(`${at} 要写逸出功 W（eV）`)
    if (n.Isat === undefined) ctx.err(`${at} 要写饱和光电流 Isat（A）`)
    for (const k of ['nu', 'lambda', 'W', 'Isat'] as const) if (n[k] !== undefined) checkExpr(n[k], `${at}.${k}`, ctx)
    if (typeof n.nu === 'number' && !(n.nu > 0)) ctx.err(`${at}.nu 应为正数（频率，单位 Hz）`)
    if (typeof n.lambda === 'number' && !(n.lambda > 0)) ctx.err(`${at}.lambda 应为正数（波长，单位 nm）`)
    if (typeof n.W === 'number' && !(n.W > 0)) ctx.err(`${at}.W 应为正数（逸出功，单位 eV）`)
    if (typeof n.Isat === 'number' && !(n.Isat > 0)) ctx.err(`${at}.Isat 应为正数（饱和光电流，单位 A）`)
    if (n.reverse !== undefined && typeof n.reverse !== 'boolean') ctx.err(`${at}.reverse 应为 true 或 false（true 时阳极在左、阴极在右）`)
    if (repeated) ctx.err(`${at}：光电管不能放在 repeat 里，逐个写出来`)
  }
  if (type === 'transformer') {
    if (repeated) ctx.err(`${at}：变压器不能放在 repeat 里`)
    const taps = Array.isArray(n.secondaries)
    const single = n.secondary !== undefined || n.n2 !== undefined
    if (taps && single) ctx.err(`${at}：多个副线圈写 secondaries，不要再写 n2 和 secondary`)
    if (!taps && (n.secondary === undefined || n.n2 === undefined)) ctx.err(`${at} 要写 n1、n2 和 secondary（副线圈回路），或多个副线圈 secondaries: [{n, load}]`)
    if (n.n1 === undefined) ctx.err(`${at} 要写原线圈匝数 n1`)
    for (const k of ['n1', 'n2'] as const) {
      if (typeof n[k] === 'number' && !(n[k] as number > 0)) ctx.err(`${at}.${k} 应为正数`)
    }
    if (n.read !== undefined && typeof n.read === 'object' && !Array.isArray(n.read)) {
      for (const q of Object.keys(n.read as object)) if (!TRANSFORMER_READ.has(q)) ctx.err(`${at}.read 的 ${q} 不合法（变压器可读 U1、U2、I1、I2、P；U2、I2 是第一个副线圈）`)
    }
    if (n.secondary !== undefined) visit(n.secondary, `${at}.secondary`, repeated)
    if (taps) {
      ;(n.secondaries as Record<string, unknown>[]).forEach((s, i) => {
        const w = `${at}.secondaries[${i}]`
        if (!s || typeof s !== 'object' || Array.isArray(s)) return ctx.err(`${w} 应为 {n, load}`)
        ctx.keysOnly(s, ['n', 'load', 'label', 'read'], w)
        if (s.n === undefined) ctx.err(`${w} 要写匝数 n`)
        else {
          checkExpr(s.n, `${w}.n`, ctx)
          if (typeof s.n === 'number' && !(s.n > 0)) ctx.err(`${w}.n 应为正数`)
        }
        if (s.load === undefined) ctx.err(`${w} 要写 load（这个副线圈的回路）`)
        else visit(s.load, `${w}.load`, repeated)
        if (s.read !== undefined) {
          const names = readValueNames(s.read)
          const ok = s.read && typeof s.read === 'object' && !Array.isArray(s.read) && Object.entries(s.read as Record<string, unknown>).every(([q, v]) => WINDING_READ.has(q) && typeof v === 'string')
          if (!ok) ctx.err(`${w}.read 写成 { U: "名字", I: "名字", P: "名字" }`)
          for (const name of names) addRead(name)
        }
      })
    }
  }
}

const chainOf = (n: unknown): Node[] => {
  const node = asNode(n)
  if (!node) return []
  if (Array.isArray(node.series)) return node.series.flatMap((c) => chainOf(c))
  return [node]
}

const walkChains = (chain: Node[], where: string, integrating: boolean, err: (m: string) => void) => {
  const sources = chain.filter((n) => n.type === 'currentSource')
  if (sources.length >= 2) {
    const vals = sources.map((s) => (typeof s.I === 'number' ? s.I : NaN))
    if (vals.every((v) => Number.isFinite(v)) && Math.max(...vals) - Math.min(...vals) > 1e-6) {
      err(`${where}：串联的电流源电流不相等（${vals.join('、')}），电路无解`)
    }
  }
  if (!integrating && sources.length) {
    const openSwitch = chain.some((n) => n.type === 'switch' && (n.closed === false || n.closed === 'false' || (n.closed as unknown) === 0))
    const cap = chain.some((n) => n.type === 'capacitor')
    if (openSwitch || cap) err(`${where}：电流源与${openSwitch ? '断开的开关' : '电容'}串联，稳恒电路里没有通路`)
  }
  for (const n of chain) {
    if (Array.isArray(n.parallel)) n.parallel.forEach((b, i) => walkChains(chainOf(b), `${where} 的并联支路 ${i + 1}`, integrating, err))
    if (Array.isArray(n.spdt)) n.spdt.forEach((b, i) => walkChains(chainOf(b), `${where} 的单刀双掷支路 ${i + 1}`, integrating, err))
    if (n.secondary) walkChains(chainOf(n.secondary), `${where} 的副线圈`, integrating, err)
    if (Array.isArray(n.secondaries)) n.secondaries.forEach((s, i) => walkChains(chainOf(s.load), `${where} 的副线圈 ${i + 1}`, integrating, err))
    if (n.item) walkChains(chainOf(n.item), where, integrating, err)
  }
}

/** Series conflicts that span source and load (one loop) or sit inside one branch. */
export function checkSourceChains(source: unknown, load: unknown, integrating: boolean, err: (m: string) => void): void {
  walkChains([...chainOf(source), ...chainOf(load)], '电路', integrating, err)
}

const hasType = (n: unknown, type: string): boolean => {
  const node = asNode(n)
  if (!node) return false
  if (node.type === type) return true
  const kids = [...(node.series ?? []), ...(node.parallel ?? []), ...(node.item ? [node.item] : []), ...extensionChildren(node)]
  return kids.some((c) => hasType(c, type))
}

/** Steady rms solve is allowed, but a battery cannot actually drive an ideal transformer. */
export function transformerDcWarning(source: unknown, load: unknown, steady: boolean): string | null {
  if (!steady) return null
  if (!hasType(source, 'transformer') && !hasType(load, 'transformer')) return null
  if (!hasType(source, 'battery') && !hasType(load, 'battery')) return null
  return '理想变压器只改变交流，数值按有效值求解；电源是电池（直流）时变压器不能传递功率，请改用 generator 或写成交流电动势'
}

export function usesLadderBlock(node: unknown): boolean {
  const n = asNode(node)
  if (!n) return false
  if (n.type === 'transformer' || Array.isArray(n.spdt)) return true
  const kids = [...(n.series ?? []), ...(n.parallel ?? []), ...(n.item ? [n.item] : []), ...extensionChildren(n)]
  return kids.some(usesLadderBlock)
}
