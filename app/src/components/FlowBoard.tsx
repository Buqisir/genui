import {
  Background,
  BackgroundVariant,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  useViewport,
  ViewportPortal,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/base.css'
import { getStroke } from 'perfect-freehand'
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type ReactNode } from 'react'
import type { Block } from '../lesson/parse'
import { useScope, useScopeFor, useStore, namesIn } from '../lesson/store'
import type { ThemeName } from '../theme'
import { boxed, LinkAll, MAIN, Markdown, moonIcon, Quote, splitSegments, str, TeachNotes, type Seg } from './LessonView'
import { formatValue, Sym, Value } from './controls'
import { Rich } from './rich'

type ComponentBlock = Extract<Block, { kind: 'component' }>

// Node contents are laid out at class-mode size and enlarged with CSS zoom, so a station fills a
// projector at about 1:1 and figures stay crisp; the overview only ever scales them down.
const Z = 1.5

/** Below this zoom the board is read from across the room: nodes switch to their far rendering. */
const FAR_ZOOM = 0.4

/**
 * Growing: a station's new pieces stay marked for this long after it grows. The longest stagger is a
 * side node's last item (about 900ms + 250ms a step); the marks must outlast it or the rest would jump.
 */
const GROW_MS = 3200

/** The camera's flight between stations, and the easing it uses. */
const FLY_MS = 1100
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const reduceMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const flyOpts = () => ({ duration: reduceMotion() ? 0 : FLY_MS, padding: 0.04, interpolate: 'smooth' as const, ease: easeInOutCubic })

/**
 * A piece that comes in during growth, one step after the one before it (`i`, in 250ms steps). Only a
 * growing station's pieces get the step; a piece that appears later, on a reveal, comes in at once.
 */
const rise = (on: boolean, i: number, cls = '') => ({
  className: [cls, on ? 'fb-rise fb-seq' : ''].filter(Boolean).join(' ') || undefined,
  style: on ? ({ '--fb-i': i } as CSSProperties) : undefined,
})

/**
 * A solution's reading units: each top-level block is one, except that a list gives one unit per item
 * (a nested list goes with its parent item).
 */
const unitsOf = (el: HTMLElement) =>
  Array.from(el.children).flatMap((c) => (c.tagName === 'UL' || c.tagName === 'OL' ? Array.from(c.children) : [c])) as HTMLElement[]

/** A Readout's item, as controls.tsx formats it. */
type ReadoutItem = { label: string; expr: string; unit?: string; digits?: number; symbol?: string; color?: string; format?: string }

/** The variant on the board: which one, and the values the board held before it was applied. */
type Active = { id: string; label: string; before: Record<string, number> }

type Board = {
  segs: Seg[]
  shown: Record<number, boolean>
  reveal: (k: number) => void
  problem: string | null
  blocks: Block[]
  active: Active | null
  apply: (id: string, v: VariantData) => void
  restore: () => void
  /** The quantities a variant card compares: the panorama's readouts, or the first few in the lesson. */
  compare: ReadoutItem[]
  /** Far mode: the one quantity each segment station shows as its big number (keyed by segment number). */
  quantity: Record<number, ReadoutItem | null>
  /** The sentences of the current segment's quote, to highlight in the problem (none on the problem or the 如果 station). */
  marks: string[]
  /** Growing: on, and how many reading units of each station's solution are shown (station -> count). */
  grow: boolean
  parts: Record<number, number>
  /** A solution node reports how many reading units its text has (station, count). */
  reportParts: (k: number, n: number) => void
}
const BoardContext = createContext<Board | null>(null)
const useBoard = () => useContext(BoardContext)!

/** Two readings differ when they are not equal to within a part in a billion; NaN only matches NaN. */
const differs = (a: number, b: number) =>
  Number.isFinite(a) && Number.isFinite(b) ? Math.abs(a - b) > 1e-9 * Math.max(Math.abs(a), Math.abs(b)) : a !== b && !(Number.isNaN(a) && Number.isNaN(b))

/** Viewport zoom. Nodes re-render as it changes; far-mode components are kept light for that. */
const useZoom = () => useViewport().zoom
const useFar = () => useZoom() < FAR_ZOOM

/** Screen px to board px inside a Zoomed node (its CSS zoom is Z, the viewport's is `zoom`). */
// Far sizes are set for a 1920×1080 screen and shrink with smaller ones, since the board's zoom shrinks with them.
const screenScale = () => Math.min(1, window.innerWidth / 1920, window.innerHeight / 1080)
const inZoomed = (zoom: number, px: number) => (px * screenScale()) / (zoom * Z)

/** The panorama's first Readout items: what the chain's big numbers are taken from. */
const firstReadoutItems = (bs: Block[]): ReadoutItem[] => {
  const r = bs.find((b): b is ComponentBlock => b.kind === 'component' && b.name === 'Readout')
  return r && Array.isArray(r.props.items) ? (r.props.items as unknown[]).filter(isReadoutItem) : []
}

/**
 * The quantity a station's big number shows. A station on the panorama's chain takes its place
 * in the panorama's readout when that readout lists one item per chain step; otherwise the
 * station's own first readout's first item.
 */
function quantityFor(seg: Seg, n: number, chain: number[], pano: ReadoutItem[]): ReadoutItem | null {
  const i = chain.indexOf(n)
  if (pano.length === chain.length && i >= 0) return pano[i] ?? null
  return firstReadoutItems(seg.blocks)[0] ?? null
}

/** The problem's first sentence, through its 。 (or the whole text when it has none). */
const firstSentence = (text: string) => {
  const i = text.indexOf('。')
  return i >= 0 ? text.slice(0, i + 1) : text
}

/**
 * The sentences a segment's quote takes from the problem: the 加粗 marks go, the 「……」 breaks split,
 * and a piece under 4 characters is too short to find again, so it is dropped.
 */
const quotePieces = (quote: string): string[] =>
  quote
    .replace(/\*/g, '')
    .split(/……|…/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 4)

/** Letters and digits only: the quote and the rendered problem differ in spacing, punctuation and the subscript underscore (I_0 is I₀). */
const keyOf = (s: string) => s.replace(/[^\p{L}\p{N}]/gu, '')

type Highlights = { set(name: string, h: unknown): void; delete(name: string): void }
/** The CSS Custom Highlight API, where the browser has it; nothing is drawn where it does not. */
const highlights = (): Highlights | null => (typeof CSS !== 'undefined' && 'highlights' in CSS ? (CSS as unknown as { highlights: Highlights }).highlights : null)
const HighlightCtor = (globalThis as unknown as { Highlight?: new (...r: Range[]) => unknown }).Highlight

/**
 * The ranges in `root`'s text (KaTeX left out) that spell each piece. The text is joined without spacing
 * and punctuation, and each kept character remembers its text node, so a piece may cross nodes. A piece
 * that is not there is skipped.
 */
function quoteRanges(root: HTMLElement, pieces: string[]): Range[] {
  const chars: string[] = []
  const where: [Text, number][] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement?.closest('.katex') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  })
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n as Text
    for (let i = 0; i < t.data.length; i++) {
      if (/[\p{L}\p{N}]/u.test(t.data[i])) {
        chars.push(t.data[i])
        where.push([t, i])
      }
    }
  }
  const all = chars.join('')
  const ranges: Range[] = []
  for (const piece of pieces) {
    const key = keyOf(piece)
    const at = key ? all.indexOf(key) : -1
    if (at < 0) continue
    const [sn, so] = where[at]
    const [en, eo] = where[at + key.length - 1]
    const r = document.createRange()
    r.setStart(sn, so)
    r.setEnd(en, eo + 1)
    ranges.push(r)
  }
  return ranges
}

