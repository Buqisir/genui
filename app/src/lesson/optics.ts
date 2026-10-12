// Geometric optics for <Optics>: trace rays through media with Snell's law,
// total internal reflection, silvered sides, free mirrors and absorbing screens.
// The published object is plain data (numbers, arrays, nested objects). A
// non-enumerable __optics payload carries the outlines and segments v.optics draws.

import { num, symbolsOf, type Scope } from './expr'

const IDENT = /^[A-Za-z][A-Za-z0-9_]*$/

const SHAPE_KEYS = ['points', 'cx', 'cy', 'r', 'inner', 'from', 'to', 'segment', 'xmin', 'xmax', 'ymin', 'ymax', 'rotate', 'about']
const MEDIA_KEYS = ['name', 'n', 'shape', 'mirror', 'label', 'color']
const RAY_KEYS = ['name', 'from', 'angle', 'color', 'n', 'label']
const MIRROR_KEYS = ['line', 'arc']
const SCREEN_KEYS = ['name', 'line']

/** 1 refract, 2 total internal reflection, 3 mirror, 4 screen. */
const KIND = { refract: 1, tir: 2, mirror: 3, screen: 4 } as const

export interface OpticsPiece {
  line?: [number, number, number, number]
  arc?: [number, number, number, number, number]
  /** Unit normal in world space for a straight silvered side (hatch on this side). */
  hx?: number
  hy?: number
  /** +1 hatch away from the arc centre, −1 toward it. */
  radial?: number
}

export interface OpticsDraw {
  media: {
    name: string
    label?: string
    color?: string
    lx: number
    ly: number
    loops: [number, number][][]
    outline: OpticsPiece[]
    silver: OpticsPiece[]
  }[]
  mirrors: OpticsPiece[]
  screens: { name: string; line: [number, number, number, number] }[]
  rays: {
    name: string
    color?: string
    label?: string
    x0: number
    y0: number
    segments: { x1: number; y1: number; x2: number; y2: number; I: number; branch: boolean }[]
    hits: { x: number; y: number; nx: number; ny: number; dx: number; dy: number; tx: number | null; ty: number | null; i: number; r: number | null; kind: number }[]
  }[]
}

interface Pt {
  x: number
  y: number
}

interface Edge {
  kind: 'line' | 'arc'
  ax: number
  ay: number
  bx: number
  by: number
  cx: number
  cy: number
  r: number
  a1: number
  a2: number
  /** Outward unit normal for a line; unused for an arc. */
  nx: number
  ny: number
  /** Arc: outward-from-material = radial × (point − centre). */
  radial: number
  mirror: boolean
  /** Absorbing screen name; empty when this edge is not a screen. */
  screen: string
  /** Free-standing mirror (not the side of a medium). */
  free: boolean
}

interface Medium {
  name: string
  n: number
  contains: (x: number, y: number) => boolean
}

interface RawHit {
  edge: Edge
  t: number
  x: number
  y: number
}

interface RayOut {
  x: number[]
  y: number[]
  i: number[]
  r: number[]
  kind: number[]
  hits: number
  exitAngle: number
  exitX: number
  exitY: number
  endX: number
  endY: number
  opl: number
  len: Record<string, number>
  I: number
  tir: number
  screen: string
  /** Null when the ray never meets a screen. */
  screenX: number | null
  screenY: number | null
}

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

function sweepCCW(a1: number, a2: number): number {
  const raw = a2 - a1
  if (Math.abs(raw) < 1e-9) return 0
  const mod = ((raw % 360) + 360) % 360
  // 360, 720, … land on 0 after the modulo but still mean a full turn.
  if (mod < 1e-6) return 360
  return mod
}

function onArc(ang: number, a1: number, a2: number): boolean {
  const sw = sweepCCW(a1, a2)
  if (sw >= 360 - 1e-4) return true
  const rel = (((ang - a1) % 360) + 360) % 360
  return rel <= sw + 1e-4
}

function angleIn(ang: number, from: number, to: number): boolean {
  return onArc(ang, from, to)
}

/** Degrees in (−180, 180]. */
function wrap180(deg: number): number {
  if (!Number.isFinite(deg)) return deg
  let d = (((deg + 180) % 360) + 360) % 360 - 180
  if (d <= -180) d += 360
  if (Math.abs(d) < 1e-10) d = 0
  return d
}

function rot(x: number, y: number, deg: number, ax: number, ay: number): Pt {
  if (!deg) return { x, y }
  const t = (deg * Math.PI) / 180
  const c = Math.cos(t)
  const s = Math.sin(t)
  const dx = x - ax
  const dy = y - ay
  return { x: ax + c * dx - s * dy, y: ay + s * dx + c * dy }
}

function degOf(p: Pt, c: Pt): number {
  return (Math.atan2(p.y - c.y, p.x - c.x) * 180) / Math.PI
}

function polar(c: Pt, r: number, deg: number): Pt {
  const t = (deg * Math.PI) / 180
  return { x: c.x + r * Math.cos(t), y: c.y + r * Math.sin(t) }
}

function centroid(pts: Pt[]): Pt {
  let a = 0
  let cx = 0
  let cy = 0
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]
    const q = pts[(i + 1) % pts.length]
    const cr = p.x * q.y - q.x * p.y
    a += cr
    cx += (p.x + q.x) * cr
    cy += (p.y + q.y) * cr
  }
  if (Math.abs(a) < 1e-14) {
    const s = pts.reduce((m, p) => ({ x: m.x + p.x, y: m.y + p.y }), { x: 0, y: 0 })
    return { x: s.x / pts.length, y: s.y / pts.length }
  }
  return { x: cx / (3 * a), y: cy / (3 * a) }
}

function inPoly(x: number, y: number, pts: Pt[]): boolean {
  let c = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const yi = pts[i].y
    const yj = pts[j].y
    if (yi > y !== yj > y && x < ((pts[j].x - pts[i].x) * (y - yi)) / (yj - yi) + pts[i].x) c = !c
  }
  return c
}

function distPointSeg(x: number, y: number, a: Pt, b: Pt): number {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const L2 = abx * abx + aby * aby
  if (L2 < 1e-24) return Math.hypot(x - a.x, y - a.y)
  let s = ((x - a.x) * abx + (y - a.y) * aby) / L2
  s = Math.max(0, Math.min(1, s))
  return Math.hypot(x - (a.x + s * abx), y - (a.y + s * aby))
}

function distPointArc(x: number, y: number, e: Edge): number {
  const ang = (Math.atan2(y - e.cy, x - e.cx) * 180) / Math.PI
  const d = Math.hypot(x - e.cx, y - e.cy)
  if (onArc(ang, e.a1, e.a2)) return Math.abs(d - e.r)
  const sw = sweepCCW(e.a1, e.a2)
  const ends = [polar({ x: e.cx, y: e.cy }, e.r, e.a1), polar({ x: e.cx, y: e.cy }, e.r, e.a1 + sw)]
  return Math.min(Math.hypot(x - ends[0].x, y - ends[0].y), Math.hypot(x - ends[1].x, y - ends[1].y))
}

