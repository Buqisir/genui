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
- 头信息：`id: gd22-13`，`source: 2022 广东卷 第 13 题（计算；必考题共 42 分，原卷未单列本题分值）`，`question` 原样抄题目。
- `answers`：每个能写成数值的答案一条 `{ name, value, unit }`。`name` 必须是课件里某个 `<Param>` 或 `<Define>` 的名字，`value` 是你单独算出的数值。校验器会在初始参数下用课件里的公式重新计算并核对，误差超过 1% 就退回。题目只有字母没有数值时，给参数取代表性数值，并在正文说明。
- 选择题：头信息写 `choice`（选出的选项字母，多选按字母顺序连写，如 `BD`），按第七节第 13 条逐项判断；没有数值答案时写 `answers: []`。
- 只用规范里列出的组件和属性；表达式只能引用已声明的名字；`<Sim>` 只能用规范里列出的 `v` 工具。
- 写之前先把物理过程想清楚，确认答案正确，再决定交互方式（遵守第六、七节）。

把课件写到 /Users/huangxuewei/Projects/genui/plans/regen2/gd22-13/lesson.md（第一行就是 `---`，不要用代码围栏包住整个文件）。写完运行：

/Users/huangxuewei/Projects/genui/bin/genui validate /Users/huangxuewei/Projects/genui/plans/regen2/gd22-13/lesson.md

每条错误末尾写着该读的文档。用 `/Users/huangxuewei/Projects/genui/bin/genui docs <id>` 读完再改，直到校验没有错误。然后运行：

/Users/huangxuewei/Projects/genui/bin/genui layout /Users/huangxuewei/Projects/genui/plans/regen2/gd22-13/lesson.md

按报告改掉压线和出界。不要联网，不要启动子代理。

## 题目（滑杆上的滑块，2022 广东卷 第 13 题（计算；必考题共 42 分，原卷未单列本题分值））

某同学受自动雨伞开伞过程的启发，设计了如图所示的物理模型。竖直放置在水平桌面上的滑杆上套有一个滑块，初始时它们处于静止状态。当滑块从 A 处以初速度 v_0 为 10 m/s 向上滑动时，受到滑杆的摩擦力 f 为 1 N，滑块滑到 B 处与滑杆发生完全非弹性碰撞，带动滑杆离开桌面一起竖直向上运动。已知滑块的质量 m = 0.2 kg，滑杆的质量 M = 0.6 kg，A、B 间的距离 l = 1.2 m，重力加速度 g 取 10 m/s^2，不计空气阻力。求：

（1）滑块在静止时和向上滑动的过程中，桌面对滑杆支持力的大小 N_1 和 N_2；

（2）滑块碰撞前瞬间的速度大小 v_1；

（3）滑杆向上运动的最大高度 h。

【图】一根竖直滑杆立在画有斜线的水平桌面上，左侧标「滑杆」。杆顶有一横档，标 B。杆的下部套着一个小方块，左侧标「滑块」，方块处标 A。尺寸线 l 竖直画在杆的右侧，上端对着 B，下端箭头指向 A。滑块下方滑杆继续向下，接到桌面上的底座；滑块和底座之间的杆上有一小段弯曲线，图上没有标名称。
