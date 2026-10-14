---
id: segment
layer: L1
title: 分段讲解
component: Segment
related:
  - structure
---

## 何时用

- 一道题有两三个明显的难点，想按难点一段一段讲，每段配一张只为这一段服务的图。（样板阶段，还没有写进生成规则。）
- 课件里只要出现 `<Segment>`，页面就改成「一段一屏」：顶部是分段导航，左边是这一段的图，图下面紧跟这一段的滑块和读数，右边是「动手 / 注意看」提示和讲解。手机上先显示提示，再显示图，最后是讲解。
- 不写 `<Segment>` 的课件仍是原来的版面。

## 最小例子

```lesson
---
id: example-segment
title: 分段
question: 示意
answers:
  - { name: h, value: 1 }
---

开场：这道题难在哪几处。

<Segment title="加热：等压上升" hint="拖动温度，从 330 K 拖到 440 K。" watch="摩擦力一直向下、大小不变。" />

这一段的讲解。

<Param name="T" label="温度" value={330} min={330} max={440} unit="K" />

<Define name="h" expr="T/330" />

<Figure title="活塞" params={["h"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -1, xmax: 1, ymin: 0, ymax: 2, equal: true })
    v.block(m, 0, p.h, 0.6, 0.1)
  },
})
</Figure>

<Segment title="完整解答" />

完整解答写在最后一段。
```

## 常见错误

- 一段里放好几张图、七八个读数 → 一段只讲一个难点，图和读数只留这一段要看的。
- `hint` 只写「拖动看看」 → 写清拖哪个量、从多少拖到多少；`watch` 写拖动时该盯住什么、会看到什么变化。
- 把 `<Param>` 写在别的段里 → 滑块显示在它所在的那一段，写在要用它的那一段下面。

## 属性
<!-- props:Segment -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| title | string | 是 | 这一段讲什么（导航上显示） |
| hint | string |  | 动手：拖哪个量、点哪个按钮 |
| watch | string |  | 注意看：拖动时该盯住什么 |
<!-- /props -->

## 规范原文
<!-- region:segment -->
### `<Segment>`：分段讲解

`<Segment title hint watch />` 是分段标记，自闭合。从它开始到下一个 `<Segment>` 之前的正文、图和控件都属于这一段；第一个 `<Segment>` 之前的正文是开场，只在第一段上方显示。最后一段通常写「完整解答」，不放图。

<!-- /region -->
