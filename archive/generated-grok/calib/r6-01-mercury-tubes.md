---
id: r6-01-mercury-tubes
title: 三管注水银：闭管气柱的等温压缩
subject: physics
topic: 玻意耳定律
source: 2021 全国乙卷
breadcrumb: ["热学", "玻意耳定律", "2021 全国乙卷"]
question: |
  （2021·全国乙卷）一玻璃装置放在水平桌面上，竖直玻璃管 A、B、C 粗细均匀，A、B 两管的上端封闭，C 管上端开口，三管的下端在同一水平面内且相互连通（连通部分的体积不计）。A、B 两管的长度分别为 l₁=13.5 cm、l₂=32 cm。开始时三管内都没有水银，A、B 两管内是压强等于大气压的空气。将水银从 C 管缓慢注入，直至 B、C 两管内水银柱的高度差 h=5 cm。已知外界大气压 p₀=75 cmHg，整个过程温度不变。求：
  (1) A、B 两管内水银柱的高度各为多少；
  (2) A、B 两管内水银柱的高度差。
answers:
  - { name: hA, value: 1, unit: cm }
  - { name: hB, value: 2, unit: cm }
  - { name: dh, value: 1, unit: cm }
---

## 一、题目条件分析

三管下端在同一水平面内连通，连通体积不计。水银柱高度都从这一个水平面向上量。

- A、B 上端封闭。注入前管内没有水银，空气充满整根管子，所以气柱原长就是管长：$l_1 = 13.5\ \text{cm}$，$l_2 = 32\ \text{cm}$，压强都是 $p_0 = 75\ \text{cmHg}$。
- C 上端开口，水银面处压强始终是大气压 $p_0$。C 管有多长题目没有给，只要水银不溢出，答案与它无关。
- 各管自身粗细均匀，气柱体积和长度成正比。三管横截面积不必彼此相等，玻意耳定律里各自的横截面积会约去。
- 注入很慢，温度不变。A、B 中的空气做等温变化。
- 压强用厘米汞柱时，一段水银柱产生的压强，数值就等于它的竖直高度（厘米）。压强和高度可以直接相加。

设末态 A、B、C 中水银柱高度为 $h_A$、$h_B$、$h_C$，闭管气体压强为 $p_A$、$p_B$。

空气原来就等于大气压，注水银只会把它压短，所以 $p_B > p_0$。底部压强处处相等时，开口的 C 管液面更高，题目给的高度差是

$$
h = h_C - h_B = 5\ \text{cm}
$$

## 二、完整解答

### 底部压强相等

在下端水平面上，三管压强相同：

$$
p_A + h_A = p_B + h_B = p_0 + h_C
$$

把 $h_C = h_B + h$ 代入 B、C 这一侧：

$$
p_B + h_B = p_0 + (h_B + h)
$$

水银柱 $h_B$ 两边都有，于是闭管 B 的气体压强只由高度差决定：

$$
p_B = p_0 + h = 75 + 5 = 80\ \text{cmHg}
$$

### （1）B 管水银柱高度

B 中气体等温，$pL$ 不变：

$$
p_0\, l_2 = p_B\,(l_2 - h_B)
$$

$$
75 \times 32 = 80 \times (32 - h_B)
$$

$$
2400 = 80 \times (32 - h_B), \qquad 32 - h_B = 30
$$

$$
h_B = \boxed{2\ \text{cm}}
$$

气柱还剩 $L_B = 30\ \text{cm}$。底部压强

$$
p_* = p_B + h_B = 80 + 2 = 82\ \text{cmHg}
$$

因此 C 管水银柱高 $h_C = h_B + h = 7\ \text{cm}$，用开口端复核：$p_0 + h_C = 75 + 7 = 82\ \text{cmHg}$。

### （1）A 管水银柱高度

A 管接到同一个底部：

$$
p_A + h_A = p_* = 82\ \text{cmHg}, \qquad p_A = 82 - h_A
$$

A 中气体等温：

$$
p_0\, l_1 = p_A\,(l_1 - h_A)
$$

$$
75 \times 13.5 = (82 - h_A)(13.5 - h_A)
$$

