# 课件语法规范 v0.2

一道题对应一份课件文件（`.md`）。模型（Codex / DeepSeek）离线生成课件，校验通过后入库，前端渲染给学生看。

设计依据见 `genui-capture-findings.md`。核心取舍：

- **模型写内容，组件保证画面质量。** 高频图形（曲线、受力、电路、尺寸标注）由我们的预制组件绘制，模型只描述"画什么"。
- **数值在外层算，沙箱只负责画。** 外层用安全的数学表达式，可以离线检查；模型写的 JS 只在沙箱里运行。
- **只有一层沙箱。** 课件离线审核，外层组件都是我们自己的可信代码，只有 `<Sim>` 和 `<Figure>` 里的代码进沙箱。

---

## 一、文件结构

```
---
id: r6-06-car-chase
title: 追及相遇：前车刹车
subject: physics
topic: 追及相遇
source: 必修1 专题例题
answers:                      # 参考答案，校验用，不显示
  - { name: dmax, value: 16, unit: m }
  - { name: tCatch, value: 8, unit: s }
---

正文 Markdown……

<Param name="t" label="时间" min={0} max={8} step={0.1} value={0} unit="s" />

<Plot … />

正文 Markdown……
```

- 开头是 YAML 头信息，`id`、`title`、`question`（题目原文，页头「题目原文」按钮展开）必填；非选择题还必须有 `answers`。`answers` 用来自动核对，学生看不到。
- 选择题另写 `choice`：选出的选项字母，多选按字母顺序连写（`choice: C`、`choice: BD`），同样只用于核对。选项里能写成数值的量照样写进 `answers`；没有数值时写 `answers: []`。
- 可选头信息：`breadcrumb`（字符串数组，页头面包屑，不写时用 `topic`、`source`）、`theme`（`light` 默认，`night` 夜光主题，适合天体、光学、电磁这类"发光"情景；学生也可以在页头切换）。

### 页面布局（自动）

渲染器按组件类型自动排版，模型不用管位置：

- **左侧主栏**（920 px，12 栏）：情景（`Sim`、`Figure`、`ForceDiagram`、`Circuit`）、图表（`Plot`、`Bars`、`Ledger`、`Dial`）。第一个情景通栏；宽图表和窄卡片相邻时自动并排（7 + 5 栏），两张窄卡片并排（6 + 6）。需要时用 `size="full" | "wide" | "narrow"` 改。
- **右侧栏**（吸顶）：`Question`、`Param`、`Preset`、`Status`、`Readout`、`Answer`，按这个顺序排。
- **下方「分析与解答」**：全部 Markdown 正文。
- 窄屏（< 1180 px）单栏：问题 → 第一个情景 → 参数 → 读数 → 其余图表 → 答案。
- 正文是 Markdown，支持 GFM 表格和 KaTeX 公式：行内 `$...$`，独立公式 `$$...$$`。
- 组件写成大写字母开头的标签，见下一节。

## 二、组件标签的写法

**组件标签必须单独成块**：标签前后各空一行，不能写在段落、列表或表格中间。

```
<Name prop="字符串" prop={数字、布尔、数组或对象} />
```

- 字符串属性用双引号。
- 其余属性用 `{...}` 包住，里面是 **JSON5**（键名可以不加引号，可以用单引号，可以有末尾逗号）。**不能写 JS 表达式、函数或变量。**
- 需要随参数变化的值，写成**表达式字符串**，属性名以 `expr` 结尾，或者放在文档注明"表达式"的字段里（见第三节）。
- 只有 `<Sim>` 和 `<Figure>` 有内容体：`<Sim …>` 和 `</Sim>` 各占一行，中间是 JS 代码（`<Figure>` 同理，代码调用 `figure({...})`）。其他组件一律自闭合 `/>`。

## 三、参数和表达式

课件里所有可交互的量都是**参数**，用 `<Param>` 声明。参数是全文共享的：任何组件都可以读，任何控件都可以改。

### `<Param>`：声明参数，同时显示滑块

| 属性 | 类型 | 说明 |
|---|---|---|
| `name` | 字符串 | 参数名，字母开头，只含字母、数字、下划线 |
| `label` | 字符串 | 显示名 |
| `value` | 数字 | 初始值，**用题目给的数值** |
| `min` / `max` / `step` | 数字 | 范围和步长 |
| `unit` | 字符串 | 单位，可选 |
| `symbol` | 字符串 | 物理量符号，斜体衬线显示在名字前（如 `v_0`、`θ`），可选 |
| `color` | 字符串 | 符号颜色，取物理量名（见下方「颜色」），可选 |
| `digits` / `format` | 数字 / 字符串 | 数值显示的小数位；不写时自动取约 3 位有效数字（小于 0.001 或不小于 10⁵ 的数写成 ×10ⁿ，100000 以内的整数原样显示）；写了 `digits` 但非零的数会被舍成 0 时，也改用有效数字。`format` 取 `sci`（科学计数）或 `percent`，可选 |
| `control` | 字符串 | `slider`（默认）或 `stepper`（带 −/+ 按钮，适合整数，如"几只电热器"），可选 |
| `hidden` | 布尔 | 只声明不显示滑块（比如只由 `<Sim>` 时间轴驱动的量），可选 |

拖动滑块离开初始值后，轨道上会出现「题目原值」标记，点一下补间回去。

### 颜色

**颜色只属于物理量。** 所有 `color` 字段取下列名字，深浅主题自动换色：

| 名字 | 用于 |
|---|---|
| `velocity` | 速度、位移、运动轨迹 |
| `force` | 力、冲量、热、事件脉冲 |
| `accel` | 加速度 |
| `charge` | 电荷、电流、光、能量输出 |
| `field` | 场（电场、磁场）、势能 |
| `ink` / `graphite` / `steel` | 中性：正文墨色 / 次要 / 刻度、虚影 |

旧名字 `blue red purple orange green gray` 仍可用，分别等同 `velocity force accel charge field steel`。

`<Param>` 也可以声明**选项型参数**：

```
<Param name="mode" label="情形" options={[{value: 1, label: "S 闭合"}, {value: 2, label: "S 断开"}]} value={1} />
```

### `<Define>`：派生量

```
<Define name="vB" expr="max(vB0 - a*t, 0)" />
```

派生量由表达式算出，其他表达式可以引用它。不能循环引用。

### `<Motion>`：运动积分

只写受力（各状态量的变化率），不写解析解。组件用 RK4 积分，用二分法定位事件时刻，结果作为名字交回页面。不显示在页面上。

```
<Motion name="ball" state={{y: 0, v: "v0"}} rates={{y: "v", v: "-g - k*v"}} until={10}
  events={[{name: "tTop", when: "v", dir: "down"}, {name: "tBack", when: "y", dir: "down", stop: true}]}
  read={{H: "max(y)", vBack: "v @ tBack"}} />
```

| 属性 | 说明 |
|---|---|
| `name` | 运动的名字。`ball.y(t)`、`ball.v(t)` 是各状态量随时间的函数（可在任何表达式里用：`<Plot>` 曲线 `ball.v(t)`、`<Readout>`/`hud` 里配 Sim 时钟写 `ball.y(tm)`）；`ball.tEnd` 是积分结束的时刻 |
| `state` | 状态量和初始值（可写表达式），如位置、速度、角度、电荷量 |
| `rates` | 各状态量对时间的变化率 d□/dt，可用 `t`、全部状态量和课件里的参数、Define。分段受力写条件表达式：`"v > 0 ? -g - a1 : -g + a2"`；没写的状态量保持不变（可当作「阶段」标记，配合事件的 `set` 切换） |
| `until` | 最长积分时长（可写表达式） |
| `events` | 事件 `{name, when, dir, stop, set}`：`when` 表达式过零的时刻（`dir: "down"` 由正变负，`"up"` 由负变正，默认两者都算）。`name` 把**第一次**发生的时刻发布出去（没发生是 NaN），可以直接写进 Sim 的 `marks`、`duration` 和 `answers`；`stop: true` 到此结束；`set: {v: "-e*v"}` 在事件时刻改状态（反弹、绳子绷紧、换阶段），可以多次发生 |
| `read` | 发布读数：`"v @ tBack"` 某时刻的表达式值（时刻可写事件名、`tEnd` 或表达式），`"max(y)"`、`"min(y)"` 全程最大/最小值（`0.5*m*v^2 @ tBack` 这样的表达式也行） |
| `steps` | 积分步数（默认 800，50–20000）。事件时刻和读数另行精确定位，一般不用改 |

**分段过程要精确**：受力在某一刻突变（刹车停住、绳子松弛、离开斜面）时，不要把条件写进 `rates`（积分步跨过突变点会让时刻偏差一步）。用一个不写 rates 的阶段量，在事件里切换：

```
<Motion name="chase" state={{xA: 0, xB: "x0", vB: "vB0", braking: 1}} rates={{xA: "vA", xB: "vB", vB: "-a*braking"}} until={120}
  events={[{name: "tStop", when: "vB", dir: "down", set: {vB: 0, braking: 0}}, {name: "tCatch", when: "xA - xB", dir: "up", stop: true}]}
  read={{dmax: "max(xB - xA)"}} />
```

**交给动画**：`<Sim params={["ball", ...]}>` 里 `p.ball.y(t)`、`p.ball.state(t)`（返回 `{t, y, v}`）、`p.ball.tEnd` 都能用，`at(t, p)` 里直接返回 `p.ball.state(t)` 即可，拖动进度条、轨迹、频闪都正常。改参数时自动重新积分。

能写简单解析解（匀变速、平抛）时仍可直接在 `at` 里写公式；有阻力、变力、弹簧、碰撞反弹、多阶段切换这类手算容易错的过程，用 `<Motion>`，关键时刻交给 `events`，不要手算后硬写进 `marks`。

#### 受力驱动：只写受力，加速度由组件按 ΣF = ma 算

不写 `rates`，改写 `mass` 和 `forces`（写法和 `<ForceDiagram>` 的力一样，`angle`、`magnitude` 可以用 `t` 和状态量），组件每一步算合力、除以质量。

| 情形 | 写法 | 状态量 | 组件算出的量 |
|---|---|---|---|
| 平面内自由运动（抛体加阻力、带电粒子在电磁场中） | `mass` + `forces`，不写 `along` | `x y vx vy` | `accx`、`accy` |
| 沿直线运动（斜面、水平面、竖直线） | 再写 `along`：+x 的方向角（度） | `x`（沿 along 的位移）、`v` | `acc`；写 `solve` 的力（一般是支持力）由垂直方向的平衡解出 |
| 多个物体（连接体、板块模型） | `bodies`：每个 `{name, mass, along, x, v, forces}`；`ropes: [["A", "B"]]` | 自动生成 `xA vA xB vB …` | `accA`、`accB`、各 `solve` 名字 |
| 沿轨道（直线段 + 圆弧） | `track`：`pieces` 是若干 `{line}`、`{arc}`；再写 `mass` + `forces` | `s`（从起点量的弧长）、`v` | `x` `y` `vx` `vy` `speed` `tangent` `normalDir` `acc` `accx` `accy`，支持力（默认 `N`），可选摩擦力 |
| 绕固定轴转动（杆、圆盘、物理摆） | `axis`：`inertia`，可选 `com`、`reaction`；`forces` 每个力写 `at`，可选 `torques` | `theta`（转角）、`omega` | `alpha`、`tau`，质心 `comX` `comY`，轴的作用力，各力的力矩 |

```
<Motion name="blk" mass="m" along={30} until={4}
  state={{x: 0, v: "v0"}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g"},
    {label: "N", angle: 120, solve: "N"},
    {label: "f", friction: {mu: "mu", static: "mus", normal: "N", together: "tStop"}, solve: "f"}
  ]} />
```

- **摩擦力**写 `friction: {mu, static, normal, with}`，不写 `angle`、`magnitude`：`normal` 是正压力（通常写支持力 `solve` 出的名字），`static` 是静摩擦因数（默认等于 `mu`），`with` 是另一个物体的名字（默认是地面/斜面）。组件自己判断方向和静/动：相对运动时是 μN、与相对速度反向；相对速度减为零时，静摩擦（≤ μs·N）够就粘住，不够就反向滑；粘住后需要的静摩擦超过 μs·N 就重新滑动。摩擦力的 `solve` 名字发布的是**沿 +x 的分量**（可正可负）。
- **摩擦事件**：`slip: "tSlip"` 记下开始滑动的时刻（从静止被拉动、物块相对木板开始滑），`together: "tSame"` 记下相对速度减为零的时刻（共速、停下）。和 `events` 的名字一样可以写进 `marks`、`Readout`、`answers`。
- **传送带**写 `friction.belt`（带面速度，可写表达式，**沿该物体 +x 为正**），不要再写 `with`。相对速度是 v − v_belt：减到 0 且静摩擦够（≤ μs·N）就粘在带上，跟着带走，不是停在地上；不够就继续滑。粘住后需要的力超过 μs·N 再松开。组件另外积出滑痕 `slide`（∫|v−v_belt| dt，只在滑动时增长）和摩擦生热 `Q`（∫ μN|v−v_belt| dt）。单物体就叫 `slide`、`Q`，多个物体叫 `slideA`、`QA`。读数写 `belt.slide(t)`、`belt.Q(t)`，或 `read` 里 `"slide @ tEnd"`。不要自己对相对速度积分。
- **浮力**写 `{label, angle, buoyancy: {rho, V}}`，不写 `magnitude`。大小是 ρ·V·g_eff，`angle` 给方向（向上写 90）。`solve: "Fb"` 把这个大小发出去。
- **非惯性系**写 `aFrame`（容器加速度，**向下为正**；吊篮以 a 向上加速就写 `"-a"`）。`bodies` 里也可以写 `frame: "篮子"`，用那个物体加速度的竖直分量。有效重力 `gEff = g − aFrame`（容器自由下落、`aFrame = g` 时为 0）。作者仍写真实重力 `m*g`，组件另加向上的惯性力 m·aFrame；浮力用 g_eff，所以完全失重时浮力和重力在容器里一起消失，弹簧力还在。不要把重力改写成 `m*gEff` 再叠一次惯性力。算出来的 `acc` 是**相对容器**的；绝对加速度向上的分量是 `aAbs`（多个物体 `aAbsA`），平面自由运动是 `aAbsx`、`aAbsy`（`aAbsy` 向上为正）。
- **翻倒**写 `tip: {halfWidth, comHeight, mu, a}`。`halfWidth` 是质心到前/后缘的水平距离 b，`comHeight` 是质心高度 h。水平加速度 `a` **向右为正**；不写就用物体自己的水平加速度（刹车的车子要写车子的 a，物体相对车子静止时自己的加速度是 0）。支持力离质心 `nAt`（向右为正，夹在 ±b）。`|a|·h > g·b` 时 `tips` 为 1，`edge` 为 −1（绕左缘，a>0）或 +1；刚好等于不算翻。`|a| > μ g` 时 `slides` 为 1；`μ < b/h` 时 `slidesFirst` 为 1（先滑）。单物体名字是 `nAt`、`tips`、`edge`、`slides`、`slidesFirst`，多个物体加物体名，读法同 `blk.tips(t)`。翻倒之后绕那条棱转，改用下文「绕固定轴转动」的 `<Motion axis>`：轴放在棱上，`inertia` 对棱，`com` 写质心相对棱的随体坐标。`tip` 只判断会不会翻、支持力移到哪，不自己把箱子转起来。
- **绳**：`ropes` 里的绳拉第一个物体沿它的 +x、拉第二个物体沿它的 −x（例：桌面上 A 的 along 指向滑轮，悬挂的 B 的 along 朝下），两者速率相同；写 `{between: ["A", "B"], solve: "T"}` 发布绳的拉力。拉力算出为负时校验提醒「绳会松弛」。
- 组件算出的量都是**随时间变化的**，挂在运动的名字下：`blk.acc(t)`、`blk.N(t)`、`blk.f(t)`，`read` 里可以直接写 `"max(f)"`、`"f @ tStop"`；`<ForceDiagram>` 的 `magnitude` 写 `"pk.fA(tk)"` 就能随动画时刻显示受力。`<Sim>` 的 `p.blk.state(t)` 也带着这些量。
- 每个物体最多一个力写 `solve`（垂直方向只有一个平衡方程）；垂直于运动方向的力不平衡（忘了支持力）时校验提醒。
- 板块模型的上下两个物体：上面物体的支持力 `solve: "NA"`，下面物体要写它的反作用力 `{label: "N'", angle: -90, magnitude: "NA"}`，地面支持力再 `solve`。物体按 `bodies` 的顺序求解，所以被引用的物体排在前面。

#### 沿轨道运动：直线 + 圆弧的组合轨道

一个物体被约束在直线段和圆弧拼成的轨道上。不写 `along`、`bodies`、`rates`，写 `mass`、`forces` 和 `track`。状态量是 `s`（从第一段起点沿轨道量的弧长）和 `v`（沿 +s 的速度）。支持力和摩擦力由组件算，**不要**在 `forces` 里写 `solve` 或 `friction`。

```
<Motion name="ball" mass="m" until={6}
  state={{s: 0, v: "v0"}}
  track={{
    pieces: [
      {line: [0, "h", "L1", "h"]},
      {arc: ["L1", "h + R", "R", -90, 270]},
      {line: ["L1", "h", "L1 + L2", "h"], mu: "mu"},
      {arc: ["L1 + L2", "h + R", "R", 90, 0], pipe: true}
    ],
    normal: "N", friction: "f", leave: "tLeave", together: "tStop", slip: "tSlip",
    start: "fly", end: {bounce: 1}
  }}
  forces={[{label: "G", angle: -90, magnitude: "m*g"}]}
  events={[{name: "tLand", when: "y", dir: "down", stop: true}]}
  read={{NC: "N @ tLeave"}} />
```

