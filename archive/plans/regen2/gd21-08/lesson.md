---
id: gd21-08
title: 五条龙舟的赛程
source: 2021 广东卷 第 8 题（多选，6 分）
question: "赛龙舟是端午节的传统活动。下列 v–t 和 s–t 图像描述了五条相同的龙舟从同一起点线同时出发、沿长直河道划向同一终点线的运动全过程，其中能反映龙舟甲与其它龙舟在途中出现船头并齐的有（　　）\n\nA.【图】v–t 图，无刻度，原点 O。甲、乙都从 O 出发。甲上升较陡后转入水平，末端再略向上抬起，然后一条竖直虚线落到 t 轴，虚线顶端标“甲”。乙上升更缓、平台更低，水平段比甲更长，末端也略向上抬起，竖直虚线落在更靠右处，顶端标“乙”。甲的曲线全程在乙的上方，两曲线不相交。\n\nB.【图】v–t 图，无刻度，原点 O。丙从 O 较陡上升后转入水平平台；甲上升较慢，开始在丙下方，随后超过丙并转入更高的水平段，末端略再升高。两曲线相交一次。甲、丙末端各有竖直虚线落到 t 轴，甲的虚线略在丙的左边，虚线顶端分别标“甲”“丙”。\n\nC.【图】s–t 图，无刻度，原点 O。甲、丁都从 O 出发，曲线向上凹（越来越陡）。丁全程在甲上方，两曲线不相交。二者末端到达同一条水平虚线，丁的竖直虚线更靠左，甲更靠右，虚线顶端分别标“丁”“甲”。\n\nD.【图】s–t 图，无刻度，原点 O。甲、戊都从 O 出发，曲线向上凹，两曲线相交一次。相交前甲在戊上方，相交后戊在上方，戊先到达同一条水平虚线，甲后到达。末端各有竖直虚线落到 t 轴，分别标“戊”“甲”。"
choice: BD
answers: []
---

五条相同的龙舟从同一起点线同时出发，沿长直河道划向同一终点线。船头并齐就是某一时刻两船的位移相等：$s\text{–}t$ 图上两条曲线相交；$v\text{–}t$ 图上位移是曲线与 $t$ 轴围成的面积，面积曾经相等也算并齐。到达终点的竖直虚线不是途中并齐。

原图没有刻度。下面按图的走势取代表值：河道长 $L = 100\,\mathrm{m}$，各船先加速、再保持速度、接近终点时再略加速。数值只用来对照图形，不是题目给出的数据。

<Param name="pair" label="对照组" value={2} options={[{value: 1, label: "A 甲、乙"}, {value: 2, label: "B 甲、丙"}, {value: 3, label: "C 甲、丁"}, {value: 4, label: "D 甲、戊"}]} />

<Param name="t" label="时刻" value={8} min={0} max={16} step={0.1} unit="s" />

<Param name="L" label="河道长" value={100} hidden unit="m" />

<Define name="sJia" expr="pair == 1 ? (t < 3 ? 2.5*t^2 : t < 8 ? 22.5 + 15*(t - 3) : t < 9 ? 97.5 + 15*(t - 8) + 2.5*(t - 8)^2 : 115) : pair == 2 ? (t < 6 ? t^2 : t < 10 ? 36 + 12*(t - 6) : t < 11 ? 84 + 12*(t - 10) + (t - 10)^2 : 97) : pair == 3 ? (t < 4 ? t^2 : t < 10 ? 16 + 8*(t - 4) : t < 12 ? 64 + 8*(t - 10) + (t - 10)^2 : 84) : (t < 4 ? 1.5*t^2 : t < 8 ? 24 + 12*(t - 4) : t < 10 ? 72 + 12*(t - 8) + (t - 8)^2 : 100)" />

