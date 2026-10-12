// Hook and electrometer geometry. Split out of instruments.ts so the sandbox
// bundle can take these formulas without the expression evaluator.

/** Travel of the hook, as a fraction of the case length, from zero to full scale. */
export const SPRING_TRAVEL = 0.22

/**
 * Hook position. `(x, y)` is the ring; `angleDeg` is the direction from the ring toward the hook
 * (degrees from +x, counterclockwise, y up). `length` is the case length at zero load.
 */
export function springHook(x: number, y: number, angleDeg: number, length: number, value: number, max: number): { x: number; y: number; fraction: number } {
  const fraction = !(max > 0) || !Number.isFinite(value) ? 0 : Math.max(0, Math.min(1, value / max))
  const L = length * (1 + SPRING_TRAVEL * fraction)
  const a = (angleDeg * Math.PI) / 180
  return { x: x + L * Math.cos(a), y: y + L * Math.sin(a), fraction }
}

/**
 * Electrometer needle, degrees from the rod. `value`/`max` wins over a hand-set `deflection`.
 * Full scale is 60°.
 */
export function electrometerDegrees(value: number | undefined, max: number, deflection?: number): number {
  if (value !== undefined && Number.isFinite(value)) {
    const m = max > 0 ? max : 1
    return 60 * Math.max(0, Math.min(1, value / m))
  }
  return Math.max(0, Math.min(80, Number.isFinite(deflection) ? (deflection as number) : 0))
}
