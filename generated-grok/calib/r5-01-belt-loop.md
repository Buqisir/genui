---
id: r5-01-belt-loop
title: 传送带与竖直圆轨道：恰好过最高点
subject: physics
topic: 传送带与竖直圆周运动
source: 必修2 模块备考卷 15 题（13 分）
question: |
  一水平传送带 AB 始终保持 v=5 m/s 的恒定速率向右运行，A、B 间的距离 L=8 m。B 端右侧平滑连接一个竖直放置的光滑圆弧轨道，轨道最低点在 B 处，最高点为 N。将一质量 m=1 kg 的小物块轻轻放在传送带上距 A 点 2 m 处的 P 点，小物块随传送带运动到 B 点后恰好能冲上光滑圆弧轨道的最高点 N。小物块与传送带间的动摩擦因数 μ=0.5，g 取 10 m/s²。
  (1) 求该圆弧轨道的半径 r；
  (2) 要使小物块第一次滑上圆弧轨道时能到达 M 点（M 点为圆弧轨道右半侧上的点，高出 B 点 0.25 m），且小物块在圆弧轨道上不脱离轨道，求小物块放上传送带时的位置与 A 点的距离的范围。
answers:
  - { name: vB, value: 5, unit: "m/s" }
  - { name: r, value: 0.5, unit: m }
  - { name: xLoopMin, value: 0, unit: m }
  - { name: xLoopMax, value: 5.5, unit: m }
  - { name: xBackMin, value: 7, unit: m }
  - { name: xBackMax, value: 7.5, unit: m }
---

## 一、题目条件分析

传送带水平向右，速率恒为 \(v=5\ \text{m/s}\)，\(A\)、\(B\) 相距 \(L=8\ \text{m}\)。\(B\) 点平滑接上一条竖直圆轨道：物块走在轨道内侧，轨道只能把物块推向圆心（弹力指向圆心），不能拉住物块。最低点就是 \(B\)，最高点 \(N\) 在 \(B\) 的正上方，高度为 \(2r\)。从 \(B\) 向右冲上的那一半是右半侧。

物块质量 \(m=1\ \text{kg}\)，轻轻放上，初速度为 \(0\)。题目第（1）问的释放点 \(P\) 距 \(A\) 为 \(2\ \text{m}\)，所以 \(P\) 到 \(B\) 还有 \(6\ \text{m}\)。动摩擦因数 \(\mu=0.5\)，\(g=10\ \text{m/s}^2\)。

第（1）问用「放到 \(P\) 点后恰好冲上最高点」确定半径 \(r\)。恰好冲上最高点，是指最高点弹力刚好为零，重力单独提供向心力，而不是速度减到零。第（2）问里轨道已经做成这个半径，只改变释放点到 \(A\) 的距离 \(x\)。

## 二、完整解答

### （1）轨道半径

传送带上，滑动摩擦力 \(f=\mu mg=5\ \text{N}\)，加速度

$$
a=\mu g=5\ \text{m/s}^2
$$

方向与传送带相同，向右。物块速度增到 \(v=5\ \text{m/s}\) 所需的位移

$$
s_{\text{共}}=\frac{v^2}{2a}=\frac{25}{10}=2.5\ \text{m}
$$

\(P\) 到 \(B\) 有 \(6\ \text{m}>2.5\ \text{m}\)，所以物块在到达 \(B\) 之前已经和传送带共速。共速之后水平方向不再需要摩擦力，物块随传送带匀速进 \(B\)。平滑连接处切线水平，进轨道的速度就是

$$
v_B=v=\boxed{5\ \text{m/s}}
$$

最高点速度若是零，物块在上半圈就会先离开轨道，到不了 \(N\)。恰好冲上，应是最高点弹力 \(N=0\)，由重力提供向心力：

$$
mg=m\frac{v_N^2}{r}\Rightarrow v_N^2=gr
$$

以 \(B\) 为重力势能零点，最高点高度为 \(2r\)。机械能守恒：

