---
id: gd21-14
title: 花瓣形电子加速器
source: 2021 广东卷 第 14 题（计算；必考题共 42 分，原卷未单列本题分值）
question: |
  图是一种花瓣形电子加速器简化示意图，空间有三个同心圆 a、b、c 围成的区域，圆 a 内为无场区，圆 a 与圆 b 之间存在辐射状电场，圆 b 与圆 c 之间有三个圆心角均略小于 90°的扇环形匀强磁场区Ⅰ、Ⅱ和Ⅲ。各区感应强度恒定，大小不同，方向均垂直纸面向外。电子以初动能 E_{k0} 从圆 b 上 P 点沿径向进入电场，电场可以反向，保证电子每次进入电场即被全程加速，已知圆 a 与圆 b 之间电势差为 U，圆 b 半径为 R，圆 c 半径为 √3 R，电子质量为 m，电荷量为 e，忽略相对论效应，取 tan 22.5° = 0.4。

  （1）当 E_{k0} = 0 时，电子加速后均沿各磁场区边缘进入磁场，且在电场内相邻运动轨迹的夹角 θ 均为 45°，最终从 Q 点出射，运动轨迹如图中带箭头实线所示，求Ⅰ区的磁感应强度大小、电子在Ⅰ区磁场中的运动时间及在 Q 点出射时的动能；

  （2）已知电子只要不与Ⅰ区磁场外边界相碰，就能从出射区域出射。当 E_{k0} = keU 时，要保证电子从出射区域出射，求 k 的最大值。
answers:
  - { name: B1, value: 5, unit: T }
  - { name: t1, value: 0.7854, unit: s }
  - { name: EkQ, value: 8, unit: eV }
  - { name: kMax, value: 2.1667 }
---

题目只有字母。取 $e = 1$、$m = 1$、$U = 1$、$R = 1$，算出的磁感应强度以 $\sqrt{mU/e}/R$ 为单位，时间以 $R\sqrt{m/(eU)}$ 为单位，动能以 $eU$ 为单位，正文给出还原后的字母式。

圆 a 内无场，电子在里面沿直线匀速。圆 a 与圆 b 之间是辐射状电场，电势差为 $U$，场强大小 $E = U/(R - R_a)$；电场可以反向，所以电子每穿过这一层径向缝都得到能量 $eU$。圆 b 与圆 c 之间的三个扇环是匀强磁场，方向都垂直纸面向外。

<Param name="k" label="初动能系数 k" value={0} min={0} max={14} step={0.05} />

<Param name="tm" label="时刻" value={0} min={0} max={8} step={0.01} unit="s" hidden />

<Param name="m" value={1} hidden />

<Param name="e" value={1} hidden />

<Param name="U" value={1} hidden />

<Param name="R" value={1} hidden />

<Param name="Ra" value={0.5} hidden />

<Define name="E0" expr="U/(R - Ra)" />

<Define name="B1" expr="5/R*sqrt(m*U/e)" />

<Define name="B2" expr="B1*sqrt(3/2)" />

<Define name="B3" expr="B1*sqrt(2)" />

<Define name="t1" expr="pi*R/4*sqrt(m/(e*U))" />

<Define name="EkQ" expr="8*e*U" />

<Define name="kMax" expr="13/6" />

<Define name="Rc" expr="sqrt(3)*R" />

<Motion name="pt" until={8} mass="m" charge="-e" steps={12000}
  state={{x: "-(R - 1e-4)", y: 0, vx: "sqrt(2*k*e*U/m)", vy: 0, dir: 1}}
  rates={{"dir": "0"}}
  fields={[
    {label: "辐射电场", radial: true, cx: 0, cy: 0, E: "E0*dir", region: {cx: 0, cy: 0, r: "R", inner: "Ra"}},
    {B: "sqrt(x*x + y*y) > R ? B1 : 0", dir: "out", region: {cx: 0, cy: 0, r: "Rc", inner: "0.9*R", from: -15, to: 50}},
    {B: "sqrt(x*x + y*y) > R ? B2 : 0", dir: "out", region: {cx: 0, cy: 0, r: "Rc", inner: "0.9*R", from: 210, to: 275}},
    {B: "sqrt(x*x + y*y) > R ? B3 : 0", dir: "out", region: {cx: 0, cy: 0, r: "Rc", inner: "0.9*R", from: 80, to: 140}}
  ]}
  events={[
    {name: "tTurn", when: "(sqrt(x*x + y*y) - Ra)*(x*vx + y*vy)", dir: "down", set: {dir: "-dir"}},
    {name: "tOut", when: "sqrt(x*x + y*y) - 2.2*R", dir: "up", stop: true}
  ]}
  read={{
    KOut: "0.5*m*(vx*vx + vy*vy) @ tOut",
    rMax: "max(sqrt(x*x + y*y))"
  }}
/>

<Question text="（1）E_k0 = 0：求Ⅰ区磁感应强度、在Ⅰ区的运动时间和 Q 点动能" set={{k: 0, tm: 0}} hint="相邻轨迹夹角 45°，圆心正好落在圆 b 上" />

