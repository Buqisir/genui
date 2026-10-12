---
id: gz-board-wall
title: 板块与挡板
subject: physics
topic: 动量守恒与板块相对运动
source: 必修2 模块备考卷 16 题
breadcrumb: ["选择性必修 1", "动量守恒", "计算题"]
question: |
  质量 m₁=0.3 kg 的小车静止在光滑的水平面上，车长 L=1.5 m，距车的右端 d=1.0 m 处有一固定的竖直挡板 P。现有一个质量 m₂=0.2 kg 的可视为质点的物块，以水平向右的速度 v₀=2 m/s 从左端滑上小车，物块与小车上表面间的动摩擦因数 μ=0.2，g 取 10 m/s²。
  (1) 若从物块由左端滑上小车开始计时，求经过多长时间小车与挡板 P 相撞；
  (2) 若小车与挡板碰撞后以原速度大小反弹，最终小物块在小车上表面上某处与小车保持相对静止，求此处与车左端的距离 L'。
answers:
  - { name: tWall, value: 1.55, unit: s }
  - { name: Lprime, value: 0.984, unit: m }
  - { name: tSync, value: 0.6, unit: s }
  - { name: vSync, value: 0.8, unit: "m/s" }
  - { name: rFirst, value: 0.6, unit: m }
  - { name: rSecond, value: 0.384, unit: m }
  - { name: vFinal, value: -0.16, unit: "m/s" }
---

<Question text="从物块滑上小车开始计时，经过多长时间小车与挡板 P 相撞？" set={{t: "tWall"}} hint="先判断：物块和小车是先共速，还是小车先撞到挡板？" />

<Question text="碰后小车以原速率反弹，物块最终停在距车左端多远处？" set={{t: "tFinal"}} hint="看 v–t 图里两块阴影的面积。" />

<Param name="v0" label="初速度" symbol="v_0" color="velocity" value={2} min={1} max={2.6} step={0.05} unit="m/s" />

<Param name="mu" label="动摩擦因数" symbol="μ" value={0.2} min={0.12} max={0.4} step={0.01} />

<Param name="m1" label="小车质量" symbol="m_1" value={0.3} min={0.2} max={1} step={0.05} unit="kg" />

<Param name="d" label="车右端到挡板" symbol="d" value={1} min={0.4} max={1.6} step={0.05} unit="m" />

<Param name="m2" label="物块质量" value={0.2} hidden />

<Param name="L" label="车长" value={1.5} hidden />

<Param name="g" label="重力加速度" value={10} hidden />

<Param name="t" label="时间" value={0} min={0} max="tFinal + 0.5" hidden />

<Preset label="摩擦更小" set={{mu: 0.15}} />

<Preset label="小车更重" set={{m1: 0.6}} />

<Define name="fSlide" expr="mu*m2*g" />

<Define name="aCar" expr="fSlide/m1" />

<Define name="aBlock" expr="fSlide/m2" />

<Define name="aRel" expr="aCar + aBlock" />

<Define name="tSync" expr="v0/aRel" />

<Define name="vSync" expr="aCar*tSync" />

<Define name="xCarSync" expr="aCar*tSync^2/2" />

<Define name="xBlockSync" expr="v0*tSync - aBlock*tSync^2/2" />

<Define name="rFirst" expr="xBlockSync - xCarSync" />

<Define name="tWall" expr="tSync + (d - xCarSync)/vSync" />

<Define name="wallX" expr="L + d" />

<Define name="xBlockWall" expr="d + rFirst" />

<Define name="tAfter" expr="2*vSync/aRel" />

<Define name="rSecond" expr="(2*vSync)^2/(2*aRel)" />

<Define name="Lprime" expr="rFirst + rSecond" />

<Define name="vFinal" expr="(m2 - m1)*vSync/(m1 + m2)" />

<Define name="tFinal" expr="tWall + tAfter" />

<Define name="xCarFinal" expr="d - vSync*tAfter + aCar*tAfter^2/2" />

<Define name="xBlockFinal" expr="xBlockWall + vSync*tAfter - aBlock*tAfter^2/2" />

