---
id: gd21-18
title: 挡风玻璃上的临界角
source: 2021 广东卷 第 18 题（选考·选修 3-4，计算；选考共 12 分，原卷未单列本题分值）
question: 如图所示，一种光学传感器是通过接收器 Q 接收到光的强度变化而触发工作的。光从挡风玻璃内侧 P 点射向外侧 M 点再折射到空气中，测得入射角为 α，折射角为 β；光从 P 点射向外侧 N 点，刚好发生全反射并被 Q 接收，求光从玻璃射向空气时临界角 θ 的正弦值表达式。
answers:
  - { name: sinTheta, value: 0.6667 }
---

光从挡风玻璃内侧的 P 点射出。射到外侧 M 点时，入射角 α 小于临界角，部分光折出到空气，折射角为 β。射到外侧 N 点时入射角刚好等于临界角 θ，光全部反射回内侧，被接收器 Q 接到。

题目只给字母。下面取代表性数值：空气折射率为 1，玻璃折射率取 $n = 1.50$，M 点入射角取 $\alpha = 30^\circ$。玻璃厚度和水平距离只用来画图，不按比例。

## 完整解答

光从玻璃射向空气。M 点处没有全反射，由斯涅尔定律

$$
n \sin\alpha = \sin\beta.
$$

N 点刚好全反射，入射角就是临界角，折射角为 $90^\circ$：

$$
n \sin\theta = \sin 90^\circ = 1
\quad\Rightarrow\quad
n = \frac{1}{\sin\theta}.
$$

代回 M 点的方程，消去未知的折射率：

$$
\frac{\sin\alpha}{\sin\theta} = \sin\beta
\quad\Rightarrow\quad
\sin\theta = \frac{\sin\alpha}{\sin\beta}.
$$

所以临界角的正弦值为 $\boxed{\dfrac{\sin\alpha}{\sin\beta}}$。

取 $n = 1.50$、$\alpha = 30^\circ$ 时，$\sin\beta = 1.50\times\sin 30^\circ = 0.75$，$\beta = 48.59^\circ$；临界角满足 $\sin\theta = 1/1.50 = 0.6667$，$\theta = 41.81^\circ$。正弦比 $\sin\alpha/\sin\beta = 0.5000/0.7500 = 0.6667$，与 $\sin\theta$ 相同。

## 交互演示

先看 M 点：拖动入射角，法线、入射角和折射角都由光路算出来。再切到 N 点：入射角等于临界角，光贴着外侧表面反射，全部回到内侧，被 Q 接收。

<Param name="spot" label="观察点" value={1} options={[{value: 1, label: "M 点：测 α、β"}, {value: 2, label: "N 点：刚好全反射"}]} />

<Param name="alpha" label="入射角 α" symbol="α" value={30} min={5} max={70} step={0.1} unit="°" />

<Param name="n" label="玻璃折射率" symbol="n" value={1.5} min={1.3} max={1.8} step={0.01} />

<Define name="crit" expr="lt0.glass.C" />

<Optics name="lt0" n0={1}
  media={[{name: "glass", n: "n", shape: {xmin: 0, xmax: 8, ymin: 0, ymax: 2.4}}]}
  rays={[{name: "a", from: [1.1, 0.2], angle: 0}]} />

<Optics name="lt" n0={1} length={3.2}
  media={[{name: "glass", n: "n", shape: {xmin: 0, xmax: 8, ymin: 0, ymax: 2.4}}]}
  rays={[
    {name: "a", from: [1.1, 0.2], angle: "90-alpha", color: "red"},
    {name: "c", from: [3.4, 0.2], angle: "90-crit", color: "red"}
  ]} />

<Define name="theta" expr="lt.glass.C" />

<Define name="beta" expr="lt.a.tir < 0.5 ? lt.a.r[1] : 90" />

<Define name="sinTheta" expr="sin(deg(theta))" />

<Question text="用 α、β 表示临界角 θ 的正弦值" set={{spot: 1, alpha: 30, n: 1.5}} hint="M 点消去 n，N 点用 sin θ = 1/n" />

