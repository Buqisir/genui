---
id: gd21-12
title: 热敏电阻阻值随温度的变化规律
subject: physics
topic: 电学实验
source: "2021 广东卷 第 12 题（实验；必考题共 42 分，原卷未单列本题分值）"
question: |
  某小组研究热敏电阻阻值随温度的变化规律。根据实验需要已选用了规格和量程合适的器材。

  （1）先用多用电表预判热敏电阻阻值随温度的变化趋势。选择适当倍率的欧姆挡，将两表笔 ______，调节欧姆调零旋钮，使指针指向右边“0Ω”处。测量时观察到热敏电阻温度越高，相同倍率下多用电表指针向右偏转角度越大，由此可判断热敏电阻阻值随温度的升高而 __________。

  （2）再按图连接好电路进行测量。

  【图】左端黑点分出两支。上支经过电压表 V 后向右：实线向下接到接线柱 C，虚线再向右向下接到接线柱 D。下支从黑点向右，经电流表 A、带斜箭头的电阻箱 R_0 后也接到 C。C、D 是方框中画有十字的接线柱，C 在左、D 在右，各有箭头从上指向接线柱。温控室是斜线边框的方框，框内灰色矩形标“热敏电阻”，左端引线向上接到 C，右端引线向上接到 D。D 向右的导线沿图的右侧向下，接到下方的黑点。下方从左到右：开关 S（断开）、电源 E（电池符号长线在左、短线在右）、滑动变阻器 R_1。R_1 为矩形，左端接电源，右端接到黑点；矩形上方有滑片箭头指向下，箭头左边标 a、右边标 b，滑片经上方导线与右侧黑点相连。

  ①闭合开关 S 前，将滑动变阻器 R_1 的滑片滑到 _______ 端（选填“a”或“b”）。

  将温控室的温度设置为 T，电阻箱 R_0 调为某一阻值 R_{01}。闭合开关 S，调节滑动变阻器 R_1，使电压表和电流表的指针偏转到某一位置。记录此时电压表和电流表的示数、T 和 R_{01}。断开开关 S。

  再将电压表与热敏电阻 C 端间的导线改接到 D 端，闭合开关 S。反复调节 R_0 和 R_1，使电压表和电流表的示数与上述记录的示数相同。记录此时电阻箱的阻值 R_{02}。断开开关 S。

  ②实验中记录的阻值 R_{01} _____ R_{02}（选填“大于”、“小于”或“等于”）。此时热敏电阻阻值 R_T = _____。
answers:
  - { name: RT, value: 10, unit: "Ω" }
---

## 一、题目条件分析

欧姆挡右边是 $0$，左边是 $\infty$。预判之前要先把两表笔短接，把指针调到右端 $0\,\Omega$。

测量电路是限流接法，分两次读数：

- 电压表接 C：与「电流表 + 电阻箱」并联，热敏电阻在 C、D 之间，不在电压表跨过的那一段里。
- 电压表改接到 D：跨过「电流表 + 电阻箱 + 热敏电阻」。
- 滑动变阻器线圈左端 a 接电源负极一侧，右端 b 和滑片接在同一点（题目里右侧黑点，再接到 D）。串联进去的只是 a 到滑片的一段。

两次都把电压表、电流表调回同一个示数。电流表内阻 $r_A$ 两次都在，相减后消去，所以不必测出 $r_A$。

试卷这一问没有给出数值。下面的电表、曲线用一组演示值，只为把偏转和对齐演出来；填空本身不依赖这些数。

| 量 | 演示取值 |
|---|---|
| 电源电动势 $E$ | $12\,\text{V}$，内阻不计 |
| 电流表内阻 $r_A$ | $2\,\Omega$（可改） |
| 滑动变阻器最大阻值 | $100\,\Omega$ |
| 第一次调好后变阻器接入 | $30\,\Omega$ |
| 第一次电阻箱 $R_{01}$ | $38\,\Omega$ |
| 设定温度 | $T=60\,^\circ\text{C}$ |
| 演示用的真实阻值 | $R_T=600/T=10\,\Omega$ |

