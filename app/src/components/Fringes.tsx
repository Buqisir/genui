import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { num, type Scope } from '../lesson/expr'
import {
  fringeIntensity,
  fringeLines,
  fringeMarkMm,
  fringeRGB,
  fringeSpec,
  type FringeInput,
  type FringeSpec,
  type FringeType,
} from '../lesson/fringes'
import type { Props } from '../lesson/parse'
import { namesIn, useScopeFor } from '../lesson/store'
import { palette, useTheme, type ThemeName } from '../theme'
import { Rich } from './rich'
import { StageHead } from './Sim'

const W = 720
const STRIP_H = 146
const RADIAL_H = 500
const PAD_L = 52
const PAD_R = 36
const STRIP_TOP = 38
const STRIP_PX = 70
const CX = W / 2
const CY = 214
const RING_R = 186

interface Mark {
  k: number
  label: string
  x: number
}

function inputOf(props: Props, scope: Scope): FringeInput | null {
  const type = String(props.type)
  if (!['double', 'single', 'wedge', 'newton', 'electron'].includes(type)) return null
  const opt = (k: string) => (props[k] === undefined ? undefined : num(props[k], scope, NaN))
  return {
    type: type as FringeType,
    lambdaNm: opt('lambda'),
    dMm: opt('d'),
    aMm: opt('a'),
    Lm: opt('L'),
    n: opt('n'),
    thetaDeg: opt('theta'),
    hMm: opt('h'),
    lengthMm: opt('length'),
    Rm: opt('R'),
    U: opt('U'),
    kGeom: opt('k'),
    spanMm: opt('span'),
    white: props.white === true,
    wire: props.wire === true,
    transmitted: props.transmitted === true,
  }
}

function marksOf(props: Props, spec: FringeSpec): Mark[] {
  if (!Array.isArray(props.marks)) return []
  const out: Mark[] = []
  for (const raw of props.marks) {
    if (!raw || typeof raw !== 'object') continue
    const m = raw as { k?: unknown; label?: unknown; dark?: unknown }
    if (typeof m.k !== 'number') continue
    const x = fringeMarkMm(spec, m.k, m.dark === true)
    if (!Number.isFinite(x)) continue
    out.push({ k: m.k, label: typeof m.label === 'string' && m.label ? m.label : String(m.k), x })
  }
  return out
}

function niceStep(span: number): number {
  const raw = span / 8
  if (!(raw > 0)) return 1
  const p = 10 ** Math.floor(Math.log10(raw))
  const m = raw / p
  const n = m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10
  return n * p
}

function chipWidth(s: string): number {
  return [...s].reduce((w, ch) => w + (ch.charCodeAt(0) > 0x2e80 ? 12 : 6.6), 0) + 10
}

