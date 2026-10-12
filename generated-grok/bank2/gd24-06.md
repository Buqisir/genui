---
id: gd24-06
title: 介质中的红绿光束
source: 2024 广东卷 第 6 题（单选，4 分）
question: |
  如图所示，红绿两束单色光，同时从空气中沿同一路径以 θ 角从 MN 面射入某长方体透明均匀介质。折射光束在 NP 面发生全反射。反射光射向 PQ 面。若 θ 逐渐增大。两束光在 NP 面上的全反射现象会先后消失。已知在该介质中红光的折射率小于绿光的折射率。下列说法正确的是（　　）

  A. 在 PQ 面上，红光比绿光更靠近 P 点

  B. θ 逐渐增大时，红光的全反射现象先消失

  C. θ 逐渐增大时，入射光可能在 MN 面发生全反射

  D. θ 逐渐减小时，两束光在 MN 面折射的折射角逐渐增大
choice: B
answers: []
---

题目只给了字母 θ，并说明该介质中 $n_{\text{红}} < n_{\text{绿}}$。下面取一组代表性数值：空气 $n_0 = 1$，$n_{\text{红}} = 1.50$，$n_{\text{绿}} = 1.60$，长方体水平边长 $6$、高 $3$（长度单位任取，不影响角度关系），入射点取在 MN 下部。折射、全反射和落点都由光路计算给出。

题图里 θ 是入射光线与 MN 面的夹角，法线水平，所以入射角

$$
i = 90^\circ - \theta
$$

由斯涅尔定律 $n_0 \sin i = n \sin \gamma$。折射光线斜向上，打到水平的 NP 面时，入射角是 $90^\circ - \gamma$。临界角 $C = \arcsin(n_0/n)$，$n$ 越小 $C$ 越大。

## 完整解答

**A 错误。** $n_{\text{红}} < n_{\text{绿}}$，同一入射角下 $\sin \gamma = \sin i / n$，所以 $\gamma_{\text{红}} > \gamma_{\text{绿}}$：红光偏离法线更多，更早打到 NP 面，落点更靠近 P。全反射的反射角等于入射角，反射光线与法线的夹角仍是 $\gamma$。红光的 $\gamma$ 更大，从更高的位置以更斜的路径向下走，到 PQ 面时比绿光更低、更远离 P 点。

取 $\theta = 45^\circ$（$i = 45^\circ$），光路给出 $\gamma_{\text{红}} = 28.1^\circ$、$\gamma_{\text{绿}} = 26.2^\circ$，NP 面上的入射角分别是 $61.9^\circ$、$63.8^\circ$，都大于各自的临界角 $41.8^\circ$、$38.7^\circ$，确实全反射；再射到 PQ 面，红光落点低于绿光。

**B 正确。** θ 增大则 $i$ 减小，$\gamma$ 减小，NP 面上的入射角 $90^\circ - \gamma$ 也减小，全反射越来越接近临界。临界时 $\gamma = 90^\circ - C$，代入斯涅尔定律

$$
\sin i = n\sin(90^\circ - C) = n\cos C = \sqrt{n^2 - 1}
$$

$n \ge \sqrt{2}$ 时右边不小于 $1$，任何入射角都满足全反射，θ 增大也不会消失。$n < \sqrt{2}$ 时，全反射要求

$$
i \ge \arcsin\sqrt{n^2 - 1}, \qquad \theta \le 90^\circ - \arcsin\sqrt{n^2 - 1}
$$

$n$ 越小，这个 θ 的上限越低，θ 增大时越早越过它。已知 $n_{\text{红}} < n_{\text{绿}}$，红光先消失。

代表性数值里 $1.50$ 和 $1.60$ 都大于 $\sqrt{2}$，θ 一直增大也不会消失，看不出先后。把折射率换成同样满足 $n_{\text{红}} < n_{\text{绿}}$ 的 $1.30$ 和 $1.36$，界限分别是

$$
\theta_{\text{红}} = \arcsin\sqrt{1.30^2 - 1} = 56.2^\circ, \qquad \theta_{\text{绿}} = \arcsin\sqrt{1.36^2 - 1} = 67.2^\circ
$$

