---
id: r5-06-spring-abc
title: 碰后粘连：弹簧弹性势能的最大值
subject: physics
topic: 动量守恒与能量
source: 选必1 模块备考卷 16 题（14 分）
question: |
  用轻质弹簧相连的质量均为 2 kg 的 A、B 两物块都以 v=6 m/s 的速度在光滑的水平地面上向右运动，弹簧处于原长（A 在左、B 在右），质量为 4 kg 的物块 C 静止于 B 的前方。B 与 C 碰撞后二者粘在一起运动，求：
  (1) 当弹簧的弹性势能最大时，物块 A 的速度多大？
  (2) 弹簧弹性势能的最大值是多少？
answers:
  - { name: vA1, value: 3, unit: m/s }
  - { name: EpMax, value: 12, unit: J }
---

## 一、题目条件分析

- 水平面光滑，弹簧轻质。A、B 质量均为 $m = 2\ \text{kg}$，开始时都以 $v = 6\ \text{m/s}$ 向右匀速运动，弹簧处于原长，A 在左、B 在右。
- C 的质量 $M = 4\ \text{kg}$，静止在 B 的前方。B 与 C 碰撞后粘在一起，是完全非弹性碰撞。
- 碰撞时间极短，弹簧的冲量可以忽略：碰撞瞬间只在 B、C 之间交换动量，A 的速度还来不及变。
- 题目没有给劲度系数，也没有给 B、C 一开始相距多远。所求的两个量都与 $k$、间距无关。下面的演示取 $k = 24\ \text{N/m}$、弹簧原长时 A 与 B 中心相距 $3\ \text{m}$、C 在接触位置前方 $1.2\ \text{m}$，只用来把过程演出来。

## 二、完整解答

### （1）弹性势能最大时 A 的速度

B、C 碰撞，动量守恒，向右为正：

$$
m v = (m + M) v_1
$$

$$
2 \times 6 = (2 + 4)\, v_1 \quad\Rightarrow\quad v_1 = \boxed{2\ \text{m/s}}
$$

（这个 $2\ \text{m/s}$ 是粘连后 B、C 共同的速度，还不是第（1）问的答案。）

碰撞后瞬间：A 仍以 $6\ \text{m/s}$ 向右，B、C 以 $2\ \text{m/s}$ 向右。A 比 B 快，弹簧被压缩。此后系统不受水平外力，总动量守恒。A、B、C 的总动量就是碰撞前 A、B 的动量（C 原来静止）：

$$
(m + m)\, v = (2m + M)\, v_{\text{共}}
$$

$$
v_{\text{共}} = \frac{4 \times 6}{8} = 3\ \text{m/s}
$$

弹簧弹性势能最大，出现在压缩最甚和伸长最甚这两个时刻。这两个时刻相对速度都为零，A 与粘在一起的 B、C 速度相同，只能等于质心速度：

$$
v_A = v_{\text{共}} = \boxed{3\ \text{m/s}}
$$

### （2）弹性势能的最大值

碰撞是完全非弹性的，机械能在碰撞瞬间有损失，不能从碰前一直守恒到后来。损失为

$$
\Delta E = \tfrac12 m v^2 - \tfrac12 (m + M) v_1^2 = \tfrac12 \times 2 \times 6^2 - \tfrac12 \times 6 \times 2^2 = 24\ \text{J}
$$

碰撞之后，只有弹簧弹力做功，A 与（B+C）的机械能守恒。刚碰完时弹性势能为零，动能

$$
E_k = \tfrac12 m v^2 + \tfrac12 (m + M) v_1^2 = \tfrac12 \times 2 \times 36 + \tfrac12 \times 6 \times 4 = 48\ \text{J}
$$

势能最大时三者都以 $3\ \text{m/s}$ 运动，动能

$$
E_k' = \tfrac12 (2m + M)\, v_{\text{共}}^2 = \tfrac12 \times 8 \times 9 = 36\ \text{J}
$$

$$
E_{p,\max} = E_k - E_k' = \boxed{12\ \text{J}}
$$

用相对运动核对：折合质量

$$
\mu = \frac{m(m + M)}{2m + M} = \frac{2 \times 6}{8} = 1.5\ \text{kg}
$$

刚碰完的相对速度 $v - v_1 = 4\ \text{m/s}$，相对动能全部变成最大弹性势能：

$$
E_{p,\max} = \tfrac12 \mu (v - v_1)^2 = \tfrac12 \times 1.5 \times 16 = 12\ \text{J}
$$

