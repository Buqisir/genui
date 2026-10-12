---
id: preset
layer: L1
title: 快捷按钮
component: Preset
related:
  - params
  - answer
---

## 何时用

- 把题目答案或某个关键状态做成一键跳转。`rules` 要求答案做成 `<Preset>`。
- 学生只是来回拖一个连续量时，有 `<Param>` 滑块就够，不必再加按钮。
- 每一小问各有一套条件时，用 `question` 的 `set`，不要堆一排只为切题号的按钮。
- `set` 只能改 `<Param>`。派生量改不了，见 `params`。

## 最小例子

```lesson
---
id: example-preset
title: 额定只数
question: 接 4 只时每只电压是多少？
answers:
  - { name: U, value: 4, unit: V }
---

<Param name="n" label="只数" value={4} min={1} max={8} step={1} control="stepper" />

<Define name="U" expr="16/n" />

<Preset label="只接 1 只" set={{n: 1}} />

<Figure title="电热器">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 4, ymin: 0, ymax: 2 })
    v.rect(m, 0.6, 0.5, 1, 0.7, { fill: v.color.graphite })
  },
})
</Figure>
```

初始就是答案：4 只、每只 4 V。按钮跳到只接 1 只。

## 常见错误

- `set={{U: 4}}`，而 `U` 是 `<Define>` → 改成滑块的名字（`set.U 必须是 Param（Define 不能被设置）`）。
- `set={{}}` → 至少写一个参数（`set 为空`）。
- `set={{n: "k"}}`，`k` 没有声明 → 右侧写数字，或已声明名字的表达式（`引用了未声明的名字 k`）。
- `set={{tStop: 2}}`，`tStop` 是 `<Motion>` 的事件名 → 事件名不能被设置。做一个 `t` 滑块，写 `set={{t: "tStop"}}`。

## 属性
<!-- props:Preset -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| label | string | 是 | 按钮上的文字 |
| set | object | 是 | 要点进去的参数值 |
<!-- /props -->

## 规范原文
<!-- region:preset -->
### `<Preset>`：快捷按钮

把题目的答案或关键状态做成一键跳转。

```
<Preset label="正常工作：4 只" set={{n: 4}} />
<Preset label="最大功率：16 只" set={{n: 16}} />
```

切换预设时数值在 450 ms 内缓动过去（选项型和时间参数直接跳）；系统开启"减少动态效果"时不做补间。


<!-- /region -->
