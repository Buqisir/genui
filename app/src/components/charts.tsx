import { useMemo, type ReactNode } from 'react'
import { evaluateIn, num, type Scope } from '../lesson/expr'
import type { Props } from '../lesson/parse'
import { namesIn, useScopeFor, useStore } from '../lesson/store'
import { colorOf, useTheme } from '../theme'
import { formatValue, Sym, Value } from './controls'
import { formatTicks, niceTicks } from './layout'
import { Rich } from './rich'

const str = (v: unknown) => (typeof v === 'string' ? v : undefined)

export function CardHead({ props, right }: { props: Props; right?: ReactNode }) {
  return (
    <header className="card-head">
      <div className="card-title">
        {str(props.title) && <Rich text={str(props.title)!} html />}
        {str(props.caption) && (
          <span className="card-caption">
            <Rich text={str(props.caption)!} html />
          </span>
        )}
      </div>
      {right}
    </header>
  )
}

// ---------------------------------------------------------------- Bars

interface BarAxis {
  name?: string
  label?: string
  unit?: string
  min?: number | string
  max?: number | string
}

interface BarMark {
  x: number | string
  label?: string
  style?: 'solid' | 'outline'
}

/** One bar per integer x: "how many heaters", "which energy level". Click a bar to set the cursor. */
export function Bars({ props }: { props: Props }) {
  const theme = useTheme()
  const store = useStore()
  const xa = (props.x ?? {}) as BarAxis
  const ya = (props.y ?? {}) as BarAxis
  const xName = xa.name ?? 'n'
  const expr = str(props.expr) ?? '0'
  const marks = (Array.isArray(props.marks) ? props.marks : []) as BarMark[]
  const cursorName = str(props.cursor)
  const deps = useMemo(() => {
    const s = namesIn([expr, xa.min, xa.max, ya.min, ya.max, marks.map((m) => m.x)])
    s.delete(xName)
    if (cursorName) s.add(cursorName)
    return [...s]
  }, [props]) // eslint-disable-line react-hooks/exhaustive-deps
  const scope = useScopeFor(deps)

  const lo = Math.round(num(xa.min, scope, 1))
  const hi = Math.round(num(xa.max, scope, 10))
  const xs = Array.from({ length: Math.max(0, hi - lo + 1) }, (_, i) => lo + i)
  const scratch: Scope = { ...scope }
  const ys = xs.map((x) => {
    scratch[xName] = x
    try {
      return evaluateIn(expr, scratch)
    } catch {
      return NaN
    }
  })
  const finite = ys.filter(Number.isFinite)
  const y0 = num(ya.min, scope, Math.min(0, ...finite))
  const y1 = num(ya.max, scope, Math.max(...finite, y0 + 1) * 1.18)

  const W = 640
  const H = 240
  const M = { left: 48, right: 12, top: 26, bottom: 30 }
  const pw = W - M.left - M.right
  const ph = H - M.top - M.bottom
  const band = pw / Math.max(1, xs.length)
  const bw = Math.max(3, Math.min(22, band * 0.62))
  const sx = (x: number) => M.left + (x - lo + 0.5) * band
  const sy = (y: number) => M.top + (1 - (y - y0) / (y1 - y0)) * ph
  const cursor = cursorName ? scope[cursorName] : NaN
  const accent = colorOf(str(props.color) ?? 'charge', theme)
  const ink = colorOf('ink', theme)
  const markAt = (x: number) => marks.find((m) => Math.round(num(m.x, scope)) === x)
  const digits = typeof props.digits === 'number' ? props.digits : undefined
  const canSet = cursorName && store.defs.has(cursorName)

  return (
    <figure className="card bars">
      <CardHead props={props} />
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={str(props.title) ?? '柱状图'}>
        <g className="grid">
          {niceTicks(y0, y1, 4).map((t) => (
            <line key={t} x1={M.left} x2={W - M.right} y1={sy(t)} y2={sy(t)} />
          ))}
        </g>
        <g className="axis">
          {(() => {
            const ticks = niceTicks(y0, y1, 4)
            const labels = formatTicks(ticks)
            return ticks.map((t, i) => (
              <text key={t} x={M.left - 8} y={sy(t) + 4} textAnchor="end">
                {labels[i]}
              </text>
            ))
          })()}
          <text x={4} y={M.top - 10} textAnchor="start" className="axis-unit">
            <Rich text={ya.unit ? `${ya.label ?? ''} / ${ya.unit}` : (ya.label ?? '')} />
          </text>
          <text x={W - M.right} y={H - 6} textAnchor="end" className="axis-unit">
            <Rich text={`${xa.label ?? xName}${xa.unit ? ' / ' + xa.unit : ''}`} />
          </text>
        </g>
        {xs.map((x, i) => {
          const y = ys[i]
          if (!Number.isFinite(y)) return null
          const mk = markAt(x)
          const isCursor = Math.round(cursor) === x
          const top = sy(Math.max(y, y0))
          const base = sy(Math.max(y0, Math.min(0, y1)))
          const fill = isCursor ? accent : mk?.style === 'solid' ? ink : mk?.style === 'outline' ? 'none' : 'var(--c-bar)'
          const stroke = mk?.style === 'outline' && !isCursor ? ink : 'none'
          const showTick = xs.length <= 12 || x === lo || x === hi || mk || isCursor || x % 4 === 0
          return (
            <g
              key={x}
              className={canSet ? 'bar clickable' : 'bar'}
              onClick={canSet ? () => store.set({ [cursorName!]: x }) : undefined}
            >
              <rect x={sx(x) - band / 2} y={M.top} width={band} height={ph} fill="transparent" />
              <rect x={sx(x) - bw / 2} y={top} width={bw} height={Math.max(0, base - top)} rx={2} fill={fill} stroke={stroke} strokeWidth={1.4} strokeDasharray={mk?.style === 'outline' && !isCursor ? '3 2' : undefined} />
              {showTick && (
                <text x={sx(x)} y={H - M.bottom + 16} textAnchor="middle" className={`bar-x ${isCursor ? 'active' : ''}`}>
                  {x}
                </text>
              )}
              {(mk || isCursor) && (
                <text x={sx(x)} y={top - 8} textAnchor="middle" className={`bar-value ${isCursor ? 'active' : ''}`} fill={isCursor ? accent : ink}>
                  {mk?.label ? `${mk.label} ` : ''}
                  {formatValue(y, digits)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

// ---------------------------------------------------------------- Ledger

interface LedgerPart {
  label: string
  symbol?: string
  expr: string
  color?: string
}

interface LedgerRow {
  label: string
  note?: string
  at?: Record<string, number | string>
}

interface LedgerTotal {
  label?: string
  symbol?: string
  expr: string
  unit?: string
}

/**
 * Where the energy (or power) goes, as stacked bars. Each row can be evaluated
 * at a different moment (`at: {t: 0}`), so "start / now / end" read side by side.
 */
export function Ledger({ props }: { props: Props }) {
  const theme = useTheme()
  const store = useStore()
  const parts = (Array.isArray(props.parts) ? props.parts : []) as LedgerPart[]
  const rows = (Array.isArray(props.rows) && props.rows.length ? props.rows : [{ label: '此刻' }]) as LedgerRow[]
  const total = props.total as LedgerTotal | undefined
  const headline = props.headline as (LedgerTotal & { format?: string; digits?: number }) | undefined
  const unit = str(props.unit) ?? total?.unit ?? ''
  const digits = typeof props.digits === 'number' ? props.digits : undefined
  const scope = useScopeFor(namesIn([parts.map((p) => p.expr), total?.expr, headline?.expr, rows.map((r) => r.at)]))

  const evalRow = (row: LedgerRow) => {
    const sc = row.at ? store.scopeWith(Object.fromEntries(Object.entries(row.at).map(([k, v]) => [k, num(v, scope)]))) : scope
    const values = parts.map((p) => num(p.expr, sc))
    const sum = values.reduce((s, v) => s + (Number.isFinite(v) ? Math.max(0, v) : 0), 0)
    const tot = total ? num(total.expr, sc) : sum
    return { values, tot: Number.isFinite(tot) && tot > 0 ? tot : sum }
  }
  const evaluated = rows.map(evalRow)
  // A part that should be exactly zero (KE at rest, heat before sliding) often comes out as
  // 1e-24 J of rounding error; against the largest entry in the ledger that is just 0.
  const scale = Math.max(0, ...evaluated.flatMap(({ values, tot }) => [tot, ...values.map(Math.abs)]).filter(Number.isFinite))
  const settle = (v: number) => (Number.isFinite(v) && Math.abs(v) < scale * 1e-9 ? 0 : v)

  const right = headline ? (
    <span className="ledger-headline">
      <Sym text={headline.symbol} />
      {headline.label && <span>{headline.label}</span>}
      <Value value={store.reading(headline.expr, scope)} unit={headline.unit} digits={headline.digits} format={headline.format} big />
    </span>
  ) : total ? (
    <span className="ledger-total">
      <Sym text={total.symbol} />
      {total.label && <span>{total.label}</span>}
      <span className="hud-eq">=</span>
      <Value value={settle(num(total.expr, scope))} unit={unit} digits={digits} />
    </span>
  ) : null

  return (
    <figure className="card ledger">
      <CardHead props={props} right={right} />
      <div className="ledger-rows">
        {rows.map((row, i) => {
          const { values, tot } = evaluated[i]
          return (
            <div className={`ledger-row ${row.at ? '' : 'live'}`} key={i}>
              <div className="ledger-row-head">
                <span className="ledger-row-label">
                  <Rich text={row.label} html />
                  {row.note && (
                    <span className="ledger-note">
                      <Rich text={row.note} html />
                    </span>
                  )}
                </span>
                <span className="ledger-values">
                  {values.map((v, j) => (
                    <span key={j} className="num" style={{ color: colorOf(parts[j].color ?? 'ink', theme) }}>
                      {formatValue(settle(v), digits)}
                    </span>
                  ))}
                </span>
              </div>
              <div className="ledger-bar">
                {values.map((v, j) => (
                  <span
                    key={j}
                    style={{
                      width: `${(Math.max(0, Number.isFinite(v) ? v : 0) / (tot || 1)) * 100}%`,
                      background: colorOf(parts[j].color ?? 'ink', theme),
                    }}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <footer className="ledger-legend">
        {parts.map((p, j) => (
          <span key={j}>
            <i style={{ background: colorOf(p.color ?? 'ink', theme) }} />
            <Sym text={p.symbol} />
            <Rich text={p.label} html />
          </span>
        ))}
        {unit && <span className="ledger-unit">单位 <Rich text={unit} html /></span>}
      </footer>
    </figure>
  )
}

// ---------------------------------------------------------------- Dial

interface DialArc {
  from: number | string
  to: number | string
  color?: string
  label?: string
}

interface DialFooter {
  label: string
  from: number | string
  to?: number | string
  color?: string
}

const START = (-210 * Math.PI) / 180
const SWEEP = (240 * Math.PI) / 180

/** The one number that matters right now, read like an instrument. */
export function Dial({ props }: { props: Props }) {
  const theme = useTheme()
  const arcs = (Array.isArray(props.arcs) ? props.arcs : []) as DialArc[]
  const footer = (Array.isArray(props.footer) ? props.footer : []) as DialFooter[]
  const scope = useScopeFor(namesIn([props.expr, props.min, props.max, arcs.map((a) => [a.from, a.to]), footer.map((f) => [f.from, f.to])]))
  const min = num(props.min, scope, 0)
  const max = num(props.max, scope, 1)
  const value = num(props.expr, scope)
  const digits = typeof props.digits === 'number' ? props.digits : undefined
  const color = colorOf(str(props.color) ?? 'velocity', theme)
  const ink = colorOf('ink', theme)
  const steel = colorOf('steel', theme)

  const S = 220
  const cx = S / 2
  const cy = S / 2 + 14
  const R = 86
  const angle = (v: number) => START + SWEEP * Math.min(1, Math.max(0, (v - min) / (max - min)))
  const pt = (a: number, r: number) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const
  const arcPath = (a0: number, a1: number, r: number) => {
    const [x0, y0] = pt(a0, r)
    const [x1, y1] = pt(a1, r)
    return `M${x0},${y0} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1}`
  }
  const step = typeof props.step === 'number' ? props.step : niceTicks(min, max, 6)[1] - niceTicks(min, max, 6)[0]
  const ticks = niceTicks(min, max, Math.round((max - min) / step))
  const tickLabels = formatTicks(ticks)
  const needle = angle(Number.isFinite(value) ? value : min)
  const [nx, ny] = pt(needle, R - 18)

  return (
    <figure className="card dial">
      <CardHead props={props} right={str(props.unit) ? <span className="card-unit"><Rich text={str(props.unit)!} html /></span> : undefined} />
      <svg viewBox={`0 0 ${S} ${S - 22}`} width="100%" style={{ maxWidth: 300 }} role="img" aria-label={str(props.title) ?? '表盘'}>
        <path d={arcPath(START, START + SWEEP, R)} fill="none" stroke="var(--c-hairline)" strokeWidth={1.2} />
        {arcs.map((a, i) => {
          const f = num(a.from, scope)
          const t = num(a.to, scope)
          if (!Number.isFinite(f) || !Number.isFinite(t)) return null
          const c = colorOf(a.color ?? 'velocity', theme)
          return <path key={i} d={arcPath(angle(Math.min(f, t)), angle(Math.max(f, t)), R + 6)} fill="none" stroke={c} strokeWidth={5} strokeLinecap="round" opacity={0.85} className="dial-arc" />
        })}
        {ticks.map((t, i) => {
          const a = angle(t)
          const [x0, y0] = pt(a, R - 2)
          const [x1, y1] = pt(a, R - 10)
          const [lx, ly] = pt(a, R - 22)
          return (
            <g key={t}>
              <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={steel} strokeWidth={1.2} />
              <text x={lx} y={ly + 3} textAnchor="middle" className="dial-tick">
                {tickLabels[i]}
              </text>
            </g>
          )
        })}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth={2} strokeLinecap="round" className="dial-needle" />
        <circle cx={cx} cy={cy} r={5} fill="var(--c-card)" stroke={ink} strokeWidth={1.6} />
        <circle cx={cx} cy={cy} r={1.8} fill={ink} />
        <text x={cx} y={cy - 26} textAnchor="middle" className="dial-value">
          {formatValue(value, digits)}
        </text>
        {str(props.symbol) && (
          <text x={cx} y={cy - 8} textAnchor="middle" className="dial-symbol" fill={color}>
            <Rich text={str(props.symbol)!} />
          </text>
        )}
      </svg>
      {footer.length > 0 && (
        <footer className="dial-footer">
          {footer.map((f, i) => {
            const c = colorOf(f.color ?? 'velocity', theme)
            return (
              <span key={i}>
                <span className="dial-footer-label">
                  <Rich text={f.label} html />
                </span>
                <span className="num" style={{ color: c }}>
                  {formatValue(num(f.from, scope), digits)}
                  {f.to !== undefined && <> → {formatValue(num(f.to, scope), digits)}</>}
                </span>
              </span>
            )
          })}
        </footer>
      )}
    </figure>
  )
}
