---
id: r5-06-spring-abc
title: 碰撞后弹簧的最大弹性势能
subject: physics
topic: 动量守恒与机械能
source: 选必1 模块备考卷 16 题（14 分）
question: |
  用轻质弹簧相连的质量均为 2 kg 的 A、B 两物块都以 v=6 m/s 的速度在光滑的水平地面上向右运动，弹簧处于原长（A 在左、B 在右），质量为 4 kg 的物块 C 静止于 B 的前方。B 与 C 碰撞后二者粘在一起运动，求：
  (1) 当弹簧的弹性势能最大时，物块 A 的速度多大？
  (2) 弹簧弹性势能的最大值是多少？
answers:
  - { name: vAstar, value: 3, unit: "m/s" }
  - { name: EpMax, value: 12, unit: J }
---

## 一、题目条件分析

- A、B 质量同为 $m_A = m_B = 2\ \text{kg}$，用轻质弹簧相连，一起以 $v = 6\ \text{m/s}$ 向右匀速运动，弹簧处于原长。A 在左，B 在右。
- C 的质量 $m_C = 4\ \text{kg}$，静止在 B 的前方。水平地面光滑。
- B 与 C 的碰撞是完全非弹性碰撞：碰后二者粘在一起。碰撞时间极短，这段时间内弹簧来不及形变，A 不参与这次碰撞。
- 题目没有给出劲度系数、弹簧原长，也没有给出 B 与 C 的初始距离。第 (1)(2) 问的答案与这三个量都无关。
- 演示里劲度系数的初始值取 $k = 6\ \text{N/m}$。原长取成「最大压缩量 $+ 2\ \text{m}$」，题目数据下就是 $4\ \text{m}$，用来保证弹簧不会被压过零长。B 的右端到 C 的左端的初始空隙取 $2.4\ \text{m}$。物块宽度只为看清接触面。

## 二、完整解答

光滑水平面上，A、B、C 和弹簧组成的系统所受合外力为零。从出发到以后的整个过程，总动量都守恒：

$$
p = (m_A + m_B)\,v = (2 + 2)\times 6 = 24\ \text{kg·m/s}
$$

总质量 $M = 8\ \text{kg}$，质心速度恒为

$$
v_c = \frac{p}{M} = \frac{24}{8} = 3\ \text{m/s}
$$

### 碰撞瞬间

碰撞前后弹簧仍是原长。对 B、C 这一对用动量守恒（A 的速度不变）：

$$
m_B v = (m_B + m_C)\,v_1
$$

$$
v_1 = \frac{2\times 6}{2 + 4} = 2\ \text{m/s}
$$

碰后瞬间：A 的速度仍是 $6\ \text{m/s}$，粘在一起的 B、C 以 $2\ \text{m/s}$ 向右运动。A 比 B、C 快，弹簧开始被压缩。

### （1）弹性势能最大时 A 的速度

弹簧弹性势能最大时，两端的相对速度为零：A 与「B+C」速度相同。系统只能以质心速度整体前进，所以

$$
v_A = v_{BC} = v_c = \boxed{3\ \text{m/s}}
$$

这个状态在以后的振动里会反复出现（压缩最甚一次，伸长最甚又一次）。每一次势能达到最大时，A 的速度都是 $3\ \text{m/s}$。

### （2）弹性势能的最大值

B、C 粘合时有机械能损失；损失发生在碰撞瞬间。碰撞之后地面光滑，弹簧弹力是保守内力，A、（B+C）和弹簧的机械能守恒。

碰后瞬间的动能：

$$
E_k' = \frac12 m_A v^2 + \frac12 (m_B + m_C)\,v_1^2
= \frac12\times 2\times 6^2 + \frac12\times 6\times 2^2
= 36 + 12 = 48\ \text{J}
$$

三者共速时，动能只剩下整体运动的那一份，弹性势能达到最大：

