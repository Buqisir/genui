---
id: gd25-04
title: 冰坑内壁上的水平圆周运动
source: 2025 广东卷（部分试题）第 4 题（多选）
question: 可视为质点的小球，沿光滑的冰坑内壁滑出，使小球在水平面内做匀速圆周运动，如图所示。已知圆周运动的轨道半径 R = 0.4m，小球所在位置切面与水平面夹角 θ = 45°，小球质量为 m = 0.1kg，重力加速度取 g = 10m/s^2。关于小球，以下说法正确的是（ ）
choice: AC
answers:
  - { name: omega, value: 5, unit: rad/s }
  - { name: v, value: 2, unit: m/s }
  - { name: a, value: 10, unit: "m/s²" }
  - { name: N, value: 1.41421356237, unit: N }
---

小球沿光滑冰坑内壁滑到某一高度后，在该高度的水平面内做匀速圆周运动。轨道半径是水平圆的半径 $R$，不是冰坑曲面的曲率半径。小球所在位置的切面与水平面成角 $\theta$，所以冰面法线与竖直方向也成 $\theta$：支持力沿法线指向冰坑内侧，与竖直方向的夹角就是 $\theta$。

受力只有重力和支持力。竖直方向没有加速度，水平方向的合力提供向心力，指向圆心。

<Param name="R" label="轨道半径" symbol="R" value={0.4} min={0.2} max={0.8} step={0.05} unit="m" />

<Param name="theta" label="切面与水平面夹角" symbol="θ" value={45} min={20} max={70} step={1} unit="°" />

<Param name="m" label="小球质量" symbol="m" value={0.1} min={0.05} max={0.3} step={0.01} unit="kg" />

<Param name="g" value={10} hidden />

<Param name="view" label="看法" value={1} options={[{value: 1, label: "剖面"}, {value: 2, label: "俯视"}]} />

<Define name="N" expr="m*g/cos(deg(theta))" />

<Define name="a" expr="g*tan(deg(theta))" />

<Define name="v" expr="sqrt(a*R)" />

<Define name="omega" expr="v/R" />

<Define name="omegaA" expr="5" />

<Define name="vB" expr="4" />

<Define name="aC" expr="10" />

<Define name="ND" expr="1" />

## 完整解答

竖直方向：

$$
N\cos\theta = mg
$$

水平方向：

$$
m a = N\sin\theta
$$

两式相除得

$$
a = g\tan\theta = 10\times\tan 45^\circ = \boxed{10\,\mathrm{m/s^2}}
$$

支持力

$$
N = \frac{mg}{\cos\theta} = \frac{0.1\times 10}{\cos 45^\circ} = \sqrt{2}\,\mathrm{N} \approx \boxed{1.41\,\mathrm{N}}
$$

线速度由 $a = v^2/R$ 得

$$
v = \sqrt{aR} = \sqrt{10\times 0.4} = \boxed{2\,\mathrm{m/s}}
$$

角速度

$$
\omega = \frac{v}{R} = \frac{2}{0.4} = \boxed{5\,\mathrm{rad/s}}
$$

拖动 $\theta$ 时，四个量都跟着变：切面越陡，支持力的水平分力越大，向心加速度、线速度和角速度都增大。

**A. 角速度为 $5\,\mathrm{rad/s}$：正确。** $\omega = v/R = 2/0.4 = 5\,\mathrm{rad/s}$。

**B. 线速度大小为 $4\,\mathrm{m/s}$：错误。** $v = \sqrt{aR} = \sqrt{10\times 0.4} = 2\,\mathrm{m/s}$。若把 $a = v/R$ 错当成 $a = v^2/R$，就会得到 $4\,\mathrm{m/s}$。

**C. 向心加速度大小为 $10\,\mathrm{m/s^2}$：正确。** $a = g\tan\theta = 10\times\tan 45^\circ = 10\,\mathrm{m/s^2}$。切面倾角为 $45^\circ$ 时，支持力的水平分力与竖直分力相等，向心加速度刚好等于 $g$。

**D. 所受支持力大小为 $1\,\mathrm{N}$：错误。** $N = mg/\cos\theta = 1/\cos 45^\circ = \sqrt{2}\,\mathrm{N} \approx 1.41\,\mathrm{N}$。$1\,\mathrm{N}$ 只是重力 $mg$，不是支持力。

## 交互演示

