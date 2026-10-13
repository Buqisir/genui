---
id: gd21-15
title: 下飞机后的矿泉水瓶
source: 2021 广东卷 第 15 题（选考·选修 3-3，填空；选考共 12 分，原卷未单列本题分值）
question: 在高空飞行的客机上某乘客喝完一瓶矿泉水后，把瓶盖拧紧。下飞机后发现矿泉水瓶变瘩了，机场地面温度与高空客舱内温度相同。由此可判断，高空客舱内的气体压强 ______（选填“大于”、“小于”或“等于”）机场地面大气压强：从高空客舱到机场地面，矿泉水瓶内气体的分子平均动能 ______（选填“变大”、“变小”或“不变”）。
answers:
  - { name: p1, value: 0.8, unit: p0 }
  - { name: Ek, value: 1, unit: Ek1 }
---

瓶盖拧紧后，瓶内空气被封闭，质量不变。下飞机后瓶子变瘩，说明瓶外压强大于瓶内压强，瓶壁被压向里侧，瓶内气体体积减小。机场地面温度与高空客舱温度相同，这一段是等温、质量不变的压缩。

题目只给出大小关系。下面取代表性数值：把机场地面大气压强记为 $p_0$，高空客舱内压强取 $0.8\,p_0$；温度取 $293\,\mathrm{K}$（20 ℃），两处相同。滑块上的体积是相对客舱初态的倍数，瓶子形状不按比例。

## 完整解答

瓶盖拧紧时，瓶内气体与客舱内气体处于平衡，压强都是 $p_1$，温度都是 $T$，体积记为 $V_1$。下飞机后瓶外是机场地面大气压强 $p_0$，瓶壁软，被压瘩后瓶内压强也变成 $p_2 = p_0$，体积变成 $V_2$，温度仍是 $T$。

封闭气体质量不变，且两处温度相同，由玻意耳定律

$$
\frac{p_1 V_1}{T} = \frac{p_2 V_2}{T}
\quad\Rightarrow\quad
\frac{V_2}{V_1} = \frac{p_1}{p_0}.
$$

瓶子变瘩，即 $V_2 < V_1$，所以 $p_1 < p_0$。高空客舱内的气体压强 $\boxed{\text{小于}}$ 机场地面大气压强。

取 $p_1 = 0.8\,p_0$时，体积变成原来的 $0.8$ 倍。若两处压强相等，体积应该不变，瓶子不会变瘩。

理想气体分子的平均动能只由温度决定：

$$
\overline{E_\mathrm{k}} = \frac{3}{2} k T.
$$

从客舱到地面 $T$ 不变，所以瓶内气体的分子平均动能 $\boxed{\text{不变}}$。体积减小只使分子更密，碰撞更频繁，不改变每个分子的平均动能。

## 交互演示

拖动「位置」，看瓶子从客舱到地面怎么变瘩。瓶内压强一直跟着瓶外压强，温度不变，体积按 $V/V_1 = p_1/p$ 缩小。右边的分子盒子显示同一温度下的速率分布：温度没变，分布不动，只是单位体积里的分子更密。

<Param name="s" label="位置" symbol="s" value={0} min={0} max={1} step={0.01} />

<Param name="p1" label="客舱压强" symbol="p_1" value={0.8} min={0.6} max={1} step={0.01} unit="p0" color="field" />

<Param name="T" label="温度" symbol="T" value={293} min={273} max={313} step={1} unit="K" hidden />

<Define name="pOut" expr="p1 + (1 - p1)*s" />

<Define name="pIn" expr="pOut" />

<Define name="ratio" expr="p1/pOut" />

<Define name="Ek" expr="1" />

<Question text="高空客舱内的气体压强与机场地面大气压强比，大于、小于还是等于？" set={{s: 1, p1: 0.8}} hint="瓶子变瘩，温度却没变" />

<Question text="从高空客舱到机场地面，瓶内气体的分子平均动能变大、变小还是不变？" set={{s: 1, p1: 0.8}} hint="平均动能只由温度决定" />

<Preset label="题目：地面，瓶子变瘩" set={{s: 1, p1: 0.8}} />

<Preset label="客舱内，瓶子正常" set={{s: 0, p1: 0.8}} />

<Preset label="若两处压强相等" set={{s: 1, p1: 1}} />

