---
id: gd23-12
title: 测量盐水的电导率
source: 2023 广东卷 第 12 题（实验）
question: |
  某兴趣小组设计了测量盐水电导率的实验。所用器材有：电源 E（电动势恒定，内阻可忽略）；毫安表 mA（量程 15 mA，内阻可忽略）；电阻 R_1（阻值 500 Ω）、R_2（阻值 500 Ω）、R_3（阻值 600 Ω）和 R_4（阻值 200 Ω）；开关 S_1 和 S_2；装有耐腐蚀电极板和温度计的有机玻璃样品池；导线若干。请完成下列实验操作和计算。

  （1）电路连接

  图（a）为实验原理图．在图（b）的实物图中，已正确连接了部分电路，只有 R_4 一端的导线还未连接，该导线应接到 R_3 的________（填“左”或“右”）端接线柱

  【图（a）】电路原理图，从左到右：电池 E（正极在上）；样品池画成一个立体长方盒，在左侧干路上，盒内两块平行极板用引线标“电极板”；开关 S_1 在下方导线上。向右第一组并联：上支路只有 R_2，下支路是开关 S_2 与 R_1 串联。再向右第二组并联：一条支路是毫安表 mA 与 R_3 串联（mA 在上、R_3 在下），另一条支路只有 R_4。两组并联、样品池和电池串联成一个回路。

  【图（b）】实物接线。左侧是长方盒样品池，其下是电池 E，盒的左端标“+”、右端标“−”。样品池右侧是毫安表 mA，左接线柱旁标“+”。毫安表右上方是横向电阻 R_4，R_4 的右下方是横向电阻 R_3。中部是横向电阻 R_2，R_2 的右下方是横向电阻 R_1。下方偏左是单刀开关 S_1，其右侧是单刀开关 S_2。已接好的导线：样品池左端向下接到电池正极，电池负极接到 S_1 左端；样品池右端向右上方接到 R_4 左端，毫安表左端（+）也接在样品池右端与 R_4 左端之间的这段导线上；毫安表右端向右接到 R_3 左端；R_3 右端的导线向下弯，接到 R_1 右端；S_1 右端向右上方接到 R_2 左端，并与 S_2 左端相连，S_2 右端接到 R_1 左端；R_2 右端的导线向右，接到 R_1 右端与 R_3 右端相接的那一处。R_4 右端的导线向右伸出后再向下弯，末端悬空，停在 R_3 右侧附近，没有接到 R_3 或 R_1 的接线柱上。

  （2）盐水电导率和温度的测量

  ①测量并记录样品池内壁的长宽高．在样品池中注满待测盐水

  ②闭合开关 S_1，________开关 S_2，毫安表的示数为 10.0 mA，记录此时毫安表的示数；计算得到流过样品池的电流 I_1 为________ mA

  ③________开关 S_2，毫安表的示数为 15.0 mA，记录此时毫安表的示数；计算得到流过样品池的电流 I_2 为________ mA

  ④断开开关 S_1，测量并记录盐水的温度

  （3）根据上述数据，计算得到样品池两电极板间待测盐水的电阻为________ Ω，进而可求得该温度时待测盐水的电导率。
answers:
  - { name: side, value: 1 }
  - { name: s2open, value: 0 }
  - { name: I1, value: 40, unit: mA }
  - { name: s2close, value: 1 }
  - { name: I2, value: 60, unit: mA }
  - { name: Rx, value: 100, unit: Ω }
---

电源内阻可忽略，电动势恒定，但题目没给出数值；下面取代表性数值 $E = 6\,\mathrm{V}$，只用来让电表指针和电流粒子跟着开关走，不进答案。毫安表内阻可忽略。$R_1 = R_2 = 500\,\Omega$，$R_3 = 600\,\Omega$，$R_4 = 200\,\Omega$。样品池内壁的长、宽、高题目要求实测，没有给出；图上取代表性数值，并注明不按比例。

## 题目条件分析

