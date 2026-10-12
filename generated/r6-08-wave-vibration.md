---
id: r6-08-wave-vibration
title: 波形图与振动图像：波速、路程和传播方向
subject: physics
topic: 机械波与简谐运动
source: 2021 九江二中月考
question: |
  （2021·九江二中月考）一列简谐横波沿 x 轴传播。图甲为 t=1.0 s 时刻的波形图：波形为正弦曲线，振幅 A=0.2 m，波长 λ=4 m，可表示为 y=0.2 sin(πx/2) m（x 轴范围 0~9 m）。图乙为该波中质点 P 的振动图像：P 做简谐运动，振幅 0.2 m，周期 T=1.0 s，在 t=1.0 s 时刻 P 恰好经过平衡位置并向 y 轴负方向运动。已知 P 是 x=2 m 处的质点。
  (1) 求波速；
  (2) 求从 t=1.0 s 起再经过 3.5 s，质点 P 经过的路程；
  (3) 判断波沿 x 轴正方向还是负方向传播。
answers:
  - { name: waveSpeed, value: 4, unit: m/s }
  - { name: pathAnswer, value: 2.8, unit: m }
---

## 一、题目条件分析

波形图描述**同一时刻各质点的位移**；振动图像描述**同一质点在不同时刻的位移**。

已知振幅 $A=0.2\ \mathrm m$、波长 $\lambda=4\ \mathrm m$、周期 $T=1.0\ \mathrm s$。质点 P 的平衡位置固定在 $x_P=2\ \mathrm m$，只沿 $y$ 方向振动。

以 $t_0=1.0\ \mathrm s$ 为演示的计时起点，记经过时间为 $\Delta t=t-t_0$。此时

$$
y_P(t_0)=0.2\sin\pi=0,
$$

且 P 正向下运动。

## 二、完整解答

### （1）波速

波在一个周期内传播一个波长，因此

$$
v=\frac{\lambda}{T}
=\frac{4}{1.0}
=\boxed{4\ \mathrm{m/s}}.
$$

### （2）经过 3.5 s，P 通过的路程

质点在一个完整周期内依次经过平衡位置、负向最大位移、平衡位置、正向最大位移，再回到平衡位置，路程为

$$
s_T=4A=\boxed{0.8\ \mathrm m}.
$$

题给时间对应

$$
\frac{\Delta t}{T}=\frac{3.5}{1.0}=\boxed{3.5}.
$$

前 $3T$ 的路程为 $12A$。剩余半个周期从平衡位置出发，经过一个最大位移处再回到平衡位置，路程为 $2A$。所以

$$
s=3\times4A+2A=14A
=14\times0.2
=\boxed{2.8\ \mathrm m}.
$$

此时 P 又回到平衡位置，**位移为零，但路程不为零**。不能把波传播的距离 $v\Delta t=14\ \mathrm m$ 当作质点的路程。

### （3）传播方向

在 $t_0=1.0\ \mathrm s$ 的波形图上，P 处的斜率为

$$
\left.\frac{\partial y}{\partial x}\right|_{x=2}
=0.2\frac{\pi}{2}\cos\pi
=\boxed{-0.1\pi}<0.
$$

若波沿 $+x$ 方向传播，波形右移，P 左侧原本为正的位移将传到 P，P 应向上运动，与题意矛盾。

若波沿 $-x$ 方向传播，波形左移，P 右侧原本为负的位移将传到 P，P 就向下运动，与题意相符。因此

$$
\boxed{\text{波沿 }x\text{ 轴负方向传播}}.
$$

由此可写出波动表达式：

$$
k=\frac{2\pi}{\lambda}=\boxed{\frac{\pi}{2}\ \mathrm{rad/m}},
\qquad
\omega=\frac{2\pi}{T}=\boxed{2\pi\ \mathrm{rad/s}},
$$

$$
y(x,t)=0.2\sin\left[\frac{\pi x}{2}+2\pi(t-1)\right]\ \mathrm m,
$$

其中 $x$、$t$ 的数值分别以 $\mathrm m$、$\mathrm s$ 为单位。代入 $x_P=2\ \mathrm m$，得到

$$
y_P(t)=-0.2\sin[2\pi(t-1)]\ \mathrm m.
$$

## 三、交互演示

拖动“经过时间”滑块，或播放动画，同时观察波形、P 的运动和累计路程。初始滑块取题目所求的 $3.5\ \mathrm s$；点击“题图时刻”可从头观察。

<Param name="A" label="振幅" value={0.2} min={0.2} max={0.2} step={0.1} unit="m" hidden={true} />

<Param name="lambda" label="波长" value={4} min={4} max={4} step={1} unit="m" hidden={true} />

<Param name="T" label="周期" value={1} min={1} max={1} step={0.1} unit="s" hidden={true} />

