---
id: sim-api
layer: L2
title: 沙箱接口与基本画图
related:
  - sim
  - sim-bodies
---

sim() 的入口、颜色、坐标和基本图形。

<!-- region:sim-api -->
### 沙箱里的代码

调用一次 `sim({...})`，提供以下函数：

| 函数 | 必填 | 说明 |
|---|---|---|
| `at(t, p)` | 二选一 | 解析解：返回 t 时刻的状态对象。**能写解析解就写解析解**，拖动进度条时直接算，不会累积误差 |
| `init(p)` + `step(s, dt, p)` | 二选一 | 数值解：`init` 返回初始状态，`step` 返回前进 dt 后的新状态（可以在里面用 RK4）。运行时用固定步长 1/240 s 积分，拖动进度条时从头重算 |
| `draw(ctx, s, v)` | 必填 | 画一帧。`ctx` 是 Canvas 2D 上下文，`s` 是状态，`v` 是绘图工具。参数用 `v.p`，直接写 `p` 也是同一个对象 |

`v` 提供：

- `v.t`、`v.p`、`v.width`、`v.height`：当前时刻、参数、画布尺寸（CSS 像素，已处理高分屏）。`v.duration` 是总时长，`v.night` 表示夜光主题。
- `v.color`：当前主题的颜色，物理量 `velocity force accel charge field`，中性 `ink graphite steel hairline enamel stage`（旧名 `text muted border bg panel blue orange green red purple gray` 仍可用）。**不要写死颜色值**，否则夜光主题下会看不清。
- `v.lightColor(lambda)`：波长 `lambda`（nm，380–780）对应的光谱色，返回 `rgb(r,g,b)`。只用于光本身的颜色；其余一律 `v.color`。屏上的条纹不要自己用它涂，用 `<Fringes>`。
- `v.at(t)`：取更早时刻的状态（`init/step` 写法也能用），配合轨迹和频闪。
- `v.view({xmin, xmax, ymin, ymax, pad})`：建立物理坐标到画布坐标的映射，返回 `m`，有 `m.x(x)`、`m.y(y)`、`m.s(len)`（长度换算）。**y 轴向上为正。**
- `v.line(m, x1, y1, x2, y2, opts)`、`v.circle(m, x, y, r, opts)`、`v.rect(m, x, y, w, h, opts)`、`v.path(m, points, opts)`。
  - `opts`：`color`（线条颜色）、`width`、`dash`（`true` 是默认虚线，也可写线型数组如 `[6, 4]`；`v.vec`、`v.ellipse`、`v.orbit` 等的 `dash` 同样）、`fill`（填充色，**不写就只画轮廓**）、`outline`、`close`（`path` 是否闭合）。画轨道、区域边框时只写 `color`；画实心物体时写 `fill`。
- `v.arrow(m, x1, y1, x2, y2, opts)`：箭头大小固定，不随线宽放大。
- `v.label(m, x, y, text, opts)`：文字标签。所有标签在 `draw` 结束后统一放置，**自动避开其他标签和本帧画的物体**，并且总在最上层。`v.text` 也在最后绘制。
- `v.dim(m, x1, y1, x2, y2, text, opts)`：尺寸标注线。
- `v.axisX(m, opts)`、`v.ruler(m, x1, x2, y, {step, minor, unit, body})`：刻度尺。`v.ruler` 默认画在一条铝尺身上（`body: false` 只画刻度线，和 `v.axisX` 一样）。`angle`（度，逆时针为正）让尺子绕 (x1, y) 转过去，沿斜面、斜管放尺子用；读数 k 落在沿尺方向离 (x1, y) 为 k − x1 的地方，所以要配 `equal: true` 的视图。
- `v.ellipse(m, cx, cy, rx, ry, {color, dash, from, to, rot})`：椭圆（或弧）。`from`、`to`、`rot` 都是**度**，从 +x 轴逆时针量（和本规范其他角度一样，不是弧度）；写了 `from`/`to` 就只画从 `from` 逆时针转到 `to` 的那段弧。画角度标记就用它，例如竖直线与绳的夹角 θ：`v.ellipse(m, x, y, 0.3, 0.3, {from: -90, to: -90 + theta})`。点波源的折射波前也用它：弧心和与界面的交点在 `<Define>` 里算，弧交给 `v.ellipse`，入射线和折射线用 `v.line`，不要再做波面组件。


<!-- /region -->
