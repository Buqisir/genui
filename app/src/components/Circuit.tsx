import type { ReactNode } from 'react'
import { num, type Scope } from '../lesson/expr'
import type { Props } from '../lesson/parse'
import { namesIn, useScopeFor, useStore } from '../lesson/store'
import type { SchematicNode } from '../lesson/circuit'
import { isMotionObject } from '../lesson/motion'
import { transientOf, transientReads } from '../lesson/transient'
import { Rich } from './rich'
import { formatNumber } from './controls'
import { StageHead } from './Sim'

type ElementType =
  | 'resistor'
  | 'heater'
  | 'rheostat'
  | 'lamp'
  | 'switch'
  | 'ammeter'
  | 'voltmeter'
  | 'galvanometer'
  | 'capacitor'
  | 'inductor'
  | 'battery'
  | 'generator'
  | 'motor'
  | 'thermistor'
  | 'photoresistor'
  | 'wire'
  | 'currentSource'
  | 'diode'
  | 'phototube'

interface Note {
  expr: string
  unit?: string
  digits?: number
  prefix?: string
  /** Further values on the same line: a `read: {U, I}` element shows both. */
  more?: Note[]
}

interface ElementNode {
  type: ElementType
  label?: string
  note?: Note
  closed?: boolean | string
  positive?: 'left' | 'right'
  read?: string | Record<string, string>
  /** Lamp brightness 0…1, usually a `read: { lit }` name. */
  lit?: number | string
  /** Ideal diode conducts backwards along the tree when set. */
  reverse?: boolean
}

interface SeriesNode {
  series: CircuitNode[]
}
interface ParallelNode {
  parallel: CircuitNode[]
  /** Real branch count when a repeat collapsed to first … last. */
  count?: number
}
interface RepeatNode {
  repeat: number | string
  item: CircuitNode
  label?: string
}
interface EllipsisNode {
  ellipsis: string
}
interface SpdtNode {
  spdt: CircuitNode[]
  label?: string
  position?: number | string
  note?: Note
}
interface TransformerTap {
  n?: number | string
  load: CircuitNode
  label?: string
}
interface TransformerNode {
  type: 'transformer'
  label?: string
  note?: Note
  n1?: number | string
  n2?: number | string
  secondary?: CircuitNode
  secondaries?: TransformerTap[]
  read?: string | Record<string, string>
}

type CircuitNode = ElementNode | SeriesNode | ParallelNode | RepeatNode | EllipsisNode | SpdtNode | TransformerNode

const UNIT_W = 96
const ROW_H = 78
const BUS_PAD = 22
const MARGIN = 36

const isSeries = (n: CircuitNode): n is SeriesNode => 'series' in n
const isParallel = (n: CircuitNode): n is ParallelNode => 'parallel' in n
const isRepeat = (n: CircuitNode): n is RepeatNode => 'repeat' in n
const isEllipsis = (n: CircuitNode): n is EllipsisNode => 'ellipsis' in n
const isSpdt = (n: CircuitNode): n is SpdtNode => 'spdt' in n
const isTransformer = (n: CircuitNode): n is TransformerNode => 'type' in n && (n as { type?: string }).type === 'transformer'
const isElement = (n: CircuitNode): n is ElementNode => 'type' in n && !isTransformer(n)

/** Repeat nodes become a parallel block; long runs collapse to first, ellipsis, last. */
function expand(node: CircuitNode, scope: Scope): CircuitNode {
  if (isSeries(node)) return { series: node.series.map((c) => expand(c, scope)) }
  if (isParallel(node)) return { parallel: node.parallel.map((c) => expand(c, scope)) }
  if (isSpdt(node)) return { ...node, spdt: node.spdt.map((b) => expand(b, scope)) }
  if (isTransformer(node)) {
    return {
      ...node,
      secondary: node.secondary ? expand(node.secondary, scope) : undefined,
      secondaries: node.secondaries?.map((s) => ({ ...s, load: expand(s.load, scope) })),
    }
  }
  if (isRepeat(node)) {
    const n = Math.max(1, Math.round(num(node.repeat, scope, 1)))
    const item = expand(node.item, scope)
    if (n <= 3) return { parallel: Array.from({ length: n }, () => item), count: n }
    return { parallel: [item, { ellipsis: node.label ? node.label.replace('{n}', String(n)) : `共 ${n} 个` }, item], count: n }
  }
  return withReadNote(node)
}

const READ_UNIT: Record<string, string> = { voltmeter: 'V' }

/** An element that publishes a solved value but has no note shows that value (voltage and current for an object read). */
function withReadNote(node: CircuitNode): CircuitNode {
  if (!isElement(node) || node.note || !node.read) return node
  if (typeof node.read === 'string') return { ...node, note: { expr: node.read, unit: READ_UNIT[node.type] ?? 'A' } }
  const r = node.read
  const shown: Note[] = [
    ...(typeof r.U === 'string' ? [{ expr: r.U, unit: 'V' }] : []),
    ...(typeof r.I === 'string' ? [{ expr: r.I, unit: 'A' }] : []),
  ]
  if (!shown.length) return node
  return { ...node, note: { ...shown[0], more: shown.slice(1) } }
}

interface Size {
  w: number
  h: number
}

function measure(node: CircuitNode): Size {
  if (isSeries(node)) {
    const parts = node.series.map(measure)
    return { w: parts.reduce((s, p) => s + p.w, 0), h: Math.max(1, ...parts.map((p) => p.h)) }
  }
  if (isParallel(node)) {
    const parts = node.parallel.map(measure)
    return {
      w: Math.max(...parts.map((p) => p.w)) + (BUS_PAD * 2) / UNIT_W,
      h: parts.reduce((s, p) => s + p.h, 0),
    }
  }
  if (isEllipsis(node)) return { w: 1, h: 0.85 }
  if (isSpdt(node)) {
    const parts = node.spdt.map(measure)
    return {
      w: Math.max(...parts.map((p) => p.w), 1) + (BUS_PAD * 2) / UNIT_W,
      h: parts.reduce((s, p) => s + p.h, 0),
    }
  }
  if (isTransformer(node)) return measureTransformer(node)
  return { w: 1, h: 1 }
}

