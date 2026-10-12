---
id: gd22-01
title: 石磨木柄上的三绳共点
source: 2022 广东卷 第 1 题（单选，4 分）
question: 图是可用来制作豆腐的石磨。木柄 AB 静止时，连接 AB 的轻绳处于绷紧状态。O 点是三根轻绳的结点，F、F_1 和 F_2 分别表示三根绳的拉力大小，F_1 = F_2 且 ∠AOB = 60°。下列关系式正确的是（ ）
choice: D
answers:
  - { name: F, value: 17.32, unit: N }
  - { name: ratio, value: 1.732 }
---

木柄静止，三根轻绳都绷紧。结点 O 受三个共点力：竖直绳向上拉，大小为 $F$；左下、右下两根绳向下拉，大小分别为 $F_1$、$F_2$。题目给定 $F_1 = F_2$，且两根斜绳的夹角 $\angle AOB = 60^\circ$。因为两根斜绳对称，每一根与竖直绳的夹角都是 $30^\circ$。

题目只给字母。下面取代表性数值 $F_1 = 10\,\mathrm{N}$，拖动滑块可以改这个大小；比值 $F/F_1$ 不随它改变。

<Param name="F1" label="斜绳拉力" symbol="F_1" value={10} min={4} max={20} step={1} unit="N" color="force" />

<Param name="alpha" label="两斜绳夹角" symbol="∠AOB" value={60} min={20} max={140} step={2} unit="°" />

<Define name="ratio" expr="2*cos(deg(alpha/2))" />

<Question text="A. F = F_1" set={{F1: 10, alpha: 60}} hint="比值约 1.73，不是 1" />

<Question text="B. F = 2F_1" set={{F1: 10, alpha: 60}} hint="比值约 1.73，不是 2" />

<Question text="C. F = 3F_1" set={{F1: 10, alpha: 60}} hint="比值约 1.73，不是 3" />

<Question text="D. F = √3 F_1" set={{F1: 10, alpha: 60}} hint="比值约 1.73，等于 √3" />

<Preset label="题目条件：∠AOB = 60°" set={{F1: 10, alpha: 60}} />

<Preset label="对照：∠AOB = 90°，F = √2 F_1" set={{F1: 10, alpha: 90}} />

<Preset label="对照：∠AOB = 120°，F = F_1" set={{F1: 10, alpha: 120}} />

<Status cases={[
  {when: "abs(alpha - 60) < 0.5", label: "题目条件：F = √3 F_1，选 D", tone: "success"},
  {when: "abs(alpha - 120) < 0.5", label: "夹角 120°：此时才有 F = F_1", tone: "info"},
  {label: "已离开题目夹角，比值随夹角变化", tone: "neutral"}
]} />

<Readout items={[
  {label: "竖直绳拉力", symbol: "F", expr: "F", unit: "N", digits: 2, color: "force"},
  {label: "拉力比", symbol: "F/F_1", expr: "F/F1", digits: 3, color: "force"}
]} />

<Answer items={[
  {label: "答案", text: "D"},
  {label: "竖直绳拉力", symbol: "F", expr: "F", value: 17.32, unit: "N", digits: 2},
  {label: "拉力比", symbol: "F/F_1", expr: "ratio", value: 1.732, digits: 3}
]} />

<ForceDiagram title="结点 O 的三力平衡" size="wide"
  surface={{type: "none"}}
  body={{shape: "knot", label: "O"}}
  forces={[
    {label: "F", angle: 90, solve: "F"},
    {label: "F_1", angle: "-90 - alpha/2", magnitude: "F1", showValue: true, unit: "N", digits: 1},
    {label: "F_2", angle: "-90 + alpha/2", magnitude: "F1", showValue: true, unit: "N", digits: 1}
  ]}
  triangle={{order: [1, 2, 0], title: "三力闭合"}}
/>

