---
id: zj-01
title: 欹器何时翻转
subject: physics
topic: 重心与转动平衡
source: 2022 浙江卷（汇编专题一第 1 题，单选）
question: |
  如图所示，公园里有一仿制我国古代欹器的 U 形水桶，桶可绕水平轴转动，水管口持续有水流出，过一段时间桶会翻转一次，决定桶能否翻转的主要因素是（　　）

  A. 水桶自身重力的大小

  B. 水管每秒出水量的大小

  C. 水流对桶撞击力的大小

  D. 水桶与水整体的重心高低
choice: D
answers:
  - { name: hCrit, value: 0.5, unit: m }
  - { name: mCrit, value: 16, unit: kg }
  - { name: tCrit, value: 8, unit: s }
  - { name: Mmax, value: 19.2, unit: kg }
---

## 一、题目条件分析

桶仿古代欹器，绕一根固定的水平轴转动。水管一直注水，过一段时间翻一次，把水倒出。

题目没有质量、流量或力的数值，问的是哪一个因素决定它**会不会翻**。轴把桶约束住，判断标准是各力对这根轴的力矩，不是力的大小本身。

空桶先停在正位，要等一会儿才翻，说明不是水一冲上去就被掀翻，而是桶里的水慢慢改变了整体的质量分布。

下面先写出与具体数字无关的判据，再用一组代表性数值把重心高低算出来、画出来。这组数不是试卷给的。

## 二、完整解答

### 正位附近的重力矩

正位时桶左右对称。不论重心在转轴上面还是下面，重力作用线都过转轴，力矩为零，所以正位总是平衡位置。稳不稳，要看稍偏一点之后，力矩把桶拉回来，还是把它推得更偏。

设桶底到整体重心的高度为 $y_c$，桶底到转轴的高度为 $y_O$，桶加水的总质量为 $M+m$。从正位逆时针转过小角 $\theta$ 后，重心相对转轴的水平坐标是

$$
x = -(y_c - y_O)\sin\theta
$$

重力竖直向下，对转轴的力矩（逆时针为正）为

$$
\tau = -(M+m)gx = (M+m)g(y_c - y_O)\sin\theta
$$

- $y_c < y_O$：重心在转轴下方，$\tau$ 与 $\theta$ 异号，是恢复力矩，松手后回到正位。
- $y_c > y_O$：重心在转轴上方，$\tau$ 与 $\theta$ 同号，偏离被放大，松手后翻转。
- $y_c = y_O$：小角度力矩仍为零，是临界。重心再高才会翻。

$g$ 和总质量都是正数，只放大力矩，不改变正负。正负只由 $y_c - y_O$ 决定。

水沿对称轴注入。水深 $h$、每米水深的水质量为 $k$ 时，水的质量 $m = kh$，水的重心在 $h/2$。桶的质量 $M$、重心高度 $y_M$，则

$$
y_c = \frac{M y_M + kh\cdot h/2}{M + kh}
$$

空桶要能停住，必须 $y_M < y_O$。令 $y_c = y_O$，得到正根

$$
h_c = y_O + \sqrt{y_O^2 + \frac{2M(y_O - y_M)}{k}}
$$

桶的内高为 $H$。$h_c < H$ 时，注过 $h_c$ 就会翻；$h_c \ge H$ 时，加满后重心仍不高于转轴，不会自己翻。

上下等粗的桶里，水的重心最高只有 $H/2$。若转轴抬到中线或更高（$y_O \ge H/2$），再叠上不高于转轴的桶重心，整体重心到不了转轴上方。装置能一次次翻转，就是因为转轴低到让重心有机会升到它上面。题图把轴画在桶身里；下面的代表性取值放在中下部，不是几何中线。

轴对桶的力作用在转轴上，力矩为零，不参与这个判断。

### 逐项判断

**A. 错误。** 水桶重力 $G = Mg$ 按同一个比例放大 $\tau$，但不改变 $\tau$ 的正负。同一只桶、同一个 $G$，水深在 $h_c$ 以下不翻，超过 $h_c$ 就翻。

