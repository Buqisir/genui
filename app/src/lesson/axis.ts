// Rotation about a fixed axis for <Motion axis>.
//
// State is theta (radians, CCW from the orientation the body coordinates are
// written in) and omega = dθ/dt. Body coordinates rotate with theta:
// world = axis + Rot(theta) · p. Torque is the z component of r × F, CCW positive.
// alpha = Στ / I. The optional pivot reaction is mass·a_com − ΣF, with
// a_com = α × r_c − ω² r_c.

import { evaluateIn, symbolsOf, type Scope } from './expr'
import type { Dynamics } from './dynamics'
import { MOTION_RESERVED } from './motion'

interface AxisForce {
  angle?: number | string
  magnitude?: number | string
  at?: unknown
  body?: boolean
  torque?: string
}

const rad = Math.PI / 180
const IDENT = /^[A-Za-z][A-Za-z0-9_]*$/

function val(v: unknown, sc: Scope): number {
  if (typeof v === 'number') return v
  if (typeof v !== 'string') return NaN
  try {
    return evaluateIn(v, sc)
  } catch {
    return NaN
  }
}

const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null)

/** Body point (px, py) rotated CCW by theta into world axes centered on the pivot. */
function rotated(px: number, py: number, theta: number): [number, number] {
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  return [px * c - py * s, px * s + py * c]
}

function forcesOf(props: Record<string, unknown>): AxisForce[] {
  return Array.isArray(props.forces) ? (props.forces.filter((f) => obj(f)) as AxisForce[]) : []
}

function torquesOf(props: Record<string, unknown>): { magnitude?: number | string }[] {
  return Array.isArray(props.torques) ? props.torques.filter((t) => obj(t)) : []
}

function hasCom(axis: Record<string, unknown>): boolean {
  return Array.isArray(axis.com) && axis.com.length === 2
}

function derivedOf(axis: Record<string, unknown>, forces: AxisForce[]): string[] {
  const names = ['alpha', 'tau']
  const reaction = typeof axis.reaction === 'string' && axis.reaction ? axis.reaction : undefined
  if (reaction) names.push(`${reaction}x`, `${reaction}y`, reaction)
  for (const f of forces) if (typeof f.torque === 'string' && f.torque) names.push(f.torque)
  if (hasCom(axis)) names.push('comX', 'comY')
  return names
}

/** Application point in body coordinates, or null when it cannot be read. */
function bodyPoint(at: unknown, axis: Record<string, unknown>, sc: Scope): [number, number] | null {
  if (at === 'com') {
    if (!hasCom(axis)) return null
    const com = axis.com as unknown[]
    return [val(com[0], sc), val(com[1], sc)]
  }
  if (Array.isArray(at) && at.length >= 2) return [val(at[0], sc), val(at[1], sc)]
  return null
}

/** Expressions the solver must treat as inputs (inertia, geometry, forces, pure torques). */
export function axisExprs(props: Record<string, unknown>): unknown[] {
  if (props.axis === undefined) return []
  const axis = obj(props.axis) ?? {}
  const out: unknown[] = [props.mass, axis.x, axis.y, axis.inertia]
  if (Array.isArray(axis.com)) out.push(...axis.com)
  for (const f of Array.isArray(props.forces) ? props.forces : []) {
    const o = obj(f)
    if (!o) continue
    out.push(o.angle, o.magnitude)
    if (Array.isArray(o.at)) out.push(...o.at)
  }
  for (const t of Array.isArray(props.torques) ? props.torques : []) {
    const o = obj(t)
    if (o) out.push(o.magnitude)
  }
  return out
}

