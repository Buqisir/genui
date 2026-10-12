---
id: status
layer: L1
title: 状态标签
component: Status
related:
  - params
---

## 何时用

- 随参数换一句状态：超过额定、刚好额定、已经共速。
- 要看数值用 `readout`；只盯一个量的刻度用 `dial`。
- 小问的题干用 `question`。`<Status>` 不是题干，也不是答案。
- 条件按顺序匹配，最后一条不写 `when`，当作兜底。

## 最小例子

```lesson
---
id: example-status
title: 是否额定
question: 4 只时是否额定运行？
answers:
  - { name: n, value: 4 }
---

<Param name="n" label="只数" value={4} min={1} max={8} step={1} control="stepper" />

<Status cases={[
  {when: "n < 4", label: "超过额定电压", tone: "warning"},
  {when: "n == 4", label: "额定运行", tone: "success"},
  {label: "低于额定电压", tone: "neutral"}
]} />

<Figure title="电热器">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 3, ymin: 0, ymax: 2 })
    v.rect(m, 0.6, 0.5, 0.8, 0.6, { fill: v.color.graphite })
  },
})
</Figure>
```

初始 `n = 4`，显示「额定运行」。

## 常见错误

- `<Status cases={[…]}` 少写 `/>` → 自闭合。zj-28 因此 `组件标签没有闭合`，后面的情景全部解析不到。
- `tone: "ok"` → 只能是 `neutral`、`info`、`success`、`warning`、`danger`（`tone 只能是 …`）。
- 最后一条也写 `when: "n > 4"` → 删掉 `when`，让它兜底（提醒：`最后一条 case 最好不写 when，作为兜底`）。
- `when: "n = 4"` → 相等写 `n == 4`。单等号不是表达式（`表达式无法解析`）。

## 属性
<!-- props:Status -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| cases | array | 是 | 按顺序匹配的条件列表 |
<!-- /props -->

## 规范原文
<!-- region:status -->
### `<Status>`：随参数变化的状态标签

按顺序匹配第一个成立的条件：

```
<Status cases={[
  {when: "n < 4", label: "超过额定电压", tone: "warning"},
  {when: "n == 4", label: "额定运行", tone: "success"},
  {label: "低于额定电压", tone: "neutral"}
]} />
```

`tone` 取值：`neutral`、`info`、`success`、`warning`、`danger`。


<!-- /region -->