剖面看切面与水平方向的夹角 $\theta$，俯视看水平圆。冰坑内壁用一段圆弧和右端竖直壁示意，曲率不按比例。点某一选项时，画面切到能看出该项对错的看法，侧栏读出由受力算出的四个量。

<Question text="A. 角速度为 5rad/s" set={{view: 2, theta: 45, R: 0.4}} hint="俯视：ω = v/R = 5 rad/s，与选项相同" />

<Question text="B. 线速度大小为 4m/s" set={{view: 2, theta: 45, R: 0.4}} hint="真实线速度是 2 m/s，不是 4 m/s" />

<Question text="C. 向心加速度大小为 10m/s²" set={{view: 1, theta: 45, R: 0.4}} hint="θ = 45° 时向心加速度等于 g" />

<Question text="D. 所受支持力大小为 1N" set={{view: 1, theta: 45, R: 0.4}} hint="支持力约 1.41 N，1 N 只是重力" />

<Preset label="题目原值" set={{R: 0.4, theta: 45, m: 0.1, view: 1}} />

<Status cases={[
  {when: "abs(theta - 45) < 1e-6", label: "切面 45°：向心加速度等于 g", tone: "success"},
  {when: "theta < 45", label: "切面更缓：向心加速度小于 g", tone: "info"},
  {label: "切面更陡：向心加速度大于 g", tone: "warning"}
]} />

<Readout items={[
  {label: "角速度", symbol: "ω", expr: "omega", unit: "rad/s", digits: 2, color: "velocity"},
  {label: "线速度", symbol: "v", expr: "v", unit: "m/s", digits: 2, color: "velocity"},
  {label: "向心加速度", symbol: "a", expr: "a", unit: "m/s²", digits: 2, color: "accel"},
  {label: "支持力", symbol: "N", expr: "N", unit: "N", digits: 2, color: "force"}
]} />

<Answer items={[
  {label: "答案", text: "AC"},
  {label: "角速度", symbol: "ω", expr: "omega", value: 5, unit: "rad/s", digits: 2},
  {label: "线速度", symbol: "v", expr: "v", value: 2, unit: "m/s", digits: 2},
  {label: "向心加速度", symbol: "a", expr: "a", value: 10, unit: "m/s²", digits: 2},
  {label: "支持力", symbol: "N", expr: "N", value: 1.41421356237, unit: "N", digits: 2}
]} />

<ForceDiagram title="小球受力" size="narrow"
  surface={{type: "incline", angle: "theta", angleLabel: "θ"}}
  body={{shape: "ball", label: "m"}}
  mass="m"
  accel={{angle: 180, magnitude: "a"}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g", showValue: true, unit: "N"},
    {label: "N", angle: "90 + theta", solve: "FN", showValue: true, unit: "N"}
  ]}
  guides={[{label: "切面", angle: "theta"}]}
  values="inline"
/>

