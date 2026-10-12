import { buildRuntime } from '../sim/buildRuntime'
import { describe, expect, it } from 'vitest'
import { leastSquares } from './fit'
import { checkSim } from './simcheck'
import { validateLesson } from './validate'
import { cavityContains, vesselLayout } from '../sim/vesselgeom.js'
import { waveField, waveFront } from '../sim/waves.js'

const runtime = buildRuntime()

describe('vessel geometry', () => {
  it('puts a flask mouth at the top of the neck and keeps the cavity round', () => {
    const parts = [{ flask: { cx: 0, cy: 0, r: 2, neck: { w: 0.4, h: 3 }, open: true } }]
    const { mouth, openings } = vesselLayout(parts, 0.05, 0.08)
    expect(mouth).toMatchObject({ x: 0, y: 5, w: 0.4, side: 'top', open: true })
    expect(openings).toHaveLength(1)
    expect(cavityContains(parts, 0, 0)).toBe(true)
    expect(cavityContains(parts, 0, 3.5)).toBe(true)
    expect(cavityContains(parts, 0, 5.2)).toBe(false)
    expect(cavityContains(parts, 2.15, 0)).toBe(false)
    expect(vesselLayout([{ flask: { cx: 1, cy: 0, r: 1, neck: { w: 0.2, h: 1 }, open: false } }], 0).mouth?.open).toBe(false)
  })

  it('turns a bottle or flask neck-down with down: true', () => {
    const inv = [{ bottle: { x1: 0, x2: 4, y1: 0, y2: 3, neck: { w: 1, h: 2 }, shoulder: 0.8, down: true } }]
    expect(vesselLayout(inv, 0).mouth).toMatchObject({ x: 2, y: -2.8, w: 1, side: 'bottom' })
    expect(cavityContains(inv, 2, 2)).toBe(true)
    expect(cavityContains(inv, 2, -1.5)).toBe(true)
    expect(cavityContains(inv, 2, 4.5)).toBe(false)
    expect(cavityContains(inv, 3.2, -1.5)).toBe(false)
    const flask = [{ flask: { cx: 0, cy: 0, r: 1, neck: { w: 0.4, h: 1 }, down: true } }]
    expect(vesselLayout(flask, 0).mouth).toMatchObject({ x: 0, y: -2, side: 'bottom' })
    expect(cavityContains(flask, 0, -1.5)).toBe(true)
    expect(cavityContains(flask, 0, 1.5)).toBe(false)
  })

  it('tapers a bottle shoulder and opens a cupping jar at the rim', () => {
    const bottle = [{ bottle: { x1: 0, x2: 4, y1: 0, y2: 3, neck: { w: 1, h: 2 }, shoulder: 0.8 } }]
    expect(vesselLayout(bottle, 0).mouth).toMatchObject({ x: 2, y: 5.8, w: 1, side: 'top' })
    expect(cavityContains(bottle, 2, 1)).toBe(true)
    expect(cavityContains(bottle, 2, 4.5)).toBe(true)
    expect(cavityContains(bottle, 3.1, 3.4)).toBe(true)
    expect(cavityContains(bottle, 3.5, 3.4)).toBe(false)
    expect(cavityContains(bottle, 3.2, 4.5)).toBe(false)

    const jar = [{ jar: { cx: 0, y: 0, r: 1, h: 2, open: 'bottom' } }]
    expect(vesselLayout(jar, 0).mouth).toMatchObject({ x: 0, y: 0, w: 2, side: 'bottom' })
    expect(cavityContains(jar, 0, 1)).toBe(true)
    expect(cavityContains(jar, 0, 1.6)).toBe(true)
    expect(cavityContains(jar, 0, -0.1)).toBe(false)
    expect(cavityContains(jar, 0, 2.15)).toBe(false)
  })

  it('keeps a capillary thin and unions overlapping rectangles', () => {
    const tube = [{ capillary: { x: 1, y1: 0, y2: 5, w: 0.2 } }]
    const layout = vesselLayout(tube, 0.01)
    expect(layout.openings.map((o) => o.side).sort()).toEqual(['bottom', 'top'])
    expect(layout.mouth).toMatchObject({ x: 1, y: 5, side: 'top' })
    expect(cavityContains(tube, 1, 2.5)).toBe(true)
    expect(cavityContains(tube, 1.16, 2.5)).toBe(false)

    const rects = [
      { x1: 0, y1: 0, x2: 2, y2: 1, open: 'top' },
      { x1: 1.5, y1: 0, x2: 3, y2: 1 },
    ]
    expect(vesselLayout(rects, 0).mouth).toMatchObject({ x: 1, y: 1, w: 2, side: 'top' })
    expect(cavityContains(rects, 0.4, 0.5)).toBe(true)
    expect(cavityContains(rects, 1.7, 0.5)).toBe(true)
    expect(cavityContains(rects, 2.6, 0.5)).toBe(true)
    expect(cavityContains(rects, 1.7, 1.4)).toBe(false)
  })
})

