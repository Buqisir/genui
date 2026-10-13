# 评测汇总：generated-grok/zj-final

- 题数 35；最终校验通过 27/35（77%）；第一次就通过校验 27/35（77%）
- 有自动答案键的 33 题：最终答案正确 33/33（100%）；第一次答案正确 33/33（100%）
- 校验通过且答案正确 27/35（77%）（无答案键的算作待人工）
- 总用时 959 分钟，总费用 $7.30

| 题型 | 题数 | 校验通过 | 答案正确（有键） |
|---|---:|---:|---:|
| single | 18 | 11/18（61%） | 18/18（100%） |
| calc | 5 | 4/5（80%） | 4/4（100%） |
| multi | 5 | 5/5（100%） | 5/5（100%） |
| fill | 1 | 1/1（100%） | 1/1（100%） |
| experiment | 6 | 6/6（100%） | 5/5（100%） |

| 题目 | 题型 | 知识点 | 图 | 次数 | 校验 | 答案 | 首次校验 | 首次答案 | 用时 | 费用 | 首次错误 |
|---|---|---|---:|---:|:-:|:-:|:-:|:-:|---:|---:|---|
| zj-01 | single | 重心与翻倒 | 1 | 1 | ✓ | ✓ | ✓ | ✓ | 33m | $0.26 |  |
| zj-02 | single | 完全失重与浮力 | 1 | 1 | ✗ | ✓ | ✗ | ✓ | 23m | $0.20 | <Motion> gEff 是组件算出的随时间变化的量，与课件里已声明的名字重名；<Motion> gEff 是组件算出的随时间变化的量，与课件里已声明的名字重名 等 6 条 |
| zj-03 | calc | 组合轨道与细管 | 1 | 1 | ✓ | ✓ +1人工 | ✓ | ✓ | 33m | $0.30 |  |
| zj-04 | calc | 组合轨道与细管 | 1 | 1 | ✗ | ✓ +1人工 | ✗ | ✓ | 32m | $0.30 | <Sim> 初始状态：locate is not defined；<Sim> 快捷按钮「（1）h = 0.8 m」：locate is not defined 等 9 条 |
| zj-05 | multi | 有限波列叠加 | 2 | 1 | ✓ | ✓ | ✓ | ✓ | 20m | $0.18 |  |
| zj-06 | single | 开孔电极的电场 | 1 | 1 | ✗ | ✓ | ✗ | ✓ | 30m | $0.27 | <Figure> 初始状态 运行超时或出错：Script execution timed out after 2000ms |
| zj-07 | single | 导体表面等势 | 1 | 1 | ✗ | ✓ | ✗ | ✓ | 25m | $0.20 | <Sim> 初始状态 运行超时或出错：Script execution timed out after 2000ms；<Sim> 快捷按钮「题图位置」 运行超时或出错：Script execution timed out after 2000ms 等 4 条 |
| zj-08 | single | 点电荷电场中的运动 | 1 | 1 | ✗ | ✓ | ✗ | ✓ | 24m | $0.25 | <Plot> areas[0].series 超出范围：undefined；<Plot> areas[1].series 超出范围：undefined |
| zj-09 | single | 点电荷与圆周约束 | 1 | 1 | ✓ | ✓ | ✓ | ✓ | 28m | $0.26 |  |
| zj-10 | calc | 电桥 | 2 | 1 | ✓ | — +3人工 | ✓ | — | 30m | $0.27 |  |
| zj-11 | calc | 恒流源与安培力 | 1 | 1 | ✓ | ✓ +4人工 | ✓ | ✓ | 31m | $0.27 |  |
| zj-12 | single | 蹄形磁铁与动生电动势 | 2 | 1 | ✓ | ✓ | ✓ | ✓ | 17m | $0.15 |  |
| zj-13 | single | 螺绕环 | 2 | 1 | ✓ | ✓ | ✓ | ✓ | 18m | $0.17 |  |
| zj-14 | calc | 定轴转动与圆盘发电机 | 1 | 1 | ✓ | ✓ +1人工 | ✓ | ✓ | 33m | $0.27 |  |
| zj-15 | single | 定轴转动与电磁阻尼 | 2 | 1 | ✓ | ✓ | ✓ | ✓ | 28m | $0.23 |  |
| zj-16 | single | 理想二极管与自感 | 1 | 1 | ✓ | ✓ | ✓ | ✓ | 24m | $0.19 |  |
| zj-17 | multi | 全反射与折射 | 2 | 1 | ✓ | ✓ | ✓ | ✓ | 26m | $0.21 |  |
| zj-18 | single | 全反射测折射率 | 2 | 1 | ✓ | ✓ | ✓ | ✓ | 22m | $0.23 |  |
| zj-19 | single | 电子衍射图样 | 1 | 1 | ✓ | ✓ | ✓ | ✓ | 11m | $0.10 |  |
| zj-20 | fill | 变截面容器与气体 | 1 | 1 | ✓ | ✓ +1人工 | ✓ | ✓ | 15m | $0.15 |  |
| zj-21 | multi | 光电管与光谱 | 2 | 1 | ✓ | ✓ | ✓ | ✓ | 15m | $0.14 |  |
| zj-22 | single | 实测数据折线 | 1 | 1 | ✗ | ✓ | ✗ | ✓ | 36m | $0.18 | 第 460 行：名字 g 重复声明；第 478 行：名字 Tmin 重复声明 |
| zj-23 | experiment | 多用电表与变压器 | 5 | 1 | ✓ | ✓ +1人工 | ✓ | ✓ | 41m | $0.20 |  |
| zj-24 | experiment | 弹簧测力计 | 4 | 1 | ✓ | ✓ +4人工 | ✓ | ✓ | 58m | $0.22 |  |
| zj-25 | experiment | 油膜法 | 1 | 1 | ✓ | ✓ +1人工 | ✓ | ✓ | 15m | $0.14 |  |
| zj-26 | single | 理想变压器 | 1 | 1 | ✓ | ✓ | ✓ | ✓ | 29m | $0.15 |  |
| zj-27 | experiment | 单刀双掷开关 | 2 | 1 | ✓ | ✓ | ✓ | ✓ | 54m | $0.23 |  |
| zj-28 | single | 共点力平衡 | 1 | 1 | ✗ | ✓ | ✗ | ✓ | 30m | $0.17 | 组件标签没有闭合；课件没有画出物理情景：至少要有一个 Sim、Figure、ForceDiagram、Circuit、Instrument、TickerTap |
| zj-29 | single | 平抛运动 | 1 | 1 | ✓ | ✓ | ✓ | ✓ | 25m | $0.19 |  |
| zj-30 | single | 碰撞与摩擦 | 1 | 1 | ✗ | ✓ | ✗ | ✓ | 22m | $0.22 | 答案不一致：tRel 按课件公式算出 NaN，answers 写的是 0.4；答案不一致：QEnd 按课件公式算出 NaN，answers 写的是 3 等 3 条 |
| zj-31 | multi | 洛伦兹力与冲量 | 1 | 1 | ✓ | ✓ | ✓ | ✓ | 37m | $0.22 |  |
| zj-32 | multi | 感生电场 | 2 | 1 | ✓ | ✓ | ✓ | ✓ | 33m | $0.19 |  |
| zj-33 | single | 带电粒子在匀强电场中 | 1 | 1 | ✓ | ✓ | ✓ | ✓ | 18m | $0.16 |  |
| zj-34 | experiment | 插针法与折射 | 1 | 1 | ✓ | — +3人工 | ✓ | — | 17m | $0.15 |  |
| zj-35 | experiment | 测电源电动势 | 2 | 1 | ✓ | ✓ +1人工 | ✓ | ✓ | 26m | $0.27 |  |

