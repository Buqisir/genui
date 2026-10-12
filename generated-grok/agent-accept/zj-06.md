---
id: zj-06
title: 开孔电极的等势线
topic: 静电场
source: 2022 浙江卷（汇编专题六第 5 题，单选）
question: |
  某种气体电子放大器的局部结构是由两块夹有绝缘介质的平行金属薄膜构成，其上存在等间距小孔，其中相邻两孔截面上的电场线和等势线的分布如图所示。下列说法正确的是（　　）

  【图】上下两块水平金属薄膜，画成两条粗黑横条，中间一条空白缝，左右各一个圆孔，大致左右对称。两族曲线：一族从上方汇入圆孔再从下方散开，孔内最密、孔外较疏；另一族与之交叉，大体横向，在孔口附近向上下鼓出。a 在左上方，黑点在汇入孔的那一族上：线从上方竖直下落，过 a 后向右下弯进左孔，不在最上面那条横向曲线上。b 在 a 的右上方，黑点在最上面一条横向曲线上，此处竖线间距大。c 在 b 下方、贴近左孔孔口，黑点在一条更靠近孔口的横向曲线上，此处竖线明显变密；b 到 c 之间还隔着横向曲线，a 已经比 b 更靠近孔。左孔下方，d 同时落在一条竖直线和一条左右贯通、中部下凹的横向曲线上；右孔下方的 e 在对应竖直线上，并且在同一条横向曲线上。g 在 d 正下方，与 d 共用那条竖直线，并落在最底下一根水平直线上；f 在 e 正下方，与 e 共用竖直线，也落在这根水平直线上。d 与 e、f 与 g 之间是横向线，e 与 f、d 与 g 之间是竖直线，四点不在同一条曲线上。

  A. a 点所在的线是等势线

  B. b 点的电场强度比 c 点大

  C. b、c 两点间的电势差的值比 a、c 两点间的大

  D. 将电荷沿图中的线从 d→e→f→g 移动时电场力做功为零
choice: C
answers: []
---

## 题目条件分析

截面上有两族互相交叉的曲线。

- 从上方汇入小孔、孔内最密、到下方散开的一族是电场线。金属膜挡住电场线，通量从孔里挤过去，所以孔内密、孔外疏。沿电场线方向电势降低，本题里是自上而下。
- 与它们交叉、大体横向、在孔口附近向上下鼓出的一族是等势线。等势线与电场线垂直。金属膜是导体，膜表面本身是等势面。

各点按题目图的相对位置来读：

- a 在左上方，落在汇入左孔的电场线上，不在最上面那条横向等势线上。
- b 在 a 的右上方，落在最上面一条等势线上，那里电场线间距大。
- c 在 b 的下方、贴近左孔孔口，落在更靠近孔的一条等势线上，那里电场线明显变密。b 到 c 之间还隔着别的等势线；a 已经比 b 更靠近孔。
- 左孔下方的 d 和右孔下方的 e 在同一条横向等势线上。g 在 d 的下方，f 在 e 的下方，f 与 g 在更下面的同一条等势线上。d 与 g、e 与 f 各沿一条电场线。四点不在同一条曲线上。

原题没有给电势的数值。下面的演示取一组代表性电势，只用来比较大小：上膜 $\varphi = 100\ \text{V}$，下膜 $\varphi = 0$，孔外上下两端的漂移电极分别为 $110\ \text{V}$ 和 $-10\ \text{V}$。膜的厚度、孔距相对漂移区**不按比例**。把膜间电压 $U$ 或试探电荷 $q$ 拖离这些取值，读数按比例变化，四个选项的对错不变。长度单位用图上的「格」，场强单位是 V/格。

## 完整解答

### 选项 A：错误

a 所在的那一族从上方竖直下落，过 a 后向右下弯进左孔，再从孔的另一侧散开，并且和横向曲线交叉。这一族在孔口变密，表示场强变大，所以它是电场线。

等势线不能连成「钻进小孔、从另一侧散开」的这一族，也不能和另一条等势线交叉。a 不在最上面那条横向等势线上。a 点所在的线不是等势线。

### 选项 B：错误

