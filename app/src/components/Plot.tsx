import { useId, useMemo } from 'react'
import { evaluateIn, num, type Scope } from '../lesson/expr'
import { leastSquares } from '../lesson/fit'
import { markSeries } from '../lesson/marks'
import type { Props } from '../lesson/parse'
import { namesIn, useScopeFor, useStore, valueKey } from '../lesson/store'
import { colorOf, SERIES_ORDER, useTheme } from '../theme'
import { formatNumber } from './controls'
import { Rich } from './rich'
import { formatTicks, niceTicks, placeLabels, type Box } from './layout'
import { Legend } from './Sim'

interface Axis {
  name?: string
  label?: string
  unit?: string
  min?: number | string
  max?: number | string
}

interface Series {
  label: string
  expr?: string
  /** Measured points in place of expr. Each entry is [x, y], a number or an expression. */
  points?: (readonly [number | string, number | string])[]
  marker?: 'dot' | 'cross'
  /** Polyline through the measured points. The fit, if any, is a separate straight line. */
  line?: boolean
  fit?: 'linear' | 'proportional'
  read?: { slope?: string; intercept?: string }
  color?: string
  dash?: boolean
  /** Abscissa when the curve is parametric. Requires `over`. */
  x?: string
  /** Sample this curve as (x(s), expr(s)) for s from min to max. `name` is local to the curve. */
  over?: { name: string; min: number | string; max: number | string }
  /** Slider (or other name) marking one point on an `over` curve. */
  point?: string
}

interface Mark {
  x: number | string
  y?: number | string
  series?: number
  label: string
}

interface Area {
  /** Series index whose curve bounds the area from above (or one side). */
  series: number
  /** Other boundary: another series index, or omit for the y = 0 axis. */
  to?: number
  from: number | string
  until: number | string
  label?: string
  color?: string
}

const W = 640
const H = 300
const M = { left: 48, right: 18, top: 18, bottom: 34 }
const N = 240

type Pt = readonly [number, number]

