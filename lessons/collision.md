---
id: collision
title: 弹性碰撞和非弹性碰撞
subject: physics
topic: 碰撞
source: 选择性必修第一册 第一章 第 5 节
question: |
  同样是动量守恒，为什么有的碰撞弹开、有的粘住？碰后两物体怎么动？
answers:
  - { name: vc, value: 0.4, unit: m/s }
---

这节课的问题：同样是动量守恒，为什么有的碰撞弹开、有的粘住？

<Param name="beat" hidden value={0} />

<Param name="surf" hidden value={0} />

<Param name="va" hidden value={0.198} />

<Param name="vb" hidden value={0.792} />

<Define name="vc" expr="(0.4*0.6)/(0.4+0.2)" />

<Param name="b2m1" hidden value={0.2} />

<Param name="b2m2" hidden value={0.2} />

<Param name="b2a" hidden value={0} />

<Param name="b2b" hidden value={0.594} />

<Act title="弹开的碰撞，动能会怎样" />

<Step title="先确认：动量和动能怎么算" />

<Stem text="质量 0.2 kg 的小车以 0.60 m/s 向左运动，取向右为正。" ask="它的动量和动能分别是多少？" />

先确认两个量怎么算：动量和动能。

<Choice hints={["动量有方向，动能没有。", "向左、取向右为正，所以 v = −0.60 m/s。", "动量 p = mv；动能 ½mv²，别漏了 ½。"]} options={[
  { text: "−0.12 kg·m/s，0.036 J", correct: true, say: "对。p = mv = 0.2 × (−0.60) = −0.12，动能 ½mv² = 0.036 J。" },
  { text: "0.12 kg·m/s，0.036 J", say: "动量有方向：向左、取向右为正，动量是负的。" },
  { text: "−0.12 kg·m/s，−0.036 J", say: "动能只有大小，v² 不会是负的，动能不能为负。" },
  { text: "−0.12 kg·m/s，0.072 J", say: "漏了 ½。动能是 ½mv² = 0.5 × 0.2 × 0.60² = 0.036 J。" }
]} />

<Step title="弹开的碰撞，动能会怎样" />

<Sim title="假如碰后粘在一起" height={280} duration={3} playSeconds={5} params={["beat"]}>
sim({
  at(t) { return { t } },
  draw(ctx, s, v) {
    const W = v.width, H = v.height, C = v.color, t = s.t
    const m = v.view({ xmin: 0, xmax: W, ymin: -H, ymax: 0, pad: 0 })
    const r = Math.max(20, Math.min(30, W * 0.045)), yc = H * 0.5
    const x0 = W * 0.2, gap = 130, tc = 1.3, v1 = gap / tc
    // 碰前：A 以 v 滑向静止的 B；碰后：粘在一起，以 v/2 一起滑
    const xa = t < tc ? x0 + v1 * t : x0 + gap + (v1 / 2) * (t - tc)
    const xb = x0 + gap + 2 * r + (t < tc ? 0 : (v1 / 2) * (t - tc))
    v.ground(m, 12, W - 12, -(yc + r + 2), {})
    v.ball(m, xa, -yc, r, { label: 'A' })
    v.ball(m, xb, -yc, r, { label: 'B' })
    if (t < tc) {
      v.vec(m, xa + r + 6, -yc, 64, 0, { label: 'v' })
    } else {
      v.vec(m, xb + r + 6, -yc, 32, 0, { label: 'v/2' })
      v.text(m, W / 2, -(yc + r + 52), '粘在一起：动能 ½mv² → ¼mv²，少了一半', { size: 15, color: C.ink, align: 'center' })
    }
    v.text(m, W / 2, -(yc - r - 44), t < tc ? '碰前：A 以 v 滑向静止的 B' : '碰后：粘在一起，以 v/2 一起滑', { size: 13, color: C.graphite, align: 'center' })
  },
})
</Sim>

上一节最后算过：两只一样重的冰壶，碰后若粘在一起，动能少了一半。

那碰后弹开的碰撞呢？先记下你的猜想，选了就不能改。

<Choice predict name="g2" ask="碰后弹开的碰撞，动能会怎样？" options={[
  { text: "不变：弹开说明没有损失", say: "先记下你的猜想。", check: "不一定：磁体那次几乎不变，橡皮那次少了约四分之一。" },
  { text: "有的不变，有的减少", correct: true, say: "先记下你的猜想。", check: "对：磁体那次几乎不变，橡皮那次少了约四分之一。" },
  { text: "也减少一半", say: "先记下你的猜想。", check: "连粘扣这次也只少了约三分之一，弹开的两次少得更少。" }
]} />

<Step title="先排一排，再撞三次" play={2} />

<Collision m={[0.4, 0.2]} v={[0.6, 0]} after={["va", "vb"]} surface="surf" label="模拟数据" bars="beat >= 2" />

还是第 1 节的两辆车：0.4 kg 的 A 以 0.60 m/s 撞静止的 0.2 kg 的 B。

碰撞面有三种：磁体、橡皮碰后弹开，粘扣碰后粘住。先排一排碰后的动能。

<Choice predict name="g3" ask="碰后总动能，从多到少怎么排？" options={[
  { text: "三种一样多", say: "先记下你的排序。", check: "动量和一样，可动能和不一样：98% > 74% > 65%。" },
  { text: "磁体 = 橡皮 > 粘扣", say: "先记下你的排序。", check: "橡皮也弹开了，动能却只剩 74%，比磁体的 98% 少。" },
  { text: "磁体 > 橡皮 > 粘扣", correct: true, say: "先记下你的排序。", check: "98% > 74% > 65%，弹开的两次也不一样。" }
]} />

下面是模拟数据：三种碰撞面各撞一次，验证你的排序。

<Lab runs={[
  { label: "磁体", set: { surf: 0, va: 0.198, vb: 0.792 } },
  { label: "橡皮", set: { surf: 1, va: 0.297, vb: 0.594 } },
  { label: "粘扣", set: { surf: 2, va: 0.396, vb: 0.396 } }
]} columns={[
  { label: "动量和（kg·m/s）", expr: "0.4*va + 0.2*vb", digits: 3 },
  { label: "动能和（J）", expr: "0.2*va^2 + 0.1*vb^2", digits: 3 },
  { label: "动能占碰前（%）", expr: "(0.2*va^2 + 0.1*vb^2) / 0.072 * 100", digits: 0 }
]} first={["碰前", "0.240", "0.072", "100"]} />

<Recall choice="g3" />

三次的动量和都约 0.24 kg·m/s，动量守恒；动能和却各不相同。

磁体几乎没少，粘扣少了约三分之一。

橡皮看着挺有弹性，动能却少了约四分之一。

再看上一步你对弹开的猜想。

<Recall choice="g2" />

<Conclude title="弹开 ≠ 动能不变" text="碰后弹开，动能不一定不变。" />

<Act title="三种碰撞" />

<Step title="挤得最紧的那一刻" play={2} />

