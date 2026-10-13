---
id: r6-01-mercury-tubes
title: 三管连通：缓慢注入水银与气体压缩
subject: physics
topic: 等温变化与液体压强
source: 2021 全国乙卷
question: |
  （2021·全国乙卷）一玻璃装置放在水平桌面上，竖直玻璃管 A、B、C 粗细均匀，A、B 两管的上端封闭，C 管上端开口，三管的下端在同一水平面内且相互连通（连通部分的体积不计）。A、B 两管的长度分别为 l₁=13.5 cm、l₂=32 cm。开始时三管内都没有水银，A、B 两管内是压强等于大气压的空气。将水银从 C 管缓慢注入，直至 B、C 两管内水银柱的高度差 h=5 cm。已知外界大气压 p₀=75 cmHg，整个过程温度不变。求：
  (1) A、B 两管内水银柱的高度各为多少；
  (2) A、B 两管内水银柱的高度差。
answers:
  - { name: pB, value: 80, unit: cmHg }
  - { name: yB, value: 2, unit: cm }
  - { name: yC, value: 7, unit: cm }
  - { name: yA, value: 1, unit: cm }
  - { name: pA, value: 81, unit: cmHg }
  - { name: delta, value: 1, unit: cm }
---

## 一、题目条件分析

设 A、B、C 管内水银柱高度分别为 $x_A、x_B、x_C$，均从三管共同的底面量起。

- A、B 管上端封闭，水银上升使各自的空气柱缩短、压强增大。
- C 管上端开口，水银液面上方压强始终为 $p_0$。
- 缓慢注入，水银在各状态下近似静止；连通水银在同一高度处压强相等。
- 温度不变，A、B 管内空气分别满足玻意耳定律 $pV=\text{常量}$。

因此，C 管液面高于 A、B 管液面，题给高度差为

$$
\boxed{x_C-x_B=h=5\ \text{cm}}.
$$

各管的截面积恒定，在各自的等温方程中可以约去。**题目并未说明三管截面积相等，也不需要这一条件。**

下文高度以 cm 表示，压强以 cmHg 表示。高度为 $d\ \text{cm}$ 的水银柱对应压强差 $d\ \text{cmHg}$，所以压强方程中的数值可以直接相加。

## 二、完整解答

### （1）先求 B 管内水银柱高度

在 B 管液面所在的水平面比较水银压强：

$$
p_B=p_0+(x_C-x_B)=75+5
=\boxed{80\ \text{cmHg}}.
$$

B 管初始空气柱长为 $l_2=32\ \text{cm}$，末态空气柱长为 $l_2-x_B$。等温变化给出

$$
p_0l_2=p_B(l_2-x_B).
$$

代入数据：

$$
75\times32=80(32-x_B),
$$

$$
\boxed{x_B=2\ \text{cm}}.
$$

于是 C 管内水银柱高度为

$$
x_C=x_B+h=2+5=\boxed{7\ \text{cm}}.
$$

### 再求 A 管内水银柱高度

比较 A、C 两管在 A 管液面所在水平面的压强：

$$
p_A=75+(7-x_A)=82-x_A.
$$

A 管内空气发生等温变化：

$$
p_0l_1=p_A(l_1-x_A),
$$

$$
75\times13.5=(82-x_A)(13.5-x_A).
$$

整理得

$$
x_A^2-95.5x_A+94.5=0,
$$

$$
(x_A-1)(x_A-94.5)=0.
$$

因为 $0\le x_A<13.5\ \text{cm}$，舍去 $94.5\ \text{cm}$，得到

$$
\boxed{x_A=1\ \text{cm}}.
$$

此时 A 管内空气压强为

$$
p_A=75+(7-1)=\boxed{81\ \text{cmHg}}.
$$

### （2）两管水银柱的高度差

B 管液面比 A 管液面高：

$$
\Delta x=x_B-x_A=2-1=\boxed{1\ \text{cm}}.
$$

可以用共同底面处的压强核对：

$$
p_A+x_A=81+1=82,
$$

$$
p_B+x_B=80+2=82,
$$

$$
p_0+x_C=75+7=82.
$$

