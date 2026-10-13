// Base URL of the lesson dev server for the screenshot and QA scripts.
// GENUI_URL wins. Otherwise reuse a server already answering on :5317, else start one on a free port.
// Call close() when done; it only stops a server this module started.
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT = 'http://localhost:5317'

async function answers(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(2000) })
    return r.ok
  } catch {
    return false
  }
}

export async function devServer(explicit) {
  const wanted = explicit ?? process.env.GENUI_URL
  if (wanted) return { base: wanted.replace(/\/+$/, ''), close: async () => {} }
  if (await answers(DEFAULT)) return { base: DEFAULT, close: async () => {} }
  const server = await createServer({
    configFile: resolve(appRoot, 'vite.config.ts'),
    root: appRoot,
    logLevel: 'warn',
    server: { port: 0, strictPort: false, host: '127.0.0.1' },
  })
  await server.listen()
  const addr = server.httpServer?.address()
  if (!addr || typeof addr === 'string') {
    await server.close()
    throw new Error('dev server has no TCP address')
  }
  console.error(`started dev server at http://127.0.0.1:${addr.port}`)
  return { base: `http://127.0.0.1:${addr.port}`, close: () => server.close() }
}
