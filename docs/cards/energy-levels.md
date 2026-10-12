---
id: energy-levels
layer: L1
title: 能级图
component: EnergyLevels
related: []
---

## 何时用

- 能级、跃迁、发射或吸收光谱、玻尔轨道。不写 `levels` 就是氢原子 −13.6/n² eV。
- 不要在 `<Sim>` 里用圆和彩条仿谱线或轨道。
- 光电管的伏安特性在 `circuit` 里写 `phototube`，不是这张图。

## 最小例子

```lesson
---
id: example-energy-levels
title: 氢原子
question: 示意
answers:
  - { name: n0, value: 2 }
---

<Define name="n0" expr="2" />

<EnergyLevels title="氢原子" allFrom={2} />
```

## 常见错误

- 把 13.6/n² 收成两位小数再写进 `levels`（n = 20 写成 −0.03）→ 用内置能级，或写 `E1/400`。gd22-05 正文是 0.034 eV，收成 0.03 会差约 12%。
- `transitions` 和 `allFrom` 一起写 → 二选一（校验原文）。
- `unit` 不是 eV 还写 `visible` 或 `spectrum` → 波长和可见光只在 eV 下算（校验会拒）。
- `from` / `to` 不是已有能级的 `n` → 改成 `levels` 里有的，或内置的 1…n 与 ∞。

## 属性
<!-- props:EnergyLevels -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| size | string |  | 版面宽度：full、wide 或 narrow |
| title | string |  | 标题 |
| levels | array |  | 能级列表 {n, E, label} |
| count | number 或 expr |  | 氢原子画几条，默认 6 |
| transitions | array |  | 跃迁列表 {from, to, label} |
| allFrom | number 或 expr |  | 画出从该能级向下的全部跃迁 |
| select | number 或 expr |  | 选中第几条跃迁 |
| workFunction | number 或 expr |  | 金属逸出功 |
| visible | boolean |  | 标出辐射可见光的跃迁 |
| spectrum | boolean 或 object |  | 在下方加一条波长轴 |
| absorption | boolean |  | 光谱画成吸收暗线 |
| orbits | boolean |  | 右侧画玻尔轨道 |
| unit | string |  | 能量单位，默认 eV |
| note | string |  | 一行说明 |
<!-- /props -->

## 规范原文
<!-- region:energy-levels -->
### `<EnergyLevels>`：能级图

```
<EnergyLevels title="氢原子能级图" allFrom={4} select="pick" workFunction="W0" visible />
<EnergyLevels levels={[{n: 1, E: -10.4}, {n: 2, E: -5.5}, {n: "∞", E: 0}]} transitions={[{from: 2, to: 1, label: "a"}]} select={0} />
```

| 属性 | 说明 |
|---|---|
| `levels` | 能级 `[{n, E, label}]`，`E` 可写表达式，`n: "∞"` 画成虚线（电离）。不写时用氢原子 `E_n = −13.6/n² eV`，`count` 控制画几条（默认 6，加 ∞） |
| `transitions` | 跃迁 `[{from, to, label}]`，`from`、`to` 写能级的 `n`。向下是辐射，向上是吸收，`to: "∞"` 是电离 |
| `allFrom` | 和 `transitions` 二选一。画出一群处于 `n = allFrom` 的原子能发生的全部向下跃迁（C(n,2) 种），并写出种数 |
| `select` | 选中第几条跃迁（从 0 数，可写表达式，常配 `<Param options>`）：加粗高亮、标出 ΔE，下方写出 hν = E_m − E_n、波长和光谱区 |
| `workFunction` | 金属逸出功（可写表达式）。ΔE ≥ W₀ 的跃迁画成琥珀色实线，其余画灰色虚线；读数里给出能否发生光电效应和最大初动能 Ek = ΔE − W₀，`allFrom` 时再数出几种能发生 |
| `visible` | 标出辐射可见光的跃迁（按教材 1.62 eV ≤ ΔE ≤ 3.11 eV）：箭头旁画一小段该光颜色的波浪线，图下加图例，`allFrom` 时再数出几种是可见光、是哪几条 |
| `spectrum` | `true`，或 `{from, to, series: "visible"}`。在能级图下方加一条波长轴（nm，默认 380–760），已画的跃迁按 `λ = 1240/ΔE` 落成竖线，颜色是该波长的光色，选中的那条加粗。可见光以外的线是灰色，轴伸进紫外、红外时标出区域；落在轴外面的只数出来（「另有 3 条在紫外区」），不要手写谱线位置 |
| `absorption` | 和 `spectrum` 一起用（单独写也会画出光谱）。连续彩虹底上画暗线，而不是发射亮线。只在 eV 下可用 |
| `orbits` | 在能级图右侧画玻尔轨道：核、半径 `r_n = n² × 0.053 nm` 的同心圆。图上的半径按 `n` 压缩（否则 n = 1 会缩成一个点），真实半径、`r_n/r₁` 和 `E_n` 写在旁边的表里。电子画在选中跃迁的起始轨道上，光子是一条波浪箭头（向下辐射朝里，吸收朝外）。`n` 不是正整数的能级不画轨道 |
| `unit` | 能量单位，默认 `eV`（只有 eV 时才算波长，才能用 `visible`、`spectrum`、`absorption`） |

纵轴按能量大小排列，但保证相邻能级至少间隔 18 px，n 较大的能级不会挤成一团。谱线位置和轨道半径都由能级算出，不要在 `<Sim>` 里用圆和彩条去仿。


<!-- /region -->
