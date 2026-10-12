---
title: 绕固定轴转动演示：竖直磁场里摆动的导体杆（2023 浙江）
source: 内部演示（改编自 2023 浙江选考）
demo: true
---

## 电磁阻尼：电阻越大，衰减越慢

导体杆用两根等长细导线悬挂在水平轴上，处在竖直向上的匀强磁场中，和电阻 R 构成回路。杆从竖直位置拉开小角度静止释放。杆垂直纸面，摆线长 l，杆长 L。

<Param name="Rk" label="电阻 R（单位 R₀）" min={0.5} max={4} step={0.5} value={1} />
<Define name="g" expr="10" />
<Define name="m" expr="0.05" />
<Define name="l" expr="0.4" />
<Define name="L" expr="0.2" />
<Define name="B" expr="1" />
<Define name="R0" expr="0.5" />
<Define name="th0" expr="deg(8)" />

<Motion name="a" until={8} steps={3000} mass="m"
  axis={{inertia: "m*l^2", com: [0, "-l"], reaction: "T"}}
  state={{theta: "th0", omega: 0}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g", at: "com"},
    {label: "F_A", angle: 0, magnitude: "B*I*L", at: "com"}
  ]}
  circuit={{source: {type: "battery", label: "杆（E = BLv）", emf: "-B*L*l*omega*cos(theta)", r: 0, read: "I"}, load: {type: "resistor", label: "R", R: "Rk*R0"}}}
  read={{Tmax: "max(T)"}} />

<Motion name="b" until={8} steps={3000} mass="m"
  axis={{inertia: "m*l^2", com: [0, "-l"]}}
  state={{theta: "th0", omega: 0}}
  forces={[
    {label: "G", angle: -90, magnitude: "m*g", at: "com"},
    {label: "F_A", angle: 0, magnitude: "B*I*L", at: "com"}
  ]}
  circuit={{source: {type: "battery", label: "杆", emf: "-B*L*l*omega*cos(theta)", r: 0, read: "I"}, load: {type: "resistor", label: "2R", R: "2*Rk*R0"}}} />

<Plot
  title="摆角随时间变化：R（蓝）与 2R（橙）"
  x={{name: "t", label: "t", unit: "s", min: 0, max: 8}}
  y={{label: "θ", unit: "°", min: -9, max: 9}}
  series={[
    {label: "R", expr: "a.theta(t)*180/pi", color: "blue"},
    {label: "2R", expr: "b.theta(t)*180/pi", color: "orange"}
  ]}
/>

<Readout items={[
  { label: "R 时细线拉力最大值", expr: "Tmax", unit: "N", digits: 4 },
]} />
