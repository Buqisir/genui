// Readings for the lab multimeter, spring scale, resistance box and electrometer.
// The picture (needle, knob, dial digits, hook) is computed from these numbers.
// springHook and electrometerDegrees are bundled into the sandbox runtime.

import { formatTick } from '../components/layout'
import { num, type Scope } from './expr'
import type { Props } from './parse'

export { SPRING_TRAVEL, electrometerDegrees, springHook } from './instrumentHook'

export const MULTIMETER_MODES = ['ohm', 'dcv', 'dcma', 'acv', 'off'] as const
export type MultimeterMode = (typeof MULTIMETER_MODES)[number]

/** Legal `range` for each selector sector. Ohm values are multipliers. */
export const MULTIMETER_RANGES: Record<MultimeterMode, readonly number[]> = {
  ohm: [1, 10, 100, 1000],
  dcv: [2.5, 10, 50, 250, 500],
  dcma: [1, 10, 100],
  acv: [10, 50, 250, 500],
  off: [],
}

const OHM_BANDS: readonly [number, number, number][] = [
  [0, 2, 0.2],
  [2, 10, 0.5],
  [10, 20, 1],
  [20, 50, 2],
  [50, 100, 5],
  [100, 200, 10],
  [200, 500, 50],
  [500, 1000, 100],
  [1000, Infinity, 200],
]

const fix = (v: number, d: number) => (Number.isFinite(v) ? v.toFixed(Math.max(0, d)) : '—')
const decimals = (x: number) => (x > 0 && Number.isFinite(x) ? Math.max(0, -Math.floor(Math.log10(x) + 1e-9)) : 0)
const plain = (v: number) => (Number.isFinite(v) ? String(Math.round(v * 1e6) / 1e6) : '—')

/**
 * 高考估读：最小分度的首位是 1 时估到下一位；是 2 或 5 时在本位估（半格、五分之一格）。
 * Same rule as the pointer meter.
 */
export function divisionEstimate(per: number): { grain: number; digits: number } {
  if (!(per > 0) || !Number.isFinite(per)) return { grain: 0, digits: 0 }
  const exp = Math.floor(Math.log10(per) + 1e-9)
  const mant = Math.round(per / 10 ** exp)
  const grain = mant === 1 ? per / 10 : mant === 2 ? per / 2 : per / 5
  const digits = mant === 1 ? decimals(per) + 1 : decimals(per)
  return { grain, digits }
}

export function quantize(value: number, per: number): { q: number; digits: number; grain: number } {
  const est = divisionEstimate(per)
  if (!(est.grain > 0) || !Number.isFinite(value)) return { q: value, ...est }
  const q = Math.round(value / est.grain) * est.grain
  return { q, digits: est.digits, grain: est.grain }
}

/** Ohm-scale fraction of full deflection: 0 at ∞ (left), 1 at 0 Ω (right). */
export function ohmFraction(dialOhms: number, mid: number): number {
  const r = Math.max(0, dialOhms)
  const m = mid > 0 ? mid : 15
  return m / (m + r)
}

/** Local division on the non-uniform ohm arc, in dial ohms (before the multiplier). */
export function ohmDivision(dialOhms: number, mid: number): number {
  const s = (mid > 0 ? mid : 15) / 15
  const r = Math.max(0, dialOhms)
  for (const [a, b, step] of OHM_BANDS) {
    const from = a * s
    const to = b === Infinity ? Infinity : b * s
    if (r >= from && r < to) return step * s
  }
  return 200 * s
}

export interface OhmTick {
  value: number
  major: boolean
}

/** Tick marks of the Ω arc. Values are dial ohms; `mid` scales them so the centre stays the midscale. */
export function ohmTicks(mid: number): OhmTick[] {
  const s = (mid > 0 ? mid : 15) / 15
  const majors = new Set([0, 1, 2, 5, 10, 20, 50, 100, 200, 500].map((v) => Math.round(v * s * 1000)))
  const ticks: OhmTick[] = []
  for (const [a, b, step] of OHM_BANDS) {
    if (b === Infinity) break
    const n = Math.round((b - a) / step)
    for (let i = 0; i < n; i++) {
      const value = (a + i * step) * s
      ticks.push({ value, major: majors.has(Math.round(value * 1000)) })
    }
  }
  return ticks
}

/**
 * The middle third of the ohm arc is the useful part.
 * Deflection < 1/3 (needle near ∞) → a larger multiplier; > 2/3 (near 0) → a smaller one.
 */
