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
- `v.gear(m, x, y, r, {teeth, angle, mat, holes, label})`：正面看的直齿轮，`r` 是节圆半径（两轮在节圆上相切，边缘线速度 ωr 指节圆上的点）。`teeth` 齿数（至少 8，默认按大小取）；`angle` 转角（度，逆时针），转动时写 `angle: ω·t·180/π`；`mat` 取 `'steelHi'`（默认）、`'steel'`、`'alu'`、`'dark'`；`holes: false` 不开减重孔（小齿轮自动不开）。返回 `{x, y, r, outer, teeth, angle, pt(deg)}`，`pt` 给节圆上某个方向的点，接力和速度箭头用。`v.gearMesh(m, g, r, {dir, mat, label})`：和齿轮 `g` 啮合的第二个齿轮，圆心在 `g` 的 `dir` 方向（度，默认 0 即右边）。齿数按半径比取整（半径随之微调到整齐数），转角自动设好，齿咬进齿槽、反向转、角速度按齿数比，不用自己算。返回值同 `v.gear`，可以再接第三个。不要用 `v.path` 拼齿形。
- `v.parachute(m, x, y, w, {h, drop, gores, angle, label})`：降落伞，(x, y) 是伞绳汇合点，伞盖宽 `w` 在它上方。`h` 伞顶高（默认 0.42w），`drop` 汇合点到伞沿的高度（默认 0.75w），`gores` 伞面分片数（默认 7），`angle` 绕汇合点倾斜（度）。返回 `{attach, apex, left, right}`，从 `attach` 用 `v.rope` 接到下面的物体（探测器用 `v.block`）。
- `v.box(m, x, y, w, h, {label, terminals, display, style, mat})`：仪器盒（测试仪、控制单元、电源盒），底边中点在 (x, y)，和 `v.block` 一样放。壳体是喷漆钢，正面一块凹进去的深色面板，两角有螺丝；`label` 印在面板上（夜光下用正文色，不发灰），`terminals` 是顶部黄铜接线柱的个数（最多 8 个），`display: true` 在面板右侧加一块小屏。面板在夜光下有一圈清楚的边和顶沿高光，和壳体分开。`style: 'frame'` 改成开口的壳体（房间框、机箱剖面）：只画边框的厚度和内侧阴影，中间透出背景，没有面板和螺丝。`mat` 取 `'steel'`（默认）、`'steelHi'`、`'alu'`、`'dark'`。返回 `{center, top, left, right, terminals}`，`terminals` 是每个接线柱的坐标，接线从那里引出。物块是质量，仪器盒是壳体，两者不要混用。
- `v.wedge(m, pts, {mat, dash, angleLabel, at, label})`：任意三角形或梯形实体（非直角的斜面、三角积木、梯形底座），`pts` 是顶点列表，至少三个，按顺序连成一个面。最高的那条边受光，和斜面同一套明暗。`dash: true` 只画虚线轮廓，用于「原来的位置」。`angleLabel` 在一个角上标角度，`at` 指定第几条边的起点（不写就取贴地的那个角）。返回 `{pts, edges, top}`，`edges[i]` 有 `at(u)`（边上 u 处的点，0 到 1）和 `normal`（指向体外的单位法向），物块和力箭头就放在这条边上。不要用 `v.path` 拼三角形。
- `v.slab(m, x, y, w, h, d, {mat, hidden, cut, cutLabels, loop, label})`：斜二测的长方体或平板，(x, y) 是前下左角，`w`、`h`、`d` 是宽、高、厚。正面按实长，向后的棱走 45°、长度取一半。三个面分得开：侧面暗一档，正面用 `mat`，顶面亮一档。`hidden: true` 把看不见的三条棱画成虚线，`cut: true` 画过左上棱和右下棱的斜剖面（半透明灰面），并在剖面四个顶点外侧标 M、N、P、Q（`v.label` 的常规字体，不写在面中间）。`cutLabels` 默认 `['M','N','P','Q']`，传 `false` 不标，也可以换成别的四个字母。`loop: true` 或 `loop: {u, v, r}` 在顶面上放一个平躺的线圈（漆包线，颜色和螺线管的导线一样）。返回 `{corners, front, side, top, P, loop}`，`corners` 是八个顶点，`P(x, y, z)` 把体内一点换成场景坐标，箭头和标注都用它定位，保证和棱的方向一致。
- `v.hand(m, x, y, {dir, size, label})`：一只握着绳或杆端的手，(x, y) 是握点。`dir` 取 `'right'`（默认）、`'left'`、`'up'`、`'down'`，或一个角度（度，手腕朝向，从 +x 逆时针）。侧视握拳：掌背、并排四节弯曲的手指（比掌背暗一档）、压在上面的拇指、手腕处一条深色袖口，都用冷灰织物色；手腕朝左时自动镜像，拇指保持在上方。`size` 是像素尺寸（默认 36）。手自带一小段穿过拳心的绳（拳头两侧露出、中间被手指挡住），`rope: false` 不画；接出去的绳从 `grip` 画起，先画绳再画手，手会盖住接头。返回 `{grip, dir}`。
- `v.laser(m, x, y, angle, {length, on, lambda, label})`：激光笔，侧面看，出光口在 (x, y)，沿 `angle`（度，从 +x 逆时针）射出。深色阳极壳，尾盖、滚花握把和按钮；`on: true` 只在出光口点一个光点（`lambda` 是波长，纳米，默认 650，决定光的颜色），笔身不再用别的强调色。返回 `{aperture, dir, angle}`，`<Optics>` 的光线从 `aperture` 出发、沿 `dir` 走。
- `v.springScale(m, x, y, {angle, value, max, length, divisions, label})`：弹簧测力计，接在装置里。`(x, y)` 是圆环（固定端）。`angle` 是钩子方向（度，从 +x 轴逆时针，默认 −90）。`value` / `max` 单位 N，指针和挂钩伸出量都按这个比例算（满量程时挂钩比空载多伸出 0.22 倍壳长）。`length` 是空载壳长（默认 1.6）。刻度数字保持正立。返回 `{hook, fraction}`，绳子接到 `hook`，不要手写挂钩坐标。
- `v.electrometer(m, x, y, {value, max, deflection, label, h})`：静电计。金属球在上，外壳接地。指针张角 = 60° × value/max（写了 `value` 就不用再写 `deflection`）。`(x, y)` 在外壳中部。不要手画张角。返回 `{angle, ball}`，`angle` 是相对直杆的度数，`ball` 是金属球的坐标。
- `v.cylinder(m, x, y, w, h, pistonY, {molecules, temp, heat})`：汽缸 + 活塞，气体分子会自己动，`heat` 画加热波纹。
- `v.tube(m, {x, y, angle, sections, pistons, rod, gas, ghosts, wall})`：可倾斜的汽缸（含粗细不同的多段圆筒）。沿筒轴的坐标叫 `u`，垂直筒轴的叫 `w`，`(x, y)` 是 `u = 0` 的位置，`angle` 是筒轴方向（度）。`sections: [{from, to, r}]` 每段的轴向范围和内半径，相邻两段半径不同时自动画台阶；`pistons: [{at, label, labelSide}]`；`rod: true` 用细杆连接前两个活塞；`gas: {from, to, count, density, temp}` 在两活塞之间画气体，分子总数不变，气体被压缩时自然变密，`density` 控制底色深浅（常用 `p/p0`），`temp` 控制分子运动快慢；`ghosts: [{at}]` 用虚线画参考位置的活塞。返回 `{pt(u, w), ux, uy}`：`pt` 把筒上的点换成场景坐标，用来挂力箭头和尺寸线。必须配 `view({..., equal: true})`。
- `v.planet(m, x, y, r, {label})`、`v.orbit(m, cx, cy, rx, ry, {back, dash})`、`v.satellite(m, x, y, {angle})`（`angle` 是卫星朝向，度，从 +x 逆时针）、`v.stars()`（夜光主题的星空）。椭圆轨道按焦点放：已知近点、远点距离时，在 `<Define>` 里算半长轴 `a = (rp + ra) / 2`、中心离焦点 `c = a - rp`、半短轴 `b = sqrt(a^2 - c^2)`，再把中心和 `rx: a`、`ry: b` 交给 `v.orbit`。不要把焦点放在椭圆中心。
- `v.rails(m, x1, x2, yTop, yBot)`：导轨；`v.plates(m, x1, x2, yTop, yBot, {angle, tilt, signs})`：平行板。`angle`（度，逆时针）绕中心转动整对板，0 水平、90 竖直；`tilt` 再让下板相对上板转过一个角（两板不平行）。不写这两个时仍是原来的两块水平板，上「+」下「−」。`signs: 'flip'` 对调成上「−」下「+」（下板接正极、场强向上时），`signs: false` 不标；不要另写文字盖住原来的符号。`v.platesAt(m, x1, y1, x2, y2, {gap, angle, tilt, signs})` 的中线从 (x1, y1) 到 (x2, y2)，间距 `gap`；`angle` 改中线方向，不写就沿着给出的中线。斜放极板用这两个，不要自己转两条粗线。返回 `{top, bot, angle}`，每块板是两端点。

<!-- /region -->
