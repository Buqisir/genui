---
id: r6-03-hydrogen-levels
title: 氢原子能级跃迁与光电效应
subject: physics
topic: 原子能级与光电效应
source: 2021 天津模拟（第 2、3 问改成问答）
question: |
  （2021·天津模拟）氢原子的能级为：E₁=−13.6 eV，E₂=−3.4 eV，E₃=−1.51 eV，E₄=−0.85 eV，E∞=0。大量处于 n=4 能级的氢原子向低能级跃迁时发出不同频率的光，用这些光照射金属钙，金属钙的逸出功为 3.20 eV。
  (1) 这些氢原子最多能发出多少种不同频率的光？各光子的能量分别是多少？
  (2) 其中能使金属钙发生光电效应的光有几种？
  (3) 从金属钙表面打出的光电子，最大初动能的最大值是多少？
answers:
  - { name: frequencyCount, value: 6, unit: 种 }
  - { name: photon43, value: 0.66, unit: eV }
  - { name: photon32, value: 1.89, unit: eV }
  - { name: photon42, value: 2.55, unit: eV }
  - { name: photon21, value: 10.20, unit: eV }
  - { name: photon31, value: 12.09, unit: eV }
  - { name: photon41, value: 12.75, unit: eV }
  - { name: photoCount, value: 3, unit: 种 }
  - { name: kinetic21, value: 7.00, unit: eV }
  - { name: kinetic31, value: 8.89, unit: eV }
  - { name: kineticMax, value: 9.55, unit: eV }
---

## 一、题目条件分析

氢原子从高能级跃迁到低能级时，发射一个光子。光子的能量等于原子减少的能量：

$$
\varepsilon=h\nu=E_{\text{高}}-E_{\text{低}}>0.
$$

题目说的是**大量**处于 $n=4$ 能级的氢原子。不同原子可以直接跃迁，也可以经过中间能级逐级跃迁，因此要统计 $n=1,2,3,4$ 之间全部可能的向下跃迁。

$E_\infty=0$ 表示电离边界，不是本题向低能级跃迁的终点。

金属钙的逸出功为 $W=3.20\ \text{eV}$。在本题的光电效应模型中，只有满足 $\varepsilon\ge W$ 的光子才能使电子逸出；发生光电效应时，

$$
E_{k,\max}=\varepsilon-W.
$$

以下计算直接采用题目给出的能级数值。

## 二、完整解答

### （1）不同频率的光及其光子能量

四个能级之间，每选择一对不同能级，就对应一种向下跃迁，共有

$$
N=\frac{4(4-1)}{2}=\boxed{6\ \text{种}}.
$$

逐一计算能级差：

| 跃迁 | 光子能量计算 | 结果 |
|---|---|---|
| $4\to3$ | $-0.85-(-1.51)$ | $\boxed{0.66\ \text{eV}}$ |
| $3\to2$ | $-1.51-(-3.40)$ | $\boxed{1.89\ \text{eV}}$ |
| $4\to2$ | $-0.85-(-3.40)$ | $\boxed{2.55\ \text{eV}}$ |
| $2\to1$ | $-3.40-(-13.60)$ | $\boxed{10.20\ \text{eV}}$ |
| $3\to1$ | $-1.51-(-13.60)$ | $\boxed{12.09\ \text{eV}}$ |
| $4\to1$ | $-0.85-(-13.60)$ | $\boxed{12.75\ \text{eV}}$ |

这六个能量互不相同。由 $\nu=\varepsilon/h$，可知它们对应六种不同频率。

> 一个氢原子沿 $4\to3\to2\to1$ 跃迁时最多发射三个光子；大量原子通过不同路径跃迁，才能产生上述六种光。不要把“单个原子发射的光子数”当成“不同频率的种数”。

### （2）能使金属钙发生光电效应的光

将六个光子能量分别与逸出功比较：

$$
0.66,\ 1.89,\ 2.55<3.20\ \text{eV},
$$

这三种光不能使金属钙发生光电效应。

$$
10.20,\ 12.09,\ 12.75>3.20\ \text{eV},
$$

这三种光可以使金属钙发生光电效应，对应 $2\to1$、$3\to1$、$4\to1$ 跃迁。因此

