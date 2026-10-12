---
id: gz-orbit-transfer
title: 卫星变轨
subject: physics
topic: 万有引力、机械能守恒与卫星变轨
source: 必修2 第七章综合挑战
breadcrumb: ["必修 2", "万有引力与宇宙航行", "综合挑战"]
theme: night
question: |
  现要把位于赤道上空、轨道半径 r₁=6.5×10³ km 的圆形轨道上的卫星，转移到半径 r₂=4.2×10⁴ km 的同步卫星圆轨道上去。转移分两步：先在短时间内给卫星加速，使它从距地心 r₁ 的近地点 A 沿椭圆轨道运动到距地心 r₂ 的远地点 B；当卫星飞到远地点 B 时，再次给它加速，使它进入半径为 r₂ 的圆轨道。已知地球质量 M=5.98×10²⁴ kg，引力常量 G=6.67×10⁻¹¹ N·m²/kg²，两物体相距 r 时引力势能 Ep=−GMm/r。试求两次加速过程中，卫星的速度各增加了多少。
answers:
  - { name: dv1, value: 2474.73, unit: m/s }
  - { name: dv2, value: 1486.22, unit: m/s }
---

<Question text="卫星先在近地点 A 加速进入椭圆转移轨道，到远地点 B 再加速进入同步轨道。两次加速，速度各增加了多少？" hint="提示：引力势能 E_p = −GMm/r；椭圆两端用角动量守恒 r₁v_A = r₂v_B。" />

<Param name="r1" label="初始圆轨道" symbol="r_1" value={6500} min={6500} max={20000} step={100} unit="km" format="sci" digits={1} />

<Param name="r2" label="目标圆轨道" symbol="r_2" value={42000} min={25000} max={400000} step={1000} unit="km" format="sci" digits={1} />

<Param name="G" label="引力常量" value={6.67e-11} hidden />

<Param name="M" label="地球质量" value={5.98e24} hidden />

<Param name="t" label="时间" value={0} min={0} max="tEnd" hidden />

<Preset label="题目原值" set={{r1: 6500, r2: 42000}} />

<Preset label="去月球距离" set={{r2: 384000}} />

<Define name="muKH" expr="G*M/1e9*3600^2" />

<Define name="aT" expr="(r1 + r2)/2" />

<Define name="ecc" expr="(r2 - r1)/(r1 + r2)" />

<Define name="bT" expr="aT*sqrt(1 - ecc^2)" />

<Define name="T1" expr="2*pi*sqrt(r1^3/muKH)" />

<Define name="T2" expr="2*pi*sqrt(r2^3/muKH)" />

<Define name="nT" expr="sqrt(muKH/aT^3)" />

<Define name="tT" expr="pi/nT" />

<Define name="tA" expr="0.35*T1" />

<Define name="tB" expr="tA + tT" />

<Define name="tEnd" expr="tB + T2/6" />

<Define name="v1" expr="sqrt(G*M/(r1*1000))" />

<Define name="v2" expr="sqrt(G*M/(r2*1000))" />

<Define name="vA" expr="sqrt(2*G*M*r2/(r1*(r1 + r2)*1000))" />

<Define name="vB" expr="sqrt(2*G*M*r1/(r2*(r1 + r2)*1000))" />

<Define name="dv1" expr="vA - v1" />

<Define name="dv2" expr="v2 - vB" />

<Define name="Mn" expr="nT*clamp(t - tA, 0, tT)" />

<Define name="K0" expr="Mn + ecc*sin(Mn)" />

<Define name="K1" expr="K0 - (K0 - ecc*sin(K0) - Mn)/(1 - ecc*cos(K0))" />

<Define name="K2" expr="K1 - (K1 - ecc*sin(K1) - Mn)/(1 - ecc*cos(K1))" />

<Define name="K3" expr="K2 - (K2 - ecc*sin(K2) - Mn)/(1 - ecc*cos(K2))" />

