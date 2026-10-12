// Pure geometry for the lab-apparatus helpers:
// v.transformer({style:'lab'}), v.sampleWire, v.oilFilm, v.centripetalDemo,
// v.crt, v.hall, and v.plates({angle, tilt}) / v.platesAt.
// Bundled into the sandbox runtime. runtime.js calls these functions; it does not keep a copy.

export type Pt = [number, number]

// ---------- Hall: F = q v × B ----------

export type HallSide = 'top' | 'bottom' | 'left' | 'right'
export type HallI = 'right' | 'left' | 'up' | 'down'
export type HallB = 'in' | 'out'
export type HallCarrier = 'electron' | 'hole'

const HALL_OPP: Record<HallSide, HallSide> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }

/**
 * Which face goes positive.
 * +x right, +y up, +z out of the page. B `out` is +z, `in` is −z.
 * Conventional current I; electrons drift against I, holes with I.
 * Carriers accumulate on the side F = q (v × B) points to, and that face
 * takes the carrier's sign. UH is the sign of φ(上)−φ(下) when I is
 * horizontal, and of φ(右)−φ(左) when I is vertical.
 */
export function hallPolarity(B: HallB, I: HallI, carrier: HallCarrier): { positive: HallSide; negative: HallSide; UH: 1 | -1 } {
  const dir = { right: [1, 0], left: [-1, 0], up: [0, 1], down: [0, -1] }[I]
  if (!dir) throw new Error('v.hall 的 I 取 right、left、up、down')
  if (B !== 'in' && B !== 'out') throw new Error('v.hall 的 B 取 in 或 out')
  if (carrier !== 'electron' && carrier !== 'hole') throw new Error('v.hall 的载流子取 electron 或 hole')
  const q = carrier === 'hole' ? 1 : -1
  const vSign = q // hole: v along I; electron: v opposite I
  const bz = B === 'out' ? 1 : -1
  const vx = vSign * dir[0]
  const vy = vSign * dir[1]
  // (vx, vy, 0) × (0, 0, bz) = (vy*bz, −vx*bz)
  const Fx = q * vy * bz
  const Fy = q * -vx * bz
  const accumulate: HallSide = Math.abs(Fy) >= Math.abs(Fx) ? (Fy > 0 ? 'top' : 'bottom') : Fx > 0 ? 'right' : 'left'
  const positive = q > 0 ? accumulate : HALL_OPP[accumulate]
  const negative = HALL_OPP[positive]
  const UH: 1 | -1 = positive === 'top' || positive === 'bottom' ? (positive === 'top' ? 1 : -1) : positive === 'right' ? 1 : -1
  return { positive, negative, UH }
}

// ---------- oil film: squares more than half covered ----------

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function polygonArea(pts: Pt[]): number {
  let s = 0
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) s += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1]
  return Math.abs(s) / 2
}

/** Even-odd ray cast. Boundary points are not guaranteed; sample cell interiors. */
export function pointInPoly(x: number, y: number, pts: Pt[]): boolean {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const yi = pts[i][1]
    const yj = pts[j][1]
    const xi = pts[i][0]
    const xj = pts[j][0]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

/** Fraction of cell [x0, x0+grid) × [y0, y0+grid) inside `inside`, by an n×n lattice of cell-centres. */
export function cellFraction(inside: (x: number, y: number) => boolean, x0: number, y0: number, grid: number, n: number): number {
  const s = grid / n
  let hit = 0
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) if (inside(x0 + (i + 0.5) * s, y0 + (j + 0.5) * s)) hit++
  }
  return hit / (n * n)
}

export interface CoveredCell {
  i: number
  j: number
  frac: number
}

/** Cells with i in [i0, i1), j in [j0, j1). A cell counts only when strictly more than half of it is covered. */
export function coverageCount(
  inside: (x: number, y: number) => boolean,
  i0: number,
  i1: number,
  j0: number,
  j1: number,
  grid: number,
  samples = 7,
): CoveredCell[] {
  const cells: CoveredCell[] = []
  for (let j = j0; j < j1; j++) {
    for (let i = i0; i < i1; i++) {
      const frac = cellFraction(inside, i * grid, j * grid, grid, samples)
      if (frac > 0.5) cells.push({ i, j, frac })
    }
  }
  return cells
}

/** Circle of radius R. `count` is the 高考 rule; `area` = count·grid²; `exact` = πR². */
export function circleHalfCount(R: number, grid: number, cx = 0, cy = 0, samples = 15): { count: number; area: number; exact: number } {
  if (!(R > 0) || !(grid > 0)) throw new Error('圆的半径和格子边长应为正数')
  const i0 = Math.floor((cx - R) / grid)
  const i1 = Math.ceil((cx + R) / grid)
  const j0 = Math.floor((cy - R) / grid)
  const j1 = Math.ceil((cy + R) / grid)
  const inside = (x: number, y: number) => (x - cx) ** 2 + (y - cy) ** 2 <= R * R
  const cells = coverageCount(inside, i0, i1, j0, j1, grid, samples)
  return { count: cells.length, area: cells.length * grid * grid, exact: Math.PI * R * R }
}

