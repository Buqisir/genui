// Pure geometry for v.solenoid / v.toroid / v.magnet / v.radialField.
// Bundled into the sandbox runtime. The runtime (runtime/*.js) calls these functions; it does not keep a copy.

export type Pt = [number, number]
export type End = 1 | 2 | null

/** sense +1 is a right-handed helix from end 1 to end 2.
 *  current > 0 enters at terminal 1.
 *  The end at which the current is counter-clockwise, looked at from outside, is N.
 *  Same sign → end 2 is N (looking from end 1 toward end 2 the current is clockwise). */
export function solenoidPolarity(sense: number, current: number): { northEnd: End; southEnd: End } {
  const i = Number(current)
  if (!Number.isFinite(i) || i === 0) return { northEnd: null, southEnd: null }
  const s = sense < 0 ? -1 : 1
  const northEnd: 1 | 2 = s * Math.sign(i) > 0 ? 2 : 1
  return { northEnd, southEnd: northEnd === 1 ? 2 : 1 }
}

/** Screen offset of the wire, in units of the tube radius, toward the left of the axis
 *  (the axis direction turned 90° counter-clockwise). `front` is the near half.
 *  The wire sits at (n, depth) = (−cos φ, −sin φ), depth toward the reader, which is a
 *  right-handed helix about the axis for sense +1: the near half descends toward −n
 *  as u goes from 0 to 1, so the near-side current agrees with solenoidPolarity. */
export function helixSample(u: number, turns: number, sense: number, phase = 0): { n: number; front: boolean } {
  const s = sense < 0 ? -1 : 1
  const phi = s * 2 * Math.PI * turns * u + phase
  return { n: -Math.cos(phi), front: Math.sin(phi) < 0 }
}

/** +1 if B inside a toroid runs counter-clockwise, −1 clockwise, 0 if there is no current.
 *  sense +1 and current > 0: the inner crossing is out of the page (⊙), so by Ampère's law
 *  around the centre circle B is counter-clockwise. */
export function toroidCCW(sense: number, current: number): -1 | 0 | 1 {
  const i = Number(current)
  if (!Number.isFinite(i) || i === 0) return 0
  const s = sense < 0 ? -1 : 1
  return s * Math.sign(i) > 0 ? 1 : -1
}

export function coreSpan(core: unknown): { from: number; to: number } | null {
  if (core === true || core === 'iron') return { from: 0, to: 1 }
  if (core && typeof core === 'object') {
    const c = core as { from?: number; to?: number }
    const from = Number.isFinite(c.from) ? (c.from as number) : 0
    const to = Number.isFinite(c.to) ? (c.to as number) : 1
    return from <= to ? { from, to } : { from: to, to: from }
  }
  return null
}

export interface SolenoidOpts {
  r?: number
  turns?: number
  sense?: number
  current?: number
  terminals?: string
  lead?: number
  core?: unknown
}

/** Positions the picture is computed from. `pt(u)` lies on the axis, u = 0 at end 1. */
export function solenoidFrame(x1: number, y1: number, x2: number, y2: number, o: SolenoidOpts = {}) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy)
  if (!(len > 1e-9)) return null
  const ux = dx / len
  const uy = dy / len
  const px = -uy
  const py = ux
  const at = (u: number, w = 0): Pt => [x1 + ux * len * u + px * w, y1 + uy * len * u + py * w]
  const r = o.r && o.r > 0 ? o.r : len * 0.22
  const turns = Math.max(3, Math.min(16, Math.round(o.turns ?? 8)))
  const sense = (o.sense ?? 1) < 0 ? -1 : 1
  const current = Number(o.current) || 0
  const pol = solenoidPolarity(sense, current)
  const term = o.terminals === 'none' ? 'none' : o.terminals === 'above' ? 'above' : 'below'
  const phase = term === 'above' ? Math.PI : 0
  const exitN = term === 'above' ? 1 : -1
  const lead = Number.isFinite(o.lead) ? (o.lead as number) : r * 0.9
  const reach = term === 'none' ? exitN * r : exitN * (r + Math.max(0, lead))
  const end = (e: End): Pt | null => (e === 1 ? at(0, 0) : e === 2 ? at(1, 0) : null)
  return {
    north: end(pol.northEnd),
    south: end(pol.southEnd),
    terminals: [at(0, reach), at(1, reach)] as [Pt, Pt],
    axis: { ux, uy },
    pt: (u: number) => at(u, 0),
    at,
    term,
    exitN,
    reach,
    r,
    turns,
    sense,
    phase,
    len,
    pol,
    core: coreSpan(o.core),
    px,
    py,
  }
}

/** Field lines in axis coordinates: u along the tube (0 at end 1), n in units of r.
 *  Internal arrows point toward N; external arcs run from N back to S. */
