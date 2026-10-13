# 整库重新生成进度（archive/plans/regen2）

队列：`archive/plans/regen2-queue.txt`（还没启动的题，从上往下取）。并行上限 5 个：同时 10 个、8 个时各有 4 个被拒（model_request_rejected）。

## 完成
- gd21-11：0 错误，排版无问题。斜管刻度用 v.line（当时 v.ruler 不能斜放，之后已补 `angle`）。

- gd24-14：0 错误，排版通过；只有气囊轮廓用 v.path（表里没有）。旧版的 params 漏声明没了。

- gd24-05：0 错误，排版通过，无 v.rect/v.path；1 条建议（卷轴画面偏小）。

- gd21-04：0 错误，排版通过，无 v.rect/v.path（道闸杆用 v.bar）。

- gd25-05：0 错误，排版通过；动能比 0.56，和标准答案一致（0.36 是 Worker 自己上一稿的错，旧版也对）。螺母用 v.circle。
- gd24-11：0 错误，排版通过，无 v.rect/v.path；纸带、游标卡尺、条纹交给预制组件。

- gd23-03：0 错误，排版通过；真空管用 v.vessel，无 v.rect/v.path。

- gd24-10：0 错误，排版 9→0；v.track + v.block，无 v.rect/v.path。
- gd22-15：0 错误，排版通过；空调示意用 v.rect（表里没有，允许）。

- gd21-01：0 错误，排版通过，无 v.rect/v.path。
- gd21-02：0 错误，排版通过，无 v.rect/v.path（v.planet/v.orbit/v.satellite）。
- gd23-02：0 错误，排版通过，无 v.rect/v.path（旧版手画的板子没了）。
- gd21-05：0 错误，排版通过；弹性方管变形轮廓用 v.path（表里没有）。
- gd25-06：0 错误，排版通过；用了 v.magnet、v.solenoid；测试仪方框 v.rect（表里没有）。

- gd21-03：0 错误，排版通过；犁用 v.path（生活装置，允许）。

- gd21-09：0 错误，排版通过；平抛轨迹用 v.path（应该用 v.trail，对照表缺「轨迹」这一行）。

- gd21-06：0 错误，排版通过；喷管和特殊等势面用 v.path（理由成立）。
- gd21-07：0 错误，排版通过；v.magnet/v.solenoid/v.transformer；充电电路方框 v.rect。

- gd21-08：0 错误，排版通过（汇报被截断，文件完整）。

- gd21-10：0 错误，排版通过；圆弧导轨用 v.path（v.track 的 arc 段可以画，对照表可补「弧形导轨」）。

- gd21-15：0 错误，排版通过；细颈瓶 v.vessel，无 v.rect/v.path。

- gd21-13：0 错误 0 提醒，排版通过，无 v.rect/v.path。

