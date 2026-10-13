---
id: r6-03-hydrogen-levels
title: 氢原子能级跃迁与钙的光电效应
subject: physics
topic: 氢原子能级与光电效应
source: "2021 天津模拟（第 2、3 问改成问答）"
question: |
  （2021·天津模拟）氢原子的能级为：E₁=−13.6 eV，E₂=−3.4 eV，E₃=−1.51 eV，E₄=−0.85 eV，E∞=0。大量处于 n=4 能级的氢原子向低能级跃迁时发出不同频率的光，用这些光照射金属钙，金属钙的逸出功为 3.20 eV。
  (1) 这些氢原子最多能发出多少种不同频率的光？各光子的能量分别是多少？
  (2) 其中能使金属钙发生光电效应的光有几种？
  (3) 从金属钙表面打出的光电子，最大初动能的最大值是多少？
answers:
  - { name: nKind, value: 6, unit: 种 }
  - { name: dE41, value: 12.75, unit: eV }
  - { name: dE31, value: 12.09, unit: eV }
  - { name: dE21, value: 10.2, unit: eV }
  - { name: dE42, value: 2.55, unit: eV }
  - { name: dE32, value: 1.89, unit: eV }
  - { name: dE43, value: 0.66, unit: eV }
  - { name: nPE, value: 3, unit: 种 }
  - { name: EkMax, value: 9.55, unit: eV }
---

## 一、题目条件分析

- 能级零点在无穷远：$E_\infty = 0$。题目给出的束缚态为 $E_1 = -13.6\ \text{eV}$，$E_2 = -3.4\ \text{eV}$，$E_3 = -1.51\ \text{eV}$，$E_4 = -0.85\ \text{eV}$。计算时用这些给定值，不再把 $E_3$ 改写成 $-13.6/9$ 的更多位小数。
- 大量原子处在 $n = 4$，会经中间能级再往下跳。两个能级之间最多一条谱线，种数是组合数 $C_4^2$。
- 光子能量取较高能级减去较低能级，结果为正：$h\nu = E_{\text{高}} - E_{\text{低}}$。
- 钙的逸出功 $W_0 = 3.20\ \text{eV}$。该种光能使钙发生光电效应的条件是 $h\nu \ge W_0$，对应的最大初动能 $E_k = h\nu - W_0$。光子能量越大，$E_k$ 越大。

## 二、完整解答

### （1）最多几种频率，各是多少

从 4 个能级里任取两个作为跃迁的两端：

$$
N = C_4^2 = \frac{4 \times 3}{2} = \boxed{6}
$$

六种光子的能量：

$$
h\nu_{41} = E_4 - E_1 = -0.85 - (-13.6) = 13.6 - 0.85 = \boxed{12.75\ \text{eV}}
$$

$$
h\nu_{31} = E_3 - E_1 = -1.51 - (-13.6) = 13.6 - 1.51 = \boxed{12.09\ \text{eV}}
$$

$$
h\nu_{21} = E_2 - E_1 = -3.4 - (-13.6) = 13.6 - 3.4 = \boxed{10.2\ \text{eV}}
$$

$$
h\nu_{42} = E_4 - E_2 = -0.85 - (-3.4) = 3.4 - 0.85 = \boxed{2.55\ \text{eV}}
$$

$$
h\nu_{32} = E_3 - E_2 = -1.51 - (-3.4) = 3.4 - 1.51 = \boxed{1.89\ \text{eV}}
$$

$$
h\nu_{43} = E_4 - E_3 = -0.85 - (-1.51) = 1.51 - 0.85 = \boxed{0.66\ \text{eV}}
$$

### （2）能使钙发生光电效应的有几种

把上面六个能量和 $W_0 = 3.20\ \text{eV}$ 比较：

| 跃迁 | 光子能量 / eV | 和 3.20 eV 比 | 光电效应 | 最大初动能 / eV |
| --- | --- | --- | --- | --- |
| 4→1 | 12.75 | 大于 | 能 | 9.55 |
| 3→1 | 12.09 | 大于 | 能 | 8.89 |
| 2→1 | 10.2 | 大于 | 能 | 7.0 |
| 4→2 | 2.55 | 小于 | 不能 | — |
| 3→2 | 1.89 | 小于 | 不能 | — |
| 4→3 | 0.66 | 小于 | 不能 | — |