三者均对应 $82\ \text{cmHg}$，满足连通水银的静力平衡。

> **易错点：**相等的是同一高度处的水银压强，不是 A、B 管内空气压强。A、B 液面不在同一高度，末态空气压强分别为 81 cmHg 和 80 cmHg。

## 三、交互演示

拖动 $h=x_C-x_B$，观察从开始注入到题目末态的准静态过程。这里的 $h$ 是液面高度差，**不是时间，也不是注入水银的体积**。

其他液面高度由等温变化和液体压强关系自动计算，不能独立拖动。

<Param name="l1" label="A 管长度" value={13.5} min={13.5} max={13.5} step={0.1} unit="cm" hidden={true} />

<Param name="l2" label="B 管长度" value={32} min={32} max={32} step={1} unit="cm" hidden={true} />

<Param name="p0" label="大气压" value={75} min={75} max={75} step={1} unit="cmHg" hidden={true} />

<Param name="h" label="C、B 管液面高度差 h" value={5} min={0} max={5} step={0.05} unit="cm" />

<Define name="pB" expr="p0 + h" />

<Define name="yB" expr="l2 * h / (p0 + h)" />

<Define name="yC" expr="yB + h" />

<Define name="coefA" expr="p0 + yC + l1" />

<Define name="yA" expr="2 * l1 * yC / (coefA + sqrt(coefA^2 - 4 * l1 * yC))" />

<Define name="pA" expr="p0 + yC - yA" />

<Define name="airA" expr="l1 - yA" />

<Define name="airB" expr="l2 - yB" />

<Define name="delta" expr="yB - yA" />

<Define name="pBottom" expr="p0 + yC" />

<Preset label="开始：尚未注入" set={{h: 0}} />

<Preset label="中间状态：h = 2.5 cm" set={{h: 2.5}} />

<Preset label="题目答案：h = 5 cm" set={{h: 5}} />

<Status cases={[
  {when: "abs(h - 5) < 1e-6", label: "题目末态：A 为 1 cm，B 为 2 cm", tone: "success"},
  {when: "abs(h) < 1e-6", label: "初始状态：两管空气压强均为大气压", tone: "neutral"},
  {label: "缓慢注入：空气等温压缩，C 管液面最高", tone: "info"}
]} />

下图 A、B 管顶端高度按题目数值绘制。**示意图不按比例：管宽及横向间距仅用于区分三管；C 管长度未给出，其开口位置仅为示意。**

<Figure
  title="装置全貌：封闭空气与连通水银"
  height={440}
  params={["l1", "l2", "h", "yA", "yB", "yC", "pA", "pB", "p0"]}
