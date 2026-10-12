// Batch lesson generation: problem → model (`codex exec`, `grok`, or DeepSeek) → validator → feed errors back → retry.
// Usage: npx tsx scripts/generate.ts <problem-id>... [--engine codex|grok|deepseek] [--mode full|single|agent]
//          [--model M] [--effort high] [--rounds 3] [--jobs 3] [--out generated] [--timeout <minutes>]
//          [--max-turns N] [--max-submits N] [--select-engine deepseek|grok] [--blind]
// --mode full (default) is the one-shot mega-prompt. single assembles L0 + picked cards. agent may call tools.
// --blind: the answer key is checked and logged but never fed back, so retries fix only validator errors
// (for evals: otherwise a wrong option letter gets retried until it matches).
// Output: ../<out>/<id>.md (latest attempt) and ../<out>/.attempts/<id>-<n>.md, plus a log line per attempt.
import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, appendFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'
import { docTitle, pointerFor } from '../src/agent/core'
import { assertFitsContext, deepseekComplete, formatUsageNote, runDeepseekAgent } from '../src/agent/deepseek'
import { appendPointedDocs, buildSinglePrompt, outputRequirements, selectCards, type LessonProblem } from '../src/agent/prompt'
import { checkAnswerKey } from './answerkey'
import { validateFile } from './validate'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '../..')

const args = process.argv.slice(2)
const opt = (name: string, fallback: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : fallback
}
const flagValues = new Set(
  ['--rounds', '--jobs', '--effort', '--model', '--engine', '--out', '--timeout', '--mode', '--max-turns', '--max-submits', '--select-engine'].flatMap((f) => [f, opt(f, '\0')]),
)
const ids = args.filter((a) => !a.startsWith('--') && !flagValues.has(a))
const rounds = Number(opt('--rounds', '3'))
const jobs = Number(opt('--jobs', '3'))
const effort = opt('--effort', 'high')
const engine = opt('--engine', 'codex')
if (engine !== 'codex' && engine !== 'grok' && engine !== 'deepseek') {
  console.error(`--engine 只能是 codex、grok 或 deepseek，收到 ${engine}`)
  process.exit(2)
}
const mode = opt('--mode', 'full')
if (mode !== 'full' && mode !== 'single' && mode !== 'agent') {
  console.error(`--mode 只能是 full、single 或 agent，收到 ${mode}`)
  process.exit(2)
}
if (engine === 'codex' && mode !== 'full') {
  console.error('codex 只支持 --mode full')
  process.exit(2)
}
const selectEngine = opt('--select-engine', 'deepseek')
if (selectEngine !== 'deepseek' && selectEngine !== 'grok') {
  console.error(`--select-engine 只能是 deepseek 或 grok，收到 ${selectEngine}`)
  process.exit(2)
}
const model = opt('--model', engine === 'grok' ? 'grok-4.7' : engine === 'deepseek' ? 'deepseek-flash' : '')
// Grok at high effort can reason for well over 20 minutes, and a dropped stream restarts its reasoning from scratch.
const timeoutMin = Number(opt('--timeout', engine === 'grok' ? '60' : engine === 'deepseek' ? '30' : '20'))
const maxTurns = Number(opt('--max-turns', mode === 'agent' && engine === 'grok' ? '60' : '40'))
const maxSubmits = Number(opt('--max-submits', '6'))
const blind = args.includes('--blind')

const outDir = join(root, opt('--out', 'generated'))
const attemptsDir = join(outDir, '.attempts')
mkdirSync(attemptsDir, { recursive: true })

const spec = readFileSync(join(root, 'syntax-spec.md'), 'utf8')
const example = readFileSync(join(root, 'lessons/r6-06-car-chase.md'), 'utf8')
const demo = readFileSync(join(root, 'lessons/_demo-prefabs.md'), 'utf8')

function readProblem(id: string): LessonProblem {
  const raw = readFileSync(join(root, 'problems', `${id}.md`), 'utf8')
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!m) throw new Error(`problems/${id}.md 缺少头信息`)
  const meta = YAML.parse(m[1]) as { id: string; title: string; source: string }
  return { id: meta.id, title: meta.title, source: meta.source, text: m[2].trim() }
}

