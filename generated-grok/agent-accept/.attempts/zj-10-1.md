---
id: zj-10
title: 应变片电桥测磁场
source: 2026 浙江卷（汇编专题七第 11 题，计算）
question: |
  为测量局域磁场，科学家基于电阻应变片开发出一种磁场检测芯片，其简化结构如图 1 所示。长度均为 l、通有恒定电流 I₀（方向相反）的两刚性金属杆 ab、cd，与具有良好弹性的绝缘悬梁 OA、OD 构成“H”形支架，对称固定于底座 O 处。在悬梁上、下表面对称安装四个相同的电阻应变片（各自引出两导线），其阻值分别为 R₁、R₂、R₃ 和 R₄，将它们按图 2 方式与电动势为 E 的电源（不计内阻）相连。未加磁场时，支架处于水平平衡状态，此时 R₁ = R₂ = R₃ = R₄ = R₀，测得 e、f 两端的电势差为 0。现施加待测磁场，其方向水平向右、且垂直于金属杆，则金属杆 ab、cd 受安培力作用，使悬梁 OA、OD 产生形变，四个应变片的阻值发生相应变化，其变化量的绝对值均为 ΔR，此时测得 e、f 两端的电势差为 U_ef，从而得到待测磁场磁感应强度 B 的大小。
  （1）判断金属杆 ab 和 cd 所受安培力的方向；
  （2）写出上述四个电阻的阻值（用 R₀ 和 ΔR 表示）；
  （3）若 ΔR 正比于金属杆 ab 和 cd 所受安培力大小，比例系数为 α，求 B 与 U_ef 的关系式。
answers:
  - { name: Famp, value: 0.02, unit: "N" }
  - { name: dR, value: 0.2, unit: "Ω" }
  - { name: R1, value: 120.2, unit: "Ω" }
  - { name: R2, value: 119.8, unit: "Ω" }
  - { name: R3, value: 119.8, unit: "Ω" }
  - { name: R4, value: 120.2, unit: "Ω" }
  - { name: Uef, value: 0.01, unit: "V" }
  - { name: Bcalc, value: 0.2, unit: "T" }
---

## 一、题目条件分析

图 1 是斜向投影，不是正视的竖杆。底座 O 在中央并向下伸出。悬梁 OA、OD 水平，左梁上表面贴 R₁、下表面贴 R₃，右梁上表面贴 R₂、下表面贴 R₄。金属杆 ab、cd 都垂直于悬梁、沿水平方向伸向远处：a 在近处、b 在远处，电流由 a 指向 b；c 在远处、d 在近处，电流由 c 指向 d。磁场 B 水平向右，与悬梁平行，因而垂直于两根金属杆。

未加磁场时支架水平，四个应变片都是 R₀，电桥平衡，e、f 间电势差为 0。加上磁场后，安培力使两梁弯曲，每个应变片阻值变化的绝对值都是 ΔR，且 ΔR = αF，F 是安培力的大小。图 2 是电桥：上臂左 R₁、右 R₂，中点为 f；下臂左 R₃、右 R₄，中点为 e。电源（不计内阻）和开关串在桥的左右两端之间。图中没有标出电源正负极，课件把正极放在左端，使 B 沿题给方向时 U_ef = φ_e − φ_f 为正。

题目只给字母。下面取一组代表性数值，用来演示和核对：I₀ = 2 A，l = 0.05 m，R₀ = 120 Ω，E = 6 V，α = 10 Ω/N，示例磁场 B = 0.2 T。画面上的杆长和梁的弯曲都不按比例。

<Param name="B" label="磁感应强度" symbol="B" color="field" value={0.2} min={0} max={0.5} step={0.01} unit="T" digits={2} />

<Param name="I0" label="杆中电流" symbol="I_0" color="charge" value={2} unit="A" hidden />

<Param name="len" label="杆长" symbol="l" value={0.05} unit="m" hidden />

<Param name="R0" label="未加磁场时的阻值" symbol="R_0" value={120} unit="Ω" hidden />

