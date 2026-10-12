// DC circuit solver for <Wiring>: the lesson describes the parts and which posts the
// wires join; meter readings, lamp brightness and every part's current and voltage
// come from nodal analysis of that actual wiring. Ideal wires and closed switches
// merge posts into one node; every part is a conductance, a battery is its Norton
// equivalent (EMF/r in parallel with 1/r).

import { num, type Scope } from './expr'
import { galvCommon, galvTerminalList } from './instruments'
import { applyTransformers, emitExtension, extensionChildren, finishDiodes, solveIdealDiodes, stampTransformers, transformerLinks, transformerUnknowns } from './circuitElements'
import { finishPhototubes, lawFromPart, photoStamp, solvePhototubes, type PhotoSeg } from './phototube'

export const WIRING_TYPES = ['battery', 'switch', 'ammeter', 'voltmeter', 'galvanometer', 'rheostat', 'resistor', 'resistanceBox', 'lamp'] as const
export type WiringType = (typeof WIRING_TYPES)[number]

export const METER_RANGES: Record<string, number[]> = { ammeter: [0.6, 3], voltmeter: [3, 15] }

/** Terminal names of a wiring part; meters expose '-' plus one terminal per range. Galvanometer posts default to '+' and '-', or the names in `terminals`. */
export function wiringTerminals(type: string, ranges?: unknown, terminals?: unknown): string[] {
  switch (type) {
    case 'battery':
    case 'currentSource':
      return ['+', '-']
    case 'galvanometer':
      return galvTerminalList(terminals)
    case 'ammeter':
    case 'voltmeter': {
      const r = Array.isArray(ranges) && ranges.length && ranges.every((x) => typeof x === 'number' && x > 0) ? (ranges as number[]) : METER_RANGES[type]
      return ['-', ...r.map(String)]
    }
    case 'rheostat':
      return ['A', 'B', 'C', 'D']
    case 'phototube':
      return ['A', 'K']
    default:
      return ['a', 'b']
  }
}

/** Parts with memory, only produced from schematics: their state (U_C, I_L) is integrated over time. */
export type StorageType = 'capacitor' | 'inductor'
/** Schematic-only parts: current source, ideal diode, phototube, ideal transformer and one secondary winding. */
export type SchematicPartType = 'currentSource' | 'diode' | 'phototube' | 'transformer' | 'winding'

export interface WiringPart {
  id: string
  type: WiringType | StorageType | SchematicPartType
  label?: string
  ranges?: number[]
  emf?: number | string
  r?: number | string
  R?: number | string
  full?: number | string
  power?: number | string
  value?: number | string
  slider?: number | string
  closed?: boolean | string
  lit?: number | string
  read?: string | Record<string, string>
  /** Drawn in a <Circuit>: a wire across this battery is the author's loop (a rod joined by a wire), not a wiring slip. */
  schematic?: boolean
  [k: string]: unknown
}

export interface WiringWire {
  from: string
  to: string
  answer?: boolean
  when?: string
  [k: string]: unknown
}

export interface PartResult {
  /** Current through the part (A): meters and batteries positive in normal use, others from a to b / A to B. */
  I: number
  /** Voltage across the part (V): battery terminal voltage, meter reading for voltmeters, Va − Vb otherwise. */
  U: number
  P: number
  /** Meter reading in its own unit (A or V); galvanometer: current in A. */
  reading?: number
  /** Range terminal that is actually wired (meters). */
  range?: number
  /** Galvanometer deflection as a fraction of full scale (−1…1). */
  deflect?: number
  /** Lamp brightness 0…1 (P / rated power). */
  lit?: number
  /** Capacitor charge C·U (C). */
  Q?: number
  /** Transient only: dU/dt of a capacitor, dI/dt of an inductor. */
  rate?: number
  /** Phototube stopping voltage (V) and maximum photoelectron kinetic energy (eV). */
  Uc?: number
  Ek?: number
  wired: boolean
}

export interface CircuitResult {
  parts: Record<string, PartResult>
  warnings: string[]
  /** Set by the ideal-diode search: part id → conducting. */
  diodeOn?: Record<string, boolean>
}

