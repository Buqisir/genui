---
id: gd22-06
title: 玩具枪与下落积木
source: 2022 广东卷 第 6 题（单选，4 分）
question: 如图5所示，在竖直平面内，截面为三角形的小积木悬挂在离地足够高处，一玩具枪的枪口与小积木上 P 点等高且相距为 L。当玩具子弹以水平速度 v 从枪口向 P 点射出时，小积木恰好由静止释放，子弹从射出至击中积木所用时间为 t。不计空气阻力。下列关于子弹的说法正确的是（ ）
choice: B
answers: []
---

枪口与积木上 P 点等高，水平相距 L。子弹以水平速度 v 射出的同一瞬间，积木由静止释放。不计空气阻力，两者在竖直方向都只受重力，从同一高度、初速度为零开始自由下落。题目只给字母，下面取 L = 2 m、v = 4 m/s、g = 10 m/s² 做示意，尺寸不按比例。

## 完整解答

子弹做平抛运动：水平方向另速，竖直方向自由下落。积木整体自由下落，P 点跟着一起下落。

取枪口为原点，x 轴水平指向 P，y 轴竖直向上。射出后经过时间 t，

$$
x_\text{子} = vt, \qquad y_\text{子} = -\frac{1}{2}gt^2
$$

P 点水平位置不变，竖直位置

$$
x_P = L, \qquad y_P = -\frac{1}{2}gt^2
$$

两者竖直位移始终相同。子弹水平走完 L 时，

$$
t = \frac{L}{v}
$$

此时 $y_\text{子} = y_P$，子弹击中的正是 P 点，不是 P 的上方或下方。代表性数值下 $t = 2/4 = 0.5\ \text{s}$，下落高度

$$
\boxed{h = \frac{1}{2}g\left(\frac{L}{v}\right)^2 = 1.25\ \text{m}}
$$

**A. 将击中 P 点，t 大于 L/v　错误。** 击中点是对的，时间不对。水平方向没有加速度，走完 L 就是 $t = L/v$，不会因为边下落边变长。

**B. 将击中 P 点，t 等于 L/v　正确。** 竖直位移相同，水平方向另速，两者同时成立。

**C. 将击中 P 点上方，t 大于 L/v　错误。** 积木并不停在原处。子弹下落多少，P 点就下落多少，相对竖直位置不变，不会打到 P 的上方；时间也不大于 L/v。

**D. 将击中 P 点下方，t 等于 L/v　错误。** 时间是对的，位置不对。子弹竖直初速度为零，和积木一样自由下落，不会相对 P 点下滑。

故选 $\boxed{B}$。

## 交互演示

拖动时间，看子弹和 P 点是不是始终在同一水平线上；拖 L 或 v，击中时刻只随 L/v 改变。

<Question text="A. 将击中 P 点，t 大于 L/v" set={{t: "tHit", L: 2, v: 4}} hint="水平另速，走完 L 就是 t = L/v" />

<Question text="B. 将击中 P 点，t 等于 L/v" set={{t: "tHit", L: 2, v: 4}} hint="两者竖直位移相同，子弹正打在 P 上" />

<Question text="C. 将击中 P 点上方，t 大于 L/v" set={{t: "tHit / 2", L: 2, v: 4}} hint="中途子弹和 P 仍在同一高度" />

<Question text="D. 将击中 P 点下方，t 等于 L/v" set={{t: "tHit", L: 2, v: 4}} hint="到达时两者高度相同，不会打在 P 下方" />

<Param name="L" label="枪口到 P 的水平距离" symbol="L" value={2} min={1} max={4} step={0.1} unit="m" />

<Param name="v" label="子弹初速度" symbol="v" color="velocity" value={4} min={2} max={8} step={0.1} unit="m/s" />

<Param name="g" label="重力加速度" value={10} hidden />

<Param name="t" label="时间" symbol="t" value={0} min={0} max="Tshow" step={0.01} unit="s" />

<Define name="tHit" expr="L/v" />

<Define name="h" expr="0.5*g*tHit*tHit" />

<Define name="yNow" expr="-0.5*g*t*t" />

<Define name="xNow" expr="v*min(t, tHit)" />

<Define name="Tshow" expr="tHit + 0.35" />

<Preset label="击中瞬间" set={{t: "tHit", L: 2, v: 4}} />

<Status cases={[
  {when: "t < tHit - 0.01", label: "下落中：子弹与 P 同高", tone: "info"},
  {when: "t < tHit + 0.02", label: "击中 P 点，t = L/v", tone: "success"},
  {label: "已经击中", tone: "neutral"}
]} />

