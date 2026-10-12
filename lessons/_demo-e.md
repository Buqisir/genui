---
title: 受力图作用点、传送带滑痕、失重浮力与翻倒
source: 内部演示（2020·一12、2022·一11、2019·二18、2020·二10）
demo: true
answers:
  - { name: sMark, value: 1 }
  - { name: heat, value: 2 }
---

水平传送带上，物块由静止被带到带速。加速度是 μg，追上带速的时间是 v₀/(μg)，滑痕长度是 v₀²/(2μg)，摩擦生热是 ½mv₀²。初始值 v₀ = 2 m/s、μ = 0.2、m = 1 kg，所以滑痕 1 m、热 2 J，和积分结果对得上。2019 年二15 的传送带是逆时针转的，物块从右侧进来时带面速度与物块相反，同一套 `belt` 用负的带速即可。

<Define name="g" expr="10" />
<Define name="m" expr="1" />
<Define name="k" expr="20" />
<Define name="rho" expr="1000" />

<Param name="v0" label="带速 v₀" symbol="v_0" min={0.5} max={4} step={0.1} value={2} unit="m/s" color="velocity" />
<Param name="mu" label="动摩擦因数 μ" symbol="μ" min={0.05} max={0.6} step={0.05} value={0.2} />
<Param name="tk" label="读取时刻" min={0} max={3} step={0.1} value={2} unit="s" hidden />

<Define name="sFormula" expr="v0*v0/(2*mu*g)" />
<Define name="qFormula" expr="0.5*m*v0*v0" />

<Motion name="belt" mass="m" along={0} until={3}
  state={{x: 0, v: 0}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g"},
    {label: "N", angle: 90, solve: "N"},
    {label: "f", solve: "f", friction: {mu: "mu", static: "mu", normal: "N", belt: "v0"}}
  ]}
  read={{sMark: "slide @ tEnd", heat: "Q @ tEnd"}} />

<Readout items={[
  {label: "滑痕（积分）", expr: "sMark", unit: "m", digits: 3},
  {label: "滑痕 v₀²/(2μg)", expr: "sFormula", unit: "m", digits: 3},
  {label: "摩擦生热", expr: "heat", unit: "J", digits: 3},
  {label: "½mv₀²", expr: "qFormula", unit: "J", digits: 3}
]} />

<Sim title="物块被带到带速，滑痕只在相对滑动时变长" height={260} duration="belt.tEnd" params={["belt", "v0"]}>
sim({
  at(t, p) {
    const b = p.belt
    // xEnd: where the block is at the end, so the belt and view are long enough for any v0, μ.
    return { x: b.x(t), v: b.v(t), slide: b.slide(t), xEnd: b.x(1e9) }
  },
  draw(ctx, s, v) {
    const len = Math.max(3.4, s.xEnd + 0.6)
    const m = v.view({ xmin: -0.5, xmax: len, ymin: -0.45, ymax: 0.7, pad: 24 })
    v.conveyor(m, -0.3, 0, len + 0.1, { speed: v.p.v0 })
    v.block(m, s.x, 0, 0.28, 0.18)
    v.dim(m, 0, -0.22, Math.max(s.slide, 0.02), -0.22, s.slide.toFixed(2) + ' m')
    if (Math.abs(s.v) > 0.05) v.vec(m, s.x, 0.28, s.v * 0.1, 0, { kind: 'velocity', label: 'v' })
  },
})
</Sim>

## 歼-20：虚线速度不参与受力

升力垂直于速度，阻力与速度相反，推力沿喷口。虚线 v 只标方向。

<Param name="phi" label="速度方向" symbol="φ" min={15} max={70} step={1} value={40} unit="°" color="velocity" />

<ForceDiagram
  title="速度用虚线，升力 ⊥ v，阻力与 v 相反"
  body={{shape: "particle"}}
  guides={[{label: "v", angle: "phi"}]}
  forces={[
    {label: "G", angle: -90, magnitude: 10},
    {label: "F_1", angle: "phi", magnitude: 12},
    {label: "F_2", angle: "phi + 90", magnitude: 8},
    {label: "F_f", angle: "phi + 180", magnitude: 4}
  ]}