$$
E_{k,\text{共}} = \frac12 M v_c^2 = \frac12\times 8\times 3^2 = 36\ \text{J}
$$

$$
E_{pm} = E_k' - E_{k,\text{共}} = 48 - 36 = \boxed{12\ \text{J}}
$$

用相对运动核对：碰后 A 相对「B+C」的速度 $u = 6 - 2 = 4\ \text{m/s}$，约化质量

$$
\mu = \frac{m_A(m_B + m_C)}{m_A + m_B + m_C} = \frac{2\times 6}{8} = 1.5\ \text{kg}
$$

相对动能全部变成弹簧势能时，

$$
E_{pm} = \frac12\mu u^2 = \frac12\times 1.5\times 4^2 = 12\ \text{J}
$$

和上面相同。式子里没有 $k$，所以最大弹性势能确实与劲度系数无关。

碰撞本身损失的机械能（能量账本要用，不是所求）：

$$
Q = \frac12\cdot\frac{m_B m_C}{m_B + m_C}\,v^2 = \frac12\times\frac{2\times 4}{6}\times 6^2 = 24\ \text{J}
$$

出发时动能是 $\dfrac12(m_A + m_B)v^2 = 72\ \text{J}$。碰后剩下 $72 - 24 = 48\ \text{J}$，与 $E_k'$ 一致。

容易算错的两处：

- 碰撞瞬间就把 A、B、C 合成一个整体，得到 $3\ \text{m/s}$。这个数是后来共速时的速度；碰后瞬间 A 仍是 $6\ \text{m/s}$，B、C 是 $2\ \text{m/s}$。若认为一碰就已经共速，弹性势能会被算成 $0$。
- 用出发时的 $72\ \text{J}$ 直接减去共速动能 $36\ \text{J}$，得到 $36\ \text{J}$。这样把碰撞损失的 $24\ \text{J}$ 也算进了弹簧。完全非弹性碰撞的损失发生在粘合瞬间，此后机械能才守恒。

## 三、交互演示

滑块上的质量、初速度是题目数据。劲度系数题目未给，初始放在 $6\ \text{N/m}$。只改 $k$ 时，共速和最大弹性势能都不变，变的是压缩量和到达最大势能的时刻。改质量或初速度后，侧栏按同一套公式重算，答案卡片会提示已经离开题目数据。

<Param name="mA" label="A 的质量" symbol="m_A" value={2} min={1} max={3} step={0.5} unit="kg" />

<Param name="mB" label="B 的质量" symbol="m_B" value={2} min={1} max={3} step={0.5} unit="kg" />

<Param name="mC" label="C 的质量" symbol="m_C" value={4} min={2} max={6} step={0.5} unit="kg" />

<Param name="v0" label="A、B 的初速度" symbol="v" value={6} min={3} max={8} step={0.5} unit="m/s" color="velocity" />

<Param name="k" label="劲度系数（题目未给）" symbol="k" value={6} min={2} max={30} step={0.5} unit="N/m" color="field" />

<Param name="t" label="时间" value={0} min={0} max={12} step={0.01} unit="s" hidden />

<Define name="wA" expr="0.8" />

<Define name="wB" expr="0.8" />

<Define name="wC" expr="1.2" />

<Define name="gap" expr="2.4" />

<Define name="g" expr="10" />

<Define name="vStick" expr="mB*v0/(mB + mC)" />

<Define name="vCm" expr="(mA + mB)*v0/(mA + mB + mC)" />

<Define name="vRel" expr="v0 - vStick" />

<Define name="mu" expr="mA*(mB + mC)/(mA + mB + mC)" />

<Define name="omega" expr="sqrt(k/mu)" />

<Define name="amp" expr="vRel/omega" />

<Define name="L0" expr="amp + 2" />

<Define name="Tosc" expr="2*pi/omega" />

<Define name="vAstar" expr="vCm" />

<Define name="EpMax" expr="0.5*mu*vRel^2" />

<Define name="Qcol" expr="0.5*mB*mC/(mB + mC)*v0^2" />

