// 标准评测：evals/standard.yaml 里的固定题单，换生成模型时一条命令跑完，并出对比表。
//   npx tsx scripts/eval-standard.ts run --engine E [--model M] [--modes full,single,compact] [--rounds 3] [--jobs 3]
//                                        [--effort X] [--label L] [其它 generate.ts 参数原样透传]
//   模式名可以加 -solve 后缀（如 single-solve）：同一模式先让模型单独解题（generate.ts --solve-first），再写课件。
//   npx tsx scripts/eval-standard.ts report <结果根目录>
// run 的结果在 evals/runs/<日期>-<label 或 engine-model>/：每个模式一个子目录，另有 run.json 和 report.md。
// 每个模式调一次 generate.ts --blind（答案键只记录不反馈，重试只修校验错误）。report 只读已有结果，不调模型。
import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'
import { checkAnswerKey } from './answerkey'
import { parseTiming } from './eval-report'
import { validateFile } from './validate'

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const root = join(appDir, '..')
const standardFile = join(root, 'evals', 'standard.yaml')
const runsDir = join(root, 'evals', 'runs')

const ENGINES = ['codex', 'grok', 'deepseek']
const MODES = ['full', 'single', 'compact', 'agent']
const DEFAULT_MODES = ['full', 'single', 'compact']
const SOLVE_SUFFIX = '-solve'

/** `single-solve` → generate.ts mode `single` with --solve-first. The directory is named after the whole mode name. */
export function splitMode(name: string): { mode: string; solveFirst: boolean } {
  const solveFirst = name.endsWith(SOLVE_SUFFIX)
  return { mode: solveFirst ? name.slice(0, -SOLVE_SUFFIX.length) : name, solveFirst }
}
// Same defaults as generate.ts.
const DEFAULT_ROUNDS = 3
const DEFAULT_JOBS = 3

/** A bad command line: the CLI exits 2 and no result directory is touched. */
export class UsageError extends Error {}

export interface StandardProblem {
  id: string
  why: string
}
export interface Standard {
  version: number
  problems: StandardProblem[]
}

export function loadStandard(file = standardFile): Standard {
  const doc = YAML.parse(readFileSync(file, 'utf8')) as { version?: unknown; problems?: { id?: unknown; why?: unknown }[] } | null
  if (typeof doc?.version !== 'number' || !Array.isArray(doc.problems)) throw new Error(`${relative(root, file)} 格式不对：需要 version 和 problems`)
  const problems = doc.problems.map((p) => ({ id: String(p.id), why: String(p.why ?? '') }))
  const seen = new Set<string>()
  for (const p of problems) {
    if (seen.has(p.id)) throw new Error(`${relative(root, file)} 里题目 ${p.id} 重复`)
    seen.add(p.id)
  }
  return { version: doc.version, problems }
}

export interface RunOptions {
  engine: string
  model?: string
  modes: string[]
  rounds: number
  jobs: number
  effort?: string
  label?: string
  /** Other generate.ts flags, in order, passed through unchanged. */
  passthrough: string[]
}

const VALUE_FLAGS = new Set(['--engine', '--model', '--modes', '--rounds', '--jobs', '--effort', '--label'])
// --out and --mode are set per mode by run (--solve-first comes from a -solve mode name); --blind is always on.
const NOT_PASSTHROUGH = new Set(['--out', '--mode', '--solve-first'])

const positiveInt = (raw: string | undefined, fallback: number, flag: string): number => {
  if (raw === undefined) return fallback
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1) throw new UsageError(`${flag} 要是正整数，收到 ${raw}`)
  return n
}

