---
id: r6-07-orbit-transfer
title: 卫星变轨：两次加速的速度增量
subject: physics
topic: 万有引力与航天
source: 必修2 第七章综合挑战
theme: night
breadcrumb: ["必修2", "第七章 万有引力与航天", "卫星变轨"]
question: |
  现要把位于赤道上空、轨道半径 r₁=6.5×10³ km 的圆形轨道上的卫星，转移到半径 r₂=4.2×10⁴ km 的同步卫星圆轨道上去。转移分两步：先在短时间内给卫星加速，使它从距地心 r₁ 的近地点 A 沿椭圆轨道运动到距地心 r₂ 的远地点 B（椭圆转移轨道的近地点、远地点距地心分别为 r₁、r₂）；当卫星飞到远地点 B 时，再次给它加速，使它进入半径为 r₂ 的圆轨道。已知地球质量 M=5.98×10²⁴ kg，引力常量 G=6.67×10⁻¹¹ N·m²/kg²，质量分别为 M 和 m 的两物体相距 r 时，引力势能 Ep=−GMm/r。试求两次加速过程中，卫星的速度各增加了多少。
answers:
  - { name: dv1, value: 2475.7, unit: "m/s" }
  - { name: dv2, value: 1486.2, unit: "m/s" }
---

## 一、题目条件分析

- $r_1$、$r_2$ 都是到**地心**的距离，不是离地面的高度。题目后来写明：近地点、远地点距地心分别为 $r_1$、$r_2$。
- 先统一单位：$r_1 = 6.5\times 10^3\ \text{km} = 6.5\times 10^6\ \text{m}$，$r_2 = 4.2\times 10^4\ \text{km} = 4.2\times 10^7\ \text{m}$。
- 转移分两步，加速时间都很短，看成瞬时改变速度，方向都沿该点的速度方向（与矢径垂直、向前）：
  1. 在 $A$ 把卫星从半径 $r_1$ 的圆轨道送上椭圆，椭圆近地点距地心 $r_1$、远地点距地心 $r_2$；
  2. 在 $B$ 再加速，使轨道变成半径 $r_2$ 的圆。
- 地球质量 $M = 5.98\times 10^{24}\ \text{kg}$，引力常量 $G = 6.67\times 10^{-11}\ \text{N·m^2/kg^2}$，势能 $E_p = -GMm/r$ 题目已给。
- 卫星质量 $m$ 没有给出。求的是速率的增加量，式子里 $m$ 会约去，答案与 $m$ 无关。

两次加速之间，卫星只受万有引力，沿椭圆滑行；发动机只在 $A$、$B$ 各工作一次。

## 二、完整解答

以下速率都保留到 $0.1\ \text{m/s}$，与页面读数一致。

### 1. 两条圆轨道的速率

万有引力提供向心力：

$$
G\frac{Mm}{r^2} = m\frac{v^2}{r} \Rightarrow v = \sqrt{\frac{GM}{r}}
$$

$$
GM = 6.67\times 10^{-11}\times 5.98\times 10^{24} = 3.98866\times 10^{14}\ \text{m}^3/\text{s}^2
$$

$$
v_1 = \sqrt{\frac{GM}{r_1}} = \sqrt{\frac{3.98866\times 10^{14}}{6.5\times 10^{6}}} = \sqrt{6.1364\times 10^{7}} = 7833.5\ \text{m/s}
$$

$$
v_2 = \sqrt{\frac{GM}{r_2}} = \sqrt{\frac{3.98866\times 10^{14}}{4.2\times 10^{7}}} = \sqrt{9.4968\times 10^{6}} = 3081.7\ \text{m/s}
$$

$v_1$ 是加速前的速率，$v_2$ 是进入同步圆轨道之后的速率。椭圆上不能用这个公式。

### 2. 椭圆在 A、B 的速率

从 $A$ 到 $B$ 只有万有引力做功，机械能守恒。两点的速度都与矢径垂直；由开普勒第二定律（面积速度恒定，也就是角动量守恒）：

$$
v_A r_1 = v_B r_2
$$

再用题目给的势能：

$$
\frac12 m v_A^2 - \frac{GMm}{r_1} = \frac12 m v_B^2 - \frac{GMm}{r_2}
$$

$m$ 约去，并把 $v_B = v_A r_1/r_2$ 代入：

$$
\frac12 v_A^2\left(1 - \frac{r_1^2}{r_2^2}\right) = GM\left(\frac{1}{r_1} - \frac{1}{r_2}\right)
$$

