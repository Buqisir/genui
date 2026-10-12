import { buildRuntime } from '../sim/buildRuntime'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { evaluate, symbolsOf } from './expr'
import { parseLesson } from './parse'
import { checkSim } from './simcheck'
import { buildRegistry, ParamStore } from './store'
import { validateLesson } from './validate'
import { describeEnd } from '../components/Wiring'

describe('parseLesson', () => {
  it('splits markdown and block-level components', () => {
    const src = [
      '---',
      'id: demo',
      'title: 示例',
      '---',
      '正文 $x^2$',
      '',
      '<Param name="n" label="数量" value={4} min={1} max={40} step={1} />',
      '',
      '<Readout items={[',
      '  {label: "功率", expr: "400000*n/(n+16)^2", unit: "W"}',
      ']} />',
      '',
      '<Sim title="动画" duration={8}>',
      'sim({ at(t) { return { t } }, draw() {} })',
      '</Sim>',
      '尾部',
    ].join('\n')
    const lesson = parseLesson(src)
    expect(lesson.errors).toEqual([])
    expect(lesson.meta.title).toBe('示例')
    const kinds = lesson.blocks.map((b) => (b.kind === 'component' ? b.name : 'md'))
    expect(kinds).toEqual(['md', 'Param', 'Readout', 'Sim', 'md'])
    const sim = lesson.blocks[3]
    expect(sim.kind === 'component' && sim.body).toContain('sim({')
    const readout = lesson.blocks[2]
    expect(readout.kind === 'component' && readout.props.items).toHaveLength(1)
  })

  it('ignores tags inside code fences', () => {
    const lesson = parseLesson('```\n<Param name="x" />\n```\n')
    expect(lesson.blocks).toHaveLength(1)
    expect(lesson.blocks[0].kind).toBe('markdown')
  })

  it('reports malformed props', () => {
    const lesson = parseLesson('<Param name="x" value={oops} />\n')
    expect(lesson.errors[0].message).toMatch(/JSON5/)
  })

  it('reports missing closing tag', () => {
    const lesson = parseLesson('<Sim title="a">\nsim({})\n')
    expect(lesson.errors[0].message).toMatch(/<\/Sim>/)
  })
})

describe('expressions', () => {
  it('evaluates with scope and helpers', () => {
    expect(evaluate('max(10 - 2*t, 0)', { t: 6 })).toBe(0)
    expect(evaluate('t > 3 ? 1 : 2', { t: 4 })).toBe(1)
    expect(evaluate('clamp(x, 0, 1)', { x: 3 })).toBe(1)
    expect(evaluate('sin(deg(30))', {})).toBeCloseTo(0.5)
  })

  it('blocks instance-escaping functions', () => {
    expect(() => evaluate('import({}, {})', {})).toThrow()
    expect(() => evaluate('evaluate("1+1")', {})).toThrow()
  })

  it('lists free symbols but not functions', () => {
    expect(symbolsOf('max(vB0 - a*t, 0) + pi').sort()).toEqual(['a', 't', 'vB0'])
  })
})