function firstPrompt(p: ReturnType<typeof readProblem>) {
  return `你是高中物理课件作者。请按《课件语法规范》为下面这道题写一份课件文件：完整解答，并做交互演示。

## 输出要求

- 只输出课件文件本身，第一行就是 \`---\`。不要任何解释，不要用代码围栏包住整个文件。
- 不要读写文件、不要运行命令，所有需要的资料都在本提示里。
- 头信息：\`id: ${p.id}\`，\`source: ${p.source}\`，\`question\` 原样抄题目。
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

function retryPrompt(base: string, previous: string, problems: string) {
  return `${base}

## 上一版课件没有通过校验

校验器报告：

${problems}

上一版课件：

${previous}

请修正这些问题，输出修正后的**完整**课件文件（同样只输出文件本身）。不要调用任何工具，也不要读文件：规范、示例和上一版课件都在本提示里，直接输出。`
}

/** Grok retries continue the first session, which already holds the spec, the problem and the previous lesson. */
function retryNote(problems: string) {
  return `## 上一版课件没有通过校验

校验器报告：

${problems}

请修正这些问题，输出修正后的**完整**课件文件（同样只输出文件本身，第一行就是 \`---\`）。不要调用任何工具，也不要读文件：规范、示例、题目和你上一版的课件都在前面的对话里，直接输出。`
}

// Grok runs with --max-turns 1, so a model that reaches for a tool is stopped before it answers.
// That is not a verdict on the lesson; ask again (bounded) instead of spending one of the rounds.
const TOOL_STOP = /max turns reached|max_turn_requests/
const TOOL_NOTE = '\n\n（上一次回答调用了工具，被系统中止。这里没有可用的工具，请直接输出完整课件文件。）'

async function runWithoutTools(id: string, call: Call): Promise<Reply> {
  for (let k = 0; ; k++) {
    try {
      return await runModel(k ? { ...call, prompt: call.prompt + TOOL_NOTE } : call)
    } catch (e) {
      if (k >= 2 || !TOOL_STOP.test((e as Error).message)) throw e
      log(`${id} 调用了工具被中止，重问一次（${k + 1}/2）`)
    }
  }
}

function cleanOutput(text: string) {
  let t = text.trim()
  const fence = t.match(/^```[a-z]*\n([\s\S]*?)\n```$/)
  if (fence) t = fence[1].trim()
  const start = t.indexOf('---')
  return start > 0 ? t.slice(start) : t
}

type Reply = { text: string; note: string; session?: string; stopReason?: string; costUsd?: number }
/** `dir` is the problem's working directory; `resume` continues an earlier grok session there. */
type Call = {
  prompt: string
  dir: string
  resume?: string
  /** Defaults keep the full-mode grok command: one turn, only read_file. */
  turns?: number
  tools?: string
  deny?: string
  approve?: boolean
  loose?: boolean
  effortOverride?: string
}

function armTimeout(child: ChildProcess) {
  let timedOut = false
  let hardKill: NodeJS.Timeout | undefined
  const timer = setTimeout(() => {
    timedOut = true
    child.kill('SIGTERM')
    hardKill = setTimeout(() => child.kill('SIGKILL'), 10_000)
  }, timeoutMin * 60_000)
  return {
    timedOut: () => timedOut,
    clear: () => (clearTimeout(timer), clearTimeout(hardKill)),
  }
}

function runCodex({ prompt }: Call): Promise<Reply> {
  const dir = mkdtempSync(join(tmpdir(), 'genui-gen-'))
  const out = join(dir, 'last.md')
  const cmd = ['exec', '--skip-git-repo-check', '--ephemeral', '-s', 'read-only', '-C', dir, '-o', out, '-c', `model_reasoning_effort="${effort}"`]
  if (model) cmd.push('-m', model)
  cmd.push('-')
  return new Promise((resolve, reject) => {
    const child = spawn('codex', cmd, { stdio: ['pipe', 'ignore', 'pipe'] })
    let stderr = ''
    child.stderr.on('data', (d) => (stderr += d))
    const timeout = armTimeout(child)
    child.on('close', (code) => {
      timeout.clear()
      const text = existsSync(out) ? readFileSync(out, 'utf8') : ''
      rmSync(dir, { recursive: true, force: true })
      if (timeout.timedOut()) reject(new Error(`超时（${timeoutMin} 分钟）`))
      else if (code !== 0 || !text.trim()) reject(new Error(`codex exit ${code}: ${stderr.slice(-800)}`))
      else resolve({ text, note: '' })
    })
    child.stdin.end(prompt)
  })
}