export function axisDynamics(props: Record<string, unknown>): Dynamics | null {
  if (props.axis === undefined) return null
  const axis = obj(props.axis) ?? {}
  const forces = forcesOf(props)
  const torques = torquesOf(props)
  const reaction = typeof axis.reaction === 'string' && axis.reaction ? axis.reaction : undefined
  const com = hasCom(axis)
  const derived = derivedOf(axis, forces)

  const derive = (sc: Scope) => {
    const theta = sc.theta
    const omega = sc.omega
    const ax = axis.x === undefined ? 0 : val(axis.x, sc)
    const ay = axis.y === undefined ? 0 : val(axis.y, sc)
    let cx = 0
    let cy = 0
    if (com) {
      const pair = axis.com as unknown[]
      ;[cx, cy] = rotated(val(pair[0], sc), val(pair[1], sc), theta)
      sc.comX = ax + cx
      sc.comY = ay + cy
    }
    let sumFx = 0
    let sumFy = 0
    let tau = 0
    for (const f of forces) {
      const xy = bodyPoint(f.at, axis, sc)
      const [rx, ry] = xy ? rotated(xy[0], xy[1], theta) : [NaN, NaN]
      const ang = (val(f.angle, sc) + (f.body === true ? (theta * 180) / Math.PI : 0)) * rad
      const mag = val(f.magnitude, sc)
      const fx = mag * Math.cos(ang)
      const fy = mag * Math.sin(ang)
      const tq = rx * fy - ry * fx
      if (typeof f.torque === 'string' && f.torque) sc[f.torque] = tq
      sumFx += fx
      sumFy += fy
      tau += tq
    }
    for (const q of torques) tau += val(q.magnitude, sc)
    sc.tau = tau
    const alpha = tau / val(axis.inertia, sc)
    sc.alpha = alpha
    if (reaction) {
      if (com && props.mass !== undefined) {
        const m = val(props.mass, sc)
        // a_com = α × r_c − ω² r_c. Pivot force balances that against the applied forces.
        const acx = -alpha * cy - omega * omega * cx
        const acy = alpha * cx - omega * omega * cy
        const Rx = m * acx - sumFx
        const Ry = m * acy - sumFy
        sc[`${reaction}x`] = Rx
        sc[`${reaction}y`] = Ry
        sc[reaction] = Math.hypot(Rx, Ry)
      } else {
        sc[`${reaction}x`] = NaN
        sc[`${reaction}y`] = NaN
        sc[reaction] = NaN
      }
    }
  }

  const init = (sc: Scope, warn: (m: string) => void): Record<string, number> => {
    const I = val(axis.inertia, sc)
    if (!(I > 0)) warn('axis.inertia 应为正数（对轴的转动惯量）')
    return {}
  }

  return {
    mode: 'axis',
    state: {},
    rates: { theta: 'omega', omega: 'alpha' },
    events: [],
    derived,
    derive,
    init,
  }
}

export interface AxisValidateCtx {
  err: (message: string) => void
  expr: (value: unknown, where: string, extra?: string[]) => void
  keysOnly: (obj: Record<string, unknown>, allowed: string[], where: string) => void
  declared: Set<string>
  vars: string[]
  derived: string[]
  circuitReads: string[]
  local: string[]
}

