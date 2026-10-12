---
id: gd23-14
title: 两区磁场中的线框
source: 2023 广东卷 第 14 题（计算）
question: |
  光滑绝缘的水平面上有垂直平面的匀强磁场，磁场被分成区域Ⅰ和Ⅱ，宽度均为 h，其俯视图如图（a）所示，两磁场磁感应强度随时间 t 的变化如图（b）所示，0 ~ τ 时间内，两区域磁场恒定，方向相反，磁感应强度大小分别为 2B_0 和 B_0，一电阻为 R、边长为 h 的刚性正方形金属框 abcd，平放在水平面上，ab、cd 边与磁场边界平行．t = 0 时，线框 ab 边刚好跨过区域Ⅰ的左边界以速度 v 向右运动．在 τ 时刻，ab 边运动到距区域Ⅰ的左边界 h/2 处，线框的速度近似为零，此时线框被固定，如图（a）中的虚线框所示。随后在 τ ~ 2τ 时间内，Ⅰ区磁感应强度线性减小到 0，Ⅱ区磁场保持不变；2τ ~ 3τ 时间内，Ⅱ区磁感应强度也线性减小到 0。求：（1）t = 0 时线框所受的安培力 F；（2）t = 1.2τ 时穿过线框的磁通量 φ；（3）2τ ~ 3τ 时间内，线框中产生的热量 Q。
answers:
  - { name: F0, value: 0.0008, unit: N }
  - { name: phiMid, value: 0.0012, unit: Wb }
  - { name: Qlate, value: 0.00002, unit: J }
---

题目只给字母。下面取一组代表性数值：边长 $h = 0.2\,\mathrm{m}$，磁感应强度 $B_0 = 0.1\,\mathrm{T}$，初速度 $v = 1\,\mathrm{m/s}$，电阻 $R = 2\,\Omega$，时间 $\tau = 0.1\,\mathrm{s}$。质量取 $m = 0.1\,\mathrm{kg}$，只用来演示 $0 \sim \tau$ 的减速，题目没有给质量，答案不依赖它。俯视图不按比例。

设区域Ⅰ的左边界为 $x = 0$，向右为正。ab 边的位置就是 $x$：cd 边在 $x + h$。区域Ⅰ占 $0 \le x < h$，区域Ⅱ占 $h \le x < 2h$。$t = 0$ 时 ab 刚跨过左边界；$t = \tau$ 时 ab 到 $h/2$ 处，速度近似为零，之后线框被固定。

## 完整解答

### （1）$t = 0$ 时的安培力

刚跨过左边界时，只有 ab 边在区域Ⅰ里切割磁感线，cd 边还在磁场外。区域Ⅰ的磁感应强度是 $2B_0$，方向向里，感应电动势

$$
E = 2B_0\, h\, v
$$

回路电流

$$
I = \frac{2B_0 h v}{R}
$$

由右手定则，电流沿 ab 从 b 流向 a，再经 ad、dc、cb 回到 b。由左手定则，ab 边受安培力向左，阻碍线框进入磁场，大小

$$
F = 2B_0\, I\, h = \frac{4 B_0^2 h^2 v}{R}
$$

代入代表性数值

$$
\boxed{F = \dfrac{4\times 0.1^2\times 0.2^2\times 1}{2} = 8\times 10^{-4}\,\mathrm{N}}
$$

方向水平向左。

### （2）$t = 1.2\tau$ 时的磁通量

$\tau$ 之后线框固定：ab 在 $x = h/2$，cd 在 $x = 3h/2$。线框左半边长 $h/2$、宽 $h$，面积 $h^2/2$，在区域Ⅰ；右半同样面积 $h^2/2$，在区域Ⅱ。

$t = 1.2\tau$ 在 $\tau \sim 2\tau$ 内。区域Ⅰ的磁感应强度从 $2B_0$ 线性降到 $0$，此时已过去 $0.2\tau$，还剩 $0.8\tau$，所以

$$
B_\mathrm{Ⅰ} = 2B_0 \times \frac{2\tau - 1.2\tau}{\tau} = 1.6\, B_0
$$