export function parseRunArgs(argv: string[]): RunOptions {
  const values = new Map<string, string>()
  const passthrough: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) throw new UsageError(`run 不接受位置参数「${a}」：题目固定在 evals/standard.yaml 里`)
    if (a === '--blind') continue
    const next = argv[i + 1]
    const hasValue = next !== undefined && next !== '' && !next.startsWith('--')
    if (VALUE_FLAGS.has(a)) {
      if (!hasValue) throw new UsageError(`${a} 后面要跟一个值`)
      if (values.has(a)) throw new UsageError(`${a} 只能给一次`)
      values.set(a, next)
      i++
      continue
    }
    if (NOT_PASSTHROUGH.has(a)) throw new UsageError(`${a} 由 run 自己决定，不能传`)
    if (hasValue) {
      passthrough.push(a, next)
      i++
    } else passthrough.push(a)
  }

  const engine = values.get('--engine')
  if (engine === undefined) throw new UsageError(`缺少 --engine（${ENGINES.join('、')} 之一）`)
  if (!ENGINES.includes(engine)) throw new UsageError(`--engine 只能是 ${ENGINES.join('、')}，收到 ${engine}`)

  // codex only runs full (generate.ts), so its default is that one mode.
  const modes = (values.get('--modes') ?? (engine === 'codex' ? 'full' : DEFAULT_MODES.join(','))).split(',').map((m) => m.trim())
  for (const m of modes) {
    const { mode, solveFirst } = splitMode(m)
    if (!MODES.includes(mode) || (solveFirst && mode === 'agent')) {
      throw new UsageError(`--modes 里的 ${m} 不认识（可用：full、single、compact，可加 -solve 后缀；agent 不能加）`)
    }
  }
  if (new Set(modes).size !== modes.length) throw new UsageError(`--modes 里有重复的模式：${modes.join(',')}`)
  if (engine === 'codex' && modes.some((m) => splitMode(m).mode !== 'full')) throw new UsageError('codex 只支持 full 模式（generate.ts 的限制）')

  const label = values.get('--label')
  if (label !== undefined && /[\\/\s]/.test(label)) throw new UsageError('--label 不能含空格或斜杠')

  return {
    engine,
    model: values.get('--model'),
    modes,
    rounds: positiveInt(values.get('--rounds'), DEFAULT_ROUNDS, '--rounds'),
    jobs: positiveInt(values.get('--jobs'), DEFAULT_JOBS, '--jobs'),
    effort: values.get('--effort'),
    label,
    passthrough,
  }
}

/** Directory label: the given one, or engine-model (a slash in a model name becomes a dash). */
export function runLabel(opts: Pick<RunOptions, 'engine' | 'model' | 'label'>): string {
  return opts.label ?? `${opts.engine}-${(opts.model ?? 'default').replace(/[\\/\s]+/g, '-')}`
}

export const runDirName = (date: string, label: string) => `${date}-${label}`

/** The generate.ts command one mode runs. `out` is relative to the repository root, as generate.ts reads it. */
export function generateCommand(o: {
  ids: string[]
  engine: string
  model?: string
  mode: string
  rounds: number
  jobs: number
  effort?: string
  out: string
  passthrough?: string[]
  /** Set for a -solve mode: adds --solve-first. */
  solveFirst?: boolean
}): { cmd: string; args: string[] } {
  const args = ['tsx', 'scripts/generate.ts', ...o.ids, '--engine', o.engine]
  if (o.model) args.push('--model', o.model)
  args.push('--mode', o.mode, '--blind', '--out', o.out, '--rounds', String(o.rounds), '--jobs', String(o.jobs))
  if (o.solveFirst) args.push('--solve-first')
  if (o.effort) args.push('--effort', o.effort)
  args.push(...(o.passthrough ?? []))
  return { cmd: 'npx', args }
}

