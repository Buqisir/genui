---
id: r6-07-orbit-transfer
title: 卫星变轨：两次加速分别增加多少速度
subject: physics
topic: 万有引力、机械能守恒与卫星变轨
source: 必修2 第七章综合挑战
question: |
  现要把位于赤道上空、轨道半径 r₁=6.5×10³ km 的圆形轨道上的卫星，转移到半径 r₂=4.2×10⁴ km 的同步卫星圆轨道上去。转移分两步：先在短时间内给卫星加速，使它从距地心 r₁ 的近地点 A 沿椭圆轨道运动到距地心 r₂ 的远地点 B（椭圆转移轨道的近地点、远地点距地心分别为 r₁、r₂）；当卫星飞到远地点 B 时，再次给它加速，使它进入半径为 r₂ 的圆轨道。已知地球质量 M=5.98×10²⁴ kg，引力常量 G=6.67×10⁻¹¹ N·m²/kg²，质量分别为 M 和 m 的两物体相距 r 时，引力势能 Ep=−GMm/r。试求两次加速过程中，卫星的速度各增加了多少。
answers:
  - { name: dv1, value: 2474.73, unit: m/s }
  - { name: dv2, value: 1486.22, unit: m/s }
---

## 一、题目条件分析

先统一单位：

$$
r_1=\boxed{6.5\times10^6\ \mathrm m},\qquad
r_2=\boxed{4.2\times10^7\ \mathrm m},
$$

$$
GM=\boxed{3.98866\times10^{14}\ \mathrm{m^3/s^2}}.
$$

用四个速度区分两次加速的前后状态：

| 位置 | 加速前 | 加速后 |
|---|---|---|
| 近地点 A | 原圆轨道速度 $v_1$ | 椭圆轨道近地点速度 $v_A$ |
| 远地点 B | 椭圆轨道远地点速度 $v_B$ | 同步圆轨道速度 $v_2$ |

因此，题目要求的是

$$
\Delta v_1=v_A-v_1,\qquad
\Delta v_2=v_2-v_B.
$$

把两次短时间加速视为瞬时过程：位置来不及明显改变，速度沿运动方向增加。A、B 之间发动机不工作，只受地球引力，机械能守恒。

## 二、完整解答

### （1）两个圆轨道上的速度

圆轨道上，引力提供向心力：

$$
\frac{GMm}{r^2}=\frac{mv^2}{r}
\quad\Rightarrow\quad
v=\sqrt{\frac{GM}{r}}.
$$

所以

$$
v_1=\sqrt{\frac{GM}{r_1}}
=\boxed{7.83352\times10^3\ \mathrm{m/s}},
$$

$$
v_2=\sqrt{\frac{GM}{r_2}}
=\boxed{3.08169\times10^3\ \mathrm{m/s}}.
$$

### （2）椭圆轨道两端的速度

在近地点和远地点，速度均垂直于地心与卫星的连线。引力始终指向地心，对地心的力矩为零，角动量守恒，得到

$$
mr_1v_A=mr_2v_B
\quad\Rightarrow\quad
\boxed{v_B=\frac{r_1}{r_2}v_A}.
$$

这也可以理解为开普勒第二定律：在两端相同的极短时间内，扫过面积分别近似为 $\frac12r_1v_A\Delta t$ 和 $\frac12r_2v_B\Delta t$，二者相等。

A 到 B 的机械能守恒：

$$
\frac12mv_A^2-\frac{GMm}{r_1}
=
\frac12mv_B^2-\frac{GMm}{r_2}.
$$

代入 $v_B=(r_1/r_2)v_A$，约去 $m$：

$$
\frac12v_A^2\left(1-\frac{r_1^2}{r_2^2}\right)
=
GM\left(\frac1{r_1}-\frac1{r_2}\right).
$$

整理得

$$
v_A=\boxed{\sqrt{\frac{2GMr_2}{r_1(r_1+r_2)}}}
=\boxed{1.03082\times10^4\ \mathrm{m/s}},
$$

$$
v_B=\boxed{\sqrt{\frac{2GMr_1}{r_2(r_1+r_2)}}}
=\boxed{1.59547\times10^3\ \mathrm{m/s}}.
$$

卫星质量 $m$ 已约去，因此题目没有给出卫星质量，也能求出速度变化。

### （3）两次速度增量

第一次在 A 点，从原圆轨道进入椭圆转移轨道：

$$
\begin{aligned}
\Delta v_1
&=v_A-v_1\\
&=\sqrt{\frac{GM}{r_1}}
\left(\sqrt{\frac{2r_2}{r_1+r_2}}-1\right)\\
&=\boxed{2.47473\times10^3\ \mathrm{m/s}}
\approx\boxed{2.47\ \mathrm{km/s}}.
\end{aligned}
$$