<Sim title="碰撞那一下：压紧" height={340} duration={1.8} playSeconds={4} params={["beat"]}>
const HALF = true, OFFSET = 0, HEATBEAT = 99
const T0 = 1.0, TC = 1.6, T2 = 1.4, KMIN = 0.048, K0 = 0.072
const TEND = T0 + TC + T2
const KINDS = [
  { name: '磁体', e: 1, dash: [], kf: 0.0705672, note: '完全弹回' },
  { name: '橡皮', e: 0.5, dash: [6, 4], kf: 0.0529254, note: '弹回一部分' },
  { name: '粘扣', e: 0, dash: [2, 3], kf: 0.0470448, note: '不弹回' },
]
const squeezeAt = (u, e) => (u <= 0.5 ? Math.sin(Math.PI * u) : 1 - e * (1 - Math.sin(Math.PI * u)))
const keAt = (t, kd) => {
  if (t <= T0) return K0
  if (t >= T0 + TC) return kd.kf
  const u = (t - T0) / TC
  return u <= 0.5 ? K0 - (K0 - KMIN) * Math.sin(Math.PI * u) : kd.kf - (kd.kf - KMIN) * Math.sin(Math.PI * u)
}
sim({
  at(t, p) { return { t: Math.min(t + OFFSET, TEND), beat: p.beat } },
  draw(ctx, s, v) {
    const W = v.width, H = v.height, C = v.color, tt = s.t
    const m = v.view({ xmin: 0, xmax: W, ymin: -H, ymax: 0, pad: 0 })
    const narrow = W < 520
    const colW = (W - 16) / 3, sz = narrow ? 20 : 28, L0 = narrow ? 26 : 38, X = L0 * 0.6, G0 = colW * 0.22
    const cy = narrow ? 70 : 84
    const mid = T0 + TC * 0.5
    KINDS.forEach((kd, i) => {
      const cx = 8 + colW * (i + 0.5)
      let d, rest
      if (tt <= T0) { d = L0 + G0 * (1 - tt / T0); rest = L0 }
      else if (tt <= T0 + TC) { d = L0 - X * squeezeAt((tt - T0) / TC, kd.e); rest = d }
      else { rest = L0 - X * (1 - kd.e); d = rest + kd.e * (G0 / T0) * (tt - T0 - TC) }
      const ax = cx - d / 2, bx = cx + d / 2
      const floor = -(cy + sz / 2)
      v.cart(m, ax - sz * 1.6, floor, sz * 1.6, sz, {})
      v.cart(m, bx, floor, sz * 1.6, sz, {})
      const lost = HALF ? false : kd.e < 1 && (kd.e === 0 ? tt > mid : tt > T0 + TC)
      const len = Math.max(2, Math.min(d, rest))
      if (lost) {
        // 弹不回去的部分：压扁的垫子；锁定之后再加发热纹路
        const ph = sz * 0.5
        ctx.save(); ctx.globalAlpha = 0.4
        v.rect(m, ax, -(cy + ph / 2), len, ph, { fill: C.graphite })
        ctx.restore()
        if (s.beat >= HEATBEAT) {
          for (let j = 0; j < 3; j++) {
            const hx = ax + len * (j + 1) / 4, hy = -(cy - ph / 2 - 3)
            v.path(m, [[hx, hy], [hx - 3, hy + 4], [hx + 3, hy + 7], [hx, hy + 11]], { color: C.charge, width: 1.4 })
          }
        }
      } else {
        v.spring(m, ax, -cy, ax + len, -cy, { coils: 6 })
      }
      v.text(m, cx, -(cy - sz / 2 - 18), kd.name, { size: 14, color: C.graphite, align: 'center' })
      if (!HALF && tt > mid) v.text(m, cx, -(cy + sz / 2 + 18), kd.note, { size: 13, color: C.graphite, align: 'center' })
    })
    // 总动能–时间
    const top = cy + sz / 2 + 44
    const bw = Math.min(W - 16, 640)
    const L = 8 + 44, R = 8 + bw - (narrow ? 72 : 96), T = top + 24, B = H - 26, KMAX = 0.08
    const X_ = (q) => L + (R - L) * q / TEND
    const Y_ = (k) => -(B - (B - T) * k / KMAX)
    ctx.save(); ctx.globalAlpha = 0.08
    v.rect(m, X_(T0), Y_(0), X_(T0 + TC) - X_(T0), B - T, { fill: C.steel })
    ctx.restore()
    v.line(m, L, -(T - 6), L, Y_(0), { color: C.steel })
    v.line(m, L, Y_(0), R + 6, Y_(0), { color: C.steel })
    v.line(m, L, Y_(K0), R, Y_(K0), { color: C.hairline, dash: [3, 3] })
    v.text(m, 8, -(top + 8), '总动能（J）', { size: 13, color: C.graphite, align: 'left' })
    v.text(m, (X_(T0) + X_(T0 + TC)) / 2, -(T - 10), '接触（慢放）', { size: 13, color: C.graphite, align: 'center' })
    v.text(m, R + 10, Y_(0), '时间', { size: 13, color: C.graphite, align: 'left' })
    v.text(m, L - 6, Y_(0), '0', { size: 13, color: C.graphite, align: 'right' })
    v.text(m, L - 6, Y_(K0), '0.072', { size: 13, color: C.graphite, align: 'right' })
    v.text(m, L + 6, Y_(K0) - 12, '碰前', { size: 13, color: C.graphite, align: 'left' })
    if (tt >= mid) {
      v.line(m, L, Y_(KMIN), R, Y_(KMIN), { color: C.hairline, dash: [3, 3] })
      v.text(m, L - 6, Y_(KMIN), '0.048', { size: 13, color: C.graphite, align: 'right' })
      v.text(m, X_(mid), Y_(KMIN) - 16, '挤得最紧', { size: 13, color: C.graphite, align: 'center' })
    }
    KINDS.forEach((kd) => {
      const pts = []
      for (let q = 0; q <= tt + 1e-9; q += TEND / 160) pts.push([X_(q), Y_(keAt(q, kd))])
      if (pts.length > 1) v.path(m, pts, { color: C.charge, width: 2, dash: kd.dash.length ? kd.dash : undefined })
    })
    if (!HALF && tt >= T0 + TC + T2 * 0.3) {
      const ys = []
      KINDS.forEach((kd) => {
        let y = Y_(kd.kf)
        ys.forEach((y0) => { if (Math.abs(y - y0) < 15) y = y0 - 15 })
        ys.push(y)
        v.text(m, R + 10, y, kd.name + ' ' + kd.kf.toFixed(3), { size: 13, color: C.graphite, align: 'left' })
      })
    }
  },
})
</Sim>

把碰撞那一下放大、放慢：两车的碰撞面互相挤压。

挤得最紧的那一刻，两车的速度有什么关系？先记下你的猜想。

<Choice predict name="g4" ask="挤得最紧的那一刻，两车的速度？" options={[
  { text: "两车都停下一瞬", say: "先记下你的猜想。", check: "不会停：总动量 0.24 kg·m/s 要保持，两车共速 0.40 m/s。" },
  { text: "两车一样快", correct: true, say: "先记下你的猜想。", check: "对：不再靠近、还没分开，共速 0.40 m/s，动能 0.048 J。" },
  { text: "A 已经停下，B 开始走", say: "先记下你的猜想。", check: "那时两车之间已有空隙，不是挤得最紧。" }
]} />

<Recall choice="g4" />

动能从 0.072 J 剩下 0.048 J，少掉的 0.024 J 暂时存了起来。

橡皮、粘扣存进被压扁的形变，磁体存进两块磁铁相斥的磁场。

总动量 0.24 kg·m/s 要保持，共速不能是 0，所以粘住也不会停下。

只有总动量为零时，粘住后才会一起停下，动能才全部损失。

