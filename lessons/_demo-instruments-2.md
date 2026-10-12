---
title: 多用电表、弹簧秤与电阻箱
source: 2026·浙江·21；2021·浙江·30；2025·浙江·23
demo: true
---

指针、旋钮、挂钩和电阻箱数字都由被测量算出来，不要在图上另标读数。

## 一、多用电表测电阻

2026·浙江·21 的选择开关在 Ω×10。欧姆刻度左端 ∞、右端 0，偏转比例 = 中值 / (R/倍率 + 中值)。指针偏出中间三分之一就提示换倍率：把电阻调大，指针靠向 ∞，出现「换更大倍率」。

<Param name="Rx" label="待测电阻 R" min={1} max={20000} step={1} value={800} unit="Ω" />

<Instrument title="多用电表 Ω×10" type="multimeter" mode="ohm" range={10} value="Rx" />

## 二、同一只表的直流 10 V 挡

电压挡按满度线性偏转。10 V 读 0–10 刻度，每小格 0.2 V，估读到 0.1 V。

<Param name="U" label="电压 U" min={0} max={12} step={0.01} value={6.4} unit="V" />

<Instrument title="多用电表 直流 10 V" type="multimeter" mode="dcv" range={10} value="U" />

## 三、弹簧测力计

0.1 N 分度估读到 0.01 N。外壳可倾斜，刻度数字保持正立。图里两只秤的挂钩位置由读数算出，绳子接到挂钩上。

<Param name="F" label="竖直拉力 F" min={0} max={5} step={0.01} value={2.35} unit="N" />
<Param name="F1" label="左秤 F₁" min={0} max={5} step={0.01} value={1.8} unit="N" />
<Param name="F2" label="右秤 F₂" min={0} max={5} step={0.01} value={2.4} unit="N" />

<Instrument title="竖直，0.1 N 分度" type="springScale" value="F" max={5} divisions={50} />
<Instrument title="左秤，钩子朝下偏右" type="springScale" value="F1" max={5} divisions={50} angle={-60} />
<Instrument title="右秤，0.2 N 分度" type="springScale" value="F2" max={5} divisions={25} angle={-120} />

<Figure title="两秤拉橡皮条" height={360} params={["F1", "F2"]} note="挂钩随读数伸出，刻度数字不跟着外壳转">
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2.6, xmax: 2.6, ymin: -0.5, ymax: 2.7, equal: true })
    const L = v.springScale(m, -1.2, 2.2, { angle: -60, value: p.F1, max: 5, length: 1.45, divisions: 50 })
    const R = v.springScale(m, 1.2, 2.2, { angle: -120, value: p.F2, max: 5, length: 1.45, divisions: 25 })
    v.rope(m, [L.hook, [0, 0.35]])
    v.rope(m, [R.hook, [0, 0.35]])
    v.ball(m, 0, 0.35, 0.07, { label: 'O' })
  },
})
</Figure>

## 四、电阻箱

2021·浙江·30 的四旋钮电阻箱：×1000、×100、×10 都指 0，×1 指 5。待测电阻就是 5 Ω。实物图里每个旋钮都有 0–9。

<Instrument title="电阻箱（2021·浙江·30）" type="resistanceBox" value={5} decades={[1000, 100, 10, 1]} />

<Wiring title="电阻箱接在回路旁" height={220} parts={[
  {id: "Rb", type: "resistanceBox", value: 5, decades: [1000, 100, 10, 1], label: "电阻箱"}
]} wires={[]} />

<Answer title="2021·浙江·30" items={[{ label: "待测电阻 R_x", value: 5, unit: "Ω" }]} />

## 五、静电计

张角 = 60° × U/U_max，金属球在上，外壳接地。旁边是电容器的两块极板。

<Param name="Ue" label="极板电压 U" min={0} max={300} step={1} value={150} unit="V" />

<Figure title="静电计" height={320} params={["Ue"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -2.4, xmax: 2.4, ymin: -1.3, ymax: 1.7, equal: true })
    v.plates(m, -2, -0.4, 0.55, -0.55)
    v.electrometer(m, 0.9, -0.15, { value: p.Ue, max: 300, label: '静电计' })
  },
})
</Figure>

## 六、灵敏电流计的接线柱

2025·浙江·23：表盘下方是 −、G₀、G₁。三只接线柱画在表盘下，G₀ 和 G₁ 都进同一表头。

<Wiring title="灵敏电流计" height={200} parts={[
  {id: "G", type: "galvanometer", terminals: ["-", "G0", "G1"], value: 0.45, label: "G"}
]} wires={[]} />
