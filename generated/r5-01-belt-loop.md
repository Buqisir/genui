---
id: r5-01-belt-loop
title: 传送带与圆轨道：到达指定高度且不脱轨
subject: physics
topic: 摩擦力做功与竖直圆周运动
source: 必修2 模块备考卷 15 题（13 分）
question: |
  一水平传送带 AB 始终保持 v=5 m/s 的恒定速率向右运行，A、B 间的距离 L=8 m。B 端右侧平滑连接一个竖直放置的光滑圆弧轨道，轨道最低点在 B 处，最高点为 N。将一质量 m=1 kg 的小物块轻轻放在传送带上距 A 点 2 m 处的 P 点，小物块随传送带运动到 B 点后恰好能冲上光滑圆弧轨道的最高点 N。小物块与传送带间的动摩擦因数 μ=0.5，g 取 10 m/s²。
  (1) 求该圆弧轨道的半径 r；
  (2) 要使小物块第一次滑上圆弧轨道时能到达 M 点（M 点为圆弧轨道右半侧上的点，高出 B 点 0.25 m），且小物块在圆弧轨道上不脱离轨道，求小物块放上传送带时的位置与 A 点的距离的范围。
answers:
  - { name: a, value: 5, unit: m/s² }
  - { name: tSync, value: 1, unit: s }
  - { name: sSync, value: 2.5, unit: m }
  - { name: uOriginal, value: 5, unit: m/s }
  - { name: vN, value: 2.2360679775, unit: m/s }
  - { name: r, value: 0.5, unit: m }
  - { name: uReach2, value: 5, unit: m²/s² }
  - { name: uTurn2, value: 10, unit: m²/s² }
  - { name: uLoop2, value: 25, unit: m²/s² }
  - { name: xMin, value: 0, unit: m }
  - { name: xLoopMax, value: 5.5, unit: m }
  - { name: xReturnMin, value: 7, unit: m }
  - { name: xReturnMax, value: 7.5, unit: m }
---

## 一、题目条件分析

“轻轻放上”表示物块初速度为零。物块先受到向右的滑动摩擦力，速度达到传送带速度后，两者不再相对滑动，物块做匀速运动。

物块沿圆弧内侧运动，轨道支持力指向圆心。保持接触要求支持力始终非负。**恰好通过最高点时，支持力为零，但速度不为零。**

第（2）问用 $x$ 表示放置位置到 A 的距离，用 $u$ 表示物块到达 B 时的速度。可选位置满足 $0\le x\le8\ \mathrm m$。

需要区分两条满足要求的路径：

- 到达 M 后继续上升，在圆心以下或圆心水平处停下，再沿原路返回。
- 保持接触，一直运动到最高点 N。

## 二、完整解答

### （1）圆弧轨道的半径

物块相对传送带滑动时：

$$
f=\mu mg,\qquad
a=\frac fm=\mu g=0.5\times10
=\boxed{5\ \mathrm{m/s^2}}.
$$

从静止加速到 $5\ \mathrm{m/s}$ 所需的时间和位移分别为

$$
t_{\text{同步}}=\frac va
=\boxed{1\ \mathrm s},
\qquad
s_{\text{同步}}=\frac{v^2}{2a}
=\boxed{2.5\ \mathrm m}.
$$

原题 P 到 B 的距离为 $8-2=6\ \mathrm m$，大于 $2.5\ \mathrm m$，所以物块先加速、再匀速，到达 B 时

$$
u_{\text{原题}}=\boxed{5\ \mathrm{m/s}}.
$$

在最高点 N 恰好保持接触：

$$
mg=\frac{mv_N^2}{r}
\quad\Rightarrow\quad v_N^2=gr.
$$

从 B 到 N，机械能守恒：

$$
\frac12mu_{\text{原题}}^2
=\frac12mv_N^2+mg(2r).
$$

联立得

$$
u_{\text{原题}}^2=5gr,
\qquad
r=\frac{25}{5\times10}
=\boxed{0.50\ \mathrm m}.
$$

最高点速度为

$$
v_N=\sqrt{gr}=\boxed{\sqrt5\ \mathrm{m/s}}
\approx2.236\ \mathrm{m/s}.
$$

> 不能把“恰好通过最高点”理解成 $v_N=0$。若最高点速度为零，重力无法由所需的向心加速度平衡，物块早已脱离轨道。

### （2）放置位置的范围

