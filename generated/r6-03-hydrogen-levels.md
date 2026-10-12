---
id: r6-03-hydrogen-levels
title: 氢原子跃迁与金属钙的光电效应
subject: physics
topic: 原子能级与光电效应
source: 2021 天津模拟（第 2、3 问改成问答）
question: |
  （2021·天津模拟）氢原子的能级为：E₁=−13.6 eV，E₂=−3.4 eV，E₃=−1.51 eV，E₄=−0.85 eV，E∞=0。大量处于 n=4 能级的氢原子向低能级跃迁时发出不同频率的光，用这些光照射金属钙，金属钙的逸出功为 3.20 eV。
  (1) 这些氢原子最多能发出多少种不同频率的光？各光子的能量分别是多少？
  (2) 其中能使金属钙发生光电效应的光有几种？
  (3) 从金属钙表面打出的光电子，最大初动能的最大值是多少？
answers:
  - { name: lineCount, value: 6, unit: 种 }
  - { name: photon43, value: 0.66, unit: eV }
  - { name: photon32, value: 1.89, unit: eV }
  - { name: photon42, value: 2.55, unit: eV }
  - { name: photon21, value: 10.20, unit: eV }
  - { name: photon31, value: 12.09, unit: eV }
  - { name: photon41, value: 12.75, unit: eV }
  - { name: photoCount, value: 3, unit: 种 }
  - { name: kineticMax, value: 9.55, unit: eV }
---

## 一、题目条件分析

氢原子从较高能级跃迁到较低能级时，发射一个光子，光子的能量等于两个能级的能量差：

$$
h\nu=E_{\text{高}}-E_{\text{低}}>0。
$$

题目说的是**大量处于 $n=4$ 能级的氢原子**。不同原子可以沿不同路径逐级跃迁，因此不仅有从 $n=4$ 出发的跃迁，还可能有 $3\to2$、$3\to1$ 和 $2\to1$。

$E_\infty=0$ 是电离界限。从 $n=4$ 向低能级跃迁不会到达电离态，因此不把它计入发光种数。

金属钙的逸出功为 $W=3.20\ \mathrm{eV}$。发生光电效应需要满足

$$
h\nu\ge W，
$$

发生光电效应时，光电子的最大初动能满足

$$
E_{k,\max}=h\nu-W。
$$

以下计算直接采用题目给出的能级数值。

## 二、完整解答

### （1）发光种数与各光子的能量

$n=1,2,3,4$ 中任取两个不同能级，都对应一种可能的向下跃迁。逐一计算后可知，各能量差互不相同，所以最多能发出的不同频率为

$$
N=\frac{4(4-1)}{2}=\boxed{6\text{ 种}}。
$$

六种跃迁的光子能量分别为：

| 跃迁 | 能量差计算 | 光子能量 |
|---|---|---|
| $4\to3$ | $-0.85-(-1.51)$ | $\boxed{0.66\ \mathrm{eV}}$ |
| $3\to2$ | $-1.51-(-3.40)$ | $\boxed{1.89\ \mathrm{eV}}$ |
| $4\to2$ | $-0.85-(-3.40)$ | $\boxed{2.55\ \mathrm{eV}}$ |
| $2\to1$ | $-3.40-(-13.60)$ | $\boxed{10.20\ \mathrm{eV}}$ |
| $3\to1$ | $-1.51-(-13.60)$ | $\boxed{12.09\ \mathrm{eV}}$ |
| $4\to1$ | $-0.85-(-13.60)$ | $\boxed{12.75\ \mathrm{eV}}$ |

光子能量与频率成正比，因此六个不同的能量对应六种不同的频率。

### （2）能使金属钙发生光电效应的光

把每种光子的能量与 $3.20\ \mathrm{eV}$ 比较：

$$
0.66,\ 1.89,\ 2.55<3.20，
$$

这三种光不能使金属钙发生光电效应。

$$
10.20,\ 12.09,\ 12.75>3.20，
$$

这三种光能使金属钙发生光电效应，分别来自 $2\to1$、$3\to1$ 和 $4\to1$。

