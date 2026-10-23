/*
 * 碰撞画面的画法（纯函数，不依赖 React，方便测试）。
 * 照原型移植：mockups/collision/lib.js 的 MOM.track、MOM.cart、MOM.vArrow、MOM.sim、MOM.rr、MOM.f，
 * draw.js 的 bars、rubberFace、COL.scene，act7.js 小测里的碰前小球。
 * 颜色和字体由调用方传进来：颜色只取调色板，数字用等宽字体。
 */

export type Surface = 'magnet' | 'rubber' | 'velcro'
export const SURFACES: readonly Surface[] = ['magnet', 'rubber', 'velcro']

export interface Colors {
  velocity: string
  ink: string
  steel: string
  graphite: string
  charge: string
  card: string
  /** 导轨和小车渐变的底色：原型的 --c-bar，调色板里对应 hairline */
  bar: string
}

export interface Fonts {
  /** 数字（等宽） */
  num: string
  /** 符号（斜体衬线，A、B） */
  sym: string
  /** 文字 */
  ui: string
}

export const DEFAULT_FONTS: Fonts = {
  num: "'JetBrains Mono', ui-monospace, Menlo, monospace",
  sym: "'Source Serif 4', 'Times New Roman', serif",
  ui: "'Noto Sans SC', -apple-system, 'PingFang SC', sans-serif",
}

export interface CollisionData {
  mA: number
  mB: number
  /** 碰前速度，向右为正（m/s） */
  vA: number
  vB: number
  /** 碰后速度（m/s） */
  a: number
  b: number
  side: Surface
}

export interface Digits {
  /** 速度的小数位。缺省时按实测值：整百分位写 2 位，否则写 3 位 */
  v?: number
  /** 动量的小数位 */
  p: number
  /** 动能的小数位 */
  k: number
}

export interface DrawOpts {
  r: CollisionData
  /** 画不画动量、动能柱子，默认 true */
  bars?: boolean
  /** 左上角说明 */
  label?: string
  names?: readonly [string, string]
  massText?: readonly [string, string]
  digits?: Digits
  body?: 'cart' | 'ball'
  /** 只画碰前一帧（t 不起作用） */
  still?: boolean
  fonts?: Fonts
}

export interface SceneInfo {
  /** 播完的时刻（秒）；静态画面为 0 */
  T: number
  /** 接触开始的时刻（秒） */
  tc: number
  /** 这一帧两车的速度（m/s） */
  vA: number
  vB: number
  /** 已过接触段：velcro 时两车画成一体，只画 A 的箭头 */
  after: boolean
}

/**
 * 画布默认高度：小球 200；有柱子 360；只画碰前 160；其余 200。
 * bars 是表达式时（barsMaybe）按有柱子算，免得随节拍改变高度。
 */
export function defaultHeight(o: { body?: 'cart' | 'ball'; still: boolean; barsMaybe: boolean }): number {
  if (o.body === 'ball') return 200
  if (o.barsMaybe) return 360
  return o.still ? 160 : 200
}

/** 动量和、动能和：碰前（after=false）或碰后（after=true） */
export function momentum(r: CollisionData, after: boolean): number {
  return after ? r.mA * r.a + r.mB * r.b : r.mA * r.vA + r.mB * r.vB
}
export function kinetic(r: CollisionData, after: boolean): number {
  return after
    ? 0.5 * r.mA * r.a * r.a + 0.5 * r.mB * r.b * r.b
    : 0.5 * r.mA * r.vA * r.vA + 0.5 * r.mB * r.vB * r.vB
}

// ---------- 小工具（原型 MOM.f、MOM.rgba、MOM.rr） ----------

/** 定小数位，负号用"−" */
export function fmt(x: number, d: number): string {
  const s = Math.abs(x) < 1e-12 ? (0).toFixed(d) : x.toFixed(d)
  return s.charAt(0) === '-' ? '−' + s.slice(1) : s
}

/** 质量等的默认写法：0.4、0.1，不带多余的尾零 */
export function plain(x: number): string {
  return String(Number(x.toPrecision(6)))
}

