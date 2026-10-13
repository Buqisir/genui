---
id: gd21-04
title: 曲杆道闸抬起
source: 2021 广东卷 第 4 题（单选，4 分）
question: "由于高度限制，车库出入口采用图所示的曲杆道闸，道闸由转动杆 OP 与横杆 PQ 链接而成，P、Q 为横杆的两个端点。在道闸抬起过程中，杆 PQ 始终保持水平。杆 OP 绕 O 点从与水平方向成 30°匀速转动到 60°的过程中，下列说法正确的是（　　）\n\nA. P 点的线速度大小不变\n\nB. P 点的加速度方向不变\n\nC. Q 点在竖直方向做匀速运动\n\nD. Q 点在水平方向做匀速运动"
choice: A
answers: []
---

曲杆道闸由转动杆 OP 和始终水平的横杆 PQ 链接而成。杆 OP 绕 O 从与水平方向成 $30^\circ$ 匀速转到 $60^\circ$，角速度 $\omega$ 恒定。题目没有给出杆长和角速度，下面取 OP 长 $L = 2\,\mathrm{m}$、PQ 长 $d = 3\,\mathrm{m}$、$\omega = 1\,\mathrm{rad/s}$ 作代表值，只用来看各量随角度怎么变。

<Param name="theta" label="OP 与水平方向的夹角" symbol="θ" value={30} min={30} max={60} step={1} unit="°" />

<Param name="L" label="OP 长" value={2} hidden unit="m" />

<Param name="d" label="PQ 长" value={3} hidden unit="m" />

<Param name="omega" label="角速度" symbol="ω" value={1} hidden unit="rad/s" />

<Define name="vP" expr="omega*L" />

<Define name="aP" expr="omega^2*L" />

<Define name="vQy" expr="omega*L*sin(deg(theta))" />

<Define name="vQx" expr="omega*L*cos(deg(theta))" />

<Preset label="起始 30°" set={{theta: 30}} />

<Preset label="抬到 60°" set={{theta: 60}} />

<Question text="A. P 点的线速度大小不变" set={{theta: 45}} hint="拖动角度，看 v_P 是否始终是 ωL" />

<Question text="B. P 点的加速度方向不变" set={{theta: 45}} hint="加速度始终指向转轴 O，方向随杆一起转" />

<Question text="C. Q 点在竖直方向做匀速运动" set={{theta: 45}} hint="比较 30° 和 60° 时的 v_y" />

<Question text="D. Q 点在水平方向做匀速运动" set={{theta: 45}} hint="比较 30° 和 60° 时的 v_x" />

<Status cases={[
  {when: "abs(theta - 30) < 0.5", label: "起始位置：θ = 30°", tone: "info"},
  {when: "abs(theta - 60) < 0.5", label: "抬到终了位置：θ = 60°", tone: "info"},
  {label: "抬起过程中", tone: "neutral"}
]} />

<Readout items={[
  {label: "P 的线速度", symbol: "v_P", expr: "vP", unit: "m/s", digits: 2, color: "velocity"},
  {label: "P 的加速度大小", symbol: "a_P", expr: "aP", unit: "m/s²", digits: 2, color: "accel"},
  {label: "Q 的竖直分速度", symbol: "v_y", expr: "vQy", unit: "m/s", digits: 2, color: "velocity"},
  {label: "Q 的水平分速度", symbol: "v_x", expr: "vQx", unit: "m/s", digits: 2, color: "force"}
]} />

<Answer items={[
  {label: "答案", text: "A"},
  {label: "P 的线速度", symbol: "v_P", expr: "vP", unit: "m/s", digits: 2},
  {label: "P 的加速度大小", symbol: "a_P", expr: "aP", unit: "m/s²", digits: 2},
  {label: "30° 时 Q 的竖直分速度", symbol: "v_y", text: "ωL/2，随后增大"},
  {label: "30° 时 Q 的水平分速度", symbol: "v_x", text: "ωL·√3/2，随后减小"}
]} />

