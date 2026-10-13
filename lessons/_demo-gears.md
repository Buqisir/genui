---
title: 新器材样张
source: 器材样张
demo: true
---

新器材放在已定稿的滑轮、物块、小球、斜面、齿轮旁边，对照材质是否一致。

## 一、仪器盒与摸形

测试仪是带面板、屏幕和接线柱的壳体，和作为质量的物块不是同一件东西。摸形可以是任意三角形或梯形，最高的一条边受光。

<Figure title="仪器盒和摸形" height={340}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -4.4, xmax: 4.6, ymin: -0.7, ymax: 2.6, equal: true })
    v.ground(m, -4.4, 4.6, 0)
    v.box(m, -3.1, 0, 1.7, 1.05, { label: '测试仪', terminals: 2, display: true })
    v.block(m, -1.2, 0, 0.9, 0.7, { label: 'm' })
    v.box(m, 0.5, 0, 1.1, 0.8, { style: 'frame' })
    const w = v.wedge(m, [[1.7, 0], [4.2, 0], [4.2, 1.3]], { angleLabel: 'θ' })
    const seat = w.edges[2]
    const c = seat.at(0.45)
    v.block(m, c[0], c[1], 0.55, 0.4, { angle: Math.atan2(seat.dir[1], seat.dir[0]) * 180 / Math.PI, label: 'm' })
  },
})
</Figure>

## 二、斜二测板

长方体按斜二测画：正面实长，侧棱 45°、长度取一半。顶面最亮，剥面用半透明灰面，线圈贴在顶面上。

<Figure title="斜二测板和线圈" height={340}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -4.2, xmax: 4.6, ymin: -0.8, ymax: 2.8, equal: true })
    v.ground(m, -4.2, 4.6, 0)
    const s = v.slab(m, -3.6, 0, 2.4, 1.5, 1.6, { cut: true, loop: { r: 0.45 } })
    v.block(m, 0.2, 0, 0.8, 0.6)
    v.pulley(m, 1.5, 1.3, 0.4)
    v.ball(m, 2.6, 0.3, 0.25)
    const g = v.gear(m, 3.6, 0.7, 0.55, { teeth: 14 })
    v.gearMesh(m, g, 0.32, { dir: 200 })
  },
})
</Figure>

## 三、手与激光笔

手套用冷灰织物色，不另起一套颜色。激光笔是深色阳极壳，只有出光口一处用强调色。

<Figure title="手和激光笔" height={320}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -4.4, xmax: 4.6, ymin: -1.4, ymax: 2.2, equal: true })
    v.ground(m, -4.4, 4.6, 0)
    const beam = v.laser(m, -3.2, 1.2, -18, { on: true, length: 1.5, label: '激光笔' })
    v.hand(m, -1.2, 1.0, { dir: 'right' })
    v.hand(m, 0.5, 1.0, { dir: 'left' })
    v.hand(m, 2.0, 0.9, { dir: 'up' })
    v.hand(m, 3.4, 1.0, { dir: 'down' })
    v.incline(m, -4.2, 0, 1.6, 0.9)
    v.ball(m, beam.aperture[0] + 1.6, 0.3, 0.2)
  },
})
</Figure>

## 四、小尺寸

情景图里器材常常很小。小尺寸时省掉面板和螺丝，只留外形和材质。

<Figure title="小尺寸" height={220}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -4.6, xmax: 4.6, ymin: -1, ymax: 1.2, equal: true })
    v.box(m, -3.8, -0.4, 0.7, 0.5, { terminals: 2 })
    v.wedge(m, [[-2.9, -0.4], [-1.9, -0.4], [-1.9, 0.2]])
    v.slab(m, -1.5, -0.4, 0.9, 0.6, 0.6, { loop: true })
    v.hand(m, 0.4, 0.1, { dir: 'up', size: 22 })
    v.laser(m, 2.2, 0.2, 12, { on: true, length: 0.8 })
    v.block(m, 3.6, -0.4, 0.5, 0.4)
    v.ball(m, 4.3, -0.2, 0.16)
  },
})
</Figure>
