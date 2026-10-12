---
id: wiring
layer: L1
title: 实物连线图
component: Wiring
related:
  - wiring-solve
  - circuit
---

## 何时用

- 实物连线：接线柱、电表接法、变阻器的限流或分压。电桥和检流计也用它，不用 `circuit` 的树。
- 要按图上的线求电流、电压：电池写 `emf`（和 `r`），读数写 `read`。见 `wiring-solve`。
- 没有实物、只要原理图时用 `circuit`。不接电路的读数练习用 `instrument`。

## 最小例子

```lesson
---
id: example-wiring
title: 串联实物
question: 示意
answers:
  - { name: I, value: 1, unit: A }
---

<Wiring title="串联" parts={[{id: "E", type: "battery", emf: 3, r: 1, label: "E"}, {id: "R", type: "resistor", R: 2, read: "I"}]} wires={[{from: "E.+", to: "R.a"}, {from: "R.b", to: "E.-"}]} />
```

## 常见错误

- 电桥写成 `circuit` 的两条支路 → 四个桥臂和检流计写成 `wires`（zj-10）。
- 写了 `emf` 仍给电表 `value`、给灯 `lit` → 删掉，改 `read`（校验：「电源写了 emf 后电表读数由电路求出，去掉 value」）。
- `steps` 和 `wires[].answer` 一起写 → 逐根接线时不要 `answer`（校验原文）。
- 原图正极在左，却用默认的右正 → `battery` 写 `positive: "left"`（gd25-06 图审）。

## 属性
<!-- props:Wiring -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| size | string |  | 版面宽度：full、wide 或 narrow |
| title | string |  | 标题 |
| height | number |  | 画布高度（像素） |
| parts | array | 是 | 实物元件列表，每项见规范原文 |
| wires | array | 是 | 导线列表 {from, to, …} |
| steps | string |  | 逐根接线进度的参数名 |
| note | string |  | 一行说明 |
<!-- /props -->

## 规范原文
<!-- region:wiring -->
### `<Wiring>`：实物连线图

实验题的「用笔画线代替导线连接实物图」。元件画成实物（带接线柱），导线是两接线柱之间的软曲线。

```
<Wiring
  title="伏安法测电阻"
  parts={[
    {id: "A", type: "ammeter", value: "I"},
    {id: "V", type: "voltmeter", value: "U"},
    {id: "E", type: "battery", label: "电源 E"},
    {id: "S", type: "switch", closed: "on"},
    {id: "R", type: "rheostat", slider: "p"},
    {id: "Rx", type: "resistor", label: "R_x"}
  ]}
  wires={[
    {from: "E.+", to: "S.a"}, {from: "S.b", to: "R.D"}, {from: "R.A", to: "A.0.6"},
    {from: "A.-", to: "Rx.a"}, {from: "Rx.b", to: "E.-"},
    {from: "V.3", to: "Rx.a", answer: true}, {from: "V.-", to: "Rx.b", answer: true}
  ]}
/>
```

| 元件 `type` | 接线柱 | 其他属性 |
|---|---|---|
| `battery` 电池组 | `+`、`-` | `positive`：正极在 `right`（默认）或 `left`，照原图摆 |
| `switch` 单刀开关 | `a`、`b` | `closed`：布尔值或表达式 |
| `battery` 的求解属性 | | `emf` 电动势、`r` 内阻（写了 `emf` 就进入求解模式，见下） |
| `ammeter` / `voltmeter` | `-` 和每个量程（默认 `0.6`、`3` / `3`、`15`） | `ranges` 改量程（单位 A / V，毫安表写 `ranges: [0.015]`）；`r` 内阻（默认理想）；表盘按实际接入的量程标数，量程小于 0.1 时按毫安（毫伏）标数、表心写 mA（mV）；没接线的表读数为 0。不求解时用 `value` 表达式驱动指针 |
| `galvanometer` 灵敏电流计 | `+`、`-`，或 `terminals` | `r` 内阻、`full` 满偏电流（A，默认 1 mA），零点在中央。不求解时 `value` 取 −1…1（满偏比例）。多接线柱写 `terminals: ["-", "G0", "G1"]`，画在表盘下方；名字是 `-` 的是公共端（没有就用第一个），其余都进同一表头，满偏仍用 `full`，不区分各挡灵敏度 |
| `rheostat` 滑动变阻器 | 线圈两端 `A`、`B`，金属杆两端 `C`、`D` | `slider` 滑片位置 0…1（0 在 A 端），`R` 总阻值（默认 20 Ω） |
| `resistor` 待测电阻 | `a`、`b` | `R`（默认 10 Ω） |
| `resistanceBox` 电阻箱 | `a`、`b` | `value` 阻值。每个旋钮画 0–9，指针指向由 `value` 拆出的数字，总阻值写在盒子上，算法和 `<Instrument type="resistanceBox">` 相同。不要只画一根没有数字的指针。`decades` 旋钮倍率（默认 `[1000, 100, 10, 1]`，最多 6 个） |
| `lamp` 小灯泡 | `a`、`b` | `R`、`power` 额定功率（默认 0.75 W，亮度 = 实际功率 / 额定功率）。不求解时 `lit` 亮度 0…1 |

- 每个元件要有不含「.」的 `id`；导线端点写 `"元件id.接线柱"`，如 `"A.0.6"`、`"R.C"`。
- `x`、`y`（px，画布宽 640、高 `height`，默认 340）可选：不写时自动排布，电表一排在上，其余元件在下方按顺序排开、放不下就换行。
- `wires[].answer: true` 是待学生连的答案线：默认隐藏，下方出现「显示答案连线」按钮，显示时画成蓝色虚线。`when` 是表达式，非 0 时才画这根线（用来对比内接/外接）。
- 电流从电表的量程接线柱流入、从 `-` 流出；限流接法用 `A` 或 `B` 中的一个加 `C` 或 `D` 中的一个，分压接法 `A`、`B` 都接电源两端。

**逐根接线 `steps`**：写 `steps="wk"`（一个 `hidden` 的 Param，`min={0}`、`max` 等于导线根数、`step={1}`），导线就按 `wires` 的书写顺序一根根接上：

- 每根线中点有编号圆标；刚接上的这根加粗高亮、两端接线柱加圈。
- 下方出现「从头接 / 上一根 / 下一根 / 全部接好」和「已接 n / N 根」，并用一句话说清这根线从哪接到哪（按图上看得见的名字：「电源 E 的正极」「滑动变阻器 R 的 D 端（连滑片）」「电流表的「0.6」接线柱」「电阻 R_x 的左端」）。`wires[].note` 写这一步的理由，接在这句话后面。
- 求解模式下电表读数自动跟着接线进度变（只算已经接上的导线）。不求解时才需要在 Define 里用这个 Param 手动判断电路通没通。
- 用了 `steps` 就不要再写 `answer`（所有导线都按顺序接上）。

```
<Param name="wk" label="已接导线" min={0} max={8} step={1} value={8} hidden />
<Wiring steps="wk" parts={[...]} wires={[
  {from: "E.+", to: "R.B", note: "从电源正极出发"},
  {from: "R.A", to: "S.a", note: "变阻器下面的 A、B 两端都接进主回路"},
  ...
]} />
```


<!-- /region -->
