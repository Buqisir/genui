---
id: gd22-13
title: 滑杆上的滑块
source: 2022 广东卷 第 13 题（计算；必考题共 42 分，原卷未单列本题分值）
question: |
  某同学受自动雨伞开伞过程的启发，设计了如图所示的物理模型。竖直放置在水平桌面上的滑杆上套有一个滑块，初始时它们处于静止状态。当滑块从 A 处以初速度 v_0 为 10 m/s 向上滑动时，受到滑杆的摩擦力 f 为 1 N，滑块滑到 B 处与滑杆发生完全非弹性碰撞，带动滑杆离开桌面一起竖直向上运动。已知滑块的质量 m = 0.2 kg，滑杆的质量 M = 0.6 kg，A、B 间的距离 l = 1.2 m，重力加速度 g 取 10 m/s^2，不计空气阻力。求：

  （1）滑块在静止时和向上滑动的过程中，桌面对滑杆支持力的大小 N_1 和 N_2；

  （2）滑块碰撞前瞬间的速度大小 v_1；

  （3）滑杆向上运动的最大高度 h。
answers:
  - { name: N1, value: 8, unit: N }
  - { name: N2, value: 5, unit: N }
  - { name: v1, value: 8, unit: m/s }
  - { name: h, value: 0.2, unit: m }
---

滑杆竖直立在水平桌面上，滑块套在杆上。初始两者都静止，滑块在 A。滑块从 A 以 $v_0 = 10\ \mathrm{m/s}$ 向上滑，滑杆对它的摩擦力 $f = 1\ \mathrm{N}$ 向下；滑块对滑杆的反作用力向上，把滑杆往上提，桌面的支持力因此减小，但滑杆仍压在桌面上。滑块走完 $l = 1.2\ \mathrm{m}$ 到达 B，与滑杆发生完全非弹性碰撞，碰后两者以同一速度离开桌面一起上升，再在重力作用下减速，上升到的最高处就是滑杆的最大高度。

## 完整解答

**（1）桌面的支持力。** 静止时滑块与滑杆之间没有相对运动趋势，摩擦力为零。把滑块和滑杆看成一个整体，桌面的支持力等于两者的总重力，

$$
N_1 = (m + M)g = (0.2 + 0.6) \times 10 = \boxed{8\ \mathrm{N}}
$$

单独看滑杆也一样：滑块压在杆上，对杆的压力等于滑块的重力 $mg$，所以 $N_1 = Mg + mg$。

滑块向上滑动时，受到向下的摩擦力 $f = 1\ \mathrm{N}$。滑块的加速度向下，大小

$$
a = \frac{mg + f}{m} = \frac{0.2 \times 10 + 1}{0.2} = 15\ \mathrm{m/s^2}
$$

由牛顿第三定律，滑块对滑杆的摩擦力向上，大小仍为 $1\ \mathrm{N}$。滑杆仍静止：重力 $Mg$ 向下，摩擦力 $f$ 和桌面支持力 $N_2$ 向上，

$$
N_2 + f = Mg
$$

$$
\boxed{N_2 = Mg - f = 6 - 1 = 5\ \mathrm{N}}
$$

$N_2 > 0$，滑杆仍然压在桌面上，直到碰撞才离开。

**（2）碰撞前的速度。** 滑块从 A 到 B 做加速度向下的加速度运动，初速度向上，位移 $l = 1.2\ \mathrm{m}$。取向上为正，

$$
v_1^2 = v_0^2 - 2 a l = 10^2 - 2 \times 15 \times 1.2 = 100 - 36 = 64
$$

$$
\boxed{v_1 = 8\ \mathrm{m/s}}
$$

方向仍向上。

**（3）滑杆上升的最大高度。** 碰撞时间极短，重力冲量和桌面的冲量都可以不计，滑块与滑杆动量保守。完全非弹性碰撞后两者共速，设共同速度为 $v$，

$$
m v_1 = (m + M) v
$$

$$
v = \frac{m v_1}{m + M} = \frac{0.2 \times 8}{0.2 + 0.6} = 2\ \mathrm{m/s}
$$

碰后两者一起离开桌面，只受重力，加速度为 $g$。滑杆从桌面起跳，速度从 $v$ 减到零时上升最高，

$$
v^2 = 2 g h
$$

$$
\boxed{h = \frac{v^2}{2g} = \frac{2^2}{2 \times 10} = 0.2\ \mathrm{m}}
$$

## 交互演示

拖动时间看滑块沿滑杆上升、在 B 处碰撞、再和滑杆一起离开桌面。摩擦减速、碰撞时刻和最高点都由运动积分定位。

<Param name="t" label="时间" value={0} min={0} max={1} step={0.001} unit="s" />

<Param name="v0" label="初速度" symbol="v_0" value={10} min={4} max={16} step={0.1} unit="m/s" color="velocity" />

<Param name="f" label="摩擦力" symbol="f" value={1} min={0} max={4} step={0.1} unit="N" color="force" />

<Param name="m" label="滑块质量" symbol="m" value={0.2} min={0.1} max={0.5} step={0.05} unit="kg" />

