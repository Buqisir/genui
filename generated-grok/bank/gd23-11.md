---
id: gd23-11
title: 激光测玻璃折射率
source: 2023 广东卷 第 11 题（实验）
question: "某同学用激光笔和透明长方体玻璃砖测量玻璃的折射率，实验过程如下：（1）将玻璃砖平放在水平桌面上的白纸上，用大头针在白纸上标记玻璃砖的边界（2）①激光笔发出的激光从玻璃砖上的 M 点水平入射，到达 ef 面上的 O 点后反射到 N 点射出．用大头针在白纸上标记 O 点、M 点和激光笔出光孔 Q 的位置②移走玻璃砖，在白纸上描绘玻璃砖的边界和激光的光路，作 QM 连线的延长线与 ef 面的边界交于 P 点，如图（a）所示③用刻度尺测量 PM 和 OM 的长度 d_1 和 d_2．PM 的示数如图（b）所示，d_1 为________ cm。测得 d_2 为 3.40 cm（3）利用所测量的物理量，写出玻璃砖折射率的表达式 n = ________；由测得的数据可得折射率 n 为 ________（结果保留 3 位有效数字）（4）相对误差的计算式为 δ = (测量值 − 真实值)/真实值 × 100%。为了减小 d_1、d_2 测量的相对误差，实验中激光在 M 点入射时应尽量使入射角________。"
answers:
  - { name: d1, value: 2.25, unit: cm }
  - { name: n, value: 1.51 }
---

这是一次从正上方看下去的侧视：玻璃砖是一块长方体，ef 面是左边这条竖直边，M 在底边上。激光从砖外的 Q 出光孔水平射到 M，在 M 点进入玻璃。这里的水平指的是光线在桌面这个平面里走，不是正入射：法线是底边的法线，入射角 i 是 QM 与法线的夹角。进入玻璃后折射，折射角为 r，然后打到 ef 面上的 O 点，再反射到顶边的 N 点射出。

移走玻璃砖之后，在纸上把 QM 连线向前延长，与 ef 边交于 P。这样纸上留下两条线：虚线 PM 是假设不折射、照直传播时的路径，实线 OM 是真正进入玻璃后的路径。P、O 都在 ef 这条竖直边上，所以

$$
PM \sin i = OM \sin r
$$

也就是 $d_1 \sin i = d_2 \sin r$。结合斯涅尔定律 $n \sin r = \sin i$，得到 $n = d_2/d_1$。注意两条线都是斜的，$d_1$、$d_2$ 是斜距离，不是玻璃砖的宽度；宽度在比值里约掉了，不用再测。

## 完整解答

**（2）③ $d_1$ 的读数**

刻度尺的分度是 1 mm，要估读到 0.1 mm。P 对准 0 刻度；M 落在 2 cm 刻度向右第 2 条与第 3 条毫米刻度的正中，也就是 2.2 cm 与 2.3 cm 之间的中点，读数为 2.25 cm。

$$
\boxed{d_1 = 2.25\ \text{cm}}
$$

题目已经给出 $d_2 = 3.40\ \text{cm}$。

**（3）折射率**

由 $d_1 \sin i = d_2 \sin r$ 与 $n \sin r = \sin i$，

$$
n = \frac{\sin i}{\sin r} = \frac{d_2}{d_1}
$$

$$
\boxed{n = \dfrac{d_2}{d_1}}
$$

代入测得的数据，保留 3 位有效数字：

$$
n = \frac{3.40}{2.25} = 1.511\ldots = \boxed{1.51}
$$

**（4）怎样减小相对误差**

刻度尺估读带来的绝对误差大约固定，大约为分度的半格。同一块玻璃砖宽度不变时，入射角越大，PM 和 OM 这两条斜线越长，$d_1$、$d_2$ 越大，同一绝对误差除以更大的真实值，相对误差就越小。所以激光在 M 点入射时应尽量使入射角大一些。入射角也不能大到接近全反射：一旦在 M 点全反射，光进不了玻璃，就测不出折射率。

$$
\boxed{\text{大一些（大）}}
$$

## 交互演示

下面两张图都是从正上方看下去的侧视，和题目的图（a）一致。玻璃砖的宽度和高度题目没有给，这里取 5.6 cm 和 4.6 cm 作为画图的代表值，不影响 $n = d_2/d_1$。激光笔没有现成的器材，用简图画出出光孔 Q。

拖动入射角，光路由折射定律重算：虚线 PM 是不折射的延长线，实线 OM 是真正的折射光线。入射角越大，$d_1$、$d_2$ 越长，但比值一直是折射率。

