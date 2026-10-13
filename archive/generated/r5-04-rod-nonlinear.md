---
id: r5-04-rod-nonlinear
title: 金属棒下落：非线性元件与开关突变
subject: physics
topic: 电磁感应与动力学
source: 2021 湖北卷 16 题（15 分）
question: |
  两根不计电阻、间距为 L 的足够长平行光滑金属导轨，竖直固定在匀强磁场中，磁场方向垂直于导轨平面向里，磁感应强度大小为 B。导轨上端串联非线性电子元件 Z 和阻值为 R 的电阻，开关 S 与元件 Z 并联（闭合 S 时 Z 被短路）。元件 Z 的 U-I 图像为：电流从 0 增大到 I₀ 的过程中，电压从 0 线性增大到 Um；电流大于或等于 I₀ 时，电压稳定为 Um。已知 Um = mgR/(2BL)，且 I₀ < mg/(2BL)。质量为 m、不计电阻的金属棒可沿导轨运动，运动中金属棒始终水平且与导轨保持良好接触。忽略空气阻力及回路中的电流对原磁场的影响，重力加速度为 g，计算结果只能用 m、g、B、L、R 表示。
  (1) 闭合开关 S，由静止释放金属棒，求金属棒下落的最大速度 v₁；
  (2) 断开开关 S，由静止释放金属棒，求金属棒下落的最大速度 v₂；
  (3) 先闭合开关 S，由静止释放金属棒，金属棒达到最大速度后，再断开开关 S。忽略回路中电流突变的时间，求 S 断开瞬间金属棒的加速度大小 a。
answers:
  - { name: v1, value: 10, unit: m/s }
  - { name: v2, value: 15, unit: m/s }
  - { name: aAnswer, value: 5, unit: m/s² }
---

## 一、题目条件分析

取竖直向下为运动的正方向。金属棒下落时，感应电动势为

$$
\boxed{\mathcal E=BLv}.
$$

由右手定则，棒中的电流从左向右；由左手定则，棒受到的安培力竖直向上。因此

$$
\boxed{F_{\mathrm A}=BLI},\qquad
\boxed{ma=mg-BLI}.
$$

速度增大，感应电流增大，安培力随之增大。当安培力与重力平衡时，速度达到极限。三种情形都要先判断元件 Z 所处的工作区间：

$$
U_Z(I)=
\begin{cases}
\dfrac{U_m}{I_0}I,&0\le I<I_0,\\[4pt]
U_m,&I\ge I_0.
\end{cases}
$$

闭合 S 时，Z 被短路；断开 S 时，Z 与 R 串联。

> “最大速度”是长时间下落的极限速度。理想模型中，从静止释放后速度渐近趋于这个值，有限时刻并不恰好达到。

## 二、完整解答

### （1）闭合 S，由静止释放

此时回路中只有电阻 R：

$$
I=\frac{BLv}{R}.
$$

代入牛顿第二定律：

$$
ma=mg-\frac{B^2L^2}{R}v.
$$

初始时电流为零，棒以加速度 g 开始下落。随着速度增大，加速度逐渐减小，直到趋于零。因此

$$
mg=\frac{B^2L^2}{R}v_1,
$$

得到

$$
\boxed{v_1=\frac{mgR}{B^2L^2}}.
$$

相应的稳态电流为

$$
\boxed{I_*=\frac{mg}{BL}}.
$$

### （2）断开 S，由静止释放

速度达到极限时，仍须满足受力平衡：

$$
BLI=mg
\quad\Rightarrow\quad
I=I_*=\frac{mg}{BL}.
$$

题目给出

$$
I_0<\frac{mg}{2BL}=\frac{I_*}{2},
$$

所以极限状态必有 $I_*>I_0$，元件 Z 位于稳压区。

还要确认棒确实能经过线性区。当电流刚达到 $I_0$ 时，

$$
a_0=g-\frac{BLI_0}{m}>\frac g2>0.
$$

此时棒仍在加速，不会停留在线性区形成稳态。

稳压区内，回路电压关系为

$$
BLv=IR+U_m.
$$

在极限状态代入 $I=mg/(BL)$ 及题给 $U_m$：

$$
BLv_2
=\frac{mgR}{BL}+\frac{mgR}{2BL}
=\frac{3mgR}{2BL}.
$$