const MIN_R = 1e-6

export function boolOf(v: unknown, scope: Scope, fallback: boolean): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0
  if (typeof v === 'string') {
    const x = num(v, scope, NaN)
    return Number.isFinite(x) ? x !== 0 : fallback
  }
  return fallback
}

export const splitEnd = (ref: string): [string, string] => {
  const i = ref.indexOf('.')
  return i < 0 ? [ref, ''] : [ref.slice(0, i), ref.slice(i + 1).replace('−', '-').trim()]
}

/** Wires whose `when` holds, in written order. */
export function activeWires(wires: WiringWire[], scope: Scope): WiringWire[] {
  return wires.filter((w) => w.when === undefined || boolOf(w.when, scope, true))
}

/** Wires that are physically in the circuit: all active ones, or the first `steps` of them. */
export function connectedWires(wires: WiringWire[], steps: string | null, scope: Scope): WiringWire[] {
  const active = activeWires(wires, scope)
  if (!steps) return active
  const done = Math.max(0, Math.min(active.length, Math.round(num(steps, scope, active.length))))
  return active.slice(0, done)
}

/** The solver runs once any battery states its EMF; otherwise meters keep their hand-written values. */
export const solves = (parts: WiringPart[]) => parts.some((p) => p.type === 'battery' && p.emf !== undefined)

class UnionFind {
  private parent = new Map<string, string>()
  find(a: string): string {
    let p = this.parent.get(a) ?? a
    if (p === a) return a
    p = this.find(p)
    this.parent.set(a, p)
    return p
  }
  union(a: string, b: string) {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra !== rb) this.parent.set(ra, rb)
  }
}

interface Element {
  a: string
  b: string
  g: number
  /** Norton source current pushed from b to a inside the element (battery). */
  j: number
}

/** Gaussian elimination with partial pivoting; returns null for a singular system. */
function solveLinear(A: number[][], b: number[]): number[] | null {
  const n = b.length
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r
    if (Math.abs(A[p][c]) < 1e-300) return null
    ;[A[c], A[p]] = [A[p], A[c]]
    ;[b[c], b[p]] = [b[p], b[c]]
    for (let r = c + 1; r < n; r++) {
      const k = A[r][c] / A[c][c]
      if (!k) continue
      for (let q = c; q < n; q++) A[r][q] -= k * A[c][q]
      b[r] -= k * b[c]
    }
  }
  const x = new Array(n).fill(0)
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r]
    for (let q = r + 1; q < n; q++) s -= A[r][q] * x[q]
    x[r] = s / A[r][r]
  }
  return x
}

const nameOf = (p: WiringPart) => p.label ?? p.id
const resistance = (v: unknown, scope: Scope, fallback: number) => Math.max(MIN_R, num(v as number | string | undefined, scope, fallback))

/**
 * Without `memory` this is the DC steady state: a capacitor passes no current, an
 * inductor is just its winding resistance r. With `memory` (part id → capacitor
 * voltage or inductor current at this instant) a capacitor is a voltage source U_C
 * and an inductor a current source I_L; the results then carry dU_C/dt = I/C and
 * dI_L/dt = (U − r·I)/L for the transient integrator.
 */
