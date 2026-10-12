---
id: r6-06-car-chase
title: 追及相遇：前车刹车
subject: physics
topic: 追及相遇
source: 必修1 专题二 追及与相遇问题 例1
question: |
  汽车 A 以 v_A=4 m/s 的速度向右做匀速直线运动，汽车 B 以 v_B=10 m/s 的速度同向运动。当 B 在 A 前方 x₀=7 m 处时，B 开始以大小为 a=2 m/s² 的加速度匀减速刹车，直到静止。从 B 开始刹车时计时，求：
  (1) 在 A 追上 B 之前，A、B 之间的最远距离；
  (2) 从 B 开始刹车起，经过多长时间 A 恰好追上 B。
answers:
  - { name: dmax, value: 16, unit: m }
  - { name: tCatch, value: 8, unit: s }
---

## 一、题目条件分析

- A 车匀速：$v_A = 4\ \text{m/s}$。
- B 车在 A 前方 $x_0 = 7\ \text{m}$ 处开始刹车：初速度 $v_B = 10\ \text{m/s}$，加速度大小 $a = 2\ \text{m/s}^2$，**刹停后不再运动**。

## 二、完整解答

### （1）最远距离

开始时 B 比 A 快，两车距离越来越大；B 减速到和 A 一样快之后，A 开始缩小距离。所以**速度相等时距离最远**：

$$
v_B - at_1 = v_A \quad\Rightarrow\quad t_1 = \frac{10-4}{2} = 3\ \text{s}
$$

这段时间里两车的位移：

$$
x_A = v_A t_1 = 12\ \text{m},\qquad x_B = v_B t_1 - \tfrac12 a t_1^2 = 21\ \text{m}
$$

$$
d_{\max} = x_0 + x_B - x_A = 7 + 21 - 12 = \boxed{16\ \text{m}}
$$

### （2）追上的时间

先看 B 什么时候停下：

$$
t_{\text{停}} = \frac{v_B}{a} = 5\ \text{s},\qquad x_{B,\text{停}} = \frac{v_B^2}{2a} = 25\ \text{m}
$$

5 s 时 A 只走了 $20\ \text{m}$，两车还相距 $7 + 25 - 20 = 12\ \text{m}$，说明 **B 停车时 A 还没追上**。之后 B 静止，A 还要走

$$
t' = \frac{12}{4} = 3\ \text{s}
$$

$$
t_{\text{追}} = 5 + 3 = \boxed{8\ \text{s}}
$$

> **易错点**：如果直接列 $4t = 7 + 10t - t^2$，会解出 $t = 7\ \text{s}$。但 B 在 5 s 时已经停下，匀减速公式只在 $0 \le t \le 5\ \text{s}$ 内成立，7 s 是错误答案。

## 三、交互演示

<Param name="vA" label="A 车速度 v_A" value={4} min={1} max={8} step={0.5} unit="m/s" />

<Param name="vB0" label="B 车初速度 v_B" value={10} min={5} max={16} step={0.5} unit="m/s" />

<Param name="a" label="B 车刹车加速度 a" value={2} min={0.5} max={4} step={0.5} unit="m/s²" />

<Param name="x0" label="初始距离 x₀" value={7} min={0} max={20} step={1} unit="m" />

<Param name="t" label="时间" value={0} min={0} max={40} step={0.01} unit="s" hidden />

<Motion name="chase" state={{xA: 0, xB: "x0", vB: "vB0", braking: 1}} rates={{xA: "vA", xB: "vB", vB: "-a*braking"}} until={120}
  events={[
    {name: "tEqual", when: "vB - vA", dir: "down"},
    {name: "tStop", when: "vB", dir: "down", set: {vB: 0, braking: 0}},
    {name: "tCatch", when: "xA - xB", dir: "up", stop: true}
  ]}
  read={{dmax: "max(xB - xA)"}} />