export function localDate(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export interface RunMeta {
  date: string
  label: string
  engine: string
  model: string | null
  modes: string[]
  rounds: number
  jobs: number
  effort: string | null
  passthrough: string[]
  version: number
  ids: string[]
  commit: string | null
  /** Uncommitted changes outside evals/runs/ when the run started: results may not match the commit. */
  dirty?: boolean
  startedAt: string
  finishedAt: string | null
  failedMode?: string
}

function gitDirty(): boolean | undefined {
  try {
    const out = execFileSync('git', ['status', '--porcelain', '--', '.', ':!evals/runs'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    return out.trim() !== ''
  } catch {
    return undefined
  }
}

function gitCommit(): string | null {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null
  } catch {
    return null
  }
}

// ---------- report ----------

/** Full before -solve, and each -solve mode right after its plain mode; unknown names last. */
function modeRank(name: string): number {
  const { mode, solveFirst } = splitMode(name)
  const i = MODES.indexOf(mode)
  return i < 0 ? MODES.length * 2 : i * 2 + (solveFirst ? 1 : 0)
}

/** Round-1 prompt size per problem, from the `<id> 第 1 次提示词 N 字节` lines generate.ts writes. */
export function parsePromptBytes(log: string): Map<string, number> {
  const out = new Map<string, number>()
  for (const line of log.split('\n')) {
    const m = line.match(/^\S+ (\S+) 第 1 次提示词 (\d+) 字节/)
    if (m) out.set(m[1], Number(m[2]))
  }
  return out
}

/** Attempt numbers per problem, from `<id>-<n>.md` (patch replies and logs are not attempts). */
function attemptsByProblem(attemptsDir: string): Map<string, number[]> {
  const byId = new Map<string, number[]>()
  if (!existsSync(attemptsDir)) return byId
  for (const f of readdirSync(attemptsDir)) {
    const m = f.match(/^(.+)-(\d+)\.md$/)
    // <id>-solve-<n>.md is a solve reply (--solve-first), not a lesson attempt.
    if (m && !m[1].endsWith('-solve')) byId.set(m[1], [...(byId.get(m[1]) ?? []), Number(m[2])].sort((a, b) => a - b))
  }
  return byId
}

export interface ProblemOutcome {
  id: string
  /** Attempt files on disk. 0 when the model never produced a lesson for this problem. */
  attempts: number
  /** Round of the first attempt with no validator errors. */
  passAt?: number
  /** The last attempt against the answer key; null when the key cannot be checked automatically. */
  answerOk: boolean | null
  /** Key entries that need a person to compare (not counted in answerOk). */
  manual: string[]
  /** Rounds used: passAt, or the run's round limit when it never passed. */
  rounds: number
}

export interface ModeSummary {
  mode: string
  problems: ProblemOutcome[]
  firstPass: number
  withinRounds: number
  answerOk: number
  avgRounds: number
  /** Average round-1 prompt bytes over the problems that logged one. */
  promptBytes?: number
  promptCount: number
  secs: number
  /** Dollars from generate.log; 0 when the engine does not log cost (codex). */
  cost: number
  /** Every validator error code in every attempt, most frequent first. */
  codes: { code: string; count: number; example: string }[]
}

export function summarizeMode(modeDir: string, mode: string, ids: string[], rounds: number): ModeSummary {
  const attemptsDir = join(modeDir, '.attempts')
  const byId = attemptsByProblem(attemptsDir)
  const logFile = join(modeDir, 'generate.log')
  const logText = existsSync(logFile) ? readFileSync(logFile, 'utf8') : ''
  const timing = parseTiming(logText)
  const promptBytes = parsePromptBytes(logText)

  const errorsOf = new Map<string, number>()
  const codeCount = new Map<string, { count: number; example: string }>()
  for (const [id, ns] of byId) {
    for (const n of ns) {
      const v = validateFile(join(attemptsDir, `${id}-${n}.md`))
      errorsOf.set(`${id}-${n}`, v.errors.length)
      for (const e of v.errors) {
        const code = e.code ?? '(无 code)'
        const c = codeCount.get(code) ?? { count: 0, example: e.message }
        c.count++
        codeCount.set(code, c)
      }
    }
  }

  const problems: ProblemOutcome[] = ids.map((id) => {
    const ns = byId.get(id) ?? []
    const passAt = ns.find((n) => errorsOf.get(`${id}-${n}`) === 0)
    const last = ns[ns.length - 1]
    let answerOk: boolean | null = null
    let manual: string[] = []
    if (last !== undefined) {
      const key = checkAnswerKey(id, readFileSync(join(attemptsDir, `${id}-${last}.md`), 'utf8'))
      answerOk = key.checked ? key.missing.length === 0 : null
      manual = key.manual
    }
    return { id, attempts: ns.length, passAt, answerOk, manual, rounds: passAt ?? rounds }
  })

  const sizes = ids.map((id) => promptBytes.get(id)).filter((b): b is number => b !== undefined)
  const n = problems.length || 1
  return {
    mode,
    problems,
    firstPass: problems.filter((p) => p.passAt === 1).length,
    withinRounds: problems.filter((p) => p.passAt !== undefined && p.passAt <= rounds).length,
    answerOk: problems.filter((p) => p.answerOk === true).length,
    avgRounds: problems.reduce((s, p) => s + p.rounds, 0) / n,
    promptBytes: sizes.length ? sizes.reduce((s, b) => s + b, 0) / sizes.length : undefined,
    promptCount: sizes.length,
    secs: [...timing.values()].reduce((s, t) => s + t.secs, 0),
    cost: [...timing.values()].reduce((s, t) => s + t.cost, 0),
    codes: [...codeCount]
      .map(([code, c]) => ({ code, ...c }))
      .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code)),
  }
}

