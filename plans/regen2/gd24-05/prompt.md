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
- 头信息：`id: gd24-05`，`source: 2024 广东卷 第 5 题（单选，4 分）`，`question` 原样抄题目。
- `answers`：每个能写成数值的答案一条 `{ name, value, unit }`。`name` 必须是课件里某个 `<Param>` 或 `<Define>` 的名字，`value` 是你单独算出的数值。校验器会在初始参数下用课件里的公式重新计算并核对，误差超过 1% 就退回。题目只有字母没有数值时，给参数取代表性数值，并在正文说明。
- 选择题：头信息写 `choice`（选出的选项字母，多选按字母顺序连写，如 `BD`），按第七节第 13 条逐项判断；没有数值答案时写 `answers: []`。
- 只用规范里列出的组件和属性；表达式只能引用已声明的名字；`<Sim>` 只能用规范里列出的 `v` 工具。
- 写之前先把物理过程想清楚，确认答案正确，再决定交互方式（遵守第六、七节）。

把课件写到 /Users/huangxuewei/Projects/genui/plans/regen2/gd24-05/lesson.md（第一行就是 `---`，不要用代码围栏包住整个文件）。写完运行：

/Users/huangxuewei/Projects/genui/bin/genui validate /Users/huangxuewei/Projects/genui/plans/regen2/gd24-05/lesson.md

每条错误末尾写着该读的文档。用 `/Users/huangxuewei/Projects/genui/bin/genui docs <id>` 读完再改，直到校验没有错误。然后运行：

/Users/huangxuewei/Projects/genui/bin/genui layout /Users/huangxuewei/Projects/genui/plans/regen2/gd24-05/lesson.md

按报告改掉压线和出界。不要联网，不要启动子代理。

## 题目（转动的卷轴与插销，2024 广东卷 第 5 题（单选，4 分））

如图所示，在细绳的拉动下，半径为 r 的卷轴可绕其固定的中心点 O 在水平面内转动。卷轴上沿半径方向固定着长度为 l 的细管，管底在 O 点。细管内有一根原长为 l/2、劲度系数为 k 的轻质弹簧，弹簧底端固定在管底，顶端连接质量为 m、可视为质点的插销。当以速度 v 匀速拉动细绳时，插销做匀速圆周运动。若 v 过大，插销会卡进固定的端盖。使卷轴转动停止。忽略摩擦力，弹簧在弹性限度内。要使卷轴转动不停止，v 的最大值为（　　）

【图】水平面内的装置，中心标 O。橙色圆盘标“卷轴”，从 O 竖直向下到圆盘边缘的箭头标 r。圆盘外围是一圈分成多段的灰色环，左上方标“隔盖”。一条水平细管从左外侧伸到 O，标“细管”；沿管的双箭头从管的外端量到 O，标 l。管的外端有一小块，标“插销”。圆盘下缘向右引出一条线，靠近圆盘的一段为虚线并与下缘相切，向右的实线标“细绳”，线下方有向右箭头标 v。

A. r√(k/(2m))

B. l√(k/(2m))

C. r√(2k/m)

D. l√(2k/m)
