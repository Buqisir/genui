// Checks a lesson's `answers` / `choice` against problems/expected*.yaml (kept away from the model).
// A question with several choice sub-questions writes `choice` as a list in sub-question order
// (`choice: [AD, C]`). The k-th `choice` entry in a key matches the k-th element of that list;
// a plain string (`choice: C`) is a one-element list, so old lessons behave as before.
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

const dir = join(dirname(fileURLToPath(import.meta.url)), '../../problems')

// `any`: numeric alternatives (unit variants), matched within 1%. `choice`: option letters in A–D order;
// the k-th `choice` entry of a question is compared with the k-th lesson `choice` (see the file header).
// `text`: answers only a person can grade (symbolic expressions, 选填 words); listed, never auto-checked.
interface Expect {
  q: string
  any?: number[]
  choice?: string
  text?: string
}

let cache: Record<string, Expect[]> | undefined

function allKeys(): Record<string, Expect[]> {
  if (!cache) {
    cache = {}
    for (const f of readdirSync(dir).filter((f) => /^expected(-.+)?\.yaml$/.test(f))) {
      Object.assign(cache, YAML.parse(readFileSync(join(dir, f), 'utf8')) ?? {})
    }
  }
  return cache
}

export function answerKey(id: string): Expect[] | null {
  return allKeys()[id] ?? null
}

const letters = (s: unknown) => [...new Set(String(s ?? '').toUpperCase().replace(/[^A-H]/g, ''))].sort().join('')

/**
 * `missing`: questions whose expected answer is not in the lesson (values within 1%, or the exact option set).
 * `manual`: questions that need a person to compare against the reference.
 *
 * Choice entries are paired by order: the lesson's `choice` list is read as a list (a string counts as
 * one element, no `choice` counts as none), and the k-th choice entry in the key is compared with its
 * k-th element. A missing or different element puts that question in `missing`, so a lesson that writes
 * one string for two choice sub-questions fails the second one.
 */
export function checkAnswerKey(id: string, lessonSource: string): { checked: boolean; missing: string[]; manual: string[] } {
  const key = answerKey(id)
  if (!key) return { checked: false, missing: [], manual: [] }
  const m = lessonSource.match(/^---\n([\s\S]*?)\n---/)
  let meta: { answers?: { value?: unknown }[]; choice?: unknown } = {}
  try {
    meta = m ? (YAML.parse(m[1]) ?? {}) : {}
  } catch {
    // An unparsable header is reported by the validator; here it simply matches nothing.
  }
  const lessonChoices: unknown[] = Array.isArray(meta.choice) ? meta.choice : meta.choice === undefined ? [] : [meta.choice]
  let choiceIndex = 0
  const values = (Array.isArray(meta.answers) ? meta.answers : []).map((a) => Number(a?.value)).filter(Number.isFinite)
  const close = (a: number, b: number) => Math.abs(a - b) <= Math.max(1e-9, Math.abs(b) * 0.01)
  const missing: string[] = []
  const manual: string[] = []
  // Each answer value may satisfy only one key entry: with N_1 = 8 N and v_1 = 8 m/s expected, a
  // lesson whose only 8 is v_1 must not pass N_1 too. Key names and lesson names are not aligned
  // (N_1 vs N1, prose vs symbols), so entries are matched to values by number alone.
  const numeric = key.filter((e) => e.any)
  const fits = numeric.map((e) => values.map((v) => e.any!.some((want) => close(v, want))))
  const owner: number[] = values.map(() => -1)
  const assign = (i: number, seen: boolean[]): boolean => {
    for (let j = 0; j < values.length; j++) {
      if (!fits[i][j] || seen[j]) continue
      seen[j] = true
      if (owner[j] < 0 || assign(owner[j], seen)) {
        owner[j] = i
        return true
      }
    }
    return false
  }
  const matched = new Set<number>()
  numeric.forEach((_, i) => {
    if (assign(i, values.map(() => false))) matched.add(i)
  })
  for (const e of key) {
    if (e.any) {
      if (!matched.has(numeric.indexOf(e))) missing.push(e.q)
    } else if (e.choice !== undefined) {
      const k = choiceIndex++
      if (k >= lessonChoices.length || letters(lessonChoices[k]) !== letters(e.choice)) missing.push(e.q)
    } else {
      manual.push(e.q)
    }
  }
  // A key with only manual entries checks nothing automatically; it must not count as "answer correct".
  return { checked: manual.length < key.length, missing, manual }
}
