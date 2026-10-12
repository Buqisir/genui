---
id: r6-02-two-pistons
title: 双活塞汽缸：整体受力与等温压缩
subject: physics
topic: 理想气体状态变化与活塞平衡
source: 2022 珠海模拟
question: |
  （2022·珠海模拟）汽缸由两个横截面积不同的圆筒连接而成，活塞 A 在粗筒中、活塞 B 在细筒中，A、B 被轻质刚性细杆连接在一起，可无摩擦地移动。A、B 的质量分别为 m_A=12 kg、m_B=8.0 kg，横截面积分别为 S_A=4.0×10⁻² m²、S_B=2.0×10⁻² m²。一定质量的理想气体被封闭在两活塞之间，两活塞的外侧都与大气相通，大气压强 p₀=1.0×10⁵ Pa，g 取 10 m/s²，两个圆筒都足够长。
  (1) 汽缸水平放置达到平衡状态时，求气体的压强；
  (2) 已知汽缸水平放置时气体的体积 V=2.0×10⁻² m³。现保持温度不变，将汽缸竖直放置（A 在上、B 在下），达到平衡后，与水平放置时相比，活塞在汽缸内移动的距离 l 为多少？
answers:
  - { name: M, value: 20, unit: kg }
  - { name: deltaS, value: 0.02, unit: m² }
  - { name: pHorizontal, value: 100000, unit: Pa }
  - { name: pVertical, value: 110000, unit: Pa }
  - { name: VVertical, value: 0.01818181818181818, unit: m³ }
  - { name: deltaVFinal, value: 0.0018181818181818182, unit: m³ }
  - { name: lFinal, value: 0.09090909090909091, unit: m }
---

## 一、题目条件分析

把两活塞和轻质刚性细杆作为一个整体研究，细杆对两活塞的作用力是内力，不必单独求出。

整体质量与两活塞的面积差为：

$$
\boxed{M=m_A+m_B=20\ \mathrm{kg}},
\qquad
\boxed{\Delta S=S_A-S_B=2.0\times10^{-2}\ \mathrm{m^2}}。
$$

取沿筒轴从 B 指向 A 的方向为正方向：

- 气体对 A 的力指向正方向，对 B 的力指向负方向，合力为 $p\Delta S$。
- 外界大气对 A 的力指向负方向，对 B 的力指向正方向，合力为 $-p_0\Delta S$。
- 筒壁无摩擦，筒壁支持力没有沿筒轴的分量。
- 两活塞由刚性杆连接，移动距离相同；但截面积不同，移动时封闭气体的体积会改变。

温度保持不变，封闭气体的质量不变，因此两个平衡状态满足玻意耳定律。

## 二、完整解答

### （1）水平放置时的气体压强

水平放置时，重力垂直于筒轴，没有轴向分量。整体沿筒轴的平衡方程为：

$$
p_1S_A-p_1S_B-p_0S_A+p_0S_B=0。
$$

整理得：

$$
(p_1-p_0)(S_A-S_B)=0。
$$

由于 $S_A\ne S_B$，所以：

$$
\boxed{p_1=p_0=1.0\times10^5\ \mathrm{Pa}}。
$$

### （2）竖直放置后的移动距离

**先求竖直状态的压强。** A 在上、B 在下，此时正方向竖直向上。整体受力平衡：

$$
p_2S_A+p_0S_B-p_2S_B-p_0S_A-Mg=0。
$$

因此：

$$
(p_2-p_0)\Delta S=Mg，
$$

$$
\boxed{
p_2=p_0+\frac{Mg}{\Delta S}
=1.0\times10^5+\frac{20\times10}{2.0\times10^{-2}}
=1.1\times10^5\ \mathrm{Pa}
}。
$$

**再求气体体积。** 等温变化满足：

$$
p_1V_1=p_2V_2，
$$

$$
\boxed{
V_2=\frac{p_1V_1}{p_2}
=\frac{1.0\times10^5\times2.0\times10^{-2}}{1.1\times10^5}
=\frac{1}{55}\ \mathrm{m^3}
\approx1.818\times10^{-2}\ \mathrm{m^3}
}。
$$

所以体积减少量为：

$$
\boxed{
\Delta V=V_1-V_2
=\frac{1}{550}\ \mathrm{m^3}
\approx1.818\times10^{-3}\ \mathrm{m^3}
}。
$$

**最后把体积变化换成位移。** 两活塞一起向下移动 $l$：

