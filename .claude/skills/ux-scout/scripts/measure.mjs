// 量一个页面在某一刻的界面数据：元素位置、视线路程、字号、对比度、点按目标、版面跳动。
// 用法：
//   node measure.mjs --url <地址> [--vp 1280x800] [--theme light|dark]
//        --sel 题目=".log .item.say.cur" --sel 选项=".opts" --sel 画面="#scene"
//        [--ls 键=值]... [--click "#btn-go"]... [--track "#scene"]... [--wait 1500] [--shot 截图.png] [--out 结果.json]
// --sel 的顺序就是学生视线的顺序，"视线路程"按这个顺序把相邻两块的最近边距加起来。
// --click 按给的顺序依次点击（每次后等 --click-wait 毫秒，默认 600），期间记录版面跳动（layout shift）。
//   页面在点击后有平滑滚动之类的过渡时，把 --click-wait 调大，等它停稳再量。
// 注意：浏览器的版面跳动指标不算点击后 0.5 秒内的移动，所以"点了按钮画面挪位"要用 --track：
// 记下该元素在点击前和每次点击后的位置尺寸，报告最大的位移和尺寸变化。
import { createRequire } from 'node:module'
import { existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../../../..')
const require = createRequire(path.join(root, 'app/package.json'))
const { chromium } = require('playwright')

const argv = process.argv.slice(2)
const opt = { sel: [], click: [], ls: [], track: [], vp: '1280x800', theme: 'light', wait: 1500, 'click-wait': 600 }
for (let i = 0; i < argv.length; i++) {
  const k = argv[i].replace(/^--/, ''), v = argv[++i]
  if (k === 'sel') { const j = v.indexOf('='); opt.sel.push([v.slice(0, j), v.slice(j + 1)]) }
  else if (k === 'click') opt.click.push(v)
  else if (k === 'track') opt.track.push(v)
  else if (k === 'ls') { const j = v.indexOf('='); opt.ls.push([v.slice(0, j), v.slice(j + 1)]) }
  else opt[k] = v
}
if (!opt.url) { console.error('缺 --url'); process.exit(1) }
const [w, h] = opt.vp.split('x').map(Number)

const exe = ['/opt/pw-browsers/chromium'].find(p => existsSync(p))
const browser = await chromium.launch(exe ? { executablePath: exe } : {})
const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w <= 760 })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push(String(e)))
await page.emulateMedia({ colorScheme: opt.theme })
await page.addInitScript(ls => {
  try { for (const [k, v] of ls) localStorage.setItem(k, v) } catch (e) { /* 存储不可用 */ }
  window.__cls = 0
  try {
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value })
      .observe({ type: 'layout-shift', buffered: true })
  } catch (e) { /* 浏览器不支持时为 0 */ }
}, opt.ls)
await page.goto(opt.url, { waitUntil: 'networkidle' })
await page.waitForTimeout(Number(opt.wait))
const clsBefore = await page.evaluate(() => window.__cls)
async function rects() {
  return page.evaluate(sels => sels.map(css => {
    const el = document.querySelector(css)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return r.width > 0 ? { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) } : null
  }), opt.track)
}
const tracks = [await rects()]
for (const c of opt.click) { await page.locator(c).first().click(); await page.waitForTimeout(Number(opt['click-wait'])); tracks.push(await rects()) }

