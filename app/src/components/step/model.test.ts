import { describe, expect, it } from 'vitest'
import { parseLesson } from '../../lesson/parse'
import { findChoice, quizTotal, recallText, resultText, splitActs, splitParagraphs, stepTitle } from './model'
import { StepEngine } from './runtime'

const lesson = (body: string) => splitActs(parseLesson(`---\nid: t\n---\n${body}`).blocks)

describe('splitParagraphs', () => {
  it('splits on blank lines and ignores blank lines inside a fence', () => {
    expect(splitParagraphs('一\n\n二\n三\n\n\n四')).toEqual(['一', '二\n三', '四'])
    expect(splitParagraphs('前\n\n```js\na\n\nb\n```\n\n后')).toEqual(['前', '```js\na\n\nb\n```', '后'])
  })
})

describe('splitActs', () => {
  const src = `开场白第一段。

开场白第二段。

<Param name="beat" hidden value={0} />

<Act title="第一幕" />

<Step title="甲" play={1} frame="pic" />

第一句。

<Sim title="s" duration={1}>
sim({ at(t) { return {} }, draw() {} })
</Sim>

第二句。

第三句。

<Choice name="g1" predict options={[{ text: "x", say: "s", check: "c" }, { text: "y", say: "s", check: "c" }]} />

<Step title="乙" />

<Stem text="先于句子" />

只有一句。

<Act title="小测" quiz />

<Step title="丙" />

<Choice options={[{ text: "x", correct: true, say: "s" }, { text: "y", say: "s" }]} />
`
  const m = lesson(src)

  it('puts what comes before the first Act into the opening', () => {
    expect(m.opening.map((b) => b.kind)).toEqual(['markdown', 'component'])
    const first = m.opening[0]
    expect(first.kind === 'markdown' && first.text).toContain('开场白第二段')
  })

  it('cuts acts and steps and reads their attributes', () => {
    expect(m.acts.map((a) => [a.title, a.quiz, a.steps.length])).toEqual([
      ['第一幕', false, 2],
      ['小测', true, 1],
    ])
    const s = m.acts[0].steps[0]
    expect([s.title, s.play, s.frame]).toEqual(['甲', 1, 'pic'])
  })

  it('counts a sentence per paragraph, across the markdown blocks a component splits', () => {
    const s = m.acts[0].steps[0]
    expect(s.sentences.map((x) => x.kind === 'text' && x.text)).toEqual(['第一句。', '第二句。', '第三句。'])
  })

  it('gives a component the number of the last sentence before it', () => {
    const s = m.acts[0].steps[0]
    expect(s.comps.map((c) => [c.block.name, c.at])).toEqual([
      ['Sim', 0],
      ['Choice', 2],
    ])
  })

  it('puts a component written before the first sentence at 0', () => {
    const s = m.acts[0].steps[1]
    expect(s.comps.map((c) => [c.block.name, c.at])).toEqual([['Stem', 0]])
    expect(s.sentences).toHaveLength(1)
  })

  it('counts a step with no prose as no sentences, its component at 0', () => {
    const s = m.acts[1].steps[0]
    expect(s.sentences).toHaveLength(0)
    expect(s.comps[0].at).toBe(0)
  })

  it('counts a Recall as one sentence in writing order', () => {
    const r = lesson(`<Act title="a" />\n\n<Step title="s" />\n\n甲。\n\n<Recall choice="g1" />\n\n<Fill rows={[{ name: "n", text: "t" }]} />\n\n乙。`)
    const s = r.acts[0].steps[0]
    expect(s.sentences).toEqual([
      { kind: 'text', text: '甲。' },
      { kind: 'recall', choice: 'g1' },
      { kind: 'text', text: '乙。' },
    ])
    expect(s.comps.map((c) => [c.block.name, c.at])).toEqual([['Fill', 1]])
  })

  it('gives each step its own sentences', () => {
    const r = lesson(`<Act title="a" />\n\n<Step title="s1" />\n\n一。\n\n二。\n\n<Step title="s2" />\n\n三。`)
    expect(r.acts[0].steps.map((s) => s.sentences.length)).toEqual([2, 1])
  })

  it('keeps blank lines in a fenced block inside one sentence', () => {
    const r = lesson('<Act title="a" />\n\n<Step title="s" />\n\n前。\n\n```text\nx\n\ny\n```\n\n后。')
    expect(r.acts[0].steps[0].sentences).toHaveLength(3)
  })
})

describe('titles and totals', () => {
  const m = lesson(`<Act title="小测" quiz />

<Step title="一" />

<Choice options={[{ text: "x", correct: true, say: "s" }, { text: "y", say: "s" }]} />

<Step title="讲评" />

讲一句。

<Step title="二" />

<Choice options={[{ text: "x", correct: true, say: "s" }, { text: "y", say: "s" }]} />

<Step title="结果" />

<Result goals={[]} />
`)
  it('prefixes steps that hold a Choice in a quiz act', () => {
    const act = m.acts[0]
    expect([0, 1, 2, 3].map((i) => stepTitle(act, i))).toEqual(['小测 1 / 2：一', '讲评', '小测 2 / 2：二', '结果'])
  })
  it('counts the quiz questions', () => {
    expect(quizTotal(m.acts)).toBe(2)
  })
})