桶越重，同样的水越不容易把重心抬过转轴。$M$ 大到 $h_c \ge H$ 时，加满也不翻。这仍然是「重心没有高过转轴」，不是重力的数值在发号施令。只知道重力有多大、不知道重心在轴上还是轴下，无法判断翻不翻。

**B. 错误。** 每秒出水量 $q$（质量流量）只出现在注水时间里：

$$
t = \frac{kh}{q}
$$

$y_c$ 和 $h_c$ 的式子里都没有 $q$。流量大，重心更早升到转轴；流量小，更晚升到。只要最终能升过转轴，桶就会翻。若加满后重心仍不高于转轴，流量再大也只是从桶沿溢出，不会翻。

**C. 错误。** 题图里水从桶口上方落入，落在对称轴上，对转轴的力臂可以看成 $0$，撞击力矩

$$
\tau_F = 0
$$

与撞击力 $F$ 的大小无关。$F = 0$ 时，只要重心升过转轴，桶仍会翻；$F$ 很大时，只要重心还在转轴下方，桶仍是稳定的。题目说「过一段时间」才翻，也说明不是阀门一开就被水撞翻。

**D. 正确。** 整体重心低于转轴，正位稳定；高于转轴，正位不稳定，稍有偏离就会翻转。注水改变的是这个高低，所以它是决定桶能否翻转的主要因素。

$$
\boxed{D}
$$

### 代表性数值

试卷没有数字。下面这组数只用于画图和核对，取得使临界水深是一个整齐的数。图不按公园实桶的比例。

- 桶：质量 $M = 8\ \mathrm{kg}$，重心 $y_M = 0.10\ \mathrm{m}$，内高 $H = 0.60\ \mathrm{m}$
- 转轴离桶底 $y_O = 0.20\ \mathrm{m}$（桶身中下部，空桶重心在轴下）
- 水：$k = \rho S = 1.0\times 10^3 \times 0.032 = 32\ \mathrm{kg/m}$（上下等粗）
- 出水量 $q = 2\ \mathrm{kg/s}$，取 $g = 10\ \mathrm{m/s^2}$
- 水流打在对称轴上，力臂取 $0$

临界水深：

$$
h_c = 0.20 + \sqrt{0.20^2 + \frac{2\times 8\times(0.20-0.10)}{32}} = 0.20 + \sqrt{0.09} = \boxed{0.50\ \mathrm{m}}
$$

此时水的质量、注到临界所需的时间：

$$
m_c = kh_c = 32\times 0.50 = \boxed{16\ \mathrm{kg}}
$$

$$
t_c = \frac{m_c}{q} = \frac{16}{2} = \boxed{8\ \mathrm{s}}
$$

加满仍能刚好把重心抬到转轴的最大桶质量（$h_c = H$）：

$$
M_{\max} = \frac{kH(H-2y_O)}{2(y_O-y_M)} = \frac{32\times 0.60\times 0.20}{0.20} = \boxed{19.2\ \mathrm{kg}}
$$

三个点可以直接验算 $y_c$：

| 状态 | $y_c$ | 和转轴 $0.20\ \mathrm{m}$ 比 |
|---|---|---|
| $M=8\ \mathrm{kg}$，$h=0.30\ \mathrm{m}$ | $(0.80+1.44)/17.6 = 0.127\ \mathrm{m}$ | 在轴下，稳定 |
| $M=8\ \mathrm{kg}$，$h=0.55\ \mathrm{m}$ | $(0.80+4.84)/25.6 = 0.220\ \mathrm{m}$ | 在轴上，会翻 |
| $M=24\ \mathrm{kg}$，$h=0.60\ \mathrm{m}$ | $(2.40+5.76)/43.2 = 0.189\ \mathrm{m}$ | 加满仍在轴下，不翻 |

