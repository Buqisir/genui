// Text report of labels sitting on geometry and of drawings that leave the canvas.
// Runs <Sim> / <Figure> in node against the sandbox runtime with diagnostics on.
// Prefab components lay themselves out, so they are not checked here.
import vm from 'node:vm'
import { num } from '../lesson/expr'
import { motionPayload } from '../lesson/motion'
import { opticsPayload } from '../lesson/optics'
import { parseLesson, type Block, type Props } from '../lesson/parse'
import { buildRegistry, ParamStore } from '../lesson/store'
import { buildRuntime } from '../sim/buildRuntime'
import { palette } from '../theme'

export interface LayoutIssue {
  line?: number
  component: string
  t?: number
  message: string
}

export interface LayoutReport {
  ok: boolean
  issues: LayoutIssue[]
  /** Drawing-rule advice (values in the picture, text on lines, field lines through walls, small subject). Does not affect ok. */
  hints?: LayoutIssue[]
}

interface Box {
  x: number
  y: number
  w: number
  h: number
}

interface FrameView {
  xmin: number
  xmax: number
  ymin: number
  ymax: number
  ox: number
  oy: number
  kx: number
  ky: number
}

interface FrameLabel {
  text: string
  tag?: string
  backed?: boolean
  box: Box
  anchor: { x: number; y: number }
  clear: boolean
  anchorOut: boolean
  overlaps: { tag: string; weight: number; labelFrac: number; shapeFrac: number; pieceFrac: number; pieceArea: number }[]
  labelHits: { text: string; frac: number }[]
}

interface Frame {
  t: number
  cssW: number
  cssH: number
  view: FrameView | null
  labels: FrameLabel[]
  texts: { text: string; tag?: string; x: number; y: number; w: number; h: number }[]
  geom: { tag: string; area: number; out: number; weight: number; left: number; right: number; top: number; bottom: number; x0?: number; y0?: number; x1?: number; y1?: number }[]
  strokes?: Stroke[]
  /** Painted extent as fractions of the canvas (0–1). */
  ink?: InkBox | null
}

interface Stroke {
  tag: string
  width: number
  pts: [number, number][]
  field?: boolean
  clipped?: boolean
}

interface Acc {
  line?: number
  component: string
  title: string
  score: number
  detail: string
  times: number[]
  presets: string[]
  t?: number
}

const MAIN_COL = 920
const COL_GAP = 20
const COLS = 12
// Only real collisions. A label that merely grazes a shape, or a stroke that
// clips the padding, is not worth a line in the report.
const LABEL_FRAC = 0.28
const PIECE_FRAC = 0.6
const PIECE_MIN = 24
const LABEL_LABEL_FRAC = 0.2
const OFF_FRAC = 0.5
const OFF_BODY_FRAC = 0.4
const OFF_MIN_AREA = 80
const TEXT_FRAC = 0.45
const PER_SCENE = 8
const GLOBAL_CAP = 30
const TIMEOUT_MS = Math.max(Number(process.env.GENUI_SIM_TIMEOUT_MS) || 0, 8000)

const SCENES = new Set(['Sim', 'Figure', 'Circuit', 'ForceDiagram', 'Instrument', 'TickerTape', 'EnergyLevels', 'Wiring', 'GasBox', 'GasTube', 'Fringes'])
const MAIN = new Set([...SCENES, 'Plot', 'Bars', 'Ledger', 'Dial'])

type Comp = Extract<Block, { kind: 'component' }>
type Size = 'full' | 'wide' | 'narrow'

let runtimeSource: string | null = null
const runtime = () => (runtimeSource ??= buildRuntime())

const CJK = /[\u2E80-\u9FFF\u3000-\u303F\uFF00-\uFFEF\uAC00-\uD7AF]/

/** Same approximation the layout sandbox's measureText uses: CJK ≈ 1 em, Latin ≈ 0.6 em. */
function measureWidth(font: string, text: string): number {
  const size = Number(/([\d.]+)px/.exec(font)?.[1] ?? 13)
  let w = 0
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0
    if (cp <= 0x20) w += size * 0.33
    else if (CJK.test(ch)) w += size
    else w += size * 0.6
  }
  return w
}

function cellWidth(span: number): number {
  const col = (MAIN_COL - (COLS - 1) * COL_GAP) / COLS
  return Math.round(span * col + (span - 1) * COL_GAP)
}

// Mirrors LessonView.spans: the desktop lab gives the main column 920px.
function naturalSize(b: Comp, isFirstScene: boolean): Size {
  const s = b.props.size
  if (s === 'full' || s === 'wide' || s === 'narrow') return s
  if (b.name === 'Ledger' || b.name === 'Dial') return 'narrow'
  if (b.name === 'Plot' || b.name === 'Bars') return 'wide'
  if (b.name === 'ForceDiagram' && !isFirstScene) return 'wide'
  return 'full'
}

