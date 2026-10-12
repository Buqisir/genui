---
title: 实验装置
source: 浙江卷示意图
demo: true
---

接线柱、油膜格数、标尺、光点和霍尔片的正负极都按参数算出来，不在图上另标。

## 一、可拆变压器

对照 2026·浙江（接线柱 0/100/400 与 0/200/800/1400）和 2021·浙江（U 形铁芯、可抽横梁、沿轮廓的叠片）。抽走横梁，磁路就断开。

<Param name="yoke" label="横梁" options={[{ value: 1, label: "装上" }, { value: 0, label: "抽走" }]} value={1} />
<Param name="n1" label="原线圈 n1" options={[{ value: 100, label: "100" }, { value: 200, label: "200" }, { value: 400, label: "400" }]} value={200} />
<Param name="n2" label="副线圈 n2" options={[{ value: 200, label: "200" }, { value: 800, label: "800" }, { value: 1400, label: "1400" }]} value={800} />

<Readout items={[
  { label: "n1 : n2", expr: "n1/n2", digits: 3 },
]} />

<Figure title="可拆变压器（2026·浙江，2021·浙江）" height={400} params={["yoke", "n1", "n2"]} note="叠片沿铁芯轮廓；加亮的是正在用的接线柱">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -4.2, xmax: 4.2, ymin: -1.85, ymax: 1.85, equal: true })
    v.transformer(m, 0, -0.05, {
      style: 'lab',
      yoke: p.yoke > 0,
      n1: p.n1,
      n2: p.n2,
      taps1: [0, 100, 200, 400],
      taps2: [0, 200, 800, 1400],
    })
  },
})
</Figure>

## 二、待测金属丝

2023·浙江，测金属丝电阻率。丝夹在两只接线柱之间，下面是刻度尺。线的粗细跟着直径变。

<Param name="L" label="夹具间距" min={20} max={50} step={1} value={40} unit="cm" />
<Param name="d" label="直径" min={0.2} max={1.2} step={0.05} value={0.4} unit="mm" />

<Readout items={[
  { label: "长度", expr: "L", digits: 0, unit: "cm" },
  { label: "直径", expr: "d", digits: 2, unit: "mm" },
]} />

<Figure title="待测金属丝（2023·浙江）" height={260} params={["L", "d"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -8, xmax: 58, ymin: -9, ymax: 6 })
    v.sampleWire(m, 0, p.L, 0, { d: p.d, scale: 6, label: '待测金属丝', unit: 'cm', step: 5, clips: true })
  },
})
</Figure>

## 三、油膜

2026·浙江。方格上的不规则油膜；多于半格的涂上颜色，不足半格的不算。S 是数出来的面积。

<Param name="seed" label="轮廓" min={1} max={8} step={1} value={2} />
<Param name="film" label="几何面积" min={12} max={55} step={1} value={28} />

<Figure title="油膜法（2026·浙江）" height={460} params={["seed", "film"]} note="涂色的格子多于半格">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -7.2, xmax: 7.2, ymin: -7.6, ymax: 7.4, equal: true })
    const film = v.oilFilm(m, 0, -0.15, { cells: 10, grid: 1, seed: p.seed, area: p.film })
    v.text(m, 0, 6.55, '计入 ' + film.count + ' 格    S = ' + film.area.toFixed(0))
  },
})
</Figure>

## 四、向心力演示器

2023·浙江。红白标尺露出的格数之比等于两侧 F = mω²r 之比。皮带轮半径与角速度成反比。

<Param name="m1" label="左侧质量" min={0.5} max={3} step={0.1} value={1} />
<Param name="m2" label="右侧质量" min={0.5} max={3} step={0.1} value={1} />
<Param name="r1" label="左侧半径" min={0.4} max={2} step={0.1} value={1} />
<Param name="r2" label="右侧半径" min={0.4} max={2} step={0.1} value={1} />
<Param name="omega" label="ω1 / ω2" min={0.5} max={2} step={0.1} value={1} />

<Define name="fRatio" expr="(m1/m2)*omega*omega*(r1/r2)" />

<Readout items={[
  { label: "露出格数之比", expr: "fRatio", digits: 2 },
]} />

