---
id: gd24-10
title: 斜坡滑下的两个滑块
source: 2024 广东卷 第 10 题（多选，6 分）
question: "如图所示，光滑斜坡上，可视为质点的甲、乙两个相同滑块，分别从 H_甲、H_乙 高度同时由静止开始下滑。斜坡与水平面在 O 处平滑相接，滑块与水平面间的动摩擦因数为 μ，乙在水平面上追上甲时发生弹性碰撞。忽略空气阻力。下列说法正确的有（　　）\n\nA. 甲在斜坡上运动时与乙相对静止\n\nB. 碰撞后瞬间甲的速度等于碰撞前瞬间乙的速度\n\nC. 乙的运动时间与 H_乙 无关\n\nD. 甲最终停止位置与 O 处相距 H_乙/μ"
choice: ABD
answers:
  - { name: vJiaAfter, value: 3.80227, unit: m/s }
  - { name: vYiBefore, value: 3.80227, unit: m/s }
  - { name: xStop, value: 3, unit: m }
  - { name: xByH, value: 3, unit: m }
---

题目只给了字母。下面取代表性数值：斜面倾角 $\theta = 30^\circ$，$g = 10\,\mathrm{m/s^2}$，动摩擦因数 $\mu = 0.4$，两滑块质量都是 $m = 1\,\mathrm{kg}$，释放高度 $H_\text{甲} = 0.5\,\mathrm{m}$、$H_\text{乙} = 1.2\,\mathrm{m}$。斜坡光滑，水平面粗糙，两段在 O 处平滑相接。画面按这组数值画，滑块画成有尺寸的方块，不按质点比例。

沿斜面向下的加速度只由重力分力决定：

$$
a = g\sin\theta
$$

两块相同、同时由静止释放，在斜坡上加速度始终相等。乙比甲高出的距离不变，两者相对静止。

滑块滑到 O 的速度由机械能守恒得出，与质量、倾角都无关：

$$
v = \sqrt{2gH}
$$

水平面上摩擦减速度大小为 $\mu g$。乙进入水平面时比甲快，又比甲滑得更远，一定能在停下之前追上甲。质量相等的弹性正碰交换速度：碰撞后瞬间甲的速度等于碰撞前瞬间乙的速度。

交换之后，甲带着乙碰撞前的速度继续滑行。把这一段接上乙在碰撞前已经走过的路程，就等于乙独自从 O 滑到停下的全部路程，所以甲的停止处离 O

$$
x = \frac{v_\text{乙}^2}{2\mu g} = \frac{H_\text{乙}}{\mu}
$$

这里的 $v_\text{乙}$ 是乙进入水平面时的速度，不是碰撞前瞬间的速度。

## 完整解答

**A 正确。** 斜坡光滑，两滑块沿斜面向下的加速度都是 $a = g\sin\theta$，与质量、高度无关。两者同时由静止开始，速度始终相等，相对速度为零，所以甲在斜坡上运动的整段时间里与乙相对静止。

**B 正确。** 由释放点到 O，$\tfrac12 mv^2 = mgH$，得 $v = \sqrt{2gH}$。代表性数值下

$$
v_\text{甲} = \sqrt{2\times 10\times 0.5} = \sqrt{10}\approx 3.16\,\mathrm{m/s},\qquad v_\text{乙} = \sqrt{2\times 10\times 1.2} = \sqrt{24}\approx 4.90\,\mathrm{m/s}
$$

甲先进入水平面并开始以 $\mu g$ 减速，乙后进入、速度更大。水平面上两者加速度相同，速度差保持不变，乙在甲停下之前追上。质量相等的弹性正碰交换速度，所以碰撞后瞬间甲的速度等于碰撞前瞬间乙的速度。追上的位置要靠积分才能定，本组数值下这一速度是 $\boxed{3.80\,\mathrm{m/s}}$。

**C 错误。** 乙在斜坡上的路程是 $H_\text{乙}/\sin\theta$，这段时间随 $H_\text{乙}$ 增大。进入水平面的速度 $\sqrt{2gH_\text{乙}}$ 也随高度增大，追上甲和碰撞后停下的时刻跟着变。所以乙的总运动时间与 $H_\text{乙}$ 有关。把 $H_\text{乙}$ 改成 $1\,\mathrm{m}$，乙停下的时刻会提前。

**D 正确。** 交换速度后，甲以乙碰前的速度继续走，乙以甲碰前的速度继续走。两者之后的加速度仍是 $-\mu g$，速度差不变，不会再碰一次。甲碰撞之后滑行的距离，加上乙碰撞之前在水平面上已经滑过的距离，正好是乙以入水平面的速度独自滑行到停下的距离：

