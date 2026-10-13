---
id: gd24-07
title: 落到弹簧上的木块
source: 2024 广东卷 第 7 题（单选，4 分）
question: "如图所示，轻质弹簧竖直放置，下端固定。木块从弹簧正上方 H 高度处由静止释放。以木块释放点为原点，取竖直向下为正方向。木块的位移为 y。所受合外力为 F，运动时间为 t。忽略空气阻力，弹簧在弹性限度内。关于木块从释放到第一次回到原点的过程中。其 F–y 图像或 y–t 图像可能正确的是（　　）\n\n【图】斜线阴影表示水平地面。地面上竖直立着一根弹簧，下端固定在地面。弹簧正上方有一个方块，方块下沿到弹簧上端的竖直双箭头标 H。\n\nA.【图】F–y 图像，纵轴 F、横轴 y。从纵轴上某一正值引出水平线段向右，在横轴上 H 的左侧折成斜向下的直线；该直线在标 H 的位置穿过横轴，继续伸到负半轴。H 标在斜线与横轴的交点上，折点处没有竖虚线。\n\nB.【图】F–y 图像，纵轴 F、横轴 y。从纵轴上某一正值引出水平线段向右，在横轴标 H 处折成斜向下的直线，折点到横轴有一条竖直虚线。斜线在 H 的右侧穿过横轴，继续伸到负半轴。\n\nC.【图】y–t 图像，纵轴 y、横轴 t，原点 O。曲线从原点出发，斜率逐渐增大，穿过一条标 H 的水平虚线后继续上升，到达圆滑的最高点后下降，再次穿过该虚线，最后回到横轴。\n\nD.【图】y–t 图像，纵轴 y、横轴 t，原点 O。从原点出发的直线向上，穿过一条标 H 的水平虚线后到达一个尖角顶点，再沿直线下降，穿过该虚线后回到横轴。"
choice: B
answers: []
---

木块从释放点自由落下，接触弹簧后合外力随位移线性减小，过平衡位置后反向，再被弹回到原点。题目只给出字母 H，下面取一组代表性数值：H = 0.4 m，m = 0.2 kg，k = 40 N/m，g = 10 m/s²。弹簧原长只用来画图，不进入动力学。

## 题目条件分析

以释放点为原点，竖直向下为正。木块从 y = 0 由静止释放，弹簧上端在 y = H。

- 0 ≤ y ≤ H：木块还没碰到弹簧，只受重力，合外力 F = mg，是与 y 无关的正常数。
- y > H：弹簧形变量为 y − H，弹簧力向上，

$$
F = mg - k(y - H)
$$

是一条斜率为 −k 的直线。它在平衡位置

$$
y_0 = H + \frac{mg}{k}
$$

穿过横轴。因为 mg/k > 0，这个零点一定在 H 的右侧。

接触以后以 y_0 为平衡位置做简谐运动。木块在弹簧上端的速度为 v_H = \sqrt{2gH}，振幅

$$
A = \sqrt{\left(\frac{mg}{k}\right)^2 + \frac{2mgH}{k}}
$$

大于 mg/k，所以最低点在平衡位置之下，合外力在那里为负。离开弹簧时速度向上、大小仍为 \sqrt{2gH}，再经过一段自由上升回到 y = 0。

## 完整解答

**A 错误。** 未接触时 F = mg 不变，水平段应一直延伸到 y = H。A 在 H 的左侧就折了，等于认为木块还没到弹簧上端就已经受到弹簧力。另外，斜线与横轴的交点是平衡位置 y_0，不是 H。

**B 正确。** 0 到 H 之间 F = mg，是水平线段；y = H 处弹簧开始形变，折成斜率 −k 的直线；直线在 y_0 = H + mg/k 穿过横轴，也就是 H 的右侧，再伸到负半轴。折点正好对着横轴上的 H。

代入代表性数值：接触前 F = mg = 2 N；平衡位置

$$
y_0 = 0.4 + \frac{0.2 \times 10}{40} = 0.45\ \text{m}
$$

比 H 大 0.05 m。最低点的压缩量由能量守恒

$$
\frac12 k x_m^2 = mg\, x_m + mgH
$$

解出 x_m = 0.256 m，y_m = H + x_m = 0.656 m，对应 F = mg − kx_m = −8.25 N。

**C 错误。** 接触前 y = ½t²g，曲线从原点出发、斜率逐渐增大，这一段没错。但接触之后合外力仍然向下，速度继续增大，直到 y = y_0 才达到最大；之后合外力向上，速度减小，到最低点才为零。图像上应该是一条先变陡、再变平、再向下弯的光滑曲线，而不是穿过 y = H 之后立刻到达圆滑顶点再下降。回程对称：再次穿过 y = H 时速度已经向上，之后在重力作用下速度的绝对值越来越小，曲线越来越平，到达原点时速度恰好为零，不是以有限斜率撞回横轴。

