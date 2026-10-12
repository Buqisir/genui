---
id: r5-06-spring-abc
title: 碰撞与弹簧：共同速度对应最大弹性势能
subject: physics
topic: 动量守恒与机械能守恒
source: 选必1 模块备考卷 16 题（14 分）
question: |
  用轻质弹簧相连的质量均为 2 kg 的 A、B 两物块都以 v=6 m/s 的速度在光滑的水平地面上向右运动，弹簧处于原长（A 在左、B 在右），质量为 4 kg 的物块 C 静止于 B 的前方。B 与 C 碰撞后二者粘在一起运动，求：
  (1) 当弹簧的弹性势能最大时，物块 A 的速度多大？
  (2) 弹簧弹性势能的最大值是多少？
answers:
  - { name: vBC0, value: 2, unit: "m/s" }
  - { name: vAtMax, value: 3, unit: "m/s" }
  - { name: EAfter, value: 48, unit: "J" }
  - { name: EKMin, value: 36, unit: "J" }
  - { name: EpMax, value: 12, unit: "J" }
  - { name: collisionLoss, value: 24, unit: "J" }
---

## 一、题目条件分析

取水平向右为正方向。

- $m_A=m_B=2\ \mathrm{kg}$，$m_C=4\ \mathrm{kg}$。
- 碰撞前，$v_A=v_B=6\ \mathrm{m/s}$，$v_C=0$，弹簧处于原长。
- B、C 碰撞后粘在一起，可视为质量 $m_{BC}=6\ \mathrm{kg}$ 的整体。
- 水平地面光滑，A、B、C 系统的水平动量始终守恒。

按高中物理的瞬时碰撞模型处理：碰撞瞬间弹簧形变量来不及改变，A 的速度仍为 $6\ \mathrm{m/s}$。

需要区分两个阶段：

| 阶段 | 动量 | 机械能 |
|---|---|---|
| B、C 碰撞并粘合 | B、C 的总动量守恒 | 不守恒 |
| 碰撞后 A 与 BC 通过弹簧相互作用 | A 与 BC 的总动量守恒 | 守恒 |

## 二、完整解答

### 1. 先求 B、C 碰撞后的速度

对 B、C 运用动量守恒：

$$
m_Bv=(m_B+m_C)v_{BC,0}.
$$

因此

$$
v_{BC,0}=\frac{2\times6}{2+4}
=\boxed{2\ \mathrm{m/s}},
$$

方向向右。此时 A 的速度为 $6\ \mathrm{m/s}$，比 BC 快，弹簧开始被压缩。

### 2. 弹性势能最大时，A 与 BC 速度相同

设弹簧压缩量为 $c$，则

$$
\dot c=v_A-v_{BC}.
$$

第一次压缩过程中，$c>0$，弹性势能的变化率为

$$
\frac{\mathrm dE_p}{\mathrm dt}
=kc\dot c
=kc(v_A-v_{BC}).
$$

开始时 $v_A>v_{BC}$，压缩量和弹性势能都增大。弹簧对 A 的作用力向左，使 A 减速；对 BC 的作用力向右，使 BC 加速。

当两者速度相同时，压缩量达到最大；随后两者开始分离，弹性势能减小。因此，最大弹性势能对应

$$
v_A=v_{BC}=V.
$$

对整个系统运用水平动量守恒：

$$
m_Av+m_Bv=(m_A+m_B+m_C)V.
$$

代入数据：

$$
V=\frac{2\times6+2\times6}{2+2+4}
=\boxed{3\ \mathrm{m/s}}.
$$

所以第（1）问：

$$
\boxed{v_A=3\ \mathrm{m/s}\text{，方向向右}}.
$$

这里的共同速度是系统的质心速度，并不是零。

### 3. 从碰撞结束后开始列机械能守恒

碰撞刚结束，弹簧仍处于原长，其弹性势能为零。此时系统机械能为

