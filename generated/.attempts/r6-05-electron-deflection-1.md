---
id: r6-05-electron-deflection
title: 电子加速与偏转：恰好从极板边缘射出
subject: physics
topic: 带电粒子在电场中的运动
source: 2022 重庆大学附中月考
question: |
  （2022·重庆大学附中月考）有两组平行金属板，一组竖直放置，一组水平放置。一质量为 m、电荷量为 e 的电子静止在竖直放置的平行金属板的 A 点，经电压 U₀ 加速后通过 B 点，进入两板间距离为 d、电压为 U 的水平放置的平行金属板间。电子从水平极板的正中间沿平行于极板的方向射入，最后刚好从右侧极板边缘射出（A、B 分别为两块竖直极板的中点）。不计重力。求：
  (1) 电子通过 B 点时的速度大小；
  (2) 水平放置的平行金属板的长度 l；
  (3) 电子射出水平放置的平行金属板时的动能。
answers:
  - { name: speedB, value: 1.4142135623730951, unit: "√(eU₀/m)" }
  - { name: plateLength, value: 1.4142135623730951, unit: d }
  - { name: kineticExit, value: 1.5, unit: eU₀ }
---

## 一、题目条件分析

电子的电荷为 $-e$，其中 $e>0$ 是电荷量的大小；$U_0$、$U$ 均表示电压的大小。

运动分为两段：

- **加速阶段**：电子从静止出发，电场力做正功 $eU_0$。
- **偏转阶段**：按平行板间匀强电场模型处理。电子沿极板方向匀速运动，垂直极板方向做初速度为零的匀加速运动。

取射入点为原点，$x$ 轴沿入射方向，$y$ 轴沿偏转方向。因此，恰好从右侧极板边缘射出意味着

$$
\boxed{x=l,\qquad y=\frac d2}.
$$

题目没有指定偏转方向。演示取向上偏转；若极板极性反转，轨迹上下翻转，所求三个结果不变。

## 二、完整解答

### （1）电子通过 B 点时的速度

由动能定理，

$$
eU_0=\frac12 mv_B^2-0,
$$

解得

$$
\boxed{v_B=\sqrt{\frac{2eU_0}{m}}}.
$$

### （2）水平极板的长度

水平极板间的电场强度大小为

$$
\boxed{E=\frac Ud},
$$

电子的加速度大小为

$$
\boxed{a=\frac{eE}{m}=\frac{eU}{md}}.
$$

设电子在水平极板间运动的时间为 $T$。沿极板方向没有电场力，因此

$$
l=v_BT.
$$

垂直极板方向满足

$$
\frac d2=\frac12 aT^2,
$$

得到

$$
\boxed{T=\sqrt{\frac da}=d\sqrt{\frac{m}{eU}}}.
$$

代入水平位移公式，

$$
l=\sqrt{\frac{2eU_0}{m}}\cdot d\sqrt{\frac{m}{eU}},
$$

所以

$$
\boxed{l=d\sqrt{\frac{2U_0}{U}}}.
$$

也可以消去时间，得到板间轨迹方程：

$$
y=\frac12 a\left(\frac{x}{v_B}\right)^2
=\boxed{\frac{U}{4U_0d}x^2}.
$$

将 $x=l$、$y=d/2$ 代入，得到同样的长度结果。

### （3）电子射出时的动能

电子从两板正中间运动到极板边缘，沿电场力方向的位移为 $d/2$。偏转电场做功

$$
W=eE\frac d2
=e\frac Ud\frac d2
=\boxed{\frac{eU}{2}}.
$$

因此，射出时的动能为

$$
E_{k,\text{出}}=eU_0+W
=\boxed{eU_0+\frac{eU}{2}}.
$$

用速度分解校验：射出时水平速度仍为 $v_B$，垂直速度为

$$
v_{y,\text{出}}=aT
=\boxed{\sqrt{\frac{eU}{m}}}.
$$

于是

$$
E_{k,\text{出}}
=\frac12 m\left(v_B^2+v_{y,\text{出}}^2\right)
=eU_0+\frac{eU}{2}.
$$

> 电子只跨越了水平极板间电势差的一半，因此偏转阶段增加的动能是 $eU/2$。

## 三、交互演示

题目只有字母，没有给出具体数值。演示采用无量纲单位，并取代表性初始值 $U/U_0=1$：

$$
v_*=\sqrt{\frac{eU_0}{m}},\qquad
t_*=\frac d{v_*},\qquad
E_* = eU_0.
$$

长度以 $d$ 为单位，速度以 $v_*$ 为单位，时间以 $t_*$ 为单位，动能以 $E_*$ 为单位。头信息中的数值答案对应这一代表性状态。

