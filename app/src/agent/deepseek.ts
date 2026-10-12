// DeepSeek chat client and the tool loop. No SDK: just fetch.
//
// Thinking mode and `reasoning_content` (https://api-docs.deepseek.com/guides/thinking_mode#tool-calls):
// when the request carries `tools`, every previous assistant turn's `reasoning_content` must be
// sent back in full, including turns that did not call a tool. Leaving it out makes the API
// return 400. When the request does not carry `tools`, `reasoning_content` is ignored and is
// not sent (https://api-docs.deepseek.com/guides/thinking_mode#multi-turn-conversation).
// The one-shot full/single calls therefore send a single user message and no `tools` field.
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { checkLayout, formatLayoutReport } from './layout'
import { agentSystemPrompt, agentUserPrompt, type LessonProblem } from './prompt'
import { formatValidation, validateLesson } from './core'
import { runTool, TOOL_SCHEMAS, type ToolFunctionSchema } from './tools'

/** USD per 1,000,000 tokens, from https://api-docs.deepseek.com/quick_start/pricing (page dated 2026-09-14). */
export const PRICE_SOURCE = 'https://api-docs.deepseek.com/quick_start/pricing'
export const PRICE_AS_OF = '2026-09-14'

/**
 * Off-peak is half of peak. Peak hours are Monday–Friday 01:00–04:00 and 06:00–10:00 UTC.
 * Weekends are off-peak. Chinese public holidays are also off-peak; they are not special-cased
 * here, so a holiday that falls inside the window is priced as peak (a slight overestimate).
 */
export interface TokenRates {
  cacheHit: number
  cacheMiss: number
  output: number
}

export const DEEPSEEK_RATES: Record<string, { peak: TokenRates; offPeak: TokenRates }> = {
  'deepseek-flash': {
    offPeak: { cacheHit: 0.003, cacheMiss: 0.15, output: 0.6 },
    peak: { cacheHit: 0.006, cacheMiss: 0.3, output: 1.2 },
  },
  'deepseek-v4-pro': {
    offPeak: { cacheHit: 0.022, cacheMiss: 0.66, output: 1.98 },
    peak: { cacheHit: 0.044, cacheMiss: 1.32, output: 3.96 },
  },
}

/** https://api-docs.deepseek.com/quick_start/pricing — both models, 1M context, 384K max output. */
export const DEEPSEEK_CONTEXT_TOKENS = 1_000_000
export const DEEPSEEK_MAX_OUTPUT_TOKENS = 393_216
/** Default completion budget in thinking mode when `max_tokens` is omitted. */
export const DEEPSEEK_THINKING_OUTPUT_TOKENS = 65_536

export const DEFAULT_MODEL = 'deepseek-flash'
const DEFAULT_BASE = 'https://api.deepseek.com'

export interface TokenUsage {
  prompt: number
  cacheHit: number
  cacheMiss: number
  completion: number
  reasoning: number
}

export const EMPTY_USAGE: TokenUsage = { prompt: 0, cacheHit: 0, cacheMiss: 0, completion: 0, reasoning: 0 }

export function addUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    prompt: a.prompt + b.prompt,
    cacheHit: a.cacheHit + b.cacheHit,
    cacheMiss: a.cacheMiss + b.cacheMiss,
    completion: a.completion + b.completion,
    reasoning: a.reasoning + b.reasoning,
  }
}

export function isPeakUtc(at: Date): boolean {
  const day = at.getUTCDay()
  if (day === 0 || day === 6) return false
  const hour = at.getUTCHours()
  return (hour >= 1 && hour < 4) || (hour >= 6 && hour < 10)
}

export function ratesFor(model: string, at: Date): TokenRates {
  const table = DEEPSEEK_RATES[model] ?? DEEPSEEK_RATES[DEFAULT_MODEL]
  return isPeakUtc(at) ? table.peak : table.offPeak
}