- `pieces` 按行进顺序接上。`line: [x1, y1, x2, y2]`；`arc: [cx, cy, r, a1, a2]`（度，逆时针为正，从 a1 走到 a2，和 `v.track` 一样）。坐标、`mu`、`static` 可以是数字或表达式，但轨道在一次运动里不变，只能用参数，不能用 `t`、状态量或 `N` 这些随时间变的名字。
- 剖面线在行进方向的右侧，物体在左侧：从左到右的直线，物体在上方；逆时针圆弧，物体在内侧（竖直圆轨道）；顺时针圆弧，物体在外侧（凸拱）。某一段写 `flip: true`，或整条轨道写 `flip: true`，就换到另一侧（两处都写则抵消）。
- 支持力沿物体这一侧的法向，**正**表示轨道把物体往离开实体的方向推（名字默认 `N`，用 `normal` 改）。圆轨道最高点附近它会减小；单侧轨道上减到 0 就脱离，之后按抛体飞；从直线以大于 √(gR) 的速率进入凸拱，进入的那一刻就飞出（也记入 `leave`）。`pipe: true`（写在某一段，或整条 `track` 上）是细管，两边都有壁，支持力可以为负，不会因支持力变号而脱离。
- 摩擦写在**那一段**上：`mu` 是动摩擦因数（默认 0），`static` 是静摩擦因数（默认等于 `mu`）。滑动时大小是 μ|N|、方向与速度相反；速度减到 0 时，静摩擦够就粘住（`together`），不够就反向滑；粘住后切向力超过 μs|N| 再滑动（`slip`）。光滑段不写 `mu`。停在水平光滑面上的球没有切向力，会一直停着。
- `leave` 是离开轨道的时刻（中途脱离，或从一端飞出），只发布第一次。`start`、`end` 是 s 退回 0、或走到轨道全长时怎么办：`"fly"`（默认，沿当时的切线飞出，也记入 `leave`）、`"stop"`（积分停在这里，不算离开）、`{bounce: e}`（速度变成 −e·v，比如尽头的弹性板）。
- 组件随时间给出 `x` `y` `vx` `vy` `speed`、`tangent`（+s 的方向，度）、`normalDir`（支持力为正的方向，度）、`acc`（沿轨道的加速度；飞起来以后是 0）、`accx` `accy`（含向心加速度），以及支持力和摩擦力（写了 `friction` 才发布摩擦力）。`forces` 里可以用这些名字，例如始终逆着 +s 的阻力 `{angle: "tangent + 180", magnitude: "0.2*m*g"}`。
- 离开以后**不会再落回轨道**。飞行中 `s`、`v` 冻住（`tangent` 也停在离开时 +s 的方向），位置和速度看 `x` `y` `vx` `vy` `speed`。要停在落地，自己写事件，如 `when: "y"`。
- 两段相接处按光滑连接处理：速率保留，方向换成下一段的切线。**不要**手写 `v² = v0² − 2gh` 或 `N = mv²/r − mg` 去驱动画面。
- 带电小球可以同时写 `charge` 和 `fields`（匀强电场里的圆轨道）。
- 画面用 `v.track(m, p.ball)` 画这次运动冻住的轨道（细管是双线，球走中心线）。`(x, y)` 是接触点；画有大小的小球时用返回值的 `place`：`const tr = v.track(m, p.ball); const [bx, by] = tr.place(s, r)`（`s` 是 `at` 返回的状态，要带 `x` `y` `normalDir` `side`），单侧轨道上球心沿法向离开轨道 r，细管里和飞行中就在 `(x, y)`。`side` 在单侧轨道上为 1，细管里、飞起来以后为 0。

#### 绕固定轴转动

刚体绕一根固定轴转动（杆、圆盘、物理摆、转动切割）。不写 `along`、`bodies`、`ropes`、`track`、`fields`，也不要手写 `rates`。状态量固定是 `theta`（转角，弧度，从写随体坐标时的那个方位量起，逆时针为正）和 `omega`（dθ/dt）。

```
<Motion name="pend" until={10} mass="m"
  axis={{x: 0, y: 0, inertia: "m*l^2", com: [0, "-l"], reaction: "F_O"}}
  state={{theta: "th0", omega: 0}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g", at: "com"},
    {label: "F_A", angle: 0, magnitude: "B*I*L", at: [0, "-l"], torque: "tauA"}
  ]}
  torques={[{label: "阻力矩", magnitude: "-k*omega"}]}
  circuit={{source: {type: "battery", label: "棒（E = BLv）", emf: "B*L*l*omega*cos(theta)", r: "R", read: "I"}, load: {type: "wire"}}} />
```

- `axis.x`、`axis.y` 是轴在世界上的位置（不写就是原点）。轴一次运动里不动，只能用参数，不能用 `t`、状态量或电路读数。`axis.inertia` 是对这根轴的转动惯量；用了状态量就每一步重算。
- 随体坐标跟着 `theta` 转：世界上的点 = 轴的位置 + 把随体坐标转过 `theta`（逆时针）。`+x` 向右、`+y` 向上，力的 `angle` 仍是度、从 +x 逆时针量。`body: true` 时角度跟着刚体走（世界角度 = `angle` + `theta` 的度数），用来写始终垂直于杆的安培力。
- `forces` 里每个力都要写 `at`：`"com"`，或随体坐标 `[x, y]`。力矩是 r × F 的 z 分量，r 是从轴到作用点的世界矢量，逆时针为正。`torque: "名字"` 把这个力的力矩发出去。`torques` 是额外的纯力矩 `{label, magnitude}`（逆时针为正），比如阻力矩、驱动力矩，表达式可以用 `t`、状态量和电路的 `read`。
- `axis.com` 是质心相对轴的随体坐标 `[x, y]`，只能用参数。写了就发布质心的世界坐标 `comX`、`comY`。`axis.reaction: "F_O"` 发布轴对刚体的力 `F_Ox`、`F_Oy` 和大小 `F_O`，这要同时写 `mass` 和 `com`：质心加速度是 α × r − ω² r，轴的力 = 质量 × 质心加速度 − 全部外力。这个模式没有 `solve`、没有摩擦，轴的力不要写进 `forces`。
- 角加速度 `alpha` = 合力矩 `tau` / 转动惯量。组件给出的量都随时间变化，挂在运动名字下：`pend.alpha(t)`、`pend.tau(t)`、`pend.F_O(t)`、`pend.tauA(t)`、`pend.comX(t)`。和别的模式一样可以用 `events`、`read`、`circuit`（每一步先解电路再算力矩）。
- 转动切割的电动势写 `0.5*B*omega*r^2` 进 `circuit`，安培力矩用 `forces`（`at` 写作用点）或 `torques` 写回，不要手写 θ、ω 的 `rates`。悬挂在竖直磁场里的棒，电动势写成 `B*L*l*omega*cos(theta)` 时，水平安培力的方向要和这个正方向配成楞次定律（力矩与 `omega` 相反）。

#### 接电路：电磁感应

导体棒切割磁感线、双棒、棒接电容，给 `<Motion>` 加 `circuit`。`circuit` 的写法和 `<Circuit>` 的 `source` / `load` 一样（同一套元件、`read`、`note`、电容、线圈、开关）。区别是电路里的表达式可以用**这次运动的** `t` 和状态量（`x`、`v`，或多个物体的 `xA`、`vA`，以及 `state` 里自己加的量）。棒就是一个电源，电动势 `B*L*v`，安培力写回 `forces`：

```
<Motion name="rod" until={3} mass="m" along={0} state={{x: 0, v: 0, q: 0, Q: 0}}
  rates={{q: "I", Q: "I^2*(R + r)"}}
  forces={[
    {label: "F", angle: 0, magnitude: "F"},
    {label: "F_A", angle: 180, magnitude: "B*I*L"}
  ]}
  circuit={{
    source: {type: "battery", label: "ab（E = BLv）", emf: "B*L*v", r: "r", read: "I"},
    load: {type: "resistor", label: "R", R: "R", read: {U: "UR"}}
  }} />
```

- 电路的 `read` 名字挂在运动上，是时间的函数：`rod.I(t)`、`rod.UR(t)`，**不是**单独的顶层名字。同一个 `<Motion>` 的 `forces`、`rates`、`events`、`read` 可以直接用这些名字。电荷量和焦耳热用 `state` + `rates` 积出来（上面的 `q`、`Q`），不要再写 `q = BLx/R`。
- 每一步先解电路、再算受力，所以电动势、电阻、电容、开关 `closed` **只能**用 `t` 和状态量。用了加速度、`solve` 出的支持力或绳拉力、以及电路自己的 `read` 名字，校验会报错：那些量要等电路解完才有当前值。`note`、灯泡 `lit` 只是显示，可以用全部局部名字。
- 回路电阻写在电阻或电源内阻上。导轨两端只用导线连起来时，`load` 写 `{type: "wire"}`，棒的内阻 `r` 就是整个回路的电阻（电流 = 电动势 / r）；这时 `r` 必须写，没有内阻的电源被导线直接连起来是真短路，校验会报出来。
- **双棒**（两根棒在同一对导轨上，电动势方向相反）：两根电源串联，第二根写 `positive: "right"`。这样两棒同向运动时电动势互相削弱；`read` 放在第一根上，电流从它的正极流出为正。第一根受安培力向后（`angle: 180`），第二根向前（`angle: 0`），大小都是 `B*I*L`。负载可以是 `{type: "wire"}`，回路电阻就是两根棒的内阻。
- **棒接电容**：理想导线下充电是瞬间完成的，积分会报「时间常数太小」。给棒写一个小内阻 `r`，过渡很短，之后加速度趋于 `F/(m + B²L²C)`。
- **开关**可以跟时刻或位置走：`closed: "t >= 0.5"`、`closed: "x >= 1"`。开关时刻会被精确定位；`closed` 里写的是运动自己的 `t` 或状态量，不是外面的滑块。
- 用 `<Circuit motion="rod" at="tk">` 把这个电路画出来（见 `<Circuit>`）。
- **已知限制**：电动势或电阻随位置**突变**（线框进入、离开磁场边界，写成 `emf: "x < d ? B*L*v : 0"`）时，跨过边界的那一步有误差，大小和步长成正比（默认步数下速度差在万分之几）。需要更准时加大 `steps`；在边界加一个事件（`events: [{name: "tIn", when: "x - d"}]`）让积分在边界处落一步，误差还能再小一半左右。

#### 带电粒子：电场与磁场

平面里的带电粒子给 `<Motion>` 写 `charge` 和 `fields`，不要手写 `r = mv/(qB)`、偏转距离、速度选择器公式去驱动画面。`state` 写 `x`、`y`、`vx`、`vy`（自由运动，不写 `along`、`bodies`；沿轨道的带电小球见上面「沿轨道运动」，同样写 `charge`、`fields`）。洛伦兹力 `q(E + v×B)` 由组件算进加速度。

```
<Motion name="pt" until={3} mass="m" charge="q"
  state={{x: -1, y: 0, vx: "v0", vy: 0}}
  fields={[
    {label: "偏转电场", E: "U/d", angle: -90, region: {xmin: 0, xmax: "L", ymin: "-d/2", ymax: "d/2"}, exit: "tOut"},
    {label: "圆形磁场", B: "B0", dir: "out", region: {cx: 0, cy: 0, r: "R"}, enter: "tIn", exit: "tLeave"},
    {label: "半圆磁场", B: "B0", dir: "in", region: {cx: 0, cy: 0, r: "R", from: 0, to: 180}}
  ]}
  read={{yOut: "y @ tOut"}} />
```

- `charge` 是电荷量，带正负。`fields` 每一项是下面三种之一：匀强电磁场、点电荷、径向电场。
- **重力不会自动加上。** 只写 `charge`、`fields` 时粒子只受电场力和洛伦兹力。带电小球、油滴、微粒这类要算重力的，再写 `forces`（和受力驱动的写法一样），场力和 `forces` 合在一起按 ΣF = ma 算。漏了重力，竖直方向不动，靠 `y` 触发的事件永远不发生，读数是 NaN。
- `charge` 可以用状态量，碰板后电量改变就用一个状态量记碰撞次数，在事件的 `set` 里改它：

```
<Motion name="pt" until={1} mass="m" charge="hit < 0.5 ? q1 : q2"
  state={{x: 0, y: "h", vx: 0, vy: 0, hit: 0}}
  forces={[{label: "G", angle: -90, magnitude: "m*g"}]}
  fields={[{label: "E", E: "U/d", angle: 0, region: {xmin: 0, xmax: "d", ymin: 0, ymax: "h"}}]}
  events={[
    {name: "tHit", when: "y", dir: "down", set: {vy: "-k*vy", hit: 1}},
    {name: "tHit2", when: "(hit - 0.5)*y", dir: "down", stop: true}
  ]}
  read={{x1: "x @ tHit", x2: "x @ tHit2"}} />
```

- **匀强电场**写 `E`（大小）和 `angle`（场强方向，度，0 向右，逆时针为正；`E` 写成负数时方向再转 180°）。区域内不随位置变。
- **磁场**写 `B`（大小）和 `dir`：`"out"` 垂直纸面向外（⊙），`"in"` 向里（×）。正电荷在向外的磁场里顺时针转。径向场也可以同时带这样一个匀强磁场。
- **点电荷**写 `Q`、`x`、`y`（位置只能用参数）。库仑力 `k Q q / r²`，同号相斥。`k` 默认 `9e9`，缩放单位写 `k: 1`。`radius` 和 `hit` 一起写：粒子到该电荷的距离降到 `radius` 时停下，并记下这个时刻，避免一头扎进 r → 0。
- **径向电场**写 `radial: true`、`cx`、`cy`、`E`。`E` 是从中心向外的场强，负值向里；表达式里可以用 `r`（到中心的距离，只在这一项的 `E` 里代表距离），例如线电荷、圆柱电容器 `E: "a/r"`。不要同时写 `angle`。圆心只能用参数。
- 非匀强电场（点电荷、E ∝ 1/r 的径向场）也写进 `fields`，不要在 `E` 里用 `x`、`y` 拼方向。
- `E`、`B`、`angle`、`Q`、`k` 不写 `t` 和状态量时，一次运动里保持进入积分前的值；写了 `t` 或状态量就每一步重算（交变电场 `E: "E0*sin(ω*t)"`）。点电荷和径向场随位置变，每一步按粒子当前位置重算。
- **区域** `region` 三选一，边界在一次运动里不变，只能用参数：矩形 `{xmin, xmax, ymin, ymax}`（缺的那一侧是半平面）；圆 `{cx, cy, r}`，可再写成对的 `from`、`to`（度，从 +x 逆时针，扇形是 from 到 to 的那一段；不写就是整圆，上半圆写 `from: 0, to: 180`），再写 `inner`（`0 ≤ inner < r`）就是圆环或扇环；多边形 `{points: [[x, y], ...]}`。不写 `region` 就是整个平面。
- `enter`、`exit` 是进入、离开该区域的时刻，和 `events` 的名字一样能写进 `read`、`marks`、`Readout`。粒子一开始就在区域里时，`enter` 记为 0。一次都没进入，校验提醒。`hit` 同样是事件名字。
- 同一条边界上进入和离开都落在精确时刻（圆环的内圆弧也一样），力不会在边界附近被积分步长抹平。
- 画面用 `v.regions(m, p.pt)` 画这些区域（磁场用 × / ⊙，匀强电场用平行箭头，径向电场用径向箭头，点电荷画成带 ± 的电荷）。点电荷的电场线用 `v.regions(m, p.pt, {lines: true})`，或在那一项上写 `lines: true`。不要自己用 `v.field` 另画一块对不上运动的区域。

### `<Preset>`：快捷按钮

把题目的答案或关键状态做成一键跳转。

```
<Preset label="正常工作：4 只" set={{n: 4}} />
<Preset label="最大功率：16 只" set={{n: 16}} />
```

切换预设时数值在 450 ms 内缓动过去（选项型和时间参数直接跳）；系统开启"减少动态效果"时不做补间。

### `<Question>`：小问

每个小问一个标签，显示在侧栏顶部的编号列表里。点击某一问时高亮它，并把 `set` 里的参数补间到该问的条件。

```
<Question text="木板与墙第一次碰撞前，物块和木板是否已共速？" set={{t: 0.8}} hint="比较共速时刻和碰墙时刻" />
```

| 属性 | 说明 |
|---|---|
| `text` | 题干（纯文本，可写下标） |
| `set` | 可选，切到这一问时设置的参数，同 `<Preset>` |
| `hint` | 可选，选中时显示的提示 |

### `<Readout>`：实时数值

```
<Readout items={[
  {label: "两车距离", symbol: "Δx", expr: "xB - xA", unit: "m", digits: 1},
  {label: "B 车速度", symbol: "v_B", color: "velocity", expr: "vB", unit: "m/s", digits: 1}
]} />
```

条目字段：`label`、`expr`、`unit`、`digits`，可选 `symbol`、`color`、`format`。

### `<Answer>`：答案卡片

**默认收起**，学生先自己做题。展开后列出答案；条目同时给了 `expr` 和 `value` 时，卡片会说明当前参数下的结果是否"与参考答案一致"，参数被拖离题目条件时提示"已偏离"。底部链接跳到「分析与解答」。

```
<Answer items={[
  {label: "最大距离", symbol: "Δx_max", expr: "dmax", value: 16, unit: "m"},
  {label: "追上时刻", symbol: "t", expr: "tCatch", value: 8, unit: "s", digits: 1}
]} />
```

| 属性 | 说明 |
|---|---|
| `items` | 条目：`label`，`expr` 和/或数字 `value`，可选 `symbol`、`unit`、`digits`、`format`。不是数值的答案（选择题选项、只能写成字母表达式的结果、「偏大」之类）写 `text`，原样显示：`{label: "答案", text: "BD"}` |
| `title` | 收起时的按钮文字，默认「查看答案」 |
| `open` | 默认展开，一般不写 |

