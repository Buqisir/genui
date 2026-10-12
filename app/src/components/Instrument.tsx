import { useId, type ReactNode } from 'react'
import { num, type Scope } from '../lesson/expr'
import { eyepieceHalfMm, fringeRGB, measurementOf } from '../lesson/fringes'
import {
  activeArc,
  decadeReading,
  galvTerminalList,
  ohmFraction,
  ohmTicks,
  readMultimeter,
  readSpringScale,
  selectorGroups,
  selectorSlots,
} from '../lesson/instruments'
import type { Props } from '../lesson/parse'
import { namesIn, useScopeFor } from '../lesson/store'
import { INSTRUMENT_TYPES } from '../lesson/validate'
import { colorOf, useTheme, type ThemeName } from '../theme'
import { formatTick } from './layout'
import { Rich } from './rich'
import { StageHead } from './Sim'
import { CraftDefs, useCraftId } from '../craft/svg'
import { craftTokens } from '../craft/tokens'

// Reading-practice instruments from the experiment questions: every one is drawn
// from the value, so the scale, the aligned line and the worked reading always agree.

type InstrumentType = (typeof INSTRUMENT_TYPES)[number]

const W = 640

interface Drawn {
  h: number
  /** Content width when narrower than W, so the drawing is centred instead of left-aligned. */
  w?: number
  els: ReactNode
  reading: string
  /** Lines after the drum reading: screen coordinate, Δx, λ. */
  extra?: string[]
}

const fix = (v: number, d: number) => (Number.isFinite(v) ? v.toFixed(Math.max(0, d)) : '—')
const decimals = (x: number) => Math.max(0, -Math.floor(Math.log10(x) + 1e-9))
/** Rough width of an 11px .ins-caption: CJK glyphs are square, Latin ones a bit over half. */
const captionWidth = (s: string) => [...s].reduce((w, ch) => w + (ch.charCodeAt(0) > 0x2e80 ? 11 : 6.2), 0)

function vernier(v: number, n: number, unit: string, accent: string): Drawn {
  const prec = 1 / n
  const q = Math.max(0, Math.round(v / prec) * prec)
  const main = Math.floor(q + 1e-9)
  const k = Math.round((q - main) / prec)
  const L = n - 1
  const s0 = Math.max(0, Math.floor(q / 10) * 10 - 10)
  const kpx = 8
  const X = (mm: number) => 40 + (mm - s0) * kpx
  const base = 84
  const els: ReactNode[] = []
  els.push(<rect key="main" x={16} y={34} width={W - 32} height={base - 34} rx={3} className="ins-body" />)
  for (let mm = s0; mm <= s0 + 72; mm++) {
    const len = mm % 10 === 0 ? 18 : mm % 5 === 0 ? 13 : 8
    const hot = mm === main + k
    els.push(<line key={'m' + mm} x1={X(mm)} x2={X(mm)} y1={base} y2={base - len} className={hot ? 'ins-tick hot' : 'ins-tick'} stroke={hot ? accent : undefined} />)
    if (mm % 10 === 0) els.push(<text key={'ml' + mm} x={X(mm)} y={base - 24} textAnchor="middle" className="ins-num">{mm / 10}</text>)
  }
  els.push(<text key="cm" x={W - 24} y={50} textAnchor="end" className="ins-unit">cm</text>)
  const left = X(q) - 16
  const right = X(q + L) + 20
  els.push(<rect key="vbody" x={left} y={base} width={right - left} height={44} rx={3} className="ins-body ins-slider" />)
  const every = n / 10
  for (let i = 0; i <= n; i++) {
    const x = X(q + (i * L) / n)
    const labeled = i % every === 0
    const hot = i === k
    els.push(<line key={'v' + i} x1={x} x2={x} y1={base} y2={base + (labeled ? 13 : 8)} className={hot ? 'ins-tick hot' : 'ins-tick'} stroke={hot ? accent : undefined} />)
    if (labeled) els.push(<text key={'vl' + i} x={x} y={base + 26} textAnchor="middle" className="ins-num">{i / every}</text>)
  }
  const hx = X(main + k)
  els.push(<circle key="hot" cx={hx} cy={base} r={3.2} fill={accent} />)
  const caption = `${n} 分度 · 精度 ${fix(prec, n === 10 ? 1 : 2)} mm`
  // A long (50-division) slider leaves no room on its right: the caption goes under it instead.
  const below = right + 8 + captionWidth(caption) > W - 6
  els.push(
    <text key="prec" x={below ? Math.min(right, W - 6) : right + 8} y={below ? base + 60 : base + 26} textAnchor={below ? 'end' : 'start'} className="ins-caption">
      {caption}
    </text>,
  )
  const d = n === 10 ? 1 : 2
  let reading = `主尺 ${main} mm + 游标第 ${k} 格 × ${fix(prec, d)} mm = ${fix(q, d)} mm`
  if (unit === 'cm') reading += ` = ${fix(q / 10, d + 1)} cm`
  return { h: below ? base + 70 : base + 56, els, reading }
}

