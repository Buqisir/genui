---
id: gd25-08
title: 开瓶器拔出木塞
source: 2025 广东卷（部分试题）第 8 题（计算）
question: |
  用开瓶器拔出瓶中的木塞，初始时软木塞的上截面与玻璃瓶口平齐，木塞质量为 m，高为 h，过程中做匀加速直线运动，加速度为 a、过程中木塞受到的摩擦力为 f = f_0(1 − x/h)，其中 f_0 为参数，h 为木塞高，x 为木塞运动的距离。开瓶器齿轮的半径为 r，重力加速度为 g。

  【图】开瓶器剖面。最上方左右各露出一截斜向把手。把手下方左右两个齿轮啮合，左齿轮旁标“齿轮”。两齿轮之间下方是一根竖直弹簧，套在中轴上。弹簧下面是木塞，标“塞子”：木塞上部有一截颜色较浅，下部颜色较深，插在瓶口里。瓶身画成下方的矩形，瓶口左右有一圈外沿。木塞左上方、瓶口外沿与其上方一条短横线之间有一段竖直双向箭头，标 Δx。

  (1)求拔出时，齿轮的角速度 ω；

  (2)求初始到拔出，开瓶器对木塞做的功 W；

  (3)设经过时间为 t，求开瓶器的功率 P 与 t 的关系式。
answers:
  - { name: omega, value: 31.6227766, unit: rad/s }
  - { name: W, value: 0.052, unit: J }
  - { name: P, value: 0.12522, unit: W }
  - { name: tPull, value: 0.1264911, unit: s }
---

木塞从静止出发，以恒定加速度 $a$ 竖直向上运动，走过自身高度 $h$ 后完全离开瓶口。齿轮半径为 $r$，齿轮边缘的线速度就是木塞的速度。瓶壁对木塞的摩擦力随插入深度线性减小，$x = 0$ 时为 $f_0$，$x = h$ 时减为 $0$。弹簧只起传递作用，题目没有给弹簧劲度系数，不另列弹性势能。

题目只给字母。下面取一组能把木塞拔出的代表值：$m = 0.02\ \mathrm{kg}$，$h = 0.04\ \mathrm{m}$，$a = 5\ \mathrm{m/s^2}$，$f_0 = 2\ \mathrm{N}$，$r = 0.02\ \mathrm{m}$，$g = 10\ \mathrm{m/s^2}$。图中把手、齿轮和瓶身的大小不按比例。

<Param name="m" label="木塞质量 m" value={0.02} min={0.01} max={0.05} step={0.005} unit="kg" />

<Param name="h" label="木塞高 h" value={0.04} min={0.02} max={0.08} step={0.005} unit="m" />

<Param name="a" label="加速度 a" value={5} min={1} max={10} step={0.5} unit="m/s²" />

<Param name="f0" label="初始摩擦力 f_0" value={2} min={0.5} max={4} step={0.1} unit="N" />

<Param name="r" label="齿轮半径 r" value={0.02} min={0.01} max={0.04} step={0.005} unit="m" />

<Param name="g" value={10} hidden />

<Define name="tPull" expr="sqrt(2*h/a)" />

<Param name="t" label="时间 t" value={0.126} min={0} max="tPull" step={0.001} unit="s" />

<Motion name="cork" mass="m" along={90} until={0.5}
  state={{x: 0, v: 0}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g"},
    {label: "f", angle: -90, magnitude: "f0*(1 - x/h)"},
    {label: "F", angle: 90, magnitude: "m*g + f0*(1 - x/h) + m*a"}
  ]}
  events={[{name: "tOut", when: "x - h", dir: "up", stop: true}]}
  read={{
    omegaRun: "v/r @ tOut",
    Wrun: "(m*g + f0 + m*a)*x - f0*x^2/(2*h) @ tOut"
  }}
/>

<Define name="omega" expr="sqrt(2*a*h)/r" />

<Define name="W" expr="(m*g + f0 + m*a)*h - f0*h/2" />

<Define name="P" expr="(m*g + f0*(1 - a*t^2/(2*h)) + m*a)*a*t*a*t" />