第三行就是选项 A 的迷惑之处：桶重了确实可能不翻，原因是重心没过转轴。前两行桶的重力都是 $80\ \mathrm{N}$，一个不翻、一个会翻。

$q$ 改成 $4\ \mathrm{kg/s}$ 时，$h_c$ 仍是 $0.50\ \mathrm{m}$，$t_c$ 变成 $4\ \mathrm{s}$。$F$ 从 $0$ 改到几十牛，撞击力矩仍是 $0$。

刚注水时 $y_c$ 会先略降再上升：最先进来的水积在桶底，低于空桶重心，把整体重心往下拉；水再加高，重心才越过转轴。这不改变「过轴才翻」的结论。

## 三、交互演示

侧栏的水深和试探倾角是「用手把桶按住」的考察。正面图、侧面图、表盘和前两张曲线都看这个状态。正位力矩总是零，所以默认把桶按在 $\beta = 8^\circ$，才能看见力臂。

侧面动画是松开之后的自由过程，从空桶开始注水，只随桶的质量和出水量变化。水深滑块不会把动画拖到同一水位。撞击力不进入运动。

动画里的转动惯量和阻尼只用来把晃动停住，题目没有给这两个量，它们不参与上面的判据。

<Param name="hw" label="桶内水深" symbol="h" color="velocity" value={0.55} min={0} max={0.6} step={0.01} unit="m" />

<Param name="beta" label="试探倾角" symbol="β" value={8} min={-25} max={25} step={1} unit="°" />

<Param name="M" label="水桶质量" symbol="M" value={8} min={2} max={30} step={0.5} unit="kg" />

<Param name="q" label="每秒出水量" symbol="q" value={2} min={0.4} max={5} step={0.1} unit="kg/s" />

<Param name="Fhit" label="水流撞击力" symbol="F" color="force" value={2} min={0} max={30} step={0.5} unit="N" />

<Param name="t" label="动画时间" value={0} min={0} max={80} step={0.01} unit="s" hidden />

<Define name="g" expr="10" />

<Define name="k" expr="32" />

<Define name="yM" expr="0.10" />

<Define name="yO" expr="0.20" />

<Define name="Hb" expr="0.60" />

<Define name="halfW" expr="0.10" />

<Define name="Irot" expr="0.80" />

<Define name="bDamp" expr="4" />

<Define name="thetaKick" expr="0.12" />

<Define name="thetaPour" expr="0.70" />

<Define name="pourRate" expr="0.55" />

<Define name="armF" expr="0" />

<Define name="yC" expr="(M*yM + k*hw*hw/2)/(M + k*hw)" />

<Define name="hCrit" expr="yO + sqrt(yO^2 + (2*M*(yO - yM))/k)" />

<Define name="mCrit" expr="k*hCrit" />

<Define name="tCrit" expr="mCrit/q" />

<Define name="Mmax" expr="k*Hb*(Hb - 2*yO)/(2*(yO - yM))" />

<Define name="nHold" expr="M*(yM - yO) + k*hw*(hw/2 - yO)" />

<Define name="tauBeta" expr="nHold*g*sin(deg(beta))" />

<Define name="tauF" expr="Fhit*armF" />

<Motion name="bucket" state={{h: 0, theta: 0, omega: 0, filling: 1, pouring: 0}} rates={{h: "filling*(q/k) - pouring*pourRate", theta: "omega", omega: "((M*(yM - yO) + k*h*(h/2 - yO))*g*sin(theta) - bDamp*omega)/Irot"}} until="Hb*k/q + 12" events={[{name: "tUnstable", when: "M*(yM - yO) + k*h*(h/2 - yO)", dir: "up", set: {theta: "thetaKick", omega: 0}}, {name: "tFull", when: "h - Hb", dir: "up", set: {filling: 0, h: "Hb"}}, {name: "tPour", when: "theta - thetaPour", dir: "up", set: {filling: 0, pouring: 1}}, {name: "tEmpty", when: "h - 0.02", dir: "down", set: {pouring: 0, h: 0}}]} />

