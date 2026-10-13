# genui 课件

命令（任意工作目录都能跑）：`/Users/huangxuewei/Projects/genui/bin/genui`

先跑 `genui docs`（无参数）读 L0 入口。组件怎么写以文档为准，不要猜属性或 `v` 工具。

## 流程

1. 读题，先把物理过程和答案想清楚。
2. 按 L0 的选型路由表决定用哪些组件。
3. `genui docs <id>` 读对应的组件卡。缺细节时 `genui docs --search <词>`，再按 id 读。
4. 写成一份课件文件。
5. `genui validate <课件.md>`。每条问题末尾都写着该读的文档，读完再改，直到没有错误。
6. `genui layout <课件.md>`，按报告改掉压线、出界。
7. 能看图时再 `genui shot <课件.md> --out <目录>`。

退出码：0 通过，1 有错误，2 用法不对。`genui docs --list` 列出全部 id。

## 输出要求

- 只输出课件文件本身，第一行就是 `---`。不要任何解释，不要用代码围栏包住整个文件。
- 头信息：`id: gd22-05`，`source: 2022 广东卷 第 5 题（单选，4 分）`，`question` 原样抄题目。
- `answers`：每个能写成数值的答案一条 `{ name, value, unit }`。`name` 必须是课件里某个 `<Param>` 或 `<Define>` 的名字，`value` 是你单独算出的数值。校验器会在初始参数下用课件里的公式重新计算并核对，误差超过 1% 就退回。题目只有字母没有数值时，给参数取代表性数值，并在正文说明。
- 选择题：头信息写 `choice`（选出的选项字母，多选按字母顺序连写，如 `BD`），按第七节第 13 条逐项判断；没有数值答案时写 `answers: []`。
- 只用规范里列出的组件和属性；表达式只能引用已声明的名字；`<Sim>` 只能用规范里列出的 `v` 工具。
- 写之前先把物理过程想清楚，确认答案正确，再决定交互方式（遵守第六、七节）。

把课件写到 /Users/huangxuewei/Projects/genui/plans/regen2/gd22-05/lesson.md（第一行就是 `---`，不要用代码围栏包住整个文件）。写完运行：

/Users/huangxuewei/Projects/genui/bin/genui validate /Users/huangxuewei/Projects/genui/plans/regen2/gd22-05/lesson.md

每条错误末尾写着该读的文档。用 `/Users/huangxuewei/Projects/genui/bin/genui docs <id>` 读完再改，直到校验没有错误。然后运行：

/Users/huangxuewei/Projects/genui/bin/genui layout /Users/huangxuewei/Projects/genui/plans/regen2/gd22-05/lesson.md

按报告改掉压线和出界。不要联网，不要启动子代理。

## 题目（高能级氢原子吸光子，2022 广东卷 第 5 题（单选，4 分））

目前科学家已经能够制备出能量量子数 n 较大的氢原子。氢原子第 n 能级的能量为 E_n = E_1/n^2，其中 E_1 = −13.6 eV。图是按能量排列的电磁波谱，要使 n = 20 的氢原子吸收一个光子后，恰好失去一个电子变成氢离子，被吸收的光子是（ ）

【图】一条按能量排列的横条，下方横轴标「能量(eV)」，对数刻度依次标 10^-2、10^-1、10^0、10^1、10^2、10^3。横条从 10^-2 左侧一直画到 10^3 右侧，从左到右分成四段：最左浅色、最宽，标「红外线」，右缘在 10^0 附近略偏右；接着一条窄带，标「可见光」，位于 10^0 与 10^1 之间、靠近 10^0，两侧用虚线与邻段分开；再往右中等灰度，标「紫外线」，大约延伸到 10^2；最右深色，标「X射线」，大约从 10^2 画到横条右端。

A. 红外线波段的光子
B. 可见光波段的光子
C. 紫外线波段的光子
D. X 射线波段的光子
