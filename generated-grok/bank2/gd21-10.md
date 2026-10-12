---
id: gd21-10
title: 圆弧导轨与金属杆
source: 2021 广东卷 第 10 题（多选，6 分）
question: 如图所示，水平放置足够长光滑金属导轨 abc 和 de，ab 与 de 平行，bc 是以 O 为圆心的圆弧导轨，圆弧 be 左侧和扇形 Obc 内有方向如图的匀强磁场，金属杆 OP 的 O 端与 e 点用导线相接，P 端与圆弧 bc 接触良好，初始时，可滑动的金属杆 MN 静止在平行导轨上，若杆 OP 绕 O 点在匀强磁场区内从 b 到 c 匀速转动时，回路中始终有电流，则此过程中，下列说法正确的有（　　）
choice: AD
answers:
  - { name: Eop, value: 0.25, unit: V }
  - { name: I0, value: 0.5, unit: A }
  - { name: Iend, value: 0.0216, unit: A }
---

题目只给出字母关系，没有数值。下面取一组代表性数值：磁感应强度 $B = 0.5\,\mathrm{T}$，圆弧半径 $r = 1\,\mathrm{m}$，平行导轨间距 $L = r$，杆 OP 的角速度 $\omega = 1\,\mathrm{rad/s}$，回路总电阻 $R = 0.5\,\Omega$，杆 MN 的质量 $m = 0.25\,\mathrm{kg}$。导轨足够长且光滑，图不按比例。

设 O 为原点，Ob 沿 $+x$ 轴，杆 OP 从 Ob 起逆时针转过 $\theta = \omega t$。扇形 Obc 的圆心角取 $90^\circ$，转到 Oc 时 $\theta = \pi/2$。

## 完整解答

杆 OP 绕 O 匀速转动，切割磁感线的有效长度始终是半径 $r$。棒上各点线速度与到 O 的距离成正比，感应电动势

$$
E_{\mathrm{OP}} = \frac{1}{2} B \omega r^2
$$

$B$、$\omega$、$r$ 都不随转角变化，所以这一份电动势恒定。取代表性数值

$$
\boxed{E_{\mathrm{OP}} = \dfrac{1}{2}\times 0.5\times 1\times 1^2 = 0.25\,\mathrm{V}}
$$

初始时杆 MN 静止，回路电流

$$
\boxed{I_0 = \dfrac{E_{\mathrm{OP}}}{R} = \dfrac{0.25}{0.5} = 0.5\,\mathrm{A}}
$$

扇形内磁场向里，由右手定则，感应电流沿杆 OP 从 P 流向 O，经导线 Oe、下轨、杆 MN、上轨和圆弧回到 P，也就是沿杆 MN 从 M 流向 N。

杆 MN 在圆弧 be 左侧的向外磁场中。电流从 M 流向 N，由左手定则，安培力水平向左，杆 MN 向左加速。它一向左运动就切割磁感线，感应电动势 $E_{\mathrm{MN}} = BLv$ 与杆 OP 的电动势方向相反。回路电流变成

$$
I = \frac{E_{\mathrm{OP}} - BLv}{R}
$$

速度越大，反向电动势越大，回路电流越小。杆 MN 的加速度

$$
a = \frac{BIL}{m}
$$

也随着电流减小而减小，不是匀加速。下面的速度和电流由运动积分算出，不是手写解析式。转到 Oc 时，积分给出的电流已经从 $0.5\,\mathrm{A}$ 降到约 $0.022\,\mathrm{A}$，仍大于零，与题目「回路中始终有电流」一致。

$$
\boxed{I(\pi/2\omega) \approx 0.022\,\mathrm{A}}
$$

杆 OP 上的安培力大小 $F_A = BIr$ 随电流一起变小，方向始终垂直于杆、阻碍转动，所以方向也在变。安培力不是不变。

**A. 杆 OP 产生的感应电动势恒定。正确。** 杆另外被驱动匀速转动，有效切割长度始终是 $r$，$E_{\mathrm{OP}} = \tfrac12 B\omega r^2$ 与转角、与杆 MN 的速度都无关。

**B. 杆 OP 受到的安培力不变。错误。** 大小 $BIr$ 随电流减小，方向始终垂直于杆。杆从 Ob 转到 Oc，这个力的方向也转过约 $90^\circ$。大小和方向都在变。

**C. 杆 MN 做匀加速直线运动。错误。** 安培力 $F = BIL$ 随电流减小，加速度减小。$v$–$t$ 图的斜率不是常数，不是匀加速。

**D. 杆 MN 中的电流逐渐减小。正确。** 杆 MN 向左加速，反向电动势 $BLv$ 增大，回路电流 $I = (E_{\mathrm{OP}} - BLv)/R$ 单调减小。题目说回路中始终有电流，是说这一过程里电流没有减到零，不是说电流不变。

## 交互演示

拖动时间，看杆 OP 从 b 转到 c，以及杆 MN 向左加速。杆 OP 的电动势不变；杆 MN 的反向电动势随速度增大，回路电流和安培力都减小。