<Conclude title="粘住：最多，一般不是全部" text="粘住也不会损失全部动能：总动量要保持，两物体只能一起运动。只有总动量为零时才全部损失。" blank="粘住：动能一般 ___ 全部损失" />

<Step title="弹不回的去哪了" play={1} />

<Sim title="碰撞那一下：放开" height={340} duration={2.2} playSeconds={5} params={["beat"]}>
const HALF = false, OFFSET = 1.8, HEATBEAT = 4
const T0 = 1.0, TC = 1.6, T2 = 1.4, KMIN = 0.048, K0 = 0.072
const TEND = T0 + TC + T2
const KINDS = [
  { name: '磁体', e: 1, dash: [], kf: 0.0705672, note: '完全弹回' },
  { name: '橡皮', e: 0.5, dash: [6, 4], kf: 0.0529254, note: '弹回一部分' },
  { name: '粘扣', e: 0, dash: [2, 3], kf: 0.0470448, note: '不弹回' },
]
const squeezeAt = (u, e) => (u <= 0.5 ? Math.sin(Math.PI * u) : 1 - e * (1 - Math.sin(Math.PI * u)))
const keAt = (t, kd) => {
  if (t <= T0) return K0
  if (t >= T0 + TC) return kd.kf
  const u = (t - T0) / TC
  return u <= 0.5 ? K0 - (K0 - KMIN) * Math.sin(Math.PI * u) : kd.kf - (kd.kf - KMIN) * Math.sin(Math.PI * u)
}
sim({
  at(t, p) { return { t: Math.min(t + OFFSET, TEND), beat: p.beat } },
  draw(ctx, s, v) {
    const W = v.width, H = v.height, C = v.color, tt = s.t
    const m = v.view({ xmin: 0, xmax: W, ymin: -H, ymax: 0, pad: 0 })
    const narrow = W < 520
    const colW = (W - 16) / 3, sz = narrow ? 20 : 28, L0 = narrow ? 26 : 38, X = L0 * 0.6, G0 = colW * 0.22
    const cy = narrow ? 70 : 84
    const mid = T0 + TC * 0.5
    KINDS.forEach((kd, i) => {
      const cx = 8 + colW * (i + 0.5)
      let d, rest
      if (tt <= T0) { d = L0 + G0 * (1 - tt / T0); rest = L0 }
      else if (tt <= T0 + TC) { d = L0 - X * squeezeAt((tt - T0) / TC, kd.e); rest = d }
      else { rest = L0 - X * (1 - kd.e); d = rest + kd.e * (G0 / T0) * (tt - T0 - TC) }
      const ax = cx - d / 2, bx = cx + d / 2
      const floor = -(cy + sz / 2)
      v.cart(m, ax - sz * 1.6, floor, sz * 1.6, sz, {})
      v.cart(m, bx, floor, sz * 1.6, sz, {})
      const lost = HALF ? false : kd.e < 1 && (kd.e === 0 ? tt > mid : tt > T0 + TC)
      const len = Math.max(2, Math.min(d, rest))
      if (lost) {
        // 弹不回去的部分：压扁的垫子；锁定之后再加发热纹路
        const ph = sz * 0.5
        ctx.save(); ctx.globalAlpha = 0.4
        v.rect(m, ax, -(cy + ph / 2), len, ph, { fill: C.graphite })
        ctx.restore()
        if (s.beat >= HEATBEAT) {
          for (let j = 0; j < 3; j++) {
            const hx = ax + len * (j + 1) / 4, hy = -(cy - ph / 2 - 3)
            v.path(m, [[hx, hy], [hx - 3, hy + 4], [hx + 3, hy + 7], [hx, hy + 11]], { color: C.charge, width: 1.4 })
          }
        }
      } else {
        v.spring(m, ax, -cy, ax + len, -cy, { coils: 6 })
      }
      v.text(m, cx, -(cy - sz / 2 - 18), kd.name, { size: 14, color: C.graphite, align: 'center' })
      if (!HALF && tt > mid) v.text(m, cx, -(cy + sz / 2 + 18), kd.note, { size: 13, color: C.graphite, align: 'center' })
    })
    // 总动能–时间
    const top = cy + sz / 2 + 44
    const bw = Math.min(W - 16, 640)
    const L = 8 + 44, R = 8 + bw - (narrow ? 72 : 96), T = top + 24, B = H - 26, KMAX = 0.08
    const X_ = (q) => L + (R - L) * q / TEND
    const Y_ = (k) => -(B - (B - T) * k / KMAX)
    ctx.save(); ctx.globalAlpha = 0.08
    v.rect(m, X_(T0), Y_(0), X_(T0 + TC) - X_(T0), B - T, { fill: C.steel })
    ctx.restore()
    v.line(m, L, -(T - 6), L, Y_(0), { color: C.steel })
    v.line(m, L, Y_(0), R + 6, Y_(0), { color: C.steel })
    v.line(m, L, Y_(K0), R, Y_(K0), { color: C.hairline, dash: [3, 3] })
    v.text(m, 8, -(top + 8), '总动能（J）', { size: 13, color: C.graphite, align: 'left' })
    v.text(m, (X_(T0) + X_(T0 + TC)) / 2, -(T - 10), '接触（慢放）', { size: 13, color: C.graphite, align: 'center' })
    v.text(m, R + 10, Y_(0), '时间', { size: 13, color: C.graphite, align: 'left' })
    v.text(m, L - 6, Y_(0), '0', { size: 13, color: C.graphite, align: 'right' })
    v.text(m, L - 6, Y_(K0), '0.072', { size: 13, color: C.graphite, align: 'right' })
    v.text(m, L + 6, Y_(K0) - 12, '碰前', { size: 13, color: C.graphite, align: 'left' })
    if (tt >= mid) {
      v.line(m, L, Y_(KMIN), R, Y_(KMIN), { color: C.hairline, dash: [3, 3] })
      v.text(m, L - 6, Y_(KMIN), '0.048', { size: 13, color: C.graphite, align: 'right' })
      v.text(m, X_(mid), Y_(KMIN) - 16, '挤得最紧', { size: 13, color: C.graphite, align: 'center' })
    }
    KINDS.forEach((kd) => {
      const pts = []
      for (let q = 0; q <= tt + 1e-9; q += TEND / 160) pts.push([X_(q), Y_(keAt(q, kd))])
      if (pts.length > 1) v.path(m, pts, { color: C.charge, width: 2, dash: kd.dash.length ? kd.dash : undefined })
    })
    if (!HALF && tt >= T0 + TC + T2 * 0.3) {
      const ys = []
      KINDS.forEach((kd) => {
        let y = Y_(kd.kf)
        ys.forEach((y0) => { if (Math.abs(y - y0) < 15) y = y0 - 15 })
        ys.push(y)
        v.text(m, R + 10, y, kd.name + ' ' + kd.kf.toFixed(3), { size: 13, color: C.graphite, align: 'left' })
      })
    }
  },
})
</Sim>

接着看后半段：压到最紧之后，碰撞面放开。

磁体完全弹回，碰后动能 0.071 J；橡皮弹回一部分，0.053 J。

粘扣不弹回，停在 0.047 J，和挤得最紧时的 0.048 J 差不多。

粘扣那次，暂时存起来的 0.024 J 一点也没还回来。它去哪了？