<Question text="（2）E_k0 = keU：不碰Ⅰ区外边界时，k 最大是多少" set={{k: 2.17, tm: 0}} hint="第一圈的圆弧刚好贴上圆 c" />

<Preset label="第（1）问：从静止开始" set={{k: 0, tm: 0}} />

<Preset label="k 取最大值" set={{k: 2.17, tm: 0}} />

<Preset label="超过最大值，碰外边界" set={{k: 4, tm: 0}} />

<Status cases={[
  {when: "pt.rMax < Rc + 0.02", label: "不碰Ⅰ区外边界，能从出射区出去", tone: "success"},
  {label: "第一圈就碰到Ⅰ区外边界", tone: "danger"}
]} />

<Readout items={[
  {label: "Ⅰ区磁感应强度", symbol: "B_1", expr: "B1", unit: "T", digits: 2, color: "field"},
  {label: "在Ⅰ区的时间", symbol: "t_1", expr: "t1", unit: "s", digits: 4},
  {label: "此刻动能", symbol: "E_k", expr: "0.5*m*(pt.vx(tm)^2 + pt.vy(tm)^2)", unit: "eU", digits: 2, color: "velocity"},
  {label: "轨迹最大半径", symbol: "r", expr: "pt.rMax", unit: "R", digits: 3}
]} />

<Answer items={[
  {label: "Ⅰ区磁感应强度", symbol: "B_1", expr: "B1", value: 5, unit: "T", digits: 2},
  {label: "在Ⅰ区的运动时间", symbol: "t_1", expr: "t1", value: 0.7854, unit: "s", digits: 4},
  {label: "Q 点出射动能", symbol: "E_{kQ}", expr: "EkQ", value: 8, unit: "eU"},
  {label: "k 的最大值", symbol: "k", expr: "kMax", value: 2.1667, digits: 3}
]} />

<Sim title="花瓣形电子加速器" height={460} duration="min(pt.tOut, 8)" time="tm" playSeconds={12}
  params={["pt", "R", "Ra", "Rc", "k"]}
  marks={[
    {t: 0, label: "从 P 点进入电场"},
    {t: "t1", label: "离开Ⅰ区磁场"}
  ]}
  hud={[
    {symbol: "E_k", label: "动能", expr: "0.5*m*(pt.vx(tm)^2 + pt.vy(tm)^2)", unit: "eU", digits: 2},
    {symbol: "k", label: "初动能系数", expr: "k", digits: 2}
  ]}
  legend={[
    {kind: "field", label: "磁场垂直纸面向外"},
    {kind: "charge", label: "电子轨迹"}
  ]}
  note="圆 a 半径取 R/2（题目未给，只影响电场强弱）；扇环画宽了，注明不按比例">
sim({
  at(t, p) { return p.pt.state(t) },
  draw(ctx, s, v) {
    const R = p.R
    const m = v.view({ xmin: -2.5 * R, xmax: 2.7 * R, ymin: -2.2 * R, ymax: 2.2 * R })
    v.regions(m, p.pt)
    v.circle(m, 0, 0, p.Ra, { color: v.color.steel, dash: true })
    v.circle(m, 0, 0, R, { color: v.color.ink })
    v.circle(m, 0, 0, p.Rc, { color: v.color.steel })
    v.label(m, 1.35 * R, 0.55 * R, 'Ⅰ')
    v.label(m, -0.35 * R, -1.5 * R, 'Ⅱ')
    v.label(m, -1.45 * R, 0.7 * R, 'Ⅲ')
    v.label(m, -0.22 * R, 0.16 * R, 'a')
    v.label(m, 0.55 * R, -0.75 * R, 'b')
    v.label(m, 1.5 * R, -1.15 * R, 'c')
    v.trail(m, (ss) => [ss.x, ss.y], { kind: 'charge' })
    v.ball(m, s.x, s.y, 0.055 * R, { charge: true })
    v.label(m, -1.18 * R, 0.12 * R, 'P')
    v.arrow(m, 1.7 * R, -1.35 * R, 2.3 * R, -1.35 * R, { color: v.color.charge })
    v.label(m, 2.35 * R, -1.15 * R, '出射')
    v.dim(m, 0, -1.85 * R, R, -1.85 * R, 'R')
  },
})
</Sim>

<Dial title="轨迹最大半径" expr="pt.rMax" min={1} max={3} unit="R" symbol="r" color="charge" digits={2}
  arcs={[{from: 1, to: "Rc", color: "field", label: "不碰外边界"}]}
  footer={[{label: "圆 c", from: "Rc", color: "field"}]} />

## 题目条件分析

三个同心圆把空间分成四部分。圆 a 内没有电场也没有磁场，电子在里面沿直线匀速。圆 a 与圆 b 之间是辐射状电场，两圆电势差为 $U$，电子每沿径向穿过一次，动能增加 $eU$。圆 b 与圆 c 之间是三个圆心角略小于 $90^\circ$ 的扇环形匀强磁场，方向都垂直纸面向外，磁感应强度各不相同。

