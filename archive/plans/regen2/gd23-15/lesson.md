---
id: gd23-15
title: 药品盒的传送滑落
source: 2023 广东卷 第 15 题（计算）
question: |
  如图为某药品自动传送系统的示意图．该系统由水平传送带、竖直螺旋滑槽和与滑槽平滑连接的平台组成，滑槽高为 3L，平台高为 L。药品盒 A、B 依次被轻放在以速度 v_0 匀速运动的传送带上，在与传送带达到共速后，从 M 点进入滑槽，A 刚好滑到平台最右端 N 点停下，随后滑下的 B 以 2v_0 的速度与 A 发生正碰，碰撞时间极短，碰撞后 A、B 恰好落在桌面上圆盘内直径的两端。已知 A、B 的质量分别为 m 和 2m，碰撞过程中损失的能量为碰撞前瞬间总动能的 1/4。A 与传送带间的动摩擦因数为 μ，重力加速度为 g，AB 在滑至 N 点之前不发生碰撞，忽略空气阻力和圆盘的高度，将药品盒视为质点。求：

  （1）A 在传送带上由静止加速到与传送带共速所用的时间 t；

  （2）B 从 M 点滑至 N 点的过程中克服阻力做的功 W；

  （3）圆盘的圆心到平台右端 N 点的水平距离 s。
answers:
  - { name: tSync, value: 0.5, unit: s }
  - { name: W, value: 16, unit: J }
  - { name: s, value: 0.6, unit: m }
---

## 一、题目条件分析

“轻放”表示 A、B 上传送带时初速度为零。A 与带面的动摩擦因数是 $\mu$，所以 A 相对带面滑动时加速度为 $\mu g$，加到带速 $v_0$ 后与带共速。

滑槽从 M 到平台降低 $3L$，与平台平滑相接。A 以 $v_0$ 进入滑槽，刚好在 N 点停下；B 也从 M 以 $v_0$ 进入，却以 $2v_0$ 到达 N。两者滑到 N 之前不碰撞，所以这一段只用动能定理，不必知道滑槽的具体形状。

碰撞发生在 N 点：A 静止，B 以 $2v_0$ 正碰 A，碰撞极短，损失的动能是碰前总动能的 $1/4$。碰后两盒从平台边缘做平抛，下落高度 $L$，落在桌面圆盘内直径的两端。圆盘高度和空气阻力都忽略。

题目只给字母。下面取一组代表性数值：$v_0 = 2\ \mathrm{m/s}$，$L = 0.2\ \mathrm m$，$m = 1\ \mathrm{kg}$，$\mu = 0.4$，$g = 10\ \mathrm{m/s^2}$。结果先写成字母，再代入这组数值核对。表达式里把 A 的质量写成 $m_A$，避免和单位前缀混淆。

## 二、完整解答

### （1）A 与传送带共速的时间

A 轻放后相对带面向左滑，滑动摩擦力向右：

$$
f = \mu m g, \qquad a = \frac{f}{m} = \mu g.
$$

由静止加速到 $v_0$：

$$
t = \frac{v_0}{a} = \frac{v_0}{\mu g} = \boxed{\dfrac{v_0}{\mu g}}.
$$

代入代表性数值，$t = 2/(0.4 \times 10) = 0.5\ \mathrm s$。共速前的位移 $s_{\text{带}} = v_0^2/(2\mu g)$，题目保证这一段在传送带上完成。

### （2）B 从 M 滑到 N 克服阻力做的功

A 从 M 到 N 刚好停下。取 M 所在水平面为重力势能零点，N 比 M 低 $3L$，动能定理写成

$$
\frac12 m v_0^2 + W_A = 0 + mg(-3L).
$$

A 克服阻力做的功是 $-W_A$，所以

$$
-W_A = \frac12 m v_0^2 + 3mgL.
$$

B 走同一条滑槽。滑槽对药品盒的支持力不做功，阻力与路径方向相反。题目没有单独给出阻力随速度或路径怎么变，这里按滑槽对 A、B 的动摩擦因数相同来处理：路径一样、正压力与质量成正比，所以克服阻力做的功也与质量成正比。B 的质量是 A 的 2 倍：

$$
W = 2(-W_A) = m v_0^2 + 6mgL = \boxed{mv_0^2 + 6mgL}.
$$

代入代表性数值，$W = 1 \times 4 + 6 \times 1 \times 10 \times 0.2 = 16\ \mathrm J$。

