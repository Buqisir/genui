# 三维之前：把课件系统改造成 agent 友好

## 目标

这套系统以后的使用者是 agent，也可能是只能通过 API 调用的模型（如 DeepSeek API，没有文件系统和命令行）。所以：

- 文档渐进式披露：入口短，细节按需取。
- 自查工具：模型能自己查文档、自己校验、自己发现排版问题。
- 三种接法共用一个核心：给编码 agent 的命令行（按标准 Agent Skill 打包），给 API 模型的函数调用（tool schema），以及不支持工具时的单轮模式。

## 现状（2026-10-11）

- `app/scripts/generate.ts` 每题把整份 `syntax-spec.md`（123 KB）加两份示例课件（11 KB）塞进一条提示，单轮，禁止工具。Grok 一次最多接收约 98 KB，现在拆成两条消息绕过去。
- 路线选择规则（第六节）约 1600 字，占规范 1%；`<Motion>` 约 2.3 万字，沙箱代码约 2.9 万字。最关键的规则埋得最深。
- 广东 75 题盲测：52 题用 `<Sim>` 手画，预制组件用得少；画面错误主要出在模型手摆的几何上。
- 平均每题 22 分钟、0.21 美元，输入约 34k token，输出 12 万到 15 万 token。

## 设计

### 三层文档

| 层 | 内容 | 大小 | 什么时候读 |
|---|---|---|---|
| L0 入口 | 系统是什么、文件骨架、硬规则、选型路由表（情景 → 组件 → 组件卡）、工作流（读题 → 选组件 → 查卡 → 写 → 校验 → 看排版报告 → 改） | ≤ 8 KB | 每题必读 |
| L1 组件卡 | 每个组件一份：用途、何时用和何时不用、最小例子、属性表、常见错误（来自评测和验收的真实错误） | 每份 2–6 KB | 选定组件后 |
| L2 深入参考 | 物理模型细节、边界情况、长例子 | 不限 | 遇到问题时 |

每份文档有稳定的 id，三种接法都按 id 取。组件属性只在代码里定义一次，校验器和组件卡的属性表都从它生成。

### 工具（同一个核心，三种接法）

| 能力 | 命令行 | API 函数 |
|---|---|---|
| 取文档、搜文档 | `genui docs <id>`、`genui docs --search <词>` | `get_doc(id)`、`search_docs(query)` |
| 校验 | `genui validate <课件>` | `validate(lesson)` |
| 排版检查 | `genui layout <课件>` | `check_layout(lesson)` |
| 截图（给能看图的模型） | `genui shot <课件>` | `render(lesson)`，可选 |

- 每条校验错误都写明去读哪份文档的哪一节，由错误把相关文档引出来。
- 排版检查输出文字报告（哪个标注压住了哪条线、坐标在哪），不依赖模型看图。
- 单轮模式：先用一次便宜的调用读题选组件，再把 L0 加选中的组件卡拼进提示；也能拼回完整规范。

## 阶段

| 阶段 | 做什么 | 验收 |
|---|---|---|
| 0 浙江基线 | 选约 35 道浙江题（侧重用到新组件的题，留少量对照题），转写题面和答案键；用现在的单轮全文模式跑一轮 | 题面经页图逐题核对；基线报告：校验通过率、答案正确率、新组件使用率、画面问题 |
| 1 运行时构建 | 沙箱运行时由构建步骤打包 TS 模块生成，删掉手抄副本 | 300 测试、tsc、广东题库校验、全部演示 QA 不变 |
| 2 渐进式文档 | 拆出 L0、L1、L2，写路由表，组件卡写进真实常见错误，属性定义单一来源 | 每张卡都有能通过校验的最小例子；拼回的完整规范与现行规范等价 |
| 3 工具链 | docs、validate（带文档指引）、layout、shot；命令行、API 函数定义、单轮拼装三种接法；生成脚本加 agent 模式 | 用 Grok 和 DeepSeek 各跑通几道题 |

DeepSeek 接法（2026-10-11 与用户约定）：OpenAI 兼容接口 `https://api.deepseek.com`，模型 `deepseek-flash`（V4.1 Flash），`thinking: {type: "enabled"}`，`reasoning_effort: "high"`；不用 `deepseek-v4-pro`（用户实测不如 Flash）。key 放在 `~/.genui/deepseek.env`（`DEEPSEEK_API_KEY=…`，权限 600），脚本运行时读取，不进代码、日志和报告。
| 4 对照复测 | 同一批浙江题加广东回归抽样，DeepSeek agent 模式对比 Grok 全文单轮基线 | 通过率、正确率、预制组件使用率、画面问题数、token、时间、费用 |

