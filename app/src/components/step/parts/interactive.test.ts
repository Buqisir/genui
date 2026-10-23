import { describe, expect, it } from 'vitest'
import { StepEngine, type ConcludeEntry } from '../runtime'
import { parseFill, shuffleOrder } from './Fill'
import { labCells, labSpec, runPatch } from './Lab'
import type { ComponentBlock } from '../model'

const entry = (e: Partial<ConcludeEntry> & { title: string }): ConcludeEntry => ({ text: `${e.title}的正文`, ...e })

/** Two steps of three sentences each; stepKey is the flat step index as StepLesson passes it. */
function engine() {
  const e = new StepEngine([3, 3], 0)
  e.start()
  return e
}
const rtOf = (e: StepEngine) => e.runtimeFor(e.pos.epoch, String(e.pos.step))
const titles = (e: StepEngine) => e.chain().map((i) => `${'-'.repeat(i.depth)}${i.title}${i.tag ? `[${i.tag}]` : ''}${i.latest ? '*' : ''}`)

describe('结论链', () => {
  it('条目在它所在的那一句才进链，往回走按当时的句号重算', () => {
    const e = engine()
    const rt = rtOf(e)
    rt.registerConclude('a', 1, entry({ title: 'A' }), 1)
    rt.registerConclude('b', 2, entry({ title: 'B' }), 2)
    expect(titles(e)).toEqual([])
    e.advance()
    expect(titles(e)).toEqual(['A*'])
    e.advance()
    expect(titles(e)).toEqual(['A', 'B*'])
    e.back()
    expect(titles(e)).toEqual(['A*'])
  })

  it('跨步累积；回到前一步时看不到后一步的条目', () => {
    const e = engine()
    rtOf(e).registerConclude('a', 0, entry({ title: 'A' }), 1)
    e.advance()
    e.advance()
    e.advance() // step 1
    expect(e.pos.step).toBe(1)
    rtOf(e).registerConclude('c', 1, entry({ title: 'C' }), 5)
    expect(titles(e)).toEqual(['A*'])
    e.advance()
    expect(titles(e)).toEqual(['A', 'C*'])
    e.back()
    e.back()
    e.back() // step 0, last sentence
    expect(e.pos.step).toBe(0)
    expect(titles(e)).toEqual(['A*'])
  })

  it('under 缩进；指向后出现的条目时先挂在根上', () => {
    const e = engine()
    const rt = rtOf(e)
    rt.registerConclude('a', 0, entry({ title: 'A', under: 'P' }), 1)
    rt.registerConclude('p', 1, entry({ title: 'P' }), 2)
    expect(titles(e)).toEqual(['A*'])
    e.advance()
    expect(titles(e)).toEqual(['P*', '-A'])
  })

  it('under 绕成圈不会死循环', () => {
    const e = engine()
    const rt = rtOf(e)
    rt.registerConclude('a', 0, entry({ title: 'A', under: 'B' }), 1)
    rt.registerConclude('b', 0, entry({ title: 'B', under: 'A' }), 2)
    expect(e.chain()).toHaveLength(2)
  })

  it('猜想；holds 后改显示判定那一条；out 划掉', () => {
    const e = engine()
    const rt = rtOf(e)
    rt.registerConclude('g', 0, entry({ title: 'G', guess: true }), 1)
    rt.registerConclude('h', 1, entry({ title: 'H', settles: 'G', result: 'holds' }), 2)
    rt.registerConclude('o', 0, entry({ title: 'O', guess: true }), 3)
    rt.registerConclude('x', 2, entry({ title: 'X', settles: 'O', result: 'out' }), 4)
    expect(titles(e)).toEqual(['G[猜想]', 'O[猜想]*'])
    e.advance()
    expect(titles(e)).toEqual(['H[成立]*', 'O[猜想]'])
    expect(e.chain()[0].text).toBe('H的正文')
    e.advance()
    const last = e.chain()[1]
    expect(last.out).toBe(true)
    expect(last.tag).toBe('出局')
    expect(last.title).toBe('O')
    // 判定的那一条不单独占一行
    expect(e.chain()).toHaveLength(2)
  })

  it('Fill mask 答完前盖住（显示 blank 或 ……），答完后恢复', () => {
    const e = engine()
    const rt = rtOf(e)
    rt.registerConclude('g', 0, entry({ title: 'G', guess: true, blank: '___ 不变' }), 1)
    rt.registerConclude('n', 0, entry({ title: 'N' }), 2)
    const stop = rt.registerStop('9', 0)
    rt.registerMask('9', ['G', 'N'])
    expect(e.chain().map((i) => [i.title, i.text, i.masked])).toEqual([
      ['回忆一下', '___ 不变', true],
      ['回忆一下', '……', true],
    ])
    stop.resolve()
    expect(e.chain().map((i) => [i.title, i.masked])).toEqual([
      ['G', false],
      ['N', false],
    ])
  })

  it('replay 不清停点和记忆，只换 epoch；keep 到下一次进步前一直在', () => {
    const e = engine()
    const rt = rtOf(e)
    const stop = rt.registerStop('lab', 0)
    const mem = rt.keep('lab', () => ({ n: 1 }))
    mem.n = 2
    const before = e.pos.epoch
    rt.replay()
    expect(e.pos.epoch).toBe(before + 1)
    expect(rtOf(e).keep('lab', () => ({ n: 0 })).n).toBe(2)
    stop.resolve()
    // the old runtime is dead
    rt.replay()
    expect(e.pos.epoch).toBe(before + 1)
    e.advance()
    e.advance()
    e.advance()
    expect(rtOf(e).keep('lab', () => ({ n: 0 })).n).toBe(0)
  })
})

