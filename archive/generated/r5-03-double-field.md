---
id: r5-03-double-field
title: 双磁场中的周期运动：位移抵消与多次穿越
subject: physics
topic: 带电粒子在匀强磁场中的运动
source: 选必2 模块备考卷 15 题（14 分）
question: |
  相距为 d 的两平行虚线 L₁ 和 L₂（L₁ 在上），L₁ 上方和 L₂ 下方都是垂直于纸面向里、磁感应强度相同的匀强磁场，两虚线之间没有磁场。A、B 两点都在 L₂ 上。质量为 m、电荷量为 +q 的带电粒子从 A 点以初速度 v₀ 与 L₂ 成 30° 斜向上射出，经过偏转后正好过 L₂ 上的 B 点，经过 B 点时速度方向也斜向上，不计粒子的重力。
  (1) 求 A、B 两点的距离；
  (2) 若另一质量为 m、电荷量为 -q 的粒子从 A 点以同样的速度射出，粒子是否还能经过 B 点，说明理由；
  (3) 若该粒子从 A 点以 v₀ 与 L₂ 成 60° 斜向上射出，粒子仍能经过 B 点，求两种出射情况下从 A 点到达 B 点的时间之比。
answers:
  - { name: ABbar, value: 3.4641016151377544, unit: "d" }
  - { name: T30bar, value: 10.283185307179586, unit: "d/v₀" }
  - { name: T60bar, value: 25.77775915181427, unit: "d/v₀" }
  - { name: timeRatio, value: 0.398917, unit: "1" }
---

## 一、题目条件分析

把初速度的水平分量方向规定为 $x$ 轴正方向，以 A 为原点，令 $L_2$ 为 $y=0$、$L_1$ 为 $y=d$。用 $B_0$ 表示磁感应强度，避免与点 B 混淆。

粒子只受洛伦兹力，速率始终为 $v_0$：

- 无磁场区：匀速直线运动。
- 磁场区：匀速圆周运动，半径与周期为
  $$
  \boxed{R=\frac{mv_0}{qB_0}},\qquad
  \boxed{T_{\mathrm c}=\frac{2\pi m}{qB_0}}.
  $$
- 磁场向里，正电荷的速度方向逆时针转动，负电荷顺时针转动。

把“从 $L_2$ 斜向上出发，再次以相同方向穿出 $L_2$”称为一轮。**一轮包含两段直线和两段圆弧。**

第（3）问按题目最初的 $+q$ 粒子讨论。

## 二、完整解答

### 通用几何关系：一轮的水平位移

设出射角为 $\alpha$，其中 $0<\alpha<90^\circ$。

一段直线穿越无磁场区时，

$$
\Delta x_{\mathrm{直}}=d\cot\alpha,\qquad
\boxed{t_{\mathrm{直}}=\frac{d}{v_0\sin\alpha}}.
$$

对于正电荷，进入上方磁场时速度斜向右上。它沿逆时针方向转过大圆弧，再次穿过 $L_1$ 时速度斜向右下：

$$
\varphi_{\mathrm{上}}=2\pi-2\alpha,\qquad
\Delta x_{\mathrm{上}}=-2R\sin\alpha.
$$

粒子沿直线到达 $L_2$，进入下方磁场后转过小圆弧，再次穿出 $L_2$：

$$
\varphi_{\mathrm{下}}=2\alpha,\qquad
\Delta x_{\mathrm{下}}=+2R\sin\alpha.
$$

两段圆弧的水平位移恰好抵消，所以

$$
\Delta x_{\mathrm{轮}}
=d\cot\alpha-2R\sin\alpha
+d\cot\alpha+2R\sin\alpha
=\boxed{2d\cot\alpha}.
$$

两段圆弧的圆心角之和为 $2\pi$，在磁场内的总时间恰好等于一个回旋周期：

$$
\boxed{t_{\mathrm{轮}}(\alpha)
=\frac{2d}{v_0\sin\alpha}+T_{\mathrm c}}.
$$

一轮结束后，粒子的速度方向恢复为初始方向，因此可以重复相同的运动。

### （1）A、B 两点的距离

取 $\alpha=30^\circ$。正电荷第一次沿斜向下方向回到 $L_2$ 时，横坐标为

$$
x_{\downarrow}=\sqrt3d-R<2\sqrt3d.
$$

随后通过下方磁场，沿斜向上方向穿出 $L_2$，到达 B。因此

$$
\boxed{AB=2d\cot30^\circ=2\sqrt3d}.
$$

这个距离与 $R$ 无关：改变磁场强弱会改变圆弧大小，但不会改变一轮的净水平位移。

