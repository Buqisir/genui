---
id: gd25-05
title: 测直径与小车碰撞
source: 2025 广东卷（部分试题）第 5 题（实验）
question: |
  请完成下列实验操作和计算。

  (1)在“长度的测量及其测量工具的选用”实验中，用螺旋测微器测量小球的直径，示数如图所示，读数 ____ mm。

  【图】螺旋测微器。固定刻度的水平基准线下方标有 0 和 5，上方是半毫米刻线。从 0 起整毫米刻线依次露出，套筒左端面与 8 mm 刻线对齐，8.5 mm 刻线未露出。可动刻度可见 20、25，水平基准线与 26 刻线对齐（25 的上一格）。

  (2)实验小组利用小车碰撞实验测量吸能材料的性能，装置如图所示，图中轨道由轨道甲和乙平滑拼接而成，且轨道乙倾角较大。

  【图】一根水平长梁做底座，左右两端各有一条支腿。轨道整体左低右高。左段坡度较小，标“轨道甲”，从左到右依次是光电门B、小车1、光电门A。连接处下方有两个螺母顶在底座上。右段坡度明显更大，标“轨道乙”，向右上方倾斜；轨道面上标有点 M，M 的上方是小车2；右端有立柱支到底座上。

  ①选取相同的两辆小车，分别安装宽度为 1.00 cm 的遮光条。

  ②轨道调节。

  调节螺母使轨道甲、乙连接处适当升高。将小车在轨道乙上释放，若测得小车通过光电门 A 和 B 的 ____ 。证明已平衡小车在轨道甲上所受摩擦力及其他阻力。

  ③碰撞测试

  先将小车 1 静置于光电门 A 和 B 中间，再将小车 2 在 M 点由静止释放，测得小车 2 通过光电门 A 的时间为 t_2，碰撞后小车 1 通过光电门 B 的时间为 t_1。若 t_2 ____ t_1，可将两小车的碰撞视为弹性碰撞。

  ④吸能材料性能测试。

  将吸能材料紧贴于小车 2 的前端。重复步骤③。测得小车 2 通过光电门 A 的时间为 10.00 ms，两车碰撞后，依次测得小车 1 和 2 通过光电门 B 的时间分别为 15.00 ms、30.00 ms，不计吸能材料的质量，计算可得碰撞后两小车总动能与碰撞前小车 2 动能的比值为 ____ （结果保留 2 位有效数字）。
answers:
  - { name: d, value: 8.26, unit: mm }
  - { name: ratio, value: 0.56 }
---

第 (1) 问是螺旋测微器读数：固定刻度只露出到 8 mm，8.5 mm 刻线还没有出来；可动刻度基准线对准 26，估读 0。第 (2) 问用两辆相同的小车，遮光条宽度都是 $d_0 = 1.00\ \mathrm{cm}$。轨道甲平衡好之后，小车在甲上做加速度为零的劣速运动；轨道乙只用来给小车 2 一个初速度。遮光时间越短，通过光电门的速度越大：$v = d_0/t$。

## 完整解答

**(1)** 螺旋测微器的精密螺纹螺距是 $0.5\ \mathrm{mm}$，可动刻度分 50 格，每格 $0.01\ \mathrm{mm}$，再估读一位到 $0.001\ \mathrm{mm}$。

固定刻度露出 $8\ \mathrm{mm}$，半毫米刻线未露出，不加 $0.5\ \mathrm{mm}$。基准线对准可动刻度第 26 格，估读为 0：

$$
8\ \mathrm{mm} + 26.0 \times 0.01\ \mathrm{mm} = \boxed{8.260\ \mathrm{mm}}
$$

**(2)②** 轨道甲的重力分力已经抵消摩擦力和其他阻力，小车在甲上速度不变。两辆小车的遮光条等宽，速度相同就是遮光时间相同，所以要测得通过光电门 A 和 B 的

$$
\boxed{\text{时间相等}}
$$

**(2)③** 两车质量相同，记为 $m$。小车 1 碰前静止，小车 2 的碰前速度 $v_2 = d_0/t_2$。弹性碰撞要同时满足动量守恒和机械能守恒：

$$
m v_2 = m v_1' + m v_2', \qquad \tfrac12 m v_2^2 = \tfrac12 m v_1'^2 + \tfrac12 m v_2'^2
$$

