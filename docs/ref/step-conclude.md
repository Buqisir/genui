---
id: step-conclude
layer: L2
title: 分步课：结论链条目
component: Conclude
related:
  - step-lesson
---

结论链条目，写在第几句后面就在第几句加进链里。`under` 挂在某一条下面；`guess` 标猜想，之后由另一条用 `settles` 加 `result` 判定（`holds` 成立或收编，`out` 出局）。`title` 全课不重名；`under`、`settles` 必须是某个 `<Conclude>` 的 `title`，否则报 `conclude-ref`。

## 属性
<!-- props:Conclude -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| title | string | 是 | 结论链上的短标题，全课不重名 |
| text | string | 是 | 浮层里的正文 |
| under | string |  | 挂在哪一条下面（那一条的 title） |
| guess | boolean |  | 这是猜想，之后由另一条用 settles 判定 |
| settles | string |  | 判定或收编哪一条（它的 title） |
| result | string |  | holds 成立或收编，out 出局；和 settles 一起用 |
| blank | string |  | 被 Fill mask 盖住时的挖空版，空格写 ___ |
<!-- /props -->

## 规范原文
<!-- region:step-conclude -->
### `<Conclude>`

`<Conclude title text under guess settles result blank />`：`blank` 是被 `<Fill mask>` 盖住时的挖空版，空格写 `___`，不写就显示「……」。

<!-- /region -->
