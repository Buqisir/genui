// One in-memory build of the sandbox runtime: shared modules, then the runtime parts.
// Node (tests, validate, simcheck) and the Vite virtual module both call this.
//
// The runtime runs inside <iframe sandbox="allow-scripts" srcdoc>, before the lesson's
// own code. The parent page owns the clock; the runtime turns (t, params) into a frame.
// Ambient effects (event pulses, current particles) keep their own wall-clock loop so
// they move even while the clock is paused.
//
// runtime/*.js are pieces of ONE closure, concatenated in RUNTIME_PARTS order and
// wrapped in a single IIFE. They are not modules: a part sees every top-level name of
// the others, and keeps the two-space indent of that closure. Later parts may use
// names from earlier ones at call time; state.js must stay first and render.js last.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as esbuild from 'esbuild'

const here = dirname(fileURLToPath(import.meta.url))
const entry = join(here, 'sharedEntry.ts')
const runtimeDir = join(here, 'runtime')

export const RUNTIME_PARTS = [
  'state.js',
  'text.js',
  'draw.js',
  'annotate.js',
  'efield.js',
  'regions.js',
  'bodies.js',
  'vessels.js',
  'parts.js',
  'optics.js',
  'track.js',
  'lab.js',
  'motion.js',
  'magnets.js',
  'render.js',
]
const partPaths = RUNTIME_PARTS.map((f) => join(runtimeDir, f))

let watchFiles = [entry, ...partPaths]

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
  watchFiles = [...new Set([entry, ...partPaths, ...inputs.map((f) => (f.startsWith('/') ? f : join(here, f)))])]
  const prelude = result.outputFiles[0]?.text ?? ''
  // esbuild's IIFE wrapper starts with a script-level "use strict". The runtime is
  // concatenated after it and must stay sloppy: free names (waveField, …) resolve
  // as globals, matching the script the iframe used to load.
  const loose = prelude.replace(/^"use strict";\n/, '')
  return `${loose}\n${runtimeSource()}`
}

/** The runtime closure alone, without the shared prelude. */
export function runtimeSource(): string {
  return `;(() => {\n${partPaths.map((p) => readFileSync(p, 'utf8')).join('\n')}})()\n`
}
