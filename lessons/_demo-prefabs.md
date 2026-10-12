---
title: 预制组件演示：受力图与电路图
source: 内部演示
demo: true
---

## 一、斜面上静止的物块

<Param name="theta" label="斜面倾角 θ" min={0} max={60} step={1} value={30} unit="°" />
<Param name="mu" label="动摩擦因数 μ" min={0} max={1} step={0.05} value={0.6} />
<Define name="m" expr="2" />
<Define name="g" expr="10" />
<Define name="G" expr="m*g" />
<Define name="N" expr="m*g*cos(deg(theta))" />
<Define name="fNeed" expr="m*g*sin(deg(theta))" />
<Define name="fMax" expr="mu*N" />
<Define name="f" expr="min(fNeed, fMax)" />

<ForceDiagram
  title="物块受力（沿斜面正交分解重力）"
  surface={{ type: "incline", angle: "theta", angleLabel: "θ" }}
  body={{ shape: "block", label: "m" }}
  forces={[
    { label: "G", angle: -90, magnitude: "G", showValue: true, unit: "N" },
    { label: "N", angle: "90 + theta", magnitude: "N", showValue: true, unit: "N" },
    { label: "f", angle: "theta", magnitude: "f", showValue: true, unit: "N" },
  ]}
  decompose={{ force: 0, axes: "incline", labels: ["mg sinθ", "mg cosθ"] }}
/>

<Status cases={[
  { when: "fNeed <= fMax", label: "静摩擦力足够，物块静止", tone: "success" },
  { label: "需要的摩擦力超过最大静摩擦力，物块下滑", tone: "warning" },
]} />

## 二、发电机给并联电热器供电

<Param name="n" label="电热器只数 n" min={1} max={10} step={1} value={4} />
<Define name="E" expr="250" />
<Define name="r" expr="0.5" />
<Define name="Rh" expr="200^2/1000" />
<Define name="Rtot" expr="r + 2 + Rh/n" />
<Define name="I" expr="E/Rtot" />
<Define name="U" expr="I*Rh/n" />

<Circuit
  title="电路图"
  source={{ series: [ { type: "generator", label: "E = 250 V" }, { type: "resistor", label: "r = 0.5 Ω" } ] }}
  load={{ series: [
    { type: "resistor", label: "R₁ = 1 Ω" },
    { repeat: "n", label: "共 {n} 只", item: { type: "heater", label: "40 Ω", note: { expr: "U", unit: "V", prefix: "U = " } } },
    { type: "resistor", label: "R₂ = 1 Ω" },
    { type: "switch", label: "S", closed: true },
  ] }}
  current={{ expr: "I", unit: "A", label: "I" }}
/>

<Readout items={[
  { label: "干路电流 I", expr: "I", unit: "A", digits: 2 },
  { label: "电热器电压 U", expr: "U", unit: "V", digits: 1 },
]} />
