---
id: r5-03-double-field
title: "两个匀强磁场中的带电粒子"
subject: physics
topic: 带电粒子在磁场中的运动
source: "选必2 模块备考卷 15 题（14 分）"
breadcrumb: ["选择性必修 2", "磁场", "带电粒子在磁场中的运动"]
question: |
  相距为 d 的两平行虚线 L₁ 和 L₂（L₁ 在上），L₁ 上方和 L₂ 下方都是垂直于纸面向里、磁感应强度相同的匀强磁场，两虚线之间没有磁场。A、B 两点都在 L₂ 上。质量为 m、电荷量为 +q 的带电粒子从 A 点以初速度 v₀ 与 L₂ 成 30° 斜向上射出，经过偏转后正好过 L₂ 上的 B 点，经过 B 点时速度方向也斜向上，不计粒子的重力。
  (1) 求 A、B 两点的距离；
  (2) 若另一质量为 m、电荷量为 -q 的粒子从 A 点以同样的速度射出，粒子是否还能经过 B 点，说明理由；
  (3) 若该粒子从 A 点以 v₀ 与 L₂ 成 60° 斜向上射出，粒子仍能经过 B 点，求两种出射情况下从 A 点到达 B 点的时间之比。
answers:
  - { name: AB, value: 3.464101615, unit: m }
  - { name: t30, value: 10.283185307, unit: s }
  - { name: t60, value: 25.777759152, unit: s }
  - { name: tratio, value: 0.398916960, unit: "" }
---

## 一、题目条件分析

两条平行虚线 $L_1$、$L_2$ 相距 $d$，$L_1$ 在上。$L_1$ 上方和 $L_2$ 下方是磁感应强度大小相同、方向都垂直纸面向里的匀强磁场，中间没有磁场。把磁感应强度的大小记为 $B$。

质量为 $m$、电荷量为 $+q$ 的粒子从 $L_2$ 上的 $A$ 点射出，初速度大小 $v_0$，方向与 $L_2$ 成 $30°$，斜向上。重力不计。

粒子离开 $A$ 之后会再碰到 $L_2$ 两次。第一次速度斜向下，是进入下方磁场的位置。第二次速度又变成斜向上。题目中的 $B$ 是这一次的位置：速度再次斜向上时与 $L_2$ 的交点。$AB$ 沿 $L_2$ 量。

圆周运动的半径和周期只由 $m$、$q$、$v_0$、$B$ 决定：

$$
R=\frac{mv_0}{qB},\qquad T=\frac{2\pi m}{qB}=\frac{2\pi R}{v_0}
$$

$T$ 与速率无关，也与出射角无关。题目没有给出具体数值。演示取 $d=1\ \text{m}$，$m=1\ \text{kg}$，$q=1\ \text{C}$，$v_0=1\ \text{m/s}$，$B=1\ \text{T}$，于是 $R=1\ \text{m}$，$T=2\pi\ \text{s}$。这组数把圆弧和间距放在同一尺度上，不是微观粒子的真实质量与电荷。第 (1) 问的距离与 $v_0$、$B$ 无关；第 (3) 问的时间比与 $T$ 和 $d/v_0$ 的相对大小有关，一般式留在解答里。

## 二、完整解答

取 $L_2$ 为 $x$ 轴，$A$ 为原点，向右为正，$L_1$ 在 $y=d$。出射方向与 $L_2$ 的夹角记为 $\theta$，第 (1) 问 $\theta=30°$。

正电荷在向里的磁场中逆时针旋转：左手定则中磁感线穿入掌心，四指沿速度方向，速度向右时洛伦兹力向上。负电荷受力相反，顺时针旋转。洛伦兹力不做功，速率一直是 $v_0$。

从一次「在 $L_2$ 上、速度斜向上」到下一次同样的状态，称为一个循环，共四段。

**无磁场，斜向上。** 直线越过宽度 $d$，水平位移

$$
x_1=d\cot\theta
$$

**上磁场。** 圆与边界有两个交点。圆心到边界的距离是 $R\cos\theta$，半弦长

