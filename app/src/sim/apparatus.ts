// Pure geometry for the lab-apparatus helpers:
// v.transformer({style:'lab'}), v.sampleWire, v.oilFilm, v.centripetalDemo,
// v.crt, v.hall, and v.plates({angle, tilt}) / v.platesAt.
// Bundled into the sandbox runtime. The runtime (runtime/*.js) calls these functions; it does not keep a copy.

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

// ---------- gears and parachute, pixel coordinates, y down ----------

/**
 * Spur-gear outline around (X, Y) in pixels. R is the pitch radius; teeth follow the
 * usual proportions (addendum one module, dedendum 1.25 modules, module = 2R / n).
 * `angle` turns the gear counter-clockwise in degrees; tooth 0 points along +x at angle 0.
 */
export function gearProfile(X: number, Y: number, R: number, teeth: number, angle = 0): { pts: [number, number][]; outer: number; root: number } {
  const n = Math.max(8, Math.round(teeth))
  const mod = (2 * R) / n
  // Few teeth: stub teeth, else the straight flanks interfere while turning (and look star-like).
  const outer = R + mod * (n < 14 ? 0.8 : 1)
  const root = Math.max(R * 0.3, R - 1.25 * mod)
  const P = (2 * Math.PI) / n
  const a0 = (angle * Math.PI) / 180
  const pts: [number, number][] = []
  const at = (rho: number, th: number) => pts.push([X + rho * Math.cos(th), Y - rho * Math.sin(th)])
  // Tooth half-widths as fractions of the angular pitch at root, pitch and tip. The tooth is a
  // little thinner than the gap at the pitch circle (backlash), so a meshing tooth never overlaps
  // the flanks of the other gear even though the flanks are straight rather than involute.
  const halfRoot = 0.28
  const halfPitch = 0.23
  const halfTip = 0.15
  for (let i = 0; i < n; i++) {
    const c = a0 + i * P
    at(root, c - 0.5 * P)
    at(root, c - halfRoot * P)
    at(R, c - halfPitch * P)
    at(outer, c - halfTip * P)
    at(outer, c)
    at(outer, c + halfTip * P)
    at(R, c + halfPitch * P)
    at(root, c + halfRoot * P)
  }
  return { pts, outer, root }
}

/**
 * Rotation (degrees) for a gear of `teeth2` meshing with gear 1 (rotation `angle1`, `teeth1`)
 * whose centre lies in direction `dir` (degrees) from gear 1. A tooth of one gear sits in a
 * gap of the other at the contact point, and turning gear 1 by Δ turns gear 2 by −Δ·n1/n2.
 */
export function gearMeshAngle(angle1: number, teeth1: number, teeth2: number, dir = 0): number {
  return dir + 180 - (180 - (dir - angle1) * teeth1) / teeth2
}

export interface ParachuteFrame {
  /** Canopy outline: dome from the left rim over the apex to the right rim, then the scalloped hem back. */
  canopy: [number, number][]
  /** Seam from the apex region down to each rim point (gores + 1 rim points). */
  rim: [number, number][]
  /** Near hem, right to left, bowing up between rim points (the tail of `canopy`). */
  hem: [number, number][]
  apex: [number, number]
  /** Where the lines gather (the attach point), at the origin. */
  attach: [number, number]
}

/**
 * Parachute in pixels relative to the attach point (0, 0), canopy above it (y down).
 * W is the canopy width, H the dome height, drop the vertical distance from the attach
 * point up to the rim. `gores` panels; the hem bows up between rim points.
 */