### 阶段 1 验收（2026-10-11）

- 做法：`src/sim/sharedEntry.ts` 汇集共享模块（magnetics、apparatus、`lesson/instrumentHook.ts`、`lesson/lightcolor.ts`、waves、vesselgeom），`src/sim/buildRuntime.ts` 用 `esbuild.buildSync` 在内存里打成 IIFE 前奏挂到 `__genuiShared`，再拼上 runtime.js 主体（仍是经典脚本）。node 侧都调 `buildRuntime()`；浏览器侧走 Vite 虚拟模块 `virtual:sandbox-runtime`，并 watch 全部输入。esbuild 写进 devDependencies。
- runtime.js 6627 → 6075 行，约 30 个手抄函数删掉；字符串比对测试换成 `src/sim/runtimeGlobals.test.ts`（旧版 26 个顶层全局名字都在，前奏与 TS 版结果一致）。
- 改前 / 改后：tsc 0 / 0；vitest 24 文件 300 测试 / 25 文件 301 测试；广东题库 74/75（失败的同一题）/ 同；lessons 校验输出逐字相同；15 个演示 QA 全过；`vite build` 成功。
- 截图比对 5 张有差异，逐张看过：`_demo-gaokao` 23 号是分子动画截图时刻不同（t = 0.9 s 与 0.8 s），`_demo-circuit-b` 4 张是电流小点的动画相位不同，读数一致；`<Circuit>` 本身不走沙箱运行时。没有回归。
- 工人中途被取消，收尾由我完成：`vite.config.ts` 的 `.ts` 扩展名导致 tsc 报错，已改；开发服务器因配置变更退出，已重启。

### 阶段 2 验收（2026-10-11）

- 结构：`docs/index.md`（L0，5.9 KB：工作流、文件骨架、11 条硬规则、22 行选型路由表），`docs/cards/` 25 张 L1 卡（2.2–7.5 KB），`docs/ref/` 21 份 L2 参考（共 66 KB）。`docs/manifest.yaml` 列出 51 个规范原文区域的顺序。`docs/README.md` 写了编辑规则。
- 规范的源改为 `docs/`，`syntax-spec.md` 由 `cd app && npx tsx scripts/docs.ts build` 生成，`check` 检查是否过期。切分后拼回与切分前逐字节相同（123075 字节，原文存 `plans/.spec-v0.2-presplit.md`）；之后按验收发现改了原文 3 处：`question` 必填、`<Figure>` 也有内容体、`<Plot>` `areas[].series` / `to` 是序号。`generate.ts` 照旧读 `syntax-spec.md`。
- 属性单一来源：`COMPONENTS` 从 `validate.ts` 移到 `src/lesson/components.ts`，每个属性加 `doc`；卡片属性表由它生成。移动前后 `lessons/` 校验输出逐字相同。
- 每张卡有「何时用」（含不该用时去哪张卡、该读哪份 L2）、最小例子、常见错误。常见错误取自浙江基线（zj-02 `gEff` 重名和 `hud.color`，zj-04 `locate`，zj-08 `areas.series`，zj-10 电桥，zj-22 重复声明，zj-27 单刀双掷，zj-28 未闭合，zj-30 NaN）、广东失败报告和图审，其余取自校验器的报错。
- 测试 `src/docs/docs.test.ts`：拼回一致、属性表不过期、每个组件有卡、卡 ≤ 7500 字节、`related` 存在、**每张卡的最小例子 0 错误 0 提醒**、每张卡都在 L0 出现、每份 L2 都能从某张卡找到（`planned` 除外）。
- 检查：docs check 通过；tsc 0；vitest 26 文件 312 测试通过；15 个演示 QA 全过。
- 留给阶段 3：
  - 校验器对 `<Motion>` `events` 里从未发生的名字不提醒。
  - 「`Ng` 沿运动方向」这条报错也会因为引用正在求解的摩擦而触发，提示应说明这种原因。
  - `<Optics>` 不算情景组件，只写它会报「没有画出物理情景」。卡里已写明，错误信息应指向 `optics` 卡。
  - 规范正文漏写的属性（`Motion.label`、`Define.label/unit`、`Optics.length/maxHits`、`Figure` 的 `hud/legend/note` 等）已出现在生成的属性表里，正文可再补。
  - `motion` 卡 7465 字节，贴近上限，再加内容要先往 L2 挪。

### 阶段 3 验收（2026-10-11）