/>

## 哑铃：三个作用点

挡板弹力在左端，重力在质心，磁力沿轴画在右端。`at` 以半长为单位。

<ForceDiagram
  title="哑铃 P"
  body={{shape: "rod", angle: 35}}
  forces={[
    {label: "G_P", angle: -90, magnitude: 6, at: [0, 0]},
    {label: "N", angle: 0, magnitude: 8, at: [-1, 0]},
    {label: "F", angle: 35, magnitude: 5, at: [1, 0]}
  ]}
/>

## 吊篮剪断：谁相对杯底动

A 是铁球，弹簧被压短；B 是木球，弹簧被拉长；C 是木球，细线拉住。剪断后容器自由下落，`aFrame = g`，浮力和重力在杯里一起消失，弹簧力还在。所以 A 向上、B 向下回到原长，C 不动。这是 2019 年二18 的 D。

<Param name="cut" label="吊绳" options={[{value: 0, label: "还挂着"}, {value: 1, label: "已剪断"}]} value={0} />

<Define name="mI" expr="0.4" />
<Define name="mB" expr="0.1" />
<Define name="VI" expr="0.0002" />
<Define name="VB" expr="0.0003" />

<Motion name="iron" mass="mI" along={90} aFrame="cut*g" until={0.4}
  state={{x: -0.1, v: 0}}
  forces={[
    {label: "G", angle: -90, magnitude: "mI*g"},
    {label: "Fb", angle: 90, buoyancy: {rho: "rho", V: "VI"}, solve: "FbI"},
    {label: "Fs", angle: 90, magnitude: "-k*x"}
  ]} />

<Motion name="wood" mass="mB" along={90} aFrame="cut*g" until={0.4}
  state={{x: 0.1, v: 0}}
  forces={[
    {label: "G", angle: -90, magnitude: "mB*g"},
    {label: "Fb", angle: 90, buoyancy: {rho: "rho", V: "VB"}, solve: "FbB"},
    {label: "Fs", angle: 90, magnitude: "-k*x"}
  ]} />

<Motion name="cork" mass="mB" along={90} aFrame="cut*g" until={0.4}
  state={{x: 0.14, v: 0}}
  forces={[
    {label: "G", angle: -90, magnitude: "mB*g"},
    {label: "Fb", angle: 90, buoyancy: {rho: "rho", V: "VB"}, solve: "FbC"},
    {label: "T", angle: -90, magnitude: "(1-cut)*(rho*VB - mB)*g"}
  ]} />

<Define name="aIron" expr="iron.acc(0)" />
<Define name="aWood" expr="wood.acc(0)" />
<Define name="aCork" expr="cork.acc(0)" />

<Status cases={[
  {when: "cut < 0.5", label: "吊绳还在：三球相对杯底都不动", tone: "success"},
  {label: "剪断瞬间：A 向上，B 向下，C 不动", tone: "warning"}
]} />

<Readout items={[
  {label: "A 的加速度（向上为正）", expr: "aIron", unit: "m/s²", digits: 2},
  {label: "B 的加速度", expr: "aWood", unit: "m/s²", digits: 2},
  {label: "C 的加速度", expr: "aCork", unit: "m/s²", digits: 2}
]} />

