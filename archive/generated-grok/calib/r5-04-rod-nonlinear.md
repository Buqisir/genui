---
id: r5-04-rod-nonlinear
title: 非线性元件与竖直下落的金属棒
subject: physics
topic: 电磁感应
breadcrumb: ["电磁感应", "导体棒切割", "2021 湖北卷"]
source: "2021 湖北卷 16 题（15 分）"
question: |
  两根不计电阻、间距为 L 的足够长平行光滑金属导轨，竖直固定在匀强磁场中，磁场方向垂直于导轨平面向里，磁感应强度大小为 B。导轨上端串联非线性电子元件 Z 和阻值为 R 的电阻，开关 S 与元件 Z 并联（闭合 S 时 Z 被短路）。元件 Z 的 U-I 图像为：电流从 0 增大到 I₀ 的过程中，电压从 0 线性增大到 Um；电流大于或等于 I₀ 时，电压稳定为 Um。已知 Um = mgR/(2BL)，且 I₀ < mg/(2BL)。质量为 m、不计电阻的金属棒可沿导轨运动，运动中金属棒始终水平且与导轨保持良好接触。忽略空气阻力及回路中的电流对原磁场的影响，重力加速度为 g，计算结果只能用 m、g、B、L、R 表示。
  (1) 闭合开关 S，由静止释放金属棒，求金属棒下落的最大速度 v₁；
  (2) 断开开关 S，由静止释放金属棒，求金属棒下落的最大速度 v₂；
  (3) 先闭合开关 S，由静止释放金属棒，金属棒达到最大速度后，再断开开关 S。忽略回路中电流突变的时间，求 S 断开瞬间金属棒的加速度大小 a。
answers:
  - { name: v1, value: 10, unit: "m/s" }
  - { name: v2, value: 15, unit: "m/s" }
  - { name: a, value: 5, unit: "m/s²" }
---

## 一、题目条件分析

- 导轨竖直、光滑、足够长，电阻不计。金属棒质量为 $m$，电阻不计，运动中保持水平。
- 匀强磁场垂直导轨平面向里，大小为 $B$。棒以速度 $v$ 向下切割时，感应电动势 $E=BLv$，安培力向上（楞次定律）。
- 导轨上端 $R$ 与非线性元件 $Z$ 串联，开关 $S$ 与 $Z$ 并联。$S$ 闭合时 $Z$ 被短路，回路里只剩 $R$。
- $Z$ 的 $U$–$I$ 特性：电流从 $0$ 到 $I_0$ 时，电压从 $0$ 线性升到 $U_m$；电流大于或等于 $I_0$ 后，电压保持 $U_m$。
- 已知 $U_m=mgR/(2BL)$，并且 $I_0\lt mg/(2BL)$。最终答案只含 $m$、$g$、$B$、$L$、$R$。

设向下为正。速度最大时加速度为 $0$，重力与安培力平衡，因此收尾电流总是

$$
I=\frac{mg}{BL}
$$

$Z$ 的形状不改变这个电流，只改变“要多大的速度才能把电流推到这个值”。

题目只给字母。演示取一组满足条件的数，便于对着画面读数；字母结果与这组数无关。滑块改变 $B$、$R$ 时，$U_m$ 仍按 $mgR/(2BL)$ 自动重算。

| 量 | 演示值 |
|---|---|
| $m$ | $1\ \text{kg}$ |
| $g$ | $10\ \text{m/s}^2$ |
| $B$ | $1\ \text{T}$ |
| $L$ | $1\ \text{m}$ |
| $R$ | $1\ \Omega$ |
| $I_0$ | $2\ \text{A}$ |

由此 $U_m=5\ \text{V}$，$mg/(BL)=10\ \text{A}$，$mg/(2BL)=5\ \text{A}$。$I_0=2\ \text{A}\lt 5\ \text{A}$，满足题目条件。

## 二、完整解答

记 $I_1=mg/(BL)$。题目给的稳压值可以改写成

$$
U_m=\frac{mgR}{2BL}=\frac12 I_1 R
$$

