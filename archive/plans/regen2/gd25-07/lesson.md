---
id: gd25-07
title: 铸型室压入金属液
source: 2025 广东卷（部分试题）第 7 题（计算）
question: "铸造金属元件时，通过往进气口打气，将下方金属液体压进上方预热过的铸型室。其中铸型室与下方装金属液的气室形状都为柱体，铸型室底面积 S_1 = 0.2m^2，高 h_1 = 0.2m，铸型室底部与下方液面差初始为 H = 0.15m，上方出气口与大气连通，大气压强 p_0 = 1×10^5 Pa，下方气室的底面积 S_2 = 0.8m^2，金属液体密度 ρ = 5×10^3 kg/m^3，g = 10m/s^2。管道面积忽略不计。【图】上下两个柱形容器，中间有空隙，由一根竖直管道连通。上方较小的容器标“铸型室”，顶上正中有一根向上的短管，标“出气口”；容器右侧有竖直双箭头，标 h_1 = 0.2m，跨过铸型室的整个高度。管道从铸型室底部正中向下，穿过下方容器的顶，一直伸到下方容器下部，标“管”。下方容器更宽：上部标“气室”，左上角有一根斜向上的短管，标“进气口”；下部是金属液，液面画成波浪线，管道下端伸进液面以下，底部标“金属液”。铸型室底部到液面之间有竖直双箭头，标 H = 0.15m。(1)当铸型室刚好充满金属液时，求下方液面下降高度 h_2 与下方气室内气体压强 p_1。(2)将出气口关闭铸型，当上方铸型室液面高为 h_3 = 0.04m 时，求下方气室内气体压强 p_2。"
answers:
  - { name: h2, value: 0.05, unit: m }
  - { name: p1, value: 120000, unit: Pa }
  - { name: h4, value: 0.01, unit: m }
  - { name: pPrime, value: 125000, unit: Pa }
  - { name: p2, value: 135000, unit: Pa }
---

铸型室和下方气室都是柱体，中间一根竖直管伸到下方液面以下，管的截面积忽略不计。金属液不可压缩，从下方压进上方的体积就是下方液面下降让出的体积。出气口开着时铸型室里的气体与大气相通；关闭后，铸型室顶部被封住的气体温度不变，体积变小，压强变大。下方气室是打气端，压强由上端压强再加上液柱压强。

## 完整解答

**(1)** 铸型室刚好充满时，上方液体积为 $S_1 h_1$，下方液面下降 $h_2$。管道体积不计，体积相等

$$
S_1 h_1 = S_2 h_2
$$

$$
\boxed{h_2 = \dfrac{S_1 h_1}{S_2} = \dfrac{0.2 \times 0.2}{0.8}\,\mathrm{m} = 0.05\,\mathrm{m}}
$$

此时出气口仍与大气连通，铸型室里液面上方压强为 $p_0$。从上方液面算到下方液面，液柱高度是铸型室全高 $h_1$，加上铸型室底部到初始液面的 $H$，再加上液面下降的 $h_2$。下方气室压强

$$
p_1 = p_0 + \rho g(h_1 + H + h_2)
$$

$$
\boxed{p_1 = 1\times 10^5\,\mathrm{Pa} + 5\times 10^3 \times 10 \times (0.2 + 0.15 + 0.05)\,\mathrm{Pa} = 1.2\times 10^5\,\mathrm{Pa}}
$$

**(2)** 先关闭出气口再铸型。闭口时铸型室里被封住的是压强为 $p_0$、高度为 $h_1$ 的气柱。液面升到 $h_3$ 时，气柱高度只剩 $h_1 - h_3$，温度不变，由玻意耳定律

$$
p_0\, S_1 h_1 = p'\, S_1(h_1 - h_3)
$$

