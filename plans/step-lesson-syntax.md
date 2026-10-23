# 分步课的写法：三个方案（2026-10-23 用户定：方案 A）

`plans/direction.md` 第三节说，分步课要"幕 → 步 → 句"一层套一层，里面还要放选择题、演算、定义卡、结论链；可库的硬规则 1 规定"只有 `<Sim>` 和 `<Figure>` 有内容体，其他组件一律自闭合"。本稿用第 4 节同一步（#a5s1 例题：重的撞轻的）把三种写法都写出来，选定后再出组件清单和属性表。

## 原型里这一步是什么样

- 讲述 4 句：①先看例题；②策略：用哪两条规律（停点，选择题）；③解答（演算两行出现，动画开播）；④讨论（核对动量、动能，画面出柱子）。
- 板：题干卡（"情境 · 自编"）、画面（两滑块碰撞）、策略选择题、演算。
- 画面随句子变：第 3 句才开播，第 4 句才出柱子。

## 方案 A：分隔标记（推荐）

沿用库里 `<Segment>` 的做法：`<Act>`、`<Step>` 是自闭合的分隔标记，到下一个标记之前的内容都归它。硬规则 1 不用改。

```lesson
<Act title="练习" />

<Step title="例题：重的撞轻的" />

<Stem label="情境 · 自编" text="光滑水平面上，3 kg 的滑块 A 以 4 m/s 与静止的 1 kg 滑块 B 发生弹性正碰。求碰后两滑块的速度。" />

<Sim title="碰撞" params={["beat"]}>
sim({ … 读 p.beat：beat ≥ 2 开播，beat ≥ 3 画柱子 … })
</Sim>

先看一道完整的例题，题目在右边。

策略：要用哪两条规律？为什么？

<Choice options={[
  { text: "动量守恒，加上总动能不变：两个未知数，要两个方程", correct: true, say: "对。弹性碰撞两条都成立，正好解出两个速度。" },
  { text: "只用动量守恒就够了", say: "动量守恒只有一个方程，解不出 v₁′、v₂′ 两个未知数。" },
  { text: "动量守恒，加上 A 的动能不变", say: "弹性碰撞守恒的是总动能，A 的动能会变：它把一部分给了 B。" }
]} hints={["未知的有几个？", "v₁′、v₂′ 两个，要两个方程。", "弹性碰撞：动量守恒，总动能不变。"]} />

解答：取 A 原来的运动方向为正，直接代弹性碰撞的公式。

<Work lines={[
  { eq: "v_1′ = (3 − 1)/(3 + 1) × 4 = 2 m/s" },
  { eq: "v_2′ = 2 × 3/(3 + 1) × 4 = 6 m/s" }
]} />

讨论：核对一下，动量 12 = 6 + 6，动能 24 J = 6 J + 18 J，两条都守住了。
```

三条规矩，写课的人只要记这些：

1. **一段正文 = 讲述栏的一句。** 板上的字一律用组件写（题干、选项、演算、定义卡）。
2. **写在第几句后面，就从第几句起出现在板上。** 写在第一句之前的（题干、画面）一进这一步就在。原型里的 `onBeat` / `hidden` 判断都不用写了。
3. **能作答的组件就是停点。** `<Choice>`、`<Fill>` 后面的那一句要等答对（或锁定预测）才能往下讲，原型里的 `gateAt` 不用写了。

画面怎么随句子变：一步里的 `<Sim>` / `<Figure>` 自动多一个只读参数 `beat`（当前第几句，从 0 数），写进 `params` 就能用。

**好处**：不改硬规则，和 `<Segment>` 同一套解析；顺序就是时间，看文本就知道第几句出现什么；补丁（`<!-- patch -->`）照样能按块改。
**代价**：层级靠顺序隐含，写错位置不报语法错，只能靠校验（如"停点后面必须还有一句"）。

## 方案 B：真嵌套

`<Step>…</Step>` 成对写，里面再套组件，句子写成 `<Say>`。

```lesson
<Act title="练习">

<Step title="例题：重的撞轻的">

<Stem label="情境 · 自编" text="…" />

<Sim …>…</Sim>

<Say>先看一道完整的例题，题目在右边。</Say>

<Say gate>策略：要用哪两条规律？为什么？
  <Choice options={[…]} hints={[…]} />
</Say>

<Say>解答：……
  <Work lines={[…]} />
</Say>

<Say>讨论：……</Say>

</Step>

</Act>
```

