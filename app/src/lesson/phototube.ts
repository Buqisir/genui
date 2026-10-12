// Phototube (光电管) characteristic. The stopping voltage and the current are
// computed from the light and the work function; the lesson does not place them.
//
// U is U_AK = V_A − V_K (anode minus cathode), in volts.
// I is the photocurrent, conventional current from A to K (electrons leave K), in amperes.
// The I–U law is a schematic piecewise-linear stand-in for the real curve:
//   hν < W        → I = 0 at every voltage (no photoelectrons)
//   U_AK ≤ −U_c   → I = 0
//   U_AK ≥ 0      → I = I_sat
//   in between    → straight line
// U_c = max(0, hν − W) in volts, because hν and W are in eV and dividing by e
// cancels. E_k = max(0, hν − W) in eV.
//
// A monotone piecewise-linear element is solved by trying the three segments,
// the same way an ideal diode tries on/off. The law has no memory, so a transient
// just repeats the search at each instant.

import { num, type Scope } from './expr'
import type { CircuitResult, PartResult, WiringPart, WiringWire } from './circuit'

export const H_J_S = 6.63e-34
export const E_COULOMB = 1.6e-19
export const HC_EV_NM = 1240

const EPS_U = 1e-4

export interface PhotoInput {
  nu?: number
  lambda?: number
  W: number
  Isat: number
}

export interface PhotoLaw {
  /** Photon energy in eV (NaN if neither frequency nor wavelength was usable). */
  energy: number
  /** Stopping voltage in volts. 0 when the light is below the work function. */
  Uc: number
  /** Maximum kinetic energy in eV. 0 below threshold. */
  Ek: number
  Isat: number
  /** No photoelectrons: the tube is an open circuit at every voltage. */
  dark: boolean
}

/** Photon energy in eV. Wavelength (nm, 1240/λ) wins when both are given. */
export function photonEnergyEv(input: { nu?: number; lambda?: number }): number {
  if (input.lambda !== undefined && input.lambda > 0) return HC_EV_NM / input.lambda
  if (input.nu !== undefined && input.nu > 0) return (H_J_S * input.nu) / E_COULOMB
  return NaN
}

export function photoLaw(input: PhotoInput): PhotoLaw {
  const energy = photonEnergyEv(input)
  const W = input.W
  const above = Number.isFinite(energy) && Number.isFinite(W) && energy >= W
  const Ek = above ? energy - W : 0
  return {
    energy,
    Uc: Ek,
    Ek,
    Isat: Number.isFinite(input.Isat) && input.Isat > 0 ? input.Isat : 0,
    dark: !above,
  }
}

/** Schematic photocurrent at anode-to-cathode voltage U. */
export function photoCurrent(U: number, law: PhotoLaw): number {
  if (law.dark || !(law.Isat > 0) || !Number.isFinite(U)) return 0
  if (U <= -law.Uc) return 0
  if (U >= 0 || !(law.Uc > 0)) return law.Isat
  return (law.Isat * (U + law.Uc)) / law.Uc
}

export type PhotoSeg = 'cut' | 'lin' | 'sat'

/** The segment that contains this voltage. Below threshold everything is cutoff. */
export function segmentFor(U: number, law: PhotoLaw): PhotoSeg {
  if (law.dark || !(law.Isat > 0)) return 'cut'
  if (!(law.Uc > 1e-8)) return U >= 0 ? 'sat' : 'cut'
  if (U <= -law.Uc) return 'cut'
  if (U >= 0) return 'sat'
  return 'lin'
}

export function lawFromPart(p: WiringPart, scope: Scope): PhotoLaw {
  const read = (v: unknown) => (v === undefined ? undefined : num(v as number | string, scope, NaN))
  const nu = read(p.nu)
  const lambda = read(p.lambda)
  return photoLaw({
    nu: nu !== undefined && Number.isFinite(nu) ? nu : undefined,
    lambda: lambda !== undefined && Number.isFinite(lambda) ? lambda : undefined,
    W: num(p.W as number | string | undefined, scope, NaN),
    Isat: num(p.Isat as number | string | undefined, scope, NaN),
  })
}