### （1）闭合 S，求 $v_1$

$S$ 闭合，$Z$ 被短路，电动势全部加在 $R$ 上：

$$
BLv=\frac{B^{2}L^{2}v}{R}\cdot\frac{R}{BL}=IR,\qquad F_A=\frac{B^{2}L^{2}v}{R}
$$

速度最大时 $F_A=mg$：

$$
mg=\frac{B^{2}L^{2}v_1}{R}
$$

$$
\boxed{v_1=\dfrac{mgR}{B^{2}L^{2}}}
$$

此时电流正好是 $I_1$，并且 $BLv_1=I_1R$。

演示数值：$v_1=\boxed{10}\ \mathrm{m/s}$，收尾电流 $10\ \text{A}$。

### （2）断开 S，求 $v_2$

速度最大时仍然 $F_A=mg$，所以收尾电流还是 $I_2=I_1=mg/(BL)$。

线性段最多只能流过 $I_0$。对应的安培力

$$
BI_0L\lt B\cdot\frac{mg}{2BL}\cdot L=\frac{mg}{2}\lt mg
$$

线性段托不住棒，棒会继续加速，电流冲过 $I_0$，收尾落在稳压段，$U_Z=U_m$。

$$
BLv_2=U_m+I_1R=\frac12 I_1R+I_1R=\frac32 I_1R=\frac32 BLv_1
$$

$$
\boxed{v_2=\dfrac{3mgR}{2B^{2}L^{2}}}
$$

也就是 $v_2=\dfrac32 v_1$。演示数值：$v_2=\boxed{15}\ \mathrm{m/s}$。

### （3）达到 $v_1$ 后断开 S，求瞬间加速度的大小

“忽略回路中电流突变的时间”就是不计自感：速度不能跳，电动势不能跳，电流可以立刻改到新电路的值。

断开前棒已收尾，$E=BLv_1=I_1R$，电压全部在 $R$ 上，安培力等于重力，加速度为 $0$。

断开后先按稳压段写。$Z$ 分走 $U_m=\dfrac12 I_1R$，留给 $R$ 的电压只剩一半：

$$
I_1R=U_m+I'R=\frac12 I_1R+I'R
$$

$$
I'=\frac12 I_1=\frac{mg}{2BL}
$$

题目条件 $I_0\lt mg/(2BL)$ 就是 $I'\gt I_0$，稳压段成立。

$$
F_A'=BI'L=\frac{mg}{2}
$$

合力向下 $mg-mg/2=mg/2$，加速度大小

$$
\boxed{a=\dfrac{g}{2}}
$$

方向向下。它不含 $m$、$B$、$L$、$R$：在给定的 $U_m$ 和 $I_0$ 条件下，断开瞬间电流恰好减半。

演示数值：$\boxed{5}\ \mathrm{m/s^2}$。对照下表（理想收尾后再断开）。

| | 断开前 | 断开瞬间 |
|---|---|---|
| $v$ | $10\ \text{m/s}$ | $10\ \text{m/s}$ |
| $BLv$ | $10\ \text{V}$ | $10\ \text{V}$ |
| $U_Z$ | $0$ | $5\ \text{V}$ |
| $I$ | $10\ \text{A}$ | $5\ \text{A}$ |
| $F_A$ | $10\ \text{N}$ | $5\ \text{N}$ |
| $a$（向下） | $0$ | $5\ \text{m/s}^2$ |

断开之后棒还会继续加速，新的收尾速度就是 $v_2$。题目只问断开这一瞬间。

> 易错：收尾电流由 $mg=BIL$ 决定，是 $mg/(BL)$，不是 $I_0$。第（3）问若仍用断开前的电流，安培力看起来还等于重力，加速度会错成 $0$。电流由断开后的回路方程立刻决定。

## 三、交互演示

演示里 $m=1\ \text{kg}$、$g=10\ \text{m/s}^2$、$L=1\ \text{m}$ 固定。$B$、$R$、$I_0$ 可以改。$U_m$ 始终等于 $mgR/(2BL)$。

