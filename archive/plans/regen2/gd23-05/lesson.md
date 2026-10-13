---
id: gd23-05
title: 医用回旋加速器的最大速率
source: 2023 广东卷 第 5 题（单选，4 分）
question: "某小型医用回旋加速器，最大回旋半径为 0.5 m，磁感应强度大小为 1.12 T，质子加速后获得的最大动能为 1.5×10^7 eV．根据给出的数据，可计算质子经该回旋加速器加速后的最大速率约为（忽略相对论效应，1 eV = 1.6×10^−19 J）（　　）\n\nA. 3.6×10^6 m/s\n\nB. 1.2×10^7 m/s\n\nC. 5.4×10^7 m/s\n\nD. 2.4×10^8 m/s"
choice: C
answers:
  - { name: vMax, value: 5.36e7, unit: m/s }
---

回旋加速器的两个 D 形盒里是垂直于盒面的匀强磁场，缝间是交变电场。质子每次过缝获得相同的动能，在 D 形盒里做半圆运动；半径随动能增大，直到贴着最大回旋半径被引出。题目给了三个数：$R=0.5\,\mathrm{m}$、$B=1.12\,\mathrm{T}$、$E_{k,\max}=1.5\times10^{7}\,\mathrm{eV}$。求的是这一状态下的速率，不是加速电压。

计算用质子的电荷和质量 $q=1.6\times10^{-19}\,\mathrm{C}$、$m=1.67\times10^{-27}\,\mathrm{kg}$（题目没给，按常用值取；选项是量级估计，换成 $1.6\times10^{-27}\,\mathrm{kg}$ 也仍落在 C 附近）。画面上每次过缝获得的动能取 $1\,\mathrm{MeV}$ 作代表值：真实加速电压只有几十千伏，过缝上万次，螺旋会拼成一块，看不出半径一圈圈变大。这个取值只影响过缝次数，不改变出口速率。

## 完整解答

质子在磁场中做圆周运动，洛伦兹力提供向心力：

$$
qvB=\frac{mv^{2}}{r}\implies v=\frac{qBr}{m}
$$

半径最大时速率最大。代入 $r=R=0.5\,\mathrm{m}$：

$$
v_{\max}=\frac{qBR}{m}=\frac{1.6\times10^{-19}\times1.12\times0.5}{1.67\times10^{-27}}=5.36\times10^{7}\,\mathrm{m/s}
$$

约为 $5.4\times10^{7}\,\mathrm{m/s}$。

用动能再算一次，确认三个数据自洽。先把电子伏换成焦耳：

$$
E_{k,\max}=1.5\times10^{7}\times1.6\times10^{-19}=2.4\times10^{-12}\,\mathrm{J}
$$

非相对论情形下

$$
v=\sqrt{\frac{2E_{k}}{m}}=\sqrt{\frac{2\times2.4\times10^{-12}}{1.67\times10^{-27}}}=5.36\times10^{7}\,\mathrm{m/s}
$$

两条路得到同一个数，所以 $qBR/m$ 和 $\sqrt{2E_{k}/m}$ 一致，题目给的 $R$、$B$、$E_{k,\max}$ 没有矛盾。最大速率只由最大半径和磁感应强度决定，与每次过缝获得多少动能无关：加速电压只改变过缝次数，不改变出口半径。

**A. 错误。** $3.6\times10^{6}\,\mathrm{m/s}$ 只有正确值的约 $1/15$，小了一个数量级。用 $qBR/m$ 或 $\sqrt{2E_{k}/m}$ 都得不到这一档。

**B. 错误。** $1.2\times10^{7}\,\mathrm{m/s}$ 约是正确值的 $1/4.5$。它比 $5.36\times10^{7}\,\mathrm{m/s}$ 小得多，不是本题数据算出的最大速率。

**C. 正确。** 由 $v=qBR/m$ 或 $v=\sqrt{2E_{k}/m}$ 都得到 $5.36\times10^{7}\,\mathrm{m/s}$，与 $5.4\times10^{7}\,\mathrm{m/s}$ 相差不到 $1\%$。此时 $v/c\approx0.18$，相对论修正只有约 $1.6\%$，忽略相对论效应是合适的。

