import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { validateLesson } from './validate'

// Plain-text conformance cases for the lesson parser and validator. Each directory holds
// lesson.md and expect.txt. First line: `ok` (no errors; warnings allowed) or `errors`.
// Then, per line: `warn: <substring>` must appear in some warning; `line: N` right after an
// error substring means the error matching that substring must be on line N; any other
// non-blank line is a substring that must appear in some error message.
const FIXTURES = fileURLToPath(new URL('./fixtures/validate', import.meta.url))
const read = (path: string) => readFileSync(path, 'utf8')

interface Expect {
  ok: boolean
  errors: { text: string; line?: number }[]
  warns: string[]
}

function parseExpect(src: string): Expect {
  const lines = src.split('\n').map((l) => l.trim()).filter(Boolean)
  const [head, ...rest] = lines
  if (head !== 'ok' && head !== 'errors') throw new Error(`expect.txt 第一行要写 ok 或 errors，实际是「${head}」`)
  const out: Expect = { ok: head === 'ok', errors: [], warns: [] }
  for (const l of rest) {
    if (l.startsWith('warn: ')) out.warns.push(l.slice('warn: '.length))
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
    })
  }
})
