---
id: fx-slope
title: 斜面下滑
question: 物块从光滑斜面顶端由静止滑下，到底端时速度 v 多大？
answers:
  - { name: v, value: 7.746 }
---

光滑斜面高 3 m，取 g = 10 m/s²。

<Param name="h" label="高度" min={1} max={10} step={1} value={3} unit="m" />

<Sim title="斜面下滑" height={240}>
sim({
  setup(s) {
    s.body
  },
})

<Readout items={[{label: "末速度", expr: "v", unit: "m/s"}]} />
<Define name="v" expr="sqrt(2*10*h)" label="末速度" unit="m/s" />
