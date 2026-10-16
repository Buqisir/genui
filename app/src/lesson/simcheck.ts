// Runs a <Sim> body against the real sandbox runtime inside node:vm with a stub
// canvas, so generated code can be smoke-tested without a browser.
import vm from 'node:vm'
import { palette } from '../theme'

/** One arrow drawn with `of`: the quantity's name and the arrow's world-space vector. */
export interface ArrowRecord {
  of: string
  dx: number
  dy: number
}

export interface SimCheckResult {
  errors: string[]
  warnings: string[]
  /** One entry per run, in order: the arrows that run drew, in call order. */
  arrows: { label: string; list: ArrowRecord[] }[]
}

const DRIVER = `
;(() => {
  const DT = 1 / 240
  const leaves = (obj, prefix, out, depth) => {
    if (typeof obj === 'number') { if (!Number.isFinite(obj)) out.push(prefix || '(状态)'); return }
    if (!obj || typeof obj !== 'object' || depth > 3) return
    for (const k of Object.keys(obj)) leaves(obj[k], prefix ? prefix + '.' + k : k, out, depth + 1)
  }
  globalThis.__check = (raw, times) => {
    const def = globalThis.__def
    const res = { nonFinite: [], badState: false, missing: [] }
    if (!def) return res
    const missing = new Set()
    const params = new Proxy(globalThis.__hydrate ? globalThis.__hydrate(raw) : raw, {
      get(target, key) {
        if (typeof key === 'string' && !(key in target) && !(key in Object.prototype) && key !== 'then' && key !== 'toJSON') missing.add(key)
        return target[key]
      },
    })
    let s = null, tt = 0
    for (const t of times) {
      for (const fn of __listeners.message || []) {
        fn({ source: parent, data: { source: 'genui-host', params, t, colors: __colors } })
      }
      try {
        if (def.at) s = def.at(t, params)
        else {
          if (s === null || t < tt) { s = def.init(params); tt = 0 }
          while (tt + DT <= t + 1e-9) { s = def.step(s, DT, params); tt += DT }
        }
      } catch (e) { continue }
      if (s === undefined || s === null) res.badState = true
      const bad = []
      leaves(s, '', bad, 0)
      for (const b of bad) res.nonFinite.push('t=' + t.toFixed(2) + ' ' + b)
    }
    res.missing = [...missing]
    return res
  }
})()
`

// Calls a real canvas rejects with an exception (non-finite numbers are silently ignored instead).
// GENUI_SIM_TIMEOUT_MS only exists for profiling slow lessons; the 2 s default is the real budget.
const SIM_TIMEOUT_MS = Number(process.env.GENUI_SIM_TIMEOUT_MS) || 2000

const negative = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v < 0
const BROWSER_THROWS: Record<string, (...args: unknown[]) => void> = {
  setLineDash: (d) => {
    if (d === null || typeof d !== 'object' || typeof (d as Iterable<unknown>)[Symbol.iterator] !== 'function') {
      throw new TypeError("Failed to execute 'setLineDash' on 'CanvasRenderingContext2D': The provided value cannot be converted to a sequence.")
    }
  },
  arc: (_x, _y, r) => {
    if (negative(r)) throw new RangeError(`Failed to execute 'arc' on 'CanvasRenderingContext2D': The radius provided (${r}) is negative.`)
  },
  arcTo: (_x1, _y1, _x2, _y2, r) => {
    if (negative(r)) throw new RangeError(`Failed to execute 'arcTo' on 'CanvasRenderingContext2D': The radius provided (${r}) is negative.`)
  },
  ellipse: (_x, _y, rx, ry) => {
    if (negative(rx)) throw new RangeError(`Failed to execute 'ellipse' on 'CanvasRenderingContext2D': The major-axis radius provided (${rx}) is negative.`)
    if (negative(ry)) throw new RangeError(`Failed to execute 'ellipse' on 'CanvasRenderingContext2D': The minor-axis radius provided (${ry}) is negative.`)
  },
}

