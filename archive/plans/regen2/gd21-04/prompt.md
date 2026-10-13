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
- 头信息：`id: gd21-04`，`source: 2021 广东卷 第 4 题（单选，4 分）`，`question` 原样抄题目。
- `answers`：每个能写成数值的答案一条 `{ name, value, unit }`。`name` 必须是课件里某个 `<Param>` 或 `<Define>` 的名字，`value` 是你单独算出的数值。校验器会在初始参数下用课件里的公式重新计算并核对，误差超过 1% 就退回。题目只有字母没有数值时，给参数取代表性数值，并在正文说明。
- 选择题：头信息写 `choice`（选出的选项字母，多选按字母顺序连写，如 `BD`），按第七节第 13 条逐项判断；没有数值答案时写 `answers: []`。
- 只用规范里列出的组件和属性；表达式只能引用已声明的名字；`<Sim>` 只能用规范里列出的 `v` 工具。
- 写之前先把物理过程想清楚，确认答案正确，再决定交互方式（遵守第六、七节）。

把课件写到 /Users/huangxuewei/Projects/genui/plans/regen2/gd21-04/lesson.md（第一行就是 `---`，不要用代码围栏包住整个文件）。写完运行：

/Users/huangxuewei/Projects/genui/bin/genui validate /Users/huangxuewei/Projects/genui/plans/regen2/gd21-04/lesson.md

每条错误末尾写着该读的文档。用 `/Users/huangxuewei/Projects/genui/bin/genui docs <id>` 读完再改，直到校验没有错误。然后运行：

/Users/huangxuewei/Projects/genui/bin/genui layout /Users/huangxuewei/Projects/genui/plans/regen2/gd21-04/lesson.md

按报告改掉压线和出界。不要联网，不要启动子代理。

## 题目（曲杆道闸抬起，2021 广东卷 第 4 题（单选，4 分））

由于高度限制，车库出入口采用图所示的曲杆道闸，道闸由转动杆 OP 与横杆 PQ 链接而成，P、Q 为横杆的两个端点。在道闸抬起过程中，杆 PQ 始终保持水平。杆 OP 绕 O 点从与水平方向成 30°匀速转动到 60°的过程中，下列说法正确的是（　　）

【图】地面用斜线表示。O 是支架顶上的转轴。实线位置：OP 为黑白相间的杆，与水平虚线成 30°，P 之后 PQ 水平向右直到 Q。虚线位置：OP 抬得更高，与同一水平虚线成 60°，对应的 P、Q 也画成虚线，PQ 仍水平。两个角分别标 30°、60°。

A. P 点的线速度大小不变

B. P 点的加速度方向不变

C. Q 点在竖直方向做匀速运动

D. Q 点在水平方向做匀速运动