回路从电池正极出发，依次经过样品池、两组并联，再由 $S_1$ 回到负极。

第一组并联：上支路只有 $R_2$，下支路是 $S_2$ 与 $R_1$ 串联。$S_2$ 断开时这一组只剩 $R_2 = 500\,\Omega$；闭合时 $R_1$ 与 $R_2$ 并联，等效电阻为 $250\,\Omega$。

第二组并联：一条支路是毫安表与 $R_3$ 串联（电表内阻可忽略，支路电阻就是 $600\,\Omega$），另一条只有 $R_4 = 200\,\Omega$。两支路电阻之比为 $3:1$，电流与电阻成反比，所以流过 $R_4$ 的电流是流过电表的 3 倍。这一组的总电流（也就是流过样品池的电流）是电表示数的 4 倍。

## 完整解答

### （1）导线接到 R_3 的哪一端

原理图上，毫安表与 $R_3$ 串联后，和 $R_4$ 并联。实物图上已接好的线是：毫安表右端接 $R_3$ 左端，$R_3$ 右端接到 $R_1$ 右端与 $R_2$ 右端的公共端。因在空中的是 $R_4$ 右端。

$R_4$ 左端已经和毫安表左端、样品池右端接在一起，这是并联的公共端。要让 $R_4$ 并在“毫安表 + $R_3$”两端，右端就应该接到这条支路的另一端，也就是 $R_3$ 的右端。

若接到 $R_3$ 左端，$R_4$ 两端就都接在电表左端，电表被短路，与原理图不符。

$$\boxed{\text{右}}$$

### （2）两次测量的操作和电流

电表量程是 15 mA。第一次示数 10.0 mA，第二次 15.0 mA，都没有超出量程。两次都要先闭合 $S_1$，电路才通。

第一次电表示数较小，对应第一组并联的电阻较大，所以断开 $S_2$：下支路不通，只有 $R_2$ 分流。第二次示数较大，对应闭合 $S_2$：$R_1$ 并上，总电阻减小，干路电流变大。测完再断开 $S_1$，读温度计。

第二组并联两支路电压相等，电流与电阻成反比：

$$
\frac{I_{R_4}}{I_{\mathrm{mA}}} = \frac{R_3}{R_4} = \frac{600}{200} = 3
$$

流过样品池的电流是两支路之和：

$$
I = I_{\mathrm{mA}} + I_{R_4} = 4\, I_{\mathrm{mA}}
$$

第一次电表示数 $10.0\,\mathrm{mA}$：

$$
I_1 = 4 \times 10.0\,\mathrm{mA} = \boxed{40.0\,\mathrm{mA}}
$$

第二次电表示数 $15.0\,\mathrm{mA}$：

$$
I_2 = 4 \times 15.0\,\mathrm{mA} = \boxed{60.0\,\mathrm{mA}}
$$

### （3）盐水的电阻

设两极板间盐水的电阻为 $R_x$。电源内阻可忽略，电动势恒定，两次测量的差别只在第一组并联。

断开 $S_2$ 时，第一组只有 $R_2 = 500\,\Omega$，第二组等效电阻

$$
R_{\mathrm{b}} = \frac{R_3 R_4}{R_3 + R_4} = \frac{600 \times 200}{800} = 150\,\Omega
$$

回路电压：

$$
E = I_1\,(R_x + R_2 + R_{\mathrm{b}})
$$

闭合 $S_2$ 时，$R_1$ 与 $R_2$ 并联，等效电阻 $250\,\Omega$：

$$
E = I_2\,(R_x + 250\,\Omega + R_{\mathrm{b}})
$$

两式相等，$E$ 消去。代入 $I_1 = 0.040\,\mathrm{A}$、$I_2 = 0.060\,\mathrm{A}$：

$$
0.040\,(R_x + 650) = 0.060\,(R_x + 400)
$$

$$
2(R_x + 650) = 3(R_x + 400)
$$