function edgeDist(x: number, y: number, e: Edge): number {
  if (e.kind === 'line') return distPointSeg(x, y, { x: e.ax, y: e.ay }, { x: e.bx, y: e.by })
  return distPointArc(x, y, e)
}

function lineNormal(a: Pt, b: Pt): Pt {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const L = Math.hypot(abx, aby) || 1
  // Left-hand normal of the directed side. outwardNormal flips it if needed.
  return { x: -aby / L, y: abx / L }
}

function outwardOf(mid: Pt, n: Pt, probe: number, contains: (x: number, y: number) => boolean): Pt {
  const aIn = contains(mid.x + n.x * probe, mid.y + n.y * probe)
  const bIn = contains(mid.x - n.x * probe, mid.y - n.y * probe)
  if (aIn && !bIn) return { x: -n.x, y: -n.y }
  return n
}

function sampleArc(c: Pt, r: number, a1: number, a2: number, step = 3): Pt[] {
  const sw = sweepCCW(a1, a2)
  const n = Math.max(2, Math.ceil(sw / step))
  const pts: Pt[] = []
  for (let i = 0; i <= n; i++) pts.push(polar(c, r, a1 + (sw * i) / n))
  return pts
}

function toLoop(pts: Pt[]): [number, number][] {
  const out: [number, number][] = []
  for (const p of pts) {
    const last = out[out.length - 1]
    if (last && Math.hypot(p.x - last[0], p.y - last[1]) < 1e-9) continue
    out.push([p.x, p.y])
  }
  return out
}

interface Scene {
  media: Medium[]
  edges: Edge[]
  draw: OpticsDraw
  /** Longer side of the bounding box, at least 1. Default free path is 3 × this. */
  size: number
}

function evalNum(v: unknown, scope: Scope): number {
  return num(v, scope, NaN)
}

