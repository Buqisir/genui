---
id: gd23-13
title: 气泡的膨胀与收缩
source: 2023 广东卷 第 13 题（计算）
question: 在驻波声场作用下，水中小气泡周围液体的压强会发生周期性变化，使小气泡周期性膨胀和收缩，气泡内气体可视为质量不变的理想气体，其膨胀和收缩过程可简化为如图所示的 p–V 图像，气泡内气体先从压强为 p_0、体积为 V_0、温度为 T_0 的状态 A 等温膨胀到体积为 5V_0、压强为 p_B 的状态 B，然后从状态 B 绝热收缩到体积为 V_0、压强为 1.9p_0、温度为 T_C 的状态 C，B 到 C 过程中外界对气体做功为 W．已知 p_0、V_0、T_0 和 W．求：（1）p_B 的表达式；（2）T_C 的表达式；（3）B 到 C 过程，气泡内气体的内能变化了多少？
answers:
  - { name: pB, value: 20000, unit: Pa }
  - { name: TC, value: 570, unit: K }
  - { name: dU, value: 0.2256735, unit: J }
---

水中小气泡在驻波声场里周期性膨胀和收缩。气泡内气体质量不变，视为理想气体，过程由两段组成。

| 状态 | 压强 | 体积 | 温度 |
|---|---|---|---|
| A | $p_0$ | $V_0$ | $T_0$ |
| B | $p_B$ | $5V_0$ | $T_0$ |
| C | $1.9p_0$ | $V_0$ | $T_C$ |

A → B 是等温膨胀：体积从 $V_0$ 增到 $5V_0$，温度不变。B → C 是绝热收缩：体积从 $5V_0$ 压回 $V_0$，压强升到 $1.9p_0$，外界对气体做功 $W$。

题目只给字母。下面取代表性数值：$p_0 = 1.0\times 10^5\,\mathrm{Pa}$、$V_0 = 1.0\times 10^{-6}\,\mathrm{m^3}$（$1\,\mathrm{cm^3}$）、$T_0 = 300\,\mathrm{K}$。绝热指数由 $p_B(5V_0)^\gamma = 1.9p_0 V_0^\gamma$ 定出，并按它把 $W$ 取成 $0.2257\,\mathrm{J}$。换一组数值，三个答案对 $p_0$、$T_0$、$W$ 的比值不变。气泡画成球，半径按体积的立方根取，不按比例。

## 完整解答

### （1）状态 B 的压强

A → B 温度不变，质量不变，玻意耳定律 $p_A V_A = p_B V_B$：

$$
p_0 V_0 = p_B \cdot 5V_0
\quad\Rightarrow\quad
p_B = \frac{p_0}{5}
= \boxed{\dfrac{p_0}{5}}.
$$

代表性数值下 $p_B = 2.0\times 10^4\,\mathrm{Pa}$。体积扩大到 5 倍，压强降到原来的 $\dfrac{1}{5}$。

### （2）状态 C 的温度

B → C 与 A → B 没有热交换关系，温度只能由状态方程比。状态 C 和状态 A 体积都是 $V_0$，质量不变，查理定律 $\dfrac{pV}{T}$ 为常数：

$$
\frac{p_0 V_0}{T_0} = \frac{1.9\,p_0 \cdot V_0}{T_C}
\quad\Rightarrow\quad
T_C = 1.9\,T_0
= \boxed{1.9\,T_0}.
$$

代表性数值下 $T_C = 570\,\mathrm{K}$。体积回到原来，压强变成 $1.9$ 倍，温度也变成 $1.9$ 倍。

### （3）B 到 C 的内能变化

绝热过程与外界没有热量交换，$Q = 0$。热力学第一定律取气体对外做功为正：$\Delta U = Q - W_\text{对外} = W_\text{外界}$。题目的 $W$ 就是外界对气体做的功，所以

$$
\Delta U = W = \boxed{W}.
$$

内能增加了 $W$。代表性数值下增加 $0.2257\,\mathrm{J}$。

用理想气体的内能只由温度决定来核对。由 $p_B(5V_0)^\gamma = 1.9p_0 V_0^\gamma$ 得 $5^{\gamma-1} = 1.9$，定容摩尔热容满足 $\dfrac{C_V}{nR} = \dfrac{1}{\gamma-1}$。B → C 温度从 $T_0$ 到 $1.9T_0$，