$$
R_x = 1300 - 1200 = \boxed{100\,\Omega}
$$

电导率还要用实测的长、宽、高：若极板间距为 $d$、正对面积为 $S$，则 $\sigma = d/(R_x S)$。题目没有给出尺寸，这一步只能留到公式。

## 交互演示

拖动下方的开关，看毫安表示数和流过样品池的电流怎么变。电流都由电路组件按图上的连线求出，不是用分流公式填进去的。电动势取 $6\,\mathrm{V}$ 只是代表值：这个值下，$S_2$ 断开时表的示数约为 $10\,\mathrm{mA}$，闭合时约为 $15\,\mathrm{mA}$，与题目记录的两次读数对得上。改盐水电阻会同时改变两次读数，但两次流过样品池的电流始终是当时表的示数的 4 倍。

样品池的长、宽、高可以拖，电导率按 $\sigma = d/(R_x S)$ 跟着变。尺寸是代表值，图不按比例。

<Question text="（1）R_4 未接的那一端应接到 R_3 的哪一端？" set={{s1: 1, s2: 0, side: 1}} hint="接到右端才和毫安表、R_3 并联" />

<Question text="（2）闭合 S_1、断开 S_2，表的示数 10.0 mA，求 I_1" set={{s1: 1, s2: 0, side: 1}} hint="断开 S_2，只有 R_2。样品池电流是表的示数的 4 倍" />

<Question text="（2）闭合 S_2，表的示数 15.0 mA，求 I_2" set={{s1: 1, s2: 1, side: 1}} hint="闭合 S_2，R_1 与 R_2 并联。样品池电流仍是表的示数的 4 倍" />

<Question text="（3）由两次测量求盐水的电阻" set={{s1: 1, s2: 1, side: 1}} hint="两次的电动势相等，消去 E 得 R_x = 100 Ω" />

<Param name="s1" label="开关 S_1" options={[{value: 0, label: "断开"}, {value: 1, label: "闭合"}]} value={1} />

<Param name="s2" label="开关 S_2" options={[{value: 0, label: "断开"}, {value: 1, label: "闭合"}]} value={0} />

<Param name="side" label="R_4 右端接到" options={[{value: 0, label: "未接"}, {value: 1, label: "R_3 右端"}, {value: 2, label: "R_3 左端"}]} value={1} />

<Param name="E" label="电动势（代表值）" value={6} min={3} max={9} step={0.1} unit="V" />

<Param name="L" label="内壁长（代表值）" value={4} min={2} max={8} step={0.1} unit="cm" />

<Param name="W" label="内壁宽（代表值）" value={2} min={1} max={4} step={0.1} unit="cm" />

<Param name="H" label="内壁高（代表值）" value={3} min={1} max={5} step={0.1} unit="cm" />

<Param name="T" label="盐水温度" value={25} min={10} max={60} step={1} unit="℃" />

<Define name="s2open" expr="0" />

<Define name="s2close" expr="1" />

<Define name="I1" expr="40" />

<Define name="I2" expr="60" />

<Define name="Rx" expr="100" />

<Define name="Rb" expr="150" />

<Define name="sigma" expr="(H/100) / (Rx * (L/100) * (W/100))" />

<Preset label="第一次：S_2 断开，表 10 mA" set={{s1: 1, s2: 0, side: 1}} />

<Preset label="第二次：S_2 闭合，表 15 mA" set={{s1: 1, s2: 1, side: 1}} />

<Preset label="接错：R_4 接到 R_3 左端" set={{s1: 1, s2: 0, side: 2}} />

<Status cases={[
  {when: "side == 0", label: "R_4 右端还悬着，电表支路没有并联分流", tone: "warning"},
  {when: "side == 2", label: "接到了 R_3 左端：电表被 R_4 短路", tone: "danger"},
  {when: "s1 == 0", label: "S_1 断开，电路不通，可以读温度", tone: "info"},
  {when: "s2 == 0", label: "S_2 断开：只有 R_2，表的示数约 10 mA，I_1 = 40 mA", tone: "success"},
  {label: "S_2 闭合：R_1 并上，表的示数约 15 mA，I_2 = 60 mA", tone: "success"}
]} />

