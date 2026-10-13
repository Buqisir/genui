// Canvas 2D backend for the B+ apparatus primitives. Everything is in CSS pixels
// on an already-scaled context. Primitives never change an object's footprint:
// the top band is carved out of the box, so contact geometry stays exact.
import { craftTokens, type CraftTheme, type CraftTokens, type MaterialName, type MaterialTone } from './tokens'

export { craftTokens }

type Ctx = CanvasRenderingContext2D
type Pt = [number, number]
export type OutlineMode = 'auto' | 'strong' | 'soft' | 'none'

/** Bodies bigger than this (px²) get the soft outline under `auto`. */
const SOFT_AREA = 1600

function gradient(ctx: Ctx, tone: MaterialTone, X: number, Y: number, W: number, H: number) {
  const g = tone.horiz ? ctx.createLinearGradient(X, 0, X + W, 0) : ctx.createLinearGradient(0, Y, 0, Y + Math.max(H, 1))
  for (const [o, c] of tone.stops) g.addColorStop(o, c)
  return g
}

function pickLine(k: CraftTokens, mode: OutlineMode | undefined, area: number) {
  if (mode === 'none') return null
  if (mode === 'strong') return k.strong
  if (mode === 'soft') return k.soft
  return area > SOFT_AREA ? k.soft : k.strong
}

function seg(ctx: Ctx, a: Pt, b: Pt, color: string, width: number, alpha = 1) {
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha *= alpha
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.setLineDash([])
  ctx.lineCap = 'butt'
  ctx.beginPath()
  ctx.moveTo(a[0], a[1])
  ctx.lineTo(b[0], b[1])
  ctx.stroke()
  ctx.restore()
}

function brushed(ctx: Ctx, X: number, Y: number, W: number, H: number, theme: CraftTheme) {
  ctx.save()
  ctx.lineWidth = 0.35
  ctx.strokeStyle = '#FFFFFF'
  ctx.globalAlpha *= theme === 'night' ? 0.12 : 0.5
  ctx.beginPath()
  for (let y = Y + 0.5; y < Y + H; y += 2.2) {
    ctx.moveTo(X, y)
    ctx.lineTo(X + W, y)
  }
  ctx.stroke()
  ctx.restore()
}

export interface SolidOptions {
  r?: number
  /** Top band height in px (part of the box). Defaults to 16% of the height, at most 5. */
  band?: number
  line?: OutlineMode
  rim?: boolean
  brush?: boolean
}

/** A lit box: top band with bevel, front gradient, bounce rim, outline by size. */
export function solidRect(ctx: Ctx, X: number, Y: number, W: number, H: number, mat: MaterialName, theme: CraftTheme, o: SolidOptions = {}) {
  if (!(W > 0 && H > 0)) return
  const k = craftTokens(theme)
  const tone = k.materials[mat]
  const r = Math.max(0, Math.min(o.r ?? 1.5, W / 2, H / 2))
  const band = Math.max(0, Math.min(o.band ?? Math.min(H * 0.16, 5), H * 0.45))
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(X, Y, W, H, r)
  ctx.clip()
  ctx.fillStyle = gradient(ctx, tone, X, Y + band, W, H - band)
  ctx.fillRect(X, Y, W, H)
  if (mat === 'alu' && o.brush !== false) brushed(ctx, X, Y, W, H, theme)
  if (band >= 1) {
    ctx.fillStyle = tone.top
    ctx.fillRect(X, Y, W, band)
    seg(ctx, [X + 1, Y + 0.6], [X + W - 1, Y + 0.6], k.bevel, tone.dim ? 0.5 : 0.9, tone.dim ? 0.25 : 1)
    seg(ctx, [X, Y + band], [X + W, Y + band], k.seam, 0.6)
    seg(ctx, [X + 1, Y + band + 0.9], [X + W - 1, Y + band + 0.9], k.bevel, 0.6, tone.dim ? 0.12 : k.glint)
  }
  if (H > 8 && o.rim !== false) seg(ctx, [X + 1.5, Y + H - 1], [X + W - 1.5, Y + H - 1], k.bevel, 0.55, tone.dim ? 0.14 : k.rim)
  ctx.restore()
  const ln = pickLine(k, o.line, W * H)
  if (ln) {
    ctx.beginPath()
    ctx.roundRect(X, Y, W, H, r)
    ctx.strokeStyle = ln.color
    ctx.lineWidth = ln.width
    ctx.setLineDash([])
    ctx.stroke()
  }
}

export interface PolyOptions {
  /** Indices of the lit edge; the band runs along it, inside the polygon. */
  bandEdge?: [number, number]
  band?: number
  line?: OutlineMode
}

function polyPath(ctx: Ctx, pts: Pt[]) {
  ctx.beginPath()
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.closePath()
}

