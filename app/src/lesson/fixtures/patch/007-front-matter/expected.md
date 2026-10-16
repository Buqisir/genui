---
id: patch-demo
title: 补丁演示
answers:
  - { name: y, value: 9 }
grade: 高一
---

开头一段正文。

<Define name="R1" expr="1" />

<Define name="R2" expr="R1+1" />

<Figure title="电路图" height={200}>
figure({
  draw(ctx) {
    ctx.fillRect(0, 0, 10, 10)
  },
})
</Figure>

<Readout items={[{label: "甲", expr: "R1", unit: "V"}]} />

<Readout items={[{label: "乙", expr: "R2", unit: "V"}]} />

结尾一段正文。
