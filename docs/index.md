---
id: index
layer: L0
title: 课件系统入口
related: [structure, params, rules, motion, sim]
---

# 课件系统入口

一道高中物理题对应一份课件文件（`.md`）：头信息、Markdown 解答，加上交互组件。组件负责计算和画图，你只描述画什么、算什么。课件先过校验才能入库。

本页每题必读。组件细节在组件卡里（L1），按 id 取；更深的物理模型和长例子在深入参考里（L2）。取文档：命令行 `genui docs <id>`，函数调用 `get_doc(id)`；搜索用 `genui docs --search <词>` 或 `search_docs(query)`。

## 工作流

1. 读题，先把物理过程和答案想清楚。
2. 查下方路由表，选出要用的组件。
3. 读这些组件的卡。卡里有最小例子、属性表和常见错误。
4. 写课件。
5. 校验（`genui validate` 或 `validate(lesson)`）。每条错误都写明该读哪份文档，照着改，直到通过。
6. 看排版报告（`genui layout` 或 `check_layout(lesson)`），处理标签压线、出界等问题。

## 文件骨架

```
---
id: zj-05
title: 两列波的叠加
source: 2024 浙江 6 月 第 5 题
question: 题目原文……
answers:                    # 校验用，学生看不到
  - { name: vMax, value: 4, unit: m/s }
choice: BD                  # 选择题才写
---

题目条件分析……

<Param name="t" label="时间" value={0} min={0} max={2} step={0.01} unit="s" />

<Sim …>
sim({ at(t, p) { … }, draw(ctx, s, v) { … } })
</Sim>

完整解答……
```

细节见 `structure`（文件结构、标签写法）和 `params`（参数、派生量、问题、答案）。

## 硬规则

1. 组件标签单独成块，前后各空一行。字符串属性用双引号，其余用 `{…}` 包 JSON5，不能写 JS 表达式或变量。只有 `<Sim>` 和 `<Figure>` 有内容体（JS 代码），其他组件一律自闭合。
2. 随参数变化的值写成表达式字符串，只能引用已声明的 `<Param>` / `<Define>` 名字。判断相等写 `abs(a - b) < 1e-6`。
3. 只用文档里列出的组件、属性和 `v` 工具。没写的就是没有，不要猜。
4. `answers` 的 `name` 必须是某个 `<Param>` 或 `<Define>`。校验器在初始参数下重算，误差超过 1% 就退回。选择题写 `choice` 和 `answers: []`（有数值时照写）。
5. `<Param>` 的初始值用题目给的数值。题目只有字母时取代表性数值，正文说明。
6. 每份课件都要画出物理情景本身，只有 `<Plot>` 不算。
7. 能用预制组件就不要在 `<Sim>` 里手画：坐标图、受力图、电路、能级、分子、条纹、纸带都有组件。画实物也一样：刻度尺、气缸、容器、玻璃砖、木板、电磁铁、变阻器等都有现成器材，先查 `sim-craft` 的器材对照表，表里没有的生活装置才用 `v.rect`、`v.path` 画简图。
8. 组件能算的不要手算：电路读数和暂态、变力和多阶段运动、未知力、电磁感应、带电粒子偏转、气体状态，都交给对应组件（见 `rules` 第七节第 5 条）。
9. 颜色只取物理量名（`velocity force accel charge field`，中性 `ink graphite steel`），同一个量全页同色。
10. 属性和 `<Sim>` 标签里的文字不支持 LaTeX，下标写 `v_0`、`R_{AB}` 或 Unicode。
11. 不编造题目没给的条件；尺度失真要注明"不按比例"。

内容结构、选择题写法等完整规则见 `rules`。

## 选型路由表

| 情景 | 组件 | 卡 |
|---|---|---|
| 物理量随某个量变化的曲线（x–t、v–t、U–I、图像题） | `<Plot>` | `plot` |
| 自变量取整数（第 n 次、几个元件） | `<Bars>` | `bars` |
| 能量转化、各种能的增减 | `<Ledger>` | `ledger` |
| 只盯一个量（额定、临界） | `<Dial>` | `dial` |
| 按难点分段讲解（样板） | `<Segment>` | `segment` |
| 「如果……」变式，上课画布上一键改条件 | `<Variant>` | `variant` |
| 受力分析、平衡、牛顿第二定律求未知力 | `<ForceDiagram>`（`solve`，三力平衡加 `triangle`） | `force-diagram` |
| 电路图、电表读数、电容充放电、自感、LC、交流电 | `<Circuit>`（暂态写 `transient`） | `circuit` |
| 实物连线、电表接法、电桥 | `<Wiring>` | `wiring` |
| 仪器读数：游标卡尺、螺旋测微器、电表、多用电表、电阻箱、弹簧测力计、测量头 | `<Instrument>` | `instrument` |
| 双缝干涉、单缝衍射、劈尖、牛顿环、电子衍射 | `<Fringes>` | `fringes` |
| 打点计时器纸带 | `<TickerTape>` | `ticker-tape` |
| 能级、跃迁、发射和吸收光谱 | `<EnergyLevels>` | `energy-levels` |
| 气体分子运动、速率分布 | `<GasBox>` | `gas-box` |
| 气缸、细管、U 形管里的气柱、液柱、活塞 | `<GasTube>` | `gas-tube` |
| 折射、全反射、棱镜、透镜光路 | `<Optics>` 算光路，`<Sim>` 里 `v.optics` 画 | `optics` |
| 运动过程：变力、摩擦、连接体、板块、碰撞反弹、轨道、转动 | `<Motion>` 积分，`<Sim>` 画 | `motion` |
| 电磁感应：导体棒切割、双棒、棒接电容 | `<Motion>` 写 `circuit` | `motion` |
| 带电粒子在电场、磁场中运动 | `<Motion>` 写 `charge`、`fields` | `motion` |
| 静电场、导体、等势线、磁场区域 | `<Sim>` 里 `v.efield`、`v.field`、`v.regions` | `sim`，再读 `sim-fields` |
| 磁铁、螺线管、螺绕环、辐向磁场、回旋加速器 | `<Sim>` 里对应的 `v` 工具 | `sim`，再读 `sim-magnetics` |
| 装置：通电直导线、霍尔片、变压器、示波管、光电门、向心力演示器、油膜等 | `<Sim>` 里对应的 `v` 工具 | `sim`，再读 `sim-apparatus` |
| 其他需要随时间播放的过程 | `<Sim>`，`time` 同步给 `<Plot>` 游标 | `sim` |
| 准静态过程、随参数变化的静态示意图 | `<Param>` 滑块 + `<Figure>`，不用 `<Sim>` | `figure` |
| 小问、答案、实时读数、状态标签、快捷按钮 | `<Question>` `<Answer>` `<Readout>` `<Status>` `<Preset>` | `question` `answer` `readout` `status` `preset` |

组合原则：一个情景组件画装置和过程，图表组件配合看关系，侧栏放滑块、读数和答案。多阶段过程用一个 `<Sim>` 加关键时刻 `marks`；各小问条件不同时，用选项型 `<Param>` 切换情形。
