---
id: optics
layer: L1
title: 几何光学
component: Optics
related:
  - sim
---

## 何时用

- 折射、全反射、棱镜、透镜、色散：`<Optics>` 求光路，不随时间的用 `<Figure>`，要播放的用 `<Sim>`，都用 `v.optics` 画。画法见 `sim-scene`。
- 只有 `<Optics>`、没有 `<Figure>` 或 `<Sim>` 时，校验认为没有画出物理情景（`<Optics>` 不在情景组件名单里）。
- 不要用：干涉、衍射条纹用 `fringes`。电场线用 `v.efield`（见 `sim-fields`），不要用光线去描。

## 最小例子

```lesson
---
id: example-optics
title: 玻璃砖
question: 示意
answers:
  - { name: n, value: 1.5 }
---

<Define name="n" expr="1.5" />

<Optics name="lt" n0={1} media={[{name: "g", n: "n", shape: {xmin: 0, xmax: 2, ymin: 0, ymax: 1}}]} rays={[{name: "a", from: [-1, 0.5], angle: 0}]} />

<Figure title="光路" height={200} params={["lt"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -1.5, xmax: 3, ymin: -0.5, ymax: 1.5, equal: true })
    v.optics(m, p.lt)
  },
})
</Figure>
```

## 常见错误

- 手算折点再用 `v.ray` 连线 → `v.optics(m, p.lt)`（见 `sim-scene`）。
- `rays[].from` 写成一个数，或漏了 `angle` → `from: [x, y]`，`angle` 是行进方向（度）。
- `name` 和已有的 `<Param>` / `<Define>` 重名 → 换一个（光路结果挂在这个名字上）。
- 起点正好落在界面或镜面上 → 从介质外一点射入（校验提醒：「起点正好在界面上」）。

## 属性
<!-- props:Optics -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 光路的名字 |
| n0 | number 或 expr |  | 周围的折射率，默认 1 |
| media | array |  | 介质列表，后写的盖住先写的 |
| mirrors | array |  | 独立的双面镜 |
| screens | array |  | 吸光屏列表 |
| rays | array | 是 | 光线列表 |
| reflections | number |  | 弱反射再追几层，默认 0 |
| length | number 或 expr |  | 光线延伸多长 |
| maxHits | number |  | 一条光线最多算几步 |
<!-- /props -->

## 规范原文
<!-- region:optics -->
### `<Optics>`：几何光学

折射、全反射、色散的光路用 `<Optics>` 求，不要手算折点再用 `v.ray` 连。

```
<Param name="i" label="入射角 i" min={0} max={70} step={1} value={30} unit="°" />
<Define name="n" expr="1.5" />
<Optics name="lt" n0={1}
  media={[{ name: "glass", n: "n", shape: { cx: 0, cy: 0, r: 2, from: 180, to: 360 } }]}
  rays={[{ name: "a", from: ["2.6*cos(deg(270-i))", "2.6*sin(deg(270-i))"], angle: "90-i", color: "red" }]} />
```

半圆形玻璃砖（平的一边朝上）。光线对准圆心从圆弧射入：圆弧上正入射，不偏折；平的一边按斯涅尔定律折射，入射角大于临界角就全反射。`lt.a.i[1]`、`lt.a.r[1]` 是第 1 个界面的入射角、折射角（度，从 1 数）；全反射或镜面处 `r` 为 NaN。`lt.a.exitAngle` 是最后一段的方向（度，−180 到 180），`lt.a.tir` 是全反射次数，`lt.glass.C` 是该介质对周围的临界角。入射角正好等于临界角（`angle` 写成用 `C` 算出的值）时按「刚好全反射」处理：光线反射回介质，不会贴着界面掠出去，所以「临界光线反射到某点」直接写一条光线，用 `v.optics` 的 `rays` 画，不要手算折点交给 `v.ray`。画面用 `v.optics(m, p.lt, {normals: true, angles: true})`。

- 介质按书写顺序叠放，后写的盖住先写的。一点的折射率取包含它的最后一个介质，否则是 `n0`（默认 1）。器件是几种形状的差集（矩形挖去一段圆弧、透镜挖去一块）时，先写本体，再叠上折射率等于周围的「挖空」介质；挖空介质写 `hidden: true`，只参与光路、不画出来。要画出差集的真实轮廓，再在最前面加一个按轮廓采样的多边形介质（折射率同本体，会被后面的介质盖住，不影响光路），本体也写 `hidden: true`。
- 形状：多边形 `{points: [[x, y], ...]}`（第 k 边从第 k 点到下一点，最后一条边回到第 0 点）；矩形 `{xmin, xmax, ymin, ymax}`（边 0 下、1 右、2 上、3 左）；圆 `{cx, cy, r}`；圆环再加 `inner`；扇形加 `from`、`to`（度，从 +x 逆时针；边 0 弧、1 `to` 处半径、2 `from` 处半径）。扇形带 `inner` 是扇环（边 0 外弧、1 `to` 端、2 内弧、3 `from` 端）。`segment: true` 用弦代替两条半径（边 0 弧、1 弦）。`{cx, cy, r, from: 180, to: 360}` 是平边朝上的半圆砖。`rotate`（度）绕 `about`（默认形状中心）转动整个形状。
- `mirror: [边的序号]` 把这些边镀银，从哪一侧来都反射，不再折射。
- `mirrors` 是独立的双面镜，`{line: [x1, y1, x2, y2]}` 或 `{arc: [cx, cy, r, a1, a2]}`，写法和 `v.track` 的一段一样。`screens` 是吸光屏 `{name, line}`，照到就停。
- `rays` 每条写 `from: [x, y]`、`angle`（行进方向，度）。`n: {介质名: 表达式}` 只改这一条光线在该介质里的折射率，用来做色散。`color` 用 red、violet、green 这类颜色名。
- `reflections` 默认 0：只追主光线（能折射就沿折射光走，全反射才反射）。`reflections: 1` 时，每个折射面的那条弱反射也追一层，反射出来的支路不再分叉。
- 主光路上每个界面给出 `i`、`r`、`kind`（1 折射、2 全反射、3 镜面、4 光屏）、`x`、`y`。还有 `hits`、`exitX`/`exitY`（最后一段的起点）、`endX`/`endY`（画到的终点）、`opl`（到最后一个界面为止的光程，不含射到周围里的那截）、`len.介质名`（在该介质里的几何路程）、`I`（主光线最后的光强）、`screen`（照到的光屏名，没有就是空字符串）、`screenX`/`screenY`（照到光屏的位置，没照到是 null）。
- 光强从 1 起算。折射时按非偏振菲涅尔公式分给折射光和反射光；全反射和镜面不损失。界面之间折射率相同就照直穿过，不算一次折射。


<!-- /region -->
