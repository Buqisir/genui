---
id: gd24-06
title: 红绿光射入介质后的全反射
subject: physics
topic: 光的折射与全反射
source: 2024 广东卷 第 6 题（单选，4 分）
choice: B
answers: []
question: |
  如图所示，红绿两束单色光，同时从空气中沿同一路径以 θ 角从 MN 面射入某长方体透明均匀介质。折射光束在 NP 面发生全反射。反射光射向 PQ 面。若 θ 逐渐增大。两束光在 NP 面上的全反射现象会先后消失。已知在该介质中红光的折射率小于绿光的折射率。下列说法正确的是（　　）

  【图】一个长方形透明块。左下角标 M，左上角标 N，右上角标 P，右下角标 Q，所以左边为 MN、上边为 NP、右边为 PQ。一条光线从左下方射向 MN 边中部偏下；过入射点有一条水平虚线，入射光线与这条虚线的夹角标 θ。进入介质后分成两条折射光线，分别射到 NP 边上的两处，各自反射后斜向右下方，射向 PQ 边。

  A. 在 PQ 面上，红光比绿光更靠近 P 点

  B. θ 逐渐增大时，红光的全反射现象先消失

  C. θ 逐渐增大时，入射光可能在 MN 面发生全反射

  D. θ 逐渐减小时，两束光在 MN 面折射的折射角逐渐增大
---

## 一、题目条件分析

长方体四个顶点按题目摆放：M 在左下，N 在左上，P 在右上，Q 在右下。MN 是左侧竖直面，NP 是上表面，PQ 是右侧竖直面。

两束单色光在空气中走同一条直线，从左下方射向 MN。过入射点的水平虚线垂直于 MN，就是入射法线。θ 是这条法线与入射光线的夹角，即入射角。

光从空气进入介质，折射后斜向右上，打到 NP 并发生全反射，反射光再斜向右下，射向 PQ。题目还说明：θ 逐渐增大时，两束光在 NP 上的全反射会一先一后消失；介质对红光的折射率小于对绿光的折射率。

题目没有给出 θ 和折射率的数字。下面的判断只用来比较红光和绿光，演示里取一组符合题意的代表值，便于把光路画出来：

- $n_\text{红}=1.20$，$n_\text{绿}=1.40$。两者都大于 1，且红光更小。
- 两者都小于 $\sqrt{2}\approx 1.41$。若 $n\ge\sqrt{2}$，则 $\sqrt{n^2-1}\ge 1$，任何入射角都还能在 NP 上全反射，就不会出现题目说的“先后消失”。
- 初始 $\theta=36^\circ$。这时两束光都在 NP 上全反射，反射光都打到 PQ。

光路图里长方体宽 $11$、高 $8$，入射点在底边上方 $3.4$、距 NP 为 $h=4.6$。这些长度只是示意，用来把落点拉开；角度按折射定律和反射定律计算。

## 二、完整解答

空气折射率取 1。在 MN 面

$$\sin\theta=n\sin r$$

$r$ 是折射角，也是介质中光线与水平法线的夹角。$n$ 越大，$r$ 越小，所以同一 θ 下

$$r_\text{红}>r_\text{绿}$$

红光偏折更少，在介质里抬得更陡。

NP 是水平面，法线竖直。介质中的光线与水平方向成 $r$，与竖直线的夹角就是 NP 上的入射角

$$i=90^\circ-r$$

因此 $i_\text{红}<i_\text{绿}$。

从介质射向空气时，临界角 $C=\arcsin(1/n)$。$n$ 越小，$C$ 越大，所以 $C_\text{红}>C_\text{绿}$。

全反射要求 $i\ge C$，即 $r\le 90^\circ-C$。这两边都在 $0^\circ$ 到 $90^\circ$ 之间，正弦函数递增：

$$\sin r\le\cos C=\sqrt{1-\frac{1}{n^2}}=\frac{\sqrt{n^2-1}}{n}$$

代入 $\sin r=\sin\theta/n$，得到全反射还能维持的条件

$$\sin\theta\le\sqrt{n^2-1}$$

θ 再增大，使 $\sin\theta$ 超过 $\sqrt{n^2-1}$，NP 上的全反射就消失。

### A

