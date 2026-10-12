// Finite wave trains. Pure functions so lessons and tests share one definition.
// The sandbox runtime cannot import modules (it is inlined as a classic script);
// Sim and checkSim prepend this file with `export` stripped.

function waveNum(v, d) {
  return typeof v === 'number' && Number.isFinite(v) ? v : d
}

function waveDirs(dir) {
  if (dir === 'both') return [1, -1]
  if (dir === -1) return [-1]
  return [1]
}

// pulse / half are one half-wave (width λ/2). A sine train runs until `cycles`
// wavelengths have been emitted; omit cycles and the source keeps oscillating.
function waveWindow(src, lambda) {
  const shape = src.shape || 'sine'
  if (shape === 'pulse' || shape === 'half') return lambda / 2
  if (src.cycles == null) return Infinity
  const c = waveNum(src.cycles, NaN)
  return Number.isFinite(c) ? c * lambda : Infinity
}

/**
 * One directed ray, not yet clipped by a wall.
 * dirSign +1 travels toward +x. The profile is zero ahead of the front
 * x0 + dirSign·v·(t − start) and, once `cycles` (or a pulse) has been emitted, behind the tail.
 * y = A sin(k·behind + phase); phase 0 leaves the front on the axis.
 * pulse and half share that half-sine. phase 0 makes them the same bump;
 * phase π turns the bump over. cycles is ignored for those two shapes.
 */
export function rayY(src, dirSign, x, t) {
  const x0 = waveNum(src.x, 0)
  const v = Math.abs(waveNum(src.v, 0))
  const lambda = waveNum(src.lambda, 0)
  const amp = waveNum(src.amp, 1)
  const phase = waveNum(src.phase, 0)
  const start = waveNum(src.start, 0)
  if (!(v > 0) || !(lambda > 0)) return 0
  const tau = t - start
  if (!(tau > 0)) return 0
  const s = dirSign * (x - x0)
  const traveled = v * tau
  const eps = 1e-9
  if (s < -eps || s > traveled + eps) return 0
  const behind = traveled - s
  if (behind > waveWindow(src, lambda) + eps) return 0
  return amp * Math.sin(((2 * Math.PI) / lambda) * behind + phase)
}

function waveMedium(x, origin, wall) {
  if (!wall || !Number.isFinite(wall.x)) return true
  const eps = 1e-9
  if (origin < wall.x - eps) return x <= wall.x + eps
  if (origin > wall.x + eps) return x >= wall.x - eps
  return true
}

// One image source. The reflected train is not reflected again.
function waveImages(src, wall) {
  if (!wall || !Number.isFinite(wall.x)) return []
  const x0 = waveNum(src.x, 0)
  const sign = wall.kind === 'free' ? 1 : -1
  const eps = 1e-9
  const out = []
  for (const d of waveDirs(src.dir)) {
    if (d > 0 && !(wall.x > x0 + eps)) continue
    if (d < 0 && !(wall.x < x0 - eps)) continue
    out.push({
      src: { ...src, x: 2 * wall.x - x0, dir: -d, amp: waveNum(src.amp, 1) * sign },
      dir: -d,
    })
  }
  return out
}

export function sourceY(src, x, t, wall) {
  const origin = waveNum(src.x, 0)
  if (!waveMedium(x, origin, wall)) return 0
  let y = 0
  for (const d of waveDirs(src.dir)) y += rayY(src, d, x, t)
  for (const im of waveImages(src, wall)) y += rayY(im.src, im.dir, x, t)
  return y
}

/** Superposition at time t. yi(i, x) is source i plus its own single reflection. */
export function waveField(sources, t, opts) {
  const list = Array.isArray(sources) ? sources : []
  const wall = opts && opts.wall
  const time = waveNum(t, 0)
  const yi = (i, x) => (list[i] ? sourceY(list[i], x, time, wall) : 0)
  const y = (x) => {
    let s = 0
    for (let i = 0; i < list.length; i++) s += yi(i, x)
    return s
  }
  return { y, yi }
}

/** Front of a one-way train, or null if it has not started. dirSign defaults to the source dir. */
export function waveFront(src, t, dirSign) {
  const v = Math.abs(waveNum(src.v, 0))
  const tau = waveNum(t, 0) - waveNum(src.start, 0)
  if (!(v > 0) || !(tau > 0)) return null
  const d = dirSign == null ? (src.dir === -1 ? -1 : 1) : dirSign
  return waveNum(src.x, 0) + d * v * tau
}

export function installWaveGlobals(g) {
  Object.assign(g, {
    waveNum,
    waveDirs,
    waveWindow,
    rayY,
    waveMedium,
    waveImages,
    sourceY,
    waveField,
    waveFront,
  })
}