因此

$$
\boxed{v_2=\frac{3mgR}{2B^2L^2}=\frac32v_1}.
$$

### （3）达到闭合时的最大速度后，再断开 S

断开前：

$$
v=v_1,\qquad I_{\text{前}}=I_*.
$$

开关改变连接方式可以使电流突变，但金属棒的速度不能突变。因此断开瞬间

$$
\boxed{v_{\text{后}}=v_1},\qquad
\boxed{\mathcal E_{\text{后}}=BLv_1=\frac{mgR}{BL}}.
$$

先按 Z 位于稳压区求电流：

$$
I_{\text{后}}
=\frac{BLv_1-U_m}{R}
=\frac{1}{R}
\left(\frac{mgR}{BL}-\frac{mgR}{2BL}\right)
=\frac{mg}{2BL}.
$$

由于题给 $I_0<mg/(2BL)$，算出的电流确实大于 $I_0$，稳压区假设成立：

$$
\boxed{I_{\text{后}}=\frac{mg}{2BL}=\frac12I_*}.
$$

于是安培力降为

$$
\boxed{F_{\mathrm A,\text{后}}=BLI_{\text{后}}=\frac12mg}.
$$

由牛顿第二定律，

$$
ma=mg-\frac12mg,
$$

得到

$$
\boxed{a=\frac g2},
$$

方向竖直向下。

> **关键区别**：断开瞬间，速度连续，电流与加速度发生突变。随后棒继续加速，速度从 $v_1$ 渐近趋于 $v_2$。

## 三、交互演示

题目只给字母，以下用代表性数值驱动画面：

$$
m=1\ \mathrm{kg},\quad g=10\ \mathrm{m/s^2},\quad
B=1\ \mathrm T,\quad L=1\ \mathrm m,\quad R=1\ \Omega.
$$

它们仅用于演示和数值校验，不是题目新增条件。此时 $v_1=10\ \mathrm{m/s}$、$v_2=15\ \mathrm{m/s}$、$a=5\ \mathrm{m/s^2}$。

图像主要采用无量纲量：

$$
\frac{v}{v_1},\qquad \frac{I}{I_*},\qquad \frac ag,
\qquad
\tau=\frac{mR}{B^2L^2}.
$$

缺失的转折电流用滑块控制：

$$
\eta=\frac{I_0}{I_*},\qquad 0<\eta<\frac12.
$$

$U_m$ 与 $I_0$ 均由公式自动计算，始终满足题目约束。

<Param name="m" label="演示质量 m" value={1} min={1} max={1} step={1} unit="kg" hidden />

<Param name="g" label="演示重力加速度 g" value={10} min={10} max={10} step={1} unit="m/s²" hidden />

<Param name="B" label="演示磁感应强度 B" value={1} min={1} max={1} step={1} unit="T" hidden />

<Param name="L" label="演示导轨间距 L" value={1} min={1} max={1} step={1} unit="m" hidden />

<Param name="R" label="演示电阻 R" value={1} min={1} max={1} step={1} unit="Ω" hidden />

<Param name="eta" label="缺失变量：I₀/I*" value={0.2} min={0.05} max={0.45} step={0.01} />

<Param name="mode" label="实验情形" options={[{value: 1, label: "① 闭合 S，静止释放"}, {value: 2, label: "② 断开 S，静止释放"}, {value: 3, label: "③ 已达 v₁，再断开 S"}]} value={1} />

<Param name="t" label="观察时间" value={0} min={0} max={8} step={0.001} unit="s" hidden />

<Define name="G" expr="m*g" />

<Define name="Istar" expr="m*g/(B*L)" />

<Define name="Um" expr="m*g*R/(2*B*L)" />

<Define name="I0" expr="eta*Istar" />

<Define name="v1" expr="m*g*R/(B^2*L^2)" />

<Define name="v2" expr="3*m*g*R/(2*B^2*L^2)" />

<Define name="aAnswer" expr="g/2" />

<Define name="tau" expr="m*R/(B^2*L^2)" />

<Define name="h" expr="1 + 1/(2*eta)" />

<Define name="wThreshold" expr="eta + 0.5" />

<Define name="tThreshold" expr="-tau*h*log(1-eta)" />

<Define name="tSwitch" expr="2*tau" />