- 核心库 `app/src/agent/`：
  - `core.ts`：`getDoc`、`searchDocs`、`validateLesson`。每条校验问题带文档 id，规则表是 `DOC_POINTERS`。题库中 67 条不同消息全部有指针：L1 51 条、L2 16 条、兜底 0 条。
  - `layout.ts`：排版检查。运行时的诊断钩子默认关闭，覆盖标签压物体、标签互压、画到画布外、锚点在画布外。15 个演示共报 8 条。
  - `render.ts`：截图用私有 Vite 加 Playwright，靠 `window.__GENUI_PREVIEW__` 注入，不写 `lessons/`，约 3.5 s。
  - `tools.ts`：OpenAI 格式的函数定义和 `runTool`。
  - `deepseek.ts`：客户端、计价和 agent 循环。按文档要求回传 `reasoning_content`；key 只从环境变量或 `~/.genui/deepseek.env` 读，日志里打码。
  - `prompt.ts`：单轮拼装。选卡调用同时从 L2 目录选深入参考，最多 4 份，点名的一定放进提示。
- 三种接法：
  - 命令行 `bin/genui`，提供 docs、validate、layout、shot 四个子命令，任意目录可跑，并打包成 Agent Skill `skills/genui/SKILL.md`。
  - API 函数调用：`generate.ts --engine deepseek --mode agent`。
  - 单轮：`--mode single`。
  - Grok 也支持 `--mode agent`，让它自己调用命令行。
  - `full` 模式的提示词不变。
- 检查：tsc 0；vitest 31 文件 338 测试；docs check 通过；15 个演示 QA 全过。
- 跑题结果（浙江题，DeepSeek 用 `deepseek-flash` + thinking + high）：

| 接法 | 题 | 首次通过校验 | 自动答案键 | 人工项 | 用上对应新组件 | 排版问题 | 每题用时 | 每题费用 |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| DeepSeek agent | zj-02 03 04 06 08 10 23 28 | 8/8 | 7/7 | 5/6（zj-23(3) 选 A，应为 C） | 7/7 | 0 | 9–23 分钟 | $0.07 |
| DeepSeek 单轮（旧选卡） | zj-02 04 06 08 10 28 | 6/6 | 5/5 | 4/4 | 0/5 | — | 1–6 分钟 | $0.02 |
| DeepSeek 单轮（新选卡） | 同上 | 2/6，重试后 6/6 | 5/5 | 4/4 | 1/5 | — | 1–14 分钟 | $0.04 |
| Grok agent | zj-01 06 10 | 3/3 | 2/2 | 3/3 | 2/2 | — | 21–27 分钟 | $1.43 |
| 对照：Grok 全文单轮基线 | 同 DeepSeek agent 的 8 题 | — | 全对 | 全对 | 5/7 | — | 约 22 分钟 | 约 $0.21 |

- 注意：这几批没加 `--blind`（基线加了），答案不对时，重试会收到核对提示。
  - agent 批次全部第一次提交就过，所以不受影响。
  - 单轮新选卡那批的 zj-04、06、28 重试时用到了提示，那一批可比的是"第一次答案正确 2/5"。
- 结论：
  - DeepSeek agent 是目前最好的接法：一次提交就过，组件用得比 Grok 全文单轮基线还多，费用约为它的 1/3。
  - 单轮模式答案也对，但几乎不用新组件，模型更爱用 `<Figure>` 手画。
  - Grok agent 能跑通，但贵（每题 $1.1–1.7），三题里两题用满 60 轮才被截停。
- 转录确认了预期的流程：
  - 先按路由表读卡和深入参考。
  - 写完后自查。
  - 排版报告会引出修改。例如 zj-03 中「O_1 压住 v.track」，模型挪开后重查干净，再提交。
  - 这批题里没有出现"校验报错后按指针读文档"的情形，因为模型都在提交前自查到 0 错误。
- 发现与后续：
  - 单轮首次输出常漏头信息结尾的 `---`、漏 `title`，或把题目原文直接写进 YAML。可以考虑在输出要求里给出头信息模板。
  - 排版检查会把落在大块实心物体（如地球圆盘）上、但仍清楚可读的小标签也报出来，阶段 4 再看是否降级。
  - Grok agent 不再继续（2026-10-11 与用户约定：以后接 API 只接 DeepSeek）。`--engine grok --mode agent` 的代码保留，但不再测试、不再调优。阶段 4 改为 DeepSeek agent 对照已有的 Grok 全文单轮基线（`archive/generated-grok/zj-final`），Grok 不重跑。
  - 转录现在记下 `get_doc` 的 id、`search_docs` 的搜索词和各检查结果的第一行，便于阶段 4 分析。

