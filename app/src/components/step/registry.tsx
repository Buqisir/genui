import { useEffect, useState, type ReactNode } from 'react'
import { choiceOptions, type ComponentBlock } from './model'
import { useStepRuntime, useStop } from './runtime'

/**
 * Step components (Choice, Fill, Lab, Stem, …) register here. StepLesson looks a component up by name
 * first; a name that is not registered gets a placeholder box (see `StepPlaceholder`).
 * `at` is the sentence the component appears at: it is on the board from that sentence on.
 */
export type StepComponent = (p: { block: ComponentBlock; at: number }) => ReactNode
export const STEP_COMPONENTS: Record<string, StepComponent> = {}

/** Names that only exist inside a step lesson: they never go to LessonView's renderComponent. */
export const STEP_ONLY_NAMES = new Set(['Stem', 'Choice', 'Recall', 'Work', 'Def', 'Fill', 'Lab', 'Conclude', 'Result', 'Homework'])

const SHOWN_KEYS = ['title', 'text', 'ask', 'label', 'name', 'predict', 'choice', 'need', 'filled', 'follow']

function summary(block: ComponentBlock): string {
  const parts: string[] = []
  for (const k of SHOWN_KEYS) {
    const v = block.props[k]
    if (typeof v === 'string') parts.push(`${k}="${v.length > 40 ? v.slice(0, 40) + '…' : v}"`)
    else if (typeof v === 'number' || typeof v === 'boolean') parts.push(`${k}=${v}`)
  }
  for (const [k, v] of Object.entries(block.props)) if (Array.isArray(v)) parts.push(`${k}×${v.length}`)
  return parts.join(' ')
}

const lines = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : typeof v === 'string' ? [v] : [])

/** Stand-in for a step component that is not written yet: name, key props, and where it sits. */
export function StepPlaceholder({ block, at }: { block: ComponentBlock; at: number }) {
  return (
    <div className="sl-ph" data-comp={block.name}>
      <div className="sl-ph-head">
        <b>{block.name}</b>
        <span>第 {at} 句起出现</span>
      </div>
      <div className="sl-ph-props">{summary(block) || '（没有属性）'}</div>
      {block.name === 'Choice' && <ChoicePlaceholder block={block} at={at} />}
      {block.name === 'Result' && <ResultPlaceholder block={block} />}
    </div>
  )
}

function ResultPlaceholder({ block }: { block: ComponentBlock }) {
  const rt = useStepRuntime()
  const score = rt?.quizScore()
  const goals = Array.isArray(block.props.goals) ? (block.props.goals as { title?: unknown }[]) : []
  return (
    <div className="sl-ph-body">
      {score && (
        <div data-testid="score">
          得分 {score.n} / {score.total}
        </div>
      )}
      {goals.map((g, i) => (
        <div key={i}>目标：{String(g.title ?? '')}</div>
      ))}
    </div>
  )
}

/**
 * Just enough of a Choice to drive the player: pick an option (the main button turns into 提交), submit it,
 * a predict choice locks and records the pick, a quiz choice records its first answer. The real component replaces this.
 */
function ChoicePlaceholder({ block, at }: { block: ComponentBlock; at: number }) {
  const rt = useStepRuntime()
  const stop = useStop(String(block.line), at)
  const opts = choiceOptions(block)
  const predict = block.props.predict === true
  const name = typeof block.props.name === 'string' ? block.props.name : ''
  const [sel, setSel] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (stop?.resolved) setDone(true)
  }, [stop])
  if (!rt || !stop) return null
  const submit = (i: number) => {
    const o = opts[i]
    rt.markSubmitted()
    rt.me(`我选「${String(o.text ?? '')}」`)
    const said = lines(o.say)
    if (predict) {
      if (name) rt.setPredict(name, i)
      if (said.length) rt.say(said)
      stop.resolve()
      setDone(true)
    } else if (o.correct === true) {
      rt.recordQuiz(`${rt.stepKey}#${block.line}`, true)
      if (said.length) rt.say(said)
      stop.resolve()
      setDone(true)
    } else {
      rt.recordQuiz(`${rt.stepKey}#${block.line}`, false)
      if (said.length) rt.say(said)
      setSel(null)
      stop.setSubmit(null)
    }
  }
  const pick = (i: number) => {
    setSel(i)
    stop.setSubmit(() => submit(i))
  }
  const correct = Math.max(
    opts.findIndex((o) => o.correct === true),
    0,
  )
  return (
    <div className="sl-ph-body">
      {typeof block.props.ask === 'string' && <div>{block.props.ask}</div>}
      <div className="sl-ph-opts">
        {opts.map((o, i) => (
          <button key={i} type="button" className={`opt${sel === i ? ' sel' : ''}`} disabled={done} onClick={() => pick(i)}>
            {String.fromCharCode(65 + i)}　{String(o.text ?? '')}
          </button>
        ))}
      </div>
      <button type="button" className="sl-ph-sim" disabled={done} onClick={() => submit(predict ? 0 : correct)}>
        模拟答对
      </button>
      {done && <span className="sl-ph-done">{predict ? '已锁定' : '已答对'}</span>}
    </div>
  )
}