$$
\boxed{N_{\text{光电}}=3\ \text{种}}.
$$

### （3）最大初动能的最大值

对能发生光电效应的三种光，分别应用爱因斯坦光电效应方程：

| 入射光对应的跃迁 | 光电子最大初动能 |
|---|---|
| $2\to1$ | $10.20-3.20=\boxed{7.00\ \text{eV}}$ |
| $3\to1$ | $12.09-3.20=\boxed{8.89\ \text{eV}}$ |
| $4\to1$ | $12.75-3.20=\boxed{9.55\ \text{eV}}$ |

最大光子能量来自 $4\to1$ 跃迁，所以所有光电子中，最大初动能的最大值为

$$
E_{k,\text{最大}}=(E_4-E_1)-W
=12.75-3.20
=\boxed{9.55\ \text{eV}}.
$$

这里的“最大初动能”是逸出电子初动能的上限，并不表示所有逸出电子都具有这个初动能。

## 三、交互演示

选择一种实际发射的光，观察其能量能否支付逸出功，以及剩余能量是多少。选项和快捷按钮只包含本题的六种光。

<Define name="E1" expr="-13.6" />

<Define name="E2" expr="-3.4" />

<Define name="E3" expr="-1.51" />

<Define name="E4" expr="-0.85" />

<Define name="EInfinity" expr="0" />

<Define name="W" expr="3.20" />

<Define name="levelCount" expr="4" />

<Define name="frequencyCount" expr="levelCount * (levelCount - 1) / 2" />

<Define name="photon43" expr="E4 - E3" />

<Define name="photon32" expr="E3 - E2" />

<Define name="photon42" expr="E4 - E2" />

<Define name="photon21" expr="E2 - E1" />

<Define name="photon31" expr="E3 - E1" />

<Define name="photon41" expr="E4 - E1" />

<Define name="photoCount" expr="(photon43 >= W ? 1 : 0) + (photon32 >= W ? 1 : 0) + (photon42 >= W ? 1 : 0) + (photon21 >= W ? 1 : 0) + (photon31 >= W ? 1 : 0) + (photon41 >= W ? 1 : 0)" />

<Define name="kinetic21" expr="photon21 - W" />

<Define name="kinetic31" expr="photon31 - W" />

<Define name="kineticMax" expr="max(photon43, photon32, photon42, photon21, photon31, photon41) - W" />

<Param
  name="photonEnergy"
  label="选择入射光：跃迁与光子能量"
  options={[
    {value: 0.66, label: "4→3：0.66 eV"},
    {value: 1.89, label: "3→2：1.89 eV"},
    {value: 2.55, label: "4→2：2.55 eV"},
    {value: 10.20, label: "2→1：10.20 eV"},
    {value: 12.09, label: "3→1：12.09 eV"},
    {value: 12.75, label: "4→1：12.75 eV"}
  ]}
  value={12.75}
  unit="eV"
/>

<Param name="levelPosition" label="能级线横向位置" value={0} min={0} max={1} step={0.01} hidden={true} />

<Param name="energyProbe" label="图像横坐标" value={0} min={0} max={13.5} step={0.01} unit="eV" hidden={true} />

<Define name="energyBalance" expr="photonEnergy - W" />

<Preset label="4→3：不能逸出" set={{photonEnergy: "photon43"}} />

<Preset label="3→2：不能逸出" set={{photonEnergy: "photon32"}} />

<Preset label="4→2：不能逸出" set={{photonEnergy: "photon42"}} />

<Preset label="2→1：最大初动能 7.00 eV" set={{photonEnergy: "photon21"}} />

<Preset label="3→1：最大初动能 8.89 eV" set={{photonEnergy: "photon31"}} />

<Preset label="4→1：最大初动能最大，为 9.55 eV" set={{photonEnergy: "photon41"}} />

<Status cases={[
  {when: "abs(energyBalance) < 1e-6", label: "达到逸出阈值，最大初动能为零", tone: "info"},
  {when: "energyBalance < 0", label: "光子能量不足，不能发生光电效应", tone: "warning"},
  {when: "abs(photonEnergy - photon41) < 1e-6", label: "4→1：产生本题最大初动能的最大值", tone: "success"},
  {label: "能发生光电效应，余能就是最大初动能", tone: "success"}
]} />

