---
id: figure
layer: L1
title: 随参数变化的示意图
component: Figure
related:
  - sim
  - sim-craft
---

## 何时用

- 准静态：滑块一变就重画，没有时间轴。`<Param>` 加 `<Figure>`，不要套 `<Sim>`（见 `rules`）。
- 要播放、拖进度、打 `marks`：用 `sim`。两者同一套 `v` 工具。
- 受力用 `force-diagram`，曲线用 `plot`，电路用 `circuit`。不要在 `draw` 里手画这些。
- 光路用 `optics` 算，再在这里用 `v.optics` 画。
- 三维接触不要挤进一张侧视：俯视、侧视各写一张。
- 动笔前看一遍 `sim-craft`（作图规矩：物体用工具画、图里只留符号、文字不压线、线不出容器、物体别太小）。

## 最小例子

```lesson
---
id: example-figure
title: 液柱高度
question: 当前液柱高度是多少？
answers:
  - { name: h, value: 1.2, unit: m }
---

<Param name="h" label="液柱高度" value={1.2} min={0.2} max={2} step={0.1} unit="m" />

<Figure title="液柱" height={220} params={["h"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 2, ymin: 0, ymax: 2.4 })
    v.rect(m, 0.6, 0, 0.5, p.h, { fill: v.color.field })
    v.label(m, 1.3, p.h, "h")
  },
})
</Figure>
```

`draw` 里读到的 `p.h` 必须出现在 `params` 里。没有 `at`，也没有播放条。

## 常见错误

- 内容体写 `sim({...})` → 改成 `figure({ draw(ctx, p, v) { … } })`（`代码里没有调用 figure({...})`）。
- `draw` 里用了 `p.h`，`params` 没写 `"h"` → 把名字加进 `params`（`代码读取了 p.h，但没有写进 params 列表`）。
- 调用 `locate(...)` 或别的自造函数 → 沙箱里没有（zj-04：`locate is not defined`）。坐标自己算，或用文档里的 `v`。
- 写了 `fetch`、`eval`、`document.cookie` → 删掉（`代码里用了沙箱禁止的 API`）。
- 缓慢注水、改角度却套 `<Sim>` 的时间轴 → 没有过程要播放就用 `<Figure>`。
- 力、速度、电流这类有方向的箭头，方向写死（不随参数变号）→ 校验器报 `arrow-direction`，并说明「这个量从 … 变成 …，箭头却没有反向」。写 `of` 说明箭头画的是哪个量（带符号），方向跟着它的符号走：`v.vec(m, x, y, 0, dA * len, { kind: 'force', of: "-Fa*sgn" })`。校验器会在原题、快捷按钮和变式下核对这个箭头：量变号箭头也反向，量为 0 时不画，长度随量成比例（只提醒）。

## 属性
<!-- props:Figure -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| size | string |  | 版面宽度：full、wide 或 narrow |
| hud | array |  | 左上角读数列表，每项见规范原文 |
| legend | array |  | 图例列表，每项 {kind, label} |
| note | string |  | 画面下方一行说明 |
| title | string |  | 标题 |
| height | number |  | 画布高度（像素） |
| params | names |  | 传入沙箱的名字列表 |
<!-- /props -->

## 规范原文
<!-- region:figure -->
### `<Figure>`：随参数变化的示意图

画物理情景本身（光路、液柱、汽缸、轨道、电场区域……），但不需要随时间播放。和 `<Sim>` 用同一个沙箱和同一套 `v` 工具，只是没有时间轴：参数一变就重画。

```
<Figure title="光路图" height={300} params={["i", "r", "n"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2, xmax: 2, ymin: -1.5, ymax: 1.5, equal: true })
    v.path(m, [[-1.5, -1], [1.5, -1], [0, 1.2]], { close: true, color: v.color.border })
    v.arrow(m, -1.8, 0.6, -0.6, 0, { color: v.color.red })
    v.label(m, -1.2, 0.3, 'i = ' + p.i.toFixed(1) + '°')
  },
})
</Figure>
```

| 属性 | 说明 |
|---|---|
| `title`、`height` | 同 `<Sim>` |
| `params` | 传进沙箱的参数和派生量名字，在 `draw` 里通过 `p` 读取 |

三维接触（下面三个球、上面一个，或垂直于画面的斜杆）不要挤进一张侧视图：俯视、侧视各写一张 `<Figure>`，接触和摩擦力画在它们所在的那个平面。


<!-- /region -->
