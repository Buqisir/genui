---
id: plot
layer: L1
title: 函数曲线图
component: Plot
related:
  - bars
---

## 何时用

- 物理量沿连续自变量的曲线：x–t、v–t、U–I、p–V。
- 自变量是整数（第 n 次、几只元件）用 `bars`，不要把柱状数据连成折线。
- 能量分成几份用 `ledger`；只盯一个量是否越界用 `dial`。
- 只有 `<Plot>` 不算画出情景（见 `rules`）。旁边要有 `<Sim>`、`<Figure>` 或其他情景组件。
- 实测点写 `points`，不要伪装成 `expr`。拟合用 `fit`，结果用 `read` 交出去。

## 最小例子

```lesson
---
id: example-plot
title: 刹车速度
question: t = 1 s 时速度是多少？
answers:
  - { name: vNow, value: 2, unit: m/s }
---

<Param name="t" label="时间" value={1} min={0} max={3} unit="s" />

<Define name="vNow" expr="max(4 - 2*t, 0)" />

<Plot title="速度"
  x={{name: "t", label: "t", unit: "s", min: 0, max: 3}}
  y={{label: "v", unit: "m/s", min: 0, max: 5}}
  series={[{label: "v", expr: "max(4 - 2*t, 0)", color: "velocity"}]}
  areas={[{series: 0, from: 0, until: 1, label: "位移"}]}
  cursor="t"
/>

<Figure title="小车">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 4, ymin: 0, ymax: 2 })
    v.rect(m, 1, 0.4, 0.7, 0.35, { fill: v.color.graphite })
  },
})
</Figure>
```

`areas[].series` 是曲线序号，这里只有第 0 条，阴影从横轴填到它。游标跟着参数 `t`。

## 常见错误

- `areas={[{from: 0, until: "tP", label: "负功"}]}`，不写 `series` 或写成曲线名 → `series` 是从 0 起的序号。zj-08：`<Plot> areas[0].series 超出范围：undefined`。正确：`{series: 0, from: 0, until: "tP", label: "负功"}`；两条曲线之间再加 `to: 1`。
- `marks={[{x: 1, series: "v"}]}` → `marks.series` 同样是序号。不写时按 `label` 里的曲线名去找。
- 给普通曲线写 `x` 或 `point`，却没有 `over` → 参数曲线才三者一起写（`的 x、point 要和 over 一起写`）。
- `color: "#1F4FD8"` → 改成物理量名，如 `velocity`（`颜色只能是物理量名`）。
- 课件里只有这张图 → 再加一个情景组件，否则 `课件没有画出物理情景`。

## 属性
<!-- props:Plot -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| size | string |  | 版面宽度：full、wide 或 narrow |
| title | string |  | 标题 |
| caption | string |  | 标题下的一行说明 |
| x | object | 是 | 横轴 {name, label, min, max} |
| y | object |  | 纵轴，不写范围则自动取 |
| series | array | 是 | 曲线列表，每项见规范原文 |
| marks | array |  | 关键点列表 |
| areas | array |  | 面积填充列表 |
| cursor | name |  | 游标跟随的参数名 |
| values | boolean |  | 为 false 时不显示游标数值 |
<!-- /props -->

## 规范原文
<!-- region:prefabs -->
## 四、预制组件


<!-- /region -->
<!-- region:plot -->
### `<Plot>`：函数曲线图

画函数曲线、关键点、竖线游标。曲线、标签的布局和避让由组件处理。

```
<Plot
  title="两车速度随时间变化"
  x={{name: "t", label: "t", unit: "s", min: 0, max: 9}}
  y={{label: "v", unit: "m/s", min: 0, max: 11}}
  series={[
    {label: "A 车", expr: "4", color: "blue"},
    {label: "B 车", expr: "max(10 - 2*t, 0)", color: "orange"}
  ]}
  marks={[
    {x: 3, label: "速度相等，距离最远"},
    {x: 5, label: "B 停车"},
    {x: 8, label: "A 追上 B"}
  ]}
  cursor="t"
/>
```

| 属性 | 说明 |
|---|---|
| `x` | 横轴。`name` 是曲线表达式里自变量的名字，`min`/`max` 可以是数字或表达式字符串 |
| `y` | 纵轴。不写 `min`/`max` 时自动取范围 |
| `title` / `caption` | 标题和一行说明 |
| `series` | 曲线列表。`expr` 里可以用自变量和所有参数；`color` 取物理量名（不写按顺序取）；`dash: true` 画虚线。要画 p–V 这类参数曲线时，给这一条写 `over: {name, min, max}` 和 `x`：`over.name` 是只属于这条曲线的局部变量，从 `min` 扫到 `max`，`x` 是横坐标、`expr` 是纵坐标。`point` 再点一个参数（通常是滑块）在曲线上标出当前状态。没写 `over` 的曲线仍按横轴自变量画，用法不变。实测数据改写 `points: [[x, y], ...]`（数字或表达式），不要再写 `expr`：默认画圆点，`marker: 'cross'` 改成叉，`line: true` 再把点连成折线。`fit: 'linear'` 在整段横轴上画最小二乘直线 y = kx + b，`fit: 'proportional'` 画过原点的 y = kx。拟合结果用这一条的 `read: {slope: "k", intercept: "b"}` 交出去，名字和 Define 一样能给 `<Readout>` 用（U–I 图里 E 是截距，r 是 −斜率） |
| `marks` | 关键点。`x` 是横坐标（数字或表达式），`series` 指定落在哪条曲线上（序号，可选；不写时按 `label` 里出现的曲线名或符号找，例如「v_y 回到 0」落在 v_y 上，找不到就落在第 1 条上），`label` 是说明 |
| `areas` | 面积填充，用来读"位移 = 面积"、"相对位移 = 两线之间"。`{series, to, from, until, label, color}`：`series` 和 `to` 都是 `series` 数组里的序号（从 0 数，`series` 必填），填 `series` 曲线和 `to` 曲线之间（不写 `to` 就到横轴），横坐标从 `from` 到 `until`（可写表达式） |
| `cursor` | 游标跟随的参数名，可选。游标处显示各曲线的当前值（`values: false` 关掉下方数值行） |


<!-- /region -->
