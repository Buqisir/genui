---
id: _demo-segment-sd25-16-b
title: 活塞封闭气体的升温与降温（分段样板 B）
source: 2025 山东卷 第 16 题（计算）
topic: 理想气体与热力学第一定律
demo: true
quoteAt: visual
givens: ["轻质活塞", "f₀ = p₀S/21（等于最大静摩擦）", "T₁ = 330 K，开始上升", "T₂ = 440 K，停止加热", "T₃ = 400 K，开始下降", "T₄ = 330 K，停止"]
question: "如图所示，上端开口、下端封闭的足够长玻璃管竖直固定于调温装置内。玻璃管导热性能良好，管内横截面积为 S，用轻质活塞封闭一定质量的理想气体。大气压强为 p_0，活塞与玻璃管之间的滑动摩擦力大小恒为 f_0 = (1/21)p_0 S，等于最大静摩擦力。用调温装置对封闭气体缓慢加热，T_1 = 330 K 时，气柱高度为 h_1，活塞开始缓慢上升；继续缓慢加热至 T_2 = 440 K 时停止加热，活塞不再上升；再缓慢降低气体温度，活塞位置保持不变，直到降温至 T_3 = 400 K 时，活塞才开始缓慢下降；温度缓慢降至 T_4 = 330 K 时，保持温度不变，活塞不再下降。求：\n（1）T_2 = 440 K 时，气柱高度 h_2；\n（2）从 T_1 状态到 T_4 状态的过程中，封闭气体吸收的净热量 Q（扣除放热后净吸收的热量）。"
answers:
  - { name: h2ratio, value: 1.3333 }
  - { name: Qratio, value: 0.12698 }
---

这道题的计算不难，难在想清楚**摩擦力**在每个阶段朝哪、有多大。分三段讲：

1. 加热时，活塞为什么是**等压**上升；
2. 降温时，活塞为什么**先不动**，到 400 K 才下滑（全题最关键）；
3. 净热量为什么只要看 **p–V 图上两块面积的差**。

下面力的大小都用 $f_0$ 作单位：$p_0S = 21f_0$。图上只画方向和大小关系，具体数值看图下的读数。

<Segment title="加热：等压上升" quote="用轻质活塞封闭一定质量的理想气体……活塞与玻璃管之间的滑动摩擦力大小恒为 **f_0 = (1/21)p_0 S，等于最大静摩擦力**。用调温装置对封闭气体缓慢加热，**T_1 = 330 K 时，气柱高度为 h_1，活塞开始缓慢上升**；继续缓慢加热至 **T_2 = 440 K** 时停止加热。（1）求 T_2 = 440 K 时，气柱高度 h_2。" hint="拖动「加热温度」，从 330 K 拖到 440 K。" watch="活塞上的三个力一直不变，摩擦力始终向下、等于 f₀；变的只有气柱的高度。" />

活塞是轻的，只受三个力：大气压力 $p_0S$ 向下，气体压力 $pS$ 向上，管壁摩擦力 $f$。

$T_1 = 330\ \mathrm{K}$ 时活塞**刚要**上升，摩擦力达到最大、方向向下（阻碍上升）：

$$
p_1S = p_0S + f_0 \quad\Rightarrow\quad p_1 = \frac{22}{21}p_0
$$

之后活塞缓慢上升，摩擦力一直是向下的 $f_0$，三个力都不变，所以压强保持 $p_1$，这是**等压膨胀**：

$$
\frac{h_1}{T_1} = \frac{h_2}{T_2} \quad\Rightarrow\quad h_2 = \frac{440}{330}h_1 = \boxed{\frac{4}{3}h_1}
$$

<Param name="Ta" label="加热温度" symbol="T" value={330} min={330} max={440} step={1} unit="K" />

<Define name="ha" expr="Ta/330" />

<Readout items={[
  {label: "气柱高度", symbol: "h/h₁", expr: "ha", digits: 3},
  {label: "大气压力", symbol: "p₀S/f₀", expr: "21", digits: 0},
  {label: "气体压力", symbol: "pS/f₀", expr: "22", digits: 0, color: "force"},
  {label: "摩擦力（向下）", symbol: "f/f₀", expr: "1", digits: 0, color: "force"}
]} />

<Figure title="加热时活塞的受力" height={340} params={["ha"]} note="压力箭头不按比例；摩擦力箭头按 f₀ 的倍数画">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.8, xmax: 1.0, ymin: -0.15, ymax: 2.35, equal: true })
    const k = 0.9
    const h = k * p.ha
    v.vessel(m, [{ x1: -0.3, y1: 0, x2: 0.3, y2: 2.05, open: 'top' }], {
      fills: [{ x1: -0.3, y1: 0, x2: 0.3, y2: h, kind: 'gas', count: 26 }],
    })
    v.block(m, 0, h, 0.58, 0.1, { mat: 'dark' })
    v.vec(m, 0, h + 0.68, 0, -0.56, { kind: 'force', label: 'p₀S' })
    v.vec(m, 0, h - 0.6, 0, 0.58, { kind: 'force', label: 'pS' })
    v.vec(m, 0.42, h + 0.05, 0, -0.3, { kind: 'force', label: 'f' })
    v.dim(m, -0.55, 0, -0.55, h, 'h')
  },
})
</Figure>