describe('finite wave trains', () => {
  const right = { x: 0, v: 1, amp: 1, lambda: 2, dir: 1, start: 0, shape: 'sine' as const }

  it('stops at the front and is zero ahead of it', () => {
    const src = { x: 1, v: 2, amp: 1, lambda: 4, dir: 1, start: 0.5, shape: 'sine' }
    expect(waveFront(src, 1.5, 1)).toBeCloseTo(3)
    expect(waveFront(src, 1.5, -1)).toBeCloseTo(-1)
    expect(waveFront(src, 0.5)).toBeNull()
    const { y } = waveField([src], 1.5)
    expect(y(3)).toBeCloseTo(0, 8)
    expect(y(3.05)).toBe(0)
    expect(y(0.9)).toBe(0)
    expect(Math.abs(y(2.5))).toBeGreaterThan(0.5)
  })

  it('cuts a sine train off at its tail', () => {
    const src = { ...right, cycles: 1 }
    const { y } = waveField([src], 3)
    expect(waveFront(src, 3)).toBeCloseTo(3)
    expect(y(3.1)).toBe(0)
    expect(y(0.5)).toBe(0)
    expect(y(2.5)).toBeCloseTo(1, 8)
  })

  it('cancels two opposite pulses and doubles two in-phase ones', () => {
    const left = { x: 0, v: 1, amp: 1, lambda: 2, dir: 1, start: 0, shape: 'pulse' }
    const rightPulse = { x: 3, v: 1, amp: -1, lambda: 2, dir: -1, start: 0, shape: 'pulse' }
    const cancel = waveField([left, rightPulse], 2)
    for (const x of [1.1, 1.25, 1.5, 1.75, 1.9]) {
      expect(cancel.y(x)).toBeCloseTo(0, 8)
      expect(Math.abs(cancel.yi(0, x))).toBeGreaterThan(0.1)
    }
    expect(cancel.y(2.2)).toBe(0)
    const add = waveField([left, { ...rightPulse, amp: 1 }], 2)
    expect(add.y(1.5)).toBeCloseTo(2, 8)
    expect(add.yi(0, 1.5)).toBeCloseTo(1, 8)

    const same = { x: 0, v: 1, amp: 0.4, lambda: 2, phase: 0.3, dir: 1, start: 0 }
    const both = waveField([same, { ...same }], 1.2)
    expect(both.y(0.4)).toBeCloseTo(2 * both.yi(0, 0.4), 8)
    expect(Math.abs(both.yi(0, 0.4))).toBeGreaterThan(0.05)
  })

  it('has nodes where two opposite trains make a standing wave', () => {
    const L = { x: 8, v: 1, amp: 1, lambda: 2, dir: -1, start: 0, shape: 'sine' }
    for (const t of [6, 6.4, 7.2, 8.5]) {
      const { y } = waveField([right, L], t)
      for (const x of [2.5, 3.5, 4.5, 5.5]) expect(y(x)).toBeCloseTo(0, 7)
    }
    const { y, yi } = waveField([right, L], 6)
    expect(Math.abs(yi(0, 3.5)) + Math.abs(yi(1, 3.5))).toBeGreaterThan(0.5)
    const peak = waveField([right, L], 6.5)
    expect(peak.y(2)).toBeCloseTo(2, 6)
    expect(peak.y(3)).toBeCloseTo(-2, 6)
  })

  it('inverts at a fixed end and doubles at a free end', () => {
    const src = { x: 0, v: 1, amp: 1, lambda: 4, dir: 1, start: 0, shape: 'sine' }
    const wall = 2
    for (const t of [1, 2.3, 3, 4.2]) {
      const bare = waveField([src], t).y
      const fixed = waveField([src], t, { wall: { x: wall, kind: 'fixed' } }).y
      const free = waveField([src], t, { wall: { x: wall, kind: 'free' } }).y
      expect(fixed(wall)).toBeCloseTo(0, 8)
      expect(fixed(wall + 0.4)).toBe(0)
      for (const x of [0.2, 0.8, 1.2, 1.7]) {
        expect(fixed(x)).toBeCloseTo(bare(x) - bare(2 * wall - x), 8)
        expect(free(x)).toBeCloseTo(bare(x) + bare(2 * wall - x), 8)
      }
    }
    const bare = waveField([src], 3).y
    const free = waveField([src], 3, { wall: { x: wall, kind: 'free' } }).y
    expect(Math.abs(bare(wall))).toBeGreaterThan(0.5)
    expect(free(wall)).toBeCloseTo(2 * bare(wall), 8)

    const both = { x: 0, v: 1, amp: 1, lambda: 4, dir: 'both', start: 0 }
    const open = waveField([both], 1.2).y
    const held = waveField([both], 1.2, { wall: { x: wall, kind: 'fixed' } }).y
    expect(held(-0.4)).toBeCloseTo(open(-0.4), 8)
    expect(held(wall)).toBeCloseTo(0, 8)
  })

  it('turns a half-wave over when the phase is π', () => {
    const pulse = { x: 0, v: 1, amp: 1, lambda: 2, dir: 1, start: 0, shape: 'pulse' }
    const half = { ...pulse, shape: 'half', phase: Math.PI }
    expect(waveField([half], 2).y(1.2)).toBeCloseTo(-waveField([pulse], 2).y(1.2), 8)
  })
})

