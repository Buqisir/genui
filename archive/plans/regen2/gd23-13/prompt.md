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
- 头信息：`id: gd23-13`，`source: 2023 广东卷 第 13 题（计算）`，`question` 原样抄题目。
- `answers`：每个能写成数值的答案一条 `{ name, value, unit }`。`name` 必须是课件里某个 `<Param>` 或 `<Define>` 的名字，`value` 是你单独算出的数值。校验器会在初始参数下用课件里的公式重新计算并核对，误差超过 1% 就退回。题目只有字母没有数值时，给参数取代表性数值，并在正文说明。
- 选择题：头信息写 `choice`（选出的选项字母，多选按字母顺序连写，如 `BD`），按第七节第 13 条逐项判断；没有数值答案时写 `answers: []`。
- 只用规范里列出的组件和属性；表达式只能引用已声明的名字；`<Sim>` 只能用规范里列出的 `v` 工具。
- 写之前先把物理过程想清楚，确认答案正确，再决定交互方式（遵守第六、七节）。

把课件写到 /Users/huangxuewei/Projects/genui/plans/regen2/gd23-13/lesson.md（第一行就是 `---`，不要用代码围栏包住整个文件）。写完运行：

/Users/huangxuewei/Projects/genui/bin/genui validate /Users/huangxuewei/Projects/genui/plans/regen2/gd23-13/lesson.md

每条错误末尾写着该读的文档。用 `/Users/huangxuewei/Projects/genui/bin/genui docs <id>` 读完再改，直到校验没有错误。然后运行：

/Users/huangxuewei/Projects/genui/bin/genui layout /Users/huangxuewei/Projects/genui/plans/regen2/gd23-13/lesson.md

按报告改掉压线和出界。不要联网，不要启动子代理。

## 题目（气泡的膨胀与收缩，2023 广东卷 第 13 题（计算））

在驻波声场作用下，水中小气泡周围液体的压强会发生周期性变化，使小气泡周期性膨胀和收缩，气泡内气体可视为质量不变的理想气体，其膨胀和收缩过程可简化为如图所示的 p–V 图像，气泡内气体先从压强为 p_0、体积为 V_0、温度为 T_0 的状态 A 等温膨胀到体积为 5V_0、压强为 p_B 的状态 B，然后从状态 B 绝热收缩到体积为 V_0、压强为 1.9p_0、温度为 T_C 的状态 C，B 到 C 过程中外界对气体做功为 W．已知 p_0、V_0、T_0 和 W．求：

【图】p–V 图像。纵轴 p、横轴 V，原点 O，两轴都有箭头。状态 A 在纵轴右侧，高度标 p_0，A 向左有水平虚线接到纵轴，向下有竖直虚线接到横轴，横轴交点标 V_0。状态 C 在 A 的正上方，高度标 1.9p_0，C 向左有水平虚线接到纵轴，并与 A 共用向下的那条竖直虚线。状态 B 在右下方，由 B 向下的竖直虚线接到横轴，交点标 5V_0。A 与 B 之间是一条向下弯的曲线，曲线旁标“等温”，曲线上的箭头由 A 指向 B。B 与 C 之间是另一条向上弯的曲线，曲线旁标“绝热”，曲线上的箭头由 B 指向 C。

（1）p_B 的表达式；

（2）T_C 的表达式；

（3）B 到 C 过程，气泡内气体的内能变化了多少？
