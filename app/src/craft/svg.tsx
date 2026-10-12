// SVG backend for the B+ apparatus primitives, mirroring craft/canvas.ts so SVG
// components (ForceDiagram, Instrument, …) and the canvas runtime look the same.
// Shapes never change an object's footprint: the top band is carved out of the box.
import { useId } from 'react'
import { craftTokens, type CraftTheme, type CraftTokens, type MaterialName } from './tokens'

type Pt = [number, number]
export type OutlineMode = 'auto' | 'strong' | 'soft' | 'none'

const SOFT_AREA = 1600
const MATS: MaterialName[] = ['steel', 'steelHi', 'alu', 'rubber', 'insul', 'dark', 'brass', 'cap']

function pickLine(k: CraftTokens, mode: OutlineMode | undefined, area: number) {
  if (mode === 'none') return null
  if (mode === 'strong') return k.strong
  if (mode === 'soft') return k.soft
  return area > SOFT_AREA ? k.soft : k.strong
}

/** A document-safe id prefix for one figure's gradients. */
export function useCraftId() {
  return 'c' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
}

export const matFill = (id: string, mat: MaterialName) => `url(#${id}-m-${mat})`

/** Gradients for every material plus the two shadows. Put once inside the figure's <svg>. */
export function CraftDefs({ id, theme }: { id: string; theme: CraftTheme }) {
  const k = craftTokens(theme)
  return (
    <defs>
      {MATS.map((mat) => {
        const tone = k.materials[mat]
        return (
          <linearGradient key={mat} id={`${id}-m-${mat}`} x1="0" y1="0" x2={tone.horiz ? 1 : 0} y2={tone.horiz ? 0 : 1}>
            {tone.stops.map(([o, c], i) => (
              <stop key={i} offset={o} stopColor={c} />
            ))}
          </linearGradient>
        )
      })}
      {MATS.map((mat) => {
        const tone = k.materials[mat]
        return (
          <radialGradient key={'s' + mat} id={`${id}-s-${mat}`} cx="0.36" cy="0.32" r="0.75" fx="0.33" fy="0.28">
            <stop offset="0" stopColor={tone.top} />
            <stop offset="0.55" stopColor={tone.stops[Math.floor(tone.stops.length / 2)][1]} />
            <stop offset="1" stopColor={tone.stops[tone.stops.length - 1][1]} />
          </radialGradient>
        )
      })}
      <radialGradient id={`${id}-contact`}>
        <stop offset="0" stopColor={k.contact} />
        <stop offset="0.82" stopColor={k.contact} />
        <stop offset="1" stopColor="rgba(0,0,0,0)" />
      </radialGradient>
      <radialGradient id={`${id}-ambient`}>
        <stop offset="0" stopColor={k.ambient} />
        <stop offset="0.35" stopColor={k.ambient} />
        <stop offset="1" stopColor="rgba(0,0,0,0)" />
      </radialGradient>
    </defs>
  )
}

interface Common {
  id: string
  theme: CraftTheme
  line?: OutlineMode
}

/** A lit box: top band with bevel, front gradient, bounce rim, outline by size. */
export function SolidRect({ id, theme, x, y, w, h, mat, r = 1.5, band, line, rim = true }: Common & { x: number; y: number; w: number; h: number; mat: MaterialName; r?: number; band?: number; rim?: boolean }) {
  const local = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  if (!(w > 0 && h > 0)) return null
  const k = craftTokens(theme)
  const tone = k.materials[mat]
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  const b = Math.max(0, Math.min(band ?? Math.min(h * 0.16, 5), h * 0.45))
  const ln = pickLine(k, line, w * h)
  const clip = `${id}-r${local}`
  return (
    <g>
      <clipPath id={clip}>
        <rect x={x} y={y} width={w} height={h} rx={rr} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <rect x={x} y={y} width={w} height={h} fill={matFill(id, mat)} />
        {b >= 1 && (
          <>
            <rect x={x} y={y} width={w} height={b} fill={tone.top} />
            <line x1={x + 1} y1={y + 0.6} x2={x + w - 1} y2={y + 0.6} stroke={k.bevel} strokeWidth={tone.dim ? 0.5 : 0.9} opacity={tone.dim ? 0.25 : 1} />
            <line x1={x} y1={y + b} x2={x + w} y2={y + b} stroke={k.seam} strokeWidth={0.6} />
            <line x1={x + 1} y1={y + b + 0.9} x2={x + w - 1} y2={y + b + 0.9} stroke={k.bevel} strokeWidth={0.6} opacity={tone.dim ? 0.12 : k.glint} />
          </>
        )}
        {h > 8 && rim && <line x1={x + 1.5} y1={y + h - 1} x2={x + w - 1.5} y2={y + h - 1} stroke={k.bevel} strokeWidth={0.55} opacity={tone.dim ? 0.14 : k.rim} />}
      </g>
      {ln && <rect x={x} y={y} width={w} height={h} rx={rr} fill="none" stroke={ln.color} strokeWidth={ln.width} />}
    </g>
  )
}