$$
E_{\text{碰后}}
=\frac12m_Av^2+\frac12m_{BC}v_{BC,0}^2
=\frac12\times2\times6^2+\frac12\times6\times2^2
=\boxed{48\ \mathrm J}.
$$

弹性势能最大时，两物体的共同速度为 $3\ \mathrm{m/s}$，总动能为

$$
E_{k,\min}
=\frac12(m_A+m_{BC})V^2
=\frac12\times8\times3^2
=\boxed{36\ \mathrm J}.
$$

碰撞后的弹簧运动阶段机械能守恒：

$$
E_{\text{碰后}}=E_{k,\min}+E_{p,\max}.
$$

因此第（2）问：

$$
E_{p,\max}=48-36
=\boxed{12\ \mathrm J}.
$$

### 4. 核对能量损失发生在哪里

碰撞前的总动能为

$$
E_{\text{碰前}}=\frac12\times2\times6^2+\frac12\times2\times6^2
=72\ \mathrm J.
$$

碰撞损失的机械能为

$$
\Delta E_{\text{碰撞}}=72-48=\boxed{24\ \mathrm J}.
$$

能量账目为

$$
72\ \mathrm J
=
\underbrace{24\ \mathrm J}_{\text{碰撞损失}}
+
\underbrace{36\ \mathrm J}_{\text{共同运动的动能}}
+
\underbrace{12\ \mathrm J}_{\text{最大弹性势能}}.
$$

不能把碰撞前的 $72\ \mathrm J$ 全部带入碰撞后阶段的机械能守恒方程。

## 三、交互演示

演示从 **B、C 刚碰撞结束** 开始，播放到第一次最大压缩。

题目没有给出劲度系数 $k$，因此不能确定实际振动周期、最大压缩量和达到最大压缩所需的秒数。使用无量纲相位

$$
\tau=\omega t,\qquad
\omega=\sqrt{k\left(\frac1{m_A}+\frac1{m_{BC}}\right)}
$$

描述运动进度。

设最大压缩量为 $a$。碰撞后两物体的初始相对速度为 $4\ \mathrm{m/s}$，所以

$$
a=\frac{4\ \mathrm{m/s}}{\omega},\qquad
\frac ca=\sin\tau.
$$

第一次最大压缩发生在 $\tau=\pi/2$。具体的 $a$ 和 $t$ 仍取决于未知的 $k$；速度和能量的答案不依赖 $k$。

<Param name="mA" label="A 的质量" value={2} min={2} max={2} step={1} unit="kg" hidden={true} />

<Param name="mB" label="B 的质量" value={2} min={2} max={2} step={1} unit="kg" hidden={true} />

<Param name="mC" label="C 的质量" value={4} min={4} max={4} step={1} unit="kg" hidden={true} />

<Param name="v0" label="碰撞前 A、B 的速度" value={6} min={6} max={6} step={1} unit="m/s" hidden={true} />

<Param name="tau" label="压缩阶段的进度 τ = ωt" value={0} min={0} max={1.5707963267948966} step={0.001} />

<Define name="mBC" expr="mB + mC" />

<Define name="mTotal" expr="mA + mBC" />

<Define name="vBC0" expr="mB * v0 / mBC" />

<Define name="vCM" expr="(mA + mB) * v0 / mTotal" />

<Define name="vAtMax" expr="vCM" />

<Define name="u0" expr="v0 - vBC0" />

<Define name="reducedMass" expr="mA * mBC / mTotal" />

<Define name="EAfter" expr="mA * v0^2 / 2 + mBC * vBC0^2 / 2" />

<Define name="EKMin" expr="mTotal * vCM^2 / 2" />

<Define name="EpMax" expr="reducedMass * u0^2 / 2" />

<Define name="collisionLoss" expr="(mA + mB) * v0^2 / 2 - EAfter" />

<Define name="phaseMax" expr="pi / 2" />

<Define name="compressionRatio" expr="sin(tau)" />

<Define name="vA" expr="vCM + mBC / mTotal * u0 * cos(tau)" />

<Define name="vBC" expr="vCM - mA / mTotal * u0 * cos(tau)" />