$$
\frac12 mv_B^2=\frac12 mv_N^2+mg\cdot 2r
$$

代入 \(v_B^2=25\)、\(v_N^2=gr\)、\(g=10\)：

$$
\frac12\times 25=\frac12\times 10\,r+2\times 10\,r
$$

$$
12.5=5r+20r=25r
$$

$$
r=\boxed{0.5\ \text{m}}
$$

这时最高点高度 \(2r=1\ \text{m}\)，\(v_N=\sqrt{gr}=\sqrt{5}\ \text{m/s}\)，不为零。

易错：若把最高点速度写成 \(0\)，会得到 \(r=v_B^2/(4g)=0.625\ \text{m}\)。用这个半径往上算，弹力在圆心角约 \(132^\circ\)（\(\cos\varphi=-2/3\)）时已经为零，物块提前脱离，匀减速到顶的算法不能用。

### （2）释放位置的范围

半径保持 \(r=0.5\ \text{m}\)。设释放点距 \(A\) 为 \(x\)（\(0\le x\le 8\ \text{m}\)），则到 \(B\) 的滑行距离为 \(8-x\)。

还没共速就进 \(B\) 时，\(v_B^2=2a(8-x)=10(8-x)\)；滑行距离达到 \(2.5\ \text{m}\) 以后，速度就被传送带锁在 \(5\ \text{m/s}\)，不会更快。所以

$$
v_B^2=
\begin{cases}
25 & (x\le 5.5) \\
10(8-x) & (5.5<x\le 8)
\end{cases}
$$

圆心角 \(\varphi\) 从最低点量起，向右为正。高度 \(h=r(1-\cos\varphi)\)，速度和弹力为

$$
v^2=v_B^2-2gr(1-\cos\varphi)
$$

$$
N-mg\cos\varphi=m\frac{v^2}{r}
\quad\Rightarrow\quad
N=m\left(\frac{v^2}{r}+g\cos\varphi\right)
$$

\(\varphi=0\) 时 \(\cos\varphi=1\)，回到 \(N-mg=mv^2/r\)；\(\varphi=180^\circ\) 时 \(\cos\varphi=-1\)，回到 \(N+mg=mv^2/r\)。\(N=0\) 且还有速度，只可能发生在上半圈：

$$
\cos\varphi=\frac{2gr-v_B^2}{3gr}
$$

要这个角落在上半圈且真能冲到那里，需要

$$
2gr<v_B^2<5gr
$$

代入 \(r=0.5\ \text{m}\)、\(g=10\ \text{m/s}^2\)：\(2gr=10\)，\(5gr=25\)。三段互斥的结果是

- \(v_B^2\ge 25\)：能过最高点，全程 \(N\ge 0\)，不脱离。本题传送带最快只到 \(25\)，所以就是 \(v_B^2=25\)，最高点 \(N=0\)，恰好通过。
- \(v_B^2\le 10\)：最远只到与圆心等高（\(\varphi\le 90^\circ\)），速度先减到零再滑回，弹力不会在还有速度时减到零，不脱离。
- \(10<v_B^2<25\)：在上半圈某处 \(N\) 减到零且速度还没减完，脱离轨道，之后做抛体。

\(M\) 高出 \(B\) 点 \(0.25\ \text{m}\)。由 \(r(1-\cos\varphi_M)=0.25\) 得 \(\cos\varphi_M=1/2\)，\(\varphi_M=60^\circ\)，正在右半侧、圆心下方。第一次上滑要到达 \(M\)，只要

$$
v_B^2\ge 2gh_M=2\times 10\times 0.25=5
$$

\(M\) 在下半圈，到达 \(M\) 之前不会先脱离。和「不脱离」交在一起：

$$
v_B^2=25
\quad\text{或}\quad
5\le v_B^2\le 10
$$

换成距离。\(v_B^2=25\) 要求滑行至少 \(2.5\ \text{m}\)：

$$
x\le 8-2.5=5.5
$$

再并上传送带左端，\(0\le x\le 5.5\ \text{m}\)。

