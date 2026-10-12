---
id: gd22-05
title: 高能级氢原子吸光子
source: 2022 广东卷 第 5 题（单选，4 分）
question: 目前科学家已经能够制备出能量量子数 n 较大的氢原子。氢原子第 n 能级的能量为 E_n = E_1/n^2，其中 E_1 = −13.6 eV。图是按能量排列的电磁波谱，要使 n = 20 的氢原子吸收一个光子后，恰好失去一个电子变成氢离子，被吸收的光子是（ ）
choice: A
answers:
  - { name: Eion, value: 0.034, unit: eV }
---

氢原子第 n 能级 $E_n = E_1/n^2$，$E_1 = -13.6\ \mathrm{eV}$。电离限取 $E_\infty = 0$。处在 n = 20 的原子要恰好失去一个电子，吸收的光子能量必须等于电离能

$$
E = 0 - E_{20} = -\frac{E_1}{20^2} = \frac{13.6}{400}\ \mathrm{eV} = 0.034\ \mathrm{eV}。
$$

题图的横轴是能量的对数刻度，四个波段按题图的画法分界：红外线从左端一直到 $10^0\ \mathrm{eV}$ 略偏右，可见光是 $10^0$ 与 $10^1$ 之间、靠近 $10^0$ 的窄带，紫外线接到约 $10^2\ \mathrm{eV}$，再往右是 X 射线。$0.034\ \mathrm{eV}$ 在 $10^{-2}$ 与 $10^{-1}$ 之间，深入红外线一侧，离可见光还有一个多数量级。

## 完整解答

电离能只由能级决定，与电子怎么离开无关：

$$
E = -E_{20} = -\frac{-13.6}{400} = 0.034\ \mathrm{eV}。
$$

$\boxed{0.034\ \mathrm{eV}}$，落在红外线波段。

**A. 红外线波段的光子 —— 正确。** $0.034\ \mathrm{eV}$ 介于 $10^{-2}\ \mathrm{eV}$ 与 $10^{-1}\ \mathrm{eV}$ 之间，按题图就在红外线段里。

**B. 可见光波段的光子 —— 错误。** 题图里可见光是靠近 $10^0\ \mathrm{eV}$、夹在 $10^0$ 与 $10^1$ 之间的窄带，光子能量约 $1\sim3\ \mathrm{eV}$，比 $0.034\ \mathrm{eV}$ 大一个多数量级。

**C. 紫外线波段的光子 —— 错误。** 紫外线在可见光右侧，一直延伸到约 $10^2\ \mathrm{eV}$，能量更大。

**D. X 射线波段的光子 —— 错误。** X 射线从约 $10^2\ \mathrm{eV}$ 一直到横条右端，比这个电离能大三个多数量级。

注意 n 很大时电离能很小：基态电离要 $13.6\ \mathrm{eV}$，落在紫外线；n = 20 只要 $0.034\ \mathrm{eV}$。不能拿基态的印象去套高能级。

## 交互演示

拖动 n，电离能 $E = -E_1/n^2$ 随着变，光子在题图那条对数能量轴上移动。题目取 n = 20。波段分界按题图取：可见光 $1.6\sim3.1\ \mathrm{eV}$，紫外线到 $100\ \mathrm{eV}$，再往右是 X 射线；左端画到 $10^{-2}\ \mathrm{eV}$ 略偏左。能级图只画出 n = 20 和电离限附近，基态 $-13.6\ \mathrm{eV}$ 不在这张图上。

<Param name="n" label="能级" symbol="n" value={20} min={2} max={40} step={1} control="stepper" />

<Param name="E1" value={-13.6} hidden />

<Define name="Eion" expr="-E1/n^2" />

<Define name="En" expr="E1/n^2" />

<Question text="A. 红外线波段的光子" set={{n: 20}} hint="0.034 eV 在 10^-2 与 10^-1 之间" />

<Question text="B. 可见光波段的光子" set={{n: 3}} hint="可见光靠近 10^0 eV，n = 20 差一个多数量级" />

<Question text="C. 紫外线波段的光子" set={{n: 2}} hint="紫外线从可见光右侧一直到约 10^2 eV" />