#### 先把放置位置换成入轨速度

物块在传送带上可运动的距离为 $8-x$。若尚未与传送带同步就到达 B，由匀加速运动公式得

$$
u^2=2a(8-x)=10(8-x).
$$

若已经同步，则 $u=5\ \mathrm{m/s}$。因此统一写成

$$
u^2=\min\!\left[10(8-x),\,25\right].
$$

#### 到达 M 的最低能量要求

M 比 B 高 $h_M=0.25\ \mathrm m$。机械能守恒给出

$$
v_M^2=u^2-2gh_M=u^2-5.
$$

能到达 M 至少需要

$$
u^2\ge2gh_M
=\boxed{5\ \mathrm{m^2/s^2}}.
$$

等号表示恰好在 M 速度降为零。

#### 路径一：上升后返回，全过程保持接触

设物块位置相对圆轨道最低点的圆心角为 $\theta$，从 B 沿右侧向上量取：

$$
h=r(1-\cos\theta).
$$

圆心方向的牛顿第二定律为

$$
F_N-mg\cos\theta=\frac{mv_\theta^2}{r}.
$$

结合机械能守恒，

$$
v_\theta^2=u^2-2gr(1-\cos\theta),
$$

得到

$$
F_N
=m\left(\frac{u^2}{r}-2g+3g\cos\theta\right).
$$

若物块在转折点速度降为零，则

$$
F_{N,\text{转折}}=mg\cos\theta_{\text{转折}}.
$$

转折时仍保持接触，需要 $\cos\theta_{\text{转折}}\ge0$，即转折高度不超过圆心高度 $r$。所以

$$
\frac{u^2}{2g}\le r
\quad\Rightarrow\quad
u^2\le2gr
=\boxed{10\ \mathrm{m^2/s^2}}.
$$

在上升过程中，支持力随高度增加而减小，转折点的支持力最小；返回过程中支持力重新增大。因此，这个条件保证往返过程不脱轨。

再结合到达 M 的要求：

$$
5\le u^2\le10.
$$

这一速度范围内尚未与传送带同步，代入 $u^2=10(8-x)$：

$$
5\le10(8-x)\le10.
$$

解得

$$
\boxed{7.0\ \mathrm m\le x\le7.5\ \mathrm m}.
$$

两个端点都可取：

- $x=7.5\ \mathrm m$：恰好到达 M 后返回。
- $x=7.0\ \mathrm m$：恰好到达圆心右侧的水平位置，速度和支持力瞬时均为零，随后沿轨道返回。

#### 路径二：保持接触通过最高点

上升过程中支持力不断减小，最高点是保持接触的最严格位置：

$$
F_{N,N}
=m\left(\frac{u^2}{r}-5g\right)\ge0.
$$

所以

$$
u^2\ge5gr
=\boxed{25\ \mathrm{m^2/s^2}}.
$$

传送带最多使物块获得 $u^2=25\ \mathrm{m^2/s^2}$，因此只能取临界值。物块必须在到达 B 前完成加速：

$$
8-x\ge s_{\text{同步}}=2.5\ \mathrm m.
$$

于是

$$
\boxed{0\ \mathrm m\le x\le5.5\ \mathrm m}.
$$

#### 为什么中间一段位置不允许？

当

$$
10<u^2<25
$$

时，物块有足够能量越过圆心水平位置，但又不能保持接触到最高点。

令支持力为零，得到脱离位置：

$$
\cos\theta_{\text{脱离}}
=\frac{2gr-u^2}{3gr}.
$$

脱离时速度平方为

$$
v_{\text{脱离}}^2=\frac{u^2-2gr}{3}>0.
$$

因此物块会在圆心上方、到达最高点之前脱离轨道。虽然它已经经过 M，却不满足“不脱离轨道”的要求。

最终范围为

$$
\boxed{x\in[0,\,5.5]\ \mathrm m\ \cup\ [7.0,\,7.5]\ \mathrm m}.
$$

## 三、交互演示

拖动放置位置 $x$，观察入轨速度与首次圆弧运动。传送带长度在动画中压缩显示，**示意图不按比例**。

圆弧半径始终由第（1）问的原题条件确定，改变第（2）问的放置位置不会改变轨道。

<Define name="m" expr="1" />

<Define name="g" expr="10" />

<Define name="mu" expr="0.5" />

<Define name="v" expr="5" />

<Define name="L" expr="8" />

