---
id: gd22-10
title: 地面下的长直导线
source: 2022 广东卷 第 10 题（多选，6 分）
question: 如图所示，水平地面（Oxy 平面）下有一根平行于 y 轴且通有恒定电流 I 的长直导线。P、M 和 N 为地面上的三点，P 点位于导线正上方，MN 平行于 y 轴，PN 平行于 x 轴。一闭合的圆形金属线圈，圆心在 P 点，可沿不同方向以相同的速率做匀速直线运动，运动过程中线圈平面始终与地面平行。下列说法正确的有（ ）
choice: AC
answers: []
---

地面是 Oxy 平面，长直导线在地面下深度 h 处、与 y 轴平行，通恒定电流 I。P 在导线正上方。MN 平行于 y 轴、PN 平行于 x 轴，所以 M 与 N 的横坐标相同，两点在导线的同一侧，到导线的垂直距离都是同一个 r。

长直导线的磁感应强度大小 $B=\dfrac{\mu_0 I}{2\pi r}$，方向沿以导线为轴的圆周的切线，由右手螺旋定则确定。题目没有给数值，下面取 I = 10 A、h = 1 m、PN = 1 m、MN = 1 m、线圈半径 R = 0.3 m、速率 v = 1 m/s 作代表性数值，只用来比较大小和方向，图不按比例。

## 完整解答

设导线在 x = 0、深度 h 处，地面上一点的水平坐标为 x。它到导线的距离

$$
r=\sqrt{x^2+h^2}
$$

磁感应强度大小为

$$
B=\frac{\mu_0 I}{2\pi r}
$$

把它分解到水平分量和竖直分量：水平分量沿 x 轴方向，大小为 $B\,h/r$；竖直分量大小为 $B\,|x|/r$，导线两侧的竖直分量方向相反。取 I 沿 +y，右手螺旋定则给出：x > 0 一侧竖直分量向下，x < 0 一侧向上。磁场沿导线方向不变，所以地面上同一横坐标的各点 B 完全相同。

线圈平面始终水平，穿过线圈的磁通量只由竖直分量 B_z 决定。B_z 是 x 的奇函数：圆心在导线正上方时，线圈关于导线左右对称，穿进与穿出相抵，磁通量为零；整个线圈移到导线一侧后，对称性破坏，磁通量不再为零。

**A 正确。** M、N 的横坐标相同，只有沿导线的纵坐标不同。两点到导线的距离相等，水平分量和竖直分量都相同，所以 $|B_M|=|B_N|$，方向也相同。

**B 错误。** 线圈沿 PN 移动时圆心沿 x 轴离开导线正上方。在 P 点左右两半的竖直磁通等大反向，磁通量为 0；移到 N 后整个线圈在导线一侧，竖直分量同号，磁通量不再为 0。所以沿 PN 运动时磁通量在变。磁通量不变的是平行于导线的 y 方向。

**C 正确。** 线圈从 P 竖直上升时，圆心仍在导线正上方。任一高度都保持左右对称，穿进与穿出相抵，磁通量始终为 0。磁通量不变，感应电动势为 0，闭合线圈里没有感应电流。

**D 错误。** M 与 N 横坐标相同，线圈到达这两点时磁通量相同；两过程都从 P 出发，磁通量都从 0 变到同一个值，所以 $\Delta\Phi$ 相同。但 P 到 M 的路程比 P 到 N 长：代表值下 $PN = 1\ \mathrm{m}$，$PM = \sqrt{PN^2+MN^2} = \sqrt{2}\ \mathrm{m}$。速率相同，用时之比为 $PM/PN = \sqrt{2}$。平均感应电动势 $\bar\varepsilon = |\Delta\Phi|/\Delta t$，用时更长的那一段更小，两者不相等。

所以选

$$
\boxed{AC}
$$

## 交互演示

正视图看导线横截面：电流指向读者，磁感线逆时针。拖动位移，比较 M、N 的磁感应强度，并看侧栏里穿过线圈的磁通量。斜视图对应题图：导线在地面下、平行于 y 轴，线圈平放，M 比 N 更靠后。

<Param name="mode" label="线圈怎么动" options={[{value: 0, label: "沿 PN（x 轴）"}, {value: 1, label: "竖直上升"}, {value: 2, label: "朝 M（斜向）"}]} value={0} />