<Define name="vCar" expr="t < tSync ? aCar*t : (t < tWall ? vSync : (t < tFinal ? -vSync + aCar*(t - tWall) : vFinal))" />

<Define name="vBlock" expr="t < tSync ? v0 - aBlock*t : (t < tWall ? vSync : (t < tFinal ? vSync - aBlock*(t - tWall) : vFinal))" />

<Define name="rel" expr="t < tSync ? v0*t - aRel*t^2/2 : (t < tWall ? rFirst : (t < tFinal ? rFirst + 2*vSync*(t - tWall) - aRel*(t - tWall)^2/2 : Lprime))" />

<Define name="E0" expr="m2*v0^2/2" />

<Define name="Ek" expr="m1*vCar^2/2 + m2*vBlock^2/2" />

<Define name="Q" expr="fSlide*rel" />

<Status cases={[
  {when: "xCarSync > d", label: "小车会先撞挡板再共速，超出本演示的情形", tone: "danger"},
  {when: "Lprime > L", label: "物块会从小车右端滑出，超出本演示的情形", tone: "danger"},
  {when: "t < tSync", label: "第一次滑动：物块减速，小车加速", tone: "info"},
  {when: "t < tWall", label: "共速，一起向右匀速", tone: "neutral"},
  {when: "t < tFinal", label: "反弹后第二次滑动", tone: "warning"},
  {label: "再次共速，一起向左匀速", tone: "success"}
]} />

<Readout items={[
  {label: "物块", symbol: "v", color: "velocity", expr: "vBlock", unit: "m/s"},
  {label: "小车", symbol: "v", color: "velocity", expr: "vCar", unit: "m/s"},
  {label: "相对滑动", symbol: "Δx", expr: "rel", unit: "m"}
]} />

<Answer items={[
  {label: "(1) 相撞时刻", symbol: "t", expr: "tWall", value: 1.55, unit: "s"},
  {label: "(2) 距车左端", symbol: "L′", expr: "Lprime", value: 0.984, unit: "m", digits: 3}
]} />

<Sim
  height={340}
  duration="tFinal + 0.5"
  time="t"
  params={["L", "d", "v0", "aCar", "aBlock", "fSlide", "tSync", "vSync", "xCarSync", "xBlockSync", "tWall", "wallX", "xBlockWall", "tFinal", "xCarFinal", "xBlockFinal", "vFinal"]}
  marks={[
    {t: "tSync", label: "共速", color: "velocity"},
    {t: "tWall", label: "撞挡板", color: "force"},
    {t: "tFinal", label: "再次共速", color: "velocity"}
  ]}
  legend={[
    {kind: "velocity", symbol: "v", label: "速度"},
    {kind: "force", symbol: "F", label: "力"},
    {kind: "strobe", label: "频闪 0.15 s"}
  ]}
  note="水平方向按比例；物块和小车的高度不按比例。"