const handles = (
  <>
    <Handle type="target" position={Position.Left} id="l" className="fb-handle" />
    <Handle type="target" position={Position.Top} id="t" className="fb-handle" />
    <Handle type="target" position={Position.Right} id="rt" className="fb-handle" />
    <Handle type="source" position={Position.Right} id="r" className="fb-handle" />
    <Handle type="source" position={Position.Bottom} id="b" className="fb-handle" />
    <Handle type="source" position={Position.Left} id="ls" className="fb-handle" />
  </>
)

function Zoomed({ width, children, className = '' }: { width: number; children: ReactNode; className?: string }) {
  return (
    <div className={`fb-zoom ${className}`} style={{ zoom: Z, width }}>
      {children}
    </div>
  )
}

type Data = { k: number; n: number }

function TitleNode({ data }: NodeProps<Node<Data>>) {
  const { segs, active } = useBoard()
  // Not in a Zoomed node: board px are screen px divided by zoom. Never smaller than at full size.
  const zoom = useZoom()
  const px = Math.max(72, (30 * screenScale()) / zoom)
  return (
    <div className="fb-title" style={{ fontSize: px }}>
      <Handle type="target" position={Position.Top} id="t" className="fb-handle" />
      {data.n > 0 && (
        <span className="fb-title-num" style={{ width: (px * 96) / 72, height: (px * 96) / 72, fontSize: (px * 48) / 72 }}>
          {data.n}
        </span>
      )}
      {data.n > 0 ? str(segs[data.n - 1].head.props.title) : data.n < 0 ? '如果……' : '题目'}
      {/* A segment's title states the original problem's result. */}
      {active && data.n > 0 && <span className="fb-title-orig" style={{ fontSize: Math.max(30, (16 * screenScale()) / zoom) }}>原题</span>}
    </div>
  )
}

/** Far: at 30 screen px, the sentences the current segment quotes, else the first sentence. */
function ProblemNode() {
  const { problem, grow, marks } = useBoard()
  const zoom = useZoom()
  const far = zoom < FAR_ZOOM
  const body = useRef<HTMLDivElement>(null)
  // The sentences the current segment took from the problem are highlighted in it, after the text is drawn.
  useLayoutEffect(() => {
    const reg = highlights()
    const el = body.current
    if (!reg || !el || !HighlightCtor || marks.length === 0) return
    const ranges = quoteRanges(el, marks)
    if (ranges.length > 0) reg.set('fb-quote', new HighlightCtor(...ranges))
    return () => reg.delete('fb-quote')
  }, [marks, far, problem])
  return (
    <Zoomed width={900} className="fb-problem">
      {handles}
      {problem &&
        (far ? (
          <div className="fb-far-problem" style={{ fontSize: inZoomed(zoom, 30) }}>
            {/* From across the room the problem shows what the current segment quotes from it, else its first sentence. */}
            {marks.length > 0 ? (
              <span className="fb-far-quote">
                <Rich html text={marks.join('……')} />
              </span>
            ) : (
              <Rich html text={firstSentence(problem)} />
            )}
          </div>
        ) : (
          // The question rises once, as the canvas opens.
          <div ref={body} className={grow ? 'fb-rise' : undefined}>
            <Rich html text={problem} />
          </div>
        ))}
    </Zoomed>
  )
}

/** The segment's main figure with its sliders and presets right under it. Far: the figure alone. */
function VisualNode({ data }: NodeProps<Node<Data>>) {
  const { segs } = useBoard()
  const far = useFar()
  const seg = segs[data.n - 1]
  const comps = seg.blocks.filter((b): b is ComponentBlock => b.kind === 'component')
  const visual = comps.find((b) => MAIN.has(b.name))
  const inputs = comps.filter((b) => (b.name === 'Param' && !b.props.hidden) || b.name === 'Preset')
  return (
    <Zoomed width={760}>
      {handles}
      {visual && boxed(visual, 'v')}
      {!far && inputs.length > 0 && <div className="fb-inputs nodrag nowheel">{inputs.map((b, i) => boxed(b, `c${i}`))}</div>}
    </Zoomed>
  )
}

/** Says which variant the board is showing; the station's own words are put away under it. */
function VariantBanner({ line }: { line: string }) {
  const { active } = useBoard()
  if (!active) return null
  return (
    <div className="fb-variant-banner">
      <div className="fb-variant-line">
        <span className="fb-variant-pill">如果</span>
        <b>{active.label}</b>
      </div>
      <div>{line}</div>
    </div>
  )
}

/** The far rendering's text: symbol and label small, the value big, optionally 原题 → 如果 and the pill. Sizes are screen px. */
function FarText({ item, now, was, pill }: { item: ReadoutItem; now: number; was?: number; pill?: string }) {
  const k = screenScale() / (useZoom() * Z)
  const u = item.format === 'percent' ? '%' : item.unit
  const changed = was !== undefined && differs(was, now)
  const fmt = (v: number) => formatValue(v, item.digits, item.format)
  // `changed` cannot narrow `was` for the compiler, so the original is tested on its own.
  return (
    <div className="fb-far">
      {pill !== undefined && (
        <div className="fb-far-pill" style={{ fontSize: 18 * k }}>
          如果：{pill}
        </div>
      )}
      <div className="fb-far-label" style={{ fontSize: 22 * k }}>
        <Sym text={item.symbol} color={item.color} />
        <Rich text={item.label} html />
      </div>
      {/* Under a variant the original sits on its own small line, so the new value keeps the big size and fits. */}
      {changed && was !== undefined && (
        <div className="fb-far-was" style={{ fontSize: 26 * k }}>
          原题 {fmt(was)}
          {u && (
            <>
              {' '}
              <Rich text={u} html />
            </>
          )}{' '}
          <span className="fb-far-arrow">→</span>
        </div>
      )}
      <div className="fb-far-value" style={{ fontSize: 64 * k }}>
        <span className={changed ? 'fb-far-num fb-far-new' : 'fb-far-num'}>{fmt(now)}</span>
        {u && (
          <span className="fb-far-unit" style={{ fontSize: 24 * k }}>
            <Rich text={u} html />
          </span>
        )}
      </div>
    </div>
  )
}

/** Without a variant: the live reading only. */
function FarNumber({ item }: { item: ReadoutItem }) {
  const store = useStore()
  const scope = useScopeFor(namesIn([item.expr]))
  return <FarText item={item} now={store.reading(item.expr, scope)} />
}

/** With a variant applied: the original problem's reading against the variant's, with the pill. */
function FarVaried({ item, active }: { item: ReadoutItem; active: Active }) {
  const store = useStore()
  const scope = useScope()
  // The original is the live board with the variant's own values put back; it moves with the board.
  const origin = useMemo(() => store.scopeWith(active.before), [store, active, scope])
  return <FarText item={item} now={store.reading(item.expr, scope)} was={store.reading(item.expr, origin)} pill={active.label} />
}

/** Far mode: the station's one big number, nothing else. */
function FarStation({ item, active }: { item: ReadoutItem | null; active: Active | null }) {
  if (!item) return null
  return active ? <FarVaried item={item} active={active} /> : <FarNumber item={item} />
}

