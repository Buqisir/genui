---
id: sim
layer: L1
title: 沙箱动画
component: Sim
related:
  - sim-api
  - sim-bodies
  - sim-scene
  - sim-fields
  - sim-apparatus
  - sim-magnetics
  - sim-effects
  - sim-craft
  - figure
---

## 何时用

- 要随时间播放，又没有专用组件时用 `<Sim>`。准静态、没有时间轴用 `figure`。
- 曲线用 `plot`，受力用 `force-diagram`，电路用 `circuit`，条纹用 `fringes`，能级用 `energy-levels`，分子用 `gas-box`，气柱用 `gas-tube`。不要在 `draw` 里手画这些。
- 深入参考，各看一页：
  - `sim-api`：`sim()` 的 `at` / `draw`、颜色、`v.view`，以及线、圆、标签。
  - `sim-bodies`：`v.vec`，以及小车、物块、弹簧、汽缸。
  - `sim-scene`：玻璃容器、波、`v.optics` 光路。
  - `sim-fields`：磁场区域、`v.regions`、静电场 `v.efield`。
  - `sim-apparatus`：轨道、光电门、变压器等仪器。
  - `sim-magnetics`：螺线管、磁铁、螺绕环、回旋加速器。
  - `sim-effects`：轨迹、频闪、事件脉冲。
  - `sim-craft`：作图规矩（动笔前看一遍）。

## 最小例子

```lesson
---
id: example-sim
title: 匀速物块
question: 示意
answers:
  - { name: v0, value: 1, unit: m/s }
---

<Param name="t" label="时间" value={0} min={0} max={2} step={0.1} hidden />

<Param name="v0" label="速度" value={1} min={0} max={2} step={0.1} unit="m/s" />

<Sim title="物块" height={160} duration={2} time="t" params={["v0"]}>
sim({
  at(t, p) { return { x: p.v0 * t } },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -0.2, xmax: 3, ymin: -0.4, ymax: 1 })
    v.block(m, s.x, 0, 0.4, 0.3)
  },
})
</Sim>
```

## 常见错误

- `hud` 条目写 `color` → 删掉（只有 `symbol`、`label`、`expr`、`unit`、`digits`、`format`；zj-02）。
- 沙箱里调用 `locate(...)` → 没有这个函数（zj-04）。时刻用 `marks`，坐标用 `v.view`。
- 用 `v.line`、`v.rect` 手画坐标轴、曲线或电路 → 轴用 `v.axisX`，曲线用 `plot`，电路用 `circuit`（第六节第 1 条；广东图审要求画面跟预制组件一致，不要另画一套）。
- `draw` 读了 `p.tOff`，`params` 里没有 → 列进 `params`（gd24-14；校验：「代码读取了 p.…，但没有写进 params 列表」）。

## 属性
<!-- props:Sim -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| size | string |  | 版面宽度：full、wide 或 narrow |
| hud | array |  | 左上角读数列表，每项见规范原文 |
| legend | array |  | 图例列表，每项 {kind, label} |
| note | string |  | 画面下方一行说明 |
| title | string |  | 标题 |
| height | number |  | 画布高度（像素） |
| duration | number 或 expr | 是 | 总时长（秒，物理时间） |
| time | name |  | 同步当前时刻的参数名 |
| params | names |  | 传入沙箱的名字列表 |
| marks | array |  | 关键时刻 {t, label, color} |
| loop | boolean |  | 是否循环播放 |
| autoplay | boolean |  | 滚到可见后是否自动播放 |
| playSeconds | number 或 expr |  | 1× 播完全程的真实秒数 |
| timeUnit | string |  | 时间单位，默认 s |
| step | number 或 expr |  | 单步按钮每次跳过的时长 |
| stepLabel | string |  | 单步按钮上的文字 |
<!-- /props -->

## 规范原文
<!-- region:sim-intro -->
## 五、`<Sim>`：沙箱动画

