---
id: gd22-08
title: 磁控管中的电子
source: 2022 广东卷 第 8 题（多选，6 分）
question: 如图所示，磁控管内局部区域分布有水平向右的匀强电场和垂直纸面向里的匀强磁场。电子从 M 点由静止释放，沿图中所示轨迹依次经过 N、P 两点。已知 M、P 在同一等势面上，下列说法正确的有（ ）
choice: BC
answers: []
---

电子带负电，由静止释放。电场水平向右，电场力向左；磁场垂直纸面向里，只改变速度方向、不做功。两力叠加，轨迹是一条向上的旋轮线：每一圈都先向左侧凹进去，再回到过 M 的那条竖直虚线上。N 是第一圈的最左端，P 是第二圈回到虚线上的那一点，与 M 同在这条等势线上。

题目没有给出场强。下面取代表性数值：电场强度 E = 200 V/m，磁感应强度 B = 0.020 T，电子的电荷量与质量用其实际值。这组数下每圈用时约 1.79 ns，向左凹进约 2.84 μm，轨迹的弯曲方向与题图一致；改变 E、B 只改变圈的大小和快慢，不改变下面的结论。

## 完整解答

设水平向右为 x 轴正方向，竖直向上为 y 轴正方向。电势沿电场线降低，等势线是竖直线；M、P 在同一竖直线上，所以

$$
\varphi_M = \varphi_P
$$

电子初速为零，电场力向左，洛伦兹力还为零，电子先向左加速。一有速度，洛伦兹力就把速度向上扭，轨迹成为旋轮线。一圈的周期、半径和沿 y 方向的平均速度分别是

$$
T = \frac{2\pi m}{|q|B}, \qquad R = \frac{mE}{|q|B^2}, \qquad v_d = \frac{E}{B}
$$

N 是第一圈的最左端，此处水平速度为零，约在 $t = T/2$；P 是第二圈回到虚线上的那一点，约在 $t = 2T$。这两个时刻都由积分定位，不手算。

**A. 错误。** 从 N 到 P，电子整体向右移动。电场力向左，与位移的水平分量方向相反，做负功，动能从 N 点的最大值一直降到 P 点的零：

$$
W_{NP} = qE(x_P - x_N) = -|q|E(x_P - x_N) < 0
$$

选项说「电场力做正功」，与上式相反，A 错误。

**B. 正确。** 电场水平向右，电势沿电场线降低，所以越靠左电势越高。N 在虚线左边，P 在虚线上，

$$
\varphi_N - \varphi_P = E(x_P - x_N) > 0
$$

代表性数值下这一差约为 0.57 V。B 正确。

**C. 正确。** 洛伦兹力始终与速度垂直，即时功率为零。从 M 到 N 也不例外：

$$
P_L = \vec F_L \cdot \vec v = 0
$$

动能的增加全部来自电场力。C 正确。

**D. 错误。** M 点速度为零，洛伦兹力为零，合力就是电场力 $|q|E$。P 与 M 在同一等势面上，电子在 P 点速度也为零，合力同样是 $|q|E$，两者相等。选项说「M 点所受合力大于 P 点」，不成立，D 错误。

答案为 BC。

## 交互演示

拖动时间，看电子沿旋轮线先到 N、再到 P。速度箭头始终切于轨迹，洛伦兹力始终垂直于速度；电场力一直向左，大小不变。

<Param name="E" label="电场强度" symbol="E" value={200} min={100} max={400} step={10} unit="V/m" color="field" />

<Param name="B" label="磁感应强度" symbol="B" value={0.02} min={0.01} max={0.04} step={0.002} unit="T" color="field" digits={3} />

<Param name="q" value={-1.6e-19} hidden />

<Param name="m" value={9.1e-31} hidden />

<Define name="ns" expr="1e9" />

<Param name="t" label="时间" value={0} min={0} max="tP*ns" step="tP*ns/200" unit="ns" hidden />

