---
id: r6-08-wave-vibration
title: 简谐横波的波速、路程与传播方向
subject: physics
topic: 简谐横波
source: 2021 九江二中月考
question: |
  （2021·九江二中月考）一列简谐横波沿 x 轴传播。图甲为 t=1.0 s 时刻的波形图：波形为正弦曲线，振幅 A=0.2 m，波长 λ=4 m，可表示为 y=0.2 sin(πx/2) m（x 轴范围 0~9 m）。图乙为该波中质点 P 的振动图像：P 做简谐运动，振幅 0.2 m，周期 T=1.0 s，在 t=1.0 s 时刻 P 恰好经过平衡位置并向 y 轴负方向运动。已知 P 是 x=2 m 处的质点。
  (1) 求波速；
  (2) 求从 t=1.0 s 起再经过 3.5 s，质点 P 经过的路程；
  (3) 判断波沿 x 轴正方向还是负方向传播。
answers:
  - { name: vWave, value: 4, unit: "m/s" }
  - { name: sPath, value: 2.8, unit: m }
---

## 一、题目条件分析

横波沿 x 轴传播，各质点只在 y 方向振动。题目给了同一时刻的两张图：

- 图甲是 t = 1.0 s 的波形，振幅 A = 0.2 m，波长 λ = 4 m，解析式 y = 0.2 sin(πx/2) m，x 从 0 到 9 m。
- 图乙是质点 P 的振动图像，振幅仍是 0.2 m，周期 T = 1.0 s。t = 1.0 s 时 P 正在过平衡位置，速度指向 y 轴负方向。
- P 是 x = 2 m 处的质点。

先把 P 代进图甲，核对两张图说的是不是同一个状态：

$$
y(2) = 0.2\sin\left(\frac{\pi}{2}\times 2\right) = 0.2\sin\pi = 0
$$

P 正在平衡位置上，和图乙一致。图甲再往两侧各看 1 m：x = 1 m 是波峰 y = 0.2 m，x = 3 m 是波谷 y = −0.2 m。传播方向就由「此刻 P 向下运动」来判定。

t = 1.0 s 的波形取样：

| x / m | 0 | 1 | 2（P） | 3 | 4 |
|---|---|---|---|---|---|
| y / m | 0 | 0.2 | 0 | −0.2 | 0 |

三个要求：波速的大小、从 t = 1.0 s 再过 3.5 s 质点 P 的路程、波沿 x 轴正方向还是负方向。

## 二、完整解答

### （1）波速

图甲读出波长，图乙读出周期，波速大小

$$
v = \frac{\lambda}{T} = \frac{4}{1.0} = \boxed{4\ \text{m/s}}
$$

频率 f = 1/T = 1 Hz，同一结果 v = λf = 4 m/s。方向留到第（3）问，波速的大小是正数。

用角量核对：ω = 2π/T = 2π rad/s，k = 2π/λ = π/2 rad/m，v = ω/k = 4 m/s。

### （2）路程

质点做简谐运动，每个周期通过的路程是 4A，与起点在振动的哪一相位无关。

$$
4A = 4\times 0.2 = 0.8\ \text{m}
$$

从 t = 1.0 s 起再过 Δt = 3.5 s。因为 T = 1.0 s，这段时间正好是 3.5 个周期：

$$
s = 3.5\times 4A = 3.5\times 0.8 = \boxed{2.8\ \text{m}}
$$

3.5 不是整数，要说明多出来的半个周期为什么刚好是 2A。3 个整周期后，P 回到 t = 1.0 s 的状态：仍在平衡位置、仍向下运动，路程已经是 3 × 0.8 = 2.4 m。再过 T/2，质点从平衡位置走到一侧最大位移再回到平衡位置，路程是 A + A = 2A = 0.4 m。合计 2.4 + 0.4 = 2.8 m。

这段末了 P 的位移是 0，速度改为向上。路程 2.8 m 不是位移。

### （3）传播方向

