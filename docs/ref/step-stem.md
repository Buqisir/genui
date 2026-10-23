---
id: step-stem
layer: L2
title: 分步课：题干卡
component: Stem
related:
  - step-lesson
---

题干卡，显示已知条件和问句。小测幕里、或同一步有 `<Choice>` 时，`<Stem>` 要写 `ask`，否则警告 `stem-without-ask`。

## 属性
<!-- props:Stem -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| text | string | 是 | 题干，已知条件 |
| ask | string |  | 问句，接在题干最后，不超过 40 字 |
| label | string |  | 小标题，如"情境" |
<!-- /props -->

## 规范原文
<!-- region:step-stem -->
### `<Stem>`

`<Stem text ask label />`：`text` 是题干，`ask` 是接在题干最后的问句（不超过 40 字），`label` 是小标题，如「情境」。

<!-- /region -->
