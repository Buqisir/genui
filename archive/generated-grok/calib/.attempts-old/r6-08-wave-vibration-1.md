---
id: r6-08-wave-vibration
title: 简谐横波的波速、路程与传播方向
subject: physics
topic: 机械波
source: 2021 九江二中月考
question: |
  （2021·九江二中月考）一列简谐横波沿 x 轴传播。图甲为 t=1.0 s 时刻的波形图：波形为正弦曲线，振幅 A=0.2 m，波长 λ=4 m，可表示为 y=0.2 sin(πx/2) m（x 轴范围 0~9 m）。图乙为该波中质点 P 的振动图像：P 做简谐运动，振幅 0.2 m，周期 T=1.0 s，在 t=1.0 s 时刻 P 恰好经过平衡位置并向 y 轴负方向运动。已知 P 是 x=2 m 处的质点。
  (1) 求波速；
  (2) 求从 t=1.0 s 起再经过 3.5 s，质点 P 经过的路程；
  (3) 判断波沿 x 轴正方向还是负方向传播。
answers:
  - { name: v, value: 4, unit: m/s }
  - { name: s, value: 2.8, unit: m }
  - { name: dir, value: -1, unit: "1" }
---

## 一、题目条件分析

题干给出的是同一列波的两张图，图已按文字描述复原到上方的波形图和振动图像里。

- 图甲是 $t=1.0\ \text{s}$ 这一个时刻的波形，不是任意时刻都成立的波动方程：
  $$y=0.2\sin\frac{\pi x}{2}\ \text{m}$$
  因此振幅 $A=0.2\ \text{m}$，波长 $\lambda=4\ \text{m}$（$\dfrac{\pi x}{2}$ 增加 $2\pi$ 时，$x$ 增加 $4\ \text{m}$）。横轴只画出 $0\sim 9\ \text{m}$。
- 图乙是质点 P 的振动图像：振幅仍是 $0.2\ \text{m}$，周期 $T=1.0\ \text{s}$。$t=1.0\ \text{s}$ 时 P 正在过平衡位置，速度指向 $y$ 轴负方向。
- P 在 $x=2\ \text{m}$。代入图甲：$y=0.2\sin\pi=0$，和“正在过平衡位置”一致。波形图上所有质点的位置都定了，传播方向还要靠这个速度方向才能判定。

滑块初值就是上述题目数据。演示里把 P 放在 $x=\lambda/2$：$\lambda=4\ \text{m}$ 时就是 $x=2\ \text{m}$，所以只要不改波长，P 在 $t=1.0\ \text{s}$ 一定过平衡位置。`dir` 取 $-1$ 表示沿 $x$ 轴负方向，取 $+1$ 表示沿 $x$ 轴正方向。

## 二、完整解答

### （1）波速

频率 $f=1/T=1.0\ \text{Hz}$。波速

$$
v=\frac{\lambda}{T}=\frac{4}{1.0}=\boxed{4\ \text{m/s}}
$$

### （2）从 $t=1.0\ \text{s}$ 起再经过 $3.5\ \text{s}$ 的路程

简谐运动里，质点每一个周期走过的路程都是 $4A$，和起点在哪里无关。这里 $3.5\ \text{s}=3.5T$，也可以按图乙的状态逐段数：

$t=1.0\ \text{s}$ 时 P 在平衡位置、速度向下。

- $0\sim T/4$：平衡位置到负向最大位移，路程 $A=0.2\ \text{m}$
- $T/4\sim T/2$：负向最大位移回到平衡位置，路程 $A=0.2\ \text{m}$
- $T/2\sim 3T/4$：平衡位置到正向最大位移，路程 $A=0.2\ \text{m}$
- $3T/4\sim T$：正向最大位移回到平衡位置，路程 $A=0.2\ \text{m}$

一个周期的路程是 $4A=0.8\ \text{m}$。三个周期是 $2.4\ \text{m}$。三个周期结束时，P 又回到和 $t=1.0\ \text{s}$ 相同的状态：在平衡位置、速度向下。再过半个周期，它向下到达负向最大位移再回到平衡位置，路程 $2A=0.4\ \text{m}$。