<Question text="A. 水桶自身重力的大小" set={{M: 24, hw: 0.6, beta: 8, q: 2, Fhit: 2}} hint="桶重到 24 kg，加满重心仍低于转轴，所以不翻。改回 8 kg、水深 0.55 m，重力变小了反而会翻。" />

<Question text="B. 水管每秒出水量的大小" set={{q: 4, hw: 0.55, beta: 8, M: 8, Fhit: 2}} hint="出水量改为 4 kg/s 后，临界水深仍是 0.50 m，只有注到临界的时间从 8 s 变成 4 s。" />

<Question text="C. 水流对桶撞击力的大小" set={{Fhit: 0, hw: 0.55, beta: 8, M: 8, q: 2}} hint="撞击力已是 0，力矩仍是 0，但重心在轴上，松手还是会翻。把力调大、水深拖回 0.30 m，力很大也不翻。" />

<Question text="D. 水桶与水整体的重心高低" set={{hw: 0.55, beta: 8, M: 8, q: 2, Fhit: 2}} hint="重心已在转轴上方，8° 倾角下的重力矩与偏离同向。水深拖回 0.30 m，力矩反向。流量和撞击力都没改。" />

<Preset label="稳定：重心在轴下" set={{hw: 0.3, beta: 8, M: 8, q: 2, Fhit: 2}} />

<Preset label="临界水深" set={{hw: "hCrit", beta: 8, M: 8, q: 2, Fhit: 2}} />

<Preset label="会翻：重心在轴上" set={{hw: 0.55, beta: 8, M: 8, q: 2, Fhit: 2}} />

<Preset label="桶太重，加满不翻" set={{M: 24, hw: 0.6, beta: 8, q: 2, Fhit: 2}} />

<Status cases={[
  {when: "hw > hCrit + 0.001 and hCrit < Hb", label: "重心高于转轴，松开后会翻转", tone: "danger"},
  {when: "abs(hw - hCrit) <= 0.008 and hCrit < Hb", label: "重心接近转轴高度，临界", tone: "warning"},
  {when: "hCrit >= Hb", label: "即使加满，重心也不高于转轴，不会翻转", tone: "info"},
  {label: "重心低于转轴，松开后回到正位", tone: "success"}
]} />

<Readout items={[
  {label: "整体重心高度", symbol: "y_c", expr: "yC", unit: "m", digits: 3, color: "field"},
  {label: "重心高出转轴", symbol: "y_c-y_O", expr: "yC - yO", unit: "m", digits: 3, color: "field"},
  {label: "临界水深", symbol: "h_c", expr: "hCrit", unit: "m", digits: 3},
  {label: "注到临界的时间", symbol: "t_c", expr: "tCrit", unit: "s", digits: 2},
  {label: "此倾角下的重力矩", symbol: "τ", expr: "tauBeta", unit: "N·m", digits: 2, color: "force"},
  {label: "撞击力的力矩", symbol: "τ_F", expr: "tauF", unit: "N·m", digits: 2, color: "force"},
  {label: "加满仍能翻的最大桶质量", symbol: "M_max", expr: "Mmax", unit: "kg", digits: 2}
]} />

<Answer items={[
  {label: "答案", text: "D"},
  {label: "临界水深", symbol: "h_c", expr: "hCrit", value: 0.5, unit: "m", digits: 2},
  {label: "临界时水的质量", symbol: "m_c", expr: "mCrit", value: 16, unit: "kg", digits: 1},
  {label: "注到临界的时间", symbol: "t_c", expr: "tCrit", value: 8, unit: "s", digits: 1},
  {label: "加满仍能翻的最大桶质量", symbol: "M_max", expr: "Mmax", value: 19.2, unit: "kg", digits: 2}
]} />

正面对照题图：两根立柱、一根左右向的横杆穿过桶身，龙头把水滴进桶里。桶宽放大了，转轴放在代表性高度 $y_O$ 上。$y_c-y_O$ 为正表示重心在转轴上方。

