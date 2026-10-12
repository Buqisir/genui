import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { ease } from '../theme'
import { evaluate, num, settleSum, symbolsOf, type Scope } from './expr'
import type { Block } from './parse'
import { solverOf, type SolverDef } from './solvers'

export interface ParamDef {
  name: string
  value: number
  min?: number
  max?: number
  step?: number
  /** Option params and integer steppers jump between values instead of gliding. */
  discrete?: boolean
}

export interface DefineDef {
  name: string
  expr: string
  /** Set when the value is computed by a component's solver instead of an expression. */
  solver?: SolverDef
}

const depsOf = (d: DefineDef, known?: Set<string>): string[] =>
  d.solver ? d.solver.inputs.filter((n) => !known || known.has(n)) : symbolsOf(d.expr)

export interface Registry {
  params: ParamDef[]
  defines: DefineDef[]
  /** Defines in dependency order. */
  order: DefineDef[]
  errors: string[]
}

const NAME = /^[A-Za-z][A-Za-z0-9_]*$/

export function buildRegistry(blocks: Block[]): Registry {
  const params: ParamDef[] = []
  const defines: DefineDef[] = []
  const errors: string[] = []
  const seen = new Set<string>()

  for (const b of blocks) {
    if (b.kind !== 'component') continue
    if (b.name !== 'Param' && b.name !== 'Define') continue
    const name = b.props.name
    if (typeof name !== 'string' || !NAME.test(name)) {
      errors.push(`第 ${b.line} 行：${b.name} 的 name 不合法`)
      continue
    }
    if (seen.has(name)) {
      errors.push(`第 ${b.line} 行：名字 ${name} 重复声明`)
      continue
    }
    seen.add(name)
    if (b.name === 'Param') {
      const value = typeof b.props.value === 'number' ? b.props.value : 0
      const step = typeof b.props.step === 'number' ? b.props.step : undefined
      params.push({
        name,
        value,
        min: b.props.min as number | undefined,
        max: b.props.max as number | undefined,
        step,
        discrete: Array.isArray(b.props.options) || b.props.control === 'stepper',
      })
    } else if (typeof b.props.expr === 'string') {
      defines.push({ name, expr: b.props.expr })
    } else {
      errors.push(`第 ${b.line} 行：Define ${name} 缺少 expr`)
    }
  }

  for (const b of blocks) {
    if (b.kind !== 'component') continue
    const solver = solverOf(b)
    if (!solver) continue
    for (const name of solver.outputs) {
      if (!NAME.test(name)) {
        errors.push(`${solver.where}：read 的名字 ${name} 不合法`)
        continue
      }
      if (seen.has(name)) {
        errors.push(`${solver.where}：read 的名字 ${name} 和已有的 Param/Define 重复`)
        continue
      }
      seen.add(name)
      defines.push({ name, expr: '', solver })
    }
  }

  const order = topoSort(defines, seen, errors)
  return { params, defines, order, errors }
}

function topoSort(defines: DefineDef[], known: Set<string>, errors: string[]): DefineDef[] {
  const byName = new Map(defines.map((d) => [d.name, d]))
  const out: DefineDef[] = []
  const state = new Map<string, 'visiting' | 'done'>()

  const visit = (d: DefineDef, chain: string[]) => {
    const s = state.get(d.name)
    if (s === 'done') return
    if (s === 'visiting') {
      errors.push(`循环引用：${[...chain, d.name].join(' → ')}`)
      return
    }
    state.set(d.name, 'visiting')
    let deps: string[] = []
    try {
      deps = depsOf(d, known)
    } catch (e) {
      errors.push(`Define ${d.name} 的表达式无法解析：${(e as Error).message}`)
    }
    for (const dep of deps) {
      if (!known.has(dep)) errors.push(`Define ${d.name} 引用了未声明的名字 ${dep}`)
      const target = byName.get(dep)
      if (target) visit(target, [...chain, d.name])
    }
    state.set(d.name, 'done')
    out.push(d)
  }
  for (const d of defines) visit(d, [])
  return out
}

const objectIds = new WeakMap<object, number>()
let nextObjectId = 1

/** Cache key for a scope value: numbers as themselves, solver objects (motions) by identity. */
export function valueKey(v: unknown): string {
  if (v && typeof v === 'object') {
    let id = objectIds.get(v)
    if (!id) objectIds.set(v, (id = nextObjectId++))
    return `#${id}`
  }
  return String(v)
}

