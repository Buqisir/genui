---
id: gas-tube
layer: L1
title: 气柱、液柱、活塞
component: GasTube
related:
  - gas-tube-notes
---

## 何时用

- 细管、气缸、U 形管里的气柱、液柱、活塞，跟着一个参数准静态变化。p、长度和功用它发布的函数，不要自己写 `pV = C`。初态和开口的限制见 `gas-tube-notes`。
- 不要用：倒扣的瓶子、潜水钟、变截面容器 → `<Sim>` 或 `<Figure>` 里 `v.vessel`，状态方程写 `<Define>`（gd22-16）。
- 碰撞、振荡要随时间播放时用 `motion`，不是这根管子。

## 最小例子

```lesson
---
id: example-gas-tube
title: 竖直管
question: 示意
answers:
  - { name: pA, value: 86, unit: cmHg }
---

<Param name="Tk" label="温度" unit="K" min={300} max={400} step={10} value={300} />

<Define name="pA" expr="tube.pA(Tk)" />

<GasTube name="tube" units="cmHg" p0={76} path={[{length: 80, angle: 90}]} start="closed" end="open" contents={[{gas: "A", L: 20, p: 86, T: 300, Tnow: "heat"}, {liquid: "Hg", L: 10}]} drive={{name: "heat", from: 300, to: 400}} at="Tk" />
```

## 常见错误

- 瓶子画成水平管加质量为 0 的活塞 → `v.vessel`（本组件只会画等截面的管子；gd22-16，见 `gas-tube-notes`）。
- 开口端紧挨气柱 → 中间加液柱或活塞（校验：「开口端不能紧挨气柱」）。
- `drive.name` 和滑块同名 → 滑块叫 `Tk`，过程变量另起（如 `heat`），画面用 `at="Tk"`。
- cmHg 里写活塞 → 水银用液柱；活塞只用于 SI（校验：「cmHg 模式下不能放活塞」）。
- 手写 `p*V` 去画 p–V 图 → 用 `tube.pA(s)`、`tube.VA(s)`。

## 属性
<!-- props:GasTube -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| size | string |  | 版面宽度：full、wide 或 narrow |
| hud | array |  | 左上角读数列表，每项见规范原文 |
| legend | array |  | 图例列表，每项 {kind, label} |
| note | string |  | 画面下方一行说明 |
| name | string | 是 | 发布函数时用的名字 |
| title | string |  | 标题 |
| units | string |  | SI，或 cmHg |
| p0 | number 或 expr |  | 大气压 |
| g | number 或 expr |  | 重力加速度 |
| S | number 或 expr |  | 横截面积 |
| gap | number 或 expr |  | 管口到第一段的初始距离 |
| path | array | 是 | 管子折线，每段 {length, angle} |
| start | string |  | 始端 closed 或 open |
| end | string |  | 末端 closed 或 open |
| contents | array | 是 | 气柱、液柱、活塞，从始端排 |
| drive | object | 是 | 过程变量 {name, from, to} |
| stop | string |  | 停下时驱动值的名字 |
| at | expr |  | 画面停在这个驱动值 |
<!-- /props -->

## 规范原文
<!-- region:gas-tube -->
### `<GasTube>`：气柱、液柱、活塞

一根细管里排着气柱、液柱和活塞，准静态地跟着一个参数变（加热、转角度、再灌一段水银）。组件按气体定律和力平衡把每一段的压强、长度算出来，并画出管子。不要自己写 pV = C 去驱动画面或曲线。

