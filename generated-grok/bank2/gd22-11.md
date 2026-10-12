---
id: gd22-11
title: 小球撞橡胶的机械能损失
source: 2022 广东卷 第 11 题（实验；必考题共 42 分，原卷未单列本题分值）
question: |
  某实验小组为测量小球从某一高度释放，与某种橡胶材料碰撞导致的机械能损失，设计了如图（a）所示的装置，实验过程如下：

  【图（a）】底座上立着支架，顶部横梁标「释放装置」，其下用夹具吊着一个小球，标「小球」。小球正下方一条竖直虚线。中部向右伸出的水平臂标「光电门」，虚线从门中穿过，线上有一个小圆点。底座右上方一块垫块标「固定的橡胶材料」。左侧一个方盒标「数字计时器」，有导线连到光电门。

  【图（b）】螺旋测微器的示数。固定套筒上标有 0 和 5：0 mm 刻线在左，5 mm 刻线约在套筒中部，套筒上还能看到 5 mm 之后的刻线，可动刻度筒的左缘落在 7 mm 刻线与 8 mm 刻线之间，并且与毫米刻线错开的半毫米刻线已经从套筒边缘露出。可动刻度上标有 35、40、45，固定套筒的水平基准线落在 38 与 39 之间、靠近 38 的一侧（大约在 38.3 到 38.4）。

  （1）让小球从某一高度由静止释放，与水平放置的橡胶材料碰撞后竖直反弹。调节光电门位置，使小球从光电门正上方释放后，在下落和反弹过程中均可通过光电门。

  （2）用螺旋测微器测量小球的直径，示数如图（b）所示，小球直径 d = ____ mm。

  （3）测量时，应____（选填“A”或“B”，其中 A 为“先释放小球，后接通数字计时器”，B 为“先接通数字计时器，后释放小球”）。记录小球第一次和第二次通过光电门的遮光时间 t_1 和 t_2。

  （4）计算小球通过光电门的速度，已知小球的质量为 m，可得小球与橡胶材料碰撞导致的机械能损失 ΔE = ____（用字母 m、d、t_1 和 t_2 表示）。

  （5）若适当调高光电门的高度，将会____（选填“增大”或“减小”）因空气阻力引起的测量误差。
answers:
  - { name: d, value: 7.883, unit: mm }
  - { name: dE, value: 0.05018, unit: J }
---

小球从光电门正上方由静止释放，竖直下落、撞上水平橡胶后反弹，再从下往上第二次穿过同一个光电门。光电门记下两次遮光时间 $t_1$、$t_2$，螺旋测微器测出直径 $d$。遮光段的长度就是小球直径，所以两次通过光电门的速率分别是 $d/t_1$ 和 $d/t_2$。碰撞损失的机械能，就是同一高度上下落动能与反弹动能之差。

题目没有给质量、释放高度和光电门高度。下面取代表性数值：$m = 20\ \mathrm{g}$，释放点离橡胶顶面 $H = 0.40\ \mathrm{m}$，光电门离橡胶顶面 $h = 0.12\ \mathrm{m}$，碰撞恢复系数 $e = 0.6$。滑块可以改这些数，看遮光时间和能量怎么变。$g = 9.8\ \mathrm{m/s^2}$。

## 完整解答

**（2）直径**

固定刻度：可动刻度筒左缘落在 $7\ \mathrm{mm}$ 与 $8\ \mathrm{mm}$ 之间，且错开的半毫米刻线已经露出，所以固定读数为 $7.5\ \mathrm{mm}$。

可动刻度：基准线落在 38 与 39 之间、靠近 38 一侧，估读 $38.3$。每一格是 $0.01\ \mathrm{mm}$，可动读数为 $0.383\ \mathrm{mm}$。

$$d = 7.5\ \mathrm{mm} + 0.383\ \mathrm{mm} = \boxed{7.883\ \mathrm{mm}}$$

（估读到 $38.4$ 时为 $7.884\ \mathrm{mm}$，也在读数误差内。）

**（3）操作顺序**

应选 **B**：先接通数字计时器，后释放小球。

光电门只在遮光的那一段里计时。先放小球再接通，下落通过光电门的 $t_1$ 就会漏记或只记下一截，两次速率都不能用。

**（4）机械能损失**

小球直径为 $d$，通过光电门时遮光的长度就是 $d$。两次遮光时间分别为 $t_1$、$t_2$，速率

$$v_1 = \frac{d}{t_1}, \qquad v_2 = \frac{d}{t_2}$$

两次都在光电门所在的同一高度。重力势能相同，碰撞损失的机械能等于这里的动能之差：

$$\Delta E = \frac{1}{2}m v_1^2 - \frac{1}{2}m v_2^2 = \boxed{\dfrac{1}{2}m\left(\dfrac{d}{t_1}\right)^2 - \dfrac{1}{2}m\left(\dfrac{d}{t_2}\right)^2}$$

