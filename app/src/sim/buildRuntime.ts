// One in-memory build of the sandbox runtime: shared modules, then runtime.js.
// Node (tests, validate, simcheck) and the Vite virtual module both call this.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as esbuild from 'esbuild'

const here = dirname(fileURLToPath(import.meta.url))
const entry = join(here, 'sharedEntry.ts')
const runtimePath = join(here, 'runtime.js')

let watchFiles = [entry, runtimePath]

/** Files the dev server should reload the virtual module for. */
export function runtimeWatchFiles(): string[] {
  return watchFiles
}

export function buildRuntime(): string {
  const result = esbuild.buildSync({
    absWorkingDir: here,
    entryPoints: [entry],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'es2022',
    write: false,
    metafile: true,
    legalComments: 'none',
    logLevel: 'silent',
  })
  const inputs = Object.keys(result.metafile?.inputs ?? {})
  watchFiles = [...new Set([entry, runtimePath, ...inputs.map((f) => (f.startsWith('/') ? f : join(here, f)))])]
  const prelude = result.outputFiles[0]?.text ?? ''
  // esbuild's IIFE wrapper starts with a script-level "use strict". runtime.js is
  // concatenated after it and must stay sloppy: free names (waveField, …) resolve
  // as globals, matching the script the iframe used to load.
  const loose = prelude.replace(/^"use strict";\n/, '')
  return `${loose}\n${readFileSync(runtimePath, 'utf8')}`
}