**好处**：层级一眼看清，每句挂了什么写在它里面。
**代价**：要改硬规则 1 和解析器；模型生成长文时漏写、错配闭合标签是常见错误，一节课 30 多步、四层嵌套，出错面大；补丁也要改成认得嵌套。

## 方案 C：一步一个组件，内容全写在属性里

```lesson
<Step act="练习" title="例题：重的撞轻的"
  stem={{ label: "情境 · 自编", text: "…" }}
  beats={[
    { say: "先看一道完整的例题，题目在右边。" },
    { say: "策略：要用哪两条规律？为什么？", choice: { options: […], hints: […] } },
    { say: "解答：……", work: [ "v_1′ = …", "v_2′ = …" ] },
    { say: "讨论：……" }
  ]} />
```

**好处**：不改语法，校验最好写（一个组件一份 JSON）。
**代价**：一步就是一大坨 JSON5，老师和模型都难读难改；画面 `<Sim>` 放不进属性，只能另写再用名字引用；每句的文字都埋在引号里，改一个字容易破坏括号。

## 对比

| | A 分隔标记 | B 真嵌套 | C 全写属性 |
|---|---|---|---|
| 改硬规则 1 | 不改 | 要改 | 不改 |
| 解析器 | 复用 `<Segment>` 的分段 | 新写嵌套解析 | 不变 |
| 读起来 | 像教案：一段一句 | 层级清楚但标签多 | 一坨 JSON |
| 模型写错的风险 | 位置写错（校验能查） | 闭合标签错配 | 括号、引号错 |
| 画面随句子变 | `beat` 参数 | `beat` 参数 | 要另想 |
| 补丁 | 照旧按块 | 要改 | 整步重写 |

推荐 A。**2026-10-23 用户确认采用方案 A**，下面的组件清单和属性表都按 A 写。

## 方案 A 再写两步，看难的情况

**#a6s1 补全结论（填空）**：空格写在文字里，`{答案|干扰1|干扰2}`。

```lesson
<Step title="补全结论区" />

结论区里有几处关键词被盖住了。不往回翻，你能补全吗？

<Fill rows={[
  { name: "弹性", text: "碰撞前后 {总动能|每个物体的动能|每个物体的速度} 不变；一样重时交换速度" },
  { name: "非弹性", text: "总动能减少，碰后可以分开" },
  { name: "完全非弹性", text: "碰后粘在一起，动能减少 {最多|全部|最少}，一般不是全部" },
  { name: "三种都", text: "动量守恒" }
]} />

补全了。判断碰撞类型看总动能：不变是弹性，减少是非弹性，粘在一起减少最多。三种碰撞，动量都守恒。
```

第一项是答案，其余是干扰项；每项各自的反馈写在 `say` 属性里（这里省略）。

**#a1s1 预测锁定**：`<Choice predict>` 选了就锁定、不判对错；之后用 `<Recall>` 回看学生选的那项（v0.2 定，见下文第三节）。

## 选定后接着要定的

1. 组件清单和属性表：`Act`、`Step`、`Stem`、`Choice`（含 `predict`）、`Work`（含分块）、`Def`、`Fill`、`Conclude`（结论链条目）、`Lab`（实验门）、`Quiz`、`Homework`，以及 `Step` 上的可选 `frame`。
2. 一份课件里出现 `<Act>` 时整页切成分步课；不写的课件版面不变（同 `<Segment>`）。
3. 第 4 节逐步迁移对照表。

---

# 组件清单与属性表（v0.2，2026-10-23，用户定）

以下按方案 A 写。v0.2 = v0.1 + 迁移第 4 节时发现的 10 处修改（`plans/collision-migration.md` 第二节 A–J），本节已经全部并入，以本节为准。代码现状的依据：`app/src/lesson/parse.ts`、`app/src/components/LessonView.tsx` 的 `splitSegments`、`app/src/lesson/store.tsx`、`app/src/lesson/validate.ts`（行号见第六节）。

属性类型沿用 `components.ts` 的 `PropKind`（string、number、boolean、expr、array、object、name、names）。下表写"枚举"的，在 `components.ts` 里是 `string`，取值由 `validate.ts` 检查。

## 一、整页怎么切