## 完整解答

### (1) 拔出时齿轮的角速度

木塞做初速度为零的匀加速直线运动，拔出时 $x = h$：

$$
v^2 = 2ah \qquad v = \sqrt{2ah}
$$

齿轮与中轴啮合，边缘线速度等于木塞速度，故

$$
\boxed{\omega = \dfrac{v}{r} = \dfrac{\sqrt{2ah}}{r}}
$$

代表值下 $v = \sqrt{2\times 5\times 0.04} = \sqrt{0.4} \approx 0.632\ \mathrm{m/s}$，$\omega = 31.6\ \mathrm{rad/s}$。

### (2) 开瓶器对木塞做的功

取向上为正。摩擦力向下，大小 $f = f_0(1 - x/h)$。牛顿第二定律：

$$
F - mg - f = ma
$$

$$
F = mg + f_0\left(1 - \dfrac{x}{h}\right) + ma
$$

拔出过程 $F$ 始终向上，位移从 $0$ 到 $h$：

$$
W = \int_0^{h} F\,\mathrm{d}x = \int_0^{h}\left[mg + f_0\left(1 - \dfrac{x}{h}\right) + ma\right]\mathrm{d}x
$$

$$
\boxed{W = (mg + f_0 + ma)h - \dfrac{1}{2}f_0 h}
$$

代表值下 $W = (0.2 + 2 + 0.1)\times 0.04 - 2\times 0.04/2 = 0.052\ \mathrm{J}$。其中 $mgh$ 是重力势能的增加，$mah$ 是动能的增加，$\tfrac12 f_0 h$ 是克服摩擦力做的功。

### (3) 功率与时间的关系

由 $x = \tfrac12 at^2$、$v = at$，代入 $F$：

$$
P = Fv = \left[mg + f_0\left(1 - \dfrac{at^2}{2h}\right) + ma\right]at
$$

$$
\boxed{P = (mg + f_0 + ma)at - \dfrac{f_0 a^2}{2h}t^3}
$$

代表值下拔出用时 $t = \sqrt{2h/a} \approx 0.126\ \mathrm{s}$。时间滑块停在 $0.126\ \mathrm{s}$ 时功率 $P = 0.125\ \mathrm{W}$；正好拔出的瞬间 $v = \sqrt{2ah}$，$P = 0.126\ \mathrm{W}$。$t$ 只在木塞尚未离开瓶口的这一段里有意义。

<Question text="(1) 拔出时齿轮的角速度 ω" set={{t: "tOut"}} hint="木塞速度除以齿轮半径" />

<Question text="(2) 从开始到拔出，开瓶器做的功 W" set={{t: "tOut"}} hint="对变力 F 从 0 积分到 h" />

<Question text="(3) 经过时间 t 时的功率 P" set={{t: "tOut"}} hint="P = Fv，x 和 v 都用匀加速公式写成 t" />

<Preset label="拔出瞬间" set={{t: "tOut"}} />

<Preset label="刚开始" set={{t: 0}} />

<Status cases={[
  {when: "t < 1e-4", label: "木塞尚未移动", tone: "neutral"},
  {when: "tOut - t > 1e-4", label: "正在拔出", tone: "info"},
  {label: "已拔出", tone: "success"}
]} />

<Readout items={[
  {label: "上升距离", symbol: "x", expr: "0.5*a*t^2", unit: "m", digits: 4},
  {label: "速度", symbol: "v", expr: "a*t", unit: "m/s", digits: 3, color: "velocity"},
  {label: "摩擦力", symbol: "f", expr: "f0*(1 - a*t^2/(2*h))", unit: "N", digits: 3, color: "force"},
  {label: "开瓶器的力", symbol: "F", expr: "m*g + f0*(1 - a*t^2/(2*h)) + m*a", unit: "N", digits: 3, color: "accel"},
  {label: "齿轮角速度", symbol: "ω", expr: "a*t/r", unit: "rad/s", digits: 2},
  {label: "此刻功率", symbol: "P", expr: "P", unit: "W", digits: 3, color: "velocity"}
]} />