能发生光电效应的是落到 $n = 1$ 的三条，$12.75$、$12.09$、$10.2$ 都大于 $3.20$；$2.55$、$1.89$、$0.66$ 都小于 $3.20$。

$$
N_{\text{光}} = \boxed{3}
$$

### （3）最大初动能的最大值

六种光子里能量最大的是 $4 \to 1$ 的 $12.75\ \text{eV}$，而且它已经大于逸出功，所以最大初动能的最大值是

$$
E_{k,\max} = 12.75 - 3.20 = \boxed{9.55\ \text{eV}}
$$

> **易错点**：只数从 $n = 4$ 直接跳下去的三条，会把第（1）问做成 3。大量原子还会发生 $3 \to 2$、$3 \to 1$、$2 \to 1$，一共 6 种。第（2）问的 3 种是这 6 种里面能量不小于 $3.20\ \text{eV}$ 的那些，两条问的不是同一件事。第（3）问要先取最大的光子能量再减逸出功；$4 \to 2$、$3 \to 2$ 虽然落在可见光范围，能量仍然小于钙的逸出功。

## 三、交互演示

能级图按题目数据画出 $n = 1$ 到 $n = 4$，虚线 $n = \infty$ 只标出能量零点，不参与发光。琥珀色实线表示该光子能量不小于当前逸出功，灰色虚线表示不能打出光电子。按 $1.62\ \text{eV}$ 到 $3.11\ \text{eV}$ 标出可见光。右侧可以选择谱线、改变逸出功；逸出功离开 $3.20\ \text{eV}$ 后，点轨道上的题目原值或下面的预设回到题目条件。序号 1 到 6 按能量从大到小，依次是 $4 \to 1$、$3 \to 1$、$2 \to 1$、$4 \to 2$、$3 \to 2$、$4 \to 3$。

<Question text="这些氢原子最多能发出多少种不同频率的光？各光子的能量分别是多少？" hint="四个能级两两组合，种数是 C(4,2)；每条谱线的能量是两能级之差" set={{k: 1, W0: 3.2}} />

<Question text="其中能使金属钙发生光电效应的光有几种？" hint="把六种光子能量分别和逸出功 3.20 eV 比较" set={{W0: 3.2}} />

<Question text="从金属钙表面打出的光电子，最大初动能的最大值是多少？" hint="取能量最大的 4→1，E_k = ΔE − W_0" set={{k: 1, W0: 3.2}} />

<Param name="k" label="查看的谱线" value={1} options={[
  {value: 1, label: "4→1（12.75 eV）"},
  {value: 2, label: "3→1（12.09 eV）"},
  {value: 3, label: "2→1（10.2 eV）"},
  {value: 4, label: "4→2（2.55 eV）"},
  {value: 5, label: "3→2（1.89 eV）"},
  {value: 6, label: "4→3（0.66 eV）"}
]} />

<Param name="W0" label="逸出功 W_0" symbol="W_0" value={3.2} min={0} max={14} step={0.05} unit="eV" color="field" digits={2} />

<Param name="t" label="时间" value={0} min={0} max={4} step={0.01} unit="s" hidden />

<Define name="E1" expr="-13.6" />

<Define name="E2" expr="-3.4" />

<Define name="E3" expr="-1.51" />

<Define name="E4" expr="-0.85" />

<Define name="nLevel" expr="4" />

<Define name="nKind" expr="nLevel * (nLevel - 1) / 2" />

<Define name="dE41" expr="E4 - E1" />

<Define name="dE31" expr="E3 - E1" />

<Define name="dE21" expr="E2 - E1" />

<Define name="dE42" expr="E4 - E2" />

<Define name="dE32" expr="E3 - E2" />

<Define name="dE43" expr="E4 - E3" />

<Define name="dE" expr="k < 1.5 ? dE41 : k < 2.5 ? dE31 : k < 3.5 ? dE21 : k < 4.5 ? dE42 : k < 5.5 ? dE32 : dE43" />

<Define name="nFrom" expr="k < 1.5 ? 4 : k < 2.5 ? 3 : k < 3.5 ? 2 : k < 4.5 ? 4 : k < 5.5 ? 3 : 4" />

