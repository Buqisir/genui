// Drives every lesson through load, play, presets, questions, slider extremes and
// night mode, and reports any error a block shows.
// Usage: node scripts/qa-all.mjs [id ...]
import { chromium } from 'playwright'
const base = 'http://localhost:5317'
const b = await chromium.launch()
const probe = await b.newPage()
await probe.goto(base); await probe.waitForTimeout(1000)
const all = await probe.$$eval('select option', (o) => o.map((x) => x.value))
await probe.close()
const ids = process.argv.slice(2).length ? process.argv.slice(2) : all
const report = {}
for (const id of ids) {
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } })
  const errs = new Set()
  p.on('pageerror', (e) => errs.add('pageerror: ' + e.message))
  const grab = async (tag) => {
    for (const t of await p.$$eval('.sim-error, .block-error', (els) => els.map((e) => e.textContent.trim()))) errs.add(`[${tag}] ${t}`)
  }
  await p.goto(`${base}/#${id}`); await p.waitForTimeout(1500); await grab('load')
  for (const btn of await p.locator('.tp-play').all()) { await btn.click().catch(() => {}) }
  await p.waitForTimeout(2500); await grab('play')
  const presets = p.locator('button.preset'); const np = await presets.count()
  for (let i = 0; i < np; i++) { await presets.nth(i).click().catch(() => {}); await p.waitForTimeout(700); await grab('preset ' + i) }
  const qs = p.locator('.questions li, .questions button'); const nq = await qs.count()
  for (let i = 0; i < nq; i++) { await qs.nth(i).click().catch(() => {}); await p.waitForTimeout(500); await grab('question ' + i) }
  const caps = p.locator('.tp-caption'); const nc = await caps.count()
  for (let i = 0; i < nc; i++) { await caps.nth(i).click().catch(() => {}); await p.waitForTimeout(300); await grab('caption ' + i) }
  const ranges = p.locator('input[type=range]'); const nr = await ranges.count()
  for (let i = 0; i < nr; i++) {
    for (const end of ['min', 'max', 'mid']) {
      await ranges.nth(i).evaluate((el, end) => {
        const v = end === 'mid' ? (Number(el.min) + Number(el.max)) / 2 : el[end]
        const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
        set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }))
      }, end).catch(() => {})
      await p.waitForTimeout(600); await grab(`range ${i} ${end}`)
    }
  }
  const night = p.locator('button', { hasText: '夜光' })
  if (await night.count()) { await night.first().click(); await p.waitForTimeout(800); await grab('night') }
  for (const btn of await p.locator('.tp-play').all()) { await btn.click().catch(() => {}) }
  await p.waitForTimeout(2000); await grab('night play')
  report[id] = [...errs]
  console.log(errs.size ? `✗ ${id}\n  ${[...errs].join('\n  ')}` : `✓ ${id}`)
  await p.close()
}
await b.close()