// Without these, grok also loads ~/.claude/CLAUDE.md, Claude/Cursor skills, rules and hooks into the
// prompt, so the eval would measure the user's personal setup instead of the spec.
const grokEnv = Object.fromEntries(
  ['CLAUDE_AGENTS', 'CLAUDE_SKILLS', 'CLAUDE_RULES', 'CLAUDE_HOOKS', 'CLAUDE_MCPS', 'CURSOR_AGENTS', 'CURSOR_SKILLS', 'CURSOR_RULES', 'CURSOR_HOOKS', 'CURSOR_MCPS'].map(
    (k) => [`GROK_${k}_ENABLED`, '0'],
  ),
)

// grok sends only about 98 KB of a prompt; the rest goes to a file the model is told to read_file,
// which --max-turns 1 forbids (it kept 98,627 of 114,405 bytes). Refuse instead of truncating silently.
const GROK_INLINE_LIMIT = 96_000

function runGrok({ prompt, dir, resume, turns, tools, deny, approve, loose, effortOverride }: Call): Promise<Reply> {
  const bytes = Buffer.byteLength(prompt)
  if (bytes > GROK_INLINE_LIMIT) {
    return Promise.reject(new Error(`提示词 ${bytes} 字节，超过 grok 的内联上限（约 98 KB，这里按 ${GROK_INLINE_LIMIT} 卡），超出部分会被换成「用 read_file 读」的说明`))
  }
  const file = join(dir, `prompt-${Date.now()}.md`)
  writeFileSync(file, prompt)
  // `--tools ""` means "no allowlist" (every tool); one harmless tool keeps the tool schemas out of the prompt.
  // With no overrides this is the full-mode command: one turn, read_file only.
  const cmd = ['--prompt-file', file, '-m', model, '--reasoning-effort', effortOverride ?? effort, '--output-format', 'json', '--cwd', dir,
    '--no-subagents', '--disable-web-search', '--max-turns', String(turns ?? 1), '--tools', tools ?? 'read_file']
  if (deny) cmd.push('--disallowed-tools', deny)
  if (approve) cmd.push('--always-approve', '--permission-mode', 'bypassPermissions')
  if (resume) cmd.push('--resume', resume)
  return new Promise((resolve, reject) => {
    const child = spawn('grok', cmd, { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...grokEnv, GROK_DISABLE_WEB_FETCH: '1' } })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d) => (stdout += d))
    child.stderr.on('data', (d) => (stderr += d))
    const timeout = armTimeout(child)
    child.on('close', (code) => {
      timeout.clear()
      rmSync(file, { force: true })
      if (timeout.timedOut()) return reject(new Error(`超时（${timeoutMin} 分钟）`))
      let r: { text?: string; stopReason?: string; sessionId?: string; total_cost_usd?: number; usage?: { input_tokens?: number; output_tokens?: number } }
      try {
        r = JSON.parse(stdout)
      } catch {
        return reject(new Error(`grok exit ${code}: ${(stderr || stdout).slice(-800)}`))
      }
      const k = (n?: number) => `${Math.round((n ?? 0) / 1000)}k`
      const note = `，$${(r.total_cost_usd ?? 0).toFixed(3)}，输入 ${k(r.usage?.input_tokens)} / 输出 ${k(r.usage?.output_tokens)} token${resume ? '，续接上一轮会话' : ''}`
      const reply: Reply = { text: r.text ?? '', note, session: r.sessionId ?? resume, stopReason: r.stopReason, costUsd: r.total_cost_usd }
      if (loose) {
        if (code !== 0 && !r.text?.trim()) return reject(new Error(`grok exit ${code}, stop ${r.stopReason}: ${stderr.slice(-800)}`))
        return resolve(reply)
      }
      if (code !== 0 || !r.text?.trim()) return reject(new Error(`grok exit ${code}, stop ${r.stopReason}: ${stderr.slice(-800)}`))
      if (r.stopReason !== 'end_turn') return reject(new Error(`grok 未正常结束（${r.stopReason}），输出 ${r.text.length} 字`))
      resolve(reply)
    })
  })
}

