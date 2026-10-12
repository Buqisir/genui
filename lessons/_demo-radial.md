---
title: 非匀强电场演示：静电分析器（E ∝ 1/r 的径向电场）
source: 内部演示（改编自浙江选考静电分析器题）
demo: true
---

## 装置

四分之一圆环形静电分析器，两极板间是指向圆心的径向电场，场强 E = a / r。比荷相同的正离子从下方沿 +y 方向射入中心线 r = R 处。速度恰好满足 qE = mv²/R 时沿中心线做匀速圆周运动；速度偏大或偏小时会打到外板或内板上。

<Param name="v0" label="入射速度 v0" min={0.7} max={1.3} step={0.01} value={1} unit="m/s" />
<Define name="q" expr="1" />
<Define name="m" expr="1" />
<Define name="R" expr="1" />
<Define name="a" expr="1" />

<Motion name="pt" until={4} steps={4000} mass="m" charge="q"
  state={{x: "R", y: -0.4, vx: 0, vy: "v0"}}
  fields={[
    {label: "径向电场", radial: true, cx: 0, cy: 0, E: "-a/r", region: {cx: 0, cy: 0, r: "1.25*R", inner: "0.75*R", from: 0, to: 90}, exit: "tOut"}
  ]}
  events={[{name: "tFar", when: "x + 0.6", dir: "down", stop: true}]}
  read={{rOut: "sqrt(x^2 + y^2) @ tOut", xOut: "x @ tOut", yOut: "y @ tOut"}} />

<Define name="vMatch" expr="sqrt(q*a/m)" />

<Readout items={[
  { label: "匹配速度 √(qa/m)", expr: "vMatch", unit: "m/s", digits: 3 },
  { label: "离开电场处到圆心的距离", expr: "rOut", unit: "m", digits: 4 },
]} />

<Status cases={[
  {when: "abs(rOut - R) < 0.001", label: "沿中心线做匀速圆周运动", tone: "success"},
  {when: "rOut > R", label: "偏向外板", tone: "warning"},
  {label: "偏向内板", tone: "warning"}
]} />

<Sim
  title="离子在径向电场中的运动"
  height={360}
  duration="pt.tEnd"
  params={["pt", "R"]}
>
sim({
  at(t, p) {
    const b = p.pt
    return { x: b.x(t), y: b.y(t), vx: b.vx(t), vy: b.vy(t) }
  },
  draw(ctx, s, v) {
    const p = v.p
    const m = v.view({ xmin: -0.9, xmax: 1.45, ymin: -0.45, ymax: 1.45, pad: 16 })
    v.regions(m, p.pt)
    v.trail(m, (st) => [st.x, st.y], { kind: 'velocity' })
    v.ball(m, s.x, s.y, 0.03, { label: '' })
    v.vec(m, s.x, s.y, s.vx * 0.2, s.vy * 0.2, { kind: 'velocity', label: 'v' })
  },
})
</Sim>

<Preset label="匹配速度 v0 = 1" set={{v0: 1}} />
<Preset label="偏快 v0 = 1.1" set={{v0: 1.1}} />
<Preset label="偏慢 v0 = 0.9" set={{v0: 0.9}} />
