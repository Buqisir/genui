---
id: gd24-12
title: 太阳能电池板的光源跟踪
subject: physics
topic: 电学实验
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
---

## 一、题目条件分析

图甲是一套比较电路，不是单只电阻的测量电路。

- 电源电动势 $E = 3\ \text{V}$。电压表内阻视为无穷大，接入后不分流。电动势只有 $3\ \text{V}$，两只电压表都用 $3\ \text{V}$ 量程，不用 $15\ \text{V}$。
- 电池符号长极板是正极，在上方；短极板是负极，在下方。开关 S 串在负极一侧，图中为断开。
- 滑动变阻器 R 的 a 端在上方、接正极一侧，b 端在下方、接负极一侧。滑片接到 $R_{G1}$ 与 $R_{G2}$ 的连接点。因此 R 被滑片分成两段：a 到滑片为 $R_a$，滑片到 b 为 $R_b$。
- 右侧 $R_{G1}$ 与 $V_1$ 并联，接在正极和中点之间；$R_{G2}$ 与 $V_2$ 并联，接在中点和负极之间。两段串联后跨在电源两端，并与滑动变阻器并联。中点连线把两个分压支路接在一起。
- 两个光敏电阻规格相同。光照不同时阻值不同；光照强则阻值大还是小，要由第（2）问的读数判断，不能先当作已知。
- 半透明隔板垂直装在电池板上。正对光源时，隔板两侧光照相同；光源偏到某一侧时，这一侧更亮，另一侧被隔板减弱。
- 控制单元只比较检测电路里两个电压，题目说明它对检测电路没有影响。
- 题干文字没有写明图乙里 $R_{G1}$、$R_{G2}$ 各在隔板的哪一侧。下面的演示按面对图纸取定：隔板左侧是 $R_{G1}$，右侧是 $R_{G2}$，手电筒在正上方。$\theta$ 是电池板相对水平面的倾角，逆时针为正，$\theta = 0$ 表示电池板正对光源。
- 题目没有给出滑动变阻器的最大阻值和光敏电阻的阻值。演示取 $R = 200\ \Omega$，正对时光敏电阻 $R_0 = 80\ \Omega$，两侧阻值随倾角写成 $R_{G1} = R_0(1 + \beta\sin\theta)$，$R_{G2} = R_0(1 - \beta\sin\theta)$，$\beta = 0.55$。这只用来看电压谁大谁小，不代表实测阻值。

## 二、完整解答

### （1）虚线框里应补成的连接

图甲的电气关系是：线圈两端 a、b 跨在电源两端，滑片接两只光敏电阻的中点，两只电压表各并在一只光敏电阻上，并且都用 $3\ \text{V}$ 接线柱。

实物上滑动变阻器线圈两端记为 A、B，金属杆两端 C、D 都和滑片相通。这里让 A 对应图甲的 a，B 对应 b，滑片从 D 接出。

图乙里已经有的线：变阻器两个线圈端各自引出虚线框、接到电池板上的光敏电阻；电源的一个接线柱已经接到开关。按图甲，那一极是负极。还要补上的是电源正极、开关剩余的一端、滑片和两只电压表。

完整连接是：

1. 电源负极接开关的一极（图乙已画）。
2. 开关的另一极接变阻器 B 端（b 端）。
3. 电源正极接变阻器 A 端（a 端）。线圈两端都进电路，才是分压接法。
4. A 端再接到 $R_{G1}$ 靠近正极的一端（图乙中穿出虚线框的线）。
5. B 端接到 $R_{G2}$ 靠近负极的一端。
6. $R_{G1}$ 的另一端与 $R_{G2}$ 的另一端相连，这就是中点。
7. 滑片（D 端）接到这个中点。
8. $V_1$ 的「3」接线柱接 $R_{G1}$ 的高电位端，「−」接 $R_{G1}$ 的中点端。
9. $V_2$ 的「3」接线柱接 $R_{G2}$ 的高电位端（中点），「−」接 $R_{G2}$ 的低电位端。

电流从电压表的量程接线柱流入、从「−」流出，两只表都不会反偏。下面的实物图可以用「从头接」逐根核对。

### （2）阻值与光照强度

