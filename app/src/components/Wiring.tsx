import { useState, type ReactNode } from 'react'
import { num, type Scope } from '../lesson/expr'
import type { Props } from '../lesson/parse'
import { namesIn, useScopeFor, useStore } from '../lesson/store'
import { boolOf, solves, solveWiring, WIRING_TYPES, wiringTerminals, type WiringPart, type WiringWire } from '../lesson/circuit'
import { decadeReading, galvTerminalList } from '../lesson/instruments'
import { colorOf, useTheme } from '../theme'
import { formatTick } from './layout'
import { Rich } from './rich'
import { StageHead } from './Sim'
import { CraftDefs, useCraftId } from '../craft/svg'
import { craftTokens } from '../craft/tokens'

// Real-wiring diagram (实物连线图): bench components drawn as objects with binding
// posts, wires as soft curves between posts. Wires marked `answer` are the ones the
// student must draw; they stay hidden until revealed. With `steps` the wires are
// connected one at a time, numbered in order, and the count lives in a Param so
// meter readings can depend on how far the wiring has got.
// Once the battery states its EMF the drawing is solved as a real circuit
// (lesson/circuit.ts): needles, lamp glow and warnings follow the wires on screen.

type PartType = (typeof WIRING_TYPES)[number]
type Vec = [number, number]

interface PartSpec {
  id: string
  type: PartType
  x?: number
  y?: number
  label?: string
  ranges?: number[]
  value?: number | string
  slider?: number | string
  closed?: boolean | string
  lit?: number | string
  decades?: number[]
  positive?: 'left' | 'right'
  terminals?: string[]
}

interface WireSpec {
  from: string
  to: string
  answer?: boolean
  when?: string
  color?: string
  note?: string
}

interface Term {
  p: Vec
  n: Vec
  label?: string
  labelAt?: Vec
  anchor?: 'start' | 'middle' | 'end'
}

interface Drawn {
  els: ReactNode[]
  terms: Record<string, Term>
}

const W = 640
const SIZE: Record<PartType, Vec> = {
  battery: [132, 40],
  switch: [108, 40],
  ammeter: [104, 88],
  voltmeter: [104, 88],
  galvanometer: [104, 88],
  rheostat: [228, 76],
  resistor: [120, 30],
  resistanceBox: [136, 76],
  lamp: [76, 84],
}
const METERS = new Set<PartType>(['ammeter', 'voltmeter', 'galvanometer'])
const TYPE_CN: Record<PartType, string> = {
  battery: '电源',
  switch: '开关',
  ammeter: '电流表',
  voltmeter: '电压表',
  galvanometer: '灵敏电流计',
  rheostat: '滑动变阻器',
  resistor: '电阻',
  resistanceBox: '电阻箱',
  lamp: '小灯泡',
}

/** Plain words for one wire end, naming only what the drawing actually shows. */
export function describeEnd(ref: string, parts: { id: string; type: string; label?: string }[]): string {
  const [id, t] = splitEnd(ref)
  const p = parts.find((q) => q.id === id)
  if (!p) return ref
  const type = p.type as PartType
  const cjk = /[\u4e00-\u9fff]/
  const name = p.label && cjk.test(p.label) ? p.label : `${TYPE_CN[type] ?? ''} ${p.label ?? id}`.trim()
  let post: string
  if (type === 'battery') post = t === '+' ? '正极' : '负极'
  else if (type === 'rheostat') post = t === 'C' || t === 'D' ? `${t} 端（连滑片）` : `${t} 端`
  else if (METERS.has(type)) post = `「${t === '-' ? '−' : t}」接线柱`
  else post = t === 'a' ? '左端' : '右端'
  // Chinese runs touch 的 directly; a Latin letter or symbol gets a thin gap.
  return `${name}${cjk.test(name.slice(-1)) ? '' : ' '}的${/^[A-Za-z]/.test(post) ? ' ' : ''}${post}`
}

const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]]
const mul = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k]
const unit = (v: Vec): Vec => {
  const l = Math.hypot(v[0], v[1]) || 1
  return [v[0] / l, v[1] / l]
}
const normTerm = (s: string) => s.replace('−', '-').trim()

