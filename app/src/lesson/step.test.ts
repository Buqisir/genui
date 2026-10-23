import { describe, expect, it } from 'vitest'
import { validateLesson } from './validate'

const HEAD = '---\ndemo: true\ntitle: t\n---\n'
const BEAT = '<Param name="beat" hidden value={0} />\n'
const P = '<Param name="m1" label="质量" min={1} max={5} step={1} value={2} />\n'
const CH = '<Choice options={[{ text: "甲", correct: true, say: "对" }, { text: "乙", say: "错" }]} />\n'

/** A one-step lesson with `body` inside the step (the step gets one sentence of text). */
const step = (body: string, pre = '') => `${HEAD}${pre}<Act title="幕" />\n<Step title="一步" />\n\n先看。\n\n${body}\n`

function run(src: string) {
  const r = validateLesson(src)
  return { codes: [...r.errors, ...r.warnings].map((i) => i.code), errors: r.errors, warnings: r.warnings }
}
const errMsgs = (src: string) => validateLesson(src).errors.map((e) => e.message)
const warnMsgs = (src: string) => validateLesson(src).warnings.map((e) => e.message)
const hasCode = (src: string, code: string) => run(src).codes.includes(code)

describe('step lesson: a valid lesson', () => {
  it('has no errors', () => {
    const src = step(`<Stem text="题" ask="问？" />\n${CH}\n\n解答。\n\n<Work lines={[{ eq: "a = 1" }]} />`)
    expect(validateLesson(src).errors).toEqual([])
  })
})

describe('structure', () => {
  it('mixed-structure', () => {
    expect(hasCode(step('', '') + '<Segment title="s" />\n', 'mixed-structure')).toBe(true)
    expect(hasCode(step(''), 'mixed-structure')).toBe(false)
  })
  it('act-without-step', () => {
    expect(hasCode(`${HEAD}<Act title="幕" />\n\n文字\n\n<Step title="x" />\n`, 'act-without-step')).toBe(true)
    expect(hasCode(`${HEAD}<Act title="幕" />\n\n\n<Step title="x" />\n\n文字\n`, 'act-without-step')).toBe(false)
  })
  it('step-without-act', () => {
    expect(hasCode(`${HEAD}<Step title="x" />\n\n文字\n`, 'step-without-act')).toBe(true)
    expect(hasCode(step(''), 'step-without-act')).toBe(false)
  })
  it('outside-step', () => {
    expect(hasCode(`${HEAD}${CH}`, 'outside-step')).toBe(true)
    expect(hasCode(`${HEAD}<Act title="幕" />\n<Step title="x" />\n文\n`, 'outside-step')).toBe(false)
    expect(hasCode(step(CH), 'outside-step')).toBe(false)
    // An <Act> ends the previous step.
    expect(hasCode(step('') + `<Act title="二" />\n${CH}`, 'outside-step')).toBe(true)
  })
  it('Collision is allowed outside a step', () => {
    expect(hasCode(`${HEAD}<Collision m={[1, 2]} v={[1, 0]} after={[0, 1]} />`, 'outside-step')).toBe(false)
  })
  it('step-without-text', () => {
    expect(hasCode(`${HEAD}<Act title="幕" />\n<Step title="x" />\n${CH}`, 'step-without-text')).toBe(true)
    expect(hasCode(`${HEAD}<Act title="幕" />\n<Step title="x" />\n<Result goals={[{ title: "g", items: [1], back: 1 }]} />`, 'step-without-text')).toBe(false)
    expect(hasCode(step(''), 'step-without-text')).toBe(false)
  })
  it('sentence-too-long', () => {
    const long = '字'.repeat(61)
    expect(hasCode(`${HEAD}<Act title="幕" />\n<Step title="x" />\n\n${long}\n`, 'sentence-too-long')).toBe(true)
    expect(hasCode(`${HEAD}<Act title="幕" />\n<Step title="x" />\n\n${'字'.repeat(60)}\n\n${'字'.repeat(60)}\n`, 'sentence-too-long')).toBe(false)
    const choice = `<Choice options={[{ text: "甲", correct: true, say: ["${long}"] }, { text: "乙", say: "错" }]} />`
    expect(hasCode(step(choice), 'sentence-too-long')).toBe(true)
  })
  it('stem-without-ask', () => {
    expect(hasCode(step(`<Stem text="题" />\n${CH}`), 'stem-without-ask')).toBe(true)
    expect(hasCode(step(`<Stem text="题" ask="问？" />\n${CH}`), 'stem-without-ask')).toBe(false)
    expect(hasCode(step('<Stem text="题" />'), 'stem-without-ask')).toBe(false)
    expect(hasCode(`${HEAD}<Act title="幕" quiz />\n<Step title="x" />\n\n文\n\n<Stem text="题" />\n`, 'stem-without-ask')).toBe(true)
  })
})

