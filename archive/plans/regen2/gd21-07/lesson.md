---
id: gd21-07
title: 永磁铁充电装置
source: 2021 广东卷 第 7 题（单选，4 分）
question: 某同学设计了一个充电装置，如图所示，假设永磁铁的往复运动在螺线管中产生近似正弦式交流电，周期为 0.2 s，电压最大值为 0.05 V，理想变压器原线圈接螺线管，副线圈接充电电路，原、副线圈匝数比为 1∶60，下列说法正确的是（　　）
choice: B
answers:
  - { name: f, value: 5, unit: Hz }
  - { name: Um2, value: 3, unit: V }
---

永磁铁沿螺线管的轴往复运动，管内磁通量周期性变化，产生近似正弦式的感生电动势。这个电动势接在理想变压器的原线圈上，副线圈接充电电路。

题目给出：周期 $T = 0.2\ \mathrm{s}$，原线圈电压最大值 $U_{1\mathrm{m}} = 0.05\ \mathrm{V}$，匝数比 $n_1:n_2 = 1:60$。

充电电路的电阻题目没有给。下面取代表性数值 $R = 180\ \Omega$，只用来看功率的去向；它不改变频率和副线圈电压最大值。瞬时电压 $u_1 = U_{1\mathrm{m}}\sin(2\pi t/T)$ 交给电路组件求解，理想变压器每一时刻都按匝数比升降压。

## 完整解答

**A. 交流电的频率为 10 Hz —— 错误。** 频率与周期互为倒数：

$$
f = \frac{1}{T} = \frac{1}{0.2\ \mathrm{s}} = \boxed{5\ \mathrm{Hz}}
$$

不是 10 Hz。

**B. 副线圈两端电压最大值为 3 V —— 正确。** 理想变压器原、副线圈电压与匝数成正比，最大值也成正比：

$$
\frac{U_{2\mathrm{m}}}{U_{1\mathrm{m}}} = \frac{n_2}{n_1}
\quad\Rightarrow\quad
U_{2\mathrm{m}} = 0.05\ \mathrm{V} \times 60 = \boxed{3\ \mathrm{V}}
$$

**C. 变压器输入电压与永磁铁磁场强弱无关 —— 错误。** 螺线管的感生电动势由法拉第电磁感应定律决定：

$$
e = -n\frac{\Delta\Phi}{\Delta t} = -n\frac{\Delta(BS)}{\Delta t}
$$

这个电动势就是变压器的输入电压。磁场越强，同一次往复运动引起的磁通量变化越大，输入电压的最大值也越大。

**D. 充电电路的输入功率大于变压器的输入功率 —— 错误。** 理想变压器没有能量损失，输入功率等于输出功率。副线圈的输出就是充电电路的输入，两者相等，充电电路的输入功率不会更大。

因 $\boxed{\text{B}}$

## 交互演示

拖动时间，永磁铁沿螺线管轴线往复运动一个周期。磁铁经过螺线管中部时速度最大、磁通量变化最快，感生电压达到最大值；走到两端折返时速度为零，电压为零。原线圈接螺线管，副线圈接充电电路。画出的匝数只是示意，不按 1∶60 的比例；磁铁的行程也不按比例。

<Param name="t" label="时间" value={0} min={0} max={0.2} step={0.005} unit="s" />

<Param name="T" label="周期" value={0.2} min={0.1} max={0.4} step={0.02} unit="s" />

<Param name="Um1" label="原线圈电压最大值" symbol="U_{1m}" value={0.05} min={0.02} max={0.1} step={0.01} unit="V" />

<Param name="n1" label="原线圈匝数" symbol="n_1" value={1} hidden />

<Param name="n2" label="副线圈匝数" symbol="n_2" value={60} hidden />

<Param name="R" label="充电电路电阻" value={180} min={60} max={360} step={30} unit="Ω" />

<Define name="f" expr="1/T" />

<Define name="Um2" expr="Um1*n2/n1" />

<Question text="A. 交流电的频率为 10 Hz" set={{t: 0, T: 0.2, Um1: 0.05}} hint="T = 0.2 s 时，f = 1/T = 5 Hz，不是 10 Hz" />

<Question text="B. 副线圈两端电压最大值为 3 V" set={{t: 0.05, T: 0.2, Um1: 0.05}} hint="U_2m = U_1m × n_2/n_1 = 0.05 × 60 = 3 V" />

