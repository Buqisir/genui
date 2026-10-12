// Single-round prompt assembly: a cheap card pick, then L0 + those cards + L2 refs that fit.
import { loadDocs } from '../docs/index'
import { getDoc, listDocs, pointerFor } from './core'

export interface LessonProblem {
  id: string
  title: string
  source: string
  text: string
}

/** Always present. File skeleton, names, and the route rules. */
export const REQUIRED_CARDS = ['structure', 'params', 'rules'] as const

/** Whole single-round prompt, including L2. Past this, further L2 refs are left out. */
export const SINGLE_PROMPT_BUDGET = 60 * 1024

export function l1Ids(): Set<string> {
  return new Set(listDocs().filter((d) => d.layer === 'L1').map((d) => d.id))
}

export function l2Ids(): Set<string> {
  return new Set(listDocs().filter((d) => d.layer === 'L2').map((d) => d.id))
}

/** At most this many L2 refs from the selection call. */
export const MAX_SELECTED_REFS = 4

/** One line per L2 ref: title plus the `v.` tools and `####` headings it documents, so a picker can match a problem to it. */
export function l2Catalog(): string {
  return loadDocs()
    .filter((d) => d.layer === 'L2' && d.id !== 'planned')
    .map((d) => {
      const tools = [...new Set([...d.text.matchAll(/`(v\.[A-Za-z]+)\(/g)].map((m) => m[1]))]
      const heads = [...d.text.matchAll(/^#{3,4} (.+)$/gm)].map((m) => m[1].replace(/`/g, '').trim())
      const topics = [...heads, ...tools].slice(0, 14).join('、')
      return `- ${d.id}：${d.title}${topics ? `（${topics}）` : ''}`
    })
    .join('\n')
}

/**
 * Same bullets as `firstPrompt` in scripts/generate.ts.
 * `tools: false` keeps the "don't use tools" line (single-round has no tools).
 * `tools: true` drops it (the agent is supposed to call tools).
 */
export function outputRequirements(problem: LessonProblem, tools: boolean): string {
  const lines = ['- 只输出课件文件本身，第一行就是 `---`。不要任何解释，不要用代码围栏包住整个文件。']
  if (!tools) lines.push('- 不要读写文件、不要运行命令，所有需要的资料都在本提示里。')
  lines.push(
    `- 头信息：\`id: ${problem.id}\`，\`source: ${problem.source}\`，\`question\` 原样抄题目。`,
    '- `answers`：每个能写成数值的答案一条 `{ name, value, unit }`。`name` 必须是课件里某个 `<Param>` 或 `<Define>` 的名字，`value` 是你单独算出的数值。校验器会在初始参数下用课件里的公式重新计算并核对，误差超过 1% 就退回。题目只有字母没有数值时，给参数取代表性数值，并在正文说明。',
    '- 选择题：头信息写 `choice`（选出的选项字母，多选按字母顺序连写，如 `BD`），按第七节第 13 条逐项判断；没有数值答案时写 `answers: []`。',
    '- 只用规范里列出的组件和属性；表达式只能引用已声明的名字；`<Sim>` 只能用规范里列出的 `v` 工具。',
    '- 写之前先把物理过程想清楚，确认答案正确，再决定交互方式（遵守第六、七节）。',
  )
  return `## 输出要求\n\n${lines.join('\n')}`
}

export function agentSystemPrompt(): string {
  const index = getDoc('index')
  if ('error' in index) throw new Error(index.error)
  return `你是高中物理课件作者。用工具查阅文档并校验，最后用 submit_lesson 提交完整课件。

- 组件怎么写以文档为准，不要猜属性和 \`v\` 工具。
- 报告里点名的文档 id，用 get_doc 读完再改。
- 课件只通过 submit_lesson 提交。

## 入口（每题必读）

${index.text.trim()}
`
}

export function agentUserPrompt(problem: LessonProblem): string {
  return `请为下面这道题写一份课件：完整解答，并做交互演示。课件全文放在 submit_lesson 的 lesson 里，不要在对话里另附一份。

${outputRequirements(problem, true)}

## 题目（${problem.title}，${problem.source}）

${problem.text.trim()}
`
}

const SELECTION_SYSTEM = '你只负责选题。只输出一个 JSON 对象，不要解释。'

export function selectionUserPrompt(problem: LessonProblem): string {
  const index = getDoc('index')
  if ('error' in index) throw new Error(index.error)
  const ids = [...l1Ids()].sort()
  return `根据入口和题目，选出写这道课件需要的文档。
只输出严格 JSON：{"cards": ["L1 id", ...], "refs": ["L2 id", ...]}
- cards 从 L1 id 里选：要用到的每个组件的卡。structure、params、rules 会自动补上，写上也可以。
- refs 从 L2 目录里选，最多 ${MAX_SELECTED_REFS} 份：这道题的情景要用到的深入参考（例如静电场选 sim-fields，板块摩擦选 motion-forces）。用不到就写空数组。

L1 id：${ids.join(', ')}

L2 目录：
${l2Catalog()}

## 入口

${index.text.trim()}

## 题目（${problem.title}，${problem.source}）

${problem.text.trim()}
`
}

function extractJson(text: string): string {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const body = fence ? fence[1] : text
  const start = body.indexOf('{')
  const end = body.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('卡片选择没有 JSON 对象')
  return body.slice(start, end + 1)
}

/**
 * Cards are L1 ids, with structure, params, rules always first. Refs are L2 ids, from `refs` or
 * misfiled under `cards`, capped at MAX_SELECTED_REFS. Anything else is reported as unknown.
 */
export function parseCardSelection(
  raw: string,
  known: Set<string> = l1Ids(),
  knownRefs: Set<string> = l2Ids(),
): { cards: string[]; refs: string[]; unknown: string[] } {
  let data: unknown
  try {
    data = JSON.parse(extractJson(raw))
  } catch (e) {
    const why = e instanceof Error ? e.message : String(e)
    throw new Error(`卡片选择不是合法 JSON：${why}`)
  }
  if (!data || typeof data !== 'object' || Array.isArray(data) || !Array.isArray((data as { cards?: unknown }).cards)) {
    throw new Error('卡片选择必须是 JSON 对象 {"cards":[...]}')
  }
  const unknown: string[] = []
  const picked: string[] = []
  const refs: string[] = []
  const rawRefs = (data as { refs?: unknown }).refs
  const all = [...(data as { cards: unknown[] }).cards, ...(Array.isArray(rawRefs) ? rawRefs : [])]
  for (const id of all) {
    if (typeof id !== 'string' || !id.trim()) continue
    const name = id.trim()
    if (known.has(name)) {
      if (!picked.includes(name)) picked.push(name)
    } else if (knownRefs.has(name)) {
      if (!refs.includes(name) && refs.length < MAX_SELECTED_REFS) refs.push(name)
    } else if (!unknown.includes(name)) unknown.push(name)
  }
  const required = REQUIRED_CARDS.filter((id) => known.has(id))
  const rest = picked.filter((id) => !(required as readonly string[]).includes(id))
  return { cards: [...required, ...rest], refs, unknown }
}

export interface CardSelection {
  cards: string[]
  refs: string[]
  unknown: string[]
  raw: string
  usage?: { prompt: number; cacheHit: number; cacheMiss: number; completion: number; reasoning: number }
  costUsd: number
}

export interface SelectOptions {
  /** When set, no network call is made here. Grok selection passes this in. */
  complete?: (user: string) => Promise<string>
  timeoutMs?: number
  config?: { apiKey: string; baseUrl: string }
  fetchImpl?: typeof fetch
}

/**
 * One cheap call: deepseek-flash, thinking off.
 * `reasoning_effort: "none"` disables thinking (https://api-docs.deepseek.com/guides/thinking_mode).
 */
export async function selectCards(problem: LessonProblem, opts: SelectOptions = {}): Promise<CardSelection> {
  const user = selectionUserPrompt(problem)
  let raw: string
  let usage: CardSelection['usage']
  let costUsd = 0
  if (opts.complete) {
    raw = await opts.complete(user)
  } else {
    const { deepseekComplete } = await import('./deepseek')
    const res = await deepseekComplete(user, {
      model: 'deepseek-flash',
      thinking: false,
      reasoningEffort: 'none',
      json: true,
      system: SELECTION_SYSTEM,
      timeoutMs: opts.timeoutMs ?? 90_000,
      config: opts.config,
      fetchImpl: opts.fetchImpl,
    })
    raw = res.text
    usage = res.usage
    costUsd = res.costUsd
  }
  const parsed = parseCardSelection(raw)
  return { ...parsed, raw, usage, costUsd }
}

export interface BuiltPrompt {
  text: string
  bytes: number
  cards: string[]
  refs: string[]
  omittedRefs: string[]
  /** ids whose full text is already in `text` (index, cards, included refs). */
  included: string[]
}

function docBody(id: string, text: string | undefined): string {
  if (!text) throw new Error(`没有这份文档：${id}`)
  return text.trim()
}

/**
 * Output requirements + L0 + the chosen L1 cards + L2 refs.
 * Required cards and the refs the selection named (at most MAX_SELECTED_REFS) are always included;
 * the cards' `related` refs are then added in order only while the total stays under `budget` bytes.
 */
export function buildSinglePrompt(
  problem: LessonProblem,
  cardIds: string[],
  opts?: { budget?: number; refs?: string[] },
): BuiltPrompt {
  const budget = opts?.budget ?? SINGLE_PROMPT_BUDGET
  const known = l1Ids()
  const cards: string[] = []
  for (const id of REQUIRED_CARDS) if (known.has(id)) cards.push(id)
  for (const id of cardIds) {
    if (!known.has(id) || cards.includes(id)) continue
    cards.push(id)
  }
  const byId = new Map(loadDocs().map((d) => [d.id, d]))
  const index = getDoc('index')
  if ('error' in index) throw new Error(index.error)

  const head = `你是高中物理课件作者。请按下面给出的文档为这道题写一份课件文件：完整解答，并做交互演示。

${outputRequirements(problem, false)}

## 入口

${docBody('index', index.text)}
`
  const cardsSection = `## 组件卡\n\n${cards
    .map((id) => `### ${id}\n\n${docBody(id, byId.get(id)?.text)}`)
    .join('\n\n')}\n`
  const problemSection = `## 题目（${problem.title}，${problem.source}）\n\n${problem.text.trim()}\n`

  const chosen: { id: string; text: string }[] = []
  const candidates: { id: string; text: string }[] = []
  const seen = new Set<string>(['index', ...cards])
  for (const rel of (opts?.refs ?? []).slice(0, MAX_SELECTED_REFS)) {
    const ref = byId.get(rel)
    if (seen.has(rel) || !ref || ref.layer !== 'L2') continue
    seen.add(rel)
    chosen.push({ id: rel, text: ref.text.trim() })
  }
  for (const id of cards) {
    for (const rel of byId.get(id)?.related ?? []) {
      if (seen.has(rel)) continue
      const ref = byId.get(rel)
      if (!ref || ref.layer !== 'L2') continue
      seen.add(rel)
      candidates.push({ id: rel, text: ref.text.trim() })
    }
  }

  const assemble = (refs: { id: string; text: string }[]) => {
    const refSection = refs.length ? `## 深入参考\n\n${refs.map((r) => `### ${r.id}\n\n${r.text}`).join('\n\n')}\n\n` : ''
    return `${head}\n${cardsSection}\n${refSection}${problemSection}`
  }

  const omittedRefs: string[] = []
  for (const ref of candidates) {
    const trial = assemble([...chosen, ref])
    if (Buffer.byteLength(trial) <= budget) chosen.push(ref)
    else omittedRefs.push(ref.id)
  }
  const text = assemble(chosen)
  return {
    text,
    bytes: Buffer.byteLength(text),
    cards,
    refs: chosen.map((r) => r.id),
    omittedRefs,
    included: ['index', ...cards, ...chosen.map((r) => r.id)],
  }
}

/** Full text of any doc a validator message points at, when that doc is not already in the prompt. */
export function appendPointedDocs(
  prompt: string,
  included: string[],
  messages: string[],
): { text: string; added: string[]; appendix: string } {
  const have = new Set(included)
  const added: string[] = []
  const blocks: string[] = []
  for (const message of messages) {
    const id = pointerFor(message).doc
    if (have.has(id)) continue
    const doc = getDoc(id)
    if ('error' in doc) continue
    have.add(id)
    added.push(id)
    blocks.push(`### ${id}\n\n${doc.text.trim()}`)
  }
  if (!added.length) return { text: prompt, added, appendix: '' }
  const appendix = `## 需要补读的文档\n\n${blocks.join('\n\n')}\n`
  return { text: `${prompt.trimEnd()}\n\n${appendix}`, added, appendix }
}