三种情形用同一套运动：电路每个瞬间按基尔霍夫定律求解，安培力由求出的电流算，速度由牛顿第二定律积分。$v_1$、$v_2$、$a$ 的参考线是上面的平衡结果，不拿指数公式去画曲线。

收尾速度只能无限逼近。情形 3 在 $v=0.999\,v_1$ 时断开 $S$，代替“已经达到最大速度”。点预设「（3）断开瞬间」时，读数与上表在显示精度内一致。

进度条上的「关键时刻」：情形 1 是速度到达 $0.95v_1$；情形 2 是 $Z$ 进入稳压；情形 3 是 $S$ 断开。

<Question text="闭合 S，由静止释放，求最大速度 v₁" set={{mode: 1, t: 0}} hint="收尾时重力等于安培力，回路里只有 R" />

<Question text="断开 S，由静止释放，求最大速度 v₂" set={{mode: 2, t: 0}} hint="先由力平衡得到收尾电流，再看它落在 U-I 图像的哪一段" />

<Question text="达到 v₁ 后断开 S，求断开瞬间加速度的大小 a" set={{mode: 3, t: "tWatch"}} hint="速度来不及变，电动势不变；Z 串入后电流立刻改口" />

<Param name="mode" label="情形" value={1} options={[{value: 1, label: "（1）S 闭合释放"}, {value: 2, label: "（2）S 断开释放"}, {value: 3, label: "（3）达到 v₁ 后断开"}]} />

<Param name="B" label="磁感应强度 B" symbol="B" color="field" value={1} min={0.8} max={1.5} step={0.1} unit="T" digits={1} />

<Param name="R" label="电阻 R" symbol="R" value={1} min={0.5} max={1.5} step={0.1} unit="Ω" digits={1} />

<Param name="I0" label="折点电流 I₀" symbol="I_0" color="charge" value={2} min={0.4} max={12} step={0.1} unit="A" digits={1} />

<Param name="t" label="时间" symbol="t" value={0} min={0} max={50} step={0.01} unit="s" hidden />

<Define name="m" expr="1" />

<Define name="g" expr="10" />

<Define name="L" expr="1" />

<Define name="Um" expr="(m*g*R)/(2*B*L)" />

<Define name="v1" expr="(m*g*R)/(B*B*L*L)" />

<Define name="Iterm" expr="(m*g)/(B*L)" />

<Define name="Icrit" expr="(m*g)/(2*B*L)" />

<Define name="v2" expr="(I0 < Iterm) ? ((Um + Iterm*R)/(B*L)) : ((Iterm*(R + Um/I0))/(B*L))" />

<Define name="a" expr="(I0 < Icrit) ? (g/2) : ((g*Icrit)/(Icrit + I0))" />

<Define name="tau" expr="(m*R)/(B*B*L*L)" />

<Define name="tLate" expr="12*tau" />

<Define name="tOpenAna" expr="-tau*log(0.001)" />

<Define name="tWatch" expr="tOpenAna + 0.002*tau" />

<Define name="tNearAna" expr="-tau*log(0.05)" />

<Define name="Rlin" expr="R + Um/I0" />

<Define name="tauLin" expr="(m*Rlin)/(B*B*L*L)" />

<Define name="tSatAna" expr="(I0 < Iterm) ? (-tauLin*log(max(1 - I0/Iterm, 1e-9))) : (-1)" />

<Define name="tSatSafe" expr="(tSatAna > 0) ? tSatAna : 0" />