<Question text="C. 变压器输入电压与永磁铁磁场强弱无关" set={{t: 0.05, Um1: 0.1}} hint="磁场加强，磁通量变化加快，原线圈电压最大值从 0.05 V 升到 0.1 V" />

<Question text="D. 充电电路的输入功率大于变压器的输入功率" set={{t: 0.05, T: 0.2, Um1: 0.05}} hint="理想变压器输入功率等于输出功率，两者相等" />

<Status cases={[
  {when: "abs(f - 5) < 1e-6 and abs(Um2 - 3) < 1e-6", label: "题目数据：f = 5 Hz，U_2m = 3 V，选 B", tone: "success"},
  {when: "Um1 > 0.05", label: "磁场加强后输入电压变大，C 不成立", tone: "warning"},
  {label: "已偏离题目数据：频率仍是 1/T，副线圈电压仍按匝数比升压", tone: "info"}
]} />

<Readout items={[
  {label: "频率", symbol: "f", expr: "f", unit: "Hz", digits: 2, color: "field"},
  {label: "副线圈电压最大值", symbol: "U_{2m}", expr: "Um2", unit: "V", digits: 2, color: "charge"},
  {label: "变压器输入功率", symbol: "P_1", expr: "ac.P1(t)", unit: "W", digits: 4, color: "force"},
  {label: "充电电路输入功率", symbol: "P_2", expr: "ac.P2(t)", unit: "W", digits: 4, color: "force"}
]} />

<Preset label="题目数据" set={{t: 0.05, T: 0.2, Um1: 0.05, R: 180}} />

<Preset label="磁场加强" set={{t: 0.05, Um1: 0.1}} />

<Answer items={[
  {label: "答案", text: "B"},
  {label: "频率", symbol: "f", expr: "f", value: 5, unit: "Hz", digits: 0},
  {label: "副线圈电压最大值", symbol: "U_{2m}", expr: "Um2", value: 3, unit: "V", digits: 2}
]} />

<Sim title="永磁铁充电装置" height={340} duration="T" time="t" playSeconds={6} loop={true} params={["T", "Um1", "n1", "n2", "R", "f", "Um2", "ac"]} marks={[{t: 0, label: "磁铁在上端折返，电压为 0"}, {t: "T/4", label: "经过中部，电压达最大"}, {t: "T/2", label: "磁铁在下端折返"}, {t: "3*T/4", label: "再次经过中部"}]} hud={[{symbol: "u_1", label: "原线圈电压", expr: "Um1*sin(2*pi*t/T)", unit: "V", digits: 3}, {symbol: "u_2", label: "副线圈电压", expr: "Um2*sin(2*pi*t/T)", unit: "V", digits: 2}]} legend={[{kind: "charge", label: "感生电压"}, {kind: "field", label: "磁铁的磁场"}]} note="匝数与磁铁行程不按比例；磁铁经过中部时磁通量变化最快">
sim({
  at(t, p) {
    const phi = 2 * Math.PI * t / p.T
    return {
      y: 1.15 * Math.cos(phi),
      speed: Math.abs(Math.sin(phi)),
      u1: p.Um1 * Math.sin(phi),
      u2: p.Um2 * Math.sin(phi),
    }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -2.2, xmax: 13.2, ymin: -3.1, ymax: 3.3, equal: true })
    const coil = v.solenoid(m, 3.9, -0.9, 3.9, 0.9, {
      r: 0.46,
      turns: 7,
      sense: 1,
      current: s.u1,
      field: s.speed > 0.35 ? 2 : false,
      terminals: "above",
    })
    const mag = v.magnet(m, 0.55, s.y, { kind: "bar", w: 1.3, h: 0.44, north: "up", field: 2 })
    const tf = v.transformer(m, 8.6, 0, { n1: 4, n2: 12, w: 132, h: 108, label1: "n_1", label2: "n_2" })
    const top = coil.terminals[0]
    const bot = coil.terminals[1]
    const high = top[1] >= bot[1] ? top : bot
    const low = top[1] >= bot[1] ? bot : top
    const pHigh = tf.p[0][1] >= tf.p[1][1] ? tf.p[0] : tf.p[1]
    const pLow = tf.p[0][1] >= tf.p[1][1] ? tf.p[1] : tf.p[0]
    const bus = 6.15
    v.line(m, high[0], high[1], bus, high[1], { color: v.color.ink, width: 1.5 })
    v.line(m, bus, high[1], bus, pHigh[1], { color: v.color.ink, width: 1.5 })
    v.line(m, bus, pHigh[1], pHigh[0], pHigh[1], { color: v.color.ink, width: 1.5 })
    v.line(m, low[0], low[1], bus + 0.55, low[1], { color: v.color.ink, width: 1.5 })
    v.line(m, bus + 0.55, low[1], bus + 0.55, pLow[1], { color: v.color.ink, width: 1.5 })
    v.line(m, bus + 0.55, pLow[1], pLow[0], pLow[1], { color: v.color.ink, width: 1.5 })
    const boxX = tf.s[0][0] + 0.45
    const topY = tf.s[0][1]
    const botY = tf.s[1][1]
    v.line(m, tf.s[0][0], topY, boxX, topY, { color: v.color.ink, width: 1.5 })
    v.line(m, tf.s[1][0], botY, boxX, botY, { color: v.color.ink, width: 1.5 })
    v.rect(m, boxX, botY, 1.5, topY - botY, { color: v.color.ink, width: 1.5 })
    v.label(m, boxX + 0.75, (topY + botY) / 2, "充电电路")
    const dir = -Math.sign(Math.sin(2 * Math.PI * v.t / v.p.T))
    if (s.speed > 0.08) v.vec(m, -1.35, s.y, 0, dir * 0.7, { kind: "velocity", label: "v" })
    v.label(m, 0.55, -2.4, "永磁铁")
    v.label(m, 3.9, -2.4, "螺线管")
    v.label(m, 8.6, -2.4, "变压器")
  },
})
</Sim>