$$
1012.5 = h_A^2 - 95.5\, h_A + 1107
$$

$$
h_A^2 - 95.5\, h_A + 94.5 = 0
$$

$$
h_A = \frac{95.5 \pm \sqrt{95.5^2 - 4 \times 94.5}}{2} = \frac{95.5 \pm \sqrt{8742.25}}{2} = \frac{95.5 \pm 93.5}{2}
$$

两个根是 $94.5\ \text{cm}$ 和 $1\ \text{cm}$。$94.5\ \text{cm}$ 已经超过 A 管管长 $13.5\ \text{cm}$，气柱长度会变成负数，舍去。

$$
h_A = \boxed{1\ \text{cm}}
$$

复核：气柱长 $L_A = 12.5\ \text{cm}$，$p_A = 82 - 1 = 81\ \text{cmHg}$，

$$
81 \times 12.5 = 1012.5 = 75 \times 13.5
$$

等温成立；底部 $81 + 1 = 82\ \text{cmHg}$，和 B、C 一致。

### （2）A、B 水银柱的高度差

B 管水银面更高：

$$
\Delta h = h_B - h_A = 2 - 1 = \boxed{1\ \text{cm}}
$$

同一底部压强下，$h_B = p_* - p_B$，$h_A = p_* - p_A$，所以高度差就是气体压强差：

$$
\Delta h = p_A - p_B = 81 - 80 = 1\ \text{cmHg}
$$

数值上 $1\ \text{cm}$ 水银对应 $1\ \text{cmHg}$。

> **易错点**：题目给的 $h = 5\ \text{cm}$ 是 B、C 液面的高度差，不是某根水银柱的高度。它只确定 $p_B = p_0 + h = 80\ \text{cmHg}$。$h_B$ 还要再用玻意耳定律求，结果是 $2\ \text{cm}$，不是 $5\ \text{cm}$。若把底部条件写成 $p_A = p_B$，就漏掉了两侧水银柱本身的压强。

## 三、交互演示

$h$ 是注入过程的进度：$h = 0$ 是还没有水银，$h = 5\ \text{cm}$ 是题目末态。A、B 的水银高度由等温条件和底部压强相等算出，滑块一动就重新平衡。图中纵向长度按厘米成比例，横向加宽，不按比例。底部横管只表示连通，体积不计；水银高度从横管上沿的虚线量起。C 管长度题目未给，图中只画到能盛住水银。

<Question text="A、B 两管内水银柱的高度各为多少？" set={{h: 5, l1: 13.5, l2: 32, p0: 75}} hint="先由 B、C 高度差得到 p_B，再对 B、A 分别用玻意耳定律" />

<Question text="A、B 两管内水银柱的高度差是多少？" set={{h: 5, l1: 13.5, l2: 32, p0: 75}} hint="同一底部压强下，水银高度差等于两管气体压强差" />

<Param name="h" label="B、C 高度差" symbol="h" value={5} min={0} max={15} step={0.1} unit="cm" digits={1} color="force" />

<Param name="l1" label="A 管长度" symbol="l_1" value={13.5} min={8} max={40} step={0.5} unit="cm" digits={1} color="charge" />

<Param name="l2" label="B 管长度" symbol="l_2" value={32} min={16} max={48} step={0.5} unit="cm" digits={1} color="velocity" />

<Param name="p0" label="大气压" symbol="p_0" value={75} min={60} max={100} step={1} unit="cmHg" digits={0} color="field" />

<Define name="pB" expr="p0 + h" />

<Define name="LB" expr="p0 * l2 / pB" />

<Define name="hB" expr="l2 - LB" />

<Define name="hC" expr="hB + h" />

<Define name="pBot" expr="pB + hB" />

<Define name="disc" expr="(pBot + l1) * (pBot + l1) - 4 * l1 * (pBot - p0)" />

<Define name="hA" expr="((pBot + l1) - sqrt(disc)) / 2" />

<Define name="LA" expr="l1 - hA" />

<Define name="pA" expr="pBot - hA" />

<Define name="dh" expr="hB - hA" />

<Preset label="注入前" set={{h: 0}} />