<Figure title="题图正面：立柱、转轴和注水" height={420} params={["hw", "yC", "yO", "Hb"]} note="桶宽放大，不按比例。转轴取在桶高的下三分之一，不是几何中线。" legend={[{kind: "force", label: "重力"}]}>
figure({
  draw(ctx, p, v) {
    const base = 0.22
    const top = base + p.Hb
    const rx = 0.28
    const ry = 0.06
    const axleY = base + p.yO
    const waterY = base + Math.max(0, Math.min(p.hw, p.Hb))
    const cmY = base + p.yC
    const m = v.view({ xmin: -1.15, xmax: 1.2, ymin: -0.08, ymax: 1.7, equal: true, pad: 14 })

    v.ground(m, -1.15, 1.2, 0)
    v.path(m, [[-0.86, 0], [-0.7, 0], [-0.7, 1.18], [-0.86, 1.18]], { close: true, fill: v.color.enamel, color: v.color.ink })
    v.path(m, [[0.7, 0], [0.86, 0], [0.86, 1.18], [0.7, 1.18]], { close: true, fill: v.color.enamel, color: v.color.ink })
    v.circle(m, -0.78, 1.18, 0.1, { fill: v.color.enamel, color: v.color.ink })
    v.circle(m, 0.78, 1.18, 0.1, { fill: v.color.enamel, color: v.color.ink })

    v.ellipse(m, 0, base, rx, ry, { color: v.color.ink, fill: v.color.enamel })
    v.line(m, -rx, base, -rx, top, { color: v.color.ink, width: 2 })
    v.line(m, rx, base, rx, top, { color: v.color.ink, width: 2 })

    if (p.hw > 0.008) {
      v.path(m, [[-rx + 0.015, base + 0.01], [rx - 0.015, base + 0.01], [rx - 0.015, waterY], [-rx + 0.015, waterY]], { close: true, fill: v.color.steel })
      v.ellipse(m, 0, waterY, rx - 0.015, ry * 0.7, { color: v.color.ink, fill: v.color.steel })
    }

    v.ellipse(m, 0, top, rx, ry, { color: v.color.ink })
    v.line(m, -0.86, axleY, 0.86, axleY, { color: v.color.ink, width: 4 })
    v.circle(m, -0.7, axleY, 0.045, { fill: v.color.steel, color: v.color.ink })
    v.circle(m, 0.7, axleY, 0.045, { fill: v.color.steel, color: v.color.ink })

    v.path(m, [[-0.78, 1.02], [-0.78, 1.48], [0, 1.48], [0, top + 0.12]], { color: v.color.ink, width: 2.5 })
    const mouth = top + 0.12
    const drops = [mouth - 0.06, mouth - 0.13, mouth - 0.2]
    for (let i = 0; i !== drops.length; i++) {
      if (drops[i] > waterY + 0.03) v.circle(m, 0, drops[i], 0.016, { fill: v.color.steel, color: v.color.ink })
    }

    v.com(m, 0, cmY, { label: "重心" })
    v.vec(m, 0, cmY, 0, -0.16, { kind: "force", label: "G" })
    v.dim(m, rx + 0.16, base, rx + 0.16, axleY, "y_O")
    v.label(m, 0.98, axleY, "转轴")
    v.label(m, -0.2, 1.56, "水管")
  },
})
</Figure>

侧面沿转轴看，转轴缩成一个点。桶被按在倾角 $\beta$。这里按水随桶一起偏转来放重心，和上面的力矩公式一致；水面因此跟着桶倾，不画成重新流平之后的水平面。重力箭头只表示方向。