<Param name="s" label="移过的距离" value={0} min={0} max={1.2} step={0.02} unit="m" />

<Param name="I" label="电流 I" value={10} min={1} max={20} step={1} unit="A" />

<Param name="h" label="导线深度 h" value={1} min={0.4} max={2} step={0.05} unit="m" />

<Param name="d" label="PN = MN" value={1} min={0.4} max={2} step={0.05} unit="m" />

<Param name="R" label="线圈半径 R" value={0.3} min={0.1} max={0.6} step={0.02} unit="m" />

<Param name="mu0" value={1.2566e-6} hidden />

<Define name="cx" expr="mode == 1 ? 0 : (mode == 2 ? -s*0.7071 : -s)" />

<Define name="cz" expr="mode == 1 ? s : 0" />

<Define name="cy" expr="mode == 2 ? s*0.7071 : 0" />

<Define name="rN" expr="sqrt(d*d + h*h)" />

<Define name="BM" expr="mu0*I/(2*pi*rN)" />

<Define name="BN" expr="mu0*I/(2*pi*rN)" />

<Define name="BxM" expr="BM*h/rN" />

<Define name="BzM" expr="BM*d/rN" />

<Define name="BxN" expr="BN*h/rN" />

<Define name="BzN" expr="BN*d/rN" />

<Define name="Hcoil" expr="h + cz" />

<Define name="flux" expr="(mu0*I/(2*pi))*R*(0.236926885*2*sqrt(R*R-(R*0.906179846)^2)*Hcoil/((cx-R*0.906179846)^2+Hcoil*Hcoil) + 0.4786286705*2*sqrt(R*R-(R*0.5384693101)^2)*Hcoil/((cx-R*0.5384693101)^2+Hcoil*Hcoil) + 0.5688888889*2*R*Hcoil/(cx*cx+Hcoil*Hcoil) + 0.4786286705*2*sqrt(R*R-(R*0.5384693101)^2)*Hcoil/((cx+R*0.5384693101)^2+Hcoil*Hcoil) + 0.236926885*2*sqrt(R*R-(R*0.906179846)^2)*Hcoil/((cx+R*0.906179846)^2+Hcoil*Hcoil))" />

<Define name="dPhi" expr="(mu0*I/(2*pi))*R*(0.236926885*2*sqrt(R*R-(R*0.906179846)^2)*h/((-d-R*0.906179846)^2+h*h) + 0.4786286705*2*sqrt(R*R-(R*0.5384693101)^2)*h/((-d-R*0.5384693101)^2+h*h) + 0.5688888889*2*R*h/(d*d+h*h) + 0.4786286705*2*sqrt(R*R-(R*0.5384693101)^2)*h/((-d+R*0.5384693101)^2+h*h) + 0.236926885*2*sqrt(R*R-(R*0.906179846)^2)*h/((-d+R*0.906179846)^2+h*h))" />

<Define name="tN" expr="d" />

<Define name="tM" expr="d*1.414213562" />

<Define name="emfN" expr="dPhi/tN*1e9" />

<Define name="emfM" expr="dPhi/tM*1e9" />

<Question text="A. N 点与 M 点的磁感应强度大小相等，方向相同" set={{mode: 0, s: 0}} hint="两点横坐标相同，在导线同一侧，大小和方向都相同" />

<Question text="B. 线圈沿 PN 方向运动时，穿过线圈的磁通量不变" set={{mode: 0, s: 0.8}} hint="拖动位移，磁通量从 0 变到非零" />

<Question text="C. 线圈从 P 点开始竖直向上运动时，线圈中无感应电流" set={{mode: 1, s: 0.6}} hint="左右对称保持，磁通量始终为 0" />

<Question text="D. 线圈从 P 到 M 过程的感应电动势与从 P 到 N 过程的感应电动势相等" set={{mode: 2, s: 1.414}} hint="磁通量变化量相同，但 P 到 M 用时更长" />

<Preset label="回到 P 点" set={{mode: 0, s: 0}} />

<Preset label="沿 PN 移到 N" set={{mode: 0, s: 1}} />

<Preset label="竖直上升" set={{mode: 1, s: 0.8}} />

<Status cases={[
  {when: "mode == 0", label: "沿 PN：磁通量从 0 变到非零", tone: "warning"},
  {when: "mode == 1", label: "竖直上升：磁通量始终为 0，无感应电流", tone: "success"},
  {label: "朝 M：与朝 N 的 ΔΦ 相同，用时更长", tone: "info"}
]} />

