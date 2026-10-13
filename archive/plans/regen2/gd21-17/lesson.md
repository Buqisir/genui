---
id: gd21-17
title: 弹簧下端小球的简谐运动
source: 2021 广东卷 第 17 题（选考·选修 3-4，填空；选考共 12 分，原卷未单列本题分值）
question: 如图所示，一个轻质弹簧下端挂一小球，小球静止。现将小球向下拉动距离 A 后由静止释放，并开始计时，小球在竖直方向做简谐运动，周期为 T。经 T/8 时间，小球从最低点向上运动的距离 ______ A/2（选填“大于”、“小于”或“等于”）；在 T/4 时刻，小球的动能 ______（选填“最大”或“最小”）。
answers:
  - { name: s8, value: 0.2929, unit: A }
  - { name: cmp, value: -1 }
  - { name: EkQ, value: 1 }
---

小球原来挂在弹簧下端静止，这个位置就是简谐运动的平衡位置。把小球向下拉动距离 $A$ 后由静止释放，并从此刻计时：$t = 0$ 时小球在最低点，速度为零，振幅是 $A$，周期是 $T$。

取向上为正、平衡位置为原点，位移写成

$$
y = -A\cos\omega t, \qquad \omega = \frac{2\pi}{T}.
$$

题目只给出字母 $A$、$T$。下面取代表值 $A = 1$（以振幅为单位）、$T = 4\,\mathrm{s}$，方便在时间轴上看到 $T/8 = 0.5\,\mathrm{s}$、$T/4 = 1\,\mathrm{s}$。比较结论不依赖这两个取值：上升距离用 $A$ 量度，动能用最大动能量度。弹簧长度按画面放大，不按比例。

## 完整解答

**第一空：经 $T/8$ 从最低点上升的距离与 $A/2$ 比较。**

$t = T/8$ 时 $\omega t = \pi/4$，位移为

$$
y\!\left(\frac{T}{8}\right) = -A\cos\frac{\pi}{4} = -\frac{\sqrt{2}}{2}A.
$$

最低点的位移是 $-A$，所以从最低点向上走过的距离是

$$
s = y\!\left(\frac{T}{8}\right) - (-A) = A\left(1 - \frac{\sqrt{2}}{2}\right) \approx 0.293\,A.
$$

而 $A/2 = 0.5\,A$，故

$$
\boxed{s < \dfrac{A}{2}}
$$

应选填「小于」。若误把这一段当成另一侧从静止开始的加速度恒为 $A\omega^2$ 的劣加速，会算出 $s = \pi^2 A/32 \approx 0.308\,A$，仍小于 $A/2$；但实际上加速度随着离开最低点而减小，上升得比这个估算还要少。

也可以不算数值：从最低点到平衡位置用掉 $T/4$，前半段 $T/8$ 速度较小，后半段速度较大，前半段走过的距离必然小于后半段，也就是小于全程 $A$ 的一半。

**第二空：$T/4$ 时刻的动能。**

$t = T/4$ 时 $\omega t = \pi/2$，$y = 0$，小球正好经过平衡位置。速度

$$
v = A\omega\sin\omega t
$$

在这里取到最大值 $A\omega$，动能

$$
E_k = \tfrac12 m v^2 = \tfrac12 m A^2\omega^2 \sin^2\omega t
$$

也取到最大。弹簧势能在平衡位置最小，机械能全部转成动能。故

$$
\boxed{E_k\ \text{最大}}
$$

应选填「最大」。动能最小出现在两端：$t = 0$、$t = T/2$ 和 $t = T$，速度都是零。

## 交互演示

拖动时间，或点进度条上的 $T/8$、$T/4$。左图是天花板下的弹簧和小球：实线球是此刻的位置，虚线球是释放时的最低点，两者之间的双向箭头标出已经上升的距离。右图是题目给出的 $y$–$t$ 图像，游标跟随动画。

<Param name="t" label="时间" symbol="t" value={0} min={0} max={4} step={0.01} unit="s" />

<Param name="A" label="振幅" symbol="A" value={1} hidden />

<Param name="T" label="周期" symbol="T" value={4} hidden unit="s" />

<Param name="m" label="质量" value={1} hidden unit="kg" />

<Define name="omega" expr="2*pi/T" />

<Define name="y" expr="-A*cos(omega*t)" />

<Define name="v" expr="A*omega*sin(omega*t)" />

<Define name="sRise" expr="y - (-A)" />

<Define name="halfA" expr="A/2" />

<Define name="s8" expr="A*(1 - sqrt(2)/2)" />

<Define name="cmp" expr="s8 < halfA ? -1 : (s8 > halfA ? 1 : 0)" />

<Define name="Ek" expr="0.5*m*v^2" />

<Define name="EkMax" expr="0.5*m*A^2*omega^2" />

<Define name="Ep" expr="EkMax - Ek" />

<Define name="EkQ" expr="1" />

<Preset label="释放瞬间 t = 0" set={{t: 0}} />

<Preset label="T/8：上升距离与 A/2 比较" set={{t: "T/8"}} />

<Preset label="T/4：动能最大" set={{t: "T/4"}} />

<Preset label="T/2：最高点" set={{t: "T/2"}} />

