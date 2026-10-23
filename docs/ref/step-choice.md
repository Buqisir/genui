---
id: step-choice
layer: L2
title: 分步课：选择题
component: Choice
related:
  - step-lesson
---

选择题，是停点。非预测题正好一个 `correct`；预测题（`predict`）最多一个 `correct`，表示实测结果是这一项，锁定时不揭晓，到 `<Recall>` 才说。选项 2–4 个，`text` 不超过 24 字；`say` 必填，字符串或字符串数组；`check` 只给要被 `<Recall>` 回看的预测题用，不超过 45 字。`hints` 写了必须正好 3 条。

## 属性
<!-- props:Choice -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| options | array | 是 | 2–4 项，每项 {text, correct?, say, check?} |
| ask | string |  | 没有 Stem 的步里，选项上方的问句 |
| hints | array |  | 三级提示，写了必须正好 3 条 |
| predict | boolean |  | 预测题：选了就锁定，不判对错 |
| name | string |  | 给 Recall 引用；全课不能重名 |
| label | string |  | 例题里的小节名，如"策略" |
<!-- /props -->

## 规范原文
<!-- region:step-choice -->
### `<Choice>`

`<Choice options ask hints predict name label />`：每个选项 `{ text, correct?, say, check? }`。`name` 全课不能重名，给 `<Recall>` 引用。没有 `<Stem>` 的步里，用 `ask` 写问句。

<!-- /region -->
