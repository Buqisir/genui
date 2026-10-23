import { Markdown } from '../../LessonView'

/** Text that may hold $…$ formulas, rendered with the lesson's Markdown (a div, not a paragraph, so it nests anywhere). */
export function Md({ text, className }: { text: unknown; className?: string }) {
  const s = typeof text === 'string' ? text : text == null ? '' : String(text)
  return (
    <div className={`tx-md${className ? ' ' + className : ''}`}>
      <Markdown text={s} />
    </div>
  )
}

/** A string or an array of strings, as a list of non-empty strings. */
export const strList = (v: unknown): string[] =>
  (Array.isArray(v) ? v : [v]).filter((x): x is string => typeof x === 'string' && x.trim() !== '')

export const str = (v: unknown) => (typeof v === 'string' ? v : '')

/** `n` clamped into 0..max. */
export const clamp = (n: number, max: number) => Math.max(0, Math.min(n, max))