区域Ⅱ仍是 $B_0$，方向向外，与区域Ⅰ相反。取向里为正，穿过线框的磁通量

$$
\varphi = B_\mathrm{Ⅰ}\cdot \frac{h^2}{2} - B_0\cdot \frac{h^2}{2} = \left(0.8 B_0 - 0.5 B_0\right) h^2 = 0.3\, B_0 h^2
$$

代入代表性数值

$$
\boxed{\varphi = 0.3\times 0.1\times 0.2^2 = 1.2\times 10^{-3}\,\mathrm{Wb}}
$$

方向向里。

### （3）$2\tau \sim 3\tau$ 的焦耳热

这一段线框仍然固定。区域Ⅰ的磁感应强度已经是 $0$，区域Ⅱ从 $B_0$ 线性降到 $0$，方向不变。只有线框右半的磁通量在变，感应电动势大小恒定

$$
E = \frac{\Delta \varphi}{\Delta t} = \frac{B_0 \cdot h^2/2}{\tau} = \frac{B_0 h^2}{2\tau}
$$

热量

$$
Q = \frac{E^2}{R}\,\tau = \frac{B_0^2 h^4}{4 R \tau}
$$

代入代表性数值

$$
\boxed{Q = \dfrac{0.1^2\times 0.2^4}{4\times 2\times 0.1} = 2.0\times 10^{-5}\,\mathrm{J}}
$$

## 交互演示

拖动时间，先看线框从左边界滑入区域Ⅰ，再看固定之后两区磁场依次减弱。$0 \sim \tau$ 的速度、电流和位移由运动积分算出，不是手写解析式；$\tau$ 之后按题目把线框固定在 $x = h/2$。滑动阶段的质量只决定减得快慢，不改变三问的答案。

<Param name="h" label="边长" symbol="h" value={0.2} min={0.1} max={0.4} step={0.02} unit="m" />

<Param name="B0" label="磁感应强度 B_0" symbol="B_0" value={0.1} min={0.04} max={0.3} step={0.01} unit="T" color="field" />

<Param name="v0" label="初速度" symbol="v" value={1} min={0.4} max={2} step={0.1} unit="m/s" color="velocity" />

<Param name="R" label="电阻" symbol="R" value={2} min={0.5} max={6} step={0.1} unit="Ω" />

<Param name="tau" label="时间 τ" symbol="τ" value={0.1} min={0.05} max={0.3} step={0.01} unit="s" />

<Param name="m" label="演示用质量" symbol="m" value={0.1} min={0.04} max={0.4} step={0.02} unit="kg" />

<Param name="t" label="时间" symbol="t" value={0} min={0} max="3*tau" step={0.001} unit="s" />

<Define name="F0" expr="4*B0*B0*h*h*v0/R" />

<Define name="phiMid" expr="0.3*B0*h*h" />

<Define name="Qlate" expr="B0*B0*h*h*h*h/(4*R*tau)" />

<Define name="B1now" expr="t < tau ? 2*B0 : (t < 2*tau ? 2*B0*(2*tau - t)/tau : 0)" />

<Define name="B2now" expr="t < 2*tau ? B0 : (t < 3*tau ? B0*(3*tau - t)/tau : 0)" />

<Define name="xNow" expr="t <= tau ? loop.x(t) : h/2" />

<Define name="vNow" expr="t <= tau ? loop.v(t) : 0" />

<Define name="phiNow" expr="t <= tau ? loop.phi(t) : (B1now - B2now)*h*h/2" />

<Define name="Ishow" expr="loop.I(t)" />

<Define name="Qshow" expr="loop.Q(t)" />