/** Completion tokens already include reasoning tokens; those are not added again. */
export function costUsd(usage: TokenUsage, model: string, at: Date): number {
  const rates = ratesFor(model, at)
  const hit = usage.cacheHit
  const miss = usage.cacheMiss || Math.max(0, usage.prompt - hit)
  return (hit * rates.cacheHit + miss * rates.cacheMiss + usage.completion * rates.output) / 1_000_000
}

export function formatUsageNote(usage: TokenUsage, cost: number, extra = ''): string {
  const k = (n: number) => `${Math.round(n / 1000)}k`
  const reasoning = usage.reasoning ? `，推理 ${k(usage.reasoning)}` : ''
  return `，$${cost.toFixed(4)}，输入 ${k(usage.prompt)} / 输出 ${k(usage.completion)} token${reasoning}${extra}`
}

/** Bytes/2 overestimates tokens (Chinese is ~3 bytes each). Used only to refuse a prompt that cannot fit. */
export function estimateTokens(text: string): number {
  return Math.ceil(Buffer.byteLength(text) / 2)
}

export function inputTokenBudget(): number {
  return DEEPSEEK_CONTEXT_TOKENS - DEEPSEEK_THINKING_OUTPUT_TOKENS
}

export class DeepseekError extends Error {
  readonly status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'DeepseekError'
    this.status = status
  }
}

export function assertFitsContext(text: string): void {
  const est = estimateTokens(text)
  const budget = inputTokenBudget()
  if (est > budget) {
    throw new DeepseekError(
      `提示词约 ${est} token（按字节／2 高估），超过 deepseek 上下文 ${DEEPSEEK_CONTEXT_TOKENS}（留给思考输出 ${DEEPSEEK_THINKING_OUTPUT_TOKENS} 后还能放 ${budget}）。见 ${PRICE_SOURCE}`,
    )
  }
}

/** Strip the key and any Authorization bearer token. `secret` is never written back out. */
export function redactSecrets(text: string, secret?: string): string {
  let out = text.replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')
  out = out.replace(/DEEPSEEK_API_KEY\s*[=:]\s*\S+/g, 'DEEPSEEK_API_KEY=[REDACTED]')
  if (secret && secret.length >= 8) out = out.split(secret).join('[REDACTED]')
  return out
}

export function redactHeaders(headers: Record<string, string>, secret?: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    out[key] = key.toLowerCase() === 'authorization' ? 'Bearer [REDACTED]' : redactSecrets(value, secret)
  }
  return out
}

export interface DeepseekConfig {
  apiKey: string
  baseUrl: string
}

export function parseDeepseekEnv(text: string): { apiKey?: string; baseUrl?: string } {
  let apiKey: string | undefined
  let baseUrl: string | undefined
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const m = trimmed.match(/^(?:export\s+)?(DEEPSEEK_API_KEY|DEEPSEEK_BASE_URL)\s*=\s*(.*)$/)
    if (!m) continue
    let value = m[2].trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    if (m[1] === 'DEEPSEEK_API_KEY') apiKey = value
    else baseUrl = value
  }
  return { apiKey, baseUrl }
}

export function loadDeepseekConfig(opts?: { env?: Record<string, string | undefined>; envFile?: string }): DeepseekConfig {
  const env = opts?.env ?? process.env
  let apiKey = env.DEEPSEEK_API_KEY?.trim() ?? ''
  let baseUrl = env.DEEPSEEK_BASE_URL?.trim() ?? ''
  if (!apiKey || !baseUrl) {
    const path = opts?.envFile ?? join(homedir(), '.genui', 'deepseek.env')
    let text = ''
    try {
      text = readFileSync(path, 'utf8')
    } catch {
      text = ''
    }
    const parsed = parseDeepseekEnv(text)
    if (!apiKey && parsed.apiKey) apiKey = parsed.apiKey
    if (!baseUrl && parsed.baseUrl) baseUrl = parsed.baseUrl
  }
  if (!apiKey) {
    throw new DeepseekError('没有 DeepSeek key：设置环境变量 DEEPSEEK_API_KEY，或在 ~/.genui/deepseek.env 里写 DEEPSEEK_API_KEY=…')
  }
  return { apiKey, baseUrl: (baseUrl || DEFAULT_BASE).replace(/\/+$/, '') }
}