\(5\le 10(8-x)\le 10\) 要求

$$
0.5\le 8-x\le 1
\quad\Rightarrow\quad
7\le x\le 7.5
$$

这段还没共速，公式 \(v_B^2=10(8-x)\) 有效。取等号也符合题意：\(x=5.5\ \text{m}\) 时刚好在 \(B\) 点共速，仍恰好过最高点；\(x=7\ \text{m}\) 时刚好升到圆心高度，速度为零后滑回；\(x=7.5\ \text{m}\) 时刚好到达 \(M\)。

$$
\boxed{0\le x\le 5.5\ \text{m}\ \text{或}\ 7\ \text{m}\le x\le 7.5\ \text{m}}
$$

\(5.5\ \text{m}<x<7\ \text{m}\) 虽然还够得到 \(M\)，但会在右半侧的上半圈脱离，舍去。\(x>7.5\ \text{m}\) 第一次上滑到不了 \(M\)。

## 三、交互演示

右侧滑块是释放点到 \(A\) 的距离。轨道半径按第（1）问锁死：放到距 \(A\) \(2\ \text{m}\) 处时，进 \(B\) 的速度刚好让最高点弹力为零。点预设可跳到两个合格区间的端点，以及中间会脱离的一处。

<Question text="（1）圆弧轨道的半径 r 是多少？" set={{xP: 2}} hint="先看进 B 时是否已经和传送带共速，再让最高点弹力为零，联立向心力与机械能。" />

<Question text="（2）能到达 M 且不脱离时，释放点距 A 的范围？" set={{xP: 7.2}} hint="不脱离有两段：恰好过最高点，或在圆心高度以下折返。两段都还要第一次上滑就够到 M。" />

<Param name="xP" label="释放点到 A 的距离" symbol="x" value={2} min={0} max={7.8} step={0.1} unit="m" color="velocity" />

<Param name="t" label="时间" value={0} min={0} max={40} step={0.01} unit="s" hidden />

<Define name="vBelt" expr="5" />

<Define name="L" expr="8" />

<Define name="mu" expr="0.5" />

<Define name="g" expr="10" />

<Define name="m" expr="1" />

<Define name="hM" expr="0.25" />

<Define name="xP0" expr="2" />

<Define name="aAcc" expr="mu*g" />

<Define name="sSync" expr="vBelt^2/(2*aAcc)" />

<Define name="s0" expr="L - xP0" />

<Define name="vB0" expr="s0 >= sSync ? vBelt : sqrt(2*aAcc*s0)" />

<Define name="r" expr="vB0^2/(5*g)" />

<Define name="sPB" expr="L - xP" />

<Define name="vB" expr="sPB >= sSync ? vBelt : sqrt(2*aAcc*max(sPB, 0))" />

<Define name="vLoop2" expr="5*g*r" />

<Define name="vSafe2" expr="2*g*r" />

<Define name="vReach2" expr="2*g*hM" />

<Define name="sLoop" expr="vLoop2/(2*aAcc)" />

<Define name="sSafe" expr="vSafe2/(2*aAcc)" />

<Define name="sReach" expr="vReach2/(2*aAcc)" />

<Define name="xLoopMin" expr="0" />

<Define name="xLoopMax" expr="L - sLoop" />

<Define name="xBackMin" expr="L - sSafe" />

<Define name="xBackMax" expr="L - sReach" />

<Define name="thM" expr="acos(1 - hM/r)" />

<Define name="w0" expr="(vB/r)*(abs(vB*vB - vLoop2) < 1e-3 ? 1.005 : 1)" />

<Define name="Qtot" expr="sPB >= sSync ? mu*m*g*vBelt^2/(2*aAcc) : mu*m*g*(vBelt*sqrt(2*max(sPB, 0)/aAcc) - sPB)" />

