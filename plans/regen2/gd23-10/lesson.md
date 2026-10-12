---
id: gd23-10
title: 电动窗帘滑块的碰撞
source: 2023 广东卷 第 10 题（多选，6 分）
question: "某同学受电动窗帘的启发，设计了如图所示的简化模型．多个质量均为 1 kg 的滑块可在水平滑轨上滑动，忽略阻力．开窗帘过程中，电机对滑块 1 施加一个水平向右的恒力 F，推动滑块 1 以 0.40 m/s 的速度与静止的滑块 2 碰撞，碰撞时间为 0.04 s，碰撞结束后瞬间两滑块的共同速度为 0.22 m/s．关于两滑块的碰撞过程，下列说法正确的有（　　）"
choice: BD
answers:
  - { name: I1, value: -0.18, unit: "N·s" }
  - { name: I2, value: 0.22, unit: "N·s" }
  - { name: Favg, value: 5.5, unit: N }
---

开窗帘时，电机只对滑块 1 施加水平向右的恒力 $F$。滑块 1 以 $v_0 = 0.40\,\mathrm{m/s}$ 碰上静止的滑块 2，经 $\Delta t = 0.04\,\mathrm{s}$ 后两者共速 $v = 0.22\,\mathrm{m/s}$。滑块质量均为 $m = 1\,\mathrm{kg}$，滑轨阻力忽略。碰撞时间很短，滑块 3 及以后的滑块还没有参与这次碰撞。

## 完整解答

取向右为正。碰撞前后，两滑块组成的系统动量为

$$
m v_0 = 1 \times 0.40 = 0.40\,\mathrm{N\cdot s}, \qquad 2mv = 2 \times 0.22 = 0.44\,\mathrm{N\cdot s}.
$$

动量增加了 $0.04\,\mathrm{N\cdot s}$，正是碰撞期间恒力 $F$ 的冲量。由此得

$$
F\,\Delta t = 2mv - mv_0 \implies F = \frac{0.04}{0.04} = 1\,\mathrm{N}.
$$

**A. 该过程动量守恒：错误。** 电机的恒力 $F$ 始终作用在滑块 1 上，它是系统的外力。滑轨的支持力与重力相互平衡，水平方向的外力不为零，系统动量从 $0.40\,\mathrm{N\cdot s}$ 增到 $0.44\,\mathrm{N\cdot s}$，不守恒。

**B. 滑块 1 受到合外力的冲量大小为 $0.18\,\mathrm{N\cdot s}$：正确。** 对滑块 1，由动量定理

$$
I_1 = \Delta p_1 = mv - mv_0 = 0.22 - 0.40 = -0.18\,\mathrm{N\cdot s},
$$

大小为 $\boxed{0.18\,\mathrm{N\cdot s}}$，方向向左。把这个合冲量拆开：滑块2 对滑块1 的平均作用力冲量为 $-\bar F_{12}\Delta t = -0.22\,\mathrm{N\cdot s}$，电机恒力的冲量为 $F\,\Delta t = +0.04\,\mathrm{N\cdot s}$，两者相加

$$
-0.22 + 0.04 = -0.18\,\mathrm{N\cdot s}.
$$

所以 B 要的是合外力冲量，必须把碰撞力和电机恒力一起算进去，不能只取碰撞力的 $0.22\,\mathrm{N\cdot s}$。

**C. 滑块 2 受到合外力的冲量大小为 $0.40\,\mathrm{N\cdot s}$：错误。** 滑块 2 水平方向只受滑块 1 的作用力，合外力就是这个力。冲量为

$$
I_2 = \Delta p_2 = mv - 0 = \boxed{0.22\,\mathrm{N\cdot s}},
$$

方向向右。选项把它写成了碰撞前滑块 1 的动量 $0.40\,\mathrm{N\cdot s}$。

**D. 滑块 2 受到滑块 1 的平均作用力大小为 $5.5\,\mathrm{N}$：正确。** 平均作用力就是这个冲量除以碰撞时间：

$$
\bar F_{12} = \frac{I_2}{\Delta t} = \frac{0.22}{0.04} = \boxed{5.5\,\mathrm{N}}.
$$

它比电机的恒力 $1\,\mathrm{N}$ 大得多，所以滑块 1 仍被撞减速。由牛顿第三定律，滑块 1 受到滑块 2 的平均作用力也是 $5.5\,\mathrm{N}$，方向向左。

故选 $\boxed{BD}$。

## 交互演示

碰撞力随时间怎么变化，题目没有给出。下面用一段常数平均力代替它：只在 $0.04\,\mathrm{s}$ 内作用，大小取上面算出的 $5.5\,\mathrm{N}$，使滑块 2 的动量增量仍为 $0.22\,\mathrm{N\cdot s}$。这是为了看清冲量，不是真实的力随时间的曲线。画面上滑块间距和弯钩不按比例。

<Param name="t" label="时刻" value={0.04} min={0} max={0.08} step={0.001} unit="s" hidden />

<Param name="m" label="每个滑块质量" value={1} min={0.5} max={2} step={0.1} unit="kg" />