type Listener = () => void

const TWEEN_MS = 450
const SOLVER_MEMO_SIZE = 4

export class ParamStore {
  private values: Record<string, number>
  private listeners = new Set<Listener>()
  private snapshot: Scope
  private tweenRaf = 0
  /** Params driven by a Sim clock; presets jump them instead of tweening. */
  readonly clocks = new Set<string>()
  readonly defs: Map<string, ParamDef>
  readonly initial: Record<string, number>

  constructor(private registry: Registry) {
    this.values = Object.fromEntries(registry.params.map((p) => [p.name, p.value]))
    this.initial = { ...this.values }
    this.defs = new Map(registry.params.map((p) => [p.name, p]))
    this.snapshot = this.compute(this.values)
  }

  subscribe = (l: Listener) => {
    this.listeners.add(l)
    return () => this.listeners.delete(l)
  }

  getScope = () => this.snapshot

  /**
   * Direct input: cancels a running tween if it touches the same params. A Sim clock
   * ticking every frame must not cancel a preset gliding other params.
   */
  set(patch: Record<string, number>) {
    if (Object.keys(patch).some((k) => this.tweenKeys.has(k))) this.cancelTween()
    this.apply(patch)
  }

  private apply(patch: Record<string, number>) {
    let changed = false
    for (const [k, v] of Object.entries(patch)) {
      if (!(k in this.values) || !Number.isFinite(v)) continue
      if (this.values[k] !== v) {
        this.values[k] = v
        changed = true
      }
    }
    if (!changed) return
    this.snapshot = this.compute(this.values)
    this.listeners.forEach((l) => l())
  }

  private tweenKeys = new Set<string>()

  private cancelTween() {
    if (this.tweenRaf) cancelAnimationFrame(this.tweenRaf)
    this.tweenRaf = 0
    this.tweenKeys.clear()
  }

  /**
   * Glide continuous params to new values so the stage visibly morphs between
   * situations. Discrete params and clocks jump immediately.
   */
  tween(patch: Record<string, number>, ms = TWEEN_MS) {
    this.cancelTween()
    const jump: Record<string, number> = {}
    const glide: [string, number, number][] = []
    for (const [k, v] of Object.entries(patch)) {
      if (!(k in this.values) || !Number.isFinite(v)) continue
      const def = this.defs.get(k)
      if (def?.discrete || this.clocks.has(k) || typeof requestAnimationFrame === 'undefined' || reducedMotion()) jump[k] = v
      else if (this.values[k] !== v) glide.push([k, this.values[k], v])
    }
    this.apply(jump)
    if (!glide.length) return
    this.tweenKeys = new Set(glide.map(([k]) => k))
    const start = performance.now()
    const frame = (now: number) => {
      const k = ease(Math.min(1, (now - start) / ms))
      this.apply(Object.fromEntries(glide.map(([n, a, b]) => [n, k >= 1 ? b : a + (b - a) * k])))
      this.tweenRaf = k < 1 ? requestAnimationFrame(frame) : 0
      if (!this.tweenRaf) this.tweenKeys.clear()
    }
    this.tweenRaf = requestAnimationFrame(frame)
  }

  private solverMemo = new WeakMap<SolverDef, { key: unknown[]; out: Record<string, unknown> }[]>()

  /**
   * Solvers rerun only when one of their inputs changed (a Sim clock ticking past them is free).
   * A few recent results are kept because scopeWith() asks for a second parameter set (initial
   * values, a ledger row) every frame; with a single slot the two would evict each other and
   * re-integrate every Motion twice per frame.
   */
  private runSolver(solver: SolverDef, scope: Scope): Record<string, unknown> {
    const key = solver.inputs.map((n) => scope[n])
    const memo = this.solverMemo.get(solver) ?? []
    const hit = memo.findIndex((m) => m.key.length === key.length && m.key.every((v, i) => Object.is(v, key[i])))
    if (hit >= 0) {
      const [m] = memo.splice(hit, 1)
      memo.unshift(m!)
      return m!.out
    }
    let out: Record<string, unknown>
    try {
      out = solver.run(scope)
    } catch {
      out = Object.fromEntries(solver.outputs.map((n) => [n, NaN]))
    }
    memo.unshift({ key, out })
    memo.length = Math.min(memo.length, SOLVER_MEMO_SIZE)
    this.solverMemo.set(solver, memo)
    return out
  }