- 上方活塞 A 下移，使气体体积减少 $S_A l$。
- 下方活塞 B 下移，使气体体积增加 $S_B l$。

两者合起来：

$$
V_2=V_1-S_A l+S_B l=V_1-\Delta S\,l。
$$

于是：

$$
\boxed{
l=\frac{V_1-V_2}{\Delta S}
=\frac{1/550}{2.0\times10^{-2}}
=\frac{1}{11}\ \mathrm m
\approx9.09\times10^{-2}\ \mathrm m
}。
$$

即两活塞相对汽缸均**向下移动约 $9.09\ \mathrm{cm}$**。

> 易错点：刚性杆保证两活塞间距不变，但不保证气体体积不变。体积变化应使用面积差 $(S_A-S_B)l$，不能只使用其中一个活塞的面积。

## 三、交互演示

用连续倾角连接水平、竖直两个状态。设筒轴从 B 指向 A 的方向与水平面的夹角为 $\theta$，从 $0^\circ$ 缓慢增大到 $90^\circ$，并保持温度不变。

每个角度都展示对应的平衡状态，不表示实际运动速度。唯一的滑块控制倾角，压强、体积和位移由平衡条件与等温条件自动计算。

<Param name="mA" label="活塞 A 的质量" value={12} min={12} max={12} step={1} unit="kg" hidden={true} />

<Param name="mB" label="活塞 B 的质量" value={8} min={8} max={8} step={1} unit="kg" hidden={true} />

<Param name="SA" label="活塞 A 的面积" value={0.04} min={0.04} max={0.04} step={0.01} unit="m²" hidden={true} />

<Param name="SB" label="活塞 B 的面积" value={0.02} min={0.02} max={0.02} step={0.01} unit="m²" hidden={true} />

<Param name="p0" label="大气压强" value={100000} min={100000} max={100000} step={1} unit="Pa" hidden={true} />

<Param name="g" label="重力加速度" value={10} min={10} max={10} step={1} unit="m/s²" hidden={true} />

<Param name="V0" label="水平状态的气体体积" value={0.02} min={0.02} max={0.02} step={0.01} unit="m³" hidden={true} />

<Param name="theta" label="筒轴从 B 指向 A 的方向与水平面的夹角 θ" value={0} min={0} max={90} step={1} unit="°" />

<Define name="M" expr="mA + mB" />

<Define name="deltaS" expr="SA - SB" />

<Define name="pHorizontal" expr="p0" />

<Define name="pVertical" expr="p0 + M*g/deltaS" />

<Define name="VVertical" expr="pHorizontal*V0/pVertical" />

<Define name="deltaVFinal" expr="V0 - VVertical" />

<Define name="lFinal" expr="deltaVFinal/deltaS" />

<Define name="pGas" expr="p0 + M*g*sin(deg(theta))/deltaS" />

<Define name="VGas" expr="pHorizontal*V0/pGas" />

<Define name="lCurrent" expr="(V0 - VGas)/deltaS" />

<Define name="gasForce" expr="pGas*deltaS" />

<Define name="airForce" expr="p0*deltaS" />

<Define name="G" expr="M*g" />

<Define name="N" expr="M*g*cos(deg(theta))" />

<Preset label="第（1）问答案：水平平衡" set={{theta: 0}} />

<Preset label="观察中间状态：倾角 45°" set={{theta: 45}} />

<Preset label="第（2）问答案：竖直平衡" set={{theta: 90}} />

<Status cases={[
  {when: "abs(theta) < 1e-6", label: "水平平衡：气体压强等于大气压强", tone: "success"},
  {when: "abs(theta - 90) < 1e-6", label: "竖直平衡：两活塞向下移动约 9.09 cm", tone: "success"},
  {label: "倾斜平衡：重力的轴向分量增大，气体被压缩", tone: "info"}
]} />

点播放，汽缸从水平慢慢竖起来。重力沿筒轴的分量 $Mg\sin\theta$ 把两活塞往 B 端推，封闭气体被压缩：分子越挤越密，压强随之升高，直到 $(p-p_0)\Delta S=Mg\sin\theta$ 重新平衡。虚线活塞是水平时的位置。