function paintStrip(ctx: CanvasRenderingContext2D, spec: FringeSpec, dpr: number) {
  const plotW = W - PAD_L - PAD_R
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, W, STRIP_H)
  ctx.fillStyle = '#07080c'
  ctx.fillRect(PAD_L, STRIP_TOP, plotW, STRIP_PX)
  const cols = Math.ceil(plotW)
  for (let i = 0; i < cols; i++) {
    const x = spec.x0 + ((i + 0.5) / plotW) * spec.spanMm
    const c = fringeRGB(spec, x, 0)
    ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`
    ctx.fillRect(PAD_L + i, STRIP_TOP, 1.15, STRIP_PX)
  }
}

function paintRadial(ctx: CanvasRenderingContext2D, spec: FringeSpec, dpr: number) {
  const bw = Math.round(W * dpr)
  const bh = Math.round(RADIAL_H * dpr)
  const img = ctx.createImageData(bw, bh)
  const data = img.data
  const mmPer = spec.spanMm / (2 * RING_R)
  const r2 = RING_R * RING_R
  for (let y = 0; y < bh; y++) {
    const py = y / dpr - CY
    for (let x = 0; x < bw; x++) {
      const px = x / dpr - CX
      const i = (y * bw + x) * 4
      if (px * px + py * py > r2) continue
      const c = fringeRGB(spec, px * mmPer, -py * mmPer)
      data[i] = c.r
      data[i + 1] = c.g
      data[i + 2] = c.b
      data[i + 3] = 255
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, bw, bh)
  ctx.putImageData(img, 0, 0)
}

function StripOverlay({ spec, marks, cursor, theme }: { spec: FringeSpec; marks: Mark[]; cursor: number | null; theme: ThemeName }) {
  const pal = palette(theme)
  const plotW = W - PAD_L - PAD_R
  const xPx = (x: number) => PAD_L + ((x - spec.x0) / spec.spanMm) * plotW
  const step = niceStep(spec.spanMm)
  const xStart = Math.ceil(spec.x0 / step) * step
  const ticks: number[] = []
  for (let x = xStart; x <= spec.x0 + spec.spanMm + step * 1e-6; x += step) ticks.push(Math.round(x * 1e6) / 1e6)
  const chips = placeChips(
    marks
      .map((m) => ({ ...m, px: xPx(m.x) }))
      .filter((m) => m.px >= PAD_L - 4 && m.px <= PAD_L + plotW + 4),
  )
  const axisY = STRIP_TOP + STRIP_PX + 8
  const axisRight = PAD_L + plotW
  return (
    <svg viewBox={`0 0 ${W} ${STRIP_H}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', padding: 0 }} aria-hidden>
      <rect x={PAD_L} y={STRIP_TOP} width={plotW} height={STRIP_PX} fill="none" stroke={pal.ink} strokeWidth={1} />
      <line x1={PAD_L} x2={axisRight} y1={axisY} y2={axisY} stroke={pal.steel} strokeWidth={1} />
      {ticks.map((x) => {
        const px = xPx(x)
        const show = px > PAD_L + 8 && px < axisRight - 18
        return (
          <g key={x}>
            <line x1={px} x2={px} y1={axisY} y2={axisY + 5} stroke={pal.steel} />
            {show && (
              <text x={px} y={axisY + 16} textAnchor="middle" fill={pal.graphite} fontSize={10} fontFamily="ui-monospace, monospace">
                {x}
              </text>
            )}
          </g>
        )
      })}
      <text x={axisRight + 6} y={axisY + 16} textAnchor="start" fill={pal.steel} fontSize={10} fontFamily="ui-sans-serif, sans-serif">
        mm
      </text>
      {chips.map((m) => (
        <Chip key={`${m.k}-${m.label}`} x={m.px} y={STRIP_TOP - 8 - m.row * 16} text={m.label} anchor="middle" theme={theme} />
      ))}
      {cursor !== null && Number.isFinite(cursor) && cursor >= spec.x0 && cursor <= spec.x0 + spec.spanMm && (
        <Crosshair x={xPx(cursor)} y1={STRIP_TOP} y2={STRIP_TOP + STRIP_PX} theme={theme} />
      )}
    </svg>
  )
}

