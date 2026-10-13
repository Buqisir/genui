---
id: gd22-16
title: 玻璃瓶测水深
source: 2022 广东卷 第 16 题（选考·选修 3-3，计算；选考共 12 分，原卷未单列本题分值）
question: 玻璃瓶可作为测量水深的简易装置。如图所示，潜水员在水面上将 80 mL 水装入容积为 380 mL 的玻璃瓶中，拧紧瓶盖后带入水底，倒置瓶身，打开瓶盖，让水进入瓶中，稳定后测得瓶内水的体积为 230 mL。将瓶内气体视为理想气体，全程气体不泄漏且温度不变。大气压强 p_0 取 1.0×10^5 Pa，重力加速度 g 取 10 m/s^2，水的密度 ρ 取 1.0×10^3 kg/m^3。求水底的压强 p 和水的深度 h。
answers:
  - { name: p, value: 200000, unit: Pa }
  - { name: h, value: 10, unit: m }
---

瓶容积 $380\,\mathrm{mL}$。水面上瓶盖拧紧时瓶内已有 $80\,\mathrm{mL}$ 水，封闭气体占剩下的 $300\,\mathrm{mL}$，压强为大气压强 $p_0$。带到水底后倒置、打开瓶盖，水进入瓶中，稳定时瓶内水为 $230\,\mathrm{mL}$，气体被压到 $150\,\mathrm{mL}$。全程气体不泄漏、温度不变，是一次等温压缩。

瓶子上宽下窄，液面高度不与体积成正比。图中把瓶分成三段：瓶颈 $80\,\mathrm{mL}$、肩部 $30\,\mathrm{mL}$、瓶身 $270\,\mathrm{mL}$。这样下潜前的 $80\,\mathrm{mL}$ 正好满到瓶颈上端，下潜后的 $230\,\mathrm{mL}$ 越过肩部、升到瓶身中部。瓶子形状不按比例。

## 完整解答

记瓶容积为 $V$，水面处瓶内水的体积为 $V_1$，水底处为 $V_2$。封闭气体的两个状态是

$$
\begin{aligned}
V_{\mathrm{g}1} &= V - V_1 = 380\,\mathrm{mL} - 80\,\mathrm{mL} = 300\,\mathrm{mL}, &
& p_1 = p_0 = 1.0\times 10^5\,\mathrm{Pa}, \\
V_{\mathrm{g}2} &= V - V_2 = 380\,\mathrm{mL} - 230\,\mathrm{mL} = 150\,\mathrm{mL}, &
& p_2 = p.
\end{aligned}
$$

气体质量不变、温度不变，由玻意耳定律 $p_1 V_{\mathrm{g}1} = p_2 V_{\mathrm{g}2}$：

$$
p = p_0 \cdot \frac{V - V_1}{V - V_2}
= 1.0\times 10^5 \times \frac{300}{150}
= \boxed{2.0\times 10^5\,\mathrm{Pa}}.
$$

瓶口朝下且与瓶外的水相通，稳定后瓶内气体的压强就是水底压强。水底比水面多一段液柱压强：

$$
p = p_0 + \rho g h
\quad\Rightarrow\quad
h = \frac{p - p_0}{\rho g}
= \frac{1.0\times 10^5}{1.0\times 10^3 \times 10}
= \boxed{10\,\mathrm{m}}.
$$

瓶内水从 $80\,\mathrm{mL}$ 增到 $230\,\mathrm{mL}$，多出的 $150\,\mathrm{mL}$ 是从瓶外压进来的。原来那 $80\,\mathrm{mL}$ 仍留在瓶里，不写进气体的状态方程。

## 交互演示

拖动「下潜深度」：瓶子一直瓶口朝下，瓶内气体按 $p V_\mathrm{g} = p_0 \times 300\,\mathrm{mL}$ 被压缩，少掉的体积由水补上。深度拖到 $10\,\mathrm{m}$ 就是题目测得的状态：瓶内水 $230\,\mathrm{mL}$，气体 $150\,\mathrm{mL}$。

<Param name="depth" label="下潜深度" symbol="h" value={10} min={0} max={16} step={0.1} unit="m" color="velocity" />

<Param name="V" label="瓶容积" value={380} hidden unit="mL" />

<Param name="V1" label="下潜前瓶内水" value={80} hidden unit="mL" />

<Param name="p0" label="大气压强" symbol="p_0" value={100000} hidden unit="Pa" />

<Param name="rho" label="水的密度" symbol="ρ" value={1000} hidden unit="kg/m^3" />

<Param name="g" label="重力加速度" value={10} hidden unit="m/s^2" />

<Define name="Vg0" expr="V - V1" />

<Define name="p" expr="p0 + rho*g*depth" />

<Define name="Vg" expr="p0*Vg0/p" />

<Define name="Vw" expr="V - Vg" />

<Define name="h" expr="(p - p0)/(rho*g)" />

<Question text="水底的压强 p 是多少？" set={{depth: 10}} hint="气体从 300 mL 压到 150 mL，温度不变" />

<Question text="水的深度 h 是多少？" set={{depth: 10}} hint="水底比水面多一段 ρgh" />

<Preset label="题目：水底，深 10 m" set={{depth: 10}} />

<Preset label="水面：瓶盖刚打开" set={{depth: 0}} />

<Status cases={[
  {when: "depth < 0.05", label: "水面：气体 300 mL，压强为 p0", tone: "info"},
  {when: "abs(depth - 10) < 0.05", label: "题目测得的状态：瓶内水 230 mL", tone: "success"},
  {label: "下潜中：气体等温压缩，水进入瓶中", tone: "neutral"}
]} />