<Param name="xP" label="P 的平衡位置" value={2} min={2} max={2} step={1} unit="m" hidden={true} />

<Param name="t0" label="题图时刻" value={1} min={1} max={1} step={0.1} unit="s" hidden={true} />

<Param name="elapsedAsked" label="题目要求的经过时间" value={3.5} min={3.5} max={3.5} step={0.1} unit="s" hidden={true} />

<Param name="tau" label="从 t=1.0 s 起经过的时间" value={3.5} min={0} max={3.5} step={0.01} unit="s" />

<Define name="waveSpeed" expr="lambda / T" />

<Define name="k" expr="2*pi / lambda" />

<Define name="omega" expr="2*pi / T" />

<Define name="tNow" expr="t0 + tau" />

<Define name="yP" expr="A*sin(k*xP + omega*tau)" />

<Define name="vyP" expr="A*omega*cos(k*xP + omega*tau)" />

<Define name="quarterCount" expr="floor(4*tau / T)" />

<Define name="quarterPhase" expr="omega*(tau - quarterCount*T/4)" />

<Define name="pathNow" expr="A*quarterCount + A*(quarterCount % 2 == 0 ? sin(quarterPhase) : 1-cos(quarterPhase))" />

<Define name="pathAnswer" expr="4*A*elapsedAsked / T" />

路程读数按每个四分之一周期累计：每走完一个四分之一周期，路程增加 $A$；不足四分之一周期的部分按实际振动位置计算。$s=4A\Delta t/T$ 在本题的 $3.5T$ 时刻成立，不能用它计算任意时刻的路程。

<Preset label="题图时刻：波速 4 m/s，判断方向" set={{tau: 0}} />

<Preset label="经过 T/4：P 到达最低点" set={{tau: "T/4"}} />

<Preset label="经过 T/2：P 向上经过平衡位置" set={{tau: "T/2"}} />

<Preset label="经过一个周期" set={{tau: "T"}} />

<Preset label="路程答案：经过 3.5 s" set={{tau: "elapsedAsked"}} />

<Status cases={[
  {when: "abs(tau - elapsedAsked) < 1e-6", label: "答案时刻：P 回到平衡位置，累计路程 2.8 m", tone: "success"},
  {when: "abs(vyP) < 1e-6", label: "P 在最大位移处：瞬时速度为零，即将反向", tone: "warning"},
  {when: "vyP < 0", label: "P 正向下运动；波始终向左传播", tone: "info"},
  {label: "P 正向上运动；波始终向左传播", tone: "info"}
]} />

<Readout items={[
  {label: "实际时刻 t", expr: "tNow", unit: "s", digits: 2},
  {label: "波速", expr: "waveSpeed", unit: "m/s", digits: 1},
  {label: "P 的位移", expr: "yP", unit: "m", digits: 3},
  {label: "P 的振动速度（向上为正）", expr: "vyP", unit: "m/s", digits: 3},
  {label: "P 的累计路程", expr: "pathNow", unit: "m", digits: 3}
]} />

<Plot
  title="当前波形：随时间向左平移"
  x={{name: "x", label: "x", unit: "m", min: 0, max: 9}}
  y={{label: "y", unit: "m", min: -0.24, max: 0.24}}
  series={[
    {label: "当前波形", expr: "A*sin(k*x + omega*tau)", color: "ink"},
    {label: "t=1.0 s 的原波形", expr: "A*sin(k*x)", color: "steel", dash: true}
  ]}
  marks={[
    {x: "xP", series: 0, label: "P：平衡位置固定在 x=2 m"}
  ]}
/>

动画中的圆点表示不同位置的介质质点，较大的圆点是 P。**纵向位移已放大，横纵不按比例**；质点的横坐标保持不变，只在各自平衡位置上下振动。蓝色箭头表示 P 的瞬时速度方向和波的传播方向。

<Sim
  title="波向左传播，质点在各自平衡位置上下振动"
  height={300}
  duration="elapsedAsked"
  time="tau"
  params={["A", "k", "omega", "xP"]}
  legend={[
    {kind: "ink", label: "当前波形"},
    {kind: "steel", label: "介质质点"},
    {kind: "velocity", label: "P 的瞬时速度"},
    {kind: "strobe", label: "P 的频闪位置"}
  ]}
  marks={[
    {t: 0, label: "题图时刻"},
    {t: 0.25, label: "P 到达最低点"},
    {t: 0.5, label: "P 向上过平衡位置"},
    {t: 1, label: "完成一个周期"},
    {t: 3.5, label: "累计路程 2.8 m"}
  ]}