export function solenoidLocalLines(count: number, northEnd: 1 | 2): { kind: 'in' | 'out'; pts: Pt[]; sign: number }[] {
  const n = Math.max(1, Math.min(8, Math.round(count)))
  const uN = northEnd === 1 ? 0 : 1
  const uS = 1 - uN
  const lines: { kind: 'in' | 'out'; pts: Pt[]; sign: number }[] = []
  for (let i = 0; i < n; i++) {
    const n0 = n === 1 ? 0 : ((i + 0.5) / n - 0.5) * 0.72
    lines.push({ kind: 'in', pts: [[0.06, n0], [0.94, n0]], sign: northEnd === 2 ? 1 : -1 })
    for (const side of [1, -1]) {
      const bulge = 1.2 + (i / Math.max(1, n - 1)) * 0.65
      const pts: Pt[] = []
      const steps = 18
      for (let k = 0; k <= steps; k++) {
        const t = (Math.PI * k) / steps
        const u = uN + (uS - uN) * (1 - Math.cos(t)) / 2
        const nn = n0 * Math.cos(t) + side * bulge * Math.sin(t)
        pts.push([u, nn])
      }
      lines.push({ kind: 'out', pts, sign: 1 })
    }
  }
  return lines
}

export function dipoleB(x: number, y: number, poles: { x: number; y: number; m: number }[]): Pt {
  let bx = 0
  let by = 0
  for (const p of poles) {
    const dx = x - p.x
    const dy = y - p.y
    const r2 = dx * dx + dy * dy + 1e-8
    const inv = p.m / (r2 * Math.sqrt(r2))
    bx += inv * dx
    by += inv * dy
  }
  return [bx, by]
}

/** Plane field of two poles, B ∝ r̂/r. Lines are closed arcs, which is what a figure can show. */
function pictureB(x: number, y: number, poles: { x: number; y: number; m: number }[]): Pt {
  let bx = 0
  let by = 0
  for (const p of poles) {
    const dx = x - p.x
    const dy = y - p.y
    const r2 = dx * dx + dy * dy + 1e-8
    bx += (p.m * dx) / r2
    by += (p.m * dy) / r2
  }
  return [bx, by]
}

function traceToSouth(start: Pt, poles: { x: number; y: number; m: number }[], step: number, reach: number): Pt[] | null {
  const pts: Pt[] = [[start[0], start[1]]]
  let x = start[0]
  let y = start[1]
  const south = poles[1]
  for (let k = 0; k < 280; k++) {
    const [fx, fy] = pictureB(x, y, poles)
    const mag = Math.hypot(fx, fy) || 1e-12
    x += (fx / mag) * step
    y += (fy / mag) * step
    pts.push([x, y])
    if (Math.hypot(x - south.x, y - south.y) < reach) return pts.length > 5 ? pts : null
  }
  return null
}

/** Bar magnet: arcs leaving the N face and entering the S face. `count` is rounded to an even number of lines. */
export function fieldLinesFromPoles(north: Pt, south: Pt, count: number): Pt[][] {
  const dx = north[0] - south[0]
  const dy = north[1] - south[1]
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const px = -uy
  const py = ux
  const inset = len * 0.06
  const poles = [
    { x: north[0] - ux * inset, y: north[1] - uy * inset, m: 1 },
    { x: south[0] + ux * inset, y: south[1] + uy * inset, m: -1 },
  ]
  const pairs = Math.max(1, Math.min(4, Math.round(count / 2)))
  const lines: Pt[][] = []
  for (let i = 0; i < pairs; i++) {
    const a = 2.05 + (0.7 * i) / Math.max(1, pairs - 1)
    for (const side of [1, -1]) {
      const pad = len * 0.045
      const start: Pt = [north[0] + (ux * Math.cos(a) + px * side * Math.sin(a)) * pad, north[1] + (uy * Math.cos(a) + py * side * Math.sin(a)) * pad]
      const pts = traceToSouth(start, poles, len * 0.045, len * 0.1)
      if (pts) lines.push(pts)
    }
  }
  return lines
}

/** Horseshoe: `normal` points out of both pole faces (down when the opening faces down).
 *  Lines cross the gap; larger ones bulge out past the opening. */
export function gapLines(north: Pt, south: Pt, normal: Pt, count: number): Pt[][] {
  const nlen = Math.hypot(normal[0], normal[1]) || 1
  const nx = normal[0] / nlen
  const ny = normal[1] / nlen
  const dx = south[0] - north[0]
  const dy = south[1] - north[1]
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const inn = len * 0.16
  const poles = [
    { x: north[0] - nx * inn, y: north[1] - ny * inn, m: 1 },
    { x: south[0] - nx * inn, y: south[1] - ny * inn, m: -1 },
  ]
  const n = Math.max(3, Math.min(7, Math.round(count)))
  const lines: Pt[][] = []
  for (let i = 0; i < n; i++) {
    const depth = len * (0.02 + (0.22 * i) / (n - 1))
    const start: Pt = [north[0] + ux * len * 0.05 + nx * depth, north[1] + uy * len * 0.05 + ny * depth]
    const pts = traceToSouth(start, poles, len * 0.04, len * 0.12)
    if (pts) lines.push(pts)
  }
  return lines
}

