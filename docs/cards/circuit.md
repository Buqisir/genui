---
id: circuit
layer: L1
title: 电路图
component: Circuit
related:
  - circuit-ladder
  - circuit-solve
  - circuit-transient
  - circuit-motion
  - wiring
---

## 何时用

- 原理图：串并联、电表读数、充放电、交流。求解见 `circuit-solve`，暂态见 `circuit-transient`。
- 多只用电器并联、要画成梯子：`layout="ladder"`，限制见 `circuit-ladder`。
- `<Motion>` 已经解出的电路写 `motion`，不要再写 `source`。见 `circuit-motion`。
- 实物接线、电桥、检流计用 `wiring`。没有电路、只看曲线时用 `plot`。

## 最小例子

```lesson
---
id: example-circuit
title: 串联电路
question: 示意
answers:
  - { name: I, value: 1, unit: A }
---

<Circuit source={{series: [{type: "battery", emf: 3, r: 1}]}} load={{type: "resistor", R: 2, read: "I"}} />
```

## 常见错误

- 电桥拆成两条 `parallel` → 改 `wiring` 连桥臂和检流计（串并联树表达不了桥；zj-10）。
- 单刀双掷写成两把互斥开关 → `{spdt: [支路1, 支路2], position}`（图上是一把刀；zj-27，见 `circuit-solve`）。
- 手写 `I = E/(R+r)` 填进 `note` → 电源写 `emf`，元件写 `read`（见 `circuit-solve`）。
- `layout="ladder"` 里放变压器、`spdt` 或两层并联 → 改 `loop`，或 load 只留一个单层 `parallel`（校验会拒）。

## 属性
<!-- props:Circuit -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| size | string |  | 版面宽度：full、wide 或 narrow |
| hud | array |  | 左上角读数列表，每项见规范原文 |
| legend | array |  | 图例列表，每项 {kind, label} |
| note | string |  | 画面下方一行说明 |
| title | string |  | 标题 |
| source | object |  | 电源一侧的串并联树 |
| load | object |  | 负载一侧的串并联树 |
| motion | string |  | 画哪一次 Motion 的电路 |
| at | expr |  | 画在哪一时刻的表达式 |
| current | object |  | 干路电流的标注 |
| flow | object 或 boolean |  | 导线上流动的电流粒子 |
| layout | string |  | loop 环绕，或 ladder 梯子 |
| box | object |  | ladder 外的虚线框 |
| transient | object |  | 暂态积分的配置 |
<!-- /props -->

## 规范原文
<!-- region:circuit-core -->
### `<Circuit>`：电路图

只描述元件和串并联关系，布局交给组件。负载画在上边，电源画在下边，两侧导线闭合。

```
<Circuit
  source={{series: [{type: "battery", label: "E"}, {type: "resistor", label: "r"}]}}
  load={{series: [
    {type: "resistor", label: "R₁"},
    {parallel: [{type: "lamp", label: "L₁"}, {series: [{type: "lamp", label: "L₂"}, {type: "ammeter"}]}]},
    {repeat: "n", label: "共 {n} 只", item: {type: "heater", label: "R", note: {expr: "U", unit: "V", prefix: "U = "}}},
    {type: "switch", label: "S", closed: "s == 1"}
  ]}}
  current={{expr: "I", unit: "A", label: "I"}}
/>
```

| 节点 | 说明 |
|---|---|
| 元件 `{type, label, note}` | `type` 取 `battery resistor heater rheostat lamp switch ammeter voltmeter galvanometer capacitor inductor generator motor thermistor photoresistor wire currentSource diode phototube transformer`（`motor` 电动机，`thermistor` 热敏电阻，`photoresistor` 光敏电阻，`inductor` 线圈，`currentSource` 恒流源，`diode` 理想二极管，`phototube` 光电管，`transformer` 理想变压器）。符号按国标（电阻是矩形）。`note` 是随参数变化的数值，显示在元件下方 |
| `{series: [...]}` | 串联，从左到右 |
| `{parallel: [...]}` | 并联，支路从上到下 |
| `{repeat: n, item, label}` | n 条相同支路并联，n 可以是表达式；超过 3 条时只画首尾两条，中间写 `label`（`{n}` 替换成数量） |
| `battery.positive` | `left`（默认）或 `right`，长线是正极 |
| `switch.closed` | 布尔值或表达式（非 0 为闭合） |
| `currentSource` | 恒流源。`I` 必填（可写表达式），电流从 `positive` 端流出，默认 `left`（正极在左，电流向左流出）。稳恒电路里不能和电容或断开的开关串联；两条串联的恒流源电流必须相等 |
| `diode` | 理想二极管：正向压降为 0，反向不导通。`reverse: true` 时正向反过来（三角指向左）。`read` 的正方向仍是从左到右：导通时 `U = 0`，截止时 `I = 0`。不能放在 `repeat` 里 |
| `phototube` | 光电管。`nu`（频率，Hz，`h = 6.63×10⁻³⁴`）或 `lambda`（波长，nm，光子能量 `1240/λ` eV）二选一，`W` 逸出功（eV），`Isat` 饱和光电流（A）。截止电压 `U_c = max(0, hν − W)`（eV 除以 e 后就是伏特），最大初动能 `E_k` 同此值；`hν < W` 时没有光电子，`U_c = 0`、`E_k = 0`，任何电压下电流都是 0。伏安特性是示意折线，不要自己画：`U_AK ≤ −U_c` 时 `I = 0`，`U_AK ≥ 0` 时 `I = I_sat`，中间连成直线。默认阴极 K 在左、阳极 A 在右，光从斜上方打到 K；`reverse: true` 把 A、K 对调。`read: {I, U, Uc, Ek}` 里 `U` 是阳极相对阴极的电压 `U_AK`，`I` 是光电流（电子从 K 到 A 为正），与图上左右无关。不能放在 `repeat` 里。暂态和 `<Motion circuit>` 里每一时刻按当时的电压重新落到对应的直线段上 |
| `transformer` | 理想变压器。`n1` 是原线圈匝数；一个副线圈写 `n2` 和 `secondary`（副线圈上的负载，本身也是一棵串并联树），多个副线圈写 `secondaries: [{n, load, label, read}]`，不要和 `n2`、`secondary` 一起写。副线圈回路画在线圈右侧，和原边只有磁的联系。匝数必须是正数 |
| `{spdt: [支路1, 支路2], position, label}` | 单刀双掷。恰好两条支路；`position` 为 1、2 或表达式，0 或其他值表示刀片悬空。画成一个公共端加两个触点，刀片指向接通的那条。两条支路的另一端接在一起，像并联。不能放在 `repeat` 里 |
| `current` | 可选，在左侧导线上标干路电流方向和数值，方向由电源正极决定 |
| `flow` | 可选，导线上流动的电流粒子。`{expr, ref}`：粒子速度正比于 `expr`，等于 `ref` 时为基准速度（不写 `ref` 取题目初始值）；各支路按分流比例变慢。写了 `current` 时默认按它流动，`flow={false}` 关掉 |
| `hud` / `legend` / `note` | 同 `<Sim>`，在电路上方显示读数和图例，下方显示说明 |
| `layout` | `"loop"`（默认）：电源在底边、负载在顶边、并联支路上下叠放。`"ladder"`：电源竖在左边，负载里的串联元件分在上、下两条导线上，并联支路竖着并排成「梯子」，电流顺时针（从电源上端流出） |
| `box` | 仅 `ladder`。`{label, caption}`：用虚线框圈出全部支路，`label` 写在左上（如「保温室」），`caption` 写在左下，不写时用 `repeat.label` |


<!-- /region -->