<Motion name="belt" state={{x: "xP", v: 0, slip: 1}} rates={{x: "v", v: "aAcc*slip"}} until={8} steps={2000}
  events={[
    {name: "tMatch", when: "v - vBelt", dir: "up", set: {v: "vBelt", slip: 0}},
    {name: "tB", when: "x - L", dir: "up", stop: true}
  ]} />

<Motion name="fly" state={{th: 0, w: "w0", phase: 1, risen: 0, x: "L", y: 0, vx: "vB", vy: 0}}
  rates={{
    th: "phase > 0.5 ? w : 0",
    w: "phase > 0.5 ? -(g/r)*sin(th) : 0",
    x: "phase > 0.5 ? 0 : vx",
    y: "phase > 0.5 ? 0 : vy",
    vy: "phase > 0.5 ? 0 : -g"
  }}
  until={20}
  steps={4000}
  events={[
    {name: "tRose", when: "th - 0.25", dir: "up", set: {risen: 1}},
    {name: "tM", when: "th - thM + 0.003", dir: "up"},
    {name: "tTop", when: "th - pi", dir: "up"},
    {name: "tTurn", when: "w", dir: "down"},
    {name: "tLeave", when: "phase*(w*w*r + g*cos(th) + 0.08)", dir: "down", set: {phase: 0, x: "L + r*sin(th)", y: "r*(1 - cos(th))", vx: "w*r*cos(th)", vy: "w*r*sin(th)"}},
    {name: "tFull", when: "th - 2*pi", dir: "up", stop: true},
    {name: "tReturn", when: "risen > 0.5 ? th - 0.05 : 1", dir: "down", stop: true},
    {name: "tLand", when: "phase > 0.5 ? 1 : y", dir: "down", stop: true}
  ]} />

<Define name="tau" expr="min(max(t - tB, 0), fly.tEnd)" />

<Define name="spd" expr="t < tB ? belt.v(t) : (fly.phase(tau) > 0.5 ? sqrt(max(vB*vB - 2*g*r*(1 - cos(fly.th(tau))), 0)) : sqrt((fly.vx(tau))^2 + (fly.vy(tau))^2))" />

<Define name="ht" expr="t < tB ? 0 : (fly.phase(tau) > 0.5 ? r*(1 - cos(fly.th(tau))) : max(fly.y(tau), 0))" />

<Define name="Ntrack" expr="m*(vB*vB/r - 2*g + 3*g*cos(fly.th(tau)))" />

<Define name="Nnow" expr="t < tB ? m*g : (fly.phase(tau) > 0.5 ? max(Ntrack, 0) : 0)" />

<Define name="Ek" expr="0.5*m*spd^2" />

<Define name="Ep" expr="m*g*ht" />

<Define name="sRel" expr="max(vBelt*t - (belt.x(t) - xP), 0)" />

<Define name="Qnow" expr="(t < tB and belt.v(t) < vBelt - 1e-3) ? mu*m*g*sRel : Qtot" />

<Define name="dur" expr="tB + fly.tEnd + 0.15" />

<Define name="tMatchMark" expr="isNaN(tMatch) ? tB : tMatch" />

<Define name="tMMark" expr="isNaN(tM) ? tB : tB + tM" />

<Define name="tTopMark" expr="isNaN(tTop) ? tB : tB + tTop" />

<Status cases={[
  {when: "xP <= xLoopMax + 1e-6", label: "合格：能过最高点，且不脱离", tone: "success"},
  {when: "xP + 1e-6 >= xBackMin and xP <= xBackMax + 1e-6", label: "合格：能到 M，在圆心以下折返", tone: "success"},
  {when: "xP > xLoopMax and xP < xBackMin - 1e-9", label: "不合格：上半圈会脱离轨道", tone: "danger"},
  {when: "xP > xBackMax", label: "不合格：第一次上滑到不了 M", tone: "warning"},
  {label: "不在题目要求的范围内", tone: "neutral"}
]} />

<Preset label="题目位置 P" set={{xP: 2}} />

<Preset label="过顶区间右端" set={{xP: "xLoopMax"}} />

<Preset label="中途脱离的例子" set={{xP: 6.4}} />

