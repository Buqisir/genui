---
id: step-recall
layer: L2
title: 分步课：回看预测
component: Recall
related:
  - step-lesson
---

`<Recall choice="名字" />` 单独成段，占一句。引用的必须是写在它之前的预测题 `<Choice name>`，且每项都要有 `check`。讲述栏说：猜对了 →「你猜的是「text」，猜对了。」，否则「你猜的是「text」。」，再接这一项的 `check`；学生没选就只说正确那项的 `check`。

## 属性
<!-- props:Recall -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| choice | string | 是 | 引用的预测题 Choice 的 name |
<!-- /props -->

## 规范原文
<!-- region:step-recall -->
### `<Recall>`

`<Recall choice />`：`choice` 是预测题的 `name`。引用错误报 `recall-target`，缺 `check` 报 `recall-needs-check`。

<!-- /region -->
