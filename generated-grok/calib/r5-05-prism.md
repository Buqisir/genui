---
id: r5-05-prism
title: 直角棱镜的折射率与临界入射角
subject: physics
topic: 光的折射与全反射
source: 2019 全国卷Ⅲ
theme: night
question: |
  直角三角形 ABC 为一棱镜的横截面，∠A=90°，∠B=30°。一束光线平行于底边 BC 射到 AB 边上并进入棱镜，然后垂直于 AC 边射出。
  (1) 求棱镜的折射率；
  (2) 保持 AB 边上的入射点不变，逐渐减小入射角，直到 BC 边上恰好有光线射出。求此时 AB 边上入射角的正弦。
answers:
  - { name: n, value: 1.732050807568877, unit: "" }
  - { name: sinI, value: 0.158918622597891, unit: "" }
---

## 一、题目条件分析

- 横截面是直角三角形：$\angle A=90^\circ$，$\angle B=30^\circ$，所以 $\angle C=60^\circ$。底边 $BC$ 是斜边，$AB\perp AC$。
- 空气折射率取 $1$。入射光线平行于 $BC$，从 $AB$ 进入棱镜。
- 这条光线不能是「$AB$ 折射后直接垂直于 $AC$ 射出」。垂直于 $AC$ 射出时，棱镜里的光线必须沿着 $AC$ 的法线；而 $\angle A=90^\circ$ 使 $AC$ 的法线平行于 $AB$，光线会贴着 $AB$ 走，到不了 $AC$ 内部，折射角也会是 $90^\circ$，与折射定律矛盾。
- 所以光路是：$AB$ 折射进入 $\to$ 打到 $BC$ 并反射 $\to$ 再垂直于 $AC$ 射出。第 (2) 问说把入射角减小到「$BC$ 上恰好有光线射出」，说明原来打在 $BC$ 上时没有光出来，即全反射。算出折射率后要回头核对入射角确实大于临界角。
- 题目没给棱镜大小，也没给入射点的位置。下面画图时取 $AC=1$、$AB=\sqrt{3}$、$AD=1$（$D$ 为入射点）。两个答案都只由角度决定，与这些长度无关；这样取 $D$，滑块全程折射光线都落在 $BC$ 上。

## 二、完整解答

### （1）折射率

入射光线平行于 $BC$，$BC$ 与 $AB$ 的夹角就是 $\angle B=30^\circ$，所以入射光线与 $AB$ 的夹角也是 $30^\circ$。入射角从法线量起：

$$
i=90^\circ-30^\circ=\boxed{60^\circ}
$$

设 $AB$ 上的折射角为 $r$，$BC$ 上的入射角为 $\alpha$。反射后的光线 $EF$ 垂直于 $AC$ 射出，因此 $EF$ 沿着 $AC$ 的法线，$EF\perp AC$。又 $AB\perp AC$，故

$$
EF\parallel AB
$$

$EF$ 与 $BC$ 的夹角等于 $AB$ 与 $BC$ 的夹角 $30^\circ$，于是 $EF$ 与 $BC$ 法线的夹角为 $60^\circ$。反射角等于入射角：

$$
\alpha=\boxed{60^\circ}
$$

$AB$、$BC$ 两条法线的夹角等于这两面的夹角 $30^\circ$。折射光线偏在 $AB$ 法线靠 $A$ 的一侧，与 $AB$ 法线成 $r$；$BC$ 法线偏在 $AB$ 法线靠 $B$ 的一侧，与 $AB$ 法线成 $30^\circ$。从折射光线转到 $BC$ 法线，先转回 $AB$ 法线（$r$），再转到 $BC$ 法线（$30^\circ$）：

$$
\alpha=r+30^\circ
$$

代入 $\alpha=60^\circ$：

$$
r=30^\circ=\boxed{30^\circ}
$$

折射定律：

$$
n=\frac{\sin i}{\sin r}=\frac{\sin 60^\circ}{\sin 30^\circ}=\frac{\sqrt{3}/2}{1/2}=\boxed{\sqrt{3}}
$$