function spans(blocks: Comp[]): number[] {
  const firstScene = blocks.findIndex((b) => SCENES.has(b.name))
  const sizes = blocks.map((b, i) => naturalSize(b, i === firstScene))
  const out: number[] = new Array(blocks.length).fill(12)
  for (let i = 0; i < blocks.length; i++) {
    const a = sizes[i]
    const b = sizes[i + 1]
    if (a === 'full' || b === undefined || b === 'full') {
      out[i] = a === 'narrow' ? 6 : 12
      continue
    }
    if (a === 'narrow' && b === 'narrow') [out[i], out[i + 1]] = [6, 6]
    else if (a === 'wide' && b === 'narrow') [out[i], out[i + 1]] = [7, 5]
    else if (a === 'narrow' && b === 'wide') [out[i], out[i + 1]] = [5, 7]
    else {
      out[i] = 12
      continue
    }
    i++
  }
  return out
}

function sceneHeight(props: Props): number {
  return typeof props.height === 'number' && props.height > 0 ? props.height : 280
}

const negative = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v < 0

type Mat = [number, number, number, number, number, number]

/** Path2D stand-in that remembers its points (untransformed) so fill(path) leaves ink. */
class InkPath {
  pts: [number, number, number][] = []
  private add(x: unknown, y: unknown, r = 0) {
    this.pts.push([Number(x), Number(y), Math.abs(Number(r)) || 0])
  }
  moveTo(x: unknown, y: unknown) {
    this.add(x, y)
  }
  lineTo(x: unknown, y: unknown) {
    this.add(x, y)
  }
  quadraticCurveTo(_a: unknown, _b: unknown, x: unknown, y: unknown) {
    this.add(x, y)
  }
  bezierCurveTo(_a: unknown, _b: unknown, _c: unknown, _d: unknown, x: unknown, y: unknown) {
    this.add(x, y)
  }
  arc(x: unknown, y: unknown, r: unknown) {
    if (negative(r)) throw new RangeError(`negative radius ${r}`)
    this.add(x, y, Number(r))
  }
  arcTo(x1: unknown, y1: unknown, x2: unknown, y2: unknown) {
    this.add(x1, y1)
    this.add(x2, y2)
  }
  ellipse(x: unknown, y: unknown, rx: unknown, ry: unknown) {
    this.add(x, y, Math.max(Number(rx), Number(ry)))
  }
  rect(x: unknown, y: unknown, w: unknown, h: unknown) {
    this.add(x, y)
    this.add(Number(x) + Number(w), Number(y) + Number(h))
  }
  roundRect(x: unknown, y: unknown, w: unknown, h: unknown) {
    this.rect(x, y, w, h)
  }
  addPath(p: unknown) {
    if (p instanceof InkPath) this.pts.push(...p.pts)
  }
  closePath() {}
}
interface InkBox {
  x0: number
  y0: number
  x1: number
  y1: number
}

/**
 * Bounding box of everything painted (filled, stroked or written) since the last take, in
 * device pixels. Tools that never register a layout shape still leave ink here, so the
 * "subject too small" hint does not depend on which tools report themselves.
 */