<Motion
  name="rod"
  mass="m"
  along={-90}
  until="24*tau"
  steps={4000}
  state={{
    x: 0,
    v: 0,
    sat: 0,
    sClosed: "(mode > 1.5 and mode < 2.5) ? 0 : 1",
    phase: "(mode > 2.5) ? 1 : 0",
    md: "mode"
  }}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g"},
    {label: "F_A", angle: 90, magnitude: "B*I*L"}
  ]}
  events={[
    {name: "tNear", when: "(md > 1.5) ? 1 : (v - 0.95*v1)", dir: "up"},
    {name: "tSat", when: "(sClosed > 0.5) ? -1 : ((md > 2.5) ? -1 : (IZ - I0))", dir: "up", set: {sat: 1}},
    {name: "tOpen", when: "(phase < 0.5) ? 1 : (v - 0.999*v1)", dir: "up", set: {sClosed: 0, sat: "(I0 < Icrit) ? 1 : 0", phase: 0}}
  ]}
  circuit={{
    source: {series: [
      {type: "battery", label: "棒", emf: "B*L*v", read: "I"},
      {type: "battery", label: "U_Z", emf: "(1-sClosed)*sat*Um", positive: "right"}
    ]},
    load: {series: [
      {type: "resistor", label: "R", R: "R", read: {U: "UR"}},
      {parallel: [
        {type: "switch", label: "S", closed: "sClosed"},
        {type: "resistor", label: "Z", R: "(sat < 0.5) ? (Um/I0) : 0", read: "IZ"}
      ]}
    ]}
  }}
/>

<Define name="tNearM" expr="isNaN(tNear) ? tNearAna : tNear" />

<Define name="tSatM" expr="isNaN(tSat) ? -1 : tSat" />

<Define name="tOpenM" expr="isNaN(tOpen) ? -1 : tOpen" />

<Define name="tKey" expr="(mode < 1.5) ? tNearM : ((mode < 2.5) ? ((tSatM > 0) ? tSatM : tLate) : ((tOpenM > 0) ? tOpenM : tOpenAna))" />

<Define name="iZnow" expr="max(rod.IZ(t), 0)" />

<Define name="UZnow" expr="(rod.sClosed(t) > 0.5) ? 0 : ((iZnow < I0) ? ((iZnow*Um)/I0) : Um)" />

<Status cases={[
  {when: "I0 >= Icrit", label: "I₀ ≥ mg/(2BL)，不满足题目条件；再增大则断开瞬间落在线性段", tone: "warning"},
  {when: "(mode < 1.5) and (t >= tLate)", label: "S 闭合，已接近最大速度 v₁", tone: "success"},
  {when: "mode < 1.5", label: "S 闭合，正在加速趋向 v₁", tone: "info"},
  {when: "(mode < 2.5) and (t < tSatAna)", label: "S 断开，Z 仍在线性段", tone: "info"},
  {when: "(mode < 2.5) and (t >= tLate)", label: "S 断开，已接近最大速度 v₂", tone: "success"},
  {when: "mode < 2.5", label: "S 断开，Z 已稳压，继续趋向 v₂", tone: "info"},
  {when: "t < tOpenAna", label: "S 仍闭合，速度趋向 v₁", tone: "info"},
  {when: "t < tOpenAna + 0.3*tau", label: "S 刚断开，加速度接近 g/2", tone: "warning"},
  {when: "t >= tLate", label: "断开后已接近新的最大速度 v₂", tone: "success"},
  {label: "S 已断开，从 v₁ 附近继续加速", tone: "info"}
]} />

<Preset label="（1）接近 v₁" set={{mode: 1, t: "tLate"}} />

<Preset label="（2）Z 刚进入稳压" set={{mode: 2, t: "tSatSafe"}} />

<Preset label="（2）接近 v₂" set={{mode: 2, t: "tLate"}} />

<Preset label="（3）断开瞬间" set={{mode: 3, t: "tWatch"}} />

<Preset label="恢复演示数值" set={{mode: 1, t: 0, B: 1, R: 1, I0: 2}} />

窗口跟随金属棒，导轨足够长，画面里的一段不代表全长。$G$ 与 $F_A$ 共用比例，两箭等长时速度达到最大。$\times$ 的疏密不代表 $B$ 的大小。速度、加速度都向下为正。