>
figure({
  draw(ctx, p, v) {
    // Widths and spacing are schematic (the problem gives only heights), so x is stretched.
    const m = v.view({ xmin: -9, xmax: 30, ymin: -3, ymax: 37, pad: 18 })
    const X = { A: 0, B: 10, C: 20 }
    const r = 1.3
    const hg = (x, level) => ({ x1: x - r, y1: 0, x2: x + r, y2: level, meniscus: 'top' })
    // Same number of molecules as at the start, so the dots crowd as the air is squeezed.
    const fills = [
      { x1: X.A - r, y1: p.yA, x2: X.A + r, y2: p.l1, kind: 'gas', count: 30, density: p.pA / p.p0 },
      { x1: X.B - r, y1: p.yB, x2: X.B + r, y2: p.l2, kind: 'gas', count: 70, density: p.pB / p.p0 },
    ]
    if (p.yC > 0.01) {
      fills.push({ x1: X.A - r, y1: -1.2, x2: X.C + r, y2: 0 }, hg(X.A, p.yA), hg(X.B, p.yB), hg(X.C, p.yC))
    }
    v.vessel(m, [
      { x1: X.A - r, y1: 0, x2: X.A + r, y2: p.l1 },
      { x1: X.B - r, y1: 0, x2: X.B + r, y2: p.l2 },
      { x1: X.C - r, y1: 0, x2: X.C + r, y2: 34, open: 'top' },
      { x1: X.A - r, y1: -1.2, x2: X.C + r, y2: 0 },
    ], { fills })
    v.ground(m, -8, 29, -1.75)

    v.text(m, X.A, p.l1 + 1.6, 'A', { size: 15, weight: 600, color: v.color.ink })
    v.text(m, X.B, p.l2 + 1.6, 'B', { size: 15, weight: 600, color: v.color.ink })
    v.text(m, X.C, 35.4, 'C（开口）', { size: 13, color: v.color.ink })
    v.label(m, X.A + r, (p.l1 + p.yA) / 2, 'p_A = ' + p.pA.toFixed(1) + ' cmHg', { place: 'right', size: 12, background: false })
    v.label(m, X.B + r, (p.l2 + p.yB) / 2, 'p_B = ' + p.pB.toFixed(1) + ' cmHg', { place: 'right', size: 12, background: false })
    v.label(m, X.C + r, 28, 'p₀ = 75 cmHg', { place: 'right', size: 12, color: v.color.graphite, background: false })
    v.dim(m, X.A - r - 2, 0, X.A - r - 2, p.l1, '', { offset: 0 })
    v.text(m, X.A - r - 2.6, p.l1 / 2, '13.5 cm', { size: 12, color: v.color.graphite, align: 'right' })
    v.dim(m, X.B - r - 2, 0, X.B - r - 2, p.l2, '', { offset: 0 })
    v.text(m, X.B - r - 2.6, p.l2 * 0.62, '32 cm', { size: 12, color: v.color.graphite, align: 'right' })
    if (p.h > 0.05) {
      v.line(m, X.B + r, p.yB, X.C + r + 3, p.yB, { color: v.color.steel, width: 1, dash: [3, 3] })
      v.dim(m, X.C + r + 3, p.yB, X.C + r + 3, p.yC, '', { offset: 0 })
      v.text(m, X.C + r + 3.6, (p.yB + p.yC) / 2, 'h = ' + p.h.toFixed(1) + ' cm', { size: 12, color: v.color.graphite, align: 'left' })
    }
  },
})
</Figure>

下面放大液面附近，方便比较高度。A、B 管上部和封闭顶端省略；C 管上部及开口省略。管宽和横向间距不按比例，三个液面高度使用统一的纵向尺度。

<Figure
  title="液面局部放大：同一高度处水银压强相等"
  height={300}
  params={["h", "yA", "yB", "yC", "pBottom"]}
>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -4, xmax: 19, ymin: -1.9, ymax: 10, pad: 18 })
    const tubes = [
      { x: 0, level: p.yA, name: 'A' },
      { x: 6, level: p.yB, name: 'B' },
      { x: 12, level: p.yC, name: 'C' },
    ]
    const fills = tubes.map((tb) => ({ x1: tb.x - 1, y1: 0, x2: tb.x + 1, y2: tb.level, meniscus: 'top' }))
    if (p.yC > 0.01) fills.push({ x1: -1, y1: -0.8, x2: 13, y2: 0 })
    fills.push(
      { x1: -1, y1: p.yA, x2: 1, y2: 8.5, kind: 'gas', count: 18, density: p.pBottom / 75 },
      { x1: 5, y1: p.yB, x2: 7, y2: 8.5, kind: 'gas', count: 18, density: p.pBottom / 75 },
    )
    v.vessel(m, [
      ...tubes.map((tb) => ({ x1: tb.x - 1, y1: 0, x2: tb.x + 1, y2: 8.5, open: 'top' })),
      { x1: -1, y1: -0.8, x2: 13, y2: 0 },
    ], { fills })

    for (const tb of tubes) {
      v.text(m, tb.x, 9.3, tb.name + '（上部省略）', { size: 12, color: v.color.graphite })
      v.line(m, tb.x + 1.15, tb.level, tb.x + 1.9, tb.level, { color: v.color.ink, width: 1 })
      v.text(m, tb.x + 2.05, tb.level, tb.level.toFixed(2) + ' cm', { size: 12, color: v.color.ink, align: 'left' })
    }
    if (p.h > 0.05) {
      v.line(m, 7, p.yB, 16.5, p.yB, { color: v.color.steel, width: 1, dash: [3, 3] })
      v.line(m, 13, p.yC, 16.5, p.yC, { color: v.color.steel, width: 1, dash: [3, 3] })
      v.dim(m, 16.5, p.yB, 16.5, p.yC, 'h = ' + p.h.toFixed(2) + ' cm', { offset: 0 })
    }
    v.text(m, 6, -1.45, '底面压强 ' + p.pBottom.toFixed(2) + ' cmHg', { size: 12, color: v.color.graphite })
  },
})
</Figure>

