---
id: r6-01-mercury-tubes
title: 三管连通：注入水银与等温压缩
subject: physics
topic: 气体等温变化与液体静压
source: 2021 全国乙卷
question: |
  （2021·全国乙卷）一玻璃装置放在水平桌面上，竖直玻璃管 A、B、C 粗细均匀，A、B 两管的上端封闭，C 管上端开口，三管的下端在同一水平面内且相互连通（连通部分的体积不计）。A、B 两管的长度分别为 l₁=13.5 cm、l₂=32 cm。开始时三管内都没有水银，A、B 两管内是压强等于大气压的空气。将水银从 C 管缓慢注入，直至 B、C 两管内水银柱的高度差 h=5 cm。已知外界大气压 p₀=75 cmHg，整个过程温度不变。求：
  (1) A、B 两管内水银柱的高度各为多少；
  (2) A、B 两管内水银柱的高度差。
answers:
  - { name: hA, value: 1, unit: cm }
  - { name: hB, value: 2, unit: cm }
  - { name: heightGap, value: 1, unit: cm }
  - { name: hC, value: 7, unit: cm }
  - { name: pA, value: 81, unit: cmHg }
  - { name: pB, value: 80, unit: cmHg }
  - { name: airA, value: 12.5, unit: cm }
  - { name: airB, value: 30, unit: cm }
---

## 一、题目条件分析

设三管内水银柱高度分别为 $H_A、H_B、H_C$，均从三管下端所在的水平面量起。

- C 管开口，水银面上方的压强始终为 $p_0$。
- A、B 管封闭，注入水银后，两管内空气分别受到等温压缩，均满足 $pV=\text{常量}$。
- 各管粗细均匀，同一管内气体体积与气柱长度成正比；不需要假设三管横截面积相等。
- 水银缓慢注入，可按静力平衡处理。三管底部相通，同一水平面处压强相等。

将压强用 $\text{cmHg}$ 表示、高度用 $\text{cm}$ 表示，底部压强关系可写成

$$
p_A+H_A=p_B+H_B=p_0+H_C.
$$

A、B 管内空气受压后，压强不小于大气压，因此 C 管水银面最高。题给高度差应取

$$
H_C-H_B=h=5\ \text{cm}.
$$

## 二、完整解答

### （1）A、B 两管内水银柱的高度

**先由 B、C 管的液面差求 B 管空气压强。**

$$
p_B=p_0+(H_C-H_B)=75+5
=\boxed{80\ \text{cmHg}}.
$$

设 B 管横截面积为 $S_B$。由玻意耳定律，

$$
p_0S_Bl_2=p_BS_B(l_2-H_B).
$$

约去 $S_B$，得到 B 管剩余气柱长度

$$
l_2-H_B=\frac{p_0l_2}{p_B}
=\frac{75\times32}{80}
=\boxed{30\ \text{cm}}.
$$

所以

$$
H_B=32-30=\boxed{2\ \text{cm}},
$$

$$
H_C=H_B+h=2+5=\boxed{7\ \text{cm}}.
$$

**再求 A 管内水银柱高度。**

由底部压强相等，

$$
p_A=p_0+H_C-H_A.
$$

设 $H_A=x\ \text{cm}$，则 $p_A=(82-x)\ \text{cmHg}$，剩余气柱长度为 $(13.5-x)\ \text{cm}$。对 A 管空气应用玻意耳定律：

$$
75\times13.5=(82-x)(13.5-x).
$$

整理得

$$
x^2-95.5x+94.5=0,
$$

$$
(x-1)(x-94.5)=0.
$$

由于 $0\le x<13.5$，舍去 $x=94.5$，得到

$$
H_A=\boxed{1\ \text{cm}}.
$$

对应的 A 管气柱长度、空气压强分别为

$$
l_1-H_A=13.5-1=\boxed{12.5\ \text{cm}},
$$

$$
p_A=75+7-1=\boxed{81\ \text{cmHg}}.
$$

检查等温关系：

$$
81\times12.5=75\times13.5,
\qquad
80\times30=75\times32.
$$

### （2）A、B 两管内水银柱的高度差

$$
H_B-H_A=2-1=\boxed{1\ \text{cm}}.
$$

**B 管内水银面比 A 管高 $1\ \text{cm}$。**

> 连通器液面等高需要各液面上方压强相同。本题 A、B 管封闭，空气压强会变化，不能直接把三个水银面画成等高。

## 三、交互演示

用 B、C 管液面差 $h$ 表示注入进度：$h=0$ 对应开始状态，$h=5\ \text{cm}$ 对应题目终态。初始显示题目终态；点击“开始注入”后，向右拖动滑块观察缓慢注入过程。

所有高度和空气压强都由静压平衡、等温关系自动计算。

<Param name="h" label="B、C 管液面差 h（注入进度）" value={5} min={0} max={5} step={0.05} unit="cm" />

