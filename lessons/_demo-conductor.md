---
title: 带电导体的电场
source: 内部演示
demo: true
---

有导体时按截面画（无限长导体、线电荷）。导体内部没有电场线，线从表面垂直出去，尖端和两端更密。不要用一串点电荷去凑导体的形状。

## 一、带电的长导体

孤立导体带正电。电场线垂直于表面离开，两端比中间密；等势线绕在外面，导体轮廓本身就是它的等势线。

<Figure title="长导体的电场线与等势线" height={320}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2.9, xmax: 2.9, ymin: -1.45, ymax: 1.45, equal: true })
    v.efield(m, [], {
      conductors: [{
        points: [[-1.15, -0.28], [-1.42, -0.16], [-1.52, 0], [-1.42, 0.16], [-1.15, 0.28], [0, 0.28], [1.15, 0.28], [1.42, 0.16], [1.52, 0], [1.42, -0.16], [1.15, -0.28], [0, -0.28]],
        q: 2,
        label: 'A',
      }],
      equipotentials: 5,
      density: 14,
    })
  },
})
</Figure>

## 二、尖端

「＜」形导体的外角最尖，表面电荷和电场线都挤在尖上，两侧直边稀得多。

<Figure title="尖端导体" height={340}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.45, xmax: 2.15, ymin: -1.25, ymax: 1.25, equal: true })
    v.efield(m, [], {
      conductors: [{
        points: [[0.05, 0], [1.55, 0.42], [1.55, 0.16], [0.62, 0], [1.55, -0.16], [1.55, -0.42]],
        q: 1,
      }],
      equipotentials: 4,
      density: 14,
    })
  },
})
</Figure>

## 三、中性导体靠近点电荷

导体不带电。靠近正电荷的一面感应出负电荷，电场线终止在那里；远处的一面感应出正电荷，电场线从那里发出。导体内场强为零。

<Figure title="点电荷旁的中性导体" height={320}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2.5, xmax: 2.1, ymin: -1.5, ymax: 1.5, equal: true })
    v.efield(m, [{ x: -1.65, y: 0, q: 1, label: 'q' }], {
      conductors: [{ points: [[-0.2, -0.62], [1.05, -0.62], [1.05, 0.62], [-0.2, 0.62]], label: '导体' }],
      equipotentials: 5,
      density: 12,
    })
  },
})
</Figure>

## 四、带孔的极板

两块电极板。下面那块不是一块整板，而是同一直线上的两段，中间留一条缝，缝就是孔。电场线从正极板垂直下来，靠近孔的弯进缝里，终止在孔的边缘。

<Figure title="平行极板，下板开孔" height={300}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2.4, xmax: 2.4, ymin: -1.35, ymax: 1.35, equal: true })
    v.efield(m, [], {
      conductors: [
        { line: [-1.7, 0.48, 1.7, 0.48], V: 1, label: '+' },
        { line: [-1.7, -0.48, -0.55, -0.48], V: -1, label: '−' },
        { line: [0.55, -0.48, 1.7, -0.48], V: -1 },
      ],
      equipotentials: 4,
      density: 16,
    })
  },
})
</Figure>
