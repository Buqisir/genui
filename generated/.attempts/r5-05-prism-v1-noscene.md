---
id: r5-05-prism
title: 棱镜中的折射与全反射
subject: physics
topic: 光的折射与全反射
source: 2019 全国卷Ⅲ
question: |
  直角三角形 ABC 为一棱镜的横截面，∠A=90°，∠B=30°。一束光线平行于底边 BC 射到 AB 边上并进入棱镜，然后垂直于 AC 边射出。
  (1) 求棱镜的折射率；
  (2) 保持 AB 边上的入射点不变，逐渐减小入射角，直到 BC 边上恰好有光线射出。求此时 AB 边上入射角的正弦。
answers:
  - { name: n, value: 1.7320508075688772, unit: "" }
  - { name: i0, value: 60, unit: "°" }
  - { name: r0, value: 30, unit: "°" }
  - { name: I0, value: 60, unit: "°" }
  - { name: C, value: 35.264389682754654, unit: "°" }
  - { name: rCrit, value: 5.264389682754654, unit: "°" }
  - { name: sinICrit, value: 0.1589186225978911, unit: "" }
---

## 一、题目条件分析

棱镜横截面满足 $AB\perp AC$，且 $AB$ 与 $BC$ 的夹角为 $30^\circ$。

所有入射角、折射角都从**界面法线**量起。记：

- $i$：光线在 $AB$ 边上的入射角；
- $r$：光线进入棱镜后在 $AB$ 边上的折射角；
- $I$：光线到达 $BC$ 边时的入射角；
- $C$：棱镜向空气射出时的临界角。

题设光线平行于 $BC$，因此初始入射角为

$$
i_0=90^\circ-30^\circ=\boxed{60^\circ}.
$$

光线垂直于 $AC$ 射出，说明它到达 $AC$ 前也沿着 $AC$ 的法线传播，即平行于 $AB$。这段光路由光线在 $BC$ 边反射后形成：**先在 $AB$ 折射，再在 $BC$ 全反射，最后从 $AC$ 垂直射出。**

## 二、完整解答

### （1）棱镜的折射率

反射后的光线平行于 $AB$，所以它与 $BC$ 的夹角为 $30^\circ$。由反射定律，反射前的光线与 $BC$ 的夹角也为 $30^\circ$。

因此，光线在 $BC$ 边上的初始入射角为

$$
I_0=90^\circ-30^\circ=\boxed{60^\circ}.
$$

在本题光路中，$AB$ 与 $BC$ 的法线夹角为 $30^\circ$，故

$$
I=30^\circ+r.
$$

于是初始折射角为

$$
r_0=I_0-30^\circ=\boxed{30^\circ}.
$$

在 $AB$ 边应用折射定律，空气折射率取 $1$：

$$
\sin i_0=n\sin r_0.
$$

解得

$$
n=\frac{\sin60^\circ}{\sin30^\circ}
=\boxed{\sqrt3}.
$$

检验 $BC$ 边是否发生全反射：

$$
\sin C=\frac1n=\frac1{\sqrt3},
\qquad
C=\arcsin\frac1{\sqrt3}
=\boxed{35.2644^\circ}.
$$

由于 $I_0=60^\circ>C$，$BC$ 边确实发生全反射，与题设光路一致。

### （2）临界状态下入射角的正弦

保持 $AB$ 边上的入射点不变，逐渐减小 $i$。由

$$
\sin i=n\sin r
$$

可知 $r$ 也逐渐减小；于是 $BC$ 边上的入射角 $I=30^\circ+r$ 随之减小。

$BC$ 边上恰好有光线射出的临界条件是

$$
\boxed{I=C}.
$$

此时 $BC$ 边的折射角为 $90^\circ$，折射光沿界面传播。这是开始射出的临界极限；继续减小 $i$，折射光便进入空气。

临界状态下，$AB$ 边的折射角为

$$
r_* = C-30^\circ
=\boxed{5.2644^\circ}.
$$

由折射定律，

$$
\sin i_*=n\sin r_*
=\sqrt3\sin(C-30^\circ).
$$

又因为

$$
\sin C=\frac1{\sqrt3},
\qquad
\cos C=\sqrt{1-\frac13}=\sqrt{\frac23},
$$

所以

$$
\begin{aligned}
\sin i_*
&=\sqrt3\left(\sin C\cos30^\circ-\cos C\sin30^\circ\right)\\
&=\sqrt3\left(
\frac1{\sqrt3}\cdot\frac{\sqrt3}{2}
-\sqrt{\frac23}\cdot\frac12
\right)\\
&=\boxed{\frac{\sqrt3-\sqrt2}{2}}
\approx\boxed{0.158919}.
\end{aligned}
$$

