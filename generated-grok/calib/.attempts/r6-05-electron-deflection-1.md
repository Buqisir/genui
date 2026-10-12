---
id: r6-05-electron-deflection
title: 电子的加速与偏转
subject: physics
topic: 带电粒子在电场中的运动
source: 2022 重庆大学附中月考
question: |
  （2022·重庆大学附中月考）有两组平行金属板，一组竖直放置，一组水平放置。一质量为 m、电荷量为 e 的电子静止在竖直放置的平行金属板的 A 点，经电压 U₀ 加速后通过 B 点，进入两板间距离为 d、电压为 U 的水平放置的平行金属板间。电子从水平极板的正中间沿平行于极板的方向射入，最后刚好从右侧极板边缘射出（A、B 分别为两块竖直极板的中点）。不计重力。求：
  (1) 电子通过 B 点时的速度大小；
  (2) 水平放置的平行金属板的长度 l；
  (3) 电子射出水平放置的平行金属板时的动能。
answers:
  - { name: vB, value: 10, unit: "L/T" }
  - { name: l, value: 8, unit: "L" }
  - { name: Ek, value: 62.5, unit: "eV" }
---

## 一、题目条件分析

电子电荷量的大小是 $e$、质量是 $m$，带负电，不计重力。过程分成两段：

- **加速**：电子从竖直极板中点 A 由静止出发，两板电压为 $U_0$，经电场加速后从另一块竖直极板的中点 B 穿出。这一段电场力做功 $eU_0$。
- **偏转**：接着从水平极板的正中间、沿平行于极板的方向射入。两板间距 $d$、电压 $U$。最后刚好从右侧边缘射出，所以在板内的竖直位移是 $d/2$，不是 $d$。

题目只给字母。下面取一组代表性数值，让图上能直接读数。考试作答应保留字母式。

| 量 | 取值 | 说明 |
|---|---|---|
| 质量 $m$ | $1$ | 教学单位 |
| 电荷量大小 $e$ | $1$ | 教学单位 |
| 加速电压 $U_0$ | $50\ \text{V}$ | |
| 偏转电压 $U$ | $25\ \text{V}$ | |
| 偏转极板间距 $d$ | $4\ \text{L}$ | 长度单位记为 L |

能量用 eV：这里 $e=1$，所以 $eU$ 的数值就等于电压的数值，$eU_0=50\ \text{eV}$。速度单位记为 L/T，它由上面这套单位一起定出，不是国际单位制里电子的真实速率。真实电子快得多，但 $v_B$、$\ell$ 与 $d$、$E_k$ 与 $eU_0$ 的比例和字母结果相同。

竖直极板的间距、极板高度，以及两段电场之间的空隙，题目都没有给，三个所求量也不依赖它们。图上分别取间距 $4\ \text{L}$、半高 $5\ \text{L}$、空隙 $2\ \text{L}$，只为把加速和偏转分开展示。演示规定水平极板的上板为正，电子向上偏；下板为正时轨迹上下镜像，$l$ 和动能不变。

## 二、完整解答

### （1）通过 B 点的速度

从 A 到 B，电场力做功 $eU_0$，电子由静止开始。由动能定理

$$
eU_0=\frac12 mv_B^2
$$

$$
v_B=\sqrt{\frac{2eU_0}{m}}
$$

代入 $e=1$、$m=1$、$U_0=50$：

$$
v_B=\sqrt{\frac{2\times 1\times 50}{1}}=\boxed{10\ \text{L/T}}
$$

竖直极板相距多远不会出现在这个结果里：电压已经把电场力做的功给全了。

### （2）水平极板的长度

进入偏转电场时，速度沿极板，$v_x=v_B$，竖直分速度为 $0$。板间场强大小 $E=U/d$，电子加速度的大小

$$
a_y=\frac{eE}{m}=\frac{eU}{md}
$$

方向指向正极板（演示中向上）。水平方向不受力，$v_x$ 保持 $v_B$。设极板长度为 $l$，穿过所用时间 $t=l/v_B$。

刚好从边缘射出，竖直位移是半间距：

$$
\frac{d}{2}=\frac12 a_y t^2=\frac12\cdot\frac{eU}{md}\cdot\frac{l^2}{v_B^2}
$$

$$
l^2=\frac{m d^2 v_B^2}{eU}
$$

把 $v_B^2=2eU_0/m$ 代入：