### `<Status>`：随参数变化的状态标签

按顺序匹配第一个成立的条件：

```
<Status cases={[
  {when: "n < 4", label: "超过额定电压", tone: "warning"},
  {when: "n == 4", label: "额定运行", tone: "success"},
  {label: "低于额定电压", tone: "neutral"}
]} />
```

`tone` 取值：`neutral`、`info`、`success`、`warning`、`danger`。

### 表达式

表达式用 mathjs 语法，在受限环境里求值，不能访问任何 JS 对象。

- 运算：`+ - * / ^ %`，比较 `< <= > >= == !=`，逻辑 `and or not`，条件 `c ? a : b`。
- 函数：`sin cos tan asin acos atan atan2 sqrt abs exp log log10 min max floor ceil round sign clamp(x, lo, hi)`。三角函数用弧度，角度用 `deg(x)` 转成弧度。
- 常量：只内置 `pi`、`e`。其他常量（包括重力加速度 `g`）要用 `<Param hidden>` 或 `<Define>` 自己声明，数值按题目取。
- 可以引用所有参数和派生量。

## 四、预制组件

### `<Plot>`：函数曲线图

画函数曲线、关键点、竖线游标。曲线、标签的布局和避让由组件处理。

```
<Plot
  title="两车速度随时间变化"
  x={{name: "t", label: "t", unit: "s", min: 0, max: 9}}
  y={{label: "v", unit: "m/s", min: 0, max: 11}}
  series={[
    {label: "A 车", expr: "4", color: "blue"},
    {label: "B 车", expr: "max(10 - 2*t, 0)", color: "orange"}
  ]}
  marks={[
    {x: 3, label: "速度相等，距离最远"},
    {x: 5, label: "B 停车"},
    {x: 8, label: "A 追上 B"}
  ]}
  cursor="t"
/>
```

| 属性 | 说明 |
|---|---|
| `x` | 横轴。`name` 是曲线表达式里自变量的名字，`min`/`max` 可以是数字或表达式字符串 |
| `y` | 纵轴。不写 `min`/`max` 时自动取范围 |
| `title` / `caption` | 标题和一行说明 |
| `series` | 曲线列表。`expr` 里可以用自变量和所有参数；`color` 取物理量名（不写按顺序取）；`dash: true` 画虚线。要画 p–V 这类参数曲线时，给这一条写 `over: {name, min, max}` 和 `x`：`over.name` 是只属于这条曲线的局部变量，从 `min` 扫到 `max`，`x` 是横坐标、`expr` 是纵坐标。`point` 再点一个参数（通常是滑块）在曲线上标出当前状态。没写 `over` 的曲线仍按横轴自变量画，用法不变。实测数据改写 `points: [[x, y], ...]`（数字或表达式），不要再写 `expr`：默认画圆点，`marker: 'cross'` 改成叉，`line: true` 再把点连成折线。`fit: 'linear'` 在整段横轴上画最小二乘直线 y = kx + b，`fit: 'proportional'` 画过原点的 y = kx。拟合结果用这一条的 `read: {slope: "k", intercept: "b"}` 交出去，名字和 Define 一样能给 `<Readout>` 用（U–I 图里 E 是截距，r 是 −斜率） |
| `marks` | 关键点。`x` 是横坐标（数字或表达式），`series` 指定落在哪条曲线上（序号，可选；不写时按 `label` 里出现的曲线名或符号找，例如「v_y 回到 0」落在 v_y 上，找不到就落在第 1 条上），`label` 是说明 |
| `areas` | 面积填充，用来读"位移 = 面积"、"相对位移 = 两线之间"。`{series, to, from, until, label, color}`：`series` 和 `to` 都是 `series` 数组里的序号（从 0 数，`series` 必填），填 `series` 曲线和 `to` 曲线之间（不写 `to` 就到横轴），横坐标从 `from` 到 `until`（可写表达式） |
| `cursor` | 游标跟随的参数名，可选。游标处显示各曲线的当前值（`values: false` 关掉下方数值行） |

### `<Bars>`：离散柱状图

自变量是整数时用（几只电热器、第几能级、第几次碰撞）。点击柱子把 `cursor` 参数设成对应值。

```
<Bars
  title="输出功率与电热器只数"
  x={{name: "k", label: "n", unit: "只", min: 1, max: 30}}
  y={{label: "P", unit: "W"}}
  expr="E^2 * k*R / (k*r + R)^2"
  cursor="n"
  marks={[{x: 4, label: "额定", style: "outline"}, {x: 16, label: "最大", style: "solid"}]}
  color="charge"
/>
```

`expr` 里用 `x.name` 作自变量（默认 `n`）；`marks.style` 取 `solid`（实心墨色）或 `outline`（虚线框）；游标所在的柱子用 `color` 高亮。

### `<Ledger>`：能量账本

把能量（或功率）的去向画成堆叠条，每行可以取不同时刻，"开始 / 此刻 / 结束"并排对照。

```
<Ledger
  title="能量去向"
  unit="J"
  parts={[
    {label: "动能", symbol: "E_k", expr: "Ek", color: "velocity"},
    {label: "摩擦生热", symbol: "Q", expr: "Q", color: "force"}
  ]}
  rows={[{label: "开始", at: {t: 0}}, {label: "此刻"}, {label: "结束", at: {t: "T"}}]}
  total={{label: "总能量", symbol: "E", expr: "Ek + Q"}}
/>
```

| 属性 | 说明 |
|---|---|
| `parts` | 各部分：`label`、`expr`，可选 `symbol`、`color` |
| `rows` | 可选，每行 `label`、`note`，`at` 是该行求值时临时设置的参数（不写就是当前值）。默认只有「此刻」一行 |
| `total` | 可选，条长按它归一化并显示在右上角；不写时用各部分之和 |
| `headline` | 可选，右上角改为显示这一个量（如效率 `{label: "效率", expr: "eta", format: "percent"}`） |
| `unit` / `digits` | 单位和小数位 |

### `<Dial>`：表盘

只有一个关键量需要盯着看时用（速度、效率、电压是否超额定）。

```
<Dial title="单只电热器电压" expr="U" min={0} max={250} unit="V" symbol="U"
  arcs={[{from: 200, to: 220, color: "field", label: "额定"}]}
  footer={[{label: "额定", from: 200, to: 220, color: "field"}]} />
```

`arcs` 在刻度外圈画色带；`footer` 在表盘下方列出区间说明；`step` 控制刻度间隔。

### `<Segment>`：分段讲解

`<Segment title quote hint watch />` 是分段标记，自闭合。从它开始到下一个 `<Segment>` 之前的正文、图和控件都属于这一段；第一个 `<Segment>` 之前的正文是开场，只在第一段上方显示。最后一段通常写「完整解答」，不放图。`ask`、`reveal`、`revealParam` 只用于上课模式：`ask` 是投在屏幕上问全班的一句话，`reveal` 是按空格揭晓的答案，`revealParam` 是揭晓前设为 0、揭晓后设为 1 的隐藏参数。每段都写了 `quote` 时，页首的原题默认收成一行关键条件（头信息 `givens: ["…", …]`），点「题目原文」展开全文。
### `<ForceDiagram>`：受力分析图

```
<ForceDiagram
  title="物块受力"
  surface={{type: "incline", angle: "theta", angleLabel: "θ"}}
  body={{shape: "block", label: "m"}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g", showValue: true, unit: "N"},
    {label: "N", angle: "90 + theta", magnitude: "m*g*cos(deg(theta))"},
    {label: "f", angle: "theta", magnitude: "f"}
  ]}
  decompose={{force: 0, axes: "incline", labels: ["mg sinθ", "mg cosθ"]}}
/>
```

| 属性 | 说明 |
|---|---|
| `surface.type` | `none`（悬空）、`ground`（水平地面）、`incline`（斜面）、`ceiling`（天花板，物体挂在下面） |
| `surface.angle` | 斜面倾角（度，可写表达式）。**正值表示斜面向右上方升高**；沿斜面向上的方向角就是 `theta`，垂直斜面向外是 `90 + theta` |
| `body` | `shape` 取 `block`（物块）、`ball`（小球）、`particle`（带电粒子，配 `charge: "+"` 或 `"-"`，力从粒子边缘画出）、`rod`（导体棒）、`knot`（绳结：三绳共点平衡，每个力都画成沿绳的拉力，绳子从结点延伸出去）；`label` 自动放在箭头最少的一角，中文标签不用斜体。`angle` 是物体自身的转角（度，不写就跟表面），斜靠的杆用它 |
| `forces` | 每个力：`label`、`angle`（度，从水平向右逆时针量，可写表达式）、`magnitude`（表达式）或 `solve`（未知，见下文「受力求解」）；`at` 见下；`showValue` 为真时显示数值，配合 `unit`、`digits`：数值列在卡片右上角（按力的顺序、与箭头同色），箭头旁只写符号；整张图写 `values="inline"` 才把数值写在箭头旁（只有一个力、或讲解时要指着箭头读数时用）。`role: "direction"` 是方向而不是力 |
| `guides` | 可选。`[{label, angle, at, color}]`：虚线方向（速度、绳的走向）。长度固定，不进比例尺，不参与 `solve`，不要写 `magnitude`。角度可以是速度方向的表达式 |
| `decompose` | 可选。把第 `force` 个力沿 `incline`（斜面方向）或 `xy`（水平竖直）分解，画虚线分力 |
| `triangle` | 可选。在右侧画力的矢量三角形：各力首尾相接、严格按比例（不套用最短长度）。`true` 按 `forces` 顺序，或 `{order: [2, 0, 1], resultant: "F_{合}", title}` 指定顺序。闭合时注明「合力为零」；不闭合时用虚线画出合力（从第一个力的起点指向最后一个力的终点）。三力平衡、动态平衡（拖滑块看三角形变形）都用它。**动态平衡里一个力不变、另两个力夹角不变**（如"保持 ∠OMN 不变"）时加 `circle: true`（或写成圆的标签文字）：把不变的力排第一个，画出经过三角形三个顶点的虚线辅助圆，在后两个力的交点标出夹角（`angleLabel`，如 `"180°−α"`）。圆按力的方向算，其中一个力暂时为零时也画得出来；三角形按圆定位、圆的大小固定，拖滑块时只有交点沿圆移动，画幅不跳。只适用于三个力 |
| `values` | 可选。`corner`（默认）把 `showValue` 的数值列在右上角；`inline` 写在箭头旁，如「G = 20 N」 |
| `scale.max` | 可选。比例尺对应的最大力；不写时取最大的力 |

箭头长度按大小比例绘制，过小的力保留最短长度；标签自动避开箭头和物体；下方自动加比例说明。大小为 0 的力不画；大小为负时箭头反向画。

`at` 取 `center`（默认）、`contact`，或 `[x, y]`。x、y 以物体**半长、半高**为单位，原点在中心，+x 沿物体、+y 朝上（物体转了 `body.angle` 就跟着转）。`[-1, 0]` 是左端，`[1, 0]` 是右端，`[0, 0]` 是中心。共点力不写 `at`，仍画在中心。同一个物体上重力在质心、弹力在端点，就各写各的 `at`，不要拆成几张图。

#### 受力求解：未知力交给组件算

不知道的力不要手算，写 `solve` 给它起个名字，组件按 **ΣF = 0**（平衡）或 **ΣF = ma**（给了 `accel`）解出来。解出的名字和 `<Define>` 一样，可以给别的力、`Readout`、`Plot`、`Status` 和 `answers` 用；图下方自动写「由 ΣF = 0 解出：…」。

```
<ForceDiagram
  surface={{type: "incline", angle: 30}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g"},
    {label: "N", angle: 120, solve: "N"},
    {label: "f", angle: 30, magnitude: "mu*N", at: "contact"}
  ]}
  mass="m"
  accel={{angle: 210, solve: "a"}}
/>
```

| 写法 | 说明 |
|---|---|
| `solve: "N"` | 这个力方向已知（`angle`）、大小未知，解出的大小叫 `N` |
| `solve: {magnitude: "T", angle: "phi"}` | 大小和方向都未知（如"求另一根绳的拉力及方向"）；也可以只写 `angle`（大小已知、方向未知） |
| `accel` | 加速度 `{angle, magnitude}`，同样可以写 `solve`（如 `{angle: 0, solve: "a"}` 求加速度大小）；给了 `accel` 必须给 `mass` |
| `mass` | 质量（数字或表达式），只和 `accel` 一起用 |

- 平面上只有两个方程，**最多两个未知量**；别的力可以引用解出的名字（如 `f = μN`），组件会一起解。
- 解出来是负数表示真实方向与所画方向相反：箭头自动反向，校验给提醒。
- 已知的力本身不平衡（比如只解竖直方向的 N，却还有水平力）时，校验给提醒「无法满足 ΣF = 0」。
- 两个未知力共线时没有唯一解，结果为 NaN 并提醒。

### `<Circuit>`：电路图

只描述元件和串并联关系，布局交给组件。负载画在上边，电源画在下边，两侧导线闭合。

```
<Circuit
  source={{series: [{type: "battery", label: "E"}, {type: "resistor", label: "r"}]}}
  load={{series: [
    {type: "resistor", label: "R₁"},
    {parallel: [{type: "lamp", label: "L₁"}, {series: [{type: "lamp", label: "L₂"}, {type: "ammeter"}]}]},
    {repeat: "n", label: "共 {n} 只", item: {type: "heater", label: "R", note: {expr: "U", unit: "V", prefix: "U = "}}},
    {type: "switch", label: "S", closed: "s == 1"}
  ]}}
  current={{expr: "I", unit: "A", label: "I"}}
/>
```

| 节点 | 说明 |
|---|---|
| 元件 `{type, label, note}` | `type` 取 `battery resistor heater rheostat lamp switch ammeter voltmeter galvanometer capacitor inductor generator motor thermistor photoresistor wire currentSource diode phototube transformer`（`motor` 电动机，`thermistor` 热敏电阻，`photoresistor` 光敏电阻，`inductor` 线圈，`currentSource` 恒流源，`diode` 理想二极管，`phototube` 光电管，`transformer` 理想变压器）。符号按国标（电阻是矩形）。`note` 是随参数变化的数值，显示在元件下方 |
| `{series: [...]}` | 串联，从左到右 |
| `{parallel: [...]}` | 并联，支路从上到下 |
| `{repeat: n, item, label}` | n 条相同支路并联，n 可以是表达式；超过 3 条时只画首尾两条，中间写 `label`（`{n}` 替换成数量） |
| `battery.positive` | `left`（默认）或 `right`，长线是正极 |
| `switch.closed` | 布尔值或表达式（非 0 为闭合） |
| `currentSource` | 恒流源。`I` 必填（可写表达式），电流从 `positive` 端流出，默认 `left`（正极在左，电流向左流出）。稳恒电路里不能和电容或断开的开关串联；两条串联的恒流源电流必须相等 |
| `diode` | 理想二极管：正向压降为 0，反向不导通。`reverse: true` 时正向反过来（三角指向左）。`read` 的正方向仍是从左到右：导通时 `U = 0`，截止时 `I = 0`。不能放在 `repeat` 里 |
| `phototube` | 光电管。`nu`（频率，Hz，`h = 6.63×10⁻³⁴`）或 `lambda`（波长，nm，光子能量 `1240/λ` eV）二选一，`W` 逸出功（eV），`Isat` 饱和光电流（A）。截止电压 `U_c = max(0, hν − W)`（eV 除以 e 后就是伏特），最大初动能 `E_k` 同此值；`hν < W` 时没有光电子，`U_c = 0`、`E_k = 0`，任何电压下电流都是 0。伏安特性是示意折线，不要自己画：`U_AK ≤ −U_c` 时 `I = 0`，`U_AK ≥ 0` 时 `I = I_sat`，中间连成直线。默认阴极 K 在左、阳极 A 在右，光从斜上方打到 K；`reverse: true` 把 A、K 对调。`read: {I, U, Uc, Ek}` 里 `U` 是阳极相对阴极的电压 `U_AK`，`I` 是光电流（电子从 K 到 A 为正），与图上左右无关。不能放在 `repeat` 里。暂态和 `<Motion circuit>` 里每一时刻按当时的电压重新落到对应的直线段上 |
| `transformer` | 理想变压器。`n1` 是原线圈匝数；一个副线圈写 `n2` 和 `secondary`（副线圈上的负载，本身也是一棵串并联树），多个副线圈写 `secondaries: [{n, load, label, read}]`，不要和 `n2`、`secondary` 一起写。副线圈回路画在线圈右侧，和原边只有磁的联系。匝数必须是正数 |
| `{spdt: [支路1, 支路2], position, label}` | 单刀双掷。恰好两条支路；`position` 为 1、2 或表达式，0 或其他值表示刀片悬空。画成一个公共端加两个触点，刀片指向接通的那条。两条支路的另一端接在一起，像并联。不能放在 `repeat` 里 |
| `current` | 可选，在左侧导线上标干路电流方向和数值，方向由电源正极决定 |
| `flow` | 可选，导线上流动的电流粒子。`{expr, ref}`：粒子速度正比于 `expr`，等于 `ref` 时为基准速度（不写 `ref` 取题目初始值）；各支路按分流比例变慢。写了 `current` 时默认按它流动，`flow={false}` 关掉 |
| `hud` / `legend` / `note` | 同 `<Sim>`，在电路上方显示读数和图例，下方显示说明 |
| `layout` | `"loop"`（默认）：电源在底边、负载在顶边、并联支路上下叠放。`"ladder"`：电源竖在左边，负载里的串联元件分在上、下两条导线上，并联支路竖着并排成「梯子」，电流顺时针（从电源上端流出） |
| `box` | 仅 `ladder`。`{label, caption}`：用虚线框圈出全部支路，`label` 写在左上（如「保温室」），`caption` 写在左下，不写时用 `repeat.label` |