<Choice predict name="g5" ask="粘扣那次，没还回来的 0.024 J 去哪了？" options={[
  { text: "消失了：能量不守恒", say: "先记下你的猜想。", check: "钩和绒毛被压弯、互相摩擦，这部分能量变成了热。" },
  { text: "还存在形变里，以后会弹出来", say: "先记下你的猜想。", check: "存着的能量会把东西推开；两车一直粘着走，没有东西在推。" },
  { text: "变成了内能，总能量守恒", correct: true, say: "先记下你的猜想。", check: "对：弹不回去的部分变成内能，总能量守恒。" }
]} />

<Recall choice="g5" />

压弯的钩和绒毛不会自己弹回去，这部分变成了内能：发热、凹痕、声音。

锤子连着敲一根铁钉，铁钉会烫手，每一下都是这样的碰撞。

一次只有 0.024 J，太少了，一下摸不出来。

能量没有消失，只是从动能换成了内能，总能量守恒。

<Conclude title="少掉的动能去哪了" text="弹不回去的部分变成内能（发热、凹痕、声音），总能量守恒。" under="按动能分三类" />

<Step title="按动能分三类" />

三种碰撞，总动量都守恒；分类看存起来的动能还回多少。

<Def rows={[
  { name: "弹性碰撞", text: "存起来的能量全部还回动能，总动能不变" },
  { name: "非弹性碰撞", text: "只还回一部分，总动能减少" },
  { name: "完全非弹性碰撞", text: "不还回，碰后一起运动；非弹性里动能损失最多的一种", note: "教材只分弹性、非弹性两类" }
]} />

完全非弹性按运动结果定义：碰后两物体同速。

<Conclude title="按动能分三类" text="三种碰撞总动量都守恒，按动能的结局分：弹性，存起来的能量全部还回动能，总动能不变；非弹性，只还回一部分，总动能减少；完全非弹性，不还回、碰后一起运动，是非弹性里动能损失最多的一种。" settles="弹开 ≠ 动能不变" result="holds" />

<Step title="小林说橡皮那次才算弹性碰撞" />

<Stem text="小林说：「橡皮比磁体有弹性多了，所以橡皮那次才算弹性碰撞。」" ask="你同意吗？" />

小林这样说，你同意吗？先记下你的猜想。

<Choice predict name="g6" options={[
  { text: "同意：橡皮比磁体有弹性", say: "先记下你的猜想。", check: "磁体那次动能几乎没少，橡皮那次少了约 26%。" },
  { text: "不同意：橡皮那次动能少了约 26%", correct: true, say: "先记下你的猜想。", check: "对：橡皮那次动能少了约 26%，是非弹性碰撞。" },
  { text: "不同意：弹开的都是弹性碰撞", say: "先记下你的猜想。", check: "弹开不等于弹性：橡皮弹开了，动能却少了约 26%。" }
]} />

<Recall choice="g6" />

生活里说「有弹性」，常指软、容易拉长，比如橡皮筋。

<Def rows={[{ name: "生活里的弹性", text: "常指软、容易拉长；物理里指被压、被撞后能恢复原样" }]} />

物理里说一个物体有弹性，是指它被压、被撞以后能恢复原样。

这样说，钢比橡皮更有弹性。

碰撞的弹性还要多一条：存起来的能量要全部还回动能。

橡皮恢复原样时，有一部分能量在内部变成了热：反复捏一块橡皮，它会变热。

所以那次动能少了约 26%：判断碰撞类型看动能，不看材料。

<Conclude title="弹性看动能，不看材料" text="碰撞的「弹性」看存起来的能量是否全部还回动能，不看材料软不软：橡皮能恢复原样，那次动能却少了约 26%。" />

<Act title="弹性碰撞后怎么动" />

<Step title="一样重的两车，弹性碰撞" play={1} />

<Collision m={[0.2, 0.2]} v={[0.6, 0]} after={[0, 0.594]} surface="magnet" label="一样重，碰撞面装磁体" />

换成两辆一样重的车，各 0.2 kg，碰撞面装磁体，是弹性碰撞。

<Choice predict name="g7" ask="A 以 0.60 m/s 撞静止的 B，碰后怎样？" options={[
  { text: "A 停下，B 以 0.60 m/s 前进", correct: true, say: "先记下你的猜想。", check: "动量 0.12 → 0 + 0.12；动能 0.036 J → 0 + 0.036 J。" },
  { text: "A、B 各以 0.30 m/s 前进", say: "先记下你的猜想。", check: "动量对；动能 0.036 J → 0.018 J，只剩一半，那是粘住的结果。" },
  { text: "A 以 0.60 m/s 弹回，B 不动", say: "先记下你的猜想。", check: "动量从 +0.12 变成 −0.12，不守恒，不可能。" },
  { text: "A、B 都以 0.60 m/s 前进", say: "先记下你的猜想。", check: "动量从 0.12 翻成 0.24，不守恒，不可能。" }
]} />

看模拟数据：A 停下，B 以 0.594 m/s 前进。

<Recall choice="g7" />

A 的动能从 0.036 J 变成 0，B 的从 0 变成 0.036 J。

各自都变了，不变的是两车的总和。

被碰的物体原来静止，一样重的弹性正碰：交换速度。

<Conclude title="一样重：交换速度" text="被碰的物体原来静止，一样重的弹性正碰：交换速度" under="弹性正碰公式" guess />

<Step title="轻的撞重的，弹性碰撞" play={1} />

<Collision m={[0.2, 0.4]} v={[0.6, 0]} after={[-0.197, 0.396]} surface="magnet" label="轻车撞重车，碰撞面装磁体" />

再换：0.2 kg 的 A 以 0.60 m/s 撞静止的 0.4 kg 的 B，还是弹性碰撞。

<Choice predict name="g8" ask="碰后 A 怎样？" options={[
  { text: "A 停下，B 以 0.30 m/s 前进", say: "先记下你的猜想。", check: "动量守住；动能 0.036 J → 0.018 J，只剩一半。" },
  { text: "A 减速，继续向前", say: "先记下你的猜想。", check: "B 要比 A 快，两车动能加起来不到 0.018 J，连一半都不到。" },
  { text: "A 被弹回", correct: true, say: "先记下你的猜想。", check: "动量 0.120 → 0.119，动能 0.036 → 0.035 J，都守住了。" },
  { text: "两车一起以 0.20 m/s 前进", say: "先记下你的猜想。", check: "动量守住；一起走是粘住了，动能只剩 0.012 J。" }
]} />

看模拟数据：A 以 0.197 m/s 被弹回，B 以 0.396 m/s 前进。

<Recall choice="g8" />

B 带走的动量约 0.4 × 0.396 ≈ 0.158 kg·m/s，比两车的总动量 0.120 还多。

A 只能带负的动量，就是往回走：重的那辆像一堵会动的墙。

<Conclude title="轻撞重：轻的弹回" text="轻的撞静止的重的（弹性），轻的被弹回" under="弹性正碰公式" guess />

<Act title="弹性碰撞的公式" />

<Step title="把三种情况放进一个式子" />

质量 $m_1$ 的物体以 $v_1$ 弹性正碰静止的 $m_2$，用两条规律求碰后速度。

