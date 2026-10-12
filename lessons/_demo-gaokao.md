---
title: 高考高频素材演示：电场线、异形磁场、轨道、光电门、导线、变压器
source: 内部演示
demo: true
---

## 一、点电荷的电场线与等势面

<Param name="q2" label="右侧电荷 q₂（以 q₁ 为单位）" min={-2} max={2} step={0.5} value={-1} />

<Figure title="两个点电荷的电场" height={300} params={["q2"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -3, xmax: 3, ymin: -1.6, ymax: 1.6, equal: true })
    const charges = [{ x: -1, y: 0, q: 1, label: 'q_1' }]
    if (p.q2 !== 0) charges.push({ x: 1, y: 0, q: p.q2, label: 'q_2' })
    v.efield(m, charges, { equipotentials: 6 })
  },
})
</Figure>

## 二、异形磁场区域

<Param name="shape" label="区域形状" options={[{ value: 0, label: "圆形" }, { value: 1, label: "圆环" }, { value: 2, label: "三角形" }, { value: 3, label: "扇形" }]} value={0} />

<Figure title="磁场区域" height={280} params={["shape"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -3, xmax: 3, ymin: -1.5, ymax: 1.5, equal: true })
    if (p.shape === 0) v.field(m, -1.3, -1.3, 1.3, 1.3, { shape: 'circle', dir: 'out', step: 30 })
    else if (p.shape === 1) v.field(m, -1.3, -1.3, 1.3, 1.3, { shape: 'ring', inner: 0.6, dir: 'in', step: 26 })
    else if (p.shape === 2) v.field(m, 0, 0, 0, 0, { points: [[-1.6, -1.2], [1.6, -1.2], [0, 1.3]], dir: 'in', step: 28 })
    else v.field(m, 0, 0, 0, 0, { sector: { x: -1.2, y: -1.2, r: 2.6, from: 0, to: 70 }, dir: 'out', step: 30 })
    v.ball(m, -2.4, 0, 0.12, { charge: true, label: 'q' })
    v.vec(m, -2.4, 0, 0.7, 0, { label: 'v_0' })
  },
})
</Figure>

## 三、圆弧轨道与光电门

<Param name="s" label="小球位置 s" min={0} max={9} step={0.1} value={3.4} />

<Figure title="水平轨道接竖直圆轨道" height={300} params={["s"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.5, xmax: 6.5, ymin: -0.4, ymax: 2.4, equal: true })
    const tr = v.track(m, [
      { line: [0, 0, 4, 0] },
      { arc: [4, 1, 1, -90, 270] },
      { line: [4, 0, 6, 0] },
    ], { marks: [{ x: 4, y: 0, label: 'B' }, { x: 4, y: 2, label: 'C', place: 'above' }] })
    const [x, y, a] = tr.at(p.s)
    const r = 0.14
    v.ball(m, x - r * Math.sin(a), y + r * Math.cos(a), r)
    v.photogate(m, 2, 0.08, 0.5, { blocked: Math.abs(x - 2) < r && p.s < 4, label: '光电门', post: 0 })
  },
})
</Figure>

## 三（续）、光电门测速度

<Param name="vs" label="滑块速度 v" min={0.2} max={1.2} step={0.1} value={0.5} unit="m/s" />
<Define name="dflag" expr="0.01" />

<Sim title="遮光条通过光电门" height={240} duration="2.4/vs" params={["vs", "dflag"]} marks={[{ t: 0, label: "出发" }]}>
sim({
  at(t, p) { return { x: 0.3 + p.vs * t } },
  draw(ctx, s, v) {
    const m = v.view({ xmin: 0, xmax: 3, ymin: -0.3, ymax: 1.2 })
    v.ground(m, 0, 3, 0)
    const gx = 1.8
    const flagX = s.x
    const passed = flagX - v.p.dflag / 2 > gx
    const inBeam = Math.abs(flagX - gx) <= v.p.dflag / 2 + 0.01
    v.block(m, s.x, 0, 0.36, 0.16, { label: '滑块', flag: 0.3 })
    v.photogate(m, gx, 0.22, 0.42, { blocked: inBeam, label: '光电门', post: 0, time: passed ? v.p.dflag / v.p.vs : null, timeLabel: 'Δt' })
  },
})
</Sim>

小球竖直下落、反弹，两次穿过水平光束（2022 广东卷实验题）。

<Param name="eb" label="反弹系数 e" min={0.7} max={0.95} step={0.05} value={0.8} />
<Param name="hg" label="光电门高度 h" min={0.1} max={0.35} step={0.05} value={0.25} unit="m" />
<Define name="tI" expr="sqrt(2*(1-0.03)/9.8)" />
<Define name="tP1" expr="sqrt(2*(1-hg)/9.8)" />
<Define name="tP2" expr="tI + (eb*9.8*tI - sqrt((eb*9.8*tI)^2 - 2*9.8*(hg-0.03)))/9.8" />

<Sim title="小球两次通过光电门" height={300} duration="tI*(1+eb)" params={["eb", "hg", "tI", "tP1", "tP2"]} marks={[{ t: "tP1", label: "第一次遮光" }, { t: "tP2", label: "第二次遮光" }]} note="小球按 3 cm 画大了，计时用题中 d = 7.884 mm。两次遮光在同一高度，重力势能相同，ΔE = ½m(d/t₁)² − ½m(d/t₂)²。">
sim({
  at(t, p) {
    const g = 9.8, r = 0.03
    if (t <= p.tI) return { y: 1 - g * t * t / 2 }
    const u = t - p.tI
    return { y: r + p.eb * g * p.tI * u - g * u * u / 2 }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -1, xmax: 1, ymin: -0.08, ymax: 1.08, equal: true })
    const g = 9.8, r = 0.03, d = 0.007884, hg = v.p.hg
    const t1 = d / Math.sqrt(2 * g * (1 - hg))
    const t2 = d / Math.sqrt((v.p.eb * g * v.p.tI) ** 2 - 2 * g * (hg - r))
    v.ground(m, -0.45, 0.45, 0)
    v.text(m, -0.45, 0.055, '橡胶材料', { size: 12, align: 'left' })
    v.dim(m, 0.42, 0, 0.42, hg, 'h')
    const now = v.t
    const shown = now < v.p.tP1 ? null : now < v.p.tP2 ? t1 : t2
    const time = shown === null ? null : `${(shown * 1000).toFixed(2)} ms`
    v.photogate(m, hg, -0.12, 0.12, { horizontal: true, blocked: Math.abs(s.y - hg) < r, label: '光电门', post: 0, time, timeLabel: now < v.p.tP2 ? 't₁' : 't₂' })
    v.ball(m, 0, s.y, r)
    v.text(m, -0.95, 1.0, `t₁ = ${(t1 * 1000).toFixed(2)} ms　t₂ = ${now >= v.p.tP2 ? (t2 * 1000).toFixed(2) + ' ms' : '—'}`, { size: 13, align: 'left' })
  },
})
</Sim>

## 三（再续）、回旋加速器

2023 广东卷：质子，B = 1.12 T，最大回旋半径 0.5 m，最大动能 15 MeV。每次过缝获得的动能 qU 放大到 MeV 量级，圈数才画得清。

<Param name="dK" label="每次过缝获得的动能 qU" options={[{ value: 0.5, label: "0.5 MeV" }, { value: 1, label: "1 MeV" }, { value: 1.5, label: "1.5 MeV" }, { value: 3, label: "3 MeV" }, { value: 5, label: "5 MeV" }]} value={1} />
<Param name="hc" label="已转过的半圈数" value={0} min={0} max="Nh" hidden />
<Define name="Nh" expr="15/dK" />
<Define name="r1c" expr="1.35/sqrt(Nh)" />
<Define name="nX" expr="hc > 1e-9 ? min(ceil(hc - 1e-9), Nh) : 0" />

