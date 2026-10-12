---
id: gd23-01
title: 恒星塌缩中的核反应
source: 2023 广东卷 第 1 题（单选，4 分）
question: "理论认为，大质量恒星塌缩成黑洞的过程，受核反应 ^{12}_{6}C + Y → ^{16}_{8}O 的影响。下列说法正确的是（　　） A. Y 是 β 粒子，β 射线穿透能力比 γ 射线强 B. Y 是 β 粒子，β 射线电离能力比 γ 射线强 C. Y 是 α 粒子，α 射线穿透能力比 γ 射线强 D. Y 是 α 粒子，α 射线电离能力比 γ 射线强"
choice: D
answers: []
---

反应式 $^{12}_{6}\mathrm{C} + Y \to ^{16}_{8}\mathrm{O}$ 要同时满足电荷数和质量数守恒。三种射线的穿透能力是 $\gamma > \beta > \alpha$，电离能力则相反：$\alpha > \beta > \gamma$。下面的比较用同一源出射的三束射线，依次遇到纸、铝、铅三层档板；档板厚度只是示意，不按比例。

## 完整解答

左边碳核的电荷数是 $6$、质量数是 $12$，右边氧核的电荷数是 $8$、质量数是 $16$。Y 必须补上的电荷数和质量数分别是

$$
Z_Y = 8 - 6 = \boxed{2}, \qquad A_Y = 16 - 12 = \boxed{4}
$$

电荷数 $2$、质量数 $4$ 的粒子是 $\alpha$ 粒子（$^4_2\mathrm{He}$）。$\beta$ 粒子的质量数是 $0$，电荷数是 $-1$，两边都对不上。

**A. 错误。** Y 不是 $\beta$ 粒子。即使就射线本身比较，$\beta$ 射线的穿透能力也弱于 $\gamma$ 射线：同一源出射时，$\beta$ 只能穿过纸板，$\gamma$ 还能穿过铝板。

**B. 错误。** 后半句对：$\beta$ 射线是高速电子流，电离能力确实比 $\gamma$ 射线强。但 Y 不是 $\beta$ 粒子，整句仍不成立。

**C. 错误。** 前半句对：Y 是 $\alpha$ 粒子。后半句把穿透能力说反了。$\alpha$ 粒子质量大、速度相对较小，穿透能力最弱，一张纸就能挡住；$\gamma$ 射线是高频电磁波，穿透能力最强，纸和铝都挡不住，要靠较厚的铅才能大量吸收。

**D. 正确。** Y 是 $\alpha$ 粒子，而且 $\alpha$ 射线的电离能力比 $\gamma$ 射线强。同一源出射时，$\alpha$ 在纸板内就把路径上的原子电离完，$\gamma$ 走得最远、沿途电离最少。

因此选择 $\boxed{\mathrm{D}}$。

## 交互演示

三束射线从同一源出射，依次遇到纸、铝、铅。点下方的选项，就只留下该选项说到的那一种粒子或射线，看它能走多远、沿途电离多少。档板厚度和射程都不按比例。

<Param name="t" label="时间" value={0} min={0} max={6} step={0.1} unit="s" hidden />

<Param name="view" label="比较哪一项" value={4} options={[{value: 0, label: "三种一起看"}, {value: 1, label: "A：β 的穿透"}, {value: 2, label: "B：β 的电离"}, {value: 3, label: "C：α 的穿透"}, {value: 4, label: "D：α 的电离"}]} />

<Define name="showA" expr="view == 0 or view == 3 or view == 4" />

<Define name="showB" expr="view == 0 or view == 1 or view == 2" />

<Define name="showG" expr="view == 0 or view == 1 or view == 2 or view == 3 or view == 4" />

<Define name="ionA" expr="view == 0 or view == 4" />

<Define name="ionB" expr="view == 0 or view == 2" />

<Define name="ionG" expr="view == 0 or view == 2 or view == 4" />

<Question text="A. Y 是 β 粒子，β 射线穿透能力比 γ 射线强" set={{view: 1}} hint="β 止于铝板，γ 还能穿过去" />

<Question text="B. Y 是 β 粒子，β 射线电离能力比 γ 射线强" set={{view: 2}} hint="电离这半句对，但 Y 不是 β" />

<Question text="C. Y 是 α 粒子，α 射线穿透能力比 γ 射线强" set={{view: 3}} hint="Y 确是 α，但 α 穿不过纸" />

<Question text="D. Y 是 α 粒子，α 射线电离能力比 γ 射线强" set={{view: 4}} hint="电荷数 2、质量数 4，电离也最强" />

<Preset label="看正确选项 D" set={{view: 4}} />

<Status cases={[
  {when: "view == 1", label: "A 错：β 穿不过铝，γ 穿过铝", tone: "danger"},
  {when: "view == 2", label: "B 错：电离对，但 Y 不是 β", tone: "warning"},
  {when: "view == 3", label: "C 错：Y 是 α，但 α 穿不过纸", tone: "warning"},
  {when: "view == 4", label: "D 对：Y 是 α，电离比 γ 强", tone: "success"},
  {label: "三种射线一起比较", tone: "info"}
]} />