<Work blocks={[
  { title: "两条规律", lines: [
    { eq: "$m_1v_1 = m_1v_1' + m_2v_2'$", note: "动量守恒" },
    { eq: "$\\tfrac12 m_1v_1^2 = \\tfrac12 m_1v_1'^2 + \\tfrac12 m_2v_2'^2$", note: "动能不变" }
  ] },
  { title: "移项，下式除以上式", lines: [
    { eq: "$m_1(v_1 - v_1') = m_2v_2'$" },
    { eq: "$m_1(v_1^2 - v_1'^2) = m_2v_2'^2$" },
    { eq: "$v_1 + v_1' = v_2'$" }
  ] },
  { title: "代回动量式", lines: [
    { eq: "$v_1' = \\frac{m_1 - m_2}{m_1 + m_2}\\,v_1$" },
    { eq: "$v_2' = \\frac{2m_1}{m_1 + m_2}\\,v_1$" }
  ] }
]} />

两式各自移项，下式除以上式，得到 $v_1 + v_1' = v_2'$。

代回动量式，解出两个速度。

<Choice ask="先检验：用公式算一样重（$m_1 = m_2$）的情况，结果是什么？" hints={[
  "把 $m_2$ 换成 $m_1$。",
  "$v_1'$ 的分子 $m_1 - m_2 = 0$。",
  "$v_2' = 2m_1v_1/(2m_1) = v_1$。"
]} options={[
  { text: "$v_1' = 0$，$v_2' = v_1$", correct: true, say: "对。$m_1 - m_2 = 0$，$2m_1/(m_1 + m_2) = 1$：交换速度。" },
  { text: "$v_1' = v_2' = v_1/2$", say: "代一代：$m_1 = m_2$ 时 $v_1'$ 是 0。各一半是粘住的结果。" },
  { text: "$v_1' = -v_1$，$v_2' = 0$", say: "那是撞墙（$m_2$ 极大）的情况。$m_1 = m_2$ 时，$v_1'$ 的分子是 0。" }
]} />

和上一幕一样重的那次对上了。

<Conclude title="弹性正碰公式" text="$m_1$ 以 $v_1$ 弹性正碰静止的 $m_2$：$v_1' = \frac{m_1 - m_2}{m_1 + m_2}v_1$，$v_2' = \frac{2m_1}{m_1 + m_2}v_1$" />

再代另外两组数据，公式算的和模拟数据也对得上。

<Lab filled runs={[
  { label: "0.2 / 0.2 kg", set: { b2m1: 0.2, b2m2: 0.2, b2a: 0, b2b: 0.594 } },
  { label: "0.4 / 0.2 kg", set: { b2m1: 0.4, b2m2: 0.2, b2a: 0.198, b2b: 0.792 } },
  { label: "0.2 / 0.4 kg", set: { b2m1: 0.2, b2m2: 0.4, b2a: -0.197, b2b: 0.396 } }
]} columns={[
  { label: "公式 v₁′", expr: "(b2m1 - b2m2) / (b2m1 + b2m2) * 0.6", digits: 2 },
  { label: "公式 v₂′", expr: "2 * b2m1 / (b2m1 + b2m2) * 0.6", digits: 2 },
  { label: "模拟数据 v₁′", expr: "b2a", digits: 3 },
  { label: "模拟数据 v₂′", expr: "b2b", digits: 3 }
]} />

<Conclude title="一样重：公式的特例" text="$m_1 = m_2$ 时 $v_1' = 0$、$v_2' = v_1$，就是交换速度，是弹性正碰公式的特例" under="弹性正碰公式" settles="一样重：交换速度" result="holds" />

<Conclude title="轻撞重：公式的特例" text="$m_1 < m_2$ 时 $v_1' < 0$，轻的被弹回，也是弹性正碰公式的特例" under="弹性正碰公式" settles="轻撞重：轻的弹回" result="holds" />

<Step title="质量差得很多时" play={1} />

<Sim title="铅球撞乒乓球" height={300} duration={4} params={["beat"]} note="弹性正碰，被碰的静止">
sim({
  at(t, p) {
    const u = 1.2, rA = 0.5, rB = 0.2, xa0 = 0.9, xb0 = 3.8
    const tc = (xb0 - rB - rA - xa0) / u
    if (t < tc) return { xa: xa0 + u * t, xb: xb0, hit: false }
    const d = t - tc
    return { xa: xa0 + u * tc + 0.98 * u * d, xb: xb0 + 1.98 * u * d, hit: true }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -0.3, xmax: 10, ymin: -3.5, ymax: 1.9 })
    v.ground(m, -0.3, 10, 0)
    v.ball(m, s.xa, 0.5, 0.5, { label: '铅球' })
    v.ball(m, s.xb, 0.2, 0.2, { label: '乒乓球' })
    if (!s.hit) {
      v.vec(m, s.xa, 1.3, 1.1, 0, { label: 'v' })
    } else {
      v.vec(m, s.xa, 1.3, 1.1, 0, { label: '≈ v' })
      v.vec(m, Math.min(s.xb, 7.6), 0.8, 2.2, 0, { label: '≈ 2v' })
    }
    if (v.p.beat >= 2) {
      const gy = -3.0
      v.ground(m, -0.3, 10, gy)
      v.wall(m, 9.5, gy, gy + 1.3, { side: 'right' })
      v.ball(m, 8.9, gy + 0.2, 0.2)
      v.vec(m, 6.9, gy + 0.8, 1.8, 0, { label: '撞墙前 v' })
      v.vec(m, 8.7, gy + 1.3, -1.8, 0, { label: '弹回 ≈ v' })
      v.label(m, 4.2, gy + 0.55, '墙：质量极大的 m₂')
    }
  },
})
</Sim>

很重的铅球以 $v$ 弹性正碰静止的乒乓球。

<Choice predict name="g10" ask="碰后乒乓球大约多快？" options={[
  { text: "约 $v$", say: "先记下你的猜想。", check: "原样传过去只在一样重时成立；这里 $2m_1/(m_1 + m_2)$ 接近 2。" },
  { text: "约 $2v$", correct: true, say: "先记下你的猜想。", check: "$m_1 \\gg m_2$ 时 $2m_1/(m_1+m_2) \\to 2$。" },
  { text: "略小于 $v$", say: "先记下你的猜想。", check: "轻球可以比撞它的快：磁体那次，B 的 0.792 比 A 原来的 0.60 m/s 快。" },
  { text: "约 $v/2$", say: "先记下你的猜想。", check: "铅球几乎不减速，乒乓球要比它快才分得开。" }
]} />

<Recall choice="g10" />

反过来，$m_1 \ll m_2$ 时，$v_1' \approx -v_1$，原速弹回。

第 1 节里小球撞墙原速弹回就是这样：墙是质量极大的 $m_2$。

<Conclude title="极限：约 2v / 原速弹回" text="$m_1 \gg m_2$：$m_2$ 以约 $2v_1$ 飞出。$m_1 \ll m_2$：$m_1$ 以约 $v_1$ 原速弹回" under="弹性正碰公式" />

<Act title="练习" />

<Step title="例题：重的撞轻的" play={4} />

<Collision m={[3, 1]} v={[4, 0]} after={[2, 6]} surface="magnet" bars="beat >= 5" digits={{ v: 0, p: 0, k: 0 }} />

<Stem label="情境" text="光滑水平面上，3 kg 的滑块 A 以 4 m/s 与静止的 1 kg 滑块 B 发生弹性正碰。" ask="求碰后两滑块的速度。" />

先看一道完整的例题。

策略：要用哪两条规律？为什么？

