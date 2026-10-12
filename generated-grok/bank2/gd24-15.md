---
id: gd24-15
title: 金属板间的带电粒子
source: 2024 广东卷 第 15 题（计算）
question: "如图甲所示。两块平行正对的金属板水平放置，板间加上如图乙所示幅值为 U_0、周期为 t_0 的交变电压。金属板左侧存在一水平向右的恒定匀强电场，右侧分布着垂直纸面向外的匀强磁场。磁感应强度大小为 B。一带电粒子在 t = 0 时刻从左侧电场某处由静止释放，在 t = t_0 时刻从下板左端边缘位置水平向右进入金属板间的电场内，在 t = 2t_0 时刻第一次离开金属板间的电场、水平向右进入磁场，并在 t = 3t_0 时刻从下板右端边缘位置再次水平进入金属板间的电场。已知金属板的板长是板间距离的 π/3 倍，粒子质量为 m。忽略粒子所受的重力和场的边缘效应。（1）判断带电粒子的电性并求其所带的电荷量 q；（2）求金属板的板间距离 D 和带电粒子在 t = t_0 时刻的速度大小 v；（3）求从 t = 0 时刻开始到带电粒子最终碰到上金属板的过程中，电场力对粒子做的功 W。"
answers:
  - { name: q, value: 0.06283, unit: C }
  - { name: D, value: 0.1535, unit: m }
  - { name: v, value: 1607, unit: m/s }
  - { name: W, value: 3.386, unit: J }
---

题目只给字母。下面取一组代表性数值：质量 $m = 1\times 10^{-6}\ \mathrm{kg}$，磁感应强度 $B = 0.5\ \mathrm{T}$，交变电压幅值 $U_0 = 100\ \mathrm{V}$，周期 $t_0 = 1\times 10^{-4}\ \mathrm{s}$。由这些数算出的 $q$、$D$、$v$、$W$ 仍满足题目给的比例，与字母答案对应。

交变电压按图乙的方波取值：每个半周期换一次符号，$t = 0$ 到 $t_0/2$ 为 $-U_0$。电压正值表示上板电势高。左侧电场始终水平向右，右侧磁场始终垂直纸面向外。

## 题目条件分析

过程分四段，重力和边缘效应都忽略。

- $0 \le t \le t_0$：粒子在板左侧的恒定电场里由静止加速，轨迹水平。$t = t_0$ 时刚好到达下板左端，速度水平向右，记为 $v$。
- $t_0 \le t \le 2t_0$：进入板间。前半个周期电压为 $-U_0$，轨迹向上弯；后半个周期电压为 $+U_0$，弯回来。$t = 2t_0$ 时第一次离开板间，速度又变成水平向右，仍为 $v$，高度是 $D/3$。
- $2t_0 \le t \le 3t_0$：在向外的磁场里做圆周运动。轨迹向下弯，经过半个周期后从下板右端水平返回。
- $t > 3t_0$：再次进入板间。电压为 $+U_0$，粒子向上弯，在 $4t_0$ 到达板的左端、高度 $2D/3$。随后在左侧电场里减速到零再折回，于 $6.5t_0$ 在板间碰到上板。

板长 $L = \pi D/3$。左侧电场的场强由「$t_0$ 内加速到 $v$」定出，并且只覆盖到下板左端，不会与板间电场重叠。

## 完整解答

### （1）电性与电荷量

$t = 2t_0$ 时粒子以速度 $v$ 水平向右进入垂直纸面向外的磁场，轨迹向下弯。由左手定则，正电荷在向外的磁场里顺时针偏转，所以粒子带正电。

从 $t = 2t_0$ 到 $t = 3t_0$ 刚好走过半圆，所以半个周期等于 $t_0$：

$$
\frac{T}{2} = t_0, \qquad T = \frac{2\pi m}{qB}
$$

$$
\boxed{\text{带正电}}, \qquad q = \frac{\pi m}{B t_0}
$$

代入代表性数值，$q = 6.28\times 10^{-2}\ \mathrm{C}$。

### （2）板间距离与进入速度

板间场强大小 $E = U_0/D$，垂直加速度大小 $a = qU_0/(mD)$。

水平方向没有力，速度始终为 $v$，板长就是这一段的位移：