/** "A.0.6" → ["A", "0.6"]: ids never contain a dot, terminal names may. */
export function splitEnd(ref: string): [string, string] {
  const i = ref.indexOf('.')
  return i < 0 ? [ref, ''] : [ref.slice(0, i), normTerm(ref.slice(i + 1))]
}

function Post({ p }: { p: Vec }) {
  return (
    <g>
      <circle cx={p[0]} cy={p[1]} r={5.5} className="wr-post" />
      <circle cx={p[0]} cy={p[1]} r={2} className="wr-post-core" />
    </g>
  )
}

function battery(c: Vec, positiveLeft: boolean): Drawn {
  const [x, y] = c
  // s points from the − post to the + post; each cell's nub (its + end) faces that way.
  const s = positiveLeft ? -1 : 1
  const els: ReactNode[] = [<rect key="h" x={x - 66} y={y - 20} width={132} height={40} rx={7} className="wr-wood" />]
  for (const k of [-1, 1]) {
    const cx = x + k * 27
    els.push(
      <rect key={'c' + k} x={cx - 23} y={y - 11} width={46} height={22} rx={4} fill="url(#wr-steel)" className="wr-cell" />,
      <rect key={'n' + k} x={s > 0 ? cx + 23 : cx - 27} y={y - 4} width={4} height={8} rx={1} className="wr-cell-nub" />,
    )
  }
  els.push(
    <text key="sm" x={x - s * 57} y={y + 15} textAnchor="middle" className="wr-sign">−</text>,
    <text key="sp" x={x + s * 57} y={y + 15} textAnchor="middle" className="wr-sign">+</text>,
  )
  return { els, terms: { '-': { p: [x - s * 57, y - 7], n: [0, -1] }, '+': { p: [x + s * 57, y - 7], n: [0, -1] } } }
}

function knifeSwitch(c: Vec, closed: boolean): Drawn {
  const [x, y] = c
  const hinge: Vec = [x - 22, y - 4]
  const clip: Vec = [x + 26, y - 4]
  const a = closed ? 0 : (-38 * Math.PI) / 180
  const L = 56
  const end: Vec = add(hinge, [L * Math.cos(a), L * Math.sin(a)])
  const els: ReactNode[] = [
    <rect key="b" x={x - 54} y={y - 8} width={108} height={22} rx={4} className="wr-wood" />,
    <line key="s1" x1={x - 44} y1={y + 2} x2={hinge[0]} y2={y + 2} className="wr-strip" />,
    <line key="s2" x1={clip[0]} y1={y + 2} x2={x + 44} y2={y + 2} className="wr-strip" />,
    <rect key="hg" x={hinge[0] - 4} y={hinge[1] - 4} width={8} height={10} rx={1.5} className="wr-metal" />,
    <rect key="c1" x={clip[0] - 4} y={clip[1] - 7} width={2.6} height={12} className="wr-metal" />,
    <rect key="c2" x={clip[0] + 1.4} y={clip[1] - 7} width={2.6} height={12} className="wr-metal" />,
    <line key="bl" x1={hinge[0]} y1={hinge[1]} x2={end[0]} y2={end[1]} className="wr-blade" />,
    <circle key="hd" cx={end[0] + 7 * Math.cos(a)} cy={end[1] + 7 * Math.sin(a)} r={5} className="wr-handle" />,
  ]
  return { els, terms: { a: { p: [x - 44, y + 2], n: [0, -1] }, b: { p: [x + 44, y + 2], n: [0, -1] } } }
}

