---
id: gd22-12
title: 弹性导电绳的电阻与绳长
source: 2022 广东卷 第 12 题（实验；必考题共 42 分，原卷未单列本题分值）
question: "弹性导电绳逐步成为智能控制系统中部分传感器的敏感元件，某同学测量弹性导电绳的电阻与拉伸后绳长之间的关系，实验过程如下：（1）装置安装和电路连接；如图（a）所示，导电绳的一端固定，另一端作为拉伸端，两端分别用带有金属夹 A、B 的导线接入如图（b）所示的电路中。【图（a）】一块木板，右端标「木板」。木板上方一根水平的导电绳，标「导电绳」。左端固定在支架上的金属夹，标「金属夹A」，有导线引出；右端金属夹标「金属夹B」，夹子装在一个小滚轮上，也有导线引出。绳的正下方是一把刻度尺，标「刻度尺」。【图（b）】电路：电源 E 在左下方，与开关 S_1、滑动变阻器 R 串联，R 的滑片画在电阻丝右端，箭头向下接到下边的导线上。右侧竖直支路里有电流表，圆圈内标 A。电流表上端分成三条并联支路：最上是电压表，圆圈内标 V；中间是一个矩形电阻，标「定值电阻」；最下是矩形电阻，标「导电绳 R_x」，并与开关 S_2 串联。三条支路的左右端分别接在一起。【图（c）】R_x–L 图像。横轴 L/cm，标度 51.00、51.20、51.40、51.60、51.80、52.00，每 0.20 cm 分成 5 小格。纵轴 R_x/kΩ，标度 1.15、1.20、1.25、1.30、1.35、1.40，每 0.05 kΩ 分成 5 小格。一条直线从左下升到右上。直线附近有五个蓝点，按网格估读大约在 (51.10 cm, 1.16 kΩ)、(51.30 cm, 1.21 kΩ)、(51.50 cm, 1.26 kΩ)、(51.70 cm, 1.31 kΩ)、(51.90 cm, 1.35 kΩ)；前四个点在这条直线上，最右边一点略低于直线。直线延伸到横轴 52.00 cm 附近时，纵轴读数大约在 1.36 kΩ 与 1.37 kΩ 之间。（2）导电绳拉伸后的长度 L 及其电阻 R_x 的测量。①将导电绳拉伸后，用刻度尺测量并记录 A、B 间的距离，即为导电绳拉伸后的长度 L。②将滑动变阻器 R 的滑片滑到最右端。断开开关 S_2，闭合开关 S_1，调节 R，使电压表和电流表的指针偏转到合适位置。记录两表的示数 U 和 I_1。③闭合 S_2，电压表的示数____（选填“变大”或“变小”）。调节 R 使电压表的示数仍为 U，记录电流表的示数 I_2，则此时导电绳的电阻 R_x = ____（用 I_1、I_2 和 U 表示）。④断开 S_1，增大导电绳拉伸量，测量并记录 A、B 间的距离，重复步骤②和③。（3）该电压表内阻对导电绳电阻的测量值____（选填“有”或“无”）影响。（4）图11(c)是根据部分实验数据描绘的 R_x–L 图线。将该导电绳两端固定在某种机械臂上，当机械臂弯曲后，测得导电绳的电阻 R_x 为 1.33 kΩ，则由图线可读出导电绳拉伸后的长度为____cm，即为机械臂弯曲后的长度。"
answers:
  - { name: Rx, value: 1.25, unit: kΩ }
  - { name: noEffect, value: 1 }
  - { name: Larm, value: 51.78, unit: cm }
---

导电绳拉得越长，电阻越大。图（b）里电压表、定值电阻和「导电绳 R_x—S_2」三条支路并联，再与电流表串联；电源、开关 S_1 和滑动变阻器在另一侧，滑片接在下边导线上，按分压接法使用。题目没有给出电源、定值电阻和两次电流的具体数值，下面取一组代表性数值：电动势 6 V，定值电阻 2.5 kΩ，调节后保持的电压 U = 2.5 V。电压表按理想电表处理；改成有限内阻后，用同一套 I_1、I_2、U 算出的 R_x 不变。

## 完整解答

**（2）③ 电压表示数变小；$R_x = \dfrac{U}{I_2 - I_1}$。**

S_2 断开时，电流表只测定值电阻这一条支路：

$$I_1 = \frac{U}{R_0}$$

闭合 S_2 后，导电绳并到定值电阻上，并联总电阻变小。滑动变阻器还没动，分压电路分给这一组并联支路的电压就变小，电压表示数变小。

把滑片往回调，使电压表仍指在 U。此时电流表测的是两条支路的总电流：

$$I_2 = \frac{U}{R_0} + \frac{U}{R_x} = I_1 + \frac{U}{R_x}$$

多出来的电流就是导电绳上的电流，所以

$$\boxed{R_x = \dfrac{U}{I_2 - I_1}}$$