$$
\sqrt{R^2-(R\cos\theta)^2}=R\sin\theta
$$

沿边界相距 $2R\sin\theta$。正电荷的圆心在入射点的左上方，粒子走留在磁场内的优弧，圆心角 $2\pi-2\theta$，出射点在入射点左侧：

$$
x_2=-2R\sin\theta
$$

离开时速度斜向下，与边界的夹角仍是 $\theta$。

**无磁场，斜向下。** 水平位移仍是

$$
x_3=d\cot\theta
$$

**下磁场。** 圆心在入射点的右上方，落在无磁场一侧。粒子走劣弧，圆心角 $2\theta$，出射点在入射点右侧：

$$
x_4=+2R\sin\theta
$$

离开时速度斜向上，与 $L_2$ 的夹角为 $\theta$。这个出射点就是本循环的终点。

两段圆弧的水平位移等大反向，一个循环的前进量只剩两段直线：

$$
\Delta x=2d\cot\theta
$$

每个循环里两段圆心角之和是 $2\pi$，在磁场中的时间正好是一个周期 $T$，与 $\theta$ 无关。两段直线的时间是 $2d/(v_0\sin\theta)$。

### （1）A、B 的距离

$\theta=30°$ 时，一个循环的终点就是题目中的 $B$：

$$
AB=2d\cot 30°=2\sqrt{3}\,d
$$

代入 $d=1\ \text{m}$：

$$
AB=\boxed{3.464\ \text{m}}
$$

$R$ 已消掉，距离与 $v_0$、$B$ 无关。代表性数值下，$2R\sin 30°=1\ \text{m}$，两段直线各 $\sqrt{3}\ \text{m}$。上磁场圆心角 $300°$，下磁场 $60°$。

### （2）电荷量为 −q 的粒子

能经过同一点 $B$。

负电荷改为顺时针。上磁场变成圆心角 $2\theta$ 的劣弧，水平位移 $+2R\sin\theta$；下磁场变成圆心角 $2\pi-2\theta$ 的优弧，水平位移 $-2R\sin\theta$。两段仍然等大反向，直线部分不变，一个循环的前进量仍是 $2d\cot\theta$，终点仍是 $B$。到达时速度仍斜向上，速率仍是 $v_0$。

两段圆心角之和仍是 $2\pi$，每个循环的时间与正电荷相同。

### （3）30° 与 60° 的时间比

$\theta=60°$ 时，一个循环前进 $2d\cot 60°=2d/\sqrt{3}$。与 $30°$ 的落点相比

$$
\frac{2\sqrt{3}\,d}{2d/\sqrt{3}}=3
$$

正好是 3 倍。$60°$ 射出后，第 3 个循环的终点才是原来的 $B$。这与 $R$ 无关，所以任意磁感应强度下都能经过 $B$。

$30°$ 只走 1 个循环：

$$
t_{30}=T+\frac{2d}{v_0\sin 30°}=T+\frac{4d}{v_0}
$$

$60°$ 走 3 个循环。一个循环的直线时间是

$$
\frac{2d}{v_0\sin 60°}=\frac{4d}{\sqrt{3}\,v_0}
$$

三个循环的直线时间是 $12d/(\sqrt{3}\,v_0)=4\sqrt{3}\,d/v_0$，磁场中是 $3T$：

$$
t_{60}=3T+\frac{4\sqrt{3}\,d}{v_0}
$$

$$
\frac{t_{30}}{t_{60}}=\frac{T+4d/v_0}{3T+4\sqrt{3}\,d/v_0}=\frac{2\pi m/(qB)+4d/v_0}{6\pi m/(qB)+4\sqrt{3}\,d/v_0}
$$

$T$ 和 $d/v_0$ 消不掉。题目没有给出 $B$ 的数值，时间比保留成这个式子。代表性数值 $T=2\pi\ \text{s}$、$d/v_0=1\ \text{s}$ 下：

$$
t_{30}=2\pi+4=\boxed{10.283\ \text{s}}
$$

$$
t_{60}=6\pi+4\sqrt{3}=\boxed{25.778\ \text{s}}
$$

