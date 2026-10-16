---
id: patch
layer: L1
title: 只改几个块的补丁
related:
  - structure
  - rules
---

## 何时用

- 课件已经写好、校验过了，只改其中几个组件块（一个 `<Define>`、一个 `<Figure>`、一个 `<Variant>`）时，发补丁比整份重写稳，也不会误动别的块。
- 小改动（改一个数、补一个变式、删一个多余的读数）优先发补丁。先 `genui patch 课件.md --keys` 列出块名，再 `genui patch 课件.md 补丁.md` 合并。
- 要改正文段落，或要改的块超过一半，就写完整课件。补丁不能写正文。
- 组件块本身的属性和写法仍看对应的组件卡；本卡只讲怎么合并。

## 最小例子

基础课件（一份完整、能通过校验的课件）：

```lesson
---
id: example-patch
title: 串联分压
question: R1 取 2 Ω 时，R1 两端的电压是多少？
answers:
  - { name: U1, value: 3, unit: V }
---

两电阻串联，总电压 6 V，按阻值分压。

<Param name="R2" label="R2" value={2} min={1} max={5} step={0.5} unit="Ω" />

<Define name="R1" expr="2" />

<Define name="U1" expr="6*R1/(R1+R2)" />

<Readout items={[{label: "R1 两端电压", symbol: "U_1", expr: "U1", unit: "V", digits: 1}]} />

<Figure title="串联电路" params={["R2"]}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: 0, xmax: 10, ymin: 0, ymax: 4 })
    v.label(m, 1, 2, "R2 = " + p.R2 + " Ω")
  },
})
</Figure>
```

补丁：R1 换成 4 Ω，answers 跟着改，并在 `U1` 后面补一个 R2 两端电压的读数（`after` 指明位置）：

```patch
<!-- patch -->
---
answers:
  - { name: U1, value: 4, unit: V }
---

<Define name="R1" expr="4" />

<Readout items={[{label: "R2 两端电压", symbol: "U_2", expr: "6-U1", unit: "V", digits: 1}]} after="Define:U1" />
```

## 常见错误

- 补丁里写正文段落（一句话、标题、`$\boxed{}$` 结果）→ 只留组件块和头信息，正文要改就写完整课件（报「补丁里只能写组件块和头信息」）。
- 新块没写 `after` 或 `before` → 写 `after="KEY"` 指明放在哪个块后面（报「新组件 Readout 要写 after="…"」）。
- 用重名的标题当名字，如两个 `<Figure title="电路图">` 都写 `Figure:电路图` → 名字不唯一，改用序号 `Figure#2`；替换第二个时写 `<Figure … patch="Figure#2">`（报「有 2 个同名块，请改用 Figure#序号」）。
- 替换时顺手改了块名，如把 `<Figure title="电路图">` 改成 `<Figure title="串联电路图">` → 补丁按新名字找不到原块，会被当成新块（报「新组件 Figure 要写 after="…"」）。改名时用旧名字指明替换哪个块：`<Figure title="串联电路图" patch="Figure:电路图">`。
- 只写了改动的那一个属性而不是整块，如只写 `expr="4"` 一个属性 → 补丁是整块替换，不是改属性。不带名字的半截块会被当成新块（要求 `after`），带名字的会丢掉原来其他属性。改哪个块，就把那一整块写出来。

## 规范原文
<!-- region:patch -->

## 九、补丁：只改几个块

1. 课件已存在、只改几个组件块时，可以只发补丁。补丁第一行是 `<!-- patch -->`，之后可以有一段头信息，最后是组件块。补丁里不写正文。
2. 头信息只写要改的字段，一个字段一个顶层键；写 `字段: null` 表示删掉它。
3. 组件块按名字替换课件里的同名块。块名是 `Define:R1`、`Figure:电路图`、`Variant:两杆电流同向`（名字取自 `name`、`title` 或 `label`）。名字不唯一或没有名字的块用序号，如 `Readout#2`，在块上写 `patch="Readout#2"`。
4. 替换是整块替换：补丁里的这一块会换掉原来的整块，原来有而补丁没写的属性和内容都会丢。
5. 新增的块写 `after="KEY"` 或 `before="KEY"`，指明放在哪个块的后面或前面，两者不能同时写。
6. 删除写 `<Remove target="KEY" />`。
7. 补丁要么全部生效，要么一条都不生效。找不到块、块名重复、补丁里有正文等任何错误，都会退回，课件保持原样。
8. 合并后的课件照常校验。

命令：`genui patch 课件.md 补丁.md`（加 `--dry` 只预览，不写入）；`genui patch 课件.md --keys` 列出课件里每个块的名字和行号。

<!-- /region -->
