import { useEffect, useRef, useState, type ReactNode } from 'react'
import { num } from '../lesson/expr'
import { createGas, GASES, histogram, maxwellPdf, setTemperature, speedOf, speeds, stats, stepGas, type Gas } from '../lesson/gas'
import type { Props } from '../lesson/parse'
import { namesIn, reducedMotion, useScopeFor, useStore } from '../lesson/store'
import { colorOf, useTheme, type ThemeName } from '../theme'
import { Sym, Value } from './controls'
import { formatTick, formatTicks, niceTicks } from './layout'
import { Rich } from './rich'

// Gas molecules in a box (分子动理论): hard-sphere collisions in 3D drawn in cabinet
// projection, next to a live speed histogram with the Maxwell curve on top. Hovering a
// bar picks out the molecules in that speed band.

const SPEEDS = [0.5, 1, 2]
const HIST_MS = 150
const AUTOPLAY_DELAY_MS = 400
const DEPTH = 0.5
const DEPTH_ANGLE = (35 * Math.PI) / 180
const TRAIL = 70

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

function niceCeil(v: number): number {
  const mag = 10 ** Math.floor(Math.log10(v))
  const n = v / mag
  return (n <= 1 ? 1 : n <= 1.5 ? 1.5 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 3 ? 3 : n <= 4 ? 4 : n <= 5 ? 5 : n <= 6 ? 6 : n <= 8 ? 8 : 10) * mag
}

const hexRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))

/** Slow → fast: velocity blue, accel purple, force red, charge amber. Shared by molecules and bars. */
function speedRamp(theme: ThemeName) {
  const stops: [number, number[]][] = [
    [0.1, hexRgb(colorOf('velocity', theme))],
    [0.38, hexRgb(colorOf('accel', theme))],
    [0.64, hexRgb(colorOf('force', theme))],
    [0.92, hexRgb(colorOf('charge', theme))],
  ]
  return (u: number) => {
    if (u <= stops[0][0]) return `rgb(${stops[0][1].join(',')})`
    const last = stops[stops.length - 1]
    if (u >= last[0]) return `rgb(${last[1].join(',')})`
    const i = stops.findIndex((s, j) => j < stops.length - 1 && u <= stops[j + 1][0])
    const [a, b] = [stops[i], stops[i + 1]]
    const k = (u - a[0]) / (b[0] - a[0])
    const c = a[1].map((x, j) => Math.round(x + (b[1][j] - x) * k))
    return `rgb(${c[0]},${c[1]},${c[2]})`
  }
}

/** Bin width on a 1-2-2.5-5 ladder so the axis reads "每格 50 m/s", not 62.5. */
function niceStep(v: number): number {
  const mag = 10 ** Math.floor(Math.log10(v))
  const n = v / mag
  return (n < 1.5 ? 1 : n < 2.25 ? 2 : n < 3.5 ? 2.5 : n < 7.5 ? 5 : 10) * mag
}

interface View {
  k: number
  ox: number
  oy: number
  dx: number
  dy: number
}

function fitView(g: Gas, w: number, h: number): View {
  const { L, H, D } = g.box
  const ddx = DEPTH * Math.cos(DEPTH_ANGLE)
  const ddy = DEPTH * Math.sin(DEPTH_ANGLE)
  const pad = 14
  const k = Math.min((w - 2 * pad) / (L + D * ddx), (h - 2 * pad) / (H + D * ddy))
  const bw = (L + D * ddx) * k
  const bh = (H + D * ddy) * k
  return { k, ox: (w - bw) / 2, oy: (h - bh) / 2 + D * ddy * k, dx: ddx * k, dy: ddy * k }
}

const proj = (v: View, x: number, y: number, z: number): [number, number] => [v.ox + x * v.k + z * v.dx, v.oy + y * v.k - z * v.dy]

interface DrawOpts {
  theme: ThemeName
  vmax: number
  band: [number, number] | null
  tag: boolean
  trail: number[]
}

