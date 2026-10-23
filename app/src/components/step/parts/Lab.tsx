import { useLayoutEffect, useReducer } from 'react'
import { num, type Scope } from '../../../lesson/expr'
import { namesIn, useScopeFor, useStore } from '../../../lesson/store'
import { Rich } from '../../rich'
import type { ComponentBlock } from '../model'
import type { StepComponent } from '../registry'
import { useStepRuntime, useStop } from '../runtime'
import { str } from './common'

interface Run {
  label: string
  set: Record<string, unknown>
}
interface Column {
  label: string
  expr: string
  digits?: number
}

const objs = (v: unknown): Record<string, unknown>[] => (Array.isArray(v) ? v.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)) : [])

export function labSpec(block: ComponentBlock) {
  const runs: Run[] = objs(block.props.runs).map((r) => ({
    label: str(r.label),
    set: r.set && typeof r.set === 'object' ? (r.set as Record<string, unknown>) : {},
  }))
  const columns: Column[] = objs(block.props.columns).map((c) => ({
    label: str(c.label),
    expr: str(c.expr),
    digits: typeof c.digits === 'number' ? c.digits : undefined,
  }))
  const first = Array.isArray(block.props.first) ? block.props.first.map((x) => String(x)) : undefined
  const need = typeof block.props.need === 'number' ? Math.min(Math.max(Math.round(block.props.need), 1), Math.max(runs.length, 1)) : runs.length
  return { runs, columns, first, need, filled: block.props.filled === true }
}

/** One table row's numbers, formatted: each column's expression under `scope`. A column that does not evaluate reads "—". */
export function labCells(columns: Column[], scope: Scope): string[] {
  return columns.map((c) => {
    const v = num(c.expr, scope, NaN)
    return Number.isFinite(v) ? v.toFixed(Math.min(Math.max(c.digits ?? 3, 0), 12)) : '—'
  })
}

/** The parameter values of a run, with expressions evaluated against `scope`. */
export function runPatch(run: Run, scope: Scope): Record<string, number> {
  return Object.fromEntries(Object.entries(run.set).map(([k, v]) => [k, num(v, scope)]))
}

interface Row {
  label: string
  cells: string[]
}

function Table({ columns, first, rows, fresh }: { columns: Column[]; first?: string[]; rows: Row[]; fresh?: number }) {
  return (
    <div className="il-table-wrap">
      <table className="il-dt" data-testid="lab-table">
        <thead>
          <tr>
            <th>条件</th>
            {columns.map((c, i) => (
              <th key={i}>
                <Rich text={c.label} html />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {first && (
            <tr data-row="first">
              {Array.from({ length: columns.length + 1 }, (_, i) => (
                <td key={i}>{first[i] ?? ''}</td>
              ))}
            </tr>
          )}
          {rows.map((r, i) => (
            <tr key={r.label} className={i === fresh ? 'in' : undefined} data-row={r.label}>
              <td>
                <Rich text={r.label} html />
              </td>
              {r.cells.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** `<Lab filled />`: the table is full from the start, one row per run, each worked out with that run's parameters. No buttons, no stop. */
function LabFilled({ block }: { block: ComponentBlock }) {
  const store = useStore()
  const { runs, columns, first } = labSpec(block)
  const base = useScopeFor(namesIn(columns.map((c) => c.expr)))
  const rows = runs.map((r) => ({ label: r.label, cells: labCells(columns, store.scopeWith(runPatch(r, base))) }))
  return (
    <div className="il-lab" data-testid="lab">
      <Table columns={columns} first={first} rows={rows} />
    </div>
  )
}

interface Mem {
  sel: number | null
  /** Run indexes in the order they were done, and the table row each one made. */
  done: number[]
  rows: Record<number, string[]>
}

function LabLive({ block, at }: { block: ComponentBlock; at: number }) {
  const rt = useStepRuntime()
  const store = useStore()
  const stop = useStop(String(block.line), at, { gate: true })
  const { runs, columns, first, need } = labSpec(block)
  const mem = rt ? rt.keep<Mem>(`lab${block.line}`, () => ({ sel: null, done: [], rows: {} })) : null
  const [, bump] = useReducer((x: number) => x + 1, 0)

  // Back on a step the student already got past: the table is full.
  useLayoutEffect(() => {
    if (!stop?.resolved || !mem || mem.done.length >= need) return
    const base = store.getScope()
    runs.forEach((r, i) => {
      if (!mem.rows[i]) mem.rows[i] = labCells(columns, store.scopeWith(runPatch(r, base)))
      if (!mem.done.includes(i)) mem.done.push(i)
    })
    bump()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop])

  if (!rt || !stop || !mem) return null

  const run = () => {
    const i = mem.sel
    if (i === null || !runs[i]) return
    const r = runs[i]
    // Set the parameters first: the row is worked out from the scene the student is about to see.
    store.set(runPatch(r, store.getScope()))
    const cells = labCells(columns, store.getScope())
    const fresh = !mem.done.includes(i)
    if (fresh) {
      mem.done = [...mem.done, i]
      mem.rows[i] = cells
    }
    bump()
    rt.me(`我试：${r.label}`)
    const full = mem.done.length >= need
    if (full) {
      stop.resolve()
      if (fresh) rt.say(['做够了，可以继续。'])
    } else if (fresh) {
      const left = runs.filter((_, k) => !mem.done.includes(k)).map((x) => x.label)
      rt.say([`还有${left.join('、')}没做。`])
    }
    // Last: the scenes remount and play from the start; this runtime is dead after it.
    rt.replay()
  }
  const pick = (i: number) => {
    mem.sel = i
    bump()
  }

  const rows = mem.done.map((i) => ({ label: runs[i].label, cells: mem.rows[i] }))
  return (
    <div className="il-lab" data-testid="lab">
      <div>
        <div className="il-lab-t">条件</div>
        <div className="il-chips" role="group" aria-label="实验条件">
          {runs.map((r, i) => (
            <button key={i} type="button" className={`il-chip${mem.sel === i ? ' on' : ''}`} aria-pressed={mem.sel === i} onClick={() => pick(i)}>
              <span>
                <Rich text={r.label} html />
              </span>
              {mem.done.includes(i) && (
                <span className="il-chip-ok" aria-label="已做">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <button type="button" className="il-run" disabled={mem.sel === null} onClick={run}>
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M3 1.8v8.4L10 6z" fill="currentColor" />
        </svg>
        做一次
      </button>
      <Table columns={columns} first={first} rows={rows} fresh={rows.length - 1} />
      <div className="il-count">
        已做 {Math.min(mem.done.length, need)} / {need} 种
      </div>
    </div>
  )
}

/**
 * 实验（停点；带 filled 时不是）。点条件只是选中；点"做一次"→ 按 set 设参数 → 画面从头播 → 表里加一行（同一条件不重复加）→
 * 讲述栏出"我试：…"。做满 need 种放行。filled 时表一开始就按 runs 全部算好。
 */
export const Lab: StepComponent = ({ block, at }) => (labSpec(block).filled ? <LabFilled block={block} /> : <LabLive block={block} at={at} />)