/** Quote, the question to the class, and what comes with the answer. While a variant is applied, the readouts and charts show its numbers and the original words are put away. Far: one big number. */
function SideNode({ data }: NodeProps<Node<Data>>) {
  const { segs, shown, reveal, active, quantity, grow } = useBoard()
  const store = useStore()
  const far = useFar()
  const seg = segs[data.n - 1]
  const comps = seg.blocks.filter((b): b is ComponentBlock => b.kind === 'component')
  const visuals = comps.filter((b) => MAIN.has(b.name))
  const outputs = comps.filter((b) => b.name === 'Readout' || b.name === 'Status')
  const quote = str(seg.head.props.quote)
  const ask = str(seg.head.props.ask)
  const answer = str(seg.head.props.reveal)
  const revealParam = str(seg.head.props.revealParam)
  const isShown = !!shown[data.k]
  const varied = !!active
  // Under a variant the figure shows everything it computes, answer included.
  const open = !answer || isShown || varied
  useEffect(() => {
    if (revealParam) store.set({ [revealParam]: open ? 1 : 0 })
  }, [store, revealParam, open])
  useEffect(() => (revealParam ? () => store.set({ [revealParam]: 1 }) : undefined), [store, revealParam])
  if (far)
    return (
      <Zoomed width={560} className="fb-side">
        {handles}
        <FarStation item={quantity[data.n] ?? null} active={active} />
      </Zoomed>
    )
  // Growing: the quote, the question, the reveal button, then the readouts and charts come in one by one (the step numbers below).
  return (
    <Zoomed width={560} className="fb-side">
      {handles}
      {varied && <VariantBanner line="这一站已按变式重新计算。原题的提问和讲解先收起。" />}
      {!varied && quote && !(isShown && (outputs.length > 0 || visuals.length > 1)) && (
        <div {...rise(grow, 0)}>
          <Quote text={quote} />
        </div>
      )}
      {!varied && ask && (
        <div {...rise(grow, 1, 'teach-ask')}>
          <span className="teach-tag">问</span>
          <Rich html text={ask} />
        </div>
      )}
      {!varied &&
        answer &&
        (isShown ? (
          <div className={grow ? 'teach-reveal fb-rise' : 'teach-reveal'}>
            <Rich html text={answer} />
          </div>
        ) : (
          <button {...rise(grow, 2, 'teach-reveal-btn nodrag')} onClick={() => reveal(data.k)}>
            揭晓 <kbd>空格</kbd>
          </button>
        ))}
      {(open || varied) && outputs.length > 0 && (
        <div className="fb-outputs nodrag">
          {outputs.map((b, i) => (
            <div key={i} {...rise(grow, 3 + i)}>
              {boxed(b, `o${i}`)}
            </div>
          ))}
        </div>
      )}
      {(open || varied) &&
        visuals.slice(1).map((b, i) => (
          <div key={i} {...rise(grow, 3 + outputs.length + i, 'nodrag nowheel')}>
            {boxed(b, `v${i}`)}
          </div>
        ))}
    </Zoomed>
  )
}

/** Far: no text at all; the handles stay so the chain's arrows still land on the station. */
function SolutionNode({ data }: NodeProps<Node<Data>>) {
  const { segs, active, grow, parts, reportParts } = useBoard()
  const far = useFar()
  const seg = segs[data.n - 1]
  const texts = seg.blocks.filter((b) => b.kind === 'markdown') as Extract<Block, { kind: 'markdown' }>[]
  const wrap = useRef<HTMLDivElement>(null)
  // Growing: the first `want` units show, the rest keep their height hidden. A variant or grow off shows all.
  const want = grow && !active ? (parts[data.k] ?? 1) : Infinity
  const was = useRef<number | null>(null)
  // The units are the Markdown's own elements, so they are marked here rather than in the render.
  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const units = unitsOf(el)
    reportParts(data.k, units.length)
    const before = was.current
    was.current = want
    units.forEach((u, i) => {
      u.classList.toggle('fb-part-hidden', i >= want)
      u.classList.toggle('fb-part-new', before !== null && want > before && i === want - 1)
    })
  })
  if (far)
    return (
      <Zoomed width={980} className="fb-solution solution">
        {handles}
      </Zoomed>
    )
  return (
    <Zoomed width={980} className="fb-solution solution">
      {handles}
      {active && <VariantBanner line="完整解答是原题的。" />}
      <div ref={wrap} className={active ? 'fb-muted' : undefined}>
        {texts.map((b, i) => (
          <Markdown key={i} text={b.text} />
        ))}
      </div>
    </Zoomed>
  )
}

type AnyData = Record<string, unknown>
type SliderData = { name: string }
type VariantData = { label: string; set: Record<string, number>; ask: string; reveal: string }
type MenuAt = { x: number; y: number; at: { x: number; y: number } }

/** A Variant's set={...}: only the numbers count. */
function numbers(v: unknown): Record<string, number> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {}
  return Object.fromEntries(Object.entries(v).filter((e): e is [string, number] => typeof e[1] === 'number'))
}

const isReadoutItem = (x: unknown): x is ReadoutItem => !!x && typeof x === 'object' && typeof (x as ReadoutItem).expr === 'string'

/** The × in a teacher-made node's corner. */
function DelButton({ id, onDelete }: { id: string; onDelete?: () => void }) {
  const { deleteElements } = useReactFlow()
  return (
    <button
      className="fb-del nodrag"
      aria-label="删除"
      onClick={() => {
        onDelete?.()
        void deleteElements({ nodes: [{ id }] })
      }}
    >
      ×
    </button>
  )
}

/** Uncontrolled on purpose: React never resets the text under the caret, the node's data only mirrors it for saving. */
function NoteNode({ id, data }: NodeProps) {
  const { updateNodeData } = useReactFlow()
  const zoom = useZoom()
  const text = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!text.current) return
    text.current.textContent = str(data.text)
    // Only a note the teacher just added takes the caret; a restored one stays put. React Flow keeps a
    // new node hidden until it has measured it, and a hidden element cannot take focus, so wait a beat.
    if (data.fresh === true) {
      const t = window.setTimeout(() => text.current?.focus({ preventScroll: true }), 80)
      return () => window.clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only: the text is the teacher's from here on
  }, [])
  return (
    <Zoomed width={320} className="fb-note">
      <DelButton id={id} />
      <div
        ref={text}
        className="fb-note-text nodrag nowheel"
        // From across the room a note reads like the other far text.
        style={zoom < FAR_ZOOM ? { fontSize: inZoomed(zoom, 26) } : undefined}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => updateNodeData(id, { text: e.currentTarget.innerText })}
      />
    </Zoomed>
  )
}

function SliderNode({ id, data }: NodeProps<Node<SliderData>>) {
  const { blocks } = useBoard()
  const param = blocks.find((b): b is ComponentBlock => b.kind === 'component' && b.name === 'Param' && b.props.name === data.name)
  return (
    <Zoomed width={520} className="fb-slider">
      <DelButton id={id} />
      {param && <div className="fb-inputs nodrag nowheel">{boxed(param, 'p')}</div>}
    </Zoomed>
  )
}

/**
 * A Variant: applied on the board, one at a time (the board owns which). The table sets the
 * original values against the variant's, live, for the quantities the board compares.
 */
