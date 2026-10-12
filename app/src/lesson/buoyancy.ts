// Buoyancy in an accelerating container. g_eff = g − a_down, with a_down the
// container's acceleration positive downward. In the container's frame the
// weight mg and a fictitious force m·a_down cancel, so both the weight and the
// buoyancy ρ V g_eff vanish together in free fall, while a spring force does not.

/** Effective gravity. Free fall of the container (a_down = g) gives 0. */
export function effectiveG(g: number, aDown: number): number {
  return g - aDown
}

/** Buoyancy magnitude ρ V g_eff. Negative g_eff reverses it (the arrow flips). */
export function buoyancyMagnitude(rho: number, volume: number, gEff: number): number {
  return rho * volume * gEff
}

/** Upward fictitious force in a frame accelerating downward at a_down. y is up. */
export function fictitiousUp(mass: number, aDown: number): number {
  return mass * aDown
}

/**
 * Downward component (positive down) of an acceleration `accAlong` that points
 * along `alongDeg` (degrees, counter-clockwise from +x, y up).
 */
export function downwardOf(accAlong: number, alongDeg: number): number {
  return -accAlong * Math.sin((alongDeg * Math.PI) / 180)
}