① 闭合开关前，滑片置于 $\boxed{b}$ 端。

a 在正极一侧，b 在负极一侧。滑片放到 b 端时，中点和负极连在一起，$R_{G2}$ 两端电压为 $0$，$R_{G1}$ 两端电压接近电动势。这和分压接法里「先把输出放到零」是同一类起始位置。然后再缓慢向 a 端移动，停在两只表都方便读取的位置。

② 图丙两排刻度共用刻线，上排 $0\sim 15\ \text{V}$，下排 $0\sim 3\ \text{V}$。电源只有 $3\ \text{V}$，读下排。

下排 $0$ 到 $3$ 是 $3$ 个大格，相邻整数之间 $10$ 个小格，全程 $30$ 个小格，最小分度

$$
\frac{3}{30}\ \text{V} = 0.1\ \text{V}
$$

$1$ 与 $2$ 的中点那条长刻线是 $1.50\ \text{V}$。指针在它右侧紧邻的第 $1$ 条小刻线上，再加 $1$ 个分度。最小分度是 $0.1\ \text{V}$，要估读到百分位，指针正压在刻线上，百分位是 $0$：

$$
U_1 = 1.50\ \text{V} + 1 \times 0.1\ \text{V} = \boxed{1.60\ \text{V}}
$$

同一位置若误按 $15\ \text{V}$ 量程去读，每小格是 $0.5\ \text{V}$，会读成 $7.5 + 0.5 = 8.0\ \text{V}$。电源电动势只有 $3\ \text{V}$，这个读数不采用。

题目已给出 $U_2 = 1.17\ \text{V}$。这次照射事先使 $R_{G1}$ 的光照比 $R_{G2}$ 弱，而

$$
U_1 = 1.60\ \text{V} > U_2 = 1.17\ \text{V}
$$

电压表不分流。按两只光敏电阻串联分压，通过它们的电流相同，电压大的阻值大：

$$
\frac{R_{G1}}{R_{G2}} = \frac{U_1}{U_2} = \frac{1.60}{1.17} \approx 1.37 > 1
$$

所以光照更弱的 $R_{G1}$ 阻值更大。表面光照强度较小的光敏电阻，阻值 $\boxed{较大}$。

滑片停在中部、$R_a = R_b$ 时，并上变阻器也不会把这个大小关系反过来：阻值大的那一侧，并联后的等效电阻仍然更大，分到的电压仍然更高。

③ 读完数断开 S，电路里不再有电流。

### （3）跟踪时的转动方向

第（2）问的规律：光照越弱，阻值越大，分到的电压越高。反过来，电压较小的那一侧，光照较强。

本问是另一次照射，此时 $U_1 < U_2$。注意它和第（2）问的光照安排相反：这次是 $R_{G1}$ 更亮、$R_{G2}$ 较暗。

按上面取定的图乙方位，隔板左侧是 $R_{G1}$。$U_1 < U_2$ 说明左侧更亮，正上方的光落在法线的左侧，电池板处于左高右低（演示里 $\theta < 0$），隔板顶端偏向右上方。

控制单元比较的是电压。要让电池板正对光源，就要把法线转向更亮、电压更小的那一侧，也就是转向左侧。面对图纸，这个转动是 $\boxed{逆时针}$。

停转条件是两侧电压相等。两侧电压相等时，两侧阻值相等，半透明隔板不再偏挡，电池板正对手电筒：

$$
\boxed{U_1 = U_2}
$$

若试卷上的图乙把 $R_{G1}$、$R_{G2}$ 画在与本课件相反的两侧，顺时针和逆时针对调；判断方法不变：转向电压较小、光照较强的那一侧，直到两表示数相等。

## 三、交互演示

第（2）问的 $1.60\ \text{V}$ 是图丙的刻度读数，由「中线右侧第几小格」决定，不随倾角改变。$U_2 = 1.17\ \text{V}$ 是题目给出的数，滑块只用来对照大小。

倾角、滑片和开关驱动的是演示电路。电路按图甲求解：$R_a$ 与 $R_{G1}$、$V_1$ 并联后，再和 $R_b$、$R_{G2}$、$V_2$ 的并联段串联。演示电压记为 $U_{G1}$、$U_{G2}$，不要和题目那组 $1.60\ \text{V}$、$1.17\ \text{V}$ 当成同一次测量。

