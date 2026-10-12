---
id: gd23-11
title: 激光测玻璃砖的折射率
subject: physics
topic: 光的折射
source: 2023 广东卷 第 11 题（实验）
question: |
  某同学用激光笔和透明长方体玻璃砖测量玻璃的折射率，实验过程如下：

  （1）将玻璃砖平放在水平桌面上的白纸上，用大头针在白纸上标记玻璃砖的边界

  （2）①激光笔发出的激光从玻璃砖上的 M 点水平入射，到达 ef 面上的 O 点后反射到 N 点射出．用大头针在白纸上标记 O 点、M 点和激光笔出光孔 Q 的位置

  ②移走玻璃砖，在白纸上描绘玻璃砖的边界和激光的光路，作 QM 连线的延长线与 ef 面的边界交于 P 点，如图（a）所示

  【图（a）】一个横放的长方形，表示玻璃砖。左边这条竖直边是 ef 面：上端标 e，下端标 f。底边上有一点 M。ef 边上、f 的上方有一点 P，P 的上方还有一点 O。砖外、M 的右下方有激光笔，出光孔标 Q，旁注“激光笔”，光束沿 Q、M 方向。砖内有一条实线连接 O 与 M，线旁标 d_2。一条虚线连接 P 与 M，线旁标 d_1。从 O 还有一条实线射到顶边上的 N 点，并在 N 点向右上方射出砖外，射出段带箭头。

  ③用刻度尺测量 PM 和 OM 的长度 d_1 和 d_2．PM 的示数如图（b）所示，d_1 为________ cm。测得 d_2 为 3.40 cm

  【图（b）】一把水平刻度尺，左端平直，右端呈撕开的波浪形。尺的上沿有刻度：0、1、2 为较长刻度，每厘米分 10 小格，0.5 cm、1.5 cm、2.5 cm 处刻度略长；2.5 cm 刻度之后不远尺身即断开。0 刻度下方标“0 cm”。尺的上方有一条水平虚线，左端圆点标 P，对准 0 刻度；右端圆点标 M，落在 2 cm 刻度向右第 2 条与第 3 条毫米刻度的正中。P、M 两个字母分别标在两个圆点的斜上方。

  （3）利用所测量的物理量，写出玻璃砖折射率的表达式 n = ________；由测得的数据可得折射率 n 为 ________（结果保留 3 位有效数字）

  （4）相对误差的计算式为 δ = (测量值 − 真实值)/真实值 × 100%。为了减小 d_1、d_2 测量的相对误差，实验中激光在 M 点入射时应尽量使入射角________。
answers:
  - { name: d1, value: 2.25, unit: cm }
  - { name: nAns, value: 1.51, unit: "" }
---

## 一、题目条件分析

实验在水平白纸上完成，下面的图都是俯视。激光平行于桌面，在水平面内传播。

- 玻璃砖是长方体。ef 是左侧那条竖直边界，和底边垂直。M 在底边上，激光从空气中的 Q 射向 M。
- QM 的延长线交 ef 于 P，这段虚线长 $d_1$。砖里的实际光线射到 ef 上的 O，再反射到顶边的 N 后射出，OM 长 $d_2$。
- 题目已经给出 $d_2 = 3.40\ \text{cm}$。$d_1$ 要按图（b）的毫米刻度尺读出。折射率只由这两个长度决定。
- 试卷没给砖的宽度。演示里取 M 到 ef 的垂直距离 $a = 1.50\ \text{cm}$，砖宽 $12\ \text{cm}$，砖高 $8\ \text{cm}$，光路按这个代表尺寸成比例绘制。$a$ 会在求 $n$ 时约掉。

## 二、完整解答

### （2）读 $d_1$

图（b）是最小分度为 $1\ \text{mm}$ 的刻度尺，要估读到 $0.1\ \text{mm}$。P 对准 0 刻度线，尺的零点就在 P，不用再加零点修正。

M 在 $2\ \text{cm}$ 刻度向右第 2 条与第 3 条毫米刻线的正中：

- 向右第 1 条毫米线是 $2.1\ \text{cm}$
- 第 2 条是 $2.2\ \text{cm}$
- 第 3 条是 $2.3\ \text{cm}$
- 正中比 $2.2\ \text{cm}$ 再多 $0.5\ \text{mm}$

$$
d_1 = 2\ \text{cm} + 2.5\ \text{mm} = \boxed{2.25\ \text{cm}}
$$

### （3）折射率

记 M 到 ef 面的垂直距离为 $a$。f 是 ef 与底边的交点，所以 $\triangle PfM$ 和 $\triangle OfM$ 都是直角三角形，直角在 f，斜边分别是 $d_1$、$d_2$，靠底边的那条直角边都是 $a$。

