---
id: gd24-09
title: 行星表面的背罩分离
source: 2024 广东卷 第 9 题（多选，6 分）
question: 如图所示，探测器及其保护背罩通过弹性轻绳连接降落伞。在接近某行星表面时以 60 m/s 的速度竖直匀速下落。此时启动“背罩分离”，探测器与背罩断开连接，背罩与降落伞保持连接。已知探测器质量为 1000 kg，背罩质量为 50 kg，该行星的质量和半径分别为地球的 1/10 和 1/2。地球表面重力加速度大小取 g = 10 m/s^2。忽略大气对探测器和背罩的阻力。下列说法正确的有（　　）
choice: AC
answers:
  - { name: gp, value: 4, unit: m/s^2 }
  - { name: v1, value: 3.53, unit: km/s }
  - { name: aCover, value: 80, unit: m/s^2 }
  - { name: P, value: 240, unit: kW }
---

探测器与背罩连在一起，靠弹性轻绳吊在降落伞下面，以 60 m/s 竖直匀速下落。匀速意味着系统合力为零：绳的拉力正好支住探测器加背罩的重力。「背罩分离」只是把探测器从背罩上解开，绳仍拉着背罩，绳中拉力不变。

## 完整解答

**A. 正确。** 行星表面重力加速度 $g_p = GM/R^2$。质量是地球的 $1/10$、半径是地球的 $1/2$，所以

$$
g_p = g \cdot \frac{M_p/M_E}{(R_p/R_E)^2} = 10 \times \frac{1/10}{(1/2)^2} = 10 \times \frac{1/10}{1/4} = \boxed{4\ \mathrm{m/s^2}}
$$

**B. 错误。** 第一宇宙速度 $v_1 = \sqrt{g_p R_p}$。地球的第一宇宙速度约 $7.9\ \mathrm{km/s}$，这里半径和重力加速度都变了：

$$
v_1 = 7.9 \times \sqrt{\frac{g_p}{g} \cdot \frac{R_p}{R_E}} = 7.9 \times \sqrt{\frac{4}{10} \times \frac{1}{2}} = 7.9 \times \sqrt{0.2} \approx \boxed{3.6\ \mathrm{km/s}}
$$

不是 $7.9\ \mathrm{km/s}$。

**C. 正确。** 分离前匀速，绳的拉力支住探测器和背罩两者的重力：

$$
T = (m_d + m_c)\, g_p = (1000 + 50) \times 4 = 4200\ \mathrm{N}
$$

分离后瞬间绳仍拉背罩，探测器已经不再拉着背罩。背罩受向上的拉力和向下的重力，取向上为正：

$$
a_c = \frac{T - m_c g_p}{m_c} = \frac{4200 - 50 \times 4}{50} = \frac{4000}{50} = \boxed{80\ \mathrm{m/s^2}}
$$

**D. 错误。** 分离后瞬间探测器只受重力，速度仍是 $60\ \mathrm{m/s}$。重力的功率

$$
P = m_d g_p v = 1000 \times 4 \times 60 = 2.4 \times 10^5\ \mathrm{W} = \boxed{240\ \mathrm{kW}}
$$

不是 $30\ \mathrm{kW}$。这一瞬间重力做负功，动能减少。

答案是 **AC**。

## 交互演示

拖动时间看分离前后。分离前整体匀速下落；分离后探测器以 $g_p$ 加速下落，背罩被绳以 $80\ \mathrm{m/s^2}$ 向上拉，约 $0.75\ \mathrm{s}$ 后速度减到零并开始上升。降落伞远比背罩大，图中不按比例。

<Param name="t" label="时间" value={0} min={0} max={1.5} step={0.01} unit="s" />

<Param name="md" label="探测器质量" value={1000} min={500} max={1500} step={50} unit="kg" />

<Param name="mc" label="背罩质量" value={50} min={20} max={100} step={5} unit="kg" />

<Param name="v0" label="下落速度" value={60} min={20} max={80} step={1} unit="m/s" />

<Param name="g" value={10} hidden />

