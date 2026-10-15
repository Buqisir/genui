import { Component, Fragment, memo, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { parseLesson, type Block, type Props } from '../lesson/parse'
import { buildRegistry, reducedMotion, StoreProvider, useScopeFor, useStore } from '../lesson/store'
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

type Seg = { head: ComponentBlock; blocks: Block[] }

/**
 * The whole problem as one chain: the main figure of each listed segment side by side, joined by
 * the relation that carries one into the next, all driven by one slider. Segments keep their own
 * copies of a quantity (each starts from the problem's value); `link` moves them together here.
 */
function Panorama({ seg, segs, all, shown }: { seg: Seg; segs: Seg[]; all: Block[]; shown: boolean }) {
  const store = useStore()
  const chain = (Array.isArray(seg.head.props.chain) ? seg.head.props.chain : []).map(Number)
  const link = (Array.isArray(seg.head.props.link) ? seg.head.props.link : []).filter((n): n is string => typeof n === 'string')
  const steps = (Array.isArray(seg.head.props.steps) ? seg.head.props.steps : []).map((x) => str(x))
  const lead = link[0] ?? ''
  const scope = useScopeFor(lead ? [lead] : [])
  const v = lead ? scope[lead] : undefined
  useEffect(() => {
    if (v === undefined || link.length < 2) return
    store.set(Object.fromEntries(link.slice(1).map((n) => [n, v])))
  }, [store, v, link.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps
  const leadParam = all.find((b): b is ComponentBlock => b.kind === 'component' && b.name === 'Param' && b.props.name === lead)
  const own = seg.blocks.filter((b): b is ComponentBlock => b.kind === 'component')
  const outputs = own.filter((b) => b.name === 'Readout' || b.name === 'Status')
  const cards = chain
    .map((n) => ({ n, s: segs[n - 1] }))
    .filter((c) => c.s)
    .map((c) => ({ ...c, visual: c.s.blocks.find((b): b is ComponentBlock => b.kind === 'component' && MAIN.has(b.name)) }))
  return (
    <div className="pano">
      <div className="pano-chain">
        {cards.map((c, i) => (
          <Fragment key={c.n}>
            {i > 0 && (
              <div className="pano-step" aria-hidden>
                <span className="pano-arrow">→</span>
                {steps[i - 1] && (
                  <span className="pano-step-label">
                    <Rich html text={steps[i - 1]} />
                  </span>
                )}
              </div>
            )}
            <div className="pano-card">
              <div className="pano-card-title">
                <span className="seg-num">{c.n}</span>
                {str(c.s.head.props.title)}
              </div>
              {c.visual && boxed(c.visual, `pv${c.n}`)}
            </div>
          </Fragment>
        ))}
      </div>
      <div className="pano-controls">
        {leadParam && <div className="pano-slider">{boxed(leadParam, 'lead')}</div>}
        {shown && outputs.map((b, i) => boxed(b, `po${i}`))}
      </div>
    </div>
  )
}

function SegmentPage({ seg, segs, all }: { seg: Seg; segs: Seg[]; all: Block[] }) {
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
  if (Array.isArray(seg.head.props.chain)) {
    return (
      <div className="seg-pano">
        {(hint || watch) && (
          <div className="seg-hint">
            {hint && (
              <p>
                <b>动手</b>
                <Rich html text={hint} />
              </p>
            )}
            {watch && (
              <p>
                <b>注意看</b>
                <Rich html text={watch} />
              </p>
            )}
          </div>
        )}
        <Panorama seg={seg} segs={segs} all={all} shown />
        <div className="solution seg-solution">
          {texts.map((b, i) => (
            <Markdown key={i} text={b.text} />
          ))}
        </div>
      </div>
    )
  }
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
                <Rich html text={hint} />
              </p>
            )}
            {watch && (
              <p>
                <b>注意看</b>
                <Rich html text={watch} />
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
      <SegmentPage key={cur} seg={segs[cur]} segs={segs} all={blocks} />
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
              <Rich html text={hint} />
            </p>
          )}
          {watch && (
            <p>
              <b>引导看</b>
              <Rich html text={watch} />
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

function TeachPage({ seg, segs, all, shown, onReveal }: { seg: Seg; segs: Seg[]; all: Block[]; shown: boolean; onReveal: () => void }) {
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
  const askBox = (
    <>
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
    </>
  )
  if (Array.isArray(seg.head.props.chain)) {
    return (
      <div className="teach-pano">
        <div className="teach-pano-ask">{askBox}</div>
        <Panorama seg={seg} segs={segs} all={all} shown={open} />
      </div>
    )
  }
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
        {askBox}
        {open && outputs.map((b, i) => boxed(b, `o${i}`))}
        {open && visuals.slice(1).map((b, i) => boxed(b, `v${i + 1}`))}
      </div>
    </div>
  )
}

/** The teacher's pen: freehand marks over the page, wiped when the page turns. */
function PenLayer({ strokes, setStrokes }: { strokes: number[][][]; setStrokes: (f: (s: number[][][]) => number[][][]) => void }) {
  const ref = useRef<SVGSVGElement>(null)
  const drawing = useRef(false)
  // The stage is scaled with CSS zoom; map the pointer back to stage pixels.
  const at = (e: React.PointerEvent) => {
    const el = ref.current!
    const r = el.getBoundingClientRect()
    return [((e.clientX - r.left) * el.clientWidth) / r.width, ((e.clientY - r.top) * el.clientHeight) / r.height]
  }
  return (
    <svg
      ref={ref}
      className="teach-pen"
      onPointerDown={(e) => {
        drawing.current = true
        ;(e.target as Element).setPointerCapture(e.pointerId)
        const pt = at(e)
        setStrokes((s) => [...s, [pt]])
      }}
      onPointerMove={(e) => {
        if (!drawing.current) return
        const pt = at(e)
        setStrokes((s) => [...s.slice(0, -1), [...s[s.length - 1], pt]])
      }}
      onPointerUp={() => (drawing.current = false)}
    >
      {strokes.map((st, i) => (
        <polyline key={i} points={st.map((p) => p.join(',')).join(' ')} />
      ))}
    </svg>
  )
}

function TeachCover({ problem, segs, onGo }: { problem: string | null; segs: Seg[]; onGo: (i: number) => void }) {
  return (
    <div className="teach-cover">
      {problem && (
        <div className="teach-problem">
          <Rich html text={problem} />
        </div>
      )}
      <ol className="teach-agenda">
        {segs.map((s, i) => (
          <li key={i}>
            <button onClick={() => onGo(i + 1)}>
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
  )
}

/** One linked quantity: whichever copy the teacher moves, the others follow. */
function LinkAll({ names }: { names: string[] }) {
  const store = useStore()
  const scope = useScopeFor(names)
  const prev = useRef<Record<string, number>>({})
  useEffect(() => {
    const changed = names.find((n) => prev.current[n] !== undefined && prev.current[n] !== scope[n])
    prev.current = Object.fromEntries(names.map((n) => [n, scope[n]]))
    if (changed === undefined) return
    const v = scope[changed]
    const patch = Object.fromEntries(names.filter((n) => n !== changed && scope[n] !== v).map((n) => [n, v]))
    if (Object.keys(patch).length) store.set(patch)
  })
  return null
}

// Canvas layout: every station is a class-mode page at its native size, laid along the chain.
const ST_W = 1280
const ST_H = 668
const ST_HEAD = 96
const ST_GAP = 320
const ROW_GAP = 240
const PEN_PAD = 4000

type Cam = { x: number; y: number; s: number }

/**
 * Class mode on one board: the problem, each segment and the solution sit side by side along the
 * chain, joined by arrows that carry the relation from one to the next. "Next" flies the camera to
 * the next station; O pulls back to the whole board, where every figure is still live. Pen marks
 * stay on the board where they were written.
 */
function CanvasView(props: { blocks: Block[]; title: string; problem: string | null; theme: ThemeName; setTheme: (t: ThemeName) => void; onExit: () => void; onPages: () => void }) {
  const { blocks, title, problem, theme, setTheme, onExit, onPages } = props
  const { intro, segs } = useMemo(() => splitSegments(blocks), [blocks])
  // The panorama segment is the board itself here: its links tie every station together and its
  // steps label the arrows between the stations it chains.
  const chainSeg = segs.find((s) => Array.isArray(s.head.props.chain))
  const chain = chainSeg ? (chainSeg.head.props.chain as unknown[]).map(Number) : []
  const steps = chainSeg && Array.isArray(chainSeg.head.props.steps) ? (chainSeg.head.props.steps as unknown[]).map((x) => str(x)) : []
  const link = chainSeg && Array.isArray(chainSeg.head.props.link) ? (chainSeg.head.props.link as unknown[]).filter((n): n is string => typeof n === 'string') : []
  // Stations: 0 is the problem, then every segment except the panorama, by number.
  const stations = useMemo(() => [0, ...segs.map((_, i) => i + 1).filter((n) => !Array.isArray(segs[n - 1].head.props.chain))], [segs])
  // Laid out like a snake, three to a row, so the whole board fits a projector at a readable size.
  const cols = stations.length > 4 ? 3 : stations.length
  const rows = Math.ceil(stations.length / cols)
  const pos = (i: number) => {
    const r = Math.floor(i / cols)
    const c = r % 2 ? cols - 1 - (i % cols) : i % cols
    return { x: c * (ST_W + ST_GAP), y: r * (ST_H + ST_HEAD + ROW_GAP) }
  }
  const worldW = cols * (ST_W + ST_GAP) - ST_GAP
  const worldH = rows * (ST_H + ST_HEAD + ROW_GAP) - ROW_GAP
  // The arrow from station k to k + 1: sideways within a row, straight down between rows.
  const link2 = (k: number) => {
    const a = pos(k)
    const b = pos(k + 1)
    const midA = a.y + ST_HEAD + ST_H / 2
    const midB = b.y + ST_HEAD + ST_H / 2
    if (a.y === b.y) {
      const dir = b.x > a.x ? 1 : -1
      const x1 = dir > 0 ? a.x + ST_W + 24 : a.x - 24
      const x2 = dir > 0 ? b.x - 24 : b.x + ST_W + 24
      return {
        d: `M${x1},${midA} C${x1 + dir * 140},${midA} ${x2 - dir * 140},${midB} ${x2},${midB}`,
        head: `M${x2 - dir * 18},${midB - 12} L${x2},${midB} L${x2 - dir * 18},${midB + 12}`,
        label: { left: Math.min(x1, x2), top: midA - 110, width: Math.abs(x2 - x1) },
      }
    }
    const x = a.x + ST_W / 2
    const y1 = a.y + ST_HEAD + ST_H + 24
    const y2 = b.y + 12
    return {
      d: `M${x},${y1} L${x},${y2}`,
      head: `M${x - 12},${y2 - 18} L${x},${y2} L${x + 12},${y2 - 18}`,
      label: { left: x + 32, top: (y1 + y2) / 2 - 26, width: ST_W / 2 },
    }
  }

  const viewRef = useRef<HTMLDivElement>(null)
  const panRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const cam = useRef<Cam>({ x: 0, y: 0, s: 0.3 })
  const anim = useRef(0)
  const settle = useRef(0)
  const [at, setAt] = useState(0)
  const [overview, setOverview] = useState(true)
  const [shown, setShown] = useState<Record<number, boolean>>({})
  const [notes, setNotes] = useState(false)
  const [pen, setPen] = useState(false)

  // At rest the board is laid out with CSS zoom, so figures redraw crisply at the new size; while
  // the camera moves it is scaled with a transform, which is cheap to change every frame.
  const apply = (moving: boolean) => {
    const pan = panRef.current
    const world = worldRef.current
    if (!pan || !world) return
    const { x, y, s } = cam.current
    pan.style.transform = `translate(${x}px, ${y}px)`
    if (moving) {
      world.style.zoom = '1'
      world.style.transform = `scale(${s})`
    } else {
      world.style.transform = 'none'
      world.style.zoom = String(s)
    }
  }
  const restSoon = () => {
    clearTimeout(settle.current)
    settle.current = window.setTimeout(() => apply(false), 160)
  }
  const fit = (bx: number, by: number, bw: number, bh: number, pad = 0.94): Cam => {
    const v = viewRef.current!
    const s = Math.min((v.clientWidth / bw) * pad, (v.clientHeight / bh) * pad)
    return { s, x: v.clientWidth / 2 - (bx + bw / 2) * s, y: v.clientHeight / 2 - (by + bh / 2) * s }
  }
  const fly = (to: Cam, ms = 700) => {
    cancelAnimationFrame(anim.current)
    clearTimeout(settle.current)
    const from = { ...cam.current }
    const t0 = performance.now()
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    const dur = reducedMotion() ? 1 : ms
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur)
      const k = ease(t)
      // Interpolate scale geometrically so zooming feels even.
      const s = from.s * Math.pow(to.s / from.s, k)
      cam.current = { s, x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k }
      apply(t < 1)
      if (t < 1) anim.current = requestAnimationFrame(step)
    }
    anim.current = requestAnimationFrame(step)
  }
  const flyTo = (i: number) => {
    const k = Math.max(0, Math.min(stations.length - 1, i))
    const p = pos(k)
    setAt(k)
    setOverview(false)
    fly(fit(p.x, p.y, ST_W, ST_H + ST_HEAD, 0.98))
  }
  const flyAll = () => {
    setOverview(true)
    fly(fit(-60, -60, worldW + 120, worldH + 120))
  }

  useEffect(() => {
    const c = fit(-60, -60, worldW + 120, worldH + 120)
    cam.current = c
    apply(false)
    const onResize = () => (overview ? flyAll() : flyTo(at))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const segOf = (k: number) => (stations[k] > 0 ? segs[stations[k] - 1] : null)
  const cur = segOf(at)
  const hasReveal = !!cur && str(cur.head.props.reveal) !== '' && !overview
  const next = () => {
    if (overview) return flyTo(at)
    if (hasReveal && !shown[at]) return setShown({ ...shown, [at]: true })
    if (at < stations.length - 1) flyTo(at + 1)
  }
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
      else if (k === 'ArrowLeft' || k === 'PageUp') flyTo(overview ? at : at - 1)
      else if (k === 'o' || k === 'O') (overview ? flyTo(at) : flyAll())
      else if (k === 'n' || k === 'N') setNotes((v) => !v)
      else if (k === 'f' || k === 'F') fullscreen()
      else if (k === 'p' || k === 'P') setPen((v) => !v)
      else if (k === 'Escape' && pen) setPen(false)
      else if (k === 'Escape' && !document.fullscreenElement) onExit()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Wheel zooms about the pointer; a sideways swipe pans.
  useEffect(() => {
    const v = viewRef.current
    if (!v) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      cancelAnimationFrame(anim.current)
      const r = v.getBoundingClientRect()
      const px = e.clientX - r.left
      const py = e.clientY - r.top
      const c = cam.current
      if (!e.ctrlKey && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        cam.current = { ...c, x: c.x - e.deltaX }
      } else {
        const s = Math.max(0.08, Math.min(3, c.s * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015))))
        cam.current = { s, x: px - ((px - c.x) * s) / c.s, y: py - ((py - c.y) * s) / c.s }
      }
      setOverview(false)
      apply(true)
      restSoon()
    }
    v.addEventListener('wheel', onWheel, { passive: false })
    return () => v.removeEventListener('wheel', onWheel)
  })

  // Dragging empty board pans.
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null)
  const onDown = (e: React.PointerEvent) => {
    if (pen || !(e.target as HTMLElement).closest('[data-pan]')) return
    if ((e.target as HTMLElement).closest('[data-nopan]')) return
    cancelAnimationFrame(anim.current)
    drag.current = { x: e.clientX, y: e.clientY, cx: cam.current.x, cy: cam.current.y }
    viewRef.current?.setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    cam.current = { ...cam.current, x: d.cx + e.clientX - d.x, y: d.cy + e.clientY - d.y }
    apply(true)
  }
  const onUp = () => {
    if (!drag.current) return
    drag.current = null
    setOverview(false)
    apply(false)
  }

  const arrowLabel = (k: number) => {
    // Between two chained stations, the relation that carries one into the next.
    const a = stations[k]
    const b = stations[k + 1]
    const ia = chain.indexOf(a)
    return ia >= 0 && chain[ia + 1] === b ? steps[ia] ?? '' : ''
  }

  return (
    <div className="teach canvas-mode">
      {link.length > 1 && <LinkAll names={link} />}
      <div className="teach-bar canvas-bar">
        <span className="teach-title">{title}</span>
        <ol className="teach-pages">
          {stations.map((n, k) => (
            <li key={k}>
              <button className={k === at && !overview ? 'active' : ''} onClick={() => flyTo(k)}>
                {n > 0 && <span className="seg-num">{n}</span>}
                {k === at && !overview ? (n > 0 ? str(segs[n - 1].head.props.title) : '题目') : n === 0 ? '题目' : ''}
              </button>
            </li>
          ))}
        </ol>
        <div className="teach-actions">
          <button className={`pill ${overview ? 'active' : ''}`} onClick={() => (overview ? flyTo(at) : flyAll())} title="O">
            全览
          </button>
          <button className={`pill ${notes ? 'active' : ''}`} aria-pressed={notes} onClick={() => setNotes(!notes)} title="N">
            讲稿
          </button>
          <button className={`pill ${pen ? 'active' : ''}`} aria-pressed={pen} onClick={() => setPen(!pen)} title="P">
            画笔
          </button>
          <button className={`pill ${theme === 'night' ? 'active' : ''}`} aria-pressed={theme === 'night'} onClick={() => setTheme(theme === 'night' ? 'light' : 'night')}>
            {moonIcon}
          </button>
          <button className="pill" onClick={fullscreen} title="F">
            全屏
          </button>
          <button className="pill teach-next" onClick={next} aria-label="下一步">
            →
          </button>
          <button className="pill" onClick={onPages} title="一页一段">
            翻页
          </button>
          <button className="pill" onClick={onExit} title="Esc">
            退出
          </button>
        </div>
      </div>
      <div className={`canvas-view ${pen ? 'pen-on' : ''}`} ref={viewRef} data-pan onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}>
        <div className="canvas-pan" ref={panRef}>
          <div className="canvas-world" ref={worldRef} style={{ width: worldW, height: worldH }} data-pan>
            <svg className="canvas-links" width={worldW} height={worldH} aria-hidden>
              {stations.slice(0, -1).map((_, k) => {
                const l = link2(k)
                return (
                  <g key={k}>
                    <path d={l.d} className="canvas-link" />
                    <path d={l.head} className="canvas-link" />
                  </g>
                )
              })}
            </svg>
            {stations.slice(0, -1).map((_, k) => {
              const label = arrowLabel(k)
              if (!label) return null
              const l = link2(k)
              return (
                <div key={k} className="canvas-link-label" style={l.label}>
                  <span>
                    <Rich html text={label} />
                  </span>
                </div>
              )
            })}
            {stations.map((n, k) => {
              const p = pos(k)
              const seg = segOf(k)
              return (
                <section key={k} className={`canvas-station ${k === at && !overview ? 'current' : ''}`} style={{ left: p.x, top: p.y, width: ST_W }}>
                  <button className="canvas-station-head" onClick={() => flyTo(k)}>
                    {n > 0 && <span className="canvas-station-num">{n}</span>}
                    {n > 0 ? str(segs[n - 1].head.props.title) : '题目'}
                  </button>
                  <div className="canvas-station-body" style={{ height: ST_H }} data-nopan>
                    {seg ? (
                      <TeachPage seg={seg} segs={segs} all={blocks} shown={!!shown[k]} onReveal={() => setShown((v) => ({ ...v, [k]: true }))} />
                    ) : (
                      <TeachCover problem={problem} segs={segs} onGo={(i) => (stations.includes(i) ? flyTo(stations.indexOf(i)) : flyAll())} />
                    )}
                  </div>
                </section>
              )
            })}
            <BoardPen on={pen} w={worldW} h={worldH} />
          </div>
        </div>
      </div>
      {notes && (
        <div className="canvas-notes">
          <TeachNotes seg={cur} intro={intro} />
        </div>
      )}
    </div>
  )
}

/** Pen marks in board coordinates: they stay where they were written and scale with the board. */
function BoardPen({ on, w, h }: { on: boolean; w: number; h: number }) {
  const ref = useRef<SVGSVGElement>(null)
  const [strokes, setStrokes] = useState<number[][][]>([])
  const drawing = useRef(false)
  const at = (e: React.PointerEvent) => {
    const el = ref.current!
    const r = el.getBoundingClientRect()
    return [((e.clientX - r.left) * el.clientWidth) / r.width - PEN_PAD, ((e.clientY - r.top) * el.clientHeight) / r.height - PEN_PAD]
  }
  return (
    <svg
      ref={ref}
      className={`canvas-pen ${on ? 'on' : ''}`}
      style={{ left: -PEN_PAD, top: -PEN_PAD, width: w + 2 * PEN_PAD, height: h + 2 * PEN_PAD }}
      viewBox={`${-PEN_PAD} ${-PEN_PAD} ${w + 2 * PEN_PAD} ${h + 2 * PEN_PAD}`}
      onPointerDown={(e) => {
        if (!on) return
        e.stopPropagation()
        drawing.current = true
        ;(e.target as Element).setPointerCapture(e.pointerId)
        const pt = at(e)
        setStrokes((s) => [...s, [pt]])
      }}
      onPointerMove={(e) => {
        if (!drawing.current) return
        const pt = at(e)
        setStrokes((s) => [...s.slice(0, -1), [...s[s.length - 1], pt]])
      }}
      onPointerUp={() => (drawing.current = false)}
      onDoubleClick={() => on && setStrokes([])}
    >
      {strokes.map((st, i) => (
        <polyline key={i} points={st.map((p) => p.join(',')).join(' ')} />
      ))}
    </svg>
  )
}

/**
 * Class mode for a segmented lesson: a cover page with the problem, then one segment per screen
 * with the figure large and one question for the class. The explanation is in notes only the
 * teacher opens. A clicker's "next" first reveals the answer to the question, then turns the page.
 */
function TeachView(props: { blocks: Block[]; title: string; problem: string | null; theme: ThemeName; setTheme: (t: ThemeName) => void; onExit: () => void; onCanvas: () => void }) {
  const { blocks, title, problem, theme, setTheme, onExit, onCanvas } = props
  const { intro, segs } = useMemo(() => splitSegments(blocks), [blocks])
  const scale = useStageScale()
  const [at, setAt] = useState(0)
  const [shown, setShown] = useState(false)
  const [notes, setNotes] = useState(false)
  const [pen, setPen] = useState(false)
  const [strokes, setStrokes] = useState<number[][][]>([])
  const seg = at > 0 ? segs[at - 1] : null
  const hasReveal = !!seg && str(seg.head.props.reveal) !== ''
  const go = (i: number) => {
    setAt(Math.max(0, Math.min(segs.length, i)))
    setShown(false)
    setStrokes([])
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
      else if (k === 'p' || k === 'P') setPen((v) => !v)
      else if (k === 'c' || k === 'C') setStrokes([])
      else if (k === 'Escape' && pen) setPen(false)
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
            <button className={`pill ${pen ? 'active' : ''}`} aria-pressed={pen} onClick={() => setPen(!pen)} title="P">
              画笔
            </button>
            {strokes.length > 0 && (
              <button className="pill" onClick={() => setStrokes([])} title="C">
                擦除
              </button>
            )}
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
            <button className="pill" onClick={onCanvas} title="整道题铺在一张画布上">
              画布
            </button>
            <button className="pill" onClick={onExit} title="Esc">
              退出
            </button>
          </div>
        </div>
        <div className="teach-body">
          {seg ? (
            // key: each page starts its figures from their own initial state
            <TeachPage key={at} seg={seg} segs={segs} all={blocks} shown={shown} onReveal={() => setShown(true)} />
          ) : (
            <TeachCover problem={problem} segs={segs} onGo={go} />
          )}
          {(pen || strokes.length > 0) && (
            <div className={`teach-pen-wrap ${pen ? 'on' : ''}`}>
              <PenLayer strokes={strokes} setStrokes={setStrokes} />
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
  const [teach, setTeach] = useState<'' | 'pages' | 'canvas'>('')
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
        {teach === 'pages' && (
          <TeachView
            blocks={lesson.blocks}
            title={typeof meta.title === 'string' ? meta.title : ''}
            problem={problemText}
            theme={theme}
            setTheme={setTheme}
            onExit={() => setTeach('')}
            onCanvas={() => setTeach('canvas')}
          />
        )}
        {teach === 'canvas' && (
          <CanvasView
            blocks={lesson.blocks}
            title={typeof meta.title === 'string' ? meta.title : ''}
            problem={problemText}
            theme={theme}
            setTheme={setTheme}
            onExit={() => setTeach('')}
            onPages={() => setTeach('pages')}
          />
        )}
        <article className={`lesson theme-${theme}`} hidden={!!teach}>
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
                    <button className="pill" onClick={() => setTeach('canvas')} title="投影到教室屏幕：整道题铺在一张画布上，讲解收进讲稿">
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
