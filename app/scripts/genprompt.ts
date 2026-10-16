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
- 选择题：头信息写 \`choice\`（选出的选项字母，多选按字母顺序连写，如 \`BD\`），按第七节第 13 条逐项判断；没有数值答案时写 \`answers: []\`。
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