<Define name="tEnd" expr="8*tau" />

<Define name="u" expr="t/tau" />

<Define name="w" expr="mode == 1 ? 1-exp(-u) : (mode == 2 ? (t < tThreshold ? h*(1-exp(-u/h)) : 1.5-(1.5-wThreshold)*exp(-(t-tThreshold)/tau)) : (t < tSwitch ? 1 : 1.5-0.5*exp(-(t-tSwitch)/tau)))" />

<Define name="closed" expr="mode == 1 or (mode == 3 and t < tSwitch) ? 1 : 0" />

<Define name="j" expr="closed == 1 ? w : (w < wThreshold ? w/h : w-0.5)" />

<Define name="I" expr="Istar*j" />

<Define name="vCurrent" expr="v1*w" />

<Define name="Ecurrent" expr="B*L*vCurrent" />

<Define name="UR" expr="I*R" />

<Define name="UZ" expr="closed == 1 ? 0 : min(Um, Um*I/I0)" />

<Define name="FA" expr="B*L*I" />

<Define name="aCurrent" expr="g*(1-j)" />

情形③从“棒已处于闭合稳态”开始观察，前段由静止释放的过程见情形①。观察开始后先保持闭合 $2\tau$，再断开 S；这段等待长度只是动画安排，不影响断开瞬间的答案。

前两问的最大速度对应无限长时间，按钮跳到接近极限的观察时刻；下方答案读数显示精确极限值。

<Preset label="重新观察①：闭合释放" set={{mode: 1, t: 0}} />

<Preset label="（1）答案：观察逼近 v₁" set={{mode: 1, t: "tEnd"}} />

<Preset label="重新观察②：断开释放" set={{mode: 2, t: 0}} />

<Preset label="② Z 开始稳压" set={{mode: 2, t: "tThreshold"}} />

<Preset label="（2）答案：观察逼近 v₂" set={{mode: 2, t: "tEnd"}} />

<Preset label="③ 断开前：已达 v₁" set={{mode: 3, t: 0}} />

<Preset label="（3）答案：断开瞬间 a=g/2" set={{mode: 3, t: "tSwitch"}} />

<Status cases={[
  {when: "mode == 3 and abs(t-tSwitch) < 1e-6", label: "刚断开：速度为 v₁，电流降至 I*/2，加速度为 g/2", tone: "warning"},
  {when: "mode == 3 and t < tSwitch", label: "闭合稳态：速度 v₁，安培力与重力平衡", tone: "success"},
  {when: "closed == 1", label: "S 闭合：Z 被短路", tone: "info"},
  {when: "abs(I-I0) < 1e-6", label: "转折点：I=I₀，Z 开始稳压", tone: "warning"},
  {when: "I < I0", label: "S 断开：Z 处于线性区", tone: "info"},
  {label: "S 断开：Z 处于稳压区，速度继续趋于 v₂", tone: "success"}
]} />

<Sim
  title="金属棒下落：速度连续与电流突变"
  height={440}
  duration="tEnd"
  time="t"
  params={["mode", "eta", "tau", "h", "wThreshold", "tThreshold", "tSwitch", "v1"]}
  hud={[
    {symbol: "v", expr: "w", unit: "v₁", digits: 3},
    {symbol: "I", expr: "j", unit: "I*", digits: 3},
    {symbol: "a", expr: "aCurrent/g", unit: "g", digits: 3}
  ]}
  legend={[
    {kind: "velocity", symbol: "v", label: "速度"},
    {kind: "force", symbol: "F", label: "力"},
    {kind: "charge", symbol: "I", label: "电流 · 越密越大"},
    {kind: "field", symbol: "B", label: "磁场（向里）"}
  ]}
  note="下落位移采用压缩映射，不按比例；虚线棒是释放位置。电流点的流速与 I 成正比。"
  marks={[
    {t: 0, label: "开始观察"},
    {t: "mode == 2 ? tThreshold : 0/0", label: "Z 开始稳压"},
    {t: "mode == 3 ? tSwitch : 0/0", label: "断开 S"},
    {t: "tEnd", label: "接近最终极限"}
  ]}