<Motion name="sys" state={{xA: 0, vA: "v0", xB: "L0", vB: "v0", xC: "L0 + wB + gap", vC: 0, stuck: 0}}
  rates={{
    xA: "vA",
    vA: "k*(xB - xA - L0)/mA",
    xB: "vB",
    vB: "stuck < 0.5 ? -k*(xB - xA - L0)/mB : -k*(xB - xA - L0)/(mB + mC)",
    xC: "stuck < 0.5 ? vC : vB",
  }}
  until={12}
  events={[
    {name: "tHit", when: "stuck < 0.5 ? xB + wB - xC : 1", dir: "up", set: {vB: "(mB*vB + mC*vC)/(mB + mC)", xC: "xB + wB", stuck: 1}},
    {name: "tSame", when: "stuck < 0.5 ? 1 : vA - vB", dir: "down"},
  ]}
/>

<Define name="tShow" expr="tHit + Tosc + 0.35" />

<Define name="xAn" expr="sys.xA(t)" />

<Define name="xBn" expr="sys.xB(t)" />

<Define name="vAn" expr="sys.vA(t)" />

<Define name="vBn" expr="sys.vB(t)" />

<Define name="vCn" expr="sys.stuck(t) > 0.5 ? sys.vB(t) : sys.vC(t)" />

<Define name="xi" expr="xBn - xAn - L0" />

<Define name="Ep" expr="0.5*k*xi^2" />

<Define name="Fs" expr="-k*xi" />

<Define name="Qnow" expr="t >= tHit ? Qcol : 0" />

<Define name="mRight" expr="sys.stuck(t) > 0.5 ? mB + mC : mB" />

<Question text="(1) 当弹簧的弹性势能最大时，物块 A 的速度多大？" set={{t: "tSame"}} hint="此时 A 与粘在一起的 B、C 速度相同，都等于质心速度" />

<Question text="(2) 弹簧弹性势能的最大值是多少？" set={{t: "tSame"}} hint="碰撞之后机械能守恒：最大弹性势能等于碰后动能减去共速动能" />

<Preset label="出发" set={{t: 0}} />

<Preset label="B、C 刚粘上" set={{t: "tHit"}} />

<Preset label="弹性势能最大" set={{t: "tSame"}} />

<Preset label="回到题目数据" set={{mA: 2, mB: 2, mC: 4, v0: 6, k: 6, t: 0}} />

<Status cases={[
  {when: "t < tHit - 0.02", label: "碰撞前：A、B 同速，弹簧为原长", tone: "neutral"},
  {when: "t < tHit + 0.02", label: "B 与 C 碰撞并粘在一起", tone: "warning"},
  {when: "t < tSame - 0.03", label: "弹簧压缩，势能增加", tone: "info"},
  {when: "t < tSame + 0.03", label: "三者速度相同，弹性势能最大", tone: "success"},
  {when: "xi < -0.05", label: "已过压缩最甚，弹簧正在恢复", tone: "info"},
  {when: "xi > 0.05", label: "弹簧被拉长", tone: "info"},
  {label: "弹簧经过原长", tone: "neutral"},
]} />

<Readout items={[
  {label: "A 的速度", symbol: "v_A", expr: "vAn", unit: "m/s", digits: 2, color: "velocity"},
  {label: "B 的速度", symbol: "v_B", expr: "vBn", unit: "m/s", digits: 2, color: "velocity"},
  {label: "C 的速度", symbol: "v_C", expr: "vCn", unit: "m/s", digits: 2, color: "velocity"},
  {label: "弹性势能", symbol: "E_p", expr: "Ep", unit: "J", digits: 2, color: "field"},
  {label: "最大压缩量", symbol: "A", expr: "amp", unit: "m", digits: 2, color: "field"},
  {label: "共速（势能最大时）", symbol: "v_c", expr: "vAstar", unit: "m/s", digits: 2, color: "velocity"},
  {label: "势能最大值", symbol: "E_{pm}", expr: "EpMax", unit: "J", digits: 2, color: "field"},
]} />