<Sim title="回旋加速器（俯视）" height={380} duration="Nh" time="hc" step={1} stepLabel="前进半周" playSeconds={14} params={["r1c", "Nh"]} timeUnit="半周" marks={[{ t: "Nh", label: "引出" }]} hud={[{ label: "过缝次数", expr: "nX", digits: 0 }, { symbol: "E_k", expr: "nX*dK", unit: "MeV", digits: 1 }, { symbol: "v", expr: "sqrt(2*nX*dK*1.6e-13/1.67e-27)/1e7", unit: "×10⁷ m/s", digits: 2 }]} note="每半圈用时相同（T/2）；qU 越大，过缝次数越少，但最后半径都是 0.5 m，出口速度都是 qBR/m ≈ 5.4×10⁷ m/s。虚线是后面要走的轨迹。">
sim({
  at(t) { return { h: t } },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -2.6, xmax: 2.6, ymin: -2.3, ymax: 1.8, equal: true })
    const e = s.h <= 0 ? 1 : Math.floor(s.h) % 2 === 0 ? -1 : 1
    const cy = v.cyclotron(m, 0, 0, 1.6, { r1: v.p.r1c, halfTurns: v.p.Nh, e })
    v.path(m, cy.points, { color: v.color.steel, width: 1, dash: [3, 4] })
    v.path(m, cy.upTo(s.h), { color: v.color.charge, width: 1.8 })
    const [x, y] = cy.at(s.h)
    v.ball(m, x, y, 0.06, { charge: true })
  },
})
</Sim>

## 四、通电直导线与变压器

<Param name="n2" label="副线圈匝数 n₂" min={50} max={400} step={50} value={100} />

<Figure title="直导线的磁场（左）与理想变压器（右）" height={260} params={["n2"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -4, xmax: 4, ymin: -1.6, ymax: 1.6, equal: true })
    v.wire(m, -2.4, 0, { dir: 'out', label: 'I' })
    const t = v.transformer(m, 1.8, 0, { n1: 200, n2: p.n2 })
    v.label(m, t.p[0][0], (t.p[0][1] + t.p[1][1]) / 2, 'U_1', { place: 'left' })
    v.label(m, t.s[0][0], (t.s[0][1] + t.s[1][1]) / 2, 'U_2', { place: 'right' })
  },
})
</Figure>

## 五、读数仪器

<Param name="L" label="被测长度 L" min={0} max={60} step={0.05} value={23.45} unit="mm" />
<Param name="dd" label="金属丝直径 d" min={0} max={10} step={0.001} value={6.703} unit="mm" />
<Param name="I" label="电流 I" min={0} max={0.6} step={0.01} value={0.34} unit="A" />
<Param name="Rx" label="待测电阻 Rₓ" min={0} max={3000} step={10} value={1400} unit="Ω" />
<Param name="Rb" label="电阻箱阻值" min={0} max={9999} step={1} value={2051} unit="Ω" />

<Instrument title="游标卡尺（20 分度）" type="vernier" value="L" divisions={20} unit="cm" />
<Instrument title="螺旋测微器" type="micrometer" value="dd" />
<Instrument title="电流表（0–0.6 A / 0–3 A）" type="meter" value="I" scales={[0.6, 3]} range={0.6} unit="A" />
<Instrument title="多用电表欧姆挡（×100）" type="ohmmeter" value="Rx" multiplier={100} />
<Instrument title="电阻箱" type="resistanceBox" value="Rb" />

## 六、打点计时器纸带

<Param name="acc" label="加速度 a" min={0} max={2} step={0.1} value={0.8} unit="m/s²" />

<TickerTape title="纸带（每 5 个点取一个计数点）" expr="100*(0.12*t + acc*t^2/2)" count={7} interval={0.1} labels="letters" />

## 七、结点平衡与传感器电路

<Param name="alpha" label="绳 OA 与竖直方向夹角 α" min={10} max={70} step={1} value={37} unit="°" />
<Define name="Gw" expr="10" />

<ForceDiagram
  title="结点 O 受力（三绳共点）"
  body={{ shape: "knot", label: "O" }}
  forces={[
    { label: "T_A", angle: "90 + alpha", solve: "TA", showValue: true, unit: "N" },
    { label: "T_B", angle: 0, solve: "TB", showValue: true, unit: "N" },
    { label: "G", angle: -90, magnitude: "Gw", showValue: true, unit: "N" },
  ]}
  triangle={true}
/>

<ForceDiagram
  title="斜面上加速下滑的物块"
  surface={{ type: "incline", angle: 30 }}
  forces={[
    { label: "G", angle: -90, magnitude: 10 },
    { label: "F_N", angle: 120, solve: "NSl" },
    { label: "f", angle: 30, magnitude: "0.2*NSl", at: "contact" },
  ]}
  mass={1}
  accel={{ angle: 210, solve: "aSl" }}
  triangle={{ resultant: "F_{合}" }}
/>

<Circuit
  title="温控与光控电路元件"
  source={{ series: [ { type: "battery", label: "E" } ] }}
  load={{ series: [
    { type: "thermistor", label: "R_T" },
    { type: "photoresistor", label: "R_G" },
    { type: "motor", label: "M" },
    { type: "switch", label: "S", closed: true },
  ] }}
/>

## 七（续）、动态平衡：两段绳夹角不变

2017 全国Ⅰ卷第 21 题：柔软轻绳 ON 的 O 端固定，中间 M 点拴重物，手拉 N 端；保持 ∠OMN = α 不变，把 OM 从竖直缓慢拉到水平。

<Param name="alM" label="两段绳的夹角 α" min={100} max={160} step={5} value={120} unit="°" />
<Param name="thM" label="OM 转过的角 θ" min={0} max={90} step={1} value={20} unit="°" />
<Define name="thPk" expr="alM - 90" />
<Define name="T1pk" expr="1/sin(deg(alM))" />

<Preset label="初始：OM 竖直" set={{ thM: 0 }} />
<Preset label="T₁ 最大：MN 水平" set={{ thM: "alM - 90" }} />
<Preset label="最后：OM 水平" set={{ thM: 90 }} />

<Status cases={[
  { when: "thM < 0.5", label: "OM 竖直：T₁ = mg，T₂ = 0", tone: "neutral" },
  { when: "abs(thM - thPk) < 0.5", label: "MN 水平：T₁ 最大，等于 mg/sinα", tone: "warning" },
  { when: "thM < thPk", label: "T₁、T₂ 都在增大", tone: "info" },
  { label: "T₁ 减小，T₂ 继续增大", tone: "info" },
]} />

<Figure title="绳的位置" height={320} params={["alM", "thM"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -1.2, xmax: 3.0, ymin: -2.45, ymax: 1.2, equal: true })
    const d = Math.PI / 180
    const th = p.thM * d
    const al = p.alM * d
    const L1 = 1.5
    const L2 = 0.9
    const Mx = L1 * Math.sin(th)
    const My = -L1 * Math.cos(th)
    const psi = Math.PI / 2 + th - al
    const Nx = Mx + L2 * Math.cos(psi)
    const Ny = My + L2 * Math.sin(psi)
    v.line(m, 0, 0, 0, -1.9, { color: v.color.steel, dash: [4, 4] })
    v.ellipse(m, 0, 0, L1, L1, { color: v.color.hairline, dash: [3, 4], from: -90, to: 0 })
    v.rect(m, -0.45, 0, 0.9, 0.07, { fill: v.color.ink })
    v.rope(m, [[0, 0], [Mx, My]])
    v.rope(m, [[Mx, My], [Nx, Ny]])
    v.rope(m, [[Mx, My], [Mx, My - 0.22]])
    v.block(m, Mx, My - 0.44, 0.3, 0.22)
    v.circle(m, Nx, Ny, 0.05, { fill: v.color.graphite })
    if (th > 0.02) v.ellipse(m, 0, 0, 0.36, 0.36, { color: v.color.graphite, from: -90, to: -90 + p.thM })
    v.ellipse(m, Mx, My, 0.26, 0.26, { color: v.color.graphite, from: 90 + p.thM - p.alM, to: 90 + p.thM })
    if (th > 0.12) v.text(m, 0.5 * Math.sin(th / 2), -0.5 * Math.cos(th / 2), 'θ', { size: 14, color: v.color.ink })
    const mid = Math.PI / 2 + th - al / 2
    v.text(m, Mx + 0.42 * Math.cos(mid), My + 0.42 * Math.sin(mid), 'α', { size: 14, color: v.color.ink })
    v.label(m, 0, 0.07, 'O', { place: 'above-left' })
    v.label(m, Mx, My, 'M', { place: th > 0.6 ? 'above-left' : 'left' })
    v.label(m, Nx, Ny, 'N', { place: 'right' })
  },
})
</Figure>

<ForceDiagram
  title="M 点受力与矢量三角形"
  body={{ shape: "knot", label: "M" }}
  forces={[
    { label: "mg", angle: -90, magnitude: 1 },
    { label: "T_1", angle: "90 + thM", solve: "T1m", showValue: true, unit: "mg", digits: 2 },
    { label: "T_2", angle: "90 + thM - alM", solve: "T2m", showValue: true, unit: "mg", digits: 2 },
  ]}
  scale={{ max: "T1pk" }}
  triangle={{ circle: true, angleLabel: "180°−α" }}