<Define name="xOriginal" expr="2" />

<Define name="hM" expr="0.25" />

<Define name="a" expr="mu*g" />

<Define name="tSync" expr="v/a" />

<Define name="sSync" expr="v^2/(2*a)" />

<Define name="uOriginal" expr="sqrt(min(2*a*(L-xOriginal), v^2))" />

<Define name="r" expr="uOriginal^2/(5*g)" />

<Define name="vN" expr="sqrt(g*r)" />

<Define name="uReach2" expr="2*g*hM" />

<Define name="uTurn2" expr="2*g*r" />

<Define name="uLoop2" expr="5*g*r" />

<Define name="xMin" expr="0" />

<Define name="xLoopMax" expr="L-uLoop2/(2*a)" />

<Define name="xReturnMin" expr="L-uTurn2/(2*a)" />

<Define name="xReturnMax" expr="L-uReach2/(2*a)" />

<Param name="xPlace" label="放置位置距 A 的距离 x" value={2} min={0} max={8} step={0.05} unit="m" />

<Param name="t" label="时间" value={0} min={0} max={4} step={0.001} unit="s" hidden={true} />

<Define name="dB" expr="L-xPlace" />

<Define name="u2" expr="min(2*a*dB, v^2)" />

<Define name="uB" expr="sqrt(u2)" />

<Define name="tAcc" expr="uB/a" />

<Define name="tB" expr="dB <= sSync ? sqrt(2*dB/a) : tSync+(dB-sSync)/v" />

<Define name="thetaLimit" expr="u2 <= uTurn2 ? acos(clamp(1-u2/(2*g*r), -1, 1)) : (u2 < uLoop2 ? acos(clamp((2*g*r-u2)/(3*g*r), -1, 1)) : pi)" />

<Define name="hLimit" expr="r*(1-cos(thetaLimit))" />

<Define name="normalTop" expr="0" />

<Preset label="原题：P 距 A 2 m" set={{xPlace: 2, t: 0}} />

<Preset label="答案端点：5.5 m，临界过顶" set={{xPlace: "xLoopMax", t: 0}} />

<Preset label="答案端点：7.0 m，在圆心水平处返回" set={{xPlace: "xReturnMin", t: 0}} />

<Preset label="答案端点：7.5 m，恰好到达 M" set={{xPlace: "xReturnMax", t: 0}} />

<Preset label="对照：6.0 m，经过 M 后脱轨" set={{xPlace: 6, t: 0}} />

<Preset label="对照：7.8 m，到不了 M" set={{xPlace: 7.8, t: 0}} />

<Status cases={[
  {when: "u2 < uReach2 - 1e-6", label: "入轨能量不足：到不了 M", tone: "warning"},
  {when: "u2 <= uTurn2 + 1e-6", label: "满足要求：到达 M，保持接触并返回", tone: "success"},
  {when: "u2 < uLoop2 - 1e-6", label: "不满足要求：经过 M 后会脱离轨道", tone: "danger"},
  {label: "满足要求：经过 M，临界通过最高点 N", tone: "success"}
]} />

<Readout items={[
  {label: "放置位置 x", expr: "xPlace", unit: "m", digits: 2},
  {label: "到 B 的距离", expr: "dB", unit: "m", digits: 2},
  {label: "入轨速度 u", expr: "uB", unit: "m/s", digits: 3},
  {label: "入轨速度平方 u²", expr: "u2", unit: "m²/s²", digits: 2},
  {label: "到达 B 的时刻", expr: "tB", unit: "s", digits: 3},
  {label: "首次上升的终点高度", expr: "hLimit", unit: "m", digits: 3}
]} />

“首次上升的终点”可能是转折点、脱离点或最高点 N。动画在首次返回 B、脱离轨道或到达 N 时定格；**定格表示本段演示结束，不表示物块随后静止**。脱轨后的抛体运动不属于本题要求，未继续演示。

<Sim
  title="从放上传送带到首次圆弧运动"
  height={420}
  duration="tB + 1.2"
  time="t"
  params={["m", "g", "r", "L", "xPlace", "a", "v", "uB", "u2", "tAcc", "tB", "hM", "thetaLimit", "uTurn2", "uLoop2"]}
  legend={[
    {kind: "velocity", symbol: "v", label: "速度"},
    {kind: "force", symbol: "F", label: "力"},
    {kind: "strobe", label: "每 0.1 s 的位置"}
  ]}
  note="传送带长度压缩显示（实际 8 m，圆弧半径 0.5 m）；力的箭头长度按 mg 比例，支持力过长时截短。"
  marks={[
    {t: 0, label: "轻轻放上"},
    {t: "tAcc", label: "加速阶段结束"},
    {t: "tB", label: "到达 B，进入圆弧"}
  ]}