describe('Step / Act / Stem', () => {
  it('Step title over 18 characters warns', () => {
    expect(warnMsgs(`${HEAD}<Act title="幕" />\n<Step title="${'字'.repeat(19)}" />\n文\n`).some((m) => m.includes('18'))).toBe(true)
    expect(warnMsgs(`${HEAD}<Act title="幕" />\n<Step title="${'字'.repeat(18)}" />\n文\n`).some((m) => m.includes('18'))).toBe(false)
  })
  it('Step play and frame', () => {
    const mk = (attrs: string) => `${HEAD}<Act title="幕" />\n<Step title="x" ${attrs} />\n文\n`
    expect(errMsgs(mk('play={-1}')).some((m) => m.includes('play'))).toBe(true)
    expect(errMsgs(mk('play={1.5}')).some((m) => m.includes('play'))).toBe(true)
    expect(errMsgs(mk('play={2}'))).toEqual([])
    expect(errMsgs(mk('frame="nope"')).some((m) => m.includes('frame'))).toBe(true)
    expect(errMsgs(mk('frame="lab"'))).toEqual([])
  })
  it('Stem ask over 40 characters warns', () => {
    expect(warnMsgs(step(`<Stem text="题" ask="${'问'.repeat(41)}" />`)).some((m) => m.includes('40'))).toBe(true)
    expect(warnMsgs(step(`<Stem text="题" ask="${'问'.repeat(40)}" />`)).some((m) => m.includes('40'))).toBe(false)
  })
})

describe('Choice', () => {
  const opt = (t: string, extra = '') => `{ text: "${t}", say: "好"${extra} }`
  const choice = (opts: string[], attrs = '') => step(`<Choice options={[${opts.join(', ')}]} ${attrs} />`)
  it('options 2 to 4', () => {
    expect(errMsgs(choice([opt('甲', ', correct: true')])).some((m) => m.includes('2–4'))).toBe(true)
    expect(errMsgs(choice(['甲', '乙', '丙', '丁', '戊'].map((t, i) => opt(t, i ? '' : ', correct: true')))).some((m) => m.includes('2–4'))).toBe(true)
    expect(errMsgs(choice([opt('甲', ', correct: true'), opt('乙')]))).toEqual([])
  })
  it('exactly one correct unless predict', () => {
    expect(errMsgs(choice([opt('甲'), opt('乙')])).some((m) => m.includes('correct'))).toBe(true)
    expect(errMsgs(choice([opt('甲', ', correct: true'), opt('乙', ', correct: true')])).some((m) => m.includes('correct'))).toBe(true)
    expect(errMsgs(choice([opt('甲'), opt('乙')], 'predict'))).toEqual([])
    expect(errMsgs(choice([opt('甲', ', correct: true'), opt('乙', ', correct: true')], 'predict')).some((m) => m.includes('预测题最多'))).toBe(true)
  })
  it('say required, string or array of strings', () => {
    expect(errMsgs(choice([`{ text: "甲", correct: true }`, opt('乙')])).some((m) => m.includes('say'))).toBe(true)
    expect(errMsgs(choice([`{ text: "甲", correct: true, say: ["一", "二"] }`, opt('乙')]))).toEqual([])
    expect(errMsgs(choice([`{ text: "甲", correct: true, say: 3 }`, opt('乙')])).some((m) => m.includes('say'))).toBe(true)
  })
  it('text over 24 characters warns', () => {
    expect(warnMsgs(choice([opt('字'.repeat(25), ', correct: true'), opt('乙')])).some((m) => m.includes('24'))).toBe(true)
    expect(warnMsgs(choice([opt('字'.repeat(24), ', correct: true'), opt('乙')])).some((m) => m.includes('24'))).toBe(false)
  })
  it('hints must be exactly 3', () => {
    const o = [opt('甲', ', correct: true'), opt('乙')]
    expect(errMsgs(choice(o, 'hints={["a", "b"]}')).some((m) => m.includes('hints'))).toBe(true)
    expect(errMsgs(choice(o, 'hints={["a", "b", "c"]}'))).toEqual([])
  })
})

