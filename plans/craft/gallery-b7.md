---
title: B+ 批次 7 陈列
demo: true
---

批次 7 补齐的实物，演示课件里没有覆盖到的放在这里。

<Figure title="尺、弹簧、导体棒、导线截面" height={300}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.5, xmax: 10.5, ymin: -1.4, ymax: 3.2, equal: true })
    v.ground(m, -0.3, 10.3, 0)
    v.ruler(m, 0, 5, -0.7, { step: 1, minor: 0.2, unit: 'cm' })
    v.wall(m, -0.3, 0, 2.6, { side: 'left' })
    v.spring(m, -0.3, 0.5, 2.6, 0.5, { coils: 9 })
    v.block(m, 2.6, 0, 1.2, 1.0, { label: 'A' })
    v.bar(m, 5.6, 0.2, 5.6, 2.6, { label: 'ab' })
    v.bar(m, 6.6, 1.6, 9.8, 1.6, {})
    v.wire(m, 8.2, 0.6, { dir: 'out', label: 'I' })
  },
})
</Figure>

<Figure title="行星、卫星" height={300}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -3, xmax: 3, ymin: -1.6, ymax: 1.6, equal: true })
    v.orbit(m, 0, 0, 2.2, 1.2, {})
    v.planet(m, 0, 0, 0.62, { label: '地球' })
    v.satellite(m, 2.2, 0, { angle: 90 })
    v.satellite(m, -1.1, 1.04, { angle: 200 })
  },
})
</Figure>

<Figure title="汽缸、管子" height={300}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.5, xmax: 10.5, ymin: -0.6, ymax: 4.4, equal: true })
    v.cylinder(m, 0.4, 0.2, 3.0, 3.8, 2.4, { molecules: 18 })
    v.tube(m, { x: 4.6, y: 1.6, angle: 0, sections: [{ from: 0, to: 2.6, r: 0.6 }, { from: 2.6, to: 5.4, r: 0.38 }],
      pistons: [{ at: 1.2, label: 'A' }, { at: 3.9, label: 'B' }], rod: true, gas: { from: 1.2, to: 3.9, count: 16 } })
  },
})
</Figure>