export function parachuteFrame(W: number, H: number, drop: number, gores = 6): ParachuteFrame {
  const n = Math.max(3, Math.round(gores))
  const a = W / 2
  const yRim = -drop
  const rim: [number, number][] = []
  for (let i = 0; i <= n; i++) {
    // Rim points spaced evenly in angle around the dome seen side-on, so outer gores look foreshortened.
    const t = Math.PI - (Math.PI * i) / n
    rim.push([a * Math.cos(t), yRim])
  }
  const canopy: [number, number][] = []
  const N = 40
  for (let i = 0; i <= N; i++) {
    const t = Math.PI - (Math.PI * i) / N
    // Slightly flattened dome: a superellipse reads as inflated fabric rather than a half-circle.
    const c = Math.cos(t)
    const s = Math.sin(t)
    canopy.push([a * Math.sign(c) * Math.abs(c) ** 0.85, yRim - H * s ** 0.8])
  }
  const bow = Math.min(H * 0.16, (W / n) * 0.35)
  const hem: [number, number][] = []
  for (let i = n; i > 0; i--) {
    const [x1] = rim[i]
    const [x0] = rim[i - 1]
    const steps = 6
    for (let k = 1; k <= steps; k++) {
      const u = k / steps
      hem.push([x1 + (x0 - x1) * u, yRim - bow * Math.sin(Math.PI * u)])
    }
  }
  canopy.push(...hem)
  return { canopy, rim, hem, apex: [0, yRim - H], attach: [0, 0] }
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

// ---------- wedge: a solid polygon with an edge a block can sit on ----------

export interface WedgeEdge {
  /** Index into `pts` of the edge's start vertex. */
  i: number
  a: Pt
  b: Pt
  length: number
  /** Unit vector from a toward b. */
  dir: Pt
  /** Unit normal pointing out of the polygon. */
  normal: Pt
  /** Point at fraction u along the edge (0 at a, 1 at b). */
  at: (u: number) => Pt
}

export interface WedgeFrame {
  pts: Pt[]
  edges: WedgeEdge[]
  /** Index of the highest edge (the lit one). */
  topEdge: number
}

/**
 * Solid polygon from world vertices. Each edge carries a point-at-fraction and the
 * outward unit normal, so a block or a force can sit on any face. y grows upward.
 */
export function wedgeFrame(pts: Pt[]): WedgeFrame {
  if (!Array.isArray(pts) || pts.length < 3) throw new Error('v.wedge 的顶点至少要三个')
  const clean: Pt[] = pts.map((p, i) => {
    if (!p || p.length < 2 || !Number.isFinite(+p[0]) || !Number.isFinite(+p[1])) throw new Error('v.wedge 的第 ' + (i + 1) + ' 个顶点不是有限数字')
    return [+p[0], +p[1]]
  })
  for (let i = 0; i < clean.length; i++) {
    const a = clean[i]
    const b = clean[(i + 1) % clean.length]
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 1e-9) throw new Error('v.wedge 的相邻顶点不能重合')
  }
  const area2 = clean.reduce((s, p, i) => {
    const q = clean[(i + 1) % clean.length]
    return s + p[0] * q[1] - q[0] * p[1]
  }, 0)
  if (Math.abs(area2) < 1e-9) throw new Error('v.wedge 的顶点共线，构不成一个面')
  const edges: WedgeEdge[] = clean.map((a, i) => {
    const b = clean[(i + 1) % clean.length]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    const dir: Pt = [(b[0] - a[0]) / len, (b[1] - a[1]) / len]
    // Positive area is counter-clockwise, whose right-hand normal points inward.
    const sign = area2 > 0 ? -1 : 1
    const normal: Pt = [sign * -dir[1], sign * dir[0]]
    return {
      i,
      a,
      b,
      length: len,
      dir,
      normal,
      at: (u: number) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u],
    }
  })
  // The lit band belongs on the uppermost edge that actually slopes or caps the shape,
  // so a vertical riser that merely reaches the apex does not steal it from the slope.
  let topEdge = 0
  let best = -Infinity
  edges.forEach((e, i) => {
    const reach = Math.max(e.a[1], e.b[1])
    const span = Math.abs(e.b[0] - e.a[0])
    const score = span > 1e-9 ? reach : -Infinity
    if (score > best + 1e-9 || (Math.abs(score - best) <= 1e-9 && e.length > edges[topEdge].length)) {
      best = score
      topEdge = i
    }
  })
  return { pts: clean, edges, topEdge }
}

// ---------- slab: cabinet (oblique) projection of a cuboid ----------

export interface SlabCorner {
  x: number
  y: number
  z: number
  px: number
  py: number
}

export interface SlabFrame {
  /** Depth recession: screen x grows by cos45·d, screen y shrinks by sin45·d. */
  recede: Pt
  /** Eight corners, x fastest then y then z, each with its projected pixel offset from the anchor. */
  corners: SlabCorner[]
  /** front z=0, side x=w, top y=h. Each face lists its four corners in outline order. */
  faces: { front: number[]; side: number[]; top: number[] }
  /** Section plane through the edges x=0,y=h and x=w,y=0 (the MNPQ cut). */
  cut: number[]
  /** Project a point of the cuboid to a pixel offset from the anchor. z points up the page. */
  project: (x: number, y: number, z: number) => Pt
}