所以符合条件的光共有

$$
\boxed{3\text{ 种}}。
$$

### （3）最大初动能的最大值

对于同一种金属，逸出功固定。入射光子的能量越大，光电子的最大初动能越大。

三种能引发光电效应的光分别给出：

$$
\begin{aligned}
2\to1：\quad&E_{k,\max}=10.20-3.20=\boxed{7.00\ \mathrm{eV}}，\\
3\to1：\quad&E_{k,\max}=12.09-3.20=\boxed{8.89\ \mathrm{eV}}，\\
4\to1：\quad&E_{k,\max}=12.75-3.20=\boxed{9.55\ \mathrm{eV}}。
\end{aligned}
$$

其中最大值为

$$
\boxed{E_{k,\max}^{\text{最大}}=9.55\ \mathrm{eV}}，
$$

对应 $4\to1$ 跃迁发出的光。

> 一次光电效应中，一个电子吸收一个光子的能量。不能把不同跃迁产生的几个光子的能量相加，再与逸出功比较。

## 三、交互演示

选择一种跃迁，观察其发出的光能否从金属钙表面打出电子。题目没有给出跃迁时刻和电子飞行条件，因此采用状态切换示意图；箭头表示跃迁、光的传播和电子射出方向，不表示运动速度。

**能级间距、物体尺寸和箭头长度均不按比例绘制。**

<Define name="E1" expr="-13.6" />

<Define name="E2" expr="-3.4" />

<Define name="E3" expr="-1.51" />

<Define name="E4" expr="-0.85" />

<Define name="Einf" expr="0" />

<Define name="work" expr="3.20" />

<Define name="levelCount" expr="4" />

<Define name="lineCount" expr="levelCount * (levelCount - 1) / 2" />

<Define name="photon43" expr="E4 - E3" />

<Define name="photon32" expr="E3 - E2" />

<Define name="photon42" expr="E4 - E2" />

<Define name="photon21" expr="E2 - E1" />

<Define name="photon31" expr="E3 - E1" />

<Define name="photon41" expr="E4 - E1" />

<Define name="photoCount" expr="(photon43 >= work ? 1 : 0) + (photon32 >= work ? 1 : 0) + (photon42 >= work ? 1 : 0) + (photon21 >= work ? 1 : 0) + (photon31 >= work ? 1 : 0) + (photon41 >= work ? 1 : 0)" />

<Define name="kinetic21" expr="photon21 - work" />

<Define name="kinetic31" expr="photon31 - work" />

<Define name="kinetic41" expr="photon41 - work" />

<Define name="photonMax" expr="max(photon43, photon32, photon42, photon21, photon31, photon41)" />

<Define name="kineticMax" expr="photonMax - work" />

<Param name="transition" label="选择氢原子跃迁" options={[
  {value: 1, label: "4 → 3：0.66 eV"},
  {value: 2, label: "3 → 2：1.89 eV"},
  {value: 3, label: "4 → 2：2.55 eV"},
  {value: 4, label: "2 → 1：10.20 eV"},
  {value: 5, label: "3 → 1：12.09 eV"},
  {value: 6, label: "4 → 1：12.75 eV"}
]} value={6} />

<Define name="upper" expr="transition == 1 or transition == 3 or transition == 6 ? 4 : (transition == 2 or transition == 5 ? 3 : 2)" />

<Define name="lower" expr="transition == 1 ? 3 : (transition == 2 or transition == 3 ? 2 : 1)" />

<Define name="energyUpper" expr="upper == 4 ? E4 : (upper == 3 ? E3 : E2)" />

<Define name="energyLower" expr="lower == 3 ? E3 : (lower == 2 ? E2 : E1)" />

<Define name="photon" expr="energyUpper - energyLower" />

<Define name="energyBalance" expr="photon - work" />

<Preset label="4 → 3：0.66 eV，不能发射电子" set={{transition: 1}} />

<Preset label="3 → 2：1.89 eV，不能发射电子" set={{transition: 2}} />

<Preset label="4 → 2：2.55 eV，不能发射电子" set={{transition: 3}} />