<Sim title="三种射线穿过纸、铝、铅" height={340} duration={6} time="t" params={["showA", "showB", "showG", "ionA", "ionB", "ionG"]} marks={[{t: 0, label: "同一源出射"}, {t: 1.6, label: "α 被纸挡住"}, {t: 3.4, label: "β 被铝挡住"}, {t: 5.2, label: "γ 到达铅板"}]} note="档板厚度和射程不按比例；轨迹上的点表示沿途电离" autoplay={false} playSeconds={8}>
sim({
  at(t, p) {
    const go = (xEnd, tEnd) => {
      if (t <= 0) return 0
      if (t >= tEnd) return xEnd
      return xEnd * t / tEnd
    }
    return {
      xa: go(2.15, 1.6),
      xb: go(4.55, 3.4),
      xg: go(6.95, 5.2),
    }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -0.6, xmax: 8.4, ymin: -1.7, ymax: 2.5, equal: true })
    v.stars()
    v.block(m, 2.4, -1.35, 0.28, 2.5)
    v.block(m, 4.8, -1.35, 0.34, 2.5)
    v.block(m, 7.2, -1.35, 0.42, 2.5)
    v.label(m, 2.4, 1.55, '纸')
    v.label(m, 4.8, 1.55, '铝')
    v.label(m, 7.2, 1.55, '铅')

    const lanes = [
      { y: 0.85, x: s.xa, on: v.p.showA, ion: v.p.ionA, kind: 'force', tag: 'α', end: 2.15 },
      { y: 0, x: s.xb, on: v.p.showB, ion: v.p.ionB, kind: 'charge', tag: 'β', end: 4.55 },
      { y: -0.85, x: s.xg, on: v.p.showG, ion: v.p.ionG, kind: 'field', tag: 'γ', end: 6.95 },
    ]
    lanes.forEach((lane) => {
      if (!lane.on) return
      const col = v.color[lane.kind]
      v.line(m, 0.35, lane.y, lane.end, lane.y, { color: col, dash: true })
      if (lane.ion && lane.x > 0.5) {
        const n = Math.max(1, Math.round(lane.x * 1.6))
        for (let i = 0; i < n; i++) {
          const px = 0.45 + (lane.x - 0.4) * (i + 0.5) / n
          v.circle(m, px, lane.y + 0.16, 0.035, { fill: col })
        }
      }
      if (lane.tag === 'γ') {
        v.photon(m, Math.max(0.15, lane.x - 0.55), lane.y, lane.x, lane.y, { still: true })
      } else if (lane.tag === 'α') {
        v.ball(m, lane.x, lane.y, 0.13, { charge: true, label: 'α' })
      } else {
        v.ball(m, lane.x, lane.y, 0.09, { charge: true, label: 'β' })
      }
    })
    v.label(m, 0.15, 1.35, '源')
  },
})
</Sim>

<Figure title="核反应示意" height={220} size="narrow" params={["view"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 6.4, ymin: 0, ymax: 2.4, equal: true })
    const wrong = p.view == 1 || p.view == 2
    v.ball(m, 1.15, 1.2, 0.42, { label: 'C' })
    v.label(m, 1.15, 0.45, '¹²₆C')
    if (wrong) {
      v.ball(m, 2.55, 1.2, 0.16, { charge: true, label: 'β' })
    } else {
      v.ball(m, 2.55, 1.2, 0.28, { charge: true, label: 'α' })
    }
    v.arrow(m, 3.15, 1.2, 3.85, 1.2, { color: v.color.ink })
    v.ball(m, 4.7, 1.2, 0.5, { label: 'O' })
    v.label(m, 4.7, 0.4, '¹⁶₈O')
    v.label(m, 5.85, 1.85, wrong ? 'Z、A 不守恒' : 'Z、A 守恒')
  },
})
</Figure>

<Readout items={[
  {label: "Y 的电荷数", symbol: "Z", expr: "2", unit: ""},
  {label: "Y 的质量数", symbol: "A", expr: "4", unit: ""}
]} />

点 A 或 C 时，画面只比较射程：$\beta$ 在铝板前停下，$\alpha$ 在纸板前停下，$\gamma$ 都走到铅板。穿透能力是 $\gamma > \beta > \alpha$，所以 A、C 的后半句都不对。

点 B 或 D 时，轨迹上的点表示沿途电离。$\alpha$ 走得最近、点最密，$\gamma$ 走得最远、点最稀，电离能力是 $\alpha > \beta > \gamma$。B 的电离比较本身没错，错在把 Y 说成 $\beta$。

## 答案

Y 的电荷数是 $2$、质量数是 $4$，是 $\alpha$ 粒子；$\alpha$ 射线电离能力比 $\gamma$ 射线强，穿透能力比 $\gamma$ 射线弱。选 $\boxed{\mathrm{D}}$。

<Answer items={[{label: "答案", text: "D"}]} />
