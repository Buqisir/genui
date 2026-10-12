---
id: gz-generator-heaters
title: 发电机与电热器
subject: physics
topic: 闭合电路欧姆定律与电功率
source: 2022 北大附中石景山学校期中
breadcrumb: ["必修 3", "闭合电路欧姆定律", "计算题"]
question: |
  一台直流发电机为保温室中的电热器供电。发电机电动势 E=250 V，内阻 r=0.50 Ω，输出端经两根输电线接到保温室，两根输电线的电阻 R₁=R₂=1.0 Ω。保温室中装有若干只完全相同的电热器，彼此并联。每只电热器的额定电压为 200 V，额定功率为 1000 W。不计其他电阻，也不考虑电热器电阻随温度的变化。求：
  (1) 为使电热器能正常工作，应接入多少只电热器？
  (2) 电热器正常工作时，直流发电机对保温室供热的效率（电热器总功率与发电机总功率之比）；
  (3) 保温室内电热器可能消耗的最大总电功率。
answers:
  - { name: Rh, value: 40, unit: Ω }
  - { name: nNormal, value: 4, unit: 只 }
  - { name: etaNormal, value: 0.8 }
  - { name: nMax, value: 16, unit: 只 }
  - { name: Pmax, value: 6250, unit: W }
---

<Question text="为使电热器正常工作，应接入多少只？" set={{n: 4, E: 250, Rw: 1}} hint="正常工作 = 每只两端 200 V。先求干路电流。" />

<Question text="正常工作时，发电机对保温室供热的效率？" set={{n: 4, E: 250, Rw: 1}} />

<Question text="电热器可能消耗的最大总功率？" set={{n: 16, E: 250, Rw: 1}} hint="把所有电热器看成一个电阻 R_L，什么时候 I²R_L 最大？" />

<Param name="n" label="电热器只数" symbol="n" value={4} min={1} max={30} step={1} unit="只" control="stepper" />

<Param name="E" label="电动势" symbol="E" value={250} min={150} max={350} step={5} unit="V" digits={0} />

<Param name="Rw" label="每根输电线" symbol="R_线" value={1} min={0} max={3} step={0.1} unit="Ω" />

<Param name="r" label="内阻" value={0.5} hidden />

<Param name="Un" label="额定电压" value={200} hidden />

<Param name="Pn" label="额定功率" value={1000} hidden />

<Preset label="正常工作 · 4 只" set={{n: 4, E: 250, Rw: 1}} />

<Preset label="功率最大 · 16 只" set={{n: 16, E: 250, Rw: 1}} />

<Preset label="只接 1 只" set={{n: 1, E: 250, Rw: 1}} />

<Define name="Rh" expr="Un^2/Pn" />

<Define name="Rs" expr="r + 2*Rw" />

<Define name="Pheat" expr="U*I" />

<Define name="Pwire" expr="I^2*2*Rw" />

<Define name="Pinternal" expr="I^2*r" />

<Define name="Pgen" expr="E*I" />

<Define name="eta" expr="Pheat/Pgen" />

<Define name="nNormal" expr="((E - Un)/Rs)/(Pn/Un)" />

<Define name="etaNormal" expr="Un/E" />

<Define name="nMax" expr="Rh/Rs" />

<Define name="Pmax" expr="E^2/(4*Rs)" />

<Status cases={[
  {when: "abs(U - Un) < 1", label: "额定电压，正常工作", tone: "success"},
  {when: "U > Un", label: "超过额定电压，电热器会烧坏", tone: "danger"},
  {when: "abs(n - round(nMax)) < 0.5", label: "外电阻 ≈ 内电阻，总功率最大", tone: "warning"},
  {when: "n < nMax", label: "低于额定电压，多接几只总功率还会上升", tone: "info"},
  {label: "接得太多，总功率反而下降", tone: "neutral"}
]} />

<Readout items={[
  {label: "干路", symbol: "I", color: "charge", expr: "I", unit: "A", digits: 0},
  {label: "保温室", symbol: "U", expr: "U", unit: "V", digits: 0},
  {label: "电热器", symbol: "P", color: "force", expr: "Pheat", unit: "W", digits: 0}
]} />

<Answer items={[
  {label: "(1) 只数", expr: "nNormal", value: 4, unit: "只", digits: 0},
  {label: "(2) 效率", symbol: "η", expr: "etaNormal", value: 0.8, format: "percent", digits: 0},
  {label: "(3) 最大功率", symbol: "P", expr: "Pmax", value: 6250, unit: "W", digits: 0}
]} />