>
sim({
  at(t, p) {
    const u = t / p.tau
    let w = 0
    let X = 0
    let closed = false

    if (p.mode === 1) {
      const q = Math.exp(-u)
      w = 1 - q
      X = u - 1 + q
      closed = true
    } else if (p.mode === 2) {
      const uc = p.tThreshold / p.tau
      if (t < p.tThreshold) {
        w = p.h * (1 - Math.exp(-u / p.h))
        X = p.h * u - p.h * w
      } else {
        const du = u - uc
        const q = Math.exp(-du)
        const Xc = p.h * uc - p.h * p.wThreshold
        w = 1.5 - (1.5 - p.wThreshold) * q
        X = Xc + 1.5 * du - (1.5 - p.wThreshold) * (1 - q)
      }
    } else {
      const us = p.tSwitch / p.tau
      if (t < p.tSwitch) {
        w = 1
        X = u
        closed = true
      } else {
        const du = u - us
        const q = Math.exp(-du)
        w = 1.5 - 0.5 * q
        X = us + 1.5 * du - 0.5 * (1 - q)
      }
    }

    const j = closed ? w : (w < p.wThreshold ? w / p.h : w - 0.5)
    return { w, X, j, closed }
  },
  draw(ctx, s, v) {
    const p = v.p
    const m = v.view({ xmin: -2.2, xmax: 4.6, ymin: -2.5, ymax: 4.5, pad: 16 })
    const yOf = (X) => 2.4 - 4.1 * X / (1 + X)
    const y = yOf(s.X)
    const yTop = 3.3
    const ySw = 3.85
    const nL = 1.0
    const nR = 1.8
    const wire = { color: v.color.ink, width: 1.6 }

    v.field(m, -0.55, -2.3, 2.55, 3.0, { dir: 'in', step: 40 })
    v.text(m, 2.8, 2.75, 'B', { align: 'left', color: v.color.field, size: 14 })

    // 顶端回路：左导轨 — R — (Z ∥ S) — 右导轨
    v.line(m, 0, 3.0, 0, yTop, wire)
    v.line(m, 2, 3.0, 2, yTop, wire)
    v.line(m, 0, yTop, 2, yTop, wire)
    v.line(m, nL, yTop, nL, ySw, wire)
    v.line(m, nR, yTop, nR, ySw, wire)
    v.line(m, nL, ySw, nR, ySw, wire)
    v.element(m, 0.48, yTop, 'resistor', { label: 'R' })
    v.element(m, (nL + nR) / 2, ySw, 'resistor', { label: 'Z（非线性）' })
    v.element(m, (nL + nR) / 2, yTop, 'switch', { closed: s.closed, label: 'S', place: 'below', offset: 8 })
    v.label(m, nR, yTop, s.closed ? '闭合：Z 被短路' : '断开：电流流经 Z', { place: 'right', offset: 12, color: v.color.graphite, background: false })
    for (const [xx, yy] of [[nL, yTop], [nR, yTop]]) v.circle(m, xx, yy, 3.5, { px: true, fill: v.color.ink })

    v.bar(m, 0, -2.3, 0, 3.0, { thick: 6 })
    v.bar(m, 2, -2.3, 2, 3.0, { thick: 6 })
    v.dim(m, 0, -2.45, 2, -2.45, 'L', { offset: 0 })

    if (s.j > 1e-3) {
      const loop = [[0, y], [2, y], [2, yTop], [nR, yTop]]
      if (s.closed) loop.push([nL, yTop])
      else loop.push([nR, ySw], [nL, ySw], [nL, yTop])
      loop.push([0, yTop], [0, y])
      v.particles(m, loop, { speed: 70 * s.j, gap: 16, kind: 'charge' })
    }

    if (s.X > 0.02) v.line(m, -0.14, yOf(0), 2.14, yOf(0), { color: v.color.steel, width: 1.2, dash: [4, 4] })
    v.bar(m, -0.14, y, 2.14, y, { thick: 10 })
    v.text(m, -0.7, y, '金属棒 m', { align: 'right', color: v.color.ink, size: 12 })

    v.vec(m, 0.7, y, 0, -0.95, { kind: 'force', label: 'mg' })
    if (s.j > 1e-3) v.vec(m, 1.3, y, 0, 0.95 * s.j, { kind: 'force', label: 'F_A' })
    if (s.w > 1e-3) v.vec(m, 2.55, y, 0, -0.85 * s.w, { kind: 'velocity', label: 'v' })

    if (p.mode === 2) v.event(m, 1, y, 'I = I₀：Z 开始稳压', { at: p.tThreshold, kind: 'charge' })
    if (p.mode === 3) v.event(m, 1, y, '断开 S：I 降为 I*/2，a = g/2', { at: p.tSwitch, kind: 'force' })
  },
})
</Sim>

