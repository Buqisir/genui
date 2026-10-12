---
id: fringes
layer: L1
title: 干涉和衍射图样
component: Fringes
related:
  - instrument
---

## 何时用

- 双缝、单缝、细丝、劈尖、牛顿环、电子衍射：屏上条纹、间距和颜色都由参数算。
- 手轮对准两条亮纹求波长：用 `instrument` 的 `measurementHead`，不要在这里再造一把尺。
- 不要在 `<Sim>` 里用矩形条仿条纹。几何折反射用 `optics`。

## 最小例子

```lesson
---
id: example-fringes
title: 双缝
question: 示意
answers:
  - { name: gap, value: 2.5, unit: mm }
---

<Fringes title="双缝" type="double" lambda={500} d={0.2} L={1} read={{dx: "gap"}} />
```

## 常见错误

- `type="double"` 不写 `lambda`、`d`、`L` → 三个都要（白光改 `white`，可以不写 `lambda`）。
- 牛顿环 `read` 的 `dx` → 改读 `r1`、`r2`（校验：「牛顿环不是等间距，不要读 dx」）。
- `white` 用在单缝，或 `wire` 用在双缝 → `white` 只用于 `double`，`wire` 只用于 `single`。
- 在 `<Sim>` 里用矩形条排位置 → 改 `<Fringes>`，疏密和颜色才会跟着参数变。

## 属性
<!-- props:Fringes -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| size | string |  | 版面宽度：full、wide 或 narrow |
| title | string |  | 标题 |
| type | string | 是 | double、single、wedge、newton 或 electron |
| lambda | number 或 expr |  | 波长（nm） |
| d | number 或 expr |  | 双缝间距（mm） |
| a | number 或 expr |  | 缝宽（mm） |
| L | number 或 expr |  | 缝到屏的距离（m） |
| n | number 或 expr |  | 介质折射率，默认 1 |
| theta | number 或 expr |  | 劈尖角（度） |
| h | number 或 expr |  | 膜的厚度（mm） |
| length | number 或 expr |  | 膜的长度（mm） |
| R | number 或 expr |  | 牛顿环曲率半径（m） |
| U | number 或 expr |  | 电子的加速电压（V） |
| k | number 或 expr |  | 电子衍射环半径的折合常数 |
| span | number 或 expr |  | 画面覆盖的屏宽（mm） |
| white | boolean |  | 按白光把各波长叠加 |
| wire | boolean |  | 说明改成细丝衍射 |
| transmitted | boolean |  | 画透射，明暗对调 |
| side | boolean |  | 劈尖下方加一幅侧视 |
| marks | array |  | 标出第几条纹 |
| cursor | name |  | 屏上位置 x 的参数名 |
| read | object |  | 交出去的间距、波长等 |
| note | string |  | 一行说明 |
<!-- /props -->

## 规范原文
<!-- region:fringes -->
### `<Fringes>`：干涉和衍射图样

屏上的条纹由参数算出，下面写带数字的公式。间距、环半径、颜色都不要手画，也不要自己排条纹的位置。

```
<Fringes title="双缝" type="double" lambda="lam" d="d" L="L" span={8} marks={[{k: 1, label: "P₁"}, {k: 3, label: "P₂"}]} read={{dx: "dx", r1: "x1", r3: "x3"}} />
<Fringes title="白光" type="double" d="d" L="L" white span={8} />
<Fringes title="细丝" type="single" lambda="lam" a="a" L="L" wire />
<Fringes title="空气劈尖" type="wedge" lambda="lam" h="h" length={20} side read={{dx: "wdx", theta: "th"}} />
<Fringes title="牛顿环" type="newton" lambda="lam" R="R" />
<Fringes title="电子衍射" type="electron" U="U" k={0.4} read={{lambda: "elam", r1: "er1"}} />
```

单位：`lambda` nm，`d` 和 `a` mm，`L` 和牛顿环曲率半径 `R` m，劈尖角 `theta` 度，`h` 和 `length` mm，加速电压 `U` V。`n` 是介质折射率，默认 1（光在介质里按 λ/n 算）。`span` 是画面覆盖的屏宽（mm）；环状图样把它当作直径。不写 `span` 时，双缝和单缝默认 8 mm，劈尖默认等于膜的长度（只写 `theta` 时按 20 mm），牛顿环默认直径 6 mm，电子衍射默认直径 50 mm。视场固定，间距才会跟着滑块变。

| `type` | 算出什么 | 画面 |
|---|---|---|
| `double` | 亮纹间距 Δx = Lλ/(n d)（mm）。写了缝宽 `a` 再乘单缝因子 sinc²，中央包络宽 2Lλ/a | 水平光屏，亮纹颜色按波长。`white` 把 380–760 nm 每隔 5 nm 叠加：中央白，两侧彩色 |
| `single` | 中央亮纹宽 2Lλ/a，两侧亮纹间距是它的一半。`wire` 只把说明改成细丝（巴比涅，图样与等宽单缝相同） | 同上，中央宽、两侧窄 |
| `wedge` | 等间距 Δx = λ/(2 n tanθ)。写 `h` 和 `length` 时 tanθ = h/length，不再用手填 θ；两个都写时以厚度为准 | 俯视直条纹，接触端在左。反射（默认）接触端是暗纹；`transmitted` 对调。`side` 在下面加侧视：两块玻璃、空气膜、末端垫片，倾角故意夸大 |
| `newton` | 反射暗环半径 r_k = √(k R λ/n)（mm），k 从 1 数，中心是暗斑。`transmitted` 明暗对调，半径公式不变 | 同心环，越往外越密 |
| `electron` | λ = h/√(2 m e U)，说明里用 pm。第 n 环半径 r_n = n·k·λ，`k` 默认 0.4（mm/pm），把晶面间距和屏距折进这一个常数 | 黑底上的同心亮环，中心亮斑。电压升高环变小 |

`marks`：`[{k, label, dark}]`。`k` 是第几条（双缝、单缝中央的另一侧用负数）。双缝默认标亮纹 k·Δx，`dark: true` 改标相邻暗纹；劈尖默认标从接触端数的第 k 条主条纹；单缝标第 k 级暗纹（中央宽的边缘是 k = ±1）；牛顿环和电子衍射标第 k 环。`label` 省略时就写序号。

`cursor` 是一个参数名，表示屏上的 x（mm，环心在 0）。画面上画一条竖线，读数行给出该点的相对光强 I。

`read` 把算好的数交给 `<Readout>` 和 `answers`：`dx` 间距（mm；牛顿环没有等间距，不要读它），`width` 中央亮纹宽度（mm，单缝或写了 `a` 的双缝），`lambda` 有效波长（光是 nm，电子是 pm），`theta` 劈尖角（度，只用于 wedge），`I` 和 `x` 需要 `cursor`，`r1`…`r20` 是第 k 条的位置或半径（mm）。白光的 `dx` 按 550 nm 给一个代表值。

图下的公式带代入后的数字，和 `<Instrument>` 的读数行一样。条纹位置、疏密、颜色都从这些数来，不要在 `<Sim>` 里用矩形条去仿。


<!-- /region -->