export function ohmHint(fraction: number, multiplier: number): string | null {
  const ranges = MULTIMETER_RANGES.ohm
  const i = ranges.findIndex((r) => Math.abs(r - multiplier) < 1e-9)
  if (fraction < 1 / 3 - 1e-9) {
    return i >= 0 && i < ranges.length - 1 ? '指针偏角太小，应换更大倍率' : '指针偏角太小，已是最大倍率'
  }
  if (fraction > 2 / 3 + 1e-9) {
    return i > 0 ? '指针偏角太大，应换更小倍率' : '指针偏角太大，已是最小倍率'
  }
  return null
}

export interface LinearScale {
  scaleMax: number
  /** Measured unit per scale unit. 2.5 V reads the 0–250 arc and divides by 100. */
  factor: number
  divisions: number
  /** What the reading line tells the student to look at. */
  name: string
}

const LINEAR: Record<string, LinearScale> = {
  'dcv:2.5': { scaleMax: 250, factor: 0.01, divisions: 50, name: '0–250 刻度后 ÷100' },
  'dcv:10': { scaleMax: 10, factor: 1, divisions: 50, name: '0–10 刻度' },
  'dcv:50': { scaleMax: 50, factor: 1, divisions: 50, name: '0–50 刻度' },
  'dcv:250': { scaleMax: 250, factor: 1, divisions: 50, name: '0–250 刻度' },
  'dcv:500': { scaleMax: 50, factor: 10, divisions: 50, name: '0–50 刻度 ×10' },
  'dcma:1': { scaleMax: 50, factor: 0.02, divisions: 50, name: '0–50 刻度 ÷50' },
  'dcma:10': { scaleMax: 10, factor: 1, divisions: 50, name: '0–10 刻度' },
  'dcma:100': { scaleMax: 10, factor: 10, divisions: 50, name: '0–10 刻度 ×10' },
  'acv:10': { scaleMax: 10, factor: 1, divisions: 50, name: '交流 0–10 刻度' },
  'acv:50': { scaleMax: 50, factor: 1, divisions: 50, name: '0–50 刻度' },
  'acv:250': { scaleMax: 250, factor: 1, divisions: 50, name: '0–250 刻度' },
  'acv:500': { scaleMax: 50, factor: 10, divisions: 50, name: '0–50 刻度 ×10' },
}

export function linearScale(mode: string, range: number): LinearScale | null {
  const key = `${mode}:${plain(range)}`
  return LINEAR[key] ?? null
}

/** Which printed arc a linear range is read on: 10, 50 or 250. */
export function activeArc(mode: string, range: number): 10 | 50 | 250 | null {
  const s = linearScale(mode, range)
  if (!s) return null
  return s.scaleMax === 10 || s.scaleMax === 50 || s.scaleMax === 250 ? s.scaleMax : null
}

export interface MultimeterReading {
  mode: MultimeterMode | string
  range: number
  mid: number
  /** 0 = left (∞ or 0 V), 1 = right (0 Ω or full scale). */
  fraction: number
  /** Quantized indication on the scale that is actually read, before × multiplier. */
  dial: number
  /** Quantity in Ω, V or mA. */
  result: number
  /** Division of the scale, in the same unit as `result` (dial ohms for the ohm arc). */
  division: number
  digits: number
  unit: string
  line: string
  hint: string | null
  over: boolean
  ok: boolean
}

export function readMultimeter(opts: { mode: string; range: number; value: number; mid?: number }): MultimeterReading {
  const mode = opts.mode
  const mid = opts.mid !== undefined && opts.mid > 0 ? opts.mid : 15
  const range = opts.range
  const value = opts.value
  const base = { mode, range, mid, fraction: 0, dial: 0, result: 0, division: 0, digits: 0, unit: '', line: '', hint: null, over: false, ok: false }
  if (mode === 'off') {
    return { ...base, ok: true, line: '选择开关在 OFF，未测量' }
  }
  const allowed = MULTIMETER_RANGES[mode as MultimeterMode]
  if (!allowed || !allowed.some((r) => Math.abs(r - range) < 1e-9)) {
    return { ...base, line: '挡位和量程不匹配' }
  }
  if (!Number.isFinite(value)) return { ...base, ok: true, line: '—' }
  if (mode === 'ohm') {
    const shown = Math.max(0, value) / range
    const per = ohmDivision(shown, mid)
    const { q, digits } = quantize(shown, per)
    const fraction = ohmFraction(q, mid)
    const result = Number((q * range).toPrecision(8))
    return {
      ...base,
      ok: true,
      fraction,
      dial: q,
      result,
      division: per,
      digits,
      unit: 'Ω',
      hint: ohmHint(fraction, range),
      line: `读欧姆刻度（左 ∞、右 0，中值 ${plain(mid)}），附近每小格 ${plain(per)}，示数 ${fix(q, digits)} × 倍率 ${plain(range)} = ${plain(result)} Ω`,
    }
  }
  const scale = linearScale(mode, range)!
  const per = (scale.scaleMax / scale.divisions) * scale.factor
  const { q, digits } = quantize(value, per)
  const fraction = range > 0 ? q / range : 0
  const over = value > range * 1.001
  const kind = mode === 'acv' ? '交流' : '直流'
  const unit = mode === 'dcma' ? 'mA' : 'V'
  return {
    ...base,
    ok: true,
    fraction: Math.max(0, fraction),
    dial: scale.factor === 0 ? 0 : q / scale.factor,
    result: q,
    division: per,
    digits,
    unit,
    over,
    line: `${kind} ${plain(range)} ${unit} 挡，读 ${scale.name}，每小格 ${plain(per)} ${unit}，读数 ${fix(q, digits)} ${unit}${over ? '（超过量程）' : ''}`,
  }
}

