---
id: gd24-12
title: 太阳能电池板跟踪光源
source: 2024 广东卷 第 12 题（实验）
question: |
  某科技小组模仿太阳能发电中的太阳光自动跟踪系统，制作光源跟踪演示装置，实现太阳能电池板方向的调整，使电池板正对光源。图甲是光照方向检测电路。所用器材有：电源 E（电动势 3V）电压表（V_1）和（V_2）（量程均有 3V 和 15V，内阻均可视为无穷大）：滑动变阻器 R：两个相同的光敏电阻 R_{G1} 和 R_{G2}；开关 S：手电筒：导线若干。图乙是实物图。图中电池板上垂直安装有半透明隔板，隔板两侧装有光敏电阻，电池板固定在电动机转轴上。控制单元与检测电路的连接未画出。控制单元对光照方向检测电路无影响。请完成下列实验操作和判断。

  【图甲】电路图。左侧电源 E，长极板在上、短极板在下，下端串联一个断开的开关 S，二者接在上、下两条水平导线之间。中部滑动变阻器 R 竖直接在这两条导线之间，上端标 a、下端标 b；滑片箭头从右侧指向电阻丝，滑片的导线向右接到右侧电路的中点。右侧上下两段串联后也接在两条水平导线之间：上段是电压表 V_1 与光敏电阻 R_{G1} 并联，下段是电压表 V_2 与光敏电阻 R_{G2} 并联。光敏电阻画成矩形，旁边有两支指向矩形的箭头。上下两段的连接点与 R 的滑片相连。

  【图乙】实物图。左侧虚线框内，自上而下是：水平放置的滑动变阻器 R（滑片在电阻上方）、电压表 V_1、电源 E、开关 S、电压表 V_2。两只电压表的表盘上都能看到量程 3 和 15，左侧接线柱旁标“−”。框内已画出的导线有：R 两端接线柱各有导线向右穿出虚线框，接到右侧电池板；E 的一个接线柱用导线接到 S；S 的另一侧有导线向右；V_1、V_2 的接线柱上也各有导线引出。虚线框内 R、E、S 与两只电压表之间的连线没有画完。框外右侧是一块倾斜的矩形电池板，板面上有一块与板面垂直的隔板，隔板一侧标 R_{G1}、另一侧标 R_{G2}。电池板中心固定在电动机转轴上，电动机标“电动机”，其下方标“控制单元”。

  【图丙】一只电压表的表盘。上排刻度标 0、5、10、15，下排刻度标 0、1、2、3，两排共用同一组刻线。下排相邻两个整数之间有 10 个小格。5 与 10 的中点、同时也是 1 与 2 的中点，有一条较长的刻线；指针指在这条长刻线右侧紧邻的第一条小刻线上。

  （1）电路连接。

  图乙中已正确连接了部分电路，请完成虚线框中滑动变阻器 R、电源 E、开关 S 和电压表（V）间的实物图连线_____。

  （2）光敏电阻阻值与光照强度关系测试。

  ①将图甲中 R 的滑片置于_____端。用手电筒的光斜照射到 R_{G1} 和 R_{G2}，使 R_{G1} 表面的光照强度比 R_{G2} 表面的小。

  ②闭合 S，将 R 的滑片缓慢滑到某一位置。（V）的示数如图丙所示，读数 U_1 为_____V，U_2 的示数为 1.17V。由此可知，表面光照强度较小的光敏电阻的阻值_____（填“较大”或“较小”）。

  ③断开 S。

  （3）光源跟踪测试。

  ①将手电筒的光从电池板上方斜照射到 R_{G1} 和 R_{C2}。②闭合 S。并启动控制单元。控制单元检测并比较两光敏电阻的电压，控制电动机转动。此时两电压表的示数 U_1 < U_2，图乙中的电动机带动电池板_____（填“逆时针”或“顺时针”）转动，直至_____时停止转动，电池板正对手电筒发出的光
answers:
  - { name: U1, value: 1.6, unit: V }
  - { name: U2, value: 1.17, unit: V }
  - { name: phiStop, value: 90, unit: ° }
---

图甲是分压电路：电源 E 串联开关 S 后接在滑动变阻器 R 的 a、b 两端，滑片接到 R_{G1}、R_{G2} 的连接点。两只相同的光敏电阻串联后并在 R 上，V_1 测 R_{G1} 的电压，V_2 测 R_{G2} 的电压。电压表内阻视为无穷大，不分流。

图乙里虚线框外已经接好：R 两端穿出框外接到电池板上的 R_{G1}、R_{G2}，E 的一个接线柱已经接到 S。框内还缺的是主回路和两只电压表的表线。图丙是闭合 S 后 V_1 的表盘，上排 0–15 V、下排 0–3 V，两排共用刻线，下排每 1 V 分 10 小格。

