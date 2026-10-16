import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { ISSUE_CODES, validateLesson } from './validate'

// Plain-text conformance cases for the lesson parser and validator. Each directory holds
// lesson.md and expect.txt. First line: `ok` (no errors; warnings allowed) or `errors`.
// Then, per line: `warn: <substring>` must appear in some warning; `line: N` right after an
// error substring means the error matching that substring must be on line N; `not: <substring>`
// means no error or warning may contain it; `count: N` means exactly N errors; `code: <code>`
// means at least one error or warning has that code (see ISSUE_CODES); any other
// non-blank line is a substring that must appear in some error message.
// Every error and warning in every case must carry a code from ISSUE_CODES.
const FIXTURES = fileURLToPath(new URL('./fixtures/validate', import.meta.url))
const read = (path: string) => readFileSync(path, 'utf8')

interface Expect {
  ok: boolean
  errors: { text: string; line?: number }[]
  warns: string[]
  nots: string[]
  count?: number
  codes: string[]
}

function parseExpect(src: string): Expect {
  const lines = src.split('\n').map((l) => l.trim()).filter(Boolean)
  const [head, ...rest] = lines
  if (head !== 'ok' && head !== 'errors') throw new Error(`expect.txt 第一行要写 ok 或 errors，实际是「${head}」`)
  const out: Expect = { ok: head === 'ok', errors: [], warns: [], nots: [], codes: [] }
  for (const l of rest) {
    if (l.startsWith('warn: ')) out.warns.push(l.slice('warn: '.length))
    else if (l.startsWith('not: ')) out.nots.push(l.slice('not: '.length))
    else if (l.startsWith('code: ')) out.codes.push(l.slice('code: '.length))
    else if (l.startsWith('count: ')) out.count = Number(l.slice('count: '.length))
    else if (l.startsWith('line: ')) {
      const last = out.errors[out.errors.length - 1]
      if (!last || last.line !== undefined) throw new Error(`「${l}」前面要有一条错误文字`)
      last.line = Number(l.slice('line: '.length))
    } else out.errors.push({ text: l })
  }
  return out
}

describe('validate fixtures', () => {
  for (const name of readdirSync(FIXTURES).sort()) {
    it(name, () => {
      const dir = join(FIXTURES, name)
      const want = parseExpect(read(join(dir, 'expect.txt')))
      const r = validateLesson(read(join(dir, 'lesson.md')))

      if (want.ok) {
        expect(r.errors, JSON.stringify(r.errors)).toEqual([])
      } else {
        expect(r.errors.length, JSON.stringify(r.errors)).toBeGreaterThan(0)
        for (const e of want.errors) {
          const hits = r.errors.filter((x) => x.message.includes(e.text))
          expect(hits.length, `no error contains「${e.text}」in ${JSON.stringify(r.errors)}`).toBeGreaterThan(0)
          if (e.line !== undefined) {
            expect(
              hits.some((x) => x.line === e.line),
              `「${e.text}」should be on line ${e.line}, got ${JSON.stringify(hits)}`,
            ).toBe(true)
          }
        }
      }
      for (const w of want.warns) {
        expect(r.warnings.some((x) => x.message.includes(w)), `no warning contains「${w}」in ${JSON.stringify(r.warnings)}`).toBe(true)
      }
      const all = [...r.errors, ...r.warnings]
      for (const n of want.nots) {
        expect(all.some((x) => x.message.includes(n)), `「${n}」must not appear in ${JSON.stringify(all)}`).toBe(false)
      }
      for (const c of want.codes) {
        expect(all.some((x) => x.code === c), `no error or warning has code ${c} in ${JSON.stringify(all)}`).toBe(true)
      }
      for (const x of all) {
        expect(x.code !== undefined && (ISSUE_CODES as readonly string[]).includes(x.code), `issue without a known code: ${JSON.stringify(x)}`).toBe(true)
      }
      if (want.count !== undefined) {
        expect(r.errors.length, JSON.stringify(r.errors)).toBe(want.count)
      }
    })
  }
})