/** Structural checks for `<Motion axis>`. Name clashes with derived outputs are also reported by the caller. */
export function validateAxis(props: Record<string, unknown>, ctx: AxisValidateCtx): void {
  const bannedWith = ['along', 'bodies', 'ropes', 'track', 'fields'].filter((k) => props[k] !== undefined)
  if (bannedWith.length) ctx.err(`axis 不能和 ${bannedWith.join('、')} 一起写`)
  for (const k of ['theta', 'omega']) {
    if (!ctx.vars.includes(k)) ctx.err(`绕固定轴转动时 state 要有 theta（转角，弧度）和 omega（角速度）（缺 ${k}）`)
  }
  const axis = obj(props.axis)
  if (!axis) {
    ctx.err('axis 应为对象')
    return
  }
  ctx.keysOnly(axis, ['x', 'y', 'inertia', 'com', 'reaction'], 'axis')
  const paramsOnly = (value: unknown, where: string, why: string) => {
    if (value === undefined) return
    if (typeof value === 'number') return
    if (typeof value !== 'string') {
      ctx.err(`${where} 应为数字或表达式字符串`)
      return
    }
    const banned = new Set(['t', ...ctx.vars, ...ctx.derived, ...ctx.circuitReads])
    try {
      for (const s of symbolsOf(value)) {
        if (banned.has(s)) ctx.err(`${where} 用了 ${s}：${why}`)
        else if (!ctx.declared.has(s)) ctx.err(`${where} 引用了未声明的名字 ${s}：${value}`)
      }
    } catch (e) {
      ctx.err(`${where} 表达式无法解析：${value}（${(e as Error).message}）`)
    }
  }
  paramsOnly(axis.x, 'axis.x', '轴的位置在一次运动里不变，只能用参数')
  paramsOnly(axis.y, 'axis.y', '轴的位置在一次运动里不变，只能用参数')
  if (axis.inertia === undefined) ctx.err('绕固定轴转动要写 axis.inertia（对轴的转动惯量）')
  else ctx.expr(axis.inertia, 'axis.inertia', ctx.local)
  const comOk = hasCom(axis)
  if (axis.com !== undefined && !comOk) ctx.err('axis.com 应为 [x, y]（质心相对轴的随体坐标）')
  if (comOk) {
    const com = axis.com as unknown[]
    paramsOnly(com[0], 'axis.com[0]', '质心的随体坐标在一次运动里不变，只能用参数')
    paramsOnly(com[1], 'axis.com[1]', '质心的随体坐标在一次运动里不变，只能用参数')
  }
  if (props.mass !== undefined) ctx.expr(props.mass, 'mass', ctx.local)

  const claimed = new Set<string>(['alpha', 'tau', ...(comOk ? ['comX', 'comY'] : [])])
  const claim = (name: unknown, where: string) => {
    if (typeof name !== 'string' || !IDENT.test(name)) {
      ctx.err(`${where} 应为名字`)
      return
    }
    if (MOTION_RESERVED.has(name)) ctx.err(`${where} 不能叫 ${name}（t 是时间，tEnd 是结束时刻）`)
    else if (ctx.vars.includes(name)) ctx.err(`${where} 的名字 ${name} 与状态量重名`)
    else if (ctx.circuitReads.includes(name)) ctx.err(`${where} 的名字 ${name} 与电路 read 重名`)
    else if (ctx.declared.has(name)) ctx.err(`${where} 的名字 ${name} 与课件里已声明的名字重名`)
    else if (claimed.has(name)) ctx.err(`${where} 的名字 ${name} 与组件算出的量重名`)
    else claimed.add(name)
  }
  if (axis.reaction !== undefined) {
    if (props.mass === undefined) ctx.err('axis.reaction 需要 mass（轴的作用力由质心运动反推）')
    if (!comOk) ctx.err('axis.reaction 需要 axis.com（质心在随体坐标里的位置）')
    claim(axis.reaction, 'axis.reaction')
    if (typeof axis.reaction === 'string' && IDENT.test(axis.reaction)) {
      claim(`${axis.reaction}x`, 'axis.reaction')
      claim(`${axis.reaction}y`, 'axis.reaction')
    }
  }

  if (props.forces !== undefined && !Array.isArray(props.forces)) ctx.err('forces 应为数组')
  for (const [j, f] of (Array.isArray(props.forces) ? props.forces : []).entries()) {
    const fw = `forces[${j}]`
    if (!obj(f)) {
      ctx.err(`${fw} 应为对象`)
      continue
    }
    const force = f as Record<string, unknown>
    if (force.solve !== undefined || force.friction !== undefined) {
      ctx.err('绕固定轴转动时轴的作用力写 axis.reaction 发布，不要写 solve')
    }
    ctx.keysOnly(force, ['label', 'angle', 'magnitude', 'at', 'body', 'torque'], fw)
    if (force.at === undefined) ctx.err(`${fw} 缺少 at（作用点写 "com" 或随体坐标 [x, y]）`)
    else if (force.at === 'com') {
      if (!comOk) ctx.err(`${fw}.at 写了 "com"，但 axis 没有 com`)
    } else if (Array.isArray(force.at) && force.at.length === 2) {
      ctx.expr(force.at[0], `${fw}.at[0]`, ctx.local)
      ctx.expr(force.at[1], `${fw}.at[1]`, ctx.local)
    } else ctx.err(`${fw}.at 应为 "com" 或 [x, y]`)
    if (force.body !== undefined && typeof force.body !== 'boolean') ctx.err(`${fw}.body 应为布尔值`)
    if (force.torque !== undefined) claim(force.torque, `${fw}.torque`)
    ctx.expr(force.magnitude, `${fw}.magnitude`, ctx.local)
    ctx.expr(force.angle, `${fw}.angle`, ctx.local)
  }

  if (props.torques !== undefined && !Array.isArray(props.torques)) ctx.err('torques 应为数组')
  for (const [j, t] of (Array.isArray(props.torques) ? props.torques : []).entries()) {
    const tw = `torques[${j}]`
    if (!obj(t)) {
      ctx.err(`${tw} 应为对象`)
      continue
    }
    const torque = t as Record<string, unknown>
    ctx.keysOnly(torque, ['label', 'magnitude'], tw)
    ctx.expr(torque.magnitude, `${tw}.magnitude`, ctx.local)
  }
}