## 反复出现的校验错误

| 次数 | 题数 | 例子 |
|---:|---:|---|
| 8 | 1 | <Sim> 快捷按钮「（1）h = 0.8 m」：locate is not defined |
| 3 | 1 | <Motion> gEff 是组件算出的随时间变化的量，与课件里已声明的名字重名 |
| 3 | 1 | <Sim> hud[0] 有未知字段 color（可用：symbol、label、expr、unit、digits、format） |
| 3 | 1 | <Sim> 快捷按钮「题图位置」 运行超时或出错：Script execution timed out after 2000ms |
| 2 | 1 | <Plot> areas[0].series 超出范围：undefined |
| 2 | 1 | 答案不一致：tRel 按课件公式算出 NaN，answers 写的是 0.4 |
| 1 | 1 | <Sim> 初始状态：locate is not defined |
| 1 | 1 | <Figure> 初始状态 运行超时或出错：Script execution timed out after 2000ms |
| 1 | 1 | <Sim> 初始状态 运行超时或出错：Script execution timed out after 2000ms |
| 1 | 1 | 第 460 行：名字 g 重复声明 |
| 1 | 1 | 第 478 行：名字 Tmin 重复声明 |
| 1 | 1 | 组件标签没有闭合 |
| 1 | 1 | 课件没有画出物理情景：至少要有一个 Sim、Figure、ForceDiagram、Circuit、Instrument、TickerTape、EnergyLevels、Wiring、GasBox、GasTube 或 Fringes（只有  |
| 1 | 1 | 答案不一致：QEnd 按课件公式算出 NaN，answers 写的是 3 |

## 最终课件用到的组件（按题数）

Param 35，Question 35，Preset 35，Status 35，Answer 35，Define 34，Readout 34，Plot 33，Sim 24，Figure 14，Motion 11，Circuit 11，Ledger 10，ForceDiagram 9，Dial 7，Optics 3，Instrument 3，Fringes 2，EnergyLevels 1，Bars 1

## Sim / Figure 里用到的 v 工具（按题数）

view 32，label 29，line 26，vec 25，circle 23，event 23，dim 19，ellipse 13，text 13，ball 12，strobe 11，path 10，ground 9，trail 6，block 6，field 6，particles 4，axisX 4，rope 3，spring 3，optics 3，vessel 2，track 2，cart 2，efield 2，arrow 2，regions 2，bar 2，com 1，at 1，waves 1，magnet 1，toroid 1，pulse 1，stars 1，orbit 1，planet 1，satellite 1，transformer 1，solenoid 1，oilFilm 1，pulley 1，plates 1
