---
id: gd21-02
title: 由绕地参量求地球质量
source: 2021 广东卷 第 2 题（单选，4 分）
question: |
  2021 年 4 月，我国自主研发的空间站“天和”核心舱成功发射并入轨运行，若核心舱绕地球的运行可视为匀速圆周运动，已知引力常量，由下列物理量能计算出地球质量的是（　　）

  A. 核心舱的质量和绕地半径

  B. 核心舱的质量和绕地周期

  C. 核心舱的绕地角速度和绕地周期

  D. 核心舱的绕地线速度和绕地半径
choice: D
answers: []
theme: night
---

核心舱只受地球引力，做半径为 $r$ 的匀速圆周运动。引力提供向心力：

$$
\frac{GMm}{r^2}=m\frac{v^2}{r}=m\omega^2 r=m\frac{4\pi^2}{T^2}r
$$

约去核心舱质量 $m$，地球质量只由轨道参数决定：

$$
M=\frac{v^2 r}{G}=\frac{\omega^2 r^3}{G}=\frac{4\pi^2 r^3}{GT^2}
$$

题目没有给数值。下面取一组代表性数值便于比较：$r=6.8\times10^6\,\mathrm{m}$，$T=5400\,\mathrm{s}$，$m=2.0\times10^4\,\mathrm{kg}$，$G=6.67\times10^{-11}\,\mathrm{N\cdot m^2/kg^2}$。这些数只用来看清哪些量能进入上式，不是题目数据。

## 完整解答

**A．错误。** 式中 $m$ 已约掉，只知道 $m$ 和 $r$ 时，$v$、$\omega$、$T$ 都不知，三个表达式都缺一个量，求不出 $M$。

**B．错误。** 同样 $m$ 不出现在结果里。只知道 $m$ 和 $T$ 时缺少 $r$，不能用 $M=4\pi^2 r^3/(GT^2)$。

**C．错误。** 匀速圆周运动中 $\omega=2\pi/T$，角速度和周期只是同一个量的两种写法，互不独立。两者都没有带来 $r$，$M=\omega^2 r^3/G$ 仍然缺半径。

**D．正确。** 线速度和半径互相独立，代入即得

$$
\boxed{M=\dfrac{v^{2}r}{G}}
$$

等价地，只要另有一组含 $r$ 的独立组合（$r$ 与 $T$，或 $r$ 与 $\omega$）也能求出 $M$。选项里没有这两组，所以只有 D。

## 交互演示

拖动半径和周期，看线速度、角速度和按上式算出的地球质量怎么变。切到某个选项，侧栏会标出这组量够不够。核心舱质量怎么拖，算出的 $M$ 都不变。

<Param name="G" value={6.67e-11} hidden />

<Param name="r" label="绕地半径" symbol="r" value={6.8e6} min={6.6e6} max={1.0e7} step={1e5} unit="m" format="sci" color="velocity" />

<Param name="T" label="绕地周期" symbol="T" value={5400} min={4800} max={8000} step={60} unit="s" />

<Param name="m" label="核心舱质量" symbol="m" value={20000} min={10000} max={40000} step={1000} unit="kg" format="sci" />

<Param name="opt" label="当前选项" value={4} options={[
  {value: 1, label: "A：质量与半径"},
  {value: 2, label: "B：质量与周期"},
  {value: 3, label: "C：角速度与周期"},
  {value: 4, label: "D：线速度与半径"}
]} />

<Param name="t" value={0} hidden />

<Define name="v" expr="2*pi*r/T" />

<Define name="omega" expr="2*pi/T" />

<Define name="aN" expr="v*v/r" />

<Define name="M" expr="4*pi*pi*r*r*r/(G*T*T)" />

<Define name="link" expr="omega*T/(2*pi)" />

<Preset label="代表性数值，看选项 D" set={{r: 6.8e6, T: 5400, m: 20000, opt: 4}} />

<Question text="A. 核心舱的质量和绕地半径" set={{opt: 1}} />

<Question text="B. 核心舱的质量和绕地周期" set={{opt: 2}} />