<Figure title="侧面：按住桶时的重力矩" height={380} size="wide" params={["beta", "hw", "yC", "yO", "Hb", "halfW", "tauBeta"]} note="按住不放。箭头长度不表示力的大小。水面随桶倾斜，对应小角度力矩公式。" legend={[{kind: "force", label: "重力"}, {kind: "force-dash", label: "重力作用线"}]}>
figure({
  draw(ctx, p, v) {
    const yO = p.yO
    const H = p.Hb
    const w = p.halfW
    const th = (p.beta * Math.PI) / 180
    const h = Math.max(0, Math.min(p.hw, H))
    const m = v.view({ xmin: -0.85, xmax: 0.85, ymin: -0.58, ymax: 0.95, equal: true, pad: 16 })

    function bw(u, vb) {
      const vv = vb - yO
      return [u * Math.cos(th) - vv * Math.sin(th), u * Math.sin(th) + vv * Math.cos(th)]
    }

    v.ground(m, -0.85, 0.85, -0.5)
    v.line(m, 0, -0.42, 0, 0.7, { color: v.color.steel, dash: true })

    if (h > 0.01) {
      const a = bw(-w + 0.008, 0.008)
      const b = bw(w - 0.008, 0.008)
      const c = bw(w - 0.008, h)
      const d = bw(-w + 0.008, h)
      v.path(m, [a, b, c, d], { close: true, fill: v.color.steel })
    }

    const bl = bw(-w, 0)
    const br = bw(w, 0)
    const tl = bw(-w, H)
    const tr = bw(w, H)
    v.path(m, [bl, br, tr, tl], { close: true, color: v.color.ink, width: 2 })
    v.circle(m, 0, 0, 0.028, { fill: v.color.ink })

    const cm = bw(0, p.yC)
    v.line(m, cm[0], -0.42, cm[0], cm[1], { color: v.color.force, dash: true })
    v.com(m, cm[0], cm[1], { label: "重心" })
    v.vec(m, cm[0], cm[1], 0, -0.2, { kind: "force", label: "G" })

    if (Math.abs(cm[0]) > 0.03) v.dim(m, 0, cm[1], cm[0], cm[1], "力臂")
    if (Math.abs(p.beta) > 1) {
      const a0 = 90
      const a1 = 90 + p.beta
      v.ellipse(m, 0, 0, 0.16, 0.16, { color: v.color.graphite, from: Math.min(a0, a1), to: Math.max(a0, a1) })
      v.label(m, -0.28, 0.2, "β")
    }
    let tip = "力矩约为零"
    if (p.tauBeta > 0.05) tip = "力矩与偏离同向，会翻"
    if (p.tauBeta < -0.05) tip = "力矩与偏离反向，回到正位"
    v.label(m, -0.42, 0.78, tip)
    v.label(m, 0.14, -0.1, "转轴")
  },
})
</Figure>

动画从空桶、正立开始。水匀速注入；重心升过转轴的那一瞬，给一个约 $7^\circ$ 的微扰。倾角达到约 $40^\circ$ 后开始倒水，倒空后重心回到轴下，桶再正过来。桶太重、重心到不了轴上时，进度条上没有后面的标记，桶会一直正立到加满。