$$
\frac12 v_A^2\cdot\frac{(r_2-r_1)(r_1+r_2)}{r_2^2} = GM\cdot\frac{r_2-r_1}{r_1 r_2}
$$

$r_2 \neq r_1$，约去 $r_2-r_1$：

$$
v_A = \sqrt{\frac{2GM r_2}{r_1(r_1+r_2)}}
$$

$r_1+r_2 = 4.85\times 10^7\ \text{m}$，代入得

$$
v_A = \sqrt{\frac{2\times 3.98866\times 10^{14}\times 4.2\times 10^{7}}{6.5\times 10^{6}\times 4.85\times 10^{7}}} = \sqrt{1.0628\times 10^{8}} = 10309.2\ \text{m/s}
$$

$$
v_B = v_A\frac{r_1}{r_2} = 10309.2\times\frac{6.5}{42} = 1595.5\ \text{m/s}
$$

$v_B < v_2$：到了远地点若不加速，卫星没有做圆周运动所需的速率，会沿椭圆落回近地点。

### 3. 两次速度增量

第一次在近地点 $A$，速率从 $v_1$ 提高到 $v_A$：

$$
\Delta v_1 = v_A - v_1 = 10309.2 - 7833.5 = \boxed{2475.7\ \text{m/s}}
$$

第二次在远地点 $B$，速率从 $v_B$ 提高到 $v_2$：

$$
\Delta v_2 = v_2 - v_B = 3081.7 - 1595.5 = \boxed{1486.2\ \text{m/s}}
$$

两次都是**加速**，方向都与该点速度相同。第二次的作用是把椭圆的近地点抬到 $r_2$，椭圆才变成圆，不是把卫星再沿径向推出去。

换成千米每秒：$\Delta v_1 = 2.476\ \text{km/s}$，$\Delta v_2 = 1.486\ \text{km/s}$。半径只有两位有效数字，三位有效数字可写成 $2.48\times 10^3\ \text{m/s}$ 和 $1.49\times 10^3\ \text{m/s}$。页面按给定数字用上面的公式计算，保留到 $0.1\ \text{m/s}$。

> **易错点**
>
> - 不把 $\text{km}$ 换成 $\text{m}$，数量级会错 $10^3$。
> - 在椭圆的 $A$、$B$ 仍用 $v=\sqrt{GM/r}$。那样 $A$ 点速率等于 $v_1$、$B$ 点速率等于 $v_2$，两次增量都变成 $0$。
> - 只加速一次。第一次之后轨道是椭圆，到 $B$ 还会返回，进不了同步圆轨道。
> - 把第二次当成减速。低轨道转到高轨道，两次都是沿速度方向加速；$B$ 点椭圆速率比同半径的圆轨道速率小。

## 三、交互演示

<Question text="在近地点 A 第一次加速，卫星的速度增加了多少？" set={{t: "tBurn1"}} hint="先求圆轨道速率，再求椭圆近地点速率" />

<Question text="在远地点 B 第二次加速，卫星的速度增加了多少？" set={{t: "tBurn2"}} hint="远地点的椭圆速率小于同半径圆轨道速率" />

<Param name="r1km" label="近地圆轨道半径" symbol="r_1" value={6500} min={6500} max={20000} step={50} unit="km" color="steel" />

<Param name="r2km" label="同步圆轨道半径" symbol="r_2" value={42000} min={25000} max={80000} step={100} unit="km" color="field" />

<Param name="G" label="引力常量" symbol="G" value={6.67e-11} min={6e-11} max={7e-11} step={1e-13} unit="N·m²/kg²" hidden />

<Param name="M" label="地球质量" symbol="M" value={5.98e24} min={5e24} max={7e24} step={1e22} unit="kg" hidden />

<Param name="mSat" label="卫星质量" symbol="m" value={1} min={1} max={1} step={1} unit="kg" hidden />

<Param name="alpha" label="加速前转过的圆心角" value={36} min={10} max={80} step={1} unit="°" hidden />

<Param name="t" label="时间" value={0} min={0} max={150000} step={1} unit="s" hidden />

<Define name="r1" expr="r1km * 1000" />

<Define name="r2" expr="r2km * 1000" />

<Define name="GM" expr="G * M" />

<Define name="v1" expr="sqrt(GM / r1)" />

<Define name="v2" expr="sqrt(GM / r2)" />

<Define name="aSemi" expr="(r1 + r2) / 2" />

<Define name="vA" expr="sqrt(2 * GM * r2 / (r1 * (r1 + r2)))" />

<Define name="vB" expr="vA * r1 / r2" />

<Define name="dv1" expr="vA - v1" />

<Define name="dv2" expr="v2 - vB" />

