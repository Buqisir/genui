---
id: gd22-09
title: 无人小车爬斜坡
source: 2022 广东卷 第 9 题（多选，6 分）
question: 如图所示，载有防疫物资的无人驾驶小车，在水平 MN 段以恒定功率 200 W、速度 5 m/s 匀速行驶，在斜坡 PQ 段以恒定功率 570 W、速度 2 m/s 匀速行驶。已知小车总质量为 50 kg，MN = PQ = 20 m，PQ 段的倾角为 30°，重力加速度 g 取 10 m/s^2，不计空气阻力。下列说法正确的有（ ）
choice: ABD
answers:
  - { name: Fmn, value: 40, unit: N }
  - { name: Wfmn, value: 800, unit: J }
  - { name: dEp, value: 5000, unit: J }
  - { name: Wfpq, value: 700, unit: J }
---

小车先在水平路面 MN 上向左匀速行驶，过 N 后沿斜坡 PQ 向左上方匀速上坡，坡顶是 Q。两段都是恒定功率、恒定速度，牵引力与阻力沿行驶方向平衡：水平段阻力就是摩擦力，斜坡段阻力是摩擦力加上重力沿斜面向下的分力。

两段之间怎么过渡题目没有给，下面只比较两段分别的匀速状态。

## 完整解答

恒定功率下牵引力 $F = P/v$。匀速时沿行驶方向合力为零，克服摩擦力做的功等于摩擦力与路程的乘积。

**A. 正确。** MN 段功率 200 W、速度 5 m/s，牵引力

$$
F_{MN} = \frac{P_{MN}}{v_{MN}} = \frac{200}{5}\ \mathrm{N} = \boxed{40\ \mathrm{N}}
$$

水平路面上重力与支持力垂直于速度，沿路面只有牵引力和摩擦力。匀速，两者大小相等，摩擦力也是 40 N。A 正确。

**B. 正确。** MN 长 20 m，克服摩擦力做功

$$
W_{f,MN} = f_{MN}\,MN = 40 \times 20\ \mathrm{J} = \boxed{800\ \mathrm{J}}
$$

这一段牵引力做的功 $P_{MN}t = 200 \times 4\ \mathrm{J} = 800\ \mathrm{J}$，全部用来克服摩擦。B 正确。

**C. 错误。** PQ 长 20 m、倾角 30°，上升高度 $h = PQ\sin 30^\circ = 10\ \mathrm{m}$，重力势能增加

$$
\Delta E_p = mgh = 50 \times 10 \times 10\ \mathrm{J} = \boxed{5 \times 10^3\ \mathrm{J}}
$$

选项写成 $1 \times 10^4\ \mathrm{J}$，正好大了一倍。C 错误。

**D. 正确。** PQ 段功率 570 W、速度 2 m/s，牵引力

$$
F_{PQ} = \frac{P_{PQ}}{v_{PQ}} = \frac{570}{2}\ \mathrm{N} = 285\ \mathrm{N}
$$

沿斜面向上匀速，牵引力等于摩擦力加上重力沿斜面向下的分力：

$$
f_{PQ} = F_{PQ} - mg\sin 30^\circ = 285 - 50 \times 10 \times 0.5 = 35\ \mathrm{N}
$$

克服摩擦力做功

$$
W_{f,PQ} = f_{PQ}\,PQ = 35 \times 20\ \mathrm{J} = \boxed{700\ \mathrm{J}}
$$

用能量核对：这一段用时 10 s，牵引力做功 $570 \times 10\ \mathrm{J} = 5700\ \mathrm{J}$，其中 5000 J 变成重力势能，剩下 700 J 用来克服摩擦。D 正确。

答案为 ABD。

## 交互演示

切换路段，比较两段匀速时的牵引力、摩擦力和能量去向。水平段牵引力全部对抗摩擦；斜坡段大部分用来抬高重力势能。右侧可以拖动功率和速度，离开题目数值后看各量怎么变。

<Param name="seg" label="路段" value={1} options={[{value: 1, label: "水平 MN"}, {value: 2, label: "斜坡 PQ"}]} />

<Param name="Pmn" label="MN 段功率" symbol="P_{MN}" value={200} min={100} max={400} step={10} unit="W" color="charge" />

<Param name="vmn" label="MN 段速度" symbol="v_{MN}" value={5} min={2} max={8} step={0.5} unit="m/s" color="velocity" />

<Param name="Ppq" label="PQ 段功率" symbol="P_{PQ}" value={570} min={300} max={800} step={10} unit="W" color="charge" />

