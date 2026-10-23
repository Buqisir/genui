import type { StepComponent } from '../registry'
import { Md, str } from './common'

/** 题干卡（板面规格 5.9）：小标题、题干、问句（600 字重，接在最后）。 */
export const Stem: StepComponent = ({ block }) => {
  const label = str(block.props.label)
  const text = str(block.props.text)
  const ask = str(block.props.ask)
  return (
    <div className="tx-card tx-stem" data-testid="stem">
      {label && <div className="tx-label">{label}</div>}
      {text && <Md text={text} />}
      {ask && <Md text={ask} className="tx-ask" />}
    </div>
  )
}
