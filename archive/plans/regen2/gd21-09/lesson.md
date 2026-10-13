---
id: gd21-09
title: 山头投出的手榴弹
source: 2021 广东卷 第 9 题（多选，6 分）
question: "长征途中，为了突破敌方关隘，战士爬上陡销的山头，居高临下向敌方工事内投掷手榴弹，战士在同一位置先后投出甲、乙两颗质量均为 m 的手榴弹，手榴弹从投出的位置到落地点的高度差为 h，在空中的运动可视为平抛运动，轨迹如图所示，重力加速度为 g，下列说法正确的有（　　）\n\n【图】右侧是一座山，山顶有一名战士。左侧地面上是一段砖墙，标“工事”，墙与山之间是平地，地面用斜线表示。从战士处向左下方画出两条抛物线：甲较高、较远，落在工事上；乙较低、较近，落在工事与山之间的地面上。山的右侧有一条竖直双向箭头，从上端（与投出点同一高度）指到地面，标 h。\n\nA. 甲在空中的运动时间比乙的长\n\nB. 两手榴弹在落地前瞬间，重力的功率相等\n\nC. 从投出到落地，每颗手榴弹的重力势能减少 mgh\n\nD. 从投出到落地，每颗手榴弹的机械能变化量为 mgh"
choice: BC
answers: []
---

两颗手榴弹从同一位置水平投出，做平抛运动。图中甲较高、较远，落在工事顶上；乙较低、较近，落在工事与山之间的地面上。题目写明两者从投出点到落地点的高度差都是 $h$，工事顶面与地面取同一高度。

竖直方向是初速度为零的自由落体运动，运动时间只由下落高度决定：

$$
t = \sqrt{\frac{2h}{g}}
$$

落地前瞬间竖直速度 $v_y = \sqrt{2gh}$，水平速度不参与这个结果。重力的瞬时功率只计速度的竖直分量：

$$
P = mgv_y = mg\sqrt{2gh}
$$

从投出到落地，重力势能减少 $mgh$。空中只有重力做功，机械能恒定，变化量为 $0$。

题目只给了字母。下面取 $m = 1\,\mathrm{kg}$、$h = 20\,\mathrm{m}$、$g = 10\,\mathrm{m/s^2}$ 作代表值，甲、乙的初速度分别取 $12\,\mathrm{m/s}$ 和 $6\,\mathrm{m/s}$，只用来看轨迹咄远近。山体和工事的宽度不按比例。

<Param name="m" label="质量" symbol="m" value={1} hidden unit="kg" />

<Param name="h" label="高度差" symbol="h" value={20} hidden unit="m" />

<Param name="g" label="重力加速度" symbol="g" value={10} hidden unit="m/s²" />

<Param name="vJia" label="甲的初速度" symbol="v_甲" value={12} min={4} max={16} step={0.5} unit="m/s" color="velocity" />

<Param name="vYi" label="乙的初速度" symbol="v_乙" value={6} min={2} max={12} step={0.5} unit="m/s" color="velocity" />

<Param name="t" label="时间" symbol="t" value={0} min={0} max={2} step={0.01} unit="s" hidden />

<Define name="T" expr="sqrt(2*h/g)" />

<Define name="vyLand" expr="sqrt(2*g*h)" />

<Define name="Pland" expr="m*g*vyLand" />

<Define name="dEp" expr="m*g*h" />

<Define name="dE" expr="0" />

<Define name="xJia" expr="vJia*T" />

<Define name="xYi" expr="vYi*T" />

<Define name="tNow" expr="min(t, T)" />

<Define name="yNow" expr="h - 0.5*g*tNow^2" />

<Define name="vyNow" expr="g*tNow" />

<Define name="Pnow" expr="m*g*vyNow" />

<Define name="epLeft" expr="m*g*yNow" />

<Define name="ekJia" expr="0.5*m*(vJia^2 + vyNow^2)" />

<Define name="ekYi" expr="0.5*m*(vYi^2 + vyNow^2)" />

<Preset label="题目轨迹" set={{vJia: 12, vYi: 6, t: 0}} />

<Preset label="落地前瞬间" set={{vJia: 12, vYi: 6, t: 2}} />

<Question text="A. 甲在空中的运动时间比乙的长" set={{t: 2}} hint="两者下落高度都是 h，运动时间都是 √(2h/g)" />