入射角 $i$、折射角 $r$ 都从法线量起。底边的法线垂直于底边，也就是图里的竖直方向。光线和法线的夹角，其对边正好是水平直角边 $a$：

$$
\sin i = \frac{a}{d_1}, \qquad \sin r = \frac{a}{d_2}
$$

空气折射率取 1。M 点是从空气进入玻璃，折射定律为 $\sin i = n\sin r$，于是

$$
n = \frac{\sin i}{\sin r} = \frac{a/d_1}{a/d_2} = \frac{d_2}{d_1}
$$

$$
\boxed{n = \dfrac{d_2}{d_1}}
$$

代入 $d_2 = 3.40\ \text{cm}$、$d_1 = 2.25\ \text{cm}$：

$$
n = \frac{3.40}{2.25} = 1.5111\ldots
$$

保留 3 位有效数字：

$$
\boxed{1.51}
$$

光进入玻璃时靠近法线，$r < i$，所以 $d_2 > d_1$，$n > 1$，和玻璃的折射率相符。O 画在 P 的上方，就是这条关系在图（a）里的样子。

> **易错点**：把 $d_1$、$d_2$ 写反，或把折射定律写成 $n = \sin r/\sin i$，会得到 $n = d_1/d_2 = 0.662$，小于 1，不可能是玻璃。另一个常见错法是把入射角从玻璃表面量起，正弦用成竖直直角边比斜边，$a$ 就消不掉，表达式里还会留下题目没测的 $a$。

ef 面上的反射用来确定 O，并让光从 N 射出以便观察。玻璃 $n \approx 1.5$ 时临界角小于 $45^\circ$。折射角 $r$ 总小于临界角，光线打到竖直的 ef 面时，入射角是 $90^\circ - r$，总大于临界角，所以在 ef 面发生全反射，光斑集中，便于插针。这一步不用填进空格。

### （4）减小 $d_1$、$d_2$ 的相对误差

同一把刻度尺、同一种读法，绝对误差 $\Delta d$ 可以看成不变。题目给的相对误差就是

$$
\delta = \frac{\Delta d}{d}\times 100\%
$$

$d$ 越大，$\delta$ 越小。由上面的直角三角形，

$$
d_1 = \frac{a}{\sin i}, \qquad d_2 = \frac{na}{\sin i}
$$

M 选定以后 $a$ 不变。入射角 $i$ 越小，$\sin i$ 越小，$d_1$ 和 $d_2$ 一起变长，两条长度的相对误差都变小。折射率的相对误差大约是两者之和，

$$
\frac{\Delta n}{n} = \frac{\Delta d_1}{d_1} + \frac{\Delta d_2}{d_2}
$$

也会跟着变小。

$i$ 小到折射光不再落到 ef 边上时，没有 O 点可以标记，实验做不成。所以是在 O、P 仍落在 ef 边界上的前提下，让入射角尽量小。

$$
\boxed{小}
$$

## 三、交互演示

试卷图（a）是示意图。下面按 $a = 1.50\ \text{cm}$、宽 $12\ \text{cm}$、高 $8\ \text{cm}$ 成比例画俯视光路。点「题目情形」时，图上的 $d_1$、$d_2$ 就是 $2.25\ \text{cm}$ 和 $3.40\ \text{cm}$。拖动入射角时，两条长度一起变，它们的比保持为 $n$。

刻度尺是图（b）：P 对 0，M 停在 $2\ \text{cm}$ 向右第 2、第 3 条毫米线的正中。尺身在 $2.5\ \text{cm}$ 之后不远断开，和试卷一致。

<Question text="刻度尺上 PM 的示数 d_1 是多少？已知 d_2 = 3.40 cm。" set={{ang: "ang0"}} />

<Question text="写出折射率 n 的表达式，并由测量数据算出 n（保留 3 位有效数字）。" set={{ang: "ang0"}} />

<Question text="为减小 d_1、d_2 测量的相对误差，入射角应尽量如何选取？" set={{ang: 20}} hint="再点「较大入射角」，比较 d_1、d_2 和两条相对误差" />

<Param name="ang" label="入射角" symbol="i" color="charge" min={15} max={70} step={0.1} value={41.8} unit="°" />

<Param name="d1" label="测得的 PM" symbol="d_1" color="velocity" value={2.25} min={0} max={6} step={0.01} unit="cm" hidden={true} />

<Param name="d2" label="测得的 OM" symbol="d_2" color="velocity" value={3.40} min={0} max={8} step={0.01} unit="cm" hidden={true} />

