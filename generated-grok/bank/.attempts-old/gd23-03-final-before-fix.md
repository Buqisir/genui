---
id: gd23-03
title: 铯原子喷泉钟：激光关闭后的图像
subject: physics
topic: 竖直上抛运动
source: 2023 广东卷 第 3 题（单选，4 分）
question: |
  铯原子喷泉钟是定标“秒”的装置。在喷泉钟的真空系统中，可视为质点的铯原子团在激光的推动下，获得一定的初速度。随后激光关闭，铯原子团仅在重力的作用下做竖直上抛运动，到达最高点后再做一段自由落体运动。取竖直向上为正方向。下列可能表示激光关闭后铯原子团速度 v 或加速度 a 随时间 t 变化的图像是（　　）

  A.【图】v–t 图像。纵轴 v、横轴 t，原点 O。一条直线从纵轴正半轴上的一点出发，向右下方倾斜，与横轴相交后改以较缓的斜率向右上方离开横轴，末端有一条短的竖直虚线。图线全程在横轴及其上方，没有进入负半轴。

  B.【图】v–t 图像。纵轴 v、横轴 t，原点 O。一条直线从纵轴正半轴上的一点出发，向右下方倾斜，穿过横轴进入负半轴后继续向下，末端有一条短的竖直虚线。没有折返。

  C.【图】a–t 图像。纵轴 a、横轴 t，原点 O。先有一段位于横轴上方的水平线段（从纵轴附近向右延伸），接着改成一段位于横轴下方的水平线段，该段末端有一条短的竖直虚线。

  D.【图】a–t 图像。纵轴 a、横轴 t，原点 O。只有一段位于横轴下方的水平线段，与纵轴之间隔着一段空隙；线段左右两端各有一条竖直虚线向上连到横轴。
choice: B
answers: []
---

## 一、题目条件分析

- 铯原子团在真空中可视为质点。激光先把它推到某一向上的初速度，随后激光关闭。
- 激光关闭之后只受重力，空气阻力不计，没有第二个力。
- 题目取竖直向上为正，所以重力加速度写成负值，整个过程加速度都是 $-g$。
- 运动是一段竖直上抛：速度减到零到达最高点，接着继续做自由落体。最高点只是速度过零，受力不变。
- 题目只比较图像形状，没有给出 $v_0$ 和 $g$。下方演示取代表性数值 $g=10\ \text{m/s}^2$、$v_0=4\ \text{m/s}$。换成别的正值，直线还是直线，正负号也不变。力图里再取 $m=1\ \text{kg}$，只为把重力画成可读的箭头。

## 二、完整解答

取向上为正。激光关闭后合外力就是重力：

$$
F=-mg
$$

$$
a=\frac{F}{m}=-g
$$

加速度的大小和方向都不随时间改变。上升、最高点、下落是同一段匀变速，不要拆成两段不同的加速度。速度因此均匀变化：

$$
v=v_0-gt
$$

$v$–$t$ 图是一条斜率恒为 $-g$ 的直线：从纵轴上的正值 $v_0$ 出发，向右下方穿过横轴，进入负半轴后继续向下。$a$–$t$ 图是从 $t=0$ 开始、位于横轴下方的水平直线 $a=-g$。四个选项里，正确的加速度图并没有画出来；C、D 都不是这条直线。正确选项是速度图 B。

用代表性数值把过零点算清楚。$v_0=4\ \text{m/s}$，$g=10\ \text{m/s}^2$：

$$
t_{\text{顶}}=\frac{v_0}{g}=\frac{4}{10}=0.4\ \text{s}
$$

$$
H=\frac{v_0^2}{2g}=\frac{16}{20}=0.8\ \text{m}
$$

$t=0.6\ \text{s}$（已经过了最高点）：

$$
v=4-10\times 0.6=-2\ \text{m/s}<0
$$

这条直线的斜率在最高点前后都是

$$
\frac{\Delta v}{\Delta t}=-g=-10\ \text{m/s}^2
$$

### 选项 A：错误

A 的实线碰到横轴以后改成较缓的斜率，再向右上方离开，整条线留在横轴及其上方。

$v$–$t$ 图的斜率就是加速度。激光已经关闭，加速度只能是 $-g$，斜率不能变缓，也不能由负变成正。过最高点后速度方向改为竖直向下，按题目的正方向 $v<0$，图线必须进入负半轴。上面的计算里，$t=0.6\ \text{s}$ 时 $v=-2\ \text{m/s}$，A 的图上没有这个状态。