<Define name="K4" expr="K3 - (K3 - ecc*sin(K3) - Mn)/(1 - ecc*cos(K3))" />

<Define name="K5" expr="K4 - (K4 - ecc*sin(K4) - Mn)/(1 - ecc*cos(K4))" />

<Define name="K6" expr="K5 - (K5 - ecc*sin(K5) - Mn)/(1 - ecc*cos(K5))" />

<Define name="K7" expr="K6 - (K6 - ecc*sin(K6) - Mn)/(1 - ecc*cos(K6))" />

<Define name="K8" expr="K7 - (K7 - ecc*sin(K7) - Mn)/(1 - ecc*cos(K7))" />

<Define name="rNow" expr="t < tA ? r1 : (t < tB ? aT*(1 - ecc*cos(K8)) : r2)" />

<Define name="aNow" expr="t < tA ? r1 : (t < tB ? aT : r2)" />

<Define name="vNow" expr="sqrt(G*M*(2/(rNow*1000) - 1/(aNow*1000)))" />

<Define name="Ek" expr="vNow^2/2/1e6" />

<Define name="Ep" expr="-G*M/(rNow*1000)/1e6" />

<Define name="Etot" expr="Ek + Ep" />

<Status cases={[
  {when: "t < tA", label: "初始圆轨道：速度大小不变", tone: "neutral"},
  {when: "t < tB", label: "椭圆转移：远离地心，动能换成势能", tone: "info"},
  {label: "目标圆轨道：再次匀速圆周运动", tone: "success"}
]} />

<Readout items={[
  {label: "点火后", symbol: "v_A", color: "velocity", expr: "vA/1000", unit: "km/s"},
  {label: "点火前", symbol: "v_B", color: "velocity", expr: "vB/1000", unit: "km/s"},
  {label: "转移用时", expr: "tT", unit: "h"}
]} />

<Answer items={[
  {label: "A 点第一次加速", symbol: "Δv_1", expr: "dv1/1000", value: 2.47473, unit: "km/s"},
  {label: "B 点第二次加速", symbol: "Δv_2", expr: "dv2/1000", value: 1.48622, unit: "km/s"}
]} />

<Sim
  height={420}
  duration="tEnd"
  time="t"
  timeUnit="h"
  params={["muKH", "r1", "r2", "aT", "bT", "ecc", "nT", "T1", "T2", "tA", "tB", "tT"]}
  marks={[
    {t: "tA", label: "A 点火", color: "force"},
    {t: "tB", label: "B 点火", color: "force"}
  ]}
  legend={[
    {kind: "velocity", symbol: "v", label: "速度"},
    {kind: "force", symbol: "F", label: "引力"},
    {kind: "strobe", label: "等时间间隔"}
  ]}
  note="示意比例：轨道半径按平方根压缩，地球不按比例；速度箭头越长速率越大，虚线段长度正比于 Δv。"
