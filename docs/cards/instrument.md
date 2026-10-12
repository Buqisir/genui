---
id: instrument
layer: L1
title: 读数仪器
component: Instrument
related:
  - instrument-more
  - fringes
---

## 何时用

- 游标卡尺、螺旋测微器、电表、欧姆表、电阻箱、多用电表、弹簧测力计：刻度由 `value` 算出。
- 双缝测量头（目镜加手轮）见 `instrument-more`，不要另画微分筒和条纹。
- 屏上的条纹图样用 `fringes`。接在实物电路里、要跟着接线偏转的表用 `wiring`。
- 只报一个数、没有刻度时用 `readout` 或 `dial`。

## 最小例子

```lesson
---
id: example-instrument
title: 游标卡尺
question: 示意
answers:
  - { name: L, value: 23.45, unit: mm }
---

<Define name="L" expr="23.45" />

<Instrument title="游标卡尺" type="vernier" value="L" divisions={20} />
```

## 常见错误

- 游标 `divisions` 不是 10、20 或 50 → 只能这三档（校验：「游标卡尺 divisions 只能是 10、20 或 50」）。
- 电表不写 `range` 也不写 `scales` → 至少写一个（校验：「电表需要 range 或 scales」）。
- 多用电表 `mode` 或 `range` 不在挡位表 → `mode` 取 `ohm`、`dcv`、`dcma`、`acv`、`off`，`range` 用该挡已有量程。
- 读数题用 `v.spring` 和线条画刻度 → `type="springScale"`（或对应的 `type`；zj-24）。

## 属性
<!-- props:Instrument -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| size | string |  | 版面宽度：full、wide 或 narrow |
| title | string |  | 标题 |
| type | string | 是 | 仪器种类，见规范原文 |
| value | number 或 expr | 是 | 真实值，刻度由它算出 |
| unit | string |  | 读数单位 |
| divisions | number |  | 分度数或全程小格数 |
| scales | array |  | 表盘上的几排刻度 |
| range | number 或 expr |  | 当前量程 |
| major | number |  | 大格数 |
| symbol | string |  | 表盘中央的字母 |
| mid | number 或 expr |  | 欧姆刻度的中值 |
| multiplier | number 或 expr |  | 欧姆挡倍率 |
| decades | array |  | 电阻箱各旋钮的倍率 |
| reading | boolean |  | 为 false 时不写读数过程 |
| color | string |  | 高亮色，默认 velocity |
| note | string |  | 额外的一行说明 |
| fringes | object |  | 测量头里的双缝参数 |
| pair | object |  | 两条亮纹的手轮读数 |
| read | object |  | 交出去的 dx、lambda、x |
| mode | string |  | 多用电表挡位 |
| max | number 或 expr |  | 弹簧测力计的量程 |
| angle | number 或 expr |  | 钩子方向（度） |
| terminals | array |  | 表盘下方的接线柱文字 |
<!-- /props -->

## 规范原文
<!-- region:instrument-core -->
### `<Instrument>`：读数仪器

实验题的读数练习。刻度、对齐线和读数过程都由 `value` 算出来，拖动滑块时一起变。

```
<Instrument title="游标卡尺" type="vernier" value="L" divisions={20} unit="cm" />
<Instrument title="螺旋测微器" type="micrometer" value="d" />
<Instrument title="电流表" type="meter" value="I" scales={[0.6, 3]} range={0.6} unit="A" />
<Instrument title="欧姆挡" type="ohmmeter" value="Rx" multiplier={100} />
<Instrument title="电阻箱" type="resistanceBox" value="R0" decades={[1000, 100, 10, 1, 0.1]} />
<Instrument title="多用电表" type="multimeter" mode="ohm" range={10} value="Rx" />
<Instrument title="弹簧测力计" type="springScale" value="F" max={5} divisions={50} />
<Instrument title="测量头，第 3 条亮纹" type="measurementHead" value="x3" fringes={{lambda: 500, d: "d", L: "L", offset: 2}} pair={{x1: "x1", n: 3}} read={{dx: "mdx", lambda: "mlam"}} />
```

| `type` | 说明 |
|---|---|
| `vernier` | 游标卡尺。`value` 单位 mm；`divisions` 取 10、20、50 分度（默认 20）；对齐的那条刻线高亮；`unit="cm"` 时读数再换算成 cm |
| `micrometer` | 螺旋测微器。`value` 单位 mm（估读到 0.001 mm）；画固定套筒（和高考题图一样，基准线下方是整毫米刻线并标 0、5、10，上方是半毫米刻线）和可动刻度 |
| `meter` | 指针式电表。`range` 当前量程，`scales` 表盘上的几排刻度（如 `[0.6, 3]`，当前量程那一排加深；和实验室电表一样，大量程画在上排即弧外，小量程在下排即弧内，与数组顺序无关）；`divisions` 小格数（默认 30），`major` 大格数（默认 3）；`unit`、`symbol`（表盘中央的字母）。读数按高考估读规则：最小分度是 1 的估读到下一位，是 2 或 5 的在本位估读。`terminals` 在表盘下方画接线柱，如 `["−", "3 V", "15 V"]`，不要手画 |
| `ohmmeter` | 欧姆表。`value` 是实际电阻（Ω），`multiplier` 倍率（默认 1），`mid` 表盘中值（默认 15）；刻度不均匀，左端 ∞、右端 0 |
| `resistanceBox` | 电阻箱。`decades` 各旋钮倍率（默认 `[1000, 100, 10, 1]`）。每个旋钮的数字和指针都由 `value` 拆出来 |
| `multimeter` | 多用电表整机。`mode` 取 `ohm`、`dcv`、`dcma`、`acv`、`off`。`range`：欧姆挡是倍率（1、10、100、1000），直流电压是满度（2.5、10、50、250、500，单位 V），直流电流是 1、10、100（mA），交流电压是 10、50、250、500（V）。`value` 是被测量（Ω / V / mA）。`mid` 是欧姆刻度中值，默认 15。欧姆指针偏转比例 = mid / (R/倍率 + mid)，左端 ∞、右端 0；电压、电流按满度线性。挡位旋钮指向所选挡。读数行写明读哪条刻度、分度值和按高考规则估读的结果（欧姆再乘倍率）。指针偏角小于全程的 1/3 或大于 2/3 时另起一行，提示换更大或更小倍率。不要自己画指针和旋钮 |
| `springScale` | 弹簧测力计。`value`、`max` 单位 N。`divisions` 是全程小格数（5 N、0.1 N 分度写 50；0.2 N 分度写 25；不写时 5 N 及以下按 0.1 N，更大按 0.2 N）。分度为 0.1 估读到 0.01，为 0.2 在本位估读。`angle` 是钩子相对圆环的方向（度，从 +x 轴逆时针，默认 −90，钩子朝下）；外壳跟着转，刻度数字保持正立。指针和挂钩由 `value/max` 算出 |

<!-- /region -->
<!-- region:instrument-tail -->

下方自动写出读数过程（如「主尺 23 mm + 游标第 9 格 × 0.05 mm = 23.45 mm」）。出读数题、不想直接给答案时写 `reading={false}`。`color` 改高亮色（默认 `velocity`），`note` 加一行说明。


<!-- /region -->