$$
l^2=\frac{m d^2}{eU}\cdot\frac{2eU_0}{m}=d^2\cdot\frac{2U_0}{U}
$$

$$
l=d\sqrt{\frac{2U_0}{U}}
$$

代入 $d=4$、$U_0=50$、$U=25$：

$$
l=4\sqrt{\frac{2\times 50}{25}}=4\sqrt{4}=\boxed{8\ \text{L}}
$$

若把竖直位移误写成整段间距 $d$，根号里会多一个 $4$，$l$ 变成 $16\ \text{L}$。

### （3）射出时的动能

两板间电势差是 $U$，匀强电场里电势沿垂直极板方向均匀变化，中线到任一极板的电势差是 $U/2$。

电子带负电，飞向正极板，电场力做正功 $e\cdot U/2$。射出时

$$
E_k=eU_0+\frac12 eU=e\left(U_0+\frac{U}{2}\right)
$$

$$
E_k=1\times\left(50+\frac{25}{2}\right)=\boxed{62.5\ \text{eV}}
$$

只写 $eU_0$ 会得到 $50\ \text{eV}$，把整段电势差 $U$ 都算进去会得到 $75\ \text{eV}$。电子在竖直方向只走了 $d/2$，多出来的功是 $eU/2$。

**用分速度核对。** 代表值下 $a_y=eU/(md)=25/4=6.25$，穿过时间 $t=l/v_B=0.8$：

$$
v_y=a_y t=5
$$

一般地，把 $l=d\sqrt{2U_0/U}$ 和 $v_B=\sqrt{2eU_0/m}$ 代入 $v_y=a_y l/v_B$，得到

$$
v_y=\sqrt{\frac{eU}{m}}
$$

它和 $\frac12 mv_y^2=\frac12 eU$ 是同一件事。于是

$$
E_k=\frac12 m(v_B^2+v_y^2)=\frac12(10^2+5^2)=62.5\ \text{eV}
$$

与动能定理一致。

## 三、交互演示

拖动 $U_0$、$U$ 或 $d$ 时，极板长度会跟着改成「刚好擦边」所需要的 $l$，射出点始终落在上极板右端。播放后看频闪：加速段点子变疏，偏转段水平间距均匀、竖直间距变大。

<Question text="(1) 电子通过 B 点时的速度大小" set={{t: "tB"}} hint="加速段用动能定理，竖直极板的间距不必知道" />

<Question text="(2) 水平极板的长度 l" set={{t: "tOut"}} hint="正中间射入又擦边射出，竖直位移是 d/2" />

<Question text="(3) 射出水平极板时的动能" set={{t: "tOut"}} hint="中线到极板的电势差是 U/2" />

<Param name="U0" label="加速电压" symbol="U_0" color="field" value={50} min={20} max={100} step={1} unit="V" />

<Param name="U" label="偏转电压" symbol="U" color="field" value={25} min={10} max={60} step={1} unit="V" />

<Param name="d" label="偏转极板间距" symbol="d" value={4} min={2} max={6} step={0.2} unit="L" digits={1} />

<Param name="sAcc" label="竖直极板间距" value={4} min={4} max={4} step={1} unit="L" hidden={true} />

<Param name="gap" label="两段电场的间隔" value={2} min={2} max={2} step={1} unit="L" hidden={true} />

<Param name="plateH" label="竖直极板半高" value={5} min={5} max={5} step={1} unit="L" hidden={true} />

<Param name="t" label="时间" symbol="t" value={0} min={0} max={12} step={0.01} unit="T" hidden={true} />

<Define name="m" expr="1" />

<Define name="qe" expr="1" />

<Define name="vB" expr="sqrt(2*qe*U0/m)" />

<Define name="l" expr="d*sqrt(2*U0/U)" />

<Define name="Ek" expr="qe*(U0 + U/2)" />

<Define name="vyExit" expr="sqrt(qe*U/m)" />

<Define name="xIn" expr="sAcc + gap" />

<Define name="xOut" expr="xIn + l" />

<Motion
  name="pt"
  until={8}
  mass="m"
  charge="-qe"
  state={{x: 0, y: 0, vx: 0, vy: 0}}
  fields={[
    {label: "加速电场", E: "U0/sAcc", angle: 180, region: {xmin: -0.0001, xmax: "sAcc", ymin: "-plateH", ymax: "plateH"}, exit: "tB"},
    {label: "偏转电场", E: "U/d", angle: -90, region: {xmin: "xIn", xmax: "xOut", ymin: "-d/2", ymax: "d/2"}, enter: "tIn", exit: "tOut"}
  ]}
  read={{yExit: "y @ tOut"}}
