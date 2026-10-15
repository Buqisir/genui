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
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Block } from '../lesson/parse'
import { useScopeFor, useStore } from '../lesson/store'
import type { ThemeName } from '../theme'
import { boxed, LinkAll, MAIN, Markdown, moonIcon, Quote, splitSegments, str, TeachNotes, type Seg } from './LessonView'
import { Rich } from './rich'

type ComponentBlock = Extract<Block, { kind: 'component' }>

// Node contents are laid out at class-mode size and enlarged with CSS zoom, so a station fills a
// projector at about 1:1 and figures stay crisp; the overview only ever scales them down.
const Z = 1.5

type Board = {
  segs: Seg[]
  shown: Record<number, boolean>
  reveal: (k: number) => void
  problem: string | null
  blocks: Block[]
}
const BoardContext = createContext<Board | null>(null)
const useBoard = () => useContext(BoardContext)!

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
  const { segs } = useBoard()
  return (
    <div className="fb-title">
      <Handle type="target" position={Position.Top} id="t" className="fb-handle" />
      {data.n > 0 && <span className="fb-title-num">{data.n}</span>}
      {data.n > 0 ? str(segs[data.n - 1].head.props.title) : '题目'}
    </div>
  )
}

function ProblemNode() {
  const { problem } = useBoard()
  return (
    <Zoomed width={900} className="fb-problem">
      {handles}
      {problem && <Rich html text={problem} />}
    </Zoomed>
  )
}

/** The segment's main figure with its sliders and presets right under it. */
function VisualNode({ data }: NodeProps<Node<Data>>) {
  const { segs } = useBoard()
  const seg = segs[data.n - 1]
  const comps = seg.blocks.filter((b): b is ComponentBlock => b.kind === 'component')
  const visual = comps.find((b) => MAIN.has(b.name))
  const inputs = comps.filter((b) => (b.name === 'Param' && !b.props.hidden) || b.name === 'Preset')
  return (
    <Zoomed width={760}>
      {handles}
      {visual && boxed(visual, 'v')}
      {inputs.length > 0 && <div className="fb-inputs nodrag nowheel">{inputs.map((b, i) => boxed(b, `c${i}`))}</div>}
    </Zoomed>
  )
}

/** Quote, the question to the class, and what comes with the answer. */
function SideNode({ data }: NodeProps<Node<Data>>) {
  const { segs, shown, reveal } = useBoard()
  const store = useStore()
  const seg = segs[data.n - 1]
  const comps = seg.blocks.filter((b): b is ComponentBlock => b.kind === 'component')
  const visuals = comps.filter((b) => MAIN.has(b.name))
  const outputs = comps.filter((b) => b.name === 'Readout' || b.name === 'Status')
  const quote = str(seg.head.props.quote)
  const ask = str(seg.head.props.ask)
  const answer = str(seg.head.props.reveal)
  const revealParam = str(seg.head.props.revealParam)
  const isShown = !!shown[data.k]
  const open = !answer || isShown
  useEffect(() => {
    if (revealParam) store.set({ [revealParam]: open ? 1 : 0 })
  }, [store, revealParam, open])
  useEffect(() => (revealParam ? () => store.set({ [revealParam]: 1 }) : undefined), [store, revealParam])
  return (
    <Zoomed width={560} className="fb-side">
      {handles}
      {quote && !(isShown && (outputs.length > 0 || visuals.length > 1)) && <Quote text={quote} />}
      {ask && (
        <div className="teach-ask">
          <span className="teach-tag">问</span>
          <Rich html text={ask} />
        </div>
      )}
      {answer &&
        (isShown ? (
          <div className="teach-reveal">
            <Rich html text={answer} />
          </div>
        ) : (
          <button className="teach-reveal-btn nodrag" onClick={() => reveal(data.k)}>
            揭晓 <kbd>空格</kbd>
          </button>
        ))}
      {open && outputs.length > 0 && <div className="fb-outputs nodrag">{outputs.map((b, i) => boxed(b, `o${i}`))}</div>}
      {open && visuals.slice(1).map((b, i) => <div key={i} className="nodrag nowheel">{boxed(b, `v${i}`)}</div>)}
    </Zoomed>
  )
}