<Question text="（1）补全虚线框中 R、E、S 与两只电压表的连线。" hint="线圈两端跨接电源，滑片接两光敏电阻的中点；两表都用 3 V 量程，正接线柱接高电位端。" />

<Question text="（2）①闭合开关前，滑片应置于哪一端？" set={{sp: 1, sOn: 0}} hint="b 端靠近电源负极。滑片在 b 端时，中点与负极等电位。" />

<Question text="（2）②图丙中 U1 读多少？光照较弱的光敏电阻阻值较大还是较小？" set={{nSmall: 1, U2: 1.17, theta: 30, sp: 0.5, sOn: 1}} hint="3 V 量程，每小格 0.1 V。长刻线是 1.50 V，再向右 1 格。" />

<Question text="（3）此时 U1 < U2，电池板向哪边转？何时停止？" set={{theta: -30, sp: 0.5, sOn: 1}} hint="电压小的一侧更亮。转向那一侧，直到两表示数相等。" />

<Param name="nSmall" label="长刻线右侧第几条小刻线" min={0} max={5} step={1} value={1} control="stepper" unit="格" />

<Param name="U2" label="题目给出的 U2" symbol="U_2" min={0} max={3} step={0.01} value={1.17} unit="V" color="field" />

<Param name="theta" label="电池板倾角 θ" symbol="θ" min={-60} max={60} step={1} value={-30} unit="°" />

<Param name="sp" label="滑片位置（0 在 a 端，1 在 b 端）" min={0} max={1} step={0.01} value={0.5} />

<Param name="sOn" label="开关 S" options={[{value: 1, label: "闭合"}, {value: 0, label: "断开"}]} value={1} />

<Param name="wk" label="已接导线" min={0} max={11} step={1} value={11} hidden />

<Define name="divV" expr="0.1" />

<Define name="U1" expr="1.5 + nSmall * divV" />

<Define name="E" expr="3" />

<Define name="R0" expr="80" />

<Define name="beta" expr="0.55" />

<Define name="Rmax" expr="200" />

<Define name="Ra" expr="sp * Rmax + 0.0001" />

<Define name="Rb" expr="(1 - sp) * Rmax + 0.0001" />

<Define name="Rg1" expr="R0 * (1 + beta * sin(deg(theta)))" />

<Define name="Rg2" expr="R0 * (1 - beta * sin(deg(theta)))" />

<Preset label="（2）滑片放在 b 端" set={{sp: 1, sOn: 0}} />

<Preset label="（2）图丙读数" set={{nSmall: 1, U2: 1.17}} />

<Preset label="（2）光照：RG1 较暗" set={{theta: 30, sp: 0.5, sOn: 1}} />

<Preset label="（3）题设：左侧更亮" set={{theta: -30, sp: 0.5, sOn: 1}} />

<Preset label="（3）正对光源停下" set={{theta: 0, sp: 0.5, sOn: 1}} />

<Status cases={[
  {when: "sOn < 0.5", label: "开关断开，检测电路无电流", tone: "neutral"},
  {when: "sp > 0.98", label: "滑片在 b 端，U_G2 接近 0", tone: "info"},
  {when: "sp < 0.02", label: "滑片在 a 端，U_G1 接近 0", tone: "info"},
  {when: "abs(Ug1 - Ug2) < 0.02", label: "两表示数相等，电池板正对光源，电机停转", tone: "success"},
  {when: "Ug1 < Ug2", label: "U_G1 < U_G2，左侧更亮，应逆时针转动", tone: "warning"},
  {label: "U_G1 > U_G2，右侧更亮，应顺时针转动", tone: "warning"}
]} />

<Status cases={[
  {when: "U1 > U2 + 0.001", label: "U1 > U2：光照较弱的那只阻值较大", tone: "success"},
  {when: "abs(U1 - U2) <= 0.001", label: "U1 与 U2 相等，对应阻值相等", tone: "info"},
  {label: "U1 < U2：电压较小的那只阻值较小", tone: "warning"}
]} />

