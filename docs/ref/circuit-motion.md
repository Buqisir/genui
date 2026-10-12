---
id: circuit-motion
layer: L2
title: 画运动里的电路
related:
  - circuit
  - motion-circuit
---

把某一次运动里解出的电路画出来。

<!-- region:circuit-motion -->
**画运动里的电路**：`<Motion circuit>` 解出的电路用 `motion` 指到那个运动，不再写 `source` / `load`（二者选一，也不能再写 `transient`）。`at` 是画在哪一时刻的表达式（一个滑块或 Sim 的时钟，默认 0）。这一时刻的状态量、电路 `read` 和受力解出的量都放进绘制：`emf: "B*L*v"`、开关 `closed: "x >= 1"`、元件 `note` 都跟着变。`title`、`hud`、`note`、`current`、`flow`、`layout` 照常可用。

```
<Circuit title="导体棒的等效电路" motion="rod" at="tk" />
```

```
<Circuit
  source={{series: [{type: "generator", label: "E", emf: "E", read: {I: "I"}}, {type: "resistor", label: "r", R: "r"}]}}
  load={{series: [{type: "resistor", R: "Rw"}, {repeat: "n", item: {type: "heater", R: "Rh", read: {I: "Ih", U: "U"}}}, {type: "resistor", R: "Rw"}]}}
  current={{expr: "I", unit: "A"}}
/>
```


<!-- /region -->
