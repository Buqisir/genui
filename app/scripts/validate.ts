// Validates lesson files: structure, expressions, answers, and a smoke run of every <Sim>
// at the initial state and at each <Preset>. Every <Figure> also runs at each <Variant>, and
// its arrows with `of` are checked across those states (checkArrows). Exit code 1 when any file has errors.
// Usage: npx tsx scripts/validate.ts <file.md>... [--json]
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildRuntime } from '../src/sim/buildRuntime'
import { evaluate, num, symbolsOf, type Scope } from '../src/lesson/expr'
import { motionPayload } from '../src/lesson/motion'
import { opticsPayload } from '../src/lesson/optics'
import { parseLesson, type Block } from '../src/lesson/parse'
import { checkSim, type ArrowRecord, type SimCheckResult } from '../src/lesson/simcheck'
import { buildRegistry, ParamStore } from '../src/lesson/store'
import { eventNames, validateLesson, type Issue } from '../src/lesson/validate'

const runtime = buildRuntime()

type Comp = Extract<Block, { kind: 'component' }>
type State = { label: string; scope: Record<string, number> }

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
    // Figures also run in each Variant (numeric set values on the initial state), so their arrows
    // are checked where the situation changes. Sim does not: its runs stay as they were.
    const figStates: State[] = [...states]
    for (const v of comps.filter((b) => b.name === 'Variant')) {
      const patch = Object.fromEntries(
        Object.entries((v.props.set ?? {}) as Record<string, unknown>).filter(([, x]) => typeof x === 'number' && Number.isFinite(x)),
      ) as Record<string, number>
      const store = new ParamStore(reg)
      store.set(patch)
      figStates.push({ label: `变式「${String(v.props.label)}」`, scope: store.getScope() })
    }
    for (const fig of comps.filter((b) => b.name === 'Figure')) {
      const names = (fig.props.params ?? []) as string[]
      const runs = figStates.map(({ label, scope }) => ({
        label,
        params: Object.fromEntries(names.map((n) => [n, opticsPayload(motionPayload(scope[n]))])),
        times: [0],
      }))
      const r = checkSim(fig.body ?? '', runtime, runs)
      for (const m of r.errors) errors.push({ line: fig.line, code: 'eval-failed', message: `<Figure> ${m}` })
      // Arrows are only compared when every run finished: a crashed run draws a partial picture.
      if (r.errors.length === 0) {
        const arrows = checkArrows(fig.line, figStates, r.arrows)
        errors.push(...arrows.errors)
        warnings.push(...arrows.warnings)
      }
    }
    for (const sim of comps.filter((b) => b.name === 'Sim')) {
      const names = (sim.props.params ?? []) as string[]
      const runs = states.map(({ label, scope }) => {
        const duration = Math.max(num(sim.props.duration, scope, 5), 0.001)
        const marks = ((sim.props.marks ?? []) as { t: unknown }[]).map((m) => num(m.t, scope, 0))
        const times = [...Array.from({ length: 25 }, (_, i) => (duration * i) / 24), ...marks].filter(
          (t) => Number.isFinite(t) && t >= 0 && t <= duration + 1e-9,
        )
        if (!Number.isFinite(duration)) errors.push({ line: sim.line, code: 'eval-failed', message: `<Sim> ${label}：duration 不是有限数` })
        return { label, params: Object.fromEntries(names.map((n) => [n, opticsPayload(motionPayload(scope[n]))])), times }
      })
      const r = checkSim(sim.body ?? '', runtime, runs)
      for (const m of r.errors) errors.push({ line: sim.line, code: 'eval-failed', message: `<Sim> ${m}` })
      for (const m of r.warnings) warnings.push({ line: sim.line, code: 'component-warning', message: `<Sim> ${m}` })
    }
    const events = eventNames(lesson.blocks)
    for (const s of states.slice(1)) {
      for (const [k, v] of Object.entries(s.scope)) {
        if (typeof v === 'number' && !Number.isFinite(v) && !events.has(k)) warnings.push({ code: 'not-finite', message: `${s.label}下 ${k} = ${v}` })
      }
    }
  }
  return { file, errors, warnings }
}

const fmtQ = (x: number) => (x < 0 ? '−' : '+') + String(Number(Math.abs(x).toPrecision(3)))