<Preset label="刚好到圆心高度" set={{xP: "xBackMin"}} />

<Preset label="刚好到达 M" set={{xP: "xBackMax"}} />

物块从静止被传送带拖走，共速后匀速进入圆轨道。右半侧先上升。弹力箭头在最高点会消失：那就是恰好不脱离。若释放点落在两个合格区间之间，物块会在上半圈离开轨道，改做抛体。

<Sim
  title="传送带送上竖直圆轨道"
  height={480}
  duration="dur"
  time="t"
  params={["xP", "vBelt", "L", "r", "g", "m", "mu", "hM", "vB", "sSync", "tB", "tMatch", "tM", "tTop", "tTurn", "tLeave", "belt", "fly"]}
  hud={[
    {symbol: "v", expr: "spd", unit: "m/s", digits: 2},
    {symbol: "N", expr: "Nnow", unit: "N", digits: 1},
    {symbol: "h", expr: "ht", unit: "m", digits: 2}
  ]}
  legend={[
    {kind: "velocity", symbol: "v", label: "速度"},
    {kind: "force", symbol: "f, N", label: "摩擦力或轨道弹力"},
    {kind: "strobe", label: "每 0.3 s 一个频闪"}
  ]}
  note="圆弧相对传送带放大，不按比例；物块尺寸为示意，贴在轨道内侧。"
  marks={[
    {t: 0, label: "轻放"},
    {t: "tMatchMark", label: "共速"},
    {t: "tB", label: "进入 B"},
    {t: "tMMark", label: "经过 M"},
    {t: "tTopMark", label: "最高点"}
  ]}
