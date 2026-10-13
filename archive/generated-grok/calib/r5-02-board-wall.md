---
id: r5-02-board-wall
title: 小车撞挡板后物块停在何处
subject: physics
topic: 板块模型
source: 必修2 模块备考卷 16 题（15 分）
question: |
  质量 m₁=0.3 kg 的小车静止在光滑的水平面上，车长 L=1.5 m，距车的右端 d=1.0 m 处有一固定的竖直挡板 P。现有一个质量 m₂=0.2 kg 的可视为质点的物块，以水平向右的速度 v₀=2 m/s 从左端滑上小车，物块与小车上表面间的动摩擦因数 μ=0.2，g 取 10 m/s²。
  (1) 若从物块由左端滑上小车开始计时，求经过多长时间小车与挡板 P 相撞；
  (2) 若小车与挡板碰撞后以原速度大小反弹，最终小物块在小车上表面上某处与小车保持相对静止，求此处与车左端的距离 L'。
answers:
  - { name: tCollide, value: 1.55, unit: s }
  - { name: Lprime, value: 0.984, unit: m }
---

## 一、题目条件分析

- 地面光滑，小车不受地面摩擦力。物块与小车之间的滑动摩擦力 $f = \mu m_2 g = 0.4\ \text{N}$，作用在两者上，等大反向。
- 取向右为正。物块加速度大小 $a_2 = \mu g = 2\ \text{m/s}^2$，方向向左；小车加速度大小 $a_1 = f/m_1 = \dfrac{4}{3}\ \text{m/s}^2$，方向向右。
- 挡板 P 固定在小车右端右侧 $d = 1.0\ \text{m}$ 处。小车位移达到 $d$ 时，右端与挡板相撞。
- 碰撞只发生在小车与挡板之间：小车速度大小不变、方向反向；物块速度在这一瞬间保持不变。
- 题目只给动摩擦因数。两者速度一旦相同，维持相对静止所需的静摩擦力为零（水平方向没有其他外力），所以一定会一起运动。物块不会因为“没给静摩擦因数”而停不住。

## 二、完整解答

### （1）小车撞上挡板的时间

物块相对小车的初速度为 $v_0$，相对加速度大小为

$$
a_r = a_1 + a_2 = \frac{4}{3} + 2 = \frac{10}{3}\ \text{m/s}^2
$$

速度相等的时刻

$$
t_1 = \frac{v_0}{a_r} = \frac{2}{10/3} = 0.6\ \text{s}
$$

共同速度

$$
v = v_0 - a_2 t_1 = 2 - 2 \times 0.6 = 0.8\ \text{m/s}
$$

地面光滑，碰撞前水平方向动量守恒，可直接得到同一个结果：

$$
v = \frac{m_2 v_0}{m_1 + m_2} = \frac{0.2 \times 2}{0.5} = 0.8\ \text{m/s}
$$

这一段里小车的位移、物块在小车上滑过的距离：

$$
x_1 = \frac12 a_1 t_1^2 = \frac12 \times \frac{4}{3} \times 0.6^2 = 0.24\ \text{m}
$$

$$
s_1 = \frac{v_0^2}{2 a_r} = \frac{4}{2 \times 10/3} = 0.6\ \text{m}
$$

$x_1 = 0.24\ \text{m}$，小于 $d = 1.0\ \text{m}$，所以先共速，后撞挡板。$s_1 = 0.6\ \text{m}$，小于车长 $L = 1.5\ \text{m}$，物块仍在车上。

共速后摩擦力为零，两者以 $0.8\ \text{m/s}$ 一起匀速。剩下的距离

$$
d - x_1 = 0.76\ \text{m}, \qquad t_2 = \frac{0.76}{0.8} = 0.95\ \text{s}
$$

$$
t = t_1 + t_2 = 0.6 + 0.95 = \boxed{1.55\ \text{s}}
$$

### （2）再次相对静止处到左端的距离

碰撞后瞬间 $v_1 = -0.8\ \text{m/s}$，$v_2 = 0.8\ \text{m/s}$。物块相对小车向右的速度变为 $1.6\ \text{m/s}$，相对加速度大小仍是 $\dfrac{10}{3}\ \text{m/s}^2$。

再次共速的时间与这段相对位移：

$$
t_3 = \frac{1.6}{10/3} = 0.48\ \text{s}, \qquad s_2 = \frac{1.6 + 0}{2} \times 0.48 = 0.384\ \text{m}
$$

