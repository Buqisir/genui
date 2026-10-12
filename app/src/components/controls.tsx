import { useState, type CSSProperties, type ReactNode } from 'react'
import { num } from '../lesson/expr'
import type { Props } from '../lesson/parse'
import { namesIn, reducedMotion, useScopeFor, useStore } from '../lesson/store'
import { colorOf, useTheme } from '../theme'
import { Rich } from './rich'

const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback)

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const sup = (n: number) => String(n).replace(/./g, (c) => SUP[c] ?? c)

/** Rounds half away from zero on the decimal value; toFixed works on the binary one and prints 0.15 as "0.1". */
function fixed(value: number, digits: number): string {
  const d = Math.max(0, Math.min(12, Math.round(digits)))
  const k = 10 ** d
  return ((Math.sign(value) * Math.round(Math.abs(value) * k * (1 + 1e-12))) / k).toFixed(d)
}

function mantissa(value: number, digits: number): string {
  let exp = Math.floor(Math.log10(Math.abs(value)))
  let m = fixed(value / 10 ** exp, digits)
  if (Math.abs(Number(m)) >= 10) m = fixed(value / 10 ** ++exp, digits)
  return `${m}×10${sup(exp)}`
}

/** About three significant figures, ×10ⁿ outside 0.001–100000; integers below 100000 print whole. */
function significant(value: number): string {
  const a = Math.abs(value)
  if (a === 0) return '0'
  if (Number.isInteger(value) && a < 1e5) return String(value)
  if (a < 1e-3 || a >= 1e5) return mantissa(value, 2)
  const exp = Math.floor(Math.log10(a))
  const d = Math.max(0, 2 - exp)
  const s = fixed(value, d)
  return d > 0 && Math.abs(Number(s)) >= 10 ** (exp + 1) ? fixed(value, d - 1) : s
}

/**
 * `digits` decimals when given, otherwise about three significant figures.
 * A non-zero value never prints as 0: when `digits` would round it away, significant figures take over.
 */
export function formatNumber(value: number, digits?: number): string {
  if (!Number.isFinite(value)) return '—'
  if (digits === undefined) return significant(value)
  const s = fixed(value, digits)
  return value !== 0 && Number(s) === 0 ? significant(value) : s
}

/** `sci` renders 42000 as 4.2×10⁴, the way the textbook writes orbital radii. */
export function formatValue(value: number, digits?: number, format?: string): string {
  if (format === 'sci' && Number.isFinite(value) && value !== 0) return mantissa(value, digits ?? 2)
  if (format === 'percent') return formatNumber(value * 100, digits)
  return formatNumber(value, digits)
}

/** Physical symbol: italic serif, subscripts via `_`. Coloured only for vector kinds. */
export function Sym({ text, color }: { text?: string; color?: string }) {
  const theme = useTheme()
  if (!text) return null
  const style: CSSProperties | undefined = color ? { color: colorOf(color, theme) } : undefined
  return (
    <span className="sym" style={style}>
      <Rich text={text} html />
    </span>
  )
}

export function Value({ value, unit, digits, format, big }: { value: number; unit?: string; digits?: number; format?: string; big?: boolean }) {
  const u = format === 'percent' ? '%' : unit
  return (
    <span className={big ? 'value value-big' : 'value'}>
      <span className="num">{formatValue(value, digits, format)}</span>
      {u && (
        <span className="unit">
          <Rich text={u} html />
        </span>
      )}
    </span>
  )
}

interface Option {
  value: number
  label: string
}

const decimals = (step: number) => Math.max(0, Math.min(4, -Math.floor(Math.log10(step || 1) + 1e-9)))

