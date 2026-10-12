---
id: sim-effects
layer: L2
title: 动效
related:
  - sim
  - sim-api
---

轨迹、频闪、事件脉冲和沿路径流动的粒子。

<!-- region:sim-effects -->
**动效**（只用这几种，保持克制）

- `v.trail(m, fn, {kind, every, clip})`：已走过的轨迹，越靠近现在越亮。`fn(s, t)` 返回 `[x, y]`；写 `every` 同时打频闪点。`clip` 与 `v.efield` 相同（盒子或多边形），轨迹只画在区域内。
- `v.strobe(m, fn, {kind, every})`：等时间间隔的频闪点，看出加速/减速。
- `v.event(m, x, y, text, {at, kind, digits})`：关键事件（碰撞、共速、点火）。在 `at` 时刻附近脉冲并弹出带时刻的标签，过后自动消失。时刻的小数位数和时间轴一致（随时长自动定），`digits` 可改。几个事件挨得近、同一帧都还在显示时，只显示时刻最晚的那个（同一时刻的都显示）。
- `v.pulse(m, x, y, {kind})`：持续脉冲（如正在加热的点）。
- `v.particles(m, points, {kind, speed, gap})`：沿折线流动的粒子（电流、气流、光子），`speed` 单位 px/s。


<!-- /region -->
