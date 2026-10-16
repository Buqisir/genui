// Step-by-step offline eval. Every model call becomes files: a person or an agent that can only read and
// write files plays the model. Problem headers and problems/expected*.yaml never reach the prompts (see genprompt.ts).
//
//   select  <id> --dir D                 → D/select-prompt.md (the card-selection prompt, single and compact arms)
//   prompt  <id> --arm full|single|compact --dir D
//                                        → D/prompt-1.md, D/base.md, D/meta.json. single/compact read D/select-reply.md.
//   check   <id> --dir D --round N       → reads D/reply-N.md, then as generate.ts does: a patch is merged into
//                                          D/current.md, a full lesson replaces it, and the result is validated.
//                                          Writes D/report-N.md, one line in D/log.jsonl, and D/prompt-(N+1).md when
//                                          the lesson did not pass and N < 3.
//   summary <rootDir>                    → Markdown tables from every <rootDir>/*/log.jsonl
//
// Usage errors exit 2. A reply that fails is a failed round, not an error, so check exits 0.
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { appendPointedDocs, buildSinglePrompt, selectCards, selectionUserPrompt, type LessonProblem } from '../src/agent/prompt'
import { applyPatch, isPatch } from '../src/lesson/patch'
import { checkAnswerKey } from './answerkey'
import { FIRST_FULL, cleanOutput, firstPrompt, issuesOf, readProblem, reportOf, retryPrompt, withProgress } from './genprompt'
import { formatProgress, progressOf, type ProgressIssue } from './progress'
import { validateFile } from './validate'

/** Same default as generate.ts --rounds. */
const MAX_ROUNDS = 3
const ARMS = ['full', 'single', 'compact'] as const
type Arm = (typeof ARMS)[number]

interface Meta {
  id: string
  arm: Arm
  /** Doc ids whose full text is already in base.md; a validator message that names another one adds it (single and compact). */
  included: string[]
  cards?: string[]
  refs?: string[]
  omittedRefs?: string[]
  unknown?: string[]
  /** Validator errors of each validated round, keyed by round number. A check compares with the latest earlier round. */
  issues?: Record<string, ProgressIssue[]>
}

interface Row {
  id: string
  arm: Arm
  round: number
  promptBytes: number
  /** Bytes of the reply after cleanOutput (fence and preamble removed). */
  replyBytes: number
  isPatch: boolean
  /** null when no merge was attempted (not a patch, or a patch in round 1). */
  mergeOk: boolean | null
  /** null when the reply was not validated (unmerged patch, or a patch in round 1). */
  errors: number | null
  warnings: number | null
  keyOk: boolean | null
  passed: boolean
  applied: string[]
}

function usage(message: string): never {
  console.error(message)
  console.error(
    'usage: eval-step.ts select <id> --dir D | prompt <id> --arm full|single|compact --dir D | check <id> --dir D --round N | summary <rootDir>',
  )
  process.exit(2)
}

const [cmd, ...rest] = process.argv.slice(2)
const flag = (name: string) => {
  const i = rest.indexOf(name)
  return i >= 0 ? rest[i + 1] : undefined
}
const positional = rest[0] && !rest[0].startsWith('--') ? rest[0] : undefined

function needDir(): string {
  const dir = flag('--dir')
  if (!dir) usage('缺少 --dir')
  return dir
}

function needId(): string {
  if (!positional) usage('缺少题目 id')
  return positional
}

function loadProblem(id: string): LessonProblem {
  try {
    return readProblem(id)
  } catch {
    return usage(`找不到题目：problems/${id}.md`)
  }
}

function needFile(path: string, hint: string): string {
  if (!existsSync(path)) usage(`${path} 不存在：${hint}`)
  return readFileSync(path, 'utf8')
}

function readMeta(dir: string, id: string): Meta {
  const meta = JSON.parse(needFile(join(dir, 'meta.json'), '先运行 prompt')) as Meta
  if (meta.id !== id) usage(`${dir} 里的记录是题目 ${meta.id}，不是 ${id}`)
  return meta
}

function writeMeta(dir: string, meta: Meta) {
  writeFileSync(join(dir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n')
}

function cmdSelect() {
  const id = needId()
  const dir = needDir()
  const text = selectionUserPrompt(loadProblem(id))
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'select-prompt.md'), text)
  console.log(`select-prompt.md：${Buffer.byteLength(text)} 字节。把模型的回答（JSON）写进 ${join(dir, 'select-reply.md')}，再运行 prompt --arm single 或 compact。`)
}