$$
L = v t_0 = \frac{\pi D}{3}
$$

垂直方向分两半。$t_0$ 到 $1.5t_0$ 电压为 $-U_0$，正电荷向上加速，起点速度为零，上升

$$
y_1 = \frac{1}{2}a\left(\frac{t_0}{2}\right)^2 = \frac{a t_0^2}{8}
$$

$1.5t_0$ 到 $2t_0$ 电压改为 $+U_0$，加速度改为向下。这一段垂直速度从最大减到零，高度不再变化。到 $t = 2t_0$ 时速度水平向右，高度停在 $y_1$。

离开板间后在磁场里走半圆，圆心比离开点低一个半径 $R = D/3$。半圆结束时高度为零，才能从下板右端水平返回，所以

$$
y_1 = R = \frac{D}{3} \implies \frac{a t_0^2}{8} = \frac{D}{3}
$$

把 $a = qU_0/(mD)$ 和第（1）问的 $q$ 代入：

$$
\frac{q U_0 t_0^2}{8mD} = \frac{D}{3} \implies D^2 = \frac{3\pi U_0 t_0}{8B}
$$

$$
\boxed{D = \sqrt{\dfrac{3\pi U_0 t_0}{8B}}}, \qquad \boxed{v = \dfrac{\pi D}{3t_0}}
$$

代入代表性数值，$D = 0.153\ \mathrm{m}$，$v = 1.61\times 10^{3}\ \mathrm{m/s}$。板长 $L = v t_0 = 0.161\ \mathrm{m}$，确实是板间距离的 $\pi/3$ 倍。

磁场里的轨道半径由同一组数自动算出：

$$
R = \frac{mv}{qB} = \frac{D}{3} = 0.0512\ \mathrm{m}
$$

半圆的弦长是 $2R = 2D/3$，小于板长，所以粒子确实从下板右端返回，而不是从板的右方绕回去。

### （3）电场力做功

磁场力不做功。电场力做的功等于动能的增量，也等于各段电场力与位移的点积之和。

左侧电场的场强要让静止的粒子在 $t_0$ 内加速到 $v$：

$$
E_\text{左} = \frac{mv}{qt_0} = \frac{BD}{3t_0}
$$

这一段位移 $s = vt_0/2 = L/2$，做功

$$
W_1 = q E_\text{左}\, s = \frac{1}{2}mv^2
$$

板间第一次穿过时，前半个周期上升 $D/3$，电场力做功 $qU_0/3$；后半个周期电场反向，垂直速度减到零，高度不变，做功为零。磁场力不做功。

$t = 3t_0$ 后电压为 $+U_0$，粒子从下板右端向左返回并向上弯，到 $4t_0$ 时在板的左端、高度 $2D/3$，速度水平向左，大小仍是 $v$。这一段上升 $2D/3$，做功 $2qU_0/3$。

接着粒子进入左侧电场，被向右的电场减速。$5t_0$ 时速度减到零，位置在下板左端左侧 $L/2$ 处，然后折回加速。$6t_0$ 时回到板的左端，速度又是 $v$，高度仍是 $2D/3$。来回的位移相消，左侧电场这一段做功为零。

$6t_0$ 到 $6.5t_0$ 电压为 $-U_0$，电场向下，但粒子带着向上的速度 $v_y = v$ 进入。这一段上升 $D/3$，电场力做功 $-qU_0/3$，正好在 $6.5t_0$ 碰到上板。

四段相加：

$$
W = \frac{1}{2}mv^2 + \frac{1}{3}qU_0 + \frac{2}{3}qU_0 - \frac{1}{3}qU_0
$$

$$
\boxed{W = \dfrac{1}{2}mv^{2} + \dfrac{1}{3}qU_{0}}
$$

代入代表性数值，$W = 3.39\ \mathrm{J}$。碰板时水平速度为零、垂直速度为 $v$，动能 $\tfrac{1}{2}mv^2 + qU_0/3$ 与上式一致。

## 交互演示

拖动时间，或点进度条上的关键时刻。板间和左侧的运动按解析解画，磁场里的半圆由运动积分算出，两者在板的右端接上。板长、进入速度和左侧场强由上面的约束自动保持。两板之间的短线表示上下接线端相连，不按比例。

