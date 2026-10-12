---
id: instrument-more
layer: L2
title: 双缝测量头
related:
  - instrument
  - fringes
---

双缝测量头，以及 fringes、pair、read。

<!-- region:instrument-more -->
| `measurementHead` | 双缝测量头。左为目镜：圆视场里是按 `fringes` 算出的双缝条纹，竖线是分划板；右为手轮，刻度和螺旋测微器相同（`value` 单位 mm，估读到 0.001 mm）。分划板对准的屏上坐标 = `value − offset`。不要手画条纹，也不要另画一把微分筒 |

`fringes`：`{lambda, d, L, offset, n, a}`。`lambda` nm，`d` 与可选缝宽 `a` 为 mm，`L` 为 m，`offset` 为 mm（默认 0，手轮零点相对中央亮纹的偏移），`n` 为介质折射率（默认 1）。目镜里的条纹就是这组参数的真实双缝图样，转动手轮时条纹相对分划板移动。

`pair`：`{x1, n, d, L}`。本仪器的 `value` 是第 `n` 条亮纹的手轮读数，`x1` 是第 1 条的读数（mm）。读数行写出 Δx = (x_n − x_1)/(n − 1) 和 λ = d·Δx/L。`d`、`L` 省略时用 `fringes` 里的。两条读数的 `offset` 相同才会消掉，所以间距只用手轮读数相减。

`read`：`{dx: "名字", lambda: "名字", x: "名字"}`。`dx` 是条纹间距（mm），`lambda` 是算出的波长（nm），`x` 是分划板的屏上坐标（mm）。`dx`、`lambda` 要有 `pair`。

<!-- /region -->