export function solveWiring(parts: WiringPart[], wires: WiringWire[], scope: Scope, memory?: Record<string, number>): CircuitResult {
  // A diode with no chosen state is searched; a preset `on` (the transient flag) is honoured below.
  if (parts.some((p) => p.type === 'diode' && p.on === undefined)) return solveIdealDiodes(parts, wires, scope, memory, solveWiring)
  // A phototube's segment is searched the same way. The law has no memory, so a transient repeats this at each instant.
  if (parts.some((p) => p.type === 'phototube' && p.segment === undefined)) return solvePhototubes(parts, wires, scope, memory, solveWiring)
  const uf = new UnionFind()
  const warnings: string[] = []
  const key = (id: string, t: string) => `${id}.${t}`
  const posts = new Set<string>()
  for (const p of parts) for (const t of wiringTerminals(p.type, p.ranges, p.terminals)) posts.add(key(p.id, t))

  const touched = new Set<string>()
  for (const w of wires) {
    const [ia, ta] = splitEnd(String(w.from))
    const [ib, tb] = splitEnd(String(w.to))
    const ka = key(ia, ta)
    const kb = key(ib, tb)
    if (!posts.has(ka) || !posts.has(kb)) continue
    touched.add(ka)
    touched.add(kb)
    uf.union(ka, kb)
  }
  for (const p of parts) {
    if (p.type === 'switch' && boolOf(p.closed, scope, false)) uf.union(key(p.id, 'a'), key(p.id, 'b'))
    // The slider bar (C–D) is one piece of metal touching the coil at the slider.
    if (p.type === 'rheostat') {
      uf.union(key(p.id, 'C'), key(p.id, 'S'))
      uf.union(key(p.id, 'D'), key(p.id, 'S'))
    }
  }

  const elems: { part: WiringPart; role: string; e: Element }[] = []
  const push = (part: WiringPart, role: string, a: string, b: string, R: number, emf = 0) =>
    elems.push({ part, role, e: { a: uf.find(a), b: uf.find(b), g: 1 / R, j: emf / R } })
  /** Batteries whose posts are joined by wire: with an internal resistance each is a loop of its own, I = E/r. */
  const shorted: { part: WiringPart; I: number }[] = []
  const transient = !!memory
  const wiredRange = (p: WiringPart) =>
    wiringTerminals(p.type, p.ranges)
      .slice(1)
      .find((t) => touched.has(key(p.id, t)))

  for (const p of parts) {
    switch (p.type) {
      case 'battery': {
        if (uf.find(key(p.id, '+')) === uf.find(key(p.id, '-'))) {
          const r = num(p.r, scope, 0)
          if (!(r > MIN_R)) {
            warnings.push(`${nameOf(p)} 的正负极被导线直接连在一起（短路）`)
            break
          }
          const I = num(p.emf, scope, 0) / r
          shorted.push({ part: p, I })
          if (!p.schematic) warnings.push(`${nameOf(p)} 的正负极被导线直接连在一起（短路），电流只受内阻限制：E/r ≈ ${+I.toPrecision(3)} A`)
          break
        }
        push(p, 'src', key(p.id, '+'), key(p.id, '-'), resistance(p.r, scope, 0), num(p.emf, scope, 0))
        break
      }
      case 'ammeter':
      case 'voltmeter': {
        const t = wiredRange(p)
        if (!t) break
        const ideal = p.type === 'ammeter' ? 0 : Infinity
        const R = num(p.r, scope, ideal)
        if (Number.isFinite(R)) push(p, 'meter', key(p.id, t), key(p.id, '-'), Math.max(MIN_R, R))
        break
      }
      case 'galvanometer': {
        // Extra posts (G0, G1, …) are alternate entries to the same movement; '-' is the common return.
        const names = wiringTerminals(p.type, p.ranges, p.terminals)
        const common = galvCommon(names)
        const hot = names.find((t) => t !== common && touched.has(key(p.id, t))) ?? names.find((t) => t !== common) ?? common
        push(p, 'meter', key(p.id, hot), key(p.id, common), resistance(p.r, scope, 0))
        break
      }
      case 'rheostat': {
        const R = resistance(p.R, scope, 20)
        const s = Math.max(0, Math.min(1, num(p.slider, scope, 0.5)))
        push(p, 'AS', key(p.id, 'A'), key(p.id, 'S'), Math.max(MIN_R, s * R))
        push(p, 'SB', key(p.id, 'S'), key(p.id, 'B'), Math.max(MIN_R, (1 - s) * R))
        break
      }
      case 'resistor':
      case 'lamp':
        push(p, 'R', key(p.id, 'a'), key(p.id, 'b'), resistance(p.R, scope, 10))
        break
      case 'resistanceBox':
        push(p, 'R', key(p.id, 'a'), key(p.id, 'b'), resistance(p.value, scope, 0))
        break
      case 'capacitor':
        if (transient) push(p, 'C', key(p.id, 'a'), key(p.id, 'b'), MIN_R, memory[p.id] ?? 0)
        break
      case 'inductor':
        if (transient) elems.push({ part: p, role: 'L', e: { a: uf.find(key(p.id, 'a')), b: uf.find(key(p.id, 'b')), g: 0, j: -(memory[p.id] ?? 0) } })
        else push(p, 'R', key(p.id, 'a'), key(p.id, 'b'), resistance(p.r, scope, 0))
        break
      case 'currentSource':
        // j is the Norton current into the + terminal, so the reported source current (out of +) is +I.
        elems.push({ part: p, role: 'I', e: { a: uf.find(key(p.id, '+')), b: uf.find(key(p.id, '-')), g: 0, j: num(p.I as number | string | undefined, scope, 0) } })
        break
      case 'diode':
        // On: a short (zero drop is imposed on the reported voltage). Off: an open, voltage read from the nodes.
        if (boolOf(p.on, scope, true)) push(p, 'D', key(p.id, 'a'), key(p.id, 'b'), MIN_R)
        break
      case 'phototube': {
        // a = anode, b = cathode, so the solved U is U_AK and I is the photocurrent.
        const stamp = photoStamp((p.segment as PhotoSeg | undefined) ?? 'cut', lawFromPart(p, scope))
        if (stamp) elems.push({ part: p, role: 'P', e: { a: uf.find(key(p.id, 'A')), b: uf.find(key(p.id, 'K')), g: stamp.g, j: stamp.j } })
        break
      }
      case 'transformer':
      case 'winding':
        // Keeps the terminals in the node set; the current itself is an extra MNA unknown.
        elems.push({ part: p, role: 'xfmr', e: { a: uf.find(key(p.id, 'a')), b: uf.find(key(p.id, 'b')), g: 0, j: 0 } })
        break
    }
  }

  // Nodes, connected components (each gets its own ground), then G·V = J.
  const nodes = [...new Set(elems.flatMap(({ e }) => [e.a, e.b]))]
  const index = new Map(nodes.map((n, i) => [n, i]))
  const adj: number[][] = nodes.map(() => [])
  for (const { e } of elems) {
    const i = index.get(e.a)!
    const k = index.get(e.b)!
    if (i !== k) {
      adj[i].push(k)
      adj[k].push(i)
    }
  }
  const comp = new Array(nodes.length).fill(-1)
  const grounds: number[] = []
  const negPosts = new Set(parts.filter((p) => p.type === 'battery').map((p) => uf.find(key(p.id, '-'))))
  for (let s = 0; s < nodes.length; s++) {
    if (comp[s] >= 0) continue
    const members: number[] = []
    const stack = [s]
    comp[s] = grounds.length
    while (stack.length) {
      const v = stack.pop()!
      members.push(v)
      for (const u of adj[v]) if (comp[u] < 0) ((comp[u] = grounds.length), stack.push(u))
    }
    grounds.push(members.find((m) => negPosts.has(nodes[m])) ?? members[0])
  }
  const isGround = new Set(grounds)
  const free = nodes.map((_, i) => i).filter((i) => !isGround.has(i))
  const col = new Map(free.map((n, i) => [n, i]))
  const links = transformerLinks(parts, (id, term) => uf.find(key(id, term)), scope, warnings)
  const nX = transformerUnknowns(links)
  const nV = free.length
  const N = nV + nX
  const A = Array.from({ length: N }, () => new Array(N).fill(0))
  const J = new Array(N).fill(0)
  for (const { e } of elems) {
    const ia = col.get(index.get(e.a)!)
    const ib = col.get(index.get(e.b)!)
    if (ia !== undefined) {
      A[ia][ia] += e.g
      J[ia] += e.j
      if (ib !== undefined) A[ia][ib] -= e.g
    }
    if (ib !== undefined) {
      A[ib][ib] += e.g
      J[ib] -= e.j
      if (ia !== undefined) A[ib][ia] -= e.g
    }
  }
  if (nX) stampTransformers(A, links, (node) => col.get(index.get(node)!), nV)
  const x = N ? solveLinear(A, J) : []
  if (!x)
    warnings.push(
      transient && parts.some((p) => p.type === 'inductor')
        ? '电路方程无解：线圈的电流没有通路（断开线圈所在电路时要给它留一条回路，例如并联的灯泡；否则实际会产生电火花）'
        : parts.some((p) => p.type === 'currentSource')
          ? '电路方程无解：电流源没有通路，或串联的电流源电流不相等'
          : '电路方程无解（检查是否有理想电源并联或回路里只有理想电表）',
    )
  const V = (n: string) => {
    const i = index.get(uf.find(n))
    if (i === undefined) return 0
    const c = col.get(i)
    return c === undefined || !x ? 0 : x[c]
  }
  const sameComp = (a: string, b: string) => {
    const ia = index.get(uf.find(a))
    const ib = index.get(uf.find(b))
    return ia !== undefined && ib !== undefined && comp[ia] === comp[ib]
  }

  const out: Record<string, PartResult> = {}
  const isWired = (p: WiringPart) => wiringTerminals(p.type, p.ranges, p.terminals).some((t) => touched.has(key(p.id, t)))
  for (const p of parts) out[p.id] = { I: 0, U: 0, P: 0, wired: isWired(p) }
  for (const { part, role, e } of elems) {
    const va = V(e.a)
    const vb = V(e.b)
    const r = out[part.id]
    // Element current from a to b: conduction minus the Norton source.
    const i = (va - vb) * e.g - e.j
    if (part.type === 'battery' || part.type === 'currentSource') {
      r.U = va - vb
      r.I = -i
      r.P = r.U * r.I
    } else if (part.type === 'rheostat') {
      if (role === 'AS') r.I = i
      r.U += va - vb
      r.P += (va - vb) * i
    } else {
      r.I = i
      r.U = va - vb
      r.P = r.U * i
    }
  }
  // The terminal voltage is zero: all of the EMF drops across the internal resistance.
  for (const { part, I } of shorted) out[part.id] = { ...out[part.id], I, U: 0, P: 0 }

  for (const p of parts) {
    const r = out[p.id]
    if (p.type === 'ammeter' || p.type === 'voltmeter') {
      const t = wiredRange(p)
      r.range = t ? Number(t) : undefined
      if (p.type === 'voltmeter') {
        r.U = t && sameComp(key(p.id, t), key(p.id, '-')) ? V(key(p.id, t)) - V(key(p.id, '-')) : 0
        r.reading = touched.has(key(p.id, '-')) ? r.U : 0
      } else r.reading = touched.has(key(p.id, '-')) ? r.I : 0
      const what = p.type === 'ammeter' ? '电流表' : '电压表'
      if (r.reading < -1e-9) warnings.push(`${what}「${nameOf(p)}」正负接线柱接反，指针反偏`)
      if (r.range !== undefined && r.reading > r.range * 1.0001) warnings.push(`${what}「${nameOf(p)}」读数 ${+r.reading.toPrecision(3)} 超过所接量程 ${r.range}`)
    }
    if (p.type === 'galvanometer') {
      r.reading = r.I
      // Without a stated full-scale current assume a 1 mA movement.
      const full = num(p.full, scope, 1e-3)
      r.deflect = full > 0 ? r.I / full : undefined
    }
    if (p.type === 'lamp') {
      // Without a rated power assume the usual small bulb (2.5 V, 0.3 A ≈ 0.75 W).
      const rated = num(p.power, scope, 0.75)
      r.lit = rated > 0 ? Math.min(1, Math.abs(r.P) / rated) : 0
    }
    if (p.type === 'capacitor') {
      // In the steady state no element stands for the capacitor; read its voltage off the nodes.
      if (!transient) r.U = sameComp(key(p.id, 'a'), key(p.id, 'b')) ? V(key(p.id, 'a')) - V(key(p.id, 'b')) : 0
      const C = num(p.C as number | string | undefined, scope, NaN)
      r.Q = C * r.U
      if (transient) r.rate = r.I / C
    }
    if (p.type === 'inductor' && transient) {
      const L = num(p.L as number | string | undefined, scope, NaN)
      r.rate = (r.U - Math.max(0, num(p.r, scope, 0)) * r.I) / L
    }
    if (p.type === 'battery') {
      const emf = num(p.emf, scope, 0)
      if (Math.abs(r.I) > 1e3 && emf > 0) warnings.push(`${nameOf(p)} 电流过大（约 ${Math.round(Math.abs(r.I))} A）：电源被短路，可能是电流表直接接在了电源两端`)
    }
  }
  applyTransformers(out, x, links, nV, V)
  finishDiodes(parts, out, scope, (id) => (sameComp(key(id, 'a'), key(id, 'b')) ? V(key(id, 'a')) - V(key(id, 'b')) : 0))
  finishPhototubes(parts, out, scope, (id) => (sameComp(key(id, 'A'), key(id, 'K')) ? V(key(id, 'A')) - V(key(id, 'K')) : 0))
  return { parts: out, warnings }
}