<Question text="B. 两手榴弹在落地前瞬间，重力的功率相等" set={{t: 2}} hint="落地瞬间 v_y 相同，重力功率都是 mg√(2gh)" />

<Question text="C. 从投出到落地，每颗手榴弹的重力势能减少 mgh" set={{t: 2}} hint="下降高度都是 h，势能减少量与初速度无关" />

<Question text="D. 从投出到落地，每颗手榴弹的机械能变化量为 mgh" set={{t: 2}} hint="只有重力做功，机械能不变，变化量是 0" />

<Status cases={[
  {when: "t < 0.05", label: "刚投出：竖直速度为 0，重力功率为 0", tone: "info"},
  {when: "t > T - 0.02", label: "落地前瞬间：两颗的 v_y 和重力功率相等", tone: "success"},
  {label: "空中：竖直速度只随时间增大，与初速度无关", tone: "neutral"}
]} />

<Readout items={[
  {label: "运动时间", symbol: "t", expr: "T", unit: "s", digits: 2, color: "ink"},
  {label: "落地瞬间竖直速度", symbol: "v_y", expr: "vyLand", unit: "m/s", digits: 2, color: "velocity"},
  {label: "落地瞬间重力功率", symbol: "P", expr: "Pland", unit: "W", digits: 1, color: "force"},
  {label: "重力势能减少", symbol: "ΔE_p", expr: "dEp", unit: "J", digits: 0, color: "field"},
  {label: "机械能变化量", symbol: "ΔE", expr: "dE", unit: "J", digits: 0, color: "charge"}
]} />

<Answer items={[
  {label: "答案", text: "BC"},
  {label: "运动时间", symbol: "t", expr: "T", unit: "s", digits: 2},
  {label: "落地瞬间重力功率", symbol: "P", expr: "Pland", unit: "W", digits: 1},
  {label: "重力势能减少", symbol: "ΔE_p", text: "mgh"},
  {label: "机械能变化量", symbol: "ΔE", text: "0"}
]} />

<Sim title="两颗手榴弹的平抛" height={360} duration="T" time="t" playSeconds={4} params={[
  "h", "g", "vJia", "vYi", "T", "xJia", "xYi"
]} marks={[
  {t: 0, label: "同一位置投出"},
  {t: "T", label: "同时落地"}
]} hud={[
  {symbol: "t", label: "运动时间", expr: "T", unit: "s", digits: 2},
  {symbol: "P", label: "此刻重力功率", expr: "Pnow", unit: "W", digits: 0}
]} legend={[
  {kind: "velocity", label: "甲（较远）"},
  {kind: "velocity-dash", label: "乙（较近）"},
  {kind: "force", label: "重力"}
]} note="两者下落高度都是 h，工事顶面与地面同高。山体、工事不按比例。">
sim({
  at(t, p) {
    const tau = Math.min(Math.max(t, 0), p.T)
    const y = p.h - 0.5 * p.g * tau * tau
    return {
      tau,
      y,
      xA: p.vJia * tau,
      xB: p.vYi * tau,
      vy: p.g * tau,
    }
  },
  draw(ctx, s, v) {
    const p = v.p
    const xMax = Math.max(p.xJia, p.xYi, 8)
    const m = v.view({ xmin: -4.2, xmax: xMax + 3.2, ymin: -3.6, ymax: p.h + 5.2, equal: true })
    const hillW = Math.min(5.2, xMax * 0.22)
    const fortW = Math.min(4.6, xMax * 0.2)
    const gap = Math.max(1.4, xMax - hillW - fortW)
    const fortX = -(gap + fortW)
    const hillFoot = -hillW
    v.ground(m, fortX - 1.2, hillFoot + hillW + 2.6, 0, { thick: 14 })
    v.incline(m, hillFoot, 0, hillW, p.h, { flip: true })
    v.block(m, fortX + fortW / 2, 0, fortW, 2.4)
    v.label(m, fortX + fortW / 2, 1.2, "工事")
    const launchX = hillFoot + 0.55
    const yOf = (x, v0) => p.h - 0.5 * p.g * (x / v0) * (x / v0)
    const arc = (v0) => {
      const pts = []
      const n = 28
      for (let i = 0; i <= n; i++) {
        const x = (v0 * p.T * i) / n
        pts.push([launchX - x, yOf(x, v0)])
      }
      return pts
    }
    v.path(m, arc(p.vJia), { color: v.color.velocity, width: 2 })
    v.path(m, arc(p.vYi), { color: v.color.velocity, width: 1.5, dash: true })
    const ax = launchX - s.xA
    const bx = launchX - s.xB
    const r = 0.42
    v.ball(m, ax, s.y, r, { label: "甲" })
    v.ball(m, bx, s.y, r, { label: "乙" })
    v.vec(m, ax, s.y, 0, -1.15, { kind: "force" })
    v.label(m, ax + 1.15, s.y - 1.15, "mg")
    v.dim(m, hillFoot + hillW + 0.7, 0, hillFoot + hillW + 0.7, p.h, "h")
    v.label(m, launchX, p.h + 1.5, "投出点")
  },
})
</Sim>

