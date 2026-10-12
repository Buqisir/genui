---
id: motion
layer: L1
title: 运动积分
component: Motion
related:
  - motion-forces
  - motion-track
  - motion-axis
  - motion-circuit
  - motion-fields
  - force-diagram
---

## 何时用

- 变力、摩擦、反弹、多阶段：`<Motion>` 积分，`<Sim>` 画。匀变速可在 `at` 里写公式。
- 斜面、地面、连接体、板块、何时共速：读 `motion-forces`。写 `mass` 和 `forces`（或 `bodies`），不要手写加速度。
- 直线段加圆弧、脱离和反弹：读 `motion-track`。杆、圆盘绕固定轴：读 `motion-axis`。
- 导体棒、双棒、棒接电容：读 `motion-circuit`。带电粒子在电、磁场中：读 `motion-fields`，不要手写半径公式。
- 只画一张静受力图、不随时间积分：用 `force-diagram`。

## 最小例子

```lesson
---
id: example-motion
title: 物块滑行停下
question: 初速度 4 m/s、动摩擦因数 0.2 时，物块何时停下？
answers:
  - { name: tStop, value: 2, unit: s }
---

<Param name="v0" label="初速度" value={4} min={1} max={8} unit="m/s" />

<Param name="mu" value={0.2} hidden />

<Param name="m" value={1} hidden />

<Param name="g" value={10} hidden />

<Motion name="blk" mass="m" along={0} until={4}
  state={{x: 0, v: "v0"}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g"},
    {label: "N", angle: 90, solve: "N"},
    {label: "f", angle: 180, magnitude: "mu*m*g"}
  ]}
  events={[{name: "tStop", when: "v", dir: "down", set: {v: 0}, stop: true}]}
/>

<Sim title="滑行" duration="tStop" params={["blk"]}>
sim({
  at(t, p) { return p.blk.state(t) },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -0.2, xmax: 5, ymin: -0.3, ymax: 1 })
    v.line(m, 0, 0, 4.6, 0, { color: v.color.steel })
    v.rect(m, s.x, 0, 0.35, 0.25, { fill: v.color.graphite })
  },
})
</Sim>
```

`events` 在速度过零时记下 `tStop` 并停住。`g` 要自己声明。

## 常见错误

- `<Define name="gEff" expr="g - aCup" />`，同时 `<Motion>` 写了 `aFrame` 或浮力 → 删掉自己的 `gEff`。组件会发布它（多个物体叫 `gEffA`）。zj-02：`gEff 是组件算出的随时间变化的量，与课件里已声明的名字重名`。重力仍写 `m*g`，不要再乘一次 `gEff`。
- 板块上再写 `{label: "f'", angle: 180, magnitude: "fC"}`，而 `fC` 是正在求的摩擦 → 删掉这份力，只留 `friction: {mu, normal, with: "AB", together: "tSame"}`。zj-30 因此 `<Motion> 初始参数下：Ng 沿运动方向，无法由垂直方向的平衡求出`，然后 `初始参数下 tSame = NaN（不是有限数）`，`tRel` 算出 NaN，和 `answers` 对不上。支持力的 `solve` 要垂直于 `along`。
- 不写 `state` / `rates`，也不写 `mass` + `forces` → 二选一（`缺少属性 rates（或者写 mass + forces…）`）。
- 同一个物体两个力都写 `solve` → 只留垂直于运动方向的那一个（`最多一个力写 solve`）。
- `<Sim>` 里调用 `locate(...)` 找时刻 → 沙箱没有这个函数（zj-04：`locate is not defined`）。时刻用 `events` 的名字，位置用 `p.blk.state(t)`。

## 属性
<!-- props:Motion -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 运动的名字，结果挂在它下面 |
| state | object |  | 状态量及初始值 |
| rates | object |  | 各状态量对时间的变化率 |
| mass | number 或 expr |  | 质量 |
| charge | number 或 expr |  | 电荷量，带正负 |
| along | number 或 expr |  | 直线运动方向角（度） |
| forces | array |  | 受力列表，每项见规范原文 |
| fields | array |  | 电场与磁场列表，每项见规范原文 |
| bodies | array |  | 多个物体，每项 {name, mass, …} |
| ropes | array |  | 绳连接的物体对 |
| track | object |  | 直线段加圆弧的轨道 |
| axis | object |  | 固定转轴及转动惯量 |
| torques | array |  | 纯力矩列表 |
| until | number 或 expr | 是 | 最长积分时长 |
| events | array |  | 事件列表 {name, when, …} |
| read | object |  | 要发布的读数 |
| steps | number |  | 积分步数，默认 800 |
| label | string |  | 标签 |
| circuit | object |  | 接上的电路，写法同 Circuit |
| aFrame | number 或 expr |  | 容器加速度，向下为正 |
| frame | string |  | 参考系用的物体名 |
| tip | object |  | 翻倒判断，见规范原文 |
<!-- /props -->