$$
\Delta U = \frac{1}{\gamma-1}\,\frac{p_0 V_0}{T_0}\,(1.9T_0 - T_0) = \frac{0.9}{\gamma-1}\,p_0 V_0.
$$

它与上面取的 $W$ 相等，两种算法一致。

## 交互演示

拖动「体积」。体积从 $V_0$ 到 $5V_0$ 走 A → B 的等温膨胀，温度保持 $T_0$；再拖回 $V_0$ 走 B → C 的绝热收缩，温度升到 $1.9T_0$。气泡半径随体积变，分子的疏密和快慢跟着压强和温度。

<Param name="stage" label="过程" value={2} options={[{value: 1, label: "A → B 等温膨胀"}, {value: 2, label: "B → C 绝热收缩"}]} />

<Param name="Vol" label="气泡体积" symbol="V" value={1} min={1} max={5} step={0.05} unit="V_0" color="field" />

<Param name="p0" label="初态压强" symbol="p_0" value={100000} hidden unit="Pa" />

<Param name="V0" label="初态体积" symbol="V_0" value={0.000001} hidden unit="m^3" />

<Param name="T0" label="初态温度" symbol="T_0" value={300} hidden unit="K" />

<Param name="W" label="外界对气体做功" value={0.2256735} hidden unit="J" />

<Define name="pB" expr="p0/5" />

<Define name="TC" expr="1.9*T0" />

<Define name="dU" expr="W" />

<Define name="gamma" expr="1 + log(1.9)/log(5)" />

<Define name="pNow" expr="stage == 1 ? p0/Vol : pB*pow(5/Vol, gamma)" />

<Define name="TNow" expr="stage == 1 ? T0 : T0*pow(5/Vol, gamma - 1)" />

<Define name="Viso" expr="stage == 1 ? Vol : 5" />

<Define name="Vadi" expr="stage == 2 ? Vol : 1" />

<Question text="p_B 的表达式是什么？" set={{stage: 1, Vol: 5}} hint="等温膨胀到 5V_0，压强降到 p_0/5" />

<Question text="T_C 的表达式是什么？" set={{stage: 2, Vol: 1}} hint="体积回到 V_0，压强是 1.9p_0，温度按 pV/T 比到 1.9T_0" />

<Question text="B 到 C 气体的内能变化了多少？" set={{stage: 2, Vol: 1}} hint="绝热，Q = 0，内能增加量等于外界对气体做的功 W" />

<Preset label="状态 A：p_0、V_0、T_0" set={{stage: 1, Vol: 1}} />

<Preset label="状态 B：p_0/5、5V_0" set={{stage: 1, Vol: 5}} />

<Preset label="状态 C：1.9p_0、V_0、1.9T_0" set={{stage: 2, Vol: 1}} />

<Status cases={[
  {when: "stage == 1 and abs(Vol - 1) < 0.02", label: "状态 A：p_0、V_0、T_0", tone: "info"},
  {when: "stage == 1 and abs(Vol - 5) < 0.02", label: "状态 B：等温膨胀终点，压强 p_0/5", tone: "success"},
  {when: "stage == 1", label: "A → B：等温膨胀，温度保持 T_0", tone: "neutral"},
  {when: "stage == 2 and abs(Vol - 5) < 0.02", label: "状态 B：绝热收缩刚开始", tone: "info"},
  {when: "stage == 2 and abs(Vol - 1) < 0.02", label: "状态 C：内能比状态 B 增加了 W", tone: "success"},
  {label: "B → C：绝热收缩，温度随着体积减小而升高", tone: "neutral"}
]} />

<Readout items={[
  {label: "气泡压强", symbol: "p", expr: "pNow", unit: "Pa", format: "sci", color: "force"},
  {label: "气泡温度", symbol: "T", expr: "TNow", unit: "K", digits: 0, color: "field"},
  {label: "状态 B 的压强", symbol: "p_B", expr: "pB", unit: "Pa", format: "sci", color: "force"},
  {label: "状态 C 的温度", symbol: "T_C", expr: "TC", unit: "K", digits: 0, color: "field"},
  {label: "B → C 内能增加", symbol: "ΔU", expr: "dU", unit: "J", digits: 4, color: "velocity"}
]} />

<Answer items={[
  {label: "状态 B 的压强", symbol: "p_B", text: "p_0/5", expr: "pB", value: 20000, unit: "Pa", format: "sci"},
  {label: "状态 C 的温度", symbol: "T_C", text: "1.9 T_0", expr: "TC", value: 570, unit: "K", digits: 0},
  {label: "B → C 内能变化", symbol: "ΔU", text: "增加 W", expr: "dU", value: 0.2256735, unit: "J", digits: 4}
]} />