describe('registry', () => {
  it('orders defines by dependency and detects cycles', () => {
    const lesson = parseLesson(
      ['<Define name="b" expr="a + 1" />', '', '<Define name="a" expr="x * 2" />', '', '<Param name="x" value={3} />'].join('\n'),
    )
    const reg = buildRegistry(lesson.blocks)
    expect(reg.errors).toEqual([])
    const store = new ParamStore(reg)
    expect(store.getScope().b).toBe(7)
    store.set({ x: 5 })
    expect(store.getScope().b).toBe(11)

    const cyc = buildRegistry(parseLesson('<Define name="p" expr="q" />\n\n<Define name="q" expr="p" />\n').blocks)
    expect(cyc.errors.some((e) => e.includes('循环引用'))).toBe(true)
  })

  it('publishes Wiring solver readings as names that Defines and answers can use', () => {
    const src = [
      '---',
      'id: t',
      'title: t',
      'question: q',
      'answers:',
      '  - { name: Rm, value: 5 }',
      '---',
      '',
      '<Param name="Rx" value={5} min={1} max={10} />',
      '',
      '<Define name="Rm" expr="U/I" />',
      '',
      '<Wiring parts={[',
      '  { id: "E", type: "battery", emf: 3, r: 1 },',
      '  { id: "A", type: "ammeter", read: "I" },',
      '  { id: "V", type: "voltmeter", read: "U" },',
      '  { id: "R", type: "resistor", R: "Rx" },',
      ']} wires={[',
      '  { from: "E.+", to: "A.0.6" }, { from: "A.-", to: "R.a" }, { from: "R.b", to: "E.-" },',
      '  { from: "V.3", to: "R.a" }, { from: "V.-", to: "R.b" },',
      ']} />',
      '',
    ].join('\n')
    const r = validateLesson(src)
    expect(r.errors).toEqual([])
    expect(r.scope?.I).toBeCloseTo(0.5, 5)
    expect(r.scope?.Rm).toBeCloseTo(5, 5)
    const store = new ParamStore(buildRegistry(parseLesson(src).blocks))
    store.set({ Rx: 2 })
    expect(store.getScope().I).toBeCloseTo(1, 5)
    expect(store.paramRoots(['Rm']).has('Rx')).toBe(true)

    const wrong = validateLesson(src.replace('value: 5 }', 'value: 6 }'))
    expect(wrong.errors.some((e) => e.message.includes('答案不一致'))).toBe(true)
    const noEmf = validateLesson(src.replace('emf: 3, ', ''))
    expect(noEmf.errors.some((e) => e.message.includes('read 需要电路能求解'))).toBe(true)
  })
})

describe('lessons/', () => {
  const dir = join(__dirname, '../../../lessons')
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    it(`${file} passes validation`, () => {
      const r = validateLesson(readFileSync(join(dir, file), 'utf8'))
      expect(r.errors).toEqual([])
    })
  }
})