<Define name="Ep" expr="EpMax * sin(tau)^2" />

<Define name="EK" expr="mA * vA^2 / 2 + mBC * vBC^2 / 2" />

<Define name="EArelative" expr="EpMax * cos(tau)^2" />

<Preset label="碰撞刚结束：A 为 6 m/s，BC 为 2 m/s" set={{tau: 0}} />

<Preset label="答案状态：共同速度 3 m/s，弹性势能 12 J" set={{tau: "phaseMax"}} />

<Status cases={[
  {when: "abs(vA - vBC) < 1e-6", label: "速度相同：最大压缩，弹性势能达到 12 J", tone: "success"},
  {when: "abs(tau) < 1e-6", label: "碰撞刚结束：弹簧原长，A 比 BC 快", tone: "info"},
  {label: "A 减速、BC 加速：压缩量和弹性势能正在增大", tone: "neutral"}
]} />

下面的动画采用随质心以 $3\ \mathrm{m/s}$ 向右运动的参考系，省略整体平移。图中标注的速度是**相对质心的速度**；下方读数和速度图给出相对地面的速度。

**示意图不按比例**：弹簧初始间距和物块大小仅用于排版，不代表题目给定的长度。物块相对初始位置的位移分别按 $a$ 归一化，最大压缩时为 $+3a/4$ 和 $-a/4$。

<Sim
  title="碰撞后压缩：在质心参考系中观察"
  height={280}
  duration="phaseMax"
  time="tau"
  params={["mA", "mBC", "mTotal", "u0"]}
  marks={[
    {t: 0, label: "碰撞刚结束"},
    {t: "phaseMax", label: "最大压缩：答案状态"}
  ]}
>
sim({
  at(t, p) {
    const q = Math.sin(t)
    const relativeSpeed = p.u0 * Math.cos(t)
    return {
      q,
      shiftA: p.mBC / p.mTotal * q,
      shiftBC: -p.mA / p.mTotal * q,
      wA: p.mBC / p.mTotal * relativeSpeed,
      wBC: -p.mA / p.mTotal * relativeSpeed,
    }
  },
  draw(ctx, s, v) {
    const m = v.view({
      xmin: -3,
      xmax: 3,
      ymin: -1.4,
      ymax: 1.8,
      pad: 24,
    })
    const xA = -1.8 + s.shiftA
    const xBC = 1.8 + s.shiftBC
    const left = xA + 0.35
    const right = xBC - 0.5
    const points = [[left, 0], [left + 0.12, 0]]
    const start = left + 0.12
    const end = right - 0.12
    for (let i = 1; i < 16; i++) {
      points.push([
        start + (end - start) * i / 16,
        i % 2 === 0 ? -0.12 : 0.12,
      ])
    }
    points.push([end, 0], [right, 0])
    v.path(m, points, { color: v.color.gray, width: 2 })
    v.block(m, xA, 0, 0.7, 0.6, {
      color: v.color.blue,
      label: 'A：2 kg',
    })
    v.block(m, xBC, 0, 1, 0.6, {
      color: v.color.orange,
      label: 'BC：6 kg',
    })
    v.label(m, xA, 0.95,
      '相对质心：' + s.wA.toFixed(2) + ' m/s',
      { color: v.color.blue })
    v.label(m, xBC, 0.95,
      '相对质心：' + s.wBC.toFixed(2) + ' m/s',
      { color: v.color.orange })
    v.label(m, 0, -0.85,
      '压缩量 / 最大压缩量 = ' + s.q.toFixed(3),
      { color: v.color.text })
    if (Math.abs(s.wA - s.wBC) < 1e-6) {
      v.label(m, 0, 1.5,
        '相对运动瞬时停止；相对地面仍共同向右运动',
        { color: v.color.green })
    }
  },
})
</Sim>