<Figure title="水中的小气泡" size="narrow" height={420} params={["Vol", "pNow", "p0", "TNow", "T0", "stage"]} note="气泡半径按体积的立方根取，不按比例；分子个数固定，疏密跟压强，快慢跟温度" hud={[{symbol: "p", label: "压强", expr: "pNow", unit: "Pa", format: "sci"}, {symbol: "T", label: "温度", expr: "TNow", unit: "K", digits: 0}]} legend={[{kind: "force", label: "气体压强"}, {kind: "field", label: "温度"}]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2.5, xmax: 2.5, ymin: -0.55, ymax: 3.35, equal: true })
    const r = 0.78 * Math.pow(p.Vol, 1 / 3)
    const cy = r + 0.12
    v.vessel(m, [
      { flask: { cx: 0, cy: cy, r: r, neck: { w: 0.001, h: 0.001 }, open: false } },
    ], {
      fills: [
        { kind: 'gas', x1: -r, x2: r, y1: cy - r, y2: cy + r, density: p.pNow / p.p0, temp: p.TNow / p.T0, count: 26 },
      ],
    })
    const tag = p.stage == 1 ? (p.Vol > 4.95 ? 'B' : 'A → B') : (p.Vol < 1.05 ? 'C' : 'B → C')
    v.label(m, 0, cy + r + 0.35, tag)
    v.dim(m, -r, cy - r - 0.45, r, cy - r - 0.45, '2r')
  },
})
</Figure>

<Plot title="p–V 图像" size="wide" caption="A → B 等温，下凸；B → C 绝热，上凸得更徒"
  x={{label: "V", unit: "V_0", min: 0, max: 6}}
  y={{label: "p", unit: "p_0", min: 0, max: 2.3}}
  series={[
    {
      label: "等温",
      x: "u",
      expr: "1/u",
      over: {name: "u", min: 1, max: 5},
      color: "velocity",
      point: "Viso"
    },
    {
      label: "绝热",
      x: "u",
      expr: "(1/5)*pow(5/u, gamma)",
      over: {name: "u", min: 1, max: 5},
      color: "force",
      point: "Vadi"
    }
  ]}
  marks={[
    {x: 1, series: 0, label: "A：p_0、V_0"},
    {x: 5, series: 0, label: "B：p_0/5、5V_0"},
    {x: 1, series: 1, label: "C：1.9p_0、V_0"}
  ]}
/>

<Ledger title="B → C 的能量" size="narrow" unit="J" digits={4}
  caption="绝热，吸放热都是 0；外界做的功全部变成内能"
  parts={[
    {label: "内能增加", symbol: "ΔU", expr: "stage == 2 ? dU*(5 - Vol)/4 : 0", color: "velocity"},
    {label: "吸放热", symbol: "Q", expr: "0", color: "field"}
  ]}
  rows={[
    {label: "状态 B", at: {stage: 2, Vol: 5}},
    {label: "此刻"},
    {label: "状态 C", at: {stage: 2, Vol: 1}}
  ]}
  total={{label: "外界做功", symbol: "W", expr: "W"}}
/>

<GasBox title="气泡里的分子" size="wide" T="TNow" gas="N2" count={60} theory={false} note="气泡内气体按空气取双原子分子；温度升高时分布整体右移" />

## 结合图像看

等温线从 A 到 B 向下弯。游标在等温线上时，体积从 $V_0$ 拖到 $5V_0$，压强从 $p_0$ 降到 $p_0/5$，乘积不变。气泡变大，分子变稀，温度仍是 $T_0$。

绝热线从 B 到 C 向上弯，比等温线更徒：同一体积下，绝热收缩的压强高于等温压缩。体积拖回 $V_0$ 时游标落在 C，压强 $1.9p_0$、温度 $1.9T_0$，正好在 A 的正上方。

能量账本的三行对应状态 B、此刻和状态 C。绝热过程吸放热始终为 0，内能增加量从 0 涨到 $W$，与外界对气体做的功相等。

## 答案

$p_B = \boxed{\dfrac{p_0}{5}}$，$T_C = \boxed{1.9\,T_0}$，B 到 C 过程气体内能增加 $\boxed{W}$。