describe('validateLesson', () => {
  const head = ['---', 'id: t', 'title: t', 'question: q', 'answers:', '  - { name: y, value: 6 }', '---', ''].join('\n')

  it('flags unknown props, undeclared names, wrong answers', () => {
    const src =
      head +
      [
        '<Param name="x" value={3} min={0} max={5} colour="red" />',
        '',
        '<Define name="y" expr="x * k" />',
        '',
        '<Readout items={[{label: "y", expr: "y", unit: "m"}]} />',
      ].join('\n')
    const msgs = validateLesson(src).errors.map((e) => e.message).join('\n')
    expect(msgs).toMatch(/未知属性 colour/)
    expect(msgs).toMatch(/未声明的名字 k/)
  })

  it('checks the new presentation components', () => {
    const ok =
      head +
      [
        '<Param name="x" value={2} min={0} max={5} symbol="x" color="velocity" control="stepper" />',
        '',
        '<Define name="y" expr="x * 3" />',
        '',
        '<Question text="求 y" set={{x: 2}} />',
        '',
        '<Answer items={[{label: "y", symbol: "y", expr: "y", value: 6}]} />',
        '',
        '<Bars x={{name: "n", min: 1, max: 6}} expr="n * x" cursor="x" marks={[{x: 2, label: "原", style: "outline"}]} />',
        '',
        '<Ledger parts={[{label: "甲", expr: "x", color: "force"}, {label: "乙", expr: "y", color: "field"}]} rows={[{label: "x=1", at: {x: 1}}, {label: "此刻"}]} />',
        '',
        '<Dial expr="y" min={0} max={15} arcs={[{from: 0, to: 6, color: "charge"}]} />',
        '',
        '<Plot x={{name: "t", min: 0, max: 5}} series={[{label: "v", expr: "x*t"}]} areas={[{series: 0, from: 0, until: "x"}]} />',
        '',
        '<Circuit source={{type: "battery"}} load={{type: "heater"}} flow={{expr: "x"}} hud={[{symbol: "I", expr: "x", unit: "A"}]} legend={[{kind: "charge", label: "电流"}]} />',
      ].join('\n')
    expect(validateLesson(ok).errors).toEqual([])

    const bad =
      head +
      [
        '<Param name="x" value={2} min={0} max={5} color="pink" format="money" />',
        '',
        '<Define name="y" expr="x * 3" />',
        '',
        '<Answer items={[{label: "y"}]} />',
        '',
        '<Plot x={{min: 0, max: 1}} series={[{label: "a", expr: "x"}]} areas={[{series: 3, from: 0, until: 1}]} size="huge" />',
        '',
        '<Circuit source={{type: "battery"}} load={{type: "heater"}} legend={[{kind: "glow", label: "?"}]} />',
      ].join('\n')
    const msgs = validateLesson(bad).errors.map((e) => e.message).join('\n')
    expect(msgs).toMatch(/颜色只能是物理量名/)
    expect(msgs).toMatch(/format 只能是/)
    expect(msgs).toMatch(/需要 expr、数字 value 或文字 text/)
    expect(msgs).toMatch(/areas\[0\]\.series 超出范围/)
    expect(msgs).toMatch(/size 只能是/)
    expect(msgs).toMatch(/legend\[0\]\.kind 不合法/)
  })

  it('checks parametric plot curves', () => {
    const front = ['---', 'id: t', 'title: t', 'demo: true', '---', ''].join('\n')
    const ok =
      front +
      [
        '<Param name="x" value={2} min={0} max={5} />',
        '',
        '<Define name="y" expr="x * 3" />',
        '',
        '<Plot x={{name: "t", min: 0, max: 10}} y={{min: 0, max: 10}} series={[{label: "普通", expr: "x*t"}, {label: "p–V", x: "s", expr: "y/s", over: {name: "s", min: 1, max: "x"}, point: "x"}]} />',
      ].join('\n')
    expect(validateLesson(ok).errors).toEqual([])

    const bad =
      front +
      [
        '<Param name="x" value={2} min={0} max={5} />',
        '',
        '<Define name="y" expr="x * 3" />',
        '',
        '<Plot x={{min: 0, max: 1}} series={[{label: "缺区间", x: "s", expr: "s"}, {label: "未知", expr: "q", over: {name: "s", min: 0, max: 1}, point: "nope"}]} />',
      ].join('\n')
    const msgs = validateLesson(bad).errors.map((e) => e.message).join('\n')
    expect(msgs).toMatch(/要和 over 一起写/)
    expect(msgs).toMatch(/未声明的名字 q/)
    expect(msgs).toMatch(/point 引用了未声明的名字 nope/)
  })

  it('checks instruments, ticker tapes, knots and sensor elements', () => {
    const ok =
      head +
      [
        '<Param name="x" value={2} min={0} max={5} />',
        '',
        '<Define name="y" expr="x * 3" />',
        '',
        '<Instrument type="vernier" value="x*10" divisions={50} />',
        '',
        '<Instrument type="meter" value="x/10" scales={[0.6, 3]} range={0.6} />',
        '',
        '<Instrument type="resistanceBox" value="x*100" decades={[1000, 100, 10, 1, 0.1]} reading={false} />',
        '',
        '<TickerTape expr="100*x*t^2/2" count={6} interval={0.1} labels="letters" />',
        '',
        '<ForceDiagram body={{shape: "knot", label: "O"}} forces={[{label: "G", angle: -90, magnitude: "x"}]} />',
        '',
        '<Circuit source={{type: "battery"}} load={{series: [{type: "thermistor"}, {type: "photoresistor"}, {type: "motor"}]}} />',
      ].join('\n')
    expect(validateLesson(ok).errors).toEqual([])

    const bad =
      head +
      [
        '<Param name="x" value={2} min={0} max={5} />',
        '',
        '<Instrument type="caliper" value="x" />',
        '',
        '<Instrument type="vernier" value="x" divisions={25} />',
        '',
        '<Instrument type="meter" value="x" />',
        '',
        '<TickerTape expr="x*t" positions={[0, 1]} />',
        '',
        '<TickerTape expr="x*s" />',
      ].join('\n')
    const msgs = validateLesson(bad).errors.map((e) => e.message).join('\n')
    expect(msgs).toMatch(/type 不合法：caliper/)
    expect(msgs).toMatch(/divisions 只能是 10、20 或 50/)
    expect(msgs).toMatch(/电表需要 range 或 scales/)
    expect(msgs).toMatch(/expr 和 positions 二选一/)
    expect(msgs).toMatch(/未声明的名字 s/)
  })

  it('checks force triangles, energy levels and real wiring', () => {
    const ok =
      head +
      [
        '<Param name="x" value={2} min={0} max={5} />',
        '',
        '<Define name="y" expr="x * 3" />',
        '',
        '<ForceDiagram forces={[{label: "G", angle: -90, magnitude: "x"}, {label: "N", angle: 90, magnitude: "x"}]} triangle={{order: [1, 0], resultant: "F_{合}"}} />',
        '',
        '<ForceDiagram forces={[{label: "G", angle: -90, magnitude: 1}, {label: "T_1", angle: "90 + x", magnitude: 1}, {label: "T_2", angle: "x - 30", magnitude: 0}]} triangle={{circle: true, angleLabel: "180°−α"}} />',
        '',
        '<EnergyLevels allFrom={4} select="x" workFunction={2.29} visible />',
        '',
        '<EnergyLevels levels={[{n: 1, E: -10.4}, {n: 2, E: "-x"}, {n: "∞", E: 0}]} transitions={[{from: 2, to: 1}, {from: 1, to: "inf"}]} />',
        '',
        '<Wiring parts={[{id: "E", type: "battery"}, {id: "A", type: "ammeter", value: "x/10"}, {id: "R", type: "rheostat", slider: "x/5"}]} wires={[{from: "E.+", to: "A.0.6"}, {from: "A.-", to: "R.C"}, {from: "R.A", to: "E.-", answer: true, when: "x > 1"}]} />',
        '',
        '<Wiring steps="x" parts={[{id: "E", type: "battery", positive: "left"}, {id: "L", type: "lamp", lit: "x >= 2 ? 1 : 0"}]} wires={[{from: "E.+", to: "L.b", note: "先接正极"}, {from: "L.a", to: "E.-"}]} />',
      ].join('\n')
    expect(validateLesson(ok).errors).toEqual([])

    const bad =
      head +
      [
        '<Param name="x" value={2} min={0} max={5} />',
        '',
        '<ForceDiagram forces={[{label: "G", angle: -90, magnitude: 1}]} triangle={{order: [0, 3]}} />',
        '',
        '<ForceDiagram forces={[{label: "G", angle: -90, magnitude: 1}, {label: "N", angle: 90, magnitude: 1}]} triangle={{circle: true}} />',
        '',
        '<EnergyLevels levels={[{n: 1, E: -3}, {n: 2, E: -1}]} transitions={[{from: 3, to: 1}]} allFrom={2} />',
        '',
        '<EnergyLevels allFrom={3} unit="J" visible />',
        '',
        '<Wiring parts={[{id: "E", type: "battery"}, {id: "E", type: "fuse"}, {id: "V", type: "voltmeter", ranges: [3, 15]}]} wires={[{from: "E.+", to: "V.0.6"}, {from: "Q.a", to: "E.-"}]} />',
        '',
        '<Define name="y" expr="x * 3" />',
        '',
        '<Wiring steps="y" parts={[{id: "E", type: "battery"}, {id: "L", type: "lamp"}]} wires={[{from: "E.+", to: "L.b", answer: true, note: 3}, {from: "L.a", to: "E.-"}]} />',
        '',
        '<Wiring steps="k" parts={[{id: "E", type: "battery"}]} wires={[{from: "E.+", to: "E.-"}]} />',
        '',
        '<Wiring parts={[{id: "E", type: "battery", positive: "up"}, {id: "L", type: "lamp", positive: "left"}]} wires={[{from: "E.+", to: "L.b"}, {from: "L.a", to: "E.-"}]} />',
      ].join('\n')
    const msgs = validateLesson(bad).errors.map((e) => e.message).join('\n')
    expect(msgs).toMatch(/triangle\.order 应为/)
    expect(msgs).toMatch(/triangle 至少需要两个力/)
    expect(msgs).toMatch(/triangle\.circle 只用于三个力/)
    expect(msgs).toMatch(/transitions\[0\]\.from 不是已有能级：3/)
    expect(msgs).toMatch(/transitions 和 allFrom 二选一/)
    expect(msgs).toMatch(/visible 只在能量单位是 eV 时可用/)
    expect(msgs).toMatch(/id 重复：E/)
    expect(msgs).toMatch(/type 不合法：fuse/)
    expect(msgs).toMatch(/V 没有接线柱「0\.6」/)
    expect(msgs).toMatch(/找不到元件：Q\.a/)
    expect(msgs).toMatch(/逐根接线（steps）时不要再写 answer/)
    expect(msgs).toMatch(/wires\[0\]\.note 应为字符串/)
    expect(msgs).toMatch(/steps 必须是 Param（Define 不能被设置）：y/)
    expect(msgs).toMatch(/steps 引用了未声明的名字 k/)
    expect(msgs).toMatch(/E」\.positive 只能是 left 或 right/)
    expect(msgs).toMatch(/L」\.positive 只用于 battery/)
  })

  it('describes wire ends in words a student can match to the drawing', () => {
    const parts = [
      { id: 'E', type: 'battery', label: '电源 E' },
      { id: 'R', type: 'rheostat', label: 'R' },
      { id: 'A', type: 'ammeter', label: '电流表' },
      { id: 'Rx', type: 'resistor', label: 'R_x' },
      { id: 'S', type: 'switch' },
    ]
    expect(describeEnd('E.+', parts)).toBe('电源 E 的正极')
    expect(describeEnd('R.D', parts)).toBe('滑动变阻器 R 的 D 端（连滑片）')
    expect(describeEnd('R.A', parts)).toBe('滑动变阻器 R 的 A 端')
    expect(describeEnd('A.−', parts)).toBe('电流表的「−」接线柱')
    expect(describeEnd('A.0.6', parts)).toBe('电流表的「0.6」接线柱')
    expect(describeEnd('Rx.a', parts)).toBe('电阻 R_x 的左端')
    expect(describeEnd('S.b', parts)).toBe('开关 S 的右端')
  })

  it('checks answers against computed values', () => {
    const src = head + '<Param name="x" value={3} min={0} max={5} />\n\n<Define name="y" expr="x * 3" />\n\n<Readout items={[{label: "y", expr: "y"}]} />\n'
    expect(validateLesson(src).errors.map((e) => e.message).join()).toMatch(/答案不一致/)
  })

  it('lets a multiple-choice lesson answer with choice and a text Answer item', () => {
    const mcq = (choice: string) =>
      ['---', 'id: t', 'title: t', 'question: q', choice, 'answers: []', '---', '', '<Param name="x" value={3} min={0} max={5} />', '', '<Answer items={[{label: "答案", text: "BD"}]} />', ''].join('\n')
    const msgs = (src: string) => validateLesson(src).errors.map((e) => e.message).join('\n')
    expect(msgs(mcq('choice: BD'))).not.toMatch(/answers 为空|choice|<Answer>/)
    expect(msgs(mcq('choice: DB'))).toMatch(/choice/)
    expect(msgs(mcq(''))).toMatch(/answers 为空/)
  })

  it('does not warn about an event that never happens, only about names computed from it', () => {
    const src = [
      '---', 'id: t', 'title: t', 'question: q', 'answers:', '  - { name: x1, value: 2 }', '---', '',
      '<Param name="v0" value={2} min={1} max={3} />',
      '',
      '<Motion name="m" until={1} state={{x: 0, v: "v0"}} rates={{x: "v", v: "0"}} events={[{name: "tBack", when: "x + 1", dir: "down"}]} />',
      '',
      '<Define name="x1" expr="m.x(1)" />',
      '',
      '<Define name="xBack" expr="m.x(tBack)" />',
      '',
      '<Sim title="s" duration={1} params={["v0"]}>',
      'sim({ at(t, p) { return { x: p.v0 * t } }, draw(v, s) { v.view(-1, -1, 3, 1); v.dot(s.x, 0) } })',
      '</Sim>',
      '',
    ].join('\n')
    const warnings = validateLesson(src).warnings.map((w) => w.message).join('\n')
    expect(warnings).not.toMatch(/tBack/)
    expect(warnings).toMatch(/xBack/)
  })
})

