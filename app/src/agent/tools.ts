// OpenAI-style function tools over the shared core. Render is omitted unless asked for:
// a text-only model cannot use a screenshot.
import { checkLayout, formatLayoutReport } from './layout'
import { renderLesson } from './render'
import {
  formatValidation,
  getDoc,
  searchDocs,
  validateLesson,
  type DocError,
  type DocText,
} from './core'

export interface ToolFunctionSchema {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      additionalProperties: false
      properties: Record<string, { type: 'string'; description: string }>
      required: string[]
    }
  }
}

const GET_DOC: ToolFunctionSchema = {
  type: 'function',
  function: {
    name: 'get_doc',
    description: '按 id 取一份文档。先读 index（入口），选定组件后再读组件卡或参考。',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        id: { type: 'string', description: '文档 id，例如 index、plot、motion-forces' },
      },
      required: ['id'],
    },
  },
}

const SEARCH_DOCS: ToolFunctionSchema = {
  type: 'function',
  function: {
    name: 'search_docs',
    description: '在文档标题、小标题和正文里搜索，返回最相关的几条和匹配片段。',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        query: { type: 'string', description: '中文词或代码名，例如 摩擦、v.efield、areas' },
      },
      required: ['query'],
    },
  },
}

const VALIDATE: ToolFunctionSchema = {
  type: 'function',
  function: {
    name: 'validate',
    description: '校验整份课件。每条错误都带该读的文档 id，改完再调一次，直到通过。',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        lesson: { type: 'string', description: '课件文件的完整正文' },
      },
      required: ['lesson'],
    },
  },
}

const CHECK_LAYOUT: ToolFunctionSchema = {
  type: 'function',
  function: {
    name: 'check_layout',
    description: '检查画面里的标签是否压线或出界，返回文字报告，不需要看图。',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        lesson: { type: 'string', description: '课件文件的完整正文' },
      },
      required: ['lesson'],
    },
  },
}

const RENDER: ToolFunctionSchema = {
  type: 'function',
  function: {
    name: 'render',
    description: '把课件渲成图片。只有能看图时才调用。',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        lesson: { type: 'string', description: '课件文件的完整正文' },
      },
      required: ['lesson'],
    },
  },
}

const BASE_TOOLS = [GET_DOC, SEARCH_DOCS, VALIDATE, CHECK_LAYOUT]

/** Default tool list. Pass `{ render: true }` to include `render` for a model that can see images. */
export function toolSchemas(options?: { render?: boolean }): ToolFunctionSchema[] {
  return options?.render ? [...BASE_TOOLS, RENDER] : [...BASE_TOOLS]
}

export const TOOL_SCHEMAS: ToolFunctionSchema[] = toolSchemas()

function isDocError(doc: DocText | DocError): doc is DocError {
  return 'error' in doc
}

function str(args: Record<string, unknown>, key: string): string | null {
  const v = args[key]
  return typeof v === 'string' ? v : null
}

function argsOf(args: unknown): Record<string, unknown> {
  return args && typeof args === 'object' && !Array.isArray(args) ? (args as Record<string, unknown>) : {}
}

export async function runTool(name: string, args: unknown): Promise<string> {
  try {
    const a = argsOf(args)
    if (name === 'get_doc') {
      const id = str(a, 'id')
      if (id === null || !id.trim()) return '参数不对：get_doc 需要字符串 id。'
      const doc = getDoc(id)
      if (isDocError(doc)) return doc.error
      return doc.text
    }
    if (name === 'search_docs') {
      const query = str(a, 'query')
      if (query === null || !query.trim()) return '参数不对：search_docs 需要字符串 query。'
      const hits = searchDocs(query)
      if (!hits.length) return '没有匹配。'
      return hits.map((h) => `${h.id}\t${h.layer}\t${h.title}\n  ${h.snippet.replace(/\n/g, '\n  ')}`).join('\n')
    }
    if (name === 'validate') {
      const lesson = str(a, 'lesson')
      if (lesson === null) return '参数不对：validate 需要字符串 lesson（课件全文）。'
      return formatValidation('课件', validateLesson(lesson))
    }
    if (name === 'check_layout') {
      const lesson = str(a, 'lesson')
      if (lesson === null) return '参数不对：check_layout 需要字符串 lesson（课件全文）。'
      const report = await checkLayout(lesson)
      return formatLayoutReport(report)
    }
    if (name === 'render') {
      const lesson = str(a, 'lesson')
      if (lesson === null) return '参数不对：render 需要字符串 lesson（课件全文）。'
      const outDir = str(a, 'outDir') ?? 'genui-shots'
      const result = await renderLesson(lesson, { outDir })
      const files = result.files.length ? result.files.map((f) => `- ${f}`).join('\n') : '（无）'
      const errors = result.consoleErrors.length ? result.consoleErrors.map((e) => `- ${e}`).join('\n') : '无'
      return `写出 ${result.files.length} 个文件：\n${files}\n控制台错误：\n${errors}`
    }
    return `没有这个工具：${name}。可用：${toolSchemas({ render: true }).map((t) => t.function.name).join('、')}。`
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return `工具出错：${msg}`
  }
}
