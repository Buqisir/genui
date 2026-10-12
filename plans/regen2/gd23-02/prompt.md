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
- 头信息：`id: gd23-02`，`source: 2023 广东卷 第 2 题（单选，4 分）`，`question` 原样抄题目。
- `answers`：每个能写成数值的答案一条 `{ name, value, unit }`。`name` 必须是课件里某个 `<Param>` 或 `<Define>` 的名字，`value` 是你单独算出的数值。校验器会在初始参数下用课件里的公式重新计算并核对，误差超过 1% 就退回。题目只有字母没有数值时，给参数取代表性数值，并在正文说明。
- 选择题：头信息写 `choice`（选出的选项字母，多选按字母顺序连写，如 `BD`），按第七节第 13 条逐项判断；没有数值答案时写 `answers: []`。
- 只用规范里列出的组件和属性；表达式只能引用已声明的名字；`<Sim>` 只能用规范里列出的 `v` 工具。
- 写之前先把物理过程想清楚，确认答案正确，再决定交互方式（遵守第六、七节）。

把课件写到 /Users/huangxuewei/Projects/genui/plans/regen2/gd23-02/lesson.md（第一行就是 `---`，不要用代码围栏包住整个文件）。写完运行：

/Users/huangxuewei/Projects/genui/bin/genui validate /Users/huangxuewei/Projects/genui/plans/regen2/gd23-02/lesson.md

每条错误末尾写着该读的文档。用 `/Users/huangxuewei/Projects/genui/bin/genui docs <id>` 读完再改，直到校验没有错误。然后运行：

/Users/huangxuewei/Projects/genui/bin/genui layout /Users/huangxuewei/Projects/genui/plans/regen2/gd23-02/lesson.md

按报告改掉压线和出界。不要联网，不要启动子代理。

## 题目（船舷上的检测机器人，2023 广东卷 第 2 题（单选，4 分））

如图所示，可视为质点的机器人通过磁铁吸附在船舷外壁面检测船体。壁面可视为斜面，与竖直方向夹角为 θ。船和机器人保持静止时，机器人仅受重力 G、支持力 F_N、摩擦力 F_f 和磁力 F 的作用，磁力垂直壁面。下列关系式正确的是（　　）

【图】船舷外壁画成一条斜线（形如「/」）：下端在左下方伸入水面，水面是一条波浪线；上端在右上方，顶端接一条向左延伸的近水平线（船舷上沿）。斜线下端旁有一条竖直虚线，两者的夹角标为 θ，角标在靠近水面处。斜线上贴着一个小矩形（机器人），矩形在斜线的右下侧（船体外侧，壁面在机器人的左上方）。从矩形画出四个箭头：F 垂直斜线指向左上方（指向壁面），F_f 沿斜线指向右上方，F_N 垂直斜线指向右下方（离开壁面），G 竖直向下。

A. F_f = G

B. F = F_N

C. F_f = G cos θ

D. F = G sin θ