1. 课件里出现 `<Act>` 就整页换成分步课版面（同 `<Segment>` 的开关做法：`blocks.some(Act)`）。不写 `<Act>` 的课件一切照旧。
2. `<Act>` 和 `<Segment>` 不能出现在同一份课件里（校验报 `mixed-structure`）。
3. 第一个 `<Act>` 之前的内容是开场：参数声明、共用的 `<Define>`，以及开场白（显示在第一步之前的封面页）。
4. 一个 `<Act>` 到下一个 `<Act>` 之前是一幕；一个 `<Step>` 到下一个 `<Step>` 或 `<Act>` 之前是一步。`<Act>` 后面必须紧跟 `<Step>`（中间只能是空行），否则报 `act-without-step`。

## 二、一步里面

| 规矩 | 说明 |
|---|---|
| 句 | 步里的正文按空行拆，每段一句。现在解析器把连续正文合成一个 markdown 块，播放器在步内按空行再拆。一句 ≤ 60 字（警告 `sentence-too-long`）。 |
| 出现时间 | 组件写在第 k 句（从 0 数）后面，就从第 k 句起出现在板上；写在第一句之前的从第 0 句起就在。 |
| 停点 | `<Choice>`、`<Fill>`、`<Lab>`（不带 `filled`）是停点：讲到它所在的那一句就停，要先答对、锁定预测或做满实验才能往下讲。停点可以在一步的最后一句（v0.1 的 `stop-at-end` 已删）：答完说完反馈，按钮变"继续"进下一步。 |
| 反馈 | 选项的 `say` 在讲述栏作为当前句说出来，板上只变状态（板面规格总规矩 7）。`say` 可以是字符串数组，按句说，每句 ≤ 60 字。 |
| 回看 | `<Recall choice="名字" />` 单独成段，占一句，见第三节。 |
| 画面跟句子 | 课件开场声明 `<Param name="beat" hidden value={0} />`，播放器把当前句号写进它，`<Sim>` / `<Figure>` 的 `params` 里写上 `beat` 就能读，`<Collision>` 的 expr 属性也能读。做法和 `<Segment revealParam>` 一样：参数系统不用改。进入每一步时归 0。 |
| 开播 | `<Step play={k}>`：这一步的 `<Sim>` / `<Collision>` 停在 t = 0，讲到第 k 句才从头播一次；不写 `play` 时进入就播。 |
| 多张定义卡 | 同一步里的多个 `<Def>` 接成一张卡，后写的行从它所在的那一句起出现。 |

## 三、组件

全是新组件，属性必填与否按 CLAUDE.md 的兼容规则：新组件自己的属性可以必填。

### `<Act />` 幕
| 属性 | 类型 | 必填 | 说明 |
|---|---|---|---|
| title | string | 是 | 幕名，幕标签显示成"第 N 幕 · 幕名"，N 自动数 |
| quiz | boolean |  | 小测幕：本幕里每个 `<Choice>` 的第一次作答计入成绩；步标题自动加"小测 N / M：" |

### `<Step />` 步
| 属性 | 类型 | 必填 | 说明 |
|---|---|---|---|
| title | string | 是 | 步标题，≤ 18 字（小测幕的"小测 N / M："前缀不计） |
| play | number |  | 第几句开播（见上） |
| frame | 枚举 |  | 强制版式：`result grid fill example quiz lab derive def pic`；不写时按板面规格 3.3 自动判定 |

### `<Stem />` 题干卡
| 属性 | 类型 | 必填 | 说明 |
|---|---|---|---|
| text | string | 是 | 题干，已知条件 |
| ask | string |  | 问句，接在题干最后，600 字重（G7）；≤ 40 字 |
| label | string |  | 小标题，如"情境" |

校验：小测幕里、或同一步有 `<Choice>` 的 `<Stem>` 没写 `ask` 时警告 `stem-without-ask`。

### `<Choice />` 选择题（停点）
| 属性 | 类型 | 必填 | 说明 |
|---|---|---|---|
| options | array | 是 | 2–4 项，每项 `{ text, correct?, say, check? }`；`text` ≤ 24 字；`say` 是选了这一项时讲述栏说的话（字符串或字符串数组）；`check` 只给预测题用，见 `<Recall>` |
| ask | string |  | 没有 `<Stem>` 的步里，选项上方的问句 |
| hints | array |  | 三级提示（不写就没有"提示"按钮；写了必须正好 3 条） |
| predict | boolean |  | 预测题：选了就锁定，不判对错 |
| name | string |  | 给 `<Recall>` 引用；全课不能重名 |
| label | string |  | 例题里的小节名，如"策略" |