>
sim({
  init(p) {
    return {
      t: 0,
      phase: p.tB > 0 ? 'belt' : 'arc',
      x: p.xPlace,
      theta: 0,
      omega: p.uB / p.r,
      speed: 0,
      ended: p.uB < 1e-12,
      message: p.uB < 1e-12 ? '初速度为零，不能沿圆弧上升' : '',
    }
  },
  step(s, dt, p) {
    const nextTime = s.t + dt
    if (s.ended) return { ...s, t: nextTime }

    let z = { ...s, t: nextTime }
    let arcDt = dt

    if (s.phase === 'belt') {
      if (nextTime < p.tB) {
        const ta = Math.min(nextTime, p.tAcc)
        z.x = p.xPlace + 0.5 * p.a * ta * ta
          + p.uB * Math.max(0, nextTime - p.tAcc)
        z.speed = Math.min(p.a * nextTime, p.uB)
        return z
      }
      z.phase = 'arc'
      z.x = p.L
      z.theta = 0
      z.omega = p.uB / p.r
      z.speed = p.uB
      arcDt = nextTime - p.tB
    }

    if (arcDt <= 0) return z

    const th0 = z.theta
    const w0 = z.omega
    const acceleration = th => -p.g / p.r * Math.sin(th)

    const k1th = w0
    const k1w = acceleration(th0)
    const k2th = w0 + arcDt * k1w / 2
    const k2w = acceleration(th0 + arcDt * k1th / 2)
    const k3th = w0 + arcDt * k2w / 2
    const k3w = acceleration(th0 + arcDt * k2th / 2)
    const k4th = w0 + arcDt * k3w
    const k4w = acceleration(th0 + arcDt * k3th)

    z.theta = th0 + arcDt * (k1th + 2*k2th + 2*k3th + k4th) / 6
    z.omega = w0 + arcDt * (k1w + 2*k2w + 2*k3w + k4w) / 6

    const willDetach = p.u2 > p.uTurn2 + 1e-9
      && p.u2 < p.uLoop2 - 1e-9

    if (willDetach && z.theta >= p.thetaLimit) {
      z.theta = p.thetaLimit
      z.omega = Math.sqrt(Math.max(
        0,
        p.u2 - 2*p.g*p.r*(1-Math.cos(z.theta))
      )) / p.r
      z.ended = true
      z.message = '支持力降为零：脱离轨道，演示定格'
    } else if (p.u2 >= p.uLoop2 - 1e-9 && z.theta >= Math.PI) {
      z.theta = Math.PI
      z.omega = Math.sqrt(Math.max(0, p.u2 - 4*p.g*p.r)) / p.r
      z.ended = true
      z.message = '到达 N：临界过顶，演示定格'
    } else if (z.theta <= 0 && z.omega < 0) {
      z.theta = 0
      z.omega = -p.uB / p.r
      z.ended = true
      z.message = '首次返回 B：演示定格'
    }

    z.speed = p.r * Math.abs(z.omega)
    return z
  },
  draw(ctx, s, v) {
    const p = v.p
    const r = p.r
    const bx = 4 * r
    const rb = 0.11 * r
    const map = v.view({ xmin: -0.5 * r, xmax: bx + 1.85 * r, ymin: -0.95 * r, ymax: 2.55 * r, pad: 18, equal: true })
    const pos = (st) => st.phase === 'belt'
      ? [bx * st.x / p.L, rb]
      : [bx + (r - rb) * Math.sin(st.theta), r - (r - rb) * Math.cos(st.theta)]

    // 传送带：长度压缩显示，履带纹按带速移动
    v.conveyor(map, 0, 0, bx, { speed: p.v * bx / p.L, r: 12 })
    v.arrow(map, 0.9 * r, -0.62 * r, 1.7 * r, -0.62 * r, { color: v.color.velocity, width: 2 })
    v.text(map, 1.8 * r, -0.62 * r, '传送带 v = ' + p.v.toFixed(0) + ' m/s', { align: 'left', color: v.color.velocity, size: 12 })
    v.text(map, 0, 0.16 * r, 'A', { color: v.color.ink, size: 13 })
    const xP = bx * p.xPlace / p.L
    v.line(map, xP, -0.02 * r, xP, -0.3 * r, { color: v.color.graphite, width: 1 })
    v.text(map, xP, -0.4 * r, 'P', { color: v.color.graphite, size: 12 })

    // 光滑圆弧轨道：内侧墨线 + 外侧短刻线表示实体
    const arc = []
    for (let i = 0; i <= 90; i++) {
      const th = Math.PI * i / 90
      arc.push([bx + r * Math.sin(th), r * (1 - Math.cos(th))])
    }
    v.path(map, arc, { color: v.color.ink, width: 3 })
    for (let i = 1; i < 18; i++) {
      const th = Math.PI * i / 18
      v.line(map, bx + r * Math.sin(th), r - r * Math.cos(th), bx + 1.1 * r * Math.sin(th), r - 1.1 * r * Math.cos(th), { color: v.color.steel, width: 1 })
    }
    v.circle(map, bx, r, 2.5, { px: true, fill: v.color.steel })
    v.text(map, bx - 0.1 * r, r, 'O', { align: 'right', color: v.color.graphite, size: 12 })
    v.text(map, bx - 0.12 * r, 2.08 * r, 'N', { align: 'right', color: v.color.ink, size: 13 })
    v.text(map, bx - 0.12 * r, -0.12 * r, 'B', { color: v.color.ink, size: 13 })
    const thetaM = Math.acos(1 - p.hM / r)
    const mx = bx + r * Math.sin(thetaM)
    v.circle(map, mx, p.hM, 3, { px: true, fill: v.color.ink })
    v.text(map, mx + 0.16 * r, p.hM + 0.04 * r, 'M', { align: 'left', color: v.color.ink, size: 13 })
    v.line(map, bx, p.hM, mx, p.hM, { color: v.color.steel, width: 1, dash: [3, 3] })
    v.dim(map, bx + 1.42 * r, 0, bx + 1.42 * r, p.hM, '0.25 m', { offset: 0 })

    v.strobe(map, (st) => pos(st), { every: 0.1, r: 2.2 })

    const [px, py] = pos(s)
    if (s.phase === 'arc') v.line(map, bx, r, px, py, { color: v.color.steel, width: 1, dash: [3, 3] })
    v.ball(map, px, py, rb, { label: 'm' })

    const k = 0.12 * r
    const fk = 0.32 * r
    if (s.phase === 'belt') {
      if (s.speed > 0.02) v.vec(map, px, py, k * s.speed, 0, { kind: 'velocity', label: 'v' })
      if (s.t < p.tAcc) v.vec(map, px, py - rb, fk * p.a / p.g, 0, { kind: 'force', label: 'f' })
    } else {
      const dir = s.omega >= 0 ? 1 : -1
      if (s.speed > 0.02) v.vec(map, px, py, dir * k * s.speed * Math.cos(s.theta), dir * k * s.speed * Math.sin(s.theta), { kind: 'velocity', label: 'v' })
      const normal = Math.max(0, p.m * (r * s.omega * s.omega + p.g * Math.cos(s.theta)))
      v.vec(map, px, py, 0, -fk, { kind: 'force', label: 'mg' })
      const nl = Math.min(fk * normal / (p.m * p.g), 1.1 * r)
      if (nl > 1e-3) v.vec(map, px, py, -nl * Math.sin(s.theta), nl * Math.cos(s.theta), { kind: 'force', label: 'F_N' })
    }

    v.text(map, bx + 1.8 * r, 2.3 * r, 'v = ' + s.speed.toFixed(2) + ' m/s', { align: 'right', color: v.color.velocity, size: 13 })
    if (s.phase === 'arc') {
      const normal = Math.max(0, p.m * (r * s.omega * s.omega + p.g * Math.cos(s.theta)))
      v.text(map, bx + 1.8 * r, 2.1 * r, 'F_N = ' + normal.toFixed(1) + ' N', { align: 'right', color: v.color.force, size: 13 })
    }

    if (p.tAcc < p.tB - 1e-3) v.event(map, px, py, '与传送带共速', { at: p.tAcc, kind: 'velocity' })
    v.event(map, bx, rb, '到达 B，进入圆弧', { at: p.tB, kind: 'velocity' })
    if (s.ended) {
      const bad = s.message.includes('脱离')
      v.label(map, px, py, s.message, { chip: true, color: bad ? v.color.force : v.color.velocity, place: 'above-left', offset: 18 })
    }
  },
})
</Sim>