function buildScene(props: Record<string, unknown>, scope: Scope, warnings: string[]): Scene {
  const edges: Edge[] = []
  const media: Medium[] = []
  const draw: OpticsDraw = { media: [], mirrors: [], screens: [], rays: [] }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  const grow = (x: number, y: number) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  const growArc = (c: Pt, r: number, a1: number, a2: number) => {
    const sw = sweepCCW(a1, a2)
    grow(c.x, c.y)
    const n = Math.max(4, Math.ceil(sw / 15))
    for (let i = 0; i <= n; i++) {
      const p = polar(c, r, a1 + (sw * i) / n)
      grow(p.x, p.y)
    }
  }

  const addLine = (a: Pt, b: Pt, mirror: boolean, screen: string, free: boolean, contains?: (x: number, y: number) => boolean): Edge => {
    const base = lineNormal(a, b)
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
    const probe = Math.max(Math.hypot(b.x - a.x, b.y - a.y) * 1e-4, 1e-8)
    const n = contains ? outwardOf(mid, base, probe, contains) : base
    const e: Edge = {
      kind: 'line',
      ax: a.x,
      ay: a.y,
      bx: b.x,
      by: b.y,
      cx: 0,
      cy: 0,
      r: 0,
      a1: 0,
      a2: 0,
      nx: n.x,
      ny: n.y,
      radial: 0,
      mirror,
      screen,
      free,
    }
    edges.push(e)
    grow(a.x, a.y)
    grow(b.x, b.y)
    return e
  }
  const addArc = (c: Pt, r: number, a1: number, a2: number, radial: number, mirror: boolean): Edge => {
    const e: Edge = {
      kind: 'arc',
      ax: 0,
      ay: 0,
      bx: 0,
      by: 0,
      cx: c.x,
      cy: c.y,
      r,
      a1,
      a2,
      nx: 0,
      ny: 0,
      radial,
      mirror,
      screen: '',
      free: false,
    }
    edges.push(e)
    growArc(c, r, a1, a2)
    return e
  }

  const list = (key: string) => (Array.isArray(props[key]) ? (props[key] as unknown[]) : [])

  list('media').forEach((raw, mi) => {
    if (!isObj(raw) || !isObj(raw.shape)) return
    const name = typeof raw.name === 'string' ? raw.name : `介质${mi + 1}`
    const n = evalNum(raw.n, scope)
    if (!(n > 0) || !Number.isFinite(n)) {
      warnings.push(`介质 ${name} 的折射率不是有限正数，这条介质不参与计算`)
      return
    }
    const shape = raw.shape
    const rotDeg = evalNum(shape.rotate ?? 0, scope)
    const ptsOf = (pairs: unknown): Pt[] | null => {
      if (!Array.isArray(pairs)) return null
      const pts: Pt[] = []
      for (const pair of pairs) {
        if (!Array.isArray(pair) || pair.length < 2) return null
        const x = evalNum(pair[0], scope)
        const y = evalNum(pair[1], scope)
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null
        pts.push({ x, y })
      }
      return pts
    }
    let local: Pt[] = []
    let about: Pt | null = null
    const cx0 = shape.cx !== undefined ? evalNum(shape.cx, scope) : NaN
    const cy0 = shape.cy !== undefined ? evalNum(shape.cy, scope) : NaN
    const r0 = shape.r !== undefined ? evalNum(shape.r, scope) : NaN
    const inner0 = shape.inner !== undefined ? evalNum(shape.inner, scope) : NaN
    const from0 = shape.from !== undefined ? evalNum(shape.from, scope) : NaN
    const to0 = shape.to !== undefined ? evalNum(shape.to, scope) : NaN
    const hasPts = shape.points !== undefined
    const hasRect = shape.xmin !== undefined || shape.xmax !== undefined || shape.ymin !== undefined || shape.ymax !== undefined
    const hasCirc = shape.cx !== undefined || shape.cy !== undefined || shape.r !== undefined
    if (hasPts) {
      const pts = ptsOf(shape.points)
      if (!pts || pts.length < 3) {
        warnings.push(`介质 ${name} 的多边形无法计算`)
        return
      }
      local = pts
      about = centroid(pts)
    } else if (hasRect && !hasCirc) {
      const xmin = evalNum(shape.xmin, scope)
      const xmax = evalNum(shape.xmax, scope)
      const ymin = evalNum(shape.ymin, scope)
      const ymax = evalNum(shape.ymax, scope)
      if (![xmin, xmax, ymin, ymax].every(Number.isFinite) || !(xmin < xmax) || !(ymin < ymax)) {
        warnings.push(`介质 ${name} 的矩形无法计算`)
        return
      }
      local = [
        { x: xmin, y: ymin },
        { x: xmax, y: ymin },
        { x: xmax, y: ymax },
        { x: xmin, y: ymax },
      ]
      about = { x: (xmin + xmax) / 2, y: (ymin + ymax) / 2 }
    }
    if (Array.isArray(shape.about) && shape.about.length >= 2) {
      const ax = evalNum(shape.about[0], scope)
      const ay = evalNum(shape.about[1], scope)
      if (Number.isFinite(ax) && Number.isFinite(ay)) about = { x: ax, y: ay }
    }
    const turn = Number.isFinite(rotDeg) ? rotDeg : 0
    const spin = (p: Pt) => (about && turn ? rot(p.x, p.y, turn, about.x, about.y) : p)
    const mirrorIdx = new Set<number>()
    if (Array.isArray(raw.mirror)) for (const k of raw.mirror) if (typeof k === 'number') mirrorIdx.add(k)

    const outline: OpticsPiece[] = []
    const silver: OpticsPiece[] = []
    const loops: [number, number][][] = []
    let contains: (x: number, y: number) => boolean = () => false
    let lx = 0
    let ly = 0

    const silverLine = (a: Pt, b: Pt, n: Pt, on: boolean) => {
      outline.push({ line: [a.x, a.y, b.x, b.y] })
      if (on) silver.push({ line: [a.x, a.y, b.x, b.y], hx: n.x, hy: n.y })
    }
    const silverArc = (c: Pt, r: number, a1: number, a2: number, radial: number, on: boolean) => {
      outline.push({ arc: [c.x, c.y, r, a1, a2] })
      if (on) silver.push({ arc: [c.x, c.y, r, a1, a2], radial })
    }

    if (local.length >= 3 && about) {
      const world = local.map(spin)
      contains = (x, y) => inPoly(x, y, world)
      const closed: Pt[] = []
      for (let k = 0; k < world.length; k++) {
        const a = world[k]
        const b = world[(k + 1) % world.length]
        const e = addLine(a, b, mirrorIdx.has(k), '', false, contains)
        silverLine(a, b, { x: e.nx, y: e.ny }, mirrorIdx.has(k))
        if (!closed.length) closed.push(a)
        closed.push(b)
      }
      loops.push(toLoop(closed))
      const c = centroid(world)
      lx = c.x
      ly = c.y
    } else if (hasCirc) {
      if (![cx0, cy0, r0].every(Number.isFinite) || !(r0 > 0)) {
        warnings.push(`介质 ${name} 的圆无法计算`)
        return
      }
      const cLocal = { x: cx0, y: cy0 }
      const pivot = about ?? cLocal
      const c = turn ? rot(cLocal.x, cLocal.y, turn, pivot.x, pivot.y) : cLocal
      const from = Number.isFinite(from0) ? from0 + turn : NaN
      const to = Number.isFinite(to0) ? to0 + turn : NaN
      const inner = inner0
      const segment = shape.segment === true
      const angled = Number.isFinite(from) && Number.isFinite(to)
      lx = c.x
      ly = c.y
      if (!angled && !Number.isFinite(inner)) {
        contains = (x, y) => (x - c.x) ** 2 + (y - c.y) ** 2 <= r0 * r0
        addArc(c, r0, 0, 360, 1, mirrorIdx.has(0))
        silverArc(c, r0, 0, 360, 1, mirrorIdx.has(0))
        loops.push(toLoop(sampleArc(c, r0, 0, 360)))
      } else if (!angled && Number.isFinite(inner)) {
        if (!(inner > 0) || !(inner < r0)) {
          warnings.push(`介质 ${name} 的圆环无法计算`)
          return
        }
        contains = (x, y) => {
          const d2 = (x - c.x) ** 2 + (y - c.y) ** 2
          return d2 <= r0 * r0 && d2 >= inner * inner
        }
        addArc(c, r0, 0, 360, 1, mirrorIdx.has(0))
        addArc(c, inner, 0, 360, -1, mirrorIdx.has(1))
        silverArc(c, r0, 0, 360, 1, mirrorIdx.has(0))
        silverArc(c, inner, 0, 360, -1, mirrorIdx.has(1))
        loops.push(toLoop(sampleArc(c, r0, 0, 360)))
        loops.push(toLoop(sampleArc(c, inner, 0, 360)))
        const mid = polar(c, (r0 + inner) / 2, turn)
        lx = mid.x
        ly = mid.y
      } else if (segment) {
        const sw = sweepCCW(from, to)
        const A = polar(c, r0, from)
        const B = polar(c, r0, to)
        const mid = polar(c, r0, from + sw / 2)
        contains = (x, y) => {
          if ((x - c.x) ** 2 + (y - c.y) ** 2 > r0 * r0) return false
          const abx = B.x - A.x
          const aby = B.y - A.y
          const sideP = abx * (y - A.y) - aby * (x - A.x)
          const sideM = abx * (mid.y - A.y) - aby * (mid.x - A.x)
          if (Math.abs(sideM) < 1e-10 * r0 * r0) return angleIn(degOf({ x, y }, c), from, to)
          return sideP * sideM >= -1e-12
        }
        addArc(c, r0, from, to, 1, mirrorIdx.has(0))
        const chord = addLine(A, B, mirrorIdx.has(1), '', false, contains)
        silverArc(c, r0, from, to, 1, mirrorIdx.has(0))
        silverLine(A, B, { x: chord.nx, y: chord.ny }, mirrorIdx.has(1))
        const loop = sampleArc(c, r0, from, to)
        loop.push(A)
        loops.push(toLoop(loop))
        const lab = polar(c, r0 * (sw > 180 ? 0.45 : 0.8), from + sw / 2)
        lx = lab.x
        ly = lab.y
      } else if (Number.isFinite(inner) && inner > 0 && inner < r0) {
        contains = (x, y) => {
          const d2 = (x - c.x) ** 2 + (y - c.y) ** 2
          return d2 <= r0 * r0 && d2 >= inner * inner && angleIn(degOf({ x, y }, c), from, to)
        }
        const outerA = polar(c, r0, from)
        const outerB = polar(c, r0, to)
        const innerA = polar(c, inner, from)
        const innerB = polar(c, inner, to)
        addArc(c, r0, from, to, 1, mirrorIdx.has(0))
        const endTo = addLine(outerB, innerB, mirrorIdx.has(1), '', false, contains)
        addArc(c, inner, from, to, -1, mirrorIdx.has(2))
        const endFrom = addLine(innerA, outerA, mirrorIdx.has(3), '', false, contains)
        silverArc(c, r0, from, to, 1, mirrorIdx.has(0))
        silverLine(outerB, innerB, { x: endTo.nx, y: endTo.ny }, mirrorIdx.has(1))
        silverArc(c, inner, from, to, -1, mirrorIdx.has(2))
        silverLine(innerA, outerA, { x: endFrom.nx, y: endFrom.ny }, mirrorIdx.has(3))
        // Inner arc is walked back from `to` to `from`, the reverse of the CCW sector arc.
        const loop = [...sampleArc(c, r0, from, to), ...sampleArc(c, inner, from, to).reverse()]
        loops.push(toLoop(loop))
        const sw = sweepCCW(from, to)
        const lab = polar(c, (r0 + inner) / 2, from + sw / 2)
        lx = lab.x
        ly = lab.y
      } else {
        contains = (x, y) => (x - c.x) ** 2 + (y - c.y) ** 2 <= r0 * r0 && angleIn(degOf({ x, y }, c), from, to)
        const A = polar(c, r0, from)
        const B = polar(c, r0, to)
        addArc(c, r0, from, to, 1, mirrorIdx.has(0))
        const radTo = addLine(c, B, mirrorIdx.has(1), '', false, contains)
        const radFrom = addLine(c, A, mirrorIdx.has(2), '', false, contains)
        silverArc(c, r0, from, to, 1, mirrorIdx.has(0))
        silverLine(c, B, { x: radTo.nx, y: radTo.ny }, mirrorIdx.has(1))
        silverLine(c, A, { x: radFrom.nx, y: radFrom.ny }, mirrorIdx.has(2))
        const loop = [c, ...sampleArc(c, r0, from, to)]
        loops.push(toLoop(loop))
        const sw = sweepCCW(from, to)
        const lab = polar(c, r0 * 0.45, from + sw / 2)
        lx = lab.x
        ly = lab.y
      }
    } else {
      warnings.push(`介质 ${name} 的形状无法计算`)
      return
    }

    media.push({ name, n, contains })
    draw.media.push({
      name,
      label: typeof raw.label === 'string' ? raw.label : undefined,
      color: typeof raw.color === 'string' ? raw.color : undefined,
      lx,
      ly,
      loops,
      outline,
      silver,
    })
  })

  list('mirrors').forEach((raw) => {
    if (!isObj(raw)) return
    if (Array.isArray(raw.line) && raw.line.length >= 4) {
      const a = { x: evalNum(raw.line[0], scope), y: evalNum(raw.line[1], scope) }
      const b = { x: evalNum(raw.line[2], scope), y: evalNum(raw.line[3], scope) }
      if (![a.x, a.y, b.x, b.y].every(Number.isFinite)) {
        warnings.push('一面镜子的坐标不是有限数，已跳过')
        return
      }
      const e = addLine(a, b, true, '', true)
      draw.mirrors.push({ line: [a.x, a.y, b.x, b.y], hx: e.nx, hy: e.ny })
    } else if (Array.isArray(raw.arc) && raw.arc.length >= 5) {
      const c = { x: evalNum(raw.arc[0], scope), y: evalNum(raw.arc[1], scope) }
      const r = evalNum(raw.arc[2], scope)
      const a1 = evalNum(raw.arc[3], scope)
      const a2 = evalNum(raw.arc[4], scope)
      if (![c.x, c.y, r, a1, a2].every(Number.isFinite) || !(r > 0)) {
        warnings.push('一面弧形镜的参数不是有限数，已跳过')
        return
      }
      const e = addArc(c, r, a1, a2, 1, true)
      e.free = true
      draw.mirrors.push({ arc: [c.x, c.y, r, a1, a2], radial: 1 })
    }
  })

  list('screens').forEach((raw) => {
    if (!isObj(raw) || !Array.isArray(raw.line) || raw.line.length < 4) return
    const name = typeof raw.name === 'string' ? raw.name : ''
    const a = { x: evalNum(raw.line[0], scope), y: evalNum(raw.line[1], scope) }
    const b = { x: evalNum(raw.line[2], scope), y: evalNum(raw.line[3], scope) }
    if (![a.x, a.y, b.x, b.y].every(Number.isFinite)) {
      warnings.push(`光屏 ${name || ''} 的坐标不是有限数，已跳过`)
      return
    }
    addLine(a, b, false, name, false)
    draw.screens.push({ name, line: [a.x, a.y, b.x, b.y] })
  })

  list('rays').forEach((raw) => {
    if (!isObj(raw) || !Array.isArray(raw.from)) return
    grow(evalNum(raw.from[0], scope), evalNum(raw.from[1], scope))
  })

  const size = Math.max(1, Number.isFinite(minX) ? Math.max(maxX - minX, maxY - minY) : 1)
  return { media, edges, draw, size }
}