<Define name="n" expr="d2/d1" />

<Define name="nAns" expr="round(n*100)/100" />

<Define name="a" expr="1.5" />

<Define name="brickW" expr="12" />

<Define name="brickH" expr="8" />

<Define name="dd" expr="0.05" />

<Define name="ang0" expr="asin(a/d1)*180/pi" />

<Define name="angEdge" expr="asin(n*a/sqrt(brickH^2+a^2))*180/pi" />

<Define name="d1ang" expr="a/sin(deg(ang))" />

<Define name="d2ang" expr="n*a/sin(deg(ang))" />

<Define name="rDeg" expr="asin(sin(deg(ang))/n)*180/pi" />

<Define name="rel1" expr="dd/d1ang*100" />

<Define name="rel2" expr="dd/d2ang*100" />

<Preset label="题目情形" set={{ang: "ang0"}} />

<Preset label="较小入射角 20°" set={{ang: 20}} />

<Preset label="较大入射角 60°" set={{ang: 60}} />

<Status cases={[
  {when: "ang < angEdge", label: "入射角过小，折射光打不到 ef 面", tone: "danger"},
  {when: "ang <= 25", label: "入射角较小，d_1 和 d_2 较长，相对误差较小", tone: "success"},
  {when: "ang >= 50", label: "入射角较大，d_1 和 d_2 较短，相对误差较大", tone: "warning"},
  {label: "光线能落到 ef 面并反射出去", tone: "info"}
]} />

<Figure title="俯视光路：实线是激光，虚线是 QM 的延长线" height={520} size="full" params={["ang", "a", "n", "brickH", "brickW"]}>
figure({
  draw(ctx, p, v) {
    const a = p.a
    const H = p.brickH
    const W = p.brickW
    const n = p.n
    const iDeg = p.ang
    const iRad = iDeg * Math.PI / 180
    const sinI = Math.sin(iRad)
    const cosI = Math.cos(iRad)
    const sinR = Math.min(sinI / n, 0.999999)
    const cosR = Math.sqrt(Math.max(0, 1 - sinR * sinR))
    const d1 = a / sinI
    const d2 = a / sinR
    const yP = d1 * cosI
    const yO = d2 * cosR
    const qLen = 2.5
    const xQ = a + qLen * sinI
    const yQ = -qLen * cosI
    const rDeg = Math.asin(sinR) * 180 / Math.PI
    const xN = (H - yO) * sinR / cosR
    const onSide = yO <= H && xN >= 0 && xN <= W

    const m = v.view({ xmin: -2.1, xmax: W + 0.8, ymin: -3.6, ymax: H + 2.5, equal: true, pad: 14 })

    v.path(m, [[0, 0], [W, 0], [W, H], [0, H]], { close: true, color: v.color.ink, width: 1.6 })
    v.path(m, [[0, 0.28], [0.28, 0.28], [0.28, 0]], { color: v.color.graphite, width: 1 })

    v.line(m, a, -1.9, a, 2.7, { color: v.color.graphite, dash: [4, 3], width: 1 })

    function arc(rad, deg0, deg1) {
      const pts = []
      const nseg = 18
      for (let k = 0; k <= nseg; k++) {
        const deg = deg0 + (deg1 - deg0) * k / nseg
        const t = deg * Math.PI / 180
        pts.push([a + rad * Math.cos(t), rad * Math.sin(t)])
      }
      return pts
    }
    v.path(m, arc(1.15, -90, -90 + iDeg), { color: v.color.charge, width: 1.6 })
    v.path(m, arc(1.7, 90, 90 + rDeg), { color: v.color.charge, width: 1.6 })

    const midI = (-90 + iDeg / 2) * Math.PI / 180
    const midR = (90 + rDeg / 2) * Math.PI / 180
    v.label(m, a + 1.55 * Math.cos(midI), 1.55 * Math.sin(midI), 'i', { color: v.color.charge })
    v.label(m, a + 2.1 * Math.cos(midR), 2.1 * Math.sin(midR), 'r', { color: v.color.charge })
    v.label(m, a + 0.35, 2.45, '法线', { color: v.color.graphite, size: 12 })

    if (yP <= H) {
      v.line(m, a, 0, 0, yP, { color: v.color.charge, dash: [6, 4], width: 1.5 })
    } else {
      const xTopD = a - H * sinI / cosI
      v.line(m, a, 0, xTopD, H, { color: v.color.charge, dash: [6, 4], width: 1.5 })
    }

    const ray = [[xQ, yQ], [a, 0]]
    if (onSide) {
      const eLen = 2.3
      ray.push([0, yO], [xN, H], [xN + eLen * sinI, H + eLen * cosI])
    } else {
      const xTop = a - H * sinR / cosR
      const eLen = 2.3
      ray.push([xTop, H], [xTop - eLen * sinI, H + eLen * cosI])
    }
    v.ray(m, ray)

    const lw = 0.9
    const lh = 0.48
    v.path(m, [
      [xQ - lw / 2, yQ - lh / 2],
      [xQ + lw / 2, yQ - lh / 2],
      [xQ + lw / 2, yQ + lh / 2],
      [xQ - lw / 2, yQ + lh / 2]
    ], { close: true, color: v.color.ink, width: 1.4 })

    v.circle(m, a, 0, 0.07, { fill: v.color.ink })
    v.circle(m, xQ, yQ, 0.06, { fill: v.color.ink })
    if (yP <= H) v.circle(m, 0, yP, 0.07, { fill: v.color.ink })
    if (onSide) {
      v.circle(m, 0, yO, 0.07, { fill: v.color.ink })
      v.circle(m, xN, H, 0.07, { fill: v.color.ink })
    }

    v.label(m, -0.2, H, 'e', { color: v.color.ink })
    v.label(m, -0.25, 0, 'f', { color: v.color.ink })
    v.label(m, a, -0.28, 'M', { color: v.color.ink })
    v.label(m, xQ, yQ - 0.72, '激光笔', { color: v.color.graphite })
    v.label(m, xQ + 0.2, yQ + 0.15, 'Q', { color: v.color.ink })
    v.label(m, a / 2, 0.34, 'a', { color: v.color.graphite, size: 12 })
    if (yP <= H) {
      v.label(m, -0.2, yP, 'P', { color: v.color.ink })
      v.label(m, a * 0.38, yP * 0.38, 'd_1', { color: v.color.velocity })
    }
    if (onSide) {
      v.label(m, -0.2, yO, 'O', { color: v.color.ink })
      v.label(m, xN, H + 0.2, 'N', { color: v.color.ink })
      v.label(m, a * 0.5, yO * 0.58, 'd_2', { color: v.color.velocity })
      v.text(m, 7.4, 2.7, 'd_1 = ' + d1.toFixed(2) + ' cm', { align: 'left', color: v.color.velocity, size: 13 })
      v.text(m, 7.4, 1.95, 'd_2 = ' + d2.toFixed(2) + ' cm', { align: 'left', color: v.color.velocity, size: 13 })
      v.text(m, 7.4, 1.2, 'n = ' + (d2 / d1).toFixed(3), { align: 'left', color: v.color.charge, size: 13 })
    } else {
      v.text(m, 3.4, 3.6, '折射光未落到 ef 面上', { align: 'left', color: v.color.force, size: 14 })
    }

    v.text(m, 6.6, -1.55, '实线：实际光路', { align: 'left', color: v.color.charge, size: 12 })
    v.text(m, 6.6, -2.2, '虚线：QM 的延长线', { align: 'left', color: v.color.charge, size: 12 })
  },
})
</Figure>