核心滑块控制缺失的电压比 $r=U/U_0$。**极板长度由“恰好射出”条件自动计算**，因此每一种电压比都对应一组满足题意的极板。

<Param name="ratio" label="电压比 U/U₀" value={1} min={0.25} max={4} step={0.05} />

<Param name="t" label="偏转阶段时间 t/t*" value={0} min={0} max={3} step={0.005} hidden={true} />

<Define name="speedB" expr="sqrt(2)" />

<Define name="acceleration" expr="ratio" />

<Define name="timeExit" expr="1 / sqrt(ratio)" />

<Define name="plateLength" expr="speedB * timeExit" />

<Define name="vyExit" expr="acceleration * timeExit" />

<Define name="speedExit" expr="sqrt(speedB^2 + vyExit^2)" />

<Define name="kineticExit" expr="(speedB^2 + vyExit^2) / 2" />

<Define name="timeInside" expr="min(t, timeExit)" />

<Define name="xCurrent" expr="speedB * t" />

<Define name="yCurrent" expr="acceleration * timeInside^2 / 2 + vyExit * max(t - timeExit, 0)" />

<Define name="vyCurrent" expr="acceleration * timeInside" />

<Define name="kineticCurrent" expr="(speedB^2 + vyCurrent^2) / 2" />

<Define name="forceCurrent" expr="t < timeExit ? ratio : 0" />

<Preset label="代表性答案：U/U₀=1，恰好射出" set={{ratio: 1, t: 1}} />

<Preset label="当前条件：从正中间射入" set={{t: 0}} />

<Preset label="当前条件：恰好射出" set={{t: "timeExit"}} />

<Preset label="较弱偏转：U/U₀=0.25" set={{ratio: 0.25, t: 0}} />

<Preset label="较强偏转：U/U₀=4" set={{ratio: 4, t: 0}} />

<Status cases={[
  {when: "abs(t - timeExit) < 1e-6", label: "恰好到达右侧极板边缘：y/d=1/2", tone: "success"},
  {when: "t > timeExit", label: "已离开电场，沿出口速度方向匀速直线运动", tone: "info"},
  {when: "abs(t) < 1e-6", label: "从正中间射入，垂直速度为零", tone: "neutral"},
  {label: "板间偏转：水平匀速，垂直匀加速", tone: "info"}
]} />

<Sim
  title="电子在水平极板间偏转并射出"
  height={340}
  duration="1.35 * timeExit"
  time="t"
  params={["ratio", "speedB", "acceleration", "timeExit", "plateLength", "vyExit"]}
  marks={[
    {t: 0, label: "正中间射入"},
    {t: "timeExit", label: "恰好从边缘射出"}
  ]}
>
sim({
  at(t, p) {
    const inside = Math.min(t, p.timeExit)
    const outside = Math.max(t - p.timeExit, 0)
    return {
      x: p.speedB * t,
      y: 0.5 * p.acceleration * inside * inside + p.vyExit * outside,
      length: p.plateLength,
      inField: t < p.timeExit,
    }
  },
  draw(ctx, s, v) {
    const l = s.length
    const m = v.view({
      xmin: -0.3 * l,
      xmax: 1.5 * l,
      ymin: -0.95,
      ymax: 1.15,
      pad: 24,
    })

    v.line(m, 0, 0.5, l, 0.5, { color: v.color.orange, width: 4 })
    v.line(m, 0, -0.5, l, -0.5, { color: v.color.blue, width: 4 })
    v.label(m, 0.5 * l, 0.68, '上极板（正）', { color: v.color.orange })
    v.label(m, 0.5 * l, -0.63, '下极板（负）', { color: v.color.blue })

    v.arrow(m, 0.25 * l, 0.3, 0.25 * l, -0.3, { color: v.color.muted })
    v.label(m, 0.25 * l, 0.08, 'E 向下', { color: v.color.muted })

    v.dim(m, -0.15 * l, -0.5, -0.15 * l, 0.5, 'd', { offset: 0 })
    v.dim(m, 0, -0.82, l, -0.82, 'l/d = ' + l.toFixed(3), { offset: 0 })

    v.circle(m, l, 0.5, 0.025, { color: v.color.green })
    v.label(m, l, 0.53, '出口：y/d = 1/2', { color: v.color.green })
    v.label(m, 0, -0.1, '入口：y = 0', { color: v.color.muted })

    v.ball(m, s.x, s.y, 0.035, { color: v.color.purple, label: 'e⁻' })
    v.label(
      m,
      1.15 * l,
      -0.3,
      s.inField ? '板间偏转' : '离场后匀速',
      { color: v.color.text }
    )
  },
})
</Sim>