/** Unpolarized Fresnel reflectance. cosI and cosT are both positive. */
function fresnel(n1: number, n2: number, cosI: number, cosT: number): number {
  const rs = (n1 * cosI - n2 * cosT) / (n1 * cosI + n2 * cosT)
  const rp = (n2 * cosI - n1 * cosT) / (n2 * cosI + n1 * cosT)
  const R = (rs * rs + rp * rp) / 2
  return Number.isFinite(R) ? Math.min(1, Math.max(0, R)) : 0
}

interface TraceEnv {
  scene: Scene
  n0: number
  override: Record<string, number>
  sample: number
  advance: number
  hitEps: number
  tie: number
  same: number
  length: number
  maxHits: number
  warnings: string[]
  rayName: string
  warnedCap: boolean
}

function indexAt(env: TraceEnv, x: number, y: number): { n: number; name: string } {
  let n = env.n0
  let name = ''
  for (const m of env.scene.media) {
    if (m.contains(x, y)) {
      name = m.name
      n = env.override[m.name] ?? m.n
    }
  }
  return { n, name }
}

function hitLine(px: number, py: number, dx: number, dy: number, e: Edge, tMin: number): RawHit | null {
  const abx = e.bx - e.ax
  const aby = e.by - e.ay
  if (abx * abx + aby * aby < 1e-24) return null
  const denom = dx * aby - dy * abx
  if (Math.abs(denom) < 1e-12) return null
  const apx = e.ax - px
  const apy = e.ay - py
  const t = (apx * aby - apy * abx) / denom
  const s = (apx * dy - apy * dx) / denom
  if (!(t > tMin) || s < -1e-6 || s > 1 + 1e-6) return null
  return { edge: e, t, x: px + t * dx, y: py + t * dy }
}

function hitArc(px: number, py: number, dx: number, dy: number, e: Edge, tMin: number): RawHit[] {
  const fx = px - e.cx
  const fy = py - e.cy
  const b = fx * dx + fy * dy
  const c = fx * fx + fy * fy - e.r * e.r
  let disc = b * b - c
  if (disc < -1e-10 * e.r * e.r) return []
  if (disc < 0) disc = 0
  const s = Math.sqrt(disc)
  const out: RawHit[] = []
  for (const t of disc === 0 ? [-b] : [-b - s, -b + s]) {
    if (!(t > tMin) || !Number.isFinite(t)) continue
    const x = px + t * dx
    const y = py + t * dy
    const ang = (Math.atan2(y - e.cy, x - e.cx) * 180) / Math.PI
    if (!onArc(ang, e.a1, e.a2)) continue
    out.push({ edge: e, t, x, y })
  }
  return out
}

function nearest(env: TraceEnv, px: number, py: number, dx: number, dy: number): RawHit[] {
  const found: RawHit[] = []
  for (const e of env.scene.edges) {
    if (e.kind === 'line') {
      const h = hitLine(px, py, dx, dy, e, env.hitEps)
      if (h && Number.isFinite(h.x) && Number.isFinite(h.y)) found.push(h)
    } else {
      for (const h of hitArc(px, py, dx, dy, e, env.hitEps)) {
        if (Number.isFinite(h.x) && Number.isFinite(h.y)) found.push(h)
      }
    }
  }
  if (!found.length) return []
  found.sort((a, b) => a.t - b.t)
  const t0 = found[0].t
  return found.filter((h) => h.t <= t0 + env.tie)
}

function geometricNormal(h: RawHit): Pt {
  if (h.edge.kind === 'line') return { x: h.edge.nx, y: h.edge.ny }
  const L = h.edge.r || 1
  const s = h.edge.radial || 1
  return { x: (s * (h.x - h.edge.cx)) / L, y: (s * (h.y - h.edge.cy)) / L }
}

