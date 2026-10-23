---
id: step-fill
layer: L2
title: 分步课：补全
component: Fill
related:
  - step-lesson
---

补全，是停点。一次只问一个空；答对后卡里填上，选项收成一行。空写在 `text` 里：`{答案|干扰1|干扰2}`，第一项是答案（显示时打乱）。`say`、`hints` 按空排，每个空一组，和选项一一对应。`mask` 列出结论链条目的 `title`：这些条目在这个 `<Fill>` 答完前盖住，写错标题报 `conclude-ref`。

## 属性
<!-- props:Fill -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| rows | array | 是 | 同 Def；text 里的空写成 {答案|干扰1|干扰2} |
| say | array |  | 每个空一组反馈，与选项一一对应 |
| hints | array |  | 每个空一组三级提示 |
| mask | array |  | Conclude 的 title 列表：答完这个 Fill 之前盖住 |
<!-- /props -->

## 规范原文
<!-- region:step-fill -->
### `<Fill>`

`<Fill rows say hints mask />`：`rows` 同 `<Def>`。

<!-- /region -->