/>

<Plot
  title="两段绳的张力随 θ 变化"
  x={{ name: "x", label: "θ", unit: "°", min: 0, max: 90 }}
  y={{ label: "T", unit: "mg", min: 0, max: "1.15*T1pk" }}
  series={[
    { label: "OM 的张力 T₁", expr: "sin(deg(alM - x))/sin(deg(alM))" },
    { label: "MN 的张力 T₂", expr: "sin(deg(x))/sin(deg(alM))" },
  ]}
  marks={[{ x: "thPk", series: 0, label: "T₁ 最大：MN 水平" }]}
  cursor="thM"
/>

mg 不变，T₁ 与 T₂ 的夹角始终是 180° − α，所以三角形里 mg 对的角不变，T₁、T₂ 的交点沿辅助圆移动。T₂ 这条边一路变长（A 对）；T₁ 这条边先变长后变短，等于直径时最大，这时 MN 水平（D 对）。

## 八、氢原子能级与光电效应

<Param name="pick" label="选中的跃迁" options={[{ value: 0, label: "4→3" }, { value: 1, label: "4→2" }, { value: 2, label: "4→1" }, { value: 3, label: "3→2" }, { value: 4, label: "3→1" }, { value: 5, label: "2→1" }]} value={1} />
<Param name="W0" label="金属逸出功 W₀" options={[{ value: 2.29, label: "钠 2.29 eV" }, { value: 3.34, label: "锌 3.34 eV" }, { value: 4.54, label: "钨 4.54 eV" }]} value={2.29} />

<EnergyLevels title="氢原子能级图（一群处于 n=4 的原子）" allFrom={4} select="pick" workFunction="W0" visible />

<EnergyLevels title="自定义能级与吸收、电离" levels={[{ n: 1, E: -10.4 }, { n: 2, E: -5.5 }, { n: 3, E: -3.7 }, { n: 4, E: -1.6 }, { n: "∞", E: 0 }]} transitions={[{ from: 1, to: 3, label: "a" }, { from: 2, to: "∞", label: "b" }, { from: 4, to: 2, label: "c" }]} select={0} note="某原子的能级（示意）：a 为吸收、b 为电离、c 为辐射。" />

## 九、实物连线：伏安法测电阻

<Param name="slide" label="滑片位置（从 A 端算起）" min={0} max={1} step={0.05} value={0.5} />
<Param name="on" label="开关" options={[{ value: 0, label: "断开" }, { value: 1, label: "闭合" }]} value={1} />
电源 3 V（内阻 0.5 Ω），R_x = 5 Ω，变阻器 0～20 Ω，电流表内阻 0.1 Ω，电压表内阻 3 kΩ。两表读数由电路实时求解，先不显示答案线时电压表读 0。


<Wiring
  title="电流表外接、滑动变阻器限流"
  height={350}
  parts={[
    { id: "A", type: "ammeter", r: 0.1, read: "Iw", label: "电流表", x: 470, y: 125 },
    { id: "V", type: "voltmeter", r: 3000, read: "Uw", label: "电压表", x: 220, y: 70 },
    { id: "Rx", type: "resistor", R: 5, label: "R_x", x: 220, y: 175 },
    { id: "E", type: "battery", emf: 3, r: 0.5, label: "电源 E", x: 100, y: 295 },
    { id: "S", type: "switch", closed: "on", label: "S", x: 265, y: 295 },
    { id: "R", type: "rheostat", R: 20, slider: "slide", label: "R", x: 470, y: 272 },
  ]}
  wires={[
    { from: "E.+", to: "S.a" },
    { from: "S.b", to: "R.A" },
    { from: "R.D", to: "A.0.6" },
    { from: "A.-", to: "Rx.b" },
    { from: "Rx.a", to: "E.-" },
    { from: "V.3", to: "Rx.b", answer: true },
    { from: "V.-", to: "Rx.a", answer: true },
  ]}
  note="电压表的两根线是待连的答案线。"
/>

<Wiring
  title="其他实物元件：电阻箱、小灯泡、灵敏电流计"
  height={300}
  parts={[
    { id: "E", type: "battery", emf: 3, r: 0, x: 110, y: 90 },
    { id: "S", type: "switch", closed: "on", x: 290, y: 90 },
    { id: "G", type: "galvanometer", r: 100, full: 0.001, read: "Ig", label: "灵敏电流计", x: 490, y: 90 },
    { id: "RB", type: "resistanceBox", value: 4890, label: "电阻箱", x: 190, y: 225 },
    { id: "L", type: "lamp", R: 10, power: 0.75, label: "L", x: 500, y: 215 },
  ]}
  wires={[
    { from: "E.+", to: "S.a" },
    { from: "S.b", to: "G.+" },
    { from: "G.-", to: "L.b" },
    { from: "L.a", to: "RB.b" },
    { from: "RB.a", to: "E.-" },
  ]}
  note="电源 3 V，G 内阻 100 Ω、满偏 1 mA，电阻箱 4890 Ω：电流只有 0.6 mA，G 偏转六成，灯丝远远达不到发光的功率。"
/>

## 九（续）、实物连线：分压接法，一根一根接

电源 E = 3 V（内阻 0.5 Ω），滑动变阻器 0～20 Ω，待测电阻约 5 Ω，电流表内阻 0.1 Ω，电压表内阻 3 kΩ。课件只写元件参数和接线，两表读数由组件按接上的导线实时求解（节点电压法），再通过 read 交给下面的读数和状态。

<Param name="sd" label="滑片位置（从 A 端算起）" min={0} max={1} step={0.05} value={0.6} />
<Param name="sw" label="开关 S" options={[{ value: 0, label: "断开" }, { value: 1, label: "闭合" }]} value={1} />
<Param name="wk" label="已接导线" min={0} max={8} step={1} value={8} hidden />

<Wiring
  title="分压接法 + 电流表外接"
  height={385}
  steps="wk"
  parts={[
    { id: "V", type: "voltmeter", r: 3000, read: "UV", label: "电压表", x: 190, y: 72 },
    { id: "A", type: "ammeter", r: 0.1, read: "IA", label: "电流表", x: 480, y: 80 },
    { id: "Rx", type: "resistor", R: 5, label: "R_x", x: 190, y: 185 },
    { id: "R", type: "rheostat", R: 20, slider: "sd", label: "R", x: 450, y: 225 },
    { id: "S", type: "switch", closed: "sw", label: "S", x: 370, y: 335 },
    { id: "E", type: "battery", emf: 3, r: 0.5, label: "电源 E", x: 525, y: 330 },
  ]}
  wires={[
    { from: "E.+", to: "R.B", note: "从电源正极出发" },
    { from: "R.A", to: "S.a", note: "变阻器下面的 A、B 两端都接进主回路" },
    { from: "S.b", to: "E.-", note: "主回路闭合：电流流过整根电阻丝，但两表还没有读数" },
    { from: "R.D", to: "A.0.6", note: "从滑片引出。最大电流约 0.5 A，选 0.6 A 量程" },
    { from: "A.-", to: "Rx.b" },
    { from: "Rx.a", to: "S.a", note: "回到 A 端这一侧：R_x 支路与 AP 段并联，电流表开始有读数" },
    { from: "V.3", to: "Rx.b", note: "电压表正接线柱接电流流入 R_x 的一端，量程 3 V" },
    { from: "V.-", to: "Rx.a", note: "电压表只并在 R_x 两端（外接）。注意电流表读数略微变大：它多算了流过电压表的电流" },
  ]}
/>

<Readout items={[
  { label: "电流表", symbol: "I", expr: "IA", unit: "A", digits: 4 },
  { label: "电压表", symbol: "U", expr: "UV", unit: "V", digits: 3 },
  { label: "测量值", symbol: "R_测", expr: "UV > 0 ? UV/IA : NaN", unit: "Ω", digits: 3 },
]} />

<Status cases={[
  { when: "wk < 3", label: "主回路还没接通：两表都不偏转", tone: "neutral" },
  { when: "sw < 0.5", label: "开关断开：两表都回零", tone: "neutral" },
  { when: "wk < 6", label: "主回路已通，R_x 支路还没接上：电流表仍为 0", tone: "info" },
  { when: "wk < 8", label: "电流表有读数；电压表还没接上", tone: "info" },
  { when: "sd < 0.025", label: "滑片在 A 端：R_x 两端电压为 0，闭合开关前应放在这里", tone: "success" },
  { label: "外接法：R_测 = U/I 比真实值 5 Ω 略小", tone: "info" },
]} />