核对全反射。临界角 $C$ 满足

$$
\sin C=\frac{1}{n}=\frac{\sqrt{3}}{3},\qquad C=\arcsin\frac{\sqrt{3}}{3}\approx 35.26^\circ
$$

$\alpha=60^\circ>C$，确实全反射，没有光从 $BC$ 射出，与第 (1) 问的光路一致。

### （2）恰好射出时 $\sin i$

入射点不动，只减小 $AB$ 上的入射角。$n$ 不变，几何关系 $\alpha=r+30^\circ$ 仍成立，所以 $r$ 减小，$\alpha$ 也减小。

$\alpha>C$ 时 $BC$ 上继续全反射；$\alpha$ 降到等于 $C$ 时，折射角为 $90^\circ$，光线恰好贴着 $BC$ 射出。

$$
\alpha=C,\qquad r=C-30^\circ
$$

$$
\cos C=\sqrt{1-\sin^2 C}=\sqrt{1-\frac13}=\sqrt{\frac23}=\frac{\sqrt{6}}{3}
$$

$$
\sin r=\sin(C-30^\circ)=\sin C\cos 30^\circ-\cos C\sin 30^\circ
$$

$$
=\frac{\sqrt{3}}{3}\cdot\frac{\sqrt{3}}{2}-\frac{\sqrt{6}}{3}\cdot\frac{1}{2}=\frac12-\frac{\sqrt{6}}{6}=\frac{3-\sqrt{6}}{6}
$$

$$
\sin i=n\sin r=\sqrt{3}\cdot\frac{3-\sqrt{6}}{6}=\frac{3\sqrt{3}-\sqrt{18}}{6}=\frac{3\sqrt{3}-3\sqrt{2}}{6}=\boxed{\dfrac{\sqrt{3}-\sqrt{2}}{2}}
$$

数值约为 $0.159$，对应入射角约 $9.14^\circ$。题目求的是正弦，不是这个角度。

> **易错：** 把「平行于 $BC$」当成入射角 $30^\circ$。$30^\circ$ 是光线和界面的夹角，入射角是和法线的夹角，应为 $60^\circ$。另一处是第 (2) 问仍用 $60^\circ$ 去除以 $n$：入射角减小后，$r$ 和 $\alpha$ 都变了，要重新用 $\alpha=C$ 求。

## 三、交互演示

入射点 $D$ 固定。拖动入射角，或点预设跳到两问的状态。$i=60^\circ$ 是题目里「平行于 $BC$」的位置，滑块离开它以后可以点轨道上的标记回到这个值。

<Param name="i" label="AB 上的入射角 i" symbol="i" color="charge" value={60} min={0} max={75} step={0.1} digits={2} unit="°" />

<Define name="angB" expr="30" />

<Define name="AC" expr="1" />

<Define name="AB" expr="AC/tan(deg(angB))" />

<Define name="xD" expr="1" />

<Define name="iPar" expr="90 - angB" />

<Define name="rPerp" expr="90 - 2*angB" />

<Define name="n" expr="sin(deg(iPar))/sin(deg(rPerp))" />

<Define name="sinC" expr="1/n" />

<Define name="crit" expr="asin(sinC)*180/pi" />

<Define name="rCrit" expr="crit - angB" />

<Define name="sinI" expr="n*sin(deg(rCrit))" />

<Define name="iCrit" expr="asin(sinI)*180/pi" />

<Define name="r" expr="asin(clamp(sin(deg(i))/n, -1, 1))*180/pi" />

<Define name="alpha" expr="r + angB" />

<Question text="求棱镜的折射率。" set={{i: "iPar"}} hint="平行于 BC 得到入射角，垂直 AC 射出得到折射角" />

<Question text="BC 上恰好有光线射出时，AB 上入射角的正弦是多少？" set={{i: "iCrit"}} hint="恰好射出就是 BC 上的入射角等于临界角" />

<Preset label="第(1)问：平行于 BC" set={{i: "iPar"}} />

<Preset label="第(2)问：BC 恰好射出" set={{i: "iCrit"}} />

