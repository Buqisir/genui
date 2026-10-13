// Sandbox runtime, part: Motion field regions, charged spheres, dimensions, rulers, axis.
  /** Point charge from a <Motion fields> entry: amber disk, ± sign, optional label. */
  function markCharge(m, c, text) {
    if (!c || !Number.isFinite(c.x) || !Number.isFinite(c.y) || !Number.isFinite(c.Q)) return
    const R = 9
    chargeDisk(m.x(c.x), m.y(c.y), R, c.Q)
    if (text) label(m, c.x, c.y, text, { place: 'above-right', offset: R + 2, background: false, auto: true })
  }

  function pointInRingPoly(x, y, pts) {
    let c = false
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0]
      const yi = pts[i][1]
      const xj = pts[j][0]
      const yj = pts[j][1]
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-30) + xi) c = !c
    }
    return c
  }

  /**
   * Field regions of a <Motion> (p.pt.fields): magnetic regions with the × / · marks,
   * electric regions as parallel arrows along `angle`, both when a region has both.
   * A ring (`inner`) draws the inner boundary and keeps marks between the two radii.
   * A radial field uses radial arrows; a point charge is a ± disk, and `{lines: true}`
   * (on the call or the entry) also traces its field lines.
   * Half-planes are clipped to the current view. Boundaries that are real edges of
   * the region are dashed; the view's own border is not.
   */
  function regions(m, motion, o = {}) {
    const list = motion && motion.fields
    if (!Array.isArray(list) || !list.length) return
    const view = {
      xmin: Math.min(m.ix(0), m.ix(cssW)),
      xmax: Math.max(m.ix(0), m.ix(cssW)),
      ymin: Math.min(m.iy(cssH), m.iy(0)),
      ymax: Math.max(m.iy(cssH), m.iy(0)),
    }
    const boundsOf = (reg) => {
      const X0 = Math.max(reg.xmin ?? -Infinity, view.xmin)
      const X1 = Math.min(reg.xmax ?? Infinity, view.xmax)
      const Y0 = Math.max(reg.ymin ?? -Infinity, view.ymin)
      const Y1 = Math.min(reg.ymax ?? Infinity, view.ymax)
      return { X0, X1, Y0, Y1 }
    }
    const circleOf = (reg) => (reg && reg.r > 0 && Number.isFinite(reg.cx) && Number.isFinite(reg.cy) ? reg : null)
    // Partial circle: from→to counter-clockwise. `to` may be past 360 so the arc does not wrap backwards.
    const sectorOf = (reg) => {
      const c = circleOf(reg)
      if (!c || !Number.isFinite(reg.from) || !Number.isFinite(reg.to)) return null
      let sweep = reg.to - reg.from
      if (Math.abs(sweep) < 1e-9) return null
      sweep = ((sweep % 360) + 360) % 360
      if (sweep < 1e-6 || sweep > 360 - 1e-6) return null
      return { cx: c.cx, cy: c.cy, r: c.r, from: reg.from, to: reg.from + sweep }
    }
    const authored = (reg) => (Array.isArray(reg.points) && reg.points.length >= 3 ? reg.points.map((p) => [p[0], p[1]]) : null)
    // Clip a polygon to the visible rectangle so symbols stay inside the frame.
    const clipPoly = (poly, box) => {
      const planes = [
        { inside: (p) => p[0] >= box.xmin - 1e-9, hit: (a, b) => { const t = (box.xmin - a[0]) / ((b[0] - a[0]) || 1e-30); return [box.xmin, a[1] + t * (b[1] - a[1])] } },
        { inside: (p) => p[0] <= box.xmax + 1e-9, hit: (a, b) => { const t = (box.xmax - a[0]) / ((b[0] - a[0]) || 1e-30); return [box.xmax, a[1] + t * (b[1] - a[1])] } },
        { inside: (p) => p[1] >= box.ymin - 1e-9, hit: (a, b) => { const t = (box.ymin - a[1]) / ((b[1] - a[1]) || 1e-30); return [a[0] + t * (b[0] - a[0]), box.ymin] } },
        { inside: (p) => p[1] <= box.ymax + 1e-9, hit: (a, b) => { const t = (box.ymax - a[1]) / ((b[1] - a[1]) || 1e-30); return [a[0] + t * (b[0] - a[0]), box.ymax] } },
      ]
      let cur = poly
      for (const h of planes) {
        if (!cur.length) break
        const next = []
        for (let i = 0; i < cur.length; i++) {
          const a = cur[i]
          const b = cur[(i + 1) % cur.length]
          const ain = h.inside(a)
          const bin = h.inside(b)
          if (ain && bin) next.push(b)
          else if (ain && !bin) next.push(h.hit(a, b))
          else if (!ain && bin) { next.push(h.hit(a, b)); next.push(b) }
        }
        cur = next
      }
      return cur
    }
    // Region ∩ view, as a polygon. A circle is sampled; corners and edge crossings are added so a semicircle stays convex.
    const sectorPoly = (sec) => {
      const n = Math.max(12, Math.ceil(sec.to - sec.from))
      const pts = [[sec.cx, sec.cy]]
      for (let i = 0; i <= n; i++) {
        const a = ((sec.from + ((sec.to - sec.from) * i) / n) * Math.PI) / 180
        pts.push([sec.cx + sec.r * Math.cos(a), sec.cy + sec.r * Math.sin(a)])
      }
      return clipPoly(pts, view)
    }
    const polygon = (reg) => {
      const raw = authored(reg)
      if (raw) return clipPoly(raw, view)
      const sec = sectorOf(reg)
      if (sec) return sectorPoly(sec)
      const { X0, X1, Y0, Y1 } = boundsOf(reg)
      if (!(X1 - X0 > 1e-9 && Y1 - Y0 > 1e-9)) return []
      const rect = [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]]
      const c = circleOf(reg)
      if (!c) return rect
      const { cx, cy, r } = c
      const pts = []
      const N = 96
      for (let i = 0; i < N; i++) {
        const a = (2 * Math.PI * i) / N
        const x = cx + r * Math.cos(a)
        const y = cy + r * Math.sin(a)
        if (x >= X0 - 1e-8 && x <= X1 + 1e-8 && y >= Y0 - 1e-8 && y <= Y1 + 1e-8) pts.push([x, y])
      }
      for (const p of rect) if ((p[0] - cx) ** 2 + (p[1] - cy) ** 2 <= r * r + 1e-6) pts.push(p)
      for (let i = 0; i < 4; i++) {
        const a = rect[i]
        const b = rect[(i + 1) % 4]
        const dx = b[0] - a[0]
        const dy = b[1] - a[1]
        const fx = a[0] - cx
        const fy = a[1] - cy
        const A = dx * dx + dy * dy
        const B = 2 * (fx * dx + fy * dy)
        const C = fx * fx + fy * fy - r * r
        const disc = B * B - 4 * A * C
        if (disc < 0 || A === 0) continue
        const s = Math.sqrt(disc)
        for (const t of [(-B - s) / (2 * A), (-B + s) / (2 * A)]) {
          if (t >= -1e-8 && t <= 1 + 1e-8) pts.push([a[0] + t * dx, a[1] + t * dy])
        }
      }
      pts.sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx))
      const out = []
      for (const p of pts) {
        const last = out[out.length - 1]
        if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) > 1e-6) out.push(p)
      }
      if (out.length > 2 && Math.hypot(out[0][0] - out[out.length - 1][0], out[0][1] - out[out.length - 1][1]) < 1e-6) out.pop()
      return out
    }
    const insidePoly = (x, y, pts) => {
      let c = false
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i]
        const [xj, yj] = pts[j]
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi + 0) + xi) c = !c
      }
      return c
    }
    // Roughly the centre of the largest circle that fits inside the polygon (grid search).
    const interiorPoint = (pts) => {
      const xs = pts.map((p) => p[0])
      const ys = pts.map((p) => p[1])
      const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
      const edgeDist = (x, y) => {
        let d = Infinity
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const [ax, ay] = pts[j]
          const [bx, by] = pts[i]
          const L2 = (bx - ax) ** 2 + (by - ay) ** 2
          const t = L2 > 0 ? Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / L2)) : 0
          d = Math.min(d, Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay)))
        }
        return d
      }
      let best = [(x0 + x1) / 2, (y0 + y1) / 2]
      let bestD = -1
      const N = 16
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          const x = x0 + ((x1 - x0) * (i + 0.5)) / N
          const y = y0 + ((y1 - y0) * (j + 0.5)) / N
          if (!insidePoly(x, y, pts)) continue
          const d = edgeDist(x, y)
          if (d > bestD) ((bestD = d), (best = [x, y]))
        }
      }
      return best
    }
    const tint = (pts, reg) => {
      if (pts.length < 3) return
      ctx.beginPath()
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(m.x(x), m.y(y)) : ctx.moveTo(m.x(x), m.y(y))))
      ctx.closePath()
      const hole = reg && reg.inner > 0 && Number.isFinite(reg.cx) && Number.isFinite(reg.cy)
      const holeSec = hole ? sectorOf(reg) : null
      if (holeSec) {
        // The outline is a pie wedge; a full inner circle would fill the part of it outside the wedge under evenodd.
        const n = Math.max(16, Math.ceil(holeSec.to - holeSec.from))
        ctx.moveTo(m.x(holeSec.cx), m.y(holeSec.cy))
        for (let i = 0; i <= n; i++) {
          const a = ((holeSec.from + ((holeSec.to - holeSec.from) * i) / n) * Math.PI) / 180
          ctx.lineTo(m.x(holeSec.cx + reg.inner * Math.cos(a)), m.y(holeSec.cy + reg.inner * Math.sin(a)))
        }
        ctx.closePath()
      } else if (hole) {
        const R = Math.abs(m.s(reg.inner))
        const X = m.x(reg.cx)
        const Y = m.y(reg.cy)
        ctx.moveTo(X + R, Y)
        ctx.arc(X, Y, R, 0, Math.PI * 2, true)
      }
      ctx.fillStyle = colors.field
      ctx.globalAlpha = night() ? 0.07 : 0.05
      if (hole) ctx.fill('evenodd')
      else ctx.fill()
      ctx.globalAlpha = 1
    }
    const strokeBounds = (reg) => {
      const sec = sectorOf(reg)
      if (sec) {
        ctx.save()
        ctx.globalAlpha = 0.7
        stroke({ color: colors.field, width: 1.15, dash: [5, 4] })
        ctx.beginPath()
        const n = Math.max(16, Math.ceil(sec.to - sec.from))
        if (!(reg.inner > 0)) {
          ctx.moveTo(m.x(sec.cx), m.y(sec.cy))
          for (let i = 0; i <= n; i++) {
            const a = ((sec.from + ((sec.to - sec.from) * i) / n) * Math.PI) / 180
            ctx.lineTo(m.x(sec.cx + sec.r * Math.cos(a)), m.y(sec.cy + sec.r * Math.sin(a)))
          }
          ctx.closePath()
        } else {
          const at = (r, deg) => {
            const a = (deg * Math.PI) / 180
            return [m.x(sec.cx + r * Math.cos(a)), m.y(sec.cy + r * Math.sin(a))]
          }
          const inn = reg.inner
          const start = at(inn, sec.from)
          ctx.moveTo(start[0], start[1])
          for (let i = 0; i <= n; i++) {
            const deg = sec.from + ((sec.to - sec.from) * i) / n
            const p = at(sec.r, deg)
            ctx.lineTo(p[0], p[1])
          }
          for (let i = n; i >= 0; i--) {
            const deg = sec.from + ((sec.to - sec.from) * i) / n
            const p = at(inn, deg)
            ctx.lineTo(p[0], p[1])
          }
          ctx.closePath()
        }
        ctx.stroke()
        ctx.restore()
        return
      }
      const raw = authored(reg)
      if (raw) {
        ctx.save()
        ctx.globalAlpha = 0.7
        stroke({ color: colors.field, width: 1.15, dash: [5, 4] })
        ctx.beginPath()
        raw.forEach((p, i) => (i ? ctx.lineTo(m.x(p[0]), m.y(p[1])) : ctx.moveTo(m.x(p[0]), m.y(p[1]))))
        ctx.closePath()
        ctx.stroke()
        ctx.restore()
        return
      }
      const { X0, X1, Y0, Y1 } = boundsOf(reg)
      if (!(X1 > X0 && Y1 > Y0)) return
      const c = circleOf(reg)
      ctx.save()
      ctx.globalAlpha = 0.7
      stroke({ color: colors.field, width: 1.15, dash: [5, 4] })
      const edge = (key, x1, y1, x2, y2) => {
        if (!Number.isFinite(reg[key])) return
        ctx.beginPath()
        ctx.moveTo(m.x(x1), m.y(y1))
        ctx.lineTo(m.x(x2), m.y(y2))
        ctx.stroke()
      }
      if (c) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(m.x(c.cx), m.y(c.cy), Math.abs(m.s(c.r)), 0, Math.PI * 2)
        ctx.clip()
      }
      edge('xmin', reg.xmin, Y0, reg.xmin, Y1)
      edge('xmax', reg.xmax, Y0, reg.xmax, Y1)
      edge('ymin', X0, reg.ymin, X1, reg.ymin)
      edge('ymax', X0, reg.ymax, X1, reg.ymax)
      if (c) ctx.restore()
      if (c) {
        ctx.save()
        const top = m.y(Y1)
        const bot = m.y(Y0)
        ctx.beginPath()
        ctx.rect(m.x(X0), Math.min(top, bot), m.x(X1) - m.x(X0), Math.abs(bot - top))
        ctx.clip()
        ctx.beginPath()
        ctx.arc(m.x(c.cx), m.y(c.cy), Math.abs(m.s(c.r)), 0, Math.PI * 2)
        ctx.stroke()
        if (reg.inner > 0) {
          ctx.beginPath()
          ctx.arc(m.x(c.cx), m.y(c.cy), Math.abs(m.s(reg.inner)), 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.restore()
      }
      ctx.restore()
    }
    const eLines = (pts, angle, reg) => {
      if (pts.length < 3 || !Number.isFinite(angle)) return
      const ang = (angle * Math.PI) / 180
      const dx = Math.cos(ang)
      const dy = Math.sin(ang)
      const px = -dy
      const py = dx
      let pmin = Infinity
      let pmax = -Infinity
      let tmin = Infinity
      let tmax = -Infinity
      for (const [x, y] of pts) {
        const p = x * px + y * py
        const t = x * dx + y * dy
        if (p < pmin) pmin = p
        if (p > pmax) pmax = p
        if (t < tmin) tmin = t
        if (t > tmax) tmax = t
      }
      const scale = Math.abs(m.s(1)) || 1
      let dp = (o.step || 34) / scale
      if ((pmax - pmin) / dp > 60) dp = (pmax - pmin) / 60
      if (!(dp > 0)) return
      ctx.save()
      ctx.beginPath()
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(m.x(x), m.y(y)) : ctx.moveTo(m.x(x), m.y(y))))
      ctx.closePath()
      ctx.clip()
      if (reg && reg.inner > 0 && Number.isFinite(reg.cx) && Number.isFinite(reg.cy)) {
        const R = Math.abs(m.s(reg.inner))
        const X = m.x(reg.cx)
        const Y = m.y(reg.cy)
        ctx.beginPath()
        ctx.rect(0, 0, cssW, cssH)
        ctx.moveTo(X + R, Y)
        ctx.arc(X, Y, R, 0, Math.PI * 2, true)
        ctx.clip('evenodd')
      }
      stroke({ color: colors.field, width: 1.15 })
      const shaft = 16 / scale
      for (let p = pmin + dp * 0.5; p < pmax - dp * 0.15; p += dp) {
        const x1 = px * p + dx * (tmin - dp)
        const y1 = py * p + dy * (tmin - dp)
        const x2 = px * p + dx * (tmax + dp)
        const y2 = py * p + dy * (tmax + dp)
        ctx.beginPath()
        ctx.moveTo(m.x(x1), m.y(y1))
        ctx.lineTo(m.x(x2), m.y(y2))
        ctx.stroke()
        const xc = px * p + dx * ((tmin + tmax) / 2)
        const yc = py * p + dy * ((tmin + tmax) / 2)
        if (!insidePoly(xc, yc, pts)) continue
        arrow(m, xc - dx * shaft, yc - dy * shaft, xc + dx * shaft * 0.15, yc + dy * shaft * 0.15, { color: colors.field, width: 1.2, head: 7, weight: BACKDROP })
      }
      ctx.restore()
    }
    // A switched or alternating field carries a timeline: draw the direction it has at this frame.
    const now = Number.isFinite(o.t) ? o.t : t
    // Switch instants are located to ~1e-12; at exactly t = t₀ the new direction already shows.
    const late = now + 1e-9 * Math.max(1, Math.abs(now))
    const atNow = (f) => {
      const tl = f.timeline
      if (!tl || !Array.isArray(tl.t) || !tl.t.length) return f
      let lo = 0
      let hi = tl.t.length - 1
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1
        if (tl.t[mid] <= late) lo = mid
        else hi = mid - 1
      }
      const g = { ...f }
      if (Array.isArray(tl.angle)) g.angle = tl.angle[lo] ?? undefined
      if (Array.isArray(tl.dir)) g.dir = tl.dir[lo] ?? undefined
      if (Array.isArray(tl.sign) && g.radial) g.radial = { ...g.radial, sign: tl.sign[lo] || 0 }
      return g
    }
    for (const f0 of list) {
      const f = atNow(f0)
      const reg = f.region || {}
      if (f.charge && !f.dir && !f.radial && !Number.isFinite(f.angle)) {
        if (Object.keys(reg).length) {
          tint(polygon(reg), reg)
          strokeBounds(reg)
        }
        continue
      }
      const pts = polygon(reg)
      if (f.dir === 'in' || f.dir === 'out') {
        const c = circleOf(reg)
        const { X0, X1, Y0, Y1 } = boundsOf(reg)
        const sec = sectorOf(reg)
        const full = !sec && c && c.cx - c.r >= X0 - 1e-6 && c.cx + c.r <= X1 + 1e-6 && c.cy - c.r >= Y0 - 1e-6 && c.cy + c.r <= Y1 + 1e-6
        if (sec) field(m, 0, 0, 0, 0, { sector: { x: sec.cx, y: sec.cy, r: sec.r, from: sec.from, to: sec.to, inner: reg.inner }, dir: f.dir, step: o.step || 32, border: false })
        else if (full || (c && reg.inner > 0)) field(m, 0, 0, 0, 0, { sector: { x: c.cx, y: c.cy, r: c.r, from: 0, to: 360, inner: reg.inner }, dir: f.dir, step: o.step || 32, border: false })
        else if (!authored(reg) && !c && pts.length === 4) field(m, pts[0][0], pts[0][1], pts[2][0], pts[2][1], { dir: f.dir, step: o.step || 32, border: false })
        else if (pts.length >= 3) field(m, 0, 0, 0, 0, { points: pts, dir: f.dir, step: o.step || 32, border: false })
      } else tint(pts, reg)
      // Name radialArrows is the magnetics helper. The region painter that used to
      // share it was unreachable: a later function declaration overwrote it.
      if (f.radial && Number.isFinite(f.radial.cx)) radialArrows(m, f.radial.cx, f.radial.cy, f.radial.sign, reg, o.step)
      else if (Number.isFinite(f.angle)) eLines(pts, f.angle, reg)
      strokeBounds(reg)
      if (f.label && pts.length && !f.charge) {
        const secL = sectorOf(reg)
        if (reg.inner > 0 && secL) {
          const midR = (secL.r + reg.inner) / 2
          const midA = (((secL.from + secL.to) / 2) * Math.PI) / 180
          label(m, secL.cx + midR * Math.cos(midA), secL.cy + midR * Math.sin(midA), f.label, { place: 'center', color: colors.field, auto: true })
        } else if (authored(reg) || secL) {
          // A band, wedge or L-shape has no tidy top edge; its label goes well inside it instead.
          const [lx, ly] = interiorPoint(pts)
          label(m, lx, ly, f.label, { place: 'center', color: colors.field, auto: true })
        } else {
          let lx = 0
          let ly = -Infinity
          for (const [x, y] of pts) if (y > ly) ((ly = y), (lx = x))
          label(m, lx, ly, f.label, { place: 'above', color: colors.field, background: false, auto: true })
        }
      }
    }
    const wantLines = !!(o.lines || list.some((f) => f.charge && f.charge.lines))
    if (wantLines) {
      const charges = []
      for (const f of list) {
        if (!f.charge || !Number.isFinite(f.charge.x) || !Number.isFinite(f.charge.y) || !Number.isFinite(f.charge.Q)) continue
        charges.push({ x: f.charge.x, y: f.charge.y, q: f.charge.Q })
      }
      if (charges.length) efield(m, charges, { charges: false, lines: true })
    }
    for (const f of list) if (f.charge) markCharge(m, f.charge, f.label)
  }

  /** Charged sphere: amber disk with a ± sign (amber is charge's colour). */
  function chargeDisk(X, Y, R, q) {
    withGlow(colors.charge, 10, () => {
      const g = ctx.createRadialGradient(X - R * 0.35, Y - R * 0.35, R * 0.1, X, Y, R)
      g.addColorStop(0, night() ? '#FFE29A' : '#FFD873')
      g.addColorStop(1, colors.charge)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(X, Y, R, 0, Math.PI * 2)
      ctx.fill()
    })
    if (R > 6) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.beginPath()
      ctx.ellipse(X - R * 0.38, Y - R * 0.42, R * 0.22, R * 0.14, -0.6, 0, Math.PI * 2)
      ctx.fill()
    }
    stroke({ color: night() ? '#000000' : colors.ink, width: R > 10 ? 1 : 0.85 })
    ctx.beginPath()
    ctx.arc(X, Y, R, 0, Math.PI * 2)
    ctx.stroke()
    ctx.strokeStyle = '#1F2329'
    ctx.lineWidth = 1.8
    ctx.beginPath()
    ctx.moveTo(X - R * 0.45, Y)
    ctx.lineTo(X + R * 0.45, Y)
    if (q > 0) {
      ctx.moveTo(X, Y - R * 0.45)
      ctx.lineTo(X, Y + R * 0.45)
    }
    ctx.stroke()
  }

  function dim(m, x1, y1, x2, y2, str, o = {}) {
    const X1 = m.x(x1)
    const Y1 = m.y(y1)
    const X2 = m.x(x2)
    const Y2 = m.y(y2)
    const len = Math.hypot(X2 - X1, Y2 - Y1)
    if (len < 1) return
    const off = o.offset ?? 14
    const nx = -(Y2 - Y1) / len
    const ny = (X2 - X1) / len
    const a = [X1 + nx * off, Y1 + ny * off]
    const b = [X2 + nx * off, Y2 + ny * off]
    const c = o.color || colors.graphite
    stroke({ color: c, width: 0.9 })
    ctx.beginPath()
    ctx.moveTo(a[0] - nx * 4, a[1] - ny * 4)
    ctx.lineTo(a[0] + nx * 4, a[1] + ny * 4)
    ctx.moveTo(b[0] - nx * 4, b[1] - ny * 4)
    ctx.lineTo(b[0] + nx * 4, b[1] + ny * 4)
    ctx.moveTo(a[0], a[1])
    ctx.lineTo(b[0], b[1])
    ctx.stroke()
    if (str) {
      const segs = segments(String(str))
      const w = measureSegs(segs, 12, 500) + 10
      const cx = (a[0] + b[0]) / 2
      const above = o.textPlace !== 'inline'
      const cy = above ? (a[1] + b[1]) / 2 - 12 : (a[1] + b[1]) / 2
      frameLabels.push({ x: cx - w / 2, y: cy - 9, w, h: 18 })
      // Keep names index-aligned with frameLabels so later overlap reports name the right label.
      layoutLabelTexts.push(String(str))
      if (!above) {
        ctx.fillStyle = colors.stage || colors.bg
        ctx.fillRect(cx - w / 2, cy - 9, w, 18)
      }
      ctx.fillStyle = c
      fillSegs(segs, cx - w / 2 + 5, cy, 12, 500)
    }
  }

  /** Ruler along y: major ticks with mono numbers, optional minor ticks. */
  // `body` puts the scale on an aluminium strip (a real ruler); axes reuse this without one.
  function ruler(m, x1, x2, y, o = {}) {
    if (!+o.angle) return flatRuler(m, x1, x2, y, o, true)
    // Tilted ruler: draw it flat, turned about (x1, y). Lengths along it only read true in an equal view.
    const a = (+o.angle * Math.PI) / 180
    const ox = m.x(x1)
    const oy = m.y(y)
    ctx.save()
    ctx.translate(ox, oy)
    ctx.rotate(-a)
    ctx.translate(-ox, -oy)
    const box = flatRuler(m, x1, x2, y, o, false)
    ctx.restore()
    if (box) {
      const c = Math.cos(a)
      const sn = Math.sin(a)
      const pts = [[box.L, box.T], [box.R, box.T], [box.R, box.B], [box.L, box.B]].map(([X, Y]) => [ox + (X - ox) * c + (Y - oy) * sn, oy - (X - ox) * sn + (Y - oy) * c])
      const xs = pts.map((q) => q[0])
      const ys = pts.map((q) => q[1])
      addShape(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), BACKDROP)
    }
  }

  function flatRuler(m, x1, x2, y, o, register) {
    const step = o.step || 1
    const minor = o.minor || 0
    const c = o.color || (o.body ? colors.graphite : colors.steel)
    const Y = m.y(y)
    let box = null
    if (o.body) {
      ctx.font = font(10.5, 500, 'mono')
      const unitW = o.unit ? ctx.measureText(o.unit).width + 16 : 0
      const L = Math.min(m.x(x1), m.x(x2)) - 9
      const R = Math.max(m.x(x1), m.x(x2)) + 9 + unitW
      craft.solidRect(ctx, L, Y - 12, R - L, 32, 'alu', theme, { band: 2, r: 2 })
      if (register) addShape(L, Y - 12, R - L, 32, BACKDROP)
      box = { L, R, T: Y - 12, B: Y + 20 }
    }
    stroke({ color: c, width: 1 })
    ctx.beginPath()
    ctx.moveTo(m.x(x1), Y)
    ctx.lineTo(m.x(x2), Y)
    ctx.stroke()
    if (minor) {
      ctx.beginPath()
      for (let k = Math.ceil(x1 / minor - 1e-9) * minor; k <= x2 + 1e-9; k += minor) {
        ctx.moveTo(m.x(k), Y)
        ctx.lineTo(m.x(k), Y - 4)
      }
      ctx.stroke()
    }
    ctx.font = font(10.5, 500, 'mono')
    ctx.fillStyle = c
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const first = Math.ceil(x1 / step - 1e-9) * step
    const ticks = []
    for (let k = first; k <= x2 + 1e-9 && ticks.length < 200; k += step) ticks.push(k)
    ctx.beginPath()
    for (const k of ticks) {
      ctx.moveTo(m.x(k), Y)
      ctx.lineTo(m.x(k), Y - 8)
    }
    ctx.stroke()
    for (const k of ticks) ctx.fillText(String(+k.toFixed(6)), m.x(k), Y + 6)
    if (o.unit && ticks.length) {
      ctx.textAlign = 'left'
      ctx.fillText(o.unit, m.x(ticks[ticks.length - 1]) + 12, Y + 6)
    }
    return box
  }

  function axisX(m, o = {}) {
    const y = o.y ?? 0
    const step = o.step || 1
    const from = o.from ?? Math.ceil(m.ix(0) / step) * step
    const to = o.to ?? m.ix(cssW)
    ruler(m, from, to, y, { step, unit: o.unit })
  }
