# 调研来源

（2026-10-22 初稿）"可达"是本环境 2026-10-22 用 curl 实测的 HTTP 状态：200 能抓；403、429 被拦，只能靠搜索摘要或用户提供截图，引用时注明。200 的单页应用（Material 3、Apple HIG 等）curl 只拿到空壳，要用 Playwright 渲染后再读。

按教学时刻分组。每组都列了教育产品和"问题同构"的非教育产品。

## 讲述和画面并行（左边讲、右边画）

| 来源 | 看什么 | 可达 |
|---|---|---|
| 高斯（gauthmath.com） | 讲述流加板书、逐步加注不翻页、章节名放在左栏 | 403，只能靠用户截图 |
| Khan Academy | 视频讲解和练习怎么衔接 | 200 |
| 3Blue1Brown | 画面怎么跟着讲述一点点长出来 | 200 |
| Claude、ChatGPT 的对话加画布 | 左边对话、右边成品，选中画布内容后在对话里追问 | claude.ai 403；用自己的使用经验和截图 |
| Notion AI | 侧栏对话和正文的关系 | 200 |

## 停点：预测、读图、判断

| 来源 | 看什么 | 可达 |
|---|---|---|
| Brilliant（brilliant.org、blog.brilliant.org） | 题目和选项的位置、"Why?" 折叠、直接操作画面作答 | 200（课程内页要登录） |
| Duolingo（含博客） | 高密度停点下的节奏；手机上贴底的检查和反馈条 | 200 |
| Desmos 学生端（student.desmos.com） | 一屏一问、拖动图像作答 | 200 |
| PhET | 仿真里的操作和提问怎么配合 | 200，仿真是 HTML5，可以用 Playwright 操作 |
| Kahoot、Pear Deck | 课堂上全班同时作答 | Kahoot 200、Pear Deck 200、Nearpod 403 |

## 反馈与提示

| 来源 | 看什么 | 可达 |
|---|---|---|
| Duolingo | 对、错的反馈条，错了怎么不打断节奏 | 200 |
| Brilliant | 分级提示、解释的展开方式 | 200 |
| Khan Academy | 提示一步一步给 | 200 |

## 证据：画面、表格、演算

| 来源 | 看什么 | 可达 |
|---|---|---|
| Explorable Explanations（explorabl.es、ncase.me） | 可操作的图解，参数一改画面就变 | 200 |
| Bret Victor《Up and Down the Ladder of Abstraction》（worrydream.com） | 从具体到抽象，同一画面切换视角 | 200 |
| Distill（distill.pub） | 图文严格对齐、行内可交互的图 | 200 |
| The Pudding（pudding.cool） | 滚动叙事：文字推进，图跟着变 | 200 |
| Observable | 数据画面和文字在同一处 | 429，被限流 |
| GeoGebra | 二维、三维几何的交互和视角切换 | 200 |

## 结论沉淀、导航和回看

| 来源 | 看什么 | 可达 |
|---|---|---|
| YouTube 章节 | 进度条上的章节刻度、悬停预览 | 200 |
| Duolingo 学习路径 | 学过的内容怎么沉淀成路径 | 200 |
| Readwise | 划线、回顾：学过的结论怎么再次出现 | 200 |
| Apple 图书、Kindle | 阅读器的进度、目录、隐藏式导航 | 用截图 |

## 练习、小测

| 来源 | 看什么 | 可达 |
|---|---|---|
| 高斯练习页 | 题干当标题、直接点画面作答、检查按钮放板底 | 403，靠截图 |
| LeetCode | 左题右作答的布局 | 403 |
| 作业帮、猿辅导 | 国内学生熟悉的做题界面 | 200（首页；产品要在应用里看） |

## 设计规范和方法

| 来源 | 用途 | 可达 |
|---|---|---|
| WCAG 2.2 快速参考（w3.org/WAI/WCAG22/quickref） | 对比度、点按目标、减少动效 | 200 |
| Apple HIG | 手机点按目标 44pt、排版、动效 | 200，要渲染 |
| Material 3（m3.material.io） | 布局栅格、底部操作条 | 200，要渲染 |
| Nielsen Norman Group（nngroup.com） | 可用性启发式、眼动研究、测试方法 | 200 |
| Laws of UX（lawsofux.com） | Fitts、Hick、邻近等定律的出处，要回到原文 | 200 |
| Luke Wroblewski（lukew.com） | 手机表单和操作条 | 200 |
| Smashing Magazine、UXmatters | 实践文章，只当线索 | 200 |
| Refero（refero.design，MCP：`mcp__refero__*`） | 策展截图和流程，只当线索 | 200；MCP 可能要用户授权 |
| Mobbin | 策展截图，只当线索 | 200（要登录） |
| growth.design 案例 | 漫画式的产品拆解，只当线索 | 200 |
| 应用商店评论（apps.apple.com） | 用户原声 | 200 |
| Reddit | 用户原声 | 403 |

## 学习科学原典（专著和论文，引用时写作者、年份、结论）

- Mayer《Multimedia Learning》：空间邻近、时间邻近、信号、分段、去冗余等原则。"选项放哪"直接对应空间邻近原则。
- Clark & Mayer《e-Learning and the Science of Instruction》：上面这些原则在课件里的做法。
- Sweller 等：认知负荷理论，样例效应。
- White & Gunstone：预测—观察—解释（POE），对应我们的"先锁定预测"。
- Mazur《Peer Instruction》：课堂概念题和投票。
- Roediger & Karpicke（2006）：提取练习，对应结论链的"回忆时遮住关键词"。
- 查原文：scholar.archive.org（200）；PER 相关的见 `plans/research-sources.md`。