<Answer items={[
  {label: "拔出时角速度", symbol: "ω", expr: "omega", value: 31.62, unit: "rad/s", digits: 2},
  {label: "开瓶器做的功", symbol: "W", expr: "W", value: 0.052, unit: "J", digits: 3},
  {label: "拔出时的功率", symbol: "P", expr: "P", value: 0.125, unit: "W", digits: 3}
]} />

## 交互演示

拖动时间，木塞从瓶口被拔出。齿轮转过的角度按弧长 $x = r\theta$ 跟着木塞的位移走。力箭头画的是开瓶器对木塞的力 $F$、重力和瓶壁摩擦力；摩擦力随着木塞升出而变短。

<Sim title="拔出木塞" height={460} size="narrow" duration="tOut" time="t" params={["cork", "m", "h", "a", "f0", "r", "g", "t"]} playSeconds={6}
  hud={[
    {symbol: "ω", label: "齿轮角速度", expr: "a*t/r", unit: "rad/s", digits: 1},
    {symbol: "F", label: "开瓶器的力", expr: "m*g + f0*(1 - min(0.5*a*t*t, h)/h) + m*a", unit: "N", digits: 2},
    {symbol: "P", label: "功率", expr: "(m*g + f0*(1 - min(0.5*a*t*t, h)/h) + m*a)*a*t*a*t", unit: "W", digits: 2}
  ]}
  legend={[
    {kind: "accel", label: "开瓶器的力 F"},
    {kind: "force", label: "摩擦力 f"},
    {kind: "velocity", label: "速度 v"}
  ]}
  marks={[
    {t: 0, label: "开始"},
    {t: "tOut", label: "拔出"}
  ]}
  note="把手、齿轮和瓶身不按比例；木塞位移按实际的 h 画"
>
sim({
  at(t, p) {
    const s = p.cork.state(Math.min(t, p.cork.tEnd))
    return { x: s.x, v: s.v, th: s.x / p.r }
  },
  draw(ctx, s, v) {
    const H = 0.02
    const k = 0.55 / H
    const y = s.x * k
    const m = v.view({ xmin: -1.35, xmax: 1.85, ymin: -0.55, ymax: 2.85, equal: true })
    const neckW = 0.46
    const lip = 0.16
    const wall = 0.045
    const mouth = 0.55

    v.vessel(m, [
      { x1: -0.62, y1: -0.42, x2: 0.62, y2: mouth - 0.16 },
      { x1: -(neckW / 2 + wall), y1: mouth - 0.16, x2: neckW / 2 + wall, y2: mouth, open: 'top' }
    ], { wall: 2.2 })

    v.bar(m, -(neckW / 2 + lip), mouth, -neckW / 2, mouth, { thick: 5 })
    v.bar(m, neckW / 2, mouth, neckW / 2 + lip, mouth, { thick: 5 })

    const corkW = 0.34
    const corkH = H * k
    v.block(m, 0, y, corkW, corkH, { color: v.color.graphite })
    v.label(m, -0.62, y + corkH * 0.45, '塞子')
    v.block(m, 0, y + corkH, corkW * 0.72, corkH * 0.28, { color: v.color.steel, shadow: false })

    const springBot = y + corkH * 1.28
    const springTop = Math.max(springBot + 0.28, 1.55)
    v.spring(m, 0, springBot, 0, springTop, { coils: 7 })
    v.bar(m, 0, springTop, 0, 1.78, { thick: 4 })

    const gearR = 0.3
    const gearY = 2.05
    const teeth = 12
    const tooth = []
    for (let i = 0; i < teeth; i++) {
      const a0 = s.th + (i * 2 * Math.PI) / teeth
      const a1 = a0 + Math.PI / teeth
      tooth.push([Math.cos(a0) * gearR * 0.78, gearY + Math.sin(a0) * gearR * 0.78])
      tooth.push([Math.cos(a0 + 0.12) * gearR, gearY + Math.sin(a0 + 0.12) * gearR])
      tooth.push([Math.cos(a1 - 0.12) * gearR, gearY + Math.sin(a1 - 0.12) * gearR])
      tooth.push([Math.cos(a1) * gearR * 0.78, gearY + Math.sin(a1) * gearR * 0.78])
    }
    const toothR = tooth.map(([px, py]) => [-px, py])
    v.path(m, tooth, { close: true, fill: v.color.steel, color: v.color.ink, width: 1 })
    v.path(m, toothR, { close: true, fill: v.color.steel, color: v.color.ink, width: 1 })
    v.circle(m, -gearR, gearY, 0.07, { fill: v.color.graphite })
    v.circle(m, gearR, gearY, 0.07, { fill: v.color.graphite })
    v.bar(m, -gearR, gearY, -gearR + Math.sin(s.th) * 0.16, gearY + Math.cos(s.th) * 0.16, { thick: 3 })
    v.bar(m, gearR, gearY, gearR + Math.sin(-s.th) * 0.16, gearY + Math.cos(-s.th) * 0.16, { thick: 3 })

    v.bar(m, -gearR - 0.02, gearY + 0.02, -1.15, 2.55, { thick: 6 })
    v.bar(m, gearR + 0.02, gearY + 0.02, 1.15, 2.55, { thick: 6 })

    v.dim(m, -0.95, mouth, -0.95, mouth + y, 'Δx')
    v.label(m, -1.15, gearY, '齿轮')

    const F = v.p.m * v.p.g + v.p.f0 * (1 - Math.min(s.x, v.p.h) / v.p.h) + v.p.m * v.p.a
    const f = v.p.f0 * (1 - Math.min(s.x, v.p.h) / v.p.h)
    const scale = 0.55
    const cx = 0.72
    const cy = y + corkH * 0.5
    v.vec(m, cx, cy, 0, F * scale, { kind: 'accel', label: 'F' })
    v.vec(m, cx + 0.28, cy, 0, -v.p.m * v.p.g * scale, { kind: 'ink', label: 'mg' })
    if (f > 0.02) v.vec(m, cx + 0.52, cy, 0, -f * scale, { kind: 'force', label: 'f' })
    if (s.v > 1e-4) v.vec(m, -0.85, cy, 0, Math.min(s.v, 0.7) * 1.1, { kind: 'velocity', label: 'v' })
  },
})
</Sim>

