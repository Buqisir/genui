import { Fragment, useLayoutEffect, useReducer } from 'react'
import { Rich } from '../../rich'
import type { StepComponent } from '../registry'
import { useStepRuntime, useStop } from '../runtime'
import { str, strList } from './common'

export type Seg = { t: 'text'; s: string } | { t: 'blank'; k: number }
export interface FillRow {
  name: string
  note: string
  segs: Seg[]
}
export interface FillBlank {
  answer: string
  /** answer first, then the distractors: the order `say` and `hints` follow */
  opts: string[]
}

/** A blank is `{答案|干扰1|干扰2}`; braces with no `|` (a formula's subscript) stay text. */
const BLANK = /\{([^{}|]*(?:\|[^{}|]*)+)\}/g

/** Cut every row's text at its blanks. Blanks are numbered through all rows in reading order. */
export function parseFill(rows: unknown): { rows: FillRow[]; blanks: FillBlank[] } {
  const blanks: FillBlank[] = []
  const out: FillRow[] = (Array.isArray(rows) ? rows : [])
    .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
    .map((r) => {
      const text = str(r.text)
      const segs: Seg[] = []
      let last = 0
      for (const m of text.matchAll(BLANK)) {
        if (m.index > last) segs.push({ t: 'text', s: text.slice(last, m.index) })
        const opts = m[1].split('|').map((x) => x.trim())
        segs.push({ t: 'blank', k: blanks.length })
        blanks.push({ answer: opts[0], opts })
        last = m.index + m[0].length
      }
      if (last < text.length) segs.push({ t: 'text', s: text.slice(last) })
      return { name: str(r.name), note: str(r.note), segs }
    })
  return { rows: out, blanks }
}

/** mulberry32: a small seeded random generator, so the same lesson shuffles the same way every time. */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** The display order of `n` options (indexes into the original order), seeded; never the identity when n > 1, so the answer is not always on top. */
export function shuffleOrder(n: number, seed: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i)
  const rand = rng(seed)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  if (n > 1 && order.every((v, i) => v === i)) order.push(order.shift()!)
  return order
}

const groups = (v: unknown): string[][] => (Array.isArray(v) ? v.map((g) => strList(g)) : [])

interface Mem {
  /** the blank being asked; = blanks.length when all are filled */
  k: number
  sel: number | null
  /** option indexes (original order) answered wrong, per blank */
  lose: Record<number, number[]>
  hints: Record<number, number>
}

/**
 * 补全（停点）。结论卡从第一句起整张显示，关键词挖成空；一次只问一个空，选项稳定打乱（用块的行号做种子）。
 * 答对：卡里填上、这一组收成一行；答错：讲述栏说对应的反馈。全部答完放行。
 */
export const Fill: StepComponent = ({ block, at }) => {
  const rt = useStepRuntime()
  const stop = useStop(String(block.line), at)
  const { rows, blanks } = parseFill(block.props.rows)
  const say = groups(block.props.say)
  const hints = groups(block.props.hints)
  const mask = strList(block.props.mask)
  const n = blanks.length
  const mem = rt ? rt.keep<Mem>(`fill${block.line}`, () => ({ k: 0, sel: null, lose: {}, hints: {} })) : null
  const [, bump] = useReducer((x: number) => x + 1, 0)
  const register = rt?.registerMask
  const maskKey = mask.join('\n')

  useLayoutEffect(() => {
    if (register && mask.length) register(String(block.line), mask)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [register, maskKey, block.line])

  // Back on a step the student already got past: every blank is filled.
  useLayoutEffect(() => {
    if (!stop?.resolved || !mem || mem.k >= n) return
    mem.k = n
    mem.sel = null
    bump()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop])

  // Nothing to fill: nothing to wait for.
  useLayoutEffect(() => {
    if (n === 0) stop?.resolve()
  }, [n, stop])

  if (!rt || !stop || !mem) return null
  const finished = mem.k >= n
  const k = Math.min(mem.k, n - 1)
  const cur = !finished ? blanks[k] : null
  const order = (i: number) => shuffleOrder(blanks[i].opts.length, block.line * 7919 + i * 104729 + 1)

  const submit = (idx: number) => {
    if (mem.k >= n) return
    const kk = mem.k
    const b = blanks[kk]
    const ok = idx === 0
    rt.me(`我选「${b.opts[idx]}」`)
    const said = say[kk]?.[idx]
    rt.say([said || (ok ? `对，是「${b.answer}」。` : '不对，再想想。')])
    if (ok) {
      mem.k = kk + 1
      mem.sel = null
      if (mem.k >= n) stop.resolve()
      else stop.setSubmit(null)
    } else {
      mem.lose[kk] = [...(mem.lose[kk] ?? []), idx]
      mem.sel = null
      stop.setSubmit(null)
    }
    bump()
  }
  const pick = (idx: number) => {
    if (mem.k >= n || (mem.lose[mem.k] ?? []).includes(idx)) return
    mem.sel = idx
    stop.setSubmit(() => submit(idx))
    bump()
  }
  const hint = () => {
    const list = hints[mem.k] ?? []
    const lvl = mem.hints[mem.k] ?? 0
    if (lvl >= list.length) return
    rt.say([list[lvl]])
    mem.hints[mem.k] = lvl + 1
    bump()
  }

  const hintLeft = !finished && (hints[k]?.length ?? 0) > (mem.hints[k] ?? 0)
  return (
    <div className="il-fill" data-testid="fill">
      <div className="il-card">
        {rows.map((r, ri) => (
          <div className="il-row" key={ri}>
            <b className="il-row-name">
              <Rich text={r.name} html />
            </b>
            <div className="il-row-body">
              {r.segs.map((s, si) =>
                s.t === 'text' ? (
                  <Fragment key={si}>
                    <Rich text={s.s} html />
                  </Fragment>
                ) : (
                  <span key={si} className={`il-blank${s.k < mem.k ? ' done' : s.k === mem.k ? ' cur' : ''}`} data-blank={s.k} aria-label={s.k < mem.k ? blanks[s.k].answer : `第 ${s.k + 1} 空`}>
                    {s.k < mem.k ? blanks[s.k].answer : ' '}
                  </span>
                ),
              )}
              {r.note && (
                <div className="il-row-note">
                  <Rich text={r.note} html />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {blanks.slice(0, mem.k).map((b, i) => (
        <div className="il-ans" key={i} data-testid="fill-ans">
          第 {i + 1} 空：{b.answer} ✓
        </div>
      ))}
      {cur && (
        <div>
          <div className="il-group-t">
            第 {k + 1} 空{n > 1 ? `（共 ${n} 空）` : ''}
          </div>
          <div className="il-opts" role="group" aria-label={`第 ${k + 1} 空的选项`}>
            {order(k).map((idx) => {
              const lost = (mem.lose[k] ?? []).includes(idx)
              return (
                <button key={idx} type="button" className={`il-opt${mem.sel === idx ? ' sel' : ''}${lost ? ' lose' : ''}`} aria-pressed={mem.sel === idx} disabled={lost} onClick={() => pick(idx)}>
                  <span className="il-opt-t">
                    <Rich text={cur.opts[idx]} html />
                  </span>
                  <span className="il-opt-mark" aria-hidden="true">
                    {lost ? '✕' : ''}
                  </span>
                </button>
              )
            })}
          </div>
          {hintLeft && (
            <button type="button" className="il-txt-btn" onClick={hint}>
              提示
            </button>
          )}
        </div>
      )}
    </div>
  )
}