$$
\boxed{p' = p_0\,\dfrac{h_1}{h_1 - h_3} = 1\times 10^5 \times \dfrac{0.2}{0.16}\,\mathrm{Pa} = 1.25\times 10^5\,\mathrm{Pa}}
$$

进入铸型室的液体体积为 $S_1 h_3$，下方液面下降

$$
\boxed{h_4 = \dfrac{S_1 h_3}{S_2} = \dfrac{0.2 \times 0.04}{0.8}\,\mathrm{m} = 0.01\,\mathrm{m}}
$$

此时两液面之间的液柱高度是初始空隙 $H$、上方液面高度 $h_3$ 和下方下降量 $h_4$ 之和。下方气室压强

$$
p_2 = p' + \rho g(H + h_3 + h_4)
$$

$$
\boxed{p_2 = 1.25\times 10^5\,\mathrm{Pa} + 5\times 10^3 \times 10 \times (0.15 + 0.04 + 0.01)\,\mathrm{Pa} = 1.35\times 10^5\,\mathrm{Pa}}
$$

## 交互演示

出气口开着时，拖动铸型室里的液面高度：液面从 0 升到刚好充满，就是第 (1) 问。先点「关闭出气口」，再把液面调到 $h_3 = 0.04\,\mathrm{m}$，就是第 (2) 问。气室压强由上端气体压强加上两液面之间的液柱压强；上方封闭时，顶部气体按玻意耳定律变压强。口径按底面积的平方根画，竖直方向放大了，管道也画粗了，都不按比例。

<Param name="mode" label="出气口" value={1} options={[{value: 1, label: "与大气连通"}, {value: 2, label: "已经关闭"}]} />

<Param name="h3" label="铸型室液面高度" symbol="h" value={0.2} min={0} max={0.2} step={0.01} unit="m" />

<Param name="S1" label="铸型室底面积" symbol="S_1" value={0.2} hidden unit="m²" />

<Param name="h1" label="铸型室高" symbol="h_1" value={0.2} hidden unit="m" />

<Param name="H" label="初始液面差" symbol="H" value={0.15} hidden unit="m" />

<Param name="p0" label="大气压强" symbol="p_0" value={100000} hidden unit="Pa" />

<Param name="S2" label="气室底面积" symbol="S_2" value={0.8} hidden unit="m²" />

<Param name="rho" label="金属液密度" symbol="ρ" value={5000} hidden unit="kg/m³" />

<Param name="g" label="重力加速度" value={10} hidden unit="m/s²" />

<Define name="hDrop" expr="S1*h3/S2" />

<Define name="pTop" expr="mode == 2 and h3 < h1 ? p0*h1/(h1 - h3) : p0" />

<Define name="pGas" expr="pTop + rho*g*(H + h3 + hDrop)" />

<Define name="h2" expr="S1*h1/S2" />

<Define name="p1" expr="p0 + rho*g*(h1 + H + h2)" />

<Define name="h4" expr="S1*0.04/S2" />

<Define name="pPrime" expr="p0*h1/(h1 - 0.04)" />

<Define name="p2" expr="pPrime + rho*g*(H + 0.04 + h4)" />

<Question text="(1) 铸型室刚好充满时，求 h_2 和 p_1" set={{mode: 1, h3: 0.2}} hint="出气口仍通大气，体积 S_1 h_1 = S_2 h_2" />

<Question text="(2) 关闭出气口，液面高 h_3 = 0.04 m 时求 p_2" set={{mode: 2, h3: 0.04}} hint="顶部气体等温压缩，下方液面只下降 h_4" />

<Preset label="(1) 刚好充满" set={{mode: 1, h3: 0.2}} />

<Preset label="(2) 闭口后 h_3 = 0.04 m" set={{mode: 2, h3: 0.04}} />

<Preset label="开始打气前" set={{mode: 1, h3: 0}} />

<Status cases={[
  {when: "mode == 1 and h3 < 0.005", label: "出气口通大气，液体还没进铸型室", tone: "neutral"},
  {when: "mode == 1 and h3 < h1 - 0.005", label: "出气口通大气，正在压入", tone: "info"},
  {when: "mode == 1", label: "第 (1) 问：铸型室刚好充满", tone: "success"},
  {when: "abs(h3 - 0.04) < 0.005", label: "第 (2) 问：闭口后液面高 0.04 m", tone: "success"},
  {label: "出气口已关闭，顶部气体被压缩", tone: "warning"}
]} />

<Readout items={[
  {label: "下方液面下降", symbol: "Δh", expr: "hDrop", unit: "m", digits: 3},
  {label: "上方气体压强", symbol: "p'", expr: "pTop", unit: "Pa", format: "sci", color: "force"},
  {label: "气室压强", symbol: "p", expr: "pGas", unit: "Pa", format: "sci", color: "force"}
]} />

<Figure title="铸型室与气室" height={440} note="口径按底面积的平方根画，竖直方向放大，管道画粗了，都不按比例" params={["mode", "h3", "h1", "H", "hDrop", "pTop", "p0", "pGas"]} hud={[
  {symbol: "p", label: "气室压强", expr: "pGas", unit: "Pa", format: "sci"},
  {symbol: "Δh", label: "液面下降", expr: "hDrop", unit: "m", digits: 3}
]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0.05, xmax: 4.25, ymin: -0.16, ymax: 4.7, equal: true, pad: 14 })
    const kH = 4
    const yFloor = 0
    const yLiq0 = 1.55
    const yChamberTop = yLiq0 + p.H * kH
    const yMoldTop = yChamberTop + p.h1 * kH
    const yLiq = yLiq0 - p.hDrop * kH
    const yMold = yChamberTop + p.h3 * kH
    const x2L = 0.55
    const x2R = 3.75
    const x1L = 1.35
    const x1R = 2.95
    const pipeX = 2.15
    const pipeW = 0.16
    const closed = p.mode == 2 && p.h3 < p.h1 - 0.001
    v.vessel(m, [
      { x1: x2L, y1: yFloor, x2: x2R, y2: yChamberTop },
      { x1: x1L, y1: yChamberTop + 0.22, x2: x1R, y2: yMoldTop },
    ], {
      fills: [
        { x1: x2L + 0.03, y1: yFloor + 0.03, x2: x2R - 0.03, y2: yLiq, kind: 'mercury', meniscus: 'top' },
        { x1: x1L + 0.03, y1: yChamberTop + 0.25, x2: x1R - 0.03, y2: yMold, kind: 'mercury', meniscus: 'top' },
        { x1: x1L + 0.05, y1: yMold + 0.04, x2: x1R - 0.05, y2: yMoldTop - 0.04, kind: 'gas', count: 14, density: p.pTop / p.p0 },
        { x1: x2L + 0.08, y1: yLiq + 0.05, x2: x2R - 0.08, y2: yChamberTop - 0.05, kind: 'gas', count: 18, density: p.pGas / p.p0 },
      ],
    })
    v.vessel(m, [
      { capillary: { x: pipeX, y1: 0.32, y2: yChamberTop + 0.22, w: pipeW } },
    ], {
      fills: [
        { x1: pipeX - pipeW / 2 + 0.012, y1: 0.34, x2: pipeX + pipeW / 2 - 0.012, y2: yChamberTop + 0.2, kind: 'mercury' },
      ],
    })
    v.vessel(m, [
      { capillary: { x: pipeX, y1: yMoldTop, y2: yMoldTop + 0.32, w: 0.12 } },
    ])
    v.vessel(m, [
      { capillary: { x: x2L + 0.32, y1: yChamberTop - 0.1, y2: yChamberTop + 0.38, w: 0.1 } },
    ])
    if (closed) v.block(m, pipeX, yMoldTop + 0.28, 0.24, 0.09)
    v.label(m, (x1L + x1R) / 2, (yChamberTop + yMoldTop) / 2 + 0.12, '铸型室', { place: 'center', size: 13 })
    v.label(m, x2L + 0.72, (yLiq + yChamberTop) / 2, '气室', { place: 'right', size: 13 })
    v.label(m, x2R - 0.55, yFloor + 0.32, '金属液', { place: 'center', size: 13 })
    v.label(m, pipeX + 0.2, (yLiq + yChamberTop) / 2 - 0.15, '管', { place: 'right', size: 12 })
    v.label(m, pipeX, yMoldTop + 0.32, closed ? '出气口关闭' : '出气口', { place: 'above', size: 12 })
    v.label(m, x2L + 0.32, yChamberTop + 0.38, '进气口', { place: 'above', size: 12 })
    v.dim(m, x1R + 0.16, yChamberTop, x1R + 0.16, yMoldTop, 'h_1', { color: v.color.ink })
    v.dim(m, x2L - 0.16, yLiq0, x2L - 0.16, yChamberTop, 'H', { color: v.color.ink })
    if (p.h3 > 0.012) v.dim(m, x1L - 0.16, yChamberTop, x1L - 0.16, yMold, 'h', { color: v.color.velocity })
    if (p.hDrop > 0.004) v.dim(m, x2R + 0.16, yLiq, x2R + 0.16, yLiq0, 'Δh', { color: v.color.velocity })
  },
})
</Figure>