<Define name="bOrb" expr="sqrt(r1 * r2)" />

<Define name="cx" expr="(r1 - r2) / 2" />

<Define name="tToA" expr="deg(alpha) * r1 / v1" />

<Define name="tHalf" expr="pi * sqrt(aSemi^3 / GM)" />

<Define name="tOuter" expr="deg(60) * r2 / v2" />

<Define name="tShow" expr="tToA + tHalf + tOuter + 500" />

<Define name="T2h" expr="2 * pi * sqrt(r2^3 / GM) / 3600" />

<Define name="tABh" expr="tHalf / 3600" />

<Motion
  name="sat"
  mass="mSat"
  until="tShow"
  steps={12000}
  state={{x: "r1*cos(deg(alpha))", y: "-r1*sin(deg(alpha))", vx: "v1*sin(deg(alpha))", vy: "v1*cos(deg(alpha))", phase: 0}}
  forces={[
    {label: "F", angle: "atan2(-y, -x)*180/pi", magnitude: "G*M*mSat/((x*x)+(y*y))"}
  ]}
  events={[
    {name: "tBurn1", when: "(phase < 0.5) ? y : 1", dir: "up", set: {vx: 0, vy: "vA", phase: 1}},
    {name: "tBurn2", when: "(x < 0) ? vx : -1", dir: "up", set: {vx: 0, vy: "-v2", phase: 2}}
  ]}
/>

<Define name="spd" expr="sqrt((sat.vx(t))^2 + (sat.vy(t))^2)" />

<Define name="rad" expr="sqrt((sat.x(t))^2 + (sat.y(t))^2)" />

<Define name="tCruise" expr="min(tBurn2 + tOuter * 0.45, tShow * 0.98)" />

<Status cases={[
  {when: "t < tBurn1", label: "圆轨道 r₁ 上，接近近地点", tone: "neutral"},
  {when: "t < tBurn2", label: "椭圆转移：第一次加速已完成", tone: "info"},
  {label: "已进入半径 r₂ 的同步圆轨道", tone: "success"}
]} />

<Preset label="题目数据" set={{r1km: 6500, r2km: 42000, t: 0}} />

<Preset label="近地点加速" set={{t: "tBurn1"}} />

<Preset label="远地点加速" set={{t: "tBurn2"}} />

<Preset label="进入同步轨道" set={{t: "tCruise"}} />

动画从近地点之前 $36^\circ$ 的圆轨道开始。卫星在万有引力下运动，加速度为 $GM/r^2$。取 $m = 1\ \text{kg}$ 只是为了把力写成 $F = GMm/r^2$，轨道和 $\Delta v$ 都与 $m$ 无关。两次加速按题目处理成瞬时完成：到 $A$ 时速率改为 $v_A$，到远地点（速度转到与矢径垂直、且位于地心另一侧）时速率改为 $v_2$。

轨道半径按比例。地球圆面不按比例，故意画小，题目没有给地球半径，计算也不用它。卫星图标和速度箭头不按比例，都放大了。频闪点每隔 $2000\ \text{s}$ 一个，点距大表示飞得快。

<Sim
  title="两次加速：近地圆轨道到同步圆轨道"
  height={600}
  duration="tShow"
  time="t"
  playSeconds={20}
  params={["sat", "r1", "r2", "cx", "aSemi", "bOrb", "v1", "tBurn1", "tBurn2"]}
  hud={[
    {symbol: "v", label: "速率", expr: "spd", unit: "m/s", digits: 0},
    {symbol: "r", label: "地心距", expr: "rad/1000", unit: "km", digits: 0}
  ]}
  legend={[
    {kind: "steel-dash", label: "原圆轨道 r₁"},
    {kind: "velocity", label: "椭圆转移轨道"},
    {kind: "field-dash", label: "同步圆轨道 r₂"},
    {kind: "strobe", label: "频闪 2000 s"}
  ]}
  note="轨道半径按比例。地球圆面、卫星和速度箭头不按比例：地球画小了，以便看清近地轨道；卫星和箭头画大了。自北向南俯视，逆时针飞行。"
  marks={[
    {t: 0, label: "圆轨道 r₁"},
    {t: "tBurn1", label: "第一次加速", color: "force"},
    {t: "tBurn2", label: "第二次加速", color: "force"}
  ]}