### （2）改为负电荷，是否还能经过 B？

**能。**

负电荷转动方向反转：上方走小圆弧，下方走大圆弧。其一轮中的圆弧位移变为

$$
\Delta x_{\mathrm{上}}=+2R\sin\alpha,\qquad
\Delta x_{\mathrm{下}}=-2R\sin\alpha.
$$

它们仍然抵消，故负电荷一轮的净水平位移仍为

$$
\Delta x_{\mathrm{轮}}=2d\cot30^\circ
=\boxed{2\sqrt3d}.
$$

一轮结束时速度恢复为斜向上，所以负电荷**必定能沿斜向上方向经过 B**。

> 这里证明的是必然存在的斜向上经过。若恰有 $R=\sqrt3d$，负电荷还会在此前沿斜向下方向经过 B，不能把一轮结束时刻无条件称为它第一次到达 B 的时刻。

### （3）两种出射情况下的到达时间之比

$30^\circ$ 出射时，正电荷一轮到达 B：

$$
\boxed{t_{30}
=\frac{2d}{v_0\sin30^\circ}+T_{\mathrm c}
=\frac{4d}{v_0}+\frac{2\pi m}{qB_0}}.
$$

$60^\circ$ 出射时，每轮的净水平位移为

$$
\boxed{\Delta x_{60}=2d\cot60^\circ=\frac{2d}{\sqrt3}
=\frac{AB}{3}}.
$$

因此，需要三轮才能沿斜向上方向到达 B。

也要排除提前沿斜向下方向经过 B：前三轮中，第 $k$ 轮向下到达 $L_2$ 的横坐标为

$$
x_{\downarrow,k}
=\frac{(2k-1)d}{\sqrt3}-\sqrt3R,
\qquad k=1,2,3.
$$

这些横坐标均小于 $AB=6d/\sqrt3$。所以第三轮结束确实是正电荷第一次到达 B。

$$
\boxed{t_{60}
=3\left(\frac{2d}{v_0\sin60^\circ}+T_{\mathrm c}\right)
=\frac{4\sqrt3d}{v_0}+\frac{6\pi m}{qB_0}}.
$$

所求时间比为

$$
\boxed{
t_{30}:t_{60}
=
\left(\frac{4d}{v_0}+\frac{2\pi m}{qB_0}\right)
:
\left(\frac{4\sqrt3d}{v_0}+\frac{6\pi m}{qB_0}\right)
}.
$$

令 $\rho=R/d$，还可写成

$$
\boxed{\frac{t_{30}}{t_{60}}
=\frac{4+2\pi\rho}{4\sqrt3+6\pi\rho}}.
$$

题目没有给出磁场强度等参数的数值，因此时间比只能写成上述含参数的形式。

## 三、交互演示

使用无量纲坐标 $x/d$、$y/d$，时间记为 $\tau=tv_0/d$。题目只有字母，演示取代表性初值 $\rho=R/d=1$；它是演示取值，不是题目额外条件。

切换情形比较电荷符号和出射角，拖动 $\rho$ 比较不同半径。点 B 始终由原题约束自动确定为 $x_B/d=2\sqrt3$。

<Param name="mode" label="出射情形" options={[{value: 1, label: "+q，30°"}, {value: 2, label: "−q，30°"}, {value: 3, label: "+q，60°"}]} value={1} />

<Param name="rho" label="回旋半径与间距之比 R/d" value={1} min={0.25} max={3} step={0.05} />

<Param name="t" label="无量纲时间 τ" value={0} min={0} max={100} step={0.01} hidden={true} />

<Define name="alpha" expr="mode == 3 ? 60 : 30" />

<Define name="arad" expr="deg(alpha)" />

<Define name="sigma" expr="mode == 2 ? -1 : 1" />

<Define name="nCycles" expr="mode == 3 ? 3 : 1" />

<Define name="ABbar" expr="2*sqrt(3)" />

<Define name="shift60bar" expr="2/sqrt(3)" />

<Define name="cycleShift" expr="2/tan(arad)" />

<Define name="flightTime" expr="1/sin(arad)" />

<Define name="topTime" expr="rho*(sigma > 0 ? 2*pi-2*arad : 2*arad)" />

<Define name="bottomTime" expr="rho*(sigma > 0 ? 2*arad : 2*pi-2*arad)" />

<Define name="topExit" expr="flightTime+topTime" />

<Define name="bottomEntry" expr="2*flightTime+topTime" />

<Define name="cycleTime" expr="2*flightTime+topTime+bottomTime" />