用 B 自己的动能定理核对一下。B 在 M 的动能是 $\tfrac12(2m)v_0^2 = m v_0^2$，重力做功 $2m \cdot g \cdot 3L = 6mgL$，克服阻力做功 $W$，到 N 时动能是 $\tfrac12(2m)(2v_0)^2 = 4m v_0^2$：

$$
m v_0^2 + 6mgL - W = 4m v_0^2,
$$

解出的 $W$ 与上面一致。

### （3）圆心到 N 的水平距离

碰前 A 静止，B 的动能是 $\tfrac12(2m)(2v_0)^2 = 4m v_0^2$，这就是碰前总动能。损失 $1/4$，碰后总动能为

$$
E' = \frac34 \times 4m v_0^2 = 3m v_0^2.
$$

碰撞时间极短，水平方向动量守恒。设碰后 A、B 的速度为 $v_A$、$v_B$，向右为正：

$$
m v_A + 2m v_B = 2m \cdot 2v_0,
$$

$$
\frac12 m v_A^2 + \frac12 (2m) v_B^2 = 3m v_0^2.
$$

约去 $m$，并令 $u_A = v_A/v_0$、$u_B = v_B/v_0$：

$$
u_A + 2u_B = 4, \qquad u_A^2 + 2u_B^2 = 6.
$$

消去 $u_A$ 得 $3u_B^2 - 8u_B + 5 = 0$，$(3u_B - 5)(u_B - 1) = 0$。两解是 $u_B = 1$（$u_A = 2$）和 $u_B = 5/3$（$u_A = 2/3$）。

碰前 B 在 A 左侧、向右追上来。碰后 B 不能穿过 A，所以 $v_B \le v_A$。$u_B = 5/3 > 2/3 = u_A$ 要排除，只剩

$$
v_A = 2v_0, \qquad v_B = v_0.
$$

两盒从 N 点平抛，下落高度 $L$，空中时间相同：

$$
L = \frac12 g t_{\text{落}}^2, \qquad t_{\text{落}} = \sqrt{\frac{2L}{g}}.
$$

水平位移分别是

$$
x_A = v_A t_{\text{落}} = 2v_0\sqrt{\frac{2L}{g}}, \qquad x_B = v_B t_{\text{落}} = v_0\sqrt{\frac{2L}{g}}.
$$

两者落在内直径的两端，圆心在两个落点的中点：

$$
s = \frac{x_A + x_B}{2} = \frac{3}{2} v_0 \sqrt{\frac{2L}{g}} = \boxed{\dfrac{3v_0}{2}\sqrt{\dfrac{2L}{g}}}.
$$

内直径的长度是 $x_A - x_B = v_0\sqrt{2L/g}$。代入代表性数值，$s = 1.5 \times 2 \times \sqrt{0.04} = 0.6\ \mathrm m$。

## 三、交互演示

代表性数值已写在上面。拖动时间看 A 在传送带上加速；切到后两问时看 B 沿滑槽下降、在 N 点与静止的 A 碰撞、再平抛到圆盘。

滑槽在题图里是一条竖直螺旋线。动画把它展开成三圈半径为 $L$、总降高 $3L$ 的螺旋管，每圈降低 $L$。**螺旋的水平尺寸和圆盘位置都不按比例**：题目没有给出螺旋半径和平台长度。

<Param name="v0" label="传送带速度 v_0" value={2} min={1} max={4} step={0.1} unit="m/s" />

<Param name="L" label="高度单位 L" value={0.2} min={0.2} max={0.8} step={0.02} unit="m" />

<Param name="mA" label="A 的质量 m" value={1} min={0.2} max={2} step={0.1} unit="kg" />

<Param name="mu" label="动摩擦因数 μ" value={0.4} min={0.2} max={0.8} step={0.02} />

<Param name="g" value={10} hidden />

<Param name="view" label="看哪一段" value={1} options={[{value: 1, label: "(1) 传送带加速"}, {value: 2, label: "(2)(3) 滑槽、碰撞与平抛"}]} />

<Param name="t" label="时间" value={0} min={0} max={6} step={0.01} unit="s" hidden />

<Define name="tSync" expr="v0/(mu*g)" />

<Define name="sBelt" expr="(v0*v0)/(2*mu*g)" />

<Define name="Wv" expr="mA*v0*v0" />

<Define name="Wg" expr="mA*g*L + mA*g*L + mA*g*L + mA*g*L + mA*g*L + mA*g*L" />

<Define name="W" expr="Wv + Wg" />

<Define name="tFall" expr="sqrt(2*L/g)" />

<Define name="s" expr="v0*sqrt(2*L/g) + v0*sqrt(2*L/g)/2" />

<Define name="vA" expr="2*v0" />

