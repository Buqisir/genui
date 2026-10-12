---
title: 变截面容器、有限波列与实测拟合
source: 内部演示（图改编自 2024–2026 浙江；U–I 数据为 2025 浙江测电动势）
demo: true
---

体积和截面积不从轮廓量，写在下面的 Define 里。波前、叠加和拟合直线由组件算。

## 一、圆底烧瓶里的汞柱

导热烧瓶用汞柱封住理想气体，压强不变，所以 V/T 不变。球泡体积 V₀ 和细管截面积 S 是题目给的，不是从图上量的。

<Param name="T" label="温度 T" min={270} max={370} step={1} value={300} unit="K" />
<Define name="V0" expr="8" />
<Define name="S" expr="1" />
<Define name="h0" expr="1.15" />
<Define name="T0" expr="300" />
<Define name="h" expr="(V0/S + h0)*T/T0 - V0/S" />

<Figure title="圆底烧瓶（示意，不按比例）" height={380} params={["h"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.5, xmax: 3.7, ymin: -0.15, ymax: 8.2, equal: true, pad: 16 })
    const cx = 1.55
    const cy = 1.7
    const r = 1.42
    const nw = 0.34
    const neck0 = cy + r
    const yb = neck0 + p.h
    const g = v.vessel(m, [
      { flask: { cx: cx, cy: cy, r: r, neck: { w: nw, h: 4.35 }, open: true } },
    ], {
      fills: [
        { x1: cx - r, y1: cy - r, x2: cx + r, y2: neck0, kind: 'gas', count: 32, density: 0.7 },
        { x1: cx - nw / 2, y1: yb, x2: cx + nw / 2, y2: yb + 0.42, kind: 'mercury', meniscus: 'top' },
      ],
    })
    v.ground(m, -0.3, 3.4, cy - r)
    if (g.mouth) v.label(m, g.mouth.x + 0.05, g.mouth.y, '管口', { place: 'right' })
  },
})
</Figure>

<Readout items={[
  { label: "汞柱下端高度 h", expr: "h", unit: "cm", digits: 2 },
]} />

## 二、毛细管

水浸润，液面下凹，管内液面比外面高；汞不浸润，液面上凸，管内液面比外面低。高度差都按 h ∝ 1/d 写在 Define 里。

<Param name="d" label="管内径 d" min={0.16} max={0.4} step={0.01} value={0.22} />
<Define name="hW" expr="0.62/d" />
<Define name="hHg" expr="0.1/d" />

<Figure title="水在管内上升、汞在管内下降" height={340} params={["d", "hW", "hHg"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.2, xmax: 6.4, ymin: -0.15, ymax: 5.6, equal: true, pad: 14 })
    const w = p.d
    // Dish and tube are separate vessels: the tube is dipped in, not joined to the dish, so its wall stays visible below the surface.
    v.vessel(m, [{ x1: 0.25, y1: 0.15, x2: 2.35, y2: 1.05, open: 'top' }], { fills: [{ x1: 0.25, y1: 0.15, x2: 2.35, y2: 1.05, kind: 'water' }] })
    v.vessel(m, [{ x1: 3.55, y1: 0.15, x2: 5.65, y2: 1.05, open: 'top' }], { fills: [{ x1: 3.55, y1: 0.15, x2: 5.65, y2: 1.05, kind: 'mercury' }] })
    v.vessel(m, [
      { capillary: { x: 1.3, y1: 0.35, y2: 5.15, w: w } },
      { capillary: { x: 4.6, y1: 0.35, y2: 5.15, w: w } },
    ], {
      fills: [
        { x1: 1.3 - w / 2, y1: 0.2, x2: 1.3 + w / 2, y2: 1.05 + p.hW, kind: 'water', meniscus: 'top' },
        { x1: 4.6 - w / 2, y1: 0.2, x2: 4.6 + w / 2, y2: 1.05 - p.hHg, kind: 'mercury', meniscus: 'top' },
      ],
    })
    v.label(m, 1.3, 5.25, '水', { place: 'above' })
    v.label(m, 4.6, 5.25, '汞', { place: 'above' })
  },
})
</Figure>

<Readout items={[
  { label: "水柱升高", expr: "hW", digits: 2 },
]} />

## 三、拔火罐

罐口扣在皮肤上，容积不变。降温后压强按查理定律变，分子数不变。

<Param name="tC" label="罐内温度 t" min={27} max={77} step={1} value={77} unit="°C" />
<Define name="p0" expr="1.05e5" />
<Define name="pJar" expr="p0*(tC+273)/(77+273)" />

<Figure title="倒扣的玻璃罐" height={280} params={["pJar", "p0"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.6, xmax: 5.2, ymin: -0.35, ymax: 2.7, equal: true, pad: 16 })
    v.ground(m, -0.4, 4.8, 0)
    const g = v.vessel(m, [
      { jar: { cx: 2.15, y: 0, r: 1.2, h: 2.05, open: 'bottom' } },
    ], {
      fills: [
        { x1: 0.95, y1: 0.02, x2: 3.35, y2: 2.0, kind: 'gas', count: 26, density: p.pJar / p.p0 },
      ],
    })
    if (g.mouth) v.label(m, g.mouth.x, -0.02, '皮肤', { place: 'below' })
  },
})
</Figure>

