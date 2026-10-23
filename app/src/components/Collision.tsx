import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { num, type Scope } from '../lesson/expr'
import type { Props } from '../lesson/parse'
import { namesIn, reducedMotion, useScopeFor } from '../lesson/store'
import { palette, useTheme, type ThemeName } from '../theme'
import {
  DEFAULT_FONTS,
  SURFACES,
  defaultHeight,
  drawScene,
  plain,
  type Colors,
  type CollisionData,
  type Digits,
  type Fonts,
  type SceneInfo,
  type Surface,
} from './collisionDraw'
import { PlayGate } from './step/playGate'

/** 动画走到头的标记：比任何时长都大，画面就是最后一帧 */
const END = 1e4
/** 一帧最多走多少秒，切到后台再回来不会跳到终点 */
const MAX_DT = 0.1

const SURFACE_NAME: Record<Surface, string> = { magnet: '磁体', rubber: '橡皮', velcro: '粘扣' }
const SURFACE_NOTE: Record<Surface, string> = { magnet: '碰后弹开', rubber: '碰后弹开', velcro: '碰后粘住' }

interface Model {
  data: CollisionData | null
  error: string | null
  still: boolean
  body: 'cart' | 'ball'
  names: [string, string]
  massText: [string, string]
  label: string | undefined
  digits: Digits
  /** 这一帧画不画柱子 */
  bars: boolean
  /** bars 写了（真值或表达式）就按有柱子定高度 */
  barsMaybe: boolean
  /** 数据变了就从头播：只看会影响画面运动的值 */
  key: string
}

/** 两项数字或表达式，求值后要都是有限数 */
function pairOf(value: unknown, scope: Scope): [number, number] | null {
  if (!Array.isArray(value) || value.length < 2) return null
  const a = num(value[0], scope, NaN)
  const b = num(value[1], scope, NaN)
  return Number.isFinite(a) && Number.isFinite(b) ? [a, b] : null
}

function surfaceOf(value: unknown, scope: Scope): Surface | null {
  if (value === undefined) return 'magnet'
  if (typeof value === 'string' && (SURFACES as readonly string[]).includes(value)) return value as Surface
  // 写表达式时取值 0 / 1 / 2 依次对应 magnet / rubber / velcro
  const n = num(value, scope, NaN)
  return Number.isInteger(n) && n >= 0 && n < SURFACES.length ? SURFACES[n] : null
}

function buildModel(props: Props, scope: Scope): Model {
  const still = props.still === true
  const body: 'cart' | 'ball' = props.body === 'ball' ? 'ball' : 'cart'
  const barsRaw = props.bars
  const bars = barsRaw === undefined ? true : typeof barsRaw === 'boolean' ? barsRaw : num(barsRaw, scope, 1) !== 0
  const barsMaybe = barsRaw !== false
  const d = (typeof props.digits === 'object' && props.digits ? props.digits : {}) as Record<string, unknown>
  const digits: Digits = {
    v: typeof d.v === 'number' ? d.v : undefined,
    p: typeof d.p === 'number' ? d.p : 3,
    k: typeof d.k === 'number' ? d.k : 3,
  }
  const names: [string, string] =
    Array.isArray(props.names) && props.names.length >= 2 ? [String(props.names[0]), String(props.names[1])] : ['A', 'B']
  const base = { still, body, names, digits, bars, barsMaybe }
  const fail = (error: string) => ({ ...base, data: null, error, massText: ['', ''] as [string, string], label: undefined, key: '' })

  const m = pairOf(props.m, scope)
  if (!m) return fail('Collision 的 m 要写两个质量（kg），每项是数字或表达式')
  const v = pairOf(props.v, scope)
  if (!v) return fail('Collision 的 v 要写两个碰前速度（m/s），每项是数字或表达式')
  let after = pairOf(props.after, scope)
  if (!after) {
    // 静止画面（still）不需要碰后速度：画成没有碰撞
    if (!still) return fail('Collision 需要 after（两个碰后速度，m/s）；只画碰前一帧请写 still')
    after = v
  }
  const side = surfaceOf(props.surface, scope)
  if (!side) return fail(`Collision 的 surface 不认识：${String(props.surface)}，应为 magnet、rubber 或 velcro`)

  const data: CollisionData = { mA: m[0], mB: m[1], vA: v[0], vB: v[1], a: after[0], b: after[1], side }
  const massText: [string, string] = [
    Array.isArray(props.massText) && props.massText[0] !== undefined ? String(props.massText[0]) : `${plain(m[0])} kg`,
    Array.isArray(props.massText) && props.massText[1] !== undefined ? String(props.massText[1]) : `${plain(m[1])} kg`,
  ]
  const label =
    typeof props.label === 'string' ? props.label : props.surface === undefined ? undefined : `碰撞面：${SURFACE_NAME[side]}，${SURFACE_NOTE[side]}`
  const key = JSON.stringify([m, v, after, side, still, body])
  return { ...base, data, error: null, massText, label, key }
}

let fontCache: Fonts | null = null
/** 画布上的字体：从 styles.css 的字体变量取，取不到用默认栈 */
function canvasFonts(): Fonts {
  if (fontCache) return fontCache
  if (typeof document === 'undefined') return DEFAULT_FONTS
  const cs = getComputedStyle(document.documentElement)
  const get = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback
  fontCache = {
    num: get('--font-mono', DEFAULT_FONTS.num),
    sym: get('--font-symbol', DEFAULT_FONTS.sym),
    ui: get('--font-sans', DEFAULT_FONTS.ui),
  }
  return fontCache
}