>
sim({
  at(t, p) {
    const Lb = 6
    const k = 2.4
    const br = 0.14
    const tauMax = p.fly.tEnd
    if (t < p.tB) {
      const s = p.belt.state(Math.max(t, 0))
      return {
        x: Lb * s.x / p.L,
        y: br,
        vx: s.v,
        vy: 0,
        speed: s.v,
        phi: 0,
        mode: 0,
        N: p.m * p.g,
        slip: s.v < p.vBelt - 1e-3,
      }
    }
    const tau = Math.min(Math.max(t - p.tB, 0), tauMax)
    const s = p.fly.state(tau)
    if (s.phase > 0.5) {
      const phi = s.th
      const px = p.L + p.r * Math.sin(phi)
      const py = p.r * (1 - Math.cos(phi))
      const v2 = Math.max(p.vB * p.vB - 2 * p.g * p.r * (1 - Math.cos(phi)), 0)
      const vmag = Math.sqrt(v2)
      const sign = s.w >= 0 ? 1 : -1
      return {
        x: Lb + (px - p.L) * k - br * Math.sin(phi),
        y: py * k + br * Math.cos(phi),
        vx: sign * vmag * Math.cos(phi),
        vy: sign * vmag * Math.sin(phi),
        speed: vmag,
        phi,
        mode: 1,
        N: Math.max(p.m * (v2 / p.r + p.g * Math.cos(phi)), 0),
        slip: false,
      }
    }
    return {
      x: Lb + (s.x - p.L) * k,
      y: s.y * k,
      vx: s.vx,
      vy: s.vy,
      speed: Math.hypot(s.vx, s.vy),
      phi: s.th,
      mode: 2,
      N: 0,
      slip: false,
    }
  },
  draw(ctx, s, v) {
    const p = v.p
    const Lb = 6
    const k = 2.4
    const Rv = k * p.r
    const br = 0.14
    const m = v.view({ xmin: -0.7, xmax: Lb + Rv + 1.05, ymin: -1.4, ymax: 2 * Rv + 0.78, equal: true, pad: 16 })
    const beltX = (px) => Lb * px / p.L
    const arcX = (px) => Lb + (px - p.L) * k
    const arcY = (py) => py * k
    const phiM = Math.acos(1 - p.hM / p.r)
    const Mx = arcX(p.L + p.r * Math.sin(phiM))
    const My = arcY(p.r * (1 - Math.cos(phiM)))

    v.conveyor(m, 0, 0, Lb, { angle: 0, speed: p.vBelt * Lb / p.L })
    v.track(m, [
      { arc: [Lb, Rv, Rv, -90, 90] },
      { arc: [Lb, Rv, Rv, 90, 270] },
    ])
    v.line(m, Lb - Rv - 0.2, Rv, Lb + Rv + 0.45, Rv, { color: v.color.steel, dash: [5, 4], width: 1 })
    v.text(m, Lb + Rv + 0.52, Rv, '圆心等高', { align: 'left', color: v.color.graphite, size: 11 })
    v.circle(m, Lb, Rv, 0.045, { fill: v.color.steel })

    v.line(m, 0, -0.58, Lb, -0.58, { color: v.color.steel, width: 1 })
    for (let i = 0; i <= 8; i += 2) {
      const X = beltX(i)
      v.line(m, X, -0.58, X, -0.4, { color: v.color.graphite, width: 1 })
      v.text(m, X, -0.88, String(i), { color: v.color.graphite, size: 11 })
    }
    v.text(m, Lb / 2, -1.18, '距 A / m', { color: v.color.graphite, size: 11 })

    if (p.xP > 0.2) v.dim(m, 0, 0.7, beltX(p.xP), 0.7, 'x = ' + p.xP.toFixed(1) + ' m')
    v.dim(m, Lb - Rv - 0.48, 0, Lb - Rv - 0.48, 2 * Rv, '2r = ' + (2 * p.r).toFixed(1) + ' m')

    v.label(m, 0, 0.42, 'A')
    v.label(m, beltX(p.xP), 0.42, 'P')
    v.label(m, Lb, -0.08, 'B')
    v.label(m, Lb, 2 * Rv, 'N')
    v.label(m, Mx, My, 'M')
    v.label(m, Lb - 0.02, Rv, 'O')

    v.trail(m, (st) => [st.x, st.y], { kind: 'velocity' })
    v.strobe(m, (st) => [st.x, st.y], { every: 0.3, r: 2.2 })
    v.ball(m, beltX(p.xP), br, br, { ghost: true })
    v.ball(m, s.x, s.y, br, { label: 'm' })

    if (s.speed > 0.2) {
      v.vec(m, s.x, s.y, s.vx * 0.1, s.vy * 0.1, { kind: 'velocity', label: 'v' })
    }
    if (s.mode === 0 && s.slip) {
      v.vec(m, s.x, 0, p.mu * p.m * p.g * 0.08, 0, { kind: 'force', label: 'f' })
    }
    if (s.mode === 1 && s.N > 1) {
      v.vec(m, s.x, s.y, -Math.sin(s.phi) * s.N * 0.01, Math.cos(s.phi) * s.N * 0.01, { kind: 'force', label: 'N' })
    }

    if (Number.isFinite(p.tMatch)) {
      v.event(m, beltX(p.xP + p.sSync), br, '与传送带共速', { at: p.tMatch, kind: 'velocity' })
    }
    v.event(m, Lb, br, '进入圆弧', { at: p.tB, kind: 'velocity' })
    if (Number.isFinite(p.tM)) {
      v.event(m, Mx, My, '经过 M', { at: p.tB + p.tM, kind: 'velocity' })
    }
    if (Number.isFinite(p.tTop)) {
      v.event(m, Lb, 2 * Rv, '最高点，弹力为零', { at: p.tB + p.tTop, kind: 'force' })
    }
    if (Number.isFinite(p.tTurn)) {
      const cTurn = Math.max(-1, Math.min(1, 1 - (p.vB * p.vB) / (2 * p.g * p.r)))
      const phi = Math.acos(cTurn)
      v.event(m, arcX(p.L + p.r * Math.sin(phi)), arcY(p.r * (1 - Math.cos(phi))), '速度减为 0，开始折返', { at: p.tB + p.tTurn, kind: 'velocity' })
    }
    if (Number.isFinite(p.tLeave)) {
      const cLeave = (2 * p.g * p.r - p.vB * p.vB) / (3 * p.g * p.r)
      const phi = Math.acos(Math.max(-1, Math.min(1, cLeave)))
      v.event(m, arcX(p.L + p.r * Math.sin(phi)), arcY(p.r * (1 - Math.cos(phi))), '脱离轨道', { at: p.tB + p.tLeave, kind: 'force' })
    }
  },
})
</Sim>