<Readout items={[
  {label: "图丙读数", symbol: "U_1", expr: "U1", unit: "V", digits: 2, color: "charge"},
  {label: "题目给出", symbol: "U_2", expr: "U2", unit: "V", digits: 2, color: "field"},
  {label: "RG1 阻值", symbol: "R_G1", expr: "Rg1", unit: "Ω", digits: 1, color: "charge"},
  {label: "RG2 阻值", symbol: "R_G2", expr: "Rg2", unit: "Ω", digits: 1, color: "field"},
  {label: "演示电压", symbol: "U_G1", expr: "Ug1", unit: "V", digits: 2, color: "charge"},
  {label: "演示电压", symbol: "U_G2", expr: "Ug2", unit: "V", digits: 2, color: "field"},
  {label: "两表之差", symbol: "U_G1 - U_G2", expr: "Ug1 - Ug2", unit: "V", digits: 2}
]} />

<Answer items={[
  {label: "（2）② V1 读数", symbol: "U_1", expr: "U1", value: 1.6, unit: "V", digits: 2},
  {label: "（2）① 滑片置于", text: "b 端"},
  {label: "（2）② 光照较弱者的阻值", text: "较大"},
  {label: "（3）转动方向", text: "逆时针"},
  {label: "（3）停止条件", text: "两电压表示数相等（U1 = U2）"}
]} />

打开页面时电池板处于第（3）问的倾斜状态：左高右低，左侧 $R_{G1}$ 更亮。把倾角拖到 $0$，两阻值相遇，两个演示电压也相遇。滑片拉到 $1$ 就是 b 端。

<Figure title="电池板与隔板（示意图，不按比例）" height={380} params={["theta"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -3.6, xmax: 3.6, ymin: -2.25, ymax: 3.15, equal: true, pad: 12 })
    const th = p.theta * Math.PI / 180
    const c = Math.cos(th)
    const s = Math.sin(th)
    function W(u, w) {
      return [u * c - w * s, u * s + w * c]
    }
    const L = 1.5
    const t = 0.1

    if (Math.abs(p.theta) > 2) {
      v.path(m, [[-L, -t], [L, -t], [L, t], [-L, t]], { close: true, dash: [5, 4], color: v.color.steel })
      v.line(m, 0, t, 0, 1.15, { dash: [5, 4], color: v.color.steel })
      v.label(m, 1.55, 0.7, '正对位置', { color: v.color.steel, size: 11 })
    }

    v.path(m, [W(-L, -t), W(L, -t), W(L, t), W(-L, t)], { close: true, fill: v.color.enamel, color: v.color.ink, width: 2 })
    v.path(m, [W(-0.045, t), W(0.045, t), W(0.045, 1.15), W(-0.045, 1.15)], { close: true, fill: v.color.enamel, color: v.color.ink, width: 2 })

    function chip(u) {
      const du = 0.16
      const dw = 0.24
      return [W(u - du, t), W(u + du, t), W(u + du, t + dw), W(u - du, t + dw)]
    }
    v.path(m, chip(-0.5), { close: true, fill: v.color.enamel, color: v.color.charge, width: 2 })
    v.path(m, chip(0.5), { close: true, fill: v.color.enamel, color: v.color.field, width: 2 })

    const g1 = W(-0.5, t + 0.46)
    const g2 = W(0.5, t + 0.46)
    v.label(m, g1[0], g1[1], 'RG1', { color: v.color.charge, size: 13 })
    v.label(m, g2[0], g2[1], 'RG2', { color: v.color.field, size: 13 })

    const b1 = W(-1.15, 0.62)
    const b2 = W(1.15, 0.62)
    if (p.theta < -0.5) {
      v.label(m, b1[0], b1[1], '较亮', { color: v.color.charge, size: 12 })
      v.label(m, b2[0], b2[1], '被减弱', { color: v.color.steel, size: 12 })
    } else if (p.theta > 0.5) {
      v.label(m, b1[0], b1[1], '被减弱', { color: v.color.steel, size: 12 })
      v.label(m, b2[0], b2[1], '较亮', { color: v.color.field, size: 12 })
    } else {
      v.label(m, b1[0], b1[1], '等亮', { color: v.color.graphite, size: 12 })
      v.label(m, b2[0], b2[1], '等亮', { color: v.color.graphite, size: 12 })
    }

    v.circle(m, 0, 0, 0.1, { fill: v.color.ink })
    v.line(m, 0, -0.1, 0, -0.32, { color: v.color.ink, width: 3 })
    v.circle(m, 0, -0.64, 0.32, { fill: v.color.enamel, color: v.color.ink, width: 2 })
    v.line(m, -0.55, -0.96, 0.55, -0.96, { color: v.color.ink, width: 2 })
    v.text(m, 0, -1.2, '电动机', { align: 'center', color: v.color.ink, size: 12 })
    v.text(m, 0, -1.5, '控制单元', { align: 'center', color: v.color.graphite, size: 11 })

    v.circle(m, 0, 2.55, 0.16, { fill: v.color.enamel, color: v.color.charge, width: 2 })
    v.label(m, 0, 2.9, '手电筒', { color: v.color.charge, size: 12 })
    v.ray(m, [[-1.4, 2.3], [-1.4, 1.75]])
    v.ray(m, [[-0.45, 2.3], [-0.45, 1.7]])
    v.ray(m, [[0.45, 2.3], [0.45, 1.7]])
    v.ray(m, [[1.4, 2.3], [1.4, 1.75]])

    let tip = '已正对光源，停止转动'
    let tipColor = v.color.field
    if (p.theta < -0.5) {
      tip = '左侧更亮，应逆时针转动'
      tipColor = v.color.force
    } else if (p.theta > 0.5) {
      tip = '右侧更亮，应顺时针转动'
      tipColor = v.color.force
    }
    v.text(m, -3.35, -1.85, tip, { align: 'left', color: tipColor, size: 13 })
    v.text(m, -3.35, -1.5, 'θ = ' + p.theta.toFixed(0) + '°（逆时针为正）', { align: 'left', color: v.color.graphite, size: 12 })
  },
})
</Figure>