<Segment title="降温：为什么先不动" quote="再缓慢降低气体温度，**活塞位置保持不变，直到降温至 T_3 = 400 K 时，活塞才开始缓慢下降**；温度缓慢降至 **T_4 = 330 K** 时，保持温度不变，活塞不再下降。" hint="拖动「降温温度」，从 440 K 慢慢往下拖到 330 K。" watch="摩擦力箭头先向下、变短，到 420 K 变成零，再翻成向上并变长；到 400 K 达到 f₀，活塞才开始下滑。右边数轴上，压强一直在「卡住区间」里，碰到下沿才离开。" />

停止加热、开始降温。活塞先不动，体积不变，压强随温度下降：$p = p_1\dfrac{T}{440\ \mathrm{K}}$。

活塞不动时，摩擦力是**静摩擦力**，它的大小和方向会自己调整，只要不超过 $f_0$ 就能把活塞托住：

- 440 K 到 420 K：$pS > p_0S$，静摩擦力向下，越来越小；
- **420 K**：$pS = p_0S$，静摩擦力为零；
- 420 K 到 400 K：$pS < p_0S$，静摩擦力**反过来向上**，越来越大；
- **400 K**：静摩擦力达到最大值 $f_0$，再降温就托不住了。

所以压强只要在 $\left[\dfrac{20}{21}p_0, \dfrac{22}{21}p_0\right]$ 这个区间里，活塞就卡住不动。活塞刚要下滑时

$$
p_3S + f_0 = p_0S \quad\Rightarrow\quad p_3 = \frac{20}{21}p_0
$$

（核对：$p_1 \cdot \dfrac{400}{440} = \dfrac{22}{21}\cdot\dfrac{10}{11}p_0 = \dfrac{20}{21}p_0$，正好对上题给的 $T_3 = 400\ \mathrm{K}$。）

之后活塞缓慢下滑，摩擦力一直向上、等于 $f_0$，压强保持 $p_3$，这是**等压压缩**：

$$
h_4 = \frac{T_4}{T_3}h_2 = \frac{330}{400}\cdot\frac{4}{3}h_1 = \frac{11}{10}h_1
$$

<Param name="Tb" label="降温温度" symbol="T" value={440} min={330} max={440} step={1} unit="K" />

<Define name="pb" expr="Tb >= 400 ? (22/21)*Tb/440 : 20/21" />

<Define name="hb" expr="Tb >= 400 ? 4/3 : (4/3)*Tb/400" />

<Define name="fb" expr="21*(pb - 1)" />

<Status cases={[
  {when: "Tb > 420.5", label: "卡住：静摩擦力向下", tone: "neutral"},
  {when: "Tb >= 419.5", label: "卡住：静摩擦力为零", tone: "info"},
  {when: "Tb > 400.5", label: "卡住：静摩擦力向上", tone: "neutral"},
  {when: "Tb >= 399.5", label: "刚要下滑：静摩擦力达到最大值", tone: "warning"},
  {label: "缓慢下滑：滑动摩擦力向上", tone: "success"}
]} />

<Readout items={[
  {label: "气体压力", symbol: "pS/f₀", expr: "21*pb", digits: 2, color: "force"},
  {label: "摩擦力（向下为正）", symbol: "f/f₀", expr: "fb", digits: 2, color: "force"}
]} />

<Figure title="降温时活塞的受力与「卡住区间」" height={360} params={["pb", "hb", "fb"]} note="压力箭头不按比例；摩擦力箭头按 f₀ 的倍数画">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.75, xmax: 2.0, ymin: -0.25, ymax: 2.35, equal: true })
    const k = 0.9
    const h = k * p.hb
    v.vessel(m, [{ x1: -0.3, y1: 0, x2: 0.3, y2: 2.05, open: 'top' }], {
      fills: [{ x1: -0.3, y1: 0, x2: 0.3, y2: h, kind: 'gas', count: 26, density: p.pb }],
    })
    v.block(m, 0, h, 0.58, 0.1, { mat: 'dark' })
    v.vec(m, 0, h + 0.68, 0, -0.56, { kind: 'force', label: 'p₀S' })
    v.vec(m, 0, h - 0.6, 0, 0.56 * p.pb, { kind: 'force', label: 'pS' })
    if (Math.abs(p.fb) > 0.03) {
      v.vec(m, 0.42, h + 0.05, 0, -0.3 * p.fb, { kind: 'force', label: 'f' })
    } else {
      v.label(m, 0.45, h + 0.05, 'f = 0', { place: 'right' })
    }
    // 右边：压强数轴，阴影是活塞能被静摩擦力卡住的范围
    const X = 1.3
    const y = (q) => 0.35 + (q - 0.92) / 0.16 * 1.5
    v.line(m, X, y(0.92), X, y(1.08), { color: v.color.graphite, width: 1.2 })
    v.rect(m, X - 0.12, y(20 / 21), 0.24, y(22 / 21) - y(20 / 21), { fill: v.color.hairline, color: v.color.charge, width: 1.4 })
    for (const [q, t] of [[20 / 21, '20/21'], [1, '1'], [22 / 21, '22/21']]) {
      v.line(m, X - 0.06, y(q), X + 0.06, y(q), { color: v.color.graphite, width: 1.2 })
      v.text(m, X + 0.32, y(q), t)
    }
    v.text(m, X, y(1.08) + 0.12, 'p/p₀')
    v.text(m, X, y(0.92) - 0.18, '卡住区间')
    v.circle(m, X, y(p.pb), 0.05, { fill: v.color.force, color: v.color.force })
  },
})
</Figure>