代表性数值下，接触时刻 t_H = \sqrt{2H/g} = 0.283 s，最低点 t_m = 0.411 s，离开弹簧 t_L = 0.540 s，第一次回到原点 t_R = 0.822 s。最低点比接触点晚 0.128 s。

**D 错误。** 两段直线加一个尖角，表示速度大小不变、在顶点突然反向。木块一直受力，速度连续变化，最低点速度为零且曲线光滑，不可能出现尖角。

因此选 B。

## 交互演示

拖动时间，看木块从释放、接触、压到最低、再回到原点。两张图的游标跟随同一时刻：F–y 图上水平段在 y = H 处折下，零点在 H 右侧；y–t 图上接触之后还继续上升，顶点圆滑。

<Param name="t" label="时间" value={0} min={0} max={0.9} step={0.001} unit="s" />

<Param name="H" label="释放高度 H" value={0.4} min={0.2} max={0.6} step={0.01} unit="m" />

<Param name="k" label="劲度系数 k" value={40} min={20} max={80} step={1} unit="N/m" />

<Param name="m" label="木块质量" value={0.2} min={0.1} max={0.4} step={0.01} unit="kg" />

<Param name="g" value={10} hidden />

<Param name="L0" label="弹簧原长" value={0.3} hidden />

<Define name="yEq" expr="H + m*g/k" />

<Motion name="blk" mass="m" along={-90} until={2}
  state={{x: 0, v: 0}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g"},
    {label: "Fs", angle: 90, magnitude: "x > H ? k*(x - H) : 0"}
  ]}
  events={[
    {name: "tH", when: "x - H", dir: "up"},
    {name: "tBot", when: "v", dir: "down"},
    {name: "tLeave", when: "H - x", dir: "up"},
    {name: "tBack", when: "v", dir: "up", stop: true}
  ]}
  read={{
    yMax: "max(x)",
    Fbot: "(m*g - (x > H ? k*(x - H) : 0)) @ tBot",
    yBack: "x @ tBack"
  }}
/>

<Define name="Fnow" expr="m*g - (blk.x(t) > H ? k*(blk.x(t) - H) : 0)" />

<Sim title="木块落到弹簧上" size="narrow" height={420} duration="tBack" time="t"
  params={["blk", "H", "L0", "m", "g", "k"]}
  marks={[
    {t: 0, label: "由静止释放"},
    {t: "tH", label: "接触弹簧"},
    {t: "tBot", label: "到达最低点"},
    {t: "tLeave", label: "离开弹簧"},
    {t: "tBack", label: "回到原点"}
  ]}
  hud={[
    {symbol: "y", expr: "blk.x(t)", unit: "m", digits: 3},
    {symbol: "F", expr: "m*g - (blk.x(t) > H ? k*(blk.x(t) - H) : 0)", unit: "N", digits: 2}
  ]}
  note="竖直向下为正。弹簧原长只用于画图，不按比例。"
>
sim({
  at(t, p) {
    const s = p.blk.state(t)
    return { y: s.x, v: s.v, acc: s.acc }
  },
  draw(ctx, s, v) {
    const p = v.p
    const ground = -p.L0
    const yBlock = s.y + ground + p.L0
    const m = v.view({ xmin: -0.42, xmax: 0.42, ymin: ground - 0.16, ymax: Math.max(yBlock + 0.42, p.H + 0.34), equal: true })
    v.ground(m, -0.4, 0.4, ground)
    const springTop = ground + Math.max(0.05, p.L0 - Math.max(0, s.y - p.H))
    v.spring(m, 0, ground, 0, springTop, { coils: 9 })
    v.block(m, 0, yBlock, 0.16, 0.1, { label: 'm' })
    v.dim(m, 0.24, ground + p.L0, 0.24, ground + p.L0 + p.H, 'H')
    const yc = yBlock + 0.05
    const vLen = Math.max(-0.22, Math.min(0.22, -s.v * 0.05))
    const aLen = Math.max(-0.2, Math.min(0.2, -s.acc * 0.012))
    v.vec(m, 0.2, yc, 0, vLen, { kind: 'velocity', label: 'v' })
    v.vec(m, -0.2, yc, 0, aLen, { kind: 'accel', label: 'a' })
  },
})
</Sim>