$R_T=600/T$（$T$ 用摄氏度）只表示「温度升高、阻值变小」，不是试卷数据，也不是某一种热敏电阻的校准公式。

## 二、完整解答

### （1）欧姆挡预判

选好倍率后，红、黑表笔相触，回路电阻应为零，再旋欧姆调零旋钮，使指针指到右端 $0\,\Omega$。这一步是

$$\boxed{\text{短接}}$$

欧姆刻度右端是 $0$、左端是 $\infty$，而且刻度不均匀。同一倍率下指针向右偏得更多，读出的电阻更小。温度越高指针越靠右，所以阻值随温度升高而

$$\boxed{\text{减小}}$$

这是负温度系数。只比较偏转方向，得不出具体函数。

### （2）① 闭合前滑片放哪一端

b 端和滑片已经接在同一点，b 到滑片那一段被导线短路，不进入电路。干路上实际的电阻是 a 到滑片的长度：

- 滑片在 b：这一段是整个线圈，接入电阻最大，闭合瞬间电流最小。
- 滑片在 a：a 与滑片重合，接入电阻接近 $0$，电流会冲到最大，可能超过电表量程。

闭合开关前滑片应放在接入电阻最大的一端，即

$$\boxed{b}$$

闭合后再把滑片从 b 向 a 方向调节，直到两表指针偏转到合适的位置。演示里第一次就停在接入 $30\,\Omega$（滑片在 $s=0.3$，不是停在 b）。

### （2）② 两次电阻箱与 $R_T$

记电流表内阻为 $r_A$。电流表的示数是通过电流表和电阻箱的电流，不是电压表支路里的电流。

第一次，电压表接在 C，量的是电流表和 $R_{01}$ 两端的电压 $U$，电流表示数为 $I$：

$$U=I\,(r_A+R_{01})$$

热敏电阻在 C、D 之间，不在这次电压表的跨度里。

第二次，电压表改接到 D，跨过电流表、$R_{02}$ 和热敏电阻。电压 $U'$、电流 $I'$ 满足

$$U'=I'\,(r_A+R_{02}+R_T)$$

调节 $R_0$ 和 $R_1$，使两个指针都回到第一次的刻度，即 $U'=U$、$I'=I$。两式的 $U/I$ 相等：

$$r_A+R_{01}=r_A+R_{02}+R_T$$

$r_A$ 消去，得到

$$R_T=\boxed{R_{01}-R_{02}}$$

热敏电阻的阻值是正的，所以 $R_{01}$ 比 $R_{02}$ 大，空里填

$$\boxed{\text{大于}}$$

「等于」对应 $R_T=0$，「小于」会得到负电阻，都和这个测量不符。

只把 $U/I$ 调成相等，最后的差值已经是 $R_T$；题目还要求两个示数分别相同，这样两次用的是电表上的同一点，$r_A$ 也确实是同一个值。滑动变阻器的具体位置不进入答案。

演示里电压表不取电流、电源内阻为 $0$。这时干路总电阻相同才能让电流相同。把 $R_{02}=R_{01}-R_T$ 代进去，第二次变阻器要比第一次多接入一个 $R_T$：

$$R_{\text{滑}2}=R_{\text{滑}1}+R_T$$

电压表内阻不是无穷大时，变阻器要补偿的阻值会略有差别，但 $R_T=R_{01}-R_{02}$ 仍然成立。

代入演示值。第一次总电阻

$$30+2+38+10=80\,\Omega,\qquad I=\frac{12}{80}=0.15\,\text{A}$$

$$U=0.15\times(2+38)=6.0\,\text{V}$$

第二次取 $R_{02}=28\,\Omega$、变阻器接入 $40\,\Omega$：

$$40+2+28+10=80\,\Omega$$

电流仍是 $0.15\,\text{A}$，电压 $0.15\times(2+28+10)=6.0\,\text{V}$，与第一次相同。于是

$$R_T=38-28=\boxed{10\,\Omega}$$

