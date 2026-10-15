---
id: _demo-segment-zj2601-18
title: 应变片磁场检测芯片（分段样板）
source: 2026 浙江 1 月 第 18 题（11 分）
topic: 安培力与电桥
demo: true
givens: ["ab、cd 长 l，电流 I_0，方向相反", "B 水平向右，垂直于杆", "四片 |ΔR| 相同", "ΔR = αF", "电源 E，不计内阻", "无磁场时 U_ef = 0"]
question: 测量局域磁场，科学家基于电阻应变片开发出一种磁场检测芯片，其简化结构如图1所示。长度均为 l、通有恒定电流 I_0（方向相反）的两刚性金属杆 ab、cd，与具有良好弹性的绝缘悬梁 OA、OD 构成“H”形支架，对称固定于底座 O 处。在悬梁上、下表面对称安装四个相同的电阻应变片（各自引出两导线），其阻值分别为 R_1、R_2、R_3 和 R_4，将它们按图2方式与电动势为 E 的电源（不计内阻）相连。未加磁场时，支架处于水平平衡状态，此时 R_1 = R_2 = R_3 = R_4 = R_0，测得 e、f 两端的电势差为 0。现施加待测磁场，其方向水平向右、且垂直于金属杆，则金属杆 ab、cd 受安培力作用，使悬梁 OA、OD 产生形变，四个应变片的阻值发生相应变化，其变化量的绝对值均为 ΔR，此时测得 e、f 两端的电势差为 U_ef，从而得到待测磁场磁感应强度 B 的大小。(1) 判断金属杆 ab 和 cd 所受安培力的方向；(2) 写出上述四个电阻的阻值（用 R_0 和 ΔR 表示）；(3) 已知电阻变化量和所受的安培力成正比关系，且比例系数为 α，求 U_ef 与 B 之间的关系。
answers:
  - { name: dR, value: 0.1, unit: Ω }
  - { name: Uef, value: 0.006, unit: V }
  - { name: Bcalc, value: 0.2, unit: T }
---

这道题三问，每一问都要**换一个角度看**同一个装置：

1. 在立体图里看清电流方向，判断安培力——难在把「a 在前、b 在后」翻译成「正面看电流朝里」；
2. 悬梁弯曲时，哪个表面被拉长、哪个被压短；
3. 电桥的输出为什么和 $B$ 成正比。

题目只给字母，演示取 $I_0 = 0.5\ \mathrm{A}$、$l = 2\ \mathrm{cm}$、$\alpha = 50\ \Omega/\mathrm{N}$、$R_0 = 100\ \Omega$、$E = 6\ \mathrm{V}$。

<Segment title="安培力：一个向下一个向上" quote="长度均为 l、通有恒定电流 I_0（**方向相反**）的两刚性金属杆 ab、cd……现施加待测磁场，其方向**水平向右、且垂直于金属杆**……(1) 判断金属杆 ab 和 cd 所受安培力的方向。" hint="先看立体图，再把「视角」切到「正面看」；然后拖动 B。" watch="正面看时 ab 中电流朝里（⊗）、cd 中电流朝外（⊙）；两个 F 一个向下、一个向上，大小相等，随 B 一起变长。" ask="ab 和 cd 受的安培力，各朝哪个方向？" reveal="ab 向下，cd 向上，大小都是 BI_{0}l。两根杆电流反向，所以力也反向。" revealParam="showF" />

立体图里，$a$、$d$ 在前，$b$、$c$ 在后。$ab$ 中电流从 $a$ 流向 $b$，也就是**从前往后**；$cd$ 中电流从 $c$ 流向 $d$，**从后往前**。

从正面（$a$、$d$ 一侧）看，$ab$ 中电流垂直纸面向里，$cd$ 中电流垂直纸面向外，磁场水平向右。用左手定则：

