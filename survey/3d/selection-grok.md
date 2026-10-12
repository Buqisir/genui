# 高考物理可视化系统：三维方案选型调研

调研时间：2026-10-11（北京时间）。许可证、维护时间、体积都是当天从 GitHub API 和 bundlephobia 查到的，每条都附了链接。
「满足 / 部分 / 不满足」是我结合文档和源码做出的工程判断，不是库作者的说法。没跑过的地方都标了「未实测」。

## 0. 已核实的事实

| 候选 | 许可证 | 最近发布 / 提交 | 压缩后体积 | 来源 |
|---|---|---|---|---|
| Anatomy (iso-kit) | MIT | v1.0.0，2026-10-10 | 未查到 gzip 体积；`kit/iso-kit.mjs` 源码 35 KB（未压缩） | [repo](https://github.com/wheresryan22/anatomy)、[kit.md](https://github.com/wheresryan22/anatomy/blob/HEAD/references/kit.md) |
| three.js | MIT | r186，2026-09-24；当天仍有提交 | three@0.186.1 全量 gzip 约 185 KB（按需引入会小很多，未实测） | [repo](https://github.com/mrdoob/three.js)、[bundlephobia](https://bundlephobia.com/package/three) |
| react-three-fiber | MIT | v9.8.1，2026-09-24 | 约 57 KB gzip（不含 three） | [repo](https://github.com/pmndrs/react-three-fiber)、[bundlephobia](https://bundlephobia.com/package/@react-three/fiber) |
| Zdog | MIT（README 写明；GitHub 没识别出标准许可证文件，商用前请看[仓库原文](https://github.com/metafizzy/zdog)） | v1.1.1，2019-10；最后提交 2023-07 | 约 7 KB gzip | [repo](https://github.com/metafizzy/zdog)、[bundlephobia](https://bundlephobia.com/package/zdog) |
| JSXGraph (View3D) | LGPL-3.0 / MIT 双许可 | v1.14.0，2026-10-05 | 约 259 KB gzip（全量） | [repo](https://github.com/jsxgraph/jsxgraph)、[LICENSE.MIT](https://github.com/jsxgraph/jsxgraph/blob/main/LICENSE.MIT)、[bundlephobia](https://bundlephobia.com/package/jsxgraph) |
| GeoGebra 3D | 非商用免费；商用需另签协议 | 当天仍有提交，GitHub 上没有 release | 未查到 | [license](https://www.geogebra.org/license)、[repo](https://github.com/geogebra/geogebra) |
| MathBox | MIT | v2.3.1，2023-01；最后提交 2023-05 | 约 127 KB gzip | [repo](https://github.com/unconed/mathbox)、[bundlephobia](https://bundlephobia.com/package/mathbox) |
| fogleman/ln（Go） | MIT | 最后提交 2019-07 | 不适用（Go 写的） | [repo](https://github.com/fogleman/ln) |
| 方案 X：自研 | 自有 | — | 估计 10–25 KB gzip（未实测） | — |

几处关键的源码和文档依据：
- **Anatomy 的投影**只有 `azimuth` / `elevation` 两个参数，默认 45° 和 30°（[kit.md](https://github.com/wheresryan22/anatomy/blob/HEAD/references/kit.md)），是正交的轴测旋转，没有斜投影的剪切参数。遮挡靠 `depthOf` 画家排序，再加一套离线审计（`overlapsOf`、`depthOrder`）。文档说 Raptor 那张图审计一次要算几分钟。虚线只是一个画线选项（`lineSvg({dashed})`），不会自动判断哪些棱被挡住。它也有能内嵌到网页的运行时（`turnScript()`），还有 React 组件（`kit/react/`）。
- **three.js** 的 [SVGRenderer.js](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/renderers/SVGRenderer.js) 靠 Projector 加对象和面排序（`sortObjects`、`sortElements`）。另外仓库里有 `CSS2DRenderer.js`，可以做跟着三维点走的文字标注。
- **JSXGraph View3D** 在 [view3d.js](https://github.com/jsxgraph/jsxgraph/blob/main/src/3d/view3d.js) 里有 `projection: 'parallel' | 'central'` 和 `depthOrdered` 深度排序，原生输出 SVG。
- **PhET**：[mobius](https://github.com/phetsims/mobius) 是 PhET 的三维层，源码里有 `THREE.ts`、`ThreeIsometricNode.ts`，可见它基于 three.js（WebGL），二维部分则用自家的 [scenery](https://github.com/phetsims/scenery)。

## 1. 对比表（工程判断）

列 1–10 对应需求：1 投影和斜二测，2 线描画风加虚线隐藏线，3 互相包裹时的遮挡，4 正立的中文标注，5 输出 SVG，6 手机上流畅，7 输出确定，8 体积，9 对大模型友好，10 可商用。

| 候选 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Anatomy | 部分：只有正交轴测，斜二测要自己改投影 | 部分：风格是有明暗的工业插画，不是教材线稿；没有自动隐藏线 | 部分：画家排序要靠离线审计兜底，运行时拖动没有保证 | 部分：卡片和读数是 HTML，没有挂在三维锚点上的标注 | 满足：SVG | 未实测；3D 模式是 beta，文档写 380 个零件时约 20 fps | 部分：审计要跑几分钟，不适合现场生成 | 满足：零依赖 | 不满足：API 很底层，一张图要很长时间迭代 | 满足：MIT |
| three.js + SVGRenderer | 满足：自定义投影矩阵可以加剪切，做出精确斜二测 | 部分：EdgesGeometry 能画棱，但 SVGRenderer 不会把被挡住的棱画成虚线 | 部分：SVGRenderer 是按面排序，面互相穿插时会出错 | 满足：CSS2DRenderer | 部分：SVGRenderer 是附加功能，功能有限 | 满足（WebGL 时） | 部分：WebGL 在不同 GPU 上像素会有差异；SVG 版好一些 | 不满足：three 很重 | 部分：r3f 是声明式的，但三维概念多 | 满足：MIT |
| react-three-fiber | 同 three | 同 three | 同 three（WebGL 下用深度缓冲，遮挡正确） | 满足：drei 的 Html 或 Text 组件 | 不满足：基本是 WebGL | 满足 | 部分：GPU 差异 | 不满足 | 满足：JSX 声明式，跟 React 一致 | 满足：MIT |
| Zdog | 部分：只能正交加旋转，没有剪切 | 满足：扁平线描风很像 | 不满足：按形状中心排序，互相包裹时会出错 | 部分：没有内置文字，要自己叠 | 满足：SVG 或 Canvas | 满足：很轻 | 满足 | 满足：约 7 KB | 满足：API 简单 | 满足：MIT |
| JSXGraph View3D | 部分：有平行投影，斜二测要另外验证 | 部分：线描是它的强项；隐藏线虚线未查到 | 部分：按元素深度排序 | 满足：自带文字，支持数学下标 | 满足：原生 SVG | 未实测 | 满足：SVG | 不满足：约 259 KB | 部分：API 按元素构造，规则多 | 满足：可以选 MIT |
| GeoGebra 3D | 部分：有平行投影，斜二测未查到 | 不满足：画风是 GeoGebra 自己的，很难做成教材风 | 满足 | 满足 | 不满足：3D 视图不是 SVG | 未实测 | 未查到 | 不满足：要整个应用嵌进去 | 部分：靠命令语言 | 不满足：商用要另签协议 |
| MathBox | 部分 | 不满足：WebGL 风格 | 满足（深度缓冲） | 部分 | 不满足 | 满足 | 部分 | 不满足 | 不满足：基本停止维护 | 满足：MIT |
| ln 类隐藏线算法 | 满足：算法和投影无关 | 满足：本来就为输出线稿和隐藏线设计 | 满足：精确计算可见性 | 不满足：要自己做 | 满足：输出 SVG 路径 | 部分：原版做离线渲染，实时要简化 | 满足 | Go 原版不能直接用 | 不满足：是算法不是组件 | 满足：MIT |
| 方案 X：自研 | 满足：投影矩阵自己写，剪切加 45° 斜轴随便定 | 满足：可见棱实线、被挡棱虚线自己决定 | 部分：凸体好做，互相包裹要额外处理（切分或逐棱可见性测试） | 满足：投影到二维后用现有 SVG 文字 | 满足：直接接进现有运行时 | 满足：几十到上百个面，CPU 就够了 | 满足：纯数学，输出可复现 | 满足 | 满足：参数化预制组件只让模型填参数 | 满足 |

## 2. 逐个点评

**Anatomy**：最大的优点是同类里最讲究的 SVG 遮挡加几何审计思路，而且零依赖、MIT。致命的缺点是：投影写死成方位角加仰角的正交轴测，没有斜投影；画风是有明暗的工业插画；遮挡正确靠的是每张图离线审计好几分钟，这跟“大模型几秒出图、学生拖了就重算”根本相反。结论是不适合当运行时依赖，只适合借鉴思路，比如 `depthOf` 排序、把长物体切段再排序（`bandsOf`）、给每个零件记录几何形状用来自动检查。

**three.js / r3f**：最大的优点是投影矩阵完全可控，斜二测能做得精确；在 WebGL 下用深度缓冲，包裹遮挡天然正确；生态最大。致命的缺点是：想要线稿、虚线隐藏线、还要输出 SVG，三样同时满足很难，SVGRenderer 只做面排序，WebGL 的像素在不同 GPU 上不完全一样，体积也重。适合留作备选，万一以后要做写实或复杂曲面再用。

**Zdog**：画风最接近，又小又简单，对大模型很友好。致命的缺点是没有斜投影，按形状排序在线圈绕铁芯、螺旋线这类题上一定会出错，而且基本停更了。可以借鉴它的 API 设计。

**JSXGraph View3D**：原生 SVG、有平行投影、自带数学文字，可以选 MIT 许可，教育圈用得多。缺点是体积大（全量约 259 KB），三维功能比较新，隐藏线虚线和斜二测都要自己实测，还要再引入一套跟我们运行时平行的绘图体系。

**GeoGebra 3D**：功能最完整、遮挡正确。致命的是商用要另签协议，画风改不了，三维视图也不是 SVG。排除。

**MathBox**：基于 WebGL、停止维护、不出 SVG。排除。

**ln 类隐藏线算法**：它的思路是把每条棱按交点切成小段，每一段从摄像机发一条射线测可见性，可见画实线，被挡画虚线。这正好就是考卷画法。它是算法不是组件，但对自研最有参考价值。

## 3. 结论：推荐方案 X（自研轻量三维层），借鉴 ln 的隐藏线思路和 Anatomy 的排序与审计思路

理由：
1. 41 道立体题都是规则几何体，比如直导线、矩形导轨、霍尔片、线圈、螺旋线、圆锥，面数少，参数也固定，正适合做参数化预制组件。
2. 斜二测本质上就是一个带剪切的平行投影矩阵（进深轴斜 45°、长度乘 0.5）；正视、侧视、俯视则是普通的正交投影。在两个矩阵之间做插值，就能实现“平滑转到考卷视角”。转到正视时，垂直纸面的矢量判断成 ⊙ / ⊗ 就行。
3. 隐藏线用逐棱可见性测试：棱按投影交点切段，每段中点做射线和面的相交测试。这样输出的 SVG 自带虚线，像素确定，也能和现有的二维图混排、直接用 Playwright 截图对比。
4. 物理量还是由现有求解器算，三维层只管画，所以画面和数值天然一致。

主要风险：
- **包裹遮挡**：线圈绕铁芯、螺旋线前后两半要把曲线切成段再测可见性，这是工作量最大、最容易出错的地方。
- **斜二测到旋转视角的过渡**：斜投影不是旋转，插值的中间帧可能会显得别扭，要看实际效果来调。
- **正立的中文标注**：标注会和线条重叠，要做避让。
- 工作量估计：投影加相机过渡 2–3 天，逐棱隐藏线 4–6 天，大约 8 个预制组件每个 1–2 天，标注和测试 3–4 天，合计约 4–5 周（一人，未实测）。

## 4. 值得参考的开源项目

0. [LokiResearch/three-svg-renderer](https://github.com/LokiResearch/three-svg-renderer)（编码技术调查员补充）：可以借鉴它先建棱线可见性图、再分可见和隐藏两遍画虚线的做法。它是 GPL-3.0 许可、实验性质，最后提交在 2023-05，不能当依赖用。

1. [fogleman/ln](https://github.com/fogleman/ln)：借鉴逐段射线测可见性的隐藏线算法，以及把线稿输出成 SVG 路径的做法。
2. [Anatomy 的 kit.md](https://github.com/wheresryan22/anatomy/blob/HEAD/references/kit.md)：借鉴深度排序、长物体切段再排序、记录几何形状用来自动审计遮挡的思路，可以改造成我们的截图测试。
3. [three.js 的 SVGRenderer 和 Projector](https://github.com/mrdoob/three.js/tree/dev/examples/jsm/renderers)：借鉴投影、裁剪和 SVG 输出的工程实现。
4. [JSXGraph view3d.js](https://github.com/jsxgraph/jsxgraph/blob/main/src/3d/view3d.js)：借鉴平行投影的相机参数，以及在 SVG 里维护深度顺序的做法。
5. [Zdog](https://github.com/metafizzy/zdog)：借鉴简单、声明式的形状 API，方便大模型写对。

## 附：画风参考

- 出版社常用的工具，TikZ-3dplot 和 Asymptote 都能做平行投影加虚线隐藏线。具体哪家教材出版社用哪个工具，我没查到可靠来源，这里只当画风参考，未查到出处。
- PhET 的三维用 three.js（WebGL），二维用自家的 scenery 库，依据见上文 mobius 的源码。