<Define name="vB" expr="v0" />

<Define name="xA" expr="vA*tFall" />

<Define name="xB" expr="vB*tFall" />

<Define name="dDisk" expr="xA - xB" />

<Define name="Ebefore" expr="Wv + Wv + Wv + Wv" />

<Define name="Eloss" expr="Ebefore/4" />

<Define name="Eafter" expr="Wv + Wv + Wv" />

<Define name="Tanim" expr="view == 1 ? tSync : tM + tHit + tFall" />

<Question text="(1) A 从静止加速到与传送带共速要多久？" set={{view: 1, t: 0}} hint="滑动摩擦力 μm g 一直向右，共速后摩擦力消失" />

<Question text="(2) B 从 M 滑到 N 克服阻力做多少功？" set={{view: 2, t: "tM"}} hint="先用 A 刚好停在 N 定出阻力的功，再按质量比给 B" />

<Question text="(3) 圆盘圆心到 N 点的水平距离是多少？" set={{view: 2, t: "tM + tHit + tFall"}} hint="碰后 v_A = 2v_0、v_B = v_0，圆心在两个落点中间" />

<Preset label="代表性数值，回到起点" set={{v0: 2, L: 0.2, mA: 1, mu: 0.4, view: 1, t: 0}} />

<Preset label="看碰撞那一刻" set={{view: 2, t: "tM + tHit"}} />

<Preset label="看落到圆盘" set={{view: 2, t: "tM + tHit + tFall"}} />

<Status cases={[
  {when: "view == 1 and t < tSync", label: "A 相对传送带滑动，正在加速", tone: "info"},
  {when: "view == 1", label: "A 已与传送带共速", tone: "success"},
  {when: "t < tM", label: "B 还没有进入滑槽", tone: "neutral"},
  {when: "t < tM + tHit", label: "B 沿滑槽下降，A 停在 N", tone: "info"},
  {when: "t < tM + tHit + tFall", label: "已碰撞，A、B 平抛下落", tone: "warning"},
  {label: "A、B 落在内直径的两端", tone: "success"}
]} />

<Readout items={[
  {label: "共速时间", symbol: "t", expr: "tSync", unit: "s", digits: 3, color: "velocity"},
  {label: "共速前位移", symbol: "s_带", expr: "sBelt", unit: "m", digits: 3},
  {label: "B 克服阻力做的功", symbol: "W", expr: "W", unit: "J", digits: 2, color: "force"},
  {label: "圆心到 N 的水平距离", symbol: "s", expr: "s", unit: "m", digits: 3},
  {label: "碰后 A 的速度", symbol: "v_A", expr: "vA", unit: "m/s", digits: 2, color: "velocity"},
  {label: "碰后 B 的速度", symbol: "v_B", expr: "vB", unit: "m/s", digits: 2, color: "velocity"}
]} />

B 沿滑槽的运动由组件积分：重力向下，阻力始终逆着 +s。阻力的大小取成使 B 恰好以 $2v_0$ 到达 N，并与上面的 $W$ 一致。到达 N 后速度改成碰后的 $v_0$，再平抛；落到桌面停住。

<Define name="turns" expr="3" />

<Define name="pathLen" expr="sqrt((2*pi*turns*L)^2 + (3*L)^2)" />

<Define name="fNeed" expr="Wg - Wv - Wv" />

<Define name="fMag" expr="fNeed/pathLen" />

<Define name="tM" expr="0.35" />

<Motion name="box" mass="2*mA" until="tM + 8"
  state={{s: 0, v: "v0", phase: 0, x: 0, y: 0, vx: 0, vy: 0}}
  rates={{
    s: "phase < 0.5 ? v : 0",
    v: "phase < 0.5 ? (2*mA*g*(3*L)/pathLen - fMag)/(2*mA) : 0",
    x: "phase > 0.5 ? vx : 0",
    y: "phase > 0.5 ? vy : 0",
    vx: 0,
    vy: "phase > 0.5 ? -g : 0"
  }}
  events={[
    {name: "tHit", when: "pathLen - s", dir: "down", set: {phase: 1, v: "v0", vx: "v0", vy: 0, x: "L", y: "-3*L"}},
    {name: "tLand", when: "y + 4*L", dir: "down", set: {vx: 0, vy: 0}, stop: true}
  ]}
  read={{
    sN: "s @ tHit",
    vN: "v @ tHit"
  }}
/>

