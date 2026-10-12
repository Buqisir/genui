import { useId, type ReactNode } from 'react'
import { num, type Scope } from '../lesson/expr'
import type { Props } from '../lesson/parse'
import { orbitRows, outsideCaption, placeSpectrum, wavelengthNm, VISIBLE_NM } from '../lesson/spectrum'
import { namesIn, useScopeFor } from '../lesson/store'
import { colorOf, useTheme } from '../theme'
import { Rich } from './rich'
import { StageHead } from './Sim'

// Energy-level diagram (氢原子能级图 and friends): levels on a compressed but
// monotonic scale, transition arrows, an optional work-function threshold, and a
// worked readout for the selected transition.

interface LevelSpec {
  n?: number | string
  E: number | string
  label?: string
}

interface TransitionSpec {
  from: number | string
  to: number | string
  label?: string
}

interface Level {
  key: string
  label: string
  E: number
  inf: boolean
}

interface Transition {
  from: Level
  to: Level
  label?: string
  dE: number
}

const W = 640
const TOP = 46
const MIN_GAP = 18
const X_LINE0 = 132
const X_LINE1 = 468
const HC_EV_NM = 1240

const SUB = '₀₁₂₃₄₅₆₇₈₉'
const sub = (s: string) => (/^\d+$/.test(s) ? [...s].map((d) => SUB[Number(d)]).join('') : s === '∞' ? '∞' : s)

/**
 * Textbook-style energy value: at most two decimals, trailing zeros dropped, real minus sign.
 * Below 0.1 (levels near the ionization limit) it keeps two significant figures so 0.028 does not become 0.03.
 */
const ev = (x: number) => {
  if (!Number.isFinite(x)) return '—'
  const a = Math.abs(x)
  const d = a > 0 && a < 0.1 ? Math.min(8, 1 - Math.floor(Math.log10(a))) : 2
  const r = Number((Math.round(a * 10 ** d * (1 + 1e-12)) / 10 ** d).toFixed(d))
  return x < 0 && r !== 0 ? `−${r}` : String(r)
}

const normKey = (k: unknown) => {
  const s = String(k).trim()
  return /^(∞|inf|infinity|Infinity)$/.test(s) ? '∞' : s
}

export function hydrogenLevels(count: number): LevelSpec[] {
  const n = Math.max(2, Math.min(8, Math.round(count)))
  return [...Array.from({ length: n }, (_, i) => ({ n: i + 1, E: -13.6 / (i + 1) ** 2 })), { n: '∞', E: 0 }]
}

function readLevels(props: Props, scope: Scope): Level[] {
  const specs = Array.isArray(props.levels) ? (props.levels as LevelSpec[]) : hydrogenLevels(num(props.count, scope, 6))
  return specs
    .map((l, i) => {
      const key = normKey(l.n ?? i + 1)
      return { key, label: l.label ?? `n=${key}`, E: num(l.E, scope, NaN), inf: key === '∞' }
    })
    .filter((l) => Number.isFinite(l.E))
    .sort((a, b) => a.E - b.E)
}

function readTransitions(props: Props, scope: Scope, levels: Level[]): Transition[] {
  const byKey = new Map(levels.map((l) => [l.key, l]))
  let specs: TransitionSpec[] = Array.isArray(props.transitions) ? (props.transitions as TransitionSpec[]) : []
  const allFrom = num(props.allFrom, scope, NaN)
  if (!specs.length && Number.isFinite(allFrom)) {
    // Every downward jump a group of atoms starting at n = allFrom can make.
    const pool = levels.filter((l) => !l.inf && Number(l.key) <= allFrom).sort((a, b) => b.E - a.E)
    for (let i = 0; i < pool.length; i++) for (let j = i + 1; j < pool.length; j++) specs.push({ from: pool[i].key, to: pool[j].key })
  }
  specs = specs.slice(0, 16)
  return specs.flatMap((t) => {
    const from = byKey.get(normKey(t.from))
    const to = byKey.get(normKey(t.to))
    return from && to && from !== to ? [{ from, to, label: t.label, dE: to.E - from.E }] : []
  })
}