**D. 错误。** $2.4\times10^{8}\,\mathrm{m/s}$ 约是正确值的 $4.5$ 倍，已达真空中光速的 $0.8$ 倍。这一档不能再忽略相对论效应，也不符合 $qBR/m$。

## 交互演示

下面是俯视。点「前进半周」看质子每过一次缝，半径按 $\sqrt{k}$ 增大（$k$ 是已走过的半圈序号）。每个半圆用时都是回旋周期的一半，与速度大小无关，所以交流电的周期可以固定。换一档「每次过缝获得的动能」，过缝次数变了，最后一圈仍贴着 $0.5\,\mathrm{m}$，出口速率不变。

D 形盒按画幅放大到半径 $1.6$（无量纲），轨迹按真实半径缩放，不按比例。

<Param name="R" label="最大回旋半径" symbol="R" value={0.5} hidden unit="m" />

<Param name="B" label="磁感应强度" symbol="B" value={1.12} hidden unit="T" color="field" />

<Param name="q" label="质子电荷" symbol="q" value={1.6e-19} hidden unit="C" color="charge" />

<Param name="m" label="质子质量" symbol="m" value={1.67e-27} hidden unit="kg" />

<Param name="eV" label="1 eV 对应的焦耳" value={1.6e-19} hidden unit="J" />

<Param name="dK" label="每次过缝获得的动能 qU" symbol="qU" value={1} unit="MeV" options={[{value: 0.5, label: "0.5 MeV"}, {value: 1, label: "1 MeV"}, {value: 1.5, label: "1.5 MeV"}, {value: 3, label: "3 MeV"}, {value: 5, label: "5 MeV"}]} />

<Param name="h" label="已转过的半圈数" value={0} min={0} max="Nh" hidden />

<Define name="EkMax" expr="1.5e7*eV" />

<Define name="vMax" expr="sqrt(2*EkMax/m)" />

<Define name="vOrbit" expr="q*B*R/m" />

<Define name="Nh" expr="15/dK" />

<Define name="r1" expr="1.35/sqrt(Nh)" />

<Define name="nX" expr="h > 1e-9 ? min(ceil(h - 1e-9), Nh) : 0" />

<Define name="EkNow" expr="nX*dK" />

<Define name="vNow" expr="sqrt(2*nX*dK*1e6*eV/m)" />

<Define name="rNow" expr="nX < 0.5 ? 0 : R*sqrt(nX/Nh)" />

<Question text="A. 3.6×10^6 m/s" set={{dK: 1, h: 15}} hint="出口速率约 5.36×10^7 m/s，这一档小了约 15 倍" />

<Question text="B. 1.2×10^7 m/s" set={{dK: 1, h: 15}} hint="出口速率约 5.36×10^7 m/s，这一档约为它的 1/4.5" />

<Question text="C. 5.4×10^7 m/s" set={{dK: 1, h: 15}} hint="由 qBR/m 或根号下的 2Ek/m 都得到约 5.36×10^7 m/s" />

<Question text="D. 2.4×10^8 m/s" set={{dK: 1, h: 15}} hint="出口速率约 5.36×10^7 m/s，这一档大了约 4.5 倍，已接近光速" />

<Preset label="题目条件，每次 1 MeV" set={{dK: 1, h: 0}} />

<Preset label="加速电压加大（每次 3 MeV）" set={{dK: 3, h: 0}} />

<Preset label="走到最大半径" set={{h: 15, dK: 1}} />

<Status cases={[
  {when: "nX < 0.5", label: "还在离子源，尚未过缝", tone: "neutral"},
  {when: "nX + 0.5 < Nh", label: "加速中：半径随过缝次数增大，速率还没到最大", tone: "info"},
  {label: "已到最大回旋半径，速率约 5.4×10^7 m/s", tone: "success"}
]} />

