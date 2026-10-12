import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ForceDiagram } from '../components/ForceDiagram'
import { attachmentPoint } from './forceLayout'
import { solveForces } from './forces'
import { parseLesson } from './parse'
import { forceSpecOf } from './solvers'
import { buildRegistry, StoreProvider } from './store'
import { validateLesson } from './validate'
import { createElement } from 'react'

const deg = Math.PI / 180

describe('force solver', () => {
  it('block on an incline at rest: N and static friction', () => {
    const r = solveForces(
      {
        forces: [
          { label: 'G', angle: -90, magnitude: 'm*g' },
          { label: 'N', angle: 120, solve: 'N' },
          { label: 'f', angle: 30, solve: 'f' },
        ],
      },
      { m: 2, g: 10 },
    )
    expect(r.values.N).toBeCloseTo(20 * Math.cos(30 * deg), 9)
    expect(r.values.f).toBeCloseTo(20 * Math.sin(30 * deg), 9)
    expect(r.warnings).toEqual([])
  })

  it('knot with two ropes: tensions', () => {
    // T1 at 120°, T2 at 30° holding G = 10 N: T1 = G cos30°, T2 = G sin30°
    const r = solveForces(
      {
        forces: [
          { label: 'G', angle: -90, magnitude: 10 },
          { label: 'T_1', angle: 120, solve: 'T1' },
          { label: 'T_2', angle: 30, solve: 'T2' },
        ],
      },
      {},
    )
    expect(r.values.T1).toBeCloseTo(10 * Math.cos(30 * deg), 9)
    expect(r.values.T2).toBeCloseTo(5, 9)
  })

  it('one force with unknown magnitude and direction', () => {
    const r = solveForces(
      {
        forces: [
          { label: 'G', angle: -90, magnitude: 4 },
          { label: 'F', angle: 0, magnitude: 3 },
          { label: 'T', solve: { magnitude: 'T', angle: 'phi' } },
        ],
      },
      {},
    )
    expect(r.values.T).toBeCloseTo(5, 9)
    expect(r.values.phi).toBeCloseTo(180 - Math.atan2(4, 3) / deg, 9)
  })

  it('F = ma: pulling a block with kinetic friction, solving N and a', () => {
    const r = solveForces(
      {
        forces: [
          { label: 'G', angle: -90, magnitude: 'm*g' },
          { label: 'N', angle: 90, solve: 'N' },
          { label: 'F', angle: 37, magnitude: 'F' },
          { label: 'f', angle: 180, magnitude: 'mu*N' },
        ],
        mass: 'm',
        accel: { angle: 0, solve: 'a' },
      },
      { m: 2, g: 10, F: 10, mu: 0.5 },
    )
    const N = 20 - 10 * Math.sin(37 * deg)
    expect(r.values.N).toBeCloseTo(N, 8)
    expect(r.values.a).toBeCloseTo((10 * Math.cos(37 * deg) - 0.5 * N) / 2, 8)
  })

  it('unknown direction of a known-size force', () => {
    // A 5 N force balancing 3 N right and 4 N down must point up-left.
    const r = solveForces(
      {
        forces: [
          { label: 'A', angle: 0, magnitude: 3 },
          { label: 'B', angle: -90, solve: 'B' },
          { label: 'C', magnitude: 5, solve: { angle: 'th' } },
        ],
      },
      {},
    )
    // Two roots: B = 4 with C up-left, or B = -4. Either balances; residual must be zero.
    expect(r.residual).toBeLessThan(1e-9)
    expect(Math.abs(r.values.B)).toBeCloseTo(4, 8)
  })

  it('warns when the forces cannot balance or a solved force is reversed', () => {
    const bad = solveForces(
      {
        forces: [
          { label: 'G', angle: -90, magnitude: 10 },
          { label: 'F', angle: 0, magnitude: 3 },
          { label: 'N', angle: 90, solve: 'N' },
        ],
      },
      {},
    )
    expect(bad.values.N).toBeCloseTo(10, 9)
    expect(bad.warnings.join()).toContain('无法满足')
    const rev = solveForces(
      {
        forces: [
          { label: 'F', angle: 0, magnitude: 3 },
          { label: 'f', angle: 0, solve: 'f' },
        ],
      },
      {},
    )
    expect(rev.values.f).toBeCloseTo(-3, 9)
    expect(rev.warnings.join()).toContain('相反')
  })

  it('collinear unknowns have no unique solution', () => {
    const r = solveForces(
      {
        forces: [
          { label: 'G', angle: -90, magnitude: 10 },
          { label: 'A', angle: 90, solve: 'A' },
          { label: 'B', angle: 90, solve: 'B' },
        ],
      },
      {},
    )
    expect(Number.isNaN(r.values.A)).toBe(true)
    expect(r.warnings.join()).toContain('无唯一解')
  })
})

