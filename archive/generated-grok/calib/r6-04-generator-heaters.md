---
id: r6-04-generator-heaters
title: 保温室电热器的正常工作与最大功率
subject: physics
topic: 闭合电路欧姆定律
source: 2022 北大附中石景山学校期中
question: |
  （2022·北大附中石景山学校期中）一台直流发电机为保温室中的电热器供电。发电机电动势 E=250 V，内阻 r=0.50 Ω，输出端经两根输电线接到保温室，两根输电线的电阻 R₁=R₂=1.0 Ω。保温室中装有若干只完全相同的电热器，彼此并联，用来调节室温。每只电热器的额定电压为 200 V，额定功率为 1000 W。不计其他电阻，也不考虑电热器电阻随温度的变化。求：
  (1) 为使电热器能正常工作，应接入多少只电热器？
  (2) 电热器正常工作时，直流发电机对保温室供热的效率（电热器总功率与发电机总功率之比）；
  (3) 保温室内电热器可能消耗的最大总电功率。
answers:
  - { name: nRated, value: 4, unit: "只" }
  - { name: eta, value: 80, unit: "%" }
  - { name: Pmax, value: 6250, unit: W }
---

## 一、题目条件分析

发电机、内阻、两根输电线和保温室内的电热器串联成一个闭合电路。电热器彼此并联，只数 $n$ 用来调节室温。

- 电动势 $E = 250\ \text{V}$，内阻 $r = 0.50\ \Omega$。
- 输电线 $R_1 = R_2 = 1.0\ \Omega$。电热器接在两根输电线的末端。
- 每只电热器额定电压 $U_0 = 200\ \text{V}$，额定功率 $P_0 = 1000\ \text{W}$。电阻不随温度变化，其余电阻不计。

电热器电阻由额定值锁定：

$$
R = \frac{U_0^2}{P_0} = \frac{200^2}{1000} = 40\ \Omega
$$

干路上，内阻、两根输电线和电热器的并联电阻 $R/n$ 顺次串联。电热器两端的电压才是额定电压要去对的那个电压，它比发电机的路端电压再低一个输电线上的压降。

## 二、完整解答

正常工作时每只电流为

$$
I_0 = \frac{P_0}{U_0} = \frac{1000}{200} = 5\ \text{A}
$$

把电热器以外的电阻合在一起：

$$
R_0 = r + R_1 + R_2 = 0.50 + 1.0 + 1.0 = 2.5\ \Omega
$$

### （1）正常工作的只数

正常工作就是每只电热器两端电压等于 $U_0$。闭合电路欧姆定律写成

$$
E = U_0 + I R_0
$$

$$
I = \frac{E - U_0}{R_0} = \frac{250 - 200}{2.5} = 20\ \text{A}
$$

干路电流是各只电热器电流之和，所以

$$
n = \frac{I}{I_0} = \frac{20}{5} = \boxed{4\ \text{只}}
$$

核对并联电阻：$U_0/I = 200/20 = 10\ \Omega$，只数 $n = R/(R/n) = 40/10 = 4$，与上面一致。此时每只功率就是额定功率 $1000\ \text{W}$。

### （2）正常工作时的供热效率

题目规定的效率，是电热器总功率与发电机总功率 $EI$ 之比。

$$
P_\text{热} = n P_0 = 4 \times 1000 = 4000\ \text{W}
$$

$$
P = EI = 250 \times 20 = 5000\ \text{W}
$$

$$
\eta = \frac{P_\text{热}}{EI} = \frac{4000}{5000} = \frac{U_0}{E} = \boxed{80\%}
$$

$4000\ \text{W}$ 进保温室内的电热器。另外 $I^2 r = 200\ \text{W}$ 耗在内阻上，$I^2(R_1+R_2) = 800\ \text{W}$ 耗在两根输电线上。三项之和 $200 + 800 + 4000 = 5000\ \text{W}$，等于 $EI$。

电流 $I$ 在分子分母里约掉，所以正常工作时效率就是 $U_0/E$。分子必须是电热器消耗的功率：内阻上的 $I^2 r$ 留在发电机里，输电线的发热也不在保温室内。

### （3）电热器的最大总功率

设干路电流为 $I$，电热器两端电压为 $E - I R_0$，电热器总功率

$$
P_\text{热} = (E - I R_0)\, I = EI - R_0 I^2
$$

对 $I$ 配方：

$$
P_\text{热} = -R_0\left(I - \frac{E}{2R_0}\right)^2 + \frac{E^2}{4R_0}
$$

$I = E/(2R_0)$ 时功率最大。代入 $R_0 = 2.5\ \Omega$：

$$
I = \frac{250}{2 \times 2.5} = 50\ \text{A}
$$

$$
P_{\max} = \frac{E^2}{4R_0} = \frac{250^2}{4 \times 2.5} = \boxed{6250\ \text{W}}
$$

这时电热器两端电压和并联电阻为

$$
U = E - I R_0 = 250 - 50 \times 2.5 = 125\ \text{V}
$$

