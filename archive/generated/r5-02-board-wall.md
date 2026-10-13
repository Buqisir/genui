---
id: r5-02-board-wall
title: 板块与挡板：两次相对滑动
subject: physics
topic: 动量守恒与板块相对运动
source: 必修2 模块备考卷 16 题（15 分）
question: |
  质量 m₁=0.3 kg 的小车静止在光滑的水平面上，车长 L=1.5 m，距车的右端 d=1.0 m 处有一固定的竖直挡板 P。现有一个质量 m₂=0.2 kg 的可视为质点的物块，以水平向右的速度 v₀=2 m/s 从左端滑上小车，物块与小车上表面间的动摩擦因数 μ=0.2，g 取 10 m/s²。
  (1) 若从物块由左端滑上小车开始计时，求经过多长时间小车与挡板 P 相撞；
  (2) 若小车与挡板碰撞后以原速度大小反弹，最终小物块在小车上表面上某处与小车保持相对静止，求此处与车左端的距离 L'。
answers:
  - { name: tWall, value: 1.55, unit: s }
  - { name: Lprime, value: 0.984, unit: m }
  - { name: fSlide, value: 0.4, unit: N }
  - { name: aCar, value: 1.3333333333333333, unit: "m/s²" }
  - { name: aBlock, value: 2, unit: "m/s²" }
  - { name: tSync, value: 0.6, unit: s }
  - { name: vSync, value: 0.8, unit: "m/s" }
  - { name: xCarSync, value: 0.24, unit: m }
  - { name: rFirst, value: 0.6, unit: m }
  - { name: tAfter, value: 0.48, unit: s }
  - { name: rSecond, value: 0.384, unit: m }
  - { name: vFinal, value: -0.16, unit: "m/s" }
  - { name: tFinal, value: 2.03, unit: s }
---

## 一、题目条件分析

取水平向右为正方向，以小车初始左端为位置原点。小车初始右端位于 $x=L$，挡板固定在 $x=L+d=2.5\ \text{m}$ 处。因此，**小车向右移动 $d=1.0\ \text{m}$ 时撞上挡板**。

地面光滑，物块与小车之间存在滑动摩擦。物块相对车面向右滑动时，物块所受摩擦力向左，小车所受摩擦力向右。

运动需要分为四段：

1. 物块向右减速，小车向右加速，直到第一次速度相等。
2. 两者一起向右匀速运动，直到小车撞上挡板。
3. 小车反弹后向左运动，物块仍向右运动，再次发生相对滑动。
4. 两者第二次速度相等，此后保持相对静止。

碰撞按瞬时过程处理：挡板直接作用于小车，小车速度反向；物块在这一瞬间速度不变。**碰撞过程中，物块与小车组成的系统受到挡板的外力冲量，不能对这一过程使用系统动量守恒。**

## 二、完整解答

### （1）小车何时撞上挡板？

相对滑动时，摩擦力大小为

$$
f=\mu m_2g=0.2\times0.2\times10
=\boxed{0.4\ \text{N}}.
$$

小车向右的加速度与物块向左的加速度大小分别为

$$
a_1=\frac{f}{m_1}
=\boxed{\frac43\ \text{m/s}^2},
\qquad
a_2=\frac{f}{m_2}
=\boxed{2\ \text{m/s}^2}.
$$

设第一次速度相等发生在 $t_1$：

$$
a_1t_1=v_0-a_2t_1,
$$

$$
t_1=\frac{v_0}{a_1+a_2}
=\frac{2}{\frac43+2}
=\boxed{0.60\ \text{s}}.
$$

此时两者的共同速度为

$$
v=a_1t_1
=\frac43\times0.60
=\boxed{0.80\ \text{m/s}}.
$$

小车的位移为

$$
x_1=\frac12a_1t_1^2
=\frac12\times\frac43\times0.60^2
=\boxed{0.24\ \text{m}}.
$$

物块相对小车的位移为

$$
r_1=v_0t_1-\frac12(a_1+a_2)t_1^2
=2\times0.60-\frac12\times\frac{10}{3}\times0.60^2
=\boxed{0.60\ \text{m}}.
$$

因为 $r_1<L$，物块没有滑出小车；又因为 $x_1<d$，两者达到共同速度时，小车还没有撞上挡板。

之后两者以 $v=0.80\ \text{m/s}$ 一起匀速运动。小车还需要移动 $d-x_1=0.76\ \text{m}$，所以从开始计时到碰撞的总时间为

$$
t_{\text{撞}}
=t_1+\frac{d-x_1}{v}
=0.60+\frac{1.0-0.24}{0.80}
=\boxed{1.55\ \text{s}}.
$$