/** '#rrggbb' 加透明度；解析不了就原样返回 */
export function rgba(c: string, a: number): string {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c || '')
  if (!m) return c
  let h = m[1]
  if (h.length === 3) h = h.replace(/./g, '$&$&')
  const n = parseInt(h, 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

const TAU = Math.PI * 2

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

interface Env {
  ctx: CanvasRenderingContext2D
  C: Colors
  F: Fonts
}

interface TextOpts {
  font?: 'num' | 'sym'
  size?: number
  color: string
  align?: CanvasTextAlign
}

/** 原型的 GRAV.draw.text：字号默认 13 */
function text(e: Env, s: string, x: number, y: number, o: TextOpts) {
  const { ctx, F } = e
  const size = o.size ?? 13
  ctx.save()
  ctx.font = o.font === 'num' ? `${size}px ${F.num}` : o.font === 'sym' ? `italic ${size}px ${F.sym}` : `${size}px ${F.ui}`
  ctx.fillStyle = o.color
  ctx.textAlign = o.align ?? 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(s, x, y)
  ctx.restore()
}

/** 原型的 GRAV.draw.arrow */
function arrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, width: number) {
  const ang = Math.atan2(y2 - y1, x2 - x1)
  const hl = Math.max(8, width * 4)
  const hw = Math.max(4, width * 1.8)
  const bx = x2 - hl * Math.cos(ang)
  const by = y2 - hl * Math.sin(ang)
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(bx, by)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(bx - hw * Math.sin(ang), by + hw * Math.cos(ang))
  ctx.lineTo(bx + hw * Math.sin(ang), by - hw * Math.cos(ang))
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

// ---------- 气垫导轨（MOM.track） ----------

function track(e: Env, x0: number, x1: number, y: number) {
  const { ctx, C } = e
  ctx.save()
  rr(ctx, x0, y, x1 - x0, 10, 3)
  const g = ctx.createLinearGradient(0, y, 0, y + 10)
  g.addColorStop(0, C.bar)
  g.addColorStop(1, rgba(C.steel, 0.45))
  ctx.fillStyle = g
  ctx.fill()
  ctx.lineWidth = 1
  ctx.strokeStyle = rgba(C.graphite, 0.55)
  ctx.stroke()
  // 气孔
  ctx.fillStyle = rgba(C.graphite, 0.35)
  for (let x = x0 + 16; x < x1 - 10; x += 22) {
    ctx.beginPath()
    ctx.arc(x, y + 3.5, 1, 0, TAU)
    ctx.fill()
  }
  // 两端挡板
  ctx.fillStyle = C.graphite
  rr(ctx, x0 - 4, y - 16, 6, 26, 2)
  ctx.fill()
  rr(ctx, x1 - 2, y - 16, 6, 26, 2)
  ctx.fill()
  ctx.restore()
}

// ---------- 小车（MOM.cart）：x 是左边缘，y 是导轨顶面 ----------

interface CartOpts {
  name?: string
  label?: string
  heavy: boolean
  /** 1：右侧（朝向对方的是 A），-1：左侧 */
  face: 1 | -1
  /** 车身上画的碰撞面：磁体、粘扣；橡皮画在 rubberFace 里 */
  side?: 'magnet' | 'velcro'
}

function cart(e: Env, x: number, y: number, w: number, h: number, o: CartOpts) {
  const { ctx, C } = e
  const top = y - h - 3
  ctx.save()
  rr(ctx, x, top, w, h, 6)
  const g = ctx.createLinearGradient(0, top, 0, top + h)
  g.addColorStop(0, C.card)
  g.addColorStop(1, C.bar)
  ctx.fillStyle = g
  ctx.fill()
  ctx.lineWidth = 1.2
  ctx.strokeStyle = C.graphite
  ctx.stroke()
  // 质量块条纹
  if (o.heavy) {
    ctx.fillStyle = rgba(C.graphite, 0.18)
    rr(ctx, x + 8, top + 6, w - 16, 6, 2)
    ctx.fill()
  }
  // 碰撞面：靠形状区分，不用速度色和能量色
  if (o.side) {
    const face = o.face
    const fx2 = face > 0 ? x + w : x - 6
    const fy = top + h * 0.26
    const fh = h * 0.48
    if (o.side === 'velcro') {
      ctx.fillStyle = C.graphite
      rr(ctx, fx2 + (face > 0 ? 0 : 3), fy, 3, fh, 1)
      ctx.fill()
      ctx.strokeStyle = C.graphite
      ctx.lineWidth = 1.2
      for (let k = 0; k < 5; k++) {
        const yy = fy + 2 + (k * (fh - 4)) / 4
        const xa = fx2 + 3
        const xb = face > 0 ? fx2 + 6 : fx2
        ctx.beginPath()
        ctx.moveTo(xa, yy)
        ctx.lineTo(xb, yy)
        ctx.stroke()
      }
    } else {
      ctx.fillStyle = C.ink
      rr(ctx, fx2, fy, 6, fh, 1.5)
      ctx.fill()
      ctx.fillStyle = C.card
      ctx.fillRect(fx2, fy + fh / 2 - 0.6, 6, 1.2)
    }
  }
  ctx.restore()
  if (o.label) text(e, o.label, x + w / 2, top + h / 2 + 5, { font: 'num', size: 14, color: C.ink, align: 'center' })
  if (o.name) text(e, o.name, x + w / 2, top - 10, { font: 'sym', size: 14, color: C.graphite, align: 'center' })
}

/** 橡皮碰撞面：画在车朝向对方的一侧，用石墨色，和磁体（墨色）、粘扣（斜纹）区分 */
function rubberFace(e: Env, x: number, y: number, w: number, h: number, face: 1 | -1) {
  const { ctx, C } = e
  const top = y - h - 3
  const fx = face > 0 ? x + w : x - 5
  ctx.save()
  ctx.fillStyle = C.graphite
  rr(ctx, fx, top + h * 0.3, 5, h * 0.4, 1.5)
  ctx.fill()
  ctx.restore()
}

// ---------- 速度箭头（MOM.vArrow）：从 (x, y) 起，v>0 向右；scale 像素/(m/s) ----------

/**
 * 标签居中写在箭头上方；靠近导轨两端时挪进 [x0, x1]，不被画布裁掉（原型没有这一步，宽屏下碰不到边）。
 * 假的上下文没有 measureText 时就不挪。
 */
function labelX(e: Env, s: string, x: number, bounds: readonly [number, number]): number {
  const { ctx, F } = e
  if (typeof ctx.measureText !== 'function') return x
  ctx.save()
  ctx.font = `13px ${F.num}`
  const half = ctx.measureText(s).width / 2
  ctx.restore()
  return Math.min(Math.max(x, bounds[0] + half), bounds[1] - half)
}

function vArrow(e: Env, x: number, y: number, v: number, scale: number, label: string, bounds: readonly [number, number]) {
  const { ctx, C } = e
  if (Math.abs(v) < 1e-6) {
    text(e, '静止', x, y + 4, { size: 13, color: C.graphite, align: 'center' })
    return
  }
  const len = v * scale
  arrow(ctx, x, y, x + len, y, C.velocity, 2)
  text(e, label, labelX(e, label, x + len / 2, bounds), y - 8, { font: 'num', size: 13, color: C.velocity, align: 'center' })
}

// ---------- 一维碰撞的时间线（MOM.sim） ----------

/** 接触过程的时长（秒）和碰后段的时长（秒） */
const TR = 0.14
const AFTER = 1.7
/** 不相碰（相对速度不朝向对方）时的画面时长 */
const NO_HIT_T = 2.6

interface SimCfg {
  xA0: number
  xB0: number
  wA: number
  wB: number
  vA: number
  vB: number
  a: number
  b: number
  /** 像素/(m/s)/秒 */
  k: number
  /** 停在接触前 */
  hold: boolean
}

/**
 * 接触不是瞬间完成的：接触的 TR 秒里，两车速度线性过渡到碰后值。
 * 返回 t 时刻两车左边缘的像素位置和速度；T 是播完的时刻。
 */
export function simulate(t: number, cfg: SimCfg) {
  const gap = cfg.xB0 - (cfg.xA0 + cfg.wA)
  const rel = (cfg.vA - cfg.vB) * cfg.k
  // 不朝向对方运动就不会相碰
  const tc = rel > 0 ? Math.max(0, gap) / rel : Infinity
  const T = Number.isFinite(tc) ? tc + TR + AFTER : NO_HIT_T
  const tt = Math.max(0, cfg.hold ? Math.min(t, tc - 0.02) : Math.min(t, T))
  const vel = (v0: number, v1: number, s: number) => {
    if (s <= tc) return v0
    if (s >= tc + TR) return v1
    return v0 + ((v1 - v0) * (s - tc)) / TR
  }
  // 位置 = 速度的积分（分三段算）
  const pos = (x0: number, v0: number, v1: number, s: number) => {
    let d = Math.min(s, tc) * v0
    if (s > tc) {
      const u = Math.min(s, tc + TR) - tc
      d += v0 * u + ((v1 - v0) * u * u) / (2 * TR)
    }
    if (s > tc + TR) d += v1 * (s - tc - TR)
    return x0 + d * cfg.k
  }
  const xB = pos(cfg.xB0, cfg.vB, cfg.b, tt)
  const xA = Math.min(pos(cfg.xA0, cfg.vA, cfg.a, tt), xB - cfg.wA) // 接触时不穿透
  return {
    T,
    tc,
    xA,
    xB,
    vA: vel(cfg.vA, cfg.a, tt),
    vB: vel(cfg.vB, cfg.b, tt),
    after: tt > tc + TR / 2,
  }
}

// ---------- 柱子（原型 draw.js 的 bars、range） ----------

interface Range {
  pos: number
  neg: number
}

function rangeOf(vals: number[], pre: number): Range {
  const all = [...vals, pre]
  return {
    pos: Math.max(...all, 1e-9) * 1.2,
    neg: -Math.min(...all, 0) * 1.25,
  }
}

interface Box {
  x: number
  y: number
  w: number
  h: number
}

interface BarOpts {
  title: string
  dp: number
  /** 三根柱子的标签：A、B、和 */
  names: readonly [string, string, string]
  /** 动能柱用能量色 */
  gold: boolean
}

function bars(e: Env, box: Box, now: number[], R: Range, nf: number, pre: number, o: BarOpts) {
  const { ctx, C } = e
  const top = box.y + 30
  const bot = box.y + box.h - 24
  const zero = bot - (bot - top) * nf
  const Y = (v: number) => zero - ((zero - top) * v) / R.pos
  const bw = Math.min(28, box.w / 6)
  const gap = (box.w - 3 * bw) / 4
  const xl = box.x + gap * 0.5
  const xr = box.x + box.w - gap * 0.5
  ctx.save()
  ctx.strokeStyle = C.steel
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(xl, zero)
  ctx.lineTo(xr, zero)
  ctx.stroke()
  ctx.setLineDash([3, 3])
  ctx.strokeStyle = C.graphite
  ctx.beginPath()
  ctx.moveTo(xl, Y(pre))
  ctx.lineTo(xr, Y(pre))
  ctx.stroke()
  ctx.restore()
  text(e, '碰前', xl, Y(pre) - 5, { size: 13, color: C.graphite })
  for (let i = 0; i < 3; i++) {
    const x = box.x + gap + i * (bw + gap)
    const v = now[i]
    const y1 = Y(v)
    const total = i === 2
    if (o.gold) ctx.fillStyle = total ? C.charge : rgba(C.charge, 0.42)
    else ctx.fillStyle = total ? C.ink : rgba(C.steel, 0.75)
    ctx.fillRect(x, Math.min(zero, y1), bw, Math.max(1, Math.abs(y1 - zero)))
    text(e, o.names[i], x + bw / 2, box.y + box.h - 4, { size: 13, color: total ? C.ink : C.graphite, align: 'center' })
    if (total) text(e, fmt(v, o.dp), x + bw / 2, Math.min(zero, y1) - 6, { font: 'num', size: 13, color: C.ink, align: 'center' })
  }
  text(e, o.title, box.x + box.w / 2, box.y + 14, { size: 14, color: C.graphite, align: 'center' })
}

// ---------- 碰前的小球（原型 act7.js 的 preDraw、ball） ----------

function ball(e: Env, x: number, y: number, r: number, massText: string, name: string) {
  const { ctx, C } = e
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y + r * 0.08, r, 0, TAU)
  ctx.fillStyle = rgba(C.graphite, 0.12)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r)
  g.addColorStop(0, C.card)
  g.addColorStop(1, C.bar)
  ctx.fillStyle = g
  ctx.fill()
  ctx.lineWidth = 1.2
  ctx.strokeStyle = C.graphite
  ctx.stroke()
  ctx.restore()
  text(e, massText, x, y + 5, { font: 'num', size: 14, color: C.ink, align: 'center' })
  if (name) text(e, name, x, y - r - 10, { font: 'sym', size: 14, color: C.graphite, align: 'center' })
}

