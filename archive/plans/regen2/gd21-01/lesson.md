---
id: gd21-01
title: 银河系中的铝 26
source: 2021 广东卷 第 1 题（单选，4 分）
question: "科学家发现银河系中存在大量的放射性同位素铝 26，铝 26 的半衰期为 72 万年，其衰变方程为\n\n^{26}_{13}Al → ^{26}_{12}Mg + Y\n\n下列说法正确的是（　　）\n\nA. Y 是氦核\n\nB. Y 是质子\n\nC. 再经过 72 万年，现有的铝 26 衰变一半\n\nD. 再经过 144 万年，现有的铝 26 全部衰变"
choice: C
answers:
  - { name: nHalf, value: 50 }
  - { name: nTwo, value: 25 }
---

铝 26 衰变成镁 26，质量数都是 26，电荷数从 13 降到 12。半衰期 $T = 72$ 万年是现有原子衰掉一半所用的时间，不是全部衰完的时间。下面把现有铝 26 的数目取为 100，方便直接读出还剩的百分数。

## 完整解答

**A. 错误。** 氦核是 $\alpha$ 粒子，质量数 4、电荷数 2。若 $Y$ 是氦核，质量数不守恒：

$$
26 \neq 26 + 4
$$

产物也不会是镁 26。

**B. 错误。** 质子的质量数是 1、电荷数是 1。若 $Y$ 是质子，质量数仍不守恒：

$$
26 \neq 26 + 1
$$

电荷数也不守恒：左边是 13，右边是 $12 + 1 = 13$ 只在质子带正电时才能对上，但质量数已经不对。

**C. 正确。** 半衰期的定义：每经过一个半衰期，尚未衰变的原子数减为一半。现有铝 26 再经过 72 万年，正好衰变一半。取现有数目为 100 时，剩下

$$
N = N_0\left(\frac{1}{2}\right)^{t/T} = 100 \times \frac{1}{2} = \boxed{50}
$$

**D. 错误。** 144 万年是两个半衰期。第一个半衰期后剩下一半，第二个半衰期再衰掉这一半中的一半，还剩四分之一，不是全部衰变。

$$
N = 100 \times \left(\frac{1}{2}\right)^2 = \boxed{25}
$$

放射性衰变永远只剩下一部分，不会在有限个半衰期后衰完。

## 交互演示

拖动时间，看铝 26 怎么一个一个变成镁 26，以及还剩的百分数怎么减半。画面上的 8 个原子按余下百分数分档着色，不按比例：真实数目巨大，这里只用来看减半。

<Param name="N0" label="现有铝 26" value={100} hidden />

<Param name="T" label="半衰期" symbol="T" value={72} hidden unit="万年" />

<Param name="t" label="再经过的时间" symbol="t" value={72} min={0} max={288} step={1} unit="万年" color="velocity" />

<Define name="nLeft" expr="N0*0.5^(t/T)" />

<Define name="nHalf" expr="N0*0.5" />

<Define name="nTwo" expr="N0*0.25" />

<Question text="A. Y 是氦核" hint="氦核质量数为 4，右边质量数会变成 30" />

<Question text="B. Y 是质子" hint="质子质量数为 1，右边质量数会变成 27" />

<Question text="C. 再经过 72 万年，现有的铝 26 衰变一半" set={{t: 72}} hint="正好一个半衰期，剩下 50" />

<Question text="D. 再经过 144 万年，现有的铝 26 全部衰变" set={{t: 144}} hint="两个半衰期后还剩 25，不是 0" />

<Preset label="现在" set={{t: 0}} />

<Preset label="一个半衰期" set={{t: 72}} />

<Preset label="两个半衰期" set={{t: 144}} />

<Status cases={[
  {when: "t < 1", label: "尚未经过一个半衰期", tone: "neutral"},
  {when: "abs(t - T) < 0.5", label: "正好衰变一半", tone: "success"},
  {when: "abs(t - 2*T) < 0.5", label: "还剩四分之一，没有全部衰变", tone: "warning"},
  {label: "每过一个半衰期再减一半", tone: "info"}
]} />