<Param name="emf" label="电源电动势" symbol="E" value={6} unit="V" hidden />

<Param name="alpha" label="比例系数" symbol="α" value={10} unit="Ω/N" hidden />

<Define name="Famp" expr="I0*len*B" />

<Define name="dR" expr="alpha*Famp" />

<Define name="R1" expr="R0+dR" />

<Define name="R2" expr="R0-dR" />

<Define name="R3" expr="R0-dR" />

<Define name="R4" expr="R0+dR" />

<Define name="Bcalc" expr="R0*Uef/(alpha*emf*I0*len)" />

<Question text="（1）金属杆 ab 和 cd 所受安培力的方向？" set={{B: 0.2}} hint="掌心迎着向右的磁感线，四指沿电流。ab 向里，cd 向外。" />

<Question text="（2）四个应变片的阻值（用 R_0 和 ΔR 表示）" set={{B: 0.2}} hint="端点向下弯时上表面受拉；端点向上弯时上表面受压。" />

<Question text="（3）B 与 U_ef 的关系" set={{B: 0.2}} hint="电压表读数由电桥解出。B = R_0 U_ef / (α E I_0 l)。" />

<Preset label="未加磁场" set={{B: 0}} />

<Preset label="示例磁场 B = 0.2 T" set={{B: 0.2}} />

<Status cases={[
  {when: "abs(B) < 1e-6", label: "未加磁场：四臂相等，电桥平衡，U_ef = 0", tone: "info"},
  {when: "abs(Bcalc - B) < 1e-4", label: "U_ef 与 B 满足 B = R_0 U_ef / (α E I_0 l)", tone: "success"},
  {label: "读数与关系式不一致", tone: "warning"}
]} />

<Readout items={[
  {label: "安培力大小", symbol: "F", expr: "Famp", unit: "N", digits: 4, color: "force"},
  {label: "阻值变化", symbol: "ΔR", expr: "dR", unit: "Ω", digits: 4},
  {label: "左上", symbol: "R_1", expr: "R1", unit: "Ω", digits: 2},
  {label: "右上", symbol: "R_2", expr: "R2", unit: "Ω", digits: 2},
  {label: "左下", symbol: "R_3", expr: "R3", unit: "Ω", digits: 2},
  {label: "右下", symbol: "R_4", expr: "R4", unit: "Ω", digits: 2},
  {label: "桥路输出", symbol: "U_ef", expr: "Uef", unit: "V", digits: 4, color: "charge"},
  {label: "由 U_ef 求得", symbol: "B", expr: "Bcalc", unit: "T", digits: 3, color: "field"}
]} />

<Answer items={[
  {label: "ab 所受安培力", text: "竖直向下"},
  {label: "cd 所受安培力", text: "竖直向上"},
  {label: "四个阻值", text: "R_1 = R_4 = R_0 + ΔR，R_2 = R_3 = R_0 − ΔR"},
  {label: "左上 R_1", symbol: "R_1", expr: "R1", value: 120.2, unit: "Ω", digits: 1},
  {label: "右上 R_2", symbol: "R_2", expr: "R2", value: 119.8, unit: "Ω", digits: 1},
  {label: "左下 R_3", symbol: "R_3", expr: "R3", value: 119.8, unit: "Ω", digits: 1},
  {label: "右下 R_4", symbol: "R_4", expr: "R4", value: 120.2, unit: "Ω", digits: 1},
  {label: "B 与 U_ef", text: "B = R_0 U_ef / (α E I_0 l)"},
  {label: "示例磁场", symbol: "B", expr: "Bcalc", value: 0.2, unit: "T", digits: 3}
]} />

