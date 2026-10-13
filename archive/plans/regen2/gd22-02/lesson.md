---
id: gd22-02
title: 祝融号的过冬休眠
source: 2022 广东卷 第 2 题（单选，4 分）
question: |
  “祝融号”火星车需要“休眠”以度过火星寒冷的冬季。假设火星和地球的冬季是各自公转周期的四分之一，且火星的冬季时长约为地球的 1.88 倍。火星和地球绕太阳的公转均可视为匀速圆周运动。下列关于火星、地球公转的说法正确的是（ ）

  A. 火星公转的线速度比地球的大
  B. 火星公转的角速度比地球的大
  C. 火星公转的半径比地球的小
  D. 火星公转的加速度比地球的小
choice: D
answers: []
theme: night
---

火星和地球都绕太阳做匀速圆周运动，向心力由万有引力提供。题目没有给半径的具体数值，下面取地球公转半径为 $1$ 个单位，地球公转周期为 $1$ 个单位，只比较两星的相对大小。

冬季是各自公转周期的四分之一，所以冬季时长之比就是公转周期之比：

$$
\frac{T_火}{T_地} = \frac{\Delta t_火}{\Delta t_地} = 1.88
$$

由开普勒第三定律 $T^2 \propto r^3$，半径之比为

$$
\frac{r_火}{r_地} = \left(\frac{T_火}{T_地}\right)^{2/3} = 1.88^{2/3} \approx 1.52
$$

火星轨道在地球轨道外面。线速度、角速度和向心加速度随半径单调减小：

$$
\frac{v_火}{v_地} = \sqrt{\frac{r_地}{r_火}} \approx 0.811, \quad
\frac{\omega_火}{\omega_地} = \frac{T_地}{T_火} \approx 0.532, \quad
\frac{a_火}{a_地} = \left(\frac{r_地}{r_火}\right)^2 \approx 0.433
$$

滑块上的 $k = 1.88$ 是题目给定的冬季倍数。拖动它可以看到：周期越长，轨道越大，三个运动学量都越小。

## 完整解答

**A. 错误。** 线速度 $v = \sqrt{GM/r}$，半径越大线速度越小。火星半径约为地球的 $1.52$ 倍，线速度约为地球的 $0.81$ 倍，不是比地球大。

**B. 错误。** 角速度 $\omega = 2\pi/T$。火星公转周期是地球的 $1.88$ 倍，角速度约为地球的 $0.53$ 倍，比地球小。

**C. 错误。** 由 $T^2 \propto r^3$，周期更长的星体离太阳更远。火星公转半径约为地球的 $1.52$ 倍，比地球大而不是比地球小。

**D. 正确。** 向心加速度 $a = GM/r^2$，半径越大加速度越小。火星的加速度约为地球的 $0.43$ 倍，确实比地球小。

四个选项里只有这一项成立，所以选 $\boxed{D}$。

<Param name="t" label="时间" value={0} min={0} max={1} step={0.01} unit="T_地" hidden />

<Param name="k" label="火星冬季 / 地球冬季" value={1.88} min={1} max={3} step={0.01} />

<Define name="rRatio" expr="k^(2/3)" />

<Define name="vRatio" expr="1/sqrt(rRatio)" />

<Define name="wRatio" expr="1/k" />

<Define name="aRatio" expr="1/rRatio^2" />

<Question text="A. 火星公转的线速度比地球的大" set={{k: 1.88}} hint="外侧轨道的箭头更短：v ≈ 0.81 v_地" />

<Question text="B. 火星公转的角速度比地球的大" set={{k: 1.88}} hint="周期是 1.88 倍，角速度只有地球的 0.53 倍" />

<Question text="C. 火星公转的半径比地球的小" set={{k: 1.88}} hint="火星轨道在外面，半径约 1.52 倍" />

<Question text="D. 火星公转的加速度比地球的小" set={{k: 1.88}} hint="加速度箭头更短：a ≈ 0.43 a_地" />

<Preset label="题目倍数 1.88" set={{k: 1.88}} />

<Preset label="假设周期相同" set={{k: 1}} />

<Status cases={[
  {when: "abs(k - 1) < 1e-6", label: "两星周期相同，轨道重合", tone: "neutral"},
  {label: "火星在外侧：半径更大，线速度、角速度、加速度都更小", tone: "success"}
]} />