<Status cases={[
  {when: "s < 0.02", label: "客舱内：瓶内外压强都是 p1", tone: "info"},
  {when: "p1 > 0.995", label: "两处压强相等，体积不变，瓶子不瘩", tone: "neutral"},
  {when: "s > 0.98", label: "地面：瓶外压强更大，瓶子变瘩", tone: "warning"},
  {label: "下降中：瓶外压强升高，体积缩小", tone: "info"}
]} />

<Readout items={[
  {label: "瓶外压强", symbol: "p", expr: "pOut", unit: "p0", digits: 2, color: "field"},
  {label: "瓶内体积", symbol: "V/V_1", expr: "ratio", digits: 2, color: "velocity"},
  {label: "平均动能", symbol: "Ek/Ek1", expr: "Ek", digits: 0, color: "charge"}
]} />

<Answer items={[
  {label: "客舱压强与地面比", text: "小于"},
  {label: "分子平均动能", text: "不变"},
  {label: "代表性初压强", symbol: "p_1", expr: "p1", value: 0.8, unit: "p0", digits: 2},
  {label: "平均动能倍数", symbol: "Ek/Ek1", expr: "Ek", value: 1, digits: 0}
]} />

<Figure title="矿泉水瓶" height={320} size="wide" params={["s", "ratio"]} note="瓶子形状不按比例；瓶内分子疏密表示体积倍数 V/V1" hud={[{symbol: "V/V_1", expr: "ratio", digits: 2}]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 10, ymin: 0, ymax: 6.2, equal: true })
    v.ground(m, 0.4, 9.6, 0.55)

    function bottle(cx, dent) {
      const bodyW = 1.7 - 0.55 * dent
      const bodyH = 3.15 - 0.85 * dent
      const y1 = 0.55
      const x1 = cx - bodyW / 2
      const x2 = cx + bodyW / 2
      const y2 = y1 + bodyH
      const gas = v.vessel(m, [
        { bottle: { x1, x2, y1, y2, neck: { w: 0.42, h: 0.55 }, shoulder: 0.42 } },
      ], {
        fills: [{ kind: 'gas', y: y2 + 0.5, density: 1 / p.ratio, count: 26 }],
      })
      const mouth = gas.mouth
      v.block(m, mouth.x, mouth.y + 0.13, 0.62, 0.26, { pivot: 'center', shadow: false })
      v.label(m, cx, y2 + 1.15, dent < 0.15 ? '客舱' : '地面')
    }

    bottle(2.5, 0)
    bottle(7.2, 1 - p.ratio)
    v.arrow(m, 4.15, 2.3, 5.55, 2.3, { color: v.color.steel })
  },
})
</Figure>

<GasBox title="瓶内空气分子" size="narrow" T="T" gas="N2" count={80} compare={293} note="温度与客舱相同，速率分布不变" />

<Plot title="等温压缩" size="wide" caption="质量不变、温度不变时 pV = 常数"
  x={{label: "V/V_1", min: 0.55, max: 1.08}}
  y={{label: "p/p_0", min: 0.55, max: 1.15}}
  series={[{label: "pV = p1 V1", x: "p1/u", expr: "u", over: {name: "u", min: 0.6, max: 1}, color: "field", point: "pOut"}]}
  marks={[{x: "p1", label: "客舱"}, {x: "ratio", label: "此刻"}]}
/>

## 结合图像看

左瓶是客舱里的初态，体积为 $V_1$。右瓶跟着下降滑块：瓶外压强从 $p_1$ 升到 $p_0$，瓶身收窄、变矮，瓶内分子变密。把客舱压强拖到 $p_0$，右瓶和左瓶一样大，瓶子不再变瘩，这就是「若两处压强相等」的对照。

$p$–$V$ 图是一段等温线。游标从右下角的客舱状态移到左上角的地面状态：压强升高、体积减小，乘积不变。

分子盒子里温度一直是 $293\,\mathrm{K}$。直方图和麦克斯韦曲线都不随位置改变，最概然速率、平均速率、方均根速率都不动，所以平均动能不变。

## 答案

高空客舱内的气体压强 $\boxed{\text{小于}}$ 机场地面大气压强；瓶内气体的分子平均动能 $\boxed{\text{不变}}$。
