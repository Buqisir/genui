---
id: gd23-08
title: 圆弧滑道运送货物
source: 2023 广东卷 第 8 题（多选，6 分）
question: 人们用滑道从高处向低处运送货物．如图所示，可看作质点的货物从 1/4 圆弧滑道顶端 P 点静止释放，沿滑道运动到圆弧末端 Q 点时速度大小为 6 m/s。已知货物质量为 20 kg，滑道高度 h 为 4 m，且过 Q 点的切线水平，重力加速度取 10 m/s^2。关于货物从 P 点运动到 Q 点的过程，下列说法正确的有（　　）
choice: BCD
answers:
  - { name: Wg, value: 800, unit: J }
  - { name: Wf, value: 440, unit: J }
  - { name: aN, value: 9, unit: m/s^2 }
  - { name: NQ, value: 380, unit: N }
---

货物视为质点，从 1/4 圆弧滑道顶端 P 静止释放，沿滑道滑到末端 Q。题目给出 m = 20 kg、h = 4 m、v_Q = 6 m/s、g = 10 m/s²，过 Q 点的切线水平。

图中是一段 1/4 圆弧：上方水平顶边的右端是 P，曲线从 P 竖直向下弯出，末端变成水平，标为 Q。P 比 Q 高 h，所以圆心在 P 的正下方、Q 的正左方，半径等于高度 h = 4 m。货物一直贴着轨面向下滑。重力做正功；支持力始终垂直于轨面，不做功；阻力沿切线向后，做负功。

重力做功只与高度差有关。到达 Q 点的速率已经给出，克服阻力做的功由动能定理直接得到，不必知道阻力沿路怎么分布。Q 点的法线竖直，向心加速度指向圆心，在水平方向。

<Param name="R" label="滑道半径 R" value={4} min={3} max={8} step={0.1} unit="m" hidden />

<Param name="t" label="时间" value={0} min={0} max={6} step={0.01} unit="s" hidden />

<Param name="m" value={20} hidden />

<Param name="h" value={4} hidden />

<Param name="g" value={10} hidden />

<Param name="vQ" value={6} hidden />

<Define name="Wg" expr="m*g*h" />

<Define name="EkQ" expr="0.5*m*vQ^2" />

<Define name="Wf" expr="Wg - EkQ" />

<Define name="f" expr="Wf / (0.5*pi*R)" />

<Motion name="cargo" mass="m" until={8}
  state={{s: 0, v: 0}}
  track={{
    pieces: [
      {arc: ["R", "R", "R", 180, 270], mu: "f/(m*g)"}
    ],
    normal: "N",
    friction: "fTrack",
    end: "stop"
  }}
  forces={[{label: "G", angle: -90, magnitude: "m*g"}]}
  events={[{name: "tQ", when: "s - 0.5*pi*R", dir: "up", stop: true}]}
  read={{
    vEnd: "speed @ tQ"
  }} />

<Define name="aN" expr="vQ^2/R" />

<Define name="NQ" expr="m*g + m*vQ^2/R" />

<Define name="aNow" expr="sqrt(cargo.accx(t)^2 + cargo.accy(t)^2)" />

<Status cases={[
  {when: "t < 0.02", label: "停在 P：重力势能尚未转化", tone: "neutral"},
  {when: "t < tQ", label: "沿滑道下滑：支持力不做功", tone: "info"},
  {label: "到达 Q：切线水平", tone: "success"}
]} />

<Question text="A. 重力做的功为 360 J" set={{t: "tQ"}} hint="360 J 是末动能，重力做功是 mgh = 800 J" />

<Question text="B. 克服阻力做的功为 440 J" set={{t: "tQ"}} hint="800 J 势能里只剩下 360 J 动能" />

<Question text="C. 经过 Q 点时向心加速度大小为 9 m/s²" set={{t: "tQ"}} hint="1/4 圆弧，半径就是高度 h" />

<Question text="D. 经过 Q 点时对轨道的压力大小为 380 N" set={{t: "tQ"}} hint="法向：N − mg = mv²/R" />