<Define name="l1" expr="13.5" />

<Define name="l2" expr="32" />

<Define name="p0" expr="75" />

<Define name="pB" expr="p0 + h" />

<Define name="airB" expr="p0*l2/pB" />

<Define name="hB" expr="l2*h/(p0+h)" />

<Define name="hC" expr="hB + h" />

<Define name="rootSum" expr="p0 + hC + l1" />

<Define name="hA" expr="2*l1*hC/(rootSum + sqrt(rootSum^2 - 4*l1*hC))" />

<Define name="airA" expr="l1 - hA" />

<Define name="pA" expr="p0 + hC - hA" />

<Define name="heightGap" expr="hB - hA" />

<Preset label="开始注入：三管水银高度均为零" set={{h: 0}} />

<Preset label="题目答案：B、C 液面差为 5 cm" set={{h: 5}} />

<Status cases={[
  {when: "abs(h) < 1e-6", label: "开始状态：两管空气压强均为大气压", tone: "neutral"},
  {when: "abs(h - 5) < 1e-6", label: "题目终态：A 管 1 cm，B 管 2 cm，C 管 7 cm", tone: "success"},
  {label: "缓慢注入：水银柱升高，两管空气等温压缩", tone: "info"}
]} />

<Readout items={[
  {label: "A 管水银柱高度", expr: "hA", unit: "cm", digits: 2},
  {label: "B 管水银柱高度", expr: "hB", unit: "cm", digits: 2},
  {label: "C 管水银柱高度", expr: "hC", unit: "cm", digits: 2},
  {label: "B 管比 A 管高", expr: "heightGap", unit: "cm", digits: 2},
  {label: "A 管空气压强", expr: "pA", unit: "cmHg", digits: 2},
  {label: "B 管空气压强", expr: "pB", unit: "cmHg", digits: 2},
  {label: "A 管剩余气柱长度", expr: "airA", unit: "cm", digits: 2},
  {label: "B 管剩余气柱长度", expr: "airB", unit: "cm", digits: 2}
]} />

<Plot
  title="缓慢注入过程中：三管水银柱高度"
  x={{name: "h", label: "B、C 管液面差 h", unit: "cm", min: 0, max: 5}}
  y={{label: "水银柱高度 H", unit: "cm", min: 0, max: 8}}
  series={[
    {label: "A 管", expr: "2*l1*(h + l2*h/(p0+h))/(p0+l1+h+l2*h/(p0+h)+sqrt((p0+l1+h+l2*h/(p0+h))^2-4*l1*(h+l2*h/(p0+h))))", color: "blue"},
    {label: "B 管", expr: "l2*h/(p0+h)", color: "orange"},
    {label: "C 管", expr: "h + l2*h/(p0+h)", color: "green"}
  ]}
  marks={[
    {x: 5, series: 0, label: "A：1 cm"},
    {x: 5, series: 1, label: "B：2 cm"},
    {x: 5, series: 2, label: "C：7 cm"}
  ]}
  cursor="h"
/>

图中横轴是液面差，**不是时间**。本题没有给注入速率，因此用滑块表示准静态注入进度。

A 管高度由下式的较小根自动计算：

$$
H_A^2-(p_0+H_C+l_1)H_A+l_1H_C=0.
$$

其中压强、高度分别以 $\text{cmHg}$、$\text{cm}$ 为单位代入。另一个根大于 A 管长度，不符合装置的物理条件。

## 四、结合图像理解关键状态

**开始状态：$h=0$。** 三条曲线都从原点出发，三管尚无水银，A、B 管空气压强均为 $75\ \text{cmHg}$。

**注入过程中：$0<h<5\ \text{cm}$。** C 管曲线最高，其液面上方只有大气压；A、B 管空气受到压缩，压强高于大气压，因而水银面低于 C 管。

**题目终态：$h=5\ \text{cm}$。** 三条曲线的高度分别为 $1、2、7\ \text{cm}$。同一横坐标处，B、C 两条曲线的纵向差为 $5\ \text{cm}$，A、B 两条曲线的纵向差为 $1\ \text{cm}$。

终态底部压强满足

$$
\underbrace{81+1}_{A\text{ 管}}
=
\underbrace{80+2}_{B\text{ 管}}
=
\underbrace{75+7}_{C\text{ 管}}
=82\ \text{cmHg}.
$$

因此，**A 管液面更低，却有更大的空气压强**；不同的液面高度正好补偿上方空气压强的差异。

## 五、答案汇总

| 所求量 | 答案 |
|---|---|
| A 管内水银柱高度 | $\boxed{1\ \text{cm}}$ |
| B 管内水银柱高度 | $\boxed{2\ \text{cm}}$ |
| A、B 两管内水银柱高度差 | $\boxed{1\ \text{cm}}$，B 管液面较高 |
