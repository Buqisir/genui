import type { StepModel } from './model'

/**
 * Layout (版式) of one step: which of the nine page shapes in plans/lesson-board-spec.md 3.3 it gets,
 * and which zone each component goes to. Pure functions, no DOM.
 */
export const LAYOUT_KINDS = ['result', 'grid', 'fill', 'example', 'quiz', 'lab', 'derive', 'def', 'pic'] as const
export type LayoutKind = (typeof LAYOUT_KINDS)[number]

/** Components that draw a picture (spec: Sim, Figure, Collision and the other canvas components). */
export const SCENE_NAMES: ReadonlySet<string> = new Set([
  'Sim',
  'Figure',
  'Collision',
  'Circuit',
  'ForceDiagram',
  'Instrument',
  'TickerTape',
  'EnergyLevels',
  'Wiring',
  'GasBox',
  'GasTube',
  'Fringes',
])

/** The part of a step that layout needs: its forced frame and its components. */
export type LayoutInput = Pick<StepModel, 'frame'> & { comps: { block: { name: string; props?: Record<string, unknown> } }[] }

export const isLayoutKind = (v: unknown): v is LayoutKind => typeof v === 'string' && (LAYOUT_KINDS as readonly string[]).includes(v)

export const hasScene = (step: LayoutInput) => step.comps.some((c) => SCENE_NAMES.has(c.block.name))

/**
 * Pick the layout. `<Step frame="…">` wins (an unknown frame is ignored); otherwise the first rule that holds,
 * in the order of the spec table: result, grid, fill, example/quiz, lab, derive, def, else pic.
 */
export function detectLayout(step: LayoutInput): LayoutKind {
  if (isLayoutKind(step.frame)) return step.frame
  const has = (name: string) => step.comps.some((c) => c.block.name === name)
  const scene = hasScene(step)
  if (has('Result')) return 'result'
  if (has('Homework')) return 'grid'
  if (has('Fill')) return 'fill'
  if (has('Stem')) return scene ? 'example' : 'quiz'
  if (scene && has('Lab')) return 'lab'
  if (!scene && step.comps.some((c) => c.block.name === 'Work' && Array.isArray(c.block.props?.blocks))) return 'derive'
  if (scene && has('Def') && !has('Choice')) return 'def'
  return 'pic'
}

export type Zone = 'left' | 'right' | 'span' | 'none'

/**
 * Which area a component goes to. Pictures and problem cards go left; choices, labs, tables, derivations
 * after an answer go right; Result, Homework and Fill take the whole group (Fill lays out its own two halves);
 * Conclude only feeds the conclusion chain and takes no room.
 * In derive, Work is the left card.
 */
export function zoneOf(name: string, kind: LayoutKind): Zone {
  if (name === 'Conclude') return 'none'
  if (name === 'Result' || name === 'Homework' || name === 'Fill') return 'span'
  if (SCENE_NAMES.has(name) || name === 'Stem') return 'left'
  if (name === 'Work' && kind === 'derive') return 'left'
  return 'right'
}

export interface Zoned<T> {
  left: T[]
  right: T[]
  span: T[]
  none: T[]
}

export function placeComps<T extends { block: { name: string } }>(comps: T[], kind: LayoutKind): Zoned<T> {
  const out: Zoned<T> = { left: [], right: [], span: [], none: [] }
  for (const c of comps) out[zoneOf(c.block.name, kind)].push(c)
  return out
}

// ---------------------------------------------------------------------------------------------------------
// Geometry (spec 3.2, 3.3). Numbers only; the DOM measuring lives in layoutFit.ts.

/** Right column width in units of B. */
export const RIGHT_B: Record<LayoutKind, number> = { result: 0, grid: 0, fill: 21, example: 21, quiz: 21, lab: 26, derive: 21, def: 24, pic: 21 }

/** Gap between the two columns: s7 from 1280, s6 below. */
export const colGap = (vw: number) => (vw >= 1280 ? 64 : 40)

/** Width of the left and right columns inside a main area of width `w`. */
export function columnWidths(kind: LayoutKind, w: number, B: number, cg: number): { lw: number; rc: number } {
  const rc = Math.round(RIGHT_B[kind] * B)
  let lw = w - rc - cg
  if (kind === 'quiz') lw = Math.min(Math.round(28 * B), lw)
  return { lw: Math.max(200, Math.floor(lw)), rc }
}

/** Width of a one-column group: result 32B, grid the full width up to 960, anything else 720. */
export function soloWidth(kind: LayoutKind, w: number, B: number): number {
  if (kind === 'result') return Math.min(Math.round(32 * B), w)
  if (kind === 'grid') return Math.min(960, w)
  return Math.min(720, w)
}

/**
 * Vertical geometry of the two columns. `span` is the left stack (problem card, gap, picture), `stack`
 * adds the play bar. The right column is centred on the left one (picture only, no play bar);
 * with no picture both are centred on each other. `topAlign` (fill) puts both at the top.
 */
export function rowGeom(opts: { left: number; right: number; picture: number; gap: number; bar: number; topAlign?: boolean }) {
  const { left, right, picture, gap, bar, topAlign } = opts
  const span = left + (left && picture ? gap : 0) + picture
  const stack = span + (picture ? bar : 0)
  if (topAlign) return { lt: 0, rt: 0, h: Math.max(stack, right) }
  const cy = Math.max(span / 2, right / 2)
  const lt = cy - span / 2
  const rt = cy - right / 2
  return { lt, rt, h: Math.max(lt + stack, rt + right) }
}

/** G1: top of the group in a main area of height `H`: clamp(0, 0.42·H − gh/2, H − gh). */
export const groupTop = (H: number, gh: number) => Math.max(0, Math.min(0.42 * H - gh / 2, H - gh))

/** Squeeze stages when the group is taller than the main area: tighter gaps first, then a smaller B. */
export const FIT_STAGES = [
  { k: 1, dn: 0 },
  { k: 1, dn: 1 },
  { k: 1, dn: 2 },
  { k: 0.93, dn: 2 },
  { k: 0.86, dn: 2 },
  { k: 0.8, dn: 2 },
  { k: 0.74, dn: 2 },
] as const

/** Picture height (canvas only) limits. */
export const CANVAS_MIN = 200
export const CANVAS_MAX = 640

/** Lowest height a scene can be squeezed to. A Collision with bars needs room under the track for both bar groups. */
export function sceneMin(name: string, props: Record<string, unknown>): number {
  if (name === 'Collision' && props.bars !== false && props.body !== 'ball') return 300
  return CANVAS_MIN
}

/** Scene components whose `height` prop the layout sets (the first one on the left). */
export const SIZABLE_SCENES: ReadonlySet<string> = new Set(['Sim', 'Figure', 'Collision', 'Wiring', 'GasBox'])