$$
s=3\times 4A+2A=14A=14\times 0.2=\boxed{2.8\ \text{m}}
$$

这段时间的位移是 $0$（终点仍在平衡位置）。路程是轨迹的长度，不是位移。

### （3）传播方向

$t=1.0\ \text{s}$ 的波形是 $y=A\sin kx$，$k=2\pi/\lambda=\pi/2$。P 在 $x=2\ \text{m}$，相位 $kx=\pi$，位移为 $0$。

用带动法。波从哪一侧传过来，P 下一时刻就跟着那一侧邻近质点现在的位移走。

- 沿 $x$ 轴负方向传播时，扰动从右侧传来。$x$ 略大于 $2\ \text{m}$ 时，$\sin(\pi x/2)$ 刚过 $\pi$，位移为负。P 接着要向下运动，和图乙一致。
- 沿 $x$ 轴正方向传播时，扰动从左侧传来。$x$ 略小于 $2\ \text{m}$ 时位移为正，P 会向上运动，和图乙不符。

所以这列波

$$
\boxed{\text{沿 }x\text{ 轴负方向传播}}
$$

课件里记作 $\text{dir}=-1$。

再用波动方程核对。两种方向在 $t=1.0\ \text{s}$ 的波形相同，差别在时间项的符号（$\omega=2\pi/T$）：

$$
y=A\sin\big[kx-\text{dir}\cdot\omega(t-1)\big]
$$

质点速度

$$
v_y=-\text{dir}\cdot A\omega\cos\big[kx-\text{dir}\cdot\omega(t-1)\big]
$$

把 $t=1.0\ \text{s}$、$x=2\ \text{m}$ 代入，$\cos\pi=-1$，得到 $v_y=\text{dir}\cdot A\omega$。

- $\text{dir}=-1$ 时 $v_y=-A\omega<0$，向下，符合图乙。
- $\text{dir}=+1$ 时 $v_y=+A\omega>0$，向上，不符合图乙。

> **易错点**：图甲那一个式子只描述 $t=1.0\ \text{s}$。两个传播方向在这一瞬间的波形完全一样，差的是质点速度的正负。路程不要写成位移 $0$，也不要把一个周期的路程写成 $2A$。

## 三、交互演示

点「图甲、图乙」停在题目给定的时刻；点「沿 +x（对照）」看同一条波形为什么会被图乙排除。拖动 $\Delta t$ 时，速率图里的阴影始终是这段时间的路程。只有 $\Delta t$ 等于整数个或半整数个周期时，路程才等于 $(\Delta t/T)\times 4A$；拖到别的时刻，读数按速率曲线下的面积计算。

动画里纵轴相对横轴放大，不按比例。质点只沿 $y$ 方向振动，波峰沿 $x$ 方向移动。$v_P$ 箭头按最大速率归一，只表示方向和相对大小。

<Question text="求这列波的波速。" set={{t: 1, dir: -1, A: 0.2, lambda: 4, T: 1, dt: 3.5}} hint="v = λ/T，图甲给波长，图乙给周期" />

<Question text="从 t=1.0 s 起再经过 3.5 s，质点 P 经过的路程是多少？" set={{t: 4.5, dir: -1, A: 0.2, lambda: 4, T: 1, dt: 3.5}} hint="一个周期的路程是 4A；3.5 个周期末位移为 0" />

<Question text="波沿 x 轴正方向还是负方向传播？" set={{t: 1, dir: -1, A: 0.2, lambda: 4, T: 1, dt: 3.5}} hint="t=1.0 s 时看 P 右侧质点在平衡位置的哪一侧" />

<Param name="dir" label="传播方向" symbol="dir" color="velocity" options={[{value: -1, label: "沿 x 轴负方向"}, {value: 1, label: "沿 x 轴正方向"}]} value={-1} />

<Param name="dt" label="再经过的时间 Δt" symbol="Δt" min={0} max={4} step={0.1} value={3.5} unit="s" />

