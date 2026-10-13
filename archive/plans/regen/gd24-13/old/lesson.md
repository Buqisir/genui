---
id: gd24-13
title: 差压阀两侧气体的降温与加铁砂
subject: physics
topic: 理想气体状态方程
source: 2024 广东卷 第 13 题（计算）
breadcrumb: ["热学", "理想气体", "2024 广东卷"]
question: |
  差压阀可控制气体进行单向流动，广泛应用于减震系统。如图所示，A、B 两个导热良好的气缸通过差压阀连接，A 内轻质活塞的上方与大气连通，B 内气体体积不变。当 A 内气体压强减去 B 内气体压强大于 Δp 时差压阀打开，A 内气体缓慢进入 B 中；当该差值小于或等于 Δp 时差压阀关闭。当环境温度 T_1 = 300 K 时，A 内气体体积 V_{A1} = 4.0×10^2 m^3，B 内气体压强 p_{B1} 等于大气压强 p_0，已知活塞的横截面积 S = 0.10 m^2，Δp = 0.11 p_0，p_0 = 1.0×10^5 Pa，重力加速度大小取 g = 10 m/s^2，A、B 内的气体可视为理想气体，忽略活塞与气缸间的摩擦、差压阀与连接管内的气体体积不计。当环境温度降到 T_2 = 270 K 时：

  （1）求 B 内气体压强 p_{B2}；

  （2）求 A 内气体体积 V_{A2}；

  （3）在活塞上缓慢倒入铁砂，若 B 内气体压强回到 p_0 并保持不变，求已倒入铁砂的质量 m。

  【图】两个气缸并排。左侧气缸较高、上端开口，标 A；缸内有一条水平活塞，活塞上方空白、与开口相通，活塞下方是阴影气体。右侧气缸较矮、上端封闭，内部充满阴影气体，标 B。两缸底部用一根水平管相连，管的中部有一个阀门符号，标“差压阀”。
answers:
  - { name: pB2, value: 90000, unit: Pa }
  - { name: VA2, value: 360, unit: "m³" }
  - { name: mSand, value: 110, unit: kg }
---

## 一、题目条件分析

两缸都导热良好，过程又是缓慢的，气体温度始终等于环境温度。活塞轻质、无摩擦，上方与大气相通，所以没倒铁砂时 A 内压强被钉在大气压上；倒了质量为 $m$ 的铁砂以后

$$
p_A = p_0 + \frac{mg}{S}
$$

B 的容积不变。差压阀只允许气体从 A 进入 B，而且要 $p_A - p_B > \Delta p$ 才打开；差值小于或等于 $\Delta p$ 时关闭。连接管里的气体体积忽略不计。

初态 $T_1 = 300\ \text{K}$，$V_{A1} = 4.0\times 10^{2}\ \text{m}^3$，$p_{B1} = p_0$，因此

$$
p_{A1} = p_0,\qquad p_{A1} - p_{B1} = 0 < \Delta p
$$

阀门起初关着，两边气体的质量都不变。

$$
\Delta p = 0.11\,p_0 = 1.1\times 10^{4}\ \text{Pa}
$$

按题目数据，A 中气柱高度 $V_{A1}/S = 4.0\times 10^{3}\ \text{m}$。示意图里的气缸高度不按比例，只保留体积的相对变化。

## 二、完整解答

### （1）$p_{B2}$

温度从 $300\ \text{K}$ 降到 $270\ \text{K}$。先假定这段降温里阀门一直关着，再用结果检验。

B 容积不变，查理定律

$$
\frac{p_{B1}}{T_1} = \frac{p_{B2}}{T_2}
$$

$$
p_{B2} = p_0\frac{T_2}{T_1} = 1.0\times 10^{5}\times\frac{270}{300} = 9.0\times 10^{4}\ \text{Pa}
$$

此时活塞上还没有铁砂，$p_{A2} = p_0$，

