import { num, symbolsOf, type Scope } from './expr'
import type { Block } from './parse'
import { leastSquares } from './fit'
import type { SolverDef } from './solvers'

type Comp = Extract<Block, { kind: 'component' }>

const NAME = /^[A-Za-z][A-Za-z0-9_]*$/

export const PLOT_SERIES_KEYS = ['label', 'expr', 'color', 'dash', 'x', 'over', 'point', 'points', 'marker', 'line', 'fit', 'read'] as const

interface PlotCtx {
  err: (message: string) => void
  expr: (value: unknown, where: string) => void
  keysOnly: (obj: Record<string, unknown>, allowed: string[], where: string) => void
}

function seriesLabel(s: Record<string, unknown>): string {
  return String(s.label ?? '')
}

/** Whitelist and messages for a series that carries measured points instead of an expression. */
export function checkPlotPoints(s: Record<string, unknown>, ctx: PlotCtx): void {
  const label = seriesLabel(s)
  const where = `series「${label}」`
  if (s.expr !== undefined) ctx.err(`${where} points 和 expr 只写一个`)
  if (s.x !== undefined || s.point !== undefined || s.over !== undefined) ctx.err(`${where} 的 points 不能和 over、x、point 一起写`)
  if (!Array.isArray(s.points) || s.points.length === 0) {
    ctx.err(`${where}.points 应为 [[x, y], ...]，每个点是两个数字或表达式`)
  } else {
    s.points.forEach((pair, i) => {
      if (!Array.isArray(pair) || pair.length !== 2) {
        ctx.err(`${where}.points[${i}] 应为 [x, y]`)
        return
      }
      ctx.expr(pair[0], `${where}.points[${i}].x`)
      ctx.expr(pair[1], `${where}.points[${i}].y`)
    })
  }
  if (s.marker !== undefined && s.marker !== 'dot' && s.marker !== 'cross') ctx.err(`${where}.marker 只能是 dot 或 cross`)
  if (s.line !== undefined && typeof s.line !== 'boolean') ctx.err(`${where}.line 应为 true 或 false`)
  if (s.fit !== undefined && s.fit !== 'linear' && s.fit !== 'proportional') {
    ctx.err(`${where}.fit 只能是 linear（y = kx + b）或 proportional（过原点 y = kx）`)
  }
  if (s.fit !== undefined && (!Array.isArray(s.points) || s.points.length < 2)) ctx.err(`${where} 写了 fit 就要有至少两个数据点`)
  if (s.read !== undefined) {
    if (s.fit === undefined) ctx.err(`${where}.read 要和 fit 一起写，形如 {slope: "k", intercept: "b"}`)
    const rd = s.read
    if (!rd || typeof rd !== 'object' || Array.isArray(rd)) {
      ctx.err(`${where}.read 应为 {slope: "k", intercept: "b"}`)
    } else {
      const read = rd as Record<string, unknown>
      ctx.keysOnly(read, ['slope', 'intercept'], `${where}.read`)
      if (read.slope === undefined && read.intercept === undefined) ctx.err(`${where}.read 至少写 slope 或 intercept 一个名字`)
      for (const k of ['slope', 'intercept'] as const) {
        if (read[k] === undefined) continue
        if (typeof read[k] !== 'string' || !NAME.test(read[k] as string)) ctx.err(`${where}.read.${k} 应为名字（字母开头）`)
      }
    }
  }
}

function pointPairs(series: Record<string, unknown>, scope: Scope): [number, number][] {
  if (!Array.isArray(series.points)) return []
  return series.points.map((pair) => {
    const p = pair as unknown[]
    return [num(p?.[0], scope), num(p?.[1], scope)] as [number, number]
  })
}

/** Names a fitted series publishes, and the expressions those fits depend on. */
export function plotReadPlan(props: Record<string, unknown>): { outputs: string[]; inputs: string[] } {
  const outputs: string[] = []
  const inputs = new Set<string>()
  const series = Array.isArray(props.series) ? props.series : []
  for (const item of series) {
    if (!item || typeof item !== 'object') continue
    const s = item as Record<string, unknown>
    if (s.fit !== 'linear' && s.fit !== 'proportional') continue
    const read = s.read && typeof s.read === 'object' && !Array.isArray(s.read) ? (s.read as Record<string, unknown>) : null
    if (!read) continue
    for (const k of ['slope', 'intercept'] as const) if (typeof read[k] === 'string') outputs.push(read[k] as string)
    if (Array.isArray(s.points)) {
      for (const pair of s.points) {
        if (!Array.isArray(pair)) continue
        for (const c of pair) {
          if (typeof c !== 'string') continue
          try {
            for (const name of symbolsOf(c)) inputs.add(name)
          } catch {
            // the validator reports unparsable expressions
          }
        }
      }
    }
  }
  for (const name of outputs) inputs.delete(name)
  return { outputs, inputs: [...inputs] }
}

export function plotReadValues(props: Record<string, unknown>, scope: Scope): Record<string, number> {
  const out: Record<string, number> = {}
  const series = Array.isArray(props.series) ? props.series : []
  for (const item of series) {
    if (!item || typeof item !== 'object') continue
    const s = item as Record<string, unknown>
    if (s.fit !== 'linear' && s.fit !== 'proportional') continue
    const read = s.read && typeof s.read === 'object' && !Array.isArray(s.read) ? (s.read as Record<string, unknown>) : null
    if (!read) continue
    const fit = leastSquares(pointPairs(s, scope), s.fit)
    if (typeof read.slope === 'string') out[read.slope] = fit.slope
    if (typeof read.intercept === 'string') out[read.intercept] = fit.intercept
  }
  return out
}

export function plotSolverOf(b: Comp): SolverDef | null {
  if (b.name !== 'Plot') return null
  const plan = plotReadPlan(b.props)
  if (!plan.outputs.length) return null
  return {
    where: `第 ${b.line} 行 <Plot>`,
    outputs: plan.outputs,
    inputs: plan.inputs,
    run: (scope) => plotReadValues(b.props, scope),
  }
}
