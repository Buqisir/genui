# 物理题可视化 · 原型

课件格式见 `../syntax-spec.md`，课件文件放在 `../lessons/*.md`。

```bash
npm install
npm run dev        # http://localhost:5173（或 npx vite --port 5317），顶部下拉框切换课件
npm test           # 解析器、表达式、注册表单元测试；并检查每份课件能解析、answers 和派生量一致
npm run build      # 类型检查 + 打包
npm run verify     # 提交前全量检查：打包、测试、docs check、课件 validate（CI 同款）
```

目录：

- `src/lesson/`：`parse.ts`（Markdown + 组件标签解析）、`expr.ts`（mathjs 受限求值）、`store.tsx`（参数与派生量）
- `src/components/`：`LessonView`（渲染）、`controls`（Param / Preset / Readout / Status）、`Plot`、`Sim`（沙箱宿主）
- `src/sim/runtime/*.js`：沙箱内运行时（`sim()`、绘图工具 `v`）。各文件是同一个闭包的分段，由 `src/sim/buildRuntime.ts` 按 `RUNTIME_PARTS` 的顺序拼起来，互相能直接用对方的顶层名字，不是模块，不要加 `import`/`export`。

  | 文件 | 内容 |
  |---|---|
  | `state.js` | 共享函数解构、帧状态、排版登记、消息、历史采样（必须第一个） |
  | `text.js` | 字体、下标、文字测量和绘制 |
  | `draw.js` | 坐标映射和基础图元：line、path、circle、rect、arrow、vec、label、text |
  | `annotate.js` | 匀强场标记 `v.field` |
  | `efield.js` | 电场：点电荷、导体边界元求解、电场线和等势线 |
  | `regions.js` | Motion 场区域、带电球、尺寸标注、刻度尺、坐标轴 |
  | `bodies.js` | 实物：地面、墙、小车、木块、球、弹簧、滑轮、齿轮、降落伞、箱子、手、激光器、斜面、汽缸 |
  | `vessels.js` | 气体分子点、容器和玻璃器皿、传送带 |
  | `parts.js` | 金属棒、光子、电路元件、管子、星球/轨道/卫星、导轨和极板 |
  | `optics.js` | 光具座和光线 |
  | `track.js` | 轨道、光电门、计时器、导线、变压器 |
  | `lab.js` | 实验器材（公式和 `src/sim/apparatus.ts` 一致） |
  | `motion.js` | 运动痕迹和环境效果：波、频闪、轨迹、事件、粒子流、星空 |
  | `magnets.js` | 磁体涂装、螺线管、环形线圈、磁铁、辐向磁场 |
  | `render.js` | 每帧渲染、`v` 工具表、消息处理、就绪信号（必须最后一个） |

## 生成流水线

```bash
python3 ../tools/extract_problems.py                      # capture-plan.md → ../problems/*.md
npx tsx scripts/generate.ts r5-01-belt-loop r6-04-generator-heaters --jobs 3 --rounds 3 --effort high
npx tsx scripts/validate.ts ../generated/*.md            # 结构 + 表达式 + answers + Sim/Figure 试跑
npx tsx scripts/compare.ts                               # 和 ../problems/expected.yaml 的标准答案核对
node scripts/shoot.mjs gen-r6-04-generator-heaters --marks --out shots/gen   # 用 GENUI_URL 或 5317 上的 dev server，都没有就自己起一个
```

生成结果在 `../generated/`（每次尝试另存在 `.attempts/`，日志在 `generate.log`），页面里以 `gen-` 前缀出现。`.attempts/` 不提交。广东 75 题的现行版在 `../generated-grok/bank2/`；以前的实验结果移到了 `../archive/`（说明见 `../archive/README.md`），启动时加 `VITE_GENUI_ARCHIVE=1` 才会出现在下拉框里。