describe('Fill', () => {
  const rows = [
    { name: '结论', text: '碰撞前后，{总动量|总动能|总速度}一定守恒。' },
    { name: '分类', text: '粘在一起是{完全非弹性|弹性}碰撞，$v_{1}$ 不算空。' },
  ]
  it('空按顺序编号，第一项是答案；没有 | 的花括号不算空', () => {
    const { rows: out, blanks } = parseFill(rows)
    expect(blanks).toEqual([
      { answer: '总动量', opts: ['总动量', '总动能', '总速度'] },
      { answer: '完全非弹性', opts: ['完全非弹性', '弹性'] },
    ])
    expect(out[0].segs).toEqual([
      { t: 'text', s: '碰撞前后，' },
      { t: 'blank', k: 0 },
      { t: 'text', s: '一定守恒。' },
    ])
    expect(out[1].segs.map((s) => s.t)).toEqual(['text', 'blank', 'text'])
    expect((out[1].segs[2] as { s: string }).s).toContain('$v_{1}$')
  })
  it('打乱是稳定的：同一个种子总是同一个顺序，且答案不总在第一位', () => {
    for (const seed of [1, 7, 42, 1000]) {
      const a = shuffleOrder(3, seed)
      expect(shuffleOrder(3, seed)).toEqual(a)
      expect([...a].sort()).toEqual([0, 1, 2])
      expect(a).not.toEqual([0, 1, 2])
    }
    expect(shuffleOrder(1, 5)).toEqual([0])
  })
})

describe('Lab', () => {
  const block = {
    kind: 'component',
    name: 'Lab',
    line: 3,
    props: {
      runs: [
        { label: '磁体', set: { s: 0 } },
        { label: '橡皮', set: { s: 'k + 1' } },
      ],
      columns: [
        { label: '动量和', expr: 'a + 1', digits: 3 },
        { label: '无效', expr: 'nope(' },
      ],
    },
  } as unknown as ComponentBlock
  it('need 默认 = runs 个数，并且不超过它', () => {
    expect(labSpec(block).need).toBe(2)
    expect(labSpec({ ...block, props: { ...block.props, need: 9 } } as ComponentBlock).need).toBe(2)
    expect(labSpec({ ...block, props: { ...block.props, need: 1 } } as ComponentBlock).need).toBe(1)
  })
  it('按当时参数求值，digits 定小数位，算不出写 —', () => {
    const { columns } = labSpec(block)
    expect(labCells(columns, { a: 0.2378 })).toEqual(['1.238', '—'])
    expect(labCells([{ label: 'x', expr: 'a', digits: 0 }], { a: 97.6 })).toEqual(['98'])
  })
  it('set 里的表达式按当前参数求值', () => {
    const { runs } = labSpec(block)
    expect(runPatch(runs[1], { k: 4 })).toEqual({ s: 5 })
  })
})