>
sim({
  at(t, p) {
    let x, y, vx, vy
    if (t < p.tA) {
      const v = 2 * Math.PI * p.r1 / p.T1
      const th = Math.PI + 2 * Math.PI * (t - p.tA) / p.T1
      x = p.r1 * Math.cos(th)
      y = p.r1 * Math.sin(th)
      vx = -v * Math.sin(th)
      vy = v * Math.cos(th)
    } else if (t < p.tB) {
      const M = p.nT * (t - p.tA)
      let E = M + p.ecc * Math.sin(M)
      for (let i = 0; i < 12; i++) E -= (E - p.ecc * Math.sin(E) - M) / (1 - p.ecc * Math.cos(E))
      const den = 1 - p.ecc * Math.cos(E)
      x = -p.aT * (Math.cos(E) - p.ecc)
      y = -p.bT * Math.sin(E)
      vx = p.aT * p.nT * Math.sin(E) / den
      vy = -p.bT * p.nT * Math.cos(E) / den
    } else {
      const v = 2 * Math.PI * p.r2 / p.T2
      const th = 2 * Math.PI * (t - p.tB) / p.T2
      x = p.r2 * Math.cos(th)
      y = p.r2 * Math.sin(th)
      vx = -v * Math.sin(th)
      vy = v * Math.cos(th)
    }
    return { x, y, vx, vy, speed: Math.hypot(vx, vy) }
  },
  draw(ctx, s, v) {
    const p = v.p
    const m = v.view({ xmin: -1.32, xmax: 1.32, ymin: -1.12, ymax: 1.12, pad: 16, equal: true })
    const k = 0.5
    const f = (r) => Math.pow(r / p.r2, k)
    const map = (x, y) => {
      const r = Math.hypot(x, y)
      return r < 1e-9 ? [0, 0] : [(x * f(r)) / r, (y * f(r)) / r]
    }
    const kms = (u) => (u / 3600).toFixed(2)
    const circ = (r) => Math.sqrt(p.muKH / r)
    const v1 = circ(p.r1)
    const v2 = circ(p.r2)
    const vA = p.nT * p.aT * Math.sqrt((1 + p.ecc) / (1 - p.ecc))
    const vB = (vA * p.r1) / p.r2
    // Affine length keeps slow apogee arrows readable while Δv segments stay proportional.
    const scale = 0.5 / vA
    const base = 0.08

    v.stars()
    const R1 = f(p.r1)
    v.orbit(m, 0, 0, R1, R1)
    v.orbit(m, 0, 0, 1, 1)
    const ell = []
    for (let i = 0; i <= 180; i++) {
      const E = (2 * Math.PI * i) / 180
      ell.push(map(-p.aT * (Math.cos(E) - p.ecc), -p.bT * Math.sin(E)))
    }
    v.path(m, ell, { color: v.color.steel, width: 1, dash: [3, 4] })
    v.planet(m, 0, 0, R1 * 0.7, { label: '地球' })
    v.text(m, -R1 - 0.08, 0.06, 'A', { size: 13 })
    v.text(m, 1.08, 0.06, 'B', { size: 13 })
    v.text(m, 0, -1.06, '目标轨道 r_2', { size: 11, color: v.color.graphite })

    v.trail(m, (st) => map(st.x, st.y), { kind: 'velocity', every: p.tT / 9 })

    const P = map(s.x, s.y)
    const rho = Math.hypot(s.x, s.y)
    const ux = s.x / rho
    const uy = s.y / rho
    const vr = ux * s.vx + uy * s.vy
    const vt = ux * s.vy - uy * s.vx
    let dx = k * vr * ux - vt * uy
    let dy = k * vr * uy + vt * ux
    const dn = Math.hypot(dx, dy)
    dx /= dn
    dy /= dn

    const pr = Math.hypot(P[0], P[1])
    v.vec(m, P[0], P[1], (-P[0] / pr) * 0.16, (-P[1] / pr) * 0.16, { kind: 'force', label: 'F' })

    const win = v.duration * 0.07
    const burn = v.t >= p.tA && v.t < p.tA + win ? [v1, vA, '1'] : v.t >= p.tB && v.t < p.tB + win ? [vB, v2, '2'] : null
    if (burn) {
      const [pre, post, n] = burn
      const L = base + pre * scale
      v.vec(m, P[0], P[1], dx * L, dy * L, { kind: 'velocity', label: 'v ' + kms(pre) })
      v.vec(m, P[0] + dx * L, P[1] + dy * L, dx * (post - pre) * scale, dy * (post - pre) * scale, {
        kind: 'velocity',
        dash: [4, 3],
        label: 'Δv_' + n + ' +' + kms(post - pre) + ' km/s',
      })
    } else {
      const L = base + s.speed * scale
      v.vec(m, P[0], P[1], dx * L, dy * L, { kind: 'velocity', label: 'v ' + kms(s.speed) })
    }
    v.satellite(m, P[0], P[1], { angle: (Math.atan2(dy, dx) * 180) / Math.PI, size: 6 })

    v.event(m, -R1, 0, 'A 点第一次点火', { at: p.tA, kind: 'force', place: 'below-left' })
    v.event(m, 1, 0, 'B 点第二次点火', { at: p.tB, kind: 'force', place: 'below-right' })
  },
})
</Sim>