<Sim
  title="传送带、螺旋滑槽与平抛"
  height={460}
  duration="Tanim"
  time="t"
  params={["view", "v0", "L", "mu", "g", "turns", "pathLen", "tSync", "sBelt", "tM", "tHit", "tFall", "box", "s", "dDisk", "W"]}
  marks={[
    {t: 0, label: "轻放"},
    {t: "tSync", label: "与传送带共速"},
    {t: "tM", label: "B 进入滑槽"},
    {t: "tM + tHit", label: "在 N 点碰撞"},
    {t: "tM + tHit + tFall", label: "落在内直径两端"}
  ]}
  hud={[
    {symbol: "t", label: "共速时间", expr: "tSync", unit: "s", digits: 2},
    {symbol: "W", label: "克服阻力做功", expr: "W", unit: "J", digits: 2},
    {symbol: "s", label: "圆心到 N", expr: "s", unit: "m", digits: 2}
  ]}
  legend={[
    {kind: "velocity", symbol: "v", label: "速度"},
    {kind: "force", symbol: "f", label: "摩擦或阻力"}
  ]}
  note="螺旋半径取 L、平台长度取 2.4L，题目都没有给出，不按比例；圆盘画在真实的水平位置 s 处。"
>
sim({
  at(t, p) {
    if (p.view < 1.5) {
      const ta = Math.min(t, p.tSync)
      return {
        mode: 1,
        xA: Math.min(0.5 * p.mu * p.g * ta * ta, p.sBelt),
        vA: Math.min(p.mu * p.g * ta, p.v0),
        accel: t < p.tSync - 1e-9,
      }
    }
    const tb = Math.max(0, t - p.tM)
    const st = p.box.state(tb)
    const u = Math.min(Math.max(st.s / p.pathLen, 0), 1)
    const ang = -2 * Math.PI * p.turns * u
    const hit = tb >= p.tHit
    const land = tb >= p.tHit + p.tFall
    return {
      mode: 2,
      st,
      hit,
      land,
      ang,
      xB: hit ? st.x : p.L * Math.cos(ang),
      yB: hit ? st.y : -3 * p.L * u,
      xA: hit ? 2 * p.v0 * Math.min(tb - p.tHit, p.tFall) : p.L,
      yA: hit ? st.y : -3 * p.L,
    }
  },
  draw(ctx, s, v) {
    const p = v.p
    if (s.mode < 1.5) {
      const m = v.view({ xmin: -0.3, xmax: p.sBelt + 1.1, ymin: -0.55, ymax: 0.85, pad: 16 })
      const belt = v.conveyor(m, 0, 0, p.sBelt + 0.7, { speed: p.v0, label: '传送带' })
      const end = belt.pt(p.sBelt)
      v.label(m, end[0], end[1], 'M', { place: 'below' })
      v.block(m, s.xA, 0, 0.34, 0.26, { label: 'A' })
      if (s.vA > 0.05) v.vec(m, s.xA, 0.32, 0.16 * s.vA, 0, { kind: 'velocity', label: 'v' })
      if (s.accel) v.vec(m, s.xA, 0.13, 0.42, 0, { kind: 'force', label: 'f' })
      v.dim(m, 0, -0.32, s.xA, -0.32, 's_带')
      v.event(m, p.sBelt, 0.3, '与传送带共速', { at: p.tSync, kind: 'velocity' })
      return
    }
    const L = p.L
    const span = Math.max(p.s + p.dDisk / 2 + 0.5, 2.6 * L)
    const m = v.view({ xmin: -2.3 * L, xmax: span, ymin: -4.55 * L, ymax: 1.35 * L, pad: 18, equal: true })
    const helix = []
    for (let i = 0; i <= 72; i++) {
      const u = i / 72
      const a = -2 * Math.PI * p.turns * u
      helix.push([L * Math.cos(a), -3 * L * u])
    }
    v.track(m, [{ path: helix, pipe: true }])
    v.ground(m, L, 2.4 * L, -3 * L, { thick: 12 })
    v.label(m, 1.7 * L, -2.85 * L, '平台', { place: 'above' })
    v.ground(m, -1.6 * L, span, -4 * L)
    v.bar(m, -0.9 * L, -4 * L, -0.9 * L, -3.15 * L, { thick: 7 })
    v.bar(m, 1.5 * L, -4 * L, 1.5 * L, -3.15 * L, { thick: 7 })
    v.label(m, L, 0, 'M', { place: 'above' })
    v.label(m, L, -3 * L, 'N', { place: 'above' })
    v.dim(m, -2.05 * L, 0, -2.05 * L, -3 * L, '3L')
    v.dim(m, -2.05 * L, -3 * L, -2.05 * L, -4 * L, 'L')
    const bx = s.xB
    const by = s.yB
    v.block(m, bx, by, 0.24 * L, 0.22 * L, { label: 'B' })
    v.block(m, s.xA, s.yA, 0.24 * L, 0.22 * L, { label: 'A', ghost: !s.hit })
    const cx = p.s
    v.ellipse(m, cx, -4 * L, p.dDisk / 2, 0.16 * L, { color: v.color.steel })
    v.label(m, cx, -4 * L, '圆盘', { place: 'below' })
    v.circle(m, cx, -4 * L, 0.035 * L, { fill: v.color.ink })
    v.dim(m, 0, -4.35 * L, cx, -4.35 * L, 's')
    if (!s.hit && s.st.v > 0.05) {
      v.vec(m, bx, by, 0.12 * s.st.v * Math.sin(s.ang), -0.05 * s.st.v, { kind: 'velocity', label: 'v' })
    }
    if (s.hit && !s.land) {
      v.vec(m, s.xA, s.yA, 0.1 * 2 * p.v0, 0, { kind: 'velocity', label: 'v_A' })
      v.vec(m, bx, by, 0.1 * p.v0, 0, { kind: 'velocity', label: 'v_B' })
    }
    v.event(m, L, 0, 'B 进入滑槽', { at: p.tM, kind: 'velocity' })
    v.event(m, L, -3 * L, '在 N 点碰撞', { at: p.tM + p.tHit, kind: 'force' })
    v.event(m, cx, -4 * L, '落在内直径两端', { at: p.tM + p.tHit + p.tFall, kind: 'velocity' })
  },
})
</Sim>