<Readout items={[
  {label: "击中时间", symbol: "t", expr: "tHit", unit: "s", digits: 2},
  {label: "L/v", symbol: "L/v", expr: "L/v", unit: "s", digits: 2},
  {label: "当前下落", symbol: "h", expr: "-yNow", unit: "m", digits: 2}
]} />

<Answer items={[
  {label: "答案", text: "B"},
  {label: "击中时间", symbol: "t", text: "L/v"},
  {label: "击中位置", text: "P 点"}
]} />

<Sim
  title="子弹击中下落积木"
  height={360}
  duration="Tshow"
  time="t"
  params={["L", "v", "g", "tHit", "h"]}
  marks={[
    {t: 0, label: "射出并释放"},
    {t: "tHit", label: "击中 P 点"}
  ]}
  hud={[
    {symbol: "t", expr: "t", unit: "s", digits: 2},
    {symbol: "L/v", expr: "L/v", unit: "s", digits: 2}
  ]}
  legend={[
    {kind: "velocity", label: "子弹速度 v"},
    {kind: "velocity-dash", label: "起点轨迹"}
  ]}
  note="积木尺寸、绳长不按比例。离地足够高，地面只作参考。"
>
sim({
  at(t, p) {
    const hit = Math.min(t, p.tHit)
    const y = -0.5 * p.g * hit * hit
    return {
      x: p.v * hit,
      y,
      hit: t >= p.tHit - 1e-9,
    }
  },
  draw(ctx, s, v) {
    const p = v.p
    const drop = 0.5 * p.g * p.tHit * p.tHit
    const top = 0.55
    const m = v.view({
      xmin: -0.55,
      xmax: p.L + 1.15,
      ymin: -drop - 0.85,
      ymax: top + 0.72,
      equal: true,
    })

    v.ground(m, -0.4, p.L + 1.05, -drop - 0.55)

    const beamY = top + 0.42
    v.ground(m, -0.15, p.L + 0.55, beamY, { side: 'above', thick: 8 })
    const hangX = p.L - 0.18
    v.rope(m, [[hangX, beamY], [hangX, top]])
    v.rope(m, [[hangX + 0.36, beamY], [hangX + 0.36, top]])

    const base = 0.72
    const half = base / 2
    const height = 0.62
    const apexX = p.L
    const leftX = apexX - half
    const rightX = apexX + half
    const baseY = s.y - height / 3
    const apexY = baseY + height
    const pY = (baseY + apexY) / 2
    v.path(m, [[apexX, apexY], [rightX, baseY], [leftX, baseY]], {
      close: true,
      fill: v.color.steel,
      color: v.color.graphite,
    })
    v.label(m, apexX, baseY + height * 0.32, '积木', { place: 'center', size: 12 })

    const ghost = pY + drop
    v.path(m, [
      [apexX, apexY + (ghost - pY)],
      [rightX, baseY + (ghost - pY)],
      [leftX, baseY + (ghost - pY)],
    ], { close: true, dash: true, color: v.color.steel })
    v.label(m, apexX + half + 0.08, ghost, 'P', { place: 'right' })

    v.ball(m, 0, s.y, 0.055, { label: false })
    v.vec(m, 0, s.y, Math.min(p.v, 2.2) * 0.16, 0, { kind: 'velocity', label: 'v' })
    v.label(m, leftX, pY, 'P', { place: 'left' })

    if (!s.hit) {
      v.trail(m, (st) => [st.x, st.y], { kind: 'velocity', every: 0.08 })
    } else {
      v.event(m, p.L, s.y, '击中 P', { at: p.tHit, kind: 'force' })
    }

    v.dim(m, 0, ghost + 0.28, p.L, ghost + 0.28, 'L', { offset: 16 })
    v.line(m, 0, ghost, p.L, ghost, { dash: true, color: v.color.steel })
  },
})
</Sim>

<Plot
  title="竖直位移"
  size="wide"
  x={{name: "t", label: "t", unit: "s", min: 0, max: "Tshow"}}
  y={{label: "y", unit: "m", min: "-h - 0.4", max: 0.3}}
  series={[
    {label: "子弹", expr: "-0.5*g*min(t, tHit)^2", color: "velocity"},
    {label: "P 点", expr: "-0.5*g*min(t, tHit)^2", color: "graphite", dash: true}
  ]}
  marks={[{x: "tHit", label: "击中，y 相同"}]}
  cursor="t"
/>

## 结合图像

竖直位移图上，子弹和 P 点是同一条曲线：都是 $y = -\tfrac{1}{2}gt^2$。游标拖到 $t = L/v$，两条曲线仍然重合，对应画面里子弹打在 P 上，而不是打在上方或下方。改变 L 或 v 只改变水平走完的时间，不改变「竖直始终同高」这一点。

## 答案汇总

子弹击中 P 点，所用时间 $t = L/v$。选 **B**。