function area(pts: Pt[]) {
  let a = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[(i + 1) % pts.length]
    a += x1 * y2 - x2 * y1
  }
  return Math.abs(a) / 2
}

const ptsStr = (pts: Pt[]) => pts.map((p) => `${p[0]},${p[1]}`).join(' ')

/** A lit polygon (wedges, ramps). The band follows `bandEdge` instead of the top. */
export function SolidPoly({ id, theme, pts, mat, bandEdge, band = 5, line }: Common & { pts: Pt[]; mat: MaterialName; bandEdge?: [number, number]; band?: number }) {
  const local = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  if (pts.length < 3) return null
  const k = craftTokens(theme)
  const tone = k.materials[mat]
  const ln = pickLine(k, line, area(pts))
  let strip: React.ReactNode = null
  if (bandEdge) {
    const a = pts[bandEdge[0]]
    const b = pts[bandEdge[1]]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length
    let nx = -(b[1] - a[1]) / len
    let ny = (b[0] - a[0]) / len
    if ((cx - a[0]) * nx + (cy - a[1]) * ny < 0) {
      nx = -nx
      ny = -ny
    }
    const off = (d: number, p: Pt): Pt => [p[0] + nx * d, p[1] + ny * d]
    const ex = ((b[0] - a[0]) / len) * band * 3
    const ey = ((b[1] - a[1]) / len) * band * 3
    const a2: Pt = [a[0] - ex, a[1] - ey]
    const b2: Pt = [b[0] + ex, b[1] + ey]
    const L = (d: number) => [off(d, a2), off(d, b2)] as const
    strip = (
      <>
        <polygon points={ptsStr([a2, b2, off(band, b2), off(band, a2)])} fill={tone.top} />
        <line x1={L(0.6)[0][0]} y1={L(0.6)[0][1]} x2={L(0.6)[1][0]} y2={L(0.6)[1][1]} stroke={k.bevel} strokeWidth={0.9} />
        <line x1={L(band)[0][0]} y1={L(band)[0][1]} x2={L(band)[1][0]} y2={L(band)[1][1]} stroke={k.seam} strokeWidth={0.6} />
        <line x1={L(band + 0.9)[0][0]} y1={L(band + 0.9)[0][1]} x2={L(band + 0.9)[1][0]} y2={L(band + 0.9)[1][1]} stroke={k.bevel} strokeWidth={0.6} opacity={k.glint} />
      </>
    )
  }
  const clip = `${id}-p${local}`
  return (
    <g>
      <clipPath id={clip}>
        <polygon points={ptsStr(pts)} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <polygon points={ptsStr(pts)} fill={matFill(id, mat)} />
        {strip}
      </g>
      {ln && <polygon points={ptsStr(pts)} fill="none" stroke={ln.color} strokeWidth={ln.width} strokeLinejoin="round" />}
    </g>
  )
}

export function Sphere({ id, theme, cx, cy, r, mat, line }: Common & { cx: number; cy: number; r: number; mat: MaterialName }) {
  if (!(r > 0)) return null
  const k = craftTokens(theme)
  const ln = pickLine(k, line, Math.PI * r * r)
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-s-${mat})`} />
      {r > 5 && <ellipse cx={cx - r * 0.36} cy={cy - r * 0.42} rx={r * 0.22} ry={r * 0.13} transform={`rotate(-35 ${cx - r * 0.36} ${cy - r * 0.42})`} fill="#FFFFFF" opacity={k.glint} />}
      {ln && <circle cx={cx} cy={cy} r={r} fill="none" stroke={ln.color} strokeWidth={ln.width} />}
    </g>
  )
}

export function Screw({ theme, cx, cy, r }: { theme: CraftTheme; cx: number; cy: number; r: number }) {
  const k = craftTokens(theme)
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={k.screwHead} stroke={k.strong.color} strokeWidth={0.5} />
      <line x1={cx - r * 0.6} y1={cy + r * 0.25} x2={cx + r * 0.6} y2={cy - r * 0.25} stroke={k.screwSlot} strokeWidth={0.5} />
    </g>
  )
}

/** Tight dark line where a body meets the surface under it. */
export function ContactShadow({ id, x1, x2, y, ry = 1.8 }: { id: string; x1: number; x2: number; y: number; ry?: number }) {
  return <ellipse cx={(x1 + x2) / 2} cy={y + 0.4} rx={Math.abs(x2 - x1) / 2 + 2} ry={ry} fill={`url(#${id}-contact)`} />
}

/** Wide diffuse shadow under a large body. */
export function AmbientShadow({ id, x1, x2, y, ry = 9 }: { id: string; x1: number; x2: number; y: number; ry?: number }) {
  return <ellipse cx={(x1 + x2) / 2} cy={y} rx={Math.abs(x2 - x1) / 2 + 16} ry={ry} fill={`url(#${id}-ambient)`} />
}
