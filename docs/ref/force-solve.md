---
id: force-solve
layer: L2
title: 受力求解
related:
  - force-diagram
  - motion-forces
---

未知力写 solve，组件按合力方程解出来。

<!-- region:force-solve -->
#### 受力求解：未知力交给组件算

不知道的力不要手算，写 `solve` 给它起个名字，组件按 **ΣF = 0**（平衡）或 **ΣF = ma**（给了 `accel`）解出来。解出的名字和 `<Define>` 一样，可以给别的力、`Readout`、`Plot`、`Status` 和 `answers` 用；图下方自动写「由 ΣF = 0 解出：…」。

```
<ForceDiagram
  surface={{type: "incline", angle: 30}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g"},
    {label: "N", angle: 120, solve: "N"},
    {label: "f", angle: 30, magnitude: "mu*N", at: "contact"}
  ]}
  mass="m"
  accel={{angle: 210, solve: "a"}}
/>
```

| 写法 | 说明 |
|---|---|
| `solve: "N"` | 这个力方向已知（`angle`）、大小未知，解出的大小叫 `N` |
| `solve: {magnitude: "T", angle: "phi"}` | 大小和方向都未知（如"求另一根绳的拉力及方向"）；也可以只写 `angle`（大小已知、方向未知） |
| `accel` | 加速度 `{angle, magnitude}`，同样可以写 `solve`（如 `{angle: 0, solve: "a"}` 求加速度大小）；给了 `accel` 必须给 `mass` |
| `mass` | 质量（数字或表达式），只和 `accel` 一起用 |

- 平面上只有两个方程，**最多两个未知量**；别的力可以引用解出的名字（如 `f = μN`），组件会一起解。
- 解出来是负数表示真实方向与所画方向相反：箭头自动反向，校验给提醒。
- 已知的力本身不平衡（比如只解竖直方向的 N，却还有水平力）时，校验给提醒「无法满足 ΣF = 0」。
- 两个未知力共线时没有唯一解，结果为 NaN 并提醒。


<!-- /region -->