function micrometer(v: number, accent: string): Drawn {
  const q = Math.max(0, Math.round(v * 1000) / 1000)
  const half = Math.floor(q / 0.5 + 1e-9) * 0.5
  const th = (q - half) / 0.01
  const kpx = 30
  const s0 = Math.max(0, Math.ceil(q) - 7)
  const X = (mm: number) => 40 + (mm - s0) * kpx
  const edge = X(q)
  const mid = 100
  const els: ReactNode[] = []
  els.push(<rect key="frame" x={4} y={78} width={20} height={44} rx={2} className="ins-body ins-slider" />)
  els.push(<rect key="sleeve" x={24} y={72} width={edge - 24 + 12} height={60} className="ins-body" />)
  els.push(<line key="axis" x1={24} x2={edge + 6} y1={mid} y2={mid} className="ins-tick hot" stroke={accent} />)
  // As in the exam figures: whole millimetres hang below the line with 0, 5, 10 under them; half millimetres stand above.
  for (let mm = s0; mm <= q + 1e-9; mm += 0.5) {
    const whole = Math.abs(mm - Math.round(mm)) < 1e-6
    const fifth = whole && Math.round(mm) % 5 === 0
    const x = X(mm)
    if (x < 26) continue
    els.push(<line key={'s' + mm} x1={x} x2={x} y1={mid} y2={whole ? mid + (fifth ? 15 : 10) : mid - 9} className="ins-tick" />)
    if (fifth) els.push(<text key={'sl' + mm} x={x} y={mid + 27} textAnchor="middle" className="ins-num">{Math.round(mm)}</text>)
  }
  const tw = 140
  els.push(<rect key="thimble" x={edge} y={52} width={tw} height={96} rx={4} className="ins-body ins-thimble" />)
  els.push(<line key="bevel" x1={edge + 34} x2={edge + 34} y1={52} y2={148} className="ins-tick faint" />)
  els.push(<rect key="ratchet" x={edge + tw} y={70} width={44} height={60} rx={3} className="ins-body ins-slider" />)
  for (let i = 1; i < 8; i++) els.push(<line key={'k' + i} x1={edge + tw + i * 5.5} x2={edge + tw + i * 5.5} y1={74} y2={126} className="ins-tick faint" />)
  const step = 8.5
  for (let j = Math.ceil(th - 5.4); j <= Math.floor(th + 5.4); j++) {
    const y = mid - (j - th) * step
    const label = ((j % 50) + 50) % 50
    const major = label % 5 === 0
    const hot = Math.abs(j - th) < 0.5
    els.push(<line key={'t' + j} x1={edge} x2={edge + (major ? 15 : 9)} y1={y} y2={y} className={hot ? 'ins-tick hot' : 'ins-tick'} stroke={hot ? accent : undefined} />)
    if (major) els.push(<text key={'tl' + j} x={edge + 19} y={y + 3.5} className="ins-num">{label}</text>)
  }
  els.push(<text key="cap" x={edge + tw + 44} y={168} textAnchor="end" className="ins-caption">精度 0.01 mm，估读到 0.001 mm</text>)
  const reading = `固定刻度 ${fix(half, 1)} mm + 可动刻度 ${fix(th, 1)} × 0.01 mm = ${fix(q, 3)} mm`
  return { h: 178, w: edge + tw + 44 + 8, els, reading }
}

const CX = W / 2
const START = (150 * Math.PI) / 180
const END = (30 * Math.PI) / 180
const polar = (cy: number, a: number, r: number) => [CX + Math.cos(a) * r, cy - Math.sin(a) * r] as const
const dialAngle = (f: number) => START + (END - START) * Math.min(1.04, Math.max(-0.04, f))

function face(cy: number, R: number, symbol: string, extra: ReactNode[]): ReactNode[] {
  const [x0, y0] = polar(cy, START, R)
  const [x1, y1] = polar(cy, END, R)
  return [
    <rect key="face" x={CX - R - 50} y={cy - R - 46} width={2 * R + 100} height={R + 92} rx={10} className="ins-body" />,
    <path key="arc" d={`M${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1}`} className="ins-arc" />,
    <text key="sym" x={CX} y={cy - R * 0.32} textAnchor="middle" className="ins-symbol">{symbol}</text>,
    ...extra,
  ]
}

function needle(cy: number, R: number, f: number, accent: string): ReactNode[] {
  const [nx, ny] = polar(cy, dialAngle(f), R + 6)
  return [
    <line key="needle" x1={CX} y1={cy} x2={nx} y2={ny} stroke={accent} strokeWidth={2} strokeLinecap="round" className="ins-needle" />,
    <circle key="pivot" cx={CX} cy={cy} r={6} className="ins-pivot" />,
  ]
}