<Answer items={[
  {label: "势能最大时 A 的速度", symbol: "v_A", expr: "vAstar", value: 3, unit: "m/s", digits: 2},
  {label: "弹性势能最大值", symbol: "E_{pm}", expr: "EpMax", value: 12, unit: "J", digits: 2},
]} />

播放后先看到 A、B 带着原长弹簧匀速向右，C 静止。频闪点每隔 $0.25\ \text{s}$ 一个：碰撞前 A 与 B 的点间距相同。B 碰到 C 后二者粘住，B 的速度突然变成 $v_1$，A 的速度不变。随后弹簧被压缩，A 的点变密，B 的点变疏，直到间距再次相同——这就是弹性势能最大的时刻。弹簧两端的弹力箭头等长、反向，是系统内力，不改变总动量。

<Sim
  title="A、B 用弹簧相连，B 与静止的 C 粘合"
  height={360}
  duration="tShow"
  time="t"
  params={["sys", "wA", "wB", "wC", "L0", "k", "tHit", "tSame"]}
  hud={[
    {symbol: "v_A", expr: "vAn", unit: "m/s", digits: 2},
    {symbol: "E_p", expr: "Ep", unit: "J", digits: 2},
    {symbol: "Δl", expr: "xi", unit: "m", digits: 2},
  ]}
  legend={[
    {kind: "velocity", symbol: "v", label: "速度"},
    {kind: "force", symbol: "F", label: "弹簧弹力"},
    {kind: "strobe", label: "每 0.25 s 的位置"},
  ]}
  note="Δl = L − L_0，压缩为负。k、原长和初始空隙都不是题目数据；原长取成最大压缩量加 2 m。所求的速度和最大弹性势能与这三个量无关。物块宽度只为看清接触。"
  marks={[
    {t: 0, label: "出发"},
    {t: "tHit", label: "B、C 粘合", color: "force"},
    {t: "tSame", label: "势能最大", color: "field"},
  ]}
>
sim({
  at(t, p) {
    return p.sys.state(t)
  },
  draw(ctx, s, v) {
    const p = v.p
    const h = 0.72
    const left = s.xA - p.wA
    const right = Math.max(s.xC + p.wC, s.xB + p.wB)
    const span = Math.max(right - left, 8)
    const half = span / 2 + 1.8
    const xMid = (left + right) / 2
    const m = v.view({
      xmin: xMid - half,
      xmax: xMid + half,
      ymin: -1.45,
      ymax: 2.55,
      pad: 16,
      equal: true,
    })
    const step = half > 9 ? 2 : 1
    const x0 = Math.floor((xMid - half) / step) * step
    const x1 = Math.ceil((xMid + half) / step) * step

    v.ground(m, x0 - step, x1 + step, 0)
    v.axisX(m, { y: -1.1, step, from: x0, to: x1, unit: 'm' })

    v.spring(m, s.xA, 0.34, s.xB, 0.34, { coils: 11 })
    v.block(m, s.xA - p.wA / 2, 0, p.wA, h, { label: 'A' })
    v.block(m, s.xB + p.wB / 2, 0, p.wB, h, { label: 'B' })
    v.block(m, s.xC + p.wC / 2, 0, p.wC, h, { label: 'C' })

    v.strobe(m, (st) => [st.xA - v.p.wA / 2, 0.16], { every: 0.25, r: 2.5 })
    v.strobe(m, (st) => [st.xB + v.p.wB / 2, 0.16], { every: 0.25, r: 2.5 })

    const sc = 0.16
    if (Math.abs(s.vA) > 0.08) {
      v.vec(m, s.xA - p.wA / 2, h + 0.06, s.vA * sc, 0, {
        kind: 'velocity',
        label: 'v_A ' + s.vA.toFixed(2),
      })
    }
    if (Math.abs(s.vB) > 0.08) {
      v.vec(m, s.xB + p.wB / 2, h + 0.06, s.vB * sc, 0, {
        kind: 'velocity',
        label: 'v_B ' + s.vB.toFixed(2),
      })
    }
    const vC = s.stuck > 0.5 ? s.vB : s.vC
    if (Math.abs(vC) > 0.08) {
      v.vec(m, s.xC + p.wC / 2, h + 0.06, vC * sc, 0, {
        kind: 'velocity',
        label: 'v_C ' + vC.toFixed(2),
      })
    }

    const xi = s.xB - s.xA - p.L0
    const Fs = -p.k * xi
    if (Math.abs(Fs) > 0.8) {
      const len = Math.max(-1.35, Math.min(1.35, Fs * 0.055))
      v.vec(m, s.xA, 0.34, -len, 0, { kind: 'force', label: 'F' })
      v.vec(m, s.xB, 0.34, len, 0, { kind: 'force', label: "F'" })
    }

    v.dim(m, s.xA, -0.58, s.xB, -0.58, 'L=' + (s.xB - s.xA).toFixed(2) + ' m')

    if (s.stuck > 0.5) {
      v.label(m, s.xB + p.wB, h, '粘在一起', { place: 'above', color: v.color.graphite, size: 12 })
    }

    v.event(m, s.xB + p.wB * 0.5, h * 0.7, 'B 与 C 粘在一起', { at: p.tHit, kind: 'force' })
    v.event(m, (s.xA + s.xB) / 2, 1.15, '弹性势能最大', { at: p.tSame, kind: 'field' })
  },
})
</Sim>

