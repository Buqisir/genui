---
id: seg-sd25-03
title: 双缝干涉与偏振片
source: 2025 山东卷 第 3 题（单选，3 分）
topic: 光的干涉与偏振
givens: ["S₁、S₂ 关于 x 轴对称", "P₁ 在双缝左侧、P₂ 在双缝右侧", "P₁、P₂ 透振方向开始时平行", "P₂ 绕 x 轴转 90°"]
question: "用如图所示的装置观察光的干涉和偏振现象。狭缝 S_1、S_2 关于 x 轴对称，光屏垂直于 x 轴放置。将偏振片 P_1 垂直于 x 轴置于双缝左侧，单色平行光沿 x 轴方向入射，在屏上观察到干涉条纹，再将偏振片 P_2 置于双缝右侧，P_1、P_2 透振方向平行。保持 P_1 不动，将 P_2 绕 x 轴转动 90° 的过程中，关于光屏上的干涉条纹，下列说法正确的是（　　）\nA. 条纹间距不变，亮度减小\nB. 条纹间距增大，亮度不变\nC. 条纹间距减小，亮度减小\nD. 条纹间距不变，亮度增大"
choice: A
answers:
  - { name: dxCalc, value: 3, unit: mm }
---

P₂ 转动会不会影响条纹？要分开看「间距」和「亮度」两件事。

<Segment title="P₂ 转动，条纹间距变不变" quote="狭缝 S_1、S_2 关于 x 轴对称，光屏垂直于 x 轴放置……**单色平行光**沿 x 轴方向入射，在屏上观察到干涉条纹" hint="拖动 P₂ 的转角，从 0° 拖到 90°。" watch="条纹间距 Δx 的读数一直不变；转角只改变亮暗，不改变条纹位置。" ask="P₂ 转动时，L、λ、d 哪个变了？条纹间距变不变？" reveal="L、λ、d 都没变，Δx = Lλ/d 不变。P₂ 在双缝右侧，两束光一起穿过它，相位差不受影响。" />

单色平行光先经过 $P_1$ 变成偏振光，再经双缝形成两列相干光，在屏上叠加出干涉条纹。相邻亮条纹的间距

$$
\Delta x = \frac{L}{d}\lambda
$$

$P_2$ 放在双缝之后，只改变到达屏的光的强弱，不改变波长 $\lambda$、双缝间距 $d$ 和缝到屏的距离 $L$，所以 $\Delta x$ 不变。代表值取 $\lambda = 600\ \mathrm{nm}$、$d = 0.20\ \mathrm{mm}$、$L = 1.0\ \mathrm{m}$，$\Delta x = 3.0\ \mathrm{mm}$。

<Param name="phi" label="P_2 的转角" symbol="φ" value={0} min={0} max={90} step={1} unit="°" />

<Param name="lam" label="波长" symbol="λ" value={600} hidden />

<Param name="dslit" label="双缝间距" symbol="d" value={0.2} hidden />

<Param name="Lscr" label="缝到屏的距离" symbol="L" value={1} hidden />

<Define name="ratio" expr="cos(deg(phi))^2" />

<Define name="dxCalc" expr="Lscr*lam*1e-9/(dslit*1e-3)*1e3" />

<Readout items={[
  {label: "条纹间距", symbol: "Δx", expr: "dxCalc", unit: "mm", digits: 2}
]} />

<Figure title="装置俯视图" height={320} params={["phi", "ratio", "lam"]} note="尺寸不按比例；上方两个圆是正对光线看到的偏振片，线段是透振方向">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.4, xmax: 10.4, ymin: -2.2, ymax: 3.6, equal: true })
    const light = v.lightColor(p.lam)
    v.line(m, -0.2, 0, 10.2, 0, { color: v.color.steel, dash: true, width: 1 })
    v.label(m, 10.15, 0.25, 'x', { place: 'above' })
    // 入射平行光
    for (const y of [-0.9, -0.3, 0.3, 0.9]) v.arrow(m, -0.2, y, 1.1, y, { color: light, width: 2 })
    // P1、双缝、P2、屏
    v.block(m, 1.5, 0, 0.16, 3.0, { pivot: 'center', shadow: false })
    v.label(m, 1.5, -1.75, 'P_1', { place: 'below' })
    v.bar(m, 3.6, 1.5, 3.6, 0.55, { thick: 6 })
    v.bar(m, 3.6, 0.35, 3.6, -0.35, { thick: 6 })
    v.bar(m, 3.6, -0.55, 3.6, -1.5, { thick: 6 })
    v.label(m, 3.3, 0.95, 'S_1', { place: 'left' })
    v.label(m, 3.3, -0.95, 'S_2', { place: 'left' })
    v.block(m, 5.8, 0, 0.16, 3.0, { pivot: 'center', shadow: false })
    v.label(m, 5.8, -1.75, 'P_2', { place: 'below' })
    v.block(m, 9.4, 0, 0.14, 3.2, { pivot: 'center', shadow: false })
    v.label(m, 9.4, -1.85, '光屏', { place: 'below' })
    // P1 与双缝之间、双缝与 P2 之间的光强相同；P2 之后按 cos²φ 变细
    v.line(m, 1.6, 0.45, 3.5, 0.45, { color: light, width: 2 })
    v.line(m, 1.6, -0.45, 3.5, -0.45, { color: light, width: 2 })
    for (const [y0, y1] of [[0.45, 0.9], [0.45, -0.2], [-0.45, 0.2], [-0.45, -0.9]]) {
      v.line(m, 3.7, y0, 5.7, y0 + (y1 - y0) * 0.45, { color: light, width: 2 })
      if (p.ratio > 0.01) v.line(m, 5.9, y0 + (y1 - y0) * 0.5, 9.3, y1, { color: light, width: Math.max(0.6, 3 * p.ratio) })
    }
    // 正对光线看偏振片：透振方向
    const face = (cx, ang, tag) => {
      v.circle(m, cx, 2.55, 0.55, { color: v.color.steel, width: 1.4 })
      const a = (ang * Math.PI) / 180
      v.line(m, cx - 0.45 * Math.sin(a), 2.55 + 0.45 * Math.cos(a), cx + 0.45 * Math.sin(a), 2.55 - 0.45 * Math.cos(a), { color: v.color.ink, width: 2 })
      v.label(m, cx + 0.75, 2.55, tag, { place: 'right' })
    }
    face(1.5, 0, 'P_1')
    face(5.8, p.phi, 'P_2')
    v.text(m, 5.8, 1.75, 'φ = ' + Math.round(p.phi) + '°', { size: 12 })
  },
})
</Figure>