<Readout items={[
  {label: "选中光子的能量", expr: "photonEnergy", unit: "eV", digits: 2},
  {label: "金属钙的逸出功", expr: "W", unit: "eV", digits: 2},
  {label: "光子能量减逸出功", expr: "energyBalance", unit: "eV", digits: 2},
  {label: "不同频率总数", expr: "frequencyCount", unit: "种", digits: 0},
  {label: "能发生光电效应的种数", expr: "photoCount", unit: "种", digits: 0},
  {label: "最大初动能的最大值", expr: "kineticMax", unit: "eV", digits: 2}
]} />

“光子能量减逸出功”为负时，表示能量不足，**不表示存在负的光电子初动能**；为非负时，才可将它解释为光电子最大初动能。

<Plot
  title="氢原子能级：光子能量等于两条能级线的高度差"
  x={{name: "levelPosition", label: "横向位置（仅用于排布）", min: 0, max: 1}}
  y={{label: "原子能量 E", unit: "eV", min: -14.5, max: 0.6}}
  series={[
    {label: "n=1：−13.60 eV", expr: "E1", color: "blue"},
    {label: "n=2：−3.40 eV", expr: "E2", color: "orange"},
    {label: "n=3：−1.51 eV", expr: "E3", color: "green"},
    {label: "n=4：−0.85 eV", expr: "E4", color: "purple"},
    {label: "电离边界：0 eV", expr: "EInfinity", color: "gray"}
  ]}
/>

能级图的纵轴按能量比例绘制。横轴仅用于排布，不代表时间或电子的位置。

<Plot
  title="能量判据：选中光子在零线之上，才有正的最大初动能"
  x={{name: "energyProbe", label: "光子能量 ε", unit: "eV", min: 0, max: 13.5}}
  y={{label: "ε−W", unit: "eV", min: -3.5, max: 10.5}}
  series={[
    {label: "光子能量减逸出功", expr: "energyProbe - W", color: "blue"},
    {label: "逸出阈值零线", expr: "0", color: "gray"}
  ]}
  marks={[
    {x: "photon43", series: 0, label: "4→3"},
    {x: "photon32", series: 0, label: "3→2"},
    {x: "photon42", series: 0, label: "4→2"},
    {x: "W", series: 0, label: "逸出阈值：3.20 eV"},
    {x: "photon21", series: 0, label: "2→1"},
    {x: "photon31", series: 0, label: "3→1"},
    {x: "photon41", series: 0, label: "4→1"}
  ]}
  cursor="photonEnergy"
/>

直线用于展示能量判据；本题实际发射的光只有标出的六种，光子能量并非连续分布。

## 四、结合图像理解关键状态

本题比较的是离散跃迁和能量条件，没有给出跃迁发生的时间，因此通过选项切换状态观察。

1. **选择 $4\to3$、$3\to2$ 或 $4\to2$。** 游标处的点在零线下方：一个光子的能量不足以支付 $3.20\ \text{eV}$ 的逸出功，不能发生光电效应。
2. **选择 $2\to1$ 或 $3\to1$。** 点位于零线上方，其纵坐标分别为 $7.00\ \text{eV}$ 和 $8.89\ \text{eV}$，就是对应光电子的最大初动能。
3. **选择 $4\to1$。** 能级图中，这对能级的高度差最大；能量判据图中，这个点最高，对应最大初动能的最大值 $9.55\ \text{eV}$。

六种光中，只有终点为 $n=1$ 的三种光能使金属钙发生光电效应，这是本题给定能级和逸出功共同决定的。

## 五、答案汇总

| 问题 | 答案 |
|---|---|
| （1）最多发出多少种不同频率的光 | $\boxed{6\ \text{种}}$ |
| （1）各光子的能量 | $\boxed{0.66,\ 1.89,\ 2.55,\ 10.20,\ 12.09,\ 12.75\ \text{eV}}$ |
| （2）能使金属钙发生光电效应的光 | $\boxed{3\ \text{种}}$，对应 $2\to1$、$3\to1$、$4\to1$ |
| （3）最大初动能的最大值 | $\boxed{9.55\ \text{eV}}$，由 $4\to1$ 的光产生 |