电场线越密，场强越大。b 在最上面一条等势线上，周围电场线间距大；c 贴近左孔孔口，电场线明显变密。所以

$$
E_b < E_c
$$

选项写成「b 比 c 大」，大小关系反了。

等势线按相等的电势间隔画出时，等势线越密的地方场强也越大。c 比 b 更靠近孔口，等势线也更密，结论相同。

在代表性数值下，$E_b = 5.46\ \text{V/格}$，$E_c = 40.5\ \text{V/格}$。

### 选项 C：正确

顺着电场线，电势从上方降到下方。b 在最上面一条等势线上，c 在靠近孔口的一条等势线上，两条之间还隔着别的等势线，因此 $|\varphi_b - \varphi_c|$ 等于这几格间隔之和。

a 不在 b 的那条等势线上，而且已经比 b 更靠近孔：过 a 的电场线先离开 b 所在的等势线，还没有降到 c 所在的那一条。a 的电势落在 $\varphi_b$ 和 $\varphi_c$ 之间，从 a 再到 c 跨过的等势线更少：

$$
|U_{bc}| = |\varphi_b - \varphi_c| > |\varphi_a - \varphi_c| = |U_{ac}|
$$

所以 b、c 两点间电势差的值比 a、c 两点间的大。

代表性数值：$\varphi_b = 107\ \text{V}$，$\varphi_a = 102.4\ \text{V}$，$\varphi_c = 85\ \text{V}$，于是 $|U_{bc}| = 22\ \text{V}$，$|U_{ac}| = 17.4\ \text{V}$。

### 选项 D：错误

d 与 e 在同一条等势线上，$\varphi_d = \varphi_e$；f 与 g 在另一条等势线上，$\varphi_f = \varphi_g$。e 与 f、d 与 g 是电场线，电势沿电场线要变，所以 $\varphi_d \neq \varphi_g$。

静电场做功只看初末位置的电势。电荷从 d 走到 g：

$$
W_{d \to g} = q(\varphi_d - \varphi_g)
$$

$q \neq 0$ 且 $\varphi_d \neq \varphi_g$，做功不为零。正电荷顺着向下的电场从 d 走到 g，做的是正功。

分段看也一样：d→e 沿等势线，这一段做功为零；e→f 沿电场线，电势下降，做功不为零；f→g 再沿等势线，前面做出的功还在。三段加起来不是零。

d→e→f→g 没有回到 d。把 g→d 也走完，才是闭合回路，静电场沿闭合回路的功才一定为零。少掉的 g→d 正好跨着两条等势线。

代表性数值：$\varphi_d = \varphi_e = -4\ \text{V}$，$\varphi_f = \varphi_g = -7\ \text{V}$。$q = 1\ \text{C}$ 时，$W_{d \to g} = 3\ \text{J}$。

### 结论

$$
\boxed{C}
$$

## 交互演示

左侧图是相邻两孔的截面。导体电势给定以后，电场线和等势线由静电场直接算出：带箭头的是电场线，虚线是等势线。a 放在一条会弯进左孔的电场线上；b、c 放在各自的等势线上；d 与 e、f 与 g 各共用一条等势线，d 与 g、e 与 f 各共用一条电场线。

算出的孔下方等势线在两孔之间略高、孔的正下方略低，因为电势沿孔轴下降得更远。原题示意图把 d、e 所在的那条画成中部下凹。读图时确认 d、e 在同一条等势线上、f、g 在另一条上即可，凹凸方向不改变做功的结论。

点右侧的选项，或用下面的按钮，逐项看。看 D 时拖动路径进度：s = 0、1、2、3 依次是 d、e、f、g。

<Question text="A. a 点所在的线是等势线" set={{mode: 2, s: 0}} hint="看这根线是否穿进左孔，并和横向虚线交叉" />

<Question text="B. b 点的电场强度比 c 点大" set={{mode: 3, s: 0}} hint="比一比孔口和上方的电场线疏密，再读 E_b 与 E_c" />

<Question text="C. b、c 两点间的电势差的值比 a、c 两点间的大" set={{mode: 4, s: 0}} hint="读 φ_b、φ_a、φ_c，a 落在 b 与 c 之间" />