<Sim title="松开后：注水、过轴、翻转、倒空" height={380} duration="Hb*k/q + 12" time="t" playSeconds={12} params={["bucket", "M", "k", "yM", "yO", "Hb", "halfW", "tUnstable", "tPour", "tEmpty"]} hud={[{symbol: "h", label: "水深", expr: "max(bucket.h(t),0)", unit: "m", digits: 2}, {symbol: "y_c", label: "重心", expr: "(M*yM + (k/2)*max(bucket.h(t),0)*max(bucket.h(t),0))/(M + k*max(bucket.h(t),0))", unit: "m", digits: 3}, {symbol: "θ", label: "倾角", expr: "bucket.theta(t)*180/pi", unit: "°", digits: 1}]} legend={[{kind: "force", label: "重力"}, {kind: "force-dash", label: "重力作用线"}, {kind: "velocity", label: "水流"}]} note="沿转轴看。重力箭头只表示方向。动画从空桶重新注水，不跟水深滑块走。" marks={[{t: 0, label: "开始注水"}, {t: "tUnstable", label: "重心过轴", color: "field"}, {t: "tPour", label: "翻转倒水", color: "force"}, {t: "tEmpty", label: "水已倒出"}]}>
sim({
  at(t, p) {
    const s = p.bucket.state(t)
    const h = s.h > 0 ? s.h : 0
    const mTot = p.M + p.k * h
    const yC = (p.M * p.yM + p.k * h * h / 2) / mTot
    return { h: h, theta: s.theta, yC: yC, filling: s.filling, pouring: s.pouring }
  },
  draw(ctx, s, v) {
    const p = v.p
    const yO = p.yO
    const H = p.Hb
    const w = p.halfW
    const th = s.theta
    const h = s.h > 0 ? s.h : 0
    const m = v.view({ xmin: -0.85, xmax: 0.85, ymin: -0.58, ymax: 0.95, equal: true, pad: 16 })

    function bw(u, vb) {
      const vv = vb - yO
      return [u * Math.cos(th) - vv * Math.sin(th), u * Math.sin(th) + vv * Math.cos(th)]
    }

    v.ground(m, -0.85, 0.85, -0.5)
    v.line(m, 0, -0.42, 0, 0.72, { color: v.color.steel, dash: true })
    v.path(m, [[-0.42, 0.62], [-0.42, 0.78], [0, 0.78], [0, 0.55]], { color: v.color.ink, width: 2 })

    if (h > 0.01) {
      const a = bw(-w + 0.008, 0.008)
      const b = bw(w - 0.008, 0.008)
      const c = bw(w - 0.008, Math.min(h, H))
      const d = bw(-w + 0.008, Math.min(h, H))
      v.path(m, [a, b, c, d], { close: true, fill: v.color.steel })
    }

    const bl = bw(-w, 0)
    const br = bw(w, 0)
    const tl = bw(-w, H)
    const tr = bw(w, H)
    v.path(m, [bl, br, tr, tl], { close: true, color: v.color.ink, width: 2 })
    v.circle(m, 0, 0, 0.028, { fill: v.color.ink })

    const cm = bw(0, s.yC)
    v.line(m, cm[0], -0.42, cm[0], cm[1], { color: v.color.force, dash: true })
    v.com(m, cm[0], cm[1], { label: "重心" })
    v.vec(m, cm[0], cm[1], 0, -0.18, { kind: "force", label: "G" })

    if (s.filling > 0.5) v.particles(m, [[0, 0.55], [0, 0.28]], { kind: "velocity", speed: 48, gap: 14 })
    if (s.pouring > 0.5) {
      const lip = tl[1] < tr[1] ? tl : tr
      v.particles(m, [[lip[0], lip[1]], [lip[0], lip[1] - 0.4]], { kind: "velocity", speed: 70, gap: 12 })
    }

    v.label(m, 0.16, -0.1, "转轴")

    if (p.tUnstable === p.tUnstable) v.event(m, 0, 0.42, "重心升到转轴上方", { at: p.tUnstable, kind: "field" })
    if (p.tPour === p.tPour) v.event(m, cm[0], cm[1], "开始倒水", { at: p.tPour, kind: "force" })
    if (p.tEmpty === p.tEmpty) v.event(m, 0, -0.2, "水已倒出", { at: p.tEmpty, kind: "velocity" })
  },
})
</Sim>

<Dial title="整体重心离桶底的高度" size="narrow" expr="yC" min={0.05} max={0.4} step={0.05} unit="m" symbol="y_c" color="field" digits={3} arcs={[{from: 0.2, to: 0.4, color: "force", label: "高于转轴"}]} footer={[{label: "低于转轴，稳定", from: 0.05, to: 0.2, color: "field"}, {label: "高于转轴，会翻", from: 0.2, to: 0.4, color: "force"}]} />

## 四、结合图像理解关键时刻

前两张图的横轴是水深，跟着「桶内水深」滑块走，不随动画时间走。第三张图才是动画的时间轴。

