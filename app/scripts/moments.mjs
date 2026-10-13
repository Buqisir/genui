// Screenshots one scene of a lesson at several points of its timeline, light and night.
// Usage: node scripts/moments.mjs <lesson-id> [--scene 0] [--at 0.05,0.4,0.95] [--night 0.5]
//   → shots/moments/<id>-s<scene>-<pct>.png and a montage shots/moments/<id>-s<scene>.png
import { mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { chromium } from 'playwright'
import { devServer } from './devserver.mjs'

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(name)
  if (i < 0) return fallback
  const v = args[i + 1]
  args.splice(i, 2)
  return v
}
const scene = Number(opt('--scene', 0))
const at = opt('--at', '0.05,0.4,0.95').split(',').map(Number)
const nightAt = opt('--night', '0.5')
const preset = opt('--preset', '')
const [id] = args
mkdirSync('shots/moments', { recursive: true })

const { base, close } = await devServer()
const b = await chromium.launch()
const files = []
async function shoot(fracs, night) {
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  await p.goto(`${base}/#${id}`)
  await p.waitForTimeout(1500)
  if (preset) {
    await p.locator('button', { hasText: preset }).first().click()
    await p.waitForTimeout(400)
  }
  if (night) {
    await p.locator('button:has-text("夜光"), [aria-label*="夜光"], [title*="夜光"]').first().click().catch(() => {})
    await p.waitForTimeout(500)
  }
  const fig = p.locator('figure.sim, figure.force-diagram, figure.circuit, figure.fd').nth(scene)
  await fig.scrollIntoViewIfNeeded()
  const range = fig.locator('input[type=range]').first()
  for (const f of fracs) {
    if (await range.count()) {
      await range.evaluate((el, f) => {
        const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
        set.call(el, Number(el.min) + (Number(el.max) - Number(el.min)) * f)
        el.dispatchEvent(new Event('input', { bubbles: true }))
      }, f)
    }
    await p.waitForTimeout(500)
    const path = `shots/moments/${id}-s${scene}-${night ? 'n' : ''}${Math.round(f * 100)}.png`
    await fig.screenshot({ path })
    files.push(path)
  }
  await p.close()
}
await shoot(at, false)
if (nightAt !== 'none') await shoot([Number(nightAt)], true)
await b.close()
await close()
const out = `shots/moments/${id}-s${scene}${preset ? '-p' : ''}.png`
execFileSync('node', ['scripts/montage.mjs', out, ...files, '--cols', '2'], { stdio: 'inherit' })