$$
p_{A2} - p_{B2} = 0.10\,p_0 = 1.0\times 10^{4}\ \text{Pa} < \Delta p = 1.1\times 10^{4}\ \text{Pa}
$$

差值仍然小于 $\Delta p$，阀门确实没有打开，假定成立。

$$
\boxed{p_{B2} = 9.0\times 10^{4}\ \text{Pa}}
$$

阀门刚好要打开的温度由 $p_0 - p_0 T_c/T_1 = \Delta p$ 决定：

$$
T_c = T_1(1 - 0.11) = 267\ \text{K}
$$

$T_2 = 270\ \text{K}$ 比 $T_c$ 高 $3\ \text{K}$，所以本题的降温停在阀门打开之前。

### （2）$V_{A2}$

阀门关着，A 中气体质量不变，压强保持 $p_0$，盖-吕萨克定律

$$
\frac{V_{A1}}{T_1} = \frac{V_{A2}}{T_2}
$$

$$
V_{A2} = V_{A1}\frac{T_2}{T_1} = 4.0\times 10^{2}\times\frac{270}{300} = 3.6\times 10^{2}\ \text{m}^3
$$

$$
\boxed{V_{A2} = 3.6\times 10^{2}\ \text{m}^3}
$$

### （3）铁砂质量 $m$

在 $T_2 = 270\ \text{K}$ 的状态上缓慢倒铁砂，温度保持 $270\ \text{K}$。活塞平衡：

$$
p_A S = p_0 S + mg,\qquad p_A = p_0 + \frac{mg}{S}
$$

B 的体积、温度、质量都还没变时，$p_B$ 停在 $p_{B2}$。差值升到 $\Delta p$ 时

$$
p_0 + \frac{mg}{S} - p_{B2} = \Delta p
$$

$$
\frac{mg}{S} = \Delta p - 0.10\,p_0 = 0.01\,p_0
$$

$$
m = \frac{0.01\,p_0\,S}{g} = \frac{0.01\times 1.0\times 10^{5}\times 0.10}{10} = 10\ \text{kg}
$$

这是阀门刚到临界的质量。此时 $p_B$ 仍是 $9.0\times 10^{4}\ \text{Pa}$，还没有回到 $p_0$。

再继续缓慢加铁砂，只要差值略大于 $\Delta p$，气体就从 A 进入 B，把差值压回 $\Delta p$。过程足够慢，打开以后沿着

$$
p_A - p_B = \Delta p
$$

走。要求 $p_B$ 回到 $p_0$ 并且不再变化，就是走到 $p_B = p_0$ 时差值正好等于 $\Delta p$，阀门重新关闭，B 不再进气：

$$
p_A - p_0 = \Delta p,\qquad p_A = p_0 + \Delta p = 1.11\,p_0
$$

$$
m = \frac{\Delta p\cdot S}{g} = \frac{0.11\times 1.0\times 10^{5}\times 0.10}{10} = 110\ \text{kg}
$$

$$
\boxed{m = 110\ \text{kg}}
$$

对应的活塞受力：$p_0 S = 1.00\times 10^{4}\ \text{N}$，$mg = 1.10\times 10^{3}\ \text{N}$，$p_A S = 1.11\times 10^{4}\ \text{N}$。

质量加到 $10\ \text{kg}$ 时阀门才刚到临界，B 的压强仍是 $9.0\times 10^{4}\ \text{Pa}$。要让 $p_B$ 回到 $p_0$，铁砂要加到 $110\ \text{kg}$。这一步用得上第（1）问的检验：降温结束时阀门本来关着，B 里的气体质量还是初态的质量。

## 三、交互演示

降温是准静态过程，用温度滑块从 $300\ \text{K}$ 收到 $267\ \text{K}$；铁砂质量滑块对应第（3）问。温度停在 $267\ \text{K}$ 以上，保证降温本身还没有把气体推进 B。

<Param name="T1" label="初温 T_1" value={300} unit="K" hidden />

<Param name="VA1" label="A 的初体积 V_{A1}" value={400} unit="m³" hidden />