<Readout items={[
  {label: "A 相对地面的速度", expr: "vA", unit: "m/s", digits: 3},
  {label: "BC 相对地面的速度", expr: "vBC", unit: "m/s", digits: 3},
  {label: "压缩量 / 最大压缩量", expr: "compressionRatio", digits: 3},
  {label: "弹性势能", expr: "Ep", unit: "J", digits: 3},
  {label: "总动能", expr: "EK", unit: "J", digits: 3},
  {label: "碰撞后机械能", expr: "EK + Ep", unit: "J", digits: 3}
]} />

<Plot
  title="相对地面的速度：两条曲线相交时弹性势能最大"
  x={{name: "tau", label: "无量纲相位 τ = ωt", min: 0, max: "phaseMax"}}
  y={{label: "v", unit: "m/s", min: 0, max: 6}}
  series={[
    {label: "A", expr: "vCM + mBC / mTotal * u0 * cos(tau)", color: "blue"},
    {label: "BC", expr: "vCM - mA / mTotal * u0 * cos(tau)", color: "orange"},
    {label: "质心速度", expr: "vCM", color: "gray"}
  ]}
  marks={[
    {x: 0, series: 0, label: "A：6 m/s"},
    {x: 0, series: 1, label: "BC：2 m/s"},
    {x: "phaseMax", series: 0, label: "共同速度：3 m/s"}
  ]}
  cursor="tau"
/>

<Plot
  title="能量转化：碰撞后的机械能始终为 48 J"
  x={{name: "tau", label: "无量纲相位 τ = ωt", min: 0, max: "phaseMax"}}
  y={{label: "E", unit: "J", min: 0, max: 50}}
  series={[
    {label: "弹性势能", expr: "EpMax * sin(tau)^2", color: "green"},
    {label: "总动能", expr: "EKMin + EpMax * cos(tau)^2", color: "blue"},
    {label: "机械能", expr: "EAfter", color: "gray"}
  ]}
  marks={[
    {x: "phaseMax", series: 0, label: "最大弹性势能：12 J"},
    {x: "phaseMax", series: 1, label: "最小总动能：36 J"}
  ]}
  cursor="tau"
/>

## 四、结合图像理解关键时刻

### 碰撞刚结束：$\tau=0$

A 仍以 $6\ \mathrm{m/s}$ 向右运动，BC 以 $2\ \mathrm{m/s}$ 向右运动。弹簧还在原长，弹性势能为零。

此时能转化为弹性势能的，是两物体相对运动所对应的能量：

$$
E_{\text{相对},0}
=\frac12\mu(v_A-v_{BC})^2,
\qquad
\mu=\frac{m_Am_{BC}}{m_A+m_{BC}}
=\frac{2\times6}{8}
=1.5\ \mathrm{kg}.
$$

因此

$$
E_{\text{相对},0}
=\frac12\times1.5\times(6-2)^2
=12\ \mathrm J.
$$

### 压缩过程中：$0<\tau<\pi/2$

速度图中，A 的速度下降，BC 的速度上升，两条曲线逐渐靠近。

能量图中，总动能从 $48\ \mathrm J$ 下降，弹性势能从零上升；两者之和始终为 $48\ \mathrm J$。

### 最大压缩：$\tau=\pi/2$

点击“答案状态”，可以同时看到：

- 速度曲线相交于 $3\ \mathrm{m/s}$。
- 压缩量与最大压缩量的比值为 $1$。
- 弹性势能达到 $12\ \mathrm J$。
- 总动能仍为 $36\ \mathrm J$。

共同速度只意味着**相对速度为零**。系统仍携带向右的总动量，因此不可能把所有动能都变成弹性势能。

此时弹簧力并不为零：A 仍受到向左的力，BC 仍受到向右的力。共同速度只是一个瞬时状态，随后弹簧开始恢复，弹性势能下降。之后的理想振动中，最大伸长时也会达到相同的最大弹性势能。

## 五、答案汇总

| 问题 | 答案 |
|---|---|
| （1）弹性势能最大时 A 的速度 | $\boxed{3\ \mathrm{m/s}}$，方向向右 |
| （2）弹性势能的最大值 | $\boxed{12\ \mathrm J}$ |