function polyArea(pts: Pt[]) {
  let a = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[(i + 1) % pts.length]
    a += x1 * y2 - x2 * y1
  }
  return Math.abs(a) / 2
}

/** A lit polygon (wedges, ramps). The band follows `bandEdge` instead of the top. */
export function solidPoly(ctx: Ctx, pts: Pt[], mat: MaterialName, theme: CraftTheme, o: PolyOptions = {}) {
  if (pts.length < 3) return
  const k = craftTokens(theme)
  const tone = k.materials[mat]
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const X = Math.min(...xs)
  const Y = Math.min(...ys)
  const W = Math.max(...xs) - X
  const H = Math.max(...ys) - Y
  ctx.save()
  polyPath(ctx, pts)
  ctx.clip()
  ctx.fillStyle = gradient(ctx, tone, X, Y, W, H)
  ctx.fillRect(X - 1, Y - 1, W + 2, H + 2)
  if (o.bandEdge) {
    const a = pts[o.bandEdge[0]]
    const b = pts[o.bandEdge[1]]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
    const cx = xs.reduce((s, v) => s + v, 0) / pts.length
    const cy = ys.reduce((s, v) => s + v, 0) / pts.length
    let nx = -(b[1] - a[1]) / len
    let ny = (b[0] - a[0]) / len
    if ((cx - a[0]) * nx + (cy - a[1]) * ny < 0) {
      nx = -nx
      ny = -ny
    }
    const band = o.band ?? 5
    const off = (d: number, p: Pt): Pt => [p[0] + nx * d, p[1] + ny * d]
    // the band is extended past the ends and trimmed by the clip
    const ex = ((b[0] - a[0]) / len) * band * 3
    const ey = ((b[1] - a[1]) / len) * band * 3
    const a2: Pt = [a[0] - ex, a[1] - ey]
    const b2: Pt = [b[0] + ex, b[1] + ey]
    ctx.fillStyle = tone.top
    polyPath(ctx, [a2, b2, off(band, b2), off(band, a2)])
    ctx.fill()
    seg(ctx, off(0.6, a2), off(0.6, b2), k.bevel, 0.9)
    seg(ctx, off(band, a2), off(band, b2), k.seam, 0.6)
    seg(ctx, off(band + 0.9, a2), off(band + 0.9, b2), k.bevel, 0.6, k.glint)
  }
  ctx.restore()
  const ln = pickLine(k, o.line, polyArea(pts))
  if (ln) {
    polyPath(ctx, pts)
    ctx.strokeStyle = ln.color
    ctx.lineWidth = ln.width
    ctx.lineJoin = 'round'
    ctx.setLineDash([])
    ctx.stroke()
  }
}

/** Vertical end plate on a large face (incline sides, bench ends), with two screws. */
export function endCap(ctx: Ctx, X: number, Y: number, W: number, H: number, theme: CraftTheme) {
  if (!(W > 0 && H > 0)) return
  const k = craftTokens(theme)
  ctx.fillStyle = gradient(ctx, k.materials.cap, X, Y, W, H)
  ctx.fillRect(X, Y, W, H)
  seg(ctx, [X, Y], [X, Y + H], k.seam, 0.6, 1.6)
  seg(ctx, [X + 0.9, Y + 2], [X + 0.9, Y + H - 1], k.bevel, 0.55, k.glint * 0.85)
  if (H > 26) {
    screw(ctx, X + W / 2, Y + Math.min(12, H * 0.2), Math.min(1.9, W * 0.24), theme)
    screw(ctx, X + W / 2, Y + H - Math.min(10, H * 0.18), Math.min(1.9, W * 0.24), theme)
  }
}

export function screw(ctx: Ctx, X: number, Y: number, r: number, theme: CraftTheme) {
  const k = craftTokens(theme)
  ctx.beginPath()
  ctx.arc(X, Y, r, 0, Math.PI * 2)
  ctx.fillStyle = k.screwHead
  ctx.fill()
  ctx.save()
  ctx.strokeStyle = k.strong.color
  ctx.globalAlpha *= 0.7
  ctx.lineWidth = 0.5
  ctx.stroke()
  ctx.restore()
  seg(ctx, [X - r * 0.65, Y + r * 0.4], [X + r * 0.65, Y - r * 0.4], k.screwSlot, 0.5)
}

