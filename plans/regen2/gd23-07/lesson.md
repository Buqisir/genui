---
id: gd23-07
title: 行星遮挡下的公转
source: 2023 广东卷 第 7 题（单选，4 分）
question: |
  如图（a）所示，太阳系外的一颗行星 P 绕恒星 Q 做匀速圆周运动。由于 P 的遮挡，探测器探测到 Q 的亮度随时间做如图（b）所示的周期性变化，该周期与 P 的公转周期相同。已知 Q 的质量为 M，引力常量为 G。关于 P 的公转，下列说法正确的是（　　）

  A. 周期为 2t_1 − t_0

  B. 半径为 ∛[GM(t_1 − t_0)^2 / (4π^2)]

  C. 角速度的大小为 π/(t_1 − t_0)

  D. 加速度的大小为 ∛[2πGM / (t_1 − t_0)]
choice: B
answers:
  - { name: T, value: 4, unit: s }
  - { name: r, value: 3.780e6, unit: m }
  - { name: omega, value: 1.571, unit: rad/s }
  - { name: aN, value: 9.331e6, unit: "m/s^2" }
theme: night
---

探测器、行星 P 和恒星 Q 几乎在一条直线上。P 绕 Q 做匀速圆周运动，只有转到探测器与 Q 之间时才挡住星光，亮度曲线上每个向下的缺口对应一次遮挡。

题目已经说明，亮度变化的周期就是 P 的公转周期。缺口出现在 $t_0$、$t_1$ 和 $2t_1-t_0$，相邻两次亮度下降的间隔都是 $t_1-t_0$，所以

$$
T=t_1-t_0
$$

行星走到恒星背后时不在探测器与 Q 之间，挡不住朝向探测器的星光，亮度不会掉下去。一个公转周期里只有一次遮挡。

题目只给字母。下面取一组代表性数值，不是题目数据：$t_0=1\,\mathrm{s}$，$t_1=5\,\mathrm{s}$，$M=2.0\times10^{30}\,\mathrm{kg}$，$G=6.67\times10^{-11}\,\mathrm{N\cdot m^2/kg^2}$。星体大小和轨道都不按比例。

## 完整解答

**A．错误。** 缺口标在 $t_0$、$t_1$、$2t_1-t_0$，相邻间隔是 $t_1-t_0$。亮度变化的周期就是这个间隔，也就是公转周期：

$$
T=t_1-t_0
$$

$2t_1-t_0$ 只是第三次遮挡的时刻，等于 $t_0+2T$，不是周期。按代表性数值，$T=5-1=4\,\mathrm{s}$。

**B．正确。** 引力提供向心力：

$$
\frac{GMm}{r^2}=m\frac{4\pi^2}{T^2}r
\quad\Rightarrow\quad
r=\sqrt[3]{\frac{GMT^2}{4\pi^2}}
$$

把 $T=t_1-t_0$ 代入：

$$
\boxed{r=\sqrt[3]{\dfrac{GM(t_1-t_0)^2}{4\pi^2}}}
$$

按代表性数值，$r\approx3.78\times10^{6}\,\mathrm{m}$。

**C．错误。** 匀速圆周运动中 $\omega=2\pi/T$。一个公转周期转过 $2\pi$，不是 $\pi$：

$$
\omega=\frac{2\pi}{t_1-t_0}
$$

选项写成 $\pi/(t_1-t_0)$，相当于把周期当成了两倍，角速度偏小一半。按代表性数值，$\omega=2\pi/4\approx1.57\,\mathrm{rad/s}$。

**D．错误。** 向心加速度 $a=\omega^2 r=4\pi^2 r/T^2$。用 $r=\sqrt[3]{GMT^2/(4\pi^2)}$ 换掉，

$$
a=\sqrt[3]{\frac{GM\cdot 16\pi^4}{T^4}}=\sqrt[3]{\frac{16\pi^4 GM}{(t_1-t_0)^4}}
$$

选项把周期放进了立方根，又少了一个四次方，量纲也对不上。

## 交互演示

拖动 $t_0$、$t_1$ 和恒星质量，看周期、半径、角速度和向心加速度怎么变。播放时行星每转一周从探测器与恒星之间通过一次，亮度缺口就出现一次；走到恒星背后时不遮挡。游标停在缺口上时，画面里行星正好挡住星光。