/>

<Define name="yNow" expr="pt.y(t)" />

<Define name="vNow" expr="sqrt(pt.vx(t)^2 + pt.vy(t)^2)" />

<Define name="EkNow" expr="0.5*m*(pt.vx(t)^2 + pt.vy(t)^2)" />

<Status cases={[
  {when: "t >= tOut - 0.008", label: "已擦边射出，此后匀速直线", tone: "success"},
  {when: "t >= tIn - 0.008", label: "偏转中：水平匀速，竖直匀加速", tone: "info"},
  {when: "t >= tB - 0.008", label: "已过 B 点，无场间隔中匀速", tone: "neutral"},
  {label: "加速中：从静止被拉向 B", tone: "info"}
]} />

<Preset label="回到题目取值" set={{U0: 50, U: 25, d: 4, t: 0}} />

<Preset label="通过 B 点" set={{t: "tB"}} />

<Preset label="进入偏转电场" set={{t: "tIn"}} />

<Preset label="刚好射出" set={{t: "tOut"}} />

<Sim
  title="电子从 A 静止出发，擦过上极板右端"
  height={460}
  duration="tOut + 0.45"
  playSeconds={10}
  time="t"
  timeUnit="T"
  params={["pt", "sAcc", "plateH", "d", "l", "xIn", "xOut", "U0", "U", "qe", "vB", "vyExit", "tB", "tIn", "tOut"]}
  hud={[
    {symbol: "v", label: "速度", expr: "vNow", unit: "L/T", digits: 2},
    {symbol: "E_k", label: "动能", expr: "EkNow", unit: "eV", digits: 2},
    {symbol: "y", label: "高度", expr: "yNow", unit: "L", digits: 2}
  ]}
  legend={[
    {kind: "field", label: "电场方向"},
    {kind: "velocity", label: "速度"},
    {kind: "force", label: "电场力"},
    {kind: "strobe", label: "频闪 0.2 T"}
  ]}
  note="电子圆点放大了，便于观察；极板和轨迹用同一比例。电场箭头是场强方向，电子带负电，受力与箭头相反。两段极板之间的空隙没有电场，不改变三个所求量。"
  marks={[
    {t: 0, label: "静止于 A"},
    {t: "tB", label: "通过 B 点", color: "velocity"},
    {t: "tIn", label: "进入偏转电场", color: "field"},
    {t: "tOut", label: "刚好射出", color: "charge"}
  ]}