describe('Recall', () => {
  const pred = (name: string, withCheck = true) =>
    `<Choice name="${name}" predict options={[{ text: "甲", correct: true, say: "好"${withCheck ? ', check: "实测是甲"' : ''} }, { text: "乙", say: "好"${withCheck ? ', check: "不是乙"' : ''} }]} />`
  it('passes for an earlier predict Choice with checks', () => {
    expect(errMsgs(step(`${pred('p')}\n\n<Recall choice="p" />`))).toEqual([])
  })
  it('points to an earlier predict Choice', () => {
    expect(hasCode(step('<Recall choice="p" />'), 'recall-target')).toBe(true)
    expect(hasCode(step(`<Recall choice="p" />\n\n${pred('p')}`), 'recall-target')).toBe(true)
    expect(hasCode(step(`${CH.replace('<Choice', '<Choice name="p"')}\n<Recall choice="p" />`), 'recall-target')).toBe(true)
  })
  it('recall-needs-check', () => {
    expect(hasCode(step(`${pred('p', false)}\n\n<Recall choice="p" />`), 'recall-needs-check')).toBe(true)
    expect(hasCode(step(`${pred('p')}\n\n<Recall choice="p" />`), 'recall-needs-check')).toBe(false)
  })
  it('check over 45 characters warns', () => {
    const long = pred('p').replace('实测是甲', '字'.repeat(46))
    expect(warnMsgs(step(long)).some((m) => m.includes('45'))).toBe(true)
  })
  it('Choice names are unique', () => {
    expect(hasCode(step(`${pred('p')}\n\n${pred('p')}`), 'duplicate-name')).toBe(true)
    expect(hasCode(step(`${pred('p')}\n\n${pred('q')}`), 'duplicate-name')).toBe(false)
  })
})

describe('Work', () => {
  it('exactly one of lines and blocks', () => {
    expect(errMsgs(step('<Work />')).some((m) => m.includes('lines 和 blocks'))).toBe(true)
    expect(errMsgs(step('<Work lines={[{ eq: "a" }]} blocks={[{ title: "t", lines: [{ eq: "a" }] }]} />')).some((m) => m.includes('lines 和 blocks'))).toBe(true)
    expect(errMsgs(step('<Work blocks={[{ title: "t", lines: [{ eq: "a" }] }]} />'))).toEqual([])
  })
  it('work-needs-blocks above 3 lines', () => {
    const l = (n: number) => Array.from({ length: n }, () => '{ eq: "a" }').join(', ')
    expect(hasCode(step(`<Work lines={[${l(4)}]} />`), 'work-needs-blocks')).toBe(true)
    expect(hasCode(step(`<Work lines={[${l(3)}]} />`), 'work-needs-blocks')).toBe(false)
  })
  it('line and block shapes', () => {
    expect(errMsgs(step('<Work lines={[{ note: "x" }]} />')).some((m) => m.includes('eq'))).toBe(true)
    expect(errMsgs(step('<Work blocks={[{ lines: [{ eq: "a" }] }]} />')).some((m) => m.includes('title'))).toBe(true)
  })
  it('more than 4 blocks warns', () => {
    const b = (n: number) => Array.from({ length: n }, () => '{ title: "t", lines: [{ eq: "a" }] }').join(', ')
    expect(warnMsgs(step(`<Work blocks={[${b(5)}]} />`)).some((m) => m.includes('4 块'))).toBe(true)
    expect(warnMsgs(step(`<Work blocks={[${b(4)}]} />`)).some((m) => m.includes('4 块'))).toBe(false)
  })
})

describe('Def and Fill', () => {
  it('Def rows', () => {
    expect(errMsgs(step('<Def rows={[{ name: "a", text: "b", note: "c" }]} />'))).toEqual([])
    expect(errMsgs(step('<Def rows={[{ name: "a" }]} />')).some((m) => m.includes('text'))).toBe(true)
  })
  it('Fill needs a blank with at least 2 options', () => {
    expect(errMsgs(step('<Fill rows={[{ name: "a", text: "无空" }]} />')).some((m) => m.includes('至少要有一个空'))).toBe(true)
    expect(errMsgs(step('<Fill rows={[{ name: "a", text: "有{答案}空" }]} />')).some((m) => m.includes('至少 2 项'))).toBe(true)
    expect(errMsgs(step('<Fill rows={[{ name: "a", text: "有{答案|干扰}空" }]} />'))).toEqual([])
  })
  const rows = 'rows={[{ name: "a", text: "{甲|乙|丙}" }, { name: "b", text: "{丁|戊}" }]}'
  it('say matches blanks and options', () => {
    expect(errMsgs(step(`<Fill ${rows} say={[["1", "2", "3"], ["1", "2"]]} />`))).toEqual([])
    expect(errMsgs(step(`<Fill ${rows} say={[["1", "2", "3"]]} />`)).some((m) => m.includes('say'))).toBe(true)
    expect(errMsgs(step(`<Fill ${rows} say={[["1", "2"], ["1", "2"]]} />`)).some((m) => m.includes('say[0]'))).toBe(true)
  })
  it('hints match blanks with 3 each', () => {
    expect(errMsgs(step(`<Fill ${rows} hints={[["1", "2", "3"], ["1", "2", "3"]]} />`))).toEqual([])
    expect(errMsgs(step(`<Fill ${rows} hints={[["1", "2", "3"]]} />`)).some((m) => m.includes('hints'))).toBe(true)
    expect(errMsgs(step(`<Fill ${rows} hints={[["1", "2", "3"], ["1", "2"]]} />`)).some((m) => m.includes('hints[1]'))).toBe(true)
  })
})