async function runDeepseek({ prompt }: Call): Promise<Reply> {
  assertFitsContext(prompt)
  const res = await deepseekComplete(prompt, { model: model || 'deepseek-flash', timeoutMs: timeoutMin * 60_000, thinking: true, reasoningEffort: 'high' })
  return { text: res.text, note: formatUsageNote(res.usage, res.costUsd), costUsd: res.costUsd }
}

function runModel(call: Call): Promise<Reply> {
  if (engine === 'grok') return runGrok(call)
  if (engine === 'deepseek') return runDeepseek(call)
  return runCodex(call)
}

const log = (line: string) => {
  const stamped = `${new Date().toISOString()} ${line}`
  console.log(stamped)
  appendFileSync(join(outDir, 'generate.log'), stamped + '\n')
}

// Shell plus reading and writing files. Web, MCP, image and plan tools stay off.
const GROK_AGENT_TOOLS = 'run_terminal_command,read_file,write,search_replace,list_dir,grep'
const GROK_AGENT_DENY = 'web_fetch,search_tool,use_tool,image_gen,image_edit,image_to_video,reference_to_video,workflow,enter_plan_mode,exit_plan_mode,ask_user_question'

type Outcome = { id: string; ok: boolean; keyOk: boolean; manual: string[]; attempts: number; warnings: string[] }

function failed(id: string, attempts: number): Outcome {
  return { id, ok: false, keyOk: false, manual: [], attempts, warnings: [] }
}

function withSelectionCost(note: string, extra: number): string {
  if (!(extra > 0)) return note
  const found = note.match(/，\$([\d.]+)/)
  if (!found) return `，$${extra.toFixed(4)}${note}`
  return note.replace(found[0], `，$${(Number(found[1]) + extra).toFixed(4)}`)
}

function reportOf(r: { errors: { line?: number; message: string }[]; warnings: { line?: number; message: string }[] }, missing: string[]): string {
  const pointed = (message: string) => {
    const doc = pointerFor(message).doc
    return `${doc}（${docTitle(doc)}）`
  }
  const lines = [
    ...r.errors.map((e) => `- 错误${e.line ? `（第 ${e.line} 行）` : ''}：${e.message}（${pointed(e.message)}）`),
    ...(blind ? [] : missing).map((q) => `- 答案核对：「${q}」与标准答案不符（或 answers 里缺这一项）。请重新审题：题目文字可能省略了原图里的信息（例如光在某个面上先反射），选择能让题设条件全部成立的解释，不要轻易断定题目矛盾。`),
    ...r.warnings.map((w) => `- 提醒${w.line ? `（第 ${w.line} 行）` : ''}：${w.message}（${pointed(w.message)}）`),
  ]
  if (r.errors.length || r.warnings.length) lines.push('', '这些文档 id 在《课件语法规范》里对应标题相同的章节。')
  return lines.join('\n')
}

function storeAttempt(id: string, n: number, text: string, started: number, note: string) {
  const attempt = join(attemptsDir, `${id}-${n}.md`)
  writeFileSync(attempt, text + '\n')
  writeFileSync(join(outDir, `${id}.md`), text + '\n')
  const r = validateFile(attempt)
  const secs = Math.round((Date.now() - started) / 1000)
  log(`${id} 第 ${n} 次：${r.errors.length} 个错误，${r.warnings.length} 个提醒（${secs}s${note}，mode=${mode} engine=${engine}）`)
  const key = checkAnswerKey(id, text)
  if (key.missing.length) log(`${id} 第 ${n} 次：标准答案核对未通过：${key.missing.join('；')}`)
  const keyOk = key.missing.length === 0
  const done = r.errors.length === 0 && (keyOk || blind)
  const outcome: Outcome = { id, ok: done, keyOk, manual: key.manual, attempts: n, warnings: done ? r.warnings.map((w) => w.message) : [] }
  return { done, report: reportOf(r, key.missing), errorCount: r.errors.length, messages: [...r.errors, ...r.warnings].map((e) => e.message), outcome }
}