<Readout items={[
  {label: "还剩铝 26", symbol: "N", expr: "nLeft", unit: "%", digits: 1, color: "charge"},
  {label: "已衰变", expr: "N0 - nLeft", unit: "%", digits: 1, color: "field"},
  {label: "经过的半衰期", symbol: "t/T", expr: "t/T", digits: 2}
]} />

<Answer items={[
  {label: "答案", text: "C"},
  {label: "一个半衰期后还剩", symbol: "N", expr: "nHalf", value: 50, unit: "%"},
  {label: "两个半衰期后还剩", symbol: "N", expr: "nTwo", value: 25, unit: "%"}
]} />

<Figure title="一次衰变" height={280} size="wide" note="原子核和粒子的大小不按比例">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.4, xmax: 10.2, ymin: -1.5, ymax: 2.6, equal: true })
    v.ball(m, 1.5, 0.35, 0.72, { label: '铝 26' })
    v.label(m, 1.5, -0.85, '电荷数 13', { place: 'below' })
    v.arrow(m, 3.15, 0.35, 4.55, 0.35, { color: v.color.ink })
    v.ball(m, 6.2, 0.35, 0.72, { label: '镁 26' })
    v.label(m, 6.2, -0.85, '电荷数 12', { place: 'below' })
    v.ball(m, 8.7, 0.35, 0.28, { charge: true, label: 'Y' })
    v.label(m, 8.7, -0.85, '质量数 0', { place: 'below' })
    v.label(m, 5, 2.05, '质量数都是 26', { place: 'above' })
  },
})
</Figure>

<Sim title="现有的铝 26" height={250} duration={288} time="t" timeUnit="万年" playSeconds={12}
  params={["nLeft", "T"]}
  marks={[
    {t: 0, label: "现在"},
    {t: 72, label: "剩下一半"},
    {t: 144, label: "剩下四分之一"},
    {t: 216, label: "剩下八分之一"}
  ]}
  hud={[{symbol: "N", label: "还剩", expr: "nLeft", unit: "%", digits: 1}]}
  legend={[{kind: "charge", label: "铝 26"}, {kind: "steel", label: "已变成镁 26"}]}
  note="8 个原子代表剩余百分数，不按比例">
sim({
  at(t, p) {
    const left = p.nLeft
    const shown = []
    for (let i = 0; i < 8; i++) shown.push(left > i * 12.5)
    return { shown, half: Math.abs(t - p.T) < 0.6, two: Math.abs(t - 2 * p.T) < 0.6 }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -0.3, xmax: 8.6, ymin: -0.9, ymax: 2.5, equal: true })
    v.ground(m, -0.3, 8.6, 0)
    for (let i = 0; i < 8; i++) {
      const x = 0.55 + i * 1.05
      if (s.shown[i]) v.ball(m, x, 0.34, 0.32, { charge: true })
      else v.ball(m, x, 0.34, 0.32)
    }
    if (s.half) v.event(m, 2.1, 1.35, '衰变一半', { at: v.p.T, kind: 'charge' })
    if (s.two) v.event(m, 4.2, 1.35, '还剩四分之一', { at: 2 * v.p.T, kind: 'force' })
  },
})
</Sim>

<Plot title="剩余的铝 26" size="wide"
  x={{name: "tau", label: "t", unit: "万年", min: 0, max: 288}}
  y={{label: "N", unit: "%", min: 0, max: 110}}
  series={[{label: "铝 26", expr: "N0*0.5^(tau/T)", color: "charge"}]}
  marks={[
    {x: 72, label: "剩下一半"},
    {x: 144, label: "剩下四分之一"}
  ]}
  cursor="t"
  caption="每过 72 万年减为一半，曲线不会降到 0"
/>

## 结合图像

曲线从 100 出发，72 万年处过 50，144 万年处过 25，216 万年处过 12.5。它一直向下减，但每次只减掉当时剩余的一半，不会在 144 万年触到横轴。

## 答案汇总

选 **C**。$Y$ 的质量数是 0、电荷数是 $+1$，是正电子，不是氦核，也不是质子。再过 72 万年衰变一半；再过 144 万年还剩四分之一。
