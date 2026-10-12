// Headless screenshots of one lesson, for a model that can look at pictures.
// Starts its own Vite server on a free port. Does not use 5317, 15173 or 5174,
// and does not write into lessons/.
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, type Browser, type Page } from 'playwright'
import { createServer, type ViteDevServer } from 'vite'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const RESERVED = new Set([5317, 15173, 5174])

export async function renderLesson(source: string, opts: { outDir: string }): Promise<{ files: string[]; consoleErrors: string[] }> {
  mkdirSync(opts.outDir, { recursive: true })
  const server = await createServer({
    configFile: resolve(appRoot, 'vite.config.ts'),
    root: appRoot,
    logLevel: 'warn',
    server: { port: 0, strictPort: false, host: '127.0.0.1' },
  })
  let browser: Browser | null = null
  try {
    await server.listen()
    const base = originOf(server)
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return
      const text = msg.text()
      if (/favicon/i.test(text)) return
      consoleErrors.push(text)
    })
    page.on('pageerror', (err) => consoleErrors.push(err.message))
    await page.addInitScript((src) => {
      window.__GENUI_PREVIEW__ = src
    }, source)
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForSelector('.lesson', { timeout: 20000 }).catch((err: Error) => {
      throw new Error(`页面没有渲染出课件（${err.message.split('\n')[0]}）${consoleErrors.length ? `；页面报错：${consoleErrors.join(' | ')}` : ''}`)
    })
    await page.waitForTimeout(1000)
    await seekSims(page)
    await page.waitForTimeout(500)

    const files: string[] = []
    const pageFile = resolve(opts.outDir, 'page.png')
    await page.screenshot({ path: pageFile, fullPage: true })
    files.push(pageFile)

    const figs = page.locator('figure.sim, figure.force-diagram, figure.circuit, figure.fd')
    const n = await figs.count()
    for (let i = 0; i < n; i++) {
      const fig = figs.nth(i)
      await fig.scrollIntoViewIfNeeded()
      const file = resolve(opts.outDir, `scene-${i}.png`)
      await fig.screenshot({ path: file })
      files.push(file)
    }
    return { files, consoleErrors }
  } finally {
    await browser?.close()
    await server.close()
  }
}

function originOf(server: ViteDevServer): string {
  const addr = server.httpServer?.address()
  if (!addr || typeof addr === 'string') throw new Error('预览服务器没有监听端口')
  if (RESERVED.has(addr.port)) throw new Error(`预览服务器占用了禁用端口 ${addr.port}`)
  return `http://127.0.0.1:${addr.port}/`
}

async function seekSims(page: Page) {
  for (const slider of await page.locator('.transport input[type=range], input[aria-label="时间进度"]').all()) {
    await slider
      .evaluate((el) => {
        const input = el as HTMLInputElement
        const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
        const next = Number(input.min) + (Number(input.max) - Number(input.min)) * 0.4
        set?.call(input, String(next))
        input.dispatchEvent(new Event('input', { bubbles: true }))
      })
      .catch(() => {})
  }
}
