---
title: 电路新元件：变压器、单刀双掷、恒流源、二极管
source: 内部演示
demo: true
---

稳恒电路按有效值求解。理想变压器只传递交流；电源写成发电机，不要用电池。

## 一、升压输电再降压

<Define name="nL" expr="4" />

<Circuit
  title="升压、输电线、降压、四盏灯"
  source={{ type: "generator", label: "E", emf: 220, r: 1, read: { I: "I1" } }}
  load={{
    type: "transformer", n1: 1, n2: 10, label: "升压",
    secondary: { series: [
      { type: "resistor", label: "输电线", R: 8, read: { I: "Iline" }, note: { expr: "Iline", unit: "A", digits: 2 } },
      { type: "transformer", n1: 10, n2: 1, label: "降压",
        secondary: { repeat: "nL", label: "共 {n} 盏", item: { type: "lamp", label: "灯", R: 40, read: { U: "UL" }, note: { expr: "UL", unit: "V", digits: 1 } } } },
    ] },
  }}
  current={{ expr: "I1", unit: "A", label: "I", digits: 2 }}
/>

<Readout items={[
  { label: "输电线电流", expr: "Iline", unit: "A", digits: 3 },
  { label: "每盏灯电压", expr: "UL", unit: "V", digits: 2 },
]} />

## 二、一个原线圈、两个副线圈

<Circuit
  title="安匝平衡"
  source={{ type: "generator", label: "e", emf: 100 }}
  load={{
    type: "transformer", n1: 10, label: "T",
    secondaries: [
      { n: 5, load: { type: "resistor", label: "R₁", R: 10, read: { U: "Ua" }, note: { expr: "Ua", unit: "V", digits: 0 } } },
      { n: 20, load: { type: "lamp", label: "L", R: 40, read: { U: "Ub" }, note: { expr: "Ub", unit: "V", digits: 0 } } },
    ],
  }}
/>

## 三、单刀双掷给电容充电再放电

<Param name="tc" label="时刻 t" unit="s" min={0} max={4} step={0.01} value={0.4} />

<Circuit
  title="S 先接 1 充电，t = 1 s 改接 2 放电"
  source={{ type: "wire" }}
  load={{ series: [
    { type: "capacitor", label: "C", C: 0.001, read: { U: "UC" }, note: { expr: "chg.UC(tc)", unit: "V", digits: 2 } },
    { spdt: [
      { series: [{ type: "battery", label: "E", emf: 6, positive: "right" }, { type: "resistor", label: "100 Ω", R: 100 }] },
      { type: "resistor", label: "1 kΩ", R: 1000 },
    ], position: "t < 1 ? 1 : 2", label: "S" },
  ] }}
  transient={{ name: "chg", until: 4, steps: 800, at: "tc" }}
/>

## 四、恒流源

<Circuit
  title="恒流源与电阻"
  source={{ type: "currentSource", label: "2 A", I: 2, read: { I: "Is" } }}
  load={{ type: "resistor", label: "5 Ω", R: 5, read: { U: "UR" }, note: { expr: "UR", unit: "V", digits: 1 } }}
  current={{ expr: "Is", unit: "A", label: "I" }}
/>

<Motion name="rod" label="导体棒" until={0.4} steps={400}
  bodies={[{ name: "ab", mass: 0.2, along: 0, x: 0, v: 0, forces: [
    { label: "F", angle: 0, magnitude: "0.5*Iab*0.4" },
  ] }]}
  circuit={{
    source: { type: "currentSource", label: "I₀ = 2 A", I: 2, read: "Iab" },
    load: { type: "resistor", label: "棒", R: 0.4 },
  }} />

<Circuit title="恒流源驱动的导体棒" motion="rod" at="0.2" current={{ expr: "rod.Iab(0.2)", unit: "A", label: "I" }} />

## 五、半波整流

<Param name="th" label="时刻 t" unit="s" min={0} max={0.08} step={0.001} value={0.008} />

<Circuit
  title="二极管只放正半周通过"
  source={{ type: "generator", label: "e", emf: "10*sin(100*t)" }}
  load={{ series: [
    { type: "diode", label: "D", read: { I: "Id" } },
    { type: "resistor", label: "10 Ω", R: 10, note: { expr: "rect.Id(th)", unit: "A", digits: 2 } },
  ] }}
  transient={{ name: "rect", until: 0.1, steps: 800, at: "th" }}
  current={{ expr: "rect.Id(th)", unit: "A", label: "I", digits: 2 }}
/>
