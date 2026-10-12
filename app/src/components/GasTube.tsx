import { num } from '../lesson/expr'
import type { TubeDraw } from '../lesson/gastube'
import type { Props } from '../lesson/parse'
import { namesIn, useScopeFor } from '../lesson/store'
import { CraftDefs, matFill, useCraftId } from '../craft/svg'
import { craftTokens } from '../craft/tokens'
import { useTheme } from '../theme'
import { StageHead } from './Sim'
import { Rich } from './rich'

// A tube of gas, liquid and pistons. The equilibrium comes from the solver; this only draws it.

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'

function sig3(v: number): string {
  if (!Number.isFinite(v)) return '—'
  const av = Math.abs(v)
  if (av === 0) return '0'
  const exp = Math.floor(Math.log10(av))
  if (exp >= 4 || exp < -2) {
    const m = v / 10 ** exp
    const sup = String(exp)
      .replace('-', '⁻')
      .replace(/\d/g, (d) => SUP[Number(d)])
    return `${m.toPrecision(3)}×10${sup}`
  }
  return v.toFixed(Math.max(0, 2 - exp))
}

interface P {
  x: number
  y: number
}

function intersect(a: P, b: P, c: P, d: P): P {
  const den = (a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x)
  if (Math.abs(den) < 1e-8) return { x: (b.x + c.x) / 2, y: (b.y + c.y) / 2 }
  const t = ((a.x - c.x) * (c.y - d.y) - (a.y - c.y) * (c.x - d.x)) / den
  return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) }
}

/** Offset a polyline to the left of its direction by `dist` pixels. */
function offset(pts: P[], dist: number): P[] {
  if (pts.length < 2) return pts.slice()
  const norm = (a: P, b: P) => {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    return { x: (-dy / len) * dist, y: (dx / len) * dist }
  }
  const out: P[] = []
  for (let i = 0; i < pts.length; i++) {
    if (i === 0 || i === pts.length - 1) {
      const seg = i === 0 ? norm(pts[0], pts[1]) : norm(pts[i - 1], pts[i])
      out.push({ x: pts[i].x + seg.x, y: pts[i].y + seg.y })
    } else {
      const n1 = norm(pts[i - 1], pts[i])
      const n2 = norm(pts[i], pts[i + 1])
      const a = { x: pts[i - 1].x + n1.x, y: pts[i - 1].y + n1.y }
      const b = { x: pts[i].x + n1.x, y: pts[i].y + n1.y }
      const c = { x: pts[i].x + n2.x, y: pts[i].y + n2.y }
      const d = { x: pts[i + 1].x + n2.x, y: pts[i + 1].y + n2.y }
      out.push(intersect(a, b, c, d))
    }
  }
  return out
}

function pathOf(pts: P[], close = false): string {
  if (!pts.length) return ''
  return pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('') + (close ? 'Z' : '')
}

function band(pts: P[], hw: number): string {
  if (pts.length < 2) return ''
  const left = offset(pts, hw)
  const right = offset(pts, -hw).reverse()
  return pathOf([...left, ...right], true)
}