export interface SelectorSlot {
  mode: string
  range: number
  label: string
  /** Clockwise degrees from straight up. */
  angle: number
  a0: number
  a1: number
}

export interface SelectorGroup {
  mode: string
  label: string
  from: number
  to: number
}

const SELECTOR_GROUPS: readonly (SelectorGroup & { ranges: readonly number[]; labels: readonly string[] })[] = [
  { mode: 'acv', label: 'ACV', from: 282, to: 348, ranges: [10, 50, 250, 500], labels: ['10', '50', '250', '500'] },
  { mode: 'dcv', label: 'DCV', from: 12, to: 102, ranges: [2.5, 10, 50, 250, 500], labels: ['2.5', '10', '50', '250', '500'] },
  { mode: 'dcma', label: 'mA', from: 102, to: 158, ranges: [1, 10, 100], labels: ['1', '10', '100'] },
  { mode: 'off', label: 'OFF', from: 158, to: 198, ranges: [0], labels: ['OFF'] },
  { mode: 'ohm', label: 'Ω', from: 198, to: 282, ranges: [1, 10, 100, 1000], labels: ['×1', '×10', '×100', '×1k'] },
]

export function selectorGroups(): SelectorGroup[] {
  return SELECTOR_GROUPS.map(({ mode, label, from, to }) => ({ mode, label, from, to }))
}

export function selectorSlots(): SelectorSlot[] {
  const out: SelectorSlot[] = []
  for (const g of SELECTOR_GROUPS) {
    const n = g.ranges.length
    g.ranges.forEach((range, i) => {
      const a0 = g.from + ((g.to - g.from) * i) / n
      const a1 = g.from + ((g.to - g.from) * (i + 1)) / n
      out.push({ mode: g.mode, range, label: g.labels[i], angle: (a0 + a1) / 2, a0, a1 })
    })
  }
  return out
}

/** Where the selector pointer aims, in clockwise degrees from straight up. */
export function selectorAngle(mode: string, range: number): number | null {
  if (mode === 'off') return selectorSlots().find((s) => s.mode === 'off')?.angle ?? null
  return selectorSlots().find((s) => s.mode === mode && Math.abs(s.range - range) < 1e-9)?.angle ?? null
}

export interface SpringReading {
  /** Pointer position, 0 at the zero mark, 1 at full scale. */
  fraction: number
  division: number
  q: number
  digits: number
  over: boolean
  line: string
}

export function readSpringScale(value: number, max: number, divisions: number): SpringReading {
  const n = divisions > 1 ? Math.round(divisions) : max <= 5 ? Math.round(max / 0.1) : Math.round(max / 0.2)
  const per = max / n
  const fraction = !(max > 0) || !Number.isFinite(value) ? 0 : Math.max(0, Math.min(1, value / max))
  const { q, digits } = quantize(Number.isFinite(value) ? value : NaN, per)
  const over = Number.isFinite(value) && max > 0 && value > max * 1.001
  const line = !Number.isFinite(value) || !(max > 0)
    ? '—'
    : `量程 ${plain(max)} N，每小格 ${plain(per)} N，读数 ${fix(q, digits)} N${over ? '（超过量程）' : ''}`
  return { fraction, division: per, q, digits, over, line }
}

export interface DecadeReading {
  digits: number[]
  total: number
  line: string
}

