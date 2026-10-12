// Which curve of a multi-series <Plot> a mark without `series` refers to.

const norm = (s: string) => s.replace(/\$/g, '').replace(/[{}\s]/g, '')
const TOKEN = /[A-Za-zα-ωΑ-Ω]+(?:_[A-Za-z0-9α-ωΑ-Ω]+)?/g
const tokens = (s: string) => new Set(norm(s).match(TOKEN) ?? [])

/**
 * Judged by what the mark's label names: a symbol only one curve's label has ("v_y 回到 0"
 * against "v_x" and "v_y"), or one curve's whole label ("甲车追上"). undefined when that
 * picks no curve or more than one; a single curve is always 0.
 */
export function markSeries(label: string, seriesLabels: string[]): number | undefined {
  if (seriesLabels.length <= 1) return 0
  const mark = norm(label)
  const markTokens = tokens(label)
  const sets = seriesLabels.map(tokens)
  const count = new Map<string, number>()
  sets.forEach((s) => s.forEach((t) => count.set(t, (count.get(t) ?? 0) + 1)))
  const named = seriesLabels.map((l) => {
    const whole = norm(l)
    return whole.length > 0 && mark.includes(whole)
  })
  const hits = seriesLabels.flatMap((_, i) => {
    const bySymbol = [...sets[i]].some((t) => count.get(t) === 1 && markTokens.has(t))
    const byName = named[i] && named.filter(Boolean).length === 1
    return bySymbol || byName ? [i] : []
  })
  return hits.length === 1 ? hits[0] : undefined
}