> **易错点**：临界条件发生在 $BC$ 边，应令 $I=C$，不能直接令 $AB$ 边的入射角 $i=C$。

## 三、交互演示

拖动入射角滑块，从题设的 $60^\circ$ 开始减小，观察 $BC$ 边的入射角何时降到临界角。角度均由题设几何和折射定律计算，无需假设棱镜尺寸。

<Param name="i" label="AB 边入射角 i" value={60} min={0} max={60} step={0.1} unit="°" />

<Define name="B" expr="30" />

<Define name="i0" expr="90 - B" />

<Define name="r0" expr="B" />

<Define name="I0" expr="B + r0" />

<Define name="n" expr="sin(deg(i0)) / sin(deg(r0))" />

<Define name="C" expr="asin(1 / n) * 180 / pi" />

<Define name="rCrit" expr="C - B" />

<Define name="sinICrit" expr="n * sin(deg(rCrit))" />

<Define name="iCrit" expr="asin(sinICrit) * 180 / pi" />

<Define name="r" expr="asin(sin(deg(i)) / n) * 180 / pi" />

<Define name="I" expr="B + r" />

<Preset label="题设光路：i = 60°" set={{i: "i0"}} />

<Preset label="答案状态：BC 恰好开始射出" set={{i: "iCrit"}} />

<Preset label="继续减小：i = 0°" set={{i: 0}} />

<Status cases={[
  {when: "abs(I - C) < 1e-6", label: "临界状态：BC 边折射角为 90°，光沿界面传播", tone: "success"},
  {when: "I > C", label: "BC 边发生全反射", tone: "warning"},
  {label: "BC 边有折射光进入空气，同时存在反射光", tone: "info"}
]} />

<Readout items={[
  {label: "棱镜折射率 n", expr: "n", digits: 6},
  {label: "AB 边入射角 i", expr: "i", unit: "°", digits: 4},
  {label: "AB 边折射角 r", expr: "r", unit: "°", digits: 4},
  {label: "BC 边入射角 I", expr: "I", unit: "°", digits: 4},
  {label: "临界角 C", expr: "C", unit: "°", digits: 4},
  {label: "当前 sin i", expr: "sin(deg(i))", digits: 6},
  {label: "答案 sin i*", expr: "sinICrit", digits: 6}
]} />

<Plot
  title="减小 AB 入射角：BC 入射角何时降到临界角？"
  x={{name: "i", label: "AB 边入射角 i", unit: "°", min: 0, max: 60}}
  y={{label: "角度", unit: "°", min: 0, max: 65}}
  series={[
    {label: "AB 折射角 r", expr: "asin(sin(deg(i)) / n) * 180 / pi", color: "blue"},
    {label: "BC 入射角 I = 30° + r", expr: "B + asin(sin(deg(i)) / n) * 180 / pi", color: "orange"},
    {label: "临界角 C", expr: "C", color: "red"}
  ]}
  marks={[
    {x: "iCrit", series: 1, label: "I = C：恰好开始射出"},
    {x: 60, series: 1, label: "题设状态：I = 60°"}
  ]}
  cursor="i"
/>

## 四、结合图像理解关键时刻

图像的横轴是 $AB$ 边入射角。按题意减小入射角时，游标应从右向左移动。

| 状态 | 图像特征 | 物理意义 |
|---|---|---|
| 题设状态 $i=60^\circ$ | 橙线在红线上方，$I=60^\circ$ | $BC$ 全反射，反射光垂直于 $AC$ 射出 |
| 答案状态 $i=i_*$ | 橙线与红线相交，$I=C$ | $BC$ 边折射角达到 $90^\circ$，处于射出的临界极限 |
| 继续减小 $i$ | 橙线在红线下方，$I<C$ | $BC$ 边有折射光进入空气 |

蓝线与橙线始终相差 $30^\circ$，对应几何约束 $I=r+30^\circ$；红线保持不变，因为棱镜折射率没有改变。

## 五、答案汇总

| 小问 | 答案 |
|---|---|
| （1）棱镜折射率 | $\boxed{n=\sqrt3}$ |
| （2）$AB$ 边入射角的正弦 | $\boxed{\sin i_*=\dfrac{\sqrt3-\sqrt2}{2}\approx0.158919}$ |