## 十、气体分子速率分布

<Param name="Tg" label="温度 T" unit="K" min={100} max={900} step={1} value={373} />
<Preset label="0 ℃" set={{ Tg: 273 }} />
<Preset label="100 ℃" set={{ Tg: 373 }} />
<Preset label="600 K" set={{ Tg: 600 }} />

<GasBox title="氧气分子：温度升高，分布峰右移、变矮" T="Tg" gas="O2" compare={273} tag />

<GasBox title="从同一速率出发：碰撞把分布变成麦克斯韦分布" T={300} gas="N2" count={360} start="same" autoplay={false} note="开始时所有分子速率都等于方均根速率（只有一根柱子）。按播放，碰撞让有的分子变快、有的变慢，几秒后柱子落到理论曲线上；总动能不变，所以温度不变。" />

温度升高，速率大的分子占比增加、速率小的分子占比减少，曲线峰值向速率大的方向移动、峰变低；两条曲线下的面积都是 100%。单个分子的速率不停在变，但大量分子的统计分布是稳定的。

## 十一、运动积分：有空气阻力的竖直上抛

课件只写受力（加速度 a = −g − k·v，阻力和速度反向、大小正比于速率），不写解析解：`<Motion>` 用 RK4 积分，自动找出「速度为零」「落回抛出点」两个时刻，再把位置、速度作为时间的函数交给动画和 v–t 图。

<Param name="kd" label="阻力系数 k" unit="1/s" min={0} max={1} step={0.05} value={0.4} />
<Param name="vu" label="抛出速度 v₀" unit="m/s" min={5} max={30} step={1} value={20} />
<Param name="tm" label="时刻" min={0} max={7} value={0} hidden />
<Preset label="无阻力" set={{ kd: 0 }} />
<Preset label="阻力较大" set={{ kd: 0.8 }} />

<Motion name="ball" label="有阻力" state={{ y: 0, v: "vu" }} rates={{ y: "v", v: "-10 - kd*v" }} until={10}
  events={[{ name: "tTop", when: "v", dir: "down" }, { name: "tBack", when: "y", dir: "down", stop: true }]}
  read={{ Hd: "max(y)", vBack: "v @ tBack" }} />
<Motion name="free" label="无阻力" state={{ y: 0, v: "vu" }} rates={{ y: "v", v: "-10" }} until={10}
  events={[{ name: "tFree", when: "y", dir: "down", stop: true }]} />

<Sim title="有阻力（实心）与无阻力（虚影）同时抛出" height={300} duration="max(tBack, tFree)" time="tm" params={["ball", "free", "vu", "Hd"]}
  marks={[{ t: "tTop", label: "有阻力：最高点" }, { t: "tFree", label: "无阻力：落回" }, { t: "tBack", label: "有阻力：落回" }]}
  hud={[{ symbol: "v", expr: "ball.v(tm)", unit: "m/s", digits: 1 }, { symbol: "y", expr: "ball.y(tm)", unit: "m", digits: 1 }]}>
sim({
  at(t, p) {
    return { b: p.ball.state(t), f: p.free.state(t), back: t >= p.ball.tEnd, freeBack: t >= p.free.tEnd }
  },
  draw(ctx, s, v) {
    const H = (v.p.vu * v.p.vu) / 20
    const m = v.view({ xmin: -1.8 * H, xmax: 1.8 * H, ymin: -0.08 * H, ymax: 1.12 * H, equal: true })
    v.ground(m, -1.8 * H, 1.8 * H, 0)
    const r = 0.06 * H
    for (const [y, text] of [[H, '无阻力最高点'], [v.p.Hd, '有阻力最高点']]) {
      v.line(m, -1.4 * H, y, 1.4 * H, y, { color: v.color.hairline, dash: [4, 4] })
      v.label(m, 1.25 * H, y, text, { color: v.color.steel })
    }
    v.ball(m, -0.45 * H, s.f.y + r, r, { ghost: true })
    v.label(m, -0.45 * H - 3 * r, s.f.y + r, '无阻力', { color: v.color.steel })
    v.ball(m, 0.45 * H, s.b.y + r, r)
    v.label(m, 0.45 * H - 3 * r, s.b.y + r, '有阻力')
    if (!s.back) v.vec(m, 0.45 * H, s.b.y + r, 0, s.b.v * 0.02 * H, { kind: 'velocity', label: 'v', min: 0.5 })
  },
})
</Sim>

<Plot title="v–t 图：上升段比下降段陡" x={{ name: "t", label: "t", unit: "s", min: 0, max: "max(tBack, tFree)" }} y={{ label: "v", unit: "m/s" }}
  series={[{ label: "有阻力", expr: "t <= tBack ? ball.v(t) : NaN", color: "velocity" }, { label: "无阻力", expr: "t <= tFree ? free.v(t) : NaN", dash: true, color: "steel" }]}
  marks={[{ x: "tTop", series: 0, label: "最高点 v = 0" }, { x: "tBack", series: 0, label: "落回" }]}
  areas={[{ series: 0, from: 0, until: "tTop", label: "上升高度", color: "velocity" }]}
  cursor="tm" />

<Readout items={[
  { label: "上升时间", symbol: "t_上", expr: "tTop", unit: "s", digits: 2 },
  { label: "下降时间", symbol: "t_下", expr: "tBack - tTop", unit: "s", digits: 2 },
  { label: "最大高度", symbol: "H", expr: "Hd", unit: "m", digits: 2 },
  { label: "落回速度", symbol: "v", expr: "abs(vBack)", unit: "m/s", digits: 2 },
]} />

<Status cases={[
  { when: "kd < 0.025", label: "无阻力：上升、下降时间相等，落回速度等于 v₀", tone: "info" },
  { label: "有阻力：上升加速度 g + kv 大于下降加速度 g − kv，所以上升时间短、落回速度小于 v₀", tone: "warning" },
]} />

## 十二、受力驱动的运动：板块模型

课件只写每个物体受哪些力、摩擦因数是多少，不写加速度：`<Motion>` 的 `bodies` 按 ΣF = ma 自己算出两物体的加速度，并判断每个接触面是静摩擦还是滑动摩擦——地面先用静摩擦挡住木板，拉力超过最大静摩擦后两者一起加速，A 需要的静摩擦超过 μ₁N 时 A 开始相对木板滑动。

<Param name="kF" label="拉力增长率 k（F = kt）" unit="N/s" min={1} max={6} step={0.5} value={4} />
<Param name="mu1" label="A 与 B 间的动摩擦因数 μ₁" min={0.1} max={0.6} step={0.05} value={0.4} />
<Param name="mu2" label="B 与地面间的动摩擦因数 μ₂" min={0} max={0.3} step={0.05} value={0.1} />
<Param name="tk" label="时刻" min={0} max={6} value={0} hidden />

<Motion name="pk" label="板块" until={6} steps={2400}
  bodies={[
    { name: "A", mass: 1, along: 0, x: 1, forces: [
      { label: "G", angle: -90, magnitude: 10 },
      { label: "N", angle: 90, solve: "NA" },
      { label: "f", friction: { mu: "mu1", normal: "NA", with: "B", slip: "tSlip" }, solve: "fA" },
    ] },
    { name: "B", mass: 2, along: 0, forces: [
      { label: "G", angle: -90, magnitude: 20 },
      { label: "N'", angle: -90, magnitude: "NA" },
      { label: "N", angle: 90, solve: "NB" },
      { label: "F", angle: 0, magnitude: "kF*t" },
      { label: "f", friction: { mu: "mu2", normal: "NB", slip: "tGround" }, solve: "fB" },
    ] },
  ]}
  events={[{ name: "tOff", when: "xB - xA - 2.5", dir: "up", stop: true }]} />

<Sim title="木板 B 在拉力下运动，物块 A 在板上（镜头跟着木板）" height={260} duration="pk.tEnd" time="tk" params={["pk", "kF", "tSlip", "tGround"]}
  marks={[{ t: "tGround", label: "木板开始运动" }, { t: "tSlip", label: "A 开始相对滑动" }]}
  hud={[{ symbol: "F", expr: "kF*tk", unit: "N", digits: 1 }, { symbol: "v_A", expr: "pk.vA(tk)", unit: "m/s", digits: 2 }, { symbol: "v_B", expr: "pk.vB(tk)", unit: "m/s", digits: 2 }]}>