function meter(c: Vec, type: PartType, ranges: number[], value: number, wired: number | null, accent: string, terminals?: string[]): Drawn {
  const [x, y] = c
  const galv = type === 'galvanometer'
  const pv: Vec = [x, y + 6]
  const R = 30
  const angleOf = (f: number) => ((galv ? 90 - 50 * f : 140 - 100 * f) * Math.PI) / 180
  const pt = (f: number, r: number): Vec => [pv[0] + r * Math.cos(angleOf(f)), pv[1] - r * Math.sin(angleOf(f))]
  const els: ReactNode[] = [
    <rect key="b" x={x - 52} y={y - 44} width={104} height={88} rx={8} className="wr-body" />,
    <rect key="f" x={x - 45} y={y - 38} width={90} height={48} rx={4} className="wr-face" />,
  ]
  const N = 20
  for (let i = 0; i <= N; i++) {
    const f = galv ? (2 * i) / N - 1 : i / N
    const len = i % 10 === 0 ? 6 : i % 2 === 0 ? 4.5 : 2.6
    const [a, b] = [pt(f, R - len), pt(f, R)]
    els.push(<line key={'t' + i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className="wr-tick" />)
  }
  const full = wired ?? (ranges.length ? Math.max(...ranges) : 1)
  // Small ranges are marked in milli-units like a real milliammeter: 0.015 A full scale reads 0–15 mA.
  const milli = (r: number) => !galv && r < 0.1
  const k = milli(full) ? 1000 : 1
  const nums = galv ? [[0, '0']] : [[0, '0'], [0.5, formatTick((full * k) / 2)], [1, formatTick(full * k)]]
  for (const [f, s] of nums as [number, string][]) {
    const p = pt(f, R + 8)
    els.push(<text key={'nl' + f} x={p[0]} y={p[1] + 3} textAnchor="middle" className="wr-num">{s}</text>)
  }
  const sym = galv ? 'G' : `${k === 1000 ? 'm' : ''}${type === 'ammeter' ? 'A' : 'V'}`
  els.push(<text key="sym" x={x - 42} y={y + 6} textAnchor="start" className="wr-symbol">{sym}</text>)
  if (Number.isFinite(value)) {
    const f = galv ? Math.max(-1.08, Math.min(1.08, value)) : Math.max(-0.04, Math.min(1.06, value / full))
    const tip = pt(f, R - 3)
    els.push(
      <line key="nd" x1={pv[0]} y1={pv[1]} x2={tip[0]} y2={tip[1]} stroke={accent} className="wr-needle" />,
      <circle key="pv" cx={pv[0]} cy={pv[1]} r={2.4} fill={accent} />,
    )
  }
  const names = galv ? galvTerminalList(terminals) : ['-', ...ranges.map(String)]
  // Trailing digits become subscripts (G0 → G₀) so a post name is not read as a scale number.
  const sub = (nm: string) => nm.replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)] ?? d)
  const labelOf = (nm: string) => (nm === '-' ? '−' : galv ? sub(nm) : milli(Number(nm)) ? formatTick(Number(nm) * 1000) : nm)
  const step = Math.max(names.length > 2 ? 46 : 40, ...names.map((nm) => labelOf(nm).length * 12 + 16))
  const half = (step * Math.max(0, names.length - 1)) / 2
  const bodyW = Math.max(104, half * 2 + 40)
  els[0] = <rect key="b" x={x - bodyW / 2} y={y - 44} width={bodyW} height={88} rx={8} className="wr-body" />
  const terms: Record<string, Term> = {}
  names.forEach((nm, i) => {
    const px = x + (i - (names.length - 1) / 2) * step
    const label = labelOf(nm)
    terms[nm] = { p: [px, y + 34], n: [0, 1], label, labelAt: [px, y + 18], anchor: 'middle' }
  })
  return { els, terms }
}

