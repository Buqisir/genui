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
- 头信息：`id: gd25-04`，`source: 2025 广东卷（部分试题）第 4 题（多选）`，`question` 原样抄题目。
- `answers`：每个能写成数值的答案一条 `{ name, value, unit }`。`name` 必须是课件里某个 `<Param>` 或 `<Define>` 的名字，`value` 是你单独算出的数值。校验器会在初始参数下用课件里的公式重新计算并核对，误差超过 1% 就退回。题目只有字母没有数值时，给参数取代表性数值，并在正文说明。
- 选择题：头信息写 `choice`（选出的选项字母，多选按字母顺序连写，如 `BD`），按第七节第 13 条逐项判断；没有数值答案时写 `answers: []`。
- 只用规范里列出的组件和属性；表达式只能引用已声明的名字；`<Sim>` 只能用规范里列出的 `v` 工具。
- 写之前先把物理过程想清楚，确认答案正确，再决定交互方式（遵守第六、七节）。

把课件写到 /Users/huangxuewei/Projects/genui/plans/regen2/gd25-04/lesson.md（第一行就是 `---`，不要用代码围栏包住整个文件）。写完运行：

/Users/huangxuewei/Projects/genui/bin/genui validate /Users/huangxuewei/Projects/genui/plans/regen2/gd25-04/lesson.md

每条错误末尾写着该读的文档。用 `/Users/huangxuewei/Projects/genui/bin/genui docs <id>` 读完再改，直到校验没有错误。然后运行：

/Users/huangxuewei/Projects/genui/bin/genui layout /Users/huangxuewei/Projects/genui/plans/regen2/gd25-04/lesson.md

按报告改掉压线和出界。不要联网，不要启动子代理。

## 题目（冰坑内壁上的小球，2025 广东卷（部分试题）第 4 题（多选））

可视为质点的小球，沿光滑的冰坑内壁滑出，使小球在水平面内做匀速圆周运动，如图所示。已知圆周运动的轨道半径 R = 0.4m，小球所在位置切面与水平面夹角 θ = 45°，小球质量为 m = 0.1kg，重力加速度取 g = 10m/s^2。关于小球，以下说法正确的是（ ）

【图】冰坑剖面：一条曲线从左侧的小球处向右下凹，再向右上扬，右端收成一小段竖直壁。小球画成小圆，圆心有一个点。过圆心向左伸一条水平虚线，从圆心向左下方画一条实线，两线的夹角标 θ。从圆心向右画一条水平箭头；从圆心向右上方画一条箭头，旁边标 R，该箭头末端接一个虚线直角（一条竖直虚线向上、一条水平虚线向右）。小球左下方沿斜线还有一条指向斜下方的箭头。

A. 角速度为 5rad/s
B. 线速度大小为 4m/s
C. 向心加速度大小为 10m/s^2
D. 所受支持力大小为 1N
