import { buildRuntime } from '../sim/buildRuntime'
import { describe, expect, it } from 'vitest'
import { evaluate } from './expr'
import { opticsPayload, runOptics, type OpticsDraw } from './optics'
import { checkSim } from './simcheck'
import { validateLesson } from './validate'

const deg = (d: number) => (d * Math.PI) / 180
const toDeg = (r: number) => (r * 180) / Math.PI

function rayOf(props: Record<string, unknown>, name = 'a') {
  const run = runOptics(props, {})
  const lt = run.values.lt as Record<string, unknown>
  return { run, lt, ray: lt[name] as Record<string, unknown>, draw: lt.__optics as OpticsDraw }
}

describe('Optics ray tracing', () => {
  it('refracts through a flat slab and comes out parallel, shifted by t·sin(i−r)/cos r', () => {
    const t = 2
    const i = deg(30)
    const n = 1.5
    const r = Math.asin(Math.sin(i) / n)
    const shift = (t * Math.sin(i - r)) / Math.cos(r)
    const phi = deg(60)
    const { ray } = rayOf({
      name: 'lt',
      media: [{ name: 'glass', n, shape: { xmin: -8, xmax: 8, ymin: 0, ymax: t } }],
      rays: [{ name: 'a', from: [0, -1], angle: 60 }],
      length: 4,
    })
    const ii = ray.i as number[]
    const rr = ray.r as number[]
    expect(ii[0]).toBeCloseTo(30, 4)
    expect(rr[0]).toBeCloseTo(toDeg(r), 4)
    expect(ii[1]).toBeCloseTo(toDeg(r), 4)
    expect(rr[1]).toBeCloseTo(30, 4)
    expect(ray.exitAngle).toBeCloseTo(60, 4)
    expect(ray.kind).toEqual([1, 1])
    const D = { x: Math.cos(phi), y: Math.sin(phi) }
    const vx = (ray.exitX as number) - 0
    const vy = (ray.exitY as number) - -1
    expect(Math.abs(vx * D.y - vy * D.x)).toBeCloseTo(shift, 4)
    const approach = 1 / Math.sin(phi)
    const inside = t / Math.cos(r)
    expect(ray.opl).toBeCloseTo(approach + n * inside, 3)
    expect((ray.len as { glass: number }).glass).toBeCloseTo(inside, 3)
    expect(evaluate('lt.a.i[1]', { lt: rayOf({
      name: 'lt',
      media: [{ name: 'glass', n, shape: { xmin: -8, xmax: 8, ymin: 0, ymax: t } }],
      rays: [{ name: 'a', from: [0, -1], angle: 60 }],
    }).lt } as never)).toBeCloseTo(30, 4)
  })

  it('totally reflects a ray that meets the surface exactly at the critical angle', () => {
    for (const n of [1.33, 1.5, 1.73, 2]) {
      const C = toDeg(Math.asin(1 / n))
      const { ray } = rayOf({
        name: 'lt',
        length: 3,
        media: [{ name: 'glass', n, shape: { xmin: 0, xmax: 20, ymin: 0, ymax: 2 } }],
        rays: [{ name: 'a', from: [1, 0.2], angle: 90 - C }],
      })
      expect(ray.kind).toContain(2)
      expect(ray.tir).toBeGreaterThanOrEqual(1)
      const xs = ray.x as number[]
      const ys = ray.y as number[]
      // x, y list the hit points (not the start): up to the top face, then reflected down.
      expect(ys[0]).toBeCloseTo(2, 6)
      expect(xs[0]).toBeCloseTo(1 + 1.8 * Math.tan(deg(C)), 6)
      expect(ys[1]).toBeCloseTo(0, 6)
      expect(xs[1]).toBeCloseTo(xs[0] + 2 * Math.tan(deg(C)), 6)
    }
  })

  it('sends a centred ray through a semicircular brick, and totally reflects past the critical angle', () => {
    const brick = (inc: number) => {
      const theta = deg(270 - inc)
      const R = 2
      return rayOf({
        name: 'lt',
        media: [{ name: 'glass', n: 1.5, shape: { cx: 0, cy: 0, r: R, from: 180, to: 360 } }],
        rays: [{ name: 'a', from: [(R + 0.6) * Math.cos(theta), (R + 0.6) * Math.sin(theta)], angle: 90 - inc }],
        length: 3,
      })
    }
    const straight = brick(0)
    expect(straight.ray.hits).toBe(2)
    expect((straight.ray.i as number[])[0]).toBeCloseTo(0, 3)
    expect((straight.ray.r as number[])[0]).toBeCloseTo(0, 3)
    expect(straight.ray.exitAngle).toBeCloseTo(90, 3)
    expect(straight.ray.tir).toBe(0)

    const below = brick(30)
    const r = toDeg(Math.asin(1.5 * Math.sin(deg(30))))
    expect((below.ray.i as number[])[0]).toBeCloseTo(0, 3)
    expect((below.ray.r as number[])[0]).toBeCloseTo(0, 3)
    expect((below.ray.i as number[])[1]).toBeCloseTo(30, 3)
    expect((below.ray.r as number[])[1]).toBeCloseTo(r, 3)
    expect(below.ray.exitAngle).toBeCloseTo(90 - r, 3)
    expect(below.ray.tir).toBe(0)
    expect(below.ray.hits).toBe(2)

    const past = brick(50)
    expect(past.ray.tir).toBe(1)
    expect(past.ray.kind).toEqual([1, 2, 1])
    expect((past.ray.r as number[])[1]).toBeNaN()
    expect((past.ray.i as number[])[1]).toBeCloseTo(50, 3)
    expect(past.ray.exitAngle).toBeCloseTo(-(90 - 50), 3)
    expect(past.ray.hits).toBe(3)
  })

  it('publishes the critical angle against the surroundings', () => {
    const { lt } = rayOf({
      name: 'lt',
      n0: 1,
      media: [
        { name: 'glass', n: 1.5, shape: { cx: 0, cy: 0, r: 1 } },
        { name: 'air', n: 1, shape: { cx: 3, cy: 0, r: 0.2 } },
      ],
      rays: [{ name: 'a', from: [-2, 0.2], angle: 0 }],
    })
    expect((lt.glass as { C: number }).C).toBeCloseTo(toDeg(Math.asin(1 / 1.5)), 5)
    expect((lt.air as { C: number }).C).toBeNaN()
  })

  it('reflects in an isosceles right prism with a silvered hypotenuse', () => {
    const { ray } = rayOf({
      name: 'lt',
      media: [{ name: 'prism', n: 1.5, shape: { points: [[0, 0], [2, 0], [0, 2]] }, mirror: [1] }],
      rays: [{ name: 'a', from: [-1, 1], angle: 0 }],
      length: 2,
    })
    expect(ray.kind).toEqual([1, 3, 1])
    const xs = ray.x as number[]
    const ys = ray.y as number[]
    expect(xs[0]).toBeCloseTo(0, 4)
    expect(ys[0]).toBeCloseTo(1, 4)
    expect(xs[1]).toBeCloseTo(1, 4)
    expect(ys[1]).toBeCloseTo(1, 4)
    expect(xs[2]).toBeCloseTo(1, 4)
    expect(ys[2]).toBeCloseTo(0, 4)
    expect(ray.exitAngle).toBeCloseTo(-90, 4)
    expect((ray.r as number[])[1]).toBeNaN()
  })

  it('guides a ray down a fibre with many reflections and sends it out at the entry angle', () => {
    const n = 1.5
    const beta = deg(30)
    const alpha = Math.asin(Math.sin(beta) / n)
    const h = 1
    const L = 30
    const y0 = 0.35
    const yStart = y0 - Math.tan(beta)
    let y = y0
    let dir = 1
    let x = 0
    let bounces = 0
    let sign = 1
    while (x < L - 1e-9) {
      const wall = dir > 0 ? h : 0
      const dx = Math.abs(wall - y) / Math.tan(alpha)
      if (x + dx >= L - 1e-9) {
        sign = dir
        break
      }
      x += dx
      y = wall
      dir = -dir
      bounces++
    }
    expect(bounces).toBeGreaterThan(6)
    const { ray } = rayOf({
      name: 'lt',
      media: [{ name: 'core', n, shape: { xmin: 0, xmax: L, ymin: 0, ymax: h } }],
      rays: [{ name: 'a', from: [-1, yStart], angle: 30 }],
      length: 2,
    })
    expect(ray.hits as number).toBeGreaterThan(bounces)
    expect(ray.tir as number).toBe(bounces)
    expect((ray.x as number[])[(ray.x as number[]).length - 1]).toBeCloseTo(L, 3)
    expect(ray.exitAngle).toBeCloseTo(sign * 30, 3)
  })

  it('disperses two rays: the larger index bends more', () => {
    const props = (nv: number, name: string) => ({
      name: 'lt',
      media: [{ name: 'prism', n: 1.5, shape: { points: [[0, 0], [0, 4], [0.8, 2]] } }],
      rays: [{ name, from: [-1, 1], angle: 0, ...(nv === 1.5 ? {} : { n: { prism: nv } }) }],
      length: 3,
    })
    const red = rayOf(props(1.5, 'red'), 'red')
    const violet = rayOf(props(1.8, 'violet'), 'violet')
    expect(red.ray.exitAngle).not.toBeCloseTo(violet.ray.exitAngle as number, 2)
    expect(Math.abs(violet.ray.exitAngle as number)).toBeGreaterThan(Math.abs(red.ray.exitAngle as number))
    expect(red.ray.kind).toEqual([1, 1])
    expect(violet.ray.kind).toEqual([1, 1])
  })

  it('totally reflects off an air bubble inside water when the hit is steep enough', () => {
    const { ray, lt } = rayOf({
      name: 'lt',
      media: [
        { name: 'water', n: 1.33, shape: { cx: 0, cy: 0, r: 2 } },
        { name: 'bubble', n: 1, shape: { cx: 0, cy: 0, r: 0.6 } },
      ],
      rays: [{ name: 'a', from: [-1.5, 0.55], angle: 0 }],
    })
    expect(ray.kind).toContain(2)
    expect((ray.kind as number[])[0]).toBe(2)
    expect(ray.tir).toBeGreaterThanOrEqual(1)
    expect((lt.bubble as { C: number }).C).toBeNaN()
  })

  it('splits intensity by the Fresnel reflectance at normal incidence', () => {
    const n = 1.5
    const R = ((n - 1) / (n + 1)) ** 2
    const { ray, draw } = rayOf({
      name: 'lt',
      reflections: 1,
      media: [{ name: 'glass', n, shape: { xmin: -2, xmax: 2, ymin: 0, ymax: 2 } }],
      rays: [{ name: 'a', from: [0, -1], angle: 90 }],
    })
    expect(R).toBeCloseTo(0.04, 8)
    expect(ray.I).toBeCloseTo((1 - R) ** 2, 5)
    const branches = draw.rays[0].segments.filter((s) => s.branch)
    expect(branches.length).toBeGreaterThan(0)
    expect(Math.max(...branches.map((s) => s.I))).toBeCloseTo(R, 5)
  })

  it('totally reflects at the inner surface of an air film', () => {
    const { ray } = rayOf({
      name: 'lt',
      media: [
        { name: 'glass', n: 1.5, shape: { cx: 0, cy: 0, r: 3 } },
        { name: 'film', n: 1, shape: { cx: 0, cy: 0, r: 2, inner: 1, from: 0, to: 180 } },
      ],
      rays: [{ name: 'a', from: [-0.2, 0.85], angle: 0 }],
    })
    expect((ray.kind as number[])[0]).toBe(2)
    expect(ray.tir).toBeGreaterThanOrEqual(1)
  })

  it('rotates a prism and does not loop when a ray hits a corner', () => {
    const turned = rayOf({
      name: 'lt',
      media: [{ name: 'g', n: 1.5, shape: { points: [[0, 0], [2, 0], [0, 2]], rotate: 90, about: [0, 0] } }],
      rays: [{ name: 'a', from: [-0.5, -1], angle: 90 }],
      length: 2,
    })
    expect((turned.ray.x as number[])[0]).toBeCloseTo(-0.5, 4)
    expect((turned.ray.y as number[])[0]).toBeCloseTo(0, 4)

    const corner = rayOf({
      name: 'lt',
      media: [{ name: 'g', n: 1.5, shape: { points: [[0, 0], [2, 0], [2, 2], [0, 2]] } }],
      rays: [{ name: 'a', from: [-1, -1], angle: 45 }],
      length: 3,
    })
    expect(Number.isFinite(corner.ray.exitAngle as number)).toBe(true)
    expect(corner.ray.hits as number).toBeGreaterThan(0)
    expect(corner.ray.hits as number).toBeLessThan(15)
    expect(corner.run.warnings.join(' ')).not.toContain('maxHits')
  })
})