$$
\frac{t_{30}}{t_{60}}=\frac{\pi+2}{3\pi+2\sqrt{3}}=\boxed{0.3989}
$$

即 $t_{30}:t_{60}=(2\pi+4):(6\pi+4\sqrt{3})$。负电荷的时间与正电荷相同，比值不变。

常见疏忽：把斜向下穿过 $L_2$ 的位置当成 $B$；正电荷在上磁场用了劣弧的圆心角 $2\theta$；只算 $60°$ 的一个循环，那个落点不是原来的 $B$；把时间比约成与 $B$ 无关的数。

## 三、交互演示

动画按洛伦兹力积分，画面不套用圆弧公式。代表性数值是 $d=1\ \text{m}$，$m=1\ \text{kg}$，$q=1\ \text{C}$，$v_0=1\ \text{m/s}$，初始 $B=1\ \text{T}$，对应 $R=1\ \text{m}$。频闪每 $1\ \text{s}$ 一点。切换电荷或出射角后看落点是否仍是 $B$；拖动 $B$，看距离和时间比哪一个改变。

<Question text="求 A、B 两点的距离。" set={{theta: 30, qSign: 1, Bmag: 1, t: 0}} hint="两段圆弧的水平位移等大反向，只留下两段直线" />

<Question text="电荷量为 −q 的粒子以同样速度从 A 射出，还能经过 B 点吗？" set={{theta: 30, qSign: -1, Bmag: 1, t: 0}} hint="顺时针与逆时针对调后，圆弧位移仍然抵消" />

<Question text="出射角改为 60° 时仍经过 B 点，求两种情况下从 A 到 B 的时间之比。" set={{theta: 60, qSign: 1, Bmag: 1, t: 0}} hint="60° 每个循环的前进距离是 30° 的三分之一，正负电荷时间相同" />

<Param name="theta" label="出射角" symbol="θ" value={30} unit="°" color="velocity" options={[{value: 30, label: "30°"}, {value: 60, label: "60°"}]} />

<Param name="qSign" label="电荷种类" symbol="q" value={1} color="charge" options={[{value: 1, label: "+q"}, {value: -1, label: "−q"}]} />

<Param name="Bmag" label="磁感应强度" symbol="B" value={1} min={0.5} max={2} step={0.1} unit="T" color="field" />

<Param name="d" label="间距 d" value={1} min={0.5} max={2} step={0.1} unit="m" hidden />

<Param name="m" label="质量 m" value={1} min={0.5} max={2} step={0.1} unit="kg" hidden />

<Param name="q" label="电荷量大小 q" value={1} min={0.5} max={2} step={0.1} unit="C" hidden />

<Param name="v0" label="速率" symbol="v_0" value={1} min={0.5} max={2} step={0.1} unit="m/s" color="velocity" hidden />

<Param name="yEdge" label="下边界" value={-0.000001} min={-0.001} max={0} step={0.000001} hidden />

<Param name="t" label="时间" value={0} min={0} max={70} step={0.01} unit="s" hidden />

<Define name="R" expr="m*v0/(q*Bmag)" />

<Define name="Tper" expr="2*pi*R/v0" />

<Define name="AB" expr="2*sqrt(3)*d" />

<Define name="t30" expr="Tper + 4*d/v0" />

<Define name="t60" expr="3*Tper + 4*sqrt(3)*d/v0" />

<Define name="tratio" expr="t30/t60" />

<Define name="nCycle" expr="theta > 45 ? 3 : 1" />

<Define name="tStraight" expr="2*d/(v0*sin(deg(theta)))" />

<Define name="tCycle" expr="Tper + tStraight" />

<Define name="tArrive" expr="nCycle*tCycle" />

<Define name="ABcycle" expr="2*d*cos(deg(theta))/sin(deg(theta))" />

<Define name="xLand" expr="nCycle*ABcycle" />

<Define name="alphaUp" expr="qSign > 0 ? 360 - 2*theta : 2*theta" />

<Define name="alphaDn" expr="360 - alphaUp" />

