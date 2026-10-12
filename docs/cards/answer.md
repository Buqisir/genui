---
id: answer
layer: L1
title: 答案卡片
component: Answer
related:
  - question
  - preset
---

## 何时用

- 结果放进一个 `<Answer>`，默认收起，让学生先做。
- 过程中随滑块变的量用 `readout`。`value` 是参考答案，不随参数改。
- 一键跳到答案那个状态用 `preset`，本组件只负责展示和核对。
- 选择题第一条写 `{label: "答案", text: "BD"}`，头信息写 `choice`。各选项的切换用 `question`。

## 最小例子

```lesson
---
id: example-answer
title: 最大距离
question: 最远相距多少？
answers:
  - { name: dmax, value: 16, unit: m }
---

<Param name="v" label="速度" value={4} min={1} max={8} unit="m/s" />

<Define name="dmax" expr="v*4" />

<Answer items={[{label: "最大距离", symbol: "Δx", expr: "dmax", value: 16, unit: "m"}]} />

<Figure title="位置">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 4, ymin: 0, ymax: 2 })
    v.rect(m, 1, 0.5, 0.5, 0.4, { fill: v.color.graphite })
  },
})
</Figure>
```

`expr` 和 `value` 都写时，卡片会比较当前结果和参考值。头信息 `answers` 的 `name` 必须是这个 `<Define>`。

## 常见错误

- 条目只写 `{label: "最大距离"}` → 加上 `expr`、数字 `value` 或文字 `text`（`需要 expr、数字 value 或文字 text`）。
- 选择题写成 `{label: "答案", value: "BD"}` → 非数值用 `text: "BD"`。`value` 必须是数字。
- 头信息 `answers` 里的名字没有 `<Param>` / `<Define>` → 名字要能在初始参数下重算（`没有对应的 Param/Define，无法核对`）。
- 公式算出 16，`answers` 写 18 → 改到 1% 以内，否则 `答案不一致：dmax 按课件公式算出 16，answers 写的是 18`。

## 属性
<!-- props:Answer -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| items | array | 是 | 答案条目，见规范原文 |
| title | string |  | 收起时的按钮文字 |
| open | boolean |  | 为真时默认展开 |
<!-- /props -->

## 规范原文
<!-- region:answer -->
### `<Answer>`：答案卡片

**默认收起**，学生先自己做题。展开后列出答案；条目同时给了 `expr` 和 `value` 时，卡片会说明当前参数下的结果是否"与参考答案一致"，参数被拖离题目条件时提示"已偏离"。底部链接跳到「分析与解答」。

```
<Answer items={[
  {label: "最大距离", symbol: "Δx_max", expr: "dmax", value: 16, unit: "m"},
  {label: "追上时刻", symbol: "t", expr: "tCatch", value: 8, unit: "s", digits: 1}
]} />
```

| 属性 | 说明 |
|---|---|
| `items` | 条目：`label`，`expr` 和/或数字 `value`，可选 `symbol`、`unit`、`digits`、`format`。不是数值的答案（选择题选项、只能写成字母表达式的结果、「偏大」之类）写 `text`，原样显示：`{label: "答案", text: "BD"}` |
| `title` | 收起时的按钮文字，默认「查看答案」 |
| `open` | 默认展开，一般不写 |


<!-- /region -->