<Readout items={[
  {label: "毫安表示数", symbol: "I_mA", expr: "ImA * 1000", unit: "mA", digits: 2, color: "velocity"},
  {label: "流过样品池的电流", symbol: "I", expr: "Icell * 1000", unit: "mA", digits: 2, color: "charge"},
  {label: "盐水电阻", symbol: "R_x", expr: "Rx", unit: "Ω", digits: 0},
  {label: "电导率（代表尺寸）", symbol: "σ", expr: "sigma", unit: "S/m", digits: 2, color: "field"}
]} />

<Answer title="本题答案" items={[
  {label: "（1）导线接到 R_3 的", text: "右端"},
  {label: "（2）S_2 的操作", text: "先断开，再闭合"},
  {label: "（2）流过样品池的电流", symbol: "I_1", expr: "I1", value: 40, unit: "mA"},
  {label: "（2）流过样品池的电流", symbol: "I_2", expr: "I2", value: 60, unit: "mA"},
  {label: "（3）盐水的电阻", symbol: "R_x", expr: "Rx", value: 100, unit: "Ω"}
]} />

<Circuit
  title="原理图（a）"
  size="full"
  source={{series: [
    {type: "battery", emf: "E", r: 0, label: "E"},
    {type: "switch", label: "S_1", closed: "s1 == 1"}
  ]}}
  load={{series: [
    {type: "resistor", R: "Rx", label: "盐水", read: {I: "Icell", U: "Ucell"}},
    {parallel: [
      {type: "resistor", R: 500, label: "R_2"},
      {series: [
        {type: "switch", label: "S_2", closed: "s2 == 1"},
        {type: "resistor", R: 500, label: "R_1"}
      ]}
    ]},
    {parallel: [
      {series: [
        {type: "ammeter", label: "mA", r: 0, read: "ImA"},
        {type: "resistor", R: 600, label: "R_3"}
      ]},
      {type: "resistor", R: 200, label: "R_4"}
    ]}
  ]}}
  current={{expr: "Icell", unit: "A", label: "I"}}
  flow={{expr: "Icell", ref: 0.04}}
  note="电动势取代表值 6 V：S_2 断开时表约 10 mA，闭合时约 15 mA"
/>

<Wiring
  title="实物图（b）"
  size="full"
  height={460}
  note="悬空的是 R_4 右端。接到 R_3 右端才和“毫安表 + R_3”并联"
  parts={[
    {id: "cell", type: "resistor", R: "Rx", label: "样品池", x: 70, y: 70, read: {I: "IcellW"}},
    {id: "mA", type: "ammeter", ranges: [0.015], r: 0, label: "mA", x: 250, y: 70, read: "ImAW"},
    {id: "R4", type: "resistor", R: 200, label: "R_4", x: 430, y: 55},
    {id: "R3", type: "resistor", R: 600, label: "R_3", x: 430, y: 175},
    {id: "R2", type: "resistor", R: 500, label: "R_2", x: 250, y: 250},
    {id: "R1", type: "resistor", R: 500, label: "R_1", x: 430, y: 320},
    {id: "S1", type: "switch", label: "S_1", closed: "s1 == 1", x: 70, y: 360},
    {id: "S2", type: "switch", label: "S_2", closed: "s2 == 1", x: 250, y: 360},
    {id: "E", type: "battery", emf: "E", r: 0, positive: "left", label: "E", x: 70, y: 250}
  ]}
  wires={[
    {from: "cell.a", to: "E.+"},
    {from: "E.-", to: "S1.a"},
    {from: "cell.b", to: "R4.a"},
    {from: "cell.b", to: "mA.0.015"},
    {from: "mA.-", to: "R3.a"},
    {from: "R3.b", to: "R1.b"},
    {from: "S1.b", to: "R2.a"},
    {from: "S1.b", to: "S2.a"},
    {from: "S2.b", to: "R1.a"},
    {from: "R2.b", to: "R1.b"},
    {from: "R4.b", to: "R3.b", when: "side == 1"},
    {from: "R4.b", to: "R3.a", when: "side == 2"}
  ]}