<Motion name="loop" until="3*tau" mass="m" along={0} steps={6000}
  state={{x: 0, v: "v0", Q: 0, phi: "2*B0*h*h", held: 0}}
  rates={{
    Q: "I*I*R",
    phi: "(1 - held)*((t < tau ? 2*B0 : 0)*h*max(v, 0) - (x > 0 and x < h ? B0*h*max(v, 0) : 0))",
    v: "held > 0.5 ? -v*6000/(3*tau) : v"
  }}
  forces={[{label: "F", angle: 180, magnitude: "held < 0.5 ? abs(I)*h*((t < tau ? 2*B0 : (t < 2*tau ? 2*B0*(2*tau - t)/tau : 0)) + (x > 0 and x < h ? (t < 2*tau ? B0 : (t < 3*tau ? B0*(3*tau - t)/tau : 0)) : 0)) : 0"}]}
  events={[{name: "tHold", when: "t - tau", dir: "up", set: {v: 0, x: "h/2", held: 1}}]}
  circuit={{
    source: {series: [
      {type: "battery", label: "Ⅰ区", emf: "(t < tau ? 2*B0 : (t < 2*tau ? 2*B0*(2*tau - t)/tau : 0))*h*max(v, 0)*(1 - held) + h*(h - min(max(x, 0), h))*(t > tau and t < 2*tau ? 2*B0/tau : 0)", r: "R/2"},
      {type: "battery", label: "Ⅱ区", emf: "(t < 2*tau ? B0 : (t < 3*tau ? B0*(3*tau - t)/tau : 0))*h*max(v, 0)*(1 - held) + h*min(max(x, 0), h)*(t > 2*tau and t < 3*tau ? B0/tau : 0)", r: "R/2", positive: "right", read: "I"}
    ]},
    load: {type: "wire"}
  }}
  read={{
    xEnd: "x @ tEnd",
    Qend: "Q @ tEnd"
  }}
/>


<Question text="（1）t = 0 时线框受的安培力" set={{t: 0}} hint="只有 ab 在 2B_0 里切割，F = 4 B_0² h² v / R，向左" />

<Question text="（2）t = 1.2τ 时穿过线框的磁通量" set={{t: "1.2*tau"}} hint="左半 1.6 B_0、右半 B_0，方向相反，φ = 0.3 B_0 h²" />

<Question text="（3）2τ ~ 3τ 线框中的焦耳热" set={{t: "3*tau"}} hint="只有Ⅱ区磁通量变，Q = B_0² h⁴ / (4 R τ)" />

<Preset label="t = 0：刚跨过左边界" set={{t: 0, h: 0.2, B0: 0.1, v0: 1, R: 2, tau: 0.1, m: 0.1}} />

<Preset label="t = τ：固定在 h/2" set={{t: "tau"}} />

<Preset label="t = 1.2τ：求磁通量" set={{t: "1.2*tau"}} />

<Preset label="t = 3τ：两区都减到 0" set={{t: "3*tau"}} />

<Status cases={[
  {when: "t < 1e-4", label: "刚跨过左边界：只有 ab 切割，安培力向左", tone: "info"},
  {when: "t < tau", label: "滑入区域Ⅰ：安培力阻碍运动，速度在减小", tone: "neutral"},
  {when: "t < 2*tau", label: "已固定：Ⅰ区磁感应强度线性减小", tone: "warning"},
  {when: "t < 3*tau", label: "已固定：Ⅱ区磁感应强度线性减小", tone: "warning"},
  {label: "两区磁场都已减到 0", tone: "success"}
]} />

<Readout items={[
  {label: "ab 的位置", symbol: "x", expr: "xNow", unit: "m", digits: 3},
  {label: "速度", symbol: "v", expr: "vNow", unit: "m/s", digits: 3, color: "velocity"},
  {label: "Ⅰ区磁感应强度", symbol: "B_Ⅰ", expr: "B1now", unit: "T", digits: 3, color: "field"},
  {label: "Ⅱ区磁感应强度", symbol: "B_Ⅱ", expr: "B2now", unit: "T", digits: 3, color: "field"},
  {label: "磁通量（向里为正）", symbol: "φ", expr: "phiNow", unit: "Wb", digits: 5, color: "field"},
  {label: "回路电流", symbol: "I", expr: "Ishow", unit: "A", digits: 4, color: "charge"},
  {label: "累积焦耳热", symbol: "Q", expr: "Qshow", unit: "J", digits: 7, color: "force"}
]} />