function meter(v: number, scales: number[], range: number, divisions: number, major: number, symbol: string, unit: string, accent: string, terminals?: string[]): Drawn {
  const R = 150
  const cy = 210
  const els: ReactNode[] = []
  for (let i = 0; i <= divisions; i++) {
    const a = dialAngle(i / divisions)
    const isMajor = i % Math.round(divisions / major) === 0
    const isMid = !isMajor && i % Math.round(divisions / major / 2) === 0
    const [xa, ya] = polar(cy, a, R)
    const [xb, yb] = polar(cy, a, R - (isMajor ? 13 : isMid ? 9 : 5))
    els.push(<line key={'t' + i} x1={xa} y1={ya} x2={xb} y2={yb} className="ins-tick" />)
  }
  // Lab meters print the large range on the upper row (outside the arc) and smaller ones below it, whatever order the lesson lists them in.
  const rows = [...scales].sort((a, b) => b - a)
  rows.forEach((max, row) => {
    for (let j = 0; j <= major; j++) {
      const [x, y] = polar(cy, dialAngle(j / major), row === 0 ? R + 14 : R - 26 - (row - 1) * 18)
      const used = Math.abs(max - range) < 1e-9
      els.push(<text key={`l${row}-${j}`} x={x} y={y + 4} textAnchor="middle" className={used ? 'ins-num' : 'ins-num faint'}>{formatTick((max * j) / major)}</text>)
    }
  })
  const per = range / divisions
  const exp = Math.floor(Math.log10(per) + 1e-9)
  const mant = Math.round(per / 10 ** exp)
  // 高考估读规则：最小分度是 1 的估读到下一位；是 2 或 5 的在本位估读（半格 / 五分之一格）。
  const grain = mant === 1 ? per / 10 : mant === 2 ? per / 2 : per / 5
  const q = Math.round(v / grain) * grain
  const digits = mant === 1 ? decimals(per) + 1 : decimals(per)
  els.push(...needle(cy, R, q / range, accent))
  const reading = `量程 ${formatTick(range)} ${unit}，每小格 ${formatTick(per)} ${unit}，读数 ${fix(q, digits)} ${unit}`
  const posts = terminals?.map((t) => (t === '-' ? '−' : t))
  if (posts && posts.length >= 2) {
    const step = Math.min(86, (2 * R) / Math.max(1, posts.length - 1))
    posts.forEach((label, i) => {
      const x = CX + (i - (posts.length - 1) / 2) * step
      const y = cy + 36
      els.push(<circle key={'post' + i} cx={x} cy={y} r={6} className="ins-jack" />)
      els.push(<circle key={'core' + i} cx={x} cy={y} r={2.2} className="ins-pivot" />)
      els.push(<text key={'pl' + i} x={x} y={y - 12} textAnchor="middle" className="ins-num">{label}</text>)
    })
  }
  return { h: posts && posts.length >= 2 ? cy + 72 : cy + 54, els: face(cy, R, symbol, els), reading }
}

function ohmmeter(v: number, mid: number, mult: number, accent: string): Drawn {
  const R = 150
  const cy = 210
  const els: ReactNode[] = []
  const frac = (r: number) => mid / (mid + r)
  const marks = [0, 1, 2, 3, 4, 5, 10, 15, 20, 30, 40, 50, 100, 200, 500, 1000].map((x) => (x * mid) / 15)
  for (const r of marks) {
    const a = dialAngle(frac(r))
    const [xa, ya] = polar(cy, a, R)
    const [xb, yb] = polar(cy, a, R - 11)
    const [xl, yl] = polar(cy, a, R + 14)
    els.push(<line key={'t' + r} x1={xa} y1={ya} x2={xb} y2={yb} className="ins-tick" />)
    // Labels crowd toward ∞; keep only the ones with room to breathe.
    if (![3, 4, 40].includes((r * 15) / mid) && frac(r) >= 0.06) els.push(<text key={'l' + r} x={xl} y={yl + 4} textAnchor="middle" className="ins-num">{formatTick(r)}</text>)
  }
  for (const u of [0.5, 1.5, 2.5, 3.5, 4.5, 6, 7, 8, 9, 12.5, 17.5, 25, 35, 45, 75]) {
    const r = (u * mid) / 15
    const a = dialAngle(frac(r))
    const [xa, ya] = polar(cy, a, R)
    const [xb, yb] = polar(cy, a, R - 5)
    els.push(<line key={'m' + r} x1={xa} y1={ya} x2={xb} y2={yb} className="ins-tick" />)
  }
  const [xi, yi] = polar(cy, dialAngle(0), R + 14)
  els.push(<text key="inf" x={xi} y={yi + 4} textAnchor="middle" className="ins-num">∞</text>)
  const shown = v / mult
  els.push(...needle(cy, R, frac(Math.max(0, shown)), accent))
  els.push(<text key="mult" x={CX + R + 36} y={cy + 30} textAnchor="end" className="ins-caption">{`倍率 ×${formatTick(mult, { bare: true })}`}</text>)
  const sig = shown >= 10 ? 0 : 1
  const read = fix(shown, sig)
  const reading = `指针示数 ${read} × 倍率 ${formatTick(mult, { bare: true })} = ${Number((Number(read) * mult).toPrecision(6))} Ω（欧姆表刻度不均匀，中值电阻 ${formatTick(mid * mult)} Ω）`
  return { h: cy + 54, els: face(cy, R, 'Ω', els), reading }
}