<Sim title="杯里的三球（x 从弹簧原长量起，向上为正）" height={300} duration={0.15} params={["iron", "wood", "cork", "cut"]}>
sim({
  at(t, p) {
    return { yA: 0.16 + p.iron.x(t), yB: 0.16 + p.wood.x(t), yC: 0.16 + p.cork.x(t) }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -0.35, xmax: 0.55, ymin: -0.05, ymax: 0.6, equal: true, pad: 20 })
    v.line(m, -0.28, 0, 0.42, 0, { color: v.color.ink, width: 2 })
    v.line(m, -0.28, 0, -0.28, 0.52, { color: v.color.ink, width: 2 })
    v.line(m, 0.42, 0, 0.42, 0.52, { color: v.color.ink, width: 2 })
    v.line(m, -0.26, 0.46, 0.4, 0.46, { color: v.color.field, dash: true })
    v.spring(m, -0.12, 0.02, -0.12, s.yA, { coils: 7 })
    v.spring(m, 0.12, 0.02, 0.12, s.yB, { coils: 7 })
    v.rope(m, [[0.3, 0.02], [0.3, s.yC]])
    v.ball(m, -0.12, s.yA, 0.035, { label: 'A' })
    v.ball(m, 0.12, s.yB, 0.035, { label: 'B' })
    v.ball(m, 0.3, s.yC, 0.035, { label: 'C' })
  },
})
</Sim>

<Preset label="吊绳还在" set={{cut: 0}} />
<Preset label="剪断吊绳" set={{cut: 1}} />

## 急刹车：哪只箱子翻

车头向右。刹车时车子的加速度向左，所以 `tip` 里写 `a: "-aBus"`（向右为正）。竖放的 a：b = 0.15 m，h = 0.45 m，减速超过 g b/h ≈ 3.3 m/s² 就绕前轮翻。平放的 b：b/h = 2，μ 更小，只会滑，不会翻。

<Param name="aBus" label="刹车加速度" symbol="a" min={0} max={8} step={0.1} value={4} unit="m/s²" color="accel" />
<Param name="muBus" label="箱与车厢 μ" min={0.2} max={0.8} step={0.05} value={0.5} />

<Motion name="upright" mass={2} along={0} until={1}
  state={{x: 0, v: 0}}
  tip={{halfWidth: 0.15, comHeight: 0.45, mu: "muBus", a: "-aBus"}}
  forces={[
    {label: "G", angle: -90, magnitude: "2*g"},
    {label: "Nu", angle: 90, solve: "Nu"}
  ]} />

<Motion name="flat" mass={2} along={0} until={1}
  state={{x: 0, v: 0}}
  tip={{halfWidth: 0.4, comHeight: 0.2, mu: "muBus", a: "-aBus"}}
  forces={[
    {label: "G", angle: -90, magnitude: "2*g"},
    {label: "Nb", angle: 90, solve: "Nb"}
  ]} />

<Status cases={[
  {when: "upright.tips(0) > 0.5 and flat.slides(0) > 0.5", label: "竖着的 a 绕后轮翻倒，平放的 b 只滑动", tone: "danger"},
  {when: "upright.tips(0) > 0.5", label: "竖着的 a 绕后轮翻倒，b 还不动", tone: "warning"},
  {when: "upright.slides(0) > 0.5 or flat.slides(0) > 0.5", label: "还没翻，但已经相对车厢滑动", tone: "warning"},
  {label: "减速还小，两只都相对车子不动", tone: "success"}
]} />

<Figure title="支持力移到边缘，质心在箱子上" height={280} params={["upright", "flat", "aBus"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.3, xmax: 2.6, ymin: -0.35, ymax: 1.05, pad: 22 })
    v.ground(m, -0.2, 2.5, 0)
    v.block(m, 0.5, 0, 0.3, 0.7)
    v.block(m, 1.7, 0, 0.8, 0.28)
    v.com(m, 0.5, 0.45, { label: false })
    v.com(m, 1.7, 0.2, { label: false })
    v.label(m, 0.5, 0.82, 'a')
    v.label(m, 1.7, 0.42, 'b')
    const nA = 0.5 + p.upright.nAt(0)
    const nB = 1.7 + p.flat.nAt(0)
    v.vec(m, nA, 0, 0, 0.16, { kind: 'force', label: 'N_a' })
    v.vec(m, nB, 0, 0, 0.16, { kind: 'force', label: 'N_b' })
    if (p.aBus > 0.2) v.vec(m, 1.1, 0.85, -p.aBus * 0.06, 0, { kind: 'accel', label: 'a' })
  },
})
</Figure>