<Preset label="题目末态" set={{h: 5, l1: 13.5, l2: 32, p0: 75}} />

<Status cases={[
  {when: "abs(h - 5) < 0.06 and abs(l1 - 13.5) < 0.2 and abs(l2 - 32) < 0.2 and abs(p0 - 75) < 0.5", label: "题目所给条件", tone: "success"},
  {when: "h < 0.05", label: "尚未注入水银", tone: "neutral"},
  {when: "dh > 0.05", label: "B 管水银面更高", tone: "info"},
  {when: "dh < -0.05", label: "A 管水银面更高", tone: "info"},
  {label: "两管水银面等高", tone: "neutral"}
]} />

<Figure title="三管连通器" height={520} params={["l1", "l2", "hA", "hB", "hC", "pA", "pB", "p0", "h", "dh"]}>
figure({
  draw(ctx, p, v) {
    const w = 3.2
    const xA = 0
    const xB = 9.2
    const xC = 18.4
    const base = 1.1
    const cTop = Math.max(p.hC + 6.5, 12)
    const yMax = Math.max(p.l1, p.l2, cTop) + 3.2
    const m = v.view({
      xmin: -5.6,
      xmax: xC + w + 4.8,
      ymin: -base - 3.4,
      ymax: yMax,
      pad: 16,
    })
    const parts = [
      { x1: xA, y1: 0, x2: xA + w, y2: p.l1 },
      { x1: xB, y1: 0, x2: xB + w, y2: p.l2 },
      { x1: xC, y1: 0, x2: xC + w, y2: cTop, open: 'top' },
      { x1: xA + 0.18, y1: -base, x2: xC + w - 0.18, y2: 0.28 },
    ]
    const fills = []
    if (p.l1 - p.hA > 0.2) {
      fills.push({
        x1: xA,
        y1: Math.max(p.hA, 0),
        x2: xA + w,
        y2: p.l1,
        kind: 'gas',
        density: p.pA / p.p0,
        count: Math.max(6, Math.round(p.l1 * 0.7)),
      })
    }
    if (p.l2 - p.hB > 0.2) {
      fills.push({
        x1: xB,
        y1: Math.max(p.hB, 0),
        x2: xB + w,
        y2: p.l2,
        kind: 'gas',
        density: p.pB / p.p0,
        count: Math.max(8, Math.round(p.l2 * 0.45)),
      })
    }
    if (p.hA > 0.02 || p.hB > 0.02 || p.hC > 0.02) {
      fills.push({
        x1: xA + 0.18,
        y1: -base,
        x2: xC + w - 0.18,
        y2: 0,
        kind: 'mercury',
      })
      if (p.hA > 0.02) {
        fills.push({ x1: xA, y1: 0, x2: xA + w, y2: p.hA, kind: 'mercury', meniscus: 'top' })
      }
      if (p.hB > 0.02) {
        fills.push({ x1: xB, y1: 0, x2: xB + w, y2: p.hB, kind: 'mercury', meniscus: 'top' })
      }
      if (p.hC > 0.02) {
        fills.push({ x1: xC, y1: 0, x2: xC + w, y2: p.hC, kind: 'mercury', meniscus: 'top' })
      }
    }
    v.vessel(m, parts, { fills: fills })
    v.line(m, xA - 1.5, 0, xC + w + 1.8, 0, { color: v.color.steel, width: 1, dash: [5, 4] })
    v.label(m, xA - 1.5, 0, '高度零点', { place: 'above', color: v.color.graphite, size: 11 })
    v.label(m, xA + w / 2, p.l1, 'A', { place: 'above', color: v.color.ink, size: 14 })
    v.label(m, xB + w / 2, p.l2, 'B', { place: 'above', color: v.color.ink, size: 14 })
    v.label(m, xC + w / 2, cTop, 'C 开口', { place: 'above', color: v.color.ink, size: 14 })
    v.text(m, xC + w / 2, (p.hC + cTop) / 2, '大气 p₀', { align: 'center', color: v.color.field, size: 12 })
    if (p.l1 - p.hA > 3) {
      v.text(m, xA + w / 2, (Math.max(p.hA, 0) + p.l1) / 2, 'p_A=' + p.pA.toFixed(1), { align: 'center', color: v.color.charge, size: 12 })
    }
    if (p.l2 - p.hB > 3) {
      v.text(m, xB + w / 2, (Math.max(p.hB, 0) + p.l2) / 2, 'p_B=' + p.pB.toFixed(1), { align: 'center', color: v.color.velocity, size: 12 })
    }
    if (p.hA > 0.25) {
      v.dim(m, xA + w + 0.55, 0, xA + w + 0.55, p.hA, 'h_A=' + p.hA.toFixed(2) + ' cm')
    }
    if (p.hB > 0.25) {
      v.dim(m, xB + w + 0.55, 0, xB + w + 0.55, p.hB, 'h_B=' + p.hB.toFixed(2) + ' cm')
    }
    if (p.hC > 0.25) {
      v.dim(m, xC + w + 0.55, 0, xC + w + 0.55, p.hC, 'h_C=' + p.hC.toFixed(2) + ' cm')
    }
    if (Math.abs(p.dh) > 0.3) {
      v.dim(m, (xA + w + xB) / 2, p.hA, (xA + w + xB) / 2, p.hB, 'Δh=' + p.dh.toFixed(2) + ' cm')
    }
    if (p.h > 0.35) {
      v.dim(m, (xB + w + xC) / 2, p.hB, (xB + w + xC) / 2, p.hC, 'h=' + p.h.toFixed(2) + ' cm')
    }
    v.text(m, (xA + xC + w) / 2, -base - 1.6, '纵向按厘米成比例，横向加宽，不按比例', { align: 'center', color: v.color.graphite, size: 11 })
  },
})
</Figure>

