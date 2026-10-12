---
id: wiring-solve
layer: L2
title: 实物图电路求解
related:
  - wiring
  - circuit-solve
---

给电池写电动势和内阻后，按图上的接线求解。

<!-- region:wiring-solve -->
**电路求解（推荐）**：给 `battery` 写上 `emf`（和 `r`），给各元件写上阻值，组件就按图上真实的接线用节点电压法解电路：指针偏转、灯的亮度、各元件电流电压都是算出来的，不要再手写 `I = E/(R + r)`、分压分流公式。

- `read` 把解出来的量交给页面其他部分：电表写 `read: "IA"` 发布读数；任何元件可写 `read: {I: "I1", U: "U1", P: "P1"}`。这些名字和 Define 一样能被 `<Readout>`、`<Status>`、`<Plot>`、`answers` 使用，校验时会用求解结果核对 `answers`。
- 求解模式下不要再给电表写 `value`、给灯写 `lit`（校验会报错）。
- 图上自动提示接线错误：电表正负接反、超过所接量程、电源被导线或电流表短路。校验时初始参数下出现这些提示会列为提醒。
- 带 `answer` 的待连导线：图上没显示答案时按已画出的导线求解（电压表读 0），`read` 发布的是全部接好后的值。

```
<Wiring parts={[
  {id: "E", type: "battery", emf: 3, r: 0.5},
  {id: "A", type: "ammeter", r: 0.1, read: "IA"},
  {id: "V", type: "voltmeter", r: 3000, read: "UV"},
  {id: "R", type: "rheostat", R: 20, slider: "sd"},
  {id: "Rx", type: "resistor", R: 5}, ...
]} wires={[...]} />
<Readout items={[{label: "测量值", symbol: "R_测", expr: "UV/IA", unit: "Ω"}]} />
```

布局建议：电表放上排，待测电阻放中排左侧，变阻器放中排右侧，电源和开关放在变阻器正下方（主回路三根线都很短、不交叉）；电压表正接线柱接电流流入待测电阻的一端，两根表线就不会交叉。


<!-- /region -->
