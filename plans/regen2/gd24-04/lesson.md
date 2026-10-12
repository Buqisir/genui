---
id: gd24-04
title: 电磁俘能器的感应电动势
source: 2024 广东卷 第 4 题（单选，4 分）
question: "电磁俘能器可在汽车发动机振动时利用电磁感应发电实现能量回收，结构如图甲所示。两对永磁铁可随发动机一起上下振动，每对永磁铁间有水平方向的匀强磁场，磁感应强度大小均为 B。磁场中，边长为 L 的正方形线圈竖直固定在减震装置上。某时刻磁场分布与线圈位置如图乙所示，永磁铁振动时磁场分界线不会离开线圈。关于图乙中的线圈。下列说法正确的是（　　）\n\n【图甲】左侧一块竖直灰色背板，板的右侧上下各固定一块磁铁：上面一块左面标 N、右面标 S，下面一块左面标 S、右面标 N。磁铁右方有一块竖直薄片，引出标“线圈”的细线。再向右是一块较大的竖直灰色板，朝向磁铁的一面有两块小矩形凸起，分别与上下两块磁铁相对。\n\n【图乙】一个正方形线框，上边标 L。一条水平虚线穿过线框中部，线旁标“磁场分界线”。虚线以上、线框内外都是“·”；虚线以下、线框内外都是“×”。\n\nA. 穿过线圈的磁通量为 BL^2\n\nB. 永磁铁相对线圈上升越高，线圈中感应电动势越大\n\nC. 永磁铁相对线圈上升越快，线圈中感应电动势越小\n\nD. 永磁铁相对线圈下降时，线圈中感应电流的方向为顺时针方向"
choice: D
answers: []
---

线圈固定，两对永磁铁跟着发动机上下振动，磁场分界线一直留在线圈里。题目只给了字母，下面取 $B = 0.4\ \mathrm{T}$、$L = 0.10\ \mathrm{m}$ 作为代表性数值，供演示用；选项的对错不依赖这两个数。

图乙里分界线以上磁场向外（·）、以下向里（×），大小都是 $B$。设分界线到线圈下边的距离为 $h$，则向里的部分面积是 $Lh$，向外的部分面积是 $L(L - h)$。取向里为正，穿过线圈的磁通量是

$$
\Phi = BLh - BL(L - h) = BL(2h - L)
$$

图乙的分界线正好在中部，$h = L/2$，两部分完全抵消，$\Phi = 0$，不是 $BL^2$。

分界线上下移动时，只有 $h$ 在变，感应电动势的大小是

$$
|\mathcal{E}| = \left|\frac{\Delta\Phi}{\Delta t}\right| = 2BLv
$$

其中 $v = |\Delta h/\Delta t|$ 是永磁铁相对线圈的速度大小。$\mathcal{E}$ 只跟速度有关，跟分界线停在多高没有关系；速度越大，电动势越大，不是越小。

方向用楞次定律。永磁铁相对线圈下降时 $h$ 减小，向里的磁通量减少、向外的磁通量增加，感应电流要补充向里的磁通量，由右手螺旋定则电流沿顺时针方向。

## 逐项判断

**A 错误。** 线圈上下两半磁场方向相反。图乙的分界线在中部，两部分磁通量等大反向，净磁通量为 $0$，不是 $BL^2$。一般位置是 $\Phi = BL(2h - L)$，只有分界线移到线圈边上时绝对值才能到 $BL^2$，而题目说分界线不会离开线圈。

**B 错误。** 电动势由磁通量的变化率决定。永磁铁上升得再高，只是分界线的位置 $h$ 不同，$|\mathcal{E}| = 2BLv$ 里没有 $h$。停在任何高度，速度为零时电动势都是零。

**C 错误。** 由 $|\mathcal{E}| = 2BLv$，上升越快，$v$ 越大，感应电动势越大，不是越小。

**D 正确。** 永磁铁下降时向里的磁通量减少。感应电流产生向里的磁场来补偿，右手螺旋定则判定电流沿顺时针方向。

结论：$\boxed{D}$

<Param name="B" label="磁感应强度" symbol="B" color="field" value={0.4} min={0.1} max={1} step={0.1} unit="T" />

<Param name="L" label="线圈边长" symbol="L" value={0.1} min={0.05} max={0.2} step={0.01} unit="m" />

<Param name="h" label="分界线高度" symbol="h" value={0.05} min={0.01} max={0.09} step={0.01} unit="m" />

<Param name="v" label="上升速度" symbol="v" color="velocity" value={0.2} min={-0.5} max={0.5} step={0.05} unit="m/s" />

<Define name="Phi" expr="B*L*(2*h - L)" />

<Define name="E" expr="abs(2*B*L*v)" />

<Question text="A. 穿过线圈的磁通量为 BL^2" set={{h: 0.05, v: 0}} hint="分界线在中部时两半磁通量抵消，净磁通量为 0" />

<Question text="B. 永磁铁相对线圈上升越高，线圈中感应电动势越大" set={{h: 0.08, v: 0.2}} hint="高度变了，速度不变，电动势不变" />

<Question text="C. 永磁铁相对线圈上升越快，线圈中感应电动势越小" set={{h: 0.05, v: 0.5}} hint="速度加大，电动势反而增大" />