<Param name="B" label="磁感应强度" symbol="B" value={0.5} min={0.2} max={1} step={0.1} unit="T" color="field" />

<Param name="r" label="圆弧半径" symbol="r" value={1} min={0.6} max={1.4} step={0.1} unit="m" />

<Param name="omega" label="角速度" symbol="ω" value={1} min={0.4} max={2} step={0.1} unit="rad/s" color="velocity" />

<Param name="R" label="回路电阻" symbol="R" value={0.5} min={0.2} max={2} step={0.1} unit="Ω" />

<Param name="m" label="杆 MN 质量" symbol="m" value={0.25} min={0.1} max={0.5} step={0.05} unit="kg" />

<Param name="t" label="时间" symbol="t" value={0} min={0} max="Tturn" step={0.01} unit="s" hidden />

<Define name="Tturn" expr="pi/(2*omega)" />

<Define name="Eop" expr="0.5*B*omega*r*r" />

<Define name="I0" expr="Eop/R" />

<Define name="Iend" expr="rod.I(Tturn)" />

<Define name="vend" expr="rod.v(Tturn)" />

<Motion name="rod" until="Tturn" mass="m" along={180}
  state={{x: 0, v: 0}}
  forces={[{label: "F", angle: 180, magnitude: "B*I*r"}]}
  circuit={{
    source: {series: [
      {type: "battery", label: "OP", emf: "0.5*B*omega*r*r", r: "R/2"},
      {type: "battery", label: "MN", emf: "-B*r*v", r: "R/2", read: "I"}
    ]},
    load: {type: "wire"}
  }}
/>

<Question text="A. 杆 OP 产生的感应电动势恒定" set={{t: 0}} hint="拖到任一时刻，E_OP 都是 ½Bωr²" />

<Question text="B. 杆 OP 受到的安培力不变" set={{t: "Tturn"}} hint="大小随 I 减小，方向随杆转过约 90°" />

<Question text="C. 杆 MN 做匀加速直线运动" set={{t: "Tturn/2"}} hint="v–t 图的斜率越来越小" />

<Question text="D. 杆 MN 中的电流逐渐减小" set={{t: "Tturn"}} hint="反向电动势 BLv 随速度增大" />

<Preset label="刚离开 b" set={{t: 0, B: 0.5, r: 1, omega: 1, R: 0.5, m: 0.25}} />

<Preset label="转到中间" set={{t: "Tturn/2"}} />

<Preset label="转到 c" set={{t: "Tturn"}} />

<Status cases={[
  {when: "t < 0.02", label: "刚开始：电流最大，杆 MN 还没有反向电动势", tone: "info"},
  {when: "rod.I(t) > 0.02", label: "杆 MN 向左加速，回路电流正在减小", tone: "neutral"},
  {label: "反向电动势已经抵消杆 OP 的电动势", tone: "warning"}
]} />

<Readout items={[
  {label: "杆 OP 的电动势", symbol: "E_OP", expr: "Eop", unit: "V", digits: 3, color: "charge"},
  {label: "回路电流", symbol: "I", expr: "rod.I(t)", unit: "A", digits: 3, color: "charge"},
  {label: "杆 MN 的速度", symbol: "v", expr: "rod.v(t)", unit: "m/s", digits: 3, color: "velocity"},
  {label: "杆 MN 的加速度", symbol: "a", expr: "rod.acc(t)", unit: "m/s²", digits: 2, color: "accel"}
]} />

<Answer items={[
  {label: "答案", text: "AD"},
  {label: "杆 OP 的电动势", symbol: "E_OP", expr: "Eop", value: 0.25, unit: "V"},
  {label: "初始电流", symbol: "I_0", expr: "I0", value: 0.5, unit: "A"},
  {label: "转到 c 时的电流", symbol: "I", expr: "Iend", value: 0.0216, unit: "A"}
]} />

<Sim title="导轨与两根金属杆" height={420} duration="Tturn" time="t" playSeconds={6}
  params={["rod", "B", "r", "omega", "R", "m", "Eop", "I0"]}
  marks={[
    {t: 0, label: "离开 b"},
    {t: "Tturn/2", label: "转过 45°"},
    {t: "Tturn", label: "到达 c"}
  ]}
  hud={[
    {symbol: "E_OP", expr: "Eop", unit: "V", digits: 3},
    {symbol: "I", expr: "rod.I(t)", unit: "A", digits: 3},
    {symbol: "a", expr: "rod.acc(t)", unit: "m/s²", digits: 2}
  ]}
  legend={[
    {kind: "velocity", label: "转动方向"},
    {kind: "force", label: "安培力"},
    {kind: "field", label: "磁场"}
  ]}
  note="导轨足够长，图不按比例。代表性数值：B = 0.5 T，r = 1 m，ω = 1 rad/s。">
