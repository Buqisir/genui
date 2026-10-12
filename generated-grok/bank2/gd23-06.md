---
id: gd23-06
title: 给电动汽车充电
source: 2023 广东卷 第 6 题（单选，4 分）
question: 用一台理想变压器对电动汽车充电，该变压器原、副线圈的匝数比为 1:2，输出功率为 8.8 kW，原线圈的输入电压 u = 220√2 sin(100πt) V。关于副线圈输出电流的有效值和频率正确的是（　　）
choice: A
answers:
  - { name: I2, value: 20, unit: A }
  - { name: f, value: 50, unit: Hz }
---

原线圈电压 $u = 220\sqrt{2}\sin(100\pi t)\ \mathrm{V}$：峰值 $U_{1m} = 220\sqrt{2}\ \mathrm{V}$，角频率 $\omega = 100\pi\ \mathrm{rad/s}$。原、副线圈匝数比 $n_1:n_2 = 1:2$，副线圈输出功率 $P_2 = 8.8\ \mathrm{kW}$。理想变压器满足 $U_2/U_1 = n_2/n_1$，且输入功率等于输出功率。频率由原线圈决定，不随匝数改变。

## 完整解答

原线圈电压有效值

$$
U_1 = \frac{U_{1m}}{\sqrt{2}} = \frac{220\sqrt{2}}{\sqrt{2}} = 220\ \mathrm{V}
$$

由匝数比，副线圈电压有效值

$$
U_2 = U_1 \cdot \frac{n_2}{n_1} = 220 \times 2 = 440\ \mathrm{V}
$$

理想变压器输出功率就是副线圈交给电动汽车的有效功率，输出电流有效值

$$
I_2 = \frac{P_2}{U_2} = \frac{8800}{440} = 20\ \mathrm{A}
$$

频率由角频率读出

$$
f = \frac{\omega}{2\pi} = \frac{100\pi}{2\pi} = 50\ \mathrm{Hz}
$$

变压器不改变交流电的频率，副线圈频率仍是 $50\ \mathrm{Hz}$。

**A. 正确。** 副线圈输出电流有效值 $I_2 = 20\ \mathrm{A}$，频率 $f = 50\ \mathrm{Hz}$。

**B. 错误。** $20\sqrt{2}\ \mathrm{A}$ 把有效值又乘了 $\sqrt{2}$，那是电流的峰值 $I_{2m}$，不是有效值。频率 $50\ \mathrm{Hz}$ 本身没错。

**C. 错误。** 电流有效值 $20\ \mathrm{A}$ 正确，但频率不是 $100\ \mathrm{Hz}$。$100\pi$ 是角频率 $\omega$，不是频率；匝数比也不改变频率。

**D. 错误。** 电流和频率都取错了：$20\sqrt{2}\ \mathrm{A}$ 是峰值，$100\ \mathrm{Hz}$ 是把 $\omega$ 误当成频率。

副线圈输出电流的有效值和频率分别为 $\boxed{20\ \mathrm{A}}$、$\boxed{50\ \mathrm{Hz}}$，选 A。

## 交互演示

口字形铁芯左边是原线圈、右边是副线圈，画出的匝数按 $n_1:n_2$ 比例。左侧接交流电源，右侧给电动汽车充电。拖动时间，两侧电压、电流同相位交变，频率不变。输出功率保持题目的 $8.8\ \mathrm{kW}$，电动汽车等效成纯电阻负载；匝数比可以改，用来对照电压、电流怎么变、频率怎么不变。

<Param name="n1" label="原线圈匝数" value={100} min={50} max={400} step={10} />

<Param name="n2" label="副线圈匝数" value={200} min={50} max={400} step={10} />

<Param name="P2" label="输出功率" value={8800} min={4400} max={13200} step={440} unit="W" />

<Param name="t" label="时间" value={0.0025} min={0} max={0.04} step={0.0005} unit="s" />

<Define name="U1" expr="220" />

<Define name="omega" expr="100*pi" />

<Define name="f" expr="omega/(2*pi)" />

<Define name="U2" expr="U1*n2/n1" />

<Define name="I2" expr="P2/U2" />

