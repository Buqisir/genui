---
id: gd25-09
title: 矩形电场里的带电粒子
source: 2025 广东卷（部分试题）第 9 题（计算）
question: "一矩形上下方有两块长为 d 的绝缘板，左、右方有两块带电金属板，两端电势差为 u，一质量为 m，带正电的粒子从矩形左上角静止释放后往矩形内运动，第一次与下方绝缘板碰撞，碰撞处与左侧距离为 l。(1)求带电量 q；(2)当粒子与绝缘板第一次碰撞后，粒子带电量变为 Q，碰后瞬间粒子合外力与运动方向垂直，碰撞后水平方向速度不变，竖直速度大小变为原来的 k 倍（k < 1），求带电量 Q；(3)在静止释放后，从开始到第二次与绝缘板碰撞过程中，求电场力对粒子做的功 W。"
answers:
  - { name: q, value: 7.5e-8, unit: C }
  - { name: Q, value: 1.5e-7, unit: C }
  - { name: W, value: 1.8e-6, unit: J }
  - { name: t1, value: 0.1264911064, unit: s }
  - { name: t2, value: 0.2529822128, unit: s }
  - { name: xland, value: 0.2, unit: m }
---

左侧金属板带正电、右侧带负电，矩形区域内是水平向右的匀强电场。粒子带正电，电场力水平向右，重力竖直向下，两个力都是恒力，所以水平、竖直两个方向都是初速为零的匀加速运动。上下板标了绝缘，粒子碰到下板不进入板内，只是竖直速度反号。

题目只给了字母。下面取一组代表性数值：$m = 1\times 10^{-6}\,\mathrm{kg}$，$d = 0.30\,\mathrm{m}$，$h = 0.08\,\mathrm{m}$，$u = 20\,\mathrm{V}$，$l = 0.04\,\mathrm{m}$，$k = 0.5$，$g = 10\,\mathrm{m/s^2}$。答案的字母形式不依赖这一组数，数值只是拿来核对。

## 完整解答

**（1）求电量 $q$**

电场强度大小 $E = u/d$，电场力 $qE$ 水平向右，重力 $mg$ 竖直向下。从左上角静止释放到第一次碰下板，竖直位移是 $h$，水平位移是 $l$：

$$
h = \tfrac{1}{2}gt_1^2, \qquad l = \tfrac{1}{2}\,\frac{qE}{m}\,t_1^2
$$

两式相除，消去时间：

$$
\frac{l}{h} = \frac{qE}{mg} = \frac{qu}{mgd}
$$

$$
\boxed{q = \dfrac{mgdl}{uh}}
$$

代入代表性数值，$q = 7.5\times 10^{-8}\,\mathrm{C}$。

**（2）碰撞后的电量 $Q$**

碰前瞬间两个分速度：

$$
v_x = l\sqrt{\frac{2g}{h}}, \qquad v_y = -\sqrt{2gh}
$$

题目给定：碰后水平速度不变，竖直速度大小变为原来的 $k$ 倍并且反号（向上反弹）。碰后瞬间速度方向的斜率是

