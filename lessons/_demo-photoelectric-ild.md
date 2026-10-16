---
id: _demo-photoelectric-ild
title: 光电效应：先预测，再实验
source: 复原 PhET 光电效应互动课（McKagan、Handley、Perkins、Wieman，Am. J. Phys. 77, 87, 2009）
topic: 光电效应
demo: true
givens: ["光照到阴极 K，打出光电子", "U_AK：阳极相对阴极的电压", "金属逸出功 W = 2.3 eV"]
question: 用光电管研究光电效应：单色光照到阴极 K 上，打出的光电子飞向阳极 A，电流表测光电流。改变光的强度、频率和两极间的电压，看电流怎么变。
answers:
  - { name: Uc1, value: 0.8 }
---

这节课不先讲结论。每一段先提一个问题，大家先自己预测，举手选 A/B/C；必要时和同桌争论一分钟，再举一次手。然后我们拖滑块做实验，由实验定胜负。

装置：单色光照到阴极 K 上，打出的电子飞向阳极 A，电流表测光电流。U_AK 是阳极相对阴极的电压，为负时电场阻碍电子。

<Param name="W" label="金属逸出功" symbol="W" value={2.3} unit="eV" hidden />

<Param name="lam1" label="光的波长" value={400} hidden />

<Param name="Ur" label="反向电压" symbol="U_r" value={0} min={0} max={1.5} step={0.01} unit="V" />

<Define name="Uc1" expr="max(0, 1240/lam1 - W)" />

<Segment title="加反向电压，电流怎么变" hint="把「反向电压」从 0 慢慢拖大，看电流表。" watch="电流先一路减小，反向电压到某个值时恰好为零；这个电压叫遏止电压 U_c。" ask="给光电管加反向电压并逐渐增大，电流会怎样？A 一加就变成零；B 逐渐减小，到某个电压才变成零；C 不变" reveal="B。光电子出射时动能有大有小，反向电压先挡住慢的，再挡住快的；最快的也过不去时电流为零，这时 eU_c = E_k（最大初动能）。" />

这一段研究的是：光电管加反向电压时，电流随电压怎么变。

光电子从阴极 K 飞出时动能各不相同。反向电压把电子往回推，动能小的先被挡住，动能大的后被挡住。反向电压加到某个值 U_c 时，动能最大的光电子也恰好到不了阳极，电流为零。这时

$$
eU_c = E_k
$$

所以量出遏止电压，就量出了最大初动能。

<Circuit title="给光电管加反向电压" source={{type: "battery", label: "U", emf: "max(Ur, 0.001)", positive: "right"}} load={{series: [{type: "phototube", label: "光电管", reverse: true, lambda: "lam1", W: "W", Isat: 2e-6, read: {I: "I", Uc: "Uc", Ek: "Ek"}}, {type: "ammeter", label: "A"}]}} />

<Status cases={[{when: "I > 1e-12", label: "有光电子到达阳极，电流不为零", tone: "neutral"}, {when: "Ur - Uc < 0.03", label: "反向电压正好等于遏止电压，电流恰好为零", tone: "success"}, {label: "反向电压超过遏止电压，电流为零", tone: "warning"}]} />

<Readout items={[{label: "光电流", symbol: "I", expr: "I*1e6", unit: "μA", digits: 2}, {label: "遏止电压", symbol: "U_c", expr: "Uc", unit: "V", digits: 2}, {label: "最大初动能", symbol: "E_k", expr: "Ek", unit: "eV", digits: 2, color: "charge"}]} />

<Segment title="光强加倍，会发生什么" hint="把「相对光强」从 1 拖到 2。" watch="I–U 曲线的平台（饱和电流）升高一倍，但曲线和横轴的交点 −U_c 不动。" ask="频率不变，光强加倍，会怎样？A 饱和电流变大，遏止电压不变；B 饱和电流和遏止电压都变大；C 都不变" reveal="A。光强加倍，每秒打到 K 上的光子数加倍，打出的电子数加倍，饱和电流加倍；每个光子的能量 hν 不变，E_k = hν − W 不变，遏止电压不变。" />

这一段最容易出错：很多人以为光越强，电子能量越大。

光强只决定单位时间里打出多少个光电子，所以它决定饱和电流的大小。每个光子的能量只由频率决定，E_k = hν − W 与光强无关，遏止电压也不变。

<Param name="k2" label="相对光强" value={1} min={1} max={3} step={0.1} />

<Plot title="伏安特性" x={{name: "U", label: "U_AK", unit: "V", min: -2, max: 2}} y={{label: "I", unit: "μA", min: 0, max: 6.5}} series={[{label: "光强 1 倍", expr: "U <= -Uc1 ? 0 : (U >= 0 ? 2 : 2*(U + Uc1)/Uc1)", color: "steel", dash: true}, {label: "现在", expr: "U <= -Uc1 ? 0 : (U >= 0 ? 2*k2 : 2*k2*(U + Uc1)/Uc1)", color: "charge"}]} />

<Readout items={[{label: "饱和光电流", symbol: "I_sat", expr: "2*k2", unit: "μA", digits: 1, color: "charge"}, {label: "遏止电压", symbol: "U_c", expr: "Uc1", unit: "V", digits: 2}]} />