<Param name="v0" label="碰前滑块 1 的速度" symbol="v_0" value={0.4} min={0.2} max={0.8} step={0.01} unit="m/s" color="velocity" />

<Param name="v" label="碰后共同速度" value={0.22} min={0.1} max={0.4} step={0.01} unit="m/s" color="velocity" />

<Param name="dt" label="碰撞时间" symbol="Δt" value={0.04} min={0.02} max={0.1} step={0.005} unit="s" />

<Param name="g" value={10} hidden />

<Define name="F" expr="m*(2*v - v0)/dt" />

<Define name="Favg" expr="m*v/dt" />

<Define name="I1" expr="m*(v - v0)" />

<Define name="I2" expr="m*v" />

<Define name="pBefore" expr="m*v0" />

<Define name="pAfter" expr="2*m*v" />

<Define name="bw" expr="0.04" />

<Define name="span" expr="dt + 0.04" />

<Motion name="hit" until="span" steps={2000}
  bodies={[
    {name: "A", mass: "m", along: 0, x: 0, v: "v0", forces: [
      {label: "G", angle: -90, magnitude: "m*g"},
      {label: "N", angle: 90, solve: "NA"},
      {label: "F", angle: 0, magnitude: "F"},
      {label: "f", angle: 180, magnitude: "t < dt ? Favg : F/2"}
    ]},
    {name: "B", mass: "m", along: 0, x: "bw", v: 0, forces: [
      {label: "G", angle: -90, magnitude: "m*g"},
      {label: "N", angle: 90, solve: "NB"},
      {label: "f", angle: 0, magnitude: "t < dt ? Favg : F/2"}
    ]}
  ]}
  events={[{name: "tEnd", when: "t - dt", dir: "up"}]}
  read={{
    v1end: "vA @ tEnd",
    v2end: "vB @ tEnd",
    pEnd: "m*(vA + vB) @ tEnd"
  }}
/>

<Question text="A. 该过程动量守恒" set={{t: 0.04}} hint="比较碰撞前后的系统动量：恒力 F 一直在做正功" />

<Question text="B. 滑块 1 受到合外力的冲量大小为 0.18 N·s" set={{t: 0.04}} hint="合外力冲量等于滑块 1 的动量改变量 mv − mv0；碰撞力冲量 −0.22 与电机冲量 +0.04 相加正好是 −0.18" />

<Question text="C. 滑块 2 受到合外力的冲量大小为 0.40 N·s" set={{t: 0.04}} hint="滑块 2 的动量从 0 增到 mv，不是增到 mv0" />

<Question text="D. 滑块 2 受到滑块 1 的平均作用力大小为 5.5 N" set={{t: 0.02}} hint="平均力等于滑块 2 的动量改变量除以碰撞时间" />

<Preset label="题目条件" set={{m: 1, v0: 0.4, v: 0.22, dt: 0.04, t: 0.04}} />

<Preset label="碰撞刚开始" set={{t: 0}} />

<Preset label="碰撞刚结束" set={{t: "dt"}} />

<Status cases={[
  {when: "t < dt", label: "正在碰撞：平均力作用中", tone: "warning"},
  {label: "碰撞已结束：两滑块以共同速度向右", tone: "success"}
]} />

<Readout items={[
  {label: "电机恒力", symbol: "F", expr: "F", unit: "N", digits: 2, color: "force"},
  {label: "系统动量（碰前 → 碰后）", expr: "pBefore", unit: "N·s", digits: 2},
  {label: "碰后系统动量", expr: "pAfter", unit: "N·s", digits: 2},
  {label: "滑块 1 合冲量", symbol: "I_1", expr: "I1", unit: "N·s", digits: 2, color: "force"},
  {label: "滑块 2 合冲量", symbol: "I_2", expr: "I2", unit: "N·s", digits: 2, color: "force"},
  {label: "平均作用力", symbol: "F̄", expr: "Favg", unit: "N", digits: 2, color: "force"}
]} />

<Answer items={[
  {label: "答案", text: "BD"},
  {label: "滑块 1 合冲量", symbol: "I_1", expr: "I1", value: -0.18, unit: "N·s", digits: 2},
  {label: "滑块 2 合冲量", symbol: "I_2", expr: "I2", value: 0.22, unit: "N·s", digits: 2},
  {label: "平均作用力", symbol: "F̄", expr: "Favg", value: 5.5, unit: "N", digits: 1}
]} />

<Sim title="滑轨上的碰撞" height={280} duration="span" time="t" playSeconds={8}
  params={["hit", "m", "v0", "v", "dt", "F", "Favg", "I1", "I2"]}
  marks={[
    {t: 0, label: "开始碰撞"},
    {t: "dt", label: "碰撞结束"}
  ]}
  hud={[
    {symbol: "v_1", label: "滑块 1", expr: "hit.vA(t)", unit: "m/s", digits: 3},
    {symbol: "v_2", label: "滑块 2", expr: "hit.vB(t)", unit: "m/s", digits: 3},
    {symbol: "p", label: "系统动量", expr: "m*(hit.vA(t)+hit.vB(t))", unit: "N·s", digits: 3}
  ]}
  note="滑块间距和弯钩不按比例；碰撞力用常数平均力示意"
