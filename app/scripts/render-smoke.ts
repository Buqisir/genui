// Smoke-test the headless renderer. Not a vitest: it needs a browser.
//   npx tsx scripts/render-smoke.ts [lesson.md] [outDir]
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { renderLesson } from '../src/agent/render'

const tiny = `---
title: 渲染冒烟
---

<Sim title="匀速小球" height={220} duration={4}>
sim({
  at(t) { return { x: t } },
  draw(ctx, s, v) {
    const m = v.view({ xmin: 0, xmax: 4, ymin: 0, ymax: 1 })
    v.ball(m, s.x, 0.5, 0.08, { label: 'A' })
  },
})
</Sim>
`

const file = process.argv[2]
const outDir = resolve(process.argv[3] || '/tmp/genui-render-smoke')
const source = file ? readFileSync(resolve(file), 'utf8') : tiny
const t0 = Date.now()
const result = await renderLesson(source, { outDir })
console.log(JSON.stringify({ ms: Date.now() - t0, ...result }, null, 2))