<Answer items={[
  {label: "t = 0 的安培力", symbol: "F", expr: "F0", value: 0.0008, unit: "N", digits: 5},
  {label: "t = 1.2τ 的磁通量", symbol: "φ", expr: "phiMid", value: 0.0012, unit: "Wb", digits: 5},
  {label: "2τ ~ 3τ 的焦耳热", symbol: "Q", expr: "Qlate", value: 0.00002, unit: "J", digits: 6}
]} />

<Sim title="两区磁场中的线框" height={360} duration="3*tau" time="t" playSeconds={9}
  params={["loop", "h", "B0", "v0", "R", "tau", "B1now", "B2now", "xNow", "vNow", "phiNow", "Ishow"]}
  marks={[
    {t: 0, label: "跨过左边界"},
    {t: "tau", label: "固定在 h/2"},
    {t: "1.2*tau", label: "t = 1.2τ"},
    {t: "2*tau", label: "Ⅰ区减到 0"},
    {t: "3*tau", label: "Ⅱ区减到 0"}
  ]}
  hud={[
    {symbol: "x", expr: "xNow", unit: "m", digits: 3},
    {symbol: "φ", expr: "phiNow", unit: "Wb", digits: 5},
    {symbol: "I", expr: "Ishow", unit: "A", digits: 4}
  ]}
  legend={[
    {kind: "velocity", label: "速度"},
    {kind: "force", label: "安培力"},
    {kind: "field", label: "磁场"}
  ]}
  note="俯视，不按比例。× 向里，⊙ 向外。质量只用来演示 0 ~ τ 的减速。">
sim({
  at(t, p) {
    const st = p.loop.state(t)
    const b1 = t < p.tau ? 2 * p.B0 : (t < 2 * p.tau ? 2 * p.B0 * (2 * p.tau - t) / p.tau : 0)
    const b2 = t < 2 * p.tau ? p.B0 : (t < 3 * p.tau ? p.B0 * (3 * p.tau - t) / p.tau : 0)
    return { x: st.x, v: st.v, b1, b2, sliding: t <= p.tau, I: st.I }
  },
  draw(ctx, s, v) {
    const h = v.p.h
    const m = v.view({ xmin: -0.45 * h, xmax: 2.7 * h, ymin: -0.85 * h, ymax: 1.55 * h, pad: 28 })
    const y0 = 0
    v.field(m, 0, y0, h, y0 + h, { dir: 'in', step: 26 })
    v.field(m, h, y0, 2 * h, y0 + h, { dir: 'out', step: 26 })
    v.dim(m, 0, y0 - 0.28 * h, h, y0 - 0.28 * h, 'h')
    v.dim(m, h, y0 - 0.28 * h, 2 * h, y0 - 0.28 * h, 'h')
    v.label(m, h / 2, y0 + h + 0.2 * h, 'Ⅰ')
    v.label(m, 1.5 * h, y0 + h + 0.2 * h, 'Ⅱ')
    v.label(m, h / 2, y0 + 0.5 * h, '2B_0')
    v.label(m, 1.5 * h, y0 + 0.5 * h, 'B_0')
    const x = Math.min(Math.max(s.x, 0), h)
    v.bar(m, x, y0, x, y0 + h, { thick: 6 })
    v.bar(m, x + h, y0, x + h, y0 + h, { thick: 6 })
    v.bar(m, x, y0, x + h, y0, { thick: 6 })
    v.bar(m, x, y0 + h, x + h, y0 + h, { thick: 6 })
    v.label(m, x - 0.1 * h, y0 + h, 'a')
    v.label(m, x - 0.1 * h, y0, 'b')
    v.label(m, x + h + 0.1 * h, y0, 'c')
    v.label(m, x + h + 0.1 * h, y0 + h, 'd')
    if (s.v > 0.02) v.vec(m, x + 0.5 * h, y0 + 0.5 * h, 0.35 * h, 0, { kind: 'velocity', label: 'v' })
    if (s.sliding && Math.abs(s.I) > 1e-4) {
      v.vec(m, x, y0 + 0.5 * h, -0.32 * h, 0, { kind: 'force', label: 'F' })
    }
  },
})
</Sim>

