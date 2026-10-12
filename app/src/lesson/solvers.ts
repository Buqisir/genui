// Components that compute physics (circuits, motion, forces) publish
// their results as named values. The store treats each solver like a group of
// Defines: it runs after its inputs and before anything that reads its outputs, so
// Readout, Plot, Status and the answer check all see the computed numbers.

import {
  connectedWires,
  readNames,
  schematicNetlist,
  schematicSolves,
  solves,
  solveWiring,
  type SchematicNode,
  type WiringPart,
  type WiringWire,
} from './circuit'
import { symbolsOf, type Scope } from './expr'
import { bodiesOf, dynamicsOf } from './dynamics'
import { forceUnknowns, solveForces, type ForceSpec, type SolvableForce } from './forces'
import { forcesForSolve } from './forceLayout'
import { fieldsExprs, fieldsModel, finishFields } from './fields'
import { axisExprs } from './axis'
import { finishTrack, trackDraw as trackPieces, trackExprs } from './track'
import { integrate, motionOutputs, motionValues, MOTION_RESERVED, parseRead, type MotionRun, type MotionSpec } from './motion'
import type { Block } from './parse'
import { gasTubeInputs, gasTubeOutputs, runGasTube } from './gastube'
import { opticsInputs, runOptics } from './optics'
import { fringeInputs, fringeOutputs, measurementInputs, measurementOf, measurementOutputs, solveFringeProps } from './fringes'
import { plotSolverOf } from './plotpoints'
import { circuitModel, runTransient, transientOf, transientSpec } from './transient'
import { extensionChildren, extensionExprs } from './circuitElements'

export interface SolverDef {
  /** Component name and line, for error messages. */
  where: string
  outputs: string[]
  inputs: string[]
  /** Values may be numbers or, for <Motion>, an object of functions of time. */
  run: (scope: Scope) => Record<string, unknown>
}

type ComponentBlock = Extract<Block, { kind: 'component' }>

function exprNames(values: unknown[], out = new Set<string>()): Set<string> {
  for (const v of values) {
    if (typeof v !== 'string') continue
    try {
      for (const s of symbolsOf(v)) out.add(s)
    } catch {
      // unparsable expressions are reported by the validator
    }
  }
  return out
}

const WIRING_EXPR_KEYS = ['emf', 'r', 'R', 'full', 'power', 'value', 'slider', 'closed'] as const

const SCHEMATIC_EXPR_KEYS = ['emf', 'r', 'R', 'closed', 'repeat', 'C', 'L', 'U0', 'I0', 'power'] as const

function schematicExprs(n: unknown, out: unknown[] = []): unknown[] {
  if (!n || typeof n !== 'object') return out
  const node = n as SchematicNode
  for (const k of SCHEMATIC_EXPR_KEYS) out.push(node[k])
  extensionExprs(node, out)
  for (const c of [...(node.series ?? []), ...(node.parallel ?? []), ...(node.item ? [node.item] : []), ...extensionChildren(node)]) schematicExprs(c, out)
  return out
}

function circuitSolver(b: ComponentBlock): SolverDef | null {
  const source = b.props.source as SchematicNode | undefined
  const load = b.props.load as SchematicNode | undefined
  if (!schematicSolves(source, load)) return null
  const tr = transientOf(b.props)
  if (tr) {
    const spec = transientSpec(source, load, tr)
    const outputs = motionOutputs(tr.name, spec)
    const inputs = exprNames([
      ...schematicExprs(source, schematicExprs(load)),
      tr.until,
      ...(spec.events ?? []).flatMap((e) => [e?.when, ...Object.values(e?.set ?? {})]),
      ...Object.values(spec.read ?? {}).flatMap((r) => {
        const p = parseRead(String(r))
        return p ? (p.kind === 'at' ? [p.expr, p.at] : [p.expr]) : []
      }),
    ])
    for (const n of [...outputs, ...Object.keys(spec.state), ...MOTION_RESERVED, ...(spec.derived ?? [])]) inputs.delete(n)
    return {
      where: `第 ${b.line} 行 <Circuit transient name="${tr.name}">`,
      outputs,
      inputs: [...inputs],
      run: (scope) => motionValues(tr.name, spec, runTransient(spec, scope), scope),
    }
  }
  const reads = readNames(schematicNetlist(source, load, {}).parts)
  if (!reads.length) return null
  const inputs = exprNames(schematicExprs(source, schematicExprs(load)))
  for (const r of reads) inputs.delete(r.name)
  return {
    where: `第 ${b.line} 行 <Circuit>`,
    outputs: reads.map((r) => r.name),
    inputs: [...inputs],
    run: (scope) => {
      const net = schematicNetlist(source, load, scope)
      const res = solveWiring(net.parts, net.wires, scope)
      // Part ids depend on repeat counts, so look each name up in this run's netlist.
      return Object.fromEntries(readNames(net.parts).map((r) => [r.name, res.parts[r.id]?.[r.q] ?? NaN]))
    },
  }
}

