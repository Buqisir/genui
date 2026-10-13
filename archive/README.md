# 历史生成实验

这里放已经不再使用的生成结果，留着做对照和查记录。现行课件不在这里：

- `../lessons/`：手写课件和演示课件
- `../generated-grok/bank2/`：广东 2021–2025 共 75 题的现行版（盲做重生成，见 `plans/craft.md`「整库重新生成」）
- 山东 2025 的 18 题生成后放 `../generated-grok/sd25/`

## 在应用里打开

默认下拉框只列现行课件。要看归档的，启动时加环境变量，id 和归档前一样（`grok-bank-gd21-01`、`gen-r5-01-belt-loop` 这样）：

```sh
cd app && VITE_GENUI_ARCHIVE=1 npx vite --port 5317
```

`plans/audit/` 的截图脚本用的是 `grok-bank-*`，重跑前也要这样启动。

## 目录

| 目录 | 内容 | 现在还被谁用 |
|---|---|---|
| `generated-grok/bank/` | 广东 75 题第一版（Grok 全文单轮）。`reports/` 有评测、人工批改和看图记录 | 已被 `bank2` 替代。`core.test.ts` 拿它当校验消息语料；`plans/audit/` 的审图、`archive/plans/regen2-stats.mjs` 的新旧对比、`gd-sample` 的对照组都是它 |
| `generated-grok/zj-final/` | 浙江 35 题的 Grok 全文单轮基线，`report.md` 是汇总 | `core.test.ts` 的语料；`plans/pre-3d.md` 阶段 3/4 的对照基线 |
| `generated-grok/zj-fast/`、`zj-fast-rerun*/`、`zj-baseline/` | 浙江题的早期批次和单题补跑（超时、改题面后重跑），见 `survey/zhejiang/baseline-report.md` | 无 |
| `generated-grok/calib/`、`smoke/` | r5/r6 原型题的 Grok 校准和冒烟 | 无 |
| `generated-grok/rerun/`、`sol61/` | 广东个别题的补跑 | 无 |
| `generated-grok/agent-smoke/`、`agent-accept/`、`agent-accept.out` | Grok agent 模式的冒烟和验收（2026-10-11 之后不再用 Grok agent） | 无 |
| `generated-deepseek/smoke/`、`accept/` | DeepSeek 单轮和 agent 模式的冒烟、验收（浙江题），`*.out` 是运行日志 | `plans/pre-3d.md` 阶段 3 的数字出自这里 |
| `generated-deepseek/gd-sample/` | 阶段 4 广东 15 题盲测（DeepSeek agent），报告在 `reports/eval-report.md` | `plans/pre-3d.md` 阶段 4 |
| `plans/regen/`、`plans/regen2/`、`plans/regen2-*` | 广东题重新生成时每题的 prompt、Worker 写的 `lesson.md`（`regen/<id>/old/` 是换下的旧版），以及队列、进度和新旧对比统计。成品已合进 `../generated-grok/bank2/`。prompt 里的 `bin/genui` 还是原来的本机路径 | `plans/craft.md`「整库重新生成」引用这里的统计 |
| `generated/` | 最早的 r5/r6 原型题，生成流水线的第一版输出 | `cd app && npx tsx scripts/compare.ts archive/generated` 可以重新核对 |

## 删掉了什么

各目录下的 `.attempts/`（每次尝试的草稿和 agent 的完整对话记录，共 273 个文件、约 4.6 MB）不再放在仓库里，以后生成也不会提交（`.gitignore`）。最终课件和 `*.out` 运行日志都还在。

需要旧的尝试记录时，从归档前的提交取回，例如：

```sh
git checkout 73e7989 -- generated-grok/bank/.attempts
```

（归档前的路径没有 `archive/` 前缀。）
