---
id: force-diagram
layer: L1
title: 受力分析图
component: ForceDiagram
related:
  - force-solve
  - motion
---

## 何时用

- 受力分析、平衡、用牛顿第二定律求未知力。三力平衡、动态平衡加 `triangle`。
- 未知力写 `solve`，不要手写正交分解。解法见 `force-solve`。
- 摩擦、碰撞、变力要随时间变化：用 `motion`。图上的大小可以写 `pk.f(t)`，跟着动画走。
- 只画装置、不分析力：用 `figure` 或 `sim`。速度、绳的走向用 `guides`，不要当成力。

## 最小例子

```lesson
---
id: example-force-diagram
title: 水平面上的物块
question: 支持力是多少？
answers:
  - { name: N, value: 10, unit: N }
---

<Param name="m" label="质量" value={1} min={0.5} max={2} unit="kg" />

<Param name="g" value={10} hidden />

<ForceDiagram title="物块受力"
  surface={{type: "ground"}}
  body={{shape: "block", label: "m"}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g"},
    {label: "N", angle: 90, solve: "N"}
  ]}
/>
```

水平面平衡，不写 `mass` 和 `accel`。`N` 由 ΣF = 0 解出，等于 10 N。`<ForceDiagram>` 本身就是情景。

## 常见错误

- `{label: "N", angle: 90, magnitude: "m*g", solve: "N"}` → 已知和求解二选一（`magnitude 既给了值又要求解，二选一`）。
- 两个未知力方向相同 → 换成不共线的未知量，或少解一个。校验：`力的方程无唯一解（未知量所在的力共线或互相抵消）`，结果是 NaN。
- 水平方向还有力，却只 `solve` 竖直的 N → 把该写的力写上（`给定的力无法满足平衡 ΣF = 0`）。
- 三个以上未知量 → 平面上只有两个方程（`最多解两个未知量`）。
- 写了 `mass` 却没有 `accel`，或有 `accel` 没有 `mass` → 平衡不要质量；求加速度两者都要。
- `surface={{type: "incline", angle: -30}}`，斜面却向右上 → 正值表示向右上方升高。沿斜面向上就是这个角。

## 属性
<!-- props:ForceDiagram -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| size | string |  | 版面宽度：full、wide 或 narrow |
| title | string |  | 标题 |
| surface | object |  | 接触面 {type, angle, …} |
| body | object |  | 物体 {shape, label, …} |
| forces | array | 是 | 力的列表，每项见规范原文 |
| decompose | object |  | 把第几个力沿坐标分解 |
| triangle | object 或 boolean |  | 右侧的力矢量三角形 |
| scale | object |  | 比例尺，如 {max} |
| mass | number 或 string |  | 质量，只和 accel 一起用 |
| accel | object |  | 加速度 {angle, magnitude} |
| guides | array |  | 虚线方向，不参与求解 |
| values | string |  | 数值位置：corner 右上角列表（默认）或 inline 箭头旁 |
<!-- /props -->

## 规范原文
<!-- region:force-diagram -->
### `<ForceDiagram>`：受力分析图

```
<ForceDiagram
  title="物块受力"
  surface={{type: "incline", angle: "theta", angleLabel: "θ"}}
  body={{shape: "block", label: "m"}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g", showValue: true, unit: "N"},
    {label: "N", angle: "90 + theta", magnitude: "m*g*cos(deg(theta))"},
    {label: "f", angle: "theta", magnitude: "f"}
  ]}
  decompose={{force: 0, axes: "incline", labels: ["mg sinθ", "mg cosθ"]}}
/>
```

| 属性 | 说明 |
|---|---|
| `surface.type` | `none`（悬空）、`ground`（水平地面）、`incline`（斜面）、`ceiling`（天花板，物体挂在下面） |
| `surface.angle` | 斜面倾角（度，可写表达式）。**正值表示斜面向右上方升高**；沿斜面向上的方向角就是 `theta`，垂直斜面向外是 `90 + theta` |
| `body` | `shape` 取 `block`（物块）、`ball`（小球）、`particle`（带电粒子，配 `charge: "+"` 或 `"-"`，力从粒子边缘画出）、`rod`（导体棒）、`knot`（绳结：三绳共点平衡，每个力都画成沿绳的拉力，绳子从结点延伸出去）；`label` 自动放在箭头最少的一角，中文标签不用斜体。`angle` 是物体自身的转角（度，不写就跟表面），斜靠的杆用它 |
| `forces` | 每个力：`label`、`angle`（度，从水平向右逆时针量，可写表达式）、`magnitude`（表达式）或 `solve`（未知，见下文「受力求解」）；`at` 见下；`showValue` 为真时显示数值，配合 `unit`、`digits`：数值列在卡片右上角（按力的顺序、与箭头同色），箭头旁只写符号；整张图写 `values="inline"` 才把数值写在箭头旁（只有一个力、或讲解时要指着箭头读数时用）。`role: "direction"` 是方向而不是力 |
| `guides` | 可选。`[{label, angle, at, color}]`：虚线方向（速度、绳的走向）。长度固定，不进比例尺，不参与 `solve`，不要写 `magnitude`。角度可以是速度方向的表达式 |
| `decompose` | 可选。把第 `force` 个力沿 `incline`（斜面方向）或 `xy`（水平竖直）分解，画虚线分力 |
| `triangle` | 可选。在右侧画力的矢量三角形：各力首尾相接、严格按比例（不套用最短长度）。`true` 按 `forces` 顺序，或 `{order: [2, 0, 1], resultant: "F_{合}", title}` 指定顺序。闭合时注明「合力为零」；不闭合时用虚线画出合力（从第一个力的起点指向最后一个力的终点）。三力平衡、动态平衡（拖滑块看三角形变形）都用它。**动态平衡里一个力不变、另两个力夹角不变**（如"保持 ∠OMN 不变"）时加 `circle: true`（或写成圆的标签文字）：把不变的力排第一个，画出经过三角形三个顶点的虚线辅助圆，在后两个力的交点标出夹角（`angleLabel`，如 `"180°−α"`）。圆按力的方向算，其中一个力暂时为零时也画得出来；三角形按圆定位、圆的大小固定，拖滑块时只有交点沿圆移动，画幅不跳。只适用于三个力 |
| `values` | 可选。`corner`（默认）把 `showValue` 的数值列在右上角；`inline` 写在箭头旁，如「G = 20 N」 |
| `scale.max` | 可选。比例尺对应的最大力；不写时取最大的力 |

箭头长度按大小比例绘制，过小的力保留最短长度；标签自动避开箭头和物体；下方自动加比例说明。大小为 0 的力不画；大小为负时箭头反向画。

`at` 取 `center`（默认）、`contact`，或 `[x, y]`。x、y 以物体**半长、半高**为单位，原点在中心，+x 沿物体、+y 朝上（物体转了 `body.angle` 就跟着转）。`[-1, 0]` 是左端，`[1, 0]` 是右端，`[0, 0]` 是中心。共点力不写 `at`，仍画在中心。同一个物体上重力在质心、弹力在端点，就各写各的 `at`，不要拆成几张图。


<!-- /region -->