第二次在 B 点，从椭圆转移轨道进入同步圆轨道：

$$
\begin{aligned}
\Delta v_2
&=v_2-v_B\\
&=\sqrt{\frac{GM}{r_2}}
\left(1-\sqrt{\frac{2r_1}{r_1+r_2}}\right)\\
&=\boxed{1.48622\times10^3\ \mathrm{m/s}}
\approx\boxed{1.49\ \mathrm{km/s}}.
\end{aligned}
$$

> **易错点**：$\sqrt{GM/r}$ 适用于圆轨道。椭圆轨道的 A、B 两点虽然径向速度为零，却不能把它们当作圆轨道来计算速度。第一次增加的是 $v_A-v_1$，第二次增加的是 $v_2-v_B$。

## 三、交互演示

题目数据固定，拖动时间滑块或播放动画，观察两次加速前后的速度。

为了展示第一次加速前的运动，演示从卫星到达 A 点前的八分之一个原圆轨道周期开始计时。两次加速分别发生在 $t_A$、$t_B$，椭圆转移耗时为 $t_B-t_A$。

轨道位置按比例绘制；卫星符号与速度箭头**不按比例**。地心用一个点表示，箭头方向表示速度方向，箭头长度表示速度的相对大小。

<Param name="G" label="引力常量" value={6.67e-11} min={6.67e-11} max={6.67e-11} step={1e-13} unit="N·m²/kg²" hidden={true} />

<Param name="M" label="地球质量" value={5.98e24} min={5.98e24} max={5.98e24} step={1e22} unit="kg" hidden={true} />

<Param name="r1" label="原圆轨道半径" value={6.5e6} min={6.5e6} max={6.5e6} step={1e4} unit="m" hidden={true} />

<Param name="r2" label="同步圆轨道半径" value={4.2e7} min={4.2e7} max={4.2e7} step={1e5} unit="m" hidden={true} />

<Param name="t" label="演示时刻 t" value={0} min={0} max={45000} step={1} unit="s" />

<Param name="tau" label="图像时间自变量" value={0} min={0} max={45000} step={1} unit="s" hidden={true} />

<Define name="mu" expr="G*M" />

<Define name="aTransfer" expr="(r1+r2)/2" />

<Define name="ecc" expr="(r2-r1)/(r1+r2)" />

<Define name="bTransfer" expr="aTransfer*sqrt(1-ecc^2)" />

<Define name="v1" expr="sqrt(mu/r1)" />

<Define name="v2" expr="sqrt(mu/r2)" />

<Define name="vA" expr="sqrt(2*mu*r2/(r1*(r1+r2)))" />

<Define name="vB" expr="sqrt(2*mu*r1/(r2*(r1+r2)))" />

<Define name="dv1" expr="vA-v1" />

<Define name="dv2" expr="v2-vB" />

<Define name="T1" expr="2*pi*sqrt(r1^3/mu)" />

<Define name="T2" expr="2*pi*sqrt(r2^3/mu)" />

<Define name="nTransfer" expr="sqrt(mu/aTransfer^3)" />

<Define name="tTransfer" expr="pi/nTransfer" />

<Define name="tA" expr="T1/8" />

<Define name="tB" expr="tA+tTransfer" />

<Define name="tQuarter" expr="tB+T2/4" />

<Define name="meanAnomaly" expr="nTransfer*clamp(t-tA,0,tTransfer)" />

<Define name="E0" expr="meanAnomaly+ecc*sin(meanAnomaly)" />

<Define name="E1" expr="E0-(E0-ecc*sin(E0)-meanAnomaly)/(1-ecc*cos(E0))" />

<Define name="E2" expr="E1-(E1-ecc*sin(E1)-meanAnomaly)/(1-ecc*cos(E1))" />

<Define name="E3" expr="E2-(E2-ecc*sin(E2)-meanAnomaly)/(1-ecc*cos(E2))" />

<Define name="E4" expr="E3-(E3-ecc*sin(E3)-meanAnomaly)/(1-ecc*cos(E3))" />

<Define name="E5" expr="E4-(E4-ecc*sin(E4)-meanAnomaly)/(1-ecc*cos(E4))" />

<Define name="E6" expr="E5-(E5-ecc*sin(E5)-meanAnomaly)/(1-ecc*cos(E5))" />

<Define name="radiusNow" expr="t < tA ? r1 : (t < tB ? aTransfer*(1-ecc*cos(E6)) : r2)" />

