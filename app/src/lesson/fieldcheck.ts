// Validator for one <Motion fields> entry: uniform E/B, a point charge, or a radial field.
// Called from validate.ts so the shared component switch stays a short hook.

import { symbolsOf } from './expr'

export interface FieldCheckCtx {
  err: (message: string) => void
  expr: (value: unknown, where: string, extra?: string[]) => void
  keysOnly: (obj: Record<string, unknown>, allowed: string[], where: string) => void
  /** Lesson-level names (params, defines, earlier outputs). */
  declared: Set<string>
  /** State names. Together with t, banned in geometry that is frozen for the run. */
  vars: string[]
  /** Names an expression inside the run may use (t, state, derived, circuit reads). */
  local: string[]
  /** enter / exit / hit: same duplicate-name rules as other motion events. */
  eventName: (name: unknown, where: string) => void
}

const FIELD_KEYS = [
  'label', 'E', 'angle', 'B', 'dir', 'region', 'enter', 'exit',
  'Q', 'x', 'y', 'k', 'radius', 'hit', 'radial', 'cx', 'cy', 'lines',
]

function frozen(value: unknown, where: string, ctx: FieldCheckCtx) {
  if (typeof value === 'number') return
  if (typeof value !== 'string') {
    ctx.err(`${where} 应为数字或表达式字符串`)
    return
  }
  const banned = new Set(['t', ...ctx.vars])
  try {
    for (const s of symbolsOf(value)) {
      if (banned.has(s)) ctx.err(`${where} 用了 ${s}：在一次运动里不变，只能用参数`)
      else if (!ctx.declared.has(s)) ctx.err(`${where} 引用了未声明的名字 ${s}：${value}`)
    }
  } catch (e) {
    ctx.err(`${where} 表达式无法解析：${value}（${(e as Error).message}）`)
  }
}

function checkB(f: Record<string, unknown>, fw: string, ctx: FieldCheckCtx) {
  if (f.B !== undefined) {
    ctx.expr(f.B, `${fw}.B`, ctx.local)
    if (f.dir === undefined) ctx.err(`${fw} 有磁场 B 就要写 dir（in 向里、out 向外）`)
    else if (f.dir !== 'in' && f.dir !== 'out') ctx.err(`${fw}.dir 只能是 in 或 out`)
  } else if (f.dir !== undefined && f.dir !== 'in' && f.dir !== 'out') ctx.err(`${fw}.dir 只能是 in 或 out`)
}

function checkRegion(f: Record<string, unknown>, fw: string, ctx: FieldCheckCtx) {
  if (f.region === undefined) return
  const region = f.region as Record<string, unknown>
  if (!region || typeof region !== 'object' || Array.isArray(region)) {
    ctx.err(`${fw}.region 应为对象`)
    return
  }
  ctx.keysOnly(region, ['xmin', 'xmax', 'ymin', 'ymax', 'cx', 'cy', 'r', 'from', 'to', 'inner', 'points'], `${fw}.region`)
  const circ = ['cx', 'cy', 'r'].filter((k) => region[k] !== undefined)
  const box = ['xmin', 'xmax', 'ymin', 'ymax'].filter((k) => region[k] !== undefined)
  const ang = ['from', 'to'].filter((k) => region[k] !== undefined)
  if (circ.length > 0 && circ.length < 3) ctx.err(`${fw}.region 的 cx、cy、r 要一起写（圆形区域）`)
  if (ang.length === 1) ctx.err(`${fw}.region 的 from、to 要一起写（扇形、半圆的起止角，度）`)
  else if (ang.length === 2 && circ.length < 3) ctx.err(`${fw}.region 的 from、to 只和圆形区域一起写（cx、cy、r）`)
  const kinds = [circ.length === 3, box.length > 0, region.points !== undefined].filter(Boolean).length
  if (kinds > 1) ctx.err(`${fw}.region 只能是矩形、圆、多边形中的一种`)
  if (typeof region.r === 'number' && !(region.r > 0)) ctx.err(`${fw}.region.r 应为正数`)
  if (typeof region.xmin === 'number' && typeof region.xmax === 'number' && !(region.xmin < region.xmax)) ctx.err(`${fw}.region 的 xmin 应小于 xmax`)
  if (typeof region.ymin === 'number' && typeof region.ymax === 'number' && !(region.ymin < region.ymax)) ctx.err(`${fw}.region 的 ymin 应小于 ymax`)
  if (region.inner !== undefined) {
    if (circ.length < 3) ctx.err(`${fw}.region.inner 只和圆形区域一起写（cx、cy、r）`)
    if (typeof region.inner === 'number' && !(region.inner >= 0)) ctx.err(`${fw}.region.inner 应大于等于 0`)
    if (typeof region.inner === 'number' && typeof region.r === 'number' && !(region.inner < region.r)) ctx.err(`${fw}.region.inner 应小于 r`)
  }
  if (region.points !== undefined) {
    if (!Array.isArray(region.points) || region.points.length < 3) ctx.err(`${fw}.region.points 至少要有 3 个点 [[x, y], ...]`)
    else region.points.forEach((pt, pi) => {
      if (!Array.isArray(pt) || pt.length < 2) ctx.err(`${fw}.region.points[${pi}] 应为 [x, y]`)
    })
  }
  const banned = new Set(['t', ...ctx.vars])
  const boundEntries = Object.entries(region).flatMap(([k, v]) => {
    if (k !== 'points') return [[k, v] as [string, unknown]]
    if (!Array.isArray(v)) return []
    return v.flatMap((pt, pi) => (Array.isArray(pt) ? [[`points[${pi}][0]`, pt[0]], [`points[${pi}][1]`, pt[1]]] : []))
  })
  for (const [k, v] of boundEntries) {
    if (typeof v === 'number') continue
    if (typeof v !== 'string') {
      ctx.err(`${fw}.region.${k} 应为数字或表达式字符串`)
      continue
    }
    try {
      for (const s of symbolsOf(v)) {
        if (banned.has(s)) ctx.err(`${fw}.region.${k} 用了 ${s}：区域边界在一次运动里不变，只能用参数`)
        else if (!ctx.declared.has(s)) ctx.err(`${fw}.region.${k} 引用了未声明的名字 ${s}：${v}`)
      }
    } catch (e) {
      ctx.err(`${fw}.region.${k} 表达式无法解析：${v}（${(e as Error).message}）`)
    }
  }
}

