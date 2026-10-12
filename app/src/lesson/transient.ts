// Circuit transients for <Circuit transient={…}> and the circuit inside a <Motion>:
// capacitor voltages and inductor currents are the state; at every instant the rest
// of the circuit is a DC network (capacitor = voltage source U_C, inductor = current
// source I_L) whose nodal solution gives dU_C/dt = I_C/C and dI_L/dt = U_L/L. The
// <Motion> integrator does the RK4 and the events, so a switch written as
// `closed: "t >= 2"` or `closed: "x >= 1"` flips exactly at the crossing.
// Before t = 0 the circuit is taken to have sat in its t < 0 configuration for a long
// time: each capacitor starts at its steady voltage and each inductor at its steady
// current, unless the part states U0 / I0.
//
// Published under transient.name, like a motion: rc.UC(t), rc.I(t), rc.tEnd, plus
// named events and transient.read values ("max(I)", "UC @ 2"). A <Motion circuit>
// publishes the same read names on the motion object (rod.I(t)), not as top-level names.

import { boolOf, readNames, schematicNetlist, solveWiring, type PartResult, type SchematicNode, type WiringPart, type WiringWire } from './circuit'
import { diodeEvents, expandSpdt, publishDiodeProbes, stripDiodeOn, tagDiodes } from './circuitElements'
import { evaluateIn, num, symbolsOf, type Scope } from './expr'
import { integrate, type MotionEvent, type MotionRun, type MotionSpec } from './motion'

export interface TransientProps {
  name: string
  until: number | string
  steps?: number
  /** Time the schematic is drawn at (meter notes, switch positions); default 0. */
  at?: string
  events?: MotionEvent[]
  read?: Record<string, string>
}

export const STORAGE_TYPES = new Set(['capacitor', 'inductor'])

export function transientOf(props: Record<string, unknown>): TransientProps | null {
  const t = props.transient
  if (!t || typeof t !== 'object' || Array.isArray(t)) return null
  const tr = t as Record<string, unknown>
  if (typeof tr.name !== 'string' || (typeof tr.until !== 'number' && typeof tr.until !== 'string')) return null
  return {
    name: tr.name,
    until: tr.until,
    steps: typeof tr.steps === 'number' ? tr.steps : undefined,
    at: typeof tr.at === 'string' ? tr.at : typeof tr.at === 'number' ? String(tr.at) : undefined,
    events: Array.isArray(tr.events) ? (tr.events as MotionEvent[]) : [],
    read: tr.read && typeof tr.read === 'object' ? (tr.read as Record<string, string>) : {},
  }
}

const stateName = (k: number) => `__m${k}`
const rateName = (k: number) => `__dm${k}`
/** The instant just before t = 0 that fixes the starting charge and current. */
const BEFORE = -1e-9

const flagName = (k: number) => `__w${k}`

const mentions = (v: unknown, names: Set<string>) => {
  if (typeof v !== 'string') return false
  try {
    return symbolsOf(v).some((s) => names.has(s))
  } catch {
    return false
  }
}

/**
 * Copies the tree with every switch whose `closed` depends on a run-local name
 * (`t`, a position, …) reading a hidden 0/1 flag instead. Only the switching event
 * changes the flag, so all RK4 stages of a step see the same circuit; a stage
 * evaluated just past the switching time would otherwise smear it.
 */
function withSwitchFlags(n: SchematicNode | undefined, found: string[], local: Set<string>): SchematicNode | undefined {
  if (!n || typeof n !== 'object') return n
  if (n.type === 'switch' && mentions(n.closed, local)) {
    found.push(n.closed as string)
    return { ...n, closed: flagName(found.length - 1) }
  }
  const out: SchematicNode = { ...n }
  if (n.series) out.series = n.series.map((c) => withSwitchFlags(c, found, local)!)
  if (n.parallel) out.parallel = n.parallel.map((c) => withSwitchFlags(c, found, local)!)
  if (n.item) out.item = withSwitchFlags(n.item, found, local)
  const extra = n as SchematicNode & { secondary?: SchematicNode; secondaries?: { load?: SchematicNode }[]; spdt?: SchematicNode[] }
  if (extra.secondary) (out as typeof extra).secondary = withSwitchFlags(extra.secondary, found, local)
  if (Array.isArray(extra.secondaries)) (out as typeof extra).secondaries = extra.secondaries.map((s) => ({ ...s, load: withSwitchFlags(s.load, found, local) }))
  if (Array.isArray(extra.spdt)) (out as typeof extra).spdt = extra.spdt.map((c) => withSwitchFlags(c, found, local)!)
  return out
}