代表性数值下，$H = 0.40\ \mathrm{m}$、$h = 0.12\ \mathrm{m}$、$e = 0.6$、$m = 0.020\ \mathrm{kg}$。光电门处 $v_1 = \sqrt{2g(H-h)} \approx 2.34\ \mathrm{m/s}$，$v_2 = \sqrt{e^2\cdot 2gH - 2gh} \approx 0.89\ \mathrm{m/s}$，动能差 $\Delta E \approx 0.050\ \mathrm{J}$。它等于 $\tfrac12 m(1-e^2)\cdot 2gH$，和光电门放在哪无关。改 $e$ 或 $H$ 时这个数会变，字母式不变。

**（5）空气阻力带来的误差**

应填 **增大**。

碰撞本身发生在橡胶上。光电门调高后，下落通过光电门再到橡胶、反弹后再回到光电门，中间多出一段空气里的路程。这一段上空气阻力做负功，也会让 $v_2$ 比 $v_1$ 更小，被算进 $\Delta E$。光电门越高，这一段越长，空气阻力引起的测量误差越大。

## 交互演示

拖动进度条，看小球下落、撞上橡胶、反弹再穿过光电门。遮光的那一瞬间，光束点亮，计时器显示这一次的遮光时间。螺旋测微器的刻度固定在题图的读数上。

<Param name="t" label="时刻" value={0} min={0} max={2} step={0.001} unit="s" hidden />

<Param name="m" label="小球质量 m" value={0.02} min={0.005} max={0.05} step={0.001} unit="kg" />

<Param name="H" label="释放高度 H" value={0.4} min={0.2} max={0.6} step={0.01} unit="m" />

<Param name="hGate" label="光电门高度 h" value={0.12} min={0.04} max={0.3} step={0.01} unit="m" />

<Param name="e" label="恢复系数 e" value={0.6} min={0.3} max={0.95} step={0.01} />

<Param name="g" value={9.8} hidden />

<Define name="d" expr="7.883" />

<Define name="dSI" expr="d/1000" />

<Motion name="ball" mass="m" along={90} until={2}
  state={{x: "H", v: 0, phase: 0}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g"}
  ]}
  events={[
    {name: "tHit", when: "x - dSI/2", dir: "down", set: {v: "e*sqrt(2*g*H)", x: "dSI/2 + 0.0002", phase: 1}}
  ]}
/>

<Define name="v1" expr="sqrt(2*g*(H - hGate))" />

<Define name="v2" expr="sqrt(max(e*e*2*g*H - 2*g*hGate, 0))" />

<Define name="t1" expr="dSI/v1" />

<Define name="t2" expr="v2 > 0 ? dSI/v2 : 0" />

<Define name="dE" expr="0.5*m*(1 - e*e)*2*g*H" />

<Define name="Ek1" expr="0.5*m*v1*v1" />

<Define name="Ek2" expr="0.5*m*v2*v2" />

<Question text="（2）螺旋测微器读数 d = ____ mm" hint="固定刻度 7.5 mm，可动刻度靠近 38.3" />

<Question text="（3）应先接通计时器还是先释放小球？" hint="先接通，两次遮光才都能记下" />

<Question text="（4）碰撞导致的机械能损失 ΔE" hint="同一高度上两次动能之差" />

<Question text="（5）调高光电门，空气阻力引起的误差怎么变？" hint="光电门越高，碰撞前后多出的空气里路程越长" />

<Preset label="题图读数与代表值" set={{m: 0.02, H: 0.4, hGate: 0.12, e: 0.6}} />

<Preset label="光电门调高" set={{hGate: 0.28}} />

<Status cases={[
  {when: "v2 <= 0", label: "反弹到不了光电门，记不下 t_2", tone: "warning"},
  {when: "hGate > H - 0.02", label: "光电门高过释放点，下落过不了门", tone: "warning"},
  {label: "下落、反弹都能穿过光电门", tone: "success"}
]} />

<Readout items={[
  {label: "下落速率", symbol: "v_1", expr: "v1", unit: "m/s", digits: 3, color: "velocity"},
  {label: "反弹速率", symbol: "v_2", expr: "v2", unit: "m/s", digits: 3, color: "velocity"},
  {label: "遮光时间", symbol: "t_1", expr: "t1*1000", unit: "ms", digits: 2},
  {label: "遮光时间", symbol: "t_2", expr: "t2*1000", unit: "ms", digits: 2},
  {label: "机械能损失", symbol: "ΔE", expr: "dE*1000", unit: "mJ", digits: 2, color: "force"}
]} />

<Answer items={[
  {label: "（2）小球直径", symbol: "d", expr: "d", value: 7.883, unit: "mm", digits: 3},
  {label: "（3）操作顺序", text: "B（先接通数字计时器，后释放小球）"},
  {label: "（4）机械能损失", symbol: "ΔE", text: "(1/2)m(d/t_1)² − (1/2)m(d/t_2)²"},
  {label: "代表值下的 ΔE", symbol: "ΔE", expr: "dE", value: 0.05018, unit: "J", digits: 5},
  {label: "（5）空气阻力引起的误差", text: "增大"}
]} />