<Plot
  title="传送带阶段的速度：达到带速后不再加速"
  x={{name: "t", label: "t", unit: "s", min: 0, max: "max(tB, 0.1)"}}
  y={{label: "速度", unit: "m/s", min: 0, max: 5.5}}
  series={[
    {label: "物块在带上的速度", expr: "min(a*t, uB)", color: "velocity"},
    {label: "传送带速度", expr: "v", color: "steel", dash: true}
  ]}
  marks={[
    {x: "tAcc", series: 0, label: "加速结束"},
    {x: "tB", series: 0, label: "进入圆弧"}
  ]}
  cursor="t"
/>

这幅速度图只覆盖传送带阶段。动画进入圆弧后，时间游标超出图示区间，圆弧上的速度由动画显示。

<Plot
  title="用入轨速度平方判断放置位置"
  x={{name: "xPlace", label: "距 A 的距离 x", unit: "m", min: 0, max: 8}}
  y={{label: "速度平方", unit: "m²/s²", min: 0, max: 28}}
  series={[
    {label: "入轨速度平方 u²", expr: "min(2*a*(L-xPlace), v^2)", color: "velocity"},
    {label: "到达 M 的下限", expr: "uReach2", color: "ink", dash: true},
    {label: "安全返回的上限", expr: "uTurn2", color: "graphite", dash: true},
    {label: "保持接触过顶的下限", expr: "uLoop2", color: "steel", dash: true}
  ]}
  marks={[
    {x: "xLoopMax", series: 0, label: "5.5 m：完成加速"},
    {x: "xReturnMin", series: 0, label: "7.0 m：圆心水平处返回"},
    {x: "xReturnMax", series: 0, label: "7.5 m：恰好到达 M"}
  ]}
  cursor="xPlace"