<Define name="totalTime" expr="nCycles*cycleTime" />

<Define name="T30bar" expr="4+2*pi*rho" />

<Define name="T60bar" expr="4*sqrt(3)+6*pi*rho" />

<Define name="timeRatio" expr="T30bar/T60bar" />

<Define name="phase" expr="clamp(t,0,totalTime)%cycleTime" />

<Define name="thetaNow" expr="phase < flightTime ? alpha : (phase < topExit ? alpha+sigma*(phase-flightTime)*180/(pi*rho) : (phase < bottomEntry ? -alpha : -alpha+sigma*(phase-bottomEntry)*180/(pi*rho)))" />

<Define name="inField" expr="((phase >= flightTime and phase < topExit) or phase >= bottomEntry) ? 1 : 0" />

<Preset label="（1）30°：沿斜向上方向到达 B" set={{mode: 1, t: "T30bar"}} />

<Preset label="（2）负电荷：沿斜向上方向经过 B" set={{mode: 2, t: "T30bar"}} />

<Preset label="（3）60°：三轮到达 B" set={{mode: 3, t: "T60bar"}} />

<Preset label="从 A 重新观察" set={{t: 0}} />

<Status cases={[
  {when: "t >= totalTime-1e-6", label: "已沿斜向上方向到达 B", tone: "success"},
  {when: "phase < flightTime", label: "无磁场区：斜向上匀速运动", tone: "neutral"},
  {when: "phase < topExit", label: "上方磁场：速率不变，速度方向转动", tone: "info"},
  {when: "phase < bottomEntry", label: "无磁场区：斜向下匀速运动", tone: "neutral"},
  {label: "下方磁场：转向后再次斜向上穿出", tone: "info"}
]} />

<Sim
  title="两段圆弧位移抵消，一轮向右平移"
  height={440}
  duration="totalTime"
  time="t"
  params={["rho", "arad", "sigma", "nCycles", "ABbar", "cycleShift", "flightTime", "topTime", "bottomTime", "topExit", "bottomEntry", "cycleTime", "totalTime"]}
  legend={[
    {kind: "velocity", symbol: "v", label: "速度 · 已走轨迹"},
    {kind: "force", symbol: "F", label: "洛伦兹力"},
    {kind: "field", symbol: "B", label: "磁场（向里）"},
    {kind: "ink", label: "圆弧的弦 = 位移"}
  ]}
  marks={[
    {t: 0, label: "从 A 出发"},
    {t: "flightTime", label: "首次进入上方磁场"},
    {t: "topExit", label: "首次离开上方磁场"},
    {t: "bottomEntry", label: "首次进入下方磁场"},
    {t: "totalTime", label: "斜向上到达 B"}
  ]}