<Readout items={[
  {label: "最大速率（由动能）", symbol: "v_max", expr: "vMax", unit: "m/s", digits: 2, format: "sci", color: "velocity"},
  {label: "最大速率（由 qBR/m）", symbol: "qBR/m", expr: "vOrbit", unit: "m/s", digits: 2, format: "sci", color: "velocity"},
  {label: "此时动能", symbol: "E_k", expr: "EkNow", unit: "MeV", digits: 1, color: "charge"},
  {label: "此时速率", symbol: "v", expr: "vNow", unit: "m/s", digits: 2, format: "sci", color: "velocity"},
  {label: "此时回旋半径", symbol: "r", expr: "rNow", unit: "m", digits: 3, color: "field"}
]} />

<Answer items={[
  {label: "答案", text: "C"},
  {label: "最大速率", symbol: "v_max", expr: "vMax", value: 5.36e7, unit: "m/s", digits: 2, format: "sci"}
]} />

<Sim title="回旋加速器（俯视）" size="narrow" height={460} duration="Nh" time="h" step={1} stepLabel="前进半周" playSeconds={12} timeUnit="半周" params={["r1", "Nh"]} marks={[{t: "Nh", label: "到达最大半径"}]} hud={[{symbol: "E_k", label: "动能", expr: "EkNow", unit: "MeV", digits: 1}, {symbol: "v", label: "速率", expr: "vNow/1e7", unit: "×10^7 m/s", digits: 2}, {symbol: "r", label: "半径", expr: "rNow", unit: "m", digits: 2}]} legend={[{kind: "charge", label: "已走过的轨迹"}, {kind: "steel-dash", label: "后面还要走的轨迹"}]} note="D 形盒不按比例；最大半径固定为 0.5 m。qU 只改变过缝次数，出口速率都是 qBR/m ≈ 5.4×10^7 m/s。">
sim({
  at(t) { return { h: t } },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -2.15, xmax: 2.35, ymin: -2.45, ymax: 2.05, equal: true })
    const e = s.h <= 0 ? 1 : Math.floor(s.h) % 2 === 0 ? -1 : 1
    const cy = v.cyclotron(m, 0, 0, 1.6, { r1: v.p.r1, halfTurns: v.p.Nh, dir: 'in', e, sourceLabel: '交流电源' })
    v.path(m, cy.points, { color: v.color.steel, width: 1, dash: [3, 4] })
    v.path(m, cy.upTo(s.h), { color: v.color.charge, width: 1.8 })
    const pos = cy.at(s.h)
    v.ball(m, pos[0], pos[1], 0.055, { charge: true })
  },
})
</Sim>

<Plot title="速率随过缝次数增大" size="wide" caption="横轴是已过缝次数；最后一点都是 5.36×10^7 m/s，与 qU 无关"
  x={{name: "n", label: "过缝次数 n", min: 0, max: "Nh"}}
  y={{label: "v", unit: "×10^7 m/s", min: 0, max: 6}}
  series={[
    {label: "v", expr: "n < 0.5 ? 0 : sqrt(2*n*dK*1e6*eV/m)/1e7", color: "velocity"},
    {label: "v_max", expr: "vMax/1e7", color: "field", dash: true}
  ]}
  marks={[{x: "Nh", label: "v = v_max"}]}
  cursor="nX"
/>

## 结合图像看关键时刻

速率对过缝次数是一条开方曲线：每次过缝动能增加同一份 $qU$，而 $v=\sqrt{2E_{k}/m}$，所以 $v\propto\sqrt{n}$。半径同样 $r=mv/(qB)\propto\sqrt{n}$，画面上的螺旋就是这个关系。

虚线是由动能算出的最大速率 $5.36\times10^{7}\,\mathrm{m/s}$。不论每次过缝是 $0.5\,\mathrm{MeV}$ 还是 $5\,\mathrm{MeV}$，曲线都在最后一次过缝处碰到这条线：碰到的次数变了，碰到的高度不变。这就是「出口速度与加速电压无关」。

## 答案汇总

最大速率

$$
\boxed{v_{\max}\approx 5.4\times10^{7}\,\mathrm{m/s}}
$$

选 **C**。$qBR/m$ 与 $\sqrt{2E_{k,\max}/m}$ 一致，都约为 $5.36\times10^{7}\,\mathrm{m/s}$。
