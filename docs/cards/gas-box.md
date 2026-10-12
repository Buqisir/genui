---
id: gas-box
layer: L1
title: 气体分子运动
component: GasBox
related: []
---

## 何时用

- 盒子里的分子碰撞，加上速率分布直方图和麦克斯韦曲线。`T` 是热力学温度（K）。
- 不要用：细管、气缸、液柱、活塞的准静态过程用 `gas-tube`。
- 平均动能随温度的曲线用 `plot`；分子本身仍用本组件，不要在 `<Sim>` 里手画一堆圆。

## 最小例子

```lesson
---
id: example-gas-box
title: 氮气分子
question: 示意
answers:
  - { name: Tg, value: 300, unit: K }
---

<Param name="Tg" label="温度" unit="K" min={100} max={400} step={1} value={300} />

<GasBox title="氮气" T="Tg" gas="N2" count={40} />
```

## 常见错误

- `T={27}`，或绑定的滑块 `min={0}` → 单位是 K，该 Param 的最小值要大于 0（校验：「最小值应大于 0」）。
- `gas="Air"` 又不写 `mass` → 用 `H2`、`He`、`N2`、`O2`、`Ar`、`CO2`，其他气体写摩尔质量（单位 u）。
- `count` 不在 20–800，或 `start="uniform"` → `count` 取这个范围，`start` 只能是 `maxwell` 或 `same`。

## 属性
<!-- props:GasBox -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| size | string |  | 版面宽度：full、wide 或 narrow |
| title | string |  | 标题 |
| height | number |  | 画布高度（像素） |
| T | number 或 expr | 是 | 热力学温度（K） |
| gas | string |  | 气体种类，如 N2、O2 |
| mass | number |  | 摩尔质量，单位 u |
| count | number 或 expr |  | 分子个数 |
| start | string |  | maxwell 平衡，或 same 同速 |
| collide | boolean |  | 为 false 时分子互相穿过 |
| theory | boolean |  | 为 false 时不画理论曲线 |
| compare | number 或 expr |  | 再画这条温度的理论曲线 |
| tag | boolean |  | 跟踪 1 号分子 |
| bins | number |  | 直方图大约分几档 |
| vmax | number |  | 横轴最大速率 |
| autoplay | boolean |  | 为 false 时不自动播放 |
| note | string |  | 一行说明 |
<!-- /props -->

## 规范原文
<!-- region:gas-box -->
### `<GasBox>`：气体分子运动与速率分布

分子动理论题的「盒子里的分子 + 速率分布图」。左边是三维盒子（斜二测画法，前框深、后框浅），分子做真实的硬球弹性碰撞，颜色表示速率（蓝 → 紫 → 红 → 琥珀，越快越暖），每个分子拖一小段沿速度方向的尾巴；右边是各速率区间的分子数占比直方图，每 0.15 s 重新统计一次，叠一条麦克斯韦理论曲线。

```
<Param name="Tg" label="温度 T" unit="K" min={100} max={900} step={1} value={373} />
<GasBox title="氧气分子" T="Tg" gas="O2" compare={273} tag />
<GasBox title="从同一速率出发" T={300} gas="N2" start="same" autoplay={false} />
```

| 属性 | 说明 |
|---|---|
| `T` | 热力学温度（K，必填，可写表达式，常绑一个 Param）。拖动时把所有分子速率乘 √(T′/T)，分布形状不变、整体右移 |
| `gas` | `H2`、`He`、`N2`（默认）、`O2`、`Ar`、`CO2`。其他气体写 `mass`（摩尔质量，单位 u），`gas` 只当名字显示 |
| `count` | 分子数，20–800，默认 300 |
| `start` | `maxwell`（默认，一开始就是平衡分布）或 `same`（所有分子都以方均根速率出发，只有一根柱子；碰撞几秒后落到理论曲线上，总动能不变所以温度不变） |
| `compare` | 再画一条该温度的虚线理论曲线做对照（如 0 ℃ 和 100 ℃ 的氧气） |
| `tag` | 跟踪 1 号分子：盒子里画圈和轨迹，横轴上用三角形标出它此刻的速率（单个分子速率不停变，整体分布稳定） |
| `collide` | `false` 时分子互相穿过、只和器壁碰（分布永远不会变成麦克斯韦分布，用来对比） |
| `theory` | `false` 时不画理论曲线 |
| `bins`、`vmax` | 直方图大约分几档（默认 24，自动取 50、100 这样的整数宽度）、横轴最大速率（默认按 T 的 Param 最大值取 3.1 倍最概然速率，拖动时横轴不变） |
| `autoplay` | 默认滚到眼前就开始运动；`false` 时等学生按播放 |

- 下方读数：统计平均速率、方均根速率，和理论的最概然、平均、方均根速率；控制条有播放 / 暂停、重新开始（回到初始分布并暂停）、0.5× / 1× / 2×，以及「平均每个分子碰撞了几次」。
- 鼠标悬停（触屏点按）某根柱子：读数换成「该区间实际 n 个、占比、理论占比」，盒子里只亮出这一段速率的分子，其他变暗。
- 纵轴是占比（%），所以两条曲线下的面积都是 100%；温度低峰高、温度高峰低而右移。


<!-- /region -->
