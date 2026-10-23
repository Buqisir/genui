import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import type { Block } from '../lesson/parse'
import { useStore } from '../lesson/store'
import { boxed, Markdown } from './LessonView'
import {
  beatCount,
  findChoice,
  quizTotal,
  recallText,
  resultText,
  splitActs,
  stepTitle,
  type ComponentBlock,
  type StepModel,
} from './step/model'
import { PlayGate } from './step/playGate'
import { STEP_COMPONENTS, STEP_ONLY_NAMES, StepPlaceholder } from './step/registry'
import { StepEngine, StepRuntimeContext, type StepRuntime } from './step/runtime'
import './step/step.css'

/** Canvas-like components and the problem card go in the left column, everything else in the right. */
const LEFT = new Set(['Sim', 'Figure', 'Collision', 'Stem', 'Circuit', 'ForceDiagram', 'Instrument', 'TickerTape', 'EnergyLevels', 'Wiring', 'GasBox', 'GasTube', 'Fringes'])
/** Declarations only: nothing to draw. */
const SILENT = new Set(['Define'])

const chevron = (dir: 'left' | 'right') => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
    <path d={dir === 'left' ? 'M11 3.5 5.5 9l5.5 5.5' : 'M7 3.5 12.5 9 7 14.5'} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function renderComp(block: ComponentBlock, at: number): ReactNode {
  if (SILENT.has(block.name) || (block.name === 'Param' && block.props.hidden)) return null
  const Comp = STEP_COMPONENTS[block.name]
  if (Comp) return <Comp block={block} at={at} />
  if (STEP_ONLY_NAMES.has(block.name)) return <StepPlaceholder block={block} at={at} />
  return boxed(block, block.line)
}

/** Last line of a sentence, for the faded "previous sentence" row of the narration. */
function lastLine(text: string) {
  const plain = text.replace(/[*_`$]/g, '').replace(/\s+/g, ' ').trim()
  const parts = plain.split(/(?<=[。！？；])/).filter((p) => p.trim())
  return (parts.length ? parts[parts.length - 1] : plain).trim()
}

type Item = { type: 'say' | 'me'; text: string }

function Narration({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false)
  let lastSay = -1
  let prevSay = -1
  let lastMe = -1
  items.forEach((it, i) => {
    if (it.type === 'say') {
      prevSay = lastSay
      lastSay = i
    } else lastMe = i
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
        {items.map((it, i) => row(it, it.type === 'me' ? 'me' : i === lastSay ? 'cur' : 'say', i))}
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
                {lastLine(items[i].text)} ▾
              </button>
            ) : (
              row(items[i], 'cur', i)
            ),
          )}
      </>
    )
  }
  return (
    <aside className="sl-narr" aria-label="讲述" aria-live="polite" data-testid="narration">
      {body}
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
        <div className="sl-act">{`第 ${ai + 1} 幕 · ${act.title}`}</div>
        <h2 className="sl-title">{stepTitle(act, si)}</h2>
      </div>
    )
    narration = <Narration items={narrationItems(step, blocks, engine, beat)} />
    const place = (side: 'left' | 'right') =>
      step.comps
        .map((c, i) => ({ ...c, i }))
        .filter((c) => LEFT.has(c.block.name) === (side === 'left'))
        .map((c) => (
          // not yet reached: keep the room, show nothing, so the page does not jump
          <div key={`${epoch}:${c.i}`} className={`sl-comp sl-comp-${c.block.name}`} style={c.at > beat ? { visibility: 'hidden' } : undefined} data-at={c.at}>
            {renderComp(c.block, c.at)}
          </div>
        ))
    const left = place('left')
    const right = place('right')
    content = (
      <div className={`sl-cols${left.length && right.length ? '' : ' single'}`}>
        {left.length > 0 && <div className="sl-col sl-left">{left}</div>}
        {right.length > 0 && <div className="sl-col sl-right">{right}</div>}
      </div>
    )
  }

  const total = flat.length
  return (
    <div className="sl" data-phase={phase} data-frame={cur?.step.frame} ref={rootRef}>
      <header className="sl-top">
        <button type="button" className="sl-icon" aria-label="上一句" disabled={phase === 'cover'} onClick={() => engine.back()}>
          {chevron('left')}
        </button>
        <span className="sl-progress">{phase === 'step' ? `${idx + 1} / ${total}` : phase === 'done' ? '完成' : '封面'}</span>
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
      <section className="sl-board">
        {head}
        <StepRuntimeContext.Provider value={phase === 'step' ? rt : null}>
          <PlayGate.Provider value={gate}>
            <div className="sl-main">{content}</div>
          </PlayGate.Provider>
        </StepRuntimeContext.Provider>
        <div className="sl-bar">
          <button type="button" className="sl-go" data-sl-main disabled={main.disabled} onClick={() => engine.pressMain()}>
            {main.label}
          </button>
        </div>
      </section>
    </div>
  )
}

/** What the narration has said so far in this step: sentences 0..beat, each followed by the feedback said at it. */
function narrationItems(step: StepModel, blocks: Block[], engine: StepEngine, beat: number): Item[] {
  const result = step.comps.find((c) => c.block.name === 'Result')?.block
  const texts = step.sentences.length
    ? step.sentences.map((s) => (s.kind === 'text' ? s.text : recallText(findChoice(blocks, s.choice), engine.getPredict(s.choice))))
    : [result ? resultText(result, engine.quizScore()) : '']
  const out: Item[] = []
  for (let j = 0; j <= beat && j < texts.length; j++) {
    out.push({ type: 'say', text: texts[j] })
    for (const e of engine.entries()) if (e.beat === j) out.push({ type: e.type, text: e.text })
  }
  return out
}