function chooseHit(env: TraceEnv, cands: RawHit[]): RawHit {
  const screen = cands.find((c) => c.edge.screen)
  if (screen) return screen
  const mirror = cands.find((c) => c.edge.mirror)
  if (mirror) return mirror
  for (const c of cands) {
    const N = geometricNormal(c)
    const a = indexAt(env, c.x + N.x * env.sample, c.y + N.y * env.sample)
    const b = indexAt(env, c.x - N.x * env.sample, c.y - N.y * env.sample)
    if (Math.abs(a.n - b.n) > 1e-9) return c
  }
  return cands[0]
}

function faceNormal(n: Pt, dx: number, dy: number): Pt {
  if (dx * n.x + dy * n.y > 0) return { x: -n.x, y: -n.y }
  return n
}

function reflectDir(dx: number, dy: number, nx: number, ny: number): Pt {
  const dot = dx * nx + dy * ny
  const x = dx - 2 * dot * nx
  const y = dy - 2 * dot * ny
  const L = Math.hypot(x, y) || 1
  return { x: x / L, y: y / L }
}

/** Refracted direction, or null on total internal reflection. N faces the incoming ray. */
function refractDir(dx: number, dy: number, nx: number, ny: number, n1: number, n2: number): { dir: Pt; cosT: number } | null {
  const cosI = Math.min(1, Math.max(0, -(dx * nx + dy * ny)))
  const eta = n1 / n2
  const k = 1 - eta * eta * (1 - cosI * cosI)
  // At exactly the critical angle (k ≈ 0 up to rounding) the grazing ray carries no energy;
  // textbooks call it total reflection, so a ray aimed at "90 - C" must not skim the surface.
  if (k < 1e-9) return null
  const cosT = Math.sqrt(k)
  const x = eta * dx + (eta * cosI - cosT) * nx
  const y = eta * dy + (eta * cosI - cosT) * ny
  const L = Math.hypot(x, y) || 1
  return { dir: { x: x / L, y: y / L }, cosT }
}

interface Seg {
  x1: number
  y1: number
  x2: number
  y2: number
  I: number
  branch: boolean
}
interface HitPub {
  x: number
  y: number
  nx: number
  ny: number
  /** Incident direction (unit). */
  dx: number
  dy: number
  /** Transmitted direction; null when the ray reflects or stops. */
  tx: number | null
  ty: number | null
  i: number
  r: number | null
  kind: number
}

interface TraceAcc {
  segments: Seg[]
  hits: HitPub[]
  opl: number
  len: Record<string, number>
  tir: number
  I: number
  exitX: number
  exitY: number
  endX: number
  endY: number
  exitAngle: number
  screen: string
  screenX: number
  screenY: number
  capped: boolean
}

function trace(env: TraceEnv, sx: number, sy: number, px: number, py: number, dx: number, dy: number, intensity: number, budget: number, branch: boolean, acc: TraceAcc) {
  let x = sx
  let y = sy
  let prevX = px
  let prevY = py
  let I = intensity
  let recorded = 0
  let guard = 0
  let stuck = 0
  const cap = env.maxHits
  while (guard++ < cap * 4 + 8 && recorded < cap) {
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) break
    const L = Math.hypot(dx, dy) || 1
    dx /= L
    dy /= L
    const cands = nearest(env, x, y, dx, dy)
    if (!cands.length) break
    const hit = chooseHit(env, cands)
    if (Math.hypot(hit.x - prevX, hit.y - prevY) < env.same) {
      stuck++
      if (stuck > 4) break
      const step = env.advance * (stuck + 2) * 8
      x = prevX + dx * step
      y = prevY + dy * step
      continue
    }
    stuck = 0
    const segLen = Math.hypot(hit.x - prevX, hit.y - prevY)
    const back = Math.min(env.sample, Math.max(segLen * 0.25, env.advance))
    const ahead = back
    const n1 = indexAt(env, hit.x - dx * back, hit.y - dy * back)
    const n2 = indexAt(env, hit.x + dx * ahead, hit.y + dy * ahead)
    const mirror = hit.edge.mirror
    const screen = hit.edge.screen
    if (!screen && !mirror && Math.abs(n1.n - n2.n) < 1e-9) {
      // Same index on both sides: an internal edge, or a vertex that doesn't change medium.
      if (segLen > 0) {
        acc.segments.push({ x1: prevX, y1: prevY, x2: hit.x, y2: hit.y, I, branch })
        const pad = Math.min(back, segLen * 0.25)
        const med = indexAt(env, prevX + dx * pad, prevY + dy * pad)
        acc.opl += med.n * segLen
        if (med.name) acc.len[med.name] = (acc.len[med.name] ?? 0) + segLen
      }
      prevX = hit.x
      prevY = hit.y
      x = hit.x + dx * env.advance
      y = hit.y + dy * env.advance
      continue
    }
    let N = faceNormal(geometricNormal(hit), dx, dy)
    if (!Number.isFinite(N.x) || !Number.isFinite(N.y) || Math.hypot(N.x, N.y) < 1e-8) {
      x = hit.x + dx * env.advance
      y = hit.y + dy * env.advance
      prevX = hit.x
      prevY = hit.y
      continue
    }
    const nL = Math.hypot(N.x, N.y) || 1
    N = { x: N.x / nL, y: N.y / nL }
    const cosI = Math.min(1, Math.max(0, -(dx * N.x + dy * N.y)))
    const iDeg = clean((Math.acos(cosI) * 180) / Math.PI)
    if (segLen > 0) {
      acc.segments.push({ x1: prevX, y1: prevY, x2: hit.x, y2: hit.y, I, branch })
      const pad = Math.min(back, segLen * 0.25)
      const med = indexAt(env, prevX + dx * pad, prevY + dy * pad)
      acc.opl += med.n * segLen
      if (med.name) acc.len[med.name] = (acc.len[med.name] ?? 0) + segLen
    }
    if (screen) {
      if (!branch) {
        acc.hits.push({ x: hit.x, y: hit.y, nx: N.x, ny: N.y, dx, dy, tx: null, ty: null, i: iDeg, r: null, kind: KIND.screen })
        acc.screen = screen
        acc.screenX = hit.x
        acc.screenY = hit.y
      }
      acc.exitX = prevX
      acc.exitY = prevY
      acc.endX = hit.x
      acc.endY = hit.y
      acc.exitAngle = clean(wrap180((Math.atan2(dy, dx) * 180) / Math.PI))
      acc.I = I
      return
    }
    const tir = !mirror && refractDir(dx, dy, N.x, N.y, n1.n, n2.n) === null
    if (mirror || tir) {
      const dir = reflectDir(dx, dy, N.x, N.y)
      if (!branch) {
        acc.hits.push({ x: hit.x, y: hit.y, nx: N.x, ny: N.y, dx, dy, tx: null, ty: null, i: iDeg, r: null, kind: mirror ? KIND.mirror : KIND.tir })
        if (tir) acc.tir++
      }
      recorded++
      prevX = hit.x
      prevY = hit.y
      dx = dir.x
      dy = dir.y
      x = hit.x + dx * env.advance
      y = hit.y + dy * env.advance
      continue
    }
    const bent = refractDir(dx, dy, N.x, N.y, n1.n, n2.n)
    if (!bent) break
    const R = fresnel(n1.n, n2.n, cosI, bent.cosT)
    const rDeg = clean((Math.acos(Math.min(1, bent.cosT)) * 180) / Math.PI)
    if (!branch) acc.hits.push({ x: hit.x, y: hit.y, nx: N.x, ny: N.y, dx, dy, tx: bent.dir.x, ty: bent.dir.y, i: iDeg, r: rDeg, kind: KIND.refract })
    if (budget > 0 && R > 1e-6) {
      const dir = reflectDir(dx, dy, N.x, N.y)
      const child: TraceAcc = {
        segments: acc.segments,
        hits: [],
        opl: 0,
        len: {},
        tir: 0,
        I: 0,
        exitX: hit.x,
        exitY: hit.y,
        endX: hit.x,
        endY: hit.y,
        exitAngle: 0,
        screen: '',
        screenX: NaN,
        screenY: NaN,
        capped: false,
      }
      trace(env, hit.x + dir.x * env.advance, hit.y + dir.y * env.advance, hit.x, hit.y, dir.x, dir.y, I * R, budget - 1, true, child)
    }
    I = I * (1 - R)
    recorded++
    prevX = hit.x
    prevY = hit.y
    dx = bent.dir.x
    dy = bent.dir.y
    x = hit.x + dx * env.advance
    y = hit.y + dy * env.advance
  }
  if (recorded >= cap) {
    acc.capped = true
    if (!branch && !env.warnedCap) {
      env.warnedCap = true
      env.warnings.push(`光线 ${env.rayName} 达到 maxHits（${cap}），追踪提前停止`)
    }
  }
  const endX = prevX + dx * env.length
  const endY = prevY + dy * env.length
  if (Number.isFinite(endX) && Number.isFinite(endY) && Math.hypot(endX - prevX, endY - prevY) > 0) {
    acc.segments.push({ x1: prevX, y1: prevY, x2: endX, y2: endY, I, branch })
  }
  acc.exitX = prevX
  acc.exitY = prevY
  acc.endX = endX
  acc.endY = endY
  acc.exitAngle = clean(wrap180((Math.atan2(dy, dx) * 180) / Math.PI))
  acc.I = I
}

