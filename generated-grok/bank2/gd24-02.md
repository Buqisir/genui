---
id: gd24-02
title: 重离子核反应方程
source: 2024 广东卷 第 2 题（单选，4 分）
question: "我国正在建设的大科学装置——“强流重离子加速器”。其科学目标之一是探寻神秘的“119 号”元素，科学家尝试使用核反应 Y + ^{243}_{95}Am → ^{A}_{119}X + 2 ^{1}_{0}n 产生该元素。关于原子核 Y 和质量数 A，下列选项正确的是（　　）"
choice: C
answers:
  - { name: ZY, value: 24 }
  - { name: AY, value: 54 }
  - { name: A, value: 295 }
---

核反应方程是

$$
\mathrm Y + {}^{243}_{95}\mathrm{Am} \rightarrow {}^{A}_{119}\mathrm X + 2\,{}^{1}_{0}\mathrm n.
$$

每个原子核用两个整数标出来：左上角是质量数（质子数与中子数之和），左下角是电荷数（质子数）。中子 ${}^{1}_{0}\mathrm n$ 的质量数是 1、电荷数是 0，产物里有 2 个。美 ${}^{243}_{95}\mathrm{Am}$ 的质量数是 243、电荷数是 95；新元素原子核 ${}^{A}_{119}\mathrm X$ 的电荷数已经写明是 119，质量数 $A$ 待求。原子核 Y 的两个数都没给出。

核反应中电荷数和质量数分别守恒：反应前各核的电荷数之和等于反应后各核的电荷数之和，质量数也一样。这两条守恒式就能把 Y 和 $A$ 定出来。

## 完整解答

设 Y 的质量数为 $A_\mathrm Y$、电荷数为 $Z_\mathrm Y$。

**电荷数守恒**：

$$
Z_\mathrm Y + 95 = 119 + 2 \times 0 \implies Z_\mathrm Y = \boxed{24}.
$$

电荷数为 24 的元素是铬 $\mathrm{Cr}$，不是电荷数为 26 的铁 $\mathrm{Fe}$。

**质量数守恒**：

$$
A_\mathrm Y + 243 = A + 2 \times 1.
$$

选项里铬的质量数都写成 54，代入得

$$
A = 54 + 243 - 2 = \boxed{295}.
$$

铁的质量数写成 58 时，同一条守恒式给出 $A = 58 + 243 - 2 = 299$。两种情形的差别只在电荷数：铁的电荷数是 26，与美的 95 相加得 121，而右边是 119，多出 2 个电荷数，方程不成立。

逐项判断：

**A. Y 为 ${}^{58}_{26}\mathrm{Fe}$，$A = 299$：错误。** 电荷数 $26 + 95 = 121$，右边只有 $119 + 0 = 119$，左边多 2。质量数 $58 + 243 = 301$、$299 + 2 = 301$ 倒是平衡的，但电荷数不守恒，这个反应不能发生。

**B. Y 为 ${}^{58}_{26}\mathrm{Fe}$，$A = 301$：错误。** 电荷数仍是 $121 \neq 119$。质量数这边也不平衡：左边 $58 + 243 = 301$，右边 $301 + 2 = 303$，右边多 2。这个选项把两个中子的质量数加到了产物 X 上，而不是从入射核的质量数里减掉。

**C. Y 为 ${}^{54}_{24}\mathrm{Cr}$，$A = 295$：正确。** 电荷数 $24 + 95 = 119$，与右边的 119 相等；质量数 $54 + 243 = 297$，右边 $295 + 2 = 297$，两边相等。

**D. Y 为 ${}^{54}_{24}\mathrm{Cr}$，$A = 297$：错误。** 电荷数 $24 + 95 = 119$ 是平衡的，但质量数不平衡：左边 $54 + 243 = 297$，右边 $297 + 2 = 299$，右边多 2。这个选项同样忘记从入射核的质量数里减掉 2 个中子。

故选 $\boxed{\mathrm C}$。

## 交互演示

下面用两个滑块改 Y 的质量数和电荷数，产物 X 的质量数按质量数守恒随着重算：$A = A_\mathrm Y + 243 - 2$。美和两个中子是题目写定的，不跟着变。初始值取正确选项：铬的质量数 54、电荷数 24，此时 $A = 295$。三个核的大小只是示意，不按真实半径比例。

<Param name="AY" label="Y 的质量数" symbol="A_Y" value={54} min={50} max={62} step={1} control="stepper" />

<Param name="ZY" label="Y 的电荷数" symbol="Z_Y" value={24} min={20} max={30} step={1} control="stepper" />

<Define name="A" expr="AY + 243 - 2" />

<Define name="dZ" expr="ZY + 95 - 119" />

<Question text="A. Y 为 ^{58}_{26}Fe，A = 299" set={{AY: 58, ZY: 26}} hint="质量数左右都是 301，但电荷数 26 + 95 = 121，比右边的 119 多 2" />