function makeInk(canvas: { width: number; height: number }) {
  let m: Mat = [1, 0, 0, 1, 0, 0]
  const stack: Mat[] = []
  let path: InkBox | null = null
  let ink: InkBox | null = null
  const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : NaN)
  const pt = (x: unknown, y: unknown, r = 0) => {
    const X = n(x)
    const Y = n(y)
    if (!Number.isFinite(X + Y)) return
    const px = m[0] * X + m[2] * Y + m[4]
    const py = m[1] * X + m[3] * Y + m[5]
    const rr = Math.abs(r) * Math.max(Math.hypot(m[0], m[1]), Math.hypot(m[2], m[3]))
    path ??= { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
    path.x0 = Math.min(path.x0, px - rr)
    path.y0 = Math.min(path.y0, py - rr)
    path.x1 = Math.max(path.x1, px + rr)
    path.y1 = Math.max(path.y1, py + rr)
  }
  const commit = () => {
    if (!path) return
    const W = canvas.width || 1
    const H = canvas.height || 1
    // Full-canvas washes (backgrounds, vignettes) say nothing about where the subject is.
    const full = (path.x1 - path.x0) * (path.y1 - path.y0) >= 0.9 * W * H
    if (!full && Number.isFinite(path.x0 + path.y0 + path.x1 + path.y1)) {
      const b = { x0: Math.max(0, path.x0), y0: Math.max(0, path.y0), x1: Math.min(W, path.x1), y1: Math.min(H, path.y1) }
      if (b.x1 > b.x0 || b.y1 > b.y0) {
        ink ??= { ...b }
        ink.x0 = Math.min(ink.x0, b.x0)
        ink.y0 = Math.min(ink.y0, b.y0)
        ink.x1 = Math.max(ink.x1, b.x1)
        ink.y1 = Math.max(ink.y1, b.y1)
      }
    }
  }
  const mul = (a: Mat, b: Mat): Mat => [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ]
  const rectPts = (x: unknown, y: unknown, w: unknown, h: unknown) => {
    pt(x, y)
    pt(n(x) + n(w), n(y) + n(h))
    pt(n(x) + n(w), y)
    pt(x, n(y) + n(h))
  }
  const ops: Record<string, (...a: unknown[]) => void> = {
    save: () => void stack.push([...m] as Mat),
    restore: () => void (m = stack.pop() ?? m),
    setTransform: (...a) => {
      const o = a[0] as Record<string, number> | undefined
      m = a.length >= 6 ? (a.map(Number) as Mat) : o && typeof o === 'object' ? [o.a ?? 1, o.b ?? 0, o.c ?? 0, o.d ?? 1, o.e ?? 0, o.f ?? 0] : [1, 0, 0, 1, 0, 0]
    },
    resetTransform: () => void (m = [1, 0, 0, 1, 0, 0]),
    transform: (...a) => void (m = mul(m, a.map(Number) as Mat)),
    translate: (x, y) => void (m = mul(m, [1, 0, 0, 1, Number(x), Number(y)])),
    scale: (x, y) => void (m = mul(m, [Number(x), 0, 0, Number(y), 0, 0])),
    rotate: (r) => {
      const c = Math.cos(Number(r))
      const s2 = Math.sin(Number(r))
      m = mul(m, [c, s2, -s2, c, 0, 0])
    },
    beginPath: () => void (path = null),
    moveTo: (x, y) => pt(x, y),
    lineTo: (x, y) => pt(x, y),
    quadraticCurveTo: (_a, _b, x, y) => pt(x, y),
    bezierCurveTo: (_a, _b, _c, _d, x, y) => pt(x, y),
    arc: (x, y, r) => pt(x, y, n(r)),
    arcTo: (x1, y1, x2, y2) => {
      pt(x1, y1)
      pt(x2, y2)
    },
    ellipse: (x, y, rx, ry) => pt(x, y, Math.max(n(rx), n(ry))),
    rect: rectPts,
    roundRect: rectPts,
    fill: (a) => (a instanceof InkPath ? replay(a) : commit()),
    stroke: (a) => (a instanceof InkPath ? replay(a) : commit()),
    fillRect: (x, y, w, h) => {
      const keep = path
      path = null
      rectPts(x, y, w, h)
      commit()
      path = keep
    },
    strokeRect: (x, y, w, h) => {
      const keep = path
      path = null
      rectPts(x, y, w, h)
      commit()
      path = keep
    },
  }
  const replay = (p: InkPath) => {
    const keep = path
    path = null
    for (const [x, y, r] of p.pts) pt(x, y, r)
    commit()
    path = keep
  }
  const text = (font: string, s: unknown, x: unknown, y: unknown, align: unknown) => {
    const w = measureWidth(font, String(s))
    const size = Number(/([\d.]+)px/.exec(font)?.[1] ?? 13)
    const left = align === 'center' ? n(x) - w / 2 : align === 'right' || align === 'end' ? n(x) - w : n(x)
    const keep = path
    path = null
    pt(left, n(y) - size / 2)
    pt(left + w, n(y) + size / 2)
    commit()
    path = keep
  }
  return {
    ops,
    text,
    take(): InkBox | null {
      const W = canvas.width || 1
      const H = canvas.height || 1
      const out = ink ? { x0: ink.x0 / W, y0: ink.y0 / H, x1: ink.x1 / W, y1: ink.y1 / H } : null
      ink = null
      path = null
      return out
    },
  }
}

function makeContext(width: number, height: number) {
  const posts: { type: string; message?: string }[] = []
  const listeners: Record<string, ((e: unknown) => void)[]> = {}
  const ctxState: Record<string | symbol, unknown> = {}
  const canvas = { width: 0, height: 0, style: {}, getContext: () => ctx2d }
  const ink = makeInk(canvas)
  const ctx2d: Record<string | symbol, unknown> = new Proxy(ctxState, {
    get(target, prop) {
      if (prop === 'fillText' || prop === 'strokeText') {
        return (s: unknown, x: unknown, y: unknown) => ink.text(String(target.font ?? ''), s, x, y, target.textAlign)
      }
      if (prop === 'measureText') return (s: unknown) => ({ width: measureWidth(String(target.font ?? ''), String(s)) })
      if (typeof prop === 'string' && /^create\w*(Gradient|Pattern)$/.test(prop)) {
        return () => ({ addColorStop() {}, setTransform() {} })
      }
      if (prop === 'getLineDash') return () => []
      if (prop === 'setLineDash') {
        return (d: unknown) => {
          if (d === null || typeof d !== 'object' || typeof (d as Iterable<unknown>)[Symbol.iterator] !== 'function') {
            throw new TypeError('setLineDash')
          }
        }
      }
      if (prop === 'arc' || prop === 'arcTo') {
        return (...args: unknown[]) => {
          const r = prop === 'arc' ? args[2] : args[4]
          if (negative(r)) throw new RangeError(`negative radius ${r}`)
          ink.ops[prop](...args)
        }
      }
      if (prop in target) return target[prop]
      if (typeof prop === 'string' && prop in ink.ops) return ink.ops[prop]
      return () => undefined
    },
    set(target, prop, value) {
      target[prop] = value
      return true
    },
  })
  const parent = { postMessage: (msg: { type: string; message?: string }) => posts.push(msg) }
  const sandbox: Record<string, unknown> = {
    Math, JSON, Number, Array, Object, String, Boolean, Infinity, NaN, isFinite, isNaN, parseFloat, parseInt, Date,
    console: { log() {}, warn() {}, error() {} },
    document: { getElementById: () => canvas, documentElement: { clientWidth: width, clientHeight: height } },
    parent,
    devicePixelRatio: 2,
    Path2D: InkPath,
    performance: { now: () => 0 },
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => undefined,
    addEventListener: (type: string, fn: (e: unknown) => void) => {
      ;(listeners[type] ??= []).push(fn)
    },
    __listeners: listeners,
    __colors: palette('light'),
    __posts: posts,
    __takeInk: () => ink.take(),
    __GENUI_LAYOUT__: true,
  }
  sandbox.window = sandbox
  sandbox.globalThis = sandbox
  return { context: vm.createContext(sandbox), posts }
}

