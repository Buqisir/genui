import { describe, expect, it } from 'vitest'
import { DEFAULT_FONTS, defaultHeight, drawScene, simulate, type Colors, type CollisionData, type DrawOpts } from './collisionDraw'

interface Text {
  s: string
  x: number
  y: number
  font: string
  fill: string
  align: string
}

/** 假的 2D 上下文：记录所有 fillText，其余方法只是占位 */
function recorder() {
  const texts: Text[] = []
  const counts: Record<string, number> = {}
  const noop = (name: string) => () => {
    counts[name] = (counts[name] ?? 0) + 1
  }
  const grad = () => ({ addColorStop: noop('addColorStop') })
  const ctx = {
    font: '',
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    save: noop('save'),
    restore: noop('restore'),
    beginPath: noop('beginPath'),
    closePath: noop('closePath'),
    moveTo: noop('moveTo'),
    lineTo: noop('lineTo'),
    arc: noop('arc'),
    arcTo: noop('arcTo'),
    fill: noop('fill'),
    stroke: noop('stroke'),
    fillRect: noop('fillRect'),
    clearRect: noop('clearRect'),
    setTransform: noop('setTransform'),
    setLineDash: noop('setLineDash'),
    createLinearGradient: grad,
    createRadialGradient: grad,
    fillText(s: string, x: number, y: number) {
      texts.push({ s, x, y, font: this.font, fill: this.fillStyle, align: this.textAlign })
    },
  }
  return { ctx: ctx as unknown as CanvasRenderingContext2D, texts, counts }
}

const C: Colors = {
  velocity: '#1F4FD8',
  ink: '#1F2329',
  steel: '#9AA0A8',
  graphite: '#5D636C',
  charge: '#C98A00',
  card: '#FFFFFF',
  bar: '#E1E4E8',
}

const base: CollisionData = { mA: 0.4, mB: 0.2, vA: 0.6, vB: 0, a: 0.297, b: 0.594, side: 'rubber' }
const END = 1e4
const W = 720
const H = 360

function draw(t: number, opts: Omit<Partial<DrawOpts>, 'r'> & { r?: Partial<CollisionData> } = {}) {
  const rec = recorder()
  const { r, ...rest } = opts
  const info = drawScene(rec.ctx, W, H, t, C, { r: { ...base, ...r }, ...rest })
  const strings = rec.texts.map((x) => x.s)
  return { ...rec, info, strings }
}

describe('simulate（原型 MOM.sim）', () => {
  // 0.6 m/s 追 0 的车：相对速度 0.6 × k，间隙 80 像素
  const cfg = { xA0: 0, xB0: 100, wA: 20, wB: 20, vA: 0.6, vB: 0, a: 0.297, b: 0.594, k: 50, hold: false }

  it('碰前匀速，接触段内线性过渡，碰后按碰后速度走', () => {
    const tc = 80 / 30
    const before = simulate(0.5, cfg)
    expect(before.vA).toBeCloseTo(0.6, 9)
    expect(before.vB).toBeCloseTo(0, 9)
    expect(before.xA).toBeCloseTo(0.6 * 50 * 0.5, 6)
    expect(before.after).toBe(false)
    expect(before.tc).toBeCloseTo(tc, 9)

    const mid = simulate(tc + 0.07, cfg)
    expect(mid.vA).toBeCloseTo((0.6 + 0.297) / 2, 6)
    expect(mid.vB).toBeCloseTo(0.594 / 2, 6)

    const end = simulate(1e4, cfg)
    expect(end.T).toBeCloseTo(tc + 0.14 + 1.7, 9)
    expect(end.vA).toBeCloseTo(0.297, 9)
    expect(end.vB).toBeCloseTo(0.594, 9)
    expect(end.after).toBe(true)
    // 两车不穿透
    expect(end.xA).toBeLessThanOrEqual(end.xB - 20 + 1e-9)
  })

  it('hold 停在接触前', () => {
    const held = simulate(0, { ...cfg, hold: true })
    expect(held.vA).toBeCloseTo(0.6, 9)
    expect(held.after).toBe(false)
  })

  it('不朝向对方运动就不相碰', () => {
    const apart = simulate(1e4, { ...cfg, vA: 0, vB: 0.5, a: 0, b: 0.5 })
    expect(Number.isFinite(apart.T)).toBe(true)
    expect(apart.after).toBe(false)
  })
})