>
sim({
  at(t, p) {
    return p.pt.state(t)
  },
  draw(ctx, s, v) {
    const p = v.p
    const H = p.plateH
    const d2 = p.d / 2
    const xIn = p.xIn
    const xOut = p.xOut
    const hole = 0.55
    const yHead = d2 + p.vyExit * 0.45
    const m = v.view({
      xmin: -1.8,
      xmax: xOut + p.vB * 0.45 + 1.4,
      ymin: -H - 2.2,
      ymax: Math.max(H, yHead) + 1.6,
      equal: true,
      pad: 16,
    })

    v.regions(m, p.pt)

    v.bar(m, 0, -H, 0, H, { thick: 8 })
    v.bar(m, p.sAcc, hole, p.sAcc, H, { thick: 8 })
    v.bar(m, p.sAcc, -H, p.sAcc, -hole, { thick: 8 })
    v.bar(m, xIn, d2, xOut, d2, { thick: 8 })
    v.bar(m, xIn, -d2, xOut, -d2, { thick: 8 })

    v.line(m, xIn, 0, xOut, 0, { color: v.color.steel, dash: [5, 4], width: 1 })
    v.axisX(m, {
      y: -H - 1.25,
      step: 2,
      from: 0,
      to: Math.ceil(xOut / 2) * 2,
      unit: 'x / L',
    })

    v.trail(m, (st) => [st.x, st.y], { kind: 'velocity' })
    v.strobe(m, (st) => [st.x, st.y], { every: 0.2, r: 2.4, kind: 'velocity' })

    const inAcc = s.x >= -0.05 && s.x <= p.sAcc + 0.02 && v.t <= p.tB + 0.02
    const inDef = v.t >= p.tIn - 0.02 && v.t <= p.tOut + 0.02 && s.x >= xIn - 0.02 && s.x <= xOut + 0.05
    if (inAcc) {
      const F = p.qe * p.U0 / p.sAcc
      v.vec(m, s.x, s.y + 0.28, F * 0.1, 0, { kind: 'force', label: 'F' })
    }
    if (inDef) {
      const F = p.qe * p.U / p.d
      v.vec(m, s.x, s.y, 0, F * 0.14, { kind: 'force', label: 'F' })
    }
    const sp2 = s.vx * s.vx + s.vy * s.vy
    if (sp2 > 0.04) {
      const kV = 1.7 / p.vB
      v.vec(m, s.x, s.y, s.vx * kV, s.vy * kV, { kind: 'velocity', label: 'v' })
    }

    v.ball(m, s.x, s.y, 0.16, { charge: true, label: 'e⁻' })

    v.dim(m, xIn, -d2 - 1.3, xOut, -d2 - 1.3, 'l = ' + p.l.toFixed(2))
    v.dim(m, (p.sAcc + xIn) / 2, -d2, (p.sAcc + xIn) / 2, d2, 'd = ' + p.d.toFixed(2))

    v.label(m, -0.85, -0.7, 'A')
    v.label(m, p.sAcc + 0.15, hole + 0.55, 'B')
    v.label(m, -0.7, H - 0.35, '−')
    v.label(m, p.sAcc + 0.65, H - 0.4, '+')
    v.label(m, p.sAcc / 2, -H + 0.7, 'U_0')
    v.label(m, (xIn + xOut) / 2, d2 + 0.58, '+  U')
    v.label(m, (xIn + xOut) / 2, -d2 - 0.5, '−')

    v.event(m, p.sAcc, 0, '通过 B 点', { at: p.tB, kind: 'velocity' })
    v.event(m, xIn, 0, '进入偏转电场', { at: p.tIn, kind: 'field' })
    v.event(m, xOut, d2, '刚好从边缘射出', { at: p.tOut, kind: 'charge' })
  },
})
</Sim>

右极板 B 处是电子穿出的小孔。水平极板的长度就是按擦边条件算出的 $l$。侧栏里「射出时高度」应始终等于 $d/2$。

<ForceDiagram
  title="偏转区里的电子：只有竖直电场力"
  surface={{type: "none"}}
  body={{shape: "particle", charge: "-", label: "电子"}}
  forces={[
    {label: "F", angle: 90, magnitude: "qe*U/d", showValue: true, unit: "eV/L", digits: 2}
  ]}
/>

偏转区内水平方向没有力，$v_x$ 不变，轨迹才是抛物线。力的读数是 $eU/d$，单位与 eV、L 配套。重力已按题目去掉，这一个力不能平衡。

<Readout items={[
  {label: "通过 B 点的速度", symbol: "v_B", expr: "vB", unit: "L/T", digits: 2, color: "velocity"},
  {label: "水平极板长度", symbol: "l", expr: "l", unit: "L", digits: 2, color: "velocity"},
  {label: "射出时动能", symbol: "E_k", expr: "Ek", unit: "eV", digits: 2, color: "charge"},
  {label: "射出时高度", symbol: "y", expr: "yExit", unit: "L", digits: 2, color: "velocity"},
  {label: "半间距", symbol: "d/2", expr: "d/2", unit: "L", digits: 2}
]} />

<Answer items={[
  {label: "通过 B 点的速度", symbol: "v_B", expr: "vB", value: 10, unit: "L/T", digits: 2},
  {label: "水平极板长度", symbol: "l", expr: "l", value: 8, unit: "L", digits: 2},
  {label: "射出时动能", symbol: "E_k", expr: "Ek", value: 62.5, unit: "eV", digits: 2}
]} />

## 四、结合图像理解关键时刻

题目取值下，竖直极板间距取 $4\ \text{L}$。电子从静止匀加速，平均速度是末速度的一半，通过 B 的时刻是

$$
t_B=\frac{2\times 4}{v_B}=\frac{8}{10}=0.8\ \text{T}
$$

空隙 $2\ \text{L}$ 用时 $0.2\ \text{T}$，进入偏转电场在 $1.0\ \text{T}$。板长 $8\ \text{L}$，再过 $0.8\ \text{T}$，于 $1.8\ \text{T}$ 擦边射出。频闪每隔 $0.2\ \text{T}$，正好落在这三个时刻上。

