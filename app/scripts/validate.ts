// Validates lesson files: structure, expressions, answers, and a smoke run of every <Sim>
// at the initial state and at each <Preset>. Exit code 1 when any file has errors.
// Usage: npx tsx scripts/validate.ts <file.md>... [--json]
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildRuntime } from '../src/sim/buildRuntime'
import { num } from '../src/lesson/expr'
import { motionPayload } from '../src/lesson/motion'
import { opticsPayload } from '../src/lesson/optics'
import { parseLesson, type Block } from '../src/lesson/parse'
import { checkSim } from '../src/lesson/simcheck'
import { buildRegistry, ParamStore } from '../src/lesson/store'
import { eventNames, validateLesson, type Issue } from '../src/lesson/validate'

const runtime = buildRuntime()

type Comp = Extract<Block, { kind: 'component' }>

/** Same checks as a lesson file: structure, then a smoke run of every <Sim> and <Figure>. */
export function validateSource(source: string, file = '<memory>') {
  const result = validateLesson(source)
  const errors: Issue[] = [...result.errors]
  const warnings: Issue[] = [...result.warnings]

  if (errors.length === 0) {
    const lesson = parseLesson(source)
    const comps = lesson.blocks.filter((b): b is Comp => b.kind === 'component')
    const reg = buildRegistry(lesson.blocks)
    const states: { label: string; scope: Record<string, number> }[] = [
      { label: '初始状态', scope: new ParamStore(reg).getScope() },
    ]
    for (const p of comps.filter((b) => b.name === 'Preset')) {
      const store = new ParamStore(reg)
      const base = store.getScope()
      const set = Object.fromEntries(Object.entries((p.props.set ?? {}) as Record<string, unknown>).map(([k, v]) => [k, num(v, base)]))
      store.set(set)
      states.push({ label: `快捷按钮「${String(p.props.label)}」`, scope: store.getScope() })
    }
    for (const fig of comps.filter((b) => b.name === 'Figure')) {
      const names = (fig.props.params ?? []) as string[]
      const runs = states.map(({ label, scope }) => ({
        label,
        params: Object.fromEntries(names.map((n) => [n, opticsPayload(motionPayload(scope[n]))])),
        times: [0],
      }))
      const r = checkSim(fig.body ?? '', runtime, runs)
      for (const m of r.errors) errors.push({ line: fig.line, message: `<Figure> ${m}` })
    }
    for (const sim of comps.filter((b) => b.name === 'Sim')) {
      const names = (sim.props.params ?? []) as string[]
      const runs = states.map(({ label, scope }) => {
        const duration = Math.max(num(sim.props.duration, scope, 5), 0.001)
        const marks = ((sim.props.marks ?? []) as { t: unknown }[]).map((m) => num(m.t, scope, 0))
        const times = [...Array.from({ length: 25 }, (_, i) => (duration * i) / 24), ...marks].filter(
          (t) => Number.isFinite(t) && t >= 0 && t <= duration + 1e-9,
        )
        if (!Number.isFinite(duration)) errors.push({ line: sim.line, message: `<Sim> ${label}：duration 不是有限数` })
        return { label, params: Object.fromEntries(names.map((n) => [n, opticsPayload(motionPayload(scope[n]))])), times }
      })
      const r = checkSim(sim.body ?? '', runtime, runs)
      for (const m of r.errors) errors.push({ line: sim.line, message: `<Sim> ${m}` })
      for (const m of r.warnings) warnings.push({ line: sim.line, message: `<Sim> ${m}` })
    }
    const events = eventNames(lesson.blocks)
    for (const s of states.slice(1)) {
      for (const [k, v] of Object.entries(s.scope)) {
        if (typeof v === 'number' && !Number.isFinite(v) && !events.has(k)) warnings.push({ message: `${s.label}下 ${k} = ${v}` })
      }
    }
  }
  return { file, errors, warnings }
}

export function validateFile(file: string) {
  return validateSource(readFileSync(file, 'utf8'), file)
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isMain) {
  // Dynamic import, not a static one: core.ts imports this module.
  import('../src/agent/core')
    .then(({ formatValidation, pointerFor }) => {
      const args = process.argv.slice(2)
      const json = args.includes('--json')
      const files = args.filter((a) => !a.startsWith('--'))
      const results = files.map(validateFile)
      const pointed = results.map((r) => ({
        ...r,
        errors: r.errors.map((e) => ({ ...e, doc: pointerFor(e.message).doc })),
        warnings: r.warnings.map((w) => ({ ...w, doc: pointerFor(w.message).doc })),
      }))
      if (json) console.log(JSON.stringify(pointed, null, 2))
      else {
        for (const r of pointed) console.log(formatValidation(basename(r.file), r))
      }
      process.exit(results.some((r) => r.errors.length) ? 1 : 0)
    })
    .catch((e) => {
      console.error(e instanceof Error ? e.message : String(e))
      process.exit(1)
    })
}
