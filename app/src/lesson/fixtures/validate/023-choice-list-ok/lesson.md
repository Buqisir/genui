---
id: fx-choice-list
title: 两问选择题
question: （1）下列说法正确的是______；（2）下列图像正确的是______。
choice: [AD, C]
---

（1）选择题，多选；（2）选择题，单选。选出的字母分别写在头信息 choice 里，按小问顺序排列。

<Figure title="示意" height={200}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -1, xmax: 5, ymin: -1, ymax: 4 })
  },
})
</Figure>