## 规范原文
<!-- region:motion-core -->
### `<Motion>`：运动积分

只写受力（各状态量的变化率），不写解析解。组件用 RK4 积分，用二分法定位事件时刻，结果作为名字交回页面。不显示在页面上。

```
<Motion name="ball" state={{y: 0, v: "v0"}} rates={{y: "v", v: "-g - k*v"}} until={10}
  events={[{name: "tTop", when: "v", dir: "down"}, {name: "tBack", when: "y", dir: "down", stop: true}]}
  read={{H: "max(y)", vBack: "v @ tBack"}} />
```

| 属性 | 说明 |
|---|---|
| `name` | 运动的名字。`ball.y(t)`、`ball.v(t)` 是各状态量随时间的函数（可在任何表达式里用：`<Plot>` 曲线 `ball.v(t)`、`<Readout>`/`hud` 里配 Sim 时钟写 `ball.y(tm)`）；`ball.tEnd` 是积分结束的时刻 |
| `state` | 状态量和初始值（可写表达式），如位置、速度、角度、电荷量 |
| `rates` | 各状态量对时间的变化率 d□/dt，可用 `t`、全部状态量和课件里的参数、Define。分段受力写条件表达式：`"v > 0 ? -g - a1 : -g + a2"`；没写的状态量保持不变（可当作「阶段」标记，配合事件的 `set` 切换） |
| `until` | 最长积分时长（可写表达式） |
| `events` | 事件 `{name, when, dir, stop, set}`：`when` 表达式过零的时刻（`dir: "down"` 由正变负，`"up"` 由负变正，默认两者都算）。`name` 把**第一次**发生的时刻发布出去（没发生是 NaN），可以直接写进 Sim 的 `marks`、`duration` 和 `answers`；`stop: true` 到此结束；`set: {v: "-e*v"}` 在事件时刻改状态（反弹、绳子绷紧、换阶段），可以多次发生 |
| `read` | 发布读数：`"v @ tBack"` 某时刻的表达式值（时刻可写事件名、`tEnd` 或表达式），`"max(y)"`、`"min(y)"` 全程最大/最小值（`0.5*m*v^2 @ tBack` 这样的表达式也行） |
| `steps` | 积分步数（默认 800，50–20000）。事件时刻和读数另行精确定位，一般不用改 |

**分段过程要精确**：受力在某一刻突变（刹车停住、绳子松弛、离开斜面）时，不要把条件写进 `rates`（积分步跨过突变点会让时刻偏差一步）。用一个不写 rates 的阶段量，在事件里切换：

```
<Motion name="chase" state={{xA: 0, xB: "x0", vB: "vB0", braking: 1}} rates={{xA: "vA", xB: "vB", vB: "-a*braking"}} until={120}
  events={[{name: "tStop", when: "vB", dir: "down", set: {vB: 0, braking: 0}}, {name: "tCatch", when: "xA - xB", dir: "up", stop: true}]}
  read={{dmax: "max(xB - xA)"}} />
```

**交给动画**：`<Sim params={["ball", ...]}>` 里 `p.ball.y(t)`、`p.ball.state(t)`（返回 `{t, y, v}`）、`p.ball.tEnd` 都能用，`at(t, p)` 里直接返回 `p.ball.state(t)` 即可，拖动进度条、轨迹、频闪都正常。改参数时自动重新积分。

能写简单解析解（匀变速、平抛）时仍可直接在 `at` 里写公式；有阻力、变力、弹簧、碰撞反弹、多阶段切换这类手算容易错的过程，用 `<Motion>`，关键时刻交给 `events`，不要手算后硬写进 `marks`。


<!-- /region -->
