// Prompt building and reply handling shared by scripts/generate.ts and scripts/eval-step.ts.
// Nothing here calls a model. readProblem keeps only id, title and source from the header, so the
// problem's `reference:` text never reaches a prompt; problems/expected*.yaml is read only by answerkey.ts.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'
import { docTitle, pointerFor } from '../src/agent/core'
import type { LessonProblem } from '../src/agent/prompt'
import { formatKeys, isPatch } from '../src/lesson/patch'
import { checkAnswerKey } from './answerkey'
import type { ProgressIssue } from './progress'

const here = dirname(fileURLToPath(import.meta.url))
export const root = join(here, '../..')

const spec = readFileSync(join(root, 'syntax-spec.md'), 'utf8')
const example = readFileSync(join(root, 'lessons/r6-06-car-chase.md'), 'utf8')
const demo = readFileSync(join(root, 'lessons/_demo-prefabs.md'), 'utf8')

export function readProblem(id: string): LessonProblem {
  const raw = readFileSync(join(root, 'problems', `${id}.md`), 'utf8')
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!m) throw new Error(`problems/${id}.md 缺少头信息`)
  const meta = YAML.parse(m[1]) as { id: string; title: string; source: string }
  return { id: meta.id, title: meta.title, source: meta.source, text: m[2].trim() }
}
export function firstPrompt(p: ReturnType<typeof readProblem>) {
  return `你是高中物理课件作者。请按《课件语法规范》为下面这道题写一份课件文件：完整解答，并做交互演示。

## 输出要求

- 只输出课件文件本身，第一行就是 \`---\`。不要任何解释，不要用代码围栏包住整个文件。
- 不要读写文件、不要运行命令，所有需要的资料都在本提示里。
- 头信息：\`id: ${p.id}\`，\`title\`（必填，题目的简短标题，如「${p.title}」），\`source: ${p.source}\`，\`question\` 原样抄题目。
- \`answers\`：每个能写成数值的答案一条 \`{ name, value, unit }\`。\`name\` 必须是课件里某个 \`<Param>\` 或 \`<Define>\` 的名字，\`value\` 是你单独算出的数值。校验器会在初始参数下用课件里的公式重新计算并核对，误差超过 1% 就退回。题目只有字母没有数值时，给参数取代表性数值，并在正文说明。
- 选择题：头信息写 \`choice\`（选出的选项字母，多选按字母顺序连写，如 \`BD\`；一题有几道选择小问时按小问顺序写成列表，如 \`choice: [AD, C]\`），按第七节第 13 条逐项判断；没有数值答案时写 \`answers: []\`。
- 只用规范里列出的组件和属性；表达式只能引用已声明的名字；\`<Sim>\` 只能用规范里列出的 \`v\` 工具。
- 写之前先把物理过程想清楚，确认答案正确，再决定交互方式（遵守第六、七节）。

## 课件语法规范

${spec}

## 示例课件一（追及相遇，含 Sim、Plot、Preset、Status）

${example}

## 示例课件二（受力图、电路图）

${demo}

## 题目（${p.title}，${p.source}）

${p.text}
`
}
export const FIRST_FULL = '第一次要输出完整课件，不能只给补丁。'

/** Patch instructions shared by both retry paths. */
export const PATCH_HOW = `只改头信息、或只改一两个块时，**必须**只输出补丁（不要重写整份课件）：第一行写 \`<!-- patch -->\`，下面只写要换掉的组件块（整块重写，按名字对上原来的块）。新增的块写 \`after="…"\` 指明放在哪个块后面，删除写 \`<Remove target="…" />\`，头信息只写要改的字段。要改正文段落，或要改的块超过一半时，才输出修正后的完整课件。

补丁示例（只示意格式）：

\`\`\`patch
<!-- patch -->
<Define name="R1" expr="10" />

<Variant label="电源反接" set={{flip: 1}} ask="电源反接后，结果会怎样？" reveal="符号相反，大小不变。" after="Variant:磁场反向" />

<Remove target="Readout#2" />
\`\`\``

/** `current` is the last full lesson stored, with earlier patches already merged in. */
export function retryPrompt(base: string, current: string | undefined, problems: string) {
  if (current === undefined) {
    return `${base}

## 上一版课件没有通过校验

校验器报告：

${problems}

请输出完整的课件文件（同样只输出文件本身）。不要调用任何工具，也不要读文件：规范、示例和题目都在本提示里，直接输出。`
  }
  return `${base}

## 上一版课件没有通过校验

校验器报告：

${problems}

当前课件（上一版的完整内容，补丁已合并在里面）：

${current}

${PATCH_HOW}

当前课件的块名：

${formatKeys(current)}

不要调用任何工具，也不要读文件：规范、示例和当前课件都在本提示里，直接输出。`
}
export function cleanOutput(text: string) {
  let t = text.trim()
  const fence = t.match(/^```[a-z]*\n([\s\S]*?)\n```$/)
  if (fence) t = fence[1].trim()
  if (isPatch(t)) return t
  const start = t.indexOf('---')
  return start > 0 ? t.slice(start) : t
}
/** The errors and answer misses that reportOf lists, as issues to compare between rounds (warnings are left out). */
export function issuesOf(
  r: { errors: { line?: number; block?: string; code?: string; message: string }[] },
  missing: string[],
  blind = false,
): ProgressIssue[] {
  return [
    ...r.errors.map((e) => ({ code: e.code, block: e.block, line: e.line, message: e.message })),
    ...(blind ? [] : missing).map((q) => ({ code: 'answer-key', block: q, message: q })),
  ]
}

