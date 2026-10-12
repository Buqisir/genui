// Extra <Motion> checks for belt friction, buoyancy, the accelerating frame, and toppling.
// Prop whitelists stay in validate.ts; this checks the new fields and their expressions.

interface Ctx {
  err: (message: string) => void
  expr: (value: unknown, where: string, extra?: string[]) => void
  /** Names visible inside the run (state, t, solved forces). */
  local: string[]
  /** Body names, when mode is bodies. Empty for a single body. */
  names: string[]
  mode: string
}

const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null)

function checkTip(tip: unknown, where: string, ctx: Ctx) {
  const { err, expr, local } = ctx
  const t = obj(tip)
  if (!t) {
    err(`${where} 应为 {halfWidth, comHeight, mu, a}`)
    return
  }
  const allow = new Set(['halfWidth', 'comHeight', 'mu', 'a'])
  for (const k of Object.keys(t)) if (!allow.has(k)) err(`${where} 有未知字段 ${k}（可用：halfWidth、comHeight、mu、a）`)
  if (t.halfWidth === undefined) err(`${where}.halfWidth 缺少（质心到棱的水平距离 b）`)
  else expr(t.halfWidth, `${where}.halfWidth`, local)
  if (t.comHeight === undefined) err(`${where}.comHeight 缺少（质心高度 h）`)
  else expr(t.comHeight, `${where}.comHeight`, local)
  if (t.mu !== undefined) expr(t.mu, `${where}.mu`, local)
  if (t.a !== undefined) expr(t.a, `${where}.a`, local)
  if (typeof t.halfWidth === 'number' && !(t.halfWidth > 0)) err(`${where}.halfWidth 应为正数`)
  if (typeof t.comHeight === 'number' && !(t.comHeight > 0)) err(`${where}.comHeight 应为正数`)
}

function checkBuoyancy(b: unknown, where: string, ctx: Ctx) {
  const { err, expr, local } = ctx
  const o = obj(b)
  if (!o) {
    err(`${where} 应为 {rho, V}`)
    return
  }
  const allow = new Set(['rho', 'V'])
  for (const k of Object.keys(o)) if (!allow.has(k)) err(`${where} 有未知字段 ${k}（可用：rho、V）`)
  if (o.rho === undefined) err(`${where}.rho 缺少（液体密度）`)
  else expr(o.rho, `${where}.rho`, local)
  if (o.V === undefined) err(`${where}.V 缺少（排开液体的体积）`)
  else expr(o.V, `${where}.V`, local)
}

function checkBody(b: Record<string, unknown>, where: string, ctx: Ctx) {
  const { err, expr, local, names, mode } = ctx
  const at = (k: string) => (where ? `${where}.${k}` : k)
  if (b.aFrame !== undefined) expr(b.aFrame, at('aFrame'), local)
  if (b.frame !== undefined) {
    if (mode !== 'bodies') err(`${at('frame')} 只在 bodies 里用：写容器那个物体的名字。单个物体用 aFrame（容器向下的加速度）`)
    else if (typeof b.frame !== 'string' || !names.includes(b.frame) || b.frame === b.name) err(`${at('frame')} 应为另一个物体的名字（容器）`)
  }
  if (b.tip !== undefined) checkTip(b.tip, at('tip'), ctx)
  const forces = Array.isArray(b.forces) ? b.forces : []
  forces.forEach((item, j) => {
    const f = obj(item)
    if (!f) return
    const fw = `${at('forces')}[${j}]`
    if (f.buoyancy !== undefined) checkBuoyancy(f.buoyancy, `${fw}.buoyancy`, ctx)
    const fr = obj(f.friction)
    if (!fr || fr.belt === undefined) return
    expr(fr.belt, `${fw}.friction.belt`, local)
    if (fr.with !== undefined) err(`${fw}.friction 的 belt 就是带面，不要再写 with（地面也不用写）`)
  })
}

export function checkMotionExtras(props: Record<string, unknown>, ctx: Ctx): void {
  if (Array.isArray(props.bodies)) {
    if (props.aFrame !== undefined) ctx.expr(props.aFrame, 'aFrame', ctx.local)
    props.bodies.forEach((item, i) => {
      const b = obj(item)
      if (b) checkBody(b, `bodies[${i}]`, ctx)
    })
    return
  }
  checkBody(props, '', ctx)
}
