import type { StepComponent } from '../registry'
import { useStepRuntime } from '../runtime'
import { clamp, Md, str } from './common'

type Line = { eq: unknown; note?: unknown }
const asLine = (l: unknown): Line =>
  Array.isArray(l) ? { eq: l[0], note: l[1] } : l && typeof l === 'object' ? (l as Line) : { eq: l }
const asList = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])

/**
 * 演算（5.11）。lines：从 `at` 句起一句出一行，最新一行 ink、旧行 graphite；
 * blocks：一句出一块，最后一块是结论框。没出现的行、块占位不显示，板上的东西不跳。
 */
export const Work: StepComponent = ({ block, at }) => {
  const rt = useStepRuntime()
  const reached = (rt?.beat ?? Infinity) - at + 1
  const label = str(block.props.label)
  const blocks = asList(block.props.blocks)
  const body =
    blocks.length > 0 ? (
      <div className="tx-bks">
        {blocks.map((raw, i) => {
          const b = (raw && typeof raw === 'object' ? raw : {}) as { title?: unknown; lines?: unknown; note?: unknown }
          const on = i < clamp(reached, blocks.length)
          return (
            <div className={`tx-bk${i === blocks.length - 1 ? ' res' : ''}${on ? ' on' : ''}`} style={on ? undefined : { visibility: 'hidden' }} key={i} data-testid="work-block">
              {str(b.title) && <div className="tx-bk-t">{str(b.title)}</div>}
              {asList(b.lines).map(asLine).map((l, j) => (
                <div className="tx-bk-l" key={j}>
                  <Md text={l.eq} className="tx-bk-eq" />
                  {str(l.note) && <Md text={l.note} className="tx-note" />}
                </div>
              ))}
              {str(b.note) && <Md text={b.note} className="tx-bk-s" />}
            </div>
          )
        })}
      </div>
    ) : (
      <div className="tx-wk">
        {asList(block.props.lines).map(asLine).map((l, i, all) => {
          const n = clamp(reached, all.length)
          const on = i < n
          return (
            <div className={`tx-wk-line${on ? ' on' : ''}${i === n - 1 ? ' last' : ''}`} style={on ? undefined : { visibility: 'hidden' }} key={i} data-testid="work-line">
              <Md text={l.eq} className="tx-wk-eq" />
              {str(l.note) && <Md text={l.note} className="tx-note" />}
            </div>
          )
        })}
      </div>
    )
  return (
    <div className="tx-work">
      {label && <div className="tx-label">{label}</div>}
      {body}
    </div>
  )
}
