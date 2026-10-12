// Screenshot cards of a mockup page: node mockups/shoot.mjs <page.html> <out-dir> <selector...>
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const require = createRequire(new URL('../app/package.json', import.meta.url))
const { chromium } = require('playwright')
const [page, outDir, ...selectors] = process.argv.slice(2)
mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch({ headless: true })
const p = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 })
await p.goto('file://' + resolve(page), { waitUntil: 'networkidle' })
await p.evaluate(() => document.fonts.ready)
for (const sel of selectors) {
  const file = resolve(outDir, sel.replace(/[^a-zA-Z0-9-]/g, '') + '.png')
  await p.locator(sel).screenshot({ path: file })
  console.log(file)
}
await browser.close()