<Figure title="图（b）毫米刻度尺读 PM" height={380} size="full" params={["d1"]}>
figure({
  draw(ctx, p, v) {
    const top = 0
    const bot = -0.62
    const m = v.view({ xmin: -0.4, xmax: 3.85, ymin: -1.08, ymax: 0.78, equal: true, pad: 10 })

    v.path(m, [
      [0, bot],
      [2.52, bot],
      [2.62, bot + 0.1],
      [2.7, bot - 0.03],
      [2.8, bot + 0.12],
      [2.9, bot + 0.02],
      [2.9, top - 0.06],
      [2.78, top + 0.05],
      [2.68, top - 0.04],
      [2.56, top],
      [0, top]
    ], { close: true, color: v.color.ink, width: 1.3 })

    for (let k = 0; k <= 25; k++) {
      const x = k / 10
      const major = k % 10 === 0
      const half = k % 5 === 0 && !major
      const h = major ? 0.26 : half ? 0.18 : 0.11
      v.line(m, x, top, x, top - h, { color: v.color.ink, width: major ? 1.6 : 1 })
      if (major) {
        v.text(m, x, top - 0.46, String(k / 10), { align: 'center', color: v.color.ink, size: 13 })
      }
    }
    v.text(m, 0.15, bot - 0.22, '0 cm', { align: 'left', color: v.color.graphite, size: 12 })

    const xM = p.d1
    const yLine = 0.36
    v.line(m, 0, yLine, xM, yLine, { color: v.color.velocity, dash: [5, 4], width: 1.6 })
    v.line(m, xM, yLine, xM, top, { color: v.color.velocity, dash: [2, 2], width: 1 })
    v.circle(m, 0, yLine, 0.045, { fill: v.color.velocity })
    v.circle(m, xM, yLine, 0.045, { fill: v.color.velocity })
    v.label(m, 0, yLine + 0.16, 'P', { color: v.color.ink })
    v.label(m, xM, yLine + 0.16, 'M', { color: v.color.ink })
  },
})
</Figure>

