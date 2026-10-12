import { useMemo, type ReactNode } from 'react'
import { evaluateIn, num, type Scope } from '../lesson/expr'
import type { Props } from '../lesson/parse'
import { namesIn, useScopeFor } from '../lesson/store'
import { colorOf, useTheme } from '../theme'
import { CraftDefs, SolidRect, useCraftId } from '../craft/svg'
import { formatTick } from './layout'
import { Rich } from './rich'
import { StageHead } from './Sim'

const W = 640
const SUBS = '₀₁₂₃₄₅₆₇₈₉'
const sub = (n: number) => String(n).replace(/\d/g, (d) => SUBS[Number(d)])
const fix = (v: number, d: number) => (Number.isFinite(v) ? v.toFixed(d) : '—')

/**
 * Ticker tape with counting points, a ruler laid along it, the gap between
 * neighbouring points and (optionally) the successive-difference analysis.
 * Positions come from `expr` (in `unit`, a function of t) or a literal list.
 */
export function TickerTape({ props }: { props: Props }) {
  const theme = useTheme()
  const cid = useCraftId()
  const expr = typeof props.expr === 'string' ? props.expr : undefined
  const listed = Array.isArray(props.positions) ? props.positions : undefined
  const deps = useMemo(() => {
    const s = namesIn([expr, listed, props.interval, props.count, props.start])
    s.delete('t')
    return [...s]
  }, [props]) // eslint-disable-line react-hooks/exhaustive-deps
  const scope = useScopeFor(deps)
  const T = num(props.interval, scope, 0.1)
  const count = Math.max(2, Math.min(12, Math.round(num(props.count, scope, 7))))
  const t0 = num(props.start, scope, 0)
  const unit = typeof props.unit === 'string' ? props.unit : 'cm'
  const digits = typeof props.digits === 'number' ? props.digits : 2
  const scratch: Scope = { ...scope }
  const xs = listed
    ? listed.map((p) => num(p, scope))
    : Array.from({ length: count }, (_, i) => {
        scratch.t = t0 + i * T
        try {
          return evaluateIn(expr ?? '0', scratch)
        } catch {
          return NaN
        }
      })
  const ok = xs.length >= 2 && xs.every(Number.isFinite)
  const accent = colorOf(typeof props.color === 'string' ? props.color : 'velocity', theme)
  const names: string[] = Array.isArray(props.labels)
    ? props.labels.map(String)
    : props.labels === 'letters'
      ? xs.map((_, i) => (i === 0 ? 'O' : 'ABCDEFGHIJKL'[i - 1]))
      : xs.map((_, i) => String(i))
  const gaps = xs.slice(1).map((x, i) => x - xs[i])

  const first = ok ? xs[0] : 0
  const span = ok ? Math.max(1e-6, xs[xs.length - 1] - first) : 1
  const k = 540 / span
  const X = (x: number) => 50 + (x - first) * k
  const tapeY = 34
  const tapeH = 46
  const els: ReactNode[] = []
  if (ok) {
    const L = X(first) - 34
    const R = X(xs[xs.length - 1]) + 34
    // Torn ends: zigzag down the right edge, back up the left one.
    const edge = (x: number, dir: number) => Array.from({ length: 7 }, (_, i) => [x + (i % 2 ? dir * 5 : 0), tapeY + (tapeH * i) / 6])
    const pts = [...edge(R, 1), ...edge(L, -1).reverse()]
    els.push(<path key="tape" d={'M' + pts.map(([x, y]) => `${x},${y}`).join(' L') + ' Z'} className="tt-tape" />)
    // The ruler starts at the first counting point, the way the experiment photo is read.
    const rY = 120
    const rulerEnd = Math.ceil(span)
    els.push(<SolidRect key="ruler" id={cid} theme={theme} x={X(first) - 14} y={rY} w={rulerEnd * k + 28} h={34} mat="alu" r={2} band={0} line="strong" />)
    const minorPx = k / 10
    for (let mm = 0; mm <= rulerEnd * 10; mm++) {
      const cm = mm % 10 === 0
      if (!cm && mm % 5 !== 0 && minorPx < 3) continue
      const x = X(first + mm / 10)
      els.push(<line key={'r' + mm} x1={x} x2={x} y1={rY} y2={rY + (cm ? 12 : mm % 5 === 0 ? 8 : 5)} className="ins-tick" />)
      if (cm && (k >= 18 || (mm / 10) % 2 === 0)) els.push(<text key={'rl' + mm} x={x} y={rY + 25} textAnchor="middle" className="ins-num">{mm / 10}</text>)
    }
    els.push(<text key="unit" x={X(first) + rulerEnd * k + 20} y={rY + 25} className="ins-unit">{unit}</text>)
    xs.forEach((x, i) => {
      const cx = X(x)
      els.push(<line key={'g' + i} x1={cx} x2={cx} y1={tapeY + tapeH} y2={rY} className="tt-guide" />)
      els.push(<circle key={'p' + i} cx={cx} cy={tapeY + tapeH / 2} r={3.4} className="tt-dot" />)
      els.push(<text key={'n' + i} x={cx} y={tapeY - 8} textAnchor="middle" className="tt-name">{names[i] ?? ''}</text>)
    })
    const gapY = tapeY + tapeH + 18
    gaps.forEach((_, i) => {
      const a = X(xs[i])
      const b = X(xs[i + 1])
      els.push(<line key={'d' + i} x1={a + 3} x2={b - 3} y1={gapY} y2={gapY} stroke={accent} strokeWidth={1.2} />)
      els.push(<path key={'da' + i} d={`M${a + 3},${gapY} l6,-3 v6 Z M${b - 3},${gapY} l-6,-3 v6 Z`} fill={accent} />)
    })
    // A gap too short for its number still gets one: wide gaps claim the row above the arrows
    // first, a label that would collide drops to the row below, and only then is it left out.
    const rows: [number, number][][] = [[], []]
    const byWidth = gaps.map((_, i) => i).sort((i, j) => gaps[j] - gaps[i])
    for (const i of byWidth) {
      const text = fix(gaps[i], digits)
      const c = (X(xs[i]) + X(xs[i + 1])) / 2
      const half = (text.length * 6.3 + 6) / 2
      const row = [0, 1].find((r) => rows[r].every(([l, h]) => c - half > h || c + half < l))
      if (row === undefined) continue
      rows[row].push([c - half, c + half])
      els.push(<text key={'dl' + i} x={c} y={row ? gapY + 14 : gapY - 5} textAnchor="middle" className="tt-gap" fill={accent}>{text}</text>)
    }
  }

  let analysis: string | null = null
  if (ok && props.analysis !== false && gaps.length >= 2) {
    const diffs = gaps.slice(1).map((g, i) => g - gaps[i])
    const meanDiff = diffs.reduce((s, d) => s + d, 0) / diffs.length
    const used = gaps.length % 2 ? gaps.slice(1) : gaps
    const half = used.length / 2
    const off = gaps.length - used.length
    const sumA = used.slice(0, half).reduce((s, g) => s + g, 0)
    const sumB = used.slice(half).reduce((s, g) => s + g, 0)
    const toM = unit === 'mm' ? 1e-3 : unit === 'm' ? 1 : 1e-2
    const a = ((sumB - sumA) * toM) / (half * half * T * T)
    const idx = (j: number) => 'x' + sub(j + 1 + off)
    const parts = [
      `相邻间距 ${gaps.map((g) => fix(g, digits)).join('、')} ${unit}，相邻差 Δx ≈ ${fix(meanDiff, digits)} ${unit}`,
      `逐差法 a = [(${used.slice(half).map((_, j) => idx(j + half)).join('+')}) − (${used.slice(0, half).map((_, j) => idx(j)).join('+')})] / (${half * half}T²) = ${fix(a, 2)} m/s²`,
    ]
    const vi = typeof props.velocityAt === 'number' ? props.velocityAt : Math.floor(xs.length / 2)
    if (vi >= 1 && vi <= xs.length - 2) {
      const v = ((xs[vi + 1] - xs[vi - 1]) * toM) / (2 * T)
      parts.push(`v${sub(vi)} = (x${sub(vi)}+x${sub(vi + 1)}) / 2T = ${fix(v, 2)} m/s`)
    }
    analysis = parts.join('；')
  }

  return (
    <figure className="sim still ticker-tape">
      <div className="stage">
        <StageHead props={props} />
        {ok ? (
          <svg id={cid} viewBox={`0 0 ${W} 166`} width="100%" style={{ maxWidth: W * 1.15 }} role="img" aria-label={String(props.title ?? '纸带')}>
            <CraftDefs id={cid} theme={theme} />
            {els}
          </svg>
        ) : (
          <div className="block-error">纸带位置无法计算</div>
        )}
        <div className="stage-note instrument-reading">
          <span>{`计数点间隔 T = ${formatTick(T)} s`}</span>
          {analysis && <span className="num">{analysis}</span>}
          {typeof props.note === 'string' && <Rich text={props.note} html />}
        </div>
      </div>
    </figure>
  )
}
