---
id: r6-04-generator-heaters
title: 发电机给并联电热器供电：正常工作与最大供热功率
subject: physics
topic: 闭合电路欧姆定律与电功率
source: 2022 北大附中石景山学校期中
question: |
  （2022·北大附中石景山学校期中）一台直流发电机为保温室中的电热器供电。发电机电动势 E=250 V，内阻 r=0.50 Ω，输出端经两根输电线接到保温室，两根输电线的电阻 R₁=R₂=1.0 Ω。保温室中装有若干只完全相同的电热器，彼此并联，用来调节室温。每只电热器的额定电压为 200 V，额定功率为 1000 W。不计其他电阻，也不考虑电热器电阻随温度的变化。求：
  (1) 为使电热器能正常工作，应接入多少只电热器？
  (2) 电热器正常工作时，直流发电机对保温室供热的效率（电热器总功率与发电机总功率之比）；
  (3) 保温室内电热器可能消耗的最大总电功率。
answers:
  - { name: Rh, value: 40, unit: Ω }
  - { name: nNormal, value: 4, unit: 只 }
  - { name: INormal, value: 20, unit: A }
  - { name: PNormal, value: 4000, unit: W }
  - { name: PgenNormal, value: 5000, unit: W }
  - { name: etaNormal, value: 0.8, unit: "1" }
  - { name: nMax, value: 16, unit: 只 }
  - { name: UAtMax, value: 125, unit: V }
  - { name: Pmax, value: 6250, unit: W }
---

## 一、题目条件分析

电热器彼此并联，每只电热器两端的电压相同。设接入电热器的数量为 $n$，每只电热器的电阻为 $R_h$，保温室内的等效电阻为 $R_L$。

电热器电阻不随温度变化，因此可由额定值求得：

$$
R_h=\frac{U_N^2}{P_N}
=\frac{200^2}{1000}
=\boxed{40\ \Omega}.
$$

发电机内阻与两根输电线的电阻都和保温室串联，合计为

$$
R_s=r+R_1+R_2=0.50+1.0+1.0=\boxed{2.50\ \Omega}.
$$

接入 $n$ 只电热器时，

$$
R_L=\frac{R_h}{n}=\frac{40}{n}\ \Omega,
\qquad
I=\frac{E}{R_s+R_L},
\qquad
U=IR_L.
$$

这里 $U$ 是电热器两端的电压。发电机总功率为 $EI$，其中包括电热器获得的功率、输电线损耗和发电机内部损耗。

## 二、完整解答

### （1）正常工作时接入的只数

正常工作要求每只电热器两端的电压为 $200\ \text{V}$。此时内阻与输电线上的总电压降为

$$
E-U_N=250-200=\boxed{50\ \text{V}}.
$$

由串联部分的电压降求干路电流：

$$
I=\frac{E-U_N}{R_s}
=\frac{50}{2.50}
=\boxed{20\ \text{A}}.
$$

每只电热器正常工作时的电流为

$$
I_h=\frac{P_N}{U_N}
=\frac{1000}{200}
=\boxed{5\ \text{A}}.
$$

并联支路电流之和等于干路电流，因此

$$
n=\frac{I}{I_h}
=\frac{20}{5}
=\boxed{4\text{ 只}}.
$$

### （2）正常工作时的供热效率

4 只电热器的总功率为

$$
P_{\text{热}}=4P_N=\boxed{4000\ \text{W}}.
$$

发电机总功率为

$$
P_{\text{发}}=EI=250\times20=\boxed{5000\ \text{W}}.
$$

所以供热效率为

$$
\eta=\frac{P_{\text{热}}}{P_{\text{发}}}
=\frac{4000}{5000}
=\boxed{0.80=80\%}.
$$

也可以直接用 $P_{\text{热}}=UI$ 得到

$$
\eta=\frac{UI}{EI}=\frac{U}{E}=\frac{200}{250}=80\%.
$$

核对功率分配：

$$
P_{\text{线}}=I^2(R_1+R_2)=20^2\times2=\boxed{800\ \text{W}},
$$