<Sim
  title="金属棒沿竖直导轨下落"
  height={420}
  duration="14*tau"
  time="t"
  params={["rod", "L", "m", "g", "B", "tOpenM", "tSatM"]}
  hud={[
    {symbol: "v", expr: "rod.v(t)", unit: "m/s", digits: 2},
    {symbol: "I", expr: "rod.I(t)", unit: "A", digits: 2},
    {symbol: "a", expr: "rod.acc(t)", unit: "m/s²", digits: 2}
  ]}
  legend={[
    {kind: "velocity", symbol: "v", label: "速度向下"},
    {kind: "force", symbol: "F", label: "G 向下，F_A 向上"},
    {kind: "field", symbol: "B", label: "磁场向里"}
  ]}
  note="窗口跟随棒。G 与 F_A 等长时速度最大。× 的疏密不代表 B。"
  marks={[
    {t: 0, label: "静止释放"},
    {t: "tKey", label: "关键时刻"},
    {t: "tLate", label: "接近最大速度"}
  ]}
>
sim({
  at(t, p) {
    return p.rod.state(t)
  },
  draw(ctx, s, v) {
    const p = v.p
    const yRod = -s.x
    const half = p.L / 2
    const yHi = yRod + 1.2
    const yLo = yRod - 1.55
    const m = v.view({ xmin: -1.8, xmax: 1.8, ymin: yLo, ymax: yHi, equal: true, pad: 16 })
    const I = s.I || 0
    const G = p.m * p.g
    const FA = p.B * I * p.L
    const kF = 0.055
    const kV = 0.042

    v.field(m, -half, yLo, half, yHi, { dir: 'in', step: 20, border: false })
    v.line(m, -half, yLo, -half, yHi, { color: v.color.ink, width: 2.5 })
    v.line(m, half, yLo, half, yHi, { color: v.color.ink, width: 2.5 })

    if (yHi > 0.95 && yLo < 0.95) {
      v.line(m, -half, 0.95, half, 0.95, { color: v.color.ink, width: 2.5 })
      v.label(m, 0, 0.95, 'R、Z、S', { place: 'above', size: 12 })
    }
    if (s.x > 0.25 && yHi > 0 && yLo < 0) {
      v.line(m, -half - 0.12, 0, half + 0.12, 0, { color: v.color.steel, width: 1, dash: [5, 4] })
      v.label(m, half + 0.18, 0, '释放处', { size: 11, color: v.color.graphite })
    }

    v.bar(m, -half, yRod, half, yRod, { thick: 6, label: 'm' })
    v.dim(m, -half, yRod + 0.34, half, yRod + 0.34, 'L')

    v.vec(m, half + 0.34, yRod, 0, -G * kF, { kind: 'force', label: 'G' })
    if (FA > 0.05) {
      v.vec(m, -half - 0.34, yRod, 0, FA * kF, { kind: 'force', label: 'F_A' })
    }
    if (s.v > 0.15) {
      v.vec(m, 0.14, yRod, 0, -s.v * kV, { kind: 'velocity', label: 'v' })
    }

    v.event(m, 0, yRod, '静止释放', { at: 0, kind: 'velocity' })
    if (p.tSatM > 0) v.event(m, 0, yRod, 'Z 进入稳压', { at: p.tSatM, kind: 'charge' })
    if (p.tOpenM > 0) v.event(m, 0, yRod, '断开 S', { at: p.tOpenM, kind: 'force' })

    const tag = s.sClosed > 0.5 ? 'S 闭合' : (s.sat > 0.5 ? 'Z 稳压' : 'Z 线性')
    v.text(m, -1.62, yHi - 0.12, tag, { align: 'left', color: v.color.ink, size: 13 })
    v.text(m, 1.62, yHi - 0.12, '下落 ' + s.x.toFixed(1) + ' m', { align: 'right', color: v.color.graphite, size: 12 })
  },
})
</Sim>

