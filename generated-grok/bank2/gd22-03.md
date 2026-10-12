---
id: gd22-03
title: 滑雪道上的滑行
source: 2022 广东卷 第 3 题（单选，4 分）
question: 图是滑雪道的示意图。可视为质点的运动员从斜坡上的 M 点由静止自由滑下，经过水平 NP 段后飞入空中，在 Q 点落地。不计运动员经过 N 点的机械能损失，不计摩擦力和空气阻力。下列能表示该过程运动员速度大小 v 或加速度大小 a 随时间 t 变化的图像是（ ）
choice: C
answers: []
---

题目没有给出数值。下面取一组代表性数值：斜坡倾角 θ = 30°，斜坡长 L₁ = 8 m，水平段 NP = 2 m，P 点比落点 Q 高 Δh = 4 m，g = 10 m/s²。尺寸只用来看清图像形状，结论不依赖这组数。落地后的斜坡不参与运动，画面不按比例。

运动员视为质点，整个过程没有摩擦力和空气阻力，经过 N 点也不损失机械能。因力始终竖直向下，支持力永远垂直于轨面。

- MN：沿斜面加速度大小 a₁ = g sin θ，方向沿斜面向下。速率从 0 均匀增大。
- NP：合力为零，加速度为 0，速率保持刚进入 N 点时的值。
- PQ：飞出后只受重力，加速度大小 a₃ = g，方向竖直向下。水平分速度不变，竖直分速度从 0 增大，速率 v = √(v_P² + (gt)²) 向上弯曲，不是直线。

因为 sin θ < 1，所以 a₁ < a₃。代表性数值下 a₁ = 5 m/s²，a₃ = 10 m/s²。

<Param name="theta" label="斜坡倾角 θ" value={30} min={20} max={50} step={1} unit="°" />

<Param name="L1" label="斜坡长 L_1" value={8} min={4} max={12} step={0.5} unit="m" />

<Param name="L2" label="水平段 NP" value={2} min={0.5} max={4} step={0.1} unit="m" />

<Param name="drop" label="P 比 Q 高 Δh" value={4} min={1} max={6} step={0.1} unit="m" />

<Param name="t" label="时间" value={0} min={0} max={4} step={0.01} unit="s" hidden />

<Param name="m" value={60} hidden />

<Param name="g" value={10} hidden />

<Define name="aSlope" expr="g*sin(deg(theta))" />

<Motion name="ski" mass="m" until={8}
  state={{s: 0, v: 0}}
  track={{
    pieces: [
      {line: [0, "L1*sin(deg(theta))", "L1*cos(deg(theta))", 0]},
      {line: ["L1*cos(deg(theta))", 0, "L1*cos(deg(theta)) + L2", 0]}
    ],
    normal: "N",
    leave: "tP",
    end: "fly"
  }}
  forces={[{label: "G", angle: -90, magnitude: "m*g"}]}
  events={[
    {name: "tN", when: "s - L1", dir: "up"},
    {name: "tLand", when: "y + drop", dir: "down", stop: true}
  ]}
  read={{
    aN: "sqrt(accx^2 + accy^2) @ tN",
    aQ: "sqrt(accx^2 + accy^2) @ tLand",
    vN: "speed @ tN",
    vQ: "speed @ tLand"
  }} />

<Define name="aNow" expr="sqrt(ski.accx(t)^2 + ski.accy(t)^2)" />

<Define name="vNow" expr="ski.speed(t)" />

<Status cases={[
  {when: "t < tN", label: "MN：沿斜面加速，a = g sin θ", tone: "info"},
  {when: "t < tP and abs(aNow) < 1e-6", label: "NP：合力为零，速率不变", tone: "neutral"},
  {when: "t < tLand", label: "PQ：只受重力，a = g", tone: "success"},
  {label: "已在 Q 点落地", tone: "neutral"}
]} />

