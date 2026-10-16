---
id: variant
layer: L1
title: 变式
component: Variant
related:
  - segment
---

## 何时用

- 课件写了上课画布（分段课件点「上课」）时，老师可以在画布空白处双击，把一个「如果……」变式放到画布上；点「应用」，所有图按新条件重新画、重新算；点「复原」回到题目条件。
- 变式只在上课画布里出现，学生页面不显示。
- 用来回答「为什么题目要这样设计」，例如两杆电流改成同向时电桥输出为零。

## 最小例子

```lesson
---
id: example-variant
title: 变式
question: 示意
answers:
  - { name: h, value: 1 }
---

开场：题目条件下两杆电流反向。

<Param name="same" label="电流同向" value={0} hidden />

<Param name="T" label="温度" value={330} min={330} max={440} unit="K" />

<Define name="h" expr="T/330" />

<Figure title="两杆电流" params={["same"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -1, xmax: 1, ymin: -1, ymax: 1, equal: true })
    const s = p.same ? 1 : -1
    v.arrow(m, -0.6, 0.5, -0.6 + 0.4, 0.5, { color: v.color.field })
    v.arrow(m, 0.6, -0.5, 0.6 + 0.4 * s, -0.5, { color: v.color.field })
    v.label(m, 0, 0.8, "ab 电流")
  },
})
</Figure>

<Variant label="两杆电流同向" set={{same: 1}} expect={{h: 1}} ask="cd 中电流改成和 ab 同向，结果会怎样？" reveal="两根杆受力同向。" />

完整解答写在这里。
```

## 常见错误

- `set` 里写了 `Define`（只能写 `Param`）→ 应用时要写入的必须是滑块或隐藏参数，派生量由它们算出来。
- 图里没有用到 `set` 里的参数 → 应用了也看不出变化。把这个参数列进图的 `params`，并在 `draw` 里用它。
- `reveal` 写成长段 → 投影上一眼读完的一两句，展开的部分写进讲稿。
- `expect` 写错了数，或写了课件里不存在的名字 → 校验器退回。`expect` 的数要和应用 `set` 后按课件公式算出的值一致（误差超过 1% 退回）。

## 属性
<!-- props:Variant -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| label | string | 是 | 变式的名字，如「两杆电流同向」 |
| set | object | 是 | 应用变式时写入的参数，如 {same: 1}；键必须是 Param |
| ask | string |  | 变式提出的问题 |
| reveal | string |  | 揭晓的答案，一两句 |
| expect | object |  | 应用变式后应得的数值，如 {Uef: 0}；校验器按课件公式核对，误差同 answers |
<!-- /props -->

## 规范原文
<!-- region:variant -->
### `<Variant>`：变式

`<Variant label set ask reveal />` 是「如果……」变式，自闭合，只在上课画布里生效。`label` 是变式的名字；`set` 是应用变式时写入的参数，键必须是 `<Param>` 声明过的名字，值是数字或表达式；`ask` 是提出的问题，`reveal` 是揭晓的答案，一两句。老师在画布上点「应用」后，所有引用了这些参数的图和读数都按新条件重算；点「复原」回到题目原来的条件。`expect` 可选，写应用变式后应得的数值，键是 `<Param>` 或 `<Define>` 名，如 `expect={{h: 0}}`；校验器在题目初始参数上叠加 `set` 重新计算并核对，误差超过 1% 退回。

<!-- /region -->