interface ToolCallWire {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

interface AssistantTurn {
  role: 'assistant'
  content: string | null
  reasoning_content: string
  tool_calls?: ToolCallWire[]
}

type ChatMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
  | AssistantTurn
  | { role: 'tool'; tool_call_id: string; content: string }

export interface ChatCall {
  messages: ChatMessage[]
  model?: string
  thinking?: boolean
  reasoningEffort?: 'none' | 'low' | 'high' | 'max'
  tools?: ToolFunctionSchema[]
  json?: boolean
  timeoutMs?: number
  config?: DeepseekConfig
  fetchImpl?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  maxRetries?: number
  at?: Date
  signal?: AbortSignal
}

export interface ChatResult {
  content: string
  assistant: AssistantTurn
  toolCalls: { id: string; name: string; arguments: string }[]
  finishReason: string
  usage: TokenUsage
  costUsd: number
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
}

function num(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0
}

export function usageFrom(raw: unknown): TokenUsage {
  const u = asRecord(raw)
  const details = asRecord(u?.completion_tokens_details)
  const promptDetails = asRecord(u?.prompt_tokens_details)
  const prompt = num(u?.prompt_tokens)
  const hit = num(u?.prompt_cache_hit_tokens) || num(promptDetails?.cached_tokens)
  let miss = num(u?.prompt_cache_miss_tokens)
  if (!miss && prompt) miss = Math.max(0, prompt - hit)
  return {
    prompt,
    cacheHit: hit,
    cacheMiss: miss,
    completion: num(u?.completion_tokens),
    reasoning: num(details?.reasoning_tokens),
  }
}

const RETRYABLE = new Set([429, 500, 502, 503, 504])

function backoffMs(attempt: number, retryAfter: string | null): number {
  if (retryAfter) {
    const seconds = Number(retryAfter)
    if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 60_000)
  }
  return Math.min(1000 * 2 ** attempt, 30_000)
}

async function readBody(res: Response): Promise<string> {
  const text = await res.text()
  return text.replace(/^(?:[ \t]*\r?\n)+/, '')
}