const pct = (k: number, d: number) => (d ? `${k}/${d}（${Math.round((100 * k) / d)}%）` : '0/0')
const fmtCost = (c: number) => (c > 0 ? `$${c.toFixed(2)}` : '—')

/** The 模式对比 table. */
export function renderTotals(summaries: ModeSummary[], ids: string[], rounds: number): string {
  const n = ids.length
  const lines = [
    `| 模式 | 题数 | 首轮通过 | ${rounds}轮内通过 | 答案正确 | 平均轮次 | 提示词（第 1 轮，字节均值） | 耗时（分钟） | 花费 | 最常见报错（前 3） |`,
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|---|',
  ]
  for (const s of summaries) {
    const size = s.promptBytes === undefined ? '—' : `${Math.round(s.promptBytes)}${s.promptCount < n ? `（${s.promptCount}/${n} 题）` : ''}`
    const top = s.codes.slice(0, 3).map((c) => `${c.code} ${c.count}`).join('，') || '无'
    lines.push(
      `| ${s.mode} | ${n} | ${pct(s.firstPass, n)} | ${pct(s.withinRounds, n)} | ${pct(s.answerOk, n)} | ${s.avgRounds.toFixed(2)} | ${size} | ${(s.secs / 60).toFixed(1)} | ${fmtCost(s.cost)} | ${top} |`,
    )
  }
  return lines.join('\n')
}