精确的速度、加速度和转折关系见下面的读数与图像。

<Readout items={[
  {label: "观察时间 t/τ", expr: "t/tau", digits: 3},
  {label: "当前速度 v/v₁", expr: "w", digits: 4},
  {label: "当前电流 I/I*", expr: "j", digits: 4},
  {label: "当前加速度 a/g", expr: "aCurrent/g", digits: 4},
  {label: "元件电压 U_Z/U_m", expr: "UZ/Um", digits: 4}
]} />

<ForceDiagram
  title="金属棒受力：向下重力与向上安培力"
  surface={{type: "none"}}
  body={{shape: "rod", label: "金属棒 m"}}
  forces={[
    {label: "mg", angle: -90, magnitude: "G", showValue: true, unit: "N", digits: 2},
    {label: "F_A", angle: 90, magnitude: "FA", showValue: true, unit: "N", digits: 2}
  ]}
/>

<Circuit
  title="等效回路：S 与非线性元件 Z 并联"
  source={{series: [
    {type: "generator", label: "感应电源 BLv", note: {expr: "Ecurrent", unit: "V", prefix: "E = "}}
  ]}}
  load={{series: [
    {type: "resistor", label: "R", note: {expr: "UR", unit: "V", prefix: "U_R = "}},
    {parallel: [
      {type: "resistor", label: "Z（非线性）", note: {expr: "UZ", unit: "V", prefix: "U_Z = "}},
      {type: "switch", label: "S", closed: "closed"}
    ]}
  ]}}
  current={{expr: "I", unit: "A", label: "I"}}
/>

图中的 Z 用电阻框示意其位置，其电压由给定非线性关系计算。

<Plot
  title="Z 的 U-I 特性：改变 I₀，稳压值 U_m 保持不变"
  x={{name: "q", label: "I/I*", min: 0, max: 1.2}}
  y={{label: "U_Z/U_m", min: 0, max: 1.2}}
  series={[
    {label: "Z 的特性曲线", expr: "min(q/eta, 1)", color: "ink"}
  ]}
  marks={[
    {x: "eta", series: 0, label: "I₀：开始稳压"},
    {x: 0.5, series: 0, label: "第（3）问断开瞬间"},
    {x: 1, series: 0, label: "第（2）问最终稳态"}
  ]}
/>

<Plot
  title="速度比较：v₂/v₁ = 3/2"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "tEnd"}}
  y={{label: "v/v₁", min: 0, max: 1.65}}
  series={[
    {label: "① 闭合释放", expr: "1-exp(-s/tau)", color: "ink"},
    {label: "② 断开释放", expr: "s < tThreshold ? h*(1-exp(-s/(tau*h))) : 1.5-(1.5-wThreshold)*exp(-(s-tThreshold)/tau)", color: "velocity"},
    {label: "③ 从闭合稳态开始，2τ 时断开", expr: "s < tSwitch ? 1 : 1.5-0.5*exp(-(s-tSwitch)/tau)", color: "graphite", dash: true},
    {label: "v₁：归一化值 1", expr: "1", color: "steel", dash: true},
    {label: "v₂：归一化值 1.5", expr: "1.5", color: "steel", dash: true}
  ]}
  marks={[
    {x: "tThreshold", series: 1, label: "② Z 开始稳压"},
    {x: "tSwitch", series: 2, label: "③ 断开 S，速度连续"}
  ]}
  cursor="t"
/>

<Plot
  title="加速度比较：断开瞬间从 0 跳到 g/2"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "tEnd"}}
  y={{label: "a/g", min: 0, max: 1.05}}
  series={[
    {label: "① 闭合释放", expr: "exp(-s/tau)", color: "ink"},
    {label: "② 断开释放", expr: "s < tThreshold ? exp(-s/(tau*h)) : (1.5-wThreshold)*exp(-(s-tThreshold)/tau)", color: "accel"},
    {label: "③ 稳态后断开", expr: "s < tSwitch ? 0 : 0.5*exp(-(s-tSwitch)/tau)", color: "graphite", dash: true}
  ]}
  marks={[
    {x: "tThreshold", series: 1, label: "② 加速度连续"},
    {x: "tSwitch", series: 2, label: "③ 刚断开：a/g = 0.5"}
  ]}
  cursor="t"
