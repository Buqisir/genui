import JSON5 from 'json5'
import YAML from 'yaml'

export type Props = Record<string, unknown>

export type Block =
  | { kind: 'markdown'; text: string }
  | { kind: 'component'; name: string; props: Props; body?: string; line: number }

export interface Lesson {
  meta: Record<string, unknown>
  blocks: Block[]
  errors: ParseError[]
}

export interface ParseError {
  line: number
  message: string
}

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

export function parseLesson(source: string): Lesson {
  const errors: ParseError[] = []
  let meta: Record<string, unknown> = {}
  let body = source
  let lineOffset = 0

  const fm = FRONT_MATTER.exec(source)
  if (fm) {
    try {
      meta = (YAML.parse(fm[1]) as Record<string, unknown>) ?? {}
    } catch (e) {
      errors.push({ line: 1, message: `头信息不是合法的 YAML：${(e as Error).message}` })
    }
    body = source.slice(fm[0].length)
    lineOffset = fm[0].split('\n').length - 1
  }

  const lines = body.split('\n')
  const blocks: Block[] = []
  let md: string[] = []
  let inFence = false

  const flushMarkdown = () => {
    const text = md.join('\n')
    if (text.trim()) blocks.push({ kind: 'markdown', text })
    md = []
  }

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (/^(```|~~~)/.test(trimmed)) inFence = !inFence

    if (!inFence && /^<[A-Z][A-Za-z0-9]*[\s/>]/.test(trimmed + ' ')) {
      const startLine = i + 1 + lineOffset
      // A tag may span several lines; accumulate until the opening tag closes.
      let text = lines[i]
      let j = i
      let tag = tryParseTag(text)
      while (tag === 'incomplete' && j + 1 < lines.length) {
        j++
        text += '\n' + lines[j]
        tag = tryParseTag(text)
      }
      if (tag === 'incomplete' || tag instanceof Error) {
        errors.push({
          line: startLine,
          message: tag instanceof Error ? tag.message : '组件标签没有闭合',
        })
        md.push(...lines.slice(i, j + 1))
        i = j + 1
        continue
      }

      flushMarkdown()
      if (tag.rest.trim()) {
        errors.push({ line: startLine, message: `标签后面不能有其他内容：${tag.rest.trim()}` })
      }

      if (tag.selfClosing) {
        blocks.push({ kind: 'component', name: tag.name, props: tag.props, line: startLine })
        i = j + 1
        continue
      }

      const close = `</${tag.name}>`
      let k = j + 1
      while (k < lines.length && lines[k].trim() !== close) k++
      if (k >= lines.length) {
        errors.push({ line: startLine, message: `缺少 ${close}` })
        i = lines.length
        continue
      }
      blocks.push({
        kind: 'component',
        name: tag.name,
        props: tag.props,
        body: lines.slice(j + 1, k).join('\n'),
        line: startLine,
      })
      i = k + 1
      continue
    }

    md.push(line)
    i++
  }
  flushMarkdown()

  return { meta, blocks, errors }
}

interface ParsedTag {
  name: string
  props: Props
  selfClosing: boolean
  rest: string
}

function tryParseTag(src: string): ParsedTag | Error | 'incomplete' {
  let p = src.indexOf('<') + 1
  const nameMatch = /^[A-Z][A-Za-z0-9]*/.exec(src.slice(p))
  if (!nameMatch) return new Error('组件名必须以大写字母开头')
  const name = nameMatch[0]
  p += name.length
  const props: Props = {}

  const skipSpace = () => {
    while (p < src.length && /\s/.test(src[p])) p++
  }

  for (;;) {
    skipSpace()
    if (p >= src.length) return 'incomplete'
    if (src.startsWith('/>', p)) {
      return { name, props, selfClosing: true, rest: src.slice(p + 2) }
    }
    if (src[p] === '>') {
      return { name, props, selfClosing: false, rest: src.slice(p + 1) }
    }

    const attr = /^[A-Za-z_][A-Za-z0-9_-]*/.exec(src.slice(p))
    if (!attr) return new Error(`${name}：无法识别的属性写法 "${src.slice(p, p + 12)}"`)
    const key = attr[0]
    p += key.length
    skipSpace()
    if (src[p] !== '=') {
      props[key] = true
      continue
    }
    p++
    skipSpace()
    if (p >= src.length) return 'incomplete'

    if (src[p] === '"') {
      const end = src.indexOf('"', p + 1)
      if (end < 0) return 'incomplete'
      props[key] = src.slice(p + 1, end)
      p = end + 1
    } else if (src[p] === '{') {
      const end = matchBrace(src, p)
      if (end < 0) return 'incomplete'
      const raw = src.slice(p + 1, end)
      try {
        props[key] = JSON5.parse(raw)
      } catch (e) {
        return new Error(`${name}.${key}：属性值不是合法的 JSON5（${(e as Error).message}）`)
      }
      p = end + 1
    } else {
      return new Error(`${name}.${key}：属性值要用 "..." 或 {...}`)
    }
  }
}

/** Index of the brace matching src[start], skipping string literals. -1 if unbalanced. */
function matchBrace(src: string, start: number): number {
  let depth = 0
  let quote: string | null = null
  for (let i = start; i < src.length; i++) {
    const c = src[i]
    if (quote) {
      if (c === '\\') i++
      else if (c === quote) quote = null
      continue
    }
    if (c === '"' || c === "'" || c === '`') quote = c
    else if (c === '{' || c === '[') depth++
    else if (c === '}' || c === ']') {
      depth--
      if (depth === 0) return c === '}' ? i : -1
    }
  }
  return -1
}