function grokAgentPrompt(p: LessonProblem): string {
  const raw = readFileSync(join(root, 'skills/genui/SKILL.md'), 'utf8')
  const body = raw.replace(/^---\n[\s\S]*?\n---\n*/, '')
  return `${body.trim()}

${outputRequirements(p, true)}

把课件写到当前目录的 lesson.md（第一行就是 \`---\`，不要用代码围栏包住整个文件）。写完运行：

/Users/huangxuewei/Projects/genui/bin/genui validate lesson.md

每条错误末尾写着该读的文档。用 \`/Users/huangxuewei/Projects/genui/bin/genui docs <id>\` 读完再改，直到校验没有错误。然后运行：

/Users/huangxuewei/Projects/genui/bin/genui layout lesson.md

按报告改掉压线和出界。不要联网，不要启动子代理。

## 题目（${p.title}，${p.source}）

${p.text.trim()}
`
}

function agentRetry(report: string): string {
  return `## 上一版课件没有通过校验

校验器报告：

${report}

请把修正后的完整课件重新写入当前目录的 lesson.md，再运行 /Users/huangxuewei/Projects/genui/bin/genui validate lesson.md，直到没有错误。可以读文档。不要联网。`
}

async function generate(id: string): Promise<Outcome> {
  if (mode === 'agent' && engine === 'deepseek') return generateDeepseekAgent(id)
  if (mode === 'agent' && engine === 'grok') return generateGrokAgent(id)
  // grok files sessions under the working directory, so every round of one problem runs in the same one.
  const dir = mkdtempSync(join(tmpdir(), 'genui-gen-'))
  try {
    return await runRounds(id, dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

async function generateDeepseekAgent(id: string): Promise<Outcome> {
  const problem = readProblem(id)
  let extra = ''
  for (let n = 1; n <= rounds; n++) {
    const started = Date.now()
    const transcript = join(attemptsDir, n === 1 ? `${id}-agent.jsonl` : `${id}-agent-${n}.jsonl`)
    let result: Awaited<ReturnType<typeof runDeepseekAgent>>
    try {
      result = await runDeepseekAgent(extra ? { ...problem, text: `${problem.text}\n\n${extra}` } : problem, {
        model: model || 'deepseek-flash',
        maxTurns,
        timeoutMs: timeoutMin * 60_000,
        maxSubmits,
        transcriptPath: transcript,
      })
    } catch (e) {
      log(`${id} 第 ${n} 次 deepseek 失败：${(e as Error).message}`)
      return failed(id, n)
    }
    if (result.error) log(`${id} agent 中止：${result.error}`)
    if (!result.lesson) {
      log(`${id} 第 ${n} 次 deepseek 没有提交课件（${result.stopped}，${result.turns} 轮，${result.submits} 次提交，${Math.round((Date.now() - started) / 1000)}s${formatUsageNote(result.usage, result.costUsd)}，mode=${mode} engine=${engine}）`)
      return failed(id, n)
    }
    const note = formatUsageNote(result.usage, result.costUsd, `，turns=${result.turns} submits=${result.submits} ${result.stopped}`)
    const stored = storeAttempt(id, n, cleanOutput(result.lesson), started, note)
    if (stored.done) return stored.outcome
    // The tool loop already used its submit budget. Start over only when the file validates and the key does not.
    if (stored.errorCount > 0) return { ...stored.outcome, ok: false }
    extra = `## 上一版没有通过对答案\n\n${stored.report}\n\n请重新审题后用 submit_lesson 再交一份完整课件。`
  }
  return failed(id, rounds)
}

async function generateGrokAgent(id: string): Promise<Outcome> {
  const problem = readProblem(id)
  const dir = join(attemptsDir, `${id}-work`)
  mkdirSync(dir, { recursive: true })
  let session: string | undefined
  let prompt = grokAgentPrompt(problem)
  for (let n = 1; n <= rounds; n++) {
    const started = Date.now()
    let note = ''
    let stop = ''
    try {
      const reply = await runGrok({
        prompt,
        dir,
        resume: session,
        turns: maxTurns,
        tools: GROK_AGENT_TOOLS,
        deny: GROK_AGENT_DENY,
        approve: true,
        loose: true,
      })
      note = reply.note
      session = reply.session
      if (reply.stopReason && reply.stopReason !== 'end_turn') stop = `，stop=${reply.stopReason}`
    } catch (e) {
      log(`${id} 第 ${n} 次 grok 失败：${(e as Error).message}`)
      continue
    }
    const lessonPath = join(dir, 'lesson.md')
    if (!existsSync(lessonPath)) {
      log(`${id} 第 ${n} 次 grok 没有写出 lesson.md（${Math.round((Date.now() - started) / 1000)}s${note}${stop}，mode=${mode} engine=${engine}）`)
      prompt = agentRetry('没有找到 lesson.md。')
      continue
    }
    const stored = storeAttempt(id, n, cleanOutput(readFileSync(lessonPath, 'utf8')), started, `${note}${stop}`)
    if (stored.done) return stored.outcome
    prompt = agentRetry(stored.report)
  }
  return failed(id, rounds)
}

/** Cuts text into pieces under `limit` bytes, preferring a Markdown heading (#–###) as the cut point. */
function chunkAtHeadings(text: string, limit: number): string[] {
  const parts: string[] = []
  let rest = text
  while (Buffer.byteLength(rest) > limit) {
    let cut = -1
    const re = /\n(?=#{1,3} )/g
    for (let m = re.exec(rest); m; m = re.exec(rest)) {
      if (Buffer.byteLength(rest.slice(0, m.index)) > limit) break
      cut = m.index
    }
    if (cut <= 0) {
      cut = rest.lastIndexOf('\n', Math.floor(limit / 3))
      while (cut > 0 && Buffer.byteLength(rest.slice(0, cut)) > limit) cut = rest.lastIndexOf('\n', cut - 1)
      if (cut <= 0) throw new Error('找不到能切开的换行')
    }
    parts.push(rest.slice(0, cut))
    rest = rest.slice(cut + 1)
  }
  parts.push(rest)
  return parts
}

/**
 * A first prompt over grok's inline limit goes out as several messages in one session: the
 * instructions, spec and examples cut at headings (each answered with a bare acknowledgement),
 * then the problem.
 */
async function splitFirstCall(id: string, base: string, dir: string): Promise<Call> {
  const at = base.indexOf('\n## 题目（')
  // Room for the note appended to each piece.
  const pieces = chunkAtHeadings(base.slice(0, at), GROK_INLINE_LIMIT - 1_000)
  const tail = `${base.slice(at).trim()}\n\n请按前面几条消息里的输出要求和《课件语法规范》为这道题写课件文件，只输出文件本身，第一行就是 \`---\`。`
  log(`${id} 提示词 ${Buffer.byteLength(base)} 字节，超过 grok 内联上限，分 ${pieces.length + 1} 条发送（规范和示例 ${pieces.length} 条，题目一条）`)
  let session: string | undefined
  for (const [k, piece] of pieces.entries()) {
    const more = k < pieces.length - 1 ? '后面还有下一部分。' : '题目在下一条消息里给出。'
    const prompt = `${piece}\n\n（以上是第 ${k + 1}/${pieces.length} 部分，${more}现在只回复「收到」两个字，不要写课件。）`
    const primer = await runWithoutTools(id, { prompt, dir, resume: session })
    if (!primer.session) throw new Error('grok 没有返回会话编号，无法续接')
    session = primer.session
  }
  return { prompt: tail, dir, resume: session }
}

async function runRounds(id: string, dir: string): Promise<Outcome> {
  const problem = readProblem(id)
  let base = firstPrompt(problem)
  let included: string[] = []
  let selectionCost = 0
  if (mode === 'single') {
    try {
      let grokSelectCost = 0
      const sel = await selectCards(problem, {
        complete:
          selectEngine === 'grok'
            ? async (user) => {
                const selectDir = mkdtempSync(join(tmpdir(), 'genui-select-'))
                try {
                  const reply = await runGrok({ prompt: user, dir: selectDir, turns: 1, effortOverride: 'low' })
                  grokSelectCost += reply.costUsd ?? 0
                  return reply.text
                } finally {
                  rmSync(selectDir, { recursive: true, force: true })
                }
              }
            : undefined,
        timeoutMs: Math.min(timeoutMin * 60_000, 180_000),
      })
      const built = buildSinglePrompt(problem, sel.cards, { refs: sel.refs })
      base = built.text
      included = built.included
      selectionCost = sel.costUsd + grokSelectCost
      log(`${id} 选卡 ${built.cards.join(',')}，参考 ${built.refs.join(',') || '无'}，省略 ${built.omittedRefs.join(',') || '无'}，提示 ${built.bytes} 字节${sel.unknown.length ? `，丢掉 ${sel.unknown.join(',')}` : ''}`)
    } catch (e) {
      log(`${id} 选卡失败：${(e as Error).message}`)
      return failed(id, 0)
    }
  }
  let call: Call = { prompt: base, dir }
  if (engine === 'grok' && Buffer.byteLength(base) > GROK_INLINE_LIMIT) {
    try {
      call = await splitFirstCall(id, base, dir)
    } catch (e) {
      log(`${id} 发送规范失败：${(e as Error).message}`)
      return failed(id, 0)
    }
  }
  for (let n = 1; n <= rounds; n++) {
    const started = Date.now()
    let text: string
    let note: string
    let session: string | undefined
    try {
      const reply = await runWithoutTools(id, call)
      text = cleanOutput(reply.text)
      note = n === 1 ? withSelectionCost(reply.note, selectionCost) : reply.note
      session = reply.session
    } catch (e) {
      log(`${id} 第 ${n} 次 ${engine} 失败：${(e as Error).message}`)
      continue
    }
    const stored = storeAttempt(id, n, text, started, note)
    if (stored.done) return stored.outcome
    let appendix = ''
    if (mode === 'single') {
      const grown = appendPointedDocs(base, included, stored.messages)
      if (grown.added.length) {
        included = [...included, ...grown.added]
        base = grown.text
        appendix = grown.appendix
        log(`${id} 第 ${n} 次补读 ${grown.added.join(',')}`)
      }
    }
    // Resending spec + problem + previous lesson in one grok prompt exceeds its inline limit (see runGrok).
    const grokRetry = appendix ? `${retryNote(stored.report)}\n\n${appendix}` : retryNote(stored.report)
    call = engine === 'grok' && session ? { prompt: grokRetry, dir, resume: session } : { prompt: retryPrompt(base, text, stored.report), dir }
  }
  return failed(id, rounds)
}

async function pool<T, R>(items: T[], size: number, fn: (x: T) => Promise<R>) {
  const results: R[] = []
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next++
        results[i] = await fn(items[i])
      }
    }),
  )
  return results
}