<Preset label="题目条件：到达 Q" set={{t: "tQ"}} />

<Preset label="回到 P 点" set={{t: 0}} />

<Readout items={[
  {label: "重力做功", symbol: "W_G", expr: "Wg", unit: "J", digits: 0, color: "field"},
  {label: "克服阻力做功", symbol: "W_f", expr: "Wf", unit: "J", digits: 0, color: "force"},
  {label: "此刻速率", symbol: "v", expr: "cargo.speed(t)", unit: "m/s", digits: 2, color: "velocity"},
  {label: "Q 点向心加速度", symbol: "a_n", expr: "aN", unit: "m/s²", digits: 1, color: "accel"},
  {label: "Q 点对轨道压力", symbol: "F_N", expr: "NQ", unit: "N", digits: 0, color: "force"}
]} />

<Answer items={[
  {label: "答案", text: "BCD"},
  {label: "重力做功", symbol: "W_G", expr: "Wg", value: 800, unit: "J", digits: 0},
  {label: "克服阻力做功", symbol: "W_f", expr: "Wf", value: 440, unit: "J", digits: 0},
  {label: "Q 点向心加速度", symbol: "a_n", expr: "aN", value: 9, unit: "m/s²", digits: 1},
  {label: "Q 点对轨道压力", symbol: "F_N", expr: "NQ", value: 380, unit: "N", digits: 0}
]} />

<Ledger title="能量去向" unit="J"
  parts={[
    {label: "动能", symbol: "E_k", expr: "0.5*m*cargo.speed(t)^2", color: "velocity"},
    {label: "克服阻力做功", symbol: "W_f", expr: "m*g*(R - cargo.y(t)) - 0.5*m*cargo.speed(t)^2", color: "force"},
    {label: "重力势能", symbol: "E_p", expr: "m*g*cargo.y(t)", color: "field"}
  ]}
  rows={[{label: "P 点", at: {t: 0}}, {label: "此刻"}, {label: "Q 点", at: {t: "tQ"}}]}
  total={{label: "总能量", symbol: "E", expr: "m*g*R"}}
/>

<ForceDiagram title="Q 点受力" size="narrow"
  surface={{type: "ground"}}
  body={{shape: "block", label: "m"}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g", showValue: true, unit: "N"},
    {label: "N", angle: 90, magnitude: "NQ", showValue: true, unit: "N"}
  ]}
  guides={[{label: "v", angle: 0, color: "velocity"}]}
/>

<Sim title="圆弧滑道" height={420} size="narrow" duration="tQ" time="t"
  params={["cargo", "R", "h", "tQ"]}
  marks={[
    {t: 0, label: "从 P 静止释放"},
    {t: "tQ", label: "到达 Q"}
  ]}
  hud={[
    {symbol: "v", expr: "cargo.speed(t)", unit: "m/s", digits: 2},
    {symbol: "a_n", expr: "sqrt(cargo.accx(t)^2 + cargo.accy(t)^2)", unit: "m/s²", digits: 1},
    {symbol: "F_N", expr: "cargo.N(t)", unit: "N", digits: 0}
  ]}
  legend={[
    {kind: "velocity", label: "速度"},
    {kind: "accel", label: "加速度"},
    {kind: "force", label: "支持力"}
  ]}
  note="1/4 圆弧的半径等于高度 h，画面按比例"
