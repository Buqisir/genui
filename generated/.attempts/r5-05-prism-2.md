---
id: r5-05-prism
title: 直角棱镜：全反射与临界出射
subject: physics
topic: 光的折射与全反射
source: 2019 全国卷Ⅲ
question: |
  直角三角形 ABC 为一棱镜的横截面，∠A=90°，∠B=30°。一束光线平行于底边 BC 射到 AB 边上并进入棱镜，然后垂直于 AC 边射出。
  (1) 求棱镜的折射率；
  (2) 保持 AB 边上的入射点不变，逐渐减小入射角，直到 BC 边上恰好有光线射出。求此时 AB 边上入射角的正弦。
answers:
  - { name: i0, value: 60, unit: "°" }
  - { name: r0, value: 30, unit: "°" }
  - { name: j0, value: 60, unit: "°" }
  - { name: n, value: 1.7320508076, unit: "1" }
  - { name: criticalAngle, value: 35.2643896828, unit: "°" }
  - { name: rCritical, value: 5.2643896828, unit: "°" }
  - { name: sinICritical, value: 0.1589186226, unit: "1" }
  - { name: iCritical, value: 9.145, unit: "°" }
---

## 一、题目条件分析

设光线在 $AB$ 上的入射点为 $P$，在 $BC$ 上的反射点为 $Q$，在 $AC$ 上的出射点为 $R$。各入射角、折射角都从相应面的**法线**量起，空气折射率按高中光学约定取 $1$。

题目中的光路包含一次反射：

$$
P\xrightarrow{\text{折射}}Q
\xrightarrow{\text{在 }BC\text{ 上反射}}R
\xrightarrow{\text{垂直 }AC\text{ 射出}}\text{空气}.
$$

因为 $AB\perp AC$，垂直于 $AC$ 的内部光线 $QR$ 必须平行于 $AB$。它是光线在 $BC$ 上反射后的方向，不能把它当作刚进入 $AB$ 时的折射方向。

入射光平行于 $BC$，而 $AB$ 与 $BC$ 的夹角为 $30^\circ$，所以初始入射角为

$$
i_0=90^\circ-30^\circ=\boxed{60^\circ}.
$$

## 二、完整解答

### （1）求棱镜的折射率

由于 $QR\parallel AB$，反射光线与 $BC$ 面的夹角为 $30^\circ$，与该面法线的夹角为 $60^\circ$。

由反射定律，光线在 $BC$ 面上的入射角也是

$$
j_0=\boxed{60^\circ}.
$$

$AB$ 的内法线与 $BC$ 的外法线之间相差 $30^\circ$。由图中的传播方向，在 $AB$ 上的折射角满足

$$
r_0=j_0-30^\circ=\boxed{30^\circ}.
$$

在 $AB$ 面应用折射定律：

$$
\sin i_0=n\sin r_0.
$$

因此

$$
n=\frac{\sin60^\circ}{\sin30^\circ}
=\boxed{\sqrt3\approx1.73205}.
$$

还要检查 $BC$ 面是否能发生全反射。棱镜射向空气的临界角 $C$ 满足

$$
\sin C=\frac1n=\frac1{\sqrt3},
\qquad
C=\boxed{\arcsin\frac1{\sqrt3}\approx35.2644^\circ}.
$$

因为 $j_0=60^\circ>C$，所以初始光线确实在 $BC$ 上发生全反射。反射后垂直入射 $AC$，沿该面法线射出，满足题设全部条件。

### （2）求临界出射时入射角的正弦

保持棱镜和 $P$ 不变，将 $AB$ 上的入射角记为 $i$、折射角记为 $r$，将 $BC$ 上的入射角记为 $j$。

由折射定律和光路几何，

$$
\sin i=n\sin r,\qquad j=30^\circ+r.
$$

逐渐减小 $i$ 时，$r$ 和 $j$ 都逐渐减小。光线从 $BC$ 恰好射出时，该面的折射角达到 $90^\circ$，所以

$$
j=C.
$$

此时 $AB$ 面上的折射角为

$$
r_*=C-30^\circ
=\boxed{\arcsin\frac1{\sqrt3}-30^\circ
\approx5.2644^\circ}.
$$