`ladder` 的要求：`source` 是元件或元件串联；`load` 是元件串联，其中恰好一个 `repeat` 或 `parallel`，每条支路只有一个元件。支路超过 5 条时只画前三条、省略号和最后一条，每条支路顶上标 `item.note`。适合「n 个用电器并联，经输电线接电源」这类题。

电压表要并在某个元件两端时，把它和该元件写成一个 `parallel`。有电流时电热器发热发光。

**电路求解**：电源写了 `emf` 后，组件按串并联关系真的解这个电路（和 `<Wiring>` 同一个求解器），不用再手写 `I = E/(R + r)` 之类的 Define。

| 元件属性 | 说明 |
|---|---|
| `emf`、`r` | 只用于 `battery`、`generator`：电动势和内阻（可写表达式，`r` 默认 0） |
| `R` | 电阻（可写表达式）。电阻类元件、灯、电动机不写时按 10 Ω；`wire`、闭合的 `switch` 是 0，`capacitor` 不通直流 |
| `r`（电表） | 电流表默认理想（0），电压表默认理想（∞），写了就按实际内阻算 |
| `C`、`U0` | 只用于 `capacitor`：电容（F）和 t = 0 时的电压（只在暂态里用）。稳恒电路里电容不通电流，`read: {U, Q}` 给出它两端的电压和电荷量 Q = CU |
| `L`、`r`、`I0` | 只用于 `inductor`：自感系数（H）、线圈直流电阻（默认 0）和 t = 0 时的电流。稳恒电路里线圈就是电阻 r |
| `power`、`lit` | 只用于 `lamp`：额定功率（默认 0.75 W）；`read: {lit: "名字"}` 发布亮度（实际功率/额定功率，0–1），元件写 `lit: "名字"` 时灯泡按这个亮度发光 |
| `read` | 把解出来的量交出去：`read: "I1"` 发布电表读数（其他元件是电流）；`read: {I: "I1", U: "U1", P: "P1"}` 分别发布电流、电压、功率（电容还有 `Q`，灯泡还有 `lit`）。理想变压器写 `read: {U1, U2, I1, I2, P}`：原线圈电压、第一个副线圈电压、原电流、副电流、原边输入功率；多抽头时每个副线圈自己的 `read: {U, I, P}` 发布那一路。名字和 Define 一样能被 `note`、`current`、`<Readout>`、`<Plot>`、`answers` 使用；写了 `read` 没写 `note` 时元件下方自动显示这个值 |

`repeat` 里的元件按实际只数 n 并联求解，`read` 取第一条支路。电流方向（电源正极在左时）：负载里从左到右为正，`source` 里串的电流表、电阻、开关等从右到左为正，即都顺着电流从电源正极流出、回到负极的方向，所以电表接在 `source` 里或 `load` 里读数都是正的；并在电池两端的电压表读路端电压，也是正的。恒流源的 `I` 以从 `positive` 端流出为正；二极管的 `I`、`U` 以元件的从左到右为正（`reverse` 只改导通方向，不改读数的正方向）；光电管的 `U` 是 `U_AK`、`I` 是光电流，不随 `reverse` 改号；变压器副线圈电流以从同名端流出、经过负载为正。

理想变压器满足 U₂/U₁ = n₂/n₁，且 n₁I₁ = Σ nₖIₖ（多个副线圈时安匝平衡），输入功率等于各副线圈输出功率之和。稳恒电路按**有效值**求解，所以上面的关系对正弦交流的有效值成立，也适合「输电—降压—用电器」这种题。电源是电池（直流）时变压器不能传递功率，校验只给警告、仍按有效值算出数，提示改用 `generator` 或写成交流电动势。电桥（惠斯通电桥等）含不在串并联树上的网孔，这棵树表达不了：请改用 `<Wiring>` 把四个桥臂和检流计写成导线网，或在题干里用文字说明，不要硬写成 `parallel`。`layout="ladder"` 不能含变压器或单刀双掷（它们自带向下伸出的回路），这种图保持默认的 `loop`。

```
<Circuit
  source={{series: [{type: "generator", emf: "E", r: "r"}]}}
  load={{type: "transformer", n1: 1, n2: 10, label: "升压",
    secondary: {series: [
      {type: "resistor", R: "Rline", label: "输电线"},
      {type: "transformer", n1: 10, n2: 1, label: "降压",
        secondary: {repeat: "n", item: {type: "lamp", R: "Rl", read: {U: "UL"}}}}
    ]}}}
/>
```

单刀双掷做电容先充电再放电时，`position: "t < 1 ? 1 : 2"` 和以前用两个开关（一个 `t < 1`、一个 `t >= 1`）写的是同一件事，只是图上是一把刀。恒流源可以放在 `<Motion circuit>` 里代替电池，例如导体棒的 `source` 写 `{type: "currentSource", I: "I0"}`，棒上的安培力用解出的 `I`。半波整流是交流电源串一只二极管：正半周导通、负半周电流精确为 0，过零点就是二极管状态切换的时刻。

**暂态（电容充放电、自感、LC 振荡、交流）**：写 `transient` 后组件把每个电容的电压、每个线圈的电流当成随时间变化的状态，每一瞬间按基尔霍夫定律解一次电路，再用 `<Motion>` 的积分器积分。开关、电动势可以写 `t` 的表达式：`closed: "t >= 1"` 表示 t = 1 s 时闭合（开关时刻会被精确定位），`emf: "Em*sin(w*t)"` 是交流电源。纯电阻的交流电路（没有电容、线圈）也可以写 `transient`，结果就是每一瞬间的读数；但电路里既没有电容、线圈，也没有随 `t` 变化的电动势或开关时会报错（那是稳恒电路，直接写 `read`）。

```
<Circuit
  source={{series: [{type: "battery", emf: 8}, {type: "switch", label: "S→1", closed: "t < 0"}]}}
  load={{parallel: [
    {type: "capacitor", label: "C", C: "Cu*1e-6", read: {U: "UC", Q: "QC"}},
    {series: [{type: "switch", label: "S→2", closed: "t >= 0"}, {type: "ammeter", read: "IA"}, {type: "resistor", R: 2000}]}
  ]}}
  transient={{name: "dis", until: 20, at: "tc", events: [{name: "tHalf", when: "UC - 4", dir: "down"}], read: {I0: "IA @ 0"}}} />
```

| `transient` 的键 | 说明 |
|---|---|
| `name` | 必填。结果以 `<Motion>` 的方式发布：`dis.UC(t)`、`dis.IA(t)`……每个 `read` 名字都是时间的函数，`dis.tEnd` 是结束时刻。暂态里 `read` 名字**不再**是单独的数，要写成 `dis.UC(tc)` |
| `until` | 必填，计算到哪一时刻（s） |
| `steps` | 积分步数（默认 800，50–20000）。步长要比最小的时间常数 RC、L/R 小得多 |
| `at` | 电路图画在哪一时刻（一个滑块或 Sim 的时钟，默认 0）：开关的位置、`note` 里的 `read` 名字、灯泡亮度都取这一时刻的值 |
| `events` | 同 `<Motion>` 的 `events`（`name`、`when`、`dir`、`stop`，没有 `set`），`when` 里可以用 `t` 和 `read` 名字，例如电压减半的时刻 |
| `read` | 同 `<Motion>` 的 `read`：`"IA @ 0"`、`"max(IA)"`、`"min(IA)"` |

开始状态：t < 0 时电路已经按 t < 0 的开关位置稳定了很久——电容电压、线圈电流取那时的稳定值（开关一直断开的电容不带电）。电容写 `U0`、线圈写 `I0` 时按写的值开始。所以「闭合开关给电容充电」写 `closed: "t > 0"`，不要写 `closed: true`（那表示 t < 0 时就已经充满）。

注意：理想电源直接接电容、回路里几乎没有电阻时充电是瞬间完成的，积分会报「时间常数太小」——要看过程就把电阻写出来。断开线圈所在电路时要给线圈电流留一条回路（例如并联的灯泡），否则求解器会报错（实际会产生电火花）。暂态电路里电容、线圈、二极管不能放在 `repeat` 里。二极管的通断和开关一样被定位到那一瞬间：正向电流降到 0 时截止，正向电压升到 0 时导通。单刀双掷的 `position` 写成含 `t` 的表达式时，两档的切换同样被定位。

**画运动里的电路**：`<Motion circuit>` 解出的电路用 `motion` 指到那个运动，不再写 `source` / `load`（二者选一，也不能再写 `transient`）。`at` 是画在哪一时刻的表达式（一个滑块或 Sim 的时钟，默认 0）。这一时刻的状态量、电路 `read` 和受力解出的量都放进绘制：`emf: "B*L*v"`、开关 `closed: "x >= 1"`、元件 `note` 都跟着变。`title`、`hud`、`note`、`current`、`flow`、`layout` 照常可用。

```
<Circuit title="导体棒的等效电路" motion="rod" at="tk" />
```

```
<Circuit
  source={{series: [{type: "generator", label: "E", emf: "E", read: {I: "I"}}, {type: "resistor", label: "r", R: "r"}]}}
  load={{series: [{type: "resistor", R: "Rw"}, {repeat: "n", item: {type: "heater", R: "Rh", read: {I: "Ih", U: "U"}}}, {type: "resistor", R: "Rw"}]}}
  current={{expr: "I", unit: "A"}}
/>
```

### `<Instrument>`：读数仪器

实验题的读数练习。刻度、对齐线和读数过程都由 `value` 算出来，拖动滑块时一起变。

```
<Instrument title="游标卡尺" type="vernier" value="L" divisions={20} unit="cm" />
<Instrument title="螺旋测微器" type="micrometer" value="d" />
<Instrument title="电流表" type="meter" value="I" scales={[0.6, 3]} range={0.6} unit="A" />
<Instrument title="欧姆挡" type="ohmmeter" value="Rx" multiplier={100} />
<Instrument title="电阻箱" type="resistanceBox" value="R0" decades={[1000, 100, 10, 1, 0.1]} />
<Instrument title="多用电表" type="multimeter" mode="ohm" range={10} value="Rx" />
<Instrument title="弹簧测力计" type="springScale" value="F" max={5} divisions={50} />
<Instrument title="测量头，第 3 条亮纹" type="measurementHead" value="x3" fringes={{lambda: 500, d: "d", L: "L", offset: 2}} pair={{x1: "x1", n: 3}} read={{dx: "mdx", lambda: "mlam"}} />
```

| `type` | 说明 |
|---|---|
| `vernier` | 游标卡尺。`value` 单位 mm；`divisions` 取 10、20、50 分度（默认 20）；对齐的那条刻线高亮；`unit="cm"` 时读数再换算成 cm |
| `micrometer` | 螺旋测微器。`value` 单位 mm（估读到 0.001 mm）；画固定套筒（和高考题图一样，基准线下方是整毫米刻线并标 0、5、10，上方是半毫米刻线）和可动刻度 |
| `meter` | 指针式电表。`range` 当前量程，`scales` 表盘上的几排刻度（如 `[0.6, 3]`，当前量程那一排加深；和实验室电表一样，大量程画在上排即弧外，小量程在下排即弧内，与数组顺序无关）；`divisions` 小格数（默认 30），`major` 大格数（默认 3）；`unit`、`symbol`（表盘中央的字母）。读数按高考估读规则：最小分度是 1 的估读到下一位，是 2 或 5 的在本位估读。`terminals` 在表盘下方画接线柱，如 `["−", "3 V", "15 V"]`，不要手画 |
| `ohmmeter` | 欧姆表。`value` 是实际电阻（Ω），`multiplier` 倍率（默认 1），`mid` 表盘中值（默认 15）；刻度不均匀，左端 ∞、右端 0 |
| `resistanceBox` | 电阻箱。`decades` 各旋钮倍率（默认 `[1000, 100, 10, 1]`）。每个旋钮的数字和指针都由 `value` 拆出来 |
| `multimeter` | 多用电表整机。`mode` 取 `ohm`、`dcv`、`dcma`、`acv`、`off`。`range`：欧姆挡是倍率（1、10、100、1000），直流电压是满度（2.5、10、50、250、500，单位 V），直流电流是 1、10、100（mA），交流电压是 10、50、250、500（V）。`value` 是被测量（Ω / V / mA）。`mid` 是欧姆刻度中值，默认 15。欧姆指针偏转比例 = mid / (R/倍率 + mid)，左端 ∞、右端 0；电压、电流按满度线性。挡位旋钮指向所选挡。读数行写明读哪条刻度、分度值和按高考规则估读的结果（欧姆再乘倍率）。指针偏角小于全程的 1/3 或大于 2/3 时另起一行，提示换更大或更小倍率。不要自己画指针和旋钮 |
| `springScale` | 弹簧测力计。`value`、`max` 单位 N。`divisions` 是全程小格数（5 N、0.1 N 分度写 50；0.2 N 分度写 25；不写时 5 N 及以下按 0.1 N，更大按 0.2 N）。分度为 0.1 估读到 0.01，为 0.2 在本位估读。`angle` 是钩子相对圆环的方向（度，从 +x 轴逆时针，默认 −90，钩子朝下）；外壳跟着转，刻度数字保持正立。指针和挂钩由 `value/max` 算出 |
| `measurementHead` | 双缝测量头。左为目镜：圆视场里是按 `fringes` 算出的双缝条纹，竖线是分划板；右为手轮，刻度和螺旋测微器相同（`value` 单位 mm，估读到 0.001 mm）。分划板对准的屏上坐标 = `value − offset`。不要手画条纹，也不要另画一把微分筒 |

`fringes`：`{lambda, d, L, offset, n, a}`。`lambda` nm，`d` 与可选缝宽 `a` 为 mm，`L` 为 m，`offset` 为 mm（默认 0，手轮零点相对中央亮纹的偏移），`n` 为介质折射率（默认 1）。目镜里的条纹就是这组参数的真实双缝图样，转动手轮时条纹相对分划板移动。

`pair`：`{x1, n, d, L}`。本仪器的 `value` 是第 `n` 条亮纹的手轮读数，`x1` 是第 1 条的读数（mm）。读数行写出 Δx = (x_n − x_1)/(n − 1) 和 λ = d·Δx/L。`d`、`L` 省略时用 `fringes` 里的。两条读数的 `offset` 相同才会消掉，所以间距只用手轮读数相减。

`read`：`{dx: "名字", lambda: "名字", x: "名字"}`。`dx` 是条纹间距（mm），`lambda` 是算出的波长（nm），`x` 是分划板的屏上坐标（mm）。`dx`、`lambda` 要有 `pair`。

下方自动写出读数过程（如「主尺 23 mm + 游标第 9 格 × 0.05 mm = 23.45 mm」）。出读数题、不想直接给答案时写 `reading={false}`。`color` 改高亮色（默认 `velocity`），`note` 加一行说明。

### `<Fringes>`：干涉和衍射图样

屏上的条纹由参数算出，下面写带数字的公式。间距、环半径、颜色都不要手画，也不要自己排条纹的位置。

```
<Fringes title="双缝" type="double" lambda="lam" d="d" L="L" span={8} marks={[{k: 1, label: "P₁"}, {k: 3, label: "P₂"}]} read={{dx: "dx", r1: "x1", r3: "x3"}} />
<Fringes title="白光" type="double" d="d" L="L" white span={8} />
<Fringes title="细丝" type="single" lambda="lam" a="a" L="L" wire />
<Fringes title="空气劈尖" type="wedge" lambda="lam" h="h" length={20} side read={{dx: "wdx", theta: "th"}} />
<Fringes title="牛顿环" type="newton" lambda="lam" R="R" />
<Fringes title="电子衍射" type="electron" U="U" k={0.4} read={{lambda: "elam", r1: "er1"}} />
```

单位：`lambda` nm，`d` 和 `a` mm，`L` 和牛顿环曲率半径 `R` m，劈尖角 `theta` 度，`h` 和 `length` mm，加速电压 `U` V。`n` 是介质折射率，默认 1（光在介质里按 λ/n 算）。`span` 是画面覆盖的屏宽（mm）；环状图样把它当作直径。不写 `span` 时，双缝和单缝默认 8 mm，劈尖默认等于膜的长度（只写 `theta` 时按 20 mm），牛顿环默认直径 6 mm，电子衍射默认直径 50 mm。视场固定，间距才会跟着滑块变。

| `type` | 算出什么 | 画面 |
|---|---|---|
| `double` | 亮纹间距 Δx = Lλ/(n d)（mm）。写了缝宽 `a` 再乘单缝因子 sinc²，中央包络宽 2Lλ/a | 水平光屏，亮纹颜色按波长。`white` 把 380–760 nm 每隔 5 nm 叠加：中央白，两侧彩色 |
| `single` | 中央亮纹宽 2Lλ/a，两侧亮纹间距是它的一半。`wire` 只把说明改成细丝（巴比涅，图样与等宽单缝相同） | 同上，中央宽、两侧窄 |
| `wedge` | 等间距 Δx = λ/(2 n tanθ)。写 `h` 和 `length` 时 tanθ = h/length，不再用手填 θ；两个都写时以厚度为准 | 俯视直条纹，接触端在左。反射（默认）接触端是暗纹；`transmitted` 对调。`side` 在下面加侧视：两块玻璃、空气膜、末端垫片，倾角故意夸大 |
| `newton` | 反射暗环半径 r_k = √(k R λ/n)（mm），k 从 1 数，中心是暗斑。`transmitted` 明暗对调，半径公式不变 | 同心环，越往外越密 |
| `electron` | λ = h/√(2 m e U)，说明里用 pm。第 n 环半径 r_n = n·k·λ，`k` 默认 0.4（mm/pm），把晶面间距和屏距折进这一个常数 | 黑底上的同心亮环，中心亮斑。电压升高环变小 |