$$
P_{\text{内}}=I^2r=20^2\times0.50=\boxed{200\ \text{W}}.
$$

三部分之和为 $4000+800+200=5000\ \text{W}$，与发电机总功率一致。

### （3）电热器可能消耗的最大总功率

将所有电热器看作一个等效电阻 $R_L$，其总功率为

$$
P_{\text{热}}
=I^2R_L
=\frac{E^2R_L}{(R_s+R_L)^2}.
$$

由于

$$
(R_s+R_L)^2-4R_sR_L=(R_s-R_L)^2\geqslant0,
$$

所以

$$
P_{\text{热}}\leqslant\frac{E^2}{4R_s}.
$$

等号成立的条件是

$$
R_L=R_s=\boxed{2.50\ \Omega}.
$$

对应的电热器数量为

$$
n=\frac{R_h}{R_L}
=\frac{40}{2.50}
=\boxed{16\text{ 只}}.
$$

16 是整数，因此该最大值能通过实际接入电热器实现：

$$
P_{\max}
=\frac{250^2}{4\times2.50}
=\boxed{6250\ \text{W}}.
$$

此时

$$
I=\frac{250}{2.50+2.50}=\boxed{50\ \text{A}},
\qquad
U=IR_L=50\times2.50=\boxed{125\ \text{V}}.
$$

每只电热器的实际功率为

$$
P_h=\frac{125^2}{40}=\boxed{390.625\ \text{W}}.
$$

虽然每只电热器低于额定功率，但 16 只合计的功率为 $16\times390.625=6250\ \text{W}$。

> **易错点**：求保温室获得的最大功率时，要把发电机内阻和两根输电线电阻一起计入 $R_s$。第（3）问没有要求电热器正常工作，不能把每只电热器的实际功率始终当作 $1000\ \text{W}$。

## 三、交互演示

拖动滑块改变并联电热器的数量，观察电热器电压、总供热功率与供热效率。初始状态对应第（1）、（2）问的答案。

<Param name="n" label="并联电热器数量 n" value={4} min={1} max={40} step={1} unit="只" />

<Define name="E" expr="250" />

<Define name="r" expr="0.50" />

<Define name="R1" expr="1.0" />

<Define name="R2" expr="1.0" />

<Define name="Un" expr="200" />

<Define name="Pn" expr="1000" />

<Define name="Rh" expr="Un^2 / Pn" />

<Define name="Rs" expr="r + R1 + R2" />

<Define name="RL" expr="Rh / n" />

<Define name="I" expr="E / (Rs + RL)" />

<Define name="U" expr="I * RL" />

<Define name="Pone" expr="U^2 / Rh" />

<Define name="Pheat" expr="n * Pone" />

<Define name="Pwire" expr="I^2 * (R1 + R2)" />

<Define name="Pinternal" expr="I^2 * r" />

<Define name="Pgen" expr="E * I" />

<Define name="eta" expr="Pheat / Pgen" />

<Define name="INormal" expr="(E - Un) / Rs" />

<Define name="nNormal" expr="INormal / (Pn / Un)" />

<Define name="PNormal" expr="nNormal * Pn" />

<Define name="PgenNormal" expr="E * INormal" />

<Define name="etaNormal" expr="PNormal / PgenNormal" />

<Define name="nMax" expr="Rh / Rs" />

<Define name="UAtMax" expr="E / 2" />

<Define name="Pmax" expr="E^2 / (4 * Rs)" />

<Preset label="答案（1）（2）：4 只，正常工作" set={{n: 4}} />

<Preset label="答案（3）：16 只，总供热功率最大" set={{n: 16}} />

<Status cases={[
  {when: "n < nNormal", label: "电热器电压超过额定值", tone: "warning"},
  {when: "n == nNormal", label: "每只电热器正常工作，供热效率为 80%", tone: "success"},
  {when: "n < nMax", label: "电压低于额定值，增加只数仍能提高总供热功率", tone: "info"},
  {when: "n == nMax", label: "总供热功率达到最大值，供热效率为 50%", tone: "success"},
  {label: "继续增加只数，总供热功率反而下降", tone: "neutral"}
]} />