<Motion
  name="pt"
  mass="m"
  charge="q*qSign"
  until="tArrive + 1"
  steps={4000}
  state={{x: 0, y: 0, vx: "v0*cos(deg(theta))", vy: "v0*sin(deg(theta))"}}
  fields={[
    {label: "上磁场", B: "Bmag", dir: "in", region: {ymin: "d"}, enter: "tIn1", exit: "tOut1"},
    {label: "下磁场", B: "Bmag", dir: "in", region: {ymax: "yEdge"}, enter: "tIn2", exit: "tOut2"},
  ]}
  read={{xBack: "x @ tOut2"}}
/>

<Preset label="30° 正电荷" set={{theta: 30, qSign: 1, Bmag: 1, t: 0}} />

<Preset label="30° 负电荷" set={{theta: 30, qSign: -1, Bmag: 1, t: 0}} />

<Preset label="60° 正电荷" set={{theta: 60, qSign: 1, Bmag: 1, t: 0}} />

<Preset label="停在 B 点" set={{t: "tArrive"}} />

<Status cases={[
  {when: "t >= tArrive - 0.02", label: "已经过 B 点，速度斜向上", tone: "success"},
  {when: "pt.y(t) >= d - 0.01 and qSign > 0", label: "上磁场中，正电荷逆时针转", tone: "info"},
  {when: "pt.y(t) >= d - 0.01", label: "上磁场中，负电荷顺时针转", tone: "info"},
  {when: "pt.y(t) <= -0.01 and qSign > 0", label: "下磁场中，正电荷逆时针转", tone: "warning"},
  {when: "pt.y(t) <= -0.01", label: "下磁场中，负电荷顺时针转", tone: "warning"},
  {label: "两虚线之间匀速直线", tone: "neutral"},
]} />

<Readout items={[
  {label: "A、B 距离", symbol: "AB", expr: "AB", unit: "m", digits: 3, color: "velocity"},
  {label: "本情形落点", symbol: "x_B", expr: "xLand", unit: "m", digits: 3, color: "velocity"},
  {label: "到达 B 的时间", symbol: "t_B", expr: "tArrive", unit: "s", digits: 3},
  {label: "时间比 t30/t60", symbol: "t_{30}/t_{60}", expr: "tratio", digits: 4},
  {label: "每循环前进", symbol: "Δx", expr: "ABcycle", unit: "m", digits: 3, color: "velocity"},
  {label: "首次回到 L2", symbol: "x_1", expr: "xBack", unit: "m", digits: 3, color: "velocity"},
  {label: "轨道半径", symbol: "R", expr: "R", unit: "m", digits: 3, color: "field"},
  {label: "上磁场圆心角", symbol: "α_1", expr: "alphaUp", unit: "°", digits: 0},
  {label: "下磁场圆心角", symbol: "α_2", expr: "alphaDn", unit: "°", digits: 0},
]} />

<Answer items={[
  {label: "A、B 距离（d = 1 m）", symbol: "AB", expr: "AB", value: 3.464101615, unit: "m", digits: 3},
  {label: "30° 用时（B = 1 T）", symbol: "t_{30}", expr: "t30", value: 10.283185307, unit: "s", digits: 3},
  {label: "60° 用时（B = 1 T）", symbol: "t_{60}", expr: "t60", value: 25.777759152, unit: "s", digits: 3},
  {label: "时间比 t30/t60（B = 1 T）", symbol: "t_{30}/t_{60}", expr: "tratio", value: 0.398916960, digits: 4},
]} />