压缩最甚和伸长最甚各出现一次，两次的 $E_p$ 同为这个最大值，A 的速度也都是 $3\ \text{m/s}$。

> **易错点**：碰撞粘连时机械能不守恒，不能对 B、C 按弹性碰撞算速度。势能最大也不是“A 停下”的时刻——那时弹簧还在继续压缩或伸长，A 仍有加速度，只是三者速度碰巧相同。

## 三、交互演示

<Question text="（1）弹簧弹性势能最大时，物块 A 的速度多大？" set={{t: "tComp"}} hint="先处理 B、C 的完全非弹性碰撞，再对 A、B、C 用动量守恒：势能最大时相对速度为零" />

<Question text="（2）弹簧弹性势能的最大值是多少？" set={{t: "tComp"}} hint="碰撞有机械能损失；损失算完之后，A 与粘连体的机械能才守恒" />

<Param name="v0" label="A、B 的初速度 v" symbol="v" color="velocity" value={6} min={3} max={8} step={0.5} unit="m/s" />

<Param name="k" label="劲度系数 k（题目未给）" symbol="k" color="field" value={24} min={12} max={48} step={1} unit="N/m" />

<Param name="t" label="时间" value={0} min={0} max={20} step={0.01} unit="s" hidden />

<Param name="L0" label="原长时 A、B 中心距离" value={3} min={3} max={3} step={0.1} unit="m" hidden />

<Param name="w" label="物块宽度" value={0.5} min={0.5} max={0.5} step={0.1} unit="m" hidden />

<Param name="gap" label="开始时 B 与 C 的空隙" value={1.2} min={1.2} max={1.2} step={0.1} unit="m" hidden />

<Define name="mA" expr="2" />

<Define name="mB" expr="2" />

<Define name="mC" expr="4" />

<Define name="vBC" expr="mB * v0 / (mB + mC)" />

<Define name="vcm" expr="(mA + mB) * v0 / (mA + mB + mC)" />

<Define name="mu" expr="mA * (mB + mC) / (mA + mB + mC)" />

<Define name="vA1" expr="vcm" />

<Define name="EpMax" expr="0.5 * mu * (v0 - vBC)^2" />

<Motion name="spr" until="gap/v0 + 2*pi*sqrt(mA*(mB+mC)/(k*(mA+mB+mC))) + 1" steps={4000}
  state={{xA: 0, vA: "v0", xB: "L0", vB: "v0", xC: "L0 + w + gap", vC: 0, stuck: 0}}
  rates={{
    xA: "vA",
    vA: "k*((xB - xA) - L0)/mA",
    xB: "vB",
    vB: "-k*((xB - xA) - L0)/(mB + stuck*mC)",
    xC: "vC",
    vC: "-stuck*k*((xB - xA) - L0)/(mB + mC)"
  }}
  events={[
    {name: "tHit", when: "(1 - stuck)*(xB + w - xC) - stuck", dir: "up", set: {vB: "(mB*vB + mC*vC)/(mB + mC)", vC: "(mB*vB + mC*vC)/(mB + mC)", xC: "xB + w", stuck: 1}},
    {name: "tComp", when: "vA - vB - (1 - stuck)*100", dir: "down"},
    {name: "tExt", when: "vA - vB + (1 - stuck)*100", dir: "up"}
  ]} />

<Define name="EkA" expr="0.5*mA*spr.vA(t)^2" />

<Define name="EkB" expr="0.5*mB*spr.vB(t)^2" />

<Define name="EkC" expr="0.5*mC*spr.vC(t)^2" />

<Define name="Ep" expr="0.5*k*(spr.xB(t) - spr.xA(t) - L0)^2" />

<Define name="E0" expr="0.5*(mA + mB)*v0^2" />

<Define name="Q" expr="E0 - EkA - EkB - EkC - Ep" />

<Status cases={[
  {when: "abs(t - tComp) < 0.03 or abs(t - tExt) < 0.03", label: "三者共速，弹性势能最大", tone: "success"},
  {when: "t < tHit", label: "B 接近 C，弹簧仍为原长", tone: "neutral"},
  {when: "t < tComp", label: "已粘连，弹簧正在被压缩", tone: "info"},
  {when: "t < tExt", label: "经过原长后弹簧转为伸长", tone: "warning"},
  {label: "弹簧回缩，势能下降", tone: "neutral"}
]} />

<Preset label="B、C 刚粘连" set={{t: "tHit"}} />

<Preset label="压缩最甚" set={{t: "tComp"}} />

<Preset label="伸长最甚" set={{t: "tExt"}} />

