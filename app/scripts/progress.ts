// Compares two rounds of validator errors so a retry prompt can say what the model has fixed.
//
// Two issues are "the same" when their `code` is equal and their `block` is equal. When neither has a
// `block`, the full `message` is compared instead. `line` is ignored because edits shift line numbers.
// Repeated keys are counted as a multiset: two identical errors last round and one this round gives
// one fixed and one remaining. Only errors are compared here, never warnings.
export interface ProgressIssue { code?: string; block?: string; line?: number; message: string }

function sameIssue(a: ProgressIssue, b: ProgressIssue): boolean {
  if ((a.code ?? '') !== (b.code ?? '')) return false
  if (a.block === undefined && b.block === undefined) return a.message === b.message
  return a.block === b.block
}

/** `fixed` were in `prev` only, `remaining` are in both (the current copy), `added` are in `now` only. */
export function progressOf(prev: ProgressIssue[], now: ProgressIssue[]): { fixed: ProgressIssue[]; remaining: ProgressIssue[]; added: ProgressIssue[] } {
  const used = prev.map(() => false)
  const remaining: ProgressIssue[] = []
  const added: ProgressIssue[] = []
  for (const issue of now) {
    const j = prev.findIndex((p, k) => !used[k] && sameIssue(p, issue))
    if (j >= 0) {
      used[j] = true
      remaining.push(issue)
    } else {
      added.push(issue)
    }
  }
  const fixed = prev.filter((_, k) => !used[k])
  return { fixed, remaining, added }
}

/** A short label for one issue: its block (or line), then its code. Falls back to the message. */
function labelOf(i: ProgressIssue): string {
  // Answer-key misses carry the question as their block; say what they are in the report's own words.
  if (i.code === 'answer-key') return `答案核对「${i.block ?? i.message}」`
  const where = i.block ?? (i.line ? `第 ${i.line} 行` : undefined)
  const parts = [where, i.code].filter((s): s is string => Boolean(s))
  return parts.length ? parts.join(' ') : i.message
}

/** Chinese sentence for the retry prompt. Empty when the previous round had no errors. */
export function formatProgress(p: ReturnType<typeof progressOf>): string {
  const prevCount = p.fixed.length + p.remaining.length
  if (prevCount === 0) return ''
  if (p.remaining.length === 0 && p.added.length === 0) return `上一轮的 ${prevCount} 条错误都已改好。`
  const list = (xs: ProgressIssue[]) => (xs.length ? `（${xs.map(labelOf).join('，')}）` : '')
  return `和上一轮比：上一轮 ${prevCount} 条错误，已改好 ${p.fixed.length} 条；仍未解决 ${p.remaining.length} 条${list(p.remaining)}；新出现 ${p.added.length} 条${list(p.added)}。`
}