亮暗画的是光照，只由倾角决定。滑片拉到 a 端或 b 端时，有一侧被短路，电压不再代表光照，以侧栏状态为准。虚线电池板是正对位置。

<Circuit
  title="光照方向检测电路"
  note="Ra、Rb 是滑片两侧的电阻。代表性阻值，排版按串并联自动完成，电气关系与图甲相同。"
  source={{series: [
    {type: "battery", label: "E = 3 V", emf: "E", r: 0, read: "Ibat"},
    {type: "switch", label: "S", closed: "sOn"}
  ]}}
  load={{series: [
    {parallel: [
      {type: "resistor", label: "R_a", R: "Ra"},
      {type: "resistor", label: "R_G1", R: "Rg1"},
      {type: "voltmeter", label: "V_1", read: "Ug1"}
    ]},
    {parallel: [
      {type: "resistor", label: "R_b", R: "Rb"},
      {type: "resistor", label: "R_G2", R: "Rg2"},
      {type: "voltmeter", label: "V_2", read: "Ug2"}
    ]}
  ]}}
  current={{expr: "Ibat", unit: "A", label: "I"}}
  hud={[
    {symbol: "U_G1", expr: "Ug1", unit: "V", digits: 2},
    {symbol: "U_G2", expr: "Ug2", unit: "V", digits: 2}
  ]}
/>

图中左边那一组靠近电源正极，对应图甲里上方的 $R_{G1}$；右边那一组靠近负极，对应图甲里下方的 $R_{G2}$。

<Instrument title="图丙电压表 V1（按 3 V 量程）" type="meter" value="U1" scales={[15, 3]} range={3} unit="V" symbol="V" divisions={30} major={3} note="最小分度 0.1 V，估读到百分位" />

