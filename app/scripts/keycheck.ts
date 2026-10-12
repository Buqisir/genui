// Batch answer-key check. stdin: JSON [{id, file}]; stdout: JSON [{id, file, checked, missing}].
import { readFileSync } from 'node:fs'
import { checkAnswerKey } from './answerkey'

const items = JSON.parse(readFileSync(0, 'utf8')) as { id: string; file: string }[]
const out = items.map(({ id, file }) => {
  const r = checkAnswerKey(id, readFileSync(file, 'utf8'))
  return { id, file, checked: r.checked, missing: r.missing }
})
console.log(JSON.stringify(out))