<Readout items={[
  {label: "半径之比", symbol: "r_火/r_地", expr: "rRatio", digits: 2, color: "field"},
  {label: "线速度之比", symbol: "v_火/v_地", expr: "vRatio", digits: 2, color: "velocity"},
  {label: "角速度之比", symbol: "ω_火/ω_地", expr: "wRatio", digits: 2, color: "charge"},
  {label: "加速度之比", symbol: "a_火/a_地", expr: "aRatio", digits: 2, color: "accel"}
]} />

<Answer items={[{label: "答案", text: "D"}]} />

<Sim title="火星与地球的公转" size="narrow" height={460} duration={1} time="t" params={["rRatio", "vRatio", "wRatio", "aRatio"]} loop={true} playSeconds={8} timeUnit="T_地" hud={[{symbol: "r_火/r_地", expr: "rRatio", digits: 2}]} legend={[{kind: "velocity", label: "线速度"}, {kind: "accel", label: "加速度"}, {kind: "charge", label: "角速度 ω"}]} note="半径以地球轨道为 1；火星的箭头按与地球的比例缩放，不按真实大小">
sim({
  at(t, p) {
    return {
      thE: -Math.PI / 2 + 2 * Math.PI * t,
      thM: -Math.PI / 2 + 2 * Math.PI * t / p.rRatio ** 1.5,
    }
  },
  draw(ctx, s, v) {
    const p = v.p
    const m = v.view({ xmin: -2.15, xmax: 2.15, ymin: -2.05, ymax: 2.05, equal: true })
    v.stars()
    v.orbit(m, 0, 0, 1, 1, { color: v.color.steel })
    v.orbit(m, 0, 0, p.rRatio, p.rRatio, { color: v.color.field, dash: true })
    v.planet(m, 0, 0, 0.2, { label: '太阳' })
    const xe = Math.cos(s.thE)
    const ye = Math.sin(s.thE)
    const xm = p.rRatio * Math.cos(s.thM)
    const ym = p.rRatio * Math.sin(s.thM)
    const txe = -Math.sin(s.thE)
    const tye = Math.cos(s.thE)
    const txm = -Math.sin(s.thM)
    const tym = Math.cos(s.thM)
    const vLen = 0.62
    const aLen = 0.5
    v.arrow(m, xe, ye, xe + txe * vLen, ye + tye * vLen, { color: v.color.velocity })
    v.arrow(m, xe, ye, xe * (1 - aLen), ye * (1 - aLen), { color: v.color.accel })
    v.arrow(m, xm, ym, xm + txm * vLen * p.vRatio, ym + tym * vLen * p.vRatio, { color: v.color.velocity })
    v.arrow(m, xm, ym, xm * (1 - aLen * p.aRatio), ym * (1 - aLen * p.aRatio), { color: v.color.accel })
    v.satellite(m, xe, ye, { angle: s.thE * 180 / Math.PI + 90, label: '地球' })
    v.satellite(m, xm, ym, { angle: s.thM * 180 / Math.PI + 90, label: '火星' })
    v.dim(m, 0, 0, 1, 0, 'r_地')
    v.dim(m, 0, 0, p.rRatio, 0, 'r_火')
    v.label(m, xe + txe * vLen, ye + tye * vLen, 'v_地')
    v.label(m, xm + txm * vLen * p.vRatio, ym + tym * vLen * p.vRatio, 'v_火')
  },
})
</Sim>

<Plot title="各量与地球的比值随周期倍数变化" caption="横轴是火星公转周期相对地球的倍数，纵轴是相对地球的比值" size="wide" x={{name: "u", label: "T_火/T_地", min: 1, max: 3}} y={{label: "相对地球", min: 0, max: 2.2}} series={[{label: "r", expr: "u^(2/3)", color: "field"}, {label: "v", expr: "u^(-1/3)", color: "velocity"}, {label: "ω", expr: "1/u", color: "charge"}, {label: "a", expr: "u^(-4/3)", color: "accel"}]} marks={[{x: 1.88, label: "题目 1.88"}]} cursor="k" />

## 结合图像看

上面的曲线以地球为 $1$。周期倍数从 $1$ 增到 $1.88$时，半径比从 $1$ 升到约 $1.52$，线速度比、角速度比和加速度比都降到 $1$ 以下。所以 A、B 把大小说反了，C 把轨道的里外说反了，只有 D 与曲线一致。

动画里火星走得比地球慢：地球走完一圈，火星只走过约 $0.53$ 圈。火星的速度箭头和加速度箭头都比地球短，与上面的比值一致。

## 答案

选 $\boxed{D}$。