<Param name="A" label="振幅 A" symbol="A" color="velocity" min={0.05} max={0.4} step={0.01} value={0.2} unit="m" />

<Param name="lambda" label="波长 λ" symbol="λ" min={2} max={8} step={1} value={4} unit="m" />

<Param name="T" label="周期 T" symbol="T" min={0.5} max={2} step={0.1} value={1} unit="s" />

<Param name="t" label="时间" symbol="t" min={0} max={6} step={0.01} value={1} unit="s" hidden />

<Define name="k" expr="2*pi/lambda" />

<Define name="omega" expr="2*pi/T" />

<Define name="v" expr="lambda/T" />

<Define name="xP" expr="lambda/2" />

<Define name="yP" expr="A*sin(k*xP - dir*omega*(t-1))" />

<Define name="vyP" expr="-dir*A*omega*cos(k*xP - dir*omega*(t-1))" />

<Define name="tau" expr="max(t-1, 0)" />

<Define name="Phi" expr="omega*dt" />

<Define name="nPi" expr="floor(Phi/pi)" />

<Define name="rho" expr="Phi - nPi*pi" />

<Define name="integ" expr="2*nPi + (rho <= pi/2 ? sin(rho) : 2 - sin(rho))" />

<Define name="s" expr="A*integ" />

<Define name="PhiNow" expr="omega*tau" />

<Define name="nPiNow" expr="floor(PhiNow/pi)" />

<Define name="rhoNow" expr="PhiNow - nPiNow*pi" />

<Define name="integNow" expr="2*nPiNow + (rhoNow <= pi/2 ? sin(rhoNow) : 2 - sin(rhoNow))" />

<Define name="sNow" expr="A*integNow" />

<Define name="yEnd" expr="A*sin(k*xP - dir*omega*dt)" />

<Preset label="题目数据" set={{A: 0.2, lambda: 4, T: 1, dt: 3.5, dir: -1, t: 1}} />

<Preset label="图甲、图乙 t=1.0 s" set={{t: 1, dir: -1}} />

<Preset label="沿 −x（正确）" set={{dir: -1, t: 1}} />

<Preset label="沿 +x（对照）" set={{dir: 1, t: 1}} />

<Preset label="再经过 3.5 s" set={{t: 4.5, dt: 3.5}} />

<Status cases={[
  {when: "dir > 0", label: "沿 +x：t=1 s 时 P 速度向上，与图乙不符", tone: "warning"},
  {when: "abs(t - 1) < 0.05", label: "t=1.0 s：P 过平衡位置，速度沿 −y", tone: "success"},
  {when: "abs(t - (1 + dt)) < 0.05", label: "从 t=1.0 s 起正好再经过 Δt", tone: "info"},
  {when: "abs(t - (1 + T)) < 0.05", label: "从 t=1.0 s 起正好经过一个周期", tone: "info"},
  {label: "波沿 x 轴负方向传播", tone: "success"}
]} />

<Sim
  title="简谐横波：质点上下振动，波形沿 x 传播"
  height={380}
  duration={6}
  time="t"
  params={["A", "lambda", "k", "omega", "v", "dir", "xP", "dt"]}
  hud={[
    {symbol: "y_P", expr: "yP", unit: "m", digits: 3},
    {symbol: "v_P", expr: "vyP", unit: "m/s", digits: 2},
    {symbol: "s", label: "路程自 1 s", expr: "sNow", unit: "m", digits: 2}
  ]}
  legend={[
    {kind: "velocity", label: "波峰与质点速度"},
    {kind: "steel-dash", label: "平衡位置"}
  ]}
  note="纵轴相对横轴已放大，不按比例；v_P 箭头按最大速率归一，只表示方向和相对大小"
  marks={[
    {t: 1, label: "图甲、图乙"},
    {t: "1+T/4", label: "P 到达最大位移"},
    {t: "1+T", label: "经过一个周期"},
    {t: "1+dt", label: "再经过 Δt"}
  ]}
