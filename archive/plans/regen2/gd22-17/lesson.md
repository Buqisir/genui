---
id: gd22-17
title: 抖动软绳上的简谐横波
source: 2022 广东卷 第 17 题（选考·选修 3-4，填空；选考共 12 分，原卷未单列本题分值）
question: "如图所示，某同学握住软绳的一端周期性上下抖动，在绳上激发了一列简谐波。从图示时刻开始计时，经过半个周期，绳上 M 处的质点将运动至____（选填“N”“P”或“Q”）处。加快抖动，波的频率增大，波速____（选填“增大”“减小”或“不变”）。"
answers:
  - { name: atP, value: 1 }
  - { name: speedSame, value: 1 }
---

左端的手周期性上下抖动，在软绳上激起一列向右传播的简谐横波。波形从手的位置先下到波谷、再上到第一个波峰，然后再下到波谷、上到第二个波峰、再向下，约两个波长。M 在第一个波峰上，N 在 M 正下方的平衡位置上，P 在再正下方的波谷高度上，三点在同一条竖直线上。Q 在第一个波峰右侧那个波谷的正上方、与波峰同高的位置上，和该波谷在同一条竖直线上。

题目只给出字母。下面取代表值：波长 $\lambda=4\,\mathrm{m}$，振幅 $A=1\,\mathrm{m}$，周期 $T=2\,\mathrm{s}$。纵向位移相对波长已放大，不按比例。

## 完整解答

这是一列横波，质点只在自己的平衡位置上下振动，不随波往右走。图示时刻 M 在波峰，即正向最大位移处，速度为零，接下来向下振动。

经过半个周期，质点走完半次全振动，位移变为相反方向的最大值：

$$
y_M\!\left(\frac{T}{2}\right)=-A
$$

这个位置就是 M 正下方、波谷那条水平虚线上的 P。N 是平衡位置，质点只是在 $T/4$ 时经过它；Q 是另一个平衡位置上方的空间点，质点不会横移过去。所以第一空填 $\boxed{\text{P}}$。

波速由介质决定。软绳没有换，加快抖动只改变波源的频率，波速不变。频率增大时，由 $v=\lambda f$ 知道波长反而减小。所以第二空填 $\boxed{\text{不变}}$。

## 交互演示

拖动时间，看 M 沿自己那条竖直线从波峰经过 N、落到 P；Q 始终是另一个平衡位置上方的参考点，波形只是从它下面经过。拖动频率，波长变短，波速读数不变。

<Param name="lambda" label="波长（代表值）" symbol="λ" value={4} min={2} max={6} step={0.5} unit="m" hidden />

<Param name="A" label="振幅（代表值）" symbol="A" value={1} min={0.5} max={1.5} step={0.1} unit="m" hidden />

<Param name="T" label="周期（代表值）" symbol="T" value={2} min={1} max={4} step={0.5} unit="s" hidden />

<Param name="f" label="抖动频率" symbol="f" value={0.5} min={0.3} max={1.2} step={0.05} unit="Hz" color="charge" />

<Param name="t" label="从图示时刻起的时间" symbol="t" value={1} min={0} max={4} step={0.01} unit="s" />

<Define name="v" expr="lambda/T" />

<Define name="lamNow" expr="v/f" />

<Define name="xM" expr="0.75*lambda" />

<Define name="xQ" expr="1.25*lambda" />

<Define name="yM" expr="A*cos(2*pi*f*t)" />

<Define name="atP" expr="1" />

<Define name="speedSame" expr="1" />

<Question text="经过半个周期，M 处的质点运动到哪里？" set={{t: "1/(2*f)"}} hint="质点只上下振动，半个周期后到达反向最大位移" />

<Question text="加快抖动后，波速怎么变？" set={{f: 1}} hint="波速由介质决定，频率变大只使波长变短" />

<Preset label="图示时刻：M 在波峰" set={{t: 0, f: 0.5}} />

<Preset label="半个周期：M 到达 P" set={{t: "1/(2*f)", f: 0.5}} />

<Preset label="加快抖动：频率加倍" set={{f: 1, t: 0}} />

<Status cases={[
  {when: "abs(yM + A) < 1e-6", label: "M 在波谷高度：即 P 处", tone: "success"},
  {when: "abs(yM) < 0.08", label: "M 正经过平衡位置 N", tone: "info"},
  {when: "abs(yM - A) < 1e-6", label: "M 在波峰：图示时刻的位置", tone: "neutral"},
  {label: "M 沿竖直线振动，不会移到 Q", tone: "neutral"}
]} />

<Readout items={[
  {label: "M 的位移", symbol: "y_M", expr: "yM", unit: "m", digits: 2, color: "velocity"},
  {label: "波速", symbol: "v", expr: "v", unit: "m/s", digits: 2, color: "velocity"},
  {label: "当前波长", symbol: "λ", expr: "lamNow", unit: "m", digits: 2}
]} />

<Answer items={[
  {label: "半个周期后 M 运动至", text: "P"},
  {label: "频率增大时波速", text: "不变"},
  {label: "半个周期后的位移", symbol: "y_M", expr: "-A", unit: "m", digits: 1}
]} />