<Param name="M" label="滑杆质量" symbol="M" value={0.6} min={0.2} max={1.2} step={0.05} unit="kg" />

<Param name="l" label="A 到 B" symbol="l" value={1.2} min={0.4} max={2.4} step={0.1} unit="m" />

<Param name="g" label="重力加速度" value={10} hidden unit="m/s²" />

<Define name="N1" expr="(m + M)*g" />

<Define name="N2" expr="M*g - f" />

<Define name="aBlk" expr="(m*g + f)/m" />

<Define name="v1" expr="sqrt(max(v0^2 - 2*aBlk*l, 0))" />

<Define name="vCom" expr="m*v1/(m + M)" />

<Define name="h" expr="vCom^2/(2*g)" />

<Motion name="um" until={2}
  state={{phase: 0}}
  bodies={[
    {name: "K", mass: "m", along: 90, x: 0, v: "v0",
      forces: [
        {label: "G", angle: -90, magnitude: "m*g"},
        {label: "f", angle: -90, magnitude: "phase < 0.5 ? f : 0"}
      ]},
    {name: "R", mass: "M", along: 90, x: 0, v: 0,
      forces: [
        {label: "G", angle: -90, magnitude: "M*g"},
        {label: "f'", angle: 90, magnitude: "phase < 0.5 ? f : 0"},
        {label: "N", angle: 90, magnitude: "phase < 0.5 ? M*g - f : 0"}
      ]}
  ]}
  events={[
    {name: "tB", when: "l - xK", dir: "down",
      set: {vK: "m*v1/(m+M)", vR: "m*v1/(m+M)", phase: 1}},
    {name: "tTop", when: "vR", dir: "down", stop: true}
  ]}
  read={{
    hRod: "xR @ tTop",
    vHit: "vK @ tB"
  }}
/>

<Question text="（1）静止时和上滑过程中，桌面对滑杆的支持力 N_1、N_2" set={{t: 0}} hint="静止时桌面托住滑块和滑杆；上滑时摩擦反作用力向上，支持力减小 f" />

<Question text="（2）滑块碰撞前瞬间的速度 v_1" set={{t: "tB"}} hint="从 A 到 B 加速度向下，用 v_1² = v_0² − 2al" />

<Question text="（3）滑杆向上运动的最大高度 h" set={{t: "tTop"}} hint="完全非弹性碰撞后共速，再做上抛到速度为零" />

<Preset label="题目数值" set={{v0: 10, f: 1, m: 0.2, M: 0.6, l: 1.2, t: 0}} />

<Preset label="刚碰上 B" set={{t: "tB"}} />

<Preset label="升到最高" set={{t: "tTop"}} />

<Status cases={[
  {when: "t < tB - 1e-6", label: "滑块上滑，滑杆仍压在桌面上", tone: "info"},
  {when: "t < tTop - 1e-6", label: "已共速，滑杆正在上升", tone: "success"},
  {label: "滑杆到达最大高度", tone: "neutral"}
]} />

<Readout items={[
  {label: "静止时的支持力", symbol: "N_1", expr: "N1", unit: "N", digits: 2, color: "force"},
  {label: "上滑时的支持力", symbol: "N_2", expr: "N2", unit: "N", digits: 2, color: "force"},
  {label: "碰前速度", symbol: "v_1", expr: "v1", unit: "m/s", digits: 2, color: "velocity"},
  {label: "共同速度", symbol: "v", expr: "vCom", unit: "m/s", digits: 2, color: "velocity"},
  {label: "最大高度", symbol: "h", expr: "h", unit: "m", digits: 3}
]} />

<Answer items={[
  {label: "静止时的支持力", symbol: "N_1", expr: "N1", value: 8, unit: "N"},
  {label: "上滑时的支持力", symbol: "N_2", expr: "N2", value: 5, unit: "N"},
  {label: "碰撞前的速度", symbol: "v_1", expr: "v1", value: 8, unit: "m/s"},
  {label: "滑杆的最大高度", symbol: "h", expr: "h", value: 0.2, unit: "m"}
]} />

<ForceDiagram title="滑块向上滑动时滑杆的受力" size="narrow"
  surface={{type: "ground"}}
  body={{shape: "rod", label: "滑杆"}}
  forces={[
    {label: "Mg", angle: -90, magnitude: "M*g", showValue: true, unit: "N"},
    {label: "f'", angle: 90, magnitude: "f", showValue: true, unit: "N"},
    {label: "N_2", angle: 90, solve: "Ndesk", showValue: true, unit: "N"}
  ]}
/>

<Sim title="滑块沿滑杆上升并碰撞" height={460} duration={0.8} time="t"
  params={["um", "l", "h", "tB", "tTop", "v1", "vCom"]}
  marks={[
    {t: 0, label: "从 A 出发"},
    {t: "tB", label: "在 B 处碰撞"},
    {t: "tTop", label: "滑杆升到最高"}
  ]}
  hud={[
    {symbol: "v_K", expr: "um.vK(t)", unit: "m/s", digits: 2},
    {symbol: "v_R", expr: "um.vR(t)", unit: "m/s", digits: 2},
    {symbol: "h", expr: "h", unit: "m", digits: 3}
  ]}
  note="滑块宽度相对杆长放大，不按比例。尺寸线 l 是杆底到横档 B 的距离；虚线是滑杆底端能升到的高度，旁边的尺寸线是 h。"