function rheostat(c: Vec, p: number): Drawn {
  const [x, y] = c
  const els: ReactNode[] = [
    <rect key="bl" x={x - 100} y={y - 16} width={16} height={46} rx={3} className="wr-body" />,
    <rect key="br" x={x + 84} y={y - 16} width={16} height={46} rx={3} className="wr-body" />,
    <rect key="coil" x={x - 84} y={y - 5} width={168} height={24} rx={11} fill="url(#wr-steel)" className="wr-coil" />,
  ]
  const turns: string[] = []
  for (let k = x - 78; k <= x + 78; k += 3.2) turns.push(`M${k},${y - 4}L${k - 1.6},${y + 18}`)
  els.push(<path key="turns" d={turns.join('')} className="wr-turns" />)
  els.push(
    <line key="s1" x1={x - 92} y1={y - 16} x2={x - 92} y2={y - 32} className="wr-rod-post" />,
    <line key="s2" x1={x + 92} y1={y - 16} x2={x + 92} y2={y - 32} className="wr-rod-post" />,
    <line key="rod" x1={x - 104} y1={y - 32} x2={x + 104} y2={y - 32} className="wr-rod" />,
  )
  const sx = x - 72 + 144 * Math.max(0, Math.min(1, p))
  els.push(
    <line key="ct" x1={sx} y1={y - 26} x2={sx} y2={y - 4} className="wr-contact" />,
    <rect key="sl" x={sx - 10} y={y - 41} width={20} height={17} rx={3} className="wr-slider" />,
    <text key="P" x={sx} y={y - 46} textAnchor="middle" className="wr-letter">P</text>,
  )
  return {
    els,
    terms: {
      A: { p: [x - 92, y + 21], n: [0, 1], label: 'A', labelAt: [x - 106, y + 25], anchor: 'end' },
      B: { p: [x + 92, y + 21], n: [0, 1], label: 'B', labelAt: [x + 106, y + 25], anchor: 'start' },
      // Letters sit under the rod ends: wires to C/D almost always arrive from above.
      C: { p: [x - 110, y - 32], n: unit([-1, -1]), label: 'C', labelAt: [x - 110, y - 16], anchor: 'middle' },
      D: { p: [x + 110, y - 32], n: unit([1, -1]), label: 'D', labelAt: [x + 110, y - 16], anchor: 'middle' },
    },
  }
}

function resistor(c: Vec): Drawn {
  const [x, y] = c
  return {
    els: [
      <line key="l1" x1={x - 56} y1={y} x2={x - 34} y2={y} className="wr-strip" />,
      <line key="l2" x1={x + 34} y1={y} x2={x + 56} y2={y} className="wr-strip" />,
      <rect key="b" x={x - 34} y={y - 10} width={68} height={20} rx={10} className="wr-resistor" />,
      <rect key="k1" x={x - 20} y={y - 10} width={5} height={20} className="wr-band" />,
      <rect key="k2" x={x - 9} y={y - 10} width={5} height={20} className="wr-band" />,
      <rect key="k3" x={x + 2} y={y - 10} width={5} height={20} className="wr-band" />,
      <rect key="k4" x={x + 17} y={y - 10} width={5} height={20} className="wr-band gold" />,
    ],
    // Mostly sideways, so a wire can leave toward a meter above or the bench below
    // without first climbing over the resistor.
    terms: { a: { p: [x - 58, y], n: unit([-1, -0.25]) }, b: { p: [x + 58, y], n: unit([1, -0.25]) } },
  }
}

function resistanceBox(c: Vec, value: number, decades: number[]): Drawn {
  const [x, y] = c
  const ds = decades.slice(0, 6)
  const read = decadeReading(value, ds)
  const gap = 74
  const w = gap * ds.length + 24
  const h = 128
  const dialR = 24
  const els: ReactNode[] = [<rect key="b" x={x - w / 2} y={y - h / 2} width={w} height={h} rx={6} className="wr-wood" />]
  ds.forEach((d, i) => {
    const kx = x + (i - (ds.length - 1) / 2) * gap
    const ky = y - 8
    const digit = read.digits[i] ?? 0
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI / 2 + (k * 2 * Math.PI) / 10
      const hot = k === digit
      els.push(
        <text key={`d${i}-${k}`} x={kx + Math.cos(a) * dialR} y={ky + Math.sin(a) * dialR + 3} textAnchor="middle" className={hot ? 'wr-num hot' : 'wr-num'} style={hot ? { fontWeight: 700 } : undefined}>
          {k}
        </text>,
      )
    }
    const a = -Math.PI / 2 + (digit * 2 * Math.PI) / 10
    els.push(
      <circle key={'k' + i} cx={kx} cy={ky} r={10} className="wr-knob" />,
      <line key={'kp' + i} x1={kx + Math.cos(a) * 3} y1={ky + Math.sin(a) * 3} x2={kx + Math.cos(a) * 8} y2={ky + Math.sin(a) * 8} className="wr-knob-ptr" />,
      <text key={'kl' + i} x={kx} y={ky + dialR + 16} textAnchor="middle" className="wr-num">{`×${formatTick(d, { bare: true })}`}</text>,
    )
  })
  els.push(<text key="tot" x={x} y={y + h / 2 - 12} textAnchor="middle" className="wr-num">{`${formatTick(read.total)} Ω`}</text>)
  const postY = y - h / 2 + 10
  return {
    els,
    terms: { a: { p: [x - w / 2 + 16, postY], n: [0, -1] }, b: { p: [x + w / 2 - 16, postY], n: [0, -1] } },
  }
}

