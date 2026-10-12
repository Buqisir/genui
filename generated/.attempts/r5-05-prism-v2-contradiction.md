---
id: r5-05-prism
title: 棱镜折射：检验题设中的几何矛盾
subject: physics
topic: 光的折射与棱镜光路
source: 2019 全国卷Ⅲ
question: |
  直角三角形 ABC 为一棱镜的横截面，∠A=90°，∠B=30°。一束光线平行于底边 BC 射到 AB 边上并进入棱镜，然后垂直于 AC 边射出。
  (1) 求棱镜的折射率；
  (2) 保持 AB 边上的入射点不变，逐渐减小入射角，直到 BC 边上恰好有光线射出。求此时 AB 边上入射角的正弦。
answers:
  - { name: iInitial, value: 60, unit: "°" }
  - { name: rRequired, value: 90, unit: "°" }
  - { name: nFormal, value: 0.8660254037844386, unit: "1" }
---

## 一、题目条件分析

**按题目给出的角度和出射条件，这条光路不能成立，因此两问都没有符合题意的物理解。** 下面保留原题条件，逐步检查矛盾。头信息中的数值用于校验几何角度和形式计算，不代表存在满足题意的棱镜。

由 $\angle A=90^\circ$，得到

$$
AB\perp AC.
$$

入射光平行于 $BC$，而 $AB$ 与 $BC$ 的夹角为 $30^\circ$。入射角从 **AB 面的法线**量起，因此

$$
\boxed{i_0=90^\circ-30^\circ=60^\circ}.
$$

“垂直于 AC 边射出”意味着出射光沿 AC 面的法线传播。折射定律要求棱镜内的光也沿这条法线传播。

## 二、完整解答

### （1）折射率：形式计算与光路检查

设光在 AB 面的折射角为 $r$，在 AC 面的入射角为 $j$。角度都从对应界面的法线量起。

AC 面的出射角为 $0^\circ$。取空气折射率为 1，折射定律给出

$$
n\sin j=\sin0^\circ=0.
$$

折射率为正，且入射角位于 $0^\circ$ 到 $90^\circ$ 之间，所以

$$
\boxed{j=0^\circ}.
$$

于是棱镜内的光垂直于 AC。由于 $AB\perp AC$，这束光必然平行于 AB：

$$
\text{内部光线}\perp AC
\quad\Rightarrow\quad
\text{内部光线}\parallel AB.
$$

它与 AB 面法线的夹角只能是

$$
\boxed{r_{\text{需}}=90^\circ}.
$$

如果只把这个角代入 AB 面的折射定律，会得到

$$
\sin i_0=n\sin r_{\text{需}},
$$

$$
\boxed{
n_{\text{形式}}
=\frac{\sin60^\circ}{\sin90^\circ}
=\frac{\sqrt3}{2}
\approx0.866025
}.
$$

**这个数不是本题的有效折射率答案。**

对于通常的空气到棱镜的折射，$n>1$，有 $r<i_0=60^\circ$，不可能出现 $r=90^\circ$。

即使形式上允许 $n=\sqrt3/2<1$，$r=90^\circ$ 也表示折射光沿 AB 界面传播。它没有进入棱镜内部，不能再从 AC 面的内部位置垂直射出。在顶点 A 处，两个界面相交，也不能把沿 AB 到达顶点视为正常的 AC 面出射。

因此

$$
\boxed{\text{不存在满足题设完整光路的折射率}}.
$$

### （2）减小入射角后的条件

第二问以第一问的棱镜和初始光路为前提。但这个初始光路不存在，因而无法据此确定“BC 边上恰好有光线射出”对应的入射角。

不能把第一问的形式值 $\sqrt3/2$ 当作已确定的棱镜折射率继续计算。那样会把一条沿 AB 界面传播的光，当成已经进入棱镜的光。

所以

$$
\boxed{\text{此时 AB 面入射角的正弦无法由本题条件确定}}.
$$

需要核对题目中的直角位置或垂直出射的边，才能继续求解。

## 三、交互演示

下面用滑块检查 AB 面的折射方向。入射角初值采用题目推出的 $60^\circ$；折射率试取 **1.50**，用于展示普通棱镜的光路，并非题目答案。

图中取 $AC=1$、$AB=\sqrt3$，长度采用无量纲单位。入射点选在 AB 中点，仅用于画图；上述矛盾对 AB 上任意非顶点入射点都成立。

蓝色箭头表示入射光，绿色箭头表示实际折射光，橙色箭头表示题设要求的内部传播方向。绿色光线画到下一次遇到界面的位置。

<Param name="i" label="AB 面入射角 i" value={60} min={0} max={60} step={1} unit="°" />

<Param name="nTrial" label="试用折射率 n" value={1.5} min={1} max={2.5} step={0.05} unit="1" />

<Define name="iInitial" expr="60" />

<Define name="rRequired" expr="90" />

<Define name="nFormal" expr="sin(deg(iInitial)) / sin(deg(rRequired))" />

<Define name="r" expr="asin(sin(deg(i)) / nTrial) * 180 / pi" />

<Define name="angleToACNormal" expr="90 - r" />

<Define name="angleGap" expr="rRequired - r" />

<Preset label="题设入射方向：i = 60°" set={{i: 60, nTrial: 1.5}} />

<Preset label="减小入射角：i = 30°" set={{i: 30}} />

<Preset label="法线入射：i = 0°" set={{i: 0}} />

<Figure
  title="题设要求的内部方向沿 AB，不能进入棱镜"
  height={360}
  params={["i", "nTrial", "r", "rRequired"]}
