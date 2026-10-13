---
id: gd24-01
title: 电阻上的正弦交流电
source: 2024 广东卷 第 1 题（单选，4 分）
question: |
  将阻值为 50Ω 的电阻接在正弦式交流电源上。电阻两端电压随时间的变化规律如图所示。下列说法正确的是（　　）

  【图】u–t 图像。纵轴 u/V，向上为正；横轴 t/s，原点标 O，轴上标出 0.02 和 0.04。正、负方向各有一条水平虚线，分别标 10√2 和 −10√2。正弦曲线从原点出发，先升到正的虚线，再降到负的虚线，在 t = 0.02 处回到横轴；接着再做一个同样的正峰和负峰，曲线在第二个负峰回升的途中、还没有回到横轴时被图的右端截断。

  A. 该交流电的频率为 100Hz

  B. 通过电阻电流的峰值为 0.2A

  C. 电阻在 1 秒内消耗的电能为 1J

  D. 电阻两端电压表达式为 u = 10√2 sin(100πt) V
choice: D
answers:
  - { name: f, value: 50, unit: Hz }
  - { name: Im, value: 0.282843, unit: A }
  - { name: W1, value: 2, unit: J }
---

电阻直接接在正弦交流电源上，内阻不计，电阻两端电压就是电源电动势。题图的横轴只标出 0.02 s 和 0.04 s，但曲线走法已经把周期说明白了。

从原点出发后先到正的虚线 $10\sqrt{2}\ \mathrm{V}$，再到负的虚线 $-10\sqrt{2}\ \mathrm{V}$，然后才在 $t = 0.02\ \mathrm{s}$ 回到横轴。正峰和负峰都出现过一次又回到与出发时相同的状态，所以

$$
T = 0.02\ \mathrm{s}
$$

中间还会在 $t = 0.01\ \mathrm{s}$ 过一次零，那是半个周期，不是一个周期。接下去再做一个同样的正峰和负峰；题图在第二个负峰回升、尚未回到横轴时被截断，第二个周期本应在 $t = 0.04\ \mathrm{s}$ 结束。下面的曲线把这一周期补画完，便于对着读。

## 完整解答

峰值由虚线读出，有效值是峰值的 $1/\sqrt{2}$：

$$
u_m = 10\sqrt{2}\ \mathrm{V}, \qquad U = \frac{U_m}{\sqrt{2}} = \boxed{10}\ \mathrm{V}
$$

**A. 错误。** 频率是周期的倒数，不是半个周期的倒数。

$$
f = \frac{1}{T} = \frac{1}{0.02} = \boxed{50}\ \mathrm{Hz}
$$

若把 $0$ 到 $0.01\ \mathrm{s}$ 这半个周期当成一个周期，才会得到 $100\ \mathrm{Hz}$。

**B. 错误。** 电阻上电流与电压同相，峰值用峰值电压除以电阻：

$$
I_m = \frac{U_m}{R} = \frac{10\sqrt{2}}{50} = \frac{\sqrt{2}}{5} \approx \boxed{0.283}\ \mathrm{A}
$$

$0.2\ \mathrm{A}$ 是有效值 $I = U/R = 10/50 = 0.2\ \mathrm{A}$，不是峰值。

**C. 错误。** 交流电的电功、电能用有效值。平均功率不随时间改变：

$$
P = \frac{U^2}{R} = \frac{10^2}{50} = 2\ \mathrm{W}, \qquad W = Pt = 2 \times 1 = \boxed{2}\ \mathrm{J}
$$

若把峰值除以 $2$ 而不是 $\sqrt{2}$，$U' = 5\sqrt{2}\ \mathrm{V}$，平均功率变成 $1\ \mathrm{W}$，$1\ \mathrm{s}$ 内就会算成 $1\ \mathrm{J}$。功率曲线下一个周期的面积只有 $0.04\ \mathrm{J}$，乘上每秒 $50$ 个周期，仍是 $2\ \mathrm{J}$。

**D. 正确。** 角频率 $\omega = 2\pi/T = 100\pi\ \mathrm{rad/s}$。$t = 0$ 时电压为 $0$，接着向正方向增大，用正弦而不是余弦。

$$
u = U_m\sin\omega t = \boxed{10\sqrt{2}\sin(100\pi t)}\ \mathrm{V}
$$

四个选项里只有这一项与图像和欧姆定律都符合。

$$
\boxed{D}
$$

## 交互演示

拖动时间，或点下面的关键时刻：电路上的电压、电流随着变号，相量与之同相旋转，竖直投影就是这一瞬间的值。电压图对着题图看周期和选项 D，电流图看峰值是不是 $0.2\ \mathrm{A}$，功率图的面积再乘上每秒的周期数，就是 $1\ \mathrm{s}$ 内的电能。

<Param name="t" label="时间" symbol="t" value={0} min={0} max={0.04} step={0.0005} digits={4} unit="s" />