<Define name="tEq" expr="isNaN(tEqual) ? 0 : tEqual" />

<Define name="tb" expr="min(t, tStop)" />

<Define name="xA" expr="vA * t" />

<Define name="xB" expr="x0 + vB0 * tb - a * tb^2 / 2" />

<Define name="vB" expr="max(vB0 - a * t, 0)" />

<Status cases={[
  {when: "t >= tCatch - 0.005", label: "A 已追上 B", tone: "success"},
  {when: "t >= tStop", label: "B 已停车，A 继续追", tone: "warning"},
  {when: "abs(t - tEq) < 0.005", label: "速度相等，距离最远", tone: "info"},
  {when: "t > tEq", label: "距离在缩小", tone: "info"},
  {label: "距离在增大", tone: "neutral"}
]} />

<Preset label="距离最远" set={{t: "tEq"}} />

<Preset label="B 停车" set={{t: "tStop"}} />

<Preset label="A 追上 B" set={{t: "tCatch"}} />

点播放：两车各在一条车道上向右行驶，车头位置每隔 1 s 留下一个频闪点。A 的点间距不变（匀速），B 的点越来越密（刹车）。B 停下后，虚线车是把匀减速公式继续往后套出来的“倒车”位置，它在 7 s 时与 A 相遇，这就是易错答案的来历。

<Sim
  title="两车追及：频闪点每隔 1 s 一个"
  height={300}
  duration="tCatch + 1"
  time="t"
  params={["vA", "vB0", "a", "x0", "tStop", "tEq", "tCatch"]}
  hud={[
    {symbol: "Δx", expr: "xB - xA", unit: "m", digits: 1},
    {symbol: "v_B", expr: "vB", unit: "m/s", digits: 1}
  ]}
  legend={[
    {kind: "velocity", symbol: "v", label: "速度"},
    {kind: "accel", symbol: "a", label: "刹车加速度"},
    {kind: "strobe", label: "车头频闪 1 s"},
    {kind: "steel-dash", label: "公式外推（实际不存在）"}
  ]}
  marks={[
    {t: 0, label: "开始刹车"},
    {t: "tEq", label: "距离最远"},
    {t: "tStop", label: "B 停车"},
    {t: "tCatch", label: "A 追上 B"}
  ]}
