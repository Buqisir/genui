---
id: gd21-16
title: 注射器向药瓶注入气体
source: 2021 广东卷 第 16 题（选考·选修 3-3，计算；选考共 12 分，原卷未单列本题分值）
question: 为方便抽取密封药瓶里的药液，护士一般先用注射器注入少量气体到药瓶里后再抽取药液，如图所示，某种药瓶的容积为 0.9 mL，内装有 0.5 mL 的药液，瓶内气体压强为 1.0×10^5 Pa，护士把注射器内横截面积为 0.3 cm^2、长度为 0.4 cm、压强为 1.0×10^5 Pa 的气体注入药瓶，若瓶内外温度相同且保持不变，气体视为理想气体，求此时药瓶内气体的压强。
answers:
  - { name: p, value: 1.3e5, unit: Pa }
---

注入前，瓶内气体和注射器内气体分开。瓶容 0.9 mL、药液 0.5 mL，瓶内气体体积是 0.4 mL；注射器气柱的体积是横截面积乘以长度。两部分压强都是 $1.0\times10^{5}\,\mathrm{Pa}$，温度相同且注入过程中保持不变。

注入后，注射器里那一段气体全部进入药瓶，与瓶内原有气体混合。药液体积不变，瓶内气体占据的仍是瓶容减去药液体积，即 0.4 mL。气体视为理想气体，温度不变，混合后满足 $pV=nRT$ 的比例关系：压强与体积之积与气体的物质的量成正比。

## 完整解答

体积统一换成 mL。注射器横截面积 $0.3\,\mathrm{cm}^{2}$、气柱长 $0.4\,\mathrm{cm}$，

$$
V_{\mathrm{s}}=0.3\times0.4=0.12\,\mathrm{mL}
$$

瓶内原有气体的体积

$$
V_{\mathrm{b}}=0.9-0.5=0.4\,\mathrm{mL}
$$

两部分初态压强相同，记为 $p_{0}=1.0\times10^{5}\,\mathrm{Pa}$。注入后气体仍占据 $V_{\mathrm{b}}$，温度不变，由 $pV\propto n$，

$$
p V_{\mathrm{b}}=p_{0}V_{\mathrm{b}}+p_{0}V_{\mathrm{s}}
$$

$$
p=p_{0}\frac{V_{\mathrm{b}}+V_{\mathrm{s}}}{V_{\mathrm{b}}}=1.0\times10^{5}\times\frac{0.4+0.12}{0.4}=1.3\times10^{5}\,\mathrm{Pa}
$$

$$
\boxed{1.3\times10^{5}\,\mathrm{Pa}}
$$

## 交互演示

拖动「已注入的气柱长度」，看注射器里的气体逐步进入药瓶。瓶内气体体积始终是瓶容减去药液，物质的量随注入量增加，所以压强上升。注入到题目给定的 0.4 cm 时，压强到达 $1.3\times10^{5}\,\mathrm{Pa}$。

药瓶、针筒的宽度是为看清形状放大的，不按体积比例。体积和压强以侧栏读数为准。

<Param name="L" label="已注入的气柱长度" symbol="L" value={0.4} min={0} max={0.4} step={0.01} unit="cm" digits={2} color="velocity" />

<Param name="L0" label="注射器气柱原长" value={0.4} hidden />

<Param name="S" label="注射器横截面积" value={0.3} hidden unit="cm²" />

<Param name="Vbottle" label="药瓶容积" value={0.9} hidden unit="mL" />

<Param name="Vliq" label="药液体积" value={0.5} hidden unit="mL" />

<Param name="p0" label="初态压强" value={1e5} hidden unit="Pa" />

<Define name="Vs0" expr="S*L0" />

<Define name="Vs" expr="S*L" />

<Define name="Vb" expr="Vbottle-Vliq" />

<Define name="p" expr="p0*(Vb+Vs)/Vb" />

<Define name="frac" expr="L/L0" />

<Question text="注入后，药瓶内气体的压强是多少？" set={{L: 0.4}} hint="体积不变，物质的量变为两部分之和" />

<Preset label="注入前" set={{L: 0}} />

<Preset label="题目状态：全部注入" set={{L: 0.4}} />