/** Split `value` across the decade knobs. The total is what the pointers show (the top decade wraps at 10). */
export function decadeReading(value: number, decades: number[]): DecadeReading {
  const ds = decades.filter((d) => d > 0)
  if (!ds.length || !Number.isFinite(value)) return { digits: ds.map(() => 0), total: 0, line: '—' }
  const smallest = Math.min(...ds)
  const N = Math.round(Math.max(0, value) / smallest)
  const digits = ds.map((d) => Math.floor(N / Math.round(d / smallest)) % 10)
  const total = digits.reduce((s, dg, i) => s + dg * ds[i], 0)
  const line = digits.map((dg, i) => `${dg} × ${formatTick(ds[i], { bare: true })}`).join(' + ') + ` = ${fix(total, decimals(smallest))} Ω`
  return { digits, total, line }
}

const normTerm = (s: string) => s.replace(/−/g, '-').trim()

/** Galvanometer binding posts. Default is the two-terminal movement. */
export function galvTerminalList(terminals?: unknown): string[] {
  if (!Array.isArray(terminals) || terminals.length < 2) return ['+', '-']
  const names = terminals.map((t) => normTerm(String(t))).filter(Boolean)
  return names.length >= 2 ? names : ['+', '-']
}

/** The common post (current returns here). The others are alternate entries to the same movement. */
export function galvCommon(names: string[]): string {
  return names.find((t) => t === '-') ?? names[0]
}

function isMode(s: string): s is MultimeterMode {
  return (MULTIMETER_MODES as readonly string[]).includes(s)
}

/** Structural checks. Numeric `range` is checked here; an expression is checked once the scope exists. */
export function instrumentPropIssues(props: Props, err: (message: string) => void): void {
  const type = String(props.type ?? '')
  if (props.mode !== undefined && type !== 'multimeter') err('mode 只用于 type="multimeter"')
  if (props.angle !== undefined && type !== 'springScale') err('angle 只用于 type="springScale"')
  if (props.max !== undefined && type !== 'springScale') err('max 只用于 type="springScale"')
  if (props.terminals !== undefined && type !== 'meter') err('terminals 只用于 type="meter"（实物图的多接线柱写在 Wiring 的 galvanometer 上）')
  if (type === 'meter' && props.terminals !== undefined) {
    const ok = Array.isArray(props.terminals) && props.terminals.length >= 2 && props.terminals.every((s) => typeof s === 'string' && s.trim())
    if (!ok) err('terminals 应为至少两个接线柱名字，如 ["−", "3 V", "15 V"]')
  }
  if (type !== 'multimeter' && type !== 'springScale') return
  if (type === 'springScale') {
    if (props.max === undefined) err('弹簧测力计要写 max（量程，单位 N）')
    if (props.divisions !== undefined && (!Number.isInteger(Number(props.divisions)) || Number(props.divisions) < 5 || Number(props.divisions) > 200)) {
      err('弹簧测力计 divisions 是全程小格数，取 5 到 200')
    }
    return
  }
  const mode = String(props.mode ?? '')
  if (!isMode(mode)) {
    err(`多用电表 mode 不合法：${mode || '（未写）'}（可用：ohm、dcv、dcma、acv、off）`)
    return
  }
  if (mode === 'off') {
    if (props.range !== undefined) err('OFF 挡不要写 range')
    return
  }
  if (props.range === undefined) {
    err('多用电表要写 range（欧姆挡是倍率，电压、电流挡是满度）')
    return
  }
  const range = props.range
  if (typeof range === 'number' && !MULTIMETER_RANGES[mode].some((r) => Math.abs(r - range) < 1e-9)) {
    err(`多用电表 ${mode} 挡没有量程 ${range}（可用：${MULTIMETER_RANGES[mode].join('、')}）`)
  }
}

/** Range written as an expression, checked at the initial parameter values. */
export function instrumentScopeIssues(props: Props, scope: Scope): string[] {
  const out: string[] = []
  if (props.type === 'multimeter' && props.mode !== 'off' && props.range !== undefined && typeof props.range !== 'number') {
    const mode = String(props.mode)
    if (isMode(mode) && mode !== 'off') {
      const r = num(props.range, scope, NaN)
      if (Number.isFinite(r) && !MULTIMETER_RANGES[mode].some((x) => Math.abs(x - r) < 1e-9)) {
        out.push(`多用电表 ${mode} 挡没有量程 ${r}（可用：${MULTIMETER_RANGES[mode].join('、')}）`)
      }
    }
  }
  if (props.type === 'springScale') {
    const max = num(props.max, scope, NaN)
    if (!(max > 0)) out.push('弹簧测力计量程 max 要大于 0')
  }
  return out
}