>
sim({
  at(t, p) {
    const tb = Math.min(t, p.tStop)
    return {
      xA: p.vA * t,
      xB: p.x0 + p.vB0 * tb - 0.5 * p.a * tb * tb,
      vB: Math.max(p.vB0 - p.a * t, 0),
      xGhost: p.x0 + p.vB0 * t - 0.5 * p.a * t * t,
    }
  },
  draw(ctx, s, v) {
    const p = v.p
    const xStop = p.x0 + (p.vB0 * p.vB0) / (2 * p.a)
    const xEnd = Math.max(xStop, p.vA * (p.tCatch + 1)) + 3
    const m = v.view({ xmin: -5, xmax: xEnd, ymin: -1.9, ymax: 3.5, pad: 14 })
    const laneA = 2.0
    const laneB = 0
    const L = 4
    const k = 0.5

    v.ground(m, -5, xEnd, laneA)
    v.ground(m, -5, xEnd, laneB)
    v.text(m, -4.6, laneA + 0.45, 'A 车道', { align: 'left', color: v.color.steel, size: 11 })
    v.text(m, -4.6, laneB + 0.45, 'B 车道', { align: 'left', color: v.color.steel, size: 11 })
    v.axisX(m, { y: -1.05, step: 4, from: 0, to: Math.floor(xEnd / 4) * 4, unit: 'x / m' })

    v.line(m, xStop, laneB - 0.1, xStop, laneB + 1.1, { color: v.color.steel, width: 1, dash: [3, 3] })
    v.label(m, xStop, laneB + 1.1, 'B 停车处 ' + xStop.toFixed(0) + ' m', { color: v.color.graphite, size: 11, place: 'above', offset: 4, background: false })

    v.strobe(m, (st) => [st.xA, laneA + 0.12], { every: 1, r: 2.6 })
    v.strobe(m, (st) => [st.xB, laneB + 0.12], { every: 1, r: 2.6 })

    if (v.t > p.tStop + 0.05 && s.xGhost > -4) {
      v.cart(m, s.xGhost - L, laneB, L, 22, { hPx: true, ghost: true })
      v.text(m, s.xGhost - L / 2, laneB - 0.55, '公式外推的 B', { color: v.color.steel, size: 11 })
    }

    v.cart(m, s.xA - L, laneA, L, 22, { hPx: true, label: 'A', labelAt: 0.4 })
    v.cart(m, s.xB - L, laneB, L, 22, { hPx: true, label: 'B', labelAt: 0.4 })

    v.vec(m, s.xA, laneA + 0.38, p.vA * k, 0, { kind: 'velocity', label: 'v_A ' + p.vA.toFixed(1) })
    if (s.vB > 1e-6) {
      v.vec(m, s.xB, laneB + 0.38, s.vB * k, 0, { kind: 'velocity', label: 'v_B ' + s.vB.toFixed(1) })
      v.vec(m, s.xB - L / 2, laneB + 0.95, -p.a * 0.8, 0, { kind: 'accel', label: 'a' })
    }

    const gap = s.xB - s.xA
    if (gap > 0.3) v.dim(m, s.xA, 1.42, s.xB, 1.42, 'Δx = ' + gap.toFixed(1) + ' m', { offset: 0 })

    v.event(m, (s.xA + s.xB) / 2, 1.42, '速度相等，距离最远', { at: p.tEq, kind: 'velocity', pulse: false })
    v.event(m, s.xB, laneB + 0.5, 'B 停车', { at: p.tStop, kind: 'accel' })
    v.event(m, s.xB, laneA + 0.5, 'A 追上 B', { at: p.tCatch, kind: 'velocity' })
  },
})
</Sim>

<Readout items={[
  {label: "两车距离", expr: "xB - xA", unit: "m", digits: 1},
  {label: "A 车速度", expr: "vA", unit: "m/s", digits: 1},
  {label: "B 车速度", expr: "vB", unit: "m/s", digits: 1},
  {label: "最远距离", expr: "dmax", unit: "m", digits: 1}
]} />

<Plot
  title="v-t 图像：两条线之间的面积就是距离的变化"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "tCatch + 1"}}
  y={{label: "v", unit: "m/s", min: 0}}
  series={[
    {label: "A 车", expr: "vA", color: "ink"},
    {label: "B 车", expr: "max(vB0 - a * s, 0)", color: "velocity"}
  ]}
  marks={[
    {x: "tEq", series: 0, label: "速度相等，距离最远"},
    {x: "tStop", series: 1, label: "B 停车"}
  ]}
  cursor="t"
/>

<Plot
  title="x-t 图像：两条线相交就是追上"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "tCatch + 1"}}
  y={{label: "x", unit: "m", min: 0}}
  series={[
    {label: "A 车", expr: "vA * s", color: "ink"},
    {label: "B 车", expr: "x0 + vB0 * min(s, tStop) - a * min(s, tStop)^2 / 2", color: "velocity"}
  ]}
  marks={[
    {x: "tStop", series: 1, label: "B 停车"},
    {x: "tCatch", series: 0, label: "A 追上 B"}
  ]}
  cursor="t"
/>

拖动上面的滑块改变条件，可以看到：只要 B 在被追上之前就停下，追上的时间就不能用匀减速公式直接解。

## 四、答案汇总

| 问题 | 答案 |
|---|---|
| （1）最远距离 | $16\ \text{m}$（$t = 3\ \text{s}$ 时） |
| （2）追上的时间 | $8\ \text{s}$ |