<Param name="t0" label="第一次遮挡" symbol="t_0" value={1} min={0} max={3} step={0.1} unit="s" />

<Param name="t1" label="第二次遮挡" symbol="t_1" value={5} min={4} max={9} step={0.1} unit="s" />

<Param name="M" label="恒星质量" symbol="M" value={2e30} min={1e30} max={4e30} step={1e29} unit="kg" format="sci" />

<Param name="G" value={6.67e-11} hidden />

<Param name="t" value={0} hidden />

<Define name="T" expr="t1 - t0" />

<Define name="t2" expr="t0 + 2*T" />

<Define name="r" expr="cbrt(G*M*T*T/(4*pi*pi))" />

<Define name="omega" expr="2*pi/T" />

<Define name="aN" expr="omega*omega*r" />

<Define name="omegaC" expr="pi/T" />

<Define name="aD" expr="cbrt(2*pi*G*M/T)" />

<Preset label="代表性数值，看选项 B" set={{t0: 1, t1: 5, M: 2e30}} />

<Question text="A. 周期为 2t_1 − t_0" set={{t0: 1, t1: 5}} />

<Question text="B. 半径为 ∛[GM(t_1 − t_0)^2 / (4π^2)]" set={{t0: 1, t1: 5}} />

<Question text="C. 角速度的大小为 π/(t_1 − t_0)" set={{t0: 1, t1: 5}} />

<Question text="D. 加速度的大小为 ∛[2πGM / (t_1 − t_0)]" set={{t0: 1, t1: 5}} />

<Status cases={[
  {when: "abs(t - t0) < 0.12*T or abs(t - (t0 + T)) < 0.12*T or abs(t - t2) < 0.12*T", label: "正在遮挡：行星在恒星前方的视线上，亮度掉到缺口", tone: "warning"},
  {label: "未遮挡：亮度保持在高位，相邻缺口相隔一个公转周期", tone: "info"}
]} />

<Readout items={[
  {label: "公转周期", symbol: "T", expr: "T", unit: "s", digits: 2},
  {label: "轨道半径", symbol: "r", expr: "r", unit: "m", format: "sci", color: "velocity"},
  {label: "角速度", symbol: "ω", expr: "omega", unit: "rad/s", digits: 3, color: "accel"},
  {label: "向心加速度", symbol: "a", expr: "aN", unit: "m/s²", format: "sci", color: "accel"},
  {label: "C 选项给出的角速度", symbol: "ω_C", expr: "omegaC", unit: "rad/s", digits: 3},
  {label: "D 选项给出的加速度", symbol: "a_D", expr: "aD", unit: "m/s²", format: "sci"}
]} />

<Answer items={[
  {label: "答案", text: "B"},
  {label: "公转周期", symbol: "T", text: "t_1 − t_0"},
  {label: "轨道半径", symbol: "r", text: "∛[GM(t_1 − t_0)² / (4π²)]"}
]} />

<Sim title="行星 P 绕恒星 Q 公转" height={640} duration="t2 + T/2" time="t" playSeconds={14} loop={true}
  params={["t0", "T", "r"]}
  marks={[
    {t: "t0", label: "第一次遮挡，行星在恒星前方"},
    {t: "t0 + T/4", label: "转过四分之一周，未遮挡"},
    {t: "t0 + T/2", label: "行星在恒星背后，不遮挡星光"},
    {t: "t0 + T", label: "再次遮挡，刚好一个公转周期"}
  ]}
  hud={[
    {symbol: "T", label: "公转周期", expr: "T", unit: "s", digits: 2},
    {symbol: "ω", label: "角速度", expr: "omega", unit: "rad/s", digits: 3},
    {symbol: "r", label: "轨道半径", expr: "r", unit: "m", format: "sci"}
  ]}
  legend={[
    {kind: "velocity", label: "线速度方向"},
    {kind: "force", label: "引力，指向恒星"},
    {kind: "charge", label: "探测器收到的星光"}
  ]}
  note="星体大小和轨道不按比例；箭头只表示方向">