/>

<ForceDiagram
  title="原题的临界最高点：支持力为零，重力提供向心力"
  surface={{type: "none"}}
  body={{shape: "ball", label: "m"}}
  forces={[
    {label: "mg", angle: -90, magnitude: "m*g", showValue: true, unit: "N", digits: 1},
    {label: "F_N", angle: -90, magnitude: "normalTop", showValue: true, unit: "N", digits: 1}
  ]}
/>

## 四、结合图像理解关键时刻

| 放置位置 | 入轨速度平方 | 关键时刻与结果 |
|---|---:|---|
| $0\le x\le5.5\ \mathrm m$ | $25\ \mathrm{m^2/s^2}$ | 已达到带速；经过 M 后，恰好保持接触到达 N |
| $5.5<x<7.0\ \mathrm m$ | $10<u^2<25$ | 经过 M；随后在圆心上方支持力降为零，以非零速度脱轨 |
| $x=7.0\ \mathrm m$ | $10\ \mathrm{m^2/s^2}$ | 在圆心水平处速度和支持力瞬时均为零，随后返回 |
| $7.0<x<7.5\ \mathrm m$ | $5<u^2<10$ | 经过 M，在 M 与圆心水平位置之间转折，始终保持接触 |
| $x=7.5\ \mathrm m$ | $5\ \mathrm{m^2/s^2}$ | 在 M 速度降为零，随后返回 |
| $7.5<x\le8.0\ \mathrm m$ | $u^2<5$ | 上升高度不足，到不了 M |

**到达 M 与始终不脱轨是两个条件。** 蓝色曲线（u²）位于“到达 M 的下限”以上，只能说明能到达 M；还必须落在“安全返回的上限”以下，或达到“保持接触过顶的下限”。

**支持力为零也不一定立即脱轨。** 在 $x=7.0\ \mathrm m$ 的转折点，物块随后向下返回，所需支持力重新变为正；在中间禁区内，物块却以非零速度继续向上，继续贴轨将要求轨道提供拉力，因此发生脱离。

## 五、答案汇总

| 小问 | 答案 |
|---|---|
| （1）圆弧轨道半径 | $\boxed{r=0.50\ \mathrm m}$ |
| （2）放置位置到 A 的距离 | $\boxed{x\in[0,\,5.5]\ \mathrm m\ \cup\ [7.0,\,7.5]\ \mathrm m}$ |