与 $600/60=10\,\Omega$ 一致。$6\,\text{V}$ 已超过电压表 $3\,\text{V}$ 挡，演示用 $15\,\text{V}$ 挡；$0.15\,\text{A}$ 用 $0.6\,\text{A}$ 挡。

> **易错点**：欧姆挡向右是电阻变小，和电流表、电压表的习惯相反。闭合前滑片在 b，不在 a。第一次电压表不含热敏电阻，第二次才含，所以是 $R_{01}-R_{02}$，减反了会得到负值。第一次的 $U/I$ 等于 $r_A+R_{01}$，不是 $R_T$。

## 三、交互演示

先看欧姆挡，再看滑片在 a、b 的差别，最后让第二次的两个指针与第一次重合。电表上的数由电路按串并联算出。

<Param name="probe" label="欧姆挡表笔" options={[{value: 0, label: "两表笔短接"}, {value: 1, label: "测量热敏电阻"}]} value={1} />

<Param name="T" label="温控温度 T" symbol="T" color="force" value={60} min={20} max={100} step={1} unit="°C" />

<Param name="R01" label="第一次电阻箱 R_01" symbol="R_01" color="force" value={38} min={32} max={80} step={0.1} unit="Ω" />

<Param name="R02" label="第二次电阻箱 R_02" symbol="R_02" color="force" value={28} min={0} max={80} step={0.1} unit="Ω" />

<Param name="s" label="第二次滑片 s（0 在 a，1 在 b）" symbol="s" color="steel" value={0.4} min={0} max={1} step={0.001} />

<Param name="rA" label="电流表内阻 r_A" symbol="r_A" color="steel" value={2} min={0} max={10} step={0.5} unit="Ω" />

<Define name="E0" expr="12" />

<Define name="Rhe1" expr="30" />

<Define name="R1max" expr="100" />

<Define name="Rtrue" expr="600/T" />

<Define name="Rhe2" expr="s*R1max" />

<Define name="R02ok" expr="R01 - Rtrue" />

<Define name="s2" expr="(Rhe1 + Rtrue)/R1max" />

<Define name="RT" expr="R01 - R02" />

<Define name="Rx" expr="probe < 0.5 ? 0 : Rtrue" />

<Question text="将两表笔 ______，再把欧姆挡调到右端 0Ω。" hint="欧姆挡先短接，再旋调零旋钮" set={{probe: 0}} />

<Question text="温度越高，相同倍率下指针向右偏转越大，阻值怎样变？" hint="右端是 0。看欧姆表，再用低温预设对比" set={{probe: 1, T: 100}} />

<Question text="闭合开关前，R_1 的滑片应滑到 a 端还是 b 端？" hint="接入电路的是 a 到滑片这一段，越长电阻越大" set={{s: 1}} />

<Question text="记录值 R_01 与 R_02 哪个大？" hint="第二次的 U/I 多包含一个 R_T，R_0 必须变小" set={{probe: 1, T: 60, R01: 38, R02: 28, s: 0.4, rA: 2}} />

<Question text="热敏电阻阻值 R_T 等于什么？" hint="两次 U/I 相等时 r_A 消去，R_T = R_01 - R_02" set={{probe: 1, T: 60, R01: 38, R02: 28, s: 0.4, rA: 2}} />

<Preset label="表笔短接，调到 0Ω" set={{probe: 0}} />

<Preset label="高温，指针向右" set={{probe: 1, T: 100}} />

<Preset label="低温，指针向左" set={{probe: 1, T: 20}} />

<Preset label="闭合前：滑片到 b" set={{s: 1}} />

<Preset label="当前温度下两次示数相同" set={{probe: 1, R02: "R02ok", s: "s2"}} />

<Preset label="演示原值：测得 10 Ω" set={{probe: 1, T: 60, R01: 38, R02: 28, s: 0.4, rA: 2}} />