describe('ForceDiagram in a lesson', () => {
  const lesson = (extra: string) =>
    [
      '---',
      'id: t',
      'title: t',
      'subject: physics',
      'topic: 平衡',
      'source: 测试',
      'question: 求 N 与 f',
      'answers:',
      '  - { name: N, value: 17.32, unit: N }',
      '  - { name: f, value: 10, unit: N }',
      '---',
      '<Param name="m" value={2} min={1} max={5} step={1} label="m" />',
      '<Param name="g" value={10} min={9} max={10} step={1} label="g" hidden />',
      `<ForceDiagram surface={{type: "incline", angle: 30}} forces={[{label: "G", angle: -90, magnitude: "m*g"}, {label: "N", angle: 120, solve: "N"}, {label: "f", angle: 30, solve: "f"}]} ${extra}/>`,
      '<Readout items={[{label: "N", expr: "N"}]} />',
    ].join('\n')

  it('solved names flow into the scope and the answer check', () => {
    const res = validateLesson(lesson(''))
    expect(res.errors).toEqual([])
    expect(res.scope?.N).toBeCloseTo(17.3205, 3)
    expect(res.scope?.f).toBeCloseTo(10, 9)
  })

  it('rejects bad solve setups', () => {
    const msgs = (src: string) => validateLesson(src).errors.map((e) => e.message).join('\n')
    expect(msgs(lesson('mass="m" '))).toContain('mass 只和 accel 一起用')
    expect(msgs(lesson('accel={{angle: 0, solve: "a"}} '))).toContain('最多解两个未知量')
    expect(msgs(lesson('').replace('solve: "N"', 'magnitude: 1, solve: "N"'))).toContain('二选一')
  })

  it('a direction guide is drawn but not solved, and forces can start at three body points', () => {
    const spec = forceSpecOf({
      forces: [
        { label: 'G', angle: -90, magnitude: 10 },
        { label: 'N', angle: 90, solve: 'N' },
        { role: 'direction', label: 'v', angle: 30 },
      ],
    })
    expect(spec.forces.map((f) => f.label)).toEqual(['G', 'N'])
    expect(solveForces(spec, {}).values.N).toBeCloseTo(10, 9)

    const center: [number, number] = [200, 150]
    const frame = { center, contact: [200, 180] as [number, number], halfW: 40, halfH: 8, xAxis: [Math.cos(Math.PI / 6), -Math.sin(Math.PI / 6)] as [number, number], yAxis: [Math.sin(Math.PI / 6), Math.cos(Math.PI / 6)] as [number, number] }
    const left = attachmentPoint([-1, 0], frame)
    const mid = attachmentPoint([0, 0], frame)
    const right = attachmentPoint([1, 0], frame)
    expect(mid).toEqual(center)
    expect(left[0]).toBeLessThan(mid[0])
    expect(right[0]).toBeGreaterThan(mid[0])
    expect(Math.hypot(right[0] - left[0], right[1] - left[1])).toBeCloseTo(80, 6)

    const src = [
      '---',
      'id: t',
      'title: t',
      'subject: physics',
      'topic: 平衡',
      'source: 测试',
      'question: q',
      'answers:',
      '  - { name: N, value: 20 }',
      '---',
      '<Define name="N" expr="20" />',
      '<Param name="g" value={10} min={9} max={10} hidden />',
      '<ForceDiagram body={{shape: "rod", angle: 30}} guides={[{label: "绳", angle: 30}]} forces={[{label: "G_A", angle: 270, magnitude: 10, at: [-1, 0]}, {label: "G_B", angle: 270, magnitude: 10, at: [1, 0]}, {label: "N", angle: 120, magnitude: 20, at: [0, 0]}]} />',
    ].join('\n')
    const res = validateLesson(src)
    expect(res.errors).toEqual([])
    const parsed = parseLesson(src)
    const diagram = parsed.blocks.find((b) => b.kind === 'component' && b.name === 'ForceDiagram')
    if (!diagram || diagram.kind !== 'component') throw new Error('no diagram')
    const html = renderToStaticMarkup(
      createElement(StoreProvider, {
        registry: buildRegistry(parsed.blocks),
        children: createElement(ForceDiagram, { props: diagram.props }),
      }),
    )
    expect(html.split('stroke-dasharray').length - 1).toBe(1)
    // Subscripts are split into a tspan, so the label is not the literal "G_A".
    expect(html).toContain('>G<tspan')
    expect(html).toContain('>A</tspan>')
    expect(html).toContain('>B</tspan>')
    expect(html).toContain('>N</text>')
    expect(html).toContain('>绳</text>')
    // Arrow shafts are the round-capped lines; the body's bevel and seam lines are not.
    const starts = [...html.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)"[^>]*stroke-linecap="round"/g)].map((m) => [Number(m[1]), Number(m[2])])
    expect(starts).toHaveLength(4)
    const [leftEnd, rightEnd, centerStart] = starts
    expect(Math.hypot(rightEnd[0] - leftEnd[0], rightEnd[1] - leftEnd[1])).toBeCloseTo(150, 0)
    expect(Math.hypot(centerStart[0] - 320, centerStart[1] - 222)).toBeLessThan(1)
    const bad = validateLesson(src.replace('guides={[{label: "绳", angle: 30}]}', 'guides={[{label: "绳", angle: 30, magnitude: 5}]}'))
    expect(bad.errors.some((e) => e.message.includes('magnitude'))).toBe(true)
    const badAt = validateLesson(src.replace('at: [-1, 0]', 'at: "left"'))
    expect(badAt.errors.some((e) => e.message.includes('at'))).toBe(true)
    const badRole = validateLesson(src.replace('{label: "G_A", angle: 270, magnitude: 10, at: [-1, 0]}', '{label: "G_A", angle: 270, magnitude: 10, role: "force"}'))
    expect(badRole.errors.some((e) => e.message.includes('direction'))).toBe(true)
  })

  it('lists shown values in the corner by default and beside the arrow with values="inline"', () => {
    const src = (extra: string) =>
      [
        '---',
        'id: t',
        'title: 数值位置',
        'subject: physics',
        'topic: 平衡',
        'source: 测试',
        'question: q',
        'answers:',
        '  - { name: G, value: 20 }',
        '---',
        '<Define name="G" expr="20" />',
        `<ForceDiagram ${extra} surface={{type: "ground"}} forces={[{label: "G", angle: 270, magnitude: 20, showValue: true, unit: "N"}, {label: "N", angle: 90, magnitude: 20}]} />`,
      ].join('\n')
    const render = (text: string) => {
      const parsed = parseLesson(text)
      const diagram = parsed.blocks.find((b) => b.kind === 'component' && b.name === 'ForceDiagram')
      if (!diagram || diagram.kind !== 'component') throw new Error('no diagram')
      return renderToStaticMarkup(
        createElement(StoreProvider, { registry: buildRegistry(parsed.blocks), children: createElement(ForceDiagram, { props: diagram.props }) }),
      )
    }
    const corner = render(src(''))
    expect(validateLesson(src('')).errors).toEqual([])
    expect(corner).toContain('class="fd-values"')
    expect(corner).toContain('<span class="num">20</span>')
    expect(corner).not.toContain('G = 20')
    const inline = render(src('values="inline"'))
    expect(validateLesson(src('values="inline"')).errors).toEqual([])
    expect(inline).not.toContain('fd-values')
    expect(inline).toContain('G = 20 N')
    expect(validateLesson(src('values="side"')).errors.some((e) => e.message.includes('values'))).toBe(true)
  })
})
