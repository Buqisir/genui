import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import type { Block } from '../lesson/parse'
import { useStore } from '../lesson/store'
import { boxed, Markdown } from './LessonView'
import {
  beatCount,
  choiceOptions,
  findChoice,
  quizTotal,
  recallText,
  resultText,
  splitActs,
  stepTitle,
  type ComponentBlock,
  type StepModel,
} from './step/model'
import { detectLayout, placeComps, sceneMin, SCENE_NAMES, SIZABLE_SCENES, type LayoutKind } from './step/layout'
import { useDesktop, useLayoutFit } from './step/layoutFit'
import { ConcludeChain } from './step/parts/ConcludeChain'
import { PlayGate } from './step/playGate'
import { STEP_COMPONENTS, STEP_ONLY_NAMES, StepPlaceholder } from './step/registry'
import { StepEngine, StepRuntimeContext, type StepRuntime, type Tone } from './step/runtime'
import './step/step.css'

/** Declarations only: nothing to draw. */
const SILENT = new Set(['Define'])

const chevron = (dir: 'left' | 'right') => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
    <path d={dir === 'left' ? 'M11 3.5 5.5 9l5.5 5.5' : 'M7 3.5 12.5 9 7 14.5'} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function renderComp(block: ComponentBlock, at: number, canvasH?: number): ReactNode {
  if (SILENT.has(block.name) || (block.name === 'Param' && block.props.hidden)) return null
  // the layout owns the canvas height on desktop (board spec 3.3: canvas size follows the layout)
  if (canvasH !== undefined) block = { ...block, props: { ...block.props, height: canvasH } }
  const Comp = STEP_COMPONENTS[block.name]
  if (Comp) return <Comp block={block} at={at} />
  if (STEP_ONLY_NAMES.has(block.name)) return <StepPlaceholder block={block} at={at} />
  return boxed(block, block.line)
}

/**
 * Last sentence of a line, for the faded "previous sentence" row of the narration.
 * Keeps the Markdown and TeX as they are (the row renders them); cuts only outside $…$,
 * so a punctuation mark inside a formula does not end a sentence.
 */
function lastLine(text: string) {
  const plain = text.replace(/\s+/g, ' ').trim()
  let inMath = false
  const ends: number[] = []
  for (let i = 0; i < plain.length; i++) {
    const ch = plain[i]
    if (ch === '$') inMath = !inMath
    else if (!inMath && '。！？；'.includes(ch)) ends.push(i)
  }
  // drop a terminator that closes the text; the last sentence starts after the one before it
  if (ends.length && ends[ends.length - 1] === plain.length - 1) ends.pop()
  const start = ends.length ? ends[ends.length - 1] + 1 : 0
  return plain.slice(start).trim()
}

type Item = { type: 'say' | 'me' | 'fb'; text: string; tone?: Tone }

/**
 * Every line the narration of a step can say at its tallest: sentences, recalls, result lines.
 * On a phone the narration sits above the board, so its height must not change from sentence to sentence
 * or the board would move down the page; Narration reserves the tallest of these (see `.sl-narr-ghost`).
 * Feedback is not in here: it sits in the bar on a phone (see Feedback).
 */
function ghostTexts(step: StepModel, blocks: Block[]): string[] {
  const out: string[] = []
  for (const s of step.sentences) {
    if (s.kind === 'text') out.push(s.text)
    else {
      const choice = findChoice(blocks, s.choice)
      out.push(recallText(choice, undefined))
      choiceOptions(choice).forEach((_, i) => out.push(recallText(choice, i)))
    }
  }
  return out.filter((t) => t.trim())
}

/** The feedback a component said after the current sentence: said after the last sentence, so it leaves when the narration moves on. */
function currentFeedback(items: Item[]): Item | null {
  let lastSayIdx = -1
  items.forEach((it, i) => {
    if (it.type === 'say') lastSayIdx = i
  })
  for (let i = items.length - 1; i > lastSayIdx; i--) if (items[i].type === 'fb') return items[i]
  return null
}