sim({
  at(t, p) {
    return p.pk.state(t)
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -3.4, xmax: 3.4, ymin: -0.45, ymax: 1.5, equal: true })
    v.ground(m, -3.4, 3.4, 0)
    const shift = ((s.xB % 0.5) + 0.5) % 0.5
    for (let k = -7; k <= 7; k++) v.line(m, k * 0.5 - shift, 0, k * 0.5 - shift, -0.12, { color: v.color.steel })
    const plank = v.cart(m, -2.5, 0, 5, 0.22, { label: 'B' })
    const rel = s.xA - s.xB
    v.block(m, rel, plank.top, 0.6, 0.42, { label: 'A' })
    v.vec(m, 2.5, 0.11, v.p.kF * v.t * 0.05, 0, { kind: 'force', label: 'F', min: 0.05 })
    v.vec(m, rel, plank.top + 0.03, s.fA * 0.12, 0, { kind: 'force', label: 'f', min: 0.05 })
    v.event(m, rel, plank.top + 0.6, '木板开始运动', { at: v.p.tGround })
    v.event(m, rel, plank.top + 0.6, 'A 开始相对 B 滑动', { at: v.p.tSlip })
  },
})
</Sim>

<ForceDiagram title="物块 A 受力（随时刻变化）" body={{ shape: "block", label: "A" }} surface={{ type: "ground" }} scale={{ max: 10 }}
  forces={[
    { label: "G", angle: -90, magnitude: 10, showValue: true, unit: "N" },
    { label: "N", angle: 90, magnitude: "pk.NA(tk)", showValue: true, unit: "N" },
    { label: "f", angle: 0, magnitude: "pk.fA(tk)", at: "contact", showValue: true, unit: "N", digits: 2 },
  ]} />

<Plot title="v–t 图：共同加速，然后分开" x={{ name: "t", label: "t", unit: "s", min: 0, max: "pk.tEnd" }} y={{ label: "v", unit: "m/s" }}
  series={[{ label: "物块 A", expr: "pk.vA(t)", color: "velocity" }, { label: "木板 B", expr: "pk.vB(t)", color: "steel" }]}
  marks={[{ x: "tGround", series: 1, label: "木板开始运动" }, { x: "tSlip", series: 0, label: "开始相对滑动" }]}
  cursor="tk" />

<Readout items={[
  { label: "木板开始运动", symbol: "t_1", expr: "tGround", unit: "s", digits: 2 },
  { label: "A 开始相对滑动", symbol: "t_2", expr: "tSlip", unit: "s", digits: 2 },
  { label: "此刻 A 受的摩擦力", symbol: "f", expr: "pk.fA(tk)", unit: "N", digits: 2 },
]} />

<Status cases={[
  { when: "tk < tGround", label: "F 小于地面最大静摩擦 μ₂(m + M)g：都不动，A 不受摩擦力", tone: "neutral" },
  { when: "not (tk >= tSlip)", label: "一起加速：A 靠静摩擦加速，f = ma 随 F 增大", tone: "info" },
  { label: "A 相对 B 滑动：A 受滑动摩擦 μ₁mg 不变，加速度 μ₁g", tone: "warning" },
]} />

木板开始运动的时刻 t₁ = μ₂(m + M)g / k；一起加速时 A 的加速度 a = (kt − μ₂(m + M)g)/(m + M)，A 需要的静摩擦 ma 达到 μ₁mg 时开始相对滑动，t₂ = (μ₁ + μ₂)(m + M)g / k。拖动三个滑块，两个时刻都跟着这两个式子变。

## 十三、纸带接运动：测动摩擦因数

物块 A（0.5 kg）在水平桌面上，由跨过滑轮的细绳挂钩码 B 拉动，A 后面拖着纸带。纸带上的点由 `<Motion>` 按受力算出的运动打出，学生用逐差法求 a，再由 m_B g − μ m_A g = (m_A + m_B)a 反推 μ。

<Param name="muT" label="桌面动摩擦因数 μ" min={0.1} max={0.5} step={0.05} value={0.3} />
<Param name="mB" label="钩码质量 m_B" unit="kg" min={0.2} max={0.6} step={0.05} value={0.3} />

<Motion name="lab" label="测 μ" until={1}
  bodies={[
    { name: "A", mass: 0.5, along: 0, forces: [
      { label: "G", angle: -90, magnitude: 5 },
      { label: "N", angle: 90, solve: "NT" },
      { label: "f", friction: { mu: "muT", normal: "NT" } },
    ] },
    { name: "B", mass: "mB", along: -90, forces: [{ label: "G", angle: -90, magnitude: "mB*10" }] },
  ]}
  ropes={[{ between: ["A", "B"], solve: "TT" }]} />

<TickerTape title="物块 A 拖动的纸带（每 5 个点取一个计数点）" expr="100*lab.xA(t)" start={0.1} count={7} interval={0.1} labels="letters" />

<Readout items={[
  { label: "绳的拉力", symbol: "T", expr: "lab.TT(0.5)", unit: "N", digits: 3 },
  { label: "由加速度反推 μ", symbol: "μ", expr: "(mB*10 - (0.5 + mB)*lab.accA(0.5))/5", digits: 3 },
]} />

钩码太轻（m_B g ≤ μ m_A g）时 A 被静摩擦拉住不动，纸带上只有一个点。

## 十四、电容器放电：I–t 图的面积就是电荷量

开关先掷向 1，电源给电容器充电到 E；t = 0 时掷向 2，电容器通过电阻 R 放电，电流传感器记下 I–t 图。`<Circuit transient>` 把电容电压当成随时间变化的状态，每一瞬间按基尔霍夫定律解一次电路，积分得到放电曲线——课件里没有写 e^(−t/RC)。

<Param name="Cu" label="电容 C" unit="μF" min={200} max={1000} step={10} value={470} />
<Param name="Rk" label="电阻 R" unit="kΩ" min={1} max={5} step={0.5} value={2} />
<Param name="tc" label="时刻 t" unit="s" min={0} max={20} step={0.05} value={1} />

<Circuit
  title="电容器放电（S 在 t = 0 由 1 掷向 2）"
  source={{ series: [ { type: "battery", label: "E = 8 V", emf: 8 }, { type: "switch", label: "S→1", closed: "t < 0" } ] }}
  load={{ parallel: [
    { type: "capacitor", label: "C", C: "Cu*1e-6", read: { U: "UC", Q: "QC" }, note: { expr: "UC", unit: "V", digits: 2 } },
    { series: [
      { type: "switch", label: "S→2", closed: "t >= 0" },
      { type: "ammeter", label: "电流传感器", read: "IA", note: { expr: "IA*1000", unit: "mA", digits: 3 } },
      { type: "resistor", label: "R", R: "Rk*1000" },
    ] },
  ] }}
  transient={{ name: "dis", until: 20, steps: 2000, at: "tc",
    events: [{ name: "tHalf", when: "UC - 4", dir: "down" }],
    read: { I0: "IA @ 0" } }} />

<Plot title="放电电流 I–t 图（阴影面积 = 0 到 t 放出的电荷）" x={{ name: "t", label: "t", unit: "s", min: 0, max: 20 }} y={{ label: "I", unit: "mA" }}
  series={[{ label: "I", expr: "1000*dis.IA(t)", color: "charge" }]}
  areas={[{ series: 0, from: 0, until: "tc", label: "ΔQ" }]}
  marks={[{ x: "tHalf", series: 0, label: "电压减半" }]}
  cursor="tc" />

<Readout items={[
  { label: "开始放电时的电流 E/R", symbol: "I_0", expr: "1000*I0", unit: "mA", digits: 3 },
  { label: "电压减半用时（RC·ln2）", symbol: "t_½", expr: "tHalf", unit: "s", digits: 3 },
  { label: "0 到 t 放出的电荷 C(E − U_C)", symbol: "ΔQ", expr: "1000*(dis.QC(0) - dis.QC(tc))", unit: "mC", digits: 3 },
  { label: "充满时的电荷 CE", symbol: "Q", expr: "Cu*8/1000", unit: "mC", digits: 3 },
]} />

R 越大放电越慢但开始的电流越小，C 越大放电越久；无论怎样改，整条曲线下的面积都等于 CE。

## 十五、断电自感：灯泡闪亮一下

线圈 L（直流电阻 r_L）与灯泡 A 并联接在电源上。闭合 S 时线圈的电流慢慢增大；断开 S 后电源不再供电，线圈的电流不能突变，只能经灯泡流回——灯泡电流反向，大小等于线圈原来的电流。r_L 比灯泡电阻小时，这个电流比灯泡原来的电流大，灯泡闪亮一下再熄灭。