<Question text="D. X 射线波段的光子" set={{n: 2}} hint="X 射线从约 10^2 eV 开始，比 0.034 eV 大三个多数量级" />

<Preset label="题目：n = 20" set={{n: 20}} />

<Status cases={[
  {when: "Eion < 1.6", label: "红外线", tone: "success"},
  {when: "Eion < 3.1", label: "可见光", tone: "info"},
  {when: "Eion < 100", label: "紫外线", tone: "warning"},
  {label: "X 射线", tone: "danger"}
]} />

<Readout items={[
  {label: "该能级能量", symbol: "E_n", expr: "En", unit: "eV", digits: 4, color: "field"},
  {label: "电离所需光子", symbol: "E", expr: "Eion", unit: "eV", digits: 4, color: "charge"}
]} />

<Answer items={[
  {label: "答案", text: "A"},
  {label: "电离能", symbol: "E", expr: "Eion", value: 0.034, unit: "eV", digits: 3}
]} />

<EnergyLevels
  title="n = 20 吸收光子后电离"
  size="wide"
  levels={[
    {n: 18, E: "E1/324"},
    {n: 19, E: "E1/361"},
    {n: 20, E: "E1/400", label: "n = 20"},
    {n: "∞", E: 0, label: "电离限"}
  ]}
  transitions={[{from: 20, to: "∞", label: "吸收"}]}
  select={0}
  note="只画 n = 20 附近；基态 −13.6 eV 远在图外"
/>

<Figure title="按能量排列的电磁波谱" size="wide" height={250} params={["Eion"]} note="横轴是对数刻度；波段分界按题图，可见光 1.6–3.1 eV，紫外线到 100 eV">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2.5, xmax: 3.7, ymin: -1.7, ymax: 2.3 })
    const y0 = 0.55
    const y1 = 1.85
    const xL = -2.15
    const xR = 3.35
    const xOf = (e) => Math.log10(e)
    const ir = xOf(1.6)
    const vis = xOf(3.1)
    const uv = 2
    const band = (x1, x2, fill) => v.rect(m, x1, y0, x2 - x1, y1 - y0, { fill, color: v.color.ink })
    band(xL, ir, v.color.stage)
    band(ir, vis, v.color.enamel)
    band(vis, uv, v.color.steel)
    band(uv, xR, v.color.graphite)
    v.line(m, ir, y0, ir, y1, { color: v.color.ink, dash: true })
    v.line(m, vis, y0, vis, y1, { color: v.color.ink, dash: true })
    v.line(m, uv, y0, uv, y1, { color: v.color.ink, dash: true })
    const mid = (a, b) => (a + b) / 2
    v.label(m, mid(xL, ir), mid(y0, y1), '红外线')
    v.label(m, mid(ir, vis), y1 + 0.34, '可见光')
    v.label(m, mid(vis, uv), mid(y0, y1), '紫外线')
    v.label(m, mid(uv, xR), mid(y0, y1), 'X射线')
    const ticks = [0.01, 0.1, 1, 10, 100, 1000]
    const names = ['10^-2', '10^-1', '10^0', '10^1', '10^2', '10^3']
    ticks.forEach((e, i) => {
      const x = xOf(e)
      v.line(m, x, -0.12, x, 0.12, { color: v.color.ink })
      v.label(m, x, -0.55, names[i])
    })
    v.line(m, xL, 0, xR, 0, { color: v.color.ink })
    v.label(m, mid(xL, xR), -1.25, '能量 (eV)')
    const e = Math.min(2000, Math.max(0.006, p.Eion))
    const x = xOf(e)
    v.arrow(m, x, -1.55, x, 0.28, { color: v.color.charge })
    v.label(m, x, -1.55, 'E')
  },
})
</Figure>

## 结合图像

电离能随 n 按 $1/n^2$ 下降。n = 2 时 $3.4\ \mathrm{eV}$，刚过可见光进入紫外线；n = 3 时约 $1.5\ \mathrm{eV}$，落在红外一侧、紧贴可见光；n = 20 时只剩 $0.034\ \mathrm{eV}$，指针深入红外线。能级图上那一跳从 n = 20 指向电离限，跨过的就是这个光子。
