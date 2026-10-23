import type { Block } from '../../lesson/parse'

export type ComponentBlock = Extract<Block, { kind: 'component' }>

/** One thing the narration says: a paragraph of prose, or the `<Recall>` of an earlier prediction. */
export type Sentence = { kind: 'text'; text: string } | { kind: 'recall'; choice: string }

export interface StepModel {
  title: string
  /** `<Step play={k}>`: the scenes start at sentence k. */
  play?: number
  /** `<Step frame="…">`: forced layout. */
  frame?: string
  /** 1-based line of the `<Step>` tag. */
  line: number
  sentences: Sentence[]
  /** Every other component in the step, with the sentence it appears at (0 when it comes before any sentence). */
  comps: { block: ComponentBlock; at: number }[]
}

export interface ActModel {
  title: string
  quiz: boolean
  steps: StepModel[]
}

export interface StepLessonModel {
  /** Everything before the first `<Act>`: declarations and the cover text. */
  opening: Block[]
  acts: ActModel[]
}

/** Split prose into paragraphs on blank lines; blank lines inside a ``` or ~~~ fence do not split. */
export function splitParagraphs(text: string): string[] {
  const out: string[] = []
  let cur: string[] = []
  let fence = ''
  const flush = () => {
    const p = cur.join('\n').trim()
    if (p) out.push(p)
    cur = []
  }
  for (const line of text.split('\n')) {
    const m = /^\s*(```|~~~)/.exec(line)
    if (m) {
      if (!fence) fence = m[1]
      else if (fence === m[1]) fence = ''
    }
    if (!fence && !m && line.trim() === '') flush()
    else cur.push(line)
  }
  flush()
  return out
}

/**
 * Cut a lesson with `<Act>` markers into acts and steps (rules: plans/step-lesson-syntax.md, 二).
 * The sentences of a step are its prose paragraphs plus its `<Recall>`s, numbered from 0 in writing
 * order. A component's `at` is the number of the last sentence before it, or 0 if none comes first.
 */
export function splitActs(blocks: Block[]): StepLessonModel {
  const opening: Block[] = []
  const acts: ActModel[] = []
  let act: ActModel | undefined
  let step: StepModel | undefined
  for (const b of blocks) {
    if (b.kind === 'component' && b.name === 'Act') {
      act = { title: str(b.props.title), quiz: b.props.quiz === true, steps: [] }
      acts.push(act)
      step = undefined
    } else if (b.kind === 'component' && b.name === 'Step') {
      // A <Step> with no <Act> before it is a lesson error; keep the step playable in an unnamed act.
      if (!act) {
        act = { title: '', quiz: false, steps: [] }
        acts.push(act)
      }
      step = {
        title: str(b.props.title),
        play: typeof b.props.play === 'number' && Number.isFinite(b.props.play) ? b.props.play : undefined,
        frame: typeof b.props.frame === 'string' ? b.props.frame : undefined,
        line: b.line,
        sentences: [],
        comps: [],
      }
      act.steps.push(step)
    } else if (!step) {
      if (!act) opening.push(b)
    } else if (b.kind === 'markdown') {
      for (const text of splitParagraphs(b.text)) step.sentences.push({ kind: 'text', text })
    } else if (b.name === 'Recall') {
      step.sentences.push({ kind: 'recall', choice: str(b.props.choice) })
    } else {
      step.comps.push({ block: b, at: Math.max(step.sentences.length - 1, 0) })
    }
  }
  let qno = 0
  for (const a of acts) {
    for (const s of a.steps) {
      s.comps = annotate(mergeDefs(s.comps), s, a.quiz, () => ++qno)
    }
  }
  return { opening, acts }
}

type Comp = StepModel['comps'][number]

/** One row of a merged `<Def>` card: its own text plus when it appears and how it lights up. */
export interface DefRow {
  name?: unknown
  text?: unknown
  note?: unknown
  /** The sentence the row (its `<Def>`) appears at. */
  at: number
  /** The row's `<Def>` has `follow`: the row is grey until sentence `at + idx`. */
  follow: boolean
  /** Position of the row inside its own `<Def>`. */
  idx: number
}

/**
 * Several `<Def>`s in one step are one card: the first `<Def>` gets the rows of the later ones (each row carries
 * its own `at`, `follow` and `idx`), and the later `<Def>`s are dropped. A single `<Def>` also gets annotated rows.
 */
export function mergeDefs(comps: Comp[]): Comp[] {
  const rowsOf = (c: Comp): DefRow[] =>
    (Array.isArray(c.block.props.rows) ? (c.block.props.rows as unknown[]) : [])
      .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
      .map((r, idx) => ({ name: r.name, text: r.text, note: r.note, at: c.at, follow: c.block.props.follow === true, idx }))
  const defs = comps.filter((c) => c.block.name === 'Def')
  if (!defs.length) return comps
  const rows = defs.flatMap(rowsOf)
  return comps.flatMap((c) => {
    if (c.block.name !== 'Def') return [c]
    if (c !== defs[0]) return []
    return [{ ...c, block: { ...c.block, props: { ...c.block.props, rows } } }]
  })
}

/**
 * Facts a component cannot see from its own block, added as `_`-props: a `<Choice>` knows whether its step has a
 * `<Stem>` (`_stem`), and in a quiz act that it is question `_qno` (`_quiz`); a `<Result>` knows whether its step has prose (`_prose`).
 */
function annotate(comps: Comp[], step: StepModel, quiz: boolean, nextQno: () => number): Comp[] {
  const hasStem = comps.some((c) => c.block.name === 'Stem')
  return comps.map((c) => {
    if (c.block.name === 'Choice') {
      const extra: Record<string, unknown> = { _stem: hasStem }
      if (quiz) {
        extra._quiz = true
        extra._qno = nextQno()
      }
      return { ...c, block: { ...c.block, props: { ...c.block.props, ...extra } } }
    }
    if (c.block.name === 'Result') return { ...c, block: { ...c.block, props: { ...c.block.props, _prose: step.sentences.length > 0 } } }
    return c
  })
}

const str = (v: unknown) => (typeof v === 'string' ? v : '')

type Opt = { text?: unknown; correct?: unknown; say?: unknown; check?: unknown }

export const choiceOptions = (b: ComponentBlock | undefined): Opt[] =>
  b && Array.isArray(b.props.options) ? (b.props.options as unknown[]).filter((o): o is Opt => !!o && typeof o === 'object') : []

/** The `<Choice name="…">` a `<Recall>` points at, searched over the whole lesson. */
export function findChoice(blocks: Block[], name: string): ComponentBlock | undefined {
  return blocks.find((b): b is ComponentBlock => b.kind === 'component' && b.name === 'Choice' && b.props.name === name)
}

/**
 * What the narration says for a `<Recall>`. `picked` is the option index the student locked in, or
 * undefined if they skipped it (then only the `check` of the correct option is said).
 */
export function recallText(choice: ComponentBlock | undefined, picked: number | undefined): string {
  const opts = choiceOptions(choice)
  if (picked !== undefined && opts[picked]) {
    const o = opts[picked]
    return `你猜的是「${str(o.text)}」${o.correct === true ? '，猜对了。' : '。'}${str(o.check)}`
  }
  return str(opts.find((o) => o.correct === true)?.check)
}

/** The narration of a step that has a `<Result>` and no prose: `say.all` / `say.some` with {n} {total} filled in. */
export function resultText(result: ComponentBlock | undefined, score: { n: number; total: number }): string {
  const say = result && result.props.say && typeof result.props.say === 'object' ? (result.props.say as Record<string, unknown>) : {}
  const tpl = str(score.n >= score.total ? say.all : say.some) || '你答对了 {n} / {total} 题。'
  return tpl.replace(/\{n\}/g, String(score.n)).replace(/\{total\}/g, String(score.total))
}

/** Number of Choice blocks in the quiz acts: the total a `<Result>` reports. */
export function quizTotal(acts: ActModel[]): number {
  let total = 0
  for (const a of acts) if (a.quiz) for (const s of a.steps) total += s.comps.filter((c) => c.block.name === 'Choice').length
  return total
}

/** Title shown for a step: in a quiz act, a step with a Choice gets the prefix "小测 k / M：". */
export function stepTitle(act: ActModel, si: number): string {
  const step = act.steps[si]
  const hasChoice = (s: StepModel) => s.comps.some((c) => c.block.name === 'Choice')
  if (!act.quiz || !hasChoice(step)) return step.title
  const m = act.steps.filter(hasChoice).length
  const k = act.steps.slice(0, si + 1).filter(hasChoice).length
  return `小测 ${k} / ${m}：${step.title}`
}

/** How many beats (narration positions) a step has: one per sentence, at least one. */
export const beatCount = (s: StepModel) => Math.max(s.sentences.length, 1)