<Param name="t" label="时间" value={0} min={0} max={0.0007} step={0.000001} unit="s" hidden />

<Param name="m" label="质量 m" value={0.000001} min={0.0000005} max={0.000002} step={0.0000001} unit="kg" />

<Param name="B" label="磁感应强度 B" symbol="B" color="field" value={0.5} min={0.2} max={1} step={0.05} unit="T" />

<Param name="U0" label="电压幅值 U_0" symbol="U_0" color="field" value={100} min={40} max={200} step={10} unit="V" />

<Param name="t0" label="周期 t_0" symbol="t_0" value={0.0001} min={0.00005} max={0.0002} step={0.00001} unit="s" />

<Define name="q" expr="pi*m/(B*t0)" />

<Define name="D" expr="sqrt(3*pi*U0*t0/(8*B))" />

<Define name="L" expr="pi*D/3" />

<Define name="v" expr="L/t0" />

<Define name="R" expr="m*v/(q*B)" />

<Define name="Eleft" expr="m*v/(q*t0)" />

<Define name="x0" expr="-v*t0/2" />

<Define name="W" expr="0.5*m*v^2 + q*U0/3" />

<Define name="W1" expr="0.5*m*v^2" />

<Define name="W2" expr="q*U0/3" />

<Define name="aPlate" expr="q*U0/(m*D)" />

<Define name="tHit" expr="6.5*t0" />

<Question text="（1）判断电性并求电荷量 q" set={{t: "2.5*t0"}} hint="看 t = 2.5 t_0：进入向外的磁场后轨迹向下弯，正电荷才会这样偏转。" />

<Question text="（2）求板间距离 D 和 t = t_0 的速度 v" set={{t: "2*t0"}} hint="看 t = 2 t_0：刚好水平离开上板右端，板长等于 v t_0。" />

<Question text="（3）求碰到上板前电场力做的功 W" set={{t: "tHit"}} hint="碰板时刻比较动能：水平速度为零，垂直速度为 v，多出来的 qU_0/3 是板间电场的净功。" />

<Preset label="刚进入板间" set={{t: "t0"}} />

<Preset label="第一次离开板间" set={{t: "2*t0"}} />

<Preset label="从下板右端返回" set={{t: "3*t0"}} />

<Preset label="碰到上板" set={{t: "tHit"}} />

<Status cases={[
  {when: "t < t0 - 1e-12", label: "左侧电场加速", tone: "info"},
  {when: "t < 2*t0 - 1e-12", label: "板间第一次穿过", tone: "info"},
  {when: "t < 3*t0 - 1e-12", label: "磁场中做圆周运动", tone: "info"},
  {when: "t < tHit - 1e-12", label: "返回板间，向上偏转", tone: "warning"},
  {label: "已碰到上板", tone: "danger"}
]} />

<Readout items={[
  {label: "电荷量", symbol: "q", color: "charge", expr: "q", unit: "C", format: "sci"},
  {label: "板间距离", symbol: "D", expr: "D", unit: "m", digits: 4},
  {label: "t_0 时刻的速度", symbol: "v", color: "velocity", expr: "v", unit: "m/s", format: "sci"},
  {label: "磁场轨道半径", symbol: "R", expr: "R", unit: "m", digits: 4}
]} />

<Answer items={[
  {label: "电性", text: "带正电"},
  {label: "电荷量", symbol: "q", expr: "q", value: 0.06283, unit: "C", digits: 4},
  {label: "板间距离", symbol: "D", expr: "D", value: 0.1535, unit: "m"},
  {label: "t_0 时刻的速度", symbol: "v", expr: "v", value: 1607, unit: "m/s"},
  {label: "电场力做功", symbol: "W", expr: "W", value: 3.386, unit: "J"}
]} />