<Define name="sOther" expr="pair == 1 ? (t < 5 ? t^2 : t < 12 ? 25 + 10*(t - 5) : t < 14 ? 95 + 10*(t - 12) + 1.5*(t - 12)^2 : 121) : pair == 2 ? (t < 3 ? 2.5*t^2 : t < 9 ? 22.5 + 15*(t - 3) : t < 12 ? 112.5 + 15*(t - 9) + 0.75*(t - 9)^2 : 164.25) : pair == 3 ? (t < 3 ? 2*t^2 : t < 7 ? 18 + 12*(t - 3) : t < 9 ? 66 + 12*(t - 7) + 1.5*(t - 7)^2 : 96) : (t < 6 ? 0.5*t^2 : t < 9 ? 18 + 6*(t - 6) : t < 11 ? 36 + 6*(t - 9) + 2*(t - 9)^2 : 56)" />

<Define name="vJia" expr="pair == 1 ? (t < 3 ? 5*t : t < 8 ? 15 : t < 9 ? 15 + 5*(t - 8) : 0) : pair == 2 ? (t < 6 ? 2*t : t < 10 ? 12 : t < 11 ? 12 + 2*(t - 10) : 0) : pair == 3 ? (t < 4 ? 2*t : t < 10 ? 8 : t < 12 ? 8 + 2*(t - 10) : 0) : (t < 4 ? 3*t : t < 8 ? 12 : t < 10 ? 12 + 2*(t - 8) : 0)" />

<Define name="vOther" expr="pair == 1 ? (t < 5 ? 2*t : t < 12 ? 10 : t < 14 ? 10 + 3*(t - 12) : 0) : pair == 2 ? (t < 3 ? 5*t : t < 9 ? 15 : t < 12 ? 15 + 1.5*(t - 9) : 0) : pair == 3 ? (t < 3 ? 4*t : t < 7 ? 12 : t < 9 ? 12 + 3*(t - 7) : 0) : (t < 6 ? t : t < 9 ? 6 : t < 11 ? 6 + 4*(t - 9) : 0)" />

<Define name="capJia" expr="pair == 1 ? 115 : pair == 2 ? 97 : pair == 3 ? 84 : 100" />

<Define name="capOther" expr="pair == 1 ? 121 : pair == 2 ? 164.25 : pair == 3 ? 96 : 56" />

<Define name="sJiaShow" expr="min(sJia, capJia)" />

<Define name="sOtherShow" expr="min(sOther, capOther)" />

<Define name="gap" expr="sJiaShow - sOtherShow" />

<Define name="bothGoing" expr="vJia > 0 and vOther > 0 ? 1 : 0" />

<Define name="level" expr="abs(gap) < 1.2 and bothGoing > 0.5 ? 1 : 0" />

<Preset label="甲与丙并齐" set={{pair: 2, t: 8}} />

<Preset label="甲与戊并齐" set={{pair: 4, t: 6}} />

<Question text="A. v–t 图：甲全程在乙上方，两曲线不相交" set={{pair: 1, t: 6}} hint="面积始终是甲大，途中不会并齐" />

<Question text="B. v–t 图：甲先在丙下方，后来超过丙" set={{pair: 2, t: 8}} hint="交点前丙的面积大，交点后甲把差距补回" />

<Question text="C. s–t 图：丁全程在甲上方，两曲线不相交" set={{pair: 3, t: 6}} hint="位移始终是丁大，不会并齐" />

<Question text="D. s–t 图：甲与戊相交一次" set={{pair: 4, t: 6}} hint="交点就是船头并齐" />

<Status cases={[
  {when: "level > 0.5", label: "这一刻两船船头并齐", tone: "success"},
  {when: "gap > 1.2 and bothGoing > 0.5", label: "甲在前", tone: "info"},
  {when: "gap < -1.2 and bothGoing > 0.5", label: "对方在前", tone: "info"},
  {label: "已有龙舟到达终点", tone: "neutral"}
]} />

