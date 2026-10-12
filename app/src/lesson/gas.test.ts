import { describe, expect, it } from 'vitest'
import { validateLesson } from './validate'
import { createGas, histogram, maxwellPdf, setTemperature, speeds, stats, stepGas, temperature } from './gas'

describe('gas box physics', () => {
  it('textbook speeds for N₂ at 300 K and a normalised Maxwell curve', () => {
    const s = speeds(300, 28.014)
    expect(s.vp).toBeCloseTo(422, 0)
    expect(s.mean).toBeCloseTo(476, 0)
    expect(s.rms).toBeCloseTo(517, 0)
    let area = 0
    for (let v = 0; v < 3000; v += 1) area += maxwellPdf(v + 0.5, 300, 28.014)
    expect(area).toBeCloseTo(1, 4)
  })

  it('starts at the exact temperature and conserves energy through collisions', () => {
    const g = createGas({ count: 300, T: 300, massU: 28.014 })
    expect(temperature(g)).toBeCloseTo(300, 6)
    for (let k = 0; k < 300; k++) stepGas(g, 1 / 60)
    expect(g.collisions).toBeGreaterThan(300)
    expect(temperature(g)).toBeCloseTo(300, 6)
    for (let i = 0; i < g.n; i++) {
      expect(g.x[i]).toBeGreaterThanOrEqual(g.r - 1e-9)
      expect(g.x[i]).toBeLessThanOrEqual(g.box.L - g.r + 1e-9)
      expect(g.z[i]).toBeLessThanOrEqual(g.box.D - g.r + 1e-9)
    }
  })

  it('relaxes a single-speed start into the Maxwell distribution', () => {
    const g = createGas({ count: 400, T: 300, massU: 28.014, start: 'same' })
    const th = speeds(300, 28.014)
    expect(stats(g).mean).toBeCloseTo(th.rms, 6)
    expect(Math.max(...histogram(g, 30, 1500))).toBe(400)
    // Average the distribution over many later frames to beat sampling noise.
    for (let k = 0; k < 480; k++) stepGas(g, 1 / 60)
    const acc = new Array(30).fill(0)
    let mean = 0
    for (let k = 0; k < 120; k++) {
      for (let f = 0; f < 6; f++) stepGas(g, 1 / 60)
      histogram(g, 30, 1500).forEach((c, i) => (acc[i] += c / (400 * 120)))
      mean += stats(g).mean / 120
    }
    expect(Math.abs(mean - th.mean) / th.mean).toBeLessThan(0.02)
    const w = 50
    const err = acc.reduce((s, p, i) => s + Math.abs(p - maxwellPdf((i + 0.5) * w, 300, 28.014) * w), 0)
    expect(err).toBeLessThan(0.12)
  })

  it('heating rescales every speed by √(T′/T)', () => {
    const g = createGas({ count: 200, T: 300, massU: 31.998 })
    const m0 = stats(g).mean
    setTemperature(g, 1200)
    expect(temperature(g)).toBeCloseTo(1200, 6)
    expect(stats(g).mean / m0).toBeCloseTo(2, 6)
  })
})

describe('GasBox validation', () => {
  const head = ['---', 'id: t', 'title: t', 'question: q', 'answers:', '  - { name: T, value: 300 }', '---', ''].join('\n')
  it('accepts the documented forms', () => {
    const ok =
      head +
      [
        '<Param name="T" value={300} min={100} max={900} />',
        '',
        '<GasBox T="T" gas="O2" compare={273} tag />',
        '',
        '<GasBox T={300} gas="Xe" mass={131.3} count={200} start="same" collide={false} theory={false} bins={30} />',
      ].join('\n')
    expect(validateLesson(ok).errors).toEqual([])
  })
  it('rejects bad gases, starts, ranges and non-positive temperatures', () => {
    const bad =
      head +
      [
        '<Param name="T" value={0} min={0} max={900} />',
        '',
        '<GasBox T="T" gas="Xe" start="cold" count={2000} bins={4} />',
        '',
        '<GasBox T={-5} compare="Q" />',
        '',
        '<GasBox gas="N2" />',
      ].join('\n')
    const msgs = validateLesson(bad).errors.map((e) => e.message).join('\n')
    expect(msgs).toMatch(/gas 不合法：Xe/)
    expect(msgs).toMatch(/start 只能是 maxwell/)
    expect(msgs).toMatch(/count 应在 20–800/)
    expect(msgs).toMatch(/bins 应在 8–60/)
    expect(msgs).toMatch(/T 绑定的 Param T 最小值应大于 0/)
    expect(msgs).toMatch(/T 是热力学温度/)
    expect(msgs).toMatch(/compare 引用了未声明的名字 Q/)
    expect(msgs).toMatch(/GasBox> 缺少属性 T/)
  })
})