export function motionSpecOf(props: Record<string, unknown>): MotionSpec | null {
  const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, number | string>) : null)
  const dyn = dynamicsOf(props)
  const state = obj(props.state) ?? (dyn ? {} : null)
  if (!state || props.until === undefined) return null
  const events = Array.isArray(props.events) ? (props.events as NonNullable<MotionSpec['events']>) : []
  const circuitRaw = props.circuit && typeof props.circuit === 'object' && !Array.isArray(props.circuit) ? (props.circuit as { source?: SchematicNode; load?: SchematicNode }) : null
  const visibleDyn = Object.fromEntries(Object.entries(dyn?.state ?? {}).filter(([k]) => !k.startsWith('__')))
  const hiddenDyn = Object.fromEntries(Object.entries(dyn?.state ?? {}).filter(([k]) => k.startsWith('__')))
  const local = new Set(['t', ...Object.keys(visibleDyn), ...Object.keys(state)])
  // The circuit is solved before the forces, so its expressions may use t and the state but not derived forces.
  const model = circuitRaw ? circuitModel(circuitRaw.source, circuitRaw.load, local) : null
  const fields = fieldsModel(props, local)
  const deriveFns = [model?.derive, fields?.derive, dyn?.derive].filter((d): d is NonNullable<typeof d> => !!d)
  // Track mode publishes x, y, vx, vy before fields and forces. Other modes keep the old order.
  const derive = dyn?.pre
    ? (sc: Scope, warn: (m: string) => void) => {
        dyn.pre!(sc)
        model?.derive?.(sc, warn)
        fields?.derive?.(sc, warn)
        dyn.derive(sc, warn)
      }
    : deriveFns.length === 0
      ? undefined
      : deriveFns.length === 1
        ? deriveFns[0]
        : (sc: Scope, warn: (m: string) => void) => {
            for (const d of deriveFns) d(sc, warn)
          }
  // Friction's initial stick decision reads the forces, which already need the circuit's current.
  // Field flags are last: they only need the position and velocity, which are already in the state.
  // Track mode reverses the tail: position first, then which region that point is in, then N at t = 0.
  const init = dyn?.pre
    ? (sc: Scope, warn: (m: string) => void) => {
        const a = model?.init(sc, warn) ?? {}
        if (model) {
          Object.assign(sc, a)
          model.derive(sc, warn)
        }
        dyn.pre!(sc)
        const c = fields?.init(sc, warn) ?? {}
        if (fields) {
          Object.assign(sc, c)
          fields.derive(sc, warn)
        }
        const b = dyn.init(sc, warn)
        return { ...a, ...c, ...b }
      }
    : !model && !fields
      ? dyn?.init
      : (sc: Scope, warn: (m: string) => void) => {
          const a = model?.init(sc, warn) ?? {}
          if (model) {
            Object.assign(sc, a)
            model.derive(sc, warn)
          }
          const b = dyn?.init?.(sc, warn) ?? {}
          Object.assign(sc, b)
          const c = fields?.init(sc, warn) ?? {}
          return { ...a, ...b, ...c }
        }
  const trackObj = obj(props.track)
  return {
    // Body variables, the lesson's own state, stick flags, the circuit's hidden state, then field-region flags.
    state: { ...visibleDyn, ...state, ...hiddenDyn, ...(model?.state ?? {}), ...(fields?.state ?? {}) },
    rates: { ...(dyn?.rates ?? {}), ...(obj(props.rates) ?? {}), ...(model?.rates ?? {}) },
    until: props.until as number | string,
    events: [...events, ...(dyn?.events ?? []), ...(model?.events ?? []), ...(fields?.events ?? [])],
    read: (obj(props.read) ?? {}) as Record<string, string>,
    steps: typeof props.steps === 'number' ? props.steps : undefined,
    derive,
    init,
    derived: [...(model?.reads ?? []), ...(dyn?.derived ?? [])],
    circuit: circuitRaw ? { source: circuitRaw.source, load: circuitRaw.load } : undefined,
    fieldFlags: fields?.flags,
    fieldDraw: fields?.draw,
    trackDraw: trackObj ? (scope) => trackPieces(props, scope) : undefined,
    trackLeave: trackObj && typeof trackObj.leave === 'string' ? trackObj.leave : undefined,
  }
}

