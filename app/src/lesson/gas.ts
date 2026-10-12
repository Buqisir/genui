// Ideal-gas box: hard-sphere molecular dynamics in a 3D box. Speeds are kept in
// real m/s so the histogram and the Maxwell curve share one axis; positions live
// in box units (≈ px) and move at `scale` units per (m/s · s).

export const K_B = 1.380649e-23
export const AMU = 1.66053906660e-27

/** Molar masses in u for the gases that show up in textbook problems. */
export const GASES: Record<string, { mass: number; label: string }> = {
  H2: { mass: 2.016, label: 'H₂' },
  He: { mass: 4.003, label: 'He' },
  N2: { mass: 28.014, label: 'N₂' },
  O2: { mass: 31.998, label: 'O₂' },
  Ar: { mass: 39.948, label: 'Ar' },
  CO2: { mass: 44.01, label: 'CO₂' },
}

export interface Speeds {
  /** most probable speed √(2kT/m) */
  vp: number
  /** mean speed √(8kT/πm) */
  mean: number
  /** root-mean-square speed √(3kT/m) */
  rms: number
}

export function speeds(T: number, massU: number): Speeds {
  const kTm = (K_B * T) / (massU * AMU)
  return { vp: Math.sqrt(2 * kTm), mean: Math.sqrt((8 * kTm) / Math.PI), rms: Math.sqrt(3 * kTm) }
}

/** Maxwell speed distribution f(v), in 1/(m/s). */
export function maxwellPdf(v: number, T: number, massU: number): number {
  const a = (massU * AMU) / (2 * K_B * T)
  return 4 * Math.PI * (a / Math.PI) ** 1.5 * v * v * Math.exp(-a * v * v)
}

export type GasStart = 'maxwell' | 'same'

export interface GasOptions {
  count: number
  T: number
  massU: number
  start?: GasStart
  seed?: number
  box?: { L: number; H: number; D: number }
  radius?: number
  /** box units per (m/s · s) */
  scale?: number
}

export interface Gas {
  n: number
  massU: number
  box: { L: number; H: number; D: number }
  r: number
  scale: number
  x: Float64Array
  y: Float64Array
  z: Float64Array
  vx: Float64Array
  vy: Float64Array
  vz: Float64Array
  collisions: number
  time: number
  rand: () => number
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const gauss = (rand: () => number) => {
  const u = Math.max(rand(), 1e-12)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand())
}

export function createGas(o: GasOptions): Gas {
  const n = Math.max(2, Math.round(o.count))
  const box = o.box ?? { L: 400, H: 260, D: 220 }
  const r = o.radius ?? 6
  const rand = mulberry32(o.seed ?? 1)
  const g: Gas = {
    n,
    massU: o.massU,
    box,
    r,
    scale: o.scale ?? 0.24,
    x: new Float64Array(n),
    y: new Float64Array(n),
    z: new Float64Array(n),
    vx: new Float64Array(n),
    vy: new Float64Array(n),
    vz: new Float64Array(n),
    collisions: 0,
    time: 0,
    rand,
  }
  for (let i = 0; i < n; i++) {
    // Rejection sampling keeps starting spheres apart; give up after a few tries
    // in crowded boxes rather than loop forever (overlaps separate on their own).
    for (let k = 0; k < 30; k++) {
      g.x[i] = r + rand() * (box.L - 2 * r)
      g.y[i] = r + rand() * (box.H - 2 * r)
      g.z[i] = r + rand() * (box.D - 2 * r)
      let ok = true
      for (let j = 0; j < i && ok; j++) {
        const dx = g.x[i] - g.x[j]
        const dy = g.y[i] - g.y[j]
        const dz = g.z[i] - g.z[j]
        if (dx * dx + dy * dy + dz * dz < 4 * r * r) ok = false
      }
      if (ok) break
    }
  }
  const { rms } = speeds(o.T, o.massU)
  if (o.start === 'same') {
    // Every molecule at v_rms in a random direction: same total energy as the
    // equilibrium state, so collisions relax it into the Maxwell curve at T.
    for (let i = 0; i < n; i++) {
      const cz = 2 * rand() - 1
      const ph = 2 * Math.PI * rand()
      const s = Math.sqrt(1 - cz * cz)
      g.vx[i] = rms * s * Math.cos(ph)
      g.vy[i] = rms * s * Math.sin(ph)
      g.vz[i] = rms * cz
    }
  } else {
    for (let i = 0; i < n; i++) {
      g.vx[i] = gauss(rand)
      g.vy[i] = gauss(rand)
      g.vz[i] = gauss(rand)
    }
    let mx = 0
    let my = 0
    let mz = 0
    for (let i = 0; i < n; i++) {
      mx += g.vx[i]
      my += g.vy[i]
      mz += g.vz[i]
    }
    for (let i = 0; i < n; i++) {
      g.vx[i] -= mx / n
      g.vy[i] -= my / n
      g.vz[i] -= mz / n
    }
    setTemperature(g, o.T)
  }
  return g
}

/** Kinetic temperature from the current velocities: (3/2)NkT = Σ½mv². */
export function temperature(g: Gas): number {
  let s = 0
  for (let i = 0; i < g.n; i++) s += g.vx[i] ** 2 + g.vy[i] ** 2 + g.vz[i] ** 2
  return (g.massU * AMU * s) / (3 * g.n * K_B)
}

/** Rescale every velocity so the kinetic temperature becomes T (keeps the shape of the distribution). */
export function setTemperature(g: Gas, T: number) {
  const cur = temperature(g)
  if (!(cur > 0) || !(T > 0)) return
  const k = Math.sqrt(T / cur)
  for (let i = 0; i < g.n; i++) {
    g.vx[i] *= k
    g.vy[i] *= k
    g.vz[i] *= k
  }
}

