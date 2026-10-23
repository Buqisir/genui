---
id: step-result
layer: L2
title: 分步课：小测结果
component: Result
related:
  - step-lesson
---

小测结果。有 `<Result>` 的步可以不写正文。

## 属性
<!-- props:Result -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| goals | array | 是 | 每个目标 {title, items, back} |
| say | object |  | {all, some}：全对和没全对时讲述栏说的话 |
<!-- /props -->

## 规范原文
<!-- region:step-result -->
### `<Result>`

`<Result goals say />`：`goals` 每项 `{ title, items, back }`，`items` 是小测题号（从 1 数），`back` 是答错时「回第 N 幕再看」的幕号；`say` 是 `{ all, some }`，`{n}`、`{total}` 换成成绩。

<!-- /region -->