<Param name="p0" label="大气压强 p_0" value={100000} unit="Pa" hidden />

<Param name="S" label="活塞面积 S" value={0.1} unit="m²" hidden />

<Param name="g" label="重力加速度 g" value={10} unit="m/s²" hidden />

<Param name="kDp" label="Δp 与 p_0 之比" value={0.11} hidden />

<Param name="T" label="环境温度 T" symbol="T" min={267} max={300} step={1} value={270} unit="K" color="force" />

<Param name="ms" label="已倒入铁砂 m" symbol="m" min={0} max={160} step={1} value={0} unit="kg" />

<Define name="dp" expr="kDp*p0" />

<Define name="Tcrit" expr="T1*(1-kDp)" />

<Define name="pA" expr="p0 + ms*g/S" />

<Define name="pBclosed" expr="p0*T/T1" />

<Define name="pOpen" expr="pBclosed + dp" />

<Define name="floorR" expr="1 - kDp + ms*g/(S*p0)" />

<Define name="pB" expr="p0*max(T/T1, floorR)" />

<Define name="mOpen" expr="(pOpen - p0)*S/g" />

<Define name="valve" expr="floorR > T/T1 + 1e-6 ? 1 : 0" />

<Define name="diff" expr="pA - pB" />

<Define name="VA" expr="VA1*(T/T1)*p0/min(pA, pOpen)" />

<Define name="pB2" expr="p0*T/T1" />

<Define name="VA2" expr="VA1*T/T1" />

<Define name="mSand" expr="dp*S/g" />

<Question text="温度降到 270 K 时，B 内气体压强 p_{B2} 是多少？" set={{T: 270, ms: 0}} hint="B 容积不变。先确认压强差还没有超过 Δp。" />

<Question text="温度降到 270 K 时，A 内气体体积 V_{A2} 是多少？" set={{T: 270, ms: 0}} hint="阀门未开时，A 的压强被大气钉住。" />

<Question text="缓慢倒入铁砂，使 B 内压强回到 p_0 并保持不变，铁砂质量 m 是多少？" set={{T: 270, ms: "mSand"}} hint="最终 p_B = p_0，同时压强差刚好等于 Δp。" />

<Preset label="初态 300 K" set={{T: 300, ms: 0}} />

<Preset label="第 1、2 问：270 K" set={{T: 270, ms: 0}} />

<Preset label="临界温度 267 K" set={{T: 267, ms: 0}} />

<Preset label="刚到开阀临界" set={{T: 270, ms: 10}} />

<Preset label="第 3 问：110 kg" set={{T: 270, ms: "mSand"}} />

<Status cases={[
  {when: "ms > mOpen + 0.01 and abs(pB - p0) < 1", label: "p_B 回到 p_0，阀门恰好关闭", tone: "success"},
  {when: "ms > mOpen + 0.01", label: "已有气体进入 B，压强差保持在 Δp", tone: "warning"},
  {when: "abs(ms - mOpen) < 0.51 and ms > 0.5", label: "压强差等于 Δp，阀门处于临界", tone: "info"},
  {when: "abs(T - 267) < 0.51 and ms < 0.5", label: "降温临界：再降温阀门就会打开", tone: "warning"},
  {when: "abs(T - 270) < 0.51 and ms < 0.5", label: "270 K：压强差小于 Δp，阀门关闭", tone: "success"},
  {label: "阀门关闭，两边气体质量都不变", tone: "neutral"}
]} />

<Readout items={[
  {label: "A 内压强", symbol: "p_A", expr: "pA", unit: "Pa", digits: 0, color: "ink"},
  {label: "B 内压强", symbol: "p_B", expr: "pB", unit: "Pa", digits: 0, color: "field"},
  {label: "压强差", symbol: "p_A-p_B", expr: "diff", unit: "Pa", digits: 0, color: "force"},
  {label: "打开阈值", symbol: "Δp", expr: "dp", unit: "Pa", digits: 0, color: "force"},
  {label: "V_A（开阀前）", symbol: "V_A", expr: "VA", unit: "m³", digits: 1, color: "velocity"},
  {label: "刚开阀的铁砂", symbol: "m_开", expr: "mOpen", unit: "kg", digits: 1},
  {label: "回到 p_0 所需", symbol: "m", expr: "mSand", unit: "kg", digits: 1}
]} />