// Textbook range for visible photons (人教版选择性必修三): 1.62–3.11 eV.
export const VISIBLE_EV: [number, number] = [1.62, 3.11]
const isVisible = (dE: number) => {
  const d = Math.abs(dE)
  return d >= VISIBLE_EV[0] - 1e-9 && d <= VISIBLE_EV[1] + 1e-9
}

function spectrum(nm: number): string {
  if (nm < HC_EV_NM / VISIBLE_EV[1]) return '紫外'
  if (nm > HC_EV_NM / VISIBLE_EV[0]) return '红外'
  const name = nm >= 620 ? '红光' : nm >= 590 ? '橙光' : nm >= 570 ? '黄光' : nm >= 495 ? '绿光' : nm >= 450 ? '蓝光' : '紫光'
  return `可见光 · ${name}`
}

/** Approximate display colour of a visible wavelength (nm). */
export function spectralColor(nm: number): string {
  const w = Math.min(760, Math.max(400, nm))
  let r = 0
  let g = 0
  let b = 0
  if (w < 440) [r, g, b] = [(440 - w) / 40, 0, 1]
  else if (w < 490) [r, g, b] = [0, (w - 440) / 50, 1]
  else if (w < 510) [r, g, b] = [0, 1, (510 - w) / 20]
  else if (w < 580) [r, g, b] = [(w - 510) / 70, 1, 0]
  else if (w < 645) [r, g, b] = [1, (645 - w) / 65, 0]
  else [r, g, b] = [1, 0, 0]
  const k = w < 420 ? 0.55 + (0.45 * (w - 400)) / 20 : w > 700 ? 0.55 + (0.45 * (760 - w)) / 60 : 1
  const c = (x: number) => Math.round(255 * (x * k) ** 0.8)
  return `rgb(${c(r)},${c(g)},${c(b)})`
}

/** A short wavy arrow from (x1, y1) to (x2, y2), stopping short so the head can sit on the end. */
function wavyPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const px = -uy
  const py = ux
  const n = Math.max(8, Math.round(len / 5))
  let d = ''
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const env = Math.sin(Math.PI * t)
    const w = Math.sin(t * Math.PI * 5) * 3.2 * env
    d += `${i ? 'L' : 'M'}${(x1 + ux * t * len + px * w).toFixed(1)},${(y1 + uy * t * len + py * w).toFixed(1)}`
  }
  return d
}

