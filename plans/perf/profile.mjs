// Top self-time functions while a lesson plays in view. usage: node plans/perf/profile.mjs <lessonId>
import { chromium } from '../../app/node_modules/playwright/index.mjs'
const b = await chromium.launch({ args: ['--js-flags=--no-turbo-inlining --no-maglev-inlining'] })
const page = await b.newPage({ viewport: { width: 1440, height: 1000 } })
await page.goto('http://localhost:5317/#' + process.argv[2]); await page.waitForTimeout(4000)
const c = await page.context().newCDPSession(page)
await c.send('Profiler.enable'); await c.send('Profiler.setSamplingInterval', { interval: 200 }); await c.send('Profiler.start')
await page.waitForTimeout(4000)
const { profile } = await c.send('Profiler.stop')
const self = new Map(); const byId = new Map(profile.nodes.map((n) => [n.id, n]))
const dt = new Map()
profile.samples.forEach((s, i) => dt.set(s, (dt.get(s) || 0) + (profile.timeDeltas[i] || 0)))
let total = 0
for (const [id, us] of dt) {
  const f = byId.get(id).callFrame
  const key = `${f.functionName || '(anon)'} ${(f.url.split('/').pop() || '').slice(0, 30)}:${f.lineNumber + 1}`
  self.set(key, (self.get(key) || 0) + us); total += us
}
console.log('total ms', Math.round(total / 1000))
for (const [k, us] of [...self].sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(Math.round(us / 1000).toString().padStart(6), k)
await b.close()
