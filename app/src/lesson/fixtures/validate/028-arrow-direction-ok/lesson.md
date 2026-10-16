---
id: fx-arrow-ok
title: 箭头方向
question: 翻转后，箭头应当随 F 一起反向吗？
answers:
  - { name: F, value: 1 }
---

一个箭头画的是 F，F 会随翻转变号。

<Param name="flip" label="翻转" value={0} hidden />
<Define name="F" expr="1 - 2*flip" />

<Figure title="箭头" height={200} params={["F"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -1, xmax: 1, ymin: -1, ymax: 1, equal: true })
    v.vec(m, 0, 0, 0, p.F, { of: "F" })
  },
})
</Figure>

<Variant label="反向" set={{flip: 1}} />