describe('least squares', () => {
  it('fits the 2025 Zhejiang U–I table and a line through the origin', () => {
    const ui: [number, number][] = [
      [0.14, 1.35],
      [0.22, 1.3],
      [0.3, 1.25],
      [0.37, 1.2],
      [0.45, 1.15],
    ]
    const fit = leastSquares(ui, 'linear')
    expect(fit.intercept).toBeCloseTo(1.4421, 3)
    expect(fit.slope).toBeCloseTo(-0.649, 3)
    expect(leastSquares(ui, 'proportional').intercept).toBe(0)
    const through = leastSquares(
      [
        [1, 2],
        [2, 4],
        [3, 6],
      ],
      'proportional',
    )
    expect(through.slope).toBeCloseTo(2, 8)
    expect(through.intercept).toBe(0)
    expect(leastSquares([[1, 2]], 'linear').slope).toBeNaN()
    expect(leastSquares([[1, 2], [1, 5]], 'linear').slope).toBeNaN()
  })
})

describe('plot points validator', () => {
  const wrap = (body: string) => `---\ntitle: 测\ndemo: true\n---\n${body}\n`

  it('publishes E and r from a linear fit', () => {
    const src = wrap(`<Plot
      x={{name: "I", min: 0, max: 1}}
      y={{min: 0, max: 2}}
      series={[{label: "U", points: [[0.14, 1.35], [0.22, 1.30], [0.30, 1.25], [0.37, 1.20], [0.45, 1.15]], fit: "linear", read: {slope: "kUI", intercept: "E"}}]}
    />
    <Define name="r" expr="-kUI" />`)
    const res = validateLesson(src)
    expect(res.errors).toEqual([])
    expect(res.scope?.E).toBeCloseTo(1.4421, 3)
    expect(res.scope?.r).toBeCloseTo(0.649, 3)
  })

  it('rejects a bad point series', () => {
    const src = wrap(`<Plot x={{min: 0, max: 1}} series={[
      {label: "a", points: [1, 2], fit: "quad", marker: "star"},
      {label: "b", expr: "x", fit: "linear"},
      {label: "c", expr: "x", points: [[0, 1], [1, 2]]},
      {label: "d", points: [[0, 1], [1, 2]], read: {slope: "k"}}
    ]} />`)
    const messages = validateLesson(src).errors.map((e) => e.message).join('\n')
    expect(messages).toMatch(/points\[0\] 应为 \[x, y\]/)
    expect(messages).toMatch(/fit 只能是 linear/)
    expect(messages).toMatch(/marker 只能是 dot 或 cross/)
    expect(messages).toMatch(/就要写 points/)
    expect(messages).toMatch(/points 和 expr 只写一个/)
    expect(messages).toMatch(/read 要和 fit 一起写/)
  })

  it('draws a flask and a pulse inside the sandbox', () => {
    const body = `figure({
      draw(ctx, p, v) {
        const m = v.view({ xmin: -1, xmax: 6, ymin: -1, ymax: 8, equal: true })
        const g = v.vessel(m, [{ flask: { cx: 2, cy: 2, r: 1.5, neck: { w: 0.4, h: 3 }, open: true } }], {
          fills: [
            { x1: 0.5, y1: 0.5, x2: 3.5, y2: 3.5, kind: 'gas', count: 12, density: 0.8 },
            { x1: 1.8, y1: 3.6, x2: 2.2, y2: 4.3, kind: 'mercury', meniscus: 'top' },
          ],
        })
        const w = v.waves(m, [{ x: 0, v: 1, amp: 1, lambda: 2, dir: 1, start: 0, shape: 'pulse' }], -1, 4, { t: 1, sum: true, parts: true, dots: [0.5] })
        if (!g.mouth || Math.abs(g.mouth.x - 2) > 1e-6 || Math.abs(g.mouth.y - 6.5) > 1e-6) throw new Error('mouth ' + JSON.stringify(g.mouth))
        if (Math.abs(w.y(2)) > 1e-9) throw new Error('ahead ' + w.y(2))
        if (Math.abs(w.y(0.5) - 1) > 1e-6) throw new Error('pulse ' + w.y(0.5))
        if (Math.abs(w.yi(0, 0.5) - 1) > 1e-6) throw new Error('part ' + w.yi(0, 0.5))
      },
    })`
    expect(checkSim(body, runtime, [{ label: '初始', params: {}, times: [0] }])).toEqual({ errors: [], warnings: [] })
  })
})