再在 $AB$ 面应用折射定律：

$$
\sin i_*=\sqrt3\sin(C-30^\circ).
$$

由

$$
\sin C=\frac1{\sqrt3},
\qquad
\cos C=\sqrt{1-\frac13}=\sqrt{\frac23},
$$

得到

$$
\begin{aligned}
\sin i_*
&=\sqrt3\left(\sin C\cos30^\circ-\cos C\sin30^\circ\right)\\
&=\sqrt3\left(
\frac1{\sqrt3}\cdot\frac{\sqrt3}{2}
-\sqrt{\frac23}\cdot\frac12
\right)\\
&=\boxed{\frac{\sqrt3-\sqrt2}{2}\approx0.158919}.
\end{aligned}
$$

> **易错点**：临界角是 $BC$ 面上的入射角 $j$，不是 $AB$ 面上的入射角 $i$，也不是 $AB$ 面上的折射角 $r$。必须先用 $j=30^\circ+r$ 换算，再用折射定律求 $\sin i$。

## 三、交互演示

拖动核心滑块，逐渐减小 $AB$ 面上的入射角。棱镜的折射率始终固定为第一问求出的 $\sqrt3$，其余角度自动计算。

图中以 $AC$ 为长度单位，保持 $AB:AC=\sqrt3:1$。$P$ 取便于观察的固定位置，答案计算不需要棱镜尺寸。各光线的延长长度只用于示意，线宽不表示光强。

<Param name="i" label="AB 面入射角 i" value={60} min={0} max={60} step={0.1} unit="°" />

<Define name="i0" expr="60" />

<Define name="r0" expr="30" />

<Define name="j0" expr="30 + r0" />

<Define name="n" expr="sin(deg(i0)) / sin(deg(r0))" />

<Define name="criticalAngle" expr="asin(1 / n) * 180 / pi" />

<Define name="rCritical" expr="criticalAngle - 30" />

<Define name="sinICritical" expr="n * sin(deg(rCritical))" />

<Define name="iCritical" expr="asin(sinICritical) * 180 / pi" />

<Define name="r" expr="asin(sin(deg(i)) / n) * 180 / pi" />

<Define name="j" expr="30 + r" />

<Define name="sinI" expr="sin(deg(i))" />

<Define name="bcExitAngle" expr="asin(clamp(n * sin(deg(j)), 0, 1)) * 180 / pi" />

<Define name="acIncidence" expr="30 - r" />

<Define name="acExitAngle" expr="asin(n * sin(deg(acIncidence))) * 180 / pi" />

<Preset label="第（1）问答案：n = √3，初始光路" set={{i: 60}} />

<Preset label="第（2）问答案：BC 临界出射" set={{i: "iCritical"}} />

<Preset label="继续减小：i = 0°" set={{i: 0}} />

<Status cases={[
  {when: "abs(j - criticalAngle) < 1e-6", label: "BC 达到临界条件：折射光沿 BC 表面射出", tone: "success"},
  {when: "j > criticalAngle", label: "BC 上发生全反射，没有折射光射出", tone: "info"},
  {label: "BC 上同时发生折射与部分反射", tone: "neutral"}
]} />

<Figure
  title="固定入射点 P：观察 BC 上的全反射与临界出射"
  height={440}
  params={["i", "r", "j", "criticalAngle", "bcExitAngle", "acExitAngle"]}
