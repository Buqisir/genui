---
id: r5-05-prism
title: 直角棱镜：检查入射与出射条件
subject: physics
topic: 光的折射与光路几何
source: 2019 全国卷Ⅲ
question: |
  直角三角形 ABC 为一棱镜的横截面，∠A=90°，∠B=30°。一束光线平行于底边 BC 射到 AB 边上并进入棱镜，然后垂直于 AC 边射出。
  (1) 求棱镜的折射率；
  (2) 保持 AB 边上的入射点不变，逐渐减小入射角，直到 BC 边上恰好有光线射出。求此时 AB 边上入射角的正弦。
answers: []
---

## 一、题目条件分析

**按题目当前给出的文字，入射与出射条件互相矛盾，无法得到满足题意的折射率。** 以下先检查光路，再说明第二问为什么不能求解。

由三角形内角关系，

$$
\angle C=180^\circ-90^\circ-30^\circ=\boxed{60^\circ}.
$$

入射光平行于 $BC$，而 $AB$ 与 $BC$ 的夹角为 $30^\circ$。入射角从法线量起，因此

$$
i_0=90^\circ-\angle B=\boxed{60^\circ}.
$$

另一条关键条件是

$$
\angle A=90^\circ\quad\Longrightarrow\quad AB\perp AC.
$$

这意味着：**垂直于 $AC$ 的方向，恰好平行于 $AB$。**

## 二、完整解答

### （1）检查能否求出棱镜的折射率

光线垂直于 $AC$ 射出时，在 $AC$ 面上是正入射，出射前后的传播方向相同。因此，棱镜内到达 $AC$ 的光线也必须垂直于 $AC$。

由于 $AB\perp AC$，这条内部光线必须平行于 $AB$。它与 $AB$ 面法线的夹角只能为

$$
\boxed{r_{\text{要求}}=90^\circ}.
$$

但光线从 $AB$ 上的入射点进入棱镜内部，要求折射光线具有指向内部的法向分量，即

$$
\cos r>0\quad\Longrightarrow\quad r<90^\circ.
$$

当 $r=90^\circ$ 时，光线只沿 $AB$ 表面传播，**不能进入三角形的内部**。这与题目的“并进入棱镜”直接矛盾。

即使按高中光学通常采用的空气折射率为 $1$，形式上代入折射定律，也只会得到

$$
\sin i_0=n\sin r_{\text{要求}}
\quad\Longrightarrow\quad
n_{\text{形式}}=\frac{\sin60^\circ}{\sin90^\circ}
=\boxed{\frac{\sqrt3}{2}\approx0.866025}.
$$

这个数只是将矛盾光路代入公式得到的代数候选。它对应沿 $AB$ 表面传播的极限方向，不能满足“进入棱镜后从 $AC$ 垂直射出”。

所以第一问的结论是

$$
\boxed{\text{不存在满足当前题目全部条件的折射率。}}
$$

### （2）检查能否确定所求入射角

第二问要求保持第一问的棱镜和入射点不变，再减小入射角。

第一问没有建立一个满足条件的初始光路，也没有得到可用的棱镜折射率，因此无法据此确定 $BC$ 面上的临界出射条件。

不能把上面的 $n_{\text{形式}}$ 当作已经求出的棱镜折射率，继续计算第二问。

$$
\boxed{\text{当前题目条件下，第二问的入射角正弦无法确定。}}
$$

> 需要核对原题中直角的位置、入射面或出射方向。仅凭当前文字，不能擅自更改其中任何一个条件。

## 三、交互演示

下面只做**光路几何检查**。滑块控制 $AB$ 面上的试探折射角 $r$，观察它与“垂直于 $AC$”能否同时成立。

图中入射点 $P$ 示意画在 $AB$ 中点，图形不按比例。这个位置仅用于绘图，上面的矛盾证明适用于 $AB$ 上任意非顶点入射点。蓝色试探光线画到首次碰到边界为止。

<Param name="rTest" label="试探折射角 r（从 AB 法线量起）" value={90} min={30} max={90} step={1} unit="°" />

<Define name="i0" expr="60" />

<Define name="rRequired" expr="90" />

<Define name="exitDeviation" expr="90 - rTest" />

<Define name="normalFraction" expr="cos(deg(rTest))" />

<Define name="nFormal" expr="sin(deg(i0)) / sin(deg(rRequired))" />

<Define name="nTrial" expr="sin(deg(i0)) / sin(deg(rTest))" />

<Preset label="检查题设：垂直 AC 的方向" set={{rTest: 90}} />

<Preset label="试探：r = 60°" set={{rTest: 60}} />

<Preset label="试探：r = 30°" set={{rTest: 30}} />

<Status cases={[
  {when: "abs(rTest - rRequired) < 1e-6", label: "方向垂直 AC，但光线沿 AB 表面，不能进入内部", tone: "danger"},
  {label: "光线可以指向内部，但传播方向不垂直 AC", tone: "warning"}
]} />

<Figure
  title="AB 与 AC 垂直：要求的内部方向只能沿 AB"
  height={400}
  params={["rTest", "i0", "exitDeviation"]}