<Param name="R" label="电阻" value={50} unit="Ω" hidden />

<Define name="Um" expr="10*sqrt(2)" />

<Define name="T" expr="0.02" />

<Define name="f" expr="1/T" />

<Define name="omega" expr="2*pi/T" />

<Define name="Ueff" expr="Um/sqrt(2)" />

<Define name="Im" expr="Um/R" />

<Define name="Ieff" expr="Ueff/R" />

<Define name="Pavg" expr="Ueff*Ueff/R" />

<Define name="W1" expr="Pavg*1" />

<Define name="Wcycle" expr="Pavg*T" />

<Question text="A. 该交流电的频率为 100Hz" set={{t: 0.02}} hint="从出发到下一次同样过零，正峰和负峰各走过一次" />

<Question text="B. 通过电阻电流的峰值为 0.2A" set={{t: 0.005}} hint="用峰值电压除以电阻，0.2 A 是有效值" />

<Question text="C. 电阻在 1 秒内消耗的电能为 1J" set={{t: 0.01}} hint="平均功率用有效值，再乘 1 s" />

<Question text="D. 电阻两端电压表达式为 u = 10√2 sin(100πt) V" set={{t: 0.005}} hint="对峰值、角频率，以及 t = 0 时由零向正" />

<Preset label="正峰值，核对 D" set={{t: 0.005}} />

<Preset label="一个周期结束" set={{t: 0.02}} />

<Preset label="回到起点" set={{t: 0}} />

<Status cases={[
  {when: "ac.uR(t) > 0.5", label: "电压为正，与选项 D 同号", tone: "info"},
  {when: "ac.uR(t) < -0.5", label: "电压为负，与选项 D 同号", tone: "warning"},
  {label: "电压过零", tone: "neutral"}
]} />

<Readout items={[
  {label: "周期", symbol: "T", expr: "T", unit: "s", digits: 2},
  {label: "频率", symbol: "f", expr: "f", unit: "Hz", digits: 0},
  {label: "电阻电压", symbol: "u", expr: "ac.uR(t)", unit: "V", digits: 2, color: "field"},
  {label: "电阻电流", symbol: "i", expr: "ac.iR(t)", unit: "A", digits: 3, color: "charge"},
  {label: "电流峰值", symbol: "I_m", expr: "Im", unit: "A", digits: 3, color: "charge"},
  {label: "电流有效值", symbol: "I", expr: "Ieff", unit: "A", digits: 3, color: "charge"},
  {label: "平均功率", symbol: "P", expr: "Pavg", unit: "W", digits: 2, color: "force"},
  {label: "1 s 内电能", symbol: "W", expr: "W1", unit: "J", digits: 2, color: "force"}
]} />

<Answer items={[
  {label: "答案", text: "D"},
  {label: "频率", symbol: "f", expr: "f", value: 50, unit: "Hz"},
  {label: "电流峰值", symbol: "I_m", expr: "Im", value: 0.282843, unit: "A", digits: 3},
  {label: "1 s 内电能", symbol: "W", expr: "W1", value: 2, unit: "J"}
]} />

<Circuit
  title="电阻接在正弦交流电源上"
  source={{type: "generator", label: "e", emf: "Um*sin(omega*t)"}}
  load={{type: "resistor", label: "R", R: "R", read: {I: "iR", U: "uR", P: "pR"}, note: {expr: "ac.uR(t)", unit: "V", digits: 2, prefix: "u = "}}}
  transient={{name: "ac", until: 0.05, steps: 1200, at: "t"}}
  current={{expr: "ac.iR(t)", unit: "A", label: "i", digits: 3}}
  flow={{expr: "ac.iR(t)", ref: "Im"}}
  note="内阻不计，电阻两端电压就是电源电动势"
/>

<Sim
  title="电压、电流相量"
  size="narrow"
  height={420}
  duration={0.04}
  playSeconds={10}
  time="t"
  step={0.005}
  stepLabel="前进四分之一周期"
  params={["omega"]}
  marks={[
    {t: 0, label: "由零向正"},
    {t: 0.005, label: "正峰值"},
    {t: 0.01, label: "半个周期"},
    {t: 0.015, label: "负峰值"},
    {t: 0.02, label: "一个周期"},
    {t: 0.035, label: "第二个负峰"}
  ]}
  hud={[
    {symbol: "u", label: "电压", expr: "ac.uR(t)", unit: "V", digits: 2},
    {symbol: "i", label: "电流", expr: "ac.iR(t)", unit: "A", digits: 3}
  ]}
  legend={[
    {kind: "field", label: "电压相量"},
    {kind: "charge", label: "电流相量"}
  ]}
  note="箭头按各自峰值归一化，电流再画成电压的 0.55 倍，不按同一比例；电阻上二者同相"
