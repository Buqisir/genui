---
id: motion-circuit
layer: L2
title: 运动接电路
related:
  - motion
  - circuit
  - motion-axis
---

导体棒、双棒、棒接电容：给运动接上电路。

<!-- region:motion-circuit -->
#### 接电路：电磁感应

导体棒切割磁感线、双棒、棒接电容，给 `<Motion>` 加 `circuit`。`circuit` 的写法和 `<Circuit>` 的 `source` / `load` 一样（同一套元件、`read`、`note`、电容、线圈、开关）。区别是电路里的表达式可以用**这次运动的** `t` 和状态量（`x`、`v`，或多个物体的 `xA`、`vA`，以及 `state` 里自己加的量）。棒就是一个电源，电动势 `B*L*v`，安培力写回 `forces`：

```
<Motion name="rod" until={3} mass="m" along={0} state={{x: 0, v: 0, q: 0, Q: 0}}
  rates={{q: "I", Q: "I^2*(R + r)"}}
  forces={[
    {label: "F", angle: 0, magnitude: "F"},
    {label: "F_A", angle: 180, magnitude: "B*I*L"}
  ]}
  circuit={{
    source: {type: "battery", label: "ab（E = BLv）", emf: "B*L*v", r: "r", read: "I"},
    load: {type: "resistor", label: "R", R: "R", read: {U: "UR"}}
  }} />
```

- 电路的 `read` 名字挂在运动上，是时间的函数：`rod.I(t)`、`rod.UR(t)`，**不是**单独的顶层名字。同一个 `<Motion>` 的 `forces`、`rates`、`events`、`read` 可以直接用这些名字。电荷量和焦耳热用 `state` + `rates` 积出来（上面的 `q`、`Q`），不要再写 `q = BLx/R`。
- 每一步先解电路、再算受力，所以电动势、电阻、电容、开关 `closed` **只能**用 `t` 和状态量。用了加速度、`solve` 出的支持力或绳拉力、以及电路自己的 `read` 名字，校验会报错：那些量要等电路解完才有当前值。`note`、灯泡 `lit` 只是显示，可以用全部局部名字。
- 回路电阻写在电阻或电源内阻上。导轨两端只用导线连起来时，`load` 写 `{type: "wire"}`，棒的内阻 `r` 就是整个回路的电阻（电流 = 电动势 / r）；这时 `r` 必须写，没有内阻的电源被导线直接连起来是真短路，校验会报出来。
- **双棒**（两根棒在同一对导轨上，电动势方向相反）：两根电源串联，第二根写 `positive: "right"`。这样两棒同向运动时电动势互相削弱；`read` 放在第一根上，电流从它的正极流出为正。第一根受安培力向后（`angle: 180`），第二根向前（`angle: 0`），大小都是 `B*I*L`。负载可以是 `{type: "wire"}`，回路电阻就是两根棒的内阻。
- **棒接电容**：理想导线下充电是瞬间完成的，积分会报「时间常数太小」。给棒写一个小内阻 `r`，过渡很短，之后加速度趋于 `F/(m + B²L²C)`。
- **开关**可以跟时刻或位置走：`closed: "t >= 0.5"`、`closed: "x >= 1"`。开关时刻会被精确定位；`closed` 里写的是运动自己的 `t` 或状态量，不是外面的滑块。
- 用 `<Circuit motion="rod" at="tk">` 把这个电路画出来（见 `<Circuit>`）。
- **已知限制**：电动势或电阻随位置**突变**（线框进入、离开磁场边界，写成 `emf: "x < d ? B*L*v : 0"`）时，跨过边界的那一步有误差，大小和步长成正比（默认步数下速度差在万分之几）。需要更准时加大 `steps`；在边界加一个事件（`events: [{name: "tIn", when: "x - d"}]`）让积分在边界处落一步，误差还能再小一半左右。


<!-- /region -->
