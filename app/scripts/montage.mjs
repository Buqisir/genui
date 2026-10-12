// Stacks screenshots into one image for quick review.
// Usage: node scripts/montage.mjs out.png a.png b.png ... [--cols 2] [--width 900]
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from 'playwright'

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(name)
  if (i < 0) return fallback
  const v = args[i + 1]
  args.splice(i, 2)
  return v
}
const cols = Number(opt('--cols', 1))
const width = Number(opt('--width', 900))
const [out, ...files] = args
const imgs = files
  .map((f) => `<figure><img src="data:image/png;base64,${readFileSync(resolve(f)).toString('base64')}"><figcaption>${f.split('/').pop()}</figcaption></figure>`)
  .join('')
const html = `<style>body{margin:0;background:#fff;font:11px sans-serif}main{display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;width:${width * cols}px}figure{margin:0}img{width:100%;display:block;border:1px solid #ddd}</style><main>${imgs}</main>`
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: width * cols, height: 400 } })
await p.setContent(html)
await p.locator('main').screenshot({ path: resolve(out) })
await b.close()
console.log(out)
