---
id: sim-apparatus
layer: L2
title: 轨道与实验仪器
related:
  - sim
  - sim-magnetics
---

轨道、光电门、变压器和若干演示仪器。

<!-- region:sim-apparatus -->
- `v.track(m, pieces, {marks, flip, hatch, pipe, pipeWidth})`：由直线段和圆弧拼成的轨道，实体一侧画成有厚度的轨面（沿行进方向的右侧：从左到右的地面画在下方，逆时针圆弧画在外侧）；写了 `color` 或 `dash` 的段仍画细线加剖面线。`pieces: [{line: [x1, y1, x2, y2]}, {arc: [cx, cy, r, 起始角, 终止角]}]`（角度为度，逆时针为正），单段可写 `flip`、`hatch: false`、`dash`、`pipe: true`；`marks: [{x, y, label}]` 或 `[{s, label}]` 标出 A、B、C 点。`pipe: true`（写在某一段，或整条轨道的选项上）把这段画成两条平行壁，夹着中心线，不画剖面线、也不画中心线；`pipeWidth` 是两条壁的间距（px，默认 18，大约比一颗常见小球的直径多 4px 空隙）。`at(s)` 仍返回中心线。第二个参数也可以直接传 `<Motion track>` 的运动对象（`v.track(m, p.ball)`），用它算好的轨道；小球放在 `p.ball.x(t)`、`p.ball.y(t)`。返回 `{length, at(s)}`：`at(s)` 给出沿轨道走过路程 `s` 时的 `[x, y, 切线角]`，用来放小球。
- `v.photogate(m, x, y1, y2, {blocked, label, post, time, digits, timeLabel})`：侧视光电门，光束在 `y1`–`y2` 之间竖直穿过，遮光条从中间通过；`blocked: true` 时光束点亮；`post` 是立柱落地的 y。写了 `time` 键就在旁边画数字计时器，显示遮光时间（秒，`digits` 位小数，默认 3）；`time: null` 显示「- - - -」（还没挡光）。`timeLabel` 是计时器旁的说明（如 `'Δt'`）。`time` 也可以直接传字符串（如 `'2.13 ms'`），遮光时间只有几毫秒时用它显示毫秒。`horizontal: true` 把光电门横过来：参数读作 `(m, y, x1, x2)`，光束在高度 `y` 从 `x1` 水平射到 `x2`，给竖直下落、反弹的小球用；立柱从右侧外壳落到 `post`（`back: 'left'` 改到左侧，计时器跟着换边）。
- `v.block(..., {flag, flagAt, flagWidth})`：`flag` 在滑块上竖一根遮光条（数值为高度，物理单位；`true` 取物块高度的 0.8），`flagAt` 是相对物块中心的水平偏移，`flagWidth` 宽度（px，默认 4）。返回 `{top, flagTop}`。遮光条宽度 d 很小时，`d/Δt` 就是通过光电门的速度。
- `v.wire(m, x, y, {dir: 'out' | 'in', label, rings})`：垂直纸面的长直导线（⊙ 电流向外、⊗ 向里），外面画同心磁感线圈，箭头方向符合右手螺旋定则；`rings` 是各圈半径（px）。
- `v.transformer(m, x, y, {n1, n2, w, h, label1, label2})`：理想变压器（口字形铁芯，左原线圈、右副线圈，画出的匝数按 `n1:n2` 比例）。尺寸单位 px。返回 `{p: [上端, 下端], s: [上端, 下端]}` 四个接线柱的物理坐标，用来接导线和标 `U_1`、`U_2`。不写 `style` 时就是这个，不要改成下面的实物。
- `v.transformer(m, x, y, {style: 'lab', yoke, taps1, taps2, n1, n2})`：可拆变压器。U 形铁芯立在底座上：底梁加两条腿，线圈套在腿上、落在底梁上，腿在线圈上方露出来。横梁与铁芯外沿同宽，架在两条腿的顶端。`yoke: false` 时横梁整根抬起，和腿顶之间留出空隙，磁路断开（返回 `open: true`）。接线柱排在每个线圈上端的接线板上，不穿过横梁。`taps1`、`taps2` 是两侧接线柱的匝数，默认 `[0, 100, 200, 400]` 和 `[0, 200, 800, 1400]`；`n1`、`n2` 选中哪一档，和 `0` 那一档一起加亮。侧视叠片是沿铁芯轮廓的细线（腿上竖直、底梁和横梁上水平）：硅钢片平面平行于磁通，片间绝缘把涡流回路切开，细线的法线垂直于画面里的 U 形，不要另画一组法线或手填叠片方向。返回 `{p, s, taps1, taps2, yoke, open}`，`p`、`s` 是原、副线圈正在用的两只接线柱（先选中的那档，再是 0），用来接电源和电表。
- `v.sampleWire(m, x1, x2, y, {d, scale, label, clips, ruler, step, unit})`：待测金属丝，板上两只接线柱，下面一把尺（`ruler: false` 不画；刻度就是 `v.ruler`）。`d` 是直径，线宽为 `clamp(1.6 + d·scale, 1.6, 7)` px（`scale` 默认 12），所以不同直径能看出来，但毫米级的丝不会按真实像素画。返回 `{ends, clips, d}`。
- `v.oilFilm(m, x, y, {cells, area, seed, grid})`：坐标方格上的油膜。`grid` 是每格边长，`cells` 是方格纸一边有几格，`seed` 固定轮廓（同一组参数永远同一张图）。轮廓是按种子生成的不规则闭曲线，带尖刺；写了 `area` 就缩放到这个几何面积。多于半格的方格涂上颜色并计入，恰好半格和不足半格的不算。返回 `{count, area, exact}`：`count` 是计入的格数，`area = count·grid²`（高考用的面积），`exact` 是轮廓的真实面积。不要手画一块油膜再自己数。
- `v.centripetalDemo(m, x, y, {r1, r2, m1, m2, omegaRatio, readings})`：向心力演示器。两根横杆上的小球分别在半径 r1、r2 处。`omegaRatio` 是 ω1/ω2；皮带轮半径与角速度成反比。两侧标尺露出的红白等分格数正比于 F = mω²r。`readings` 是每单位力对应的格数；不写时把较大的一侧定为 8 格。返回 `{F1, F2, n1, n2, ratio, pulley, balls}`，`ratio = n1/n2 = F1/F2`。格数不要手填。
- `v.crt(m, x, y, {Ux, Uy, k, L, d, arm, screen})`：示波管，(x, y) 是荧光屏中心。电子枪、金属丝、YY′（上下，竖直偏转）、XX′（水平偏转，近板是 X）和光点。线性模型，不是由 e、m、v0 算出的抛物线：光点相对屏心 x = k·Ux、y = k·Uy。Ux = φ_X − φ_X′，Uy = φ_Y − φ_Y′；电压为正的那块板电势高，电子带负电，偏向正板，所以 Uy > 0 光点向上、Ux > 0 光点向屏的 +x。写了 `k` 就用 `k`；否则在 L、d 都为正时 k = (L/d)·arm（`arm` 默认 1），都不写则 k = 1。L、d 只进入 k，不拿来当图上的极板长度。`screen` 是屏半径（默认 0.85），光点出界就停在屏边；返回的 `x`、`y` 仍是没截断的 k·U，`spot` 是画上去的那个点。板上的正负号随电压变，不要手标。
- `v.hall(m, x, y, {w, h, t, B, I, carrier})`：霍尔片，(x, y) 是薄片中心，`w`、`h` 是正面宽高，`t` 是厚度。`B` 取 `in`（×）或 `out`（⊙），`I` 取 `right`、`left`、`up`、`down`，`carrier` 取 `electron` 或 `hole`。哪一面堆积由 F = q v × B 算出：电子的漂移速度与电流相反，空穴相同；堆积的那一面带载流子的电性。`UH` 是水平电流时 φ(上)−φ(下) 的符号，竖直电流时 φ(右)−φ(左) 的符号。电流箭头旁标 `I`，磁场符号旁标 `B`。正负号不要手标。返回 `{positive, negative, UH}`。

<!-- /region -->