<Readout items={[
  {label: "M 点 B", symbol: "B_M", expr: "BM*1e6", unit: "μT", digits: 2, color: "field"},
  {label: "N 点 B", symbol: "B_N", expr: "BN*1e6", unit: "μT", digits: 2, color: "field"},
  {label: "M 的竖直分量", symbol: "B_{zM}", expr: "BzM*1e6", unit: "μT", digits: 2, color: "field"},
  {label: "N 的竖直分量", symbol: "B_{zN}", expr: "BzN*1e6", unit: "μT", digits: 2, color: "field"},
  {label: "穿过线圈的磁通量", symbol: "Φ", expr: "flux*1e6", unit: "μWb", digits: 2, color: "field"},
  {label: "P 到 N 平均电动势", symbol: "\\bar\\varepsilon_N", expr: "emfN", unit: "nV", digits: 2, color: "charge"},
  {label: "P 到 M 平均电动势", symbol: "\\bar\\varepsilon_M", expr: "emfM", unit: "nV", digits: 2, color: "charge"}
]} />

<Answer items={[
  {label: "答案", text: "AC"},
  {label: "A", text: "正确：同一侧、横坐标相同，大小和方向都相同"},
  {label: "B", text: "错误：沿 PN 离开导线正上方，磁通量从 0 变到非零"},
  {label: "C", text: "正确：竖直上升仍左右对称，磁通量始终为 0"},
  {label: "D", text: "错误：ΔΦ 相同，但 P 到 M 用时更长，平均电动势更小"}
]} />

<Figure title="正视：导线横截面" height={420} size="wide" params={["mode", "cx", "cz", "h", "d", "R", "BxM", "BzM", "BxN", "BzN", "BM"]} note="正视看 +y 方向；电流指向读者，磁感线逆时针。M 与 N 重合在导线左侧。矢量长度不按比例。" legend={[{kind: "field", label: "磁感应强度"}, {kind: "charge", label: "电流 I"}]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2.7, xmax: 2.7, ymin: -2.6, ymax: 2.5, equal: true })
    v.ground(m, -2.6, 2.6, 0, { thick: 18 })
    v.wire(m, 0, -p.h, { dir: 'out', label: 'I', rings: [34, 62, 96] })
    v.line(m, 0, -p.h, 0, 0, { color: v.color.steel, dash: true })
    v.dim(m, 0.18, -p.h, 0.18, 0, 'h')

    const scale = 0.55 / Math.max(p.BM, 1e-9)
    v.vec(m, -p.d, 0, p.BxN * scale, p.BzN * scale, { kind: 'field', label: 'M、N' })
    v.vec(m, 0, 0, p.BxM * scale, 0, { kind: 'field', label: 'P' })

    const z = p.cz
    v.ellipse(m, p.cx, z, p.R, p.R, { color: v.color.charge, width: 2 })
    v.label(m, p.cx, z + p.R + 0.28, '线圈')
  },
})
</Figure>