碰前物块已经停在距左端 $0.6\ \text{m}$ 处，碰后继续向车的右方滑过 $s_2$：

$$
L' = s_1 + s_2 = 0.6 + 0.384 = \boxed{0.984\ \text{m}}
$$

$L'$ 小于 $L$，物块还在小车上表面。

再次共速时的共同速度

$$
v' = \frac{m_2 \times 0.8 + m_1 \times (-0.8)}{m_1 + m_2} = -0.16\ \text{m/s}
$$

方向向左。小车速度从 $-0.8\ \text{m/s}$ 变到 $-0.16\ \text{m/s}$，始终向左离开挡板，不会第二次碰撞。此后一起向左匀速，相对位置不再变化。从滑上到再次共速，总时间是 $1.55 + 0.48 = 2.03\ \text{s}$。

能量核对：挡板碰撞不改变速率，动能不变。热量只来自两段相对滑动。

- 初动能 $E_0 = \dfrac12 m_2 v_0^2 = 0.4\ \text{J}$
- 碰前生热 $Q_1 = f s_1 = 0.4 \times 0.6 = 0.24\ \text{J}$，共速时动能 $0.16\ \text{J}$
- 碰后生热 $Q_2 = f s_2 = 0.4 \times 0.384 = 0.1536\ \text{J}$
- 末动能 $\dfrac12 (m_1 + m_2)(0.16)^2 = 0.0064\ \text{J}$
- $0.24 + 0.1536 + 0.0064 = 0.4\ \text{J}$，等于初动能

### 易错点

- 用 $d/v = 1/0.8 = 1.25\ \text{s}$ 当作撞板时间，漏掉加速阶段小车已经前进的 $0.24\ \text{m}$。
- 全程套用 $x = \dfrac12 a_1 t^2 = d$，得到约 $1.22\ \text{s}$。$0.6\ \text{s}$ 时已经共速，此后小车加速度为零，匀加速公式不能再用。
- 认为挡板把物块速度也反向。挡板的冲量只作用在小车上。
- 把 $L'$ 只写成碰后的 $0.384\ \text{m}$，漏加碰前已经滑过的 $0.6\ \text{m}$。

## 三、交互演示

滑块初始值就是题目数据。播放后看三个阶段：相对滑动、一起匀速、反弹后再滑动直到相对静止。物块上方的频闪点每隔 $0.2\ \text{s}$ 一个，点距变小表示它相对地面在变慢。画面上的「距左端」在再次共速时就是 $L'$。

拖离题目数值后，若共速前小车已经走到挡板，或相对位移超过车长，右侧状态会提示本题算法不再适用。

<Param name="m1" label="小车质量" symbol="m_1" value={0.3} min={0.2} max={0.5} step={0.05} unit="kg" />

<Param name="m2" label="物块质量" symbol="m_2" value={0.2} min={0.1} max={0.2} step={0.05} unit="kg" />

<Param name="v0" label="物块初速度" symbol="v_0" color="velocity" value={2} min={1} max={3} step={0.1} unit="m/s" />

<Param name="mu" label="动摩擦因数" symbol="μ" value={0.2} min={0.1} max={0.4} step={0.05} />

<Param name="L" label="车长" symbol="L" value={1.5} min={1} max={2} step={0.1} unit="m" />

<Param name="d" label="右端到挡板" symbol="d" value={1} min={0.5} max={1.5} step={0.1} unit="m" />

<Param name="g" label="重力加速度" symbol="g" value={10} min={10} max={10} step={1} unit="m/s²" hidden />

<Param name="t" label="时间" value={0} min={0} max={20} step={0.01} unit="s" hidden />

<Motion
  name="sys"
  until={20}
  steps={4000}
  bodies={[
    {name: "blk", mass: "m2", along: 0, x: 0, v: "v0", forces: [
      {label: "G2", angle: -90, magnitude: "m2*g"},
      {label: "N", angle: 90, solve: "Nblk"},
      {label: "f", friction: {mu: "mu", static: "mu", normal: "Nblk", with: "car", together: "tSame"}}
    ]},
    {name: "car", mass: "m1", along: 0, x: 0, v: 0, forces: [
      {label: "G1", angle: -90, magnitude: "m1*g"},
      {label: "N'", angle: -90, magnitude: "Nblk"},
      {label: "Ng", angle: 90, solve: "Ng"}
    ]}
  ]}
  state={{w: 2, phase: 0}}
  rates={{w: "phase < 0.5 ? 0 : -mu*g*(1 + m2/m1)"}}
  events={[
    {name: "tHit", when: "xcar - d", dir: "up", set: {w: "vblk + vcar", phase: 1, vcar: "-vcar"}},
    {name: "tSame2", when: "w", dir: "down"}
  ]}
  read={{sMax: "max(xblk - xcar)"}}