>
sim({
  at(t, p) {
    return orbitState(t, p)
  },
  draw(ctx, s, v) {
    const p = v.p
    const ca = Math.cos(p.arad)
    const xmin = -2 * p.rho - 0.8
    const xmax = p.ABbar + 2 * p.rho + 0.8
    const upper = 1 + p.rho * (p.sigma > 0 ? 1 + ca : 1 - ca)
    const lower = -p.rho * (p.sigma > 0 ? 1 - ca : 1 + ca)
    const ymin = lower - 0.6
    const ymax = upper + 0.6
    const m = v.view({ xmin, xmax, ymin, ymax, pad: 18, equal: true })

    v.field(m, xmin, 1, xmax, ymax, { dir: 'in', step: 50 })
    v.field(m, xmin, ymin, xmax, 0, { dir: 'in', step: 50 })
    v.line(m, xmin, 1, xmax, 1, { color: v.color.steel, width: 1.2, dash: [7, 5] })
    v.line(m, xmin, 0, xmax, 0, { color: v.color.steel, width: 1.2, dash: [7, 5] })
    v.text(m, xmax - 0.15, 1.12, 'L₁', { align: 'right', color: v.color.ink, size: 13 })
    v.text(m, xmax - 0.15, 0.12, 'L₂', { align: 'right', color: v.color.ink, size: 13 })
    v.text(m, xmin + 0.6, 0.5, '无磁场', { align: 'left', color: v.color.graphite, size: 12 })
    v.dim(m, xmin + 0.3, 0, xmin + 0.3, 1, 'd', { offset: 0 })

    // 完整轨迹（虚线）+ 已走过的轨迹（速度色，带频闪点）
    const fullPath = []
    for (let i = 0; i <= 600; i++) {
      const full = orbitState(p.totalTime * i / 600, p)
      fullPath.push([full.x, full.y])
    }
    v.path(m, fullPath, { color: v.color.steel, width: 1, dash: [3, 4] })
    v.trail(m, (st) => [st.x, st.y], { samples: 360, every: p.totalTime / (14 * p.nCycles) })

    // 第一轮两段圆弧的弦：位移大小相等、方向相反
    const sa = Math.sin(p.arad)
    const entryX = ca / sa
    const exitX = entryX - 2 * p.sigma * p.rho * sa
    const bottomX = exitX + ca / sa
    const bottomOut = bottomX + 2 * p.sigma * p.rho * sa
    if (v.t >= p.topExit) {
      v.arrow(m, entryX, 1, exitX, 1, { color: v.color.ink, width: 1.6 })
      v.label(m, (entryX + exitX) / 2, 1, '上弧位移', { place: 'above', color: v.color.ink, size: 12 })
    }
    if (v.t >= p.cycleTime) {
      v.arrow(m, bottomX, 0, bottomOut, 0, { color: v.color.ink, width: 1.6 })
      v.label(m, (bottomX + bottomOut) / 2, 0, '下弧位移', { place: 'below', color: v.color.ink, size: 12 })
    }

    v.circle(m, 0, 0, 3.5, { px: true, fill: v.color.ink })
    v.circle(m, p.ABbar, 0, 3.5, { px: true, fill: v.color.ink })
    v.label(m, 0, 0, 'A', { place: 'below', color: v.color.ink, background: false })
    v.label(m, p.ABbar, 0, 'B（AB = 2√3 d）', { place: 'below', color: v.color.ink, background: false })

    if (p.nCycles === 3) {
      for (let k = 1; k < 3; k++) {
        const x = k * p.cycleShift
        v.circle(m, x, 0, 3, { px: true, fill: v.color.steel })
        v.label(m, x, 0, '第 ' + k + ' 轮', { place: 'below', color: v.color.graphite, size: 11, background: false })
      }
    }

    v.ball(m, s.x, s.y, 0.07, { charge: true, label: p.sigma > 0 ? '+q' : '−q' })
    v.vec(m, s.x, s.y, 0.42 * Math.cos(s.theta), 0.42 * Math.sin(s.theta), { kind: 'velocity', label: 'v' })
    if (s.field) {
      v.vec(m, s.x, s.y, -0.34 * p.sigma * Math.sin(s.theta), 0.34 * p.sigma * Math.cos(s.theta), { kind: 'force', label: 'F' })
    }

    v.event(m, p.ABbar, 0, '斜向上经过 B', { at: p.totalTime, kind: 'velocity' })
  },
})

function orbitState(t, p) {
  const tc = Math.min(Math.max(t, 0), p.totalTime)
  const k = Math.min(Math.floor(tc / p.cycleTime), p.nCycles - 1)
  const u = tc - k * p.cycleTime
  const a = p.arad
  const sa = Math.sin(a)
  const ca = Math.cos(a)
  const base = k * p.cycleShift
  const entryX = base + ca / sa
  const exitX = entryX - 2 * p.sigma * p.rho * sa
  const bottomX = exitX + ca / sa

  if (u < p.flightTime) {
    return { x: base + u * ca, y: u * sa, theta: a, field: false }
  }
  if (u < p.topExit) {
    const theta = a + p.sigma * (u - p.flightTime) / p.rho
    return {
      x: entryX + p.sigma * p.rho * (Math.sin(theta) - sa),
      y: 1 + p.sigma * p.rho * (ca - Math.cos(theta)),
      theta,
      field: true,
    }
  }
  if (u < p.bottomEntry) {
    const dt = u - p.topExit
    return { x: exitX + dt * ca, y: 1 - dt * sa, theta: -a, field: false }
  }
  if (u < p.cycleTime) {
    const theta = -a + p.sigma * (u - p.bottomEntry) / p.rho
    return {
      x: bottomX + p.sigma * p.rho * (Math.sin(theta) + sa),
      y: p.sigma * p.rho * (ca - Math.cos(theta)),
      theta,
      field: true,
    }
  }
  return {
    x: base + p.cycleShift,
    y: 0,
    theta: a,
    field: false,
  }
}
</Sim>

虚线为完整轨迹，蓝线为已走过的轨迹。走完一段圆弧后，墨色箭头画出这段圆弧的弦（即位移）：上、下两段弦等长反向，正好抵消，所以一轮下来粒子只靠两段直线向右平移。**箭头长度不按物理量比例**，位置以 $d$ 为单位绘制。