`marks`：`[{k, label, dark}]`。`k` 是第几条（双缝、单缝中央的另一侧用负数）。双缝默认标亮纹 k·Δx，`dark: true` 改标相邻暗纹；劈尖默认标从接触端数的第 k 条主条纹；单缝标第 k 级暗纹（中央宽的边缘是 k = ±1）；牛顿环和电子衍射标第 k 环。`label` 省略时就写序号。

`cursor` 是一个参数名，表示屏上的 x（mm，环心在 0）。画面上画一条竖线，读数行给出该点的相对光强 I。

`read` 把算好的数交给 `<Readout>` 和 `answers`：`dx` 间距（mm；牛顿环没有等间距，不要读它），`width` 中央亮纹宽度（mm，单缝或写了 `a` 的双缝），`lambda` 有效波长（光是 nm，电子是 pm），`theta` 劈尖角（度，只用于 wedge），`I` 和 `x` 需要 `cursor`，`r1`…`r20` 是第 k 条的位置或半径（mm）。白光的 `dx` 按 550 nm 给一个代表值。

图下的公式带代入后的数字，和 `<Instrument>` 的读数行一样。条纹位置、疏密、颜色都从这些数来，不要在 `<Sim>` 里用矩形条去仿。

### `<TickerTape>`：打点计时器纸带

```
<TickerTape title="纸带" expr="100*(0.12*t + a*t^2/2)" count={7} interval={0.1} labels="letters" />
<TickerTape positions={[0, 1.40, 3.30, 5.69, 8.59]} interval={0.1} />
```

| 属性 | 说明 |
|---|---|
| `expr` / `positions` | 二选一。`expr` 是计数点位置关于 `t`（s）的表达式，单位同 `unit`；`positions` 直接列出各点位置。物体的运动由 `<Motion>` 算时直接写 `expr="100*lab.xA(t)"`（米换成厘米），纸带就是受力算出的真实运动打出来的 |
| `count`、`interval`、`start` | 计数点个数（2–12，默认 7）、计数点间隔 T（默认 0.1 s）、第一个点的时刻 |
| `unit` | 位置单位，默认 `cm`（加速度、速度一律换算成 m/s²、m/s） |
| `labels` | `numbers`（默认 0、1、2…）、`letters`（O、A、B…）或字符串数组 |
| `analysis` | 默认 `true`：写出相邻间距、相邻差 Δx、逐差法加速度、`velocityAt` 那个点的瞬时速度（默认取中间点）。`false` 只画纸带 |

纸带下方画一把从第一个计数点量起的刻度尺，相邻点之间标出间距。

### `<EnergyLevels>`：能级图

```
<EnergyLevels title="氢原子能级图" allFrom={4} select="pick" workFunction="W0" visible />
<EnergyLevels levels={[{n: 1, E: -10.4}, {n: 2, E: -5.5}, {n: "∞", E: 0}]} transitions={[{from: 2, to: 1, label: "a"}]} select={0} />
```

| 属性 | 说明 |
|---|---|
| `levels` | 能级 `[{n, E, label}]`，`E` 可写表达式，`n: "∞"` 画成虚线（电离）。不写时用氢原子 `E_n = −13.6/n² eV`，`count` 控制画几条（默认 6，加 ∞） |
| `transitions` | 跃迁 `[{from, to, label}]`，`from`、`to` 写能级的 `n`。向下是辐射，向上是吸收，`to: "∞"` 是电离 |
| `allFrom` | 和 `transitions` 二选一。画出一群处于 `n = allFrom` 的原子能发生的全部向下跃迁（C(n,2) 种），并写出种数 |
| `select` | 选中第几条跃迁（从 0 数，可写表达式，常配 `<Param options>`）：加粗高亮、标出 ΔE，下方写出 hν = E_m − E_n、波长和光谱区 |
| `workFunction` | 金属逸出功（可写表达式）。ΔE ≥ W₀ 的跃迁画成琥珀色实线，其余画灰色虚线；读数里给出能否发生光电效应和最大初动能 Ek = ΔE − W₀，`allFrom` 时再数出几种能发生 |
| `visible` | 标出辐射可见光的跃迁（按教材 1.62 eV ≤ ΔE ≤ 3.11 eV）：箭头旁画一小段该光颜色的波浪线，图下加图例，`allFrom` 时再数出几种是可见光、是哪几条 |
| `spectrum` | `true`，或 `{from, to, series: "visible"}`。在能级图下方加一条波长轴（nm，默认 380–760），已画的跃迁按 `λ = 1240/ΔE` 落成竖线，颜色是该波长的光色，选中的那条加粗。可见光以外的线是灰色，轴伸进紫外、红外时标出区域；落在轴外面的只数出来（「另有 3 条在紫外区」），不要手写谱线位置 |
| `absorption` | 和 `spectrum` 一起用（单独写也会画出光谱）。连续彩虹底上画暗线，而不是发射亮线。只在 eV 下可用 |
| `orbits` | 在能级图右侧画玻尔轨道：核、半径 `r_n = n² × 0.053 nm` 的同心圆。图上的半径按 `n` 压缩（否则 n = 1 会缩成一个点），真实半径、`r_n/r₁` 和 `E_n` 写在旁边的表里。电子画在选中跃迁的起始轨道上，光子是一条波浪箭头（向下辐射朝里，吸收朝外）。`n` 不是正整数的能级不画轨道 |
| `unit` | 能量单位，默认 `eV`（只有 eV 时才算波长，才能用 `visible`、`spectrum`、`absorption`） |

纵轴按能量大小排列，但保证相邻能级至少间隔 18 px，n 较大的能级不会挤成一团。谱线位置和轨道半径都由能级算出，不要在 `<Sim>` 里用圆和彩条去仿。

### `<Wiring>`：实物连线图

实验题的「用笔画线代替导线连接实物图」。元件画成实物（带接线柱），导线是两接线柱之间的软曲线。

```
<Wiring
  title="伏安法测电阻"
  parts={[
    {id: "A", type: "ammeter", value: "I"},
    {id: "V", type: "voltmeter", value: "U"},
    {id: "E", type: "battery", label: "电源 E"},
    {id: "S", type: "switch", closed: "on"},
    {id: "R", type: "rheostat", slider: "p"},
    {id: "Rx", type: "resistor", label: "R_x"}
  ]}
  wires={[
    {from: "E.+", to: "S.a"}, {from: "S.b", to: "R.D"}, {from: "R.A", to: "A.0.6"},
    {from: "A.-", to: "Rx.a"}, {from: "Rx.b", to: "E.-"},
    {from: "V.3", to: "Rx.a", answer: true}, {from: "V.-", to: "Rx.b", answer: true}
  ]}
/>
```

| 元件 `type` | 接线柱 | 其他属性 |
|---|---|---|
| `battery` 电池组 | `+`、`-` | `positive`：正极在 `right`（默认）或 `left`，照原图摆 |
| `switch` 单刀开关 | `a`、`b` | `closed`：布尔值或表达式 |
| `battery` 的求解属性 | | `emf` 电动势、`r` 内阻（写了 `emf` 就进入求解模式，见下） |
| `ammeter` / `voltmeter` | `-` 和每个量程（默认 `0.6`、`3` / `3`、`15`） | `ranges` 改量程（单位 A / V，毫安表写 `ranges: [0.015]`）；`r` 内阻（默认理想）；表盘按实际接入的量程标数，量程小于 0.1 时按毫安（毫伏）标数、表心写 mA（mV）；没接线的表读数为 0。不求解时用 `value` 表达式驱动指针 |
| `galvanometer` 灵敏电流计 | `+`、`-`，或 `terminals` | `r` 内阻、`full` 满偏电流（A，默认 1 mA），零点在中央。不求解时 `value` 取 −1…1（满偏比例）。多接线柱写 `terminals: ["-", "G0", "G1"]`，画在表盘下方；名字是 `-` 的是公共端（没有就用第一个），其余都进同一表头，满偏仍用 `full`，不区分各挡灵敏度 |
| `rheostat` 滑动变阻器 | 线圈两端 `A`、`B`，金属杆两端 `C`、`D` | `slider` 滑片位置 0…1（0 在 A 端），`R` 总阻值（默认 20 Ω） |
| `resistor` 待测电阻 | `a`、`b` | `R`（默认 10 Ω） |
| `resistanceBox` 电阻箱 | `a`、`b` | `value` 阻值。每个旋钮画 0–9，指针指向由 `value` 拆出的数字，总阻值写在盒子上，算法和 `<Instrument type="resistanceBox">` 相同。不要只画一根没有数字的指针。`decades` 旋钮倍率（默认 `[1000, 100, 10, 1]`，最多 6 个） |
| `lamp` 小灯泡 | `a`、`b` | `R`、`power` 额定功率（默认 0.75 W，亮度 = 实际功率 / 额定功率）。不求解时 `lit` 亮度 0…1 |

- 每个元件要有不含「.」的 `id`；导线端点写 `"元件id.接线柱"`，如 `"A.0.6"`、`"R.C"`。
- `x`、`y`（px，画布宽 640、高 `height`，默认 340）可选：不写时自动排布，电表一排在上，其余元件在下方按顺序排开、放不下就换行。
- `wires[].answer: true` 是待学生连的答案线：默认隐藏，下方出现「显示答案连线」按钮，显示时画成蓝色虚线。`when` 是表达式，非 0 时才画这根线（用来对比内接/外接）。
- 电流从电表的量程接线柱流入、从 `-` 流出；限流接法用 `A` 或 `B` 中的一个加 `C` 或 `D` 中的一个，分压接法 `A`、`B` 都接电源两端。

**逐根接线 `steps`**：写 `steps="wk"`（一个 `hidden` 的 Param，`min={0}`、`max` 等于导线根数、`step={1}`），导线就按 `wires` 的书写顺序一根根接上：

- 每根线中点有编号圆标；刚接上的这根加粗高亮、两端接线柱加圈。
- 下方出现「从头接 / 上一根 / 下一根 / 全部接好」和「已接 n / N 根」，并用一句话说清这根线从哪接到哪（按图上看得见的名字：「电源 E 的正极」「滑动变阻器 R 的 D 端（连滑片）」「电流表的「0.6」接线柱」「电阻 R_x 的左端」）。`wires[].note` 写这一步的理由，接在这句话后面。
- 求解模式下电表读数自动跟着接线进度变（只算已经接上的导线）。不求解时才需要在 Define 里用这个 Param 手动判断电路通没通。
- 用了 `steps` 就不要再写 `answer`（所有导线都按顺序接上）。

```
<Param name="wk" label="已接导线" min={0} max={8} step={1} value={8} hidden />
<Wiring steps="wk" parts={[...]} wires={[
  {from: "E.+", to: "R.B", note: "从电源正极出发"},
  {from: "R.A", to: "S.a", note: "变阻器下面的 A、B 两端都接进主回路"},
  ...
]} />
```

**电路求解（推荐）**：给 `battery` 写上 `emf`（和 `r`），给各元件写上阻值，组件就按图上真实的接线用节点电压法解电路：指针偏转、灯的亮度、各元件电流电压都是算出来的，不要再手写 `I = E/(R + r)`、分压分流公式。

- `read` 把解出来的量交给页面其他部分：电表写 `read: "IA"` 发布读数；任何元件可写 `read: {I: "I1", U: "U1", P: "P1"}`。这些名字和 Define 一样能被 `<Readout>`、`<Status>`、`<Plot>`、`answers` 使用，校验时会用求解结果核对 `answers`。
- 求解模式下不要再给电表写 `value`、给灯写 `lit`（校验会报错）。
- 图上自动提示接线错误：电表正负接反、超过所接量程、电源被导线或电流表短路。校验时初始参数下出现这些提示会列为提醒。
- 带 `answer` 的待连导线：图上没显示答案时按已画出的导线求解（电压表读 0），`read` 发布的是全部接好后的值。

```
<Wiring parts={[
  {id: "E", type: "battery", emf: 3, r: 0.5},
  {id: "A", type: "ammeter", r: 0.1, read: "IA"},
  {id: "V", type: "voltmeter", r: 3000, read: "UV"},
  {id: "R", type: "rheostat", R: 20, slider: "sd"},
  {id: "Rx", type: "resistor", R: 5}, ...
]} wires={[...]} />
<Readout items={[{label: "测量值", symbol: "R_测", expr: "UV/IA", unit: "Ω"}]} />
```

布局建议：电表放上排，待测电阻放中排左侧，变阻器放中排右侧，电源和开关放在变阻器正下方（主回路三根线都很短、不交叉）；电压表正接线柱接电流流入待测电阻的一端，两根表线就不会交叉。

### `<GasBox>`：气体分子运动与速率分布

分子动理论题的「盒子里的分子 + 速率分布图」。左边是三维盒子（斜二测画法，前框深、后框浅），分子做真实的硬球弹性碰撞，颜色表示速率（蓝 → 紫 → 红 → 琥珀，越快越暖），每个分子拖一小段沿速度方向的尾巴；右边是各速率区间的分子数占比直方图，每 0.15 s 重新统计一次，叠一条麦克斯韦理论曲线。

```
<Param name="Tg" label="温度 T" unit="K" min={100} max={900} step={1} value={373} />
<GasBox title="氧气分子" T="Tg" gas="O2" compare={273} tag />
<GasBox title="从同一速率出发" T={300} gas="N2" start="same" autoplay={false} />
```

| 属性 | 说明 |
|---|---|
| `T` | 热力学温度（K，必填，可写表达式，常绑一个 Param）。拖动时把所有分子速率乘 √(T′/T)，分布形状不变、整体右移 |
| `gas` | `H2`、`He`、`N2`（默认）、`O2`、`Ar`、`CO2`。其他气体写 `mass`（摩尔质量，单位 u），`gas` 只当名字显示 |
| `count` | 分子数，20–800，默认 300 |
| `start` | `maxwell`（默认，一开始就是平衡分布）或 `same`（所有分子都以方均根速率出发，只有一根柱子；碰撞几秒后落到理论曲线上，总动能不变所以温度不变） |
| `compare` | 再画一条该温度的虚线理论曲线做对照（如 0 ℃ 和 100 ℃ 的氧气） |
| `tag` | 跟踪 1 号分子：盒子里画圈和轨迹，横轴上用三角形标出它此刻的速率（单个分子速率不停变，整体分布稳定） |
| `collide` | `false` 时分子互相穿过、只和器壁碰（分布永远不会变成麦克斯韦分布，用来对比） |
| `theory` | `false` 时不画理论曲线 |
| `bins`、`vmax` | 直方图大约分几档（默认 24，自动取 50、100 这样的整数宽度）、横轴最大速率（默认按 T 的 Param 最大值取 3.1 倍最概然速率，拖动时横轴不变） |
| `autoplay` | 默认滚到眼前就开始运动；`false` 时等学生按播放 |

- 下方读数：统计平均速率、方均根速率，和理论的最概然、平均、方均根速率；控制条有播放 / 暂停、重新开始（回到初始分布并暂停）、0.5× / 1× / 2×，以及「平均每个分子碰撞了几次」。
- 鼠标悬停（触屏点按）某根柱子：读数换成「该区间实际 n 个、占比、理论占比」，盒子里只亮出这一段速率的分子，其他变暗。
- 纵轴是占比（%），所以两条曲线下的面积都是 100%；温度低峰高、温度高峰低而右移。

### `<GasTube>`：气柱、液柱、活塞

一根细管里排着气柱、液柱和活塞，准静态地跟着一个参数变（加热、转角度、再灌一段水银）。组件按气体定律和力平衡把每一段的压强、长度算出来，并画出管子。不要自己写 pV = C 去驱动画面或曲线。

```
<Param name="Tk" label="气体温度" unit="K" min={300} max={600} step={15} value={300} />

<GasTube
  name="cyl"
  units="SI"
  p0={1e5}
  g={10}
  S={0.01}
  path={[{length: 0.5, angle: 90}]}
  start="closed"
  end="open"
  contents={[
    {gas: "A", L: 0.2, p: 1e5, T: 300, Tnow: "T", cv: 2.5},
    {piston: "P", m: 10, thick: 0.02, stops: {min: 0.2, max: 0.3}, leave: "Tleave", hit: "Thit"}
  ]}
  drive={{name: "T", from: 300, to: 600}}
  at="Tk"
/>

<Readout items={[
  {label: "离开下挡板", symbol: "T_离", expr: "Tleave", unit: "K"},
  {label: "到达上挡板", symbol: "T_到", expr: "Thit", unit: "K"}
]} />

<Plot
  x={{label: "V", unit: "m³", min: 0.0015, max: 0.0035}}
  y={{label: "p", unit: "Pa", min: 0.9e5, max: 1.5e5}}
  series={[{label: "p–V", x: "cyl.VA(s)", expr: "cyl.pA(s)", over: {name: "s", min: 300, max: 600}, point: "Tk"}]}
/>
```

