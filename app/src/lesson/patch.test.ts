import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { openingTagLength, parseLesson } from './parse'
import { applyPatch, formatKeys, isPatch, listKeys } from './patch'

const FIXTURES = fileURLToPath(new URL('./fixtures/patch', import.meta.url))
const read = (path: string) => readFileSync(path, 'utf8')
const trailingNewline = (s: string) => s.replace(/\n+$/, '') + '\n'

describe('patch fixtures', () => {
  for (const name of readdirSync(FIXTURES).sort()) {
    it(name, () => {
      const dir = join(FIXTURES, name)
      const r = applyPatch(read(join(dir, 'base.md')), read(join(dir, 'patch.md')))
      if (existsSync(join(dir, 'errors.txt'))) {
        expect(r.ok).toBe(false)
        expect(r.applied).toEqual([])
        expect(r.text).toBe(read(join(dir, 'base.md')))
        const wanted = read(join(dir, 'errors.txt'))
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
        for (const w of wanted) {
          expect(r.errors.some((e) => e.includes(w)), `no error contains「${w}」in ${JSON.stringify(r.errors)}`).toBe(true)
        }
        return
      }
      expect(r.errors).toEqual([])
      expect(r.ok).toBe(true)
      const expected = read(join(dir, 'expected.md'))
      expect(trailingNewline(r.text)).toBe(trailingNewline(expected))
      expect(parseLesson(expected).errors).toEqual([])
    })
  }
})

describe('isPatch', () => {
  it('needs the mark as the first non-blank line', () => {
    expect(isPatch('<!-- patch -->\n<Define name="a" expr="1" />')).toBe(true)
    expect(isPatch('\n  <!-- patch -->')).toBe(true)
    expect(isPatch('正文\n<!-- patch -->')).toBe(false)
  })
})

describe('listKeys / formatKeys', () => {
  const src = [
    '---',
    'id: k',
    '---',
    '<Define name="R1" expr="1" />',
    '<Readout items={[]} />',
    '<Figure title="图" height={100}>',
    'figure({})',
    '</Figure>',
    '<Readout items={[]} />',
    '<Figure title="图" height={100}>',
    'figure({})',
    '</Figure>',
  ].join('\n')

  it('reports named keys when unique and occurrence keys otherwise', () => {
    expect(listKeys(src)).toEqual([
      { key: 'Define:R1', component: 'Define', line: 4, end: 4 },
      { key: 'Readout#1', component: 'Readout', line: 5, end: 5 },
      { key: 'Figure#1', component: 'Figure', line: 6, end: 8 },
      { key: 'Readout#2', component: 'Readout', line: 9, end: 9 },
      { key: 'Figure#2', component: 'Figure', line: 10, end: 12 },
    ])
  })

  it('formats one line per block', () => {
    expect(formatKeys(src).split('\n')[0]).toBe('Define:R1（第 4–4 行）')
    expect(formatKeys(src).split('\n')[2]).toBe('Figure#1（第 6–8 行）')
    expect(formatKeys('正文只有文字')).toBe('')
  })

  it('ignores component-looking text inside code fences', () => {
    const fenced = '```\n<Define name="x" expr="1" />\n```\n'
    expect(listKeys(fenced)).toEqual([])
  })
})

describe('openingTagLength', () => {
  it('measures the opening tag of a self-closing or paired tag', () => {
    const s = '<Define name="x" expr="1" /> tail'
    expect(s.slice(0, openingTagLength(s))).toBe('<Define name="x" expr="1" />')
    const p = '<Figure title="a" params={["x", "y"]}>\nbody\n</Figure>'
    expect(p.slice(0, openingTagLength(p))).toBe('<Figure title="a" params={["x", "y"]}>')
  })

  it('returns -1 for an incomplete or invalid tag', () => {
    expect(openingTagLength('<Define name="x"')).toBe(-1)
    expect(openingTagLength('<define name="x" />')).toBe(-1)
  })
})

describe('parseLesson end lines', () => {
  it('gives the last line of each component block', () => {
    const src = ['---', 'id: e', '---', '<Define name="a"', '  expr="1" />', '<Figure title="t">', 'x', '</Figure>'].join('\n')
    const comps = parseLesson(src).blocks.filter((b) => b.kind === 'component')
    expect(comps.map((b) => [b.line, b.end])).toEqual([
      [4, 5],
      [6, 8],
    ])
  })
})