export interface OilFilmGeom {
  outline: Pt[]
  count: number
  area: number
  exact: number
  grid: number
  paper: number
  cells: CoveredCell[]
}

/**
 * Irregular film centred on the origin. `grid` is the square side, `cells` is how
 * many squares lie along the coordinate paper (the paper runs ±cells/2·grid).
 * `area`, when positive, is the geometric area the outline is scaled to; otherwise
 * the film covers about a third of the paper. `seed` fixes the spikes.
 * `area` in the result is the counted area count·grid², not the geometric one (`exact`).
 */
export function oilFilmGeometry(o: { cells?: number; area?: number; seed?: number; grid?: number } = {}): OilFilmGeom {
  const grid = Number(o.grid)
  if (!(grid > 0) && o.grid != null) throw new Error('油膜的格子边长应为正数')
  const g = grid > 0 ? grid : 1
  const paper = Math.max(2, Math.round(Number(o.cells) > 0 ? Number(o.cells) : 12))
  const seed = Number.isFinite(Number(o.seed)) ? Number(o.seed) >>> 0 : 1
  const rng = mulberry32(seed)
  const N = 36
  const phase = rng() * Math.PI * 2
  const raw: Pt[] = []
  for (let i = 0; i < N; i++) {
    const th = (i / N) * Math.PI * 2
    const spike = Math.abs(Math.sin(5 * th + phase))
    const r = 0.62 + 0.28 * spike + 0.08 * Math.sin(2 * th + phase * 0.7) + (rng() - 0.5) * 0.06
    raw.push([Math.cos(th) * r, Math.sin(th) * r])
  }
  const target = Number(o.area) > 0 ? Number(o.area) : paper * g * paper * g * 0.34
  const scale = Math.sqrt(target / polygonArea(raw))
  const outline = raw.map(([x, y]) => [x * scale, y * scale] as Pt)
  const exact = polygonArea(outline)
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of outline) {
    minX = Math.min(minX, p[0])
    maxX = Math.max(maxX, p[0])
    minY = Math.min(minY, p[1])
    maxY = Math.max(maxY, p[1])
  }
  const i0 = Math.floor(minX / g)
  const i1 = Math.ceil(maxX / g)
  const j0 = Math.floor(minY / g)
  const j1 = Math.ceil(maxY / g)
  if (Math.max(i1 - i0, j1 - j0) > 80) throw new Error('油膜超出格子太多，请加大格子或减小面积')
  const inside = (x: number, y: number) => pointInPoly(x, y, outline)
  const cells = coverageCount(inside, i0, i1, j0, j1, g, 7)
  return { outline, count: cells.length, area: cells.length * g * g, exact, grid: g, paper, cells }
}

// ---------- centripetal demonstrator: F = m ω² r ----------

export interface CentripetalReadout {
  F1: number
  F2: number
  n1: number
  n2: number
  ratio: number
  scale: number
  pulley: Pt
  w1: number
  w2: number
}

/**
 * ω2 = 1, ω1 = omegaRatio, so `omegaRatio` is ω1/ω2.
 * Pulley radii are inversely proportional to ω (one belt) and normalised so the
 * larger pulley is 1. Sleeve readings n are F times `readings` when that is a
 * number; otherwise the larger sleeve is 8 divisions.
 */
export function centripetalReadings(m1: number, r1: number, m2: number, r2: number, omegaRatio: number, readings?: number | boolean): CentripetalReadout {
  if (!(m1 >= 0) || !(m2 >= 0)) throw new Error('小球质量应为非负数')
  if (!(r1 >= 0) || !(r2 >= 0)) throw new Error('转动半径应为非负数')
  if (!(omegaRatio > 0)) throw new Error('角速度之比应为正数')
  if (typeof readings === 'number' && !(readings >= 0)) throw new Error('标尺每单位力的格数应为非负数')
  const w2 = 1
  const w1 = omegaRatio
  const F1 = m1 * w1 * w1 * r1
  const F2 = m2 * w2 * w2 * r2
  const maxF = Math.max(F1, F2)
  const scale = typeof readings === 'number' ? readings : maxF > 0 ? 8 / maxF : 0
  const n1 = F1 * scale
  const n2 = F2 * scale
  const pr1 = 1 / w1
  const pr2 = 1 / w2
  const pMax = Math.max(pr1, pr2)
  const ratio = F2 === 0 ? (F1 === 0 ? 1 : Infinity) : F1 / F2
  return { F1, F2, n1, n2, ratio, scale, pulley: [pr1 / pMax, pr2 / pMax], w1, w2 }
}

