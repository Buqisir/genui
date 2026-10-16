import { describe, expect, it } from 'vitest'
import { formatStructure, isStructural, structureOf, type Structure } from './structure'
import type { Issue } from './validate'

const undeclaredInBlock: Issue = { line: 12, block: 'Define:sFormula', code: 'undeclared-name', name: 'g', message: 'Define sFormula 引用了未声明的名字 g' }
// Same name, no `name` field: the name comes from the message.
const undeclaredInMotion: Issue = { line: 30, block: 'Motion:belt', code: 'undeclared-name', message: '<Motion> forces[0].magnitude 引用了未声明的名字 g：m*g' }
const unclosed: Issue = {
  line: 39,
  code: 'parse',
  message: '缺少 </Sim>：从这里到文件末尾（第 39–45 行）都没有读到。……',
  unclosed: { tag: 'Sim', end: 45, components: 0 },
}
const noScene: Issue = { code: 'no-scene', message: '课件没有画出物理情景：……' }

describe('structureOf', () => {
  it('merges one name from several places into one row, refs in order', () => {
    const r = structureOf({ errors: [undeclaredInBlock, undeclaredInMotion], warnings: [] })
    expect(r.unresolved).toEqual([{ name: 'g', refs: ['Define:sFormula', 'Motion:belt'] }])
  })

  it('lists names in the order they first appear', () => {
    const answer: Issue = { code: 'answer-unknown-name', message: 'answers 里的 sMark 没有对应的 Param/Define（是不是 s？），无法核对' }
    const r = structureOf({ errors: [answer, undeclaredInBlock, undeclaredInMotion], warnings: [] })
    expect(r.unresolved.map((u) => u.name)).toEqual(['sMark', 'g'])
  })

  it('takes the suggestion from the message and refs from answers', () => {
    const answer: Issue = { code: 'answer-unknown-name', message: 'answers 里的 sMark 没有对应的 Param/Define（是不是 s？），无法核对' }
    expect(structureOf({ errors: [answer], warnings: [] }).unresolved).toEqual([{ name: 'sMark', refs: ['answers'], suggest: 's' }])
  })

  it('labels a variant miss with the variant name', () => {
    const variant: Issue = { code: 'variant-unknown-name', message: '变式「磁场反向」的 expect 里的 Uef 没有对应的 Param/Define' }
    expect(structureOf({ errors: [variant], warnings: [] }).unresolved).toEqual([{ name: 'Uef', refs: ['变式「磁场反向」'] }])
  })

  it('keeps unclosed and no-scene issues in their original order', () => {
    const r = structureOf({ errors: [unclosed, noScene], warnings: [] })
    expect(r.incomplete).toEqual([unclosed, noScene])
    expect(r.incomplete[0]).toBe(unclosed)
    expect(r.incomplete[1]).toBe(noScene)
  })

  it('reads unused names as orphaned, with their kind', () => {
    const k: Issue = { code: 'unused-name', name: 'k', message: 'Define k 声明了但没有被用到（图、读数、表达式、answers 里都没出现）；不需要就删掉' }
    const rho: Issue = { code: 'unused-name', message: 'Param rho 声明了但没有被用到（图、读数、表达式、answers 里都没出现）；不需要就删掉' }
    const r = structureOf({ errors: [], warnings: [k, rho, k] })
    expect(r.orphaned).toEqual([
      { name: 'k', kind: 'Define' },
      { name: 'rho', kind: 'Param' },
    ])
  })
})

describe('isStructural', () => {
  it('is false for an ordinary error', () => {
    expect(isStructural({ line: 3, code: 'unknown-prop', message: '<Motion> 未知属性 foo', hint: '<Motion> 正确写法：…' })).toBe(false)
  })

  it('is true for the structural kinds', () => {
    expect(isStructural(undeclaredInBlock)).toBe(true)
    expect(isStructural(unclosed)).toBe(true)
    expect(isStructural(noScene)).toBe(true)
    expect(isStructural({ code: 'answers-empty', message: 'answers 为空' })).toBe(true)
    expect(isStructural({ code: 'front-matter', message: '头信息缺少 title' })).toBe(true)
    expect(isStructural({ code: 'unused-name', name: 'k', message: 'Define k 声明了但没有被用到' })).toBe(true)
  })

  it('needs a name for the unresolved codes', () => {
    expect(isStructural({ code: 'undeclared-name', message: '没有名字的报错' })).toBe(false)
  })

  it('is false for front-matter errors other than missing fields', () => {
    expect(isStructural({ code: 'front-matter', message: '头信息不是合法的 YAML' })).toBe(false)
  })
})

describe('formatStructure', () => {
  const full: Structure = {
    incomplete: [unclosed, noScene],
    unresolved: [
      { name: 'g', refs: ['Define:sFormula', 'Motion:belt'] },
      { name: 'Rr', refs: ['answers'], suggest: 'R' },
    ],
    orphaned: [
      { name: 'k', kind: 'Define' },
      { name: 'rho', kind: 'Define' },
    ],
  }

  it('prints the three sections in a fixed order', () => {
    expect(formatStructure(full)).toBe(
      [
        '## 先补齐结构',
        '',
        '- 没写完：',
        '  - 第 39 行：缺少 </Sim>：从这里到文件末尾（第 39–45 行）都没有读到。……',
        '  - 课件没有画出物理情景：……',
        '- 引用了没定义（给每个名字补一条 <Param> 或 <Define>，或改成已声明的名字）：',
        '  - g：Define:sFormula、Motion:belt 用到',
        '  - Rr（是不是 R？）：answers 用到',
        '- 定义了没用（不需要就删掉）：Define k、Define rho',
      ].join('\n'),
    )
  })

  it('uses the heading it is given', () => {
    expect(formatStructure({ incomplete: [], unresolved: [], orphaned: [{ name: 'k' }] }, '先补齐结构：')).toBe('先补齐结构：\n\n- 定义了没用（不需要就删掉）：k')
  })

  it('returns an empty string when nothing is structural', () => {
    expect(formatStructure({ incomplete: [], unresolved: [], orphaned: [] })).toBe('')
  })
})
