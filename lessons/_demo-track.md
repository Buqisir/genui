---
title: 组合轨道演示：开口半圆 + 细圆管 + 粗糙斜面 + 弹性板（2022 浙江）
source: 内部演示（改编自 2022 浙江选考）
demo: true
---

## 装置

倾角 α = 37° 的光滑直轨道 AB，圆心 O₁ 的开口半圆轨道 BCD，圆心 O₂ 的半圆细圆管 DEF，倾角 37° 的粗糙直轨道 FG（μ = 7/8），G 处垂直轨道的弹性板。B、O₁、D、O₂、F 在同一直线上，R = 0.15 m，m = 0.1 kg。滑块从 AB 上距 B 点 lx 处静止释放。

<Param name="lx" label="释放点到 B 的距离 lx" min={0.5} max={1.6} step={0.01} value={1} unit="m" />
<Define name="g" expr="10" />
<Define name="m" expr="0.1" />
<Define name="R" expr="0.15" />
<Define name="mu" expr="7/8" />
<Define name="ux" expr="0.6" />
<Define name="uy" expr="0.8" />
<Define name="aB" expr="180 + atan2(uy, ux)*180/pi" />
<Define name="sF" expr="lx + 2*pi*R" />
<Define name="LFG" expr="4*R*uy/0.6" />

<Motion name="blk" mass="m" until={8} steps={4000}
  state={{s: 0, v: 0}}
  track={{
    pieces: [
      {line: ["-0.8*lx", "0.6*lx", 0, 0]},
      {arc: ["R*ux", "R*uy", "R", "aB", "aB + 180"]},
      {arc: ["3*R*ux", "3*R*uy", "R", "aB", "aB - 180"], pipe: true},
      {line: ["4*R*ux", "4*R*uy", "4*R*ux + LFG*0.8", "4*R*uy - LFG*0.6"], mu: "mu"}
    ],
    normal: "N", leave: "tLeave", together: "tStop",
    end: {bounce: 1}
  }}
  forces={[{label: "G", angle: -90, magnitude: "m*g"}]}
  events={[
    {name: "tC", when: "vy", dir: "up"},
    {name: "tF", when: "s - sF", dir: "up"},
    {name: "tFall", when: "y + 1", dir: "down", stop: true}
  ]}
  read={{NC: "N @ tC", vF: "speed @ tF", sEnd: "s @ tEnd"}} />

<Define name="dEnd" expr="sEnd - sF" />

<Readout items={[
  { label: "最低点 C 的支持力", expr: "NC", unit: "N", digits: 3 },
  { label: "第一次经过 F 的速度", expr: "vF", unit: "m/s", digits: 3 },
  { label: "最终停在 F 下方", expr: "dEnd", unit: "m", digits: 3 },
]} />

<Sim
  title="滑块沿组合轨道运动"
  height={340}
  duration="blk.tEnd"
  params={["blk", "lx", "R", "tLeave"]}
>
sim({
  at(t, p) {
    const b = p.blk
    return { x: b.x(t), y: b.y(t), vx: b.vx(t), vy: b.vy(t), speed: b.speed(t), N: b.N(t), normalDir: b.normalDir(t), side: b.side(t) }
  },
  draw(ctx, s, v) {
    const p = v.p
    const m = v.view({ xmin: -0.8 * 1.6 - 0.05, xmax: 1.3, ymin: -0.15, ymax: 1.0, pad: 16 })
    const tr = v.track(m, p.blk, { marks: [{ x: -0.8 * p.lx, y: 0.6 * p.lx, label: 'A' }, { x: 0, y: 0, label: 'B' }, { x: 0.6 * 0.6, y: 0.8 * 0.6, label: 'F' }] })
    v.trail(m, (st) => tr.place(st, 0.025), { kind: 'velocity' })
    const [bx, by] = tr.place(s, 0.025)
    v.ball(m, bx, by, 0.025, { label: '' })
    v.vec(m, bx, by, s.vx * 0.05, s.vy * 0.05, { kind: 'velocity', label: 'v' })
  },
})
</Sim>

<Preset label="题(1)：lx = 0.7 m" set={{lx: 0.7}} />
<Preset label="越过管顶：lx = 0.9 m" set={{lx: 0.9}} />
