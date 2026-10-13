// The sandbox CSP blocks font requests, so the host fetches the few Latin/Greek
// faces the canvas needs and hands the bytes over; the sandbox registers them
// with FontFace. CJK text in the canvas falls back to the system font.
import monoGreek from '@fontsource/jetbrains-mono/files/jetbrains-mono-greek-500-normal.woff2?url'
import monoLatin from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2?url'
import monoLatinBold from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2?url'
import serifGreek from '@fontsource/source-serif-4/files/source-serif-4-greek-400-italic.woff2?url'
import serifLatin from '@fontsource/source-serif-4/files/source-serif-4-latin-400-italic.woff2?url'
import serifLatinExt from '@fontsource/source-serif-4/files/source-serif-4-latin-ext-400-italic.woff2?url'

export interface FontPayload {
  family: string
  weight: string
  style: string
  unicodeRange?: string
  data: ArrayBuffer
}

const SOURCES: (Omit<FontPayload, 'data'> & { url: string })[] = [
  { url: monoLatin, family: 'GZ Mono', weight: '500', style: 'normal', unicodeRange: 'U+0000-00FF,U+2000-206F,U+2190-21FF,U+2212' },
  { url: monoLatinBold, family: 'GZ Mono', weight: '700', style: 'normal', unicodeRange: 'U+0000-00FF,U+2000-206F,U+2212' },
  { url: monoGreek, family: 'GZ Mono', weight: '500', style: 'normal', unicodeRange: 'U+0370-03FF' },
  { url: serifLatin, family: 'GZ Symbol', weight: '400', style: 'italic', unicodeRange: 'U+0000-00FF,U+2000-206F' },
  { url: serifLatinExt, family: 'GZ Symbol', weight: '400', style: 'italic', unicodeRange: 'U+0100-024F,U+1E00-1EFF,U+2070-209F' },
  { url: serifGreek, family: 'GZ Symbol', weight: '400', style: 'italic', unicodeRange: 'U+0370-03FF' },
]

let pending: Promise<FontPayload[]> | null = null

/** A single-file build inlines the faces as data: URLs, which some page CSPs refuse to fetch. */
async function fontBytes(url: string): Promise<ArrayBuffer> {
  const inline = /^data:[^,]*;base64,/.exec(url)
  if (inline) {
    const bin = atob(url.slice(inline[0].length))
    const out = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
    return out.buffer
  }
  const res = await fetch(url)
  return res.arrayBuffer()
}

export function loadSandboxFonts(): Promise<FontPayload[]> {
  if (!pending) {
    pending = Promise.all(
      SOURCES.map(async ({ url, ...rest }) => ({ ...rest, data: await fontBytes(url) })),
    ).catch(() => [])
  }
  return pending
}