<Readout items={[
  {label: "水底压强", symbol: "p", expr: "p", unit: "Pa", format: "sci", color: "force"},
  {label: "气体体积", symbol: "V_g", expr: "Vg", unit: "mL", digits: 0, color: "field"},
  {label: "瓶内水", symbol: "V_w", expr: "Vw", unit: "mL", digits: 0, color: "velocity"}
]} />

<Answer items={[
  {label: "水底压强", symbol: "p", expr: "p", value: 200000, unit: "Pa", format: "sci"},
  {label: "水的深度", symbol: "h", expr: "h", value: 10, unit: "m", digits: 1}
]} />

<Figure title="倒置的玻璃瓶" height={480} size="narrow" params={["Vw", "p", "p0"]} note="瓶子形状不按比例；瓶颈、肩部、瓶身的容积取 80、30、270 mL，使两条液面落在题图的位置" hud={[{symbol: "p", label: "水底压强", expr: "p", unit: "Pa", format: "sci"}]} legend={[{kind: "force", label: "气体压强"}, {kind: "velocity", label: "瓶内水"}]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2.6, xmax: 2.8, ymin: 1.9, ymax: 5.05, equal: true })
    const x1 = -1.05
    const x2 = 1.05
    const y1 = 0
    const y2 = 1.55
    const neckW = 0.5
    const neckH = 0.42
    const shoulder = 0.34
    const cx = (x1 + x2) / 2
    const yNeck = y2 + shoulder
    const yTop = yNeck + neckH
    const half = neckW / 2
    // 零件里 y 越大越靠近瓶口。倒扣后水从瓶口灌入，所以液面从瓶口往瓶底量。
    // 80 mL 停在瓶颈上端，230 mL 升过肩部、进入瓶身中部。
    const neckVol = 80
    const shoulderVol = 30
    const bodyVol = 270
    const water = Math.min(Math.max(p.Vw, 0), neckVol + shoulderVol + bodyVol)
    let yWater = yTop
    if (water <= neckVol) yWater = yTop - neckH * (water / neckVol)
    else if (water <= neckVol + shoulderVol) yWater = yNeck - (yNeck - y2) * ((water - neckVol) / shoulderVol)
    else yWater = y2 - (y2 - y1) * ((water - neckVol - shoulderVol) / bodyVol)
    const yBefore = yNeck
    const gasTop = y1 + 0.02
    const gasBot = Math.max(yWater, y1 + 0.02)
    // 细颈瓶的瓶颈固定朝上。绕瓶口高度做一次上下翻转，瓶口落到画面下方，宽瓶身留在上方。
    const pivot = m.y(yTop)
    ctx.save()
    ctx.translate(0, pivot)
    ctx.scale(1, -1)
    ctx.translate(0, -pivot)
    v.vessel(m, [
      { bottle: { x1, x2, y1, y2, neck: { w: neckW, h: neckH }, shoulder } },
    ], {
      fills: [
        { kind: 'water', x1: x1 - 0.3, x2: x2 + 0.3, y1: yWater, y2: yTop + 0.3, meniscus: 'bottom' },
        { kind: 'gas', x1: x1 + 0.05, x2: x2 - 0.05, y1: gasTop, y2: gasBot, density: p.p / p.p0, count: 18 },
      ],
    })
    ctx.restore()
    const yW = 2 * yTop - yWater
    const yB = 2 * yTop - yBefore
    v.line(m, x1 - 0.12, yW, x2 + 0.12, yW, { color: v.color.velocity, dash: true, width: 1.4 })
    v.label(m, x2 + 0.2, yW, '下潜后液面', { place: 'right' })
    v.line(m, -half - 0.02, yB, half + 0.02, yB, { color: v.color.steel, width: 1.2 })
    v.label(m, x1 - 0.15, yB, '下潜前液面', { place: 'left' })
    v.text(m, cx, yW - 0.38, '水', { color: v.color.ink })
  },
})
</Figure>

<Plot title="等温压缩" size="wide" caption="气体不泄漏、温度不变，pVg = p0 × 300 mL"
  x={{label: "V_g", unit: "mL", min: 100, max: 340}}
  y={{label: "p", unit: "10^5 Pa", min: 0.6, max: 3.2}}
  series={[{
    label: "pVg = 常数",
    x: "u",
    expr: "p0*Vg0/u/1e5",
    over: {name: "u", min: 110, max: 320},
    color: "force",
    point: "Vg"
  }]}
  marks={[
    {x: "Vg0", label: "水面，300 mL"},
    {x: "Vg", label: "此刻"}
  ]}
/>

## 结合图像看

水面处液面停在瓶颈上端：瓶内 $80\,\mathrm{mL}$ 水，气体 $300\,\mathrm{mL}$，压强为 $p_0$。深度增大时，瓶外压强按 $p_0 + \rho g h$ 升高，瓶内气体体积反比缩小，液面从瓶颈升进瓶身。

$p$–$V_\mathrm{g}$ 图是一段等温线。游标在右下角是水面状态，滑向左上角时压强升高、体积减小，乘积不变。深度 $10\,\mathrm{m}$ 时游标落在 $150\,\mathrm{mL}$、$2.0\times 10^5\,\mathrm{Pa}$，瓶内水正好是题目测得的 $230\,\mathrm{mL}$。

## 答案

水底的压强 $\boxed{2.0\times 10^5\,\mathrm{Pa}}$，水的深度 $\boxed{10\,\mathrm{m}}$。