<Choice label="策略" hints={[
  "未知的有几个？",
  "$v_1'$、$v_2'$ 两个，要两个方程。",
  "弹性碰撞：动量守恒，总动能不变。"
]} options={[
  { text: "动量守恒，加上总动能不变", correct: true, say: "对。两个未知数，要两个方程；弹性碰撞两条都成立。" },
  { text: "只用动量守恒就够了", say: "动量守恒只有一个方程，解不出 $v_1'$、$v_2'$ 两个未知数。" },
  { text: "动量守恒，加上 A 的动能不变", say: "弹性碰撞守恒的是总动能，A 的动能会变：它把一部分给了 B。" }
]} />

解答：取 A 原来的运动方向为正，先列动量守恒。

<Work label="解答" lines={[
  { eq: "$3 \\times 4 = 3v_1' + 1 \\times v_2'$", note: "①动量" },
  { eq: "$\\tfrac12 \\times 3 \\times 4^2 = \\tfrac12 \\times 3v_1'^2 + \\tfrac12 \\times 1 \\times v_2'^2$", note: "②动能" },
  { eq: "$v_1' = 2\\ \\mathrm{m/s}$，$v_2' = 6\\ \\mathrm{m/s}$", note: "③联立，用公式" }
]} />

再列动能不变。

两式联立，就是第 4 幕推过的那一组，直接代公式：$v_1' = 2$ m/s，$v_2' = 6$ m/s。

核对：动量 12 = 3 × 2 + 1 × 6，动能 24 J = 6 J + 18 J，两条都守住了。

重的继续向前、变慢；轻的比 A 原来还快，但不到 2 倍，和上一幕的极限一致。

<Step title="渐退样例：这是哪一种碰撞？" play={1} />

<Collision m={[2, 1]} v={[3, 0]} after={[1.5, 3]} bars="beat >= 1" digits={{ v: 1, p: 1, k: 2 }} />

<Stem label="情境" text="光滑水平面上，2 kg 的 A 以 3 m/s 撞静止的 1 kg 的 B，碰后 A 以 1.5 m/s、B 以 3 m/s 沿原方向运动。" ask="这次碰撞是哪一种？" />

策略已经给出：先查动量守恒，再比较碰撞前后的总动能。

<Work label="策略" lines={[{ eq: "先查动量守恒，再比较碰撞前后的总动能" }]} />

先查动量：碰前碰后都是 6 kg·m/s，守恒。

<Work label="解答" lines={[
  { eq: "$2 \\times 3 = 2 \\times 1.5 + 1 \\times 3$，即 $6 = 3 + 3$", note: "①动量守恒" },
  { eq: "$E_{k0} = \\tfrac12 \\times 2 \\times 3^2 = 9\\ \\mathrm{J}$", note: "②碰前动能" }
]} />

再算碰前总动能 9 J。第三步你来：碰后总动能是多少？

<Choice ask="③碰后总动能是多少，是哪一种碰撞？" hints={[
  "先算碰后两个物体的动能，再相加。",
  "A：½ × 2 × 1.5² = 2.25 J，B：½ × 1 × 3² = 4.5 J。",
  "回看例题里的动能检验：碰后总动能和碰前比一比。"
]} options={[
  { text: "非弹性：9 J → 6.75 J", correct: true, say: "对。2.25 J + 4.5 J = 6.75 J，少了 2.25 J，是碰前的 1/4。" },
  { text: "弹性：碰后两球分开了", say: "分开不等于弹性。算一算动能：9 J → 2.25 J + 4.5 J。" },
  { text: "弹性：动量守恒，动能也不变", say: "三种碰撞动量都守恒，动能不一定不变。算一算：9 J → 6.75 J。" },
  { text: "完全非弹性碰撞", say: "完全非弹性要碰后同速。这里 A 是 1.5 m/s、B 是 3 m/s，没有粘住。" }
]} />

两球分开了，动能却少了 2.25 J，占碰前的 1/4：分开不等于弹性。

<Step title="挑战：乙追上甲" play={1} />

<Collision m={[1, 1]} v={[3, 1]} after={[1, 3]} surface="magnet" names={["乙", "甲"]} massText={["m", "m"]} label="改编自 2024 年广东卷第 10 题" bars="beat >= 1" digits={{ v: 0, p: 0, k: 0 }} />

<Stem text="光滑水平面上，两个相同的滑块同向运动，乙以 3 m/s 追上前面以 1 m/s 运动的甲，发生弹性碰撞。" ask="碰后两者的速度是？" />

甲原来也在动，公式不能直接套，用两条守恒去检查。

<Choice predict name="g13" options={[
  { text: "甲 3 m/s，乙 1 m/s", correct: true, say: "先记下你的猜想。", check: "交换速度：速度之和 4 → 4，平方和 10 → 10，两条都守住。" },
  { text: "甲 3 m/s，乙 0", say: "先记下你的猜想。", check: "速度之和 4 → 3，动量不守恒；这是套了「被碰的静止」。" },
  { text: "甲、乙都是 2 m/s", say: "先记下你的猜想。", check: "动量对；平方和 10 → 8，动能少了，那是粘住的结果。" },
  { text: "甲 4 m/s，乙 0", say: "先记下你的猜想。", check: "动量对；平方和 10 → 16，动能凭空增加，不可能。" }
]} />

<Recall choice="g13" />

一样重时，两式约掉质量：速度之和不变，$3 + 1 = 4$；平方和不变，$3^2 + 1^2 = 10$。

和是 4、平方和是 10 的两个数只有 3 和 1：碰后要么原样，要么互换。

被碰的物体动不动，结果都一样。

<Conclude title="两个都在动：也交换" text="两物体都在动时，一样重的弹性正碰也交换速度：两式约掉质量，就是速度之和、平方和都不变，只能原样或互换" />

<Act title="收束" />

<Step title="补全结论区" />

结论区里有几处关键词被盖住了。不往回翻，你能补全吗？

<Fill mask={["按动能分三类", "粘住：最多，一般不是全部"]} rows={[
  { name: "弹性", text: "碰撞前后 {总动能|每个物体的动能|每个物体的速度} 不变；一样重时交换速度" },
  { name: "非弹性", text: "总动能减少，碰后可以分开" },
  { name: "完全非弹性", text: "碰后一起运动，动能减少 {最多|全部|最少}，一般不是全部" },
  { name: "三种都", text: "动量守恒" }
]} say={[
  [
    "对。弹性碰撞里，不变的是总动能。",
    "不对。A 的动能 0.036 J 变成 0，B 的 0 变成 0.036 J，各自都变，总和不变。",
    "不对。A 停下、B 动起来，速度也各自变了，不变的是总动能。"
  ],
  [
    "对。存起来的一点也不还，所以损失最多；总动量要保持，一般不是全部。",
    "不对。总动量要保持，粘住后两个物体还要一起走，除非总动量为零。",
    "不对。粘住时存起来的能量一点也不还，所以动能损失得最多。"
  ]
]} />

补全了。判断碰撞类型看总动能：不变是弹性，减少是非弹性，粘住减少最多。

三种碰撞，动量都守恒。

<Step title="回到冰壶" />

