---
id: fx-slope
title: 斜面下滑
question: 物块从光滑斜面顶端由静止滑下，到底端时速度 v 多大？
answers:
  - { name: v, value: 7.746 }
---

光滑斜面高 3 m，取 g = 10 m/s²。

<Param name="h" label="高度" min={1} max={10} step={1} value={3} unit="m" />
<Define name="v" label="末速度" unit="m/s" />

<Figure title="斜面" height={200} params={["h"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -1, xmax: 5, ymin: -1, ymax: 4 })
  },
})
</Figure>
