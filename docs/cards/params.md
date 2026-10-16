---
id: params
layer: L1
title: 参数和表达式
component: Param
related:
  - preset
  - question
  - readout
  - answer
  - status
  - motion
---

## 何时用

- 学生能拖的量用 `<Param>`；由它们算出、必须一直成立的量用 `<Define>`。
- 初始值用题目给的数。题目只有字母时取一个代表性数值，并在正文说明。
- 不想出现滑块（如 `g`，或只由时间轴驱动的 `t`）写 `hidden`。整数用 `control="stepper"` 或 `options`。
- 一键跳到某个状态用 `preset` 或 `question` 的 `set`，不要再做一个滑块去点离散情形。
- 不要自己声明组件会算出的名字（如 `<Motion>` 的 `gEff`），见 `motion`。

## 最小例子

```lesson
---
id: example-params
title: 斜面分力
question: 倾角 30 度时，重力沿斜面向下的分力是多少？
answers:
  - { name: Fpar, value: 5, unit: N }
---

<Param name="m" label="质量" value={1} min={0.5} max={2} unit="kg" />

<Param name="theta" label="倾角" symbol="θ" value={30} min={0} max={60} unit="°" />

<Param name="g" value={10} hidden />

<Define name="Fpar" expr="m*g*sin(deg(theta))" />

<Figure title="斜面" params={["theta"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -0.2, xmax: 3, ymin: -0.2, ymax: 2 })
    v.line(m, 0, 0, 2.4, 0, { color: v.color.steel })
    v.line(m, 0, 0, 2, Math.tan(p.theta * Math.PI / 180), { color: v.color.ink })
  },
})
</Figure>
```

`Fpar = mg\sin 30° = 5 N`。角度先 `deg`。`g` 不是内置常量，要自己声明。

## 常见错误

- 滑块不写 `min`、`max` → 写上范围，或改成 `hidden` / `options`（`滑块需要 min 和 max（或写 hidden / options）`）。
- 表达式里直接写 `g`、`v0` → 先用 `<Param>` 或 `<Define>` 声明。内置常量只有 `pi`、`e`（`引用了未声明的名字 g`）。
- `sin(theta)`，而 `theta` 是度 → `sin(deg(theta))`。三角函数用弧度。
- `<Param name="g">` 和 `<Define name="g">` 同时出现 → 只留一个（zj-22：`名字 g 重复声明`）。
- 判断相等写 `a == b` → `abs(a - b) < 1e-6`。浮点误差会让 `==` 对不上。
- 声明了但整份课件都没用到的 `<Param>` / `<Define>` → 会收到提醒（`声明了但没有被用到`，只是提醒，不影响通过）。图、读数、表达式、answers 里都没出现，就删掉；打补丁替换掉某个块之后尤其容易留下这种量。

## 属性
<!-- props:Param -->
| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 参数名，字母开头 |
| label | string |  | 显示名 |
| symbol | string |  | 物理量符号，显示在名字前 |
| color | string |  | 符号颜色，取物理量名 |
| unit | string |  | 单位 |
| value | number | 是 | 初始值，用题目给的数值 |
| min | number 或 expr |  | 滑块最小值 |
| max | number 或 expr |  | 滑块最大值 |
| step | number 或 expr |  | 滑块步长 |
| digits | number |  | 显示的小数位数 |
| format | string |  | sci 科学计数，或 percent |
| control | string |  | slider 滑块，或 stepper |
| options | array |  | 选项列表，每项 {value, label} |
| hidden | boolean |  | 只声明，不显示滑块 |
<!-- /props -->

## 规范原文
<!-- region:params -->
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


<!-- /region -->
<!-- region:expressions -->
### 表达式

表达式用 mathjs 语法，在受限环境里求值，不能访问任何 JS 对象。

- 运算：`+ - * / ^ %`，比较 `< <= > >= == !=`，逻辑 `and or not`，条件 `c ? a : b`。
- 函数：`sin cos tan asin acos atan atan2 sqrt abs exp log log10 min max floor ceil round sign clamp(x, lo, hi)`。三角函数用弧度，角度用 `deg(x)` 转成弧度。
- 常量：只内置 `pi`、`e`。其他常量（包括重力加速度 `g`）要用 `<Param hidden>` 或 `<Define>` 自己声明，数值按题目取。
- 可以引用所有参数和派生量。


<!-- /region -->