<Define name="speedNow" expr="t < tA ? v1 : (t < tB ? sqrt(mu*(2/radiusNow-1/aTransfer)) : v2)" />

<Define name="energy1" expr="-mu/(2*r1)" />

<Define name="energyTransfer" expr="-mu/(2*aTransfer)" />

<Define name="energy2" expr="-mu/(2*r2)" />

<Define name="energyNow" expr="t < tA ? energy1 : (t < tB ? energyTransfer : energy2)" />

<Status cases={[
  {when: "abs(t-tA) < 1e-6", label: "A 点第一次加速刚完成：进入椭圆轨道", tone: "success"},
  {when: "abs(t-tB) < 1e-6", label: "B 点第二次加速刚完成：进入同步圆轨道", tone: "success"},
  {when: "t < tA", label: "原圆轨道：速度大小不变", tone: "neutral"},
  {when: "t < tB", label: "椭圆转移：逐渐远离地心，速度逐渐减小", tone: "info"},
  {label: "同步圆轨道：速度大小再次保持不变", tone: "success"}
]} />

<Preset label="第一次加速前：v₁" set={{t: "tA-0.01"}} />

<Preset label="第一次加速后：增加 Δv₁" set={{t: "tA"}} />

<Preset label="第二次加速前：v_B" set={{t: "tB-0.01"}} />

<Preset label="第二次加速后：增加 Δv₂" set={{t: "tB"}} />

<Sim
  title="圆轨道 → 椭圆转移轨道 → 同步圆轨道"
  height={420}
  duration={45000}
  time="t"
  params={["r1", "r2", "aTransfer", "bTransfer", "ecc", "v1", "v2", "T1", "T2", "nTransfer", "tA", "tB"]}
  marks={[
    {t: 0, label: "原圆轨道"},
    {t: "tA", label: "A：第一次加速"},
    {t: "tB", label: "B：第二次加速"},
    {t: "tQuarter", label: "沿同步圆轨道运行"}
  ]}
>
sim({
  at(t, p) {
    let x, y, vx, vy, stage
    if (t < p.tA) {
      const angle = 2 * Math.PI * (t - p.tA) / p.T1
      x = p.r1 * Math.cos(angle)
      y = p.r1 * Math.sin(angle)
      vx = -p.v1 * Math.sin(angle)
      vy = p.v1 * Math.cos(angle)
      stage = 0
    } else if (t < p.tB) {
      const mean = p.nTransfer * (t - p.tA)
      let E = mean + p.ecc * Math.sin(mean)
      for (let i = 0; i < 8; i++) {
        E -= (E - p.ecc * Math.sin(E) - mean) /
          (1 - p.ecc * Math.cos(E))
      }
      const denominator = 1 - p.ecc * Math.cos(E)
      x = p.aTransfer * (Math.cos(E) - p.ecc)
      y = p.bTransfer * Math.sin(E)
      vx = -p.aTransfer * p.nTransfer * Math.sin(E) / denominator
      vy = p.bTransfer * p.nTransfer * Math.cos(E) / denominator
      stage = 1
    } else {
      const angle = Math.PI + 2 * Math.PI * (t - p.tB) / p.T2
      x = p.r2 * Math.cos(angle)
      y = p.r2 * Math.sin(angle)
      vx = -p.v2 * Math.sin(angle)
      vy = p.v2 * Math.cos(angle)
      stage = 2
    }
    return {
      x: x / p.r2,
      y: y / p.r2,
      vx,
      vy,
      stage,
    }
  },
  draw(ctx, s, v) {
    const p = v.p
    const m = v.view({
      xmin: -1.3, xmax: 1.3,
      ymin: -1.3, ymax: 1.3,
      pad: 24,
    })
    v.circle(m, 0, 0, p.r2 / p.r2, {
      color: v.color.green, width: 1,
    })
    v.circle(m, 0, 0, p.r1 / p.r2, {
      color: v.color.blue, width: 1,
    })
    const orbit = []
    for (let i = 0; i <= 180; i++) {
      const E = 2 * Math.PI * i / 180
      orbit.push([
        p.aTransfer * (Math.cos(E) - p.ecc) / p.r2,
        p.bTransfer * Math.sin(E) / p.r2,
      ])
    }
    v.path(m, orbit, { color: v.color.orange, width: 1 })
    v.ball(m, 0, 0, 0.012, { color: v.color.text })
    v.label(m, 0, -0.06, '地心', { color: v.color.text })
    v.label(m, p.r1 / p.r2 + 0.04, -0.08, 'A：近地点', {
      color: v.color.blue,
    })
    v.label(m, -1.05, 0.08, 'B：远地点', {
      color: v.color.green,
    })
    v.label(m, 0.56, 0.82, '同步圆轨道', {
      color: v.color.green,
    })
    v.label(m, -0.46, 0.49, '椭圆转移轨道', {
      color: v.color.orange,
    })
    const color = s.stage === 0 ? v.color.blue :
      (s.stage === 1 ? v.color.orange : v.color.green)
    v.arrow(
      m, s.x, s.y,
      s.x + 0.25 * s.vx / p.v1,
      s.y + 0.25 * s.vy / p.v1,
      { color, width: 2 },
    )
    v.ball(m, s.x, s.y, 0.025, { color })
    v.label(m, s.x + 0.04, s.y + 0.05, '卫星', { color })
    v.label(m, 0.62, -1.16, '速度箭头不按长度单位绘制', {
      color: v.color.muted,
    })
  },
})
</Sim>

