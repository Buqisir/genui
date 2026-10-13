import { chromium } from 'playwright'
import { devServer } from './devserver.mjs'
const { base, close } = await devServer()
const id = process.argv[2]
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } })
const errs = []
p.on('pageerror', (e) => errs.push('pageerror ' + e))
const grab = async (tag) => {
  const t = await p.$$eval('.sim-error, .block-error', (els) => els.map((e) => e.textContent.trim()))
  if (t.length) errs.push(tag + ': ' + t.join(' | '))
}
await p.goto(`${base}/#${id}`); await p.waitForTimeout(1500); await grab('load')
const sends = await p.evaluate(() => {
  const out = []
  document.querySelectorAll('iframe').forEach((f, i) => {
    const orig = f.contentWindow.postMessage.bind(f.contentWindow)
    f.contentWindow.postMessage = (m, o) => { if (m && m.params) window.__last = [i, m.params]; return orig(m, o) }
  })
  return document.querySelectorAll('iframe').length
})
await grab('after')
console.log(JSON.stringify({ id, frames: sends, errs }, null, 1))
await b.close()
await close()