// ---------- CRT linear deflection ----------

export interface CrtSpot {
  x: number
  y: number
  k: number
}

/**
 * Linear model, not the parabola from e, m, v0. Ux = φ_X − φ_X′, Uy = φ_Y − φ_Y′.
 * Electrons are negative, so they deflect toward the positive plate:
 * x = k·Ux (toward X when Ux > 0), y = k·Uy (toward Y, the upper plate, when Uy > 0).
 * `k` wins if given; else k = (L/d)·arm when both L and d are positive; else k = 1.
 * The result is not clamped — the drawing stops the spot at the screen rim.
 */
export function crtDeflection(Ux: number, Uy: number, o: { k?: number; L?: number; d?: number; arm?: number } = {}): CrtSpot {
  let k = 1
  if (o.k != null && Number.isFinite(Number(o.k))) k = Number(o.k)
  else if (Number(o.L) > 0 && Number(o.d) > 0) k = (Number(o.L) / Number(o.d)) * (o.arm != null && Number.isFinite(Number(o.arm)) ? Number(o.arm) : 1)
  return { x: k * (Number(Ux) || 0), y: k * (Number(Uy) || 0), k }
}

// ---------- tilted plates ----------

export interface PlatePair {
  top: [Pt, Pt]
  bot: [Pt, Pt]
  angle: number
}

/**
 * Midline (x1,y1)→(x2,y2), plates separated by `gap` (full gap). `angle` (degrees,
 * from +x, counter-clockwise) replaces the midline direction but keeps its centre
 * and length. `tilt` rotates only the lower plate about its own centre.
 * The + plate is the one on the left of the midline direction (above it when the
 * line runs to the right).
 */
export function platesAtFrame(x1: number, y1: number, x2: number, y2: number, o: { gap?: number; angle?: number; tilt?: number } = {}): PlatePair {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy)
  if (!(len > 1e-9)) throw new Error('v.platesAt 的两端不能重合')
  const gap = o.gap == null ? 0.4 : Number(o.gap)
  if (!(gap > 0)) throw new Error('极板间距应为正数')
  const cx = (x1 + x2) / 2
  const cy = (y1 + y2) / 2
  const th = o.angle != null && Number.isFinite(Number(o.angle)) ? (Number(o.angle) * Math.PI) / 180 : Math.atan2(dy, dx)
  const dirx = Math.cos(th)
  const diry = Math.sin(th)
  const nx = -diry
  const ny = dirx
  const g = gap / 2
  const L = len / 2
  const topC: Pt = [cx + nx * g, cy + ny * g]
  const botC: Pt = [cx - nx * g, cy - ny * g]
  const tilt = ((Number(o.tilt) || 0) * Math.PI) / 180
  const d2x = Math.cos(th + tilt)
  const d2y = Math.sin(th + tilt)
  return {
    top: [
      [topC[0] - dirx * L, topC[1] - diry * L],
      [topC[0] + dirx * L, topC[1] + diry * L],
    ],
    bot: [
      [botC[0] - d2x * L, botC[1] - d2y * L],
      [botC[0] + d2x * L, botC[1] + d2y * L],
    ],
    angle: (th * 180) / Math.PI,
  }
}

/** Horizontal pair from x1 to x2 at yTop and yBot, then rotated by `angle` about the centre. `tilt` cants the lower plate. */
export function platePair(x1: number, x2: number, yTop: number, yBot: number, angle = 0, tilt = 0): PlatePair {
  const cy = (yTop + yBot) / 2
  const gap = yTop - yBot
  // A negative gap (yTop below yBot) still names the yTop plate `top`, matching the old sign convention.
  const swap = gap < 0
  const pair = platesAtFrame(Math.min(x1, x2), cy, Math.max(x1, x2), cy, { gap: Math.abs(gap) || 1e-6, angle, tilt: swap ? -tilt : tilt })
  if (!swap && x1 <= x2) return pair
  if (!swap) return { top: [pair.top[1], pair.top[0]], bot: [pair.bot[1], pair.bot[0]], angle: pair.angle }
  return { top: pair.bot, bot: pair.top, angle: pair.angle }
}

// ---------- lab demountable transformer, pixel offsets, y down ----------

export interface LabPost {
  turns: number
  dx: number
  dy: number
  used: boolean
}

export interface LabTransformerLayout {
  taps1: LabPost[]
  taps2: LabPost[]
  used1: [LabPost, LabPost]
  used2: [LabPost, LabPost]
  yokeOn: boolean
  open: boolean
  yoke: { dx: number; dy: number; h: number; x0: number; x1: number }
  legCX: [number, number]
  legW: number
  legTop: number
  legBot: number
  /** Top of the U's bottom bar. The window between the legs ends here. */
  barTop: number
  outerHalf: number
  postY: number
  spread: number
  base: { y0: number; y1: number; x0: number; x1: number }
  coil: { y0: number; y1: number; over: number; strip: number }
}

