---
id: gd25-02
title: 同步加速器的通道
source: 2025 广东卷（部分试题）第 2 题（单选）
question: "图是某种同步加速器的原理图。直线通道 PQ 有电势差为 U 的加速电场，通道转角处有可调的匀强偏转磁场 B。电量为 +q，质量为 m 的带电粒子以速度 v_0 进入加速电场，而后可以在通道中循环加速。带电粒子在偏转磁场中运动的半径为 R。忽略相对论效应，下列说法正确的是（ ） A. 偏转磁场的磁感应强度方向垂直纸面向里 B. 加速一次后，带电粒子的动能增量为 2qU C. 加速 k 次后，带电粒子的动能增量为 v = (1/m)√(mv_0^2 + kmqU) D. 加速 k 次后，偏转磁场的磁感应强度为 B = √(m^2 v_0^2 + 2kmqU)/(qR)"
choice: D
answers:
  - { name: dEk1, value: 2, unit: J }
  - { name: dEkK, value: 6, unit: J }
  - { name: vK, value: 4, unit: m/s }
  - { name: Bk, value: 4, unit: T }
---

通道是一个圆角三角形：三条直边，加三个半径为 $R$ 的圆弧转角。底边是直线加速通道，右端是 P、左端是 Q，两端各有一条垂直虚线，电势差为 $U$。只有三个转角里有可调的匀强偏转磁场，两条斜直边上没有场，粒子沿直线滑行。

粒子带 $+q$。它要在 PQ 里被加速，必须从电势高的一端走向电势低的一端，也就是从 P 走向 Q。过了 Q 沿左边上行，再沿顶边向右，最后沿右边回到 P，整圈顺时针。

题目只给字母。下面取一组代表性数值：$q = 1\,\mathrm{C}$，$m = 1\,\mathrm{kg}$，$v_0 = 2\,\mathrm{m/s}$，$U = 2\,\mathrm{V}$，$R = 1\,\mathrm{m}$，加速次数取 $k = 3$。画面随所选的 $R$ 成比例缩放，粒子始终贴着通道走。

## 完整解答

**A. 错误。** 正粒子沿 P → Q，也就是从右向左。到达 Q 的转角后改为沿左边向上，轨迹向上弯，整圈都是顺时针。正电荷在垂直纸面向外（⊙）的磁场里顺时针转，所以 $B$ 垂直纸面向外，不是向里。

**B. 错误。** 每次穿过 PQ，电场力做正功 $qU$。洛伦兹力始终垂直于速度，不做功。加速一次，动能增量是

$$
\Delta E_k = qU
$$

不是 $2qU$。代入代表性数值，$\Delta E_k = 1 \times 2 = 2\,\mathrm{J}$。

**C. 错误。** 加速 $k$ 次，每次都增加 $qU$，动能增量是

$$
\Delta E_k = kqU
$$

选项把这个增量写成了一个速度，而且根号里少了一个 $2$。正确的速度由动能定理得出：

$$
\frac12 mv^2 = \frac12 mv_0^2 + kqU, \qquad v = \sqrt{v_0^2 + \frac{2kqU}{m}}
$$

代入 $k = 3$，动能增量 $kqU = 6\,\mathrm{J}$，速度 $v = \sqrt{4 + 12} = 4\,\mathrm{m/s}$。

**D. 正确。** 偏转半径保持为 $R$，洛伦兹力提供向心力：

$$
qvB = \frac{mv^2}{R}, \qquad B = \frac{mv}{qR}
$$

把上面的 $v$ 代入：

$$
B = \frac{m}{qR}\sqrt{v_0^2 + \frac{2kqU}{m}} = \frac{\sqrt{m^2 v_0^2 + 2kmqU}}{qR}
$$

与选项 D 一致。代入代表性数值，$B = \sqrt{4 + 12}/1 = 4\,\mathrm{T}$。速度每加速一次都变大，要保持半径仍是 $R$，转角处的 $B$ 就必须跟着调大。

所以选 D。

## 交互演示

演示的是加速 $k$ 次之后的一圈：速度已经是上面算出的 $v$，三个转角的磁场都按这个速度调到 $B = mv/(qR)$，所以粒子正好沿通道走完整圈。拖动 $k$，速度和磁场一起变大，半径不变。

<Param name="k" label="加速次数 k" value={3} min={0} max={6} step={1} control="stepper" unit="次" />

<Param name="q" label="电荷量 q" value={1} min={0.5} max={2} step={0.1} unit="C" color="charge" />

<Param name="m" label="质量 m" value={1} min={0.5} max={2} step={0.1} unit="kg" />

<Param name="v0" label="入射速度 v_0" value={2} min={1} max={4} step={0.1} unit="m/s" color="velocity" />

<Param name="U" label="加速电压 U" value={2} min={0.5} max={4} step={0.1} unit="V" color="charge" />