**错误。** PQ 上更靠近 P 的是绿光。

设入射点到 NP 的竖直距离为 $h$，左右宽度为 $L$。折射光线与水平方向成 $r$，打到 NP 时走过的水平距离是 $h/\tan r$。因为 $r_\text{红}>r_\text{绿}$，红光更早碰到 NP，落点更靠近 N；绿光沿 NP 走得更远，更靠近 P。

水平面反射后，反射光线与水平方向仍成角 $r$，向右下方前进。再走完剩下的水平距离 $L-h/\tan r$，下降的高度就是落点到 P 的距离

$$s=L\tan r-h$$

$$s_\text{红}-s_\text{绿}=L(\tan r_\text{红}-\tan r_\text{绿})>0$$

红光落点离 P 更远。选项说红光更靠近 P，和这个几何关系相反。

代表值 $\theta=36^\circ$、$n_\text{红}=1.20$、$n_\text{绿}=1.40$、$L=11$、$h=4.6$：

$$\sin 36^\circ\approx 0.588,\quad r_\text{红}=\arcsin\frac{0.588}{1.20}\approx 29.33^\circ,\quad r_\text{绿}=\arcsin\frac{0.588}{1.40}\approx 24.83^\circ$$

$$s_\text{红}\approx 1.58,\qquad s_\text{绿}\approx 0.49$$

绿光几乎贴着 P，红光明显更低。

### B

**正确。** θ 增大时，红光的全反射先消失。

$\sqrt{n^2-1}$ 随 $n$ 增大而增大。$n_\text{红}<n_\text{绿}$ 时

$$\sqrt{n_\text{红}^2-1}<\sqrt{n_\text{绿}^2-1}$$

红光允许的 θ 更小。θ 从两束光都能全反射的值往上加，先越过红光的限度。

两个因素叠在一起：θ 增大使 $r$ 增大，$i=90^\circ-r$ 减小；红光的 $i$ 本来就比绿光小，临界角又比绿光大，所以红光先出现 $i<C$。

代表值下，红光在

$$\theta_1=\arcsin\sqrt{1.20^2-1}=\arcsin\sqrt{0.44}\approx 41.6^\circ$$

失去全反射；绿光要到

$$\theta_2=\arcsin\sqrt{1.40^2-1}=\arcsin\sqrt{0.96}\approx 78.5^\circ$$

才失去。先后顺序就是红光在前。

### C

**错误。** θ 无论多大，入射光都不能在 MN 面发生全反射。

全反射的前提是光从光密介质射向光疏介质。MN 面上，光从空气射入介质，方向相反。只要 $\theta<90^\circ$，就有

$$\sin r=\frac{\sin\theta}{n}\le\frac{1}{n}<1$$

折射角始终有解，总有光进入介质。θ 靠近 $90^\circ$ 时，折射角只是靠近 $\arcsin(1/n)$，仍然不是全反射。

### D

**错误。** θ 减小时，两束光在 MN 面的折射角都减小。

$\sin r=\sin\theta/n$，而 $r$ 和 θ 都在 $0^\circ$ 到 $90^\circ$。θ 减小，$\sin\theta$ 减小，$\sin r$ 减小，$r$ 跟着减小。选项说折射角逐渐增大，和折射定律相反。

$$\boxed{B}$$

## 三、交互演示

右侧四个小题分别对应 A、B、C、D，点进去会把 θ 调到能看出该项对错的位置。折射率滑块限制在 $n_\text{红}<n_\text{绿}$，并且都落在能使全反射先后消失的范围内。长度是示意的，角度不是。

<Question text="在 PQ 面上，红光比绿光更靠近 P 点" set={{theta: 36}} hint="两光都还在全反射。看 PQ 上两个落点谁离 P 更近。" />

<Question text="θ 逐渐增大时，红光的全反射现象先消失" set={{theta: "(thetaCR + thetaCG) / 2"}} hint="这个 θ 落在两束光失去全反射的角度之间。看谁已经从 NP 射出。" />

<Question text="θ 逐渐增大时，入射光可能在 MN 面发生全反射" set={{theta: 82}} hint="θ 已经很大。看 MN 面上是不是仍然有光进入介质。" />

