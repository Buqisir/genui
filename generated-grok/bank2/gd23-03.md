---
id: gd23-03
title: 铯原子喷泉钟的上抛运动
source: 2023 广东卷 第 3 题（单选，4 分）
question: |
  铯原子喷泉钟是定标“秒”的装置。在喷泉钟的真空系统中，可视为质点的铯原子团在激光的推动下，获得一定的初速度。随后激光关闭，铯原子团仅在重力的作用下做竖直上抛运动，到达最高点后再做一段自由落体运动。取竖直向上为正方向。下列可能表示激光关闭后铯原子团速度 v 或加速度 a 随时间 t 变化的图像是（　　）

  A.【图】v–t 图像。纵轴 v、横轴 t，原点 O。一条直线从纵轴正半轴上的一点出发，向右下方倾斜，与横轴相交后改以较缓的斜率向右上方离开横轴，末端有一条短的竖直虚线。图线全程在横轴及其上方，没有进入负半轴。

  B.【图】v–t 图像。纵轴 v、横轴 t，原点 O。一条折线：从纵轴正半轴上的一点出发，较陡地向右下方倾斜到横轴；过横轴后改以明显较缓的斜率继续向右下方进入负半轴（在横轴处有一个拐角），末端有一条短的竖直虚线。没有折返。

  C.【图】a–t 图像。纵轴 a、横轴 t，原点 O。先有一段位于横轴上方的水平线段（从纵轴附近向右延伸），接着改成一段位于横轴下方的水平线段，该段末端有一条短的竖直虚线。

  D.【图】a–t 图像。纵轴 a、横轴 t，原点 O。只有一段位于横轴下方的水平线段，与纵轴之间隔着一段空隙；线段左右两端各有一条竖直虚线向上连到横轴。
choice: D
answers: []
---

激光关闭之后，真空系统里只有重力。取竖直向上为正，铯原子团从某一高度以初速度 $v_0 > 0$ 上抛，到达最高点后仍只受重力，接着自由下落。上升和下落是同一段竖直上抛，不是两种受力。

题目没有给初速度和重力加速度的数值。下面取代表性数值 $v_0 = 4\,\mathrm{m/s}$、$g = 10\,\mathrm{m/s^2}$，只用来画出运动和图线的形状；选项的对错不依赖这两个数。喷泉钟的真空腔按示意画，高度不按比例。

## 完整解答

激光关闭后受力只有重力。取竖直向上为正，加速度始终为

$$
a = -g
$$

不随时间、速度和位置改变。设激光关闭为 $t = 0$，速度为

$$
v = v_0 - gt
$$

$v_0 > 0$ 时，$v$–$t$ 图是一条斜率为 $-g$ 的直线：从纵轴正半轴出发，在 $t = v_0/g$ 穿过横轴，之后进入负半轴。穿过横轴前后斜率不变。代表性数值下，到达最高点的时刻为

$$
t_m = \frac{v_0}{g} = \frac{4}{10} = 0.4\,\mathrm{s}
$$

这一时刻速度为 0，加速度仍是 $-g$。再经过 $0.4\,\mathrm{s}$，速度变为 $-v_0$。

### A：错误

图线全程在横轴及其上方，与横轴相交后又向右上方离开。这表示速度减到 0 以后又变回正值，原子团会再次向上运动。激光已经关闭，没有新的向上的力，速度只会继续变负。所以 A 不对。

### B：错误

图线进入了负半轴，但在横轴处有一个拐角，下降段的斜率明显比上升段缓。$v$–$t$ 图的斜率就是加速度。拐角表示速度为 0 的那一刻加速度突然变小，而重力没有变。上升和下降应该是同一条斜率为 $-g$ 的直线。所以 B 不对。

### C：错误

前一段加速度为正，后一段加速度为负。取竖直向上为正时，重力向下，加速度从激光关闭起就是 $-g$，不会先正后负。速度由正变负，不改变加速度的方向。所以 C 不对。

### D：正确

图上只有一段位于横轴下方的水平线段，表示这一段时间里加速度是负的常数。这正是激光关闭后 $a = -g$ 的图像。线段与纵轴之间的空隙，表示图线从某一时刻开始，不必定从 $t = 0$ 画起；两端的竖直虚线只标出这一段的起止时刻。所以 D 正确。

## 交互演示

拖动时间，看原子团上升、到达最高点、再下落。速度箭头会翻转，加速度箭头始终向下。两张图的游标跟着同一个时刻。

<Question text="A. v–t 图线全程在横轴及其上方，与横轴相交后改以较缓的斜率向右上方离开" set={{t: 0.4}} hint="速度减到 0 后会继续变负，不会再次变正" />

<Question text="B. v–t 折线过横轴后改以较缓的斜率进入负半轴" set={{t: 0.6}} hint="穿过横轴前后斜率都是 −g，没有拐角" />

<Question text="C. a–t 图先是横轴上方的水平段，再改成横轴下方的水平段" set={{t: 0.2}} hint="加速度从激光关闭起就是 −g，不会先正后负" />

<Question text="D. a–t 图只有一段位于横轴下方的水平线段" set={{t: 0.4}} hint="这一段里 a = −g，与运动阶段无关" />