<Param name="R" label="偏转半径 R" value={1} min={0.6} max={1.4} step={0.1} unit="m" color="field" />

<Param name="t" value={0} hidden />

<Define name="dEk1" expr="q*U" />

<Define name="dEkK" expr="k*q*U" />

<Define name="vK" expr="sqrt(v0*v0 + 2*k*q*U/m)" />

<Define name="Bk" expr="m*vK/(q*R)" />

<Define name="Ek0" expr="0.5*m*v0*v0" />

<Define name="Ek" expr="Ek0 + dEkK" />

<Define name="Tlap" expr="(18 - 6*sqrt(3) + 2*pi)*R/vK" />

<Motion name="pt" until="Tlap" mass="m" charge="q" steps={4000}
  state={{x: "3*R", y: 0, vx: "-vK", vy: 0}}
  fields={[
    {B: "Bk", dir: "out", region: {cx: "sqrt(3)*R", cy: "R", r: "1.1*R", from: 150, to: 270}},
    {B: "Bk", dir: "out", region: {cx: "3*R", cy: "(3*sqrt(3) - 2)*R", r: "1.1*R", from: 30, to: 150}},
    {B: "Bk", dir: "out", region: {cx: "(6 - sqrt(3))*R", cy: "R", r: "1.1*R", from: -90, to: 30}}
  ]}
/>

<Question text="A. 偏转磁场的磁感应强度方向垂直纸面向里" set={{k: 3}} hint="正粒子沿通道顺时针走，磁场应该是垂直纸面向外" />

<Question text="B. 加速一次后，带电粒子的动能增量为 2qU" set={{k: 1}} hint="穿过一次 PQ，电场力只做功 qU" />

<Question text="C. 加速 k 次后，带电粒子的动能增量为 v = (1/m)√(mv_0^2 + kmqU)" set={{k: 3}} hint="动能增量是 kqU，不是一个速度" />

<Question text="D. 加速 k 次后，偏转磁场的磁感应强度为 B = √(m^2 v_0^2 + 2kmqU)/(qR)" set={{k: 3}} hint="半径不变，B 随速度一起变大" />

<Preset label="题目数值：k = 3" set={{k: 3, q: 1, m: 1, v0: 2, U: 2, R: 1}} />

<Preset label="只加速一次" set={{k: 1}} />

<Preset label="还没加速" set={{k: 0}} />

<Status cases={[
  {when: "abs(q - 1) > 1e-6 or abs(m - 1) > 1e-6 or abs(v0 - 2) > 1e-6 or abs(U - 2) > 1e-6 or abs(R - 1) > 1e-6", label: "已离开代表性数值，结果随滑块变", tone: "warning"},
  {when: "k == 0", label: "还没有加速，速度仍是 v_0", tone: "info"},
  {when: "k == 1", label: "加速一次：动能只增加 qU，不是 2qU", tone: "warning"},
  {when: "k == 3", label: "k = 3：磁场与选项 D 的式子一致", tone: "success"},
  {label: "半径保持为 R，磁场随 k 变强", tone: "neutral"}
]} />

<Readout items={[
  {label: "加速一次的动能增量", symbol: "ΔE_k", expr: "dEk1", unit: "J", digits: 2, color: "charge"},
  {label: "加速 k 次的动能增量", symbol: "kqU", expr: "dEkK", unit: "J", digits: 2, color: "charge"},
  {label: "此时的速度", symbol: "v", expr: "vK", unit: "m/s", digits: 2, color: "velocity"},
  {label: "偏转磁场", symbol: "B", expr: "Bk", unit: "T", digits: 2, color: "field"}
]} />

<Answer items={[
  {label: "答案", text: "D"},
  {label: "加速一次的动能增量", symbol: "qU", expr: "dEk1", value: 2, unit: "J", digits: 2},
  {label: "加速 3 次的动能增量", symbol: "kqU", expr: "dEkK", value: 6, unit: "J", digits: 2},
  {label: "加速 3 次后的速度", symbol: "v", expr: "vK", value: 4, unit: "m/s", digits: 2},
  {label: "加速 3 次后的磁场", symbol: "B", expr: "Bk", value: 4, unit: "T", digits: 2}
]} />

<Sim title="同步加速器的通道" height={500} duration="Tlap" time="t" playSeconds={8}
  params={["pt", "R"]}
  marks={[
    {t: 0, label: "从 P 向 Q 进入加速通道"},
    {t: "Tlap", label: "走完一圈，回到起点"}
  ]}
  hud={[
    {symbol: "v", label: "速度", expr: "vK", unit: "m/s", digits: 2},
    {symbol: "B", label: "偏转磁场", expr: "Bk", unit: "T", digits: 2}
  ]}
  legend={[{kind: "velocity", label: "粒子速度"}, {kind: "field", label: "偏转磁场（向外）"}, {kind: "charge", label: "加速电压"}]}
  note="磁场只在三个转角，⊙ 表示垂直纸面向外；画面随 R 成比例缩放。">