export async function deepseekChat(opts: ChatCall): Promise<ChatResult> {
  const config = opts.config ?? loadDeepseekConfig()
  const model = opts.model || DEFAULT_MODEL
  const thinking = opts.thinking !== false
  const reasoningEffort = opts.reasoningEffort ?? (thinking ? 'high' : 'none')
  const timeoutMs = opts.timeoutMs ?? 10 * 60_000
  const maxRetries = opts.maxRetries ?? 4
  const sleep = opts.sleep ?? ((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)))
  const fetchImpl = opts.fetchImpl ?? fetch
  const at = opts.at ?? new Date()

  const body: Record<string, unknown> = {
    model,
    messages: opts.messages,
    thinking: { type: thinking ? 'enabled' : 'disabled' },
    reasoning_effort: reasoningEffort,
    stream: false,
  }
  // Omit `tools` entirely when absent. An empty array would still "carry tools",
  // which changes the reasoning_content rule. See the file comment.
  if (opts.tools?.length) body.tools = opts.tools
  if (opts.json) body.response_format = { type: 'json_object' }

  let lastError = 'DeepSeek 请求失败'
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (opts.signal?.aborted) throw new DeepseekError('DeepSeek 请求已取消')
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    const onAbort = () => ctrl.abort()
    opts.signal?.addEventListener('abort', onAbort, { once: true })
    try {
      const res = await fetchImpl(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      })
      const text = await readBody(res)
      if (!res.ok) {
        const safe = redactSecrets(text.slice(0, 500), config.apiKey)
        lastError = `DeepSeek ${res.status}：${safe}`
        if (!RETRYABLE.has(res.status) || attempt === maxRetries) throw new DeepseekError(lastError, res.status)
        await sleep(backoffMs(attempt, res.headers.get('retry-after')))
        continue
      }
      let json: unknown
      try {
        json = JSON.parse(text)
      } catch {
        lastError = 'DeepSeek 返回的不是 JSON'
        if (attempt === maxRetries) throw new DeepseekError(lastError)
        await sleep(backoffMs(attempt, null))
        continue
      }
      const root = asRecord(json)
      const choice = asRecord(Array.isArray(root?.choices) ? root.choices[0] : null)
      const message = asRecord(choice?.message)
      if (!message) throw new DeepseekError('DeepSeek 响应里没有 message')
      const callsRaw = Array.isArray(message.tool_calls) ? message.tool_calls : []
      const toolCalls: ToolCallWire[] = []
      for (const item of callsRaw) {
        const call = asRecord(item)
        const fn = asRecord(call?.function)
        const id = typeof call?.id === 'string' ? call.id : ''
        const name = typeof fn?.name === 'string' ? fn.name : ''
        if (!id || !name) continue
        toolCalls.push({
          id,
          type: 'function',
          function: { name, arguments: typeof fn?.arguments === 'string' ? fn.arguments : '' },
        })
      }
      const reasoning = typeof message.reasoning_content === 'string' ? message.reasoning_content : ''
      const content = typeof message.content === 'string' ? message.content : ''
      // Always keep reasoning_content on the assistant turn we will send back.
      // https://api-docs.deepseek.com/guides/thinking_mode#tool-calls
      const assistant: AssistantTurn = {
        role: 'assistant',
        content,
        reasoning_content: reasoning,
        ...(toolCalls.length ? { tool_calls: toolCalls } : {}),
      }
      const usage = usageFrom(root?.usage)
      return {
        content,
        assistant,
        toolCalls: toolCalls.map((c) => ({ id: c.id, name: c.function.name, arguments: c.function.arguments })),
        finishReason: typeof choice?.finish_reason === 'string' ? choice.finish_reason : '',
        usage,
        costUsd: costUsd(usage, model, at),
      }
    } catch (e) {
      if (e instanceof DeepseekError) throw e
      if (opts.signal?.aborted) throw new DeepseekError('DeepSeek 请求已取消')
      const aborted = e instanceof Error && e.name === 'AbortError'
      lastError = aborted ? `DeepSeek 请求超时（${Math.round(timeoutMs / 1000)}s）` : 'DeepSeek 网络错误'
      if (attempt === maxRetries) throw new DeepseekError(redactSecrets(lastError, config.apiKey))
      await sleep(backoffMs(attempt, null))
    } finally {
      clearTimeout(timer)
      opts.signal?.removeEventListener('abort', onAbort)
    }
  }
  throw new DeepseekError(redactSecrets(lastError, config.apiKey))
}

export interface CompleteOpts {
  model?: string
  timeoutMs?: number
  thinking?: boolean
  reasoningEffort?: 'none' | 'low' | 'high' | 'max'
  json?: boolean
  system?: string
  config?: DeepseekConfig
  fetchImpl?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  maxRetries?: number
  at?: Date
}

export interface Completion {
  text: string
  usage: TokenUsage
  costUsd: number
}