function makeContext() {
  const posts: { type: string; message?: string }[] = []
  const listeners: Record<string, ((e: unknown) => void)[]> = {}
  const ctxState: Record<string | symbol, unknown> = {}
  const ctx2d = new Proxy(ctxState, {
    get(target, prop) {
      if (prop === 'measureText') return (s: unknown) => ({ width: String(s).length * 7 })
      if (typeof prop === 'string' && /^create\w*(Gradient|Pattern)$/.test(prop)) {
        return (...args: unknown[]) => {
          // Browsers throw on non-finite gradient coordinates; mirror that so validation catches it.
          if (prop !== 'createPattern' && args.some((a) => typeof a !== 'number' || !Number.isFinite(a))) {
            throw new TypeError(`Failed to execute '${prop}' on 'CanvasRenderingContext2D': The provided double value is non-finite.`)
          }
          return { addColorStop() {}, setTransform() {} }
        }
      }
      if (prop === 'getLineDash') return () => []
      if (typeof prop === 'string' && BROWSER_THROWS[prop]) return BROWSER_THROWS[prop]
      if (prop in target) return target[prop]
      return () => undefined
    },
    set(target, prop, value) {
      target[prop] = value
      return true
    },
  })
  const canvas = { width: 0, height: 0, style: {}, getContext: () => ctx2d }
  const parent = { postMessage: (msg: { type: string; message?: string }) => posts.push(msg) }
  const colors = palette('light')
  const sandbox: Record<string, unknown> = {
    Math, JSON, Number, Array, Object, String, Boolean, Infinity, NaN, isFinite, isNaN, parseFloat, parseInt,
    console: { log() {}, warn() {}, error() {} },
    document: {
      getElementById: () => canvas,
      documentElement: { clientWidth: 640, clientHeight: 280 },
    },
    parent,
    devicePixelRatio: 2,
    Path2D: class {
      moveTo() {}
      lineTo() {}
      arc(...args: unknown[]) {
        BROWSER_THROWS.arc(...args)
      }
      ellipse(...args: unknown[]) {
        BROWSER_THROWS.ellipse(...args)
      }
      rect() {}
      closePath() {}
    },
    performance: { now: () => 0 },
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => undefined,
    addEventListener: (type: string, fn: (e: unknown) => void) => (listeners[type] ??= []).push(fn),
    __listeners: listeners,
    __colors: colors,
  }
  sandbox.window = sandbox
  sandbox.globalThis = sandbox
  return { context: vm.createContext(sandbox), posts }
}

export function checkSim(
  body: string,
  runtimeSource: string,
  runs: { label: string; params: Record<string, unknown>; times: number[] }[],
): SimCheckResult {
  const errors: string[] = []
  const warnings: string[] = []
  const { context, posts } = makeContext()
  const run = (code: string, what: string) => {
    try {
      return vm.runInContext(code, context, { timeout: SIM_TIMEOUT_MS })
    } catch (e) {
      errors.push(`${what}：${(e as Error).message}`)
      return undefined
    }
  }

  run(runtimeSource, '运行时加载失败')
  run('const __origSim = window.sim; window.sim = (d) => { window.__def = d; __origSim(d) }', '包装 sim')
  if (errors.length) return { errors, warnings, arrows: [] }
  run(body, '课件代码执行出错')
  run(DRIVER, '驱动')
  run('__simReady()', '初始化')
  // Real browsers may resize the frame before the host sends params.
  run('for (const fn of __listeners.resize || []) fn({})', '尺寸变化')
  for (const p of posts) if (p.type === 'error') errors.push(`初始化：${p.message}`)
  if (errors.length) return { errors, warnings, arrows: [] }

  const missingSeen = new Set<string>()
  const arrows: SimCheckResult['arrows'] = []
  for (const r of runs) {
    context.__params = r.params
    context.__times = r.times
    context.__arrowLog = []
    const before = posts.length
    const res = run('__check(__params, __times)', `${r.label} 运行超时或出错`) as
      | { nonFinite: string[]; badState: boolean; missing: string[] }
      | undefined
    const errs = posts.slice(before).filter((p) => p.type === 'error').map((p) => p.message ?? '')
    for (const m of new Set(errs)) errors.push(`${r.label}：${m}`)
    const missing = res?.missing.filter((k) => !missingSeen.has(k)) ?? []
    for (const k of missing) missingSeen.add(k)
    if (missing.length) errors.push(`代码读取了 p.${missing.join('、p.')}，但没有写进 params 列表，读到的是 undefined`)
    if (res?.badState) errors.push(`${r.label}：at/step 返回了空状态`)
    if (res?.nonFinite.length) warnings.push(`${r.label}：状态里出现非有限数 ${res.nonFinite.slice(0, 3).join('；')}`)
    arrows.push({ label: r.label, list: [...((context as Record<string, unknown>).__arrowLog as ArrowRecord[])] })
  }
  return { errors, warnings, arrows }
}
