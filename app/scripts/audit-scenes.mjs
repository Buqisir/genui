// Screenshots every scene block (sim, figure, force diagram, circuit) of every lesson.
// Usage: node scripts/audit-scenes.mjs [id ...]   → shots/audit/<id>-<n>.png
import { chromium } from 'playwright'
const base = 'http://localhost:5317'
const b = await chromium.launch()
const probe = await b.newPage()
await probe.goto(base); await probe.waitForTimeout(1000)
const all = await probe.$$eval('select option', (o) => o.map((x) => x.value))
await probe.close()
const ids = process.argv.slice(2).length ? process.argv.slice(2) : all
for (const id of ids) {
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  await p.goto(`${base}/#${id}`); await p.waitForTimeout(1800)
  // Move every sim to ~40% of its timeline so motion states are visible.
  for (const r of await p.locator('.transport input[type=range], input[aria-label="时间进度"]').all()) {
    await r.evaluate((el) => {
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
      set.call(el, Number(el.min) + (Number(el.max) - Number(el.min)) * 0.4); el.dispatchEvent(new Event('input', { bubbles: true }))
    }).catch(() => {})
  }
  await p.waitForTimeout(700)
  const figs = p.locator('figure.sim, figure.force-diagram, figure.circuit, figure.fd')
  const n = await figs.count()
  const out = []
  for (let i = 0; i < n; i++) {
    const f = figs.nth(i)
    await f.scrollIntoViewIfNeeded()
    await f.screenshot({ path: `shots/audit/${id}-${i}.png` })
    out.push(await f.evaluate((el) => el.className))
  }
  console.log(id, n, out.join(' | '))
  await p.close()
}
await b.close()