/**
 * Cabinet projection of a w × h × d cuboid, in pixels, y up, origin at the front-bottom-left
 * corner. Receding edges run at 45° and are drawn at half their true length.
 */
export function slabFrame(w: number, h: number, d: number): SlabFrame {
  if (!(w > 0 && h > 0 && d > 0)) throw new Error('v.slab 的宽、高、厚都要是正数')
  const k = 0.5
  const recede: Pt = [k * Math.SQRT1_2, k * Math.SQRT1_2]
  const project = (x: number, y: number, z: number): Pt => [x + z * recede[0], y + z * recede[1]]
  const xyz: [number, number, number][] = [
    [0, 0, 0],
    [w, 0, 0],
    [0, h, 0],
    [w, h, 0],
    [0, 0, d],
    [w, 0, d],
    [0, h, d],
    [w, h, d],
  ]
  const corners = xyz.map(([x, y, z]) => {
    const [px, py] = project(x, y, z)
    return { x, y, z, px, py }
  })
  return {
    recede,
    corners,
    faces: { front: [0, 1, 3, 2], side: [1, 5, 7, 3], top: [2, 3, 7, 6] },
    cut: [2, 3, 5, 4],
    project,
  }
}

/**
 * A flat loop lying on the top face of a slab, as an ellipse in the same projection.
 * `u` runs along the width, `v` along the depth. Returns the centre and the two radii.
 */
export function slabLoop(frame: SlabFrame, w: number, h: number, d: number, o: { u?: number; v?: number; ru?: number; rv?: number } = {}) {
  const u = o.u ?? 0.5
  const v = o.v ?? 0.5
  const ru = o.ru ?? Math.min(w, d) * 0.32
  const rv = o.rv ?? ru * (d > 0 ? Math.min(1, d / Math.max(w, 1e-9)) : 1)
  if (!(ru > 0 && rv > 0)) throw new Error('v.slab 的线圈半径要是正数')
  const center = frame.project(u * w, h, v * d)
  const right = frame.project(u * w + ru, h, v * d)
  const back = frame.project(u * w, h, v * d + rv)
  return {
    center,
    rx: [right[0] - center[0], right[1] - center[1]] as Pt,
    rz: [back[0] - center[0], back[1] - center[1]] as Pt,
  }
}

// ---------- hand: a fist closed around a grip ----------

export interface HandFrame {
  /** Direction the wrist runs, away from the grip, as a unit vector (screen y grows downward). */
  wrist: Pt
  /** Back of the hand, a rounded block between the fingers and the cuff. */
  palm: Pt[]
  /** Four curled fingers seen side on, stacked across the rope; each a rounded segment. */
  fingers: Pt[][]
  /** Thumb pressed over the first finger, on the upper side whenever the wrist allows. */
  thumb: Pt[]
  /** Cuff at the wrist. */
  cuff: Pt[]
  /** Rope axis through the grip. The rope is hidden between `front`, and shows on both sides. */
  rope: { dir: Pt; from: number; to: number; front: [number, number] }
}

/**
 * Fist gripping at the origin, in pixels, screen y downward. `dir` is degrees from +x
 * (counter-clockwise in world axes) pointing from the grip toward the wrist.
 */
export function handFrame(dir = 0, size = 34): HandFrame {
  if (!(size > 0)) throw new Error('v.hand 的尺寸要是正数')
  const a = (dir * Math.PI) / 180
  const ux = Math.cos(a)
  const uy = -Math.sin(a)
  // Mirror a leftward wrist so the thumb (the -side) stays on top, as in textbook drawings.
  const flip = ux < -1e-9 ? -1 : 1
  const nx = -uy * flip
  const ny = ux * flip
  const P = (along: number, side: number): Pt => [along * ux + side * nx, along * uy + side * ny]
  const s = size
  // Separate simple parts rather than one outline, so no edge ever crosses another.
  const rounded = (a0: number, a1: number, s0: number, s1: number, r: number): Pt[] => {
    const rr = Math.min(r, (a1 - a0) / 2, (s1 - s0) / 2)
    const corners: [number, number, number][] = [
      [a1 - rr, s0 + rr, -Math.PI / 2],
      [a1 - rr, s1 - rr, 0],
      [a0 + rr, s1 - rr, Math.PI / 2],
      [a0 + rr, s0 + rr, Math.PI],
    ]
    const pts: Pt[] = []
    for (const [ca, cs, t0] of corners) {
      for (let i = 0; i <= 4; i++) {
        const t = t0 + (i / 4) * (Math.PI / 2)
        pts.push(P((ca + Math.cos(t) * rr) * s, (cs + Math.sin(t) * rr) * s))
      }
    }
    return pts
  }
  const palm = rounded(0.02, 0.66, -0.4, 0.42, 0.16)
  // Index to little finger across the rope; the middle finger reaches furthest.
  const tips = [-0.27, -0.31, -0.29, -0.24]
  const fingers = tips.map((tip, k) => rounded(tip, 0.2, -0.4 + k * 0.2 + 0.006, -0.2 + k * 0.2 - 0.006, 0.1))
  const thumb = rounded(-0.04, 0.44, -0.52, -0.3, 0.11)
  const cuff = rounded(0.6, 0.94, -0.37, 0.39, 0.03)
  return { wrist: [ux, uy], palm, fingers, thumb, cuff, rope: { dir: [nx, ny], from: -s * 0.8, to: s * 0.8, front: [-s * 0.52, s * 0.42] } }
}

