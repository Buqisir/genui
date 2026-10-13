---
id: gd21-11
title: 斜管中缓冲弹簧的劲度系数
source: 2021 广东卷 第 11 题（实验；必考题共 42 分，原卷未单列本题分值）
question: "某兴趣小组测量一缓冲装置中弹簧的劲度系数，缓冲装置如图所示，固定在斜面上的透明有机玻璃管与水平面夹角为 30°，弹簧固定在有机玻璃管底端。实验过程如下：先沿管轴线方向固定一毫米刻度尺，再将单个质量为 200 g 的钢球（直径略小于玻璃管内径）逐个从管口滑进，每滑进一个钢球，待弹簧静止，记录管内钢球的个数 n 和弹簧上端对应的刻度尺示数 L_0，数据如表所示。实验过程中弹簧始终处于弹性限度内。采用逐差法计算弹簧压缩量，进而计算其劲度系数。\n\n【图】斜面上固定一根透明管，管与水平面的夹角标 30°。管内底部有弹簧，弹簧上叠放若干钢球，靠近弹簧的画成实线圆，上方几个画成虚线圆。管的上沿有一把刻度尺，尺的上端（管口一侧）标 0 cm，尺旁标“刻度尺”，管旁标“有机玻璃管”。斜面下方有地面斜线。\n\n| n | 1 | 2 | 3 | 4 | 5 | 6 |\n| --- | --- | --- | --- | --- | --- | --- |\n| L_n / cm | 8.04 | 10.03 | 12.05 | 14.07 | 16.11 | 18.09 |\n\n（1）利用 ΔL_i = L_{i+3} − L_i（i = 1, 2, 3）计算弹簧的压缩量：ΔL_1 = 6.03 cm，ΔL_2 = 6.08 cm，\n\nΔL_3 = ______ cm，压缩量的平均值 ΔL（字母上方有一横）= (ΔL_1 + ΔL_2 + ΔL_3)/3 = ______ cm；\n\n（2）上述 ΔL（字母上方有一横）是管中增加 ______ 个钢球时产生的弹簧平均压缩量；\n\n（3）忽略摩擦，重力加速度 g 取 9.80 m/s^2，该弹簧的劲度系数为 ______ N/m。（结果保留 3 位有效数字）"
answers:
  - { name: dL3, value: 6.04, unit: cm }
  - { name: dL, value: 6.05, unit: cm }
  - { name: nAdd, value: 3 }
  - { name: k, value: 48.6, unit: N/m }
---

斜面上的有机玻璃管与水平面夹角 $30^\circ$，弹簧固定在管底。每滑进一个质量 $m = 200\ \mathrm{g} = 0.200\ \mathrm{kg}$ 的钢球，待弹簧静止后读出弹簧上端对应的刻度尺示数 $L_n$。刻度尺 $0$ 在管口一侧，示数越大，弹簧上端离管口越远，弹簧被压得越短。摩擦忽略，弹簧始终在弹性限度内，$g = 9.80\ \mathrm{m/s^2}$。

测得

| $n$ | 1 | 2 | 3 | 4 | 5 | 6 |
| --- | --- | --- | --- | --- | --- | --- |
| $L_n/\mathrm{cm}$ | 8.04 | 10.03 | 12.05 | 14.07 | 16.11 | 18.09 |

## 完整解答

（1）逐差取间隔 $3$ 个钢球的两次读数：

$$
\Delta L_i = L_{i+3} - L_i \quad (i = 1, 2, 3)
$$

$$
\Delta L_1 = L_4 - L_1 = 14.07 - 8.04 = 6.03\ \mathrm{cm}
$$

$$
\Delta L_2 = L_5 - L_2 = 16.11 - 10.03 = 6.08\ \mathrm{cm}
$$

$$
\Delta L_3 = L_6 - L_3 = 18.09 - 12.05 = \boxed{6.04\ \mathrm{cm}}
$$

三次压缩量取平均：

$$
\overline{\Delta L} = \frac{\Delta L_1 + \Delta L_2 + \Delta L_3}{3} = \frac{6.03 + 6.08 + 6.04}{3} = \boxed{6.05\ \mathrm{cm}}
$$

逐差把前三组和后三组都用上，每一次读数只出现一次，比只用相邻两点的差值更能抵消偶然误差。

（2）$L_{i+3}$ 比 $L_i$ 多了 $3$ 个钢球，所以 $\overline{\Delta L}$ 是管中增加 $\boxed{3}$ 个钢球时弹簧的平均压缩量，不是增加 $1$ 个。

（3）每个钢球重力沿管向下的分力为 $mg\sin 30^\circ$。增加 $3$ 个钢球后，弹簧多承受的压力为