function checkUniform(f: Record<string, unknown>, fw: string, ctx: FieldCheckCtx) {
  for (const k of ['Q', 'x', 'y', 'k', 'radius', 'hit', 'radial', 'cx', 'cy', 'lines'] as const) {
    if (f[k] !== undefined) ctx.err(`${fw} 是匀强场，不能写 ${k}`)
  }
  if (f.E === undefined && f.B === undefined) ctx.err(`${fw} 至少要有 E 或 B`)
  if (f.E !== undefined) {
    if (f.angle === undefined) ctx.err(`${fw} 有电场 E 就要写 angle（度，从 +x 逆时针量）`)
    else ctx.expr(f.angle, `${fw}.angle`, ctx.local)
    ctx.expr(f.E, `${fw}.E`, ctx.local)
  } else if (f.angle !== undefined) ctx.expr(f.angle, `${fw}.angle`, ctx.local)
  checkB(f, fw, ctx)
}

function checkCharge(f: Record<string, unknown>, fw: string, ctx: FieldCheckCtx) {
  for (const k of ['E', 'angle', 'B', 'dir', 'radial', 'cx', 'cy'] as const) {
    if (f[k] !== undefined) ctx.err(`${fw} 是点电荷，不能再写 ${k}（库仑力由 Q、k 决定）`)
  }
  if (f.Q === undefined) ctx.err(`${fw} 点电荷要写 Q`)
  else ctx.expr(f.Q, `${fw}.Q`, ctx.local)
  if (f.x === undefined || f.y === undefined) ctx.err(`${fw} 点电荷的 x、y 要一起写（电荷位置）`)
  if (f.x !== undefined) frozen(f.x, `${fw}.x`, ctx)
  if (f.y !== undefined) frozen(f.y, `${fw}.y`, ctx)
  if (f.k !== undefined) ctx.expr(f.k, `${fw}.k`, ctx.local)
  if (f.lines !== undefined && typeof f.lines !== 'boolean') ctx.err(`${fw}.lines 应为布尔值`)
  const hasR = f.radius !== undefined
  const hasH = f.hit !== undefined
  if (hasR !== hasH) ctx.err(`${fw} 的 radius 和 hit 要一起写（粒子到电荷的距离降到 radius 时停下）`)
  if (hasR) {
    ctx.expr(f.radius, `${fw}.radius`, ctx.local)
    if (typeof f.radius === 'number' && !(f.radius > 0)) ctx.err(`${fw}.radius 应为正数`)
  }
  if (hasH) ctx.eventName(f.hit, `${fw}.hit`)
}

function checkRadial(f: Record<string, unknown>, fw: string, ctx: FieldCheckCtx) {
  for (const k of ['Q', 'x', 'y', 'k', 'radius', 'hit', 'lines'] as const) {
    if (f[k] !== undefined) ctx.err(`${fw} 是径向场，不能再写 ${k}`)
  }
  if (f.radial !== true) ctx.err(`${fw}.radial 只能是 true`)
  if (f.angle !== undefined) ctx.err(`${fw} 是径向场，不能再写 angle（方向沿径向，负的 E 指向圆心）`)
  if (f.cx === undefined || f.cy === undefined) ctx.err(`${fw} 径向场的 cx、cy 要一起写（场的中心）`)
  if (f.cx !== undefined) frozen(f.cx, `${fw}.cx`, ctx)
  if (f.cy !== undefined) frozen(f.cy, `${fw}.cy`, ctx)
  if (f.E === undefined) ctx.err(`${fw} 径向场要写 E（向外为正；表达式里可以用 r，表示到中心的距离）`)
  else ctx.expr(f.E, `${fw}.E`, [...ctx.local, 'r'])
  checkB(f, fw, ctx)
}

/** One fields[] entry. Exactly one kind: uniform E/B, point charge, or radial field. */
export function checkFieldEntry(raw: unknown, index: number, ctx: FieldCheckCtx) {
  const fw = `fields[${index}]`
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    ctx.err(`${fw} 应为对象`)
    return
  }
  const f = raw as Record<string, unknown>
  ctx.keysOnly(f, FIELD_KEYS, fw)
  const charge = f.Q !== undefined
  const radial = f.radial !== undefined
  if (charge && radial) ctx.err(`${fw} 只能是一种场：点电荷（Q、x、y）和径向场（radial）不要写在同一项`)
  if (radial) checkRadial(f, fw, ctx)
  else if (charge) checkCharge(f, fw, ctx)
  else checkUniform(f, fw, ctx)
  checkRegion(f, fw, ctx)
  for (const key of ['enter', 'exit'] as const) {
    if (f[key] !== undefined) ctx.eventName(f[key], `${fw}.${key}`)
  }
}
