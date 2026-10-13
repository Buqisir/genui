---
id: gd22-14
title: 极板间的两滴油
source: 2022 广东卷 第 14 题（计算；必考题共 42 分，原卷未单列本题分值）
question: "密立根通过观测油滴的运动规律证明了电荷的量子性，因此获得了 1923 年的诺贝尔奖。图是密立根油滴实验的原理示意图，两个水平放置、相距为 d 的足够大金属极板，上极板中央有一小孔。通过小孔喷入一些小油滴，由于碰撞或摩擦，部分油滴带上了电荷。有两个质量均为 m_0、位于同一竖直线上的球形小油滴 A 和 B，在时间 t 内都匀速下落了距离 h_1。此时给两极板加上电压 U（上极板接正极），A 继续以原速度下落，B 经过一段时间后向上匀速运动。B 在匀速运动时间 t 内上升了距离 h_2（h_2 ≠ h_1），随后与 A 合并，形成一个球形新油滴，继续在两极板间运动直至匀速。已知球形油滴受到的空气阻力大小为 f = k m^{1/3} v，其中 k 为比例系数，m 为油滴质量，v 为油滴运动速率，不计空气浮力，重力加速度为 g。求：（1）比例系数 k；（2）油滴 A、B 的带电量和电性；B 上升距离 h_2 电势能的变化量；（3）新油滴匀速运动速度的大小和方向。"
answers:
  - { name: k, value: 5, unit: u }
  - { name: qA, value: 0, unit: u }
  - { name: qB, value: -3, unit: u }
  - { name: dEp, value: 120, unit: u }
  - { name: vC, value: 1.5874, unit: u }
---

未加电压时，A、B 同在一条竖直线上以同一速率匀速下落：重力与空气阻力平衡，电力还没有出现。加上电压后，上正下负，场强竖直向下。A 仍以原速度匀速下落，说明 A 不受电力；B 先减速、再向上加速，最后以另一个速率匀速上升，说明 B 带负电。两者在同一高度相遇后合并，新油滴带 B 的电荷，再走一段变速直到另一个匀速。

题目只给字母。真实油滴的速度变化只在不到一毫秒内完成，极板间看不出过程，所以下面改用无量纲单位，取 $m_0=1$、$h_1=2$、$h_2=4$、$t=1$、$d=20$、$U=200$、$g=10$，加电压时 A 离下极板 10、B 离下极板 6。图上的刻度是这套单位，油滴本身仍放大了，不按比例。

<Param name="m0" label="油滴质量 m_0" value={1} min={0.5} max={4} step={0.5} unit="u" />

<Param name="h1" label="下落距离 h_1" value={2} min={0.5} max={4} step={0.5} unit="u" />

<Param name="h2" label="上升距离 h_2" value={4} min={1} max={8} step={0.5} unit="u" />

<Param name="t0" label="计时 t" value={1} min={0.5} max={2} step={0.1} unit="u" />

<Param name="d" label="极板间距 d" value={20} min={12} max={30} step={1} unit="u" />

<Param name="U" label="极板电压 U" value={200} min={50} max={400} step={10} unit="u" />

<Param name="yA0" label="加电压时 A 的高度" value={10} min={6} max={14} step={1} unit="u" />

<Param name="tm" label="时刻" value={0} min={0} max={8} step={0.01} unit="u" hidden />

<Param name="g" value={10} hidden />

<Define name="v1" expr="h1/t0" />

<Define name="v2" expr="h2/t0" />

<Define name="k" expr="m0*g/(v1*m0^(1/3))" />

<Define name="E" expr="U/d" />

<Define name="qA" expr="0" />

<Define name="qB" expr="-(m0*g/v1)*(v1+v2)/E" />

<Define name="dEp" expr="-qB*E*h2" />

<Define name="vC" expr="(-2*m0*g - qB*E)/(k*(2*m0)^(1/3))" />

<Define name="dirC" expr="vC > 1e-12 ? 1 : (vC < -1e-12 ? -1 : 0)" />

<Define name="yB0" expr="yA0 - d/5" />

<Define name="Tmeet" expr="(yA0 - yB0)/(v1 + v2)" />

<Define name="Tshow" expr="tMeet + 2*t0" />

<Question text="（1）比例系数 k" set={{tm: 0}} hint="未加电压，重力与阻力平衡" />

<Question text="（2）A、B 的电荷，以及 B 上升 h_2 的电势能" set={{tm: "Tmeet"}} hint="A 不受电力，B 带负电且正在匀速上升" />

<Question text="（3）新油滴匀速速度的大小和方向" set={{tm: "Tshow"}} hint="合并之后再走一个 t，速度已接近匀速值" />