<Param name="t" label="激光关闭后的时间" value={0.4} min={0} max={0.8} step={0.01} unit="s" />

<Param name="v0" label="初速度" symbol="v_0" value={4} min={2} max={6} step={0.1} unit="m/s" color="velocity" />

<Param name="g" label="重力加速度大小" value={10} hidden />

<Define name="y0" expr="0.15" />

<Define name="y" expr="y0 + v0*t - 0.5*g*t*t" />

<Define name="v" expr="v0 - g*t" />

<Define name="a" expr="-g" />

<Define name="tTop" expr="v0/g" />

<Define name="tEnd" expr="2*v0/g" />

<Preset label="激光刚关闭" set={{t: 0}} />

<Preset label="最高点：速度为 0" set={{t: "tTop"}} />

<Preset label="下落到 −v_0" set={{t: "tEnd"}} />

<Status cases={[
  {when: "t < tTop - 0.005", label: "仍在上升，速度为正，加速度为 −g", tone: "info"},
  {when: "abs(t - tTop) < 0.01", label: "最高点：速度为 0，加速度仍为 −g", tone: "success"},
  {label: "已经下落，速度为负，加速度仍为 −g", tone: "neutral"}
]} />

<Readout items={[
  {label: "速度", symbol: "v", expr: "v", unit: "m/s", digits: 2, color: "velocity"},
  {label: "加速度", symbol: "a", expr: "a", unit: "m/s²", digits: 1, color: "accel"}
]} />

<Answer items={[
  {label: "答案", text: "D"}
]} />

<Sim title="喷泉钟真空腔里的上抛" height={340} size="wide" duration="tEnd" time="t" params={["v0", "g", "y0", "tTop", "tEnd"]} marks={[{t: 0, label: "激光关闭"}, {t: "tTop", label: "到达最高点"}, {t: "tEnd", label: "下落到 −v_0"}]} hud={[{symbol: "v", label: "速度", expr: "v0 - g*t", unit: "m/s", digits: 2}, {symbol: "a", label: "加速度", expr: "-g", unit: "m/s²", digits: 1}]} note="真空腔高度不按比例；速度向上为正，加速度始终为 −g">
sim({
  at(t, p) {
    return {
      y: p.y0 + p.v0 * t - 0.5 * p.g * t * t,
      v: p.v0 - p.g * t,
    }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -0.55, xmax: 0.85, ymin: -0.08, ymax: 1.22, equal: true })
    v.vessel(m, [{ x1: -0.28, y1: 0, x2: 0.28, y2: 1.05 }], {
      fills: [{ x1: -0.28, y1: 0, x2: 0.28, y2: 1.05, kind: 'gas', count: 14, density: 0.25 }],
    })
    v.photon(m, -0.52, 0.12, -0.3, 0.16, { still: true })
    v.label(m, -0.48, 0.28, '激光已关闭')
    v.trail(m, (st) => [0, st.y], { kind: 'velocity' })
    v.ball(m, 0, s.y, 0.045, { label: 'Cs' })
    const vy = Math.max(-0.22, Math.min(0.22, s.v * 0.045))
    if (Math.abs(s.v) > 0.05) v.vec(m, 0.16, s.y, 0, vy, { kind: 'velocity', label: 'v' })
    v.vec(m, -0.16, s.y, 0, -0.18, { kind: 'accel', label: 'a' })
    if (Math.abs(s.v) <= 0.05) v.event(m, 0.16, s.y, 'v = 0', { at: v.p.tTop, kind: 'velocity' })
  },
})
</Sim>

<Plot
  title="速度随时间变化"
  size="narrow"
  caption="一条斜率为 −g 的直线，穿过横轴时没有拐角"
  x={{name: "t", label: "t", unit: "s", min: 0, max: "tEnd"}}
  y={{label: "v", unit: "m/s", min: "-v0", max: "v0"}}
  series={[{label: "v", expr: "v0 - g*t", color: "velocity"}]}
  marks={[{x: "tTop", label: "最高点，v = 0"}]}
  cursor="t"
/>

<Plot
  title="加速度随时间变化"
  size="narrow"
  caption="激光关闭后加速度始终为 −g"
  x={{name: "t", label: "t", unit: "s", min: 0, max: "tEnd"}}
  y={{label: "a", unit: "m/s²", min: -14, max: 4}}
  series={[{label: "a", expr: "-g", color: "accel"}]}
  cursor="t"
/>

## 结合图像看关键时刻

- $t = 0$：激光刚关闭，$v = v_0 > 0$，$a = -g$。原子团仍在上升。
- $t = v_0/g$：到达最高点，$v = 0$，$a$ 仍是 $-g$。速度为 0 不是受力改变。
- $t > v_0/g$：速度变负，原子团向下运动，加速度仍是 $-g$。$v$–$t$ 图继续以同一斜率进入负半轴。

A 把下降画成速度再次变正，B 把同一条直线折成两段不同斜率，C 把始终为负的加速度画成先正后负。只有 D 的水平线段与 $a = -g$ 一致。

## 答案汇总

选 $\boxed{\text{D}}$。