<Figure title="侧视：悬梁弯曲与安培力" height={420} params={["B"]}
  hud={[{symbol: "B", expr: "B", unit: "T", digits: 2}, {symbol: "U_ef", expr: "Uef", unit: "V", digits: 4}]}
  legend={[{kind: "field", label: "磁场 B 水平向右"}, {kind: "force", label: "安培力"}]}
  note="从近处望向远处。⊗ 电流向里，⊙ 电流向外。弯曲幅度放大，不按比例。">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -3.5, xmax: 3.6, ymin: -2.25, ymax: 2.4, equal: true })
    const L = 2.2
    const k = Math.min(1, Math.max(p.B, 0) / 0.5)
    const sag = 0.5 * k
    const fLen = 0.28 + 0.55 * k
    const yBeam = (s, sign) => {
      const u = s / L
      return sign * sag * (3 * u * u - u * u * u) / 2
    }
    const pts = (sign) => {
      const out = []
      for (let i = 0; i <= 28; i++) {
        const s = (L * i) / 28
        out.push([sign * s, yBeam(s, sign)])
      }
      return out
    }
    v.line(m, -1.05, -1.15, 1.05, -1.15, { color: v.color.steel, width: 2 })
    v.rect(m, -0.32, -1.15, 0.64, 1.15, { fill: v.color.graphite })
    v.line(m, -L, 0, L, 0, { color: v.color.steel, dash: true })
    v.path(m, pts(-1), { color: v.color.ink, width: 4 })
    v.path(m, pts(1), { color: v.color.ink, width: 4 })
    const yL = yBeam(L, -1)
    const yR = yBeam(L, 1)
    v.wire(m, -L, yL, { dir: "in", rings: [], r: 8 })
    v.wire(m, L, yR, { dir: "out", rings: [], r: 8 })
    const gauge = (sign, upper, text) => {
      const s = 0.78
      const x = sign * s
      const y = yBeam(s, sign)
      const bottom = y + (upper ? 0.2 : -0.32)
      v.rect(m, x - 0.2, bottom, 0.4, 0.1, { fill: v.color.steel })
      v.label(m, x, upper ? bottom + 0.1 : bottom, text, { place: upper ? "above" : "below" })
    }
    gauge(-1, true, "R_1")
    gauge(-1, false, "R_3")
    gauge(1, true, "R_2")
    gauge(1, false, "R_4")
    const by = 1.95
    v.arrow(m, -1.65, by, -0.9, by, { color: v.color.field })
    v.arrow(m, -0.45, by, 0.3, by, { color: v.color.field })
    v.arrow(m, 0.75, by, 1.5, by, { color: v.color.field })
    v.label(m, 1.7, by, "B", { place: "right" })
    v.label(m, -1.2, 0.55, "OA", { place: "above" })
    v.label(m, 1.2, 0.55, "OD", { place: "above" })
    v.label(m, 0, -1.35, "O", { place: "below" })
    v.label(m, -L - 0.15, yL, "ab", { place: "left" })
    v.label(m, L + 0.15, yR, "cd", { place: "right" })
    if (p.B > 0.008) {
      const gap = 0.24
      v.arrow(m, -L, yL - gap, -L, yL - gap - fLen, { color: v.color.force })
      v.label(m, -L - 0.2, yL - gap - fLen, "F_ab", { place: "left" })
      v.arrow(m, L, yR + gap, L, yR + gap + fLen, { color: v.color.force })
      v.label(m, L + 0.2, yR + gap + fLen, "F_cd", { place: "right" })
    }
  },
})
</Figure>