<Plot
  title="能量 – 时间"
  caption="点火时总能量跳升，滑行时守恒"
  x={{name: "t", label: "t", unit: "h", min: 0, max: "tEnd"}}
  y={{label: "E/m", unit: "MJ/kg"}}
  series={[
    {label: "E_k 动能", expr: "Ek", color: "velocity"},
    {label: "E_p 势能", expr: "Ep", color: "field"},
    {label: "E 总", expr: "Etot", color: "ink", dash: true}
  ]}
  marks={[
    {x: "tA", series: 2, label: "A 点火"},
    {x: "tB", series: 2, label: "B 点火"}
  ]}
  cursor="t"
  values={false}
/>

<Dial
  title="速度表"
  expr="vNow/1000"
  min={0}
  max={12}
  step={2}
  unit="km/s"
  symbol="v"
  color="velocity"
  arcs={[
    {from: "v1/1000", to: "vA/1000", color: "velocity"},
    {from: "vB/1000", to: "v2/1000", color: "velocity"}
  ]}
  footer={[
    {label: "A 点火", from: "v1/1000", to: "vA/1000"},
    {label: "B 点火", from: "vB/1000", to: "v2/1000"}
  ]}
/>

## 一、题目条件分析

统一单位：$r_1=6.5\times10^6\ \mathrm m$，$r_2=4.2\times10^7\ \mathrm m$，$GM=3.989\times10^{14}\ \mathrm{m^3/s^2}$。

用四个速度区分两次加速的前后：

| 位置 | 加速前 | 加速后 |
|---|---|---|
| 近地点 A | 原圆轨道速度 $v_1$ | 椭圆轨道近地点速度 $v_A$ |
| 远地点 B | 椭圆轨道远地点速度 $v_B$ | 同步圆轨道速度 $v_2$ |

所求为 $\Delta v_1=v_A-v_1$，$\Delta v_2=v_2-v_B$。两次加速视为瞬时；A、B 之间只受引力，机械能守恒。

## 二、完整解答

**圆轨道速度**：引力提供向心力，$v=\sqrt{GM/r}$，

$$
v_1=\sqrt{\frac{GM}{r_1}}=7.834\ \mathrm{km/s},\qquad v_2=\sqrt{\frac{GM}{r_2}}=3.082\ \mathrm{km/s}.
$$

**椭圆两端速度**：两端速度都垂直于半径，角动量守恒 $r_1v_A=r_2v_B$；A 到 B 机械能守恒

$$
\frac12v_A^2-\frac{GM}{r_1}=\frac12v_B^2-\frac{GM}{r_2}.
$$

联立得

$$
v_A=\sqrt{\frac{2GMr_2}{r_1(r_1+r_2)}}=10.308\ \mathrm{km/s},\qquad v_B=\frac{r_1}{r_2}v_A=1.595\ \mathrm{km/s}.
$$

**两次速度增量**：

$$
\Delta v_1=v_A-v_1=\boxed{2.47\times10^3\ \mathrm{m/s}},\qquad \Delta v_2=v_2-v_B=\boxed{1.49\times10^3\ \mathrm{m/s}}.
$$

> **易错点**：$\sqrt{GM/r}$ 只适用于圆轨道。B 点虽然已在同步轨道的高度，但卫星速度只有 $1.60\ \mathrm{km/s}$，不加速就会沿椭圆落回 A 点。

**看图理解**：能量图里，滑行段总能量是水平线，动能和势能此消彼长；两次点火时总能量跳升。频闪点在 A 附近稀、B 附近密，这就是开普勒第二定律：离地心越远走得越慢。把目标轨道拖到月球距离，转移要五天，第二次点火反而更小。
