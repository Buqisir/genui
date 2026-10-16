---
id: fx-variant-expect-mismatch
title: 变式核对不通过
question: 开关 same 拨到 1 时，h 应是多少？
answers:
  - { name: h, value: 1 }
---

<Param name="same" label="同向" min={0} max={1} step={1} value={0} />
<Define name="h" expr="1 - same" label="高度" />

<Variant label="同向" set={{ same: 1 }} expect={{ h: 1 }} />

<Figure title="示意" height={200} params={["same"]}>
figure({
  draw(ctx, p, v) {
  },
})
</Figure>