function pickTap(taps: number[], n: unknown, which: string): { index: number; common: number } {
  const common = taps.indexOf(0) >= 0 ? taps.indexOf(0) : 0
  if (n == null || n === '') {
    // 不写匝数就用最后一档；0 那一档留给另一根线。
    let index = taps.length - 1
    if (index === common) index = taps.length - 2
    if (index < 0) throw new Error('至少要有两档接线柱')
    return { index, common }
  }
  const want = Number(n)
  const index = taps.findIndex((t) => t === want)
  if (index < 0) throw new Error('抽头 ' + n + ' 不在接线柱 ' + taps.join('/') + ' 里')
  if (index === common) throw new Error(which + ' 要接 0 和另一档，不能两根线接在同一接线柱上')
  return { index, common }
}

/**
 * Side view of the demountable transformer, in pixels, y downward, origin at the
 * anchor. The U stands on the base: a bottom bar and two legs, each leg a coil
 * taller than its bobbin so iron shows above the winding. The yoke is exactly
 * the core's outer width and sits on the leg tops, or is lifted clear of them.
 * Tap posts sit on the terminal strip at the top of each bobbin, under the yoke.
 * Laminations follow the outline (平行于铁芯轮廓): vertical in the legs, horizontal
 * in the bar and the yoke. `n1` / `n2` select a tap; the other lead is the 0 post.
 */
export function labTransformerLayout(o: { taps1?: number[]; taps2?: number[]; n1?: unknown; n2?: unknown; yoke?: unknown } = {}): LabTransformerLayout {
  const taps1 = Array.isArray(o.taps1) && o.taps1.length ? o.taps1.map(Number) : [0, 100, 200, 400]
  const taps2 = Array.isArray(o.taps2) && o.taps2.length ? o.taps2.map(Number) : [0, 200, 800, 1400]
  if (taps1.some((t) => !Number.isFinite(t)) || taps2.some((t) => !Number.isFinite(t))) throw new Error('接线柱匝数应为有限数字')
  const yokeOn = o.yoke !== false && o.yoke !== 0
  const sel1 = pickTap(taps1, o.n1, '原线圈')
  const sel2 = pickTap(taps2, o.n2, '副线圈')
  const outerHalf = 124
  const legW = 70
  const over = 22
  const legCX: [number, number] = [-outerHalf + legW / 2, outerHalf - legW / 2]
  const legTop = -80
  const strip = 28
  const coilY0 = -36
  const coilY1 = coilY0 + strip + 54 + 8
  const barTop = coilY1
  const barH = 22
  const legBot = barTop + barH
  const yokeH = 18
  const yokeLift = yokeOn ? 0 : 40
  const yokeY = legTop - yokeH / 2 - yokeLift
  const postY = coilY0 + 8
  const coilW = legW + over * 2
  const fit = (n: number) => (n > 1 ? Math.min(32, (coilW - 22) / (n - 1)) : 0)
  const posts = (taps: number[], cx: number, sel: { index: number; common: number }): LabPost[] => {
    const step = fit(taps.length)
    return taps.map((turns, i) => ({
      turns,
      dx: cx + (i - (taps.length - 1) / 2) * step,
      dy: postY,
      used: i === sel.index || i === sel.common,
    }))
  }
  const p1 = posts(taps1, legCX[0], sel1)
  const p2 = posts(taps2, legCX[1], sel2)
  return {
    taps1: p1,
    taps2: p2,
    used1: [p1[sel1.index], p1[sel1.common]],
    used2: [p2[sel2.index], p2[sel2.common]],
    yokeOn,
    open: !yokeOn,
    yoke: { dx: 0, dy: yokeY, h: yokeH, x0: -outerHalf, x1: outerHalf },
    legCX,
    legW,
    legTop,
    legBot,
    barTop,
    outerHalf,
    postY,
    spread: 32,
    base: { y0: legBot, y1: legBot + 18, x0: -outerHalf - 28, x1: outerHalf + 28 },
    coil: { y0: coilY0, y1: coilY1, over, strip },
  }
}

/** Stroke width in px for a wire of diameter `d`. Clamped so a sub-pixel wire stays visible and a thick one stays a wire. */
export function wireThickness(d?: number, scale = 12): number {
  if (!(Number(d) > 0)) return 2.4
  return Math.max(1.6, Math.min(7, 1.6 + Number(d) * (scale > 0 ? scale : 12)))
}

export function sampleWireFrame(x1: number, x2: number, y: number): { ends: [Pt, Pt]; clips: [Pt, Pt] } {
  return {
    ends: [
      [x1, y],
      [x2, y],
    ],
    clips: [
      [x1, y],
      [x2, y],
    ],
  }
}