$$
\Delta F = 3mg\sin 30^\circ = 3 \times 0.200 \times 9.80 \times \tfrac{1}{2} = 2.94\ \mathrm{N}
$$

平均压缩量换算成米：$\overline{\Delta L} = 6.05\ \mathrm{cm} = 0.0605\ \mathrm{m}$。由胡克定律

$$
k = \frac{\Delta F}{\overline{\Delta L}} = \frac{2.94}{0.0605} = 48.595\ldots\ \mathrm{N/m}
$$

保留 $3$ 位有效数字：

$$
k = \boxed{48.6\ \mathrm{N/m}}
$$

弹簧自重和管底对弹簧的支持力不随钢球个数改变，逐差时相减掉，不必单独测原长。

## 交互演示

拖动钢球个数，看弹簧上端在刻度尺上的位置。初始取题目的 $n = 6$：表中读数 $18.09\ \mathrm{cm}$。弹簧原长未测，图中取 $22.1\ \mathrm{cm}$ 使读数与表中各点的平均劲度系数一致，并在图下注明。管长、球径不按比例。

<Param name="n" label="钢球个数" symbol="n" value={6} min={1} max={6} step={1} control="stepper" />

<Param name="m" label="每个钢球质量" value={0.2} unit="kg" hidden />

<Param name="g" label="重力加速度" value={9.8} unit="m/s^2" hidden />

<Param name="theta" label="管与水平面夹角" symbol="θ" value={30} unit="°" hidden />

<Param name="L0" label="弹簧原长" value={22.1} unit="cm" hidden />

<Define name="Ln" expr="n == 1 ? 8.04 : n == 2 ? 10.03 : n == 3 ? 12.05 : n == 4 ? 14.07 : n == 5 ? 16.11 : 18.09" />

<Define name="dL1" expr="14.07 - 8.04" />

<Define name="dL2" expr="16.11 - 10.03" />

<Define name="dL3" expr="18.09 - 12.05" />

<Define name="dL" expr="(dL1 + dL2 + dL3) / 3" />

<Define name="nAdd" expr="3" />

<Define name="dF" expr="nAdd * m * g * sin(deg(theta))" />

<Define name="k" expr="dF / (dL / 100)" />

<Define name="xNow" expr="L0 - Ln" />

<Preset label="逐差组：n = 6" set={{n: 6}} />

<Preset label="逐差组：n = 3" set={{n: 3}} />

<Figure title="斜管中的缓冲弹簧" height={340} params={["n", "Ln", "L0", "theta", "xNow"]} note="管长、球径不按比例；弹簧原长取 22.1 cm，使读数与表中各点的平均劲度系数一致" hud={[{symbol: "L", label: "弹簧上端读数", expr: "Ln", unit: "cm", digits: 2}]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -8, xmax: 40, ymin: -6, ymax: 22, equal: true })
    const th = (p.theta * Math.PI) / 180
    const c = Math.cos(th)
    const s = Math.sin(th)
    const X = (u, w) => u * c - w * s
    const Y = (u, w) => u * s + w * c
    const run = 36 * c
    const rise = 36 * s
    v.incline(m, 0, 0, run, rise, { angleLabel: '30°' })
    v.ground(m, -6, run + 4, 0)
    const half = 1.15
    const wall = 0.28
    const mouth = 34
    const uBot = 1.6
    v.bar(m, X(uBot, half), Y(uBot, half), X(mouth, half), Y(mouth, half), { thick: 5 })
    v.bar(m, X(uBot, -half), Y(uBot, -half), X(mouth, -half), Y(mouth, -half), { thick: 5 })
    v.bar(m, X(uBot, -half), Y(uBot, -half), X(uBot, half), Y(uBot, half), { thick: 6 })
    const uTop = uBot + p.Ln * 0.85
    v.spring(m, X(uBot, 0), Y(uBot, 0), X(uTop, 0), Y(uTop, 0), { coils: 11 })
    const r = 0.72
    const uFirst = uTop + r + 0.08
    for (let i = 0; i < p.n; i++) {
      const uc = uFirst + i * 2 * r
      v.ball(m, X(uc, 0), Y(uc, 0), r, i === p.n - 1 ? { label: 'n' } : {})
    }
    const uR0 = mouth + 0.9
    const wR = half + 1.35
    const tick = (uCm, major) => {
      const u = mouth - uCm * 0.85
      const a = major ? 0.55 : 0.28
      v.line(m, X(u, wR), Y(u, wR), X(u, wR + a), Y(u, wR + a), { color: v.color.graphite, width: major ? 1.3 : 1 })
    }
    for (let cm = 0; cm <= 20; cm++) tick(cm, cm % 5 === 0)
    v.line(m, X(mouth, wR), Y(mouth, wR), X(mouth - 20 * 0.85, wR), Y(mouth - 20 * 0.85, wR), { color: v.color.graphite, width: 1.2 })
    v.label(m, X(mouth, wR + 1.7), Y(mouth, wR + 1.7), '0')
    v.label(m, X(mouth - 10 * 0.85, wR + 1.7), Y(mouth - 10 * 0.85, wR + 1.7), '10')
    v.label(m, X(mouth - 20 * 0.85, wR + 1.7), Y(mouth - 20 * 0.85, wR + 1.7), '20')
    v.label(m, X(mouth - 10 * 0.85, wR + 3.1), Y(mouth - 10 * 0.85, wR + 3.1), '刻度尺 / cm')
    const uRead = mouth - p.Ln * 0.85
    v.line(m, X(uRead, 0), Y(uRead, 0), X(uRead, wR), Y(uRead, wR), { color: v.color.velocity, width: 1.2, dash: true })
    v.label(m, X(uRead, -1.5), Y(uRead, -1.5), 'L')
    v.label(m, X((uBot + mouth) / 2, -half - 1.6), Y((uBot + mouth) / 2, -half - 1.6), '有机玻璃管')
    v.dim(m, X(uBot, 0), Y(uBot, 0), X(uTop, 0), Y(uTop, 0), 'x', { offset: -16 })
  },
})
</Figure>