/** One shot, no tools, so `reasoning_content` is not sent back. */
export async function deepseekComplete(user: string, opts: CompleteOpts = {}): Promise<Completion> {
  assertFitsContext(`${opts.system ?? ''}\n${user}`)
  const messages: ChatMessage[] = []
  if (opts.system) messages.push({ role: 'system', content: opts.system })
  messages.push({ role: 'user', content: user })
  const res = await deepseekChat({
    messages,
    model: opts.model,
    thinking: opts.thinking,
    reasoningEffort: opts.reasoningEffort,
    json: opts.json,
    timeoutMs: opts.timeoutMs,
    config: opts.config,
    fetchImpl: opts.fetchImpl,
    sleep: opts.sleep,
    maxRetries: opts.maxRetries,
    at: opts.at,
  })
  return { text: res.content, usage: res.usage, costUsd: res.costUsd }
}

const SUBMIT_LESSON: ToolFunctionSchema = {
  type: 'function',
  function: {
    name: 'submit_lesson',
    description: '提交完整课件。有错误会返回报告和该读的文档；没有错误时再检查排版。通过后结束。',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        lesson: { type: 'string', description: '课件文件的完整正文，第一行是 ---' },
      },
      required: ['lesson'],
    },
  },
}

export interface SubmitPlan {
  done: boolean
  /** Show layout issues this time (at most once). */
  tellLayout: boolean
  ok: boolean
}

/**
 * errors → report, continue until max submits.
 * clean + no layout issues → stop.
 * clean + layout issues → tell once, continue.
 * a later clean submit → stop.
 */
export function planSubmit(input: { errors: number; layoutOk: boolean; layoutTold: boolean; submits: number; maxSubmits: number }): SubmitPlan {
  if (input.errors > 0) return { done: input.submits >= input.maxSubmits, tellLayout: false, ok: false }
  if (!input.layoutTold && input.submits < input.maxSubmits) {
    if (input.layoutOk) return { done: true, tellLayout: false, ok: true }
    return { done: false, tellLayout: true, ok: false }
  }
  return { done: true, tellLayout: false, ok: true }
}

export interface AgentOptions {
  model?: string
  maxTurns?: number
  timeoutMs?: number
  maxSubmits?: number
  transcriptPath?: string
  lessonPath?: string
  config?: DeepseekConfig
  fetchImpl?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  now?: () => Date
  maxRetries?: number
  signal?: AbortSignal
}

export interface AgentResult {
  lesson: string | null
  ok: boolean
  turns: number
  submits: number
  usage: TokenUsage
  costUsd: number
  stopped: 'clean' | 'max-turns' | 'max-submits' | 'timeout' | 'error' | 'no-submit'
  transcriptPath?: string
  error?: string
}

function writeTranscript(path: string | undefined, row: unknown) {
  if (!path) return
  mkdirSync(dirname(path), { recursive: true })
  appendFileSync(path, JSON.stringify(row) + '\n')
}

function lessonArg(args: unknown): string | null {
  const rec = asRecord(args)
  return rec && typeof rec.lesson === 'string' ? rec.lesson : null
}

/** What a transcript row keeps of a tool call: the doc id or query, and the first line of a check's result. */
export function toolTrace(name: string, args: unknown, result: string): { arg?: string; head?: string } {
  const rec = args && typeof args === 'object' ? (args as Record<string, unknown>) : {}
  const arg = name === 'get_doc' ? rec.id : name === 'search_docs' ? rec.query : undefined
  const checks = ['validate', 'check_layout', 'submit_lesson']
  return {
    ...(typeof arg === 'string' ? { arg: arg.slice(0, 80) } : {}),
    ...(checks.includes(name) ? { head: result.split('\n').slice(0, 3).join(' / ').slice(0, 300) } : {}),
  }
}