/** Part values the circuit solver evaluates; the ones not depending on the run are fixed for a whole run. */
const PART_EXPRS = ['emf', 'r', 'R', 'C', 'L', 'power', 'closed', 'I', 'on', 'n1', 'n'] as const

interface Frozen {
  parts: WiringPart[]
  wires: WiringWire[]
  storage: WiringPart[]
  reads: ReturnType<typeof readNames>
  /** Values that change during the run (local-dependent EMFs, switch flags): part, key, expression. */
  live: [WiringPart, string, string][]
  linear: boolean
  /** Indices of the parts the integrator reads (storage and read names). */
  needed: number[]
  configs: Map<string, Config>
}

/** Key on the run's own scratch scope, so concurrent runs with other parameters never share a netlist. */
const NET = '__net'

/**
 * Evaluating every part expression at every RK4 stage dominated the run time, so
 * everything that does not change during the run is turned into a number once.
 * `local` is the set of names that vary inside the run (`t` for a transient,
 * `t` plus the motion's state for a coupled circuit).
 */
function freeze(net: { parts: WiringPart[]; wires: WiringWire[] }, sc: Scope, local: Set<string>): Frozen {
  const live: Frozen['live'] = []
  const parts = net.parts.map((p0) => {
    const p: WiringPart = { ...p0 }
    for (const k of PART_EXPRS) {
      const v = p[k]
      if (typeof v !== 'string') continue
      // A substituted switch flag (`__w0`) is live even though it is not in `local`.
      if (mentions(v, local) || /__w\d/.test(v) || /__d\d/.test(v)) live.push([p, k, v])
      else (p as Record<string, unknown>)[k] = k === 'closed' ? boolOf(v, sc, false) : num(v, sc, NaN)
    }
    return p
  })
  const storage = parts.filter((p) => STORAGE_TYPES.has(p.type))
  // Superposition holds while only switches and EMFs change (a state-dependent R is not linear in the inputs).
  const linear = live.every(([, k]) => k === 'closed' || k === 'emf')
  const reads = readNames(parts)
  const ids = new Set([...storage.map((p) => p.id), ...reads.map((r) => r.id)])
  const needed = parts.flatMap((p, i) => (ids.has(p.id) ? [i] : []))
  return { parts, wires: net.wires, storage, reads, live, linear, needed, configs: new Map() }
}

/** Linear quantities of every part for one switch configuration: base + Σ input·column. */
interface Config {
  base: Float64Array
  cols: Float64Array[]
  warnings: string[]
}
const LINEAR = ['I', 'U', 'reading'] as const

/**
 * Same results as solveWiring(parts, wires, sc, memory) for the frozen netlist. With
 * the switches fixed the network is linear in the capacitor voltages, inductor
 * currents and live EMFs, so each configuration is solved once per input and
 * every later stage is a weighted sum (meter warnings that depend on the values,
 * such as a reversed needle, are not repeated for each instant).
 */