<Define name="I1" expr="P2/U1" />

<Define name="Rcar" expr="U2*U2/P2" />

<Define name="u1" expr="U1*sqrt(2)*sin(omega*t)" />

<Define name="u2" expr="U2*sqrt(2)*sin(omega*t)" />

<Define name="i2" expr="I2*sqrt(2)*sin(omega*t)" />

<Define name="i1" expr="I1*sqrt(2)*sin(omega*t)" />

<Question text="A. 20 A，50 Hz" set={{n1: 100, n2: 200, P2: 8800, t: 0.0025}} hint="有效值 20 A，频率仍是 50 Hz" />

<Question text="B. 20√2 A，50 Hz" set={{n1: 100, n2: 200, P2: 8800, t: 0.005}} hint="20√2 A 是电流峰值，不是有效值" />

<Question text="C. 20 A，100 Hz" set={{n1: 100, n2: 200, P2: 8800, t: 0.01}} hint="100π 是角频率，频率是 50 Hz" />

<Question text="D. 20√2 A，100 Hz" set={{n1: 100, n2: 200, P2: 8800, t: 0.015}} hint="峰值和角频率都不是题目要的量" />

<Preset label="题目条件：匝数比 1:2" set={{n1: 100, n2: 200, P2: 8800}} />

<Preset label="对照：匝数比 1:1" set={{n1: 200, n2: 200, P2: 8800}} />

<Status cases={[
  {when: "abs(n2/n1 - 2) < 1e-6 and abs(P2 - 8800) < 1", label: "题目条件：I2 = 20 A，f = 50 Hz", tone: "success"},
  {when: "abs(n2 - n1) < 1e-6", label: "匝数比 1:1，电压不变、频率仍是 50 Hz", tone: "info"},
  {label: "已离开题目匝数比或功率，频率仍是 50 Hz", tone: "neutral"}
]} />

<Readout items={[
  {label: "副线圈电压有效值", symbol: "U_2", expr: "U2", unit: "V", digits: 0, color: "charge"},
  {label: "输出电流有效值", symbol: "I_2", expr: "I2", unit: "A", digits: 2, color: "velocity"},
  {label: "输出电流峰值", symbol: "I_{2m}", expr: "I2*sqrt(2)", unit: "A", digits: 2, color: "velocity"},
  {label: "频率", symbol: "f", expr: "f", unit: "Hz", digits: 0, color: "field"}
]} />

<Answer items={[
  {label: "答案", text: "A"},
  {label: "输出电流有效值", symbol: "I_2", expr: "I2", value: 20, unit: "A", digits: 0},
  {label: "频率", symbol: "f", expr: "f", value: 50, unit: "Hz", digits: 0}
]} />

<Sim title="理想变压器给电动汽车充电" height={300} duration={0.04} time="t" playSeconds={8} loop
  params={["n1", "n2", "u1", "u2", "i1", "i2", "I2", "f"]}
  hud={[
    {symbol: "I_2", label: "有效值", expr: "I2", unit: "A", digits: 1},
    {symbol: "f", label: "频率", expr: "f", unit: "Hz", digits: 0}
  ]}
  marks={[{t: 0.02, label: "一个周期，50 Hz"}]}
  note="电动汽车不按比例；线圈画出的匝数按 n1:n2 比例，不是真实匝数"