function clean(x: number): number {
  if (!Number.isFinite(x)) return x
  return Math.abs(x) < 1e-9 ? 0 : x
}

function traceRay(env: TraceEnv, ox: number, oy: number, deg: number, budget: number, lenNames: string[]): { pub: RayOut; segments: Seg[]; hits: HitPub[] } {
  const dir = { x: Math.cos((deg * Math.PI) / 180), y: Math.sin((deg * Math.PI) / 180) }
  const len: Record<string, number> = {}
  for (const n of lenNames) len[n] = 0
  const acc: TraceAcc = {
    segments: [],
    hits: [],
    opl: 0,
    len,
    tir: 0,
    I: 1,
    exitX: ox,
    exitY: oy,
    endX: ox,
    endY: oy,
    exitAngle: clean(wrap180(deg)),
    screen: '',
    screenX: NaN,
    screenY: NaN,
    capped: false,
  }
  trace(env, ox, oy, ox, oy, dir.x, dir.y, 1, budget, false, acc)
  const pub: RayOut = {
    x: acc.hits.map((h) => h.x),
    y: acc.hits.map((h) => h.y),
    i: acc.hits.map((h) => h.i),
    r: acc.hits.map((h) => (h.r === null ? NaN : h.r)),
    kind: acc.hits.map((h) => h.kind),
    hits: acc.hits.length,
    exitAngle: acc.exitAngle,
    exitX: acc.exitX,
    exitY: acc.exitY,
    endX: acc.endX,
    endY: acc.endY,
    opl: acc.opl,
    len: acc.len,
    I: acc.I,
    tir: acc.tir,
    screen: acc.screen,
    screenX: Number.isFinite(acc.screenX) ? acc.screenX : null,
    screenY: Number.isFinite(acc.screenY) ? acc.screenY : null,
  }
  return { pub, segments: acc.segments, hits: acc.hits }
}

export interface OpticsRun {
  values: Record<string, unknown>
  warnings: string[]
}

export function runOptics(props: Record<string, unknown>, scope: Scope): OpticsRun {
  const warnings: string[] = []
  const name = typeof props.name === 'string' ? props.name : 'lt'
  const scene = buildScene(props, scope, warnings)
  const n0 = props.n0 === undefined ? 1 : evalNum(props.n0, scope)
  const nSurround = Number.isFinite(n0) && n0 > 0 ? n0 : 1
  if (props.n0 !== undefined && !(Number.isFinite(n0) && n0 > 0)) warnings.push('n0 不是有限正数，按 1 计算')
  const explicit = props.length !== undefined ? evalNum(props.length, scope) : NaN
  const length = Number.isFinite(explicit) && explicit > 0 ? explicit : 3 * scene.size
  const maxHitsRaw = typeof props.maxHits === 'number' ? props.maxHits : 60
  const maxHits = Math.max(1, Math.min(2000, Math.round(maxHitsRaw)))
  const budget = typeof props.reflections === 'number' && props.reflections > 0 ? Math.min(8, Math.floor(props.reflections)) : 0
  const scale = scene.size
  const sample = 1e-4 * scale
  const envBase = {
    scene,
    n0: nSurround,
    sample,
    advance: sample * 0.05,
    hitEps: 1e-9 * scale,
    tie: 1e-7 * scale,
    same: 1e-6 * scale,
    length,
    maxHits,
    warnings,
  }
  const boundaryTol = 1e-5 * scale
  const obj: Record<string, unknown> = {}
  for (const m of scene.media) {
    obj[m.name] = { C: m.n > nSurround ? clean((Math.asin(nSurround / m.n) * 180) / Math.PI) : NaN }
  }
  const rays = Array.isArray(props.rays) ? props.rays : []
  for (const raw of rays) {
    if (!isObj(raw) || typeof raw.name !== 'string') continue
    const from = Array.isArray(raw.from) ? raw.from : []
    const ox = evalNum(from[0], scope)
    const oy = evalNum(from[1], scope)
    const deg = evalNum(raw.angle, scope)
    if (![ox, oy, deg].every(Number.isFinite)) {
      warnings.push(`光线 ${raw.name} 的起点或方向不是有限数，已跳过`)
      continue
    }
    const override: Record<string, number> = {}
    if (isObj(raw.n)) {
      for (const [k, v] of Object.entries(raw.n)) {
        const nv = evalNum(v, scope)
        if (Number.isFinite(nv) && nv > 0) override[k] = nv
      }
    }
    let onMirror = false
    let onBoundary = false
    for (const e of scene.edges) {
      if (edgeDist(ox, oy, e) > boundaryTol) continue
      if (e.mirror) onMirror = true
      else if (!e.free) onBoundary = true
    }
    if (onMirror) warnings.push(`光线 ${raw.name} 的起点正好在镜面上`)
    else if (onBoundary) warnings.push(`光线 ${raw.name} 的起点正好在界面上`)
    const env: TraceEnv = { ...envBase, override, rayName: raw.name, warnedCap: false }
    const { pub, segments, hits } = traceRay(env, ox, oy, deg, budget, scene.media.map((m) => m.name))
    obj[raw.name] = pub
    scene.draw.rays.push({
      name: raw.name,
      color: typeof raw.color === 'string' ? raw.color : undefined,
      label: typeof raw.label === 'string' ? raw.label : undefined,
      x0: ox,
      y0: oy,
      segments,
      hits,
    })
  }
  Object.defineProperty(obj, '__optics', { value: scene.draw, enumerable: false })
  return { values: { [name]: obj }, warnings }
}