电源电动势只给了 3 V，没有给 R、R_{G1}、R_{G2} 的阻值。下面取代表性数值：滑动变阻器总阻值 20 Ω，较强光照时光敏电阻 30 Ω，较弱光照时 50 Ω。电阻比例和电压比例不依赖这些取值，只用来把读数和转向画出来。

## 完整解答

### （1）补全虚线框内的导线

照图甲补线，并保持图乙已有的线不动。

- E 的正极接 S 的一端。这根线图乙里已经画好，电源正极在上。
- S 的另一端接到 R 右端的下方接线柱（图甲的 a 端，电源正极一侧）。
- E 的负极接到 R 左端的下方接线柱（图甲的 b 端）。R 的两个下方接线柱都进主回路。
- R 的滑片接线柱接到 V_1、V_2 的“−”接线柱。这一点就是图甲里两只光敏电阻的连接点。
- V_1 的“3 V”接线柱接到 R 右端穿出框外的那根线上，并在 R_{G1} 上；V_2 的“3 V”接线柱接到 R 左端穿出框外的那根线上，并在 R_{G2} 上。

电源电动势只有 3 V，两只表都用 3 V 量程。两只表的“−”都在滑片一侧，电流从量程接线柱流入、从“−”流出，指针正向偏转。

### （2）滑片位置、读数和阻值

① 滑片先放在 $\boxed{b}$ 端。此时滑片与 b 端相接，R_{G1}、R_{G2} 这一侧电压为 0，闭合 S 不会出现过大的电压和电流。再把滑片缓慢移向 a 端，两只光敏电阻上的电压才从 0 漸渐增大。

② 电源只有 3 V，图丙按 3 V 量程读。下排每 1 V 分 10 小格，最小分度 0.1 V，要估读到下一位。5 与 10 的中点就是下排 1.5 V，指针在它右侧紧邻的第一条小刻线上，读数

$$
U_1 = 1.50\,\mathrm{V} + 1 \times 0.10\,\mathrm{V} = \boxed{1.60\,\mathrm{V}}
$$

题目已给 $U_2 = \boxed{1.17\,\mathrm{V}}$。两只光敏电阻串联，通过它们的电流相同，所以

$$
\frac{R_{G1}}{R_{G2}} = \frac{U_1}{U_2} = \frac{1.60}{1.17} > 1
$$

R_{G1} 的光照较弱，它的电压反而更大，因此表面光照较弱的光敏电阻阻值 $\boxed{\text{较大}}$。光敏电阻的阻值随光照增强而减小。

③ 测完断开 S。

### （3）电池板怎么转

手电筒从电池板上方斜照过来。图乙里电池板从左下向右上倾斜，隔板与板面垂直：R_{G1} 在隔板左侧，R_{G2} 在右侧。

此时 $U_1 < U_2$。两只光敏电阻串联，电压大的那只阻值大。由第（2）问，阻值大表示光照弱，所以 R_{G2} 光照较弱、R_{G1} 光照较强，光来自 R_{G1} 这一侧。

要让电池板正对光源，电动机带动电池板从图乙位置按 $\boxed{\text{顺时针}}$ 转动，把板面转向光照较强的 R_{G1} 一侧。隔板原来与板面垂直，板面正对光源时隔板正好挡住从上方斜照过来的光，两侧光照相同，两表示数相等，电动机停止。从图乙的倾斜位置转到这个位置，电池板 $\boxed{\text{转过 } 90^\circ}$。

## 交互演示

拖动滑片，看两只表的示数怎么从 0 增大；再调整两侧光照，看电压和阻值谁大谁小。点「图丙读数」时，R_{G1} 取较弱光照、R_{G2} 取较强光照，滑片停在使 U_1 = 1.60 V 的位置。点「U_1 < U_2」时，光照对调，电池板按顺时针转到正对光源。

<Question text="（1）虚线框内还缺哪几根导线？" set={{stage: 1, p: 0, strong: 1}} hint="正极经 S 接 a 端，负极接 b 端，滑片接两表的负极" />

<Question text="（2）滑片放哪端，U_1 读多少？" set={{stage: 2, p: 0.6, strong: 1}} hint="先放 b 端；3 V 量程读到 1.60 V" />

<Question text="（3）U_1 < U_2 时电池板怎么转？" set={{stage: 3, p: 0.6, strong: 2}} hint="R_{G1} 光照更强，顺时针转过 90°" />

<Param name="stage" label="小问" value={2} options={[{value: 1, label: "（1）连线"}, {value: 2, label: "（2）读数"}, {value: 3, label: "（3）跟踪"}]} />