const transformerTaps = (node: TransformerNode): TransformerTap[] =>
  Array.isArray(node.secondaries) && node.secondaries.length ? node.secondaries : node.secondary ? [{ n: node.n2, load: node.secondary }] : []

/** Coils plus every secondary loop. The extra height hangs off the rail (down on the load, up on the source). */
function measureTransformer(node: TransformerNode): Size {
  const taps = transformerTaps(node)
  if (!taps.length) return { w: 1.6, h: 1 }
  const loads = taps.map((t) => measure(t.load))
  const loadW = Math.max(1, ...loads.map((s) => s.w))
  // Each secondary loop needs its own row plus a gap, so the return wire does not sit on the next rail.
  const loadH = loads.reduce((s, p) => s + p.h + 0.7, 0)
  return { w: 2.4 + loadW, h: Math.max(1.8, loadH + 0.55) }
}

function noteText(note: Note | undefined, scope: Scope): string | null {
  if (!note) return null
  const v = num(note.expr, scope)
  const own = `${note.prefix ?? ''}${formatNumber(v, note.digits)}${note.unit ? ' ' + note.unit : ''}`
  return note.more?.length ? [own, ...note.more.map((n) => noteText(n, scope))].join('，') : own
}

function Symbol({ el, cx, cy, scope, live, forward = 1 }: { el: ElementNode; cx: number; cy: number; scope: Scope; live: boolean; forward?: number }) {
  const s = 'var(--circuit-stroke)'
  switch (el.type) {
    case 'wire':
      return null
    case 'resistor':
      return <rect x={cx - 22} y={cy - 8} width={44} height={16} className="circuit-body" stroke={s} strokeWidth={1.6} />
    case 'heater': {
      const zig = Array.from({ length: 9 }, (_, i) => `${cx - 16 + i * 4},${cy + (i % 2 ? -4 : 4)}`).join(' ')
      return (
        <g className={live ? 'heater on' : 'heater'}>
          <rect x={cx - 22} y={cy - 8} width={44} height={16} className="circuit-body" stroke={s} strokeWidth={1.6} />
          <polyline points={zig} fill="none" className="heater-coil" strokeWidth={1.4} strokeLinejoin="round" />
        </g>
      )
    }
    case 'thermistor':
      // GB/T 4728: resistor crossed by a slanted line with a short foot, marked t°.
      return (
        <g>
          <rect x={cx - 22} y={cy - 8} width={44} height={16} className="circuit-body" stroke={s} strokeWidth={1.6} />
          <polyline points={`${cx - 24},${cy + 13} ${cx - 14},${cy + 13} ${cx + 14},${cy - 13}`} fill="none" stroke={s} strokeWidth={1.4} />
          <text x={cx + 12} y={cy + 21} className="circuit-letter small">t°</text>
        </g>
      )
    case 'photoresistor':
      return (
        <g>
          <rect x={cx - 22} y={cy - 8} width={44} height={16} className="circuit-body" stroke={s} strokeWidth={1.6} />
          {[-8, 2].map((dx) => (
            <g key={dx} className="circuit-light">
              <line x1={cx + dx - 8} y1={cy - 22} x2={cx + dx - 1} y2={cy - 12} strokeWidth={1.4} />
              <polygon points={`${cx + dx},${cy - 10} ${cx + dx - 5.5},${cy - 14} ${cx + dx - 1.5},${cy - 16.5}`} />
            </g>
          ))}
        </g>
      )
    case 'rheostat':
      return (
        <g>
          <rect x={cx - 22} y={cy - 8} width={44} height={16} className="circuit-body" stroke={s} strokeWidth={2} />
          <line x1={cx - 18} y1={cy + 14} x2={cx + 14} y2={cy - 14} stroke={s} strokeWidth={1.6} />
          <polygon points={`${cx + 19},${cy - 19} ${cx + 8},${cy - 15} ${cx + 15},${cy - 9}`} fill={s} />
        </g>
      )
    case 'lamp': {
      const lit = Math.max(0, Math.min(1, el.lit === undefined ? 0 : num(el.lit, scope, 0)))
      return (
        <g>
          {lit > 0.02 && <circle cx={cx} cy={cy} r={13 + 7 * lit} className="circuit-glow" opacity={0.15 + 0.4 * lit} />}
          <circle cx={cx} cy={cy} r={12} className="circuit-body" stroke={s} strokeWidth={2} />
          {lit > 0.02 && <circle cx={cx} cy={cy} r={11} className="circuit-glow" opacity={0.25 + 0.65 * lit} />}
          <line x1={cx - 8.5} y1={cy - 8.5} x2={cx + 8.5} y2={cy + 8.5} stroke={s} strokeWidth={1.6} />
          <line x1={cx - 8.5} y1={cy + 8.5} x2={cx + 8.5} y2={cy - 8.5} stroke={s} strokeWidth={1.6} />
        </g>
      )
    }
    case 'ammeter':
    case 'voltmeter':
    case 'galvanometer':
    case 'generator':
    case 'motor':
      return (
        <g>
          <circle cx={cx} cy={cy} r={14} className="circuit-body" stroke={s} strokeWidth={2} />
          <text x={cx} y={cy + 5} textAnchor="middle" className="circuit-letter">
            {{ ammeter: 'A', voltmeter: 'V', galvanometer: 'G', generator: 'G', motor: 'M' }[el.type]}
          </text>
        </g>
      )
    case 'capacitor':
      return (
        <g>
          <rect x={cx - 6} y={cy - 4} width={12} height={8} className="circuit-body" stroke="none" />
          <line x1={cx - 5} y1={cy - 14} x2={cx - 5} y2={cy + 14} stroke={s} strokeWidth={2.4} />
          <line x1={cx + 5} y1={cy - 14} x2={cx + 5} y2={cy + 14} stroke={s} strokeWidth={2.4} />
        </g>
      )
    case 'inductor': {
      // GB/T 4728 coil: four half-turns between the terminals.
      const turns = Array.from({ length: 4 }, (_, i) => `A 5 5 0 0 1 ${cx - 10 + i * 10} ${cy}`).join(' ')
      return (
        <g>
          <rect x={cx - 22} y={cy - 7} width={44} height={9} className="circuit-body" stroke="none" />
          <path d={`M ${cx - 22} ${cy} L ${cx - 20} ${cy} ${turns} L ${cx + 22} ${cy}`} fill="none" stroke={s} strokeWidth={1.8} />
        </g>
      )
    }
    case 'battery': {
      // Long thin plate is the positive terminal.
      const posLeft = el.positive !== 'right'
      const longX = posLeft ? cx - 5 : cx + 5
      const shortX = posLeft ? cx + 5 : cx - 5
      return (
        <g>
          <rect x={cx - 6} y={cy - 4} width={12} height={8} className="circuit-body" stroke="none" />
          <line x1={longX} y1={cy - 15} x2={longX} y2={cy + 15} stroke={s} strokeWidth={1.8} />
          <line x1={shortX} y1={cy - 8} x2={shortX} y2={cy + 8} stroke={s} strokeWidth={4} />
        </g>
      )
    }
    case 'switch': {
      const closed = typeof el.closed === 'string' ? num(el.closed, scope, 0) !== 0 : el.closed !== false
      return (
        <g>
          <rect x={cx - 20} y={cy - 4} width={40} height={8} className="circuit-body" stroke="none" />
          <circle cx={cx - 18} cy={cy} r={3} fill={s} />
          <circle cx={cx + 18} cy={cy} r={3} className="circuit-body" stroke={s} strokeWidth={1.6} />
          <line x1={cx - 18} y1={cy} x2={closed ? cx + 18 : cx + 14} y2={closed ? cy : cy - 15} stroke={s} strokeWidth={2} strokeLinecap="round" />
        </g>
      )
    }
    case 'currentSource': {
      // Arrow points out of the positive terminal, the same side as a battery's long plate.
      const toLeft = el.positive !== 'right'
      const tip = toLeft ? cx - 8 : cx + 8
      const tail = toLeft ? cx + 7 : cx - 7
      return (
        <g>
          <circle cx={cx} cy={cy} r={14} className="circuit-body" stroke={s} strokeWidth={1.6} />
          <line x1={tail} y1={cy} x2={tip} y2={cy} stroke={s} strokeWidth={1.6} />
          <polygon points={toLeft ? `${tip},${cy} ${tip + 7},${cy - 4} ${tip + 7},${cy + 4}` : `${tip},${cy} ${tip - 7},${cy - 4} ${tip - 7},${cy + 4}`} fill={s} />
        </g>
      )
    }
    case 'diode': {
      // Triangle points in the conduction direction (left→right on the load, unless reverse).
      const toRight = forward * (el.reverse ? -1 : 1) > 0
      const tip = toRight ? cx + 8 : cx - 8
      const base = toRight ? cx - 6 : cx + 6
      const bar = toRight ? cx + 12 : cx - 12
      return (
        <g>
          <polygon points={`${tip},${cy} ${base},${cy - 8} ${base},${cy + 8}`} fill={s} />
          <line x1={bar} y1={cy - 9} x2={bar} y2={cy + 9} stroke={s} strokeWidth={1.8} />
        </g>
      )
    }
    case 'phototube': {
      // Curved cathode toward the incoming light, rod anode opposite. K is on the left of the load unless reverse.
      const kLeft = (forward > 0) !== (el.reverse === true)
      const kX = kLeft ? cx - 4 : cx + 4
      const aX = kLeft ? cx + 7 : cx - 7
      const bulge = kLeft ? kX - 9 : kX + 9
      const rays = [-7, 1].map((dy) => {
        const x1 = kLeft ? cx - 22 : cx + 22
        const y1 = cy - 24 + dy
        const x2 = kX + (kLeft ? -2 : 2)
        const y2 = cy - 11 + dy * 0.35
        const ang = Math.atan2(y2 - y1, x2 - x1)
        const tip = 5
        const hx = x2 - Math.cos(ang) * 0.5
        const hy = y2 - Math.sin(ang) * 0.5
        const head = `${hx},${hy} ${hx - tip * Math.cos(ang) + 2.4 * Math.sin(ang)},${hy - tip * Math.sin(ang) - 2.4 * Math.cos(ang)} ${hx - tip * Math.cos(ang) - 2.4 * Math.sin(ang)},${hy - tip * Math.sin(ang) + 2.4 * Math.cos(ang)}`
        return { x1, y1, x2, y2, head, dy }
      })
      return (
        <g>
          <circle cx={cx} cy={cy} r={15} className="circuit-body" stroke={s} strokeWidth={1.6} />
          <path d={`M ${kX} ${cy - 8} Q ${bulge} ${cy} ${kX} ${cy + 8}`} fill="none" stroke={s} strokeWidth={1.7} />
          <line x1={aX} y1={cy - 6} x2={aX} y2={cy + 6} stroke={s} strokeWidth={2.2} strokeLinecap="round" />
          {rays.map((ray) => (
            <g key={ray.dy} className="circuit-light">
              <line x1={ray.x1} y1={ray.y1} x2={ray.x2} y2={ray.y2} strokeWidth={1.3} />
              <polygon points={ray.head} />
            </g>
          ))}
          <text x={kLeft ? cx - 16 : cx + 16} y={cy + 26} textAnchor="middle" className="circuit-letter small">K</text>
          <text x={kLeft ? cx + 16 : cx - 16} y={cy + 26} textAnchor="middle" className="circuit-letter small">A</text>
        </g>
      )
    }
    default:
      return <rect x={cx - 22} y={cy - 10} width={44} height={20} className="circuit-body" stroke={s} strokeDasharray="3 3" />
  }
}

