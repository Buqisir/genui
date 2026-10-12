---
id: gd25-01
title: 小行星的椭圆轨道
source: 2025 广东卷（部分试题）第 1 题（单选）
question: "一颗小行星绕太阳运行，其近日点和远日点与太阳之间的距离分别为地球和太阳之间距离的 5 倍和 7 倍。关于该小行星，下列说法正确的是（ ） A. 公转周期 T = 6 年 B. 在该小行星在近日点的加速度是地球公转加速度的 1/25 C. 从远日点到近日点，小行星受太阳引力，逐渐减小 D. 从远日点到近日点，小行星线速度逐渐减小"
choice: B
answers:
  - { name: T, value: 14.697, unit: 年 }
  - { name: aRatio, value: 0.04 }
theme: night
---

以地球公转半长轴为长度单位，地球公转周期为时间单位。近日距离 $r_p = 5$，远日距离 $r_a = 7$，太阳在椭圆的一个焦点上。

## 完整解答

半长轴、焦点到中心的距离和半短轴为

$$
a = \frac{r_p + r_a}{2} = \frac{5 + 7}{2} = 6, \qquad c = a - r_p = 1, \qquad b = \sqrt{a^2 - c^2} = \sqrt{35}
$$

开普勒第三定律：绕同一中心天体运行的星体，$T^2 \propto a^3$。地球取 $a_E = 1$、$T_E = 1$，

$$
\boxed{T = a^{3/2} = 6\sqrt{6} \approx 14.70\ \text{年}}
$$

不是 6 年。$6$ 是半长轴，周期还要再乘 $\sqrt{a}$。

太阳引力提供全部加速度。在距离 $r$ 处

$$
a_r = \frac{GM}{r^2} \propto \frac{1}{r^2}
$$

近日点 $r_p = 5$，地球公转半径取 1，

$$
\boxed{\frac{a_p}{a_E} = \frac{1}{r_p^2} = \frac{1}{25}}
$$

从远日点走向近日点，到太阳的距离由 7 减到 5，引力 $F = GMm/r^2$ 随 $r$ 减小而增大，不是逐渐减小。

同一段上，引力做正功，机械能增加，线速度增大；近日点线速度最大，远日点最小。也可以看角动量：速度在近、远日点都与径向垂直，$v_p r_p = v_a r_a$，故 $v_p/v_a = 7/5 > 1$。

逐项看：

A. 错误。周期是 $6\sqrt{6}$ 年，约 14.70 年，不是 6 年。

B. 正确。近日点加速度与地球公转加速度之比是 $1/5^2 = 1/25$。

C. 错误。远日点到近日点距离减小，引力增大。

D. 错误。同一段上引力做正功，线速度增大。

所以选 B。

<Param name="rp" label="近日距离" value={5} min={2} max={8} step={0.1} unit="AU" />

<Param name="ra" label="远日距离" value={7} min={2} max={8} step={0.1} unit="AU" />

<Param name="f" label="轨道位置" value={1} min={0} max={1} step={0.001} hidden />

<Define name="rNear" expr="min(rp, ra)" />

<Define name="rFar" expr="max(rp, ra)" />

<Define name="aAxis" expr="(rNear + rFar)/2" />

<Define name="cFocus" expr="(rFar - rNear)/2" />

<Define name="bAxis" expr="sqrt(aAxis^2 - cFocus^2)" />

<Define name="T" expr="aAxis^(3/2)" />

<Define name="rNow" expr="aAxis*(1 - (cFocus/aAxis)^2)/(1 + (cFocus/aAxis)*cos(pi*f))" />

<Define name="aRatio" expr="1/rNear^2" />

<Define name="aNow" expr="1/rNow^2" />

<Define name="vNow" expr="sqrt(2/rNow - 1/aAxis)" />

<Define name="vNear" expr="sqrt(2/rNear - 1/aAxis)" />

<Define name="vFar" expr="sqrt(2/rFar - 1/aAxis)" />

<Define name="Fnow" expr="1/rNow^2" />

<Define name="Fnear" expr="1/rNear^2" />

<Define name="Ffar" expr="1/rFar^2" />

## 交互演示

拖动进度，看小行星从远日点走到近日点。引力箭头和速度箭头都在变长，加速度箭头与地球虚影上的箭头对照。地球轨道画在同一幅里，大小按比例。

<Question text="A. 公转周期 T = 6 年" set={{f: 0}} hint="半长轴是 6 AU，周期还要再乘上它的平方根" />

<Question text="B. 在该小行星在近日点的加速度是地球公转加速度的 1/25" set={{f: 1}} hint="近日距离是地球轨道半径的 5 倍" />

<Question text="C. 从远日点到近日点，小行星受太阳引力，逐渐减小" set={{f: 0.5}} hint="距离减小时引力变大" />

<Question text="D. 从远日点到近日点，小行星线速度逐渐减小" set={{f: 0.5}} hint="这一段引力做正功" />

<Preset label="远日点" set={{f: 0}} />

<Preset label="近日点" set={{f: 1}} />

<Preset label="题目数据" set={{rp: 5, ra: 7, f: 1}} />

<Status cases={[
  {when: "abs(rp - 5) > 1e-6 or abs(ra - 7) > 1e-6", label: "已离开题目的近、远日距离", tone: "warning"},
  {when: "f < 0.02", label: "远日点：引力最小，线速度最小", tone: "info"},
  {when: "f > 0.98", label: "近日点：加速度是地球的 1/25", tone: "success"},
  {label: "正在靠近太阳：引力、线速度都在增大", tone: "neutral"}
]} />