function solveFrozen(net: Frozen, sc: Scope, memory: Record<string, number>): { parts: Record<string, PartResult>; warnings: string[] } {
  if (!net.linear) return solveWiring(net.parts, net.wires, sc, memory)
  const emfs = net.live.filter(([, k]) => k === 'emf').map(([p]) => p)
  const inputs = [...net.storage.map((p) => memory[p.id] ?? 0), ...emfs.map((p) => p.emf as number)]
  const key = net.parts.map((p) => (p.type === 'switch' ? (p.closed ? '1' : '0') : '')).join('')
  let cfg = net.configs.get(key)
  if (!cfg) {
    const saved = emfs.map((p) => p.emf)
    const flat = (input: number) => {
      const mem: Record<string, number> = {}
      net.storage.forEach((p, k) => (mem[p.id] = k === input ? 1 : 0))
      emfs.forEach((p, k) => (p.emf = net.storage.length + k === input ? 1 : 0))
      const res = solveWiring(net.parts, net.wires, sc, mem)
      const v = new Float64Array(net.parts.length * LINEAR.length)
      net.parts.forEach((p, i) => LINEAR.forEach((q, j) => (v[i * LINEAR.length + j] = res.parts[p.id]?.[q] ?? 0)))
      return { v, warnings: res.warnings }
    }
    const base = flat(-1)
    const cols = inputs.map((_, i) => {
      const c = flat(i).v
      for (let k = 0; k < c.length; k++) c[k] -= base.v[k]
      return c
    })
    emfs.forEach((p, k) => (p.emf = saved[k]))
    cfg = { base: base.v, cols, warnings: base.warnings }
    net.configs.set(key, cfg)
  }
  const out: Record<string, PartResult> = {}
  const n = LINEAR.length
  for (const i of net.needed) {
    const p = net.parts[i]
    const v = [0, 0, 0]
    for (let j = 0; j < n; j++) {
      let s = cfg.base[i * n + j]
      for (let k = 0; k < inputs.length; k++) s += cfg.cols[k][i * n + j] * inputs[k]
      v[j] = s
    }
    const [I, U, reading] = v
    const r: PartResult = { I, U, P: U * I, reading, wired: true }
    if (p.type === 'lamp') {
      const rated = typeof p.power === 'number' ? p.power : 0.75
      r.lit = rated > 0 ? Math.min(1, Math.abs(r.P) / rated) : 0
    }
    if (p.type === 'capacitor') {
      r.Q = (p.C as number) * U
      r.rate = I / (p.C as number)
    }
    if (p.type === 'inductor') r.rate = (U - Math.max(0, typeof p.r === 'number' ? p.r : 0) * I) / (p.L as number)
    out[p.id] = r
  }
  return { parts: out, warnings: cfg.warnings }
}

/** Read names of the schematic: in a transient they are published as functions of time. */
export function transientReads(source: SchematicNode | undefined, load: SchematicNode | undefined) {
  return readNames(schematicNetlist(source, load, {}).parts)
}

export interface CircuitModel {
  /** Hidden storage (`__m`) and switch flags (`__w`). */
  state: Record<string, number | string>
  rates: Record<string, string>
  /** Switch flips, located by the integrator so the step lands on them. */
  events: MotionEvent[]
  derive: (sc: Scope, warn: (m: string) => void) => void
  /** Freezes the netlist onto `sc.__net` and returns the storage initial values. Call before derive. */
  init: (sc: Scope, warn: (m: string) => void) => Record<string, number>
  /** Read names published as functions of time. */
  reads: string[]
}

/**
 * The circuit as an ODE fragment. `local` is every name that can change during the
 * run (`t`, and for a motion the state variables). An EMF that depends on those is
 * still linear, so it stays on the superposition path; a resistance that depends on
 * them is not, and the circuit is solved directly each stage.
 */