>
figure({
  draw(ctx, p, v) {
    const h = 1 / Math.sqrt(3)
    const px = 0.5
    const r = p.rTest * Math.PI / 180
    const dx = -Math.sin(r)
    const dy = Math.cos(r)
    const tangent = Math.abs(p.rTest - 90) < 1e-6
    const distanceAC = px / Math.sin(r)
    const denominatorBC = dx + Math.sqrt(3) * dy
    const distanceBC = denominatorBC > 1e-9
      ? (1 - px) / denominatorBC
      : Infinity
    const distance = Math.min(distanceAC, distanceBC)
    const qx = px + dx * distance
    const qy = dy * distance
    const m = v.view({
      xmin: -0.3,
      xmax: 1.25,
      ymin: -0.4,
      ymax: 0.85,
      pad: 24,
    })

    v.path(m, [[0, 0], [1, 0], [0, h]], {
      close: true,
      color: v.color.text,
      width: 2,
    })

    v.path(m, [[0.065, 0], [0.065, 0.065], [0, 0.065]], {
      color: v.color.muted,
      width: 1,
    })

    v.label(m, -0.06, -0.05, 'A：90°', { color: v.color.text })
    v.label(m, 1.04, 0.03, 'B：30°', { color: v.color.text })
    v.label(m, -0.05, h + 0.07, 'C', { color: v.color.text })

    v.line(m, px, -0.3, px, 0.32, {
      color: v.color.muted,
      dash: [6, 4],
      width: 1,
    })
    v.label(m, px + 0.04, 0.33, 'AB 法线', { color: v.color.muted })

    const incomingLength = 0.4
    v.arrow(
      m,
      px + incomingLength * Math.cos(Math.PI / 6),
      -incomingLength * Math.sin(Math.PI / 6),
      px,
      0,
      { color: v.color.red, width: 2 }
    )
    v.label(m, 0.91, -0.22, '入射光 ∥ BC；i = 60°', {
      color: v.color.red,
    })

    v.line(m, px, 0, -0.18, 0, {
      color: v.color.orange,
      dash: [6, 4],
      width: 2,
    })
    v.label(m, 0.18, -0.2, '题设要求的方向：∥ AB、⊥ AC', {
      color: v.color.orange,
    })

    v.arrow(m, px, 0, qx, qy, {
      color: tangent ? v.color.orange : v.color.blue,
      width: 3,
    })
    v.circle(m, px, 0, 0.012, { fill: v.color.red })
    v.label(m, px + 0.04, -0.055, 'P', { color: v.color.text })

    if (tangent) {
      v.label(m, 0.25, 0.15, 'r = 90°：沿表面，未进入内部', {
        color: v.color.orange,
      })
    } else {
      v.circle(m, qx, qy, 0.012, { fill: v.color.blue })
      v.label(m, (px + qx) / 2, qy / 2 + 0.07,
        '试探光线：r = ' + p.rTest.toFixed(0) + '°', {
          color: v.color.blue,
        })
      v.label(m, 0.67, 0.53,
        '与 AC 法线相差 ' + p.exitDeviation.toFixed(0) + '°', {
          color: v.color.blue,
        })
    }
  },
})
</Figure>

<Readout items={[
  {label: "题设入射角 i₀", expr: "i0", unit: "°", digits: 0},
  {label: "试探折射角 r", expr: "rTest", unit: "°", digits: 0},
  {label: "传播方向偏离 AC 法线的角度", expr: "exitDeviation", unit: "°", digits: 0},
  {label: "指向内部的单位方向法向分量", expr: "normalFraction", digits: 3},
  {label: "固定 i₀ 时由折射公式得到的候选 n", expr: "nTrial", digits: 6}
]} />

候选 $n$ 的读数只用于检查公式。它并不表示这些试探状态同时满足原题的出射条件。

## 四、结合图像理解关键时刻

本题检查的是静态光路，不需要播放时间动画。关键状态由折射角滑块切换：

- **$r=30^\circ$**：光线指向棱镜内部，但与 $AC$ 法线相差 $60^\circ$，不满足垂直出射方向。
- **$r=60^\circ$**：仍能指向内部，但与 $AC$ 法线相差 $30^\circ$。
- **$r\to90^\circ$**：传播方向逐渐接近 $AC$ 法线，同时指向内部的分量 $\cos r$ 逐渐减小。
- **$r=90^\circ$**：方向终于垂直于 $AC$，但法向分量降为零，光线沿 $AB$ 表面传播。

因此，“进入棱镜内部”与“内部光线垂直于 $AC$”在给定的直角位置下无法同时成立。判断光路时，应先检查几何方向，再使用折射定律。

## 五、答案汇总

| 小问 | 按当前题目文字得到的结论 |
|---|---|
| （1）棱镜折射率 | 不存在满足全部条件的折射率；$\sqrt3/2$ 只是矛盾光路的代数候选 |
| （2）入射角的正弦 | 无法确定，需要先核对原题条件 |

本课件的 `answers` 留空，因为当前题目没有可作为物理答案校验的数值。
