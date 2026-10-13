---
id: gd21-03
title: 曲辕犁与直辕犁的拉力分力
source: 2021 广东卷 第 3 题（单选，4 分）
question: "唐代《耒耜经》记载了曲辕犁相对直辕犁的优势之一是起土省力，设牛用大小相等的拉力 F 通过耕索分别拉两种犁，F 与竖直方向的夹角分别为 α 和 β，α < β，如图所示，忽略耕索质量，耕地过程中，下列说法正确的是（　　）\nA. 耕索对曲辕犁拉力的水平分力比对直辕犁的大\nB. 耕索对曲辕犁拉力的竖直分力比对直辕犁的大\nC. 曲辕犁匀速前进时，耕索对犁的拉力小于犁对耕索的拉力\nD. 直辕犁加速前进时，耕索对犁的拉力大于犁对耕索的拉力"
choice: B
answers: []
---

牛的拉力 F 大小相等，沿耕索方向作用在犁上。题目没有给出数值，下面取代表性数值：$F = 100\ \mathrm{N}$，曲辕犁夹角 $\alpha = 25^\circ$，直辕犁夹角 $\beta = 65^\circ$，并始终保持 $\alpha < \beta$。夹角都从竖直方向向右量到耕索。

把拉力沿水平、竖直方向分解：

$$
F_x = F\sin\theta, \qquad F_y = F\cos\theta
$$

$\theta$ 是该犁耕索与竖直方向的夹角。$\alpha < \beta$，且两角都是锐角，所以 $\sin\alpha < \sin\beta$、$\cos\alpha > \cos\beta$：曲辕犁的水平分力更小，竖直分力更大。

代表性数值下：

$$
F_{x\alpha} = F\sin\alpha = 42.3\ \mathrm{N}, \quad
F_{y\alpha} = F\cos\alpha = 90.6\ \mathrm{N}
$$

$$
F_{x\beta} = F\sin\beta = 90.6\ \mathrm{N}, \quad
F_{y\beta} = F\cos\beta = 42.3\ \mathrm{N}
$$

## 完整解答

**A 错误。** 水平分力 $F\sin\theta$ 随夹角增大。$\alpha < \beta$，所以耕索对曲辕犁的水平分力比对直辕犁的**小**。代表性数值下 $42.3\ \mathrm{N} < 90.6\ \mathrm{N}$。

**B 正确。** 竖直分力 $F\cos\theta$ 随夹角增大而减小。$\alpha < \beta$，所以耕索对曲辕犁的竖直分力比对直辕犁的**大**。竖直分力向上，抵消一部分犁的重力，耕刃对地的正压力减小，起土更省力。

$$
\boxed{F\cos\alpha > F\cos\beta}
$$

**C 错误。** 耕索对犁的拉力与犁对耕索的拉力是一对作用力与反作用力，始终等大、反向、共线。匀速前进只说明犁受到的合力为零，不改变这一对力的大小关系。

**D 错误。** 加速前进说明犁受到的合力不为零，但耕索对犁的拉力与犁对耕索的拉力仍是作用力与反作用力，大小仍相等。运动状态不改变牛顿第三定律。

## 交互演示

左侧是曲辕犁，耕索较竖；右侧是直辕犁，先接一段水平直辕，耕索更接近水平。两边的拉力箭头按同一比例画，水平、竖直分力用虚线。拖动两个夹角，可以直接比较分力。犁的形状只是示意，不按比例。

<Param name="F" label="牛的拉力" symbol="F" value={100} min={40} max={200} step={5} unit="N" color="force" />

<Param name="alpha" label="曲辕犁夹角" symbol="α" value={25} min={5} max={50} step={1} unit="°" />

<Param name="beta" label="直辕犁夹角" symbol="β" value={65} min={40} max={85} step={1} unit="°" />

<Define name="FxA" expr="F*sin(deg(alpha))" />

<Define name="FyA" expr="F*cos(deg(alpha))" />

<Define name="FxB" expr="F*sin(deg(beta))" />

<Define name="FyB" expr="F*cos(deg(beta))" />

<Question text="A. 耕索对曲辕犁拉力的水平分力比对直辕犁的大" set={{alpha: 25, beta: 65}} hint="比较两边的水平分力：夹角越大，水平分力越大" />

<Question text="B. 耕索对曲辕犁拉力的竖直分力比对直辕犁的大" set={{alpha: 25, beta: 65}} hint="比较两边的竖直分力：夹角越小，竖直分力越大" />

<Status cases={[
  {when: "alpha >= beta", label: "已不满足 α < β", tone: "warning"},
  {when: "FyA > FyB and FxA < FxB", label: "曲辕犁竖直分力更大、水平分力更小", tone: "success"},
  {label: "拖动夹角比较两犁", tone: "neutral"}
]} />

<Readout items={[
  {label: "曲辕犁水平分力", symbol: "F_xα", expr: "FxA", unit: "N", digits: 1, color: "velocity"},
  {label: "曲辕犁竖直分力", symbol: "F_yα", expr: "FyA", unit: "N", digits: 1, color: "force"},
  {label: "直辕犁水平分力", symbol: "F_xβ", expr: "FxB", unit: "N", digits: 1, color: "velocity"},
  {label: "直辕犁竖直分力", symbol: "F_yβ", expr: "FyB", unit: "N", digits: 1, color: "force"}
]} />

