// Force solver for <ForceDiagram>: forces whose magnitude or direction is marked
// `solve` are found from ΣF = m·a (equilibrium when no acceleration is given).
// A 2-D vector equation gives two scalar equations, so up to two unknowns.

import { num, type Scope } from './expr'

export interface ForceSolve {
  magnitude?: string
  angle?: string
}

export interface SolvableForce {
  label?: string
  angle?: number | string
  magnitude?: number | string
  /** A name for the unknown magnitude, or names for unknown magnitude and/or angle. */
  solve?: string | ForceSolve
}

export interface ForceSpec {
  forces: SolvableForce[]
  mass?: number | string
  accel?: SolvableForce
}

export interface ForceResult {
  values: Record<string, number>
  /** |ΣF − m·a| after solving; non-zero means the given forces cannot balance. */
  residual: number
  warnings: string[]
}

interface Unknown {
  name: string
  /** Index into forces, or -1 for the acceleration. */
  of: number
  kind: 'magnitude' | 'angle'
}

export function solveOf(f: SolvableForce | undefined): ForceSolve {
  const s = f?.solve
  if (typeof s === 'string') return { magnitude: s }
  if (s && typeof s === 'object') return s
  return {}
}

export function forceUnknowns(spec: ForceSpec): Unknown[] {
  const out: Unknown[] = []
  const add = (f: SolvableForce | undefined, of: number) => {
    const s = solveOf(f)
    if (typeof s.magnitude === 'string') out.push({ name: s.magnitude, of, kind: 'magnitude' })
    if (typeof s.angle === 'string') out.push({ name: s.angle, of, kind: 'angle' })
  }
  spec.forces.forEach((f, i) => add(f, i))
  add(spec.accel, -1)
  return out
}

/** Expression for a force's magnitude/angle: the given value, or the unknown's name. */
export function forceExpr(f: SolvableForce | undefined, key: 'magnitude' | 'angle'): number | string | undefined {
  return solveOf(f)[key] ?? f?.[key]
}

const rad = (deg: number) => (deg * Math.PI) / 180

function normAngle(deg: number): number {
  let a = deg % 360
  if (a > 180) a -= 360
  if (a <= -180) a += 360
  return a
}