用波形微平移。t = 1.0 s 的波形是 y = 0.2 sin(πx/2)。

若波沿 x 轴负方向传播，波形向左平移一小段 δ（δ > 0）。P 的新位移等于原来 x = 2 + δ 处的位移：

$$
y_{\text{新}}(2) = 0.2\sin\frac{\pi(2+\delta)}{2} = 0.2\sin\left(\pi + \frac{\pi\delta}{2}\right) = -0.2\sin\frac{\pi\delta}{2} < 0
$$

P 从平衡位置进入负位移，速度向 y 轴负方向，与图乙一致。

若波沿 x 轴正方向传播，波形向右平移 δ，P 的新位移等于原来 x = 2 − δ 处的位移：

$$
y_{\text{新}}(2) = 0.2\sin\frac{\pi(2-\delta)}{2} = 0.2\sin\frac{\pi\delta}{2} > 0
$$

P 会向上运动，与图乙不符。

带动法得到同一结论：x = 3 m 在 P 右侧、位于负位移，x = 1 m 在左侧、位于正位移。波向左传时，右侧质点带动 P，P 向下。

$$
\boxed{\text{沿 } x \text{ 轴负方向}}
$$

> 易错点：3.5 s 末位移回到 0，路程仍是 2.8 m。传播方向若按「向右」去推，P 在 t = 1.0 s 应向上，和图乙相反。

负方向的波动方程（t = 1.0 s 时回到图甲）是

$$
y = A\sin\left(\frac{2\pi}{\lambda}x + \frac{2\pi}{T}(t-1)\right)
$$

题目数据下就是 y = 0.2 sin(πx/2 + 2π(t − 1)) m。正方向则把括号里的时间项改成减号。画面和曲线都按这个式子画。

## 三、交互演示

侧栏滑块的初始值就是题目数据。传播方向先放在与图乙一致的负方向；点「假设沿正方向」可在同一张图甲上对照。波速 v = λ/T 和 3.5 s 内的路程跟着 A、λ、T 变。播放时，左上角的路程从 t = 1.0 s 起算，播到 4.5 s 就等于第（2）问。

<Param name="A" label="振幅" symbol="A" value={0.2} min={0.05} max={0.4} step={0.05} unit="m" color="velocity" />

<Param name="lambda" label="波长" symbol="λ" value={4} min={2} max={8} step={0.5} unit="m" color="velocity" />

<Param name="T" label="周期" symbol="T" value={1} min={0.5} max={2} step={0.1} unit="s" />

<Param name="dir" label="传播方向假设" options={[{value: -1, label: "沿 x 轴负方向"}, {value: 1, label: "沿 x 轴正方向"}]} value={-1} />

<Param name="t" label="时间" symbol="t" value={0} min={0} max={6} step={0.01} unit="s" hidden={true} />

<Define name="xP" expr="2" />

<Define name="k" expr="2*pi/lambda" />

<Define name="omega" expr="2*pi/T" />

<Define name="vWave" expr="lambda/T" />

<Define name="yP" expr="A*sin(k*xP - dir*omega*(t-1))" />

<Define name="vyP" expr="-dir*A*omega*cos(k*xP - dir*omega*(t-1))" />

<Define name="phi0" expr="k*xP" />

<Define name="a0" expr="abs(phi0)" />

<Define name="n0" expr="floor(a0/pi)" />

<Define name="r0" expr="a0 - n0*pi" />

<Define name="g0" expr="(r0 <= pi/2) ? sin(r0) : (2 - sin(r0))" />

<Define name="F0" expr="(phi0 < 0 ? -1 : 1)*(2*n0 + g0)" />

<Define name="phiEnd" expr="phi0 - dir*omega*3.5" />

<Define name="aE" expr="abs(phiEnd)" />

<Define name="nE" expr="floor(aE/pi)" />

<Define name="rE" expr="aE - nE*pi" />

<Define name="gE" expr="(rE <= pi/2) ? sin(rE) : (2 - sin(rE))" />

