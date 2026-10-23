---
id: step-step
layer: L2
title: 分步课：步
component: Step
related:
  - step-lesson
---

一步 = 一个 `<Step>` 到下一个 `<Step>` 或 `<Act>` 之前，步里的正文按空行拆成句。整体规矩见 `step-lesson`。

## 属性
<!-- props:Step -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| title | string | 是 | 步标题，不超过 18 字 |
| play | number |  | 第几句开播（从 0 数），不写则进入就播 |
| frame | string |  | 强制版式：result、grid、fill、example、quiz、lab、derive、def、pic |
<!-- /props -->

## 规范原文
<!-- region:step-step -->
### `<Step>`

`<Step title play frame />` 自闭合。`title` 不超过 18 字（超过警告）；`play` 是非负整数，让 `<Sim>` / `<Collision>` 讲到第 `play` 句才开播；`frame` 取 `result grid fill example quiz lab derive def pic`，不写则自动判定。`<Act>` 之后必须紧跟 `<Step>`。

<!-- /region -->