>
sim({
  at(t, p) {
    const phase = p.k * p.xP - p.dir * p.omega * (t - 1)
    return {
      yP: p.A * Math.sin(phase),
      vyP: -p.dir * p.A * p.omega * Math.cos(phase),
    }
  },
  draw(ctx, s, v) {
    const p = v.p
    const t = v.t
    const m = v.view({ xmin: -1, xmax: 10.8, ymin: -1, ymax: p.A + 1, pad: 14 })

    v.line(m, 0, 0, 9, 0, { color: v.color.steel, width: 1, dash: [6, 4] })
    v.axisX(m, { y: -0.72, step: 1, from: 0, to: 9, unit: 'x / m' })
    v.wave(m, (x) => p.A * Math.sin(p.k * x - p.dir * p.omega * (t - 1)), 0, 9, { dots: true })

    v.dim(m, 0, -0.42, p.lambda, -0.42, 'λ = ' + p.lambda.toFixed(0) + ' m')
    v.dim(m, 9.55, 0, 9.55, p.A, 'A=' + p.A.toFixed(2) + ' m')

    let xC = p.lambda / 4 + p.dir * p.v * (t - 1)
    xC = xC - p.lambda * Math.floor(xC / p.lambda)
    if (xC < 0) xC += p.lambda
    let best = xC
    let bestDist = Math.abs(xC - 4.5)
    for (let x = xC; x <= 9; x += p.lambda) {
      v.circle(m, x, p.A, 0.04, { color: v.color.velocity })
      const dist = Math.abs(x - 4.5)
      if (dist < bestDist) {
        best = x
        bestDist = dist
      }
    }
    v.label(m, best, p.A, '波峰', { color: v.color.velocity, size: 11, place: 'above' })

    v.line(m, p.xP, -0.24, p.xP, p.A + 0.14, { color: v.color.graphite, width: 1, dash: [3, 3] })
    v.ball(m, p.xP, s.yP, 0.07, { label: 'P' })

    const vmax = p.A * p.omega
    if (vmax > 1e-8 && Math.abs(s.vyP) > 1e-4) {
      v.vec(m, p.xP, s.yP, 0, (s.vyP / vmax) * 0.24, { kind: 'velocity', label: 'v_P' })
    }
    v.vec(m, 2.3, p.A + 0.52, p.dir * 1.8, 0, { kind: 'velocity', label: p.dir < 0 ? '波沿 −x' : '波沿 +x' })

    v.event(m, p.xP, 0, p.dir < 0 ? 'P 向 y 轴负方向过平衡位置' : 'P 向 y 轴正方向过平衡位置', { at: 1, kind: 'velocity' })
    v.event(m, p.xP, s.yP, '再经过 Δt', { at: 1 + p.dt, kind: 'velocity' })
  },
})
</Sim>

<Readout items={[
  {label: "波速", symbol: "v", expr: "v", unit: "m/s", digits: 2, color: "velocity"},
  {label: "质点 P 的位置", symbol: "x_P", expr: "xP", unit: "m", digits: 2},
  {label: "此刻位移", symbol: "y_P", expr: "yP", unit: "m", digits: 3, color: "velocity"},
  {label: "此刻速度", symbol: "v_P", expr: "vyP", unit: "m/s", digits: 2, color: "velocity"},
  {label: "自 t=1 s 起的路程", symbol: "s", expr: "sNow", unit: "m", digits: 2, color: "velocity"},
  {label: "Δt 内的路程", symbol: "s", expr: "s", unit: "m", digits: 2, color: "velocity"},
  {label: "Δt 末的位移", symbol: "y", expr: "yEnd", unit: "m", digits: 3, color: "velocity"}
]} />

<Answer items={[
  {label: "波速", symbol: "v", expr: "v", value: 4, unit: "m/s", digits: 2},
  {label: "质点 P 的路程", symbol: "s", expr: "s", value: 2.8, unit: "m", digits: 2},
  {label: "传播方向（−1 为沿 −x）", symbol: "dir", expr: "dir", value: -1, digits: 0}
]} />