- $ab$：四指指向纸里，磁感线向右穿过掌心，拇指向下，**$ab$ 所受安培力竖直向下**；
- $cd$：电流反向，**$cd$ 所受安培力竖直向上**。

两个力大小都是 $F = BI_0l$，方向相反。它们不让支架整体上下移动，而是让左边的悬梁往下弯、右边的往上弯。

<Param name="view" label="视角" value={0} options={[{value: 0, label: "立体图"}, {value: 1, label: "正面看"}]} />

<Param name="Ba" label="磁感应强度" symbol="B" value={0.2} min={0} max={0.5} step={0.01} unit="T" color="field" />

<Param name="I0" label="杆中电流" symbol="I_0" value={0.5} hidden />

<Param name="l" label="杆长" value={0.02} hidden />

<Param name="showF" label="画出安培力" value={1} hidden />

<Define name="Fa" expr="Ba*I0*l" />

<Readout items={[
  {label: "每根杆受的安培力", symbol: "F", expr: "Fa*1000", unit: "mN", digits: 2, color: "force"}
]} />

<Figure title="H 形支架与安培力" height={320} params={["view", "Fa", "showF"]} legend={[{kind: "field", label: "磁场 B"}, {kind: "charge", label: "杆中电流"}, {kind: "force", label: "安培力 F"}]} note="尺寸不按比例；a、d 在前，b、c 在后">
figure({
  draw(ctx, p, v) {
    const len = p.showF > 0.5 ? 60 * p.Fa : 0
    if (p.view < 0.5) {
      const m = v.view({ xmin: -1.45, xmax: 1.55, ymin: -0.55, ymax: 0.75, equal: true })
      const k = 0.5 * Math.SQRT1_2
      const P = (x, y, z) => [x + z * k, y + z * k]
      const at = (fn, pt, ...rest) => fn(m, pt[0], pt[1], ...rest)
      at(v.slab, P(-0.66, -0.014, 0.01), 0.26, 0.014, 0.06)
      at(v.slab, P(0.40, -0.014, 0.01), 0.26, 0.014, 0.06)
      at(v.slab, P(-1.0, 0, 0), 2.0, 0.05, 0.08)
      at(v.slab, P(-0.11, -0.45, -0.08), 0.22, 0.6, 0.24)
      at(v.slab, P(-0.66, 0.05, 0.01), 0.26, 0.014, 0.06)
      at(v.slab, P(0.40, 0.05, 0.01), 0.26, 0.014, 0.06)
      at(v.slab, P(-1.05, 0.05, -0.46), 0.1, 0.03, 1.0)
      at(v.slab, P(0.95, 0.05, -0.46), 0.1, 0.03, 1.0)
      const ia = P(-1.0, 0.09, -0.3), ib = P(-1.0, 0.09, 0.42)
      v.arrow(m, ia[0], ia[1], ib[0], ib[1], { color: v.color.charge, width: 2 })
      const ic = P(1.0, 0.09, 0.42), id = P(1.0, 0.09, -0.3)
      v.arrow(m, ic[0], ic[1], id[0], id[1], { color: v.color.charge, width: 2 })
      v.arrow(m, -0.45, 0.62, 0.55, 0.62, { color: v.color.field, width: 2 })
      v.label(m, 0.05, 0.69, 'B')
      const la = P(-1.0, 0.065, -0.56), lb = P(-1.0, 0.065, 0.62)
      v.label(m, la[0], la[1], 'a')
      v.label(m, lb[0], lb[1], 'b')
      const lc = P(1.0, 0.065, 0.62), ld = P(1.0, 0.065, -0.56)
      v.label(m, lc[0], lc[1], 'c')
      v.label(m, ld[0], ld[1], 'd')
      if (len > 0.01) {
        const fa = P(-1.0, 0.0, 0.05), fd = P(1.0, 0.1, 0.05)
        v.vec(m, fa[0], fa[1], 0, -len, { kind: 'force', label: 'F' })
        v.vec(m, fd[0], fd[1], 0, len, { kind: 'force', label: 'F' })
      }
      const lo = P(0, 0.2, -0.08)
      v.label(m, lo[0], lo[1], 'O')
    } else {
      const m = v.view({ xmin: -1.35, xmax: 1.35, ymin: -0.62, ymax: 0.66, equal: true })
      v.block(m, 0, -0.5, 0.22, 0.6)
      v.ground(m, -0.45, 0.45, -0.5)
      v.block(m, 0, -0.035, 2.02, 0.07, { shadow: false })
      v.label(m, 0.2, -0.3, 'O')
      v.wire(m, -1.01, 0, { dir: 'in', rings: [], label: 'ab' })
      v.wire(m, 1.01, 0, { dir: 'out', rings: [], label: 'cd' })
      if (len > 0.01) {
        v.vec(m, -1.01, -0.07, 0, -len, { kind: 'force', label: 'F' })
        v.vec(m, 1.01, 0.07, 0, len, { kind: 'force', label: 'F' })
      }
      v.arrow(m, -0.5, 0.56, 0.5, 0.56, { color: v.color.field, width: 2 })
      v.label(m, 0, 0.63, 'B')
      v.text(m, 0, -0.6, '从 a、d 一侧（正面）看')
    }
  },
})
</Figure>

