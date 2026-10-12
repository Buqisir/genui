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
- 头信息：`id: gd25-08`，`source: 2025 广东卷（部分试题）第 8 题（计算）`，`question` 原样抄题目。
- `answers`：每个能写成数值的答案一条 `{ name, value, unit }`。`name` 必须是课件里某个 `<Param>` 或 `<Define>` 的名字，`value` 是你单独算出的数值。校验器会在初始参数下用课件里的公式重新计算并核对，误差超过 1% 就退回。题目只有字母没有数值时，给参数取代表性数值，并在正文说明。
- 选择题：头信息写 `choice`（选出的选项字母，多选按字母顺序连写，如 `BD`），按第七节第 13 条逐项判断；没有数值答案时写 `answers: []`。
- 只用规范里列出的组件和属性；表达式只能引用已声明的名字；`<Sim>` 只能用规范里列出的 `v` 工具。
- 写之前先把物理过程想清楚，确认答案正确，再决定交互方式（遵守第六、七节）。

把课件写到 /Users/huangxuewei/Projects/genui/plans/regen2/gd25-08/lesson.md（第一行就是 `---`，不要用代码围栏包住整个文件）。写完运行：

/Users/huangxuewei/Projects/genui/bin/genui validate /Users/huangxuewei/Projects/genui/plans/regen2/gd25-08/lesson.md

每条错误末尾写着该读的文档。用 `/Users/huangxuewei/Projects/genui/bin/genui docs <id>` 读完再改，直到校验没有错误。然后运行：

/Users/huangxuewei/Projects/genui/bin/genui layout /Users/huangxuewei/Projects/genui/plans/regen2/gd25-08/lesson.md

按报告改掉压线和出界。不要联网，不要启动子代理。

## 题目（开瓶器拔出木塞，2025 广东卷（部分试题）第 8 题（计算））

用开瓶器拔出瓶中的木塞，初始时软木塞的上截面与玻璃瓶口平齐，木塞质量为 m，高为 h，过程中做匀加速直线运动，加速度为 a、过程中木塞受到的摩擦力为 f = f_0(1 − x/h)，其中 f_0 为参数，h 为木塞高，x 为木塞运动的距离。开瓶器齿轮的半径为 r，重力加速度为 g。

【图】开瓶器剖面。最上方左右各露出一截斜向把手。把手下方左右两个齿轮啮合，左齿轮旁标“齿轮”。两齿轮之间下方是一根竖直弹簧，套在中轴上。弹簧下面是木塞，标“塞子”：木塞上部有一截颜色较浅，下部颜色较深，插在瓶口里。瓶身画成下方的矩形，瓶口左右有一圈外沿。木塞左上方、瓶口外沿与其上方一条短横线之间有一段竖直双向箭头，标 Δx。

(1)求拔出时，齿轮的角速度 ω；

(2)求初始到拔出，开瓶器对木塞做的功 W；

(3)设经过时间为 t，求开瓶器的功率 P 与 t 的关系式。