- gd21-16：0 错误，排版通过，答案对；无 v.rect/v.path（Worker 两次被拒，但第二次已把文件写完）。
- gd21-17：0 错误，排版通过，无 v.rect/v.path。
- gd22-01：0 错误，排版通过；石磨用 v.circle 简图，无 v.rect。
- gd22-02：0 错误，排版通过；v.planet/v.orbit/v.satellite，无 v.rect/v.path。
- gd24-15（续跑）：0 错误，排版通过；v.plates/v.field/v.ball，轨迹用解析解（Motion 积分超 2 秒预算），无 v.rect/v.path。
- gd22-04：0 错误，排版通过；v.solenoid/v.magnet；**情景图电阻用 v.rect（器材缺口：情景图里没有电阻器材）**。
- gd22-05：0 错误，排版通过；对数能量轴波段色块用 v.rect（图表元素，不是器材）。
- gd22-06：0 错误，排版通过，答案对（Worker 被拒，但文件已写完）；三角积木用 v.path（无对应器材）。
- gd21-18：0 错误，排版通过；v.optics/v.ray/v.block，无 v.rect/v.path。**待查：Worker 说 v.optics 临界光线折点数组传不进画面，改用 v.ray 接**。
- gd22-03：0 错误，排版通过；v.track/v.ball/v.trail + Motion track 积分，无 v.rect/v.path。
- gd22-07：0 错误，排版通过；v.ball/v.trail/v.field + Motion 积分；**斜二测立方体用 v.path（器材缺口：没有立体框图器材）**。
- gd22-09：0 错误，排版通过，答案 ABD；v.track/v.ground/v.cart/v.block，无 v.rect/v.path。
- gd22-10：0 错误，排版通过；v.wire/v.bar/v.ellipse；**斜视地块和透视线圈用 v.path（同 gd22-07 的立体图缺口）**。
- gd22-12：0 错误，排版通过；v.sampleWire/v.ruler/v.block/v.wall + Circuit + Plot，无 v.rect/v.path（滚轮用 v.circle）。
- gd22-11：0 错误，排版通过；v.photogate/v.ball/v.bar + Instrument micrometer，无 v.rect/v.path。
- gd22-08：0 错误，排版通过，答案 BC；v.regions/v.ball/v.trail，无 v.rect/v.path。
- gd22-13：0 错误，排版通过；v.ground/v.bar/v.block/v.dim，无 v.rect/v.path（A、B 用 v.text 固定，因 v.label 避让会推远）。
- gd22-14：0 错误，排版通过；v.plates/v.regions/v.ball/v.trail，无 v.rect/v.path。**待查：v.ball charge 不标正负号，Worker 用 v.text 补**。
- gd22-16：0 错误，排版通过；v.vessel 细颈瓶（翻转倒置）+ Define + Plot，无 v.rect/v.path。**待查：v.vessel 无倒置选项**。
- gd22-18：0 错误，排版通过；Optics + v.optics，罐壁截面用 v.ellipse 整圆，无 v.rect/v.path。
- gd21-14：0 错误，排版通过；v.regions/v.trail/v.ball + Motion 核对四个答案，无 v.rect/v.path（扇环不按比例，已注明）。
- gd23-01：0 错误，排版通过；v.block/v.ball/v.photon/v.stars，无 v.rect/v.path。
- gd22-17：0 错误，排版通过；v.wave/v.ball/v.rope；**手掌 v.path、前臂 v.rect（器材缺口：没有手）**。
- gd23-05：0 错误，排版通过；v.cyclotron/v.ball；轨迹 v.path 画 cyclotron 返回的 points（待核对是否应改 v.trail）。
- gd23-07：0 错误，排版通过；v.planet/v.orbit/v.stars/v.photon，无 v.rect/v.path。
- gd23-06：0 错误，排版通过；v.transformer/v.cart/v.particles + Circuit，无 v.rect/v.path。
- gd23-10：0 错误，排版通过；v.block/v.bar/v.rope（弯钩用 v.rope 折线），无 v.rect/v.path。
- gd23-09：0 错误，排版通过；v.vessel/v.block/v.bar/v.efield/v.ball，无 v.rect/v.path。**待查：v.plates 极性写死上正下负**。
- gd23-08：0 错误，排版通过，答案 BCD；v.track 圆弧/v.ground/v.wall/v.block/v.trail，无 v.rect/v.path。
- gd23-13：0 错误，排版通过；v.vessel + gas 填充 + Plot + GasBox，无 v.rect/v.path。
- gd23-04：0 错误，排版通过，答案 B；v.vessel/v.wave/v.block/v.dim，无 v.rect/v.path。
- gd24-02：0 错误，排版通过，答案 C；v.ball/v.arrow，无 v.rect/v.path。
- gd24-03：0 错误，排版通过，答案 B；v.wave/v.axisX/v.arrow，无 v.rect/v.path。
- gd24-01：0 错误，排版通过；Circuit generator/resistor transient + 相量图，无 v.rect/v.path。
- gd23-14：0 错误，排版通过；v.field/v.bar/v.dim/v.vec，无 v.rect/v.path。
- gd24-04：0 错误，排版通过；v.bar/v.field/v.block/v.magnet，无 v.rect/v.path。
- gd24-07：0 错误，排版通过，答案 B（重跑）；v.ground/v.spring/v.block，无 v.rect/v.path。
- gd25-01：0 错误，排版通过；v.orbit/v.planet/v.stars/v.trail，无 v.rect/v.path。
- gd24-09：0 错误，排版通过，答案 AC；v.rope/v.block/v.stars；**降落伞伞盖和背罩用 v.path（器材缺口：没有降落伞）**。
- gd25-02：0 错误，排版通过，答案对（Worker 被拒，但文件已写完），无 v.rect/v.path。
- gd24-08：0 错误，排版通过，答案 A；v.vessel/v.bar/v.efield，无 v.rect/v.path。**待查：v.element 电池竖放时极板方向翻不过来，Worker 用 v.line 画电池**。
- gd23-15：0 错误，排版通过；v.conveyor/v.track（螺旋滑槽）/v.block，无 v.rect/v.path。
- gd25-04：0 错误，排版通过（θ 三档已扫），答案 AC；v.track/v.ball + ForceDiagram，无 v.rect/v.path。
- gd25-07：0 错误，排版通过；v.vessel 矩形腔/v.capillary/v.block 塞子，无 v.rect/v.path。
- gd25-03：0 错误，排版通过（四个时刻已扫）；v.ground/v.ball/v.event，无 v.rect/v.path。
- gd23-12：0 错误，排版通过（重跑）；v.vessel/v.plates/v.ruler + Circuit + Wiring，无 v.rect/v.path。
- gd25-08：0 错误，排版通过；v.vessel/v.bar/v.block/v.spring；**齿轮齿廓用 v.path（器材缺口：没有齿轮）**。
- gd25-09：0 错误，排版通过（第四次重跑）；v.regions/v.platesAt/v.block/v.ball，无 v.rect/v.path。**待查：Worker 说这题 <Motion> 事件和读数都是 NaN，改用解析式**。

