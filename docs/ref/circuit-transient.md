---
id: circuit-transient
layer: L2
title: 暂态电路
related:
  - circuit
  - circuit-solve
  - motion
---

电容充放电、自感、振荡和交流，按时间积分。

<!-- region:circuit-transient -->
**暂态（电容充放电、自感、LC 振荡、交流）**：写 `transient` 后组件把每个电容的电压、每个线圈的电流当成随时间变化的状态，每一瞬间按基尔霍夫定律解一次电路，再用 `<Motion>` 的积分器积分。开关、电动势可以写 `t` 的表达式：`closed: "t >= 1"` 表示 t = 1 s 时闭合（开关时刻会被精确定位），`emf: "Em*sin(w*t)"` 是交流电源。纯电阻的交流电路（没有电容、线圈）也可以写 `transient`，结果就是每一瞬间的读数；但电路里既没有电容、线圈，也没有随 `t` 变化的电动势或开关时会报错（那是稳恒电路，直接写 `read`）。

```
<Circuit
  source={{series: [{type: "battery", emf: 8}, {type: "switch", label: "S→1", closed: "t < 0"}]}}
  load={{parallel: [
    {type: "capacitor", label: "C", C: "Cu*1e-6", read: {U: "UC", Q: "QC"}},
    {series: [{type: "switch", label: "S→2", closed: "t >= 0"}, {type: "ammeter", read: "IA"}, {type: "resistor", R: 2000}]}
  ]}}
  transient={{name: "dis", until: 20, at: "tc", events: [{name: "tHalf", when: "UC - 4", dir: "down"}], read: {I0: "IA @ 0"}}} />
```

| `transient` 的键 | 说明 |
|---|---|
| `name` | 必填。结果以 `<Motion>` 的方式发布：`dis.UC(t)`、`dis.IA(t)`……每个 `read` 名字都是时间的函数，`dis.tEnd` 是结束时刻。暂态里 `read` 名字**不再**是单独的数，要写成 `dis.UC(tc)` |
| `until` | 必填，计算到哪一时刻（s） |
| `steps` | 积分步数（默认 800，50–20000）。步长要比最小的时间常数 RC、L/R 小得多 |
| `at` | 电路图画在哪一时刻（一个滑块或 Sim 的时钟，默认 0）：开关的位置、`note` 里的 `read` 名字、灯泡亮度都取这一时刻的值 |
| `events` | 同 `<Motion>` 的 `events`（`name`、`when`、`dir`、`stop`，没有 `set`），`when` 里可以用 `t` 和 `read` 名字，例如电压减半的时刻 |
| `read` | 同 `<Motion>` 的 `read`：`"IA @ 0"`、`"max(IA)"`、`"min(IA)"` |

开始状态：t < 0 时电路已经按 t < 0 的开关位置稳定了很久——电容电压、线圈电流取那时的稳定值（开关一直断开的电容不带电）。电容写 `U0`、线圈写 `I0` 时按写的值开始。所以「闭合开关给电容充电」写 `closed: "t > 0"`，不要写 `closed: true`（那表示 t < 0 时就已经充满）。

注意：理想电源直接接电容、回路里几乎没有电阻时充电是瞬间完成的，积分会报「时间常数太小」——要看过程就把电阻写出来。断开线圈所在电路时要给线圈电流留一条回路（例如并联的灯泡），否则求解器会报错（实际会产生电火花）。暂态电路里电容、线圈、二极管不能放在 `repeat` 里。二极管的通断和开关一样被定位到那一瞬间：正向电流降到 0 时截止，正向电压升到 0 时导通。单刀双掷的 `position` 写成含 `t` 的表达式时，两档的切换同样被定位。


<!-- /region -->