async function cmdPrompt() {
  const id = needId()
  const armFlag = flag('--arm')
  if (!ARMS.includes(armFlag as Arm)) usage('--arm 只能是 full、single 或 compact')
  const arm = armFlag as Arm
  const dir = needDir()
  if (existsSync(join(dir, 'log.jsonl')) || existsSync(join(dir, 'current.md'))) {
    usage(`${dir} 已有上一轮的记录（log.jsonl 或 current.md），换一个目录`)
  }
  const problem = loadProblem(id)
  mkdirSync(dir, { recursive: true })
  let base: string
  let meta: Meta
  if (arm === 'full') {
    base = firstPrompt(problem)
    meta = { id, arm, included: [] }
  } else {
    const reply = needFile(join(dir, 'select-reply.md'), '先运行 select，再把模型的选卡回答写进 select-reply.md')
    let sel: Awaited<ReturnType<typeof selectCards>>
    try {
      // Same path as generate.ts: selectCards parses the reply, unknown ids are dropped.
      sel = await selectCards(problem, { complete: async () => reply })
    } catch (e) {
      return usage(`选卡回答解析失败：${(e as Error).message}`)
    }
    const built = buildSinglePrompt(problem, sel.cards, { refs: sel.refs, signatures: arm === 'compact' })
    base = built.text
    meta = {
      id,
      arm,
      cards: built.cards,
      refs: built.refs,
      omittedRefs: built.omittedRefs,
      unknown: sel.unknown,
      included: built.included,
    }
  }
  writeFileSync(join(dir, 'base.md'), base)
  writeFileSync(join(dir, 'prompt-1.md'), base)
  writeMeta(dir, meta)
  const detail = meta.cards ? `，卡片 ${meta.cards.join(',')}，参考 ${meta.refs?.join(',') || '无'}${meta.unknown?.length ? `，丢掉 ${meta.unknown.join(',')}` : ''}` : ''
  console.log(`prompt-1.md：${Buffer.byteLength(base)} 字节（${arm}${detail}）`)
}

function cmdCheck() {
  const id = needId()
  const dir = needDir()
  const n = Number(flag('--round'))
  if (!Number.isInteger(n) || n < 1 || n > MAX_ROUNDS) usage(`--round 只能是 1 到 ${MAX_ROUNDS}`)
  const meta = readMeta(dir, id)
  const promptPath = join(dir, `prompt-${n}.md`)
  if (!existsSync(promptPath)) usage(`${promptPath} 不存在：先运行 prompt，或上一轮的 check`)
  const promptBytes = statSync(promptPath).size
  const raw = cleanOutput(needFile(join(dir, `reply-${n}.md`), `把第 ${n} 轮的回复写进 reply-${n}.md`))
  const currentPath = join(dir, 'current.md')
  // current.md holds the lesson plus one newline (the same text generate.ts writes to disk).
  const current = existsSync(currentPath) ? readFileSync(currentPath, 'utf8').replace(/\n$/, '') : undefined
  let base = readFileSync(join(dir, 'base.md'), 'utf8')

  const patchReply = isPatch(raw)
  let text: string | undefined
  let mergeOk: boolean | null = null
  let applied: string[] = []
  let report = ''
  let progress = ''
  let note = ''
  if (patchReply && current === undefined) {
    // Same as generate.ts: the first round must be a full lesson.
    report = FIRST_FULL
    note = '第一轮是补丁，要完整课件'
  } else if (patchReply) {
    const merged = applyPatch(current!, raw)
    mergeOk = merged.ok
    applied = merged.applied
    if (merged.ok) {
      text = merged.text
    } else {
      report = `补丁没有用上（课件没有改动）：\n${merged.errors.map((e) => `- ${e}`).join('\n')}`
      note = '补丁没有用上'
    }
  } else {
    text = raw
  }

  let finalCurrent = current
  let judged: { errors: number; warnings: number; keyOk: boolean; passed: boolean } | undefined
  if (text !== undefined) {
    writeFileSync(currentPath, text + '\n')
    finalCurrent = text
    const r = validateFile(currentPath)
    const key = checkAnswerKey(id, text)
    const keyOk = key.missing.length === 0
    judged = { errors: r.errors.length, warnings: r.warnings.length, keyOk, passed: r.errors.length === 0 && keyOk }
    report = reportOf(r, key.missing)
    // Saved before the retry prompt is built, so the next check can compare with this round.
    const issues = issuesOf(r, key.missing)
    const prevRound = Object.keys(meta.issues ?? {}).map(Number).filter((k) => k < n).sort((a, b) => b - a)[0]
    progress = formatProgress(progressOf(prevRound === undefined ? [] : meta.issues![String(prevRound)], issues))
    meta.issues = { ...meta.issues, [n]: issues }
    writeMeta(dir, meta)
    note = `${judged.errors} errors, key ${keyOk ? 'ok' : 'wrong'}`
    if (!judged.passed && meta.arm !== 'full') {
      const grown = appendPointedDocs(base, meta.included, [...r.errors, ...r.warnings].map((e) => e.message))
      if (grown.added.length) {
        base = grown.text
        meta.included = [...meta.included, ...grown.added]
        writeFileSync(join(dir, 'base.md'), base)
        writeMeta(dir, meta)
        console.log(`补读文档：${grown.added.join(',')}`)
      }
    }
  }
  const passed = judged?.passed === true

  writeFileSync(join(dir, `report-${n}.md`), report + '\n')
  // A re-run of the same round replaces its line, so a round is never counted twice.
  const logPath = join(dir, 'log.jsonl')
  const kept = existsSync(logPath)
    ? readFileSync(logPath, 'utf8')
        .split('\n')
        .filter((l) => l.trim() && (JSON.parse(l) as Row).round !== n)
    : []
  const row: Row = {
    id,
    arm: meta.arm,
    round: n,
    promptBytes,
    replyBytes: Buffer.byteLength(raw),
    isPatch: patchReply,
    mergeOk,
    errors: judged?.errors ?? null,
    warnings: judged?.warnings ?? null,
    keyOk: judged?.keyOk ?? null,
    passed,
    applied,
  }
  writeFileSync(logPath, [...kept, JSON.stringify(row)].join('\n') + '\n')

  let next = ''
  if (!passed && n < MAX_ROUNDS) {
    writeFileSync(join(dir, `prompt-${n + 1}.md`), retryPrompt(base, finalCurrent, withProgress(progress, report)))
    next = `; next: prompt-${n + 1}.md`
  }
  console.log(`round ${n}: ${passed ? 'passed' : 'failed'} (${note})${next}`)
}

