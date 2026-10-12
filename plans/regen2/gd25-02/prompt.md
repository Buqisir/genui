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
- 头信息：`id: gd25-02`，`source: 2025 广东卷（部分试题）第 2 题（单选）`，`question` 原样抄题目。
- `answers`：每个能写成数值的答案一条 `{ name, value, unit }`。`name` 必须是课件里某个 `<Param>` 或 `<Define>` 的名字，`value` 是你单独算出的数值。校验器会在初始参数下用课件里的公式重新计算并核对，误差超过 1% 就退回。题目只有字母没有数值时，给参数取代表性数值，并在正文说明。
- 选择题：头信息写 `choice`（选出的选项字母，多选按字母顺序连写，如 `BD`），按第七节第 13 条逐项判断；没有数值答案时写 `answers: []`。
- 只用规范里列出的组件和属性；表达式只能引用已声明的名字；`<Sim>` 只能用规范里列出的 `v` 工具。
- 写之前先把物理过程想清楚，确认答案正确，再决定交互方式（遵守第六、七节）。

把课件写到 /Users/huangxuewei/Projects/genui/plans/regen2/gd25-02/lesson.md（第一行就是 `---`，不要用代码围栏包住整个文件）。写完运行：

/Users/huangxuewei/Projects/genui/bin/genui validate /Users/huangxuewei/Projects/genui/plans/regen2/gd25-02/lesson.md

每条错误末尾写着该读的文档。用 `/Users/huangxuewei/Projects/genui/bin/genui docs <id>` 读完再改，直到校验没有错误。然后运行：

/Users/huangxuewei/Projects/genui/bin/genui layout /Users/huangxuewei/Projects/genui/plans/regen2/gd25-02/lesson.md

按报告改掉压线和出界。不要联网，不要启动子代理。

## 题目（同步加速器的通道，2025 广东卷（部分试题）第 2 题（单选））

图是某种同步加速器的原理图。直线通道 PQ 有电势差为 U 的加速电场，通道转角处有可调的匀强偏转磁场 B。电量为 +q，质量为 m 的带电粒子以速度 v_0 进入加速电场，而后可以在通道中循环加速。带电粒子在偏转磁场中运动的半径为 R。忽略相对论效应，下列说法正确的是（ ）

【图】圆角三角形闭合通道，顶点朝上，三个角是圆弧，通道画成双线。底边是一段直线通道，左端标 Q、右端标 P，这段直线两端各有一条竖直虚线。底边下方有一条水平双箭头，左箭头指向 Q、右箭头指向 P，中间标 U。图上没有画出磁场方向。

A. 偏转磁场的磁感应强度方向垂直纸面向里
B. 加速一次后，带电粒子的动能增量为 2qU
C. 加速 k 次后，带电粒子的动能增量为 v = (1/m)√(mv_0^2 + kmqU)
D. 加速 k 次后，偏转磁场的磁感应强度为 B = √(m^2 v_0^2 + 2kmqU)/(qR)