右侧是最上面那个钢球的受力。弹簧弹力沿管向上传给这一堆钢球，大小等于全部钢球重力沿管向下的分力；管壁的支持力垂直于管。

<ForceDiagram title="最上面的钢球" size="wide" surface={{type: "incline", angle: "theta", angleLabel: "θ"}} body={{shape: "ball", label: "m"}} forces={[{label: "G", angle: -90, magnitude: "m*g"}, {label: "N", angle: "90 + theta", solve: "N"}, {label: "F", angle: "theta", solve: "F"}]} decompose={{force: 0, axes: "incline", labels: ["mg sinθ", "mg cosθ"]}} />

六次读数画成柱。点柱子切到对应的钢球个数。实线框是 $n = 3$ 与 $n = 6$，两次读数之差就是 $\Delta L_3$。

<Bars title="弹簧上端读数" size="narrow" x={{name: "j", label: "n", min: 1, max: 6}} y={{label: "L", unit: "cm", min: 0, max: 22}} expr="j == 1 ? 8.04 : j == 2 ? 10.03 : j == 3 ? 12.05 : j == 4 ? 14.07 : j == 5 ? 16.11 : 18.09" cursor="n" marks={[{x: 3, label: "L_3", style: "outline"}, {x: 6, label: "L_6", style: "solid"}]} color="velocity" />

<Readout items={[{label: "第三次压缩量", symbol: "ΔL_3", expr: "dL3", unit: "cm", digits: 2, color: "velocity"}, {label: "平均压缩量", symbol: "ΔL", expr: "dL", unit: "cm", digits: 2, color: "velocity"}, {label: "逐差间隔", symbol: "Δn", expr: "nAdd", color: "ink"}, {label: "增加 3 个球的压力", symbol: "ΔF", expr: "dF", unit: "N", digits: 2, color: "force"}, {label: "劲度系数", symbol: "k", expr: "k", unit: "N/m", digits: 1, color: "force"}]} />

## 结合图像理解

读数从 $n = 1$ 的 $8.04\ \mathrm{cm}$ 增到 $n = 6$ 的 $18.09\ \mathrm{cm}$，每多一个钢球大约再压缩 $2\ \mathrm{cm}$。逐差不用相邻两点，而是把相隔 $3$ 个钢球的两次读数相减：$L_4 - L_1$、$L_5 - L_2$、$L_6 - L_3$。三次差值 $6.03\ \mathrm{cm}$、$6.08\ \mathrm{cm}$、$6.04\ \mathrm{cm}$ 很接近，平均 $6.05\ \mathrm{cm}$。

这一段压缩对应的是多出来的 $3$ 个钢球。每个钢球沿管向下的分力是 $mg\sin 30^\circ = 0.980\ \mathrm{N}$，三个一共 $2.94\ \mathrm{N}$。劲度系数就是这个力除以 $0.0605\ \mathrm{m}$。

## 答案汇总

<Answer items={[{label: "第三次压缩量", symbol: "ΔL_3", expr: "dL3", value: 6.04, unit: "cm", digits: 2}, {label: "平均压缩量", symbol: "ΔL", expr: "dL", value: 6.05, unit: "cm", digits: 2}, {label: "对应增加的钢球个数", symbol: "Δn", expr: "nAdd", value: 3}, {label: "劲度系数", symbol: "k", expr: "k", value: 48.6, unit: "N/m", digits: 1}]} />