$$
R_\text{并} = \frac{U}{I} = \frac{125}{50} = 2.5\ \Omega = R_0
$$

$$
n = \frac{R}{R_\text{并}} = \frac{40}{2.5} = 16
$$

$16$ 是整数，这个最大值能够取到。此时 $U = 125\ \text{V}$，低于额定电压 $200\ \text{V}$。

把 $r$、$R_1$、$R_2$ 看成等效内阻，电热器的并联部分看成接在它外面的负载，负载电阻等于这段等效内阻时，负载上的功率最大。这里相等的是 $R/n$ 和 $R_0$，不是 $R/n$ 和发电机内阻 $r$。两根输电线已经有 $2.0\ \Omega$，外电路电阻总大于 $r$，发电机对整个外电路的输出功率在本题允许的只数里没有教科书上的那个峰值。

$n$ 小于 $4$ 时，单只电压会高于 $200\ \text{V}$。题目规定电阻不随温度变化，所以功率公式仍然按 $40\ \Omega$ 计算；这样算出的总功率在 $n = 1$ 时只有约 $1384\ \text{W}$，仍然低于 $6250\ \text{W}$。最大功率的工作点本身没有超过额定电压。

## 三、交互演示

只数从第（1）问的结果 $4$ 只起步。这个 $4$ 是算出来的，题目没有事先给出。改变只数时，电流、电压和各处功率都按这张电路重算。

<Question text="为使电热器正常工作，应接入多少只？" set={{n: 4}} hint="正常工作时，每只电热器两端的电压等于额定电压 200 V" />

<Question text="正常工作时，供热效率是多少？" set={{n: 4}} hint="效率等于电热器总功率除以发电机总功率 EI" />

<Question text="电热器可能消耗的最大总电功率是多少？" set={{n: 16}} hint="电热器的并联电阻等于其余电阻之和时，电热器功率最大" />

<Param name="n" label="电热器只数" symbol="n" min={1} max={30} step={1} value={4} unit="只" digits={0} control="stepper" />

<Define name="E" expr="250" />

<Define name="r" expr="0.5" />

<Define name="R1" expr="1" />

<Define name="R2" expr="1" />

<Define name="U0" expr="200" />

<Define name="P0" expr="1000" />

<Define name="Rh" expr="U0^2 / P0" />

<Define name="I0" expr="P0 / U0" />

<Define name="R0" expr="r + R1 + R2" />

<Define name="nRated" expr="(E - U0) / (R0 * I0)" />

<Define name="nPmax" expr="Rh / R0" />

<Define name="Pmax" expr="E^2 / (4 * R0)" />

<Define name="eta" expr="100 * U0 / E" />

<Preset label="正常工作：4 只" set={{n: 4}} />

<Preset label="最大功率：16 只" set={{n: 16}} />

<Preset label="超过额定：1 只" set={{n: 1}} />

<Circuit
  title="发电机经输电线向保温室供电"
  layout="ladder"
  box={{label: "保温室"}}
  source={{series: [
    {type: "generator", label: "E = 250 V", emf: "E", read: {I: "I"}, note: {expr: "E * I", unit: "W", prefix: "P = "}},
    {type: "resistor", label: "r = 0.50 Ω", R: "r", read: {P: "Pr"}, note: {expr: "Pr", unit: "W", prefix: "P = "}},
  ]}}
  load={{series: [
    {type: "resistor", label: "R_1 = 1.0 Ω", R: "R1", read: {P: "PR1"}, note: {expr: "PR1", unit: "W", prefix: "P = "}},
    {repeat: "n", label: "共 {n} 只", item: {type: "heater", label: "40 Ω", R: "Rh", read: {U: "U", P: "P1"}, note: {expr: "U", unit: "V", prefix: "U = "}}},
    {type: "resistor", label: "R_2 = 1.0 Ω", R: "R2", read: {P: "PR2"}, note: {expr: "PR2", unit: "W", prefix: "P = "}},
  ]}}
  current={{expr: "I", unit: "A", label: "I"}}
  note="每只电热器电阻为 40 Ω，由额定电压和额定功率算出，不随温度变化"
/>

<Define name="Ph" expr="U * I" />

<Define name="Pgen" expr="E * I" />

<Define name="Pline" expr="PR1 + PR2" />

<Define name="etaNow" expr="Ph / Pgen" />

<Status cases={[
  {when: "U0 + 0.5 < U", label: "超过额定电压", tone: "danger"},
  {when: "abs(U - U0) < 1", label: "电热器正常工作", tone: "success"},
  {when: "abs(n - nPmax) < 0.5", label: "电热器总功率最大", tone: "info"},
  {label: "低于额定电压", tone: "neutral"}
]} />

