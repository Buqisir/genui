// Sandbox runtime, part: electric field: point charges, conductor boundary-element solve, lines and equipotentials.
  /**
   * Electrostatic field of point charges (and charged segments, split into points):
   * traced field lines with arrows, dashed equipotentials, and the charges themselves.
   * charges: [{x, y, q}] or [{x1, y1, x2, y2, q}] for a charged plate/rod (q is the total).
   * Units are arbitrary (k = 1), only ratios matter. Returns {E(x, y), phi(x, y)}.
   * With `conductors`, the picture is a 2-D cross-section (see efieldConductors).
   */
  const efieldCache = new Map()

  // --- conductors: 2-D boundary-element solve (infinite line charges / cylinders) ---
  // Kernel φ = −q ln r, E = q r̂ / r, softened with the same r² + soft as the 3-D path.

  function efieldLinSolve(A, b) {
    const n = b.length
    for (let k = 0; k < n; k++) {
      let piv = k
      let max = Math.abs(A[k * n + k])
      for (let i = k + 1; i < n; i++) {
        const v = Math.abs(A[i * n + k])
        if (v > max) {
          max = v
          piv = i
        }
      }
      if (piv !== k) {
        for (let j = k; j < n; j++) {
          const t = A[k * n + j]
          A[k * n + j] = A[piv * n + j]
          A[piv * n + j] = t
        }
        const tb = b[k]
        b[k] = b[piv]
        b[piv] = tb
      }
      const diag = A[k * n + k]
      if (!(Math.abs(diag) > 1e-14)) {
        b[k] = 0
        continue
      }
      for (let i = k + 1; i < n; i++) {
        const f = A[i * n + k] / diag
        for (let j = k + 1; j < n; j++) A[i * n + j] -= f * A[k * n + j]
        b[i] -= f * b[k]
      }
    }
    for (let i = n - 1; i >= 0; i--) {
      let s = b[i]
      for (let j = i + 1; j < n; j++) s -= A[i * n + j] * b[j]
      const diag = A[i * n + i]
      b[i] = Math.abs(diag) > 1e-14 ? s / diag : 0
    }
    return b
  }

  function efieldSegPhi(x, y, ax, ay, bx, by, Q, soft) {
    const dx = bx - ax
    const dy = by - ay
    const L = Math.hypot(dx, dy) || 1e-15
    const tx = dx / L
    const ty = dy / L
    const vx = x - ax
    const vy = y - ay
    const u = vx * tx + vy * ty
    const d = vx * -ty + vy * tx
    const dEff = Math.sqrt(d * d + soft)
    const w1 = -u
    const w2 = L - u
    const r2a = w1 * w1 + dEff * dEff
    const r2b = w2 * w2 + dEff * dEff
    const Ia = r2a < 1e-30 ? 0 : w1 * Math.log(Math.sqrt(r2a)) - w1 + (dEff > 0 ? dEff * Math.atan(w1 / dEff) : 0)
    const Ib = r2b < 1e-30 ? 0 : w2 * Math.log(Math.sqrt(r2b)) - w2 + (dEff > 0 ? dEff * Math.atan(w2 / dEff) : 0)
    return -(Q / L) * (Ib - Ia)
  }

  function efieldSegE(x, y, ax, ay, bx, by, Q, soft) {
    const dx = bx - ax
    const dy = by - ay
    const L = Math.hypot(dx, dy) || 1e-15
    const tx = dx / L
    const ty = dy / L
    const nx = -ty
    const ny = tx
    const vx = x - ax
    const vy = y - ay
    const u = vx * tx + vy * ty
    const d = vx * nx + vy * ny
    const dEff = Math.sqrt(d * d + soft)
    const lam = Q / L
    const w1 = -u
    const w2 = L - u
    if (dEff < 1e-14) {
      const r1 = Math.abs(w1)
      const r2 = Math.abs(w2)
      const Et = r1 > 1e-15 && r2 > 1e-15 ? lam * Math.log(r1 / r2) : 0
      return [Et * tx, Et * ty]
    }
    const Et = lam * Math.log(Math.hypot(w1, dEff) / Math.hypot(w2, dEff))
    const En = lam * (d / dEff) * (Math.atan(w2 / dEff) - Math.atan(w1 / dEff))
    return [Et * tx + En * nx, Et * ty + En * ny]
  }

  function efieldPointPhi(x, y, px, py, q, soft) {
    return -0.5 * q * Math.log((x - px) ** 2 + (y - py) ** 2 + soft)
  }

  function efieldPointE(x, y, px, py, q, soft) {
    const dx = x - px
    const dy = y - py
    const r2 = dx * dx + dy * dy + soft
    return [(q * dx) / r2, (q * dy) / r2]
  }

  function efieldPip(x, y, pts) {
    let inside = false
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const yi = pts[i][1]
      const yj = pts[j][1]
      if ((yi > y) !== (yj > y) && x < ((pts[j][0] - pts[i][0]) * (y - yi)) / (yj - yi) + pts[i][0]) inside = !inside
    }
    return inside
  }

  function efieldEdgeDist(x, y, pts) {
    let d = Infinity
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]
      const b = pts[(i + 1) % pts.length]
      const dx = b[0] - a[0]
      const dy = b[1] - a[1]
      const L2 = dx * dx + dy * dy || 1e-30
      let t = ((x - a[0]) * dx + (y - a[1]) * dy) / L2
      if (t < 0) t = 0
      else if (t > 1) t = 1
      const px = a[0] + t * dx - x
      const py = a[1] + t * dy - y
      const dd = px * px + py * py
      if (dd < d) d = dd
    }
    return Math.sqrt(d)
  }

  function efieldInside(shapes, x, y) {
    for (const s of shapes) {
      if (!s.closed) continue
      if (s.kind === 'circle') {
        if ((x - s.cx) ** 2 + (y - s.cy) ** 2 < s.r * s.r - 1e-10) return s
      } else if (s.points && efieldPip(x, y, s.points) && efieldEdgeDist(x, y, s.points) > 1e-7) return s
    }
    return null
  }

  function efieldCross(panels, x0, y0, x1, y1, start = 0, end = panels.length) {
    const rx = x1 - x0
    const ry = y1 - y0
    for (let k = start; k < end; k++) {
      const p = panels[k]
      const sx = p.bx - p.ax
      const sy = p.by - p.ay
      const den = rx * sy - ry * sx
      if (Math.abs(den) < 1e-18) continue
      const qpx = p.ax - x0
      const qpy = p.ay - y0
      const t = (qpx * sy - qpy * sx) / den
      const u = (qpx * ry - qpy * rx) / den
      if (t > 1e-4 && t <= 1 && u >= -1e-9 && u <= 1 + 1e-9) return p
    }
    return null
  }

  // A line that skims a thin plate can step along it for a long time without a clean crossing.
  function efieldNearOpen(panels, x, y, dist, start = 0, end = panels.length) {
    const d2 = dist * dist
    for (let k = start; k < end; k++) {
      const p = panels[k]
      if (p.closed) continue
      const dx = p.bx - p.ax
      const dy = p.by - p.ay
      const L2 = dx * dx + dy * dy || 1e-30
      let t = ((x - p.ax) * dx + (y - p.ay) * dy) / L2
      if (t < 0) t = 0
      else if (t > 1) t = 1
      const px = p.ax + t * dx - x
      const py = p.ay + t * dy - y
      if (px * px + py * py <= d2) return p
    }
    return null
  }

  function efieldCluster(t, sharp) {
    // Cosine grading shortens panels at corners and plate tips. Thin plates use a
    // gentler grade: a very short end panel makes the edge singularity oscillate.
    const c = 0.5 * (1 - Math.cos(Math.PI * t))
    const a = sharp ? 0.15 : 0.62
    return a * t + (1 - a) * c
  }

  function efieldConductorShapes(list) {
    const shapes = []
    for (let ci = 0; ci < list.length; ci++) {
      const c = list[ci]
      if (!c || typeof c !== 'object') continue
      const fixed = c.V !== undefined && c.V !== null && Number.isFinite(+c.V)
      const base = {
        ci,
        fixed,
        V: fixed ? +c.V : 0,
        q: Number.isFinite(+c.q) ? +c.q : 0,
        label: c.label,
        fill: c.fill !== false,
      }
      if (Array.isArray(c.line) && c.line.length >= 4 && c.line.slice(0, 4).every(Number.isFinite)) {
        const [x1, y1, x2, y2] = c.line
        if (Math.hypot(x2 - x1, y2 - y1) > 1e-9) shapes.push({ ...base, kind: 'line', x1: +x1, y1: +y1, x2: +x2, y2: +y2, closed: false, normalSign: 1 })
        continue
      }
      if (Number.isFinite(+c.cx) && Number.isFinite(+c.cy) && Number.isFinite(+c.r) && +c.r > 0) {
        shapes.push({ ...base, kind: 'circle', cx: +c.cx, cy: +c.cy, r: +c.r, closed: true, normalSign: 1 })
        continue
      }
      if (Array.isArray(c.points)) {
        const pts = []
        for (const p of c.points) {
          if (Array.isArray(p) && p.length >= 2 && Number.isFinite(+p[0]) && Number.isFinite(+p[1])) pts.push([+p[0], +p[1]])
        }
        if (pts.length >= 2) {
          const a = pts[0]
          const b = pts[pts.length - 1]
          if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-12) pts.pop()
        }
        if (c.open && pts.length >= 2) shapes.push({ ...base, kind: 'poly', points: pts, closed: false, normalSign: 1 })
        else if (!c.open && pts.length >= 3) {
          let area = 0
          for (let i = 0; i < pts.length; i++) {
            const p = pts[i]
            const q = pts[(i + 1) % pts.length]
            area += p[0] * q[1] - q[0] * p[1]
          }
          shapes.push({ ...base, kind: 'poly', points: pts, closed: true, normalSign: area >= 0 ? 1 : -1 })
        }
      }
    }
    return shapes
  }

  function efieldPushPanels(panels, ax, ay, bx, by, shape, h, refine) {
    const dx = bx - ax
    const dy = by - ay
    const L = Math.hypot(dx, dy)
    if (!(L > 1e-12)) return
    const n = Math.max(refine ? 2 : 1, Math.round(L / h))
    let nx = dy / L
    let ny = -dx / L
    if (shape.normalSign < 0) {
      nx = -nx
      ny = -ny
    }
    for (let i = 0; i < n; i++) {
      const t0 = refine ? efieldCluster(i / n, shape.closed) : i / n
      const t1 = refine ? efieldCluster((i + 1) / n, shape.closed) : (i + 1) / n
      const x0 = ax + dx * t0
      const y0 = ay + dy * t0
      const x1 = ax + dx * t1
      const y1 = ay + dy * t1
      const Lp = Math.hypot(x1 - x0, y1 - y0)
      if (!(Lp > 1e-14)) continue
      panels.push({
        ax: x0, ay: y0, bx: x1, by: y1,
        mx: (x0 + x1) / 2, my: (y0 + y1) / 2, L: Lp,
        tx: (x1 - x0) / Lp, ty: (y1 - y0) / Lp,
        nx, ny, ci: shape.ci, closed: shape.closed,
      })
    }
  }

  function efieldBuildPanels(shapes, h) {
    const panels = []
    const hh = Math.max(h, 1e-6)
    for (const s of shapes) {
      if (s.kind === 'circle') {
        const n = Math.max(12, Math.round((2 * Math.PI * s.r) / hh))
        for (let i = 0; i < n; i++) {
          const a0 = (2 * Math.PI * i) / n
          const a1 = (2 * Math.PI * (i + 1)) / n
          efieldPushPanels(panels, s.cx + s.r * Math.cos(a0), s.cy + s.r * Math.sin(a0), s.cx + s.r * Math.cos(a1), s.cy + s.r * Math.sin(a1), s, hh, false)
        }
      } else if (s.kind === 'line') {
        efieldPushPanels(panels, s.x1, s.y1, s.x2, s.y2, s, hh, true)
      } else {
        const pts = s.points
        const nEdge = s.closed ? pts.length : pts.length - 1
        for (let i = 0; i < nEdge; i++) {
          const a = pts[i]
          const b = pts[(i + 1) % pts.length]
          efieldPushPanels(panels, a[0], a[1], b[0], b[1], s, hh, true)
        }
      }
    }
    return panels
  }

  function efieldPanelCountCap(shapes, h) {
    let panels = efieldBuildPanels(shapes, h)
    if (panels.length > 400) panels = efieldBuildPanels(shapes, h * (panels.length / 400))
    if (panels.length > 420) panels = efieldBuildPanels(shapes, h * (panels.length / 400))
    return panels
  }

  /** Unknown panel charges, plus one potential per isolated conductor. Dense GE, partial pivoting. */
  function efieldSolvePanels(panels, shapes, phiFree, soft) {
    const n = panels.length
    const iso = shapes.filter((s) => !s.fixed)
    const N = n + iso.length
    const potentials = new Array(shapes.reduce((m, s) => Math.max(m, s.ci + 1), 0))
    for (const s of shapes) if (s.fixed) potentials[s.ci] = s.V
    if (!n) return potentials
    const vcol = new Map(iso.map((s, k) => [s.ci, n + k]))
    const A = new Float64Array(N * N)
    const b = new Float64Array(N)
    for (let i = 0; i < n; i++) {
      const p = panels[i]
      const px = p.mx
      const py = p.my
      for (let j = 0; j < n; j++) {
        const s = panels[j]
        const vx = px - s.ax
        const vy = py - s.ay
        const u = vx * s.tx + vy * s.ty
        const d = vy * s.tx - vx * s.ty
        const dEff = Math.sqrt(d * d + soft)
        const w1 = -u
        const w2 = s.L - u
        const r2a = w1 * w1 + dEff * dEff
        const r2b = w2 * w2 + dEff * dEff
        const aA = dEff > 0 ? dEff * Math.atan(w1 / dEff) : 0
        const aB = dEff > 0 ? dEff * Math.atan(w2 / dEff) : 0
        const Ia = r2a < 1e-30 ? 0 : 0.5 * w1 * Math.log(r2a) - w1 + aA
        const Ib = r2b < 1e-30 ? 0 : 0.5 * w2 * Math.log(r2b) - w2 + aB
        A[i * N + j] = -(Ib - Ia) / s.L
      }
      const col = vcol.get(p.ci)
      if (col !== undefined) A[i * N + col] = -1
      const V = col === undefined ? potentials[p.ci] : 0
      b[i] = V - phiFree(p.mx, p.my)
    }
    for (let k = 0; k < iso.length; k++) {
      const row = n + k
      for (let j = 0; j < n; j++) if (panels[j].ci === iso[k].ci) A[row * N + j] = 1
      b[row] = iso[k].q
    }
    efieldLinSolve(A, b)
    for (let j = 0; j < n; j++) panels[j].Q = b[j]
    for (let k = 0; k < iso.length; k++) potentials[iso[k].ci] = b[n + k]
    return potentials
  }

  // Far-field acceleration. Consecutive panels of one conductor form clusters of
  // EFIELD_LEAF panels, grouped EFIELD_FANOUT at a time into parent clusters. Outside
  // EFIELD_FAR × its radius a cluster is replaced by a complex multipole expansion
  // (conj E = Σ a_k / w^(k+1), a_k = ∫ λ δ^k dl, exact moments of uniform segments).
  // Truncation error ≈ (1/EFIELD_FAR)^(EFIELD_ORDER+1); measured ≤ 1e-4 of the median |E|
  // against the panel-by-panel sum. Only leaves next to the point are integrated panel by
  // panel. The expansion is unsoftened: it differs from the softened panel kernel by
  // O(soft / r²), which is the softening artefact itself, not an error of the expansion.
  const EFIELD_LEAF = 4
  const EFIELD_FANOUT = 4
  const EFIELD_ORDER = 8
  const EFIELD_FAR = 2.5

  function efieldMakeCluster(panels, i, j, kids) {
    let cx = 0
    let cy = 0
    for (let k = i; k < j; k++) {
      cx += panels[k].mx
      cy += panels[k].my
    }
    cx /= j - i
    cy /= j - i
    let R2 = 0
    let xmin = Infinity
    let xmax = -Infinity
    let ymin = Infinity
    let ymax = -Infinity
    const re = new Float64Array(EFIELD_ORDER + 1)
    const im = new Float64Array(EFIELD_ORDER + 1)
    for (let k = i; k < j; k++) {
      const p = panels[k]
      R2 = Math.max(R2, (p.ax - cx) ** 2 + (p.ay - cy) ** 2, (p.bx - cx) ** 2 + (p.by - cy) ** 2)
      xmin = Math.min(xmin, p.ax, p.bx)
      xmax = Math.max(xmax, p.ax, p.bx)
      ymin = Math.min(ymin, p.ay, p.by)
      ymax = Math.max(ymax, p.ay, p.by)
      // ∫ λ δ^k dl over the segment = Q (B^(k+1) − A^(k+1)) / ((k+1)(B − A)).
      const Ar = p.ax - cx
      const Ai = p.ay - cy
      const Br = p.bx - cx
      const Bi = p.by - cy
      const dr = Br - Ar
      const di = Bi - Ai
      const dd = dr * dr + di * di
      let aPr = Ar
      let aPi = Ai
      let bPr = Br
      let bPi = Bi
      for (let n = 0; n <= EFIELD_ORDER; n++) {
        const nr = bPr - aPr
        const ni = bPi - aPi
        const s = p.Q / ((n + 1) * dd)
        re[n] += s * (nr * dr + ni * di)
        im[n] += s * (ni * dr - nr * di)
        const t1 = aPr * Ar - aPi * Ai
        aPi = aPr * Ai + aPi * Ar
        aPr = t1
        const t2 = bPr * Br - bPi * Bi
        bPi = bPr * Bi + bPi * Br
        bPr = t2
      }
    }
    return { start: i, end: j, cx, cy, far2: EFIELD_FAR * EFIELD_FAR * R2, xmin, xmax, ymin, ymax, re, im, kids }
  }

  function efieldBuildClusters(panels) {
    const leaves = []
    let i = 0
    while (i < panels.length) {
      let j = i
      const ci = panels[i].ci
      while (j < panels.length && j - i < EFIELD_LEAF && panels[j].ci === ci) j++
      leaves.push(efieldMakeCluster(panels, i, j, null))
      i = j
    }
    const roots = []
    let k = 0
    while (k < leaves.length) {
      let l = k
      const ci = panels[leaves[k].start].ci
      while (l < leaves.length && l - k < EFIELD_FANOUT && panels[leaves[l].start].ci === ci) l++
      const kids = leaves.slice(k, l)
      roots.push(kids.length === 1 ? kids[0] : efieldMakeCluster(panels, kids[0].start, kids[kids.length - 1].end, kids))
      k = l
    }
    return roots
  }

  function efieldClusterE(c, panels, x, y, soft, acc) {
    const wr = x - c.cx
    const wi = y - c.cy
    const w2 = wr * wr + wi * wi
    if (w2 > c.far2) {
      const ir = wr / w2
      const ii = -wi / w2
      let tr = ir
      let ti = ii
      let sr = 0
      let si = 0
      for (let n = 0; n <= EFIELD_ORDER; n++) {
        sr += c.re[n] * tr - c.im[n] * ti
        si += c.re[n] * ti + c.im[n] * tr
        const t = tr * ir - ti * ii
        ti = tr * ii + ti * ir
        tr = t
      }
      acc[0] += sr
      acc[1] -= si
    } else if (c.kids) {
      for (const kid of c.kids) efieldClusterE(kid, panels, x, y, soft, acc)
    } else {
      for (let k = c.start; k < c.end; k++) {
        const p = panels[k]
        const e = efieldSegE(x, y, p.ax, p.ay, p.bx, p.by, p.Q, soft)
        acc[0] += e[0]
        acc[1] += e[1]
      }
    }
  }

  function efieldPanelsE(clusters, panels, x, y, soft) {
    const acc = [0, 0]
    for (const c of clusters) efieldClusterE(c, panels, x, y, soft, acc)
    return acc
  }

  function efieldClusterPhi(c, panels, x, y, soft) {
    const wr = x - c.cx
    const wi = y - c.cy
    const w2 = wr * wr + wi * wi
    if (w2 > c.far2) {
      // φ = −a₀ ln|w| + Re Σ_{k≥1} a_k / (k w^k)
      let s = -c.re[0] * 0.5 * Math.log(w2)
      const ir = wr / w2
      const ii = -wi / w2
      let tr = ir
      let ti = ii
      for (let n = 1; n <= EFIELD_ORDER; n++) {
        s += (c.re[n] * tr - c.im[n] * ti) / n
        const t = tr * ir - ti * ii
        ti = tr * ii + ti * ir
        tr = t
      }
      return s
    }
    let s = 0
    if (c.kids) {
      for (const kid of c.kids) s += efieldClusterPhi(kid, panels, x, y, soft)
    } else {
      for (let k = c.start; k < c.end; k++) {
        const p = panels[k]
        s += efieldSegPhi(x, y, p.ax, p.ay, p.bx, p.by, p.Q, soft)
      }
    }
    return s
  }

  function efieldPanelsPhi(clusters, panels, x, y, soft) {
    let s = 0
    for (const c of clusters) s += efieldClusterPhi(c, panels, x, y, soft)
    return s
  }

  function efieldCrossC(clusters, panels, x0, y0, x1, y1) {
    const bx0 = Math.min(x0, x1)
    const bx1 = Math.max(x0, x1)
    const by0 = Math.min(y0, y1)
    const by1 = Math.max(y0, y1)
    for (const c of clusters) {
      if (bx1 < c.xmin - 1e-9 || bx0 > c.xmax + 1e-9 || by1 < c.ymin - 1e-9 || by0 > c.ymax + 1e-9) continue
      const hit = efieldCross(panels, x0, y0, x1, y1, c.start, c.end)
      if (hit) return hit
    }
    return null
  }

  function efieldNearOpenC(clusters, panels, x, y, dist) {
    for (const c of clusters) {
      if (x < c.xmin - dist || x > c.xmax + dist || y < c.ymin - dist || y > c.ymax + dist) continue
      const hit = efieldNearOpen(panels, x, y, dist, c.start, c.end)
      if (hit) return hit
    }
    return null
  }

  /**
   * Conductors in the electrostatic picture. The whole field is a 2-D cross-section:
   * conductors and line charges are infinitely long, φ = −q ln r, E = q r̂ / r.
   * Closed conductors are constant-potential; E is exactly 0 inside and φ is that potential.
   */
  /** `clip: [x1, y1, x2, y2]` (a box) or `[[x, y], ...]` (a polygon), world units → canvas-px polygon. */
  function clipPolyPx(m, clip) {
    if (!Array.isArray(clip)) return null
    if (clip.length === 4 && clip.every(Number.isFinite)) {
      const [x1, y1, x2, y2] = clip
      return [[x1, y1], [x2, y1], [x2, y2], [x1, y2]].map(([x, y]) => [m.x(x), m.y(y)])
    }
    const pts = clip.filter((p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]))
    return pts.length > 2 ? pts.map(([x, y]) => [m.x(x), m.y(y)]) : null
  }

  function withClip(poly, fn) {
    if (!poly) return fn()
    ctx.save()
    ctx.beginPath()
    poly.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y)))
    ctx.closePath()
    ctx.clip()
    fn()
    ctx.restore()
  }

  // Background field lines stay quiet; lines through chosen points (`through`) are the
  // emphasis and draw at full strength.
  function drawFieldGeom(m, geom, o, lineColor, eqColor) {
    const poly = clipPolyPx(m, o.clip)
    if (layoutFrame && o.lines !== false) {
      for (const L of [...geom.lines, ...geom.through]) noteStroke(L.map(([x, y]) => [m.x(x), m.y(y)]), o.width || 1.2, { field: true, clipped: !!poly })
    }
    withClip(poly, () => {
      if (geom.eq.length) {
        ctx.save()
        ctx.globalAlpha = 0.85
        stroke({ color: eqColor, width: 1, dash: [4, 4] })
        for (const L of geom.eq) {
          ctx.beginPath()
          L.forEach(([X, Y], k) => (k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y)))
          ctx.stroke()
        }
        ctx.restore()
      }
      if (o.lines === false && !geom.through.length) return
      const quiet = night() ? 0.85 : 0.75
      withGlow(lineColor, 6, () => {
        for (const [set, width, alpha] of [[geom.lines, o.width || 1.2, quiet], [geom.through, (o.width || 1.2) + 1, 1]]) {
          ctx.globalAlpha = alpha
          stroke({ color: lineColor, width })
          for (const L of set) {
            ctx.beginPath()
            L.forEach(([x, y], i) => (i ? ctx.lineTo(m.x(x), m.y(y)) : ctx.moveTo(m.x(x), m.y(y))))
            ctx.stroke()
          }
        }
        ctx.globalAlpha = 1
      })
      if (o.arrows === false) return
      // The arrow sits on the first stretch of the line that is visible, so a line coming in
      // from an off-screen charge (or from outside the clip) still shows which way it points.
      const visible = ([X, Y]) => X >= 4 && X <= cssW - 4 && Y >= 4 && Y <= cssH - 4 && (!poly || pointInRingPoly(X, Y, poly))
      for (const [L, emph] of [...geom.lines.map((L) => [L, false]), ...geom.through.map((L) => [L, true])]) {
        const S = L.map(([x, y]) => [m.x(x), m.y(y)])
        const i0 = S.findIndex(visible)
        if (i0 < 0) continue
        let i1 = i0
        while (i1 + 1 < S.length && visible(S[i1 + 1])) i1++
        let run = 0
        const acc = [0]
        for (let i = i0 + 1; i <= i1; i++) acc.push((run += Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1])))
        if (run < 50) continue
        const target = Math.min(run * 0.45, 70 + run * 0.15)
        const j = acc.findIndex((d) => d >= target)
        if (j < 1) continue
        const A = S[i0 + j - 1]
        const B = S[i0 + j]
        const len = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1
        ctx.globalAlpha = emph ? 1 : quiet
        headPx(B[0], B[1], (B[0] - A[0]) / len, (B[1] - A[1]) / len, emph ? 10 : 8.5, lineColor, BACKDROP)
        ctx.globalAlpha = 1
      }
    })
  }

  function efieldConductors(m, charges, o) {
    const shapes = efieldConductorShapes(o.conductors)
    if (!shapes.length) return null
    const spanX = Math.abs(m.ix(cssW) - m.ix(0)) || 1
    const spanY = Math.abs(m.iy(0) - m.iy(cssH)) || 1
    const soft = (o.soft ?? 0.0004) * spanX * spanX
    // Panel spacing is about span/150. The default soft core is several panels wide, which
    // makes a thin-plate collocation matrix singular and the edge charge oscillate. Keep the
    // same kernel, but don't soften a panel by more than a fraction of its own length.
    const panelSoft = Math.min(soft, (spanX / 150 / 3) ** 2)
    const points = []
    const rods = []
    for (const c of charges || []) {
      if (!c) continue
      if (c.x1 !== undefined && [c.x1, c.y1, c.x2, c.y2, c.q].every((v) => Number.isFinite(+v))) rods.push(c)
      else if ([c.x, c.y, c.q].every((v) => Number.isFinite(+v))) points.push(c)
    }
    const phiFree = (x, y) => {
      let s = 0
      for (const p of points) s += efieldPointPhi(x, y, p.x, p.y, p.q, soft)
      for (const r of rods) s += efieldSegPhi(x, y, r.x1, r.y1, r.x2, r.y2, r.q, soft)
      return s
    }
    const key = JSON.stringify([charges, o, m.x(0), m.x(1), m.y(0), m.y(1), cssW, cssH, 'conductors'])
    let packed = efieldCache.get(key)
    if (!packed || !packed.panels) {
      const panels = efieldPanelCountCap(shapes, spanX / 150)
      const potentials = efieldSolvePanels(panels, shapes, phiFree, panelSoft)
      packed = { panels, potentials, clusters: efieldBuildClusters(panels) }
      if (efieldCache.size >= 24) efieldCache.delete(efieldCache.keys().next().value)
      efieldCache.set(key, packed)
    }
    const panels = packed.panels
    const potentials = packed.potentials
    const clusters = packed.clusters
    const E = (x, y) => {
      if (efieldInside(shapes, x, y)) return [0, 0]
      let ex = 0
      let ey = 0
      for (const p of points) {
        const e = efieldPointE(x, y, p.x, p.y, p.q, soft)
        ex += e[0]
        ey += e[1]
      }
      for (const r of rods) {
        const e = efieldSegE(x, y, r.x1, r.y1, r.x2, r.y2, r.q, soft)
        ex += e[0]
        ey += e[1]
      }
      const e = efieldPanelsE(clusters, panels, x, y, panelSoft)
      return [ex + e[0], ey + e[1]]
    }
    const phi = (x, y) => {
      const hit = efieldInside(shapes, x, y)
      if (hit) return potentials[hit.ci]
      return phiFree(x, y) + efieldPanelsPhi(clusters, panels, x, y, panelSoft)
    }
    const xmin = Math.min(m.ix(0), m.ix(cssW)) - spanX
    const xmax = Math.max(m.ix(0), m.ix(cssW)) + spanX
    const ymin = Math.min(m.iy(0), m.iy(cssH)) - spanY
    const ymax = Math.max(m.iy(0), m.iy(cssH)) + spanY
    const lineColor = o.color || colors.field
    const eqColor = o.equipotentialColor || colors.steel
    const r0 = m.ix(9) - m.ix(0)
    const step = (m.ix(2.5) - m.ix(0)) * (o.step || 1)
    const nearPts = points.map((p) => ({ x: p.x, y: p.y, q: p.q, src: p }))
    for (const r of rods) {
      const n = r.n || 24
      for (let i = 0; i < n; i++) {
        const k = (i + 0.5) / n
        nearPts.push({ x: r.x1 + (r.x2 - r.x1) * k, y: r.y1 + (r.y2 - r.y1) * k, q: r.q / n })
      }
    }
    const near = (x, y, sign) => {
      for (const p of nearPts) {
        if (Math.sign(p.q) !== sign) continue
        const rad = p.src ? r0 : r0 * 0.5
        if ((x - p.x) ** 2 + (y - p.y) ** 2 < rad * rad) return p
      }
      return null
    }
    const retreat = (x0, y0, x1, y1) => {
      let loX = x0
      let loY = y0
      let hiX = x1
      let hiY = y1
      for (let s = 0; s < 12; s++) {
        const mx = (loX + hiX) / 2
        const my = (loY + hiY) / 2
        if (efieldInside(shapes, mx, my) || efieldCrossC(clusters, panels, loX, loY, mx, my)) {
          hiX = mx
          hiY = my
        } else {
          loX = mx
          loY = my
        }
      }
      return [loX, loY]
    }
    const trace = (x, y, dirn) => {
      const out = [[x, y]]
      const touch = Math.abs(step) * 0.85
      for (let k = 0; k < 2400; k++) {
        const f = (px, py) => {
          if (efieldInside(shapes, px, py)) return null
          const [ex, ey] = E(px, py)
          const nrm = Math.hypot(ex, ey) || 1
          return [(dirn * ex) / nrm, (dirn * ey) / nrm]
        }
        const k1 = f(x, y)
        if (!k1) return { pts: out, end: null, conductor: (efieldInside(shapes, x, y) || {}).ci }
        const k2 = f(x + (step / 2) * k1[0], y + (step / 2) * k1[1]) || k1
        const k3 = f(x + (step / 2) * k2[0], y + (step / 2) * k2[1]) || k2
        const k4 = f(x + step * k3[0], y + step * k3[1]) || k3
        const nx = x + (step / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0])
        const ny = y + (step / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
        if (nx < xmin || nx > xmax || ny < ymin || ny > ymax) {
          out.push([nx, ny])
          return { pts: out, end: null, conductor: null }
        }
        const wall = efieldInside(shapes, nx, ny) || efieldCrossC(clusters, panels, x, y, nx, ny)
        if (wall) {
          out.push(retreat(x, y, nx, ny))
          return { pts: out, end: null, conductor: wall.ci }
        }
        // Unit-speed RK4 only stalls where E reverses inside one step (a softened
        // charge layer). Stop there instead of crawling for thousands of steps.
        if (k > 14 && Math.hypot(nx - x, ny - y) < Math.abs(step) * 0.3) {
          const skim = efieldNearOpenC(clusters, panels, x, y, Math.sqrt(panelSoft) * 2 + Math.abs(step) * 2)
          out.push([nx, ny])
          return { pts: out, end: null, conductor: skim ? skim.ci : null }
        }
        if (k > 2) {
          const skim = efieldNearOpenC(clusters, panels, nx, ny, touch)
          if (skim) {
            out.push([nx, ny])
            return { pts: out, end: null, conductor: skim.ci }
          }
        }
        x = nx
        y = ny
        out.push([x, y])
        const hit = near(x, y, -dirn)
        if (hit && k > 3) return { pts: out, end: hit, conductor: null }
      }
      return { pts: out, end: null, conductor: null }
    }
    const line = (x, y) => [...trace(x, y, -1).pts].reverse().concat(trace(x, y, 1).pts.slice(1))

    if (!packed.geom) {
      const levels = o.equipotentials
      const eq = []
      if (levels) {
        const cell = 5
        const nx = Math.ceil(cssW / cell) + 1
        const ny = Math.ceil(cssH / cell) + 1
        const grid = new Float64Array(nx * ny)
        for (let j = 0; j < ny; j++) {
          for (let i = 0; i < nx; i++) {
            const x = m.ix(i * cell)
            const y = m.iy(j * cell)
            grid[j * nx + i] = efieldInside(shapes, x, y) ? NaN : phi(x, y)
          }
        }
        const sorted = Array.from(grid).filter(Number.isFinite).sort((a, b) => a - b)
        const lo = sorted[Math.floor(sorted.length * 0.04)] ?? 0
        const hi = sorted[Math.floor(sorted.length * 0.96)] ?? 0
        const range = Math.max(1e-6, hi - lo)
        const tol = Math.max(1e-4, 0.025 * range)
        let values = Array.isArray(levels) ? levels.slice() : []
        if (!values.length && sorted.length) {
          const nLv = typeof levels === 'number' ? levels : 6
          const pos = sorted.filter((v) => v > 0 && v < hi)
          const neg = sorted.filter((v) => v < 0 && v > lo)
          const pick = (arr, k) => Array.from({ length: k }, (_, i) => arr[Math.floor(((i + 0.5) / k) * arr.length)]).filter((v) => v !== undefined)
          const share = pos.length + neg.length || 1
          const kp = neg.length ? Math.max(1, Math.round((nLv * pos.length) / share)) : nLv
          values = [...pick(pos, pos.length ? kp : 0), ...pick(neg, neg.length ? Math.max(1, nLv - kp) : 0)]
          if (!pos.length && !neg.length) values = pick(sorted.slice(Math.floor(sorted.length * 0.04), Math.floor(sorted.length * 0.96)), nLv)
        }
        values = values.filter((v) => shapes.every((s) => Math.abs(v - potentials[s.ci]) > tol))
        for (const v of values) {
          const segs = []
          for (let j = 0; j < ny - 1; j++) {
            for (let i = 0; i < nx - 1; i++) {
              const ga = grid[j * nx + i]
              const gb = grid[j * nx + i + 1]
              const gc = grid[(j + 1) * nx + i + 1]
              const gd = grid[(j + 1) * nx + i]
              if (![ga, gb, gc, gd].every(Number.isFinite)) continue
              const a = ga - v
              const b = gb - v
              const c = gc - v
              const d = gd - v
              const X = i * cell
              const Y = j * cell
              const cross = []
              if (a * b < 0) cross.push([X + (cell * a) / (a - b), Y])
              if (b * c < 0) cross.push([X + cell, Y + (cell * b) / (b - c)])
              if (c * d < 0) cross.push([X + cell - (cell * c) / (c - d), Y + cell])
              if (d * a < 0) cross.push([X, Y + cell - (cell * d) / (d - a)])
              if (cross.length === 2) segs.push(cross)
              else if (cross.length === 4) segs.push([cross[0], cross[1]], [cross[2], cross[3]])
            }
          }
          const kOf = (p) => Math.round(p[0] * 8) + ',' + Math.round(p[1] * 8)
          const ends = new Map()
          segs.forEach((s, i) => {
            for (const p of s) {
              const k = kOf(p)
              if (!ends.has(k)) ends.set(k, [])
              ends.get(k).push(i)
            }
          })
          const used = new Uint8Array(segs.length)
          for (let i = 0; i < segs.length; i++) {
            if (used[i]) continue
            used[i] = 1
            const poly = [segs[i][0], segs[i][1]]
            for (const dirn of [1, 0]) {
              for (;;) {
                const tip = dirn ? poly[poly.length - 1] : poly[0]
                const next = (ends.get(kOf(tip)) || []).find((j) => !used[j])
                if (next === undefined) break
                used[next] = 1
                const [p, q] = segs[next]
                const far = kOf(p) === kOf(tip) ? q : p
                dirn ? poly.push(far) : poly.unshift(far)
              }
            }
            if (poly.length > 3) eq.push(poly)
          }
        }
      }
      const through = (Array.isArray(o.through) ? o.through : []).filter((q) => Array.isArray(q) && q.every(Number.isFinite)).map(([x, y]) => line(x, y))
      const lines = []
      if (o.lines !== false) {
        const perUnit = o.density ?? 8
        const plus = new Map()
        const minus = new Map()
        for (const p of panels) {
          if (p.Q > 0) plus.set(p.ci, (plus.get(p.ci) || 0) + p.Q)
          else if (p.Q < 0) minus.set(p.ci, (minus.get(p.ci) || 0) - p.Q)
        }
        let maxQ = 1e-12
        for (const p of points) maxQ = Math.max(maxQ, Math.abs(p.q))
        for (const v of plus.values()) maxQ = Math.max(maxQ, v)
        for (const v of minus.values()) maxQ = Math.max(maxQ, v)
        const arrivals = new Map()
        const hits = new Map()
        const note = (res) => {
          if (res.end && res.end.src) arrivals.set(res.end.src, (arrivals.get(res.end.src) || 0) + 1)
          if (res.conductor !== undefined && res.conductor !== null) hits.set(res.conductor, (hits.get(res.conductor) || 0) + 1)
        }
        const eps = Math.abs(r0) * 0.4
        const sources = (charges || []).filter((c) => c && c.x !== undefined && Number.isFinite(+c.q))
        const segSources = (charges || []).filter((c) => c && c.x1 !== undefined && Number.isFinite(+c.q))
        const emitFree = (sign) => {
          for (const c of sources) {
            if (Math.sign(c.q) !== sign) continue
            const n = Math.max(2, Math.round((perUnit * Math.abs(c.q)) / maxQ))
            const need = n - (arrivals.get(c) || 0)
            if (need <= 0) continue
            const phase = o.phase ?? (sign > 0 ? 0 : Math.PI / n)
            for (let i = 0; i < need; i++) {
              const a = phase + (2 * Math.PI * i) / need
              const res = trace(c.x + r0 * Math.cos(a), c.y + r0 * Math.sin(a), sign)
              lines.push(sign > 0 ? res.pts : res.pts.slice().reverse())
              note(res)
            }
          }
          for (const sg of segSources) {
            if (Math.sign(sg.q) !== sign) continue
            const n = Math.max(2, Math.round(sg.lines ?? perUnit))
            const len = Math.hypot(sg.x2 - sg.x1, sg.y2 - sg.y1) || 1
            const nxp = -(sg.y2 - sg.y1) / len
            const nyp = (sg.x2 - sg.x1) / len
            for (let i = 0; i < n; i++) {
              const k = (i + 0.5) / n
              const bx = sg.x1 + (sg.x2 - sg.x1) * k
              const by = sg.y1 + (sg.y2 - sg.y1) * k
              for (const side of sg.side ? [sg.side] : [1, -1]) {
                const res = trace(bx + side * nxp * r0 * 0.6, by + side * nyp * r0 * 0.6, sign)
                if (res.pts.length > 4) {
                  lines.push(sign > 0 ? res.pts : res.pts.slice().reverse())
                  note(res)
                }
              }
            }
          }
        }
        const sideSamples = (sign) => {
          const out = []
          for (const p of panels) {
            const q = sign > 0 ? Math.max(p.Q, 0) : Math.max(-p.Q, 0)
            if (!(q > 0)) continue
            if (p.closed) {
              out.push({ x: p.mx, y: p.my, nx: p.nx, ny: p.ny, q, tx: p.tx, ty: p.ty, L: p.L, ci: p.ci })
              continue
            }
            const e1 = E(p.mx + p.nx * eps, p.my + p.ny * eps)
            const e2 = E(p.mx - p.nx * eps, p.my - p.ny * eps)
            const n1 = e1[0] * p.nx + e1[1] * p.ny
            const n2 = -(e2[0] * p.nx + e2[1] * p.ny)
            const t1 = Math.abs(e1[0] * p.tx + e1[1] * p.ty)
            const t2 = Math.abs(e2[0] * p.tx + e2[1] * p.ty)
            const leave1 = sign > 0 ? n1 : -n1
            const leave2 = sign > 0 ? n2 : -n2
            // Launch where the field leaves the plate, not where it only skims along it.
            let w1 = leave1 > t1 * 0.65 ? leave1 : 0
            let w2 = leave2 > t2 * 0.65 ? leave2 : 0
            if (w1 + w2 <= 1e-12) {
              if (leave1 >= leave2 && leave1 > 0) w1 = leave1
              else if (leave2 > 0) w2 = leave2
            }
            const w = w1 + w2
            if (w1 > 0) out.push({ x: p.mx, y: p.my, nx: p.nx, ny: p.ny, q: (q * w1) / w, tx: p.tx, ty: p.ty, L: p.L, ci: p.ci })
            if (w2 > 0) out.push({ x: p.mx, y: p.my, nx: -p.nx, ny: -p.ny, q: (q * w2) / w, tx: p.tx, ty: p.ty, L: p.L, ci: p.ci })
          }
          return out
        }
        const emitSurface = (samples, sign, limit) => {
          const Q = samples.reduce((s, a) => s + a.q, 0)
          if (!(Q > 0)) return 0
          let n = Math.round((perUnit * Q) / maxQ)
          if (limit !== undefined) n = Math.min(n, Math.max(0, limit))
          if (n <= 0) return 0
          let cum = 0
          const bins = samples.map((s) => (cum += s.q))
          let drawn = 0
          for (let i = 0; i < n; i++) {
            const target = ((i + 0.5) / n) * Q
            let k = 0
            while (k < bins.length - 1 && bins[k] < target) k++
            const s = samples[k]
            const prev = k ? bins[k - 1] : 0
            const frac = s.q > 0 ? (target - prev) / s.q : 0.5
            const x = s.x + (frac - 0.5) * s.L * s.tx
            const y = s.y + (frac - 0.5) * s.L * s.ty
            const sx = x + s.nx * eps
            const sy = y + s.ny * eps
            if (efieldInside(shapes, sx, sy)) continue
            const res = trace(sx, sy, sign)
            if (res.pts.length > 5) {
              lines.push(sign > 0 ? res.pts : res.pts.slice().reverse())
              note(res)
              drawn++
            }
          }
          return drawn
        }
        emitFree(1)
        emitSurface(sideSamples(1), 1)
        emitFree(-1)
        for (const s of shapes) {
          const samp = sideSamples(-1).filter((p) => p.ci === s.ci)
          const Q = samp.reduce((a, p) => a + p.q, 0)
          const want = Math.round((perUnit * Q) / maxQ)
          const need = want - (hits.get(s.ci) || 0)
          if (need > 0) emitSurface(samp, -1, need)
        }
      }
      packed.geom = { eq, lines, through }
    }

    drawFieldGeom(m, packed.geom, o, lineColor, eqColor)

    const metal = (x0, y0, x1, y1) => {
      const g = ctx.createLinearGradient(x0, y0, x1, y1)
      if (night()) {
        g.addColorStop(0, '#6E7078')
        g.addColorStop(0.45, '#3A3C44')
        g.addColorStop(1, '#2A2C32')
      } else {
        g.addColorStop(0, '#F5F6F8')
        g.addColorStop(0.42, '#E2E3E6')
        g.addColorStop(1, '#C4C6CA')
      }
      return g
    }
    for (const s of shapes) {
      if (s.kind === 'circle') {
        const X = m.x(s.cx)
        const Y = m.y(s.cy)
        const R = Math.abs(m.s(s.r))
        ctx.beginPath()
        ctx.arc(X, Y, R, 0, Math.PI * 2)
        if (s.fill) {
          ctx.fillStyle = metal(X - R, Y - R, X + R, Y + R)
          ctx.fill()
        }
        stroke({ color: colors.ink, width: 1.4 })
        ctx.stroke()
        addShape(X - R, Y - R, 2 * R, 2 * R, BODY)
        if (s.label) label(m, s.cx, s.cy + s.r, s.label, { place: 'above', offset: 4, background: false })
      } else if (s.closed) {
        const scr = s.points.map(([x, y]) => [m.x(x), m.y(y)])
        const xs = scr.map((p) => p[0])
        const ys = scr.map((p) => p[1])
        ctx.beginPath()
        scr.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y)))
        ctx.closePath()
        if (s.fill) {
          ctx.fillStyle = metal(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys))
          ctx.fill()
        }
        stroke({ color: colors.ink, width: 1.45 })
        ctx.stroke()
        addShape(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), BODY)
        if (s.label) {
          const cx = s.points.reduce((a, p) => a + p[0], 0) / s.points.length
          let best = s.points[0]
          for (const p of s.points) {
            const higher = p[1] > best[1] + 1e-6
            const tie = Math.abs(p[1] - best[1]) <= 1e-6 && Math.abs(p[0] - cx) < Math.abs(best[0] - cx)
            if (higher || tie) best = p
          }
          label(m, best[0], best[1], s.label, { place: 'above', offset: 10, background: false })
        }
      } else {
        const poly = s.kind === 'line' ? [[s.x1, s.y1], [s.x2, s.y2]] : s.points
        const thick = 6.5
        stroke({ color: colors.ink, width: thick })
        ctx.lineCap = 'butt'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        poly.forEach(([x, y], i) => (i ? ctx.lineTo(m.x(x), m.y(y)) : ctx.moveTo(m.x(x), m.y(y))))
        ctx.stroke()
        stroke({ color: night() ? '#9A9CA3' : '#F3F5F7', width: 2 })
        ctx.beginPath()
        poly.forEach(([x, y], i) => (i ? ctx.lineTo(m.x(x), m.y(y)) : ctx.moveTo(m.x(x), m.y(y))))
        ctx.stroke()
        ctx.lineCap = 'round'
        const Xs = poly.map(([x]) => m.x(x))
        const Ys = poly.map(([, y]) => m.y(y))
        addShape(Math.min(...Xs) - thick, Math.min(...Ys) - thick, Math.max(...Xs) - Math.min(...Xs) + 2 * thick, Math.max(...Ys) - Math.min(...Ys) + 2 * thick)
        if (s.label) {
          // Beyond the left end: above a plate the label sits in the fringe-field lines.
          let [lx, ly] = poly[0]
          for (const p of poly) if (p[0] < lx - 1e-9 || (Math.abs(p[0] - lx) <= 1e-9 && p[1] > ly)) [lx, ly] = p
          label(m, lx, ly, s.label, { place: 'left', offset: thick + 6, background: false })
        }
      }
    }

    if (o.charges !== false) {
      for (const c of charges || []) {
        if (!c) continue
        if (c.x1 !== undefined) {
          if (c.draw === false) continue
          const thick = c.thick || 5
          plateBar(m.x(c.x1), m.y(c.y1), m.x(c.x2), m.y(c.y2), thick)
          addShape(Math.min(m.x(c.x1), m.x(c.x2)) - thick, Math.min(m.y(c.y1), m.y(c.y2)) - thick, Math.abs(m.x(c.x2) - m.x(c.x1)) + 2 * thick, Math.abs(m.y(c.y2) - m.y(c.y1)) + 2 * thick)
          if (c.label) label(m, (c.x1 + c.x2) / 2, (c.y1 + c.y2) / 2, c.label, { place: c.labelPlace || 'above', offset: thick + 6, background: false })
          continue
        }
        if (![c.x, c.y, c.q].every((v) => Number.isFinite(+v))) continue
        const R = c.r || 9 + Math.min(4, Math.abs(c.q) * 1.5)
        chargeDisk(m.x(c.x), m.y(c.y), R, c.q)
        addShape(m.x(c.x) - R, m.y(c.y) - R, 2 * R, 2 * R, BODY)
        if (c.label) label(m, c.x, c.y, c.label, { place: c.labelPlace || 'above-right', offset: R + 2, background: false })
      }
    }
    const surface = panels.map((p) => ({ x: p.mx, y: p.my, sigma: p.Q / p.L, len: p.L, conductor: p.ci }))
    return { E, phi, line, surface, potential: (i) => potentials[i] }
  }

  function efield(m, charges, o = {}) {
    if (o && Array.isArray(o.conductors) && o.conductors.length) {
      const withConductors = efieldConductors(m, charges, o)
      if (withConductors) return withConductors
    }
    const pts = []
    for (const c of charges || []) {
      if (c.x1 !== undefined) {
        const n = c.n || 24
        for (let i = 0; i < n; i++) {
          const k = (i + 0.5) / n
          pts.push({ x: c.x1 + (c.x2 - c.x1) * k, y: c.y1 + (c.y2 - c.y1) * k, q: c.q / n, seg: c })
        }
      } else pts.push({ x: c.x, y: c.y, q: c.q, src: c })
    }
    const soft = (o.soft ?? 0.0004) * (m.ix(cssW) - m.ix(0)) ** 2
    const E = (x, y) => {
      let ex = 0
      let ey = 0
      for (const p of pts) {
        const dx = x - p.x
        const dy = y - p.y
        const r2 = dx * dx + dy * dy + soft
        const k = p.q / (r2 * Math.sqrt(r2))
        ex += k * dx
        ey += k * dy
      }
      return [ex, ey]
    }
    const phi = (x, y) => pts.reduce((s, p) => s + p.q / Math.sqrt((x - p.x) ** 2 + (y - p.y) ** 2 + soft), 0)
    // Lines are followed a whole view beyond the canvas, so a charge placed off-screen (a plate's
    // charge below the floor) still sends its lines in, and a line that bulges out comes back.
    const spanX = Math.abs(m.ix(cssW) - m.ix(0))
    const spanY = Math.abs(m.iy(0) - m.iy(cssH))
    const xmin = Math.min(m.ix(0), m.ix(cssW)) - spanX
    const xmax = Math.max(m.ix(0), m.ix(cssW)) + spanX
    const ymin = Math.min(m.iy(0), m.iy(cssH)) - spanY
    const ymax = Math.max(m.iy(0), m.iy(cssH)) + spanY
    const lineColor = o.color || colors.field
    const eqColor = o.equipotentialColor || colors.steel

    // Equipotential polylines (canvas px) for the levels asked for.
    const equipotentialPolys = () => {
      const levels = o.equipotentials
      const polys = []
      if (!levels) return polys
      const cell = 5
      const nx = Math.ceil(cssW / cell) + 1
      const ny = Math.ceil(cssH / cell) + 1
      const grid = new Float64Array(nx * ny)
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) grid[j * nx + i] = phi(m.ix(i * cell), m.iy(j * cell))
      let values = Array.isArray(levels) ? levels : []
      if (!values.length) {
        const sorted = Array.from(grid).filter(Number.isFinite).sort((a, b) => a - b)
        const n = typeof levels === 'number' ? levels : 6
        const lo = sorted[Math.floor(sorted.length * 0.04)]
        const hi = sorted[Math.floor(sorted.length * 0.96)]
        const pos = sorted.filter((v) => v > 0 && v < hi)
        const neg = sorted.filter((v) => v < 0 && v > lo)
        const pick = (arr, k) => Array.from({ length: k }, (_, i) => arr[Math.floor(((i + 0.5) / k) * arr.length)]).filter((v) => v !== undefined)
        const share = pos.length + neg.length || 1
        const kp = neg.length ? Math.max(1, Math.round((n * pos.length) / share)) : n
        values = [...pick(pos, pos.length ? kp : 0), ...pick(neg, neg.length ? Math.max(1, n - kp) : 0)]
        if (!pos.length && !neg.length) values = pick(sorted.slice(Math.floor(sorted.length * 0.04), Math.floor(sorted.length * 0.96)), n)
      }
      for (const v of values) {
        const segs = []
        for (let j = 0; j < ny - 1; j++) {
          for (let i = 0; i < nx - 1; i++) {
            const a = grid[j * nx + i] - v
            const b = grid[j * nx + i + 1] - v
            const c = grid[(j + 1) * nx + i + 1] - v
            const d = grid[(j + 1) * nx + i] - v
            const X = i * cell
            const Y = j * cell
            const cross = []
            if (a * b < 0) cross.push([X + (cell * a) / (a - b), Y])
            if (b * c < 0) cross.push([X + cell, Y + (cell * b) / (b - c)])
            if (c * d < 0) cross.push([X + cell - (cell * c) / (c - d), Y + cell])
            if (d * a < 0) cross.push([X, Y + cell - (cell * d) / (d - a)])
            if (cross.length === 2) segs.push(cross)
            else if (cross.length === 4) segs.push([cross[0], cross[1]], [cross[2], cross[3]])
          }
        }
        // Stitch cell segments into polylines so the dash pattern runs continuously.
        const key = (p) => Math.round(p[0] * 8) + ',' + Math.round(p[1] * 8)
        const ends = new Map()
        segs.forEach((s, i) => {
          for (const p of s) {
            const k = key(p)
            if (!ends.has(k)) ends.set(k, [])
            ends.get(k).push(i)
          }
        })
        const used = new Uint8Array(segs.length)
        for (let i = 0; i < segs.length; i++) {
          if (used[i]) continue
          used[i] = 1
          const line = [segs[i][0], segs[i][1]]
          for (const dirn of [1, 0]) {
            for (;;) {
              const tip = dirn ? line[line.length - 1] : line[0]
              const next = (ends.get(key(tip)) || []).find((j) => !used[j])
              if (next === undefined) break
              used[next] = 1
              const [p, q] = segs[next]
              const far = key(p) === key(tip) ? q : p
              dirn ? line.push(far) : line.unshift(far)
            }
          }
          polys.push(line)
        }
      }
      return polys
    }

    const r0 = m.ix(9) - m.ix(0)
    const h = (m.ix(2.5) - m.ix(0)) * (o.step || 1)
    const near = (x, y, sign) => {
      for (const p of pts) if (Math.sign(p.q) === sign && (x - p.x) ** 2 + (y - p.y) ** 2 < (p.src ? r0 * r0 : (r0 * 0.5) ** 2)) return p
      return null
    }
    // RK4 along (dirn = 1) or against (dirn = -1) E until the line reaches an opposite charge or leaves the view.
    const trace = (x, y, dirn) => {
      const out = [[x, y]]
      for (let k = 0; k < 2400; k++) {
        const f = (px, py) => {
          const [ex, ey] = E(px, py)
          const n = Math.hypot(ex, ey) || 1
          return [(dirn * ex) / n, (dirn * ey) / n]
        }
        const k1 = f(x, y)
        const k2 = f(x + (h / 2) * k1[0], y + (h / 2) * k1[1])
        const k3 = f(x + (h / 2) * k2[0], y + (h / 2) * k2[1])
        const k4 = f(x + h * k3[0], y + h * k3[1])
        x += (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0])
        y += (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
        out.push([x, y])
        if (x < xmin || x > xmax || y < ymin || y > ymax) return { pts: out, end: null }
        const hit = near(x, y, -dirn)
        if (hit && k > 3) return { pts: out, end: hit }
      }
      return { pts: out, end: null }
    }
    /** The whole field line through (x, y), ordered along E (from + towards −), in world units. */
    const line = (x, y) => [...trace(x, y, -1).pts.reverse(), ...trace(x, y, 1).pts.slice(1)]
    const fieldLines = () => {
      const through = (Array.isArray(o.through) ? o.through : []).filter((q) => Array.isArray(q) && q.every(Number.isFinite)).map(([x, y]) => line(x, y))
      const lines = []
      if (o.lines === false && !through.length) return { lines, through }
      const perUnit = o.density ?? 8
      const maxQ = Math.max(...pts.map((p) => Math.abs(p.src ? p.q : 0)), 1e-12)
      const sources = o.lines === false ? [] : (charges || []).filter((c) => c.x !== undefined)
      const segSources = o.lines === false ? [] : (charges || []).filter((c) => c.x1 !== undefined)
      const arrivals = new Map()
      const emit = (sign) => {
        for (const c of sources.filter((s) => Math.sign(s.q) === sign)) {
          const n = Math.max(2, Math.round((perUnit * Math.abs(c.q)) / maxQ))
          const done = arrivals.get(c) || []
          const need = n - done.length
          if (need <= 0) continue
          const phase = o.phase ?? (sign > 0 ? 0 : Math.PI / n)
          for (let i = 0; i < need; i++) {
            const a = phase + (2 * Math.PI * i) / need
            const sx = c.x + r0 * Math.cos(a)
            const sy = c.y + r0 * Math.sin(a)
            const res = trace(sx, sy, sign)
            lines.push(sign > 0 ? res.pts : res.pts.reverse())
            if (res.end && res.end.src) arrivals.set(res.end.src, [...(arrivals.get(res.end.src) || []), a])
          }
        }
        for (const sg of segSources.filter((s) => Math.sign(s.q) === sign)) {
          const n = Math.max(2, Math.round(sg.lines ?? perUnit))
          const len = Math.hypot(sg.x2 - sg.x1, sg.y2 - sg.y1) || 1
          const nxp = -(sg.y2 - sg.y1) / len
          const nyp = (sg.x2 - sg.x1) / len
          for (let i = 0; i < n; i++) {
            const k = (i + 0.5) / n
            const bx = sg.x1 + (sg.x2 - sg.x1) * k
            const by = sg.y1 + (sg.y2 - sg.y1) * k
            for (const side of sg.side ? [sg.side] : [1, -1]) {
              const res = trace(bx + side * nxp * r0 * 0.6, by + side * nyp * r0 * 0.6, sign)
              if (res.pts.length > 4) lines.push(sign > 0 ? res.pts : res.pts.reverse())
            }
          }
        }
      }
      emit(1)
      emit(-1)
      return { lines, through }
    }

    // Tracing is the costly part and depends only on the charges, options and view, so a
    // static field is traced once rather than every frame.
    const key = JSON.stringify([charges, o, m.x(0), m.x(1), m.y(0), m.y(1), cssW, cssH])
    let geom = efieldCache.get(key)
    if (!geom) {
      geom = { eq: equipotentialPolys(), ...fieldLines() }
      if (efieldCache.size >= 24) efieldCache.delete(efieldCache.keys().next().value)
      efieldCache.set(key, geom)
    }

    drawFieldGeom(m, geom, o, lineColor, eqColor)

    if (o.charges !== false) {
      for (const c of charges || []) {
        if (c.x1 !== undefined) {
          if (c.draw === false) continue
          const thick = c.thick || 5
          plateBar(m.x(c.x1), m.y(c.y1), m.x(c.x2), m.y(c.y2), thick)
          addShape(Math.min(m.x(c.x1), m.x(c.x2)) - thick, Math.min(m.y(c.y1), m.y(c.y2)) - thick, Math.abs(m.x(c.x2) - m.x(c.x1)) + 2 * thick, Math.abs(m.y(c.y2) - m.y(c.y1)) + 2 * thick)
          if (c.label) label(m, (c.x1 + c.x2) / 2, (c.y1 + c.y2) / 2, c.label, { place: c.labelPlace || 'above', offset: thick + 6, background: false })
          continue
        }
        const R = c.r || 9 + Math.min(4, Math.abs(c.q) * 1.5)
        chargeDisk(m.x(c.x), m.y(c.y), R, c.q)
        addShape(m.x(c.x) - R, m.y(c.y) - R, 2 * R, 2 * R, BODY)
        if (c.label) label(m, c.x, c.y, c.label, { place: c.labelPlace || 'above-right', offset: R + 2, background: false })
      }
    }
    return { E, phi, line }
  }