<Readout items={[
  { label: "罐内压强", expr: "pJar", unit: "Pa", digits: 0 },
]} />

## 四、抽掉隔板

左侧真空，右侧气体分子数固定。隔板抽掉后同一批分子铺进整个容器。

<Param name="open" label="隔板" value={0} options={[{label: "还在", value: 0}, {label: "抽掉", value: 1}]} />

<Figure title="自由膨胀" height={260} params={["open"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 8.3, ymin: 0, ymax: 4.1, equal: true, pad: 18 })
    const removed = p.open >= 1
    const gap = removed ? 0 : 0.36
    const mid = 4.15
    const xL = 0.4
    const xR = 7.9
    v.vessel(m, [
      { x1: xL, y1: 0.45, x2: mid - gap / 2, y2: 3.2 },
      { x1: mid + gap / 2, y1: 0.45, x2: xR, y2: 3.2 },
    ], {
      fills: [{
        x1: removed ? xL + 0.08 : mid + gap / 2 + 0.08,
        y1: 0.55,
        x2: xR - 0.08,
        y2: 3.08,
        kind: 'gas',
        count: 46,
        density: removed ? 0.5 : 1,
      }],
    })
    v.label(m, removed ? 4.1 : 2.1, 3.45, removed ? '气体充满' : '真空', { place: 'above' })
    if (!removed) v.label(m, 6.1, 3.45, '气体', { place: 'above' })
  },
})
</Figure>

## 五、两个脉冲

各由半个波长的鼓包组成，相向而行。同相叠加变高，反相在重叠处抵消。

<Param name="tw" label="时刻 t" min={0} max={6} step={0.05} value={3.5} unit="s" />
<Param name="anti" label="相位" value={0} options={[{label: "同相", value: 0}, {label: "反相", value: 1}]} />
<Preset label="同相相遇" set={{ tw: 3.5, anti: 0 }} />
<Preset label="反相抵消" set={{ tw: 3.5, anti: 1 }} />

<Figure title="两列脉冲" height={240} params={["tw", "anti"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.3, xmax: 6.7, ymin: -0.85, ymax: 1.05, pad: 18 })
    v.line(m, -0.1, 0, 6.5, 0, { color: v.color.steel, width: 1 })
    const amp = p.anti >= 1 ? -0.32 : 0.32
    v.waves(m, [
      { x: 0.2, v: 1, amp: 0.32, lambda: 2, dir: 1, start: 0, shape: 'pulse' },
      { x: 6.2, v: 1, amp: amp, lambda: 2, dir: -1, start: 0, shape: 'pulse' },
    ], -0.1, 6.5, { t: p.tw, sum: true, parts: true, dots: [1.2, 3.2, 5.2] })
  },
})
</Figure>

## 六、驻波

两列相向的正弦波列，波长同为 2。合成波在 x = 0.5、1.5、2.5… 处是波节。

<Param name="ts" label="时刻 t" min={0} max={12} step={0.05} value={8.25} unit="s" />

<Figure title="相向波列叠成驻波" height={240} params={["ts"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.4, xmax: 8.4, ymin: -0.75, ymax: 0.95, pad: 16 })
    v.line(m, -0.2, 0, 8.2, 0, { color: v.color.steel, width: 1 })
    // Both trains exist only on [0, 8]. Past either source the displacement steps; don't draw that.
    v.waves(m, [
      { x: 0, v: 1, amp: 0.26, lambda: 2, dir: 1, start: 0, shape: 'sine' },
      { x: 8, v: 1, amp: 0.26, lambda: 2, dir: -1, start: 0, shape: 'sine' },
    ], 0, 8, { t: p.ts, sum: true, parts: true, dots: [2, 2.5, 4] })
  },
})
</Figure>

## 七、U–I 拟合

2025 浙江测一节干电池。点是实测，直线是最小二乘：U = E − Ir，所以 E 是截距，r = −斜率。

<Plot
  title="干电池的 U–I 图线"
  caption="2025 浙江，五组实测；直线为最小二乘拟合"
  x={{name: "I", label: "I", unit: "A", min: 0, max: 0.6}}
  y={{label: "U", unit: "V", min: 1.0, max: 1.55}}
  series={[{
    label: "实测",
    points: [[0.14, 1.35], [0.22, 1.30], [0.30, 1.25], [0.37, 1.20], [0.45, 1.15]],
    marker: "dot",
    fit: "linear",
    color: "charge",
    read: {slope: "kUI", intercept: "E"}
  }]}
/>
<Define name="r" expr="-kUI" />

<Readout items={[
  { label: "电动势 E", expr: "E", unit: "V", digits: 2 },
  { label: "内阻 r", expr: "r", unit: "Ω", digits: 2 },
]} />