<Question text="θ 逐渐减小时，两束光在 MN 面折射的折射角逐渐增大" set={{theta: 24}} hint="对照 r–θ 图：曲线向右升高，所以 θ 变小则 r 变小。" />

<Param name="theta" label="入射角 θ" symbol="θ" value={36} min={22} max={85} step={0.5} unit="°" digits={1} color="charge" />

<Param name="nR" label="红光折射率" symbol="n_红" value={1.2} min={1.18} max={1.28} step={0.01} digits={2} color="red" />

<Param name="nG" label="绿光折射率" symbol="n_绿" value={1.4} min={1.35} max={1.41} step={0.01} digits={2} color="green" />

<Define name="rR" expr="asin(sin(deg(theta)) / nR) * 180 / pi" />

<Define name="rG" expr="asin(sin(deg(theta)) / nG) * 180 / pi" />

<Define name="CR" expr="asin(1 / nR) * 180 / pi" />

<Define name="CG" expr="asin(1 / nG) * 180 / pi" />

<Define name="iR" expr="90 - rR" />

<Define name="iG" expr="90 - rG" />

<Define name="thetaCR" expr="asin(min(sqrt(nR * nR - 1), 0.9999)) * 180 / pi" />

<Define name="thetaCG" expr="asin(min(sqrt(nG * nG - 1), 0.9999)) * 180 / pi" />

<Define name="W" expr="11" />

<Define name="H" expr="8" />

<Define name="h" expr="4.6" />

<Define name="y0" expr="H - h" />

<Define name="xR" expr="h / tan(deg(rR))" />

<Define name="xG" expr="h / tan(deg(rG))" />

<Define name="sR" expr="W * tan(deg(rR)) - h" />

<Define name="sG" expr="W * tan(deg(rG)) - h" />

<Define name="tirR" expr="(xR < W and iR >= CR) ? 1 : 0" />

<Define name="tirG" expr="(xG < W and iG >= CG) ? 1 : 0" />

<Preset label="代表值：都全反射" set={{theta: 36, nR: 1.2, nG: 1.4}} />

<Preset label="红光先消失" set={{theta: "(thetaCR + thetaCG) / 2"}} />

<Preset label="θ 很大，MN 仍折射" set={{theta: 82}} />

<Preset label="较小的 θ" set={{theta: 24}} />

<Status cases={[
  {when: "xR >= W or xG >= W", label: "θ 较小，有光线更平，先打到侧面，还没射到 NP", tone: "info"},
  {when: "tirR > 0.5 and tirG > 0.5 and (sR >= H or sG >= H)", label: "两光都在 NP 全反射，反射光打到了底边", tone: "warning"},
  {when: "tirR > 0.5 and tirG > 0.5", label: "两束光都在 NP 面全反射", tone: "success"},
  {when: "tirR < 0.5 and tirG > 0.5", label: "红光全反射已消失，绿光仍全反射", tone: "info"},
  {when: "tirG < 0.5 and tirR > 0.5", label: "绿光全反射已消失，红光仍全反射", tone: "warning"},
  {label: "两束光都已不在 NP 全反射，光从 MN 进入后再从 NP 射出", tone: "neutral"}
]} />

空气里红、绿是同一条光线，画成一条。进入介质后按各自的折射率分开。NP 上仍满足全反射时，反射光走到 PQ，旁边的尺寸是落点到 P 的示意距离；一旦入射角小于临界角，这条光改从 NP 射向空气。

