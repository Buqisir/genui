import { num } from '../lesson/expr'
import { attachmentPoint, isDirection } from '../lesson/forceLayout'
import { forceExpr, forceUnknowns, type SolvableForce } from '../lesson/forces'
import { forceSpecOf } from '../lesson/solvers'
import type { Props } from '../lesson/parse'
import { namesIn, useScopeFor } from '../lesson/store'
import { colorOf, useTheme } from '../theme'
import { formatNumber, Sym } from './controls'
import { placeLabels, type Box } from './layout'
import { Rich } from './rich'
import { StageHead } from './Sim'
import { AmbientShadow, ContactShadow, CraftDefs, Screw, SolidPoly, SolidRect, Sphere, useCraftId } from '../craft/svg'

interface Surface {
  type?: 'none' | 'ground' | 'incline' | 'ceiling'
  angle?: number | string
  angleLabel?: string
}

interface Body {
  shape?: 'block' | 'ball' | 'particle' | 'rod' | 'knot'
  label?: string
  /** Degrees. Omit to follow the surface; set it to tilt a free body (a leaning rod). */
  angle?: number | string
  /** For particles: '+' or '-' is printed on the body and tints it with the charge colour. */
  charge?: string
}

interface Force extends SolvableForce {
  label: string
  /** "center", "contact", or [x, y] in body half-widths (see attachmentPoint). */
  at?: 'center' | 'contact' | [number | string, number | string]
  /** "direction": dashed guide, fixed length, not a force. */
  role?: string
  color?: string
  unit?: string
  digits?: number
  showValue?: boolean
}

interface Decompose {
  force: number
  axes?: 'incline' | 'xy'
  labels?: [string, string]
}

interface Triangle {
  /** Force indices in the order they are chained head to tail (default: all, as listed). */
  order?: number[]
  /** Label of the closing dashed arrow when the forces do not sum to zero. */
  resultant?: string
  title?: string
  /** Auxiliary circle through the triangle (true, or its label). */
  circle?: boolean | string
  /** Label of the angle marked at the vertex that slides along the circle. */
  angleLabel?: string
}

const W = 640
const H = 380
const BODY_W = 76
const BODY_H = 50
const MAX_LEN = 130
const MIN_LEN = 30
/** Visible length outside the body for a force drawn from its centre. */
const MIN_SHOW = 22
// Dynamic-equilibrium layout (triangle with an auxiliary circle): circle radius, and how
// far arrows plus their labels can reach from the body in any direction.
const TRI_R = 92
const SWING_X = MAX_LEN + 120
const SWING_Y = MAX_LEN + 50
/** Sideways spacing of arrows that point the same way from the same point (heads are ~9 px wide). */
const FAN_GAP = 13
/** Lane spacing when the forces of a "triangle" all lie on one line and are drawn side by side. */
const LANE = 34
/** Direction guides (velocity, a rope) are not forces: one fixed length, never the force scale. */
const GUIDE_LEN = 78

type Vec = [number, number]
const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]]
const mul = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k]
// Physics angles are CCW from +x with y up; the SVG y axis points down.
const dir = (deg: number): Vec => [Math.cos((deg * Math.PI) / 180), -Math.sin((deg * Math.PI) / 180)]

function arrowHead(tip: Vec, from: Vec, size = 11): string {
  const len = Math.hypot(tip[0] - from[0], tip[1] - from[1]) || 1
  const u: Vec = [(tip[0] - from[0]) / len, (tip[1] - from[1]) / len]
  const back = add(tip, mul(u, -size))
  const n: Vec = [-u[1], u[0]]
  const a = add(back, mul(n, size * 0.42))
  const b = add(back, mul(n, -size * 0.42))
  return `${tip[0]},${tip[1]} ${a[0]},${a[1]} ${b[0]},${b[1]}`
}

function Arrow({ from, to, color, dashed }: { from: Vec; to: Vec; color: string; dashed?: boolean }) {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1])
  if (len < 2) return null
  const shaftEnd = add(to, mul([(to[0] - from[0]) / len, (to[1] - from[1]) / len], -9))
  return (
    <g>
      <line
        x1={from[0]}
        y1={from[1]}
        x2={shaftEnd[0]}
        y2={shaftEnd[1]}
        stroke={color}
        strokeWidth={dashed ? 1.8 : 2.6}
        strokeDasharray={dashed ? '5 4' : undefined}
        strokeLinecap="round"
      />
      <polygon points={arrowHead(to, from, dashed ? 9 : 11)} fill={color} opacity={dashed ? 0.8 : 1} />
    </g>
  )
}