<Figure title="曲杆道闸" height={340} params={["theta", "L", "d"]} note="杆长取代表值，不按比例。实线是当前位置，虚线是 30° 和 60° 两个端点位置。" legend={[{kind: "velocity", label: "P 的线速度"}, {kind: "accel", label: "P 的加速度"}]}>
figure({
  draw(ctx, p, v) {
    const L = p.L
    const d = p.d
    const pose = (deg) => {
      const rad = deg * Math.PI / 180
      const px = L * Math.cos(rad)
      const py = L * Math.sin(rad)
      return { px, py, qx: px + d, qy: py }
    }
    const now = pose(p.theta)
    const lo = pose(30)
    const hi = pose(60)
    const m = v.view({ xmin: -0.85, xmax: d + L + 0.9, ymin: -0.9, ymax: L + 0.85, equal: true })
    v.ground(m, -0.55, d + L + 0.55, 0)
    v.wall(m, -0.16, 0, L * 0.42, { side: "left" })
    const ghost = (q, tag, dy) => {
      v.bar(m, 0, 0, q.px, q.py, { thick: 7, ghost: true })
      v.bar(m, q.px, q.py, q.qx, q.qy, { thick: 7, ghost: true })
      v.circle(m, q.px, q.py, 0.045, { fill: v.color.steel })
      v.circle(m, q.qx, q.qy, 0.045, { fill: v.color.steel })
      v.label(m, q.qx + 0.28, q.qy + dy, tag)
    }
    ghost(lo, "30°", -0.28)
    ghost(hi, "60°", 0.32)
    v.bar(m, 0, 0, now.px, now.py, { thick: 9 })
    v.bar(m, now.px, now.py, now.qx, now.qy, { thick: 9 })
    v.circle(m, 0, 0, 0.07, { fill: v.color.ink })
    v.circle(m, now.px, now.py, 0.06, { fill: v.color.ink })
    v.circle(m, now.qx, now.qy, 0.06, { fill: v.color.ink })
    v.line(m, 0.12, 0, L + 0.45, 0, { color: v.color.steel, dash: true })
    v.ellipse(m, 0, 0, 0.62, 0.62, { from: 0, to: p.theta, color: v.color.ink })
    v.label(m, 0.9, 0.22, "θ")
    const tx = -Math.sin(p.theta * Math.PI / 180)
    const ty = Math.cos(p.theta * Math.PI / 180)
    v.vec(m, now.px, now.py, tx * 0.75, ty * 0.75, { kind: "velocity", label: "v_P" })
    const ax = -Math.cos(p.theta * Math.PI / 180)
    const ay = -Math.sin(p.theta * Math.PI / 180)
    v.vec(m, now.px, now.py, ax * 0.6, ay * 0.6, { kind: "accel", label: "a_P" })
    v.label(m, -0.42, -0.38, "O")
    v.label(m, now.px + 0.05, now.py + 0.38, "P")
    v.label(m, now.qx + 0.3, now.qy + 0.02, "Q")
  },
})
</Figure>

<Plot title="线速度大小不随角度变" size="wide" caption="角速度恒定，半径不变，所以 v_P 是一条水平线"
  x={{name: "th", label: "θ", unit: "°", min: 30, max: 60}}
  y={{label: "v_P", unit: "m/s", min: 0, max: 3}}
  series={[{label: "v_P", expr: "omega*L", color: "velocity"}]}
  cursor="theta"
/>

<Plot title="P 的加速度方向随杆转动" size="narrow" caption="方向角是加速度与水平向右的夹角，从 210° 变到 240°"
  x={{name: "th", label: "θ", unit: "°", min: 30, max: 60}}
  y={{label: "方向角", unit: "°", min: 200, max: 250}}
  series={[{label: "a 的方向", expr: "180 + th", color: "accel"}]}
  cursor="theta"
/>