<Plot
  title="波形图：虚线固定在 t=1.0 s"
  caption="题目数据下，虚线就是 y=0.2 sin(πx/2)。沿 −x 传播时，实线相对虚线向左移动。"
  x={{name: "x", label: "x", unit: "m", min: 0, max: 9}}
  y={{label: "y", unit: "m", min: "-1.4*A", max: "1.4*A"}}
  series={[
    {label: "此刻波形", expr: "A*sin(k*x - dir*omega*(t-1))", color: "velocity"},
    {label: "t=1.0 s", expr: "A*sin(k*x)", color: "steel", dash: true}
  ]}
  marks={[
    {x: "xP", series: 0, label: "质点 P"}
  ]}
/>

<Plot
  title="质点 P 的振动图像（图乙）"
  caption="t=1.0 s 时位移为 0。沿 −x 传播，曲线向下穿过横轴；改成沿 +x，整条曲线的斜率反号。"
  x={{name: "tt", label: "t", unit: "s", min: 0, max: 6}}
  y={{label: "y", unit: "m", min: "-1.4*A", max: "1.4*A"}}
  series={[
    {label: "P 的位移", expr: "A*sin(k*xP - dir*omega*(tt-1))", color: "velocity"}
  ]}
  marks={[
    {x: 1, series: 0, label: "t=1.0 s"},
    {x: "1+dt", series: 0, label: "再经过 Δt"}
  ]}
  cursor="t"
/>

<Plot
  title="质点 P 的速率：阴影面积等于路程"
  caption="阴影从 t=1.0 s 积到 t=1+Δt。题目数据下这块面积是 2.8 m，而终点位移是 0。"
  x={{name: "tt", label: "t", unit: "s", min: 0, max: 6}}
  y={{label: "|v_P|", unit: "m/s", min: 0}}
  series={[
    {label: "速率", expr: "A*omega*abs(cos(k*xP - dir*omega*(tt-1)))", color: "velocity"}
  ]}
  areas={[
    {series: 0, from: 1, until: "1+dt", label: "路程 s", color: "velocity"}
  ]}
  marks={[
    {x: 1, series: 0, label: "开始计路程"},
    {x: "1+dt", series: 0, label: "Δt 结束"}
  ]}
  cursor="t"
/>

## 四、结合图像理解关键时刻

下面都按题目数据、并且波沿 $x$ 轴负方向。

- $t=1.0\ \text{s}$：波形就是图甲，波峰在 $x=1\ \text{m}$。P 在 $x=2\ \text{m}$，位移为 $0$，速度向下。它右侧的波形在平衡位置下方，所以扰动从右向左传来。
- $t=1.25\ \text{s}$：过了 $T/4$，P 到达 $y=-A=-0.2\ \text{m}$。这一小段路程是 $A=0.2\ \text{m}$。
- $t=2.0\ \text{s}$：过了一个周期。波向左平移 $\lambda=4\ \text{m}$，波形和图甲重合；P 回到平衡位置，速度仍向下。这一秒的路程是 $4A=0.8\ \text{m}$。
- $t=4.5\ \text{s}$：从 $t=1.0\ \text{s}$ 起再经过 $3.5\ \text{s}$。波向左平移 $v\times 3.5=14\ \text{m}=3.5\lambda$，图像上相当于相对图甲反相。P 又在平衡位置，但速度向上。位移是 $0$，速率曲线下的阴影面积是 $2.8\ \text{m}$。

切换到沿 $+x$ 后，波峰改向右移。$t=1.0\ \text{s}$ 的波形一点不变，振动图像在该点的斜率由负变正，图乙对不上。

## 五、答案汇总

| 问题 | 答案 |
|---|---|
| （1）波速 | $4\ \text{m/s}$ |
| （2）再经过 $3.5\ \text{s}$ 的路程 | $2.8\ \text{m}$ |
| （3）传播方向 | 沿 $x$ 轴负方向（$\text{dir}=-1$） |
