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
- 头信息：`id: gd21-07`，`source: 2021 广东卷 第 7 题（单选，4 分）`，`question` 原样抄题目。
- `answers`：每个能写成数值的答案一条 `{ name, value, unit }`。`name` 必须是课件里某个 `<Param>` 或 `<Define>` 的名字，`value` 是你单独算出的数值。校验器会在初始参数下用课件里的公式重新计算并核对，误差超过 1% 就退回。题目只有字母没有数值时，给参数取代表性数值，并在正文说明。
- 选择题：头信息写 `choice`（选出的选项字母，多选按字母顺序连写，如 `BD`），按第七节第 13 条逐项判断；没有数值答案时写 `answers: []`。
- 只用规范里列出的组件和属性；表达式只能引用已声明的名字；`<Sim>` 只能用规范里列出的 `v` 工具。
- 写之前先把物理过程想清楚，确认答案正确，再决定交互方式（遵守第六、七节）。

把课件写到 /Users/huangxuewei/Projects/genui/plans/regen2/gd21-07/lesson.md（第一行就是 `---`，不要用代码围栏包住整个文件）。写完运行：

/Users/huangxuewei/Projects/genui/bin/genui validate /Users/huangxuewei/Projects/genui/plans/regen2/gd21-07/lesson.md

每条错误末尾写着该读的文档。用 `/Users/huangxuewei/Projects/genui/bin/genui docs <id>` 读完再改，直到校验没有错误。然后运行：

/Users/huangxuewei/Projects/genui/bin/genui layout /Users/huangxuewei/Projects/genui/plans/regen2/gd21-07/lesson.md

按报告改掉压线和出界。不要联网，不要启动子代理。

## 题目（永磁铁充电装置，2021 广东卷 第 7 题（单选，4 分））

某同学设计了一个充电装置，如图所示，假设永磁铁的往复运动在螺线管中产生近似正弦式交流电，周期为 0.2 s，电压最大值为 0.05 V，理想变压器原线圈接螺线管，副线圈接充电电路，原、副线圈匝数比为 1∶60，下列说法正确的是（　　）

【图】左侧条形磁铁竖直放置，上端标 N、下端标 S，磁铁旁有竖直双向箭头。磁铁右侧是一个螺线管，螺线管两端接到变压器原线圈。变压器为闭合铁芯，副线圈在右侧，接到标有“充电电路”的方框。

A. 交流电的频率为 10 Hz

B. 副线圈两端电压最大值为 3 V

C. 变压器输入电压与永磁铁磁场强弱无关

D. 充电电路的输入功率大于变压器的输入功率