function RadialOverlay({ spec, marks, cursor, theme }: { spec: FringeSpec; marks: Mark[]; cursor: number | null; theme: ThemeName }) {
  const pal = palette(theme)
  const mmPer = spec.spanMm / (2 * RING_R)
  const step = niceStep(spec.spanMm)
  const ticks: number[] = []
  for (let x = Math.ceil(-spec.spanMm / 2 / step) * step; x <= spec.spanMm / 2 + step * 1e-6; x += step) ticks.push(Math.round(x * 1e6) / 1e6)
  const axisY = CY + RING_R + 28
  const xPx = (x: number) => CX + x / mmPer
  const edge = CX + RING_R
  const ang = (58 * Math.PI) / 180
  const asc = marks.filter((m) => m.x >= 0 && m.x <= spec.spanMm / 2 + 1e-6).sort((a, b) => a.x - b.x)
  const gap = 22
  const colX = edge + 14
  const y0 = Math.max(20, CY - RING_R * 0.46 - ((asc.length - 1) * gap) / 2)
  const ringMarks = asc.map((m, i) => {
    const r = m.x / mmPer
    return {
      ...m,
      rx: CX + r * Math.cos(ang),
      ry: CY - r * Math.sin(ang),
      px: colX,
      py: y0 + (asc.length - 1 - i) * gap,
    }
  })
  return (
    <svg viewBox={`0 0 ${W} ${RADIAL_H}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', padding: 0 }} aria-hidden>
      <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke={pal.ink} strokeWidth={1} />
      <line x1={CX - RING_R} x2={edge} y1={axisY} y2={axisY} stroke={pal.steel} strokeWidth={1} />
      {ticks.map((x) => {
        const px = xPx(x)
        const show = px > CX - RING_R + 16 && px < edge - 18
        return (
          <g key={x}>
            <line x1={px} x2={px} y1={axisY} y2={axisY + 5} stroke={pal.steel} />
            {show && (
              <text x={px} y={axisY + 16} textAnchor="middle" fill={pal.graphite} fontSize={10} fontFamily="ui-monospace, monospace">
                {x}
              </text>
            )}
          </g>
        )
      })}
      <text x={edge + 8} y={axisY + 16} textAnchor="start" fill={pal.steel} fontSize={10} fontFamily="ui-sans-serif, sans-serif">
        mm
      </text>
      {ringMarks.map((m) => (
        <g key={`${m.k}-${m.label}`}>
          <line x1={m.rx} y1={m.ry} x2={m.px} y2={m.py - 4} stroke={pal.charge} strokeWidth={1} />
          <circle cx={m.rx} cy={m.ry} r={2.6} fill={pal.charge} />
          <Chip x={m.px} y={m.py} text={m.label} anchor="start" theme={theme} />
        </g>
      ))}
      {cursor !== null && Number.isFinite(cursor) && Math.abs(cursor) <= spec.spanMm / 2 && (
        <Crosshair x={xPx(cursor)} y1={CY - RING_R} y2={CY + RING_R} theme={theme} />
      )}
    </svg>
  )
}

function placeChips<T extends { px: number }>(items: T[]): (T & { row: number })[] {
  const sorted = [...items].sort((a, b) => a.px - b.px)
  const rows: number[][] = []
  return sorted.map((m) => {
    let row = 0
    while ((rows[row] ?? []).some((px) => Math.abs(px - m.px) < 48)) row++
    if (row > 1) row = 1
    ;(rows[row] ??= []).push(m.px)
    return { ...m, row }
  })
}

function Chip({ x, y, text, anchor, theme }: { x: number; y: number; text: string; anchor: 'middle' | 'start'; theme: ThemeName }) {
  const pal = palette(theme)
  const w = chipWidth(text)
  const left = anchor === 'middle' ? x - w / 2 : x
  return (
    <g>
      <rect x={left} y={y - 11} width={w} height={15} rx={3} fill={pal.card} stroke={pal.hairline} />
      <text x={anchor === 'middle' ? x : x + 5} y={y} textAnchor={anchor} fill={pal.ink} fontSize={11} fontFamily="ui-sans-serif, 'Noto Sans SC', sans-serif">
        {text}
      </text>
    </g>
  )
}

function Crosshair({ x, y1, y2, theme }: { x: number; y1: number; y2: number; theme: ThemeName }) {
  const pal = palette(theme)
  return (
    <g>
      <line x1={x} x2={x} y1={y1} y2={y2} stroke="#07080c" strokeWidth={3} />
      <line x1={x} x2={x} y1={y1} y2={y2} stroke={pal.charge} strokeWidth={1.2} />
    </g>
  )
}

function WedgeSide({ spec, theme }: { spec: FringeSpec; theme: ThemeName }) {
  const pal = palette(theme)
  const plotW = W - PAD_L - PAD_R
  const film = Math.min(spec.lengthMm, spec.spanMm)
  const x0 = PAD_L
  const x1 = PAD_L + (film / spec.spanMm) * plotW
  const yLower = 58
  const thick = 13
  const gap0 = 3
  const gap1 = 32
  const shimW = 12
  const shimX = x1 - shimW
  const shimY = yLower - gap1
  const shimH = gap1
  const frac = 0.62
  const gapHere = gap0 + frac * (gap1 - gap0)
  const xLab = x0 + frac * (x1 - x0)
  const yLab = yLower - gapHere / 2 - 1
  return (
    <svg viewBox={`0 0 ${W} 118`} width="100%" style={{ display: 'block', padding: 0 }} role="img" aria-label="劈尖侧视">
      <rect x={x0} y={yLower} width={x1 - x0} height={thick} className="ins-body" />
      <polygon
        points={`${x0},${yLower - gap0 - thick} ${x1},${yLower - gap1 - thick} ${x1},${yLower - gap1} ${x0},${yLower - gap0}`}
        className="ins-body"
      />
      <rect x={shimX} y={shimY} width={shimW} height={shimH} fill={pal.steel} opacity={0.45} stroke={pal.ink} strokeWidth={1} />
      {Array.from({ length: 3 }, (_, i) => {
        const x = shimX + 3 + i * 2.4
        return <line key={i} x1={x} x2={x + 2.2} y1={shimY + 3} y2={shimY + shimH - 3} stroke={pal.ink} strokeWidth={0.8} />
      })}
      <text x={xLab} y={yLab} textAnchor="middle" fill={pal.ink} fontSize={11} fontFamily="ui-sans-serif, 'Noto Sans SC', sans-serif">
        空气膜
      </text>
      <text x={x0} y={yLower + thick + 16} fill={pal.graphite} fontSize={11} fontFamily="ui-sans-serif, 'Noto Sans SC', sans-serif">
        接触端
      </text>
      <text x={shimX + shimW / 2} y={yLower + thick + 16} textAnchor="middle" fill={pal.graphite} fontSize={11} fontFamily="ui-sans-serif, 'Noto Sans SC', sans-serif">
        垫片
      </text>
      <text x={(x0 + x1) / 2} y={yLower + thick + 34} textAnchor="middle" fill={pal.steel} fontSize={10} fontFamily="ui-sans-serif, 'Noto Sans SC', sans-serif">
        侧视倾角已夸大，间距仍按真实 θ
      </text>
    </svg>
  )
}

/** `<Fringes type="double" lambda="lam" d="d" L="L" />`: the pattern is computed, not drawn by hand. */
export function Fringes({ props }: { props: Props }) {
  const theme = useTheme()
  const scope = useScopeFor(namesIn(props))
  const canvas = useRef<HTMLCanvasElement>(null)
  const model = useMemo(() => {
    const input = inputOf(props, scope)
    const built = input ? fringeSpec(input) : { error: `type 不合法：${String(props.type)}` }
    const spec = built.spec
    const cursorX = typeof props.cursor === 'string' && Number.isFinite(Number(scope[props.cursor])) ? Number(scope[props.cursor]) : null
    const I = spec && cursorX !== null ? fringeIntensity(spec, cursorX, 0) : null
    return {
      spec,
      error: built.error,
      lines: spec ? fringeLines(spec, cursorX !== null && I !== null ? { x: cursorX, I } : null) : [],
      marks: spec ? marksOf(props, spec) : [],
      cursorX,
    }
  }, [props, scope])

  useEffect(() => {
    const spec = model.spec
    const node = canvas.current
    if (!spec || !node) return
    const ctx = node.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const h = spec.radial ? RADIAL_H : STRIP_H
    node.width = Math.round(W * dpr)
    node.height = Math.round(h * dpr)
    if (spec.radial) paintRadial(ctx, spec, dpr)
    else paintStrip(ctx, spec, dpr)
  }, [model])

  const spec = model.spec
  const h = spec?.radial ? RADIAL_H : STRIP_H
  let overlay: ReactNode = null
  if (spec?.radial) overlay = <RadialOverlay spec={spec} marks={model.marks} cursor={model.cursorX} theme={theme} />
  else if (spec) overlay = <StripOverlay spec={spec} marks={model.marks} cursor={model.cursorX} theme={theme} />
  return (
    <figure className="sim still instrument">
      <div className="stage">
        <StageHead props={props} />
        <div style={{ padding: '4px 12px 0' }}>
          {spec ? (
            <div style={{ position: 'relative' }}>
              <canvas
                ref={canvas}
                width={W}
                height={h}
                style={{ display: 'block', width: '100%', height: 'auto' }}
                role="img"
                aria-label={String(props.title ?? '条纹')}
              />
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>{overlay}</div>
            </div>
          ) : (
            <p className="sim-error" style={{ position: 'relative', inset: 'auto' }}>
              {model.error}
            </p>
          )}
          {spec?.type === 'wedge' && props.side === true && <WedgeSide spec={spec} theme={theme} />}
        </div>
        {(model.lines.length > 0 || model.error || typeof props.note === 'string') && (
          <div className="stage-note instrument-reading">
            {model.error && !spec && <span className="num">{model.error}</span>}
            {model.lines.map((line) => (
              <span className="num" key={line}>
                {line}
              </span>
            ))}
            {typeof props.note === 'string' && <Rich text={props.note} html />}
          </div>
        )}
      </div>
    </figure>
  )
}
