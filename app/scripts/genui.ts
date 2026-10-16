// CLI for coding agents. Same core as the function-calling tools.
// Exit 0: ok. Exit 1: the lesson has errors (or layout/render reported problems). Exit 2: usage.
import { readFileSync, writeFileSync } from 'node:fs'
import { basename, isAbsolute, join, resolve } from 'node:path'
import { checkLayout, formatLayoutReport } from '../src/agent/layout'
import { renderLesson } from '../src/agent/render'
import {
  formatValidation,
  getDoc,
  listDocs,
  searchDocs,
  validateLesson,
  type DocError,
  type DocText,
} from '../src/agent/core'
import { repoRoot } from '../src/docs/index'
import { applyPatch, formatKeys } from '../src/lesson/patch'

function usage(): never {
  console.error(`用法：
  genui docs [id]              不写 id 时打印入口（L0）
  genui docs --list
  genui docs --search <词>
  genui validate <课件.md> [--json]
  genui layout <课件.md> [--json]
  genui shot <课件.md> [--out 目录]
  genui patch <课件.md> <补丁.md> [--dry]   补丁只写要改的块，按名字合并进课件
  genui patch <课件.md> --keys              列出可以在补丁里引用的块名`)
  process.exit(2)
}

function isDocError(doc: DocText | DocError): doc is DocError {
  return 'error' in doc
}

function lessonPath(file: string): string {
  // Relative paths try the caller's cwd first, then the repo root, so the CLI works from any directory.
  const candidates = isAbsolute(file) ? [file] : [resolve(process.cwd(), file), resolve(repoRoot, file)]
  for (const path of candidates) {
    try {
      readFileSync(path, 'utf8')
      return path
    } catch {
      // try the next candidate
    }
  }
  console.error(`找不到文件：${file}`)
  process.exit(2)
}

function readLesson(file: string): string {
  return readFileSync(lessonPath(file), 'utf8')
}

function flag(args: string[], name: string): boolean {
  return args.includes(name)
}

function option(args: string[], name: string): { value?: string; rest: string[] } | { error: string } {
  const i = args.indexOf(name)
  if (i < 0) return { rest: args }
  const value = args[i + 1]
  if (value === undefined || value.startsWith('--')) return { error: `${name} 后面要跟参数` }
  return { value, rest: [...args.slice(0, i), ...args.slice(i + 2)] }
}

async function docs(args: string[]) {
  if (flag(args, '--list')) {
    if (args.length !== 1) usage()
    console.log('id\t层\t标题\t字节')
    for (const d of listDocs()) console.log(`${d.id}\t${d.layer}\t${d.title}\t${d.bytes}`)
    return
  }
  const search = option(args, '--search')
  if ('error' in search) {
    console.error(search.error)
    usage()
  }
  if (search.value !== undefined) {
    if (search.rest.some((a) => a.startsWith('--'))) usage()
    const query = [search.value, ...search.rest].join(' ').trim()
    if (!query) usage()
    const hits = searchDocs(query)
    if (!hits.length) {
      console.log('没有匹配。')
      return
    }
    for (const h of hits) {
      console.log(`${h.id}\t${h.layer}\t${h.title}`)
      for (const line of h.snippet.split('\n')) console.log(`  ${line}`)
    }
    return
  }
  if (args.length > 1) usage()
  const doc = getDoc(args[0] ?? 'index')
  if (isDocError(doc)) {
    console.error(doc.error)
    process.exit(1)
  }
  process.stdout.write(doc.text.endsWith('\n') ? doc.text : doc.text + '\n')
}

async function validate(args: string[]) {
  const json = flag(args, '--json')
  const files = args.filter((a) => a !== '--json')
  if (files.length !== 1) usage()
  const source = readLesson(files[0])
  const report = validateLesson(source)
  if (json) {
    console.log(JSON.stringify({ file: files[0], ...report }, null, 2))
  } else {
    console.log(formatValidation(basename(files[0]), report))
  }
  process.exit(report.ok ? 0 : 1)
}

async function patch(args: string[]) {
  const dry = flag(args, '--dry')
  const keysOnly = flag(args, '--keys')
  const files = args.filter((a) => a !== '--dry' && a !== '--keys')
  if (keysOnly) {
    if (files.length !== 1 || dry) usage()
    console.log(formatKeys(readLesson(files[0])))
    return
  }
  if (files.length !== 2) usage()
  const [lessonFile, patchFile] = files
  const path = lessonPath(lessonFile)
  const result = applyPatch(readLesson(lessonFile), readLesson(patchFile))
  if (!result.ok) {
    for (const e of result.errors) console.error(`- ${e}`)
    console.error(`补丁没有应用（${result.errors.length} 个错误），课件没有改动。`)
    process.exit(1)
  }
  // With --dry the lesson goes to stdout and the report to stderr, so stdout stays a clean lesson.
  const report = dry ? console.error : console.log
  if (dry) process.stdout.write(result.text.endsWith('\n') ? result.text : result.text + '\n')
  else writeFileSync(path, result.text)
  report(`${dry ? '预览，未写入' : '已写入'} ${basename(path)}，应用 ${result.applied.length} 处修改：`)
  for (const a of result.applied) report(`- ${a}`)
  const validation = validateLesson(result.text)
  report(formatValidation(basename(path), validation))
  process.exit(validation.ok ? 0 : 1)
}

async function layout(args: string[]) {
  const json = flag(args, '--json')
  const files = args.filter((a) => a !== '--json')
  if (files.length !== 1) usage()
  const source = readLesson(files[0])
  let report
  try {
    report = await checkLayout(source)
  } catch (e) {
    console.error(`排版检查失败：${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  }
  if (json) console.log(JSON.stringify(report, null, 2))
  else {
    try {
      console.log(formatLayoutReport(report))
    } catch (e) {
      console.error(`排版检查失败：${e instanceof Error ? e.message : String(e)}`)
      process.exit(1)
    }
  }
  process.exit(report.ok ? 0 : 1)
}

async function shot(args: string[]) {
  const out = option(args, '--out')
  if ('error' in out) {
    console.error(out.error)
    usage()
  }
  if (out.rest.length !== 1) usage()
  const file = out.rest[0]
  const source = readLesson(file)
  const outDir = out.value ? resolve(process.cwd(), out.value) : join(process.cwd(), 'genui-shots', basename(file, '.md'))
  let result
  try {
    result = await renderLesson(source, { outDir })
  } catch (e) {
    console.error(`截图失败：${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  }
  console.log(`截图目录：${outDir}`)
  console.log(result.files.length ? `写出 ${result.files.length} 个文件：` : '没有写出文件。')
  for (const f of result.files) console.log(`- ${f}`)
  if (result.consoleErrors.length) {
    console.log(`控制台错误 ${result.consoleErrors.length} 条：`)
    for (const e of result.consoleErrors) console.log(`- ${e}`)
    process.exit(1)
  }
  console.log('控制台错误：无')
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2)
  if (!cmd || cmd === '--help' || cmd === '-h') usage()
  if (cmd === 'docs') return docs(args)
  if (cmd === 'validate') return validate(args)
  if (cmd === 'layout') return layout(args)
  if (cmd === 'shot') return shot(args)
  if (cmd === 'patch') return patch(args)
  console.error(`未知命令：${cmd}`)
  usage()
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