<Figure title="俯视：电流、杆与磁场" height={320}
  legend={[{kind: "field", label: "磁场 B"}, {kind: "charge", label: "电流 I_0"}]}
  note="近在画面下方，远在上方。杆长 l 垂直于悬梁。不按比例。">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -3.6, xmax: 4.3, ymin: -2.15, ymax: 2.15, equal: true })
    v.rect(m, -0.34, -0.34, 0.68, 0.68, { fill: v.color.graphite })
    v.line(m, -2.4, 0, -0.34, 0, { color: v.color.ink, width: 4 })
    v.line(m, 0.34, 0, 2.4, 0, { color: v.color.ink, width: 4 })
    v.line(m, -2.4, -0.95, -2.4, 0.95, { color: v.color.steel, width: 5 })
    v.line(m, 2.4, -0.95, 2.4, 0.95, { color: v.color.steel, width: 5 })
    v.arrow(m, -2.4, -0.55, -2.4, 0.62, { color: v.color.charge })
    v.arrow(m, 2.4, 0.55, 2.4, -0.62, { color: v.color.charge })
    v.arrow(m, -0.15, 1.5, 1.2, 1.5, { color: v.color.field })
    v.dim(m, 2.85, -0.95, 2.85, 0.95, "l")
    v.label(m, -2.75, -0.95, "a", { place: "left" })
    v.label(m, -2.75, 0.95, "b", { place: "left" })
    v.label(m, 2.15, 1.2, "c", { place: "above" })
    v.label(m, 2.15, -1.2, "d", { place: "below" })
    v.label(m, 0.9, -0.55, "O", { place: "below" })
    v.label(m, -1.35, 0.32, "OA", { place: "above" })
    v.label(m, 1.35, 0.32, "OD", { place: "above" })
    v.label(m, 1.4, 1.5, "B", { place: "right" })
    v.label(m, -2.4, -1.55, "F_ab 向下", { place: "below" })
    v.label(m, 0.7, -1.55, "F_cd 向上", { place: "below" })
    v.label(m, -3.15, 1.55, "远", { place: "left" })
    v.label(m, -3.15, -1.55, "近", { place: "left" })
  },
})
</Figure>

<Wiring title="电桥测 U_ef" height={530}
  note="正极在左，开关闭合。电压表 50 mV 挡接 e（下臂中点），负接线柱接 f（上臂中点），读数即 U_ef = φ_e − φ_f。内阻不计。"
  parts={[
    {id: "V", type: "voltmeter", ranges: [0.05], read: "Uef", label: "U_ef", x: 200, y: 92},
    {id: "r1", type: "resistor", R: "R1", label: "R_1", x: 250, y: 220},
    {id: "r2", type: "resistor", R: "R2", label: "R_2", x: 490, y: 220},
    {id: "r3", type: "resistor", R: "R3", label: "R_3", x: 250, y: 360},
    {id: "r4", type: "resistor", R: "R4", label: "R_4", x: 490, y: 360},
    {id: "bat", type: "battery", emf: "emf", r: 0, positive: "left", label: "E", x: 230, y: 470},
    {id: "S", type: "switch", closed: true, label: "S", x: 500, y: 470}
  ]}
  wires={[
    {from: "r1.b", to: "r2.a"},
    {from: "r3.b", to: "r4.a"},
    {from: "r1.a", to: "r3.a"},
    {from: "r2.b", to: "r4.b"},
    {from: "bat.+", to: "r3.a"},
    {from: "bat.-", to: "S.a"},
    {from: "S.b", to: "r4.b"},
    {from: "V.-", to: "r1.b"},
    {from: "V.0.05", to: "r3.b"}
  ]}
/>

<ForceDiagram title="杆 ab 平衡" size="narrow"
  surface={{type: "none"}}
  body={{shape: "rod", label: "ab"}}
  forces={[
    {label: "F_ab", angle: -90, magnitude: "I0*len*B", showValue: true, unit: "N", digits: 3},
    {label: "F_梁", angle: 90, solve: "FL", showValue: true, unit: "N", digits: 3}
  ]}
/>

<ForceDiagram title="杆 cd 平衡" size="narrow"
  surface={{type: "none"}}
  body={{shape: "rod", label: "cd"}}
  forces={[
    {label: "F_cd", angle: 90, magnitude: "I0*len*B", showValue: true, unit: "N", digits: 3},
    {label: "F_梁", angle: -90, solve: "FR", showValue: true, unit: "N", digits: 3}
  ]}
/>

## 二、完整解答

代表性数值：I₀ = 2 A，l = 0.05 m，R₀ = 120 Ω，E = 6 V，α = 10 Ω/N，B = 0.2 T。B 与金属杆垂直。

### （1）安培力的方向

