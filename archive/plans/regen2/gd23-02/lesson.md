---
id: gd23-02
title: 船舷上的检测机器人
source: 2023 广东卷 第 2 题（单选，4 分）
question: "如图所示，可视为质点的机器人通过磁铁吸附在船舷外壁面检测船体。壁面可视为斜面，与竖直方向夹角为 θ。船和机器人保持静止时，机器人仅受重力 G、支持力 F_N、摩擦力 F_f 和磁力 F 的作用，磁力垂直壁面。下列关系式正确的是（　　）\n\nA. F_f = G\n\nB. F = F_N\n\nC. F_f = G cos θ\n\nD. F = G sin θ"
choice: C
answers: []
---

船和机器人都静止，机器人受力平衡，合力为零。壁面与竖直方向夹角为 $\theta$，所以壁面与水平方向的夹角是 $90^\circ-\theta$。题目只给出字母，下面取 $G=10\,\mathrm{N}$、$\theta=30^\circ$ 作为代表值，用来看清各力的大小；选项是否成立与这个取值无关。

## 完整解答

沿壁面和垂直壁面各建一个坐标。沿壁面向上（沿船舷指向右上方）为正，垂直壁面指向船体外侧为正。

重力竖直向下。壁面与竖直方向的夹角是 $\theta$，所以重力与壁面方向的夹角也是 $\theta$：

$$
G_\parallel = G\cos\theta, \qquad G_\perp = G\sin\theta
$$

$G_\parallel$ 沿壁面向下，$G_\perp$ 垂直壁面指向外侧。

支持力 $F_N$ 垂直壁面指向外侧，磁力 $F$ 垂直壁面指向壁面。机器人没有沿壁面下滑，静摩擦力 $F_f$ 沿壁面向上，抵消重力沿壁面向下的分力。

沿壁面平衡：

$$
F_f = G\cos\theta
$$

垂直壁面平衡：

$$
F = F_N + G\sin\theta
$$

取 $G=10\,\mathrm{N}$、$\theta=30^\circ$，得 $F_f = 5\sqrt{3}\,\mathrm{N}$，$F_N$ 和 $F$ 的差是 $5\,\mathrm{N}$。两个垂直壁面的力只有这一个方程，大小不能各自确定；图中取一个满足平衡的 $F_N$ 作为代表值。

**A. 错误。** $F_f=G$ 只有 $\cos\theta=1$、即 $\theta=0^\circ$ 时才成立。壁面倾斜时，摩擦力只要平衡重力沿壁面的分力 $G\cos\theta$，小于 $G$。

**B. 错误。** 垂直壁面上还有重力的分力 $G\sin\theta$。它和支持力一同指向外侧，磁力要同时平衡这两个力，所以 $F=F_N+G\sin\theta>F_N$。只有 $\theta=0^\circ$、壁面竖直时两者才相等。

**C. 正确。** 沿壁面只有摩擦力向上、重力分力 $G\cos\theta$ 向下，平衡要求 $\boxed{F_f=G\cos\theta}$。

**D. 错误。** $G\sin\theta$ 是重力垂直壁面的分力，不是磁力本身。垂直壁面的平衡是 $F=F_N+G\sin\theta$，不能把支持力去掉。

## 交互演示

拖动 $\theta$，看沿壁面和垂直壁面两个方向上谁在平衡谁。右侧力的矢量三角形不闭合：磁力、支持力和摩擦力三者的合力要抵消重力，才能使机器人静止。

<Param name="G" label="重力" symbol="G" value={10} min={4} max={20} step={1} unit="N" color="force" />

<Param name="theta" label="壁面与竖直方向的夹角" symbol="θ" value={30} min={8} max={60} step={1} unit="°" />

<Param name="FN" label="支持力（代表值）" symbol="F_N" value={6} min={0} max={20} step={0.5} unit="N" color="force" />

<Define name="Ff" expr="G*cos(deg(theta))" />

<Define name="Fmag" expr="FN + G*sin(deg(theta))" />

<Define name="Gpar" expr="G*cos(deg(theta))" />

<Define name="Gperp" expr="G*sin(deg(theta))" />

<Question text="A. F_f = G" set={{theta: 30}} hint="比较摩擦力和重力：只有 θ = 0° 时两者相等" />

