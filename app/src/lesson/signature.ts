// One-line signatures of the whitelisted components, for hints in validation messages and the agent's prompt table.
// Format: Name(prop*: kind, prop: kind|kind). `*` marks a required prop; props follow declaration order in COMPONENTS.
// Browser code imports this module (through validate.ts), so it must not load docs/index.ts, which reads files with node:fs.
import type { Doc } from '../docs/index'
import { COMPONENTS, type PropSpec } from './components'

function propSignature(name: string, spec: PropSpec): string {
  const kinds = Array.isArray(spec.kind) ? spec.kind.join('|') : spec.kind
  return `${name}${spec.required ? '*' : ''}: ${kinds}`
}

/** `Define(name*: string, expr*: expr, label: string, unit: string)`, or null for a component that is not in COMPONENTS. */
export function signature(component: string): string | null {
  const spec = COMPONENTS[component]
  if (!spec) return null
  return `${component}(${Object.entries(spec).map(([name, ps]) => propSignature(name, ps)).join(', ')})`
}

/**
 * One line per component in COMPONENTS order: `<signature> — <card title>`, or the signature alone when no card
 * names it. `cards` is loadDocs() from docs/index.ts; the caller passes it so this module stays browser-safe.
 */
export function signatureTable(cards: readonly Pick<Doc, 'component' | 'title'>[]): string {
  return Object.keys(COMPONENTS)
    .map((component) => {
      const sig = signature(component)!
      const card = cards.find((d) => d.component === component)
      return card ? `${sig} — ${card.title}` : sig
    })
    .join('\n')
}