<Figure title="石磨与木柄" height={340} size="narrow" params={["alpha"]} note="石磨按题图示意，尺寸不按比例。箭头是绳对结点的拉力方向。">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2.6, xmax: 2.6, ymin: -1.15, ymax: 4.35, equal: true })
    const a = p.alpha * Math.PI / 360
    const ox = 0
    const oy = 2.35
    const L = 1.35
    const ax = ox - L * Math.sin(a)
    const ay = oy - L * Math.cos(a)
    const bx = ox + L * Math.sin(a)
    const by = ay
    v.ground(m, -2.4, 2.4, 3.85, { side: 'above', thick: 16 })
    v.line(m, -1.9, 3.85, -1.15, 3.85, { color: v.color.graphite, width: 1 })
    v.line(m, -1.7, 3.85, -1.35, 3.73, { color: v.color.graphite, width: 1 })
    v.line(m, -1.45, 3.85, -1.1, 3.73, { color: v.color.graphite, width: 1 })
    v.rope(m, [[ox, 3.85], [ox, oy]])
    v.rope(m, [[ox, oy], [ax, ay]])
    v.rope(m, [[ox, oy], [bx, by]])
    v.bar(m, ax - 0.42, ay, bx + 0.42, ay, { thick: 11, label: 'AB' })
    v.circle(m, 0, 0.05, 0.5, { fill: v.color.steel, outline: v.color.graphite })
    v.circle(m, 0, -0.38, 0.64, { fill: v.color.graphite, outline: v.color.ink })
    v.line(m, 0, ay, 0, 0.55, { color: v.color.ink, width: 3 })
    v.vec(m, ox + 0.16, oy + 0.18, 0, 0.42, { kind: 'force', label: 'F' })
    v.vec(m, ox - 0.16 * Math.sin(a), oy - 0.16 * Math.cos(a), -0.34 * Math.sin(a), -0.34 * Math.cos(a), { kind: 'force', label: 'F_1' })
    v.vec(m, ox + 0.16 * Math.sin(a), oy - 0.16 * Math.cos(a), 0.34 * Math.sin(a), -0.34 * Math.cos(a), { kind: 'force', label: 'F_2' })
    v.ellipse(m, ox, oy, 0.34, 0.34, { from: -90 - p.alpha / 2, to: -90 + p.alpha / 2, color: v.color.ink })
    v.label(m, ox + 0.62, oy - 0.16, p.alpha + '°')
    v.label(m, ax - 0.28, ay + 0.28, 'A')
    v.label(m, bx + 0.28, by + 0.28, 'B')
    v.label(m, ox + 0.22, oy + 0.16, 'O')
  },
})
</Figure>

## 完整解答

结点 O 静止，三个拉力的合力为零。

水平方向：$F_1$、$F_2$ 的水平分力等大反向，已经抵消，竖直绳没有水平分力。

竖直方向：每一根斜绳与竖直绳夹 $30^\circ$，向下的分力是 $F_1\cos 30^\circ$。向上的 $F$ 平衡两个向下分力：

$$
F = 2F_1\cos 30^\circ = 2F_1\cdot\frac{\sqrt3}{2} = \sqrt3\,F_1
$$

代表性数值下 $F_1 = 10\,\mathrm{N}$，$F = 10\sqrt3\,\mathrm{N} \approx 17.32\,\mathrm{N}$，比值

$$
\boxed{F/F_1 = \sqrt3 \approx 1.732}
$$

力的矢量三角形闭合，也是同一个关系：两个等长的 $F_1$、$F_2$ 夹角 $120^\circ$，封闭边为 $F = \sqrt3\,F_1$。

**A. 错误。** $F = F_1$ 要求 $\cos 30^\circ = 1/2$，即两根斜绳夹角为 $120^\circ$。题目是 $60^\circ$，此时 $F/F_1 \approx 1.732$，不是 $1$。

**B. 错误。** $2F_1$ 是两个拉力直接相加。两力不在同一直线上，各有一部分用在互相平衡水平分力，竖直方向只剩下 $\sqrt3\,F_1 \approx 1.732F_1$。

**C. 错误。** $3F_1$ 没有对应的分力关系。竖直方向只有两个 $F_1\cos 30^\circ$，合起来是 $\sqrt3\,F_1$，不是 $3F_1$。

**D. 正确。** 由上面的竖直方向平衡，$F = 2F_1\cos 30^\circ = \sqrt3\,F_1$。

拖动夹角可以看出趋势：夹角从 $60^\circ$ 增大到 $120^\circ$，比值从 $\sqrt3$ 降到 $1$，选项 A 才成立；夹角再收回 $90^\circ$，比值是 $\sqrt2$。三种情形都不会得到 $2$或 $3$。