<Segment title="形变：哪面拉长、哪面压短" quote="在悬梁**上、下表面对称安装四个相同的电阻应变片**……金属杆 ab、cd 受安培力作用，使悬梁 OA、OD 产生形变，四个应变片的阻值发生相应变化，其**变化量的绝对值均为 ΔR**……(2) 写出上述四个电阻的阻值（用 R_0 和 ΔR 表示）。" hint="拖动 B，从 0 拖到 0.5 T。" watch="左梁向下弯：上表面的 R₁ 被拉长，下表面的 R₃ 被压短；右梁向上弯，正好相反。被拉长的阻值变大，被压短的变小。" ask="B 增大时，R_1～R_4 哪些变大、哪些变小？" reveal="R_1、R_4 变大，R_2、R_3 变小。被拉长的变大，被压短的变小。" />

悬梁中间固定在 $O$，两端受力，每一半都像一根**一端固定的悬臂梁**。

- 左梁 $OA$ 的端点受**向下**的力，向下弯：弯曲的外侧是上表面，**上表面被拉长**，下表面被压短。所以 $R_1$（左上）变大，$R_3$（左下）变小。
- 右梁 $OD$ 的端点受**向上**的力，向上弯：外侧变成下表面，**下表面被拉长**，上表面被压短。所以 $R_4$（右下）变大，$R_2$（右上）变小。

应变片被拉长时电阻丝变细变长，阻值变大；被压短时阻值变小。四片的变化量大小相同：

$$
R_1 = R_0 + \Delta R,\qquad R_2 = R_0 - \Delta R
$$

$$
R_3 = R_0 - \Delta R,\qquad R_4 = R_0 + \Delta R
$$

<Param name="Bb" label="磁感应强度" symbol="B" value={0.2} min={0} max={0.5} step={0.01} unit="T" color="field" />

<Param name="alpha" label="比例系数" symbol="α" value={50} hidden />

<Param name="R0" label="应变片原阻值" symbol="R_0" value={100} hidden />

<Define name="Fb" expr="Bb*I0*l" />

<Define name="dRb" expr="alpha*Fb" />

<Readout items={[
  {label: "R₁（左上）", expr: "R0 + dRb", unit: "Ω", digits: 2, color: "charge"},
  {label: "R₂（右上）", expr: "R0 - dRb", unit: "Ω", digits: 2},
  {label: "R₃（左下）", expr: "R0 - dRb", unit: "Ω", digits: 2},
  {label: "R₄（右下）", expr: "R0 + dRb", unit: "Ω", digits: 2, color: "charge"}
]} />