<Preset label="2 → 1：10.20 eV，可以发射电子" set={{transition: 4}} />

<Preset label="3 → 1：12.09 eV，可以发射电子" set={{transition: 5}} />

<Preset label="答案状态：4 → 1，最大初动能 9.55 eV" set={{transition: 6}} />

<Status cases={[
  {when: "photon < work", label: "光子能量小于逸出功，不能发生光电效应", tone: "warning"},
  {when: "abs(photon - photonMax) < 1e-6", label: "光子能量最大，光电子的最大初动能也最大", tone: "success"},
  {label: "光子能量超过逸出功，可以发生光电效应", tone: "info"}
]} />

<Figure
  title="氢原子发光 → 光照射金属钙 → 判断是否发射电子"
  height={420}
  params={["E1", "E2", "E3", "E4", "Einf", "upper", "lower", "photon", "work", "energyBalance"]}
>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 17, ymin: 0, ymax: 10, pad: 18 })
    const levels = [
      { n: 1, y: 1.9, energy: p.E1 },
      { n: 2, y: 3.6, energy: p.E2 },
      { n: 3, y: 5.3, energy: p.E3 },
      { n: 4, y: 7.0, energy: p.E4 },
    ]
    const positions = { 1: 1.9, 2: 3.6, 3: 5.3, 4: 7.0 }
    const canEmit = p.photon >= p.work
    const xL = 1.6, xR = 5.4

    // ---- 氢原子能级 ----
    v.text(m, 3.5, 9.5, '氢原子能级', { color: v.color.ink, size: 14 })

    // n = ∞ 虚线（电离界限）
    v.line(m, xL, 8.7, xR, 8.7, { color: v.color.steel, width: 1, dash: [6, 4] })
    v.text(m, xL - 0.25, 8.7, 'n = ∞', { align: 'right', color: v.color.steel, size: 12 })
    v.text(m, xR + 0.25, 8.7, p.Einf.toFixed(2) + ' eV', { align: 'left', color: v.color.steel, size: 12 })

    for (const level of levels) {
      const selected = level.n === p.upper || level.n === p.lower
      const c = selected ? v.color.ink : v.color.steel
      v.line(m, xL, level.y, xR, level.y, { color: c, width: selected ? 2 : 1.2 })
      v.text(m, xL - 0.25, level.y, 'n = ' + level.n, { align: 'right', color: c, size: 12 })
      v.text(m, xR + 0.25, level.y, level.energy.toFixed(2) + ' eV', { align: 'left', color: c, size: 12 })
    }

    // 跃迁：两能级之间的向下箭头
    const yU = positions[p.upper]
    const yL = positions[p.lower]
    const yMid = (yU + yL) / 2
    v.arrow(m, 4.6, yU, 4.6, yL, { color: v.color.graphite, width: 2 })
    v.label(m, 4.6, yMid, p.upper + ' → ' + p.lower, { place: 'left', color: v.color.graphite })
    // 跃迁放出的光子飞向右侧的金属
    v.photon(m, 4.8, yMid, 6.4, yMid, { amp: 4, wavelength: 10 })
    v.text(m, 3.5, 0.5, '能级间距不按比例', { color: v.color.steel, size: 11 })

    // ---- 光照射金属钙 ----
    v.line(m, 6.6, 0.8, 6.6, 9.4, { color: v.color.hairline, width: 1 })
    v.text(m, 11.8, 9.5, '发出的光照射金属钙', { color: v.color.ink, size: 14 })

    // 入射光子（琥珀色波线，动画传播）
    const yBeam = 4.9
    v.photon(m, 7.3, yBeam, 11.05, yBeam, { label: 'hν = ' + p.photon.toFixed(2) + ' eV' })
    v.label(m, 9.1, yBeam - 0.9, '入射光子', { place: 'below', color: v.color.charge })

    // 金属钙板：钢色填充 + 墨线描边 + 内部拉丝纹
    v.rect(m, 11.2, 2.3, 1.3, 5.2, { fill: v.color.steel, outline: v.color.ink, radius: 2 })
    for (const xx of [11.45, 11.7, 11.95, 12.2]) {
      v.line(m, xx, 2.45, xx, 7.35, { color: v.color.graphite, width: 0.7 })
    }
    v.text(m, 11.85, 8.0, '金属钙', { color: v.color.ink })
    v.text(m, 11.85, 1.7, '逸出功 W = ' + p.work.toFixed(2) + ' eV', { color: v.color.graphite, size: 12 })

    if (canEmit) {
      // 光电子：带电小球 + 速度矢量 + 初动能
      const ex = 13.3
      v.ball(m, ex, yBeam, 0.17, { charge: true, label: 'e⁻' })
      v.vec(m, ex + 0.25, yBeam, 2.0, 0, { kind: 'velocity', label: 'v' })
      v.label(m, ex + 0.4, yBeam + 0.9, '光电子', { place: 'above', color: v.color.charge })
      v.text(m, 14.6, 3.6, 'E_k = ' + p.energyBalance.toFixed(2) + ' eV', { color: v.color.ink, size: 13 })
      v.text(m, 14.6, 2.9, '= hν − W', { color: v.color.graphite, size: 11 })
    } else {
      v.text(m, 14.3, 5.6, '无光电子射出', { color: v.color.graphite, size: 13 })
      v.text(m, 14.3, 4.4, 'hν − W = ' + p.energyBalance.toFixed(2) + ' eV < 0', { color: v.color.graphite, size: 12 })
    }
  },
})
</Figure>

