---
id: motion-axis
layer: L2
title: 绕固定轴转动
related:
  - motion
  - motion-circuit
---

刚体绕一根固定轴转动。

<!-- region:motion-axis -->
#### 绕固定轴转动

刚体绕一根固定轴转动（杆、圆盘、物理摆、转动切割）。不写 `along`、`bodies`、`ropes`、`track`、`fields`，也不要手写 `rates`。状态量固定是 `theta`（转角，弧度，从写随体坐标时的那个方位量起，逆时针为正）和 `omega`（dθ/dt）。

```
<Motion name="pend" until={10} mass="m"
  axis={{x: 0, y: 0, inertia: "m*l^2", com: [0, "-l"], reaction: "F_O"}}
  state={{theta: "th0", omega: 0}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g", at: "com"},
    {label: "F_A", angle: 0, magnitude: "B*I*L", at: [0, "-l"], torque: "tauA"}
  ]}
  torques={[{label: "阻力矩", magnitude: "-k*omega"}]}
  circuit={{source: {type: "battery", label: "棒（E = BLv）", emf: "B*L*l*omega*cos(theta)", r: "R", read: "I"}, load: {type: "wire"}}} />
```

- `axis.x`、`axis.y` 是轴在世界上的位置（不写就是原点）。轴一次运动里不动，只能用参数，不能用 `t`、状态量或电路读数。`axis.inertia` 是对这根轴的转动惯量；用了状态量就每一步重算。
- 随体坐标跟着 `theta` 转：世界上的点 = 轴的位置 + 把随体坐标转过 `theta`（逆时针）。`+x` 向右、`+y` 向上，力的 `angle` 仍是度、从 +x 逆时针量。`body: true` 时角度跟着刚体走（世界角度 = `angle` + `theta` 的度数），用来写始终垂直于杆的安培力。
- `forces` 里每个力都要写 `at`：`"com"`，或随体坐标 `[x, y]`。力矩是 r × F 的 z 分量，r 是从轴到作用点的世界矢量，逆时针为正。`torque: "名字"` 把这个力的力矩发出去。`torques` 是额外的纯力矩 `{label, magnitude}`（逆时针为正），比如阻力矩、驱动力矩，表达式可以用 `t`、状态量和电路的 `read`。
- `axis.com` 是质心相对轴的随体坐标 `[x, y]`，只能用参数。写了就发布质心的世界坐标 `comX`、`comY`。`axis.reaction: "F_O"` 发布轴对刚体的力 `F_Ox`、`F_Oy` 和大小 `F_O`，这要同时写 `mass` 和 `com`：质心加速度是 α × r − ω² r，轴的力 = 质量 × 质心加速度 − 全部外力。这个模式没有 `solve`、没有摩擦，轴的力不要写进 `forces`。
- 角加速度 `alpha` = 合力矩 `tau` / 转动惯量。组件给出的量都随时间变化，挂在运动名字下：`pend.alpha(t)`、`pend.tau(t)`、`pend.F_O(t)`、`pend.tauA(t)`、`pend.comX(t)`。和别的模式一样可以用 `events`、`read`、`circuit`（每一步先解电路再算力矩）。
- 转动切割的电动势写 `0.5*B*omega*r^2` 进 `circuit`，安培力矩用 `forces`（`at` 写作用点）或 `torques` 写回，不要手写 θ、ω 的 `rates`。悬挂在竖直磁场里的棒，电动势写成 `B*L*l*omega*cos(theta)` 时，水平安培力的方向要和这个正方向配成楞次定律（力矩与 `omega` 相反）。


<!-- /region -->