<Define name="R" expr="m*E/(abs(q)*B^2)" />

<Define name="FE" expr="abs(q)*E" />

<Motion name="pt" until="8*pi*m/(abs(q)*B)" mass="m" charge="q" steps={4000}
  state={{x: 0, y: 0, vx: 0, vy: 0}}
  fields={[{label: "电场与磁场", E: "E", angle: 0, B: "B", dir: "in", region: {xmin: "-6*R", xmax: "3*R", ymin: "-R", ymax: "16*R"}}]}
  events={[
    {name: "tN", when: "vx", dir: "up"},
    {name: "tP", when: "y - 4*pi*R", dir: "up"}
  ]}
  read={{
    xN: "x @ tN", yN: "y @ tN", vN: "sqrt(vx^2 + vy^2) @ tN",
    xP: "x @ tP", yP: "y @ tP", vP: "sqrt(vx^2 + vy^2) @ tP"
  }} />

<Define name="WNP" expr="q*E*(xP - xN)" />

<Define name="dPhi" expr="E*(xP - xN)" />

<Define name="FLN" expr="abs(q)*vN*B" />

<Define name="FM" expr="FE" />

<Define name="FP" expr="sqrt(FE^2 + (abs(q)*vP*B)^2)" />

<Sim title="磁控管中的电子" size="narrow" height={640} duration="tP*ns" time="t" timeUnit="ns" playSeconds={8}
  params={["pt", "E", "B", "q", "ns", "tN", "tP", "xN", "yN", "xP", "yP"]}
  marks={[
    {t: 0, label: "M 点释放"},
    {t: "tN*ns", label: "经过 N"},
    {t: "tP*ns", label: "到达 P"}
  ]}
  hud={[
    {symbol: "W", label: "电场力做功", expr: "q*E*pt.x(t/ns)", unit: "J", format: "sci"},
    {symbol: "v", label: "速度", expr: "sqrt(pt.vx(t/ns)^2 + pt.vy(t/ns)^2)", unit: "m/s", format: "sci"}
  ]}
  legend={[{kind: "velocity", label: "轨迹"}, {kind: "field", label: "电场力"}, {kind: "force", label: "洛伦兹力"}]}
  note="圈的大小由所取的 E、B 决定，弯曲方向与题图一致">
sim({
  at(t, p) { return p.pt.state(t / p.ns) },
  draw(ctx, s, v) {
    const span = Math.max(2.3 * Math.abs(v.p.xN), 1e-6)
    const top = Math.max(1.06 * v.p.yP, span)
    const m = v.view({ xmin: -1.15 * span, xmax: 0.42 * span, ymin: -0.05 * span, ymax: top, equal: true, pad: 16 })
    v.regions(m, v.p.pt)
    v.line(m, 0, -0.02 * span, 0, 1.02 * top, { color: v.color.steel, dash: true })
    v.trail(m, (st) => [st.x, st.y], { kind: 'velocity' })
    const sp = Math.hypot(s.vx, s.vy)
    const sc = 0.06 * span / Math.max(sp, 1)
    const off = 0.16 * span
    if (sp > 1) v.vec(m, s.x, s.y, s.vx * sc, s.vy * sc, { kind: 'velocity', label: 'v' })
    v.vec(m, s.x - off, s.y, -0.05 * span, 0, { kind: 'field' })
    v.label(m, s.x - off - 0.05 * span, s.y, 'F_E', { place: 'left', color: v.color.field })
    if (sp > 1) {
      const lx = -v.p.q * s.vy * v.p.B * sc
      const ly = v.p.q * s.vx * v.p.B * sc
      v.vec(m, s.x + off, s.y, lx, ly, { kind: 'force' })
      v.label(m, s.x + off + lx, s.y + ly, 'F_L', { place: 'right', color: v.color.force })
    }
    v.ball(m, s.x, s.y, Math.min(0.03 * span, 7 / m.s(1)), { charge: true })
    v.label(m, 0, 0, 'M', { place: 'below' })
    v.label(m, v.p.xN, v.p.yN, 'N', { place: 'left' })
    v.label(m, 0, v.p.yP, 'P', { place: 'right' })
    v.event(m, v.p.xN, v.p.yN, 'N', { at: v.p.tN * v.p.ns, kind: 'velocity' })
    v.event(m, 0, v.p.yP, 'P', { at: v.p.tP * v.p.ns, kind: 'velocity' })
  },
})
</Sim>