>
sim({
  at(t, p) {
    const th = p.omega * t
    return { c: Math.cos(th), s: Math.sin(th) }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -1.85, xmax: 1.85, ymin: -1.7, ymax: 1.7, equal: true, pad: 28 })
    v.circle(m, 0, 0, 1, { color: v.color.steel })
    v.line(m, -1.25, 0, 1.25, 0, { color: v.color.steel })
    v.line(m, 0, -1.25, 0, 1.25, { color: v.color.steel })
    v.line(m, s.c, s.s, 0, s.s, { color: v.color.field, dash: true })
    v.circle(m, 0, s.s, 0.045, { fill: v.color.field })
    v.vec(m, 0, 0, s.c, s.s, { kind: "field" })
    v.vec(m, 0, 0, 0.55 * s.c, 0.55 * s.s, { kind: "charge" })
    v.label(m, s.c + 0.36 * s.c, s.s + 0.36 * s.s, "u")
    v.label(m, 0.55 * s.c - 0.42 * s.s, 0.55 * s.s + 0.42 * s.c, "i")
  },
})
</Sim>

<Plot
  title="电阻两端电压"
  size="wide"
  caption="虚线是题图中的 ±10√2 V；横轴画到 0.04 s，比题图右端略长"
  x={{name: "t", label: "t", unit: "s", min: 0, max: 0.04}}
  y={{label: "u", unit: "V", min: -18, max: 18}}
  series={[
    {label: "u", expr: "ac.uR(t)", color: "field"},
    {label: "10√2", expr: "Um", color: "steel", dash: true},
    {label: "−10√2", expr: "-Um", color: "steel", dash: true}
  ]}
  marks={[
    {x: 0.005, label: "正峰值"},
    {x: 0.02, label: "一个周期"}
  ]}
  cursor="t"
/>

<Plot
  title="通过电阻的电流"
  caption="水平虚线是有效值 0.2 A，不是峰值"
  x={{name: "t", label: "t", unit: "s", min: 0, max: 0.04}}
  y={{label: "i", unit: "A", min: -0.4, max: 0.4}}
  series={[
    {label: "i", expr: "ac.iR(t)", color: "charge"},
    {label: "0.2 A", expr: "Ieff", color: "steel", dash: true},
    {label: "−0.2 A", expr: "-Ieff", color: "steel", dash: true}
  ]}
  marks={[{x: 0.005, label: "正向峰值"}]}
  cursor="t"
/>

<Plot
  title="电阻消耗的功率"
  caption="阴影是一个周期内的电能，平均起来每秒 2 J"
  x={{name: "t", label: "t", unit: "s", min: 0, max: 0.04}}
  y={{label: "p", unit: "W", min: 0, max: 5}}
  series={[
    {label: "p", expr: "ac.pR(t)", color: "force"},
    {label: "P", expr: "Pavg", color: "steel", dash: true}
  ]}
  areas={[{series: 0, from: 0, until: 0.02, label: "一个周期"}]}
  cursor="t"
/>

<Dial
  title="1 秒内消耗的电能"
  expr="W1"
  min={0}
  max={4}
  unit="J"
  symbol="W"
  color="force"
  arcs={[{from: 1.85, to: 2.15, color: "force", label: "2 J"}]}
  footer={[
    {label: "选项 C 的 1 J", from: 0.85, to: 1.15, color: "steel"},
    {label: "正确值 2 J", from: 1.85, to: 2.15, color: "force"}
  ]}
/>

## 结合图像看关键时刻

$t = 0$：电压、电流都为零，相量在横轴正向，接着一起向上转。这一点排除了余弦表达式。

$t = 0.005\ \mathrm{s}$：经过四分之一周期，电压到达 $10\sqrt{2}\ \mathrm{V}$，电流到达约 $0.283\ \mathrm{A}$。选项 D 在这一刻算出 $\sin(\pi/2) = 1$，与图上的正峰重合；选项 B 的 $0.2\ \mathrm{A}$ 只落在虚线上，到不了峰值。

$t = 0.01\ \mathrm{s}$：半个周期，电压再次过零并改变方向。这一段时间不是一个周期，频率不是 $100\ \mathrm{Hz}$。

$t = 0.02\ \mathrm{s}$：正峰、负峰各出现一次后回到出发时的状态，才是一个周期。功率曲线下的面积是这一周期的电能 $0.04\ \mathrm{J}$。

$t = 0.035\ \mathrm{s}$ 附近：第二个负峰。题图在它回升、还没有到横轴时截断，不要把图的右端当成又一次过零。

## 答案汇总

A 把半个周期当成了周期，频率应为 $50\ \mathrm{Hz}$。B 把有效值 $0.2\ \mathrm{A}$ 说成了峰值，峰值约为 $0.283\ \mathrm{A}$。C 少除了一次 $\sqrt{2}$，$1\ \mathrm{s}$ 内电能是 $2\ \mathrm{J}$ 不是 $1\ \mathrm{J}$。D 的峰值、角频率和初相位都与图像一致。

$$
\boxed{D}
$$