interface Ctx {
  scope: Scope
  out: ReactNode[]
  key: number
  /** Fraction of the trunk current in the branch being drawn. */
  share: number
  /** Trunk current speed in px/s (0 = no flow); sign gives direction along the top rail. */
  flow: number
  /** +1 when the tree's positive current runs left→right (the load); −1 on the source rail. */
  forward: number
  /** +1 hangs a transformer's secondary below the rail; −1 hangs it above (source rail). */
  drop: number
  /** Boxes of text already fixed in place (element labels and notes). */
  taken?: TextBox[]
  /** Captions placed after the whole tree is drawn, at the first spot clear of `taken`. */
  pending?: { text: string; cls: string; spots: Spot[] }[]
}

interface Spot { x: number; y: number; anchor: Anchor }

type Anchor = 'start' | 'middle' | 'end'
interface TextBox { x: number; y: number; w: number; h: number }

// Rough advance widths for the two caption fonts; only used to detect overlaps.
function textBox(x: number, y: number, text: string, cls: string, anchor: Anchor): TextBox {
  const note = cls === 'circuit-note'
  const w = [...text.replace(/[_{}]/g, '')].reduce((s, ch) => s + (/[\u3000-\u9fff\uff00-\uffef]/.test(ch) ? (note ? 11 : 14) : note ? 6.6 : 7.4), 0)
  const h = note ? 12 : 15
  return { x: anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2, y: y - h + 3, w, h }
}

