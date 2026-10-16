import { describe, expect, it } from 'vitest'
import { loadDocs } from '../docs/index'
import { COMPONENTS } from './components'
import { validateLesson } from './validate'
import { signature, signatureTable } from './signature'

describe('component signatures', () => {
  it('writes Define as one exact line, required props starred, in declaration order', () => {
    expect(signature('Define')).toBe('Define(name*: string, expr*: expr, label: string, unit: string)')
    expect(signature('NoSuchComponent')).toBeNull()
  })

  it('lists every component exactly once, in COMPONENTS order, and is deterministic', () => {
    const cards = loadDocs()
    const table = signatureTable(cards)
    expect(table).toBe(signatureTable(cards))
    const lines = table.split('\n')
    expect(lines.map((l) => l.split('(')[0])).toEqual(Object.keys(COMPONENTS))
    expect(lines.find((l) => l.startsWith('Segment('))).toContain(' — 分段讲解')
    expect(lines.find((l) => l.startsWith('Define('))).toBe(signature('Define'))
  })

  it('omits the dash part when no card names the component', () => {
    expect(signatureTable([])).not.toContain(' — ')
  })

  it('attaches the block key and a signature hint to a prop error', () => {
    const source = [
      '---',
      'id: sig-test',
      'title: 签名测试',
      'question: 题目',
      'answers: A',
      '---',
      '<Param name="R0" value={100} />',
      '<Define name="R1" />',
      '',
    ].join('\n')
    const result = validateLesson(source)
    const issue = result.errors.find((e) => e.message.includes('缺少属性 expr'))
    expect(issue).toBeDefined()
    expect(issue!.block).toBe('Define:R1')
    expect(issue!.hint).toBe(`正确写法：${signature('Define')}`)
  })
})