export async function runDeepseekAgent(problem: LessonProblem, opts: AgentOptions = {}): Promise<AgentResult> {
  const model = opts.model || DEFAULT_MODEL
  const maxTurns = opts.maxTurns ?? 40
  const maxSubmits = opts.maxSubmits ?? 6
  const timeoutMs = opts.timeoutMs ?? 30 * 60_000
  const deadline = Date.now() + timeoutMs
  const config = opts.config ?? loadDeepseekConfig()
  const tools = [...TOOL_SCHEMAS, SUBMIT_LESSON]
  const messages: ChatMessage[] = [
    { role: 'system', content: agentSystemPrompt() },
    { role: 'user', content: agentUserPrompt(problem) },
  ]
  let usage = { ...EMPTY_USAGE }
  let cost = 0
  let lesson: string | null = null
  let submits = 0
  let layoutTold = false
  let turns = 0
  let nudges = 0
  let stopped: AgentResult['stopped'] = 'max-turns'
  let ok = false

  const saveLesson = () => {
    if (!opts.lessonPath || !lesson) return
    mkdirSync(dirname(opts.lessonPath), { recursive: true })
    writeFileSync(opts.lessonPath, lesson.endsWith('\n') ? lesson : `${lesson}\n`)
  }

  try {
    while (turns < maxTurns) {
      if (opts.signal?.aborted || deadline - Date.now() <= 0) {
        stopped = 'timeout'
        break
      }
      turns++
      const at = opts.now?.() ?? new Date()
      const response = await deepseekChat({
        messages,
        model,
        tools,
        thinking: true,
        reasoningEffort: 'high',
        timeoutMs: Math.max(1_000, deadline - Date.now()),
        config,
        fetchImpl: opts.fetchImpl,
        sleep: opts.sleep,
        maxRetries: opts.maxRetries,
        at,
        signal: opts.signal,
      })
      usage = addUsage(usage, response.usage)
      const turnCost = costUsd(response.usage, model, at)
      cost += turnCost
      messages.push(response.assistant)

      if (!response.toolCalls.length) {
        writeTranscript(opts.transcriptPath, {
          turn: turns,
          finish: response.finishReason,
          tools: [],
          usage: response.usage,
          costUsd: turnCost,
          reasoningBytes: Buffer.byteLength(response.assistant.reasoning_content),
          contentBytes: Buffer.byteLength(response.content),
          submits,
        })
        if (nudges >= 2) {
          stopped = 'error'
          break
        }
        nudges++
        messages.push({
          role: 'user',
          content: '还没有提交。请继续用工具查文档，写好后调用 submit_lesson，lesson 为完整课件。',
        })
        continue
      }

      let done = false
      const toolRows: { name: string; argBytes: number; resultBytes: number; arg?: string; head?: string }[] = []
      for (const call of response.toolCalls) {
        let args: unknown
        try {
          args = call.arguments.trim() ? JSON.parse(call.arguments) : {}
        } catch {
          const result = '参数不是合法 JSON。'
          messages.push({ role: 'tool', tool_call_id: call.id, content: result })
          toolRows.push({ name: call.name, argBytes: Buffer.byteLength(call.arguments), resultBytes: Buffer.byteLength(result) })
          continue
        }
        let result: string
        if (call.name === 'render') {
          result = '这个接法不能看图。请用 check_layout。'
        } else if (call.name === 'submit_lesson') {
          submits++
          const text = lessonArg(args)
          if (text === null) {
            result = '参数不对：submit_lesson 需要字符串 lesson（课件全文）。'
            if (submits >= maxSubmits) {
              done = true
              stopped = 'max-submits'
            }
          } else {
            lesson = text
            const report = validateLesson(text)
            let layoutOk = true
            let layoutText = ''
            if (report.errors.length === 0 && !layoutTold) {
              const layout = await checkLayout(text)
              layoutOk = layout.ok
              layoutText = formatLayoutReport(layout)
            }
            const plan = planSubmit({
              errors: report.errors.length,
              layoutOk,
              layoutTold,
              submits,
              maxSubmits,
            })
            if (plan.tellLayout) layoutTold = true
            const parts = [formatValidation('课件', report)]
            if (layoutText && (plan.tellLayout || plan.ok)) parts.push(layoutText)
            if (report.errors.length > 0) parts.push('请按每条后面的文档 id 用 get_doc 读完再改，然后重新 submit_lesson。')
            else if (plan.tellLayout) parts.push('排版问题只提示这一次。改完后请再 submit_lesson 一次。')
            else if (plan.ok) parts.push('校验通过，结束。')
            if (plan.done && !plan.ok) parts.push('已达到提交次数上限。')
            result = parts.join('\n')
            if (plan.done) {
              done = true
              ok = plan.ok
              stopped = plan.ok ? 'clean' : 'max-submits'
            }
          }
        } else {
          result = await runTool(call.name, args)
        }
        messages.push({ role: 'tool', tool_call_id: call.id, content: result })
        toolRows.push({ name: call.name, argBytes: Buffer.byteLength(call.arguments), resultBytes: Buffer.byteLength(result), ...toolTrace(call.name, args, result) })
      }
      writeTranscript(opts.transcriptPath, {
        turn: turns,
        finish: response.finishReason,
        tools: toolRows,
        usage: response.usage,
        costUsd: turnCost,
        reasoningBytes: Buffer.byteLength(response.assistant.reasoning_content),
        contentBytes: Buffer.byteLength(response.content),
        submits,
        done,
      })
      if (done) break
    }
    if (!ok && stopped === 'max-turns' && turns >= maxTurns) stopped = 'max-turns'
  } catch (e) {
    const message = redactSecrets(e instanceof Error ? e.message : String(e), config.apiKey)
    saveLesson()
    const timedOut = message.includes('超时') || message.includes('已取消')
    return {
      lesson,
      ok: false,
      turns,
      submits,
      usage,
      costUsd: cost,
      stopped: timedOut ? 'timeout' : 'error',
      transcriptPath: opts.transcriptPath,
      error: message,
    }
  }
  saveLesson()
  if (!lesson) stopped = ok ? stopped : stopped === 'timeout' || stopped === 'error' ? stopped : 'no-submit'
  return { lesson, ok, turns, submits, usage, costUsd: cost, stopped, transcriptPath: opts.transcriptPath }
}