function renderReportText(o: {
  dir: string
  meta?: RunMeta
  std: Standard
  ids: string[]
  rounds: number
  summaries: ModeSummary[]
  missing: string[]
}): string {
  const { meta, ids, rounds, summaries } = o
  const modes = summaries.map((s) => s.mode)
  const out: string[] = [`# 标准评测报告：${basename(o.dir)}`, '']
  if (meta) {
    out.push(
      `- 日期 ${meta.date}；标签 ${meta.label}；engine ${meta.engine}，model ${meta.model ?? '（默认）'}，effort ${meta.effort ?? '（默认）'}`,
      `- 模式 ${meta.modes.join('、')}；每题最多 ${meta.rounds} 轮；并行 ${meta.jobs}；全部 --blind（答案键只记录不反馈）`,
      `- 题单 version ${meta.version}，${meta.ids.length} 题；git 提交 ${meta.commit ?? '未知'}${meta.dirty ? '（运行时有未提交的改动）' : ''}；开始 ${meta.startedAt}，结束 ${meta.finishedAt ?? '未完成'}`,
    )
    if (meta.passthrough.length) out.push(`- 透传的 generate.ts 参数：${meta.passthrough.join(' ')}`)
    if (meta.ids.join() !== o.std.problems.map((p) => p.id).join()) out.push('- 注意：run.json 里的题单与现在的 evals/standard.yaml 不一样，新旧结果不能直接比')
    if (meta.failedMode) out.push(`- 注意：模式 ${meta.failedMode} 中途失败，后面的模式没跑，结果不完整`)
  } else {
    out.push('- 没有 run.json（不是 run 生成的目录），题单按现在的 evals/standard.yaml 算')
  }
  if (o.missing.length) out.push(`- 注意：没有结果的模式：${o.missing.join('、')}`)
  const withManual = summaries.flatMap((s) => s.problems.filter((p) => p.manual.length).map((p) => `${p.id}（${s.mode}）`))
  if (withManual.length) out.push(`- 有需人工核对的答案项（不计入「答案正确」）：${[...new Set(withManual)].join('、')}`)
  out.push(
    '',
    '定义：首轮通过＝第 1 次课件校验错误为 0；N 轮内通过＝某次尝试校验错误为 0 且次数不超过 N；答案正确＝最后一次课件过答案键（只核对能自动核对的数值和选项）；',
    `平均轮次＝每题通过时的轮次，没通过的按 ${rounds} 计；提示词大小＝第 1 轮发给模型的字节数；耗时、花费＝generate.log 里各次尝试加总（codex 不记录花费，显示 —）。`,
    '',
    '## 模式对比',
    '',
    renderTotals(summaries, ids, rounds),
    '',
    '## 每题',
    '',
    '单元格：第几轮通过；✗ 为没有通过（包括模型没交出课件）；「答案✗」为最后一次课件答案不对。',
    '',
  )
  const cell = (p: ProblemOutcome | undefined) => {
    if (!p) return '—'
    if (p.attempts === 0) return '✗'
    const head = p.passAt !== undefined ? String(p.passAt) : '✗'
    return p.answerOk === false ? `${head} 答案✗` : head
  }
  const why = new Map(o.std.problems.map((p) => [p.id, p.why]))
  out.push(`| 题目 | 说明 | ${modes.join(' | ')} |`, `|---|---|${modes.map(() => '---:').join('|')}|`)
  for (const id of ids) {
    const cells = summaries.map((s) => cell(s.problems.find((p) => p.id === id)))
    out.push(`| ${id} | ${why.get(id) ?? ''} | ${cells.join(' | ')} |`)
  }
  out.push('', '## 报错 code（每个模式最常见的 5 个）', '', `| 排名 | ${modes.join(' | ')} |`, `|---:|${modes.map(() => '---').join('|')}|`)
  for (let rank = 0; rank < 5; rank++) {
    const cells = summaries.map((s) => (s.codes[rank] ? `${s.codes[rank].code} ${s.codes[rank].count}` : '—'))
    out.push(`| ${rank + 1} | ${cells.join(' | ')} |`)
  }
  out.push('')
  return out.join('\n')
}

function readMeta(dir: string): RunMeta | undefined {
  const file = join(dir, 'run.json')
  return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as RunMeta) : undefined
}

/** Summarises a run directory and writes <dir>/report.md. */
export function reportRun(dir: string, std: Standard = loadStandard()): { file: string; text: string; table: string } {
  const meta = readMeta(dir)
  const ids = meta?.ids ?? std.problems.map((p) => p.id)
  const rounds = meta?.rounds ?? DEFAULT_ROUNDS
  const modes =
    meta?.modes ??
    readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, '.attempts')))
      .map((d) => d.name)
      .sort((a, b) => modeRank(a) - modeRank(b))
  const summaries: ModeSummary[] = []
  const missing: string[] = []
  for (const mode of modes) {
    const modeDir = join(dir, mode)
    if (existsSync(join(modeDir, '.attempts'))) summaries.push(summarizeMode(modeDir, mode, ids, rounds))
    else missing.push(mode)
  }
  const text = renderReportText({ dir, meta, std, ids, rounds, summaries, missing })
  const file = join(dir, 'report.md')
  writeFileSync(file, text)
  return { file, text, table: renderTotals(summaries, ids, rounds) }
}

