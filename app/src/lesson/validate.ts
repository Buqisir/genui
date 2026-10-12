import { COLOR_NAMES } from '../theme'
import { symbolsOf } from './expr'
import { parseLesson, type Block, type Props } from './parse'
import { connectedWires, schematicNetlist, schematicSolves, solves, solveWiring, type SchematicNode, WIRING_TYPES, wiringTerminals, type WiringPart, type WiringWire } from './circuit'
import { GASES } from './gas'
import { MOTION_RESERVED, motionOutputs, parseRead } from './motion'
import { forceUnknowns, solveForces } from './forces'
import { validateAxis } from './axis'
import { dynamicsOf } from './dynamics'
import { checkForceDiagram } from './forcecheck'
import { checkMotionExtras } from './motionExtra'
import { checkFieldEntry } from './fieldcheck'
import { gasTubeIssues, runGasTube, specOf } from './gastube'
import { opticsIssues, runOptics } from './optics'
import { fringesIssues, measurementHeadIssues, measurementOf, solveFringeProps } from './fringes'
import { instrumentPropIssues, instrumentScopeIssues } from './instruments'
import { forceSpecOf, motionSpecOf, runMotion } from './solvers'
import { checkPlotPoints, PLOT_SERIES_KEYS } from './plotpoints'
import { runTransient, transientOf, transientReads, transientSpec } from './transient'
import { afterElement, checkSourceChains, extensionChildren, readValueNames, transformerDcWarning, usesLadderBlock, walkSpdt } from './circuitElements'
import { buildRegistry, ParamStore, type ParamDef } from './store'
import { COMPONENTS, type PropKind } from './components'

export interface Issue {
  line?: number
  message: string
}

export interface ValidationResult {
  errors: Issue[]
  warnings: Issue[]
  /** Scope at initial parameter values, when the lesson got that far. */
  scope?: Record<string, number>
}

type Kind = PropKind

export const INSTRUMENT_TYPES = ['vernier', 'micrometer', 'meter', 'ohmmeter', 'resistanceBox', 'measurementHead', 'multimeter', 'springScale'] as const

export { METER_RANGES, WIRING_TYPES, wiringTerminals } from './circuit'

export const COMPONENT_NAMES = Object.keys(COMPONENTS)

const CIRCUIT_TYPES = new Set([
  'battery', 'resistor', 'heater', 'rheostat', 'lamp', 'switch', 'ammeter',
  'voltmeter', 'galvanometer', 'capacitor', 'inductor', 'generator', 'motor', 'thermistor', 'photoresistor', 'wire',
  'currentSource', 'diode', 'phototube', 'transformer',
])
/** Props that only make sense on one schematic part type. */
const CIRCUIT_ONLY: Record<string, string[]> = {
  C: ['capacitor'], U0: ['capacitor'], L: ['inductor'], I0: ['inductor'], power: ['lamp'], lit: ['lamp'],
  I: ['currentSource'], reverse: ['diode', 'phototube'], n1: ['transformer'], n2: ['transformer'], secondary: ['transformer'], secondaries: ['transformer'],
  nu: ['phototube'], lambda: ['phototube'], W: ['phototube'], Isat: ['phototube'],
}
const CIRCUIT_READ: Record<string, string[] | null> = {
  I: null, U: null, P: null, reading: ['ammeter', 'voltmeter', 'galvanometer'], Q: ['capacitor'], lit: ['lamp'],
  U1: ['transformer'], U2: ['transformer'], I1: ['transformer'], I2: ['transformer'],
  Uc: ['phototube'], Ek: ['phototube'],
}
const COLORS = new Set(COLOR_NAMES)
const TONES = new Set(['neutral', 'info', 'success', 'warning', 'danger'])
const FORMATS = new Set(['sci', 'percent'])
const SIZES = new Set(['full', 'wide', 'narrow'])
const LEGEND_KINDS = new Set([...COLOR_NAMES.flatMap((c) => [c, `${c}-dash`]), 'strobe'])

function kindOf(v: unknown): Kind[] {
  if (typeof v === 'string') return ['string', 'expr', 'name']
  if (typeof v === 'number') return Number.isFinite(v) ? ['number'] : []
  if (typeof v === 'boolean') return ['boolean']
  if (Array.isArray(v)) return v.every((x) => typeof x === 'string') ? ['array', 'names'] : ['array']
  if (v && typeof v === 'object') return ['object']
  return []
}

/**
 * Outputs that are NaN by definition when the moment never comes (Motion and transient events,
 * GasTube jaw changes and stop), so a NaN there is not worth a warning; names computed from them still are.
 */
export function eventNames(blocks: Block[]): Set<string> {
  const out = new Set<string>()
  const add = (v: unknown) => typeof v === 'string' && out.add(v)
  const addEvents = (list: unknown) => Array.isArray(list) && list.forEach((e) => add((e as { name?: unknown } | null)?.name))
  for (const b of blocks) {
    if (b.kind !== 'component') continue
    if (b.name === 'Motion') {
      addEvents(b.props.events)
      // Field regions publish entry/exit times the same way; "never entered" has its own solver warning.
      if (Array.isArray(b.props.fields)) for (const f of b.props.fields as { enter?: unknown; exit?: unknown }[]) add(f?.enter), add(f?.exit)
      const tr = b.props.track
      if (tr && typeof tr === 'object' && !Array.isArray(tr)) {
        const t = tr as { leave?: unknown; together?: unknown; slip?: unknown }
        add(t.leave)
        add(t.together)
        add(t.slip)
      }
    }
    if (b.name === 'Circuit' && b.props.transient && typeof b.props.transient === 'object') addEvents((b.props.transient as { events?: unknown }).events)
    if (b.name === 'GasTube') {
      add(b.props.stop)
      if (Array.isArray(b.props.contents)) for (const c of b.props.contents as { leave?: unknown; hit?: unknown }[]) add(c?.leave), add(c?.hit)
    }
  }
  return out
}