<Figure title="正面看：悬梁弯曲与应变片" height={320} params={["Fb"]} legend={[{kind: "force", label: "安培力 F"}, {kind: "charge", label: "应变片"}]} note="形变放大画出，不按比例；虚线是未加磁场时的位置">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -1.35, xmax: 1.35, ymin: -0.62, ymax: 0.66, equal: true })
    const L = 0.9, x0 = 0.11, t = 0.035, g = 0.022
    const k = 1 - Math.exp(-p.Fb / 0.004)
    const d = 0.32 * k
    const bend = (s) => { const u = Math.max(0, Math.min(s / L, 1)); return d * u * u * (3 - u) / 2 }
    const Y = (x) => Math.abs(x) <= x0 ? 0 : (x < 0 ? -bend(-x - x0) : bend(x - x0))
    const xs = []
    for (let i = 0; i <= 80; i++) xs.push(-(x0 + L) + (2 * (x0 + L)) * i / 80)
    if (p.Fb > 1e-12) v.line(m, -(x0 + L), 0, x0 + L, 0, { color: v.color.hairline, dash: true })
    const beam = xs.map((x) => [x, Y(x) + t]).concat(xs.slice().reverse().map((x) => [x, Y(x) - t]))
    v.path(m, beam, { close: true, fill: v.color.enamel, color: v.color.graphite })
    const gauge = (sgn, top) => {
      const a = x0 + 0.22 * L, b = x0 + 0.52 * L
      const seg = []
      for (let i = 0; i <= 12; i++) seg.push(sgn * (a + (b - a) * i / 12))
      const off = top ? t : -t - g
      const pts = seg.map((x) => [x, Y(x) + off + g]).concat(seg.slice().reverse().map((x) => [x, Y(x) + off]))
      v.path(m, pts, { close: true, fill: v.color.charge, color: v.color.graphite })
      return Y(sgn * (a + b) / 2)
    }
    const yl = gauge(-1, true); gauge(-1, false)
    const yr = gauge(1, true); gauge(1, false)
    v.ground(m, -0.45, 0.45, -0.5)
    v.block(m, 0, -0.5, 0.22, 0.6)
    v.label(m, 0.2, -0.3, 'O')
    const cx = (x0 + 0.37 * L)
    const on = p.Fb > 1e-12
    v.label(m, -cx, yl + t + 0.1, on ? 'R₁ 拉长' : 'R₁')
    v.label(m, -cx, yl - t - 0.15, on ? 'R₃ 压短' : 'R₃')
    v.label(m, cx, yr + t + 0.1, on ? 'R₂ 压短' : 'R₂')
    v.label(m, cx, yr - t - 0.15, on ? 'R₄ 拉长' : 'R₄')
    const xa = -(x0 + L), xd = x0 + L
    const ya = Y(xa), yd = Y(xd)
    v.wire(m, xa, ya, { dir: 'in', rings: [], label: 'ab' })
    v.wire(m, xd, yd, { dir: 'out', rings: [], label: 'cd' })
    if (on) {
      const len = 0.12 + 0.5 * k
      v.vec(m, xa, ya - 0.07, 0, -len * 0.5, { kind: 'force', label: 'F' })
      v.vec(m, xd, yd + 0.07, 0, len * 0.5, { kind: 'force', label: 'F' })
    }
  },
})
</Figure>

<Segment title="电桥：输出与 B 成正比" quote="将它们按图2方式与**电动势为 E 的电源（不计内阻）**相连。未加磁场时……**测得 e、f 两端的电势差为 0**……(3) 已知**电阻变化量和所受的安培力成正比关系，且比例系数为 α**，求 U_ef 与 B 之间的关系。" hint="拖动 B，从 0 拖到 0.5 T；再点「磁场加倍」。" watch="每条支路里一个电阻变大、一个变小，支路总电阻一直是 2R₀，电流不变；所以 U_ef 只跟 ΔR 有关，B 加倍，U_ef 也加倍——下面是一条过原点的直线。" ask="B 加倍，U_ef 怎么变？" reveal="也加倍。每条支路总电阻始终是 2R_0，电流不变，U_ef = EΔR/R_0，而 ΔR ∝ B。" />

