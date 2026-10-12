---
title: B+ 图元陈列
demo: true
---

改造中的基础图元，一张图看全。

<Figure title="桌面、斜面、物块、小车、墙、滑轮" height={340}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -1, xmax: 15, ymin: -0.8, ymax: 5.2, equal: true })
    v.ground(m, -0.6, 14.6, 0)
    v.wall(m, -0.6, 0, 3.2, { side: 'left' })
    v.incline(m, 0.4, 0, 4.6, 2.66, { angleLabel: 'θ' })
    v.block(m, 6.6, 0, 1.6, 1.0, { label: 'A' })
    v.block(m, 6.6, 1.0, 0.9, 0.6, {})
    v.cart(m, 8.6, 0, 3.0, undefined, { label: '小车' })
    v.pulley(m, 13.6, 2.4, 0.42, { mount: 3.6 })
    v.ground(m, 12.6, 14.6, 3.6, { side: 'above' })
    v.rope(m, [[11.6, 0.55], [13.6, 0.55], [14.02, 0.55], [14.02, 2.4]])
    v.ball(m, 2.3, 3.6, 0.32)
    const th = Math.atan2(2.66, 4.6), sAt = 0.55
    v.block(m, 0.4 + 4.6 * sAt, 2.66 * sAt, 1.1, 0.7, { angle: th * 180 / Math.PI, label: 'B' })
  },
})
</Figure>

<Figure title="轨道、光电门、导轨、极板" height={320}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.5, xmax: 15.5, ymin: -1.2, ymax: 4.6, equal: true })
    const tr = v.track(m, [{ line: [0, 3, 5, 0.6] }, { line: [5, 0.6, 9.5, 0.6] }], { marks: [{ x: 0, y: 3, label: 'A' }, { x: 5, y: 0.6, label: 'B' }] })
    v.block(m, 7.2, 0.6, 1.1, 0.55, { flag: 0.8 })
    v.photogate(m, 7.2, 1.55, 2.45, { blocked: true, post: 0.6 })
    v.rails(m, 10.5, 15, 3.4, 2.4)
    v.plates(m, 10.8, 14.6, 1.1, -0.6)
  },
})
</Figure>