const DRIVER = `
globalThis.__layoutRun = (raw, times) => {
  globalThis.__GENUI_LAYOUT_LOG__ = []
  const errors = []
  const inks = []
  for (const t of times) {
    const n = globalThis.__posts.length
    __takeInk()
    for (const fn of __listeners.message || []) {
      fn({ source: parent, data: { source: 'genui-host', params: raw, t: t, colors: __colors } })
    }
    inks.push(__takeInk())
    for (const p of globalThis.__posts.slice(n)) if (p.type === 'error') errors.push(String(p.message || ''))
  }
  return JSON.stringify({ frames: globalThis.__GENUI_LAYOUT_LOG__, inks: inks, errors: errors })
}
`

function sampleTimes(duration: number, marks: number[]): number[] {
  const raw = [0, duration]
  for (let i = 1; i <= 3; i++) raw.push((duration * i) / 4)
  for (const m of marks) if (m >= -1e-9 && m <= duration + 1e-9) raw.push(Math.min(Math.max(m, 0), duration))
  const uniq = new Map<number, number>()
  for (const t of raw) {
    const k = Math.round(Math.max(0, t) * 1e6) / 1e6
    uniq.set(k, k)
  }
  return [...uniq.values()].sort((a, b) => a - b)
}

interface Sample {
  preset: string
  frames: Frame[]
  errors: string[]
}

function runScene(body: string, width: number, height: number, runs: { preset: string; params: Record<string, unknown>; times: number[] }[]): Sample[] {
  const { context, posts } = makeContext(width, height)
  const run = (code: string) => vm.runInContext(code, context, { timeout: TIMEOUT_MS })
  const out: Sample[] = []
  try {
    run(runtime())
    run(body)
    run('__simReady()')
  } catch (e) {
    return [{ preset: '', frames: [], errors: [clip((e as Error).message)] }]
  }
  const initErrors = [...new Set(posts.filter((p) => p.type === 'error').map((p) => p.message ?? '').filter(Boolean))]
  if (initErrors.length) return [{ preset: '', frames: [], errors: initErrors.map(clip) }]
  try {
    run(DRIVER)
  } catch (e) {
    return [{ preset: '', frames: [], errors: [clip((e as Error).message)] }]
  }
  for (const r of runs) {
    context.__params = r.params
    context.__times = r.times
    try {
      const json = run('__layoutRun(__params, __times)') as string
      const data = JSON.parse(json) as { frames?: Frame[]; inks?: (InkBox | null)[]; errors?: string[] }
      const frames = data.frames ?? []
      if (data.inks && data.inks.length === frames.length) frames.forEach((f, i) => (f.ink = data.inks?.[i] ?? null))
      data.frames = frames
      out.push({ preset: r.preset, frames: data.frames ?? [], errors: (data.errors ?? []).map(clip) })
    } catch (e) {
      out.push({ preset: r.preset, frames: [], errors: [clip((e as Error).message)] })
      break
    }
  }
  return out
}

function clip(s: string): string {
  const one = s.replace(/\s+/g, ' ').trim()
  return one.length > 180 ? one.slice(0, 180) + '…' : one
}

function fmtT(t: number): string {
  if (!Number.isFinite(t)) return '?'
  const a = Math.abs(t)
  if (a < 5e-4) return '0'
  if (a >= 100) return String(Math.round(t))
  if (a >= 1) return t.toFixed(1)
  return String(Number(t.toFixed(a >= 0.1 ? 2 : 3)))
}

function fmtNum(n: number): string {
  if (!Number.isFinite(n)) return '?'
  return String(Number(n.toFixed(2)))
}

function fmtPx(n: number): string {
  return String(Math.round(n))
}

function phys(px: number, py: number, frame: Frame): string {
  const v = frame.view
  if (!v || !Number.isFinite(v.kx) || !Number.isFinite(v.ky) || v.kx === 0 || v.ky === 0) return ''
  const x = v.xmin + (px - v.ox) / v.kx
  const y = v.ymin + (frame.cssH - v.oy - py) / v.ky
  if (!Number.isFinite(x) || !Number.isFinite(y)) return ''
  return `；物理坐标 (${fmtNum(x)}, ${fmtNum(y)})`
}

function overlapArea(a: Box, b: Box): number {
  const w = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x))
  const h = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y))
  return w * h
}

function outPhrase(frac: number): string {
  if (frac >= 0.85) return '几乎全部画在画布外'
  if (frac >= 0.6) return '大半画在画布外'
  if (frac >= 0.45) return '有一半画在画布外'
  return `有约 ${Math.round(frac * 100)}% 画在画布外`
}

function badOverlap(o: FrameLabel['overlaps'][number]): boolean {
  if (!(o.weight >= 1)) return false
  // A small mark (arrow head, terminal) that the label actually covers.
  if (o.pieceFrac >= PIECE_FRAC && o.pieceArea >= PIECE_MIN && o.pieceArea <= 400) return true
  // The label hides a real fraction of everything drawn by that call.
  if (o.shapeFrac >= 0.12) return true
  // Solid bodies (block, ball, cart, planet): the label is painted on the fill.
  if (o.weight >= 3 && o.labelFrac >= LABEL_FRAC) return true
  // Thinner geometry, but only when the label is not just sitting in a big bounding box.
  if (o.labelFrac >= 0.45 && o.shapeFrac >= 0.08) return true
  return false
}

