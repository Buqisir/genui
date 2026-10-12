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
- 头信息：`id: gd21-06`，`source: 2021 广东卷 第 6 题（单选，4 分）`，`question` 原样抄题目。
- `answers`：每个能写成数值的答案一条 `{ name, value, unit }`。`name` 必须是课件里某个 `<Param>` 或 `<Define>` 的名字，`value` 是你单独算出的数值。校验器会在初始参数下用课件里的公式重新计算并核对，误差超过 1% 就退回。题目只有字母没有数值时，给参数取代表性数值，并在正文说明。
- 选择题：头信息写 `choice`（选出的选项字母，多选按字母顺序连写，如 `BD`），按第七节第 13 条逐项判断；没有数值答案时写 `answers: []`。
- 只用规范里列出的组件和属性；表达式只能引用已声明的名字；`<Sim>` 只能用规范里列出的 `v` 工具。
- 写之前先把物理过程想清楚，确认答案正确，再决定交互方式（遵守第六、七节）。

把课件写到 /Users/huangxuewei/Projects/genui/plans/regen2/gd21-06/lesson.md（第一行就是 `---`，不要用代码围栏包住整个文件）。写完运行：

/Users/huangxuewei/Projects/genui/bin/genui validate /Users/huangxuewei/Projects/genui/plans/regen2/gd21-06/lesson.md

每条错误末尾写着该读的文档。用 `/Users/huangxuewei/Projects/genui/bin/genui docs <id>` 读完再改，直到校验没有错误。然后运行：

/Users/huangxuewei/Projects/genui/bin/genui layout /Users/huangxuewei/Projects/genui/plans/regen2/gd21-06/lesson.md

按报告改掉压线和出界。不要联网，不要启动子代理。

## 题目（静电推进装置，2021 广东卷 第 6 题（单选，4 分））

图是某种静电推进装置的原理图，发射极与吸极接在高压电源两端，两极间产生强电场，虚线为等势面，在强电场作用下，一带电液滴从发射极加速飞向吸极，a、b 是其路径上的两点，不计液滴重力，下列说法正确的是（　　）

【图】上方标“高压电源”，电池符号长线在左、短线在右。左端引线向下接到左侧喷管状的发射极，喷口处标“带电液滴”；右端引线接到右侧的极板。右侧有上下两块竖直极板，中间留有缝，下方那块标“吸极”。一条水平直线从喷口向右穿过 a、b，指向极板之间的缝，a 在左、b 在右。两极之间有虚线等势面：通过 a 的一条更靠近发射极、弯曲更厉害，通过 b 的一条更靠近吸极、弯曲较缓，a 附近的虚线比 b 附近更密。旁标“等势面”。

A. a 点的电势比 b 点的低

B. a 点的电场强度比 b 点的小

C. 液滴在 a 点的加速度比在 b 点的小

D. 液滴在 a 点的电势能比在 b 点的大
