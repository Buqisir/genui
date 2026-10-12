export interface FitLine {
  slope: number
  intercept: number
}

/** Least squares. `linear` is y = kx + b; `proportional` is y = kx through the origin. */
export function leastSquares(pts: readonly (readonly [number, number])[], kind: 'linear' | 'proportional'): FitLine {
  let n = 0
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  for (const [x, y] of pts) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue
    n++
    sx += x
    sy += y
    sxx += x * x
    sxy += x * y
  }
  if (n < 2) return { slope: NaN, intercept: NaN }
  if (kind === 'proportional') {
    if (!(sxx > 0)) return { slope: NaN, intercept: 0 }
    return { slope: sxy / sxx, intercept: 0 }
  }
  const den = n * sxx - sx * sx
  if (den === 0) return { slope: NaN, intercept: sy / n }
  const slope = (n * sxy - sx * sy) / den
  return { slope, intercept: (sy - slope * sx) / n }
}
