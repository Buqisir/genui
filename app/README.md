# 物理题可视化 · 原型

课件格式见 `../syntax-spec.md`，课件文件放在 `../lessons/*.md`。

```bash
npm install
npm run dev        # http://localhost:5173（或 npx vite --port 5317），顶部下拉框切换课件
npm test           # 解析器、表达式、注册表单元测试；并检查每份课件能解析、answers 和派生量一致
npm run build      # 类型检查 + 打包
```

目录：

- `src/lesson/`：`parse.ts`（Markdown + 组件标签解析）、`expr.ts`（mathjs 受限求值）、`store.tsx`（参数与派生量）
- `src/components/`：`LessonView`（渲染）、`controls`（Param / Preset / Readout / Status）、`Plot`、`Sim`（沙箱宿主）
- `src/sim/runtime.js`：沙箱内运行时（`sim()`、绘图工具 `v`）

## 生成流水线

```bash
python3 ../tools/extract_problems.py                      # capture-plan.md → ../problems/*.md
npx tsx scripts/generate.ts r5-01-belt-loop r6-04-generator-heaters --jobs 3 --rounds 3 --effort high
npx tsx scripts/validate.ts ../generated/*.md            # 结构 + 表达式 + answers + Sim/Figure 试跑
npx tsx scripts/compare.ts                               # 和 ../problems/expected.yaml 的标准答案核对
node scripts/shoot.mjs gen-r6-04-generator-heaters --marks --out shots/gen   # 需要 dev server 在 5317 端口
```

生成结果在 `../generated/`（每次尝试另存在 `.attempts/`，日志在 `generate.log`），页面里以 `gen-` 前缀出现。