<Param name="d1" label="PM 的长度 d_1" symbol="d_1" value={2.25} min={1.5} max={4} step={0.01} unit="cm" digits={2} />

<Param name="d2" label="OM 的长度 d_2" symbol="d_2" value={3.4} min={2} max={6} step={0.01} unit="cm" digits={2} />

<Param name="i" label="入射角 i" symbol="i" value={42} min={20} max="iMax" step={1} unit="°" />

<Define name="n" expr="d2/d1" />

<Define name="iMax" expr="min(58, asin(min(0.96, n))*180/pi - 1)" />

<Define name="r" expr="asin(sin(deg(i))/n)*180/pi" />

<Define name="W" expr="5.6" />

<Define name="H" expr="4.6" />

<Define name="sinI" expr="sin(deg(i))" />

<Define name="cosI" expr="cos(deg(i))" />

<Define name="sinR" expr="sin(deg(r))" />

<Define name="cosR" expr="cos(deg(r))" />

<Define name="fit1" expr="(W-0.9)/sinI" />

<Define name="fit2" expr="(H-0.5)/cosR" />

<Define name="s0" expr="min(1, fit1/d1, fit2/d2)" />

<Define name="oyMin" expr="H-(W-d1*s0*sinI)/2*cosR/sinR" />

<Define name="d2s" expr="max(d2*s0, oyMin/cosR)" />

<Define name="d1s" expr="d1*s0" />

<Define name="Mx" expr="d1s*sinI" />

<Define name="Py" expr="d1s*cosI" />

<Define name="Oy" expr="d2s*cosR" />

<Define name="gap" expr="0.9" />

<Define name="Qx" expr="Mx+gap*sinI" />

<Define name="Qy" expr="-gap*cosI" />

<Define name="Nx" expr="(H-Oy)*sinR/cosR" />

<Question text="（2）③ d_1 是多少 cm？" set={{d1: 2.25, d2: 3.4}} hint="M 在 2 cm 刻度向右第 2 条与第 3 条毫米刻度正中，估读到 0.01 cm" />

<Question text="（3）折射率 n 怎么用 d_1、d_2 表示，数值是多少？" set={{d1: 2.25, d2: 3.4}} hint="n = d_2/d_1，与入射角无关" />

<Question text="（4）入射角应尽量怎样，才能减小相对误差？" set={{i: 55}} hint="入射角越大，d_1、d_2 越长，同一绝对误差的相对误差越小" />

<Preset label="题目数据：2.25 cm、3.40 cm" set={{d1: 2.25, d2: 3.4, i: 42}} />

<Preset label="入射角较大：55°" set={{i: 55}} />

<Status cases={[
  {when: "i > 50", label: "入射角较大，d_1、d_2 较长，相对误差较小", tone: "success"},
  {when: "i < 30", label: "入射角较小，d_1、d_2 较短，相对误差较大", tone: "warning"},
  {label: "入射角中等，d_1、d_2 越长相对误差越小", tone: "info"}
]} />

<Readout items={[
  {label: "折射角", symbol: "r", expr: "r", unit: "°", digits: 1, color: "field"},
  {label: "折射率", symbol: "n", expr: "n", digits: 3, color: "charge"},
  {label: "两段之比", symbol: "d_2/d_1", expr: "d2/d1", digits: 3}
]} />

<Optics name="lt" n0={1} length={12}
  media={[{name: "glass", n: "n", label: "玻璃砖", shape: {xmin: 0, xmax: "W", ymin: 0, ymax: "H"}, mirror: [3]}]}
  rays={[{name: "beam", from: ["Qx", "Qy"], angle: "90+i", color: "red"}]} />