sim({
  at(t, p) {
    const s = p.rod.state(t)
    const th = Math.min(p.omega * t, Math.PI / 2)
    return { x: s.x, v: s.v, acc: s.acc, I: s.I, th }
  },
  draw(ctx, s, v) {
    const r = v.p.r
    const gap = 0.55 * r
    const m = v.view({ xmin: -2.55 * r, xmax: 1.45 * r, ymin: -1.05 * r, ymax: gap + r + 0.42 * r, pad: 36 })
    const yTop = gap
    const yBot = 0
    const xArc = -r * Math.sin(s.th)
    const yArc = yTop + r * (1 - Math.cos(s.th))

    v.field(m, -2.3 * r, yBot, 0, yTop, { dir: 'out', step: 28, border: false })
    v.field(m, 0, 0, 0, 0, {
      dir: 'in',
      step: 28,
      sector: { x: 0, y: yBot, r: r, from: 0, to: 90 },
      border: false,
    })

    v.rails(m, -2.2 * r, 0, yTop, yBot)
    const arc = []
    for (let i = 0; i <= 28; i++) {
      const a = (i / 28) * Math.PI / 2
      arc.push([-r * Math.sin(a), yTop + r * (1 - Math.cos(a))])
    }
    v.path(m, arc, { color: v.color.steel, width: 3 })
    v.line(m, 0, yBot, r, yBot, { color: v.color.steel, width: 1.5, dash: true })
    v.line(m, 0, yBot, 0, yTop, { color: v.color.steel, width: 1.5, dash: true })

    const xN = -0.42 * r + s.x
    v.bar(m, xN, yBot, xN, yTop, { thick: 7 })
    v.bar(m, 0, yBot, xArc, yArc, { thick: 6 })

    const tx = Math.cos(s.th)
    const ty = Math.sin(s.th)
    v.vec(m, xArc, yArc, 0.26 * r * tx, 0.26 * r * ty, { kind: 'velocity' })
    const midX = 0.62 * xArc
    const midY = yBot + 0.62 * (yArc - yBot)
    v.vec(m, midX, midY, -0.28 * r * Math.sin(s.th), 0.28 * r * Math.cos(s.th), { kind: 'force', label: 'F_A' })
    v.vec(m, xN, (yTop + yBot) / 2, -0.28 * r, 0, { kind: 'force', label: 'F' })

    v.label(m, -2.05 * r, yTop + 0.12 * r, 'a')
    v.label(m, -0.16 * r, yTop + 0.14 * r, 'b')
    v.label(m, 0.22 * r, yTop + r - 0.08 * r, 'c')
    v.label(m, -2.05 * r, yBot - 0.14 * r, 'd')
    v.label(m, 0.14 * r, yBot - 0.14 * r, 'e')
    v.label(m, -0.16 * r, yBot + 0.16 * r, 'O')
    v.label(m, xArc + 0.14 * r * Math.cos(s.th) - 0.1 * r, yArc - 0.16 * r, 'P')
    v.label(m, xN - 0.16 * r, yTop + 0.16 * r, 'M')
    v.label(m, xN - 0.16 * r, yBot - 0.14 * r, 'N')
    v.label(m, -1.15 * r, (yTop + yBot) / 2, 'B')
    v.label(m, 0.55 * r, 0.42 * r, 'B')
  },
})
</Sim>

<Circuit title="等效电路" size="narrow" motion="rod" at="t"
  note="两个电源方向相反：杆 MN 越快，净电动势越小。" />

<Plot title="电动势与电流" size="wide"
  x={{name: "t", label: "t", unit: "s", min: 0, max: "Tturn"}}
  y={{label: "E、I", min: 0, max: 0.8}}
  series={[
    {label: "E_OP", expr: "Eop", color: "charge"},
    {label: "I", expr: "rod.I(t)", color: "field"}
  ]}
  cursor="t"
  caption="E_OP 是水平直线；I 随时间单调减小，但还没有减到零。"
/>

<Plot title="杆 MN 的速度" size="narrow"
  x={{name: "t", label: "t", unit: "s", min: 0, max: "Tturn"}}
  y={{label: "v", unit: "m/s", min: 0}}
  series={[{label: "v", expr: "rod.v(t)", color: "velocity"}]}
  cursor="t"
  caption="曲线越来越平，加速度在减小，不是匀加速。"
/>

## 结合图像

从 b 转到 c 的全过程里，$E_{\mathrm{OP}}$–$t$ 是水平直线：杆 OP 的感应电动势不变。$I$–$t$ 从 $0.5\,\mathrm{A}$ 单调降下去，转到 Oc 时还大于零，对应杆 MN 中的电流逐渐减小。

杆 MN 的 $v$–$t$ 图从原点出发，斜率越来越小。斜率就是加速度 $a = BIL/m$，电流减小时加速度也减小，所以不是匀加速直线运动。

画面里杆 OP 上的安培力箭头始终与杆垂直，并且随着杆从几乎指向 $+y$ 转到几乎指向 $-x$。大小还跟着电流变小，所以安培力不是不变。

## 答案汇总

正确选项是 **A**、**D**。

- A 正确：$E_{\mathrm{OP}} = \tfrac12 B\omega r^2$ 恒定。
- B 错误：安培力大小随电流减小，方向随杆转动一直在变。
- C 错误：杆 MN 的安培力随电流减小，加速度减小，不是匀加速。
- D 正确：杆 MN 的反向电动势增大，回路电流逐渐减小。