<Question text="N 点刚好全反射时，入射角和临界角是什么关系？" set={{spot: 2, alpha: "theta", n: 1.5}} hint="入射角等于临界角，折射角是 90°" />

<Preset label="题目：M 点，α = 30°" set={{spot: 1, alpha: 30, n: 1.5}} />

<Preset label="N 点：刚好全反射" set={{spot: 2, alpha: "theta", n: 1.5}} />

<Status cases={[
  {when: "spot > 1.5", label: "N 点：入射角等于临界角，全部反射", tone: "success"},
  {when: "alpha < theta - 0.05", label: "M 点：α < θ，光折出空气", tone: "info"},
  {when: "alpha < theta + 0.05", label: "M 点：α 刚好到临界角", tone: "warning"},
  {label: "M 点：α > θ，已经全反射", tone: "warning"}
]} />

<Readout items={[
  {label: "折射角", symbol: "β", expr: "beta", unit: "°", digits: 2, color: "velocity"},
  {label: "临界角", symbol: "θ", expr: "theta", unit: "°", digits: 2, color: "force"},
  {label: "正弦比", symbol: "sin α/sin β", expr: "sinTheta", digits: 4, color: "charge"}
]} />

<Answer items={[
  {label: "临界角的正弦值", symbol: "sin θ", text: "sin α / sin β"},
  {label: "代表性数值", symbol: "sin θ", expr: "sinTheta", value: 0.6667, digits: 4}
]} />

<Figure title="挡风玻璃上的光路" height={340} size="full"
  params={["lt", "spot", "alpha", "beta", "theta"]}
  hud={[
    {symbol: "α", expr: "alpha", unit: "°", digits: 1},
    {symbol: "β", expr: "beta", unit: "°", digits: 1},
    {symbol: "θ", expr: "theta", unit: "°", digits: 1}
  ]}
  legend={[{kind: "force", label: "光线"}]}
  note="玻璃厚度和水平距离不按比例。M 点标出入射角和折射角，N 点是临界光线反射到 Q。">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.3, xmax: 8.4, ymin: -0.85, ymax: 3.6, equal: true })
    const atN = p.spot > 1.5
    const rad = Math.PI / 180
    const ang = atN ? p.theta : p.alpha
    const xHit = 3.4 + (2.4 - 0.2) * Math.tan((90 - ang) * rad)
    v.optics(m, p.lt, { normals: true, angles: true, rays: atN ? [] : ['a'] })
    if (atN) {
      const xQ = Math.min(7.5, xHit + (2.4 - 0.2) * Math.tan(ang * rad))
      v.ray(m, [[3.4, 0.2], [xHit, 2.4], [xQ, 0.2]])
      v.line(m, xHit, 2.05, xHit, 2.75, { color: v.color.graphite, dash: true })
      v.block(m, xQ - 0.2, 0, 0.4, 0.2, { label: 'Q' })
      v.label(m, xHit + 0.45, 2.85, 'N')
    } else {
      v.label(m, p.lt.a.x[1] - 0.45, 2.85, 'M')
    }
    v.label(m, 4.6, 3.25, '外侧')
    v.label(m, 3.2, -0.45, '内侧')
    v.label(m, atN ? 2.2 : 6.2, 1.15, '挡风玻璃')
    v.label(m, 0.65, -0.4, 'P')
  },
})
</Figure>

## 结合光路看临界角

M 点给出 $n = \sin\beta/\sin\alpha$，N 点给出 $n = 1/\sin\theta$。两者相等就消去了折射率。滑块在临界角上时，折射角读数是 $90^\circ$，正弦比读数仍是 $\sin\alpha/\sin\beta$，与 $\sin\theta$ 相同。

## 答案汇总

光从玻璃射向空气的临界角 $\theta$ 满足

$$
\boxed{\sin\theta = \dfrac{\sin\alpha}{\sin\beta}}.
$$