function VariantNode({ id, data }: NodeProps<Node<VariantData>>) {
  const { active, apply, restore, compare } = useBoard()
  const store = useStore()
  const scope = useScope()
  const zoom = useZoom()
  const far = zoom < FAR_ZOOM
  const [revealed, setRevealed] = useState(false)
  const applied = active?.id === id
  // The original problem: the board's values before any variant; while this one is applied, its own.
  const origin = active ? store.scopeWith(active.before) : scope
  const variant = applied ? scope : store.scopeWith({ ...active?.before, ...data.set })
  const rows = compare.map((it) => {
    const a = store.reading(it.expr, origin)
    const b = store.reading(it.expr, variant)
    return { it, a, b, changed: differs(a, b) }
  })
  if (far) {
    // Far: the tag and label, and while applied, the first quantity it changes.
    const first = applied ? rows.find((r) => r.changed) : undefined
    return (
      <Zoomed width={560} className={`fb-variant${applied ? ' applied' : ''}`}>
        <div className="fb-variant-head">
          <span className="teach-tag" style={{ fontSize: inZoomed(zoom, 20) }}>
            如果
          </span>
          <span className="fb-variant-label" style={{ fontSize: inZoomed(zoom, 34) }}>
            {data.label}
          </span>
        </div>
        {first && (
          <div className="fb-far-row" style={{ fontSize: inZoomed(zoom, 28) }}>
            <Rich text={first.it.label} html /> {formatValue(first.a, first.it.digits, first.it.format)} → {formatValue(first.b, first.it.digits, first.it.format)}
            {first.it.unit && <> {first.it.unit}</>}
          </div>
        )}
      </Zoomed>
    )
  }
  return (
    <Zoomed width={560} className={`fb-variant${applied ? ' applied' : ''}`}>
      <DelButton id={id} onDelete={() => applied && restore()} />
      <div className="fb-variant-head">
        <span className="teach-tag">如果</span>
        <span className="fb-variant-label">{data.label}</span>
      </div>
      {data.ask && (
        <div className="fb-variant-ask">
          <Rich html text={data.ask} />
        </div>
      )}
      <div className="fb-variant-actions">
        <button className="pill nodrag" onClick={() => (applied ? restore() : apply(id, data))}>
          {applied ? '复原' : '应用'}
        </button>
        {data.reveal && !revealed && (
          <button className="pill nodrag" onClick={() => setRevealed(true)}>
            揭晓
          </button>
        )}
      </div>
      {data.reveal && revealed && (
        <div className="teach-reveal">
          <Rich html text={data.reveal} />
        </div>
      )}
      {rows.length > 0 && (
        <table className="fb-compare nodrag">
          <thead>
            <tr>
              <th>量</th>
              <th>原题</th>
              <th>如果</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ it, a, b, changed }, i) => (
              <tr key={i} className={changed ? 'changed' : undefined}>
                <th scope="row">
                  <Sym text={it.symbol} color={it.color} />
                  <Rich text={it.label} html />
                </th>
                <td>
                  <Value value={a} unit={it.unit} digits={it.digits} format={it.format} />
                </td>
                <td>
                  <Value value={b} unit={it.unit} digits={it.digits} format={it.format} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Zoomed>
  )
}

/** A chain's data: its label, and while growing, whether it is still to come (`unborn`) or being drawn (`born`, with its generation). */
type EdgeData = { label?: string; grow?: 'unborn' | 'born'; gen?: number }

/** An arrow along the chain, labelled with the relation that carries one step into the next. */
function ChainEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, data }: EdgeProps<Edge<EdgeData>>) {
  const [path, lx, ly] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, curvature: 0.35 })
  // Board px, outside any Zoomed node: 26 screen px when zoomed out, never below the full-size 52.
  const zoom = useZoom()
  const grow = data?.grow
  const gen = data?.gen ?? 0
  // The arrowhead is an SVG marker, so it cannot fade in; it is left off until the line has been drawn.
  const [armed, setArmed] = useState(0)
  useEffect(() => {
    if (grow !== 'born' || reduceMotion()) return
    const t = window.setTimeout(() => setArmed(gen), 700)
    return () => window.clearTimeout(t)
  }, [grow, gen])
  const arrow = grow !== 'born' || armed === gen || reduceMotion()
  return (
    <>
      <BaseEdge id={id} path={path} pathLength={1} markerEnd={arrow ? markerEnd : undefined} className="fb-edge" />
      {data?.label && grow !== 'unborn' && (
        <EdgeLabelRenderer>
          <div
            className={grow === 'born' ? 'fb-edge-label fb-late' : 'fb-edge-label'}
            style={{ transform: `translate(-50%, -50%) translate(${lx}px, ${ly}px)`, fontSize: Math.max(52, (26 * screenScale()) / zoom) }}
          >
            <Rich html text={data.label} />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

const nodeTypes = { title: TitleNode, problem: ProblemNode, visual: VisualNode, side: SideNode, solution: SolutionNode, note: NoteNode, slider: SliderNode, variant: VariantNode }
const edgeTypes = { chain: ChainEdge }

// Board layout, in board pixels after the zoom above.
const COL_W = 2700
const ROW_H = 1700
const VIS_W = 760 * Z
const GAP = 90

/** Far mode: the one slider that moves the whole chain, fixed over the board. Hidden at normal zoom. */
function FarOverview({ param }: { param: ComponentBlock | null }) {
  const far = useFar()
  if (!far || !param) return null
  return (
    <div className="fb-far-overview nodrag nowheel nopan" onPointerDown={(e) => e.stopPropagation()}>
      {boxed(param, 'far-lead')}
    </div>
  )
}

/** SVG path for a perfect-freehand outline. */
function strokePath(points: number[][]) {
  if (points.length < 2) return ''
  const d = points.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length]
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      return acc
    },
    ['M', ...points[0], 'Q'] as (string | number)[],
  )
  return d.join(' ') + ' Z'
}

type Stroke = { pts: number[][]; size: number }

/** The teacher's pen: strokes live in board coordinates, so they stay put and scale with the board. */
function BoardPen({ on, strokes, setStrokes }: { on: boolean; strokes: Stroke[]; setStrokes: (f: (s: Stroke[]) => Stroke[]) => void }) {
  const rf = useReactFlow()
  const { zoom } = useViewport()
  const drawing = useRef(false)
  const at = (e: React.PointerEvent) => {
    const p = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY })
    return [p.x, p.y, e.pressure || 0.5]
  }
  return (
    <>
      {on && (
        <div
          className="fb-pen-capture"
          onPointerDown={(e) => {
            drawing.current = true
            e.currentTarget.setPointerCapture(e.pointerId)
            const pt = at(e)
            setStrokes((s) => [...s, { pts: [pt], size: 7 / zoom }])
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return
            const pt = at(e)
            setStrokes((s) => [...s.slice(0, -1), { ...s[s.length - 1], pts: [...s[s.length - 1].pts, pt] }])
          }}
          onPointerUp={() => (drawing.current = false)}
        />
      )}
      <ViewportPortal>
        <svg className="fb-ink" width={1} height={1}>
          {strokes.map((s, i) => (
            <path key={i} d={strokePath(getStroke(s.pts, { size: s.size, thinning: 0.55, smoothing: 0.5, streamline: 0.45 }))} />
          ))}
        </svg>
      </ViewportPortal>
    </>
  )
}

type Point = { x: number; y: number }
type Kind = 'note' | 'slider' | 'variant'
type SavedAdded = { id: string; type: Kind; position: Point; data: AnyData }
/**
 * The teacher's own work on one lesson's board. The lesson's program is not in here: `hash` says which
 * source the positions and ink were made on, and only that source gets them back.
 */
