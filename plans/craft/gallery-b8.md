---
title: B+ 批次 8 陈列
demo: true
---

批次 8 收尾的实物：可拆变压器、弹簧、传送带、带电小球。

<Figure title="可拆变压器（横梁取下 / 装上）" height={340}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -8.4, xmax: 8.4, ymin: -1.85, ymax: 1.85, equal: true })
    v.transformer(m, -4.2, -0.05, { style: 'lab', yoke: false, n1: 200, n2: 800, taps1: [0, 100, 200, 400], taps2: [0, 200, 800, 1400] })
    v.transformer(m, 4.2, -0.05, { style: 'lab', yoke: true, n1: 100, n2: 1400, taps1: [0, 100, 200, 400], taps2: [0, 200, 800, 1400] })
  },
})
</Figure>

<Figure title="弹簧、传送带、带电小球" height={300}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.5, xmax: 10.5, ymin: -1.2, ymax: 3.2, equal: true })
    v.ground(m, -0.3, 4.6, 0)
    v.wall(m, -0.3, 0, 2.4, { side: 'left' })
    v.spring(m, -0.3, 0.5, 2.4, 0.5, { coils: 9 })
    v.block(m, 2.4, 0, 1.2, 1.0, { label: 'A' })
    v.spring(m, 0.6, 2.6, 3.8, 2.6, { coils: 12, color: 'force' })
    v.conveyor(m, 5.4, 1.6, 4.6, { speed: 0 })
    v.ball(m, 6.4, 0.2, 0.3, { charge: true, label: '+q' })
    v.ball(m, 8.0, 0.2, 0.18, { charge: true })
    v.ball(m, 9.4, 0.2, 0.3, {})
  },
})
</Figure>