<Sim title="小球穿过光电门后撞上橡胶" height={420} duration={2} time="t" playSeconds={6}
  params={["ball", "H", "hGate", "dSI", "t1", "t2", "v1", "v2"]}
  marks={[
    {t: 0, label: "释放"},
    {t: "tHit", label: "撞上橡胶"}
  ]}
  hud={[
    {symbol: "v", expr: "ball.v(t)", unit: "m/s", digits: 2},
    {symbol: "ΔE", expr: "0.5*m*(v1*v1 - v2*v2)*1000", unit: "mJ", digits: 2}
  ]}
  legend={[{kind: "velocity", label: "速度"}]}
  note="支架间距与小球直径不按比例；遮光时间只有几毫秒，进度条上看不出来"
>
sim({
  at(t, p) {
    const s = p.ball.state(t)
    return { y: s.x, v: s.v }
  },
  draw(ctx, s, v) {
    const H = v.p.H
    const h = v.p.hGate
    const r = 0.012
    const m = v.view({ xmin: -0.16, xmax: 0.42, ymin: -0.03, ymax: Math.max(H, h) + 0.08, pad: 16 })
    const blocked = Math.abs(s.y - h) < r
    const rising = s.v > 0.05
    const shown = blocked ? (rising ? v.p.t2 * 1000 : v.p.t1 * 1000).toFixed(2) + ' ms' : null
    v.ground(m, -0.16, 0.42, 0)
    v.wall(m, -0.1, 0, H + 0.05)
    v.ground(m, -0.1, 0.06, H + 0.05, { side: 'above', thick: 8 })
    v.bar(m, -0.1, h, 0.05, h, { thick: 7 })
    v.bar(m, -0.02, H + 0.05, -0.02, H - 0.01, { thick: 5 })
    v.block(m, 0.1, 0, 0.08, 0.018)
    v.photogate(m, h, -0.028, 0.028, {
      horizontal: true,
      blocked,
      post: 0,
      time: shown,
      timeLabel: rising && blocked ? 't_2' : 't_1',
      label: '光电门',
    })
    v.ball(m, 0, s.y, r)
    const spd = Math.abs(s.v)
    if (spd > 0.3 && s.y > r + 0.05) {
      const len = Math.min(0.07, Math.max(0.035, spd * 0.022))
      v.vec(m, 0, s.y, 0, Math.sign(s.v) * len, { kind: 'velocity', label: 'v' })
    }
    v.label(m, -0.02, H - 0.02, '释放装置', { place: 'left' })
    v.label(m, 0.1, 0.02, '橡胶', { place: 'right' })
    v.label(m, 0, s.y, '小球', { place: 'left' })
    v.event(m, 0, r, '碰撞', { at: v.p.ball.tHit, kind: 'force' })
  },
})
</Sim>

<Instrument title="螺旋测微器" type="micrometer" value="d" unit="mm" note="固定刻度 7.5 mm，可动刻度估读 38.3" />

<Plot title="速度随时间变化" size="wide"
  x={{name: "t", label: "t", unit: "s", min: 0, max: 1.2}}
  y={{label: "v", unit: "m/s", min: -3.5, max: 2.5}}
  series={[{label: "v", expr: "t <= ball.tEnd ? ball.v(t) : NaN", color: "velocity"}]}
  marks={[
    {x: "tHit", label: "撞上橡胶，速度由向下变向上"}
  ]}
  cursor="t"
/>

<Ledger title="光电门高度上的动能" size="narrow" unit="mJ" digits={2}
  caption="重力势能相同，差值就是碰撞损失的机械能"
  parts={[
    {label: "反弹后动能", symbol: "E_k2", expr: "Ek2*1000", color: "velocity"},
    {label: "碰撞损失", symbol: "ΔE", expr: "dE*1000", color: "force"}
  ]}
  total={{label: "下落动能", symbol: "E_k1", expr: "Ek1*1000"}}
/>

## 结合图像

速度向下为负。释放后速度另速增大，直到撞上橡胶。碰撞后速度立刻变正，大小只有撞前的 $e$ 倍，然后在重力下减小、到达最高点后再向下。

光电门在橡胶上方 $h$ 处。下落穿过它时速率是 $v_1 = \sqrt{2g(H-h)}$，反弹再次穿过时是 $v_2 = \sqrt{e^2 \cdot 2gH - 2gh}$。两次的重力势能一样，动能少掉的那一份就是碰撞损失的机械能。账本里深色的一条是还留下的动能，浅色的一条是损失。

把光电门调高，$v_1$ 和 $v_2$ 都变小，遮光时间变长；按上面的公式，两次动能之差仍是碰撞那一下的损失。真实实验里空气阻力会在多出来的这一段路上再做一份负功，这份也进了测出的 $\Delta E$，所以误差增大。

## 答案

| 小问 | 答案 |
|---|---|
| （2）直径 $d$ | $7.883\ \mathrm{mm}$（$7.884\ \mathrm{mm}$ 也可） |
| （3）操作顺序 | B |
| （4）机械能损失 | $\dfrac{1}{2}m\left(\dfrac{d}{t_1}\right)^2 - \dfrac{1}{2}m\left(\dfrac{d}{t_2}\right)^2$ |
| （5）空气阻力引起的误差 | 增大 |