<Figure title="长方体介质中的红光与绿光" height={520} params={["W", "H", "y0", "theta", "nR", "nG", "rR", "rG", "xR", "xG", "sR", "sG", "tirR", "tirG"]}>
figure({
  draw(ctx, p, v) {
    const W = p.W
    const H = p.H
    const y0 = p.y0
    const m = v.view({ xmin: -5.2, xmax: W + 4.4, ymin: -1.8, ymax: H + 3.0, equal: true, pad: 16 })

    v.rect(m, 0, 0, W, H, { color: v.color.ink, fill: v.color.enamel, width: 1.6 })
    v.label(m, -0.4, -0.45, 'M', { color: v.color.ink, size: 15 })
    v.label(m, -0.4, H + 0.4, 'N', { color: v.color.ink, size: 15 })
    v.label(m, W + 0.45, H + 0.4, 'P', { color: v.color.ink, size: 15 })
    v.label(m, W + 0.45, -0.45, 'Q', { color: v.color.ink, size: 15 })

    v.line(m, -3.4, y0, 2.6, y0, { color: v.color.steel, dash: [5, 4], width: 1 })
    v.label(m, -3.15, y0 + 0.48, '法线', { color: v.color.graphite, size: 12 })

    const th = p.theta * Math.PI / 180
    const rayLen = 4.1
    const xIn = -rayLen * Math.cos(th)
    const yIn = y0 - rayLen * Math.sin(th)
    v.arrow(m, xIn, yIn, 0, y0, { color: v.color.ink, width: 2 })
    v.label(m, xIn - 0.15, yIn - 0.4, '红、绿', { color: v.color.ink, size: 12 })
    v.circle(m, 0, y0, 0.07, { fill: v.color.ink, color: v.color.ink })

    const arc = []
    const Rarc = 1.25
    const steps = 18
    for (let i = 0; i <= steps; i++) {
      const a = Math.PI + (th * i) / steps
      arc.push([Rarc * Math.cos(a), y0 + Rarc * Math.sin(a)])
    }
    v.path(m, arc, { color: v.color.graphite, width: 1.2 })
    const am = Math.PI + th * 0.42
    v.label(m, (Rarc + 0.58) * Math.cos(am), y0 + (Rarc + 0.58) * Math.sin(am), 'θ', { color: v.color.ink, size: 15 })

    function show(name, xHit, rDeg, n, tir, s, color) {
      const r = rDeg * Math.PI / 180
      const tanr = Math.tan(r)
      if (!(tanr > 0)) return
      if (xHit >= W) {
        const ySide = y0 + W * tanr
        v.arrow(m, 0, y0, W, ySide, { color: color, width: 2 })
        v.label(m, W - 0.3, ySide - 0.35, name + ' 未到 NP', { color: color, size: 12 })
        return
      }
      v.arrow(m, 0, y0, xHit, H, { color: color, width: 2 })
      v.circle(m, xHit, H, 0.08, { fill: color, color: color })
      if (tir) {
        const yEnd = H - s
        if (yEnd >= 0) {
          v.arrow(m, xHit, H, W, yEnd, { color: color, width: 2 })
          v.circle(m, W, yEnd, 0.12, { fill: color, color: color })
        } else {
          const xBot = xHit + H / tanr
          v.arrow(m, xHit, H, xBot, 0, { color: color, width: 2 })
          v.label(m, xBot, 0.4, name + ' 到底边', { color: color, size: 12 })
        }
      } else {
        const sinOut = n * Math.cos(r)
        const iOut = Math.asin(Math.min(1, Math.max(0, sinOut)))
        const len = 2.5
        const x2 = xHit + len * Math.sin(iOut)
        const y2 = H + len * Math.cos(iOut)
        v.arrow(m, xHit, H, x2, y2, { color: color, width: 2 })
        v.label(m, x2, y2 + 0.2, name + ' 射出', { color: color, size: 12 })
      }
    }

    show('绿', p.xG, p.rG, p.nG, p.tirG > 0.5, p.sG, v.color.green)
    show('红', p.xR, p.rR, p.nR, p.tirR > 0.5, p.sR, v.color.red)

    if (p.tirG > 0.5 && p.sG > 0 && p.sG < H) {
      v.dim(m, W + 0.75, H, W + 0.75, H - p.sG, '绿 ' + p.sG.toFixed(2))
    }
    if (p.tirR > 0.5 && p.sR > 0 && p.sR < H) {
      v.dim(m, W + 2.25, H, W + 2.25, H - p.sR, '红 ' + p.sR.toFixed(2))
    }
  },
})
</Figure>