<Figure title="冰坑与圆周运动" height={340} params={["R", "theta", "v", "a", "N", "omega", "view"]}>
figure({
  draw(ctx, p, v) {
    const th = (p.theta * Math.PI) / 180
    const rBall = 0.045
    if (p.view < 1.5) {
      const m = v.view({ xmin: -1.2, xmax: 1.55, ymin: -1.15, ymax: 0.85, equal: true })
      const R0 = 0.92
      const aL = 180 + p.theta
      const aR = 28
      const endA = (aR * Math.PI) / 180
      const ex = R0 * Math.cos(endA)
      const ey = R0 * Math.sin(endA)
      v.track(m, [
        { arc: [0, 0, R0, aL, aR], flip: true },
        { line: [ex, ey, ex, ey + 0.28], flip: true },
      ])
      const u = R0 * Math.cos(th)
      const y = -R0 * Math.sin(th)
      const nx = Math.cos(th)
      const ny = -Math.sin(th)
      const bx = u - rBall * nx
      const by = y - rBall * ny
      v.ball(m, bx, by, rBall)
      v.line(m, bx - rBall, by, bx - rBall - 0.42, by, { color: v.color.steel, dash: true })
      const tLen = Math.min(0.34, R0 * ((p.theta * Math.PI) / 180) * 0.55)
      v.line(m, bx, by, bx - tLen * Math.cos(th), by + tLen * Math.sin(th), { color: v.color.ink })
      v.ellipse(m, bx, by, 0.2, 0.2, { from: 180, to: 180 + p.theta, color: v.color.ink })
      v.label(m, bx - 0.32, by + 0.1, 'θ', { place: 'left' })
      v.vec(m, bx, by, 0.4, 0, { kind: 'velocity', label: 'v', place: 'above' })
      const sN = 0.22 + 0.16 * Math.min(p.N / 2.9, 1)
      v.vec(m, bx, by, -sN * nx, -sN * ny, { kind: 'force', label: 'N', place: 'below-left' })
      v.vec(m, bx, by, 0, -0.28, { kind: 'force', label: 'G', place: 'right' })
      v.line(m, 0, 0, bx, by, { color: v.color.steel, dash: true })
      v.line(m, bx, by, bx, by + 0.42, { color: v.color.steel, dash: true })
      v.label(m, (bx + 0) / 2, (by + 0) / 2 + 0.08, 'R', { place: 'above' })
      v.label(m, 0, 0, 'O', { place: 'above' })
    } else {
      const m = v.view({ xmin: -1.15, xmax: 1.35, ymin: -1.15, ymax: 1.15, equal: true })
      v.circle(m, 0, 0, p.R, { color: v.color.velocity, dash: true })
      const ang = 0.9
      const x = p.R * Math.cos(ang)
      const y = p.R * Math.sin(ang)
      v.ball(m, x, y, rBall)
      v.vec(m, x, y, -0.16 * p.v * Math.sin(ang), 0.16 * p.v * Math.cos(ang), { kind: 'velocity', label: 'v' })
      v.vec(m, x, y, -0.045 * p.a * Math.cos(ang), -0.045 * p.a * Math.sin(ang), { kind: 'accel', label: 'a' })
      v.dim(m, 0, 0, x, y, 'R')
      v.label(m, 0, 0, 'O')
    }
  },
})
</Figure>

剖面里，水平虚线与切面的夹角是 $\theta$，虚线 $R$ 从圆心水平连到小球。速度沿切线的水平投影画向右（圆周运动的切向），支持力垂直于切面、指向冰坑内侧，重力竖直向下。俯视里虚线圆是轨道，速度沿切线，向心加速度指向圆心。

## 结合图像理解

下图横轴是切面与水平面的夹角。A、B、C、D 四个选项给出的数值画成水平虚线。游标停在 $45^\circ$ 时，$\omega$ 落在 A 的 $5\,\mathrm{rad/s}$ 上，$a$ 落在 C 的 $10\,\mathrm{m/s^2}$ 上；$v$ 只有 $2\,\mathrm{m/s}$，低于 B 的 $4\,\mathrm{m/s}$；$N$ 约为 $1.41\,\mathrm{N}$，高于 D 的 $1\,\mathrm{N}$。

<Plot title="各量随切面倾角的变化" size="wide"
  x={{name: "th", label: "θ", unit: "°", min: 20, max: 70}}
  y={{label: "数值", min: 0, max: 16}}
  series={[
    {label: "ω", expr: "sqrt(g*tan(deg(th))*R)/R", color: "velocity"},
    {label: "v", expr: "sqrt(g*tan(deg(th))*R)", color: "velocity", dash: true},
    {label: "a", expr: "g*tan(deg(th))", color: "accel"},
    {label: "N", expr: "m*g/cos(deg(th))", color: "force"},
    {label: "A", expr: "omegaA", color: "steel", dash: true},
    {label: "B", expr: "vB", color: "steel", dash: true},
    {label: "C", expr: "aC", color: "steel", dash: true},
    {label: "D", expr: "ND", color: "steel", dash: true}
  ]}
  marks={[
    {x: 45, label: "题目 θ = 45°"}
  ]}
  cursor="theta"
/>

$\theta = 45^\circ$ 时，$\omega$ 曲线过 $5\,\mathrm{rad/s}$，$a$ 曲线过 $10\,\mathrm{m/s^2}$；$v$ 曲线只有 $2\,\mathrm{m/s}$，到不了选项 B 的 $4\,\mathrm{m/s}$；$N$ 曲线约为 $1.41\,\mathrm{N}$，高于选项 D 的 $1\,\mathrm{N}$。

## 答案汇总

选 **AC**。角速度为 $5\,\mathrm{rad/s}$，向心加速度为 $10\,\mathrm{m/s^2}$。线速度是 $2\,\mathrm{m/s}$ 而不是 $4\,\mathrm{m/s}$，支持力是 $\sqrt{2}\,\mathrm{N}$ 而不是 $1\,\mathrm{N}$。