<Question text="D. 永磁铁相对线圈下降时，线圈中感应电流的方向为顺时针方向" set={{h: 0.05, v: -0.3}} hint="下降时向里的磁通量减少，电流顺时针" />

<Preset label="图乙位置：分界线居中" set={{h: 0.05, v: 0}} />

<Preset label="下降：电流顺时针" set={{h: 0.05, v: -0.3}} />

<Status cases={[
  {when: "abs(v) < 1e-9", label: "永磁铁与线圈相对静止，无感应电流", tone: "neutral"},
  {when: "v < 0", label: "永磁铁下降：感应电流顺时针", tone: "success"},
  {label: "永磁铁上升：感应电流逆时针", tone: "info"}
]} />

<Readout items={[
  {label: "净磁通量", symbol: "Φ", color: "field", expr: "Phi", unit: "Wb", digits: 4},
  {label: "感应电动势", symbol: "|ε|", color: "charge", expr: "E", unit: "V", digits: 3}
]} />

<Answer items={[{label: "答案", text: "D"}]} />

## 交互演示

拖动分界线的高度，看净磁通量怎么变；再拖动上升速度，看电动势和电流方向。速度为负表示永磁铁相对线圈下降。线圈画成固定的正方形线框，上下两对条形永磁铁跟着分界线一起移动，尺寸不按比例。

<Figure title="图乙：线圈与磁场分界线" height={340} params={["B", "L", "h", "v", "Phi", "E"]} hud={[
  {symbol: "Φ", label: "净磁通量", expr: "Phi", unit: "Wb", digits: 4},
  {symbol: "|ε|", label: "感应电动势", expr: "E", unit: "V", digits: 3}
]} legend={[
  {kind: "field", label: "磁场 B"},
  {kind: "velocity", label: "分界线速度 v"},
  {kind: "charge", label: "感应电流"}
]} note="线圈固定；分界线始终留在线圈内，尺寸不按比例">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.85, xmax: 0.85, ymin: -0.75, ymax: 0.75, equal: true })
    const half = 0.5
    const yb = -half + p.h / p.L
    v.field(m, -half, yb, half, half, { dir: 'out', step: 22 })
    v.field(m, -half, -half, half, yb, { dir: 'in', step: 22 })
    v.line(m, -0.62, yb, 0.62, yb, { color: v.color.field, dash: true })
    v.bar(m, -half, -half, -half, half, { thick: 3 })
    v.bar(m, half, -half, half, half, { thick: 3 })
    v.bar(m, -half, half, half, half, { thick: 3 })
    v.bar(m, -half, -half, half, -half, { thick: 3 })
    v.label(m, -0.86, yb, '磁场分界线')
    v.dim(m, -half, half + 0.16, half, half + 0.16, 'L')
    if (Math.abs(p.v) > 1e-9) {
      const dir = p.v > 0 ? 1 : -1
      v.vec(m, 0.85, yb, 0, dir * 0.32, { kind: 'velocity', label: 'v' })
      const top = half - 0.12
      const bot = -half + 0.12
      const side = dir > 0 ? -1 : 1
      v.arrow(m, side * 0.34, top, side * 0.34, bot, { color: v.color.charge })
      v.arrow(m, side * 0.34, bot, -side * 0.34, bot, { color: v.color.charge })
      v.arrow(m, -side * 0.34, bot, -side * 0.34, top, { color: v.color.charge })
      v.arrow(m, -side * 0.34, top, side * 0.34, top, { color: v.color.charge })
    }
  },
})
</Figure>

<Figure title="图甲：两对永磁铁与线圈" height={340} size="wide" params={["h", "L", "v"]} note="线圈固定在减震装置上；上下两对永磁铁一起振动，尺寸不按比例">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.4, xmax: 3.4, ymin: -1.5, ymax: 1.5, equal: true })
    const yb = -0.5 + p.h / p.L
    const gap = 0.55
    v.block(m, 0.18, -1.15, 0.22, 2.3, { pivot: 'center' })
    v.magnet(m, 0.62, yb + gap, { kind: 'bar', w: 0.7, h: 0.34, north: 'left' })
    v.magnet(m, 0.62, yb - gap, { kind: 'bar', w: 0.7, h: 0.34, north: 'right' })
    v.bar(m, 1.55, -0.5, 1.55, 0.5, { thick: 3, label: '线圈' })
    v.bar(m, 1.7, -0.5, 1.7, 0.5, { thick: 3 })
    v.block(m, 2.55, -1.15, 0.55, 2.3, { pivot: 'center' })
    v.block(m, 2.2, yb + gap, 0.16, 0.34, { pivot: 'center' })
    v.block(m, 2.2, yb - gap, 0.16, 0.34, { pivot: 'center' })
    if (Math.abs(p.v) > 1e-9) {
      v.vec(m, 1.05, 1.15, 0, p.v > 0 ? 0.28 : -0.28, { kind: 'velocity', label: 'v' })
    }
  },
})
</Figure>

<Plot title="感应电动势只随速度变化" size="wide" caption="分界线留在线圈内时，|ε| = 2BLv，与高度 h 无关" x={{"name": "vv", "label": "v", "unit": "m/s", "min": -0.5, "max": 0.5}} y={{"label": "|ε|", "unit": "V", "min": 0, "max": 0.22}} series={[{label: "|ε|", expr: "2*B*L*abs(vv)", color: "charge"}]} cursor="v" />
