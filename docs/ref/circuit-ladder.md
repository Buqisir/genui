---
id: circuit-ladder
layer: L2
title: 梯子布局
related:
  - circuit
  - circuit-solve
---

梯子布局的限制，以及电压表怎么并。

<!-- region:circuit-ladder -->
`ladder` 的要求：`source` 是元件或元件串联；`load` 是元件串联，其中恰好一个 `repeat` 或 `parallel`，每条支路只有一个元件。支路超过 5 条时只画前三条、省略号和最后一条，每条支路顶上标 `item.note`。适合「n 个用电器并联，经输电线接电源」这类题。

电压表要并在某个元件两端时，把它和该元件写成一个 `parallel`。有电流时电热器发热发光。


<!-- /region -->