<Question text="D. 将电荷沿图中的线从 d→e→f→g 移动时电场力做功为零" set={{mode: 5, s: 3}} hint="先看到 e，这一段功仍是 0；再拖到 g，总功不回到 0" />

<Param name="U" label="膜间电压" symbol="U" value={100} min={40} max={160} step={10} unit="V" color="field" digits={0} />

<Param name="q" label="试探电荷" symbol="q" value={1} min={-2} max={2} step={0.1} unit="C" color="charge" digits={1} />

<Param name="s" label="d→e→f→g 进度" symbol="s" value={0} min={0} max={3} step={0.01} digits={2} />

<Param name="mode" label="高亮" value={1} options={[
  {value: 1, label: "全图"},
  {value: 2, label: "选项 A"},
  {value: 3, label: "选项 B"},
  {value: 4, label: "选项 C"},
  {value: 5, label: "选项 D"},
]} />

<Define name="phiB" expr="1.07*U" />

<Define name="phiA" expr="1.02386*U" />

<Define name="phiC" expr="0.85*U" />

<Define name="phiD" expr="-0.04*U" />

<Define name="phiG" expr="-0.07*U" />

<Define name="Eb" expr="0.05464*U" />

<Define name="Ec" expr="0.40459*U" />

<Define name="Ubc" expr="abs(phiB - phiC)" />

<Define name="Uac" expr="abs(phiA - phiC)" />

<Define name="Wdg" expr="q*(phiD - phiG)" />

<Preset label="全图" set={{mode: 1, s: 0, U: 100, q: 1}} />

<Preset label="看选项 C" set={{mode: 4, s: 0, U: 100, q: 1}} />

<Preset label="看选项 A" set={{mode: 2, s: 0}} />

<Preset label="看选项 B" set={{mode: 3, s: 0}} />

<Preset label="D：停在 e" set={{mode: 5, s: 1}} />

<Preset label="D：到达 g" set={{mode: 5, s: 3}} />

<Status cases={[
  {when: "mode == 2", label: "a 所在的线穿进左孔，是电场线", tone: "warning"},
  {when: "mode == 3", label: "c 处电场线更密，E_c 大于 E_b", tone: "warning"},
  {when: "mode == 4", label: "a 的电势落在 b 与 c 之间，b、c 电势差更大", tone: "success"},
  {when: "(mode == 5) and (abs(q) < 1e-6)", label: "q = 0，沿任何路径做功都为零", tone: "neutral"},
  {when: "(mode == 5) and (s <= 1.02)", label: "沿等势线 d→e，这一段电场力不做功", tone: "info"},
  {when: "(mode == 5) and (s < 2)", label: "沿电场线 e→f，电势在变，做功不为零", tone: "warning"},
  {when: "mode == 5", label: "到达 g：d 与 g 电势不同，总功不为零", tone: "warning"},
  {when: "mode == 1", label: "箭头是电场线，横向虚线是等势线", tone: "neutral"},
  {label: "点一个选项，或拖动进度", tone: "neutral"},
]} />

<Readout items={[
  {label: "b 点场强", symbol: "E_b", expr: "Eb", unit: "V/格", digits: 2, color: "field"},
  {label: "c 点场强", symbol: "E_c", expr: "Ec", unit: "V/格", digits: 2, color: "field"},
  {label: "b、c 电势差", symbol: "U_{bc}", expr: "Ubc", unit: "V", digits: 2, color: "field"},
  {label: "a、c 电势差", symbol: "U_{ac}", expr: "Uac", unit: "V", digits: 2, color: "field"},
  {label: "全程 d→g 的功", symbol: "W", expr: "Wdg", unit: "J", digits: 2, color: "force"},
]} />

<Answer items={[{label: "答案", text: "C"}]} />

<Figure
  title="相邻两孔截面上的电场线与等势线"
  height={520}
  params={["U", "mode", "s"]}
  legend={[
    {kind: "field", label: "电场线"},
    {kind: "steel-dash", label: "等势线"},
  ]}
  note="中间上下两排是开孔金属膜，上下两端是维持孔外弱电场的漂移电极，原题图没有画出。膜厚和孔距不按比例。箭头为电场线，虚线为等势线。"
