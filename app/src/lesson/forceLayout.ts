// Where a force arrow starts on a <ForceDiagram> body, and which arrows are
// direction guides rather than forces. Guides are dashed, keep a fixed length,
// and never enter the force scale or ΣF = ma.

export type Vec = [number, number]

export interface AttachFrame {
  /** Body centre, screen pixels (y down). */
  center: Vec
  /** The single surface contact (bottom centre, or the hook when hanging). */
  contact: Vec
  /** Half the body along its length, pixels. */
  halfW: number
  /** Half the body along its height, pixels. */
  halfH: number
  /** Unit +x of the body, screen pixels. To the right when the body is level. */
  xAxis: Vec
  /** Unit +y of the body, screen pixels. Up when the body is level. */
  yAxis: Vec
}

const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]]
const mul = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k]

/** A force or guide with role "direction" is not a force. */
export function isDirection(f: { role?: unknown } | null | undefined): boolean {
  return !!f && f.role === 'direction'
}

/** Forces that enter ΣF = ma. Direction guides are dropped, so they cannot change a solution. */
export function forcesForSolve<T>(forces: readonly T[]): T[] {
  return forces.filter((f) => !isDirection(f as { role?: unknown }))
}

/**
 * Arrow origin. `at` is "center" (default), "contact", or [x, y] in body
 * coordinates: origin at the centre, +x along the body, +y up when the body is
 * level, each in units of the body's own half-size. [-1, 0] is the left end,
 * [0, -1] the bottom. Concurrent forces leave `at` unset and stay at the centre.
 */
export function attachmentPoint(at: unknown, frame: AttachFrame): Vec {
  if (at === 'contact') return frame.contact
  if (Array.isArray(at) && at.length >= 2) {
    const x = typeof at[0] === 'number' ? at[0] : Number(at[0])
    const y = typeof at[1] === 'number' ? at[1] : Number(at[1])
    if (Number.isFinite(x) && Number.isFinite(y)) {
      return add(frame.center, add(mul(frame.xAxis, x * frame.halfW), mul(frame.yAxis, y * frame.halfH)))
    }
  }
  return frame.center
}