图 2 中 $R_1$、$R_2$ 串成上支路，$R_3$、$R_4$ 串成下支路，两条支路并联接在电源上；$f$ 在 $R_1$、$R_2$ 之间，$e$ 在 $R_3$、$R_4$ 之间。

关键：每条支路里**一个电阻变大、一个变小**，总电阻始终是

$$
(R_0 + \Delta R) + (R_0 - \Delta R) = 2R_0
$$

所以支路电流一直是 $I = \dfrac{E}{2R_0}$，不随磁场变。图 2 中电源的长线（正极）在**左**，左边节点电势最高，记为 $E$；两条支路的电流都从左往右流，经过 $R_1$、$R_3$ 各降一段电势：

$$
\varphi_f = E - IR_1 = \frac{E(R_0 - \Delta R)}{2R_0},\qquad \varphi_e = E - IR_3 = \frac{E(R_0 + \Delta R)}{2R_0}
$$

$$
U_{ef} = \varphi_e - \varphi_f = \frac{E\,\Delta R}{R_0}
$$

再代入 $\Delta R = \alpha F = \alpha BI_0l$：

$$
\boxed{U_{ef} = \frac{\alpha EI_0l}{R_0}\,B}
$$

$U_{ef}$ 与 $B$ 成正比，测出 $U_{ef}$ 就能读出 $B$。$R_3$ 变小，电流流过它时电势降得少，所以 $e$ 点比 $f$ 点电势高，$U_{ef}$ 为正。

<Param name="B" label="磁感应强度" value={0.2} min={0} max={0.5} step={0.01} unit="T" color="field" />

<Param name="E" label="电源电动势" value={6} hidden />

<Define name="F" expr="B*I0*l" />

<Define name="dR" expr="alpha*F" />

<Define name="R1" expr="R0 + dR" />

<Define name="R2" expr="R0 - dR" />

<Define name="R3" expr="R0 - dR" />

<Define name="R4" expr="R0 + dR" />

<Define name="Uef" expr="U1 - U3" />

<Define name="Bcalc" expr="R0*Uef/(alpha*E*I0*l)" />

<Preset label="题目数值 B = 0.2 T" set={{B: 0.2}} />

<Preset label="磁场加倍" set={{B: 0.4}} />

<Readout items={[
  {label: "支路电流", expr: "E/(R1 + R2)*1000", unit: "mA", digits: 2},
  {label: "e、f 电势差", symbol: "U_ef", expr: "Uef*1000", unit: "mV", digits: 2, color: "charge"},
  {label: "由 U_ef 反推", symbol: "B", expr: "Bcalc", unit: "T", digits: 3, color: "field"}
]} />

<Circuit title="图 2：应变片接线" source={{series: [{type: "switch", label: "S", closed: true}, {type: "battery", label: "E", emf: "E", positive: "left"}]}} load={{parallel: [{series: [{type: "resistor", label: "R₁", R: "R1", read: {U: "U1"}, note: {expr: "R1", unit: "Ω", digits: 1}}, {type: "resistor", label: "R₂", R: "R2", note: {expr: "R2", unit: "Ω", digits: 1}}]}, {series: [{type: "resistor", label: "R₃", R: "R3", read: {U: "U3"}, note: {expr: "R3", unit: "Ω", digits: 1}}, {type: "resistor", label: "R₄", R: "R4", note: {expr: "R4", unit: "Ω", digits: 1}}]}]}} note="f 在 R₁、R₂ 之间，e 在 R₃、R₄ 之间；电源长线（正极）在左，与原图一致" />