function SolutionNode({ data }: NodeProps<Node<Data>>) {
  const { segs } = useBoard()
  const seg = segs[data.n - 1]
  const texts = seg.blocks.filter((b) => b.kind === 'markdown') as Extract<Block, { kind: 'markdown' }>[]
  return (
    <Zoomed width={980} className="fb-solution solution">
      {handles}
      {texts.map((b, i) => (
        <Markdown key={i} text={b.text} />
      ))}
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

/** The × in a teacher-made node's corner. */
function DelButton({ id }: { id: string }) {
  const { deleteElements } = useReactFlow()
  return (
    <button className="fb-del nodrag" aria-label="删除" onClick={() => void deleteElements({ nodes: [{ id }] })}>
      ×
    </button>
  )
}

function NoteNode({ id }: NodeProps) {
  const text = useRef<HTMLDivElement>(null)
  useEffect(() => {
    text.current?.focus({ preventScroll: true })
  }, [])
  return (
    <Zoomed width={320} className="fb-note">
      <DelButton id={id} />
      <div ref={text} className="fb-note-text nodrag nowheel" contentEditable suppressContentEditableWarning />
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

/** A Variant: setting its values on the board, and putting them back. Restored on removal too. */
function VariantNode({ id, data }: NodeProps<Node<VariantData>>) {
  const store = useStore()
  const keys = Object.keys(data.set)
  const scope = useScopeFor(keys)
  const [applied, setApplied] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const before = useRef<Record<string, number>>({})
  const appliedRef = useRef(false)
  useEffect(
    () => () => {
      if (appliedRef.current) store.set(before.current)
    },
    [store],
  )
  const apply = () => {
    before.current = Object.fromEntries(keys.map((k) => [k, scope[k] as number]))
    store.set(data.set)
    appliedRef.current = true
    setApplied(true)
  }
  const restore = () => {
    store.set(before.current)
    appliedRef.current = false
    setApplied(false)
  }
  return (
    <Zoomed width={560} className={`fb-variant${applied ? ' applied' : ''}`}>
      <DelButton id={id} />
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
        <button className="pill nodrag" onClick={applied ? restore : apply}>
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
    </Zoomed>
  )
}

/** An arrow along the chain, labelled with the relation that carries one step into the next. */
function ChainEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, data }: EdgeProps<Edge<{ label?: string }>>) {
  const [path, lx, ly] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, curvature: 0.35 })
  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} className="fb-edge" />
      {data?.label && (
        <EdgeLabelRenderer>
          <div className="fb-edge-label" style={{ transform: `translate(-50%, -50%) translate(${lx}px, ${ly}px)` }}>
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

type Props = { blocks: Block[]; title: string; problem: string | null; theme: ThemeName; setTheme: (t: ThemeName) => void; onExit: () => void; onPages: () => void }

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
function FlowInner({ blocks, title, problem, theme, setTheme, onExit, onPages }: Props) {
  const rf = useReactFlow()
  const { intro, segs } = useMemo(() => splitSegments(blocks), [blocks])
  const chainSeg = segs.find((s) => Array.isArray(s.head.props.chain))
  const chain = chainSeg ? (chainSeg.head.props.chain as unknown[]).map(Number) : []
  const steps = chainSeg && Array.isArray(chainSeg.head.props.steps) ? (chainSeg.head.props.steps as unknown[]).map((x) => str(x)) : []
  const link = chainSeg && Array.isArray(chainSeg.head.props.link) ? (chainSeg.head.props.link as unknown[]).filter((n): n is string => typeof n === 'string') : []
  // Stations: the problem, then each segment except the panorama (the board is the panorama).
  const stations = useMemo(() => [0, ...segs.map((_, i) => i + 1).filter((n) => !Array.isArray(segs[n - 1].head.props.chain))], [segs])
  const hasVisual = (n: number) => n > 0 && segs[n - 1].blocks.some((b) => b.kind === 'component' && MAIN.has(b.name))

  const { nodes: laidOut, edges, ids } = useMemo(() => {
    const cols = stations.length > 4 ? 3 : stations.length
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
    const edges: Edge<{ label?: string }>[] = stations.slice(0, -1).map((a, k) => {
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
  }, [stations, segs]) // eslint-disable-line react-hooks/exhaustive-deps

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
  const variants = useMemo(
    () =>
      blocks.flatMap((b): VariantData[] =>
        b.kind === 'component' && b.name === 'Variant'
          ? [{ label: str(b.props.label), set: numbers(b.props.set), ask: str(b.props.ask), reveal: str(b.props.reveal) }]
          : [],
      ),
    [blocks],
  )
  const addNode = (type: string, at: { x: number; y: number }, data: AnyData) => {
    const id = `u${++uid.current}`
    setNodes((ns) => [...ns, { id, type, position: at, data }])
    setMenu(null)
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
  const [shown, setShown] = useState<Record<number, boolean>>({})
  const [notes, setNotes] = useState(false)
  const [pen, setPen] = useState(false)
  const [strokes, setStrokes] = useState<Stroke[]>([])

  const flyTo = (i: number) => {
    const k = Math.max(0, Math.min(stations.length - 1, i))
    setAt(k)
    setOverview(false)
    void rf.fitBounds(rf.getNodesBounds(ids[k]), { duration: 800, padding: 0.04 })
  }
  const flyAll = () => {
    setOverview(true)
    void rf.fitBounds(rf.getNodesBounds(rf.getNodes()), { duration: 800, padding: 0.04 })
  }
  const cur = stations[at] > 0 ? segs[stations[at] - 1] : null
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
      if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA' || el.isContentEditable) return
      const k = e.key
      if (k === 'Escape' && menu) setMenu(null)
      else if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') next()
      else if (k === 'ArrowLeft' || k === 'PageUp') flyTo(overview ? at : at - 1)
      else if (k === 'o' || k === 'O') (overview ? flyTo(at) : flyAll())
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

  const board = useMemo(() => ({ segs, shown, problem, blocks, reveal: (k: number) => setShown((v) => ({ ...v, [k]: true })) }), [segs, shown, problem, blocks])

  return (
    <BoardContext.Provider value={board}>
      <div className="teach canvas-mode fb">
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
          <span className="fb-hint">双击空白处：便签 · 滑块 · 如果……</span>
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
            nodes={nodes}
            onNodesChange={onNodesChange}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            colorMode={theme === 'night' ? 'dark' : 'light'}
            fitView
            fitViewOptions={{ padding: 0.04 }}
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
            <MiniMap pannable zoomable className="fb-minimap" style={{ width: 160, height: 100 }} />
            <BoardPen on={pen} strokes={strokes} setStrokes={setStrokes} />
          </ReactFlow>
          {menu && (
            <div className="fb-menu" role="menu" style={{ left: menu.x, top: menu.y }}>
              <button role="menuitem" onClick={() => addNode('note', menu.at, {})}>
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