>
sim({
  at(t, p) {
    let xCar, xBlock, vCar, vBlock
    if (t < p.tSync) {
      xCar = 0.5 * p.aCar * t * t
      xBlock = p.v0 * t - 0.5 * p.aBlock * t * t
      vCar = p.aCar * t
      vBlock = p.v0 - p.aBlock * t
    } else if (t < p.tWall) {
      const dt = t - p.tSync
      xCar = p.xCarSync + p.vSync * dt
      xBlock = p.xBlockSync + p.vSync * dt
      vCar = vBlock = p.vSync
    } else if (t < p.tFinal) {
      const dt = t - p.tWall
      xCar = p.d - p.vSync * dt + 0.5 * p.aCar * dt * dt
      xBlock = p.xBlockWall + p.vSync * dt - 0.5 * p.aBlock * dt * dt
      vCar = -p.vSync + p.aCar * dt
      vBlock = p.vSync - p.aBlock * dt
    } else {
      const dt = t - p.tFinal
      xCar = p.xCarFinal + p.vFinal * dt
      xBlock = p.xBlockFinal + p.vFinal * dt
      vCar = vBlock = p.vFinal
    }
    const sliding = t < p.tSync || (t >= p.tWall && t < p.tFinal)
    return { xCar, xBlock, vCar, vBlock, sliding }
  },
  draw(ctx, s, v) {
    const p = v.p
    const m = v.view({ xmin: -0.35, xmax: p.wallX + 0.4, ymin: -0.95, ymax: 1.05, pad: 24 })
    const bw = 0.18
    const bh = 0.22
    const k = 0.32

    v.ground(m, -0.35, p.wallX, 0)
    v.wall(m, p.wallX, 0, 0.95, { side: 'right', label: 'P' })
    v.ruler(m, 0, p.wallX, -0.8, { step: 0.5, minor: 0.1, unit: 'm' })

    if (v.t > 0.05) {
      const g = v.cart(m, 0, 0, p.L, undefined, { ghost: true })
      v.block(m, bw / 2, g.top, bw, bh, { ghost: true })
      v.text(m, 0.01, g.top + bh + 0.1, 't = 0', { color: v.color.steel, size: 11, align: 'left' })
    }

    const c = v.cart(m, s.xCar, 0, p.L, undefined, { label: 'm_1' })
    const yBlock = c.top + bh / 2
    const yCar = (c.top + c.bottom) / 2
    v.strobe(m, (st) => [st.xBlock + bw / 2, yBlock], { every: 0.15, kind: 'velocity' })
    v.block(m, s.xBlock + bw / 2, c.top, bw, bh, { label: 'm_2' })

    if (Math.abs(s.vBlock) > 0.01) {
      const x0 = s.vBlock > 0 ? s.xBlock + bw : s.xBlock
      v.vec(m, x0, yBlock, k * s.vBlock, 0, { kind: 'velocity', label: 'v ' + Math.abs(s.vBlock).toFixed(2) })
    }
    if (Math.abs(s.vCar) > 0.01) {
      v.vec(m, s.xCar + p.L * 0.55, yCar, k * s.vCar, 0, { kind: 'velocity', label: 'v ' + Math.abs(s.vCar).toFixed(2) })
    }
    if (s.sliding) {
      v.vec(m, s.xBlock + bw / 2, c.top + 0.01, -0.5 * p.fSlide, 0, { kind: 'force', label: 'f' })
    }
    if (Math.abs(v.t - p.tWall) < 0.12) {
      v.vec(m, p.wallX, yCar, -0.32, 0, { kind: 'force', label: 'F' })
    }

    const rel = s.xBlock - s.xCar
    if (rel > 0.03) {
      const y = c.top + bh + 0.24
      v.dim(m, s.xCar, y, s.xBlock, y, 'Δx = ' + rel.toFixed(2) + ' m', { offset: 0 })
    }
    const gap = p.wallX - s.xCar - p.L
    if (gap > 0.03) v.dim(m, s.xCar + p.L, -0.42, p.wallX, -0.42, 'd = ' + gap.toFixed(2) + ' m', { offset: 0 })

    v.event(m, s.xBlock + bw / 2, c.top + bh, '共速', { at: p.tSync, kind: 'velocity' })
    v.event(m, p.wallX, yCar, '撞挡板', { at: p.tWall, kind: 'force' })
    v.event(m, s.xBlock + bw / 2, c.top + bh, '再次共速', { at: p.tFinal, kind: 'velocity' })
  },
})
</Sim>

<Plot
  title="v – t"
  caption="阴影面积 = 相对滑动距离"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "tFinal + 0.5"}}
  y={{label: "v", unit: "m/s"}}
  series={[
    {label: "物块", expr: "s < tSync ? v0 - aBlock*s : (s < tWall ? vSync : (s < tFinal ? vSync - aBlock*(s - tWall) : vFinal))", color: "velocity"},
    {label: "小车", expr: "s < tSync ? aCar*s : (s < tWall ? vSync : (s < tFinal ? -vSync + aCar*(s - tWall) : vFinal))", color: "velocity", dash: true}
  ]}
  areas={[
    {series: 0, to: 1, from: 0, until: "tSync", label: "Δx₁", color: "velocity"},
    {series: 0, to: 1, from: "tWall", until: "tFinal", label: "Δx₂", color: "velocity"}
  ]}
  marks={[
    {x: "tSync", series: 0, label: "共速"},
    {x: "tWall", series: 1, label: "反弹"},
    {x: "tFinal", series: 0, label: "再次共速"}
  ]}
  cursor="t"
  values={false}
