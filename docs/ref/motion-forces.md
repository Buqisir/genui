---
id: motion-forces
layer: L2
title: 受力驱动
related:
  - motion
  - motion-track
  - force-diagram
---

不写变化率，改写质量和力，加速度由组件算。

<!-- region:motion-forces -->
#### 受力驱动：只写受力，加速度由组件按 ΣF = ma 算

不写 `rates`，改写 `mass` 和 `forces`（写法和 `<ForceDiagram>` 的力一样，`angle`、`magnitude` 可以用 `t` 和状态量），组件每一步算合力、除以质量。

| 情形 | 写法 | 状态量 | 组件算出的量 |
|---|---|---|---|
| 平面内自由运动（抛体加阻力、带电粒子在电磁场中） | `mass` + `forces`，不写 `along` | `x y vx vy` | `accx`、`accy` |
| 沿直线运动（斜面、水平面、竖直线） | 再写 `along`：+x 的方向角（度） | `x`（沿 along 的位移）、`v` | `acc`；写 `solve` 的力（一般是支持力）由垂直方向的平衡解出 |
| 多个物体（连接体、板块模型） | `bodies`：每个 `{name, mass, along, x, v, forces}`；`ropes: [["A", "B"]]` | 自动生成 `xA vA xB vB …` | `accA`、`accB`、各 `solve` 名字 |
| 沿轨道（直线段 + 圆弧） | `track`：`pieces` 是若干 `{line}`、`{arc}`；再写 `mass` + `forces` | `s`（从起点量的弧长）、`v` | `x` `y` `vx` `vy` `speed` `tangent` `normalDir` `acc` `accx` `accy`，支持力（默认 `N`），可选摩擦力 |
| 绕固定轴转动（杆、圆盘、物理摆） | `axis`：`inertia`，可选 `com`、`reaction`；`forces` 每个力写 `at`，可选 `torques` | `theta`（转角）、`omega` | `alpha`、`tau`，质心 `comX` `comY`，轴的作用力，各力的力矩 |

```
<Motion name="blk" mass="m" along={30} until={4}
  state={{x: 0, v: "v0"}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g"},
    {label: "N", angle: 120, solve: "N"},
    {label: "f", friction: {mu: "mu", static: "mus", normal: "N", together: "tStop"}, solve: "f"}
  ]} />
```

- **摩擦力**写 `friction: {mu, static, normal, with}`，不写 `angle`、`magnitude`：`normal` 是正压力（通常写支持力 `solve` 出的名字），`static` 是静摩擦因数（默认等于 `mu`），`with` 是另一个物体的名字（默认是地面/斜面）。组件自己判断方向和静/动：相对运动时是 μN、与相对速度反向；相对速度减为零时，静摩擦（≤ μs·N）够就粘住，不够就反向滑；粘住后需要的静摩擦超过 μs·N 就重新滑动。摩擦力的 `solve` 名字发布的是**沿 +x 的分量**（可正可负）。
- **摩擦事件**：`slip: "tSlip"` 记下开始滑动的时刻（从静止被拉动、物块相对木板开始滑），`together: "tSame"` 记下相对速度减为零的时刻（共速、停下）。和 `events` 的名字一样可以写进 `marks`、`Readout`、`answers`。
- **传送带**写 `friction.belt`（带面速度，可写表达式，**沿该物体 +x 为正**），不要再写 `with`。相对速度是 v − v_belt：减到 0 且静摩擦够（≤ μs·N）就粘在带上，跟着带走，不是停在地上；不够就继续滑。粘住后需要的力超过 μs·N 再松开。组件另外积出滑痕 `slide`（∫|v−v_belt| dt，只在滑动时增长）和摩擦生热 `Q`（∫ μN|v−v_belt| dt）。单物体就叫 `slide`、`Q`，多个物体叫 `slideA`、`QA`。读数写 `belt.slide(t)`、`belt.Q(t)`，或 `read` 里 `"slide @ tEnd"`。不要自己对相对速度积分。
- **浮力**写 `{label, angle, buoyancy: {rho, V}}`，不写 `magnitude`。大小是 ρ·V·g_eff，`angle` 给方向（向上写 90）。`solve: "Fb"` 把这个大小发出去。
- **非惯性系**写 `aFrame`（容器加速度，**向下为正**；吊篮以 a 向上加速就写 `"-a"`）。`bodies` 里也可以写 `frame: "篮子"`，用那个物体加速度的竖直分量。有效重力 `gEff = g − aFrame`（容器自由下落、`aFrame = g` 时为 0）。作者仍写真实重力 `m*g`，组件另加向上的惯性力 m·aFrame；浮力用 g_eff，所以完全失重时浮力和重力在容器里一起消失，弹簧力还在。不要把重力改写成 `m*gEff` 再叠一次惯性力。算出来的 `acc` 是**相对容器**的；绝对加速度向上的分量是 `aAbs`（多个物体 `aAbsA`），平面自由运动是 `aAbsx`、`aAbsy`（`aAbsy` 向上为正）。
- **翻倒**写 `tip: {halfWidth, comHeight, mu, a}`。`halfWidth` 是质心到前/后缘的水平距离 b，`comHeight` 是质心高度 h。水平加速度 `a` **向右为正**；不写就用物体自己的水平加速度（刹车的车子要写车子的 a，物体相对车子静止时自己的加速度是 0）。支持力离质心 `nAt`（向右为正，夹在 ±b）。`|a|·h > g·b` 时 `tips` 为 1，`edge` 为 −1（绕左缘，a>0）或 +1；刚好等于不算翻。`|a| > μ g` 时 `slides` 为 1；`μ < b/h` 时 `slidesFirst` 为 1（先滑）。单物体名字是 `nAt`、`tips`、`edge`、`slides`、`slidesFirst`，多个物体加物体名，读法同 `blk.tips(t)`。翻倒之后绕那条棱转，改用下文「绕固定轴转动」的 `<Motion axis>`：轴放在棱上，`inertia` 对棱，`com` 写质心相对棱的随体坐标。`tip` 只判断会不会翻、支持力移到哪，不自己把箱子转起来。
- **绳**：`ropes` 里的绳拉第一个物体沿它的 +x、拉第二个物体沿它的 −x（例：桌面上 A 的 along 指向滑轮，悬挂的 B 的 along 朝下），两者速率相同；写 `{between: ["A", "B"], solve: "T"}` 发布绳的拉力。拉力算出为负时校验提醒「绳会松弛」。
- 组件算出的量都是**随时间变化的**，挂在运动的名字下：`blk.acc(t)`、`blk.N(t)`、`blk.f(t)`，`read` 里可以直接写 `"max(f)"`、`"f @ tStop"`；`<ForceDiagram>` 的 `magnitude` 写 `"pk.fA(tk)"` 就能随动画时刻显示受力。`<Sim>` 的 `p.blk.state(t)` 也带着这些量。
- 每个物体最多一个力写 `solve`（垂直方向只有一个平衡方程）；垂直于运动方向的力不平衡（忘了支持力）时校验提醒。
- 板块模型的上下两个物体：上面物体的支持力 `solve: "NA"`，下面物体要写它的反作用力 `{label: "N'", angle: -90, magnitude: "NA"}`，地面支持力再 `solve`。物体按 `bodies` 的顺序求解，所以被引用的物体排在前面。


<!-- /region -->