function resistanceBox(v: number, decades: number[], accent: string): Drawn {
  const read = decadeReading(v, decades)
  const gap = Math.min(150, (W - 60) / decades.length)
  const x0 = W / 2 - (gap * (decades.length - 1)) / 2
  const cy = 86
  const els: ReactNode[] = [<rect key="box" x={x0 - gap / 2 + 4} y={14} width={gap * decades.length - 8} height={148} rx={8} className="ins-body" />]
  decades.forEach((d, i) => {
    const cx = x0 + i * gap
    const dg = read.digits[i] ?? 0
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI / 2 + (k * 2 * Math.PI) / 10
      const hot = k === dg
      els.push(<text key={`d${i}-${k}`} x={cx + Math.cos(a) * 44} y={cy + Math.sin(a) * 44 + 4} textAnchor="middle" className={hot ? 'ins-num hot' : 'ins-num'} fill={hot ? accent : undefined}>{k}</text>)
    }
    const a = -Math.PI / 2 + (dg * 2 * Math.PI) / 10
    els.push(<circle key={'k' + i} cx={cx} cy={cy} r={28} className="ins-knob" />)
    els.push(<line key={'p' + i} x1={cx + Math.cos(a) * 8} y1={cy + Math.sin(a) * 8} x2={cx + Math.cos(a) * 26} y2={cy + Math.sin(a) * 26} stroke={accent} strokeWidth={3} strokeLinecap="round" />)
    els.push(<circle key={'c' + i} cx={cx} cy={cy} r={4} className="ins-pivot" />)
    els.push(<text key={'x' + i} x={cx} y={cy + 66} textAnchor="middle" className="ins-caption">{`×${formatTick(d, { bare: true })}`}</text>)
  })
  return { h: 176, els, reading: read.line }
}

/** Eyepiece (real double-slit pattern, crosshair fixed) beside the hand-wheel drum. The drum reuses the micrometer scale. */
function measurementHead(v: number, props: Props, scope: Scope, accent: string, uid: string): Drawn {
  const micro = micrometer(v, accent)
  const result = measurementOf({ ...props, value: v }, scope)
  const eyeR = 88
  const cx = eyeR + 28
  const cy = eyeR + 20
  const drumY = cy - 100
  const drumX = cx + eyeR + 36
  const capY = cy + eyeR + 18
  const w = drumX + (micro.w ?? 360) + 8
  const h = Math.max(drumY + micro.h + 4, capY + 8)
  const els: ReactNode[] = []
  els.push(<circle key="bezel" cx={cx} cy={cy} r={eyeR + 11} className="ins-body" />)
  els.push(<circle key="well" cx={cx} cy={cy} r={eyeR} fill="#07080c" />)
  const spec = result.spec
  const half = spec ? eyepieceHalfMm(spec) : 2
  if (spec && Number.isFinite(result.xScreen)) {
    const n = 168
    const strips: ReactNode[] = []
    for (let i = 0; i < n; i++) {
      const x = result.xScreen + ((i + 0.5) / n - 0.5) * 2 * half
      const c = fringeRGB(spec, x, 0)
      const px = cx - eyeR + (i * 2 * eyeR) / n
      strips.push(<rect key={i} x={px} y={cy - eyeR} width={(2 * eyeR) / n + 0.55} height={2 * eyeR} fill={`rgb(${c.r},${c.g},${c.b})`} />)
    }
    els.push(
      <defs key="defs">
        <clipPath id={`mh-${uid}`}>
          <circle cx={cx} cy={cy} r={eyeR - 0.6} />
        </clipPath>
      </defs>,
    )
    els.push(
      <g key="pattern" clipPath={`url(#mh-${uid})`}>
        {strips}
      </g>,
    )
  }
  els.push(<line key="hair-halo" x1={cx} x2={cx} y1={cy - eyeR + 6} y2={cy + eyeR - 6} stroke="#07080c" strokeWidth={2} />)
  els.push(<line key="hair" x1={cx} x2={cx} y1={cy - eyeR + 6} y2={cy + eyeR - 6} stroke="#f6f6f4" strokeWidth={1} />)
  els.push(<line key="serL" x1={cx - 11} x2={cx - 3} y1={cy} y2={cy} stroke="#f6f6f4" strokeWidth={1} />)
  els.push(<line key="serR" x1={cx + 3} x2={cx + 11} y1={cy} y2={cy} stroke="#f6f6f4" strokeWidth={1} />)
  els.push(
    <text key="eye" x={cx} y={capY} textAnchor="middle" className="ins-caption">
      目镜 · 分划板
    </text>,
  )
  els.push(
    <text key="wheel" x={drumX + (micro.w ?? 360) - 122} y={drumY + 46} textAnchor="middle" className="ins-caption">
      手轮
    </text>,
  )
  els.push(
    <g key="drum" transform={`translate(${drumX}, ${drumY})`}>
      {micro.els}
    </g>,
  )
  return { h, w, els, reading: micro.reading, extra: result.lines }
}