<Plot title="两区磁感应强度" size="wide" caption="向里为正。Ⅱ区向外，画在负半轴。"
  x={{name: "tt", label: "t", unit: "s", min: 0, max: "3*tau"}}
  y={{label: "B", unit: "T", min: "-1.3*B0", max: "2.4*B0"}}
  series={[
    {label: "Ⅰ", expr: "tt < tau ? 2*B0 : (tt < 2*tau ? 2*B0*(2*tau - tt)/tau : 0)", color: "field"},
    {label: "Ⅱ", expr: "tt < 2*tau ? -B0 : (tt < 3*tau ? -B0*(3*tau - tt)/tau : 0)", color: "field", dash: true}
  ]}
  marks={[
    {x: 0, label: "t = 0"},
    {x: "tau", label: "固定"},
    {x: "1.2*tau", label: "1.2τ"},
    {x: "2*tau", label: "Ⅰ 到 0"},
    {x: "3*tau", label: "Ⅱ 到 0"}
  ]}
  cursor="t"
/>

<Plot title="磁通量与电流" size="narrow" caption="磁通量向里为正。滑动阶段由运动积分给出。"
  x={{name: "tt", label: "t", unit: "s", min: 0, max: "3*tau"}}
  y={{label: "φ / Wb，I / A"}}
  series={[
    {label: "φ", expr: "tt <= tau ? loop.phi(tt) : ((tt < 2*tau ? 2*B0*(2*tau - tt)/tau : 0) - (tt < 2*tau ? B0 : (tt < 3*tau ? B0*(3*tau - tt)/tau : 0)))*h*h/2", color: "field"},
    {label: "I", expr: "loop.I(tt)", color: "charge", dash: true}
  ]}
  marks={[
    {x: 0, label: "刚进入"},
    {x: "1.2*tau", label: "求 φ"},
    {x: "2*tau", label: "Ⅱ区开始减小"}
  ]}
  cursor="t"
/>

## 结合图像看关键时刻

$0 \sim \tau$：两区磁场都不变。线框向右滑入区域Ⅰ，ab 始终切割 $2B_0$，cd 边进入区域Ⅱ之后还切割 $B_0$，两份电动势方向相同。安培力向左，速度不断减小。题目给定 $\tau$ 时刻速度近似为零并把线框固定，演示里的质量只决定这一段减得快慢，到不到零由积分判断。

$\tau \sim 2\tau$：线框不动，左右各占 $h^2/2$。区域Ⅰ从 $2B_0$ 线性降到 $0$，区域Ⅱ保持 $B_0$。磁通量随区域Ⅰ的磁感应强度一起变小。$t = 1.2\tau$ 时区域Ⅰ还剩 $1.6B_0$，两份相减得到 $0.3 B_0 h^2$。

$2\tau \sim 3\tau$：区域Ⅰ已经是 $0$，只有区域Ⅱ从 $B_0$ 降到 $0$。电动势恒定，热量按 $E^2\tau/R$ 累积，就是 $B_0^2 h^4/(4R\tau)$。

## 答案汇总

代表性数值 $h = 0.2\,\mathrm{m}$、$B_0 = 0.1\,\mathrm{T}$、$v = 1\,\mathrm{m/s}$、$R = 2\,\Omega$、$\tau = 0.1\,\mathrm{s}$：

（1）$t = 0$ 时安培力 $\boxed{F = 4 B_0^2 h^2 v / R = 8\times 10^{-4}\,\mathrm{N}}$，方向水平向左。

（2）$t = 1.2\tau$ 时磁通量 $\boxed{\varphi = 0.3\, B_0 h^2 = 1.2\times 10^{-3}\,\mathrm{Wb}}$，方向向里。

（3）$2\tau \sim 3\tau$ 的焦耳热 $\boxed{Q = B_0^2 h^4 / (4 R \tau) = 2.0\times 10^{-5}\,\mathrm{J}}$。