/** Why an arrow's `of` cannot be evaluated, or null when it can. Names are checked against the scope. */
function arrowExprProblem(of: string, scope: Scope): { code: 'undeclared-name' | 'bad-expr'; text: string } | null {
  let names: string[]
  try {
    names = symbolsOf(of)
  } catch (e) {
    return { code: 'bad-expr', text: `表达式无法解析：${of}（${(e as Error).message}）` }
  }
  const missing = names.filter((n) => !Object.prototype.hasOwnProperty.call(scope, n))
  if (missing.length) return { code: 'undeclared-name', text: `引用了未声明的名字 ${missing.join('、')}：${of}` }
  try {
    evaluate(of, scope)
  } catch (e) {
    return { code: 'bad-expr', text: `表达式求值失败：${of}（${(e as Error).message}）` }
  }
  return null
}

/**
 * Arrows drawn with `of` must agree with their quantity across states. The k-th arrow with a given
 * `of` in each state is one arrow. With q the quantity and len the arrow's world length:
 *  - q is zero (|q| <= tol) but the arrow is drawn: error arrow-zero;
 *  - against the first state where q is nonzero, an arrow that is (anti)parallel must point the
 *    same way when q keeps its sign and the opposite way when it flips: error arrow-direction;
 *  - length per unit of q must match that reference within 10%: warning arrow-scale.
 * A state where the arrow is not drawn is skipped. `tol` is 1e-9 plus 1e-6 times the largest |q|.
 */
function checkArrows(line: number, states: State[], results: SimCheckResult['arrows']) {
  const errors: Issue[] = []
  const warnings: Issue[] = []
  type Sample = { label: string; q: number; dx: number; dy: number; len: number }
  const groups = new Map<string, { of: string; samples: Sample[] }>()
  const exprOk = new Map<string, boolean>()
  results.forEach((res, i) => {
    const seen = new Map<string, number>()
    for (const rec of res.list as ArrowRecord[]) {
      const k = seen.get(rec.of) ?? 0
      seen.set(rec.of, k + 1)
      if (!exprOk.has(rec.of)) {
        const problem = arrowExprProblem(rec.of, states[i].scope)
        if (problem) errors.push({ line, code: problem.code, message: `<Figure> 箭头「${rec.of}」${problem.text}` })
        exprOk.set(rec.of, !problem)
      }
      if (!exprOk.get(rec.of)) continue
      let q: number
      try {
        q = evaluate(rec.of, states[i].scope)
      } catch {
        continue
      }
      const key = `${rec.of}\u0000${k}`
      const g = groups.get(key) ?? { of: rec.of, samples: [] }
      g.samples.push({ label: res.label, q, dx: rec.dx, dy: rec.dy, len: Math.hypot(rec.dx, rec.dy) })
      groups.set(key, g)
    }
  })

  for (const { of, samples } of groups.values()) {
    const finite = samples.filter((s) => Number.isFinite(s.q) && Number.isFinite(s.len))
    const tol = 1e-9 + 1e-6 * Math.max(0, ...finite.map((s) => Math.abs(s.q)))
    const ref = finite.find((s) => Math.abs(s.q) > tol && s.len > 1e-9)
    for (const s of finite) {
      const at = `<Figure> 箭头「${of}」在「${s.label}」下`
      if (Math.abs(s.q) <= tol) {
        if (s.len > 1e-6) errors.push({ line, code: 'arrow-zero', message: `${at}：这个量为 0，箭头却画了出来` })
        continue
      }
      if (!ref || s === ref || s.len <= 1e-9) continue
      const dot = s.dx * ref.dx + s.dy * ref.dy
      const cos = dot / (s.len * ref.len)
      if (Math.abs(cos) > 0.9) {
        const sameSign = Math.sign(s.q) === Math.sign(ref.q)
        if (sameSign ? dot <= 0 : dot >= 0) {
          const why = sameSign
            ? `这个量仍是 ${fmtQ(s.q)}，箭头却反向了`
            : `这个量从 ${fmtQ(ref.q)} 变成 ${fmtQ(s.q)}，箭头却没有反向`
          errors.push({ line, code: 'arrow-direction', message: `${at}方向不对：${why}` })
        }
      }
      const perUnit = s.len / Math.abs(s.q)
      const refPerUnit = ref.len / Math.abs(ref.q)
      if (Math.abs(perUnit / refPerUnit - 1) > 0.1) {
        warnings.push({ line, code: 'arrow-scale', message: `${at}：箭头长度没有跟着这个量成比例变化（和「${ref.label}」比，每单位长度相差 ${Math.round(Math.abs(perUnit / refPerUnit - 1) * 100)}%）` })
      }
    }
  }
  return { errors, warnings }
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