### （2）最终物块距车左端多远？

碰撞前，两者速度均为 $+0.80\ \text{m/s}$。碰撞后瞬间：

$$
v_{\text{车}}=-0.80\ \text{m/s},
\qquad
v_{\text{块}}=+0.80\ \text{m/s}.
$$

因此，物块相对小车的初速度为

$$
u_0=v_{\text{块}}-v_{\text{车}}
=0.80-(-0.80)=1.60\ \text{m/s}.
$$

物块仍相对小车向右滑动，摩擦力方向与第一次滑动时相同：物块向左加速，小车向右加速。相对速度减小的加速度大小为

$$
a_{\text{相对}}=a_1+a_2=\frac{10}{3}\ \text{m/s}^2.
$$

从反弹到第二次速度相等所需的时间为

$$
\Delta t=\frac{u_0}{a_1+a_2}
=\frac{1.60}{10/3}
=\boxed{0.48\ \text{s}}.
$$

这段时间内，物块相对小车继续向右滑动的距离为

$$
r_2=\frac{u_0^2}{2(a_1+a_2)}
=\frac{1.60^2}{2\times10/3}
=\boxed{0.384\ \text{m}}.
$$

碰撞前物块已经距车左端 $r_1=0.60\ \text{m}$，碰撞瞬间位置不变。因此最终距离为

$$
L'=r_1+r_2
=0.60+0.384
=\boxed{0.984\ \text{m}}.
$$

还要检查这一最终状态是否能持续。第二次速度相等时，

$$
v_f=-v+a_1\Delta t
=-0.80+\frac43\times0.48
=\boxed{-0.16\ \text{m/s}}.
$$

也可以对**反弹后的滑动过程**使用动量守恒：

$$
(m_1+m_2)v_f=m_1(-v)+m_2v,
$$

$$
v_f=\frac{m_2-m_1}{m_1+m_2}v=-0.16\ \text{m/s}.
$$

共同速度向左，所以两者一起远离挡板，不会再次碰撞。相对位置从 $0.60\ \text{m}$ 增至 $0.984\ \text{m}$，始终小于车长 $1.5\ \text{m}$，物块始终留在车上。

达到最终相对静止状态的总时间为

$$
t_f=t_{\text{撞}}+\Delta t
=1.55+0.48
=\boxed{2.03\ \text{s}}.
$$

> **关键判断**：反弹后，摩擦力取决于物块相对小车的滑动方向。小车虽然向左运动，却受到向右的摩擦力；本题中它逐渐减速，但在第二次共速前没有停下或转向。

## 三、交互演示

拖动时间滑块或播放动画，观察小车反弹时的速度突变，以及物块相对车面连续增加的位移。点击答案按钮可直接跳到对应状态。

<Param name="m1" label="小车质量" value={0.3} min={0.1} max={1} step={0.1} unit="kg" hidden={true} />

<Param name="m2" label="物块质量" value={0.2} min={0.1} max={1} step={0.1} unit="kg" hidden={true} />

<Param name="L" label="车长" value={1.5} min={1} max={3} step={0.1} unit="m" hidden={true} />

<Param name="d" label="初始车板间距" value={1} min={0.5} max={2} step={0.1} unit="m" hidden={true} />

<Param name="v0" label="物块初速度" value={2} min={1} max={3} step={0.1} unit="m/s" hidden={true} />

<Param name="mu" label="动摩擦因数" value={0.2} min={0.1} max={0.5} step={0.05} hidden={true} />

<Param name="g" label="重力加速度" value={10} min={9} max={10} step={0.1} unit="m/s²" hidden={true} />

<Param name="t" label="从物块滑上小车起的时间" value={0} min={0} max={3} step={0.01} unit="s" />

<Define name="fSlide" expr="mu*m2*g" />

<Define name="aCar" expr="fSlide/m1" />

<Define name="aBlock" expr="fSlide/m2" />

<Define name="aRelative" expr="aCar+aBlock" />

<Define name="tSync" expr="v0/aRelative" />

<Define name="vSync" expr="aCar*tSync" />

<Define name="xCarSync" expr="aCar*tSync^2/2" />

<Define name="xBlockSync" expr="v0*tSync-aBlock*tSync^2/2" />

<Define name="rFirst" expr="xBlockSync-xCarSync" />

<Define name="tWall" expr="tSync+(d-xCarSync)/vSync" />

<Define name="wallX" expr="L+d" />

<Define name="xBlockWall" expr="d+rFirst" />

<Define name="tAfter" expr="2*vSync/aRelative" />

<Define name="rSecond" expr="(2*vSync)^2/(2*aRelative)" />

<Define name="Lprime" expr="rFirst+rSecond" />