const overlaps = (a: TextBox, list: TextBox[]) => list.some((b) => a.x < b.x + b.w + 2 && b.x < a.x + a.w + 2 && a.y < b.y + b.h + 1 && b.y < a.y + a.h + 1)

function fixText(c: Ctx, x: number, y: number, text: string, cls: string, anchor: Anchor = 'middle') {
  ;(c.taken ??= []).push(textBox(x, y, text, cls, anchor))
}

/** Places deferred captions, each at its first spot that overlaps nothing placed so far (else the first spot). */
function flushCaptions(c: Ctx) {
  const taken = (c.taken ??= [])
  for (const p of c.pending ?? []) {
    const at = p.spots.find((s) => !overlaps(textBox(s.x, s.y, p.text, p.cls, s.anchor), taken)) ?? p.spots[0]!
    taken.push(textBox(at.x, at.y, p.text, p.cls, at.anchor))
    caption(c, at.x, at.y, p.text, p.cls, at.anchor)
  }
  c.pending = []
}

// Must match the dash period of .circuit-flow in styles.css. Wide enough that the dots read as
// separate charges moving, not as a shimmering dotted line.
const FLOW_GAP = 30

/**
 * Current particles on a wire. Horizontal wires on the top rail carry current
 * left→right when c.flow > 0; the speed scales with the branch's share.
 */
function flowLine(c: Ctx, x1: number, y1: number, x2: number, y2: number, dir = 1) {
  const speed = Math.abs(c.flow) * c.share
  if (!speed || Math.hypot(x2 - x1, y2 - y1) < 6) return
  const forward = (c.flow > 0 ? 1 : -1) * dir > 0
  const [ax, ay, bx, by] = forward ? [x1, y1, x2, y2] : [x2, y2, x1, y1]
  c.out.push(
    <line
      key={c.key++}
      x1={ax}
      y1={ay}
      x2={bx}
      y2={by}
      className="circuit-flow"
      style={{ animationDuration: `${(FLOW_GAP / speed).toFixed(3)}s` }}
    />,
  )
}

/** Draws node between x and x + w with its terminals on rail y. */
function draw(node: CircuitNode, x: number, y: number, w: number, c: Ctx) {
  const wire = (x1: number, y1: number, x2: number, y2: number) => {
    c.out.push(<line key={c.key++} x1={x1} y1={y1} x2={x2} y2={y2} className="circuit-wire" />)
    flowLine(c, x1, y1, x2, y2)
  }

  if (isSeries(node)) {
    const sizes = node.series.map(measure)
    const natural = sizes.reduce((s, p) => s + p.w, 0) * UNIT_W
    const stretch = w / natural
    let cursor = x
    node.series.forEach((child, i) => {
      const cw = sizes[i].w * UNIT_W * stretch
      draw(child, cursor, y, cw, c)
      cursor += cw
    })
    return
  }

  if (isParallel(node)) {
    const wired = node.parallel.filter((b) => !isEllipsis(b)).length
    const outer = c.share
    const left = x + BUS_PAD
    const right = x + w - BUS_PAD
    wire(x, y, left, y)
    wire(right, y, x + w, y)
    let rowY = y
    const wiredRows: number[] = []
    for (const branch of node.parallel) {
      const size = measure(branch)
      if (isEllipsis(branch)) {
        c.out.push(
          <text key={c.key++} x={(left + right) / 2} y={rowY + 2} textAnchor="middle" className="circuit-ellipsis">
            ⋯ {branch.ellipsis} ⋯
          </text>,
        )
      } else {
        c.share = outer / (node.count ?? wired)
        draw(branch, left, rowY, right - left, c)
        c.share = outer
        wiredRows.push(rowY)
      }
      rowY += size.h * ROW_H
    }
    const last = wiredRows[wiredRows.length - 1] ?? y
    c.out.push(<line key={c.key++} x1={left} y1={y} x2={left} y2={last} className="circuit-wire" />)
    c.out.push(<line key={c.key++} x1={right} y1={y} x2={right} y2={last} className="circuit-wire" />)
    for (const yy of wiredRows.slice(0, -1)) {
      c.out.push(<circle key={c.key++} cx={left} cy={yy} r={3.2} className="circuit-node" />)
      c.out.push(<circle key={c.key++} cx={right} cy={yy} r={3.2} className="circuit-node" />)
    }
    return
  }

  if (isSpdt(node)) return drawSpdt(node, x, y, w, c)
  if (isTransformer(node)) return drawTransformer(node, x, y, w, c)
  if (isEllipsis(node)) return

  const el = node as ElementNode
  const cx = x + w / 2
  const half = halfOf(el)
  wire(x, y, cx - half, y)
  wire(cx + half, y, x + w, y)
  c.out.push(<Symbol key={c.key++} el={el} cx={cx} cy={y} scope={c.scope} live={c.flow !== 0 && c.share > 0} forward={c.forward} />)
  if (el.label) {
    const ly = y - (el.type === 'phototube' ? 38 : el.type === 'photoresistor' ? 28 : 22)
    fixText(c, cx, ly, el.label, 'circuit-label')
    c.out.push(
      <text key={c.key++} x={cx} y={ly} textAnchor="middle" className="circuit-label">
        <Rich text={el.label} />
      </text>,
    )
  }
  const note = noteText(el.note, c.scope)
  if (note) {
    const ny = y + (el.type === 'phototube' ? 50 : 32)
    fixText(c, cx, ny, note, 'circuit-note')
    c.out.push(
      <text key={c.key++} x={cx} y={ny} textAnchor="middle" className="circuit-note">
        <Rich text={note} />
      </text>,
    )
  }
}

