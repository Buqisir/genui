---
id: ticker-tape
layer: L1
title: 打点计时器纸带
component: TickerTape
related:
  - motion
---

## 何时用

- 打点计时器纸带：计数点、相邻间距、逐差法加速度。
- 运动已由 `<Motion name="lab">` 算出时写 `expr="100*lab.xA(t)"`（米换厘米），不要另算一组位置。
- 不要用：v–t 曲线用 `plot`；小车怎么运动用 `motion` 加 `sim`。本组件只画纸带。

## 最小例子

```lesson
---
id: example-ticker-tape
title: 纸带
question: 示意
answers:
  - { name: T, value: 0.1, unit: s }
---

<Define name="T" expr="0.1" />

<TickerTape title="纸带" positions={[0, 1.2, 2.8, 4.8]} interval="T" />
```

## 常见错误

- `expr` 和 `positions` 都写，或都不写 → 二选一（校验原文）。
- `labels="ABC"` → 只能是 `letters`、`numbers`，或字符串数组（校验：「labels 只能是 letters、numbers 或字符串数组」）。
- 纸带左右和原图相反却不说明 → 在 `title` 或 `note` 写明方向（gd24-11 原图间距由大到小，标题里说明了）。

## 属性
<!-- props:TickerTape -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| size | string |  | 版面宽度：full、wide 或 narrow |
| title | string |  | 标题 |
| expr | expr |  | 位置关于 t 的表达式 |
| positions | array |  | 直接给出的各点位置 |
| count | number 或 expr |  | 计数点个数 |
| interval | number 或 expr |  | 计数点的时间间隔 |
| start | number 或 expr |  | 第一个点的时刻 |
| unit | string |  | 位置单位，默认 cm |
| labels | string 或 array |  | numbers、letters 或自定数组 |
| digits | number |  | 数值的小数位数 |
| analysis | boolean |  | 是否写出间距和加速度 |
| velocityAt | number |  | 求瞬时速度的那个点 |
| color | string |  | 颜色，取物理量名 |
| note | string |  | 一行说明 |
<!-- /props -->

## 规范原文
<!-- region:ticker-tape -->
### `<TickerTape>`：打点计时器纸带

```
<TickerTape title="纸带" expr="100*(0.12*t + a*t^2/2)" count={7} interval={0.1} labels="letters" />
<TickerTape positions={[0, 1.40, 3.30, 5.69, 8.59]} interval={0.1} />
```

| 属性 | 说明 |
|---|---|
| `expr` / `positions` | 二选一。`expr` 是计数点位置关于 `t`（s）的表达式，单位同 `unit`；`positions` 直接列出各点位置。物体的运动由 `<Motion>` 算时直接写 `expr="100*lab.xA(t)"`（米换成厘米），纸带就是受力算出的真实运动打出来的 |
| `count`、`interval`、`start` | 计数点个数（2–12，默认 7）、计数点间隔 T（默认 0.1 s）、第一个点的时刻 |
| `unit` | 位置单位，默认 `cm`（加速度、速度一律换算成 m/s²、m/s） |
| `labels` | `numbers`（默认 0、1、2…）、`letters`（O、A、B…）或字符串数组 |
| `analysis` | 默认 `true`：写出相邻间距、相邻差 Δx、逐差法加速度、`velocityAt` 那个点的瞬时速度（默认取中间点）。`false` 只画纸带 |

纸带下方画一把从第一个计数点量起的刻度尺，相邻点之间标出间距。


<!-- /region -->