<Param name="p" label="滑片离 b 端" symbol="p" value={0.6} min={0} max={1} step={0.01} />

<Param name="strong" label="较强的光照" value={1} options={[{value: 1, label: "R_{G2} 较强"}, {value: 2, label: "R_{G1} 较强"}]} />

<Param name="E" value={3} hidden />

<Param name="Rtot" value={20} hidden />

<Param name="Rweak" value={50} hidden />

<Param name="Rbright" value={30} hidden />

<Define name="Rg1" expr="strong == 2 ? Rbright : Rweak" />

<Define name="Rg2" expr="strong == 2 ? Rweak : Rbright" />

<Define name="pRead" expr="0.6" />

<Define name="U1" expr="(stage == 2 and abs(p - pRead) < 0.005 and strong == 1) ? 1.60 : U1w" />

<Define name="U2" expr="(stage == 2 and abs(p - pRead) < 0.005 and strong == 1) ? 1.17 : U2w" />

<Define name="phiStop" expr="90" />

<Define name="ratio" expr="U2 > 0 ? U1/U2 : 0" />

<Circuit
  title="图甲 光照方向检测电路"
  size="wide"
  source={{
    series: [
      {type: "battery", label: "E", positive: "left"},
      {type: "switch", label: "S", closed: true}
    ]
  }}
  load={{
    series: [
      {type: "rheostat", label: "R"},
      {
        parallel: [
          {type: "photoresistor", label: "R_{G1}"},
          {type: "voltmeter", label: "V_1"}
        ]
      },
      {
        parallel: [
          {type: "photoresistor", label: "R_{G2}"},
          {type: "voltmeter", label: "V_2"}
        ]
      }
    ]
  }}
  note="原理图按左右展开：R 的滑片接到两只光敏电阻的连接点，读数由下方实物图按真实接线算出"
/>

<Wiring
  title="图乙 虚线框内的补线"
  size="wide"
  height={380}
  parts={[
    {id: "E", type: "battery", label: "E", x: 90, y: 300, emf: "E", positive: "left"},
    {id: "S", type: "switch", label: "S", x: 250, y: 300, closed: true},
    {id: "R", type: "rheostat", label: "R", x: 450, y: 300, slider: "1-p", R: "Rtot"},
    {id: "G1", type: "resistor", label: "R_{G1}", x: 250, y: 70, R: "Rg1"},
    {id: "V1", type: "voltmeter", label: "V_1", x: 430, y: 70, read: "U1w"},
    {id: "G2", type: "resistor", label: "R_{G2}", x: 250, y: 185, R: "Rg2"},
    {id: "V2", type: "voltmeter", label: "V_2", x: 90, y: 185, read: "U2w"}
  ]}
  wires={[
    {from: "E.+", to: "S.a"},
    {from: "S.b", to: "R.B", note: "开关接到 a 端，电源正极一侧"},
    {from: "E.-", to: "R.A", note: "负极接 b 端"},
    {from: "R.D", to: "G1.b", note: "滑片接到两只光敏电阻的连接点"},
    {from: "G1.b", to: "G2.a"},
    {from: "G1.b", to: "V1.-", note: "V_1 的负极在滑片一侧"},
    {from: "G2.b", to: "V2.-", note: "V_2 的负极在 b 端一侧"},
    {from: "V1.3", to: "G1.a", note: "V_1 用 3 V 量程，并在 R_{G1} 上"},
    {from: "G1.a", to: "R.B"},
    {from: "V2.3", to: "G2.a", note: "V_2 用 3 V 量程，并在 R_{G2} 上"},
    {from: "G2.b", to: "R.A"}
  ]}
  note="R_{G1}、R_{G2} 实际在框外的电池板上，这里放进框内是为了看清并联关系"
/>

<Instrument
  title="图丙 电压表 V_1"
  size="narrow"
  type="meter"
  value="U1"
  scales={[15, 3]}
  range={3}
  divisions={30}
  major={3}
  unit="V"
  symbol="V"
  terminals={["−", "3 V", "15 V"]}
  note="上排 15 V，下排 3 V；指针在 1.5 V 右侧第一条小刻线"
/>