| 属性 | 说明 |
|---|---|
| `name` | 发布一组函数，自变量都是驱动值。气柱 `X` 有 `pX(驱动)`、`LX`、`VX`、`TX`、`WX`、`UX`、`QX`；活塞有 `x活塞名`；液柱有 `x液柱名`（靠 `start` 一端的位置）和 `dz液柱名`（靠 `end` 一端减靠 `start` 一端的高度差，向上为正）。另外有 `from`、`to`。例：`cyl.pA(Tk)` 是滑块温度下的压强 |
| `units` | `SI`（默认，Pa、m、kg）或 `cmHg`（cmHg、cm）。cmHg 里不能放活塞 |
| `p0` | 大气压。开口端的压强就是它。SI 默认 `1e5`，cmHg 默认 `76` |
| `g` | 重力加速度，SI 默认 `10`。cmHg 里液柱按「1 cm 水银 ↔ 1 cmHg」计，不用写 `g` |
| `S` | 横截面积（m²）。SI 必填；cmHg 里长度用 cm，不需要面积 |
| `gap` | `start="open"` 时，管口到第一段的初始距离，默认 `0` |
| `path` | 管子折线。每段 `{length, angle}`，`angle` 是相对水平向右的角度（度，逆时针为正，向上是 90），可写表达式 |
| `start` / `end` | `closed` 或 `open`，默认都是 `closed` |
| `contents` | 从 `start` 到 `end` 依次排列。气柱 `{gas, L, p?, T?, Tnow?, amount?, cv?}`；液柱 `{liquid, L, rho?}`（SI 必填密度）；活塞 `{piston, m, thick?, stops?: {min?, max?}, force?, leave?, hit?}`。相邻的液柱和活塞合成一块一起动。`T` 是初温，必须用热力学温度（K，默认 300；27 ℃ 写 300）。`Tnow` 是过程中的温度（K，可用驱动名），不写就等温；`drive.from` 时它必须等于 `T`。`amount` 与气体的物质的量成正比（只看比值，默认 1），打气、漏气时用。`cv` 是摩尔定容热容除以 R 的倍数（单原子 1.5，双原子 2.5），写出后才有 `U` 和 `Q`。`force` 沿管子 +s 方向（可用这个活塞的位置 `x活塞名`）。`stops` 是挡板卡住的位置区间（活塞靠 `start` 一端的位置）；`leave`、`hit` 是离开、碰上挡板时的驱动值 |
| `drive` | `{name, from, to, steps?}`。`name` 是组件内部的过程变量（如 `T`、`θ`、`pour`），各段长度、角度、温度都可以写成它的表达式；它不能和 `<Param>`、`<Define>` 重名。`from` 可以大于 `to`（降温、往回转）。`steps` 默认 200 |
| `stop` | 可选。发布过程停下时的驱动值（液柱到达开口、气柱被压没）；一直没停就是 NaN。题目问「水银恰好到达管口 / 恰好不溢出时的温度」用它。写了 `stop` 就表示预期会停，校验不再给警告 |
| `at` | 画面停在这个驱动值（通常就是滑块，如 `at="Tk"`）。不写就停在 `from` |

- 初态必须已经平衡：气柱给了 `p` 的，相邻活塞、液柱要力平衡；没给 `p` 的，能从开口或已知气柱推出来。推不出来会报错「气柱 X 的初始压强算不出来，请写 p」。
- 被挡板卡住的活塞，另一边的气柱必须自己写 `p`，组件不会隔着挡板去猜。
- 开口端不能紧挨气柱，中间要有活塞或液柱。开口端的液柱、活塞受大气压推，和其他块一样会动。
- 过程中气柱被压没、液柱到达开口（再往外就会溢出），组件停在那里并给出警告，之后的值是 NaN。水银溢出后液柱变短的过程目前算不了。
- `W` 是气体对外做的功，从 `from` 积到所求的驱动值；`U` 是相对初态的内能变化；`Q = ΔU + W`。
- 适用范围：`<GasTube>` 画出来就是一根截面处处相同的管子（加活塞、液柱）。题目装置不是细管、气缸时（倒扣在水里的瓶子、潜水钟、上宽下窄的容器、打气筒连容器），不要拿它代替装置图，也不要借它算体积——画面会多出题目里没有的管子和活塞。这类题用 `<Sim>`/`<Figure>` 的 `v.vessel` 画容器，状态方程用 `<Define>` 写（如 `p1*V1/p2`），曲线用 `<Plot>`。

### `<Optics>`：几何光学

折射、全反射、色散的光路用 `<Optics>` 求，不要手算折点再用 `v.ray` 连。

```
<Param name="i" label="入射角 i" min={0} max={70} step={1} value={30} unit="°" />
<Define name="n" expr="1.5" />
<Optics name="lt" n0={1}
  media={[{ name: "glass", n: "n", shape: { cx: 0, cy: 0, r: 2, from: 180, to: 360 } }]}
  rays={[{ name: "a", from: ["2.6*cos(deg(270-i))", "2.6*sin(deg(270-i))"], angle: "90-i", color: "red" }]} />
```

半圆形玻璃砖（平的一边朝上）。光线对准圆心从圆弧射入：圆弧上正入射，不偏折；平的一边按斯涅尔定律折射，入射角大于临界角就全反射。`lt.a.i[1]`、`lt.a.r[1]` 是第 1 个界面的入射角、折射角（度，从 1 数）；全反射或镜面处 `r` 为 NaN。`lt.a.exitAngle` 是最后一段的方向（度，−180 到 180），`lt.a.tir` 是全反射次数，`lt.glass.C` 是该介质对周围的临界角。入射角正好等于临界角（`angle` 写成用 `C` 算出的值）时按「刚好全反射」处理：光线反射回介质，不会贴着界面掠出去，所以「临界光线反射到某点」直接写一条光线，用 `v.optics` 的 `rays` 画，不要手算折点交给 `v.ray`。画面用 `v.optics(m, p.lt, {normals: true, angles: true})`。

- 介质按书写顺序叠放，后写的盖住先写的。一点的折射率取包含它的最后一个介质，否则是 `n0`（默认 1）。器件是几种形状的差集（矩形挖去一段圆弧、透镜挖去一块）时，先写本体，再叠上折射率等于周围的「挖空」介质；挖空介质写 `hidden: true`，只参与光路、不画出来。要画出差集的真实轮廓，再在最前面加一个按轮廓采样的多边形介质（折射率同本体，会被后面的介质盖住，不影响光路），本体也写 `hidden: true`。
- 形状：多边形 `{points: [[x, y], ...]}`（第 k 边从第 k 点到下一点，最后一条边回到第 0 点）；矩形 `{xmin, xmax, ymin, ymax}`（边 0 下、1 右、2 上、3 左）；圆 `{cx, cy, r}`；圆环再加 `inner`；扇形加 `from`、`to`（度，从 +x 逆时针；边 0 弧、1 `to` 处半径、2 `from` 处半径）。扇形带 `inner` 是扇环（边 0 外弧、1 `to` 端、2 内弧、3 `from` 端）。`segment: true` 用弦代替两条半径（边 0 弧、1 弦）。`{cx, cy, r, from: 180, to: 360}` 是平边朝上的半圆砖。`rotate`（度）绕 `about`（默认形状中心）转动整个形状。
- `mirror: [边的序号]` 把这些边镀银，从哪一侧来都反射，不再折射。
- `mirrors` 是独立的双面镜，`{line: [x1, y1, x2, y2]}` 或 `{arc: [cx, cy, r, a1, a2]}`，写法和 `v.track` 的一段一样。`screens` 是吸光屏 `{name, line}`，照到就停。
- `rays` 每条写 `from: [x, y]`、`angle`（行进方向，度）。`n: {介质名: 表达式}` 只改这一条光线在该介质里的折射率，用来做色散。`color` 用 red、violet、green 这类颜色名。
- `reflections` 默认 0：只追主光线（能折射就沿折射光走，全反射才反射）。`reflections: 1` 时，每个折射面的那条弱反射也追一层，反射出来的支路不再分叉。
- 主光路上每个界面给出 `i`、`r`、`kind`（1 折射、2 全反射、3 镜面、4 光屏）、`x`、`y`。还有 `hits`、`exitX`/`exitY`（最后一段的起点）、`endX`/`endY`（画到的终点）、`opl`（到最后一个界面为止的光程，不含射到周围里的那截）、`len.介质名`（在该介质里的几何路程）、`I`（主光线最后的光强）、`screen`（照到的光屏名，没有就是空字符串）、`screenX`/`screenY`（照到光屏的位置，没照到是 null）。
- 光强从 1 起算。折射时按非偏振菲涅尔公式分给折射光和反射光；全反射和镜面不损失。界面之间折射率相同就照直穿过，不算一次折射。

### 其他预制组件（计划中）

| 组件 | 用途 |
|---|---|
| `<Dimension>` | 静态图的尺寸标注线（`<Sim>` 里已有 `v.dim`） |
| `<Projectile>` | 抛体运动（含初始高度） |

## 五、`<Sim>`：沙箱动画

需要自动播放的过程用 `<Sim>`。外层负责播放、暂停、进度条、倍速和关键时刻按钮；模型只写**某一时刻的物理状态**和**怎么画**。

```
<Sim
  title="两车追及"
  height={260}
  duration={8}
  time="t"
  params={["vA", "vB0", "a", "x0"]}
  marks={[
    {t: 0, label: "开始刹车"},
    {t: 3, label: "距离最远"},
    {t: 5, label: "B 停车"},
    {t: 8, label: "A 追上 B"}
  ]}
>
sim({
  at(t, p) {
    const tStop = p.vB0 / p.a
    const tb = Math.min(t, tStop)
    return {
      xA: p.vA * t,
      xB: p.x0 + p.vB0 * tb - 0.5 * p.a * tb * tb,
    }
  },
  draw(ctx, s, v) {
    const m = v.view({ xmin: -2, xmax: 36, ymin: -1, ymax: 3 })
    v.axisX(m, { y: 0, step: 4, unit: 'm' })
    v.car(m, s.xA, 2, { color: v.color.blue, label: 'A' })
    v.car(m, s.xB, 0.8, { color: v.color.orange, label: 'B' })
  },
})
</Sim>
```

### 属性

| 属性 | 说明 |
|---|---|
| `title` | 标题 |
| `height` | 画布高度（像素），宽度自适应 |
| `duration` | 总时长（秒，物理时间）。可以是表达式字符串 |
| `time` | 可选。把当前时刻同步到这个参数上，其他组件（`Plot` 游标、`Readout`）就能跟着动画走 |
| `params` | 传进沙箱的参数和派生量名字 |
| `marks` | 关键时刻 `{t, label, color}`，显示在进度条上，点击跳转。播放过某个时刻后，状态栏一直显示它的 `label`（后面跟「+0.12 s」表示已过去多久），直到下一个关键时刻，所以 `label` 写阶段或事件名（「进入磁场」「绳子绷紧」「图示位置」），不要写只在那一瞬间成立的结论（「e₁ = 0」「速度最大」）；瞬间的结论用 `v.event` 标在画面上 |
| `loop` | 是否循环播放，默认否 |
| `autoplay` | 默认 `true`：滚动到可见后自动播放并循环（结尾停 1.2 s），学生一碰控件就停止自动循环。写 `false` 关掉 |
| `playSeconds` | 可选。1× 速度下播完全程用的真实秒数。不写时：`duration` ≤ 30 s 按真实时间播放，更长的过程（天体运行、缓慢变化）自动压缩到约 15 s，并在控制栏注明缩放比例 |
| `timeUnit` | 时间单位，默认 `s`（天体题可写 `h`） |
| `step` / `stepLabel` | 可选。控制栏多一个单步按钮（文字默认"下一步"），每点一次暂停并跳到下一个 `step` 的整数倍时刻。过程本身是一步一步的才用，例如回旋加速器 `step={1} stepLabel="前进半周"`、能级逐级跃迁 |
| `hud` | 画面左上角的实时读数 `[{symbol, label, expr, unit, digits, format}]`，第一个最醒目。**只放 1–3 个**，其余放侧栏 `<Readout>` |
| `legend` | 图例 `[{kind, label, symbol}]`，`kind` 取物理量名，加 `-dash` 是虚线，`strobe` 是频闪点 |
| `note` | 画面下方一行说明，如"轨道半径不按比例" |

参数改变时动画从 t = 0 重播。

### 沙箱里的代码

调用一次 `sim({...})`，提供以下函数：

| 函数 | 必填 | 说明 |
|---|---|---|
| `at(t, p)` | 二选一 | 解析解：返回 t 时刻的状态对象。**能写解析解就写解析解**，拖动进度条时直接算，不会累积误差 |
| `init(p)` + `step(s, dt, p)` | 二选一 | 数值解：`init` 返回初始状态，`step` 返回前进 dt 后的新状态（可以在里面用 RK4）。运行时用固定步长 1/240 s 积分，拖动进度条时从头重算 |
| `draw(ctx, s, v)` | 必填 | 画一帧。`ctx` 是 Canvas 2D 上下文，`s` 是状态，`v` 是绘图工具。参数用 `v.p`，直接写 `p` 也是同一个对象 |

`v` 提供：

- `v.t`、`v.p`、`v.width`、`v.height`：当前时刻、参数、画布尺寸（CSS 像素，已处理高分屏）。`v.duration` 是总时长，`v.night` 表示夜光主题。
- `v.color`：当前主题的颜色，物理量 `velocity force accel charge field`，中性 `ink graphite steel hairline enamel stage`（旧名 `text muted border bg panel blue orange green red purple gray` 仍可用）。**不要写死颜色值**，否则夜光主题下会看不清。
- `v.lightColor(lambda)`：波长 `lambda`（nm，380–780）对应的光谱色，返回 `rgb(r,g,b)`。只用于光本身的颜色；其余一律 `v.color`。屏上的条纹不要自己用它涂，用 `<Fringes>`。
- `v.at(t)`：取更早时刻的状态（`init/step` 写法也能用），配合轨迹和频闪。
- `v.view({xmin, xmax, ymin, ymax, pad})`：建立物理坐标到画布坐标的映射，返回 `m`，有 `m.x(x)`、`m.y(y)`、`m.s(len)`（长度换算）。**y 轴向上为正。**
- `v.line(m, x1, y1, x2, y2, opts)`、`v.circle(m, x, y, r, opts)`、`v.rect(m, x, y, w, h, opts)`、`v.path(m, points, opts)`。
  - `opts`：`color`（线条颜色）、`width`、`dash`（`true` 是默认虚线，也可写线型数组如 `[6, 4]`；`v.vec`、`v.ellipse`、`v.orbit` 等的 `dash` 同样）、`fill`（填充色，**不写就只画轮廓**）、`outline`、`close`（`path` 是否闭合）。画轨道、区域边框时只写 `color`；画实心物体时写 `fill`。