$$
x = \frac{(\sqrt{2gH_\text{乙}})^2}{2\mu g} = \frac{H_\text{乙}}{\mu}
$$

代表性数值下 $\boxed{x = 3\,\mathrm{m}}$。这个位置只由 $H_\text{乙}$ 和 $\mu$ 决定，与 $H_\text{甲}$、倾角无关。

## 交互演示

拖动时间，看两滑块从斜坡下来、在水平面上追上并交换速度，再分别停下。速度–时间图上，斜坡段两线重合；水平面上两线平行下降，交叉的那一刻就是交换速度。追及时刻、碰撞前速度和停止位置都由运动积分给出。

<Param name="t" label="时间" value={0} min={0} max="Tshow" step={0.01} unit="s" />

<Param name="theta" label="斜面倾角" symbol="θ" value={30} min={30} max={40} step={1} unit="°" />

<Param name="mu" label="动摩擦因数" symbol="μ" value={0.4} min={0.3} max={0.4} step={0.05} />

<Param name="Hjia" label="甲的释放高度" symbol="H_甲" value={0.5} min={0.4} max={0.6} step={0.1} unit="m" />

<Param name="Hyi" label="乙的释放高度" symbol="H_乙" value={1.2} min={1} max={1.2} step={0.1} unit="m" />

<Param name="m" label="滑块质量" value={1} hidden />

<Param name="g" label="重力加速度" value={10} hidden />

<Define name="sJia" expr="Hjia/sin(deg(theta))" />

<Define name="sYi" expr="Hyi/sin(deg(theta))" />

<Define name="vYi0" expr="sqrt(2*g*Hyi)" />

<Define name="Tlong" expr="sqrt(2*sYi/(g*sin(deg(theta)))) + vYi0/(mu*g) + 1" />

<Motion name="run" until="Tlong"
  state={{sJ: 0, vJ: 0, sY: 0, vY: 0, phaseJ: 0, phaseY: 0, hit: 0}}
  rates={{
    sJ: "vJ",
    vJ: "phaseJ < 0.5 ? g*sin(deg(theta)) : (phaseJ < 1.5 ? -mu*g : 0)",
    sY: "vY",
    vY: "phaseY < 0.5 ? g*sin(deg(theta)) : (phaseY < 1.5 ? -mu*g : 0)"
  }}
  events={[
    {name: "tJiaSlope", when: "sJia - sJ", dir: "down", set: {sJ: "sJia", phaseJ: 1}},
    {name: "tYiSlope", when: "sYi - sY", dir: "down", set: {sY: "sYi", phaseY: 1}},
    {name: "tJiaPause", when: "hit > 0.5 ? 1 : vJ", dir: "down", set: {vJ: 0, phaseJ: 2}},
    {name: "tCatch", when: "(sY - sYi) - (sJ - sJia)", dir: "up", set: {vJ: "vY", vY: "vJ", hit: 1, phaseJ: 1, phaseY: "vJ < 0.001 ? 2 : 1"}},
    {name: "tYiStopEvt", when: "vY", dir: "down", set: {vY: 0, phaseY: 2}},
    {name: "tJiaStop", when: "hit < 0.5 ? 1 : vJ", dir: "down", set: {vJ: 0, phaseJ: 2}, stop: true}
  ]}
  read={{
    vJiaBefore: "vY @ tCatch",
    vYiBefore: "vJ @ tCatch",
    vJiaAfter: "vJ @ tCatch",
    xCatch: "sJ - sJia @ tCatch",
    xStop: "max(sJ - sJia)"
  }}
/>

<Define name="vYiAfter" expr="vJiaBefore" />

<Define name="tYiStop" expr="vYiAfter < 0.001 ? tCatch : tYiStopEvt" />

<Define name="xByH" expr="Hyi/mu" />

<Define name="Tshow" expr="tJiaStop + 0.35" />

<Question text="A. 甲在斜坡上运动时与乙相对静止" set={{t: 0.2, theta: 30, mu: 0.4, Hjia: 0.5, Hyi: 1.2}} hint="斜坡段两条速度线重合，相对速度为零" />

<Question text="B. 碰撞后瞬间甲的速度等于碰撞前瞬间乙的速度" set={{t: "tCatch", theta: 30, mu: 0.4, Hjia: 0.5, Hyi: 1.2}} hint="质量相等的弹性正碰交换速度" />

