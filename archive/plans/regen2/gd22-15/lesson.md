---
id: gd22-15
title: 空调把热量送出去
source: 2022 广东卷 第 15 题（选考·选修 3-3，填空；选考共 12 分，原卷未单列本题分值）
question: 利用空调将热量从温度较低的室内传递到温度较高的室外环境，这个过程____（选填“是”或“不是”）自发过程。该过程空调消耗了电能，空调排放到室外环境的热量____（选填“大于”“等于”或“小于”）从室内吸收的热量。
answers:
  - { name: Qout, value: 1500, unit: J }
---

热量从温度较低的室内传到温度较高的室外，方向与自发传热相反。空调必须消耗电能才能维持这个过程，因此它不是自发过程。

题目没有给出数值。下面取一组代表性数值：从室内吸收的热量 $Q_1 = 1000\ \mathrm{J}$，消耗的电能 $W = 500\ \mathrm{J}$。滑块可以改这两个量，它们不是题目给定的条件。

## 完整解答

自发过程是不需要外界帮助、系统自己就能发生的过程。热量自发从高温物体传向低温物体，不会自发从低温物体传向高温物体。空调把热量从较低的室内送到较高的室外，并且要消耗电能，所以这个过程

$$
\boxed{\text{不是自发过程}}
$$

把空调当作研究对象，一个循环结束后它回到原来的状态，内能不变。能量守恒要求：从室内吸收的热量 $Q_1$ 加上消耗的电能 $W$，等于排放到室外的热量 $Q_2$，

$$
Q_2 = Q_1 + W
$$

电能 $W > 0$，因此

$$
Q_2 > Q_1
$$

代表性数值下，$Q_2 = 1000\ \mathrm{J} + 500\ \mathrm{J} = \boxed{1500\ \mathrm{J}}$。所以空调排放到室外环境的热量

$$
\boxed{\text{大于从室内吸收的热量}}
$$

这一结论不依赖所取的具体数值：只要空调在消耗电能，排出的热量就比吸进的热量多出这一份电能。

## 交互演示

室内温度低于室外。拖动滑块改变吸收的热量和消耗的电能，看排到室外的热量如何跟着变。

<Param name="Q1" label="从室内吸收的热量" symbol="Q_1" value={1000} min={200} max={2000} step={50} unit="J" color="force" />

<Param name="W" label="消耗的电能" symbol="W" value={500} min={100} max={1500} step={50} unit="J" color="charge" />

<Define name="Qout" expr="Q1 + W" />

<Question text="这个过程是不是自发过程？" hint="热量从低温室内送到高温室外，而且要消耗电能" />

<Question text="排到室外的热量和从室内吸收的热量比，谁大？" hint="比较 Q2 和 Q1，差额就是消耗的电能 W" />

<Preset label="代表性数值" set={{Q1: 1000, W: 500}} />

<Status cases={[
  {when: "W > 0 and Qout > Q1", label: "不是自发过程；排出的热量大于吸收的热量", tone: "success"},
  {label: "还没有消耗电能", tone: "neutral"}
]} />

<Readout items={[
  {label: "排到室外的热量", symbol: "Q_2", expr: "Qout", unit: "J", color: "force", digits: 0},
  {label: "比吸收的多出", symbol: "Q_2 - Q_1", expr: "Qout - Q1", unit: "J", color: "charge", digits: 0}
]} />

<Answer items={[
  {label: "是否自发过程", text: "不是"},
  {label: "排出与吸收的热量", text: "大于"},
  {label: "代表性数值下排出的热量", symbol: "Q_2", expr: "Qout", value: 1500, unit: "J"}
]} />

<Figure title="空调把热量从低温室内送到高温室外" height={300} params={["Q1", "W", "Qout"]} note="空调机为示意简图，不按比例；箭头长度按热量大小画">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 12, ymin: 0, ymax: 6, equal: true })
    v.rect(m, 0.35, 0.7, 4.5, 4.5, { color: v.color.steel })
    v.rect(m, 7.15, 0.7, 4.5, 4.5, { color: v.color.steel })
    v.rect(m, 5.15, 1.7, 1.7, 2.5, { color: v.color.ink, width: 1.5 })
    v.line(m, 5.15, 2.95, 6.85, 2.95, { color: v.color.ink, width: 1.5 })
    v.circle(m, 6.0, 2.15, 0.32, { color: v.color.steel })
    v.line(m, 5.78, 2.15, 6.22, 2.15, { color: v.color.steel })
    v.line(m, 6.0, 1.93, 6.0, 2.37, { color: v.color.steel })
    const q1 = 0.7 + 1.5 * p.Q1 / 2000
    const w = 0.55 + 1.2 * p.W / 1500
    const q2 = 0.9 + 2.2 * p.Qout / 3500
    v.arrow(m, 4.7, 3.5, 4.7 - q1, 3.5, { color: v.color.force, width: 2.5 })
    v.arrow(m, 6.0, 1.55, 6.0, 1.55 - w, { color: v.color.charge, width: 2.5 })
    v.arrow(m, 7.3, 3.5, 7.3 + q2, 3.5, { color: v.color.force, width: 2.5 })
    v.label(m, 2.6, 5.55, "室内（低温）")
    v.label(m, 6.0, 4.55, "空调")
    v.label(m, 9.4, 5.55, "室外（高温）")
    v.label(m, 3.15, 4.05, "Q1")
    v.label(m, 6.55, 0.85, "W")
    v.label(m, 8.85, 4.05, "Q2")
  },
})
</Figure>

<Ledger title="一个循环的能量" unit="J" size="wide"
  parts={[
    {label: "从室内吸收", symbol: "Q_1", expr: "Q1", color: "force"},
    {label: "消耗的电能", symbol: "W", expr: "W", color: "charge"}
  ]}
  total={{label: "排到室外", symbol: "Q_2", expr: "Qout"}}
/>

左侧箭头是从室内吸走的热量 $Q_1$，下方箭头是输入的电能 $W$，右侧箭头是排到室外的热量 $Q_2$。三者满足 $Q_2 = Q_1 + W$，所以右侧箭头始终比左侧长。

## 结合图像理解

能量账本把一个循环拆成两份输入：从室内吸收的热量和消耗的电能。两份加起来就是排到室外的热量。电能这一份不会消失，它随着热量一起排到室外，所以 $Q_2$ 比 $Q_1$ 大出的部分正是 $W$。

若不消耗电能就想让热量从低温室内流向高温室外，会违背热力学第二定律。空调消耗电能，才能让这个不自发的过程发生。

## 答案汇总

这个过程不是自发过程。空调排放到室外环境的热量大于从室内吸收的热量。