/** Puts the progress sentence in front of a validator report, with a blank line between (nothing when empty). */
export function withProgress(progress: string, report: string): string {
  return progress ? `${progress}\n\n${report}` : report
}
export function reportOf(
  r: { errors: { line?: number; block?: string; hint?: string; message: string }[]; warnings: { line?: number; block?: string; hint?: string; message: string }[] },
  missing: string[],
  /** Blind runs check the key but do not report wrong answers back to the model. */
  blind = false,
): string {
  const pointed = (message: string) => {
    const doc = pointerFor(message).doc
    return `${doc}（${docTitle(doc)}）`
  }
  const where = (i: { line?: number; block?: string }) => (i.line ? `（第 ${i.line} 行${i.block ? `，${i.block}` : ''}）` : '')
  const hint = (i: { hint?: string }) => (i.hint ? `\n  ${i.hint}` : '')
  const lines = [
    ...r.errors.map((e) => `- 错误${where(e)}：${e.message}（${pointed(e.message)}）${hint(e)}`),
    ...(blind ? [] : missing).map((q) => `- 答案核对：「${q}」与标准答案不符（或 answers 里缺这一项）。请重新审题：题目文字可能省略了原图里的信息（例如光在某个面上先反射），选择能让题设条件全部成立的解释，不要轻易断定题目矛盾。`),
    ...r.warnings.map((w) => `- 提醒${where(w)}：${w.message}（${pointed(w.message)}）${hint(w)}`),
  ]
  if (r.errors.length || r.warnings.length) lines.push('', '这些文档 id 在《课件语法规范》里对应标题相同的章节。')
  return lines.join('\n')
}

// ---------- --solve-first: solve the problem before writing the lesson ----------

/** The short solve prompt: no spec, no examples, no component list. Its reply is parsed by parseSolution. */
export function solvePrompt(p: LessonProblem): string {
  return `你是高中物理老师。这一步只解题，不写课件。

## 要求

- 逐问解答。每一问写清：研究对象和物理过程、用到的规律、关键式子、代入数值后的结果（带单位）。
- 选择题逐个选项判断：先写正确或错误，再写一句理由；能算的写出算式和结果。
- 题目文字可能省略了原图里的信息，选择能让题设条件全部成立的理解，不要轻易断定题目有矛盾。
- 写完后把每个结果代回题目条件检查一遍，再给最终答案。
- 不要读写文件，不要运行命令。

## 输出格式

先写「## 解题过程」，然后写「## 答案」，答案段只放一个 yaml 代码块：

\`\`\`yaml
answers:
  - { q: "(1)", value: 34, unit: Ω }
choice: [AD, C]
\`\`\`

\`answers\` 每个数值结果一条（\`q\` 写第几问）；没有数值时写 \`answers: []\`。\`choice\` 按选择小问的顺序写选出的字母，多选按字母顺序连写；没有选择题时不写 \`choice\`。

## 题目（${p.title}，${p.source}）

${p.text}
`
}

export interface SolutionAnswer {
  q?: string
  value: number
  unit?: string
}
export interface Solution {
  answers: SolutionAnswer[]
  choice?: string[]
  /** The whole reply, trimmed. solutionSection cuts it at 「## 答案」. */
  text: string
}
export type ParsedSolution = { ok: true; answers: SolutionAnswer[]; choice?: string[]; text: string } | { ok: false; error: string }

const ANSWER_HEADING = /^## 答案[ \t]*$/m
const YAML_BLOCK = /```ya?ml[ \t]*\r?\n([\s\S]*?)```/

/** Splits a solve reply at its 「## 答案」 heading. `answer` is the heading's section, or undefined when there is none. */
function splitAtAnswer(text: string): { body: string; answer?: string } {
  const m = ANSWER_HEADING.exec(text)
  if (!m) return { body: text.trim() }
  return { body: text.slice(0, m.index).trim(), answer: text.slice(m.index + m[0].length).trim() }
}

/**
 * Reads the yaml block under 「## 答案」. A wrong format returns `ok: false` with a Chinese message that goes back
 * to the model. `choice` may be a string (one sub-question) or a list; it is kept as a list either way.
 */