<Plot title="电场力做功" size="narrow"
  x={{name: "t", label: "t", unit: "ns", min: 0, max: "tP*ns"}}
  y={{label: "W", unit: "J"}}
  series={[{label: "W", expr: "q*E*pt.x(t/ns)", color: "field"}]}
  marks={[{x: "tN*ns", label: "N：做功最多"}, {x: "tP*ns", label: "P：回到零"}]}
  cursor="t" />

<Plot title="速度" size="narrow"
  x={{name: "t", label: "t", unit: "ns", min: 0, max: "tP*ns"}}
  y={{label: "v", unit: "m/s", min: 0}}
  series={[{label: "v", expr: "sqrt(pt.vx(t/ns)^2 + pt.vy(t/ns)^2)", color: "velocity"}]}
  marks={[{x: "tN*ns", label: "N：最大"}, {x: "tP*ns", label: "P：为零"}]}
  cursor="t" />

## 结合图像看选项

做功曲线在 N 点降到最低，之后回升，到 P 点回到零：从 N 到 P 电场力做负功，A 错误。速度曲线在 M、P 两点都是零，两处只有电场力，合力相等，D 错误。

<Question text="A. 电子从 N 到 P，电场力做正功" set={{t: "tP*ns"}} hint="做功曲线从 N 到 P 上升，动能在减小" />

<Question text="B. N 点的电势高于 P 点的电势" set={{t: "tN*ns"}} hint="N 在等势线左边，电场向右，左边电势高" />

<Question text="C. 电子从 M 到 N，洛伦兹力不做功" set={{t: "tN*ns"}} hint="洛伦兹力始终垂直于速度" />

<Question text="D. 电子在 M 点所受的合力大于在 P 点所受的合力" set={{t: "tP*ns"}} hint="M 与 P 速度都为零，合力都等于电场力" />

<Readout items={[
  {label: "N 到 P 电场力做功", symbol: "W_{NP}", expr: "WNP", unit: "J", format: "sci", color: "field"},
  {label: "N 比 P 高出的电势", symbol: "φ_N − φ_P", expr: "dPhi", unit: "V", digits: 2, color: "field"},
  {label: "N 点洛伦兹力", symbol: "F_L", expr: "FLN", unit: "N", format: "sci", color: "force"},
  {label: "M 点合力", symbol: "F_M", expr: "FM", unit: "N", format: "sci"},
  {label: "P 点合力", symbol: "F_P", expr: "FP", unit: "N", format: "sci"}
]} />

<Status cases={[
  {when: "WNP < 0 and dPhi > 0 and abs(FP - FM) < 1e-6*FM", label: "与题图一致：N 在左，P 回到等势线", tone: "success"},
  {label: "轨迹已偏离题图", tone: "warning"}
]} />

<Preset label="题目取值" set={{E: 200, B: 0.02, t: 0}} />

<Preset label="看 N 点" set={{t: "tN*ns"}} />

<Preset label="看 P 点" set={{t: "tP*ns"}} />

<Answer items={[
  {label: "答案", text: "BC"},
  {label: "A", text: "错误：从 N 到 P 电场力做负功"},
  {label: "B", text: "正确：N 在左，电势更高"},
  {label: "C", text: "正确：洛伦兹力始终不做功"},
  {label: "D", text: "错误：M 与 P 速度都为零，合力相等"}
]} />