/** Feedback under the question (desktop: in the narration; phone: in the bar). */
function Feedback({ fb, where }: { fb: Item | null; where: 'narr' | 'bar' }) {
  if (!fb) return null
  return (
    <div className={`sl-fb sl-fb-${where}${fb.tone ? ` ${fb.tone}` : ''}`} data-testid={`feedback-${where}`}>
      {fb.tone === 'hint' && <div className="sl-fb-h">提示</div>}
      <div className="sl-fb-body">
        {fb.tone === 'right' && <svg className="sl-fb-i" width="16" height="16" viewBox="0 0 16 16" aria-label="对"><circle cx="8" cy="8" r="7" fill="currentColor" /><path d="M4.8 8.2 7 10.4 11.2 5.8" stroke="var(--c-card)" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        {fb.tone === 'wrong' && <svg className="sl-fb-i" width="16" height="16" viewBox="0 0 16 16" aria-label="不对"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M5.5 5.5 10.5 10.5M10.5 5.5 5.5 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>}
        <Markdown text={fb.text} />
      </div>
    </div>
  )
}

function Narration({ items, ghost, fb }: { items: Item[]; ghost: string[]; fb: Item | null }) {
  const [open, setOpen] = useState(false)
  // sentences and the user's own lines only; feedback is shown separately under the sentence
  let lastSay = -1
  let prevSay = -1
  let lastMe = -1
  items.forEach((it, i) => {
    if (it.type === 'say') {
      prevSay = lastSay
      lastSay = i
    } else if (it.type === 'me') lastMe = i
  })
  const row = (it: Item, cls: string, i: number) => (
    <div key={i} className={`sl-item ${cls}`}>
      <Markdown text={it.text} />
    </div>
  )
  let body: ReactNode
  if (open && prevSay >= 0) {
    body = (
      <>
        <button type="button" className="sl-item sl-fold" onClick={() => setOpen(false)}>
          收起记录 ▴
        </button>
        {items.map((it, i) => row(it, it.type === 'me' ? 'me' : it.type === 'say' && i === lastSay ? 'cur' : 'say', i))}
      </>
    )
  } else {
    const show = new Set<number>()
    if (prevSay >= 0) show.add(prevSay)
    if (lastMe >= 0) show.add(lastMe)
    if (lastSay >= 0) show.add(lastSay)
    body = (
      <>
        {/* a blank row where the previous sentence will be, so the current sentence does not move */}
        {prevSay < 0 && <div className="sl-item prev ph" aria-hidden="true">&nbsp;</div>}
        {[...show]
          .sort((a, b) => a - b)
          .map((i) =>
            items[i].type === 'me' ? (
              row(items[i], 'me', i)
            ) : i === prevSay ? (
              <button key={i} type="button" className="sl-item prev" aria-expanded="false" title="展开本步记录" onClick={() => setOpen(true)}>
                <Markdown text={lastLine(items[i].text)} /> ▾
              </button>
            ) : (
              row(items[i], 'cur', i)
            ),
          )}
        <Feedback fb={fb} where="narr" />
      </>
    )
  }
  return (
    <aside className={`sl-narr${open && prevSay >= 0 ? ' open' : ''}`} aria-label="讲述" aria-live="polite" data-testid="narration">
      <div className="sl-narr-ghost" aria-hidden="true">
        <div className="sl-item prev">&nbsp;</div>
        <div className="sl-item me">&nbsp;</div>
        <div className="sl-ghost-stack">
          {ghost.map((t, i) => (
            <div key={i} className="sl-item cur">
              <Markdown text={t} />
            </div>
          ))}
        </div>
      </div>
      <div className="sl-narr-live">{body}</div>
    </aside>
  )
}

export function StepLesson({ blocks, title }: { blocks: Block[]; title?: string }) {
  const store = useStore()
  const model = useMemo(() => splitActs(blocks), [blocks])
  const flat = useMemo(() => model.acts.flatMap((act, ai) => act.steps.map((step, si) => ({ act, ai, step, si }))), [model])
  const engine = useMemo(
    () => new StepEngine(flat.map((f) => beatCount(f.step)), quizTotal(model.acts)),
    [flat, model],
  )
  useSyncExternalStore(engine.subscribe, engine.getVersion)
  const { phase, step: idx, beat, epoch } = engine.pos
  const cur = phase === 'step' ? flat[idx] : undefined

  // A lesson that declares <Param name="beat" hidden> gets the sentence number written into it.
  const hasBeat = store.defs.has('beat')
  useLayoutEffect(() => {
    if (hasBeat) store.set({ beat: phase === 'step' ? beat : 0 })
  }, [store, hasBeat, phase, beat, epoch])
  useEffect(() => (hasBeat ? () => store.set({ beat: 0 }) : undefined), [store, hasBeat])

  // Keyboard: Enter = main button (held key does not repeat), → = continue, ← = back.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const t = e.target instanceof Element ? e.target : null
      if (e.key === 'Enter' && !e.shiftKey) {
        if (t?.closest('input, textarea, select, a, summary')) return
        const btn = t?.closest('button')
        if (btn && !btn.matches('[data-sl-main], .opt')) return
        e.preventDefault()
        if (e.repeat) return
        engine.pressMain()
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        // sliders and text fields use the arrows themselves
        if (t?.closest('input, textarea, select, [contenteditable="true"]')) return
        if (e.key === 'ArrowRight') engine.pressRight()
        else engine.back()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [engine])

  // A new step starts from the top of the lesson.
  const rootRef = useRef<HTMLDivElement>(null)
  const firstEpoch = useRef(epoch)
  useEffect(() => {
    if (epoch === firstEpoch.current) return
    const r = rootRef.current?.getBoundingClientRect()
    if (r && r.top < 0) window.scrollTo({ top: window.scrollY + r.top - 8 })
  }, [epoch])

  const api = useMemo(() => engine.runtimeFor(epoch, String(idx)), [engine, epoch, idx])
  const rt = useMemo<StepRuntime>(() => ({ ...api, beat }), [api, beat])
  const gate = useMemo(() => {
    const play = cur?.step.play
    return { open: play == null || beat >= play, epoch }
  }, [cur, beat, epoch])

  const main = engine.mainButton()
  const score = engine.quizScore()

  // Layout of this step: which of the nine, and which component goes to which area.
  const plan = useMemo(() => {
    if (!cur) return null
    const kind: LayoutKind = detectLayout(cur.step)
    const zoned = placeComps(
      cur.step.comps.map((c, i) => ({ ...c, i })),
      kind,
    )
    // the first resizable canvas on the left is the one the layout sizes
    const scene = zoned.left.find((c) => SIZABLE_SCENES.has(c.block.name))?.i
    return { kind, zoned, scene }
  }, [cur])
  const desktop = useDesktop()
  // a lesson with <Conclude> keeps the chain row on every step (so the page does not move when the first entry arrives)
  const hasChain = useMemo(() => blocks.some((b) => b.kind === 'component' && b.name === 'Conclude'), [blocks])
  const mainEl = useRef<HTMLDivElement>(null)
  const workEl = useRef<HTMLDivElement>(null)
  const { canvasH } = useLayoutFit(
    { root: rootRef, main: mainEl, work: workEl },
    { desktop, active: phase === 'step' && !!plan, kind: plan?.kind ?? 'pic', stepKey: `${idx}:${epoch}` },
  )

  const items = cur ? narrationItems(cur.step, blocks, engine, beat) : []
  const fb = currentFeedback(items)

  let content: ReactNode
  let narration: ReactNode = null
  let head: ReactNode = null
  if (phase === 'cover') {
    const text = model.opening.filter((b): b is Extract<Block, { kind: 'markdown' }> => b.kind === 'markdown')
    content = (
      <div className="sl-cover" data-testid="cover">
        {text.length === 0 && title && <h2>{title}</h2>}
        <div className="sl-prose">
          {text.map((b, i) => (
            <Markdown key={i} text={b.text} />
          ))}
        </div>
      </div>
    )
  } else if (phase === 'done') {
    content = (
      <div className="sl-done" data-testid="done">
        <div className="sl-done-big">这一课学完了</div>
        {score.total > 0 && (
          <div className="sl-done-sub">
            小测答对 {score.n} / {score.total} 题
          </div>
        )}
      </div>
    )
  } else if (cur) {
    const { act, ai, step, si } = cur
    head = (
      <div className="sl-head">
        <div className="sl-act sl-sr">{`第 ${ai + 1} 幕 · ${act.title}`}</div>
        <h2 className="sl-title">{stepTitle(act, si)}</h2>
      </div>
    )
    narration = <Narration items={items} fb={fb} ghost={ghostTexts(step, blocks)} />
    const { kind, zoned, scene } = plan!
    const place = (list: typeof zoned.left) =>
      list.map((c) => {
        const sized = desktop && c.i === scene
        const cls = `sl-comp sl-comp-${c.block.name}${SCENE_NAMES.has(c.block.name) ? ' sl-canvas' : ''}${sized ? ' sl-scene' : ''}`
        return (
          // not yet reached: keep the room, show nothing, so the page does not jump
          <div key={`${epoch}:${c.i}`} className={cls} style={c.at > beat && c.block.name !== 'Conclude' ? { visibility: 'hidden' } : undefined} data-at={c.at} data-h={sized ? canvasH : undefined} data-min={sized ? sceneMin(c.block.name, c.block.props) : undefined}>
            {renderComp(c.block, c.at, sized ? canvasH : undefined)}
          </div>
        )
      })
    const hasCols = zoned.left.length > 0 || zoned.right.length > 0
    content = (
      <div className="sl-work" ref={workEl} data-layout={kind} data-solo={zoned.left.length === 0 ? '' : undefined} data-testid="work">
        {zoned.none.length > 0 && <div className="sl-silent">{place(zoned.none)}</div>}
        {zoned.span.length > 0 && <div className="sl-span">{place(zoned.span)}</div>}
        {hasCols && (
          <div className="sl-cols">
            {zoned.left.length > 0 && (
              <div className="sl-col sl-left">
                <div className="sl-colin">{place(zoned.left)}</div>
              </div>
            )}
            {zoned.right.length > 0 && (
              <div className="sl-col sl-right">
                <div className="sl-colin">{place(zoned.right)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const total = flat.length
  // progress: one segment per act, filled by the steps done in it (the current step counts half)
  const doneSteps = phase === 'done' ? total : phase === 'step' ? idx : 0
  const fill = (ai: number) => {
    if (phase === 'done') return 1
    if (phase !== 'step') return 0
    const n = model.acts[ai].steps.length
    if (!n) return 0
    const done = flat.filter((f, i) => f.ai === ai && i < idx).length
    return (done + (flat[idx]?.ai === ai ? 0.5 : 0)) / n
  }
  return (
    <div className="sl" data-phase={phase} data-frame={cur?.step.frame} data-layout={plan?.kind} ref={rootRef}>
      <header className="sl-top">
        <button type="button" className="sl-icon" aria-label="上一句" disabled={phase === 'cover'} onClick={() => engine.back()}>
          {chevron('left')}
        </button>
        {title && <span className="sl-course">{title}</span>}
        <div className="sl-progress" role="progressbar" aria-label="进度" aria-valuemin={0} aria-valuemax={total} aria-valuenow={doneSteps}>
          {model.acts.map((act, ai) => (
            <span key={ai} className="sl-seg" style={{ flexGrow: act.steps.length }} title={`第 ${ai + 1} 幕 · ${act.title}`}>
              <span className="sl-seg-fill" style={{ width: `${fill(ai) * 100}%` }} />
            </span>
          ))}
          <span className="sl-sr">{phase === 'step' ? `${idx + 1} / ${total}` : phase === 'done' ? '完成' : '封面'}</span>
        </div>
        <span className="sl-gap" />
        <button
          type="button"
          className="sl-icon"
          aria-label="下一句"
          disabled={phase === 'done' || (phase === 'step' && !!engine.blockingStop())}
          onClick={() => engine.pressRight()}
        >
          {chevron('right')}
        </button>
      </header>
      {narration}
      <section className="sl-board" data-layout={plan?.kind}>
        <StepRuntimeContext.Provider value={phase === 'step' ? rt : null}>
          <PlayGate.Provider value={gate}>
            {/* 板的顺序：标题、结论链、主区（手机上的顺序见 step.css） */}
            {head}
            {phase === 'step' && (
              <div className={`sl-chain${hasChain ? ' has' : ''}`}>
                <ConcludeChain />
              </div>
            )}
            <div className="sl-main" ref={mainEl}>
              {content}
            </div>
          </PlayGate.Provider>
        </StepRuntimeContext.Provider>
        <div className="sl-bar">
          <Feedback fb={phase === 'step' ? fb : null} where="bar" />
          <div className="sl-btns">
            {main.hint && (
              <button type="button" className="sl-go sl-go2" onClick={() => engine.pressHint()}>
                给我提示
              </button>
            )}
            <button type="button" className="sl-go" data-sl-main disabled={main.disabled} onClick={() => engine.pressMain()}>
              {main.label}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

/** What the narration has said so far in this step: sentences 0..beat, each followed by what the components said at it (feedback 'fb', the user's own lines 'me'). */
function narrationItems(step: StepModel, blocks: Block[], engine: StepEngine, beat: number): Item[] {
  const result = step.comps.find((c) => c.block.name === 'Result')?.block
  const texts = step.sentences.length
    ? step.sentences.map((s) => (s.kind === 'text' ? s.text : recallText(findChoice(blocks, s.choice), engine.getPredict(s.choice))))
    : [result ? resultText(result, engine.quizScore()) : '']
  const out: Item[] = []
  for (let j = 0; j <= beat && j < texts.length; j++) {
    out.push({ type: 'say', text: texts[j] })
    for (const e of engine.entries()) {
      if (e.beat !== j) continue
      if (e.type === 'say') out.push({ type: 'fb', text: e.text, tone: e.tone })
      else out.push({ type: 'me', text: e.text })
    }
  }
  return out
}