<Question text="A. v–t 图：从原点直线上升，接一段水平，再以相近斜率直线上升" set={{t: "tLand"}} hint="飞出后速率向上弯曲，不是直线" />

<Question text="B. v–t 图：从原点直线上升，接一段水平，再直线下降回到 t 轴" set={{t: "tLand"}} hint="空中没有阻力，速率不会减小" />

<Question text="C. a–t 图：正的水平段，降到 0，再跳到更高的正水平段" set={{theta: 30, L1: 8, L2: 2, drop: 4, t: 0}} hint="a1 = g sin θ < g = a3" />

<Question text="D. a–t 图：形状同 C，但前后两段水平线等高" set={{theta: 30, t: 0}} hint="只有 θ = 90° 时两段才一样高，滑雪道不是" />

<Preset label="刚进入 N" set={{t: "tN"}} />

<Preset label="刚飞出 P" set={{t: "tP"}} />

<Preset label="刚落到 Q" set={{t: "tLand"}} />

<Readout items={[
  {label: "速率", symbol: "v", expr: "vNow", unit: "m/s", digits: 2, color: "velocity"},
  {label: "加速度大小", symbol: "a", expr: "aNow", unit: "m/s²", digits: 2, color: "accel"},
  {label: "斜面加速度", symbol: "a_1", expr: "aSlope", unit: "m/s²", digits: 2, color: "accel"},
  {label: "空中加速度", symbol: "a_3", expr: "g", unit: "m/s²", digits: 1, color: "accel"}
]} />

<Answer items={[
  {label: "答案", text: "C"},
  {label: "斜面加速度", symbol: "a_1", expr: "aSlope", value: 5, unit: "m/s²", digits: 2},
  {label: "空中加速度", symbol: "a_3", expr: "g", value: 10, unit: "m/s²", digits: 1}
]} />

<Sim title="滑雪道" height={320} duration="tLand" time="t"
  params={["ski", "theta", "L1", "L2", "drop", "tN", "tP", "tLand"]}
  marks={[
    {t: 0, label: "从 M 静止滑下"},
    {t: "tN", label: "进入水平段"},
    {t: "tP", label: "从 P 飞出"},
    {t: "tLand", label: "在 Q 落地"}
  ]}
  hud={[
    {symbol: "v", expr: "ski.speed(t)", unit: "m/s", digits: 2},
    {symbol: "a", expr: "sqrt(ski.accx(t)^2 + ski.accy(t)^2)", unit: "m/s²", digits: 2}
  ]}
  legend={[
    {kind: "velocity", label: "速度"},
    {kind: "accel", label: "加速度"}
  ]}
  note="落地后的斜坡只作示意，不按比例；飞出后不再落回轨道"
>
sim({
  at(t, p) {
    return p.ski.state(t)
  },
  draw(ctx, s, v) {
    const p = v.p
    const th = p.theta * Math.PI / 180
    const xN = p.L1 * Math.cos(th)
    const yM = p.L1 * Math.sin(th)
    const xP = xN + p.L2
    const land = p.ski.state(p.tLand)
    const xQ = land.x
    const yQ = land.y
    const m = v.view({
      xmin: -0.9,
      xmax: xQ + 3.2,
      ymin: yQ - 2.4,
      ymax: yM + 1.15,
      equal: true,
      pad: 26,
    })
    const tr = v.track(m, p.ski, {
      marks: [
        {x: 0, y: yM, label: "M"},
        {x: xN, y: 0, label: "N"},
        {x: xP, y: 0, label: "P"},
      ],
    })
    const r = 0.22
    const nx = -0.85
    const ny = 1.5
    const nlen = Math.hypot(nx, ny)
    const ox = (nx / nlen) * r
    const oy = (ny / nlen) * r
    v.track(m, [
      {line: [xQ - 1.5 + ox, yQ + 0.85 + oy, xQ + 2.4 + ox, yQ - 1.35 + oy]},
    ])
    v.label(m, xQ + 0.85, yQ + 0.95, "Q")
    v.trail(m, (st) => [st.x, st.y], {kind: "velocity"})
    const [bx, by] = tr.place(s, r)
    v.ball(m, bx, by, r)
    const sp = Math.hypot(s.vx, s.vy) || 1
    v.vec(m, bx, by, s.vx / sp * 1.15, s.vy / sp * 1.15, {kind: "velocity", label: "v"})
    const ap = Math.hypot(s.accx, s.accy)
    if (ap > 0.05) {
      v.vec(m, bx, by, s.accx / ap * 0.85, s.accy / ap * 0.85, {kind: "accel", label: "a"})
    }
    v.event(m, xP + (xQ - xP) * 0.62, yQ + 1.35, "落地", {at: p.tLand, kind: "velocity"})
  },
})
</Sim>