<Segment title="P₂ 转 90° 的过程中，亮度怎么变" quote="**P_1、P_2 透振方向平行**。保持 P_1 不动，将 **P_2 绕 x 轴转动 90°** 的过程中" hint="继续拖动转角，从 0° 到 90°。" watch="条纹位置一直不动；「相对光强」从 1 一路降到 0（按 cos²φ 减小），转到 90° 时屏上几乎全暗。" ask="转动过程中，条纹亮度怎么变？" reveal="透过 P₂ 的光强 I = I₀cos²φ，φ 从 0° 到 90° 一路减小，所以亮度减小、间距不变，选 A。" />

经过 $P_1$ 和双缝的光，振动方向沿 $P_1$ 的透振方向。$P_2$ 的透振方向与它成 $\varphi$ 角时，透过 $P_2$ 的光强按马吕斯定律

$$
I = I_0\cos^2\varphi
$$

$\varphi$ 从 $0$ 增大到 $90^\circ$，$\cos^2\varphi$ 从 1 减小到 0，屏上条纹一路变暗，转到 $90^\circ$ 时几乎看不到。两列光都经过同一块 $P_2$，偏振方向相同，仍然相干，所以条纹的位置和间距不变，只是整体变暗。

<Readout items={[
  {label: "相对光强", symbol: "I/I_0", expr: "ratio", digits: 2, color: "charge"}
]} />

<Fringes title="屏上的干涉条纹" type="double" lambda="lam" d="dslit" L="Lscr" read={{dx: "dx"}} note="间距始终不变；这张图不画亮度，亮度看下面的相对光强曲线" />

<Plot title="透过 P_2 的相对光强" size="wide"
  caption="I/I_0 = cos²φ：转角越大，屏上越暗；间距不受影响"
  x={{name: "a", label: "φ", unit: "°", min: 0, max: 90}}
  y={{label: "I/I_0", min: 0, max: 1.1}}
  series={[{label: "相对光强", expr: "cos(deg(a))^2", color: "charge"}]}
  cursor="phi"
/>

<Segment title="完整解答" />

**条纹间距。** 相邻亮条纹的间距

$$
\Delta x = \frac{L}{d}\lambda
$$

$P_2$ 转动时，$L$、$d$、$\lambda$ 都不变，所以 $\boxed{\Delta x \text{ 不变}}$。代表值下 $\Delta x = 3.0\ \mathrm{mm}$。

**亮度。** 经过 $P_1$ 和双缝的光，振动方向沿 $P_1$ 的透振方向。$P_2$ 的透振方向与它成 $\varphi$ 角时，透过 $P_2$ 的光强按马吕斯定律

$$
I = I_0\cos^2\varphi
$$

$\varphi$ 从 $0$ 增大到 $90^\circ$，$\cos^2\varphi$ 从 1 减小到 0，屏上条纹 $\boxed{\text{逐渐变暗}}$，转到 $90^\circ$ 时完全看不到。两列光都经过同一块 $P_2$，偏振方向始终相同，仍然相干，所以条纹的位置和间距不变，只是整体变暗。

**A 正确。** 间距不变，亮度减小。

**B 错误。** 间距不变；亮度减小，不是不变。

**C 错误。** 间距不变，不会减小。

**D 错误。** 亮度减小，不会增大。

<Answer items={[{label: "答案", text: "A"}, {label: "条纹间距", symbol: "Δx", expr: "dxCalc", value: 3, unit: "mm"}, {label: "亮度", text: "I = I_0 cos²φ，随转角减小"}]} />