- `v.arrow(m, x1, y1, x2, y2, opts)`：箭头大小固定，不随线宽放大。
- `v.label(m, x, y, text, opts)`：文字标签。所有标签在 `draw` 结束后统一放置，**自动避开其他标签和本帧画的物体**，并且总在最上层。`v.text` 也在最后绘制。
- `v.dim(m, x1, y1, x2, y2, text, opts)`：尺寸标注线。
- `v.axisX(m, opts)`、`v.ruler(m, x1, x2, y, {step, minor, unit, body})`：刻度尺。`v.ruler` 默认画在一条铝尺身上（`body: false` 只画刻度线，和 `v.axisX` 一样）。`angle`（度，逆时针为正）让尺子绕 (x1, y) 转过去，沿斜面、斜管放尺子用；读数 k 落在沿尺方向离 (x1, y) 为 k − x1 的地方，所以要配 `equal: true` 的视图。
- `v.ellipse(m, cx, cy, rx, ry, {color, dash, from, to, rot})`：椭圆（或弧）。`from`、`to`、`rot` 都是**度**，从 +x 轴逆时针量（和本规范其他角度一样，不是弧度）；写了 `from`/`to` 就只画从 `from` 逆时针转到 `to` 的那段弧。画角度标记就用它，例如竖直线与绳的夹角 θ：`v.ellipse(m, x, y, 0.3, 0.3, {from: -90, to: -90 + theta})`。点波源的折射波前也用它：弧心和与界面的交点在 `<Define>` 里算，弧交给 `v.ellipse`，入射线和折射线用 `v.line`，不要再做波面组件。

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
- `v.plow(m, x, y, {kind, length, size, flip, label})`：犁，侧面看，犁铧尖落在地面 (x, y)，默认向 +x 拉（`flip: true` 向 −x）。`kind: 'curved'`（默认）是曲辕犁：短辕从把手拱过犁身、向前下弯，系索点低而近；`kind: 'straight'` 是直辕犁：长辕水平伸向前方，`length` 是辕端到犁铧尖的距离（场景单位）。犁身、犁箭、把手是喷漆钢，犁铧是深色铁件，犁壁贴在犁铧上，把手套橡胶。`size` 是把手高度（像素，默认 72）。返回 `{tip, hitch, handle}`，耕索用 `v.rope` 从 `hitch` 画出，力的箭头也从 `hitch` 起。
- `v.emitter(m, x, y, {angle, length, label})`：静电喷管（发射极），喷针尖在 (x, y)，沿 `angle`（度，从 +x 逆时针，默认 0）喷出。铝管身、锥形喷头、细针，尾部深色绝缘盖接引线。`length` 是管长（场景单位，默认 72 像素）。返回 `{tip, back, dir, angle}`：液滴从 `tip` 出发，电源引线接到 `back`。吸极是两块竖着的极板，用 `v.block` 或 `v.plates` 画。
- `v.backshell(m, x, y, w, {h, label})`：背罩（返回舱的后盖），罩口中心在 (x, y)，罩口宽 `w`，向上凸。侧壁略鼓的截锥、平顶、罩口一圈深色边，两道环向接缝；顶上有吊环。`h` 罩高（默认 0.42w）。返回 `{apex, left, right, rim}`：伞绳从 `apex` 接到 `v.parachute` 的 `attach`，探测器（`v.box` 或 `v.block`）挂在 `rim` 下面。
- `v.airbag(m, x, y, w, {h, press, at, label})`：安全气囊，装在深色底板上，底边中点在 (x, y)，放在 `v.ground` 或台面上。冷灰织物，两侧暗、顶上一道反光、两道褶线。`h` 高度（默认 0.6w）。`press` 是顶面被压下去的深度（场景单位），`at` 是压点离中心的水平距离；压下去时两侧略鼓。碰撞动画里写 `press: 压入深度`，头锤（`v.ball`）放在返回的 `top` 上。返回 `{top, left, right}`。
- `v.aircon(m, x, y, {kind, w, fan, label})`：分体空调。`kind: 'indoor'`（默认）是挂墙的室内机，(x, y) 是机身中心，下面是出风口和导风板；`kind: 'outdoor'` 是室外机，站在地面 (x, y) 上，正面风扇格栅、右侧百叶、两个黄铜阀门、橡胶脚。`w` 机身宽（场景单位，默认 160 像素），`fan` 是扇叶转角（度，动画时写 `fan: ω·t·180/π`）。返回 `{center, top, left, right, ports, air, airDir}`：冷媒管从 `ports` 接出，热量、气流的箭头从 `air` 画起（室内机 `airDir` 朝下）。
- `v.springScale(m, x, y, {angle, value, max, length, divisions, label})`：弹簧测力计，接在装置里。`(x, y)` 是圆环（固定端）。`angle` 是钩子方向（度，从 +x 轴逆时针，默认 −90）。`value` / `max` 单位 N，指针和挂钩伸出量都按这个比例算（满量程时挂钩比空载多伸出 0.22 倍壳长）。`length` 是空载壳长（默认 1.6）。刻度数字保持正立。返回 `{hook, fraction}`，绳子接到 `hook`，不要手写挂钩坐标。
- `v.electrometer(m, x, y, {value, max, deflection, label, h})`：静电计。金属球在上，外壳接地。指针张角 = 60° × value/max（写了 `value` 就不用再写 `deflection`）。`(x, y)` 在外壳中部。不要手画张角。返回 `{angle, ball}`，`angle` 是相对直杆的度数，`ball` 是金属球的坐标。
- `v.cylinder(m, x, y, w, h, pistonY, {molecules, temp, heat})`：汽缸 + 活塞，气体分子会自己动，`heat` 画加热波纹。
- `v.tube(m, {x, y, angle, sections, pistons, rod, gas, ghosts, wall})`：可倾斜的汽缸（含粗细不同的多段圆筒）。沿筒轴的坐标叫 `u`，垂直筒轴的叫 `w`，`(x, y)` 是 `u = 0` 的位置，`angle` 是筒轴方向（度）。`sections: [{from, to, r}]` 每段的轴向范围和内半径，相邻两段半径不同时自动画台阶；`pistons: [{at, label, labelSide}]`；`rod: true` 用细杆连接前两个活塞；`gas: {from, to, count, density, temp}` 在两活塞之间画气体，分子总数不变，气体被压缩时自然变密，`density` 控制底色深浅（常用 `p/p0`），`temp` 控制分子运动快慢；`ghosts: [{at}]` 用虚线画参考位置的活塞。返回 `{pt(u, w), ux, uy}`：`pt` 把筒上的点换成场景坐标，用来挂力箭头和尺寸线。必须配 `view({..., equal: true})`。
- `v.planet(m, x, y, r, {label})`、`v.orbit(m, cx, cy, rx, ry, {back, dash})`、`v.satellite(m, x, y, {angle})`（`angle` 是卫星朝向，度，从 +x 逆时针）、`v.stars()`（夜光主题的星空）。椭圆轨道按焦点放：已知近点、远点距离时，在 `<Define>` 里算半长轴 `a = (rp + ra) / 2`、中心离焦点 `c = a - rp`、半短轴 `b = sqrt(a^2 - c^2)`，再把中心和 `rx: a`、`ry: b` 交给 `v.orbit`。不要把焦点放在椭圆中心。
- `v.rails(m, x1, x2, yTop, yBot)`：导轨；`v.plates(m, x1, x2, yTop, yBot, {angle, tilt, signs})`：平行板。`angle`（度，逆时针）绕中心转动整对板，0 水平、90 竖直；`tilt` 再让下板相对上板转过一个角（两板不平行）。不写这两个时仍是原来的两块水平板，上「+」下「−」。`signs: 'flip'` 对调成上「−」下「+」（下板接正极、场强向上时），`signs: false` 不标；不要另写文字盖住原来的符号。`v.platesAt(m, x1, y1, x2, y2, {gap, angle, tilt, signs})` 的中线从 (x1, y1) 到 (x2, y2)，间距 `gap`；`angle` 改中线方向，不写就沿着给出的中线。斜放极板用这两个，不要自己转两条粗线。返回 `{top, bot, angle}`，每块板是两端点。
- `v.vessel(m, parts, {fills, wall})`：玻璃容器。只有轴对齐矩形时和原来一样：`parts: [{x1, y1, x2, y2, open}]`，重叠处自动连通，只画一圈外壁；`open: 'top' | 'bottom' | 'left' | 'right'` 让那一端开口。变截面另写零件（和矩形混在同一 `parts` 里也会并成一个外壁，轮廓按多边形采样再取并集）：`{flask: {cx, cy, r, neck: {w, h}, open}}` 圆底烧瓶（球 + 竖直细颈，`open: false` 把管口封上）；`{bottle: {x1, x2, y1, y2, neck: {w, h}, shoulder}}` 细颈瓶，瓶身是矩形，`shoulder` 是肩高，管口默认开着；`{jar: {cx, y, r, h, open: 'bottom'}}` 拔火罐，倒扣的圆顶，罐口在 y；`{capillary: {x, y1, y2, w}}` 两端开口的毛细管。烧瓶、细颈瓶倒置（瓶口朝下插进水槽）在零件里写 `down: true`：烧瓶绕球心、细颈瓶绕瓶身中线上下翻转，瓶身位置不变，颈和管口在下，返回的 `mouth.side` 是 `'bottom'`；不要用 `ctx.scale` 或手算坐标翻转整幅画。毛细管、试管插进液槽时，液槽和管分两次调用 `v.vessel`（先液槽后管）：写进同一个 `parts` 会并成一个空腔，浸在液体里的那段管壁就没了，也画不出汞在管内比外面低。水在管内比外面高、汞比外面低，高度差写在 `<Define>` 里。`fills` 仍是矩形，裁进空腔：`kind` 取 `'mercury'`（默认，银色，`meniscus: 'top'` 上凸）、`'water'`（下凹）、`'gas'`（底色 + 会动的分子；`count` 固定，压缩或自由膨胀后铺进连通的空腔，自然变疏密，`density` 常用 `p/p0`）。不要从轮廓算体积或截面积，写在 `<Define>` 里。返回 `{mouth, openings}`：`mouth` 是管口（或罐口）中心 `{x, y, w, side}`，用来接活塞、瓶塞、气球；`openings` 是全部开口。
- `v.conveyor(m, x, y, len, {angle, speed, r, label})`：传送带。`(x, y)` 是上表面起点，沿 `angle`（度）延伸 `len`；`speed` 是上表面速度（物理单位/秒，正为沿 `angle` 方向），带面刻痕和滚筒辐条随动画时间移动，暂停时停住。返回 `{pt(u), ux, uy}`：`pt(u)` 是上表面上距起点 `u` 的点，用来放物块。
- `v.bar(m, x1, y1, x2, y2, {thick, label})`：金属棒（导轨上的导体棒、杠杆），`thick` 单位 px。
- `v.photon(m, x1, y1, x2, y2, {label, amp, wavelength, still})`：光子，波浪线一路向前传播，琥珀色（光的颜色），末端带箭头；示意图里写 `still: true` 不动。
- `v.element(m, x, y, type, {vertical, closed, label, reverse})`：画布上的电路元件符号，`type` 取 `resistor`、`switch`、`battery`、`capacitor`、`lamp`、`ammeter`、`voltmeter`、`phototube`。`phototube` 是圆圈里的弧形阴极 K 和阳极细棒 A，光打在 K 上；`reverse: true` 把 A、K 对调。`battery` 的长细线是正极：横放时正极在左，`vertical: true` 竖放时正极在上；`reverse: true` 让正极换到右边（竖放时在下）。不要用 `v.line` 自己画电池。返回半长（物理单位），导线画到 `x ± 半长` 为止。
- `v.ray(m, points)`：光线（带方向箭头）；`v.wave(m, fn, x1, x2, {dots})`：波形 y = fn(x)，`dots` 画介质质点：`true` 等间距画一排，数字是质点个数，数组是各质点的 x 坐标（如 `[1, 2.5, 4]`，标出题目点名的质点）。单列横波、驻波快照、自己写好的分段函数仍用 `v.wave`，不要改成下面的波列。
- `v.waves(m, sources, x1, x2, {t, sum, parts, dots, wall})`：有限波列。每个波源 `{x, v, amp, lambda, phase, dir, start, cycles, shape}`：`dir` 取 `1`（向 +x）、`-1` 或 `'both'`；`t` 时刻波前在 x ± v(t − start)，波前前方位移是 0；`shape: 'sine'` 时 `cycles` 是发出的波长数（不写就一直振，波列从波源连到波前），`'pulse'` 是一个宽 λ/2 的半正弦鼓包，`'half'` 是半个波长、用 `phase` 选哪半段（`phase` 为 0 时和 pulse 一样，为 π 时上下颠倒）。`sum` 默认画合成波（粗线），`parts: true` 用虚线分色画每一列。`wall: {x, kind: 'fixed' | 'free'}` 在边界做一次镜像（固定端反相、自由端同相）；反射波不再反射。返回 `{y(x), yi(i, x)}`，`dots` 同 `v.wave`，质点取合成位移。不要手写窗口函数或 y1+y2。
- `v.optics(m, p.lt, opts)`：画 `<Optics name="lt">` 算好的介质、镀银边、镜子、光屏和光线。主光线实线，部分反射的支路更细更淡，透明度随光强变化，但不会淡到看不见。`normals: true` 在主光线每个折点画虚线法线；`angles: true` 标出入射角、折射角；`rays: ["a"]` 只画点名的几条；`labels: true` 在起点旁标光线名字；`media: false` 不画介质（镜子和光屏仍画）。折射、全反射、色散不要手算折点再交给 `v.ray`。
- `v.field(m, x1, y1, x2, y2, {dir: 'in' | 'out', step, shape, inner, points, sector, border, outline})`：画匀强磁场区域和符号（`in` 为 ×，`out` 为 ⊙），`step` 是像素间距。默认是矩形；`shape: 'circle'` 取矩形内切圆，`shape: 'ring'` 是圆环（`inner` 内半径，物理单位）；`points: [[x, y], ...]` 是任意多边形（三角形、半平面条带）；`sector: {x, y, r, from, to, inner}` 是扇形（圆心、半径、起止角，度，逆时针；`inner` 画扇环），这时前四个坐标参数随便写 0。异形区域自动画虚线边界（`dash` 改线型，`border: false` 不画），符号只画在区域内。不要自己用线条拼 × 号。磁场沿 x 连续变化（如 B = 5x）时不必按比例画疏密：仍用 `v.field` 标出区域，旁边 `v.label` 写「B = 5x，不按比例」。
- `v.regions(m, motion, {step, t, lines})`：画这个 `<Motion>` 的 `fields`。磁场沿用 `v.field`（圆、扇形、圆环、扇环、矩形、多边形；边界虚线，`inner` 只填两条半径之间），匀强电场画沿 `angle` 的平行箭头，径向电场画从圆心向外（或向里）的箭头，点电荷画成带 ± 的电荷。`lines: true` 再用 `v.efield` 描出这些点电荷的电场线。两者都有就叠在一起。E、B 随时间变号（交变电压、定时换向）时，箭头和 × / ⊙ 按当前时刻自动反向，场为 0 时不画；默认用动画时间，运动时间和动画时间不同时传 `t`。区域形状来自运动本身，不要另写一套坐标。每个场的 `label` 会自动标出来（矩形、整圆写在区域上方，扇形、多边形写在区域里面，点电荷标在电荷旁），不要再用 `v.label` 手写同一个名字；想换位置就不写 `label`，自己标。
- `v.efield(m, charges, {equipotentials, density, lines, arrows, color, conductors, clip})`：静电场。`charges: [{x, y, q, label}]` 是点电荷，`{x1, y1, x2, y2, q}` 是带电板或带电棒（`q` 为总电量）。自动描电场线（带方向箭头，条数正比于电量）、画电荷（琥珀色球，带 ±）；`equipotentials: 6` 再画 6 条虚线等势线（也可传数组指定电势值）。`through: [[x, y], ...]` 另外加粗描出恰好经过这些点的电场线；普通电场线默认画得淡一些，`through` 的线是强调，画得最实。场在容器里（水槽、管子、两板之间）时写 `clip: [x1, y1, x2, y2]`（盒子）或 `clip: [[x, y], ...]`（多边形），电场线、等势线和箭头都只画在这块区域里，不会跑出容器；不要再用底色矩形去盖住多出来的线。返回 `{E(x, y), phi(x, y), line(x, y)}`：`E`、`phi` 可以用来算粒子受力；`line(x, y)` 返回过该点的整条电场线（世界坐标点列，沿 E 方向从正电荷一端排到负电荷一端）。题目说「M、N 在同一条电场线上」时，先 `through: [[xM, yM]]` 画出这条线，再从 `line(xM, yM)` 里取 N（例如 `.find(([x, y]) => y < yN)`），沿线运动也用这串点，不要用贝塞尔曲线或直线去凑。有导体时写 `conductors`，整张图按截面计算（无限长导体、线电荷）：电势是 −q ln r，电场是 q r̂/r，自由点电荷也按线电荷算；没有 `conductors` 时仍是原来的三维点电荷，已有的图不变。每个导体只写一种形状：`points: [[x, y], ...]` 是闭合多边形截面（`open: true` 改成折线薄板）、`{cx, cy, r}` 是圆、`line: [x1, y1, x2, y2]` 是直薄板；再写 `q`（孤立导体的总电量，不写就是 0，中性）或 `V`（固定电势，`V: 0` 表示接地），不要又写 q 又写 V。可选 `label`、`fill: false`（不填金属色）。板上开一个孔，就写成同一直线上的两段 `line`，中间留一条缝，不要去挖一个带洞的多边形。电场线从正的自由电荷发出，也从带正电的导体表面发出：条数正比于正的表面电荷，沿边界按累积电荷排布，和自由电荷共用 `density`，所以导体 q = 2 大约是点电荷 q = 1 的两倍条。线从表面外侧沿外法线出发，因此垂直于表面离开；碰到负的自由电荷，或进入任何一个导体，就停（外面来的线停在感应出的负电荷上）。导体内部不画电场线，E 严格为 0，电势等于该导体的电势。等势线不画进导体里；导体自己的那条等势线就是它的轮廓，不要再贴着边描一条虚线。闭合导体填浅金属灰、墨线勾边（夜光主题下同样能看清）；薄板画成粗墨线。返回值另外有 `surface: [{x, y, sigma, len, conductor}]`（每个面板的中点、单位长度电荷密度、面板长度、属于第几个导体；σ·len 加起来就是这一段的电量）和 `potential(i)`（第 i 个导体解出的电势，固定电势的导体就返回写进去的 V）。题图是带电导体、尖端、导体靠近电荷时用 conductors，不要用一串点电荷去凑导体。
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
- `v.solenoid(m, x1, y1, x2, y2, {r, turns, sense, current, core, terminals, labels, field, lead})`：侧视螺线管，轴从端 1 `(x1, y1)` 到端 2 `(x2, y2)`，`r` 是管半径。`sense: 1` 是右手螺旋：顺着轴从端 1 看向端 2，导线顺时针前进；靠近读者的半匝（实线）沿端 1 → 端 2 往轴的右方下降。轴的右方 = 把端 1 到端 2 的方向顺时针转 90°（水平向右的螺线管，右方就是下方，实线呈「\」）。`sense: -1` 实线往上升（「/」）。背面半匝是淡色虚线，绕向看得出来。`current` 为正表示电流从端 1 流入，在几匝实线上画箭头。N 极是迎着看时电流为逆时针的那一端，由 `sense` 和 `current` 的符号算出，不要手标：同号时端 2 是 N，异号时端 1 是 N，电流为 0 没有极性。`labels: true` 才在两端标 N、S。`field: true` 画磁感线（管内沿轴指向 N，管外从 N 绕回 S），写数字是管内的条数。`core: true` 或 `'iron'` 画整根铁芯，`{from, to}` 只画轴上这一段（0 和 1 是两端，小于 0 或大于 1 就伸到管外）。`terminals: 'below' | 'above' | 'none'`（默认 below）把引出线放到轴的右方或左方。返回 `{north, south, terminals, axis: {ux, uy}, pt(u)}`：极面中心（无极性时为 null）、两根引出线的终点、轴上 u = 0…1 的点。画出的匝数夹在 3–16，极性与匝数无关。
- `v.toroid(m, cx, cy, R, {r, turns, sense, current, gap, gapAt, field})`：正视的螺绕环，环心半径 `R`，管半径 `r`（小于 R）。`sense: 1` 时靠近读者的半匝从内缘走到外缘并偏向逆时针。`current` 为正就顺着这个方向画箭头。两者同号时外缘是 ⊗、内缘是 ⊙，环内磁感线沿逆时针（内缘的电流都向外，按安培环路定理）；异号全部反过来。电流为 0 不画箭头和 ⊗/⊙。`field: true` 或数字沿中心圆画箭头。`gap` 是缺口张角（度），`gapAt` 是缺口中心方向（度，从 +x 逆时针，默认 0）。返回 `{ccw}`：+1 环内磁场逆时针，−1 顺时针，0 无电流。
- `v.magnet(m, x, y, {kind, w, h, angle, north, field})`：`kind: 'bar'`（默认）是条形磁铁。`north` 取 `left` / `right` / `up` / `down`（默认 right），再被 `angle`（度，逆时针）转过。N 的一半红色、S 的一半蓝色（磁极的习惯颜色），字母写在上面。`kind: 'horseshoe'` 或 `'U'` 是蹄形，开口朝下，`north: 'left' | 'right'`（默认 left）是哪条腿的极面为 N。`field: true` 或数字画磁感线：条形按两极模型从 N 极面绕到 S 极面，蹄形在两极之间大体跨过缺口、外面发散。返回 `{north, south}` 极面中心。极性、颜色都由参数决定，不要自己填色或手写 N/S。
- `v.radialField(m, cx, cy, rIn, rOut, {poles, north, dir, core, span, coil})`：气隙里的辐向磁场，箭头一样长（|B| 沿气隙均匀，线圈边始终垂直切割）。`poles: 'shoes'`（默认）是磁电式电表：左右极靴夹着软铁圆柱（`core: false` 不画圆柱），`north: 'left' | 'right'`（默认 left），`span` 是每块极靴的张角（度，默认 130）。磁感线从 N 极靴进入圆柱，再从圆柱进入 S 极靴，所以 N 一侧指向圆心、S 一侧离开圆心。`poles: 'ring'` 是环形极靴（扬声器、弹射线圈）：`dir: 'out'`（默认）箭头全部向外、内圆柱是 N，`dir: 'in'` 相反。`coil: {angle, w, h, current}` 画矩形线圈的截面，`angle` 是度，`w` 是两条边的距离（默认落在气隙中线）；`current` 为正时 `angle` 那条边的电流向外（⊙），对边向里（⊗），为负则对调，不写 `current` 按 +1。返回 `{north, south, core}`。
- `v.cyclotron(m, cx, cy, R, {gap, r1, halfTurns, sense, dir, e, sourceLabel})`：俯视回旋加速器。两个 D 形盒（半径 `R`，间隙 `gap`）内是匀强磁场（`dir` 同 `v.field`），下方接交流电源，中心画离子源。`r1` 是第一个半圈的半径，此后第 k 个半圈半径为 `r1·√k`（每次过缝获得相同能量）；`halfTurns` 限制半圈数（默认且最多为 `floor((0.96*R/r1 - 0.21)^2)`：离子源放在 D 形盒中心下方一点，各半圈的圆心都在中心 0.21·r1 以内，所以最后一圈刚好贴着盒边、半径 ≈ `r1·√N`；`Sim` 的 `duration` 用同一个式子写进 `Define`，播放时长才和圈数一致。按题目数据做时，先定最大半径 `rMax`（不超过 `0.9*R`）和半圈数 `N`，再取 `r1 = rMax/sqrt(N)`，这样改加速电压时出口半径不变，正好说明"出口速度与电压无关"）；`sense: -1` 改为顺时针；`e: 1 | -1` 在缝里画此刻电场方向（`0` 不画）。返回 `{at(h), upTo(h), points, radius(k), halfTurns}`：`h` 是已转过的半圈数（每半圈用时都是 T/2，所以 `at(t, p)` 里直接写 `h: t` 即可，配 `timeUnit="半周"`；想让学生一个半圈一个半圈地看，再加 `step={1} stepLabel="前进半周"`），`at(h)` 是粒子位置，`upTo(h)` 是已走过的轨迹折线（交给 `v.path` 画）。
- `v.car(m, x, y, opts)`：旧写法，保留兼容，新课件用 `v.cart`。