<Segment title="净热量：看两块面积" quote="（2）从 **T_1 状态到 T_4 状态**的过程中，封闭气体吸收的**净热量 Q**（扣除放热后净吸收的热量）。" hint="拖动「过程进度」，把加热、等容降温、等压压缩三段走一遍。" watch="红色虚线下的面积是加热时气体对外做的功，蓝色虚线下的面积是压缩时外界对气体做的功；两块之差就是净吸热。" />

$T_4 = T_1 = 330\ \mathrm{K}$，理想气体初、末内能相同，$\Delta U = 0$。由 $\Delta U = W + Q$，净吸热等于气体对外做的净功，也就是 p–V 图上两块面积之差：

- 加热（等压膨胀）：气体对外做功 $p_1S(h_2 - h_1) = \dfrac{22}{21}\cdot\dfrac{1}{3}\,p_0Sh_1 = \dfrac{22}{63}p_0Sh_1$；
- 等容降温：体积不变，不做功；
- 等压压缩：外界对气体做功 $p_3S(h_2 - h_4) = \dfrac{20}{21}\cdot\dfrac{7}{30}\,p_0Sh_1 = \dfrac{14}{63}p_0Sh_1$。

$$
Q = \frac{22}{63}p_0Sh_1 - \frac{14}{63}p_0Sh_1 = \boxed{\frac{8}{63}p_0Sh_1}
$$

<Param name="u" label="过程进度" value={0} min={0} max={3} step={0.01} />

<Define name="Qratio" expr="22/63 - 14/63" />

<Readout items={[
  {label: "气体对外做功", symbol: "W₁", expr: "22/63", unit: "p₀Sh₁", digits: 3, color: "force"},
  {label: "外界对气体做功", symbol: "W₃", expr: "14/63", unit: "p₀Sh₁", digits: 3, color: "velocity"},
  {label: "净吸热", symbol: "Q", expr: "Qratio", unit: "p₀Sh₁", digits: 3, color: "charge"}
]} />

<Plot title="p–V 图" caption="横轴是体积除以 Sh₁，纵轴是压强除以 p₀" size="full"
  x={{name: "x", label: "V/(Sh₁)", min: 0.95, max: 1.4}}
  y={{label: "p/p₀", min: 0.9, max: 1.08}}
  series={[
    {label: "过程", x: "w < 1 ? 1 + w/3 : (w < 2 ? 4/3 : 4/3 - (w - 2)*(4/3 - 1.1))", expr: "w < 1 ? 22/21 : (w < 2 ? 22/21 - (w - 1)*2/21 : 20/21)", over: {name: "w", min: 0, max: 3}, point: "u", color: "graphite"},
    {label: "加热时的压强", expr: "x >= 1 and x <= 4/3 ? 22/21 : NaN", color: "force", dash: true},
    {label: "压缩时的压强", expr: "x >= 1.1 and x <= 4/3 ? 20/21 : NaN", color: "velocity", dash: true}
  ]}
  areas={[
    {series: 1, from: 1, until: 1.3333},
    {series: 2, from: 1.1, until: 1.3333}
  ]}
/>

<Segment title="完整解答" />

**（1）** 活塞刚要上升时 $p_1S = p_0S + f_0$，$p_1 = \dfrac{22}{21}p_0$；上升时摩擦力不变，等压膨胀：$h_2 = \dfrac{T_2}{T_1}h_1 = \dfrac{4}{3}h_1$。

**（2）** 等压膨胀，外界对气体做功 $W_1 = -p_1S(h_2 - h_1) = -\dfrac{22}{63}p_0Sh_1$。降温先等容，$W_2 = 0$；活塞刚要下降时 $p_3S + f_0 = p_0S$，$p_3 = \dfrac{20}{21}p_0$。再等压压缩，$h_4 = \dfrac{T_4}{T_3}h_2 = \dfrac{11}{10}h_1$，$W_3 = p_3S(h_2 - h_4) = \dfrac{14}{63}p_0Sh_1$。全程 $W = -\dfrac{8}{63}p_0Sh_1$，$T_4 = T_1$，$\Delta U = 0$，所以

$$
Q = -W = \frac{8}{63}p_0Sh_1
$$

<Define name="h2ratio" expr="440/330" />

<Answer open={true} items={[
  {label: "(1) h₂", symbol: "h₂/h₁", expr: "h2ratio", value: 1.3333},
  {label: "(2) 净热量", symbol: "Q/(p₀Sh₁)", expr: "Qratio", value: 0.12698}
]} />
