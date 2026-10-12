# 渐进式文档

规范的源在这个目录。仓库根上的 `syntax-spec.md` 是拼出来的，不要直接改。

```
cd app && npx tsx scripts/docs.ts build    # 重写属性表，并拼回 syntax-spec.md
cd app && npx tsx scripts/docs.ts check    # 有过期或不一致就以非 0 退出
cd app && npx tsx scripts/docs.ts list     # 打印 id、层级、标题、字节数
```

## 怎么改

- 改某一段规范正文：打开 `manifest.yaml` 里对应的文件，只改 `<!-- region:某id -->` 和 `<!-- /region -->` 之间的内容。这段是从现行规范逐字切出来的，空格和换行都要保留。
- 区域顺序只由 `manifest.yaml` 决定。按清单从上到下拼各区域正文，得到 `syntax-spec.md`。
- 改组件有哪些属性、类型、必填、属性表里的短说明：改 `app/src/lesson/components.ts`。校验器和卡片上的属性表都读它。改完跑 `build`，不要手改卡片里的表。
- `cards/` 是 L1 组件卡，`ref/` 是 L2 深入参考。每份文档的 `id` 就是文件名（kebab-case）。
- L0 入口是 `docs/index.md`，不在这套区域清单里。

## 区域标记

```
<!-- region:某id -->
（正文，包含它自己的末尾换行）

<!-- /region -->
```

闭合标记单独成行，它前面有一个空行。那个空行不属于正文。正文自己如果以换行结束，拼回去时这个换行还在。不要在正文里写 `<!-- /region -->`。

## 卡片骨架

L1 卡按这个顺序写：何时用、最小例子、常见错误、属性（有 `component` 才有）、规范原文。最小例子放在 ` ```lesson ` 代码块里，以后会拿去跑校验。L2 是头信息加若干区域，区域外可以有一行引言。
