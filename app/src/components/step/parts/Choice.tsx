import { useLayoutEffect, useRef, useState } from 'react'
import type { StepComponent } from '../registry'
import { choiceOptions } from '../model'
import { useStepRuntime, useStop } from '../runtime'
import { Md, str, strList } from './common'
import { quizKey } from './Result'

const HOLD = 400

interface State {
  sel: number | null
  lose: number[]
  win: number | null
  locked: number | null
  hints: number
  revealed: boolean
}
const FRESH: State = { sel: null, lose: [], win: null, locked: null, hints: 0, revealed: false }

/**
 * 选择题（5.10，交互 G5/G6）。点选项只是选中，主按钮变"提交"（stop.setSubmit）；提交后判：
 * 答错标 ✕、讲述栏说它的 say、可以重选，错两次揭晓正解；答对标 ✓、说 say、放行。
 * 预测题提交即锁定（"已锁定"），不判对错。小测幕里每题第一次作答计分。
 */
export const Choice: StepComponent = ({ block, at }) => {
  const rt = useStepRuntime()
  const stop = useStop(String(block.line), at)
  const opts = choiceOptions(block)
  const predict = block.props.predict === true
  const name = str(block.props.name)
  const quiz = block.props._quiz === true
  const qno = typeof block.props._qno === 'number' ? block.props._qno : 0
  const hasStem = block.props._stem === true
  const hints = (Array.isArray(block.props.hints) ? strList(block.props.hints) : []).slice(0, 3)
  const correctIdx = opts.findIndex((o) => o.correct === true)

  const [st, setSt] = useState<State>(FRESH)
  const live = useRef(st)
  live.current = st
  const update = (patch: Partial<State>) => {
    live.current = { ...live.current, ...patch }
    setSt(live.current)
  }
  const heldUntil = useRef(0)

  // Back on a step the student already got past: show the end state straight away.
  useLayoutEffect(() => {
    if (!stop?.resolved) return
    if (predict) update({ locked: name ? (rt?.getPredict(name) ?? null) : null })
    else update({ win: Math.max(correctIdx, 0) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop])

  if (!rt || !stop) return null
  const done = st.win !== null || (predict && (st.locked !== null || stop.resolved))

  const submit = (i: number) => {
    const o = opts[i]
    if (!o || done) return
    heldUntil.current = Date.now() + HOLD
    rt.markSubmitted()
    rt.me(`我选「${str(o.text)}」`)
    const said = strList(o.say)
    if (predict) {
      if (name) rt.setPredict(name, i)
      update({ locked: i, sel: null })
      if (said.length) rt.say(said)
      stop.resolve()
      return
    }
    const ok = o.correct === true
    if (quiz && qno && rt.getPredict(quizKey(qno)) === undefined) {
      rt.setPredict(quizKey(qno), ok ? 1 : 0)
      rt.recordQuiz(`${rt.stepKey}#${block.line}`, ok)
    }
    if (said.length) rt.say(said)
    if (ok) {
      update({ win: i, sel: null, revealed: false })
      stop.resolve()
      return
    }
    const lose = [...live.current.lose, i]
    const revealed = lose.length >= 2 && correctIdx >= 0
    update({ lose, sel: null, revealed })
    stop.setSubmit(null)
    if (revealed && hints.length) rt.say([hints[hints.length - 1]])
  }
  const pick = (i: number) => {
    const cur = live.current
    if (done || cur.lose.includes(i) || Date.now() < heldUntil.current) return
    update({ sel: i })
    stop.setSubmit(() => submit(i))
  }
  const hint = () => {
    const cur = live.current
    if (done || cur.revealed || cur.hints >= hints.length) return
    rt.say([hints[cur.hints]])
    update({ hints: cur.hints + 1 })
  }

  const label = str(block.props.label)
  const ask = str(block.props.ask)
  return (
    <div className="tx-choice" data-testid="choice">
      {label && <div className="tx-label">{label}</div>}
      {ask && !hasStem && <Md text={ask} className="tx-ask" />}
      <div className="tx-opts" role="group">
        {opts.map((o, i) => {
          const cls = ['tx-opt']
          let mark = ''
          if (st.win === i) (cls.push('win'), (mark = '✓'))
          else if (st.locked === i) (cls.push('on'), (mark = '已锁定'))
          else if (st.lose.includes(i)) (cls.push('lose'), (mark = '✕'))
          else if (st.revealed && correctIdx === i) (cls.push('reveal'), (mark = '答案'))
          if (st.sel === i) cls.push('sel')
          const off = done || st.lose.includes(i)
          if (off) cls.push('off')
          return (
            <button key={i} type="button" className={cls.join(' ')} aria-pressed={st.sel === i} aria-disabled={off} onClick={() => pick(i)}>
              <span className="tx-let" aria-hidden="true">
                {String.fromCharCode(65 + i)}
              </span>
              <Md text={o.text} className="tx-opt-t" />
              <span className="tx-mark" aria-hidden={!mark}>
                {mark}
              </span>
            </button>
          )
        })}
      </div>
      {hints.length > 0 && !done && !st.revealed && st.hints < hints.length && (
        <div className="tx-choice-foot">
          <button type="button" className="tx-txt-btn" onClick={hint}>
            提示
          </button>
        </div>
      )}
    </div>
  )
}