export function ParamControl({ props }: { props: Props }) {
  const store = useStore()
  const name = str(props.name)
  const scope = useScopeFor([name, ...namesIn([props.min, props.max, props.step])])
  if (props.hidden) return null
  const label = str(props.label, name)
  const unit = str(props.unit)
  const value = scope[name]
  const options = Array.isArray(props.options) ? (props.options as Option[]) : null
  const head = (
    <div className="control-head">
      <label htmlFor={`param-${name}`}>
        <Sym text={str(props.symbol) || undefined} color={str(props.color) || undefined} />
        <span className="control-label">{label}</span>
      </label>
      {!options && (
        <Value value={value} unit={unit} digits={typeof props.digits === 'number' ? props.digits : decimals(num(props.step, scope, 0.01))} format={str(props.format) || undefined} />
      )}
    </div>
  )

  if (options) {
    return (
      <div className="control">
        {head}
        <div className="segmented" role="radiogroup" aria-label={label}>
          {options.map((o) => (
            <button
              key={o.value}
              role="radio"
              aria-checked={value === o.value}
              className={value === o.value ? 'active' : ''}
              onClick={() => store.set({ [name]: o.value })}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const min = num(props.min, scope, 0)
  const max = num(props.max, scope, 1)
  const step = num(props.step, scope, (max - min) / 100)
  const clamp = (v: number) => Math.min(max, Math.max(min, v))

  if (props.control === 'stepper') {
    return (
      <div className="control control-stepper">
        {head}
        <div className="stepper">
          <button aria-label="减少" disabled={value <= min} onClick={() => store.set({ [name]: clamp(value - step) })}>
            −
          </button>
          <input
            id={`param-${name}`}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => store.set({ [name]: Number(e.target.value) })}
            style={{ '--fill': `${((value - min) / (max - min)) * 100}%` } as CSSProperties}
          />
          <button aria-label="增加" disabled={value >= max} onClick={() => store.set({ [name]: clamp(value + step) })}>
            +
          </button>
        </div>
      </div>
    )
  }

  const initial = store.initial[name]
  const pct = (v: number) => `${((v - min) / (max - min)) * 100}%`
  return (
    <div className="control">
      {head}
      <div className="slider">
        <input
          id={`param-${name}`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => store.set({ [name]: Number(e.target.value) })}
          style={{ '--fill': pct(value) } as CSSProperties}
        />
        {Number.isFinite(initial) && Math.abs(initial - value) > step / 2 && (
          <button className="slider-origin" style={{ left: pct(initial) }} onClick={() => store.tween({ [name]: initial })} title="回到题目原值">
            <i />
            <span>题目原值</span>
          </button>
        )}
      </div>
    </div>
  )
}

export function Preset({ props }: { props: Props }) {
  const store = useStore()
  const set = (props.set ?? {}) as Record<string, unknown>
  const scope = useScopeFor(namesIn([Object.keys(set), Object.values(set)]))
  const resolved = Object.fromEntries(Object.entries(set).map(([k, v]) => [k, num(v, scope)]))
  const active = Object.entries(resolved).every(([k, v]) => Math.abs(scope[k] - v) < 1e-6 * Math.max(1, Math.abs(v)))
  return (
    <button className={`preset ${active ? 'active' : ''}`} aria-pressed={active} onClick={() => store.tween(resolved)}>
      <Rich text={str(props.label, '跳转')} html />
    </button>
  )
}

interface ReadoutItem {
  label: string
  expr: string
  unit?: string
  digits?: number
  symbol?: string
  color?: string
  format?: string
}

export function Readout({ props }: { props: Props }) {
  const items = (Array.isArray(props.items) ? props.items : []) as ReadoutItem[]
  const store = useStore()
  const scope = useScopeFor(namesIn(items.map((i) => i.expr)))
  return (
    <div className="readout">
      {items.map((it, i) => (
        <div className="metric" key={i}>
          <span className="metric-label">
            <Sym text={it.symbol} color={it.color} />
            <Rich text={it.label} html />
          </span>
          <Value value={store.reading(it.expr, scope)} unit={it.unit} digits={it.digits} format={it.format} big />
        </div>
      ))}
    </div>
  )
}

interface StatusCase {
  when?: string
  label: string
  tone?: string
}

export function Status({ props }: { props: Props }) {
  const cases = (Array.isArray(props.cases) ? props.cases : []) as StatusCase[]
  const scope = useScopeFor(namesIn(cases.map((c) => c.when ?? '')))
  const hit = cases.find((c) => !c.when || num(c.when, scope, 0) !== 0)
  if (!hit) return null
  return (
    <span className={`status tone-${hit.tone ?? 'neutral'}`}>
      <i />
      <Rich text={hit.label} html />
    </span>
  )
}

/** Questions share one "which is in focus" state, kept per lesson by the layout. */
export function QuestionList({ items }: { items: Props[] }) {
  const store = useStore()
  const [active, setActive] = useState(0)
  return (
    <ol className="questions">
      {items.map((q, i) => (
        <li key={i} className={i === active ? 'active' : ''}>
          <button
            onClick={() => {
              setActive(i)
              const set = q.set as Record<string, unknown> | undefined
              if (set) store.tween(Object.fromEntries(Object.entries(set).map(([k, v]) => [k, num(v, store.getScope())])))
            }}
          >
            <span className="q-num">{i + 1}</span>
            <span className="q-text">
              <Rich text={str(q.text)} html />
            </span>
          </button>
          {typeof q.hint === 'string' && i === active && (
            <p className="q-hint">
              <Rich text={q.hint} html />
            </p>
          )}
        </li>
      ))}
    </ol>
  )
}

interface AnswerItem {
  label: string
  symbol?: string
  expr?: string
  value?: number
  /** A non-numeric answer (option letters, an expression, 偏大) shown as written. */
  text?: string
  unit?: string
  digits?: number
  format?: string
}

const check = (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <path d="M4.8 8.2 7 10.3l4.2-4.6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/**
 * Collapsed by default so the student tries the question first. When an item
 * gives both an expression and the reference value, the card states whether the
 * live model agrees with the key.
 */
export function Answer({ props }: { props: Props }) {
  const items = (Array.isArray(props.items) ? props.items : []) as AnswerItem[]
  const scope = useScopeFor(namesIn(items.map((i) => i.expr ?? '')))
  const [open, setOpen] = useState(props.open === true)
  const shown = items.map((it) => {
    if (typeof it.text === 'string') return { ...it, shownValue: NaN, agrees: null }
    const live = it.expr !== undefined ? num(it.expr, scope) : NaN
    const value = Number.isFinite(live) ? live : (it.value ?? NaN)
    const agrees = it.value === undefined || !Number.isFinite(live) ? null : Math.abs(live - it.value) <= Math.max(1e-6, Math.abs(it.value) * 0.01)
    return { ...it, shownValue: value, agrees }
  })
  const verdicts = shown.map((s) => s.agrees).filter((a) => a !== null)
  const allAgree = verdicts.length > 0 && verdicts.every(Boolean)
  const anyDiffer = verdicts.some((a) => a === false)
  let status: ReactNode = <span className="answer-status">参考答案</span>
  if (allAgree) status = <span className="answer-status ok">{check}与参考答案一致</span>
  else if (anyDiffer) status = <span className="answer-status off">当前参数已偏离题目，数值随之变化</span>

  return (
    <section className={`answer ${open ? 'open' : ''}`}>
      <button className="answer-head" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? status : <span className="answer-status">{str(props.title, '查看答案')}</span>}
        <span className="answer-toggle">{open ? '收起' : '展开'}</span>
      </button>
      {open && (
        <>
          <div className="answer-items">
            {shown.map((it, i) => (
              <div className="answer-item" key={i}>
                <span className="answer-label">
                  <Rich text={it.label} html />
                </span>
                <span className="answer-value">
                  <Sym text={it.symbol} />
                  {typeof it.text === 'string' ? (
                    <span className={it.text.length <= 6 ? 'value value-big' : 'value'}>
                      <span className="num">
                        <Rich text={it.text} html />
                      </span>
                    </span>
                  ) : (
                    <Value value={it.shownValue} unit={it.unit} digits={it.digits} format={it.format} big />
                  )}
                </span>
              </div>
            ))}
          </div>
          <a
            className="answer-link"
            href="#solution"
            onClick={(e) => {
              // The URL hash selects the lesson, so scroll instead of navigating.
              e.preventDefault()
              document.getElementById('solution')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
            }}
          >
            看完整推导 ›
          </a>
        </>
      )}
    </section>
  )
}
