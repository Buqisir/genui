---
id: gd21-13
title: 算盘上的两颗算珠
source: 2021 广东卷 第 13 题（计算；必考题共 42 分，原卷未单列本题分值）
question: |
  算盘是我国古老的计算工具，中心带孔的相同算珠可在算盘的固定导杆上滑动，使用前算珠需要归零，如图所示，水平放置的算盘中有甲、乙两颗算珠未在归零位置，甲靠边框 b，甲、乙相隔 s_1 = 3.5×10^{-2} m，乙与边框 a 相隔 s_2 = 2.0×10^{-2} m，算珠与导杆间的动摩擦因数 μ = 0.1。现用手指将甲以 0.4 m/s 的初速度拨出，甲、乙碰撞后甲的速度大小为 0.1 m/s，方向不变，碰撞时间极短且不计，重力加速度 g 取 10 m/s^2。

  （1）通过计算，判断乙算珠能否滑动到边框 a；

  （2）求甲算珠从拨出到停下所需的时间。
answers:
  - { name: v1, value: 0.3, unit: m/s }
  - { name: vYi0, value: 0.2, unit: m/s }
  - { name: sYi, value: 0.02, unit: m }
  - { name: tJia, value: 0.2, unit: s }
---

水平导杆上，甲、乙是两颗相同的算珠。甲从边框 b 一侧以 $v_0 = 0.4\ \mathrm{m/s}$ 向边框 a 滑去，走完间隔 $s_1$ 后撞上原来静止的乙。碰撞时间极短，碰撞期间摩擦冲量可以忽略，系统动量保守；碰撞后甲的速度大小变成 $0.1\ \mathrm{m/s}$、方向仍指向 a。滑动时动摩擦力与速度反向，加速度大小为 $\mu g$。题目没有给算珠质量，下面取代表性质量 $m = 1\ \mathrm{kg}$：加速度与质量无关，动量保守只用到两珠相同。

## 完整解答

滑动摩擦力 $f = \mu mg$，由牛顿第二定律

$$
a = \frac{f}{m} = \mu g = 0.1 \times 10 = 1\ \mathrm{m/s^2}
$$

方向与速度相反。

**碰撞前。** 甲受摩擦减速，走过 $s_1$ 后的速度 $v_1$ 由

$$
v_1^2 = v_0^2 - 2 a s_1 = 0.16 - 2 \times 1 \times 3.5 \times 10^{-2} = 0.09
$$

$$
\boxed{v_1 = 0.3\ \mathrm{m/s}}, \qquad t_1 = \frac{v_0 - v_1}{a} = \frac{0.4 - 0.3}{1} = 0.1\ \mathrm{s}
$$

**碰撞。** 碰撞时间极短，摩擦冲量不计，动量保守。设碰撞后乙的速度为 $v_\u4e59$，甲的速度为 $v_\u7532 = 0.1\ \mathrm{m/s}$，方向都指向 a：

$$
m v_1 = m v_\u7532 + m v_\u4e59
$$

$$
\boxed{v_\u4e59 = v_1 - v_\u7532 = 0.3 - 0.1 = 0.2\ \mathrm{m/s}}
$$

碰撞前动能 $\tfrac12 m v_1^2 = 0.045m$，碰撞后 $\tfrac12 m(v_\u7532^2 + v_\u4e59^2) = 0.025m$，动能有损失，不是弹性碰撞；速度只由动量保守定。

**（1）乙会不会摸到边框 a。** 乙以 $0.2\ \mathrm{m/s}$ 减速，停下前的位移

$$
s_\u4e59 = \frac{v_\u4e59^2}{2a} = \frac{0.2^2}{2 \times 1} = 0.020\ \mathrm{m}
$$

$$
\boxed{s_\u4e59 = 2.0 \times 10^{-2}\ \mathrm{m} = s_2}
$$

乙刚好滑到边框 a，到达时速度减为零。

**（2）甲从拨出到停下。** 碰撞后甲以 $0.1\ \mathrm{m/s}$ 继续减速，再滑

$$
t_3 = \frac{v_\u7532}{a} = \frac{0.1}{1} = 0.1\ \mathrm{s}
$$

两段相加，碰撞本身不占时间：

$$
\boxed{t_\u7532 = t_1 + t_3 = 0.1 + 0.1 = 0.2\ \mathrm{s}}
$$

这一段里甲再前进 $v_\u7532^2/(2a) = 5 \times 10^{-3}\ \mathrm{m}$。乙滑到边框用时 $v_\u4e59/a = 0.2\ \mathrm{s}$，甲只用 $0.1\ \mathrm{s}$ 就停了，两珠不会再碰上。

## 交互演示

拖动时间看两颗算珠的位置和速度。摩擦减速和碰撞时刻都由运动积分定位，不是把上面的时刻写死。

<Param name="t" label="时间" value={0} min={0} max={0.4} step={0.001} unit="s" />

<Param name="s1" label="甲乙间距" symbol="s_1" value={0.035} min={0.01} max={0.08} step={0.001} unit="m" />