type SavedBoard = { v: 1; hash: string; added: SavedAdded[]; moved: Record<string, Point>; strokes: Stroke[]; savedAt: number }

const LESSON_CHANGED = '课件已更新：老师加的便签和卡片已恢复，旧的摆放位置和笔迹没有恢复。'

/** The teacher's nodes are the only ones with a u<number> id; the layout's ids are t, p, v, s, x, w. */
const isAdded = (id: string) => /^u\d+$/.test(id)
const isKind = (t: unknown): t is Kind => t === 'note' || t === 'slider' || t === 'variant'
const isObject = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)

function point(p: unknown): Point | null {
  if (!isObject(p)) return null
  const { x, y } = p
  return typeof x === 'number' && typeof y === 'number' && Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null
}

const isStroke = (s: unknown): s is Stroke =>
  isObject(s) &&
  Array.isArray(s.pts) &&
  s.pts.every((p) => Array.isArray(p) && p.length >= 2 && p.every((v) => typeof v === 'number' && Number.isFinite(v))) &&
  typeof s.size === 'number' &&
  Number.isFinite(s.size)

/** A board that is not version 1 is ignored whole; single entries of the wrong shape are dropped. */
function parseBoard(raw: unknown): SavedBoard | null {
  if (!isObject(raw) || raw.v !== 1 || typeof raw.hash !== 'string' || !Array.isArray(raw.added) || !isObject(raw.moved) || !Array.isArray(raw.strokes)) return null
  const seen = new Set<string>()
  const added = raw.added.flatMap((a): SavedAdded[] => {
    if (!isObject(a) || typeof a.id !== 'string' || !isAdded(a.id) || seen.has(a.id) || !isKind(a.type)) return []
    const position = point(a.position)
    if (!position) return []
    seen.add(a.id)
    return [{ id: a.id, type: a.type, position, data: isObject(a.data) ? a.data : {} }]
  })
  const moved: Record<string, Point> = {}
  for (const [id, p] of Object.entries(raw.moved)) {
    const q = point(p)
    if (q) moved[id] = q
  }
  return {
    v: 1,
    hash: raw.hash,
    added,
    moved,
    strokes: raw.strokes.filter(isStroke),
    savedAt: typeof raw.savedAt === 'number' ? raw.savedAt : 0,
  }
}

function readBoard(key: string): SavedBoard | null {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? null : parseBoard(JSON.parse(raw))
  } catch {
    return null
  }
}

/** Nothing left to keep means no key at all. */
function writeBoard(key: string, board: SavedBoard) {
  try {
    if (board.added.length + Object.keys(board.moved).length + board.strokes.length === 0) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(board))
  } catch {
    // Storage full or blocked: the board still works, it just is not kept.
  }
}

/** What is kept of a teacher node: a note's text, a slider's quantity, a card's label (its numbers come from the lesson). */
function savedData(n: Node<AnyData>): AnyData {
  if (n.type === 'note') return { text: str(n.data.text) }
  if (n.type === 'slider') return { name: str(n.data.name) }
  return { label: str(n.data.label) }
}

/**
 * The teacher's nodes as this lesson can show them now. A slider needs its Param still in the lesson,
 * a card a Variant with the same label; a card takes the lesson's current data, not the saved copy.
 */
function reviveAdded(items: SavedAdded[], blocks: Block[], variants: VariantData[]): Node<AnyData>[] {
  return items.flatMap((a): Node<AnyData>[] => {
    if (a.type === 'slider') {
      const name = str(a.data.name)
      const ok = blocks.some((b) => b.kind === 'component' && b.name === 'Param' && b.props.name === name)
      return ok ? [{ id: a.id, type: 'slider', position: a.position, data: { name } }] : []
    }
    if (a.type === 'variant') {
      const label = str(a.data.label)
      const v = variants.find((x) => x.label === label)
      return v ? [{ id: a.id, type: 'variant', position: a.position, data: v }] : []
    }
    return [{ id: a.id, type: 'note', position: a.position, data: { text: str(a.data.text) } }]
  })
}

type Props = {
  blocks: Block[]
  title: string
  problem: string | null
  theme: ThemeName
  setTheme: (t: ThemeName) => void
  onExit: () => void
  onPages: () => void
  lessonId: string
  sourceHash: string
}

export function FlowBoard(props: Props) {
  return (
    <ReactFlowProvider>
      <FlowInner {...props} />
    </ReactFlowProvider>
  )
}

/**
 * Class mode on an open board: the figures, sliders and questions sit on the board itself, joined
 * by arrows along the problem's chain. "Next" frames the next segment; O frames the whole board.
 */