const halfOf = (el: ElementNode) =>
  el.type === 'wire' ? 0 : el.type === 'switch' ? 18 : ['resistor', 'heater', 'rheostat', 'thermistor', 'photoresistor', 'inductor'].includes(el.type) ? 22 : el.type === 'capacitor' || el.type === 'battery' ? 5 : el.type === 'diode' ? 14 : el.type === 'phototube' ? 16 : 13

const isRound = (el: ElementNode) => ['ammeter', 'voltmeter', 'galvanometer', 'generator', 'motor', 'lamp'].includes(el.type)

const inline = (el: ElementNode, scope: Scope) => [el.label, noteText(el.note, scope)].filter(Boolean).join('  ')

/** A negative current is drawn as its size with the arrow turned round, matching the moving charges. */
function currentDirection(current: Note, scope: Scope): { note: Note; reversed: boolean } {
  const reversed = num(current.expr, scope, NaN) < 0
  return { note: reversed ? { ...current, expr: `-(${current.expr})` } : current, reversed }
}

/** Rough rendered widths: labels are 14px italic serif, notes 11px mono; CJK glyphs are full width. */
const textW = (s: string, cjk: number, latin: number) => [...s].reduce((w, ch) => w + (ch.charCodeAt(0) > 0x2e80 ? cjk : latin), 0)
const labelW = (s: string) => textW(s, 14, 7.2)
const noteW = (s: string) => textW(s, 11, 6.6)

interface LadderPlan {
  source: ElementNode[]
  top: ElementNode[]
  bottom: ElementNode[]
  rung: ElementNode
  count: number
  label?: string
}

function strokeWire(c: Ctx, x1: number, y1: number, x2: number, y2: number) {
  c.out.push(<line key={c.key++} x1={x1} y1={y1} x2={x2} y2={y2} className="circuit-wire" />)
  flowLine(c, x1, y1, x2, y2)
}

function caption(c: Ctx, x: number, y: number, text: string, cls: string, anchor: 'start' | 'middle' | 'end' = 'middle') {
  c.out.push(
    <text key={c.key++} x={x} y={y} textAnchor={anchor} className={cls}>
      <Rich text={text} />
    </text>,
  )
}

/** Four half-turns of a coil. `face` +1 bulges toward +y. */
function coilPath(x0: number, y0: number, face: number) {
  let d = `M ${x0} ${y0}`
  for (let i = 0; i < 4; i++) d += ` A 5.5 5.5 0 0 ${face > 0 ? 1 : 0} ${x0 + (i + 1) * 11} ${y0}`
  return d
}

// A numeric turn count is shown as `n_1 = 10`; a bare `n_10` would read as the tenth coil.
const turnsText = (v: number | string | undefined, sym: string) => (typeof v === 'number' ? `${sym} = ${v}` : typeof v === 'string' && v ? v : sym)

/** One pivot, two numbered contacts, blade on the selected branch. The far ends join like a parallel block. */
function drawSpdt(node: SpdtNode, x: number, y: number, w: number, c: Ctx) {
  const pos = num(node.position, c.scope, NaN)
  const selected = pos === 1 ? 0 : pos === 2 ? 1 : -1
  const left = x + BUS_PAD
  const right = x + w - BUS_PAD
  const pivotX = left - 18
  strokeWire(c, x, y, pivotX, y)
  strokeWire(c, right, y, x + w, y)
  let rowY = y
  const rows: number[] = []
  for (const branch of node.spdt) {
    const size = measure(branch)
    draw(branch, left, rowY, right - left, c)
    rows.push(rowY)
    rowY += size.h * ROW_H
  }
  const last = rows[rows.length - 1] ?? y
  c.out.push(<line key={c.key++} x1={right} y1={y} x2={right} y2={last} className="circuit-wire" />)
  rows.forEach((yy, i) => {
    c.out.push(<circle key={c.key++} cx={left} cy={yy} r={3.2} className="circuit-node" />)
    if (i < rows.length - 1) c.out.push(<circle key={c.key++} cx={right} cy={yy} r={3.2} className="circuit-node" />)
    caption(c, left + 8, yy - 8, String(i + 1), 'circuit-label', 'start')
  })
  // Hinge sits off the rail so the blade reads as a knife even when it rests on the first contact.
  const hingeY = y - 12
  c.out.push(<line key={c.key++} x1={pivotX} y1={y} x2={pivotX} y2={hingeY} stroke="var(--circuit-stroke)" strokeWidth={1.6} />)
  c.out.push(<circle key={c.key++} cx={pivotX} cy={hingeY} r={3} fill="var(--circuit-stroke)" />)
  const endX = selected >= 0 ? left - 1 : pivotX + 16
  const endY = selected >= 0 ? rows[selected]! : ((rows[0] ?? y) + (rows[1] ?? y)) / 2 - 8
  c.out.push(
    <line key={c.key++} x1={pivotX} y1={hingeY} x2={endX} y2={endY} stroke="var(--circuit-stroke)" strokeWidth={2} strokeLinecap="round" />,
  )
  if (node.label) caption(c, pivotX - 10, hingeY - 6, node.label, 'circuit-label', 'end')
}

/**
 * Primary coil in the rail, secondary coil(s) beside it with the core between,
 * and each secondary loop drawn onward in `c.drop`'s direction. The primary's
 * other terminal continues along the rail so the series around it is unchanged.
 */
