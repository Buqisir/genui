import { describe, expect, it } from 'vitest'
import { formatValidation, type PointedIssue } from '../src/agent/core'
import { reportOf } from './genprompt'
import type { Issue } from '../src/lesson/validate'

// Ordinary issues only: no structural ones, so the output must match the pre-structure format exactly.
const plain = {
  errors: [
    { code: 'unknown-prop', line: 12, block: 'Motion:belt', message: '<Motion> 未知属性 foo', hint: '<Motion> 正确写法：<Motion name="x" ... />' },
    { code: 'bad-expr', line: 20, block: 'Define:v', message: 'Define v 的表达式不合法：1+' },
  ],
  warnings: [{ code: 'component-warning', line: 30, message: 'Figure 的 height 偏小' }],
} satisfies { errors: Issue[]; warnings: Issue[] }

const undeclaredG: Issue = { line: 12, block: 'Define:sFormula', code: 'undeclared-name', name: 'g', message: 'Define sFormula 引用了未声明的名字 g' }
const undeclaredInMotion: Issue = { line: 30, block: 'Motion:belt', code: 'undeclared-name', message: '<Motion> forces[0].magnitude 引用了未声明的名字 g：m*g' }
const answerSMark: Issue = { code: 'answer-unknown-name', message: 'answers 里的 sMark 没有对应的 Param/Define（是不是 s？），无法核对' }
const unusedK: Issue = { code: 'unused-name', name: 'k', message: 'Define k 声明了但没有被用到（图、读数、表达式、answers 里都没出现）；不需要就删掉' }
const noScene: Issue = { code: 'no-scene', message: '课件没有画出物理情景：无' }

const DOC_SENTENCE = '这些文档 id 在《课件语法规范》里对应标题相同的章节。'

/** The output of the pre-structure reportOf for `plain` with missing = ['sMark'] (captured before the change). */
const PLAIN_REPORT = [
  '- 错误（第 12 行，Motion:belt）：<Motion> 未知属性 foo（motion（运动积分））',
  '  <Motion> 正确写法：<Motion name="x" ... />',
  '- 错误（第 20 行，Define:v）：Define v 的表达式不合法：1+（params（参数和表达式））',
  '- 答案核对：「sMark」与标准答案不符（或 answers 里缺这一项）。请重新审题：题目文字可能省略了原图里的信息（例如光在某个面上先反射），选择能让题设条件全部成立的解释，不要轻易断定题目矛盾。',
  '- 提醒（第 30 行）：Figure 的 height 偏小（index（课件系统入口））',
  '',
  DOC_SENTENCE,
].join('\n')

describe('reportOf', () => {
  it('prints nothing when there are no issues', () => {
    expect(reportOf({ errors: [], warnings: [] }, [])).toBe('')
  })

  it('keeps the old format byte for byte when there are no structural issues', () => {
    expect(reportOf(plain, ['sMark'])).toBe(PLAIN_REPORT)
  })

  it('puts the structure summary first, then the per-issue list, without repeating structural issues', () => {
    const out = reportOf({ errors: [undeclaredG, undeclaredInMotion, answerSMark, ...plain.errors], warnings: [unusedK, ...plain.warnings] }, [])
    expect(out.startsWith('## 先补齐结构\n\n')).toBe(true)
    expect(out).toContain('\n\n## 逐条报告\n\n')
    expect(out).toContain('  - g：Define:sFormula、Motion:belt 用到')
    expect(out).toContain('- 定义了没用（不需要就删掉）：Define k')

    const list = out.slice(out.indexOf('## 逐条报告'))
    expect(list).not.toContain('引用了未声明的名字')
    expect(list).not.toContain('没有对应的 Param/Define')
    expect(list).not.toContain('声明了但没有被用到')
    expect(list).toContain('- 错误（第 12 行，Motion:belt）：<Motion> 未知属性 foo')
    expect(list).toContain('- 错误（第 20 行，Define:v）：Define v 的表达式不合法')
  })

  it('shows only the summary when every error and warning is structural', () => {
    const out = reportOf({ errors: [undeclaredG, noScene], warnings: [unusedK] }, [])
    expect(out.startsWith('## 先补齐结构\n\n')).toBe(true)
    expect(out).not.toContain('## 逐条报告')
    expect(out).not.toContain(DOC_SENTENCE)
  })

  it('drops the doc sentence when only answer-check lines are left', () => {
    const out = reportOf({ errors: [undeclaredG], warnings: [] }, ['sMark'])
    expect(out).toContain('## 逐条报告')
    expect(out).toContain('- 答案核对：「sMark」')
    expect(out).not.toContain(DOC_SENTENCE)
  })
})

/** formatValidation takes pointed issues; the doc only matters to the line it prints. */
function pointed(issues: Issue[]): PointedIssue[] {
  return issues.map((i) => ({ ...i, doc: 'x' }))
}

describe('formatValidation', () => {
  it('keeps the old format when there are no structural issues', () => {
    expect(formatValidation('x.md', { errors: pointed(plain.errors), warnings: pointed(plain.warnings) })).toBe(
      [
        '✗ x.md  (2 个错误，1 个提醒)',
        '  错误 第 12 行（Motion:belt）：<Motion> 未知属性 foo（读 genui docs x）',
        '    <Motion> 正确写法：<Motion name="x" ... />',
        '  错误 第 20 行（Define:v）：Define v 的表达式不合法：1+（读 genui docs x）',
        '  提醒 第 30 行：Figure 的 height 偏小（读 genui docs x）',
      ].join('\n'),
    )
  })

  it('prints a clean header for an empty result', () => {
    expect(formatValidation('x.md', { errors: [], warnings: [] })).toBe('✓ x.md  (0 个错误，0 个提醒)')
  })

  it('puts the structure summary under the header and does not list those issues again', () => {
    const errors = [undeclaredG, undeclaredInMotion, noScene, ...plain.errors]
    const warnings = [unusedK, ...plain.warnings]
    const out = formatValidation('x.md', { errors: pointed(errors), warnings: pointed(warnings) })
    expect(out).toBe(
      [
        '✗ x.md  (5 个错误，2 个提醒)',
        '  先补齐结构：',
        '',
        '  - 没写完：',
        '    - 课件没有画出物理情景：无（读 genui docs x）',
        '  - 引用了没定义（给每个名字补一条 <Param> 或 <Define>，或改成已声明的名字）：',
        '    - g：Define:sFormula、Motion:belt 用到',
        '  - 定义了没用（不需要就删掉）：Define k',
        '  错误 第 12 行（Motion:belt）：<Motion> 未知属性 foo（读 genui docs x）',
        '    <Motion> 正确写法：<Motion name="x" ... />',
        '  错误 第 20 行（Define:v）：Define v 的表达式不合法：1+（读 genui docs x）',
        '  提醒 第 30 行：Figure 的 height 偏小（读 genui docs x）',
      ].join('\n'),
    )
  })
})