/** Clockwise degrees from straight up → SVG coordinates (y down). */
function knobAt(cx: number, cy: number, deg: number, r: number): [number, number] {
  const a = (deg * Math.PI) / 180
  return [cx + Math.sin(a) * r, cy - Math.cos(a) * r]
}

function sectorPath(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): string {
  const [x0, y0] = knobAt(cx, cy, a0, r1)
  const [x1, y1] = knobAt(cx, cy, a1, r1)
  const [x2, y2] = knobAt(cx, cy, a1, r0)
  const [x3, y3] = knobAt(cx, cy, a0, r0)
  const large = a1 - a0 > 180 ? 1 : 0
  return `M${x0},${y0} A${r1},${r1} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${large} 0 ${x3},${y3} Z`
}

function multimeterDrawn(value: number, mode: string, range: number, mid: number, accent: string): Drawn {
  const reading = readMultimeter({ mode, range, value, mid })
  // Wide 120° window: one Ω arc, one DC arc, three number rows inside it, AC arc innermost.
  const FX = 328
  const FY = 348
  const A0 = (150 * Math.PI) / 180
  const A1 = (30 * Math.PI) / 180
  const Rohm = 300
  const Rnum = 318
  const Rdc = 274
  const rows = [
    { max: 250 as const, r: 244, size: 11 },
    { max: 50 as const, r: 216, size: 9.5 },
    { max: 10 as const, r: 190, size: 8.5 },
  ]
  const Rac = 164
  const RacNum = 146
  const at = (a: number, r: number) => [FX + Math.cos(a) * r, FY - Math.sin(a) * r] as const
  const ang = (f: number) => A0 + (A1 - A0) * Math.min(1.04, Math.max(-0.02, f))
  const arcPath = (r: number) => {
    const [x0, y0] = at(A0, r)
    const [x1, y1] = at(A1, r)
    return `M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`
  }
  const els: ReactNode[] = []
  els.push(<rect key="body" x={16} y={8} width={624} height={600} rx={12} className="ins-body" />)
  els.push(<rect key="window" x={36} y={18} width={584} height={352} rx={8} className="ins-sector" />)
  els.push(<line key="split" x1={32} x2={624} y1={388} y2={388} className="ins-tick faint" />)
  const arcId = activeArc(mode, range)
  const ac10 = mode === 'acv' && Math.abs(range - 10) < 1e-9
  const ohmOn = mode === 'ohm'
  els.push(<path key="ohm" d={arcPath(Rohm)} className="ins-arc" />)
  els.push(<path key="dc" d={arcPath(Rdc)} className="ins-arc" />)
  els.push(<path key="ac" d={arcPath(Rac)} className={ac10 ? 'ins-arc' : 'ins-tick faint'} fill="none" />)
  let lastLabel = -1
  const mids = mid > 0 ? mid : 15
  for (const t of ohmTicks(mids)) {
    const f = ohmFraction(t.value, mids)
    const a = ang(f)
    const [x0, y0] = at(a, Rohm)
    const [x1, y1] = at(a, Rohm - (t.major ? 9 : 5))
    els.push(<line key={'ot' + t.value} x1={x0} y1={y0} x2={x1} y2={y1} className="ins-tick" />)
    if (t.major && f > 0.045 && (lastLabel < 0 || Math.abs(f - lastLabel) > 0.04)) {
      lastLabel = f
      const [xl, yl] = at(a, Rnum)
      els.push(<text key={'ol' + t.value} x={xl} y={yl + 3} textAnchor="middle" className={ohmOn ? 'ins-num' : 'ins-num faint'}>{formatTick(t.value)}</text>)
    }
  }
  const [xi, yi] = at(ang(0), Rnum)
  els.push(<text key="inf" x={xi} y={yi + 3} textAnchor="middle" className={ohmOn ? 'ins-num' : 'ins-num faint'}>∞</text>)
  for (let i = 0; i <= 50; i++) {
    const a = ang(i / 50)
    const major = i % 10 === 0
    const [x0, y0] = at(a, Rdc)
    const [x1, y1] = at(a, Rdc - (major ? 8 : 4))
    els.push(<line key={'dt' + i} x1={x0} y1={y0} x2={x1} y2={y1} className="ins-tick" />)
    const [ax, ay] = at(a, Rac)
    const [bx, by] = at(a, Rac - (major ? 6 : 3))
    els.push(<line key={'ct' + i} x1={ax} y1={ay} x2={bx} y2={by} className={ac10 ? 'ins-tick' : 'ins-tick faint'} />)
  }
  for (const row of rows) {
    const on = !ac10 && arcId === row.max
    for (let i = 0; i <= 50; i += 10) {
      const [xl, yl] = at(ang(i / 50), row.r)
      els.push(
        <text key={'r' + row.max + i} x={xl} y={yl + 3} textAnchor="middle" className={on ? 'ins-num' : 'ins-num faint'} style={{ fontSize: row.size, fontWeight: on ? 700 : 500 }}>
          {formatTick((row.max * i) / 50)}
        </text>,
      )
    }
  }
  for (let i = 0; i <= 50; i += 10) {
    const [xl, yl] = at(ang(i / 50), RacNum)
    els.push(
      <text key={'acl' + i} x={xl} y={yl + 3} textAnchor="middle" className={ac10 ? 'ins-num' : 'ins-num faint'} style={{ fontSize: 8, fontWeight: ac10 ? 700 : 500 }}>
        {formatTick(i / 5)}
      </text>,
    )
  }
  const sym = mode === 'ohm' ? 'Ω' : mode === 'dcma' ? 'mA' : mode === 'off' ? 'OFF' : mode === 'acv' ? 'V∼' : 'V'
  els.push(<text key="sym" x={FX} y={FY - 36} textAnchor="middle" className="ins-symbol" style={{ fontSize: 18 }}>{sym}</text>)
  els.push(<circle key="mz" cx={FX - 118} cy={FY - 4} r={6.5} className="ins-screw" />)
  els.push(<line key="mzs" x1={FX - 122.5} y1={FY - 4} x2={FX - 113.5} y2={FY - 4} className="ins-tick" />)
  els.push(<text key="mzc" x={FX - 118} y={FY + 16} textAnchor="middle" className="ins-caption">调零</text>)
  const frac = mode === 'off' || !reading.ok ? 0 : mode === 'ohm' ? reading.fraction : Math.min(1.04, Math.max(0, reading.fraction))
  const [nx, ny] = at(ang(frac), Rohm + 8)
  els.push(<line key="needle" x1={FX} y1={FY} x2={nx} y2={ny} stroke={accent} strokeWidth={2} strokeLinecap="round" />)
  els.push(<circle key="pivot" cx={FX} cy={FY} r={5} className="ins-pivot" />)
  const KX = 168
  const KY = 502
  for (const g of selectorGroups()) {
    const on = g.mode === mode
    els.push(<path key={'sec' + g.mode} d={sectorPath(KX, KY, 36, 66, g.from, g.to)} className={on ? 'ins-sector on' : 'ins-sector'} />)
    const [lx, ly] = knobAt(KX, KY, (g.from + g.to) / 2, 80)
    els.push(<text key={'gl' + g.mode} x={lx} y={ly + 3} textAnchor="middle" className={on ? 'ins-num' : 'ins-num faint'} style={{ fontSize: 11 }}>{g.label}</text>)
  }
  for (const s of selectorSlots()) {
    const on = s.mode === mode && (mode === 'off' || Math.abs(s.range - range) < 1e-9)
    const [lx, ly] = knobAt(KX, KY, s.angle, 51)
    els.push(<text key={'sl' + s.mode + s.range} x={lx} y={ly + 3} textAnchor="middle" className={on ? 'ins-num' : 'ins-num faint'} style={{ fontSize: 8 }}>{s.label}</text>)
  }
  els.push(<circle key="kcore" cx={KX} cy={KY} r={26} className="ins-knob-core" />)
  const aim = selectorAngleOf(mode, range)
  if (aim !== null) {
    const [px, py] = knobAt(KX, KY, aim, 24)
    els.push(<line key="kptr" x1={KX} y1={KY} x2={px} y2={py} className="ins-knob-ptr" />)
  }
  els.push(<circle key="kdot" cx={KX} cy={KY} r={3.2} className="ins-knob-dot" />)
  els.push(<circle key="oz" cx={392} cy={KY} r={15} className="ins-knob" />)
  els.push(<line key="ozp" x1={392} y1={KY} x2={392} y2={KY - 11} stroke={accent} strokeWidth={2} strokeLinecap="round" />)
  els.push(<text key="ozl" x={392} y={KY + 32} textAnchor="middle" className="ins-caption">Ω 调零</text>)
  for (const [x, lab, plus] of [[508, '+', true], [596, '−', false]] as const) {
    els.push(<circle key={'j' + lab} cx={x} cy={KY} r={13} className={plus ? 'ins-jack plus' : 'ins-jack'} />)
    els.push(<text key={'jt' + lab} x={x} y={KY + 4} textAnchor="middle" className="ins-jack-label">{lab}</text>)
    els.push(<text key={'jc' + lab} x={x} y={KY + 30} textAnchor="middle" className="ins-caption">{plus ? '正' : 'COM'}</text>)
  }
  return { h: 616, w: 656, els, reading: reading.line, extra: reading.hint ? [reading.hint] : undefined }
}