if (ids.length === 0) {
  console.error('usage: npx tsx scripts/generate.ts <problem-id>... [--engine codex|grok|deepseek] [--mode full|single|agent] [--model M] [--effort high] [--rounds 3] [--jobs 3] [--out generated] [--timeout 分钟] [--max-turns N] [--max-submits N] [--select-engine deepseek|grok]')
  process.exit(2)
}
log(`开始：${ids.join(', ')}（engine=${engine} mode=${mode}${model ? ` model=${model}` : ''} rounds=${rounds} jobs=${jobs} effort=${effort} timeout=${timeoutMin}min${mode === 'agent' ? ` max-turns=${maxTurns} max-submits=${maxSubmits}` : ''}${mode === 'single' ? ` select=${selectEngine}` : ''}${blind ? ' blind' : ''}）`)
const results = await pool(ids, jobs, generate)
for (const r of results) {
  const verdict = !r.ok ? '未通过' : blind ? `校验通过（第 ${r.attempts} 次），答案${r.keyOk ? '正确' : '错误'}` : `通过（第 ${r.attempts} 次）`
  log(`结果 ${r.id}：${verdict}${r.manual.length ? `，待人工核对：${r.manual.join('；')}` : ''}${r.warnings.length ? `，提醒 ${r.warnings.length} 条` : ''}`)
}