export function parseSolution(text: string): ParsedSolution {
  const { answer } = splitAtAnswer(text)
  if (answer === undefined) return { ok: false, error: '没有「## 答案」一节。请先写「## 解题过程」，再写「## 答案」，答案段只放一个 yaml 代码块。' }
  const block = YAML_BLOCK.exec(answer)
  if (!block) return { ok: false, error: '「## 答案」后面没有 yaml 代码块（要用 ```yaml 围起来）。' }
  let doc: unknown
  try {
    doc = YAML.parse(block[1])
  } catch (e) {
    return { ok: false, error: `yaml 解析失败：${(e as Error).message.split('\n')[0]}` }
  }
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return { ok: false, error: 'yaml 顶层要是 answers 和 choice 两项。' }
  const { answers, choice } = doc as { answers?: unknown; choice?: unknown }
  if (!Array.isArray(answers)) return { ok: false, error: 'answers 要写成列表；没有数值时写 answers: []。' }
  const out: SolutionAnswer[] = []
  for (const [i, item] of answers.entries()) {
    const a = (item && typeof item === 'object' ? item : {}) as { q?: unknown; value?: unknown; unit?: unknown }
    if (typeof a.value !== 'number' || !Number.isFinite(a.value)) return { ok: false, error: `answers 第 ${i + 1} 项的 value 要是数字（单位写在 unit 里）。` }
    out.push({
      ...(a.q != null ? { q: String(a.q) } : {}),
      value: a.value,
      ...(a.unit != null ? { unit: String(a.unit) } : {}),
    })
  }
  let list: string[] | undefined
  if (choice !== undefined && choice !== null) {
    const items = typeof choice === 'string' ? [choice] : Array.isArray(choice) ? choice : undefined
    if (!items || !items.every((c) => typeof c === 'string')) {
      return { ok: false, error: 'choice 要是选项字母，如 choice: C；有几道选择小问时写成列表，如 choice: [AD, C]。' }
    }
    list = items as string[]
  }
  return { ok: true, answers: out, ...(list ? { choice: list } : {}), text: text.trim() }
}

/** The solution as a lesson header, so checkAnswerKey (answerkey.ts) can check it like a lesson. */
export function solutionKey(sol: { answers: SolutionAnswer[]; choice?: string[] }): string {
  const head: Record<string, unknown> = { answers: sol.answers }
  if (sol.choice) head.choice = sol.choice
  return `---\n${YAML.stringify(head)}---\n`
}

/** One line per missed answer, worded as reportOf words its answer-check line. */
export function answerMissLine(q: string): string {
  return `- 答案核对：「${q}」与标准答案不符（或 answers 里缺这一项）。请重新审题：题目文字可能省略了原图里的信息（例如光在某个面上先反射），选择能让题设条件全部成立的解释，不要轻易断定题目矛盾。`
}

/**
 * Checks one solve reply: whether it parses, and which answer-key entries it misses. `feedback` is what goes back
 * to the model when the reply is not accepted (a format error, or the missed answers). Callers decide whether
 * a miss counts (generate.ts ignores it under --blind).
 */
export function judgeSolve(id: string, text: string): { parsed: ParsedSolution; missing: string[]; checked: boolean; feedback: string } {
  const parsed = parseSolution(text)
  if (!parsed.ok) return { parsed, missing: [], checked: false, feedback: `- 格式：${parsed.error}` }
  const key = checkAnswerKey(id, solutionKey(parsed))
  return { parsed, missing: key.missing, checked: key.checked, feedback: key.missing.map(answerMissLine).join('\n') }
}

/** The retry for a solve reply that was not accepted: the solve prompt, the earlier reply and what was wrong with it. */
export function solveRetryPrompt(p: LessonProblem, previous: string, feedback: string): string {
  return `${solvePrompt(p)}
## 上一次的解答没有通过

${feedback}

上一次的回答：

${previous.trim()}

请重新解题，按同样的格式输出完整的「## 解题过程」和「## 答案」。不要读写文件，不要运行命令。
`
}

/** The section the lesson prompt gets (before the problem section): the solution's process, then its yaml answer block as written. */
export function solutionSection(sol: { text: string }): string {
  const { body, answer } = splitAtAnswer(sol.text)
  const block = answer ? (YAML_BLOCK.exec(answer)?.[0] ?? answer) : ''
  return `## 已经做好的解答

下面是这道题已经做好的解答。课件的「完整解答」、头信息里的 \`answers\` 和 \`choice\` 要和它一致；课件里的公式按这份解答的物理过程写。写课件时如果发现解答有错，按正确的写，并在正文说明哪里改了、为什么。

${body}

答案：
${block}
`
}

/** Puts a section right before the problem section (`## 题目（…）`), with a blank line on each side. */
export function insertBeforeProblem(prompt: string, section: string): string {
  const at = prompt.indexOf('\n## 题目（')
  if (at < 0) throw new Error('提示词里找不到「## 题目（」一节')
  return `${prompt.slice(0, at).trimEnd()}\n\n${section.trimEnd()}\n${prompt.slice(at)}`
}