function selectorAngleOf(mode: string, range: number): number | null {
  if (mode === 'off') return selectorSlots().find((s) => s.mode === 'off')?.angle ?? null
  return selectorSlots().find((s) => s.mode === mode && Math.abs(s.range - range) < 1e-9)?.angle ?? null
}

/** Local +y runs from the ring toward the hook. `angle` is that direction, degrees from +x, counterclockwise. */
function springScaleDrawn(value: number, max: number, divisions: number, angle: number, accent: string): Drawn {
  const read = readSpringScale(value, Number.isFinite(max) ? max : 5, divisions)
  const full = Number.isFinite(max) && max > 0 ? max : 5
  const n = divisions > 1 ? Math.round(divisions) : full <= 5 ? Math.round(full / 0.1) : Math.round(full / 0.2)
  const per = full / n
  const majorEvery = Math.max(1, Math.round(1 / per))
  const bodyTop = 26
  const bodyBot = 208
  const slot0 = 44
  const slot1 = 186
  const th = (angle * Math.PI) / 180
  const raw = (lx: number, ly: number): [number, number] => [-lx * Math.sin(th) + ly * Math.cos(th), -lx * Math.cos(th) - ly * Math.sin(th)]
  const samples: [number, number][] = []
  for (const lx of [-40, 64]) for (const ly of [-18, bodyBot + 46]) samples.push(raw(lx, ly))
  const minX = Math.min(...samples.map((p) => p[0]))
  const minY = Math.min(...samples.map((p) => p[1]))
  const maxX = Math.max(...samples.map((p) => p[0]))
  const maxY = Math.max(...samples.map((p) => p[1]))
  const map = (lx: number, ly: number): [number, number] => [raw(lx, ly)[0] - minX + 14, raw(lx, ly)[1] - minY + 14]
  const w = maxX - minX + 28
  const h = maxY - minY + 28
  const poly = (pts: [number, number][]) => pts.map(([x, y]) => map(x, y).join(',')).join(' ')
  const els: ReactNode[] = []
  const [rx, ry] = map(0, 0)
  els.push(<circle key="ring" cx={rx} cy={ry} r={11} className="ins-screw" />)
  els.push(<circle key="hole" cx={rx} cy={ry} r={4.5} className="ins-body" />)
  els.push(<polygon key="case" points={poly([[-26, bodyTop], [26, bodyTop], [26, bodyBot], [-26, bodyBot]])} className="ins-body" />)
  els.push(<polygon key="slot" points={poly([[-9, slot0], [9, slot0], [9, slot1], [-9, slot1]])} className="ins-sector" />)
  const py = slot0 + (slot1 - slot0) * read.fraction
  const coils: [number, number][] = [[0, bodyTop + 6]]
  const span = Math.max(16, py - (bodyTop + 10))
  const turns = 9
  for (let i = 0; i < turns; i++) {
    const y = bodyTop + 8 + (span * (i + 0.5)) / turns
    coils.push([(i % 2 ? 7 : -7), y])
  }
  coils.push([0, py - 2])
  els.push(<polyline key="spring" points={coils.map(([x, y]) => map(x, y).join(',')).join(' ')} className="ins-arc" />)
  for (let i = 0; i <= n; i++) {
    const y = slot0 + ((slot1 - slot0) * i) / n
    const major = i % majorEvery === 0
    const mid = !major && majorEvery % 2 === 0 && i % (majorEvery / 2) === 0
    const [x0, y0] = map(-9, y)
    const [x1, y1] = map(-9 + (major ? 12 : mid ? 8 : 5), y)
    els.push(<line key={'tk' + i} x1={x0} y1={y0} x2={x1} y2={y1} className="ins-tick" />)
    if (major) {
      const [xl, yl] = map(16, y)
      const shown = (full * i) / n
      els.push(<text key={'tn' + i} x={xl} y={yl + 3} textAnchor="start" className="ins-num">{formatTick(shown)}</text>)
    }
  }
  const [p0x, p0y] = map(-30, py)
  const [p1x, p1y] = map(14, py)
  els.push(<line key="ptr" x1={p0x} y1={p0y} x2={p1x} y2={p1y} stroke={accent} strokeWidth={2} strokeLinecap="round" />)
  const hookY = bodyBot + 8 + 22 * read.fraction
  const [h0x, h0y] = map(0, bodyBot)
  const [h1x, h1y] = map(0, hookY)
  els.push(<line key="rod" x1={h0x} y1={h0y} x2={h1x} y2={h1y} className="ins-tick" strokeWidth={2} />)
  const [hx, hy] = map(0, hookY + 12)
  els.push(<circle key="hook" cx={hx} cy={hy} r={9} className="ins-screw" />)
  els.push(<text key="unit" x={map(0, bodyTop + 14)[0]} y={map(0, bodyTop + 14)[1]} textAnchor="middle" className="ins-caption">N</text>)
  return { h, w, els, reading: read.line }
}

