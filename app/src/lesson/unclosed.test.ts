import { describe, expect, it } from 'vitest'
import { validateLesson } from './validate'

// Unclosed tags and code fences: the unread range, and the names on errors that reference it.
const FENCE = '```'
const FRONT = `---
id: fx-slope
title: 斜面下滑
question: 物块从光滑斜面顶端由静止滑下，到底端时速度 v 多大？
answers:
  - { name: v, value: 7.746 }
---
`

describe('unclosed tags and fences', () => {
  it('a Sim cut off mid-code reports the unread range with no components', () => {
    // Lines: 1-7 front matter, 8 blank, 9 prose, 10 blank, 11 Param, 12 Define, 13 blank, 14 <Sim>, 15-17 code.
    const src = `${FRONT}
光滑斜面高 3 m，取 g = 10 m/s²。

<Param name="h" label="高度" min={1} max={10} step={1} value={3} unit="m" />
<Define name="v" expr="sqrt(2*10*h)" label="末速度" unit="m/s" />

<Sim title="斜面下滑" height={240}>
sim({
  setup(s) {
    const slo
`
    const r = validateLesson(src)
    expect(r.errors).toHaveLength(1)
    expect(r.errors[0]).toMatchObject({ line: 14, code: 'parse' })
    expect(r.errors[0].unclosed).toEqual({ tag: 'Sim', end: 17, components: 0 })
    expect(r.errors[0].message).toContain('看起来输出在这里中断了')
  })

  it('a Sim without its closing tag counts the components after it', () => {
    // Lines: 1-7 front matter, 8 blank, 9 prose, 10 blank, 11 Param, 12 blank, 13 <Sim>, 14-18 code,
    // 19 blank, 20 Readout, 21 Define.
    const src = `${FRONT}
光滑斜面高 3 m，取 g = 10 m/s²。

<Param name="h" label="高度" min={1} max={10} step={1} value={3} unit="m" />

<Sim title="斜面下滑" height={240}>
sim({
  setup(s) {
    s.body
  },
})

<Readout items={[{label: "末速度", expr: "v", unit: "m/s"}]} />
<Define name="v" expr="sqrt(2*10*h)" label="末速度" unit="m/s" />
`
    const r = validateLesson(src)
    expect(r.errors[0]).toMatchObject({ line: 13, code: 'parse' })
    expect(r.errors[0].unclosed).toEqual({ tag: 'Sim', end: 21, components: 2 })
    expect(r.errors[0].message).toContain('其中还有 2 个组件')
  })

  it('an unclosed ~~~ fence reports the marker and the components it hid', () => {
    // Lines: 1-7 front matter, 8 blank, 9 prose, 10 blank, 11 ~~~, 12 Param, 13 Define, 14 Figure, 15 figure(), 16 </Figure>.
    const src = `${FRONT}
光滑斜面高 3 m。

~~~
<Param name="h" label="高度" min={1} max={10} step={1} value={3} unit="m" />
<Define name="v" expr="sqrt(2*10*h)" label="末速度" unit="m/s" />
<Figure title="斜面" height={200} params={["h"]}>
figure({ draw(ctx, p, v) {} })
</Figure>
`
    const r = validateLesson(src)
    const fence = r.errors.find((e) => e.unclosed?.tag === '~~~')
    expect(fence).toMatchObject({ line: 11, code: 'parse' })
    expect(fence?.unclosed).toEqual({ tag: '~~~', end: 16, components: 3 })
    expect(fence?.message).toContain('代码块（~~~）没有闭合')
    expect(fence?.message).toContain('3 个组件没有读到')
  })

  it('an undeclared name in an expression carries its name', () => {
    const src = `${FRONT}
<Param name="h" label="高度" min={1} max={10} step={1} value={3} unit="m" />
<Define name="v" expr="sqrt(2*10*H)" label="末速度" unit="m/s" />
<Figure title="斜面" height={200} params={["h"]}>
figure({ draw(ctx, p, v) {} })
</Figure>
`
    const r = validateLesson(src)
    expect(r.errors.find((e) => e.code === 'undeclared-name')?.name).toBe('H')
  })

  it('an answer for a name that is not declared carries that name', () => {
    const src = `---
id: fx-slope
title: 斜面下滑
question: 物块从光滑斜面顶端由静止滑下，到底端时速度 v 多大？
answers:
  - { name: w, value: 7.746 }
---

<Param name="h" label="高度" min={1} max={10} step={1} value={3} unit="m" />
<Define name="v" expr="sqrt(2*10*h)" label="末速度" unit="m/s" />
<Figure title="斜面" height={200} params={["h"]}>
figure({ draw(ctx, p, v) {} })
</Figure>
`
    const r = validateLesson(src)
    expect(r.errors.find((e) => e.code === 'answer-unknown-name')?.name).toBe('w')
  })

  it('an unused Define warning carries its name', () => {
    const src = `${FRONT}
<Param name="h" label="高度" min={1} max={10} step={1} value={3} unit="m" />
<Define name="v" expr="sqrt(2*10*h)" label="末速度" unit="m/s" />
<Define name="k" expr="2*h" label="k" />
<Figure title="斜面" height={200} params={["h"]}>
figure({ draw(ctx, p, v) {} })
</Figure>
`
    const r = validateLesson(src)
    expect(r.warnings.find((w) => w.code === 'unused-name')).toMatchObject({ name: 'k' })
  })

  it('a reference to a name that only sits in unread text is not reported', () => {
    // The Param w is inside a fence that never closes, so w is unread: the Define u that uses it is a cascade.
    const src = `${FRONT}
<Define name="u" expr="2*w" label="u" />
<Figure title="图" height={200}>
figure({ draw(ctx) {} })
</Figure>

${FENCE}
<Param name="w" label="宽" min={1} max={5} step={1} value={2} />
`
    const r = validateLesson(src)
    expect(r.errors.filter((e) => e.code === 'undeclared-name')).toEqual([])
    expect(r.errors.map((e) => e.code)).toEqual(['parse'])
  })

  it('a closed code fence with components inside it is not an error', () => {
    const src = `${FRONT}
光滑斜面高 3 m，取 g = 10 m/s²。

写法示例（不参与计算）：

${FENCE}
<Define name="v" expr="sqrt(2*10*h)" />
${FENCE}

<Param name="h" label="高度" min={1} max={10} step={1} value={3} unit="m" />
<Define name="v" expr="sqrt(2*10*h)" label="末速度" unit="m/s" />

<Figure title="斜面" height={200} params={["h"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -1, xmax: 5, ymin: -1, ymax: 4 })
  },
})
</Figure>
`
    expect(validateLesson(src).errors).toEqual([])
  })
})