>
sim({
  at(t, p) {
    const particles = []
    for (let i = 0; i <= 18; i++) {
      const x = i * 0.5
      particles.push({
        x: x,
        y: p.A * Math.sin(p.k * x + p.omega * t)
      })
    }
    const phaseP = p.k * p.xP + p.omega * t
    return {
      particles: particles,
      yP: p.A * Math.sin(phaseP),
      vyP: p.A * p.omega * Math.cos(phaseP)
    }
  },
  draw(ctx, s, v) {
    const m = v.view({
      xmin: -0.6,
      xmax: 9.8,
      ymin: -2.2,
      ymax: 2.6,
      pad: 18
    })
    const yOf = (x) => Math.sin(v.p.k * x + v.p.omega * v.t)
    const dots = s.particles
      .map((pt) => pt.x)
      .filter((x) => Math.abs(x - v.p.xP) > 1e-6)

    v.line(m, 0, 0, 9, 0, { color: v.color.steel, width: 1 })
    v.axisX(m, { y: -1.7, step: 1, from: 0, to: 9, unit: 'x / m' })

    v.wave(m, yOf, 0, 9, { dots: dots, color: v.color.ink, width: 1.6 })

    const yp = s.yP / v.p.A
    v.line(m, v.p.xP, -1.15, v.p.xP, 1.15, {
      color: v.color.steel,
      width: 1,
      dash: [3, 4]
    })
    v.strobe(m, (st) => [v.p.xP, st.yP / v.p.A], { from: Math.max(0, v.t - 1), r: 2.2 })
    v.ball(m, v.p.xP, yp, 0.12, { label: 'P' })
    if (Math.abs(s.vyP) > 1e-6) {
      v.vec(m, v.p.xP, yp, 0, Math.sign(s.vyP) * 0.5, {
        kind: 'velocity',
        label: 'v_P'
      })
    }

    v.arrow(m, 8.2, 1.95, 6.2, 1.95, { color: v.color.velocity, width: 2 })
    v.label(m, 7.2, 2.3, '波沿 −x 方向传播', { color: v.color.velocity })

    v.dim(m, 0.5, -1.25, 4.5, -1.25, 'λ = 4 m', { offset: 0 })
    v.label(m, 4.8, -0.32, '灰线表示平衡位置', { color: v.color.graphite })

    v.event(m, v.p.xP, -1, 'P 到达最低点', { at: 0.25, kind: 'velocity' })
    v.event(m, v.p.xP, 0, 'P 向上经过平衡位置', { at: 0.5, kind: 'velocity' })
    v.event(m, v.p.xP, yp, 'P 回到初始振动状态', { at: 1, kind: 'velocity' })
    v.event(m, v.p.xP, 0, '答案时刻：路程 14A = 2.8 m', { at: 3.5, kind: 'charge' })
  }
})
</Sim>

<Plot
  title="P 的振动图像：这条曲线只描述 x=2 m 处的质点"
  x={{name: "u", label: "经过时间 Δt", unit: "s", min: 0, max: 3.5}}
  y={{label: "y_P", unit: "m", min: -0.24, max: 0.24}}
  series={[
    {label: "P 的位移", expr: "A*sin(k*xP + omega*u)", color: "ink"}
  ]}
  marks={[
    {x: 0, series: 0, label: "向下过平衡位置"},
    {x: "T/4", series: 0, label: "最低点"},
    {x: "T/2", series: 0, label: "向上过平衡位置"},
    {x: "elapsedAsked", series: 0, label: "回到平衡位置，路程 14A"}
  ]}
  cursor="tau"
/>

## 四、结合图像理解关键时刻

| 经过时间 $\Delta t$ | P 的状态 | 累计路程 |
|---|---|---|
| $0$ | 在平衡位置，向下运动 | $0$ |
| $T/4=0.25\ \mathrm s$ | 到达最低点，瞬时速度为零 | $A=0.2\ \mathrm m$ |
| $T/2=0.50\ \mathrm s$ | 在平衡位置，向上运动 | $2A=0.4\ \mathrm m$ |
| $T=1.00\ \mathrm s$ | 回到初始振动状态 | $4A=0.8\ \mathrm m$ |
| $3.5T=3.50\ \mathrm s$ | 在平衡位置，向上运动 | $14A=2.8\ \mathrm m$ |

观察波形图，实线波形相对灰色虚线向左平移；观察动画，P 始终停留在 $x=2\ \mathrm m$ 这条竖线上上下运动。**传播的是振动状态，质点不随波向左迁移。**

经过半个周期，P 虽然回到平衡位置，运动方向却与初始时相反；经过一个周期，位移和运动方向才同时恢复。经过 $3.5T$，当前波形也与初始波形反相。

## 五、答案汇总

| 小问 | 答案 |
|---|---|
| （1）波速 | $\boxed{4\ \mathrm{m/s}}$ |
| （2）P 经过的路程 | $\boxed{2.8\ \mathrm m}$ |
| （3）传播方向 | $\boxed{x\text{ 轴负方向}}$ |