<Readout items={[
  {label: "A 的速度", symbol: "v_A", expr: "spr.vA(t)", unit: "m/s", digits: 2, color: "velocity"},
  {label: "B 的速度", symbol: "v_B", expr: "spr.vB(t)", unit: "m/s", digits: 2, color: "ink"},
  {label: "C 的速度", symbol: "v_C", expr: "spr.vC(t)", unit: "m/s", digits: 2, color: "graphite"},
  {label: "弹性势能", symbol: "E_p", expr: "Ep", unit: "J", digits: 2, color: "field"},
  {label: "势能最大时 A 的速度", symbol: "v_A", expr: "vA1", unit: "m/s", digits: 2, color: "velocity"},
  {label: "弹性势能最大值", symbol: "E_{p,max}", expr: "EpMax", unit: "J", digits: 2, color: "field"}
]} />

拖动 $k$：达到势能最大的时刻会变，压缩、伸长的幅度也会变，但 $v_A = 3\ \text{m/s}$、$E_{p,\max} = 12\ \text{J}$ 不动。拖动初速度，这两个答案才跟着变。播放时镜头跟随物块，地面刻度是实验室坐标。

<Sim
  title="A、B 压缩弹簧，B 与 C 粘连后一起运动"
  height={340}
  duration="tExt + 0.45"
  time="t"
  params={["spr", "k", "L0", "w", "v0", "tHit", "tComp", "tExt", "vA1"]}
  hud={[
    {symbol: "v_A", expr: "spr.vA(t)", unit: "m/s", digits: 2},
    {symbol: "E_p", expr: "Ep", unit: "J", digits: 2}
  ]}
  legend={[
    {kind: "velocity", symbol: "v", label: "速度"},
    {kind: "force", symbol: "F", label: "弹簧弹力"},
    {kind: "strobe", label: "中心频闪 0.2 s"}
  ]}
  marks={[
    {t: 0, label: "开始"},
    {t: "tHit", label: "B 与 C 粘连"},
    {t: "tComp", label: "压缩最甚"},
    {t: "tExt", label: "伸长最甚"}
  ]}
  note="k 与初始间距题目未给，画面按所取代表值的真实比例绘制。势能最大时速度相同，弹簧却最紧或最长，加速度并不为零。"
>
sim({
  at(t, p) {
    const s = p.spr.state(t)
    const Fs = p.k * ((s.xB - s.xA) - p.L0)
    return {
      xA: s.xA,
      xB: s.xB,
      xC: s.xC,
      vA: s.vA,
      vB: s.vB,
      vC: s.vC,
      stuck: s.stuck,
      Fs: Fs,
    }
  },
  draw(ctx, s, v) {
    const p = v.p
    const xmin = s.xA - 1.5
    const xmax = s.xC + 1.6
    const m = v.view({ xmin: xmin, xmax: xmax, ymin: -0.85, ymax: 1.85, pad: 16 })
    v.ground(m, xmin - 1, xmax + 1, 0)
    v.axisX(m, { y: -0.48, step: 1, from: Math.ceil(xmin), to: Math.floor(xmax), unit: 'm' })

    const h = 0.42
    const ySpring = h * 0.45
    v.spring(m, s.xA + p.w / 2, ySpring, s.xB - p.w / 2, ySpring, { coils: 10 })
    v.block(m, s.xA, 0, p.w, h, { label: 'A' })
    v.block(m, s.xB, 0, p.w, h, { label: 'B' })
    v.block(m, s.xC, 0, p.w, h, { label: 'C' })

    v.strobe(m, (st) => [st.xA, 0.08], { every: 0.2, r: 2.4 })
    v.strobe(m, (st) => [st.xB, 0.08], { every: 0.2, r: 2.4 })

    const kv = 0.12
    v.vec(m, s.xA, h + 0.06, s.vA * kv, 0, { kind: 'velocity', label: s.vA.toFixed(2) + ' m/s' })
    v.vec(m, s.xB, h + 0.06, s.vB * kv, 0, { kind: 'velocity', label: s.vB.toFixed(2) + ' m/s' })
    if (s.stuck < 0.5) {
      v.vec(m, s.xC, h + 0.06, Math.max(s.vC, 0) * kv + 0.001, 0, { kind: 'velocity', label: '0', min: 0.15 })
    }

    if (Math.abs(s.Fs) > 0.4) {
      v.vec(m, s.xA, ySpring, s.Fs * 0.028, 0, { kind: 'force', label: 'F' })
      v.vec(m, s.xB, ySpring, -s.Fs * 0.028, 0, { kind: 'force', label: 'F' })
    }

    const len = s.xB - s.xA
    v.dim(m, s.xA, -0.22, s.xB, -0.22, '中心距 ' + len.toFixed(2) + ' m')

    v.event(m, (s.xB + s.xC) / 2, h + 0.55, 'B、C 粘连', { at: p.tHit, kind: 'force' })
    v.event(m, (s.xA + s.xB) / 2, 1.35, '压缩最甚，势能最大', { at: p.tComp, kind: 'velocity' })
    v.event(m, (s.xA + s.xB) / 2, 1.35, '伸长最甚，势能再次最大', { at: p.tExt, kind: 'velocity' })
  },
})
</Sim>

