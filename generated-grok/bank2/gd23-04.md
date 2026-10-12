---
id: gd23-04
title: 渔船回声探测器
source: 2023 广东卷 第 4 题（单选，4 分）
question: 渔船常用回声探测器发射的声波探测水下鱼群与障碍物．声波在水中传播速度为 1500 m/s，若探测器发出频率为 1.5×10^6 Hz 的声波，下列说法正确的是（　　）
choice: B
answers:
  - { name: lam, value: 0.001, unit: m }
  - { name: lamAir, value: 0.000227, unit: m }
---

回声探测器在渔船底部向下发出一列声波。声波在水中的波速是题目给定的 $v = 1500\,\mathrm{m/s}$，频率 $f = 1.5\times 10^6\,\mathrm{Hz}$。水面以上的空气声速题目没有给，下面取常温代表值 $v_{\text{空}} = 340\,\mathrm{m/s}$，只用来比较波长；选项的对错不依赖这个取值。水深和波长差了三个数量级，画面不按比例。

## 完整解答

由 $v = \lambda f$，水中的波长为

$$
\lambda = \frac{v}{f} = \frac{1500}{1.5\times 10^6} = 1.0\times 10^{-3}\,\mathrm{m} = 1\,\mathrm{mm}
$$

这一列波比题目说的被探测物（约 $1\,\mathrm{m}$）小三个数量级。传到空气中时频率不变，波长随波速改变：

$$
\lambda_{\text{空}} = \frac{v_{\text{空}}}{f} = \frac{340}{1.5\times 10^6} \approx 2.27\times 10^{-4}\,\mathrm{m}
$$

回声的频率还要看反射体相对探测器的运动。取代表值：被探测物以 $u = 10\,\mathrm{m/s}$ 相对探测器运动，并设探测器不动。物体向探测器靠近时，回声频率为

$$
f' = f\,\frac{v+u}{v-u} = 1.5\times 10^6\times\frac{1510}{1490} \approx 1.520\times 10^6\,\mathrm{Hz}
$$

这个数已经和发射频率不同。

### A：错误

两列波叠加并不自动变成稳定干涉。稳定干涉要求频率相同（或频率差很小），并且振动方向相同。题目只说“两列声波”，没有给出它们的频率和振动方向。频率不同的两列波相遇，只会得到随时间变化的合成，得不到稳定的强弱相间。所以“一定会发生干涉”不对。

### B：正确

声波从水中传入空气，波源没有换，频率保持 $1.5\times 10^6\,\mathrm{Hz}$。波速从 $1500\,\mathrm{m/s}$ 变成约 $340\,\mathrm{m/s}$，由 $\lambda = v/f$ 知道波长从 $1.0\times 10^{-3}\,\mathrm{m}$ 变成约 $2.27\times 10^{-4}\,\mathrm{m}$。波长确实改变。

### C：错误

明显衍射要求障碍物的尺寸与波长相当，或比波长更小。这里

$$
\frac{d}{\lambda} = \frac{1}{1.0\times 10^{-3}} = 1000
$$

被探测物比波长大约一千倍，声波几乎沿直线传播，会发生明显反射，不会发生明显衍射。

### D：错误

回声是声波在运动的被探测物上反射回来的。这是一次多普勒效应：物体靠近探测器时接收频率高于发射频率，远离时低于发射频率。代表性数值下，$u = 10\,\mathrm{m/s}$ 靠近时 $f' \approx 1.520\times 10^6\,\mathrm{Hz}$，远离时

$$
f' = f\,\frac{v-u}{v+u} \approx 1.480\times 10^6\,\mathrm{Hz}
$$

接收频率与相对速度有关。所以 D 不对。

## 交互演示

拖动时间，看波列向下传播、在被探测物上反射、再回到探测器。拖动相对速度，回声频率会离开发射频率。空气中的波长比水中短，可以对照 B。

<Question text="A. 两列声波相遇时一定会发生干涉" set={{f2: 0.8}} hint="另一列频率改成 0.8×10^6 Hz，合成随时间变，没有稳定强弱相间" />

<Question text="B. 声波由水中传播到空气中，波长会改变" set={{u: 0}} hint="频率不变，波速从 1500 m/s 变成约 340 m/s，波长变短" />

