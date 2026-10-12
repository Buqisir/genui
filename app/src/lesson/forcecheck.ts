// Extra <ForceDiagram> checks: per-force attachment points, direction guides.
// The prop whitelist stays in validate.ts; this only checks the new fields.

interface Ctx {
  err: (message: string) => void
  expr: (value: unknown, where: string, extra?: string[]) => void
}

function checkAt(at: unknown, where: string, expr: Ctx['expr'], err: Ctx['err']) {
  if (at === undefined || at === 'center' || at === 'contact') return
  if (!Array.isArray(at) || at.length !== 2) {
    err(`${where}.at 应为 "center"、"contact"，或相对物体的 [x, y]（半宽、半高为单位）`)
    return
  }
  expr(at[0], `${where}.at[0]`)
  expr(at[1], `${where}.at[1]`)
}

export function checkForceDiagram(props: Record<string, unknown>, ctx: Ctx): void {
  const { err, expr } = ctx
  const forces = Array.isArray(props.forces) ? props.forces : []
  forces.forEach((item, i) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return
    const f = item as Record<string, unknown>
    const where = `forces[${i}]`
    checkAt(f.at, where, expr, err)
    if (f.role === undefined) return
    if (f.role !== 'direction') {
      err(`${where}.role 只能是 "direction"（虚线方向，不进比例尺、不参与 solve）`)
      return
    }
    expr(f.angle, `${where}.angle`)
    if (f.magnitude !== undefined) err(`${where} 是方向参考，不写 magnitude，长度不跟力走`)
    if (f.solve !== undefined) err(`${where} 是方向参考，不参与 solve`)
  })
  if (props.guides === undefined) return
  if (!Array.isArray(props.guides)) {
    err('guides 应为数组：[{label, angle}]，虚线方向，不进比例尺、不参与 solve')
    return
  }
  const allow = new Set(['label', 'angle', 'at', 'color'])
  props.guides.forEach((item, i) => {
    const where = `guides[${i}]`
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      err(`${where} 应为 {label, angle}`)
      return
    }
    const g = item as Record<string, unknown>
    for (const k of Object.keys(g)) if (!allow.has(k)) err(`${where} 有未知字段 ${k}（可用：label、angle、at、color）`)
    if (typeof g.label !== 'string') err(`${where} 缺少 label`)
    expr(g.angle, `${where}.angle`)
    checkAt(g.at, where, expr, err)
  })
}