// ---------- run ----------

function runChild(cmd: string, args: string[]): Promise<number> {
  return new Promise((finish, fail) => {
    const child = spawn(cmd, args, { cwd: appDir, stdio: 'inherit' })
    child.on('error', fail)
    child.on('close', (code, signal) => finish(code ?? (signal ? 1 : 0)))
  })
}

async function runCommand(argv: string[]): Promise<number> {
  const opts = parseRunArgs(argv)
  const std = loadStandard()
  const ids = std.problems.map((p) => p.id)
  const date = localDate()
  const label = runLabel(opts)
  const dir = join(runsDir, runDirName(date, label))
  if (existsSync(dir)) throw new UsageError(`${relative(root, dir)} 已存在，不覆盖旧结果：换一个 --label，或先把旧目录挪走`)
  mkdirSync(dir, { recursive: true })

  const rounds = opts.rounds
  const meta: RunMeta = {
    date,
    label,
    engine: opts.engine,
    model: opts.model ?? null,
    modes: opts.modes,
    rounds,
    jobs: opts.jobs,
    effort: opts.effort ?? null,
    passthrough: opts.passthrough,
    version: std.version,
    ids,
    commit: gitCommit(),
    dirty: gitDirty(),
    startedAt: new Date().toISOString(),
    finishedAt: null,
  }
  const writeMeta = () => writeFileSync(join(dir, 'run.json'), JSON.stringify(meta, null, 2) + '\n')
  writeMeta()

  let code = 0
  for (const mode of opts.modes) {
    const { mode: genMode, solveFirst } = splitMode(mode)
    const { cmd, args } = generateCommand({
      ids,
      engine: opts.engine,
      model: opts.model,
      mode: genMode,
      rounds,
      jobs: opts.jobs,
      effort: opts.effort,
      out: relative(root, join(dir, mode)),
      passthrough: opts.passthrough,
      solveFirst,
    })
    console.log(`\n=== 模式 ${mode}：${cmd} ${args.join(' ')}`)
    const status = await runChild(cmd, args)
    if (status !== 0) {
      meta.failedMode = mode
      code = 1
      console.error(`模式 ${mode} 退出码 ${status}，后面的模式不跑了`)
      break
    }
  }
  meta.finishedAt = new Date().toISOString()
  writeMeta()

  const r = reportRun(dir, std)
  console.log(`\n${r.table}\n\n报告：${r.file}`)
  return code
}

async function cli(argv: string[]): Promise<number> {
  const [cmd, ...rest] = argv
  if (cmd === 'run') return runCommand(rest)
  if (cmd === 'report') {
    if (rest.length !== 1) throw new UsageError('用法：report <结果根目录>')
    const dir = existsSync(resolve(process.cwd(), rest[0])) ? resolve(process.cwd(), rest[0]) : resolve(root, rest[0])
    if (!existsSync(dir)) throw new UsageError(`没有 ${rest[0]}`)
    const r = reportRun(dir)
    console.log(`${r.table}\n\n报告：${r.file}`)
    return 0
  }
  throw new UsageError('用法：\n  eval-standard.ts run --engine E [--model M] [--modes full,single,compact] [--rounds 3] [--jobs 3] [--effort X] [--label L] [其它 generate.ts 参数]\n  eval-standard.ts report <结果根目录>\n  模式名可加 -solve 后缀（如 single-solve），表示先解题再写课件')
}

const isMain = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isMain) {
  cli(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (e: unknown) => {
      console.error(e instanceof Error ? e.message : String(e))
      process.exit(e instanceof UsageError ? 2 : 1)
    },
  )
}