describe('Conclude and mask', () => {
  const c = (attrs: string) => `<Conclude title="${attrs}" text="正文" />`
  it('result needs settles', () => {
    expect(errMsgs(step(`<Conclude title="a" text="t" result="holds" />`)).some((m) => m.includes('settles'))).toBe(true)
    expect(errMsgs(step(`<Conclude title="a" text="t" guess />\n\n<Conclude title="b" text="t" settles="a" result="holds" />`))).toEqual([])
    expect(errMsgs(step(`<Conclude title="a" text="t" guess />\n\n<Conclude title="b" text="t" settles="a" result="maybe" />`)).some((m) => m.includes('result'))).toBe(true)
  })
  it('titles are unique', () => {
    expect(hasCode(step(`${c('a')}\n\n${c('a')}`), 'duplicate-name')).toBe(true)
    expect(hasCode(step(`${c('a')}\n\n${c('b')}`), 'duplicate-name')).toBe(false)
  })
  it('under, settles and mask point at a Conclude title (forward allowed)', () => {
    expect(hasCode(step('<Conclude title="a" text="t" under="zz" />'), 'conclude-ref')).toBe(true)
    expect(hasCode(step('<Conclude title="a" text="t" settles="zz" result="out" />'), 'conclude-ref')).toBe(true)
    expect(hasCode(step('<Conclude title="a" text="t" under="b" />\n\n<Conclude title="b" text="t" />'), 'conclude-ref')).toBe(false)
    const fill = '<Fill rows={[{ name: "a", text: "{甲|乙}" }]} mask={["b"]} />'
    expect(hasCode(step(`${fill}\n\n<Conclude title="b" text="t" />`), 'conclude-ref')).toBe(false)
    expect(hasCode(step(`${fill}\n\n<Conclude title="c" text="t" />`), 'conclude-ref')).toBe(true)
  })
})

describe('Lab', () => {
  const lab = (attrs = '', run = '{ label: "A", set: { m1: 1 } }, { label: "B", set: { m1: 2 } }', col = '{ label: "x", expr: "m1*2", digits: 1 }') =>
    step(`<Lab runs={[${run}]} columns={[${col}]} ${attrs} />`, P)
  it('valid', () => {
    expect(errMsgs(lab())).toEqual([])
  })
  it('set keys must be Params', () => {
    expect(errMsgs(lab('', '{ label: "A", set: { zz: 1 } }')).some((m) => m.includes('zz'))).toBe(true)
  })
  it('column expr names must be declared', () => {
    expect(errMsgs(lab('', undefined, '{ label: "x", expr: "qq*2" }')).some((m) => m.includes('qq'))).toBe(true)
  })
  it('runs need at least one entry', () => {
    expect(errMsgs(lab('', '')).some((m) => m.includes('runs'))).toBe(true)
  })
  it('need is an integer in 1..runs', () => {
    expect(errMsgs(lab('need={2}'))).toEqual([])
    expect(errMsgs(lab('need={3}')).some((m) => m.includes('need'))).toBe(true)
    expect(errMsgs(lab('need={0}')).some((m) => m.includes('need'))).toBe(true)
  })
  it('first has columns + 1 items', () => {
    expect(errMsgs(lab('first={["碰前", "1"]}'))).toEqual([])
    expect(errMsgs(lab('first={["碰前"]}')).some((m) => m.includes('first'))).toBe(true)
  })
})

