---
id: seg-sd25-01
title: 三块金属的遏止电压
source: 2025 山东卷 第 1 题（单选，3 分）
question: "在光电效应实验中，用频率和强度都相同的单色光分别照射编号为 1、2、3 的金属，所得遏止电压如图所示，关于光电子最大初动能 E_k 的大小关系正确的是（　　）\nA. E_{k1} < E_{k2} < E_{k3}\nB. E_{k2} < E_{k3} < E_{k1}\nC. E_{k1} < E_{k3} < E_{k2}\nD. E_{k3} < E_{k2} < E_{k1}"
choice: B
answers: []
givens: ["同一种单色光（频率、强度都相同）", "金属 1、2、3", "U₁ 最高、U₂ 最低、U₃ 居中"]
---

这道题的难点是：同一种光照射三块金属，要把**遏止电压**和**最大初动能**联系起来，再按图排序。

题目没有给数值，下面取一组代表值：光子能量 $h\nu = 4.0\ \mathrm{eV}$，三块金属的逸出功 $W_1 = 2.3\ \mathrm{eV}$、$W_2 = 3.3\ \mathrm{eV}$、$W_3 = 2.9\ \mathrm{eV}$，使遏止电压的高低和图一致。

<Segment title="反向电压加到多大，电流为零" quote="在光电效应实验中，用**频率和强度都相同**的单色光分别照射编号为 1、2、3 的金属，所得**遏止电压**如图所示……" hint="选金属 1，把「反向电压」从 0 慢慢拖大，直到电流刚好为零。" watch="电流表读数降到零的那一刻，反向电压就是遏止电压 U_c；这时最大初动能 E_k 正好等于 eU_c。" ask="反向电压加到多大时电流刚好为零？这个电压和最大初动能有什么关系？" reveal="加到遏止电压 U_c 时电流刚好为零。动能最大的光电子也只能克服 eU_c 的功，所以 E_k = eU_c：遏止电压越高，最大初动能越大。" />

光电子从阴极飞出后，要克服反向电压做功才能到达阳极。反向电压加到遏止电压 $U_c$ 时，动能最大的光电子也恰好到不了阳极，于是

$$
E_k = eU_c
$$

所以量出遏止电压，就等于量出了最大初动能。

<Param name="metal" label="金属" value={1} options={[{value: 1, label: "金属 1"}, {value: 2, label: "金属 2"}, {value: 3, label: "金属 3"}]} />

<Param name="Ur" label="反向电压" symbol="U" value={0} min={0} max={3} step={0.05} unit="V" />

<Param name="hv" label="光子能量" symbol="hν" value={4.0} hidden />

<Param name="W1" label="金属 1 的逸出功" value={2.3} hidden />

<Param name="W2" label="金属 2 的逸出功" value={3.3} hidden />

<Param name="W3" label="金属 3 的逸出功" value={2.9} hidden />

<Define name="W" expr="metal == 1 ? W1 : (metal == 2 ? W2 : W3)" />

<Define name="lamNm" expr="1240/hv" />

<Circuit
  title="给光电管加反向电压"
  source={{type: "battery", label: "U", emf: "max(Ur, 0.001)", positive: "right"}}
  load={{series: [
    {type: "phototube", label: "光电管", reverse: true, lambda: "lamNm", W: "W", Isat: 2e-6, read: {I: "I", Uc: "Uc", Ek: "Ek"}},
    {type: "ammeter", label: "A"}
  ]}}
/>

<Status cases={[
  {when: "I > 1e-12", label: "有光电子到达阳极，电流不为零", tone: "neutral"},
  {when: "Ur - Uc < 0.03", label: "反向电压正好等于遏止电压", tone: "success"},
  {label: "反向电压超过遏止电压，电流为零", tone: "warning"}
]} />

<Readout items={[
  {label: "遏止电压", symbol: "U_c", expr: "Uc", unit: "V", digits: 2},
  {label: "逸出功", symbol: "W", expr: "W", unit: "eV", digits: 1},
  {label: "最大初动能", symbol: "E_k", expr: "Ek", unit: "eV", digits: 2, color: "charge"}
]} />

<Preset label="金属 1 的遏止电压" set={{metal: 1, Ur: 1.7}} />

<Segment title="三块金属排个序" quote="用**频率和强度都相同**的单色光分别照射……所得**遏止电压**如图所示，关于光电子最大初动能 E_k 的大小关系正确的是" hint="点柱状图上的柱子，或用「金属」切换 1、2、3。" watch="柱子越高，遏止电压越大，最大初动能也越大；光的强度相同，只影响饱和电流，不影响 E_k。" ask="E_k1、E_k2、E_k3 谁大谁小？" reveal="U₁ > U₃ > U₂，所以 E_k2 < E_k3 < E_k1，选 B。" />

三块金属用同一种光照射，光子能量 $h\nu$ 相同，只是逸出功不同。按 $E_k = eU_c$，遏止电压高的，最大初动能也大。代表值下 $E_k = h\nu - W$：$E_{k1} = 1.7\ \mathrm{eV}$，$E_{k2} = 0.7\ \mathrm{eV}$，$E_{k3} = 1.1\ \mathrm{eV}$。光的强度只影响饱和光电流，不影响 $E_k$。

<Bars title="三块金属的遏止电压"
  caption="同一种光照射，逸出功越小，遏止电压越高"
  x={{name: "k", label: "金属编号", min: 1, max: 3}}
  y={{label: "U_c", unit: "V", min: 0, max: 2}}
  expr="hv - (k == 1 ? W1 : (k == 2 ? W2 : W3))"
  cursor="metal"
  color="charge"
  digits={1}
/>

<Preset label="金属 1 的遏止电压" set={{metal: 1, Ur: 1.7}} />

<Preset label="金属 2 的遏止电压" set={{metal: 2, Ur: 0.7}} />

<Preset label="金属 3 的遏止电压" set={{metal: 3, Ur: 1.1}} />

<Segment title="完整解答" />

光电子从阴极飞出后，要克服反向电压做功才能到达阳极。反向电压加到遏止电压 $U_c$ 时，动能最大的光电子也恰好到不了阳极，所以

$$
E_k = eU_c
$$

最大初动能与遏止电压成正比，只要比较遏止电压。图中 $U_1 > U_3 > U_2$，因此

$$
\boxed{E_{k2} < E_{k3} < E_{k1}}
$$

代表值下，$E_k = h\nu - W$：$E_{k1} = 1.7\ \mathrm{eV}$，$E_{k2} = 0.7\ \mathrm{eV}$，$E_{k3} = 1.1\ \mathrm{eV}$，遏止电压分别为 $1.7\ \mathrm{V}$、$0.7\ \mathrm{V}$、$1.1\ \mathrm{V}$。

**A 错误。** $E_{k1}$ 最大，不是最小。

**B 正确。** 与 $U_2 < U_3 < U_1$ 的顺序一致。

**C 错误。** $E_{k2}$ 最小，不是最大。

**D 错误。** $E_{k3}$ 居中，不是最小。

<Answer items={[{label: "答案", text: "B"}, {label: "依据", text: "E_k = eU_c，U_1 > U_3 > U_2"}]} />