  private initialSnapshot?: Scope

  /** Scope at the lesson's initial parameter values; computed once. */
  initialScope(): Scope {
    return (this.initialSnapshot ??= this.compute(this.initial))
  }

  /** Params that the given names depend on, following Defines transitively. */
  paramRoots(names: Iterable<string>): Set<string> {
    const out = new Set<string>()
    const seen = new Set<string>()
    const defs = new Map(this.registry.defines.map((d) => [d.name, d]))
    const visit = (n: string) => {
      if (seen.has(n)) return
      seen.add(n)
      if (this.defs.has(n)) out.add(n)
      const d = defs.get(n)
      if (!d) return
      let syms: string[] = []
      try {
        syms = depsOf(d)
      } catch {
        // unparsable defines are reported by the validator
      }
      syms.forEach(visit)
    }
    for (const n of names) visit(n)
    return out
  }

  private defineExprs?: Map<string, string>

  /** A Define's expression; names a solver fills have none. */
  defineExpr = (name: string): string | undefined => {
    this.defineExprs ??= new Map(this.registry.defines.filter((d) => !d.solver && d.expr).map((d) => [d.name, d.expr]))
    return this.defineExprs.get(name)
  }

  /** A number shown to the reader: like num(), but a sum that cancels exactly reads 0 (see settleSum). */
  reading(expr: unknown, scope: Scope): number {
    return settleSum(num(expr, scope), expr, scope, this.defineExpr)
  }

  /** Scope as it would be with some params overridden (e.g. a ledger row at t = 0). */
  scopeWith(patch: Record<string, number>): Scope {
    return this.compute({ ...this.values, ...patch })
  }

  private compute(values: Record<string, number>): Scope {
    const scope: Scope = { ...values }
    const solved = new Map<SolverDef, Record<string, unknown>>()
    for (const d of this.registry.order) {
      try {
        if (d.solver) {
          let r = solved.get(d.solver)
          if (!r) solved.set(d.solver, (r = this.runSolver(d.solver, scope)))
          // Motion objects ride in the scope next to numbers; expressions call them (ball.y(t)).
          scope[d.name] = (r[d.name] ?? NaN) as number
        } else scope[d.name] = evaluate(d.expr, scope)
      } catch {
        scope[d.name] = NaN
      }
    }
    return scope
  }
}

export const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

const StoreContext = createContext<ParamStore | null>(null)

export function StoreProvider({ registry, children }: { registry: Registry; children: ReactNode }) {
  const store = useMemo(() => new ParamStore(registry), [registry])
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): ParamStore {
  const s = useContext(StoreContext)
  if (!s) throw new Error('useStore 必须在 StoreProvider 里使用')
  return s
}

/** Whole scope; re-renders on every change. Prefer useScopeFor in hot paths. */
export function useScope(): Scope {
  const store = useStore()
  return useSyncExternalStore(store.subscribe, store.getScope)
}

/** Names referenced anywhere inside a prop value (strings parsed as expressions). */
export function namesIn(value: unknown, out = new Set<string>()): Set<string> {
  if (typeof value === 'string') {
    try {
      for (const s of symbolsOf(value)) out.add(s)
    } catch {
      out.add(value)
    }
  } else if (Array.isArray(value)) value.forEach((v) => namesIn(v, out))
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => namesIn(v, out))
  return out
}

/**
 * Scope that only triggers a re-render when one of `names` changes. Lets the
 * sim clock tick at 60 fps without re-rendering every control on the page.
 */
export function useScopeFor(names: Iterable<string>): Scope {
  const store = useStore()
  const list = useMemo(() => [...new Set(names)].sort(), [[...names].join(',')]) // eslint-disable-line react-hooks/exhaustive-deps
  const snapshot = () => {
    const s = store.getScope()
    let key = ''
    for (const n of list) key += valueKey(s[n]) + '|'
    return key
  }
  // The third argument is required when the same tree is rendered on the server (tests).
  useSyncExternalStore(store.subscribe, snapshot, snapshot)
  return store.getScope()
}