/>

<Define name="aBlk" expr="mu*g" />

<Define name="aCar" expr="mu*m2*g/m1" />

<Define name="aRel" expr="aCar + aBlk" />

<Define name="tSameA" expr="v0/aRel" />

<Define name="vSame" expr="m2*v0/(m1+m2)" />

<Define name="xSame" expr="aCar*tSameA^2/2" />

<Define name="sSame" expr="v0^2/(2*aRel)" />

<Define name="tCoast" expr="(d - xSame)/vSame" />

<Define name="tCollide" expr="tSameA + tCoast" />

<Define name="sSlide2" expr="(2*vSame)^2/(2*aRel)" />

<Define name="Lprime" expr="sSame + sSlide2" />

<Define name="fShow" expr="abs(sys.vblk(t) - sys.vcar(t)) < 1e-2 ? 0 : mu*m2*g" />

<Question text="(1) 从物块滑上小车开始，经过多长时间小车与挡板 P 相撞？" set={{t: "tHit"}} hint="先求共速时刻和这段小车的位移，再与 d 比较" />

<Question text="(2) 反弹后再次相对静止，该处距车左端的距离 L' 是多少？" set={{t: "tSame2"}} hint="挡板只改变小车速度；碰前、碰后两段相对位移要相加" />

<Preset label="回到起点" set={{t: 0}} />

<Preset label="第一次共速" set={{t: "tSame"}} />

<Preset label="撞上挡板" set={{t: "tHit"}} />

<Preset label="再次相对静止" set={{t: "tSame2"}} />

<Status cases={[
  {when: "(Lprime > L + 1e-3) or (sMax > L + 1e-3)", label: "物块将滑出车面，题目条件不再成立", tone: "danger"},
  {when: "xSame >= d", label: "撞板时尚未共速，需另算", tone: "warning"},
  {when: "t >= tSame2 - 0.01", label: "再次相对静止，一起离开挡板", tone: "success"},
  {when: "t >= tHit - 0.005", label: "已反弹，物块仍在车上滑动", tone: "warning"},
  {when: "t >= tSame - 0.005", label: "已共速，一起冲向挡板", tone: "info"},
  {label: "物块向右滑，小车向右加速", tone: "neutral"}
]} />

<Sim
  title="物块滑上小车，撞挡板后反弹"
  height={420}
  duration="tSame2 + 0.45"
  time="t"
  params={["sys", "L", "d", "tSame", "tHit", "tSame2"]}
  hud={[
    {symbol: "s", label: "距左端", expr: "sys.xblk(t) - sys.xcar(t)", unit: "m", digits: 3},
    {symbol: "v_1", label: "小车", expr: "sys.vcar(t)", unit: "m/s", digits: 2},
    {symbol: "v_2", label: "物块", expr: "sys.vblk(t)", unit: "m/s", digits: 2}
  ]}
  legend={[
    {kind: "velocity", label: "速度"},
    {kind: "force", label: "滑动摩擦力"},
    {kind: "strobe", label: "物块位置 每 0.2 s"}
  ]}
  note="水平距离按同一比例。物块是质点，图上用小方块标出它所在的位置。"
  marks={[
    {t: 0, label: "物块滑上小车"},
    {t: "tSame", label: "第一次共速"},
    {t: "tHit", label: "撞上挡板"},
    {t: "tSame2", label: "再次相对静止"}
  ]}
