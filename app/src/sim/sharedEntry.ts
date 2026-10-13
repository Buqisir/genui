// Side-effect entry for the sandbox prelude. esbuild bundles this into an IIFE
// that runs before the runtime parts (runtime/*.js). Lessons keep the same global names as before.
import * as apparatus from './apparatus'
import * as craft from '../craft/canvas'
import * as magnetics from './magnetics'
import { lightColorCss } from '../lesson/lightcolor'
import { electrometerDegrees, springHook } from '../lesson/instrumentHook'
import { installVesselGlobals } from './vesselgeom.js'
import { installWaveGlobals } from './waves.js'

const shared = {
  ...magnetics,
  ...apparatus,
  springHook,
  electrometerDegrees,
  lightColorCss,
  // namespaced: names like wheel/sphere would clash with runtime locals
  craft,
}

const g = globalThis as typeof globalThis & { __genuiShared?: typeof shared }
g.__genuiShared = shared
installWaveGlobals(g)
installVesselGlobals(g)