function overlapScore(o: FrameLabel['overlaps'][number]): number {
  return Math.round(Math.max(o.labelFrac, o.pieceFrac) * 100)
}

function consider(map: Map<string, Acc>, key: string, hit: Acc) {
  const prev = map.get(key)
  if (!prev) {
    map.set(key, hit)
    return
  }
  if (hit.times.length && !prev.times.includes(hit.times[0])) prev.times.push(hit.times[0])
  if (hit.presets[0] && !prev.presets.includes(hit.presets[0])) prev.presets.push(hit.presets[0])
  if (hit.score > prev.score) {
    prev.score = hit.score
    prev.detail = hit.detail
    prev.t = hit.t
  }
}

function absorb(map: Map<string, Acc>, line: number | undefined, component: string, title: string, samples: Sample[]) {
  const base = { line, component, title, presets: [''] as string[] }
  for (const sample of samples) {
    const presets = sample.preset ? [sample.preset] : ['']
    for (const err of sample.errors) {
      consider(map, `${line}|${component}|error|${err}`, {
        ...base,
        presets,
        score: 90,
        detail: `运行出错：${err}`,
        times: [],
      })
    }
    for (const frame of sample.frames) {
      const t = typeof frame.t === 'number' ? frame.t : 0
      for (const label of frame.labels ?? []) {
        if (!label.clear) {
          for (const o of label.overlaps ?? []) {
            // A component that names its own solid body (hall plate's I, planet name) paints it there on purpose.
            if (label.tag && o.tag === label.tag && o.weight >= 3) continue
            if (!badOverlap(o)) continue
            const pct = overlapScore(o)
            consider(map, `${line}|${component}|overlap|${label.text}|${o.tag}`, {
              ...base,
              presets,
              score: pct,
              t,
              times: [t],
              detail: `标签「${label.text}」压住了 ${o.tag.trim()}（重叠 ${pct}%），标签在 (${fmtPx(label.box.x)}, ${fmtPx(label.box.y)}) px${phys(label.box.x, label.box.y, frame)}。`,
            })
          }
          for (const hit of label.labelHits ?? []) {
            if (hit.frac < LABEL_LABEL_FRAC) continue
            const pair = [label.text, hit.text].sort().join('|')
            consider(map, `${line}|${component}|labels|${pair}`, {
              ...base,
              presets,
              score: Math.round(hit.frac * 100),
              t,
              times: [t],
              detail: `标签「${label.text}」与标签「${hit.text}」重叠（${Math.round(hit.frac * 100)}%），「${label.text}」在 (${fmtPx(label.box.x)}, ${fmtPx(label.box.y)}) px${phys(label.anchor.x, label.anchor.y, frame)}。`,
            })
          }
        }
        if (label.anchorOut) {
          consider(map, `${line}|${component}|clamp|${label.text}`, {
            ...base,
            presets,
            score: 50,
            t,
            times: [t],
            detail: `标签「${label.text}」的锚点在画布外 (${fmtPx(label.anchor.x)}, ${fmtPx(label.anchor.y)}) px，标签被挤到画布边缘 (${fmtPx(label.box.x)}, ${fmtPx(label.box.y)}) px${phys(label.anchor.x, label.anchor.y, frame)}。`,
          })
        }
      }
      for (const g of frame.geom ?? []) {
        if (!(g.area >= OFF_MIN_AREA) || !(g.weight >= 1)) continue
        const frac = g.out / g.area
        const min = g.weight >= 3 ? OFF_BODY_FRAC : OFF_FRAC
        if (!(frac >= min)) continue
        const sides = [
          { depth: g.right, name: '右侧', hint: 'xmax' },
          { depth: g.left, name: '左侧', hint: 'xmin' },
          { depth: g.top, name: '上方', hint: 'ymax' },
          { depth: g.bottom, name: '下方', hint: 'ymin' },
        ]
        const side = sides.reduce((a, b) => (b.depth > a.depth ? b : a))
        consider(map, `${line}|${component}|off|${g.tag}|${side.hint}`, {
          ...base,
          presets,
          score: Math.round(frac * 100) + (g.weight >= 3 ? 5 : 0),
          t,
          times: [t],
          detail: `${g.tag.trim()} ${outPhrase(frac)}（${side.name}），检查 v.view 的 ${side.hint}。`,
        })
      }
      const texts = frame.texts ?? []
      for (let i = 0; i < texts.length; i++) {
        for (let j = i + 1; j < texts.length; j++) {
          const a = texts[i]
          const b = texts[j]
          const boxA = { x: a.x, y: a.y, w: a.w, h: a.h }
          const boxB = { x: b.x, y: b.y, w: b.w, h: b.h }
          const area = overlapArea(boxA, boxB)
          const smaller = Math.max(Math.min(a.w * a.h, b.w * b.h), 1)
          const frac = area / smaller
          if (frac < TEXT_FRAC || a.w < 2 || b.w < 2) continue
          const pair = [a.text, b.text].sort().join('|')
          consider(map, `${line}|${component}|text|${pair}`, {
            ...base,
            presets,
            score: Math.round(frac * 100),
            t,
            times: [t],
            detail: `文字「${a.text}」与「${b.text}」重叠（${Math.round(frac * 100)}%），分别在 (${fmtPx(a.x)}, ${fmtPx(a.y)}) 与 (${fmtPx(b.x)}, ${fmtPx(b.y)}) px。`,
          })
        }
      }
    }
  }
}

