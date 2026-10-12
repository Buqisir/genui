// Plain-text labels may write subscripts as `U_R`, `v_0`, `R_{AB}`. Lessons are told not to
// use LaTeX inside component props, so this is the only markup labels support.

interface Part {
  text: string
  sub: boolean
}

// Unicode subscript glyphs (R₁, Rₕ) are missing from several label fonts and fall back with
// wide side bearings, so they are rendered as ordinary subscripts instead.
const UNICODE_SUB = '₀₁₂₃₄₅₆₇₈₉ₐₑₒₓₕₖₗₘₙₚₛₜ'
const UNICODE_PLAIN = '0123456789aeoxhklmnpst'
const PATTERN = new RegExp(`_\\{([^}]*)\\}|_([A-Za-z0-9]+)|([${UNICODE_SUB}]+)`, 'g')

export function richParts(s: string): Part[] {
  const parts: Part[] = []
  let last = 0
  for (const m of s.matchAll(PATTERN)) {
    if (m.index > last) parts.push({ text: s.slice(last, m.index), sub: false })
    const text = m[3] ? [...m[3]].map((ch) => UNICODE_PLAIN[UNICODE_SUB.indexOf(ch)]).join('') : (m[1] ?? m[2])
    parts.push({ text, sub: true })
    last = m.index + m[0].length
  }
  if (last < s.length) parts.push({ text: s.slice(last), sub: false })
  return parts
}

/** Text with subscript markers removed, for width estimates. */
export const plainOf = (s: string) => richParts(s).map((p) => p.text).join('')

export function Rich({ text, html = false }: { text: string; html?: boolean }) {
  const parts = richParts(text)
  if (parts.every((p) => !p.sub)) return <>{text}</>
  return (
    <>
      {parts.map((p, i) =>
        !p.sub ? (
          p.text
        ) : html ? (
          <sub key={i}>{p.text}</sub>
        ) : (
          <tspan key={i} baselineShift="sub" fontSize="72%">
            {p.text}
          </tspan>
        ),
      )}
    </>
  )
}
