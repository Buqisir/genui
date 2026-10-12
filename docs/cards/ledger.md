---
id: ledger
layer: L1
title: 能量账本
component: Ledger
related:
  - dial
---

## 何时用

- 能量或功率分成几份，画成堆叠条。需要「开始 / 此刻 / 结束」时用 `rows`。
- 看一条曲线的形状用 `plot`。只盯一个量是否越界用 `dial`。
- 侧栏里报几个数用 `readout`。账本不是读数列表。
- 不是能量、功率的去向，不要拿它代替柱状图（那是 `bars`）。

## 最小例子

```lesson
---
id: example-ledger
title: 能量去向
question: 此刻动能是多少？
answers:
  - { name: Ek, value: 4, unit: J }
---

<Param name="t" label="时间" value={1} min={0} max={2} unit="s" />

<Define name="Ek" expr="8 - 4*t" />

<Define name="Q" expr="4*t" />

<Ledger title="能量" unit="J"
  parts={[
    {label: "动能", expr: "Ek", color: "velocity"},
    {label: "摩擦生热", expr: "Q", color: "force"}
  ]}
  total={{label: "总能量", expr: "Ek + Q"}}
/>

<Figure title="物块">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 4, ymin: 0, ymax: 2 })
    v.rect(m, 1, 0.4, 0.5, 0.4, { fill: v.color.graphite })
  },
})
</Figure>
```

`t = 1` 时动能 4 J、生热 4 J，总量 8 J。不写 `rows` 就只有「此刻」一行。

## 常见错误

- `parts={[]}` 或漏了 `parts` → 至少一份（`parts 为空` / `缺少属性 parts`）。
- `expr: Ek` 不加引号 → `expr: "Ek"`。
- `color: "heat"` → 用物理量名，摩擦生热是 `force`（`颜色只能是物理量名`）。
- `rows={[{label: "结束", at: {Ek: 0}}]}`，`Ek` 是 `<Define>` → `at` 里只能是 `<Param>`（`必须是 Param（Define 不能被设置）`）。结束时刻写 `at: {t: "T"}`。

## 属性
<!-- props:Ledger -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| size | string |  | 版面宽度：full、wide 或 narrow |
| title | string |  | 标题 |
| caption | string |  | 标题下的一行说明 |
| parts | array | 是 | 各部分 {label, expr, …} |
| rows | array |  | 各行 {label, at}，默认只有此刻 |
| total | object |  | 用来归一化条长的总量 |
| headline | object |  | 右上角改显示的这一个量 |
| unit | string |  | 单位 |
| digits | number |  | 小数位数 |
<!-- /props -->

## 规范原文
<!-- region:ledger -->
### `<Ledger>`：能量账本

把能量（或功率）的去向画成堆叠条，每行可以取不同时刻，"开始 / 此刻 / 结束"并排对照。

```
<Ledger
  title="能量去向"
  unit="J"
  parts={[
    {label: "动能", symbol: "E_k", expr: "Ek", color: "velocity"},
    {label: "摩擦生热", symbol: "Q", expr: "Q", color: "force"}
  ]}
  rows={[{label: "开始", at: {t: 0}}, {label: "此刻"}, {label: "结束", at: {t: "T"}}]}
  total={{label: "总能量", symbol: "E", expr: "Ek + Q"}}
/>
```

| 属性 | 说明 |
|---|---|
| `parts` | 各部分：`label`、`expr`，可选 `symbol`、`color` |
| `rows` | 可选，每行 `label`、`note`，`at` 是该行求值时临时设置的参数（不写就是当前值）。默认只有「此刻」一行 |
| `total` | 可选，条长按它归一化并显示在右上角；不写时用各部分之和 |
| `headline` | 可选，右上角改为显示这一个量（如效率 `{label: "效率", expr: "eta", format: "percent"}`） |
| `unit` / `digits` | 单位和小数位 |


<!-- /region -->