<Wiring
  title="实物连线：分压接法，电压表用 3 V"
  steps="wk"
  parts={[
    {id: "V1", type: "voltmeter", label: "V_1"},
    {id: "V2", type: "voltmeter", label: "V_2"},
    {id: "G1", type: "resistor", label: "R_G1", R: "Rg1"},
    {id: "G2", type: "resistor", label: "R_G2", R: "Rg2"},
    {id: "Rh", type: "rheostat", label: "R", R: "Rmax", slider: "sp"},
    {id: "E", type: "battery", label: "电源 E"},
    {id: "S", type: "switch", label: "S", closed: "sOn"}
  ]}
  wires={[
    {from: "E.-", to: "S.a", note: "图甲中开关在电源负极一侧；图乙里电源已有一根线接到开关"},
    {from: "S.b", to: "Rh.B", note: "开关另一侧接到变阻器 b 端，也就是线圈 B 端"},
    {from: "E.+", to: "Rh.A", note: "电源正极接变阻器 a 端（线圈 A 端）。分压接法要把线圈两端都接入"},
    {from: "Rh.A", to: "G1.a", note: "a 端接到 RG1 的高电位端。图乙中这一端已有线穿出虚线框"},
    {from: "Rh.B", to: "G2.b", note: "b 端接到 RG2 的低电位端，对应另一根穿出虚线框的线"},
    {from: "G1.b", to: "G2.a", note: "两只光敏电阻串联，接点就是图甲的中点"},
    {from: "Rh.D", to: "G1.b", note: "滑片从金属杆 D 端接到中点"},
    {from: "V1.3", to: "G1.a", note: "V1 用 3 V 量程，正接线柱接 RG1 靠近正极的一端"},
    {from: "V1.-", to: "G1.b", note: "V1 的负接线柱接 RG1 的另一端，与 RG1 并联"},
    {from: "V2.3", to: "G2.a", note: "V2 也用 3 V 量程，正接线柱接 RG2 的高电位端"},
    {from: "V2.-", to: "G2.b", note: "V2 的负接线柱接 RG2 的低电位端"}
  ]}
/>

## 四、结合图像理解关键状态

图丙的读数只看刻度。$3\ \text{V}$ 量程最小分度 $0.1\ \text{V}$，长刻线是 $1.50\ \text{V}$。滑块停在「右侧第 $1$ 条小刻线」时，读数是 $1.60\ \text{V}$。把它和题目给出的 $1.17\ \text{V}$ 比，较大的电压对应较大的阻值，而这次 $R_{G1}$ 光照更弱，所以光照弱则阻值大。

阻值曲线用的是代表性公式。$\theta = 0$ 时两条曲线相交，两侧光照相同，演示电压都是 $1.50\ \text{V}$，电机应停。$\theta = -30^\circ$ 时 $R_{G1} = 58\ \Omega$、$R_{G2} = 102\ \Omega$，滑片在中点，$U_{G1} < U_{G2}$，对应第（3）问，应逆时针转回 $0$。$\theta = +30^\circ$ 时左右对调，对应第（2）问那种「$R_{G1}$ 较暗」的照射，应顺时针转回。

滑片在 a 端或 b 端时，中点被接到某一条电源线，一只电压表接近 $0$，另一只接近 $3\ \text{V}$。这个位置只适合作为闭合开关前的起点，不能用来判断光照方向。

<Plot
  title="两侧光敏电阻阻值随倾角变化"
  caption="代表性阻值，不是题目实测。θ = 0 时两侧相等；滑片在中点时，阻值高的一侧电压高。"
  x={{name: "th", label: "θ", unit: "°", min: -60, max: 60}}
  y={{label: "R", unit: "Ω", min: 0, max: 140}}
  series={[
    {label: "R_G1", expr: "R0 * (1 + beta * sin(deg(th)))", color: "charge"},
    {label: "R_G2", expr: "R0 * (1 - beta * sin(deg(th)))", color: "field"}
  ]}
  marks={[
    {x: 0, label: "正对光源"},
    {x: -30, series: 0, label: "第（3）问的倾角"}
  ]}
  cursor="theta"
/>

## 五、答案汇总

| 小题 | 答案 |
|---|---|
| （1）实物连线 | 变阻器 a、b 跨接电源，滑片接两光敏电阻中点；两电压表并在光敏电阻上，用 $3\ \text{V}$ 量程 |
| （2）① | b 端 |
| （2）② | $1.60\ \text{V}$；较大 |
| （2）③ | 断开 S |
| （3） | 逆时针；两电压表示数相等（$U_1 = U_2$）时停止 |