<Sim title="冰壶" height={190} duration={3.4} note="示意图，两只冰壶一样重" params={[]}>
sim({
  at(t, p) {
    const hit = 1.4
    const v0 = 1.5
    const xA = t < hit ? 0.8 + v0 * t : 0.8 + v0 * hit
    const xB = t < hit ? 3.6 : 3.6 + v0 * (t - hit)
    return { xA, xB, after: t >= hit }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: 0.2, xmax: 7.4, ymin: -0.6, ymax: 1.8, equal: true })
    v.ground(m, 0, 9, 0)
    v.ball(m, s.xA, 0.4, 0.4, { label: 'A' })
    v.ball(m, s.xB, 0.4, 0.4, { label: 'B' })
    if (!s.after) v.vec(m, s.xA, 1.25, 1.4, 0, { label: 'v' })
    else v.vec(m, s.xB, 1.25, 1.4, 0, { label: 'v' })
  },
})
</Sim>

再看第 1 节的冰壶：一样重，A 撞向静止的 B，A 停住，B 滑走。

<Choice ask="这是哪一种碰撞？" hints={[
  "先看碰后两个物体是不是同速。",
  "比一比碰前和碰后：谁在动，速度多大。",
  "碰前碰后都只有一个物体在动，速度一样大。"
]} options={[
  { text: "近似弹性碰撞", correct: true, say: "对。一样重，A 把速度交给了 B，总动能几乎没变。" },
  { text: "完全非弹性碰撞", say: ["不对。完全非弹性要看碰后是否同速。", "A 停住、B 滑走，两者不同速。"] },
  { text: "无法判断，没有给动能", say: ["能判断。一样重、交换了速度。", "碰前碰后都是一个物体以同样的速度在动，总动能没变，不用算。"] }
]} />

一样重、交换速度，这就是弹性碰撞的样子。

<Step title="把粘住倒过来：被弹簧弹开" play={1} />

<Sim title="弹簧弹开" height={210} duration={3} params={[]}>
sim({
  at(t, p) {
    return { dA: -0.36 * t, dB: 0.72 * t, t }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: 1.2, xmax: 9.2, ymin: -0.5, ymax: 2.4, equal: true })
    v.ground(m, 0, 10, 0)
    const aL = 3.2 + s.dA
    const aR = aL + 1.4
    const bL = 5.4 + s.dB
    const a = v.cart(m, aL, 0, 1.4, undefined, { label: 'A' })
    v.cart(m, bL, 0, 1.1, undefined, { label: 'B' })
    const sy = a.top - 0.12
    v.spring(m, aR, sy, Math.min(aR + 2.2, bL), sy, { coils: 8 })
    if (s.t < 0.02) {
      const ty = a.top + 0.3
      v.line(m, aR - 0.15, a.top, aR - 0.15, ty, { color: v.color.graphite, width: 1.2 })
      v.line(m, bL + 0.95, a.top, bL + 0.95, ty, { color: v.color.graphite, width: 1.2 })
      v.line(m, aR - 0.15, ty, bL + 0.95, ty, { color: v.color.graphite, width: 1.2 })
      v.label(m, (aR + bL) / 2, ty + 0.1, '细线', {})
    }
    if (s.t > 0.3) {
      v.vec(m, aL + 0.7, 1.9, -0.9, 0, { label: '0.30 m/s' })
      v.vec(m, bL + 0.55, 1.9, 1.8, 0, { label: '0.60 m/s' })
    }
  },
})
</Sim>

光滑导轨上，0.4 kg 的 A 和 0.2 kg 的 B 静止，中间夹一根压缩的弹簧，用细线拴住。

<Choice predict name="g15" ask="烧断细线，两车被弹开。总动量、总动能怎样？" options={[
  { text: "动量仍为 0，动能增加", correct: true, say: "先记下你的猜想。", check: "速度 0.30 和 0.60 m/s，动量仍为 0，动能增到 0.054 J。" },
  { text: "动量仍为 0，动能也不变", say: "先记下你的猜想。", check: "动能由 0 增到 0.054 J。动量守恒，动能不一定守恒。" },
  { text: "动量增加，两车都动起来了", say: "先记下你的猜想。", check: "动量有方向：−0.12 加 +0.12，总动量还是 0。" }
]} />

<Recall choice="g15" />

这正是第 2 幕粘扣那次的反面。拴住的弹簧真存着能量，线一断就把两车推开。

<Conclude title="被推开：动量仍为 0" text="没有“撞”，两车被弹簧推开：总动量仍为 0，总动能增加，来自弹簧的弹性势能。" />

粘扣碰后没有这样的能量，所以两车一直粘着走。

<Act title="小测" quiz />

<Step title="损失的动能去哪了" />

<Stem text="光滑水平面上，两个泥团相撞后粘在一起继续运动，总动能减少了。" ask="少掉的动能去哪了？" />

两个泥团相撞，粘在一起，动能少了。

<Choice hints={[
  "回想第 2 幕：弹不回去的那部分动能去了哪里。",
  "总能量是守恒的，少掉的动能一定变成了别的形式。",
  "泥团变形、发热，动能变成了内能。"
]} options={[
  { text: "消失了，能量不守恒", say: ["不对。能量守恒是普遍的。", "少掉的动能变成了别的形式的能。"] },
  { text: "转化为内能，总能量守恒", correct: true, say: "对。泥团变形、发热，动能变成了内能，总能量不变。" },
  { text: "仍存在泥团形变里，以后会弹出来", say: ["不对。存着的能量会把东西推开。", "可泥团一直粘着走，不会自己弹开。"] }
]} />

<Step title="粘住损失多少动能" />

<Collision still m={[1, 2]} v={[6, 0]} body="cart" />

<Stem text="光滑水平面上，$1\,\mathrm{kg}$ 的小车以 $6\,\mathrm{m/s}$ 撞静止的 $2\,\mathrm{kg}$ 小车，碰后粘在一起。" ask="损失了多少动能？" />

先求共同速度，再比较碰前碰后的动能。

<Choice hints={[
  "先用动量守恒求碰后的共同速度。",
  "$1 \\times 6 = (1 + 2)v$，共同速度 $2\\,\\mathrm{m/s}$。",
  "损失 = 碰前动能 − 碰后动能 = $18\\,\\mathrm{J} - 6\\,\\mathrm{J}$。"
]} options={[
  { text: "$12\\,\\mathrm{J}$", correct: true, say: "对。共同速度 2 m/s，动能由 18 J 变成 6 J，损失 12 J。" },
  { text: "$18\\,\\mathrm{J}$", say: ["不对。18 J 是碰前的动能。", "总动量要保持，碰后两车还在动。"] },
  { text: "$6\\,\\mathrm{J}$", say: "6 J 是碰后剩下的动能。损失的是 18 J 减去 6 J。" },
  { text: "$0$", say: ["不对。动量守恒，动能不一定守恒。", "粘住的碰撞，动能要减少。"] }
]} />

<Step title="光电门测碰撞" />

<Stem text="两辆相同的小车，各装宽 $1.00\,\mathrm{cm}$ 的遮光条。小车 1 静止，小车 2 前端贴上吸能材料去撞它。碰前小车 2 过光电门 A 用 $10.00\,\mathrm{ms}$；碰后小车 1、2 依次过光电门 B，用 $15.00\,\mathrm{ms}$、$30.00\,\mathrm{ms}$。" ask="这次碰撞是？" />

先由遮光条宽度和遮光时间，算出各个速度。