<Figure title="向心力演示器（2023·浙江）" height={380} params={["m1", "m2", "r1", "r2", "omega"]} note="标尺上的数是 F = mω²r 的格数">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -3.6, xmax: 3.6, ymin: -1.7, ymax: 1.7, equal: true })
    v.centripetalDemo(m, 0, -0.15, { m1: p.m1, m2: p.m2, r1: p.r1, r2: p.r2, omegaRatio: p.omega })
  },
})
</Figure>

## 五、示波管

2023·浙江。光点用线性模型 x = k·Ux、y = k·Uy。电压为正的极板吸电子（电子带负电）。

<Param name="Ux" label="Ux" min={-12} max={12} step={1} value={4} />
<Param name="Uy" label="Uy" min={-12} max={12} step={1} value={6} />

<Define name="kSpot" expr="0.06" />
<Define name="spotX" expr="kSpot*Ux" />
<Define name="spotY" expr="kSpot*Uy" />

<Readout items={[
  { label: "光点 x", expr: "spotX", digits: 2 },
  { label: "光点 y", expr: "spotY", digits: 2 },
]} />

<Figure title="示波管（2023·浙江）" height={340} params={["Ux", "Uy", "kSpot"]} note="k = 0.06，光点出了屏就停在边上">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -5.5, xmax: 2.15, ymin: -1.65, ymax: 1.75, equal: true })
    v.crt(m, 0.55, 0, { Ux: p.Ux, Uy: p.Uy, k: p.kSpot, screen: 0.82 })
  },
})
</Figure>

## 六、霍尔片

2018·浙江、2023·浙江。正极在哪一侧由 F = q v × B 决定：电子漂移方向与电流相反。

<Param name="carrier" label="载流子" options={[{ value: -1, label: "电子" }, { value: 1, label: "空穴" }]} value={-1} />
<Param name="bDir" label="磁场" options={[{ value: 1, label: "向外 ⊙" }, { value: -1, label: "向里 ×" }]} value={-1} />
<Param name="iDir" label="电流" options={[{ value: 1, label: "向右" }, { value: -1, label: "向左" }]} value={1} />

<Define name="UH" expr="-carrier*bDir*iDir" />

<Readout items={[
  { label: "UH 的符号（上减下）", expr: "UH", digits: 0 },
]} />

<Figure title="霍尔片（2018·浙江）" height={360} params={["carrier", "bDir", "iDir"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2.3, xmax: 2.3, ymin: -1.7, ymax: 1.7, equal: true })
    const carrier = p.carrier < 0 ? 'electron' : 'hole'
    const B = p.bDir > 0 ? 'out' : 'in'
    const I = p.iDir > 0 ? 'right' : 'left'
    v.hall(m, 0.1, -0.05, { w: 1.85, h: 1.05, t: 0.22, B: B, I: I, carrier: carrier })
  },
})
</Figure>

## 七、斜放极板

2023·浙江。两块平行金属板与水平成 30°。`tilt` 再把下板扳开，间距在中点保持不变。

<Param name="ang" label="与水平的夹角" min={0} max={70} step={1} value={30} unit="°" />
<Param name="tilt" label="下板再偏" min={-25} max={25} step={1} value={0} unit="°" />

<Figure title="斜放极板（2023·浙江）" height={340} params={["ang", "tilt"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -3.4, xmax: 3.6, ymin: -2.3, ymax: 2.3, equal: true })
    const pair = v.plates(m, -2, 2, 0.36, -0.36, { angle: p.ang, tilt: p.tilt })
    const c = pair.bot[0]
    v.line(m, c[0] - 0.15, c[1], c[0] + 2.3, c[1], { dash: true, color: v.color.steel, width: 1 })
    if (Math.abs(p.ang) > 1) v.ellipse(m, c[0], c[1], 0.55, 0.55, { from: 0, to: p.ang, color: v.color.graphite })
    v.label(m, pair.top[0][0], pair.top[0][1], 'A', { place: 'above-left' })
    v.label(m, pair.top[1][0], pair.top[1][1], 'B', { place: 'above-right' })
    v.label(m, pair.bot[0][0], pair.bot[0][1], 'C', { place: 'below-left' })
    v.label(m, pair.bot[1][0], pair.bot[1][1], 'D', { place: 'below-right' })
    v.label(m, c[0] + 0.85, c[1], p.ang.toFixed(0) + '°', { place: 'above' })
  },
})
</Figure>