>
sim({
  at(t, p) {
    return p.um.state(t)
  },
  draw(ctx, s, v) {
    const top = Math.max(p.l + p.h, p.l) + 0.55
    const m = v.view({ xmin: -0.7, xmax: 0.95, ymin: -0.32, ymax: top, equal: true })
    v.ground(m, -0.7, 0.95, 0)
    const yRod = s.xR
    const yB = yRod + p.l
    const yA = yRod + s.xK
    v.bar(m, 0, yRod, 0, yB + 0.16, { thick: 10 })
    v.bar(m, -0.16, yB, 0.16, yB, { thick: 12 })
    v.block(m, 0, yA, 0.28, 0.16)
    v.label(m, -0.46, yRod + p.l * 0.55, '滑杆')
    v.label(m, -0.46, yA + 0.24, '滑块')
    v.text(m, -0.26, yRod + 0.2, 'A', { color: v.color.ink })
    v.text(m, 0.32, yB + 0.16, 'B', { color: v.color.ink })
    v.dim(m, 0.5, yRod, 0.5, yB, 'l')
    v.line(m, -0.55, p.h, 0.6, p.h, { color: v.color.steel, dash: true })
    v.dim(m, 0.72, 0, 0.72, p.h, 'h')
    if (s.vK > 0.05) v.vec(m, -0.24, yA + 0.2, 0, Math.min(s.vK, 10) * 0.035, { kind: 'velocity', label: 'v' })
    if (s.phase > 0.5 && s.vR > 0.05) v.vec(m, 0.2, yRod + p.l * 0.62, 0, s.vR * 0.05, { kind: 'velocity', label: 'v' })
    v.event(m, -0.46, yB + 0.28, '碰撞', { at: p.tB, kind: 'force' })
    v.event(m, -0.3, p.h + 0.16, '最高', { at: p.tTop, kind: 'velocity' })
  },
})
</Sim>

<Plot title="滑块与滑杆的速度" size="wide"
  x={{name: "t", label: "t", unit: "s", min: 0, max: 0.8}}
  y={{label: "v", unit: "m/s", min: -1, max: 12}}
  series={[
    {label: "滑块", expr: "um.vK(t)", color: "velocity"},
    {label: "滑杆", expr: "um.vR(t)", color: "velocity", dash: true}
  ]}
  marks={[
    {x: "tB", label: "碰撞，共速"},
    {x: "tTop", label: "速度减到零"}
  ]}
  cursor="t"
/>

<Plot title="离开桌面的高度" size="wide"
  x={{name: "t", label: "t", unit: "s", min: 0, max: 0.8}}
  y={{label: "y", unit: "m", min: -0.05, max: "l + h + 0.2"}}
  series={[
    {label: "滑块", expr: "um.xK(t)", color: "velocity"},
    {label: "滑杆底端", expr: "um.xR(t)", color: "velocity", dash: true},
    {label: "横档 B", expr: "um.xR(t) + l", color: "steel", dash: true}
  ]}
  marks={[
    {x: "tB", label: "滑块到达 B"},
    {x: "tTop", label: "滑杆最高"}
  ]}
  cursor="t"
/>

左侧受力图是滑块上滑期间的滑杆：重力向下，摩擦的反作用力和支持力都向上，由平衡解出 $N_2 = Mg - f$。

## 结合图像

速度图上，滑块从 $10\ \mathrm{m/s}$ 以斜率 $-15\ \mathrm{m/s^2}$ 降到碰撞前的 $8\ \mathrm{m/s}$，碰撞那一刻竖直掉到共同速度 $2\ \mathrm{m/s}$。滑杆在碰撞前一直是零，碰撞后跳到同一速度，再和滑块一起以斜率 $-g$ 降到零。

高度图上，滑块的曲线从零升到 $l$，在碰撞时刻与横档 B 的高度相交。滑杆底端在碰撞前贴在桌面（高度为零），碰后上升，速度为零时到达 $h = 0.2\ \mathrm{m}$。

碰撞后的动能 $\tfrac12(m+M)v^2 = 1.6\ \mathrm{J}$，小于碰前的 $\tfrac12 m v_1^2 = 6.4\ \mathrm{J}$。差额在完全非弹性碰撞中损失，动量仍然保守。

## 答案汇总

（1）静止时 $\boxed{N_1 = 8\ \mathrm{N}}$，向上滑动时 $\boxed{N_2 = 5\ \mathrm{N}}$。

（2）碰撞前瞬间滑块的速度 $\boxed{v_1 = 8\ \mathrm{m/s}}$。

（3）滑杆向上运动的最大高度 $\boxed{h = 0.2\ \mathrm{m}}$。