<Define name="FE" expr="(phiEnd < 0 ? -1 : 1)*(2*nE + gE)" />

<Define name="sPath" expr="A*(0-dir)*(FE - F0)" />

<Define name="tau" expr="max(t - 1, 0)" />

<Define name="phiEndL" expr="phi0 - dir*omega*tau" />

<Define name="aL" expr="abs(phiEndL)" />

<Define name="nL" expr="floor(aL/pi)" />

<Define name="rL" expr="aL - nL*pi" />

<Define name="gL" expr="(rL <= pi/2) ? sin(rL) : (2 - sin(rL))" />

<Define name="FL" expr="(phiEndL < 0 ? -1 : 1)*(2*nL + gL)" />

<Define name="sLive" expr="A*(0-dir)*(FL - F0)" />

<Question text="求波速。" hint="v = λ/T。波长读图甲，周期读图乙。" />

<Question text="从 t=1.0 s 起再经过 3.5 s，质点 P 经过的路程。" set={{t: 4.5, dir: -1, A: 0.2, lambda: 4, T: 1}} hint="一个周期的路程是 4A。3.5 s 等于 3.5 个周期。" />

<Question text="判断波沿 x 轴正方向还是负方向传播。" set={{t: 1, dir: -1, A: 0.2, lambda: 4, T: 1}} hint="把 t=1.0 s 的波形向假设的方向移一点，看 P 是向下还是向上。" />

<Preset label="t = 1.0 s（与图乙一致）" set={{t: 1, dir: -1, A: 0.2, lambda: 4, T: 1}} />

<Preset label="假设沿正方向" set={{t: 1, dir: 1, A: 0.2, lambda: 4, T: 1}} />

<Preset label="t = 1.25 s，看波峰" set={{t: 1.25, dir: -1, A: 0.2, lambda: 4, T: 1}} />

<Preset label="再经过 3.5 s" set={{t: 4.5, dir: -1, A: 0.2, lambda: 4, T: 1}} />

<Status cases={[
  {when: "abs(t - 1) < 0.03 and vyP < -0.001", label: "t=1.0 s：P 向 y 轴负方向，与图乙一致", tone: "success"},
  {when: "abs(t - 1) < 0.03 and vyP > 0.001", label: "t=1.0 s：P 向 y 轴正方向，与图乙不符", tone: "danger"},
  {when: "abs(t - 1) < 0.03", label: "t=1.0 s：P 的 y 方向速度接近 0", tone: "warning"},
  {when: "not (dir < 0)", label: "当前假设沿 x 轴正方向，与图乙不符", tone: "warning"},
  {when: "abs(t - 4.5) < 0.03", label: "从 t=1.0 s 起已经过 3.5 s", tone: "info"},
  {label: "当前假设：波沿 x 轴负方向", tone: "success"}
]} />

点播放：绳上的质点只上下振动，波形整体迁移。负方向时，波峰向左走；进度条上 t = 1.0 s 是图甲、图乙的时刻，t = 4.5 s 是再过 3.5 s。

<Sim
  title="简谐横波：质点 P 在 x = 2 m"
  height={400}
  duration={6}
  time="t"
  params={["A", "lambda", "T", "xP", "dir", "vWave"]}
  hud={[
    {symbol: "y_P", label: "P 的位移", expr: "yP", unit: "m", digits: 3},
    {symbol: "v_P", label: "P 的速度", expr: "vyP", unit: "m/s", digits: 2},
    {symbol: "s", label: "从 t=1 s 起的路程", expr: "sLive", unit: "m", digits: 2}
  ]}
  legend={[
    {kind: "velocity", symbol: "v", label: "传播方向与质点速度"}
  ]}
  note="横轴是平衡位置。纵轴相对横轴已放大。质点速度箭头只表示 v_P 相对最大速度的比例，与波速箭头不按同一比例。"
  marks={[
    {t: 0, label: "开始观察"},
    {t: 1, label: "图甲、图乙时刻"},
    {t: "1+T", label: "再过一个周期"},
    {t: 4.5, label: "再经过 3.5 s"}
  ]}