/** Integrates a motion and publishes field enter times that are already true at t = 0. */
export function runMotion(spec: MotionSpec, scope: Scope): MotionRun {
  const run = spec.circuit ? runTransient(spec, scope) : integrate(spec, scope)
  finishFields(spec.fieldFlags, run)
  finishTrack(spec.trackLeave, run)
  return run
}

/** Every expression a force-driven <Motion> evaluates (for dependency tracking). */
function dynamicsExprs(props: Record<string, unknown>): unknown[] {
  const spec = bodiesOf(props)
  const bodies = spec
    ? spec.bodies.flatMap((b) => [
        b.mass,
        b.along,
        b.x,
        b.v,
        b.aFrame,
        b.tip?.halfWidth,
        b.tip?.comHeight,
        b.tip?.mu,
        b.tip?.a,
        ...b.forces.flatMap((f) => [f.angle, f.magnitude, f.friction?.mu, f.friction?.static, f.friction?.normal, f.friction?.belt, f.buoyancy?.rho, f.buoyancy?.V]),
      ])
    : []
  return [...bodies, props.aFrame, ...trackExprs(props), ...axisExprs(props)]
}

function motionSolver(b: ComponentBlock): SolverDef | null {
  const name = b.props.name
  const spec = motionSpecOf(b.props)
  if (typeof name !== 'string' || !spec) return null
  const outputs = motionOutputs(name, spec)
  const vars = new Set(Object.keys(spec.state))
  const events = spec.events ?? []
  const circuit = b.props.circuit as { source?: unknown; load?: unknown } | undefined
  const inputs = exprNames([
    ...dynamicsExprs(b.props),
    ...fieldsExprs(b.props),
    ...Object.values(spec.state),
    ...Object.values(spec.rates),
    spec.until,
    ...events.flatMap((e) => [e?.when, ...Object.values(e?.set ?? {})]),
    ...Object.values(spec.read ?? {}).flatMap((r) => {
      const p = parseRead(String(r))
      return p ? (p.kind === 'at' ? [p.expr, p.at] : [p.expr]) : []
    }),
    ...(circuit && typeof circuit === 'object' ? schematicExprs(circuit.source, schematicExprs(circuit.load)) : []),
  ])
  for (const n of [...outputs, ...vars, ...MOTION_RESERVED, ...(spec.derived ?? [])]) inputs.delete(n)
  for (const n of inputs) if (n.startsWith('__')) inputs.delete(n)
  return {
    where: `第 ${b.line} 行 <Motion name="${name}">`,
    outputs,
    inputs: [...inputs],
    run: (scope) => motionValues(name, spec, runMotion(spec, scope), scope),
  }
}

export function forceSpecOf(props: Record<string, unknown>): ForceSpec {
  const forces = forcesForSolve((Array.isArray(props.forces) ? props.forces : []).filter((f) => f && typeof f === 'object') as SolvableForce[])
  const accel = props.accel && typeof props.accel === 'object' ? (props.accel as SolvableForce) : undefined
  return { forces, mass: props.mass as number | string | undefined, accel }
}

