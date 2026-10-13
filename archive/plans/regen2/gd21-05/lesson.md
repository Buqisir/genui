---
id: gd21-05
title: 方管里的五根导线
source: 2021 广东卷 第 5 题（单选，4 分）
question: 截面为正方形的绝缘弹性长管中心有一固定长直导线，长管外表面固定着对称分布的四根平行长直导线，若中心直导线通入电流 I_1，四根平行直导线均通入电流 I_2，I_1 ≫ I_2，电流方向如图所示，下列截面图中可能正确表示通电后长管发生形变的是（　　）
choice: C
answers: []
---

正方形截面的绝缘弹性长管，中心固定一根长直导线，四边中点各固定一根与之平行的长直导线。中心电流 $I_1$ 向里（⊗）；上、下两根 $I_2$ 向外（⊙），左、右两根 $I_2$ 向里（⊗）。题目给出 $I_1 \gg I_2$，每根边线主要受中心电流的磁场作用，四根边线之间的相互作用可以忽略。题目没有数值，下面取 $I_1 = 10\ \mathrm{A}$、$I_2 = 1\ \mathrm{A}$ 作代表，比值为 10。

## 完整解答

右手螺旋定则：$I_1$ 向里，周围磁感线是顺时针的同心圆。在四边中点取切向，中心磁场的方向是：右边向上、上边向左、左边向下、下边向右。

安培力 $\vec F = I\vec L \times \vec B$，$\vec L$ 沿电流方向。边线电流与中心同向时相吸，反向时相斥：

- 左、右两根也是 ⊗，与 $I_1$ 同向，受向里的吸引。左、右两边中点被拉向中心，这两边向内凹。
- 上、下两根是 ⊙，与 $I_1$ 反向，受向外的推斥。上、下两边中点被推离中心，这两边向外凸。

四角被管壁拉住，形变只能发生在边的中部：左右内凹、上下外凸。四根导线仍在各边中点。

**A. 四边都向内凹 —— 错误。** 上、下两根与中心反向，受斥力向外，不会向内凹。

**B. 四边都向外凸 —— 错误。** 左、右两根与中心同向，受吸引向里，不会向外凸。

**C. 左右向内凹，上下向外凸 —— 正确。** 左右同向相吸、上下反向相斥，与上面的力的方向一致。

**D. 左右向外凸，上下向内凹 —— 错误。** 四条边的形变方向都与安培力相反。

因 $\boxed{\text{C}}$

## 交互演示

拖动「形变」滑块：从 0 到题目形变，左右中点靠近中心、上下中点远离中心。箭头是中心电流对各边线的安培力，同向向里、反向向外。四角保持不动。方管没有现成器材，用曲线示意；五根导线用通电直导线器材画出。管的厚度和形变大小不按比例。

<Param name="k" label="形变" value={1} min={0} max={1} step={0.05} />

<Param name="view" label="看法" value={1} options={[{value: 1, label: "题目形变"}, {value: 2, label: "未形变"}]} />

<Question text="A. 四边都向正方形内部弯曲" set={{view: 2, k: 0}} hint="上下两根与中心反向，受斥力向外，不会四边同时内凹" />

<Question text="B. 四边都向正方形外部鼓出" set={{view: 2, k: 0}} hint="左右两根与中心同向，受吸引向里，不会四边同时外凸" />

<Question text="C. 左右向内凹，上下向外凸" set={{view: 1, k: 1}} hint="同向相吸、反向相斥，左右靠近中心，上下远离中心" />

<Question text="D. 左右向外凸，上下向内凹" set={{view: 2, k: 0}} hint="四条边的形变方向都与安培力相反" />

<Status cases={[
  {when: "view == 1 and k > 0.85", label: "左右内凹、上下外凸，即选项 C", tone: "success"},
  {when: "view == 2", label: "尚未形变：对照通电前的正方形", tone: "neutral"},
  {label: "形变过程中：左右靠近，上下远离", tone: "info"}
]} />

<Readout items={[
  {label: "中心电流", symbol: "I_1", expr: "10", unit: "A", digits: 0},
  {label: "边线电流", symbol: "I_2", expr: "1", unit: "A", digits: 0},
  {label: "电流比", symbol: "I_1/I_2", expr: "10", digits: 0}
]} />

<Preset label="题目形变" set={{view: 1, k: 1}} />

<Preset label="通电前" set={{view: 2, k: 0}} />

<Answer items={[{label: "答案", text: "C"}]} />

<Figure title="通电后的截面" height={440} params={["k", "view"]} note="管壁厚度与形变大小不按比例；箭头为中心电流对该边线的安培力" legend={[{kind: "force", label: "安培力"}, {kind: "field", label: "中心电流的磁场"}]} hud={[{symbol: "I_1/I_2", label: "电流比", expr: "10", digits: 0}]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2.7, xmax: 2.7, ymin: -2.7, ymax: 2.7, equal: true })
    const s = p.view == 1 ? p.k : 0
    const a = 1.7
    const d = 0.42 * s
    const wall = v.color.steel
    const side = (x0, y0, x1, y1, xm, ym, nx, ny) => {
      const pts = []
      const n = 24
      for (let i = 0; i <= n; i++) {
        const t = i / n
        const bulge = 4 * t * (1 - t)
        pts.push([
          x0 + (x1 - x0) * t + (xm - (x0 + x1) / 2) * bulge,
          y0 + (y1 - y0) * t + (ym - (y0 + y1) / 2) * bulge,
        ])
      }
      return pts
    }
    const right = side(a, -a, a, a, a - d, 0)
    const top = side(-a, a, a, a, 0, a + d)
    const left = side(-a, a, -a, -a, -a + d, 0)
    const bot = side(a, -a, -a, -a, 0, -a - d)
    const outer = right.concat(top.slice(1), left.slice(1), bot.slice(1))
    v.path(m, outer, { close: true, color: wall, width: 7 })
    const ring = [30]
    v.wire(m, a - d, 0, { dir: "in", label: "I_2", rings: ring })
    v.wire(m, -a + d, 0, { dir: "in", rings: ring })
    v.wire(m, 0, a + d, { dir: "out", label: "I_2", rings: ring })
    v.wire(m, 0, -a - d, { dir: "out", rings: ring })
    v.wire(m, 0, 0, { dir: "in", label: "I_1", rings: [40, 68, 96] })
    const f = 0.5
    const g = 0.2
    v.vec(m, a - d - g, 0, -f, 0, { kind: "force", label: "F" })
    v.vec(m, -a + d + g, 0, f, 0, { kind: "force" })
    v.vec(m, 0, a + d + g, 0, f, { kind: "force" })
    v.vec(m, 0, -a - d - g, 0, -f, { kind: "force" })
  },
})
</Figure>
