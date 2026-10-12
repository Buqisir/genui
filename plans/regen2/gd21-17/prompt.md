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
- 头信息：`id: gd21-17`，`source: 2021 广东卷 第 17 题（选考·选修 3-4，填空；选考共 12 分，原卷未单列本题分值）`，`question` 原样抄题目。
- `answers`：每个能写成数值的答案一条 `{ name, value, unit }`。`name` 必须是课件里某个 `<Param>` 或 `<Define>` 的名字，`value` 是你单独算出的数值。校验器会在初始参数下用课件里的公式重新计算并核对，误差超过 1% 就退回。题目只有字母没有数值时，给参数取代表性数值，并在正文说明。
- 选择题：头信息写 `choice`（选出的选项字母，多选按字母顺序连写，如 `BD`），按第七节第 13 条逐项判断；没有数值答案时写 `answers: []`。
- 只用规范里列出的组件和属性；表达式只能引用已声明的名字；`<Sim>` 只能用规范里列出的 `v` 工具。
- 写之前先把物理过程想清楚，确认答案正确，再决定交互方式（遵守第六、七节）。

把课件写到 /Users/huangxuewei/Projects/genui/plans/regen2/gd21-17/lesson.md（第一行就是 `---`，不要用代码围栏包住整个文件）。写完运行：

/Users/huangxuewei/Projects/genui/bin/genui validate /Users/huangxuewei/Projects/genui/plans/regen2/gd21-17/lesson.md

每条错误末尾写着该读的文档。用 `/Users/huangxuewei/Projects/genui/bin/genui docs <id>` 读完再改，直到校验没有错误。然后运行：

/Users/huangxuewei/Projects/genui/bin/genui layout /Users/huangxuewei/Projects/genui/plans/regen2/gd21-17/lesson.md

按报告改掉压线和出界。不要联网，不要启动子代理。

## 题目（弹簧下端的小球，2021 广东卷 第 17 题（选考·选修 3-4，填空；选考共 12 分，原卷未单列本题分值））

如图所示，一个轻质弹簧下端挂一小球，小球静止。现将小球向下拉动距离 A 后由静止释放，并开始计时，小球在竖直方向做简谐运动，周期为 T。经 T/8 时间，小球从最低点向上运动的距离 ______ A/2（选填“大于”、“小于”或“等于”）；在 T/4 时刻，小球的动能 ______（选填“最大”或“最小”）。

【图】天花板下悬挂一根轻弹簧，下端是实线小球；正下方有一个虚线小球，实线球与虚线球之间用双向箭头标 A，箭头指向下方。

【图】y–t 图像。纵轴 y 向上，标有 A、O、−A，y = A 和 y = −A 各有一条水平虚线；横轴 t 向右，标有 T/2 和 T。曲线从 t = 0、y = −A 出发，上升穿过 O，在 t = T/2 达到 y = A（峰值处有竖直虚线），再下降穿过 O，在 t = T 达到 y = −A（谷值处有竖直虚线），之后转而上升。