<Define name="vFinal" expr="(m2-m1)*vSync/(m1+m2)" />

<Define name="tFinal" expr="tWall+tAfter" />

<Define name="xCarFinal" expr="d-vSync*tAfter+aCar*tAfter^2/2" />

<Define name="xBlockFinal" expr="xBlockWall+vSync*tAfter-aBlock*tAfter^2/2" />

<Define name="xCar" expr="t < tSync ? aCar*t^2/2 : (t < tWall ? xCarSync+vSync*(t-tSync) : (t < tFinal ? d-vSync*(t-tWall)+aCar*(t-tWall)^2/2 : xCarFinal+vFinal*(t-tFinal)))" />

<Define name="xBlock" expr="t < tSync ? v0*t-aBlock*t^2/2 : (t < tWall ? xBlockSync+vSync*(t-tSync) : (t < tFinal ? xBlockWall+vSync*(t-tWall)-aBlock*(t-tWall)^2/2 : xBlockFinal+vFinal*(t-tFinal)))" />

<Define name="vCar" expr="t < tSync ? aCar*t : (t < tWall ? vSync : (t < tFinal ? -vSync+aCar*(t-tWall) : vFinal))" />

<Define name="vBlock" expr="t < tSync ? v0-aBlock*t : (t < tWall ? vSync : (t < tFinal ? vSync-aBlock*(t-tWall) : vFinal))" />

<Define name="relativePosition" expr="xBlock-xCar" />

<Define name="relativeVelocity" expr="vBlock-vCar" />

<Define name="wallGap" expr="wallX-xCar-L" />

<Define name="frictionNow" expr="(t < tSync or (t >= tWall and t < tFinal)) ? fSlide : 0" />

<Status cases={[
  {when: "abs(t-tWall) < 1e-6", label: "碰撞后瞬间：小车反弹，物块速度不变", tone: "warning"},
  {when: "t < tSync", label: "第一次滑动：物块减速，小车加速", tone: "info"},
  {when: "t < tWall", label: "第一次共速：一起向右匀速运动", tone: "neutral"},
  {when: "t < tFinal", label: "第二次滑动：物块相对小车向右滑动", tone: "info"},
  {label: "最终共速：一起向左运动，相对位置不变", tone: "success"}
]} />

<Preset label="初始状态" set={{t: 0}} />

<Preset label="第一次共速：0.60 s" set={{t: "tSync"}} />

<Preset label="第（1）问答案：1.55 s 碰撞" set={{t: "tWall"}} />

<Preset label="第（2）问答案：L′ = 0.984 m" set={{t: "tFinal"}} />

<Sim
  title="一次反弹，两次相对滑动"
  height={340}
  duration="tFinal+0.5"
  time="t"
  params={["L", "d", "v0", "aCar", "aBlock", "fSlide", "tSync", "vSync", "xCarSync", "xBlockSync", "tWall", "wallX", "xBlockWall", "tFinal", "xCarFinal", "xBlockFinal", "vFinal"]}
  marks={[
    {t: 0, label: "物块滑上小车"},
    {t: "tSync", label: "第一次共速", color: "velocity"},
    {t: "tWall", label: "小车撞板并反弹", color: "force"},
    {t: "tFinal", label: "最终相对静止", color: "velocity"}
  ]}
  legend={[
    {kind: "velocity", symbol: "v", label: "速度"},
    {kind: "force", symbol: "F", label: "力"},
    {kind: "strobe", label: "物块频闪 0.15 s"}
  ]}
  note="水平方向按比例；物块和小车的高度不按比例。虚线是 t = 0 时的位置。"
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
    if (v.t >= p.tWall && v.t - p.tWall < 0.15) {
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
    v.event(m, p.wallX, yCar, '撞挡板', { at: p.tWall, kind: 'force', place: 'above-left', offset: 52 })
    v.event(m, s.xBlock + bw / 2, c.top + bh, '再次共速', { at: p.tFinal, kind: 'velocity' })
  },
})
</Sim>

频闪点记录物块每 0.15 s 的位置：第一次滑动时点距逐渐变小（减速），共速后均匀，碰撞后物块继续向右减速，小车先向左再被摩擦力拉慢。

<Readout items={[
  {label: "时间", expr: "t", unit: "s", digits: 2},
  {label: "小车速度（向右为正）", expr: "vCar", unit: "m/s", digits: 3},
  {label: "物块速度（向右为正）", expr: "vBlock", unit: "m/s", digits: 3},
  {label: "物块相对小车的速度", expr: "relativeVelocity", unit: "m/s", digits: 3},
  {label: "物块距车左端", expr: "relativePosition", unit: "m", digits: 3},
  {label: "小车右端距挡板", expr: "wallGap", unit: "m", digits: 3}
]} />

