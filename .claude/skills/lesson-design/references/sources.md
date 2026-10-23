# 一手材料分级清单

从 `plans/research-sources.md`（2026-10-21 初稿）迁移，按"一手 / 线索"重新分级，并加上学生作答数据、名师课例、真实实验数据三类。

## 分级

| 级 | 是什么 | 怎么用 |
|---|---|---|
| 一手 | 课标、教材、教参原文；学生作答数据（选项分布、评卷报告的得分率和典型错误、真题）；研究论文原文的方法和数据部分；名师课例的录像或逐字稿；真实实验数据和原典 | 可以作为依据，引用时标"读了原文"或"只读摘要" |
| 线索 | 教学设计汇编、教师指南的提示、博客、AI 总结、转录件、题库、**以及我们自己的设计标准** | 只用来决定去看哪里。教师指南的提示最多说明"有老师这样提醒"，不是研究结论 |

一个站点里可以既有一手也有线索（例如 PhysPort 的选项分布是一手，它写的"教学法研究证据"摘要是线索），表里分开写。

## 本环境能否抓取

- **2026-10-21**：原表的实测结果，沿用，不改。
- **2026-10-23**：本次新加条目的实测，用 WebFetch 测；同时用 curl 复测了几个原表里写"能"的站点，结果与 10-21 不同，一并写在表里。
- 10-23 的结果：除 `github.com` 外，所有测试站点 WebFetch 都返回 `getaddrinfo ENOTFOUND`，curl 经代理返回 `CONNECT tunnel failed, response 403`，代理状态页记为 `connect_rejected`（策略拒绝）。按代理说明不重试、不绕行。所以 10-23 起，这些站点的原文要靠用户下载（见末尾）。原始输出见"实测记录"。
- 表里"未测"表示本次没有测。

## 一、课标、教材、教参原文（一手）