<Sim
  title="从 A 到 B 的轨迹"
  height={500}
  duration="tArrive + 0.5"
  time="t"
  params={["pt", "d", "theta", "R", "AB", "qSign", "tArrive", "tIn1"]}
  hud={[
    {symbol: "x", label: "水平位置", expr: "pt.x(t)", unit: "m", digits: 2},
    {symbol: "y", label: "高度", expr: "pt.y(t)", unit: "m", digits: 2},
    {symbol: "v", label: "速率", expr: "sqrt(pt.vx(t)*pt.vx(t)+pt.vy(t)*pt.vy(t))", unit: "m/s", digits: 2},
  ]}
  legend={[
    {kind: "field", symbol: "B", label: "匀强磁场（向里）"},
    {kind: "velocity", symbol: "v", label: "速度"},
    {kind: "accel", symbol: "a", label: "向心加速度"},
    {kind: "strobe", label: "频闪 1 s"},
  ]}
  note="坐标等比例。d=1 m，m=1 kg，q=1 C，v_0=1 m/s，初始 R=1 m。频闪间隔 1 s。"
  marks={[
    {t: 0, label: "从 A 射出"},
    {t: "tIn1", label: "进入上磁场"},
    {t: "tOut1", label: "离开上磁场"},
    {t: "tIn2", label: "进入下磁场"},
    {t: "tArrive", label: "到达 B", color: "velocity"},
  ]}
>
sim({
  at(t, p) {
    return p.pt.state(t)
  },
  draw(ctx, s, v) {
    const p = v.p
    const th = (p.theta * Math.PI) / 180
    const R = p.R
    const sin = Math.sin(th)
    const cos = Math.cos(th)
    const cot = cos / sin
    const deep = R * (1 + cos)
    const shallow = R * (1 - cos)
    const yFloor = p.qSign > 0 ? -shallow : -deep
    const yCeil = p.d + (p.qSign > 0 ? deep : shallow)
    const xLeft = p.d * cot - R * (1 + sin)
    const xRight = p.qSign > 0 ? p.AB + 0.8 : p.AB + R * (1 + 2 * sin)
    const xmin = Math.min(-0.8, xLeft) - 0.9
    const xmax = xRight + 1.0
    const ymin = yFloor - 1.15
    const ymax = yCeil + 0.85
    const m = v.view({ xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax, equal: true, pad: 16 })
    const xDim = Math.min(-0.7, xLeft - 0.35)

    v.regions(m, p.pt, { step: 30 })
    v.line(m, xmin, 0, xmax, 0, { color: v.color.ink, width: 1.6, dash: [7, 5] })
    v.line(m, xmin, p.d, xmax, p.d, { color: v.color.ink, width: 1.6, dash: [7, 5] })
    v.label(m, xmax - 0.05, 0, 'L_2')
    v.label(m, xmax - 0.05, p.d, 'L_1')
    v.label(m, -0.15, p.d * 0.78, '无磁场')
    v.dim(m, xDim, 0, xDim, p.d, 'd')
    v.dim(m, 0, ymin + 0.42, p.AB, ymin + 0.42, 'AB = ' + p.AB.toFixed(3) + ' m')

    v.line(m, 0, 0, p.d * cot, p.d, { color: v.color.steel, width: 1, dash: [4, 4] })
    v.label(m, p.d * cot * 0.45, p.d * 0.62, 'θ = ' + p.theta + '°')

    v.trail(m, function (st) { return [st.x, st.y] }, { kind: 'velocity' })
    v.strobe(m, function (st) { return [st.x, st.y] }, { every: 1, kind: 'velocity' })

    v.circle(m, 0, 0, 0.04, { fill: v.color.ink })
    v.label(m, 0, 0, 'A')
    v.circle(m, p.AB, 0, 0.04, { fill: v.color.ink })
    v.label(m, p.AB, 0, 'B')
    v.ball(m, s.x, s.y, 0.09, { charge: true, label: p.qSign > 0 ? '+q' : '−q' })

    if (typeof s.vx === 'number') {
      v.vec(m, s.x, s.y, s.vx, s.vy, { kind: 'velocity', label: 'v' })
    }
    const ax = s.accx || 0
    const ay = s.accy || 0
    if (ax * ax + ay * ay > 1e-4) {
      v.vec(m, s.x, s.y, ax, ay, { kind: 'accel', label: 'a' })
    }

    if (typeof p.tIn1 === 'number' && p.tIn1 === p.tIn1) {
      v.event(m, p.d * cot, p.d, '进入上磁场', { at: p.tIn1, kind: 'field' })
    }
    v.event(m, p.AB, 0, '到达 B', { at: p.tArrive, kind: 'velocity' })
  },
})
</Sim>