<Param name="vpq" label="PQ 段速度" symbol="v_{PQ}" value={2} min={1} max={5} step={0.5} unit="m/s" color="velocity" />

<Param name="m" label="质量" value={50} hidden />

<Param name="g" value={10} hidden />

<Param name="theta" label="倾角" value={30} hidden />

<Param name="L" label="每段长度" value={20} hidden />

<Define name="Fmn" expr="Pmn/vmn" />

<Define name="Fpq" expr="Ppq/vpq" />

<Define name="fmn" expr="Fmn" />

<Define name="fpq" expr="Fpq - m*g*sin(deg(theta))" />

<Define name="Wfmn" expr="fmn*L" />

<Define name="h" expr="L*sin(deg(theta))" />

<Define name="dEp" expr="m*g*h" />

<Define name="Wfpq" expr="fpq*L" />

<Define name="Wmn" expr="Pmn*L/vmn" />

<Define name="Wpq" expr="Ppq*L/vpq" />

<Figure title="小车走过两段路" height={340}
  params={["seg", "L", "theta"]}
  hud={[
    {symbol: "F", label: "牵引力", expr: "seg < 1.5 ? Fmn : Fpq", unit: "N", digits: 0},
    {symbol: "f", label: "摩擦力", expr: "seg < 1.5 ? fmn : fpq", unit: "N", digits: 0}
  ]}
  legend={[{kind: "charge", label: "牵引力"}, {kind: "force", label: "摩擦力"}, {kind: "velocity", label: "速度"}]}
  note="路面按比例；两段之间的过渡题目未给出，这里只并排两个匀速状态">
figure({
  draw(ctx, p, v) {
    const L = p.L
    const th = p.theta * Math.PI / 180
    const H = L * Math.sin(th)
    const m = v.view({ xmin: -1.5, xmax: L + 3, ymin: -1.6, ymax: H + 3.2, equal: true })
    const slope = [{ line: [L, 0, 0, H], flip: true }]
    v.track(m, slope, { marks: [{ x: L, y: 0, label: 'N' }, { s: L / 2, label: 'P' }, { x: 0, y: H, label: 'Q' }] })
    v.ground(m, L, 2 * L + 2, 0)
    v.label(m, 1.6 * L, -0.55, 'M', { place: 'below' })
    const onSlope = p.seg >= 1.5
    if (!onSlope) {
      const c = v.cart(m, 1.15 * L, 0, 4.2, 1.5, { label: '小车' })
      const cx = (c.left + c.right) / 2
      const cy = (c.top + c.bottom) / 2
      v.vec(m, cx, cy, -3.2, 0, { kind: 'charge', label: 'F' })
      v.vec(m, cx, c.bottom + 0.15, 2.4, 0, { kind: 'force', label: 'f' })
      v.vec(m, cx, c.top + 1.05, -2.6, 0, { kind: 'velocity', label: 'v' })
    } else {
      const u = L * 0.2
      const b = v.block(m, L - u * Math.cos(th), u * Math.sin(th), 3.2, 1.4, { angle: 180 - p.theta, label: '小车' })
      const ux = -Math.cos(th)
      const uy = Math.sin(th)
      v.vec(m, b.center[0], b.center[1], ux * 2.8, uy * 2.8, { kind: 'charge', label: 'F' })
      v.vec(m, b.corners[0][0], b.corners[0][1], -ux * 2.2, -uy * 2.2, { kind: 'force', label: 'f' })
      const above = [b.center[0] + uy * 1.7, b.center[1] - ux * 1.7]
      v.vec(m, above[0], above[1], ux * 2.4, uy * 2.4, { kind: 'velocity', label: 'v' })
    }
    v.dim(m, L, -1.05, 2 * L, -1.05, 'MN = 20 m')
    v.dim(m, -0.9, 0, -0.9, H, 'h')
  },
})
</Figure>

<ForceDiagram title="水平段受力" size="narrow"
  surface={{type: "ground"}}
  body={{shape: "block", label: "小车"}}
  mass="m"
  accel={{angle: 180, magnitude: 0}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g"},
    {label: "N", angle: 90, solve: "Nmn"},
    {label: "F", angle: 180, magnitude: "Fmn"},
    {label: "f", angle: 0, magnitude: "fmn", at: "contact"}
  ]}
  guides={[{label: "v", angle: 180, color: "velocity"}]} />

