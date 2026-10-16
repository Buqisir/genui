import { describe, expect, it } from 'vitest'
import { parseLesson } from './parse'
import { unusedNames } from './unused'

function check(source: string) {
  return unusedNames(source, parseLesson(source).blocks).map((i) => i.message)
}

describe('unusedNames', () => {
  it('reports a Define that nothing uses', () => {
    const src = '<Param name="h" label="高" min={1} max={5} step={1} value={3} />\n<Define name="v" expr="sqrt(2*10*h)" label="速度" />\n正文'
    const msgs = check(src)
    // h is used by v's expr; v itself is never used.
    expect(msgs).toHaveLength(1)
    expect(msgs[0]).toContain('Define v')
  })

  it('does not report a Param used only as p.X in figure code', () => {
    const src = `<Param name="h" label="高" min={1} max={5} step={1} value={3} />\n<Figure title="图" height={200}>\nfigure({ draw(ctx, p) { ctx.fillText(p.h, 0, 0) } })\n</Figure>`
    expect(check(src)).toEqual([])
  })

  it('does not report a name used only in answers', () => {
    const src = '---\nid: x\ntitle: t\nquestion: q\nanswers:\n  - { name: v, value: 1 }\n---\n<Define name="v" expr="1" label="速度" />\n'
    expect(check(src)).toEqual([])
  })

  it('reports R when only R1 is used (whole identifiers only)', () => {
    const src = '<Param name="R" label="电阻" min={1} max={5} step={1} value={3} />\n<Define name="R1" expr="2" label="R1" />\n<Figure title="图" height={200} params={["R1"]}>\nfigure({ draw(ctx, p) { p.R1 } })\n</Figure>'
    const msgs = check(src)
    expect(msgs).toHaveLength(1)
    expect(msgs[0]).toContain('Param R ')
  })

  it('treats $ and _ next to a name as identifier characters, not boundaries', () => {
    const src = '<Define name="a" expr="1" label="a" />\n<Define name="b" expr="1" label="b" />\n正文里有 a_x、$a、b$ 和 _b，都不算用到'
    const msgs = check(src)
    expect(msgs).toHaveLength(2)
  })

  it('counts a Chinese character next to the name as a boundary', () => {
    const src = '<Define name="v" expr="1" label="v" />\n速度v的大小'
    expect(check(src)).toEqual([])
  })

  it('gives the warning code unused-name and the declaration line', () => {
    const src = '正文\n<Define name="v" expr="1" label="v" />\n'
    const issues = unusedNames(src, parseLesson(src).blocks)
    expect(issues).toEqual([expect.objectContaining({ line: 2, code: 'unused-name' })])
  })
})
