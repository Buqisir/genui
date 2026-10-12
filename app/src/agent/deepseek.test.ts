import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { lessonFences } from '../docs/index'
import { getDoc } from './core'
import {
  assertFitsContext,
  costUsd,
  deepseekChat,
  deepseekComplete,
  getBalance,
  inputTokenBudget,
  isPeakUtc,
  loadDeepseekConfig,
  parseDeepseekEnv,
  planSubmit,
  redactHeaders,
  redactSecrets,
  runDeepseekAgent,
  type DeepseekConfig,
} from './deepseek'
import type { LessonProblem } from './prompt'

const KEY = 'sk-test-SECRETKEY99'
const config: DeepseekConfig = { apiKey: KEY, baseUrl: 'https://example.invalid' }
const noSleep = async () => {}

function completion(message: Record<string, unknown>, usage?: Record<string, unknown>) {
  return {
    choices: [{ finish_reason: message.tool_calls ? 'tool_calls' : 'stop', message }],
    usage: usage ?? {
      prompt_tokens: 100,
      completion_tokens: 20,
      prompt_cache_hit_tokens: 10,
      prompt_cache_miss_tokens: 90,
      completion_tokens_details: { reasoning_tokens: 15 },
    },
  }
}

describe('deepseek client', () => {
  it('parses the env file and lets the environment win, without embedding the key in errors', () => {
    const dir = mkdtempSync(join(tmpdir(), 'genui-key-'))
    const file = join(dir, 'deepseek.env')
    try {
      writeFileSync(file, '# comment\nexport DEEPSEEK_API_KEY="sk-from-file"\nDEEPSEEK_BASE_URL=\'https://example.invalid\'\n')
      expect(parseDeepseekEnv(readFileSync(file, 'utf8'))).toEqual({
        apiKey: 'sk-from-file',
        baseUrl: 'https://example.invalid',
      })
      const fromFile = loadDeepseekConfig({ env: {}, envFile: file })
      expect(fromFile.apiKey).toBe('sk-from-file')
      expect(fromFile.baseUrl).toBe('https://example.invalid')
      const fromEnv = loadDeepseekConfig({ env: { DEEPSEEK_API_KEY: 'sk-from-env' }, envFile: file })
      expect(fromEnv.apiKey).toBe('sk-from-env')
      expect(fromEnv.baseUrl).toBe('https://example.invalid')
      expect(() => loadDeepseekConfig({ env: {}, envFile: join(dir, 'missing.env') })).toThrow(/没有 DeepSeek key/)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('redacts the key and the Authorization header', async () => {
    const dumped = redactHeaders({ Authorization: `Bearer ${KEY}`, Accept: 'application/json' }, KEY)
    expect(JSON.stringify(dumped)).not.toContain(KEY)
    expect(dumped.Authorization).toBe('Bearer [REDACTED]')
    expect(redactSecrets(`token ${KEY} and Bearer ${KEY}`, KEY)).not.toContain(KEY)

    const fetchImpl: typeof fetch = async () =>
      new Response(JSON.stringify({ error: { message: `bad ${KEY}`, header: `Bearer ${KEY}` } }), { status: 500 })
    await expect(deepseekComplete('hi', { config, fetchImpl, sleep: noSleep, maxRetries: 0 })).rejects.toSatisfy((e: Error) => {
      expect(e.message).not.toContain(KEY)
      expect(e.message).not.toMatch(/Bearer\s+sk-/)
      expect(e.message).toContain('500')
      return true
    })
  })

  it('prices flash from cache hit, cache miss and completion, not reasoning twice', () => {
    const usage = { prompt: 1_000_000, cacheHit: 250_000, cacheMiss: 750_000, completion: 10_000, reasoning: 8_000 }
    const off = new Date(Date.UTC(2026, 0, 1, 2, 0, 0))
    while (off.getUTCDay() !== 0) off.setUTCDate(off.getUTCDate() + 1)
    expect(isPeakUtc(off)).toBe(false)
    expect(costUsd(usage, 'deepseek-flash', off)).toBeCloseTo((250_000 * 0.003 + 750_000 * 0.15 + 10_000 * 0.6) / 1_000_000)

    const peak = new Date(off)
    peak.setUTCDate(peak.getUTCDate() + 2)
    peak.setUTCHours(2)
    expect(peak.getUTCDay()).toBe(2)
    expect(isPeakUtc(peak)).toBe(true)
    expect(costUsd(usage, 'deepseek-flash', peak)).toBeCloseTo((250_000 * 0.006 + 750_000 * 0.3 + 10_000 * 1.2) / 1_000_000)
    peak.setUTCHours(5)
    expect(isPeakUtc(peak)).toBe(false)
    peak.setUTCHours(8)
    expect(isPeakUtc(peak)).toBe(true)
  })

  it('refuses a prompt that cannot fit the context', () => {
    expect(() => assertFitsContext('短')).not.toThrow()
    expect(() => assertFitsContext('字'.repeat(inputTokenBudget()))).toThrow(/上下文/)
  })

  it('stops after a bad submit and then a clean one, and sends reasoning_content back', async () => {
    const plot = getDoc('plot')
    expect(plot && !('error' in plot)).toBeTruthy()
    const good = lessonFences(plot && !('error' in plot) ? plot.text : '')[0]
    expect(good).toContain('---')
    const seen: { tools?: unknown; messages: { role: string; reasoning_content?: string; tool_calls?: unknown }[] }[] = []
    const script = [
      completion({
        role: 'assistant',
        content: '先查入口',
        reasoning_content: 'REASONING-NOT-FOR-LOG',
        tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'get_doc', arguments: '{"id":"index"}' } }],
      }),
      completion({
        role: 'assistant',
        content: '',
        reasoning_content: '提交一版有错的',
        tool_calls: [{ id: 'call_2', type: 'function', function: { name: 'submit_lesson', arguments: JSON.stringify({ lesson: '---\ntitle: t\n---\n' }) } }],
      }),
      completion({
        role: 'assistant',
        content: '',
        reasoning_content: '改完再交',
        tool_calls: [{ id: 'call_3', type: 'function', function: { name: 'submit_lesson', arguments: JSON.stringify({ lesson: good }) } }],
      }),
    ]
    let i = 0
    const fetchImpl: typeof fetch = async (_url, init) => {
      const body = JSON.parse(String(init?.body))
      seen.push({ tools: body.tools, messages: body.messages })
      const next = script[i++]
      if (!next) throw new Error('多余的请求')
      return new Response(JSON.stringify(next), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    const dir = mkdtempSync(join(tmpdir(), 'genui-agent-'))
    const transcript = join(dir, 'agent.jsonl')
    const problem: LessonProblem = { id: 'zj-01', title: '题', source: '来源', text: '题干很短。' }
    try {
      const result = await runDeepseekAgent(problem, {
        config,
        fetchImpl,
        sleep: noSleep,
        maxRetries: 0,
        transcriptPath: transcript,
        now: () => new Date(Date.UTC(2026, 0, 4, 12, 0, 0)),
        timeoutMs: 60_000,
      })
      expect(i).toBe(3)
      expect(result.ok).toBe(true)
      expect(result.stopped).toBe('clean')
      expect(result.turns).toBe(3)
      expect(result.submits).toBe(2)
      expect(result.lesson).toContain('---')
      expect(result.usage.prompt).toBe(300)
      expect(result.usage.cacheHit).toBe(30)
      expect(result.usage.reasoning).toBe(45)
      expect(result.costUsd).toBeGreaterThan(0)

      expect(seen[0].messages.some((m) => m.reasoning_content)).toBe(false)
      expect(seen[1].messages.some((m) => m.reasoning_content === 'REASONING-NOT-FOR-LOG')).toBe(true)
      expect(seen[2].messages.filter((m) => m.role === 'assistant').every((m) => typeof m.reasoning_content === 'string')).toBe(true)
      const names = (seen[0].tools as { function: { name: string } }[]).map((t) => t.function.name)
      expect(names).toContain('get_doc')
      expect(names).toContain('submit_lesson')
      expect(names).not.toContain('render')

      const log = readFileSync(transcript, 'utf8')
      expect(log).not.toContain('REASONING-NOT-FOR-LOG')
      expect(log).not.toContain(KEY)
      expect(log).toContain('get_doc')
      expect(log).toContain('submit_lesson')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('retries 429 then accepts 200, and a one-shot call does not send tools', async () => {
    let n = 0
    const fetchImpl: typeof fetch = async (_url, init) => {
      n++
      const body = JSON.parse(String(init?.body))
      expect(body.tools).toBeUndefined()
      expect(body.thinking).toEqual({ type: 'enabled' })
      expect(body.reasoning_effort).toBe('high')
      expect(body.model).toBe('deepseek-flash')
      if (n === 1) return new Response('slow', { status: 429, headers: { 'retry-after': '0' } })
      return new Response(JSON.stringify(completion({ role: 'assistant', content: '---\nid: x\n---\n', reasoning_content: 'skip' })), { status: 200 })
    }
    const res = await deepseekComplete('写课件', { config, fetchImpl, sleep: noSleep, maxRetries: 2 })
    expect(n).toBe(2)
    expect(res.text).toContain('---')
  })

  it('shows layout once, then stops on the next clean submit', () => {
    expect(planSubmit({ errors: 2, layoutOk: true, layoutTold: false, submits: 1, maxSubmits: 6 })).toEqual({
      done: false,
      tellLayout: false,
      ok: false,
    })
    expect(planSubmit({ errors: 0, layoutOk: false, layoutTold: false, submits: 1, maxSubmits: 6 })).toEqual({
      done: false,
      tellLayout: true,
      ok: false,
    })
    expect(planSubmit({ errors: 0, layoutOk: true, layoutTold: true, submits: 2, maxSubmits: 6 })).toEqual({
      done: true,
      tellLayout: false,
      ok: true,
    })
    expect(planSubmit({ errors: 0, layoutOk: true, layoutTold: false, submits: 1, maxSubmits: 6 })).toEqual({
      done: true,
      tellLayout: false,
      ok: true,
    })
  })

  it('reads a balance payload and does not echo the key', async () => {
    const fetchImpl: typeof fetch = async (url, init) => {
      expect(String(url)).toBe('https://example.invalid/user/balance')
      const headers = new Headers(init?.headers)
      expect(redactHeaders({ Authorization: headers.get('Authorization') ?? '' }, KEY).Authorization).toBe('Bearer [REDACTED]')
      return new Response(JSON.stringify({ is_available: true, balance_infos: [{ currency: 'CNY', total_balance: '3.00', granted_balance: '1.00', topped_up_balance: '2.00' }] }), { status: 200 })
    }
    const balance = await getBalance({ config, fetchImpl })
    expect(balance.isAvailable).toBe(true)
    expect(balance.balances[0]).toEqual({ currency: 'CNY', total: '3.00', granted: '1.00', toppedUp: '2.00' })
    expect(JSON.stringify(balance)).not.toContain(KEY)
  })

  it('does not put a chat failure body that repeats the key into the thrown error', async () => {
    const fetchImpl: typeof fetch = async () => new Response(`unauthorized ${KEY}`, { status: 401 })
    try {
      await deepseekChat({ messages: [{ role: 'user', content: 'hi' }], config, fetchImpl, sleep: noSleep, maxRetries: 0 })
      expect.unreachable()
    } catch (e) {
      expect((e as Error).message.includes(KEY)).toBe(false)
    }
  })
})
