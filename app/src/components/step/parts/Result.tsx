import { useEffect, useRef } from 'react'
import type { StepComponent } from '../registry'
import { resultText } from '../model'
import { useStepRuntime } from '../runtime'
import { str } from './common'

/** 每道小测题的第一次作答结果记在预测表里（runtime 没有按题的接口）：键 `quiz:N`，1 = 答对，0 = 答错。 */
export const quizKey = (qno: number) => `__quiz:${qno}`

/** 小测结果（5.15）。runtime 没有跳到某一幕的接口，所以"回第 N 幕再看"现在只是文字提示，不是按钮。
 * 得分 n / total，每个目标一行，答错的目标给"回第 N 幕再看"；讲述栏说一次 say.all / say.some。 */
export const Result: StepComponent = ({ block }) => {
  const rt = useStepRuntime()
  const said = useRef(false)
  const score = rt?.quizScore() ?? { n: 0, total: 0 }
  const prose = block.props._prose === true
  useEffect(() => {
    // A step with no prose gets this same text from the player's own narration; saying it too would double it.
    if (!rt || said.current || !prose) return
    said.current = true
    const t = resultText(block, rt.quizScore())
    if (t) rt.say([t])
  }, [rt, block, prose])
  const goals = (Array.isArray(block.props.goals) ? block.props.goals : []).filter((g): g is Record<string, unknown> => !!g && typeof g === 'object')
  return (
    <div className="tx-score" data-testid="result">
      <div className="tx-score-big" data-testid="score">
        {score.n} / {score.total}
      </div>
      <div className="tx-score-rows">
        {goals.map((g, i) => {
          const items = (Array.isArray(g.items) ? g.items : []).filter((x): x is number => typeof x === 'number')
          const wrong = items.some((q) => rt?.getPredict(quizKey(q)) !== 1)
          const back = typeof g.back === 'number' ? g.back : undefined
          return (
            <div className={`tx-score-row${wrong ? ' wrong' : ' right'}`} key={i}>
              <span>{str(g.title)}</span>
              {wrong && back !== undefined ? (
                <span className="tx-back">回第 {back} 幕再看</span>
              ) : (
                <span className="tx-score-ok">{wrong ? '' : '✓'}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
