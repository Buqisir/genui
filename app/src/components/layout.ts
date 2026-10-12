export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export const overlaps = (a: Box, b: Box, gap = 2) =>
  a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap

/** Rough text width for mixed CJK/Latin text without a DOM measurement pass. */
export function textWidth(text: string, fontSize: number): number {
  let w = 0
  const plain = text.replace(/_\{([^}]*)\}|_([A-Za-z0-9]+)/g, '$1$2')
  for (const ch of plain) w += /[\u2E80-\uFFFF]/.test(ch) ? fontSize : fontSize * 0.58
  return w
}

export interface LabelRequest {
  /** Anchor point the label describes. */
  ax: number
  ay: number
  text: string
  fontSize: number
}

export interface PlacedLabel extends Box {
  text: string
  ax: number
  ay: number
}

/**
 * Greedy placement: try candidate offsets around each anchor and keep the
 * first box that stays inside bounds and clears earlier labels and obstacles.
 */
export function placeLabels(
  requests: LabelRequest[],
  bounds: Box,
  obstacles: Box[],
): PlacedLabel[] {
  const placed: PlacedLabel[] = []
  for (const r of requests) {
    const w = textWidth(r.text, r.fontSize) + 8
    const h = r.fontSize + 6
    const d = 8
    const candidates: [number, number][] = [
      [d, -h - d],
      [-w - d, -h - d],
      [d, d],
      [-w - d, d],
      [-w / 2, -h - d * 2],
      [-w / 2, d * 2],
      [d, -h - d * 4],
      [-w - d, -h - d * 4],
      [d, d * 4],
      [-w - d, d * 4],
    ]
    let best: Box | null = null
    let bestScore = Infinity
    for (const [dx, dy] of candidates) {
      const box = {
        x: clampNum(r.ax + dx, bounds.x, bounds.x + bounds.w - w),
        y: clampNum(r.ay + dy, bounds.y, bounds.y + bounds.h - h),
        w,
        h,
      }
      const hits =
        placed.filter((p) => overlaps(p, box)).length * 10 +
        obstacles.filter((o) => overlaps(o, box, 0)).length
      if (hits === 0) {
        best = box
        break
      }
      if (hits < bestScore) {
        bestScore = hits
        best = box
      }
    }
    placed.push({ ...(best as Box), text: r.text, ax: r.ax, ay: r.ay })
  }
  return placed
}

const clampNum = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi))

export function niceTicks(min: number, max: number, target = 6): number[] {
  if (!(max > min)) return [min]
  const raw = (max - min) / target
  const mag = 10 ** Math.floor(Math.log10(raw))
  const norm = raw / mag
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag
  const ticks: number[] = []
  for (let v = Math.ceil(min / step - 1e-9) * step; v <= max + step * 1e-9; v += step) {
    ticks.push(Math.abs(v) < step * 1e-9 ? 0 : v)
  }
  return ticks
}

const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

/**
 * Tick and scale labels; large and small values in textbook form (1.5×10⁵), not 1.5e+5.
 * `bare` drops a mantissa of 1 (10⁴), for decade dials and multipliers.
 */
export function formatTick(v: number, opts: { bare?: boolean; sig?: number; dec?: number } = {}): string {
  if (!(Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-3 && v !== 0))) return String(+v.toPrecision(opts.sig ?? 6))
  const [mant, exp] = v.toExponential(opts.dec ?? 1).split('e')
  const power = '10' + String(Number(exp)).replace(/[-\d]/g, (c) => SUPERSCRIPT[c])
  if (opts.bare && mant === '1.0') return power
  if (opts.bare && mant === '-1.0') return '−' + power
  return `${mant.replace('-', '−')}×${power}`
}

/**
 * Labels for a whole row of ticks: as short as possible while different values stay different
 * (1.05×10⁵ next to 1.1×10⁵ must not both read 1.1×10⁵; 0.0182 next to 0.02 must not both read 0.02).
 */
export function formatTicks(values: number[]): string[] {
  const wanted = new Set(values.map((v) => +v.toPrecision(10))).size
  let out: string[] = []
  for (let k = 0; k < 4; k++) {
    out = values.map((v) => formatTick(v, { sig: 3 + k, dec: 1 + k }))
    if (new Set(out).size >= wanted) break
  }
  return out
}