```
<Param name="Tk" label="气体温度" unit="K" min={300} max={600} step={15} value={300} />

<GasTube
  name="cyl"
  units="SI"
  p0={1e5}
  g={10}
  S={0.01}
  path={[{length: 0.5, angle: 90}]}
  start="closed"
  end="open"
  contents={[
    {gas: "A", L: 0.2, p: 1e5, T: 300, Tnow: "T", cv: 2.5},
    {piston: "P", m: 10, thick: 0.02, stops: {min: 0.2, max: 0.3}, leave: "Tleave", hit: "Thit"}
  ]}
  drive={{name: "T", from: 300, to: 600}}
  at="Tk"
/>

<Readout items={[
  {label: "离开下挡板", symbol: "T_离", expr: "Tleave", unit: "K"},
  {label: "到达上挡板", symbol: "T_到", expr: "Thit", unit: "K"}
]} />

<Plot
  x={{label: "V", unit: "m³", min: 0.0015, max: 0.0035}}
  y={{label: "p", unit: "Pa", min: 0.9e5, max: 1.5e5}}
  series={[{label: "p–V", x: "cyl.VA(s)", expr: "cyl.pA(s)", over: {name: "s", min: 300, max: 600}, point: "Tk"}]}
/>
```

| 属性 | 说明 |
|---|---|
| `name` | 发布一组函数，自变量都是驱动值。气柱 `X` 有 `pX(驱动)`、`LX`、`VX`、`TX`、`WX`、`UX`、`QX`；活塞有 `x活塞名`；液柱有 `x液柱名`（靠 `start` 一端的位置）和 `dz液柱名`（靠 `end` 一端减靠 `start` 一端的高度差，向上为正）。另外有 `from`、`to`。例：`cyl.pA(Tk)` 是滑块温度下的压强 |
| `units` | `SI`（默认，Pa、m、kg）或 `cmHg`（cmHg、cm）。cmHg 里不能放活塞 |
| `p0` | 大气压。开口端的压强就是它。SI 默认 `1e5`，cmHg 默认 `76` |
| `g` | 重力加速度，SI 默认 `10`。cmHg 里液柱按「1 cm 水银 ↔ 1 cmHg」计，不用写 `g` |
| `S` | 横截面积（m²）。SI 必填；cmHg 里长度用 cm，不需要面积 |
| `gap` | `start="open"` 时，管口到第一段的初始距离，默认 `0` |
| `path` | 管子折线。每段 `{length, angle}`，`angle` 是相对水平向右的角度（度，逆时针为正，向上是 90），可写表达式 |
| `start` / `end` | `closed` 或 `open`，默认都是 `closed` |
| `contents` | 从 `start` 到 `end` 依次排列。气柱 `{gas, L, p?, T?, Tnow?, amount?, cv?}`；液柱 `{liquid, L, rho?}`（SI 必填密度）；活塞 `{piston, m, thick?, stops?: {min?, max?}, force?, leave?, hit?}`。相邻的液柱和活塞合成一块一起动。`T` 是初温，必须用热力学温度（K，默认 300；27 ℃ 写 300）。`Tnow` 是过程中的温度（K，可用驱动名），不写就等温；`drive.from` 时它必须等于 `T`。`amount` 与气体的物质的量成正比（只看比值，默认 1），打气、漏气时用。`cv` 是摩尔定容热容除以 R 的倍数（单原子 1.5，双原子 2.5），写出后才有 `U` 和 `Q`。`force` 沿管子 +s 方向（可用这个活塞的位置 `x活塞名`）。`stops` 是挡板卡住的位置区间（活塞靠 `start` 一端的位置）；`leave`、`hit` 是离开、碰上挡板时的驱动值 |
| `drive` | `{name, from, to, steps?}`。`name` 是组件内部的过程变量（如 `T`、`θ`、`pour`），各段长度、角度、温度都可以写成它的表达式；它不能和 `<Param>`、`<Define>` 重名。`from` 可以大于 `to`（降温、往回转）。`steps` 默认 200 |
| `stop` | 可选。发布过程停下时的驱动值（液柱到达开口、气柱被压没）；一直没停就是 NaN。题目问「水银恰好到达管口 / 恰好不溢出时的温度」用它。写了 `stop` 就表示预期会停，校验不再给警告 |
| `at` | 画面停在这个驱动值（通常就是滑块，如 `at="Tk"`）。不写就停在 `from` |


<!-- /region -->