export function EnergyLevels({ props }: { props: Props }) {
  const theme = useTheme()
  const gid = useId().replace(/:/g, '')
  const scope = useScopeFor(namesIn([props.levels, props.transitions, props.select, props.workFunction, props.allFrom, props.count, props.spectrum]))
  const unit = typeof props.unit === 'string' ? props.unit : 'eV'
  const levels = readLevels(props, scope)
  const trans = readTransitions(props, scope, levels)
  const sel = Math.round(num(props.select, scope, -1))
  const picked = sel >= 0 && sel < trans.length ? trans[sel] : null
  const W0 = num(props.workFunction, scope, NaN)
  const hasW = Number.isFinite(W0) && W0 > 0
  const accent = colorOf('charge', theme)
  const graphite = colorOf('graphite', theme)
  const steel = colorOf('steel', theme)
  const showVisible = props.visible === true && unit === 'eV'

  // Compressed scale: every gap keeps MIN_GAP, the rest of the height is shared in
  // proportion to the energy differences, so crowded upper levels stay readable.
  const legendRows = (hasW ? 1 : 0) + (showVisible ? 1 : 0)
  const H = 370 + legendRows * 26 + (legendRows === 2 ? 4 : 0)
  const bottom = H - 34 - legendRows * 26 - (legendRows === 2 ? 4 : 0)
  const avail = bottom - TOP
  const gaps = levels.slice(1).map((l, i) => l.E - levels[i].E)
  const minGap = Math.min(MIN_GAP, avail / Math.max(1, gaps.length))
  const sumGap = gaps.reduce((s, g) => s + g, 0) || 1
  const free = Math.max(0, avail - minGap * gaps.length)
  const ys: number[] = [bottom]
  gaps.forEach((g, i) => ys.push(ys[i] - minGap - (free * g) / sumGap))
  const yOf = new Map(levels.map((l, i) => [l, ys[i]]))

  const els: ReactNode[] = []
  els.push(
    <text key="hn" x={X_LINE0 - 12} y={TOP - 22} textAnchor="end" className="el-head">n</text>,
    <text key="he" x={X_LINE1 + 12} y={TOP - 22} className="el-head">{`E/${unit}`}</text>,
  )
  levels.forEach((l) => {
    const y = yOf.get(l)!
    els.push(
      <line key={'l' + l.key} x1={X_LINE0} x2={X_LINE1} y1={y} y2={y} className={l.inf ? 'el-level el-inf' : 'el-level'} />,
      <text key={'n' + l.key} x={X_LINE0 - 12} y={y + 4} textAnchor="end" className="el-n">
        <Rich text={l.label.replace(/^n=/, '')} />
      </text>,
      <text key={'e' + l.key} x={X_LINE1 + 12} y={y + 4} className="el-e">{ev(l.E)}</text>,
    )
  })

  const n = trans.length
  const span = X_LINE1 - X_LINE0 - 80
  const step = n > 1 ? Math.min(44, span / (n - 1)) : 0
  const x0 = (X_LINE0 + X_LINE1) / 2 - (step * (n - 1)) / 2
  // With a spectrum strip the line names sit on the wavelength axis, so the arrows stay clear for ΔE.
  const spectrumOn =
    unit === 'eV' &&
    (props.spectrum === true || props.absorption === true || (!!props.spectrum && typeof props.spectrum === 'object' && !Array.isArray(props.spectrum)))
  trans.forEach((t, i) => {
    const x = x0 + i * step
    const y1 = yOf.get(t.from)!
    const y2 = yOf.get(t.to)!
    const isSel = t === picked
    const ok = !hasW || Math.abs(t.dE) >= W0 - 1e-9
    // With a work function the colour/dash encode "can eject" (see the legend), so a
    // selected transition keeps that encoding and is only drawn heavier.
    const color = hasW ? (ok ? accent : isSel ? graphite : steel) : isSel ? accent : graphite
    const dir = Math.sign(y2 - y1)
    const head = 8
    els.push(
      <g key={'t' + i} className={isSel ? 'el-arrow selected' : 'el-arrow'} opacity={picked && !isSel ? 0.55 : 1}>
        <circle cx={x} cy={y1} r={2.4} fill={color} />
        <line
          x1={x}
          y1={y1}
          x2={x}
          y2={y2 - dir * head}
          stroke={color}
          strokeWidth={isSel ? 2.6 : 1.6}
          strokeDasharray={hasW && !ok ? (isSel ? '6 4' : '4 3') : undefined}
          strokeLinecap="round"
        />
        <polygon points={`${x},${y2} ${x - head * 0.45},${y2 - dir * head} ${x + head * 0.45},${y2 - dir * head}`} fill={color} />
      </g>,
    )
    if (showVisible && t.dE < 0 && isVisible(t.dE)) {
      // Emitted visible photon: a short wavy line in its spectral colour.
      const c = spectralColor(HC_EV_NM / Math.abs(t.dE))
      const ym = (y1 + y2) / 2
      const d = Array.from({ length: 17 }, (_, j) => `${j ? 'L' : 'M'}${(x - 4 - j).toFixed(1)},${(ym + 3.2 * Math.sin(j * 0.9)).toFixed(1)}`).join('')
      els.push(
        <g key={'ph' + i} className="el-photon" opacity={picked && !isSel ? 0.55 : 1}>
          <path d={d} fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" />
          <circle cx={x - 21} cy={ym + 3.2 * Math.sin(16 * 0.9)} r={2} fill={c} />
        </g>,
      )
    }
    if (t.label && !spectrumOn) {
      els.push(
        <text key={'tl' + i} x={x + 7} y={(y1 + y2) / 2 + 4} className="el-tlabel" fill={color}>
          <Rich text={t.label} />
        </text>,
      )
    }
    if (isSel) {
      els.push(
        <text key="delta" x={x + 7} y={(y1 + y2) / 2 + (t.label && !spectrumOn ? 18 : 4)} className="el-delta" fill={color}>
          {`${ev(Math.abs(t.dE))} ${unit}`}
        </text>,
      )
    }
  })

  if (showVisible) {
    const ly = H - 26 - (hasW ? 30 : 0)
    const stops = [400, 450, 500, 550, 600, 650, 700, 760]
    els.push(
      <defs key="vis-def">
        <linearGradient id="el-visible" x1="0" x2="1" y1="0" y2="0">
          {stops.map((nm, j) => (
            <stop key={nm} offset={j / (stops.length - 1)} stopColor={spectralColor(nm)} />
          ))}
        </linearGradient>
      </defs>,
      <rect key="vis-bar" x={X_LINE0} y={ly - 3} width={26} height={6} rx={3} fill="url(#el-visible)" />,
      <text key="vis-t" x={X_LINE0 + 34} y={ly + 4} className="el-legend">{`辐射可见光：${VISIBLE_EV[0]} eV ≤ ΔE ≤ ${VISIBLE_EV[1]} eV（波浪线颜色 = 光的颜色）`}</text>,
    )
  }

  if (hasW) {
    const ly = H - 26
    els.push(
      <line key="lg1" x1={X_LINE0} x2={X_LINE0 + 26} y1={ly} y2={ly} stroke={accent} strokeWidth={2} />,
      <text key="lg1t" x={X_LINE0 + 34} y={ly + 4} className="el-legend">{`ΔE ≥ W₀ = ${ev(W0)} ${unit}，能发生光电效应`}</text>,
      <line key="lg2" x1={X_LINE0 + 250} x2={X_LINE0 + 276} y1={ly} y2={ly} stroke={steel} strokeWidth={1.6} strokeDasharray="4 3" />,
      <text key="lg2t" x={X_LINE0 + 284} y={ly + 4} className="el-legend">不能</text>,
    )
  }

  // Spectrum strip and Bohr orbits are extra panels. Absent props leave the level diagram untouched.
  const specRaw = props.spectrum
  const specObj = specRaw && typeof specRaw === 'object' && !Array.isArray(specRaw) ? (specRaw as { from?: unknown; to?: unknown }) : null
  const axis =
    (specRaw === true || specObj !== null || props.absorption === true) && unit === 'eV'
      ? (() => {
          const from = num(specObj?.from, scope, VISIBLE_NM[0])
          const to = num(specObj?.to, scope, VISIBLE_NM[1])
          return to > from + 1 ? { from, to } : { from: VISIBLE_NM[0], to: VISIBLE_NM[1] }
        })()
      : null
  const absorption = props.absorption === true && axis !== null
  const orbitLevels =
    props.orbits === true
      ? levels.flatMap((l) => {
          const n = Number(l.key)
          return Number.isInteger(n) && n > 0 && !l.inf ? [{ n, E: l.E }] : []
        })
      : []
  const rows = orbitRows(orbitLevels)
  const SPEC_H = axis ? 132 : 0
  const ORBIT_CX = 800
  const ORBIT_CY = 168
  const outerR = rows.reduce((m, r) => Math.max(m, r.rho), 0)
  const orbitBottom = rows.length ? ORBIT_CY + outerR + 34 + (rows.length + 2) * 15 + 28 : 0
  const frameW = rows.length ? 980 : W
  const frameH = Math.max(H + SPEC_H, orbitBottom, H)

  if (axis) {
    const x0 = X_LINE0
    const x1 = X_LINE1
    const span = x1 - x0
    const xOf = (nm: number) => x0 + ((nm - axis.from) / (axis.to - axis.from)) * span
    const axisY = H + 82
    const inputs = trans.flatMap((t, i) =>
      Math.abs(t.dE) > 0 && Number.isFinite(t.dE) ? [{ index: i, label: t.label || `${t.from.key}→${t.to.key}`, nm: wavelengthNm(t.dE) }] : [],
    )
    const placed = placeSpectrum(inputs, axis)
    const caption = outsideCaption(placed.outside)
    const visL = Math.max(axis.from, VISIBLE_NM[0])
    const visR = Math.min(axis.to, VISIBLE_NM[1])
    if (absorption && visR > visL) {
      const stops = [400, 440, 480, 520, 560, 600, 640, 680, 720, 760]
      els.push(
        <defs key="spec-def">
          <linearGradient id={`el-spec-${gid}`} x1="0" x2="1" y1="0" y2="0">
            {stops.map((nm, j) => (
              <stop key={nm} offset={j / (stops.length - 1)} stopColor={spectralColor(nm)} />
            ))}
          </linearGradient>
        </defs>,
      )
      if (axis.from < visL - 1) els.push(<rect key="uv-band" x={x0} y={axisY - 16} width={Math.max(0, xOf(visL) - x0)} height={14} fill={steel} opacity={0.35} />)
      els.push(<rect key="vis-band" x={xOf(visL)} y={axisY - 16} width={Math.max(1, xOf(visR) - xOf(visL))} height={14} fill={`url(#el-spec-${gid})`} />)
      if (axis.to > visR + 1) els.push(<rect key="ir-band" x={xOf(visR)} y={axisY - 16} width={Math.max(0, x1 - xOf(visR))} height={14} fill={steel} opacity={0.35} />)
    }
    els.push(<line key="axis" x1={x0} x2={x1} y1={axisY} y2={axisY} className="el-level" />)
    const ticks = [axis.from, axis.to]
    for (const edge of VISIBLE_NM) if (edge > axis.from + 20 && edge < axis.to - 20) ticks.push(edge)
    ticks.forEach((nm) => {
      const x = xOf(nm)
      els.push(
        <line key={'tk' + nm} x1={x} x2={x} y1={axisY} y2={axisY + 5} className="el-level" />,
        <text key={'tn' + nm} x={x} y={axisY + 18} textAnchor="middle" className="el-legend">{Math.round(nm)}</text>,
      )
    })
    els.push(<text key="axis-unit" x={x1 + 8} y={axisY + 4} className="el-legend">nm</text>)
    if (axis.from < VISIBLE_NM[0] - 8) {
      els.push(<text key="reg-uv" x={(x0 + xOf(Math.min(VISIBLE_NM[0], axis.to))) / 2} y={axisY - 20} textAnchor="middle" className="el-legend">紫外</text>)
    }
    if (axis.to > VISIBLE_NM[1] + 8) {
      els.push(<text key="reg-ir" x={(x1 + xOf(Math.max(VISIBLE_NM[1], axis.from))) / 2} y={axisY - 20} textAnchor="middle" className="el-legend">红外</text>)
    }
    const rowEnds = [-1e9, -1e9, -1e9, -1e9]
    placed.inside.forEach((line) => {
      const x = xOf(line.nm)
      let row = rowEnds.findIndex((end) => x - end > 42)
      if (row < 0) row = rowEnds.indexOf(Math.min(...rowEnds))
      rowEnds[row] = x
      const isSel = !!picked && line.index === sel
      const color = absorption ? '#141414' : line.region === '可见' ? spectralColor(line.nm) : steel
      els.push(
        <line key={'sp' + line.index} x1={x} x2={x} y1={axisY - (absorption ? 18 : 36)} y2={axisY - (absorption ? 2 : 0)} stroke={color} strokeWidth={isSel ? 3.2 : 1.8} />,
        <text key={'sl' + line.index} x={x} y={axisY - 50 - row * 24} textAnchor="middle" className={isSel ? 'el-delta' : 'el-legend'} fill={isSel ? accent : undefined}>
          <Rich text={line.label} />
        </text>,
      )
      if (isSel) els.push(<polygon key="sp-mark" points={`${x},${axisY + 7} ${x - 4},${axisY + 13} ${x + 4},${axisY + 13}`} fill={accent} />)
    })
    if (caption) els.push(<text key="spec-out" x={x0} y={axisY + 36} className="el-legend">{caption}</text>)
  }

  if (rows.length) {
    const ink = 'var(--c-ink)'
    const initN = picked && Number.isInteger(Number(picked.from.key)) ? Number(picked.from.key) : rows[0].n
    const finalN = picked && Number.isInteger(Number(picked.to.key)) ? Number(picked.to.key) : NaN
    const ang = -0.85
    els.push(
      <text key="orb-title" x={ORBIT_CX} y={30} textAnchor="middle" className="el-head">玻尔轨道</text>,
      <circle key="nucleus" cx={ORBIT_CX} cy={ORBIT_CY} r={5} fill={ink} />,
    )
    rows.forEach((row) => {
      const hot = row.n === initN || row.n === finalN
      els.push(
        <circle key={'orb' + row.n} cx={ORBIT_CX} cy={ORBIT_CY} r={row.rho} fill="none" stroke={hot ? accent : ink} strokeWidth={hot ? 1.8 : 1.15} />,
      )
    })
    const init = rows.find((r) => r.n === initN) ?? rows[0]
    const ex = ORBIT_CX + init.rho * Math.cos(ang)
    const ey = ORBIT_CY + init.rho * Math.sin(ang)
    els.push(<circle key="electron" cx={ex} cy={ey} r={4.5} fill={accent} stroke={ink} strokeWidth={1} />)
    if (picked) {
      const dest = rows.find((r) => r.n === finalN)
      const rho2 = dest ? dest.rho : init.rho + 34
      const x2 = ORBIT_CX + rho2 * Math.cos(ang)
      const y2 = ORBIT_CY + rho2 * Math.sin(ang)
      const nm = wavelengthNm(picked.dE)
      const vis = nm >= VISIBLE_NM[0] && nm <= VISIBLE_NM[1]
      const color = vis ? spectralColor(nm) : steel
      const shorten = 8
      const len = Math.hypot(x2 - ex, y2 - ey) || 1
      const ux = (x2 - ex) / len
      const uy = (y2 - ey) / len
      const hx = x2 - ux * shorten
      const hy = y2 - uy * shorten
      els.push(
        <path key="photon" d={wavyPath(ex + ux * 8, ey + uy * 8, hx, hy)} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" />,
        <polygon key="photon-head" points={`${x2 - ux * 2},${y2 - uy * 2} ${hx - uy * 3.2},${hy + ux * 3.2} ${hx + uy * 3.2},${hy - ux * 3.2}`} fill={color} />,
        <text key="photon-label" x={ORBIT_CX + (outerR + 20) * Math.cos(ang) - uy * 14} y={ORBIT_CY + (outerR + 20) * Math.sin(ang) + ux * 14} textAnchor="middle" className="el-delta" fill={color}>hν</text>,
      )
    }
    const ty = ORBIT_CY + outerR + 32
    const cols = [ORBIT_CX - 108, ORBIT_CX - 52, ORBIT_CX + 4, ORBIT_CX + 62]
    ;['n', 'r/nm', 'r/r₁', `E/${unit}`].forEach((h, i) => {
      els.push(<text key={'oh' + i} x={cols[i]} y={ty} textAnchor="middle" className="el-head">{h}</text>)
    })
    rows.forEach((row, i) => {
      const y = ty + 16 + i * 15
      const hot = row.n === initN
      const cells = [String(row.n), row.rNm >= 1 ? row.rNm.toFixed(2) : row.rNm.toFixed(3), String(row.ratio), ev(row.E)]
      cells.forEach((cell, j) => {
        els.push(
          <text key={`oc${row.n}-${j}`} x={cols[j]} y={y} textAnchor="middle" className="el-legend" fill={hot ? accent : undefined}>{cell}</text>,
        )
      })
    })
    const foot = ty + 20 + rows.length * 15
    els.push(<text key="orb-note" x={ORBIT_CX} y={foot} textAnchor="middle" className="el-legend">图中半径按 n 压缩，真实 r_n = n² × 0.053 nm</text>)
    if (picked && Number.isInteger(initN) && initN > 0) {
      els.push(
        <text key="orb-ratio" x={ORBIT_CX} y={foot + 16} textAnchor="middle" className="el-delta" fill={accent}>
          {`r${sub(String(initN))}/r₁ = ${initN * initN}，E${sub(String(initN))} = ${ev(init.E)} ${unit}`}
        </text>,
      )
    }
  }

  const lines: string[] = []
  if (picked) {
    const a = picked.from
    const b = picked.to
    const Ea = `E${sub(a.key)}`
    const Eb = `E${sub(b.key)}`
    const d = Math.abs(picked.dE)
    const what = b.inf ? '电离：吸收能量' : picked.dE < 0 ? '辐射光子' : '吸收光子'
    const upper = picked.dE < 0 ? [Ea, a.E] : [Eb, b.E]
    const lower = picked.dE < 0 ? [Eb, b.E] : [Ea, a.E]
    let s = `n=${a.key} → n=${b.key}　${what} hν = ${upper[0]} − ${lower[0]} = ${ev(upper[1] as number)} − (${ev(lower[1] as number)}) = ${ev(d)} ${unit}`
    if (unit === 'eV' && !b.inf && d > 0) {
      const nm = HC_EV_NM / d
      s += `，λ = hc/ΔE ≈ ${nm >= 100 ? Math.round(nm) : nm.toFixed(1)} nm（${spectrum(nm)}）`
    }
    lines.push(s)
    if (hasW && picked.dE < 0) {
      lines.push(d >= W0 ? `ΔE ≥ W₀：能使该金属发生光电效应，光电子最大初动能 Ek = ΔE − W₀ = ${ev(d - W0)} ${unit}` : `ΔE < W₀ = ${ev(W0)} ${unit}：不能使该金属发生光电效应`)
    }
  }
  const allFrom = num(props.allFrom, scope, NaN)
  if (Number.isFinite(allFrom) && !Array.isArray(props.transitions)) {
    let s = `一群处于 n=${allFrom} 的原子向低能级跃迁，最多辐射 C${sub(String(allFrom))}² = ${n} 种频率的光子`
    if (hasW) s += `，其中 ${trans.filter((t) => Math.abs(t.dE) >= W0 - 1e-9).length} 种能使逸出功为 ${ev(W0)} ${unit} 的金属发生光电效应`
    if (showVisible) {
      const vis = trans.filter((t) => t.dE < 0 && isVisible(t.dE))
      s += `；${vis.length} 种是可见光${vis.length ? `（${vis.map((t) => `${t.from.key}→${t.to.key}`).join('、')}）` : ''}`
    }
    lines.push(s)
  }

  return (
    <figure className="sim still energy-levels">
      <div className="stage">
        <StageHead props={props} />
        <svg viewBox={`40 0 ${frameW - 40} ${frameH}`} width="100%" style={{ maxWidth: (frameW - 40) * 1.05 }} role="img" aria-label={String(props.title ?? '能级图')}>
          {els}
        </svg>
        {(lines.length > 0 || typeof props.note === 'string') && (
          <div className="stage-note instrument-reading">
            {lines.map((l, i) => (
              <span key={i} className="num">
                {l}
              </span>
            ))}
            {typeof props.note === 'string' && <Rich text={props.note} html />}
          </div>
        )}
      </div>
    </figure>
  )
}