function lamp(c: Vec, lit: number, accent: string): Drawn {
  const [x, y] = c
  // Below a few percent of rated power the filament does not visibly glow.
  const raw = Math.max(0, Math.min(1, Number.isFinite(lit) ? lit : 0))
  const b = raw < 0.02 ? 0 : raw
  const els: ReactNode[] = []
  if (b > 0) {
    els.push(<circle key="glow" cx={x} cy={y - 16} r={18 + 16 * b} fill="url(#wr-glow)" opacity={0.35 + 0.65 * b} />)
  }
  els.push(
    <rect key="pl" x={x - 36} y={y + 22} width={72} height={14} rx={3} className="wr-wood" />,
    <rect key="sk" x={x - 13} y={y + 6} width={26} height={16} rx={2} className="wr-metal" />,
    <circle key="g" cx={x} cy={y - 16} r={19} className="wr-glass" />,
    <path
      key="fl"
      d={`M${x - 6},${y + 4} L${x - 6},${y - 12} L${x - 3},${y - 18} L${x},${y - 12} L${x + 3},${y - 18} L${x + 6},${y - 12} L${x + 6},${y + 4}`}
      className="wr-filament"
      style={b > 0 ? { stroke: accent } : undefined}
    />,
  )
  return { els, terms: { a: { p: [x - 27, y + 29], n: [-1, 0] }, b: { p: [x + 27, y + 29], n: [1, 0] } } }
}

function partSize(p: PartSpec): Vec {
  if (p.type === 'resistanceBox') {
    const n = Math.min(6, Math.max(1, Array.isArray(p.decades) && p.decades.length ? p.decades.length : 4))
    return [74 * n + 32, 136]
  }
  if (p.type === 'galvanometer' && Array.isArray(p.terminals) && p.terminals.length > 2) {
    const step = Math.max(46, ...p.terminals.map((s) => String(s).replace(/\d/g, '₀').length * 12 + 16))
    return [step * (p.terminals.length - 1) + 52, 96]
  }
  return SIZE[p.type]
}

/** Parts without x/y: meters on top, the rest along the bench below, wrapping rows that overflow. */
function autoPlace(parts: PartSpec[], H: number): Map<string, Vec> {
  const at = new Map<string, Vec>()
  const free = parts.filter((p) => p.x === undefined || p.y === undefined)
  const GAP = 28
  const pack = (list: PartSpec[]) => {
    const rows: PartSpec[][] = []
    let width = Infinity
    for (const p of list) {
      const w = partSize(p)[0]
      if (width + GAP + w > W - 32) {
        rows.push([])
        width = -GAP
      }
      rows[rows.length - 1].push(p)
      width += GAP + w
    }
    return rows
  }
  const rows = [...pack(free.filter((p) => METERS.has(p.type))), ...pack(free.filter((p) => !METERS.has(p.type)))]
  rows.forEach((row, r) => {
    const y = rows.length === 1 ? H / 2 : 66 + (r * (H - 132)) / (rows.length - 1)
    const widths = row.map((p) => partSize(p)[0])
    const total = widths.reduce((s, w) => s + w, 0)
    const gap = Math.max(GAP, Math.min(80, (W - 32 - total) / Math.max(1, row.length - 1)))
    let cx = (W - total - gap * (row.length - 1)) / 2
    row.forEach((p, i) => {
      at.set(p.id, [cx + widths[i] / 2, y])
      cx += widths[i] + gap
    })
  })
  for (const p of parts) if (!at.has(p.id)) at.set(p.id, [p.x as number, p.y as number])
  return at
}