<Answer items={[
  {label: "B 内气体压强", symbol: "p_{B2}", expr: "pB2", value: 90000, unit: "Pa", digits: 0},
  {label: "A 内气体体积", symbol: "V_{A2}", expr: "VA2", value: 360, unit: "m³", digits: 0},
  {label: "铁砂质量", symbol: "m", expr: "mSand", value: 110, unit: "kg", digits: 0}
]} />

气缸图里，活塞高度按开阀之前的体积来画。阀门打开以后，又有气体进入 B，少掉的体积与题目没给的 $V_B$ 有关，图上只保留刚开阀那一瞬间的活塞位置，不再标体积。气柱高度不按比例。

<Figure title="差压阀连接的两个气缸" height={380} params={["VA", "VA1", "pA", "pB", "p0", "ms", "valve", "diff", "dp"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.45, xmax: 8.7, ymin: -1.75, ymax: 6.2, pad: 16 })
    const aL = 0.7, aR = 2.9, ax = 1.8
    const bL = 5.3, bR = 7.5, bx = 6.4
    const topA = 5.45, topB = 3.15
    const pipeY = -0.7
    const h = 0.4 + 4.2 * (p.VA / p.VA1)
    const ink = v.color.ink
    const steel = v.color.steel

    function shade(x1, y1, x2, y2) {
      v.path(m, [[x1, y1], [x2, y1], [x2, y2], [x1, y2]], {
        close: true, fill: v.color.enamel, color: steel, width: 1,
      })
      for (let x = x1 + 0.16; x < x2 - 0.04; x += 0.22) {
        v.line(m, x, y1 + 0.05, x, y2 - 0.05, { color: steel, width: 1 })
      }
    }

    shade(aL + 0.08, 0.06, aR - 0.08, Math.max(0.35, h - 0.04))
    shade(bL + 0.08, 0.06, bR - 0.08, topB - 0.08)

    v.line(m, aL, 0, aL, topA, { color: ink, width: 2 })
    v.line(m, aR, 0, aR, topA, { color: ink, width: 2 })
    v.line(m, aL, topA, aL - 0.26, topA, { color: ink, width: 2 })
    v.line(m, aR, topA, aR + 0.26, topA, { color: ink, width: 2 })
    v.line(m, aL, 0, ax - 0.38, 0, { color: ink, width: 2 })
    v.line(m, ax + 0.38, 0, aR, 0, { color: ink, width: 2 })

    v.line(m, bL, 0, bL, topB, { color: ink, width: 2 })
    v.line(m, bL, topB, bR, topB, { color: ink, width: 2 })
    v.line(m, bR, topB, bR, 0, { color: ink, width: 2 })
    v.line(m, bL, 0, bx - 0.38, 0, { color: ink, width: 2 })
    v.line(m, bx + 0.38, 0, bR, 0, { color: ink, width: 2 })

    v.line(m, ax, 0.12, ax, pipeY, { color: ink, width: 8 })
    v.line(m, bx, 0.12, bx, pipeY, { color: ink, width: 8 })
    v.line(m, ax, pipeY, bx, pipeY, { color: ink, width: 8 })

    const vx = 4.1
    v.path(m, [[vx - 0.4, pipeY - 0.22], [vx - 0.04, pipeY], [vx - 0.4, pipeY + 0.22]], {
      close: true, color: ink, fill: v.color.enamel,
    })
    v.path(m, [[vx + 0.4, pipeY - 0.22], [vx + 0.04, pipeY], [vx + 0.4, pipeY + 0.22]], {
      close: true, color: ink, fill: v.color.enamel,
    })
    if (p.valve > 0.5) {
      v.particles(m, [[ax + 0.45, pipeY], [bx - 0.45, pipeY]], { kind: 'field', speed: 42, gap: 16 })
    } else {
      v.line(m, vx, pipeY - 0.32, vx, pipeY + 0.32, { color: ink, width: 2.5 })
    }

    v.block(m, ax, h, 2.05, 0.16)
    if (p.ms > 0.4) {
      const sh = 0.18 + Math.min(p.ms, 160) / 160 * 0.55
      v.block(m, ax, h + 0.16, 0.86, sh)
      v.label(m, ax, h + 0.2 + sh, '铁砂 ' + p.ms.toFixed(0) + ' kg', { size: 12 })
    }

    v.label(m, ax, topA + 0.22, 'A', { size: 16 })
    v.label(m, bx, topB + 0.24, 'B', { size: 16 })
    v.label(m, ax, h + 0.08, '活塞', { size: 12 })
    v.label(m, ax, (h + 0.2 + topA) / 2, '大气 p_0', { color: v.color.graphite, size: 12 })
    v.label(m, aR + 0.15, h + 0.35, 'p_A = ' + (p.pA / p.p0).toFixed(2) + ' p_0', { color: v.color.ink, size: 12 })
    if (p.valve > 0.5) {
      v.label(m, ax, h * 0.48, '气体进入 B', { color: v.color.velocity, size: 12 })
    } else {
      v.label(m, ax, h * 0.48, 'V_A = ' + p.VA.toFixed(0) + ' m³', { color: v.color.velocity, size: 12 })
    }
    v.label(m, bx, topB * 0.5, 'p_B = ' + (p.pB / p.p0).toFixed(2) + ' p_0', { color: v.color.field, size: 12 })
    v.label(m, vx, pipeY - 0.48, p.valve > 0.5 ? '差压阀 · 进气' : '差压阀 · 关闭', { size: 12 })
    v.label(m, vx, -1.28, '差值 ' + (p.diff / p.p0).toFixed(2) + ' p_0', { color: v.color.force, size: 12 })
    v.text(m, 4.1, -1.55, '示意图，气柱高度不按比例', { align: 'center', color: v.color.graphite, size: 11 })
  },
})
</Figure>

