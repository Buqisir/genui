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
- 头信息：`id: gd22-16`，`source: 2022 广东卷 第 16 题（选考·选修 3-3，计算；选考共 12 分，原卷未单列本题分值）`，`question` 原样抄题目。
- `answers`：每个能写成数值的答案一条 `{ name, value, unit }`。`name` 必须是课件里某个 `<Param>` 或 `<Define>` 的名字，`value` 是你单独算出的数值。校验器会在初始参数下用课件里的公式重新计算并核对，误差超过 1% 就退回。题目只有字母没有数值时，给参数取代表性数值，并在正文说明。
- 选择题：头信息写 `choice`（选出的选项字母，多选按字母顺序连写，如 `BD`），按第七节第 13 条逐项判断；没有数值答案时写 `answers: []`。
- 只用规范里列出的组件和属性；表达式只能引用已声明的名字；`<Sim>` 只能用规范里列出的 `v` 工具。
- 写之前先把物理过程想清楚，确认答案正确，再决定交互方式（遵守第六、七节）。

把课件写到 /Users/huangxuewei/Projects/genui/plans/regen2/gd22-16/lesson.md（第一行就是 `---`，不要用代码围栏包住整个文件）。写完运行：

/Users/huangxuewei/Projects/genui/bin/genui validate /Users/huangxuewei/Projects/genui/plans/regen2/gd22-16/lesson.md

每条错误末尾写着该读的文档。用 `/Users/huangxuewei/Projects/genui/bin/genui docs <id>` 读完再改，直到校验没有错误。然后运行：

/Users/huangxuewei/Projects/genui/bin/genui layout /Users/huangxuewei/Projects/genui/plans/regen2/gd22-16/lesson.md

按报告改掉压线和出界。不要联网，不要启动子代理。

## 题目（玻璃瓶测水深，2022 广东卷 第 16 题（选考·选修 3-3，计算；选考共 12 分，原卷未单列本题分值））

玻璃瓶可作为测量水深的简易装置。如图所示，潜水员在水面上将 80 mL 水装入容积为 380 mL 的玻璃瓶中，拧紧瓶盖后带入水底，倒置瓶身，打开瓶盖，让水进入瓶中，稳定后测得瓶内水的体积为 230 mL。将瓶内气体视为理想气体，全程气体不泄漏且温度不变。大气压强 p_0 取 1.0×10^5 Pa，重力加速度 g 取 10 m/s^2，水的密度 ρ 取 1.0×10^3 kg/m^3。求水底的压强 p 和水的深度 h。

【图】一只瓶口朝下的玻璃瓶：上方是宽瓶身，下方收成瓶颈，瓶口在最下端并画有几道横线。瓶身上部有一条水平虚线，引线标「下潜后液面」。瓶颈处另有一条水平线，线旁标「水」，引线标「下潜前液面」。
