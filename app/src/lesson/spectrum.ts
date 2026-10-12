// Wavelengths and Bohr radii for <EnergyLevels>. The picture is computed from the
// level energies: λ = hc/ΔE, r_n = n² r₁. Display radii are compressed so the
// inner orbits stay readable; the true radii are written beside the drawing.

export const HC_EV_NM = 1240
/** Bohr radius of the hydrogen ground state, in nm. */
export const BOHR_R1_NM = 0.053
/** Visible window used by the spectrum strip (nm). Textbook 1.62–3.11 eV is the sibling check on the level diagram. */
export const VISIBLE_NM: readonly [number, number] = [380, 760]

export type SpectrumRegion = '紫外' | '可见' | '红外'

export function wavelengthNm(deltaEv: number): number {
  const d = Math.abs(deltaEv)
  return d > 0 ? HC_EV_NM / d : Infinity
}

export function regionOf(nm: number): SpectrumRegion {
  if (!(nm > 0) || !Number.isFinite(nm) || nm < VISIBLE_NM[0]) return '紫外'
  if (nm > VISIBLE_NM[1]) return '红外'
  return '可见'
}

export function hydrogenEn(n: number): number {
  return -13.6 / n ** 2
}

/** True Bohr radius r_n = n² r₁, in nm. */
export function bohrRadiusNm(n: number): number {
  return BOHR_R1_NM * n * n
}

export interface OrbitRow {
  n: number
  E: number
  /** True radius in nm. */
  rNm: number
  /** r_n / r₁ = n². */
  ratio: number
  /** Compressed display radius in px. ρ ∝ n, not n². */
  rho: number
}

/**
 * Display radii share a fixed outer radius, spaced in proportion to n.
 * n = 1…4 then sit apart; the caption still quotes r_n = n² × 0.053 nm.
 */
export function orbitRows(levels: { n: number; E: number }[], outerPx = 116): OrbitRow[] {
  const nMax = Math.max(1, ...levels.map((s) => s.n))
  const px = outerPx / nMax
  return [...levels]
    .sort((a, b) => a.n - b.n)
    .map((s) => ({ n: s.n, E: s.E, rNm: bohrRadiusNm(s.n), ratio: s.n * s.n, rho: s.n * px }))
}

export interface SpectrumLineIn {
  index: number
  label: string
  nm: number
}

export interface PlacedLine extends SpectrumLineIn {
  region: SpectrumRegion
}

export interface OutsideCount {
  region: SpectrumRegion
  count: number
}

/** Lines that fall on the axis, and how many of the rest sit in each spectral region. */
export function placeSpectrum(lines: SpectrumLineIn[], axis: { from: number; to: number }): { inside: PlacedLine[]; outside: OutsideCount[] } {
  const from = Math.min(axis.from, axis.to)
  const to = Math.max(axis.from, axis.to)
  const inside: PlacedLine[] = []
  const counts: Record<SpectrumRegion, number> = { 紫外: 0, 可见: 0, 红外: 0 }
  for (const line of lines) {
    if (!Number.isFinite(line.nm)) continue
    const region = regionOf(line.nm)
    if (line.nm >= from - 1e-6 && line.nm <= to + 1e-6) inside.push({ ...line, region })
    else counts[region]++
  }
  inside.sort((a, b) => a.nm - b.nm)
  const outside = (['紫外', '可见', '红外'] as const).filter((region) => counts[region] > 0).map((region) => ({ region, count: counts[region] }))
  return { inside, outside }
}

/** "另有 3 条在紫外区、1 条在红外区" — null when every line is on the axis. */
export function outsideCaption(outside: OutsideCount[]): string | null {
  if (!outside.length) return null
  const parts = outside.map((o) => `${o.count} 条在${o.region === '可见' ? '可见光' : o.region}区`)
  return `另有 ${parts.join('、')}`
}