/**
 * Norton stamp between anode (a) and cathode (b): i_AK = g·U_AK − j.
 * null means an open circuit (cutoff, or no photoelectrons).
 */
export function photoStamp(seg: PhotoSeg, law: PhotoLaw): { g: number; j: number } | null {
  if (law.dark || !(law.Isat > 0) || seg === 'cut') return null
  if (seg === 'sat' || !(law.Uc > 1e-8)) return { g: 0, j: -law.Isat }
  return { g: law.Isat / law.Uc, j: -law.Isat }
}

function violation(seg: PhotoSeg, U: number, law: PhotoLaw): number {
  if (law.dark || !(law.Isat > 0)) return seg === 'cut' ? 0 : 1
  const Uc = law.Uc
  if (seg === 'cut') return U > -Uc + EPS_U ? U + Uc : 0
  if (seg === 'sat') return U < -EPS_U ? -U : 0
  if (!(Uc > 1e-8)) return 1
  if (U > EPS_U) return U
  if (U < -Uc - EPS_U) return -Uc - U
  return 0
}

type SolveFn = (parts: WiringPart[], wires: WiringWire[], scope: Scope, memory?: Record<string, number>) => CircuitResult

/**
 * Search the three linear segments until each tube's voltage lands in the
 * segment that was stamped. `solve` must honour a preset `segment` and must
 * not search again.
 */
export function solvePhototubes(parts: WiringPart[], wires: WiringWire[], scope: Scope, memory: Record<string, number> | undefined, solve: SolveFn): CircuitResult {
  const tubes = parts.filter((p) => p.type === 'phototube' && p.segment === undefined)
  const laws = tubes.map((t) => lawFromPart(t, scope))
  const state: PhotoSeg[] = laws.map((l) => (l.dark || !(l.Uc > 1e-8) || !(l.Isat > 0) ? 'cut' : 'lin'))
  const seen = new Set<string>()
  let last: CircuitResult | null = null
  const limit = Math.min(24, tubes.length * 6 + 2)
  for (let iter = 0; iter < limit; iter++) {
    const key = state.join('')
    if (seen.has(key)) break
    seen.add(key)
    const trial = parts.map((p) => {
      if (p.type !== 'phototube' || p.segment !== undefined) return p
      const i = tubes.findIndex((t) => t.id === p.id)
      return i < 0 ? p : { ...p, segment: state[i] }
    })
    const res = solve(trial, wires, scope, memory)
    last = res
    const singular = res.warnings.some((w) => w.includes('无解'))
    let worst = -1
    let worstBad = 0
    const next = state.slice()
    tubes.forEach((t, i) => {
      if (laws[i].dark || !(laws[i].Isat > 0)) return
      const U = res.parts[t.id]?.U ?? 0
      const bad = singular ? 1e3 : violation(state[i], U, laws[i])
      if (bad > worstBad) {
        worstBad = bad
        worst = i
        next[i] = singular ? ((state[i] === 'cut' ? 'lin' : state[i] === 'lin' ? 'sat' : 'cut') as PhotoSeg) : segmentFor(U, laws[i])
      }
    })
    if (worst < 0) return res
    state[worst] = next[worst]
  }
  const failed = last ?? { parts: {}, warnings: [] }
  return { ...failed, warnings: [...failed.warnings, '光电管没有一致的工作段'] }
}

/** Fill U from the nodes when the tube was an open, and always publish Uc and Ek. */
export function finishPhototubes(parts: WiringPart[], out: Record<string, PartResult>, scope: Scope, voltageAK: (id: string) => number): void {
  for (const p of parts) {
    if (p.type !== 'phototube') continue
    const r = out[p.id]
    if (!r) continue
    const law = lawFromPart(p, scope)
    const seg = (p.segment as PhotoSeg | undefined) ?? 'cut'
    if (photoStamp(seg, law) === null) {
      r.I = 0
      r.U = voltageAK(p.id)
      r.P = 0
    }
    r.Uc = law.Uc
    r.Ek = law.Ek
  }
}