>
sim({
  at(t) {
    return { t }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -3.3, xmax: 3.7, ymin: -1.6, ymax: 1.6, equal: true })
    const xf = v.transformer(m, -0.4, 0.05, {
      n1: v.p.n1, n2: v.p.n2, w: 148, h: 124, label1: 'n_1', label2: 'n_2',
    })
    const i1s = Math.max(-1, Math.min(1, v.p.i1 / 80))
    const i2s = Math.max(-1, Math.min(1, v.p.i2 / 80))
    const pTop = xf.p[0]
    const pBot = xf.p[1]
    const sTop = xf.s[0]
    const sBot = xf.s[1]
    const carX = 1.85
    const yHi = 0.02
    const yLo = -0.2
    v.particles(m, [[-2.6, pTop[1]], [pTop[0], pTop[1]]], { kind: 'charge', speed: 48 * i1s })
    v.particles(m, [[pBot[0], pBot[1]], [-2.6, pBot[1]]], { kind: 'charge', speed: 48 * i1s })
    v.line(m, sTop[0], sTop[1], carX, yHi, { color: v.color.ink })
    v.line(m, sBot[0], sBot[1], carX, yLo, { color: v.color.ink })
    v.particles(m, [[sTop[0], sTop[1]], [carX, yHi]], { kind: 'charge', speed: 48 * i2s })
    v.particles(m, [[carX, yLo], [sBot[0], sBot[1]]], { kind: 'charge', speed: 48 * i2s })
    v.cart(m, carX, -0.32, 1.3, 0.42, { label: '电动汽车' })
    v.label(m, -2.15, pTop[1] + 0.32, 'u', { color: v.color.charge })
    v.label(m, -2.15, pBot[1] - 0.32, 'i_1', { color: v.color.velocity })
    v.label(m, 0.85, 0.95, 'u_2', { color: v.color.charge })
    v.label(m, 0.85, -0.95, 'i_2', { color: v.color.velocity })
    v.label(m, carX + 0.65, 0.4, 'P_2', { color: v.color.field })
  },
})
</Sim>

<Circuit title="等效电路（按有效值）" size="wide"
  source={{type: "generator", emf: "U1", label: "u"}}
  load={{type: "transformer", n1: "n1", n2: "n2", label: "理想变压器",
    read: {U1: "U1s", U2: "U2s", I1: "I1s", I2: "I2s", P: "Pin"},
    secondary: {type: "resistor", R: "Rcar", label: "电动汽车", read: {I: "Icar", U: "Ucar", P: "Pcar"}}}}
  note="稳恒交流按有效值求解：U2/U1 = n2/n1，输入功率等于输出功率"
/>

<Plot title="原、副线圈电压" size="wide"
  x={{name: "t", label: "t", unit: "s", min: 0, max: 0.04}}
  y={{label: "u", unit: "V", min: -900, max: 900}}
  series={[
    {label: "u", expr: "U1*sqrt(2)*sin(omega*t)", color: "charge"},
    {label: "u_2", expr: "U2*sqrt(2)*sin(omega*t)", color: "field", dash: true}
  ]}
  marks={[
    {x: 0.005, label: "u 达峰值 220√2 V"},
    {x: 0.02, label: "一个周期，f = 50 Hz"}
  ]}
  cursor="t"
/>

<Plot title="副线圈输出电流" size="narrow"
  x={{name: "t", label: "t", unit: "s", min: 0, max: 0.04}}
  y={{label: "i_2", unit: "A", min: -50, max: 50}}
  series={[{label: "i_2", expr: "I2*sqrt(2)*sin(omega*t)", color: "velocity"}]}
  marks={[
    {x: 0.005, label: "峰值 20√2 A"},
    {x: 0.02, label: "周期仍是 0.02 s"}
  ]}
  cursor="t"
/>

<Dial title="输出电流有效值" size="narrow" expr="I2" min={0} max={40} unit="A" symbol="I_2" color="velocity" digits={1}
  arcs={[{from: 19, to: 21, color: "field", label: "20 A"}]}
  footer={[{label: "题目答案 20 A", from: 19, to: 21, color: "field"}]}
/>

## 结合图像

电压图上，原线圈峰值是 $220\sqrt{2}\ \mathrm{V}$，副线圈峰值是它的 2 倍，两条曲线同相位，都是每 $0.02\ \mathrm{s}$ 重复一次，对应 $50\ \mathrm{Hz}$。电流图上，峰值是 $20\sqrt{2}\ \mathrm{A}$，有效值是峰值除以 $\sqrt{2}$，得到 $20\ \mathrm{A}$；周期仍是 $0.02\ \mathrm{s}$，不会因为匝数比变成 $100\ \mathrm{Hz}$。把匝数比改成 1:1 时，副线圈电压和电流都变，频率读数仍是 $50\ \mathrm{Hz}$。

## 答案

副线圈输出电流有效值 $20\ \mathrm{A}$，频率 $50\ \mathrm{Hz}$，选 A。