<Param name="rL" label="线圈直流电阻 r_L" unit="Ω" min={1} max={20} step={1} value={2} />
<Param name="ts" label="时刻 t" unit="s" min={0} max={2} step={0.005} value={1.25} />

<Circuit
  title="S 在 t = 0.1 s 闭合，t = 1.2 s 断开"
  source={{ series: [ { type: "battery", label: "E = 6 V", emf: 6, r: 0.5 }, { type: "switch", label: "S", closed: "t >= 0.1 and t < 1.2" } ] }}
  load={{ parallel: [
    { type: "lamp", label: "A（10 Ω）", R: 10, power: 12, read: { I: "IA", lit: "litA" }, lit: "litA", note: { expr: "IA", unit: "A", digits: 2 } },
    { type: "inductor", label: "L = 0.5 H", L: 0.5, r: "rL", read: "IL", note: { expr: "IL", unit: "A", digits: 2 } },
  ] }}
  transient={{ name: "self", until: 2, steps: 2000, at: "ts", read: { IAon: "IA @ 1.1", IAflash: "min(IA)" } }} />

<Plot title="灯泡电流与线圈电流" x={{ name: "t", label: "t", unit: "s", min: 0, max: 2 }} y={{ label: "I", unit: "A" }}
  series={[{ label: "灯泡 A", expr: "self.IA(t)", color: "charge" }, { label: "线圈 L", expr: "self.IL(t)", color: "steel" }]}
  marks={[{ x: 1.2, series: 0, label: "断开 S" }]}
  cursor="ts" />

<Readout items={[
  { label: "断开前灯泡电流", symbol: "I_A", expr: "IAon", unit: "A", digits: 2 },
  { label: "断开瞬间灯泡电流", symbol: "I_A'", expr: "IAflash", unit: "A", digits: 2 },
]} />

<Status cases={[
  { when: "-IAflash > IAon * 1.02", label: "r_L 小于灯泡电阻：断开瞬间灯泡电流比原来大，闪亮一下再熄灭", tone: "warning" },
  { label: "r_L 不小于灯泡电阻：断开后灯泡电流不比原来大，只是逐渐熄灭", tone: "neutral" },
]} />

断开瞬间灯泡电流的大小等于线圈原来的电流 E′/r_L，方向与原来相反；之后按 τ = L/(R_A + r_L) 衰减。

## 十六、电磁感应：导体棒在恒力下达到收尾速度

水平导轨间距 0.5 m，匀强磁场垂直纸面向里。导体棒 ab 质量 0.2 kg、电阻 0.1 Ω，在恒力 F 作用下从静止出发；导轨电阻为 R。棒相当于电动势 BLv 的电源，安培力由电路里解出的电流算回来——课件不写 v = vm(1 − e^(−t/τ))。

<Param name="Bb" label="磁感应强度 B" unit="T" min={0.8} max={1.2} step={0.1} value={1} />
<Param name="Fb" label="恒力 F" unit="N" min={0.2} max={0.8} step={0.1} value={0.4} />
<Param name="Rbar" label="导轨电阻 R" unit="Ω" min={0.2} max={0.6} step={0.1} value={0.4} />
<Param name="tbar" label="时刻" min={0} max={8} value={0} hidden />

<Motion name="rod" label="导体棒" until={8} steps={1600}
  bodies={[
    { name: "ab", mass: 0.2, along: 0, x: 0, v: 0, forces: [
      { label: "F", angle: 0, magnitude: "Fb" },
      { label: "FA", angle: 180, magnitude: "Bb*Iab*0.5" },
    ] },
  ]}
  state={{ q: 0, Q: 0 }}
  rates={{ q: "Iab", Q: "Iab^2*(Rbar + 0.1)" }}
  circuit={{
    source: { type: "battery", label: "ab（E = BLv）", emf: "Bb*0.5*vab", r: 0.1, read: { I: "Iab" } },
    load: { type: "resistor", label: "R", R: "Rbar", note: { expr: "Iab", unit: "A", digits: 3 } },
  }}
  read={{ vm: "vab @ tEnd" }} />

<Sim title="导体棒在水平导轨上运动" height={280} duration="rod.tEnd" time="tbar" params={["rod", "Fb"]}
  hud={[{ symbol: "v", expr: "rod.vab(tbar)", unit: "m/s", digits: 3 }, { symbol: "I", expr: "rod.Iab(tbar)", unit: "A", digits: 3 }]}>
sim({
  at(t, p) {
    return p.rod.state(t)
  },
  draw(ctx, s, v) {
    const x = s.xab
    const m = v.view({ xmin: x - 1.15, xmax: x + 1.15, ymin: -0.42, ymax: 0.95, equal: true })
    v.field(m, x - 1.05, -0.02, x + 1.05, 0.52, { dir: 'in', step: 26 })
    v.line(m, x - 1.05, 0, x + 1.05, 0, { color: v.color.steel })
    v.line(m, x - 1.05, 0.5, x + 1.05, 0.5, { color: v.color.steel })
    const shift = ((x % 0.4) + 0.4) % 0.4
    for (let k = -3; k <= 3; k++) {
      const tx = x - shift + k * 0.4
      if (Math.abs(tx - x) <= 1.05) v.line(m, tx, 0, tx, -0.08, { color: v.color.steel })
    }
    v.bar(m, x, 0, x, 0.5, { label: 'ab' })
    v.vec(m, x, 0.62, 0.42, 0, { kind: 'force', label: 'F' })
    v.vec(m, x, 0.18, -s.Iab * 0.45, 0, { kind: 'force', label: '安培力', min: 0.04 })
    if (Math.abs(s.Iab) > 0.02) {
      const dir = s.Iab > 0 ? 1 : -1
      v.arrow(m, x + 0.08, 0.25 - dir * 0.12, x + 0.08, 0.25 + dir * 0.12, { color: v.color.charge })
      v.label(m, x + 0.22, 0.25, 'I', { color: v.color.charge })
    }
  },
})
</Sim>

<Circuit title="导体棒的等效电路" motion="rod" at="tbar" current={{ expr: "rod.Iab(tbar)", unit: "A", label: "I", digits: 3 }} />

<Plot title="速度趋向收尾速度" x={{ name: "t", label: "t", unit: "s", min: 0, max: "rod.tEnd" }} y={{ label: "v", unit: "m/s" }}
  series={[{ label: "v", expr: "rod.vab(t)", color: "velocity" }, { label: "收尾速度", expr: "vm", dash: true, color: "steel" }]}
  cursor="tbar" />

<Plot title="电流随时间减小" x={{ name: "t", label: "t", unit: "s", min: 0, max: "rod.tEnd" }} y={{ label: "I", unit: "A" }}
  series={[{ label: "I", expr: "rod.Iab(t)", color: "charge" }]}
  cursor="tbar" />

<Readout items={[
  { label: "收尾速度", expr: "vm", unit: "m/s", digits: 4 },
  { label: "此刻位移", expr: "rod.xab(tbar)", unit: "m", digits: 4 },
  { label: "此刻速度", expr: "rod.vab(tbar)", unit: "m/s", digits: 4 },
  { label: "此刻电流", expr: "rod.Iab(tbar)", unit: "A", digits: 4 },
  { label: "通过的电荷量", expr: "rod.q(tbar)", unit: "C", digits: 4 },
  { label: "焦耳热", expr: "rod.Q(tbar)", unit: "J", digits: 4 },
]} />

收尾速度 vm = F(R + r)/(B²L²)，这里 L = 0.5 m、r = 0.1 Ω。通过的电荷量 q = BLx/(R + r)。拉力做的功等于动能加焦耳热：Fx = ½mv² + Q。拖 B、F、R，这三个关系都还在。

## 十七、双棒：动量守恒与共同速度

两根棒放在同一对导轨上（间距 0.5 m，磁场 B = 1 T 向里）。棒 A 质量 0.1 kg、电阻 0.2 Ω，以初速 v₀ 向右；棒 B 质量 m₂、电阻 0.3 Ω，开始静止。两棒的电动势在回路里方向相反，安培力使 A 减速、B 加速，总动量不变，最后以同一速度一起运动。

<Param name="vA0" label="A 的初速" unit="m/s" min={1} max={3} step={0.5} value={2} />
<Param name="m2b" label="B 的质量" unit="kg" min={0.1} max={0.4} step={0.1} value={0.2} />
<Param name="tpair" label="时刻" min={0} max={3} value={0} hidden />

