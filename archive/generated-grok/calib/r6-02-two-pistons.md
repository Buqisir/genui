---
id: r6-02-two-pistons
title: 双活塞汽缸：水平压强与竖直位移
subject: physics
topic: 玻意耳定律
source: 2022 珠海模拟
breadcrumb: ["热学", "玻意耳定律", "2022 珠海模拟"]
question: |
  （2022·珠海模拟）汽缸由两个横截面积不同的圆筒连接而成，活塞 A 在粗筒中、活塞 B 在细筒中，A、B 被轻质刚性细杆连接在一起，可无摩擦地移动。A、B 的质量分别为 m_A=12 kg、m_B=8.0 kg，横截面积分别为 S_A=4.0×10⁻² m²、S_B=2.0×10⁻² m²。一定质量的理想气体被封闭在两活塞之间，两活塞的外侧都与大气相通，大气压强 p₀=1.0×10⁵ Pa，g 取 10 m/s²，两个圆筒都足够长。
  (1) 汽缸水平放置达到平衡状态时，求气体的压强；
  (2) 已知汽缸水平放置时气体的体积 V=2.0×10⁻² m³。现保持温度不变，将汽缸竖直放置（A 在上、B 在下），达到平衡后，与水平放置时相比，活塞在汽缸内移动的距离 l 为多少？
answers:
  - { name: pHoriz, value: 100000, unit: Pa }
  - { name: pVert, value: 110000, unit: Pa }
  - { name: lVert, value: 0.090909, unit: m }
---

## 一、题目条件分析

- 活塞 A 在粗筒中，活塞 B 在细筒中，轻质刚性细杆把二者连成整体，沿汽缸无摩擦滑动。封闭的理想气体在两活塞之间，两活塞外侧都通大气。
- 已知 $m_A = 12\ \text{kg}$，$m_B = 8.0\ \text{kg}$，$S_A = 4.0\times 10^{-2}\ \text{m}^2$，$S_B = 2.0\times 10^{-2}\ \text{m}^2$，$p_0 = 1.0\times 10^{5}\ \text{Pa}$，$g = 10\ \text{m/s}^2$。水平时气体体积 $V_1 = 2.0\times 10^{-2}\ \text{m}^3$。
- 两个圆筒都足够长，平衡过程中 A 始终留在粗筒、B 始终留在细筒。
- 轴向正方向取为指向 A 的外侧。细杆长度不变，两活塞的位移相同，记为 $l$。
- 气体体积 $V = S_A L_A + S_B L_B$。整体向 B 的外侧移动 $l$ 时，粗筒气柱缩短 $l$、细筒气柱伸长 $l$，所以

$$
\Delta V = (S_A - S_B)\, l
$$

间距不变，体积仍会变，因为两段横截面积不同。

## 二、完整解答

取 A、B 和轻杆组成的整体。杆的拉力是内力。筒壁支持力垂直于轴向，无摩擦，轴向分力为零。气体和大气作用在整体上的轴向合力为

$$
F_p = (p - p_0) S_A - (p - p_0) S_B = (p - p_0)(S_A - S_B)
$$

方向沿轴向正方向（指向 A 的外侧）。设汽缸轴与水平方向的夹角为 $\theta$，A 端抬高。重力沿轴向、指向 B 一侧的分力大小为 $(m_A + m_B) g \sin\theta$。平衡时

$$
(p - p_0)(S_A - S_B) = (m_A + m_B) g \sin\theta
$$

### （1）水平放置

水平时 $\theta = 0$，$\sin\theta = 0$，重力没有轴向分力，于是 $F_p = 0$。又 $S_A \neq S_B$，所以

$$
p_1 = p_0 = \boxed{1.0\times 10^{5}\ \text{Pa}}
$$

### （2）竖直放置后的移动距离

竖直且 A 在上、B 在下时，$\theta = 90^\circ$，$\sin\theta = 1$：

$$
p_2 = p_0 + \frac{(m_A + m_B) g}{S_A - S_B}
= 1.0\times 10^{5} + \frac{(12 + 8.0)\times 10}{4.0\times 10^{-2} - 2.0\times 10^{-2}}
= 1.0\times 10^{5} + \frac{200}{2.0\times 10^{-2}}
= \boxed{1.1\times 10^{5}\ \text{Pa}}
$$

温度不变，由玻意耳定律 $p_1 V_1 = p_2 V_2$：

$$
V_2 = \frac{p_1}{p_2} V_1 = \frac{1.0\times 10^{5}}{1.1\times 10^{5}}\times 2.0\times 10^{-2} = \frac{10}{11}\times 2.0\times 10^{-2}\ \text{m}^3
$$