A、B 末端以及 C 后一段末端的短竖直虚线，是标出“图线讨论到这里为止”，不是速度或加速度的图线。判定 A 不成立，看的是实线折回正半轴、斜率变了。

### 选项 B：正确

B 的实线从纵轴正半轴出发，以不变的斜率向右下方穿过横轴，进入负半轴后继续向下，没有折返。这就是 $v=v_0-gt$。末端的短竖直虚线同样只是截止记号，不表示速度突变。

### 选项 C：错误

C 先在横轴上方画一段水平线，再改到横轴下方，表示加速度先向上、后向下。

激光关闭后 $a=-g$，没有正的一段。上升时速度变小，是因为加速度与速度反向，不是因为加速度为正。仍用代表性数值，上升途中 $t=0.2\ \text{s}$：

$$
v=4-10\times 0.2=2\ \text{m/s}>0,\qquad a=-10\ \text{m/s}^2<0
$$

正的速度和负的加速度同时存在，C 的前一段不存在。最高点之后加速度也不改号，后一段不该另起一条新水平线。

### 选项 D：错误

D 有一条位于横轴下方的水平线段，取值本身可以对应 $a=-g$。它和纵轴之间却隔着空隙，左右两端又各有一条竖直虚线向上连到横轴。这张图表示：从原点起先有一段时间加速度不是 $-g$，中间才取负的恒量，这段结束后又离开 $-g$。

激光关闭的瞬间加速度就是 $-g$。按代表性数值，$t=0$ 时

$$
a=-g=-10\ \text{m/s}^2
$$

并且一直保持到下落结束。$a$–$t$ 图应当从纵轴上的 $-g$ 起，向右画一条不间断的水平直线。空隙和两端接到横轴的虚线都不符合。

$$
\boxed{B}
$$

> 易错点：最高点的速度是零，加速度不是零。上升和随后的自由落体加速度都是 $-g$。把速度画成“速率”（始终不取负值），或者在最高点把斜率改掉，就会得到类似 A 的图。

## 三、交互演示

上方动画从激光关闭画起。初速度滑块的初始值是 $4\ \text{m/s}$，$g$ 固定取 $10\ \text{m/s}^2$。把初速度改成别的正数，最高点和时间会变，$v$–$t$ 仍是斜率为 $-g$ 的直线，$a$–$t$ 仍是 $a=-g$。力图中的质量取 $1\ \text{kg}$，重力标成 $10\ \text{N}$；加速度等于 $g$，与这个质量无关。

点右侧的选项，时间会跳到最能核对那张图的时刻。频闪点每隔 $0.1\ \text{s}$ 一个：靠近最高点变密，过了最高点又变疏，左右对称，说明加速度大小没变。速度箭头上升时朝上、下落时朝下；加速度箭头始终朝下，长度画成恒定。速度和加速度单位不同，两个箭头的长短不能互相比。

速度图用来核对 A、B。加速度图是正确画法（从 $t=0$ 起的水平直线 $a=-g$），用来核对 C、D；C 和 D 都不是这张图。

<Param name="v0" label="激光关闭时的速度" symbol="v_0" color="velocity" value={4} min={2} max={8} step={0.5} unit="m/s" />

<Param name="t" label="时间" symbol="t" value={0} min={0} max={2} step={0.01} unit="s" hidden={true} />

<Define name="g" expr="10" />

<Define name="m" expr="1" />

<Define name="tTop" expr="v0/g" />

<Define name="tBack" expr="2*v0/g" />

<Define name="tRise" expr="v0/(2*g)" />

<Define name="tFall" expr="3*v0/(2*g)" />

<Define name="v" expr="v0 - g*t" />

<Define name="a" expr="-g" />

<Define name="y" expr="v0*t - g*t^2/2" />

<Define name="H" expr="v0^2/(2*g)" />

<Question text="A.【图】v–t 图像。纵轴 v、横轴 t，原点 O。一条直线从纵轴正半轴上的一点出发，向右下方倾斜，与横轴相交后改以较缓的斜率向右上方离开横轴，末端有一条短的竖直虚线。图线全程在横轴及其上方，没有进入负半轴。" set={{t: "tFall"}} hint="此时已过最高点：速度为负，v–t 斜率仍是 -g，没有折回正半轴" />