function colorsOf(theme: ThemeName): Colors {
  const p = palette(theme)
  return {
    velocity: p.velocity,
    ink: p.ink,
    steel: p.steel,
    graphite: p.graphite,
    charge: p.charge,
    card: p.card,
    bar: p.hairline,
  }
}

/**
 * `<Collision m={[0.4, 0.2]} v={[0.6, 0]} after={[0.297, 0.594]} surface="rubber" />`
 * 一维两体碰撞：导轨、两车（或两球）、速度箭头，下面是动量、动能两组柱子。
 */
export function Collision({ props }: { props: Props }) {
  const theme = useTheme()
  const gate = useContext(PlayGate)
  const scope = useScopeFor(namesIn([props.m, props.v, props.after, props.surface, props.bars]))
  const model = useMemo(() => buildModel(props, scope), [props, scope])
  const { data, still, body } = model
  // 只有小车、非静止的画面会动；小球和 still 只画碰前
  const animated = data !== null && !still && body === 'cart'
  const hasData = data !== null

  const figureRef = useRef<HTMLElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [width, setWidth] = useState(0)
  const [onScreen, setOnScreen] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [finished, setFinished] = useState(false)
  const tRef = useRef(0)
  const height = typeof props.height === 'number' ? props.height : defaultHeight({ body, still, barsMaybe: model.barsMaybe })

  // 每次渲染都更新画法；rAF 循环和重绘都调它，避免闭包读到旧值
  const paintRef = useRef<(t: number) => SceneInfo | null>(() => null)
  paintRef.current = (t: number) => {
    const c = canvasRef.current
    if (!c || !data || width <= 0) return null
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const pw = Math.round(width * dpr)
    const ph = Math.round(height * dpr)
    // 改尺寸会清空画布，只在变了的时候改
    if (c.width !== pw) c.width = pw
    if (c.height !== ph) c.height = ph
    const ctx = c.getContext('2d')
    if (!ctx) return null
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    return drawScene(ctx, width, height, t, colorsOf(theme), {
      r: data,
      bars: model.bars,
      label: model.label,
      names: model.names,
      massText: model.massText,
      digits: model.digits,
      body,
      still,
      fonts: canvasFonts(),
    })
  }

  // 从头播（或停在起点、或直接画终态）。参数变了、步进开关变了都走这里。
  useEffect(() => {
    if (!hasData) return
    if (gate && !gate.open) {
      tRef.current = 0
      setPlaying(false)
      setFinished(false)
    } else if (!animated) {
      tRef.current = 0
      setPlaying(false)
      setFinished(false)
    } else if (reducedMotion()) {
      tRef.current = END
      setPlaying(false)
      setFinished(true)
    } else {
      tRef.current = 0
      setFinished(false)
      setPlaying(true)
    }
    paintRef.current(tRef.current)
    // 参数（model.key）、开关（gate.open、epoch）变了才重播；bars 之类的表达式不触发
  }, [model.key, animated, hasData, gate?.open, gate?.epoch]) // eslint-disable-line react-hooks/exhaustive-deps

  // 每次渲染都重画（尺寸、主题、柱子表达式变了都要反映到画面上）
  useEffect(() => {
    if (hasData) paintRef.current(tRef.current)
  })

  // 字体可能晚于第一帧才加载好，加载完再画一次
  useEffect(() => {
    if (!hasData || typeof document === 'undefined' || !document.fonts) return
    let alive = true
    document.fonts.ready.then(() => alive && paintRef.current(tRef.current))
    return () => {
      alive = false
    }
  }, [hasData])

  // 宽度跟随容器
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    if (typeof ResizeObserver === 'undefined') {
      setWidth(el.clientWidth)
      return
    }
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [hasData])

  // 离开视口就停止推进（回到视口接着走），和 Sim 一样
  useEffect(() => {
    const el = figureRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [hasData])

  // 时钟：按真实时间推进 t，走到 T 停在最后一帧
  useEffect(() => {
    if (!playing || !onScreen) return
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, MAX_DT)
      last = now
      tRef.current += dt
      const info = paintRef.current(tRef.current)
      if (info && info.T > 0 && tRef.current >= info.T) {
        tRef.current = info.T
        paintRef.current(tRef.current)
        setPlaying(false)
        setFinished(true)
        return
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing, onScreen, model.key, hasData])

  if (!data) {
    return (
      <figure className="sim collision">
        <p className="sim-error" role="alert">
          {model.error}
        </p>
      </figure>
    )
  }

  const onButton = () => {
    if (playing) {
      setPlaying(false)
    } else if (finished) {
      tRef.current = 0
      setFinished(false)
      setPlaying(true)
    } else {
      setPlaying(true)
    }
  }
  const buttonText = playing ? '暂停' : finished ? '重播' : '播放'

  return (
    <figure ref={figureRef} className="sim collision">
      <div className="stage">
        <div ref={wrapRef} style={{ padding: '4px 12px 0' }}>
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={model.label ?? '碰撞画面'}
            style={{ display: 'block', width: '100%', height }}
          />
        </div>
      </div>
      {animated && !gate && (
        <div className="transport">
          <button type="button" className="tp-step" onClick={onButton}>
            {buttonText}
          </button>
        </div>
      )}
    </figure>
  )
}