export interface BalanceInfo {
  currency: string
  total: string
  granted: string
  toppedUp: string
}

/** GET https://api.deepseek.com/user/balance — the key stays in the header and out of the result. */
export async function getBalance(opts?: { config?: DeepseekConfig; fetchImpl?: typeof fetch; timeoutMs?: number }): Promise<{ isAvailable: boolean; balances: BalanceInfo[] }> {
  const config = opts?.config ?? loadDeepseekConfig()
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), opts?.timeoutMs ?? 30_000)
  try {
    const res = await (opts?.fetchImpl ?? fetch)(`${config.baseUrl}/user/balance`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${config.apiKey}` },
      signal: ctrl.signal,
    })
    const text = await res.text()
    if (!res.ok) throw new DeepseekError(redactSecrets(`查询余额失败（${res.status}）：${text.slice(0, 300)}`, config.apiKey), res.status)
    const json = JSON.parse(text) as {
      is_available?: boolean
      balance_infos?: { currency?: string; total_balance?: string; granted_balance?: string; topped_up_balance?: string }[]
    }
    return {
      isAvailable: !!json.is_available,
      balances: (json.balance_infos ?? []).map((b) => ({
        currency: String(b.currency ?? ''),
        total: String(b.total_balance ?? ''),
        granted: String(b.granted_balance ?? ''),
        toppedUp: String(b.topped_up_balance ?? ''),
      })),
    }
  } catch (e) {
    if (e instanceof DeepseekError) throw e
    throw new DeepseekError('查询余额失败：网络错误')
  } finally {
    clearTimeout(timer)
  }
}

export function formatBalance(b: { isAvailable: boolean; balances: BalanceInfo[] }): string {
  const parts = b.balances.map((x) => `${x.currency} ${x.total}（赠送 ${x.granted}，充值 ${x.toppedUp}）`)
  return `${b.isAvailable ? '可用' : '不可用'}：${parts.join('；') || '无余额信息'}`
}
