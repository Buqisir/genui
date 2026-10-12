---
title: 几何光学
demo: true
---

折射、全反射和色散的光路由 `<Optics>` 算出，画面用 `v.optics` 画。拖动入射角，看半圆砖从折射变成全反射。

<Param name="i" label="入射角 i" min={0} max={70} step={1} value={30} unit="°" />

<Optics
  name="lt"
  media={[{ name: "glass", n: 1.5, label: "玻璃", shape: { cx: 0, cy: 0, r: 2, from: 180, to: 360 } }]}
  rays={[{ name: "a", from: ["2.6*cos(deg(270-i))", "2.6*sin(deg(270-i))"], angle: "90-i", color: "red" }]}
/>

<Readout items={[
  { label: "临界角", expr: "lt.glass.C", unit: "°", digits: 1 },
  { label: "平边入射角", expr: "lt.a.i[2]", unit: "°", digits: 1 },
  { label: "平边折射角", expr: "lt.a.r[2]", unit: "°", digits: 1 },
  { label: "全反射次数", expr: "lt.a.tir", digits: 0 },
  { label: "出射方向", expr: "lt.a.exitAngle", unit: "°", digits: 1 },
]} />

<Figure title="半圆形玻璃砖" height={300} params={["lt", "i"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -3, xmax: 3, ymin: -3, ymax: 1.6, equal: true })
    v.optics(m, p.lt, { normals: true, angles: true })
  },
})
</Figure>

<Optics
  name="prism"
  media={[{ name: "g", n: 1.5, label: "棱镜", shape: { points: [[0, 0], [3, 0], [1.5, 2.6]] } }]}
  rays={[
    { name: "red", from: [-1.5, 0.4], angle: 20, color: "red" },
    { name: "violet", from: [-1.5, 0.4], angle: 20, color: "violet", n: { g: 1.6 } },
  ]}
/>

<Readout items={[
  { label: "红光偏向角", expr: "20 - prism.red.exitAngle", unit: "°", digits: 1 },
  { label: "紫光偏向角", expr: "20 - prism.violet.exitAngle", unit: "°", digits: 1 },
]} />

<Figure title="棱镜色散" height={280} params={["prism"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -1.8, xmax: 5.5, ymin: -1.6, ymax: 3, equal: true })
    v.optics(m, p.prism, { labels: true })
  },
})
</Figure>

<Optics
  name="fiber"
  media={[{ name: "core", n: 1.5, label: "纤芯", shape: { xmin: 0, xmax: 12, ymin: 0, ymax: 1 } }]}
  rays={[{ name: "a", from: [-0.8, 0.25], angle: 25, color: "green" }]}
/>

<Figure title="光纤" height={180} params={["fiber"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -1.5, xmax: 13.5, ymin: -0.7, ymax: 1.7 })
    v.optics(m, p.fiber)
  },
})
</Figure>
