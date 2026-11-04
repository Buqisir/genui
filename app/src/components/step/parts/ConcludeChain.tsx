import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { StepComponent } from '../registry'
import { useChain, useStepRuntime, type ChainItem, type ConcludeEntry } from '../runtime'
import { useDesktop } from '../layoutFit'
import { str } from './common'

/**
 * `<Conclude title text under guess settles result blank />`：板上不画东西。讲到它所在的那一句时，它加进结论链
 * （链的状态在 StepEngine 里，见 `runtime.ts` 的 `chain()`）；这里只在挂载时把自己登记进去。
 */
export const Conclude: StepComponent = ({ block, at }) => {
  const rt = useStepRuntime()
  const register = rt?.registerConclude
  const p = block.props
  const entry: ConcludeEntry = {
    title: str(p.title),
    text: str(p.text),
    under: str(p.under) || undefined,
    guess: p.guess === true,
    settles: str(p.settles) || undefined,
    result: p.result === 'holds' || p.result === 'out' ? p.result : undefined,
    blank: str(p.blank) || undefined,
  }
  const sig = JSON.stringify(entry)
  useLayoutEffect(() => {
    register?.(String(block.line), at, entry, block.line)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [register, sig, at, block.line])
  return null
}

/** One chip of the row: a top-level entry and everything hung under it (the chain's list is depth-first). */
interface Chip {
  top: ChainItem
  kids: ChainItem[]
  latest: boolean
}
function chips(items: ChainItem[]): Chip[] {
  const out: Chip[] = []
  for (const it of items) {
    if (it.depth === 0 || out.length === 0) out.push({ top: it, kids: [], latest: it.latest })
    else {
      const c = out[out.length - 1]
      c.kids.push(it)
      if (it.latest) c.latest = true
    }
  }
  return out
}

const MORE_W = 56
/** The open-card key of the phone's collapsed button: its card lists every entry. */
const ALL = '*all*'
/** How long a card that a new conclusion opened stays open (ms). */
const AUTO_MS = 4000

/** One entry in the phone's list card; kids are indented by depth, like the desktop card. */
function ChainLi({ item }: { item: ChainItem }) {
  return (
    <li className={item.out ? 'out' : undefined} style={{ marginLeft: Math.max(0, item.depth - 1) * 16 }}>
      {item.tag && <span className="il-tag">{item.tag}</span>}
      <b>{item.title}</b>
      <div>{item.text}</div>
    </li>
  )
}

/**
 * The conclusion chain (board spec 5.4). Desktop: one row, 32 high: the label 「已得结论」, an arrow between each pair of
 * short titles, and the folded "…+n" when the row is full (the newest chips stay). Entries hung `under` another are folded
 * into their chip (a +n badge) and listed, indented, in the card that opens when you click a chip. A guess is dashed and
 * tagged 猜想; once settled it shows the settling entry (成立) or is struck through (出局). A conclusion that arrives in the
 * current step is drawn ink, and on desktop its card pops open with a 「新结论」 line for 4 seconds, then closes (the chip
 * stays ink until the step changes). Phone (< 1024 px): the row collapses into one button, 「已得结论 n」 + the newest
 * title + ›; tapping it opens a card listing every entry. Nothing opens by itself on the phone. Width follows the parent.
 */
export function ConcludeChain() {
  const items = useChain()
  const rt = useStepRuntime()
  const desktop = useDesktop()
  const list = useMemo(() => chips(items), [items])
  const [open, setOpen] = useState<string | null>(null)
  const [auto, setAuto] = useState(false)
  const [fresh, setFresh] = useState<string | null>(null)
  const [hide, setHide] = useState(0)
  const [width, setWidth] = useState(0)
  const box = useRef<HTMLElement>(null)
  const row = useRef<HTMLDivElement>(null)
  /** Top-level keys seen so far; null until the first run, so entries carried over from earlier steps do not pop. */
  const seen = useRef<Set<string> | null>(null)

  // A new step: no chip is fresh any more. Declared before the chain effect below, so a conclusion that arrives with the
  // step still wins.
  useEffect(() => {
    setFresh(null)
  }, [rt?.stepKey])

  const topKeys = list.map((c) => c.top.key).join('\n')
  useEffect(() => {
    const keys = topKeys ? topKeys.split('\n') : []
    const known = seen.current
    if (known === null) {
      seen.current = new Set(keys)
      return
    }
    const added = keys.filter((k) => !known.has(k))
    for (const k of keys) known.add(k)
    if (added.length === 0) return
    const key = added[added.length - 1]
    setFresh(key)
    if (desktop) {
      setOpen(key)
      setAuto(true)
    }
  }, [topKeys, desktop])

  // A card that a new conclusion opened closes by itself. Any click on the chain (see below) takes that over.
  useEffect(() => {
    if (!auto || open === null) return
    const t = window.setTimeout(() => {
      setOpen(null)
      setAuto(false)
    }, AUTO_MS)
    return () => window.clearTimeout(t)
  }, [auto, open])

  useEffect(() => {
    const el = row.current
    if (!el) return
    if (typeof ResizeObserver === 'undefined') {
      setWidth(el.clientWidth)
      return
    }
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [list.length > 0, desktop])

  // Fold the oldest chips into "…+n" until the row fits. Folded chips stay laid out (invisible) so they can still be measured.
  const sig = list.map((c) => `${c.top.title}|${c.kids.length}|${c.top.tag}`).join('\n')
  useLayoutEffect(() => {
    const el = row.current
    if (!el) return
    const slots = Array.from(el.querySelectorAll<HTMLElement>('[data-chip]'))
    const w = slots.map((s) => s.offsetWidth)
    const gap = 6
    const label = (el.querySelector('.il-chain-h') as HTMLElement | null)?.offsetWidth ?? 0
    const fits = (avail: number) => {
      let used = 0
      let from = w.length
      for (let i = w.length - 1; i >= 0; i--) {
        const need = w[i] + (used ? gap : 0)
        if (used + need > avail && from < w.length) break
        used += need
        from = i
      }
      return from
    }
    const full = el.clientWidth - label - gap
    let from = fits(full)
    if (from > 0) from = fits(full - MORE_W - gap)
    setHide(from)
  }, [sig, width, desktop])

  // Click anywhere else, or Escape, closes the card.
  useEffect(() => {
    if (open === null) return
    const down = (e: MouseEvent) => {
      if (e.target instanceof Node && !box.current?.contains(e.target)) {
        setAuto(false)
        setOpen(null)
      }
    }
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAuto(false)
        setOpen(null)
      }
    }
    document.addEventListener('mousedown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('mousedown', down)
      document.removeEventListener('keydown', key)
    }
  }, [open])

  // Nothing concluded yet: nothing to draw (a lesson with no <Conclude> never shows a chain).
  if (list.length === 0) return null

  if (!desktop) {
    const newest = list.find((c) => c.latest) ?? list[list.length - 1]
    const isOpen = open === ALL
    return (
      <nav className="il-chain compact" ref={box} aria-label="结论链" data-testid="chain">
        <button
          type="button"
          className="il-chain-one"
          aria-expanded={isOpen}
          onClick={() => {
            setAuto(false)
            setOpen(isOpen ? null : ALL)
          }}
        >
          <span className="il-ch il-cnt">已得结论 {list.length}</span>
          <span className={`il-ch il-one-t${newest.top.key === fresh ? ' fresh' : ''}`}>
            <span className="il-ch-t">{newest.top.title}</span>
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M6 3.5 L10.5 8 L6 12.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {isOpen && (
          <div className="il-pop" role="dialog" aria-label="已得结论">
            <button type="button" className="il-pop-x" aria-label="收起" onClick={() => setOpen(null)}>
              ×
            </button>
            <ol>
              {list.map((c) => (
                <Fragment key={c.top.key}>
                  <ChainLi item={c.top} />
                  {c.kids.map((k) => (
                    <ChainLi key={k.key} item={k} />
                  ))}
                </Fragment>
              ))}
            </ol>
          </div>
        )}
      </nav>
    )
  }

  // The entry that was open is gone (stepped back past it): nothing to show.
  const current = open !== null ? list.find((c) => c.top.key === open) : undefined
  const shownHide = Math.min(hide, list.length - 1)

  return (
    <nav className="il-chain" ref={box} aria-label="结论链" data-testid="chain">
      <div className="il-chain-row" ref={row}>
        <span className="il-chain-h">已得结论</span>
        {shownHide > 0 && <span className="il-more">…+{shownHide}</span>}
        {list.map((c, i) => {
          const on = current?.top.key === c.top.key
          const cls = ['il-ch']
          if (c.latest) cls.push('latest')
          if (c.top.key === fresh) cls.push('fresh')
          if (c.top.tag === '猜想') cls.push('guess')
          if (c.top.tag === '成立') cls.push('holds')
          if (c.top.out) cls.push('out')
          if (c.top.masked) cls.push('masked')
          if (on) cls.push('on')
          return (
            <span key={c.top.key} data-chip className={`il-slot${i < shownHide ? ' folded' : ''}`}>
              <button
                type="button"
                className={cls.join(' ')}
                aria-expanded={on}
                data-key={c.top.key}
                tabIndex={i < shownHide ? -1 : undefined}
                onClick={() => {
                  setAuto(false)
                  setOpen(on ? null : c.top.key)
                }}
              >
                {c.top.tag && <span className="il-tag">{c.top.tag}</span>}
                <span className="il-ch-t">{c.top.title}</span>
                {c.kids.length > 0 && <span className="il-ch-n">+{c.kids.length}</span>}
              </button>
            </span>
          )
        })}
      </div>
      {current && (
        <div className="il-pop" role="dialog" aria-label={current.top.title}>
          <button
            type="button"
            className="il-pop-x"
            aria-label="收起"
            onClick={() => {
              setAuto(false)
              setOpen(null)
            }}
          >
            ×
          </button>
          {auto && <div className="il-pop-new">新结论</div>}
          <div className="il-pop-title">
            {current.top.tag && <span className="il-tag">{current.top.tag}</span>}
            <span>{current.top.title}</span>
          </div>
          <div>{current.top.text}</div>
          {current.kids.length > 0 && (
            <ol>
              {current.kids.map((k) => (
                <li key={k.key} className={k.out ? 'out' : undefined} style={{ marginLeft: (k.depth - 1) * 16 }}>
                  {k.tag && <span className="il-tag">{k.tag}</span>}
                  <b>{k.title}</b>
                  <div>{k.text}</div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </nav>
  )
}