<Figure title="题图：地面下的导线" height={300} size="narrow" params={["cx", "cy", "cz", "h", "d", "R"]} note="斜视对应题图：导线平行于 y 轴。M 比 N 更靠后，两点在导线同一侧。透视不按比例。">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -1.7, xmax: 2.15, ymin: -1.55, ymax: 1.35, equal: true })
    const X = (x, y) => 0.62 * x - 0.42 * y
    const Y = (x, y, z) => 0.22 * x + 0.34 * y + z
    const slab = [[-1.7, -1.5], [1.9, -1.5], [1.9, 1.6], [-1.7, 1.6]]
    v.path(m, slab.map(([x, y]) => [X(x, y), Y(x, y, 0)]), { close: true, fill: v.color.enamel, outline: v.color.steel })
    v.path(m, [[X(1.9, -1.5), Y(1.9, -1.5, 0)], [X(1.9, 1.6), Y(1.9, 1.6, 0)], [X(1.9, 1.6), Y(1.9, 1.6, -0.35)], [X(1.9, -1.5), Y(1.9, -1.5, -0.35)]], { close: true, fill: v.color.graphite, outline: v.color.steel })
    v.path(m, [[X(-1.7, -1.5), Y(-1.7, -1.5, 0)], [X(1.9, -1.5), Y(1.9, -1.5, 0)], [X(1.9, -1.5), Y(1.9, -1.5, -0.35)], [X(-1.7, -1.5), Y(-1.7, -1.5, -0.35)]], { close: true, fill: v.color.steel, outline: v.color.steel })

    const zW = -Math.min(p.h, 1.15)
    v.bar(m, X(0, -1.35), Y(0, -1.35, zW), X(0, 1.35), Y(0, 1.35, zW), { thick: 4 })
    v.arrow(m, X(0, -0.2), Y(0, -0.2, zW), X(0, 0.7), Y(0, 0.7, zW), { color: v.color.charge })
    v.label(m, X(0.35, 0.15), Y(0.35, 0.15, zW), 'I')
    v.line(m, X(0, 0), Y(0, 0, zW), X(0, 0), Y(0, 0, 0), { color: v.color.steel, dash: true })

    const ox = X(-1.7, -1.5)
    const oy = Y(-1.7, -1.5, 0)
    v.arrow(m, ox, oy, X(-1.7, 0.2), Y(-1.7, 0.2, 0), { color: v.color.ink })
    v.arrow(m, ox, oy, X(-0.3, -1.5), Y(-0.3, -1.5, 0), { color: v.color.ink })
    v.label(m, X(-1.85, 0.35), Y(-1.85, 0.35, 0), 'y')
    v.label(m, X(0.05, -1.7), Y(0.05, -1.7, 0), 'x')
    v.label(m, ox - 0.18, oy - 0.16, 'O')

    const py = p.cy
    const pts = []
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * Math.PI * 2
      const x = p.cx + p.R * Math.cos(a)
      const y = py + p.R * Math.sin(a)
      pts.push([X(x, y), Y(x, y, 0.02 + p.cz)])
    }
    v.path(m, pts, { close: true, color: v.color.charge, width: 2 })
    v.label(m, X(p.cx + p.R + 0.15, py), Y(p.cx + p.R + 0.15, py, 0.1 + p.cz), '线圈')
    v.label(m, X(0.12, 0.12), Y(0.12, 0.12, 0.08), 'P')
    v.label(m, X(-p.d, p.d + 0.15), Y(-p.d, p.d + 0.15, 0.08), 'M')
    v.label(m, X(-p.d, -0.05), Y(-p.d, -0.05, 0.12), 'N')
    v.line(m, X(-p.d, -0.15), Y(-p.d, -0.15, 0), X(-p.d, p.d), Y(-p.d, p.d, 0), { color: v.color.steel, dash: true })
    v.line(m, X(-p.d, -0.15), Y(-p.d, -0.15, 0), X(0, -0.15), Y(0, -0.15, 0), { color: v.color.steel, dash: true })
  },
})
</Figure>

<Plot
  title="地面上的磁感应强度"
  size="wide"
  caption="M、N 横坐标相同，落在同一点：B 的大小相等，竖直分量同号"
  x={{name: "u", label: "地面上的 x", unit: "m", min: -2, max: 2}}
  y={{label: "B", unit: "μT", min: -3, max: 3}}
  series={[
    {label: "B", expr: "mu0*I/(2*pi*sqrt(u*u + h*h))*1e6", color: "field"},
    {label: "B_z", expr: "-mu0*I/(2*pi*(u*u + h*h))*u*1e6", color: "field", dash: true}
  ]}
  marks={[{x: "-d", label: "M、N"}, {x: 0, label: "P：B_z = 0"}]}
  cursor="cx"
/>

## 结合图像

正视图里 M 与 N 重合在导线左侧，箭头一样长、指向同一方向，所以 A 正确。曲线上 M、N 是同一个标记，B 和 B_z 都相同。

把线圈沿 PN 拖过去，读数里的磁通量从 0 变到非零，B 错误。改成竖直上升后，圆心仍在导线正上方，左右两半相抵，磁通量停在 0，没有感应电流，C 正确。

朝 M 移动和朝 N 移动到达时磁通量相同，但侧栏里从 P 到 M 的平均电动势只有到 N 的约 0.71 倍，D 错误。

## 答案汇总

选 **AC**。B 把沿 PN 离开导线正上方误认成磁通量不变；D 只看到两过程的 $\Delta\Phi$ 相同，漏掉了 P 到 M 用时更长。
