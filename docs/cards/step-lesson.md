---
id: step-lesson
layer: L1
title: 分步课（幕、步、句）
component: Act
related:
  - segment
  - collision
  - step-step
  - step-stem
  - step-choice
  - step-recall
  - step-work
  - step-def
  - step-fill
  - step-lab
  - step-conclude
  - step-result
  - step-homework
---

## 何时用

- 要做一节完整的课：幕 → 步 → 句，边讲边出现板书，中间有选择题、预测、补全、实验、结论链、小测。（样板阶段，还没有写进生成规则。）
- 一道题的分段讲解用 `segment`，不用本卡。课件里 `<Act>` 和 `<Segment>` 不能同时出现。
- 课件里只要出现 `<Act>`，整页换成分步课版面；不写 `<Act>` 的课件版面不变。

## 整页怎么切

- 第一个 `<Act>` 之前是开场：参数、共用的 `<Define>`，以及开场白（显示在第一步之前的封面页）。
- 一个 `<Act>` 到下一个 `<Act>` 之前是一幕；一个 `<Step>` 到下一个 `<Step>` 或 `<Act>` 之前是一步。`<Act>` 后面必须紧跟 `<Step>`。
- `<Act>`、`<Step>` 都是自闭合的分隔标记。`<Stem>` `<Choice>` `<Recall>` `<Work>` `<Def>` `<Fill>` `<Lab>` `<Conclude>` `<Result>` `<Homework>` 只能写在 `<Step>` 里面。`<Sim>` `<Figure>` `<Collision>` 等画面组件照常写。

## 一步里面的规矩

- 句：步里的正文按空行拆，每段一句，是讲述栏的一句话，每句不超过 60 字。板上的字一律用组件写（题干、选项、演算、定义卡）。
- 出现时间：组件写在第 k 句（从 0 数）后面，就从第 k 句起出现；写在第一句之前的从第 0 句起就在。计数：步里所有正文段，加上每个 `<Recall>`（各占一句），按书写顺序编号。
- 停点：`<Choice>`、`<Fill>`、`<Lab>`（不带 `filled`）。讲到它所在的那一句就停，要先答对、锁定预测或做满实验才能往下讲。停点可以在一步的最后一句。
- 反馈：选项的 `say` 是选了这一项时讲述栏说的话，字符串或字符串数组（按句说，每句不超过 60 字）。
- 回看：预测题 `<Choice predict name="x">` 选了就锁定、不判对错；之后 `<Recall choice="x" />` 单独成段，占一句，按学生选的那一项说 `check`。引用的预测题每项都要写 `check`。
- 画面跟句子：开场声明 `<Param name="beat" hidden value={0} />`，播放器把当前句号写进它（进入每一步归 0）。`<Sim>` `<Figure>` 的 `params` 里写 `beat`，`<Collision>` 的表达式属性里写 `beat`，就能读。`beat` 必须是 `hidden` 的 `<Param>`。
- 开播：`<Step play={k}>` 让这一步的 `<Sim>` / `<Collision>` 停在 t = 0，讲到第 k 句才从头播一次；不写就进入即播。
- 多张 `<Def>`：同一步里的多个 `<Def>` 接成一张卡，后写的行从它所在的那一句起出现。

## 最小例子

```lesson
---
id: example-step-lesson
title: 分步课
demo: true
---

<Param name="beat" hidden value={0} />

<Act title="碰撞" />

<Step title="先猜后测" play={1} />

<Collision m={[2, 2]} v={[4, 0]} after={[0, 4]} surface="magnet" bars="beat >= 1" />

两辆等质量小车相碰，A 以 4 m/s 撞向静止的 B。

<Choice predict name="guess" ask="碰后 A 会怎样？" options={[
  { text: "停下", correct: true, say: "先记下你的猜想。", check: "A 停下，速度全给了 B。" },
  { text: "反弹", say: "先记下你的猜想。", check: "A 没有反弹，它停下了。" }
]} />

看实验：A 停下，B 以 4 m/s 向右。

<Step title="回头看猜想" />

<Recall choice="guess" />

<Work lines={[{ eq: "2 × 4 = 2 × 0 + 2 × 4" }]} />

动量 8 kg·m/s 前后相等。

<Choice ask="这次碰撞动量守恒吗？" options={[
  { text: "守恒", correct: true, say: "对，碰前碰后都是 8。" },
  { text: "不守恒", say: "再算一遍碰前碰后的总动量。" }
]} />

守恒，下一步看动能。
```

## 常见错误

- `mixed-structure`：`<Act>` 和 `<Segment>` 写在同一份课件里 → 二选一。
- `act-without-step`：`<Act>` 后面不是 `<Step>` → 紧跟一个 `<Step>`。
- `step-without-act`：`<Step>` 之前没有 `<Act>` → 先写 `<Act>`。
- `outside-step`：`<Choice>` 等写在 `<Step>` 之外 → 挪到某个 `<Step>` 后面。
- `step-without-text`：一步没有正文 → 至少写一句（只有 `<Result>` 的步除外）。
- `sentence-too-long`：一句超过 60 字 → 按空行拆成几句。
- `stem-without-ask`：小测幕或有 `<Choice>` 的步里，`<Stem>` 没写 `ask` → 补问句。
- `work-needs-blocks`：`<Work lines>` 超过 3 行 → 改用 `blocks`。
- `recall-target`：`<Recall>` 指向的不是写在它前面的预测题 `<Choice name>` → 检查名字和顺序。
- `recall-needs-check`：被回看的预测题有选项没写 `check` → 每项都写。
- `conclude-ref`：`under`、`settles`、`Fill mask` 写的不是某个 `<Conclude>` 的 `title` → 对上标题。
- `duplicate-name`：`<Choice name>` 或 `<Conclude title>` 重名 → 全课唯一。
- `beat-not-hidden`：读了 `beat`，却没按 `<Param name="beat" hidden value={0} />` 声明 → 补成 hidden。
- `collision-needs-after`：`<Collision>` 没写 `after` 又没写 `still` → 见 `collision`。
- 属性写错（`unknown-prop`、`missing-required`）→ 各组件的属性表见 `step-*` 页。

## 属性
<!-- props:Act -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| title | string | 是 | 幕名，显示成"第 N 幕 · 幕名" |
| quiz | boolean |  | 小测幕：本幕每个 Choice 的第一次作答计入成绩 |
<!-- /props -->

## 规范原文
<!-- region:step-lesson -->
### `<Act>` / `<Step>`：分步课

`<Act title quiz />` 是幕标记，显示成「第 N 幕 · 幕名」；`quiz` 的幕里每个 `<Choice>` 的第一次作答计入成绩，由 `<Result>` 汇总。`<Step title play frame />` 是步标记，标题不超过 18 字；`frame` 强制版式（`result grid fill example quiz lab derive def pic`），不写则自动判定。步里的句、出现时间、停点、反馈、回看、`beat`、开播的规矩见 `step-lesson` 卡。各步内组件见 `step-stem`、`step-choice`、`step-recall`、`step-work`、`step-def`、`step-fill`、`step-lab`、`step-conclude`、`step-result`、`step-homework`。

<!-- /region -->