<ForceDiagram
  title="物块受力：相对向右滑动时，摩擦力向左"
  surface={{type: "ground"}}
  body={{shape: "block", label: "m₂"}}
  forces={[
    {label: "m₂g", angle: -90, magnitude: "m2*g", showValue: true, unit: "N", digits: 2},
    {label: "F_N", angle: 90, magnitude: "m2*g", showValue: true, unit: "N", digits: 2},
    {label: "f", angle: 180, magnitude: "frictionNow", showValue: true, unit: "N", digits: 2}
  ]}
/>

受力图中的水平支撑面代表小车上表面。共速阶段不需要水平力维持匀速运动，所以摩擦力为零；挡板碰撞的冲量作用于小车。

<Plot
  title="速度—时间图：小车速度在碰撞时突变"
  x={{name: "t", label: "t", unit: "s", min: 0, max: "tFinal+0.5"}}
  y={{label: "v（向右为正）", unit: "m/s", min: -1, max: 2.2}}
  series={[
    {label: "小车", expr: "t < tSync ? aCar*t : (t < tWall ? vSync : (t < tFinal ? -vSync+aCar*(t-tWall) : vFinal))", color: "ink"},
    {label: "物块", expr: "t < tSync ? v0-aBlock*t : (t < tWall ? vSync : (t < tFinal ? vSync-aBlock*(t-tWall) : vFinal))", color: "velocity"}
  ]}
  marks={[
    {x: "tSync", series: 0, label: "第一次共速"},
    {x: "tWall", series: 0, label: "小车反弹至 −0.80 m/s"},
    {x: "tFinal", series: 0, label: "第二次共速：−0.16 m/s"}
  ]}
  cursor="t"
/>

<Plot
  title="相对位置—时间图：最终平台高度就是 L′"
  x={{name: "t", label: "t", unit: "s", min: 0, max: "tFinal+0.5"}}
  y={{label: "物块距车左端", unit: "m", min: 0, max: 1.6}}
  series={[
    {label: "物块的相对位置", expr: "t < tSync ? v0*t-aRelative*t^2/2 : (t < tWall ? rFirst : (t < tFinal ? rFirst+2*vSync*(t-tWall)-aRelative*(t-tWall)^2/2 : Lprime))", color: "ink"},
    {label: "车右端位置", expr: "L", color: "steel", dash: true}
  ]}
  marks={[
    {x: "tSync", series: 0, label: "第一次滑动结束：0.600 m"},
    {x: "tWall", series: 0, label: "位置连续，重新开始滑动"},
    {x: "tFinal", series: 0, label: "最终位置：0.984 m"}
  ]}
  cursor="t"
/>

## 四、结合图像理解关键时刻

| 时刻 | 速度图像中的变化 | 物块距车左端 |
|---|---|---|
| $0$ | 小车静止，物块速度为 $2\ \text{m/s}$ | $0$ |
| $0.60\ \text{s}$ | 两条速度线第一次相交，共同速度为 $+0.80\ \text{m/s}$ | $0.600\ \text{m}$ |
| $1.55\ \text{s}$ | 小车速度由 $+0.80$ 突变为 $-0.80\ \text{m/s}$，物块速度连续 | $0.600\ \text{m}$ |
| $2.03\ \text{s}$ | 两条速度线第二次相交，共同速度为 $-0.16\ \text{m/s}$ | $0.984\ \text{m}$ |

速度图中，物块曲线始终不低于小车曲线。两条速度曲线之间的面积，就是物块相对小车向右移动的距离：

- 第一次滑动对应三角形面积：$\frac12\times0.60\times2=0.600\ \text{m}$。
- 共速到碰撞前，两条线重合，没有新增相对位移。
- 第二次滑动对应三角形面积：$\frac12\times0.48\times1.60=0.384\ \text{m}$。

因此，两块三角形面积之和就是 $L'=0.984\ \text{m}$。碰撞可以使速度突然改变，但不会使位置突然改变，所以相对位置图在碰撞时连续。

最终相对位置曲线形成平台，并且低于代表车右端的 $1.5\ \text{m}$ 水平线，说明物块留在车上并保持相对静止。

## 五、答案汇总

| 问题 | 答案 |
|---|---|
| （1）从物块滑上小车到小车撞上挡板的时间 | $\boxed{1.55\ \text{s}}$ |
| （2）最终物块距车左端的距离 | $\boxed{L'=0.984\ \text{m}}$ |

最终物块与小车一起以 $0.16\ \text{m/s}$ 的速度向左匀速运动。