// ---------- laser pointer, side on ----------

export interface LaserFrame {
  /** Unit direction the beam leaves in, screen y downward. */
  dir: Pt
  /** Body outline from aperture back to the tail cap, closed. */
  body: Pt[]
  /** Knurled grip band. */
  grip: Pt[]
  /** Tail cap. */
  cap: Pt[]
  /** Push button on the upper side. */
  button: Pt[]
  /** Aperture centre, at the origin. */
  aperture: Pt
}

/**
 * Laser pointer seen from the side, aperture at the origin, in pixels. `angle` is degrees
 * from +x, counter-clockwise in world axes. The body extends backward from the aperture.
 */
export function laserFrame(angle = 0, length = 92): LaserFrame {
  if (!(length > 0)) throw new Error('v.laser 的长度要是正数')
  const a = (angle * Math.PI) / 180
  const fx = Math.cos(a)
  const fy = -Math.sin(a)
  const nx = -fy
  const ny = fx
  const P = (along: number, side: number): Pt => [along * fx + side * nx, along * fy + side * ny]
  const r = Math.max(4.5, Math.min(8, length * 0.085))
  const body: Pt[] = [P(0, r * 0.62), P(-length * 0.9, r), P(-length, r * 0.86), P(-length, -r * 0.86), P(-length * 0.9, -r), P(0, -r * 0.62)]
  const grip: Pt[] = [P(-length * 0.34, r * 1.06), P(-length * 0.62, r * 1.06), P(-length * 0.62, -r * 1.06), P(-length * 0.34, -r * 1.06)]
  const cap: Pt[] = [P(-length * 0.9, r * 0.96), P(-length * 1.045, r * 0.96), P(-length * 1.045, -r * 0.96), P(-length * 0.9, -r * 0.96)]
  const button: Pt[] = [P(-length * 0.7, -r * 0.7), P(-length * 0.84, -r * 0.7), P(-length * 0.84, -r * 1.34), P(-length * 0.7, -r * 1.34)]
  return { dir: [fx, fy], body, grip, cap, button, aperture: [0, 0] }
}

// ---------- household apparatus (batch 3), pixels, y down ----------

/** Outline of a thick polyline: left side out, right side back. Width in px. */
export function ribbon(pts: Pt[], width: number): Pt[] {
  if (pts.length < 2) return []
  const h = width / 2
  const left: Pt[] = []
  const right: Pt[] = []
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(pts.length - 1, i + 1)]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
    const nx = -(b[1] - a[1]) / len
    const ny = (b[0] - a[0]) / len
    left.push([pts[i][0] + nx * h, pts[i][1] + ny * h])
    right.push([pts[i][0] - nx * h, pts[i][1] - ny * h])
  }
  return [...left, ...right.reverse()]
}

export interface PlowFrame {
  /** Iron share at the front of the sole, its tip at the origin on the ground. */
  share: Pt[]
  /** Curved plate above the share that turns the soil over (犁壁). */
  moldboard: Pt[]
  sole: Pt[]
  /** Upright post from the sole to the beam. */
  standard: Pt[]
  /** Handle rising backward from the rear of the sole, and its grip bar. */
  stilt: Pt[]
  grip: Pt[]
  beam: Pt[]
  /** Where the traces (耕索) tie on, at the front of the beam. */
  hitch: Pt
  /** Top of the handle, where the ploughman holds it. */
  handle: Pt
}