<Motion name="pair" label="双棒" until={3} steps={1600}
  bodies={[
    { name: "A", mass: 0.1, along: 0, x: 0, v: "vA0", forces: [
      { label: "FA", angle: 180, magnitude: "0.5*Iloop" },
    ] },
    { name: "B", mass: "m2b", along: 0, x: 0.8, v: 0, forces: [
      { label: "FB", angle: 0, magnitude: "0.5*Iloop" },
    ] },
  ]}
  state={{ Q: 0 }}
  rates={{ Q: "Iloop^2*0.5" }}
  circuit={{
    source: { series: [
      { type: "battery", label: "棒 A", emf: "0.5*vA", r: 0.2, read: "Iloop" },
      { type: "battery", label: "棒 B", emf: "0.5*vB", r: 0.3, positive: "right" },
    ] },
    load: { type: "wire" },
  }}
  read={{ vc: "vA @ tEnd" }} />

<Sim title="两根棒在导轨上滑向共同速度" height={280} duration="pair.tEnd" time="tpair" params={["pair"]}
  hud={[{ symbol: "v_A", expr: "pair.vA(tpair)", unit: "m/s", digits: 2 }, { symbol: "v_B", expr: "pair.vB(tpair)", unit: "m/s", digits: 2 }]}>
sim({
  at(t, p) {
    return p.pair.state(t)
  },
  draw(ctx, s, v) {
    const mid = (s.xA + s.xB) / 2
    const m = v.view({ xmin: mid - 1.35, xmax: mid + 1.35, ymin: -0.42, ymax: 0.95, equal: true })
    v.field(m, mid - 1.25, -0.02, mid + 1.25, 0.52, { dir: 'in', step: 26 })
    v.line(m, mid - 1.25, 0, mid + 1.25, 0, { color: v.color.steel })
    v.line(m, mid - 1.25, 0.5, mid + 1.25, 0.5, { color: v.color.steel })
    v.bar(m, s.xA, 0, s.xA, 0.5, { label: 'A' })
    v.bar(m, s.xB, 0, s.xB, 0.5, { label: 'B' })
    v.vec(m, s.xA, 0.68, -s.Iloop * 0.22, 0, { kind: 'force', label: 'FA', min: 0.04 })
    v.vec(m, s.xB, 0.68, s.Iloop * 0.22, 0, { kind: 'force', label: 'FB', min: 0.04 })
    if (Math.abs(s.Iloop) > 0.02) {
      const dir = s.Iloop > 0 ? 1 : -1
      v.arrow(m, s.xA + 0.08, 0.25 - dir * 0.1, s.xA + 0.08, 0.25 + dir * 0.1, { color: v.color.charge })
      v.arrow(m, s.xB + 0.08, 0.25 + dir * 0.1, s.xB + 0.08, 0.25 - dir * 0.1, { color: v.color.charge })
    }
  },
})
</Sim>

<Circuit title="双棒等效电路" motion="pair" at="tpair" />

<Plot title="两棒的速度趋向同一个值" x={{ name: "t", label: "t", unit: "s", min: 0, max: "pair.tEnd" }} y={{ label: "v", unit: "m/s" }}
  series={[{ label: "棒 A", expr: "pair.vA(t)", color: "velocity" }, { label: "棒 B", expr: "pair.vB(t)", color: "steel" }]}
  cursor="tpair" />

<Readout items={[
  { label: "总动量", expr: "0.1*pair.vA(tpair) + m2b*pair.vB(tpair)", unit: "kg·m/s", digits: 4 },
  { label: "共同速度", expr: "vc", unit: "m/s", digits: 4 },
  { label: "产生的焦耳热", expr: "pair.Q(pair.tEnd)", unit: "J", digits: 4 },
]} />

总动量一直等于 m₁v₀。共同速度是 m₁v₀/(m₁ + m₂)。损失的动能全部变成回路里的焦耳热。

## 十八、示波管：偏转电场与荧光屏

质量 m = 1 kg、电荷 q = +1 C 的粒子（演示用的数值）以速度 v₀ 沿 +x 进入一对长 L = 1 m、间距 d = 0.8 m 的极板，两极间电压为 U，电场向下。出电场后匀速打到距离极板出口 D = 2 m 的荧光屏上。偏移、偏转角和屏上落点都由运动积分给出，不把公式写进画面。

<Param name="Up" label="偏转电压" unit="V" min={0} max={4} step={0.5} value={2} />
<Param name="vTube" label="入射速度" unit="m/s" min={1.5} max={4} step={0.5} value={2} />
<Param name="tTube" label="时刻" min={0} max={4} value={0} hidden />

<Define name="gap" expr="0.8" />
<Define name="lenP" expr="1" />
<Define name="Dscr" expr="2" />

<Motion name="tube" label="示波管里的粒子" until={4} mass={1} charge={1}
  state={{ x: 0, y: 0, vx: "vTube", vy: 0 }}
  fields={[{
    label: "偏转电场",
    E: "Up/gap",
    angle: -90,
    region: { xmin: 0, xmax: "lenP", ymin: "-gap/2", ymax: "gap/2" },
    exit: "tOutP",
  }]}
  events={[
    { when: "x < lenP ? (y + gap/2)*(gap/2 - y) : 1", dir: "down", stop: true },
    { when: "x - (lenP + Dscr)", dir: "up", stop: true },
  ]}
  read={{ yLeave: "y @ tOutP", tanOut: "vy/vx @ tOutP", Yscr: "y @ tEnd" }} />

<Status cases={[
  { when: "tube.x(tube.tEnd) < lenP - 1e-3", label: "电压过大，粒子打到极板，到不了荧光屏", tone: "warning" },
  { label: "粒子穿过偏转电场，打在荧光屏上", tone: "neutral" },
]} />

<Sim title="示波管：偏转电场与荧光屏" height={340} duration="tube.tEnd" time="tTube" params={["tube", "Dscr"]}
  hud={[{ symbol: "y", expr: "tube.y(tTube)", unit: "m", digits: 3 }]}
  marks={[{ t: "tOutP", label: "出电场" }]}>
sim({
  at(t, p) {
    return p.tube.state(t)
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -0.5, xmax: 3.6, ymin: -2.35, ymax: 0.95, equal: true })
    const reg = v.p.tube.fields[0].region
    v.regions(m, v.p.tube)
    v.plates(m, reg.xmin, reg.xmax, reg.ymax, reg.ymin)
    const xs = reg.xmax + v.p.Dscr
    v.line(m, -0.2, 0, xs, 0, { color: v.color.steel, dash: [4, 4] })
    v.line(m, xs, -2.1, xs, 0.7, { color: v.color.ink, width: 3 })
    v.label(m, xs, 0.82, '荧光屏', { place: 'above' })
    v.trail(m, (st) => [st.x, st.y], { kind: 'velocity' })
    v.ball(m, s.x, s.y, 0.055, { charge: true })
    if (s.x >= xs - 0.03) v.circle(m, xs, s.y, 0.07, { fill: v.color.charge })
  },
})
</Sim>

<Plot title="纵向偏移随时间" x={{ name: "t", label: "t", unit: "s", min: 0, max: "tube.tEnd" }} y={{ label: "y", unit: "m" }}
  series={[{ label: "y", expr: "tube.y(t)", color: "velocity" }]}
  marks={[{ x: "tOutP", series: 0, label: "出电场" }]}
  cursor="tTube" />

<Readout items={[
  { label: "出电场时的偏移", symbol: "y", expr: "yLeave", unit: "m", digits: 4 },
  { label: "偏转角正切", symbol: "tanθ", expr: "tanOut", digits: 4 },
  { label: "屏上偏移", symbol: "Y", expr: "Yscr", unit: "m", digits: 4 },
]} />

穿过电场时，出电场的偏移是 qUL²/(2mdv₀²)，偏转角满足 tanθ = qUL/(mdv₀²)，屏上偏移是 (L/2 + D)·tanθ。电压加大到粒子在极板内就碰到板面时，积分停在板上，到不了屏。

## 十九、圆形磁场：对准圆心射入

质量 m = 1 kg、电荷 q = +1 C 的粒子从 x = −2 m 沿 +x 射出，对准圆心（半径 R = 1 m）进入垂直纸面向外的匀强磁场 B。在磁场里做顺时针圆弧，离开时速度沿着半径向外。偏转角、飞行时间和出射方向都由积分给出。

<Param name="vIon" label="入射速度" unit="m/s" min={1} max={3} step={0.5} value={2} />
<Param name="Bion" label="磁感应强度" unit="T" min={0.5} max={2} step={0.5} value={1} />
<Param name="tIon" label="时刻" min={0} max={4} value={0} hidden />