// ---------- drawing-rule hints ----------

// Tools whose own text is meant to carry a number: given lengths, angles, axis ticks, event chips.
const NUMERIC_OK = /^v\.(dim|axisX|axisY|axis|angle|ruler|scale|event|grid|ticks|clock|timer|meter)/
// "= number unit": a measured or computed value. "= 0" states and bare counts are not flagged.
const VALUE_RE = /[=＝]\s*[-−+]?\s*(\d[\d.,]*)(?:\s*[×x]\s*10[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)?\s?(p_|[A-Za-zΩμ°Å℃][A-Za-z]*)/g
function hasValue(text: string): boolean {
  for (const m of text.matchAll(VALUE_RE)) {
    if (Number(m[1].replace(/,/g, '')) === 0) continue
    if (m[2] === '°') continue
    // "n=20 E=3.4 eV": the letters after 20 start the next symbol, not a unit.
    const rest = text.slice((m.index ?? 0) + m[0].length)
    if (m[2] !== 'p_' && /^(_|\s*[=＝])/.test(rest)) continue
    return true
  }
  return false
}
// Union of everything drawn, as a share of the canvas area.
const SMALL_AREA = 0.25
const WALL_WIDTH = 1.8
const WALL_MIN_LEN = 50

const baseTag = (tag?: string) => (tag ?? '').replace(/「[\s\S]*$/, '')
const quote = (tag: string) => tag.trim() || '图形'

/** Length of segment AB inside the box (Liang–Barsky clip). */
function insideLength(ax: number, ay: number, bx: number, by: number, box: Box): number {
  const dx = bx - ax
  const dy = by - ay
  let t0 = 0
  let t1 = 1
  const p = [-dx, dx, -dy, dy]
  const q = [ax - box.x, box.x + box.w - ax, ay - box.y, box.y + box.h - ay]
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return 0
      continue
    }
    const r = q[i] / p[i]
    if (p[i] < 0) {
      if (r > t1) return 0
      if (r > t0) t0 = r
    } else {
      if (r < t0) return 0
      if (r < t1) t1 = r
    }
  }
  return Math.hypot(dx, dy) * Math.max(0, t1 - t0)
}

type Pt = [number, number]
function segmentsCross(a: Pt, b: Pt, c: Pt, d: Pt): boolean {
  const o = (p: Pt, q: Pt, r: Pt) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
  return o(c, d, a) * o(c, d, b) < 0 && o(a, b, c) * o(a, b, d) < 0
}

function strokeLength(s: Stroke): number {
  let L = 0
  for (let i = 1; i < s.pts.length; i++) L += Math.hypot(s.pts[i][0] - s.pts[i - 1][0], s.pts[i][1] - s.pts[i - 1][1])
  return L
}

/** Unclipped field lines that pass through a heavy stroke, such as a vessel wall drawn with v.line. */
function wallCrossings(strokes: Stroke[]): { count: number; wall: string } {
  const walls = strokes.filter((s) => !s.field && s.width >= WALL_WIDTH && strokeLength(s) >= WALL_MIN_LEN)
  let count = 0
  let wall = ''
  if (!walls.length) return { count, wall }
  for (const f of strokes) {
    if (!f.field || f.clipped || f.pts.length < 2) continue
    const start = f.pts[0]
    const end = f.pts[f.pts.length - 1]
    // A line that starts or ends on the wall (a charged plate drawn as a heavy line) is not leaking.
    const nearEnd = (p: Pt) => Math.hypot(p[0] - start[0], p[1] - start[1]) < 8 || Math.hypot(p[0] - end[0], p[1] - end[1]) < 8
    let hit = ''
    for (let i = 1; i < f.pts.length && !hit; i++) {
      const a = f.pts[i - 1]
      const b = f.pts[i]
      if (nearEnd(a) || nearEnd(b)) continue
      for (const w of walls) {
        for (let j = 1; j < w.pts.length && !hit; j++) {
          if (segmentsCross(a, b, w.pts[j - 1], w.pts[j])) hit = w.tag
        }
        if (hit) break
      }
    }
    if (hit) {
      count++
      wall ||= hit
    }
  }
  return { count, wall }
}