| 来源 | 是什么 | 级 | 能否抓取 |
|---|---|---|---|
| `references/curriculum/standard-2017-2025.md` | 《普通高中物理课程标准（2017 年版 2025 年修订）》全文转写，每页有 `<!-- p.N -->` 页码标记（N 是印刷页码）。主题索引见同目录 `README.md`。引用写主题编号和页码，标"读了原文" | 一手（转写件，页码以印刷页为准；转写错误以纸本为准） | 本地文件 |
| [国家中小学智慧教育平台](https://basic.smartedu.cn/) 教材 | 教材电子版（人教版原文） | 一手 | 10-21：连接被对方断开；教材文件要登录。10-23：未测教材页（同域名已被拒绝，见"课例"） |
| [人民教育出版社](https://www.pep.com.cn/) | 教材与教参信息；教参纸本才是教参原文 | 一手（教参纸本） | 10-21：连不上 |
| [OpenStax](https://openstax.org/)、[osbooks-physics 源文件](https://github.com/openstax/osbooks-physics) | 开放教材原文，可对照定义和例题；例题四段结构的出处 | 一手 | 10-21：openstax.org 能。10-23：WebFetch github.com/openstax/osbooks-physics，能打开，顶层目录 `collections`、`modules`、`media` 等；页面末尾有"You can't perform that action at this time" |
| [MIT OpenCourseWare](https://ocw.mit.edu/) | 大学课程讲义（如 8.01 力学），用来核对物理 | 一手（讲义） | 10-21：能 |
| [Feynman Lectures](https://www.feynmanlectures.caltech.edu/) | 费曼物理学讲义原文 | 一手 | 10-21：403 |
| [enjoyphysics.cn](https://enjoyphysics.cn/) | 上海一所中学物理教研组逐节转录人教版教材正文、练习答案和教参的教学建议（如 https://enjoyphysics.cn/Article2868） | 线索（转录件；查到后去对照纸本） | 10-21：能；引用时注明"据转录，未对照纸本" |
| [刘长灿，课标的内容要求、学业要求、教学提示（人教社）](https://www.pep.com.cn/bks/zxxjcjx/jcb/202504/W020250416504429709676.pdf) | 对课标三部分分工的解读 | 线索（解读，不是课标原文） | 未测 |

## 二、学生作答数据（一手）

| 来源 | 是什么 | 级 | 能否抓取 |
|---|---|---|---|
| [PhysPort 概念测试页](https://www.physport.org/assessments/)（如 [FCI](https://www.physport.org/assessments/assessment.cfm?A=FCI)、[能量与动量概念测试 EMCS](https://www.physport.org/assessments/assessment.cfm?A=EMCS)） | 概念测试题、常见错误选项、各校得分数据、研究论文清单 | 一手（页面上的选项分布和得分数据）；"教学法研究证据"摘要是线索 | 10-21（原表对 PhysPort 站点）：能。10-23：这两个页面 WebFetch `getaddrinfo ENOTFOUND`，curl `CONNECT 403` |
| PhysPort 数据浏览器（各概念测试的逐题选项分布） | 如果可用，是学生作答数据最直接的来源 | 一手 | 未测（同域名 www.physport.org 已被拒绝，估计同样不可达） |
| [College Board AP Central](https://apcentral.collegeboard.org/) 的评卷报告（Chief Reader Report）和评分说明 | 每道题的得分分布和典型错误。collision 规格引过 AP 物理 B 2008 的阅卷报告，原文已下线，只读到搜索摘要 | 一手（得分率和典型错误） | 10-23：apcentral.collegeboard.org WebFetch `getaddrinfo ENOTFOUND`，curl `CONNECT 403` |
| 各省考试院评卷报告和试题分析：[广东省教育考试院](https://www.eea.gd.gov.cn/)、[教育部教育考试院](https://www.neea.edu.cn/)；其他省 | 得分率和典型错误；是否公开发布这类报告未确认 | 一手（若有） | 10-23：eea.gd.gov.cn、neea.edu.cn 都是 WebFetch `ENOTFOUND`，curl `CONNECT 403`；其他省：未测 |
| [中国知网](https://www.cnki.net/) 的评卷分析、试题分析 | 教师和命题组写的评卷分析，常带得分率 | 全文是一手；只有摘要时是线索 | 10-21：一般只能看摘要 |
| 库里 `survey/` 和 `plans/momentum-exam-2021-2025.md` | 2008–2025 高考物理真题。`survey/README.md` 说明结构：全文抽取在 `survey/text/<年份>.txt`（2008–2015、2021–2025 广东卷，2016–2020 新课标Ⅰ卷），各省逐题调研在 `survey/<省>/README.md`，八省汇总在 `survey/national-summary.md`，三维筛题在 `survey/3d/`。动量题统计见 `plans/momentum-exam-2021-2025.md`（"会漏题"，数是下限） | 一手（真题原文和标准解答）。**没有得分率和选项选择率**：能看到题怎么问、标准解答怎么写、选择题的错误选项是哪类错，看不到有多少学生选了 | 本地文件 |
| [Isaac Physics](https://isaacphysics.org/) | 剑桥大学分级物理题库 | 线索（题库，看不到作答数据） | 10-21：跳转到 isaacscience.org 后连接被断开 |

## 三、研究论文原文（一手：看方法和数据部分）

| 来源 | 是什么 | 级 | 能否抓取 |
|---|---|---|---|
| [PER-Central（ComPADRE）](https://www.compadre.org/per/) | 物理教育研究的文献库和会议论文集（PERC，开放获取） | 一手（论文本身）；库本身是检索入口 | 10-21：能。10-23：curl `CONNECT 403`（www.compadre.org） |
| [Physical Review PER](https://journals.aps.org/prper/) | 物理教育研究的开放获取期刊 | 一手 | 10-21：403，经 doi.org 跳转可能也不行。10-23：journals.aps.org curl `CONNECT 403` |
| [arXiv](https://arxiv.org/) | 预印本。collision 规格引的 van Holten 2025（arXiv:2512.22842）曾"原文已核"，那是在别的环境 | 一手 | 10-23：arxiv.org/abs/2512.22842 curl `CONNECT 403` |
| Wiley *Journal of Research in Science Teaching*（如 Bryce & MacMillan 2009，46(7)，https://onlinelibrary.wiley.com/doi/10.1002/tea.20290） | 动量与动能混淆的研究 | 一手 | 10-23：WebFetch `ENOTFOUND`，curl `CONNECT 403`。collision 规格只读到摘要 |
| [马里兰大学物理教育研究组](https://www.physics.umd.edu/perg/) | Redish 等人的研究组，资料偏早 | 一手（经典研究 PDF）；站点本身是线索 | 10-21：能 |
| [CU 科学教育计划（SEI）](https://www.colorado.edu/sei/) | 科罗拉多大学的教学改革项目（Wieman）：课堂提问题库、学习目标的写法 | 线索 | 10-21：能 |
| [STCSE 文献目录（Duit）](https://archive.ipn.uni-kiel.de/stcse/) | 关于学生想法的研究文献总目，数千条 | 线索（查某个错误想法有没有人研究过，再去找原文） | 10-21：服务器连不上（502） |
| [IOP Spark](https://spark.iop.org/) | 英国物理学会的教学资源，含常见错误想法 | 线索（教学建议；错误想法要回到研究原文） | 10-21：网站拦截程序访问（403）。10-23：spark.iop.org curl `CONNECT 403` |

具体篇目（Hestenes 等 1992、Crouch & Mazur 2001 等）多数在"拿不到的原文"里。

## 四、名师课例（一手：录像或逐字稿）

| 来源 | 是什么 | 级 | 能否抓取 |
|---|---|---|---|
| [Mister-Hope/physics-courseware](https://github.com/Mister-Hope/physics-courseware) | 人教版高中物理课件仓库；`courses/` 下每节课有思路、教案、逐字稿。标准读过 1.4（加速度）、2.1（探究小车速度随时间变化的规律）。CC BY-NC-SA 4.0，只借结构和做法 | 一手（逐字稿和教案原文） | 10-23：WebFetch 能；描述"人教版高中物理课件"，顶层目录 `.agents`、`.github`、`.vscode`、`courses`、`e2e`、`patches`、`resources`、`scripts`、`workspace`。curl 取 `raw.githubusercontent.com/.../README.md` 返回 200（8431 字节），curl 取 `github.com` 页面返回 403 |
| [Concord CLUE 课程](https://github.com/concord-consortium/clue-curriculum) | 课程 JSON 与教师版；引入—建构—巩固—收束四段的出处 | 一手（课例源文件） | 10-23：WebFetch 能；描述"A repository for CLUE curriculum unit and teacher guide data"，目录 `curriculum`、`doc`、`scripts`、`.github/workflows` |
| [国家中小学智慧教育平台](https://basic.smartedu.cn/) 的课例 | 部级精品课、同步课堂的录像 | 一手（录像）；需要自己看视频，逐字稿要自己转 | 10-21：连接被对方断开。10-23：basic.smartedu.cn/syncClassroom WebFetch `ENOTFOUND`，curl `CONNECT 403` |
| 国内教学设计实例（如汶锋亮《动量守恒定律》教学设计） | 四栏：环节、教师活动、学生活动、设计意图 | 线索（教学设计文本，不是课堂记录） | 未测 |
| [MIT BLOSSOMS](https://web.mit.edu/blossoms/) | 视频课加教师指南，每段不超过约 5 分钟；指南里有"这里学生容易误解"的提醒 | 视频是一手；教师指南的提醒是线索（说明"有老师这样提醒"） | 10-21：能 |

## 五、真实实验数据和原典（一手）

| 来源 | 是什么 | 级 | 能否抓取 |
|---|---|---|---|
| [ChemTeam 化学史](https://www.chemteam.info/Chem-History/) | 经典论文全文转录，如查德威克 1932 年两篇中子论文（含碰撞实测数据）。引用注明"据转录" | 一手（转录件） | 10-21：能。10-23：www.chemteam.info/Chem-History/Chadwick-neutron-1932.html WebFetch `ENOTFOUND`，curl `CONNECT 403` |
| [Project Gutenberg](https://www.gutenberg.org/) | 原典，如牛顿《原理》Motte 英译本（碰撞附注里有各种球的恢复实测） | 一手 | 10-21：能。10-23：www.gutenberg.org curl `CONNECT 403` |
| [NASA 历史](https://www.nasa.gov/history/) | 航天史料，如 1969 年《纽约时报》更正 | 一手（史料） | 10-21：能 |
| [Open Source Physics Tracker](https://opensourcephysics.github.io/tracker-website/) | 视频分析工具和示例视频；自己拍的视频测出的数据才是我们的真实实验数据 | 工具是线索；示例视频的数据是一手 | 10-23：opensourcephysics.github.io curl `CONNECT 403` |
| 库里第 1 节课件的气垫导轨数据（`mockups/momentum/rounds.js` 等） | **模拟数据**，不是真实实验。规格里写"实测"时要说明是模拟实测 | 不算一手 | 本地文件 |

## 六、线索（决定去看哪里，不作依据）

| 来源 | 是什么 | 对我们有用的地方 | 能否抓取 |
|---|---|---|---|
| [PhET 教学资源](https://phet.colorado.edu/en/teaching-resources) | 交互仿真，附老师上传的活动和官方教学提示 | 教学提示列出学生的典型困难；活动设计指南讲"给目标、不给步骤" | 10-21：能 |
| [Perimeter Institute 教师资源](https://resources.perimeterinstitute.ca/) | 加拿大圆周理论物理研究所的教学包 | 一节课怎么配演示和学习单；偏近代物理 | 10-21：能 |
| [The Physics Classroom](https://www.physicsclassroom.com/) | 美国中学物理教程，附概念练习 | 初学者视角的讲法，题目难度梯度 | 10-21：能 |
| [Modeling Instruction（AMTA）](https://modelinginstruction.org/) | 建模教学法教师协会 | 建模教学的课堂组织；完整材料大多只对会员开放 | 10-21：能 |
| [SERC Pedagogy in Action](https://serc.carleton.edu/sp/index.html) | 卡尔顿学院教学法资源库，讲"是什么、为什么、怎么用" | 找方法的名字和出处 | 10-21：能 |
| [Open Source Physics（ComPADRE）](https://www.compadre.org/osp/) | 仿真与建模工具（EJS） | 交互怎么做 | 10-21：能 |
| [Concord Consortium](https://concord.org/) | 交互式科学模型与课程 | 同上 | 10-21：能 |
| [HyperPhysics](https://hyperphysics.phy-astr.gsu.edu/) | 概念图式的物理速查 | 核对物理 | 10-21：连接被对方断开 |
| [NASA Glenn K-12 火箭教程](https://www.grc.nasa.gov/WWW/k-12/rocket/) | 火箭、水火箭入门物理 | 反冲一课的情境 | 10-21：能（curl 可以，WebFetch 解析不了域名） |
| 教学设计汇编、教学博客、AI 总结、`plans/lesson-design-standard.md` | | 找方向；标准里的每条规则要回到上面的一手材料，才算有依据 | — |

## 拿不到的原文（请用户下载）

下载后放到 `.claude/skills/lesson-design/references/downloads/`，文件名：`<类别>-<作者或机构><年份>-<关键词>.pdf`（网页另存为 PDF 或 HTML 均可），例：`论文-Crouch2001-PeerInstruction.pdf`。放好后告诉主会话，对应引用才从"只读摘要"改为"读了原文"。优先级从高到低：

| # | 要下载的 | 为什么要 | 目前的状态 |
|---|---|---|---|
| 1 | 人教版《物理》选择性必修第一册（电子或纸本扫描）和配套教参 | 课标定位之外的教材例题、教参的教学建议；认知任务分析的例题样本 | 只有 enjoyphysics.cn 的转录，未对照纸本 |
| 2 | 知网的物理评卷分析、试题分析（动量、碰撞相关，各省高考） | 得分率和典型错误，是错误想法最直接的一手证据 | 只能看摘要 |
| 3 | College Board AP Physics（含历史上的 AP 物理 B）关于动量、碰撞题的评卷报告 | 同上，英文世界的对照 | 原文已下线或不可达 |
| 4 | PhysPort 上 EMCS、FCI、FMCE 的页面（含选项分布、得分数据、论文清单），保存为 PDF | 学生作答数据 | 不可达 |
| 5 | Singh & Rosengrant (2003), *Multiple-choice test of energy and momentum concepts*, Am. J. Phys. 71, 607 | 碰撞、能量、动量的错误想法和选项分布 | 只有二手综述 |
| 6 | Bryce & MacMillan (2009), *Momentum and kinetic energy: confusable concepts in secondary school physics*, JRST 46(7) | C1 等错误想法的依据 | 只读摘要 |
| 7 | Hestenes, Wells & Swackhamer (1992), Force Concept Inventory, *The Physics Teacher* | 错误想法四格表的出处 | 只读摘要 |
| 8 | Crouch & Mazur (2001), *Peer Instruction: Ten years of experience and results*, Am. J. Phys. 69, 970；Watkins & Mazur (2009)；Crouch, Fagen, Callan & Mazur (2004), Am. J. Phys. 72, 835 | 预测锁定、35%–70%、虚构同学的出处 | 只读摘要 |
| 9 | Adams, Paulson & Wieman (2008), *What levels of guidance promote engaged exploration with interactive simulations?*（phet.colorado.edu/publications/PERC_Interview_Guidance.pdf） | "引导最少但不为零"的出处 | 只读摘要 |
| 10 | Physical Review PER 里与动量、碰撞、能量守恒错误想法相关的论文（篇目由查文献的子代理按题目列出） | 一手研究 | 不可达 |
| 11 | IOP Spark 的动量、碰撞主题页（另存） | 英国课堂常见错误想法的线索 | 不可达 |
| 12 | McDermott & Shaffer, *Tutorials in Introductory Physics*（相关 tutorial）；Sokoloff & Thornton, *Interactive Lecture Demonstrations*；Hieggelke 等 *TIPERs*；Hestenes, *Modeling Method* | 引出—冲突—化解、预测—观察—解释、TIPERs 题型的原文 | 标准里列的 PDF 链接 10-23 未测 |
| 13 | Roediger & Karpicke (2006), *Test-enhanced learning*；Renkl 的渐退样例论文；Sweller 的样例效应；Wiggins & McTighe, *Understanding by Design*；Mayer, *Multimedia Learning* | 检索练习、渐退样例、逆向设计、删除检验 | 只读摘要或一般性结论 |
| 14 | Hake (1998), *Interactive-engagement versus traditional methods*, Am. J. Phys. 66, 64 | 归一化增益的参照（`user-test.md`） | 只读摘要 |
| 15 | 国家中小学智慧教育平台上与本课相关的课例录像 | 名师课例；需要登录 | 不可达 |

## 实测记录（2026-10-23，原始输出）

WebFetch：

```
https://www.physport.org/assessments/assessment.cfm?A=EMCS  -> getaddrinfo ENOTFOUND www.physport.org
https://www.physport.org/assessments/assessment.cfm?A=FCI   -> getaddrinfo ENOTFOUND www.physport.org
https://apcentral.collegeboard.org/courses/ap-physics-1-algebra-based/exam/past-exam-questions -> getaddrinfo ENOTFOUND apcentral.collegeboard.org
https://www.chemteam.info/Chem-History/Chadwick-neutron-1932.html -> getaddrinfo ENOTFOUND www.chemteam.info
https://basic.smartedu.cn/syncClassroom                      -> getaddrinfo ENOTFOUND basic.smartedu.cn
https://onlinelibrary.wiley.com/doi/10.1002/tea.20290        -> getaddrinfo ENOTFOUND onlinelibrary.wiley.com
https://www.eea.gd.gov.cn/                                   -> getaddrinfo ENOTFOUND www.eea.gd.gov.cn
https://github.com/Mister-Hope/physics-courseware            -> 能：描述"人教版高中物理课件"；目录 .agents .github .vscode courses e2e patches resources scripts workspace；许可 CC BY-NC-SA 4.0
https://github.com/concord-consortium/clue-curriculum        -> 能：目录 .github/workflows curriculum doc scripts
https://github.com/openstax/osbooks-physics                  -> 能：目录 .devcontainer .github .vscode META-INF collections cover media modules；CC-BY-4.0
```

curl（经代理）：

```
physport.org（含 EMCS、FCI 页）、apcentral.collegeboard.org、chemteam.info、basic.smartedu.cn、
onlinelibrary.wiley.com、eea.gd.gov.cn、neea.edu.cn、opensourcephysics.github.io、spark.iop.org、
journals.aps.org、arxiv.org、www.gutenberg.org、www.compadre.org、phet.colorado.edu
  -> curl: (56) CONNECT tunnel failed, response 403（代理状态页：connect_rejected）
https://github.com/Mister-Hope/physics-courseware            -> 403（378 字节）
https://raw.githubusercontent.com/Mister-Hope/physics-courseware/main/README.md -> 200（8431 字节）
```
