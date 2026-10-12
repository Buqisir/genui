---
id: readout
layer: L1
title: 实时数值
component: Readout
related:
  - answer
---

## 何时用

- 侧栏里随参数显示几个量的当前值。
- 只盯一个量有没有超过额定或临界：用 `dial`。
- 能量或功率要分成几份对照：用 `ledger`。
- 要和学生核对的结果放 `answer`（默认收起），不要摊在 `<Readout>` 里。
- 画面角落的 1–3 个量用 `<Sim>` / `<Figure>` 的 `hud`，不要用本组件代替画面。

## 最小例子

```lesson
---
id: example-readout
title: 两车距离
question: 两车相距多远？
answers:
  - { name: dx, value: 6, unit: m }
---

<Param name="xA" label="A 的位置" value={2} min={0} max={10} unit="m" />

<Param name="xB" label="B 的位置" value={8} min={0} max={10} unit="m" />

<Define name="dx" expr="xB - xA" />

<Readout items={[{label: "距离", symbol: "Δx", expr: "dx", unit: "m", digits: 1}]} />

<Figure title="两车" params={["xA", "xB"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 10, ymin: 0, ymax: 2 })
    v.circle(m, p.xA, 0.6, 0.25, { fill: v.color.graphite })
    v.circle(m, p.xB, 0.6, 0.25, { fill: v.color.steel })
  },
})
</Figure>
```

距离是派生量，读数跟着两个滑块变。

## 常见错误

- `hud={[{label: "速度", expr: "v", color: "velocity"}]}` → 删掉 `color`。`hud` 没有这个字段（zj-02：`hud[0] 有未知字段 color（可用：symbol、label、expr、unit、digits、format）`）。颜色写在 `<Readout>` 条目上。
- `expr: xB - xA` 不加引号 → `expr: "xB - xA"`。条目里的表达式是字符串。
- `color: "heat"` → 改成物理量名，如 `force`（`颜色只能是物理量名`）。`red` 仍可用，等同 `force`。
- 条目只有 `expr`、没有 `label` → 两项都要（`items 条目缺少 label`）。

## 属性
<!-- props:Readout -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| items | array | 是 | 读数条目 {label, expr, …} |
<!-- /props -->

## 规范原文
<!-- region:readout -->
### `<Readout>`：实时数值

```
<Readout items={[
  {label: "两车距离", symbol: "Δx", expr: "xB - xA", unit: "m", digits: 1},
  {label: "B 车速度", symbol: "v_B", color: "velocity", expr: "vB", unit: "m/s", digits: 1}
]} />
```

条目字段：`label`、`expr`、`unit`、`digits`，可选 `symbol`、`color`、`format`。


<!-- /region -->