>
figure({
  draw(ctx, p, v) {
    const b = Math.sqrt(3)
    const px = b / 2
    const iRad = p.i * Math.PI / 180
    const rRad = p.r * Math.PI / 180
    const dx = -Math.sin(rRad)
    const dy = Math.cos(rRad)
    const distanceAC = -dx > 1e-10 ? px / (-dx) : Infinity
    const denominatorBC = dx / b + dy
    const distanceBC = denominatorBC > 1e-10 ? 0.5 / denominatorBC : Infinity
    const distance = Math.min(distanceAC, distanceBC)
    const qx = px + distance * dx
    const qy = distance * dy

    const m = v.view({
      xmin: -0.45,
      xmax: 2.25,
      ymin: -1,
      ymax: 1.4,
      equal: true,
      pad: 20
    })

    v.path(m, [[0, 0], [b, 0], [0, 1]], {
      close: true,
      color: v.color.border,
      width: 2
    })

    v.path(m, [[0.12, 0], [0.12, 0.12], [0, 0.12]], {
      color: v.color.muted,
      width: 1
    })

    v.label(m, -0.12, -0.12, 'A：90°')
    v.label(m, b + 0.12, -0.08, 'B：30°')
    v.label(m, -0.12, 1.12, 'C')
    v.label(m, -0.2, 0.5, 'AC')
    v.label(m, 1.12, 0.62, 'BC')

    v.line(m, px, -0.82, px, 0.82, {
      color: v.color.muted,
      width: 1
    })
    v.label(m, px + 0.16, 0.76, 'AB 面法线', {
      color: v.color.muted
    })

    v.arrow(
      m,
      px + 0.85 * Math.sin(iRad),
      -0.85 * Math.cos(iRad),
      px,
      0,
      { color: v.color.blue, width: 2 }
    )
    v.label(m, 1.55, -0.55, '入射光：i = ' + p.i.toFixed(0) + '°', {
      color: v.color.blue
    })

    v.arrow(m, px, 0, qx, qy, {
      color: v.color.green,
      width: 2
    })
    v.label(m, 0.48, 0.48, '实际折射角 r = ' + p.r.toFixed(1) + '°', {
      color: v.color.green
    })

    v.arrow(m, px, 0, 0.04, 0, {
      color: v.color.orange,
      width: 3
    })
    v.label(m, 0.35, -0.35, '题设要求：r = 90°，沿 AB', {
      color: v.color.orange
    })

    v.circle(m, px, 0, 0.025, {
      color: v.color.text
    })
    v.label(m, px + 0.15, -0.14, 'P：固定入射点')
    v.circle(m, qx, qy, 0.02, {
      color: v.color.green
    })
  }
})
</Figure>

<Readout items={[
  {label: "入射角 i", expr: "i", unit: "°", digits: 1},
  {label: "实际折射角 r", expr: "r", unit: "°", digits: 2},
  {label: "题设要求的折射角", expr: "rRequired", unit: "°", digits: 1},
  {label: "实际方向与 AC 法线的夹角", expr: "angleToACNormal", unit: "°", digits: 2},
  {label: "形式计算的折射率（无效候选）", expr: "nFormal", unit: "1", digits: 6}
]} />

<Status cases={[
  {when: "abs(r - rRequired) < 1e-6", label: "折射方向沿 AB 界面，不能形成题设内部光路", tone: "warning"},
  {label: "实际折射方向无法满足垂直 AC 出射的要求", tone: "warning"}
]} />

<Plot
  title="AB 面折射角随入射角变化"
  x={{name: "i", label: "入射角 i", unit: "°", min: 0, max: 60}}
  y={{label: "折射角 r", unit: "°", min: 0, max: 95}}
  series={[
    {label: "实际折射角", expr: "asin(sin(deg(i)) / nTrial) * 180 / pi", color: "green"},
    {label: "题设要求：90°", expr: "rRequired", color: "orange"}
  ]}
  marks={[
    {x: "iInitial", series: 0, label: "题设入射方向"}
  ]}
  cursor="i"
/>

## 四、结合图像理解关键状态

- **初始入射角为 $60^\circ$**：入射光平行于 BC。试取 $n=1.50$ 时，实际折射角约为 $35.26^\circ$，与题设要求的 $90^\circ$ 不一致。
- **逐渐减小入射角**：由 $\sin r=\sin i/n$，实际折射角也减小。图中的绿色光线更接近 AB 面法线，更无法沿橙色方向传播。
- **法线入射时**：$i=0^\circ$，有 $\boxed{r=0^\circ}$，光线垂直于 AB；而题设要求的内部光线平行于 AB。
- **要求 $r=90^\circ$ 时**：光线沿 AB 界面传播。这是界面的掠射方向，无法构成“进入棱镜，然后从 AC 射出”的过程。

判断光路时，要同时检查折射定律和几何路径。一个数值满足单个界面的方程，并不保证整条光路成立。

## 五、答案汇总

| 项目 | 结论 |
|---|---|
| AB 面初始入射角 | $\boxed{60^\circ}$ |
| 垂直 AC 出射所要求的 AB 面折射角 | $\boxed{90^\circ}$，内部方向沿 AB 界面 |
| 仅代入折射定律得到的形式值 | $\boxed{\sqrt3/2\approx0.866025}$，不能作为有效答案 |
| （1）棱镜折射率 | $\boxed{\text{不存在满足题设完整光路的折射率}}$ |
| （2）入射角的正弦 | $\boxed{\text{题设初始光路不成立，无法确定}}$ |