$$
\frac{v_y'}{v_x} = \frac{k\sqrt{2gh}}{l\sqrt{2g/h}} = \frac{kh}{l}
$$

碰后电量变成 $Q$，合外力是水平向右的 $QE$ 和竖直向下的 $mg$。它与运动方向垂直，两个方向的斜率互为负倒数：

$$
\frac{mg}{QE} = \frac{l}{kh}
$$

$$
\boxed{Q = \dfrac{mgdkh}{ul}}
$$

代入代表性数值，$kh = l$，碰后速度正好沿 $45^\circ$，垂直于它的合力也沿 $45^\circ$，所以 $QE = mg$，$Q = 1.5\times 10^{-7}\,\mathrm{C}$。

**（3）电场力做的功 $W$**

电场力始终水平，做功只看水平位移。第一次碰撞前水平走了 $l$，这一段的功是 $qEl$。

碰后竖直方向仍是加速度为 $g$ 的上抛运动：从速度 $k\sqrt{2gh}$ 减到零再落回下板，用时

$$
t_2 = \frac{2k\sqrt{2gh}}{g} = 2k\sqrt{\frac{2h}{g}}
$$

这一段的水平加速度是 $QE/m = gkh/l$，初速度仍是 $v_x$，水平位移

$$
s = v_x t_2 + \tfrac{1}{2}\,\frac{QE}{m}\,t_2^2 = 4kl + \frac{4k^3 h^2}{l}
$$

代入代表性数值，$s = 0.16\,\mathrm{m}$，落点 $x = l + s = 0.20\,\mathrm{m}$，没有超出右侧金属板，反弹的最高点也远低于上板，粒子一直在电场里。两段加起来，$u$、$d$ 都约掉：

$$
W = qEl + QEs = mg\left(\frac{l^2}{h} + 4k^2 h + \frac{4k^4 h^3}{l^2}\right)
$$

$$
\boxed{W = mg\!\left(\dfrac{l^{2}}{h} + 4k^{2}h + \dfrac{4k^{4}h^{3}}{l^{2}}\right)}
$$

代入代表性数值，$W = 1.8\times 10^{-6}\,\mathrm{J}$。

## 交互演示

拖动落点位置 $l$、极板电压 $u$ 和反弹系数 $k$，电量 $q$、$Q$ 会跟着变，使第一次落点始终落在这个 $l$ 上，碰后瞬间合外力也始终与速度垂直。$u$ 改变时 $q$ 和 $Q$ 同比例变化，运动轨迹和功 $W$ 都不变。画面按真实比例画出矩形。

<Param name="partM" label="质量 m" value={1e-6} hidden unit="kg" />

<Param name="d" label="板长 d" value={0.3} hidden unit="m" />

<Param name="h" label="高度 h" value={0.08} hidden unit="m" />

<Param name="u" label="极板电压 u" value={20} min={10} max={40} step={1} unit="V" />

<Param name="l" label="第一次落点 l" value={0.04} min={0.02} max={0.08} step={0.005} unit="m" />

<Param name="k" label="反弹系数 k" value={0.5} min={0.3} max={0.8} step={0.05} />

<Param name="grav" label="重力加速度" value={10} hidden unit="m/s²" />

<Param name="t" label="时间" value={0} min={0} max={1} step={0.001} unit="s" hidden />

<Define name="q" expr="partM*grav*d*l/(u*h)" unit="C" />

<Define name="Q" expr="partM*grav*d*k*h/(u*l)" unit="C" />

<Define name="s2" expr="4*k*l + 4*k^3*h^2/l" unit="m" />

<Define name="W" expr="q*(u/d)*l + Q*(u/d)*s2" unit="J" />

<Define name="t1" expr="sqrt(2*h/grav)" unit="s" />

<Define name="t2" expr="t1*(1 + 2*k)" unit="s" />

<Define name="xland" expr="l + s2" unit="m" />

<Define name="xpos" expr="t < t1 ? (grav*l/h)*t*t/2 : l + (grav*l/h)*t1*(t - t1) + (grav*k*h/l)*(t - t1)*(t - t1)/2" />

<Define name="work" expr="(t < t1 ? q*xpos : q*l + Q*(xpos - l))*(u/d)" />

<Question text="(1) 求带电量 q" set={{t: 0}} hint="水平位移与竖直位移之比就是电场力与重力之比" />

<Question text="(2) 碰后电量变为 Q，合外力与速度垂直" set={{t: "t1"}} hint="碰后瞬间看速度与合力是否正交" />

<Question text="(3) 从释放到第二次碰板，电场力做的功 W" set={{t: "t2"}} hint="电场力水平，功只由水平位移决定" />

<Preset label="代表性数值" set={{u: 20, l: 0.04, k: 0.5, t: 0}} />



<Motion name="box" until={1} mass="partM" charge="q"
  state={{x: 0, y: 0, vx: 0, vy: 0}}
  fields={[{label: "水平电场", E: "u/d", angle: 0, region: {xmin: 0, xmax: "d", ymin: 0, ymax: "h"}}]}
/>

<Sim title="矩形电场中的粒子" height={300} duration="t2" time="t"
  params={["box", "d", "h", "l", "q", "Q", "u", "partM", "grav", "k", "s2", "t1", "t2", "work"]}
  marks={[
    {t: 0, label: "静止释放"},
    {t: "t1", label: "第一次碰板"},
    {t: "t2", label: "第二次碰板"}
  ]}
  hud={[
    {symbol: "q", expr: "q*1e6", unit: "μC", digits: 3},
    {symbol: "Q", expr: "Q*1e6", unit: "μC", digits: 3},
    {symbol: "W", expr: "work*1e6", unit: "μJ", digits: 2}
  ]}
  legend={[{kind: "velocity", label: "速度"}, {kind: "force", label: "合外力"}, {kind: "field", label: "电场"}]}
  note="电场只存在于矩形内部；粒子大小不按比例">
sim({
  at(t, p) {
    const a1 = p.grav * p.l / p.h
    const a2 = p.grav * p.k * p.h / p.l
    const vx1 = a1 * p.t1
    const vy1 = p.grav * p.t1
    let x, y, vx, vy, hit
    if (t <= p.t1) {
      x = 0.5 * a1 * t * t
      y = p.h - 0.5 * p.grav * t * t
      vx = a1 * t
      vy = -p.grav * t
      hit = 0
    } else {
      const tau = Math.min(t, p.t2) - p.t1
      x = p.l + vx1 * tau + 0.5 * a2 * tau * tau
      y = Math.max(0, p.k * vy1 * tau - 0.5 * p.grav * tau * tau)
      vx = vx1 + a2 * tau
      vy = p.k * vy1 - p.grav * tau
      hit = 1
    }
    return { x, y, vx, vy, hit }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -0.04, xmax: 0.36, ymin: -0.05, ymax: 0.14, equal: true })
    v.regions(m, v.p.box)
    v.platesAt(m, v.p.d / 2, 0, v.p.d / 2, v.p.h, { gap: v.p.d })
    v.block(m, v.p.d / 2, v.p.h, v.p.d, 0.008, { label: "绝缘" })
    v.block(m, v.p.d / 2, -0.008, v.p.d, 0.008)
    v.dim(m, 0, v.p.h + 0.02, v.p.d, v.p.h + 0.02, "d")
    v.dim(m, v.p.d + 0.025, 0, v.p.d + 0.025, v.p.h, "h")
    v.dim(m, 0, -0.03, v.p.l, -0.03, "l")
    v.trail(m, (st) => [st.x, st.y], { kind: "velocity" })
    v.ball(m, s.x, s.y, 0.005, { charge: true })
    const sp = Math.hypot(s.vx, s.vy) || 1
    v.vec(m, s.x, s.y, s.vx / sp * 0.03, s.vy / sp * 0.03, { kind: "velocity", label: "v" })
    const qq = s.hit > 0.5 ? v.p.Q : v.p.q
    const fx = qq * v.p.u / v.p.d
    const fy = -v.p.partM * v.p.grav
    const fp = Math.hypot(fx, fy)
    v.vec(m, s.x, s.y, fx / fp * 0.03, fy / fp * 0.03, { kind: "force", label: "F" })
    v.event(m, v.p.l, 0, "第一次碰板", { at: v.p.t1, kind: "force" })
    v.event(m, v.p.l + v.p.s2, 0, "第二次碰板", { at: v.p.t2, kind: "force" })
    v.label(m, 0, v.p.h, "A")
    v.label(m, v.p.l, 0, "B")
  },
})
</Sim>