<Readout items={[
  {label: "轨道半径", symbol: "r", expr: "r", unit: "m", digits: 2},
  {label: "到达 B 的速度", symbol: "v_B", expr: "vB", unit: "m/s", digits: 2, color: "velocity"},
  {label: "此刻速度", symbol: "v", expr: "spd", unit: "m/s", digits: 2, color: "velocity"},
  {label: "此刻高度", symbol: "h", expr: "ht", unit: "m", digits: 2},
  {label: "接触面弹力", symbol: "N", expr: "Nnow", unit: "N", digits: 1, color: "force"}
]} />

<ForceDiagram
  title="传送带上加速时的受力"
  surface={{type: "ground"}}
  body={{shape: "block", label: "m"}}
  mass="m"
  accel={{angle: 0, magnitude: "aAcc"}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g", showValue: true, unit: "N", digits: 1},
    {label: "N", angle: 90, solve: "Nbt", showValue: true, unit: "N", digits: 1},
    {label: "f", angle: 0, magnitude: "mu*Nbt", at: "contact", showValue: true, unit: "N", digits: 1}
  ]}
/>

<ForceDiagram
  title="最高点：重力单独提供向心力"
  surface={{type: "none"}}
  body={{shape: "ball", label: "m"}}
  mass="m"
  accel={{angle: -90, magnitude: "g"}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g", showValue: true, unit: "N", digits: 1},
    {label: "N", angle: -90, solve: "Ntop", showValue: true, unit: "N", digits: 1}
  ]}
/>

<Plot
  title="速度随时间变化"
  caption="传送带上先匀加速再匀速。进圆弧后上坡减速、下坡加速；恰好过顶时最高点速度不是零。"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "dur"}}
  y={{label: "v", unit: "m/s", min: 0}}
  series={[
    {label: "物块", expr: "s < tB ? belt.v(s) : (fly.phase(min(max(s - tB, 0), fly.tEnd)) > 0.5 ? sqrt(max(vB*vB - 2*g*r*(1 - cos(fly.th(min(max(s - tB, 0), fly.tEnd)))), 0)) : sqrt((fly.vx(min(max(s - tB, 0), fly.tEnd)))^2 + (fly.vy(min(max(s - tB, 0), fly.tEnd)))^2))", color: "velocity"},
    {label: "传送带", expr: "vBelt", color: "steel", dash: true}
  ]}
  marks={[
    {x: "tMatchMark", label: "共速"},
    {x: "tB", label: "进入 B"},
    {x: "tTopMark", label: "最高点"}
  ]}
  cursor="t"
/>

<Plot
  title="接触面弹力随时间变化"
  caption="传送带上弹力等于重力。进圆弧后弹力随高度变化；减到零就托不住了。"
  x={{name: "s", label: "t", unit: "s", min: 0, max: "dur"}}
  y={{label: "N", unit: "N", min: 0}}
  series={[
    {label: "弹力", expr: "s < tB ? m*g : (fly.phase(min(max(s - tB, 0), fly.tEnd)) > 0.5 ? max(m*(vB*vB/r - 2*g + 3*g*cos(fly.th(min(max(s - tB, 0), fly.tEnd)))), 0) : 0)", color: "force"}
  ]}
  marks={[
    {x: "tB", label: "进入 B"},
    {x: "tMMark", label: "经过 M"},
    {x: "tTopMark", label: "最高点"}
  ]}
  cursor="t"
/>