describe('checkSim', () => {
  const runtime = buildRuntime()
  const runs = [{ label: '初始', params: { a: 1 }, times: [0, 0.5, 1] }]

  it('passes a valid sim', () => {
    const body = 'sim({ at(t, p) { return { x: p.a * t } }, draw(ctx, s, v) { const m = v.view({xmin: 0, xmax: 1, ymin: 0, ymax: 1}); v.field(m, 0, 0, 1, 1, {dir: "out"}); v.ball(m, s.x, 0.5, 0.05, {label: "v_0"}); v.text(m, 0.5, 0.2, "R_{AB}") } })'
    expect(checkSim(body, runtime, runs)).toEqual({ errors: [], warnings: [] })
  })

  it('reports draw errors, missing helpers and runaway loops', () => {
    const bad = 'sim({ at(t) { return { x: t } }, draw(ctx, s, v) { v.teleporter(1) } })'
    expect(checkSim(bad, runtime, runs).errors.join()).toMatch(/teleporter/)
    const nan = 'sim({ at(t) { return { x: 0 / 0 } }, draw() {} })'
    expect(checkSim(nan, runtime, runs).warnings.join()).toMatch(/非有限数/)
    const loop = 'sim({ at(t) { while (true) {} }, draw() {} })'
    expect(checkSim(loop, runtime, runs).errors.join()).toMatch(/超时|timed out/i)
  })

  it('accepts dash: true like Plot does, and reports what a real canvas would throw on', () => {
    const view = 'const m = v.view({xmin: 0, xmax: 1, ymin: 0, ymax: 1});'
    const dashed = `sim({ at(t) { return { x: t } }, draw(ctx, s, v) { ${view} v.vec(m, 0, 0, 0.5, 0, {dash: true}); v.line(m, 0, 0, 1, 1, {dash: 4}); v.circle(m, 0.5, 0.5, 0.2, {dash: [3, 2]}) } })`
    expect(checkSim(dashed, runtime, runs)).toEqual({ errors: [], warnings: [] })
    const rawDash = `sim({ at(t) { return { x: t } }, draw(ctx, s, v) { ctx.setLineDash(true) } })`
    expect(checkSim(rawDash, runtime, runs).errors.join()).toMatch(/setLineDash/)
    const negative = `sim({ at(t) { return { x: t } }, draw(ctx, s, v) { ${view} v.circle(m, 0.5, 0.5, 0.3 - s.x) } })`
    expect(checkSim(negative, runtime, runs).errors.join()).toMatch(/radius provided \(-/)
  })

  it('runs the field, track and apparatus helpers', () => {
    const body = [
      'sim({ at(t) { return { t } }, draw(ctx, s, v) {',
      '  const m = v.view({xmin: -3, xmax: 3, ymin: -2, ymax: 2, equal: true})',
      '  const f = v.efield(m, [{x: -1, y: 0, q: 1}, {x: 1, y: 0, q: -1}, {x1: -2, y1: -1.5, x2: 2, y2: -1.5, q: 2}], {equipotentials: 4})',
      '  if (!(f.E(0, 0)[0] > 0)) throw new Error("E should point from + to -")',
      '  v.field(m, -1, -1, 1, 1, {shape: "ring", inner: 0.4})',
      '  v.field(m, 0, 0, 0, 0, {points: [[0, 0], [1, 0], [0, 1]]})',
      '  const tr = v.track(m, [{line: [-2, 0, 0, 0]}, {arc: [0, 1, 1, -90, 270]}], {marks: [{s: 2, label: "B"}]})',
      '  const p = tr.at(2 + Math.PI)',
      '  if (Math.abs(p[1] - 2) > 1e-9) throw new Error("top of loop")',
      '  v.photogate(m, 1, 0.1, 0.5, {blocked: true, label: "光电门", post: 0})',
      '  v.wire(m, 0, 0, {dir: "in", label: "I"})',
      '  const tf = v.transformer(m, 0, 0, {n1: 100, n2: 50})',
      '  if (!(tf.p[0][0] < tf.s[0][0])) throw new Error("terminals")',
      '  v.field(m, 0, 0, 0, 0, {sector: {x: 0, y: 0, r: 1.5, from: 0, to: 60}, border: false})',
      '  v.regions(m, { fields: [',
      '    { label: "电场", angle: -90, region: { xmin: -1, xmax: 1, ymin: -0.5, ymax: 0.5 } },',
      '    { label: "磁场", dir: "out", region: { cx: 0, cy: 0, r: 1 } },',
      '    { dir: "in", region: { xmin: 0 } },',
      '    { angle: 30, dir: "out", region: { cx: 0.2, cy: 0, r: 0.8, xmin: 0 } },',
      '    { dir: "in", region: { points: [[-2, -1], [-1, -1], [-1.5, 0]] } },',
      '    { dir: "out", region: { cx: 1.2, cy: 0, r: 0.7, from: 0, to: 180 } },',
      '  ] })',
      '  v.regions(m, {})',
      '  const b = v.block(m, 0, 0, 0.4, 0.2, {flag: 0.3})',
      '  if (Math.abs(b.flagTop - 0.5) > 1e-9) throw new Error("flag top")',
      '  v.photogate(m, 1, 0.1, 0.5, {time: 0.0123, timeLabel: "Δt"})',
      '  v.photogate(m, 2, 0.1, 0.5, {time: null})',
      '  v.photogate(m, 0.3, -0.1, 0.1, {horizontal: true, blocked: true, post: 0, time: "2.13 ms", timeLabel: "t1", label: "光电门"})',
      '  const cy = v.cyclotron(m, 0, 0, 1.5, {r1: 0.3, e: 1})',
      '  if (cy.halfTurns !== Math.floor((0.96 * 1.5 / 0.3 - 0.21) ** 2)) throw new Error("half turns")',
      '  let far = 0',
      '  for (const [x, y] of cy.points) {',
      '    const d = Math.hypot(Math.max(0, Math.abs(x) - 0.09), y)',
      '    if (Math.abs(x) > 0.09 && d > 1.5 * 0.96 + 1e-9) throw new Error("path leaves the D")',
      '    far = Math.max(far, d)',
      '  }',
      '  if (far < 1.5 * 0.9) throw new Error("last half-turn should reach the rim")',
      '  const y0 = -0.3 * (3 - Math.SQRT2) / 2',
      '  if (Math.abs(cy.at(0)[1] - y0) > 1e-9) throw new Error("ion starts below the centre")',
      '  const q = cy.at(2.5), r3 = 0.3 * Math.sqrt(3)',
      '  if (Math.abs(q[0] - (0.09 + r3)) > 1e-9 || Math.abs(q[1] - (y0 + 0.6 - 0.6 * Math.SQRT2 + r3)) > 1e-9) throw new Error("third half-turn has radius r1·√3")',
      '  if (cy.upTo(2.5).length < 60) throw new Error("path")',
      '} })',
    ].join('\n')
    expect(checkSim(body, runtime, runs)).toEqual({ errors: [], warnings: [] })
  })

  it('reports params the code reads but the block does not pass', () => {
    const body = 'sim({ at(t, p) { return { x: p.a * t } }, draw(ctx, s, v) { v.event(v.view({xmin: 0, xmax: 1, ymin: 0, ymax: 1}), 0, 0, "x", { at: v.p.tEnd }) } })'
    expect(checkSim(body, runtime, runs).errors.join()).toMatch(/p\.tEnd/)
  })

  it('traces the field line through a point, ordered from + to −', () => {
    const body = [
      'sim({ at(t) { return { t } }, draw(ctx, s, v) {',
      '  const m = v.view({xmin: -3, xmax: 3, ymin: -2, ymax: 2, equal: true})',
      '  const f = v.efield(m, [{x: -1, y: 0, q: 1}, {x: 1, y: 0, q: -1}], {through: [[0, 0.5]]})',
      '  const L = f.line(0, 0.5)',
      '  const a = L[0], b = L[L.length - 1]',
      '  if (Math.hypot(a[0] + 1, a[1]) > 0.3 || Math.hypot(b[0] - 1, b[1]) > 0.3) throw new Error("ends " + a + " / " + b)',
      '  if (!L.some(([x, y]) => Math.hypot(x, y - 0.5) < 1e-9)) throw new Error("misses the point")',
      '  for (let i = 1; i < L.length; i++) {',
      '    const [ex, ey] = f.E(L[i][0], L[i][1])',
      '    if ((L[i][0] - L[i - 1][0]) * ex + (L[i][1] - L[i - 1][1]) * ey <= 0) throw new Error("against E at " + i)',
      '  }',
      '  const top = L.reduce((p, q) => (q[1] > p[1] ? q : p))',
      '  if (Math.abs(top[0]) > 0.05 || Math.abs(top[1] - 0.5) > 0.01) throw new Error("dipole line should peak at the start point " + top)',
      '  v.efield(m, [{x: 0, y: 0, q: 1}], {lines: false, through: [[1, 1]]})',
      '} })',
    ].join('\n')
    expect(checkSim(body, runtime, runs)).toEqual({ errors: [], warnings: [] })
  })

  it('lets draw read p directly, the same object as v.p', () => {
    const body = 'sim({ at(t, p) { return { x: p.a * t } }, draw(ctx, s, v) { const m = v.view({xmin: 0, xmax: 1, ymin: 0, ymax: 1}); v.ball(m, s.x * p.a, 0.5, 0.05) } })'
    expect(checkSim(body, runtime, runs)).toEqual({ errors: [], warnings: [] })
    const missing = 'sim({ at(t, p) { return { x: p.a * t } }, draw(ctx, s, v) { v.event(v.view({xmin: 0, xmax: 1, ymin: 0, ymax: 1}), 0, 0, "x", { at: p.tEnd }) } })'
    expect(checkSim(missing, runtime, runs).errors.join()).toMatch(/p\.tEnd/)
  })
})

describe('richParts', () => {
  it('turns _x, _{..} and unicode subscripts into subscript parts', async () => {
    const { richParts } = await import('../components/rich')
    expect(richParts('R₁ = 1 Ω')).toEqual([
      { text: 'R', sub: false },
      { text: '1', sub: true },
      { text: ' = 1 Ω', sub: false },
    ])
    expect(richParts('F_{电}').map((p) => p.text)).toEqual(['F', '电'])
    expect(richParts('v_0 与 Rₕ').filter((p) => p.sub).map((p) => p.text)).toEqual(['0', 'h'])
  })
})