<Plot
  title="A 在传送带上的速度"
  size="wide"
  x={{name: "t", label: "t", unit: "s", min: 0, max: "tSync"}}
  y={{label: "v", unit: "m/s", min: 0, max: "1.2*v0"}}
  series={[
    {label: "A 的速度", expr: "min(mu*g*t, v0)", color: "velocity"},
    {label: "传送带速度 v_0", expr: "v0", color: "steel", dash: true}
  ]}
  marks={[{x: "tSync", series: 0, label: "共速"}]}
  cursor="t"
/>

这张图只覆盖第（1）问。切到滑槽以后，时间游标会走出横轴，滑槽上的速度看动画。

<Ledger
  title="碰撞前后的动能"
  size="narrow"
  unit="J"
  digits={2}
  parts={[
    {label: "碰后动能", symbol: "E'", expr: "Eafter", color: "velocity"},
    {label: "碰撞损失", symbol: "ΔE", expr: "Eloss", color: "force"}
  ]}
  total={{label: "碰前总动能", expr: "Ebefore"}}
/>

损失始终是碰前总动能的 $1/4$，与滑块无关。

## 四、结合图像理解关键时刻

| 时刻 | 发生了什么 |
|---|---|
| $t = 0$ | A 轻放在传送带上，初速度为零 |
| $t = v_0/(\mu g)$ | A 与传送带共速，摩擦力消失，之后以 $v_0$ 进入 M |
| B 进入 M | B 也以 $v_0$ 入槽；重力做正功，阻力做负功 |
| B 到达 N | B 的速度是 $2v_0$，静止的 A 在 N 点 |
| 碰撞后 | $v_A = 2v_0$、$v_B = v_0$，动能只剩下 $3/4$ |
| 落到桌面 | 两盒分居内直径两端，圆心在两落点正中间 |

**A 刚好停在 N，是求阻力做功的条件，不是求碰撞速度的条件。** B 到 N 的速度 $2v_0$ 是题目直接给出的，用它反过来写 B 的动能定理，就得到 $W$。

**动量守恒和能量损失一起用，会出两组速度。** $v_B > v_A$ 那一组表示 B 穿过了 A，正碰不会发生，舍去。

## 五、答案汇总

| 小问 | 答案 |
|---|---|
| （1）共速时间 | $\boxed{t = v_0/(\mu g)}$ |
| （2）B 克服阻力做的功 | $\boxed{W = mv_0^2 + 6mgL}$ |
| （3）圆心到 N 的水平距离 | $\boxed{s = \dfrac{3v_0}{2}\sqrt{2L/g}}$ |

<Answer items={[
  {label: "共速时间", symbol: "t", expr: "tSync", value: 0.5, unit: "s", digits: 3},
  {label: "克服阻力做的功", symbol: "W", expr: "W", value: 16, unit: "J", digits: 2},
  {label: "圆心到 N 的水平距离", symbol: "s", expr: "s", value: 0.6, unit: "m", digits: 3}
]} />