<Param name="massRatio" value={0.1} hidden />

<Param name="radiusRatio" value={0.5} hidden />

<Param name="v1E" value={7.9} hidden />

<Define name="gp" expr="g * massRatio / radiusRatio^2" />

<Define name="v1" expr="v1E * sqrt((gp/g) * radiusRatio)" />

<Define name="T" expr="(md + mc) * gp" />

<Define name="aCover" expr="(T - mc * gp) / mc" />

<Define name="P" expr="md * gp * v0 / 1000" />

<Preset label="题目条件" set={{t: 0, md: 1000, mc: 50, v0: 60}} />

<Preset label="分离后 0.75 s" set={{t: 0.75}} />

<Question text="A. 该行星表面的重力加速度大小为 4 m/s^2" set={{t: 0, md: 1000, mc: 50, v0: 60}} />

<Question text="B. 该行星的第一宇宙速度为 7.9 km/s" set={{t: 0, md: 1000, mc: 50, v0: 60}} />

<Question text="C. “背罩分离”后瞬间，背罩的加速度大小为 80 m/s^2" set={{t: 0, md: 1000, mc: 50, v0: 60}} />

<Question text="D. “背罩分离”后瞬间，探测器所受重力对其做功的功率为 30 kW" set={{t: 0, md: 1000, mc: 50, v0: 60}} />

<Status cases={[
  {when: "abs(t) < 1e-6", label: "分离前：整体匀速下落", tone: "info"},
  {when: "t < v0 / aCover", label: "分离后：背罩仍在下落，速度减小", tone: "warning"},
  {label: "背罩已经开始上升", tone: "success"}
]} />

<Readout items={[
  {label: "行星重力加速度", symbol: "g_p", expr: "gp", unit: "m/s^2", digits: 1, color: "accel"},
  {label: "第一宇宙速度", symbol: "v_1", expr: "v1", unit: "km/s", digits: 1, color: "velocity"},
  {label: "绳的拉力", symbol: "T", expr: "T", unit: "N", digits: 0, color: "force"},
  {label: "背罩加速度", symbol: "a_c", expr: "aCover", unit: "m/s^2", digits: 0, color: "accel"},
  {label: "重力做功功率", symbol: "P", expr: "P", unit: "kW", digits: 0, color: "force"}
]} />

<Answer items={[
  {label: "答案", text: "AC"},
  {label: "重力加速度", symbol: "g_p", expr: "gp", value: 4, unit: "m/s^2", digits: 1},
  {label: "第一宇宙速度", symbol: "v_1", expr: "v1", value: 3.53, unit: "km/s", digits: 2},
  {label: "背罩加速度", symbol: "a_c", expr: "aCover", value: 80, unit: "m/s^2", digits: 0},
  {label: "重力功率", symbol: "P", expr: "P", value: 240, unit: "kW", digits: 0}
]} />

<Sim
  title="背罩分离"
  height={460}
  duration={1.5}
  time="t"
  params={["md", "mc", "v0", "gp", "aCover"]}
  marks={[
    {t: 0, label: "分离前匀速"},
    {t: 0.75, label: "背罩速度减到零"}
  ]}
  hud={[
    {symbol: "g_p", label: "重力加速度", expr: "gp", unit: "m/s^2", digits: 1},
    {symbol: "a_c", label: "背罩加速度", expr: "aCover", unit: "m/s^2", digits: 0}
  ]}
  legend={[
    {kind: "velocity", label: "速度"},
    {kind: "accel", label: "加速度"}
  ]}
  note="降落伞远比背罩大，图中不按比例"