function draw(type: InstrumentType, props: Props, scope: Scope, theme: ThemeName, uid = ''): Drawn {
  const v = num(props.value, scope)
  const accent = colorOf(typeof props.color === 'string' ? props.color : 'velocity', theme)
  switch (type) {
    case 'vernier':
      return vernier(v, [10, 20, 50].includes(Number(props.divisions)) ? Number(props.divisions) : 20, String(props.unit ?? 'mm'), accent)
    case 'micrometer':
      return micrometer(v, accent)
    case 'meter': {
      const scales = (Array.isArray(props.scales) ? props.scales : [props.range ?? 3]).map((s) => num(s, scope)).filter((s) => s > 0)
      const range = props.range !== undefined ? num(props.range, scope) : scales[0]
      const divisions = typeof props.divisions === 'number' ? props.divisions : 30
      const major = typeof props.major === 'number' ? props.major : 3
      const unit = String(props.unit ?? 'A')
      const terminals = Array.isArray(props.terminals) ? galvTerminalList(props.terminals) : undefined
      return meter(v, scales.length ? scales : [range], range, divisions, major, String(props.symbol ?? unit), unit, accent, terminals)
    }
    case 'multimeter':
      return multimeterDrawn(v, String(props.mode ?? ''), props.range !== undefined ? num(props.range, scope) : NaN, props.mid !== undefined ? num(props.mid, scope) : 15, accent)
    case 'springScale':
      return springScaleDrawn(v, props.max !== undefined ? num(props.max, scope) : NaN, typeof props.divisions === 'number' ? props.divisions : 0, props.angle !== undefined ? num(props.angle, scope) : -90, accent)
    case 'ohmmeter':
      return ohmmeter(v, props.mid !== undefined ? num(props.mid, scope) : 15, props.multiplier !== undefined ? num(props.multiplier, scope) : 1, accent)
    case 'resistanceBox': {
      const decades = Array.isArray(props.decades) ? props.decades.map(Number).filter((d) => d > 0) : [1000, 100, 10, 1]
      return resistanceBox(v, decades.length ? decades : [1000, 100, 10, 1], accent)
    }
    case 'measurementHead':
      return measurementHead(v, props, scope, accent, uid)
  }
}