**动效**（只用这几种，保持克制）

- `v.trail(m, fn, {kind, every, clip})`：已走过的轨迹，越靠近现在越亮。`fn(s, t)` 返回 `[x, y]`；写 `every` 同时打频闪点。`clip` 与 `v.efield` 相同（盒子或多边形），轨迹只画在区域内。
- `v.strobe(m, fn, {kind, every})`：等时间间隔的频闪点，看出加速/减速。
- `v.event(m, x, y, text, {at, kind, digits})`：关键事件（碰撞、共速、点火）。在 `at` 时刻附近脉冲并弹出带时刻的标签，过后自动消失。时刻的小数位数和时间轴一致（随时长自动定），`digits` 可改。几个事件挨得近、同一帧都还在显示时，只显示时刻最晚的那个（同一时刻的都显示）。
- `v.pulse(m, x, y, {kind})`：持续脉冲（如正在加热的点）。
- `v.particles(m, points, {kind, speed, gap})`：沿折线流动的粒子（电流、气流、光子），`speed` 单位 px/s。

**作图规矩**（材质、明暗、影子由工具画好，下面是写课件时要做的选择）

1. **物体用工具画**：台面 `v.ground`、墙 `v.wall`、物块 `v.block`、小车 `v.cart`、小球 `v.ball`、斜面 `v.incline`、滑轮 `v.pulley`、导轨 `v.rails`、极板 `v.plates`、光电门 `v.photogate`、弹簧 `v.spring`。不要用 `v.rect`、`v.path` 自己拼方框和三角形，拼出来的没有材质，和别的物体不是一套画法。
   **实验器材也一样：有现成的就必须用。** 题图里的东西先在下表里找，找到了就不要自己画：

   | 题图里的东西 | 用这个 |
   |---|---|
   | 刻度尺、米尺、带刻度的板 | `v.ruler`（可放在物体下面当量程；沿斜面、斜管写 `angle`） |
   | 气缸、活塞 | `v.cylinder`；多段、带隔板或倒置的用 `v.vessel` 拼壁；细玻璃管水银柱用 `<GasTube>` 或 `v.tube` |
   | 烧杯、水槽、样品池、真空管、玻璃泡 | `v.vessel`（`fills` 画液体或气体） |
   | 玻璃砖、长方体或三棱镜介质、半圆柱、光纤 | `<Optics>` + `v.optics`（光路一起算） |
   | 纸板、铝板、铅板、木板、挡板 | `v.block`（竖着放就是板）；斜放的木板用 `v.incline` 或 `v.bar` |
   | 绕轴转的板：电池板、转动挡板、杠杆、门 | `v.block` 写 `angle` 和 `pivot: 'center'`（(x, y) 是转轴） |
   | 杆、横梁、导体棒 | `v.bar` |
   | 电磁铁、线圈、通电螺线管 | `v.solenoid`（`core` 画铁芯）；永磁体、U 形磁铁 `v.magnet` |
   | 滑动变阻器、电表、开关、电池 | 实物图 `<Wiring>`，原理图 `<Circuit>`；不要在 `<Sim>` 里画 |
   | 弹簧测力计、验电器 | `v.springScale`、`v.electrometer` |
   | 传送带 | `v.conveyor` |
   | 齿轮、啮合的一对齿轮（开瓶器、卷轴外齿轮、齿轮传动） | `v.gear`；与它啮合的用 `v.gearMesh`（自动对齿、反向转） |
   | 降落伞（伞盖、伞绳汇于一点） | `v.parachute`（返回 `attach` 接绳到下面的物体） |
   | 测试仪、控制单元、电源盒、仪器外壳 | `v.box`（接线从返回的 `terminals` 引出）；房间框、机箱剖面用 `style: 'frame'` |
   | 非直角的斜面、三角形或梯形的实体、积木 | `v.wedge`（顶点列表；物块放在返回的某条边上） |
   | 斜二测的长方体、平板、带剖面的块、平躺的线圈 | `v.slab`（`cut` 画剖面并在顶点外标 M、N、P、Q，`cutLabels: false` 不标；`loop` 画顶面线圈；箭头用返回的 `P` 定位） |
   | 握着绳子或杆的手 | `v.hand`（绳子从返回的 `grip` 接出） |
   | 激光笔 | `v.laser`（光线从返回的 `aperture` 出发） |
   | 犁（曲辕犁、直辕犁） | `v.plow`（`kind` 选曲辕或直辕；耕索从返回的 `hitch` 接出） |
   | 静电喷管、发射极、电喷针 | `v.emitter`（液滴从返回的 `tip` 出发，引线接 `back`） |
   | 返回舱背罩、着陆器的后盖 | `v.backshell`（伞绳从 `apex` 接到 `v.parachute`，探测器挂在 `rim` 下） |
   | 安全气囊 | `v.airbag`（`press` 画被压下去的样子，头锤放在返回的 `top`） |
   | 空调室内机、室外机 | `v.aircon`（`kind: 'indoor'` / `'outdoor'`，冷媒管从 `ports` 接出） |
   | 平行板、电容器极板 | `v.plates` |
   | 绳、细线 | `v.rope` 或 `v.line` |
   | 物体走过的轨迹、频闪照片 | `<Sim>` 里 `v.trail`（写 `every` 带频闪点）、`v.strobe`；整条预定轨迹只画一条细虚线 |
   | 弯曲或圆弧的轨道、导轨、管道 | `v.track`（`{arc: […]}` 段画圆弧，`pipe: true` 画成管） |
   | 导轨、光电门、变压器、示波管、霍尔片 | 见 `sim-apparatus` |

   表里没有、也没有相近器材的（安全带锁止机构这类装置），才用 `v.rect`、`v.path` 画示意简图，线条保持细、少、平面。动笔前把 `draw` 里每个 `v.rect` / `v.path` 对照这张表过一遍。
2. **放稳**：放在台面、斜面、小车上的物体，底边就写在那个面的高度上，接触影和受力作用点才对得上。悬空的物体不画影子。
3. **图里只留符号**：图上写 θ、v、F、A、B 这类符号，数值放进 `hud`、`<Readout>` 或 `note`。「N = 8.7 N」「T = 300 K」这样的写法会出现在作图建议里。题目给定的角度（30°）、尺寸线上的长度（`v.dim`）、坐标轴刻度、表示状态的「v = 0」不算。
4. **文字不压线**：名称用 `v.label`（自动避开物体和箭头）；手放的 `v.text` 要离开线条，不要压在导轨、器壁、场线上。
5. **线不出容器**：容器里的场线和轨迹用 `clip` 限在容器内（`v.efield`、`v.trail` 都支持，写盒子或多边形）。场线穿过 `v.line` 画的器壁会出现在作图建议里。
6. **一个焦点**：同一时刻只让一处用强调色（运动物体的速度、此刻挡光的光电门）。背景场线保持默认的淡色，要强调的那几条用 `through`。物体颜色用默认材质，只在区分两个同类物体时写 `color`。
7. **物体别太小**：画面内容至少占画布四分之一。又高又窄的物体（烧瓶、竖管、螺绕环）写 `size="narrow"`，或把几个物体并排放进同一画面；又宽又扁的画面把 `height` 调小；都小就收紧 `v.view` 的范围。
8. **示意图不加立体**：电路、能级、气体分子、干涉条纹、纸带交给对应组件，保持平面画法。
### 沙箱限制

- 运行在 `<iframe sandbox="allow-scripts" srcdoc="…">` 里，来源为空，碰不到主页面、Cookie 和本地存储。
- CSP 禁止一切网络请求，不能加载外部脚本、图片和字体。
- 只能通过运行时和外层通信，模型代码不直接调用 `postMessage`。
- 代码出错时，外层显示错误提示和课件里的文字说明，不影响其他组件。

### `<Figure>`：随参数变化的示意图

画物理情景本身（光路、液柱、汽缸、轨道、电场区域……），但不需要随时间播放。和 `<Sim>` 用同一个沙箱和同一套 `v` 工具，只是没有时间轴：参数一变就重画。

```
<Figure title="光路图" height={300} params={["i", "r", "n"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2, xmax: 2, ymin: -1.5, ymax: 1.5, equal: true })
    v.path(m, [[-1.5, -1], [1.5, -1], [0, 1.2]], { close: true, color: v.color.border })
    v.arrow(m, -1.8, 0.6, -0.6, 0, { color: v.color.red })
    v.label(m, -1.2, 0.3, 'i = ' + p.i.toFixed(1) + '°')
  },
})
</Figure>
```

| 属性 | 说明 |
|---|---|
| `title`、`height` | 同 `<Sim>` |
| `params` | 传进沙箱的参数和派生量名字，在 `draw` 里通过 `p` 读取 |

三维接触（下面三个球、上面一个，或垂直于画面的斜杆）不要挤进一张侧视图：俯视、侧视各写一张 `<Figure>`，接触和摩擦力画在它们所在的那个平面。

## 六、路线选择（给模型的规则）

1. **能用预制组件就用预制组件。** 曲线用 `<Plot>`，受力用 `<ForceDiagram>`（三力平衡加 `triangle`），电路图用 `<Circuit>`，实物连线用 `<Wiring>`，仪器读数用 `<Instrument>`，干涉和衍射条纹用 `<Fringes>`，纸带用 `<TickerTape>`，能级跃迁用 `<EnergyLevels>`，气体分子运动和速率分布用 `<GasBox>`，气缸、细管、U 形管里的气柱、液柱和活塞用 `<GasTube>`；不要在 `<Sim>` 里手画坐标系、曲线、电路、能级和分子。
2. 准静态过程（缓慢注水银、改变电阻、改变角度）：`<Param>` 滑块 + `<Figure>` 画情景 + 预制组件 + `<Readout>`，**不用 `<Sim>`**。
3. **每份课件都必须画出物理情景本身**：至少一个 `<Sim>`、`<Figure>`、`<ForceDiagram>`、`<Circuit>`、`<Wiring>`、`<Instrument>`、`<TickerTape>`、`<EnergyLevels>`、`<GasBox>`、`<GasTube>` 或 `<Fringes>`。只有 `<Plot>` 曲线不算（学生要先看到装置和过程，再看图像）。
4. 需要随时间自动播放的过程：`<Sim>`，并用 `time` 把时刻同步给 `<Plot>` 的游标。
5. 多阶段过程：一个 `<Sim>` + 关键时刻 `marks`，不拆成多个动画。各小问条件不同时，用选项型 `<Param>` 切换情形。
6. 整数自变量用 `<Bars>`，不用 `<Plot>` 画折线；能量转化题加一个 `<Ledger>`；只盯一个量（额定、临界）时用 `<Dial>`。
7. 每个小问写一个 `<Question>`，结果写进一个 `<Answer>`（默认收起）。`<Sim>` 的 `hud` 只放最关键的 1–3 个量。

## 七、内容规则（给模型的规则）

1. **结构固定**：题目条件分析 → 完整解答（中间量和结果用 `$\boxed{}$`）→ 交互演示 → 结合图像理解关键时刻 → 答案汇总。
2. **核心滑块 = 题目所求或缺失的变量**；题目给的数值作为初始值。
3. **答案做成 `<Preset>`**，一键跳到答案状态。
4. 题目只有两个离散状态时，可以加一个连续参数把它们串起来（例：汽缸倾角）。
5. **组件能算的不要手算**：电路读数交给 `<Circuit>`/`<Wiring>` 的求解（写 `emf`、`R`、`r` 和 `read`），不要手写欧姆定律、分压分流公式去驱动画面；变力、阻力、反弹、多阶段运动交给 `<Motion>` 积分，关键时刻用 `events` 求出来，不要手算后写死在 `marks` 里；平衡和牛顿第二定律里的未知力、加速度交给 `<ForceDiagram>` 的 `solve`，不要手写正交分解的公式；有摩擦、连接体、板块模型的运动给 `<Motion>` 写 `forces`/`bodies`，静摩擦还是滑动摩擦、何时共速由组件判断，不要手算分阶段的加速度；电容充放电、自感、LC 振荡、交流电路给 `<Circuit>` 写 `transient`，不要手写 e^(−t/RC) 之类的解去驱动画面和曲线。导体棒切割、双棒、棒接电容等电磁感应问题给 `<Motion>` 写 `circuit`，不要手写 v(t) = vm(1 − e^(−t/τ)) 或 I = BLv/R 去驱动画面和曲线。带电粒子在电场、磁场中的偏转给 `<Motion>` 写 `charge` 和 `fields`，不要手写 r = mv/(qB) 或偏转距离公式去驱动画面。气缸、细管、U 形管里的气柱、液柱、活塞用 `<GasTube>`，不要手写 pV = C 或分段的 p、V 去驱动画面和 p–V 图。
6. 题目里的约束条件交给 `<Define>` 自动计算，让它始终成立（例：极板长度由"恰好射出"算出）。
7. 题目只有字母没有数值时，用无量纲单位（如 `v/v*`），并在图上标出答案之间的比例。
8. 尺度差太大时可以放大或压缩，**必须用文字注明"不按比例"**。
9. 不要编造题目没有给的条件。缺条件时，说明答案只能写成含参数的形式。
10. 判断两个计算结果相等时写 `abs(a - b) < 1e-6`，不要写 `a == b`（浮点误差会让条件失效）。
11. 组件属性里的文字（`label`、`title`、`unit` 等）和 `<Sim>` 里的标签是纯文本，**不支持 LaTeX**。下标写成 `U_R`、`v_0`、`R_{AB}`，会渲染成下标；也可以直接用 Unicode（`v₀`、`θ`、`Ω`）。
12. 颜色只按物理量取（见第三节「颜色」），同一个量在全页同一种颜色；装饰、背景、物体本身不上色。
13. **选择题**：「完整解答」逐项判断，每个选项一段，先写结论（正确 / 错误），再写理由，能算的写出算式和结果。能用交互看出对错的选项（数值大小、图像形状、临界条件、变化趋势）各写一个 `<Question>`，`text` 抄选项原文，`set` 切到能看出对错的状态；纯概念的选项只写文字。`<Answer>` 第一条写 `{label: "答案", text: "BD"}`，头信息写 `choice`。

## 八、校验（入库前）

1. **结构校验**：头信息完整；标签名在白名单里；属性类型正确；参数名不重复；表达式能解析，只引用已声明的名字；没有循环引用。
2. **答案校验**：`answers` 和正文里加框的结果一致（人工抽查 + 脚本比对数值）。
3. **渲染校验**：无头浏览器打开课件，检查沙箱有没有报错，按每个 `marks` 时刻截图。
4. **物理校验**：对 `<Sim>` 的状态函数抽样，检查守恒量、边界条件（例：追上时刻两车位置相等）。
5. **画面校验**：截图人工审，或用多模态模型按清单检查（标签重叠、方向错误、比例未注明）。