θ 增大，先越过 $56.2^\circ$，红光在 NP 面改为折射出射，绿光仍全反射；再越过 $67.2^\circ$，绿光也折出。

**C 错误。** 全反射只能发生在从光密介质射向光疏介质的界面。入射光在空气中射向介质，无论 θ 怎么变，MN 面上只有折射，不会全反射。

**D 错误。** θ 减小则 $i = 90^\circ - \theta$ 增大，由 $\sin \gamma = \sin i / n$，$\gamma$ 随 $i$ 一起增大。所以 θ 逐渐减小时，两束光在 MN 面的折射角都逐渐增大，不是选项说的方向。

选 B。

<Param name="theta" label="入射光线与 MN 面的夹角" symbol="θ" value={45} min={20} max={70} step={1} unit="°" />

<Param name="nR" label="红光折射率" symbol="n_红" value={1.5} min={1.2} max={1.6} step={0.01} color="force" />

<Param name="nG" label="绿光折射率" symbol="n_绿" value={1.6} min={1.3} max={1.8} step={0.01} color="charge" />

<Define name="iIn" expr="90 - theta" />

<Define name="limR" expr="sqrt(nR^2 - 1) < 1 ? 90 - asin(sqrt(nR^2 - 1))*180/pi : 90" />

<Define name="limG" expr="sqrt(nG^2 - 1) < 1 ? 90 - asin(sqrt(nG^2 - 1))*180/pi : 90" />

<Optics name="lt" n0={1} length={40}
  media={[{name: "block", n: "nG", label: "介质", shape: {xmin: 0, xmax: 6, ymin: 0, ymax: 3}}]}
  rays={[
    {name: "red", from: ["-1.6", "0.9 - 1.6*tan(deg(theta))"], angle: "theta", color: "red", n: {block: "nR"}},
    {name: "green", from: ["-1.6", "0.9 - 1.6*tan(deg(theta))"], angle: "theta", color: "green", n: {block: "nG"}}
  ]} />

<Question text="A. 在 PQ 面上，红光比绿光更靠近 P 点" set={{theta: 45, nR: 1.5, nG: 1.6}} hint="两束光都在 NP 面全反射，红光在 PQ 面的落点更低" />

<Question text="B. θ 逐渐增大时，红光的全反射现象先消失" set={{theta: 60, nR: 1.3, nG: 1.36}} hint="n 都小于 √2 才看得到先后：θ = 60° 已过红光的 56.2°，还没到绿光的 67.2°" />

<Question text="C. θ 逐渐增大时，入射光可能在 MN 面发生全反射" set={{theta: 70, nR: 1.5, nG: 1.6}} hint="入射光从空气射向介质，θ 拖到头也只有折射" />

<Question text="D. θ 逐渐减小时，两束光在 MN 面折射的折射角逐渐增大" set={{theta: 30, nR: 1.5, nG: 1.6}} hint="θ 越小入射角越大，折射角跟着变大" />

<Preset label="题目情景：两束都全反射" set={{theta: 45, nR: 1.5, nG: 1.6}} />

<Preset label="红光先消失" set={{theta: 60, nR: 1.3, nG: 1.36}} />

<Preset label="两束都从 NP 面折出" set={{theta: 70, nR: 1.3, nG: 1.36}} />

<Status cases={[
  {when: "theta < limR and theta < limG", label: "两束光都在 NP 面全反射", tone: "success"},
  {when: "theta < limG", label: "红光已折射出射，绿光仍全反射", tone: "warning"},
  {label: "两束光都从 NP 面折射出射", tone: "neutral"}
]} />

<Readout items={[
  {label: "入射角", symbol: "i", expr: "iIn", unit: "°", digits: 1},
  {label: "红光折射角", symbol: "γ_红", color: "force", expr: "lt.red.r[1]", unit: "°", digits: 1},
  {label: "绿光折射角", symbol: "γ_绿", color: "charge", expr: "lt.green.r[1]", unit: "°", digits: 1},
  {label: "红光临界角", symbol: "C_红", color: "force", expr: "asin(1/nR)*180/pi", unit: "°", digits: 1},
  {label: "绿光临界角", symbol: "C_绿", color: "charge", expr: "asin(1/nG)*180/pi", unit: "°", digits: 1},
  {label: "红光在 NP 面的入射角", color: "force", expr: "lt.red.i[2]", unit: "°", digits: 1},
  {label: "绿光在 NP 面的入射角", color: "charge", expr: "lt.green.i[2]", unit: "°", digits: 1},
  {label: "红光全反射的 θ 上限", symbol: "θ_红", color: "force", expr: "limR", unit: "°", digits: 1},
  {label: "绿光全反射的 θ 上限", symbol: "θ_绿", color: "charge", expr: "limG", unit: "°", digits: 1}
]} />