>
sim({
  at(t, p) {
    const k = (2 * Math.PI) / p.lambda
    const w = (2 * Math.PI) / p.T
    const phase = k * p.xP - p.dir * w * (t - 1)
    return {
      yP: p.A * Math.sin(phase),
      vyP: -p.dir * p.A * w * Math.cos(phase),
      k: k,
      w: w,
    }
  },
  draw(ctx, s, v) {
    const p = v.p
    const m = v.view({ xmin: -0.45, xmax: 10.8, ymin: -0.9, ymax: 1.02, pad: 14 })
    v.axisX(m, { y: 0, step: 1, from: 0, to: 9, unit: 'm' })

    const xs = []
    for (let i = 0; i <= 18; i++) xs.push(i * 0.5)
    v.wave(m, (x) => p.A * Math.sin(s.k * x - p.dir * s.w * (v.t - 1)), 0, 9, { dots: xs })

    v.line(m, p.xP, -0.5, p.xP, 0.5, { color: v.color.graphite, dash: true, width: 1 })
    v.label(m, p.xP, s.yP, 'P')

    const vyMax = p.A * s.w
    if (vyMax > 1e-9 && Math.abs(s.vyP) > 0.06 * vyMax) {
      v.vec(m, p.xP, s.yP, 0, 0.13 * s.vyP / vyMax, { kind: 'velocity', label: 'v_P' })
    }

    v.vec(m, 5.8, 0.74, p.dir * 1.7, 0, {
      kind: 'velocity',
      label: 'v = ' + p.vWave.toFixed(2) + ' m/s',
    })

    v.dim(m, 0, -0.66, p.lambda, -0.66, 'λ = ' + p.lambda.toFixed(1) + ' m')
    v.dim(m, 9.75, 0, 9.75, p.A, 'A')

    const vy1 = -p.dir * p.A * s.w * Math.cos(s.k * p.xP)
    let tip = 'P 速度接近 0'
    if (vy1 < -1e-4) tip = 'P 向 y 负方向'
    if (vy1 > 1e-4) tip = 'P 向 y 正方向'
    v.event(m, p.xP, 0.46, tip, { at: 1, kind: 'velocity' })
    v.event(m, p.xP, -0.28, '已过 3.5 s', { at: 4.5, kind: 'velocity' })
  },
})
</Sim>

<Readout items={[
  {label: "波速", symbol: "v", expr: "vWave", unit: "m/s", digits: 2, color: "velocity"},
  {label: "3.5 s 内的路程", symbol: "s", expr: "sPath", unit: "m", digits: 3, color: "velocity"},
  {label: "从 t=1 s 到当前的路程", symbol: "s", expr: "sLive", unit: "m", digits: 3, color: "velocity"},
  {label: "P 的位移", symbol: "y_P", expr: "yP", unit: "m", digits: 3, color: "velocity"},
  {label: "P 的速度", symbol: "v_P", expr: "vyP", unit: "m/s", digits: 2, color: "velocity"}
]} />

<Answer items={[
  {label: "波速", symbol: "v", expr: "vWave", value: 4, unit: "m/s", digits: 2},
  {label: "质点 P 的路程", symbol: "s", expr: "sPath", value: 2.8, unit: "m", digits: 2},
  {label: "传播方向", text: "沿 x 轴负方向"}
]} />

侧栏「3.5 s 内的路程」对第（2）问，按速率对时间积分，不随播放进度改变。画面左上角的路程才跟着时间走。题目的初始数据下，两者在 t = 4.5 s 都是 2.8 m。

## 四、结合图像理解关键时刻

波形图里，虚线钉在 t = 1.0 s，实线是当前波形。实线相对虚线移动的方向就是传播方向。振动图像里，虚线是图乙：t = 1.0 s 过平衡位置并向 y 轴负方向；实线是按所选方向从波形推出来的振动。两条重合，方向才成立。