/**
 * Side view of a plough pulled toward +x (−x when `flip`), share tip on the ground at the
 * origin. `H` is the height of the handle in px. A straight-beam plough (直辕) has a long
 * horizontal beam ending at `length` px ahead of the share; a curved-beam plough (曲辕) has
 * a short beam arching over and down, so its hitch is low and close.
 */
export function plowFrame(kind: 'curved' | 'straight' = 'curved', H = 64, length?: number, flip = false): PlowFrame {
  if (kind !== 'curved' && kind !== 'straight') throw new Error("v.plow 的 kind 取 'curved'（曲辕犁）或 'straight'（直辕犁）")
  if (!(H > 0)) throw new Error('v.plow 的尺寸要是正数')
  const s = flip ? -1 : 1
  const P = (x: number, y: number): Pt => [s * x * H, y * H]
  const share = [P(0, 0), P(-0.44, 0), P(-0.44, -0.12), P(-0.3, -0.19)]
  // Sits on the share's upper edge and curls up and back.
  const moldboard = [P(-0.1, -0.06), P(-0.3, -0.18), P(-0.44, -0.12), P(-0.6, -0.4), P(-0.48, -0.48), P(-0.32, -0.36)]
  const sole = [P(-0.4, 0), P(-1.0, 0), P(-1.0, -0.11), P(-0.4, -0.11)]
  const stiltLine = [P(-0.93, -0.06), P(-1.05, -0.5), P(-1.17, -0.98)]
  const stilt = ribbon(stiltLine, 0.11 * H)
  const handle = P(-1.17, -0.98)
  const grip = ribbon([P(-1.34, -0.94), P(-1.0, -1.02)], 0.085 * H)
  let beamLine: Pt[]
  let hitch: Pt
  if (kind === 'straight') {
    const L = length != null && length > 0 ? length / H : 2.6
    beamLine = [P(-1.07, -0.62), P(L, -0.62)]
    hitch = P(L, -0.62)
  } else {
    // Quadratic arch from the handle, over the share, down to a low hitch just ahead of it.
    const a: Pt = [-1.06, -0.72]
    const c: Pt = [-0.2, -1.12]
    const b: Pt = [0.55, -0.3]
    beamLine = []
    for (let i = 0; i <= 16; i++) {
      const t = i / 16
      const x = (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0]
      const y = (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]
      beamLine.push(P(x, y))
    }
    hitch = P(b[0], b[1])
  }
  const beam = ribbon(beamLine, 0.11 * H)
  // The post runs from the sole up to wherever the beam passes above it.
  const postX = -0.72
  let topY = -0.62
  if (kind === 'curved') {
    let best = Infinity
    for (const [x, y] of beamLine) {
      const d = Math.abs(x / (s * H) - postX)
      if (d < best) {
        best = d
        topY = y / H
      }
    }
  }
  const standard = ribbon([P(postX, -0.08), P(postX, topY)], 0.085 * H)
  return { share, moldboard, sole, standard, stilt, grip, beam, hitch, handle }
}

export interface EmitterFrame {
  /** Unit direction the spray leaves in, screen y downward. */
  dir: Pt
  /** Capillary needle ending at the tip (origin). */
  needle: Pt[]
  /** Conical nozzle head behind the needle. */
  cone: Pt[]
  barrel: Pt[]
  /** Insulating rear cap; the lead leaves from `back`. */
  cap: Pt[]
  tip: Pt
  back: Pt
}

/**
 * Electrospray emitter (静电推进的发射极) side on: needle tip at the origin, aimed along
 * `angle` degrees (counter-clockwise from +x in world axes), body extending `length` px back.
 */
export function emitterFrame(angle = 0, length = 72): EmitterFrame {
  if (!(length > 0)) throw new Error('v.emitter 的长度要是正数')
  const a = (angle * Math.PI) / 180
  const fx = Math.cos(a)
  const fy = -Math.sin(a)
  const P = (along: number, side: number): Pt => [along * fx - side * fy, along * fy + side * fx]
  const L = length
  const r = Math.max(5, Math.min(14, L * 0.16))
  const needle = [P(0, 0.8), P(-L * 0.24, Math.max(1.2, r * 0.18)), P(-L * 0.24, -Math.max(1.2, r * 0.18)), P(0, -0.8)]
  const cone = [P(-L * 0.22, r * 0.3), P(-L * 0.42, r), P(-L * 0.42, -r), P(-L * 0.22, -r * 0.3)]
  const barrel = [P(-L * 0.42, r), P(-L * 0.9, r), P(-L * 0.9, -r), P(-L * 0.42, -r)]
  const cap = [P(-L * 0.88, r * 0.86), P(-L, r * 0.86), P(-L, -r * 0.86), P(-L * 0.88, -r * 0.86)]
  return { dir: [fx, fy], needle, cone, barrel, cap, tip: [0, 0], back: P(-L, 0) }
}

