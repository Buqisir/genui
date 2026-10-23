import type { StepComponent } from '../registry'
import { Md, str } from './common'

/** 作业（5.15）：每题题号标签、题干，答案折叠，点开看。 */
export const Homework: StepComponent = ({ block }) => {
  const items = (Array.isArray(block.props.items) ? block.props.items : []).filter((x): x is Record<string, unknown> => !!x && typeof x === 'object')
  return (
    <div className="tx-hw" data-testid="homework">
      {items.map((it, i) => (
        <div className="tx-hw-i" key={i}>
          {str(it.tag) && <div className="tx-hw-t">{str(it.tag)}</div>}
          <Md text={it.q} className="tx-hw-q" />
          {str(it.a) && (
            <details className="tx-hw-a">
              <summary>看答案</summary>
              <Md text={it.a} />
            </details>
          )}
        </div>
      ))}
    </div>
  )
}