/** Names a <Wiring> publishes through `read`, mapped to the quantity they carry. */
export type ReadQuantity = 'reading' | 'I' | 'U' | 'P' | 'lit' | 'Q' | 'Uc' | 'Ek'

export function readNames(parts: WiringPart[]): { name: string; id: string; q: ReadQuantity }[] {
  const out: { name: string; id: string; q: ReadQuantity }[] = []
  for (const p of parts) {
    if (typeof p.read === 'string') out.push({ name: p.read, id: p.id, q: ['ammeter', 'voltmeter', 'galvanometer'].includes(p.type) ? 'reading' : 'I' })
    else if (p.read && typeof p.read === 'object') {
      for (const [q, name] of Object.entries(p.read)) if (['I', 'U', 'P', 'lit', 'reading', 'Q', 'Uc', 'Ek'].includes(q) && typeof name === 'string') out.push({ name, id: p.id, q: q as ReadQuantity })
    }
  }
  return out
}

// ---------- schematic (<Circuit>) ----------
// A schematic is a series/parallel tree, laid out left to right. It is turned into
// the same netlist the bench solver uses: every element becomes a part whose "in"
// post is on the left, series children are chained, parallel children share both
// ends, and the load closes the loop through the source.

export interface SchematicNode {
  type?: string
  series?: SchematicNode[]
  parallel?: SchematicNode[]
  repeat?: number | string
  item?: SchematicNode
  emf?: number | string
  r?: number | string
  R?: number | string
  closed?: boolean | string
  positive?: 'left' | 'right'
  read?: string | Record<string, string>
  C?: number | string
  L?: number | string
  U0?: number | string
  I0?: number | string
  [k: string]: unknown
}