describe('recall and result texts', () => {
  const blocks = parseLesson(
    `<Choice name="g1" predict options={[{ text: "变大", say: "s", check: "实测变小。" }, { text: "变小", correct: true, say: "s", check: "实测确实变小。" }]} />`,
  ).blocks
  const choice = findChoice(blocks, 'g1')
  it('says the guess was right and adds its check', () => {
    expect(recallText(choice, 1)).toBe('你猜的是「变小」，猜对了。实测确实变小。')
  })
  it('says the guess and its check when it was wrong', () => {
    expect(recallText(choice, 0)).toBe('你猜的是「变大」。实测变小。')
  })
  it('says only the check of the correct option when nothing was picked', () => {
    expect(recallText(choice, undefined)).toBe('实测确实变小。')
    expect(recallText(undefined, 0)).toBe('')
  })
  it('fills in {n} and {total} and picks all or some', () => {
    const r = parseLesson(`<Result goals={[]} say={{ all: "全对 {n}/{total}", some: "对了 {n}/{total}" }} />`).blocks[0]
    if (r.kind !== 'component') throw new Error('no component')
    expect(resultText(r, { n: 3, total: 3 })).toBe('全对 3/3')
    expect(resultText(r, { n: 1, total: 3 })).toBe('对了 1/3')
  })
})

describe('StepEngine', () => {
  const make = () => {
    const e = new StepEngine([3, 2], 2)
    let t = 1000
    e.now = () => t
    return { e, tick: (ms: number) => (t += ms) }
  }

  it('walks sentences, steps, and ends at the done page; back goes the other way', () => {
    const { e } = make()
    expect(e.pos.phase).toBe('cover')
    e.advance()
    expect([e.pos.phase, e.pos.step, e.pos.beat]).toEqual(['step', 0, 0])
    e.advance()
    e.advance()
    expect(e.pos.beat).toBe(2)
    e.advance()
    expect([e.pos.step, e.pos.beat]).toEqual([1, 0])
    e.advance()
    e.advance()
    expect(e.pos.phase).toBe('done')
    e.back()
    expect([e.pos.phase, e.pos.step, e.pos.beat]).toEqual(['step', 1, 1])
    e.back()
    e.back()
    expect([e.pos.step, e.pos.beat]).toEqual([0, 2])
  })

  it('bumps the epoch on every step entered', () => {
    const { e } = make()
    e.advance()
    const a = e.pos.epoch
    e.advance()
    expect(e.pos.epoch).toBe(a)
    e.advance()
    e.advance()
    expect(e.pos.epoch).toBe(a + 1)
    e.back()
    expect(e.pos.epoch).toBe(a + 2)
  })

  it('is stopped by a stop at the current sentence until it is resolved', () => {
    const { e } = make()
    e.start()
    const stop = e.registerStop(e.stepKey, 'c', 1)
    expect(e.advance()).toBe(true) // sentence 0 -> 1
    expect(e.advance()).toBe(false)
    expect(e.pos.beat).toBe(1)
    expect(e.mainButton()).toEqual({ label: '提交', disabled: true })
    stop.setSubmit(() => {})
    expect(e.mainButton()).toEqual({ label: '提交', disabled: false })
    stop.resolve()
    expect(e.mainButton()).toEqual({ label: '继续', disabled: false })
    expect(e.advance()).toBe(true)
    expect(e.pos.beat).toBe(2)
  })

  it('does not let a stop at a later sentence block earlier ones, and a gate with no options reads 继续', () => {
    const { e } = make()
    e.start()
    e.registerStop(e.stepKey, 'lab', 2, { gate: true })
    expect(e.mainButton()).toEqual({ label: '继续', disabled: false })
    e.advance()
    e.advance()
    expect(e.mainButton()).toEqual({ label: '继续', disabled: true })
  })

  it('submits through the main button, then holds 400 ms', () => {
    const { e, tick } = make()
    e.start()
    const stop = e.registerStop(e.stepKey, 'c', 0)
    let submitted = 0
    stop.setSubmit(() => {
      submitted++
      stop.resolve()
    })
    e.pressMain()
    expect(submitted).toBe(1)
    expect(e.held()).toBe(true)
    e.pressMain()
    e.pressRight()
    expect(e.pos.beat).toBe(0)
    tick(401)
    e.pressRight()
    expect(e.pos.beat).toBe(1)
  })

  it('keeps a resolved stop resolved when the step is entered again', () => {
    const { e } = make()
    e.start()
    const stop = e.registerStop(e.stepKey, 'c', 2)
    e.advance()
    e.advance()
    stop.resolve()
    e.advance()
    e.advance()
    e.back()
    e.back()
    expect([e.pos.step, e.pos.beat]).toEqual([0, 2])
    const again = e.registerStop(e.stepKey, 'c', 2)
    expect(again.resolved).toBe(true)
    expect(e.advance()).toBe(true)
  })

  it('shows feedback as the step goes and drops it when the step is left', () => {
    const { e } = make()
    e.start()
    e.say(['对！', '因为……'])
    e.me('我选「甲」')
    expect(e.entries().map((x) => [x.type, x.beat])).toEqual([
      ['say', 0],
      ['me', 0],
    ])
    e.advance()
    e.advance()
    e.advance()
    expect(e.entries()).toEqual([])
  })

  it('records predictions for the whole lesson and only the first quiz answer', () => {
    const { e } = make()
    e.setPredict('g1', 2)
    e.start()
    e.advance()
    e.advance()
    e.advance()
    expect(e.getPredict('g1')).toBe(2)
    e.recordQuiz('q1', false)
    e.recordQuiz('q1', true)
    e.recordQuiz('q2', true)
    expect(e.quizScore()).toEqual({ n: 1, total: 2 })
  })

  it('ignores calls from a step that is no longer on screen', () => {
    const { e } = make()
    e.start()
    const old = e.runtimeFor(e.pos.epoch, '0')
    e.advance()
    e.advance()
    e.advance()
    old.say(['迟到的反馈'])
    expect(e.entries()).toEqual([])
  })
})