<Plot
  title="高度随时间"
  caption="直线段在 L1 与 L2 之间，圆弧在磁场里。30° 正电荷时上方是 300° 优弧，下方只有很浅的 60° 弧。"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "tArrive + 0.5"}}
  y={{label: "y", unit: "m"}}
  series={[
    {label: "粒子", expr: "pt.y(s)", color: "velocity"},
    {label: "L_1", expr: "d", color: "steel", dash: true},
    {label: "L_2", expr: "0", color: "graphite", dash: true},
  ]}
  marks={[
    {x: "tIn1", label: "进上磁场"},
    {x: "tOut1", label: "出上磁场"},
    {x: "tIn2", label: "进下磁场"},
    {x: "tArrive", label: "到达 B"},
  ]}
  cursor="t"
/>

<Plot
  title="水平位置随时间"
  caption="优弧阶段 x 减小，劣弧阶段 x 增大，增减相消。60° 要三次这样的起伏才到达虚线 AB。"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "tArrive + 0.5"}}
  y={{label: "x", unit: "m"}}
  series={[
    {label: "粒子", expr: "pt.x(s)", color: "velocity"},
    {label: "B 点", expr: "AB", color: "ink", dash: true},
  ]}
  marks={[
    {x: "tIn1", label: "进上磁场"},
    {x: "tOut1", label: "出上磁场"},
    {x: "tIn2", label: "进下磁场"},
    {x: "tArrive", label: "到达 B"},
  ]}
  cursor="t"
/>

## 四、结合图像理解关键时刻

高度图里，两条虚线是 $L_1$ 和 $L_2$。粒子在两线之间时，$y$ 对 $t$ 是直线；进入磁场后改走圆弧。$30°$、正电荷时，$L_1$ 以上那一段又高又久，圆心角 $300°$；$L_2$ 以下只有深度 $R(1-\cos 30°)\approx 0.134\ \text{m}$ 的浅坑，圆心角 $60°$，大约 $1\ \text{s}$。进度条上「进入下磁场」和「到达 B」挨得很近，中间就是这段浅弧。斜向下穿过 $L_2$ 的位置还在 $B$ 的左侧，速度箭头斜向下；到达 $B$ 时箭头重新斜向上。

换成负电荷后，浅坑和深弧上下对调：上磁场圆心角变成 $60°$，下磁场变成 $300°$。进度条上「进入上磁场」和「离开上磁场」挨在一起，下方的弧拉长。总时间仍是 $t_{30}$。侧栏里两个圆心角之和一直是 $360°$。

水平位置图里，优弧对应 $x$ 下降，粒子往回绕；劣弧对应 $x$ 上升。升降幅度都是 $2R\sin\theta$。$30°$ 结束时 $x$ 等于 $AB$；$60°$ 时同样的起伏出现三次，第三次末了才碰到 $B$ 的虚线。侧栏「首次回到 L2」是模拟得到的第一个循环终点，应等于「每循环前进」：$30°$ 时就是 $AB$，$60°$ 时大约是 $AB$ 的三分之一。「本情形落点」在两种角度下都等于 $AB$。

速率读数停在 $1.00\ \text{m/s}$，频闪点沿轨迹等距，洛伦兹力没有做功。把 $B$ 调小，半径变大，优弧会绕到 $A$ 的左边，右侧的 $B$ 仍停在 $3.464\ \text{m}$。参考答案里距离仍然符合，时间比离开 $B=1\ \text{T}$ 时的 $0.3989$。

## 五、答案汇总

| 小问 | 结果 |
| --- | --- |
| (1) $A$、$B$ 的距离 | $2\sqrt{3}\,d$，代表性数值下 $3.464\ \text{m}$ |
| (2) $-q$ 能否经过 $B$ | 能。落点和每个循环的时间都与 $+q$ 相同 |
| (3) 时间比 | $\dfrac{T+4d/v_0}{3T+4\sqrt{3}\,d/v_0}$。代表性数值下 $t_{30}=10.283\ \text{s}$，$t_{60}=25.778\ \text{s}$，比值 $0.3989$ |
