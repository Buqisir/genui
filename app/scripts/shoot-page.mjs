// Full-page screenshot of a lesson, for comparing against the Paper design.
// Usage: node scripts/shoot-page.mjs <lessonId> [--width 1440] [--night] [--mark N] [--open-answer] [--wait ms] [--out shots]
import { mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { chromium } from 'playwright'
import { devServer } from './devserver.mjs'

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : fallback
}
const id = args[0]
if (!id || id.startsWith('--')) {
  console.error('usage: node scripts/shoot-page.mjs <lessonId> [--width 1440] [--night] [--mark N] [--open-answer]')
  process.exit(2)
}
const { base, close } = await devServer(opt('--base', undefined))
const width = Number(opt('--width', 1440))
const out = resolve(opt('--out', 'shots'))
const mark = opt('--mark', null)
const wait = Number(opt('--wait', 1500))
mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 })
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))

await page.goto(`${base}/#${encodeURIComponent(id)}`)
await page.waitForSelector('.lesson', { timeout: 10000 })
await page.waitForTimeout(wait)
if (args.includes('--night')) {
  const toggle = page.locator('button', { hasText: '夜光' })
  if (await toggle.count()) await toggle.first().click()
}
if (mark !== null) {
  const caps = page.locator('.tp-caption')
  await caps.nth(Number(mark)).click()
  await page.waitForTimeout(400)
}
if (args.includes('--open-answer')) {
  await page.locator('.answer-head').first().click()
  await page.waitForTimeout(200)
}
await page.waitForTimeout(300)
const suffix = [args.includes('--night') ? 'night' : '', mark !== null ? `m${mark}` : '', width !== 1440 ? `w${width}` : ''].filter(Boolean).join('-')
const file = join(out, `page-${id}${suffix ? '-' + suffix : ''}.png`)
const clip = opt('--clip', null)
if (clip) {
  const [x, y, w, h] = clip.split(',').map(Number)
  await page.screenshot({ path: file, clip: { x, y, width: w, height: h }, fullPage: true })
} else await page.screenshot({ path: file, fullPage: !args.includes('--viewport') })
const blockErrors = await page.$$eval('.block-error, .sim-error', (els) => els.map((e) => e.textContent.trim()))
await browser.close()
await close()
console.log(JSON.stringify({ file, errors, blockErrors }, null, 2))