<Circuit title="等效电路" size="wide" source={{type: "generator", label: "螺线管", emf: "Um1*sin(2*pi*t/T)"}} load={{type: "transformer", n1: "n1", n2: "n2", label: "1∶60", read: {U1: "U1", U2: "U2", P: "P1"}, secondary: {type: "resistor", label: "充电电路", R: "R", read: {U: "U2load", P: "P2"}}}} transient={{name: "ac", until: "T", at: "t"}} note="电动势按瞬时值 u_1 = U_1m sin(2πt/T) 计算，理想变压器每一时刻都满足 u_2/u_1 = n_2/n_1" />

<Plot title="原、副线圈电压" size="wide" x={{name: "t", label: "t", unit: "s", min: 0, max: "T"}} y={{label: "u", unit: "V", min: -3.6, max: 3.6}} series={[{label: "u_1", expr: "Um1*sin(2*pi*t/T)", color: "charge"}, {label: "u_2", expr: "Um2*sin(2*pi*t/T)", color: "charge", dash: true}]} marks={[{x: "T/4", label: "u_2 达到 U_2m"}, {x: "3*T/4", label: "u_2 达到负的最大值"}]} cursor="t" caption="实线是原线圈电压，幅度只有 0.05 V；虚线是副线圈电压，最大值 3 V" />

<Ledger title="功率" size="narrow" unit="W" digits={4} parts={[{label: "变压器输入", symbol: "P_1", expr: "ac.P1(t)", color: "force"}, {label: "充电电路", symbol: "P_2", expr: "ac.P2(t)", color: "charge"}]} total={{label: "两者之和", expr: "ac.P1(t) + ac.P2(t)"}} caption="理想变压器两份功率相等，充电电路不会更大" />

## 结合图像看关键时刻

- $t = 0$：永磁铁在上端折返，速度为零，磁通量变化最慢，感生电压为 0。
- $t = T/4 = 0.05\ \mathrm{s}$：磁铁经过螺线管中部，速度最大，原线圈电压达到最大值 $0.05\ \mathrm{V}$，副线圈电压达到 $3\ \mathrm{V}$。
- $t = T/2$：磁铁走到下端折返，电压又为 0，之后改变方向。
- 一个周期 $0.2\ \mathrm{s}$内完成一次往复，所以频率是 $5\ \mathrm{Hz}$，不是 $10\ \mathrm{Hz}$。
- 把「原线圈电压最大值」调大，副线圈电压最大值同比例变大：输入电压随永磁铁磁场增强而增大。
- 功率账本上两条始终一样长：理想变压器的输入功率等于充电电路得到的功率。

## 答案汇总

选 **B**。频率为 $5\ \mathrm{Hz}$，副线圈电压最大值为 $3\ \mathrm{V}$；输入电压随永磁铁磁场增强而增大，充电电路得到的功率等于变压器的输入功率。
