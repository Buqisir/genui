---
id: sim-magnetics
layer: L2
title: 磁体与回旋加速器
related:
  - sim
  - sim-apparatus
---

螺线管、磁铁、辐向磁场和回旋加速器。

<!-- region:sim-magnetics -->
- `v.solenoid(m, x1, y1, x2, y2, {r, turns, sense, current, core, terminals, labels, field, lead})`：侧视螺线管，轴从端 1 `(x1, y1)` 到端 2 `(x2, y2)`，`r` 是管半径。`sense: 1` 是右手螺旋：顺着轴从端 1 看向端 2，导线顺时针前进；靠近读者的半匝（实线）沿端 1 → 端 2 往轴的右方下降。轴的右方 = 把端 1 到端 2 的方向顺时针转 90°（水平向右的螺线管，右方就是下方，实线呈「\」）。`sense: -1` 实线往上升（「/」）。背面半匝是淡色虚线，绕向看得出来。`current` 为正表示电流从端 1 流入，在几匝实线上画箭头。N 极是迎着看时电流为逆时针的那一端，由 `sense` 和 `current` 的符号算出，不要手标：同号时端 2 是 N，异号时端 1 是 N，电流为 0 没有极性。`labels: true` 才在两端标 N、S。`field: true` 画磁感线（管内沿轴指向 N，管外从 N 绕回 S），写数字是管内的条数。`core: true` 或 `'iron'` 画整根铁芯，`{from, to}` 只画轴上这一段（0 和 1 是两端，小于 0 或大于 1 就伸到管外）。`terminals: 'below' | 'above' | 'none'`（默认 below）把引出线放到轴的右方或左方。返回 `{north, south, terminals, axis: {ux, uy}, pt(u)}`：极面中心（无极性时为 null）、两根引出线的终点、轴上 u = 0…1 的点。画出的匝数夹在 3–16，极性与匝数无关。
- `v.toroid(m, cx, cy, R, {r, turns, sense, current, gap, gapAt, field})`：正视的螺绕环，环心半径 `R`，管半径 `r`（小于 R）。`sense: 1` 时靠近读者的半匝从内缘走到外缘并偏向逆时针。`current` 为正就顺着这个方向画箭头。两者同号时外缘是 ⊗、内缘是 ⊙，环内磁感线沿逆时针（内缘的电流都向外，按安培环路定理）；异号全部反过来。电流为 0 不画箭头和 ⊗/⊙。`field: true` 或数字沿中心圆画箭头。`gap` 是缺口张角（度），`gapAt` 是缺口中心方向（度，从 +x 逆时针，默认 0）。返回 `{ccw}`：+1 环内磁场逆时针，−1 顺时针，0 无电流。
- `v.magnet(m, x, y, {kind, w, h, angle, north, field})`：`kind: 'bar'`（默认）是条形磁铁。`north` 取 `left` / `right` / `up` / `down`（默认 right），再被 `angle`（度，逆时针）转过。N 的一半红色、S 的一半蓝色（磁极的习惯颜色），字母写在上面。`kind: 'horseshoe'` 或 `'U'` 是蹄形，开口朝下，`north: 'left' | 'right'`（默认 left）是哪条腿的极面为 N。`field: true` 或数字画磁感线：条形按两极模型从 N 极面绕到 S 极面，蹄形在两极之间大体跨过缺口、外面发散。返回 `{north, south}` 极面中心。极性、颜色都由参数决定，不要自己填色或手写 N/S。
- `v.radialField(m, cx, cy, rIn, rOut, {poles, north, dir, core, span, coil})`：气隙里的辐向磁场，箭头一样长（|B| 沿气隙均匀，线圈边始终垂直切割）。`poles: 'shoes'`（默认）是磁电式电表：左右极靴夹着软铁圆柱（`core: false` 不画圆柱），`north: 'left' | 'right'`（默认 left），`span` 是每块极靴的张角（度，默认 130）。磁感线从 N 极靴进入圆柱，再从圆柱进入 S 极靴，所以 N 一侧指向圆心、S 一侧离开圆心。`poles: 'ring'` 是环形极靴（扬声器、弹射线圈）：`dir: 'out'`（默认）箭头全部向外、内圆柱是 N，`dir: 'in'` 相反。`coil: {angle, w, h, current}` 画矩形线圈的截面，`angle` 是度，`w` 是两条边的距离（默认落在气隙中线）；`current` 为正时 `angle` 那条边的电流向外（⊙），对边向里（⊗），为负则对调，不写 `current` 按 +1。返回 `{north, south, core}`。
- `v.cyclotron(m, cx, cy, R, {gap, r1, halfTurns, sense, dir, e, sourceLabel})`：俯视回旋加速器。两个 D 形盒（半径 `R`，间隙 `gap`）内是匀强磁场（`dir` 同 `v.field`），下方接交流电源，中心画离子源。`r1` 是第一个半圈的半径，此后第 k 个半圈半径为 `r1·√k`（每次过缝获得相同能量）；`halfTurns` 限制半圈数（默认且最多为 `floor((0.96*R/r1 - 0.21)^2)`：离子源放在 D 形盒中心下方一点，各半圈的圆心都在中心 0.21·r1 以内，所以最后一圈刚好贴着盒边、半径 ≈ `r1·√N`；`Sim` 的 `duration` 用同一个式子写进 `Define`，播放时长才和圈数一致。按题目数据做时，先定最大半径 `rMax`（不超过 `0.9*R`）和半圈数 `N`，再取 `r1 = rMax/sqrt(N)`，这样改加速电压时出口半径不变，正好说明"出口速度与电压无关"）；`sense: -1` 改为顺时针；`e: 1 | -1` 在缝里画此刻电场方向（`0` 不画）。返回 `{at(h), upTo(h), points, radius(k), halfTurns}`：`h` 是已转过的半圈数（每半圈用时都是 T/2，所以 `at(t, p)` 里直接写 `h: t` 即可，配 `timeUnit="半周"`；想让学生一个半圈一个半圈地看，再加 `step={1} stepLabel="前进半周"`），`at(h)` 是粒子位置，`upTo(h)` 是已走过的轨迹折线（交给 `v.path` 画）。
- `v.car(m, x, y, opts)`：旧写法，保留兼容，新课件用 `v.cart`。


<!-- /region -->
