---
id: collision
layer: L1
title: 碰撞画面
component: Collision
related:
  - step-lesson
  - motion
---

## 何时用

- 一维两体碰撞：导轨上的两辆小车或台面上的两个小球，画速度箭头，下面画动量、动能两组柱子（A、B、和；虚线是碰前的和）。普通课件和分步课都能用。
- 速度是你给的：`v` 是碰前，`after` 是碰后，组件不解方程。要积分变力、摩擦、多次碰撞用 `motion`。
- 普通课件里和 `<Sim>` 一样带播放条；分步课里可用 `beat` 控制画不画柱子（`bars="beat >= 3"`）。

## 最小例子

```lesson
---
id: example-collision
title: 碰撞
demo: true
---

<Collision m={[3, 1]} v={[4, 0]} after={[2, 6]} surface="rubber" names={["A", "B"]} />
```

## 常见错误

- 没写 `after` 也没写 `still` → 报 `collision-needs-after`。
- `surface` 写错 → 只能是 `magnet`、`rubber`、`velcro`；写表达式时 0 / 1 / 2 依次对应。`velcro` 碰后两车画成一体，`after` 的两个速度要相等。
- `m`、`v`、`after` 不是两项的数组 → 各写两项，每项数字或表达式，向右为正。
- 表达式里读了 `beat`，却没声明 hidden 的 `<Param name="beat">` → 报 `beat-not-hidden`。
- 题目只说「质量都是 m」→ `massText={["m", "m"]}`，`m` 仍写数值。

## 属性
<!-- props:Collision -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| m | array | 是 | 两个质量（kg），每项数字或表达式 |
| v | array | 是 | 碰前两个速度（m/s，向右为正） |
| after | array |  | 碰后两个速度；不写 still 时必填 |
| surface | string 或 expr |  | 碰撞面：magnet、rubber、velcro；写表达式时 0/1/2 依次对应 |
| body | string |  | cart 小车（默认）或 ball 小球 |
| names | array |  | 两个物体的名字，默认 ["A", "B"] |
| massText | array |  | 质量标注，默认按 m 写 |
| label | string |  | 左上角说明 |
| bars | boolean 或 expr |  | 画不画柱子，默认 true |
| digits | object |  | 小数位 {v, p, k}，默认 {v:2, p:3, k:3} |
| still | boolean |  | 只画碰前一帧，不播 |
| height | number |  | 画布高度（像素） |
<!-- /props -->

## 规范原文
<!-- region:collision -->
### `<Collision>`：碰撞画面

`<Collision m v after surface />` 画一维两体碰撞：导轨（或台面）、两车（或两球）、速度箭头；下面动量、动能两组柱子。`m`、`v`、`after` 各两项，数字或表达式；`still` 只画碰前一帧。颜色只取调色板。

<!-- /region -->