describe('Collision', () => {
  const col = (attrs: string, pre = '') => `${HEAD}${pre}<Collision m={[1, 2]} v={[3, 0]} ${attrs} />\n`
  it('valid with after, or with still', () => {
    expect(errMsgs(col('after={[0, 1]}'))).toEqual([])
    expect(errMsgs(col('still'))).toEqual([])
  })
  it('collision-needs-after', () => {
    expect(hasCode(col(''), 'collision-needs-after')).toBe(true)
    expect(hasCode(col('after={[0, 1]}'), 'collision-needs-after')).toBe(false)
  })
  it('m, v, after take 2 items', () => {
    expect(errMsgs(`${HEAD}<Collision m={[1]} v={[3, 0]} after={[0, 1]} />`).some((m) => m.includes('m 要正好 2 项'))).toBe(true)
    expect(errMsgs(col('after={[0, 1, 2]}')).some((m) => m.includes('after'))).toBe(true)
  })
  it('expression items use declared names', () => {
    expect(errMsgs(col('after={["m1", 0]}', P))).toEqual([])
    expect(errMsgs(col('after={["qq", 0]}', P)).some((m) => m.includes('qq'))).toBe(true)
  })
  it('surface and body', () => {
    expect(errMsgs(col('after={[0, 1]} surface="rubber"'))).toEqual([])
    expect(errMsgs(col('after={[0, 1]} surface="m1"', P))).toEqual([])
    expect(errMsgs(col('after={[0, 1]} surface="nope"')).some((m) => m.includes('nope'))).toBe(true)
    expect(errMsgs(col('after={[0, 1]} body="ball"'))).toEqual([])
    expect(errMsgs(col('after={[0, 1]} body="boat"')).some((m) => m.includes('body'))).toBe(true)
  })
  it('names, massText, bars, digits', () => {
    expect(errMsgs(col('after={[0, 1]} names={["A", "B"]} massText={["m", "m"]} bars={false} digits={{ v: 1, p: 2, k: 3 }}'))).toEqual([])
    expect(errMsgs(col('after={[0, 1]} names={["A"]}')).some((m) => m.includes('names'))).toBe(true)
    expect(errMsgs(col('after={[0, 1]} massText={["m", 2]}')).some((m) => m.includes('massText'))).toBe(true)
    expect(errMsgs(col('after={[0, 1]} bars="m1 > 1"', P))).toEqual([])
    expect(errMsgs(col('after={[0, 1]} digits={{ x: 1 }}')).some((m) => m.includes('digits'))).toBe(true)
    expect(errMsgs(col('after={[0, 1]} digits={{ v: -1 }}')).some((m) => m.includes('digits.v'))).toBe(true)
  })
})

describe('beat', () => {
  const col = (bars: string, pre: string) => `${HEAD}${pre}<Collision m={[1, 2]} v={[3, 0]} after={[0, 1]} bars="${bars}" />\n`
  it('Collision reading beat needs a hidden Param', () => {
    expect(hasCode(col('beat >= 3', BEAT), 'beat-not-hidden')).toBe(false)
    expect(hasCode(col('beat >= 3', '<Param name="beat" min={0} max={5} step={1} value={0} />\n'), 'beat-not-hidden')).toBe(true)
  })
  it('undeclared beat is reported as undeclared', () => {
    const r = run(col('beat >= 3', ''))
    expect(r.codes).toContain('undeclared-name')
    expect(r.codes).not.toContain('beat-not-hidden')
  })
  it('Sim params with beat', () => {
    const sim = (pre: string) => `${HEAD}${pre}<Sim title="s" duration={1} params={["beat"]}>\nsim({ draw() {} })\n</Sim>\n`
    expect(hasCode(sim(BEAT), 'beat-not-hidden')).toBe(false)
    expect(hasCode(sim('<Param name="beat" min={0} max={5} step={1} value={0} />\n'), 'beat-not-hidden')).toBe(true)
  })
})

describe('Result and Homework', () => {
  const res = (attrs: string) => step('', '').replace('先看。', '先看。') + `<Result ${attrs} />\n`
  it('Result goals', () => {
    expect(errMsgs(res('goals={[{ title: "g", items: [1, 2], back: 1 }]} say={{ all: "全对", some: "{n}/{total}" }}'))).toEqual([])
    expect(errMsgs(res('goals={[{ title: "g", items: [0], back: 1 }]}')).some((m) => m.includes('items'))).toBe(true)
    expect(errMsgs(res('goals={[{ title: "g", items: [1], back: 0 }]}')).some((m) => m.includes('back'))).toBe(true)
    expect(errMsgs(res('goals={[{ title: "g", items: [1], back: 1 }]} say={{ all: "x" }}')).some((m) => m.includes('say'))).toBe(true)
  })
  it('Homework items', () => {
    expect(errMsgs(step('<Homework items={[{ tag: "必做 1", q: "题", a: "答" }]} />'))).toEqual([])
    expect(errMsgs(step('<Homework items={[{ tag: "必做 1", q: "题" }]} />')).some((m) => m.includes('a'))).toBe(true)
  })
})