<Circuit
  source={{series: [
    {type: "generator", label: "E", emf: "E", r: 0, read: {I: "I"}, note: {expr: "E", unit: "V", digits: 0}},
    {type: "resistor", label: "r", R: "r", note: {expr: "r", unit: "Ω"}}
  ]}}
  load={{series: [
    {type: "resistor", label: "R₁", R: "Rw", note: {expr: "Rw", unit: "Ω"}},
    {repeat: "n", label: "共 {n} 只并联", item: {type: "heater", label: "40 Ω", R: "Rh", read: {I: "Ih", U: "U"}, note: {expr: "Ih", unit: "A"}}},
    {type: "resistor", label: "R₂", R: "Rw", note: {expr: "Rw", unit: "Ω"}}
  ]}}
  current={{expr: "I", unit: "A", label: "I", digits: 0}}
  flow={{expr: "I", ref: 20}}
  layout="ladder"
  box={{label: "保温室"}}
  hud={[{symbol: "n", expr: "n", unit: "只", digits: 0}]}
  legend={[
    {kind: "charge", symbol: "I", label: "电流 · 越密越快"},
    {kind: "force", symbol: "Q", label: "发热"}
  ]}
  note="每只电热器 200 V · 1000 W，彼此并联；超过 5 只时只画前三只和最后一只。"
/>

<Bars
  title="P – n"
  caption="外电阻等于内电阻时功率最大"
  x={{name: "k", label: "n", unit: "只", min: 1, max: 30}}
  y={{label: "P", unit: "W", min: 0}}
  expr="E^2*(Rh/k)/(Rs + Rh/k)^2"
  cursor="n"
  marks={[
    {x: "round(nNormal)", label: "正常", style: "solid"},
    {x: "round(nMax)", label: "最大", style: "outline"}
  ]}
  color="force"
/>

<Ledger
  title="能量去向"
  parts={[
    {label: "电热器", expr: "Pheat", color: "force"},
    {label: "输电线", expr: "Pwire", color: "steel"},
    {label: "发电机内阻", expr: "Pinternal", color: "graphite"}
  ]}
  headline={{symbol: "η", label: "送进保温室", expr: "eta", format: "percent", digits: 0}}
  total={{expr: "Pgen"}}
  unit="W"
  digits={0}
/>

## 一、题目条件分析

电热器并联，两端电压相同。设接入 $n$ 只，每只电阻 $R_h=\dfrac{U_N^2}{P_N}=\dfrac{200^2}{1000}=\boxed{40\ \Omega}$，并联后 $R_L=\dfrac{40}{n}\ \Omega$。

发电机内阻和两根输电线都与保温室串联：$R_s=r+R_1+R_2=\boxed{2.50\ \Omega}$。于是

$$
I=\frac{E}{R_s+R_L},\qquad U=IR_L.
$$

## 二、完整解答

### （1）正常工作时接入的只数

正常工作要求 $U=200\ \text{V}$，串联部分分到 $E-U_N=50\ \text{V}$：

$$
I=\frac{E-U_N}{R_s}=\frac{50}{2.50}=\boxed{20\ \text{A}},\qquad I_h=\frac{P_N}{U_N}=5\ \text{A},\qquad n=\frac{I}{I_h}=\boxed{4\text{ 只}}.
$$

### （2）正常工作时的供热效率

$$
\eta=\frac{UI}{EI}=\frac{U}{E}=\frac{200}{250}=\boxed{80\%}.
$$

核对：电热器 $4000\ \text{W}$，输电线 $I^2(R_1+R_2)=800\ \text{W}$，内阻 $I^2r=200\ \text{W}$，合计 $5000\ \text{W}=EI$。

### （3）最大总功率

$$
P_{\text{热}}=\frac{E^2R_L}{(R_s+R_L)^2}\leqslant\frac{E^2}{4R_s},
$$

因为 $(R_s+R_L)^2-4R_sR_L=(R_s-R_L)^2\geqslant0$。等号在 $R_L=R_s=2.50\ \Omega$ 时成立，即 $n=40/2.50=16$ 只，恰好是整数：

$$
P_{\max}=\frac{250^2}{4\times2.50}=\boxed{6250\ \text{W}}.
$$

此时 $I=50\ \text{A}$，$U=125\ \text{V}$，效率只有 $50\%$。每只电热器只有 $390.6\ \text{W}$，但 16 只合计最大。

> **易错点**：$R_s$ 要把内阻和两根输电线都算上。第（3）问不要求正常工作，不能把每只的功率当作 $1000\ \text{W}$。

**看图理解**：柱状图从 4 只升到 16 只是因为只数增加的作用大于每只电压下降；过了 16 只，每只电压降得更快，总功率反而下降。点电路下方的 −/+，看电流粒子变密，能量账本里输电线和内阻的份额同时变大。