图中电子和标记点的大小为示意，不按比例；位置与尺寸以 $d$ 为单位。电场方向向下，电子所受电场力向上。

<ForceDiagram
  title="电子当前受力：忽略重力"
  surface={{type: "none"}}
  body={{shape: "ball", label: "e⁻"}}
  forces={[
    {label: "F电", angle: 90, magnitude: "forceCurrent", showValue: true, unit: "eU₀/d", digits: 2}
  ]}
/>

<Readout items={[
  {label: "通过 B 点的速度 vB/v*", expr: "speedB", digits: 3},
  {label: "所需极板长度 l/d", expr: "plateLength", digits: 3},
  {label: "射出时间 T/t*", expr: "timeExit", digits: 3},
  {label: "当前水平位置 x/d", expr: "xCurrent", digits: 3},
  {label: "当前偏转位移 y/d", expr: "yCurrent", digits: 3},
  {label: "当前垂直速度 vy/v*", expr: "vyCurrent", digits: 3},
  {label: "当前动能 Ek/(eU₀)", expr: "kineticCurrent", digits: 3},
  {label: "射出动能 Ek出/(eU₀)", expr: "kineticExit", digits: 3}
]} />

<Plot
  title="偏转位移随时间变化：出场后曲线变为直线"
  x={{name: "t", label: "t/t*", min: 0, max: "1.35 * timeExit"}}
  y={{label: "y/d", min: 0, max: 1}}
  series={[
    {label: "电子偏转位移", expr: "t <= timeExit ? ratio * t^2 / 2 : 0.5 + vyExit * (t - timeExit)", color: "purple"},
    {label: "极板边缘 y/d=1/2", expr: "0.5", color: "gray"}
  ]}
  marks={[
    {x: 0, series: 0, label: "射入：垂直初速度为零"},
    {x: "timeExit", series: 0, label: "射出：偏转位移为 d/2"}
  ]}
  cursor="t"
/>

<Plot
  title="速度分量随时间变化"
  x={{name: "t", label: "t/t*", min: 0, max: "1.35 * timeExit"}}
  y={{label: "v/v*", min: 0}}
  series={[
    {label: "水平速度 vx", expr: "speedB", color: "blue"},
    {label: "垂直速度 vy", expr: "ratio * min(t, timeExit)", color: "orange"}
  ]}
  marks={[
    {x: "timeExit", series: 1, label: "离开电场后，两个速度分量均保持不变"}
  ]}
  cursor="t"
/>

## 四、结合图像理解关键时刻

**射入时**，电子已有水平速度 $v_B$，垂直速度为零。因此偏转位移图像起点的斜率为零，轨迹在入口处沿水平方向。

**板间运动时**，水平速度不变，垂直速度线性增大。偏转位移图像是抛物线，电场力持续做正功，动能逐渐增加。

**恰好射出时**，电子到达 $x=l$、$y=d/2$。偏转位移图像与 $y/d=1/2$ 相交，对应进度条上的“恰好从边缘射出”。

**离开电场后**，电场力为零，电子沿出口速度方向匀速直线运动。位移图像斜率保持不变，速度分量和动能均保持不变。

拖动电压比滑块时，保持 $m$、$e$、$U_0$、$d$ 不变：

$$
\boxed{\frac ld=\sqrt{\frac2r}},
\qquad
\boxed{\frac{E_{k,\text{出}}}{eU_0}=1+\frac r2},
\qquad r=\frac U{U_0}.
$$

| 电压比 $r$ | 极板长度 $l/d$ | 射出动能 $E_{k,\text{出}}/(eU_0)$ |
|---|---:|---:|
| $1/4$ | $2\sqrt2$ | $9/8$ |
| $1$ | $\sqrt2$ | $3/2$ |
| $4$ | $1/\sqrt2$ | $3$ |

电压比从 $1$ 增大到 $4$ 时，加速度变为原来的 $4$ 倍，达到 $d/2$ 所需的时间减半，满足“恰好射出”的极板长度也减半。

## 五、答案汇总

| 小问 | 一般答案 | 代表性状态 $U/U_0=1$ |
|---|---|---|
| （1）通过 B 点的速度 | $\boxed{v_B=\sqrt{2eU_0/m}}$ | $v_B/v_*=\sqrt2\approx1.414$ |
| （2）水平极板长度 | $\boxed{l=d\sqrt{2U_0/U}}$ | $l/d=\sqrt2\approx1.414$ |
| （3）射出时的动能 | $\boxed{E_{k,\text{出}}=eU_0+eU/2}$ | $E_{k,\text{出}}/(eU_0)=1.500$ |