<Circuit
  source={{series: [
    {type: "generator", label: "E = 250 V"},
    {type: "resistor", label: "r = 0.50 Ω"}
  ]}}
  load={{series: [
    {type: "resistor", label: "R₁ = 1.0 Ω"},
    {repeat: "n", label: "共 {n} 只并联", item: {
      type: "heater",
      label: "Rₕ = 40 Ω",
      note: {expr: "U", unit: "V", prefix: "U = "}
    }},
    {type: "resistor", label: "R₂ = 1.0 Ω"}
  ]}}
  current={{expr: "I", unit: "A", label: "I"}}
/>

<Readout items={[
  {label: "电热器等效电阻", expr: "RL", unit: "Ω", digits: 2},
  {label: "干路电流", expr: "I", unit: "A", digits: 2},
  {label: "每只电热器电压", expr: "U", unit: "V", digits: 2},
  {label: "每只电热器功率", expr: "Pone", unit: "W", digits: 2},
  {label: "电热器总供热功率", expr: "Pheat", unit: "W", digits: 2},
  {label: "输电线损耗", expr: "Pwire", unit: "W", digits: 2},
  {label: "发电机内部损耗", expr: "Pinternal", unit: "W", digits: 2},
  {label: "发电机总功率", expr: "Pgen", unit: "W", digits: 2},
  {label: "供热效率", expr: "100 * eta", unit: "%", digits: 1}
]} />

<Plot
  title="电热器总供热功率随并联只数变化"
  x={{name: "n", label: "并联只数 n", unit: "只", min: 1, max: 40}}
  y={{label: "总供热功率 P", unit: "W", min: 0, max: 7000}}
  series={[
    {label: "电热器总供热功率", expr: "E^2 * (Rh / n) / (Rs + Rh / n)^2", color: "orange"}
  ]}
  marks={[
    {x: "nNormal", series: 0, label: "4 只：正常工作，4000 W"},
    {x: "nMax", series: 0, label: "16 只：最大功率，6250 W"}
  ]}
  cursor="n"
/>

图中的连续曲线表示公式的数学延拓；实际电热器数量只能取正整数，滑块按整数变化。

## 四、结合图像理解关键状态

**4 只时：正常工作。** 电热器等效电阻为 $10\ \Omega$，电压为 $200\ \text{V}$，总供热功率为 $4000\ \text{W}$，效率为 $80\%$。

**从 4 只增加到 16 只：总供热功率上升。** 并联只数增加使等效电阻减小，干路电流增大，串联部分的电压降也增大。因此，每只电热器的电压和功率都下降，但这一阶段电热器数量增加的作用使总供热功率仍然上升。

**16 只时：曲线达到峰值。** 电热器等效电阻恰好等于 $R_s$，电热器与串联部分各分得一半电动势：

$$
U=125\ \text{V},
\qquad
P_{\text{热}}=6250\ \text{W}.
$$

此时供热效率为 $U/E=50\%$，电热器获得的功率与内阻、输电线的合计损耗相等。

**超过 16 只：总供热功率下降。** 电热器两端电压进一步降低，每只电热器功率的下降使总供热功率也开始下降。因此，并联电热器并非越多越能供热。

最大供热功率状态和正常工作状态对应不同的电热器数量；最大供热功率状态的效率也较低。

## 五、答案汇总

| 问题 | 答案 | 对应状态 |
|---|---|---|
| （1）正常工作应接入多少只 | $\boxed{4\text{ 只}}$ | 每只电热器电压为 $200\ \text{V}$ |
| （2）正常工作时供热效率 | $\boxed{80\%}$ | 电热器总功率 $4000\ \text{W}$，发电机总功率 $5000\ \text{W}$ |
| （3）最大总电功率 | $\boxed{6250\ \text{W}}$ | 接入 $16$ 只，每只电热器电压为 $125\ \text{V}$ |