短接时指针在右端 $0$。测量时倍率用 $\times 1$（这组演示阻值大约几欧到几十欧）。温度从 $20\,^\circ\text{C}$ 升到 $100\,^\circ\text{C}$，指针应向右移动。

<Instrument title="多用电表欧姆 ×1 挡" type="ohmmeter" value="Rx" multiplier={1} note="右端是 0，左端是无穷大。短接时指针在右端；温度升高，指针向右移动。" />

限流接法：a 在左，接电源负极一侧；b 在右，和滑片接在一起，再去 D 端。滑片下面标出的是真正串进电路的电阻。把它推到 b，再推到 a，对比接入电阻。

<Figure title="滑动变阻器 R_1：滑片在 b 端电阻最大" height={320} params={["s", "R1max"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -1.4, xmax: 12.2, ymin: -1.9, ymax: 3.8, equal: true, pad: 14 })
    const x0 = 1.2
    const x1 = 8.2
    const yb = 0.35
    const yt = 1.35
    const xs = x0 + (x1 - x0) * p.s
    const yMid = (yb + yt) / 2
    const xR = 10.4
    v.path(m, [[x0, yb], [x1, yb], [x1, yt], [x0, yt]], { close: true, color: v.color.ink, fill: v.color.enamel })
    v.line(m, x0, yMid, x0 - 1.05, yMid, { color: v.color.ink, width: 2 })
    v.line(m, x1, yMid, xR, yMid, { color: v.color.ink, width: 2 })
    v.line(m, xs, yt, xs, 2.4, { color: v.color.ink, width: 2 })
    v.line(m, xs, 2.4, xR, 2.4, { color: v.color.ink, width: 2 })
    v.line(m, xR, yMid, xR, 2.4, { color: v.color.ink, width: 2 })
    v.arrow(m, xs, 3.2, xs, 2.5, { color: v.color.graphite })
    v.label(m, x0, yb - 0.32, 'a', { color: v.color.ink, size: 14 })
    v.label(m, x1, yb - 0.32, 'b', { color: v.color.ink, size: 14 })
    v.label(m, xs, 3.35, '滑片', { color: v.color.ink, size: 13 })
    v.label(m, x0 - 1.05, yMid + 0.4, '接电源负极', { color: v.color.graphite, size: 12 })
    v.label(m, xR, 2.75, '接 D 端', { color: v.color.graphite, size: 12 })
    const used = p.s * p.R1max
    if (p.s > 0.06) {
      v.dim(m, x0, -0.25, xs, -0.25, '接入 ' + used.toFixed(0) + ' Ω')
    } else {
      v.label(m, x0 + 0.2, -0.25, '接入约 0 Ω', { color: v.color.ink, size: 12 })
    }
    const tip = p.s > 0.98 ? '滑片在 b：接入电阻最大，闭合前放这里' : (p.s < 0.02 ? '滑片在 a：接入电阻接近 0' : '接入的是 a 到滑片这一段，b 到滑片被短路')
    v.text(m, 5.2, -1.4, tip, { align: 'center', color: v.color.ink, size: 13 })
  },
})
</Figure>

第一张图是电压表接 C 的记录：变阻器固定在第一次调好的 $30\,\Omega$，电阻箱是 $R_{01}$。第二张图是改接到 D 之后：电阻箱是 $R_{02}$，变阻器接入电阻跟着滑片 $s$ 变化。初始位置已经对齐，$U=6.0\,\text{V}$，$I=0.15\,\text{A}$。把 $R_{02}$ 或滑片拖开，再点「当前温度下两次示数相同」恢复。

<Circuit
  title="第一次测量：电压表接在 C"
  note="电压表与电流表、电阻箱并联，热敏电阻串在后面，不在电压表跨度里"
  source={{series: [
    {type: "switch", label: "S", closed: true},
    {type: "battery", label: "E", emf: "E0", r: 0},
    {type: "rheostat", label: "R_1", R: "Rhe1", note: {expr: "Rhe1", unit: "Ω", prefix: "接入 "}},
  ]}}
  load={{series: [
    {parallel: [
      {type: "voltmeter", label: "V", read: {U: "UV1"}},
      {series: [
        {type: "ammeter", label: "A", r: "rA", read: {I: "IA1"}},
        {type: "resistor", label: "R_01", R: "R01", note: {expr: "R01", unit: "Ω"}},
      ]},
    ]},
    {type: "resistor", label: "热敏电阻", R: "Rtrue", note: {expr: "Rtrue", unit: "Ω", prefix: "R_T = "}},
  ]}}
  current={{expr: "IA1", unit: "A", label: "I"}}
