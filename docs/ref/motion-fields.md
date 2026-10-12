---
id: motion-fields
layer: L2
title: 带电粒子的电场与磁场
related:
  - motion
  - sim-fields
---

平面里的带电粒子：写电荷和场，不要手写半径公式。

<!-- region:motion-fields -->
#### 带电粒子：电场与磁场

平面里的带电粒子给 `<Motion>` 写 `charge` 和 `fields`，不要手写 `r = mv/(qB)`、偏转距离、速度选择器公式去驱动画面。`state` 写 `x`、`y`、`vx`、`vy`（自由运动，不写 `along`、`bodies`；沿轨道的带电小球见上面「沿轨道运动」，同样写 `charge`、`fields`）。洛伦兹力 `q(E + v×B)` 由组件算进加速度。

```
<Motion name="pt" until={3} mass="m" charge="q"
  state={{x: -1, y: 0, vx: "v0", vy: 0}}
  fields={[
    {label: "偏转电场", E: "U/d", angle: -90, region: {xmin: 0, xmax: "L", ymin: "-d/2", ymax: "d/2"}, exit: "tOut"},
    {label: "圆形磁场", B: "B0", dir: "out", region: {cx: 0, cy: 0, r: "R"}, enter: "tIn", exit: "tLeave"},
    {label: "半圆磁场", B: "B0", dir: "in", region: {cx: 0, cy: 0, r: "R", from: 0, to: 180}}
  ]}
  read={{yOut: "y @ tOut"}} />
```

- `charge` 是电荷量，带正负。`fields` 每一项是下面三种之一：匀强电磁场、点电荷、径向电场。
- **重力不会自动加上。** 只写 `charge`、`fields` 时粒子只受电场力和洛伦兹力。带电小球、油滴、微粒这类要算重力的，再写 `forces`（和受力驱动的写法一样），场力和 `forces` 合在一起按 ΣF = ma 算。漏了重力，竖直方向不动，靠 `y` 触发的事件永远不发生，读数是 NaN。
- `charge` 可以用状态量，碰板后电量改变就用一个状态量记碰撞次数，在事件的 `set` 里改它：

```
<Motion name="pt" until={1} mass="m" charge="hit < 0.5 ? q1 : q2"
  state={{x: 0, y: "h", vx: 0, vy: 0, hit: 0}}
  forces={[{label: "G", angle: -90, magnitude: "m*g"}]}
  fields={[{label: "E", E: "U/d", angle: 0, region: {xmin: 0, xmax: "d", ymin: 0, ymax: "h"}}]}
  events={[
    {name: "tHit", when: "y", dir: "down", set: {vy: "-k*vy", hit: 1}},
    {name: "tHit2", when: "(hit - 0.5)*y", dir: "down", stop: true}
  ]}
  read={{x1: "x @ tHit", x2: "x @ tHit2"}} />
```

- **匀强电场**写 `E`（大小）和 `angle`（场强方向，度，0 向右，逆时针为正；`E` 写成负数时方向再转 180°）。区域内不随位置变。
- **磁场**写 `B`（大小）和 `dir`：`"out"` 垂直纸面向外（⊙），`"in"` 向里（×）。正电荷在向外的磁场里顺时针转。径向场也可以同时带这样一个匀强磁场。
- **点电荷**写 `Q`、`x`、`y`（位置只能用参数）。库仑力 `k Q q / r²`，同号相斥。`k` 默认 `9e9`，缩放单位写 `k: 1`。`radius` 和 `hit` 一起写：粒子到该电荷的距离降到 `radius` 时停下，并记下这个时刻，避免一头扎进 r → 0。
- **径向电场**写 `radial: true`、`cx`、`cy`、`E`。`E` 是从中心向外的场强，负值向里；表达式里可以用 `r`（到中心的距离，只在这一项的 `E` 里代表距离），例如线电荷、圆柱电容器 `E: "a/r"`。不要同时写 `angle`。圆心只能用参数。
- 非匀强电场（点电荷、E ∝ 1/r 的径向场）也写进 `fields`，不要在 `E` 里用 `x`、`y` 拼方向。
- `E`、`B`、`angle`、`Q`、`k` 不写 `t` 和状态量时，一次运动里保持进入积分前的值；写了 `t` 或状态量就每一步重算（交变电场 `E: "E0*sin(ω*t)"`）。点电荷和径向场随位置变，每一步按粒子当前位置重算。
- **区域** `region` 三选一，边界在一次运动里不变，只能用参数：矩形 `{xmin, xmax, ymin, ymax}`（缺的那一侧是半平面）；圆 `{cx, cy, r}`，可再写成对的 `from`、`to`（度，从 +x 逆时针，扇形是 from 到 to 的那一段；不写就是整圆，上半圆写 `from: 0, to: 180`），再写 `inner`（`0 ≤ inner < r`）就是圆环或扇环；多边形 `{points: [[x, y], ...]}`。不写 `region` 就是整个平面。
- `enter`、`exit` 是进入、离开该区域的时刻，和 `events` 的名字一样能写进 `read`、`marks`、`Readout`。粒子一开始就在区域里时，`enter` 记为 0。一次都没进入，校验提醒。`hit` 同样是事件名字。
- 同一条边界上进入和离开都落在精确时刻（圆环的内圆弧也一样），力不会在边界附近被积分步长抹平。
- 画面用 `v.regions(m, p.pt)` 画这些区域（磁场用 × / ⊙，匀强电场用平行箭头，径向电场用径向箭头，点电荷画成带 ± 的电荷）。点电荷的电场线用 `v.regions(m, p.pt, {lines: true})`，或在那一项上写 `lines: true`。不要自己用 `v.field` 另画一块对不上运动的区域。


<!-- /region -->