体积减小，整体向 B 的外侧移动。竖直放置时 B 在下，所以活塞向下移动。由 $\Delta V = (S_A - S_B)\, l$，

$$
l = \frac{V_1}{S_A - S_B}\left(1 - \frac{p_1}{p_2}\right)
= \frac{2.0\times 10^{-2}}{2.0\times 10^{-2}}\left(1 - \frac{10}{11}\right)
= \boxed{\dfrac{1}{11}\ \text{m}}
$$

约为 $9.09\times 10^{-2}\ \text{m}$。

对任意倾角，准静态平衡且温度保持初温时

$$
p(\theta) = p_0 + \frac{(m_A + m_B) g \sin\theta}{S_A - S_B},\qquad
V(\theta) = \frac{p_1 V_1}{p(\theta)},\qquad
l(\theta) = \frac{V_1 - V(\theta)}{S_A - S_B}
$$

第（1）（2）问就是 $\theta = 0^\circ$ 和 $\theta = 90^\circ$。题目只规定初、末温度相同；下面的演示把翻转看成缓慢的等温过程，每一个倾角都是一个平衡态。初态和末态的 $p$、$l$ 由该角度的力平衡和玻意耳定律决定。

> **易错点**：净体积变化是 $(S_A - S_B) l$。若写成 $S_A l$，代入数据得到 $l = 1/22\ \text{m}$。本题恰好 $S_A = 2 S_B$，因而 $S_A - S_B = S_B$，用 $S_B$ 去除会碰巧得到 $1/11\ \text{m}$；面积差才是一般关系。

## 三、交互演示

拖动倾角，或点右侧预设。$\theta = 0^\circ$ 是第（1）问，$\theta = 90^\circ$（A 在上）是第（2）问。受力图把整体受到的重力 $G$、筒壁支持力 $N$ 和轴向压力差 $F_p$ 解出来；$G$ 的大小和方向不变，$N$ 与 $F_p$ 始终垂直，交点沿辅助圆移动。水平时 $F_p = 0$，竖直时 $N = 0$、$F_p = G$。

图中半径按 $S = \pi r^2$ 绘制。题目没有给定气柱怎样分在两段圆筒里，图上取一组满足 $S_A L_A + S_B L_B = V_1$ 的长度：$L_A = 0.30\ \text{m}$，$L_B = 0.40\ \text{m}$。$S_A = 4.0\times 10^{-2}\ \text{m}^2$ 对应的直径约 $23\ \text{cm}$，所以圆筒看起来较粗。移动距离 $l$ 与这一分段无关。虚线活塞是水平平衡位置。

<Question text="汽缸水平放置达到平衡时，气体的压强是多少？" set={{theta: 0}} hint="取 A、B 和轻杆整体。水平时重力没有轴向分力，S_A 不等于 S_B。" />

<Question text="温度不变，竖直放置（A 在上、B 在下）后，活塞移动的距离 l 是多少？" set={{theta: 90}} hint="先由轴向平衡求 p_2，再用 p_1 V_1 = p_2 V_2。净体积变化是 (S_A − S_B) l。" />

<Param name="theta" label="汽缸倾角" symbol="θ" min={0} max={90} step={1} value={0} unit="°" />

<Define name="mA" expr="12" />

<Define name="mB" expr="8" />

<Define name="SA" expr="0.04" />

<Define name="SB" expr="0.02" />

<Define name="p0" expr="100000" />

<Define name="V0" expr="0.02" />

<Define name="g" expr="10" />

<Define name="dS" expr="SA - SB" />

<Define name="Gtot" expr="(mA + mB) * g" />

<Define name="pHoriz" expr="p0" />

<Define name="pVert" expr="p0 + Gtot / dS" />

<Define name="Vvert" expr="p0 * V0 / pVert" />

<Define name="lVert" expr="(V0 - p0 * V0 / pVert) / dS" />

<ForceDiagram
  title="整体受力：F_p 指向 A 的外侧"
  surface={{type: "none"}}
  body={{shape: "block", label: "整体"}}
  forces={[
    {label: "G", angle: -90, magnitude: "Gtot", showValue: true, unit: "N", digits: 0},
    {label: "N", angle: "theta + 90", solve: "Nwall", showValue: true, unit: "N", digits: 1},
    {label: "F_p", angle: "theta", solve: "Fp", showValue: true, unit: "N", digits: 1}
  ]}
  triangle={{order: [0, 1, 2], circle: true, angleLabel: "90°", title: "G 不变，N 与 F_p 垂直"}}