>
sim({
  at(t, p) {
    const s = p.hit.state(t)
    return { x1: s.xA, x2: s.xB, v1: s.vA, v2: s.vB, pushing: t < p.dt }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -0.08, xmax: 0.28, ymin: -0.08, ymax: 0.2 })
    const w = 0.03
    const h = 0.028
    const railY = 0.1
    v.bar(m, -0.06, railY, 0.32, 0.01)
    const blocks = [
      { x: s.x1, label: '1' },
      { x: s.x2, label: '2' },
      { x: 0.13, label: '3' },
      { x: 0.23, label: '10' },
    ]
    blocks.forEach(function (b) {
      v.block(m, b.x, railY - h, w, h, { label: b.label })
      const bot = railY - h
      v.rope(m, [[b.x, bot], [b.x, bot - 0.016], [b.x + 0.012, bot - 0.028], [b.x, bot - 0.028]])
    })
    v.label(m, 0.18, railY - h / 2, '…')
    if (s.pushing) {
      const mid = railY - h / 2
      v.vec(m, s.x1, mid, 0.03, 0, { kind: 'force', label: 'F' })
      v.vec(m, s.x1 + w * 0.15, mid - 0.006, -0.028, 0, { kind: 'force', label: 'F̄' })
      v.vec(m, s.x2 - w * 0.15, mid - 0.006, 0.028, 0, { kind: 'force', label: 'F̄' })
    }
    v.vec(m, s.x1, railY + 0.006, Math.max(s.v1, 0) * 0.08, 0, { kind: 'velocity', label: 'v1' })
    if (s.v2 > 0.002) {
      v.vec(m, s.x2, railY + 0.006, s.v2 * 0.08, 0, { kind: 'velocity', label: 'v2' })
    }
    v.event(m, (s.x1 + s.x2) / 2, railY + 0.07, '碰撞结束', { at: v.p.dt, kind: 'force' })
  },
})
</Sim>

<Plot title="速度随时间变化" size="wide"
  x={{name: "t", label: "t", unit: "s", min: 0, max: "span"}}
  y={{label: "v", unit: "m/s", min: 0, max: "v0 + 0.05"}}
  series={[
    {label: "滑块 1", expr: "hit.vA(t)", color: "velocity"},
    {label: "滑块 2", expr: "hit.vB(t)", color: "force", dash: true}
  ]}
  marks={[
    {x: "dt", label: "共同速度"}
  ]}
  cursor="t"
/>

<Plot title="系统动量" size="narrow"
  x={{name: "t", label: "t", unit: "s", min: 0, max: "span"}}
  y={{label: "p", unit: "N·s", min: 0, max: "pAfter + 0.05"}}
  series={[
    {label: "p", expr: "m*(hit.vA(t)+hit.vB(t))", color: "force"}
  ]}
  areas={[{series: 0, from: 0, until: "dt", label: "碰撞期间"}]}
  marks={[{x: 0, label: "mv0"}, {x: "dt", label: "2mv"}]}
  cursor="t"
/>

<ForceDiagram title="碰撞中滑块 2 的受力" size="narrow"
  surface={{type: "ground"}}
  body={{shape: "block", label: "2"}}
  mass="m"
  accel={{angle: 0, magnitude: "Favg/m"}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g"},
    {label: "N", angle: 90, solve: "N"},
    {label: "F̄", angle: 0, magnitude: "Favg", showValue: true, unit: "N", digits: 1}
  ]}
/>

## 结合图像看关键时刻

速度图上，滑块 1 从 $0.40\,\mathrm{m/s}$ 下降，滑块 2 从 0 上升，两线在 $t = 0.04\,\mathrm{s}$ 交于 $0.22\,\mathrm{m/s}$。交点之后两线重合，说明碰撞力已经消失，只剩下恒力 $F$；由于滑块仍接触，滑块 1 把这个力传给滑块 2，两者保持共同加速度 $F/(2m)$。

动量图在碰撞期间不是水平线：它从 $mv_0 = 0.40\,\mathrm{N\cdot s}$ 升到 $2mv = 0.44\,\mathrm{N\cdot s}$，斜率就是外力 $F = 1\,\mathrm{N}$。所以 A 不成立。滑块 1 的速度改变量是 $-0.18\,\mathrm{m/s}$，乘以质量就是 B 的 $0.18\,\mathrm{N\cdot s}$；滑块 2 的速度改变量是 $0.22\,\mathrm{m/s}$，对应的冲量是 $0.22\,\mathrm{N\cdot s}$，不是 C 写的 $0.40\,\mathrm{N\cdot s}$。用这个冲量除以 $0.04\,\mathrm{s}$，就是 D 的 $5.5\,\mathrm{N}$。

## 答案汇总

选 BD。滑块 1 合外力冲量大小 $0.18\,\mathrm{N\cdot s}$，滑块 2 合外力冲量大小 $0.22\,\mathrm{N\cdot s}$，滑块 2 受到的平均作用力 $5.5\,\mathrm{N}$。系统因为恒力 $F = 1\,\mathrm{N}$ 而动量不守恒。