规则：非预测题正好一个 `correct`；预测题最多一个 `correct`（表示实测结果是这一项，锁定时不揭晓，到 `<Recall>` 才说）。交互照板面规格 G5、G6（先选后提交、提交后 400ms 防连点）。

### `<Recall />` 回看预测（新，v0.2）
| 属性 | 类型 | 必填 | 说明 |
|---|---|---|---|
| choice | string | 是 | 引用的 `<Choice name>`，必须是预测题，写在它之后（可以在后面的步里） |

单独成段，占一句。讲述栏说：选中项就是 `correct` → "你猜的是「text」，猜对了。"；否则 → "你猜的是「text」。"；再接这一项的 `check`。学生没选（跳步跳过了）→ 只说 `correct` 那项的 `check`。被引用的预测题每项都要有 `check`（`recall-needs-check`），`check` ≤ 45 字。

### `<Work />` 演算
| 属性 | 类型 | 必填 | 说明 |
|---|---|---|---|
| lines | array |  | ≤ 3 行的算式列，每行 `{ eq, note? }`，从所在那句起一句出一行 |
| blocks | array |  | ≥ 4 行的推导分块，每块 `{ title, lines, note? }`，一屏 ≤ 4 块，最后一块是结论框；从所在那句起一句出一块 |
| label | string |  | 例题里的小节名，如"解答" |

`lines` 和 `blocks` 二选一，必须有一个；`lines` 超过 3 行报 `work-needs-blocks`。

### `<Def />` 定义卡、总结
| 属性 | 类型 | 必填 | 说明 |
|---|---|---|---|
| rows | array | 是 | 每行 `{ name, text, note? }` |
| follow | boolean |  | 跟读：一开始全部排好、未讲到的行灰着，从它出现的那句起每讲一句亮一行 |

### `<Fill />` 补全（停点）
| 属性 | 类型 | 必填 | 说明 |
|---|---|---|---|
| rows | array | 是 | 同 `<Def>`；`text` 里的空格写成 `{答案|干扰1|干扰2}`，第一项是答案（显示时打乱） |
| say | array |  | 每个空一组反馈，和选项一一对应：`[["对……", "……", "……"], …]` |
| hints | array |  | 每个空一组三级提示：`[["…", "…", "…"], …]` |
| mask | array |  | 结论链条目的 `title` 列表：这些条目到这个 `<Fill>` 全部答完前盖住 |

一次只问一个空；答对后卡里填上，选项收成一行。

### `<Lab />` 实验（停点；带 `filled` 时不是）
| 属性 | 类型 | 必填 | 说明 |
|---|---|---|---|
| runs | array | 是 | 实验条件，每项 `{ label, set }`，`set` 是要设的参数（同 `<Preset>`） |
| columns | array | 是 | 数据表的列（条件名那一列自动加在最前），每列 `{ label, expr, digits? }`，按当时参数求值 |
| need | number |  | 要做满几种不同条件才放行，默认 = `runs` 的个数 |
| first | array |  | 固定的首行，如 `["碰前", "0.240", "0.072", "100%"]`，个数 = 列数 + 1 |
| filled | boolean |  | 表一开始就按 `runs` 全部算好填满；不出条件按钮，不是停点 |

点一个条件 → 设参数 → `<Sim>` / `<Collision>` 从头播 → 记一行。

### `<Collision />` 碰撞画面（新，v0.2）
一维两体碰撞：导轨（或台面）、两车（或两球）、速度箭头；下面动量、动能两组柱子（A、B、和，虚线是碰前的和）。画法照原型 `mockups/collision/draw.js` 的 `COL.scene`，颜色只取调色板。

| 属性 | 类型 | 必填 | 说明 |
|---|---|---|---|
| m | array | 是 | 两个质量（kg），每项 number 或 expr |
| v | array | 是 | 碰前两个速度（m/s，向右为正），每项 number 或 expr |
| after | array |  | 碰后两个速度，每项 number 或 expr；不写 `still` 时必填（`collision-needs-after`） |
| surface | string 或 expr |  | 碰撞面：`magnet` 磁体、`rubber` 橡皮、`velcro` 粘扣；写 expr 时取值 0 / 1 / 2 依次对应。默认 `magnet`；`velcro` 碰后两车画成一体 |
| body | 枚举 |  | `cart` 小车（默认）、`ball` 小球 |
| names | array |  | 两个物体的名字，默认 `["A", "B"]` |
| massText | array |  | 质量标注，默认按 `m` 写"0.4 kg"；题目只说"质量都是 m"时写 `["m", "m"]` |
| label | string |  | 左上角说明；不写且写了 `surface` 时自动写"碰撞面：橡皮，碰后弹开" |
| bars | boolean 或 expr |  | 画不画柱子，默认 true；如 `"beat >= 3"` |
| digits | object |  | 小数位 `{ v, p, k }`，默认 `{ v: 2, p: 3, k: 3 }` |
| still | boolean |  | 只画碰前一帧，不播（小测的碰前示意图） |
| height | number |  | 画布高度（像素） |

