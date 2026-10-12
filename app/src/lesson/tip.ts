// Toppling of a rigid box in a horizontally accelerating frame (a braking bus,
// a suitcase). b is the half-width (half the wheelbase), h the centre-of-mass
// height. The normal force shifts opposite the frame acceleration and reaches
// the edge when |a| = g b / h. Past that the box tips. It slides instead when
// the friction limit μg is reached first, i.e. when μ < b/h.

export interface TipInput {
  /** Frame acceleration, positive to the right (m/s²). */
  a: number
  g: number
  /** Half-width, centre to the front or back edge. */
  halfWidth: number
  /** Height of the centre of mass above the contact. */
  comHeight: number
  /** Friction coefficient. Omit to skip the slide check. */
  mu?: number
}

export interface TipResult {
  /** Where the normal sits, metres right of the centre, clamped to ±halfWidth. */
  normalOffset: number
  /** 1 when |a| h > g b (strict: the boundary itself does not tip). */
  tips: number
  /** -1 tips about the left edge, +1 the right edge, 0 does not tip. */
  edge: number
  /** 1 when μ is known and |a| > μ g. */
  slides: number
  /** 1 when μ < b/h, so it slides before the normal can reach the edge. */
  slidesFirst: number
}

const KEYS = ['nAt', 'tips', 'edge', 'slides', 'slidesFirst'] as const

/** Published names. `suffix` is "" for one body and the body name for several. */
export function tipKeys(suffix: string): string[] {
  return KEYS.map((k) => k + suffix)
}

export function tipCriterion(input: TipInput): TipResult {
  const { a, g, halfWidth: b, comHeight: h } = input
  const mu = input.mu
  const finite = Number.isFinite(a) && Number.isFinite(g) && g !== 0 && Number.isFinite(b) && Number.isFinite(h) && h !== 0 && b > 0
  const raw = finite ? -(a / g) * h : 0
  const normalOffset = finite ? Math.max(-b, Math.min(b, raw)) : 0
  const tips = finite && Math.abs(a) * h > g * b + 1e-9 ? 1 : 0
  const edge = tips === 0 ? 0 : a > 0 ? -1 : 1
  const slides = mu === undefined || !Number.isFinite(mu) || !finite ? 0 : Math.abs(a) > mu * g + 1e-12 ? 1 : 0
  const slidesFirst = mu === undefined || !Number.isFinite(mu) || !finite || h === 0 ? 0 : mu < b / h - 1e-12 ? 1 : 0
  return { normalOffset, tips, edge, slides, slidesFirst }
}

/** Write the five names onto a scope (nAt, tips, edge, slides, slidesFirst). */
export function writeTip(scope: Record<string, number>, suffix: string, input: TipInput): void {
  const r = tipCriterion(input)
  scope['nAt' + suffix] = r.normalOffset
  scope['tips' + suffix] = r.tips
  scope['edge' + suffix] = r.edge
  scope['slides' + suffix] = r.slides
  scope['slidesFirst' + suffix] = r.slidesFirst
}