绳上的圆点是介质质点，大圆点是 M。细虚线是波峰、平衡位置和波谷三条水平线，竖虚线是 M 的振动轨迹。纵向位移已放大，不按比例。

<Sim title="软绳上的简谐横波" height={340} duration="2/f" time="t" params={["A", "f", "v", "xM", "xQ", "lambda"]} marks={[{t: 0, label: "图示时刻：M 在波峰"}, {t: "0.5/f", label: "半个周期：M 到达 P"}, {t: "1/f", label: "一个周期：M 回到波峰"}]} legend={[{kind: "ink", label: "当前波形"}, {kind: "steel-dash", label: "平衡位置"}, {kind: "velocity", label: "M 的振动"}]} note="纵向位移已放大，不按比例；波速取代表值 2 m/s" hud={[{symbol: "y_M", label: "M 的位移", expr: "A*cos(2*pi*f*t)", unit: "m", digits: 2}, {symbol: "v", label: "波速", expr: "v", unit: "m/s", digits: 1}]}>
sim({
  at(t, p) {
    const k = (2 * Math.PI) / (p.v / p.f)
    const w = 2 * Math.PI * p.f
    const yOf = (x) => p.A * Math.cos(k * x - w * t)
    return { yHand: yOf(0), yM: yOf(p.xM) }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -1.15, xmax: 9.4, ymin: -1.85, ymax: 2.15, equal: true })
    const k = (2 * Math.PI * v.p.f) / v.p.v
    const w = 2 * Math.PI * v.p.f
    const yOf = (x) => v.p.A * Math.cos(k * x - w * v.t)
    const A = v.p.A
    const xEnd = Math.min(2 * v.p.lambda, 8.6)
    const dots = []
    for (let x = 0.5; x < xEnd - 0.2; x += 0.5) {
      if (Math.abs(x - v.p.xM) > 0.15) dots.push(x)
    }
    v.line(m, 0.2, A, xEnd, A, { color: v.color.steel, dash: true, width: 1 })
    v.line(m, 0.2, 0, xEnd, 0, { color: v.color.steel, dash: true, width: 1 })
    v.line(m, 0.2, -A, xEnd, -A, { color: v.color.steel, dash: true, width: 1 })
    v.line(m, v.p.xM, -A - 0.28, v.p.xM, -A + 0.18, { color: v.color.steel, dash: true, width: 1 })
    v.line(m, v.p.xM, -0.22, v.p.xM, 0.22, { color: v.color.steel, dash: true, width: 1 })
    v.line(m, v.p.xM, A - 0.18, v.p.xM, A + 0.28, { color: v.color.steel, dash: true, width: 1 })
    v.wave(m, yOf, 0, xEnd, { dots: dots, color: v.color.ink, width: 2 })
    v.ball(m, v.p.xM, s.yM, 0.13)
    v.label(m, v.p.xM + 0.42, s.yM, 'M', { place: 'right' })
    v.label(m, v.p.xM, 0, 'N', { place: 'left' })
    v.label(m, v.p.xM, -A, 'P', { place: 'left' })
    v.label(m, v.p.xQ, A, 'Q', { place: 'right' })
    const hy = s.yHand
    const hx = -0.72
    v.rope(m, [[hx + 0.28, hy], [0, hy]])
    v.path(m, [[hx - 0.16, hy + 0.16], [hx + 0.22, hy + 0.16], [hx + 0.3, hy + 0.05], [hx + 0.3, hy - 0.05], [hx + 0.22, hy - 0.16], [hx - 0.16, hy - 0.16]], { close: true, fill: v.color.graphite, color: v.color.ink, width: 1.2 })
    v.rect(m, hx - 0.42, hy - 0.11, 0.28, 0.22, { fill: v.color.graphite, color: v.color.ink, width: 1.2 })
    if (Math.abs(s.yM) < A - 0.08) {
      v.vec(m, v.p.xM + 0.55, s.yM, 0, s.yM > 0 ? -0.5 : 0.5, { kind: 'velocity', label: 'v_M' })
    }
  },
})
</Sim>

## 结合图像看关键时刻

$t=0$ 时 M 在波峰，位移为 $+A$。波形向右传，M 左侧的位移比 M 低，所以 M 接下来向下运动。$t=T/4$ 时经过平衡位置 N，$t=T/2$ 时到达波谷高度 P。整个过程中 M 的横坐标不变，所以不会到 Q。

<Plot title="M 的振动图像" x={{name: "tt", label: "t", unit: "s", min: 0, max: 4}} y={{label: "y_M", unit: "m", min: -1.3, max: 1.3}} series={[{label: "y_M", expr: "A*cos(2*pi*f*tt)", color: "velocity"}]} marks={[{x: 0, label: "波峰"}, {x: "0.25/f", label: "经过 N"}, {x: "0.5/f", label: "到达 P"}]} cursor="t" caption="质点只在自己的平衡位置上下振动" />

## 答案汇总

经过半个周期，M 处的质点运动至 $\boxed{\text{P}}$ 处。加快抖动使频率增大，波速 $\boxed{\text{不变}}$。