<Define name="nTo" expr="k < 1.5 ? 1 : k < 2.5 ? 1 : k < 3.5 ? 1 : k < 4.5 ? 2 : k < 5.5 ? 2 : 3" />

<Define name="canPE" expr="dE >= W0 ? 1 : 0" />

<Define name="Ek" expr="dE >= W0 ? dE - W0 : 0" />

<Define name="Wpay" expr="dE >= W0 ? W0 : 0" />

<Define name="Ekeep" expr="dE >= W0 ? 0 : dE" />

<Define name="nPE" expr="(dE41 >= W0 ? 1 : 0) + (dE31 >= W0 ? 1 : 0) + (dE21 >= W0 ? 1 : 0) + (dE42 >= W0 ? 1 : 0) + (dE32 >= W0 ? 1 : 0) + (dE43 >= W0 ? 1 : 0)" />

<Define name="EphotonMax" expr="max(dE41, dE31, dE21, dE42, dE32, dE43)" />

<Define name="EkMax" expr="EphotonMax >= W0 ? EphotonMax - W0 : 0" />

<Define name="tHit" expr="2" />

<Preset label="题目条件，看 4→1" set={{k: 1, W0: 3.2}} />

<Preset label="仍能逸出的 2→1" set={{k: 3, W0: 3.2}} />

<Preset label="可见但不能逸出的 4→2" set={{k: 4, W0: 3.2}} />

<Status cases={[
  {when: "dE < W0", label: "所选光子能量小于逸出功，不能发生光电效应", tone: "warning"},
  {label: "所选光子能使钙发生光电效应", tone: "success"}
]} />

<EnergyLevels
  title="氢原子能级与六条谱线"
  levels={[
    {n: 1, E: "E1"},
    {n: 2, E: "E2"},
    {n: 3, E: "E3"},
    {n: 4, E: "E4"},
    {n: "∞", E: 0}
  ]}
  transitions={[
    {from: 4, to: 1, label: "4→1"},
    {from: 3, to: 1, label: "3→1"},
    {from: 2, to: 1, label: "2→1"},
    {from: 4, to: 2, label: "4→2"},
    {from: 3, to: 2, label: "3→2"},
    {from: 4, to: 3, label: "4→3"}
  ]}
  select="k - 1"
  workFunction="W0"
  visible
/>

点播放看所选光子飞到钙表面。能量够，就有光电子从受光的一面飞出；能量不够，表面没有电子离开。原子里跳下来的电子和金属里逸出的电子是两个电子。

<Sim
  title="光子从氢原子飞向金属钙"
  height={340}
  duration="2 * tHit"
  time="t"
  params={["dE", "Ek", "canPE", "nFrom", "nTo", "tHit"]}
  hud={[
    {symbol: "ΔE", label: "光子能量", expr: "dE", unit: "eV", digits: 2},
    {symbol: "W_0", label: "逸出功", expr: "W0", unit: "eV", digits: 2},
    {symbol: "E_k", label: "最大初动能", expr: "Ek", unit: "eV", digits: 2}
  ]}
  legend={[
    {kind: "charge", label: "光子、电子、参与跃迁的轨道"},
    {kind: "velocity", label: "光电子"},
    {kind: "steel-dash", label: "其余轨道"}
  ]}
  note="轨道间距没有按 n² 画，波长和电子快慢也不按比例。E_k 为 0 表示这种光不能打出光电子。"
  marks={[
    {t: 0, label: "发出光子"},
    {t: "tHit", label: "到达钙表面"}
  ]}