function drawBalls(e: Env, w: number, h: number, r: CollisionData, names: readonly [string, string], massText: readonly [string, string], label: string | undefined) {
  const { ctx, C } = e
  const masses = [r.mA, r.mB]
  const vs = [r.vA, r.vB]
  const vmax = Math.max(Math.abs(r.vA), Math.abs(r.vB), 1e-9)
  const sc = Math.min(130, w * 0.2) / vmax
  const mmax = Math.max(r.mA, r.mB, 1e-9)
  // 球的大小随质量变（半径 22 到 40 像素）
  const rs = masses.map((m) => 22 + 18 * Math.sqrt(Math.max(m, 0) / mmax))
  const rmax = Math.max(...rs)
  const y = h * 0.4
  const cx = [w * 0.26, w * 0.7]
  ctx.save()
  ctx.strokeStyle = rgba(C.graphite, 0.35)
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(8, y + rmax + 10)
  ctx.lineTo(w - 8, y + rmax + 10)
  ctx.stroke()
  ctx.restore()
  const ay = y + rmax + 38
  for (let i = 0; i < 2; i++) {
    ball(e, cx[i], y, rs[i], massText[i], names[i])
    vArrow(e, cx[i], ay, vs[i], sc, `${Math.abs(vs[i])} m/s`, [8, w - 8])
  }
  text(e, '碰前 · 向右为正', w - 8, 16, { size: 13, color: C.graphite, align: 'right' })
  if (label) text(e, label, 8, 16, { size: 13, color: C.graphite })
}