>
sim({
  at(t, p) {
    const sep = t > 1e-6
    const yD = -p.v0 * t - 0.5 * p.gp * t * t
    const yC = sep ? (-p.v0 * t + 0.5 * p.aCover * t * t) : yD
    const vD = p.v0 + p.gp * t
    const vC = sep ? (p.v0 - p.aCover * t) : p.v0
    return { yD, yC, vD, vC, sep }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -9, xmax: 9, ymin: -108, ymax: 22 })
    v.stars()
    const canopy = [[-3.2, 8], [-2.2, 12.2], [-1, 14.2], [0, 14.8], [1, 14.2], [2.2, 12.2], [3.2, 8]]
    v.path(m, canopy, { color: v.color.steel, width: 2 })
    canopy.forEach((pt) => v.line(m, pt[0], pt[1], 0, 5.4, { color: v.color.steel, width: 1 }))
    v.label(m, 5.2, 12, '降落伞')
    v.rope(m, [[0, 5.4], [0, s.yC + 4.4]])
    const dome = [[-2.2, s.yC + 0.6], [-1.6, s.yC + 2.4], [-0.7, s.yC + 3.4], [0, s.yC + 3.8], [0.7, s.yC + 3.4], [1.6, s.yC + 2.4], [2.2, s.yC + 0.6]]
    v.path(m, dome, { color: v.color.steel, width: 2.4, fill: v.color.enamel })
    v.line(m, -2.2, s.yC + 0.6, 2.2, s.yC + 0.6, { color: v.color.steel, width: 2 })
    v.label(m, 4.4, s.yC + 2.2, '背罩')
    if (!s.sep) {
      v.rope(m, [[0, s.yC], [0, s.yD + 2.6]])
    }
    v.block(m, 0, s.yD, 3.4, 2.6, { shadow: false })
    v.label(m, 4.6, s.yD + 1.3, '探测器')
    const vLen = -Math.max(Math.min(s.vC, 70), -10) * 0.08
    v.vec(m, -3.4, s.yC + 2, 0, vLen, { kind: 'velocity', label: 'v' })
    if (s.sep) {
      v.vec(m, -4.6, s.yC + 2, 0, 6, { kind: 'accel', label: 'a' })
      v.vec(m, 3.2, s.yD + 1.3, 0, -4, { kind: 'accel', label: 'g_p' })
    }
    v.event(m, -5.4, 6, '背罩分离', { at: 0, kind: 'force' })
    v.event(m, 5.4, s.yC + 4, 'v = 0', { at: 0.75, kind: 'velocity' })
  },
})
</Sim>

<ForceDiagram
  title="分离后瞬间：背罩"
  size="narrow"
  surface={{type: "none"}}
  body={{shape: "block", label: "背罩"}}
  mass="mc"
  accel={{angle: 90, magnitude: "aCover"}}
  forces={[
    {label: "G", angle: -90, magnitude: "mc*gp"},
    {label: "T", angle: 90, magnitude: "T"}
  ]}
  values="inline"
/>

<ForceDiagram
  title="分离后瞬间：探测器"
  size="narrow"
  surface={{type: "none"}}
  body={{shape: "block", label: "探测器"}}
  mass="md"
  accel={{angle: -90, magnitude: "gp"}}
  forces={[
    {label: "G", angle: -90, magnitude: "md*gp", showValue: true, unit: "N", digits: 0}
  ]}
/>

<Plot
  title="速度"
  size="wide"
  x={{name: "t", label: "t", unit: "s", min: 0, max: 1.5}}
  y={{label: "v", unit: "m/s", min: -70, max: 70}}
  series={[
    {label: "背罩", expr: "v0 - aCover*t", color: "velocity"},
    {label: "探测器", expr: "-(v0 + gp*t)", color: "accel"}
  ]}
  cursor="t"
  caption="向下为负。背罩在 t = v_0/a_c 时速度变为零"
/>

## 结合图像看关键时刻

$t = 0$ 是分离前的匀速状态，两者速度都是 $60\ \mathrm{m/s}$。分离后背罩的速度按 $v = v_0 - a_c t$ 减小，探测器按 $v = v_0 + g_p t$ 加快。题目条件下 $t = 0.75\ \mathrm{s}$ 时背罩速度减到零。

## 答案

选 **AC**。$g_p = 4\ \mathrm{m/s^2}$，$v_1 \approx 3.6\ \mathrm{km/s}$，$a_c = 80\ \mathrm{m/s^2}$，$P = 240\ \mathrm{kW}$。