function drawTransformer(node: TransformerNode, x: number, y: number, w: number, c: Ctx) {
  const taps = transformerTaps(node)
  const dir = c.drop || 1
  const s = 'var(--circuit-stroke)'
  const coilW = 44
  // Inset from the left rail so a secondary's return wire is not the same line as the primary loop.
  const x0 = x + 28
  strokeWire(c, x, y, x0, y)
  c.out.push(<path key={c.key++} d={coilPath(x0, y, dir)} fill="none" stroke={s} strokeWidth={1.7} />)
  const x1 = x0 + coilW
  strokeWire(c, x1, y, x + w, y)
  caption(c, x0 + coilW / 2, y - 14, turnsText(node.n1, 'n_1'), 'circuit-label')
  fixText(c, x0 + coilW / 2, y - 14, turnsText(node.n1, 'n_1'), 'circuit-label')
  if (node.label) {
    caption(c, x0 + coilW / 2, y - 30, node.label, 'circuit-label')
    fixText(c, x0 + coilW / 2, y - 30, node.label, 'circuit-label')
  }
  let prevCoil = y
  let cursor = y + dir * 58
  taps.forEach((tap, i) => {
    const size = measure(tap.load)
    const yS = cursor
    c.out.push(<path key={c.key++} d={coilPath(x0, yS, -dir)} fill="none" stroke={s} strokeWidth={1.7} />)
    // One core, between the primary and the first secondary. Later windings share it; a line through their loops would cross the loads.
    if (i === 0) {
      const mid = (prevCoil + yS) / 2
      const core = Math.min(16, Math.abs(yS - prevCoil) / 2 - 4)
      c.out.push(<line key={c.key++} x1={x0 + coilW / 2 - 5} y1={mid - core} x2={x0 + coilW / 2 - 5} y2={mid + core} stroke={s} strokeWidth={1.5} />)
      c.out.push(<line key={c.key++} x1={x0 + coilW / 2 + 5} y1={mid - core} x2={x0 + coilW / 2 + 5} y2={mid + core} stroke={s} strokeWidth={1.5} />)
    }
    // Beside the coil above the wire by default. The load's own label may sit there, so the
    // fallback is on the far side of this coil from the core, mirroring n_1 over the primary.
    ;(c.pending ??= []).push({
      text: turnsText(tap.n, taps.length > 1 ? `n_${i + 2}` : 'n_2'),
      cls: 'circuit-label',
      spots: [
        { x: x1 + 6, y: yS - 12, anchor: 'start' },
        // Starts clear of the loop's return wire, which runs down from x0.
        { x: x0 + 7, y: yS + (dir > 0 ? 21 : -12), anchor: 'start' },
      ],
    })
    const loadX = x1 + 18
    if (tap.label) {
      caption(c, loadX, yS - 14, tap.label, 'circuit-label', 'start')
      fixText(c, loadX, yS - 14, tap.label, 'circuit-label', 'start')
    }
    const loadW = Math.max(64, size.w * UNIT_W)
    strokeWire(c, x1, yS, loadX, yS)
    draw(tap.load, loadX, yS, loadW, c)
    const xFar = loadX + loadW
    const far = yS + dir * (size.h * ROW_H + 22)
    strokeWire(c, xFar, yS, xFar, far)
    strokeWire(c, xFar, far, x0, far)
    strokeWire(c, x0, far, x0, yS)
    c.out.push(<circle key={c.key++} cx={xFar} cy={yS} r={3} className="circuit-node" />)
    c.out.push(<circle key={c.key++} cx={x0} cy={yS} r={3} className="circuit-node" />)
    prevCoil = yS
    cursor = far + dir * 36
  })
}

const layoutBlocked = (n: CircuitNode): boolean =>
  isTransformer(n) || isSpdt(n) || (isSeries(n) && n.series.some(layoutBlocked)) || (isParallel(n) && n.parallel.some(layoutBlocked)) || (isRepeat(n) && layoutBlocked(n.item))

/** Ladder needs: source = elements, load = series of elements with exactly one parallel/repeat of single elements. */
function planLadder(sourceRaw: CircuitNode, loadRaw: CircuitNode, scope: Scope): LadderPlan | null {
  if (layoutBlocked(sourceRaw) || layoutBlocked(loadRaw)) return null
  const flat = (n: CircuitNode) => (isSeries(n) ? n.series : [n])
  const source = flat(sourceRaw)
  if (!source.every(isElement)) return null
  const parts = flat(loadRaw)
  const idx = parts.findIndex((p) => isRepeat(p) || isParallel(p))
  if (idx < 0 || parts.some((p, i) => i !== idx && !isElement(p))) return null
  const block = parts[idx]
  let rung: CircuitNode
  let count: number
  let label: string | undefined
  if (isRepeat(block)) {
    rung = block.item
    count = Math.max(1, Math.round(num(block.repeat, scope, 1)))
    label = block.label?.replace('{n}', String(count))
  } else {
    const branches = (block as ParallelNode).parallel
    if (!branches.every(isElement)) return null
    rung = branches[0]
    count = branches.length
  }
  if (!isElement(rung)) return null
  return {
    source: source as ElementNode[],
    top: parts.slice(0, idx) as ElementNode[],
    bottom: parts.slice(idx + 1) as ElementNode[],
    rung,
    count,
    label,
  }
}

const RUNG_GAP = 72

/**
 * Ladder layout: source on the left upright, series elements on the top and
 * bottom wires, identical branches as vertical rungs side by side. Current
 * runs clockwise: up through the source, right along the top, down the rungs.
 */