<Question text="C. 该声波遇到尺寸约为 1 m 的被探测物时会发生明显衍射" set={{u: 0}} hint="水中波长只有 1 mm，约为被探测物的千分之一" />

<Question text="D. 探测器接收到的回声频率与被探测物相对探测器运动的速度无关" set={{u: 10}} hint="靠近时回声频率高于发射频率" />

<Param name="t" label="发出后的时间" value={0.004} min={0} max={0.012} step={0.0002} unit="s" />

<Param name="v" label="水中波速" value={1500} hidden />

<Param name="f" label="发射频率" symbol="f" value={1.5} min={1} max={2} step={0.1} unit="×10^6 Hz" color="charge" />

<Param name="f2" label="另一列的频率" symbol="f_2" value={1.5} min={0.6} max={2} step={0.1} unit="×10^6 Hz" color="field" />

<Param name="vAir" label="空气声速（代表值）" value={340} hidden />

<Param name="d" label="被探测物尺寸" value={1} hidden />

<Param name="u" label="相对速度（靠近为正）" symbol="u" value={0} min={-20} max={20} step={1} unit="m/s" color="velocity" />

<Define name="lam" expr="v/(f*1e6)" />

<Define name="lamAir" expr="vAir/(f*1e6)" />

<Define name="ratio" expr="d/lam" />

<Define name="fEcho" expr="f*(v + u)/(v - u)" />

<Define name="sameF" expr="abs(f2 - f) < 1e-6" />

<Preset label="题目条件：两列同频、相对静止" set={{f: 1.5, f2: 1.5, u: 0, t: 0.004}} />

<Preset label="频率不同：遇上也不干涉" set={{f2: 0.8, u: 0}} />

<Preset label="被探测物以 10 m/s 靠近" set={{u: 10, f: 1.5, f2: 1.5}} />

<Status cases={[
  {when: "sameF < 0.5", label: "两列频率不同，相遇也形不成稳定干涉", tone: "warning"},
  {when: "abs(u) > 0.5", label: "回声频率已随相对速度改变", tone: "info"},
  {label: "同频、相对静止：波长 1 mm，不会明显衍射", tone: "success"}
]} />

<Readout items={[
  {label: "水中波长", symbol: "λ", expr: "lam*1000", unit: "mm", digits: 2, color: "charge"},
  {label: "空气中波长", symbol: "λ_空", expr: "lamAir*1000", unit: "mm", digits: 3, color: "charge"},
  {label: "尺寸比波长", symbol: "d/λ", expr: "ratio", digits: 0},
  {label: "回声频率", symbol: "f'", expr: "fEcho", unit: "×10^6 Hz", digits: 3, color: "charge"}
]} />

<Answer items={[
  {label: "答案", text: "B"},
  {label: "水中波长", symbol: "λ", expr: "lam", value: 0.001, unit: "m", digits: 4},
  {label: "空气中波长", symbol: "λ_空", expr: "lamAir", value: 0.000227, unit: "m", digits: 6}
]} />

水面以上画出传入空气的那一小段：波纹更密，对应波长变短。水下的波列是发出波和回声的合成；另一列频率不同时，分开的虚线是两列本身。水深和波长不按比例。

