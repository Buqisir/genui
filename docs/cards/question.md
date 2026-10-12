---
id: question
layer: L1
title: 小问
component: Question
related:
  - preset
  - answer
---

## 何时用

- 每个小问一个 `<Question>`，出现在侧栏顶部。点进去会高亮，并把 `set` 里的参数补间过去。
- 纯概念、没有可切换的画面时，只写文字解答，不必做 `<Question>`（见 `rules`）。
- 不是某一问、只是跳到一个数值状态：用 `preset`。
- 选择题：`text` 抄选项原文，`set` 切到能看出对错的状态。结果仍放进 `answer`。

## 最小例子

```lesson
---
id: example-question
title: 刹车前后
question: 刹车前速度是多少？
answers:
  - { name: vNow, value: 4, unit: m/s }
---

<Param name="phase" label="阶段" value={1} options={[{value: 1, label: "刹车前"}, {value: 2, label: "刹车后"}]} />

<Define name="vNow" expr="phase == 1 ? 4 : 1" />

<Question text="刹车前的速度？" set={{phase: 1}} />

<Question text="刹车后的速度？" set={{phase: 2}} hint="摩擦力已经在减速" />

<Figure title="物块">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 4, ymin: 0, ymax: 2 })
    v.rect(m, 1, 0.4, 0.6, 0.4, { fill: v.color.graphite })
  },
})
</Figure>
```

`phase` 是选项型 `<Param>`。点第二问会把它设成 2，速度变成 1 m/s。

## 常见错误

- `set={{vNow: 1}}`，`vNow` 是 `<Define>` → `set` 里只能是 `<Param>`（`必须是 Param（Define 不能被设置）`）。
- 只有 `set`、没有 `text` → `text` 必填（`缺少属性 text`）。
- `hint="$v_0$"` → 属性是纯文本，不支持 LaTeX。下标直接写 `v_0`。
- 用 `<Question>` 画装置 → 它只在侧栏。情景用 `<Figure>` 或 `<Sim>`。

## 属性
<!-- props:Question -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| text | string | 是 | 题干 |
| hint | string |  | 选中时显示的提示 |
| set | object |  | 切到这一问时设置的参数 |
<!-- /props -->

## 规范原文
<!-- region:question -->
### `<Question>`：小问

每个小问一个标签，显示在侧栏顶部的编号列表里。点击某一问时高亮它，并把 `set` 里的参数补间到该问的条件。

```
<Question text="木板与墙第一次碰撞前，物块和木板是否已共速？" set={{t: 0.8}} hint="比较共速时刻和碰墙时刻" />
```

| 属性 | 说明 |
|---|---|
| `text` | 题干（纯文本，可写下标） |
| `set` | 可选，切到这一问时设置的参数，同 `<Preset>` |
| `hint` | 可选，选中时显示的提示 |


<!-- /region -->