>
sim({
  at(t, p) {
    const cx = 2
    const cy = 2.2
    const rUnit = 0.38
    const xPlate = 10.6
    const xStart = cx + rUnit * p.nFrom + 0.08
    const u = Math.min(1, Math.max(0, t / p.tHit))
    const flying = p.tHit > t
    const xPh = xStart + (xPlate - xStart) * u
    const fly = Math.max(0, t - p.tHit)
    const spd = 0.09 * p.Ek
    return {
      cx: cx,
      cy: cy,
      rUnit: rUnit,
      xPlate: xPlate,
      xStart: xStart,
      xPh: xPh,
      yPh: cy,
      flying: flying,
      xe: xPlate - 0.2 - fly * spd,
      ye: cy + 0.45 + fly * spd * 0.35,
      showE: p.canPE > 0.5 && t + 1e-9 > p.tHit,
    }
  },
  draw(ctx, s, v) {
    const p = v.p
    const m = v.view({ xmin: -0.2, xmax: 13.4, ymin: -1.1, ymax: 5.2, equal: true, pad: 16 })
    let n = 4
    while (n > 0) {
      const on = n === p.nFrom || n === p.nTo
      if (on) {
        v.circle(m, s.cx, s.cy, s.rUnit * n, { color: v.color.charge, width: 1.8 })
      } else {
        v.circle(m, s.cx, s.cy, s.rUnit * n, { color: v.color.steel, width: 1, dash: [5, 4] })
      }
      n = n - 1
    }
    v.circle(m, s.cx, s.cy, 0.07, { fill: v.color.ink, color: v.color.ink })
    v.label(m, s.cx, s.cy + s.rUnit * 4 + 0.28, '氢原子', { color: v.color.ink, size: 13 })

    const nElec = 0.35 > v.t ? p.nFrom : p.nTo
    const ang = Math.PI * 0.55
    v.ball(
      m,
      s.cx + s.rUnit * nElec * Math.cos(ang),
      s.cy + s.rUnit * nElec * Math.sin(ang),
      0.1,
      { charge: true }
    )

    v.wall(m, s.xPlate, 0.3, 4.2, { side: 'right', label: '钙' })

    if (s.flying) {
      const wl = Math.max(8, Math.min(56, 88 / p.dE))
      const tail = Math.max(s.xStart, s.xPh - 1.35)
      v.photon(m, tail, s.yPh, s.xPh, s.yPh, { wavelength: wl })
    }

    if (s.showE) {
      v.ball(m, s.xe, s.ye, 0.11, { charge: true, label: 'e' })
      v.vec(m, s.xe, s.ye, -0.16 * p.Ek, 0.07 * p.Ek, {
        kind: 'velocity',
        label: 'E_k ' + p.Ek.toFixed(2) + ' eV',
        min: 18,
      })
    }

    v.event(m, s.cx + s.rUnit * p.nFrom, s.cy, '发出光子', { at: 0, kind: 'charge' })
    if (p.canPE > 0.5) {
      v.event(m, s.xPlate - 0.3, s.cy + 0.9, '电子逸出', { at: p.tHit, kind: 'velocity' })
    } else {
      v.event(m, s.xPlate - 0.3, s.cy + 0.9, '不能逸出', { at: p.tHit, kind: 'force' })
    }
  },
})
</Sim>

<Readout items={[
  {label: "谱线种数", symbol: "N", expr: "nKind", unit: "种", digits: 0},
  {label: "所选光子能量", symbol: "ΔE", expr: "dE", unit: "eV", digits: 2, color: "charge"},
  {label: "逸出功", symbol: "W_0", expr: "W0", unit: "eV", digits: 2, color: "field"},
  {label: "该光子的最大初动能", symbol: "E_k", expr: "Ek", unit: "eV", digits: 2, color: "velocity"},
  {label: "能发生光电效应的种数", symbol: "N_{光}", expr: "nPE", unit: "种", digits: 0},
  {label: "最大初动能的最大值", symbol: "E_{kmax}", expr: "EkMax", unit: "eV", digits: 2, color: "velocity"}
]} />

<Bars
  title="六种光子的能量（点柱子切换谱线）"
  x={{name: "idx", label: "序号", min: 1, max: 6}}
  y={{label: "ΔE", unit: "eV"}}
  expr="idx < 1.5 ? dE41 : idx < 2.5 ? dE31 : idx < 3.5 ? dE21 : idx < 4.5 ? dE42 : idx < 5.5 ? dE32 : dE43"
  cursor="k"
  marks={[{x: 1, label: "能量最大", style: "solid"}]}
  color="charge"
/>

<Plot
  title="最大初动能随逸出功的变化"
  caption="实线始终对应能量最大的光子。虚线是当前谱线。纵轴降到 0 以后，这种光不能再打出光电子。初始选中 4→1 时两条线重合。"
  x={{name: "w", label: "W_0", unit: "eV", min: 0, max: 14}}
  y={{label: "E_k", unit: "eV", min: 0, max: 14}}
  series={[
    {label: "能量最大的谱线", expr: "w <= EphotonMax ? EphotonMax - w : 0", color: "velocity"},
    {label: "当前谱线", expr: "w <= dE ? dE - w : 0", color: "charge", dash: true}
  ]}
  marks={[
    {x: 3.2, series: 0, label: "钙 3.20 eV"},
    {x: "EphotonMax", series: 0, label: "最大光子能量"}
  ]}
  cursor="W0"