<ForceDiagram title="斜坡段受力" size="narrow"
  surface={{type: "incline", angle: "-theta", angleLabel: "30°"}}
  body={{shape: "block", label: "小车"}}
  mass="m"
  accel={{angle: "180 - theta", magnitude: 0}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g"},
    {label: "N", angle: "90 - theta", solve: "Npq"},
    {label: "F", angle: "180 - theta", magnitude: "Fpq"},
    {label: "f", angle: "-theta", magnitude: "fpq", at: "contact"}
  ]}
  decompose={{force: 0, axes: "incline", labels: ["mg sinθ", "mg cosθ"]}}
  guides={[{label: "v", angle: "180 - theta", color: "velocity"}]} />

<Ledger title="牵引力做功的去向" unit="J"
  parts={[
    {label: "克服摩擦", symbol: "W_f", expr: "seg < 1.5 ? Wfmn : Wfpq", color: "force"},
    {label: "重力势能增加", symbol: "ΔE_p", expr: "seg < 1.5 ? 0 : dEp", color: "field"}
  ]}
  rows={[{label: "水平 MN", at: {seg: 1}}, {label: "斜坡 PQ", at: {seg: 2}}]}
  total={{label: "牵引力做功", expr: "seg < 1.5 ? Wmn : Wpq"}} />

## 结合图像看选项

水平段的力平衡里，牵引力和摩擦力一样长，都是 40 N；走完 20 m，克服摩擦做功 800 J，账本左边那一条全是摩擦。

斜坡段把重力沿斜面分解：沿斜面向下的分力 250 N，牵引力 285 N，多出的 35 N 对抗摩擦。账本右边那一条里，5700 J 的牵引力做功分成两份，5000 J 变成重力势能，剩下 700 J 克服摩擦。C 把势能增加写成 10000 J，比算出来的大一倍，所以不选。

<Question text="A. 从 M 到 N，小车牵引力大小为 40 N" set={{seg: 1, Pmn: 200, vmn: 5}} hint="F = P/v = 200/5 = 40 N" />

<Question text="B. 从 M 到 N，小车克服摩擦力做功 800 J" set={{seg: 1, Pmn: 200, vmn: 5}} hint="摩擦力 40 N，路程 20 m" />

<Question text="C. 从 P 到 Q，小车重力势能增加 1×10^4 J" set={{seg: 2, Ppq: 570, vpq: 2}} hint="上升 10 m，mgh = 5000×2 J" />

<Question text="D. 从 P 到 Q，小车克服摩擦力做功 700 J" set={{seg: 2, Ppq: 570, vpq: 2}} hint="摩擦力 35 N，路程 20 m" />

<Readout items={[
  {label: "MN 段牵引力", symbol: "F_{MN}", expr: "Fmn", unit: "N", digits: 1, color: "charge"},
  {label: "MN 段克服摩擦做功", symbol: "W_{f,MN}", expr: "Wfmn", unit: "J", digits: 0, color: "force"},
  {label: "PQ 段重力势能增加", symbol: "ΔE_p", expr: "dEp", unit: "J", format: "sci", color: "field"},
  {label: "PQ 段克服摩擦做功", symbol: "W_{f,PQ}", expr: "Wfpq", unit: "J", digits: 0, color: "force"}
]} />

<Status cases={[
  {when: "fpq < 0", label: "功率不够，维持不了这个上坡速度", tone: "warning"},
  {when: "abs(Fmn - 40) < 0.4 and abs(Wfmn - 800) < 8 and abs(dEp - 5000) < 50 and abs(Wfpq - 700) < 7", label: "与题目数值一致：ABD 成立，C 偏大一倍", tone: "success"},
  {label: "已离开题目数值", tone: "neutral"}
]} />

<Preset label="题目取值" set={{seg: 1, Pmn: 200, vmn: 5, Ppq: 570, vpq: 2}} />

<Preset label="看斜坡段" set={{seg: 2}} />

<Answer items={[
  {label: "答案", text: "ABD"},
  {label: "MN 段牵引力", symbol: "F_{MN}", expr: "Fmn", value: 40, unit: "N"},
  {label: "MN 段克服摩擦做功", symbol: "W_{f,MN}", expr: "Wfmn", value: 800, unit: "J"},
  {label: "重力势能增加", symbol: "ΔE_p", expr: "dEp", value: 5000, unit: "J"},
  {label: "PQ 段克服摩擦做功", symbol: "W_{f,PQ}", expr: "Wfpq", value: 700, unit: "J"}
]} />