<Plot
  title="波形图：实线为当前时刻，虚线为 t = 1.0 s"
  caption="虚线是 t=1.0 s 的波形。实线相对虚线移动的方向就是波的传播方向。"
  x={{name: "xq", label: "x", unit: "m", min: 0, max: 9}}
  y={{label: "y", unit: "m", min: -0.5, max: 0.5}}
  series={[
    {label: "当前波形", expr: "A*sin(k*xq - dir*omega*(t-1))", color: "velocity"},
    {label: "t=1.0 s", expr: "A*sin(k*xq)", color: "steel", dash: true}
  ]}
  marks={[
    {x: "xP", series: 0, label: "P"}
  ]}
/>

<Plot
  title="质点 P 的振动图像"
  caption="虚线是图乙。实线是按当前传播方向推出的振动。两条曲线重合，方向才与图乙一致。"
  x={{name: "u", label: "t", unit: "s", min: 0, max: 6}}
  y={{label: "y", unit: "m", min: -0.5, max: 0.5}}
  series={[
    {label: "按方向推出", expr: "A*sin(k*xP - dir*omega*(u-1))", color: "velocity"},
    {label: "图乙", expr: "-A*sin(omega*(u-1))", color: "ink", dash: true}
  ]}
  marks={[
    {x: 1, series: 1, label: "t=1.0 s，向下过平衡位置"},
    {x: 4.5, series: 1, label: "再经过 3.5 s"}
  ]}
  cursor="t"
/>

<Plot
  title="质点 P 的速率"
  caption="阴影从 t=1.0 s 积到当前时刻，面积就是这段路程。播到 4.5 s 时对应第（2）问。"
  x={{name: "u", label: "t", unit: "s", min: 0, max: 6}}
  y={{label: "|v_P|", unit: "m/s", min: 0}}
  series={[
    {label: "速率", expr: "A*omega*abs(cos(k*xP - dir*omega*(u-1)))", color: "velocity"}
  ]}
  areas={[
    {series: 0, from: 1, until: "max(t, 1)", label: "路程", color: "velocity"}
  ]}
  marks={[
    {x: 1, label: "开始计路程"},
    {x: 4.5, label: "3.5 s 末"}
  ]}
  cursor="t"
/>

题目数据、负方向下，几个时刻可以这样读：

- t = 1.0 s：P 在平衡位置，v_P 为负，约 −1.26 m/s（最大速率 Aω = 2πA/T = 0.4π m/s）。波峰在 x = 1 m。这就是图甲加图乙。
- t = 1.25 s：经过 T/4，波峰左移 λ/4 = 1 m，到达 x = 0。1 m / 0.25 s = 4 m/s，和第（1）问的波速相同。P 到达 y = −A。
- t = 2.0 s：再过一个周期，波形向左平移一个波长后与 t = 1.0 s 的虚线重合，波速再核对一次：λ/T = 4 m/s。
- t = 4.5 s：振动图像上从 t = 1.0 s 数到这里是 3.5 个周期，曲线又过平衡位置，但斜率向上。位移是 0，速率图上的阴影面积是 2.8 m。

改成正方向后，t = 1.0 s 时 v_P 变为正，振动图像上的实线和虚线分开，状态栏提示与图乙不符。

拖动周期或振幅时，波速和路程跟着变。3.5 s 内的路程只有在题目这组数据下才是 2.8 m；时间不是半周期的整数倍时，不能把 4A·Δt/T 当成任意相位都成立的矩形面积，速率曲线下的面积才是路程。

## 五、答案汇总

| 问题 | 答案 |
|---|---|
| （1）波速 | $4\ \text{m/s}$ |
| （2）从 t = 1.0 s 起再过 3.5 s，P 的路程 | $2.8\ \text{m}$ |
| （3）传播方向 | 沿 x 轴负方向 |