export function circuitModel(rawSource: SchematicNode | undefined, rawLoad: SchematicNode | undefined, local: Set<string>): CircuitModel {
  const switches: string[] = []
  const diodes = { n: 0 }
  // SPDT is expanded before switch flags, so a throw that depends on t lands on an event like any other switch.
  const source = tagDiodes(withSwitchFlags(expandSpdt(rawSource), switches, local), diodes)
  const load = tagDiodes(withSwitchFlags(expandSpdt(rawLoad), switches, local), diodes)
  // Storage parts are matched by order; the validator keeps them out of `repeat`, so the order is fixed.
  const stored = schematicNetlist(source, load, {}).parts.filter((p) => STORAGE_TYPES.has(p.type))
  const reads = transientReads(source, load).map((r) => r.name)
  const state: Record<string, number | string> = {}
  const rates: Record<string, string> = {}
  stored.forEach((_, k) => {
    state[stateName(k)] = 0
    rates[stateName(k)] = rateName(k)
  })
  const isClosed = (c: string) => `(${c}) ? 1 : 0`
  switches.forEach((c, k) => (state[flagName(k)] = isClosed(c)))
  for (let k = 0; k < diodes.n; k++) state[`__d${k}`] = 1
  const strip = (w: string) => w.replace(/「e\d+」/g, '')

  const derive = (sc: Scope, warn: (m: string) => void) => {
    const net = (sc as unknown as Record<string, Frozen>)[NET]
    for (const [p, k, e] of net.live) (p as Record<string, unknown>)[k] = k === 'closed' ? !!evaluateIn(e, sc) : evaluateIn(e, sc)
    const memory: Record<string, number> = {}
    net.storage.forEach((p, k) => (memory[p.id] = sc[stateName(k)]))
    const res = solveFrozen(net, sc, memory)
    for (const w of res.warnings) warn(strip(w))
    net.storage.forEach((p, k) => (sc[rateName(k)] = res.parts[p.id]?.rate ?? NaN))
    for (const r of net.reads) sc[r.name] = res.parts[r.id]?.[r.q] ?? NaN
    publishDiodeProbes(net.parts, res.parts, sc)
  }

  const init = (sc: Scope, warn: (m: string) => void) => {
    ;(sc as unknown as Record<string, Frozen>)[NET] = freeze(schematicNetlist(source, load, sc), sc, local)
    const before: Scope = { ...sc, t: BEFORE }
    switches.forEach((c, k) => (before[flagName(k)] = num(isClosed(c), before, 0)))
    const net = schematicNetlist(source, load, before)
    // Diodes are algebraic: search a consistent state instead of using the placeholder flag.
    const res = solveWiring(stripDiodeOn(net.parts), net.wires, before)
    for (const w of res.warnings) warn(`t < 0 时：${strip(w)}`)
    const out: Record<string, number> = {}
    net.parts
      .filter((p) => STORAGE_TYPES.has(p.type))
      .forEach((p, k) => {
        const given = p.type === 'capacitor' ? p.U0 : p.I0
        const steady = p.type === 'capacitor' ? res.parts[p.id]?.U : res.parts[p.id]?.I
        out[stateName(k)] = given !== undefined ? num(given as number | string, sc, NaN) : (steady ?? 0)
      })
    if (diodes.n) {
      const nowNet = schematicNetlist(source, load, sc)
      const nowStorage = nowNet.parts.filter((p) => STORAGE_TYPES.has(p.type))
      const mem = nowStorage.length ? Object.fromEntries(nowStorage.map((p, k) => [p.id, out[stateName(k)] ?? 0])) : undefined
      const now = solveWiring(stripDiodeOn(nowNet.parts), nowNet.wires, sc, mem)
      for (const w of now.warnings) if (!res.warnings.includes(w)) warn(strip(w))
      for (const p of nowNet.parts) if (p.type === 'diode' && typeof p.diode === 'number') out[`__d${p.diode}`] = now.diodeOn?.[p.id] ? 1 : 0
    }
    return out
  }

  // A switch flipping becomes an event, so the step lands on it exactly. Diode edges too.
  const events: MotionEvent[] = [...switches.map((c, k) => ({ when: `(${c}) ? 1 : -1`, dir: 'any' as const, set: { [flagName(k)]: isClosed(c) } })), ...diodeEvents(diodes.n)]

  return { state, rates, events, derive, init, reads }
}

export function transientSpec(rawSource: SchematicNode | undefined, rawLoad: SchematicNode | undefined, tr: TransientProps): MotionSpec {
  const model = circuitModel(rawSource, rawLoad, new Set(['t']))
  return {
    state: model.state,
    rates: model.rates,
    until: tr.until,
    steps: tr.steps,
    events: [...(tr.events ?? []), ...model.events],
    read: tr.read,
    derive: model.derive,
    init: model.init,
    derived: model.reads,
  }
}

/** Integrates the transient; a blow-up almost always means a time constant far below the step. */
export function runTransient(spec: MotionSpec, scope: Scope): MotionRun {
  const run = integrate(spec, scope)
  if (run.warnings.some((w) => w.includes('非有限数')))
    run.warnings.push('电容或线圈所在回路的时间常数（RC 或 L/R）远小于积分步长：回路里几乎没有电阻时给电源写内阻 r 或串一个电阻，或者缩短 until')
  return run
}