<Ledger
  title="能量去向：碰撞损失一次性出现，之后机械能守恒"
  unit="J"
  digits={1}
  parts={[
    {label: "A 的动能", symbol: "E_{kA}", expr: "EkA", color: "velocity"},
    {label: "B 的动能", symbol: "E_{kB}", expr: "EkB", color: "ink"},
    {label: "C 的动能", symbol: "E_{kC}", expr: "EkC", color: "graphite"},
    {label: "弹性势能", symbol: "E_p", expr: "Ep", color: "field"},
    {label: "碰撞损失", symbol: "Q", expr: "Q", color: "force"}
  ]}
  rows={[
    {label: "开始", at: {t: 0}},
    {label: "刚粘连", at: {t: "tHit + 0.002"}},
    {label: "势能最大", at: {t: "tComp"}}
  ]}
  total={{label: "碰前动能", symbol: "E_0", expr: "E0"}}
/>

<Plot
  title="速度：两条水平段之后，三条曲线交于质心速度"
  caption="交点就是弹性势能最大的时刻，A 的速度等于 v_共"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "tExt + 0.45"}}
  y={{label: "v", unit: "m/s", min: 0}}
  series={[
    {label: "A", expr: "spr.vA(s)", color: "velocity"},
    {label: "B", expr: "spr.vB(s)", color: "ink"},
    {label: "C", expr: "spr.vC(s)", color: "graphite"},
    {label: "v_共", expr: "vcm", color: "steel", dash: true}
  ]}
  marks={[
    {x: "tHit", label: "粘连"},
    {x: "tComp", series: 0, label: "压缩最甚"},
    {x: "tExt", series: 0, label: "伸长最甚"}
  ]}
  cursor="t"
/>

<Plot
  title="弹性势能：两个相等的峰"
  caption="峰值与 k 无关；k 只改变峰出现的早晚和弹簧形变的大小"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "tExt + 0.45"}}
  y={{label: "E_p", unit: "J", min: 0}}
  series={[
    {label: "E_p", expr: "0.5*k*(spr.xB(s) - spr.xA(s) - L0)^2", color: "field"},
    {label: "E_{p,max}", expr: "EpMax", color: "steel", dash: true}
  ]}
  marks={[
    {x: "tHit", series: 0, label: "粘连，势能仍为 0"},
    {x: "tComp", series: 0, label: "12 J"},
    {x: "tExt", series: 0, label: "再次 12 J"}
  ]}
  cursor="t"
/>

## 四、结合图像理解关键时刻

- 粘连之前，A、B 的速度曲线重合在 $6\ \text{m/s}$，C 在 $0$；弹性势能一直是零。B 的速度在粘连时刻竖直掉到 $2\ \text{m/s}$，C 同时跳到 $2\ \text{m/s}$，这是动量守恒、机械能不守恒的那一次跳跃。
- 随后 A 减速、B 和 C 加速。三条速度曲线第一次相交时，弹簧最短，$E_p$ 达到 $12\ \text{J}$。相交不等于加速度为零：势能曲线在峰顶，弹力却最大。
- 弹簧回到原长时 $E_p$ 又是零，A 最慢、B 和 C 最快。接着弹簧被拉长，三条速度曲线第二次相交，势能再一次是同一个最大值。
- 把 $k$ 调大，两个峰靠得更近、形变更小，峰高仍落在虚线 $E_{p,\max}$ 上。

## 五、答案汇总

| 问题 | 答案 |
|---|---|
| （1）势能最大时 A 的速度 | $3\ \text{m/s}$ |
| （2）弹性势能的最大值 | $12\ \text{J}$ |

<Answer items={[
  {label: "势能最大时 A 的速度", symbol: "v_A", expr: "vA1", value: 3, unit: "m/s", digits: 2},
  {label: "弹性势能最大值", symbol: "E_{p,max}", expr: "EpMax", value: 12, unit: "J", digits: 2}
]} />