受力图取 $g = 10\ \text{m/s}^2$，只用来画重力和支持力。二者始终平衡，不进入水平方向的动量和能量。碰撞前右图的质量是 B；粘上之后按 B+C 整体。弹力画在真实方向上。

<ForceDiagram
  title="物块 A"
  size="narrow"
  surface={{type: "ground"}}
  body={{shape: "block", label: "A"}}
  mass="mA"
  accel={{angle: 180, solve: "aA"}}
  forces={[
    {label: "G_A", angle: -90, magnitude: "mA*g"},
    {label: "N_A", angle: 90, solve: "NA"},
    {label: "F", angle: "Fs >= 0 ? 180 : 0", magnitude: "abs(Fs)", showValue: true, unit: "N", digits: 1},
  ]}
/>

<ForceDiagram
  title="B（粘上 C 后按整体）"
  size="narrow"
  surface={{type: "ground"}}
  body={{shape: "block", label: "B"}}
  mass="mRight"
  accel={{angle: 0, solve: "aBC"}}
  forces={[
    {label: "G", angle: -90, magnitude: "mRight*g"},
    {label: "N", angle: 90, solve: "NB"},
    {label: "F'", angle: "Fs >= 0 ? 0 : 180", magnitude: "abs(Fs)", showValue: true, unit: "N", digits: 1},
  ]}
/>

## 四、结合图像理解关键时刻

速度图里，碰撞前 A、B 重合在 $6\ \text{m/s}$，C 在 $0$。粘合瞬间 B、C 的速度合成 $2\ \text{m/s}$，A 的曲线不断开。此后 B 与 C 的曲线重合，并和 A 一起走向虚线 $v_c = 3\ \text{m/s}$。三条速度线第一次会合，就是弹性势能最大。

阴影是碰撞后到这一时刻、A 与 B 的速度曲线之间的面积，等于弹簧的压缩量。题目数据、演示取的 $k = 6\ \text{N/m}$ 下，约化质量 $\mu = 1.5\ \text{kg}$，

$$
\omega = \sqrt{\frac{k}{\mu}} = \sqrt{\frac{6}{1.5}} = 2\ \text{rad/s}
$$

