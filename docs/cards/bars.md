---
id: bars
layer: L1
title: 离散柱状图
component: Bars
related:
  - plot
---

## 何时用

- 自变量取整数：第 n 次碰撞、几只电热器、第几能级。点击柱子可以把 `cursor` 设成那个整数。
- 自变量连续（时间、电压、角度）用 `plot`，不要用柱子假装曲线。
- 要对照几份能量用 `ledger`；只看一个量的区间用 `dial`。
- 柱状图不是情景。装置仍要有 `<Figure>`、`<Circuit>` 或其他情景组件。

## 最小例子

```lesson
---
id: example-bars
title: 功率与只数
question: 接 4 只时输出功率是多少？
answers:
  - { name: P4, value: 4, unit: W }
---

<Param name="n" label="只数" value={4} min={1} max={8} step={1} control="stepper" />

<Define name="P4" expr="n" />

<Bars title="功率"
  x={{name: "k", label: "n", unit: "只", min: 1, max: 8}}
  y={{label: "P", unit: "W"}}
  expr="k"
  cursor="n"
  marks={[{x: 4, label: "额定", style: "outline"}]}
  color="charge"
/>

<Figure title="元件">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 4, ymin: 0, ymax: 2 })
    v.rect(m, 1, 0.4, 0.5, 0.5, { fill: v.color.graphite })
  },
})
</Figure>
```

表达式里的自变量是 `x.name`（这里是 `k`），不是参数 `n`。点柱子才把 `n` 设过去。

## 常见错误

- 横轴不写 `min`、`max` → 两个都要（`x 需要 min 和 max`）。
- `x.name` 是 `k`，`expr` 里却写 `n` → 柱高用横轴那个名字：`expr="k"`（`引用了未声明的名字 n`）。
- `marks={[{x: 4, style: "dashed"}]}` → `style` 只能是 `solid` 或 `outline`。
- `cursor` 写成 `<Define>` 的名字 → 点击要写进一个 `<Param>`。
- 用 `<Plot>` 把 1、2、3… 连成折线 → 改成 `<Bars>`。

## 属性
<!-- props:Bars -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| size | string |  | 版面宽度：full、wide 或 narrow |
| title | string |  | 标题 |
| caption | string |  | 标题下的一行说明 |
| x | object | 是 | 横轴，自变量取整数 |
| y | object |  | 纵轴 |
| expr | expr | 是 | 柱高的表达式 |
| marks | array |  | 标注，style 为 solid 或 outline |
| cursor | name |  | 点击柱子写入的参数名 |
| color | string |  | 高亮颜色，取物理量名 |
| digits | number |  | 小数位数 |
<!-- /props -->

## 规范原文
<!-- region:bars -->
### `<Bars>`：离散柱状图

自变量是整数时用（几只电热器、第几能级、第几次碰撞）。点击柱子把 `cursor` 参数设成对应值。

```
<Bars
  title="输出功率与电热器只数"
  x={{name: "k", label: "n", unit: "只", min: 1, max: 30}}
  y={{label: "P", unit: "W"}}
  expr="E^2 * k*R / (k*r + R)^2"
  cursor="n"
  marks={[{x: 4, label: "额定", style: "outline"}, {x: 16, label: "最大", style: "solid"}]}
  color="charge"
/>
```

`expr` 里用 `x.name` 作自变量（默认 `n`）；`marks.style` 取 `solid`（实心墨色）或 `outline`（虚线框）；游标所在的柱子用 `color` 高亮。


<!-- /region -->