/>

<Figure title="样品池" height={320} size="wide" params={["L", "W", "H", "T", "Icell", "s1"]} note="尺寸为代表值，不按比例。温度计插在池内，S_1 断开后再读" hud={[{symbol: "T", label: "温度", expr: "T", unit: "℃", digits: 0}]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 12, ymin: 0, ymax: 10.4, equal: true })
    const x0 = 1.6
    const y0 = 1.5
    const L = 5.4
    const H = 4.2
    v.vessel(m, [{ x1: x0, y1: y0, x2: x0 + L, y2: y0 + H, open: 'top' }], {
      fills: [{ kind: 'water', x1: x0, y1: y0, x2: x0 + L, y2: y0 + H * 0.92 }],
    })
    v.plates(m, x0 + 1.1, x0 + L - 1.1, y0 + H * 0.78, y0 + 0.7, { signs: false })
    v.label(m, x0 + L / 2, y0 + H * 0.48, '电极板')
    v.dim(m, x0, y0 - 0.55, x0 + L, y0 - 0.55, 'L')
    v.dim(m, x0 + L + 0.55, y0, x0 + L + 0.55, y0 + H, 'H')
    v.ruler(m, x0, x0 + L, y0 + H + 0.15, { step: 1, unit: 'cm', body: true })
    const tx = x0 + L - 1.15
    const ty = y0 + H + 0.35
    v.vessel(m, [{ capillary: { x: tx, y1: y0 + 1.3, y2: ty + 2.5, w: 0.28 } }])
    v.circle(m, tx, ty + 2.85, 0.42, { fill: v.color.enamel, color: v.color.steel })
    v.label(m, tx + 0.85, ty + 2.7, 'T')
    if (p.s1 > 0.5 && p.Icell > 1e-6) {
      v.arrow(m, x0 + 1.7, y0 + 0.85, x0 + L - 1.7, y0 + 0.85, { color: v.color.charge })
      v.label(m, x0 + L / 2, y0 + 1.45, 'I')
    }
  },
})
</Figure>

<Plot
  title="两次测量的电流"
  size="narrow"
  caption="横轴 0 是 S_2 断开，1 是闭合。盐水电流始终是表的示数的 4 倍"
  x={{name: "k", label: "S_2", min: 0, max: 1}}
  y={{label: "I", unit: "mA", min: 0, max: 70}}
  series={[
    {label: "表的示数", expr: "10 + 5*k", color: "velocity", dash: true},
    {label: "样品池电流", expr: "40 + 20*k", color: "charge"}
  ]}
  marks={[
    {x: 0, label: "I_1 = 40 mA"},
    {x: 1, label: "I_2 = 60 mA"}
  ]}
  cursor="s2"
/>

## 结合图像理解

原理图上，毫安表和 $R_3$ 串在一条支路，$R_4$ 单独成另一条。两支路电阻 $600\,\Omega$ 与 $200\,\Omega$，电流比是 $1:3$。所以不论 $S_2$ 断开还是闭合，流过样品池的电流都是表的示数的 4 倍。曲线上两条线的纵坐标比始终是 $4:1$。

$S_2$ 闭合后，第一组并联由 $500\,\Omega$ 变成 $250\,\Omega$，回路总电阻减小，两条线一起升高。电动势两次相同，把两次的回路方程相减，就消去了未知的 $E$，得到 $R_x = 100\,\Omega$。

实物图上把 $R_4$ 右端改接到 $R_3$ 左端，电表读数掉到 0：$R_4$ 把电表短路了，这不是原理图要的并联。
