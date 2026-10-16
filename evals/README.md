# 标准评测

换生成模型时，用这套评测看哪种提示词模式（full / single / compact）更适合它。题单固定为 `evals/standard.yaml` 里的 10 道题，每次换模型都跑同一套题，不为某个模型单独调提示词。改题单会让新旧结果不能比，改之前先想清楚。

三种模式的区别：

- **full**：把完整规范和示例一次全部发给模型，提示词最大（约 150 KB）。
- **single**：先让模型从卡片里选出要用的几张，只发这几张，提示词小（约 60 KB）。
- **compact**：single 加上一张组件签名总表，比 single 大约 5 KB。

## 换模型时怎么跑

在 `app/` 目录下执行，例如用 grok 跑：

```
cd app
npm run eval:standard -- run --engine grok --model grok-4.7 --label grok-4.7-1016
```

默认跑 full、single、compact 三个模式，每题最多 3 轮，3 题并行，答案键只记录不反馈（`--blind`）。跑完会自动生成报告，并把总表打印在终端上。

常用参数：

| 参数 | 含义 | 默认 |
|---|---|---|
| `--engine` | `codex`、`grok` 或 `deepseek`（必填） | — |
| `--model` | 模型名 | 该 engine 的默认模型 |
| `--modes` | 要跑的模式，用逗号分开，例如 `full,single` | `full,single,compact`（codex 只有 `full`） |
| `--rounds` | 每题最多几轮 | 3 |
| `--jobs` | 同时跑几题 | 3 |
| `--effort` | 推理强度 | generate.ts 的默认 |
| `--label` | 结果目录的名字 | `engine-model` |

其它参数（例如 `--timeout 30`）原样交给 `generate.ts`。

注意：这一条命令会调用模型三次（每个模式各跑一遍 10 题，每题最多 3 轮），花费和时间都不小。同一个 `--label` 在同一天只能跑一次，目录已存在时会拒绝运行，不覆盖旧结果。

比较「先解后写」：模式名加 `-solve` 后缀（如 `single-solve`），这个模式先让模型只解题（提示词很短，不带规范），核对通过后再把解答交给写课件的那一轮。和普通模式放在同一次运行里比：

```
cd app
npm run eval:standard -- run --engine grok --model grok-4.7 --modes single,single-solve --label grok-4.7-solve-1016
```

看报告里两行的「答案正确」「首轮通过」和花费。解题要多调用模型，`--solve-rounds N`（默认 2）是解题最多几次；报告会列出透传的这个参数。`agent` 模式没有 `-solve` 版本。

只看已有结果、不重新跑模型：

```
cd app
npm run eval:standard -- report ../evals/runs/2026-10-16-grok-4.7-1016
```

## 结果在哪

每次运行生成一个目录 `evals/runs/<日期>-<标签>/`：

- `full/`、`single/`、`compact/`：每个模式一个子目录。里面 `<题目>.md` 是最后一版课件，`.attempts/` 里是每一轮的课件，`generate.log` 是日志（用时、花费、每轮的错误数）。
- `run.json`：这次跑的参数、题单版本和代码的 git 提交号。
- `report.md`：完整报告（就是终端上那张表加上每题和报错明细）。

## 怎么看表

报告的「模式对比」表，每行一个模式：

- **首轮通过**：第一版课件就没有校验错误的题数。越高，说明模型越少需要返工。
- **3 轮内通过**：三轮之内校验通过的题数。
- **答案正确**：最后一版课件是否和答案键一致（数值在 1% 以内，选项要完全一致）。这是最重要的一列：校验通过但答案错，说明物理算错了。
- **平均轮次**：每题用了几轮。没通过的题按 3 轮计。
- **提示词大小**：第一轮发出去的字节数，越小越省钱，也越快。
- **耗时、花费**：各次尝试加起来。codex 不记录花费，显示「—」。
- **最常见报错**：校验器报错最多的前 3 种。

「每题」表里，每格是这道题第几轮通过；「✗」是没有通过；「答案✗」是最后一版课件的答案不对。「报错 code」表列出每个模式最常见的 5 种报错，`front-matter` 是头信息写错，`answer-mismatch` 是答案和课件公式对不上，`unknown-component` 是用了不存在的组件。

报告里标明「需人工核对」的题，答案只能由人比对，不计入「答案正确」。

## 怎么定默认模式

看完表，按下面的顺序判断：

1. **先看答案正确数。** 两个模式答案正确的题数相差 1 题以内，就当作一样。10 道题的样本很小，差一两道题可能只是运气。
2. **答案差不多时，选提示词小的那个。** 例如 single 答对 9 题，full 答对 9 题，single 提示词只有 full 的 40%，就选 single。
3. **答案明显多对时，选答得多的。** 例如 full 答对 9 题，single 答对 7 题，就选 full，哪怕它提示词大。
4. **如果两者差距很大，看报错表找原因。** 例如某模式 `front-matter` 报错特别多，说明提示词里头信息写得不够清楚，应该改提示词，而不是换模式。
5. **留个记录。** 把结论和报告路径写进 `evals/` 下的一份笔记（参考 `evals/2026-10-16-haiku-prompts.md`），注明模型、日期和 git 提交号。

只跑一次的结果不要太当真。模型输出有随机性，重要的决定最好再跑一次，两次结论一致再改默认值。

## 没有模型 API 时：让 agent 扮演模型

没有可调用的模型时，可以让 agent（比如 Claude Code 本身）一步一步扮演模型，用 `scripts/eval-step.ts`。它只读写文件：脚本生成提示词，agent 读提示词、把回答写进文件，脚本再校验并给出下一轮提示词。

```
cd app
R=../evals/manual/2026-10-16-agent
# full 模式，第 1 轮
npx tsx scripts/eval-step.ts prompt gd23-06 --arm full --dir $R/full-gd23-06
#   读 $R/full-gd23-06/prompt-1.md，把回答写进 $R/full-gd23-06/reply-1.md
npx tsx scripts/eval-step.ts check gd23-06 --dir $R/full-gd23-06 --round 1
#   没通过：读 prompt-2.md，写 reply-2.md，再 check --round 2（最多 3 轮）
npx tsx scripts/eval-step.ts summary $R
```

single、compact 模式要先选卡：先运行 `select gd23-06 --dir <目录>`，把选卡回答写进该目录的 `select-reply.md`，再运行 `prompt ... --arm single --dir <目录>`。

注意：eval-step 的结果由 agent 产生，不是真正的模型，不能和上面 `run` 的结果直接比。它的目录结构也不同，`report` 读不了它，要用它自己的 `summary` 看。