两式相减得 $(v_1' - v_2)(v_1' - v_2') = 0$。两车不能互相穿过，取 $v_1' = v_2$、$v_2' = 0$：小车 2 停下，小车 1 以小车 2 碰前的速度离开。遮光条等宽，速度相同就是遮光时间相同，而小车 2 停下以后不再挡光，所以

$$
t_2 \boxed{=} t_1
$$

若 $t_2 > t_1$，碰后小车 1 比碰前小车 2 还快，超出了动量守恒允许的最大值，不可能。若 $t_2 < t_1$，则 $v_1' < v_2$，碰后小车 2 还有速度，是非弹性碰撞。

**(2)④** 遮光条宽度相同，速度与遮光时间成反比。以碰前小车 2 的速度 $v_2 = d_0/t_2$ 为单位：

$$
\frac{v_1'}{v_2} = \frac{t_2}{t_1'} = \frac{10.00}{15.00} = \frac{2}{3}, \qquad
\frac{v_2'}{v_2} = \frac{t_2}{t_2'} = \frac{10.00}{30.00} = \frac{1}{3}
$$

碰后两车总动能与碰前小车 2 动能的比值

$$
\eta = \frac{\tfrac12 m v_1'^2 + \tfrac12 m v_2'^2}{\tfrac12 m v_2^2}
  = \left(\frac{2}{3}\right)^2 + \left(\frac{1}{3}\right)^2
  = \frac{4}{9} + \frac{1}{9} = \frac{5}{9} = \boxed{0.56}
$$

保留 2 位有效数字。碰撞中约有 $1 - 0.56 = 0.44$ 的机械能被吸能材料消耗。

## 交互演示

拖动螺旋测微器的示数，对照固定刻度和可动刻度。轨道甲的倾角已经调到阻力平衡，小车在甲上劣速运动；轨道乙只决定小车 2 的初速度。遮光条宽度按题目取 $1.00\ \mathrm{cm}$，两车质量取相同的代表值 $0.20\ \mathrm{kg}$。轨道甲长 $1.20\ \mathrm{m}$、轨道乙长 $0.80\ \mathrm{m}$、释放点离拼接处 $0.55\ \mathrm{m}$，是按题图比例取的，不影响比值。

<Param name="d" label="小球直径" symbol="d" value={8.26} min={6} max={12} step={0.01} digits={3} unit="mm" />

<Param name="t2" label="小车 2 过 A" symbol="t_2" value={10} min={6} max={20} step={0.5} digits={2} unit="ms" />

<Param name="t1p" label="碰后小车 1 过 B" symbol="t_1'" value={15} min={8} max={40} step={0.5} digits={2} unit="ms" />

<Param name="t2p" label="碰后小车 2 过 B" symbol="t_2'" value={30} min={10} max={80} step={0.5} digits={2} unit="ms" />

<Param name="d0" value={0.01} hidden />

<Param name="m" value={0.2} hidden />

<Param name="L1" value={1.2} hidden />

<Param name="L2" value={0.8} hidden />

<Param name="sM" value={0.55} hidden />

<Param name="xA" value={0.86} hidden />

<Param name="xB" value={0.28} hidden />

<Param name="t" label="时间" value={0} min={0} max={2.4} step={0.01} hidden />

<Define name="v2" expr="d0/(t2*0.001)" />

<Define name="v1p" expr="d0/(t1p*0.001)" />

<Define name="v2p" expr="d0/(t2p*0.001)" />

<Define name="Ek0" expr="0.5*m*v2*v2" />

<Define name="Ek1" expr="0.5*m*v1p*v1p" />

<Define name="Ek2" expr="0.5*m*v2p*v2p" />

<Define name="ratio" expr="(Ek1+Ek2)/Ek0" />

<Define name="lost" expr="Ek0-Ek1-Ek2" />

<Define name="tHit" expr="(L1-xA)/v2" />

<Define name="tEnd" expr="tHit+(L1-xB)/min(v1p,v2p)" />

<Question text="(1) 螺旋测微器的读数是多少？" set={{d: 8.26}} hint="固定刻度 8 mm，半毫米线未露出，可动刻度 26.0" />

<Question text="(2)④ 碰后总动能与碰前动能的比值是多少？" set={{t2: 10, t1p: 15, t2p: 30, t: 0}} hint="速度与遮光时间成反比，再比动能" />

<Preset label="题目数值" set={{d: 8.26, t2: 10, t1p: 15, t2p: 30, t: 0}} />

<Preset label="弹性碰撞：速度交换" set={{t2: 10, t1p: 10, t2p: 80, t: "tHit"}} />

<Status cases={[
  {when: "abs(t2 - t1p) < 0.05 and t2p > 4*t2", label: "接近弹性碰撞：小车 2 几乎停下", tone: "success"},
  {when: "t2 > t1p + 0.05", label: "碰后小车 1 比碰前小车 2 还快，不可能", tone: "danger"},
  {when: "lost < -0.001", label: "碰后动能大于碰前，不可能", tone: "danger"},
  {label: "非弹性碰撞：部分机械能被吸能材料消耗", tone: "info"}
]} />

<Readout items={[
  {label: "碰前小车 2", symbol: "v_2", color: "velocity", expr: "v2", unit: "m/s", digits: 2},
  {label: "碰后小车 1", symbol: "v_1'", color: "velocity", expr: "v1p", unit: "m/s", digits: 2},
  {label: "碰后小车 2", symbol: "v_2'", color: "velocity", expr: "v2p", unit: "m/s", digits: 2},
  {label: "动能比值", symbol: "η", color: "charge", expr: "ratio", digits: 2}
]} />

<Instrument title="螺旋测微器测小球直径" type="micrometer" value="d" note="半毫米刻线未露出时不加 0.5 mm" />

<Sim title="轨道甲、乙上的碰撞" height={320} duration="tEnd" time="t" playSeconds={6}
  params={["v2", "v1p", "v2p", "L1", "L2", "sM", "xA", "xB", "tHit"]}
  marks={[
    {t: 0, label: "小车 2 从 M 释放"},
    {t: "tHit", label: "两车碰撞"}
  ]}
  hud={[
    {symbol: "v_2", label: "碰前", expr: "v2", unit: "m/s", digits: 2},
    {symbol: "η", label: "动能比", expr: "ratio", digits: 2}
  ]}
  note="轨道甲已平衡阻力，小车在甲上劣速。轨道长度不按比例，遮光条宽度 1.00 cm 已放大。">
sim({
  at(t, p) {
    const th = p.tHit
    const s2b = Math.min(p.sM, p.v2 * t)
    let s1 = p.L1 / 2
    let s2 = p.sM
    let u1 = 0
    let u2 = p.v2
    if (t < th) {
      s2 = p.sM - p.v2 * t
    } else {
      const dt = t - th
      s1 = p.L1 / 2 - p.v1p * dt
      s2 = p.v2p * dt
      u1 = p.v1p
      u2 = p.v2p
    }
    return { s1, s2, u1, u2, s2b, th }
  },
  draw(ctx, s, v) {
    const p = v.p
    const a1 = Math.atan(0.10 / p.L1)
    const a2 = Math.atan(0.34 / p.L2)
    const yJoin = 0.10
    const yTop = yJoin + 0.34
    const m = v.view({ xmin: -0.34, xmax: 2.30, ymin: -0.42, ymax: 0.78 })
    v.ground(m, -0.10, 2.10, -0.16, { thick: 9 })
    v.bar(m, 0.02, -0.16, 0.02, 0, { thick: 7 })
    v.bar(m, 1.90, -0.16, 1.90, yTop, { thick: 7 })
    v.bar(m, 0.02, 0, 1.90, 0, { thick: 7 })
    v.bar(m, 0.92, 0, 0.92, yJoin - 0.012, { thick: 6 })
    v.bar(m, 1.08, 0, 1.08, yJoin - 0.012, { thick: 6 })
    v.circle(m, 0.92, yJoin - 0.03, 0.016, { fill: v.color.graphite, color: v.color.ink })
    v.circle(m, 1.08, yJoin - 0.03, 0.016, { fill: v.color.graphite, color: v.color.ink })
    const rail = v.track(m, [
      { line: [0, 0, p.L1, yJoin] },
      { line: [p.L1, yJoin, p.L1 + p.L2, yTop] },
    ], { marks: [{ s: p.L1 + (p.L2 - p.sM), label: 'M' }] })
    const on = (ss, which) => {
      const q = rail.at(which === 2 ? p.L1 + (p.L2 - ss) : ss)
      const nx = Math.sin(q[2])
      const ny = Math.cos(q[2])
      return [q[0] + 0.045 * nx, q[1] + 0.045 * ny, q[2]]
    }
    const c1 = on(s.s1, 1)
    const c2 = on(s.s2, 2)
    const ang = (q) => q[2] * 180 / Math.PI
    const gate = (x, name) => {
      const q = rail.at(x)
      const nx = Math.sin(q[2])
      const ny = Math.cos(q[2])
      return {
        x: q[0] + 0.07 * nx,
        y1: q[1] + 0.012 * ny,
        y2: q[1] + 0.15 * ny,
        label: name,
      }
    }
    const gA = gate(p.xA, 'A')
    const gB = gate(p.xB, 'B')
    const near = (ss, x, which) => Math.abs((which === 2 ? p.L1 + (p.L2 - ss) : ss) - x) < 0.05
    v.photogate(m, gB.x, gB.y1, gB.y2, {
      post: -0.16,
      blocked: near(s.s1, p.xB, 1),
    })
    v.photogate(m, gA.x, gA.y1, gA.y2, {
      post: -0.16,
      blocked: near(s.s2, p.xA, 2),
    })
    v.label(m, gB.x - 0.10, gB.y2 + 0.03, 'B')
    v.label(m, gA.x + 0.10, gA.y2 + 0.03, 'A')
    v.block(m, c1[0], c1[1], 0.16, 0.07, { angle: ang(c1), label: '1', flag: 0.09, flagWidth: 7 })
    v.block(m, c2[0], c2[1], 0.16, 0.07, { angle: ang(c2), label: '2', flag: 0.09, flagWidth: 7 })
    if (s.u1 > 0.05) v.vec(m, c1[0], c1[1] + 0.05, -0.16, -0.16 * Math.tan(a1), { kind: 'velocity', label: "v_1'" })
    if (s.u2 > 0.05) {
      const dir = v.t < s.th ? -1 : 1
      const sl = s.u2 > p.v2 * 0.6 ? a2 : a1
      v.vec(m, c2[0], c2[1] + 0.05, dir * 0.16, dir * 0.16 * Math.tan(sl), { kind: 'velocity', label: 'v_2' })
    }
    v.label(m, 0.42, -0.05, '轨道甲')
    v.label(m, 1.62, 0.30, '轨道乙')
    v.event(m, p.L1 / 2, yJoin * 0.5 + 0.16, '碰撞', { at: s.th, kind: 'force' })
  },
})
</Sim>

<Ledger title="碰撞前后的动能" unit="J" digits={3}
  parts={[
    {label: "小车 1 动能", symbol: "E_1", expr: "Ek1", color: "velocity"},
    {label: "小车 2 动能", symbol: "E_2", expr: "Ek2", color: "field"},
    {label: "吸能材料消耗", symbol: "Q", expr: "max(lost, 0)", color: "force"}
  ]}
  total={{label: "碰前动能", symbol: "E_0", expr: "Ek0"}}
  headline={{label: "动能比值", expr: "ratio", digits: 2}}
/>

<Answer items={[
  {label: "小球直径", symbol: "d", expr: "d", value: 8.26, unit: "mm", digits: 3},
  {label: "平衡阻力的判据", text: "通过光电门 A、B 的时间相等"},
  {label: "弹性碰撞的判据", text: "t_2 = t_1"},
  {label: "碰后总动能与碰前的比值", symbol: "η", expr: "ratio", value: 0.56, digits: 2}
]} />

## 结合图像看关键时刻

螺旋测微器拖到 $8.260\ \mathrm{mm}$ 时，套筒左端面正好在 $8\ \mathrm{mm}$ 刻线上，半毫米刻线还在套筒里面，可动刻度的基准线对准 26。

轨道上，小车 2 从 M 滑下，先挡住光电门 A，再撞上静止的小车 1。题目给的 $t_2 = 10.00\ \mathrm{ms}$、$t_1' = 15.00\ \mathrm{ms}$、$t_2' = 30.00\ \mathrm{ms}$ 对应速度比 $1 : 2/3 : 1/3$。把三个时间拖成相等，动能比值接近 1，就是第 ③ 问的弹性碰撞：小车 2 停下，小车 1 以同样的速度离开。把 $t_1'$ 拖得比 $t_2$ 还小，状态栏会标出这种速度超过了动量守恒的上限。

## 答案

(1) $8.260\ \mathrm{mm}$。(2) ② 时间相等；③ $=$；④ $0.56$。