<Figure title="电池板跟着光源转" height={320} size="wide" params={["stage", "strong", "U1", "U2", "phiStop"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -1.7, xmax: 1.7, ymin: -1.45, ymax: 1.45, equal: true })
    const toward1 = p.strong === 2
    const tracking = p.stage === 3 && toward1
    const phi = tracking ? -p.phiStop * Math.PI / 180 : -48 * Math.PI / 180
    const cx = 0
    const cy = -0.15
    const hw = 0.95
    const hh = 0.16
    const c = Math.cos(phi)
    const s = Math.sin(phi)
    const px = (x, y) => cx + x * c - y * s
    const py = (x, y) => cy + x * s + y * c
    v.block(m, cx, cy, 2 * hw, hh, { angle: phi * 180 / Math.PI, shadow: false })
    const wallBase = px(0, hh) + Math.sin(phi) * 0.42
    const wallBaseY = py(0, hh) - Math.cos(phi) * 0.42
    v.block(m, wallBase, wallBaseY, 0.05, 0.42, { angle: phi * 180 / Math.PI })
    v.block(m, px(-0.48, hh), py(-0.48, hh), 0.28, 0.12, { angle: phi * 180 / Math.PI })
    v.block(m, px(0.48, hh), py(0.48, hh), 0.28, 0.12, { angle: phi * 180 / Math.PI })
    v.label(m, px(-0.48, hh), py(-0.48, hh), 'R_{G2}', { at: 'above-left' })
    v.label(m, px(0.72, hh), py(0.72, hh), 'R_{G1}', { at: 'right' })
    v.label(m, px(0.2, 0.78), py(0.2, 0.78), '隔板', { at: 'above-right' })
    const lampX = toward1 ? -1.55 : 1.55
    v.circle(m, lampX, 1.25, 0.16, { fill: v.color.charge })
    v.label(m, lampX, 1.25, '手电筒', { at: 'above' })
    v.arrow(m, lampX, 1.05, toward1 ? -0.35 : 0.35, 0.55, { color: v.color.charge })
    v.circle(m, cx, cy - 0.42, 0.13, { color: v.color.ink })
    v.label(m, cx, cy - 0.42, '电动机', { at: 'below' })
    v.rect(m, cx - 0.42, -1.35, 0.84, 0.28, { color: v.color.steel })
    v.label(m, cx, -1.21, '控制单元', { at: 'center' })
    const arc = tracking ? p.phiStop : 0
    if (arc > 1) {
      v.ellipse(m, cx, cy, 0.55, 0.55, { from: -48, to: -48 - arc, color: v.color.velocity })
      v.label(m, -0.85, -0.55, '顺时针 ' + arc.toFixed(0) + '°', { at: 'left', color: v.color.velocity })
    }
  },
})
</Figure>

<Readout items={[
  {label: "R_{G1} 电压", symbol: "U_1", expr: "U1", unit: "V", digits: 2, color: "charge"},
  {label: "R_{G2} 电压", symbol: "U_2", expr: "U2", unit: "V", digits: 2, color: "charge"},
  {label: "电压比", symbol: "U_1/U_2", expr: "ratio", digits: 2}
]} />

<Status cases={[
  {when: "stage == 1", label: "补线：正极经 S 接 a，负极接 b，滑片接两表负极", tone: "info"},
  {when: "p < 0.02", label: "滑片在 b 端，两表读数为 0", tone: "neutral"},
  {when: "stage == 2 and abs(p - pRead) < 0.005 and strong == 1", label: "图丙：U_1 = 1.60 V，光照较弱的阻值较大", tone: "success"},
  {when: "stage == 3 and strong == 2", label: "U_1 < U_2，顺时针转过 90° 后停止", tone: "success"},
  {when: "U1 > U2", label: "U_1 > U_2，R_{G1} 光照较弱、阻值较大", tone: "info"},
  {label: "U_1 < U_2，R_{G1} 光照较强、阻值较小", tone: "info"}
]} />

<Preset label="滑片先放 b 端" set={{stage: 2, p: 0, strong: 1}} />

<Preset label="图丙读数：1.60 V" set={{stage: 2, p: 0.6, strong: 1}} />

<Preset label="顺时针转过 90°" set={{stage: 3, p: 0.6, strong: 2}} />

<Answer items={[
  {label: "滑片初始位置", text: "b 端"},
  {label: "V_1 读数", symbol: "U_1", expr: "U1", value: 1.60, unit: "V", digits: 2},
  {label: "V_2 示数", symbol: "U_2", expr: "U2", value: 1.17, unit: "V", digits: 2},
  {label: "光照较弱的阻值", text: "较大"},
  {label: "电池板转向", text: "顺时针"},
  {label: "停止时转过的角度", symbol: "φ", expr: "phiStop", value: 90, unit: "°"}
]} />

滑片从 b 端向 a 端移动时，串联的两只光敏电阻分到的总电压从 0 增大，两表读数同时升高，比值不变。把较强的光照从 R_{G2} 换到 R_{G1}，U_1 从大于 U_2 变成小于 U_2：电压大的那一侧阻值大、光照弱，电池板就朝电压小的那一侧转，直到两侧电压相等。