>
sim({
  at(t, p) {
    return p.cargo.state(t)
  },
  draw(ctx, s, v) {
    const p = v.p
    const R = p.R
    const m = v.view({
      xmin: -1.05,
      xmax: R + 0.85,
      ymin: -0.35,
      ymax: R + 0.7,
      equal: true,
      pad: 22,
    })
    const tr = v.track(m, p.cargo, {
      marks: [
        {x: 0, y: R, label: "P"},
        {x: R, y: R, label: "Q"},
      ],
    })
    v.ground(m, -0.15, R + 0.55, R, {thick: 14})
    v.wall(m, 0, 0, R, {side: "left"})
    v.dim(m, -0.72, R, -0.72, 0, "h")
    const r = 0.16
    const [bx, by] = tr.place(s, r)
    v.trail(m, (st) => [st.x, st.y], {kind: "velocity"})
    v.block(m, bx, by, 0.32, 0.26, {pivot: "center"})
    const sp = s.speed || 0
    if (sp > 0.05) {
      v.vec(m, bx, by, (s.vx / sp) * 0.85, (s.vy / sp) * 0.85, {kind: "velocity", label: "v"})
    }
    const ap = Math.hypot(s.accx, s.accy)
    if (ap > 0.2) {
      const inward = s.vx * s.accy - s.vy * s.accx
      const sign = inward >= 0 ? 1 : -1
      const tx = sp > 0.05 ? -s.vy / sp : 0
      const ty = sp > 0.05 ? s.vx / sp : -1
      v.vec(m, bx, by, tx * sign * 0.72, ty * sign * 0.72, {kind: "accel", label: "a"})
    }
    const nd = (s.normalDir * Math.PI) / 180
    if (s.N > 1) {
      v.vec(m, bx, by, Math.cos(nd) * 0.55, Math.sin(nd) * 0.55, {kind: "force", label: "N"})
    }
    v.event(m, R * 0.42, R * 0.28, "到达 Q", {at: p.tQ, kind: "velocity"})
  },
})
</Sim>

## 完整解答

图中滑道是 1/4 圆弧，P 在最高点、Q 在最低点，过 Q 点的切线水平，所以半径等于高度：

$$
R = h = 4\,\mathrm{m}
$$

重力做功只与起点、终点的高度差有关：

$$
W_G = mgh = 20 \times 10 \times 4 = \boxed{800\,\mathrm{J}}
$$

到达 Q 点的动能为

$$
E_{kQ} = \tfrac12 mv_Q^2 = \tfrac12 \times 20 \times 6^2 = 360\,\mathrm{J}
$$

支持力始终与速度垂直，不做功。由动能定理，重力做功与阻力做功之和等于动能的增加：

$$
W_G + W_{\text{阻}} = E_{kQ} - 0
$$

阻力做负功，克服阻力做的功就是机械能的减少量：

$$
W_f = -W_{\text{阻}} = mgh - \tfrac12 mv_Q^2 = 800 - 360 = \boxed{440\,\mathrm{J}}
$$

**A 错误。** 360 J 是到达 Q 点的动能 $\tfrac12 mv_Q^2$，不是重力做的功。重力做功是 mgh = 800 J。

**B 正确。** 克服阻力做的功等于重力势能的减少量减去获得的动能，为 440 J。这一结果不需要知道阻力是否恒定。

**C 正确。** 半径等于高度，经过 Q 点时向心加速度大小为

$$
a_n = \frac{v_Q^2}{R} = \frac{v_Q^2}{h} = \frac{6^2}{4} = \boxed{9\,\mathrm{m/s^2}}
$$

**D 正确。** 过 Q 点的切线水平，圆心在 Q 的正左方，向心加速度水平向左。法向上货物受重力 mg 向下、轨道支持力 N 向上。阻力沿切线，水平向后，不进入法向方程。由牛顿第二定律：

$$
N - mg = m\frac{v_Q^2}{R}
$$

货物对轨道的压力与 N 等大反向：

$$
F_N = N = mg + m\frac{v_Q^2}{h} = 200 + 20 \times \frac{36}{4} = \boxed{380\,\mathrm{N}}
$$

因此选 BCD。

## 结合图像

拖动时间，或点进度条上的 P、Q。

- 能量账本三行总长都是 3200 J：P 点全是重力势能；滑到 Q 点后剩下 360 J 动能，440 J 被阻力消耗。
- 到达 Q 点时速率为 6 m/s，向心加速度为 9 m/s²。法向方程是 N − mg = mv²/R，支持力 380 N，对轨道的压力与它等大。