function FlowInner({ blocks, title, problem, theme, setTheme, onExit, onPages, lessonId, sourceHash }: Props) {
  const rf = useReactFlow()
  const { intro, segs } = useMemo(() => splitSegments(blocks), [blocks])
  const chainSeg = segs.find((s) => Array.isArray(s.head.props.chain))
  const chain = chainSeg ? (chainSeg.head.props.chain as unknown[]).map(Number) : []
  const steps = chainSeg && Array.isArray(chainSeg.head.props.steps) ? (chainSeg.head.props.steps as unknown[]).map((x) => str(x)) : []
  const link = chainSeg && Array.isArray(chainSeg.head.props.link) ? (chainSeg.head.props.link as unknown[]).filter((n): n is string => typeof n === 'string') : []
  // Stations: the problem, then each segment except the panorama (the board is the panorama).
  const stations = useMemo(() => [0, ...segs.map((_, i) => i + 1).filter((n) => !Array.isArray(segs[n - 1].head.props.chain))], [segs])
  const hasVisual = (n: number) => n > 0 && segs[n - 1].blocks.some((b) => b.kind === 'component' && MAIN.has(b.name))
  const variants = useMemo(
    () =>
      blocks.flatMap((b): VariantData[] =>
        b.kind === 'component' && b.name === 'Variant'
          ? [{ label: str(b.props.label), set: numbers(b.props.set), ask: str(b.props.ask), reveal: str(b.props.reveal) }]
          : [],
      ),
    [blocks],
  )
  // The 如果…… station after the segments, one card per Variant; its title is n = -1.
  const extra = variants.length > 0
  const navs = useMemo(() => (extra ? [...stations, -1] : stations), [stations, extra])
  // The panorama's readouts, else the first few in the lesson: what a variant card compares.
  const compare = useMemo((): ReadoutItem[] => {
    const items = (bs: Block[]) =>
      bs.flatMap((b) => (b.kind === 'component' && b.name === 'Readout' && Array.isArray(b.props.items) ? (b.props.items as unknown[]).filter(isReadoutItem) : []))
    const pano = chainSeg ? items(chainSeg.blocks) : []
    return pano.length > 0 ? pano : items(blocks).slice(0, 4)
  }, [chainSeg, blocks])

  // Far mode: each segment's one big number. Keyed by segment number, as SideNode looks it up.
  const quantity = useMemo(() => {
    const pano = chainSeg ? firstReadoutItems(chainSeg.blocks) : []
    const chainNs = chainSeg ? (chainSeg.head.props.chain as unknown[]).map(Number) : []
    return Object.fromEntries(segs.map((seg, i) => [i + 1, quantityFor(seg, i + 1, chainNs, pano)])) as Record<number, ReadoutItem | null>
  }, [segs, chainSeg])
  // Far mode's fixed slider: the Param the panorama's first link names (the one that moves the chain).
  const lead = link[0]
  const farParam = useMemo(
    () =>
      lead
        ? ([...(chainSeg?.blocks ?? []), ...blocks].find(
            (b): b is ComponentBlock => b.kind === 'component' && b.name === 'Param' && b.props.name === lead,
          ) ?? null)
        : null,
    [chainSeg, blocks, lead],
  )

  const { nodes: laidOut, edges, ids } = useMemo(() => {
    const cols = navs.length > 4 ? 3 : navs.length
    const place = (k: number) => {
      const r = Math.floor(k / cols)
      const c = r % 2 ? cols - 1 - (k % cols) : k % cols
      return { x: c * COL_W, y: r * ROW_H, r, c }
    }
    const nodes: Node<AnyData>[] = []
    const ids: string[][] = []
    const anchor: string[] = []
    stations.forEach((n, k) => {
      const p = place(k)
      const data = { k, n }
      nodes.push({ id: `t${k}`, type: 'title', position: { x: p.x, y: p.y }, data })
      const own = [`t${k}`]
      if (n === 0) {
        nodes.push({ id: `p${k}`, type: 'problem', position: { x: p.x, y: p.y + 150 }, data })
        own.push(`p${k}`)
        anchor.push(`p${k}`)
      } else if (hasVisual(n)) {
        nodes.push({ id: `v${k}`, type: 'visual', position: { x: p.x, y: p.y + 150 }, data })
        nodes.push({ id: `s${k}`, type: 'side', position: { x: p.x + VIS_W + GAP, y: p.y + 150 }, data })
        own.push(`v${k}`, `s${k}`)
        anchor.push(`v${k}`)
      } else {
        nodes.push({ id: `x${k}`, type: 'solution', position: { x: p.x, y: p.y + 150 }, data })
        own.push(`x${k}`)
        anchor.push(`x${k}`)
      }
      ids.push(own)
    })
    if (extra) {
      const k = stations.length
      const p = place(k)
      nodes.push({ id: `t${k}`, type: 'title', position: { x: p.x, y: p.y }, data: { k, n: -1 } })
      const own = [`t${k}`]
      variants.forEach((v, i) => {
        const id = `w${i}`
        nodes.push({ id, type: 'variant', position: { x: p.x, y: p.y + 150 + i * 720 }, data: v })
        own.push(id)
      })
      ids.push(own)
    }
    const edges: Edge<EdgeData>[] = stations.slice(0, -1).map((a, k) => {
      const pa = place(k)
      const pb = place(k + 1)
      const ia = chain.indexOf(a)
      const label = ia >= 0 && chain[ia + 1] === stations[k + 1] ? steps[ia] : ''
      const [sh, th] = pa.r !== pb.r ? ['b', 't'] : pb.c > pa.c ? ['r', 'l'] : ['ls', 'rt']
      // Within a row the arrow leaves from beside the figure, so it skips the question column.
      const source = sh === 'r' && hasVisual(a) ? `s${k}` : anchor[k]
      return {
        id: `e${k}`,
        source,
        target: th === 't' ? `t${k + 1}` : anchor[k + 1],
        sourceHandle: sh,
        targetHandle: th,
        type: 'chain',
        data: { label },
        markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: 'var(--c-charge)' },
      }
    })
    return { nodes, edges, ids }
  }, [stations, segs, navs, extra, variants]) // eslint-disable-line react-hooks/exhaustive-deps

  // Teachers may drag things about the board; the layout above is only where they start.
  const [nodes, setNodes, onNodesChange] = useNodesState(laidOut)
  const [menu, setMenu] = useState<MenuAt | null>(null)
  const uid = useRef(0)
  // What a double-click on empty board can add: a slider per visible quantity, a card per Variant.
  const sliders = useMemo(() => {
    const seen = new Set<string>()
    const out: { name: string; label: string }[] = []
    for (const b of blocks) {
      if (b.kind !== 'component' || b.name !== 'Param' || b.props.hidden) continue
      const name = str(b.props.name)
      const label = str(b.props.label) || name
      // Segments keep their own copy of a quantity under the same label; the board links them, so one will do.
      if (!name || seen.has(label)) continue
      seen.add(label)
      out.push({ name, label })
    }
    return out
  }, [blocks])
  const addNode = (type: string, at: { x: number; y: number }, data: AnyData) => {
    const id = `u${++uid.current}`
    setNodes((ns) => [...ns, { id, type, position: at, data }])
    setMenu(null)
    return id
  }
  useEffect(() => {
    if (!menu) return
    const away = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest('.fb-menu')) setMenu(null)
    }
    window.addEventListener('pointerdown', away)
    return () => window.removeEventListener('pointerdown', away)
  }, [menu])
  const [at, setAt] = useState(0)
  const [overview, setOverview] = useState(true)
  // Growing: the lesson shows only the stations reached so far. `reached` is the largest station number
  // flown to (kept in a ref too, for the callbacks); `born` marks the stations that grew in the last
  // GROW_MS, with the flight that grew them, so their pieces animate.
  const [grow, setGrow] = useState(true)
  const [reached, setReached] = useState(0)
  const reachedRef = useRef(0)
  const [born, setBorn] = useState<Record<number, number>>({})
  const flights = useRef(0)
  // Solutions reveal a unit at a time: parts[k] is how many of station k's units show (default 1), partCount[k] how many it has.
  const [parts, setParts] = useState<Record<number, number>>({})
  const [partCount, setPartCount] = useState<Record<number, number>>({})
  const reportParts = useCallback((k: number, n: number) => setPartCount((p) => (p[k] === n ? p : { ...p, [k]: n })), [])
  const stationOf = useMemo(() => {
    const m = new Map<string, number>()
    ids.forEach((own, k) => own.forEach((id) => m.set(id, k)))
    return m
  }, [ids])
  // What the canvas draws: while growing, the stations not reached yet are hidden and the new ones carry
  // their animation classes. Only these copies get the classes; the stored nodes and edges stay as laid out.
  const grown = useMemo(() => {
    if (!grow) return { nodes, edges }
    const ns = nodes.map((n): Node<AnyData> => {
      const k = isAdded(n.id) ? undefined : stationOf.get(n.id)
      if (k === undefined) return n
      if (k > reached) return { ...n, className: 'fb-unborn' }
      if (born[k] === undefined) return n
      if (n.type === 'variant') return { ...n, className: 'fb-born fb-born-card', style: { '--fb-stagger': Number(n.id.slice(1)) } as CSSProperties }
      const kind = n.type === 'title' ? 'fb-born-title' : n.type === 'problem' || n.type === 'visual' ? 'fb-born-main' : 'fb-born-side'
      return { ...n, className: `fb-born ${kind}` }
    })
    const es = edges.map((e): Edge<EdgeData> => {
      const target = Number(e.id.slice(1)) + 1
      if (target > reached) return { ...e, className: 'fb-edge-unborn', data: { ...e.data, grow: 'unborn' } }
      if (born[target] === undefined) return e
      return { ...e, className: 'fb-edge-born', data: { ...e.data, grow: 'born', gen: born[target] } }
    })
    return { nodes: ns, edges: es }
  }, [grow, nodes, edges, stationOf, reached, born])
  const [shown, setShown] = useState<Record<number, boolean>>({})
  const [notes, setNotes] = useState(false)
  const [pen, setPen] = useState(false)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [boardMenu, setBoardMenu] = useState(false)
  const boardWrap = useRef<HTMLDivElement>(null)
  const importInput = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState<{ text: string } | null>(null)
  useEffect(() => {
    if (!boardMenu) return
    const away = (e: PointerEvent) => {
      if (!boardWrap.current?.contains(e.target as HTMLElement)) setBoardMenu(false)
    }
    window.addEventListener('pointerdown', away)
    return () => window.removeEventListener('pointerdown', away)
  }, [boardMenu])
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 5000)
    return () => window.clearTimeout(t)
  }, [toast])

  // One variant at a time, owned here. The ref is what the callbacks and the unmount cleanup read.
  const store = useStore()
  const [active, setActive] = useState<Active | null>(null)
  const activeRef = useRef<Active | null>(null)
  const apply = useCallback(
    (id: string, v: VariantData) => {
      const prev = activeRef.current
      if (prev) store.set(prev.before)
      const scope = store.scopeWith({})
      const before = Object.fromEntries(Object.keys(v.set).map((k) => [k, scope[k] as number]))
      store.set(v.set)
      const next = { id, label: v.label, before }
      activeRef.current = next
      setActive(next)
    },
    [store],
  )
  const restore = useCallback(() => {
    const prev = activeRef.current
    if (!prev) return
    store.set(prev.before)
    activeRef.current = null
    setActive(null)
  }, [store])
  // Leaving the board with a variant applied puts the lesson's own values back.
  useEffect(
    () => () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps -- the latest applied variant, not the one at mount
      if (activeRef.current) store.set(activeRef.current.before)
    },
    [store],
  )

  // Where each layout node starts: a restore or a clear puts the layout back here.
  const home = useMemo(() => new Map(laidOut.map((n) => [n.id, n.position])), [laidOut])
  const layoutOnly = (ns: Node<AnyData>[], moved: Record<string, Point> = {}) =>
    ns
      .filter((n) => !isAdded(n.id))
      .map((n) => {
        const p = moved[n.id] ?? home.get(n.id)
        return p ? { ...n, position: p } : n
      })
  const snapshot = useCallback(
    (ns: Node<AnyData>[], ss: Stroke[]): SavedBoard => {
      const added = ns.flatMap((n): SavedAdded[] => (isAdded(n.id) && isKind(n.type) ? [{ id: n.id, type: n.type, position: n.position, data: savedData(n) }] : []))
      const moved: Record<string, Point> = {}
      for (const n of ns) {
        const p = home.get(n.id)
        if (p && (n.position.x !== p.x || n.position.y !== p.y)) moved[n.id] = n.position
      }
      return { v: 1, hash: sourceHash, added, moved, strokes: ss, savedAt: Date.now() }
    },
    [home, sourceHash],
  )
  /** A saved board on this lesson: the same source gets its positions and ink back; a changed one keeps only the teacher's nodes. */
  const load = (saved: SavedBoard) => {
    if (activeRef.current) restore()
    const same = saved.hash === sourceHash
    const added = reviveAdded(saved.added, blocks, variants)
    for (const a of saved.added) uid.current = Math.max(uid.current, Number(a.id.slice(1)))
    setNodes((ns) => [...layoutOnly(ns, same ? saved.moved : {}), ...added])
    setStrokes(same ? saved.strokes : [])
    // Only worth saying when something was actually left out.
    if (!same && (Object.keys(saved.moved).length > 0 || saved.strokes.length > 0)) setToast({ text: LESSON_CHANGED })
  }
  // Restored once, right after mount. Nothing is written before that, or the empty board would erase what was saved.
  const restoredOnce = useRef(false)
  const [restored, setRestored] = useState(false)
  useEffect(() => {
    if (restoredOnce.current) return
    restoredOnce.current = true
    const saved = readBoard(`genui-board:${lessonId}`)
    if (saved) load(saved)
    setRestored(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, at mount
  }, [])
  // Saved a moment after the last change; closing the board inside that moment still keeps it.
  const flush = useRef<(() => void) | null>(null)
  useEffect(() => {
    if (!restored) return
    const save = () => {
      flush.current = null
      writeBoard(`genui-board:${lessonId}`, snapshot(nodes, strokes))
    }
    flush.current = save
    const t = window.setTimeout(save, 400)
    return () => window.clearTimeout(t)
  }, [restored, nodes, strokes, lessonId, snapshot])
  useEffect(() => {
    const pending = flush
    return () => pending.current?.()
  }, [])

  const exportBoard = () => {
    setBoardMenu(false)
    try {
      const blob = new Blob([JSON.stringify(snapshot(nodes, strokes), null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${lessonId}-板书.json`
      document.body.append(a)
      a.click()
      a.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setToast({ text: '导出没有成功，板书没有改动。' })
    }
  }
  const importBoard = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Cleared so the same file can be picked again.
    e.target.value = ''
    if (!file) return
    let saved: SavedBoard | null = null
    try {
      saved = parseBoard(JSON.parse(await file.text()))
    } catch {
      saved = null
    }
    if (saved) load(saved)
    else setToast({ text: '这不是板书文件，板书没有改动。' })
  }
  const clearBoard = () => {
    setBoardMenu(false)
    if (!window.confirm('清空老师加的便签、卡片、笔迹和摆放？')) return
    if (activeRef.current) restore()
    setNodes((ns) => layoutOnly(ns))
    setStrokes([])
    try {
      localStorage.removeItem(`genui-board:${lessonId}`)
    } catch {
      // Blocked storage: there was nothing kept to remove.
    }
  }

  const flyTo = (i: number) => {
    const k = Math.max(0, Math.min(navs.length - 1, i))
    setAt(k)
    setOverview(false)
    // Going forward past stations that have not grown yet grows them all, in this flight.
    const from = reachedRef.current
    if (k > from) {
      reachedRef.current = k
      setReached(k)
      if (grow) {
        const gen = ++flights.current
        const fresh = Array.from({ length: k - from }, (_, j) => from + 1 + j)
        setBorn((b) => ({ ...b, ...Object.fromEntries(fresh.map((s) => [s, gen])) }))
        window.setTimeout(() => setBorn((b) => Object.fromEntries(Object.entries(b).filter(([, g]) => g !== gen))), GROW_MS)
      }
    }
    void rf.fitBounds(rf.getNodesBounds(ids[k]), flyOpts())
  }
  const flyAll = () => {
    setOverview(true)
    // Growing: the whole board is framed only as far as it has grown (the teacher's own pieces always count).
    const all = rf.getNodes()
    const seen = grow ? all.filter((n) => (stationOf.get(n.id) ?? -1) <= reachedRef.current) : all
    void rf.fitBounds(rf.getNodesBounds(seen), flyOpts())
  }
  /** Back to the problem with nothing grown (the board menu's item). Growing turns on if it was off. The teacher's pieces stay. */
  const growFromStart = () => {
    setBoardMenu(false)
    setGrow(true)
    setParts({})
    reachedRef.current = 0
    setReached(0)
    setBorn({})
    flyTo(0)
  }
  // The 如果…… station has no segment: no question, no reveal.
  const curN = at < navs.length ? navs[at] : -1
  const cur = curN > 0 ? segs[curN - 1] : null
  const hasReveal = !!cur && str(cur.head.props.reveal) !== '' && !overview
  const marks = useMemo(() => (cur ? quotePieces(str(cur.head.props.quote)) : []), [cur])
  /**
   * A note for a question the class asked, under the current station (Q). Each one after the first goes
   * under the last, 40 below it. The camera then frames the station and the note together.
   */
  const addUnder = () => {
    const station = rf.getNodesBounds(ids[at])
    const under = rf.getNodes().filter((n) => n.data?.under === at)
    let y = station.y + station.height + 80
    if (under.length > 0) {
      const low = under.reduce((a, b) => (b.position.y > a.position.y ? b : a))
      const h = rf.getNodesBounds([low.id]).height
      y = low.position.y + (h > 0 ? h : 300) + 40
    }
    const pos = { x: station.x, y }
    const id = addNode('note', pos, { fresh: true, under: at })
    setOverview(false)
    // The note is measured once it is drawn; a moment later the camera frames it with the station.
    window.setTimeout(() => {
      const note = rf.getNodesBounds([id])
      const w = note.width > 0 ? note.width : 480
      const h = note.height > 0 ? note.height : 300
      const x0 = Math.min(station.x, pos.x)
      const y0 = station.y
      const x1 = Math.max(station.x + station.width, pos.x + w)
      const y1 = Math.max(station.y + station.height, pos.y + h)
      void rf.fitBounds({ x: x0, y: y0, width: x1 - x0, height: y1 - y0 }, flyOpts())
    }, 120)
  }
  const next = () => {
    if (overview) return flyTo(at)
    if (hasReveal && !shown[at]) return setShown({ ...shown, [at]: true })
    // The solution's next unit comes in; the variant's whole text and grow off show everything already.
    if (grow && !active && partCount[at] !== undefined && (parts[at] ?? 1) < partCount[at]) return setParts({ ...parts, [at]: (parts[at] ?? 1) + 1 })
    if (at < navs.length - 1) flyTo(at + 1)
  }
  const fullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    else void document.documentElement.requestFullscreen?.().catch(() => {})
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA' || el.isContentEditable) return
      const k = e.key
      if (k === 'Escape' && (menu || boardMenu)) {
        setMenu(null)
        setBoardMenu(false)
      }
      else if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') next()
      else if (k === 'ArrowLeft' || k === 'PageUp') flyTo(overview ? at : at - 1)
      else if (k === 'o' || k === 'O') (overview ? flyTo(at) : flyAll())
      else if (k === 'g' || k === 'G') setGrow((v) => !v)
      else if (k === 'q' || k === 'Q') addUnder()
      else if (k === 'n' || k === 'N') setNotes((v) => !v)
      else if (k === 'f' || k === 'F') fullscreen()
      else if (k === 'p' || k === 'P') setPen((v) => !v)
      else if (k === 'c' || k === 'C') setStrokes([])
      else if (k === 'Escape' && pen) setPen(false)
      else if (k === 'Escape' && !document.fullscreenElement) onExit()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const board = useMemo(
    () => ({
      segs,
      shown,
      problem,
      blocks,
      reveal: (k: number) => setShown((v) => ({ ...v, [k]: true })),
      active,
      apply,
      restore,
      compare,
      quantity,
      grow,
      parts,
      reportParts,
      marks,
    }),
    [segs, shown, problem, blocks, active, apply, restore, compare, quantity, grow, parts, reportParts, marks],
  )

  return (
    <BoardContext.Provider value={board}>
      <div className={`teach canvas-mode fb${active ? ' variant-on' : ''}`}>
        {link.length > 1 && <LinkAll names={link} />}
        <div className="teach-bar canvas-bar">
          <span className="teach-title">{title}</span>
          <ol className="teach-pages">
            {navs.map((n, k) => (
              <li key={k}>
                <button className={k === at && !overview ? 'active' : ''} onClick={() => flyTo(k)}>
                  {n > 0 && <span className="seg-num">{n}</span>}
                  {n < 0
                    ? '如果'
                    : n === 0
                      ? '题目'
                      : k === at && !overview
                        ? str(segs[n - 1].head.props.title)
                        : ''}
                </button>
              </li>
            ))}
          </ol>
          <span className="fb-hint">双击空白处：便签 · 滑块 · 如果……</span>
          <div className="teach-actions">
            <button className={`pill ${grow ? 'active' : ''}`} aria-pressed={grow} onClick={() => setGrow(!grow)} title="G">
              生长
            </button>
            <button className={`pill ${overview ? 'active' : ''}`} onClick={() => (overview ? flyTo(at) : flyAll())} title="O">
              全览
            </button>
            <div className="fb-board-wrap" ref={boardWrap}>
              <button className={`pill ${boardMenu ? 'active' : ''}`} aria-haspopup="menu" aria-expanded={boardMenu} onClick={() => setBoardMenu(!boardMenu)}>
                板书
              </button>
              {boardMenu && (
                <div className="fb-menu fb-board-menu" role="menu">
                  <button role="menuitem" onClick={growFromStart}>
                    从头生长
                  </button>
                  <button role="menuitem" onClick={exportBoard}>
                    导出板书
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setBoardMenu(false)
                      importInput.current?.click()
                    }}
                  >
                    导入板书
                  </button>
                  <button role="menuitem" onClick={clearBoard}>
                    清空板书
                  </button>
                </div>
              )}
              <input ref={importInput} type="file" accept=".json,application/json" hidden onChange={importBoard} />
            </div>
            <button className="pill" onClick={addUnder} title="Q">
              补一条
            </button>
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
        <div
          className="fb-view"
          onDoubleClick={(e) => {
            if (!(e.target as HTMLElement).classList.contains('react-flow__pane')) return
            const r = e.currentTarget.getBoundingClientRect()
            setMenu({ x: e.clientX - r.left, y: e.clientY - r.top, at: rf.screenToFlowPosition({ x: e.clientX, y: e.clientY }) })
          }}
        >
          <ReactFlow
            nodes={grown.nodes}
            onNodesChange={onNodesChange}
            edges={grown.edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            colorMode={theme === 'night' ? 'dark' : 'light'}
            fitView
            // A growing board opens framed on the problem alone.
            fitViewOptions={{ padding: 0.04, nodes: grow ? ids[0].map((id) => ({ id })) : undefined }}
            minZoom={0.05}
            maxZoom={3}
            nodesConnectable={false}
            elementsSelectable={false}
            deleteKeyCode={null}
            panActivationKeyCode={null}
            selectionKeyCode={null}
            zoomOnDoubleClick={false}
            onMoveStart={(e) => e && setOverview(false)}
          >
            <Background variant={BackgroundVariant.Dots} gap={28} size={1.6} />
            <MiniMap pannable zoomable className="fb-minimap" nodeClassName={(n) => (n.className?.includes('fb-unborn') ? 'fb-unborn' : '')} style={{ width: 160, height: 100 }} />
            <BoardPen on={pen} strokes={strokes} setStrokes={setStrokes} />
          </ReactFlow>
          <FarOverview param={farParam} />
          {toast && (
            <div className="fb-toast" role="status">
              {toast.text}
            </div>
          )}
          {menu && (
            <div className="fb-menu" role="menu" style={{ left: menu.x, top: menu.y }}>
              <button role="menuitem" onClick={() => addNode('note', menu.at, { fresh: true })}>
                便签
              </button>
              {sliders.map((s) => (
                <button key={`${s.name}\n${s.label}`} role="menuitem" onClick={() => addNode('slider', menu.at, { name: s.name })}>
                  滑块：{s.label}
                </button>
              ))}
              {variants.map((v, i) => (
                <button key={i} role="menuitem" onClick={() => addNode('variant', menu.at, v)}>
                  如果：{v.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {notes && (
          <div className="canvas-notes">
            <TeachNotes seg={cur} intro={intro} />
          </div>
        )}
      </div>
    </BoardContext.Provider>
  )
}