/** Rubber tyre, aluminium hub with lightening holes, axle cap. */
export function wheel(ctx: Ctx, X: number, Y: number, r: number, theme: CraftTheme) {
  const k = craftTokens(theme)
  const tyre = k.materials.rubber
  ctx.beginPath()
  ctx.arc(X, Y, r, 0, Math.PI * 2)
  ctx.fillStyle = gradient(ctx, tyre, X - r, Y - r, 2 * r, 2 * r)
  ctx.fill()
  ctx.strokeStyle = k.strong.color
  ctx.lineWidth = 0.7
  ctx.stroke()
  ctx.save()
  ctx.globalAlpha *= 0.22
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 0.6
  ctx.beginPath()
  ctx.arc(X, Y, r * 0.93, Math.PI * 1.15, Math.PI * 1.7)
  ctx.stroke()
  ctx.restore()
  ctx.beginPath()
  ctx.arc(X, Y, r * 0.6, 0, Math.PI * 2)
  ctx.fillStyle = gradient(ctx, k.materials.alu, X, Y - r * 0.6, 0, r * 1.2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(20,24,28,0.6)'
  ctx.lineWidth = 0.5
  ctx.stroke()
  if (r >= 6) {
    ctx.fillStyle = theme === 'night' ? '#23262B' : '#8E959E'
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2
      ctx.beginPath()
      ctx.arc(X + Math.cos(a) * r * 0.36, Y + Math.sin(a) * r * 0.36, r * 0.09, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.beginPath()
  ctx.arc(X, Y, Math.max(1, r * 0.15), 0, Math.PI * 2)
  ctx.fillStyle = k.screwHead
  ctx.fill()
  ctx.strokeStyle = k.soft.color
  ctx.lineWidth = 0.4
  ctx.stroke()
}

/** Lit sphere (balls, bobs). */
export function sphere(ctx: Ctx, X: number, Y: number, R: number, mat: MaterialName, theme: CraftTheme, o: { line?: OutlineMode } = {}) {
  if (!(R > 0)) return
  const k = craftTokens(theme)
  const tone = k.materials[mat]
  const g = ctx.createRadialGradient(X - R * 0.35, Y - R * 0.42, R * 0.08, X, Y, R)
  g.addColorStop(0, tone.top)
  g.addColorStop(0.55, tone.stops[Math.floor(tone.stops.length / 2)][1])
  g.addColorStop(1, tone.stops[tone.stops.length - 1][1])
  ctx.beginPath()
  ctx.arc(X, Y, R, 0, Math.PI * 2)
  ctx.fillStyle = g
  ctx.fill()
  if (R > 5) {
    ctx.save()
    ctx.globalAlpha *= tone.dim ? 0.12 : k.rim
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 0.6
    ctx.beginPath()
    ctx.arc(X, Y, R - 1, Math.PI * 0.2, Math.PI * 0.8)
    ctx.stroke()
    ctx.restore()
  }
  const ln = pickLine(k, o.line, Math.PI * R * R)
  if (ln) {
    ctx.beginPath()
    ctx.arc(X, Y, R, 0, Math.PI * 2)
    ctx.strokeStyle = ln.color
    ctx.lineWidth = ln.width
    ctx.setLineDash([])
    ctx.stroke()
  }
}

/** Flat turned disc (pulley face, knob): radial sheen and an inner groove. */
export function disc(ctx: Ctx, X: number, Y: number, R: number, mat: MaterialName, theme: CraftTheme) {
  if (!(R > 0)) return
  const k = craftTokens(theme)
  const tone = k.materials[mat]
  const g = ctx.createLinearGradient(0, Y - R, 0, Y + R)
  for (const [o, c] of tone.stops) g.addColorStop(o, c)
  ctx.beginPath()
  ctx.arc(X, Y, R, 0, Math.PI * 2)
  ctx.fillStyle = g
  ctx.fill()
  if (mat === 'alu') {
    ctx.save()
    ctx.clip()
    ctx.globalAlpha *= theme === 'night' ? 0.1 : 0.35
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 0.35
    for (let rr = R * 0.25; rr < R; rr += 1.8) {
      ctx.beginPath()
      ctx.arc(X, Y, rr, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.restore()
  }
  ctx.save()
  ctx.globalAlpha *= tone.dim ? 0.2 : 0.9
  ctx.strokeStyle = k.bevel
  ctx.lineWidth = 0.7
  ctx.beginPath()
  ctx.arc(X, Y, R - 0.8, Math.PI * 1.1, Math.PI * 1.9)
  ctx.stroke()
  ctx.restore()
  const ln = pickLine(k, 'auto', Math.PI * R * R)
  if (ln) {
    ctx.beginPath()
    ctx.arc(X, Y, R, 0, Math.PI * 2)
    ctx.strokeStyle = ln.color
    ctx.lineWidth = ln.width
    ctx.setLineDash([])
    ctx.stroke()
  }
}

function softEllipse(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, color: string, core: number) {
  if (!(rx > 0 && ry > 0)) return
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(1, ry / rx)
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx)
  g.addColorStop(0, color)
  g.addColorStop(core, color)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(0, 0, rx, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

/** Tight dark line where a body meets the surface under it. */
export function contactShadow(ctx: Ctx, X1: number, X2: number, Y: number, theme: CraftTheme, o: { ry?: number; strength?: number } = {}) {
  const k = craftTokens(theme)
  ctx.save()
  ctx.globalAlpha *= o.strength ?? 1
  softEllipse(ctx, (X1 + X2) / 2, Y + 0.4, Math.abs(X2 - X1) / 2 + 2, o.ry ?? 1.8, k.contact, 0.82)
  ctx.restore()
}

/** Wide diffuse shadow under a large body (bench, apparatus base). */
export function ambientShadow(ctx: Ctx, X1: number, X2: number, Y: number, theme: CraftTheme, o: { ry?: number } = {}) {
  const k = craftTokens(theme)
  softEllipse(ctx, (X1 + X2) / 2, Y, Math.abs(X2 - X1) / 2 + 16, o.ry ?? 9, k.ambient, 0.35)
}

/** Clear glass block: faint body, white edge highlights, two reflection streaks, tinted foot. */
export function glassRect(ctx: Ctx, X: number, Y: number, W: number, H: number, theme: CraftTheme, o: { band?: number } = {}) {
  if (!(W > 0 && H > 0)) return
  const k = craftTokens(theme)
  const band = Math.max(0, Math.min(o.band ?? Math.min(H * 0.1, 5), H * 0.4))
  const g = ctx.createLinearGradient(0, Y, 0, Y + H)
  for (const [off, c] of k.glass.stops) g.addColorStop(off, c)
  ctx.save()
  ctx.beginPath()
  ctx.rect(X, Y, W, H)
  ctx.clip()
  ctx.fillStyle = g
  ctx.fillRect(X, Y, W, H)
  if (band >= 1) {
    ctx.fillStyle = k.glass.top
    ctx.fillRect(X, Y, W, band)
  }
  ctx.fillStyle = '#FFFFFF'
  ctx.globalAlpha *= theme === 'night' ? 0.1 : 0.28
  ctx.beginPath()
  ctx.moveTo(X + W * 0.18, Y + band + 2)
  ctx.lineTo(X + W * 0.34, Y + band + 2)
  ctx.lineTo(X + W * 0.12, Y + H - 2)
  ctx.lineTo(X + 3, Y + H - 2)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha *= 0.65
  ctx.beginPath()
  ctx.moveTo(X + W * 0.42, Y + band + 2)
  ctx.lineTo(X + W * 0.47, Y + band + 2)
  ctx.lineTo(X + W * 0.3, Y + H - 2)
  ctx.lineTo(X + W * 0.25, Y + H - 2)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
  const hi = theme === 'night' ? 0.4 : 0.9
  seg(ctx, [X + 1.2, Y + 1], [X + 1.2, Y + H - 1], '#FFFFFF', 1.2, hi)
  seg(ctx, [X + 1, Y + 0.6], [X + W - 1, Y + 0.6], '#FFFFFF', 1, hi)
  seg(ctx, [X + W - 1, Y + band + 1], [X + W - 1, Y + H - 1], k.glass.edge, 1.1, 0.8)
  seg(ctx, [X + 1, Y + H - 1], [X + W - 1, Y + H - 1], k.glass.foot, 1.4)
  ctx.strokeStyle = k.glass.edge
  ctx.lineWidth = 0.6
  ctx.setLineDash([])
  ctx.strokeRect(X, Y, W, H)
}

/**
 * Spur gear face-on. `pts` is the toothed outline (from gearProfile), R the pitch radius,
 * `root` the root radius. A recessed web with lightening holes (cut through, so the
 * background shows) sits between the rim and an aluminium hub with a keyed bore.
 */
export function gear(ctx: Ctx, X: number, Y: number, R: number, pts: Pt[], root: number, mat: MaterialName, theme: CraftTheme, o: { holes?: number; angle?: number } = {}) {
  if (!(R > 0) || pts.length < 3) return
  const k = craftTokens(theme)
  const tone = k.materials[mat]
  const night = theme === 'night'
  const hub = Math.max(2.5, R * 0.24)
  const webOut = root * 0.8
  const webIn = hub * 1.35
  const a0 = ((o.angle ?? 0) * Math.PI) / 180
  const holes = R >= 34 && webOut - webIn > 8 ? Math.max(0, Math.round(o.holes ?? 5)) : 0
  const holeR = (webOut - webIn) * 0.34
  const holeC = (webOut + webIn) / 2
  const holeAt = (i: number): Pt => {
    const t = a0 + Math.PI / holes + (i * 2 * Math.PI) / holes
    return [X + holeC * Math.cos(t), Y - holeC * Math.sin(t)]
  }
  const body = () => {
    polyPath(ctx, pts)
    for (let i = 0; i < holes; i++) {
      const [hx, hy] = holeAt(i)
      ctx.moveTo(hx + holeR, hy)
      ctx.arc(hx, hy, holeR, 0, Math.PI * 2)
    }
  }
  const g = ctx.createLinearGradient(0, Y - R, 0, Y + R)
  for (const [off, c] of tone.stops) g.addColorStop(off, c)
  ctx.save()
  body()
  ctx.fillStyle = g
  ctx.fill('evenodd')
  ctx.clip('evenodd')
  // Machined face: faint concentric turning marks.
  if (R > 14) {
    ctx.save()
    ctx.globalAlpha *= night ? 0.08 : 0.3
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 0.35
    for (let rr = webOut + 1.5; rr < root; rr += 1.8) {
      ctx.beginPath()
      ctx.arc(X, Y, rr, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.restore()
  }
  // Recessed web: a shade darker, shadowed along its upper inner wall and lit along the lower one.
  if (webOut - webIn > 3) {
    ctx.beginPath()
    ctx.arc(X, Y, webOut, 0, Math.PI * 2)
    ctx.arc(X, Y, webIn, 0, Math.PI * 2, true)
    ctx.fillStyle = night ? 'rgba(0,0,0,0.2)' : 'rgba(30,40,52,0.07)'
    ctx.fill('evenodd')
    ctx.lineWidth = 0.8
    ctx.strokeStyle = night ? 'rgba(0,0,0,0.45)' : 'rgba(30,40,52,0.22)'
    ctx.beginPath()
    ctx.arc(X, Y, webOut, Math.PI * 1.05, Math.PI * 1.95)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(X, Y, webIn, Math.PI * 0.05, Math.PI * 0.95)
    ctx.stroke()
    ctx.globalAlpha *= tone.dim ? 0.2 : k.glint
    ctx.strokeStyle = k.bevel
    ctx.beginPath()
    ctx.arc(X, Y, webOut - 0.8, Math.PI * 0.1, Math.PI * 0.9)
    ctx.stroke()
  }
  ctx.restore()
  // Hole walls: dark on the upper edge (looking into the cut), a glint on the lower edge.
  for (let i = 0; i < holes; i++) {
    const [hx, hy] = holeAt(i)
    ctx.beginPath()
    ctx.arc(hx, hy, holeR, Math.PI * 1.05, Math.PI * 1.95)
    ctx.strokeStyle = night ? 'rgba(0,0,0,0.55)' : 'rgba(30,40,52,0.35)'
    ctx.lineWidth = 0.9
    ctx.stroke()
    seg(ctx, [hx - holeR * 0.5, hy + holeR * 0.86], [hx + holeR * 0.5, hy + holeR * 0.86], k.bevel, 0.6, tone.dim ? 0.15 : k.glint * 0.8)
  }
  // Top light on the upper tooth tips.
  ctx.save()
  ctx.beginPath()
  ctx.rect(X - R * 2, Y - R * 2, R * 4, R * 1.55)
  ctx.clip()
  ctx.translate(0, 0.8)
  polyPath(ctx, pts)
  ctx.globalAlpha *= tone.dim ? 0.2 : k.glint
  ctx.strokeStyle = k.bevel
  ctx.lineWidth = 0.7
  ctx.stroke()
  ctx.restore()
  const ln = pickLine(k, 'auto', Math.PI * R * R)
  if (ln) {
    body()
    ctx.strokeStyle = ln.color
    ctx.lineWidth = ln.width
    ctx.lineJoin = 'round'
    ctx.setLineDash([])
    ctx.stroke()
  }
  disc(ctx, X, Y, hub, 'alu', theme)
  if (hub >= 4) {
    // Bore with a keyway, turned with the gear.
    const bore = hub * 0.42
    ctx.save()
    ctx.translate(X, Y)
    ctx.rotate(-a0)
    ctx.beginPath()
    ctx.arc(0, 0, bore, 0, Math.PI * 2)
    ctx.rect(bore * 0.55, -bore * 0.3, bore * 0.75, bore * 0.6)
    ctx.fillStyle = night ? '#15171A' : '#3A3F46'
    ctx.fill('nonzero')
    ctx.restore()
  } else {
    ctx.beginPath()
    ctx.arc(X, Y, Math.max(1, hub * 0.4), 0, Math.PI * 2)
    ctx.fillStyle = k.screwHead
    ctx.fill()
  }
}

/**
 * Parachute canopy (matte fabric): panels alternate a shade, seams run to the rim,
 * outer panels darken like a curved surface, and the scalloped hem shows the darker
 * underside. `canopy` and `rim` come from parachuteFrame, already placed in pixels.
 */
export function canopy(ctx: Ctx, outline: Pt[], rim: Pt[], hem: Pt[], apex: Pt, theme: CraftTheme) {
  if (outline.length < 3 || rim.length < 2) return
  const k = craftTokens(theme)
  const tone = k.materials.fabric
  const night = theme === 'night'
  const xs = outline.map((p) => p[0])
  const ys = outline.map((p) => p[1])
  const X = Math.min(...xs)
  const Y = Math.min(...ys)
  const W = Math.max(...xs) - X
  const H = Math.max(...ys) - Y
  ctx.save()
  polyPath(ctx, outline)
  ctx.fillStyle = gradient(ctx, tone, X, Y, W, H)
  ctx.fill()
  ctx.clip()
  // Alternate panels a shade darker; each panel is a wedge from the apex to two rim points.
  for (let i = 0; i + 1 < rim.length; i++) {
    if (i % 2 === 0) continue
    ctx.beginPath()
    ctx.moveTo(apex[0], apex[1] - 2)
    ctx.lineTo(rim[i][0], rim[i][1] + 2)
    ctx.lineTo(rim[i + 1][0], rim[i + 1][1] + 2)
    ctx.closePath()
    ctx.fillStyle = night ? 'rgba(0,0,0,0.16)' : 'rgba(30,40,52,0.06)'
    ctx.fill()
  }
  // Curvature: the sides of the dome turn away from the light.
  const side = ctx.createLinearGradient(X, 0, X + W, 0)
  const edge = night ? 'rgba(0,0,0,0.3)' : 'rgba(30,40,52,0.16)'
  side.addColorStop(0, edge)
  side.addColorStop(0.28, 'rgba(0,0,0,0)')
  side.addColorStop(0.72, 'rgba(0,0,0,0)')
  side.addColorStop(1, edge)
  ctx.fillStyle = side
  ctx.fillRect(X - 1, Y - 1, W + 2, H + 2)
  // Seams follow the dome: curved lines from near the apex to each rim point.
  ctx.strokeStyle = k.seam
  ctx.lineWidth = 0.7
  for (let i = 1; i + 1 < rim.length; i++) {
    const [rx, ry] = rim[i]
    ctx.beginPath()
    ctx.moveTo(apex[0] + (rx - apex[0]) * 0.08, apex[1] + 1)
    ctx.quadraticCurveTo(rx * 1.04 + apex[0] * -0.04, apex[1] + (ry - apex[1]) * 0.35, rx, ry)
    ctx.stroke()
  }
  // Lit crown: a soft sheen high on the dome.
  ctx.globalAlpha *= night ? 0.25 : 0.7
  ctx.strokeStyle = k.bevel
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.ellipse(apex[0], apex[1] + H * 0.62, W * 0.42, H * 0.58, 0, Math.PI * 1.22, Math.PI * 1.78)
  ctx.stroke()
  ctx.restore()
  // Underside visible through the hem scallops.
  ctx.save()
  // Straight chord through the rim points (the far hem), then back along the near scalloped hem.
  ctx.beginPath()
  ctx.moveTo(rim[0][0], rim[0][1])
  for (const p of rim.slice(1)) ctx.lineTo(p[0], p[1])
  for (const p of hem) ctx.lineTo(p[0], p[1])
  ctx.closePath()
  ctx.fillStyle = night ? 'rgba(0,0,0,0.35)' : 'rgba(30,40,52,0.16)'
  ctx.fill()
  ctx.restore()
  const ln = pickLine(k, 'auto', W * H * 0.7)
  if (ln) {
    polyPath(ctx, outline)
    ctx.strokeStyle = ln.color
    ctx.lineWidth = ln.width
    ctx.lineJoin = 'round'
    ctx.setLineDash([])
    ctx.stroke()
  }
}

/**
 * A painted part in a fixed colour (magnet poles, coloured knobs): flat paint with the
 * same top light and floor darkening as the metals, outline by size.
 */
export function paintedPoly(ctx: Ctx, pts: Pt[], fill: string, theme: CraftTheme, o: { line?: OutlineMode } = {}) {
  if (pts.length < 3) return
  const k = craftTokens(theme)
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const X = Math.min(...xs)
  const Y = Math.min(...ys)
  const W = Math.max(...xs) - X
  const H = Math.max(...ys) - Y
  ctx.save()
  polyPath(ctx, pts)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.clip()
  const g = ctx.createLinearGradient(0, Y, 0, Y + Math.max(H, 1))
  const night = theme === 'night'
  g.addColorStop(0, night ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.34)')
  g.addColorStop(0.2, night ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)')
  g.addColorStop(0.62, 'rgba(0,0,0,0)')
  g.addColorStop(1, night ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.18)')
  ctx.fillStyle = g
  ctx.fillRect(X - 1, Y - 1, W + 2, H + 2)
  ctx.restore()
  const ln = pickLine(k, o.line, polyArea(pts))
  if (ln) {
    polyPath(ctx, pts)
    ctx.strokeStyle = ln.color
    ctx.lineWidth = ln.width
    ctx.lineJoin = 'round'
    ctx.setLineDash([])
    ctx.stroke()
  }
}

/**
 * A flat wire loop seen in oblique projection, as an ellipse spanned by `rx` and `rz`
 * (pixel offsets of the two radii from `center`). Enamelled copper, the same charge tint
 * the solenoid wire uses, with a sheen on the near half.
 */
export function loopEllipse(ctx: Ctx, center: Pt, rx: Pt, rz: Pt, theme: CraftTheme, color: string) {
  const steps = 48
  const ring: Pt[] = []
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2
    ring.push([center[0] + Math.cos(t) * rx[0] + Math.sin(t) * rz[0], center[1] + Math.cos(t) * rx[1] + Math.sin(t) * rz[1]])
  }
  const k = craftTokens(theme)
  ctx.save()
  polyPath(ctx, ring)
  ctx.lineJoin = 'round'
  ctx.lineWidth = 2.4
  ctx.strokeStyle = color
  ctx.setLineDash([])
  ctx.stroke()
  ctx.lineWidth = 0.7
  ctx.strokeStyle = k.bevel
  ctx.globalAlpha *= theme === 'night' ? 0.3 : 0.65
  ctx.beginPath()
  for (let i = 0; i < steps; i++) {
    if (ring[i][1] > center[1]) continue
    const prev = ring[(i + steps - 1) % steps]
    if (prev[1] > center[1]) ctx.moveTo(ring[i][0], ring[i][1])
    else ctx.lineTo(ring[i][0], ring[i][1])
  }
  ctx.stroke()
  ctx.restore()
}

/**
 * A closed fist in a matte glove (fabric tone). `palm`, `fingers`, `cuff` and `knuckles`
 * come from handFrame, already placed in pixels. Lit from above: the knuckle ridge takes
 * the highlight, the finger wrap reads a shade darker.
 */
/** One rounded part of the fist: matte fabric fill, a top-edge glint, a strong outline. */
function glovePart(ctx: Ctx, pts: Pt[], theme: CraftTheme, shade = 0) {
  if (pts.length < 3) return
  const k = craftTokens(theme)
  const tone = k.materials.fabric
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const X = Math.min(...xs)
  const Y = Math.min(...ys)
  const W = Math.max(...xs) - X
  const H = Math.max(...ys) - Y
  ctx.save()
  polyPath(ctx, pts)
  ctx.fillStyle = gradient(ctx, tone, X, Y, W, Math.max(H, 1))
  ctx.fill()
  if (shade > 0) {
    ctx.clip()
    ctx.fillStyle = theme === 'night' ? 'rgba(0,0,0,' + shade + ')' : 'rgba(30,40,52,' + shade * 0.5 + ')'
    ctx.fillRect(X - 1, Y - 1, W + 2, H + 2)
  }
  ctx.restore()
  seg(ctx, [X + W * 0.15, Y + 1], [X + W * 0.85, Y + 1], k.bevel, 0.8, theme === 'night' ? 0.3 : k.glint)
  polyPath(ctx, pts)
  ctx.strokeStyle = k.strong.color
  ctx.lineWidth = k.strong.width
  ctx.lineJoin = 'round'
  ctx.setLineDash([])
  ctx.stroke()
}

/**
 * Side view of a gloved fist: cuff, back of the hand, four curled fingers a shade darker, and
 * the thumb pressed on top. Each part is a simple rounded shape with its own outline, so the
 * finger divisions read even when the hand is drawn small.
 */
export function fist(ctx: Ctx, parts: { palm: Pt[]; fingers: Pt[][]; thumb: Pt[]; cuff: Pt[] }, theme: CraftTheme) {
  if (parts.cuff.length > 2) solidPoly(ctx, parts.cuff, 'dark', theme, { line: 'strong' })
  if (parts.palm.length > 2) glovePart(ctx, parts.palm, theme)
  for (const f of parts.fingers) glovePart(ctx, f, theme, 0.12)
  if (parts.thumb.length > 2) glovePart(ctx, parts.thumb, theme)
}

/**
 * Inflated fabric bag (airbag): matte fabric fill, sides turning away from the light,
 * fold lines across it, a soft sheen on the crown. `outline` and `seams` from airbagFrame,
 * already placed in pixels.
 */
export function pillow(ctx: Ctx, outline: Pt[], seams: Pt[][], theme: CraftTheme) {
  if (outline.length < 3) return
  const k = craftTokens(theme)
  const tone = k.materials.fabric
  const night = theme === 'night'
  const xs = outline.map((p) => p[0])
  const ys = outline.map((p) => p[1])
  const X = Math.min(...xs)
  const Y = Math.min(...ys)
  const W = Math.max(...xs) - X
  const H = Math.max(...ys) - Y
  ctx.save()
  polyPath(ctx, outline)
  ctx.fillStyle = gradient(ctx, tone, X, Y, W, H)
  ctx.fill()
  ctx.clip()
  const side = ctx.createLinearGradient(X, 0, X + W, 0)
  const edge = night ? 'rgba(0,0,0,0.32)' : 'rgba(30,40,52,0.17)'
  side.addColorStop(0, edge)
  side.addColorStop(0.3, 'rgba(0,0,0,0)')
  side.addColorStop(0.7, 'rgba(0,0,0,0)')
  side.addColorStop(1, edge)
  ctx.fillStyle = side
  ctx.fillRect(X - 1, Y - 1, W + 2, H + 2)
  ctx.strokeStyle = k.seam
  ctx.lineWidth = 0.8
  ctx.setLineDash([])
  for (const line of seams) {
    if (line.length < 2) continue
    ctx.beginPath()
    line.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.stroke()
  }
  ctx.globalAlpha *= night ? 0.25 : 0.75
  ctx.strokeStyle = k.bevel
  ctx.lineWidth = 1.1
  ctx.beginPath()
  ctx.ellipse(X + W / 2, Y + H * 0.55, W * 0.36, H * 0.42, 0, Math.PI * 1.2, Math.PI * 1.8)
  ctx.stroke()
  ctx.restore()
  const ln = pickLine(k, 'auto', W * H * 0.8)
  if (ln) {
    polyPath(ctx, outline)
    ctx.strokeStyle = ln.color
    ctx.lineWidth = ln.width
    ctx.lineJoin = 'round'
    ctx.setLineDash([])
    ctx.stroke()
  }
}

/**
 * Round fan grille (outdoor unit): dark recess, blades turned by `angle` degrees, then
 * concentric guard rings and four spokes over them, and a hub.
 */
export function fanGrille(ctx: Ctx, X: number, Y: number, R: number, theme: CraftTheme, angle = 0) {
  if (!(R > 0)) return
  const k = craftTokens(theme)
  const night = theme === 'night'
  ctx.save()
  ctx.beginPath()
  ctx.arc(X, Y, R, 0, Math.PI * 2)
  const well = ctx.createRadialGradient(X, Y - R * 0.3, R * 0.1, X, Y, R)
  well.addColorStop(0, night ? '#1C1F23' : '#4A5059')
  well.addColorStop(1, night ? '#101215' : '#2B2F35')
  ctx.fillStyle = well
  ctx.fill()
  ctx.clip()
  const blades = 3
  const a0 = (-angle * Math.PI) / 180
  for (let i = 0; i < blades; i++) {
    const a = a0 + (i * 2 * Math.PI) / blades
    ctx.beginPath()
    ctx.moveTo(X, Y)
    ctx.quadraticCurveTo(X + Math.cos(a - 0.5) * R * 0.95, Y + Math.sin(a - 0.5) * R * 0.95, X + Math.cos(a + 0.28) * R * 0.86, Y + Math.sin(a + 0.28) * R * 0.86)
    ctx.quadraticCurveTo(X + Math.cos(a + 0.5) * R * 0.45, Y + Math.sin(a + 0.5) * R * 0.45, X, Y)
    ctx.fillStyle = night ? '#3A3F46' : '#7A828C'
    ctx.fill()
  }
  ctx.restore()
  ctx.save()
  ctx.strokeStyle = night ? 'rgba(226,231,238,0.42)' : 'rgba(238,241,244,0.85)'
  ctx.lineWidth = 0.8
  ctx.setLineDash([])
  for (let f = 0.28; f < 1; f += 0.18) {
    ctx.beginPath()
    ctx.arc(X, Y, R * f, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.beginPath()
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4
    ctx.moveTo(X + Math.cos(a) * R * 0.12, Y + Math.sin(a) * R * 0.12)
    ctx.lineTo(X + Math.cos(a) * R, Y + Math.sin(a) * R)
  }
  ctx.stroke()
  ctx.restore()
  sphere(ctx, X, Y, Math.max(2.5, R * 0.12), 'steel', theme, { line: 'strong' })
  ctx.beginPath()
  ctx.arc(X, Y, R, 0, Math.PI * 2)
  ctx.strokeStyle = k.strong.color
  ctx.lineWidth = k.strong.width
  ctx.stroke()
}