<ForceDiagram
  title="当前受力：洛伦兹力垂直于速度"
  surface={{type: "none"}}
  body={{shape: "particle", charge: "+", label: "+q"}}
  forces={[
    {label: "F_B = qv₀B₀", angle: "thetaNow+sigma*90", magnitude: "inField"}
  ]}
/>

<Readout items={[
  {label: "A、B 距离 AB/d", expr: "ABbar", digits: 4},
  {label: "本情形每轮位移 / d", expr: "cycleShift", digits: 4},
  {label: "到 B 所需轮数", expr: "nCycles", digits: 0},
  {label: "当前时间 tv₀/d", expr: "t", digits: 3},
  {label: "30° 到达时间 t₃₀v₀/d", expr: "T30bar", digits: 4},
  {label: "60° 到达时间 t₆₀v₀/d", expr: "T60bar", digits: 4},
  {label: "时间比 t₃₀/t₆₀", expr: "timeRatio", digits: 4}
]} />

<Plot
  title="速度分量：磁场改变方向，不改变速率"
  x={{name: "t", label: "tv₀/d", min: 0, max: "totalTime"}}
  y={{label: "速度分量 / v₀", min: -1.1, max: 1.1}}
  series={[
    {label: "vₓ/v₀", expr: "cos((t%cycleTime) < flightTime ? arad : ((t%cycleTime) < topExit ? arad+sigma*((t%cycleTime)-flightTime)/rho : ((t%cycleTime) < bottomEntry ? -arad : -arad+sigma*((t%cycleTime)-bottomEntry)/rho)))", color: "velocity"},
    {label: "vᵧ/v₀", expr: "sin((t%cycleTime) < flightTime ? arad : ((t%cycleTime) < topExit ? arad+sigma*((t%cycleTime)-flightTime)/rho : ((t%cycleTime) < bottomEntry ? -arad : -arad+sigma*((t%cycleTime)-bottomEntry)/rho)))", color: "velocity", dash: true}
  ]}
  marks={[
    {x: "flightTime", label: "进入上方磁场"},
    {x: "topExit", label: "离开上方磁场"},
    {x: "bottomEntry", label: "进入下方磁场"},
    {x: "totalTime", label: "斜向上到达 B"}
  ]}
  cursor="t"
/>

## 四、结合图像理解关键时刻

1. **首次进入 $L_1$ 上方磁场**：速度方向连续，洛伦兹力出现，直线接上圆弧。正电荷向速度的左侧偏转，负电荷向右侧偏转。

2. **离开上方磁场**：速度变为斜向右下。正电荷走大圆弧，负电荷走小圆弧，所以此时的横坐标不同。

3. **进入下方磁场**：粒子继续转向。两段圆弧的水平位移大小相等、方向相反；只比较上方圆弧，无法判断是否经过 B。

4. **再次斜向上穿出 $L_2$**：速度方向恢复。一轮的水平位移完全由两段直线决定，而磁场内的总时间等于一个回旋周期。

5. **改为 $60^\circ$**：每轮位移仅为原来的 $1/3$，第三輪才到 B。总计穿越无磁场区六次，在磁场中累计转过 $6\pi$。

拖动 $\rho$ 可以看到：B 的位置保持不变，时间比发生变化。直线段的速度分量在图上是水平线；圆弧段的速度分量连续变化，始终满足

$$
\left(\frac{v_x}{v_0}\right)^2+
\left(\frac{v_y}{v_0}\right)^2=1.
$$

## 五、答案汇总

| 问题 | 答案 |
|---|---|
| （1）A、B 距离 | $\boxed{AB=2\sqrt3d}$ |
| （2）负电荷能否经过 B | $\boxed{\text{能}}$；一轮后必以斜向上方向经过 B |
| （3）$30^\circ$ 到达时间 | $\boxed{t_{30}=4d/v_0+2\pi m/(qB_0)}$ |
| （3）$60^\circ$ 到达时间 | $\boxed{t_{60}=4\sqrt3d/v_0+6\pi m/(qB_0)}$ |
| 两种出射的时间比 | $\boxed{t_{30}:t_{60}=(4+2\pi\rho):(4\sqrt3+6\pi\rho)}$，其中 $\rho=mv_0/(qB_0d)$ |

代表性演示初值 $\rho=1$ 下：

$$
\boxed{\frac{AB}{d}\approx3.4641},\qquad
\boxed{\frac{t_{30}v_0}{d}\approx10.2832},\qquad
\boxed{\frac{t_{60}v_0}{d}\approx25.7778},\qquad
\boxed{\frac{t_{30}}{t_{60}}\approx0.3989}.
$$
