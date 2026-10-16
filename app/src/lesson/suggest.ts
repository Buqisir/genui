// Picks the declared name a mistyped one was probably meant to be, for the "是不是 X？" hint in validation messages.
// Browser code imports this module (through validate.ts and store.tsx), so it must stay free of node-only imports.

/** Levenshtein distance between a and b, with two rows of the DP table. */
function editDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const cur: number[] = [i]
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = cur
  }
  return prev[b.length]
}

/**
 * The candidate closest to `name`, never `name` itself. A candidate equal to `name` ignoring case wins outright;
 * otherwise the nearest by edit distance, if that distance is at most 2 and at most half the name's length
 * (so a one-letter name gets no guess). Ties go to the candidate that comes first.
 */
export function closestName(name: string, candidates: Iterable<string>): string | undefined {
  const list = [...candidates].filter((c) => c !== name)
  const lower = name.toLowerCase()
  const sameIgnoringCase = list.find((c) => c.toLowerCase() === lower)
  if (sameIgnoringCase !== undefined) return sameIgnoringCase

  const limit = Math.min(2, Math.floor(name.length / 2))
  let best: string | undefined
  let bestDistance = Infinity
  for (const c of list) {
    const d = editDistance(name, c)
    if (d < bestDistance) {
      best = c
      bestDistance = d
    }
  }
  return best !== undefined && bestDistance <= limit ? best : undefined
}