export interface BackshellFrame {
  /** Silhouette: outer surface from the left rim over the crown to the right rim, closed by the rim. */
  outline: Pt[]
  /** Rim band along the opening, and the flat crown plate on top. */
  lip: Pt[]
  crown: Pt[]
  /** Circumferential seams across the shell, as polylines. */
  seams: Pt[][]
  /** Eye on the crown where the parachute line ties on. */
  apex: Pt
  left: Pt
  right: Pt
}

/**
 * Back cover (背罩) of an entry capsule seen side on: a truncated cone whose walls bow outward
 * a little, a flat crown and a rim band, rim centre at the origin. W rim width, H crown height (px).
 */
export function backshellFrame(W: number, H: number): BackshellFrame {
  if (!(W > 0 && H > 0)) throw new Error('v.backshell 的宽和高要是正数')
  const a = W / 2
  const c = a * 0.34
  const lipH = Math.max(2.5, H * 0.1)
  // Side wall: from the rim (u = 0) to the crown edge (u = 1), bowing outward a little.
  const wall = (u: number): Pt => {
    const x = a + (c - a) * u
    const y = -lipH - (H - lipH) * u
    const bow = Math.sin(Math.PI * u) * W * 0.035
    return [x + bow, y]
  }
  const N = 18
  const right: Pt[] = []
  for (let i = 0; i <= N; i++) right.push(wall(i / N))
  // Up the left wall from the rim to the crown, across, and down the right wall.
  const outer: Pt[] = [[-a, 0], ...right.map(([x, y]) => [-x, y] as Pt), ...right.slice().reverse(), [a, 0]]
  const lip: Pt[] = [[-a, 0], [a, 0], [a, -lipH], [-a, -lipH]]
  const crown: Pt[] = [[-c * 0.92, -H], [c * 0.92, -H], [c * 0.8, -H - Math.max(2, H * 0.06)], [-c * 0.8, -H - Math.max(2, H * 0.06)]]
  const seams: Pt[][] = [0.38, 0.7].map((u) => {
    const [x, y] = wall(u)
    const line: Pt[] = []
    for (let i = 0; i <= 16; i++) {
      const t = -1 + (2 * i) / 16
      // A ring seen nearly edge-on sags slightly in the middle.
      line.push([t * x, y + (1 - t * t) * H * 0.045])
    }
    return line
  })
  return { outline: outer, lip, crown, seams, apex: [0, -H - Math.max(2, H * 0.06)], left: [-a, 0], right: [a, 0] }
}

export interface AirbagFrame {
  outline: Pt[]
  /** Mounting plate under the bag. */
  base: Pt[]
  /** Fold lines across the fabric. */
  seams: Pt[][]
  /** Top of the bag above the press point, after the dent. */
  top: Pt
  left: Pt
  right: Pt
}

/**
 * Inflated airbag on a test bench, side on, bottom centre at the origin. W width, H height,
 * `press` the depth (px) of the dent a falling head makes at `at` px from the centre; the
 * sides bulge a little as it is pressed.
 */