<Readout items={[
  {label: "干路电流", symbol: "I", expr: "I", unit: "A", digits: 2, color: "charge"},
  {label: "电热器电压", symbol: "U", expr: "U", unit: "V", digits: 1, color: "charge"},
  {label: "单只功率", symbol: "P_1", expr: "P1", unit: "W", digits: 1, color: "charge"},
  {label: "电热器总功率", symbol: "P_热", expr: "Ph", unit: "W", digits: 1, color: "charge"},
  {label: "当前效率", symbol: "η", expr: "etaNow", digits: 1, format: "percent"},
  {label: "理论最大总功率", symbol: "P_{max}", expr: "Pmax", unit: "W", digits: 0, color: "charge"}
]} />

<Answer items={[
  {label: "正常工作只数", symbol: "n", expr: "nRated", value: 4, unit: "只", digits: 0},
  {label: "供热效率", symbol: "η", expr: "eta", value: 80, unit: "%", digits: 0},
  {label: "最大总电功率", symbol: "P_{max}", expr: "Pmax", value: 6250, unit: "W", digits: 0}
]} />

<Bars
  title="电热器总功率与接入只数"
  caption="先升后降，最高的一根在 16 只；点击柱子即可切换只数"
  x={{name: "k", label: "n", unit: "只", min: 1, max: 30}}
  y={{label: "P", unit: "W", min: 0}}
  expr="E^2 * Rh * k / (R0 * k + Rh)^2"
  cursor="n"
  marks={[
    {x: 4, label: "正常工作", style: "outline"},
    {x: 16, label: "功率最大", style: "solid"}
  ]}
  color="charge"
/>

<Dial
  title="单只电热器电压"
  expr="U"
  min={0}
  max={250}
  step={50}
  unit="V"
  symbol="U"
  arcs={[{from: 200, to: 250, color: "force", label: "超额定"}]}
  footer={[{label: "200 V 刻度是额定电压，其上为超过额定", from: 200, to: 250, color: "force"}]}
/>

<Ledger
  title="发电机总功率的去向"
  unit="W"
  digits={1}
  parts={[
    {label: "电热器", symbol: "P_热", expr: "Ph", color: "charge"},
    {label: "输电线", symbol: "P_线", expr: "Pline", color: "force"},
    {label: "发电机内阻", symbol: "P_r", expr: "Pr", color: "graphite"}
  ]}
  rows={[
    {label: "正常工作", at: {n: 4}, note: "4 只"},
    {label: "此刻", note: "当前只数"},
    {label: "功率最大", at: {n: 16}, note: "16 只"}
  ]}
  total={{label: "发电机总功率", symbol: "EI", expr: "Pgen"}}
  headline={{label: "效率", expr: "etaNow", format: "percent"}}
/>

点「正常工作：4 只」「最大功率：16 只」或「超过额定：1 只」跳到这三个状态。点击柱状图里的某一根柱，只数也跟着变。表盘指针落在 $200\ \text{V}$ 刻度上时，就是第（1）问的正常工作。

## 四、结合图像理解关键时刻

柱状图的横轴是只数。总功率从 $1$ 只时的约 $1384\ \text{W}$ 升到 $16$ 只时的 $6250\ \text{W}$，之后缓慢下降，$30$ 只时约 $5671\ \text{W}$。峰值附近很平：$15$ 只和 $17$ 只都约是 $6244\ \text{W}$，只比最大值少大约 $6\ \text{W}$，柱高几乎看不出差别。最大值的位置要靠「功率最大」标记，再用读数核对 $15$、$16$、$17$ 三根柱。

$4$ 只那根柱是正常工作，总功率 $4000\ \text{W}$，并不是最高的柱。表盘上这时刻度正对 $200\ \text{V}$。只数再少，指针进入 $200\ \text{V}$ 以上的色带，例如只接 $1$ 只时电压约 $235\ \text{V}$。只数再多，电压低于额定值，$16$ 只时只有 $125\ \text{V}$，每只功率约 $391\ \text{W}$，不到额定功率。

账本把 $EI$ 分成电热器、输电线和内阻三份。

| 状态 | $n$ | $U/\text{V}$ | $P_\text{热}/\text{W}$ | 输电线 $/\text{W}$ | 内阻 $/\text{W}$ | 效率 |
|---|---|---|---|---|---|---|
| 正常工作 | $4$ | $200$ | $4000$ | $800$ | $200$ | $80\%$ |
| 功率最大 | $16$ | $125$ | $6250$ | $5000$ | $1250$ | $50\%$ |

正常工作时，电热器并联电阻是 $10\ \Omega$，其余电阻只有 $2.5\ \Omega$，总功率的大部分落在电热器上，效率 $80\%$。加到 $16$ 只后，并联电阻降到 $2.5\ \Omega$，与 $R_0$ 相等，电热器功率达到 $6250\ \text{W}$，同时输电线加内阻也消耗 $6250\ \text{W}$，效率降到 $50\%$。电热器功率最大的只数，不是供热效率最高的只数。

## 五、答案汇总

| 小问 | 答案 |
|---|---|
| （1）正常工作的只数 | $4$ 只 |
| （2）供热效率 | $80\%$ |
| （3）最大总电功率 | $6250\ \text{W}$（接入 $16$ 只时） |