sim({
  at(t, p) {
    return { th: Math.PI - (2 * Math.PI * (t - p.t0)) / p.T }
  },
  draw(ctx, s, v) {
    const sc = v.p.r / 3.78e6
    const m = v.view({ xmin: -2.5 * sc, xmax: 1.7 * sc, ymin: -1.6 * sc, ymax: 1.6 * sc, equal: true })
    v.stars()
    const xDet = -2.15 * sc
    v.line(m, xDet, 0, sc, 0, { color: v.color.steel, dash: true })
    v.arrow(m, xDet + 0.16 * sc, 0, xDet - 0.02 * sc, 0, { color: v.color.charge })
    v.label(m, xDet, 0.28 * sc, '探测器')
    v.planet(m, 0, 0, 0.30 * sc, { label: 'Q', light: '#F2C572', dark: '#8A4E12' })
    v.orbit(m, 0, 0, sc, 0.34 * sc, { back: true })
    const x = sc * Math.cos(s.th)
    const y = 0.34 * sc * Math.sin(s.th)
    const front = Math.cos(s.th) < 0
    if (!front) v.planet(m, x, y, 0.10 * sc, { label: 'P' })
    const blocking = front && Math.abs(y) < 0.06 * sc
    if (blocking) {
      v.event(m, 0, 0.55 * sc, '行星挡在恒星前方', { at: v.t, kind: 'force' })
    } else if (!front && Math.abs(y) < 0.06 * sc) {
      v.event(m, 0, 0.55 * sc, '行星在恒星背后，不遮挡', { at: v.t, kind: 'note' })
      v.photon(m, 0.32 * sc, 0, xDet + 0.12 * sc, 0, { still: true })
    } else {
      v.photon(m, 0.32 * sc, 0, xDet + 0.12 * sc, 0, { still: true })
    }
    if (front) v.planet(m, x, y, 0.10 * sc, { label: 'P' })
    const far = Math.abs(x) > 0.45 * sc
    if (far) {
      v.vec(m, x, y, -0.42 * x, -0.42 * y, { kind: 'force' })
      v.label(m, x, y + 0.42 * sc, 'F')
    }
    const dir = front ? 1 : -1
    v.vec(m, x, y, dir * (-0.55 * y), dir * (0.55 * x), { kind: 'velocity', label: 'v' })
    if (far) v.dim(m, 0, 0, x, y, 'r')
  },
})
</Sim>

<Plot title="恒星亮度随时间的变化"
  caption="缺口相隔 t_1 − t_0，就是一个公转周期；第三个缺口在 2t_1 − t_0"
  size="wide"
  x={{name: "tt", label: "t", unit: "s", min: 0, max: "t2 + T/2"}}
  y={{label: "亮度", min: 0, max: 1.25}}
  series={[
    {label: "亮度", color: "charge", expr: "1 - 0.62*exp(-((tt - t0)/(0.12*T))^2) - 0.62*exp(-((tt - (t0 + T))/(0.12*T))^2) - 0.62*exp(-((tt - t2)/(0.12*T))^2)"}
  ]}
  marks={[
    {x: "t0", label: "t_0 第一次遮挡"},
    {x: "t0 + T", label: "t_1 第二次遮挡"},
    {x: "t2", label: "2t_1 − t_0 第三次遮挡"}
  ]}
  cursor="t"
  values={false}
/>

## 结合图像看关键时刻

- $t=t_0$：行星在恒星靠近探测器的一侧穿过视线，亮度出现第一个缺口。
- $t=t_0+T/2$：行星转过半周，到达恒星背后。这一侧不在探测器与恒星之间，亮度保持在高位。
- $t=t_1=t_0+T$：行星再转半周，回到第一次遮挡的位置，完整走过一个公转周期。相邻缺口的间隔 $t_1-t_0$ 就是 $T$。
- $t=2t_1-t_0=t_0+2T$：再过一个周期的第三次遮挡。这个数是第三个缺口的时刻，不是周期本身。

半径和向心加速度都要用这个公转周期：$r=\sqrt[3]{GMT^2/(4\pi^2)}$，$a=\omega^2 r$，$\omega=2\pi/T$。C 把 $2\pi$ 写成 $\pi$，角速度偏小一半；D 的表达式连量纲都不对。只有 B 把周期 $t_1-t_0$ 代入向心力公式，半径正确。

## 答案

选 **B**。公转周期 $T=t_1-t_0$，轨道半径 $r=\sqrt[3]{GM(t_1-t_0)^2/(4\pi^2)}$。