/** `<Instrument type="vernier" value="L" />`: scale drawn from the value plus the worked reading. */
export function Instrument({ props }: { props: Props }) {
  const theme = useTheme()
  const uid = useId().replace(/:/g, '')
  const scope = useScopeFor(namesIn([props.value, props.range, props.scales, props.mid, props.multiplier, props.fringes, props.pair, props.max, props.angle]))
  const type = (INSTRUMENT_TYPES as readonly string[]).includes(String(props.type)) ? (props.type as InstrumentType) : 'vernier'
  const d = draw(type, props, scope, theme, uid)
  const showReading = props.reading !== false
  const cid = useCraftId()
  const k = craftTokens(theme)
  const night = theme === 'night'
  // Instrument parts keep their class names; this scoped sheet gives them the B+ materials.
  const sheet = `
#${cid} .ins-body{fill:url(#${cid}-face);stroke:${k.soft.color};stroke-width:${k.soft.width}}
#${cid} .ins-slider,#${cid} .ins-thimble{fill:url(#${cid}-m-alu);stroke:${k.strong.color};stroke-width:${k.strong.width}}
#${cid} .ins-knob,#${cid} .ins-knob-core{fill:url(#${cid}-s-dark);stroke:${k.strong.color};stroke-width:${k.strong.width}}
#${cid} .ins-screw{fill:url(#${cid}-s-steelHi);stroke:${k.strong.color};stroke-width:${k.strong.width}}
#${cid} .ins-jack{fill:url(#${cid}-s-dark);stroke:${k.strong.color};stroke-width:1}
#${cid} .ins-jack.plus{stroke:var(--c-force);stroke-width:1.6}
#${cid} .ins-jack-label{fill:${night ? '#E2E7EE' : '#F3F5F7'}}
#${cid} .ins-knob-ptr{stroke:${night ? '#E2E7EE' : '#F3F5F7'}}
#${cid} .ins-knob-dot{fill:${night ? '#E2E7EE' : '#F3F5F7'}}`

  return (
    <figure className="sim still instrument">
      <div className="stage">
        <StageHead props={props} />
        <svg id={cid} viewBox={`0 0 ${d.w ?? W} ${d.h}`} width="100%" style={{ maxWidth: (d.w ?? W) * 1.15 }} role="img" aria-label={String(props.title ?? '仪器读数')}>
          <CraftDefs id={cid} theme={theme} />
          <defs>
            <linearGradient id={`${cid}-face`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={night ? '#2A2D33' : '#FFFFFF'} />
              <stop offset="1" stopColor={night ? '#1E2025' : '#EEF0F3'} />
            </linearGradient>
          </defs>
          <style>{sheet}</style>
          {d.els}
        </svg>
        {(showReading || typeof props.note === 'string') && (
          <div className="stage-note instrument-reading">
            {showReading && <span className="num">{d.reading}</span>}
            {showReading && d.extra?.map((line, i) => <span className="num" key={i}>{line}</span>)}
            {typeof props.note === 'string' && <Rich text={props.note} html />}
          </div>
        )}
      </div>
    </figure>
  )
}