### 阶段 4 验收：广东盲测抽样（2026-10-11）

范围按用户决定缩小为只跑广东抽样：15 题（实验 2、计算 3、单选 9、多选 1），`--engine deepseek --mode agent --rounds 3 --jobs 4 --blind`，结果在 `archive/generated-deepseek/gd-sample/`（报告 `reports/eval-report.md`）。对照的是 `archive/generated-grok/bank` 里同 15 题的 Grok 全文单轮结果，Grok 不重跑。

| 指标 | DeepSeek agent | Grok 全文单轮 |
|---|---|---|
| 最终校验（用现在的校验器重验） | 15/15，0 错误 0 提醒 | 15/15，0 错误 0 提醒 |
| 首次提交即通过 | 15/15（每题只提交 1 次） | 报告记为 15/15；日志里 gd24-03 首次 5 个错误，后来重跑才过 |
| 答案 | 实际 15/15；自动核对 14/15（gd21-11 误判，见下）；人工项 3/3 | 15/15；人工项 3/3 |
| 排版检查 | 0 个问题 | 5 题共 14 个问题（gd21-11、22-03、22-16、24-13、25-05） |
| 课件长度 | 平均约 210 行 | 平均约 370 行 |
| 预制组件（除参数、答案类） | ForceDiagram 1、Motion 3、Instrument 1、Ledger 1、EnergyLevels 1、Optics 1、Bars 1 | ForceDiagram 8、Motion 4、Dial 3、Ledger 2、Instrument 1、EnergyLevels 1、Circuit 1、GasTube 1、Bars 1 |
| 模型用时合计 | 227 分钟（单题 9–20 分钟） | 315 分钟（单题 13–30 分钟） |
| 费用 | $0.63（单题 $0.02–0.08） | $3.09（单题 $0.13–0.29） |

结论与发现：
- 校验、答案、排版：DeepSeek agent 达到或超过 Grok 基线，费用约为 1/5。排版为 0 是因为 agent 在提交前用了排版检查，Grok 单轮没有这个工具。
- gd21-11 第 (2) 问模型答对了（3 个），但只写在 `<Answer>` 的 `text` 里，没进头信息 `answers`，所以自动核对没找到。已在 `docs/cards/structure.md` 的常见错误里补一条：计数或常数结果也要先 `<Define>` 再写进 `answers`。
- 内容深度变浅：课件长度约为 Grok 的 57%，预制组件明显少用（受力图 1 题对 8 题，没用 Dial、Circuit）。其中一部分是 Grok 滥用（gd22-16 把倒置玻璃瓶套进水平的 GasTube），但也有该用没用的。
- 抽查 3 对截图（gd22-04、24-08、22-16，在 `archive/generated-deepseek/gd-sample/shots/`）：
  - gd22-04：两边都对，Grok 画得更细（线圈画成线匝、电流流动点、ω 箭头）。
  - gd24-08：DeepSeek 画面和原图不符。原图是圆盘在容器底部、棒从上方插入、M 和 N 在同一条电场线上；DeepSeek 没画底部圆盘，N 点画到了容器外，电场线也和电极无关。答案仍然对，但图错了。Grok 的电场线和等势面都对。
  - gd22-16：DeepSeek 的倒置瓶比 Grok 的 GasTube 更贴近原图。
- 现有检查（校验、答案、排版）都查不出「画面和原图几何不符」，这是下一步最值得补的地方。可以考虑：在 agent 的自查清单里加一步，逐条对照题目【图】描述里的位置关系（谁在上、谁在哪条线上、点在容器内外）；如果以后换成能看图的模型，再把截图工具接进 agent。
- 顺带修复：`bin/genui shot` 从仓库根目录调用时，私有 Vite 服务器以当前目录为根，页面 404。`app/src/agent/render.ts` 已固定 `root`，超时时也会带出页面报错。这次评测只用了排版检查，不受影响。

### 方向调整（2026-10-11 与用户约定）

先做导题：把题目导入成 `problems/` 格式，可视化由我们自己用 Codex（Sol 6.1）通过 `bin/genui` 和 `skills/genui/SKILL.md` 来做，不接 API。DeepSeek 相关代码保留，暂不继续调优。

阶段 0 的转写和阶段 1 可以并行；基线生成要等阶段 1 验收后再跑，保证基线用的是最终运行时。之后再做三维：核心层加 A 族试点，文档按组件卡加，路由表加一行。

—— Droid 整理（2026-10-11）