>
sim({
  at(t, p) {
    return p.sat.state(t)
  },
  draw(ctx, s, v) {
    const p = v.p
    const R = p.r2 * 1.4
    const m = v.view({ xmin: -R, xmax: R, ymin: -R, ymax: R, equal: true, pad: 28 })
    v.stars()
    const Re = 4.55e6
    v.line(m, 0, 0, p.r1, 0, { color: v.color.hairline, dash: [4, 4] })
    v.line(m, 0, 0, -p.r2, 0, { color: v.color.hairline, dash: [4, 4] })
    v.planet(m, 0, 0, Re, { label: '地球' })
    v.ellipse(m, 0, 0, p.r1, p.r1, { color: v.color.steel, dash: [6, 4] })
    v.ellipse(m, p.cx, 0, p.aSemi, p.bOrb, { color: v.color.velocity })
    v.ellipse(m, 0, 0, p.r2, p.r2, { color: v.color.field, dash: [8, 5] })
    v.circle(m, p.r1, 0, p.r2 * 0.016, { fill: v.color.force })
    v.circle(m, -p.r2, 0, p.r2 * 0.016, { fill: v.color.force })
    v.label(m, p.r1, 0, 'A')
    v.label(m, -p.r2, 0, 'B')
    v.strobe(m, (st) => [st.x, st.y], { every: 2000 })
    const heading = Math.atan2(s.vy, s.vx) * 180 / Math.PI
    v.satellite(m, s.x, s.y, { angle: heading })
    const k = p.r2 / p.v1 * 0.14
    v.vec(m, s.x, s.y, s.vx * k, s.vy * k, { kind: 'velocity', label: 'v', min: 14 })
    v.event(m, p.r1, 0, '第一次加速', { at: p.tBurn1, kind: 'force' })
    v.event(m, -p.r2, 0, '第二次加速', { at: p.tBurn2, kind: 'force' })
  },
})
</Sim>

<Readout items={[
  {label: "第一次速度增量", symbol: "Δv_1", expr: "dv1", unit: "m/s", digits: 1, color: "force"},
  {label: "第二次速度增量", symbol: "Δv_2", expr: "dv2", unit: "m/s", digits: 1, color: "force"},
  {label: "原圆轨道速率", symbol: "v_1", expr: "v1", unit: "m/s", digits: 1, color: "velocity"},
  {label: "近地点速率", symbol: "v_A", expr: "vA", unit: "m/s", digits: 1, color: "velocity"},
  {label: "远地点速率", symbol: "v_B", expr: "vB", unit: "m/s", digits: 1, color: "velocity"},
  {label: "同步圆轨道速率", symbol: "v_2", expr: "v2", unit: "m/s", digits: 1, color: "velocity"},
  {label: "此刻速率", symbol: "v", expr: "spd", unit: "m/s", digits: 1, color: "velocity"},
  {label: "此刻地心距", symbol: "r", expr: "rad/1000", unit: "km", digits: 0},
  {label: "时刻", symbol: "t", expr: "t/3600", unit: "h", digits: 2},
  {label: "A 到 B 的时间", symbol: "t_{AB}", expr: "tABh", unit: "h", digits: 2},
  {label: "r₂ 圆轨道周期", symbol: "T_2", expr: "T2h", unit: "h", digits: 2}
]} />

<Plot
  title="速率随时间：两次竖直跳跃就是两次 Δv"
  caption="跳跃前、跳跃后的水平段是圆轨道；中间下降段是椭圆。游标跟着动画走。"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "sat.tEnd"}}
  y={{label: "v", unit: "m/s", min: 0}}
  series={[
    {label: "卫星速率", expr: "sqrt((sat.vx(s))^2 + (sat.vy(s))^2)", color: "velocity"}
  ]}
  marks={[
    {x: "tBurn1", label: "Δv₁"},
    {x: "tBurn2", label: "Δv₂"}
  ]}
  cursor="t"
/>

<Plot
  title="单位质量的机械能"
  caption="势能用 Ep/m = −GM/r。两次跳跃之间总机械能是水平直线；跳跃是发动机做的功。"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "sat.tEnd"}}
  y={{label: "ε", unit: "MJ/kg"}}
  series={[
    {label: "动能", expr: "((sat.vx(s))^2 + (sat.vy(s))^2) / 2 / 1e6", color: "velocity"},
    {label: "势能", expr: "-GM / sqrt((sat.x(s))^2 + (sat.y(s))^2) / 1e6", color: "field"},
    {label: "机械能", expr: "((sat.vx(s))^2 + (sat.vy(s))^2) / 2 / 1e6 - GM / sqrt((sat.x(s))^2 + (sat.y(s))^2) / 1e6", color: "charge"}
  ]}
  marks={[
    {x: "tBurn1", label: "第一次做功"},
    {x: "tBurn2", label: "第二次做功"}
  ]}
  cursor="t"