/>

<Define name="pNow" expr="p0 + Fp / dS" />

<Define name="VNow" expr="p0 * V0 / pNow" />

<Define name="lNow" expr="(V0 - VNow) / dS" />

<Define name="rA" expr="sqrt(SA / pi)" />

<Define name="rB" expr="sqrt(SB / pi)" />

<Define name="LA0" expr="0.3" />

<Define name="LB0" expr="(V0 - SA * LA0) / SB" />

<Define name="uA0" expr="LA0" />

<Define name="uB0" expr="-LB0" />

<Define name="uA" expr="LA0 - lNow" />

<Define name="uB" expr="-LB0 - lNow" />

<Status cases={[
  {when: "theta >= 89.5", label: "竖直平衡：A 在上，B 在下", tone: "success"},
  {when: "theta <= 0.5", label: "水平平衡：气体压强等于大气压", tone: "info"},
  {label: "倾斜平衡：F_p 等于重力的轴向分力", tone: "neutral"}
]} />

<Preset label="水平放置" set={{theta: 0}} />

<Preset label="竖直放置（求 l）" set={{theta: 90}} />

<Readout items={[
  {label: "气体压强", symbol: "p", expr: "pNow", unit: "Pa", format: "sci", digits: 2, color: "field"},
  {label: "气体体积", symbol: "V", expr: "VNow", unit: "m³", digits: 5},
  {label: "活塞位移", symbol: "l", expr: "lNow", unit: "m", digits: 4, color: "velocity"},
  {label: "轴向压力差", symbol: "F_p", expr: "Fp", unit: "N", digits: 1, color: "force"}
]} />

<Answer items={[
  {label: "水平时气体压强", symbol: "p_1", expr: "pHoriz", value: 100000, unit: "Pa", format: "sci", digits: 2},
  {label: "竖直时气体压强", symbol: "p_2", expr: "pVert", value: 110000, unit: "Pa", format: "sci", digits: 2},
  {label: "活塞移动距离", symbol: "l", expr: "lVert", value: 0.090909, unit: "m", digits: 6}
]} />

<Figure title="双活塞汽缸（0° 水平，90° 时 A 在上）" height={560} params={["theta", "rA", "rB", "uA", "uB", "uA0", "uB0", "lNow", "pNow", "p0"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -1.35, xmax: 1.35, ymin: -1.5, ymax: 1.3, equal: true, pad: 16 })
    const rad = (p.theta * Math.PI) / 180
    const c = Math.cos(rad)
    const s = Math.sin(rad)
    const nx = -s
    const ny = c
    function pt(u, w) {
      return [u * c + w * nx, u * s + w * ny]
    }

    v.ground(m, -1.2, 1.2, -1.18)
    v.arrow(m, 1.05, -0.78, 1.05, -1.08, { color: v.color.ink })
    v.text(m, 1.05, -0.66, '下', { align: 'center', color: v.color.ink, size: 12 })
    v.text(m, -1.2, 1.12, 'θ = ' + p.theta.toFixed(0) + '°', { align: 'left', color: v.color.ink, size: 14 })

    const spec = {
      x: 0,
      y: 0,
      angle: p.theta,
      sections: [
        { from: -0.9, to: 0, r: p.rB },
        { from: 0, to: 0.66, r: p.rA },
      ],
      pistons: [
        { at: p.uB, label: 'B' },
        { at: p.uA, label: 'A' },
      ],
      rod: true,
      gas: {
        from: p.uB,
        to: p.uA,
        count: 16,
        density: p.pNow / p.p0,
        temp: 1,
      },
    }
    if (p.lNow > 0.004) spec.ghosts = [{ at: p.uB0 }, { at: p.uA0 }]
    v.tube(m, spec)

    if (p.theta > 8) {
      v.line(m, 0, 0, 0.36, 0, { color: v.color.steel, dash: [5, 4], width: 1.5 })
      v.label(m, 0.46, -0.02, '水平', { color: v.color.steel, size: 11 })
    }

    const atmB = pt(-1.02, 0)
    const atmA = pt(0.8, 0)
    v.label(m, atmB[0], atmB[1], '大气', { color: v.color.graphite, size: 12 })
    v.label(m, atmA[0], atmA[1], '大气', { color: v.color.graphite, size: 12 })

    const thinLab = pt(-0.68, p.rB + 0.12)
    const thickLab = pt(0.5, p.rA + 0.12)
    v.label(m, thinLab[0], thinLab[1], '细筒', { color: v.color.steel, size: 12 })
    v.label(m, thickLab[0], thickLab[1], '粗筒', { color: v.color.steel, size: 12 })

    const gasLab = pt((p.uA + p.uB) / 2, 0)
    v.label(m, gasLab[0], gasLab[1], '气体', { color: v.color.field, size: 12 })

    if (p.lNow > 0.004) {
      const w = -(p.rA + 0.16)
      const a0 = pt(p.uA0, w)
      const a1 = pt(p.uA, w)
      v.dim(m, a0[0], a0[1], a1[0], a1[1], 'l = ' + p.lNow.toFixed(4) + ' m')
    }
  },
})
</Figure>