>
figure({
  draw(ctx, p, v) {
    const root3 = Math.sqrt(3)
    const rad = Math.PI / 180
    const px = 0.4 * root3
    const dx = -Math.sin(p.r * rad)
    const dy = Math.cos(p.r * rad)

    const distancePQ = (root3 - px) / (dx + root3 * dy)
    const qx = px + distancePQ * dx
    const qy = distancePQ * dy

    const reflectedAngle = (210 - p.r) * rad
    const rx = Math.cos(reflectedAngle)
    const ry = Math.sin(reflectedAngle)
    const distanceQR = -qx / rx
    const yR = qy + distanceQR * ry

    const innerWidth = Math.max(v.width - 48, 1)
    const innerHeight = Math.max(v.height - 48, 1)
    const scale = Math.min(innerWidth / 3.4, innerHeight / 2.2)
    const spanX = innerWidth / scale
    const spanY = innerHeight / scale
    const m = v.view({
      xmin: 0.5 - spanX / 2,
      xmax: 0.5 + spanX / 2,
      ymin: 0.35 - spanY / 2,
      ymax: 0.35 + spanY / 2,
      pad: 24,
    })

    v.path(m, [[0, 0], [root3, 0], [0, 1]], {
      close: true,
      color: v.color.text,
      width: 2,
    })
    v.path(m, [[0.065, 0], [0.065, 0.065], [0, 0.065]], {
      color: v.color.muted,
      width: 1,
    })

    v.label(m, -0.08, -0.07, 'A：90°', { color: v.color.text })
    v.label(m, root3 + 0.07, -0.02, 'B：30°', { color: v.color.text })
    v.label(m, -0.06, 1.08, 'C', { color: v.color.text })

    v.line(m, px, -0.38, px, 0.3, {
      color: v.color.muted,
      dash: [6, 4],
      width: 1,
    })
    v.label(m, px + 0.09, 0.3, 'AB 法线', { color: v.color.muted })

    const nx = 0.5
    const ny = root3 / 2
    v.line(m, qx - 0.27 * nx, qy - 0.27 * ny,
      qx + 0.27 * nx, qy + 0.27 * ny, {
        color: v.color.muted,
        dash: [6, 4],
        width: 1,
      })
    v.label(m, qx + 0.28 * nx, qy + 0.28 * ny,
      'BC 法线', { color: v.color.muted })

    const incomingLength = 0.75
    v.arrow(m,
      px + incomingLength * Math.sin(p.i * rad),
      -incomingLength * Math.cos(p.i * rad),
      px, 0, {
        color: v.color.blue,
        width: 2.5,
      })
    v.arrow(m, px, 0, qx, qy, {
      color: v.color.blue,
      width: 2.5,
    })

    const critical = Math.abs(p.j - p.criticalAngle) < 1e-6
    const hasTransmission = p.j <= p.criticalAngle + 1e-6
    const reflectionColor = hasTransmission ? v.color.orange : v.color.red

    v.arrow(m, qx, qy, 0, yR, {
      color: reflectionColor,
      width: 2.5,
    })

    const acLength = 0.65
    v.arrow(m, 0, yR,
      -acLength * Math.cos(p.acExitAngle * rad),
      yR - acLength * Math.sin(p.acExitAngle * rad), {
        color: reflectionColor,
        width: 2.5,
      })

    v.circle(m, px, 0, 0.012, { fill: v.color.blue })
    v.circle(m, qx, qy, 0.012, { fill: reflectionColor })
    v.circle(m, 0, yR, 0.012, { fill: reflectionColor })

    v.label(m, px - 0.07, -0.065, 'P（固定）', { color: v.color.text })
    v.label(m, qx + 0.07, qy + 0.03, 'Q', { color: v.color.text })
    v.label(m, -0.07, yR + 0.07, 'R', { color: v.color.text })

    const arc = (x, y, radius, start, end, color) => {
      const points = []
      for (let k = 0; k <= 20; k++) {
        const angle = (start + (end - start) * k / 20) * rad
        points.push([
          x + radius * Math.cos(angle),
          y + radius * Math.sin(angle),
        ])
      }
      v.path(m, points, { color, width: 1.5 })
    }

    if (p.i > 0.01) {
      arc(px, 0, 0.16, 270, 270 + p.i, v.color.blue)
    }
    if (p.r > 0.01) {
      arc(px, 0, 0.14, 90, 90 + p.r, v.color.blue)
    }
    arc(qx, qy, 0.14, 240, 270 + p.r, v.color.blue)

    v.label(m, px + 0.2, -0.15,
      'i = ' + p.i.toFixed(2) + '°', { color: v.color.blue })
    v.label(m, px - 0.17, 0.2,
      'r = ' + p.r.toFixed(2) + '°', { color: v.color.blue })
    v.label(m, qx + 0.13, qy - 0.14,
      'j = ' + p.j.toFixed(2) + '°', { color: v.color.blue })

    if (hasTransmission) {
      const exitAngle = (60 + p.bcExitAngle) * rad
      const length = 0.9
      v.arrow(m, qx, qy,
        qx + length * Math.cos(exitAngle),
        qy + length * Math.sin(exitAngle), {
          color: v.color.green,
          width: 3,
        })
      v.label(m, qx + length * Math.cos(exitAngle),
        qy + length * Math.sin(exitAngle),
        critical ? '临界出射：沿 BC' : '从 BC 折射出射', {
          color: v.color.green,
        })
      v.label(m, (qx + 0) / 2, (qy + yR) / 2,
        '部分反射', { color: v.color.orange })
    } else {
      v.label(m, qx + 0.2, qy + 0.12,
        'BC 全反射', { color: v.color.red })
    }

    if (Math.abs(p.i - 60) < 1e-6) {
      v.label(m, 1.25, -0.28, '入射光 ∥ BC', {
        color: v.color.blue,
      })
      v.label(m, -0.42, yR + 0.12, '垂直 AC 射出', {
        color: v.color.red,
      })
    }
  },
})
</Figure>