/>

<Readout items={[
  {label: "（1）精确极限速度 v₁", expr: "v1", unit: "m/s", digits: 2},
  {label: "（2）精确极限速度 v₂", expr: "v2", unit: "m/s", digits: 2},
  {label: "（3）断开瞬间加速度", expr: "aAnswer", unit: "m/s²", digits: 2},
  {label: "最大速度之比 v₂/v₁", expr: "v2/v1", digits: 2}
]} />

## 四、结合图像理解关键时刻

### 1. 断开释放：为什么转折点不是最大速度？

令 $\eta=I_0/I_*$。Z 在线性区时相当于阻值为 $U_m/I_0$ 的元件，回路总电阻为

$$
R_{\mathrm{线性}}
=R+\frac{U_m}{I_0}
=\boxed{R\left(1+\frac{1}{2\eta}\right)}.
$$

记 $h=1+1/(2\eta)$。由静止释放后，线性区的速度为

$$
\boxed{\frac{v(t)}{v_1}
=h\left(1-e^{-t/(\tau h)}\right)}.
$$

在 $I=I_0$ 处，

$$
BLv_{\mathrm c}=I_0R+U_m,
$$

所以

$$
\boxed{\frac{v_{\mathrm c}}{v_1}=\eta+\frac12<1},
\qquad
\boxed{t_{\mathrm c}=-\tau h\ln(1-\eta)}.
$$

此刻

$$
\boxed{\frac{a_{\mathrm c}}g=1-\eta>\frac12}.
$$

因此转折点之后，棒仍然加速。速度和加速度均连续，改变的是它们随后趋近极限的规律。稳压区内：

$$
\boxed{\frac{v(t)}{v_1}
=\frac32-
\left(\frac32-\frac{v_{\mathrm c}}{v_1}\right)
e^{-(t-t_{\mathrm c})/\tau}}.
$$

拖动 $\eta$，可以看到转折点与早期运动改变，但最终速度始终为 $3v_1/2$。

### 2. 稳态后断开：什么连续，什么突变？

点击“（3）答案”按钮，观察同一瞬间：

| 物理量 | 断开前 | 刚断开 |
|---|---|---|
| 速度 | $v_1$ | $v_1$ |
| 感应电动势 | $BLv_1$ | $BLv_1$ |
| 电流 | $I_*$ | $I_*/2$ |
| 安培力 | $mg$ | $mg/2$ |
| 向下加速度 | $0$ | $g/2$ |

速度图像在断开处没有跳跃，但斜率由零变为 $g/2$；加速度图像则直接跳变。

以断开后的时间为 $\Delta t$，随后有

$$
\boxed{\frac{v}{v_1}
=\frac32-\frac12e^{-\Delta t/\tau}},
\qquad
\boxed{\frac ag=\frac12e^{-\Delta t/\tau}}.
$$

棒继续下落并加速，最终重新达到受力平衡。

### 3. 为什么答案不含 $I_0$？

第（2）问最终电流为 $I_*$，第（3）问断开瞬间电流为 $I_*/2$。题给不等式保证二者都位于稳压区，此时 Z 的电压只由 $U_m$ 决定。

$I_0$ 决定第（2）问早期线性区的运动及转折位置，不改变题目所求的三个结果。

## 五、答案汇总

| 小问 | 解析答案 | 代表性数值 |
|---|---|---|
| （1）闭合 S 时的最大速度 | $\boxed{v_1=\dfrac{mgR}{B^2L^2}}$ | $10\ \mathrm{m/s}$ |
| （2）断开 S 时的最大速度 | $\boxed{v_2=\dfrac{3mgR}{2B^2L^2}}$ | $15\ \mathrm{m/s}$ |
| （3）稳态后断开瞬间的加速度大小 | $\boxed{a=\dfrac g2}$，竖直向下 | $5\ \mathrm{m/s^2}$ |

三个结果均只含题目允许的 $m、g、B、L、R$。