<Readout items={[
  {label: "当前 PM", symbol: "d_1", expr: "d1ang", unit: "cm", digits: 2, color: "velocity"},
  {label: "当前 OM", symbol: "d_2", expr: "d2ang", unit: "cm", digits: 2, color: "velocity"},
  {label: "n = d_2/d_1", symbol: "n", expr: "d2ang/d1ang", digits: 3, color: "charge"},
  {label: "折射角", symbol: "r", expr: "rDeg", unit: "°", digits: 1, color: "charge"},
  {label: "d_1 的相对误差", symbol: "δ_1", expr: "rel1", unit: "%", digits: 2, color: "force"},
  {label: "d_2 的相对误差", symbol: "δ_2", expr: "rel2", unit: "%", digits: 2, color: "force"}
]} />

<Plot
  title="d_1、d_2 随入射角变化"
  caption="两条曲线之比恒为 n。竖线以左，折射光打不到这块砖的 ef 面。"
  x={{name: "s", label: "i", unit: "°", min: 15, max: 70}}
  y={{label: "长度", unit: "cm", min: 0, max: 10}}
  series={[
    {label: "d_1 = PM", expr: "a/sin(deg(s))", color: "velocity", dash: true},
    {label: "d_2 = OM", expr: "n*a/sin(deg(s))", color: "velocity"}
  ]}
  marks={[
    {x: "angEdge", label: "再小就打不到 ef"},
    {x: "ang0", label: "题目数据"}
  ]}
  cursor="ang"
/>

<Plot
  title="长度测量的相对误差"
  caption="绝对误差取 0.05 cm，即最小分度 1 mm 的一半，只用来比较趋势。"
  x={{name: "s", label: "i", unit: "°", min: 15, max: 70}}
  y={{label: "δ", unit: "%", min: 0, max: 4}}
  series={[
    {label: "δ_1", expr: "dd*sin(deg(s))/a*100", color: "force", dash: true},
    {label: "δ_2", expr: "dd*sin(deg(s))/(n*a)*100", color: "force"}
  ]}
  marks={[
    {x: 20, label: "入射角较小"},
    {x: "ang0", label: "题目情形"},
    {x: 60, label: "入射角较大"}
  ]}
  cursor="ang"
/>

<Answer items={[
  {label: "PM 的长度", symbol: "d_1", expr: "d1", value: 2.25, unit: "cm", digits: 2},
  {label: "折射率表达式", text: "n = d_2/d_1"},
  {label: "折射率（3 位有效数字）", symbol: "n", expr: "nAns", value: 1.51, digits: 2},
  {label: "入射角应尽量", text: "小"}
]} />

## 四、结合图像理解

长度图里，$d_1 = a/\sin i$，$d_2 = na/\sin i$。入射角增大时两条曲线一起下降，比值不动，所以侧栏里的 $n$ 停在 $1.511$。题目情形（约 $41.8^\circ$）对应 $d_1 = 2.25\ \text{cm}$、$d_2 = 3.40\ \text{cm}$。再往左，代表尺寸的这块砖上 O 会滑出 ef 面，状态栏变成打不到 ef，实验无法标出 O。

相对误差图用 $\Delta d = 0.05\ \text{cm}$ 作比较。题目的长度下，

$$
\delta_1 = \frac{0.05}{2.25}\times 100\% \approx 2.2\%, \qquad \delta_2 = \frac{0.05}{3.40}\times 100\% \approx 1.5\%
$$

曲线随 $i$ 上升：把滑块放在 $20^\circ$ 和 $60^\circ$，后者的 $d_1$、$d_2$ 更短，$\delta_1$、$\delta_2$ 都更大。$\Delta d$ 换成别的常数，曲线只是整体放大或缩小，左右高低关系不变。因此在还能打到 ef 面的前提下，入射角应尽量小。

## 五、答案汇总

| 空 | 答案 |
|---|---|
| $d_1$ | $2.25\ \text{cm}$ |
| $n$ 的表达式 | $d_2/d_1$ |
| $n$（3 位有效数字） | $1.51$ |
| 入射角应尽量 | 小 |