<Preset label="再减小：BC 有折射光" set={{i: 4}} />

<Status cases={[
  {when: "abs(i - iPar) < 0.15", label: "平行于 BC：BC 全反射，垂直 AC 射出", tone: "success"},
  {when: "abs(alpha - crit) < 0.08", label: "临界：光线恰好沿 BC 射出", tone: "warning"},
  {when: "alpha > crit", label: "BC 上全反射，没有光线射出", tone: "info"},
  {label: "光线从 BC 折射射出", tone: "neutral"}
]} />

<Readout items={[
  {label: "折射率", symbol: "n", expr: "n", color: "charge", digits: 3},
  {label: "AB 上折射角", symbol: "r", expr: "r", color: "charge", unit: "°", digits: 2},
  {label: "BC 上入射角", symbol: "α", expr: "alpha", color: "charge", unit: "°", digits: 2},
  {label: "临界角", symbol: "C", expr: "crit", color: "graphite", unit: "°", digits: 2},
  {label: "当前 sin i", symbol: "sin i", expr: "sin(deg(i))", color: "charge", digits: 3},
  {label: "恰好射出时 sin i", symbol: "sin i", expr: "sinI", color: "charge", digits: 3}
]} />

<Answer items={[
  {label: "折射率", symbol: "n", expr: "n", value: 1.732050807568877, digits: 3},
  {label: "恰好射出时入射角的正弦", symbol: "sin i", expr: "sinI", value: 0.158918622597891, digits: 3}
]} />