export function speedOf(g: Gas, i: number): number {
  return Math.hypot(g.vx[i], g.vy[i], g.vz[i])
}

function maxSpeed(g: Gas): number {
  let m = 0
  for (let i = 0; i < g.n; i++) m = Math.max(m, g.vx[i] ** 2 + g.vy[i] ** 2 + g.vz[i] ** 2)
  return Math.sqrt(m)
}

/** Advance by dt seconds of animation time with walls and elastic sphere collisions. */
export function stepGas(g: Gas, dt: number, collide = true) {
  if (!(dt > 0)) return
  const vmax = maxSpeed(g) * g.scale
  // No sphere moves more than r/2 per substep, so fast pairs cannot tunnel.
  const sub = Math.max(1, Math.ceil((vmax * dt) / (g.r * 0.5)))
  const h = dt / sub
  for (let s = 0; s < sub; s++) {
    move(g, h)
    if (collide) collidePairs(g)
  }
  g.time += dt
}

function move(g: Gas, h: number) {
  const { L, H, D } = g.box
  const r = g.r
  const k = h * g.scale
  for (let i = 0; i < g.n; i++) {
    g.x[i] += g.vx[i] * k
    g.y[i] += g.vy[i] * k
    g.z[i] += g.vz[i] * k
    if (g.x[i] < r) {
      g.x[i] = 2 * r - g.x[i]
      g.vx[i] = Math.abs(g.vx[i])
    } else if (g.x[i] > L - r) {
      g.x[i] = 2 * (L - r) - g.x[i]
      g.vx[i] = -Math.abs(g.vx[i])
    }
    if (g.y[i] < r) {
      g.y[i] = 2 * r - g.y[i]
      g.vy[i] = Math.abs(g.vy[i])
    } else if (g.y[i] > H - r) {
      g.y[i] = 2 * (H - r) - g.y[i]
      g.vy[i] = -Math.abs(g.vy[i])
    }
    if (g.z[i] < r) {
      g.z[i] = 2 * r - g.z[i]
      g.vz[i] = Math.abs(g.vz[i])
    } else if (g.z[i] > D - r) {
      g.z[i] = 2 * (D - r) - g.z[i]
      g.vz[i] = -Math.abs(g.vz[i])
    }
  }
}

function collidePairs(g: Gas) {
  const cell = 2 * g.r
  const nx = Math.max(1, Math.floor(g.box.L / cell))
  const ny = Math.max(1, Math.floor(g.box.H / cell))
  const nz = Math.max(1, Math.floor(g.box.D / cell))
  const cx = (v: number, n: number, len: number) => Math.min(n - 1, Math.max(0, Math.floor((v / len) * n)))
  const head = new Int32Array(nx * ny * nz).fill(-1)
  const next = new Int32Array(g.n)
  const cellOf = new Int32Array(g.n)
  for (let i = 0; i < g.n; i++) {
    const c = (cx(g.z[i], nz, g.box.D) * ny + cx(g.y[i], ny, g.box.H)) * nx + cx(g.x[i], nx, g.box.L)
    cellOf[i] = c
    next[i] = head[c]
    head[c] = i
  }
  const d2min = 4 * g.r * g.r
  for (let i = 0; i < g.n; i++) {
    const c = cellOf[i]
    const ix = c % nx
    const iy = Math.floor(c / nx) % ny
    const iz = Math.floor(c / (nx * ny))
    for (let dz = -1; dz <= 1; dz++) {
      const kz = iz + dz
      if (kz < 0 || kz >= nz) continue
      for (let dy = -1; dy <= 1; dy++) {
        const ky = iy + dy
        if (ky < 0 || ky >= ny) continue
        for (let dx = -1; dx <= 1; dx++) {
          const kx = ix + dx
          if (kx < 0 || kx >= nx) continue
          for (let j = head[(kz * ny + ky) * nx + kx]; j >= 0; j = next[j]) {
            if (j <= i) continue
            const rx = g.x[j] - g.x[i]
            const ry = g.y[j] - g.y[i]
            const rz = g.z[j] - g.z[i]
            const d2 = rx * rx + ry * ry + rz * rz
            if (d2 >= d2min || d2 === 0) continue
            const ux = g.vx[j] - g.vx[i]
            const uy = g.vy[j] - g.vy[i]
            const uz = g.vz[j] - g.vz[i]
            const dot = ux * rx + uy * ry + uz * rz
            // Only approaching pairs bounce; separating overlaps are left to drift apart.
            if (dot >= 0) continue
            const p = dot / d2
            g.vx[i] += p * rx
            g.vy[i] += p * ry
            g.vz[i] += p * rz
            g.vx[j] -= p * rx
            g.vy[j] -= p * ry
            g.vz[j] -= p * rz
            g.collisions++
          }
        }
      }
    }
  }
}

/** Molecule counts per speed bin [k·w, (k+1)·w); speeds above vmax land in the last bin. */
export function histogram(g: Gas, bins: number, vmax: number): number[] {
  const out = new Array(bins).fill(0)
  const w = vmax / bins
  for (let i = 0; i < g.n; i++) out[Math.min(bins - 1, Math.floor(speedOf(g, i) / w))]++
  return out
}

export function stats(g: Gas): { mean: number; rms: number } {
  let s = 0
  let s2 = 0
  for (let i = 0; i < g.n; i++) {
    const v = speedOf(g, i)
    s += v
    s2 += v * v
  }
  return { mean: s / g.n, rms: Math.sqrt(s2 / g.n) }
}