<Question text="B.【图】v–t 图像。纵轴 v、横轴 t，原点 O。一条直线从纵轴正半轴上的一点出发，向右下方倾斜，穿过横轴进入负半轴后继续向下，末端有一条短的竖直虚线。没有折返。" set={{t: "tFall"}} hint="下落阶段速度为负，与上升段在同一条直线上，这就是选项 B" />

<Question text="C.【图】a–t 图像。纵轴 a、横轴 t，原点 O。先有一段位于横轴上方的水平线段（从纵轴附近向右延伸），接着改成一段位于横轴下方的水平线段，该段末端有一条短的竖直虚线。" set={{t: "tRise"}} hint="上升阶段速度仍为正，加速度已经是 -g，不存在横轴上方的那一段" />

<Question text="D.【图】a–t 图像。纵轴 a、横轴 t，原点 O。只有一段位于横轴下方的水平线段，与纵轴之间隔着一段空隙；线段左右两端各有一条竖直虚线向上连到横轴。" set={{t: 0}} hint="t=0 时加速度就是 -g，图线从纵轴开始，没有空隙，也没有接到横轴的间断" />

<Preset label="对照选项 B：速度已为负" set={{t: "tFall"}} />

<Preset label="激光刚关闭" set={{t: 0}} />

<Preset label="上升途中" set={{t: "tRise"}} />

<Preset label="最高点" set={{t: "tTop"}} />

<Preset label="落回抛出高度" set={{t: "tBack"}} />

<Status cases={[
  {when: "abs(t - tTop) < 0.02", label: "最高点：速度为零，加速度仍是 -g", tone: "success"},
  {when: "t < 0.02", label: "激光刚关闭：加速度立即为 -g", tone: "neutral"},
  {when: "t < tTop", label: "正在上升：速度为正，加速度为 -g", tone: "info"},
  {when: "t < tBack - 0.02", label: "正在下落：速度为负，加速度仍为 -g", tone: "info"},
  {label: "落回抛出高度：速度为 -v_0", tone: "success"}
]} />

<Sim
  title="激光关闭后的竖直上抛"
  height={400}
  duration="tBack"
  playSeconds={8}
  time="t"
  params={["v0", "g", "H", "tTop", "tBack"]}
  hud={[
    {symbol: "v", label: "速度", expr: "v", unit: "m/s", digits: 2},
    {symbol: "a", label: "加速度", expr: "a", unit: "m/s²", digits: 1}
  ]}
  legend={[
    {kind: "velocity", symbol: "v", label: "速度（向上为正）"},
    {kind: "accel", symbol: "a", label: "加速度 a=-g"},
    {kind: "strobe", label: "每隔 0.1 s 的位置"}
  ]}
  note="播放已放慢。v 与 a 单位不同，箭头长短不能互相比；a 的箭头长度画成恒定。g=10 m/s²，v₀ 为代表性数值"
  marks={[
    {t: 0, label: "激光关闭"},
    {t: "tTop", label: "最高点"},
    {t: "tBack", label: "落回抛出高度"}
  ]}
>
sim({
  at(t, p) {
    return {
      y: p.v0 * t - 0.5 * p.g * t * t,
      v: p.v0 - p.g * t,
      a: -p.g,
    }
  },
  draw(ctx, s, v) {
    const p = v.p
    const H = p.H
    const m = v.view({ xmin: -1.15, xmax: 1.45, ymin: -0.5, ymax: H + 0.72, equal: true, pad: 16 })
    v.line(m, -0.9, 0, 1.2, 0, { color: v.color.ink, width: 1.5 })
    v.label(m, -0.9, -0.2, '抛出高度', { color: v.color.graphite })
    v.line(m, 0, 0, 0, H, { color: v.color.steel, width: 1, dash: [5, 4] })
    v.dim(m, 0.58, 0, 0.58, H, 'H=' + H.toFixed(2) + ' m')
    v.arrow(m, -0.62, H, -0.62, H + 0.32, { color: v.color.ink })
    v.label(m, -0.62, H + 0.42, '向上为正', { color: v.color.graphite })
    v.strobe(m, (st) => [0, st.y], { every: 0.1, r: 3, kind: 'velocity' })
    v.ball(m, 0, s.y, 0.055, { label: 'Cs' })
    if (Math.abs(s.v) > 0.25) {
      v.vec(m, 0, s.y, 0, s.v * 0.06, { kind: 'velocity', label: 'v=' + s.v.toFixed(1) })
    }
    v.vec(m, 0.28, s.y, 0, -0.3, { kind: 'accel', label: 'a=-g' })
    v.event(m, 0, H, '最高点 v=0', { at: p.tTop, kind: 'velocity' })
    v.event(m, 0, 0.18, '激光关闭', { at: 0, kind: 'accel' })
    v.event(m, 0, 0.18, '落回抛出高度', { at: p.tBack, kind: 'velocity' })
  },
})
</Sim>