function hintsOf(line: number | undefined, component: string, title: string, samples: Sample[]): LayoutIssue[] {
  const numbers = new Set<string>()
  const onLine = new Map<string, string>()
  let crossing = { count: 0, wall: '' }
  let best = { area: 0, w: 0, h: 0 }

  for (const sample of samples) {
    for (const frame of sample.frames) {
      const strokes = frame.strokes ?? []
      const items = [
        ...(frame.labels ?? []).map((l) => ({ text: l.text, tag: l.tag ?? '', box: l.box, backed: !!l.backed, label: true })),
        ...(frame.texts ?? []).map((t) => ({ text: t.text, tag: t.tag ?? '', box: { x: t.x, y: t.y, w: t.w, h: t.h }, backed: false, label: false })),
      ]
      for (const it of items) {
        if (hasValue(it.text) && !NUMERIC_OK.test(baseTag(it.tag))) numbers.add(it.text.trim())
      }

      // A label with a background plate hides the line under it, so only bare text counts.
      for (const it of items) {
        if (it.backed) continue
        // Label boxes carry 5 px / 4 px of padding around the glyphs; measure against the glyphs.
        const [px, py] = it.label ? [5, 4] : [1, 1]
        const box = { x: it.box.x + px, y: it.box.y + py, w: it.box.w - 2 * px, h: it.box.h - 2 * py }
        if (!(box.w > 2 && box.h > 2)) continue
        const need = Math.max(6, 0.6 * Math.min(box.w, box.h))
        const byTag = new Map<string, number>()
        for (const s of strokes) {
          // Vector labels inside a field cannot avoid the quiet field lines; hand-placed text can.
          if (s.tag === it.tag || (s.field && it.label)) continue
          let L = 0
          for (let i = 1; i < s.pts.length; i++) L += insideLength(s.pts[i - 1][0], s.pts[i - 1][1], s.pts[i][0], s.pts[i][1], box)
          if (L > 0) byTag.set(s.tag, (byTag.get(s.tag) ?? 0) + L)
        }
        for (const [tag, L] of byTag) {
          if (L < need) continue
          const key = `${it.text}|${tag}`
          if (!onLine.has(key)) onLine.set(key, `「${it.text}」压在 ${quote(tag)} 的线上`)
        }
      }

      const c = wallCrossings(strokes)
      if (c.count > crossing.count) crossing = c

      const W = frame.cssW || 1
      const H = frame.cssH || 1
      let x0 = Infinity
      let y0 = Infinity
      let x1 = -Infinity
      let y1 = -Infinity
      const grow = (a: number, b: number, c2: number, d: number) => {
        if (![a, b, c2, d].every(Number.isFinite)) return
        x0 = Math.min(x0, Math.max(0, a))
        y0 = Math.min(y0, Math.max(0, b))
        x1 = Math.max(x1, Math.min(W, c2))
        y1 = Math.max(y1, Math.min(H, d))
      }
      for (const g of frame.geom ?? []) {
        if (!(g.weight >= 1) || g.x0 === undefined || g.y0 === undefined || g.x1 === undefined || g.y1 === undefined) continue
        grow(g.x0, g.y0, g.x1, g.y1)
      }
      for (const s of strokes) {
        if (s.field) continue
        for (const p of s.pts) grow(p[0], p[1], p[0], p[1])
      }
      for (const l of frame.labels ?? []) grow(l.box.x, l.box.y, l.box.x + l.box.w, l.box.y + l.box.h)
      const ink = frame.ink
      const w = ink ? ink.x1 - ink.x0 : x1 > x0 ? (x1 - x0) / W : 0
      const h = ink ? ink.y1 - ink.y0 : y1 > y0 ? (y1 - y0) / H : 0
      if (w > 0 && h > 0 && w * h > best.area) best = { area: w * h, w, h }
    }
  }

  const head = `第 ${line ?? '?'} 行 <${component}>${title ? `「${title}」` : ''}：`
  const out: LayoutIssue[] = []
  const push = (message: string) => out.push({ line, component, message: head + message })
  if (numbers.size) {
    const shown = [...numbers].slice(0, 3).map((s) => `「${s}」`).join('')
    push(`图上写了数值 ${shown}${numbers.size > 3 ? ` 等 ${numbers.size} 处` : ''}。图里只留符号，数值放进 hud、<Readout> 或 note。`)
  }
  if (onLine.size) {
    const list = [...onLine.values()]
    push(`文字压线：${list.slice(0, 3).join('；')}${list.length > 3 ? ` 等 ${list.length} 处` : ''}。把文字挪到线旁边，或改用 v.label（会自动避让）。`)
  }
  if (crossing.count >= 2) {
    push(`有 ${crossing.count} 条场线穿过了 ${quote(crossing.wall)}（像器壁）。用 clip 把 v.efield 的场线限在容器里。`)
  }
  if (best.area > 0 && best.area < SMALL_AREA) {
    const fix =
      best.h >= 0.6 ? '左右留白多：写 size="narrow"，或把几个物体并排放进同一画面' : best.w >= 0.6 ? '上下留白多：把 height 调小' : '收紧 v.view 的范围，或把 height 调小'
    push(`画面内容只占画布约 ${Math.round(best.area * 100)}%（宽 ${Math.round(best.w * 100)}%、高 ${Math.round(best.h * 100)}%），物体显得小。${fix}。`)
  }
  return out
}

function formatTimes(times: number[]): string {
  const labels: string[] = []
  for (const t of [...new Set(times)].sort((a, b) => a - b)) {
    const s = fmtT(t)
    if (!labels.includes(s)) labels.push(s)
  }
  const shown = labels.slice(0, 4)
  const more = labels.length > 4 ? ` 等 ${labels.length} 个时刻` : ''
  return `${shown.join('、')} s${more}`
}

