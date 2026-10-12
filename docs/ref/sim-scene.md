---
id: sim-scene
layer: L2
title: 容器、波与光路
related:
  - sim
  - sim-bodies
  - optics
---

玻璃容器、传送带、波和几何光学的画法。

<!-- region:sim-scene -->
- `v.vessel(m, parts, {fills, wall})`：玻璃容器。只有轴对齐矩形时和原来一样：`parts: [{x1, y1, x2, y2, open}]`，重叠处自动连通，只画一圈外壁；`open: 'top' | 'bottom' | 'left' | 'right'` 让那一端开口。变截面另写零件（和矩形混在同一 `parts` 里也会并成一个外壁，轮廓按多边形采样再取并集）：`{flask: {cx, cy, r, neck: {w, h}, open}}` 圆底烧瓶（球 + 竖直细颈，`open: false` 把管口封上）；`{bottle: {x1, x2, y1, y2, neck: {w, h}, shoulder}}` 细颈瓶，瓶身是矩形，`shoulder` 是肩高，管口默认开着；`{jar: {cx, y, r, h, open: 'bottom'}}` 拔火罐，倒扣的圆顶，罐口在 y；`{capillary: {x, y1, y2, w}}` 两端开口的毛细管。烧瓶、细颈瓶倒置（瓶口朝下插进水槽）在零件里写 `down: true`：烧瓶绕球心、细颈瓶绕瓶身中线上下翻转，瓶身位置不变，颈和管口在下，返回的 `mouth.side` 是 `'bottom'`；不要用 `ctx.scale` 或手算坐标翻转整幅画。毛细管、试管插进液槽时，液槽和管分两次调用 `v.vessel`（先液槽后管）：写进同一个 `parts` 会并成一个空腔，浸在液体里的那段管壁就没了，也画不出汞在管内比外面低。水在管内比外面高、汞比外面低，高度差写在 `<Define>` 里。`fills` 仍是矩形，裁进空腔：`kind` 取 `'mercury'`（默认，银色，`meniscus: 'top'` 上凸）、`'water'`（下凹）、`'gas'`（底色 + 会动的分子；`count` 固定，压缩或自由膨胀后铺进连通的空腔，自然变疏密，`density` 常用 `p/p0`）。不要从轮廓算体积或截面积，写在 `<Define>` 里。返回 `{mouth, openings}`：`mouth` 是管口（或罐口）中心 `{x, y, w, side}`，用来接活塞、瓶塞、气球；`openings` 是全部开口。
- `v.conveyor(m, x, y, len, {angle, speed, r, label})`：传送带。`(x, y)` 是上表面起点，沿 `angle`（度）延伸 `len`；`speed` 是上表面速度（物理单位/秒，正为沿 `angle` 方向），带面刻痕和滚筒辐条随动画时间移动，暂停时停住。返回 `{pt(u), ux, uy}`：`pt(u)` 是上表面上距起点 `u` 的点，用来放物块。
- `v.bar(m, x1, y1, x2, y2, {thick, label})`：金属棒（导轨上的导体棒、杠杆），`thick` 单位 px。
- `v.photon(m, x1, y1, x2, y2, {label, amp, wavelength, still})`：光子，波浪线一路向前传播，琥珀色（光的颜色），末端带箭头；示意图里写 `still: true` 不动。
- `v.element(m, x, y, type, {vertical, closed, label, reverse})`：画布上的电路元件符号，`type` 取 `resistor`、`switch`、`battery`、`capacitor`、`lamp`、`ammeter`、`voltmeter`、`phototube`。`phototube` 是圆圈里的弧形阴极 K 和阳极细棒 A，光打在 K 上；`reverse: true` 把 A、K 对调。`battery` 的长细线是正极：横放时正极在左，`vertical: true` 竖放时正极在上；`reverse: true` 让正极换到右边（竖放时在下）。不要用 `v.line` 自己画电池。返回半长（物理单位），导线画到 `x ± 半长` 为止。
- `v.ray(m, points)`：光线（带方向箭头）；`v.wave(m, fn, x1, x2, {dots})`：波形 y = fn(x)，`dots` 画介质质点：`true` 等间距画一排，数字是质点个数，数组是各质点的 x 坐标（如 `[1, 2.5, 4]`，标出题目点名的质点）。单列横波、驻波快照、自己写好的分段函数仍用 `v.wave`，不要改成下面的波列。
- `v.waves(m, sources, x1, x2, {t, sum, parts, dots, wall})`：有限波列。每个波源 `{x, v, amp, lambda, phase, dir, start, cycles, shape}`：`dir` 取 `1`（向 +x）、`-1` 或 `'both'`；`t` 时刻波前在 x ± v(t − start)，波前前方位移是 0；`shape: 'sine'` 时 `cycles` 是发出的波长数（不写就一直振，波列从波源连到波前），`'pulse'` 是一个宽 λ/2 的半正弦鼓包，`'half'` 是半个波长、用 `phase` 选哪半段（`phase` 为 0 时和 pulse 一样，为 π 时上下颠倒）。`sum` 默认画合成波（粗线），`parts: true` 用虚线分色画每一列。`wall: {x, kind: 'fixed' | 'free'}` 在边界做一次镜像（固定端反相、自由端同相）；反射波不再反射。返回 `{y(x), yi(i, x)}`，`dots` 同 `v.wave`，质点取合成位移。不要手写窗口函数或 y1+y2。
- `v.optics(m, p.lt, opts)`：画 `<Optics name="lt">` 算好的介质、镀银边、镜子、光屏和光线。主光线实线，部分反射的支路更细更淡，透明度随光强变化，但不会淡到看不见。`normals: true` 在主光线每个折点画虚线法线；`angles: true` 标出入射角、折射角；`rays: ["a"]` 只画点名的几条；`labels: true` 在起点旁标光线名字；`media: false` 不画介质（镜子和光屏仍画）。折射、全反射、色散不要手算折点再交给 `v.ray`。

<!-- /region -->
