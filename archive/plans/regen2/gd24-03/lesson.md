---
id: gd24-03
title: 横波传播半个周期后的质点位移
source: 2024 广东卷 第 3 题（单选，4 分）
question: "一列简谐横波沿 x 轴正方向传播。波速为 1 m/s，t = 0 时的波形如图所示。t = 1 s 时，x = 1.5 m 处的质点相对平衡位置的位移为（　　）\nA. 0\nB. 0.1 m\nC. −0.1 m\nD. 0.2 m"
choice: B
answers:
  - { name: yP, value: 0.1, unit: m }
---

t = 0 的波形从原点向上起振：波峰 0.1 m 在 x = 0.5 m，x = 1 m 过衡向下，波谷 −0.1 m 在 x = 1.5 m，x = 2 m 再过衡向上。相邻两个波峰相距一个波长，所以

$$
\lambda = 2\ \mathrm{m},\qquad A = 0.1\ \mathrm{m}.
$$

波速 v = 1 m/s，周期 T = λ/v = 2 s。波沿 +x 传播，t = 0 的波形写成

$$
y(x,0) = A\sin\!\left(\frac{2\pi}{\lambda}x\right) = 0.1\sin(\pi x)\ (\mathrm{m}).
$$

传播距离 Δx = vt，整个波形向 +x 平移。拖动时间看波形向右移、各质点只沿 y 轴振动。

<Param name="t" label="时间" symbol="t" value={1} min={0} max={2} step={0.01} unit="s" />

<Param name="v" label="波速" symbol="v" value={1} hidden />

<Param name="A" label="振幅" symbol="A" value={0.1} hidden />

<Param name="lambda" label="波长" symbol="λ" value={2} hidden />

<Param name="xP" label="质点位置" symbol="x" value={1.5} hidden />

<Define name="T" expr="lambda/v" />

<Define name="yP" expr="A*sin(2*pi/lambda*xP - 2*pi/T*t)" />

<Sim
  title="横波沿 +x 传播"
  height={300}
  duration={2}
  time="t"
  params={["v", "A", "lambda", "xP"]}
  marks={[
    {t: 0, label: "题图波形"},
    {t: 1, label: "t = 1 s"}
  ]}
  hud={[
    {symbol: "y", label: "x = 1.5 m 的位移", expr: "yP", unit: "m", digits: 2},
    {symbol: "Δx", label: "波形平移", expr: "v*t", unit: "m", digits: 2}
  ]}
  legend={[{kind: "velocity", label: "波形"}]}
  note="质点只上下振动；波形向 +x 平移。波长 2 m，振幅 0.1 m。"
>
sim({
  at(t, p) {
    const k = (2 * Math.PI) / p.lambda
    return { yP: p.A * Math.sin(k * p.xP - (2 * Math.PI / (p.lambda / p.v)) * t) }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -0.35, xmax: 4.15, ymin: -0.22, ymax: 0.28, pad: 28 })
    const p = v.p
    const k = (2 * Math.PI) / p.lambda
    v.line(m, -0.05, p.A, 3.55, p.A, { color: v.color.steel, dash: true, width: 1 })
    v.line(m, -0.05, -p.A, 3.55, -p.A, { color: v.color.steel, dash: true, width: 1 })
    v.label(m, 3.6, p.A, '0.1', { place: 'right' })
    v.label(m, 3.6, -p.A, '−0.1', { place: 'right' })
    v.axisX(m, { y: 0, from: 0, to: 3.5, step: 1, unit: 'm' })
    const omega = (2 * Math.PI * p.v) / p.lambda
    // t = 0 时下一个波谷在 x = 3.5，右端在它之前截断，和题图一致。
    v.wave(m, (x) => p.A * Math.sin(k * x - omega * v.t), 0, 3.4, {
      color: v.color.velocity,
      dots: [p.xP],
    })
    v.arrow(m, 2.55, 0.2, 3.25, 0.2, { color: v.color.velocity })
    v.label(m, 2.9, 0.2, 'v', { place: 'above', color: v.color.velocity })
    v.label(m, p.xP, s.yP, 'P', { place: 'right' })
    v.label(m, 0, 0, 'O', { place: 'below-left' })
  },
})
</Sim>

<Plot
  title="x = 1.5 m 处质点的振动"
  caption="质点只沿 y 轴振动，周期 T = 2 s"
  size="wide"
  x={{name: "t", label: "t", unit: "s", min: 0, max: 2}}
  y={{label: "y", unit: "m", min: -0.14, max: 0.14}}
  series={[{label: "y_P", expr: "A*sin(2*pi/lambda*xP - 2*pi/T*t)", color: "velocity"}]}
  marks={[
    {x: 0, label: "波谷 −0.1 m"},
    {x: 0.5, label: "过平衡位置"},
    {x: 1, label: "波峰 0.1 m"}
  ]}
  cursor="t"
/>

<Readout items={[
  {label: "周期", symbol: "T", expr: "T", unit: "s", digits: 1},
  {label: "x = 1.5 m 的位移", symbol: "y", expr: "yP", unit: "m", digits: 2, color: "velocity"}
]} />

<Question text="A. 0" set={{t: 0.5}} hint="过平衡位置在 t = 0.5 s；t = 1 s 已到波峰" />

<Question text="B. 0.1 m" set={{t: 1}} hint="半个周期后，波谷上的质点到达波峰" />

<Question text="C. −0.1 m" set={{t: 0}} hint="这是 t = 0 的位移；再过半个周期就翻到波峰" />

<Question text="D. 0.2 m" set={{t: 1}} hint="0.2 m 已经超出振幅 0.1 m" />

<Answer items={[
  {label: "答案", text: "B"},
  {label: "t = 1 s 的位移", symbol: "y", expr: "yP", value: 0.1, unit: "m", digits: 2}
]} />

## 完整解答

由波形读出 λ = 2 m、A = 0.1 m。波速 1 m/s，所以周期

$$
T = \frac{\lambda}{v} = \frac{2}{1}\ \mathrm{s} = 2\ \mathrm{s}.
$$

从 t = 0 到 t = 1 s，波形向 +x 平移

$$
\Delta x = vt = 1 \times 1\ \mathrm{m} = 1\ \mathrm{m} = \frac{\lambda}{2}.
$$

t = 0 时，x = 1.5 m 正是波谷，位移为 −0.1 m。波形向右平移半个波长，原来 x = 0.5 m 处的波峰到达 x = 1.5 m。同一质点振动了半个周期，从波谷翻到波峰：

$$
y = A\sin\!\left(\frac{2\pi}{\lambda}x - \frac{2\pi}{T}t\right),\qquad y(1.5,\,1) = 0.1\sin(1.5\pi - \pi) = 0.1\sin(0.5\pi) = 0.1\ \mathrm{m}.
$$

质点本身不随波迁移，只在平衡位置上下振动。

**A. 0　错误。** 该质点经过平衡位置是在 t = T/4 = 0.5 s，此时波形只平移了 0.5 m。t = 1 s 已经是半个周期，质点在波峰，位移不是 0。

**B. 0.1 m　正确。** 半个周期内，波谷上的质点振动到波峰，位移由 −0.1 m 变为 +0.1 m。波形右移 1 m 后，原来 x = 0.5 m 的波峰正好落在 x = 1.5 m。

**C. −0.1 m　错误。** 这是 t = 0 时该点的位移。再过半个周期，它已经离开波谷到达波峰，不会停在 −0.1 m。

**D. 0.2 m　错误。** 振幅只有 0.1 m，位移不可能超出 ±0.1 m。0.2 m 既不是振幅，也不是这段时间的位移。