<Plot title="速率" size="wide"
  x={{name: "t", label: "t", unit: "s", min: 0, max: "tLand"}}
  y={{label: "v", unit: "m/s", min: 0}}
  series={[{label: "v", expr: "ski.speed(t)", color: "velocity"}]}
  marks={[
    {x: "tN", label: "N"},
    {x: "tP", label: "P"},
    {x: "tLand", label: "Q"}
  ]}
  cursor="t"
/>

<Plot title="加速度大小" size="wide"
  x={{name: "t", label: "t", unit: "s", min: 0, max: "tLand"}}
  y={{label: "a", unit: "m/s²", min: 0, max: "g + 1"}}
  series={[{label: "a", expr: "sqrt(ski.accx(t)^2 + ski.accy(t)^2)", color: "accel"}]}
  marks={[
    {x: "tN", label: "N：a → 0"},
    {x: "tP", label: "P：a = g"},
    {x: "tLand", label: "Q"}
  ]}
  cursor="t"
/>

## 完整解答

取沿轨道向下为正。斜面上支持力与重力的法向分量平衡，沿斜面的合力就是重力的分力：

$$
a_1 = g\sin\theta
$$

代表性数值 θ = 30°、g = 10 m/s² 时，$a_1 = 5\,\mathrm{m/s^2}$。速率从零开始均匀增加，v–t 图是一段过原点的直线。

水平段 NP 上重力与支持力平衡，没有摩擦，合力为零：

$$
a_2 = 0
$$

速率保持刚过 N 点时的值，v–t 图是一段水平线。

从 P 点飞出后只受重力，加速度大小恒为 g，方向竖直向下。水平分速度仍是 v_P，竖直分速度从 0 增大，所以速率

$$
v = \sqrt{v_P^2 + (gt)^2}
$$

随时间增大，但增加得越来越快，v–t 图是向上弯的曲线，不是直线，更不会回到零。代表性数值下空中加速度大小为 $\boxed{10\,\mathrm{m/s^2}}$，高于斜面上的 $\boxed{5\,\mathrm{m/s^2}}$。

**A 错误。** 前两段对：斜面上 v 均匀增加，水平段 v 不变。飞出以后速率不再均匀增加，斜率也不是另一段直线。

**B 错误。** 空中没有使速率减小的力。竖直分速度从零增大，速率只会比 v_P 更大，不会回到 t 轴。

**C 正确。** 加速度大小先是常数 a₁ = g sin θ，水平段降为 0，飞出后跳到 a₃ = g。sin θ < 1，后一段比前一段高。

**D 错误。** 两段加速度都是常数、中间为零，这一点和 C 相同；但 a₁ = g sin θ 与 a₃ = g 不相等，两段水平线不能等高。

因此选 C。

## 结合图像

拖动时间，或点进度条上的 N、P、Q。

- 过 N 之前：v 直线上升，a 保持 a₁。
- N 到 P：v 水平，a 贴在 0 上。
- P 到 Q：a 跳到 g，比 a₁ 高；v 向上弯曲，斜率越来越大。

把 θ 拖大，a₁ 靠近 g，两段水平线靠近但仍不相等，D 仍然不成立。