<Readout items={[
  {label: "速度（向下）", symbol: "v", expr: "rod.v(t)", unit: "m/s", digits: 2, color: "velocity"},
  {label: "回路电流", symbol: "I", expr: "rod.I(t)", unit: "A", digits: 2, color: "charge"},
  {label: "通过 Z 的电流", symbol: "I_Z", expr: "iZnow", unit: "A", digits: 2, color: "charge"},
  {label: "加速度（向下）", symbol: "a", expr: "rod.acc(t)", unit: "m/s²", digits: 2, color: "accel"},
  {label: "感应电动势", symbol: "BLv", expr: "B*L*rod.v(t)", unit: "V", digits: 2, color: "field"},
  {label: "Z 的电压", symbol: "U_Z", expr: "UZnow", unit: "V", digits: 2, color: "charge"},
  {label: "最大速度 v₁", symbol: "v_1", expr: "v1", unit: "m/s", digits: 2, color: "velocity"},
  {label: "最大速度 v₂", symbol: "v_2", expr: "v2", unit: "m/s", digits: 2, color: "velocity"},
  {label: "断开瞬间的 a", symbol: "a", expr: "a", unit: "m/s²", digits: 2, color: "accel"}
]} />

<Circuit
  title="题目电路：S 与 Z 并联"
  source={{type: "generator", label: "金属棒"}}
  load={{series: [
    {type: "resistor", label: "R"},
    {parallel: [
      {type: "switch", label: "S", closed: "rod.sClosed(t) > 0.5"},
      {type: "resistor", label: "Z"}
    ]}
  ]}}
  note="只表示连接：S 与 Z 并联后再和 R 串联。S 闭合时 Z 被短路。"
/>

<Circuit
  title="分段等效电路"
  motion="rod"
  at="t"
  current={{expr: "rod.I(t)", unit: "A", label: "I"}}
  flow={{expr: "rod.I(t)", ref: 10}}
  note="线性段 Z 是电阻 U_m/I₀。稳压且 S 断开时，U_Z 为反向电压 U_m，Z 的电阻改为 0；其余时候 U_Z 为 0。"
/>

<ForceDiagram
  title="金属棒此刻受力"
  surface={{type: "none"}}
  body={{shape: "rod", label: "m"}}
  mass="m"
  accel={{angle: -90, solve: "aBar"}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g", showValue: true, unit: "N", digits: 2},
    {label: "F_A", angle: 90, magnitude: "B*L*rod.I(t)", showValue: true, unit: "N", digits: 2}
  ]}
/>

播放时，等效电路、受力图和下面曲线的游标共用时刻 $t$。$S$ 闭合时 $I_Z=0$，回路电流走开关；$S$ 断开时 $I_Z$ 就是回路电流。

## 四、结合图像理解关键时刻

<Plot
  title="速度：最大速度是收尾速度"
  caption="情形 1 趋向 v₁，情形 2 趋向 v₂ = 1.5 v₁。情形 3 先贴着 v₁，断开后再奔向 v₂。"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "14*tau"}}
  y={{label: "v", unit: "m/s", min: 0}}
  series={[
    {label: "v", expr: "rod.v(s)", color: "velocity"},
    {label: "v₁", expr: "v1", color: "steel", dash: true},
    {label: "v₂", expr: "v2", color: "graphite", dash: true}
  ]}
  marks={[
    {x: "tKey", series: 0, label: "关键时刻"},
    {x: "tLate", series: 0, label: "接近收尾"}
  ]}
  cursor="t"
/>

<Plot
  title="回路电流"
  caption="收尾电流都是 mg/(BL)。情形 3 断开瞬间电流落到 mg/(2BL)，之后又回到 mg/(BL)。"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "14*tau"}}
  y={{label: "I", unit: "A", min: 0}}
  series={[
    {label: "I", expr: "rod.I(s)", color: "charge"},
    {label: "mg/(BL)", expr: "Iterm", color: "steel", dash: true},
    {label: "mg/(2BL)", expr: "Icrit", color: "graphite", dash: true}
  ]}
  marks={[
    {x: "tKey", series: 0, label: "关键时刻"}
  ]}
  cursor="t"
/>