需要自动播放的过程用 `<Sim>`。外层负责播放、暂停、进度条、倍速和关键时刻按钮；模型只写**某一时刻的物理状态**和**怎么画**。

```
<Sim
  title="两车追及"
  height={260}
  duration={8}
  time="t"
  params={["vA", "vB0", "a", "x0"]}
  marks={[
    {t: 0, label: "开始刹车"},
    {t: 3, label: "距离最远"},
    {t: 5, label: "B 停车"},
    {t: 8, label: "A 追上 B"}
  ]}
>
sim({
  at(t, p) {
    const tStop = p.vB0 / p.a
    const tb = Math.min(t, tStop)
    return {
      xA: p.vA * t,
      xB: p.x0 + p.vB0 * tb - 0.5 * p.a * tb * tb,
    }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -2, xmax: 36, ymin: -1, ymax: 3 })
    v.axisX(m, { y: 0, step: 4, unit: 'm' })
    v.car(m, s.xA, 2, { color: v.color.blue, label: 'A' })
    v.car(m, s.xB, 0.8, { color: v.color.orange, label: 'B' })
  },
})
</Sim>
```


<!-- /region -->
<!-- region:sim-props -->
### 属性

| 属性 | 说明 |
|---|---|
| `title` | 标题 |
| `height` | 画布高度（像素），宽度自适应 |
| `duration` | 总时长（秒，物理时间）。可以是表达式字符串 |
| `time` | 可选。把当前时刻同步到这个参数上，其他组件（`Plot` 游标、`Readout`）就能跟着动画走 |
| `params` | 传进沙箱的参数和派生量名字 |
| `marks` | 关键时刻 `{t, label, color}`，显示在进度条上，点击跳转。播放过某个时刻后，状态栏一直显示它的 `label`（后面跟「+0.12 s」表示已过去多久），直到下一个关键时刻，所以 `label` 写阶段或事件名（「进入磁场」「绳子绷紧」「图示位置」），不要写只在那一瞬间成立的结论（「e₁ = 0」「速度最大」）；瞬间的结论用 `v.event` 标在画面上 |
| `loop` | 是否循环播放，默认否 |
| `autoplay` | 默认 `true`：滚动到可见后自动播放并循环（结尾停 1.2 s），学生一碰控件就停止自动循环。写 `false` 关掉 |
| `playSeconds` | 可选。1× 速度下播完全程用的真实秒数。不写时：`duration` ≤ 30 s 按真实时间播放，更长的过程（天体运行、缓慢变化）自动压缩到约 15 s，并在控制栏注明缩放比例 |
| `timeUnit` | 时间单位，默认 `s`（天体题可写 `h`） |
| `step` / `stepLabel` | 可选。控制栏多一个单步按钮（文字默认"下一步"），每点一次暂停并跳到下一个 `step` 的整数倍时刻。过程本身是一步一步的才用，例如回旋加速器 `step={1} stepLabel="前进半周"`、能级逐级跃迁 |
| `hud` | 画面左上角的实时读数 `[{symbol, label, expr, unit, digits, format}]`，第一个最醒目。**只放 1–3 个**，其余放侧栏 `<Readout>` |
| `legend` | 图例 `[{kind, label, symbol}]`，`kind` 取物理量名，加 `-dash` 是虚线，`strobe` 是频闪点 |
| `note` | 画面下方一行说明，如"轨道半径不按比例" |

参数改变时动画从 t = 0 重播。


<!-- /region -->
<!-- region:sim-limits -->
### 沙箱限制

- 运行在 `<iframe sandbox="allow-scripts" srcdoc="…">` 里，来源为空，碰不到主页面、Cookie 和本地存储。
- CSP 禁止一切网络请求，不能加载外部脚本、图片和字体。
- 只能通过运行时和外层通信，模型代码不直接调用 `postMessage`。
- 代码出错时，外层显示错误提示和课件里的文字说明，不影响其他组件。


<!-- /region -->