<Plot
  title="轨迹：抛物线擦过上极板右端"
  caption="虚线是极板。射出点落在上极板右端，离开电场后轨迹变直线。"
  x={{name: "xx", label: "x", unit: "L", min: 0, max: "xOut + vB*0.45 + 1"}}
  y={{label: "y", unit: "L", min: "-d/2 - 1", max: "d/2 + vyExit*0.45 + 0.8"}}
  series={[
    {label: "上极板", expr: "xx >= xIn and xx <= xOut ? d/2 : NaN", color: "steel", dash: true},
    {label: "下极板", expr: "xx >= xIn and xx <= xOut ? -d/2 : NaN", color: "steel", dash: true},
    {label: "轨迹", x: "pt.x(tt)", expr: "pt.y(tt)", over: {name: "tt", min: 0, max: "tOut + 0.45"}, color: "velocity"}
  ]}
  marks={[
    {x: "sAcc", series: 2, label: "B 点"},
    {x: "xIn", series: 2, label: "进入"},
    {x: "xOut", series: 2, label: "擦到边缘"}
  ]}
/>

<Plot
  title="速度分量随时间变化"
  caption="v_y 从进入偏转到射出的面积等于竖直位移 d/2。v_x、v_y 都是速度，虚线用来区分 v_y。"
  x={{name: "tt", label: "t", unit: "T", min: 0, max: "tOut + 0.45"}}
  y={{label: "v", unit: "L/T", min: 0}}
  series={[
    {label: "v_x", expr: "pt.vx(tt)", color: "velocity"},
    {label: "v_y", expr: "pt.vy(tt)", color: "velocity", dash: true}
  ]}
  areas={[
    {series: 1, from: "tIn", until: "tOut", label: "面积 = d/2", color: "velocity"}
  ]}
  marks={[
    {x: "tB", series: 0, label: "通过 B"},
    {x: "tIn", series: 1, label: "进入偏转"},
    {x: "tOut", series: 1, label: "射出"}
  ]}
  cursor="t"
/>

$v_x$–$t$ 在加速段是过原点的斜直线，出了竖直极板就变成水平线。斜率里含有竖直极板间距，而这个间距题目没给，所以求 $v_B$ 用动能定理，不去读这条斜率。

$v_y$ 在进入偏转电场之前一直是 $0$。$t_B$ 到进入时刻之间的平台，就是图上故意留出的无场间隔；两段电场若紧挨着，$v_y$ 会从通过 B 点立刻开始增大。射出之后 $v_y$ 不再变化，代表值下是 $5\ \text{L/T}$。

<Plot
  title="动能的两段上升"
  caption="第一段上升量是 eU_0，第二段是 eU/2。中间平台仍是无场间隔。"
  x={{name: "tt", label: "t", unit: "T", min: 0, max: "tOut + 0.45"}}
  y={{label: "E_k", unit: "eV", min: 0}}
  series={[
    {label: "动能", expr: "0.5*m*(pt.vx(tt)^2 + pt.vy(tt)^2)", color: "charge"},
    {label: "eU_0", expr: "qe*U0", color: "field", dash: true},
    {label: "e(U_0+U/2)", expr: "Ek", color: "charge", dash: true}
  ]}
  marks={[
    {x: "tB", series: 0, label: "通过 B"},
    {x: "tIn", series: 0, label: "进入偏转"},
    {x: "tOut", series: 0, label: "射出"}
  ]}
  cursor="t"
/>

代表值下，动能先升到 $50\ \text{eV}$，间隙里保持不变，再升到 $62.5\ \text{eV}$，之后是水平线。拖动 $U$ 时，第二段上升量和极板长度一起变，射出点仍贴着边缘。

## 五、答案汇总

字母式是考试答案。右侧一列是 $m=1$、$e=1$、$U_0=50\ \text{V}$、$U=25\ \text{V}$、$d=4\ \text{L}$ 时的读数。

| 小问 | 字母结果 | 代表值 |
|---|---|---|
| （1）通过 B 点的速度 | $v_B=\sqrt{2eU_0/m}$ | $10\ \text{L/T}$ |
| （2）水平极板长度 | $l=d\sqrt{2U_0/U}$ | $8\ \text{L}$ |
| （3）射出时的动能 | $E_k=e(U_0+U/2)$ | $62.5\ \text{eV}$ |

这组取值下 $l/d=2$，$E_k:eU_0=5:4$。