<Preset label="题目数值" set={{m0: 1, h1: 2, h2: 4, t0: 1, d: 20, U: 200, yA0: 10, tm: 0}} />

<Preset label="合并后向下" set={{h2: 1, yA0: 10, tm: "Tshow"}} />

<Status cases={[
  {when: "tm < Tmeet - 1e-6", label: "A 下落、B 上升，还没有相遇", tone: "info"},
  {when: "abs(tm - Tmeet) < 1e-6", label: "正在合并", tone: "warning"},
  {when: "dirC > 0", label: "新油滴匀速向上", tone: "success"},
  {when: "dirC < 0", label: "新油滴匀速向下", tone: "success"},
  {label: "新油滴停在空中", tone: "neutral"}
]} />

<Readout items={[
  {label: "比例系数", symbol: "k", expr: "k", unit: "u", digits: 3},
  {label: "B 的电荷", symbol: "q_B", color: "charge", expr: "qB", unit: "u", digits: 3},
  {label: "电势能增量", symbol: "ΔE_p", expr: "dEp", unit: "u", digits: 2},
  {label: "新油滴速度", symbol: "v", color: "velocity", expr: "vC", unit: "u", digits: 3}
]} />

<Answer items={[
  {label: "比例系数", symbol: "k", expr: "k", value: 5, unit: "u", digits: 3},
  {label: "A 的电荷", symbol: "q_A", expr: "qA", value: 0, unit: "u", digits: 2},
  {label: "B 的电荷", symbol: "q_B", expr: "qB", value: -3, unit: "u", digits: 3},
  {label: "B 上升 h_2 的电势能增量", symbol: "ΔE_p", expr: "dEp", value: 120, unit: "u", digits: 2},
  {label: "新油滴匀速速度", symbol: "v", expr: "vC", value: 1.5874, unit: "u", digits: 3},
  {label: "新油滴方向", text: "竖直向上"}
]} />

<Motion name="drop" until="4*Tmeet + 2*t0" mass="m0*(1+merged)" charge="qB"
  state={{x: 0, y: "yB0", vx: 0, vy: "-v1", merged: 0}}
  forces={[
    {label: "G", angle: -90, magnitude: "m0*g*(1+merged)"},
    {label: "f", angle: -90, magnitude: "k*m0^(1/3)*(1+merged)^(1/3)*vy"}
  ]}
  fields={[
    {label: "加电压后的电场", E: "E", angle: -90, region: {xmin: -30, xmax: 30, ymin: 0, ymax: "d"}}
  ]}
  events={[
    {name: "tMeet", when: "y - (yA0 - v1*t)", dir: "up", set: {merged: 1}},
    {name: "tUniform", when: "merged*(vy - vC) - 0.01*vC", dir: "down"}
  ]}
  read={{vMerge: "vy @ tMeet", vEnd: "vy @ tEnd"}} />

<Sim title="两极板间的油滴" height={420} duration="Tshow" time="tm"
  params={["drop", "d", "yA0", "yB0", "v1", "Tmeet", "qA", "qB"]}
  marks={[
    {t: 0, label: "刚加上电压"},
    {t: "tMeet", label: "两滴合并"},
    {t: "tUniform", label: "新油滴匀速"}
  ]}
  hud={[
    {symbol: "v_A", label: "A 的速度", expr: "tm < Tmeet ? -v1 : vC", unit: "u", digits: 3},
    {symbol: "v", label: "下方油滴速度", expr: "drop.vy(tm)", unit: "u", digits: 3}
  ]}
  legend={[{kind: "field", label: "电场"}, {kind: "velocity", label: "速度"}]}
  note="无量纲单位；油滴放大了，不按比例；速度以向上为正">