代表性数值下，定值电阻 2.5 kΩ、U = 2.5 V 时 I_1 = 1.0 mA；导电绳取 1.25 kΩ 时，绳上电流 2.0 mA，I_2 = 3.0 mA，代回上式得 1.25 kΩ。

**（3）电压表内阻对测量值无影响。**

电压表与定值电阻、导电绳并联，内阻有限时会多一条恒定的分流。两次测量保持同一电压 U：S_2 断开时电流表读到定值电阻与电压表的总电流 I_1，S_2 闭合后读到 I_2。多出来的 I_2 − I_1 仍是导电绳上的电流，内阻上的电流在相减时消掉。所以用 $U/(I_2-I_1)$ 得到的是导电绳电阻本身，不受电压表内阻影响。

**（4）拉伸后的长度为 51.78 cm。**

图（c）中前四个点正好在一条直线上：L 每增加 0.20 cm，R_x 增加 0.05 kΩ，斜率

$$k = \frac{0.05}{0.20} = 0.25\ \mathrm{k\Omega/cm}$$

过 (51.50 cm, 1.26 kΩ) 的直线为

$$R_x = 1.26 + 0.25\,(L - 51.50)$$

令 R_x = 1.33 kΩ：

$$1.33 = 1.26 + 0.25\,(L - 51.50)$$

$$\boxed{L = 51.78\ \mathrm{cm}}$$

最右边的 (51.90 cm, 1.35 kΩ) 略低于这条直线，直线在 52.00 cm 处约为 1.385 kΩ，落在题目所说的 1.36 kΩ 与 1.37 kΩ 之间附近。1.33 kΩ 落在 51.70 cm 与 51.80 cm 之间，每小格 0.04 cm，读到 51.78 cm。

## 交互演示

拖动绳长，画面里金属夹 B 随滚轮右移，刻度尺读出 A、B 间距离。电路按步骤切换：先断开 S_2 记下 I_1，再闭合 S_2，把电压调回原来的 U 后记下 I_2。电压表内阻可以改成有限，用来看测量值仍不变。图上的绳粗细和滚轮不按比例。

<Param name="L" label="拉伸后绳长 L" value={51.5} min={51} max={52} step={0.02} unit="cm" />

<Param name="step" label="测量步骤" value={1} options={[{value: 1, label: "S2 断开，记 I1"}, {value: 2, label: "刚闭合 S2"}, {value: 3, label: "调回 U，记 I2"}]} />

<Param name="Rv" label="电压表内阻" value={1e9} min={5} max={1e9} step={1} unit="kΩ" options={[{value: 1e9, label: "理想（无穷大）"}, {value: 10, label: "10 kΩ"}, {value: 5, label: "5 kΩ"}]} />

<Param name="E" label="电动势" value={6} hidden unit="V" />

<Param name="R0" label="定值电阻" value={2.5} hidden unit="kΩ" />

<Param name="U0" label="保持的电压 U" value={2.5} hidden unit="V" />

<Param name="k" label="图线斜率" value={0.25} hidden unit="kΩ/cm" />

<Param name="L0" label="参考绳长" value={51.5} hidden unit="cm" />

<Param name="Rref" label="参考电阻" value={1.26} hidden unit="kΩ" />

<Define name="Rx" expr="Rref + k*(L - L0)" />

<Define name="s2" expr="step == 1 ? 0 : 1" />

<Define name="U" expr="step == 2 ? Udrop : U0" />

<Define name="Udrop" expr="U0*0.8" />

<Define name="I1" expr="U0*(1/R0 + (Rv > 1e6 ? 0 : 1/Rv))" />

<Define name="I2" expr="U0*(1/R0 + 1/Rx + (Rv > 1e6 ? 0 : 1/Rv))" />

<Define name="Larm" expr="L0 + (1.33 - Rref)/k" />

<Define name="noEffect" expr="1" />

<Question text="闭合 S2 后，电压表示数怎样变？导电绳电阻怎么求？" set={{step: 2, L: 51.5, Rv: 1e9}} hint="并联后总电阻变小，分得的电压变小" />

<Question text="把电压调回 U 后，用 I1、I2、U 写出 Rx" set={{step: 3, L: 51.5, Rv: 1e9}} hint="Rx = U/(I2 - I1)" />

<Question text="电压表内阻对测量值有没有影响？" set={{step: 3, L: 51.5, Rv: 5}} hint="两次都在同一电压 U 下测，内阻的电流相减消掉" />

<Question text="Rx = 1.33 kΩ 时，图线上的绳长是多少？" set={{step: 3, L: 51.78, Rv: 1e9}} hint="前四个点的直线：每 0.20 cm 电阻增加 0.05 kΩ" />

<Preset label="答案：机械臂弯曲 51.78 cm" set={{L: 51.78, step: 3, Rv: 1e9}} />

<Preset label="回到刚闭合 S2" set={{L: 51.5, step: 2, Rv: 1e9}} />

