---
name: genui
description: 编写或修改高中物理交互课件（genui 的 lesson .md）。用户要写课件、改课件、校验课件、查组件写法，或提到 genui、课件文件、组件卡时使用。
---

# genui 课件

命令：仓库根目录下的 `bin/genui`（本文件所在目录往上两级），任意工作目录都能跑。下文简写为 `genui`。

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

改一份已经校验过的课件，只动几个块时，不必整份重写：写一份补丁，开头 `<!-- patch -->`，只含要替换或新增的组件块（格式见 `genui docs patch`）。`genui patch <课件.md> <补丁.md>` 按块名合并，`genui patch <课件.md> --keys` 列出块名。合并后照常校验。