sim({
  at(t, p) {
    return p.pt.state(t)
  },
  draw(ctx, s, v) {
    const p = v.p
    const Rt = p.R
    const s3 = Math.sqrt(3)
    const cQ = [s3 * Rt, Rt]
    const cT = [3 * Rt, (3 * s3 - 2) * Rt]
    const cP = [(6 - s3) * Rt, Rt]
    const pol = (c, deg) => {
      const a = deg * Math.PI / 180
      return [c[0] + Rt * Math.cos(a), c[1] + Rt * Math.sin(a)]
    }
    const qIn = pol(cQ, -90)
    const qOut = pol(cQ, 150)
    const tIn = pol(cT, 150)
    const tOut = pol(cT, 30)
    const pIn = pol(cP, 30)
    const pOut = pol(cP, -90)
    const m = v.view({ xmin: -1 * Rt, xmax: 7 * Rt, ymin: -1.8 * Rt, ymax: 5.4 * Rt, equal: true })
    v.regions(m, p.pt, { step: 24 })
    v.track(m, [
      { arc: [cQ[0], cQ[1], Rt, 150, 270] },
      { line: [qIn[0], qIn[1], pOut[0], pOut[1]] },
      { arc: [cP[0], cP[1], Rt, -90, 30] },
      { line: [pIn[0], pIn[1], tOut[0], tOut[1]] },
      { arc: [cT[0], cT[1], Rt, 30, 150] },
      { line: [tIn[0], tIn[1], qOut[0], qOut[1]] },
    ], { pipe: true, pipeWidth: 16 })
    v.line(m, qIn[0], -0.34 * Rt, qIn[0], 0.34 * Rt, { color: v.color.steel, dash: true })
    v.line(m, pOut[0], -0.34 * Rt, pOut[0], 0.34 * Rt, { color: v.color.steel, dash: true })
    v.arrow(m, pOut[0], -0.78 * Rt, qIn[0], -0.78 * Rt, { color: v.color.charge })
    v.arrow(m, qIn[0], -0.78 * Rt, pOut[0], -0.78 * Rt, { color: v.color.charge })
    v.label(m, 3 * Rt, -0.78 * Rt, 'U', { color: v.color.charge })
    v.label(m, pOut[0], 0.42 * Rt, 'P', { place: 'right' })
    v.label(m, qIn[0], 0.42 * Rt, 'Q', { place: 'left' })
    v.label(m, 3 * Rt, cT[1] + Rt + 0.34 * Rt, 'R', { color: v.color.field })
    v.ball(m, s.x, s.y, 0.12 * Rt, { charge: true })
    const sp = Math.hypot(s.vx, s.vy) || 1
    v.vec(m, s.x, s.y, s.vx / sp * 0.6 * Rt, s.vy / sp * 0.6 * Rt, { kind: 'velocity', label: 'v' })
  },
})
</Sim>

<Bars title="偏转磁场随加速次数增大" size="wide"
  x={{name: "n", label: "k", unit: "次", min: 0, max: 6}}
  y={{label: "B", unit: "T"}}
  expr="m*sqrt(v0*v0 + 2*n*q*U/m)/(q*R)"
  cursor="k"
  marks={[{x: 3, label: "题目取 k = 3", style: "solid"}]}
  color="field"
  caption="半径不变，速度变大，B 就要调大"
/>

<Bars title="每加速一次增加的动能" size="narrow"
  x={{name: "n", label: "第几次", unit: "次", min: 1, max: 6}}
  y={{label: "ΔE_k", unit: "J"}}
  expr="q*U"
  marks={[{x: 1, label: "一次只有 qU", style: "outline"}]}
  color="charge"
  caption="每次都是 qU，不是 2qU"
/>

<Ledger title="加速 k 次后的动能" size="narrow" unit="J"
  parts={[
    {label: "入射动能", symbol: "E_0", expr: "Ek0", color: "velocity"},
    {label: "电场做的功", symbol: "kqU", expr: "dEkK", color: "charge"}
  ]}
  total={{label: "总动能", expr: "Ek"}}
/>

结合上面的图看：动能每加速一次只增加 $qU$，所以每根柱子一样高，不是 $2qU$。磁场随 $k$ 增大，增大的幅度由 $v = \sqrt{v_0^2 + 2kqU/m}$ 决定；选项 C 根号里少了一个 $2$，而且把动能增量写成了速度。半径一直是 $R$，多出来的那一份正好落在磁场的公式里。

## 答案

选 D。代表性数值下，加速一次动能增加 $2\,\mathrm{J}$，加速 3 次动能增加 $6\,\mathrm{J}$，速度为 $4\,\mathrm{m/s}$，偏转磁场为 $4\,\mathrm{T}$。