export function Plot({ props }: { props: Props }) {
  const theme = useTheme()
  const store = useStore()
  const clipId = 'plotfit' + useId().replace(/:/g, '')
  const xa = (props.x ?? {}) as Axis
  const ya = (props.y ?? {}) as Axis
  const series = (Array.isArray(props.series) ? props.series : []) as Series[]
  const marks = (Array.isArray(props.marks) ? props.marks : []) as Mark[]
  const areas = (Array.isArray(props.areas) ? props.areas : []) as Area[]
  const xName = xa.name ?? 'x'
  const cursorName = typeof props.cursor === 'string' ? props.cursor : null

  // When x is itself a Param (usually the sim clock), each sample recomputes the
  // Defines, so curves may use derived values that depend on it (r(t), Ek(t)…).
  const sweep = store.defs.has(xName)

  // The curves depend on everything they reference except the x variable; the
  // cursor is tracked separately so a moving clock doesn't resample the curves.
  const curveDeps = useMemo(() => {
    let s = namesIn([series.map((ser) => [ser.expr, ser.x, ser.points, ser.over?.min, ser.over?.max]), xa.min, xa.max, ya.min, ya.max, marks.map((m) => [m.x, m.y]), areas.map((a) => [a.from, a.until])])
    for (const ser of series) if (typeof ser.over?.name === 'string') s.delete(ser.over.name)
    if (sweep) s = store.paramRoots(s)
    s.delete(xName)
    return [...s]
  }, [props, sweep]) // eslint-disable-line react-hooks/exhaustive-deps
  const pointNames = series.flatMap((ser) => (typeof ser.point === 'string' ? [ser.point] : []))
  const scope = useScopeFor(cursorName ? [...curveDeps, cursorName, ...pointNames] : [...curveDeps, ...pointNames])
  const curveKey = curveDeps.map((n) => valueKey(scope[n])).join('|')

  const scopeAt = (x: number): Scope => (sweep ? store.scopeWith({ [xName]: x }) : { ...scope, [xName]: x })
  const at = (s: Series, x: number): number => {
    if (!s.expr) return NaN
    try {
      return evaluateIn(s.expr, scopeAt(x))
    } catch {
      return NaN
    }
  }

  const x0 = num(xa.min, scope, 0)
  const x1 = num(xa.max, scope, 1)

  const samples = useMemo(() => {
    const scopes = Array.from({ length: N + 1 }, (_, i) => {
      const x = x0 + ((x1 - x0) * i) / N
      return [x, scopeAt(x)] as const
    })
    return series.map((s) => {
      if (Array.isArray(s.points)) {
        return s.points.map((pair) => {
          if (!Array.isArray(pair) || pair.length < 2) return [NaN, NaN] as Pt
          return [num(pair[0], scope), num(pair[1], scope)] as Pt
        })
      }
      // Parametric curve: s runs over its own interval and both coordinates are expressions.
      // Ordinary curves stay on the shared x samples, so existing lessons are unchanged.
      if (s.over && s.x && s.expr && typeof s.over.name === 'string') {
        const a = num(s.over.min, scope, 0)
        const b = num(s.over.max, scope, 1)
        const local = s.over.name
        const expr = s.expr
        const xExpr = s.x
        return Array.from({ length: N + 1 }, (_, i) => {
          const t = a + ((b - a) * i) / N
          const sc: Scope = { ...scope, [local]: t }
          try {
            return [evaluateIn(xExpr, sc), evaluateIn(expr, sc)] as Pt
          } catch {
            return [NaN, NaN] as Pt
          }
        })
      }
      return scopes.map(([x, sc]) => {
        let y: number
        try {
          y = s.expr ? evaluateIn(s.expr, sc) : NaN
        } catch {
          y = NaN
        }
        return [x, y] as Pt
      })
    })
  }, [curveKey, props]) // eslint-disable-line react-hooks/exhaustive-deps

  const fits = series.map((s, i) => {
    if ((s.fit !== 'linear' && s.fit !== 'proportional') || !s.points) return null
    return leastSquares(samples[i], s.fit)
  })

  const finiteYs = samples.flat().map((p) => p[1]).filter(Number.isFinite)
  for (const f of fits) {
    if (!f || !Number.isFinite(f.slope)) continue
    finiteYs.push(f.intercept + f.slope * x0, f.intercept + f.slope * x1)
  }
  let y0 = num(ya.min, scope, NaN)
  let y1 = num(ya.max, scope, NaN)
  if (!Number.isFinite(y0)) y0 = Math.min(0, ...finiteYs)
  if (!Number.isFinite(y1)) {
    // The span comes from the data, so 2×10⁻⁵ N/m fills the plot instead of hugging a 0–1 axis.
    const top = Math.max(0, ...finiteYs)
    const span = top > y0 ? top - y0 : 1
    y1 = y0 + span * 1.12
  }

  const pw = W - M.left - M.right
  const ph = H - M.top - M.bottom
  const sx = (x: number) => M.left + ((x - x0) / (x1 - x0)) * pw
  const sy = (y: number) => M.top + (1 - (y - y0) / (y1 - y0)) * ph

  // A step (e.g. velocity reversing in a collision) shows up as one sample-to-sample
  // change far larger than its neighbours; lift the pen there and draw a dashed riser.
  const isJump = (pts: readonly Pt[], i: number) => {
    if (i === 0) return false
    const dy = (k: number) => (k > 0 && k < pts.length ? Math.abs(pts[k][1] - pts[k - 1][1]) : 0)
    const here = dy(i)
    const around = Math.max(dy(i - 1), dy(i + 1))
    return here > 0.12 * (y1 - y0) && here > 6 * around
  }

  const risers: { x: number; ya: number; yb: number; si: number }[] = []
  const paths = samples.map((pts, si) => {
    const measured = Array.isArray(series[si]?.points)
    if (measured && series[si].line !== true) return ''
    let d = ''
    let pen = false
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = pts[i]
      if (!Number.isFinite(y) || y < y0 - (y1 - y0) || y > y1 + (y1 - y0)) {
        pen = false
        continue
      }
      if (!measured && isJump(pts, i)) {
        risers.push({ x, ya: pts[i - 1][1], yb: y, si })
        pen = false
      }
      d += `${pen ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`
      pen = true
    }
    return d
  })

  const colorAt = (i: number) => colorOf(series[i]?.color ?? SERIES_ORDER[i % SERIES_ORDER.length], theme)

  /** Height of series `si` above `x`. A parametric curve has no formula in x, so it is read off its samples. */
  const yOn = (si: number, x: number): number => {
    const s = series[si]
    if (!s) return NaN
    if (!s.over || !s.x) return at(s, x)
    const pts = samples[si] ?? []
    for (let i = 1; i < pts.length; i++) {
      const [xa, ya] = pts[i - 1]
      const [xb, yb] = pts[i]
      if (![xa, ya, xb, yb].every(Number.isFinite)) continue
      const tol = Math.abs(xb - xa) * 1e-6
      if (x < Math.min(xa, xb) - tol || x > Math.max(xa, xb) + tol) continue
      return xb === xa ? ya : ya + ((yb - ya) * (x - xa)) / (xb - xa)
    }
    return NaN
  }

  const areaShapes = areas.map((a) => {
    const from = num(a.from, scope)
    const until = num(a.until, scope)
    const top = series[a.series]
    const other = a.to !== undefined ? series[a.to] : undefined
    if (!top || !Number.isFinite(from) || !Number.isFinite(until) || until <= from) return null
    const k = 60
    const upper: Pt[] = []
    const lower: Pt[] = []
    for (let i = 0; i <= k; i++) {
      const x = from + ((until - from) * i) / k
      upper.push([x, yOn(a.series, x)])
      lower.push([x, other && a.to !== undefined ? yOn(a.to, x) : 0])
    }
    const pts = [...upper, ...lower.reverse()].filter((p) => Number.isFinite(p[1]))
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join('') + 'Z'
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length
    return { d, color: colorOf(a.color ?? top.color ?? 'velocity', theme), label: a.label, cx: sx(cx), cy: sy(cy) }
  })

  const markPoints = marks.map((m) => {
    const mx = num(m.x, scope)
    const si = m.series ?? markSeries(String(m.label ?? ''), series.map((s) => String(s.label ?? ''))) ?? 0
    const my = m.y !== undefined ? num(m.y, scope) : yOn(si, mx)
    return { ...m, mx, my, si }
  })

  const obstacles: Box[] = []
  samples.forEach((pts) => {
    for (let i = 0; i < pts.length; i += 3) {
      const [x, y] = pts[i]
      if (Number.isFinite(y)) obstacles.push({ x: sx(x) - 1.5, y: sy(y) - 1.5, w: 3, h: 3 })
    }
  })
  markPoints.forEach((m) => obstacles.push({ x: sx(m.mx) - 5, y: sy(m.my) - 5, w: 10, h: 10 }))
  areaShapes.forEach((a) => a?.label && obstacles.push({ x: a.cx - 24, y: a.cy - 8, w: 48, h: 16 }))

  const labels = placeLabels(
    markPoints
      .filter((m) => Number.isFinite(m.mx) && Number.isFinite(m.my) && m.label)
      .map((m) => ({ ax: sx(m.mx), ay: sy(m.my), text: m.label, fontSize: 11.5 })),
    { x: M.left + 2, y: M.top, w: pw - 4, h: ph },
    obstacles,
  )

  const keyXs = markPoints.map((m) => m.mx).filter((x) => Number.isFinite(x) && x > x0 && x < x1).sort((a, b) => a - b)
  const xTicks = keyXs.length ? [x0, ...keyXs] : niceTicks(x0, x1, 7)
  const yTicks = niceTicks(y0, y1, 4)
  const cursor = cursorName ? scope[cursorName] : NaN
  const showCursor = Number.isFinite(cursor) && cursor >= x0 && cursor <= x1
  const zeroY = sy(Math.max(y0, Math.min(0, y1)))
  const xLabels = formatTicks(xTicks)
  const yLabels = formatTicks(yTicks)
  const xUnitText = `${xa.label ?? xName}${xa.unit ? ' / ' + xa.unit : ''}`
  // The x unit sits at the right end of the tick row (10.5px mono; CJK glyphs are full width), so a tick under it is dropped.
  const textWidth = (s: string) => [...s].reduce((w, ch) => w + (ch.charCodeAt(0) > 0x2e80 ? 10.5 : 6.3), 0)
  const unitLeft = W - M.right - textWidth(xUnitText) - 6
  const yUnitText = ya.unit ? `${ya.label ?? ''} / ${ya.unit}` : (ya.label ?? '')
  // The y unit sits just above the top-left corner, so a tick label at the very top would print over it; its grid line stays.
  const shownYTicks = yTicks
    .map((t, i) => ({ t, label: yLabels[i] }))
    .filter(({ t, label }) => !(yUnitText && sy(t) - M.top < 12 && 4 + textWidth(yUnitText) > M.left - 8 - textWidth(label)))
  // Two marks close together (0.6 and 0.681) would print on top of each other; the later label is dropped, its drop line stays.
  const shownXTicks: { t: number; label: string }[] = []
  let lastRight = -Infinity
  xTicks.forEach((t, i) => {
    const half = textWidth(xLabels[i]) / 2
    if (i > 0 && (sx(t) + half >= unitLeft || sx(t) - half < lastRight + 4)) return
    shownXTicks.push({ t, label: xLabels[i] })
    lastRight = sx(t) + half
  })

  return (
    <figure className="card plot">
      <header className="card-head">
        <div className="card-title">
          {typeof props.title === 'string' && <Rich text={props.title} html />}
          {typeof props.caption === 'string' && (
            <span className="card-caption">
              <Rich text={props.caption} html />
            </span>
          )}
        </div>
        <Legend items={series.map((s, i) => ({ kind: (s.color ?? SERIES_ORDER[i % SERIES_ORDER.length]) + (s.dash ? '-dash' : ''), label: s.label }))} />
      </header>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={String(props.title ?? '函数图像')}>
        <rect className="plot-panel" x={M.left - 4} y={M.top - 6} width={pw + 8} height={ph + 10} rx={6} />
        <g className="grid">
          {yTicks.map((t) => (
            <line key={`gy${t}`} x1={M.left} x2={W - M.right} y1={sy(t)} y2={sy(t)} />
          ))}
        </g>
        {areaShapes.map((a, i) =>
          a ? (
            <g key={`a${i}`} className="area">
              <path d={a.d} fill={a.color} fillOpacity={theme === 'night' ? 0.16 : 0.1} stroke="none" />
              {a.label && (
                <text x={a.cx} y={a.cy + 4} textAnchor="middle" className="area-label" fill={a.color}>
                  <Rich text={a.label} />
                </text>
              )}
            </g>
          ) : null,
        )}
        <g className="axis">
          <line x1={M.left} x2={W - M.right} y1={zeroY} y2={zeroY} />
          {shownXTicks.map(({ t, label }, i) => (
            <text key={`tx${i}`} x={sx(t)} y={M.top + ph + 18} textAnchor="middle" className={showCursor && Math.abs(t - cursor) < (x1 - x0) / 300 ? 'tick-active' : ''}>
              {label}
            </text>
          ))}
          {shownYTicks.map(({ t, label }) => (
            <text key={`ty${t}`} x={M.left - 8} y={sy(t) + 4} textAnchor="end">
              {label}
            </text>
          ))}
          <text x={W - M.right} y={M.top + ph + 18} textAnchor="end" className="axis-unit">
            <Rich text={xUnitText} />
          </text>
          <text x={4} y={M.top - 6} textAnchor="start" className="axis-unit">
            <Rich text={yUnitText} />
          </text>
        </g>
        {markPoints.map((m, i) =>
          Number.isFinite(m.my) && Number.isFinite(m.mx) ? (
            <line key={`d${i}`} x1={sx(m.mx)} x2={sx(m.mx)} y1={sy(m.my)} y2={M.top + ph} className="mark-drop" />
          ) : null,
        )}
        {risers.map((r, i) => (
          <line key={`r${i}`} x1={sx(r.x)} x2={sx(r.x)} y1={sy(r.ya)} y2={sy(r.yb)} stroke={colorAt(r.si)} strokeDasharray="3 3" strokeWidth={1.4} opacity={0.8} />
        ))}
        {paths.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={colorAt(i)} strokeWidth={2} strokeDasharray={series[i].dash ? '5 4' : undefined} strokeLinejoin="round" strokeLinecap="round" />
        ))}
        <defs>
          <clipPath id={clipId}>
            <rect x={M.left} y={M.top} width={pw} height={ph} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          {fits.map((f, i) => {
            if (!f || !Number.isFinite(f.slope)) return null
            return (
              <line
                key={`fit${i}`}
                x1={sx(x0)}
                y1={sy(f.intercept + f.slope * x0)}
                x2={sx(x1)}
                y2={sy(f.intercept + f.slope * x1)}
                stroke={colorAt(i)}
                strokeWidth={1.75}
              />
            )
          })}
          {series.map((s, i) => {
            if (!Array.isArray(s.points)) return null
            return samples[i].map(([x, y], j) => {
              if (!Number.isFinite(x) || !Number.isFinite(y)) return null
              if (s.marker === 'cross') {
                return (
                  <g key={`p${i}-${j}`} stroke={colorAt(i)} strokeWidth={1.6} strokeLinecap="round">
                    <line x1={sx(x) - 4} y1={sy(y) - 4} x2={sx(x) + 4} y2={sy(y) + 4} />
                    <line x1={sx(x) - 4} y1={sy(y) + 4} x2={sx(x) + 4} y2={sy(y) - 4} />
                  </g>
                )
              }
              return <circle key={`p${i}-${j}`} cx={sx(x)} cy={sy(y)} r={4.2} className="mark-dot" stroke={colorAt(i)} />
            })
          })}
        </g>
        {markPoints.map((m, i) =>
          Number.isFinite(m.my) && Number.isFinite(m.mx) ? (
            <circle key={`m${i}`} cx={sx(m.mx)} cy={sy(m.my)} r={4} className="mark-dot" stroke={colorAt(m.si)} />
          ) : null,
        )}
        {series.map((s, i) => {
          if (!s.over || !s.x || !s.expr || typeof s.point !== 'string' || typeof s.over.name !== 'string') return null
          const t = scope[s.point]
          if (typeof t !== 'number' || !Number.isFinite(t)) return null
          const sc: Scope = { ...scope, [s.over.name]: t }
          let x = NaN
          let y = NaN
          try {
            x = evaluateIn(s.x, sc)
            y = evaluateIn(s.expr, sc)
          } catch {
            return null
          }
          if (!Number.isFinite(x) || !Number.isFinite(y)) return null
          return <circle key={`pt${i}`} cx={sx(x)} cy={sy(y)} r={5} className="mark-dot" stroke={colorAt(i)} />
        })}
        {labels.map((l, i) => (
          <g key={`l${i}`} className="mark-label">
            <rect x={l.x} y={l.y} width={l.w} height={l.h} rx={4} />
            <text x={l.x + 4} y={l.y + l.h - 5}>
              <Rich text={l.text} />
            </text>
          </g>
        ))}
        {showCursor && (
          <g className="cursor">
            <line x1={sx(cursor)} x2={sx(cursor)} y1={M.top} y2={M.top + ph} />
            {series.map((s, i) => {
              if (s.over || s.points) return null
              const y = at(s, cursor)
              return Number.isFinite(y) && y >= y0 && y <= y1 ? (
                <g key={i}>
                  <circle cx={sx(cursor)} cy={sy(y)} r={4.5} fill={colorAt(i)} className="cursor-dot" />
                </g>
              ) : null
            })}
          </g>
        )}
      </svg>
      {showCursor && props.values !== false && (
        <div className="plot-values">
          {series.map((s, i) =>
            s.over || s.points ? null : (
            <span key={i}>
              <i style={{ background: colorAt(i) }} />
              <Rich text={s.label} html />
              <b className="num">
                {formatNumber(at(s, cursor))}
                {ya.unit ? ` ${ya.unit}` : ''}
              </b>
            </span>
            ),
          )}
        </div>
      )}
    </figure>
  )
}