>
figure({
  draw(ctx, p, v) {
    const U = p.U
    const k = U / 100
    const cL = -1.7
    const cR = 1.7
    const hw = 0.45
    const yFilm = 0.28
    const x0 = -4
    const x1 = 4
    const levels = [107, 104, 98, 92, 85, 20, 8, -4, -7].map(function (lv) { return lv * k })
    const cons = [
      { line: [-4.3, 2.55, 4.3, 2.55], V: 1.1 * U },
      { line: [-4.3, -2.55, 4.3, -2.55], V: -0.1 * U },
    ]
    function film(y, V) {
      cons.push({ line: [x0, y, cL - hw, y], V: V })
      cons.push({ line: [cL + hw, y, cR - hw, y], V: V })
      cons.push({ line: [cR + hw, y, x1, y], V: V })
    }
    film(yFilm, U)
    film(-yFilm, 0)

    const m = v.view({ xmin: -4.6, xmax: 4.6, ymin: -2.7, ymax: 2.9, equal: true })
    const field = v.efield(m, [], {
      conductors: cons,
      equipotentials: levels,
      density: 5,
      arrows: true,
      through: [[-2.3, 1.55]],
    })

    function yOn(x, target, y0, y1) {
      let lo = y0
      let hi = y1
      if ((field.phi(x, lo) - target) * (field.phi(x, hi) - target) > 0) return null
      for (let i = 0; i < 28; i++) {
        const mid = (lo + hi) / 2
        if ((field.phi(x, lo) - target) * (field.phi(x, mid) - target) <= 0) hi = mid
        else lo = mid
      }
      return (lo + hi) / 2
    }
    function cross(line, target, yMax) {
      if (!line) return null
      for (let i = 0; i < line.length - 1; i++) {
        const a = line[i]
        const b = line[i + 1]
        if (a[1] > yMax && b[1] > yMax) continue
        const p1 = field.phi(a[0], a[1])
        const p2 = field.phi(b[0], b[1])
        if ((p1 - target) * (p2 - target) > 0) continue
        const dp = p2 - p1
        if (Math.abs(dp) < 1e-9) continue
        const t = (target - p1) / dp
        if (t < -0.02 || t > 1.02) continue
        const y = a[1] + t * (b[1] - a[1])
        if (y > yMax) continue
        return [a[0] + t * (b[0] - a[0]), y]
      }
      return null
    }
    function atFrac(pts, u) {
      if (!pts || pts.length === 0) return null
      if (pts.length === 1 || u <= 0) return pts[0]
      if (u >= 1) return pts[pts.length - 1]
      let total = 0
      const seg = []
      for (let i = 1; i < pts.length; i++) {
        const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
        seg.push(L)
        total += L
      }
      let dist = u * total
      for (let i = 1; i < pts.length; i++) {
        const L = seg[i - 1]
        if (dist <= L || i === pts.length - 1) {
          const t = L > 1e-8 ? dist / L : 0
          return [
            pts[i - 1][0] + t * (pts[i][0] - pts[i - 1][0]),
            pts[i - 1][1] + t * (pts[i][1] - pts[i - 1][1]),
          ]
        }
        dist -= L
      }
      return pts[pts.length - 1]
    }
    function arcPhi(A, B, target, y0, y1) {
      const n = 16
      const pts = []
      for (let i = 0; i <= n; i++) {
        const x = A[0] + ((B[0] - A[0]) * i) / n
        const y = yOn(x, target, y0, y1)
        if (y == null) return null
        pts.push([x, y])
      }
      return pts
    }
    function sliceBetween(line, A, B) {
      if (!line || line.length < 2) return [A, B]
      function idx(pt) {
        let bi = 0
        let bd = 1e9
        for (let i = 0; i < line.length; i++) {
          const d = (line[i][0] - pt[0]) ** 2 + (line[i][1] - pt[1]) ** 2
          if (d < bd) {
            bd = d
            bi = i
          }
        }
        return bi
      }
      const i0 = idx(A)
      const i1 = idx(B)
      const rev = i0 > i1
      const seg = line.slice(Math.min(i0, i1), Math.max(i0, i1) + 1).map(function (pt) { return [pt[0], pt[1]] })
      if (rev) seg.reverse()
      return seg.length > 1 ? seg : [A, B]
    }

    const aLine = field.line(-2.3, 1.55)
    let aPt = null
    if (aLine) {
      let best = 1e9
      for (let i = 0; i < aLine.length; i++) {
        const pt = aLine[i]
        const d = Math.abs(pt[1] - 1.5)
        if (d < best && pt[0] < -2.05) {
          best = d
          aPt = pt
        }
      }
    }
    const yb = yOn(-0.4, 107 * k, 1.55, 2.45)
    const yc = yOn(-1.7, 85 * k, 0.36, 1.15)
    const bPt = yb == null ? null : [-0.4, yb]
    const cPt = yc == null ? null : [-1.7, yc]
    const left = field.line(-1.7, -0.8)
    const right = field.line(1.7, -0.8)
    const dPt = cross(left, -4 * k, -0.45)
    const gPt = cross(left, -7 * k, -0.45)
    const ePt = cross(right, -4 * k, -0.45)
    const fPt = cross(right, -7 * k, -0.45)

    const mode = p.mode
    const hot = {
      a: mode == 2 || mode == 4,
      b: mode == 3 || mode == 4,
      c: mode == 3 || mode == 4,
      d: mode == 5,
      e: mode == 5,
      f: mode == 5,
      g: mode == 5,
    }
    function dot(pt, name, place, on) {
      if (!pt) return
      if (on) v.circle(m, pt[0], pt[1], 0.12, { color: v.color.field, width: 2 })
      v.circle(m, pt[0], pt[1], 0.045, { fill: v.color.ink })
      v.label(m, pt[0], pt[1], name, { place: place, color: v.color.ink })
    }
    dot(aPt, "a", "above-left", hot.a)
    dot(bPt, "b", "below", hot.b)
    dot(cPt, "c", "left", hot.c)
    dot(dPt, "d", "left", hot.d)
    dot(ePt, "e", "right", hot.e)
    dot(gPt, "g", "below-left", hot.g)
    dot(fPt, "f", "below-right", hot.f)

    if (mode == 5 && dPt && ePt && fPt && gPt) {
      const de = arcPhi(dPt, ePt, -4 * k, -2.4, -0.5)
      const fg = arcPhi(fPt, gPt, -7 * k, -2.45, -1.5)
      const ef = sliceBetween(right, ePt, fPt)
      if (de) v.path(m, de, { color: v.color.charge, width: 2.2 })
      if (ef) v.path(m, ef, { color: v.color.charge, width: 2.2 })
      if (fg) v.path(m, fg, { color: v.color.charge, width: 2.2 })
      const s = Math.min(3, Math.max(0, p.s))
      let pos = null
      if (s <= 1) pos = atFrac(de, s)
      else if (s <= 2) pos = atFrac(ef, s - 1)
      else pos = atFrac(fg, s - 2)
      if (pos) v.circle(m, pos[0], pos[1], 0.07, { fill: v.color.charge })
    }
  },
})
</Figure>

## 结合图像

全图里，加粗的那条电场线从上方近乎竖直地落到 a，再向右下弯进左孔。b 落在最上面一条虚线上，周围电场线疏；c 落在孔口的虚线上，周围电场线密。a 的高度和到孔的距离都介于「远在上方的 b」和「贴在孔口的 c」之间，电势也介于二者之间。

看选项 D 时，电荷先沿 d、e 的虚线横过去，侧栏里的全程功仍是 $q(\varphi_d - \varphi_g)$，但这一段的贡献是零。离开 e 以后电荷沿电场线下降，电势从 $-4\ \text{V}$ 降到 $-7\ \text{V}$（$U = 100\ \text{V}$ 时），功不再是零。

## 答案

选 C。a 在电场线上；b 的场强比 c 小；b、c 的电势差比 a、c 大；d→e→f→g 的末位置 g 与起点 d 不在同一等势线上，电场力做功不为零。
