// Sandbox runtime, part: uniform field markers (v.field).
  // ---------- annotation ----------

  /**
   * Uniform magnetic field marks: 'in' = ×, 'out' = ⊙. Spacing is in pixels.
   * The region is the box (x1, y1)–(x2, y2) unless `shape` says otherwise:
   * 'circle' (inscribed in the box), 'ring' (circle minus a hole of radius `inner`),
   * or `points: [[x, y], ...]` for any polygon (triangle, half-plane strip, sector).
   */
  function field(m, x1, y1, x2, y2, o = {}) {
    const step = o.step || 36
    const c = o.color || colors.field
    let X1 = Math.min(m.x(x1), m.x(x2))
    let X2 = Math.max(m.x(x1), m.x(x2))
    let Y1 = Math.min(m.y(y1), m.y(y2))
    let Y2 = Math.max(m.y(y1), m.y(y2))
    const sec = o.sector
    let pts = Array.isArray(o.points) && o.points.length > 2 ? o.points.map(([x, y]) => [m.x(x), m.y(y)]) : null
    if (sec) {
      // Sector (or annular sector) about (x, y); angles in degrees, counter-clockwise.
      const a1 = ((sec.from ?? 0) * Math.PI) / 180
      const a2 = ((sec.to ?? 90) * Math.PI) / 180
      const n = Math.max(8, Math.ceil(Math.abs(a2 - a1) / 0.05))
      const arc = (r) => Array.from({ length: n + 1 }, (_, i) => {
        const a = a1 + ((a2 - a1) * i) / n
        return [m.x(sec.x + r * Math.cos(a)), m.y(sec.y + r * Math.sin(a))]
      })
      pts = sec.inner > 0 ? [...arc(sec.r), ...arc(sec.inner).reverse()] : [[m.x(sec.x), m.y(sec.y)], ...arc(sec.r)]
    }
    if (pts) {
      X1 = Math.min(...pts.map((p) => p[0]))
      X2 = Math.max(...pts.map((p) => p[0]))
      Y1 = Math.min(...pts.map((p) => p[1]))
      Y2 = Math.max(...pts.map((p) => p[1]))
    }
    const shaped = !!pts || o.shape === 'circle' || o.shape === 'ring'
    const region = new Path2D()
    if (pts) {
      pts.forEach(([X, Y], i) => (i ? region.lineTo(X, Y) : region.moveTo(X, Y)))
      region.closePath()
    } else if (shaped) {
      const R = Math.min(X2 - X1, Y2 - Y1) / 2
      const cx = (X1 + X2) / 2
      const cy = (Y1 + Y2) / 2
      region.arc(cx, cy, R, 0, Math.PI * 2)
      if (o.shape === 'ring' && o.inner > 0) {
        region.moveTo(cx + m.s(o.inner), cy)
        region.arc(cx, cy, m.s(o.inner), 0, Math.PI * 2, true)
      }
    } else region.rect(X1, Y1, X2 - X1, Y2 - Y1)
    if (o.tint !== false) {
      ctx.fillStyle = c
      ctx.globalAlpha = night() ? 0.07 : 0.05
      ctx.fill(region, 'evenodd')
      ctx.globalAlpha = 1
    }
    if ((shaped || o.outline) && o.border !== false) {
      ctx.save()
      ctx.globalAlpha = 0.55
      stroke({ color: c, width: 1.1, dash: o.dash ?? (shaped ? [5, 4] : undefined) })
      ctx.stroke(region)
      ctx.restore()
    }
    const nx = Math.max(1, Math.floor((X2 - X1) / step))
    const ny = Math.max(1, Math.floor((Y2 - Y1) / step))
    const gx = (X2 - X1) / nx
    const gy = (Y2 - Y1) / ny
    ctx.strokeStyle = c
    ctx.fillStyle = c
    ctx.lineWidth = 1.3
    ctx.setLineDash([])
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        const cx = X1 + gx * (i + 0.5)
        const cy = Y1 + gy * (j + 0.5)
        // isPointInPath takes device pixels; the whole mark must fit inside the region.
        const dpr = window.devicePixelRatio || 1
        if (shaped && [[0, 0], [-6, -6], [6, -6], [-6, 6], [6, 6]].some(([dx, dy]) => !ctx.isPointInPath(region, (cx + dx) * dpr, (cy + dy) * dpr, 'evenodd'))) continue
        ctx.beginPath()
        if (o.dir === 'out') {
          ctx.arc(cx, cy, 5, 0, Math.PI * 2)
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(cx, cy, 1.6, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.moveTo(cx - 4, cy - 4)
          ctx.lineTo(cx + 4, cy + 4)
          ctx.moveTo(cx - 4, cy + 4)
          ctx.lineTo(cx + 4, cy - 4)
          ctx.stroke()
        }
      }
    }
  }