export function validateLesson(source: string): ValidationResult {
  const errors: Issue[] = []
  const warnings: Issue[] = []
  const lesson = parseLesson(source)
  for (const e of lesson.errors) errors.push({ line: e.line, message: e.message })

  const meta = lesson.meta
  const required = meta.demo === true ? ['title'] : ['id', 'title', 'question', ...(meta.choice === undefined ? ['answers'] : [])]
  for (const key of required) {
    if (meta[key] === undefined) errors.push({ message: `头信息缺少 ${key}` })
  }
  if (meta.choice !== undefined) {
    const c = String(meta.choice)
    if (!/^[A-H]+$/.test(c) || [...c].sort().join('') !== c || new Set(c).size !== c.length) {
      errors.push({ message: `头信息 choice 写选出的选项字母，多选按字母顺序连写（如 C、BD）：${JSON.stringify(meta.choice)}` })
    }
  }
  if (meta.theme !== undefined && meta.theme !== 'light' && meta.theme !== 'night') {
    errors.push({ message: `头信息 theme 只能是 light 或 night：${String(meta.theme)}` })
  }
  if (meta.breadcrumb !== undefined && !(Array.isArray(meta.breadcrumb) && meta.breadcrumb.every((x) => typeof x === 'string'))) {
    errors.push({ message: '头信息 breadcrumb 应为字符串数组' })
  }

  const reg = buildRegistry(lesson.blocks)
  for (const e of reg.errors) errors.push({ message: e })
  const declared = new Set([...reg.params.map((p) => p.name), ...reg.defines.map((d) => d.name)])
  const params = new Set(reg.params.map((p) => p.name))
  const userNames = new Set<string>([...reg.params.map((p) => p.name), ...reg.defines.filter((d) => !d.solver).map((d) => d.name)])

  const comps = lesson.blocks.filter((b): b is Extract<Block, { kind: 'component' }> => b.kind === 'component')
  for (const b of comps) checkComponent(b, declared, params, errors, warnings, reg.params, userNames)

  const motionCircuits = new Set(
    comps.filter((b) => b.name === 'Motion' && b.props.circuit && typeof b.props.name === 'string').map((b) => String(b.props.name)),
  )
  for (const b of comps) {
    if (b.name === 'Circuit' && typeof b.props.motion === 'string' && !motionCircuits.has(b.props.motion)) {
      errors.push({ line: b.line, message: `<Circuit> motion="${b.props.motion}" 必须指向本课件里带 circuit 的 <Motion>` })
    }
  }

  const SCENES = ['Sim', 'Figure', 'ForceDiagram', 'Circuit', 'Instrument', 'TickerTape', 'EnergyLevels', 'Wiring', 'GasBox', 'GasTube', 'Fringes']
  if (meta.demo !== true && !comps.some((b) => SCENES.includes(b.name))) {
    errors.push({ message: '课件没有画出物理情景：至少要有一个 Sim、Figure、ForceDiagram、Circuit、Instrument、TickerTape、EnergyLevels、Wiring、GasBox、GasTube 或 Fringes（只有 Plot 不够）' })
  }

  let scope: Record<string, number> | undefined
  if (lesson.errors.length === 0 && reg.errors.length === 0) {
    try {
      scope = new ParamStore(reg).getScope()
    } catch (e) {
      errors.push({ message: `初始参数下求值失败：${(e as Error).message}` })
    }
  }

  if (scope) {
    const events = eventNames(lesson.blocks)
    for (const [name, value] of Object.entries(scope)) {
      if (typeof value === 'number' && !Number.isFinite(value) && !events.has(name)) warnings.push({ message: `初始参数下 ${name} = ${value}（不是有限数）` })
    }
    const answers = Array.isArray(meta.answers) ? (meta.answers as { name?: string; value?: number }[]) : []
    if (answers.length === 0 && meta.demo !== true && meta.choice === undefined) errors.push({ message: 'answers 为空' })
    for (const a of answers) {
      if (typeof a.name !== 'string' || typeof a.value !== 'number') {
        errors.push({ message: `answers 条目需要 name 和数值 value：${JSON.stringify(a)}` })
        continue
      }
      if (!(a.name in scope)) {
        errors.push({ message: `answers 里的 ${a.name} 没有对应的 Param/Define，无法核对` })
        continue
      }
      const got: number = scope[a.name]
      const tol = Math.max(1e-6, Math.abs(a.value) * 0.01)
      if (!(Math.abs(got - a.value) <= tol)) {
        errors.push({ message: `答案不一致：${a.name} 按课件公式算出 ${got}，answers 写的是 ${a.value}` })
      }
    }
  }

  if (scope) {
    for (const b of comps) {
      if (b.name === 'Motion') {
        const spec = motionSpecOf(b.props)
        if (!spec) continue
        try {
          const run = runMotion(spec, scope)
          for (const w of run.warnings) warnings.push({ line: b.line, message: `<Motion> 初始参数下：${w}` })
          const reads = Object.values(spec.read ?? {}).join(' ')
          for (const ev of spec.events ?? []) {
            if (!ev.name || run.events[ev.name]?.length || !new RegExp(`(^|[^\\w])${ev.name}($|[^\\w])`).test(reads)) continue
            const noGravity = b.props.charge !== undefined && b.props.forces === undefined
              ? '；带电粒子只受 charge、fields 的力，要受重力就再写 forces: [{label: "G", angle: -90, magnitude: "m*g"}]'
              : ''
            warnings.push({ line: b.line, message: `<Motion> 初始参数下：事件 ${ev.name} 在 until 内没有发生，read 里用到它的读数是 NaN${noGravity}` })
          }
        } catch (e) {
          errors.push({ line: b.line, message: `<Motion> 初始参数下无法积分：${(e as Error).message}` })
        }
        continue
      }
      if (b.name === 'ForceDiagram') {
        const spec = forceSpecOf(b.props)
        if (!forceUnknowns(spec).length) continue
        for (const w of solveForces(spec, scope).warnings) warnings.push({ line: b.line, message: `<ForceDiagram> 初始参数下：${w}` })
        continue
      }
      if (b.name === 'Circuit') {
        const source = b.props.source as SchematicNode
        const load = b.props.load as SchematicNode
        if (!schematicSolves(source, load)) continue
        const tr = transientOf(b.props)
        if (tr) {
          try {
            for (const w of runTransient(transientSpec(source, load, tr), scope).warnings) warnings.push({ line: b.line, message: `<Circuit> 暂态（初始参数下）：${w}` })
          } catch (e) {
            errors.push({ line: b.line, message: `<Circuit> 暂态在初始参数下无法计算：${(e as Error).message}` })
          }
          continue
        }
        const net = schematicNetlist(source, load, scope)
        for (const w of solveWiring(net.parts, net.wires, scope).warnings) warnings.push({ line: b.line, message: `<Circuit> 初始参数下：${w.replace(/「e\d+」/g, '')}` })
        continue
      }
      if (b.name === 'Optics') {
        try {
          for (const w of runOptics(b.props, scope).warnings) warnings.push({ line: b.line, message: `<Optics> 初始参数下：${w}` })
        } catch (e) {
          errors.push({ line: b.line, message: `<Optics> 初始参数下无法计算：${(e as Error).message}` })
        }
        continue
      }
      if (b.name === 'Fringes') {
        for (const w of solveFringeProps(b.props, scope).warnings) warnings.push({ line: b.line, message: `<Fringes> 初始参数下：${w}` })
        continue
      }
      if (b.name === 'Instrument' && b.props.type === 'measurementHead') {
        for (const w of measurementOf(b.props, scope).warnings) warnings.push({ line: b.line, message: `<Instrument> 初始参数下：${w}` })
        continue
      }
      if (b.name === 'Instrument' && (b.props.type === 'multimeter' || b.props.type === 'springScale')) {
        for (const message of instrumentScopeIssues(b.props, scope)) errors.push({ line: b.line, message })
      }
      if (b.name === 'GasTube' && specOf(b.props)) {
        try {
          const run = runGasTube(b.props, scope)
          for (const e of run.errors) errors.push({ line: b.line, message: `<GasTube> ${e}` })
          for (const w of run.warnings) warnings.push({ line: b.line, message: `<GasTube> ${w}` })
        } catch (e) {
          errors.push({ line: b.line, message: `<GasTube> 初始参数下无法计算：${(e as Error).message}` })
        }
        continue
      }
      if (b.name !== 'Wiring' || !Array.isArray(b.props.parts) || !Array.isArray(b.props.wires)) continue
      const parts = b.props.parts as WiringPart[]
      if (!solves(parts)) continue
      const steps = typeof b.props.steps === 'string' ? b.props.steps : null
      for (const w of solveWiring(parts, connectedWires(b.props.wires as WiringWire[], steps, scope), scope).warnings) {
        warnings.push({ line: b.line, message: `<Wiring> 初始参数下：${w}` })
      }
    }
  }

  return { errors, warnings, scope }
}

/** Read names written on a schematic tree, in walk order (including ones inside repeat). */
function schematicReadNames(node: unknown, out: string[] = []): string[] {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return out
  const n = node as Record<string, unknown>
  if (Array.isArray(n.series)) for (const c of n.series) schematicReadNames(c, out)
  if (Array.isArray(n.parallel)) for (const c of n.parallel) schematicReadNames(c, out)
  if (n.item && typeof n.item === 'object') schematicReadNames(n.item, out)
  for (const c of extensionChildren(n as SchematicNode)) schematicReadNames(c, out)
  if (Array.isArray(n.secondaries)) for (const s of n.secondaries as { read?: unknown }[]) for (const name of readValueNames(s?.read)) out.push(name)
  if (typeof n.read === 'string') out.push(n.read)
  else if (n.read && typeof n.read === 'object' && !Array.isArray(n.read)) {
    for (const v of Object.values(n.read as Record<string, unknown>)) if (typeof v === 'string') out.push(v)
  }
  return out
}

interface SchematicWalk {
  err: (message: string) => void
  expr: (value: unknown, where: string, extra?: string[]) => void
  keysOnly: (obj: Record<string, unknown>, allowed: string[], where: string) => void
  /** Names allowed in emf, R, closed and the other solved values. */
  valueNames: string[]
  /** Names allowed in note.expr and lit, which are only drawn. */
  displayNames: string[]
  /** Capacitors and inductors are states: C/L required, and not inside repeat. */
  integrating: boolean
  /** Derived forces and this circuit's own read names: not available while the circuit is being solved. */
  blocked?: Set<string>
}

/** True when some part value of the tree (an AC emf, a timed switch, …) changes with the transient's own `t`. */
function dependsOnT(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  const timed = ['emf', 'closed', 'R', 'r', 'I', 'position'].some((k) => {
    if (typeof n[k] !== 'string') return false
    try {
      return symbolsOf(n[k] as string).includes('t')
    } catch {
      return false
    }
  })
  return (
    timed ||
    ['series', 'parallel'].some((k) => Array.isArray(n[k]) && (n[k] as unknown[]).some(dependsOnT)) ||
    dependsOnT(n.item) ||
    extensionChildren(n as SchematicNode).some(dependsOnT)
  )
}

/** Shared checks for a `<Circuit>` tree and a `<Motion circuit>` tree. */
function walkSchematic(node: unknown, where: string, ctx: SchematicWalk, inRepeat = false): { reads: string[]; storage: number; readSeen: boolean } {
  let storage = 0
  let readSeen = false
  const reads: string[] = []
  const visit = (cur: unknown, at: string, repeated: boolean) => {
    if (!cur || typeof cur !== 'object' || Array.isArray(cur)) return ctx.err(`${at} 应为对象`)
    const n = cur as Record<string, unknown>
    if ('series' in n || 'parallel' in n) {
      const k = 'series' in n ? 'series' : 'parallel'
      ctx.keysOnly(n, [k], at)
      if (!Array.isArray(n[k]) || (n[k] as unknown[]).length === 0) return ctx.err(`${at}.${k} 应为非空数组`)
      for (let i = 0; i < (n[k] as unknown[]).length; i++) visit((n[k] as unknown[])[i], `${at}.${k}[${i}]`, repeated)
      return
    }
    if ('repeat' in n) {
      ctx.keysOnly(n, ['repeat', 'item', 'label'], at)
      ctx.expr(n.repeat, `${at}.repeat`)
      return visit(n.item, `${at}.item`, true)
    }
    if (walkSpdt(n, at, repeated, ctx, visit)) return
    ctx.keysOnly(n, ['type', 'label', 'note', 'closed', 'positive', 'emf', 'r', 'R', 'read', ...Object.keys(CIRCUIT_ONLY)], at)
    const type = String(n.type)
    if (!CIRCUIT_TYPES.has(type)) return ctx.err(`${at}.type 不合法：${type}（可用：${[...CIRCUIT_TYPES].join('、')}）`)
    const exprValue = (value: unknown, w: string) => {
      if (typeof value === 'string' && ctx.blocked?.size) {
        try {
          const bad = symbolsOf(value).filter((s) => ctx.blocked!.has(s))
          if (bad.length) {
            ctx.err(`${w} 不能用 ${bad.join('、')}：电路在受力之前求解，读不到加速度、支持力、拉力或电路自己读数的当前值（这里只能用 t 和状态量）`)
            return
          }
        } catch {
          // expr reports the parse error
        }
      }
      ctx.expr(value, w, ctx.valueNames)
    }
    for (const k of ['emf', 'r', 'R', 'C', 'L', 'U0', 'I0', 'power', 'I', 'n1', 'n2'] as const) if (n[k] !== undefined) exprValue(n[k], `${at}.${k}`)
    if (n.lit !== undefined) ctx.expr(n.lit, `${at}.lit`, ctx.displayNames)
    for (const [k, types] of Object.entries(CIRCUIT_ONLY)) if (n[k] !== undefined && !types.includes(type)) ctx.err(`${at}.${k} 只用于 ${types.join('、')}`)
    if (n.emf !== undefined && type !== 'battery' && type !== 'generator') ctx.err(`${at}.emf 只用于 battery、generator`)
    if ((type === 'battery' || type === 'generator') && ctx.integrating && n.emf === undefined) ctx.err(`${at} 要写 emf（电动势）`)
    if (n.read !== undefined) {
      readSeen = true
      const ok = (q: string) => q in CIRCUIT_READ && (CIRCUIT_READ[q] === null || CIRCUIT_READ[q]!.includes(type))
      if (typeof n.read === 'string') reads.push(n.read)
      else if (n.read && typeof n.read === 'object') for (const v of Object.values(n.read as Record<string, unknown>)) if (typeof v === 'string') reads.push(v)
      if (typeof n.read !== 'string' && !(n.read && typeof n.read === 'object' && Object.entries(n.read as Record<string, unknown>).every(([q, v]) => ok(q) && typeof v === 'string')))
        ctx.err(`${at}.read 写成名字字符串，或 { I: "名字", U: "名字", P: "名字" }（电容还可读 Q，灯泡还可读 lit，电表还可读 reading，变压器读 U1、U2、I1、I2、P，光电管还可读 Uc、Ek）`)
    }
    if (n.note !== undefined) ctx.expr((n.note as Record<string, unknown>)?.expr, `${at}.note.expr`, ctx.displayNames)
    if (typeof n.closed === 'string') {
      exprValue(n.closed, `${at}.closed`)
      if (type !== 'switch') ctx.err(`${at}.closed 只用于 switch`)
    }
    if (type === 'capacitor' || type === 'inductor') {
      storage++
      if (ctx.integrating && repeated) ctx.err(`${at}：电容、线圈不能放在 repeat 里，逐个写出来`)
      const k = type === 'capacitor' ? 'C' : 'L'
      if (ctx.integrating && n[k] === undefined) ctx.err(`${at} 要写${type === 'capacitor' ? '电容 C（单位 F）' : '自感系数 L（单位 H）'}`)
      if (typeof n[k] === 'number' && (n[k] as number) <= 0) ctx.err(`${at}.${k} 应为正数`)
    }
    afterElement(n, at, repeated, ctx, visit, (name) => {
      readSeen = true
      reads.push(name)
    })
  }
  visit(node, where, inRepeat)
  return { reads, storage, readSeen }
}