<Readout items={[
  {label: "A 管水银高", symbol: "h_A", expr: "hA", unit: "cm", digits: 2, color: "charge"},
  {label: "B 管水银高", symbol: "h_B", expr: "hB", unit: "cm", digits: 2, color: "velocity"},
  {label: "A、B 高度差", symbol: "Δh", expr: "dh", unit: "cm", digits: 2, color: "force"},
  {label: "C 管水银高", symbol: "h_C", expr: "hC", unit: "cm", digits: 2, color: "field"},
  {label: "A 管气体压强", symbol: "p_A", expr: "pA", unit: "cmHg", digits: 2, color: "charge"},
  {label: "B 管气体压强", symbol: "p_B", expr: "pB", unit: "cmHg", digits: 2, color: "velocity"},
  {label: "底部压强", symbol: "p_底", expr: "pBot", unit: "cmHg", digits: 2, color: "force"}
]} />

<Plot
  size="full"
  title="闭管水银柱高度随注入进程变化"
  caption="横轴是 B、C 液面高度差 h。游标停在当前的 h；题目末态是 h = 5 cm。"
  x={{name: "s", label: "h", unit: "cm", min: 0, max: 15}}
  y={{label: "水银柱高", unit: "cm", min: 0, max: "l2 * 15 / (p0 + 15) + 1.5"}}
  series={[
    {label: "A 管 h_A", expr: "((p0 + s + l2 * s / (p0 + s) + l1) - sqrt((p0 + s + l2 * s / (p0 + s) + l1) * (p0 + s + l2 * s / (p0 + s) + l1) - 4 * l1 * (s + l2 * s / (p0 + s)))) / 2", color: "charge"},
    {label: "B 管 h_B", expr: "l2 * s / (p0 + s)", color: "velocity"}
  ]}
  areas={[{series: 1, to: 0, from: 0, until: "h", label: "Δh = h_B − h_A", color: "force"}]}
  marks={[{x: 5, series: 1, label: "h = 5 cm"}]}
  cursor="h"
/>

<Plot
  size="narrow"
  title="A 管等温线"
  caption="右端是初态，气柱等于管长。窗口只取气柱附近几厘米，拖动 h 时左端跟着动。"
  x={{name: "L", label: "L_A", unit: "cm", min: "max(LA - 3, 1)", max: "l1"}}
  y={{label: "p_A", unit: "cmHg", min: "p0 - 8", max: "p0 * l1 / max(LA - 3, 1) + 8"}}
  series={[
    {label: "p L = p₀ l₁", expr: "p0 * l1 / L", color: "charge"},
    {label: "p₀", expr: "p0", color: "field", dash: true}
  ]}
  marks={[
    {x: "l1", series: 0, label: "初态"},
    {x: "LA", series: 0, label: "此刻"}
  ]}