<Question text="C. 核心舱的绕地角速度和绕地周期" set={{opt: 3}} />

<Question text="D. 核心舱的绕地线速度和绕地半径" set={{opt: 4}} />

<Status cases={[
  {when: "opt == 4", label: "D：线速度和半径独立，能求出地球质量", tone: "success"},
  {when: "opt == 3", label: "C：角速度与周期不独立，缺半径，求不出", tone: "warning"},
  {when: "opt == 2", label: "B：质量约掉了，只剩周期，求不出", tone: "warning"},
  {label: "A：质量约掉了，只剩半径，求不出", tone: "warning"}
]} />

<Readout items={[
  {label: "绕地线速度", symbol: "v", expr: "v", unit: "m/s", digits: 0, color: "velocity"},
  {label: "绕地角速度", symbol: "ω", expr: "omega", unit: "rad/s", format: "sci", color: "accel"},
  {label: "由 r、T 算出的地球质量", symbol: "M", expr: "M", unit: "kg", format: "sci"},
  {label: "ωT 与 2π 的比", symbol: "ωT/2π", expr: "link", digits: 2}
]} />

<Answer items={[
  {label: "答案", text: "D"},
  {label: "地球质量", symbol: "M", text: "v²r/G"}
]} />

<Sim title="天和核心舱绕地" height={640} duration="T" time="t" playSeconds={12} loop={true}
  params={["r", "T", "v"]}
  marks={[
    {t: 0, label: "取为计时起点"},
    {t: "T/4", label: "转过四分之一周"},
    {t: "T/2", label: "转过半周"}
  ]}
  hud={[
    {symbol: "v", label: "线速度", expr: "v", unit: "m/s", digits: 0},
    {symbol: "M", label: "地球质量", expr: "M", unit: "kg", format: "sci"}
  ]}
  legend={[
    {kind: "velocity", label: "线速度方向"},
    {kind: "force", label: "引力，指向地心"}
  ]}
  note="地球大小和轨道不按比例；箭头只表示方向">
sim({
  at(t, p) {
    return { th: (2 * Math.PI * t) / p.T }
  },
  draw(ctx, s, v) {
    const R = v.p.r
    const sc = R / 1e6
    const m = v.view({ xmin: -1.45 * sc, xmax: 1.45 * sc, ymin: -1.45 * sc, ymax: 1.45 * sc, equal: true })
    v.stars()
    v.planet(m, 0, 0, 0.32 * sc, { label: '地球' })
    v.orbit(m, 0, 0, sc, sc)
    const x = sc * Math.cos(s.th)
    const y = sc * Math.sin(s.th)
    v.dim(m, 0, 0, x, y, 'r')
    v.vec(m, x, y, -0.42 * x, -0.42 * y, { kind: 'force', label: 'F' })
    v.vec(m, x, y, -0.5 * y, 0.5 * x, { kind: 'velocity', label: 'v' })
    v.satellite(m, x, y, { angle: (s.th * 180) / Math.PI + 90 })
    v.label(m, x, y, '核心舱')
  },
})
</Sim>

<Plot title="周期不变时，向心加速度随半径变化"
  caption="测出 a 和 r，就能由 M = a r² / G 求出地球质量"
  x={{name: "r", label: "r", unit: "m", min: 6.6e6, max: 1.0e7}}
  y={{label: "a", unit: "m/s²", min: 3, max: 12}}
  series={[{label: "a", expr: "4*pi*pi*r/(T*T)", color: "accel"}]}
  marks={[{x: "r", label: "当前 r"}]}
  cursor="r"
/>

动画里线速度沿切线，引力指向地心。周期固定时，半径越大，向心加速度 $a=4\pi^2 r/T^2$ 越大；游标所在的 $a$ 与 $r$ 一起带进 $M=ar^2/G$，和用 $v$、$r$ 算出的是同一个值。另外，侧栏里 $\omega T/2\pi$ 始终是 1，所以选项 C 的两个量并不是两个独立条件。

## 答案

选 **D**。已知引力常量时，绕地线速度和绕地半径可以算出地球质量 $M=v^2 r/G$。