<Plot title="Q 的两个分速度都在变" caption="v_y = ωL sinθ 随θ 增大，v_x = ωL cosθ 随θ 减小，两个都不是匀速"
  x={{name: "th", label: "θ", unit: "°", min: 30, max: 60}}
  y={{label: "v", unit: "m/s", min: 0, max: 2.2}}
  series={[
    {label: "v_y", expr: "omega*L*sin(deg(th))", color: "velocity"},
    {label: "v_x", expr: "omega*L*cos(deg(th))", color: "force", dash: true}
  ]}
  cursor="theta"
/>

## 题目条件分析

道闸抬起时，杆 OP 绕固定轴 O 匀速转动，角速度 $\omega$ 不变，转角从 $30^\circ$ 到 $60^\circ$。横杆 PQ 与 OP 在 P 处链接，而且整个过程中 PQ 始终水平，所以 PQ 做平动：它上每一点的速度都与 P 点相同，Q 点不是另外一种运动。

把 O 取为原点，$x$ 轴水平向右，$y$ 轴竖直向上。设 OP 长为 $L$，PQ 长为 $d$，则

$$
P\big(L\cos\theta,\; L\sin\theta\big),\qquad
Q\big(L\cos\theta + d,\; L\sin\theta\big).
$$

## 完整解答

**A. 正确。** P 点绕 O 做匀速圆周运动，半径 $L$ 不变，角速度 $\omega$ 不变，线速度大小

$$
v_P = \omega L
$$

在整个过程中都不变。方向始终沿切线，随着杆转动而改变，但选项只说大小不变。

**B. 错误。** 匀速圆周运动的切向加速度为零，加速度只有指向圆心的法向分量，大小

$$
a_P = \omega^2 L
$$

不变，方向始终沿杆指向 O。杆从 $30^\circ$ 转到 $60^\circ$，这个方向也转过了 $30^\circ$，所以加速度方向在变。

**C. 错误。** PQ 平动，Q 与 P 的速度相同。把 P 的线速度沿水平和竖直分解：线速度垂直于 OP，向上偏左，与竖直方向的夹角就是 $\theta$，所以

$$
v_y = v_P\sin\theta = \omega L\sin\theta.
$$

$\theta$ 从 $30^\circ$ 增到 $60^\circ$，$\sin\theta$ 从 $\tfrac12$ 增到 $\tfrac{\sqrt3}{2}$，$v_y$ 不断增大，不是匀速运动。

**D. 错误。** 同样分解，水平分速度指向转轴一侧，大小

$$
v_x = v_P\cos\theta = \omega L\cos\theta.
$$

$\cos\theta$ 从 $\tfrac{\sqrt3}{2}$ 减到 $\tfrac12$，$v_x$ 不断减小，也不是匀速运动。这也可以直接对 Q 的坐标求导：$x_Q = L\cos\theta + d$，$\dot x_Q = -L\sin\theta\cdot\omega$，大小随 $\theta$ 变化。

四个选项里只有 A 成立，答案为 $\boxed{A}$。

## 交互演示

拖动「OP 与水平方向的夹角」，从 $30^\circ$ 拖到 $60^\circ$。道闸上 $v_P$ 的箭头长度不变、方向始终垂直于杆；$a_P$ 的箭头始终指向 O，方向随着杆一起转。侧栏的 $v_P$ 和 $a_P$ 两个数字不动，$v_y$ 越来越大、$v_x$ 越来越小。

## 结合图像看关键时刻

第一张图是水平线，对应 A：线速度大小与 $\theta$ 无关。

第二张图是一条斜线，对应 B：加速度始终指向 O，它与水平向右的夹角从 $210^\circ$ 变到 $240^\circ$，方向没有保持不变。

第三张图里 $v_y$ 上升、$v_x$ 下降，对应 C 和 D：两个分速度都随 $\theta$ 变化，不是匀速。在 $30^\circ$ 处 $v_x = \omega L\cdot\sqrt3/2$ 大于 $v_y = \omega L/2$；到 $60^\circ$ 处两者对调。

## 答案汇总

选项 A 正确，B、C、D 错误。答案为 $\boxed{A}$。