<ForceDiagram
  title="轻质活塞：p_A S = p_0 S + mg"
  surface={{type: "none"}}
  body={{shape: "block", label: "活塞"}}
  forces={[
    {label: "p_0 S", angle: -90, magnitude: "p0*S", showValue: true, unit: "N", digits: 0},
    {label: "mg", angle: -90, magnitude: "ms*g", showValue: true, unit: "N", digits: 0},
    {label: "p_A S", angle: 90, solve: "FA", showValue: true, unit: "N", digits: 0}
  ]}
  triangle={true}
/>

<Dial
  title="阀门看到的压强差"
  expr="diff"
  min={0}
  max={16000}
  step={2000}
  unit="Pa"
  symbol="p_A-p_B"
  arcs={[
    {from: 0, to: 11000, color: "field", label: "关闭"},
    {from: 11000, to: 16000, color: "force", label: "打开"}
  ]}
  footer={[
    {label: "≤ Δp 关闭", from: 0, to: 11000, color: "field"},
    {label: "> Δp 才进气", from: 11000, to: 16000, color: "force"}
  ]}
/>

<Plot
  title="降温过程的压强（尚未倒铁砂）"
  caption="实线在 267 K 拐平：再降温阀门打开，把 p_B 维持在 p_0 − Δp。虚线是假设阀门一直关着。本题的 270 K 还在拐平之前。曲线不含铁砂，游标只标明温度。"
  x={{name: "temp", label: "T", unit: "K", min: 250, max: 300}}
  y={{label: "p / p_0", min: 0.8, max: 1.05}}
  series={[
    {label: "p_A", expr: "1", color: "ink"},
    {label: "p_B", expr: "max(temp/T1, 1-kDp)", color: "field"},
    {label: "若一直关阀", expr: "temp/T1", color: "steel", dash: true}
  ]}
  marks={[
    {x: 270, series: 1, label: "T_2 = 270 K"},
    {x: 267, series: 1, label: "临界 267 K"}
  ]}
  cursor="T"
  values={false}