<Readout items={[
  {label: "甲的位移", symbol: "s_甲", expr: "sJiaShow", unit: "m", digits: 1, color: "velocity"},
  {label: "对方位移", symbol: "s", expr: "sOtherShow", unit: "m", digits: 1, color: "force"},
  {label: "位移差", symbol: "Δs", expr: "gap", unit: "m", digits: 1},
  {label: "甲的速度", symbol: "v_甲", expr: "vJia", unit: "m/s", digits: 1, color: "velocity"},
  {label: "对方速度", symbol: "v", expr: "vOther", unit: "m/s", digits: 1, color: "force"}
]} />

<Answer items={[
  {label: "答案", text: "BD"},
  {label: "A", text: "错误：甲的速度始终更大，面积不会相等"},
  {label: "B", text: "正确：交点前后面积大小对调，途中并齐"},
  {label: "C", text: "错误：s–t 不相交，丁始终在前"},
  {label: "D", text: "正确：s–t 相交处船头并齐"}
]} />

<Sim title="河道上的两条龙舟" height={240} duration={16} time="t" params={["L", "sJiaShow", "sOtherShow", "vJia", "vOther", "level"]} note="河道长取代表值 100 m，不按比例。上面是甲，下面是对方。" legend={[{kind: "velocity", label: "甲"}, {kind: "force", label: "对方"}]} hud={[{symbol: "Δs", label: "位移差", expr: "gap", unit: "m", digits: 1}]} marks={[{t: 0, label: "同时出发"}, {t: 6, label: "甲、戊并齐"}, {t: 8, label: "甲、丙并齐"}]}>
sim({
  at(t, p) {
    const span = Math.max(p.L, 20)
    return {
      xA: Math.min(p.sJiaShow, span),
      xB: Math.min(p.sOtherShow, span),
      doneA: p.vJia <= 0,
      doneB: p.vOther <= 0,
      level: p.level > 0.5,
    }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -14, xmax: 128, ymin: -0.7, ymax: 4.5 })
    v.ground(m, -8, 118, 0)
    v.line(m, 0, 0.2, 0, 3.7, { color: v.color.ink, width: 2 })
    v.line(m, 100, 0.2, 100, 3.7, { color: v.color.ink, dash: true, width: 2 })
    v.label(m, 0, 4.15, "起点")
    v.label(m, 100, 4.15, "终点")
    const boat = (x, y, name, kind, done) => {
      v.bar(m, x - 9, y, x, y, { thick: 11 })
      v.circle(m, x - 0.4, y + 0.28, 0.28, { fill: v.color.ink })
      v.label(m, x - 4.5, y + 0.95, name)
      if (!done) v.vec(m, x + 0.6, y + 0.45, 8, 0, { kind: kind })
    }
    boat(s.xA, 2.35, "甲", "velocity", s.doneA)
    boat(s.xB, 0.75, "对方", "force", s.doneB)
    if (s.level) v.event(m, (s.xA + s.xB) / 2, 1.55, "船头并齐", { at: v.t, kind: "velocity" })
  },
})
</Sim>

<Plot title="A  甲全程比乙快" size="wide" caption="两条曲线不相交，甲与 t 轴围成的面积始终更大"
  x={{name: "tt", label: "t", unit: "s", min: 0, max: 16}}
  y={{label: "v", unit: "m/s", min: 0, max: 24}}
  series={[
    {label: "甲", expr: "tt < 3 ? 5*tt : tt < 8 ? 15 : tt < 9 ? 15 + 5*(tt - 8) : 0", color: "velocity"},
    {label: "乙", expr: "tt < 5 ? 2*tt : tt < 12 ? 10 : tt < 14 ? 10 + 3*(tt - 12) : 0", color: "force", dash: true}
  ]}
  marks={[{x: 9, label: "甲到终点"}, {x: 14, label: "乙到终点"}]}
/>