<Plot title="合外力随位移" size="wide"
  x={{name: "y", label: "y", unit: "m", min: 0, max: "blk.yMax * 1.08"}}
  y={{label: "F", unit: "N"}}
  series={[{
    label: "F",
    color: "force",
    over: {name: "yy", min: 0, max: "blk.yMax"},
    x: "yy",
    expr: "m*g - (yy > H ? k*(yy - H) : 0)"
  }]}
  marks={[
    {x: "H", label: "接触，y = H"},
    {x: "yEq", label: "合外力为 0"},
    {x: "blk.yMax", label: "最低点"},
    {x: "blk.x(t)", label: "此刻"}
  ]}
  cursor="t"
  values={false}
  caption="水平段到 y = H 才折下，零点在 H 右侧：这就是选项 B。"
/>

<Plot title="位移随时间" size="wide"
  x={{name: "t", label: "t", unit: "s", min: 0, max: "tBack"}}
  y={{label: "y", unit: "m", min: 0, max: "blk.yMax * 1.15"}}
  series={[{label: "y", expr: "blk.x(t)", color: "velocity"}]}
  marks={[
    {x: "tH", label: "接触 y = H"},
    {x: "tBot", label: "最低点，圆滑"},
    {x: "tBack", label: "回到原点"}
  ]}
  cursor="t"
  caption="接触之后仍继续上升，顶点圆滑，没有尖角。"
/>

<Question text="A. F–y 图：水平段在 H 左侧折下，斜线在 H 处穿过横轴"
  set={{t: 0}}
  hint="拖动时间：未到 y = H 时合外力始终是 mg，不会提前折下" />

<Question text="B. F–y 图：水平段在 y = H 处折下，斜线在 H 右侧穿过横轴"
  set={{t: "tBot"}}
  hint="看 F–y 图：折点正对 y = H，零点在平衡位置，比 H 大" />

<Question text="C. y–t 图：穿过 y = H 后立刻到圆滑顶点再下降"
  set={{t: "tH"}}
  hint="接触时合外力仍然向下，位移还要继续增大" />

<Question text="D. y–t 图：两段直线，顶点是尖角"
  set={{t: "tBot"}}
  hint="最低点速度为零，曲线圆滑，没有尖角" />

<Preset label="刚接触弹簧" set={{t: "tH"}} />

<Preset label="最低点（合外力向上）" set={{t: "tBot"}} />

<Preset label="第一次回到原点" set={{t: "tBack"}} />

<Status cases={[
  {when: "t < tH", label: "未接触：F = mg，自由落体", tone: "info"},
  {when: "t < tBot", label: "已接触，合外力仍向下，还在加速", tone: "warning"},
  {when: "abs(t - tBot) < 0.01", label: "最低点：速度为 0，合外力向上", tone: "success"},
  {when: "t < tLeave", label: "弹簧把木块向上推，尚未离开", tone: "info"},
  {when: "t < tBack", label: "已离开弹簧，向上减速", tone: "neutral"},
  {label: "第一次回到原点，速度为 0", tone: "success"}
]} />

<Readout items={[
  {label: "位移", symbol: "y", expr: "blk.x(t)", unit: "m", digits: 3, color: "velocity"},
  {label: "合外力", symbol: "F", expr: "Fnow", unit: "N", digits: 2, color: "force"},
  {label: "平衡位置", symbol: "y_0", expr: "yEq", unit: "m", digits: 3},
  {label: "最低点位移", symbol: "y_m", expr: "blk.yMax", unit: "m", digits: 3}
]} />

<Answer items={[
  {label: "答案", text: "B"},
  {label: "平衡位置在 H 右侧", symbol: "y_0", expr: "yEq", value: 0.45, unit: "m", digits: 3},
  {label: "最低点合外力向上", symbol: "F", expr: "blk.Fbot", value: -8.25, unit: "N", digits: 2}
]} />

## 结合图像看关键时刻

刚释放时 y = 0、v = 0，F–y 图上的点在纵轴上的 mg。自由下落阶段这个点沿水平线向右移，y–t 图的斜率不断变大。

到 y = H 时弹簧形变量为零，弹簧力为零，合外力仍是 mg，所以折点不跳变。此后 F 随 y 线性减小。在 y_0 = H + mg/k 之前，合外力仍然向下，木块还在加速，y–t 曲线继续变陡。

过了 y_0，弹簧力大于重力，F 为负，木块减速。速度减到零的那一点就是最低点：y–t 曲线在这里水平相切，圆滑地折返，不会出现尖角。

向上返回时再次经过 y_0 和 y = H。离开弹簧后只剩重力，速度向上且越来越小，到达原点时速度恰好为零。

## 答案汇总

$\boxed{B}$

判据：未接触时 F = mg，接触后 F = mg − k(y − H)，零点在 y = H + mg/k，也就是 H 的右侧。y–t 曲线在最低点圆滑，且接触之后仍继续上升一段。