/** Plain-data form for the sandbox. Drawing data sits on enumerable `__optics`. */
export function opticsPayload(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') return obj
  const hidden = (obj as { __optics?: unknown }).__optics
  if (!hidden || typeof hidden !== 'object' || !Array.isArray((hidden as OpticsDraw).rays)) return obj
  if (Object.prototype.propertyIsEnumerable.call(obj, '__optics')) return obj
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(obj as object)) out[k] = (obj as Record<string, unknown>)[k]
  out.__optics = hidden
  return out
}

function eachExpr(props: Record<string, unknown>, fn: (v: unknown) => void) {
  fn(props.n0)
  fn(props.length)
  const walkShape = (shape: Record<string, unknown>) => {
    for (const k of ['cx', 'cy', 'r', 'inner', 'from', 'to', 'xmin', 'xmax', 'ymin', 'ymax', 'rotate'] as const) fn(shape[k])
    if (Array.isArray(shape.about)) for (const c of shape.about) fn(c)
    if (Array.isArray(shape.points)) {
      for (const p of shape.points) if (Array.isArray(p)) for (const c of p) fn(c)
    }
  }
  if (Array.isArray(props.media)) {
    for (const m of props.media) {
      if (!isObj(m)) continue
      fn(m.n)
      if (isObj(m.shape)) walkShape(m.shape)
    }
  }
  for (const key of ['mirrors', 'screens'] as const) {
    if (!Array.isArray(props[key])) continue
    for (const item of props[key] as unknown[]) {
      if (!isObj(item)) continue
      for (const coord of [item.line, item.arc]) if (Array.isArray(coord)) for (const c of coord) fn(c)
    }
  }
  if (Array.isArray(props.rays)) {
    for (const r of props.rays) {
      if (!isObj(r)) continue
      fn(r.angle)
      if (Array.isArray(r.from)) for (const c of r.from) fn(c)
      if (isObj(r.n)) for (const v of Object.values(r.n)) fn(v)
    }
  }
}

export function opticsInputs(props: Record<string, unknown>): string[] {
  const out = new Set<string>()
  eachExpr(props, (v) => {
    if (typeof v !== 'string') return
    try {
      for (const s of symbolsOf(v)) out.add(s)
    } catch {
      // the validator reports expressions that do not parse
    }
  })
  return [...out]
}

export function opticsOutputs(name: string): string[] {
  return [name]
}

function sideCount(shape: Record<string, unknown>): number | null {
  if (shape.points !== undefined) return Array.isArray(shape.points) ? shape.points.length : null
  const rect = ['xmin', 'xmax', 'ymin', 'ymax'].some((k) => shape[k] !== undefined)
  const circ = shape.cx !== undefined || shape.cy !== undefined || shape.r !== undefined
  if (rect && !circ && shape.points === undefined) return 4
  if (!circ) return null
  if (shape.segment === true) return 2
  const angled = shape.from !== undefined || shape.to !== undefined
  if (angled && shape.inner !== undefined) return 4
  if (angled) return 3
  if (shape.inner !== undefined) return 2
  return 1
}