<Sim title="粒子穿过电场和磁场" height={420} duration="tHit" time="t" playSeconds={14}
  params={["D", "L", "R", "v", "t0", "aPlate", "q", "W", "U0"]}
  marks={[
    {t: 0, label: "由静止释放"},
    {t: "t0", label: "进入板间"},
    {t: "1.5*t0", label: "电压换号"},
    {t: "2*t0", label: "进入磁场"},
    {t: "3*t0", label: "从下板右端返回"},
    {t: "4*t0", label: "到达板的左端"},
    {t: "5*t0", label: "左侧折返"},
    {t: "tHit", label: "碰到上板"}
  ]}
  hud={[
    {symbol: "v", label: "速度", expr: "v", unit: "m/s", format: "sci"},
    {symbol: "W", label: "电场力做功", expr: "W", unit: "J", digits: 2}
  ]}
  legend={[{kind: "velocity", label: "轨迹"}, {kind: "field", label: "电场 / 磁场"}]}
  note="两板右端的短线表示接线端相连，不按比例。左侧电场只画到下板左端。"
>
sim({
  at(t, p) {
    const t0 = p.t0
    const v = p.v
    const a = p.aPlate
    const L = p.L
    const D = p.D
    const h = D / 3
    if (t <= t0) {
      const x = -v * t0 / 2 + (v / (2 * t0)) * t * t
      return { x, y: 0, vx: (v / t0) * t, vy: 0 }
    }
    if (t <= 2 * t0) {
      const u = t - t0
      const half = t0 / 2
      const up = Math.min(u, half)
      const down = Math.max(u - half, 0)
      const y = a * up * (u - up / 2) - 0.5 * a * down * down
      const vy = a * up - a * down
      return { x: v * u, y, vx: v, vy }
    }
    if (t <= 3 * t0) {
      const th = (Math.PI / t0) * (t - 2 * t0)
      return { x: L + p.R * Math.sin(th), y: h - p.R * (1 - Math.cos(th)), vx: v * Math.cos(th), vy: -v * Math.sin(th) }
    }
    if (t <= 4 * t0) {
      const u = t - 3 * t0
      return { x: L - v * u, y: a * (t0 / 2) * u - 0.5 * a * u * u, vx: -v, vy: a * (t0 / 2 - u) }
    }
    if (t <= 6 * t0) {
      const u = t - 4 * t0
      const back = Math.min(u, t0)
      const forth = Math.max(u - t0, 0)
      const x = -0.5 * (v / t0) * back * back + v * forth - 0.5 * (v / t0) * forth * forth
      const vx = -(v / t0) * back + (v / t0) * forth
      return { x, y: (2 * D) / 3, vx, vy: 0 }
    }
    const u = Math.min(t - 6 * t0, t0 / 2)
    return { x: v * u, y: (2 * D) / 3 + v * u - 0.5 * a * u * u, vx: v, vy: v - a * u }
  },
  draw(ctx, s, v) {
    const p = v.p
    const D = p.D
    const L = p.L
    const R = p.R
    const m = v.view({ xmin: -1.35 * L, xmax: L + 1.15 * R, ymin: -2.35 * R, ymax: 1.55 * D, pad: 28 })
    const up = ((v.t % p.t0) + p.t0) % p.t0 < p.t0 / 2
    for (let i = 0; i < 3; i++) {
      const x = -1.35 * L * (1 - (i + 0.5) / 3)
      v.arrow(m, x - 0.07 * L, 0, x + 0.07 * L, 0, { color: v.color.field })
    }
    for (let i = 0; i < 4; i++) {
      const x = (L * (i + 0.5)) / 4
      const y1 = up ? 0.28 * D : 0.72 * D
      const y2 = up ? 0.72 * D : 0.28 * D
      v.arrow(m, x, y1, x, y2, { color: v.color.field })
    }
    v.field(m, L, -2 * R, L + 2 * R, D, { dir: 'out', step: 64 })
    v.label(m, -0.3 * L, 0.5 * D, '左侧电场')
    v.label(m, L / 2, 1.18 * D, '板间电场')
    v.label(m, L + R, 1.18 * D, '磁场')
    v.plates(m, 0, L, D, 0, { signs: false })
    const lead = Math.min(0.012, 0.18 * D)
    v.line(m, L, D, L + lead, D, { color: v.color.ink, width: 1.5 })
    v.line(m, L, 0, L + lead, 0, { color: v.color.ink, width: 1.5 })
    v.circle(m, L + lead, D, 0.004, { fill: v.color.ink })
    v.circle(m, L + lead, 0, 0.004, { fill: v.color.ink })
    v.line(m, L + lead, D, L + lead, 0, { color: v.color.ink, width: 1.5 })
    v.trail(m, (st) => [st.x, st.y], { kind: 'velocity' })
    v.ball(m, s.x, s.y, 0.006, { charge: true, label: 'q' })
    const spd = Math.hypot(s.vx, s.vy) || 1
    v.vec(m, s.x, s.y, (s.vx / spd) * 0.05, (s.vy / spd) * 0.05, { kind: 'velocity', label: 'v', min: 16 })
    v.dim(m, 0, -1.7 * R, L, -1.7 * R, 'L = πD/3')
    v.dim(m, -0.16 * L, 0, -0.16 * L, D, 'D')
  },
})
</Sim>