/>

<Circuit
  title="第二次测量：电压表改接到 D"
  note="电压表跨过电流表、电阻箱和热敏电阻。调节 R_02 与滑片，使示数与第一次相同"
  source={{series: [
    {type: "switch", label: "S", closed: true},
    {type: "battery", label: "E", emf: "E0", r: 0},
    {type: "rheostat", label: "R_1", R: "Rhe2", note: {expr: "Rhe2", unit: "Ω", prefix: "接入 "}},
  ]}}
  load={{series: [
    {parallel: [
      {type: "voltmeter", label: "V", read: {U: "UV2"}},
      {series: [
        {type: "ammeter", label: "A", r: "rA", read: {I: "IA2"}},
        {type: "resistor", label: "R_02", R: "R02", note: {expr: "R02", unit: "Ω"}},
        {type: "resistor", label: "热敏电阻", R: "Rtrue", note: {expr: "Rtrue", unit: "Ω", prefix: "R_T = "}},
      ]},
    ]},
  ]}}
  current={{expr: "IA2", unit: "A", label: "I"}}
/>

对齐时电压约 $6\,\text{V}$，用 $15\,\text{V}$ 挡；电流约 $0.15\,\text{A}$，用 $0.6\,\text{A}$ 挡。左右两块同种表指针重合，就是题目说的「示数相同」。

<Instrument title="第一次电压 U_1" type="meter" value="UV1" range={15} scales={[3, 15]} unit="V" symbol="V" note="15 V 挡。这是接 C 时记录的电压。" />

<Instrument title="第二次电压 U_2" type="meter" value="UV2" range={15} scales={[3, 15]} unit="V" symbol="V" note="调到与左边那块电压表同一位置。" />

<Instrument title="第一次电流 I_1" type="meter" value="IA1" range={0.6} scales={[0.6, 3]} unit="A" symbol="A" note="0.6 A 挡。这是接 C 时记录的电流。" />

<Instrument title="第二次电流 I_2" type="meter" value="IA2" range={0.6} scales={[0.6, 3]} unit="A" symbol="A" note="调到与左边那块电流表同一位置。" />

<Status cases={[
  {when: "probe < 0.5", label: "两表笔短接：把欧姆挡调到右端 0", tone: "info"},
  {when: "s > 0.995", label: "滑片在 b 端，接入电阻最大。闭合前放这里", tone: "info"},
  {when: "IA2 > 0.6", label: "电流超过 0.6 A 量程，滑片应向 b 移", tone: "danger"},
  {when: "s < 0.005", label: "滑片在 a 端，接入电阻接近 0", tone: "danger"},
  {when: "abs(UV1 - UV2) < 0.05 and abs(IA1 - IA2) < 0.004", label: "两次电压、电流示数相同，R_T = R_01 - R_02", tone: "success"},
  {when: "abs(R01 - R02 - Rtrue) < 0.2", label: "电阻箱差值已等于真实阻值，再调滑片使电表对齐", tone: "warning"},
  {label: "调节第二次的 R_02 和滑片，使两表示数与第一次相同", tone: "neutral"},
]} />