/>

<Ledger
  title="所选光子的能量去向"
  unit="eV"
  digits={2}
  parts={[
    {label: "克服逸出功", symbol: "W_0", expr: "Wpay", color: "field"},
    {label: "光电子最大初动能", symbol: "E_k", expr: "Ek", color: "velocity"},
    {label: "未能逸出", symbol: "ΔE", expr: "Ekeep", color: "charge"}
  ]}
  total={{label: "光子能量", symbol: "ΔE", expr: "dE"}}
/>

<Answer items={[
  {label: "不同频率的种数", symbol: "N", expr: "nKind", value: 6, unit: "种", digits: 0},
  {label: "4→1 光子能量", symbol: "hν_{41}", expr: "dE41", value: 12.75, unit: "eV", digits: 2},
  {label: "3→1 光子能量", symbol: "hν_{31}", expr: "dE31", value: 12.09, unit: "eV", digits: 2},
  {label: "2→1 光子能量", symbol: "hν_{21}", expr: "dE21", value: 10.2, unit: "eV", digits: 2},
  {label: "4→2 光子能量", symbol: "hν_{42}", expr: "dE42", value: 2.55, unit: "eV", digits: 2},
  {label: "3→2 光子能量", symbol: "hν_{32}", expr: "dE32", value: 1.89, unit: "eV", digits: 2},
  {label: "4→3 光子能量", symbol: "hν_{43}", expr: "dE43", value: 0.66, unit: "eV", digits: 2},
  {label: "能发生光电效应", symbol: "N_{光}", expr: "nPE", value: 3, unit: "种", digits: 0},
  {label: "最大初动能的最大值", symbol: "E_{kmax}", expr: "EkMax", value: 9.55, unit: "eV", digits: 2}
]} />

## 四、结合图像理解关键时刻

柱状图从左到右就是 $12.75$、$12.09$、$10.2$、$2.55$、$1.89$、$0.66\ \text{eV}$。逸出功停在 $3.20\ \text{eV}$ 时，只有左边三根高于逸出功，能级图上对应落到 $n = 1$ 的三条琥珀色箭头。$4 \to 2$（$2.55\ \text{eV}$）和 $3 \to 2$（$1.89\ \text{eV}$）旁边有可见光的波浪线，箭头仍是灰色：看得见，不等于能从钙里打出电子。

$E_k$–$W_0$ 图上，实线在 $W_0 = 0$ 处等于最大光子能量 $12.75\ \text{eV}$，过「钙 3.20 eV」那一点时降到 $9.55\ \text{eV}$，再到 $12.75\ \text{eV}$ 处落到 0。把逸出功拖过 $2.55\ \text{eV}$，$4 \to 2$ 变为不能逸出；拖过 $10.2\ \text{eV}$，$2 \to 1$ 也不行；超过 $12.75\ \text{eV}$ 后六种光都不能逸出，最大初动能记为 0。

账本在选中 $4 \to 1$、逸出功为 $3.20\ \text{eV}$ 时分成两段：$3.20\ \text{eV}$ 用于逸出，$9.55\ \text{eV}$ 成为光电子的最大初动能，加起来仍是 $12.75\ \text{eV}$。选中 $4 \to 3$ 时整条都记在「未能逸出」里。

动画有两个关键时刻。$t = 0$ 原子向下跃迁，发出一个波包；波包越密，表示光子能量越大。$t = 2\ \text{s}$ 光子到达钙表面：所选的是前三种谱线时电子飞出，后三种则停在「不能逸出」。

## 五、答案汇总

| 小问 | 答案 |
| --- | --- |
| （1）不同频率的种数 | $6$ 种 |
| （1）六种光子能量 | $12.75$、$12.09$、$10.2$、$2.55$、$1.89$、$0.66\ \text{eV}$ |
| （2）能使钙发生光电效应 | $3$ 种（$4 \to 1$、$3 \to 1$、$2 \to 1$） |
| （3）最大初动能的最大值 | $9.55\ \text{eV}$ |
