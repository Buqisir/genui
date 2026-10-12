---
title: 干涉与衍射条纹
demo: true
---

条纹间距、环半径和颜色都由参数算出。2017 年浙江卷的双缝：d = 0.80 mm，L = 0.80 m，λ = 500 nm，中央上方第 1 条亮纹 P₁、第 3 条亮纹 P₂。Δx = Lλ/d = 0.500 mm。两只虫子沿屏爬行的路程差就是这两条亮纹的距离，时间差 1.0 s。

拖动波长，条纹变疏变密，颜色跟着变。白光是 380–760 nm 叠出来的，不是手涂的彩条。

<Param name="lam" label="波长" symbol="λ" min={400} max={700} step={10} value={500} unit="nm" />

<Param name="d" label="双缝间距" symbol="d" min={0.3} max={1.5} step={0.05} value={0.8} unit="mm" />

<Param name="L" label="缝到屏" symbol="L" min={0.4} max={1.6} step={0.05} value={0.8} unit="m" />

<Param name="xc" label="光屏位置" symbol="x" min={-3} max={3} step={0.05} value={0.25} unit="mm" />

<Fringes title="双缝干涉（2017·浙江）" type="double" lambda="lam" d="d" L="L" span={8} cursor="xc" marks={[{k: 1, label: "P₁"}, {k: 3, label: "P₂"}]} read={{dx: "dx", r1: "x1", r3: "x3", I: "Iat"}} />

<Readout items={[
  {label: "条纹间距", symbol: "Δx", expr: "dx", unit: "mm", digits: 3},
  {label: "P₁", expr: "x1", unit: "mm", digits: 3},
  {label: "P₂", expr: "x3", unit: "mm", digits: 3},
  {label: "爬行时间差", expr: "(x3-x1)*1e-3/1e-3", unit: "s", digits: 2},
  {label: "该点光强", symbol: "I", expr: "Iat", digits: 2},
]} />

<Fringes title="白光双缝" type="double" d="d" L="L" white span={8} />

2018 年浙江卷用激光照细丝，中央亮带宽的那根丝更细。细丝直径从 0.605 mm 起（题给的细丝Ⅰ）。巴比涅原理：和等宽单缝是同一张图，`wire` 只改说明。

<Param name="a" label="缝宽 / 丝径" symbol="a" min={0.1} max={1.2} step={0.005} value={0.605} unit="mm" />

<Fringes title="细丝衍射（2018·浙江）" type="single" lambda="lam" a="a" L="L" wire span={8} read={{width: "wcent"}} />

<Readout items={[
  {label: "中央亮纹宽度", expr: "wcent", unit: "mm", digits: 3},
]} />

线性空气劈尖的条纹是等间距的。垫片变薄，间距变大。2026 年卷图丙那种上疏下密，是膜厚梯度不均匀（肥皂膜下厚），不是等倾角劈尖。侧视把倾角夸大了，间距仍按真实 θ 算。

<Param name="h" label="垫片厚度" symbol="h" min={0.002} max={0.03} step={0.001} value={0.006} unit="mm" />

<Fringes title="空气劈尖" type="wedge" lambda="lam" h="h" length={12} side read={{dx: "wdx", theta: "wth"}} />

<Readout items={[
  {label: "劈尖条纹间距", expr: "wdx", unit: "mm", digits: 3},
  {label: "劈尖角", symbol: "θ", expr: "wth", unit: "°", digits: 4},
]} />

<Param name="Rn" label="曲率半径" symbol="R" min={0.4} max={2.5} step={0.1} value={1} unit="m" />

<Fringes title="牛顿环（反射）" type="newton" lambda="lam" R="Rn" span={6} marks={[{k: 1, label: "k=1"}, {k: 5, label: "k=5"}]} read={{r1: "nr1", r5: "nr5"}} />

<Readout items={[
  {label: "第 1 暗环", symbol: "r_1", expr: "nr1", unit: "mm", digits: 3},
  {label: "第 5 暗环", symbol: "r_5", expr: "nr5", unit: "mm", digits: 3},
]} />

电子衍射环的半径正比于德布罗意波长。k 把晶面间距和屏距折成一个常数，不手写半径。电压升高，环缩小。

<Param name="U" label="加速电压" symbol="U" min={2000} max={20000} step={500} value={5000} unit="V" />

<Fringes title="电子衍射（2025·浙江）" type="electron" U="U" k={0.4} span={50} marks={[{k: 1, label: "n=1"}, {k: 2, label: "n=2"}]} read={{lambda: "elam", r1: "er1"}} />

<Readout items={[
  {label: "德布罗意波长", symbol: "λ", expr: "elam", unit: "pm", digits: 2},
  {label: "第 1 环半径", expr: "er1", unit: "mm", digits: 2},
]} />

测量头复原上面这道双缝测波长。手轮零点放在中央亮纹左侧 2.000 mm：对准 P₁ 读 2.500 mm，对准 P₂（第 3 条）读 3.500 mm。Δx = (3.500 − 2.500)/(3 − 1) = 0.500 mm，λ = d·Δx/L = 500 nm。拖动波长时两只手轮一起走，分划板始终压在该亮纹上，反算的波长跟着变。

<Instrument title="测量头对准 P₁" type="measurementHead" value="dx+2" fringes={{lambda: "lam", d: "d", L: "L", offset: 2}} />

<Instrument title="测量头对准 P₂" type="measurementHead" value="3*dx+2" fringes={{lambda: "lam", d: "d", L: "L", offset: 2}} pair={{x1: "dx+2", n: 3}} read={{dx: "mdx", lambda: "mlam", x: "xP2"}} />

<Readout items={[
  {label: "测得间距", symbol: "Δx", expr: "mdx", unit: "mm", digits: 3},
  {label: "测得波长", symbol: "λ", expr: "mlam", unit: "nm", digits: 1},
  {label: "P₂ 的屏坐标", expr: "xP2", unit: "mm", digits: 3},
]} />