<Readout items={[
  {label: "真实阻值", symbol: "R_T", expr: "Rtrue", unit: "Ω", digits: 2, color: "force"},
  {label: "测量值 R_01 - R_02", symbol: "R_T", expr: "RT", unit: "Ω", digits: 2, color: "force"},
  {label: "第一次电压", symbol: "U_1", expr: "UV1", unit: "V", digits: 2, color: "field"},
  {label: "第二次电压", symbol: "U_2", expr: "UV2", unit: "V", digits: 2, color: "field"},
  {label: "第一次电流", symbol: "I_1", expr: "IA1", unit: "A", digits: 3, color: "charge"},
  {label: "第二次电流", symbol: "I_2", expr: "IA2", unit: "A", digits: 3, color: "charge"},
  {label: "第一次 U/I", expr: "IA1 > 0.000001 ? UV1/IA1 : 0", unit: "Ω", digits: 2, color: "field"},
  {label: "第二次 U/I", expr: "IA2 > 0.000001 ? UV2/IA2 : 0", unit: "Ω", digits: 2, color: "field"},
]} />

<Plot
  title="阻值随温度升高而减小"
  caption="实线是演示关系 600/T。虚线是 R_01 - R_02。虚线过曲线上当前温度那一点时，测量值等于真实阻值。"
  x={{name: "Tc", label: "T", unit: "°C", min: 20, max: 100}}
  y={{label: "R", unit: "Ω", min: -20, max: 80}}
  series={[
    {label: "真实阻值 600/T", expr: "600/Tc", color: "force"},
    {label: "测量值 R_01 - R_02", expr: "R01 - R02", color: "force", dash: true},
  ]}
  marks={[{x: "T", series: 0, label: "设定温度"}]}
  cursor="T"
/>

温度改变后，第一次的电表读数也会变，因为热敏电阻变了。用「当前温度下两次示数相同」按新的温度重新对齐。把 $r_A$ 从 $0$ 拖到 $10\,\Omega$，对齐不会被破坏，$R_{01}-R_{02}$ 也不变。

<Answer items={[
  {label: "（1）两表笔", text: "短接"},
  {label: "（1）阻值随温度", text: "减小"},
  {label: "（2）① 滑片", text: "b 端"},
  {label: "（2）② 大小关系", text: "大于"},
  {label: "（2）② 表达式", text: "R_01 - R_02"},
  {label: "演示数值下的 R_T", symbol: "R_T", expr: "RT", value: 10, unit: "Ω", digits: 2},
]} />

## 四、结合图像理解两次测量

欧姆表的游标停在右半边时电阻较小。$T$ 从 $20\,^\circ\text{C}$ 增到 $100\,^\circ\text{C}$，$600/T$ 从 $30\,\Omega$ 降到 $6\,\Omega$，指针向 $0$ 一侧移动，所以阻值减小。刻度不均匀，不能按偏转格数当成正比。

$R$–$T$ 图上的虚线高度是 $R_{01}-R_{02}$。它穿过实线上「设定温度」那一点，测量值才等于这只热敏电阻。虚线高于曲线，是 $R_{02}$ 偏小；虚线落到横轴下面，是 $R_{02}$ 大于 $R_{01}$，减法写反了。

对齐以后读侧栏里的两个 $U/I$。演示原值下都是 $40\,\Omega$：第一次是 $r_A+R_{01}=2+38$，第二次是 $r_A+R_{02}+R_T=2+28+10$。差就是 $10\,\Omega$。把 $r_A$ 改成 $0$，两个 $U/I$ 一起变成 $38\,\Omega$，差仍是 $R_{01}-R_{02}$。这就是内阻被消去的现象。

电压大约 $6\,\text{V}$、电流大约 $0.15\,\text{A}$ 时，两对表针重合。滑片靠近 a、第二次电流超过 $0.6\,\text{A}$，说明闭合前不能放在 a 端。

## 五、答案汇总

| 空 | 答案 |
|---|---|
| （1）两表笔 | 短接 |
| （1）阻值随温度升高 | 减小 |
| （2）① 滑片 | b 端 |
| （2）② $R_{01}$ 与 $R_{02}$ | $R_{01}$ 大于 $R_{02}$ |
| （2）② 热敏电阻 | $R_T=R_{01}-R_{02}$ |
| 演示数值（$T=60\,^\circ\text{C}$） | $R_T=10\,\Omega$ |