function sentence(a: Acc): string {
  const title = a.title ? `「${a.title}」` : ''
  const presets = [...new Set(a.presets.filter(Boolean))]
  const preset = presets.length ? `（${presets.join('、')}）` : ''
  const when = a.component === 'Sim' && a.times.length ? `t = ${formatTimes(a.times)}` : ''
  return `第 ${a.line ?? '?'} 行 <${a.component}>${title}${preset}${when}：${a.detail}`
}

function paramsOf(names: unknown, scope: Record<string, unknown>): Record<string, unknown> {
  const list = Array.isArray(names) ? names.filter((n): n is string => typeof n === 'string') : []
  return Object.fromEntries(list.map((n) => [n, opticsPayload(motionPayload(scope[n]))]))
}

function statesOf(comps: Comp[]): { preset: string; scope: Record<string, number> }[] {
  const reg = buildRegistry(comps)
  const initial = new ParamStore(reg).getScope()
  const states = [{ preset: '', scope: initial }]
  for (const p of comps) {
    if (p.name !== 'Preset') continue
    const store = new ParamStore(reg)
    const base = store.getScope()
    const set = Object.fromEntries(
      Object.entries((p.props.set ?? {}) as Record<string, unknown>).map(([k, v]) => [k, num(v, base)]),
    )
    store.set(set)
    const label = typeof p.props.label === 'string' ? p.props.label : '未命名'
    states.push({ preset: `快捷按钮「${label}」`, scope: store.getScope() })
  }
  return states
}

function check(source: string): LayoutReport {
  const lesson = parseLesson(source)
  const comps = lesson.blocks.filter((b): b is Comp => b.kind === 'component')
  const main = comps.filter((b) => MAIN.has(b.name))
  const widthOf = spans(main)
  const states = statesOf(comps)
  const map = new Map<string, Acc>()
  const hints: LayoutIssue[] = []

  main.forEach((block, index) => {
    if (block.name !== 'Sim' && block.name !== 'Figure') return
    const title = typeof block.props.title === 'string' ? block.props.title : ''
    const width = cellWidth(widthOf[index] ?? 12)
    const height = sceneHeight(block.props)
    const initial = states[0]
    const runs = []
    if (block.name === 'Sim') {
      const duration = Math.max(num(block.props.duration, initial.scope, 5), 0.001)
      const marks = ((block.props.marks ?? []) as { t?: unknown }[])
        .map((m) => num(m?.t, initial.scope, NaN))
        .filter((t) => Number.isFinite(t))
      if (!Number.isFinite(duration)) {
        consider(map, `${block.line}|Sim|error|duration`, {
          line: block.line,
          component: 'Sim',
          title,
          presets: [''],
          score: 80,
          detail: 'duration 不是有限数，画面没法取样。',
          times: [],
        })
        return
      }
      runs.push({ preset: '', params: paramsOf(block.props.params, initial.scope), times: sampleTimes(duration, marks) })
    } else {
      for (const state of states) {
        runs.push({ preset: state.preset, params: paramsOf(block.props.params, state.scope), times: [0] })
      }
    }
    let samples: Sample[]
    try {
      samples = runScene(block.body ?? '', width, height, runs)
    } catch (e) {
      samples = [{ preset: '', frames: [], errors: [clip((e as Error).message)] }]
    }
    absorb(map, block.line, block.name, title, samples)
    hints.push(...hintsOf(block.line, block.name, title, samples))
  })

  const grouped = [...map.values()]
  const byScene = new Map<string, Acc[]>()
  for (const hit of grouped) {
    const k = `${hit.line}|${hit.component}`
    const list = byScene.get(k) ?? []
    list.push(hit)
    byScene.set(k, list)
  }
  let kept: Acc[] = []
  let dropped = 0
  for (const list of byScene.values()) {
    list.sort((a, b) => b.score - a.score)
    kept.push(...list.slice(0, PER_SCENE))
    dropped += Math.max(0, list.length - PER_SCENE)
  }
  kept.sort((a, b) => b.score - a.score)
  if (kept.length > GLOBAL_CAP) {
    dropped += kept.length - GLOBAL_CAP
    kept = kept.slice(0, GLOBAL_CAP)
  }
  kept.sort((a, b) => (a.line ?? 0) - (b.line ?? 0) || (a.t ?? 0) - (b.t ?? 0))
  const issues: LayoutIssue[] = kept.map((a) => ({
    line: a.line,
    component: a.component,
    t: a.component === 'Sim' && a.times.length === 1 ? a.times[0] : a.t,
    message: sentence(a),
  }))
  const ok = issues.length === 0
  if (dropped > 0) issues.push({ component: '', message: `其余 ${dropped} 个问题已省略。` })
  return { ok, issues, hints }
}

export async function checkLayout(source: string): Promise<LayoutReport> {
  try {
    return check(source)
  } catch (e) {
    return { ok: false, issues: [{ component: 'lesson', message: `排版检查没有跑完：${clip((e as Error).message)}` }] }
  }
}

export function formatLayoutReport(r: LayoutReport): string {
  const hints = r.hints ?? []
  const tail = hints.length ? ['', `作图建议（不影响通过）：${hints.length} 条`, ...hints.map((h) => h.message)] : []
  if (r.ok || r.issues.length === 0) return ['排版检查：没有发现问题。', ...tail].join('\n')
  const n = r.issues.filter((i) => i.component).length
  return [`排版检查：${n} 个问题`, ...r.issues.map((i) => i.message), ...tail].join('\n')
}