<Question text="C. 乙的运动时间与 H_乙 无关" set={{t: "tYiStop", theta: 30, mu: 0.4, Hjia: 0.5, Hyi: 1}} hint="把 H_乙 改成 1 m，乙停下的时刻明显提前" />

<Question text="D. 甲最终停止位置与 O 处相距 H_乙/μ" set={{t: "tJiaStop", theta: 30, mu: 0.4, Hjia: 0.5, Hyi: 1.2}} hint="停止处离 O 的距离等于 H_乙/μ" />

<Preset label="题目条件" set={{t: 0, theta: 30, mu: 0.4, Hjia: 0.5, Hyi: 1.2}} />

<Preset label="甲刚进入水平面" set={{t: "tJiaSlope"}} />

<Preset label="乙追上甲" set={{t: "tCatch"}} />

<Preset label="甲停下" set={{t: "tJiaStop"}} />

<Status cases={[
  {when: "t < tJiaSlope", label: "两块都在斜坡上，加速度相同，相对静止", tone: "info"},
  {when: "t < tYiSlope", label: "甲已上水平面减速，乙仍在斜坡上加速", tone: "info"},
  {when: "t < tCatch", label: "两块都在水平面上，乙正在追上", tone: "info"},
  {when: "abs(t - tCatch) < 0.02", label: "弹性碰撞，两块交换速度", tone: "warning"},
  {when: "t < tYiStop", label: "已交换速度，乙较慢，正在减速", tone: "info"},
  {when: "t < tJiaStop", label: "乙已停下，甲仍在滑行", tone: "info"},
  {label: "两块都已停下", tone: "success"}
]} />

<Readout items={[
  {label: "碰前甲的速度", symbol: "v_甲", color: "velocity", expr: "vJiaBefore", unit: "m/s", digits: 2},
  {label: "碰前乙的速度", symbol: "v_乙", color: "force", expr: "vYiBefore", unit: "m/s", digits: 2},
  {label: "碰后甲的速度", symbol: "v_甲'", color: "velocity", expr: "vJiaAfter", unit: "m/s", digits: 2},
  {label: "甲停止处离 O", symbol: "x", color: "velocity", expr: "xStop", unit: "m", digits: 2},
  {label: "H_乙/μ", symbol: "H_乙/μ", color: "velocity", expr: "xByH", unit: "m", digits: 2},
  {label: "乙的运动时间", symbol: "t_乙", expr: "tYiStop", unit: "s", digits: 2}
]} />

<Answer items={[
  {label: "答案", text: "ABD"},
  {label: "碰后甲的速度", symbol: "v_甲'", expr: "vJiaAfter", value: 3.80227, unit: "m/s"},
  {label: "碰前乙的速度", symbol: "v_乙", expr: "vYiBefore", value: 3.80227, unit: "m/s"},
  {label: "甲停止处离 O", symbol: "x", expr: "xStop", value: 3, unit: "m"},
  {label: "H_乙/μ", symbol: "H_乙/μ", expr: "xByH", value: 3, unit: "m"}
]} />

<Sim
  title="两滑块沿斜坡滑下后弹性碰撞"
  height={320}
  duration="Tshow"
  time="t"
  params={["theta", "Hjia", "Hyi", "sJia", "sYi", "tJiaSlope", "tYiSlope", "tCatch", "tYiStop", "tJiaStop", "xCatch", "xStop", "xByH", "run"]}
  marks={[
    {t: 0, label: "同时释放"},
    {t: "tJiaSlope", label: "甲进入水平面"},
    {t: "tYiSlope", label: "乙进入水平面"},
    {t: "tCatch", label: "乙追上甲"},
    {t: "tYiStop", label: "乙停下"},
    {t: "tJiaStop", label: "甲停下"}
  ]}
  hud={[
    {symbol: "v_甲", label: "甲的速度", expr: "run.vJ(t)", unit: "m/s", digits: 2},
    {symbol: "v_乙", label: "乙的速度", expr: "run.vY(t)", unit: "m/s", digits: 2},
    {symbol: "x", label: "甲离 O", expr: "t < tJiaSlope ? 0 : run.sJ(t) - sJia", unit: "m", digits: 2}
  ]}
  legend={[
    {kind: "velocity", label: "甲的速度"},
    {kind: "force", label: "乙的速度"}
  ]}
  note="斜面倾角和高度按比例；滑块画成有尺寸的方块，不按质点比例"