interface Run {
  dir: string
  id: string
  arm: Arm
  rows: Row[]
}

function readRuns(rootDir: string): Run[] {
  const runs: Run[] = []
  for (const name of readdirSync(rootDir).sort()) {
    const file = join(rootDir, name, 'log.jsonl')
    if (!existsSync(file)) continue
    const rows = readFileSync(file, 'utf8')
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as Row)
      .sort((a, b) => a.round - b.round)
    if (rows.length) runs.push({ dir: name, id: rows[0].id, arm: rows[0].arm, rows })
  }
  return runs
}

const pct = (k: number, n: number) => (n ? `${k}/${n}（${Math.round((100 * k) / n)}%）` : '–')
const mean = (xs: number[]) => (xs.length ? String(Math.round(xs.reduce((a, b) => a + b, 0) / xs.length)) : '–')

function armRow(arm: string, runs: Run[]): string {
  const ids = new Set(runs.map((r) => r.id))
  const first = (r: Run) => r.rows.find((x) => x.round === 1)
  const pass1 = runs.filter((r) => first(r)?.passed).length
  const passAny = runs.filter((r) => r.rows.some((x) => x.passed)).length
  const finalOk = runs.filter((r) => r.rows[r.rows.length - 1].keyOk === true).length
  const retries = runs.flatMap((r) => r.rows.filter((x) => x.round > 1))
  const patches = retries.filter((x) => x.isPatch)
  const merged = patches.filter((x) => x.mergeOk === true)
  const all = runs.flatMap((r) => r.rows)
  const patchBytes = all.filter((x) => x.isPatch).map((x) => x.replyBytes)
  const fullBytes = all.filter((x) => !x.isPatch).map((x) => x.replyBytes)
  const p1 = runs.map(first).filter((x): x is Row => !!x)
  return `| ${arm} | ${ids.size} | ${runs.length} | ${pct(pass1, runs.length)} | ${pct(passAny, runs.length)} | ${pct(finalOk, runs.length)} | ${mean(p1.map((x) => x.promptBytes))} | ${mean(p1.map((x) => x.replyBytes))} | ${retries.length} / ${patches.length} / ${merged.length} | ${mean(patchBytes)} | ${mean(fullBytes)} |`
}

function cmdSummary() {
  const rootDir = positional ?? usage('缺少目录：summary <rootDir>')
  const runs = readRuns(rootDir)
  if (!runs.length) usage(`${rootDir} 下没有 */log.jsonl`)
  const arms = [...new Set(runs.map((r) => r.arm))].sort((a, b) => (ARMS.indexOf(a as Arm) - ARMS.indexOf(b as Arm)) || a.localeCompare(b))
  const lines = [
    `运行 ${runs.length} 次（${new Set(runs.map((r) => r.id)).size} 题），目录 ${rootDir}`,
    '',
    '| 臂 | 题数 | 运行 | pass@1 | pass@≤3 | 最终答案正确 | prompt-1 字节（均值） | reply-1 字节（均值） | 重试回复 / 其中补丁 / 合并成功 | 补丁字节（均值） | 整课件字节（均值） |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    ...arms.map((arm) => armRow(arm, runs.filter((r) => r.arm === arm))),
    '',
    '每题：通过时的轮次，✗ 为三轮都没过；多次运行用「、」分开。',
    '',
    `| 题目 | ${arms.join(' | ')} |`,
    `|---|${arms.map(() => '---').join('|')}|`,
  ]
  const ids = [...new Set(runs.map((r) => r.id))].sort()
  for (const id of ids) {
    const cells = arms.map((arm) => {
      const mine = runs.filter((r) => r.id === id && r.arm === arm)
      if (!mine.length) return '–'
      return mine.map((r) => {
        const hit = r.rows.find((x) => x.passed)
        return hit ? String(hit.round) : '✗'
      }).join('、')
    })
    lines.push(`| ${id} | ${cells.join(' | ')} |`)
  }
  console.log(lines.join('\n'))
}

async function main() {
  switch (cmd) {
    case 'select':
      return cmdSelect()
    case 'prompt':
      return cmdPrompt()
    case 'check':
      return cmdCheck()
    case 'summary':
      return cmdSummary()
    default:
      usage(cmd ? `未知命令：${cmd}` : '缺少命令')
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
