// Sandbox runtime, part: gas dots, vessels and glassware, conveyor.
  const hash = (i, a, b) => Math.abs((Math.sin(i * a + b) * 43758.5453) % 1)

  /**
   * Gas as a tint plus jittering molecules spread by area over rectangular regions
   * {a0, a1, b0, b1} in some local frame; P maps local (a, b) to pixels and k is px
   * per local unit. Molecule count stays fixed, so compression reads as crowding.
   */
  function gasDots(P, regions, g, k, pathOf, inside) {
    const area = regions.reduce((sum, r) => sum + (r.a1 - r.a0) * (r.b1 - r.b0), 0)
    if (!(area > 0)) return
    ctx.save()
    ctx.globalAlpha = Math.min(0.32, 0.1 * (g.density ?? 1))
    ctx.fillStyle = g.color ? kindColor(g.color) : colors.steel
    for (const r of regions) {
      pathOf(r)
      ctx.fill()
    }
    ctx.restore()
    const n = g.count ?? 70
    if (n <= 0) return
    ambient = true
    const now = performance.now() / 1000
    const spacing = Math.sqrt(area / n)
    const speed = 0.8 * Math.sqrt(g.temp ?? 1)
    const dot = g.dot ?? 1.9
    ctx.fillStyle = g.color ? kindColor(g.color) : colors.graphite
    for (let i = 0; i < n; i++) {
      const fa = hash(i, 12.9898, 1.3)
      const fb = hash(i, 78.233, 4.1)
      let target = ((i + fa) / n) * area
      let reg = regions[regions.length - 1]
      for (const r of regions) {
        const ra = (r.a1 - r.a0) * (r.b1 - r.b0)
        if (target <= ra) {
          reg = r
          break
        }
        target -= ra
      }
      const span = reg.b1 - reg.b0
      const pad = Math.min((dot * 1.6) / k, span * 0.15)
      let a = reg.a0 + Math.min(target / span, reg.a1 - reg.a0)
      let b = reg.b0 + fb * span
      const ph = i * 2.39996
      a += Math.sin(now * speed * (1.1 + fa) + ph) * spacing * 0.45
      b += Math.cos(now * speed * (0.9 + fb) + ph * 1.7) * spacing * 0.45
      // Curved cavities pass `inside` so the fixed count stays in the vessel, not the bounding box.
      if (inside && !inside(a, b)) {
        let placed = false
        for (let tries = 1; tries <= 8 && !placed; tries++) {
          const aa = reg.a0 + hash(i, 12.9898, 1.3 + tries * 2.1) * (reg.a1 - reg.a0)
          const bb = reg.b0 + hash(i, 78.233, 4.1 + tries * 1.7) * (reg.b1 - reg.b0)
          if (inside(aa, bb)) {
            a = aa
            b = bb
            placed = true
          }
        }
        if (!placed) continue
      }
      a = Math.min(Math.max(a, reg.a0 + pad), reg.a1 - pad)
      b = Math.min(Math.max(b, reg.b0 + pad), reg.b1 - pad)
      const [X, Y] = P(a, b)
      ctx.beginPath()
      ctx.arc(X, Y, dot, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  function rectMouths(parts) {
    const openings = []
    for (const r of parts || []) {
      if (!r || r.x1 == null || r.open == null) continue
      const x1 = Math.min(r.x1, r.x2)
      const x2 = Math.max(r.x1, r.x2)
      const y1 = Math.min(r.y1, r.y2)
      const y2 = Math.max(r.y1, r.y2)
      if (r.open === 'top') openings.push({ x: (x1 + x2) / 2, y: y2, w: x2 - x1, side: 'top' })
      else if (r.open === 'bottom') openings.push({ x: (x1 + x2) / 2, y: y1, w: x2 - x1, side: 'bottom' })
      else if (r.open === 'left') openings.push({ x: x1, y: (y1 + y2) / 2, w: y2 - y1, side: 'left' })
      else if (r.open === 'right') openings.push({ x: x2, y: (y1 + y2) / 2, w: y2 - y1, side: 'right' })
    }
    return { mouth: openings[0] || null, openings }
  }

  // Glass walls are the craft glass edge tint pre-mixed over the stage: opaque, because parts of a
  // U-tube or manifold overlap and a translucent fill would darken the joints.
  const glassWall = () => (night() ? '#627A82' : '#93A4AA')
  const glassCavity = () => (night() ? '#151A21' : '#F4F8FA')

  /**
   * Flask, bottle, cupping jar, capillary. Outlines come from vesselLayout
   * (sandbox prelude). Overlapping parts are unioned by filling every glass
   * polygon and then every cavity. Volumes are not computed here.
   */
  function vesselShaped(m, parts, o = {}) {
    const wall = o.wall ?? 3
    const k = Math.abs(m.s(1)) || 1
    const layout = vesselLayout(parts, wall / k, (wall + 1) / k)
    const trace = (poly) => {
      poly.forEach(([x, y], i) => {
        const X = m.x(x)
        const Y = m.y(y)
        i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y)
      })
      ctx.closePath()
    }
    const fillPx = (r) => {
      const X1 = Math.min(m.x(r.x1), m.x(r.x2))
      const X2 = Math.max(m.x(r.x1), m.x(r.x2))
      const Y1 = Math.min(m.y(r.y1), m.y(r.y2))
      const Y2 = Math.max(m.y(r.y1), m.y(r.y2))
      return [X1, Y1, X2 - X1, Y2 - Y1]
    }
    ctx.save()
    ctx.fillStyle = glassWall()
    for (const part of layout.parts) {
      for (const g of part.glass) {
        ctx.beginPath()
        trace(g)
        ctx.fill()
      }
    }
    ctx.fillStyle = glassCavity()
    for (const part of layout.parts) {
      for (const c of part.draw) {
        ctx.beginPath()
        trace(c)
        ctx.fill()
      }
    }
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const part of layout.parts) {
      for (const g of part.glass) {
        for (const [x, y] of g) {
          const X = m.x(x)
          const Y = m.y(y)
          if (X < minX) minX = X
          if (Y < minY) minY = Y
          if (X > maxX) maxX = X
          if (Y > maxY) maxY = Y
        }
      }
    }
    if (maxX > minX && maxY > minY) addShape(minX, minY, maxX - minX, maxY - minY)
    ctx.beginPath()
    for (const part of layout.parts) for (const c of part.draw) trace(c)
    ctx.clip('nonzero')
    const cavities = layout.parts.flatMap((part) => part.cavity)
    for (const f of o.fills || []) {
      const [X, Y, W, H] = fillPx(f)
      if (W <= 0 || H <= 0) continue
      if (f.kind === 'gas') {
        const P = (a, b) => [m.x(a), m.y(b)]
        const region = { a0: Math.min(f.x1, f.x2), a1: Math.max(f.x1, f.x2), b0: Math.min(f.y1, f.y2), b1: Math.max(f.y1, f.y2) }
        gasDots(
          P,
          [region],
          f,
          k,
          () => {
            ctx.beginPath()
            ctx.rect(X, Y, W, H)
          },
          (a, b) => insideAny(a, b, cavities),
        )
        continue
      }
      const wide = W > H * 1.5
      const grad = wide ? ctx.createLinearGradient(0, Y, 0, Y + H) : ctx.createLinearGradient(X, 0, X + W, 0)
      if (f.kind === 'water') {
        grad.addColorStop(0, night() ? 'rgba(110,155,255,0.22)' : 'rgba(120,160,210,0.30)')
        grad.addColorStop(1, night() ? 'rgba(110,155,255,0.12)' : 'rgba(120,160,210,0.18)')
      } else {
        grad.addColorStop(0, night() ? '#4C5057' : '#8E9298')
        grad.addColorStop(0.35, night() ? '#B9BDC4' : '#F1F2F4')
        grad.addColorStop(0.6, night() ? '#7E838B' : '#B9BCC1')
        grad.addColorStop(1, night() ? '#3E4248' : '#7B7F85')
      }
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.rect(X, Y, W, H)
      // A capillary is only a few pixels wide; the rectangle-vessel curve would read as a flat cut.
      // ellipse() joins the current subpath, so moveTo first or the carve welds to the rectangle.
      const bulge = Math.min(Math.max(W * 0.5, 4.5), 8) * (f.kind === 'water' ? -1 : 1)
      const meniscus = f.meniscus === 'top' || f.meniscus === 'bottom'
      if (meniscus && W > 0) {
        const cx = X + W / 2
        const cy = f.meniscus === 'top' ? Y : Y + H
        const ry = Math.abs(bulge)
        const a0 = f.meniscus === 'top' ? (bulge > 0 ? Math.PI : 0) : bulge > 0 ? 0 : Math.PI
        ctx.moveTo(cx + (W / 2) * Math.cos(a0), cy + ry * Math.sin(a0))
        ctx.ellipse(cx, cy, W / 2, ry, 0, a0, a0 + Math.PI)
      }
      ctx.fill(bulge < 0 ? 'evenodd' : 'nonzero')
      if (meniscus && W > 1) {
        const cx = X + W / 2
        const cy = f.meniscus === 'top' ? Y : Y + H
        const ry = Math.abs(bulge)
        const a0 = f.meniscus === 'top' ? (bulge > 0 ? Math.PI : 0) : bulge > 0 ? 0 : Math.PI
        ctx.beginPath()
        ctx.ellipse(cx, cy, W / 2, ry, 0, a0, a0 + Math.PI)
        ctx.strokeStyle = f.kind === 'water' ? (night() ? 'rgba(170,200,245,0.9)' : 'rgba(60,100,150,0.65)') : night() ? 'rgba(230,234,238,0.9)' : 'rgba(55,58,64,0.85)'
        ctx.lineWidth = 1.35
        ctx.stroke()
      }
    }
    ctx.strokeStyle = 'rgba(255,255,255,' + (night() ? 0.18 : 0.75) + ')'
    ctx.lineWidth = 1.6
    for (const p of parts) {
      if (!p || !p.flask || !(Math.abs(m.s(p.flask.r)) > 4)) continue
      const R = Math.abs(m.s(p.flask.r))
      ctx.beginPath()
      ctx.arc(m.x(p.flask.cx) - R * 0.28, m.y(p.flask.cy), R * 0.62, -2.4, -0.8)
      ctx.stroke()
    }
    ctx.restore()
    const mouth = layout.mouth ? { x: layout.mouth.x, y: layout.mouth.y, w: layout.mouth.w, side: layout.mouth.side } : null
    return { mouth, openings: layout.openings.map((op) => ({ x: op.x, y: op.y, w: op.w, side: op.side })) }
  }

  /**
   * Glass vessel made of axis-aligned cavities (physical rects {x1, y1, x2, y2},
   * open: 'top' | 'bottom' | 'left' | 'right'). Walls are drawn by filling every
   * cavity grown by the wall thickness and then carving the cavities out, so
   * U-tubes and manifolds get one clean outline. fills: [{x1, y1, x2, y2, kind:
   * 'mercury' | 'water' | 'gas', meniscus: 'top' | 'bottom', count, density}].
   * A flask, bottle, jar or capillary in `parts` takes the shaped path instead.
   */
  function vessel(m, parts, o = {}) {
    if ((parts || []).some((p) => p && (p.flask || p.bottle || p.jar || p.capillary))) return vesselShaped(m, parts, o)
    const wall = o.wall ?? 3
    const rectPx = (r, grow = 0, open) => {
      const X1 = Math.min(m.x(r.x1), m.x(r.x2))
      const X2 = Math.max(m.x(r.x1), m.x(r.x2))
      const Y1 = Math.min(m.y(r.y1), m.y(r.y2))
      const Y2 = Math.max(m.y(r.y1), m.y(r.y2))
      const e = grow
      const ext = (side) => (open === side ? wall + 1 : 0)
      return [X1 - e - ext('left'), Y1 - e - ext('top'), X2 - X1 + 2 * e + ext('left') + ext('right'), Y2 - Y1 + 2 * e + ext('top') + ext('bottom')]
    }
    ctx.save()
    ctx.fillStyle = glassWall()
    for (const r of parts) {
      const [X, Y, W, H] = rectPx(r, wall)
      ctx.fillRect(X, Y, W, H)
      // Only the walls are solid: a label naming the contents may sit in the cavity.
      const t = wall + 1
      if (r.open !== 'left') addShape(X, Y, t, H)
      if (r.open !== 'right') addShape(X + W - t, Y, t, H)
      if (r.open !== 'top') addShape(X, Y, W, t)
      if (r.open !== 'bottom') addShape(X, Y + H - t, W, t)
    }
    ctx.fillStyle = glassCavity()
    for (const r of parts) {
      const [X, Y, W, H] = rectPx(r, 0, r.open)
      ctx.fillRect(X, Y, W, H)
    }
    // Everything inside is clipped to the cavities.
    ctx.beginPath()
    for (const r of parts) {
      const [X, Y, W, H] = rectPx(r, 0, r.open)
      ctx.rect(X, Y, W, H)
    }
    ctx.clip()
    const k = m.s(1)
    for (const f of o.fills || []) {
      const [X, Y, W, H] = rectPx(f)
      if (W <= 0 || H <= 0) continue
      if (f.kind === 'gas') {
        const P = (a, b) => [m.x(a), m.y(b)]
        const region = { a0: Math.min(f.x1, f.x2), a1: Math.max(f.x1, f.x2), b0: Math.min(f.y1, f.y2), b1: Math.max(f.y1, f.y2) }
        gasDots(P, [region], f, k, () => {
          ctx.beginPath()
          ctx.rect(X, Y, W, H)
        })
        continue
      }
      const wide = W > H * 1.5
      const grad = wide ? ctx.createLinearGradient(0, Y, 0, Y + H) : ctx.createLinearGradient(X, 0, X + W, 0)
      if (f.kind === 'water') {
        grad.addColorStop(0, night() ? 'rgba(110,155,255,0.22)' : 'rgba(120,160,210,0.30)')
        grad.addColorStop(1, night() ? 'rgba(110,155,255,0.12)' : 'rgba(120,160,210,0.18)')
      } else {
        grad.addColorStop(0, night() ? '#4C5057' : '#8E9298')
        grad.addColorStop(0.35, night() ? '#B9BDC4' : '#F1F2F4')
        grad.addColorStop(0.6, night() ? '#7E838B' : '#B9BCC1')
        grad.addColorStop(1, night() ? '#3E4248' : '#7B7F85')
      }
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.rect(X, Y, W, H)
      // Mercury bulges into the gas above it; water curves the other way.
      const bulge = Math.min(W * 0.28, 5) * (f.kind === 'water' ? -1 : 1)
      if (f.meniscus === 'top') ctx.ellipse(X + W / 2, Y, W / 2, Math.abs(bulge), 0, bulge > 0 ? Math.PI : 0, bulge > 0 ? Math.PI * 2 : Math.PI)
      if (f.meniscus === 'bottom') ctx.ellipse(X + W / 2, Y + H, W / 2, Math.abs(bulge), 0, bulge > 0 ? 0 : Math.PI, bulge > 0 ? Math.PI : Math.PI * 2)
      ctx.fill(bulge < 0 ? 'evenodd' : 'nonzero')
    }
    // Glass sheen down the left of each tall cavity.
    ctx.strokeStyle = 'rgba(255,255,255,' + (night() ? 0.18 : 0.75) + ')'
    ctx.lineWidth = 1.6
    for (const r of parts) {
      const [X, Y, W, H] = rectPx(r)
      if (H < W * 1.5) continue
      ctx.beginPath()
      ctx.moveTo(X + Math.max(2, W * 0.22), Y + 4)
      ctx.lineTo(X + Math.max(2, W * 0.22), Y + H - 4)
      ctx.stroke()
    }
    ctx.restore()
    return rectMouths(parts)
  }

  /**
   * Conveyor belt whose top surface starts at (x, y) and runs `len` (physical)
   * along `angle` degrees. Marks and roller spokes advance by speed × t, so the
   * belt freezes when the animation is paused. Returns pt(u) on the top surface.
   */
  function conveyor(m, x, y, len, o = {}) {
    const a = ((o.angle || 0) * Math.PI) / 180
    const ux = Math.cos(a)
    const uy = Math.sin(a)
    const k = m.s(1)
    const R = o.r ?? 13
    const L = len * k
    const X0 = m.x(x)
    const Y0 = m.y(y)
    // Pixel frame: along = (ux, -uy), down-normal = (uy, ux) in screen coordinates.
    const S = (u, w) => [X0 + u * ux + w * uy, Y0 - u * uy + w * ux]
    const c1 = S(R, R)
    const c2 = S(L - R, R)
    ctx.save()
    ctx.beginPath()
    const ang = Math.atan2(-uy, ux)
    ctx.arc(c1[0], c1[1], R, ang - Math.PI / 2, ang + Math.PI / 2, true)
    ctx.arc(c2[0], c2[1], R, ang + Math.PI / 2, ang - Math.PI / 2, true)
    ctx.closePath()
    const kc = craft.craftTokens(theme)
    const frame = ctx.createLinearGradient(0, Math.min(c1[1], c2[1]) - R, 0, Math.max(c1[1], c2[1]) + R)
    for (const [off, c] of kc.materials.steel.stops) frame.addColorStop(off, c)
    ctx.fillStyle = frame
    ctx.fill()
    // rubber belt with a faint sheen along it
    stroke({ color: kc.materials.rubber.stops[1][1], width: 3 })
    ctx.stroke()
    ctx.globalAlpha = night() ? 0.15 : 0.3
    stroke({ color: '#FFFFFF', width: 0.6 })
    ctx.stroke()
    ctx.globalAlpha = 1
    // Rollers.
    const shift = (o.speed || 0) * t * k
    for (const c of [c1, c2]) {
      steelDisk(c[0], c[1], R - 3)
      stroke({ color: colors.graphite, width: 1.1 })
      for (let s = 0; s < 3; s++) {
        const th = shift / (R - 3) + (s * Math.PI * 2) / 3
        ctx.beginPath()
        ctx.moveTo(c[0], c[1])
        ctx.lineTo(c[0] + Math.cos(th) * (R - 5), c[1] + Math.sin(th) * (R - 5))
        ctx.stroke()
      }
      craft.sphere(ctx, c[0], c[1], Math.max(2.5, R * 0.2), 'dark', theme, { line: 'strong' })
    }
    // Tread marks: forward on top, backward underneath.
    const gap = o.gap || 22
    stroke({ color: colors.graphite, width: 1.2 })
    ctx.beginPath()
    for (const [w, sgn] of [[0, 1], [2 * R, -1]]) {
      const off = (((sgn * shift) % gap) + gap) % gap
      for (let u = R + off; u < L - R; u += gap) {
        const [p1x, p1y] = S(u, w + (sgn > 0 ? 2 : -2))
        const [p2x, p2y] = S(u, w + (sgn > 0 ? 6 : -6))
        ctx.moveTo(p1x, p1y)
        ctx.lineTo(p2x, p2y)
      }
    }
    ctx.stroke()
    ctx.restore()
    const xs = [S(0, 0)[0], S(L, 0)[0], S(0, 2 * R)[0], S(L, 2 * R)[0]]
    const ys = [S(0, 0)[1], S(L, 0)[1], S(0, 2 * R)[1], S(L, 2 * R)[1]]
    addShape(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))
    if (o.label) label(m, x + len * ux * 0.5, y + len * uy * 0.5, o.label, { place: 'below', offset: 2 * R + 8, background: false })
    return { pt: (u) => [x + u * ux, y + u * uy], ux, uy }
  }