<Param name="s2" label="乙到边框 a" symbol="s_2" value={0.02} min={0.005} max={0.06} step={0.001} unit="m" />

<Param name="v0" label="甲的初速度" symbol="v_0" value={0.4} min={0.1} max={0.8} step={0.01} unit="m/s" />

<Param name="vJia" label="碰后甲的速度" symbol="v_\u7532" value={0.1} min={0.02} max={0.3} step={0.01} unit="m/s" />

<Param name="mu" label="动摩擦因数" symbol="μ" value={0.1} min={0.02} max={0.4} step={0.01} />

<Param name="m" label="算珠质量" value={1} hidden unit="kg" />

<Param name="g" label="重力加速度" value={10} hidden unit="m/s²" />

<Define name="a" expr="mu*g" />

<Define name="v1" expr="sqrt(max(v0^2 - 2*a*s1, 0))" />

<Define name="vYi0" expr="v1 - vJia" />

<Define name="sYi" expr="vYi0^2/(2*a)" />

<Define name="t1" expr="(v0 - v1)/a" />

<Define name="t3" expr="vJia/a" />

<Define name="tJia" expr="t1 + t3" />

<Define name="sA" expr="s1 + s2" />

<Motion name="bd" until={2}
  state={{goY: 0}}
  rates={{vY: "goY < 0.5 ? 0 : (goY < 1.5 ? -mu*g : 0)"}}
  bodies={[
    {name: "J", mass: "m", along: 0, x: 0, v: "v0",
      forces: [
        {label: "G", angle: -90, magnitude: "m*g"},
        {label: "N", angle: 90, solve: "NJ"},
        {label: "f", friction: {mu: "mu", normal: "NJ", together: "tJ"}, solve: "fJ"}
      ]},
    {name: "Y", mass: "m", along: 0, x: "s1", v: 0,
      forces: [
        {label: "G", angle: -90, magnitude: "m*g"},
        {label: "N", angle: 90, solve: "NY"}
      ]}
  ]}
  events={[
    {name: "tHit", when: "xJ - xY", dir: "up",
      set: {vJ: "vJia", vY: "v1 - vJia", goY: 1}},
    {name: "tY", when: "vY", dir: "down", set: {vY: 0, goY: 2}},
    {name: "tA", when: "xY - (sA - 1e-4)", dir: "up"}
  ]}
  read={{
    sYmax: "max(xY - s1)",
    xJend: "xJ @ tEnd"
  }}
/>

<Question text="（1）乙算珠能否滑动到边框 a？" set={{t: "tA"}} hint="比较乙的滑行距离和 s_2" />

<Question text="（2）甲从拨出到停下要多久？" set={{t: "tJia"}} hint="碰撞前已减速到 0.3 m/s，碰后以 0.1 m/s 再减速" />

<Preset label="题目数值" set={{s1: 0.035, s2: 0.02, v0: 0.4, vJia: 0.1, mu: 0.1, t: 0}} />

<Preset label="刚碰上" set={{t: "tHit"}} />

<Preset label="乙摸到边框" set={{t: "tA"}} />

<Preset label="甲停下" set={{t: "tJia"}} />

<Status cases={[
  {when: "sYi > s2 + 1e-4", label: "乙能滑到边框 a，到达时还有速度", tone: "success"},
  {when: "abs(sYi - s2) <= 1e-4", label: "乙刚好滑到边框 a，到达时速度为零", tone: "info"},
  {label: "乙在中途停下，摸不到边框 a", tone: "warning"}
]} />

<Readout items={[
  {label: "摩擦减速度", symbol: "a", expr: "a", unit: "m/s²", digits: 2},
  {label: "碰前甲的速度", symbol: "v_1", expr: "v1", unit: "m/s", digits: 3, color: "velocity"},
  {label: "碰后乙的速度", symbol: "v_乙", expr: "vYi0", unit: "m/s", digits: 3, color: "velocity"},
  {label: "乙的滑行距离", symbol: "s_乙", expr: "sYi", unit: "m", digits: 4},
  {label: "甲停下用时", symbol: "t_甲", expr: "tJia", unit: "s", digits: 3}
]} />

<Answer items={[
  {label: "乙能否到边框 a", text: "刚好能：滑行距离 2.0×10⁻² m，等于 s_2"},
  {label: "碰前甲的速度", symbol: "v_1", expr: "v1", value: 0.3, unit: "m/s", digits: 3},
  {label: "碰后乙的速度", symbol: "v_乙", expr: "vYi0", value: 0.2, unit: "m/s", digits: 3},
  {label: "乙的滑行距离", symbol: "s_乙", expr: "sYi", value: 0.02, unit: "m", digits: 4},
  {label: "甲停下用时", symbol: "t_甲", expr: "tJia", value: 0.2, unit: "s", digits: 3}
]} />

