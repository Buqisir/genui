---
id: step-lab
layer: L2
title: 分步课：实验
component: Lab
related:
  - step-lesson
---

实验，是停点（带 `filled` 时不是）。点一个条件 → 设参数 → `<Sim>` / `<Collision>` 从头播 → 数据表记一行。做满 `need` 种条件才放行。`filled` 时表一开始就按 `runs` 全部算好填满，不出条件按钮。

## 属性
<!-- props:Lab -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| runs | array | 是 | 实验条件，每项 {label, set} |
| columns | array | 是 | 数据表的列，每列 {label, expr, digits?} |
| need | number |  | 要做满几种条件才放行，默认 = runs 个数 |
| first | array |  | 固定的首行，个数 = 列数 + 1 |
| filled | boolean |  | 表一开始就按 runs 全部填满，不是停点 |
<!-- /props -->

## 规范原文
<!-- region:step-lab -->
### `<Lab>`

`<Lab runs columns need first filled />`：`runs` 每项 `{ label, set }`，`set` 是要设的参数（同 `<Preset>`）；`columns` 每列 `{ label, expr, digits? }`，按当时参数求值，条件名那一列自动加在最前；`first` 个数 = 列数 + 1。

<!-- /region -->
