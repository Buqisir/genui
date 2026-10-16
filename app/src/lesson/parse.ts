import JSON5 from 'json5'
import YAML from 'yaml'

export type Props = Record<string, unknown>

export type Block =
  | { kind: 'markdown'; text: string }
  | {
      kind: 'component'
      name: string
      props: Props
      body?: string
      /** 1-based line of the opening tag. */
      line: number
      /** 1-based line of the block's last line: the closing tag for paired tags, the opening tag's last line otherwise. */
      end: number
    }

export interface Lesson {
  meta: Record<string, unknown>
  blocks: Block[]
  errors: ParseError[]
}

export interface ParseError {
  line: number
  message: string
  /** Set when a tag or code fence never closes, so everything from `line` to the end of the file went unread. */
  unclosed?: Unclosed
}

export interface Unclosed {
  /** Component name (`Sim`), or the fence marker (```` ``` ```` / `~~~`) for a code fence. */
  tag: string
  /** Last non-blank line of the file, 1-based: the unread range is `line`..`end`. */
  end: number
  /** Lines in the unread range (after the first) that start a component tag, i.e. components the parser never saw. */
  components: number
}

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/
/** A line that opens a component tag (checked on the trimmed line plus a space, so a bare `<Sim` counts). */
const COMPONENT_START = /^<[A-Z][A-Za-z0-9]*[\s/>]/

/** Lines `from`..`to` (0-based, inclusive) of the body that open a component tag. */
function countComponentLines(lines: string[], from: number, to: number): number {
  let n = 0
  for (let k = from; k <= to && k < lines.length; k++) if (COMPONENT_START.test(lines[k].trim() + ' ')) n++
  return n
}

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
  // The opening fence of the code block that is open now: its body index and marker (``` or ~~~).
  let fence: { index: number; mark: string } | null = null

  // Last non-blank body line (0-based). An unread range runs from its start line to this one.
  let lastNonBlank = lines.length - 1
  while (lastNonBlank > 0 && lines[lastNonBlank].trim() === '') lastNonBlank--
  const endLine = lastNonBlank + 1 + lineOffset

  /** The 「（第 a–b 行）」 part of an unclosed message: the unread range, from its start line to the end of the file. */
  const unreadSpan = (startLine: number) => `（第 ${startLine}–${endLine} 行）`

  const flushMarkdown = () => {
    const text = md.join('\n')
    if (text.trim()) blocks.push({ kind: 'markdown', text })
    md = []
  }

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    const fenceMark = /^(```|~~~)/.exec(trimmed)?.[1]
    if (fenceMark) {
      if (!inFence) fence = { index: i, mark: fenceMark }
      inFence = !inFence
    }

    if (!inFence && COMPONENT_START.test(trimmed + ' ')) {
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
      if (tag instanceof Error) {
        errors.push({ line: startLine, message: tag.message })
        md.push(...lines.slice(i, j + 1))
        i = j + 1
        continue
      }
      if (tag === 'incomplete') {
        // The opening tag runs to the end of the file: nothing after it was read.
        const name = /<([A-Z][A-Za-z0-9]*)/.exec(text)?.[1] ?? ''
        const n = countComponentLines(lines, i + 1, lastNonBlank)
        const tail = n === 0
          ? '。这段里没有别的组件，看起来输出在这里中断了：补全这个标签（以 > 或 /> 结尾）和后面没写完的内容'
          : `，其中还有 ${n} 个组件。补全这个标签（以 > 或 /> 结尾）`
        errors.push({
          line: startLine,
          message: `组件标签没有闭合：从这里到文件末尾${unreadSpan(startLine)}都没有读到${tail}`,
          unclosed: { tag: name, end: endLine, components: n },
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
        blocks.push({ kind: 'component', name: tag.name, props: tag.props, line: startLine, end: j + 1 + lineOffset })
        i = j + 1
        continue
      }

      const close = `</${tag.name}>`
      let k = j + 1
      while (k < lines.length && lines[k].trim() !== close) k++
      if (k >= lines.length) {
        // No closing tag: everything from the opening tag to the end of the file went unread.
        const n = countComponentLines(lines, i + 1, lastNonBlank)
        const tail = n === 0
          ? `。这段里没有别的组件，看起来输出在这里中断了：补上 ${close} 和后面没写完的内容`
          : `，其中还有 ${n} 个组件。在 <${tag.name}> 的内容结束处补上 ${close}`
        errors.push({
          line: startLine,
          message: `缺少 ${close}：从这里到文件末尾${unreadSpan(startLine)}都没有读到${tail}`,
          unclosed: { tag: tag.name, end: endLine, components: n },
        })
        i = lines.length
        continue
      }
      blocks.push({
        kind: 'component',
        name: tag.name,
        props: tag.props,
        body: lines.slice(j + 1, k).join('\n'),
        line: startLine,
        end: k + 1 + lineOffset,
      })
      i = k + 1
      continue
    }

    md.push(line)
    i++
  }
  if (inFence && fence) {
    // The code block never closed, so the components after it were read as code and never parsed.
    const startLine = fence.index + 1 + lineOffset
    const n = countComponentLines(lines, fence.index + 1, lastNonBlank)
    const tail = n === 0
      ? `。这段里没有组件，看起来输出在这里中断了：补上 ${fence.mark} 和后面没写完的内容`
      : `，其中 ${n} 个组件没有读到。在代码结束处补上 ${fence.mark}`
    errors.push({
      line: startLine,
      message: `代码块（${fence.mark}）没有闭合：从这里到文件末尾${unreadSpan(startLine)}都被当成了代码${tail}`,
      unclosed: { tag: fence.mark, end: endLine, components: n },
    })
  }
  flushMarkdown()

  return { meta, blocks, errors }
}

/** Length of the opening tag at the start of src (src starts at "<"), or -1 if it is incomplete or invalid. */
export function openingTagLength(src: string): number {
  const tag = tryParseTag(src)
  if (tag === 'incomplete' || tag instanceof Error) return -1
  return src.length - tag.rest.length
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