<Sim
  title="双活塞汽缸 · 缓慢竖起"
  height={460}
  time="theta"
  duration={90}
  playSeconds={7}
  timeUnit="°"
  params={["mA", "mB", "SA", "SB", "p0", "g", "V0"]}
  marks={[
    {t: 0, label: "水平", color: "velocity"},
    {t: 45, label: "45°"},
    {t: 90, label: "竖直", color: "force"}
  ]}
  hud={[
    {symbol: "p", expr: "pGas/1e5", unit: "×10⁵ Pa", digits: 3},
    {symbol: "l", expr: "lCurrent*100", unit: "cm", digits: 2}
  ]}
  legend={[
    {kind: "force", symbol: "F", label: "力"},
    {kind: "steel", symbol: "p₀", label: "大气压"}
  ]}
  note="截面积按真实比例 2 : 1。红点是两活塞与杆的质心，重力画在筒旁并分解出沿筒轴的分量；大气压箭头只示意方向。"
>
sim({
  at(t, p) {
    const M = p.mA + p.mB
    const dS = p.SA - p.SB
    const sin = Math.sin((t * Math.PI) / 180)
    const pr = p.p0 + (M * p.g * sin) / dS
    const V = (p.p0 * p.V0) / pr
    return { theta: t, sin, p: pr, l: (p.V0 - V) / dS }
  },
  draw(ctx, s, v) {
    const p = v.p
    const m = v.view({ xmin: -1.2, xmax: 1.2, ymin: -0.7, ymax: 0.7, pad: 14, equal: true })
    const rA = Math.sqrt(p.SA / Math.PI)
    const rB = Math.sqrt(p.SB / Math.PI)
    const uA = 0.3 - s.l
    const uB = -0.4 - s.l
    const a = (s.theta * Math.PI) / 180
    // Rotate about the middle of the cylinder so it fits both lying and standing.
    const mid = -0.03

    // Angle reference: horizontal through the pivot and the arc out to the axis.
    if (s.theta > 0.5) {
      v.line(m, 0.62, 0, 0.9, 0, { color: v.color.steel, width: 1, dash: [4, 4] })
      v.path(m, Array.from({ length: 25 }, (_, i) => {
        const b = (a * i) / 24
        return [0.76 * Math.cos(b), 0.76 * Math.sin(b)]
      }), { color: v.color.graphite, width: 1 })
      v.text(m, 0.84 * Math.cos(a / 2) + 0.03, 0.84 * Math.sin(a / 2), 'θ = ' + s.theta.toFixed(0) + '°', { size: 13, color: v.color.graphite, align: 'left' })
    }

    const T = v.tube(m, {
      x: -mid * Math.cos(a),
      y: -mid * Math.sin(a),
      angle: s.theta,
      sections: [{ from: -0.62, to: 0, r: rB }, { from: 0, to: 0.56, r: rA }],
      gas: { from: uB, to: uA, density: s.p / p.p0, count: 150, dot: 2 },
      pistons: [{ at: uB, label: 'B', labelSide: 'below' }, { at: uA, label: 'A' }],
      rod: true,
      ghosts: s.l > 0.003 ? [{ at: 0.3 }, { at: -0.4 }] : [],
    })

    // Atmosphere pushes on both outer faces.
    const push = (u, dir, r) => {
      for (const w of [-0.5 * r, 0, 0.5 * r]) {
        const [x0, y0] = T.pt(u + dir * 0.13, w)
        v.arrow(m, x0, y0, x0 - dir * 0.08 * T.ux, y0 - dir * 0.08 * T.uy, { color: v.color.steel, width: 1.2, head: 6 })
      }
    }
    push(uA + 0.03, 1, rA)
    push(uB - 0.03, -1, rB)
    const [lx, ly] = T.pt(uA + 0.2, 0)
    v.text(m, lx + 0.03, ly + 0.02, 'p₀', { size: 12, color: v.color.graphite, align: 'left' })

    // Weight at the centre of mass, and its component along the axis.
    const uc = (p.mA * uA + p.mB * uB) / (p.mA + p.mB)
    const [cx, cy] = T.pt(uc, 0)
    const G = 0.3
    v.circle(m, cx, cy, 3.5, { px: true, fill: v.color.force })
    // Weight is decomposed beside the tube (a force triangle), so neither arrow hides among the molecules.
    const [sx, sy] = T.pt(uc, -(rA + 0.16))
    v.line(m, cx, cy, sx, sy, { color: v.color.force, width: 1, dash: [2, 3] })
    const along = s.sin > 0.05 && s.sin < 0.985
    v.vec(m, sx, sy, 0, -G, { kind: 'force', label: s.sin >= 0.985 ? 'Mg（全部沿筒轴）' : 'Mg', place: 'below' })
    if (along) {
      const ex = sx - G * s.sin * T.ux
      const ey = sy - G * s.sin * T.uy
      v.vec(m, sx, sy, ex - sx, ey - sy, { kind: 'force', dash: [5, 4], width: 1.8, label: 'Mg sinθ', place: 'left' })
      v.line(m, ex, ey, sx, sy - G, { color: v.color.force, width: 1, dash: [2, 3] })
    }

    // Shift of piston A from its horizontal position, on the far side from the labels.
    if (s.l > 0.003) {
      const [x1, y1] = T.pt(0.3, -(rA + 0.06))
      const [x2, y2] = T.pt(uA, -(rA + 0.06))
      v.dim(m, x1, y1, x2, y2, '', { offset: 0 })
      const [tx, ty] = T.pt(0.3 - s.l / 2, -(rA + 0.06))
      v.label(m, tx, ty, 'l = ' + (s.l * 100).toFixed(1) + ' cm', { size: 12, color: v.color.graphite, place: 'right', background: false })
    }
  },
})
</Sim>