<Ledger
  title="能量去向"
  unit="J"
  digits={1}
  parts={[
    {label: "动能", symbol: "E_k", expr: "Ek", color: "velocity"},
    {label: "重力势能", symbol: "E_p", expr: "Ep", color: "field"},
    {label: "摩擦生热", symbol: "Q", expr: "Qnow", color: "force"}
  ]}
  rows={[
    {label: "刚放上", at: {t: 0}},
    {label: "此刻"},
    {label: "到达 B", at: {t: "tB"}}
  ]}
  total={{label: "合计", expr: "Ek + Ep + Qnow"}}
/>

<Answer items={[
  {label: "到达 B 的速度", symbol: "v_B", expr: "vB", value: 5, unit: "m/s", digits: 2},
  {label: "轨道半径", symbol: "r", expr: "r", value: 0.5, unit: "m", digits: 2},
  {label: "过顶区间左端", symbol: "x", expr: "xLoopMin", value: 0, unit: "m", digits: 1},
  {label: "过顶区间右端", symbol: "x", expr: "xLoopMax", value: 5.5, unit: "m", digits: 1},
  {label: "折返区间左端", symbol: "x", expr: "xBackMin", value: 7, unit: "m", digits: 1},
  {label: "折返区间右端", symbol: "x", expr: "xBackMax", value: 7.5, unit: "m", digits: 1}
]} />

拖动释放位置时，右侧状态会标明当前 \(x\) 落在哪一段。进度条上的「共速」「最高点」只在这件事真的发生时才停在对应时刻；若当前释放位置到不了，该标记会叠在进入 \(B\) 的时刻，以画面上弹出的事件为准。

## 四、结合图像理解关键时刻

题目位置 \(x=2\ \text{m}\)：约 \(1\ \text{s}\) 时物块速度贴上传送带的虚线，摩擦力消失，频闪间距变得均匀。\(1.7\ \text{s}\) 进入 \(B\)。此后 \(v\)-\(t\) 图先下降再上升，最低点不是零；弹力图在最高点碰到零又抬起来。弹力只在一个点为零，轨道仍然托得住，这就是「恰好冲上最高点」。

能量账上，打滑阶段合计从 \(0\) 涨到 \(25\ \text{J}\)：动能 \(12.5\ \text{J}\)，摩擦热 \(12.5\ \text{J}\)。摩擦力对物块做的功只解释动能，热是传送带电动机多付的。进入光滑圆弧后不再打滑，合计保持 \(25\ \text{J}\)，只在动能和势能之间转换。最高点动能 \(2.5\ \text{J}\)、势能 \(10\ \text{J}\)、热仍是 \(12.5\ \text{J}\)。

三个释放区间对应三条不同的弹力曲线：

| 释放点 \(x\) | 进 \(B\) 的 \(v_B^2\) | 图像上看到的 |
|---|---|---|
| \(0\le x\le 5.5\ \text{m}\) | \(25\) | 弹力在最高点碰到零，物块绕过 \(N\) |
| \(5.5\ \text{m}<x<7\ \text{m}\) | \(10\) 到 \(25\) 之间 | 弹力在上半圈减到零后一直为零，物块改做抛体 |
| \(7\ \text{m}\le x\le 7.5\ \text{m}\) | \(5\) 到 \(10\) | 速度先减到零，高度不超过圆心，弹力不归零，沿原轨滑回 |
| \(x>7.5\ \text{m}\) | 小于 \(5\) | 折返点低于 \(M\)，第一次上滑到不了 \(M\) |

点「刚好到圆心高度」和「刚好到达 M」，速度曲线会落到零，物块在右半侧停下再回来。点「中途脱离的例子」，弹力先触零，随后画面里的物块离开轨道。

## 五、答案汇总

| 问题 | 答案 |
|---|---|
| （1）轨道半径 | \(0.5\ \text{m}\)（进 \(B\) 的速度为 \(5\ \text{m/s}\)） |
| （2）释放点到 \(A\) 的距离 | \(0\le x\le 5.5\ \text{m}\) 或 \(7\ \text{m}\le x\le 7.5\ \text{m}\) |