export function solveForces(spec: ForceSpec, scope: Scope): ForceResult {
  const unknowns = forceUnknowns(spec)
  const warnings: string[] = []
  const hasAccel = !!spec.accel
  const mass = hasAccel ? num(spec.mass, scope, NaN) : 0

  const net = (u: number[]): [number, number] => {
    const s: Scope = { ...scope }
    unknowns.forEach((k, i) => (s[k.name] = u[i]))
    let fx = 0
    let fy = 0
    for (const f of spec.forces) {
      const m = num(forceExpr(f, 'magnitude'), s, 0)
      const a = rad(num(forceExpr(f, 'angle'), s, 0))
      fx += m * Math.cos(a)
      fy += m * Math.sin(a)
    }
    if (hasAccel) {
      const m = num(forceExpr(spec.accel, 'magnitude'), s, 0) * mass
      const a = rad(num(forceExpr(spec.accel, 'angle'), s, 0))
      fx -= m * Math.cos(a)
      fy -= m * Math.sin(a)
    }
    return [fx, fy]
  }

  const finish = (u: number[]): ForceResult => {
    const values: Record<string, number> = {}
    unknowns.forEach((k, i) => (values[k.name] = k.kind === 'angle' ? normAngle(u[i]) : u[i]))
    const [rx, ry] = net(u)
    const residual = Math.hypot(rx, ry)
    if (!Number.isFinite(residual)) return { values: Object.fromEntries(unknowns.map((k) => [k.name, NaN])), residual: NaN, warnings }
    let scale = 1e-9
    for (const f of spec.forces) scale = Math.max(scale, Math.abs(num(forceExpr(f, 'magnitude'), { ...scope, ...values }, 0)))
    if (residual > 1e-6 * scale) {
      warnings.push(`给定的力无法满足 ${hasAccel ? 'ΣF = ma' : '平衡 ΣF = 0'}（剩余合力 ${residual.toPrecision(3)}）`)
    }
    for (const k of unknowns) {
      if (k.kind === 'magnitude' && values[k.name] < -1e-9 * scale && k.of >= 0) {
        warnings.push(`解得 ${k.name} < 0：这个力的实际方向与所画方向相反`)
      }
    }
    return { values, residual, warnings }
  }

  if (!unknowns.length) return finish([])
  if (hasAccel && !Number.isFinite(mass)) {
    warnings.push('给了 accel 但没有 mass')
    return { values: Object.fromEntries(unknowns.map((k) => [k.name, NaN])), residual: NaN, warnings }
  }

  // One force with both magnitude and angle unknown: it is minus the sum of the rest.
  if (unknowns.length === 2 && unknowns[0].of === unknowns[1].of && unknowns[0].of >= 0) {
    const mi = unknowns.findIndex((k) => k.kind === 'magnitude')
    const [rx, ry] = net([0, 0])
    const u = [0, 0]
    u[mi] = Math.hypot(rx, ry)
    u[1 - mi] = (Math.atan2(-ry, -rx) * 180) / Math.PI
    return finish(u)
  }

  // Gauss–Newton with a numeric Jacobian; magnitudes may depend on each other (f = μN).
  // Angle unknowns have two roots, so try a few starting directions and keep the best.
  const starts: number[][] = []
  const angleStarts = [0, 90, 180, -90, 45, 135, -135, -45]
  for (const a of angleStarts) starts.push(unknowns.map((k) => (k.kind === 'angle' ? a : 1)))
  if (!unknowns.some((k) => k.kind === 'angle')) starts.length = 1

  let best: number[] | null = null
  let bestR = Infinity
  for (const start of starts) {
    const u = gaussNewton(net, start, unknowns)
    if (!u) continue
    const r = Math.hypot(...net(u))
    if (r < bestR - 1e-12) {
      best = u
      bestR = r
    }
  }
  if (!best) {
    warnings.push('力的方程无唯一解（未知量所在的力共线或互相抵消）')
    return { values: Object.fromEntries(unknowns.map((k) => [k.name, NaN])), residual: NaN, warnings }
  }
  return finish(best)
}

function gaussNewton(net: (u: number[]) => [number, number], start: number[], unknowns: Unknown[]): number[] | null {
  const n = start.length
  let u = start.slice()
  for (let iter = 0; iter < 60; iter++) {
    const r = net(u)
    if (!r.every(Number.isFinite)) return null
    const J: number[][] = [[], []]
    for (let j = 0; j < n; j++) {
      const h = unknowns[j].kind === 'angle' ? 1e-4 : 1e-6 * Math.max(1, Math.abs(u[j]))
      const up = u.slice()
      up[j] += h
      const rp = net(up)
      J[0][j] = (rp[0] - r[0]) / h
      J[1][j] = (rp[1] - r[1]) / h
    }
    let step: number[]
    if (n === 1) {
      const jj = J[0][0] ** 2 + J[1][0] ** 2
      if (jj < 1e-18) return null
      step = [-(J[0][0] * r[0] + J[1][0] * r[1]) / jj]
    } else {
      const det = J[0][0] * J[1][1] - J[0][1] * J[1][0]
      const size = Math.hypot(J[0][0], J[0][1], J[1][0], J[1][1])
      if (Math.abs(det) < 1e-9 * size * size || size === 0) return null
      step = [(-r[0] * J[1][1] + r[1] * J[0][1]) / det, (-J[0][0] * r[1] + J[1][0] * r[0]) / det]
    }
    u = u.map((v, j) => v + step[j])
    if (step.every((s, j) => Math.abs(s) < 1e-11 * Math.max(1, Math.abs(u[j])))) break
  }
  return u
}