<Plot title="输出电压与 B" caption="过原点的直线：U_ef 与 B 成正比" size="full"
  x={{name: "bx", label: "B", unit: "T", min: 0, max: 0.5}}
  y={{label: "U_ef", unit: "mV", min: 0, max: 16}}
  series={[{label: "U_ef", expr: "alpha*E*I0*l*bx/R0*1000", color: "charge"}]}
  cursor="B"
/>

<Segment title="全景：B → F → ΔR → U_ef" chain={[1, 2, 3]} link={["B", "Ba", "Bb"]} steps={["ΔR = αF", "U_ef = EΔR/R_0"]} hint="拖动 B，从 0.2 T 拖到 0.4 T。" watch="三张图一起变：两个 F 变长，梁弯得更厉害，R₁、R₄ 变大、R₂、R₃ 变小，U_ef 跟着变大。" ask="B 加倍，这条链上每一环怎么变？" reveal="每一环都加倍：F = BI_{0}l ∝ B，ΔR = αF ∝ F，U_ef = EΔR/R_0 ∝ ΔR。所以 U_ef ∝ B。" />

三问其实是一条链：磁场产生安培力，安培力让梁弯曲、改变应变片阻值，阻值变化让电桥输出电压。每一环都是正比，所以整条链也是正比：

$$
B \xrightarrow{\;F = BI_0l\;} F \xrightarrow{\;\Delta R = \alpha F\;} \Delta R \xrightarrow{\;U_{ef} = E\Delta R/R_0\;} U_{ef}
$$

<Readout items={[
  {label: "安培力", symbol: "F", expr: "F*1000", unit: "mN", digits: 2, color: "force"},
  {label: "阻值变化", symbol: "ΔR", expr: "dR", unit: "Ω", digits: 3, color: "charge"},
  {label: "e、f 电势差", symbol: "U_ef", expr: "Uef*1000", unit: "mV", digits: 2, color: "charge"}
]} />

<Segment title="完整解答" />

**(1)** 从正面看，$ab$ 中电流垂直纸面向里、$cd$ 中电流垂直纸面向外，磁场水平向右，由左手定则：**$ab$ 所受安培力竖直向下，$cd$ 所受安培力竖直向上**，大小都是 $BI_0l$。

**(2)** 左梁向下弯，上表面拉长、下表面压短；右梁向上弯，相反。拉长阻值变大、压短阻值变小：

$$
R_1 = R_0 + \Delta R,\qquad R_2 = R_0 - \Delta R
$$

$$
R_3 = R_0 - \Delta R,\qquad R_4 = R_0 + \Delta R
$$

**(3)** 两条支路总电阻都是 $2R_0$，电流都是 $\dfrac{E}{2R_0}$。电源正极在左，$U_{ef} = \varphi_e - \varphi_f = \dfrac{E}{2R_0}(R_1 - R_3) = \dfrac{E\,\Delta R}{R_0}$。又 $\Delta R = \alpha BI_0l$，所以

$$
U_{ef} = \frac{\alpha EI_0l}{R_0}B
$$

代表值下 $\Delta R = 0.1\ \Omega$，$U_{ef} = 6\ \mathrm{mV}$，反推 $B = 0.2\ \mathrm{T}$。

<Answer open={true} items={[
  {label: "(1)", text: "ab 所受安培力竖直向下，cd 所受安培力竖直向上"},
  {label: "(2)", text: "R_1 = R_0 + ΔR，R_2 = R_0 − ΔR，R_3 = R_0 − ΔR，R_4 = R_0 + ΔR"},
  {label: "(3)", text: "U_ef = αEI_{0}lB/R_0（U_ef 与 B 成正比）"},
  {label: "阻值变化", symbol: "ΔR", expr: "dR", value: 0.1, unit: "Ω", digits: 3},
  {label: "e、f 电势差", symbol: "U_ef", expr: "Uef*1000", value: 6, unit: "mV", digits: 2},
  {label: "反推磁场", symbol: "B", expr: "Bcalc", value: 0.2, unit: "T", digits: 3}
]} />
