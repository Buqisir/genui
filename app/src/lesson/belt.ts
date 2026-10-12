// Conveyor contact: the belt is a driven surface, not another body. Relative
// velocity is v − v_belt along the body's +along axis. The sliding mark is the
// distance rubbed while slipping, ∫|v − v_belt| dt, and the heat is ∫ μ N |v − v_belt| dt.

/** How fast the belt surface moves along +along. A number is already the speed. */
export function beltRelative(vBody: number, vBelt: number): number {
  return vBody - vBelt
}

/** Rates of the sliding mark and the frictional heat. Both are zero while stuck. */
export function beltWear(rel: number, stuck: boolean, mu: number, normal: number): { slide: number; heat: number } {
  if (stuck || !Number.isFinite(rel)) return { slide: 0, heat: 0 }
  const speed = Math.abs(rel)
  const muN = Math.abs(mu) * Math.abs(normal)
  return { slide: speed, heat: muN * speed }
}

/**
 * Acceleration of a belt whose speed is an expression of time, so a block that
 * has stuck can keep up. A numeric speed is constant. `sample(t)` evaluates the
 * speed expression; the derivative is one-sided and only used between events.
 */
export function beltAcceleration(speed: number | string | undefined, t: number, sample: (time: number) => number): number {
  if (speed === undefined || typeof speed === 'number') return 0
  const dt = 1e-4
  const a = (sample(t + dt) - sample(t)) / dt
  return Number.isFinite(a) ? a : 0
}