## 结合图像

$F$ 随 $x$ 线性减小，曲线下的面积就是开瓶器做的功。$P$ 从零开始，先随速度增大而上升，后来又因为摩擦力减小使 $F$ 变小；游标停在拔出时刻。

<Plot title="开瓶器的力随位移" size="wide"
  x={{name: "x", label: "x", unit: "m", min: 0, max: "h"}}
  y={{label: "F", unit: "N", min: 0, max: "m*g + f0 + m*a + 0.15"}}
  series={[{label: "F", expr: "m*g + f0*(1 - x/h) + m*a", color: "accel"}]}
  areas={[{series: 0, from: 0, until: "h", label: "W"}]}
  cursor="xNow"
/>

<Define name="xNow" expr="0.5*a*t^2" />

<Plot title="功率随时间" size="wide"
  x={{name: "t", label: "t", unit: "s", min: 0, max: "tOut"}}
  y={{label: "P", unit: "W", min: 0}}
  series={[{label: "P", expr: "(m*g + f0*(1 - a*t^2/(2*h)) + m*a)*a*a*t*t", color: "velocity"}]}
  marks={[{x: "tOut", label: "拔出"}]}
  cursor="t"
/>

<Ledger title="做功的去向" unit="J" size="narrow"
  parts={[
    {label: "重力势能", symbol: "mgh", expr: "m*g*h", color: "ink"},
    {label: "动能", symbol: "E_k", expr: "m*a*h", color: "velocity"},
    {label: "克服摩擦", symbol: "W_f", expr: "0.5*f0*h", color: "force"}
  ]}
  total={{label: "开瓶器做功", symbol: "W", expr: "W"}}
/>

## 答案

$$
\omega = \dfrac{\sqrt{2ah}}{r}, \qquad W = (mg + f_0 + ma)h - \dfrac12 f_0 h, \qquad P = (mg + f_0 + ma)at - \dfrac{f_0 a^2}{2h}t^3
$$