<Readout items={[
  {label: "倾角 θ", expr: "theta", unit: "°", digits: 0},
  {label: "气体压强 p", expr: "pGas", unit: "Pa", digits: 0},
  {label: "气体体积 V", expr: "VGas", unit: "m³", digits: 6},
  {label: "沿筒轴向 B 方向的移动距离", expr: "lCurrent", unit: "m", digits: 5},
  {label: "相对水平状态的体积减少量", expr: "V0 - VGas", unit: "m³", digits: 6}
]} />

<Plot
  title="平衡压强随倾角变化"
  x={{name: "theta", label: "θ", unit: "°", min: 0, max: 90}}
  y={{label: "p", unit: "Pa", min: 99000, max: 111000}}
  series={[
    {label: "气体压强", expr: "p0 + M*g*sin(deg(theta))/deltaS", color: "ink"},
    {label: "大气压强", expr: "p0", color: "steel", dash: true}
  ]}
  marks={[
    {x: 0, series: 0, label: "水平：100000 Pa"},
    {x: 90, series: 0, label: "竖直：110000 Pa"}
  ]}
  cursor="theta"
/>

<Plot
  title="两活塞的共同移动距离随倾角变化"
  x={{name: "theta", label: "θ", unit: "°", min: 0, max: 90}}
  y={{label: "l", unit: "m", min: 0, max: 0.1}}
  series={[
    {label: "沿筒轴向 B 方向的位移大小", expr: "(V0 - pHorizontal*V0/(p0 + M*g*sin(deg(theta))/deltaS))/deltaS", color: "ink"}
  ]}
  marks={[
    {x: 0, series: 0, label: "水平：l = 0"},
    {x: 90, series: 0, label: "竖直：l = 1/11 m"}
  ]}
  cursor="theta"
/>

## 四、结合图像理解关键状态

### 水平状态：$\theta=0^\circ$

重力没有沿筒轴的分量，气体合力与大气合力大小相等，所以 $p=p_0$。位移曲线从 $l=0$ 开始，这就是比较位移的基准状态。

### 倾斜状态：$0^\circ<\theta<90^\circ$

重力沿筒轴、指向 B 的分量为 $Mg\sin\theta$。轴向平衡要求：

$$
(p-p_0)\Delta S=Mg\sin\theta，
\qquad
p=p_0+\frac{Mg\sin\theta}{\Delta S}。
$$

倾角增大，平衡压强增大；等温条件下体积减小，两活塞共同向 B 方向移动。位移满足：

$$
l(\theta)=\frac{V_0}{\Delta S}
\left(
1-\frac{p_0}{p_0+\dfrac{Mg\sin\theta}{\Delta S}}
\right)。
$$

压强曲线和位移曲线均不是直线：倾角增加相同，压强与位移的增加量并不相同。

### 竖直状态：$\theta=90^\circ$

重力全部沿筒轴，筒壁支持力的合力为零。气体合力比大气合力大 $200\ \mathrm N$，恰好平衡整体重力。

此时压强达到 $1.1\times10^5\ \mathrm{Pa}$，位移达到 $1/11\ \mathrm m$；由于 B 在下，向 B 方向移动就是向下移动。

## 五、答案汇总

| 小问 | 答案 |
|---|---|
| （1）水平放置时的气体压强 | $\boxed{p_1=1.0\times10^5\ \mathrm{Pa}}$ |
| （2）与水平状态相比的移动距离 | $\boxed{l=\dfrac{1}{11}\ \mathrm m\approx9.09\times10^{-2}\ \mathrm m}$，两活塞均向下移动 |