export function ForceDiagram({ props }: { props: Props }) {
  const theme = useTheme()
  const cid = useCraftId()
  const scope = useScopeFor(namesIn([props.surface, props.forces, props.guides, props.body, props.scale]))
  const surface = (props.surface ?? { type: 'none' }) as Surface
  const body = (props.body ?? {}) as Body
  const listed = (Array.isArray(props.forces) ? props.forces : []) as Force[]
  const guideList = (Array.isArray(props.guides) ? props.guides : []) as Force[]
  // Guides appended after the real forces, so decompose / triangle indexes are unchanged.
  const forces: Force[] = [...listed, ...guideList.map((g) => ({ ...g, role: 'direction' }))]
  const decompose = props.decompose as Decompose | undefined

  const type = surface.type ?? 'none'
  const theta = type === 'incline' ? num(surface.angle, scope, 30) : 0
  const bodyAngle = body.angle !== undefined ? num(body.angle, scope, theta) : theta
  const uSurf = dir(theta)
  const nSurf = dir(theta + 90)
  const u = dir(bodyAngle)
  const n = dir(bodyAngle + 90)
  const flipped = type === 'ceiling'

  const shape = body.shape ?? 'block'
  const size = {
    block: { w: BODY_W, h: BODY_H },
    ball: { w: BODY_H, h: BODY_H },
    particle: { w: 24, h: 24 },
    rod: { w: 150, h: 16 },
    knot: { w: 10, h: 10 },
  }[shape] ?? { w: BODY_W, h: BODY_H }
  const contact: Vec = flipped ? [W / 2, 120] : [W / 2, 230]
  // The body sits on the surface. Its own axes (u, n) follow body.angle, which defaults to the surface.
  const normal = flipped ? mul(nSurf, -1) : nSurf
  const half = size.h / 2
  const center = add(contact, mul(normal, half))

  const raw = forces.map((f) => num(forceExpr(f, 'magnitude'), scope, 0))
  const biggest = Math.max(0, ...raw.filter(Number.isFinite).map(Math.abs))
  const values = forces.map((f, i) => {
    const guide = isDirection(f)
    // A force that should vanish (friction once the cork is out) comes out as 1e-15 N of
    // rounding; beside the other forces on the same body that is 0. Guides are not forces.
    const m = guide || Math.abs(raw[i]) < biggest * 1e-9 ? 0 : raw[i]
    // A negative magnitude (e.g. a solved friction that points the other way) flips the arrow.
    return { f, guide, angle: num(forceExpr(f, 'angle'), scope, 0) + (!guide && m < 0 ? 180 : 0), mag: guide ? 0 : Math.abs(m) }
  })
  const unknowns = forceUnknowns(forceSpecOf(props))
  // No absolute floor here: forces on an oil drop are ~1e-14 N and must still scale to full length.
  const scaleMax =
    num((props.scale as { max?: unknown } | undefined)?.max, scope, NaN) ||
    Math.max(...values.map((v) => (Number.isFinite(v.mag) ? v.mag : 0))) ||
    1
  const lengthOf = (mag: number) => (mag <= 0 ? 0 : Math.max(MIN_LEN, (MAX_LEN * mag) / scaleMax))

  // Every force is red; the lesson may still tint one to set it apart.
  const forceColor = (i: number) => colorOf(forces[i].color ?? 'force', theme)

  // How far an arrow from the centre runs inside the body before it shows.
  const exitOf = (angle: number) => {
    if (shape === 'ball') return size.w / 2
    if (shape !== 'block') return 0
    const d = dir(angle)
    const along = Math.abs(d[0] * u[0] + d[1] * u[1])
    const across = Math.abs(d[0] * n[0] + d[1] * n[1])
    return Math.min(along > 1e-9 ? size.w / 2 / along : Infinity, across > 1e-9 ? size.h / 2 / across : Infinity)
  }
  const frame = { center, contact, halfW: size.w / 2, halfH: size.h / 2, xAxis: u, yAxis: n }
  const placedArrows = values.map((v, i) => {
    const custom = Array.isArray(v.f.at)
    const fromCenter = !v.guide && v.f.at !== 'contact' && !custom && shape !== 'particle'
    const origin = shape === 'particle' && !custom ? add(center, mul(dir(v.angle), 13)) : attachmentPoint(v.f.at, frame)
    const L = v.guide ? GUIDE_LEN : lengthOf(v.mag)
    // A small force drawn from the centre of a block or ball would end inside it and vanish; it sticks out by at least MIN_SHOW.
    return { ...v, i, origin, L: L > 0 && fromCenter ? Math.max(L, exitOf(v.angle) + MIN_SHOW) : L }
  })
  // Forces pointing the same way from the same point would hide one another (and their
  // labels), so each such group is fanned out sideways; lengths stay to scale.
  const sameWay = (a: (typeof placedArrows)[number], b: (typeof placedArrows)[number]) =>
    Math.abs((((a.angle - b.angle) % 360) + 540) % 360 - 180) < 2 && Math.hypot(a.origin[0] - b.origin[0], a.origin[1] - b.origin[1]) < 1
  const arrows = placedArrows.map((a) => {
    const group = placedArrows.filter((b) => b.L > 0 && sameWay(a, b))
    const j = group.indexOf(a)
    const origin = a.L > 0 && group.length > 1 ? add(a.origin, mul(dir(a.angle + 90), (j - (group.length - 1) / 2) * FAN_GAP)) : a.origin
    return { ...a, origin, tip: add(origin, mul(dir(a.angle), a.L)) }
  })

  // Surface geometry
  const surfaceEls: React.ReactNode[] = []
  if (type === 'incline') {
    const a = add(contact, mul(uSurf, -230))
    const b = add(contact, mul(uSurf, 170))
    const low = theta >= 0 ? a : b
    const high = theta >= 0 ? b : a
    const foot: Vec = [high[0], low[1]]
    surfaceEls.push(
      <ContactShadow key="sh" id={cid} x1={low[0]} x2={foot[0]} y={low[1]} />,
      <SolidPoly key="tri" id={cid} theme={theme} pts={[low, high, foot]} mat="steel" bandEdge={[0, 1]} band={5} />,
    )
    const r = 46
    const start = add(low, [r * Math.sign(high[0] - low[0]), 0])
    const end = add(low, mul(theta >= 0 ? uSurf : mul(uSurf, -1), r))
    surfaceEls.push(
      <path key="arc" d={`M${start[0]},${start[1]} A${r},${r} 0 0 ${theta >= 0 ? 0 : 1} ${end[0]},${end[1]}`} className="fd-arc" />,
    )
    const mid = dir(theta >= 0 ? theta / 2 : 180 + theta / 2)
    const lp = add(low, mul(mid, r + 16))
    surfaceEls.push(
      <text key="arcl" x={lp[0]} y={lp[1] + 4} textAnchor="middle" className="fd-angle">
        {surface.angleLabel ?? `${formatNumber(Math.abs(theta), 0)}°`}
      </text>,
    )
  } else if (type === 'ground' || type === 'ceiling') {
    // a bench slab (or a ceiling beam) in the B+ material, its working face exactly on the contact line
    const y = contact[1]
    const T = 7
    if (!flipped) surfaceEls.push(<AmbientShadow key="amb" id={cid} x1={W / 2 - 170} x2={W / 2 + 170} y={y + T + 4} ry={6} />)
    surfaceEls.push(
      <SolidRect key="g" id={cid} theme={theme} x={W / 2 - 170} y={flipped ? y - T : y} w={340} h={T} mat="steel" band={flipped ? 0 : 2.5} r={1.5} />,
    )
  }

  // Decomposition (dashed components)
  const compEls: React.ReactNode[] = []
  const compLabels: { ax: number; ay: number; text: string }[] = []
  if (decompose && arrows[decompose.force]) {
    const a = arrows[decompose.force]
    const [e1, e2] = decompose.axes === 'xy' ? [dir(0), dir(90)] : [uSurf, nSurf]
    const F: Vec = [a.tip[0] - a.origin[0], a.tip[1] - a.origin[1]]
    const p1 = mul(e1, F[0] * e1[0] + F[1] * e1[1])
    const p2 = mul(e2, F[0] * e2[0] + F[1] * e2[1])
    const t1 = add(a.origin, p1)
    const t2 = add(a.origin, p2)
    const c = forceColor(a.i)
    compEls.push(
      <line key="d1" x1={t1[0]} y1={t1[1]} x2={a.tip[0]} y2={a.tip[1]} className="fd-guide" />,
      <line key="d2" x1={t2[0]} y1={t2[1]} x2={a.tip[0]} y2={a.tip[1]} className="fd-guide" />,
      <Arrow key="c1" from={a.origin} to={t1} color={c} dashed />,
      <Arrow key="c2" from={a.origin} to={t2} color={c} dashed />,
    )
    const [l1, l2] = decompose.labels ?? [`${a.f.label}₁`, `${a.f.label}₂`]
    compLabels.push({ ax: t1[0], ay: t1[1], text: l1 }, { ax: t2[0], ay: t2[1], text: l2 })
  }

  // Labels avoid every arrow shaft and the body itself.
  const obstacles: Box[] = []
  const reach = Math.max(size.w, size.h) / 2 + 4
  const bodyBox: Box = { x: center[0] - reach, y: center[1] - reach, w: reach * 2, h: reach * 2 }
  obstacles.push(bodyBox)

  // Body label goes toward the corner that arrows point at least (weighted by length).
  const live = arrows.filter((a) => a.L > 0)
  const crowd = (deg: number) =>
    live.reduce((s, a) => s + a.L * Math.max(0, Math.cos(((a.angle - deg) * Math.PI) / 180)), 0)
  const inside = shape === 'block' || shape === 'ball'
  let labelPos: Vec
  let labelAnchor: 'start' | 'middle' | 'end'
  if (shape === 'rod') {
    const right = crowd(theta) < crowd(theta + 180)
    labelPos = add(center, mul(u, (right ? 1 : -1) * (size.w / 2 + 10)))
    labelAnchor = right ? 'start' : 'end'
  } else {
    // Corners in the body's own frame, turned with the incline.
    const corners = [45, 135, 225, 315]
    const gapTo = (deg: number) => Math.min(180, ...live.map((a) => Math.abs((((a.angle - deg) % 360) + 540) % 360 - 180)))
    const clear = corners.filter((d) => gapTo(d + theta) >= 25)
    const pool = clear.length ? clear : corners
    const best = pool.reduce((b, d) => (crowd(d + theta) < crowd(b + theta) - 0.5 ? d : b), pool[0])
    const sx = Math.cos((best * Math.PI) / 180) >= 0 ? 1 : -1
    const sy = Math.sin((best * Math.PI) / 180) >= 0 ? 1 : -1
    if (inside) {
      const ox = shape === 'ball' ? size.w * 0.22 : size.w / 2 - 17
      const oy = shape === 'ball' ? size.h * 0.22 : size.h / 2 - 15
      labelPos = add(center, add(mul(u, sx * ox), mul(n, sy * oy)))
      labelAnchor = 'middle'
    } else {
      labelPos = add(center, mul(dir(best + theta), reach + 12))
      labelAnchor = sx > 0 ? 'start' : 'end'
    }
  }
  const cjk = /[\u4e00-\u9fff]/.test(body.label ?? '')
  if (body.label && !inside) {
    const lw = body.label.length * 9 + 6
    obstacles.push({ x: labelAnchor === 'start' ? labelPos[0] : labelPos[0] - lw, y: labelPos[1] - 12, w: lw, h: 18 })
  }
  for (const a of arrows) {
    for (let k = 0.15; k <= 1; k += 0.1) {
      const p = add(a.origin, mul([a.tip[0] - a.origin[0], a.tip[1] - a.origin[1]], k))
      obstacles.push({ x: p[0] - 3, y: p[1] - 3, w: 6, h: 6 })
    }
  }

  // Values go to a list in the top-right corner by default: the picture keeps only symbols,
  // and labels do not grow or jump while a slider changes the digits.
  const inlineValues = props.values === 'inline'
  const valueText = (a: (typeof arrows)[number]) => `${formatNumber(a.mag, a.f.digits)}${a.f.unit ? ' ' + a.f.unit : ''}`
  const labelText = (a: (typeof arrows)[number]) => (a.f.showValue && inlineValues ? `${a.f.label} = ${valueText(a)}` : a.f.label)
  const valueRows = inlineValues ? [] : arrows.filter((a) => a.f.showValue && !a.guide && a.L > 0)
  const placed = placeLabels(
    [
      ...arrows.filter((a) => a.L > 0).map((a) => ({ ax: a.tip[0], ay: a.tip[1], text: labelText(a), fontSize: 14 })),
      ...compLabels.map((l) => ({ ...l, fontSize: 12 })),
    ],
    { x: 4, y: 4, w: W - 8, h: H - 8 },
    obstacles,
  )
  const shown = arrows.filter((a) => a.L > 0)
  const arrowCount = shown.length
  const hasGuide = arrows.some((a) => a.guide && a.L > 0)

  const rot = -bodyAngle

  // A knot is where ropes meet: every force is a rope tension, so draw the rope
  // running past the arrow tip to show what is pulling.
  const ropeEnds = shape === 'knot' ? arrows.filter((a) => a.L > 0).map((a) => add(center, mul(dir(a.angle), a.L + 36))) : []
  const ropes = ropeEnds.map((e, i) => <line key={'rope' + i} x1={center[0]} y1={center[1]} x2={e[0]} y2={e[1]} className="fd-rope" />)

  // Crop to the drawing so a two-arrow diagram is not lost in a big empty canvas.
  const mainPts: Vec[] = [
    [bodyBox.x, bodyBox.y],
    [bodyBox.x + bodyBox.w, bodyBox.y + bodyBox.h],
    ...arrows.flatMap((a) => [a.origin, a.tip]),
    ...ropeEnds,
    ...placed.flatMap((l): Vec[] => [
      [l.x, l.y],
      [l.x + l.w, l.y + l.h],
    ]),
  ]
  if (type === 'incline') {
    mainPts.push(add(contact, mul(u, -230)), add(contact, mul(u, 170)))
    mainPts.push([contact[0] + 170 * Math.cos((theta * Math.PI) / 180), contact[1] + 10])
  } else if (type === 'ground' || type === 'ceiling') {
    mainPts.push([W / 2 - 170, contact[1] + (flipped ? -12 : 12)], [W / 2 + 170, contact[1]])
  }
  if (body.label && !inside) mainPts.push([labelPos[0] + (labelAnchor === 'start' ? 1 : -1) * (body.label.length * 9 + 6), labelPos[1] - 14])

  // Vector triangle: the same forces chained head to tail beside the diagram, drawn
  // to true scale (no minimum length) so closure is honest.
  const triOpt: Triangle | undefined = props.triangle === true ? {} : props.triangle && typeof props.triangle === 'object' ? (props.triangle as Triangle) : undefined
  const tri = (() => {
    if (!triOpt) return null
    const order = (Array.isArray(triOpt.order) ? triOpt.order : values.map((_, i) => i)).filter((i) => values[i] && values[i].mag > 0)
    if (order.length < 2) return null
    const k = MAX_LEN / scaleMax
    const chain: Vec[] = [[0, 0]]
    for (const i of order) chain.push(add(chain[chain.length - 1], mul(dir(values[i].angle), values[i].mag * k)))
    const end = chain[chain.length - 1]
    const maxMag = Math.max(...order.map((i) => values[i].mag))
    // "合力为零" is a claim about the numbers, so it needs the forces to really cancel; a real
    // residual (ma = 0.05 N beside 5 N forces) is reported even when it is too short to see.
    const gap = Math.hypot(end[0], end[1]) / k
    const closed = gap <= 1e-4 * maxMag
    const looksClosed = gap * k <= Math.max(2, 0.03 * maxMag * k)
    const visibleGap = gap * k >= 4
    const mainMaxX = Math.min(W, Math.max(...mainPts.map((p) => p[0])))
    const xs = chain.map((p) => p[0])
    const ys = chain.map((p) => p[1])

    // Dynamic equilibrium with one fixed force and a fixed angle between the other two:
    // the third vertex rides on a circle through the fixed side (inscribed angle γ).
    // Built from the force directions rather than the vertices, so it stays defined
    // when one of the varying forces is momentarily zero.
    const declared = Array.isArray(triOpt.order) ? triOpt.order : values.map((_, i) => i)
    let circle: { c: Vec; r: number; vertex: Vec; rays: [Vec, Vec]; cross: number; away: Vec; f: number } | null = null
    if (triOpt.circle && looksClosed && declared.length === 3 && declared.every((i) => values[i]) && values[declared[0]].mag > 0) {
      const [fa, fb, fc] = declared.map((i) => values[i])
      const a = mul(dir(fa.angle), fa.mag * k)
      const L = Math.hypot(a[0], a[1])
      const db = dir(fb.angle)
      const dc = dir(fc.angle)
      const cross = db[0] * dc[1] - db[1] * dc[0]
      if (Math.abs(cross) > 0.02) {
        const cosG = -(db[0] * dc[0] + db[1] * dc[1])
        const r = L / (2 * Math.abs(cross))
        const ua: Vec = [a[0] / L, a[1] / L]
        const side = Math.sign(cross)
        const toVertex: Vec = [-ua[1] * side, ua[0] * side]
        const c = add(mul(a, 0.5), mul(toVertex, r * cosG))
        // The circle is drawn at one fixed size: proportions stay true, and the fixed
        // side keeps its length however the force scale changes while dragging.
        const f = TRI_R / r
        circle = { c: mul(c, f), r: TRI_R, vertex: mul(add(a, mul(db, fb.mag * k)), f), rays: [mul(db, -1), dc], cross, away: mul(toVertex, -1), f }
      }
    }
    // Forces on one line give a degenerate "triangle" whose sides overlap, so they are laid
    // side by side in lanes instead, each one starting level with where the previous ended.
    const d0 = dir(values[order[0]].angle)
    const collinear = !circle && order.every((i) => Math.abs(d0[0] * dir(values[i].angle)[1] - d0[1] * dir(values[i].angle)[0]) < 0.02)
    if (collinear) {
      let pn: Vec = [-d0[1], d0[0]]
      if (pn[0] < -1e-9 || (Math.abs(pn[0]) < 1e-9 && pn[1] < 0)) pn = mul(pn, -1)
      const lane = (p: Vec, j: number) => add(p, mul(pn, j * LANE))
      const raw = order.map((i, j) => ({ i, from: lane(chain[j], j), to: lane(chain[j + 1], j) }))
      const res = closed || !visibleGap ? null : { from: lane(chain[0], order.length), to: lane(end, order.length) }
      const links: [Vec, Vec][] = raw.slice(1).map((s, j) => [raw[j].to, s.from])
      if (res) links.push([raw[0].from, res.from], [raw[raw.length - 1].to, res.to])
      else links.push([raw[raw.length - 1].to, raw[0].from])
      const all = [...raw.flatMap((s) => [s.from, s.to]), ...(res ? [res.from, res.to] : [])]
      const lx = all.map((p) => p[0])
      const ly = all.map((p) => p[1])
      const shift: Vec = [mainMaxX + 56 - Math.min(...lx), center[1] - (Math.min(...ly) + Math.max(...ly)) / 2]
      const sh = (p: Vec) => add(p, shift)
      // Each label sits between its lane and the next one, level with the middle of its arrow.
      const between = (a: Vec, b: Vec, text: string) => ({ pos: add(mul(add(sh(a), sh(b)), 0.5), mul(pn, LANE / 2)), text })
      const sides = raw.map((s) => ({ i: s.i, from: sh(s.from), to: sh(s.to), label: between(s.from, s.to, forces[s.i].label) }))
      const resultant = res ? { from: sh(res.from), to: sh(res.to), label: between(res.from, res.to, triOpt.resultant ?? 'F_{合}') } : null
      const P = all.map(sh)
      const labelYs = [...sides.map((s) => s.label.pos[1]), ...(resultant ? [resultant.label.pos[1]] : [])]
      const top = Math.min(...P.map((p) => p[1]), ...labelYs.map((y) => y - 10))
      const bottom = Math.max(...P.map((p) => p[1]), ...labelYs.map((y) => y + 4))
      const cx = (Math.min(...P.map((p) => p[0])) + Math.max(...P.map((p) => p[0]))) / 2
      return {
        sides,
        resultant,
        closed,
        gap,
        title: triOpt.title ?? '矢量图（力在同一直线上，错开并排画）',
        titlePos: [cx, top - 26] as Vec,
        notePos: [cx, bottom + 30] as Vec,
        P,
        aux: null,
        links: links.map(([a, b]) => [sh(a), sh(b)] as [Vec, Vec]),
        lanes: true,
      }
    }
    // With a circle the triangle is pinned by it, so dragging a slider moves only the
    // sliding vertex instead of re-centring the whole triangle every frame.
    const off: Vec = circle
      ? [center[0] + SWING_X + 30 - (circle.c[0] - circle.r), center[1] - circle.c[1]]
      : [mainMaxX + 56 - Math.min(...xs), center[1] - (Math.min(...ys) + Math.max(...ys)) / 2]
    const P = chain.map((p) => add(mul(p, circle ? circle.f : 1), off))
    const centroid = mul(P.slice(0, -1).reduce(add, [0, 0] as Vec), 1 / (P.length - 1))
    const sideLabel = (a: Vec, b: Vec, text: string) => {
      const mid = mul(add(a, b), 0.5)
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
      let nrm: Vec = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len]
      if ((mid[0] - centroid[0]) * nrm[0] + (mid[1] - centroid[1]) * nrm[1] < 0) nrm = mul(nrm, -1)
      // A short side is mostly arrowhead, and a label above a side hangs its subscript
      // down toward the line; both need extra clearance.
      const gap = 15 + (len < 40 ? 6 : 0) + (nrm[1] < -0.5 ? 4 : 0)
      return { pos: add(mid, mul(nrm, gap)), text }
    }
    const sides = order.map((i, j) => ({ i, from: P[j], to: P[j + 1], label: sideLabel(P[j], P[j + 1], forces[i].label) }))
    const resultant = closed || !visibleGap ? null : { from: P[0], to: P[P.length - 1], label: sideLabel(P[0], P[P.length - 1], triOpt.resultant ?? 'F_{合}') }
    const labelYs = [...sides.map((s) => s.label.pos[1]), ...(resultant ? [resultant.label.pos[1]] : [])]
    const top = Math.min(...P.map((p) => p[1]), ...labelYs.map((y) => y - 10))
    const bottom = Math.max(...P.map((p) => p[1]), ...labelYs.map((y) => y + 4))
    const cx = (Math.min(...P.map((p) => p[0])) + Math.max(...P.map((p) => p[0]))) / 2
    const title = triOpt.title ?? '矢量三角形'
    if (circle) {
      const c = add(circle.c, off)
      const R = circle.r
      const vertex = add(circle.vertex, off)
      const ar = 16
      const [ra, rb] = circle.rays
      type Anchor = 'start' | 'end' | 'middle'
      const anchor = (d: Vec): Anchor => (d[0] > 0.35 ? 'start' : d[0] < -0.35 ? 'end' : 'middle')
      const widthOf = (s: string, cjk: number, other: number) => [...s.replace(/[_{}]/g, '')].reduce((w, ch) => w + (/[\u4e00-\u9fff]/.test(ch) ? cjk : other), 0)
      // Boxes are centred vertically on the anchor point; the text baseline is +5 below it.
      const boxOf = (p: Vec, w: number, a: Anchor): Box => ({ x: a === 'start' ? p[0] : a === 'end' ? p[0] - w : p[0] - w / 2, y: p[1] - 9, w, h: 18 })
      const hits = (b: Box, list: Box[]) => list.some((o) => b.x < o.x + o.w + 2 && o.x < b.x + b.w + 2 && b.y < o.y + o.h + 2 && o.y < b.y + b.h + 2)
      const taken: Box[] = sides.map((s) => boxOf(s.label.pos, widthOf(s.label.text, 14, 9), 'middle'))
      const rot = (d: Vec, deg: number): Vec => {
        const a = (deg * Math.PI) / 180
        return [d[0] * Math.cos(a) - d[1] * Math.sin(a), d[0] * Math.sin(a) + d[1] * Math.cos(a)]
      }
      // First of a few directions round `base` whose label box is clear of the others.
      const place = (from: Vec, base: Vec, dist: number, w: number, dy: number) => {
        for (const deg of [0, 35, -35, 70, -70, 110, -110]) {
          const d = rot(base, deg)
          const p = add(from, add(mul(d, dist), [0, d[1] > 0.6 ? dy : 0]))
          const b = boxOf(p, w, anchor(d))
          if (!hits(b, taken)) {
            taken.push(b)
            return { pos: p, anchor: anchor(d) }
          }
        }
        const p = add(from, mul(base, dist))
        return { pos: p, anchor: anchor(base) }
      }
      // The angle's own wedge is too thin for its label when one force is small, so the
      // label sits just outside the circle beside the vertex.
      const outV = mul(add(vertex, mul(c, -1)), 1 / R)
      const angleLabel = triOpt.angleLabel
      const angleAt = angleLabel ? place(vertex, outV, 16, widthOf(angleLabel, 15, 8.5), 6) : null
      // The vertex only travels on its side of the fixed chord, so the far arc is free.
      const label = typeof triOpt.circle === 'string' ? triOpt.circle : '辅助圆'
      const labelAt = place(c, circle.away, R + 8, widthOf(label, 12, 7), 6)
      const aux = {
        c,
        r: R,
        label,
        labelPos: add(labelAt.pos, [0, 4]) as Vec,
        labelAnchor: labelAt.anchor,
        arc: `M${vertex[0] + ra[0] * ar},${vertex[1] + ra[1] * ar} A${ar},${ar} 0 0 ${circle.cross < 0 ? 1 : 0} ${vertex[0] + rb[0] * ar},${vertex[1] + rb[1] * ar}`,
        angleLabel,
        anglePos: angleAt ? angleAt.pos : vertex,
        angleAnchor: angleAt ? angleAt.anchor : ('middle' as Anchor),
      }
      return { sides, resultant, closed, gap, title, titlePos: [c[0], c[1] - R - 40] as Vec, notePos: [c[0], c[1] + R + 38] as Vec, P, aux, links: [] as [Vec, Vec][], lanes: false }
    }
    return { sides, resultant, closed, gap, title, titlePos: [cx, top - 26] as Vec, notePos: [cx, bottom + 30] as Vec, P, aux: null, links: [] as [Vec, Vec][], lanes: false }
  })()

  const forceUnit = forces.find((f) => f.unit)?.unit ?? 'N'
  const triNote = !tri
    ? ''
    : tri.closed
      ? tri.lanes
        ? '首尾相接，最后回到起点：合力为零'
        : '首尾相接、闭合：合力为零'
      : !tri.resultant
        ? `几乎闭合，但合力不为零：${formatNumber(tri.gap)} ${forceUnit}（太小，图上看不出缺口）`
        : tri.lanes
          ? '首尾相接，没有回到起点：虚线为合力'
          : '未闭合：虚线为合力'
  const textW = (s: string, size: number) => [...s.replace(/[_{}]/g, '')].reduce((w, ch) => w + (/[\u3000-\u9fff\uff00-\uffef]/.test(ch) ? size : size * 0.56), 0)
  // The frame is sized from these widths, and a caption longer than the triangle grows
  // rightwards rather than back over the main diagram.
  const triLeft = tri ? Math.min(...tri.P.map((p) => p[0])) : 0
  const titleW = tri ? textW(tri.title, 12.5) : 0
  const noteW = textW(triNote, 12)
  const titleX = tri ? Math.max(tri.titlePos[0], triLeft - 24 + titleW / 2) : 0
  const noteX = tri ? Math.max(tri.notePos[0], triLeft - 24 + noteW / 2) : 0
  const pts: Vec[] = [...mainPts]
  if (tri) {
    pts.push(...tri.P, tri.titlePos, tri.notePos)
    for (const s of [...tri.sides.map((x) => x.label), ...(tri.resultant ? [tri.resultant.label] : [])]) {
      pts.push(add(s.pos, [-s.text.length * 5 - 6, -10]), add(s.pos, [s.text.length * 5 + 6, 8]))
    }
    const [ty, ny] = [tri.titlePos[1], tri.notePos[1]]
    pts.push([titleX - titleW / 2 - 4, ty - 12], [titleX + titleW / 2 + 4, ty], [noteX - noteW / 2 - 4, ny + 6], [noteX + noteW / 2 + 4, ny + 6])
    if (tri.aux) {
      // Reserve the full swing of the arrows (with their labels) and of the labels round
      // the circle, so the frame holds still while a slider is dragged.
      const { c, r } = tri.aux
      pts.push(add(center, [-SWING_X, -SWING_Y]), add(center, [SWING_X, SWING_Y]))
      pts.push(add(c, [-r - 70, -r - 52]), add(c, [r + 70, r + 50]))
    }
  }
  const PAD = 18
  const minX = Math.max(0, Math.min(...pts.map((p) => p[0])) - PAD)
  const maxX = Math.min(tri ? Infinity : W, Math.max(...pts.map((p) => p[0])) + PAD)
  const minY = Math.max(tri ? -Infinity : 0, Math.min(...pts.map((p) => p[1])) - PAD)
  const maxY = Math.min(tri ? Infinity : H, Math.max(...pts.map((p) => p[1])) + PAD)
  const vbW = Math.max(320, maxX - minX)
  const vbX = (minX + maxX) / 2 - vbW / 2
  const vbH = maxY - minY
  // Only a body actually standing on the drawn bench or slope casts a contact shadow.
  const resting = (type === 'ground' || type === 'incline') && Math.abs(bodyAngle - theta) < 0.5
  const chargeSign = body.charge === '-' || body.charge === '−' ? '−' : body.charge === '+' ? '+' : null

  return (
    <figure className="sim still force-diagram">
      <div className="stage">
      <StageHead
        props={props}
        aside={
          valueRows.length > 0 && (
            <div className="fd-values" aria-label="力的大小">
              {valueRows.map((a) => (
                <div className="fd-value" key={a.i}>
                  <Sym text={a.f.label} color={a.f.color ?? 'force'} />
                  <span className="num">{formatNumber(a.mag, a.f.digits)}</span>
                  <span className="unit">{a.f.unit ? <Rich text={a.f.unit} html /> : null}</span>
                </div>
              ))}
            </div>
          )
        }
      />
      <svg
        viewBox={`${vbX} ${minY} ${vbW} ${vbH}`}
        width="100%"
        style={{ maxWidth: Math.round(vbW * 1.3) }}
        role="img"
        aria-label={String(props.title ?? '受力分析图')}
      >
        <CraftDefs id={cid} theme={theme} />
        <defs>
          <radialGradient id="fd-charge" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#FFE7A3" />
            <stop offset="1" stopColor={colorOf('charge', theme)} />
          </radialGradient>
        </defs>
        {surfaceEls}
        <g transform={`rotate(${rot} ${center[0]} ${center[1]})`}>
          {resting && shape !== 'particle' && shape !== 'knot' && (
            <ContactShadow id={cid} x1={center[0] - (shape === 'ball' ? size.h * 0.3 : size.w / 2)} x2={center[0] + (shape === 'ball' ? size.h * 0.3 : size.w / 2)} y={center[1] + size.h / 2} />
          )}
          {shape === 'ball' && <Sphere id={cid} theme={theme} cx={center[0]} cy={center[1]} r={size.h / 2} mat="steelHi" />}
          {shape === 'block' && (
            <g>
              <SolidRect id={cid} theme={theme} x={center[0] - size.w / 2} y={center[1] - size.h / 2} w={size.w} h={size.h} mat="steelHi" r={3} band={Math.min(size.h * 0.14, 6)} />
              {size.w >= 70 && (
                <>
                  <Screw theme={theme} cx={center[0] - size.w / 2 + 6} cy={center[1] - size.h / 2 + 11} r={1.6} />
                  <Screw theme={theme} cx={center[0] + size.w / 2 - 6} cy={center[1] - size.h / 2 + 11} r={1.6} />
                </>
              )}
            </g>
          )}
          {shape === 'rod' && <SolidRect id={cid} theme={theme} x={center[0] - size.w / 2} y={center[1] - size.h / 2} w={size.w} h={size.h} mat="alu" r={3} band={3} line="strong" />}
          {shape === 'particle' && (
            <g>
              {!chargeSign && <Sphere id={cid} theme={theme} cx={center[0]} cy={center[1]} r={size.h / 2} mat="steelHi" line="strong" />}
              {chargeSign && <circle cx={center[0]} cy={center[1]} r={size.h / 2} fill="url(#fd-charge)" className="fd-particle" />}
              {chargeSign && (
                <text x={center[0]} y={center[1] + 6} textAnchor="middle" className="fd-charge-sign">
                  {chargeSign}
                </text>
              )}
            </g>
          )}
        </g>
        {body.label && (
          <text x={labelPos[0]} y={labelPos[1] + 5} textAnchor={labelAnchor} className={cjk ? 'fd-body-label cjk' : 'fd-body-label'}>
            <Rich text={body.label} />
          </text>
        )}
        {ropes}
        {compEls}
        {arrows.map((a) => (
          <Arrow key={a.i} from={a.origin} to={a.tip} color={a.guide ? colorOf(a.f.color ?? 'velocity', theme) : forceColor(a.i)} dashed={a.guide} />
        ))}
        {shape !== 'particle' && <circle cx={center[0]} cy={center[1]} r={shape === 'knot' ? 4.5 : 3} className="fd-center" />}
        {tri && (
          <g className="fd-triangle">
            <text x={titleX} y={tri.titlePos[1]} textAnchor="middle" className="fd-tri-title">
              {tri.title}
            </text>
            {tri.aux && (
              <g>
                <circle cx={tri.aux.c[0]} cy={tri.aux.c[1]} r={tri.aux.r} className="fd-aux" />
                <text x={tri.aux.labelPos[0]} y={tri.aux.labelPos[1]} textAnchor={tri.aux.labelAnchor} className="fd-tri-note">
                  {tri.aux.label}
                </text>
                <path d={tri.aux.arc} className="fd-arc" />
                {tri.aux.angleLabel && (
                  <text x={tri.aux.anglePos[0]} y={tri.aux.anglePos[1] + 5} textAnchor={tri.aux.angleAnchor} className="fd-angle">
                    <Rich text={tri.aux.angleLabel} />
                  </text>
                )}
              </g>
            )}
            {tri.links.map(([a, b], j) => (
              <line key={'tk' + j} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className="fd-guide" />
            ))}
            {tri.resultant && <Arrow from={tri.resultant.from} to={tri.resultant.to} color={colorOf('force', theme)} dashed />}
            {tri.sides.map((s) => (
              <Arrow key={'tri' + s.i} from={s.from} to={s.to} color={forceColor(s.i)} />
            ))}
            {[...tri.sides.map((s) => ({ ...s.label, c: forceColor(s.i) })), ...(tri.resultant ? [{ ...tri.resultant.label, c: colorOf('force', theme) }] : [])].map((l, j) => (
              <text key={'tl' + j} x={l.pos[0]} y={l.pos[1] + 5} textAnchor="middle" className="fd-label" fill={l.c}>
                <Rich text={l.text} />
              </text>
            ))}
            <text x={noteX} y={tri.notePos[1]} textAnchor="middle" className="fd-tri-note">
              {triNote}
            </text>
          </g>
        )}
        {placed.map((l, i) => (
          <text
            key={i}
            x={l.x + l.w / 2}
            y={l.y + l.h - 6}
            textAnchor="middle"
            className={i < arrowCount ? 'fd-label' : 'fd-label fd-label-sub'}
            fill={i < arrowCount ? (shown[i].guide ? colorOf(shown[i].f.color ?? 'velocity', theme) : forceColor(shown[i].i)) : undefined}
          >
            <Rich text={l.text} />
          </text>
        ))}
      </svg>
      <div className="stage-note">
        箭头长度按力的大小比例绘制（过小的力保留最短长度以便看清{tri ? '；矢量三角形严格按比例' : ''}{hasGuide ? '；虚线是方向，不按力的比例，也不参与求解' : ''}）。
        {unknowns.length > 0 && (
          <Rich
            text={`由 ${props.accel ? 'ΣF = ma' : 'ΣF = 0'} 解出：${unknowns
              .map((k) => {
                const v = num(k.name, scope, NaN)
                const f = k.of >= 0 ? forces[k.of] : undefined
                const who = f?.label ?? 'a'
                if (k.kind === 'angle') return `${who} 的方向角 ${formatNumber(v, 1)}°`
                const unit = k.of < 0 ? 'm/s²' : f?.unit ?? 'N'
                return `${who} = ${formatNumber(v, f?.digits)} ${unit}`
              })
              .join('，')}。`}
            html
          />
        )}
        {arrows.some((a) => a.L === 0 && !a.guide) && <Rich text={`当前为零、未画出：${arrows.filter((a) => a.L === 0 && !a.guide).map((a) => a.f.label).join('、')}。`} html />}
      </div>
      </div>
    </figure>
  )
}