<Choice hints={[
  "遮光条宽度除以遮光时间，就是通过光电门的速度。",
  "碰前小车 2 是 $1\\,\\mathrm{m/s}$；碰后小车 1、2 约 $0.67$、$0.33\\,\\mathrm{m/s}$。",
  "两车一样重，动能之比就是速度平方之和之比。"
]} options={[
  { text: "非弹性，总动能约为碰前 56%", correct: true, say: ["对。动量 1 = 2/3 + 1/3，守恒。", "动能比 $(2/3)^2 + (1/3)^2 = 5/9 \\approx 0.56$。"] },
  { text: "弹性碰撞：碰后两车分开了", say: ["不对。分开不等于弹性。", "动量守恒，可总动能只剩约 56%。"] },
  { text: "非弹性，总动能约为碰前 44%", say: ["44% 只算了小车 1。", "要把两辆车的动能加起来。"] },
  { text: "完全非弹性碰撞：用了吸能材料", say: ["不对。完全非弹性要看碰后是否同速。", "两车碰后速度不同，是非弹性碰撞。"] }
]} />

<Step title="哪一步错了" />

<Stem text={"$0.1\\,\\mathrm{kg}$ 的小球以 $5\\,\\mathrm{m/s}$ 弹性正碰静止的 $0.4\\,\\mathrm{kg}$ 小球。小周的解答：\n\n① 动量：$0.1 \\times 5 = 0.1v_1' + 0.4v_2'$\n\n② 动能：$\\tfrac12 \\times 0.1 \\times 5^2 = \\tfrac12 \\times 0.1v_1'^2 + \\tfrac12 \\times 0.4v_2'^2$\n\n③ 两式移项相除，得 $5 + v_1' = v_2'$\n\n④ 代入①：$0.5 = 0.5v_1' + 2$，得 $v_1' = 3\\,\\mathrm{m/s}$\n\n⑤ $v_2' = 8\\,\\mathrm{m/s}$"} ask="哪一步错了？" />

小周的解答，一步一步看。

<Choice hints={[
  "把小周的得数代回①，看动量守不守恒。",
  "代回去，动量是 3.5，不等于 0.5。哪一步出了错？",
  "①②③都对，看④移项时的符号。"
]} options={[
  { text: "没有错", say: ["有错。轻的撞静止的重的，轻的该被弹回。", "代回动量式一查就发现。"] },
  { text: "③两式不能相除", say: ["能除。相除前约掉的 $v_1 - v_1'$ 不为 0。", "A 的速度确实变了，这一步正是第 4 幕推过的。"] },
  { text: "④移项符号错了", correct: true, say: ["对。应得 $0.5v_1' = -1.5$，即 $v_1' = -3\\,\\mathrm{m/s}$。", "再得 $v_2' = 2\\,\\mathrm{m/s}$，轻球被弹回。"] },
  { text: "②应写每个球的动能不变", say: ["不对。守恒的是总动能，两球各自的动能可以变。", "②写的正是总动能。"] }
]} />

<Step title="相向的弹性碰撞" />

<Collision still m={[1, 1]} v={[2, -1]} body="cart" massText={["m", "m"]} />

<Stem text="光滑水平面上，两个相同的滑块相向运动，A 以 $2\,\mathrm{m/s}$ 向右，B 以 $1\,\mathrm{m/s}$ 向左，发生弹性碰撞。" ask="碰后两者的速度是？" />

取向右为正，A 的速度是 2，B 的速度是 −1。

<Choice hints={[
  "一样重的弹性正碰，会交换速度吗？",
  "速度之和不变，平方和也不变：和是 1，平方和是 5。",
  "和为 1、平方和为 5 的两个数，只能是 2 和 −1，原样或互换。"
]} options={[
  { text: "A 向左 1 m/s，B 向右 2 m/s", correct: true, say: ["对。两个速度交换了。", "动量 2 − 1 = 1，碰后 −1 + 2 = 1，守恒。", "按每千克计，动能 2.5 J 不变。"] },
  { text: "A 停下，B 以 2 m/s 向右", say: "不对。动量由 +1 变成 +2，不守恒。" },
  { text: "两者都以 0.5 m/s 向右", say: ["动量对，动能由 2.5 J 变成 0.25 J。", "那是粘住的结果，不是弹性碰撞。"] },
  { text: "A 向左 2 m/s，B 向右 1 m/s", say: ["各自原速弹回，把对方当成墙。", "可动量由 +1 变成 −1，不守恒。"] }
]} />

<Step title="小测结果" />

<Result goals={[
  { title: "区分三种碰撞", items: [1, 3], back: 2 },
  { title: "由数据判断类型，算动能损失", items: [2, 3], back: 5 },
  { title: "求弹性正碰的碰后速度", items: [4, 5], back: 4 }
]} say={{ all: "全对，{n}/{total}。三种碰撞的分类、动能的算账、弹性正碰的速度，都过关了。", some: "答对 {n}/{total}。看看下面标出的目标，回去再看一遍。" }} />

<Step title="作业" />

课后做下面几题，答案点开看。

<Homework items={[
  { tag: "必做 1 · L1", q: "光滑水平面上，$0.5\\,\\mathrm{kg}$ 的小车以 $4\\,\\mathrm{m/s}$ 撞静止的 $1.5\\,\\mathrm{kg}$ 小车，碰后粘在一起。求共同速度和损失的动能。", a: "共同速度 $1\\,\\mathrm{m/s}$。动能由 $4\\,\\mathrm{J}$ 变成 $1\\,\\mathrm{J}$，损失 $3\\,\\mathrm{J}$。" },
  { tag: "必做 2 · L2", q: "光滑水平面上，$1\\,\\mathrm{kg}$ 的小球以 $6\\,\\mathrm{m/s}$ 弹性正碰静止的 $2\\,\\mathrm{kg}$ 小球。求碰后两球的速度，并验证动能不变。", a: "$1\\,\\mathrm{kg}$ 的以 $2\\,\\mathrm{m/s}$ 弹回，$2\\,\\mathrm{kg}$ 的以 $4\\,\\mathrm{m/s}$ 前进。动能 $18\\,\\mathrm{J} = 2\\,\\mathrm{J} + 16\\,\\mathrm{J}$。" },
  { tag: "必做 3 · L2", q: "光滑水平面上，$2\\,\\mathrm{kg}$ 的 A 以 $4\\,\\mathrm{m/s}$ 撞静止的、同样 $2\\,\\mathrm{kg}$ 的 B，碰后 A 以 $1\\,\\mathrm{m/s}$、B 以 $3\\,\\mathrm{m/s}$ 沿原方向运动。判断碰撞类型，求损失的动能，并说明损失的动能到哪里去了。", a: "非弹性碰撞。动能由 $16\\,\\mathrm{J}$ 变成 $10\\,\\mathrm{J}$，损失 $6\\,\\mathrm{J}$。损失的动能主要变成内能，总能量守恒。" },
  { tag: "选做 · L2", q: "冰壶比赛中，红壶以 $2\\,\\mathrm{m/s}$ 正碰静止的、同样重的黄壶，碰后黄壶以 $1.8\\,\\mathrm{m/s}$ 沿原方向滑出。求碰后红壶的速度，判断碰撞类型，并说如果是弹性碰撞会怎样。", a: "红壶 $0.2\\,\\mathrm{m/s}$，沿原方向。按每千克计，动能由 $2\\,\\mathrm{J}$ 变成 $1.64\\,\\mathrm{J}$，少了 18%，是非弹性碰撞。若是弹性碰撞，红壶停下，黄壶以 $2\\,\\mathrm{m/s}$ 滑出。" }
]} />