<Plot
  title="加速度（向下为正）"
  caption="情形 3 断开 S 时，加速度从接近 0 跳到 g/2，再随速度升高减回 0。"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "14*tau"}}
  y={{label: "a", unit: "m/s²", min: 0}}
  series={[
    {label: "a", expr: "rod.acc(s)", color: "accel"},
    {label: "g/2", expr: "g/2", color: "accel", dash: true}
  ]}
  marks={[
    {x: "tKey", series: 0, label: "关键时刻"}
  ]}
  cursor="t"
/>

<Plot
  title="元件 Z 的 U-I 图像"
  caption="折点在 I₀。题目条件下，I₀ 在 mg/(2BL) 左边，收尾电流和断开瞬间的电流都在水平段上。"
  x={{label: "I", unit: "A", min: 0, max: "max(Iterm, I0)*1.2"}}
  y={{label: "U", unit: "V", min: 0, max: "Um*1.45"}}
  series={[
    {label: "Z", color: "charge", x: "i", expr: "(i < I0) ? ((Um/I0)*i) : Um", over: {name: "i", min: 0, max: "max(Iterm, I0)*1.2"}}
  ]}
  marks={[
    {x: "I0", series: 0, label: "I₀"},
    {x: "Icrit", series: 0, label: "mg/(2BL)"},
    {x: "Iterm", series: 0, label: "收尾电流"},
    {x: "iZnow", series: 0, label: "此刻"}
  ]}
/>

对着演示初值看三条曲线。

情形 1：$S$ 一直闭合。$v$ 趋向 $10\ \text{m/s}$，$I$ 趋向 $10\ \text{A}$，$a$ 从 $10\ \text{m/s}^2$ 减到 $0$。$I_Z$ 始终为 $0$，$U$–$I$ 图上的工作点停在原点。

情形 2：$S$ 断开。不到 $1\ \text{s}$，$I_Z$ 爬到 $I_0=2\ \text{A}$，工作点走到折点，此后 $U_Z$ 保持 $5\ \text{V}$。速度继续增到 $15\ \text{m/s}$，电流再增到 $10\ \text{A}$。同样的收尾电流需要更高的速度，因为电动势要先分给 $Z$ 五个伏特。

情形 3：先走情形 1。关键时刻 $S$ 打开，$BLv$ 仍约 $10\ \text{V}$，$U_Z$ 从 $0$ 跳到 $5\ \text{V}$，电流从 $10\ \text{A}$ 跳到 $5\ \text{A}$，安培力从 $10\ \text{N}$ 跳到 $5\ \text{N}$，加速度从大约 $0$ 跳到 $5\ \text{m/s}^2$。之后电流沿着稳压段回到 $10\ \text{A}$，速度走向 $v_2$。

把 $I_0$ 拖过 $mg/(2BL)$（初值下是 $5\ \text{A}$）再看情形 3：断开瞬间的工作点落回斜线段，电流不再是一半，加速度小于 $g/2$。$I_0$ 小于这个阈值时，改变 $I_0$ 不改变 $v_1$、$v_2$ 和 $a$。改变 $B$ 或 $R$ 会改变两条最大速度，而 $a$ 仍是 $g/2$。

<Answer items={[
  {label: "最大速度 v₁", symbol: "v_1", expr: "v1", value: 10, unit: "m/s", digits: 2},
  {label: "最大速度 v₂", symbol: "v_2", expr: "v2", value: 15, unit: "m/s", digits: 2},
  {label: "断开瞬间加速度", symbol: "a", expr: "a", value: 5, unit: "m/s²", digits: 2}
]} />

## 五、答案汇总

字母答案是题目所求。$10$、$15$、$5$ 是演示数值下的结果；滑块离开演示值时，答案卡片会提示已偏离。

| 小问 | 字母答案 | 演示数值 |
|---|---|---|
| （1）$v_1$ | $\dfrac{mgR}{B^{2}L^{2}}$ | $10\ \text{m/s}$ |
| （2）$v_2$ | $\dfrac{3mgR}{2B^{2}L^{2}}$ | $15\ \text{m/s}$ |
| （3）$a$ 的大小 | $\dfrac{g}{2}$（方向向下） | $5\ \text{m/s}^2$ |