function checkComponent(
  b: Extract<Block, { kind: 'component' }>,
  declared: Set<string>,
  params: Set<string>,
  errors: Issue[],
  warnings: Issue[],
  paramDefs: ParamDef[] = [],
  userNames: Set<string> = new Set(),
) {
  const line = b.line
  const spec = COMPONENTS[b.name]
  const err = (message: string): void => {
    errors.push({ line, message: `<${b.name}> ${message}` })
  }
  const warn = (message: string): void => {
    warnings.push({ line, message: `<${b.name}> ${message}` })
  }
  if (!spec) {
    err(`不是白名单组件（可用：${COMPONENT_NAMES.join('、')}）`)
    return
  }

  const props = b.props as Props
  for (const [key, ps] of Object.entries(spec)) {
    if (ps.required && props[key] === undefined) err(`缺少属性 ${key}`)
  }
  for (const [key, value] of Object.entries(props)) {
    const ps = spec[key]
    if (!ps) {
      err(`未知属性 ${key}（可用：${Object.keys(spec).join('、')}）`)
      continue
    }
    const want = Array.isArray(ps.kind) ? ps.kind : [ps.kind]
    if (!kindOf(value).some((k) => want.includes(k))) err(`属性 ${key} 类型不对，应为 ${want.join(' 或 ')}`)
  }

  const expr = (value: unknown, where: string, extra: string[] = []) => {
    if (typeof value === 'number') return
    if (typeof value !== 'string') {
      err(`${where} 应为数字或表达式字符串`)
      return
    }
    try {
      for (const s of symbolsOf(value)) {
        if (!declared.has(s) && !extra.includes(s)) err(`${where} 引用了未声明的名字 ${s}：${value}`)
      }
    } catch (e) {
      err(`${where} 表达式无法解析：${value}（${(e as Error).message}）`)
    }
  }
  const nameRef = (value: unknown, where: string, mustBeParam = false) => {
    if (typeof value !== 'string' || !declared.has(value)) err(`${where} 引用了未声明的名字 ${String(value)}`)
    else if (mustBeParam && !params.has(value)) err(`${where} 必须是 Param（Define 不能被设置）：${value}`)
  }
  const sandboxApis = () => {
    if (b.body && /\b(fetch|XMLHttpRequest|WebSocket|import\s*\(|eval\s*\(|Function\s*\(|postMessage|localStorage|document\.cookie)\b/.test(b.body)) {
      err('代码里用了沙箱禁止的 API')
    }
  }
  const list = (key: string) => (Array.isArray(props[key]) ? (props[key] as Record<string, unknown>[]) : [])
  const keysOnly = (obj: Record<string, unknown>, allowed: string[], where: string) => {
    for (const k of Object.keys(obj)) if (!allowed.includes(k)) err(`${where} 有未知字段 ${k}（可用：${allowed.join('、')}）`)
  }
  const color = (v: unknown, where: string) => {
    if (v !== undefined && !COLORS.has(String(v))) err(`${where} 颜色只能是物理量名 ${[...COLORS].join('、')}`)
  }
  const format = (v: unknown, where: string) => {
    if (v !== undefined && !FORMATS.has(String(v))) err(`${where} format 只能是 ${[...FORMATS].join('、')}`)
  }
  const setMap = (v: unknown, where: string) => {
    const set = (v ?? {}) as Record<string, unknown>
    if (Object.keys(set).length === 0) err(`${where} 为空`)
    for (const [k, x] of Object.entries(set)) {
      nameRef(k, `${where}.${k}`, true)
      expr(x, `${where}.${k}`)
    }
  }

  if (props.size !== undefined && !SIZES.has(String(props.size))) err(`size 只能是 ${[...SIZES].join('、')}`)
  list('hud').forEach((h, i) => {
    keysOnly(h, ['symbol', 'label', 'expr', 'unit', 'digits', 'format'], `hud[${i}]`)
    expr(h.expr, `hud[${i}].expr`)
    format(h.format, `hud[${i}]`)
  })
  list('legend').forEach((l, i) => {
    keysOnly(l, ['kind', 'label', 'symbol'], `legend[${i}]`)
    if (typeof l.label !== 'string') err(`legend[${i}] 缺少 label`)
    if (!LEGEND_KINDS.has(String(l.kind))) err(`legend[${i}].kind 不合法：${String(l.kind)}（物理量名，可加 -dash，或 strobe）`)
  })

  switch (b.name) {
    case 'Param': {
      for (const k of ['min', 'max', 'step'] as const) if (props[k] !== undefined) expr(props[k], k)
      color(props.color, 'color')
      format(props.format, 'format')
      if (props.control !== undefined && props.control !== 'stepper' && props.control !== 'slider') err('control 只能是 slider 或 stepper')
      if (props.options) {
        for (const o of list('options')) {
          keysOnly(o, ['label', 'value'], 'options 条目')
          if (typeof o.value !== 'number' || typeof o.label !== 'string') err('options 条目需要 label 和数字 value')
        }
      } else if (!props.hidden && (props.min === undefined || props.max === undefined)) {
        err('滑块需要 min 和 max（或写 hidden / options）')
      }
      if (typeof props.min === 'number' && typeof props.max === 'number' && typeof props.value === 'number') {
        if (props.value < props.min || props.value > props.max) warn(`初始值 ${props.value} 不在 [${props.min}, ${props.max}] 内`)
      }
      break
    }
    case 'Preset':
      setMap(props.set, 'set')
      break
    case 'Question':
      if (props.set !== undefined) setMap(props.set, 'set')
      break
    case 'Readout':
      for (const it of list('items')) {
        keysOnly(it, ['label', 'expr', 'unit', 'digits', 'symbol', 'color', 'format'], 'items 条目')
        if (typeof it.label !== 'string') err('items 条目缺少 label')
        expr(it.expr, `items「${String(it.label)}」.expr`)
        color(it.color, `items「${String(it.label)}」`)
        format(it.format, `items「${String(it.label)}」`)
      }
      break
    case 'Answer':
      for (const it of list('items')) {
        keysOnly(it, ['label', 'symbol', 'expr', 'value', 'text', 'unit', 'digits', 'format'], 'items 条目')
        if (typeof it.label !== 'string') err('items 条目缺少 label')
        if (it.text !== undefined && typeof it.text !== 'string') err(`items「${String(it.label)}」.text 应为字符串`)
        if (it.expr === undefined && typeof it.value !== 'number' && typeof it.text !== 'string') err(`items「${String(it.label)}」需要 expr、数字 value 或文字 text`)
        if (it.expr !== undefined) expr(it.expr, `items「${String(it.label)}」.expr`)
        if (it.value !== undefined && typeof it.value !== 'number') err(`items「${String(it.label)}」.value 应为数字`)
        format(it.format, `items「${String(it.label)}」`)
      }
      break
    case 'Status': {
      const cases = list('cases')
      cases.forEach((c, i) => {
        keysOnly(c, ['when', 'label', 'tone'], 'cases 条目')
        if (typeof c.label !== 'string') err('cases 条目缺少 label')
        if (c.when !== undefined) expr(c.when, `cases[${i}].when`)
        if (c.tone !== undefined && !TONES.has(String(c.tone))) err(`tone 只能是 ${[...TONES].join('、')}`)
      })
      if (cases.length && cases[cases.length - 1].when !== undefined) warn('最后一条 case 最好不写 when，作为兜底')
      break
    }
    case 'Plot': {
      const x = (props.x ?? {}) as Record<string, unknown>
      const y = (props.y ?? {}) as Record<string, unknown>
      keysOnly(x, ['name', 'label', 'unit', 'min', 'max'], 'x')
      keysOnly(y, ['label', 'unit', 'min', 'max'], 'y')
      const xName = typeof x.name === 'string' ? x.name : 'x'
      if (x.min === undefined || x.max === undefined) err('x 需要 min 和 max')
      for (const k of ['min', 'max']) {
        if (x[k] !== undefined) expr(x[k], `x.${k}`)
        if (y[k] !== undefined) expr(y[k], `y.${k}`)
      }
      for (const s of list('series')) {
        keysOnly(s, [...PLOT_SERIES_KEYS], 'series 条目')
        if (s.points !== undefined) {
          checkPlotPoints(s, { err, expr, keysOnly })
          color(s.color, `series「${String(s.label)}」`)
          continue
        }
        const over = s.over as Record<string, unknown> | undefined
        if (over !== undefined) {
          if (!over || typeof over !== 'object' || Array.isArray(over)) {
            err(`series「${String(s.label)}」.over 应为 {name, min, max}`)
          } else {
            keysOnly(over, ['name', 'min', 'max'], `series「${String(s.label)}」.over`)
            if (typeof over.name !== 'string' || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(over.name)) err(`series「${String(s.label)}」.over.name 应为局部变量名`)
            if (s.x === undefined) err(`series「${String(s.label)}」写了 over 就要写 x（这条曲线的横坐标）`)
            else expr(s.x, `series「${String(s.label)}」.x`, [String(over.name)])
            expr(s.expr, `series「${String(s.label)}」`, [xName, String(over.name)])
            if (over.min !== undefined) expr(over.min, `series「${String(s.label)}」.over.min`)
            if (over.max !== undefined) expr(over.max, `series「${String(s.label)}」.over.max`)
            if (over.min === undefined || over.max === undefined) err(`series「${String(s.label)}」.over 需要 min 和 max`)
          }
          if (s.point !== undefined) nameRef(s.point, `series「${String(s.label)}」.point`)
        } else {
          if (s.x !== undefined || s.point !== undefined) err(`series「${String(s.label)}」的 x、point 要和 over 一起写`)
          if (s.fit !== undefined || s.marker !== undefined || s.line !== undefined || s.read !== undefined) {
            err(`series「${String(s.label)}」写了 marker、line、fit 或 read 就要写 points`)
          }
          expr(s.expr, `series「${String(s.label)}」`, [xName])
        }
        color(s.color, `series「${String(s.label)}」`)
      }
      const nSeries = list('series').length
      const seriesIndex = (v: unknown, where: string) => {
        if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v >= nSeries) err(`${where} 超出范围：${String(v)}`)
      }
      for (const m of list('marks')) {
        keysOnly(m, ['x', 'y', 'series', 'label'], 'marks 条目')
        expr(m.x, `marks「${String(m.label)}」.x`)
        if (m.y !== undefined) expr(m.y, `marks「${String(m.label)}」.y`)
        if (m.series !== undefined) seriesIndex(m.series, 'marks.series')
      }
      list('areas').forEach((a, i) => {
        keysOnly(a, ['series', 'to', 'from', 'until', 'label', 'color'], `areas[${i}]`)
        seriesIndex(a.series, `areas[${i}].series`)
        if (a.to !== undefined) seriesIndex(a.to, `areas[${i}].to`)
        expr(a.from, `areas[${i}].from`)
        expr(a.until, `areas[${i}].until`)
        color(a.color, `areas[${i}]`)
      })
      if (props.cursor !== undefined) nameRef(props.cursor, 'cursor')
      break
    }
    case 'Bars': {
      const x = (props.x ?? {}) as Record<string, unknown>
      const y = (props.y ?? {}) as Record<string, unknown>
      keysOnly(x, ['name', 'label', 'unit', 'min', 'max'], 'x')
      keysOnly(y, ['label', 'unit', 'min', 'max'], 'y')
      const xName = typeof x.name === 'string' ? x.name : 'n'
      if (x.min === undefined || x.max === undefined) err('x 需要 min 和 max')
      for (const k of ['min', 'max']) {
        if (x[k] !== undefined) expr(x[k], `x.${k}`)
        if (y[k] !== undefined) expr(y[k], `y.${k}`)
      }
      expr(props.expr, 'expr', [xName])
      for (const m of list('marks')) {
        keysOnly(m, ['x', 'label', 'style'], 'marks 条目')
        expr(m.x, `marks「${String(m.label)}」.x`)
        if (m.style !== undefined && m.style !== 'solid' && m.style !== 'outline') err('marks.style 只能是 solid 或 outline')
      }
      if (props.cursor !== undefined) nameRef(props.cursor, 'cursor')
      color(props.color, 'color')
      break
    }
    case 'Ledger': {
      const parts = list('parts')
      if (parts.length === 0) err('parts 为空')
      parts.forEach((p, i) => {
        keysOnly(p, ['label', 'symbol', 'expr', 'color'], `parts[${i}]`)
        if (typeof p.label !== 'string') err(`parts[${i}] 缺少 label`)
        expr(p.expr, `parts[${i}].expr`)
        color(p.color, `parts[${i}]`)
      })
      list('rows').forEach((r, i) => {
        keysOnly(r, ['label', 'note', 'at'], `rows[${i}]`)
        if (typeof r.label !== 'string') err(`rows[${i}] 缺少 label`)
        if (r.at !== undefined) setMap(r.at, `rows[${i}].at`)
      })
      for (const k of ['total', 'headline'] as const) {
        const o = props[k] as Record<string, unknown> | undefined
        if (!o) continue
        keysOnly(o, ['label', 'symbol', 'expr', 'unit', 'digits', 'format'], k)
        expr(o.expr, `${k}.expr`)
        format(o.format, k)
      }
      break
    }
    case 'Dial': {
      expr(props.expr, 'expr')
      expr(props.min, 'min')
      expr(props.max, 'max')
      color(props.color, 'color')
      list('arcs').forEach((a, i) => {
        keysOnly(a, ['from', 'to', 'color', 'label'], `arcs[${i}]`)
        expr(a.from, `arcs[${i}].from`)
        expr(a.to, `arcs[${i}].to`)
        color(a.color, `arcs[${i}]`)
      })
      list('footer').forEach((f, i) => {
        keysOnly(f, ['label', 'from', 'to', 'color'], `footer[${i}]`)
        if (typeof f.label !== 'string') err(`footer[${i}] 缺少 label`)
        expr(f.from, `footer[${i}].from`)
        if (f.to !== undefined) expr(f.to, `footer[${i}].to`)
        color(f.color, `footer[${i}]`)
      })
      break
    }
    case 'Instrument': {
      const type = String(props.type)
      if (!(INSTRUMENT_TYPES as readonly string[]).includes(type)) err(`type 不合法：${type}（可用：${INSTRUMENT_TYPES.join('、')}）`)
      expr(props.value, 'value')
      for (const k of ['range', 'mid', 'multiplier', 'max', 'angle'] as const) if (props[k] !== undefined) expr(props[k], k)
      if (Array.isArray(props.scales)) (props.scales as unknown[]).forEach((s, i) => expr(s, `scales[${i}]`))
      if (props.divisions !== undefined && type === 'vernier' && ![10, 20, 50].includes(Number(props.divisions))) err('游标卡尺 divisions 只能是 10、20 或 50')
      if (Array.isArray(props.decades) && !(props.decades as unknown[]).every((d) => typeof d === 'number' && d > 0)) err('decades 应为正数数组，如 [1000, 100, 10, 1]')
      if (type === 'meter' && props.scales === undefined && props.range === undefined) err('电表需要 range 或 scales')
      color(props.color, 'color')
      instrumentPropIssues(props, err)
      if (type === 'measurementHead') measurementHeadIssues(props, declared, userNames, err, expr, keysOnly)
      else if (props.fringes !== undefined || props.pair !== undefined || props.read !== undefined) err('fringes、pair、read 只用于 type="measurementHead"')
      break
    }
    case 'TickerTape': {
      if ((props.expr === undefined) === (props.positions === undefined)) err('expr 和 positions 二选一')
      if (props.expr !== undefined) expr(props.expr, 'expr', ['t'])
      if (Array.isArray(props.positions)) {
        if (props.positions.length < 2) err('positions 至少 2 个点')
        ;(props.positions as unknown[]).forEach((p, i) => expr(p, `positions[${i}]`))
      }
      for (const k of ['count', 'interval', 'start'] as const) if (props[k] !== undefined) expr(props[k], k)
      if (typeof props.labels === 'string' && !['letters', 'numbers'].includes(props.labels)) err('labels 只能是 letters、numbers 或字符串数组')
      color(props.color, 'color')
      break
    }
    case 'EnergyLevels': {
      const levels = list('levels')
      const keys = new Set<string>()
      levels.forEach((l, i) => {
        keysOnly(l, ['n', 'E', 'label'], `levels[${i}]`)
        expr(l.E, `levels[${i}].E`)
        keys.add(String(l.n ?? i + 1).replace(/^(inf|infinity|Infinity)$/, '∞'))
      })
      if (props.levels === undefined) {
        const count = typeof props.count === 'number' ? props.count : 6
        for (let k = 1; k <= Math.max(2, Math.min(8, count)); k++) keys.add(String(k))
        keys.add('∞')
      } else if (levels.length < 2) err('levels 至少两个能级')
      if (props.count !== undefined) {
        if (props.levels !== undefined) err('count 只配合内置氢原子能级使用，写了 levels 就不要 count')
        else expr(props.count, 'count')
      }
      list('transitions').forEach((t, i) => {
        keysOnly(t, ['from', 'to', 'label'], `transitions[${i}]`)
        for (const end of ['from', 'to'] as const) {
          const k = String(t[end]).replace(/^(inf|infinity|Infinity)$/, '∞')
          if (!keys.has(k)) err(`transitions[${i}].${end} 不是已有能级：${String(t[end])}`)
        }
      })
      if (props.transitions !== undefined && props.allFrom !== undefined) err('transitions 和 allFrom 二选一')
      for (const k of ['allFrom', 'select', 'workFunction'] as const) if (props[k] !== undefined) expr(props[k], k)
      if (props.visible === true && props.unit !== undefined && props.unit !== 'eV') err('visible 只在能量单位是 eV 时可用（按 1.62–3.11 eV 判断可见光）')
      if (props.spectrum && typeof props.spectrum === 'object') {
        const spec = props.spectrum as Record<string, unknown>
        keysOnly(spec, ['from', 'to', 'series'], 'spectrum')
        for (const k of ['from', 'to'] as const) if (spec[k] !== undefined) expr(spec[k], `spectrum.${k}`)
        if (spec.series !== undefined && spec.series !== 'visible') err('spectrum.series 目前只能是 visible（可见光窗口 380–760 nm）')
      }
      if ((props.spectrum || props.absorption === true) && props.unit !== undefined && props.unit !== 'eV') err('spectrum 和 absorption 只在能量单位是 eV 时可用（波长按 1240 nm·eV / ΔE）')
      break
    }
    case 'Wiring': {
      const parts = list('parts')
      const types = new Map<string, Record<string, unknown>>()
      parts.forEach((p, i) => {
        keysOnly(p, ['id', 'type', 'x', 'y', 'label', 'ranges', 'value', 'slider', 'closed', 'lit', 'decades', 'emf', 'r', 'R', 'full', 'power', 'read', 'positive', 'terminals'], `parts[${i}]`)
        const id = p.id
        if (typeof id !== 'string' || !id || id.includes('.')) return err(`parts[${i}].id 应为不含「.」的字符串`)
        if (types.has(id)) err(`parts 里 id 重复：${id}`)
        if (!(WIRING_TYPES as readonly string[]).includes(String(p.type))) err(`parts[${i}].type 不合法：${String(p.type)}（可用：${WIRING_TYPES.join('、')}）`)
        if ((p.x === undefined) !== (p.y === undefined)) err(`parts[${i}] 的 x、y 要么都写，要么都不写（自动排布）`)
        for (const k of ['value', 'slider', 'lit'] as const) if (p[k] !== undefined) expr(p[k], `parts「${id}」.${k}`)
        if (typeof p.closed === 'string') expr(p.closed, `parts「${id}」.closed`)
        for (const k of ['emf', 'r', 'R', 'full', 'power'] as const) if (p[k] !== undefined) expr(p[k], `parts「${id}」.${k}`)
        const allowed: Record<string, string[]> = {
          emf: ['battery'],
          r: ['battery', 'ammeter', 'voltmeter', 'galvanometer'],
          R: ['resistor', 'lamp', 'rheostat'],
          full: ['galvanometer'],
          power: ['lamp'],
        }
        for (const [k, ts] of Object.entries(allowed)) {
          if (p[k] !== undefined && !ts.includes(String(p.type))) err(`parts「${id}」.${k} 只用于 ${ts.join('、')}`)
        }
        for (const k of ['r', 'R', 'full', 'power'] as const) if (typeof p[k] === 'number' && (p[k] as number) < 0) err(`parts「${id}」.${k} 不能是负数`)
        if (p.positive !== undefined) {
          if (p.type !== 'battery') err(`parts「${id}」.positive 只用于 battery`)
          else if (p.positive !== 'left' && p.positive !== 'right') err(`parts「${id}」.positive 只能是 left 或 right`)
        }
        if (p.terminals !== undefined) {
          if (p.type !== 'galvanometer') err(`parts「${id}」.terminals 只用于 galvanometer`)
          else if (!Array.isArray(p.terminals) || p.terminals.length < 2 || !(p.terminals as unknown[]).every((s) => typeof s === 'string' && String(s).trim())) {
            err(`parts「${id}」.terminals 应为至少两个接线柱名字，如 ["-", "G0", "G1"]`)
          }
        }
        if (p.read !== undefined) {
          const ok =
            typeof p.read === 'string' ||
            (!!p.read && typeof p.read === 'object' && !Array.isArray(p.read) &&
              Object.entries(p.read).every(([q, n]) => ['I', 'U', 'P', 'lit', 'reading'].includes(q) && typeof n === 'string'))
          if (!ok) err(`parts「${id}」.read 写成名字字符串（电表读数），或 { I: "名字", U: "名字", P: "名字" }`)
        }
        types.set(id, p)
      })
      const solving = solves(parts as WiringPart[])
      if (!solving && parts.some((p) => p.read !== undefined)) err('read 需要电路能求解：给电源写上 emf（以及内阻 r）')
      if (solving) {
        for (const p of parts) {
          const id = String(p.id)
          if (['ammeter', 'voltmeter', 'galvanometer'].includes(String(p.type)) && p.value !== undefined) err(`parts「${id}」：电源写了 emf 后电表读数由电路求出，去掉 value（要用读数就写 read）`)
          if (p.type === 'lamp' && p.lit !== undefined) err(`parts「${id}」：电源写了 emf 后灯的亮度由电路求出，去掉 lit（可写 power 额定功率）`)
          if ((p.type === 'resistor' || p.type === 'lamp') && p.R === undefined) warnings.push({ line: b.line, message: `<Wiring> parts「${id}」没写 R，按 10 Ω 计算` })
          if (p.type === 'resistanceBox' && p.value === undefined) err(`parts「${id}」：电阻箱要写 value（阻值）`)
        }
      }
      list('wires').forEach((w, i) => {
        keysOnly(w, ['from', 'to', 'answer', 'when', 'color', 'note'], `wires[${i}]`)
        if (props.steps !== undefined && w.answer) err(`wires[${i}]：逐根接线（steps）时不要再写 answer，所有导线都按顺序接上`)
        if (w.note !== undefined && typeof w.note !== 'string') err(`wires[${i}].note 应为字符串`)
        for (const end of ['from', 'to'] as const) {
          const ref = String(w[end] ?? '')
          const dot = ref.indexOf('.')
          const id = dot < 0 ? ref : ref.slice(0, dot)
          const t = dot < 0 ? '' : ref.slice(dot + 1).replace('−', '-')
          const p = types.get(id)
          if (!p) {
            err(`wires[${i}].${end} 找不到元件：${ref}（写成「元件id.接线柱」，如 "A.0.6"）`)
            continue
          }
          const names = wiringTerminals(String(p.type), p.ranges, p.terminals)
          if (!names.includes(t)) err(`wires[${i}].${end}：${id} 没有接线柱「${t}」（可用：${names.join('、')}）`)
        }
        if (w.when !== undefined) expr(w.when, `wires[${i}].when`)
        color(w.color, `wires[${i}]`)
      })
      if (props.steps !== undefined) nameRef(props.steps, 'steps', true)
      break
    }
    case 'Motion': {
      const state = (props.state ?? {}) as Record<string, unknown>
      const IDENT = /^[A-Za-z][A-Za-z0-9_]*$/
      const dyn = dynamicsOf(props)
      const frictionEvents: string[] = []
      if (props.bodies !== undefined && (props.forces !== undefined || props.mass !== undefined || props.along !== undefined))
        err('bodies 和 forces/mass/along 二选一：多个物体时每个物体在 bodies 里写自己的 mass、along、forces')
      if (props.ropes !== undefined && props.bodies === undefined) err('ropes 只和 bodies 一起用')
      if (props.track !== undefined && (props.bodies !== undefined || props.along !== undefined || props.ropes !== undefined))
        err('track 不能和 bodies、along、ropes 一起写')
      if (!dyn) {
        if (props.state === undefined) err('缺少属性 state')
        if (props.rates === undefined) err('缺少属性 rates（或者写 mass + forces，让组件按 ΣF = ma 推出运动方程；带电粒子写 mass + charge + fields）')
      }
      // Names the dynamics makes: body x/v, accelerations, solved forces and tensions.
      const bodyNames = dyn ? Object.keys(dyn.state).filter((k) => !k.startsWith('__')) : []
      const derivedNames = dyn?.derived ?? []
      const vars = [...bodyNames, ...Object.keys(state)]
      if (!vars.length) err('state 至少要有一个状态量，如 {x: 0, v: "v0"}')
      for (const v of Object.keys(state)) {
        if (!IDENT.test(v)) err(`state 的名字不合法：${v}`)
        if (MOTION_RESERVED.has(v)) err(`state 不能叫 ${v}（t 是时间，tEnd 是结束时刻）`)
        if (bodyNames.includes(v)) err(`state.${v} 与 bodies 自动生成的状态量重名（物体 A 的位置、速度叫 xA、vA）`)
        expr(state[v], `state.${v}`)
      }
      // The circuit is solved before the forces, so its expressions see t and the state only.
      let circuitReads: string[] = []
      if (props.circuit !== undefined) {
        const c = props.circuit as Record<string, unknown>
        if (!c || typeof c !== 'object' || Array.isArray(c)) err('circuit 应为 {source, load}')
        else {
          keysOnly(c, ['source', 'load'], 'circuit')
          if (c.source === undefined || c.load === undefined) err('circuit 里 source 和 load 都要写')
          else {
            circuitReads = [...schematicReadNames(c.source), ...schematicReadNames(c.load)]
            const dup = circuitReads.filter((r, i) => circuitReads.indexOf(r) !== i)
            if (dup.length) err(`电路 read 的名字重复：${[...new Set(dup)].join('、')}`)
            for (const r of circuitReads) {
              if (vars.includes(r)) err(`电路 read 的名字 ${r} 与状态量重名`)
              if (derivedNames.includes(r)) err(`电路 read 的名字 ${r} 与受力解出的量重名`)
              if (declared.has(r)) err(`电路 read 的名字 ${r} 与课件里已声明的名字重名`)
            }
            const valueNames = ['t', ...vars]
            const displayNames = ['t', ...vars, ...derivedNames, ...circuitReads]
            const blocked = new Set([...derivedNames, ...circuitReads])
            const walk = { err, expr, keysOnly, valueNames, displayNames, integrating: true, blocked }
            walkSchematic(c.source, 'circuit.source', walk)
            walkSchematic(c.load, 'circuit.load', walk)
            checkSourceChains(c.source, c.load, true, err)
            if (!schematicSolves(c.source as SchematicNode, c.load as SchematicNode)) err('circuit 需要电源写上 emf，或用电流源 currentSource')
          }
        }
      }
      const motionLocal = [...vars, 't', ...derivedNames, ...circuitReads]
      if (dyn) {
        const local = motionLocal
        if (dyn.mode === 'free') {
          for (const k of ['x', 'y', 'vx', 'vy']) if (!(k in state)) err(`只写 forces、不写 along 时物体在平面内自由运动，state 要有 x、y、vx、vy（缺 ${k}）`)
        } else if (dyn.mode === 'line') {
          for (const k of ['x', 'v']) if (!(k in state)) err(`写了 along 时物体沿直线运动，state 要有 x（沿 along 方向的位移）和 v（缺 ${k}）`)
        } else if (dyn.mode === 'track') {
          if (props.mass === undefined) err('沿轨道运动要写 mass')
          for (const k of ['s', 'v']) if (!(k in state)) err(`沿轨道运动时 state 要有 s（弧长）和 v（缺 ${k}）`)
        }
        for (const d of derivedNames) {
          if (declared.has(d)) err(`${d} 是组件算出的随时间变化的量，与课件里已声明的名字重名`)
          if (vars.includes(d)) err(`${d} 与状态量重名`)
        }
        if (new Set(derivedNames).size !== derivedNames.length) err(`solve 的名字有重复：${derivedNames.join('、')}`)
        if (dyn.mode === 'track') {
          const frozen = (value: unknown, where: string) => {
            if (typeof value === 'number') return
            if (typeof value !== 'string') {
              err(`${where} 应为数字或表达式字符串`)
              return
            }
            const banned = new Set(['t', ...vars, ...derivedNames])
            try {
              for (const s of symbolsOf(value)) {
                if (banned.has(s)) err(`${where} 用了 ${s}：轨道在一次运动里不变，只能用参数`)
                else if (!declared.has(s)) err(`${where} 引用了未声明的名字 ${s}：${value}`)
              }
            } catch (e) {
              err(`${where} 表达式无法解析：${value}（${(e as Error).message}）`)
            }
          }
          const trackEvent = (name: unknown, where: string) => {
            if (name === undefined) return
            if (typeof name !== 'string' || !IDENT.test(name)) {
              err(`${where} 应为事件名字`)
              return
            }
            if (MOTION_RESERVED.has(name)) err(`${where} 不能叫 ${name}（t 是时间，tEnd 是结束时刻）`)
            else if (vars.includes(name) || derivedNames.includes(name)) err(`${where} 的名字 ${name} 与状态量或组件算出的量重名`)
            else if (frictionEvents.includes(name)) err(`${where} 的名字 ${name} 与其他事件重名`)
            else frictionEvents.push(name)
          }
          const checkEnd = (v: unknown, where: string) => {
            if (v === undefined || v === 'fly' || v === 'stop') return
            const o = v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
            if (!o) {
              err(`${where} 只能是 "fly"、"stop" 或 {bounce: 表达式}`)
              return
            }
            keysOnly(o, ['bounce'], where)
            if (o.bounce === undefined) err(`${where} 要写 bounce（反弹系数）`)
            else expr(o.bounce, `${where}.bounce`, local)
          }
          const tr = props.track as Record<string, unknown>
          if (!tr || typeof tr !== 'object' || Array.isArray(tr)) err('track 应为对象')
          else {
            keysOnly(tr, ['pieces', 'pipe', 'flip', 'normal', 'friction', 'leave', 'together', 'slip', 'start', 'end'], 'track')
            for (const flag of ['pipe', 'flip'] as const) if (tr[flag] !== undefined && typeof tr[flag] !== 'boolean') err(`track.${flag} 应为布尔值`)
            for (const key of ['normal', 'friction'] as const) {
              if (tr[key] === undefined) continue
              if (typeof tr[key] !== 'string' || !IDENT.test(tr[key] as string)) err(`track.${key} 应为名字`)
              else if (MOTION_RESERVED.has(tr[key] as string)) err(`track.${key} 不能叫 ${tr[key]}`)
            }
            trackEvent(tr.leave, 'track.leave')
            trackEvent(tr.together, 'track.together')
            trackEvent(tr.slip, 'track.slip')
            checkEnd(tr.start, 'track.start')
            checkEnd(tr.end, 'track.end')
            if (!Array.isArray(tr.pieces) || tr.pieces.length === 0) err('track.pieces 应为非空数组')
            else tr.pieces.forEach((item, i) => {
              const fw = `track.pieces[${i}]`
              if (!item || typeof item !== 'object' || Array.isArray(item)) return err(`${fw} 应为对象`)
              const p = item as Record<string, unknown>
              keysOnly(p, ['line', 'arc', 'mu', 'static', 'pipe', 'flip', 'hatch', 'dash'], fw)
              const hasL = p.line !== undefined
              const hasA = p.arc !== undefined
              if (hasL === hasA) err(`${fw} 要恰好写 line 或 arc 一个`)
              const coords = (arr: unknown, n: number, what: string) => {
                if (!Array.isArray(arr) || arr.length !== n) {
                  err(`${fw}.${what} 应为 ${n} 个数或表达式`)
                  return
                }
                arr.forEach((c, ci) => frozen(c, `${fw}.${what}[${ci}]`))
              }
              if (hasL) coords(p.line, 4, 'line')
              if (hasA) {
                coords(p.arc, 5, 'arc')
                const r = Array.isArray(p.arc) ? p.arc[2] : undefined
                if (typeof r === 'number' && !(r > 0)) err(`${fw}.arc 的半径应为正数`)
              }
              if (p.mu !== undefined) frozen(p.mu, `${fw}.mu`)
              if (p.static !== undefined) frozen(p.static, `${fw}.static`)
              for (const flag of ['pipe', 'flip', 'hatch'] as const) {
                if (p[flag] !== undefined && typeof p[flag] !== 'boolean') err(`${fw}.${flag} 应为布尔值`)
              }
            })
          }
          if (props.mass !== undefined) expr(props.mass, 'mass', local)
          if (props.forces !== undefined && !Array.isArray(props.forces)) err('forces 应为数组')
          ;(Array.isArray(props.forces) ? props.forces : []).forEach((f, j) => {
            const fw = `forces[${j}]`
            if (!f || typeof f !== 'object') return err(`${fw} 应为对象`)
            const force = f as Record<string, unknown>
            keysOnly(force, ['label', 'angle', 'magnitude', 'solve', 'friction'], fw)
            if (force.solve !== undefined || force.friction !== undefined) {
              err('沿轨道运动时支持力、摩擦力由组件算：不要在 forces 里写 solve / friction，摩擦因数写在 pieces 的 mu')
              return
            }
            expr(force.magnitude, `${fw}.magnitude`, local)
            expr(force.angle, `${fw}.angle`, local)
          })
        } else if (dyn.mode === 'axis') {
          validateAxis(props, { err, expr, keysOnly, declared, vars, derived: derivedNames, circuitReads, local })
        } else {
        const bodyList = dyn.mode === 'bodies' ? list('bodies') : [props as Record<string, unknown>]
        const names = dyn.mode === 'bodies' ? bodyList.map((b) => b.name) : []
        if (dyn.mode === 'bodies') {
          if (!bodyList.length) err('bodies 至少要有一个物体')
          names.forEach((nm, i) => {
            if (typeof nm !== 'string' || !/^[A-Za-z][A-Za-z0-9]*$/.test(nm)) err(`bodies[${i}].name 应为字母开头的短名字（如 A、B）`)
            else if (names.indexOf(nm) !== i) err(`bodies 里物体名字重复：${nm}`)
          })
        }
        bodyList.forEach((b, i) => {
          const where = dyn.mode === 'bodies' ? `bodies[${i}]` : ''
          const at = (k: string) => (where ? `${where}.${k}` : k)
          if (dyn.mode === 'bodies') keysOnly(b, ['name', 'mass', 'along', 'x', 'v', 'forces', 'label', 'tip', 'aFrame', 'frame'], where)
          if (b.mass === undefined) err(`${at('mass')} 缺少：按 ΣF = ma 算加速度需要质量`)
          else expr(b.mass, at('mass'), local)
          if (dyn.mode === 'bodies' && b.along === undefined) err(`${at('along')} 缺少：每个物体沿哪个方向运动（度，从水平向右逆时针量）`)
          if (b.along !== undefined) expr(b.along, at('along'), local)
          for (const k of ['x', 'v']) if (b[k] !== undefined && dyn.mode === 'bodies') expr(b[k], at(k))
          const forces = Array.isArray(b.forces) ? (b.forces as Record<string, unknown>[]) : []
          if (!Array.isArray(b.forces) && !(dyn.mode === 'free' && Array.isArray(props.fields))) err(`${at('forces')} 应为数组`)
          let unknowns = 0
          forces.forEach((f, j) => {
            const fw = `${at('forces')}[${j}]`
            if (!f || typeof f !== 'object') return err(`${fw} 应为对象`)
            keysOnly(f, ['label', 'angle', 'magnitude', 'solve', 'friction', 'buoyancy'], fw)
            if (f.buoyancy !== undefined && f.friction !== undefined) return err(`${fw} 不能同时是浮力和摩擦力`)
            if (f.friction !== undefined) {
              if (dyn.mode === 'free') return err(`${fw}.friction：摩擦力要有接触面，写 along 让物体沿直线（斜面、地面）运动`)
              const fr = f.friction as Record<string, unknown>
              keysOnly(fr, ['mu', 'static', 'normal', 'with', 'slip', 'together', 'belt'], `${fw}.friction`)
              for (const k of ['slip', 'together'] as const) {
                if (fr[k] === undefined) continue
                if (typeof fr[k] !== 'string' || !IDENT.test(fr[k] as string)) err(`${fw}.friction.${k} 应为事件名字`)
                else frictionEvents.push(fr[k] as string)
              }
              if (f.angle !== undefined || f.magnitude !== undefined) err(`${fw} 是摩擦力：方向和大小由组件按相对运动判断，不要写 angle、magnitude`)
              if (fr.mu === undefined) err(`${fw}.friction.mu 缺少（动摩擦因数）`)
              else expr(fr.mu, `${fw}.friction.mu`, local)
              if (fr.static !== undefined) expr(fr.static, `${fw}.friction.static`, local)
              if (fr.normal === undefined) err(`${fw}.friction.normal 缺少（正压力，通常写支持力 solve 出的名字）`)
              else expr(fr.normal, `${fw}.friction.normal`, local)
              if (fr.with !== undefined && fr.with !== 'ground' && !names.includes(fr.with)) err(`${fw}.friction.with 应为另一个物体的名字或 ground`)
              if (fr.with === b.name && fr.with !== undefined) err(`${fw}.friction.with 不能是自己`)
              if (f.solve !== undefined && typeof f.solve !== 'string') err(`${fw}.solve 写成名字：摩擦力（沿 +x 为正）`)
              return
            }
            if (f.buoyancy !== undefined) {
              if (f.magnitude !== undefined) err(`${fw} 是浮力：大小由 ρ、V 和有效重力算出，不要写 magnitude`)
              if (f.solve !== undefined && typeof f.solve !== 'string') err(`${fw}.solve 写成名字，用来发布浮力的大小`)
              expr(f.angle, `${fw}.angle`, local)
              return
            }
            if (f.solve !== undefined) {
              if (dyn.mode === 'free') err(`${fw}.solve：自由运动没有约束力可解，所有力都要给出大小和方向`)
              if (typeof f.solve !== 'string') err(`${fw}.solve 在 <Motion> 里只能求大小（写成名字），方向要给出`)
              if (f.magnitude !== undefined) err(`${fw} 的 magnitude 既给了值又要求解，二选一`)
              unknowns++
            } else expr(f.magnitude, `${fw}.magnitude`, local)
            expr(f.angle, `${fw}.angle`, local)
          })
          if (unknowns > 1) err(`${where || '物体'} 最多一个力写 solve（垂直于运动方向只有一个平衡方程）`)
        })
        list('ropes').forEach((r, i) => {
          const pair = Array.isArray(r) ? r : (r as Record<string, unknown>).between
          if (!Array.isArray(r)) keysOnly(r, ['between', 'solve'], `ropes[${i}]`)
          if (!Array.isArray(pair) || pair.length !== 2 || !pair.every((p) => names.includes(p)) || pair[0] === pair[1])
            err(`ropes[${i}] 写成 ["A", "B"] 或 {between: ["A", "B"], solve: "T"}：两个不同物体的名字`)
        })
        }
      }
      // Inside the run, t, the state, derived forces and the circuit's read names are local.
      const local = motionLocal
      const fieldNames: string[] = []
      if (props.charge !== undefined || props.fields !== undefined) {
        if (props.charge === undefined || props.fields === undefined) err('charge 和 fields 要一起写')
        else expr(props.charge, 'charge', local)
      }
      if (props.fields !== undefined) {
        if (props.along !== undefined || props.bodies !== undefined || (dyn && dyn.mode !== 'free' && dyn.mode !== 'track'))
          err('fields 只用于平面内的自由运动或沿轨道运动（不写 along、bodies）：沿直线运动时没有平面里的场区')
        if (props.mass === undefined) err('写了 fields 就要写 mass（场力除以质量得到加速度）')
        const own = new Set<string>()
        if (typeof props.name === 'string') {
          const spec = motionSpecOf(props)
          if (spec) for (const n of motionOutputs(props.name, spec)) own.add(n)
        }
        const readKeys = Object.keys((props.read ?? {}) as Record<string, unknown>)
        list('fields').forEach((f, i) => {
          checkFieldEntry(f, i, {
            err,
            expr,
            keysOnly,
            declared,
            vars,
            local,
            eventName(name, where) {
              if (typeof name !== 'string' || !IDENT.test(name)) {
                err(`${where} 应为名字`)
                return
              }
              if (vars.includes(name)) err(`${where} 的名字 ${name} 与状态量重名`)
              else if (derivedNames.includes(name) || circuitReads.includes(name)) err(`${where} 的名字 ${name} 与组件算出的量重名`)
              else if (MOTION_RESERVED.has(name)) err(`${where} 不能叫 ${name}（t 是时间，tEnd 是结束时刻）`)
              else if (params.has(name) || readKeys.includes(name) || (declared.has(name) && !own.has(name))) err(`${where} 的名字 ${name} 与课件里已声明的名字重名`)
              else if (fieldNames.includes(name) || frictionEvents.includes(name)) err(`${where} 的名字 ${name} 与其他事件重名`)
              else fieldNames.push(name)
            },
          })
        })
      }
      const rates = (props.rates ?? {}) as Record<string, unknown>
      for (const [k, r] of Object.entries(rates)) {
        if (!vars.includes(k)) err(`rates.${k} 没有对应的 state（rates 写的是 state 里各量的变化率 d${k}/dt）`)
        expr(r, `rates.${k}`, local)
      }
      if (typeof props.until === 'number' && props.until <= 0) err('until 应为正数（最长积分时长）')
      else expr(props.until, 'until')
      if (typeof props.steps === 'number' && (props.steps < 50 || props.steps > 20000)) err('steps 应在 50–20000 之间')
      const eventNames: string[] = [...frictionEvents, ...fieldNames]
      list('events').forEach((e, i) => {
        keysOnly(e, ['name', 'when', 'dir', 'stop', 'set', 'label'], `events[${i}]`)
        expr(e.when, `events[${i}].when`, [...local, ...fieldNames])
        if (e.dir !== undefined && !['up', 'down', 'any'].includes(String(e.dir))) err(`events[${i}].dir 只能是 up（由负变正）、down（由正变负）或 any`)
        if (e.name !== undefined) {
          if (typeof e.name !== 'string' || !IDENT.test(e.name)) err(`events[${i}].name 不合法`)
          else if (fieldNames.includes(e.name) || frictionEvents.includes(e.name)) err(`events[${i}].name 与场区的 enter/exit 或其他事件重名：${e.name}`)
          else eventNames.push(e.name)
        }
        if (e.set !== undefined) {
          if (!e.set || typeof e.set !== 'object' || Array.isArray(e.set)) err(`events[${i}].set 应为对象 {状态量: 表达式}`)
          else for (const [k, v] of Object.entries(e.set as Record<string, unknown>)) {
            if (!vars.includes(k)) err(`events[${i}].set.${k} 不是 state 里的量`)
            expr(v, `events[${i}].set.${k}`, local)
          }
        }
        if (e.stop !== undefined && typeof e.stop !== 'boolean') err(`events[${i}].stop 应为布尔值`)
      })
      for (const [k, r] of Object.entries((props.read ?? {}) as Record<string, unknown>)) {
        const parsed = typeof r === 'string' ? parseRead(r) : null
        if (!parsed) {
          err(`read.${k} 写成 "表达式 @ 时刻"（如 "v @ tHit"、"y @ tEnd"）或 "max(表达式)"、"min(表达式)"`)
          continue
        }
        expr(parsed.expr, `read.${k}`, [...local, 'tEnd', ...eventNames])
        if (parsed.kind === 'at') expr(parsed.at, `read.${k} 的时刻`, ['tEnd', ...eventNames])
      }
      if (dyn && dyn.mode !== 'track' && dyn.mode !== 'axis') {
        const bodyNames = Array.isArray(props.bodies)
          ? props.bodies.map((item) => (item && typeof item === 'object' && !Array.isArray(item) ? String((item as Record<string, unknown>).name ?? '') : ''))
          : []
        checkMotionExtras(props, { err, expr, local, names: bodyNames, mode: dyn.mode })
      }
      break
    }
    case 'GasBox': {
      expr(props.T, 'T')
      for (const k of ['count', 'compare'] as const) if (props[k] !== undefined) expr(props[k], k)
      if (props.gas !== undefined && props.mass === undefined && !(String(props.gas) in GASES)) err(`gas 不合法：${String(props.gas)}（可用：${Object.keys(GASES).join('、')}；其他气体写 mass 摩尔质量，单位 u）`)
      if (props.start !== undefined && !['maxwell', 'same'].includes(String(props.start))) err('start 只能是 maxwell（一开始就是平衡分布）或 same（所有分子同一速率出发）')
      if (typeof props.count === 'number' && (props.count < 20 || props.count > 800)) err('count 应在 20–800 之间')
      if (typeof props.bins === 'number' && (props.bins < 8 || props.bins > 60)) err('bins 应在 8–60 之间')
      if (typeof props.T === 'number' && props.T <= 0) err('T 是热力学温度，单位 K，应大于 0')
      if (typeof props.T === 'string' && params.has(props.T)) {
        const def = paramDefs.find((p) => p.name === props.T)
        if (def && (def.min ?? def.value) <= 0) err(`T 绑定的 Param ${props.T} 最小值应大于 0（热力学温度，单位 K）`)
      }
      break
    }
    case 'Sim': {
      expr(props.duration, 'duration')
      if (props.step !== undefined) expr(props.step, 'step')
      if (props.time !== undefined) nameRef(props.time, 'time', true)
      for (const n of (props.params ?? []) as string[]) nameRef(n, 'params')
      for (const m of list('marks')) {
        keysOnly(m, ['t', 'label', 'color'], 'marks 条目')
        expr(m.t, `marks「${String(m.label)}」.t`)
        color(m.color, `marks「${String(m.label)}」`)
      }
      if (!b.body || !/\bsim\s*\(/.test(b.body)) err('代码里没有调用 sim({...})')
      sandboxApis()
      break
    }
    case 'Figure': {
      for (const n of (props.params ?? []) as string[]) nameRef(n, 'params')
      if (!b.body || !/\bfigure\s*\(/.test(b.body)) err('代码里没有调用 figure({...})')
      sandboxApis()
      break
    }
    case 'ForceDiagram': {
      const surface = (props.surface ?? {}) as Record<string, unknown>
      keysOnly(surface, ['type', 'angle', 'angleLabel'], 'surface')
      if (surface.type !== undefined && !['none', 'ground', 'incline', 'ceiling'].includes(String(surface.type))) err(`surface.type 不合法：${String(surface.type)}`)
      if (surface.angle !== undefined) expr(surface.angle, 'surface.angle')
      const body = (props.body ?? {}) as Record<string, unknown>
      keysOnly(body, ['shape', 'label', 'charge', 'angle'], 'body')
      if (body.angle !== undefined) expr(body.angle, 'body.angle')
      if (body.shape !== undefined && !['block', 'ball', 'particle', 'rod', 'knot'].includes(String(body.shape))) err(`body.shape 不合法：${String(body.shape)}（可用：block、ball、particle、rod、knot）`)
      if (body.charge !== undefined && !['+', '-', '−'].includes(String(body.charge))) err('body.charge 只能是 "+" 或 "-"')
      const forces = list('forces')
      // `solve` marks unknowns found from ΣF = ma; the given value and the unknown are exclusive.
      const solvable = (f: Record<string, unknown>, where: string): number => {
        const s = f.solve
        if (s === undefined) {
          expr(f.angle, `${where}.angle`)
          expr(f.magnitude, `${where}.magnitude`)
          return 0
        }
        const keys = typeof s === 'string' ? { magnitude: s } : s && typeof s === 'object' && !Array.isArray(s) ? (s as Record<string, unknown>) : null
        if (!keys) {
          err(`${where}.solve 写成名字字符串（未知大小），或 { magnitude: "名字", angle: "名字" }`)
          return 0
        }
        keysOnly(keys, ['magnitude', 'angle'], `${where}.solve`)
        let n = 0
        for (const k of ['magnitude', 'angle'] as const) {
          if (keys[k] === undefined) {
            expr(f[k], `${where}.${k}`)
            continue
          }
          n++
          if (typeof keys[k] !== 'string' || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(keys[k] as string)) err(`${where}.solve.${k} 应为名字`)
          if (f[k] !== undefined) err(`${where} 的 ${k} 既给了值又要求解，二选一`)
        }
        return n
      }
      let unknownCount = 0
      forces.forEach((f, i) => {
        keysOnly(f, ['label', 'angle', 'magnitude', 'solve', 'at', 'color', 'unit', 'digits', 'showValue', 'role'], `forces[${i}]`)
        if (typeof f.label !== 'string') err(`forces[${i}] 缺少 label`)
        if (f.role !== 'direction') unknownCount += solvable(f, `forces[${i}]`)
        color(f.color, `forces[${i}]`)
      })
      checkForceDiagram(props, { err, expr })
      if (props.values !== undefined && props.values !== 'corner' && props.values !== 'inline') err(`values 只能是 "corner" 或 "inline"：${String(props.values)}`)
      if (props.accel !== undefined) {
        const a = props.accel as Record<string, unknown>
        keysOnly(a, ['angle', 'magnitude', 'solve'], 'accel')
        unknownCount += solvable(a, 'accel')
        if (props.mass === undefined) err('给了 accel 就要给 mass（ΣF = ma）')
      }
      if (props.mass !== undefined) {
        expr(props.mass, 'mass')
        if (props.accel === undefined) err('mass 只和 accel 一起用（平衡时不需要 mass）')
      }
      if (unknownCount > 2) err(`最多解两个未知量（平面上 ΣF = ma 只有两个方程），现在有 ${unknownCount} 个`)
      const d = props.decompose as Record<string, unknown> | undefined
      if (d) {
        keysOnly(d, ['force', 'axes', 'labels'], 'decompose')
        if (typeof d.force !== 'number' || d.force >= forces.length) err('decompose.force 应为 forces 的序号')
      }
      const tri = props.triangle
      if (tri && typeof tri === 'object') {
        const t = tri as Record<string, unknown>
        keysOnly(t, ['order', 'resultant', 'title', 'circle', 'angleLabel'], 'triangle')
        if (t.circle !== undefined && (Array.isArray(t.order) ? t.order.length : forces.length) !== 3) err('triangle.circle 只用于三个力的动态平衡')
        if (t.order !== undefined) {
          const ok = Array.isArray(t.order) && t.order.length >= 2 && t.order.every((i) => Number.isInteger(i) && (i as number) >= 0 && (i as number) < forces.length)
          if (!ok) err('triangle.order 应为至少两个 forces 序号组成的数组')
        }
      }
      if (tri !== undefined && forces.length < 2) err('triangle 至少需要两个力')
      break
    }
    case 'Circuit': {
      const hasMotion = props.motion !== undefined
      if (hasMotion && (props.source !== undefined || props.load !== undefined)) err('motion 和 source、load 二选一：画运动里的电路就不要再写 source、load')
      if (hasMotion && props.transient !== undefined) err('motion 不能和 transient 同时写')
      if (!hasMotion && props.source === undefined) err('缺少属性 source')
      if (!hasMotion && props.load === undefined) err('缺少属性 load')
      if (props.at !== undefined) {
        if (!hasMotion) err('at 只和 motion 一起用（暂态电路的时刻写在 transient.at）')
        else expr(props.at, 'at')
      }
      const tr = hasMotion ? undefined : (props.transient as Record<string, unknown> | undefined)
      // In a transient, t and the schematic's own read names are local to the run.
      const reads = tr ? transientReads(props.source as SchematicNode, props.load as SchematicNode).map((r) => r.name) : []
      const local = tr ? ['t', ...reads] : []
      let storage = 0
      let readSeen = false
      if (!hasMotion) {
        const walk = { err, expr, keysOnly, valueNames: local, displayNames: local, integrating: !!tr }
        const sourceWalk = walkSchematic(props.source, 'source', walk)
        const loadWalk = walkSchematic(props.load, 'load', walk)
        storage = sourceWalk.storage + loadWalk.storage
        readSeen = sourceWalk.readSeen || loadWalk.readSeen
        checkSourceChains(props.source, props.load, !!tr, err)
        const dc = transformerDcWarning(props.source, props.load, !tr)
        if (dc) warn(dc)
      }
      if (readSeen && !schematicSolves(props.source as SchematicNode, props.load as SchematicNode)) err('read 需要电路能求解：给电源写上 emf（以及内阻 r），或用电流源 currentSource')
      if (tr) {
        keysOnly(tr, ['name', 'until', 'steps', 'at', 'events', 'read'], 'transient')
        if (typeof tr.name !== 'string' || !/^[A-Za-z][A-Za-z0-9_]*$/.test(tr.name)) err('transient.name 应为名字（如 "rc"），结果以 rc.UC(t) 的形式发布')
        if (!schematicSolves(props.source as SchematicNode, props.load as SchematicNode)) err('transient 需要电路能求解：给电源写上 emf')
        if (!storage && !dependsOnT(props.source) && !dependsOnT(props.load))
          err('transient 需要电路随时间变化：电路里要有电容（capacitor）或线圈（inductor），或者电动势、开关、单刀双掷的 position、电流源的 I 写成 t 的表达式（如交流电源 emf: "Um*sin(w*t)"）')
        if (tr.until === undefined) err('transient.until 必填：计算到哪一时刻（s）')
        else if (typeof tr.until === 'number' && tr.until <= 0) err('transient.until 应为正数')
        else expr(tr.until, 'transient.until')
        if (tr.steps !== undefined && !(typeof tr.steps === 'number' && tr.steps >= 50 && tr.steps <= 20000)) err('transient.steps 应在 50–20000 之间')
        if (tr.at !== undefined) expr(tr.at, 'transient.at')
        const eventNames: string[] = []
        ;(Array.isArray(tr.events) ? tr.events : tr.events === undefined ? [] : (err('transient.events 应为数组'), [])).forEach((e: Record<string, unknown>, i: number) => {
          keysOnly(e, ['name', 'when', 'dir', 'stop', 'label'], `transient.events[${i}]`)
          expr(e.when, `transient.events[${i}].when`, local)
          if (e.dir !== undefined && !['up', 'down', 'any'].includes(String(e.dir))) err(`transient.events[${i}].dir 只能是 up、down 或 any`)
          if (e.name !== undefined) {
            if (typeof e.name !== 'string' || !/^[A-Za-z][A-Za-z0-9_]*$/.test(e.name)) err(`transient.events[${i}].name 不合法`)
            else eventNames.push(e.name)
          }
        })
        for (const [k, r] of Object.entries((tr.read ?? {}) as Record<string, unknown>)) {
          const parsed = typeof r === 'string' ? parseRead(r) : null
          if (!parsed) {
            err(`transient.read.${k} 写成 "表达式 @ 时刻" 或 "max(表达式)"、"min(表达式)"`)
            continue
          }
          expr(parsed.expr, `transient.read.${k}`, [...local, 'tEnd', ...eventNames])
          if (parsed.kind === 'at') expr(parsed.at, `transient.read.${k} 的时刻`, ['tEnd', ...eventNames])
        }
      }
      if (props.current !== undefined) expr((props.current as Record<string, unknown>).expr, 'current.expr', local)
      if (props.flow && typeof props.flow === 'object') {
        const f = props.flow as Record<string, unknown>
        keysOnly(f, ['expr', 'ref'], 'flow')
        expr(f.expr, 'flow.expr', local)
        if (f.ref !== undefined) expr(f.ref, 'flow.ref')
      } else if (props.flow === true) err('flow 写对象 {expr, ref} 或 false')
      if (props.layout !== undefined && props.layout !== 'loop' && props.layout !== 'ladder') err(`layout 只能是 "loop" 或 "ladder"：${String(props.layout)}`)
      if (props.box !== undefined) {
        if (props.layout !== 'ladder') err('box 只在 layout="ladder" 时有效')
        keysOnly(props.box as Record<string, unknown>, ['label', 'caption'], 'box')
      }
      if (props.layout === 'ladder' && !hasMotion) {
        if (usesLadderBlock(props.source) || usesLadderBlock(props.load)) err('layout="ladder" 画不下变压器或单刀双掷开关，请用默认的 loop')
        const flat = (n: unknown) => (n && typeof n === 'object' && 'series' in n ? ((n as { series: unknown[] }).series ?? []) : [n])
        const isEl = (n: unknown) => !!n && typeof n === 'object' && 'type' in n
        const parts = flat(props.load)
        const blocks = parts.filter((p) => p && typeof p === 'object' && ('repeat' in p || 'parallel' in p))
        const rungsOk = blocks.length === 1 && ('repeat' in (blocks[0] as object) ? isEl((blocks[0] as { item: unknown }).item) : ((blocks[0] as { parallel: unknown[] }).parallel ?? []).every(isEl))
        if (!flat(props.source).every(isEl) || parts.filter((p) => !isEl(p)).length !== 1 || !rungsOk) {
          err('layout="ladder" 要求：source 是元件串联；load 是元件串联，其中恰好一个 repeat/parallel，且每条支路只有一个元件')
        }
      }
      break
    }
    case 'GasTube': {
      gasTubeIssues(b.props, undefined, declared, userNames, err, warn, expr, keysOnly)
      break
    }
    case 'Optics': {
      opticsIssues(b.props, declared, userNames, err, expr, keysOnly)
      break
    }
    case 'Fringes': {
      fringesIssues(b.props, declared, userNames, err, expr, keysOnly)
      break
    }
  }
}
