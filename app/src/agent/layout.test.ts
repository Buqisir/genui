import { describe, expect, it } from 'vitest'
import { checkLayout, formatLayoutReport } from './layout'

const collide = `
<Sim title="相撞" height={280}>
sim({
  at() { return {} },
  draw(ctx, s, v) {
    const m = v.view({ xmin: 0, xmax: 10, ymin: 0, ymax: 4, pad: 20 })
    v.block(m, 5, 0.8, 5, 2.4, { label: '木块' })
    v.label(m, 5, 2, 'v_0')
  },
})
</Sim>
`

const clean = `
<Sim title="干净" height={280}>
sim({
  at() { return {} },
  draw(ctx, s, v) {
    const m = v.view({ xmin: 0, xmax: 10, ymin: 0, ymax: 4 })
    v.ball(m, 2, 2, 0.12)
    v.label(m, 8, 3.2, 'A')
  },
})
</Sim>
`

const outside = `
<Sim title="出界" height={280}>
sim({
  at() { return {} },
  draw(ctx, s, v) {
    const m = v.view({ xmin: 0, xmax: 4, ymin: 0, ymax: 2 })
    v.block(m, 6, 0.6, 1.2, 0.5)
  },
})
</Sim>
`

const crowded = `
<Sim title="规矩" height={280}>
sim({
  at() { return {} },
  draw(ctx, s, v) {
    const m = v.view({ xmin: 0, xmax: 10, ymin: 0, ymax: 4 })
    v.line(m, -1, 2, 11, 2, { width: 2 })
    v.line(m, 1, -1, 1, 5, { width: 2 })
    v.line(m, 9, -1, 9, 5, { width: 2 })
    v.text(m, 5, 2, '导轨')
    v.label(m, 3, 3.4, 'N = 8.7 N')
    v.label(m, 7, 3.4, 'v = 0')
    v.efield(m, [{ x: 5, y: 1, q: 1 }], { lines: 8 })
  },
})
</Sim>
`

const tiny = `
<Figure title="小" height={300}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 20, ymin: 0, ymax: 10 })
    v.block(m, 10, 5, 1, 0.8)
  },
})
</Figure>
`

const hall = `
<Figure title="霍尔片" height={360}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2.3, xmax: 2.3, ymin: -1.7, ymax: 1.7, equal: true })
    v.hall(m, 0.1, -0.05, { w: 1.85, h: 1.05, t: 0.22, B: 'out', I: 'right', carrier: 'electron' })
  },
})
</Figure>
`

const dimThenLabels = `
<Figure title="标注后的标签" height={300}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 10, ymin: 0, ymax: 4 })
    v.dim(m, 0.5, 0.3, 2.5, 0.3, 'L')
    for (let i = 1; i <= 14; i++) v.label(m, 6, 2.6, '甲' + i)
  },
})
</Figure>
`

const vesselContents = `
<Figure title="容器里的水" height={300}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 10, ymin: 0, ymax: 6, equal: true })
    v.vessel(m, [{ x1: 3, y1: 0.5, x2: 7, y2: 5.5, open: 'top' }], { fills: [{ x1: 3, y1: 0.5, x2: 7, y2: 2.5, kind: 'water' }] })
    v.label(m, 5, 1.5, '水', { place: 'center' })
  },
})
</Figure>
`

describe('drawing-rule hints', () => {
  it('flags values, text on lines and field lines through walls without failing the report', async () => {
    const report = await checkLayout(crowded)
    const hints = (report.hints ?? []).map((h) => h.message).join('\n')
    expect(hints).toContain('N = 8.7 N')
    expect(hints).not.toContain('v = 0')
    expect(hints).toContain('「导轨」压在 v.line')
    expect(hints).toMatch(/条场线穿过了 v\.line/)
    expect(formatLayoutReport(report)).toContain('作图建议')
  })

  it('flags a subject that fills a small share of the canvas', async () => {
    const report = await checkLayout(tiny)
    const hints = (report.hints ?? []).map((h) => h.message).join('\n')
    expect(hints).toContain('物体显得小')
    expect(report.ok).toBe(true)
  })
})

describe('checkLayout', () => {
  it('names both the label and the shape it lands on', async () => {
    const report = await checkLayout(collide)
    const hit = report.issues.find((i) => i.message.includes('v_0') && i.message.includes('v.block'))
    expect(hit, report.issues.map((i) => i.message).join('\n')).toBeTruthy()
    expect(hit?.message).toContain('木块')
    expect(hit?.component).toBe('Sim')
    expect(formatLayoutReport(report)).toContain('v_0')
  })

  it('stays quiet when nothing collides or leaves the canvas', async () => {
    const report = await checkLayout(clean)
    expect(report.issues.map((i) => i.message).join('\n')).toBe('')
    expect(report.ok).toBe(true)
    expect(formatLayoutReport(report).startsWith('排版检查：没有发现问题。')).toBe(true)
  })

  it('does not report a component naming its own body', async () => {
    const report = await checkLayout(hall)
    expect(report.issues.map((i) => i.message).join('\n')).not.toContain('v.hall')
  })

  it('lets a label name the contents inside a vessel', async () => {
    const report = await checkLayout(vesselContents)
    expect(report.issues.map((i) => i.message).join('\n')).not.toContain('v.vessel')
  })

  it('names the right labels when a dimension label came first', async () => {
    const report = await checkLayout(dimThenLabels)
    const pairs = report.issues.map((i) => i.message.match(/标签「(.*?)」与标签「(.*?)」/)).filter((x) => x !== null)
    expect(pairs.length, report.issues.map((i) => i.message).join('\n')).toBeGreaterThan(0)
    for (const [, a, b] of pairs) {
      expect(a).toMatch(/^甲\d+$/)
      expect(b).toMatch(/^甲\d+$/)
    }
  })

  it('reports a body drawn outside the view', async () => {
    const report = await checkLayout(outside)
    const hit = report.issues.find((i) => i.message.includes('画布外') && i.message.includes('v.block'))
    expect(hit, report.issues.map((i) => i.message).join('\n')).toBeTruthy()
    expect(hit?.message).toContain('xmax')
  })
})