<Preset label="题目代表值：α = 25°，β = 65°" set={{F: 100, alpha: 25, beta: 65}} />

<Preset label="两夹角更接近" set={{alpha: 40, beta: 50}} />

<Figure title="曲辕犁与直辕犁" height={340} params={["alpha", "beta"]} note="犁体示意不按比例；两边拉力箭头同比例，分力画成虚线" legend={[{kind: "force", label: "牛的拉力 F"}, {kind: "velocity-dash", label: "水平分力"}, {kind: "force-dash", label: "竖直分力"}]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 12.4, ymin: -0.35, ymax: 4.35, equal: true })
    v.ground(m, 0, 12.4, 0)
    const drawPlow = (x, y) => {
      v.path(m, [
        [x, y],
        [x + 0.16, y + 0.55],
        [x + 0.72, y + 0.55],
        [x + 0.86, y + 0.28],
        [x + 0.72, y],
      ], { close: true, fill: v.color.graphite, color: v.color.ink, width: 1.2 })
      v.path(m, [
        [x + 0.08, y],
        [x + 0.34, y - 0.16],
        [x + 0.62, y],
      ], { close: true, fill: v.color.steel, color: v.color.ink, width: 1.1 })
    }
    const drawRope = (x0, y0, theta, tag) => {
      const rad = (theta * Math.PI) / 180
      const L = 2.35
      const x1 = x0 + L * Math.sin(rad)
      const y1 = y0 + L * Math.cos(rad)
      v.line(m, x0, y0, x0, y0 + 1.35, { color: v.color.steel, dash: true, width: 1.1 })
      v.ellipse(m, x0, y0, 0.42, 0.42, { from: 90 - theta, to: 90, color: v.color.ink, width: 1.2 })
      v.vec(m, x0, y0, 1.55 * Math.sin(rad), 1.55 * Math.cos(rad), { kind: 'force', label: 'F' })
      v.rope(m, [[x0 + 2.05 * Math.sin(rad), y0 + 2.05 * Math.cos(rad)], [x1, y1]])
      const hx = 1.15 * Math.sin(rad)
      const hy = 1.15 * Math.cos(rad)
      v.line(m, x0, y0, x0 + hx, y0, { color: v.color.velocity, dash: true, width: 1.3 })
      v.line(m, x0 + hx, y0, x0 + hx, y0 + hy, { color: v.color.force, dash: true, width: 1.3 })
      v.label(m, x0 + 0.34 * Math.sin(rad * 0.45), y0 + 0.34 * Math.cos(rad * 0.45) + 0.02, tag, { size: 14 })
      v.label(m, (x0 + x1) / 2 + 0.18, (y0 + y1) / 2 + 0.16, '耕索')
      return { x0, y0, x1, y1 }
    }
    drawPlow(0.55, 0)
    v.bar(m, 1.35, 0.42, 2.55, 0.42, { thick: 7 })
    drawRope(2.55, 0.42, p.alpha, 'α')
    v.label(m, 0.95, 0.95, '曲辕犁', { place: 'above' })

    drawPlow(6.15, 0)
    v.bar(m, 6.95, 0.42, 9.35, 0.42, { thick: 7 })
    v.line(m, 8.15, 0.18, 9.55, 0.18, { color: v.color.steel, dash: true, width: 1.1 })
    drawRope(9.35, 0.42, p.beta, 'β')
    v.label(m, 6.55, 0.95, '直辕犁', { place: 'above' })
  },
})
</Figure>

<ForceDiagram title="曲辕犁拉力的分解" size="narrow"
  surface={{type: "none"}}
  body={{shape: "knot", label: "曲辕犁"}}
  forces={[
    {label: "F", angle: "90 - alpha", magnitude: "F", showValue: true, unit: "N"}
  ]}
  decompose={{force: 0, axes: "xy", labels: ["F sinα", "F cosα"]}}
  guides={[{label: "竖直", angle: 90}]}
/>

<ForceDiagram title="直辕犁拉力的分解" size="narrow"
  surface={{type: "none"}}
  body={{shape: "knot", label: "直辕犁"}}
  forces={[
    {label: "F", angle: "90 - beta", magnitude: "F", showValue: true, unit: "N"}
  ]}
  decompose={{force: 0, axes: "xy", labels: ["F sinβ", "F cosβ"]}}
  guides={[{label: "竖直", angle: 90}]}
/>

<Plot title="分力随夹角的变化" size="wide"
  caption="同一大小的拉力，夹角越大，水平分力越大、竖直分力越小"
  x={{name: "th", label: "θ", unit: "°", min: 0, max: 90}}
  y={{label: "分力", unit: "N", min: 0, max: "F"}}
  series={[
    {label: "F sinθ", expr: "F*sin(deg(th))", color: "velocity"},
    {label: "F cosθ", expr: "F*cos(deg(th))", color: "force"}
  ]}
  marks={[
    {x: "alpha", label: "α"},
    {x: "beta", label: "β"}
  ]}
/>

拖动 $\alpha$、$\beta$ 时，只要仍有 $\alpha < \beta$，曲辕犁的竖直分力就比直辕犁大，水平分力就比直辕犁小。拉力大小只改变比例，不改变这一大小关系。C、D 比较的是作用力与反作用力，画面上看不到它们不相等。

## 答案

选 **B**。耕索对曲辕犁拉力的竖直分力比对直辕犁的大。

<Answer items={[{label: "答案", text: "B"}]} />
