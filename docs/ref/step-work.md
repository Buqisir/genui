---
id: step-work
layer: L2
title: 分步课：演算
component: Work
related:
  - step-lesson
---

演算。`lines` 最多 3 行，从所在那句起一句出一行；更长的推导用 `blocks`，每块 `{ title, lines, note? }`，一屏不超过 4 块，最后一块是结论框。`lines` 和 `blocks` 二选一；`lines` 超过 3 行报 `work-needs-blocks`。

## 属性
<!-- props:Work -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| lines | array |  | 不超过 3 行的算式，每行 {eq, note?} |
| blocks | array |  | 推导分块，每块 {title, lines, note?}，一屏不超过 4 块 |
| label | string |  | 例题里的小节名，如"解答" |
<!-- /props -->

## 规范原文
<!-- region:step-work -->
### `<Work>`

`<Work lines blocks label />`：`lines` 每行 `{ eq, note? }`，`label` 是例题里的小节名，如「解答」。

<!-- /region -->