<Readout items={[
  {label: "所选光子的能量", expr: "photon", unit: "eV", digits: 2},
  {label: "金属钙的逸出功", expr: "work", unit: "eV", digits: 2},
  {label: "能量余额 hν−W", expr: "energyBalance", unit: "eV", digits: 2},
  {label: "全部不同频率的光", expr: "lineCount", unit: "种", digits: 0},
  {label: "能引发光电效应的光", expr: "photoCount", unit: "种", digits: 0},
  {label: "最大初动能的最大值", expr: "kineticMax", unit: "eV", digits: 2}
]} />

能量余额为正时，它就是该频率光照下光电子的最大初动能；为负时，表示光子能量不足，**没有光电子射出，不存在负的初动能**。

## 四、结合图像理解关键状态

1. **先选 $4\to3$。** 虽然氢原子能够发光，但光子只有 $0.66\ \mathrm{eV}$，不足以克服金属钙的逸出功。能发光与能引发光电效应是两个不同的判断。
2. **再选 $4\to2$。** 光子能量为 $2.55\ \mathrm{eV}$，仍小于 $3.20\ \mathrm{eV}$，没有光电子射出。不能把能量不足理解成“射出速度更小的电子”。
3. **切换到 $2\to1$。** 光子能量增大到 $10.20\ \mathrm{eV}$，可以发生光电效应，光电子的最大初动能为 $7.00\ \mathrm{eV}$。
4. **最后选择答案状态 $4\to1$。** 这条跃迁跨越的能量差最大，光子能量为 $12.75\ \mathrm{eV}$，对应最大初动能的最大值 $9.55\ \mathrm{eV}$。

图中的能级高度经过调整，判断能量差应看能级标注与实时数值，不能用屏幕上的线段间距测量。

单个原子的一次逐级下降路径最多经历三次跃迁；题目的六种频率来自**大量原子可能经历的不同路径的总集合**。

## 五、答案汇总

| 问题 | 答案 |
|---|---|
| （1）最多发出多少种不同频率的光 | $\boxed{6\text{ 种}}$ |
| （1）各光子的能量 | $\boxed{0.66,\ 1.89,\ 2.55,\ 10.20,\ 12.09,\ 12.75\ \mathrm{eV}}$ |
| （2）能使金属钙发生光电效应的光 | $\boxed{3\text{ 种}}$，对应 $2\to1$、$3\to1$、$4\to1$ |
| （3）最大初动能的最大值 | $\boxed{9.55\ \mathrm{eV}}$，对应 $4\to1$ |