电子带负电。在垂直纸面向外的磁场里，负电荷沿顺时针转。题目规定电场可以反向，所以无论电子是向里还是向外穿过电场，电场都把它往前进方向拉，每次都加速。

## 完整解答

### （1）从静止开始

$E_{k0} = 0$，电子从 P 点由静止被电场拉向圆心，到圆 a 时动能是 $eU$。圆 a 内无场，它沿直线穿过，再向外穿过电场，又得 $eU$，到达圆 b 时

$$E_{k1} = 2eU, \qquad v_1 = \sqrt{\dfrac{4eU}{m}}.$$

题目说电子沿磁场区边缘进入，并且电场里相邻两条轨迹的夹角 $\theta = 45^\circ$。电子在磁场里顺时针转过一段圆弧后再沿径向回到圆 b，速度方向转过的是 $180^\circ - 45^\circ = 135^\circ$，所以这段圆弧的圆心角是 $135^\circ$。圆心落在圆 b 上，半径

$$r_1 = R\tan 22.5^\circ = 0.4R.$$

由 $r = mv/(eB)$，

$$B_1 = \frac{mv_1}{er_1} = \frac{m}{e\cdot 0.4R}\sqrt{\frac{4eU}{m}} = \frac{5}{R}\sqrt{\frac{mU}{e}}.$$

$$\boxed{B_1 = \dfrac{5}{R}\sqrt{\dfrac{mU}{e}}}$$

圆弧的圆心角是 $3\pi/4$，周期 $T = 2\pi m/(eB_1)$，所以在Ⅰ区的运动时间

$$t_1 = \frac{3}{8}\cdot\frac{2\pi m}{eB_1} = \frac{3\pi R}{20}\sqrt{\frac{m}{eU}}.$$

取题目给的单位后，数值是 $t_1 = \pi R/4\,\sqrt{m/(eU)}$。

$$\boxed{t_1 = \dfrac{\pi R}{4}\sqrt{\dfrac{m}{eU}}}$$

每进一次磁场再回到圆 b，电子在电场里往返一次，动能增加 $2eU$。从 P 到 Q 一共进入磁场三次，出去时

$$E_{kQ} = E_{k0} + 4\times 2eU = 8eU.$$

$$\boxed{E_{kQ} = 8eU}$$

三次进入磁场时的动能是 $2eU$、$3eU$、$4eU$，半径都是 $0.4R$，所以三个区的磁感应强度比是 $\sqrt{2}:\sqrt{3}:2$，即 $B_2 = \sqrt{3/2}\,B_1$，$B_3 = \sqrt{2}\,B_1$。

### （2）初动能不为零

$E_{k0} = keU$ 时，第一次到达圆 b 的动能是 $(k + 2)eU$，半径

$$r_1 = \frac{mv_1}{eB_1} = 0.4R\sqrt{\frac{k + 2}{2}}.$$

圆心仍在过入射点的圆 b 切线上。电子不碰Ⅰ区外边界，就是这段圆弧的最高点不超过圆 c：

圆弧向外最远的一点到加速器中心的距离是 $\sqrt{R^2 + r_1^2} + r_1$ 在 $22.5^\circ$ 方向上的投影。刚好贴上圆 c 时 $r_1 = R/\sqrt{3}$，代回

$$0.4\sqrt{\frac{k + 2}{2}} = \frac{1}{\sqrt{3}}, \qquad k + 2 = \frac{2}{0.48} = \frac{25}{6}, \qquad k = \frac{25}{6} - 2 = \frac{13}{6}.$$

$$\boxed{k_{\max} = \dfrac{13}{6} \approx 2.17}$$

## 交互演示

拖动「初动能系数 k」。k = 0 是第（1）问：电子从 P 点静止出发，在三个扇环里各转 $45^\circ$，动能依次是 $2eU$、$4eU$、$6eU$，最后以 $8eU$ 从右下方出射。虚线是按上面算的三段圆弧，用来对照。

k 增大时第一圈的圆弧变大，表盘上的最大半径跟着上升。半径顶到 $\sqrt{3}\,R$ 时就是第（2）问的临界；再大，电子还没转完就撞上Ⅰ区的外边界，出不去。

## 关键时刻

- 第一次回到圆 b：动能 $2eU$，进入Ⅰ区，转过 $45^\circ$ 用时 $t_1$。
- 第二次回到圆 b：动能 $4eU$，进入Ⅱ区，磁感应强度大 $\sqrt{2}$ 倍，半径仍是 $0.4R$。
- 第三次回到圆 b：动能 $6eU$，进入Ⅲ区，转完后以 $8eU$ 沿 $45^\circ$ 方向出射。

## 答案汇总

| 所求 | 结果 |
|---|---|
| Ⅰ区磁感应强度 $B_1$ | $\dfrac{5}{R}\sqrt{\dfrac{mU}{e}}$ |
| 在Ⅰ区的运动时间 $t_1$ | $\dfrac{\pi R}{4}\sqrt{\dfrac{m}{eU}}$ |
| Q 点出射动能 $E_{kQ}$ | $8eU$ |
| k 的最大值 | $\dfrac{13}{6}$ |