// ---------- 画面（原型 COL.scene） ----------

/**
 * 画一帧。t 是播放开始后的秒数（物理时间），超过 SceneInfo.T 就停在最后一帧。
 * 布局、节奏和原型一致：导轨在上，动量、动能两组柱子在下，虚线是碰前的值。
 */
export function drawScene(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, C: Colors, o: DrawOpts): SceneInfo {
  const e: Env = { ctx, C, F: o.fonts ?? DEFAULT_FONTS }
  const r = o.r
  const names: readonly [string, string] = o.names ?? ['A', 'B']
  const massText: readonly [string, string] = o.massText ?? [`${plain(r.mA)} kg`, `${plain(r.mB)} kg`]
  const digits: Digits = o.digits ?? { p: 3, k: 3 }
  const still = o.still === true

  if (o.body === 'ball') {
    drawBalls(e, w, h, r, names, massText, o.label)
    return { T: 0, tc: 0, vA: r.vA, vB: r.vB, after: false }
  }

  const narrow = w < 520
  const showBars = o.bars !== false
  const x0 = 8
  const x1 = w - 8
  const y = showBars ? Math.max(100, h * 0.24) : h * 0.42
  const cw = Math.max(64, Math.min(110, w * 0.15))
  const chH = Math.max(30, Math.min(40, cw * 0.36))
  const wA = cw * (r.mA > r.mB ? 1.12 : r.mA < r.mB ? 0.9 : 1)
  const wB = cw * (r.mB > r.mA ? 1.12 : r.mB < r.mA ? 0.9 : 1)
  const vmax = Math.max(Math.abs(r.vA), Math.abs(r.vB), Math.abs(r.a), Math.abs(r.b), 1e-9)
  const s = simulate(still ? 0 : t, {
    xA0: x0 + 8,
    xB0: x0 + (x1 - x0) * (r.vB > 0 ? 0.32 : 0.42),
    wA,
    wB,
    vA: r.vA,
    vB: r.vB,
    a: r.a,
    b: r.b,
    k: ((x1 - x0) * 0.2) / vmax,
    hold: still,
  })
  const xB = Math.min(s.xB, x1 - 2 - wB)
  const xA = Math.max(x0 + 2, Math.min(s.xA, xB - wA))
  track(e, x0, x1, y)
  const side = r.side === 'rubber' ? undefined : r.side
  cart(e, xA, y, wA, chH, { name: names[0], label: massText[0], heavy: r.mA > r.mB, face: 1, side })
  cart(e, xB, y, wB, chH, { name: names[1], label: massText[1], heavy: r.mB > r.mA, face: -1, side })
  if (r.side === 'rubber') {
    rubberFace(e, xA, y, wA, chH, 1)
    rubberFace(e, xB, y, wB, chH, -1)
  }

  const ay = y + 28
  const sc = ((narrow ? 50 : 70) * 0.8) / vmax
  const arrowAt = (cx: number, yy: number, v: number) => {
    const x = v > 0 ? Math.min(cx, x1 - 4 - v * sc) : Math.max(cx, x0 + 4 - v * sc)
    // 缺省小数位：实测值是整百分位写 2 位，否则写 3 位（0.297 写三位，0.60 写两位）
    const d = digits.v ?? (Math.abs(Math.round(v * 100) - v * 100) > 1e-6 ? 3 : 2)
    vArrow(e, x, yy, v, sc, `${fmt(v, d)} m/s`, [x0, x1])
  }
  const stuck = r.side === 'velcro' && s.after
  arrowAt(xA + wA / 2, ay, s.vA)
  if (!stuck) arrowAt(xB + wB / 2, ay + 24, s.vB)
  text(e, '向右为正', x1, 16, { size: 13, color: C.graphite, align: 'right' })
  if (o.label) text(e, o.label, x0, 16, { size: 13, color: C.graphite })

  const info: SceneInfo = { T: still ? 0 : s.T, tc: s.tc, vA: s.vA, vB: s.vB, after: s.after }
  if (!showBars) return info

  const pNow = [r.mA * s.vA, r.mB * s.vB]
  const kNow = [0.5 * r.mA * s.vA * s.vA, 0.5 * r.mB * s.vB * s.vB]
  pNow.push(pNow[0] + pNow[1])
  kNow.push(kNow[0] + kNow[1])
  const pAll = [r.mA * r.vA, r.mB * r.vB, r.mA * r.a, r.mB * r.b, momentum(r, true)]
  const kAll = [0.5 * r.mA * r.vA * r.vA, 0.5 * r.mB * r.vB * r.vB, 0.5 * r.mA * r.a * r.a, 0.5 * r.mB * r.b * r.b, kinetic(r, true)]
  const preP = momentum(r, false)
  const preK = kinetic(r, false)
  const Rp = rangeOf(pAll, preP)
  const Rk = rangeOf(kAll, preK)
  // 两组共用一条零线：零线以下占的比例取较大者
  const nf = Math.max(Rp.neg / (Rp.pos + Rp.neg), Rk.neg / (Rk.pos + Rk.neg))
  const top = y + 78
  const bh = Math.max(20, Math.min(h - top - 8, 300))
  const gw = Math.min((x1 - x0) / 2, 300)
  const bx = narrow ? x0 : x0 + 20
  const bn: [string, string, string] = [names[0], names[1], '和']
  bars(e, { x: bx, y: top, w: gw - 10, h: bh }, pNow, Rp, nf, preP, { title: '动量（kg·m/s）', dp: digits.p, names: bn, gold: false })
  bars(e, { x: bx + gw + 10, y: top, w: gw - 10, h: bh }, kNow, Rk, nf, preK, { title: '动能（J）', dp: digits.k, names: bn, gold: true })
  return info
}
