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
- 头信息：`id: gd24-06`，`source: 2024 广东卷 第 6 题（单选，4 分）`，`question` 原样抄题目。
- `answers`：每个能写成数值的答案一条 `{ name, value, unit }`。`name` 必须是课件里某个 `<Param>` 或 `<Define>` 的名字，`value` 是你单独算出的数值。校验器会在初始参数下用课件里的公式重新计算并核对，误差超过 1% 就退回。题目只有字母没有数值时，给参数取代表性数值，并在正文说明。
- 选择题：头信息写 `choice`（选出的选项字母，多选按字母顺序连写，如 `BD`），按第七节第 13 条逐项判断；没有数值答案时写 `answers: []`。
- 只用规范里列出的组件和属性；表达式只能引用已声明的名字；`<Sim>` 只能用规范里列出的 `v` 工具。
- 写之前先把物理过程想清楚，确认答案正确，再决定交互方式（遵守第六、七节）。

把课件写到 /Users/huangxuewei/Projects/genui/plans/regen/gd24-06/lesson.md（第一行就是 `---`，不要用代码围栏包住整个文件）。写完运行：

/Users/huangxuewei/Projects/genui/bin/genui validate /Users/huangxuewei/Projects/genui/plans/regen/gd24-06/lesson.md

每条错误末尾写着该读的文档。用 `/Users/huangxuewei/Projects/genui/bin/genui docs <id>` 读完再改，直到校验没有错误。然后运行：

/Users/huangxuewei/Projects/genui/bin/genui layout /Users/huangxuewei/Projects/genui/plans/regen/gd24-06/lesson.md

按报告改掉压线和出界。不要联网，不要启动子代理。

## 题目（介质中的红绿光束，2024 广东卷 第 6 题（单选，4 分））

如图所示，红绿两束单色光，同时从空气中沿同一路径以 θ 角从 MN 面射入某长方体透明均匀介质。折射光束在 NP 面发生全反射。反射光射向 PQ 面。若 θ 逐渐增大。两束光在 NP 面上的全反射现象会先后消失。已知在该介质中红光的折射率小于绿光的折射率。下列说法正确的是（　　）

【图】一个长方形透明块。左下角标 M，左上角标 N，右上角标 P，右下角标 Q，所以左边为 MN、上边为 NP、右边为 PQ。一条光线从左下方射向 MN 边中部偏下；过入射点有一条水平虚线，入射光线与这条虚线的夹角标 θ。进入介质后分成两条折射光线，分别射到 NP 边上的两处，各自反射后斜向右下方，射向 PQ 边。

A. 在 PQ 面上，红光比绿光更靠近 P 点

B. θ 逐渐增大时，红光的全反射现象先消失

C. θ 逐渐增大时，入射光可能在 MN 面发生全反射

D. θ 逐渐减小时，两束光在 MN 面折射的折射角逐渐增大