function forceSolver(b: ComponentBlock): SolverDef | null {
  const spec = forceSpecOf(b.props)
  const unknowns = forceUnknowns(spec)
  if (!unknowns.length) return null
  const all = [...spec.forces, ...(spec.accel ? [spec.accel] : [])]
  const inputs = exprNames([...all.flatMap((f) => [f.magnitude, f.angle]), spec.mass])
  for (const k of unknowns) inputs.delete(k.name)
  return {
    where: `第 ${b.line} 行 <ForceDiagram>`,
    outputs: unknowns.map((k) => k.name),
    inputs: [...inputs],
    run: (scope) => solveForces(spec, scope).values,
  }
}

function gasTubeSolver(b: ComponentBlock): SolverDef | null {
  const name = b.props.name
  if (typeof name !== 'string') return null
  const outputs = gasTubeOutputs(b.props)
  if (!outputs.length) return null
  return {
    where: `第 ${b.line} 行 <GasTube name="${name}">`,
    outputs,
    inputs: gasTubeInputs(b.props),
    run: (scope) => runGasTube(b.props, scope).values,
  }
}

function opticsSolver(b: ComponentBlock): SolverDef | null {
  const name = b.props.name
  if (typeof name !== 'string' || !/^[A-Za-z][A-Za-z0-9_]*$/.test(name) || !Array.isArray(b.props.rays)) return null
  const inputs = new Set(opticsInputs(b.props))
  inputs.delete(name)
  return {
    where: `第 ${b.line} 行 <Optics name="${name}">`,
    outputs: [name],
    inputs: [...inputs],
    run: (scope) => runOptics(b.props, scope).values,
  }
}

function fringeSolver(b: ComponentBlock): SolverDef | null {
  const outputs = fringeOutputs(b.props)
  if (!outputs.length) return null
  const inputs = new Set(fringeInputs(b.props))
  for (const n of outputs) inputs.delete(n)
  return {
    where: `第 ${b.line} 行 <Fringes>`,
    outputs,
    inputs: [...inputs],
    run: (scope) => solveFringeProps(b.props, scope).values,
  }
}

function measurementSolver(b: ComponentBlock): SolverDef | null {
  if (b.props.type !== 'measurementHead') return null
  const outputs = measurementOutputs(b.props)
  if (!outputs.length) return null
  const inputs = new Set(measurementInputs(b.props))
  for (const n of outputs) inputs.delete(n)
  return {
    where: `第 ${b.line} 行 <Instrument type="measurementHead">`,
    outputs,
    inputs: [...inputs],
    run: (scope) => measurementOf(b.props, scope).values,
  }
}

export function solverOf(b: ComponentBlock): SolverDef | null {
  if (b.name === 'Plot') return plotSolverOf(b)
  if (b.name === 'Motion') return motionSolver(b)
  if (b.name === 'ForceDiagram') return forceSolver(b)
  if (b.name === 'Circuit') return circuitSolver(b)
  if (b.name === 'GasTube') return gasTubeSolver(b)
  if (b.name === 'Optics') return opticsSolver(b)
  if (b.name === 'Fringes') return fringeSolver(b)
  if (b.name === 'Instrument') return measurementSolver(b)
  if (b.name !== 'Wiring') return null
  const parts = (Array.isArray(b.props.parts) ? b.props.parts : []).filter((p) => p && typeof p === 'object') as WiringPart[]
  const wires = (Array.isArray(b.props.wires) ? b.props.wires : []).filter((w) => w && typeof w === 'object') as WiringWire[]
  const steps = typeof b.props.steps === 'string' ? b.props.steps : null
  const reads = readNames(parts)
  if (!reads.length || !solves(parts)) return null
  const inputs = exprNames([...parts.flatMap((p) => WIRING_EXPR_KEYS.map((k) => p[k])), ...wires.map((w) => w.when), steps])
  for (const r of reads) inputs.delete(r.name)
  return {
    where: `第 ${b.line} 行 <Wiring>`,
    outputs: reads.map((r) => r.name),
    inputs: [...inputs],
    run: (scope) => {
      const res = solveWiring(parts, connectedWires(wires, steps, scope), scope)
      return Object.fromEntries(reads.map((r) => [r.name, res.parts[r.id]?.[r.q] ?? NaN]))
    },
  }
}