>
sim({
  at(t, p) {
    return p.sys.state(t)
  },
  draw(ctx, s, v) {
    const p = v.p
    const wall = p.L + p.d
    const cartH = 0.18
    const blockW = 0.2
    const blockH = 0.16
    const m = v.view({
      xmin: -0.55,
      xmax: wall + 0.45,
      ymin: -0.72,
      ymax: 1.42,
      equal: true,
      pad: 14,
    })

    v.ground(m, -0.55, wall + 0.45, 0)
    v.wall(m, wall, 0, 0.95, { side: 'right', label: 'P' })
    v.ruler(m, 0, wall, -0.48, { step: 0.5, unit: 'm' })

    const c = v.cart(m, s.xcar, 0, p.L, cartH, { label: 'm_1' })
    v.block(m, s.xblk, c.top, blockW, blockH, { label: 'm_2' })

    v.strobe(m, (st) => [st.xblk, cartH + blockH + 0.08], { every: 0.2, kind: 'velocity' })

    const vrel = s.vblk - s.vcar
    if (Math.abs(vrel) > 0.01) {
      const dir = vrel > 0 ? 1 : -1
      const len = 0.36
      v.vec(m, s.xblk, c.top + blockH * 0.5, -dir * len, 0, { kind: 'force', label: 'f' })
      v.vec(m, s.xcar + p.L * 0.28, cartH * 0.4, dir * len, 0, { kind: 'force', label: "f'" })
    }

    if (Math.abs(s.vblk) > 0.04) {
      v.vec(m, s.xblk, c.top + blockH + 0.28, s.vblk * 0.4, 0, { kind: 'velocity', label: 'v_2' })
    }
    if (Math.abs(s.vcar) > 0.04) {
      v.vec(m, s.xcar + p.L * 0.62, cartH * 0.55, s.vcar * 0.4, 0, { kind: 'velocity', label: 'v_1' })
    }

    const rel = s.xblk - s.xcar
    if (rel > 0.1) {
      const name = v.t + 0.02 > p.tSame2 ? "L'" : '距左端'
      v.dim(m, s.xcar, 1.12, s.xblk, 1.12, name + ' ' + rel.toFixed(3) + ' m')
    }

    const gap = wall - (s.xcar + p.L)
    if (gap > 0.08) {
      v.dim(m, s.xcar + p.L, 0.48, wall, 0.48, '距挡板 ' + gap.toFixed(2) + ' m')
    }

    v.event(m, s.xblk, 1.12, '第一次共速', { at: p.tSame, kind: 'velocity' })
    v.event(m, wall, 0.72, '撞上挡板', { at: p.tHit, kind: 'force' })
    v.event(m, s.xblk, c.top + blockH, '再次相对静止', { at: p.tSame2, kind: 'velocity' })
  },
})
</Sim>

<Readout items={[
  {label: "距车左端", symbol: "s", expr: "sys.xblk(t) - sys.xcar(t)", unit: "m", digits: 3},
  {label: "小车速度", symbol: "v_1", color: "ink", expr: "sys.vcar(t)", unit: "m/s", digits: 2},
  {label: "物块速度", symbol: "v_2", color: "velocity", expr: "sys.vblk(t)", unit: "m/s", digits: 2},
  {label: "相撞时间", symbol: "t", expr: "tCollide", unit: "s", digits: 2},
  {label: "最终距左端", symbol: "L'", expr: "Lprime", unit: "m", digits: 3}
]} />

<Answer items={[
  {label: "小车与挡板相撞的时间", symbol: "t", expr: "tCollide", value: 1.55, unit: "s", digits: 2},
  {label: "相对静止处距左端", symbol: "L'", expr: "Lprime", value: 0.984, unit: "m", digits: 3}
]} />

<Plot
  title="速度—时间"
  caption="两线之间的面积等于物块相对小车滑过的距离"
  x={{name: "tau", label: "t", unit: "s", min: 0, max: "tSame2 + 0.35"}}
  y={{label: "v", unit: "m/s"}}
  series={[
    {label: "物块", expr: "sys.vblk(tau)", color: "velocity"},
    {label: "小车", expr: "sys.vcar(tau)", color: "ink"}
  ]}
  marks={[
    {x: "tSame", series: 1, label: "第一次共速"},
    {x: "tHit", series: 1, label: "小车反弹"},
    {x: "tSame2", series: 0, label: "再次共速"}
  ]}
  cursor="t"
/>

