import { createContext, useContext, useLayoutEffect, useMemo, useRef } from 'react'

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

  /**
   * What a component of the step entered at `epoch` sees (add `beat` to get a `StepRuntime`). Built once per
   * step visit so `registerStop` keeps its identity; calls from a step that is no longer on screen do nothing.
   */
  runtimeFor(epoch: number, stepKey: string): Omit<StepRuntime, 'beat'> {
    const live = () => this.pos.epoch === epoch
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
    }
  }
}
