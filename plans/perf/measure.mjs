// Renderer CPU (ms per second, all renderer processes) of a lesson page in three states.
// usage: node plans/perf/measure.mjs <lessonId> [...] > out.json
import { chromium } from '../../app/node_modules/playwright/index.mjs'

const base = 'http://localhost:5317'
const WINDOW = 5000
const browser = await chromium.launch()
const out = []

const bcdp = await browser.newBrowserCDPSession()
// Sandboxed srcdoc frames run in their own renderer processes, so page-level metrics miss them.
async function cost(page) {
  const get = async () => {
    const { processInfo } = await bcdp.send('SystemInfo.getProcessInfo')
    let r = 0
    for (const p of processInfo) if (p.type === 'renderer') r += p.cpuTime
    return r
  }
  const a = await get()
  await page.waitForTimeout(WINDOW)
  const b = await get()
  return Math.round(((b - a) * 1000) / (WINDOW / 1000))
}

for (const id of process.argv.slice(2)) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    await page.goto(`${base}/#${encodeURIComponent(id)}`)
  await page.waitForTimeout(4000)
  const frames = await page.locator('iframe').count()
  const top = await cost(page)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1500)
  const bottom = await cost(page)
  // The student pressed play on every animation, then scrolled away.
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(800)
  const buttons = page.locator('button.tp-play[aria-label="播放"]')
  const n = await buttons.count()
  for (let i = 0; i < n; i++) {
    const b = buttons.nth(0)
    if (!(await b.count())) break
    await b.scrollIntoViewIfNeeded()
    await b.click({ timeout: 2000 }).catch(() => {})
    await page.waitForTimeout(150)
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1500)
  const playedAway = await cost(page)
  out.push({ id, frames, top, bottom, playedAway })
  console.error(id, JSON.stringify(out.at(-1)))
  await page.close()
}
await browser.close()
console.log(JSON.stringify(out, null, 1))