<Plot
  title="物块距车左端"
  caption="走平的两段是相对静止；反弹后再升高，终点就是 L'"
  x={{name: "tau", label: "t", unit: "s", min: 0, max: "tSame2 + 0.35"}}
  y={{label: "s", unit: "m", min: 0, max: "max(L, Lprime) + 0.15"}}
  series={[
    {label: "距左端", expr: "sys.xblk(tau) - sys.xcar(tau)", color: "velocity"},
    {label: "L'", expr: "Lprime", color: "graphite", dash: true},
    {label: "车长 L", expr: "L", color: "steel", dash: true}
  ]}
  marks={[
    {x: "tSame", series: 0, label: "第一次共速"},
    {x: "tHit", series: 0, label: "撞上挡板"},
    {x: "tSame2", series: 0, label: "再次相对静止"}
  ]}
  cursor="t"
/>

受力图跟着动画时刻变化：相对滑动时有滑动摩擦力，两段共速期间摩擦力消失。

<ForceDiagram
  title="物块受力"
  size="narrow"
  surface={{type: "ground"}}
  body={{shape: "block", label: "物块"}}
  forces={[
    {label: "G_2", angle: -90, magnitude: "m2*g", showValue: true, unit: "N", digits: 2},
    {label: "N", angle: 90, magnitude: "m2*g", showValue: true, unit: "N", digits: 2},
    {label: "f", angle: 180, magnitude: "fShow", showValue: true, unit: "N", digits: 2}
  ]}
/>

<ForceDiagram
  title="小车受力（地面光滑）"
  size="narrow"
  surface={{type: "ground"}}
  body={{shape: "block", label: "小车"}}
  forces={[
    {label: "G_1", angle: -90, magnitude: "m1*g", showValue: true, unit: "N", digits: 2},
    {label: "N'", angle: -90, magnitude: "m2*g", showValue: true, unit: "N", digits: 2},
    {label: "N_地", angle: 90, magnitude: "(m1+m2)*g", showValue: true, unit: "N", digits: 2},
    {label: "f'", angle: 0, magnitude: "fShow", showValue: true, unit: "N", digits: 2}
  ]}
/>

<Ledger
  title="动能与摩擦热"
  unit="J"
  digits={4}
  parts={[
    {label: "物块动能", symbol: "E_k2", expr: "0.5*m2*(sys.vblk(t))^2", color: "velocity"},
    {label: "小车动能", symbol: "E_k1", expr: "0.5*m1*(sys.vcar(t))^2", color: "ink"},
    {label: "摩擦生热", symbol: "Q", expr: "0.5*m2*(v0^2) - 0.5*m2*(sys.vblk(t))^2 - 0.5*m1*(sys.vcar(t))^2", color: "force"}
  ]}
  rows={[
    {label: "滑上", at: {t: 0}},
    {label: "第一次共速", at: {t: "tSame"}},
    {label: "此刻"},
    {label: "再次共速", at: {t: "tSame2"}}
  ]}
  total={{label: "初动能", symbol: "E_0", expr: "0.5*m2*(v0^2)"}}
/>

## 四、结合图像理解关键时刻

速度图上，物块从 $2\ \text{m/s}$ 匀减，小车从 $0$ 匀增，两线在 $0.6\ \text{s}$ 相遇，之后重合，直到撞板。撞板瞬间只有小车的速度从 $+0.8\ \text{m/s}$ 跳到 $-0.8\ \text{m/s}$，物块仍是 $+0.8\ \text{m/s}$。两线在 $2.03\ \text{s}$ 再次相遇，共同速度为 $-0.16\ \text{m/s}$。

两线所夹的面积就是相对位移：碰前一块是 $s_1 = 0.6\ \text{m}$，碰后一块是 $s_2 = 0.384\ \text{m}$。中间重合的那一段面积为零，对应一起匀速。

距左端的曲线先升到 $0.6\ \text{m}$，共速前进时保持水平，所以撞板不改变落点；反弹后再升到 $0.984\ \text{m}$，然后再次走平。水平虚线 $L'$ 是公式算出的终点，车长 $L$ 是车面的尽头。题目条件下曲线贴上 $L'$，并且低于车长，物块没有从右端滑出。

能量账本里，热量只在两段相对滑动中增加。第一次共速到撞板之间，拖动时间轴，「此刻」与「第一次共速」相同。末态动能加摩擦热等于初动能 $0.4\ \text{J}$。

## 五、答案汇总

| 问题 | 答案 |
|---|---|
| （1）小车与挡板相撞的时间 | $1.55\ \text{s}$ |
| （2）再次相对静止处距左端 $L'$ | $0.984\ \text{m}$ |