<Figure title="棱镜横截面上的光路" height={440} params={["i", "n", "angB", "xD", "AC", "AB", "crit", "iPar", "r", "alpha"]}>
figure({
  draw(ctx, p, v) {
    const deg = Math.PI / 180
    const H = p.AC
    const L = p.AB
    const xD = p.xD
    const i = p.i
    const r = p.r
    const alpha = p.alpha
    const n = p.n
    const crit = p.crit
    const N = 90 - p.angB
    const dir = (ang) => [Math.cos(ang * deg), Math.sin(ang * deg)]

    const m = v.view({
      xmin: -1.25,
      xmax: L + 1.2,
      ymin: -1.35,
      ymax: H + 0.95,
      equal: true,
      pad: 18,
    })

    v.path(m, [[0, 0], [L, 0], [0, H]], {
      close: true,
      fill: v.color.enamel,
      color: v.color.ink,
      width: 2,
    })
    const mk = 0.11
    v.path(m, [[mk, 0], [mk, mk], [0, mk]], { color: v.color.ink, width: 1.2 })

    v.text(m, -0.08, -0.1, 'A', { align: 'right', color: v.color.ink, size: 15 })
    v.text(m, L + 0.08, -0.1, 'B', { align: 'left', color: v.color.ink, size: 15 })
    v.text(m, -0.08, H + 0.04, 'C', { align: 'right', color: v.color.ink, size: 15 })
    v.text(m, 0.26, 0.16, '90°', { color: v.color.graphite, size: 12 })
    v.text(m, L - 0.5, 0.14, '30°', { color: v.color.graphite, size: 12 })
    v.text(m, 0.16, H - 0.3, '60°', { color: v.color.graphite, size: 12 })

    v.line(m, xD, -0.46, xD, 0.4, { color: v.color.steel, dash: [4, 3], width: 1 })

    if (Math.abs(i - p.iPar) > 1) {
      const g = dir(90 + p.iPar)
      v.line(m, xD - g[0] * 0.85, -g[1] * 0.85, xD, 0, {
        color: v.color.graphite,
        dash: [6, 4],
        width: 1.2,
      })
      v.label(m, xD - g[0] * 0.62, -g[1] * 0.62 - 0.14, '平行于 BC', {
        color: v.color.graphite,
        size: 11,
      })
    }

    const idir = dir(90 + i)
    v.ray(m, [[xD - idir[0] * 0.85, -idir[1] * 0.85], [xD, 0]])
    if (i > 1.5) {
      v.ellipse(m, xD, 0, 0.3, 0.3, { color: v.color.charge, from: -90, to: -90 + i })
    }

    const rd = dir(90 + r)
    const denom = rd[0] / L + rd[1] / H
    const tE = (1 - xD / L) / denom
    const Ex = xD + tE * rd[0]
    const Ey = tE * rd[1]
    if (!(tE > 0)) return

    v.ray(m, [[xD, 0], [Ex, Ey]])
    if (r > 1.5) {
      v.ellipse(m, xD, 0, 0.18, 0.18, { color: v.color.charge, from: 90, to: 90 + r })
    }

    const nd = dir(N)
    v.line(m, Ex - nd[0] * 0.34, Ey - nd[1] * 0.34, Ex + nd[0] * 0.42, Ey + nd[1] * 0.42, {
      color: v.color.steel,
      dash: [4, 3],
      width: 1,
    })

    v.circle(m, xD, 0, 0.04, { fill: v.color.charge, color: v.color.charge })
    v.circle(m, Ex, Ey, 0.04, { fill: v.color.charge, color: v.color.charge })
    v.text(m, xD - 0.1, -0.14, 'D', { align: 'center', color: v.color.ink, size: 13 })
    v.text(m, Ex - 0.08, Ey - 0.1, 'E', { align: 'right', color: v.color.ink, size: 13 })

    v.label(m, xD - idir[0] * 0.48 + 0.02, -idir[1] * 0.48 - 0.1, 'i = ' + i.toFixed(1) + '°', {
      color: v.color.charge,
      size: 12,
    })
    v.label(m, (xD + Ex) / 2 - 0.16, Ey / 2, 'r = ' + r.toFixed(1) + '°', {
      color: v.color.charge,
      size: 12,
    })
    v.label(m, Ex + 0.18, Ey + 0.12, 'α = ' + alpha.toFixed(1) + '°', {
      color: v.color.charge,
      size: 12,
    })

    if (Math.abs(alpha - crit) <= 0.08) {
      const gd = dir(N + 90)
      const distC = Math.hypot(Ex, Ey - H)
      const len = distC + 0.55
      const ox = nd[0] * 0.02
      const oy = nd[1] * 0.02
      v.ray(m, [
        [Ex + ox, Ey + oy],
        [Ex + ox + gd[0] * len, Ey + oy + gd[1] * len],
      ])
      v.label(m, Ex + ox + gd[0] * len, Ey + oy + gd[1] * len, '恰好沿 BC 射出', {
        color: v.color.charge,
        size: 12,
      })
    } else if (alpha > crit) {
      // 反射线：出射法线角为 N，入射光线在 N+α，反射后沿 N-α 的反方向
      const delta = N - alpha + 180
      const dd = dir(delta)
      let hit = null
      let bestT = 1e9
      if (dd[1] < -1e-8) {
        const t = (0 - Ey) / dd[1]
        const x = Ex + t * dd[0]
        if (t > 1e-4 && x >= -1e-3 && x <= L + 1e-3 && t < bestT) {
          bestT = t
          hit = { x: x, y: 0, face: 'AB' }
        }
      }
      if (dd[0] < -1e-8) {
        const t = (0 - Ex) / dd[0]
        const y = Ey + t * dd[1]
        if (t > 1e-4 && y >= -1e-3 && y <= H + 1e-3 && t < bestT) {
          hit = { x: 0, y: y, face: 'AC' }
        }
      }
      v.label(m, Ex + nd[0] * 0.48, Ey + nd[1] * 0.08, '全反射', {
        color: v.color.charge,
        size: 12,
      })
      if (hit) {
        v.ray(m, [[Ex, Ey], [hit.x, hit.y]])
        if (hit.face === 'AC') {
          const iAC = Math.abs(delta - 180)
          const sOut = n * Math.sin(iAC * deg)
          v.circle(m, hit.x, hit.y, 0.04, { fill: v.color.charge, color: v.color.charge })
          v.text(m, hit.x - 0.08, hit.y + 0.06, 'F', { align: 'right', color: v.color.ink, size: 13 })
          if (sOut < 1) {
            const beta = Math.asin(sOut) / deg
            const side = delta >= 180 ? 1 : -1
            const od = dir(180 + side * beta)
            v.ray(m, [[hit.x, hit.y], [hit.x + od[0] * 0.72, hit.y + od[1] * 0.72]])
            v.label(m, hit.x - 0.42, hit.y + (side > 0 ? -0.18 : 0.2), iAC < 0.4 ? '垂直 AC 射出' : '从 AC 射出', {
              color: v.color.charge,
              size: 12,
            })
          }
        } else {
          v.label(m, hit.x, -0.28, '反射至 AB', { color: v.color.graphite, size: 12 })
        }
      }
    } else {
      const sinBeta = n * Math.sin(alpha * deg)
      const beta = Math.asin(Math.min(1, sinBeta)) / deg
      const od = dir(N + beta)
      v.ray(m, [[Ex, Ey], [Ex + od[0] * 0.82, Ey + od[1] * 0.82]])
      v.label(m, Ex + od[0] * 0.82, Ey + od[1] * 0.82, '折射射出', {
        color: v.color.charge,
        size: 12,
      })
    }
  },
})
</Figure>