<Plot title="轨迹：甲远、乙近，下落高度相同" size="wide" caption="横轴是水平位移，向左为正。两条曲线在同一高度落地。"
  x={{name: "xx", label: "x", unit: "m", min: 0, max: "max(xJia, xYi) + 2"}}
  y={{label: "y", unit: "m", min: 0, max: "h + 2"}}
  series={[
    {label: "甲", color: "velocity", over: {name: "s", min: 0, max: "T"}, x: "vJia*s", expr: "h - 0.5*g*s^2", point: "tNow"},
    {label: "乙", color: "velocity", dash: true, over: {name: "s", min: 0, max: "T"}, x: "vYi*s", expr: "h - 0.5*g*s^2", point: "tNow"}
  ]}
/>

<Plot title="竖直速度与初速度无关" size="narrow" caption="两条 v_y – t 重合，落地前瞬间都是 √(2gh)"
  x={{name: "tt", label: "t", unit: "s", min: 0, max: "T"}}
  y={{label: "v_y", unit: "m/s", min: 0, max: "vyLand + 2"}}
  series={[
    {label: "甲、乙", expr: "g*tt", color: "velocity"}
  ]}
  marks={[{x: "T", label: "同时落地"}]}
  cursor="t"
/>

<Ledger title="投出到落地的能量" unit="J" size="wide" caption="势能减少的部分全部变成动能，总量不变。甲的初动能更大，所以总量更大。"
  parts={[
    {label: "重力势能", symbol: "E_p", expr: "m*g*(h - 0.5*g*tNow^2)", color: "field"},
    {label: "动能", symbol: "E_k", expr: "0.5*m*(vJia^2 + (g*tNow)^2)", color: "velocity"}
  ]}
  total={{label: "机械能", expr: "m*g*h + 0.5*m*vJia^2"}}
  rows={[
    {label: "投出", at: {t: 0}},
    {label: "此刻"},
    {label: "落地", at: {t: "T"}}
  ]}
/>

## 完整解答

取竖直向下为正。平抛的竖直方向满足

$$
h = \frac{1}{2}gt^2
$$

**A 错误。** 甲、乙从投出点到落地点的高度差都是 $h$，运动时间都是

$$
\boxed{t = \sqrt{\dfrac{2h}{g}}}
$$

与水平初速度无关。甲飞得更远，只是因为水平速度更大，不是因为在空中待得更久。

**B 正确。** 重力竖直向下，瞬时功率 $P = mgv_y$。落地前瞬间

$$
v_y = \sqrt{2gh}
$$

两颗手榴弹质量相同、下落高度相同，所以

$$
\boxed{P = mg\sqrt{2gh}}
$$

两者相等。水平分速度与重力垂直，不贡献功率。

**C 正确。** 重力势能只由高度决定。下降高度为 $h$，每颗的重力势能减少

$$
\boxed{\Delta E_p = mgh}
$$

**D 错误。** 空中只受重力，重力做功使势能减少、动能增加，两者相等，机械能恒定。从投出到落地，每颗手榴弹的机械能变化量为

$$
\boxed{\Delta E = 0}
$$

而不是 $mgh$。

## 结合图像

拖动进度，两颗始终在同一高度，同一时刻落地：甲落在工事上，乙落在工事与山之间。$v_y$ – $t$ 图上两条线重合，所以落地瞬间的重力功率相等。能量账本里，投出时的势能 $mgh$ 到落地时全部变成动能，机械能不变。

## 答案

$\boxed{BC}$
