// Screenshots every scene block of the acceptance set and records console errors.
// Usage: node plans/audit/shoot.mjs [--night] id ...   → plans/audit/shots[-night]/<id>-<n>.png, errors in log
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '../../app/node_modules/playwright/index.mjs'

const args = process.argv.slice(2)
const night = args.includes('--night')
const ids = args.filter((a) => !a.startsWith('--'))
const out = join(dirname(fileURLToPath(import.meta.url)), night ? 'shots-night' : 'shots')
mkdirSync(out, { recursive: true })
const b = await chromium.launch()
for (const id of ids) {
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  const errors = []
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)))
  p.on('pageerror', (e) => errors.push(String(e).slice(0, 200)))
  try {
    await p.goto(`http://localhost:5317/#${id}`)
    await p.waitForSelector('.lesson', { timeout: 20000 })
    await p.waitForTimeout(1800)
    if (night) {
      await p.locator('button', { hasText: '夜光' }).first().click()
      await p.waitForTimeout(300)
    }
    // Move every sim to ~40% of its timeline so motion states are visible.
    for (const r of await p.locator('.transport input[type=range], input[aria-label="时间进度"]').all()) {
      await r
        .evaluate((el) => {
          const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
          set.call(el, Number(el.min) + (Number(el.max) - Number(el.min)) * 0.4)
          el.dispatchEvent(new Event('input', { bubbles: true }))
        })
        .catch(() => {})
    }
    await p.waitForTimeout(700)
    const figs = p.locator('figure.sim, figure.force-diagram, figure.circuit, figure.fd')
    const n = await figs.count()
    for (let i = 0; i < n; i++) {
      const f = figs.nth(i)
      await f.scrollIntoViewIfNeeded()
      await f.screenshot({ path: join(out, `${id}-${i}.png`) })
    }
    console.log(JSON.stringify({ id, figures: n, errors }))
  } catch (e) {
    console.log(JSON.stringify({ id, figures: -1, errors: [...errors, String(e).slice(0, 200)] }))
  }
  await p.close()
}
await b.close()