/** Resistive types drawn in schematics; their resistance is `R` (default 10 Ω). */
const SCHEMATIC_RESISTORS = new Set(['resistor', 'heater', 'rheostat', 'thermistor', 'photoresistor'])
/** One huge range so a schematic meter never trips the over-range check. */
const SCHEMATIC_RANGE = 1e12

export function schematicNetlist(source: SchematicNode | undefined, load: SchematicNode | undefined, scope: Scope): { parts: WiringPart[]; wires: WiringWire[] } {
  const parts: WiringPart[] = []
  const wires: WiringWire[] = []
  const join = (a: string, b: string) => wires.push({ from: a, to: b })
  // Schematic symbols carry no terminal marks, so every element is wired along the normal current:
  // left→right in the load, right→left back through the source chain (`rev`). A voltmeter across
  // a battery puts + on the battery's + side instead (`vRev`), so both kinds of meter read positive.
  const emit = (n: SchematicNode | undefined, keepRead: boolean, rev: boolean, vRev: boolean): [string, string] => {
    if (!n || typeof n !== 'object') return emit({ type: 'wire' }, keepRead, rev, vRev)
    if (Array.isArray(n.series) && n.series.length) {
      const ends = n.series.map((c) => emit(c, keepRead, rev, rev))
      for (let i = 1; i < ends.length; i++) join(ends[i - 1][1], ends[i][0])
      return [ends[0][0], ends[ends.length - 1][1]]
    }
    if (Array.isArray(n.parallel) && n.parallel.length) {
      const side = emfSide(n)
      const ends = n.parallel.map((c) => emit(c, keepRead, rev, side ? side === 'right' : rev))
      for (let i = 1; i < ends.length; i++) (join(ends[0][0], ends[i][0]), join(ends[0][1], ends[i][1]))
      return ends[0]
    }
    if (n.repeat !== undefined) {
      const count = Math.max(1, Math.round(num(n.repeat, scope, 1)))
      // Only the first copy publishes its `read`, so the names stay unique.
      return emit({ parallel: Array.from({ length: count }, (_, i) => ({ ...(n.item ?? {}), read: i === 0 && keepRead ? n.item?.read : undefined })) }, keepRead, rev, vRev)
    }
    const special = emitExtension(n, { parts, join, emit, keepRead, rev, labelOf: (node) => (typeof node.label === 'string' ? node.label : undefined) })
    if (special) return special
    const id = `e${parts.length}`
    const read = keepRead ? n.read : undefined
    const label = typeof n.label === 'string' ? n.label : undefined
    const add = (p: WiringPart) => parts.push(label ? { ...p, label } : p)
    const ends = (a: string, b: string, flip = rev): [string, string] => (flip ? [`${id}.${b}`, `${id}.${a}`] : [`${id}.${a}`, `${id}.${b}`])
    const type = String(n.type)
    if (type === 'battery' || type === 'generator') {
      add({ id, type: 'battery', emf: n.emf ?? 0, r: n.r, read, schematic: true })
      return ends('+', '-', n.positive === 'right')
    }
    if (type === 'ammeter' || type === 'voltmeter') {
      add({ id, type, ranges: [SCHEMATIC_RANGE], r: n.r, read })
      return ends(String(SCHEMATIC_RANGE), '-', type === 'voltmeter' ? vRev : rev)
    }
    if (type === 'galvanometer') {
      add({ id, type, r: n.r, read })
      return ends('+', '-')
    }
    if (type === 'wire' || type === 'switch') {
      add({ id, type: 'switch', closed: type === 'wire' ? true : (n.closed ?? true), read })
      return ends('a', 'b')
    }
    if (type === 'capacitor') {
      add({ id, type: 'capacitor', C: n.C, U0: n.U0, read })
      return ends('a', 'b')
    }
    if (type === 'inductor') {
      add({ id, type: 'inductor', L: n.L, r: n.r, I0: n.I0, read })
      return ends('a', 'b')
    }
    add({ id, type: type === 'lamp' ? 'lamp' : 'resistor', R: n.R ?? (SCHEMATIC_RESISTORS.has(type) || type === 'lamp' || type === 'motor' ? undefined : 0), power: n.power as number | string | undefined, read })
    return ends('a', 'b')
  }
  const s = emit(source, true, true, true)
  const l = emit(load, true, false, false)
  join(l[0], s[0])
  join(l[1], s[1])
  return { parts, wires }
}

const kids = (n: SchematicNode): SchematicNode[] => [
  ...(n.series ?? []),
  ...(n.parallel ?? []),
  ...(n.item ? [n.item] : []),
  ...(extensionChildren(n) as SchematicNode[]),
]

/** Which side the + terminal of the first battery or generator in this subtree is on. */
const emfSide = (n: SchematicNode | undefined): 'left' | 'right' | undefined => {
  if (!n || typeof n !== 'object') return undefined
  if (n.type === 'battery' || n.type === 'generator') return n.positive === 'right' ? 'right' : 'left'
  for (const c of kids(n)) {
    const side = emfSide(c)
    if (side) return side
  }
  return undefined
}

const hasEmf = (n: SchematicNode | undefined): boolean =>
  !!n &&
  typeof n === 'object' &&
  ((n.type === 'battery' || n.type === 'generator') && n.emf !== undefined ? true : n.type === 'currentSource' ? true : kids(n).some(hasEmf))

/** A schematic is solved once its source (or any battery in it) states an EMF. */
export const schematicSolves = (source: SchematicNode | undefined, load: SchematicNode | undefined) => hasEmf(source) || hasEmf(load)
