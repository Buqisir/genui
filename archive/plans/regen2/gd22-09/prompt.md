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
- 头信息：`id: gd22-09`，`source: 2022 广东卷 第 9 题（多选，6 分）`，`question` 原样抄题目。
- `answers`：每个能写成数值的答案一条 `{ name, value, unit }`。`name` 必须是课件里某个 `<Param>` 或 `<Define>` 的名字，`value` 是你单独算出的数值。校验器会在初始参数下用课件里的公式重新计算并核对，误差超过 1% 就退回。题目只有字母没有数值时，给参数取代表性数值，并在正文说明。
- 选择题：头信息写 `choice`（选出的选项字母，多选按字母顺序连写，如 `BD`），按第七节第 13 条逐项判断；没有数值答案时写 `answers: []`。
- 只用规范里列出的组件和属性；表达式只能引用已声明的名字；`<Sim>` 只能用规范里列出的 `v` 工具。
- 写之前先把物理过程想清楚，确认答案正确，再决定交互方式（遵守第六、七节）。

把课件写到 /Users/huangxuewei/Projects/genui/plans/regen2/gd22-09/lesson.md（第一行就是 `---`，不要用代码围栏包住整个文件）。写完运行：

/Users/huangxuewei/Projects/genui/bin/genui validate /Users/huangxuewei/Projects/genui/plans/regen2/gd22-09/lesson.md

每条错误末尾写着该读的文档。用 `/Users/huangxuewei/Projects/genui/bin/genui docs <id>` 读完再改，直到校验没有错误。然后运行：

/Users/huangxuewei/Projects/genui/bin/genui layout /Users/huangxuewei/Projects/genui/plans/regen2/gd22-09/lesson.md

按报告改掉压线和出界。不要联网，不要启动子代理。

## 题目（无人小车爬斜坡，2022 广东卷 第 9 题（多选，6 分））

如图所示，载有防疫物资的无人驾驶小车，在水平 MN 段以恒定功率 200 W、速度 5 m/s 匀速行驶，在斜坡 PQ 段以恒定功率 570 W、速度 2 m/s 匀速行驶。已知小车总质量为 50 kg，MN = PQ = 20 m，PQ 段的倾角为 30°，重力加速度 g 取 10 m/s^2，不计空气阻力。下列说法正确的有（ ）

【图】地面画有斜线。右侧水平路面上有一辆小车，车头朝左，车下偏右标 M，水平段左端标 N。从 N 向左上方伸出一段斜坡，N 处标着坡与水平面的夹角 30°。斜坡中部标 P，坡顶标 Q；Q 处用虚线画着一辆沿坡向上的小车，并从 Q 向下引一条竖直虚线落到地面。

A. 从 M 到 N，小车牵引力大小为 40 N
B. 从 M 到 N，小车克服摩擦力做功 800 J
C. 从 P 到 Q，小车重力势能增加 1×10^4 J
D. 从 P 到 Q，小车克服摩擦力做功 700 J