用左手定则。磁感线水平向右，掌心向左迎接磁感线，四指指向电流，拇指指向安培力。

侧视时从近处望向远处。ab 的电流由近到远，垂直纸面向里：拇指竖直向下。cd 的电流由远到近，垂直纸面向外：拇指竖直向上。

$$
\boxed{ab\ \text{竖直向下},\quad cd\ \text{竖直向上}}
$$

力的大小都是

$$
F = I_0 l B = 2 \times 0.05 \times 0.2 = \boxed{0.02\ \text{N}}
$$

形变稳定后每根杆平衡，悬梁弹力与安培力等大反向。两杆电流相反，所以一梁向下弯、另一梁向上弯。

### （2）四个电阻

金属应变片拉伸时阻值增大，压缩时阻值减小，变化量的绝对值都是 ΔR。

左梁 OA 的自由端受力向下，梁向下弯：上表面拉伸，下表面压缩，所以 R₁ = R₀ + ΔR，R₃ = R₀ − ΔR。

右梁 OD 的自由端受力向上，梁向上弯：上表面压缩，下表面拉伸，所以 R₂ = R₀ − ΔR，R₄ = R₀ + ΔR。

$$
\boxed{R_1 = R_4 = R_0 + \Delta R,\quad R_2 = R_3 = R_0 - \Delta R}
$$

示例中

$$
\Delta R = \alpha F = 10 \times 0.02 = \boxed{0.2\ \Omega}
$$

$$
R_1 = R_4 = 120.2\ \Omega,\quad R_2 = R_3 = 119.8\ \Omega
$$

### （3）B 与 U_ef 的关系

正极在左端，右端为负极，理想电压表接在 e、f 之间，不分流。两条支路的总电阻都是 2R₀。

$$
\varphi_e = E \frac{R_4}{R_3 + R_4} = E \frac{R_0 + \Delta R}{2R_0}
$$

$$
\varphi_f = E \frac{R_2}{R_1 + R_2} = E \frac{R_0 - \Delta R}{2R_0}
$$

$$
U_{ef} = \varphi_e - \varphi_f = \frac{E \Delta R}{R_0}
$$

又 ΔR = αF = α I₀ l B，因此

$$
U_{ef} = \frac{\alpha E I_0 l}{R_0} B
$$

$$
\boxed{B = \dfrac{R_0 U_{ef}}{\alpha E I_0 l}}
$$

电桥按图上的接线解出的读数，与上式一致。代入示例：U_ef = 0.01 V，

$$
B = \frac{120 \times 0.01}{10 \times 6 \times 2 \times 0.05} = \boxed{0.2\ \text{T}}
$$

## 三、交互演示

拖动 B。侧视里左梁向下弯、右梁向上弯，安培力随 B 增大。俯视用来核对电流方向：ab 由近到远，cd 由远到近，B 与悬梁平行。电压表指针是电桥的解，侧栏 U_ef 与「由 U_ef 求得」的 B 跟着变。点「未加磁场」可回到四臂相等、读数为 0 的状态。

## 四、结合图像看两个状态

B = 0 时，两梁都在水平虚线上，四个阻值都是 120 Ω，电压表指在零点，电桥平衡。

B = 0.2 T 时，ab 的安培力向下、cd 向上，大小都是 0.02 N。R₁ 和 R₄ 升到 120.2 Ω，R₂ 和 R₃ 降到 119.8 Ω。电压表约在 50 mV 量程的五分之一处，读数 U_ef = 0.01 V，代回关系式得到 B = 0.2 T。B 再增大时，弯曲、ΔR 和 U_ef 都同比增大，方向不变。

## 五、答案汇总

（1）ab 所受安培力竖直向下，cd 所受安培力竖直向上。

（2）R₁ = R₄ = R₀ + ΔR，R₂ = R₃ = R₀ − ΔR。示例数值为 120.2 Ω 与 119.8 Ω。

（3）$B = R_0 U_{ef} / (\alpha E I_0 l)$。按本节的代表性数值，U_ef = 0.01 V，B = 0.2 T。