<Segment title="换频率更高的光，遏止电压怎么变" hint="先把「光的频率」从 6 拖到 9（单位 10¹⁴ Hz），每换一次频率，就把「反向电压」拖到电流刚好为零，读出这时的 U_c。" watch="频率越高，要把电流挡成零的反向电压越大；把几次测得的 U_c 描到 U_c–ν 图上，正好落在一条直线上，斜率是 h/e，和横轴的交点是截止频率 ν_c。" ask="换成频率更高的光，遏止电压怎么变？A 变大；B 不变；C 变小" reveal="A。E_k = hν − W，频率越高，光子能量越大，电子出射时的最大动能越大，U_c = (hν − W)/e 随 ν 线性增大。图线斜率 h/e 对所有金属都一样。" />

光子能量 hν（eV）= 0.4144 × ν（10¹⁴ Hz），遏止电压

$$
U_c = \frac{h\nu - W}{e}
$$

随频率 ν 线性增大。图线斜率 h/e 对所有金属都一样。

令 U_c = 0，得到截止频率

$$
\nu_c = \frac{W}{h} \approx 5.6\times 10^{14}\ \mathrm{Hz}
$$

频率低于 ν_c 时，光子打不出电子，U_c 取 0。

<Param name="nu3" label="光的频率" symbol="ν" value={6} min={4} max={10} step={0.1} unit="10¹⁴ Hz" />

<Define name="Uc3" expr="max(0, 0.4144*nu3 - W)" />

<Param name="Ur3" label="反向电压" symbol="U" value={0} min={0} max={2} step={0.01} unit="V" />

<Circuit title="换频率，再测遏止电压" source={{type: "battery", label: "U", emf: "max(Ur3, 0.001)", positive: "right"}} load={{series: [{type: "phototube", label: "光电管", reverse: true, nu: "nu3*1e14", W: "W", Isat: 2e-6, read: {I: "I3"}}, {type: "ammeter", label: "A"}]}} />

<Readout items={[{label: "光电流", symbol: "I", expr: "I3*1e6", unit: "μA", digits: 2}, {label: "光子能量", symbol: "hν", expr: "0.4144*nu3", unit: "eV", digits: 2}, {label: "遏止电压", symbol: "U_c", expr: "Uc3", unit: "V", digits: 2, color: "charge"}]} />

<Plot title="遏止电压与频率" x={{name: "nu", label: "ν", unit: "10¹⁴ Hz", min: 4, max: 10}} y={{label: "U_c", unit: "V", min: 0, max: 2}} series={[{label: "U_c", expr: "max(0, 0.4144*nu - W)", color: "charge"}]} cursor="nu3" />

<Segment title="频率低于截止频率时，加强光、加电压行不行" hint="先把波长调到 600 nm（红光），再把「相对光强」拖到 10，把「正向电压」拖到 3 V。" watch="电流始终为零：光子能量 1240/600 ≈ 2.07 eV 小于逸出功 2.3 eV，一个电子也打不出来，电压只能推动已经出来的电子。" ask="用 600 nm 的红光照射（光子能量小于逸出功），把光强调到 10 倍，再加 3 V 正向电压，有电流吗？A 有；B 没有；C 光强够大才有" reveal="B。打出电子要靠单个光子的能量，hν < W 时光再强也打不出电子；没有光电子，正向电压再大也没有电流可推。" />

错误观念：光强够大，或者电压够大，就能打出电子。

打出电子靠的是单个光子的能量。hν < W 时，光再强，每个光子都不够逸出功，也就没有光电子。没有光电子，正向电压再大也推不出电流。

<Param name="lam4" label="光的波长" value={400} min={400} max={700} step={5} unit="nm" />

<Param name="k4" label="相对光强" value={1} min={1} max={10} step={0.1} />

<Param name="Uf" label="正向电压" symbol="U" value={0} min={0} max={3} step={0.05} unit="V" />

<Circuit title="给光电管加正向电压" source={{type: "battery", label: "U", emf: "max(Uf, 0.001)", positive: "left"}} load={{series: [{type: "phototube", label: "光电管", reverse: true, lambda: "lam4", W: "W", Isat: "2e-6*k4", read: {I: "I4"}}, {type: "ammeter", label: "A"}]}} />

<Status cases={[{when: "I4 > 1e-12", label: "有光电子，有电流", tone: "neutral"}, {label: "没有光电子，电流为零", tone: "warning"}]} />

<Readout items={[{label: "光子能量", symbol: "hν", expr: "1240/lam4", unit: "eV", digits: 2}, {label: "光电流", symbol: "I", expr: "I4*1e6", unit: "μA", digits: 2, color: "charge"}]} />

<Segment title="三条结论" />

这一节的三条结论，都是实验事实：

1. **光强决定光电子的数目**（饱和电流），不决定光电子的最大初动能。
2. **最大初动能由频率决定**：E_k = hν − W = eU_c。
3. **频率低于截止频率 ν_c = W/h 时，再强的光也打不出电子。**

最后提醒一句：这三条结论都是实验事实。用「光由一份一份的光子组成、一个光子只能把能量交给一个电子」，就能全部解释。

<Variant label="换逸出功更大的金属" set={{W: 2.8}} ask="换成逸出功 2.8 eV 的金属，λ = 400 nm 的光照射，遏止电压变成多少？" reveal="U_c = 3.10 − 2.8 = 0.30 V，比原来小 0.5 V。" expect={{Uc1: 0.3}} />