<Readout items={[
  {label: "半长轴", symbol: "a", expr: "aAxis", unit: "AU", digits: 2},
  {label: "公转周期", symbol: "T", expr: "T", unit: "年", digits: 2, color: "velocity"},
  {label: "到太阳的距离", symbol: "r", expr: "rNow", unit: "AU", digits: 2},
  {label: "加速度 / 地球", symbol: "a_r / a_E", expr: "aNow", digits: 4, color: "accel"},
  {label: "线速度", symbol: "v", expr: "vNow", unit: "AU/年", digits: 3, color: "velocity"},
  {label: "引力 / 地球", symbol: "F / F_E", expr: "Fnow", digits: 4, color: "force"}
]} />

<Answer items={[
  {label: "答案", text: "B"},
  {label: "公转周期", symbol: "T", expr: "T", value: 14.697, unit: "年", digits: 2},
  {label: "近日加速度之比", symbol: "a_p / a_E", expr: "aRatio", value: 0.04, digits: 4}
]} />

<Sim
  title="小行星从远日点到近日点"
  height={420}
  duration={1}
  time="f"
  timeUnit=""
  playSeconds={8}
  params={["rNear", "rFar", "aAxis", "cFocus", "bAxis", "aNow", "vNow", "Fnow"]}
  marks={[
    {t: 0, label: "远日点"},
    {t: 1, label: "近日点"}
  ]}
  hud={[
    {symbol: "r", expr: "rNow", unit: "AU", digits: 2},
    {symbol: "a_r/a_E", expr: "aNow", digits: 3},
    {symbol: "v", expr: "vNow", unit: "AU/年", digits: 2}
  ]}
  legend={[
    {kind: "velocity", label: "线速度"},
    {kind: "force", label: "引力"},
    {kind: "accel", label: "加速度"},
    {kind: "steel", label: "地球轨道"}
  ]}
  note="进度从远日点到近日点；箭头长度按同一毕例，不代表真实时间"
>
sim({
  at(t, p) {
    const e = p.cFocus / p.aAxis
    const theta = Math.PI * t
    const r = p.aAxis * (1 - e * e) / (1 + e * Math.cos(theta))
    const x = r * Math.cos(theta)
    const y = r * Math.sin(theta)
    const h = Math.sqrt(p.aAxis * (1 - e * e))
    const vx = -Math.sin(theta) * h / r
    const vy = (e + Math.cos(theta)) * h / r
    return { x, y, r, vx, vy }
  },
  draw(ctx, s, v) {
    const R = Math.max(v.p.rFar, 8)
    const m = v.view({ xmin: -R * 1.35, xmax: R * 0.85, ymin: -R * 0.72, ymax: R * 0.72, equal: true })
    v.stars()
    v.orbit(m, -v.p.cFocus, 0, v.p.aAxis, v.p.bAxis, { color: v.color.velocity })
    v.ellipse(m, 0, 0, 1, 1, { color: v.color.steel, dash: true })
    v.planet(m, 0, 0, 0.42, { label: "太阳" })
    v.planet(m, 1, 0, 0.16, { label: "地球" })
    v.vec(m, 1, 0, 0, 0.55, { kind: "accel", label: "a_E" })
    v.trail(m, (st) => [st.x, st.y], { kind: "velocity" })
    v.planet(m, s.x, s.y, 0.22, { label: "小行星" })
    const sc = 2.2
    const ux = -s.x / s.r
    const uy = -s.y / s.r
    const tx = -uy
    const ty = ux
    v.vec(m, s.x, s.y, s.vx * sc, s.vy * sc, { kind: "velocity", label: "v" })
    const fLen = 1.35 / (s.r * s.r) * 18
    v.vec(m, s.x + tx * 0.45, s.y + ty * 0.45, ux * fLen, uy * fLen, { kind: "force", label: "F" })
    v.vec(m, s.x - tx * 0.55, s.y - ty * 0.55, ux * fLen * 0.85, uy * fLen * 0.85, { kind: "accel", label: "a", dash: true })
  },
})
</Sim>

## 结合图像看变化

横轴是远日点到近日点的进度。引力和线速度都随距离减小而上升，所以 C、D 两项都把变化方向说反了。

<Plot
  title="引力与线速度"
  caption="从远日点到近日点，两者都增大"
  size="wide"
  x={{name: "f", label: "进度", min: 0, max: 1}}
  y={{label: "相对值", min: 0}}
  series={[
    {label: "F / F_E", expr: "1/(aAxis*(1 - (cFocus/aAxis)^2)/(1 + (cFocus/aAxis)*cos(pi*f)))^2", color: "force"},
    {label: "v", expr: "sqrt(2/(aAxis*(1 - (cFocus/aAxis)^2)/(1 + (cFocus/aAxis)*cos(pi*f))) - 1/aAxis)", color: "velocity"}
  ]}
  marks={[
    {x: 0, label: "远日点"},
    {x: 1, label: "近日点"}
  ]}
  cursor="f"
/>

<Plot
  title="加速度之比"
  caption="近日点落在 0.04，即 1/25"
  size="narrow"
  x={{name: "f", label: "进度", min: 0, max: 1}}
  y={{label: "a_r / a_E", min: 0}}
  series={[
    {label: "a_r / a_E", expr: "1/(aAxis*(1 - (cFocus/aAxis)^2)/(1 + (cFocus/aAxis)*cos(pi*f)))^2", color: "accel"}
  ]}
  marks={[
    {x: 1, label: "1/25"}
  ]}
  cursor="f"
/>

## 答案汇总

选 B。半长轴为 6 倍地日距离，周期为 $6\sqrt{6}$ 年；近日点加速度是地球公转加速度的 $1/25$；从远日点到近日点，引力和线速度都增大。