/>

<Ledger
  title="能量账本"
  unit="J"
  parts={[
    {label: "动能", symbol: "E_k", expr: "Ek", color: "velocity"},
    {label: "摩擦生热", symbol: "Q", expr: "Q", color: "force"}
  ]}
  rows={[
    {label: "开始", note: "0 s", at: {t: 0}},
    {label: "此刻"},
    {label: "最终", note: "再次共速后", at: {t: "tFinal"}}
  ]}
  total={{label: "总", symbol: "E", expr: "E0"}}
/>

## 一、题目条件分析

取水平向右为正方向，以小车初始左端为位置原点。挡板在 $x=L+d=2.5\ \text{m}$ 处，**小车向右移动 $d=1.0\ \text{m}$ 时撞上挡板**。

地面光滑，物块与小车之间有滑动摩擦。物块相对车面向右滑动时，物块受摩擦力向左，小车受摩擦力向右。运动分四段：

1. 物块减速、小车加速，直到第一次共速。
2. 两者一起向右匀速，直到小车撞上挡板。
3. 小车反弹向左，物块仍向右，再次相对滑动。
4. 第二次共速，此后保持相对静止。

碰撞瞬间挡板只作用于小车：小车速度反向，物块速度不变。**碰撞过程系统受挡板冲量，不能对这一瞬间用系统动量守恒。**

## 二、完整解答

### （1）小车何时撞上挡板

摩擦力 $f=\mu m_2g=0.4\ \text{N}$，小车和物块的加速度大小

$$
a_1=\frac{f}{m_1}=\frac43\ \text{m/s}^2,\qquad a_2=\frac{f}{m_2}=2\ \text{m/s}^2.
$$

设 $t_1$ 时共速：$a_1t_1=v_0-a_2t_1$，

$$
t_1=\frac{v_0}{a_1+a_2}=\boxed{0.60\ \text{s}},\qquad v=a_1t_1=\boxed{0.80\ \text{m/s}}.
$$

这段时间小车位移 $x_1=\tfrac12a_1t_1^2=0.24\ \text{m}<d$，所以**先共速、后撞板**；物块相对小车滑动 $r_1=v_0t_1-\tfrac12(a_1+a_2)t_1^2=\boxed{0.60\ \text{m}}<L$，没有滑出。

之后一起匀速，小车还要走 $d-x_1=0.76\ \text{m}$：

$$
t_{\text{撞}}=t_1+\frac{d-x_1}{v}=0.60+\frac{0.76}{0.80}=\boxed{1.55\ \text{s}}.
$$

### （2）最终物块距车左端多远

碰后瞬间 $v_{\text{车}}=-0.80\ \text{m/s}$，$v_{\text{块}}=+0.80\ \text{m/s}$，相对速度 $u_0=1.60\ \text{m/s}$。物块仍相对小车向右滑，相对加速度大小 $a_1+a_2=\tfrac{10}{3}\ \text{m/s}^2$：

$$
\Delta t=\frac{u_0}{a_1+a_2}=\boxed{0.48\ \text{s}},\qquad r_2=\frac{u_0^2}{2(a_1+a_2)}=\boxed{0.384\ \text{m}}.
$$

$$
L'=r_1+r_2=0.60+0.384=\boxed{0.984\ \text{m}}.
$$

检查能否保持：对反弹后的滑动过程用动量守恒，

$$
(m_1+m_2)v_f=m_1(-v)+m_2v\ \Rightarrow\ v_f=\frac{m_2-m_1}{m_1+m_2}v=\boxed{-0.16\ \text{m/s}}.
$$

共同速度向左，两者一起远离挡板，不会再撞；$L'<L$，物块留在车上。

> **看图理解**：v–t 图里两条线之间的面积就是物块相对小车的滑动距离。两块阴影 $\Delta x_1=0.60\ \text{m}$、$\Delta x_2=0.384\ \text{m}$ 相加就是 $L'$。碰撞让小车速度突变，但位置连续，所以相对位置在碰撞前后不变。能量账本里，摩擦生热 $Q=f\cdot L'$ 正好等于动能的减少量。