<Sim title="回声探测" height={420} duration={0.012} time="t" params={["v", "f", "f2", "lam", "lamAir", "u"]} marks={[{t: 0, label: "发出"}, {t: 0.004, label: "到达被探测物"}, {t: 0.008, label: "回声返回"}]} legend={[{kind: "charge", label: "水中声波"}, {kind: "field", label: "空气中声波"}, {kind: "velocity-dash", label: "频率不同的另一列"}]} note="水深和波长不按比例；水中画 5 个波长，空气中波纹按 λ_空/λ 变密" hud={[{symbol: "λ", label: "水中波长", expr: "lam*1000", unit: "mm", digits: 2}, {symbol: "f'", label: "回声频率", expr: "f*(v+u)/(v-u)", unit: "×10^6 Hz", digits: 3}]}>
sim({
  at(t, p) {
    const travel = 0.006
    const down = Math.min(Math.max(t / travel, 0), 1)
    const echo = Math.max(t / travel - 1, 0)
    return { down, echo }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -0.4, xmax: 8.7, ymin: -0.7, ymax: 2.55 })
    v.vessel(m, [{ x1: 0.15, y1: -0.15, x2: 6.55, y2: 1.85, open: 'top' }], {
      fills: [{ x1: 0.15, y1: -0.15, x2: 6.55, y2: 1.35, kind: 'water' }],
    })
    const xSrc = 0.85
    const xObj = 5.55
    const span = xObj - xSrc
    const nWater = 5
    const lamX = span / nWater
    const amp = 0.15
    const same = Math.abs(v.p.f2 - v.p.f) < 1e-6
    const beam = (y0, xA, xB, n, phase, color, dash) => {
      const lo = Math.min(xA, xB)
      const hi = Math.max(xA, xB)
      if (hi - lo < 0.06) return
      v.wave(m, (x) => {
        const u = (x - lo) / (hi - lo)
        const edge = Math.min(u, 1 - u) * n
        return y0 + Math.min(1, edge) * amp * Math.sin((2 * Math.PI * n / span) * (x - xSrc) + phase)
      }, lo, hi, { color: color, width: dash ? 1.3 : 1.7, dash: !!dash })
    }
    const xFront = xSrc + s.down * span
    beam(0.98, Math.max(xSrc, xFront - nWater * lamX), xFront, nWater, 0, v.color.charge, false)
    if (s.echo > 0) {
      const xBack = xObj - Math.min(1, s.echo) * span
      beam(0.22, xBack, Math.min(xObj, xBack + nWater * lamX), nWater, Math.PI, v.color.charge, false)
    }
    if (!same && s.down > 0.02) {
      const n2 = Math.max(2, Math.round(nWater * v.p.f2 / v.p.f))
      const x2 = xSrc + s.down * span
      beam(0.6, Math.max(xSrc, x2 - span), x2, n2, 0, v.color.velocity, true)
    }
    const lamRatio = Math.max(0.22, Math.min(0.7, v.p.lamAir / v.p.lam))
    const airLen = 1.55
    const nAir = Math.max(6, Math.round((airLen / lamX) / lamRatio))
    const entered = Math.min(1, Math.max(0, (v.t - 0.0003) / 0.0022))
    if (entered > 0.04) {
      const xAir0 = 6.75
      v.wave(m, (x) => {
        const u = (x - xAir0) / airLen
        const env = Math.sin(Math.PI * Math.min(1, u / entered))
        return 1.85 + env * amp * Math.sin((2 * Math.PI * nAir / airLen) * (x - xAir0))
      }, xAir0, xAir0 + entered * airLen, { color: v.color.field, width: 1.6 })
    }
    v.block(m, xSrc, 1.42, 0.58, 0.2)
    v.label(m, xSrc, 1.82, '探测器', { place: 'above' })
    v.block(m, xObj, 0.5, 0.42, 0.14)
    v.text(m, xObj, 0.78, '被探测物', { color: v.color.ink, size: 13 })
    v.dim(m, xObj - 0.21, -0.22, xObj + 0.21, -0.22, 'd ≈ 1 m')
    v.label(m, 7.5, 2.28, '空气', { place: 'above' })
    v.label(m, 3.15, 1.58, '水', { place: 'above' })
    if (s.echo > 0.08) v.label(m, (xSrc + xObj) / 2, 0.6, '回声', { place: 'above' })
  },
})
</Sim>

<Plot
  title="波长随介质改变"
  size="narrow"
  caption="同一频率下，波速不同则波长不同"
  x={{name: "c", label: "波速", unit: "m/s", min: 200, max: 1800}}
  y={{label: "λ", unit: "mm", min: 0, max: 1.4}}
  series={[{label: "λ", expr: "c/(f*1e3)", color: "charge"}]}
  marks={[{x: "vAir", label: "空气"}, {x: "v", label: "水"}]}
  cursor="v"
/>

<Plot
  title="回声频率随相对速度变化"
  size="narrow"
  caption="靠近为正；横线是发射频率"
  x={{name: "u", label: "u", unit: "m/s", min: -20, max: 20}}
  y={{label: "f'", unit: "×10^6 Hz", min: 1.45, max: 1.55}}
  series={[
    {label: "f'", expr: "f*(v+u)/(v-u)", color: "charge"},
    {label: "f", expr: "f", color: "steel", dash: true}
  ]}
  cursor="u"
/>