<Readout items={[
  {label: "距地心 r/r₂", expr: "radiusNow/r2", digits: 4},
  {label: "当前速度", expr: "speedNow/1000", unit: "km/s", digits: 3},
  {label: "原圆轨道速度 v₁", expr: "v1/1000", unit: "km/s", digits: 3},
  {label: "近地点速度 v_A", expr: "vA/1000", unit: "km/s", digits: 3},
  {label: "远地点速度 v_B", expr: "vB/1000", unit: "km/s", digits: 3},
  {label: "同步圆轨道速度 v₂", expr: "v2/1000", unit: "km/s", digits: 3},
  {label: "第一次速度增量 Δv₁", expr: "dv1/1000", unit: "km/s", digits: 3},
  {label: "第二次速度增量 Δv₂", expr: "dv2/1000", unit: "km/s", digits: 3}
]} />

<Plot
  title="单位质量机械能随时间变化：滑行时守恒，加速时上升"
  x={{name: "tau", label: "演示时刻 t", unit: "s", min: 0, max: 45000}}
  y={{label: "E/m", unit: "MJ/kg", min: -35, max: 0}}
  series={[
    {label: "单位质量机械能", expr: "(tau < tA ? energy1 : (tau < tB ? energyTransfer : energy2))/1000000", color: "purple"}
  ]}
  marks={[
    {x: "tA", series: 0, label: "第一次加速：能量上升"},
    {x: "tB", series: 0, label: "第二次加速：能量再次上升"}
  ]}
  cursor="t"
/>

<Readout items={[
  {label: "当前单位质量机械能", expr: "energyNow/1000000", unit: "MJ/kg", digits: 3},
  {label: "椭圆转移耗时", expr: "tTransfer/3600", unit: "h", digits: 3}
]} />

## 四、结合图像理解关键时刻

**A 点第一次加速：位置连续，速度增大。** 点击加速前、后的按钮，速度由 $7.834\ \mathrm{km/s}$ 变为 $10.308\ \mathrm{km/s}$。卫星获得更多机械能，进入能到达 B 点的椭圆轨道。

**A 到 B：速度减小，但机械能保持不变。** 卫星逐渐远离地心，引力势能 $-GMm/r$ 增大，动能减小。能量图中的水平段表示机械能守恒，并不表示速度不变。

**B 点第二次加速：把椭圆运动接成圆周运动。** 到达 B 点时，卫星只有 $1.595\ \mathrm{km/s}$，小于该半径的圆轨道速度 $3.082\ \mathrm{km/s}$，因此还要增加 $1.486\ \mathrm{km/s}$。

若不进行第二次加速，B 点只是椭圆轨道的远地点，卫星随后会沿椭圆返回近地点；到达同步轨道的高度，并不等于已经进入同步圆轨道。

图像中的两次能量跃升对应理想化的瞬时加速。加速后速度方向与加速前相同，所以这里的速度增量可以直接用速率之差计算。

## 五、答案汇总

| 加速过程 | 加速前速率 | 加速后速率 | 速度增加量 |
|---|---:|---:|---:|
| A 点：原圆轨道 → 椭圆轨道 | $7.83352\ \mathrm{km/s}$ | $10.30825\ \mathrm{km/s}$ | $\boxed{2.47473\ \mathrm{km/s}}$ |
| B 点：椭圆轨道 → 同步圆轨道 | $1.59547\ \mathrm{km/s}$ | $3.08169\ \mathrm{km/s}$ | $\boxed{1.48622\ \mathrm{km/s}}$ |

按题目数据取三位有效数字：

$$
\boxed{\Delta v_1=2.47\times10^3\ \mathrm{m/s}},\qquad
\boxed{\Delta v_2=1.49\times10^3\ \mathrm{m/s}}.
$$