export function opticsIssues(
  props: Record<string, unknown>,
  declared: Set<string>,
  userNames: Set<string>,
  err: (m: string) => void,
  expr: (value: unknown, where: string, extra?: string[]) => void,
  keysOnly: (obj: Record<string, unknown>, allowed: string[], where: string) => void,
): void {
  if (typeof props.name !== 'string' || !IDENT.test(props.name)) err('name 应为字母开头的名字')
  else if (userNames.has(props.name)) err(`name ${props.name} 与已声明的名字重复`)
  if (props.n0 !== undefined) expr(props.n0, 'n0')
  if (props.length !== undefined) expr(props.length, 'length')
  if (props.reflections !== undefined && !(typeof props.reflections === 'number' && props.reflections >= 0 && props.reflections <= 8 && Number.isInteger(props.reflections))) {
    err('reflections 应为 0–8 的整数（部分反射追几层；0 表示只追主光线）')
  }
  if (props.maxHits !== undefined && !(typeof props.maxHits === 'number' && props.maxHits >= 1 && props.maxHits <= 2000)) {
    err('maxHits 应在 1–2000 之间')
  }
  const mediaNames: string[] = []
  if (props.media !== undefined && !Array.isArray(props.media)) err('media 应为数组')
  const media = Array.isArray(props.media) ? props.media : []
  media.forEach((raw, i) => {
    const where = `media[${i}]`
    if (!isObj(raw)) return err(`${where} 应为对象`)
    keysOnly(raw, MEDIA_KEYS, where)
    if (typeof raw.name !== 'string' || !IDENT.test(raw.name)) err(`${where}.name 应为字母开头的名字`)
    else mediaNames.push(raw.name)
    if (raw.n === undefined) err(`${where}.n 缺少（折射率）`)
    else expr(raw.n, `${where}.n`)
    if (typeof raw.label === 'string' && !raw.label.trim()) err(`${where}.label 为空`)
    if (raw.color !== undefined && typeof raw.color !== 'string') err(`${where}.color 应为颜色名`)
    if (!isObj(raw.shape)) return err(`${where}.shape 应为对象`)
    const shape = raw.shape
    keysOnly(shape, SHAPE_KEYS, `${where}.shape`)
    const families = [shape.points !== undefined, ['xmin', 'xmax', 'ymin', 'ymax'].some((k) => shape[k] !== undefined), ['cx', 'cy', 'r'].some((k) => shape[k] !== undefined)].filter(Boolean).length
    if (families !== 1) err(`${where}.shape 要恰好是多边形、矩形、圆（或扇形、圆环）中的一种`)
    if (shape.points !== undefined) {
      if (!Array.isArray(shape.points) || shape.points.length < 3) err(`${where}.shape.points 至少 3 个点 [[x, y], ...]`)
      else {
        shape.points.forEach((p, pi) => {
          if (!Array.isArray(p) || p.length < 2) err(`${where}.shape.points[${pi}] 应为 [x, y]`)
          else {
            expr(p[0], `${where}.shape.points[${pi}][0]`)
            expr(p[1], `${where}.shape.points[${pi}][1]`)
          }
        })
      }
    }
    const box = ['xmin', 'xmax', 'ymin', 'ymax'] as const
    if (box.some((k) => shape[k] !== undefined) && shape.points === undefined && shape.cx === undefined) {
      for (const k of box) {
        if (shape[k] === undefined) err(`${where}.shape.${k} 缺少`)
        else expr(shape[k], `${where}.shape.${k}`)
      }
      if (typeof shape.xmin === 'number' && typeof shape.xmax === 'number' && !(shape.xmin < shape.xmax)) err(`${where}.shape 的 xmin 应小于 xmax`)
      if (typeof shape.ymin === 'number' && typeof shape.ymax === 'number' && !(shape.ymin < shape.ymax)) err(`${where}.shape 的 ymin 应小于 ymax`)
    }
    if (shape.cx !== undefined || shape.cy !== undefined || shape.r !== undefined) {
      for (const k of ['cx', 'cy', 'r'] as const) {
        if (shape[k] === undefined) err(`${where}.shape.${k} 缺少`)
        else expr(shape[k], `${where}.shape.${k}`)
      }
      if (typeof shape.r === 'number' && !(shape.r > 0)) err(`${where}.shape.r 应为正数`)
    }
    const ang = ['from', 'to'] as const
    if (ang.some((k) => shape[k] !== undefined)) {
      if (shape.from === undefined || shape.to === undefined) err(`${where}.shape 的 from、to 要一起写（度，从 +x 逆时针）`)
      for (const k of ang) if (shape[k] !== undefined) expr(shape[k], `${where}.shape.${k}`)
      if (shape.cx === undefined) err(`${where}.shape 的 from、to 只和圆一起写`)
    }
    if (shape.inner !== undefined) {
      expr(shape.inner, `${where}.shape.inner`)
      if (typeof shape.inner === 'number' && typeof shape.r === 'number' && !(shape.inner > 0 && shape.inner < shape.r)) err(`${where}.shape.inner 应大于 0 且小于 r`)
      if (shape.cx === undefined) err(`${where}.shape.inner 只和圆一起写`)
    }
    if (shape.segment !== undefined && typeof shape.segment !== 'boolean') err(`${where}.shape.segment 应为布尔值`)
    if (shape.segment === true) {
      if (shape.from === undefined || shape.to === undefined) err(`${where}.shape.segment 要和 from、to 一起写`)
      if (shape.inner !== undefined) err(`${where}.shape 的 segment 不能再写 inner`)
    }
    if (shape.rotate !== undefined) expr(shape.rotate, `${where}.shape.rotate`)
    if (shape.about !== undefined) {
      if (!Array.isArray(shape.about) || shape.about.length < 2) err(`${where}.shape.about 应为 [x, y]`)
      else {
        expr(shape.about[0], `${where}.shape.about[0]`)
        expr(shape.about[1], `${where}.shape.about[1]`)
      }
    }
    const sides = sideCount(shape)
    if (raw.mirror !== undefined) {
      if (!Array.isArray(raw.mirror) || raw.mirror.some((k) => !Number.isInteger(k))) err(`${where}.mirror 应为边的序号数组`)
      else if (sides !== null) {
        for (const k of raw.mirror as number[]) if (k < 0 || k >= sides) err(`${where}.mirror 的序号 ${k} 超出范围（这种形状有 ${sides} 条边，从 0 数）`)
      }
    }
  })
  const dupM = mediaNames.filter((n, i) => mediaNames.indexOf(n) !== i)
  if (dupM.length) err(`介质名字 ${[...new Set(dupM)].join('、')} 重复`)

  if (props.mirrors !== undefined && !Array.isArray(props.mirrors)) err('mirrors 应为数组')
  ;(Array.isArray(props.mirrors) ? props.mirrors : []).forEach((raw, i) => {
    const where = `mirrors[${i}]`
    if (!isObj(raw)) return err(`${where} 应为对象`)
    keysOnly(raw, MIRROR_KEYS, where)
    const hasL = raw.line !== undefined
    const hasA = raw.arc !== undefined
    if (hasL === hasA) err(`${where} 要恰好写 line 或 arc 一个`)
    const coords = (arr: unknown, n: number, what: string) => {
      if (!Array.isArray(arr) || arr.length !== n) err(`${where}.${what} 应为 ${n} 个数或表达式`)
      else arr.forEach((c, ci) => expr(c, `${where}.${what}[${ci}]`))
    }
    if (hasL) coords(raw.line, 4, 'line')
    if (hasA) {
      coords(raw.arc, 5, 'arc')
      const r = Array.isArray(raw.arc) ? raw.arc[2] : undefined
      if (typeof r === 'number' && !(r > 0)) err(`${where}.arc 的半径应为正数`)
    }
  })

  const screenNames: string[] = []
  if (props.screens !== undefined && !Array.isArray(props.screens)) err('screens 应为数组')
  ;(Array.isArray(props.screens) ? props.screens : []).forEach((raw, i) => {
    const where = `screens[${i}]`
    if (!isObj(raw)) return err(`${where} 应为对象`)
    keysOnly(raw, SCREEN_KEYS, where)
    if (typeof raw.name !== 'string' || !IDENT.test(raw.name)) err(`${where}.name 应为字母开头的名字`)
    else screenNames.push(raw.name)
    if (!Array.isArray(raw.line) || raw.line.length !== 4) err(`${where}.line 应为 [x1, y1, x2, y2]`)
    else raw.line.forEach((c, ci) => expr(c, `${where}.line[${ci}]`))
  })
  const dupS = screenNames.filter((n, i) => screenNames.indexOf(n) !== i)
  if (dupS.length) err(`光屏名字 ${[...new Set(dupS)].join('、')} 重复`)

  if (Array.isArray(props.rays) && props.rays.length === 0) err('rays 至少要有一条光线')
  const rayNames: string[] = []
  ;(Array.isArray(props.rays) ? props.rays : []).forEach((raw, i) => {
    const where = `rays[${i}]`
    if (!isObj(raw)) return err(`${where} 应为对象`)
    keysOnly(raw, RAY_KEYS, where)
    if (typeof raw.name !== 'string' || !IDENT.test(raw.name)) err(`${where}.name 应为字母开头的名字`)
    else rayNames.push(raw.name)
    if (!Array.isArray(raw.from) || raw.from.length !== 2) err(`${where}.from 应为 [x, y]`)
    else {
      expr(raw.from[0], `${where}.from[0]`)
      expr(raw.from[1], `${where}.from[1]`)
    }
    if (raw.angle === undefined) err(`${where}.angle 缺少（行进方向，度，从 +x 逆时针）`)
    else expr(raw.angle, `${where}.angle`)
    if (raw.color !== undefined && typeof raw.color !== 'string') err(`${where}.color 应为颜色名，如 red、violet`)
    if (raw.label !== undefined && typeof raw.label !== 'string') err(`${where}.label 应为字符串`)
    if (raw.n !== undefined) {
      if (!isObj(raw.n)) err(`${where}.n 应为 {介质名: 折射率}`)
      else {
        for (const [k, v] of Object.entries(raw.n)) {
          if (!mediaNames.includes(k)) err(`${where}.n 的 ${k} 不是已有介质`)
          expr(v, `${where}.n.${k}`)
        }
      }
    }
  })
  const dupR = rayNames.filter((n, i) => rayNames.indexOf(n) !== i)
  if (dupR.length) err(`光线名字 ${[...new Set(dupR)].join('、')} 重复`)
  for (const n of rayNames) if (mediaNames.includes(n)) err(`光线 ${n} 与介质同名（结果都挂在 ${String(props.name)} 上，名字要能分开）`)
}
