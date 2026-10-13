// Sandbox runtime, part: bar, photon, circuit element, tube, planet/orbit/satellite, rails and plates.
  /** Metal bar between two physical points (rods on rails, levers). Thickness in px. */
  function bar(m, x1, y1, x2, y2, o = {}) {
    const X1 = m.x(x1)
    const Y1 = m.y(y1)
    const X2 = m.x(x2)
    const Y2 = m.y(y2)
    const len = Math.hypot(X2 - X1, Y2 - Y1)
    if (len < 1) return
    const th = o.thick ?? 8
    const nx = (-(Y2 - Y1) / len) * (th / 2)
    const ny = ((X2 - X1) / len) * (th / 2)
    // round rod: lit along the side facing up, darker on the far side
    const up = ny < 0 || (ny === 0 && nx < 0) ? 1 : -1
    const grad = ctx.createLinearGradient(X1 + nx * up, Y1 + ny * up, X1 - nx * up, Y1 - ny * up)
    grad.addColorStop(0, night() ? '#4A4F57' : '#D8DCE1')
    grad.addColorStop(0.3, night() ? '#6A7078' : '#F8F9FA')
    grad.addColorStop(0.7, night() ? '#3A3E45' : '#C9CED5')
    grad.addColorStop(1, night() ? '#24272C' : '#A9AFB7')
    ctx.beginPath()
    ctx.moveTo(X1 + nx, Y1 + ny)
    ctx.lineTo(X2 + nx, Y2 + ny)
    ctx.lineTo(X2 - nx, Y2 - ny)
    ctx.lineTo(X1 - nx, Y1 - ny)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()
    stroke({ color: craft.craftTokens(theme).strong.color, width: 0.9 })
    ctx.stroke()
    addShape(Math.min(X1, X2) - th / 2, Math.min(Y1, Y2) - th / 2, Math.abs(X2 - X1) + th, Math.abs(Y2 - Y1) + th)
    if (o.label) label(m, x2, y2, o.label, { place: o.place || 'above', background: false })
  }

  /** Photon: a travelling wiggle with an arrowhead, coloured like light (charge amber). */
  function photon(m, x1, y1, x2, y2, o = {}) {
    const X1 = m.x(x1)
    const Y1 = m.y(y1)
    const X2 = m.x(x2)
    const Y2 = m.y(y2)
    const len = Math.hypot(X2 - X1, Y2 - Y1)
    if (len < 12) return
    ambient = o.still ? ambient : true
    const ux = (X2 - X1) / len
    const uy = (Y2 - Y1) / len
    const c = kindColor(o.kind || 'charge')
    const amp = o.amp ?? 5
    const wl = o.wavelength ?? 14
    const phase = o.still ? 0 : (performance.now() / 1000) * 6
    const body = len - 10
    withGlow(c, 10, () => {
      stroke({ color: c, width: o.width || 1.8 })
      ctx.beginPath()
      for (let s = 0; s <= body; s += 1.5) {
        const env = Math.min(1, s / 10, (body - s) / 10)
        const w = Math.sin((s / wl) * Math.PI * 2 - phase) * amp * env
        const X = X1 + ux * s - uy * w
        const Y = Y1 + uy * s + ux * w
        s ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y)
      }
      ctx.stroke()
    })
    arrowPx(X1 + ux * (len - 12), Y1 + uy * (len - 12), X2, Y2, { color: c, width: 1.8, head: 8, glow: 10 })
    if (o.label) pendingLabels.push([(X1 + X2) / 2, (Y1 + Y2) / 2, String(o.label), { color: c, place: o.place || 'above', offset: amp + 6, background: false }])
  }

  /**
   * Circuit symbol on the canvas at (x, y), horizontal unless vertical: true.
   * type: resistor | switch | battery | capacitor | lamp | ammeter | voltmeter | phototube.
   * phototube: circle, curved cathode K, rod anode A, light arrows onto K. reverse swaps K and A.
   * Returns the half-length in physical units so wires can stop at the terminals.
   */
  function element(m, x, y, type, o = {}) {
    const X = m.x(x)
    const Y = m.y(y)
    const half = { resistor: 18, switch: 16, battery: 5, capacitor: 5, lamp: 11, ammeter: 12, voltmeter: 12, phototube: 16 }[type] ?? 14
    ctx.save()
    ctx.translate(X, Y)
    if (o.vertical) ctx.rotate(Math.PI / 2)
    if (o.reverse === true && type === 'battery') ctx.scale(-1, 1)
    const s = colors.ink
    ctx.fillStyle = colors.stage || colors.enamel
    ctx.strokeStyle = s
    ctx.lineWidth = 1.6
    ctx.setLineDash([])
    if (type === 'resistor') {
      ctx.fillRect(-18, -7, 36, 14)
      ctx.strokeRect(-18, -7, 36, 14)
    } else if (type === 'switch') {
      ctx.fillRect(-16, -14, 32, 18)
      ctx.beginPath()
      ctx.arc(-14, 0, 2.6, 0, Math.PI * 2)
      ctx.arc(14, 0, 2.6, 0, Math.PI * 2)
      ctx.fillStyle = s
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(-14, 0)
      ctx.lineTo(o.closed ? 14 : 10, o.closed ? 0 : -12)
      ctx.lineCap = 'round'
      ctx.stroke()
    } else if (type === 'battery' || type === 'capacitor') {
      ctx.fillRect(-6, -15, 12, 30)
      ctx.lineWidth = 1.8
      ctx.beginPath()
      ctx.moveTo(-5, -14)
      ctx.lineTo(-5, 14)
      ctx.stroke()
      ctx.lineWidth = type === 'battery' ? 4 : 1.8
      ctx.beginPath()
      ctx.moveTo(5, type === 'battery' ? -8 : -14)
      ctx.lineTo(5, type === 'battery' ? 8 : 14)
      ctx.stroke()
    } else if (type === 'phototube') {
      const kLeft = o.reverse !== true
      const kX = kLeft ? -4 : 4
      const aX = kLeft ? 7 : -7
      const bulge = kLeft ? kX - 9 : kX + 9
      ctx.beginPath()
      ctx.arc(0, 0, 15, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(kX, -8)
      ctx.quadraticCurveTo(bulge, 0, kX, 8)
      ctx.stroke()
      ctx.lineWidth = 2.2
      ctx.beginPath()
      ctx.moveTo(aX, -6)
      ctx.lineTo(aX, 6)
      ctx.lineCap = 'round'
      ctx.stroke()
      ctx.lineWidth = 1.3
      ctx.strokeStyle = colors.charge
      ctx.fillStyle = colors.charge
      for (const dy of [-7, 1]) {
        const x1 = kLeft ? -22 : 22
        const y1 = -24 + dy
        const x2 = kX + (kLeft ? -2 : 2)
        const y2 = -11 + dy * 0.35
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        const ang = Math.atan2(y2 - y1, x2 - x1)
        ctx.beginPath()
        ctx.moveTo(x2, y2)
        ctx.lineTo(x2 - 5 * Math.cos(ang) + 2.4 * Math.sin(ang), y2 - 5 * Math.sin(ang) - 2.4 * Math.cos(ang))
        ctx.lineTo(x2 - 5 * Math.cos(ang) - 2.4 * Math.sin(ang), y2 - 5 * Math.sin(ang) + 2.4 * Math.cos(ang))
        ctx.closePath()
        ctx.fill()
      }
      ctx.fillStyle = s
      ctx.font = '600 11px ' + FAMILY.mono
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('K', kLeft ? -16 : 16, 22)
      ctx.fillText('A', kLeft ? 16 : -16, 22)
    } else {
      ctx.beginPath()
      ctx.arc(0, 0, half, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      if (type === 'lamp') {
        ctx.beginPath()
        ctx.moveTo(-7.5, -7.5)
        ctx.lineTo(7.5, 7.5)
        ctx.moveTo(-7.5, 7.5)
        ctx.lineTo(7.5, -7.5)
        ctx.stroke()
      } else {
        if (o.vertical) ctx.rotate(-Math.PI / 2)
        ctx.fillStyle = s
        ctx.font = '600 12px ' + FAMILY.mono
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(type === 'ammeter' ? 'A' : 'V', 0, 0.5)
      }
    }
    ctx.restore()
    addShape(X - half - 4, Y - 16, 2 * half + 8, 32)
    if (o.label) label(m, x, y, o.label, { place: o.place || (o.vertical ? 'right' : 'above'), offset: o.vertical ? half + 4 : 14, background: false })
    return half / m.s(1)
  }

  /**
   * Cylinder along a tilted axis: open tubes of any radii, pistons, a rod and a gas
   * whose molecules are spread over the space between the pistons, so the dots
   * crowd together as the gas is compressed. Axis coordinate u, cross coordinate w,
   * both physical; (x, y) is where u = 0, angle is the axis direction in degrees.
   * Needs an equal-scaled view. Returns pt(u, w) → [x, y] for attaching vectors.
   */
  function tube(m, o = {}) {
    const a = ((o.angle || 0) * Math.PI) / 180
    const ca = Math.cos(a)
    const sa = Math.sin(a)
    const ox = o.x || 0
    const oy = o.y || 0
    const pt = (u, w) => [ox + u * ca - w * sa, oy + u * sa + w * ca]
    const P = (u, w) => {
      const [x, y] = pt(u, w)
      return [m.x(x), m.y(y)]
    }
    const quad = (u1, u2, w1, w2) => {
      ctx.beginPath()
      const pts = [P(u1, w1), P(u2, w1), P(u2, w2), P(u1, w2)]
      pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y)))
      ctx.closePath()
    }
    const k = m.s(1)
    const wallT = (o.wall ?? 6) / k
    const sections = (o.sections || []).map((s) => ({ from: Math.min(s.from, s.to), to: Math.max(s.from, s.to), r: s.r }))
    const radiusAt = (u) => (sections.find((s) => u >= s.from - 1e-9 && u <= s.to + 1e-9) || sections[0] || { r: 0.1 }).r
    const kc = craft.craftTokens(theme)
    // Tubes sit at any angle, so materials are gradients across the part instead of solidRect.
    const across = (tone, a, b) => {
      const grad = ctx.createLinearGradient(a[0], a[1], b[0], b[1])
      for (const [off, c] of tone.stops) grad.addColorStop(off, c)
      return grad
    }
    const lineStrong = () => stroke({ color: kc.strong.color, width: kc.strong.width })

    // Gas first so walls and pistons sit on top of it.
    const g = o.gas
    if (g && sections.length) {
      const regions = sections
        .map((s) => ({ a0: Math.max(s.from, g.from), a1: Math.min(s.to, g.to), b0: -s.r, b1: s.r }))
        .filter((r) => r.a1 > r.a0)
      gasDots(P, regions, g, k, (r) => quad(r.a0, r.a1, r.b0, r.b1))
    }

    // Walls, then the annular step where two radii meet.
    const drawWall = (u1, u2, w1, w2) => {
      const outer = Math.abs(w2) > Math.abs(w1) ? w2 : w1
      const inner = outer === w2 ? w1 : w2
      quad(u1, u2, w1, w2)
      ctx.fillStyle = across(kc.materials.steel, P(u1, outer), P(u1, inner))
      ctx.fill()
      lineStrong()
      ctx.stroke()
    }
    sections.forEach((s, i) => {
      drawWall(s.from, s.to, s.r, s.r + wallT)
      drawWall(s.from, s.to, -s.r - wallT, -s.r)
      const next = sections[i + 1]
      if (next && Math.abs(next.r - s.r) > 1e-9 && Math.abs(next.from - s.to) < 1e-6) {
        const wide = next.r > s.r
        const u1 = wide ? s.to : s.to - wallT
        const u2 = wide ? s.to + wallT : s.to
        const rIn = Math.min(s.r, next.r)
        const rOut = Math.max(s.r, next.r) + wallT
        drawWall(u1, u2, rIn, rOut)
        drawWall(u1, u2, -rOut, -rIn)
      }
    })
    if (sections.length) {
      const all = sections.flatMap((s) => [P(s.from, s.r + wallT), P(s.to, -s.r - wallT)])
      const xs = all.map((p) => p[0])
      const ys = all.map((p) => p[1])
      addShape(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))
    }

    // Ghost pistons mark a reference position (e.g. where they started).
    for (const gp of o.ghosts || []) {
      const th = (gp.thick ?? 12) / k
      const r = radiusAt(gp.at)
      quad(gp.at - th / 2, gp.at + th / 2, -r, r)
      stroke({ color: colors.steel, width: 1.1, dash: [3, 3] })
      ctx.stroke()
      ctx.setLineDash([])
    }

    const pistons = o.pistons || []
    if (o.rod && pistons.length >= 2) {
      const rw = (o.rodWidth ?? 5) / k / 2
      quad(pistons[0].at, pistons[1].at, -rw, rw)
      ctx.fillStyle = across(kc.materials.alu, P(pistons[0].at, rw), P(pistons[0].at, -rw))
      ctx.fill()
      lineStrong()
      ctx.stroke()
    }
    for (const p of pistons) {
      const th = (p.thick ?? 12) / k
      const r = radiusAt(p.at) - 0.6 / k
      const u1 = p.at - th / 2
      const u2 = p.at + th / 2
      const [Xa, Ya] = P(p.at, -r)
      const [Xb, Yb] = P(p.at, r)
      const hi = kc.materials.steelHi
      const grad = ctx.createLinearGradient(Xa, Ya, Xb, Yb)
      grad.addColorStop(0, hi.stops[hi.stops.length - 1][1])
      grad.addColorStop(0.5, hi.top)
      grad.addColorStop(1, hi.stops[hi.stops.length - 1][1])
      quad(u1, u2, -r, r)
      ctx.fillStyle = grad
      ctx.fill()
      lineStrong()
      ctx.stroke()
      // Seal grooves.
      stroke({ color: colors.graphite, width: 1 })
      for (const f of [0.3, 0.7]) {
        const uu = u1 + (u2 - u1) * f
        const [X1, Y1] = P(uu, -r)
        const [X2, Y2] = P(uu, -r + Math.min(r * 0.25, 5 / k))
        const [X3, Y3] = P(uu, r - Math.min(r * 0.25, 5 / k))
        const [X4, Y4] = P(uu, r)
        ctx.beginPath()
        ctx.moveTo(X1, Y1)
        ctx.lineTo(X2, Y2)
        ctx.moveTo(X3, Y3)
        ctx.lineTo(X4, Y4)
        ctx.stroke()
      }
      if (p.label) {
        const side = p.labelSide === 'below' ? -1 : 1
        const [X, Y] = P(p.at, side * (radiusAt(p.at) + wallT + 14 / k))
        pendingTexts.push([X, Y, String(p.label), { size: 14, weight: 600, color: colors.ink }])
      }
    }
    return { pt, ux: ca, uy: sa }
  }

  function steelRect(X, Y, W, H) {
    craft.solidRect(ctx, X, Y, W, H, 'steel', theme, { band: Math.min(3, H * 0.22), r: 1, line: 'strong' })
  }

  function planet(m, x, y, r, o = {}) {
    const X = m.x(x)
    const Y = m.y(y)
    const R = o.px ? r : m.s(r)
    addShape(X - R, Y - R, 2 * R, 2 * R, BODY)
    if (night()) {
      const halo = ctx.createRadialGradient(X, Y, R * 0.9, X, Y, R * 1.6)
      halo.addColorStop(0, 'rgba(110,155,255,0.22)')
      halo.addColorStop(1, 'rgba(110,155,255,0)')
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(X, Y, R * 1.6, 0, Math.PI * 2)
      ctx.fill()
    }
    const g = ctx.createRadialGradient(X - R * 0.35, Y - R * 0.4, R * 0.1, X, Y, R)
    g.addColorStop(0, o.light || '#4B5FA8')
    g.addColorStop(1, o.dark || '#0B1030')
    ctx.beginPath()
    ctx.arc(X, Y, R, 0, Math.PI * 2)
    ctx.fillStyle = g
    ctx.fill()
    if (o.label) pendingTexts.push([X, Y + R * 0.55, String(o.label), { size: 11, color: night() ? '#C8D3FF' : '#E8ECFF' }])
  }

  /** Ellipse orbit; `back: true` dashes the far half to read as a tilted plane. */
  function orbit(m, cx, cy, rx, ry, o = {}) {
    const c = o.color || colors.steel
    const w = o.width || 1
    if (o.back) {
      ellipse(m, cx, cy, rx, ry, { color: c, width: w, from: 0, to: 180, dash: [3, 4], rot: o.rot })
      ellipse(m, cx, cy, rx, ry, { color: c, width: w, from: 180, to: 360, rot: o.rot })
    } else ellipse(m, cx, cy, rx, ry, { color: c, width: w, dash: o.dash, rot: o.rot })
  }

  function satellite(m, x, y, o = {}) {
    const X = m.x(x)
    const Y = m.y(y)
    const s = o.size || 7
    ctx.save()
    ctx.translate(X, Y)
    ctx.rotate((-(o.angle || 0) * Math.PI) / 180)
    const kc = craft.craftTokens(theme)
    ctx.strokeStyle = kc.strong.color
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.moveTo(-s * 1.1, 0)
    ctx.lineTo(s * 1.1, 0)
    ctx.stroke()
    for (const px of [-s * 2.7, s * 1.1]) {
      craft.solidRect(ctx, px, -s * 0.42, s * 1.6, s * 0.84, 'dark', theme, { band: 0, r: 0.6, line: 'strong', rim: false })
      ctx.strokeStyle = night() ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      for (let i = 1; i < 3; i++) {
        ctx.moveTo(px + (s * 1.6 * i) / 3, -s * 0.42)
        ctx.lineTo(px + (s * 1.6 * i) / 3, s * 0.42)
      }
      ctx.stroke()
    }
    craft.solidRect(ctx, -s, -s, s * 2, s * 2, 'steelHi', theme, { band: Math.max(1.5, s * 0.3), r: 1.5, line: 'strong' })
    ctx.restore()
    addShape(X - s * 2.6, Y - s, s * 5.2, s * 2, BODY)
  }

  function rails(m, x1, x2, yTop, yBot, o = {}) {
    for (const y of [yTop, yBot]) {
      craft.solidRect(ctx, Math.min(m.x(x1), m.x(x2)), m.y(y) - 2.5, Math.abs(m.x(x2) - m.x(x1)), 5, 'alu', theme, { band: 1.5, r: 1, line: 'strong', rim: false })
      addShape(m.x(x1), m.y(y) - 2.5, m.x(x2) - m.x(x1), 5)
    }
    if (o.label) label(m, x1, yTop, o.label, { place: 'above', background: false })
  }

  function plates(m, x1, x2, yTop, yBot, o = {}) {
    const angle = Number(o.angle) || 0
    const tilt = Number(o.tilt) || 0
    if (!(angle || tilt)) {
      const [sTop, sBot] = o.signs === 'flip' ? ['−', '+'] : ['+', '−']
      for (const [yy, sign] of [[yTop, sTop], [yBot, sBot]]) {
        craft.solidRect(ctx, Math.min(m.x(x1), m.x(x2)), m.y(yy) - 3, Math.abs(m.x(x2) - m.x(x1)), 6, 'dark', theme, { band: 1.5, r: 1, line: 'strong', rim: false })
        addShape(m.x(x1), m.y(yy) - 3, m.x(x2) - m.x(x1), 6)
        if (o.signs !== false) pendingTexts.push([m.x(x1) - 12, m.y(yy), sign, { size: 15, color: colors.ink }])
      }
      if (!(Math.abs(x2 - x1) > 1e-9) || !(Math.abs(yTop - yBot) > 1e-12)) {
        return { top: [[x1, yTop], [x2, yTop]], bot: [[x1, yBot], [x2, yBot]], angle: 0 }
      }
      return platePair(x1, x2, yTop, yBot, 0, 0)
    }
    const pair = platePair(x1, x2, yTop, yBot, angle, tilt)
    drawPlatePair(m, pair, o)
    return pair
  }

  function platesAt(m, x1, y1, x2, y2, o = {}) {
    const pair = platesAtFrame(x1, y1, x2, y2, o)
    drawPlatePair(m, pair, o)
    return pair
  }