function draw(ctx: CanvasRenderingContext2D, g: Gas, w: number, h: number, o: DrawOpts) {
  const v = fitView(g, w, h)
  const { L, H, D } = g.box
  const ramp = speedRamp(o.theme)
  const steel = colorOf('steel', o.theme)
  const graphite = colorOf('graphite', o.theme)
  const ink = colorOf('ink', o.theme)
  ctx.clearRect(0, 0, w, h)

  const face = (z: number) => [proj(v, 0, 0, z), proj(v, L, 0, z), proj(v, L, H, z), proj(v, 0, H, z)]
  const back = face(D)
  const front = face(0)
  const poly = (pts: [number, number][]) => {
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.closePath()
  }
  // Back wall, floor and the far edges sit behind the molecules.
  ctx.save()
  ctx.globalAlpha = o.theme === 'night' ? 0.35 : 0.5
  ctx.fillStyle = o.theme === 'night' ? '#16171A' : '#E7EAEE'
  poly(back)
  ctx.fill()
  ctx.globalAlpha = o.theme === 'night' ? 0.18 : 0.28
  poly([front[3], front[2], back[2], back[3]])
  ctx.fill()
  ctx.restore()
  ctx.lineWidth = 1
  ctx.strokeStyle = steel
  ctx.globalAlpha = 0.55
  poly(back)
  ctx.stroke()
  ctx.beginPath()
  for (let i = 0; i < 4; i++) {
    ctx.moveTo(...front[i])
    ctx.lineTo(...back[i])
  }
  ctx.stroke()
  ctx.globalAlpha = 1

  const order = Array.from({ length: g.n }, (_, i) => i).sort((a, b) => g.z[b] - g.z[a])
  const tail = 0.11 * g.scale
  for (const i of order) {
    const s = speedOf(g, i)
    const depth = g.z[i] / D
    const inBand = !o.band || (s >= o.band[0] && s < o.band[1]) || (o.band[1] >= o.vmax && s >= o.band[0])
    const alpha = (1 - 0.5 * depth) * (inBand ? 1 : 0.1)
    const rad = Math.max(1.6, g.r * v.k * (1.08 - 0.38 * depth))
    const [px, py] = proj(v, g.x[i], g.y[i], g.z[i])
    const [qx, qy] = proj(v, g.x[i] - g.vx[i] * tail, g.y[i] - g.vy[i] * tail, g.z[i] - g.vz[i] * tail)
    const c = ramp(s / o.vmax)
    ctx.globalAlpha = alpha * 0.35
    ctx.strokeStyle = c
    ctx.lineWidth = rad * 0.9
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(qx, qy)
    ctx.lineTo(px, py)
    ctx.stroke()
    ctx.globalAlpha = alpha
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(px, py, rad, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  if (o.tag && o.trail.length >= 6) {
    ctx.strokeStyle = ink
    ctx.lineWidth = 1.2
    ctx.lineJoin = 'round'
    for (let j = 3; j < o.trail.length; j += 3) {
      const a = proj(v, o.trail[j - 3], o.trail[j - 2], o.trail[j - 1])
      const b = proj(v, o.trail[j], o.trail[j + 1], o.trail[j + 2])
      ctx.globalAlpha = 0.08 + 0.6 * (j / o.trail.length)
      ctx.beginPath()
      ctx.moveTo(...a)
      ctx.lineTo(...b)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    const [px, py] = proj(v, g.x[0], g.y[0], g.z[0])
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.arc(px, py, g.r * v.k + 4, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Front edges last: the box reads as glass in front of the molecules.
  ctx.strokeStyle = graphite
  ctx.lineWidth = 1.4
  poly(front)
  ctx.stroke()
}

interface Snapshot {
  counts: number[]
  mean: number
  rms: number
  collisions: number
  time: number
  tagSpeed: number
}

function snapshot(g: Gas, bins: number, vmax: number): Snapshot {
  const s = stats(g)
  return { counts: histogram(g, bins, vmax), mean: s.mean, rms: s.rms, collisions: g.collisions, time: g.time, tagSpeed: speedOf(g, 0) }
}

const playIcon = (
  <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden>
    <path d="M3.5 2.2v9.6L11.6 7z" fill="currentColor" />
  </svg>
)
const pauseIcon = (
  <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden>
    <rect x="3" y="2.5" width="2.8" height="9" rx="0.8" fill="currentColor" />
    <rect x="8.2" y="2.5" width="2.8" height="9" rx="0.8" fill="currentColor" />
  </svg>
)

const fmt0 = (v: number) => (Number.isFinite(v) ? String(Math.round(v)) : '—')

export function GasBox({ props }: { props: Props }) {
  const theme = useTheme()
  const store = useStore()
  const scope = useScopeFor(namesIn([props.T, props.count, props.compare]))

  const gasKey = typeof props.gas === 'string' && GASES[props.gas] ? props.gas : 'N2'
  const massU = typeof props.mass === 'number' && props.mass > 0 ? props.mass : GASES[gasKey].mass
  const gasLabel = typeof props.mass === 'number' ? (typeof props.gas === 'string' ? props.gas : '气体') : GASES[gasKey].label
  const T = clamp(num(props.T, scope, 300), 1, 1e5)
  const count = Math.round(clamp(num(props.count, scope, 300), 20, 800))
  const start = props.start === 'same' ? 'same' : 'maxwell'
  const collide = props.collide !== false
  const showTheory = props.theory !== false
  const tagOn = props.tag === true
  const compareT = num(props.compare, scope, NaN)
  const hasCompare = Number.isFinite(compareT) && compareT > 0
  const height = typeof props.height === 'number' ? props.height : 300

  // The speed axis covers the slider's hottest setting so it never rescales while
  // dragging; the percent axis only grows (colder gas has a taller peak) and never shrinks.
  const def = typeof props.T === 'string' ? store.defs.get(props.T) : undefined
  const temps = [T, ...(hasCompare ? [compareT] : [])]
  const range = useRef({ hi: 0, lo: Infinity })
  range.current.hi = Math.max(range.current.hi, def?.max ?? T, ...temps)
  range.current.lo = Math.min(range.current.lo, ...temps)
  const vmax = typeof props.vmax === 'number' && props.vmax > 0 ? props.vmax : niceCeil(3.1 * speeds(range.current.hi, massU).vp)
  const binW = niceStep(vmax / clamp(typeof props.bins === 'number' ? props.bins : 24, 8, 60))
  const bins = Math.max(4, Math.round(vmax / binW))
  const peakPct = (t: number) => maxwellPdf(speeds(t, massU).vp, t, massU) * binW * 100
  const ymax = niceCeil(peakPct(range.current.lo) * 1.3)

  const [resetKey, setResetKey] = useState(0)
  const gasRef = useRef<Gas | null>(null)
  const tRef = useRef(T)
  tRef.current = T
  // Rebuilt during render when its inputs change (not in useMemo, which StrictMode may run
  // twice and keep a different instance than the one the animation loop steps).
  const gasKey2 = `${count}|${massU}|${start}|${resetKey}`
  const builtFor = useRef('')
  if (builtFor.current !== gasKey2 || !gasRef.current) {
    gasRef.current = createGas({ count, T: tRef.current, massU, start, seed: 7 + resetKey })
    builtFor.current = gasKey2
  }
  const gas = gasRef.current

  const [snap, setSnap] = useState<Snapshot>(() => snapshot(gas, bins, vmax))
  const trail = useRef<number[]>([])
  useEffect(() => {
    trail.current = []
    setSnap(snapshot(gas, bins, vmax))
  }, [gas, bins, vmax])

  useEffect(() => {
    setTemperature(gas, T)
    setSnap(snapshot(gas, bins, vmax))
  }, [T]) // eslint-disable-line react-hooks/exhaustive-deps

  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [auto, setAuto] = useState(() => props.autoplay !== false && !reducedMotion())
  const [hover, setHover] = useState<number | null>(null)
  const [size, setSize] = useState({ w: 0, h: height })

  const figureRef = useRef<HTMLElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const band: [number, number] | null = hover === null ? null : [hover * binW, (hover + 1) * binW]
  const drawRef = useRef<() => void>(() => {})
  drawRef.current = () => {
    const c = canvasRef.current
    const g = gasRef.current
    if (!c || !g || !size.w) return
    const dpr = window.devicePixelRatio || 1
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    draw(ctx, g, size.w, size.h, { theme, vmax, band, tag: tagOn, trail: trail.current })
  }

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.round(e.contentRect.width), h: height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [height])

  useEffect(() => {
    const c = canvasRef.current
    if (!c || !size.w) return
    const dpr = window.devicePixelRatio || 1
    c.width = Math.round(size.w * dpr)
    c.height = Math.round(size.h * dpr)
    drawRef.current()
  }, [size])

  useEffect(() => {
    if (!playing) drawRef.current()
  })

  useEffect(() => {
    if (!auto) return
    const el = figureRef.current
    if (!el) return
    let timer = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(timer)
        if (entry.isIntersecting) timer = window.setTimeout(() => setPlaying(true), AUTOPLAY_DELAY_MS)
        else setPlaying(false)
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => {
      clearTimeout(timer)
      io.disconnect()
    }
  }, [auto])

  const [onScreen, setOnScreen] = useState(true)
  useEffect(() => {
    const el = figureRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!playing || !onScreen) return
    let raf = 0
    let last = performance.now()
    let lastHist = last
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const g = gasRef.current
      if (g) {
        stepGas(g, dt * speed, collide)
        if (tagOn) {
          trail.current.push(g.x[0], g.y[0], g.z[0])
          if (trail.current.length > TRAIL * 3) trail.current.splice(0, trail.current.length - TRAIL * 3)
        }
        drawRef.current()
        if (now - lastHist >= HIST_MS) {
          lastHist = now
          setSnap(snapshot(g, bins, vmax))
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing, onScreen, speed, collide, tagOn, bins, vmax])

  const takeOver = () => setAuto(false)
  const th = speeds(T, massU)

  // ---------------------------------------------------------------- histogram
  const CW = 380
  const CH = Math.max(240, height)
  const M = { left: 40, right: 12, top: 30, bottom: 34 }
  const pw = CW - M.left - M.right
  const ph = CH - M.top - M.bottom
  const sx = (v: number) => M.left + (v / vmax) * pw
  const sy = (p: number) => M.top + (1 - Math.min(p, ymax) / ymax) * ph
  const ramp = speedRamp(theme)
  const curve = (t: number) => {
    const pts: string[] = []
    for (let i = 0; i <= 120; i++) {
      const v = (vmax * i) / 120
      pts.push(`${sx(v).toFixed(1)},${sy(maxwellPdf(v, t, massU) * binW * 100).toFixed(1)}`)
    }
    return `M${pts.join('L')}`
  }
  const n = gas.n
  const bars: ReactNode[] = snap.counts.map((c, i) => {
    const pct = (c / n) * 100
    const x0 = sx(i * binW)
    const x1 = sx((i + 1) * binW)
    const top = sy(pct)
    const on = hover === i
    return (
      <g key={i} className="gas-bar" onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(i)} onClick={() => setHover((h) => (h === i ? null : i))}>
        <rect x={x0} y={M.top} width={x1 - x0} height={ph} fill="transparent" />
        <rect
          x={x0 + 0.6}
          y={top}
          width={Math.max(0, x1 - x0 - 1.2)}
          height={Math.max(0, M.top + ph - top)}
          rx={1.5}
          fill={ramp((i + 0.5) / bins)}
          opacity={hover === null || on ? 0.88 : 0.3}
        />
        {pct > ymax && (
          <text x={(x0 + x1) / 2} y={M.top - 4} textAnchor="middle" className="gas-overflow">
            {`↑${Math.round(pct)}%`}
          </text>
        )}
      </g>
    )
  })
  const hovered = hover === null ? null : { c: snap.counts[hover] ?? 0, lo: hover * binW, hi: (hover + 1) * binW }
  const hoverTheory = hovered ? maxwellPdf((hovered.lo + hovered.hi) / 2, T, massU) * binW * 100 : 0
  const avgColl = (2 * snap.collisions) / n

  return (
    <figure ref={figureRef} className="sim gas-box">
      <div className="stage">
        <div className="stage-head">
          <div className="hud">
            <div className="hud-item primary">
              <Sym text="T" />
              <span className="hud-eq">=</span>
              <Value value={T} unit="K" digits={0} />
            </div>
            <div className="hud-item">
              <span className="hud-label">
                <Rich text={`${gasLabel} · ${n} 个分子${collide ? '' : ' · 不碰撞'}`} html />
              </span>
            </div>
            <div className="hud-status">
              <i className={playing ? 'live' : ''} />
              {playing ? '运动中' : '已暂停'}
              {typeof props.title === 'string' && (
                <>
                  <span className="dot-sep">·</span>
                  <Rich text={props.title} html />
                </>
              )}
            </div>
          </div>
          <div className="legend">
            <span className="legend-item">
              <span className="gas-ramp" style={{ background: `linear-gradient(90deg, ${ramp(0.1)}, ${ramp(0.38)}, ${ramp(0.64)}, ${ramp(0.92)})` }} />
              分子颜色 = 速率（慢 → 快）
            </span>
            {tagOn && (
              <span className="legend-item">
                <svg width="14" height="14" aria-hidden>
                  <circle cx="7" cy="7" r="5" fill="none" stroke={colorOf('ink', theme)} strokeWidth="1.4" />
                </svg>
                跟踪 1 号分子
              </span>
            )}
          </div>
        </div>
        <div className="gas-body">
          <div className="gas-canvas" ref={wrapRef} style={{ height }}>
            <canvas ref={canvasRef} style={{ width: '100%', height }} role="img" aria-label={`${gasLabel} 分子在盒子里做无规则运动`} />
          </div>
          <div className="gas-chart" onMouseLeave={() => setHover(null)}>
            <svg viewBox={`0 0 ${CW} ${CH}`} width="100%" role="img" aria-label="分子速率分布直方图">
              <g className="grid">
                {niceTicks(0, ymax, 4).map((t) => (
                  <line key={t} x1={M.left} x2={CW - M.right} y1={sy(t)} y2={sy(t)} />
                ))}
              </g>
              <g className="axis">
                {((ticks, labels = formatTicks(ticks)) => ticks.map((t, i) => (
                  <text key={t} x={M.left - 6} y={sy(t) + 4} textAnchor="end">
                    {labels[i]}
                  </text>
                )))(niceTicks(0, ymax, 4))}
                {((ticks, labels = formatTicks(ticks)) => ticks.map((t, i) => (
                  <text key={t} x={sx(t)} y={CH - M.bottom + 15} textAnchor="middle">
                    {labels[i]}
                  </text>
                )))(niceTicks(0, vmax, 5))}
                <line x1={M.left} x2={CW - M.right} y1={M.top + ph} y2={M.top + ph} />
                <text x={4} y={M.top - 14} className="axis-unit">
                  {`各速率区间分子数占比 / %（每格 ${formatTick(binW)} m/s）`}
                </text>
                <text x={CW - M.right} y={CH - 4} textAnchor="end" className="axis-unit">
                  v / (m·s⁻¹)
                </text>
              </g>
              {bars}
              {hasCompare && (
                <g className="gas-compare">
                  <path d={curve(compareT)} />
                  {Math.abs(compareT - T) >= 1 && <text x={sx(speeds(compareT, massU).vp) + (compareT > T ? 8 : -8)} y={sy(peakPct(compareT)) - 4} textAnchor={compareT > T ? 'start' : 'end'}>
                    {`${fmt0(compareT)} K`}
                  </text>}
                </g>
              )}
              {showTheory && (
                <g className="gas-theory">
                  <path d={curve(T)} />
                  <line className="gas-vp" x1={sx(th.vp)} x2={sx(th.vp)} y1={sy(peakPct(T))} y2={M.top + ph} />
                  <text x={sx(th.vp) + 4} y={M.top + ph - 6} className="gas-vp-label">
                    <Rich text="v_p" />
                  </text>
                  {hasCompare && Math.abs(compareT - T) >= 1 && (
                    <text x={sx(th.vp) + (compareT > T ? -8 : 8)} y={sy(peakPct(T)) - 4} textAnchor={compareT > T ? 'end' : 'start'} className="gas-theory-label">
                      {`${fmt0(T)} K`}
                    </text>
                  )}
                </g>
              )}
              {tagOn && Number.isFinite(snap.tagSpeed) && (
                <g className="gas-tag">
                  <polygon points={`${sx(Math.min(snap.tagSpeed, vmax))},${M.top + ph + 1} ${sx(Math.min(snap.tagSpeed, vmax)) - 5},${M.top + ph + 9} ${sx(Math.min(snap.tagSpeed, vmax)) + 5},${M.top + ph + 9}`} />
                </g>
              )}
            </svg>
            <div className="gas-key">
              <span className="gas-key-bar" style={{ background: `linear-gradient(90deg, ${ramp(0.1)}, ${ramp(0.5)}, ${ramp(0.92)})` }} />
              实际（每 0.15 s 统计一次）
              {showTheory && (
                <>
                  <span className="gas-key-line" />
                  麦克斯韦分布（理论）
                </>
              )}
              {hasCompare && (
                <>
                  <span className="gas-key-line dashed" />
                  {`${fmt0(compareT)} K 对照`}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="stage-note instrument-reading gas-reading">
          {hovered ? (
            <span className="num">
              {`${fmt0(hovered.lo)}–${fmt0(hovered.hi)} m/s：实际 ${hovered.c} 个（${((hovered.c / n) * 100).toFixed(1)}%），理论 ${hoverTheory.toFixed(1)}%。盒子里只亮出这一段速率的分子`}
            </span>
          ) : (
            <span className="num">
              {`统计：平均速率 ${fmt0(snap.mean)} m/s，方均根速率 ${fmt0(snap.rms)} m/s　理论：最概然 ${fmt0(th.vp)}，平均 ${fmt0(th.mean)}，方均根 ${fmt0(th.rms)} m/s`}
            </span>
          )}
          {tagOn && <span className="num">{`1 号分子此刻速率 ${fmt0(snap.tagSpeed)} m/s（三角形标在横轴上）：单个分子的速率不停在变，大量分子的分布却是稳定的`}</span>}
          {typeof props.note === 'string' && <Rich text={props.note} html />}
        </div>
        <div className="gas-controls">
          <button
            type="button"
            className="wiring-toggle primary"
            aria-label={playing ? '暂停' : '播放'}
            onClick={() => {
              takeOver()
              setPlaying(!playing)
            }}
          >
            {playing ? pauseIcon : playIcon}
            {playing ? '暂停' : '播放'}
          </button>
          <button
            type="button"
            className="wiring-toggle"
            onClick={() => {
              takeOver()
              setPlaying(false)
              setResetKey((k) => k + 1)
            }}
          >
            重新开始
          </button>
          <div className="segmented small" role="radiogroup" aria-label="播放速度">
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                className={s === speed ? 'active' : ''}
                role="radio"
                aria-checked={s === speed}
                onClick={() => {
                  takeOver()
                  setSpeed(s)
                }}
              >
                {`${s}×`}
              </button>
            ))}
          </div>
          <span className="wiring-count" aria-live="off">
            {`t = ${snap.time.toFixed(1)} s · 平均每个分子碰撞 ${avgColl.toFixed(1)} 次`}
          </span>
        </div>
      </div>
    </figure>
  )
}