<Plot
  title="BC 上的入射角随 AB 入射角变化"
  caption="曲线高于临界角时 BC 全反射；交点是恰好射出。第(1)问在右段 60° 处。"
  x={{name: "s", label: "i", unit: "°", min: 0, max: 75}}
  y={{label: "角度", unit: "°", min: 20, max: 75}}
  series={[
    {label: "α", expr: "asin(clamp(sin(deg(s))/n, -1, 1))*180/pi + angB", color: "charge"},
    {label: "临界角 C", expr: "crit", color: "graphite", dash: true}
  ]}
  marks={[
    {x: "iPar", series: 0, label: "垂直 AC 射出"},
    {x: "iCrit", series: 0, label: "BC 恰好射出"}
  ]}
  cursor="i"
/>

光路图里的短虚线是法线。入射角离开 $60^\circ$ 时，灰色虚线是「平行于 $BC$」的方向，用来对照光线转过了多少。棱镜按真实角度画出；棱镜外面的线段只表示方向，不表示传播距离。

## 四、结合图像看两个状态

$\alpha=r+30^\circ$，而 $r=\arcsin(\sin i/n)$，所以 $\alpha$ 随 $i$ 单调上升，但不是直线。水平虚线是临界角 $C\approx 35.26^\circ$。

- 交点右侧：$\alpha>C$，$BC$ 全反射，没有光从 $BC$ 射出。第 (1) 问的 $i=60^\circ$ 在这一侧，此时 $r=30^\circ$、$\alpha=60^\circ$。反射光线正好平行于 $AB$，于是垂直于 $AC$ 射出，读数里 $n=\sqrt{3}$。
- 交点：$i\approx 9.14^\circ$，$\alpha=C$，光线恰好沿 $BC$ 射出。这时「当前 $\sin i$」和「恰好射出时 $\sin i$」都是 $(\sqrt{3}-\sqrt{2})/2\approx 0.159$。
- 交点左侧：$\alpha<C$，光从玻璃射向空气时远离法线，从 $BC$ 折射出去。

从 $60^\circ$ 稍微减小一点，全反射还在，但反射光线不再水平，会改道打到 $AB$，不再垂直于 $AC$。只有 $i=60^\circ$ 同时满足「平行于 $BC$ 入射」和「垂直于 $AC$ 射出」，所以这一问能把 $r$ 和 $n$ 都定死。第 (2) 问不再要求垂直于 $AC$，只要求 $BC$ 上的入射角降到临界角。

## 五、答案汇总

| 小问 | 答案 |
|---|---|
| （1）折射率 $n$ | $\sqrt{3}\approx 1.732$ |
| （2）恰好射出时 $\sin i$ | $\dfrac{\sqrt{3}-\sqrt{2}}{2}\approx 0.159$（约 $9.14^\circ$） |