在普通课件（没有 `<Act>`）里和 `<Sim>` 一样带播放条。

### `<Conclude />` 结论链条目
| 属性 | 类型 | 必填 | 说明 |
|---|---|---|---|
| title | string | 是 | 链上的短标题，全课不重名 |
| text | string | 是 | 浮层里的正文 |
| under | string |  | 挂在哪一条下面（写那一条的 title）；可以指向后出现的条目，那一条出现前先挂在根上 |
| guess | boolean |  | 这是猜想，之后由另一条用 `settles` 判定 |
| settles | string |  | 判定或收编哪一条（写它的 title） |
| result | 枚举 |  | `holds`：成立，或被这一条收编，链上那一条改显示这一条的标题和正文；`out`：出局。和 `settles` 一起用 |
| blank | string |  | 被 `<Fill mask>` 盖住时显示的挖空版，空格写 `___`；不写就显示"……" |

写在第几句后面就在第几句加进链里。

### `<Result />` 小测结果
| 属性 | 类型 | 必填 | 说明 |
|---|---|---|---|
| goals | array | 是 | 每个目标 `{ title, items, back }`：`items` 是小测题号（从 1 数），`back` 是答错时"回第 N 幕再看"的幕号 |
| say | object |  | `{ all, some }`：全对和没全对时讲述栏说的话，`{n}`、`{total}` 换成成绩 |

有 `<Result>` 的步可以不写正文。

### `<Homework />` 作业
| 属性 | 类型 | 必填 | 说明 |
|---|---|---|---|
| items | array | 是 | 每题 `{ tag, q, a }`；`tag` 如"必做 1 · L1"；`a` 折叠，点开看 |

## 四、和板面规格的对应

板面规格 3.3 的自动判定，从原型的 CSS 类换成组件：`.score` → `<Result>`，`.hw` → `<Homework>`，`.fill` → `<Fill>`，`.stem` → `<Stem>`，`.run`/`table.dt` → `<Lab>`（含 `filled`），`.bks` → `<Work blocks>`，`.def` → `<Def>`；"有画面" = 这一步有 `<Sim>`、`<Figure>`、`<Collision>` 或其他画布组件。第六节的自动检查挂到对应组件上：标题（Step）、讲述每句（句、`say`、`check`）、问句（Stem.ask、Choice.ask）、选项（Choice）、提示（Choice.hints）、演算（Work）。

原型里的 `button`、`gateAt`、`layout: 'answer'`、`tall`、`onBeat`、`boardMask` 都不进库：按钮字由外壳定，停点由组件位置定，版式自动判定，遮罩由 `<Fill mask>` 定。

## 五、这一版先不做的

- 补丁按"整步"替换：现在补丁只按块定位，`<Step>` 会被索引成 `Step:标题`，只能替换那一行；整步替换以后再加。

（v0.1 这里的"预测之后按选项说不同的话"已由 `<Recall>` 解决。）

## 六、进库要改的地方（据调研）

- 新组件：`app/src/lesson/components.ts` 的 `COMPONENTS` 加定义 → `validate.ts` 的 `checkComponent` 加 case → `LessonView.tsx` 渲染（另起 `StepLesson`，参照 `SegmentedLesson`）→ `docs/cards/` 各一张卡并挂进 `docs/manifest.yaml` → `npx tsx scripts/docs.ts build` → `npm run lock:components` → `npm run prompts:update`。
- 跨块规则（`act-without-step`、`mixed-structure`、`recall-needs-check`、`Recall` 引用存在且在前、`Choice name` / `Conclude title` 不重名、`under` / `settles` / `mask` 引用存在）写在 `validateLesson` 里遍历 `lesson.blocks`；新错误码先加进 `ISSUE_CODES`。
- `beat`：校验时如果 `<Sim>`/`<Figure>`/`<Collision>` 用了 `beat`，要求它是 `hidden` 的 `<Param>`。
