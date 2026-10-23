import type { CSSProperties } from 'react'
import type { StepComponent } from '../registry'
import { useStepRuntime } from '../runtime'
import { Md, str } from './common'
import type { DefRow } from '../model'

/**
 * 定义卡（5.12）。同一步里的多张 Def 已由 `splitActs`（model.ts 的 `mergeDefs`）并成第一张，每行带自己的
 * `at`（出现的句）、`follow`、`idx`：行从 `at` 起出现（之前占位不显示）；follow 的行从 `at + idx` 起亮，之前灰着。
 */
export const Def: StepComponent = ({ block, at }) => {
  const rt = useStepRuntime()
  const beat = rt?.beat ?? Infinity
  const follow = block.props.follow === true
  const rows = (Array.isArray(block.props.rows) ? block.props.rows : [])
    .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
    .map((r, idx): DefRow => ({ name: r.name, text: r.text, note: r.note, at: typeof r.at === 'number' ? r.at : at, follow: typeof r.follow === 'boolean' ? r.follow : follow, idx: typeof r.idx === 'number' ? r.idx : idx }))
  return (
    <div className="tx-card tx-def" data-testid="def">
      {rows.map((r, i) => {
        const shown = beat >= r.at
        const lit = !r.follow || beat >= r.at + r.idx
        const style: CSSProperties | undefined = shown ? undefined : { visibility: 'hidden' }
        return (
          <div className={`tx-def-row${lit ? '' : ' dim'}`} style={style} key={i} data-lit={lit ? 1 : 0} data-at={r.at}>
            <b className="tx-def-name">{str(r.name)}</b>
            <div className="tx-def-body">
              <Md text={r.text} />
              {str(r.note) && <Md text={r.note} className="tx-def-note" />}
            </div>
          </div>
        )
      })}
    </div>
  )
}