水平放置时读数里的 $p$ 就是第（1）问。点「竖直放置」后，$p$ 升到 $1.10\times 10^{5}\ \text{Pa}$，$l$ 增加到 $1/11\ \text{m}$，活塞朝细筒外侧（图中为向下）移动，气体略变密。两活塞之间的距离始终是 $0.70\ \text{m}$。

<Plot
  title="气体压强随倾角变化"
  caption="轴向平衡：压强增量正比于 sin θ，起点斜率最大，接近竖直时变平"
  x={{name: "ang", label: "θ", unit: "°", min: 0, max: 90}}
  y={{label: "p", unit: "Pa", min: "p0 - 2000", max: "pVert + 2000"}}
  series={[
    {label: "气体压强 p", expr: "p0 + Gtot * sin(deg(ang)) / dS", color: "field"},
    {label: "大气压 p_0", expr: "p0", color: "steel", dash: true}
  ]}
  marks={[
    {x: 0, label: "水平"},
    {x: 90, label: "竖直"}
  ]}
  cursor="theta"
/>

<Plot
  title="等温线：从水平平衡走到竖直平衡"
  caption="温度不变，pV 为常量。右端是水平状态，左端是竖直状态"
  x={{label: "V", unit: "m³", min: "Vvert - 0.0008", max: "V0 + 0.0008"}}
  y={{label: "p", unit: "Pa", min: "p0 - 2000", max: "pVert + 2000"}}
  series={[
    {
      label: "等温过程",
      x: "p0 * V0 / (p0 + Gtot * sin(deg(s)) / dS)",
      expr: "p0 + Gtot * sin(deg(s)) / dS",
      over: {name: "s", min: 0, max: 90},
      point: "theta",
      color: "field"
    }
  ]}
  marks={[
    {x: "V0", label: "水平"},
    {x: "Vvert", label: "竖直"}
  ]}
/>

<Plot
  title="活塞相对水平位置的位移"
  caption="l 指向 B 的外侧。θ = 90° 时 l = 1/11 m"
  x={{name: "ang", label: "θ", unit: "°", min: 0, max: 90}}
  y={{label: "l", unit: "m", min: 0, max: "lVert * 1.25"}}
  series={[
    {label: "位移 l", expr: "(V0 - p0 * V0 / (p0 + Gtot * sin(deg(ang)) / dS)) / dS", color: "velocity"}
  ]}
  marks={[
    {x: 0, label: "水平"},
    {x: 90, label: "l = 1/11 m"}
  ]}
  cursor="theta"
/>

## 四、结合图像理解关键时刻

- $\theta = 0^\circ$：$F_p = 0$，两条压强线重合，$p_1 = p_0$，位移为零。受力三角形里只剩下彼此平衡的 $G$ 和 $N$。
- 刚离开水平时，$\sin\theta$ 的斜率最大，压强上升得最快；接近 $90^\circ$ 时 $\cos\theta \to 0$，压强几乎不再增加。
- 等温线上的状态点从 $(V_1,\ p_0)$ 移到 $(V_2,\ p_2)$。压强只上升了 $10\%$，体积也只减小约 $9\%$，对应的位移是 $1/11\ \text{m}$。
- $\theta = 90^\circ$：$N = 0$，$F_p = (m_A + m_B) g = 200\ \text{N}$，$p_2 = 1.1\times 10^{5}\ \text{Pa}$，$l = 1/11\ \text{m}$。这就是第（2）问的平衡态。

## 五、答案汇总

| 问题 | 答案 |
|---|---|
| （1）水平时气体压强 $p_1$ | $1.0\times 10^{5}\ \text{Pa}$ |
| 竖直时气体压强 $p_2$ | $1.1\times 10^{5}\ \text{Pa}$ |
| （2）活塞移动距离 $l$ | $\dfrac{1}{11}\ \text{m} \approx 9.09\times 10^{-2}\ \text{m}$，方向指向 B 的外侧（竖直时向下） |