<Plot title="分速度" size="wide"
  x={{name: "tt", label: "t", unit: "s", min: 0, max: "t2"}}
  y={{label: "v", unit: "m/s"}}
  series={[
    {label: "v_x", expr: "tt < t1 ? (grav*l/h)*tt : (grav*l/h)*t1 + (grav*k*h/l)*(tt - t1)", color: "velocity"},
    {label: "v_y", expr: "tt < t1 ? -grav*tt : k*grav*t1 - grav*(tt - t1)", color: "accel", dash: true}
  ]}
  marks={[
    {x: "t1", label: "第一次碰板，v_y 反号"},
    {x: "t2", label: "第二次碰板"}
  ]}
  cursor="t"
/>

<Ledger title="电场力做功" size="narrow" unit="J" digits={7}
  parts={[
    {label: "碰前 qEl", expr: "q*(u/d)*l", color: "field"},
    {label: "碰后 QE·s", expr: "Q*(u/d)*s2", color: "charge"}
  ]}
  total={{label: "总功 W", expr: "W"}}
/>

<Status cases={[
  {when: "s2 < d - l", label: "第二次碰板仍在矩形内", tone: "success"},
  {label: "反弹后会飞出右侧，以上公式不再适用", tone: "warning"}
]} />

<Readout items={[
  {label: "碰前电量", symbol: "q", expr: "q*1e6", unit: "μC", digits: 3, color: "charge"},
  {label: "碰后电量", symbol: "Q", expr: "Q*1e6", unit: "μC", digits: 3, color: "charge"},
  {label: "碰后水平位移", symbol: "s", expr: "s2", unit: "m", digits: 3},
  {label: "电场力做功", symbol: "W", expr: "W*1e6", unit: "μJ", digits: 2, color: "field"}
]} />

<Answer items={[
  {label: "(1) 电量", expr: "q*1e6", unit: "μC", digits: 3},
  {label: "(2) 碰后电量", expr: "Q*1e6", unit: "μC", digits: 3},
  {label: "(3) 电场力的功", expr: "W*1e6", unit: "μJ", digits: 2}
]} />

## 结合图像

$v_x$–$t$ 是一条折线：碰前斜率是 $qE/m = gl/h$，碰后电量变成 $Q$，斜率变成 $Q/q$ 倍。$v_y$–$t$ 是斜率恒为 $-g$ 的直线，只在碰板那一刻从 $-\sqrt{2gh}$ 跳到 $+k\sqrt{2gh}$。

账本把功拆成两段。碰前那一段 $qEl = mgl^2/h$ 只由落点位置决定；碰后那一段既有碰前积累的水平速度，又有变大了的电量，所以占大头。

## 答案

（1）$\boxed{q = \dfrac{mgdl}{uh}}$

（2）$\boxed{Q = \dfrac{mgdkh}{ul}}$

（3）$\boxed{W = mg\!\left(\dfrac{l^{2}}{h} + 4k^{2}h + \dfrac{4k^{4}h^{3}}{l^{2}}\right)}$