/>

<Plot
  title="阀门关闭时 A 的等压体积"
  caption="纵轴不从零起，便于看出大约一成的缩小。倒铁砂之前体积与温度成正比。"
  x={{name: "temp", label: "T", unit: "K", min: 267, max: 300}}
  y={{label: "V_A", unit: "m³", min: 320, max: 430}}
  series={[
    {label: "V_A", expr: "VA1*temp/T1", color: "velocity"}
  ]}
  marks={[
    {x: 300, label: "初态"},
    {x: 270, label: "第 2 问"}
  ]}
  cursor="T"
  values={false}
/>

<Plot
  title="当前温度下，压强随铁砂质量变化"
  caption="质量较小时 B 的压强不动。超过刚开阀的质量后，两线间距保持为 Δp，色带就是这段间距。p_B 回到 p_0 时质量为 110 kg。"
  x={{name: "mm", label: "m", unit: "kg", min: 0, max: 160}}
  y={{label: "p / p_0", min: 0.85, max: 1.25}}
  series={[
    {label: "p_A", expr: "(p0 + mm*g/S)/p0", color: "ink"},
    {label: "p_B", expr: "max(T/T1, 1-kDp+mm*g/(S*p0))", color: "field"},
    {label: "p_0", expr: "1", color: "steel", dash: true}
  ]}
  areas={[
    {series: 0, to: 1, from: "mOpen", until: 160, label: "Δp", color: "force"}
  ]}
  marks={[
    {x: "mOpen", series: 1, label: "刚开阀"},
    {x: "mSand", series: 1, label: "p_B = p_0"}
  ]}
  cursor="ms"
/>

## 四、结合图像理解关键时刻

p–T 图按尚未倒铁砂来画。$300\ \text{K}$ 时两条压强都是 $p_0$，差值为零。温度下降时 $p_A$ 不动，$p_B$ 沿直线下降。$270\ \text{K}$ 处 $p_B = 0.90\,p_0$，差值是 $0.10\,p_0$。虚线要到 $267\ \text{K}$ 才和实线分开，那里的差值正好是 $0.11\,p_0$。本题停在分开之前，所以第（1）（2）问都按阀门关闭来算：$p_{B2} = 9.0\times 10^{4}\ \text{Pa}$，$V_{A2} = 3.6\times 10^{2}\ \text{m}^3$。

V–T 图是同一段等压过程。体积从 $4.0\times 10^{2}\ \text{m}^3$ 收到 $3.6\times 10^{2}\ \text{m}^3$，和温度的比值不变。气缸图里活塞只下降大约一成。

倒铁砂要看 p–m 图，温度固定在 $270\ \text{K}$。$10\ \text{kg}$ 以前 $p_B$ 是一条水平线，停在 $0.90\,p_0$；$p_A$ 从 $p_0$ 慢慢升高，差值从 $0.10\,p_0$ 升到 $\Delta p$。过了 $10\ \text{kg}$，气体进入 B，两条实线的间距被锁在 $0.11\,p_0$，表盘的指针也就停在 $\Delta p$ 那条刻度上，进不到“打开”色带里面——缓慢进气把多出来的差值随时泄掉了。$p_B$ 这条线在 $110\ \text{kg}$ 穿过 $p_0$，受力图里 $mg = 1.10\times 10^{3}\ \text{N}$，三个力首尾相接。

## 五、答案汇总

| 问题 | 答案 |
|---|---|
| （1）B 内气体压强 $p_{B2}$ | $9.0\times 10^{4}\ \text{Pa}$ |
| （2）A 内气体体积 $V_{A2}$ | $3.6\times 10^{2}\ \text{m}^3$ |
| （3）铁砂质量 $m$ | $110\ \text{kg}$ |