export function GasTube({ props }: { props: Props }) {
  const name = typeof props.name === 'string' ? props.name : ''
  const scope = useScopeFor([name, ...namesIn(props)])
  const obj = scope[name] as unknown as {
    from?: number
    to?: number
    __tube?: { frame: (d: number) => TubeDraw | null; warnings: string[] }
  }
  const from = typeof obj?.from === 'number' ? obj.from : 0
  const to = typeof obj?.to === 'number' ? obj.to : 0
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  let at = num(props.at ?? from, scope, from)
  if (Number.isFinite(lo) && Number.isFinite(hi) && hi > lo) at = Math.min(hi, Math.max(lo, at))
  const frame = obj?.__tube?.frame?.(at) ?? null

  return (
    <figure className="sim still gastube">
      <div className="stage">
        <StageHead props={props} />
        <div className="stage-canvas">
          {frame ? <TubeSvg frame={frame} title={typeof props.title === 'string' ? props.title : '气体装置'} /> : <div className="gastube-empty">装置还算不出来</div>}
        </div>
        {frame && frame.warnings.length > 0 && (
          <ul className="gastube-warn">
            {frame.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        )}
        {typeof props.note === 'string' && (
          <div className="stage-note">
            <Rich text={props.note} html />
          </div>
        )}
      </div>
    </figure>
  )
}

function TubeSvg({ frame, title }: { frame: TubeDraw; title: string }) {
  const theme = useTheme()
  const cid = useCraftId()
  const ck = craftTokens(theme)
  const night = theme === 'night'
  // Same glass and mercury tones as the canvas vessel() so both backends match.
  const glass = night ? '#627A82' : '#93A4AA'
  const merc = night ? { base: '#7E838B', hi: '#B9BDC4' } : { base: '#B9BCC1', hi: '#F1F2F4' }
  const pts = frame.axis
  if (pts.length < 2) return null
  const xs = pts.map((p) => p.x)
  const zs = pts.map((p) => p.z)
  const spanX = Math.max(...xs) - Math.min(...xs)
  const spanZ = Math.max(...zs) - Math.min(...zs)
  const longer = Math.max(spanX, spanZ, 1e-9)
  const minX = Math.min(...xs) - (spanX < longer * 0.25 ? longer * 0.42 : longer * 0.16)
  const maxX = Math.max(...xs) + (spanX < longer * 0.25 ? longer * 0.42 : longer * 0.16)
  const minZ = Math.min(...zs) - (spanZ < longer * 0.25 ? longer * 0.28 : longer * 0.16)
  const maxZ = Math.max(...zs) + (spanZ < longer * 0.25 ? longer * 0.28 : longer * 0.16)
  const worldW = maxX - minX
  const worldH = maxZ - minZ
  const W = 720
  const H = Math.max(260, Math.min(520, 64 + (worldH / worldW) * 560))
  const pad = 36
  const scale = Math.min((W - 2 * pad) / worldW, (H - 2 * pad) / worldH)
  const cx = (minX + maxX) / 2
  const cz = (minZ + maxZ) / 2
  const to = (x: number, z: number): P => ({ x: W / 2 + (x - cx) * scale, y: H / 2 - (z - cz) * scale })
  const hw = 16

  const joints = [0]
  for (let i = 1; i < pts.length; i++) joints.push(joints[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z))

  const poly = (s0: number, s1: number): P[] => {
    const lo = Math.max(0, Math.min(s0, s1))
    const hi = Math.min(frame.Ltot, Math.max(s0, s1))
    if (!(hi > lo)) return []
    const ss = [lo]
    for (const s of joints) if (s > lo + 1e-8 && s < hi - 1e-8) ss.push(s)
    ss.push(hi)
    return ss.map((s) => {
      const p = frame.pose(s)
      return to(p.x, p.z)
    })
  }
  const full = poly(0, frame.Ltot)
  // Left of the direction of +s, in screen space: rotate the tangent 90° CCW.
  const side = (s: number) => {
    const p = frame.pose(s)
    const tx = p.cos
    const ty = -p.sin
    const len = Math.hypot(tx, ty) || 1
    return { tx: tx / len, ty: ty / len, nx: -ty / len, ny: tx / len, at: to(p.x, p.z) }
  }

  const unitP = frame.units === 'cmHg' ? 'cmHg' : 'Pa'
  const unitL = frame.units === 'cmHg' ? 'cm' : 'm'

  const labels: { x: number; y: number; lines: string[]; anchor: 'start' | 'end' | 'middle' }[] = []
  const axisScreen = frame.axis.map((p) => to(p.x, p.z))
  const midX = axisScreen.reduce((s, p) => s + p.x, 0) / axisScreen.length
  const midY = axisScreen.reduce((s, p) => s + p.y, 0) / axisScreen.length
  const place = (s0: number, s1: number, lines: string[], flip = false) => {
    const s = (Math.min(s0, s1) + Math.max(s0, s1)) / 2
    const d = side(s)
    // On a bend the geometric middle can sit inside the tube; push the label away from the tube's center.
    const toward = (midX - d.at.x) * d.nx + (midY - d.at.y) * d.ny
    const sign = Math.abs(toward) > 12 ? (toward > 0 ? -1 : 1) : flip ? -1 : 1
    const gap = hw + 28
    labels.push({
      x: d.at.x + d.nx * gap * sign,
      y: d.at.y + d.ny * gap * sign,
      lines,
      anchor: sign * d.nx >= 0.2 ? 'start' : sign * d.nx <= -0.2 ? 'end' : 'middle',
    })
  }

  const caps = (['start', 'end'] as const).filter((which) => (which === 'start' ? frame.start : frame.end) === 'closed')
  const opens = (['start', 'end'] as const).filter((which) => (which === 'start' ? frame.start : frame.end) === 'open')

  return (
    <svg id={cid} viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={title}>
      <CraftDefs id={cid} theme={theme} />
      <path d={band(full, hw + 3)} fill={glass} />
      <path d={band(full, hw)} className="tube-bore" />
      {frame.gases.map((g) => (
        <path key={`g${g.name}`} d={band(poly(g.s0, g.s1), hw - 1.2)} className="gas-fill" />
      ))}
      <path d={pathOf(offset(full, hw * 0.62))} fill="none" stroke="#FFFFFF" strokeOpacity={night ? 0.16 : 0.7} strokeWidth={1.6} />
      {frame.liquids.map((h) => {
        const seg = poly(h.s0, h.s1)
        return (
          <g key={`l${h.name}`}>
            <path d={band(seg, hw - 1.2)} fill={merc.base} />
            <path d={pathOf(offset(seg, hw * 0.3))} fill="none" stroke={merc.hi} strokeWidth={3} strokeOpacity={0.85} strokeLinejoin="round" />
          </g>
        )
      })}
      {frame.pistons.map((p) => {
        const vis = Math.max(p.s1 - p.s0, 8 / scale)
        const mid = (p.s0 + p.s1) / 2
        const a = Math.max(0, mid - vis / 2)
        const b = Math.min(frame.Ltot, mid + vis / 2)
        return <path key={`p${p.name}`} d={band(poly(a, b), hw + 1.5)} fill={matFill(cid, night ? 'steelHi' : 'dark')} stroke={ck.strong.color} strokeWidth={ck.strong.width} strokeLinejoin="round" />
      })}
      {[hw + 3, -(hw + 3)].map((d) => (
        <path key={d} d={pathOf(offset(full, d))} className="tube-wall" stroke={ck.strong.color} strokeWidth={ck.strong.width} />
      ))}
      {[hw, -hw].map((d) => (
        <path key={d} d={pathOf(offset(full, d))} className="tube-wall" stroke={ck.soft.color} strokeWidth={ck.soft.width} />
      ))}
      {caps.map((which) => {
        const s = which === 'start' ? 0 : frame.Ltot
        const d = side(s)
        const out = which === 'start' ? -1 : 1
        const a = { x: d.at.x + d.nx * (hw + 3), y: d.at.y + d.ny * (hw + 3) }
        const b = { x: d.at.x - d.nx * (hw + 3), y: d.at.y - d.ny * (hw + 3) }
        const c = { x: a.x + d.tx * out * 6, y: a.y + d.ty * out * 6 }
        const e = { x: b.x + d.tx * out * 6, y: b.y + d.ty * out * 6 }
        return <path key={which} d={pathOf([a, c, e, b], true)} fill={glass} stroke={ck.strong.color} strokeWidth={ck.strong.width} strokeLinejoin="round" />
      })}
      {frame.stops.map((st, i) => {
        const d = side(st.s)
        const tri = (sign: number) => {
          const base = { x: d.at.x + d.nx * sign * (hw + 0.5), y: d.at.y + d.ny * sign * (hw + 0.5) }
          const tip = { x: d.at.x + d.nx * sign * (hw - 8), y: d.at.y + d.ny * sign * (hw - 8) }
          const a = { x: base.x + d.tx * 5, y: base.y + d.ty * 5 }
          const b = { x: base.x - d.tx * 5, y: base.y - d.ty * 5 }
          return `${a.x.toFixed(1)},${a.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)} ${tip.x.toFixed(1)},${tip.y.toFixed(1)}`
        }
        return (
          <g key={`s${i}`} className="stop-mark">
            <polygon points={tri(1)} />
            <polygon points={tri(-1)} />
          </g>
        )
      })}
      {frame.gases.map((g) => {
        place(g.s0, g.s1, [g.name, `${sig3(g.p)} ${unitP}`, `${sig3(g.L)} ${unitL}`])
        return null
      })}
      {frame.liquids.map((h) => {
        place(h.s0, h.s1, [h.name], true)
        return null
      })}
      {frame.pistons.map((p) => {
        const mass = Number.isInteger(p.mass) ? String(p.mass) : sig3(p.mass)
        place(p.s0, p.s1, [p.name, `${mass} kg`], true)
        return null
      })}
      {opens.map((which) => {
        const s = which === 'start' ? 0 : frame.Ltot
        const d = side(s)
        const out = which === 'start' ? -1 : 1
        labels.push({
          x: d.at.x + d.tx * out * (hw + 28),
          y: d.at.y + d.ty * out * (hw + 28),
          lines: [`p₀ = ${sig3(frame.p0)} ${unitP}`],
          anchor: 'middle',
        })
        return null
      })}
      {labels.map((l, i) => (
        <text key={`t${i}`} x={l.x} y={l.y - ((l.lines.length - 1) * 14) / 2} textAnchor={l.anchor} dominantBaseline="middle" className="tube-label">
          {l.lines.map((line, k) => (
            <tspan key={k} x={l.x} dy={k === 0 ? 0 : 14}>
              {line}
            </tspan>
          ))}
        </text>
      ))}
    </svg>
  )
}