<Plot title="B  甲后来超过丙" size="narrow" caption="交点前丙的面积大，交点后甲把差距补回"
  x={{name: "tt", label: "t", unit: "s", min: 0, max: 14}}
  y={{label: "v", unit: "m/s", min: 0, max: 22}}
  series={[
    {label: "甲", expr: "tt < 6 ? 2*tt : tt < 10 ? 12 : tt < 11 ? 12 + 2*(tt - 10) : 0", color: "velocity"},
    {label: "丙", expr: "tt < 3 ? 5*tt : tt < 9 ? 15 : tt < 12 ? 15 + 1.5*(tt - 9) : 0", color: "force", dash: true}
  ]}
  areas={[
    {series: 1, to: 0, from: 0, until: 6, label: "丙领先"},
    {series: 0, to: 1, from: 6, until: 8, label: "甲追回"}
  ]}
  marks={[{x: 6, label: "速度相等"}, {x: 8, label: "位移相等"}]}
/>

<Plot title="C  丁始终在前" size="wide" caption="两条曲线不相交，丁先到达同一终点"
  x={{name: "tt", label: "t", unit: "s", min: 0, max: 14}}
  y={{label: "s", unit: "m", min: 0, max: 120}}
  series={[
    {label: "甲", expr: "tt < 4 ? tt^2 : tt < 10 ? 16 + 8*(tt - 4) : tt < 12 ? 64 + 8*(tt - 10) + (tt - 10)^2 : 84", color: "velocity"},
    {label: "丁", expr: "tt < 3 ? 2*tt^2 : tt < 7 ? 18 + 12*(tt - 3) : tt < 9 ? 66 + 12*(tt - 7) + 1.5*(tt - 7)^2 : 96", color: "force", dash: true}
  ]}
  marks={[{x: 9, label: "丁到终点"}, {x: 12, label: "甲到终点"}]}
/>

<Plot title="D  甲与戊相交一次" size="narrow" caption="交点前甲在前，交点后戊在前，戊先到终点"
  x={{name: "tt", label: "t", unit: "s", min: 0, max: 12}}
  y={{label: "s", unit: "m", min: 0, max: 120}}
  series={[
    {label: "甲", expr: "tt < 4 ? 1.5*tt^2 : tt < 8 ? 24 + 12*(tt - 4) : tt < 10 ? 72 + 12*(tt - 8) + (tt - 8)^2 : 100", color: "velocity"},
    {label: "戊", expr: "tt < 6 ? 0.5*tt^2 : tt < 9 ? 18 + 6*(tt - 6) : tt < 11 ? 36 + 6*(tt - 9) + 2*(tt - 9)^2 : 56", color: "force", dash: true}
  ]}
  marks={[{x: 6, label: "船头并齐"}, {x: 11, label: "戊到终点"}]}
/>

## 逐项判断

**A · 错误。** $v\text{–}t$ 图上甲全程在乙上方，两曲线不相交。位移等于曲线与 $t$ 轴围成的面积，甲的面积从出发起就比乙大，差距也越来越大。途中不会出现船头并齐，甲只是更早到达终点。

**B · 正确。** 丙先加得更快，开始在甲前面；甲后来速度超过丙，两曲线相交一次。交点之前丙的面积更大，交点之后甲的速度更大，多出来的面积会把这一段差距补回来。甲又更早到达终点，所以在终点之前必有一个时刻两船位移相等，船头并齐。

**C · 错误。** $s\text{–}t$ 图上丁全程在甲上方，两条曲线不相交。同一时刻丁的位移始终更大，船头不会并齐。两条曲线都向上凹，只说明两船都在加速，不能补出位移相等。

**D · 正确。** $s\text{–}t$ 图上两条曲线相交一次：相交前甲在上方，相交后戊在上方。交点表示同一时刻位移相等，正是途中船头并齐。戊后来在前，并先到达终点。

拖动时刻，河道上两船的位置跟着当前这一组图走。选 B 或 D 时，位移差会经过零；选 A 或 C 时，位移差不会变号。

$$\boxed{\mathrm{BD}}$$
