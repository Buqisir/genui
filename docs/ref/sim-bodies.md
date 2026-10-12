---
id: sim-bodies
layer: L2
title: 矢量与物体
related:
  - sim
  - sim-api
  - sim-scene
---

物理量箭头，以及小车、弹簧、汽缸这些物体。

<!-- region:sim-bodies -->
**物理量箭头**

- `v.vec(m, x, y, dx, dy, {kind, label, dash, min})`：从 (x, y) 出发的矢量，颜色由 `kind` 决定（默认 `velocity`），`label` 放在箭头尖外。速度、力、加速度一律用它，不要用 `v.arrow` 自己配色。

**物体**（器材材质：顶面亮、正面明暗渐变、接触处有影子，大物体轮廓线浅、小零件轮廓线清楚；`ghost: true` 画成虚线虚影，用于"之前/之后的位置"）。物体用这些工具画，不要用 `v.rect`、`v.path` 自己拼方框和三角形，自己拼的没有材质。

- `v.ground(m, x1, x2, y, {side, thick})`、`v.wall(m, x, y1, y2, {side, label})`：地面、墙。地面画成 y 下方的一块台面，物体站在 y 上；`side: 'above'` 把台面画在 y 上方，当天花板或横梁用（滑轮、单摆的悬点）；`thick` 是台面厚度（px，默认 10）。放在地面、小车或物块顶上的物块自动画接触影，悬空的不画；`v.block` 写 `shadow: false` 可以关掉。
- `v.cart(m, x, y, w, h, opts)`：小车/木板，左端在 x、站在 y 上，返回 `{top, left, right}`，物块可以放在 `top` 上。
- `v.block(m, x, y, w, h, opts)`：物块，底边中点在 (x, y)。放在斜面上时写 `angle`（斜面方向，度，逆时针为正），(x, y) 取斜面上的接触点，物块绕它转过去贴在面上，返回 `{topCenter, center, corners}`，力的箭头从 `center` 画；不要用 `v.path` 自己转方框。绕转轴转的板（电池板、挡板、杠杆、门）写 `pivot: 'center'`：(x, y) 改为板的中心，绕中心转过 `angle`，默认不画接触影。`v.ball(m, x, y, r, {label, charge})`：小球，`charge: true` 画带电粒子；要标电性就写 `charge: '+'`、`'-'` 或带正负的电荷量（如 `charge: p.q`），球上画 ± 号。`v.com(m, x, y, {label, size})`：质心，小十字，默认标「质心」（`label: false` 不标）。坐标用算出来的质心，不要手点一个圆。
- `v.spring(m, x1, y1, x2, y2, {coils})`、`v.rope(m, points)`、`v.pulley(m, x, y, r, {mount})`、`v.incline(m, x, y, w, h, {angleLabel, flip})`。
- `v.springScale(m, x, y, {angle, value, max, length, divisions, label})`：弹簧测力计，接在装置里。`(x, y)` 是圆环（固定端）。`angle` 是钩子方向（度，从 +x 轴逆时针，默认 −90）。`value` / `max` 单位 N，指针和挂钩伸出量都按这个比例算（满量程时挂钩比空载多伸出 0.22 倍壳长）。`length` 是空载壳长（默认 1.6）。刻度数字保持正立。返回 `{hook, fraction}`，绳子接到 `hook`，不要手写挂钩坐标。
- `v.electrometer(m, x, y, {value, max, deflection, label, h})`：静电计。金属球在上，外壳接地。指针张角 = 60° × value/max（写了 `value` 就不用再写 `deflection`）。`(x, y)` 在外壳中部。不要手画张角。返回 `{angle, ball}`，`angle` 是相对直杆的度数，`ball` 是金属球的坐标。
- `v.cylinder(m, x, y, w, h, pistonY, {molecules, temp, heat})`：汽缸 + 活塞，气体分子会自己动，`heat` 画加热波纹。
- `v.tube(m, {x, y, angle, sections, pistons, rod, gas, ghosts, wall})`：可倾斜的汽缸（含粗细不同的多段圆筒）。沿筒轴的坐标叫 `u`，垂直筒轴的叫 `w`，`(x, y)` 是 `u = 0` 的位置，`angle` 是筒轴方向（度）。`sections: [{from, to, r}]` 每段的轴向范围和内半径，相邻两段半径不同时自动画台阶；`pistons: [{at, label, labelSide}]`；`rod: true` 用细杆连接前两个活塞；`gas: {from, to, count, density, temp}` 在两活塞之间画气体，分子总数不变，气体被压缩时自然变密，`density` 控制底色深浅（常用 `p/p0`），`temp` 控制分子运动快慢；`ghosts: [{at}]` 用虚线画参考位置的活塞。返回 `{pt(u, w), ux, uy}`：`pt` 把筒上的点换成场景坐标，用来挂力箭头和尺寸线。必须配 `view({..., equal: true})`。
- `v.planet(m, x, y, r, {label})`、`v.orbit(m, cx, cy, rx, ry, {back, dash})`、`v.satellite(m, x, y, {angle})`（`angle` 是卫星朝向，度，从 +x 逆时针）、`v.stars()`（夜光主题的星空）。椭圆轨道按焦点放：已知近点、远点距离时，在 `<Define>` 里算半长轴 `a = (rp + ra) / 2`、中心离焦点 `c = a - rp`、半短轴 `b = sqrt(a^2 - c^2)`，再把中心和 `rx: a`、`ry: b` 交给 `v.orbit`。不要把焦点放在椭圆中心。
- `v.rails(m, x1, x2, yTop, yBot)`：导轨；`v.plates(m, x1, x2, yTop, yBot, {angle, tilt, signs})`：平行板。`angle`（度，逆时针）绕中心转动整对板，0 水平、90 竖直；`tilt` 再让下板相对上板转过一个角（两板不平行）。不写这两个时仍是原来的两块水平板，上「+」下「−」。`signs: 'flip'` 对调成上「−」下「+」（下板接正极、场强向上时），`signs: false` 不标；不要另写文字盖住原来的符号。`v.platesAt(m, x1, y1, x2, y2, {gap, angle, tilt, signs})` 的中线从 (x1, y1) 到 (x2, y2)，间距 `gap`；`angle` 改中线方向，不写就沿着给出的中线。斜放极板用这两个，不要自己转两条粗线。返回 `{top, bot, angle}`，每块板是两端点。

<!-- /region -->
