// Warns about <Param> and <Define> names that nothing in the lesson mentions.
// Deliberately conservative: a name counts as used if it appears as a whole identifier anywhere outside its own
// declaration (headers, prose, figure code, other props), so a mention in prose hides the warning. Missing a case is
// acceptable; a false warning is not.
import type { Block } from './parse'
import type { Issue } from './validate'

const IDENT_CHAR = '[A-Za-z0-9_$]'

export function unusedNames(source: string, blocks: Block[]): Issue[] {
  const lines = source.split('\n')
  const out: Issue[] = []
  for (const b of blocks) {
    if (b.kind !== 'component' || (b.name !== 'Param' && b.name !== 'Define')) continue
    const name = b.props.name
    if (typeof name !== 'string') continue
    // Blank out the declaration's own lines (1-based, inclusive) so it does not count as a use.
    const rest = lines.map((l, i) => (i + 1 >= b.line && i + 1 <= b.end ? '' : l)).join('\n')
    const pattern = new RegExp(`(?<!${IDENT_CHAR})${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!${IDENT_CHAR})`)
    if (pattern.test(rest)) continue
    out.push({
      line: b.line,
      code: 'unused-name',
      message: `${b.name} ${name} 声明了但没有被用到（图、读数、表达式、answers 里都没出现）；不需要就删掉`,
    })
  }
  return out
}