/>

<Plot
  size="narrow"
  title="B 管等温线"
  caption="B 管气柱从 32 cm 缩到 30 cm，压强从 75 cmHg 升到 80 cmHg。"
  x={{name: "L", label: "L_B", unit: "cm", min: "max(LB - 5, 1)", max: "l2"}}
  y={{label: "p_B", unit: "cmHg", min: "p0 - 8", max: "p0 * l2 / max(LB - 5, 1) + 8"}}
  series={[
    {label: "p L = p₀ l₂", expr: "p0 * l2 / L", color: "velocity"},
    {label: "p₀", expr: "p0", color: "field", dash: true}
  ]}
  marks={[
    {x: "l2", series: 0, label: "初态"},
    {x: "LB", series: 0, label: "此刻"}
  ]}
/>

<Answer items={[
  {label: "A 管水银柱高", symbol: "h_A", expr: "hA", value: 1, unit: "cm", digits: 2},
  {label: "B 管水银柱高", symbol: "h_B", expr: "hB", value: 2, unit: "cm", digits: 2},
  {label: "高度差（B 更高）", symbol: "Δh", expr: "dh", value: 1, unit: "cm", digits: 2}
]} />

## 四、结合图像理解关键时刻

注入前 $h = 0$：三管都没有水银，$p_A = p_B = p_0$，两条高度曲线都从原点出发，等温线上的状态点停在右端（气柱等于管长）。

随着 $h$ 增大，B 管水银高度是

$$
h_B = l_2 \frac{h}{p_0 + h}
$$

它比直线弯得平：同样再增加 $1\ \text{cm}$ 的高度差，后来抬高的水银比一开始少。A 管更短。水银同样升高一点，短气柱被挤掉的比例更大，压强升得更快，又把水银往回顶，所以 $h_A$ 一直比 $h_B$ 低。两条曲线之间的面积就是从开始到此刻的高度差 $\Delta h$。

题目末态 $h = 5\ \text{cm}$：读图得 $h_A = 1\ \text{cm}$，$h_B = 2\ \text{cm}$，空隙是 $1\ \text{cm}$。侧栏里 $p_A = 81\ \text{cmHg}$、$p_B = 80\ \text{cmHg}$，差也是 $1$，和 $\Delta h = p_A - p_B$ 对得上。$h_C = 7\ \text{cm}$ 比这两根水银柱都高，所以不要把它和 $h_A$、$h_B$ 画在同一张纵轴上，否则 $1\ \text{cm}$、$2\ \text{cm}$ 会被压扁。

两张等温线把这件事再看一遍：状态点只从右端挪开一点点。A 的气柱从 $13.5\ \text{cm}$ 到 $12.5\ \text{cm}$，B 从 $32\ \text{cm}$ 到 $30\ \text{cm}$。缩短量就是水银柱高度，远小于题目里的 $5\ \text{cm}$。$5\ \text{cm}$ 是开口管比 B 管多出来的那一截，不是气柱缩短的长度。

横轴窗口只框住气柱附近几厘米，是为了把这 $1\ \text{cm}$、$2\ \text{cm}$ 的移动看清楚。拖动 $h$ 时左端跟着气柱走，曲线仍是 $pL = p_0 l$。

## 五、答案汇总

| 小问 | 答案 |
|---|---|
| （1）A 管水银柱高度 | $1\ \text{cm}$ |
| （1）B 管水银柱高度 | $2\ \text{cm}$ |
| （2）A、B 水银柱高度差 | $1\ \text{cm}$（B 比 A 高） |

中间量：B 管气体压强 $80\ \text{cmHg}$，C 管水银柱 $7\ \text{cm}$，底部压强 $82\ \text{cmHg}$，A 管气体压强 $81\ \text{cmHg}$。