重心曲线先略降、再上升。下降是因为水先积在桶底，低于空桶重心 $0.10\ \mathrm{m}$。曲线和转轴高度 $0.20\ \mathrm{m}$ 的交点就是临界水深。初始的桶在 $h_c = 0.50\ \mathrm{m}$ 过轴；把桶的质量拖过 $19.2\ \mathrm{kg}$，交点会移出桶高，加满也不再相交。

力矩曲线在同一个水深由负变正。图上固定用 $5^\circ$，所以它不跟试探倾角联动：$\beta$ 只改变力矩的大小，不改变变号的位置。$\beta = 0$ 时侧栏里的力矩变成零，但只要再偏一点，符号仍由重心在轴上还是轴下决定。

出水量不改变前两张图，只把 $t_c = m_c/q$ 和第三张图的时间轴拉长或压短。撞击力不进任何一条曲线，侧栏里的撞击力矩一直是零。

动画在初始参数下，水深约在 $8\ \mathrm{s}$ 升到 $h_c$，进度条上出现「重心过轴」。随后倾角增大，水从较低的桶沿倒出，重心落回转轴下方，桶回到正位。桶质量大于 $M_{\max}$ 时没有这些标记，桶一直正立。

<Plot title="重心高度随水深的变化" size="wide" caption="虚线是转轴。曲线升过虚线后，松手就会翻。刚注水时略向下，是水先积在桶底。" x={{name: "s", label: "水深 h", unit: "m", min: 0, max: "Hb"}} y={{label: "高度", unit: "m", min: 0, max: 0.45}} series={[{label: "整体重心 y_c", expr: "(M*yM + k*s*s/2)/(M + k*s)", color: "field"}, {label: "转轴 y_O", expr: "yO", color: "steel", dash: true}]} marks={[{x: "hCrit", label: "重心升到转轴"}]} areas={[{series: 0, to: 1, from: "min(hCrit, Hb)", until: "Hb", color: "force", label: "高于转轴"}]} cursor="hw" />

<Plot title="偏离正位 5° 时的重力矩" caption="正力矩与偏离同向，会越偏越大；负力矩把桶拉回。变号点和上一张图是同一个水深。固定取 5°，不跟 β 联动。" x={{name: "s", label: "水深 h", unit: "m", min: 0, max: "Hb"}} y={{label: "τ", unit: "N·m"}} series={[{label: "重力矩", expr: "(M*(yM - yO) + k*s*(s/2 - yO))*g*sin(deg(5))", color: "force"}]} marks={[{x: "hCrit", label: "力矩由负变正"}]} cursor="hw" />

<Plot title="动画里的水深和重心" caption="跟侧面动画的时间走。出水量只改变这张图的快慢，不改变上面两张对水深的曲线。" x={{name: "s", label: "t", unit: "s", min: 0, max: "Hb*k/q + 12"}} y={{label: "高度", unit: "m", min: 0, max: 0.7}} series={[{label: "水深", expr: "max(bucket.h(s),0)", color: "velocity"}, {label: "整体重心", expr: "(M*yM + (k/2)*max(bucket.h(s),0)*max(bucket.h(s),0))/(M + k*max(bucket.h(s),0))", color: "field"}, {label: "转轴", expr: "yO", color: "steel", dash: true}]} marks={[{x: "tUnstable", series: 1, label: "重心过轴"}, {x: "tEmpty", series: 0, label: "水已倒出"}]} cursor="t" />

## 五、答案汇总

选 D。桶能否翻转，看的是水桶与水整体的重心在转轴上方还是下方。

在上面这组代表性数值下，$h_c = 0.50\ \mathrm{m}$，$m_c = 16\ \mathrm{kg}$，$t_c = 8\ \mathrm{s}$。桶质量不超过 $M_{\max} = 19.2\ \mathrm{kg}$ 时，注过临界水深就会翻；再重，加满也不翻。流量和撞击力都不进入这个判据。