<Readout items={[
  {label: "A 管水银柱高度", expr: "yA", unit: "cm", digits: 2},
  {label: "B 管水银柱高度", expr: "yB", unit: "cm", digits: 2},
  {label: "C 管水银柱高度", expr: "yC", unit: "cm", digits: 2},
  {label: "B 比 A 高", expr: "delta", unit: "cm", digits: 2},
  {label: "A 管空气压强", expr: "pA", unit: "cmHg", digits: 2},
  {label: "B 管空气压强", expr: "pB", unit: "cmHg", digits: 2},
  {label: "A 管空气柱长度", expr: "airA", unit: "cm", digits: 2},
  {label: "B 管空气柱长度", expr: "airB", unit: "cm", digits: 2}
]} />

交互演示使用的通式为

$$
x_B=\frac{l_2h}{p_0+h},\qquad x_C=h+x_B.
$$

A 管的高度满足

$$
(p_0+x_C-x_A)(l_1-x_A)=p_0l_1.
$$

令 $K=p_0+x_C+l_1$，取满足空气柱长度为正的根：

$$
x_A=\frac{K-\sqrt{K^2-4l_1x_C}}{2}
=\frac{2l_1x_C}{K+\sqrt{K^2-4l_1x_C}}.
$$

后一种写法也适用于 $h=0$，演示中的派生量采用这一形式。

## 四、结合图像理解关键状态

<Plot
  title="三管液面高度随 h 的变化"
  x={{name: "h", label: "C、B 液面高度差 h", unit: "cm", min: 0, max: 5}}
  y={{label: "水银柱高度", unit: "cm", min: 0, max: 8}}
  series={[
    {label: "A 管", expr: "2*l1*(h+l2*h/(p0+h))/(p0+h+l2*h/(p0+h)+l1+sqrt((p0+h+l2*h/(p0+h)+l1)^2-4*l1*(h+l2*h/(p0+h))))", color: "ink"},
    {label: "B 管", expr: "l2*h/(p0+h)", color: "graphite", dash: true},
    {label: "C 管", expr: "h+l2*h/(p0+h)", color: "steel"}
  ]}
  marks={[
    {x: 0, series: 0, label: "开始：三管均无水银"},
    {x: 5, series: 0, label: "A：1 cm"},
    {x: 5, series: 1, label: "B：2 cm"},
    {x: 5, series: 2, label: "C：7 cm"}
  ]}
  cursor="h"
/>

- **开始，$h=0$：**三管水银柱高度均为零，A、B 管内空气压强均为大气压。
- **缓慢注入，$0<h<5\ \text{cm}$：**三个液面都上升。C 管液面最高，因为其液面上方压强最小。
- **题目末态，$h=5\ \text{cm}$：**从低到高依次为 A 管 1 cm、B 管 2 cm、C 管 7 cm。图中 C、B 两条曲线的纵向间隔为 5 cm，B、A 两条曲线的纵向间隔为 1 cm。

A 管初始空气柱更短，相同的液面上升量会带来更大的相对压缩。因此，它在较小的水银柱高度下，就能产生平衡所需的气体压强。

还可以直接比较 A、B 管：

$$
p_A-p_B=x_B-x_A.
$$

题目末态 A 管空气压强比 B 管大 $1\ \text{cmHg}$，恰好对应 A 管液面比 B 管低 $1\ \text{cm}$。

## 五、答案汇总

| 所求量 | 答案 |
|---|---|
| （1）A 管内水银柱高度 | $\boxed{1\ \text{cm}}$ |
| （1）B 管内水银柱高度 | $\boxed{2\ \text{cm}}$ |
| （2）A、B 管内水银柱高度差 | $\boxed{1\ \text{cm}}$，B 管液面较高 |
