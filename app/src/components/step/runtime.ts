import { createContext, useContext, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react'

/**
 * The player's state and the interface step components use to talk to it.
 * `StepEngine` is plain TypeScript (no React) so the rules are testable; `StepRuntime` is the slice of
 * it that a component sees through context, bound to the step that is on screen.
 */

/** A beat is one narration position: one sentence of a step (a step with no prose has one empty beat). */
export type Phase = 'cover' | 'step' | 'done'

export interface Pos {
  phase: Phase
  /** Index into the flat list of steps (all acts, in order). */
  step: number
  beat: number
  /** +1 every time a step is entered (also when coming back to it): scenes replay, components remount. */
  epoch: number
}

export interface StopHandle {
  /** The student got past this stop earlier in this visit to the lesson (so a remounted component can show itself done). */
  readonly resolved: boolean
  /** The stop is cleared: the narration may go on. */
  resolve(): void
  /** The student has picked something: the main button reads 提交 and is enabled, and calls `fn`. `null` = nothing to submit. */
  setSubmit(fn: (() => void) | null): void
  /** Unregister (when the component unmounts). `useStop` does this for you. */
  release(): void
}

export interface StopOptions {
  /** A gate with no options to pick (a lab that needs three runs): the disabled button reads 继续, not 提交. */
  gate?: boolean
}

/** One `<Conclude>`: the props that matter for the chain. */
export interface ConcludeEntry {
  title: string
  text: string
  under?: string
  guess?: boolean
  settles?: string
  result?: 'holds' | 'out'
  blank?: string
}

/** One line of the conclusion chain, ready to draw (see `StepEngine.chain`). */
export interface ChainItem {
  /** The title the entry was written with: unique, and what `under` / `settles` / `mask` refer to. */
  key: string
  /** What is shown: the title of the entry that settled it (holds), "回忆一下" while masked. */
  title: string
  text: string
  /** Indent level: 0 = on the root, 1 = under a root item, … */
  depth: number
  tag: '' | '猜想' | '成立' | '出局'
  out: boolean
  masked: boolean
  /** The newest thing that happened on the chain. */
  latest: boolean
}

export interface StepRuntime {
  /** The sentence the narration is at. */
  beat: number
  /** Unique per step in the lesson, e.g. "1-0" (act 1, step 0 counted flat). */
  stepKey: string
  epoch: number
  /** The stop at sentence `at` of this step: narration cannot go past that sentence until it is resolved. `id` is unique within the step. */
  registerStop(id: string, at: number, opts?: StopOptions): StopHandle
  /** Say feedback as the current sentence of the narration; the next advance replaces it with the next sentence. */
  say(lines: string[]): void
  /** The student's answer, shown in the narration as a small bubble (「我选…」). */
  me(text: string): void
  /** Start the 400 ms hold after a submit: the main button, Enter and → do nothing meanwhile. */
  markSubmitted(): void
  /** Predictions are kept for the whole lesson (read later by `<Recall>`). */
  setPredict(name: string, optionIndex: number): void
  getPredict(name: string): number | undefined
  /** Only the first answer to each quiz question counts. `choiceKey` is any string unique to the question. */
  recordQuiz(choiceKey: string, correct: boolean): void
  quizScore(): { n: number; total: number }
  /**
   * Add a `<Conclude>` to the chain from sentence `at` of this step on (`sort` = its line, to order entries on one sentence).
   * The chain remembers it for the whole visit, so later steps still show it; call again with the same `id` is harmless.
   */
  registerConclude(id: string, at: number, entry: ConcludeEntry, sort?: number): void
  /** A `<Fill mask>` of this step: the chain entries with these titles show their blanked version until the stop `stopId` is resolved. */
  registerMask(stopId: string, titles: string[]): void
  /**
   * Small memory that survives a `replay()` (and only that): the object `init` made the first time, per `id`.
   * Mutate it, or replace its fields, and keep React state in step with it. Dropped when a step is entered again.
   */
  keep<T extends object>(id: string, init: () => T): T
  /** Play the scenes of this step from t = 0 again: every component of the step remounts (stops and `keep` memory stay). Call it last: the runtime you hold is dead afterwards. */
  replay(): void
}

export const StepRuntimeContext = createContext<StepRuntime | null>(null)

/** The runtime of the step on screen, or null when the component is rendered outside a step lesson. */
export const useStepRuntime = () => useContext(StepRuntimeContext)

/** Register a stop for as long as the component is mounted. Returns a handle whose methods are safe to call at any time. */
export function useStop(id: string, at: number, opts?: StopOptions): StopHandle | null {
  const rt = useStepRuntime()
  const reg = rt?.registerStop
  const gate = opts?.gate
  const live = useRef<StopHandle | null>(null)
  const proxy = useMemo<StopHandle>(
    () => ({
      get resolved() {
        return live.current?.resolved ?? false
      },
      resolve: () => live.current?.resolve(),
      setSubmit: (fn) => live.current?.setSubmit(fn),
      release: () => live.current?.release(),
    }),
    [],
  )
  useLayoutEffect(() => {
    if (!reg) return
    const h = reg(id, at, { gate })
    live.current = h
    return () => {
      h.release()
      if (live.current === h) live.current = null
    }
  }, [reg, id, at, gate])
  return rt ? proxy : null
}

interface Stop {
  key: string
  at: number
  gate: boolean
  submit: (() => void) | null
}

interface LogEntry {
  beat: number
  type: 'say' | 'me'
  text: string
}

export const HOLD_MS = 400

export interface MainButton {
  label: '开始' | '继续' | '提交' | '重新开始'
  disabled: boolean
}

export class StepEngine {
  pos: Pos = { phase: 'cover', step: 0, beat: 0, epoch: 0 }
  private version = 0
  private listeners = new Set<() => void>()
  private stops = new Map<string, Stop>()
  private resolvedStops = new Set<string>()
  private log: LogEntry[] = []
  private predicts = new Map<string, number>()
  private quiz = new Map<string, boolean>()
  private holdUntil = 0
  private concludes = new Map<string, { step: number; at: number; sort: number; entry: ConcludeEntry }>()
  private masks = new Map<string, { step: number; titles: string[]; stopKey: string }>()
  private kept = new Map<string, object>()
  /** The engine most recently asked for a runtime: lets `<ConcludeChain />` find it from anywhere in the layout. */
  static latest: StepEngine | null = null
  /** Test hook: the clock. */
  now = () => Date.now()

  /** `beats[i]` = number of beats of flat step i; `total` = number of quiz questions. */
  constructor(
    readonly beats: number[],
    readonly total: number,
  ) {}

  subscribe = (l: () => void) => {
    this.listeners.add(l)
    return () => {
      this.listeners.delete(l)
    }
  }
  getVersion = () => this.version
  private notify() {
    this.version++
    this.listeners.forEach((l) => l())
  }

  get stepKey() {
    return String(this.pos.step)
  }
  private lastBeat(step = this.pos.step) {
    return Math.max((this.beats[step] ?? 1) - 1, 0)
  }

  // ---- moving ----

  private enter(step: number, beat: number) {
    this.pos = { phase: 'step', step, beat, epoch: this.pos.epoch + 1 }
    this.stops.clear()
    this.kept.clear()
    this.log = []
    this.notify()
  }

  start() {
    if (this.pos.phase !== 'cover') return
    if (this.beats.length) this.enter(0, 0)
    else this.finish()
  }

  private finish() {
    this.pos = { ...this.pos, phase: 'done', epoch: this.pos.epoch + 1 }
    this.stops.clear()
    this.log = []
    this.notify()
  }

  restart() {
    this.predicts.clear()
    this.quiz.clear()
    this.resolvedStops.clear()
    this.concludes.clear()
    this.masks.clear()
    this.kept.clear()
    this.pos = { phase: 'cover', step: 0, beat: 0, epoch: this.pos.epoch + 1 }
    this.stops.clear()
    this.log = []
    this.holdUntil = 0
    this.notify()
  }

  /** The stop that keeps the narration from going past the current sentence, if any (the earliest one). */
  blockingStop(): Stop | undefined {
    if (this.pos.phase !== 'step') return undefined
    let best: Stop | undefined
    for (const s of this.stops.values()) {
      if (s.at <= this.pos.beat && !this.resolvedStops.has(s.key) && (!best || s.at < best.at)) best = s
    }
    return best
  }

  held() {
    return this.now() < this.holdUntil
  }

  /** → and the 继续 button. False when a stop is in the way (or nothing to advance to). */
  advance(): boolean {
    const { phase, step, beat } = this.pos
    if (phase === 'cover') {
      this.start()
      return true
    }
    if (phase !== 'step' || this.blockingStop()) return false
    if (beat < this.lastBeat()) {
      this.pos = { ...this.pos, beat: beat + 1 }
      this.notify()
    } else if (step + 1 < this.beats.length) this.enter(step + 1, 0)
    else this.finish()
    return true
  }

  /** ←: the previous sentence; from the first sentence, the last sentence of the previous step. A stop does not hold you back. */
  back(): boolean {
    const { phase, step, beat } = this.pos
    if (phase === 'done') {
      if (!this.beats.length) return false
      this.enter(this.beats.length - 1, this.lastBeat(this.beats.length - 1))
      return true
    }
    if (phase !== 'step') return false
    if (beat > 0) {
      this.pos = { ...this.pos, beat: beat - 1 }
      this.notify()
    } else if (step > 0) this.enter(step - 1, this.lastBeat(step - 1))
    else {
      this.pos = { phase: 'cover', step: 0, beat: 0, epoch: this.pos.epoch + 1 }
      this.stops.clear()
      this.log = []
      this.notify()
    }
    return true
  }

  // ---- the main button ----

  mainButton(): MainButton {
    const { phase } = this.pos
    if (phase === 'cover') return { label: '开始', disabled: false }
    if (phase === 'done') return { label: '重新开始', disabled: false }
    const stop = this.blockingStop()
    if (!stop) return { label: '继续', disabled: false }
    return { label: stop.submit || !stop.gate ? '提交' : '继续', disabled: !stop.submit }
  }

  /** Click on the main button, or Enter. */
  pressMain(): void {
    if (this.held()) return
    const { phase } = this.pos
    if (phase === 'done') return this.restart()
    if (phase === 'cover') return this.start()
    const stop = this.blockingStop()
    if (stop) {
      if (stop.submit) {
        const fn = stop.submit
        fn()
        this.markSubmitted()
      }
      return
    }
    this.advance()
  }

  /** The right arrow: 继续, but ignored right after a submit. */
  pressRight(): void {
    if (this.held()) return
    this.advance()
  }

  markSubmitted() {
    this.holdUntil = this.now() + HOLD_MS
  }

  // ---- narration log ----

  /** Feedback and answers said in the current step, in order. */
  entries(): readonly LogEntry[] {
    return this.log
  }
  say(lines: string[]) {
    const text = lines.filter((l) => l.trim()).join('\n\n')
    if (!text) return
    this.log = [...this.log, { beat: this.pos.beat, type: 'say', text }]
    this.notify()
  }
  me(text: string) {
    if (!text.trim()) return
    this.log = [...this.log, { beat: this.pos.beat, type: 'me', text }]
    this.notify()
  }

  // ---- stops ----

  registerStop(stepKey: string, id: string, at: number, opts?: StopOptions): StopHandle {
    const key = `${stepKey}#${id}`
    const stop: Stop = { key, at, gate: !!opts?.gate, submit: null }
    this.stops.set(key, stop)
    this.notify()
    const mine = () => this.stops.get(key) === stop
    const resolvedSet = this.resolvedStops
    return {
      get resolved() {
        return resolvedSet.has(key)
      },
      resolve: () => {
        if (this.resolvedStops.has(key) && !stop.submit) return
        this.resolvedStops.add(key)
        stop.submit = null
        this.notify()
      },
      setSubmit: (fn) => {
        if (!mine() || stop.submit === fn) return
        stop.submit = fn
        this.notify()
      },
      release: () => {
        if (!mine()) return
        this.stops.delete(key)
        this.notify()
      },
    }
  }

  // ---- lesson-wide records ----

  setPredict(name: string, optionIndex: number) {
    this.predicts.set(name, optionIndex)
    this.notify()
  }
  getPredict(name: string) {
    return this.predicts.get(name)
  }
  recordQuiz(key: string, correct: boolean) {
    if (this.quiz.has(key)) return
    this.quiz.set(key, correct)
    this.notify()
  }
  quizScore() {
    let n = 0
    for (const ok of this.quiz.values()) if (ok) n++
    return { n, total: this.total }
  }

  // ---- replay, memory ----

  /** Remount the components of the step on screen so the scenes start over; stops and `keep` memory stay. */
  replay() {
    if (this.pos.phase !== 'step') return
    this.pos = { ...this.pos, epoch: this.pos.epoch + 1 }
    this.notify()
  }

  keep<T extends object>(stepKey: string, id: string, init: () => T): T {
    const key = `${stepKey}#${id}`
    let v = this.kept.get(key)
    if (!v) this.kept.set(key, (v = init()))
    return v as T
  }

  // ---- the conclusion chain ----

  registerConclude(step: number, id: string, at: number, entry: ConcludeEntry, sort = 0) {
    const key = `${step}#${id}`
    const old = this.concludes.get(key)
    if (old && old.at === at && old.sort === sort && JSON.stringify(old.entry) === JSON.stringify(entry)) return
    this.concludes.set(key, { step, at, sort, entry })
    this.notify()
  }

  registerMask(step: number, stopId: string, titles: string[]) {
    const key = `${step}#${stopId}`
    const old = this.masks.get(key)
    if (old && old.titles.join('\n') === titles.join('\n')) return
    this.masks.set(key, { step, titles, stopKey: `${step}#${stopId}` })
    this.notify()
  }

  /**
   * The chain as it stands at the current sentence: the entries of earlier steps and of this step up to the
   * sentence, so going back to an earlier step shows the chain as it was then. A `settles` entry does not get a
   * line of its own: `holds` turns the line it settles into itself, `out` strikes that line through.
   */
  chain(): ChainItem[] {
    const { phase, step, beat } = this.pos
    if (phase === 'cover') return []
    const rank = (c: { step: number; at: number; sort: number }) => c.step * 1e9 + c.at * 1e6 + c.sort
    const seen = [...this.concludes.values()]
      .filter((c) => phase === 'done' || c.step < step || (c.step === step && c.at <= beat))
      .sort((a, b) => rank(a) - rank(b))
    const titles = new Set(seen.filter((c) => !c.entry.settles).map((c) => c.entry.title))
    const settlers = new Map<string, (typeof seen)[number]>()
    for (const c of seen) if (c.entry.settles && titles.has(c.entry.settles)) settlers.set(c.entry.settles, c)
    const absorbed = new Set(settlers.values())
    const masked = (title: string) => {
      if (phase === 'done') return false
      for (const m of this.masks.values()) if (m.step <= step && m.titles.includes(title) && !this.resolvedStops.has(m.stopKey)) return true
      return false
    }
    type Node = { item: ChainItem; entry: ConcludeEntry; names: string[]; rank: number; kids: Node[] }
    const nodes: Node[] = []
    let newest = -1
    for (const c of seen) {
      if (absorbed.has(c)) continue
      const e = c.entry
      const s = settlers.get(e.title)
      const holds = s?.entry.result === 'holds'
      const out = s?.entry.result === 'out'
      const shown = holds ? s!.entry : e
      const names = holds ? [e.title, s!.entry.title] : [e.title]
      const hidden = names.some(masked)
      const r = Math.max(rank(c), s ? rank(s) : -1)
      newest = Math.max(newest, r)
      nodes.push({
        item: {
          key: e.title,
          title: hidden ? '回忆一下' : shown.title,
          text: hidden ? ((holds ? s!.entry.blank : undefined) ?? e.blank ?? '……') : shown.text,
          depth: 0,
          tag: hidden ? '' : holds ? '成立' : out ? '出局' : e.guess ? '猜想' : '',
          out: !hidden && out,
          masked: hidden,
          latest: false,
        },
        entry: e,
        names,
        rank: r,
        kids: [],
      })
    }
    const byName = new Map<string, Node>()
    for (const n of nodes) for (const name of n.names) byName.set(name, n)
    const parentOf = (n: Node): Node | undefined => {
      const p = n.entry.under ? byName.get(n.entry.under) : undefined
      if (!p || p === n) return undefined
      // a loop of unders: the entry that closes it goes back to the root
      for (let q: Node | undefined = p, i = 0; q && i <= nodes.length; i++) {
        if (q === n) return undefined
        q = q.entry.under ? byName.get(q.entry.under) : undefined
      }
      return p
    }
    const roots: Node[] = []
    for (const n of nodes) {
      const p = parentOf(n)
      if (p) p.kids.push(n)
      else roots.push(n)
    }
    const out: ChainItem[] = []
    const walk = (n: Node, depth: number) => {
      n.item.depth = depth
      n.item.latest = n.rank === newest
      out.push(n.item)
      n.kids.forEach((k) => walk(k, depth + 1))
    }
    roots.forEach((n) => walk(n, 0))
    return out
  }

  /**
   * What a component of the step entered at `epoch` sees (add `beat` to get a `StepRuntime`). Built once per
   * step visit so `registerStop` keeps its identity; calls from a step that is no longer on screen do nothing.
   */
  runtimeFor(epoch: number, stepKey: string): Omit<StepRuntime, 'beat'> {
    const live = () => this.pos.epoch === epoch
    StepEngine.latest = this
    return {
      stepKey,
      epoch,
      registerStop: (id, at, opts) => this.registerStop(stepKey, id, at, opts),
      say: (lines) => live() && this.say(lines),
      me: (text) => live() && this.me(text),
      markSubmitted: () => this.markSubmitted(),
      setPredict: (n, i) => this.setPredict(n, i),
      getPredict: (n) => this.getPredict(n),
      recordQuiz: (k, c) => this.recordQuiz(k, c),
      quizScore: () => this.quizScore(),
      registerConclude: (id, at, entry, sort) => live() && this.registerConclude(this.pos.step, id, at, entry, sort),
      registerMask: (stopId, titles) => live() && this.registerMask(this.pos.step, stopId, titles),
      keep: (id, init) => this.keep(stepKey, id, init),
      replay: () => live() && this.replay(),
    }
  }
}

/** The conclusion chain at the current sentence, kept up to date. Works anywhere inside the step lesson, also outside the runtime provider. */
export function useChain(): ChainItem[] {
  const engine = StepEngine.latest
  const sub = useMemo(() => engine?.subscribe ?? (() => () => {}), [engine])
  const version = useSyncExternalStore(sub, engine?.getVersion ?? (() => 0))
  return useMemo(() => engine?.chain() ?? [], [engine, version])
}