export function Wiring({ props }: { props: Props }) {
  const theme = useTheme()
  const cid = useCraftId()
  const craftK = craftTokens(theme)
  const [reveal, setReveal] = useState(false)
  const parts = (Array.isArray(props.parts) ? props.parts : []).filter(
    (p): p is PartSpec => !!p && typeof p === 'object' && (WIRING_TYPES as readonly string[]).includes(String((p as PartSpec).type)),
  ) as PartSpec[]
  const wires = (Array.isArray(props.wires) ? props.wires : []) as WireSpec[]
  const stepName = typeof props.steps === 'string' ? props.steps : null
  const store = useStore()
  const scope = useScopeFor(namesIn([props.parts, props.wires, stepName ?? '']))
  const H = typeof props.height === 'number' ? props.height : 340
  const accent = colorOf('charge', theme)
  const pen = colorOf('velocity', theme)

  const active = wires.filter((w) => w.when === undefined || boolOf(w.when, scope, true))
  // In step mode the sequence is every active wire in written order; the Param
  // says how many of them are connected so far.
  const total = active.length
  const done = stepName ? Math.max(0, Math.min(total, Math.round(num(stepName, scope, total)))) : total
  const shown = stepName ? active.slice(0, done) : active.filter((w) => (w.answer ? reveal : true))
  const current = stepName && done > 0 ? done - 1 : -1
  const at = autoPlace(parts, H)
  // The drawing solves the wires actually on screen, so hidden answer wires leave
  // their meters at zero until revealed; published `read` values use the full circuit.
  const solved = solves(parts as WiringPart[]) ? solveWiring(parts as WiringPart[], shown as WiringWire[], scope) : null

  const drawn = new Map<string, Drawn>()
  for (const p of parts) {
    const c = at.get(p.id)!
    let d: Drawn
    switch (p.type) {
      case 'battery':
        d = battery(c, p.positive === 'left')
        break
      case 'switch':
        d = knifeSwitch(c, boolOf(p.closed, scope, false))
        break
      case 'ammeter':
      case 'voltmeter':
      case 'galvanometer': {
        const ranges = p.type === 'galvanometer' ? [] : wiringTerminals(p.type, p.ranges).slice(1).map(Number)
        // The scale follows whichever range terminal is actually wired.
        const used = shown
          .flatMap((w) => [splitEnd(w.from), splitEnd(w.to)])
          .filter(([id, t]) => id === p.id && t !== '-' && t !== '+')
          .map(([, t]) => Number(t))
          .find((r) => ranges.includes(r))
        // A meter with no wire attached reads zero, whatever the lesson's value says.
        const connected = shown.some((w) => splitEnd(w.from)[0] === p.id || splitEnd(w.to)[0] === p.id)
        const r = solved?.parts[p.id]
        const value = r
          ? p.type === 'galvanometer'
            ? (r.deflect ?? 0)
            : (r.reading ?? 0)
          : p.value === undefined
            ? NaN
            : connected
              ? num(p.value, scope, NaN)
              : 0
        d = meter(c, p.type, ranges, value, used ?? null, accent, p.type === 'galvanometer' ? p.terminals : undefined)
        break
      }
      case 'rheostat':
        d = rheostat(c, num(p.slider, scope, 0.5))
        break
      case 'resistor':
        d = resistor(c)
        break
      case 'resistanceBox':
        d = resistanceBox(c, num(p.value, scope, NaN), Array.isArray(p.decades) && p.decades.length ? p.decades : [1000, 100, 10, 1])
        break
      case 'lamp':
        d = lamp(c, solved ? (solved.parts[p.id]?.lit ?? 0) : num(p.lit, scope, 0), accent)
        break
    }
    drawn.set(p.id, d)
  }

  const term = (ref: string): Term | undefined => {
    const [id, t] = splitEnd(ref)
    return drawn.get(id)?.terms[t]
  }

  const wireEls: ReactNode[] = []
  const badges: ReactNode[] = []
  let currentEls: ReactNode[] = []
  shown.forEach((w, i) => {
    const a = term(w.from)
    const b = term(w.to)
    if (!a || !b) return
    const d = Math.hypot(b.p[0] - a.p[0], b.p[1] - a.p[1])
    const k = Math.max(26, Math.min(110, d * 0.42))
    // Leave each post along its normal but lean toward the other end, so a wire
    // never loops back across its own component.
    const toB = unit([b.p[0] - a.p[0], b.p[1] - a.p[1]])
    const c1 = add(a.p, mul(unit(add(a.n, mul(toB, 0.8))), k))
    const c2 = add(b.p, mul(unit(add(b.n, mul(toB, -0.8))), k))
    const isCurrent = i === current
    const color = isCurrent || (w.answer && !stepName) ? pen : w.color ? colorOf(w.color, theme) : undefined
    const path = (
      <path
        key={'w' + i}
        d={`M${a.p[0]},${a.p[1]} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${b.p[0]},${b.p[1]}`}
        className={`wr-wire${w.answer && !stepName ? ' answer' : ''}${isCurrent ? ' current' : ''}`}
        style={color ? { stroke: color } : undefined}
        data-step={stepName ? i + 1 : undefined}
      />
    )
    if (isCurrent) {
      currentEls = [
        path,
        ...[a.p, b.p].map((p, j) => <circle key={'ring' + j} cx={p[0]} cy={p[1]} r={9.5} className="wr-ring" style={{ stroke: pen }} />),
      ]
    } else wireEls.push(path)
    if (stepName) {
      // Cubic Bézier at t = ½.
      const m = mul(add(add(a.p, b.p), mul(add(c1, c2), 3)), 1 / 8)
      badges.push(
        <g key={'bd' + i} className={`wr-badge${isCurrent ? ' current' : ''}`}>
          <circle cx={m[0]} cy={m[1]} r={8.5} style={isCurrent ? { fill: pen, stroke: pen } : undefined} />
          <text x={m[0]} y={m[1] + 3.4} textAnchor="middle">
            {i + 1}
          </text>
        </g>,
      )
    }
  })

  const labels: ReactNode[] = []
  for (const p of parts) {
    const d = drawn.get(p.id)!
    for (const [nm, t] of Object.entries(d.terms)) {
      if (t.label && t.labelAt) {
        labels.push(
          <text key={`tl-${p.id}-${nm}`} x={t.labelAt[0]} y={t.labelAt[1] + 3} textAnchor={t.anchor ?? 'middle'} className="wr-term">
            {t.label}
          </text>,
        )
      }
    }
    if (p.label) {
      const c = at.get(p.id)!
      const [, h] = partSize(p)
      const above = METERS.has(p.type)
      labels.push(
        <text key={'pl' + p.id} x={c[0]} y={above ? c[1] - h / 2 - 9 : c[1] + h / 2 + (p.type === 'rheostat' ? 4 : 18)} textAnchor="middle" className="wr-label">
          <Rich text={p.label} />
        </text>,
      )
    }
  }

  const hasAnswer = !stepName && wires.some((w) => w.answer)
  const go = (n: number) => {
    if (stepName) store.set({ [stepName]: Math.max(0, Math.min(total, n)) })
  }
  const cur = current >= 0 ? active[current] : null
  return (
    <figure className="sim still wiring">
      <div className="stage">
        <StageHead props={props} />
        <svg id={cid} viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W * 1.15 }} role="img" aria-label={String(props.title ?? '实物连线图')}>
          <CraftDefs id={cid} theme={theme} />
          {/* parts keep their class names; this scoped sheet gives them the B+ materials */}
          <style>{`
#${cid} .wr-body,#${cid} .wr-face,#${cid} .wr-resistor{fill:url(#${cid}-face);stroke:${craftK.soft.color};stroke-width:${craftK.soft.width}}
#${cid} .wr-face{stroke:${craftK.strong.color};stroke-width:${craftK.strong.width}}
#${cid} .wr-wood{fill:url(#${cid}-m-insul);stroke:${craftK.strong.color};stroke-width:${craftK.strong.width}}
#${cid} .wr-cell,#${cid} .wr-coil{stroke:${craftK.strong.color};stroke-width:${craftK.strong.width}}
#${cid} .wr-cell-nub,#${cid} .wr-metal{fill:url(#${cid}-m-alu);stroke:${craftK.strong.color};stroke-width:0.6}
#${cid} .wr-knob{fill:url(#${cid}-s-dark);stroke:${craftK.strong.color};stroke-width:${craftK.strong.width}}
#${cid} .wr-knob-ptr{stroke:${theme === 'night' ? '#E2E7EE' : '#F3F5F7'}}
#${cid} .wr-slider{fill:url(#${cid}-m-dark)}
#${cid} .wr-post{fill:url(#${cid}-s-brass);stroke:${craftK.strong.color};stroke-width:${craftK.strong.width}}`}</style>
          <defs>
            <linearGradient id="wr-steel" x1="0" y1="0" x2="0" y2="1">
              {craftK.materials.steelHi.stops.map(([o, c], i) => (
                <stop key={i} offset={o} stopColor={c} />
              ))}
            </linearGradient>
            <linearGradient id={`${cid}-face`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={theme === 'night' ? '#2A2D33' : '#FFFFFF'} />
              <stop offset="1" stopColor={theme === 'night' ? '#1E2025' : '#EEF0F3'} />
            </linearGradient>
            <radialGradient id="wr-glow">
              <stop offset="0" stopColor={accent} stopOpacity={0.9} />
              <stop offset="1" stopColor={accent} stopOpacity={0} />
            </radialGradient>
          </defs>
          {parts.map((p) => (
            <g key={p.id}>{drawn.get(p.id)!.els}</g>
          ))}
          {wireEls}
          {currentEls}
          {parts.flatMap((p) => Object.entries(drawn.get(p.id)!.terms).map(([nm, t]) => <Post key={`p-${p.id}-${nm}`} p={t.p} />))}
          {labels}
          {badges}
        </svg>
        {stepName && (
          <div className="wiring-steps">
            <div className="wiring-step-bar" role="group" aria-label="逐根接线">
              <button type="button" className="wiring-toggle" onClick={() => go(0)} disabled={done === 0}>
                从头接
              </button>
              <button type="button" className="wiring-toggle" onClick={() => go(done - 1)} disabled={done === 0}>
                上一根
              </button>
              <button type="button" className="wiring-toggle primary" onClick={() => go(done + 1)} disabled={done >= total}>
                下一根
              </button>
              <button type="button" className="wiring-toggle" onClick={() => go(total)} disabled={done >= total}>
                全部接好
              </button>
              <span className="wiring-count" aria-live="polite">
                已接 {done} / {total} 根
              </span>
            </div>
            <p className="wiring-caption">
              {cur ? (
                <>
                  <b>第 {done} 根</b>
                  {'：'}
                  <Rich text={`${describeEnd(cur.from, parts)} → ${describeEnd(cur.to, parts)}`} html />
                  {typeof cur.note === 'string' && (
                    <>
                      {'。'}
                      <Rich text={cur.note} html />
                    </>
                  )}
                </>
              ) : (
                '还没有接线。按「下一根」从第 1 根开始。'
              )}
            </p>
          </div>
        )}
        {solved && solved.warnings.length > 0 && (
          <ul className="wiring-warn" role="status">
            {solved.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}
        {(hasAnswer || typeof props.note === 'string') && (
          <div className="stage-note wiring-note">
            {hasAnswer && (
              <button type="button" className="wiring-toggle" aria-pressed={reveal} onClick={() => setReveal((r) => !r)}>
                {reveal ? '隐藏答案连线' : '显示答案连线'}
              </button>
            )}
            {typeof props.note === 'string' && <Rich text={props.note} html />}
          </div>
        )}
      </div>
    </figure>
  )
}
