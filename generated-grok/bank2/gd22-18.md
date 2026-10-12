---
id: gd22-18
title: 半罐液体里的激光
source: 2022 广东卷 第 18 题（选考·选修 3-4，计算；选考共 12 分，原卷未单列本题分值）
question: 一个水平放置的圆柱形罐体内装了一半的透明液体，液体上方是空气，其截面如图所示。一激光器从罐体底部 P 点沿着罐体的内壁向上移动，它所发出的光束始终指向圆心 O 点。当光束与竖直方向成 45° 角时，恰好观察不到从液体表面射向空气的折射光束。已知光在空气中的传播速度为 c，求液体的折射率 n 和激光在液体中的传播速度 v。
answers:
  - { name: n, value: 1.41421, unit: "" }
  - { name: v, value: 2.12132e8, unit: m/s }
---

圆柱罐水平放置，液体装到一半，液面过圆心 O。激光器贴着内壁移动，光束始终指向 O：光沿半径射向圆心，先正入射进入液体，再在液面处从液体射向空气。

液面水平，法线竖直。光束与竖直方向成的角就是液面处的入射角。题目没有给 c 的数值，下面取代表值 c = 3.00×10⁸ m/s，方便把 v 算成数。

<Param name="c" label="空气中光速" symbol="c" value={3e8} min={2.5e8} max={3.5e8} step={1e7} unit="m/s" format="sci" digits={2} />

<Param name="theta" label="光束与竖直方向的夹角" symbol="θ" value={45} min={20} max={70} step={1} unit="°" />

<Define name="n" expr="1/sin(deg(45))" />

<Define name="v" expr="c/n" />

<Define name="C" expr="asin(1/n)*180/pi" />

<Question text="液体的折射率 n" hint="光束与竖直方向成 45° 时恰好全反射" set={{theta: 45}} />

<Question text="激光在液体中的传播速度 v" hint="v = c/n，c 取 3.00×10⁸ m/s" set={{theta: 45}} />

<Status cases={[
  {when: "theta > C + 0.05", label: "入射角大于临界角，液面全反射", tone: "info"},
  {when: "abs(theta - C) <= 0.05", label: "恰好全反射，看不到折射光束", tone: "success"},
  {label: "仍有折射光束进入空气", tone: "neutral"}
]} />

<Readout items={[
  {label: "液面入射角", symbol: "i", expr: "theta", unit: "°", digits: 0},
  {label: "临界角", symbol: "C", expr: "C", unit: "°", digits: 1},
  {label: "折射率", symbol: "n", expr: "n", digits: 3},
  {label: "液体中光速", symbol: "v", expr: "v", unit: "m/s", format: "sci", digits: 3}
]} />

<Answer items={[
  {label: "折射率", symbol: "n", expr: "n", value: 1.41421, digits: 3},
  {label: "液体中的光速", symbol: "v", expr: "v", value: 2.12132e8, unit: "m/s", format: "sci", digits: 3}
]} />

<Optics
  name="lt"
  n0={1}
  length={4}
  media={[{name: "liq", n: "n", shape: {cx: 0, cy: 0, r: 1, from: 180, to: 360}}]}
  rays={[{name: "beam", from: ["1.35*sin(deg(theta))", "-1.35*cos(deg(theta))"], angle: "90+theta", color: "red"}]}
/>

<Figure title="半罐液体中的光路" height={420} note="圆半径取 1，不按比例。罐壁是很薄的透明壁，光正入射进入液体，不发生偏折。" params={["lt", "theta"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -1.7, xmax: 1.7, ymin: -1.65, ymax: 1.55, equal: true })
    v.optics(m, p.lt, { normals: true, angles: true })
    v.ellipse(m, 0, 0, 1, 1, { color: v.color.ink, width: 2.5 })
    v.line(m, -1.22, 0, 1.22, 0, { color: v.color.steel, dash: true })
    v.line(m, 0, -1.22, 0, 1.22, { color: v.color.steel, dash: true })
    v.circle(m, 0, 0, 0.016, { fill: v.color.ink })
    v.label(m, 0.12, 0.12, "O", { place: "above-right" })
    v.label(m, 0, -1.08, "P", { place: "below" })
    v.label(m, -0.55, 0.42, "空气", { place: "above" })
    v.label(m, 0.62, -0.38, "液体", { place: "right" })
    const a = (90 + p.theta) * Math.PI / 180
    v.label(m, 1.35 * Math.cos(a), 1.35 * Math.sin(a), "激光器", { place: "below-left" })
  },
})
</Figure>

## 分析

激光器贴着圆周内壁，光束指向圆心 O，所以进入液体时沿半径，与壁面法线重合，入射角为 0。由斯涅尔定律，这一次折射不改变方向，光束仍沿直线射向 O。

液面是过 O 的水平面，法线竖直向上。光束与竖直方向的夹角 θ 就是液面处的入射角。题目说：θ = 45° 时恰好观察不到射向空气的折射光束，也就是光从液体射向空气时恰好发生全反射。因此 45° 就是临界角 C。

拖动 θ：小于 45° 时液面上还有一条进入空气的折射光束；等于 45° 时折射光消失，光沿液面抠出去；再大就全反射回液体。

## 解答

液体对空气的临界角满足

$$
\sin C = \frac{1}{n}
$$

恰好全反射时 C = 45°，所以

$$
n = \frac{1}{\sin 45^\circ} = \sqrt{2}
$$

光在介质中的传播速度与折射率成反比。空气折射率取 1，液体中

$$
v = \frac{c}{n} = \frac{\sqrt{2}}{2}\,c
$$

取 c = 3.00×10⁸ m/s，得 n = 1.41，v = 2.12×10⁸ m/s。