<Plot title="板间电压" size="wide" caption="正值表示上板电势高，每半个周期换一次符号"
  x={{name: "tt", label: "t", unit: "s", min: 0, max: "tHit"}}
  y={{label: "u", unit: "V", min: "-1.4*U0", max: "1.4*U0"}}
  series={[{label: "u", expr: "U0*sign(t0/2 - mod(tt, t0))", color: "field"}]}
  marks={[
    {x: "t0", label: "进入板间"},
    {x: "2*t0", label: "进入磁场"},
    {x: "3*t0", label: "返回板间"},
    {x: "tHit", label: "碰到上板"}
  ]}
  cursor="t"
/>

<Plot title="分速度" size="narrow"
  x={{name: "tt", label: "t", unit: "s", min: 0, max: "tHit"}}
  y={{label: "速度", unit: "m/s"}}
  series={[
    {label: "v_x", expr: "tt < t0 ? v*tt/t0 : (tt < 2*t0 ? v : (tt < 3*t0 ? v*cos(pi*(tt - 2*t0)/t0) : (tt < 4*t0 ? -v : (tt < 5*t0 ? -v*(5*t0 - tt)/t0 : (tt < 6*t0 ? v*(tt - 5*t0)/t0 : (tt < tHit ? v : 0))))))", color: "velocity"},
    {label: "v_y", expr: "tt < t0 ? 0 : (tt < 1.5*t0 ? aPlate*(tt - t0) : (tt < 2*t0 ? aPlate*(2*t0 - tt) : (tt < 3*t0 ? -v*sin(pi*(tt - 2*t0)/t0) : (tt < 4*t0 ? aPlate*(3.5*t0 - tt) : (tt < 6*t0 ? 0 : (tt < tHit ? v - aPlate*(tt - 6*t0) : 0))))))", color: "accel", dash: true}
  ]}
  marks={[
    {x: "t0", label: "v_x 到达 v"},
    {x: "2*t0", label: "v_y 回到 0"},
    {x: "tHit", label: "碰板"}
  ]}
  cursor="t"
/>

## 结合图像理解关键时刻

- $t = t_0$：水平分速度第一次到达 $v$，粒子正好在下板左端。之后 $v_x$ 保持不变，直到进入磁场。
- $t = 1.5t_0$：电压由 $-U_0$ 跳到 $+U_0$。这一刻粒子在板间高度 $D/3$ 处，$v_y$ 最大。
- $t = 2t_0$：$v_y$ 回到零，粒子在高度 $D/3$ 处水平离开板的右端。
- $t = 2.5t_0$：在磁场里走到半圆最低点。速度大小仍是 $v$，方向改为水平向左。
- $t = 3t_0$：从下板右端水平向左返回，电压为 $+U_0$，轨迹向上弯。
- $t = 4t_0$：到达板的左端，高度 $2D/3$，随后在左侧电场里减速、折回。
- $t = 6.5t_0$：折回后上升 $D/3$，碰到上板。

## 答案汇总

（1）带正电，$\boxed{q = \dfrac{\pi m}{B t_0}}$。

（2）$\boxed{D = \sqrt{\dfrac{3\pi U_0 t_0}{8B}}}$，$\boxed{v = \dfrac{\pi D}{3t_0}}$。

（3）$\boxed{W = \dfrac{1}{2}mv^{2} + \dfrac{1}{3}qU_0}$。

代表性数值下：$q = 6.28\times 10^{-2}\ \mathrm{C}$，$D = 0.153\ \mathrm{m}$，$v = 1.61\times 10^{3}\ \mathrm{m/s}$，$W = 3.39\ \mathrm{J}$。