从平衡位置以相对速度 $4\ \text{m/s}$ 压弹簧，压缩量 $A = u/\omega = 2\ \text{m}$，所用时间是四分之一个周期 $\pi/4 \approx 0.79\ \text{s}$（进度条上「势能最大」在相撞之后约 $0.79\ \text{s}$）。这只是 $k = 6\ \text{N/m}$ 的验算：$\dfrac12 k A^2 = \dfrac12\times 6\times 2^2 = 12\ \text{J}$，与前面不依赖 $k$ 的结果相同。把 $k$ 调大，阴影变窄、会合提前，峰值 $12\ \text{J}$ 和虚线 $3\ \text{m/s}$ 不动。

<Plot
  title="速度—时间：三条线会合时弹性势能最大"
  caption="阴影面积等于从相撞到第一次共速的弹簧压缩量。碰撞后 B 与 C 的速度曲线重合。"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "tShow"}}
  y={{label: "v", unit: "m/s", min: -6, max: 10}}
  series={[
    {label: "A", expr: "sys.vA(s)", color: "velocity"},
    {label: "B", expr: "sys.vB(s)", color: "ink"},
    {label: "C", expr: "sys.stuck(s) > 0.5 ? sys.vB(s) : sys.vC(s)", color: "graphite"},
    {label: "共同速度", expr: "vCm", color: "steel", dash: true},
  ]}
  areas={[
    {series: 0, to: 1, from: "tHit", until: "tSame", label: "压缩量", color: "field"},
  ]}
  marks={[
    {x: "tHit", series: 1, label: "B、C 粘合"},
    {x: "tSame", series: 0, label: "速度相同，势能最大"},
  ]}
  cursor="t"
/>

势能曲线在相撞前贴着零。相撞后每半个周期达到一次同一个最大值：第一次是压缩最甚，再过半个周期是伸长最甚。两次 A 的速度都等于 $v_c$。

<Plot
  title="弹性势能随时间变化"
  caption="压缩最甚和伸长最甚的峰值相同，都等于 E_pm。虚线不随时刻改变。"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "tShow"}}
  y={{label: "E_p", unit: "J", min: 0}}
  series={[
    {label: "弹性势能", expr: "0.5*k*(sys.xB(s) - sys.xA(s) - L0)^2", color: "field"},
    {label: "最大值", expr: "EpMax", color: "steel", dash: true},
  ]}
  marks={[
    {x: "tHit", label: "碰撞"},
    {x: "tSame", series: 0, label: "第一次达到最大"},
  ]}
  cursor="t"
/>

能量账本按出发时的 $72\ \text{J}$ 归一。相撞的那一刻，有 $24\ \text{J}$ 变成内能，以后这一格不再变化。剩下的 $48\ \text{J}$ 在动能和弹性势能之间来回转移：势能最大时，弹性势能是 $12\ \text{J}$，三块物块的动能合计是 $36\ \text{J}$。

<Ledger
  title="能量去向"
  unit="J"
  digits={1}
  parts={[
    {label: "A 的动能", symbol: "E_{kA}", expr: "0.5*mA*vAn^2", color: "velocity"},
    {label: "B、C 的动能", symbol: "E_{kBC}", expr: "0.5*mB*vBn^2 + 0.5*mC*vCn^2", color: "ink"},
    {label: "弹性势能", symbol: "E_p", expr: "Ep", color: "field"},
    {label: "碰撞产生的内能", symbol: "Q", expr: "Qnow", color: "force"},
  ]}
  rows={[
    {label: "出发", at: {t: 0}},
    {label: "刚粘上", at: {t: "tHit"}},
    {label: "势能最大", at: {t: "tSame"}},
    {label: "此刻"},
  ]}
  total={{label: "出发时动能", symbol: "E_0", expr: "0.5*(mA + mB)*v0^2"}}
/>

## 五、答案汇总

| 问题 | 答案 |
|---|---|
| （1）弹性势能最大时 A 的速度 | $3\ \text{m/s}$ |
| （2）弹性势能的最大值 | $12\ \text{J}$ |