<Motion name="ion" label="圆形磁场" until={4} mass={1} charge={1}
  state={{ x: -2, y: 0, vx: "vIon", vy: 0 }}
  fields={[{
    label: "圆形磁场",
    B: "Bion",
    dir: "out",
    region: { cx: 0, cy: 0, r: 1 },
    enter: "tInB",
    exit: "tOutB",
  }]}
  events={[{ name: "tFarB", when: "x^2 + y^2 - 4.4", dir: "up", stop: true }]}
  read={{
    vxIn: "vx @ tInB", vyIn: "vy @ tInB",
    vxOut: "vx @ tOutB", vyOut: "vy @ tOutB",
    xOut: "x @ tOutB", yOut: "y @ tOutB",
    rOrb: "(vx^2 + vy^2)/sqrt(accx^2 + accy^2) @ (tInB + tOutB)/2",
  }} />

<Define name="thB" expr="atan2(vxIn*vyOut - vyIn*vxOut, vxIn*vxOut + vyIn*vyOut)" />

<Sim title="圆形磁场：对准圆心射入" height={380} duration="ion.tEnd" time="tIon" params={["ion", "tInB", "tOutB"]}
  hud={[{ symbol: "θ", expr: "abs(thB)*180/pi", unit: "°", digits: 1 }]}>
sim({
  at(t, p) {
    return p.ion.state(t)
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -2.7, xmax: 2.5, ymin: -2.3, ymax: 1.5, equal: true })
    v.regions(m, v.p.ion)
    v.trail(m, (st) => [st.x, st.y], { kind: 'velocity' })
    const ion = v.p.ion
    const tin = v.p.tInB
    const tout = v.p.tOutB
    const arrow = (t, name, gap) => {
      const vx = ion.vx(t)
      const vy = ion.vy(t)
      const s = Math.hypot(vx, vy) || 1
      const ux = vx / s
      const uy = vy / s
      v.vec(m, ion.x(t) + ux * gap, ion.y(t) + uy * gap, ux * 0.55, uy * 0.55, { kind: 'velocity', label: name, place: name === 'v入' ? 'above' : undefined })
    }
    arrow(tin, 'v入', -0.85)
    if (v.t + 1e-9 >= tout) {
      v.line(m, 0, 0, ion.x(tout), ion.y(tout), { color: v.color.steel, dash: [4, 3] })
      arrow(tout, 'v出', 0.14)
    }
    v.ball(m, s.x, s.y, 0.06, { charge: true })
  },
})
</Sim>

<Plot title="磁场中的轨迹" x={{ name: "t", label: "t", unit: "s", min: 0, max: "ion.tEnd" }} y={{ label: "y", unit: "m" }}
  series={[{ label: "y", expr: "ion.y(t)", color: "velocity" }]}
  marks={[{ x: "tInB", series: 0, label: "进入" }, { x: "tOutB", series: 0, label: "离开" }]}
  cursor="tIon" />

<Readout items={[
  { label: "偏转角", symbol: "θ", expr: "abs(thB)*180/pi", unit: "°", digits: 2 },
  { label: "在磁场中的时间", symbol: "Δt", expr: "tOutB - tInB", unit: "s", digits: 4 },
  { label: "轨道半径", symbol: "r", expr: "rOrb", unit: "m", digits: 4 },
  { label: "出射点 x", expr: "xOut", unit: "m", digits: 4 },
  { label: "出射点 y", expr: "yOut", unit: "m", digits: 4 },
  { label: "出射速度 vx", expr: "vxOut", digits: 4 },
  { label: "出射速度 vy", expr: "vyOut", digits: 4 },
]} />

轨道半径 r = mv/(qB)。对准圆心射入时 tan(θ/2) = R/r，在磁场中的时间是 θm/(qB)。出射速度与出射点的位矢平行（离开时沿着半径）。

## 二十、气缸：下挡板、上挡板

竖直气缸，截面积 S = 0.01 m²，下端封闭、上端开口，大气压 p₀ = 1×10⁵ Pa，g = 10 m/s²。气柱 A 起初长 0.2 m、压强 1×10⁵ Pa、温度 300 K。质量 10 kg、厚 0.02 m 的活塞压在气柱上，被挡板限制在 0.2 m 到 0.3 m 之间。加热时活塞先贴着下挡板（等容），离开后等压上移，顶到上挡板后再等容。压强、长度、做功和吸热都由气柱组件算出。

<Param name="Tk" label="气体温度" unit="K" min={300} max={600} step={5} value={300} />

<GasTube
  name="cyl"
  title="带挡板的气缸"
  units="SI"
  p0={1e5}
  g={10}
  S={0.01}
  path={[{length: 0.5, angle: 90}]}
  start="closed"
  end="open"
  contents={[
    {gas: "A", L: 0.2, p: 1e5, T: 300, Tnow: "Tgas", cv: 2.5},
    {piston: "P", m: 10, thick: 0.02, stops: {min: 0.2, max: 0.3}, leave: "Tleave", hit: "Thit"}
  ]}
  drive={{name: "Tgas", from: 300, to: 600}}
  at="Tk"
/>

<Plot
  title="气体的 p–V 图"
  x={{label: "V", unit: "m³", min: 0.0018, max: 0.0032}}
  y={{label: "p", unit: "Pa", min: 90000, max: 145000}}
  series={[{label: "p–V", x: "cyl.VA(u)", expr: "cyl.pA(u)", over: {name: "u", min: 300, max: 600}, point: "Tk"}]}
/>

<Readout items={[
  {label: "离开下挡板", symbol: "T_离", expr: "Tleave", unit: "K", digits: 1},
  {label: "碰上上挡板", symbol: "T_到", expr: "Thit", unit: "K", digits: 1},
  {label: "气体压强", symbol: "p_A", expr: "cyl.pA(Tk)", unit: "Pa", digits: 0},
  {label: "气柱长度", symbol: "L_A", expr: "cyl.LA(Tk)", unit: "m", digits: 4},
  {label: "气体做功", symbol: "W", expr: "cyl.WA(Tk)", unit: "J", digits: 2},
  {label: "内能变化", symbol: "ΔU", expr: "cyl.UA(Tk)", unit: "J", digits: 1},
  {label: "吸收热量", symbol: "Q", expr: "cyl.QA(Tk)", unit: "J", digits: 1}
]} />

下挡板处 p 与 T 成正比，做功为零；两挡板之间压强保持 1.1×10⁵ Pa；顶到上挡板之后体积不再变。全过程气体对外做功 110 J，内能增加 500 J，吸热 610 J。

## 二十一、U 形管：再灌一段水银

左端封闭的 U 形管，左臂 40 cm、底部水平 10 cm、右臂 55 cm。封闭气柱起初长 20 cm，与 50 cm 水银柱平衡，开口处大气压 75 cmHg。再灌入水银（滑块是多灌的长度），气柱被压缩，两侧液面出现高度差。压强和长度由气柱组件算出，不手写 pV = C。

<Param name="dHg" label="再灌入的水银" unit="cm" min={0} max={25} step={1} value={0} />

<GasTube
  name="ut"
  title="U 形管灌水银"
  units="cmHg"
  p0={75}
  path={[
    {length: 40, angle: -90},
    {length: 10, angle: 0},
    {length: 55, angle: 90}
  ]}
  start="closed"
  end="open"
  contents={[
    {gas: "A", L: 20},
    {liquid: "h", L: "50 + pour"}
  ]}
  drive={{name: "pour", from: 0, to: 25}}
  at="dHg"
/>

<Plot
  title="封闭气体的 p–V"
  x={{label: "V", unit: "cm", min: 14, max: 22}}
  y={{label: "p", unit: "cmHg", min: 70, max: 100}}
  series={[{label: "p–V", x: "ut.VA(u)", expr: "ut.pA(u)", over: {name: "u", min: 0, max: 25}, point: "dHg"}]}
/>

<Readout items={[
  {label: "气体压强", symbol: "p_A", expr: "ut.pA(dHg)", unit: "cmHg", digits: 3},
  {label: "气柱长度", symbol: "L_A", expr: "ut.LA(dHg)", unit: "cm", digits: 3},
  {label: "液面高度差", symbol: "Δh", expr: "ut.dzh(dHg)", unit: "cm", digits: 3}
]} />

等温变化中 p 与气柱长度的乘积保持 1500 cmHg·cm。开口一侧的液面更高，高度差等于气体压强与大气压之差。