<Readout items={[
  {label: "红光折射角", symbol: "r_红", expr: "rR", unit: "°", digits: 2, color: "red"},
  {label: "绿光折射角", symbol: "r_绿", expr: "rG", unit: "°", digits: 2, color: "green"},
  {label: "红光在 NP 的入射角", symbol: "i_红", expr: "iR", unit: "°", digits: 2, color: "red"},
  {label: "绿光在 NP 的入射角", symbol: "i_绿", expr: "iG", unit: "°", digits: 2, color: "green"},
  {label: "红光临界角", symbol: "C_红", expr: "CR", unit: "°", digits: 2, color: "red"},
  {label: "绿光临界角", symbol: "C_绿", expr: "CG", unit: "°", digits: 2, color: "green"},
  {label: "红光失去全反射的 θ", symbol: "θ_红", expr: "thetaCR", unit: "°", digits: 2, color: "red"},
  {label: "绿光失去全反射的 θ", symbol: "θ_绿", expr: "thetaCG", unit: "°", digits: 2, color: "green"}
]} />

代表值下 $r_\text{红}>r_\text{绿}$，而 $i_\text{红}<i_\text{绿}$、$C_\text{红}>C_\text{绿}$。全反射要看 $i$ 是否还不低于 $C$。

<Plot
  title="MN 面的折射角"
  caption="两条曲线都随 θ 升高，红光始终在绿光上面。θ 减小，折射角减小。"
  x={{name: "th", label: "θ", unit: "°", min: 22, max: 85}}
  y={{label: "r", unit: "°", min: 0, max: 75}}
  series={[
    {label: "红光 r", expr: "asin(sin(deg(th)) / nR) * 180 / pi", color: "red"},
    {label: "绿光 r", expr: "asin(sin(deg(th)) / nG) * 180 / pi", color: "green"}
  ]}
  cursor="theta"
/>

<Plot
  title="NP 面的入射角和临界角"
  caption="实线降到同色虚线以下时，这束光的全反射消失。红光的交点在左边。"
  x={{name: "th", label: "θ", unit: "°", min: 22, max: 85}}
  y={{label: "角度", unit: "°", min: 0, max: 90}}
  series={[
    {label: "红光入射角 i", expr: "90 - asin(sin(deg(th)) / nR) * 180 / pi", color: "red"},
    {label: "绿光入射角 i", expr: "90 - asin(sin(deg(th)) / nG) * 180 / pi", color: "green"},
    {label: "红光临界角 C", expr: "asin(1 / nR) * 180 / pi", color: "red", dash: true},
    {label: "绿光临界角 C", expr: "asin(1 / nG) * 180 / pi", color: "green", dash: true}
  ]}
  marks={[
    {x: "thetaCR", series: 0, label: "红光全反射消失"},
    {x: "thetaCG", series: 1, label: "绿光全反射消失"}
  ]}
  cursor="theta"
/>

## 四、结合图像理解关键时刻

把 θ 停在 $36^\circ$ 附近：介质里红光更陡，先打到 NP 上靠 N 的位置；绿光更平，打到更靠近 P 的位置。反射之后绿光的落点仍更靠近 P，PQ 旁绿光的尺寸更短。这就是 A 不成立的画面。

向右拖 θ，或点「红光先消失」。$r$–$\theta$ 图上两条曲线一起升高，所以 NP 上的入射角 $i=90^\circ-r$ 一起下降。临界角是水平虚线，不随 θ 变化。红光的实线更低、虚线更高，交点在较小的 θ。交点之后红光从 NP 射出去，绿光还在全反射。这就是 B。

再把 θ 加到 $80^\circ$ 以上。MN 面仍然有折射光进入长方体，只是随后从 NP 射向空气。光是从空气进入介质的，MN 上不会出现全反射。这就是 C。

把 θ 向左拖，或看 $r$–$\theta$ 图的左半边。曲线向右升高，游标左移时两个折射角都变小。θ 减小，折射角减小。这就是 D。θ 太小时光线会先打到侧面，那只说明折射角已经小到打不到 NP，MN 上的折射本身一直存在。

## 五、答案汇总

| 选项 | 判断 |
|---|---|
| A | 错误。PQ 上绿光更靠近 P |
| B | 正确。θ 增大时红光先失去全反射 |
| C | 错误。空气射入介质，MN 面不能全反射 |
| D | 错误。θ 减小，MN 面的折射角减小 |

$$\boxed{B}$$

<Answer items={[
  {label: "答案", text: "B"},
  {label: "A", text: "错误"},
  {label: "B", text: "正确"},
  {label: "C", text: "错误"},
  {label: "D", text: "错误"}
]} />
