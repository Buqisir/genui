import { all, create, type EvalFunction, type MathNode } from 'mathjs'

const math = create(all, {})
const compile = math.compile
const parse = math.parse

math.import(
  {
    clamp: (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi),
    deg: (x: number) => (x * Math.PI) / 180,
  },
  { override: true },
)

// Per mathjs security guidance: lessons may only evaluate expressions, never
// extend the instance or reach the parser from inside an expression.
const disabled = () => {
  throw new Error('该函数在课件表达式中不可用')
}
math.import(
  {
    import: disabled,
    createUnit: disabled,
    evaluate: disabled,
    parse: disabled,
    compile: disabled,
    simplify: disabled,
    derivative: disabled,
    resolve: disabled,
    reviver: disabled,
  },
  { override: true },
)

const BUILTIN = new Set(['pi', 'e', 'PI', 'E', 'true', 'false', 'Infinity', 'NaN'])

const cache = new Map<string, EvalFunction>()

export type Scope = Record<string, number>

export function evaluate(expr: string, scope: Scope): number {
  return evaluateIn(expr, { ...scope })
}

/** Like evaluate, but uses `scope` as is. For tight loops that own a scratch scope object. */
export function evaluateIn(expr: string, scope: Scope): number {
  // Integrators evaluate bare names (rates such as "v") millions of times; skip mathjs for them.
  const direct = scope[expr]
  if (typeof direct === 'number' && Object.prototype.hasOwnProperty.call(scope, expr)) return direct
  let fn = cache.get(expr)
  if (!fn) {
    fn = compile(expr)
    cache.set(expr, fn)
  }
  const value = fn.evaluate(scope)
  if (typeof value === 'boolean') return value ? 1 : 0
  if (typeof value !== 'number') throw new Error(`表达式结果不是数字：${expr}`)
  return value
}

/** Evaluate a number-or-expression prop; returns fallback on error. */
export function num(value: unknown, scope: Scope, fallback = NaN): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    try {
      return evaluate(value, scope)
    } catch {
      return fallback
    }
  }
  return fallback
}

/** Free variable names referenced by an expression (functions excluded). */
export function symbolsOf(expr: string): string[] {
  const node: MathNode = parse(expr)
  const names = new Set<string>()
  node.traverse((n, _path, parent) => {
    if (n.type !== 'SymbolNode') return
    const isCallee =
      parent?.type === 'FunctionNode' && (parent as unknown as { fn: MathNode }).fn === n
    const name = (n as unknown as { name: string }).name
    if (!isCallee && !BUILTIN.has(name)) names.add(name)
  })
  return [...names]
}

const parsed = new Map<string, MathNode | null>()
const compiledNodes = new WeakMap<MathNode, EvalFunction>()

function parsedOf(expr: string): MathNode | null {
  let node = parsed.get(expr)
  if (node === undefined) {
    try {
      node = parse(expr)
    } catch {
      node = null
    }
    parsed.set(expr, node)
  }
  return node
}

function evalNode(n: MathNode, scope: Scope): number {
  let fn = compiledNodes.get(n)
  if (!fn) compiledNodes.set(n, (fn = n.compile()))
  const v = fn.evaluate({ ...scope })
  return typeof v === 'number' ? v : typeof v === 'boolean' ? +v : NaN
}

/**
 * Size of the terms an expression adds up: |a| + |b| for a ± b, carried through products,
 * quotients, parentheses, a ? b : c and Defines (`lookup` gives a Define's expression).
 * Anything else counts as its own absolute value.
 */
export function termSize(expr: string, scope: Scope, lookup: (name: string) => string | undefined = () => undefined): number {
  const size = (n: MathNode, depth: number): number => {
    const node = n as MathNode & { fn?: string | MathNode; args?: MathNode[]; content?: MathNode; name?: string; condition?: MathNode; trueExpr?: MathNode; falseExpr?: MathNode }
    if (depth > 30) return Math.abs(evalNode(n, scope))
    switch (n.type) {
      case 'ParenthesisNode':
        return size(node.content!, depth + 1)
      case 'FunctionNode': {
        // abs, max and min hand back one of their arguments, so they pass its size through.
        const name = (node.fn as { name?: string } | undefined)?.name
        const args = node.args ?? []
        if (name === 'abs' && args.length === 1) return size(args[0], depth + 1)
        if ((name === 'max' || name === 'min') && args.length >= 2) {
          const value = evalNode(n, scope)
          const k = args.findIndex((a) => evalNode(a, scope) === value)
          if (k >= 0) return size(args[k], depth + 1)
        }
        return Math.abs(evalNode(n, scope))
      }
      case 'ConditionalNode':
        return size(evalNode(node.condition!, scope) ? node.trueExpr! : node.falseExpr!, depth + 1)
      case 'SymbolNode': {
        const def = node.name ? lookup(node.name) : undefined
        const sub = def ? parsedOf(def) : null
        return sub ? size(sub, depth + 1) : Math.abs(evalNode(n, scope))
      }
      case 'OperatorNode': {
        const args = node.args ?? []
        if (node.fn === 'add' || node.fn === 'subtract') return args.reduce((s, a) => s + size(a, depth + 1), 0)
        if (node.fn === 'unaryMinus' || node.fn === 'unaryPlus') return size(args[0], depth + 1)
        if (node.fn === 'multiply') return args.reduce((s, a) => s * size(a, depth + 1), 1)
        if (node.fn === 'divide' && args.length === 2) return size(args[0], depth + 1) / Math.abs(evalNode(args[1], scope))
        return Math.abs(evalNode(n, scope))
      }
      default:
        return Math.abs(evalNode(n, scope))
    }
  }
  const root = parsedOf(expr)
  if (!root) return NaN
  try {
    return size(root, 0)
  } catch {
    return NaN
  }
}

/**
 * A sum whose terms cancel exactly (the total momentum of two bodies pushed apart from rest)
 * comes out as 1e-16 of its terms instead of 0; that leftover is rounding, so it reads 0.
 */
export function settleSum(value: number, expr: unknown, scope: Scope, lookup?: (name: string) => string | undefined): number {
  if (value === 0 || !Number.isFinite(value) || typeof expr !== 'string') return value
  const s = termSize(expr, scope, lookup)
  return Number.isFinite(s) && Math.abs(value) <= s * 1e-9 ? 0 : value
}

export function checkExpr(expr: string): string | null {
  try {
    parse(expr)
    return null
  } catch (e) {
    return (e as Error).message
  }
}