const NORTH_ANGLE: Record<string, number> = { right: 0, up: 90, left: 180, down: -90 }

export function barFrame(x: number, y: number, w: number, h: number, north = 'right', angle = 0) {
  const base = NORTH_ANGLE[north] ?? 0
  const rot = ((base + angle) * Math.PI) / 180
  const c = Math.cos(rot)
  const s = Math.sin(rot)
  const face = (sign: number): Pt => [x + sign * (w / 2) * c, y + sign * (w / 2) * s]
  return { rot, north: face(1), south: face(-1), ux: c, uy: s, px: -s, py: c, w, h }
}

export function horseshoeGeom(w: number, h: number) {
  const t = Math.min(w, h) * 0.22
  const R = w / 2
  const H = Math.max(h, R + t * 1.4)
  const Ri = Math.max(R - t, R * 0.35)
  const Cy = H / 2 - R
  const yb = -H / 2
  const left: Pt = [-(R - t / 2), yb]
  const right: Pt = [R - t / 2, yb]
  return { t, R, Ri, H, Cy, yb, left, right }
}

export function horseshoeFrame(x: number, y: number, w: number, h: number, north = 'left', angle = 0) {
  const g = horseshoeGeom(w, h)
  const rot = (angle * Math.PI) / 180
  const c = Math.cos(rot)
  const s = Math.sin(rot)
  const map = (p: Pt): Pt => [x + p[0] * c - p[1] * s, y + p[0] * s + p[1] * c]
  const nIsRight = north === 'right'
  return {
    ...g,
    north: map(nIsRight ? g.right : g.left),
    south: map(nIsRight ? g.left : g.right),
    left: map(g.left),
    right: map(g.right),
    map,
  }
}

export interface RadialOpts {
  poles?: string
  north?: string
  dir?: string
  count?: number
  span?: number
}

/** Arrows in the annular gap. `outward` false means the arrow points toward the centre.
 *  Shoes: N side points inward (field leaves the N shoe into the core). */
export function radialArrows(opts: RadialOpts = {}) {
  const layout = opts.poles === 'ring' || opts.poles === 'uniform' ? 'ring' : 'shoes'
  const count = Math.max(4, Math.min(36, Math.round(opts.count || (layout === 'ring' ? 16 : 14))))
  const arrows: { theta: number; outward: boolean; side?: 'left' | 'right' }[] = []
  if (layout === 'ring') {
    const outward = opts.dir !== 'in'
    for (let i = 0; i < count; i++) arrows.push({ theta: (2 * Math.PI * i) / count, outward })
    return { layout, arrows, innerNorth: outward }
  }
  const span = ((opts.span ?? 130) * Math.PI) / 180
  const half = span / 2
  const northRight = opts.north === 'right'
  const nLeft = Math.max(2, Math.round(count / 2))
  const nRight = Math.max(2, count - nLeft)
  const leftOut = northRight
  const rightOut = !northRight
  for (let i = 0; i < nLeft; i++) {
    arrows.push({ theta: Math.PI - half + (span * (i + 0.5)) / nLeft, outward: leftOut, side: 'left' })
  }
  for (let i = 0; i < nRight; i++) {
    arrows.push({ theta: -half + (span * (i + 0.5)) / nRight, outward: rightOut, side: 'right' })
  }
  return { layout, arrows, innerNorth: false, north: northRight ? 'right' : 'left' }
}

export function radialPoles(cx: number, cy: number, rIn: number, rOut: number, opts: RadialOpts = {}) {
  const layout = opts.poles === 'ring' || opts.poles === 'uniform' ? 'ring' : 'shoes'
  const shoe = (rOut - rIn) * 0.7
  if (layout === 'ring') {
    const out = opts.dir !== 'in'
    const inner: Pt = [cx, cy]
    const outer: Pt = [cx + (rOut + shoe * 0.5), cy]
    return { north: out ? inner : outer, south: out ? outer : inner, core: inner, layout, shoe }
  }
  const face = (ang: number): Pt => [cx + rOut * Math.cos(ang), cy + rOut * Math.sin(ang)]
  const left = face(Math.PI)
  const right = face(0)
  const northRight = opts.north === 'right'
  return { north: northRight ? right : left, south: northRight ? left : right, core: [cx, cy] as Pt, layout, shoe }
}

/** Rectangular coil seen along its axis. Positive current: the side at `angle` is out of the page. */
export function coilMarks(angleDeg: number, current: number): { theta: number; out: boolean }[] {
  const a = (angleDeg * Math.PI) / 180
  const sign = Number(current) < 0 ? -1 : 1
  return [
    { theta: a, out: sign > 0 },
    { theta: a + Math.PI, out: sign < 0 },
  ]
}
