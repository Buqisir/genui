---
id: step-def
layer: L2
title: 分步课：定义卡、总结
component: Def
related:
  - step-lesson
---

定义卡或总结。同一步里的多个 `<Def>` 接成一张卡，后写的行从它所在的那一句起出现。`follow` 时一开始全部排好、未讲到的行灰着，每讲一句亮一行。

## 属性
<!-- props:Def -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| rows | array | 是 | 每行 {name, text, note?} |
| follow | boolean |  | 跟读：未讲到的行灰着，每讲一句亮一行 |
<!-- /props -->

## 规范原文
<!-- region:step-def -->
### `<Def>`

`<Def rows follow />`：每行 `{ name, text, note? }`。

<!-- /region -->
