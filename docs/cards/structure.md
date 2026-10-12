---
id: structure
layer: L1
title: 文件结构与标签写法
related:
  - params
  - rules
---

## 何时用

- 每份课件都从这里写起：YAML 头信息、Markdown 正文、单独成块的组件标签。
- 要声明滑块和派生量，读 `params`。小问、答案、读数、状态、快捷按钮分别读 `question`、`answer`、`readout`、`status`、`preset`。
- 选哪个情景组件、内容按什么顺序写，读 `rules`。本卡不讲某个组件的属性。
- 不要把标签嵌进段落、列表或表格。只有曲线、没有装置，也不够（见 `rules`）。

## 最小例子

```lesson
---
id: example-structure
title: 匀速滑块
question: 滑块以 2 m/s 运动，2 s 时位移是多少？
answers:
  - { name: x, value: 4, unit: m }
---

滑块做匀速直线运动。

<Param name="v" label="速度" value={2} min={0} max={4} unit="m/s" />

<Param name="t" label="时间" value={2} min={0} max={4} unit="s" />

<Define name="x" expr="v*t" />

<Figure title="滑块" params={["x"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 6, ymin: 0, ymax: 2 })
    v.line(m, 0, 0.4, 5, 0.4, { color: v.color.steel })
    v.rect(m, p.x, 0.4, 0.5, 0.35, { fill: v.color.graphite })
  },
})
</Figure>
```

头信息、正文、标签分成三块。`x` 由 `<Define>` 算出，`answers` 用同一个名字核对。情景用一张 `<Figure>`。

## 常见错误

- 照骨架漏写 `question` → 必须原样抄题目（校验：`头信息缺少 question`）。
- 非选择题写 `answers: []` → 至少一条 `{name, value}`，否则 `answers 为空`。只有选择题能配合 `choice` 写空数组。
- 「增加 3 个」「2 倍」这类计数或常数结果只写在 `<Answer>` 的 `text` 里 → 每个能写成数的空都要进 `answers`，先 `<Define name="nAdd" expr="3" />` 再写 `{ name: nAdd, value: 3 }`（gd21-11：答案对了，但核对找不到这一项）。
- `<Param name="g" … />` 再 `<Define name="g" … />` → 每个名字只声明一次（zj-22：`名字 g 重复声明`、`名字 Tmin 重复声明`）。
- `<Status cases={[…]}` 少了 `/>`，或 `<Sim>` 没有 `</Sim>` → 标签单独成块并闭合。zj-28 就是没闭合，报 `组件标签没有闭合`，后面整段解析不到。
- 把 `<Figure>` 写成自闭合 → 它和 `<Sim>` 一样有内容体，里面调用 `figure({...})`，再写 `</Figure>`。
- 属性里写 `{m*g}` → 数字用 `{10}`，随参数变化写成字符串 `"m*g"`。`{…}` 里是 JSON5，不能写 JS 表达式。

## 规范原文
<!-- region:structure -->
# 课件语法规范 v0.2

一道题对应一份课件文件（`.md`）。模型（Codex / DeepSeek）离线生成课件，校验通过后入库，前端渲染给学生看。

设计依据见 `genui-capture-findings.md`。核心取舍：

- **模型写内容，组件保证画面质量。** 高频图形（曲线、受力、电路、尺寸标注）由我们的预制组件绘制，模型只描述"画什么"。
- **数值在外层算，沙箱只负责画。** 外层用安全的数学表达式，可以离线检查；模型写的 JS 只在沙箱里运行。
- **只有一层沙箱。** 课件离线审核，外层组件都是我们自己的可信代码，只有 `<Sim>` 和 `<Figure>` 里的代码进沙箱。

---

## 一、文件结构

```
---
id: r6-06-car-chase
title: 追及相遇：前车刹车
subject: physics
topic: 追及相遇
source: 必修1 专题例题
answers:                      # 参考答案，校验用，不显示
  - { name: dmax, value: 16, unit: m }
  - { name: tCatch, value: 8, unit: s }
---

正文 Markdown……

<Param name="t" label="时间" min={0} max={8} step={0.1} value={0} unit="s" />

<Plot … />

正文 Markdown……
```

- 开头是 YAML 头信息，`id`、`title`、`question`（题目原文，页头「题目原文」按钮展开）必填；非选择题还必须有 `answers`。`answers` 用来自动核对，学生看不到。
- 选择题另写 `choice`：选出的选项字母，多选按字母顺序连写（`choice: C`、`choice: BD`），同样只用于核对。选项里能写成数值的量照样写进 `answers`；没有数值时写 `answers: []`。
- 可选头信息：`breadcrumb`（字符串数组，页头面包屑，不写时用 `topic`、`source`）、`theme`（`light` 默认，`night` 夜光主题，适合天体、光学、电磁这类"发光"情景；学生也可以在页头切换）。

### 页面布局（自动）

渲染器按组件类型自动排版，模型不用管位置：

- **左侧主栏**（920 px，12 栏）：情景（`Sim`、`Figure`、`ForceDiagram`、`Circuit`）、图表（`Plot`、`Bars`、`Ledger`、`Dial`）。第一个情景通栏；宽图表和窄卡片相邻时自动并排（7 + 5 栏），两张窄卡片并排（6 + 6）。需要时用 `size="full" | "wide" | "narrow"` 改。
- **右侧栏**（吸顶）：`Question`、`Param`、`Preset`、`Status`、`Readout`、`Answer`，按这个顺序排。
- **下方「分析与解答」**：全部 Markdown 正文。
- 窄屏（< 1180 px）单栏：问题 → 第一个情景 → 参数 → 读数 → 其余图表 → 答案。
- 正文是 Markdown，支持 GFM 表格和 KaTeX 公式：行内 `$...$`，独立公式 `$$...$$`。
- 组件写成大写字母开头的标签，见下一节。

## 二、组件标签的写法

**组件标签必须单独成块**：标签前后各空一行，不能写在段落、列表或表格中间。

```
<Name prop="字符串" prop={数字、布尔、数组或对象} />
```

- 字符串属性用双引号。
- 其余属性用 `{...}` 包住，里面是 **JSON5**（键名可以不加引号，可以用单引号，可以有末尾逗号）。**不能写 JS 表达式、函数或变量。**
- 需要随参数变化的值，写成**表达式字符串**，属性名以 `expr` 结尾，或者放在文档注明"表达式"的字段里（见第三节）。
- 只有 `<Sim>` 和 `<Figure>` 有内容体：`<Sim …>` 和 `</Sim>` 各占一行，中间是 JS 代码（`<Figure>` 同理，代码调用 `figure({...})`）。其他组件一律自闭合 `/>`。


<!-- /region -->
