import { Component, memo, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { parseLesson, type Block, type Props } from '../lesson/parse'
import { buildRegistry, StoreProvider, useStore } from '../lesson/store'
import { ThemeContext, type ThemeName } from '../theme'
import { Answer, ParamControl, Preset, QuestionList, Readout, Status } from './controls'
import { Bars, Dial, Ledger } from './charts'
import { Circuit } from './Circuit'
import { EnergyLevels } from './EnergyLevels'
import { ForceDiagram } from './ForceDiagram'
import { GasBox } from './GasBox'
import { GasTube } from './GasTube'
import { Fringes } from './Fringes'
import { Instrument } from './Instrument'
import { Plot } from './Plot'
import { Sim } from './Sim'
import { TickerTape } from './TickerTape'
import { Wiring } from './Wiring'
import { Rich } from './rich'

type ComponentBlock = Extract<Block, { kind: 'component' }>

const Markdown = memo(function Markdown({ text }: { text: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
      {text}
    </ReactMarkdown>
  )
})

class Boundary extends Component<{ name: string; children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="block-error" role="alert">
          {this.props.name} 渲染出错：{this.state.error.message}
        </div>
      )
    }
    return this.props.children
  }
}

function renderComponent(b: ComponentBlock): ReactNode {
  const { name, props, body } = b
  switch (name) {
    case 'Param':
      return <ParamControl props={props} />
    case 'Preset':
      return <Preset props={props} />
    case 'Readout':
      return <Readout props={props} />
    case 'Status':
      return <Status props={props} />
    case 'Answer':
      return <Answer props={props} />
    case 'Plot':
      return <Plot props={props} />
    case 'Bars':
      return <Bars props={props} />
    case 'Ledger':
      return <Ledger props={props} />
    case 'Dial':
      return <Dial props={props} />
    case 'Sim':
      return <Sim props={props} body={body ?? ''} />
    case 'Figure':
      return <Sim props={props} body={body ?? ''} still />
    case 'ForceDiagram':
      return <ForceDiagram props={props} />
    case 'Circuit':
      return <Circuit props={props} />
    case 'Instrument':
      return <Instrument props={props} />
    case 'Fringes':
      return <Fringes props={props} />
    case 'TickerTape':
      return <TickerTape props={props} />
    case 'EnergyLevels':
      return <EnergyLevels props={props} />
    case 'Wiring':
      return <Wiring props={props} />
    case 'GasBox':
      return <GasBox props={props} />
    case 'GasTube':
      return <GasTube props={props} />
    default:
      return <div className="block-error">未知组件：{name}</div>
  }
}

const boxed = (b: ComponentBlock, key: number | string) => (
  <Boundary key={key} name={b.name}>
    {renderComponent(b)}
  </Boundary>
)

const SCENES = new Set(['Sim', 'Figure', 'Circuit', 'ForceDiagram', 'Instrument', 'TickerTape', 'EnergyLevels', 'Wiring', 'GasBox', 'GasTube', 'Fringes'])
const MAIN = new Set([...SCENES, 'Plot', 'Bars', 'Ledger', 'Dial'])
const SIDE = new Set(['Question', 'Param', 'Preset', 'Status', 'Readout', 'Answer'])

type Size = 'full' | 'wide' | 'narrow'

function naturalSize(b: ComponentBlock, isFirstScene: boolean): Size {
  const s = b.props.size
  if (s === 'full' || s === 'wide' || s === 'narrow') return s
  if (b.name === 'Ledger' || b.name === 'Dial') return 'narrow'
  if (b.name === 'Plot' || b.name === 'Bars') return 'wide'
  if (b.name === 'ForceDiagram' && !isFirstScene) return 'wide'
  return 'full'
}

/** Pairs a wide chart with a narrow card on one row (7 + 5 columns), otherwise full width. */
function spans(blocks: ComponentBlock[]): number[] {
  const firstScene = blocks.findIndex((b) => SCENES.has(b.name))
  const sizes = blocks.map((b, i) => naturalSize(b, i === firstScene))
  const out: number[] = new Array(blocks.length).fill(12)
  for (let i = 0; i < blocks.length; i++) {
    const a = sizes[i]
    const b = sizes[i + 1]
    if (a === 'full' || b === undefined || b === 'full') {
      out[i] = a === 'narrow' ? 6 : 12
      continue
    }
    if (a === 'narrow' && b === 'narrow') [out[i], out[i + 1]] = [6, 6]
    else if (a === 'wide' && b === 'narrow') [out[i], out[i + 1]] = [7, 5]
    else if (a === 'narrow' && b === 'wide') [out[i], out[i + 1]] = [5, 7]
    else {
      out[i] = 12
      continue
    }
    i++
  }
  return out
}

const docIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
    <rect x="2.5" y="1.5" width="9" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4.8 4.8h4.4M4.8 7h4.4M4.8 9.2h2.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)
const moonIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
    <path d="M11.5 8.6A4.8 4.8 0 0 1 5.4 2.5a4.8 4.8 0 1 0 6.1 6.1Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
)

/** A lesson split by <Segment> markers: what comes before the first one is the opening, then one segment per screen. */
function splitSegments(blocks: Block[]) {
  const intro: Block[] = []
  const segs: { head: ComponentBlock; blocks: Block[] }[] = []
  for (const b of blocks) {
    if (b.kind === 'component' && b.name === 'Segment') segs.push({ head: b, blocks: [] })
    else if (segs.length) segs[segs.length - 1].blocks.push(b)
    else intro.push(b)
  }
  return { intro, segs }
}

/** Problem sentence quoted at the top of a segment; `**…**` marks the givens this segment uses. */
function Quote({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return (
    <blockquote className="seg-quote">
      <span className="seg-quote-tag">题目</span>
      {parts.map((p, i) =>
        i % 2 ? (
          <mark key={i}>
            <Rich html text={p} />
          </mark>
        ) : (
          <Rich key={i} html text={p} />
        ),
      )}
    </blockquote>
  )
}

const SEG_CONTROLS = ['Param', 'Preset', 'Status', 'Readout']

function SegmentPage({ seg }: { seg: { head: ComponentBlock; blocks: Block[] } }) {
  const comps = seg.blocks.filter((b): b is ComponentBlock => b.kind === 'component')
  const visuals = comps.filter((b) => MAIN.has(b.name))
  const controls = comps.filter((b) => SEG_CONTROLS.includes(b.name) && !(b.name === 'Param' && b.props.hidden))
  const questions = comps.filter((b) => b.name === 'Question')
  const answers = comps.filter((b) => b.name === 'Answer')
  const texts = seg.blocks.filter((b) => b.kind === 'markdown') as Extract<Block, { kind: 'markdown' }>[]
  const hint = typeof seg.head.props.hint === 'string' ? seg.head.props.hint : ''
  const watch = typeof seg.head.props.watch === 'string' ? seg.head.props.watch : ''
  const hasVisual = visuals.length > 0
  const quote = typeof seg.head.props.quote === 'string' ? seg.head.props.quote : ''
  return (
    <div className={`seg-page ${hasVisual ? '' : 'seg-text-only'}`}>
      {hasVisual && (
        <div className="seg-visual">
          {/* Sliders sit right under the main figure; a second chart (a graph of the same quantity) follows them. */}
          {boxed(visuals[0], 'v0')}
          {controls.length > 0 && <div className="seg-controls">{controls.map((b, i) => boxed(b, `c${i}`))}</div>}
          {visuals.slice(1).map((b, i) => boxed(b, `v${i + 1}`))}
          {questions.length > 0 && (
            <Boundary name="Question">
              <QuestionList items={questions.map((q) => q.props as Props)} />
            </Boundary>
          )}
        </div>
      )}
      <div className="seg-text">
        {quote && <Quote text={quote} />}
        {(hint || watch) && (
          <div className="seg-hint">
            {hint && (
              <p>
                <b>动手</b>
                {hint}
              </p>
            )}
            {watch && (
              <p>
                <b>注意看</b>
                {watch}
              </p>
            )}
          </div>
        )}
        <div className="solution seg-solution">
          {texts.map((b, i) => (
            <Markdown key={i} text={b.text} />
          ))}
        </div>
        {answers.map((b, i) => boxed(b, `a${i}`))}
      </div>
    </div>
  )
}

function SegmentedLesson({ blocks }: { blocks: Block[] }) {
  const { intro, segs } = useMemo(() => splitSegments(blocks), [blocks])
  const [at, setAt] = useState(0)
  const cur = Math.min(at, segs.length - 1)
  const introText = intro.filter((b) => b.kind === 'markdown') as Extract<Block, { kind: 'markdown' }>[]
  const go = (i: number) => {
    setAt(i)
    // Coming from the footer the tabs are above the fold: go back to the top, where the problem
    // text is. Clicking a tab that is already in view leaves the page where it is.
    const nav = document.querySelector('.seg-nav')
    if (nav && nav.getBoundingClientRect().top < 0) window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return (
    <div className="seg-lesson">
      {cur === 0 && introText.length > 0 && (
        <div className="seg-intro solution">
          {introText.map((b, i) => (
            <Markdown key={i} text={b.text} />
          ))}
        </div>
      )}
      <ol className="seg-nav">
        {segs.map((s, i) => (
          <li key={i}>
            <button className={i === cur ? 'active' : i < cur ? 'done' : ''} aria-current={i === cur ? 'step' : undefined} onClick={() => go(i)}>
              <span className="seg-num">{i + 1}</span>
              <span className="seg-title">{String(s.head.props.title ?? '')}</span>
            </button>
          </li>
        ))}
      </ol>
      {/* key: a fresh page per segment, so its figures start from their own initial state */}
      <SegmentPage key={cur} seg={segs[cur]} />
      <div className="seg-footer">
        <button className="pill" disabled={cur === 0} onClick={() => go(cur - 1)}>
          ← 上一段
        </button>
        <span className="seg-count">
          {cur + 1} / {segs.length}
        </span>
        <button className="pill seg-next" disabled={cur === segs.length - 1} onClick={() => go(cur + 1)}>
          {cur + 1 < segs.length ? `下一段：${String(segs[cur + 1].head.props.title ?? '')} →` : '已是最后一段'}
        </button>
      </div>
    </div>
  )
}

const screenIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
    <rect x="1.5" y="2" width="11" height="7.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <path d="M7 9.5V12M4.5 12h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

// Class mode is laid out once at this size and scaled to the projector, so a figure fills the
// same share of the wall on any screen.
const STAGE_W = 1280
const STAGE_H = 720

function useStageScale() {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return scale
}

const str = (v: unknown) => (typeof v === 'string' ? v : '')

/** What the teacher reads before showing a page: how to drive the figure and the explanation itself. */
function TeachNotes({ seg, intro }: { seg: { head: ComponentBlock; blocks: Block[] } | null; intro: Block[] }) {
  const blocks = seg ? seg.blocks : intro
  const texts = blocks.filter((b) => b.kind === 'markdown') as Extract<Block, { kind: 'markdown' }>[]
  const answers = blocks.filter((b): b is ComponentBlock => b.kind === 'component' && b.name === 'Answer')
  const hint = seg ? str(seg.head.props.hint) : ''
  const watch = seg ? str(seg.head.props.watch) : ''
  return (
    <aside className="teach-notes" aria-label="讲稿">
      <div className="teach-notes-title">讲稿 · 只给老师看</div>
      {(hint || watch) && (
        <div className="seg-hint">
          {hint && (
            <p>
              <b>操作</b>
              {hint}
            </p>
          )}
          {watch && (
            <p>
              <b>引导看</b>
              {watch}
            </p>
          )}
        </div>
      )}
      <div className="solution seg-solution">
        {texts.map((b, i) => (
          <Markdown key={i} text={b.text} />
        ))}
      </div>
      {answers.map((b, i) => boxed(b, `a${i}`))}
    </aside>
  )
}

function TeachPage({ seg, shown, onReveal }: { seg: { head: ComponentBlock; blocks: Block[] }; shown: boolean; onReveal: () => void }) {
  const store = useStore()
  const comps = seg.blocks.filter((b): b is ComponentBlock => b.kind === 'component')
  const visuals = comps.filter((b) => MAIN.has(b.name))
  const inputs = comps.filter((b) => (b.name === 'Param' && !b.props.hidden) || b.name === 'Preset')
  const outputs = comps.filter((b) => b.name === 'Readout' || b.name === 'Status')
  const quote = str(seg.head.props.quote)
  const ask = str(seg.head.props.ask)
  const reveal = str(seg.head.props.reveal)
  const revealParam = str(seg.head.props.revealParam)
  // Until the class has answered, show only what the question gives: the figure and its inputs.
  // Readouts and the graph come with the answer; the figure hides its own answer through revealParam.
  const open = !reveal || shown
  useEffect(() => {
    if (!revealParam) return
    store.set({ [revealParam]: open ? 1 : 0 })
  }, [store, revealParam, open])
  useEffect(() => (revealParam ? () => store.set({ [revealParam]: 1 }) : undefined), [store, revealParam])
  if (visuals.length === 0) {
    // The worked solution: written out large, as it would go on the board.
    const texts = seg.blocks.filter((b) => b.kind === 'markdown') as Extract<Block, { kind: 'markdown' }>[]
    return (
      <div className="teach-board solution">
        {texts.map((b, i) => (
          <Markdown key={i} text={b.text} />
        ))}
      </div>
    )
  }
  return (
    <div className="teach-page">
      <div className="teach-visual">
        {boxed(visuals[0], 'v0')}
        {inputs.length > 0 && <div className="seg-controls">{inputs.map((b, i) => boxed(b, `c${i}`))}</div>}
      </div>
      <div className="teach-side">
        {/* Once answered, the quote makes room for the readouts and the graph. */}
        {quote && !(shown && (outputs.length > 0 || visuals.length > 1)) && <Quote text={quote} />}
        {ask && (
          <div className="teach-ask">
            <span className="teach-tag">问</span>
            <Rich html text={ask} />
          </div>
        )}
        {reveal &&
          (shown ? (
            <div className="teach-reveal">
              <Rich html text={reveal} />
            </div>
          ) : (
            <button className="teach-reveal-btn" onClick={onReveal}>
              揭晓 <kbd>空格</kbd>
            </button>
          ))}
        {open && outputs.map((b, i) => boxed(b, `o${i}`))}
        {open && visuals.slice(1).map((b, i) => boxed(b, `v${i + 1}`))}
      </div>
    </div>
  )
}

/**
 * Class mode for a segmented lesson: a cover page with the problem, then one segment per screen
 * with the figure large and one question for the class. The explanation is in notes only the
 * teacher opens. A clicker's "next" first reveals the answer to the question, then turns the page.
 */
function TeachView(props: { blocks: Block[]; title: string; problem: string | null; theme: ThemeName; setTheme: (t: ThemeName) => void; onExit: () => void }) {
  const { blocks, title, problem, theme, setTheme, onExit } = props
  const { intro, segs } = useMemo(() => splitSegments(blocks), [blocks])
  const scale = useStageScale()
  const [at, setAt] = useState(0)
  const [shown, setShown] = useState(false)
  const [notes, setNotes] = useState(false)
  const seg = at > 0 ? segs[at - 1] : null
  const hasReveal = !!seg && str(seg.head.props.reveal) !== ''
  const go = (i: number) => {
    setAt(Math.max(0, Math.min(segs.length, i)))
    setShown(false)
  }
  const next = () => (hasReveal && !shown ? setShown(true) : go(at + 1))
  const fullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    else void document.documentElement.requestFullscreen?.().catch(() => {})
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') return
      const k = e.key
      if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') next()
      else if (k === 'ArrowLeft' || k === 'PageUp') go(at - 1)
      else if (k === 'n' || k === 'N') setNotes((v) => !v)
      else if (k === 'f' || k === 'F') fullscreen()
      else if (k === 'Escape' && !document.fullscreenElement) onExit()
      else return
      // Space on a focused button would click it as well.
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="teach">
      <div className="teach-stage" style={{ zoom: scale } as CSSProperties}>
        <div className="teach-bar">
          <span className="teach-title">{title}</span>
          <ol className="teach-pages">
            {['题目', ...segs.map((s) => str(s.head.props.title))].map((t, i) => (
              <li key={i}>
                <button className={i === at ? 'active' : ''} aria-current={i === at ? 'step' : undefined} onClick={() => go(i)}>
                  {i > 0 && <span className="seg-num">{i}</span>}
                  {i === at || i === 0 ? t : ''}
                </button>
              </li>
            ))}
          </ol>
          <div className="teach-actions">
            <button className={`pill ${notes ? 'active' : ''}`} aria-pressed={notes} onClick={() => setNotes(!notes)} title="N">
              讲稿
            </button>
            <button className={`pill ${theme === 'night' ? 'active' : ''}`} aria-pressed={theme === 'night'} onClick={() => setTheme(theme === 'night' ? 'light' : 'night')}>
              {moonIcon}
            </button>
            <button className="pill" onClick={fullscreen} title="F">
              全屏
            </button>
            <button className="pill" onClick={() => go(at - 1)} disabled={at === 0} aria-label="上一页">
              ←
            </button>
            <button className="pill teach-next" onClick={next} disabled={at === segs.length && !hasReveal} aria-label="下一步">
              →
            </button>
            <button className="pill" onClick={onExit} title="Esc">
              退出
            </button>
          </div>
        </div>
        <div className="teach-body">
          {seg ? (
            // key: each page starts its figures from their own initial state
            <TeachPage key={at} seg={seg} shown={shown} onReveal={() => setShown(true)} />
          ) : (
            <div className="teach-cover">
              {problem && (
                <div className="teach-problem">
                  <Rich html text={problem} />
                </div>
              )}
              <ol className="teach-agenda">
                {segs.map((s, i) => (
                  <li key={i}>
                    <button onClick={() => go(i + 1)}>
                      <span className="seg-num">{i + 1}</span>
                      {str(s.head.props.title)}
                      {str(s.head.props.ask) && (
                        <span className="teach-agenda-ask">
                          <Rich html text={str(s.head.props.ask)} />
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {notes && <TeachNotes seg={seg} intro={intro} />}
        </div>
      </div>
    </div>
  )
}

export function LessonView({ source }: { source: string }) {
  const lesson = useMemo(() => parseLesson(source), [source])
  const registry = useMemo(() => buildRegistry(lesson.blocks), [lesson])
  const meta = lesson.meta
  const [theme, setTheme] = useState<ThemeName>(meta.theme === 'night' ? 'night' : 'light')
  // A segmented lesson keeps the problem in view: students check the givens while they read each segment.
  const segmented = useMemo(() => lesson.blocks.some((b) => b.kind === 'component' && b.name === 'Segment'), [lesson])
  // On a phone the full text would push the figure off the first screen; the givens line stands in for it.
  // When every segment quotes its own sentences, the full text starts folded on any screen.
  const quoted = useMemo(() => lesson.blocks.some((b) => b.kind === 'component' && b.name === 'Segment' && typeof b.props.quote === 'string'), [lesson])
  const [teach, setTeach] = useState(false)
  const [showProblem, setShowProblem] = useState(() => segmented && !quoted && (typeof window === 'undefined' || window.innerWidth > 900))
  const problems = [...lesson.errors.map((e) => `第 ${e.line} 行：${e.message}`), ...registry.errors]

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const comps = lesson.blocks.filter((b): b is ComponentBlock => b.kind === 'component')
  const main = comps.filter((b) => MAIN.has(b.name))
  const side = comps.filter((b) => SIDE.has(b.name) && !(b.name === 'Param' && b.props.hidden))
  const markdown = lesson.blocks.filter((b) => b.kind === 'markdown') as Extract<Block, { kind: 'markdown' }>[]
  const questions = side.filter((b) => b.name === 'Question')
  const params = side.filter((b) => b.name === 'Param')
  const presets = side.filter((b) => b.name === 'Preset')
  const statuses = side.filter((b) => b.name === 'Status')
  const readouts = side.filter((b) => b.name === 'Readout')
  const answers = side.filter((b) => b.name === 'Answer')
  const mainSpans = spans(main)
  const hasClock = main.some((b) => b.name === 'Sim' && Array.isArray(b.props.params) && b.props.params.length > 0)

  const crumbs = Array.isArray(meta.breadcrumb)
    ? [...(meta.breadcrumb as string[])]
    : ([meta.topic, meta.source].filter((x) => typeof x === 'string') as string[])
  if (questions.length) crumbs.push(`${questions.length} 问`)
  const problemText = typeof meta.question === 'string' ? meta.question : null
  const givens = Array.isArray(meta.givens) ? (meta.givens as unknown[]).filter((g): g is string => typeof g === 'string') : []

  return (
    <ThemeContext.Provider value={theme}>
      <StoreProvider registry={registry}>
        {teach && (
          <TeachView
            blocks={lesson.blocks}
            title={typeof meta.title === 'string' ? meta.title : ''}
            problem={problemText}
            theme={theme}
            setTheme={setTheme}
            onExit={() => setTeach(false)}
          />
        )}
        <article className={`lesson theme-${theme}`} hidden={teach}>
          <header className="lesson-head">
            {crumbs.length > 0 && (
              <div className="crumbs">
                {crumbs.map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
              </div>
            )}
            <div className="title-row">
              {typeof meta.title === 'string' && <h1>{meta.title}</h1>}
              <div className="head-actions">
                {segmented && (
                    <button className="pill" onClick={() => setTeach(true)} title="投影到教室屏幕：一页一段，讲解收进讲稿">
                    {screenIcon}上课
                  </button>
                )}
                {problemText && (
                  <button className={`pill ${showProblem ? 'active' : ''}`} aria-expanded={showProblem} onClick={() => setShowProblem(!showProblem)}>
                    {docIcon}题目原文
                  </button>
                )}
                <button className={`pill ${theme === 'night' ? 'active' : ''}`} aria-pressed={theme === 'night'} onClick={() => setTheme(theme === 'night' ? 'light' : 'night')}>
                  {moonIcon}夜光
                </button>
              </div>
            </div>
            {showProblem && problemText && <div className={`problem-text ${segmented ? 'compact' : ''}`}><Rich html text={problemText} /></div>}
            {!showProblem && givens.length > 0 && (
              <button className="givens" onClick={() => setShowProblem(true)} title="展开题目原文">
                {givens.map((g, i) => (
                  <span key={i}>
                    <Rich html text={g} />
                  </span>
                ))}
              </button>
            )}
          </header>

          {problems.length > 0 && (
            <div className="block-error" role="alert">
              <b>课件有 {problems.length} 处问题：</b>
              <ul>
                {problems.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {segmented && <SegmentedLesson blocks={lesson.blocks} />}

          {!segmented && (main.length > 0 || side.length > 0) && (
            <div className="lab">
              <div className="lab-main">
                {main.map((b, i) => (
                  <div
                    key={i}
                    className={`cell span-${mainSpans[i]}`}
                    style={{ '--order': i === 0 ? 2 : 5 } as CSSProperties}
                  >
                    {boxed(b, i)}
                  </div>
                ))}
              </div>
              <aside className="lab-side">
                {questions.length > 0 && (
                  <section className="side-section" style={{ '--order': 1 } as CSSProperties}>
                    <h2 className="side-title">问题</h2>
                    <Boundary name="Question">
                      <QuestionList items={questions.map((q) => q.props as Props)} />
                    </Boundary>
                  </section>
                )}
                {(params.length > 0 || presets.length > 0) && (
                  <section className="side-section" style={{ '--order': 3 } as CSSProperties}>
                    {params.length > 0 && (
                      <h2 className="side-title">
                        参数
                        {hasClock && <span className="side-hint">拖动后从 t = 0 重播</span>}
                      </h2>
                    )}
                    <div className="params">{params.map(boxed)}</div>
                    {presets.length > 0 && <div className="presets">{presets.map(boxed)}</div>}
                  </section>
                )}
                {(statuses.length > 0 || readouts.length > 0) && (
                  <section className="side-section" style={{ '--order': 4 } as CSSProperties}>
                    {statuses.length > 0 && <div className="statuses">{statuses.map(boxed)}</div>}
                    {readouts.map(boxed)}
                  </section>
                )}
                {answers.length > 0 && (
                  <section className="side-section" style={{ '--order': 6 } as CSSProperties}>
                    {answers.map(boxed)}
                  </section>
                )}
              </aside>
            </div>
          )}

          {!segmented && markdown.length > 0 && (
            <section className="solution" id="solution">
              <h2 className="solution-title">分析与解答</h2>
              {markdown.map((b, i) => (
                <Markdown key={i} text={b.text} />
              ))}
            </section>
          )}
        </article>
      </StoreProvider>
    </ThemeContext.Provider>
  )
}
