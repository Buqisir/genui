// Sandbox runtime, part: optics benches and rays.
  /**
   * Media, mirrors, screens and rays from an <Optics> payload (`v.optics(m, p.lt)`).
   * Reflected branches are thinner; opacity follows intensity, with a floor so weak rays stay visible.
   */
  function optics(m, src, o = {}) {
    const data = src && src.__optics && Array.isArray(src.__optics.rays) ? src.__optics : null
    if (!data) return
    const want = Array.isArray(o.rays) ? new Set(o.rays.map(String)) : null
    const css = (name) => {
      if (!name) return '#D4534A'
      const map = {
        red: '#D4534A', green: '#2F9D57', blue: '#3B6FD8', violet: '#7A45D6', purple: '#7A45D6',
        orange: '#E07B2F', yellow: '#C9A227', cyan: '#2A9AAA', magenta: '#C43D78', white: '#F3F5F7', black: '#222222',
      }
      return map[String(name).toLowerCase()] || String(name)
    }
    const sweep = (a1, a2) => {
      const raw = a2 - a1
      if (Math.abs(raw) < 1e-9) return 0
      const mod = ((raw % 360) + 360) % 360
      return mod < 1e-6 ? 360 : mod
    }
    const sy = m.sy || m.s
    const piecePts = (pc) => {
      if (!pc) return []
      if (pc.line) return [[pc.line[0], pc.line[1]], [pc.line[2], pc.line[3]]]
      if (!pc.arc || !(pc.arc[2] > 0)) return []
      const cx = pc.arc[0]
      const cy = pc.arc[1]
      const r = pc.arc[2]
      const a1 = pc.arc[3]
      const a2 = pc.arc[4]
      const sw = sweep(a1, a2)
      const pxR = (Math.abs(m.s(r)) + Math.abs(sy(r))) / 2
      const n = Math.max(8, Math.min(480, Math.ceil(((sw * Math.PI) / 180) * pxR / 3)))
      const pts = []
      for (let i = 0; i <= n; i++) {
        const a = ((a1 + (sw * i) / n) * Math.PI) / 180
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
      }
      return pts
    }
    const strokePts = (pts, style) => {
      if (pts.length < 2) return
      stroke(style)
      ctx.beginPath()
      let moved = false
      for (const p of pts) {
        const X = m.x(p[0])
        const Y = m.y(p[1])
        if (!Number.isFinite(X) || !Number.isFinite(Y)) continue
        if (!moved) ctx.moveTo(X, Y)
        else ctx.lineTo(X, Y)
        moved = true
      }
      if (moved) ctx.stroke()
      ctx.setLineDash([])
    }
    const pix = (x, y, dx, dy) => {
      const X0 = m.x(x)
      const Y0 = m.y(y)
      const X1 = m.x(x + dx)
      const Y1 = m.y(y + dy)
      const L = Math.hypot(X1 - X0, Y1 - Y0) || 1
      return { ux: (X1 - X0) / L, uy: (Y1 - Y0) / L, ang: Math.atan2(Y1 - Y0, X1 - X0) }
    }
    const fmtDeg = (d) => (Math.abs(d - Math.round(d)) < 0.05 ? String(Math.round(d)) : (+d).toFixed(1))
    const angleArc = (X, Y, a0, a1, radius, color, text) => {
      let dlt = a1 - a0
      while (dlt > Math.PI) dlt -= 2 * Math.PI
      while (dlt < -Math.PI) dlt += 2 * Math.PI
      if (!(Math.abs(dlt) > 0.02) || !(radius > 0)) return
      const n = Math.max(4, Math.ceil(Math.abs(dlt) / 0.18))
      stroke({ color, width: 1 })
      ctx.beginPath()
      for (let i = 0; i <= n; i++) {
        const a = a0 + (dlt * i) / n
        const Xa = X + Math.cos(a) * radius
        const Ya = Y + Math.sin(a) * radius
        if (i) ctx.lineTo(Xa, Ya)
        else ctx.moveTo(Xa, Ya)
      }
      ctx.stroke()
      ctx.setLineDash([])
      const mid = a0 + dlt / 2
      pendingLabels.push([X + Math.cos(mid) * (radius + 11), Y + Math.sin(mid) * (radius + 11), text, { size: 11, color, background: false }])
    }
    if (o.media !== false) {
      for (const med of data.media || []) {
        ctx.save()
        ctx.globalAlpha = night() ? 0.22 : 0.42
        ctx.beginPath()
        for (const loop of med.loops || []) {
          let moved = false
          for (const p of loop) {
            const X = m.x(p[0])
            const Y = m.y(p[1])
            if (!Number.isFinite(X) || !Number.isFinite(Y)) continue
            if (!moved) ctx.moveTo(X, Y)
            else ctx.lineTo(X, Y)
            moved = true
          }
          if (moved) ctx.closePath()
        }
        let minX = Infinity
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity
        for (const loop of med.loops || []) {
          for (const p of loop) {
            const X = m.x(p[0])
            const Y = m.y(p[1])
            if (!Number.isFinite(X) || !Number.isFinite(Y)) continue
            minX = Math.min(minX, X)
            maxX = Math.max(maxX, X)
            minY = Math.min(minY, Y)
            maxY = Math.max(maxY, Y)
          }
        }
        const base = med.color ? css(med.color) : night() ? '#9BB4D6' : '#B7D0E6'
        if (Number.isFinite(minY) && maxY > minY) {
          // Glass body: lighter at the top, a little denser toward the foot, plus two
          // faint diagonal sheens so a brick or prism reads as a solid, not a flat tint.
          const W = maxX - minX
          const H = maxY - minY
          const g = ctx.createLinearGradient(0, minY, 0, maxY)
          g.addColorStop(0, night() ? base : '#DCE8F2')
          g.addColorStop(0.55, base)
          g.addColorStop(1, base)
          ctx.fillStyle = med.color ? base : g
          ctx.fill('evenodd')
          ctx.clip('evenodd')
          ctx.globalAlpha = night() ? 0.08 : 0.45
          ctx.fillStyle = '#FFFFFF'
          const band = (x0, x1, skew) => {
            ctx.beginPath()
            ctx.moveTo(minX + W * x0, minY)
            ctx.lineTo(minX + W * x1, minY)
            ctx.lineTo(minX + W * x1 - skew, maxY)
            ctx.lineTo(minX + W * x0 - skew, maxY)
            ctx.closePath()
            ctx.fill()
          }
          const skew = Math.min(W * 0.18, H * 0.5)
          band(0.2, 0.3, skew)
          ctx.globalAlpha *= 0.6
          band(0.36, 0.39, skew)
        } else {
          ctx.fillStyle = base
          ctx.fill('evenodd')
        }
        ctx.restore()
        if (Number.isFinite(minX)) addShape(minX, minY, Math.max(1, maxX - minX), Math.max(1, maxY - minY), BACKDROP)
        for (const pc of med.outline || []) strokePts(piecePts(pc), { color: colors.ink, width: 1.25 })
        for (const pc of med.silver || []) {
          const pts = piecePts(pc)
          strokePts(pts, { color: colors.ink, width: 2.6 })
          if (pts.length < 2) continue
          stroke({ color: colors.ink, width: 1 })
          ctx.beginPath()
          let acc = 0
          for (let i = 1; i < pts.length; i++) {
            const X1 = m.x(pts[i - 1][0])
            const Y1 = m.y(pts[i - 1][1])
            const X2 = m.x(pts[i][0])
            const Y2 = m.y(pts[i][1])
            const d = Math.hypot(X2 - X1, Y2 - Y1)
            if (!Number.isFinite(d)) continue
            acc += d
            if (acc < 8) continue
            acc = 0
            let hx = 0
            let hy = 0
            if (pc.arc) {
              const sign = pc.radial || 1
              const dir = pix(pts[i][0], pts[i][1], sign * (pts[i][0] - pc.arc[0]), sign * (pts[i][1] - pc.arc[1]))
              hx = dir.ux
              hy = dir.uy
            } else if (Number.isFinite(pc.hx) && Number.isFinite(pc.hy)) {
              const dir = pix(pts[i][0], pts[i][1], pc.hx, pc.hy)
              hx = dir.ux
              hy = dir.uy
            }
            ctx.moveTo(X2, Y2)
            ctx.lineTo(X2 + hx * 6, Y2 + hy * 6)
          }
          ctx.stroke()
          ctx.setLineDash([])
        }
        if (med.label) label(m, med.lx, med.ly, med.label, { place: 'above', offset: 6, background: false })
      }
      for (const pc of data.mirrors || []) {
        const pts = piecePts(pc)
        strokePts(pts, { color: colors.ink, width: 2.4 })
        if (pts.length < 2) continue
        stroke({ color: colors.ink, width: 1 })
        ctx.beginPath()
        let acc = 0
        for (let i = 1; i < pts.length; i++) {
          const X1 = m.x(pts[i - 1][0])
          const Y1 = m.y(pts[i - 1][1])
          const X2 = m.x(pts[i][0])
          const Y2 = m.y(pts[i][1])
          const d = Math.hypot(X2 - X1, Y2 - Y1)
          if (!Number.isFinite(d)) continue
          acc += d
          if (acc < 8) continue
          acc = 0
          const tx = (X2 - X1) / (d || 1)
          const ty = (Y2 - Y1) / (d || 1)
          ctx.moveTo(X2 - ty * 5, Y2 + tx * 5)
          ctx.lineTo(X2 + ty * 5, Y2 - tx * 5)
        }
        ctx.stroke()
        ctx.setLineDash([])
      }
      for (const sc of data.screens || []) {
        if (!sc.line) continue
        const pts = piecePts(sc)
        strokePts(pts, { color: colors.graphite || colors.steel, width: 1.6 })
        const X1 = m.x(sc.line[0])
        const Y1 = m.y(sc.line[1])
        const X2 = m.x(sc.line[2])
        const Y2 = m.y(sc.line[3])
        const d = Math.hypot(X2 - X1, Y2 - Y1) || 1
        const tx = (X2 - X1) / d
        const ty = (Y2 - Y1) / d
        stroke({ color: colors.graphite || colors.steel, width: 1.4 })
        ctx.beginPath()
        for (const [X, Y] of [[X1, Y1], [X2, Y2]]) {
          ctx.moveTo(X - ty * 5, Y + tx * 5)
          ctx.lineTo(X + ty * 5, Y - tx * 5)
        }
        ctx.stroke()
        ctx.setLineDash([])
        if (sc.name) label(m, (sc.line[0] + sc.line[2]) / 2, (sc.line[1] + sc.line[3]) / 2, sc.name, { place: 'above', offset: 8, background: false })
      }
    }
    const rays = (data.rays || []).filter((r) => !want || want.has(String(r.name)))
    const drawRay = (ray, branch) => {
      const color = css(ray.color)
      for (const seg of ray.segments || []) {
        if (!!seg.branch !== branch) continue
        const X1 = m.x(seg.x1)
        const Y1 = m.y(seg.y1)
        const X2 = m.x(seg.x2)
        const Y2 = m.y(seg.y2)
        const L = Math.hypot(X2 - X1, Y2 - Y1)
        if (!(L > 0.5) || !Number.isFinite(L)) continue
        const alpha = Math.max(0.25, Math.min(1, (Number(seg.I) || 0) * (branch ? 0.8 : 1)))
        ctx.save()
        ctx.globalAlpha = alpha
        stroke({ color, width: branch ? 1.05 : 1.8 })
        ctx.beginPath()
        ctx.moveTo(X1, Y1)
        ctx.lineTo(X2, Y2)
        ctx.stroke()
        ctx.setLineDash([])
        if (L > 26) {
          const ux = (X2 - X1) / L
          const uy = (Y2 - Y1) / L
          headPx((X1 + X2) / 2, (Y1 + Y2) / 2, ux, uy, branch ? 7 : 9, color)
        }
        for (let s = 0; s <= L; s += 10) addShape(X1 + ((X2 - X1) * s) / L - 2, Y1 + ((Y2 - Y1) * s) / L - 2, 4, 4)
        ctx.restore()
      }
    }
    for (const ray of rays) drawRay(ray, true)
    for (const ray of rays) {
      drawRay(ray, false)
      if (o.labels) label(m, ray.x0, ray.y0, ray.label || ray.name, { place: 'left', offset: 8, background: false })
      if (!o.normals && !o.angles) continue
      const color = css(ray.color)
      for (const h of ray.hits || []) {
        if (![h.x, h.y, h.nx, h.ny].every(Number.isFinite)) continue
        const X = m.x(h.x)
        const Y = m.y(h.y)
        const N = pix(h.x, h.y, h.nx, h.ny)
        if (o.normals) {
          stroke({ color: colors.graphite || colors.steel, width: 1, dash: [3, 3] })
          ctx.beginPath()
          ctx.moveTo(X - N.ux * 16, Y - N.uy * 16)
          ctx.lineTo(X + N.ux * 16, Y + N.uy * 16)
          ctx.stroke()
          ctx.setLineDash([])
        }
        if (!o.angles) continue
        if (h.i > 0.8 && Number.isFinite(h.dx)) {
          const back = pix(h.x, h.y, -h.dx, -h.dy)
          angleArc(X, Y, back.ang, N.ang, 15, color, fmtDeg(h.i) + '°')
        }
        if (h.r > 0.8 && h.tx !== null && h.tx !== undefined && Number.isFinite(h.tx)) {
          const fwd = pix(h.x, h.y, h.tx, h.ty)
          const n2 = pix(h.x, h.y, -h.nx, -h.ny)
          angleArc(X, Y, fwd.ang, n2.ang, 24, color, fmtDeg(h.r) + '°')
        }
      }
    }
  }

  function ray(m, pts, o = {}) {
    path(m, pts, { color: o.color || colors.charge, width: o.width || 1.6, glow: 10, dash: o.dash })
    for (let i = 0; i < pts.length - 1; i++) {
      const X1 = m.x(pts[i][0])
      const Y1 = m.y(pts[i][1])
      const X2 = m.x(pts[i + 1][0])
      const Y2 = m.y(pts[i + 1][1])
      const L = Math.hypot(X2 - X1, Y2 - Y1)
      for (let s = 0; s <= L; s += 8) addShape(X1 + ((X2 - X1) * s) / L - 2, Y1 + ((Y2 - Y1) * s) / L - 2, 4, 4)
    }
    if (o.arrows !== false && pts.length > 1) {
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, ay] = pts[i]
        const [bx, by] = pts[i + 1]
        const mx = (ax + bx) / 2
        const my = (ay + by) / 2
        const L = Math.hypot(m.x(bx) - m.x(ax), m.y(by) - m.y(ay))
        if (L < 40) continue
        const ux = (m.x(bx) - m.x(ax)) / L
        const uy = (m.y(by) - m.y(ay)) / L
        arrowPx(m.x(mx) - ux * 5, m.y(my) - uy * 5, m.x(mx) + ux * 5, m.y(my) + uy * 5, { color: o.color || colors.charge, width: 1.4, head: 7 })
      }
    }
  }