const data = await page.evaluate(({ sels, W, H }) => {
  function rgb(s) { const m = s.match(/[\d.]+/g); return m ? m.map(Number) : [0, 0, 0, 0] }
  function lum([r, g, b]) {
    const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }
  function bgOf(el) {
    for (let n = el; n; n = n.parentElement) {
      const c = rgb(getComputedStyle(n).backgroundColor)
      if (c.length < 4 || c[3] > 0.5) return c
    }
    return [255, 255, 255]
  }
  function contrast(el) {
    const a = lum(rgb(getComputedStyle(el).color)), b = lum(bgOf(el))
    return +((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2)
  }
  function visible(el) {
    const r = el.getBoundingClientRect(), s = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0
  }
  function textNodeOwner(el) {
    // 取元素里第一个有字的后代，用它的字号和颜色
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    for (let t = tw.nextNode(); t; t = tw.nextNode()) if (t.textContent.trim()) return t.parentElement
    return el
  }
  const blocks = sels.map(([name, css]) => {
    const el = Array.from(document.querySelectorAll(css)).find(visible)
    if (!el) return { name, css, found: false }
    const r = el.getBoundingClientRect(), t = textNodeOwner(el), s = getComputedStyle(t)
    return {
      name, css, found: true,
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      belowFold: r.top >= H, partlyBelowFold: r.bottom > H,
      fontSize: parseFloat(s.fontSize), color: s.color, contrast: contrast(t)
    }
  })
  function gap(a, b) {
    const dx = Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w))
    const dy = Math.max(0, Math.max(a.y, b.y) - Math.min(a.y + a.h, b.y + b.h))
    return Math.round(Math.hypot(dx, dy))
  }
  const path = []
  let total = 0
  for (let i = 1; i < blocks.length; i++) {
    const a = blocks[i - 1], b = blocks[i]
    if (!a.found || !b.found) { path.push({ from: a.name, to: b.name, gap: null }); continue }
    const g = gap(a.rect, b.rect); total += g
    path.push({ from: a.name, to: b.name, gap: g })
  }
  const inView = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < H && r.right > 0 && r.left < W }
  const all = Array.from(document.querySelectorAll('body *')).filter(el => visible(el) && inView(el))
  const inter = all.filter(el => el.matches('button:not(:disabled), a[href], input, select, textarea, [role=button], [tabindex]:not([tabindex="-1"])'))
  // 手机上点按目标至少 44×44（Apple HIG）；电脑上至少 24×24（WCAG 2.2 AA，2.5.8）
  const minT = W <= 760 ? 44 : 24
  const small = inter.filter(el => { const r = el.getBoundingClientRect(); return r.width < minT || r.height < minT })
    .map(el => ({ text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 20), w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) }))
  const texty = all.filter(el => Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim()))
  const sizes = {}, colors = {}
  let chars = 0
  const lowContrast = []
  for (const el of texty) {
    const s = getComputedStyle(el), own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join('').replace(/\s+/g, '')
    chars += own.length
    sizes[s.fontSize] = (sizes[s.fontSize] || 0) + own.length
    colors[s.color] = (colors[s.color] || 0) + own.length
    const c = contrast(el), big = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && +s.fontWeight >= 700)
    if (c < (big ? 3 : 4.5)) lowContrast.push({ text: own.slice(0, 16), contrast: c, fontSize: s.fontSize })
  }
  return {
    blocks, eyePath: { steps: path, total },
    interactive: { count: inter.length, minTarget: minT, tooSmall: small },
    text: { charsInView: chars, fontSizes: sizes, textColors: colors, lowContrast: lowContrast.slice(0, 20), lowContrastCount: lowContrast.length },
    scrollHeight: document.documentElement.scrollHeight
  }
}, { sels: opt.sel, W: w, H: h })

data.track = opt.track.map((css, i) => {
  const seq = tracks.map(t => t[i])
  const base = seq.find(Boolean)
  let move = 0, resize = 0, appear = 0
  for (const r of seq) {
    if (!r || !base) { appear++; continue }
    move = Math.max(move, Math.hypot(r.x - base.x, r.y - base.y))
    resize = Math.max(resize, Math.abs(r.w - base.w), Math.abs(r.h - base.h))
  }
  return { css, seq, maxMove: Math.round(move), maxResize: Math.round(resize), missingStates: appear }
})
data.layoutShift = { onLoad: +clsBefore.toFixed(4), afterClicks: +(await page.evaluate(() => window.__cls) - clsBefore).toFixed(4) }
data.viewport = { w, h, theme: opt.theme }
data.url = opt.url
data.errors = errors
if (opt.shot) await page.screenshot({ path: opt.shot })
const out = JSON.stringify(data, null, 2)
if (opt.out) writeFileSync(opt.out, out)
console.log(out)
await browser.close()