function drawLadder(plan: LadderPlan, c: Ctx, props: Props, current: (Note & { label?: string }) | undefined) {
  const box = props.box as { label?: string; caption?: string } | undefined
  // Source labels hang left of the upright ("E = 250 V  P = 5000 W"); the margin grows so they are not clipped.
  const marginL = Math.max(130, 40 + Math.max(0, ...plan.source.map((el) => labelW(inline(el, c.scope)))))
  const top = box ? 64 : 48
  const H0 = 230
  const bottom = top + H0
  const mid = (top + bottom) / 2
  const nWire = Math.max(plan.top.length, plan.bottom.length, 1)
  const elemSpan = nWire * 130
  const wireLen = elemSpan + (current ? 150 : 60) + (box ? 34 : 0)
  const x0 = marginL
  const xR0 = x0 + wireLen
  const show: (number | 'gap')[] = plan.count <= 5 ? Array.from({ length: plan.count }, (_, i) => i) : [0, 1, 2, 'gap', plan.count - 1]
  const xs: number[] = []
  let cursor = xR0
  show.forEach((s, i) => {
    if (i > 0) cursor += s === 'gap' || show[i - 1] === 'gap' ? RUNG_GAP * 0.8 : RUNG_GAP
    xs.push(cursor)
  })
  const xEnd = xs[xs.length - 1]
  const W = xEnd + (box ? 90 : 64)
  const H = bottom + (box ? 62 : 44)
  const flow = Math.abs(c.flow)
  const out = c.out

  const wire = (x1: number, y1: number, x2: number, y2: number, share: number) => {
    out.push(<line key={c.key++} x1={x1} y1={y1} x2={x2} y2={y2} className="circuit-wire" />)
    const saved = [c.share, c.flow]
    c.share = share
    c.flow = flow
    flowLine(c, x1, y1, x2, y2)
    ;[c.share, c.flow] = saved
  }
  const symbol = (el: ElementNode, cx: number, cy: number, vertical: boolean, live: boolean, forward = 1) => {
    const sym = <Symbol el={el} cx={cx} cy={cy} scope={c.scope} live={live} forward={forward} />
    out.push(
      vertical && !isRound(el) ? (
        <g key={c.key++} transform={`rotate(90 ${cx} ${cy})`}>
          {sym}
        </g>
      ) : (
        <g key={c.key++}>{sym}</g>
      ),
    )
  }
  const text = (x: number, y: number, s: string, cls: string, anchor: 'start' | 'middle' | 'end' = 'middle') =>
    out.push(
      <text key={c.key++} x={x} y={y} textAnchor={anchor} className={cls}>
        <Rich text={s} />
      </text>,
    )

  /** Elements spread along a straight run in the current's direction. */
  const run = (els: ElementNode[], ax: number, ay: number, bx: number, by: number, labelAt: (cx: number, cy: number) => [number, number, 'start' | 'middle' | 'end']) => {
    const vertical = ax === bx
    const len = Math.hypot(bx - ax, by - ay)
    const ux = (bx - ax) / len
    const uy = (by - ay) / len
    let px = ax
    let py = ay
    els.forEach((el, i) => {
      const t = ((i + 0.5) / els.length) * len
      const cx = ax + ux * t
      const cy = ay + uy * t
      const h = halfOf(el)
      wire(px, py, cx - ux * h, cy - uy * h, 1)
      symbol(el, cx, cy, vertical, flow > 0, vertical || ux >= 0 ? 1 : -1)
      const s = inline(el, c.scope)
      if (s) {
        const [lx, ly, anchor] = labelAt(cx, cy)
        text(lx, ly, s, 'circuit-label', anchor)
      }
      px = cx + ux * h
      py = cy + uy * h
    })
    wire(px, py, bx, by, 1)
  }

  // Source: bottom-left corner up to top-left corner.
  run(plan.source, x0, bottom, x0, top, (_cx, cy) => [x0 - 26, cy + 5, 'end'])
  // Top wire, left to right, over the series elements only (the current label sits in the tail).
  const topEnd = x0 + elemSpan
  run(plan.top, x0, top, topEnd, top, (cx) => [cx, top - 20, 'middle'])
  wire(topEnd, top, xR0, top, 1)
  // Bottom wire, right to left.
  wire(xR0, bottom, topEnd, bottom, 1)
  run(plan.bottom, topEnd, bottom, x0, bottom, (cx) => [cx, bottom + 30, 'middle'])

  // Rungs and the bus between them.
  const rungShare = 1 / plan.count
  const half = halfOf(plan.rung)
  const rungNote = noteText(plan.rung.note, c.scope)
  // Every rung is the same part with the same value: a note wider than the rung spacing is written once, on the first.
  const noteEach = !!rungNote && noteW(rungNote) + 7 <= RUNG_GAP - 8
  show.forEach((s, i) => {
    const x = xs[i]
    if (i < show.length - 1) {
      const real = s === 'gap' ? (show[i + 1] as number) - 1 : s
      const share = (plan.count - real - 1) / plan.count
      wire(x, top, xs[i + 1], top, share)
      wire(xs[i + 1], bottom, x, bottom, share)
      if (s !== 'gap') {
        out.push(<circle key={c.key++} cx={x} cy={top} r={3.2} className="circuit-node" />)
        out.push(<circle key={c.key++} cx={x} cy={bottom} r={3.2} className="circuit-node" />)
      }
    }
    if (s === 'gap') {
      text(x, mid + 6, '⋯', 'circuit-ellipsis')
      return
    }
    wire(x, top, x, mid - half, rungShare)
    symbol(plan.rung, x, mid, true, flow > 0)
    wire(x, mid + half, x, bottom, rungShare)
    if (rungNote && (i === 0 || noteEach)) text(x + 7, top + 20, rungNote, 'circuit-note', 'start')
    if (i === 0 && plan.rung.label) text(x + (isRound(plan.rung) ? 20 : 14), mid + 5, plan.rung.label, 'circuit-label', 'start')
  })

  if (box) {
    const bx0 = xR0 - 34
    const bx1 = xEnd + 64
    out.push(
      <rect key={c.key++} x={bx0} y={top - 40} width={bx1 - bx0} height={bottom - top + 80} rx={8} className="circuit-box" />,
    )
    if (box.label) text(bx0 + 12, top - 22, box.label, 'circuit-box-label', 'start')
    if (box.caption ?? plan.label) text(bx0 + 12, bottom + 30, (box.caption ?? plan.label)!, 'circuit-box-caption', 'start')
  } else if (plan.label) {
    text((xR0 + xEnd) / 2, bottom + 30, plan.label, 'circuit-ellipsis')
  }

  if (current) {
    const ax = (topEnd + xR0 - (box ? 34 : 0)) / 2
    out.push(
      <polygon key={c.key++} points={`${ax + 7},${top} ${ax - 5},${top - 6} ${ax - 5},${top + 6}`} className="circuit-current" />,
    )
    text(ax, top - 16, `${current.label ?? 'I'} = ${noteText(current, c.scope)}`, 'circuit-current-label')
  }
  return { W, H }
}

/** A `<Circuit motion>` draws the schematic stored on that motion; otherwise the props. */
function boundSchematic(props: Props, scope: Scope): { source: CircuitNode; load: CircuitNode } | null {
  if (typeof props.motion !== 'string') return null
  const run = scope[props.motion]
  const tree = run && typeof run === 'object' ? (run as { __circuit?: { source?: CircuitNode; load?: CircuitNode } }).__circuit : undefined
  if (!isMotionObject(run) || !tree?.source || !tree.load) return { source: { type: 'wire' }, load: { type: 'wire' } }
  return { source: tree.source, load: tree.load }
}