<Figure title="侧视光路：虚线 PM，实线 OM" height={460}
  params={["lt", "W", "H", "Mx", "Py", "Oy", "Qx", "Qy", "Nx", "i", "r", "d1s", "d2s"]}
  hud={[
    {symbol: "d_1", expr: "d1s", unit: "cm", digits: 2},
    {symbol: "d_2", expr: "d2s", unit: "cm", digits: 2},
    {symbol: "n", expr: "n", digits: 3}
  ]}
  legend={[{kind: "force-dash", label: "不折射的延长线 PM"}, {kind: "force", label: "折射光线 OM"}]}
  note="从正上方看下去。玻璃砖宽 5.6 cm、高 4.6 cm 是为画图取的代表值，不影响 n = d_2/d_1。d_1、d_2 超出砖面时按比例缩短，仍保持比值。">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -1.7, xmax: 7.6, ymin: -2.1, ymax: 6.1, equal: true })
    v.optics(m, p.lt)
    v.line(m, p.Mx, 0, 0, p.Py, { color: v.color.force, width: 1.4, dash: [6, 4] })
    v.line(m, p.Mx, 0, 0, p.Oy, { color: v.color.force, width: 2.2 })
    v.dim(m, 0, p.Py, p.Mx, 0, "d_1", { offset: -18 })
    v.dim(m, p.Mx, 0, 0, p.Oy, "d_2", { offset: 18 })
    const rad = Math.PI / 180
    v.line(m, p.Mx, 0, p.Mx, 1.35, { color: v.color.steel, width: 1, dash: [3, 3] })
    v.ellipse(m, p.Mx, 0, 0.85, 0.85, { from: 90, to: 90 + p.i, color: v.color.force })
    v.ellipse(m, p.Mx, 0, 0.5, 0.5, { from: 90, to: 90 + p.r, color: v.color.field })
    v.label(m, p.Mx - 0.85 * Math.sin(p.i * rad) - 0.15, 0.85 * Math.cos(p.i * rad), "i", { color: v.color.force })
    v.label(m, p.Mx - 0.5 * Math.sin(p.r * rad) - 0.12, 0.5 * Math.cos(p.r * rad), "r", { color: v.color.field })
    v.label(m, -0.12, p.H + 0.05, "e")
    v.label(m, -0.12, -0.05, "f")
    v.label(m, -0.08, p.Py, "P")
    v.label(m, -0.08, p.Oy, "O")
    v.label(m, p.Mx + 0.08, -0.08, "M")
    v.label(m, p.Nx, p.H + 0.08, "N")
    v.label(m, p.Qx + 0.1, p.Qy, "Q")
    // 激光笔没有现成器材，用简图画出出光孔
    const ux = Math.sin(p.i * rad)
    const uy = -Math.cos(p.i * rad)
    const px = -uy
    const py = ux
    const pen = (du, dp) => [p.Qx + du * ux + dp * px, p.Qy + du * uy + dp * py]
    v.path(m, [pen(0.15, 0.28), pen(1.5, 0.28), pen(1.5, -0.28), pen(0.15, -0.28)], { close: true, fill: v.color.graphite })
    v.circle(m, p.Qx, p.Qy, 0.08, { fill: v.color.force })
    v.label(m, pen(0.9, -0.55)[0], pen(0.9, -0.55)[1], "激光笔")
  },
})
</Figure>

<Figure title="图（b）：用刻度尺量 PM" height={200} size="wide"
  params={["d1"]}
  note="分度 1 mm，估读到 0.1 mm。P 对准 0；M 在 2 cm 刻度向右第 2 条与第 3 条毫米刻度正中。">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.6, xmax: 4.7, ymin: -1.55, ymax: 1.2 })
    v.ruler(m, 0, 3, 0, { step: 1, minor: 0.1, unit: "cm" })
    v.line(m, 0, 0.62, p.d1, 0.62, { color: v.color.velocity, width: 1.6, dash: [5, 4] })
    v.circle(m, 0, 0.62, 0.05, { fill: v.color.velocity })
    v.circle(m, p.d1, 0.62, 0.05, { fill: v.color.velocity })
    v.label(m, 0, 0.72, "P")
    v.label(m, p.d1, 0.72, "M")
    v.dim(m, 0, 0.62, p.d1, 0.62, "d_1", { offset: 30 })
  },
})
</Figure>

## 结合图像看关键关系

拖入射角时，P 和 O 都沿 ef 边上下移动，两条斜线一起变长，但侧栏的 $n = d_2/d_1$ 不变。把入射角从 25° 拖到 55°，可以看到 PM、OM 明显变长：测量的是更长的一段，刻度尺那一点点估读误差占总长度的比例就更小。

反过来，只改 $d_1$ 或 $d_2$ 不改入射角，折射率读数会跟着变：这正是估读误差怎么进入结果的。题目的数据下 $d_1 = 2.25\ \text{cm}$，$d_2 = 3.40\ \text{cm}$，比值四舍五入到 3 位有效数字是 1.51。

## 答案

$d_1 = 2.25\ \text{cm}$；$n = d_2/d_1 = 1.51$；入射角应尽量大一些。

<Answer items={[
  {label: "PM 的长度", symbol: "d_1", expr: "d1", value: 2.25, unit: "cm", digits: 2},
  {label: "折射率的表达式", symbol: "n", text: "d_2/d_1"},
  {label: "折射率", symbol: "n", expr: "n", value: 1.51, digits: 3},
  {label: "入射角应尽量", text: "大一些"}
]} />