/>

<Plot
  title="同一地心距上，圆轨道与椭圆的速率差"
  caption="左端两线高度差是 Δv₁，右端是 Δv₂。椭圆公式只在 r₁ 到 r₂ 之间使用。"
  x={{label: "r", unit: "km", min: "r1km * 0.85", max: "r2km * 1.05"}}
  y={{label: "v", unit: "m/s", min: 0}}
  series={[
    {label: "圆轨道", x: "rr/1000", expr: "sqrt(GM/rr)", over: {name: "rr", min: "r1", max: "r2"}, color: "steel", dash: true},
    {label: "椭圆转移", x: "rq/1000", expr: "sqrt(GM*(2/rq - 1/aSemi))", over: {name: "rq", min: "r1", max: "r2"}, color: "velocity"}
  ]}
  marks={[
    {x: "r1km", series: 1, label: "Δv₁"},
    {x: "r2km", series: 0, label: "Δv₂"}
  ]}
/>

<Answer
  title="查看两次速度增量"
  items={[
    {label: "第一次加速的速度增量", symbol: "Δv_1", expr: "dv1", value: 2475.7, unit: "m/s", digits: 1},
    {label: "第二次加速的速度增量", symbol: "Δv_2", expr: "dv2", value: 1486.2, unit: "m/s", digits: 1}
  ]}
/>

拖动 $r_1$、$r_2$ 后，读数和曲线都按同一组公式重算。离开题目数据时，答案卡片会提示已偏离。

## 四、结合图像理解关键时刻

速率–时间图上先是一段水平线（速率 $v_1$），接着竖直跳上 $v_A$，跳变高度就是 $\Delta v_1$。之后速率平滑下降，直到 $B$ 点再竖直跳上 $v_2$，这次跳变是 $\Delta v_2$，然后又保持水平。下降段不是发动机在刹车，而是卫星爬高：动能变成势能。频闪点在近地点稀、远地点密，对应同一件事。

能量图用的是单位质量能量，单位 $\text{MJ/kg}$。题目条件下，圆轨道 $r_1$ 的机械能约 $-30.7$，椭圆约 $-8.22$，同步圆轨道约 $-4.75$。第一次加速大约抬高 $22.5\ \text{MJ/kg}$，第二次大约抬高 $3.48\ \text{MJ/kg}$。加速瞬间半径来不及变，势能不变，增加的都是动能。两次跳跃之间总机械能是水平直线；动能下降多少，势能就升高多少。

速率–地心距图把答案直接画成竖向间隔。在 $r_1$ 处椭圆在上、圆轨道在下，差是 $\Delta v_1$；在 $r_2$ 处圆轨道在上、椭圆在下，差是 $\Delta v_2$。把 $r_2$ 向 $r_1$ 靠，两线靠近，两次增量都变小；把 $r_2$ 拉远，第一次增量明显变大。

动画里两条圆轨道的圆心在地心，椭圆的几何中心不在地心。地心是椭圆的一个焦点：$A$ 在地心一侧、距地心 $r_1$，$B$ 在另一侧、距地心 $r_2$，椭圆中心在 $A$、$B$ 正中间，所以偏向远地点。这不是画偏。

从 $A$ 到 $B$ 是半个椭圆周期。半长轴 $a = (r_1+r_2)/2 = 2.425\times 10^7\ \text{m}$，由开普勒第三定律

$$
t_{AB} = \pi\sqrt{\frac{a^3}{GM}} \approx 5.22\ \text{h}
$$

$r_2$ 那条圆轨道的周期约 $23.79\ \text{h}$，接近地球自转周期，所以题目把它叫做同步卫星轨道。$r_2$ 一改，这个周期就不再是一天，右侧读数会跟着变。

这种“近地点加速抬高远地点，远地点再加速把轨道圆化”的路径，就是霍曼转移。

## 五、答案汇总

| 时刻 | 速率 | 速度增量 |
|---|---|---|
| 加速前，圆轨道 $r_1$ | $7833.5\ \text{m/s}$ | — |
| 第一次加速后，近地点 $A$ | $10309.2\ \text{m/s}$ | $2475.7\ \text{m/s}$ |
| 到达远地点 $B$、尚未加速 | $1595.5\ \text{m/s}$ | — |
| 第二次加速后，圆轨道 $r_2$ | $3081.7\ \text{m/s}$ | $1486.2\ \text{m/s}$ |

两次加速的速度增量：$\Delta v_1 = 2475.7\ \text{m/s}$，$\Delta v_2 = 1486.2\ \text{m/s}$。方向都沿该点速度向前。
