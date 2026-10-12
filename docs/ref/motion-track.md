---
id: motion-track
layer: L2
title: 沿轨道运动
related:
  - motion
  - motion-forces
---

物体被约束在直线段和圆弧拼成的轨道上。

<!-- region:motion-track -->
#### 沿轨道运动：直线 + 圆弧的组合轨道

一个物体被约束在直线段和圆弧拼成的轨道上。不写 `along`、`bodies`、`rates`，写 `mass`、`forces` 和 `track`。状态量是 `s`（从第一段起点沿轨道量的弧长）和 `v`（沿 +s 的速度）。支持力和摩擦力由组件算，**不要**在 `forces` 里写 `solve` 或 `friction`。

```
<Motion name="ball" mass="m" until={6}
  state={{s: 0, v: "v0"}}
  track={{
    pieces: [
      {line: [0, "h", "L1", "h"]},
      {arc: ["L1", "h + R", "R", -90, 270]},
      {line: ["L1", "h", "L1 + L2", "h"], mu: "mu"},
      {arc: ["L1 + L2", "h + R", "R", 90, 0], pipe: true}
    ],
    normal: "N", friction: "f", leave: "tLeave", together: "tStop", slip: "tSlip",
    start: "fly", end: {bounce: 1}
  }}
  forces={[{label: "G", angle: -90, magnitude: "m*g"}]}
  events={[{name: "tLand", when: "y", dir: "down", stop: true}]}
  read={{NC: "N @ tLeave"}} />
```

- `pieces` 按行进顺序接上。`line: [x1, y1, x2, y2]`；`arc: [cx, cy, r, a1, a2]`（度，逆时针为正，从 a1 走到 a2，和 `v.track` 一样）。坐标、`mu`、`static` 可以是数字或表达式，但轨道在一次运动里不变，只能用参数，不能用 `t`、状态量或 `N` 这些随时间变的名字。
- 剖面线在行进方向的右侧，物体在左侧：从左到右的直线，物体在上方；逆时针圆弧，物体在内侧（竖直圆轨道）；顺时针圆弧，物体在外侧（凸拱）。某一段写 `flip: true`，或整条轨道写 `flip: true`，就换到另一侧（两处都写则抵消）。
- 支持力沿物体这一侧的法向，**正**表示轨道把物体往离开实体的方向推（名字默认 `N`，用 `normal` 改）。圆轨道最高点附近它会减小；单侧轨道上减到 0 就脱离，之后按抛体飞；从直线以大于 √(gR) 的速率进入凸拱，进入的那一刻就飞出（也记入 `leave`）。`pipe: true`（写在某一段，或整条 `track` 上）是细管，两边都有壁，支持力可以为负，不会因支持力变号而脱离。
- 摩擦写在**那一段**上：`mu` 是动摩擦因数（默认 0），`static` 是静摩擦因数（默认等于 `mu`）。滑动时大小是 μ|N|、方向与速度相反；速度减到 0 时，静摩擦够就粘住（`together`），不够就反向滑；粘住后切向力超过 μs|N| 再滑动（`slip`）。光滑段不写 `mu`。停在水平光滑面上的球没有切向力，会一直停着。
- `leave` 是离开轨道的时刻（中途脱离，或从一端飞出），只发布第一次。`start`、`end` 是 s 退回 0、或走到轨道全长时怎么办：`"fly"`（默认，沿当时的切线飞出，也记入 `leave`）、`"stop"`（积分停在这里，不算离开）、`{bounce: e}`（速度变成 −e·v，比如尽头的弹性板）。
- 组件随时间给出 `x` `y` `vx` `vy` `speed`、`tangent`（+s 的方向，度）、`normalDir`（支持力为正的方向，度）、`acc`（沿轨道的加速度；飞起来以后是 0）、`accx` `accy`（含向心加速度），以及支持力和摩擦力（写了 `friction` 才发布摩擦力）。`forces` 里可以用这些名字，例如始终逆着 +s 的阻力 `{angle: "tangent + 180", magnitude: "0.2*m*g"}`。
- 离开以后**不会再落回轨道**。飞行中 `s`、`v` 冻住（`tangent` 也停在离开时 +s 的方向），位置和速度看 `x` `y` `vx` `vy` `speed`。要停在落地，自己写事件，如 `when: "y"`。
- 两段相接处按光滑连接处理：速率保留，方向换成下一段的切线。**不要**手写 `v² = v0² − 2gh` 或 `N = mv²/r − mg` 去驱动画面。
- 带电小球可以同时写 `charge` 和 `fields`（匀强电场里的圆轨道）。
- 画面用 `v.track(m, p.ball)` 画这次运动冻住的轨道（细管是双线，球走中心线）。`(x, y)` 是接触点；画有大小的小球时用返回值的 `place`：`const tr = v.track(m, p.ball); const [bx, by] = tr.place(s, r)`（`s` 是 `at` 返回的状态，要带 `x` `y` `normalDir` `side`），单侧轨道上球心沿法向离开轨道 r，细管里和飞行中就在 `(x, y)`。`side` 在单侧轨道上为 1，细管里、飞起来以后为 0。


<!-- /region -->
