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
- 头信息：`id: gd22-18`，`source: 2022 广东卷 第 18 题（选考·选修 3-4，计算；选考共 12 分，原卷未单列本题分值）`，`question` 原样抄题目。
- `answers`：每个能写成数值的答案一条 `{ name, value, unit }`。`name` 必须是课件里某个 `<Param>` 或 `<Define>` 的名字，`value` 是你单独算出的数值。校验器会在初始参数下用课件里的公式重新计算并核对，误差超过 1% 就退回。题目只有字母没有数值时，给参数取代表性数值，并在正文说明。
- 选择题：头信息写 `choice`（选出的选项字母，多选按字母顺序连写，如 `BD`），按第七节第 13 条逐项判断；没有数值答案时写 `answers: []`。
- 只用规范里列出的组件和属性；表达式只能引用已声明的名字；`<Sim>` 只能用规范里列出的 `v` 工具。
- 写之前先把物理过程想清楚，确认答案正确，再决定交互方式（遵守第六、七节）。

把课件写到 /Users/huangxuewei/Projects/genui/plans/regen2/gd22-18/lesson.md（第一行就是 `---`，不要用代码围栏包住整个文件）。写完运行：

/Users/huangxuewei/Projects/genui/bin/genui validate /Users/huangxuewei/Projects/genui/plans/regen2/gd22-18/lesson.md

每条错误末尾写着该读的文档。用 `/Users/huangxuewei/Projects/genui/bin/genui docs <id>` 读完再改，直到校验没有错误。然后运行：

/Users/huangxuewei/Projects/genui/bin/genui layout /Users/huangxuewei/Projects/genui/plans/regen2/gd22-18/lesson.md

按报告改掉压线和出界。不要联网，不要启动子代理。

## 题目（半罐液体里的激光，2022 广东卷 第 18 题（选考·选修 3-4，计算；选考共 12 分，原卷未单列本题分值））

一个水平放置的圆柱形罐体内装了一半的透明液体，液体上方是空气，其截面如图所示。一激光器从罐体底部 P 点沿着罐体的内壁向上移动，它所发出的光束始终指向圆心 O 点。当光束与竖直方向成 45° 角时，恰好观察不到从液体表面射向空气的折射光束。已知光在空气中的传播速度为 c，求液体的折射率 n 和激光在液体中的传播速度 v。

【图】一个圆。水平直径是液面：上半标「空气」，圆心 O 标在液面中央；下半涂了阴影，标「液体」。圆周最低点标 P，从 P 竖直向上到 O 画着一条箭头。激光器画在左下方的圆周上，标「激光器」，一条带箭头的光束从该处指向 O，光束与竖直向上的箭头夹角标 45°。