<Status cases={[
  {when: "step < 1.5", label: "S2 断开：电流表只走定值电阻这一路", tone: "info"},
  {when: "step < 2.5", label: "刚闭合 S2：并联电阻变小，电压表示数变小", tone: "warning"},
  {label: "已调回 U：I2 - I1 就是导电绳上的电流", tone: "success"}
]} />

<Readout items={[
  {label: "导电绳电阻", symbol: "R_x", expr: "Rx", unit: "kΩ", digits: 3},
  {label: "电压表", symbol: "U", expr: "U", unit: "V", digits: 2},
  {label: "S2 断开时电流", symbol: "I_1", expr: "I1", unit: "mA", digits: 3},
  {label: "调回 U 后电流", symbol: "I_2", expr: "I2", unit: "mA", digits: 3},
  {label: "由 I1、I2 求得", symbol: "U/(I_2-I_1)", expr: "U0/(I2-I1)", unit: "kΩ", digits: 3},
  {label: "1.33 kΩ 对应绳长", symbol: "L", expr: "Larm", unit: "cm", digits: 2}
]} />

<Answer items={[
  {label: "闭合 S2 后电压表", text: "变小"},
  {label: "导电绳电阻", symbol: "R_x", text: "U/(I2 - I1)"},
  {label: "代表性数值下的电阻", symbol: "R_x", expr: "Rx", value: 1.25, unit: "kΩ", digits: 2},
  {label: "电压表内阻的影响", text: "无"},
  {label: "机械臂弯曲后的绳长", symbol: "L", expr: "Larm", value: 51.78, unit: "cm", digits: 2}
]} />

<Figure title="装置：导电绳与刻度尺" height={240} params={["L"]}
  note="绳粗细、滚轮和金属夹不按比例；刻度从 51.00 cm 起读，每小格 0.04 cm">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 50.86, xmax: 52.16, ymin: -0.62, ymax: 0.95 })
    v.block(m, 51.51, -0.5, 1.2, 0.12)
    v.label(m, 52.02, -0.42, '木板')
    v.wall(m, 51.0, -0.38, 0.42)
    v.sampleWire(m, 51.08, p.L, 0.22, { ruler: false, label: false, clips: true })
    v.circle(m, p.L + 0.035, 0.06, 0.035, { fill: v.color.steel, color: v.color.ink })
    v.label(m, 51.08, 0.48, 'A')
    v.label(m, p.L, 0.48, 'B')
    v.label(m, (51.08 + p.L) / 2, 0.72, '导电绳')
    v.ruler(m, 51, 52, -0.16, { step: 0.2, minor: 5, unit: 'cm', body: true })
    v.dim(m, 51.08, -0.36, p.L, -0.36, 'L')
  },
})
</Figure>

<Circuit
  title="测量电路"
  size="wide"
  source={{series: [
    {type: "battery", label: "E"},
    {type: "switch", label: "S_1", closed: true},
    {type: "rheostat", label: "R"}
  ]}}
  load={{series: [
    {type: "ammeter", label: "A"},
    {parallel: [
      {type: "voltmeter", label: "V", note: {expr: "U", unit: "V", prefix: "U = "}},
      {type: "resistor", label: "定值电阻"},
      {series: [
        {type: "resistor", label: "R_x", note: {expr: "Rx", unit: "kΩ", prefix: "R_x = "}},
        {type: "switch", label: "S_2", closed: "s2"}
      ]}
    ]}
  ]}}
  note="滑片接分压；刚闭合 S2 时滑片不动，电压表示数下降"
/>

<Plot
  title="R_x–L 图线"
  size="wide"
  caption="前四个点在直线上，最右一点略低；1.33 kΩ 对应 51.78 cm"
  x={{name: "L", label: "L", unit: "cm", min: 51, max: 52}}
  y={{label: "R_x", unit: "kΩ", min: 1.13, max: 1.42}}
  series={[
    {label: "图线", expr: "Rref + k*(L - L0)", color: "ink"},
    {label: "实测点", points: [[51.1, 1.16], [51.3, 1.21], [51.5, 1.26], [51.7, 1.31], [51.9, 1.35]], color: "field"},
    {label: "1.33 kΩ", points: [[51.78, 1.33]], marker: "cross", color: "force"}
  ]}
  marks={[{x: "Larm", label: "R_x = 1.33 kΩ，L = 51.78 cm"}]}
  cursor="L"
/>

## 结合图像看关键状态

拖动绳长时，游标沿着前四个点定出的直线移动。绳长从 51.50 cm 增到 51.70 cm，电阻从 1.26 kΩ 增到 1.31 kΩ，每 0.20 cm 对应 0.05 kΩ。把绳长放到 51.78 cm，游标正好落在 1.33 kΩ，这就是机械臂弯曲后的长度。最右边的实测点略低于直线，读数时以直线为准，不把这一点拉进拟合。

## 答案汇总

（2）③ 变小；$R_x = \dfrac{U}{I_2 - I_1}$。（3）无。（4）$51.78\ \mathrm{cm}$。