<ForceDiagram
  title="激光关闭后只受重力"
  surface={{type: "none"}}
  body={{shape: "ball", label: "Cs"}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g", showValue: true, unit: "N"},
  ]}
  mass="m"
  accel={{angle: -90, magnitude: "g"}}
/>

<Readout items={[
  {label: "速度", symbol: "v", expr: "v", unit: "m/s", digits: 2, color: "velocity"},
  {label: "加速度", symbol: "a", expr: "a", unit: "m/s²", digits: 1, color: "accel"},
  {label: "高度", symbol: "h", expr: "y", unit: "m", digits: 2, color: "velocity"},
  {label: "到最高点的时间", symbol: "t_顶", expr: "tTop", unit: "s", digits: 2},
]} />

<Plot
  title="v–t 图像：斜率恒为 -g，并进入负半轴"
  caption="与选项 B 的实线相同；过最高点后不折返，用来排除 A"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "tBack"}}
  y={{label: "v", unit: "m/s", min: "-v0 - 1", max: "v0 + 1"}}
  series={[
    {label: "铯原子团", expr: "v0 - g*s", color: "velocity"},
  ]}
  marks={[
    {x: "tTop", series: 0, label: "v=0，斜率不变"},
    {x: "tBack", series: 0, label: "v=-v_0"},
  ]}
  cursor="t"
/>

<Plot
  title="a–t 图像：从 t=0 起恒为 -g"
  caption="正确的加速度图：贴着纵轴的水平直线。C 多了正值段，D 多了空隙和两端虚线"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "tBack"}}
  y={{label: "a", unit: "m/s²", min: "-g - 6", max: 6}}
  series={[
    {label: "加速度", expr: "-g", color: "accel"},
  ]}
  marks={[
    {x: 0, label: "t=0 时已是 -g"},
    {x: "tTop", label: "最高点 a 不变"},
  ]}
  cursor="t"
/>

<Answer items={[
  {label: "答案", text: "B"},
  {label: "v–t 图", text: "斜率恒为 -g 的直线，穿过横轴进入负半轴"},
  {label: "a–t 图", text: "从 t=0 起为 a=-g 的水平直线（C、D 都不是）"},
]} />

## 四、结合图像理解关键时刻

对着上面的两张图看三个时刻。加速度图在这些时刻都停在 $a=-g$ 上。

1. $t=0$，激光刚关闭。$v=v_0>0$，$a=-g$。加速度图在纵轴处就已经在横轴下方，所以不是 D 那种离开纵轴的线段，也不是 C 在横轴上方的那一段。

2. $t=t_{\text{顶}}=v_0/g$，最高点。速度为零，加速度仍是 $-g$。$v$–$t$ 图只是穿过横轴，斜率不变。这里最容易把“速度为零”看成“加速度为零”。

3. 同一高度，一上一下。$t=v_0/(2g)$ 时还在上升，$t=3v_0/(2g)$ 时正在下落，高度相同，速度等大反向，加速度都是 $-g$。代表性数值下这两个时刻是 $0.2\ \text{s}$ 和 $0.6\ \text{s}$，高度都是 $0.6\ \text{m}$，速度分别是 $+2\ \text{m/s}$ 和 $-2\ \text{m/s}$。下落段必须画进负半轴，而且和上升段共线，这就是 B，不是 A。

$v$–$t$ 图线与横轴所围的面积是位移：横轴以上为正，以下为负。从出发到落回抛出高度，上下两块面积都是 $H$，一正一负，总位移为零。回到原高度的时刻是 $t=2v_0/g$，此时 $v=-v_0$。代表性数值下就是 $t=0.8\ \text{s}$，$v=-4\ \text{m/s}$。

## 五、答案汇总

| 选项 | 判断 | 要点 |
| --- | --- | --- |
| A | 错误 | 斜率改变，速度没有进入负半轴 |
| B | 正确 | $v=v_0-gt$，直线穿到负半轴且不折返 |
| C | 错误 | 加速度不会先正后负 |
| D | 错误 | $a=-g$ 应从 $t=0$ 连续画出，不能留空隙 |
| 本题 | B | 单选 4 分 |
