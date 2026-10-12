import vm from 'node:vm'
import { describe, expect, it } from 'vitest'
import { buildRuntime } from './buildRuntime'
import { helixSample, solenoidPolarity } from './magnetics'
import { RUNTIME_GLOBALS } from './runtime-globals'

describe('built sandbox runtime', () => {
  it('still exposes every top-level name the classic scripts used to create', () => {
    const listeners: Record<string, ((e: unknown) => void)[]> = {}
    const canvas = {
      width: 0,
      height: 0,
      style: {},
      getContext: () => new Proxy({}, { get: () => () => undefined, set: () => true }),
    }
    const harness: Record<string, unknown> = {
      Math, JSON, Number, Array, Object, String, Boolean, Infinity, NaN, isFinite, isNaN, parseFloat, parseInt, Date,
      console: { log() {}, warn() {}, error() {} },
      document: { getElementById: () => canvas, documentElement: { clientWidth: 640, clientHeight: 280 } },
      parent: { postMessage() {} },
      devicePixelRatio: 2,
      Path2D: class {
        moveTo() {}
        lineTo() {}
        arc() {}
        ellipse() {}
        rect() {}
        closePath() {}
      },
      performance: { now: () => 0 },
      requestAnimationFrame: () => 0,
      cancelAnimationFrame: () => undefined,
      addEventListener: (type: string, fn: (e: unknown) => void) => {
        ;(listeners[type] ??= []).push(fn)
      },
      __listeners: listeners,
      __colors: {},
    }
    harness.window = harness
    harness.globalThis = harness
    const before = new Set(Object.getOwnPropertyNames(harness))
    vm.runInContext(buildRuntime(), vm.createContext(harness), { timeout: 20000 })
    const names = Object.getOwnPropertyNames(harness).filter((k) => !before.has(k))
    for (const name of RUNTIME_GLOBALS) expect(names, name).toContain(name)
    expect(typeof harness.sim).toBe('function')
    expect(typeof harness.waveField).toBe('function')
    expect(typeof harness.vesselLayout).toBe('function')
    const shared = harness.__genuiShared as {
      helixSample: typeof helixSample
      solenoidPolarity: typeof solenoidPolarity
    }
    expect(shared.helixSample(0.25, 4, -1, 0.4)).toEqual(helixSample(0.25, 4, -1, 0.4))
    expect(shared.solenoidPolarity(1, -2)).toEqual(solenoidPolarity(1, -2))
  })
})