<Answer items={[
  {label: "答案", text: "B"},
  {label: "全反射消失的界限", text: "θ = 90° − arcsin√(n² − 1)（n < √2 时才存在）"},
  {label: "代表值 n = 1.30、1.36", text: "红光 θ = 56.2°，绿光 θ = 67.2°，红光先消失"}
]} />

<Figure title="红绿光束进入长方体介质" height={340}
  note="长度单位任取，角度不随尺寸改变。n ≥ √2 时 θ 上限显示 90°，表示 θ 增大也不会失去全反射"
  params={["lt", "theta", "limR", "limG", "nR", "nG"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2.6, xmax: 7.6, ymin: -3.9, ymax: 3.9, equal: true })
    v.optics(m, p.lt, { normals: true })
    v.label(m, -0.34, 0, 'M')
    v.label(m, -0.34, 3, 'N')
    v.label(m, 6.34, 3, 'P')
    v.label(m, 6.34, 0, 'Q')
    const yOf = (th) => 0.9 - 1.6 * Math.tan(th * Math.PI / 180)
    v.line(m, -1.6, yOf(p.theta), 0, 0.9, { color: v.color.steel, dash: true })
    v.label(m, -1.95, yOf(p.theta) + 0.3, 'θ')
    v.label(m, -0.5, (yOf(p.theta) + 0.9) / 2 + 0.35, '红')
    v.label(m, -0.5, (yOf(p.theta) + 0.9) / 2 - 0.35, '绿')
    const mark = (th, name) => {
      if (!(th > 20 && th < 70)) return
      v.line(m, -1.6, yOf(th), 0, 0.9, { color: v.color.steel, dash: true, width: 1 })
      v.label(m, -2.15, yOf(th) - 0.28, name)
    }
    mark(p.limR, 'θ_红')
    mark(p.limG, 'θ_绿')
  },
})
</Figure>

<Plot title="NP 面上的入射角随 θ 变化" size="wide"
  caption="θ 增大，入射角下降；降到临界角以下全反射消失。红光的临界角更大，所以先消失"
  x={{name: "theta", label: "θ", unit: "°", min: 20, max: 70}}
  y={{label: "入射角", unit: "°", min: 20, max: 80}}
  series={[
    {label: "红光", color: "force", expr: "90 - asin(sin(deg(90 - theta))/nR)*180/pi"},
    {label: "绿光", color: "charge", expr: "90 - asin(sin(deg(90 - theta))/nG)*180/pi"},
    {label: "C_红", color: "force", dash: true, expr: "asin(1/nR)*180/pi"},
    {label: "C_绿", color: "charge", dash: true, expr: "asin(1/nG)*180/pi"}
  ]}
  marks={[
    {x: "limR", label: "红光全反射消失"},
    {x: "limG", label: "绿光全反射消失"}
  ]}
  cursor="theta"
/>

## 结合图像

初始参数就是题目的情景：两束光都在 NP 面全反射，红光打到 PQ 面的位置更低。这时 $n > \sqrt{2}$，两条虚线临界角都在曲线下方，θ 拖到头也碰不到，全反射不会消失。

点「红光先消失」，折射率换成 $1.30$ 和 $1.36$。θ 停在 $60^\circ$，介于 $56.2^\circ$ 和 $67.2^\circ$ 之间：红光的曲线已经落到自己的临界角之下，从 NP 面折射出去；绿光仍在临界角之上，继续全反射。再增大 θ，绿光随后也折出。

把 θ 减小，MN 面的入射角变大，读数里两个折射角都变大，所以 D 说反了。无论 θ 多大，MN 面上的入射光都是从空气进入介质，只有折射，不会全反射。