<Status cases={[
  {when: "L < 0.01", label: "尚未注入，瓶内压强仍为大气压", tone: "neutral"},
  {when: "L < 0.39", label: "正在注入，瓶内压强随气量上升", tone: "info"},
  {label: "全部注入，压强为 1.3×10⁵ Pa", tone: "success"}
]} />

<Readout items={[
  {label: "瓶内气体体积", symbol: "V_b", expr: "Vb", unit: "mL", digits: 2},
  {label: "已注入体积", symbol: "V", expr: "Vs", unit: "mL", digits: 3, color: "velocity"},
  {label: "瓶内压强", symbol: "p", expr: "p", unit: "Pa", format: "sci", color: "force"}
]} />

<Answer items={[
  {label: "瓶内气体压强", symbol: "p", expr: "p", value: 130000, unit: "Pa", format: "sci"}
]} />

<Figure title="注射器与药瓶" height={440} size="wide" params={["L", "frac", "p", "Vb", "Vs"]} note="瓶与针筒的宽度不按比例；气体深浅表示相对初态的压强" hud={[{symbol: "p", label: "瓶内压强", expr: "p", unit: "Pa", format: "sci"}]} legend={[{kind: "force", label: "气体压强"}, {kind: "velocity", label: "正在注入的气体"}]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2.6, xmax: 3.4, ymin: -0.35, ymax: 6.35, equal: true })
    const rho = p.p / 1e5
    const left = p.L > 0.005
    const remain = 1 - p.frac

    // 瓶身在上，瓶塞在瓶口处；针头从下方扎进瓶塞。宽度为看清放大，不按体积比例。
    v.vessel(m, [{ bottle: { x1: -1.15, x2: 1.15, y1: 3.15, y2: 4.85, neck: { w: 0.46, h: 0.34 }, shoulder: 0.18, open: false } }], {
      fills: [
        { x1: -1.15, y1: 3.15, x2: 1.15, y2: 3.95, kind: 'water' },
        { x1: -1.15, y1: 3.95, x2: 1.15, y2: 5.34, kind: 'gas', density: rho, count: 26, temp: 1 },
      ],
    })
    v.block(m, 0, 5.05, 0.78, 0.2)

    const gasTop = 0.18 + 1.7 * remain
    v.tube(m, {
      x: 0,
      y: 0.12,
      angle: 90,
      wall: 5,
      sections: [{ from: 0, to: 2.35, r: 0.42 }],
      gas: { from: 0.18, to: Math.max(gasTop, 0.2), count: left ? Math.max(3, Math.round(16 * remain)) : 16, density: 1, temp: 1 },
      pistons: [{ at: Math.max(gasTop, 0.2) + 0.08 }],
    })
    v.vessel(m, [{ capillary: { x: 0, y1: 2.47, y2: 5.12, w: 0.09 } }])

    v.label(m, -1.7, 4.55, '瓶内气体')
    v.label(m, 1.7, 3.55, '药液')
    v.label(m, -1.25, 1.0, left ? '残余气体' : '注射器气体')
    v.label(m, 1.15, 5.15, '瓶塞')
    v.dim(m, 0.72, 0.3, 0.72, Math.max(gasTop, 0.2) + 0.16, 'L', { offset: 22 })
  },
})
</Figure>

<Plot title="瓶内压强随注入量变化" size="narrow" caption="温度、瓶内气体体积不变，压强与气体总量成正比"
  x={{name: "x", label: "已注入体积 V", unit: "mL", min: 0, max: 0.12}}
  y={{label: "p", unit: "Pa", min: 0.95e5, max: 1.4e5}}
  series={[{label: "p", expr: "p0*(Vb+x)/Vb", color: "force"}]}
  marks={[{x: "S*L0", label: "全部注入，1.3×10⁵ Pa"}]}
  cursor="Vs"
/>

## 结合图像看关键点

横轴是已注入的体积，纵轴是瓶内压强。因为 $V_{\mathrm{b}}$ 不变，图线是一条直线：注入量从 0 增到 0.12 mL，压强从 $1.0\times10^{5}\,\mathrm{Pa}$ 升到 $1.3\times10^{5}\,\mathrm{Pa}$。游标停在右端时，对应题目所问的状态。

## 答案

注入后药瓶内气体的压强为 $1.3\times10^{5}\,\mathrm{Pa}$。