describe('Optics validator and payload', () => {
  const head = ['---', 'title: 光', 'demo: true', '---', ''].join('\n')

  it('rejects a bad shape, an unknown medium and a mirror index that does not exist', () => {
    const badShape = validateLesson(
      head + '<Optics name="lt" media={[{name: "g", n: 1.5, shape: {points: [[0, 0], [1, 0]]}}]} rays={[{name: "a", from: [0, 1], angle: -90}]} />\n',
    )
    expect(badShape.errors.map((e) => e.message).join('\n')).toContain('至少 3 个点')

    const badN = validateLesson(
      head + '<Optics name="lt" media={[{name: "g", n: 1.5, shape: {cx: 0, cy: 0, r: 1}}]} rays={[{name: "a", from: [-2, 0], angle: 0, n: {air: 1.2}}]} />\n',
    )
    expect(badN.errors.map((e) => e.message).join('\n')).toContain('不是已有介质')

    const badMirror = validateLesson(
      head + '<Optics name="lt" media={[{name: "g", n: 1.5, shape: {points: [[0, 0], [1, 0], [0, 1]]}, mirror: [5]}]} rays={[{name: "a", from: [-1, 0.2], angle: 0}]} />\n',
    )
    expect(badMirror.errors.map((e) => e.message).join('\n')).toContain('超出范围')
  })

  it('accepts a lesson, warns when a ray starts on a boundary or hits the cap, and clones the payload', () => {
    const ok = [
      head.trimEnd(),
      '<Param name="i" label="入射角" min={0} max={60} step={1} value={30} unit="°" />',
      '<Optics name="lt" media={[{name: "glass", n: 1.5, shape: {cx: 0, cy: 0, r: 2, from: 180, to: 360}}]} rays={[{name: "a", from: ["2.6*cos(deg(270-i))", "2.6*sin(deg(270-i))"], angle: "90-i", color: "red"}]} />',
      '<Figure title="半圆砖" height={240} params={["lt", "i"]}>',
      'figure({ draw(ctx, p, v) {',
      '  const m = v.view({ xmin: -3, xmax: 3, ymin: -3, ymax: 1.5, equal: true })',
      '  v.optics(m, p.lt, { normals: true, angles: true, labels: true })',
      '} })',
      '</Figure>',
      '',
    ].join('\n')
    const result = validateLesson(ok)
    expect(result.errors).toEqual([])

    const onEdge = validateLesson(
      head + '<Optics name="lt" media={[{name: "g", n: 1.5, shape: {xmin: 0, xmax: 2, ymin: 0, ymax: 1}}]} rays={[{name: "a", from: [0, 0.5], angle: 0}]} />\n',
    )
    expect(onEdge.errors).toEqual([])
    expect(onEdge.warnings.map((w) => w.message).join('\n')).toContain('界面')

    const capped = validateLesson(
      head + '<Optics name="lt" maxHits={3} media={[{name: "g", n: 1.5, shape: {xmin: 0, xmax: 20, ymin: 0, ymax: 1}}]} rays={[{name: "a", from: [-1, 0.2], angle: 20}]} />\n',
    )
    expect(capped.warnings.map((w) => w.message).join('\n')).toContain('maxHits')

    const { lt, draw } = rayOf({
      name: 'lt',
      media: [{ name: 'glass', n: 1.5, shape: { cx: 0, cy: 0, r: 1 } }],
      rays: [{ name: 'a', from: [-2, 0.2], angle: 0 }],
    })
    expect(Object.keys(lt)).not.toContain('__optics')
    expect(draw.rays.length).toBe(1)
    expect(draw.media.length).toBe(1)
    const plain = opticsPayload(lt) as { __optics: OpticsDraw }
    const cloned = structuredClone(plain)
    expect(cloned.__optics.rays[0].segments.length).toBeGreaterThan(0)
    expect(structuredClone(lt).__optics).toBeUndefined()
    expect(() => structuredClone(draw)).not.toThrow()

    const runtime = buildRuntime()
    const body = 'figure({ draw(ctx, p, v) { const m = v.view({ xmin: -3, xmax: 3, ymin: -3, ymax: 2, equal: true }); v.optics(m, p.lt, { normals: true, angles: true }) } })'
    const checked = checkSim(body, runtime, [{ label: '初始', params: { lt: plain }, times: [0] }])
    expect(checked.errors).toEqual([])
  })
})