## 待续跑（被拒后留下的）
（无）

## 运行中
- 

## 盲做答案错误（统计发现，2026-10-13）
盲做（提示词不含参考答案）后 8 道与标准答案不符，旧版只有 1 项。盲做结果存 archive/plans/regen2-stats-blind.md。
- 选错：gd22-10（BD→应 AC）、gd23-07（C→B）、gd23-09（BC→AC）、gd23-10（CD→BD）、gd24-05（B→A）、gd24-08（A→AC）
- 数值不符：gd22-13「(1) 上滑时支持力 N_2」、gd24-14「(2)② 上升最大高度」
- 修正：Worker 读 problems/<id>.md 参考解析后改推导、模拟和答案。进行中：gd22-10、gd23-07、gd23-09、gd23-10
- gd23-07 已修：原把恒星背后也算一次遮挡、周期算成 2 倍；改 T=t1−t0，choice B，三项检查通过。
- gd22-10 已修：原把 M、N 放在导线两侧（题图是同侧），A、B、D 判反；改后 choice AC，三项检查通过。
- gd23-10 已修：B 项漏算电机 F 的冲量（−0.22+0.04=−0.18），把 B 判错；改后 choice BD，三项检查通过。
- gd23-09 已修：白态电势差符号算反（应 +20 V），A、B 判反；改后 choice AC，三项检查通过。
- gd24-08 已修：C 项做功符号写反（q<0、φM−φN<0，W_MN>0）；改后 choice AC，三项检查通过。
- gd22-13 已修：摩擦反作用力方向写反、静止时漏了滑块重力（N1=6、N2=7）；改为 N1=8 N、N2=5 N，三项检查通过。
  注意：keycheck 只报了 N_2，没报 N_1=6 错——数值核对是「课件里出现过该数」即算对（v_1=8 让 N_1=8 也"命中"），所以答案不符项数是下限。
- gd24-05 已修：推导对但代表值算错（2.00 m/s 写成 0.20），把 B 当答案；改后 choice A，三项检查通过（剩一条「画面偏小」作图建议，不算排版问题）。
- gd24-14 已修：把碰撞段压入位移也算进「上升最大高度」（−0.47 m）；改为 h=v1²/(2g)=0.2 m，顺带修了位移公式冲量项系数；三项检查通过（1 条 ForceDiagram 浮点提醒）。
- 8 道全部修完（2026-10-13）。
