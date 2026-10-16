import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ISSUE_CODES, validateLesson } from './validate'

// Every issue the validator reports on the shipped lessons carries a code from ISSUE_CODES.
const ROOT = join(__dirname, '../../..')
const DIRS = ['lessons', 'generated-grok/bank2', 'generated-grok/sd25']

describe('issue codes on shipped lessons', () => {
  for (const dir of DIRS) {
    for (const name of readdirSync(join(ROOT, dir)).filter((f) => f.endsWith('.md')).sort()) {
      // A busy machine can take longer than vitest's 5 s default for the largest lessons.
      it(`${dir}/${name}`, () => {
        const r = validateLesson(readFileSync(join(ROOT, dir, name), 'utf8'))
        for (const issue of [...r.errors, ...r.warnings]) {
          expect(issue.code, JSON.stringify(issue)).toBeDefined()
          expect((ISSUE_CODES as readonly string[]).includes(issue.code!), JSON.stringify(issue)).toBe(true)
        }
      }, 30_000)
    }
  }
})