export function Circuit({ props }: { props: Props }) {
  const store = useStore()
  const outer = useScopeFor(namesIn([props.load, props.source, props.current, props.flow, props.transient, props.motion, props.at]))
  const bound = boundSchematic(props, outer)
  const sourceRaw = bound?.source ?? ((props.source ?? { type: 'battery' }) as CircuitNode)
  const loadRaw = bound?.load ?? ((props.load ?? { type: 'wire' }) as CircuitNode)
  const scope = atInstant(props, outer, sourceRaw, loadRaw)
  const load = expand(loadRaw, scope)
  const source = expand(sourceRaw, scope)
  const current = props.current as (Note & { label?: string }) | undefined

  const ls = measure(load)
  const ss = measure(source)
  const innerW = Math.max(ls.w, ss.w + 1) * UNIT_W
  const marginL = current ? 120 : MARGIN
  const W = innerW + marginL + MARGIN
  const top = Math.max(48, isTransformer(load) || (isSeries(load) && load.series.some(isTransformer)) ? 64 : 48)
  // A transformer in the source hangs upward, so the gap grows by its extra height.
  const bottom = top + ls.h * ROW_H + Math.max(0, ss.h - 1) * ROW_H + (layoutBlocked(load) ? 36 : 16)
  const H = bottom + 56

  // Particles move at 30 px/s when the current equals its reference (the value at
  // the lesson's initial parameters), so doubling the current doubles the speed.
  const flowSpec = (props.flow ?? (current ? { expr: current.expr } : null)) as { expr: string; ref?: number | string } | null
  const up = !(isElement(source) && (source.type === 'battery' || source.type === 'currentSource') && source.positive === 'right')
  let flow = 0
  if (flowSpec && props.flow !== false) {
    const I = num(flowSpec.expr, scope, 0)
    const ref = Math.abs(num(flowSpec.ref, scope, NaN)) || Math.abs(num(flowSpec.expr, store.initialScope(), NaN)) || Math.abs(I) || 1
    flow = (30 * I) / ref
    if (!up) flow = -flow
  }
  const ctx: Ctx = { scope, out: [], key: 0, share: 1, flow, forward: 1, drop: 1 }
  const ladder = props.layout === 'ladder' ? planLadder(sourceRaw, loadRaw, scope) : null
  if (ladder) {
    const size = drawLadder(ladder, ctx, props, current)
    flushCaptions(ctx)
    return <CircuitFrame props={props} W={size.W} H={size.H} body={ctx.out} />
  }
  const left = marginL
  const right = marginL + innerW
  draw(load, left, top, innerW, ctx)
  const srcW = ss.w * UNIT_W
  const srcX = left + (innerW - srcW) / 2
  const trunk = (x1: number, y1: number, x2: number, y2: number, dir: number) => {
    ctx.out.push(<line key={ctx.key++} x1={x1} y1={y1} x2={x2} y2={y2} className="circuit-wire" />)
    flowLine(ctx, x1, y1, x2, y2, dir)
  }
  // Around the loop: up the left side, across the load, down the right, back through the source.
  trunk(left, bottom, srcX, bottom, -1)
  const flowTop = ctx.flow
  ctx.flow = -flowTop
  ctx.forward = -1
  ctx.drop = -1
  draw(source, srcX, bottom, srcW, ctx)
  ctx.flow = flowTop
  ctx.forward = 1
  ctx.drop = 1
  trunk(srcX + srcW, bottom, right, bottom, -1)
  trunk(left, bottom, left, top, 1)
  trunk(right, top, right, bottom, 1)
  flushCaptions(ctx)

  let currentEl: ReactNode = null
  if (current) {
    const { note: shown, reversed } = currentDirection(current, scope)
    const text = `${current.label ?? 'I'} = ${noteText(shown, scope)}`
    const ax = left
    const ay = (top + bottom) / 2
    // Conventional current leaves the long (positive) plate of the source.
    const tri = up !== reversed
      ? `${ax},${ay - 10} ${ax - 6},${ay + 2} ${ax + 6},${ay + 2}`
      : `${ax},${ay + 10} ${ax - 6},${ay - 2} ${ax + 6},${ay - 2}`
    currentEl = (
      <g>
        <polygon points={tri} className="circuit-current" />
        <text x={ax - 12} y={ay + 5} textAnchor="end" className="circuit-current-label">
          <Rich text={text} />
        </text>
      </g>
    )
  }

  return (
    <CircuitFrame
      props={props}
      W={W}
      H={H}
      body={
        <>
          {ctx.out}
          {currentEl}
        </>
      }
    />
  )
}

/**
 * A transient circuit is drawn at the instant `transient.at`, and a motion's circuit
 * at `at` (a Sim clock, a slider, default 0). `t`, the state and every read name take
 * their values then, so switches, `emf: "B*L*v"` and the meter notes follow the clock.
 */
function atInstant(props: Props, scope: Scope, source: CircuitNode, load: CircuitNode): Scope {
  const tr = transientOf(props)
  if (tr) {
    const run = scope[tr.name]
    if (!isMotionObject(run)) return scope
    const t = Math.min(Math.max(num(tr.at ?? '0', scope, 0), 0), run.tEnd)
    const out: Scope = { ...scope, t }
    for (const r of transientReads(source as SchematicNode, load as SchematicNode)) {
      const f = run[r.name]
      if (typeof f === 'function') out[r.name] = f(t)
    }
    return out
  }
  if (typeof props.motion === 'string') {
    const run = scope[props.motion]
    if (!isMotionObject(run)) return scope
    const end = run.tEnd
    const t = Math.min(Math.max(num(props.at ?? 0, scope, 0), 0), end)
    const at = (run as unknown as { __run: { at(time: number): Record<string, number> } }).__run.at(t)
    return { ...scope, ...at, t }
  }
  return scope
}

function CircuitFrame({ props, W, H, body }: { props: Props; W: number; H: number; body: ReactNode }) {
  return (
    <figure className="sim still circuit">
      <div className="stage">
        <StageHead props={props} />
        <div className="stage-canvas circuit-canvas">
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: Math.max(W * 1.25, 360) }} role="img" aria-label={String(props.title ?? '电路图')}>
            {body}
          </svg>
        </div>
        {typeof props.note === 'string' && (
          <div className="stage-note">
            <Rich text={props.note} html />
          </div>
        )}
      </div>
    </figure>
  )
}