sim({
  at(t, p) {
    const s = p.drop.state(t)
    const before = s.merged < 0.5
    return {
      yA: before ? p.yA0 - p.v1 * t : s.y,
      yB: s.y,
      vA: before ? -p.v1 : s.vy,
      vB: s.vy,
      merged: !before,
      qA: p.qA,
      qB: p.qB,
    }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -34, xmax: 40, ymin: -6, ymax: 28, equal: true })
    const p = v.p
    const half = 24
    const gap = 4.8
    v.plates(m, -half, -gap, p.d, p.d, { signs: false })
    v.plates(m, gap, half, p.d, p.d, { signs: false })
    v.regions(m, p.drop)
    v.label(m, -half, p.d, "+", { place: "above", background: false })
    v.label(m, -half, 0, "\u2212", { place: "below", background: false })
    v.label(m, 0, p.d + 3.2, "小孔", { place: "above", background: false })
    v.dim(m, half + 4, 0, half + 4, p.d, "d", { offset: 16 })
    const r = 1.5
    if (s.merged) {
      v.ball(m, 0, s.yB, r * 1.26, { charge: true })
      v.label(m, 0, s.yB, "A+B", { place: "right", offset: 16, background: false })
      v.text(m, 6.2, s.yB, "\u2212", { size: 13, color: v.color.ink, align: "left" })
    } else {
      v.ball(m, 0, s.yA, r)
      v.label(m, 0, s.yA, "A", { place: "left", offset: 14, background: false })
      v.ball(m, 0, s.yB, r, { charge: true })
      v.label(m, 0, s.yB, "B", { place: "right", offset: 16, background: false })
      v.text(m, 6.2, s.yB, "\u2212", { size: 13, color: v.color.ink, align: "left" })
    }
    if (!s.merged) v.vec(m, -4.6, s.yA, 0, -3.2, { kind: "velocity", label: "v_1" })
    if (Math.abs(s.vB) > 1e-4) {
      const up = s.vB > 0
      v.vec(m, 4.6, s.yB, 0, up ? 3.2 : -3.2, { kind: "velocity", label: up ? "v_2" : "v" })
    }
    v.trail(m, (st) => [0, st.yB], { kind: "velocity", clip: [-half, 0.6, half, p.d - 0.6] })
    v.event(m, 0, s.yB, "合并", { at: p.drop.tMeet, kind: "force" })
    v.event(m, 0, s.yB, "匀速", { at: p.drop.tUniform, kind: "velocity" })
  },
})
</Sim>

<Plot title="两滴速度" size="wide" caption="向上为正"
  x={{name: "t", label: "t", unit: "u", min: 0, max: "Tshow"}}
  y={{label: "v", unit: "u"}}
  series={[
    {label: "A", expr: "t < tMeet ? -v1 : vC", color: "graphite"},
    {label: "B，合并后为新油滴", expr: "drop.vy(t)", color: "velocity"}
  ]}
  marks={[
    {x: "tMeet", label: "合并"},
    {x: "tUniform", label: "新油滴匀速"}
  ]}
  cursor="tm" />

<ForceDiagram title="加电压后 B 的受力" size="narrow"
  surface={{type: "none"}}
  body={{shape: "particle", label: "B", charge: "-"}}
  forces={[
    {label: "G", angle: -90, magnitude: "m0*g"},
    {label: "F", angle: 90, magnitude: "-qB*E"},
    {label: "f", angle: 90, magnitude: "k*m0^(1/3)*v2"}
  ]}
  values="inline" />

## 完整解答

速率 $v_1$、$v_2$ 都取正值。速度的正方向向上，与画面、速度图一致。未加电压时，两滴都以速率

$$v_1=\frac{h_1}{t}$$

匀速下落。重力与阻力平衡：

$$m_0 g=k m_0^{1/3} v_1$$

得

$$\boxed{k=\dfrac{m_0^{2/3} g}{v_1}=\dfrac{m_0^{2/3} g\,t}{h_1}}$$

无量纲数值下 $k=5$。

加上电压后，场强大小 $E=U/d$，方向竖直向下。A 仍以 $v_1$ 匀速下落，合力仍为零，所以 A 不带电：

$$\boxed{q_A=0}$$

B 后来以

$$v_2=\frac{h_2}{t}$$

匀速上升。此时阻力向下，电力向上，三力平衡：

$$q_B E+m_0 g+k m_0^{1/3} v_2=0$$

用第（1）问的平衡消掉 $k$，得

$$\boxed{q_B=-\dfrac{m_0 g\,(v_1+v_2)}{E v_1}=-\dfrac{m_0 g\,d\,(h_1+h_2)}{U h_1}}$$

B 带负电。无量纲数值下 $q_B=-3$。

B 上升 $h_2$ 时，沿电场方向的位移为 $-h_2$，电势能增量为

$$\boxed{\Delta E_p=q_B E(-h_2)=\dfrac{m_0 g\,(h_1+h_2)\,h_2}{h_1}}$$

无量纲数值下 $\Delta E_p=120$，电势能增加。

合并后新油滴质量 $2m_0$、电荷 $q_B$。速度向上为正，阻力总是与速度反向，匀速时

$$-2m_0 g-q_B E-k(2m_0)^{1/3} v=0$$

代入 $q_B$、$k$，得

$$\boxed{v=\dfrac{v_1}{2^{1/3}}\,\dfrac{v_2-v_1}{v_1+v_2}=\dfrac{h_1}{2^{1/3} t}\,\dfrac{h_2-h_1}{h_1+h_2}}$$

$h_2>h_1$ 时 $v>0$，新油滴竖直向上匀速；$h_2<h_1$ 时竖直向下。无量纲数值取 $h_2=2h_1$，速度为 $1.587$，方向竖直向上。