export function airbagFrame(W: number, H: number, press = 0, at = 0): AirbagFrame {
  if (!(W > 0 && H > 0)) throw new Error('v.airbag 的宽和高要是正数')
  const d = Math.max(0, Math.min(press, H * 0.6))
  const a = W / 2
  const plate = Math.max(3, H * 0.08)
  const bulge = 1 + (0.18 * d) / H
  const spread = W * 0.24
  const dent = (x: number) => d * Math.exp(-(((x - at) / spread) ** 2))
  const outline: Pt[] = []
  const N = 48
  // Rounded pillow: x = a cos θ, with flattened top and a bottom that tucks into the plate.
  for (let i = 0; i <= N; i++) {
    const th = Math.PI - (Math.PI * i) / N
    const c = Math.cos(th)
    const sn = Math.sin(th)
    const x = a * bulge * Math.sign(c) * Math.pow(Math.abs(c), 0.7)
    const y = -plate - (H - plate) * Math.pow(sn, 0.45) + dent(x) * Math.pow(sn, 2)
    outline.push([x, Math.min(-plate, y)])
  }
  outline.push([a * 0.86, -plate], [-a * 0.86, -plate])
  const base: Pt[] = [[-a * 0.94, 0], [a * 0.94, 0], [a * 0.94, -plate], [-a * 0.94, -plate]]
  const seams: Pt[][] = []
  for (const f of [0.38, 0.66]) {
    const line: Pt[] = []
    for (let i = 0; i <= 20; i++) {
      const u = -0.78 + (1.56 * i) / 20
      const x = u * a * bulge
      const yTop = -plate - (H - plate) * Math.pow(Math.max(0, 1 - Math.abs(u) ** 1.4), 0.45) + dent(x)
      line.push([x, -plate + (yTop + plate) * f])
    }
    seams.push(line)
  }
  const topAt = outline.reduce((best, p) => (Math.abs(p[0] - at) < Math.abs(best[0] - at) && p[1] < -plate ? p : best), outline[N / 2])
  return { outline, base, seams, top: [at, topAt[1]], left: [-a * bulge, -H * 0.5], right: [a * bulge, -H * 0.5] }
}

export interface AirconFrame {
  kind: 'indoor' | 'outdoor'
  /** Housing box in px relative to the anchor: x, y (top-left), w, h. */
  body: { x: number; y: number; w: number; h: number }
  /** Indoor: air outlet slot and the louver below it. */
  outlet?: { x: number; y: number; w: number; h: number }
  louver?: Pt[]
  /** Outdoor: fan grille. */
  grille?: { c: Pt; r: number }
  /** Outdoor: side vent panel; feet under the box. */
  vents?: { x: number; y: number; w: number; h: number }
  feet?: { x: number; y: number; w: number; h: number }[]
  /** Refrigerant pipe ports (brass service valves outdoors, the pipe stub indoors). */
  ports: Pt[]
  /** Point the air leaves from, and its direction. */
  air: Pt
  airDir: Pt
}

/**
 * Split air conditioner. Indoor unit: wall-mounted, anchored at its centre, outlet on the
 * underside with a louver. Outdoor unit: anchored at the middle of its bottom on the
 * ground, fan grille on the front, vents on the right, pipe valves on the right side.
 */
export function airconFrame(kind: 'indoor' | 'outdoor' = 'indoor', W = 160): AirconFrame {
  if (kind !== 'indoor' && kind !== 'outdoor') throw new Error("v.aircon 的 kind 取 'indoor'（室内机）或 'outdoor'（室外机）")
  if (!(W > 0)) throw new Error('v.aircon 的宽要是正数')
  if (kind === 'indoor') {
    const h = W * 0.3
    const body = { x: -W / 2, y: -h / 2, w: W, h }
    const outlet = { x: -W * 0.4, y: h * 0.22, w: W * 0.8, h: h * 0.16 }
    const ly = h / 2 + h * 0.02
    const louver: Pt[] = [[-W * 0.4, ly], [W * 0.4, ly], [W * 0.38, ly + h * 0.12], [-W * 0.38, ly + h * 0.12]]
    return { kind, body, outlet, louver, ports: [[-W / 2 + W * 0.04, h / 2]], air: [0, ly + h * 0.12], airDir: [0, 1] }
  }
  const h = W * 0.72
  const footH = Math.max(3, h * 0.06)
  const body = { x: -W / 2, y: -h, w: W, h: h - footH }
  const r = (h - footH) * 0.38
  const grille = { c: [-W * 0.1, -footH - (h - footH) / 2] as Pt, r }
  const vents = { x: W * 0.26, y: -h + (h - footH) * 0.14, w: W * 0.17, h: (h - footH) * 0.72 }
  const feet = [
    { x: -W * 0.42, y: -footH, w: W * 0.16, h: footH },
    { x: W * 0.26, y: -footH, w: W * 0.16, h: footH },
  ]
  const ports: Pt[] = [
    [W / 2, -footH - (h - footH) * 0.22],
    [W / 2, -footH - (h - footH) * 0.36],
  ]
  return { kind, body, grille, vents, feet, ports, air: grille.c, airDir: [0, 0] }
}
