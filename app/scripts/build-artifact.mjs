// Builds one lesson as a single self-contained HTML page, for publishing as a claude.ai Artifact.
// Scripts, styles, KaTeX and the sandbox fonts are inlined; the page fonts come from Google Fonts.
// The output is page content only (no <html>/<head>/<body>): the Artifact host adds the skeleton.
// Usage: node scripts/build-artifact.mjs <lesson.md> [--out page.html]
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const outAt = args.indexOf('--out')
const out = outAt >= 0 ? resolve(args[outAt + 1]) : null
const file = args.find((a, i) => !a.startsWith('--') && i !== outAt + 1)
if (!file) {
  console.error('usage: node scripts/build-artifact.mjs <lesson.md> [--out page.html]')
  process.exit(2)
}
const lesson = resolve(file)
// The id App.tsx derives from this path (grok-<run>-<name>, gen-<name> or <name>) stays the same.
const rel = relative(join(appRoot, 'src'), lesson).split('\\').join('/')
const title = (/^title:\s*(.+)$/m.exec(readFileSync(lesson, 'utf8'))?.[1] ?? basename(lesson, '.md')).replace(/^['"]|['"]$/g, '')

const FONTS =
  'https://fonts.googleapis.com/css2?family=Inter:wght@300&family=JetBrains+Mono:wght@500;700&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@600;900&family=Source+Serif+4:ital,wght@1,400&display=swap'

function singleLesson() {
  return {
    name: 'genui-single-lesson',
    enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('/src/App.tsx')) {
        const glob = /const current = import\.meta\.glob\([\s\S]*?\}\) as/
        if (!glob.test(code)) throw new Error('App.tsx no longer matches the lesson glob this script replaces')
        return code.replace(glob, `const current = { ${JSON.stringify(rel)}: () => import(${JSON.stringify(rel + '?raw')}).then((m) => m.default) } as`)
      }
      // Page fonts load from Google Fonts instead of the bundled @fontsource files.
      if (id.endsWith('/src/main.tsx')) return code.replace(/^import '@fontsource\/[^']+'\n/gm, '')
    },
  }
}

const dist = mkdtempSync(join(tmpdir(), 'genui-artifact-'))
try {
  await build({
    configFile: join(appRoot, 'vite.config.ts'),
    root: appRoot,
    logLevel: 'warn',
    plugins: [singleLesson()],
    build: {
      outDir: dist,
      emptyOutDir: true,
      assetsInlineLimit: () => true,
      cssCodeSplit: false,
      modulePreload: false,
      rollupOptions: { output: { inlineDynamicImports: true } },
    },
  })
  const assets = join(dist, 'assets')
  const files = readdirSync(assets)
  const js = files.filter((f) => f.endsWith('.js'))
  const css = files.filter((f) => f.endsWith('.css'))
  if (js.length !== 1) throw new Error(`expected one script chunk, got ${js.join(', ')}`)
  const script = readFileSync(join(assets, js[0]), 'utf8').replace(/<\/script/gi, '<\\/script')
    // Libraries ship a literal U+FFFD; the Artifact publisher rejects it, and the escape means the same in JS.
    .replace(/\uFFFD/g, '\\uFFFD')
  const style = css.map((f) => readFileSync(join(assets, f), 'utf8')).join('\n').replace(/<\/style/gi, '<\\/style')
  const page = [
    `<title>${title.replace(/</g, '&lt;')}</title>`,
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    `<link rel="stylesheet" href="${FONTS}">`,
    `<style>${style}</style>`,
    '<div id="root"></div>',
    `<script type="module">${script}</script>`,
    '',
  ].join('\n')
  const target = out ?? join(process.cwd(), `${basename(lesson, '.md')}.html`)
  writeFileSync(target, page)
  console.log(`${target}  ${(Buffer.byteLength(page) / 1024 / 1024).toFixed(2)} MB`)
} finally {
  rmSync(dist, { recursive: true, force: true })
}