<Plot title="气室压强随铸型室液面升高" size="wide" caption="实线是出气口通大气；虚线是先关闭出气口。游标跟着当前液面"
  x={{name: "s", label: "h", unit: "m", min: 0, max: 0.19}}
  y={{label: "p", unit: "Pa", min: 100000, max: 360000}}
  series={[
    {label: "通大气", expr: "p0 + rho*g*(H + s + S1*s/S2)", color: "force"},
    {label: "先关闭", expr: "p0*h1/(h1 - s) + rho*g*(H + s + S1*s/S2)", color: "force", dash: true}
  ]}
  marks={[
    {x: 0.2, series: 0, label: "(1) 刚好充满"},
    {x: 0.04, series: 1, label: "(2) h_3 = 0.04 m"}
  ]}
  cursor="h3"
/>

## 结合图像

通大气时，上方压强始终是 $p_0$，气室压强只随液柱变高而线性增大，到液面达到 $0.2\,\mathrm{m}$ 就是第 (1) 问的 $1.2\times 10^5\,\mathrm{Pa}$。

先关闭出气口时，顶部气柱越短，压强按 $h_1/(h_1 - h)$ 增大，曲线上翹。$h = 0.04\,\mathrm{m}$ 处是第 (2) 问：上方气体已到 $1.25\times 10^5\,\mathrm{Pa}$，再加上 $0.2\,\mathrm{m}$ 液柱，气室压强为 $1.35\times 10^5\,\mathrm{Pa}$。液面接近铸型室顶时气柱趋近于零，压强趋近于无穷大，曲线只画到液面 $0.19\,\mathrm{m}$。

## 答案汇总

(1) 下方液面下降 $h_2 = 0.05\,\mathrm{m}$，气室压强 $p_1 = 1.2\times 10^5\,\mathrm{Pa}$。

(2) 闭口后上方气体压强 $p' = 1.25\times 10^5\,\mathrm{Pa}$，下方液面再下降 $h_4 = 0.01\,\mathrm{m}$，气室压强 $p_2 = 1.35\times 10^5\,\mathrm{Pa}$。

<Answer items={[
  {label: "下方液面下降", symbol: "h_2", expr: "h2", value: 0.05, unit: "m", digits: 2},
  {label: "充满时气室压强", symbol: "p_1", expr: "p1", value: 120000, unit: "Pa", format: "sci"},
  {label: "闭口后上方气体压强", symbol: "p'", expr: "pPrime", value: 125000, unit: "Pa", format: "sci"},
  {label: "h_3 = 0.04 m 时液面下降", symbol: "h_4", expr: "h4", value: 0.01, unit: "m", digits: 2},
  {label: "此时气室压强", symbol: "p_2", expr: "p2", value: 135000, unit: "Pa", format: "sci"}
]} />
