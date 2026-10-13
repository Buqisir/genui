# 云端接手说明（2026-10-13）

本地做到提交 `3898078` 之后，剩两项待办交给云端继续：**A. 山东 2025 生成课件**、**B. 第三批生活器具**。先读完「环境」「规矩」两节再动手。背景和历史记录在 `plans/craft.md`（器材与画面规矩）、`archive/plans/regen2-status.md`（整库重新生成的流程）。

## 环境

```sh
cd app && npm ci && npx playwright install chromium
```

- `generate.ts`、`regen-prompt.ts` 按仓库位置算出 `bin/genui` 的绝对路径写进 prompt，不需要建软链接。以前几轮的 prompt 和草稿在 `archive/plans/regen*/`，里面还是原来的本机路径，只作记录。
- 截图和 QA 脚本（`qa-all`、`moments`、`shoot` 等）先看 `GENUI_URL`，再看 5317 端口有没有服务，都没有就自己在空闲端口起一个，跑完关掉。不用先手动启动 dev server。
- 真题原卷（`2008-2025·（*）物理高考真题/`）和题图（`problems/**/*.png`）都在 `.gitignore` 里，仓库没有。题目文字和答案键已经在 `problems/` 里，生成课件不需要原卷；需要看原图时找用户要。

## 常用命令（仓库根目录）

| 用途 | 命令 |
|---|---|
| 校验课件 | `bin/genui validate <file>`、`bin/genui layout <file>` |
| 截图 | `bin/genui shot <file> --out <dir>`；指定场景/时刻/夜光：`cd app && node scripts/moments.mjs <id> --scene N --at 0.3 --night 0.3` |
| 读文档 | `bin/genui docs <id>` |
| 生成 prompt | `cd app && npx tsx scripts/regen-prompt.ts <outRoot> <id>...`（写 `<outRoot>/<id>/prompt.md`） |
| 题库检查 | `cd app && npx tsx scripts/check-problems.ts sd25`（不带前缀只查旧的 75 题） |
| 答案核对 | stdin 传 `[{"id":"sd25-01","file":"../generated-grok/sd25/sd25-01.md"}, ...]` 给 `cd app && npx tsx scripts/keycheck.ts`；答案键自动读 `problems/expected*.yaml` |
| 类型检查 | `cd app && ./node_modules/.bin/tsc -b` |
| 单元测试 | `cd app && npx vitest run --maxWorkers=1`（当前 369 个全过） |
| 一键检查 | `cd app && npm run verify`（tsc + 打包、vitest、docs check、lessons 和 bank2 全部 validate；CI 跑的就是它） |
| 文档 | `cd app && npx tsx scripts/docs.ts build`，然后 `... docs.ts check` |
| 演示课件回归 | `node app/scripts/qa-all.mjs _demo-apparatus _demo-atom _demo-axis _demo-circuit-b _demo-conductor _demo-e _demo-fringes _demo-gaokao _demo-instruments-2 _demo-magnetics _demo-optics _demo-prefabs _demo-radial _demo-track _demo-vessel-wave`（15/15） |
| 打包 | `cd app && npx vite build` |

## 规矩

- **并行 Worker 最多 4 个。** 8–10 个并发时出现过一批 `model_request_rejected`，上一轮后段 6 个 Worker 连续失败也是这个原因。
- 一个文件同一时间只能有一个 Worker 改。`app/src/sim/runtime.js` 有 7300 多行，分段读，按函数名搜。
- 每个器材、每节课件都要截亮色和夜光两张图，人看过才算完成。只看校验结果不算数（校验通过但画面错的情况见 `plans/craft.md`「审图返工」各条）。
- 画面规矩见 `plans/craft.md`「画面规矩」：只用 `tokens.ts` 里的材质，不手配颜色；标签不能压在线上或物体上；有现成器材必须用，不要拿 `v.rect` / `v.path` 拼。
- 生成课件时答案只能来自题目推导，答案键 `expected-*.yaml` **不能**放进给模型的 prompt。
- 提交信息用英文短句，风格照 `git log`。

## A. 山东 2025 生成课件

题目：`problems/sd25-01.md` … `sd25-18.md`，答案键 `problems/expected-sd25.yaml`（`check-problems.ts sd25` 0 条问题）。转写过程和核对记录在 `problems/_import/sd25/review.md` 和 `plans/craft.md`「真题导入与山东 2025 试点」。

步骤：

1. `cd app && npx tsx scripts/regen-prompt.ts ../plans/regen-sd25 sd25-01 ... sd25-18`。
2. 每题一个 Worker（最多 4 个并行），工作目录 `plans/regen-sd25/<id>/`，按 `prompt.md` 写 `lesson.md`，自己跑 `validate` / `layout` 直到 0 错误。
3. 复制到 `generated-grok/sd25/<id>.md`。
4. 跑 keycheck，要求 0 项不符；不符的题让 Worker 重新推导，不要把答案直接告诉它。
5. 每题截亮色和夜光图，逐张看：器材对不对、标签位置、数值读数是不是 NaN。
6. 第 2、8、10、14、16、18 题的题图没导出，题目里只有文字描述；这几题的画面要对照文字核对。有疑问的列出来交给用户看原卷。

验收：18 节都 0 错误，keycheck 0 项不符，截图看过；在 `plans/craft.md` 记一节结果。

## B. 第三批生活器具

| 器材 | 用在哪节 | 题图描述在 |
|---|---|---|
| 犁 | gd21-03 | `problems/gd21-03.md` |
| 静电喷管（发射极） | gd21-06 | `problems/gd21-06.md` |
| 背罩（降落伞下的弧形罩） | gd24-09 | `problems/gd24-09.md` |
| 安全气囊 | gd24-14 | `problems/gd24-14.md` |
| 空调（室外机/室内机） | gd22-15 | `problems/gd22-15.md` |

照前两批的做法（参考 `v.gear` / `v.parachute` / `v.box` / `v.hand` 的代码和测试）：

1. 器材写在 `app/src/sim/runtime.js` 的 `v.*`，需要的话在 `app/src/craft/canvas.ts` 加画法，材质在 `app/src/craft/tokens.ts`（亮色、夜光两套都要）。返回挂点（绳端、接线点、受力点）给课件连线用。
2. 测试写进 `app/src/lesson/apparatus.test.ts`（至少：能画出来、挂点位置、夜光不报错）。
3. 文档：`docs/ref/sim-bodies.md` 加用法，`docs/ref/sim-craft.md` 的对照表加一行，然后 `docs.ts build` + `check`。
4. 样张：在 `lessons/_demo-gears.md` 加场景（或新建 `_demo-household.md`），截亮色/夜光到 `plans/craft/batch3-sample/`，**先给用户看，认可后**再改课件。
5. 回改上表 5 节 `generated-grok/bank2/` 课件，改完 `validate` + 截图。

前两批踩过的坑：宽高比例换算方向反了（伞盖被压扁）；轮廓用一条自相交的多边形画（手成了乱线，后来改成分件画）；角标方向按世界坐标算（y 轴向上），画到了地面下，要按屏幕坐标算。

## 全部做完后的验证

`npm run verify`（覆盖 tsc、vitest、docs check、lessons + bank2 validate、`vite build`），再加 sd25 18 课 validate、keycheck、qa-all 15/15，都过了再提交。sd25 课件进库后把它加进 `package.json` 的 `validate:lessons`。

—— Droid 整理（2026-10-13）