<Question text="B. Y 为 ^{58}_{26}Fe，A = 301" set={{AY: 58, ZY: 26}} hint="电荷数仍是 121，不等于 119；质量数右边 301 + 2 = 303，比左边多 2" />

<Question text="C. Y 为 ^{54}_{24}Cr，A = 295" set={{AY: 54, ZY: 24}} hint="电荷数 24 + 95 = 119，质量数 54 + 243 = 297 = 295 + 2，两边都平衡" />

<Question text="D. Y 为 ^{54}_{24}Cr，A = 297" set={{AY: 54, ZY: 24}} hint="电荷数平衡，但质量数右边 297 + 2 = 299，比左边的 297 多 2" />

<Preset label="正确选项 C" set={{AY: 54, ZY: 24}} />

<Preset label="铁的两个选项" set={{AY: 58, ZY: 26}} />

<Status cases={[
  {when: "abs(dZ) < 1e-6", label: "电荷数守恒：Y 是铬 Cr（Z = 24）", tone: "success"},
  {when: "dZ > 0", label: "电荷数不守恒：左边比右边多", tone: "warning"},
  {label: "电荷数不守恒：左边比右边少", tone: "warning"}
]} />

<Readout items={[
  {label: "电荷数差", symbol: "ΔZ", expr: "dZ", digits: 0},
  {label: "X 的质量数", symbol: "A", expr: "A", digits: 0}
]} />

<Figure title="核反应" height={340} params={["AY", "ZY", "A", "dZ"]} hud={[
  {symbol: "Z_Y", label: "Y 的电荷数", expr: "ZY", digits: 0},
  {symbol: "A", label: "X 的质量数", expr: "A", digits: 0}
]} note="核的大小不按比例。产物质量数按质量数守恒重算，不随电荷数变。">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.4, xmax: 13.2, ymin: -0.4, ymax: 5.2, equal: true })
    const rY = 0.5 + (p.AY - 50) * 0.012
    v.ball(m, 1.5, 2.3, rY, { charge: true })
    v.ball(m, 4.5, 2.3, 0.85, { charge: true })
    v.ball(m, 9, 2.3, 0.95, { charge: true })
    v.ball(m, 11.5, 2.95, 0.3, { charge: true })
    v.ball(m, 11.5, 1.65, 0.3, { charge: true })
    v.arrow(m, 2.5, 2.3, 3.35, 2.3, { color: v.color.ink })
    v.arrow(m, 5.7, 2.3, 7.7, 2.3, { color: v.color.ink, width: 2.4 })
    v.text(m, 1.5, 4.1, 'Y', { size: 16, color: v.color.ink })
    v.text(m, 1.5, 0.5, p.AY + ' , ' + p.ZY, { size: 13, color: v.color.ink })
    v.text(m, 4.5, 4.1, 'Am', { size: 16, color: v.color.ink })
    v.text(m, 4.5, 0.5, '243 , 95', { size: 13, color: v.color.ink })
    v.text(m, 9, 4.1, 'X', { size: 16, color: v.color.ink })
    v.text(m, 9, 0.5, p.A + ' , 119', { size: 13, color: v.color.ink })
    v.text(m, 11.5, 4.1, '2n', { size: 15, color: v.color.ink })
    v.text(m, 6.7, 3.2, p.dZ === 0 ? 'Z 守恒' : 'Z 不守恒', { size: 13, color: v.color.ink })
  },
})
</Figure>

<Bars title="质量数怎么分配" size="wide"
  caption="从左到右：Y、Am、X、两个中子"
  x={{name: "k", label: "核", min: 1, max: 4}}
  y={{label: "质量数", min: 0, max: 320}}
  expr="k == 1 ? AY : k == 2 ? 243 : k == 3 ? A : 2"
  color="charge"
  marks={[{x: 3, label: "产物 X", style: "outline"}]}
/>

四根柱从左到右是 Y、美、X 和两个中子。拖动质量数滑块，第一根柱变高，第三根柱同样变高：多出来的质量数全部进入产物 X。美的 243 和两个中子的 2 不变。左边两根之和始终等于右边两根之和。

电荷数滑块只改变平衡是否成立，不改变质量数。电荷数为 24 时左右都是 119，状态标签变成守恒；离开 24，左右之差就是读数里的 $\Delta Z$。铁的两个选项都落在 $\Delta Z = 2$。

## 答案汇总

电荷数守恒要求 Y 的电荷数为 24，即铬 ${}^{54}_{24}\mathrm{Cr}$；质量数守恒要求产物的质量数为 295。选项 A、B 用了铁，电荷数不守恒；选项 D 的元素对，但质量数多算了两个中子。

<Answer items={[
  {label: "答案", text: "C"},
  {label: "Y 的电荷数", symbol: "Z_Y", expr: "ZY", value: 24},
  {label: "Y 的质量数", symbol: "A_Y", expr: "AY", value: 54},
  {label: "产物质量数", symbol: "A", expr: "A", value: 295}
]} />