<Sim title="导杆上的两颗算珠" height={300} duration={0.4} time="t"
  params={["bd", "s1", "s2", "sA", "tHit", "tA", "tY", "tJia"]}
  marks={[
    {t: 0, label: "拨出甲"},
    {t: "tHit", label: "两珠碰撞"},
    {t: "tA", label: "乙摸到边框 a"},
    {t: "tJia", label: "甲停下"}
  ]}
  hud={[
    {symbol: "v_甲", expr: "bd.vJ(t)", unit: "m/s", digits: 3},
    {symbol: "v_乙", expr: "bd.vY(t)", unit: "m/s", digits: 3},
    {symbol: "s_乙", expr: "sYi", unit: "m", digits: 3}
  ]}
  note="导杆放横了，左侧是边框 b、右侧是边框 a；算珠尺寸相对间距放大，不按比例。乙的位置到达边框 a 的参考线，就是已经摸到。"
>
sim({
  at(t, p) {
    return p.bd.state(t)
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -0.012, xmax: p.sA + 0.016, ymin: -0.02, ymax: 0.024, equal: true })
    const yRod = 0
    const d = 0.004
    const r = 0.0035
    v.wall(m, -d, -0.014, 0.014, { side: 'right', label: 'b' })
    v.line(m, p.sA, 0.006, p.sA, 0.014, { color: v.color.steel, dash: true })
    v.line(m, p.sA, -0.014, p.sA, -0.006, { color: v.color.steel, dash: true })
    v.label(m, p.sA, 0.016, 'a')
    v.bar(m, -d, yRod, p.sA + 0.008, yRod, { thick: 5 })
    v.ball(m, s.xJ, yRod, r, { label: '甲' })
    v.ball(m, s.xY, yRod, r, { label: '乙' })
    if (s.vJ > 0.002) v.vec(m, s.xJ, yRod + r, s.vJ * 0.025, 0, { kind: 'velocity', label: 'v_甲' })
    if (s.vY > 0.002) v.vec(m, s.xY, yRod - r, s.vY * 0.025, 0, { kind: 'velocity', label: 'v_乙' })
    if (s.xY - s.xJ > 0.006) v.dim(m, s.xJ, 0.012, s.xY, 0.012, 's_1')
    if (p.sA - s.xY > 0.004) v.dim(m, s.xY, -0.012, p.sA, -0.012, 's_2')
    v.event(m, (s.xJ + s.xY) / 2, 0.009, '碰撞', { at: p.tHit, kind: 'force' })
    v.event(m, p.sA, 0.009, '到达 a', { at: p.tA, kind: 'force' })
    v.event(m, s.xJ, -0.009, '甲停下', { at: p.tJia, kind: 'velocity' })
  },
})
</Sim>

<Plot title="两珠的速度" size="wide"
  x={{name: "t", label: "t", unit: "s", min: 0, max: 0.4}}
  y={{label: "v", unit: "m/s", min: -0.02, max: 0.5}}
  series={[
    {label: "甲", expr: "bd.vJ(t)", color: "velocity"},
    {label: "乙", expr: "bd.vY(t)", color: "velocity", dash: true}
  ]}
  marks={[
    {x: "tHit", label: "碰撞，甲降到 0.1"},
    {x: "tA", label: "乙摸到边框"},
    {x: "tJia", label: "甲停下"}
  ]}
  cursor="t"
/>

<Plot title="沿导杆的位置" size="wide"
  x={{name: "t", label: "t", unit: "s", min: 0, max: 0.4}}
  y={{label: "x", unit: "m", min: -0.005, max: "sA + 0.005"}}
  series={[
    {label: "甲", expr: "bd.xJ(t)", color: "velocity"},
    {label: "乙", expr: "bd.xY(t)", color: "velocity", dash: true},
    {label: "边框 a", expr: "sA", color: "steel", dash: true}
  ]}
  marks={[
    {x: "tHit", label: "两珠相遇"},
    {x: "tA", label: "乙到边框 a"}
  ]}
  cursor="t"
/>

## 结合图像

速度图上，甲从 $0.4\ \mathrm{m/s}$ 以斜率 $-\mu g$ 降到碰撞前的 $0.3\ \mathrm{m/s}$，竖直掉到 $0.1\ \mathrm{m/s}$，再降到零。乙在碰撞那一刻从零跳到 $0.2\ \mathrm{m/s}$，然后同样的斜率下降，速度降到零时刚好到边框 a。

位置图上，乙的曲线在速度降到零时正好贴上边框 a 那一条水平线。把 $\mu$ 拖大、或把 $s_2$ 拖大，这条曲线会在水平线下方趋平，乙就摸不到边框。

## 答案汇总

（1）甲碰前速度 $0.3\ \mathrm{m/s}$，乙碰后速度 $0.2\ \mathrm{m/s}$，滑行距离 $2.0 \times 10^{-2}\ \mathrm{m}$，等于 $s_2$，**刚好能滑动到边框 a**，到达时速度为零。

（2）甲从拨出到停下用时 $\boxed{0.2\ \mathrm{s}}$。
