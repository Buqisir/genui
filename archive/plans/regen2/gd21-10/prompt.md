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
- 头信息：`id: gd21-10`，`source: 2021 广东卷 第 10 题（多选，6 分）`，`question` 原样抄题目。
- `answers`：每个能写成数值的答案一条 `{ name, value, unit }`。`name` 必须是课件里某个 `<Param>` 或 `<Define>` 的名字，`value` 是你单独算出的数值。校验器会在初始参数下用课件里的公式重新计算并核对，误差超过 1% 就退回。题目只有字母没有数值时，给参数取代表性数值，并在正文说明。
- 选择题：头信息写 `choice`（选出的选项字母，多选按字母顺序连写，如 `BD`），按第七节第 13 条逐项判断；没有数值答案时写 `answers: []`。
- 只用规范里列出的组件和属性；表达式只能引用已声明的名字；`<Sim>` 只能用规范里列出的 `v` 工具。
- 写之前先把物理过程想清楚，确认答案正确，再决定交互方式（遵守第六、七节）。

把课件写到 /Users/huangxuewei/Projects/genui/plans/regen2/gd21-10/lesson.md（第一行就是 `---`，不要用代码围栏包住整个文件）。写完运行：

/Users/huangxuewei/Projects/genui/bin/genui validate /Users/huangxuewei/Projects/genui/plans/regen2/gd21-10/lesson.md

每条错误末尾写着该读的文档。用 `/Users/huangxuewei/Projects/genui/bin/genui docs <id>` 读完再改，直到校验没有错误。然后运行：

/Users/huangxuewei/Projects/genui/bin/genui layout /Users/huangxuewei/Projects/genui/plans/regen2/gd21-10/lesson.md

按报告改掉压线和出界。不要联网，不要启动子代理。

## 题目（圆弧导轨与金属杆，2021 广东卷 第 10 题（多选，6 分））

如图所示，水平放置足够长光滑金属导轨 abc 和 de，ab 与 de 平行，bc 是以 O 为圆心的圆弧导轨，圆弧 be 左侧和扇形 Obc 内有方向如图的匀强磁场，金属杆 OP 的 O 端与 e 点用导线相接，P 端与圆弧 bc 接触良好，初始时，可滑动的金属杆 MN 静止在平行导轨上，若杆 OP 绕 O 点在匀强磁场区内从 b 到 c 匀速转动时，回路中始终有电流，则此过程中，下列说法正确的有（　　）

【图】两条水平导轨。上轨从左到右标 a、M、b，然后以 O 为圆心的实线圆弧向上拱起接到右端 c。下轨从左到右标 d、N、e，ab 与 de 平行。MN 是搭在平行导轨上的粗金属杆。O 在圆弧下方，O 与 e 用导线相连。杆 OP 位于扇形内，P 在圆弧 bc 上靠近 b 的一侧，杆上有一个指向 P 的箭头。圆弧 be 左侧（平行导轨所围区域）画有“·”，旁标 B。扇形 Obc 内画有“×”，旁标 B；分隔这两个区域的圆弧 be 以及扇形的两条半径画成虚线。

A. 杆 OP 产生的感应电动势恒定

B. 杆 OP 受到的安培力不变

C. 杆 MN 做匀加速直线运动

D. 杆 MN 中的电流逐渐减小