>
sim({
  at(t, p) {
    const st = p.run.state(t)
    return {
      jia: { on: t < p.tJiaSlope, s: st.sJ, x: st.sJ - p.sJia, v: st.vJ },
      yi: { on: t < p.tYiSlope, s: st.sY, x: st.sY - p.sYi, v: st.vY },
    }
  },
  draw(ctx, s, v) {
    const p = v.p
    const th = p.theta * Math.PI / 180
    const reach = Math.max(p.xStop, p.xByH)
    const m = v.view({ xmin: -p.sYi * Math.cos(th) - 0.9, xmax: reach + 0.9, ymin: -0.85, ymax: p.Hyi + 1.05, equal: true })
    const tr = v.track(m, [
      { line: [-p.sYi * Math.cos(th), p.Hyi, 0, 0] },
      { line: [0, 0, reach + 0.55, 0], hatch: true },
    ], { marks: [{ x: 0, y: 0, label: 'O' }] })
    const put = (body) => {
      if (body.on) {
        const q = tr.at(Math.max(0, Math.min(tr.length, body.s)))
        return { x: q[0], y: q[1], ang: p.theta, dir: th }
      }
      return { x: body.x, y: 0, ang: 0, dir: 0 }
    }
    const jP = put(s.jia)
    const yP = put(s.yi)
    v.block(m, jP.x, jP.y, 0.28, 0.2, { angle: jP.ang })
    v.block(m, yP.x, yP.y, 0.28, 0.2, { angle: yP.ang })
    v.label(m, jP.x, jP.y + 0.16, '甲', { dx: -18, dy: 2 })
    v.label(m, yP.x, yP.y + 0.16, '乙', { dx: 18, dy: 2 })
    v.vec(m, jP.x, jP.y + 0.16, Math.cos(jP.dir) * s.jia.v * 0.13, -Math.sin(jP.dir) * s.jia.v * 0.13, { kind: 'velocity', label: 'v_甲', min: 14 })
    v.vec(m, yP.x, yP.y + 0.62, Math.cos(yP.dir) * s.yi.v * 0.13, -Math.sin(yP.dir) * s.yi.v * 0.13, { kind: 'force', label: 'v_乙', min: 14 })
    v.dim(m, -p.sJia * Math.cos(th) - 0.32, 0, -p.sJia * Math.cos(th) - 0.32, p.Hjia, 'H_甲')
    v.dim(m, -p.sYi * Math.cos(th) - 0.32, 0, -p.sYi * Math.cos(th) - 0.32, p.Hyi, 'H_乙')
    v.dim(m, 0, -0.5, p.xByH, -0.5, 'H_乙/μ')
    v.event(m, p.xCatch, 0.55, '交换速度', { at: p.tCatch, kind: 'force' })
    v.event(m, p.xStop, 0.85, '甲停下', { at: p.tJiaStop, kind: 'velocity' })
  },
})
</Sim>

<Plot
  title="速度随时间变化"
  size="wide"
  x={{name: "t", label: "t", unit: "s", min: 0, max: "Tshow"}}
  y={{label: "v", unit: "m/s", min: 0, max: "vYi0 + 1"}}
  series={[
    {label: "甲", color: "velocity", expr: "run.vJ(t)"},
    {label: "乙", color: "force", dash: true, expr: "run.vY(t)"}
  ]}
  marks={[
    {x: "tJiaSlope", label: "甲进入水平面"},
    {x: "tCatch", label: "交换速度"},
    {x: "tYiStop", label: "乙停下"},
    {x: "tJiaStop", label: "甲停下"}
  ]}
  cursor="t"
/>

## 结合图像看关键时刻

斜坡段两条速度线完全重合，这就是 A 的内容：加速度都是 $g\sin\theta$，相对速度为零。

甲进入水平面后实线以 $\mu g$ 下降，乙还在斜坡上继续上升。乙进入水平面后虚线也以同样的斜率下降，但始终在实线上方，直到两线交叉：交叉之后甲接过乙的速度，乙接过甲的速度。交叉点两侧的速度互相对调，这就是 B。

乙停下的时刻随 $H_\text{乙}$ 改变。把滑块拖到更小的 $H_\text{乙}$，乙停下的标记左移，C 不成立。

甲停下时，它离 O 的距离与尺寸线 $H_\text{乙}/\mu$ 重合。改倾角或改 $H_\text{甲}$，这条尺寸线不动；只有改 $H_\text{乙}$ 或 $\mu$ 它才变，这就是 D。

## 答案汇总

正确选项是 ABD。代表性数值下，碰撞前瞬间乙的速度与碰撞后瞬间甲的速度都是 $3.80\,\mathrm{m/s}$，甲最终停在离 O 为 $H_\text{乙}/\mu = 3\,\mathrm{m}$ 的地方。
