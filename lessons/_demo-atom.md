---
title: 光谱、玻尔轨道与光电管
source: 浙江卷专题十一
demo: true
---

巴耳末线的波长由能级差算出，λ = 1240/ΔE（nm）。选一条跃迁，谱线、电子所在轨道和光子一起变。轨道按 n 压缩着画，真实半径在表里。

<Param name="pick" label="选中的跃迁" options={[
  { value: 0, label: "Hδ  6→2" },
  { value: 1, label: "Hγ  5→2" },
  { value: 2, label: "Hβ  4→2" },
  { value: 3, label: "Hα  3→2" },
]} value={3} />

<EnergyLevels
  title="氢原子巴耳末线系"
  count={6}
  transitions={[
    { from: 6, to: 2, label: "H_{δ}" },
    { from: 5, to: 2, label: "H_{γ}" },
    { from: 4, to: 2, label: "H_{β}" },
    { from: 3, to: 2, label: "H_{α}" },
  ]}
  select="pick"
  spectrum
  orbits
/>

同一组跃迁落在连续谱上，就是吸收光谱：亮线换成暗线，位置仍由 ΔE 决定。

<EnergyLevels
  title="巴耳末吸收光谱"
  count={6}
  transitions={[
    { from: 6, to: 2, label: "H_{δ}" },
    { from: 5, to: 2, label: "H_{γ}" },
    { from: 4, to: 2, label: "H_{β}" },
    { from: 3, to: 2, label: "H_{α}" },
  ]}
  select="pick"
  spectrum
  absorption
/>

## 光电管的遏止电压

滑动变阻器接成分压：滑片靠近 a（s 小）时反向电压大，光电流为零；滑过遏止电压后电流沿直线上升，到 b 端接近饱和。波长或逸出功一变，U_c 和 E_k 按爱因斯坦方程重算，E_k = hν − W，hν < W 时两者都是 0，电流始终为 0。

<Param name="s" label="滑片位置 s（0 靠近 a）" min={0} max={1} step={0.01} value={0.85} />
<Param name="lam" label="入射光波长" min={360} max={650} step={5} value={480} unit="nm" />
<Param name="W" label="阴极逸出功" min={1.4} max={3.2} step={0.05} value={2} unit="eV" />
<Define name="Isat" expr="2e-6" />

<Circuit
  title="分压给光电管加反向电压"
  source={{ type: "battery", label: "E", emf: 3, positive: "right" }}
  load={{ series: [
    { type: "resistor", label: "a", R: "s*900+30" },
    { parallel: [
      { type: "resistor", label: "b", R: "(1-s)*900+30" },
      { series: [
        { type: "phototube", label: "光电管", reverse: true, lambda: "lam", W: "W", Isat: "Isat", read: { I: "I", U: "U", Uc: "Uc", Ek: "Ek" }, note: { expr: "U", unit: "V", digits: 2 } },
        { type: "ammeter", label: "μA" },
      ] },
    ] },
  ] }}
/>

<Readout items={[
  { label: "阳极电压 U_AK", expr: "U", unit: "V", digits: 3 },
  { label: "光电流 I", expr: "I*1e6", unit: "μA", digits: 2 },
  { label: "遏止电压 U_c", expr: "Uc", unit: "V", digits: 3 },
  { label: "最大初动能 E_k", expr: "Ek", unit: "eV", digits: 3 },
]} />

<Plot
  title="光电管伏安特性（示意折线）"
  x={{ name: "u", label: "U_{AK}", unit: "V", min: -3.2, max: 0.6 }}
  y={{ label: "I", unit: "μA", min: 0, max: 2.4 }}
  series={[{ label: "I", expr: "Uc < 1e-9 ? 0 : 1e6 * Isat * clamp((u + Uc) / Uc, 0, 1)" }]}
  marks={[{ x: "-Uc", label: "遏止" }]}
  cursor="U"
/>