<Status cases={[
  {when: "t < 1e-6", label: "刚释放：最低点，动能最小", tone: "info"},
  {when: "abs(t - T/8) < 0.02", label: "T/8：从最低点上升的距离小于 A/2", tone: "success"},
  {when: "abs(t - T/4) < 0.02", label: "T/4：经过平衡位置，动能最大", tone: "success"},
  {when: "abs(t - T/2) < 0.02", label: "T/2：最高点，动能再次最小", tone: "info"},
  {when: "abs(t - T) < 0.02", label: "一个周期：回到最低点", tone: "neutral"},
  {label: "在最低点与最高点之间振动", tone: "neutral"}
]} />

<Readout items={[
  {label: "位移", symbol: "y", expr: "y", unit: "A", digits: 3, color: "velocity"},
  {label: "从最低点上升", symbol: "s", expr: "sRise", unit: "A", digits: 3, color: "velocity"},
  {label: "A/2", symbol: "A/2", expr: "halfA", unit: "A", digits: 3},
  {label: "动能", symbol: "E_k", expr: "Ek", unit: "J", digits: 2, color: "velocity"}
]} />

<Answer items={[
  {label: "T/8 上升距离", symbol: "s", expr: "s8", value: 0.2929, unit: "A", digits: 3},
  {label: "与 A/2 比较", text: "小于"},
  {label: "T/4 的动能", text: "最大"}
]} />

<Sim title="弹簧下端的小球" height={420} duration={4} time="t" params={["A", "y", "v", "sRise"]} marks={[
  {t: 0, label: "从最低点释放"},
  {t: 0.5, label: "经过 T/8"},
  {t: 1, label: "经过平衡位置"},
  {t: 2, label: "到达最高点"},
  {t: 4, label: "回到最低点"}
]} hud={[
  {symbol: "s", label: "从最低点上升", expr: "sRise", unit: "A", digits: 3},
  {symbol: "y", label: "位移", expr: "y", unit: "A", digits: 3}
]} note="向上为正，平衡位置为原点。弹簧长度不按比例；虚线球是释放时的最低点。" legend={[
  {kind: "velocity", label: "速度 v"}
]}>
sim({
  at(t, p) {
    return { y: p.y }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -1.7, xmax: 1.7, ymin: -1.85, ymax: 2.15 })
    const ceil = 1.55
    const eq = 0
    const yb = s.y
    const low = -v.p.A
    const r = 0.16
    v.ground(m, -1.15, 1.15, ceil, { side: 'above', thick: 12 })
    v.spring(m, 0, ceil, 0, yb + r, { coils: 12 })
    v.ball(m, 0, low, r, { ghost: true })
    v.ball(m, 0, yb, r)
    if (yb - low > 0.08) {
      v.dim(m, 0.55, low, 0.55, yb, 's', { offset: 16 })
    }
    v.line(m, -0.85, eq, 0.85, eq, { color: v.color.steel, dash: true, width: 1 })
    v.label(m, 1.05, eq, 'O', { place: 'right' })
    if (Math.abs(v.p.v) > 0.15) {
      const dir = v.p.v > 0 ? 1 : -1
      v.vec(m, 0.55, yb, 0, dir * 0.55, { kind: 'velocity', label: 'v' })
    } else {
      v.label(m, 0.7, yb, 'v = 0', { place: 'right' })
    }
  },
})
</Sim>

<Plot title="位移随时间变化" size="wide" x={{name: "tt", label: "t", unit: "s", min: 0, max: 4.6}} y={{label: "y", unit: "A", min: -1.35, max: 1.35}} series={[
  {label: "y", expr: "-A*cos(2*pi/T*tt)", color: "velocity"},
  {label: "A", expr: "A", color: "steel", dash: true},
  {label: "−A", expr: "-A", color: "steel", dash: true}
]} marks={[
  {x: 0, series: 0, label: "释放"},
  {x: "T/8", series: 0, label: "T/8"},
  {x: "T/4", series: 0, label: "T/4"},
  {x: "T/2", series: 0, label: "T/2"},
  {x: "T", series: 0, label: "T"}
]} cursor="t" caption="从 y = −A 出发，T/2 到达 y = A，T 回到 y = −A。" />

<Ledger title="机械能" size="narrow" unit="J" parts={[
  {label: "动能", symbol: "E_k", expr: "Ek", color: "velocity"},
  {label: "弹簧势能", symbol: "E_p", expr: "Ep", color: "field"}
]} total={{label: "总机械能", expr: "EkMax"}} rows={[
  {label: "释放", at: {t: 0}},
  {label: "此刻"},
  {label: "T/4", at: {t: "T/4"}}
]} />

## 结合图像看关键时刻

曲线从 $t = 0$、$y = -A$ 出发，向上穿过平衡位置，在 $t = T/2$ 达到 $y = A$，再回到 $t = T$、$y = -A$。

$T/8$ 落在从最低点到平衡位置这一段的中点。这一段曲线下凹：前半段走得慢，后半段走得快，所以前半段的上升距离小于后半段，小于 $A/2$。游标停在 $T/8$ 时，$y$ 还在 $-A$ 与 $0$ 之间靠下的一侧。

$T/4$ 时曲线穿过 $y = 0$，这里斜率最大，速度和动能都最大。能量账本里，这一行的动能占满整条，弹簧势能为零。

## 答案汇总

经 $T/8$，小球从最低点向上运动的距离 $\boxed{\text{小于}}\,A/2$（代表值下约 $0.293\,A$）；在 $T/4$ 时刻，小球的动能 $\boxed{\text{最大}}$。