<Question text="B. F = F_N" set={{theta: 30}} hint="垂直壁面还有重力的分力，磁力比支持力大" />

<Question text="C. F_f = G cos θ" set={{theta: 30}} hint="沿壁面平衡：摩擦力等于重力沿壁面的分力" />

<Question text="D. F = G sin θ" set={{theta: 30, FN: 0}} hint="把支持力调到 0 仍看到磁力比 G sin θ 大" />

<Preset label="题目代表值" set={{G: 10, theta: 30, FN: 6}} />

<Preset label="壁面接近竖直" set={{theta: 8, FN: 6}} />

<Status cases={[
  {when: "theta < 12", label: "壁面接近竖直：摩擦力接近重力，磁力接近支持力", tone: "info"},
  {label: "壁面倾斜：摩擦力小于重力，磁力大于支持力", tone: "neutral"}
]} />

<Readout items={[
  {label: "摩擦力", symbol: "F_f", expr: "Ff", unit: "N", digits: 2, color: "force"},
  {label: "磁力", symbol: "F", expr: "Fmag", unit: "N", digits: 2, color: "force"},
  {label: "重力沿壁面的分力", symbol: "G cos θ", expr: "Gpar", unit: "N", digits: 2, color: "force"},
  {label: "重力垂直壁面的分力", symbol: "G sin θ", expr: "Gperp", unit: "N", digits: 2, color: "force"}
]} />

<Answer items={[
  {label: "答案", text: "C"},
  {label: "沿壁面平衡", symbol: "F_f", text: "G cos θ"},
  {label: "垂直壁面平衡", symbol: "F", text: "F_N + G sin θ"}
]} />

<Figure title="船舷外壁" height={340} size="wide" params={["theta"]} note="船舷示意，不按比例；壁面与竖直方向的夹角为 θ">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.7, xmax: 5.5, ymin: -0.95, ymax: 4.05, equal: true })
    const th = Math.max(p.theta, 8) * Math.PI / 180
    const xLow = 1.7
    const yLow = 0.2
    const run = Math.min(1.45, 3.2 * Math.tan(th))
    const rise = run / Math.tan(th)
    const xHigh = xLow - run
    const yHigh = yLow + rise
    v.wave(m, (x) => 0.04 * Math.sin(x * 7.5), -0.25, 5.2, { color: v.color.steel })
    v.incline(m, xHigh, yLow, run, rise)
    v.bar(m, xHigh, yHigh, xHigh + 1.2, yHigh + 0.04, { thick: 9 })
    v.line(m, xLow, yLow, xLow, -0.62, { color: v.color.steel, dash: true })
    v.ellipse(m, xLow, yLow, 0.52, 0.52, { from: 90 - p.theta, to: 90, color: v.color.ink })
    v.label(m, xLow + 0.28, -0.3, 'θ', { place: 'right' })
    const bx = xLow - 0.5 * run
    const by = yLow + 0.5 * rise
    v.block(m, bx, by, 0.32, 0.42, { angle: p.theta - 90 })
    v.text(m, xHigh + run * 0.62, yLow + rise * 0.28, '船体', { color: v.color.ink, size: 14 })
    v.label(m, bx + 0.95 * Math.cos(th), by - 0.95 * Math.sin(th), '机器人', { place: 'right' })
  },
})
</Figure>

<ForceDiagram title="机器人受力" size="wide"
  surface={{type: "incline", angle: "90 - theta", angleLabel: "90°−θ"}}
  body={{shape: "block", label: "机器人"}}
  forces={[
    {label: "G", angle: -90, magnitude: "G", showValue: true, unit: "N"},
    {label: "F_f", angle: "90 - theta", magnitude: "Ff", showValue: true, unit: "N", at: "contact"},
    {label: "F_N", angle: "-theta", magnitude: "FN", showValue: true, unit: "N"},
    {label: "F", angle: "180 - theta", solve: "F", showValue: true, unit: "N"}
  ]}
  decompose={{force: 0, axes: "incline", labels: ["G sin θ", "G cos θ"]}}
  triangle={{order: [3, 2, 1], resultant: "G", title: "三力的合力抵消重力"}}
/>
