---
id: dial
layer: L1
title: 表盘
component: Dial
related:
  - ledger
---

## 何时用

- 只有一个关键量要盯着：速度、效率、电压有没有进额定区间。
- 要看曲线形状或面积用 `plot`。能量分成几份用 `ledger`。
- 要精确读出数字时再配一个 `readout`。表盘负责区间，不负责列表。
- 自变量是「几只、第几次」用 `bars`，不要把离散点画成表盘。

## 最小例子

```lesson
---
id: example-dial
title: 电热器电压
question: 当前电压是多少？
answers:
  - { name: U, value: 200, unit: V }
---

<Param name="U" label="电压" value={200} min={0} max={250} unit="V" />

<Dial title="电压" expr="U" min={0} max={250} unit="V" symbol="U" color="charge"
  arcs={[{from: 200, to: 220, color: "field", label: "额定"}]}
/>

<Figure title="电热器">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 3, ymin: 0, ymax: 2 })
    v.rect(m, 0.8, 0.5, 0.7, 0.6, { fill: v.color.graphite })
  },
})
</Figure>
```

指针在 200 V，外圈色带标出 200–220 V 的额定段。

## 常见错误

- 不写 `min` 或 `max` → 刻度上下限都必填（`缺少属性 min`）。
- `expr={U}` → 改成字符串 `expr="U"`。裸名字不是表达式。
- `arcs={[{from: 200, to: 220, color: "green"}]}` 可以（`green` 等同 `field`）；`color: "safe"` 不行（`颜色只能是物理量名`）。
- 用 `<Dial>` 同时看动能和热能 → 改 `<Ledger>`。表盘只有一个 `expr`。

## 属性
<!-- props:Dial -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| size | string |  | 版面宽度：full、wide 或 narrow |
| title | string |  | 标题 |
| caption | string |  | 标题下的一行说明 |
| expr | expr | 是 | 表盘显示的量 |
| min | number 或 expr | 是 | 刻度下限 |
| max | number 或 expr | 是 | 刻度上限 |
| step | number |  | 刻度间隔 |
| arcs | array |  | 外圈色带列表 |
| footer | array |  | 表盘下方的区间说明 |
| symbol | string |  | 物理量符号 |
| unit | string |  | 单位 |
| color | string |  | 指针颜色，取物理量名 |
| digits | number |  | 小数位数 |
<!-- /props -->

## 规范原文
<!-- region:dial -->
### `<Dial>`：表盘

只有一个关键量需要盯着看时用（速度、效率、电压是否超额定）。

```
<Dial title="单只电热器电压" expr="U" min={0} max={250} unit="V" symbol="U"
  arcs={[{from: 200, to: 220, color: "field", label: "额定"}]}
  footer={[{label: "额定", from: 200, to: 220, color: "field"}]} />
```

`arcs` 在刻度外圈画色带；`footer` 在表盘下方列出区间说明；`step` 控制刻度间隔。


<!-- /region -->
