---
title: 螺线管、磁铁与辐向磁场
source: 浙江卷示意图
demo: true
---

N、S 和磁感线方向都按绕向、电流用右手螺旋定则算出来，不在图上另标。气隙里的辐向磁场沿半径，箭头一样长。

## 一、通电螺线管

对照 2021 年浙江卷：管内磁场从 S 指向 N，管外从 N 绕回 S。端 1 在左。电流从端 1 流入、右手螺旋时，端 2 是 N。

<Param name="sense" label="绕向" options={[{ value: 1, label: "右手螺旋" }, { value: -1, label: "左手螺旋" }]} value={1} />
<Param name="I" label="电流" options={[{ value: 1, label: "从端 1 流入" }, { value: -1, label: "从端 2 流入" }, { value: 0, label: "断开" }]} value={1} />
<Param name="iron" label="铁芯" options={[{ value: 1, label: "有，并伸出管外" }, { value: 0, label: "无" }]} value={1} />

<Define name="nEnd" expr="abs(I) < 0.001 ? 0 : (sense*I > 0 ? 2 : 1)" />

<Readout items={[
  { label: "N 极在端", expr: "nEnd", digits: 0 },
]} />

<Figure title="螺线管（2021·浙江）" height={400} params={["sense", "I", "iron"]} note="磁感线示意，不按匝数比例">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -3.4, xmax: 3.4, ymin: -1.9, ymax: 2.6, equal: true })
    const sol = v.solenoid(m, -2.05, 0.45, 2.05, 0.45, {
      r: 0.4,
      turns: 8,
      sense: p.sense,
      current: p.I,
      core: p.iron > 0 ? { from: -0.22, to: 1.18 } : false,
      terminals: 'below',
      labels: true,
      field: 3,
    })
    const t1 = sol.terminals[0]
    const t2 = sol.terminals[1]
    const yb = t1[1] - 0.55
    const mx = (t1[0] + t2[0]) / 2
    const s = p.I < 0 ? 1 : -1
    v.line(m, t1[0], t1[1], t1[0], yb, { width: 1.4 })
    v.line(m, t2[0], t2[1], t2[0], yb, { width: 1.4 })
    v.line(m, t1[0], yb, mx - 0.16, yb, { width: 1.4 })
    v.line(m, t2[0], yb, mx + 0.16, yb, { width: 1.4 })
    v.line(m, mx + 0.16 * s, yb - 0.34, mx + 0.16 * s, yb + 0.34, { width: 1.6 })
    v.line(m, mx - 0.16 * s, yb - 0.18, mx - 0.16 * s, yb + 0.18, { width: 3.2 })
    v.label(m, mx, yb - 0.62, '电池')
    v.label(m, t1[0], t1[1], '端 1', { place: 'left' })
    v.label(m, t2[0], t2[1], '端 2', { place: 'right' })
    if (sol.north) {
      const dx = sol.south[0] - sol.north[0]
      const dy = sol.south[1] - sol.north[1]
      const L = Math.hypot(dx, dy) || 1
      const c = sol.pt(0.5)
      const cy = c[1] + 1.35
      v.circle(m, c[0], cy, 0.26, { fill: v.color.stage, color: v.color.ink, width: 1.2 })
      v.arrow(m, c[0] - (dx / L) * 0.14, cy - (dy / L) * 0.14, c[0] + (dx / L) * 0.16, cy + (dy / L) * 0.16, { color: v.color.ink, width: 1.6, head: 8 })
      v.label(m, c[0], cy + 0.5, '指南针')
    }
  },
})
</Figure>

## 二、螺绕环

对照 2023 年浙江卷的螺绕环。右手螺旋、电流为正时，外缘电流向里，环内磁场沿顺时针。

<Param name="tSense" label="绕向" options={[{ value: 1, label: "右手螺旋" }, { value: -1, label: "左手螺旋" }]} value={1} />
<Param name="tI" label="电流" options={[{ value: 1, label: "正向" }, { value: -1, label: "反向" }, { value: 0, label: "断开" }]} value={1} />
<Param name="gap" label="缺口" min={0} max={50} step={5} value={0} unit="°" />

<Define name="ringCCW" expr="abs(tI) < 0.001 ? 0 : (tSense*tI > 0 ? -1 : 1)" />

<Readout items={[
  { label: "环内 B（+1 逆时针）", expr: "ringCCW", digits: 0 },
]} />

<Figure title="螺绕环（2023·浙江）" height={360} params={["tSense", "tI", "gap"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2.15, xmax: 2.15, ymin: -2.05, ymax: 2.05, equal: true })
    v.toroid(m, 0, 0, 1.15, { r: 0.32, turns: 18, sense: p.tSense, current: p.tI, field: 4, gap: p.gap })
  },
})
</Figure>

## 三、条形磁铁与蹄形磁铁

条形磁铁的磁感线按两极模型从 N 极面绕到 S 极面。蹄形磁铁（2025 年浙江卷，金属丝上的蹄形磁铁）的磁场主要跨过缺口。

<Param name="flip" label="极性" options={[{ value: 0, label: "条形 N 在右，蹄形 N 在左" }, { value: 1, label: "对调" }]} value={0} />

<Figure title="磁铁" height={380} params={["flip"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -4.4, xmax: 3.8, ymin: -2.15, ymax: 2.7, equal: true })
    v.magnet(m, -1.75, 0.45, { kind: 'bar', w: 1.55, h: 0.42, north: p.flip > 0 ? 'left' : 'right', field: 6 })
    v.magnet(m, 1.9, 0.2, { kind: 'horseshoe', w: 1.3, h: 1.2, north: p.flip > 0 ? 'right' : 'left', field: 5 })
  },
})
</Figure>

## 四、辐向磁场

左图是 2024 年浙江卷的磁电式电表：极靴和软铁圆柱之间的磁场沿半径，线圈转到哪里，两边都垂直切割磁感线。右图是环形极靴（2022 年浙江卷舰载弹射），`dir` 决定内圆柱是 N 还是 S。

<Param name="ang" label="线圈角度" min={-50} max={80} step={5} value={18} unit="°" />
<Param name="rdir" label="环形极靴" options={[{ value: 1, label: "磁场向外，内 N" }, { value: -1, label: "磁场向里，内 S" }]} value={1} />

<Figure title="磁电式电表（2024·浙江）" height={380} params={["ang"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2.4, xmax: 2.4, ymin: -2.15, ymax: 2.15, equal: true })
    v.radialField(m, 0, 0, 0.58, 1.18, { poles: 'shoes', north: 'left', core: true, coil: { angle: p.ang, current: 1 } })
    v.label(m, -1.95, 0, '极靴', { place: 'left' })
    v.label(m, 1.95, 0, '极靴', { place: 'right' })
  },
})
</Figure>

<Figure title="环形辐向磁场（2022·浙江）" height={340} params={["rdir"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2.3, xmax: 2.3, ymin: -2.05, ymax: 2.05, equal: true })
    v.radialField(m, 0, 0, 0.48, 1.12, { poles: 'ring', dir: p.rdir > 0 ? 'out' : 'in', coil: { angle: 90, w: 1.45, current: 1 } })
  },
})
</Figure>
