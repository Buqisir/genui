// Headless render check: opens a lesson, screenshots every figure, reports render errors.
// Usage: node scripts/shoot.mjs <lessonId> [--base URL] [--out shots] [--marks] [--night]
import { mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { chromium } from 'playwright'
import { devServer } from './devserver.mjs'

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : fallback
}
const id = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--') && !['--marks', '--night'].includes(args[i - 1])))
if (!id) {
  console.error('usage: node scripts/shoot.mjs <lessonId> [--base URL] [--out DIR] [--marks] [--night]')
  process.exit(2)
}
const { base, close } = await devServer(opt('--base', undefined))
const out = resolve(opt('--out', 'shots'))
const withMarks = args.includes('--marks')
mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 2 })
const consoleErrors = []
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
page.on('pageerror', (e) => consoleErrors.push(String(e)))

await page.goto(`${base}/#${encodeURIComponent(id)}`)
await page.waitForSelector('.lesson', { timeout: 10000 })
const selected = await page.$eval('select', (s) => s.value)
if (selected !== id) {
  console.error(`课件 ${id} 不存在（当前显示 ${selected}）；新建的目录需要重启 dev server`)
  await browser.close()
  process.exit(2)
}
const night = args.includes('--night')
if (night) {
  const toggle = page.locator('button', { hasText: '夜光' })
  if (await toggle.count()) await toggle.first().click()
}
// Sims post 'ready' after their first frame; give them a moment.
await page.waitForTimeout(800)

const report = { id, shots: [], blockErrors: [], simErrors: [], consoleErrors }
report.blockErrors = await page.$$eval('.block-error', (els) => els.map((e) => e.textContent.trim()))

const figures = await page.$$('figure')
for (let i = 0; i < figures.length; i++) {
  const f = figures[i]
  const cls = (await f.getAttribute('class')) ?? ''
  const kind = cls.split(' ').filter((c) => c !== 'plot')[0] ?? 'plot'
  const file = join(out, `${id}-${i + 1}-${kind}${night ? '-night' : ''}.png`)
  await f.scrollIntoViewIfNeeded()
  await f.screenshot({ path: file })
  report.shots.push(file)
  if (kind === 'sim') {
    const err = await f.$eval('.sim-error', (e) => e.textContent).catch(() => null)
    if (err) report.simErrors.push(err.trim())
    if (withMarks) {
      const marks = await f.$$('.tp-caption')
      for (let k = 0; k < marks.length; k++) {
        await marks[k].click()
        await page.waitForTimeout(250)
        const mf = join(out, `${id}-${i + 1}-${kind}-mark${k + 1}.png`)
        await f.screenshot({ path: mf })
        report.shots.push(mf)
      }
    }
  }
}

await browser.close()
await close()
console.log(JSON.stringify(report, null, 2))
process.exit(report.blockErrors.length || report.simErrors.length || consoleErrors.length ? 1 : 0)
