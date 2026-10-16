---
id: seg-sd25-02
title: 分子势能的正负
source: 2025 山东卷 第 2 题（单选，3 分）
question: "分子间作用力 F 与分子间距离 r 的关系如图所示，若规定两个分子间距离 r 等于 r_0 时分子势能 E_p 为零，则（　　）\nA. 只有 r 大于 r_0 时，E_p 为正\nB. 只有 r 小于 r_0 时，E_p 为正\nC. 当 r 不等于 r_0 时，E_p 为正\nD. 当 r 不等于 r_0 时，E_p 为负"
choice: C
answers: []
givens: ["F–r 图：r₀ 处 F = 0", "r > r₀ 引力，r < r₀ 斥力", "规定 r = r₀ 时 E_p = 0"]
---

这道题的关键是「分子力做功」和「势能零点选在哪」。先看分子离开 r₀ 时分子力做正功还是负功，再看零点定在 r₀ 之后，其他位置的分子势能是正还是负。

<Segment title="偏离 r₀ 时，分子力做什么功" quote="分子间作用力 F 与分子间距离 r 的关系如图所示" hint="拖动分子间距离 r，从 r₀ 往外拉到 2r₀，再从 r₀ 往里压到 0.92r₀ 左右（这是滑块的下限）。" watch="r > r₀ 时分子力是引力、指向 r₀；r < r₀ 时是斥力、也指回 r₀。不管往哪边偏，力都和位移方向相反。" ask="从 r₀ 往外拉、往里压，分子力分别做正功还是负功？" reveal="两种情况都做负功：往外拉时引力向里，往里压时斥力向外，都和位移反向。负功意味着分子势能增大。" revealParam="showF" />

分子力随 r 变化的情况见图。判断做功的正负，看的是**力的方向和位移的方向**是否相同，力的大小只决定做功多少。

<Param name="r" label="分子间距离" symbol="r/r_0" value={1} min={0.92} max={2.5} step={0.01} />

<Param name="showF" label="画出分子力" value={1} hidden />

<Define name="F" expr="12/r^13 - 12/r^7" />

<Status cases={[
  {when: "abs(r - 1) < 0.005", label: "r = r_0：分子力为零", tone: "success"},
  {when: "r < 1", label: "r < r_0：斥力", tone: "neutral"},
  {label: "r > r_0：引力", tone: "neutral"}
]} />

<Readout items={[
  {label: "分子力（斥力为正）", symbol: "F", expr: "F", digits: 2, color: "force"}
]} />

<Preset label="往外拉：r = 2r_0" set={{r: 2}} />

<Preset label="往里压：r = 0.92r_0" set={{r: 0.92}} />

<Figure title="两个分子" height={220} params={["r", "F", "showF"]} note="分子和距离都是示意；箭头长度随分子力大小变化，过长时截断">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.2, xmax: 3.1, ymin: -0.62, ymax: 0.5, equal: true })
    const xA = 0.3
    const xB = xA + p.r
    v.ball(m, xA, 0, 0.2, { label: '分子 A' })
    v.ball(m, xB, 0, 0.2, { label: '分子 B' })
    v.dim(m, xA, -0.45, xB, -0.45, 'r')
    // 斥力把 B 推向右、A 推向左；引力相反。
    // 箭头从球面出发；引力箭头指向对方，长度不超过两球间隙的一半。
    // showF 为 0 时（揭晓前）不画力的箭头，避免提前给出做功的正负。
    const R = 0.2
    const gap = (p.r - 2 * R) / 2 - 0.06
    const len = p.F > 0 ? Math.min(0.7, p.F * 0.12) : -Math.min(gap, -p.F * 0.12)
    if (p.showF > 0.5 && Math.abs(p.F) > 0.02) {
      const s = Math.sign(len)
      v.vec(m, xB + s * R, 0, len, 0, { kind: 'force', label: 'F', min: 10 })
      v.vec(m, xA - s * R, 0, -len, 0, { kind: 'force', min: 10 })
    }
  },
})
</Figure>

<Plot title="分子力与距离" size="wide"
  caption="F > 0 表示斥力，F < 0 表示引力；r = r_0 时 F = 0"
  x={{name: "x", label: "r/r_0", min: 0.8, max: 2.6}}
  y={{label: "F", min: -3, max: 8}}
  series={[{label: "分子力", expr: "12/x^13 - 12/x^7", color: "force"}]}
  marks={[{x: 1, label: "r_0"}]}
  cursor="r"
/>

<Segment title="零点选在 r₀，其他位置的 E_p" quote="若规定两个分子间距离 **r 等于 r_0 时分子势能 E_p 为零**，则" hint="继续拖动 r，看 E_p–r 曲线上的点。" watch="E_p 在 r₀ 处最小；离开 r₀，不管往哪边，E_p 都升高。" ask="r 不等于 r₀ 时，E_p 是正还是负？" reveal="r₀ 处 E_p 最小，把它规定为零，其他位置都比它大，所以 r ≠ r₀ 时 E_p 为正，选 C。" />

分子力做正功，分子势能减小；做负功，分子势能增大。上一段看到，离开 r₀ 时分子力都做负功，所以分子势能都增大。

曲线在 r₀ 处取最低点。把这一点规定为零，整条曲线就都在横轴上方，只在 r₀ 处碰到零。

<Define name="Ep" expr="1/r^12 - 2/r^6 + 1" />

<Plot title="分子势能与距离" size="wide"
  caption="规定 r = r_0 时 E_p = 0；这是曲线的最低点，两边都为正"
  x={{name: "x", label: "r/r_0", min: 0.8, max: 2.6}}
  y={{label: "E_p", min: -0.2, max: 1.2}}
  series={[{label: "分子势能", expr: "1/x^12 - 2/x^6 + 1", color: "charge"}]}
  marks={[{x: 1, label: "r_0"}]}
  cursor="r"
/>

<Readout items={[
  {label: "分子势能", symbol: "E_p", expr: "Ep", digits: 3, color: "charge"}
]} />

<Segment title="完整解答" />

分子力做正功，分子势能减小；做负功，分子势能增大。从 $r_0$ 出发：

- 增大距离（$r > r_0$）：分子力是引力，方向与位移相反，做负功，$E_p$ 增大；
- 减小距离（$r < r_0$）：分子力是斥力，方向也与位移相反，做负功，$E_p$ 增大。

两边都比 $r_0$ 处大，$r_0$ 是分子势能的最低点。既然规定那里为零，

$$
\boxed{r \ne r_0 \text{ 时 } E_p > 0}
$$

**A 错误。** $r < r_0$ 时 $E_p$ 也为正，不是「只有」$r > r_0$。

**B 错误。** $r > r_0$ 时 $E_p$ 也为正，不是「只有」$r < r_0$。

**C 正确。** 无论距离变大还是变小，离开 $r_0$ 分子力都做负功，$E_p$ 都比零大。

**D 错误。** $r_0$ 处是最低点，其他位置不可能为负。

<Answer items={[{label: "答案", text: "C"}, {label: "依据", text: "r_0 处分子势能最低，离开 r_0 分子力都做负功"}]} />