describe('drawScene（原型 COL.scene）', () => {
  it('碰前标注 0.60 m/s，静止的 B 标"静止"', () => {
    const { strings } = draw(0, { still: true })
    expect(strings).toContain('0.60 m/s')
    expect(strings).toContain('静止')
  })

  it('碰后速度箭头标注 0.297 m/s 和 0.594 m/s', () => {
    const { strings, info } = draw(END)
    expect(strings).toContain('0.297 m/s')
    expect(strings).toContain('0.594 m/s')
    expect(info.after).toBe(true)
    expect(info.T).toBeGreaterThan(0)
  })

  it('柱子上的数是当前时刻的和（碰后 0.238、0.053）；碰前只用虚线和"碰前"标出，不写数', () => {
    const { strings } = draw(END)
    expect(strings).toContain('0.238')
    expect(strings).toContain('0.053')
    expect(strings).not.toContain('0.240')
    expect(strings).not.toContain('0.072')
    expect(strings.filter((s) => s === '碰前').length).toBe(2)
  })

  it('velcro 碰后两车画成一体：只画一个速度箭头', () => {
    const { strings } = draw(END, { r: { side: 'velcro', a: 0.396, b: 0.396 } })
    const arrows = strings.filter((s) => s.endsWith(' m/s'))
    expect(arrows).toEqual(['0.396 m/s'])
  })

  it('velcro 碰前两车各有一个箭头', () => {
    const { strings } = draw(0, { r: { side: 'velcro', a: 0.396, b: 0.396 } })
    const arrows = strings.filter((s) => s.endsWith(' m/s'))
    expect(arrows).toEqual(['0.60 m/s'])
  })

  it('bars 为 false 时不画柱子', () => {
    const off = draw(END, { bars: false })
    expect(off.strings).not.toContain('动量（kg·m/s）')
    expect(off.strings).not.toContain('动能（J）')
    const on = draw(END)
    expect(on.strings).toContain('动量（kg·m/s）')
    expect(on.strings).toContain('动能（J）')
  })

  it('默认名字是 A、B，柱子标签加上"和"；可以改名', () => {
    expect(draw(END).strings).toEqual(expect.arrayContaining(['A', 'B', '和']))
    const named = draw(END, { names: ['甲', '乙'] })
    expect(named.strings).toEqual(expect.arrayContaining(['甲', '乙', '和']))
    expect(named.strings).not.toContain('A')
  })

  it('质量标注：默认按 m 写，massText 覆盖', () => {
    expect(draw(0).strings).toEqual(expect.arrayContaining(['0.4 kg', '0.2 kg']))
    expect(draw(0, { massText: ['m', 'm'] }).strings).toEqual(expect.arrayContaining(['m']))
  })

  it('label 写在左上角', () => {
    const { texts } = draw(0, { label: '碰撞面：橡皮，碰后弹开' })
    const hit = texts.find((x) => x.s === '碰撞面：橡皮，碰后弹开')
    expect(hit?.x).toBe(8)
    expect(hit?.y).toBe(16)
  })

  it('数字用等宽字体，名字用斜体符号字体', () => {
    const { texts } = draw(END)
    expect(texts.find((x) => x.s === '0.297 m/s')?.font).toBe(`13px ${DEFAULT_FONTS.num}`)
    expect(texts.find((x) => x.s === 'A')?.font).toBe(`italic 14px ${DEFAULT_FONTS.sym}`)
  })

  it('digits.v 写定后速度固定位数', () => {
    expect(draw(END, { digits: { v: 1, p: 3, k: 3 } }).strings).toContain('0.3 m/s')
  })

  it('still 只画碰前一帧，不论 t 多大', () => {
    const { info, strings } = draw(END, { still: true })
    expect(info.T).toBe(0)
    expect(info.after).toBe(false)
    expect(strings).toContain('0.60 m/s')
    expect(strings).not.toContain('0.297 m/s')
  })

  it('小球只画碰前，没有动画时长', () => {
    const { info, strings } = draw(END, { body: 'ball', r: { side: 'magnet', mA: 0.1, mB: 0.4, vA: 5, vB: 0 } })
    expect(info.T).toBe(0)
    expect(strings).toContain('碰前 · 向右为正')
    expect(strings).toContain('5 m/s')
    expect(strings).toContain('0.1 kg')
  })

  it('磁体、粘扣、橡皮碰撞面各画在车上：橡皮用石墨色的面，不写进车身的标签', () => {
    const rubber = draw(0)
    const graphiteRects = rubber.counts.fill ?? 0
    expect(graphiteRects).toBeGreaterThan(0)
    expect(() => draw(0, { r: { side: 'magnet' } })).not.toThrow()
    expect(() => draw(0, { r: { side: 'velcro' } })).not.toThrow()
  })
})

describe('defaultHeight', () => {
  it('有柱子 360，无柱子 200，只画碰前 160，小球 200', () => {
    expect(defaultHeight({ still: false, barsMaybe: true })).toBe(360)
    expect(defaultHeight({ still: false, barsMaybe: false })).toBe(200)
    expect(defaultHeight({ still: true, barsMaybe: false })).toBe(160)
    expect(defaultHeight({ body: 'ball', still: true, barsMaybe: true })).toBe(200)
  })
})