<Readout items={[
  {label: "棱镜折射率 n", expr: "n", digits: 6},
  {label: "AB 面入射角 i", expr: "i", unit: "°", digits: 3},
  {label: "AB 面折射角 r", expr: "r", unit: "°", digits: 3},
  {label: "BC 面入射角 j", expr: "j", unit: "°", digits: 3},
  {label: "临界角 C", expr: "criticalAngle", unit: "°", digits: 3},
  {label: "当前 sin i", expr: "sinI", digits: 6},
  {label: "临界出射所需 sin i", expr: "sinICritical", digits: 6}
]} />

<Plot
  title="减小 AB 入射角：BC 入射角何时降到临界角？"
  x={{name: "i", label: "AB 入射角 i", unit: "°", min: 0, max: 60}}
  y={{label: "角度", unit: "°", min: 25, max: 65}}
  series={[
    {label: "BC 入射角 j", expr: "30 + asin(sin(deg(i)) / n) * 180 / pi", color: "blue"},
    {label: "临界角 C", expr: "criticalAngle", color: "green"}
  ]}
  marks={[
    {x: "iCritical", series: 0, label: "j = C，临界出射"},
    {x: 60, series: 0, label: "初始光路：j = 60°"}
  ]}
  cursor="i"
/>

## 四、结合图像理解关键状态

本题改变的是入射方向，用滑块观察静态光路即可。按题目的变化顺序，应从曲线图的右端向左看。

1. **初始状态：$i=60^\circ$。**  
   $AB$ 面折射角为 $30^\circ$，$BC$ 面入射角为 $60^\circ$。蓝色曲线高于绿色临界角线，光线在 $BC$ 全反射，随后垂直于 $AC$ 射出。

2. **逐渐减小 $i$，但仍有 $j>C$。**  
   $r$ 随之减小，$j=30^\circ+r$ 也减小。$BC$ 上仍发生全反射，但反射光从 $AC$ 射出时一般已不垂直于该面。“垂直于 $AC$ 射出”是第一问初始光路的条件。

3. **两条曲线相交：$j=C$。**  
   此时 $BC$ 面折射角为 $90^\circ$，绿色出射光沿 $BC$ 表面传播。对应
   $r=C-30^\circ$，进而得到所求
   $\sin i=(\sqrt3-\sqrt2)/2$。点击第二问答案按钮即可准确跳到交点。

4. **继续减小到 $j<C$。**  
   绿色折射光离开 $BC$ 表面，棱镜内同时存在部分反射光。此时已经越过题目要求的“恰好有光线射出”的临界状态。

图像交点对应的是 **$BC$ 面达到临界角**；交点的横坐标则是 **$AB$ 面上所需的入射角**。两者属于不同界面。

## 五、答案汇总

| 小问 | 答案 | 关键依据 |
|---|---|---|
| （1）棱镜的折射率 | $\boxed{n=\sqrt3}$ | 在 $BC$ 全反射后垂直于 $AC$ 射出，得到 $r_0=30^\circ$ |
| （2）此时 $AB$ 面入射角的正弦 | $\boxed{\sin i_*=\dfrac{\sqrt3-\sqrt2}{2}}$ | $BC$ 临界出射时 $j=C$，故 $r_*=C-30^\circ$ |
