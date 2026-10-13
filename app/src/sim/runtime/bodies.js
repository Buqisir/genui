// Sandbox runtime, part: objects in enamel material: ground, wall, carts, blocks, ball, spring, pulley, gear, parachute, box, hand, laser, plow, emitter, backshell, airbag, aircon, incline, cylinder.
  // ---------- objects (格致 material: enamel body, ink outline, steel parts) ----------

  function hatch(X1, X2, Y, o = {}) {
    stroke({ color: colors.steel, width: 1 })
    ctx.beginPath()
    const gap = o.gap || 9
    const len = o.len || 7
    for (let x = X1 + 2; x < X2; x += gap) {
      ctx.moveTo(x, Y + 1)
      ctx.lineTo(x - len, Y + 1 + len)
    }
    ctx.stroke()
  }

  function surface(X1, X2, Y) {
    frameSurfaces.push([Math.min(X1, X2), Math.max(X1, X2), Y])
  }

  function restsOn(X1, X2, Y) {
    return frameSurfaces.some(([a, b, y]) => Math.abs(y - Y) < 1.5 && Math.min(b, X2) - Math.max(a, X1) > 2)
  }

  // Bench slab under the surface line; `side: 'above'` hangs it above (ceilings, supports).
  function ground(m, x1, x2, y, o = {}) {
    const X1 = Math.min(m.x(x1), m.x(x2))
    const X2 = Math.max(m.x(x1), m.x(x2))
    const Y = m.y(y)
    const T = o.thick || 10
    if (o.side === 'above') craft.solidRect(ctx, X1, Y - T, X2 - X1, T, 'steel', theme, { band: 0, r: 1.5 })
    else {
      craft.solidRect(ctx, X1, Y, X2 - X1, T, 'steel', theme, { band: Math.min(3, T * 0.3), r: 1.5 })
      surface(X1, X2, Y)
    }
  }

  function wall(m, x, y1, y2, o = {}) {
    const X = m.x(x)
    const Yt = m.y(y2)
    const Yb = m.y(y1)
    const w = o.thick || 7
    const side = o.side || 'right'
    const left = side === 'right' ? X : X - w
    craft.solidRect(ctx, left, Yt, w, Yb - Yt, 'steel', theme, { band: 0, r: 1, rim: false })
    // the lit face is the one objects touch
    const fx = side === 'right' ? left + 0.9 : left + w - 0.9
    ctx.save()
    ctx.globalAlpha *= night() ? 0.35 : 0.9
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 0.7
    ctx.beginPath()
    ctx.moveTo(fx, Yt + 1)
    ctx.lineTo(fx, Yb - 1)
    ctx.stroke()
    ctx.restore()
    addShape(left, Yt, w, Yb - Yt)
    if (o.label) pendingLabels.push([side === 'right' ? left + w : left, Yt, String(o.label), { place: side === 'right' ? 'right' : 'left', offset: 6, background: false }])
  }

  function enamelPath(o, draw) {
    ctx.beginPath()
    draw()
    if (o.ghost) {
      stroke({ color: colors.steel, width: 1.2, dash: [4, 4] })
      ctx.stroke()
      ctx.setLineDash([])
      return
    }
    ctx.fillStyle = colors.enamel
    ctx.fill()
    stroke({ color: colors.ink, width: o.width || 1.4 })
    ctx.stroke()
  }

  function wheel(X, Y, r, o) {
    if (o.ghost) {
      ctx.beginPath()
      ctx.arc(X, Y, r, 0, Math.PI * 2)
      stroke({ color: colors.steel, width: 1.1, dash: [3, 3] })
      ctx.stroke()
      ctx.setLineDash([])
      return
    }
    ctx.beginPath()
    ctx.arc(X, Y, r, 0, Math.PI * 2)
    ctx.fillStyle = colors.enamel
    ctx.fill()
    stroke({ color: colors.ink, width: 1.4 })
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(X, Y, r * 0.32, 0, Math.PI * 2)
    ctx.fillStyle = colors.ink
    ctx.fill()
  }

  /**
   * Cart standing on y with its left end at x and body length w (physical units).
   * Returns the body's physical top and ends so a block can sit on it.
   */
  function cart(m, x, y, w, h, o = {}) {
    const X = m.x(x)
    const W = m.s(w)
    const Hpx = h === undefined ? 34 : o.hPx ? h : m.sy(h)
    const r = o.wheel || Math.max(6, Math.min(10, Hpx * 0.3))
    const Yg = m.y(y)
    const top = Yg - 2 * r - Hpx + r * 0.6
    const inset = Math.min(W * 0.14, 22) + r
    if (o.ghost) {
      enamelPath(o, () => ctx.roundRect(X, top, W, Hpx, 5))
      wheel(X + inset, Yg - r, r, o)
      wheel(X + W - inset, Yg - r, r, o)
    } else {
      addShape(X, top, W, Yg - top, BODY)
      for (const wx of [X + inset, X + W - inset]) {
        craft.contactShadow(ctx, wx - r * 0.7, wx + r * 0.7, Yg, theme)
        craft.wheel(ctx, wx, Yg - r, r, theme)
      }
      const band = Math.min(5, Hpx * 0.18)
      craft.solidRect(ctx, X, top, W, Hpx, 'steelHi', theme, { r: 4, band })
      if (W > 50 && Hpx > 16) {
        const sr = Math.min(1.9, Hpx * 0.07)
        craft.screw(ctx, X + 6, top + Hpx - 6, sr, theme)
        craft.screw(ctx, X + W - 6, top + Hpx - 6, sr, theme)
      }
      surface(X, X + W, top)
    }
    if (o.label) text(m, x + w * (o.labelAt ?? 0.08), m.iy(top + Hpx / 2), o.label, { size: 15, color: o.ghost ? colors.steel : colors.ink, align: 'left' })
    return { top: m.iy(top), left: x, right: x + w, bottom: m.iy(top + Hpx) }
  }

  // Legacy shape kept for older lessons: anchor is the front bumper, length in px.
  function car(m, x, y, o = {}) {
    const W = o.length ?? 46
    const X = m.x(x)
    const left = o.facing === 'left' ? X : X - W
    const res = cart(m, m.ix(left), y, W / m.s(1), 18, { ...o, hPx: true, wheel: 5, label: undefined })
    if (o.label) {
      const anchorX = o.facing === 'left' ? left + W : left
      label(m, m.ix(anchorX), res.bottom, o.label, { place: o.labelPlace || (o.facing === 'left' ? 'right' : 'left'), offset: 6 })
    }
    return res
  }

  // Block resting on a slope: (x, y) is the bottom-centre on the surface, `angle` the
  // surface direction (degrees, counterclockwise). Returns the world top-centre too.
  function tiltedBlock(m, x, y, w, h, o) {
    const a = (+o.angle * Math.PI) / 180
    const X = m.x(x)
    const Y = m.y(y)
    const W = m.s(w)
    const H = m.sy(h)
    ctx.save()
    ctx.translate(X, Y)
    ctx.rotate(-a)
    if (o.ghost) {
      ctx.beginPath()
      ctx.roundRect(-W / 2, -H, W, H, o.radius ?? 4)
      stroke({ color: colors.steel, width: 1.2, dash: [4, 4] })
      ctx.stroke()
      ctx.setLineDash([])
    } else {
      // The contact shadow is a horizontal smudge under the base. On a slope the rotated
      // box hangs past the contact point, so a full-width shadow pokes out of the ground
      // as a short stray stroke. Keep only the patch that still lies on the surface.
      if (o.shadow !== false) {
        const hang = Math.max(0, Math.min(W / 2 - 1, H * Math.abs(Math.sin(a))))
        craft.contactShadow(ctx, -W / 2 + 1 + hang, W / 2 - 1 - hang, 0, theme)
      }
      craft.solidRect(ctx, -W / 2, -H, W, H, 'steelHi', theme, { r: o.radius ?? 3 })
      if (W >= 44 && H >= 24) {
        const band = Math.min(H * 0.16, 5)
        craft.screw(ctx, -W / 2 + 6, -H + band + 5, 1.7, theme)
        craft.screw(ctx, W / 2 - 6, -H + band + 5, 1.7, theme)
      }
    }
    ctx.restore()
    const c = Math.cos(a)
    const sn = Math.sin(a)
    const corner = (u, v2) => [x + u * c - v2 * sn, y + u * sn + v2 * c]
    const pts = [corner(-w / 2, 0), corner(w / 2, 0), corner(w / 2, h), corner(-w / 2, h)]
    if (!o.ghost) {
      const xs = pts.map((p) => m.x(p[0]))
      const ys = pts.map((p) => m.y(p[1]))
      addShape(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), BODY)
    }
    const mid = corner(0, h / 2)
    if (o.label) text(m, mid[0], mid[1], o.label, { size: o.labelSize || 15, color: o.ghost ? colors.steel : colors.ink })
    const topC = corner(0, h)
    return { top: topC[1], topCenter: topC, center: mid, corners: pts }
  }

  function block(m, x, y, w, h, o = {}) {
    if (o.pivot === 'center') {
      // A panel turning on a shaft: (x, y) is its centre, so move to the bottom-edge midpoint the drawing uses.
      const a = ((+o.angle || 0) * Math.PI) / 180
      x += (h / 2) * Math.sin(a)
      y -= (h / 2) * Math.cos(a)
      o = { ...o, pivot: undefined, shadow: o.shadow ?? false }
    }
    if (+o.angle) return tiltedBlock(m, x, y, w, h, o)
    const X = m.x(x - w / 2)
    const Y = m.y(y + h)
    const W = m.s(w)
    const H = m.sy(h)
    if (o.ghost) enamelPath(o, () => ctx.roundRect(X, Y, W, H, o.radius ?? 4))
    else {
      addShape(X, Y, W, H, BODY)
      if (o.shadow !== false && restsOn(X, X + W, Y + H)) craft.contactShadow(ctx, X + 1, X + W - 1, Y + H, theme)
      craft.solidRect(ctx, X, Y, W, H, 'steelHi', theme, { r: o.radius ?? 3 })
      if (W >= 44 && H >= 24) {
        const band = Math.min(H * 0.16, 5)
        craft.screw(ctx, X + 6, Y + band + 5, 1.7, theme)
        craft.screw(ctx, X + W - 6, Y + band + 5, 1.7, theme)
      }
      surface(X, X + W, Y)
    }
    if (o.label) text(m, x, y + h / 2, o.label, { size: o.labelSize || 15, color: o.ghost ? colors.steel : colors.ink })
    // Shading flag (遮光条) standing on the slider, for photogate experiments.
    let flagTop = y + h
    if (o.flag) {
      const fh = typeof o.flag === 'number' ? o.flag : h * 0.8
      const fx = m.x(x + (o.flagAt ?? 0))
      const fw = o.flagWidth || 4
      if (o.ghost) {
        ctx.fillStyle = colors.steel
        ctx.fillRect(fx - fw / 2, m.y(y + h + fh), fw, m.sy(fh))
      } else {
        craft.solidRect(ctx, fx - fw / 2, m.y(y + h + fh), fw, m.sy(fh), 'dark', theme, { band: 0, r: 0.6, line: 'strong' })
        craft.solidRect(ctx, fx - fw / 2 - 4, Y - 4, fw + 8, 4, 'steel', theme, { band: 1.2, r: 0.8, line: 'strong', rim: false })
        addShape(fx - fw / 2, m.y(y + h + fh), fw, m.sy(fh))
      }
      flagTop = y + h + fh
    }
    return { top: y + h, flagTop }
  }

  function ball(m, x, y, r, o = {}) {
    const X = m.x(x)
    const Y = m.y(y)
    const R = o.px ? r : m.s(r)
    if (o.ghost) {
      ctx.beginPath()
      ctx.arc(X, Y, R, 0, Math.PI * 2)
      stroke({ color: colors.steel, width: 1.1, dash: [3, 3] })
      ctx.stroke()
      ctx.setLineDash([])
      return
    }
    addShape(X - R, Y - R, 2 * R, 2 * R, BODY)
    if (!o.charge) {
      craft.sphere(ctx, X, Y, R, 'steelHi', theme)
      if (o.label) label(m, x, y, o.label, { offset: R + 4, background: false })
      return
    }
    // Charge keeps its amber (the charge colour) but is lit and outlined like the metal spheres.
    const g = ctx.createRadialGradient(X - R * 0.36, Y - R * 0.4, R * 0.08, X, Y, R)
    g.addColorStop(0, night() ? '#FFE29A' : '#FFE7A3')
    g.addColorStop(0.55, colors.charge)
    g.addColorStop(1, night() ? '#8A6416' : '#B07A12')
    withGlow(colors.charge, 12, () => {
      ctx.beginPath()
      ctx.arc(X, Y, R, 0, Math.PI * 2)
      ctx.fillStyle = g
      ctx.fill()
    })
    if (R > 5) {
      ctx.save()
      ctx.globalAlpha = craft.craftTokens(theme).glint
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.ellipse(X - R * 0.36, Y - R * 0.42, R * 0.22, R * 0.13, -0.6, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
    const ln = craft.craftTokens(theme).strong
    stroke({ color: ln.color, width: ln.width })
    ctx.beginPath()
    ctx.arc(X, Y, R, 0, Math.PI * 2)
    ctx.stroke()
    const q = o.charge === '+' ? 1 : o.charge === '-' || o.charge === '−' ? -1 : typeof o.charge === 'number' ? Math.sign(o.charge) : 0
    if (q && R > 4) {
      ctx.strokeStyle = '#1F2329'
      ctx.lineWidth = R > 10 ? 1.8 : 1.3
      ctx.beginPath()
      ctx.moveTo(X - R * 0.45, Y)
      ctx.lineTo(X + R * 0.45, Y)
      if (q > 0) {
        ctx.moveTo(X, Y - R * 0.45)
        ctx.lineTo(X, Y + R * 0.45)
      }
      ctx.stroke()
    }
    if (o.label) label(m, x, y, o.label, { offset: R + 4, background: false })
  }

  // Centre of mass: a small ink cross with a short "质心" label. Drawn in data coordinates.
  function com(m, x, y, o = {}) {
    const X = m.x(x)
    const Y = m.y(y)
    const s = o.size || 5
    ctx.beginPath()
    ctx.moveTo(X - s, Y)
    ctx.lineTo(X + s, Y)
    ctx.moveTo(X, Y - s)
    ctx.lineTo(X, Y + s)
    stroke({ color: o.color || colors.ink, width: 1.4 })
    ctx.stroke()
    addShape(X - s, Y - s, s * 2, s * 2)
    if (o.label !== false) label(m, x, y, o.label || '质心', { offset: s + 4, background: false })
  }

  function spring(m, x1, y1, x2, y2, o = {}) {
    const X1 = m.x(x1)
    const Y1 = m.y(y1)
    const X2 = m.x(x2)
    const Y2 = m.y(y2)
    const len = Math.hypot(X2 - X1, Y2 - Y1)
    if (len < 2) return
    const ux = (X2 - X1) / len
    const uy = (Y2 - Y1) / len
    const n = o.coils || 10
    const amp = o.amp || 7
    const lead = Math.min(10, len * 0.12)
    ctx.beginPath()
    ctx.moveTo(X1, Y1)
    ctx.lineTo(X1 + ux * lead, Y1 + uy * lead)
    const body = len - lead * 2
    for (let i = 1; i <= n * 2; i++) {
      const s = lead + (body * (i - 0.5)) / (n * 2)
      const side = i % 2 ? 1 : -1
      ctx.lineTo(X1 + ux * s - uy * amp * side, Y1 + uy * s + ux * amp * side)
    }
    ctx.lineTo(X2 - ux * lead, Y2 - uy * lead)
    ctx.lineTo(X2, Y2)
    ctx.lineJoin = 'round'
    if (o.color) {
      stroke({ color: o.color, width: 1.4 })
      ctx.stroke()
    } else {
      // Steel wire: dark outline, steel core, a thin highlight down the middle.
      const kc = craft.craftTokens(theme)
      stroke({ color: kc.strong.color, width: 2.9 })
      ctx.stroke()
      stroke({ color: night() ? '#8E949C' : '#A3AAB3', width: 1.7 })
      ctx.stroke()
      ctx.save()
      ctx.globalAlpha = night() ? 0.3 : 0.75
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 0.6
      ctx.stroke()
      ctx.restore()
    }
    ctx.lineJoin = 'miter'
    for (let s = 0; s <= len; s += 8) addShape(X1 + ux * s - amp, Y1 + uy * s - amp, 2 * amp, 2 * amp)
  }

  function rope(m, pts, o = {}) {
    path(m, pts, { color: o.color || colors.graphite, width: o.width || 1.2 })
  }

  function steelDisk(X, Y, R) {
    craft.disc(ctx, X, Y, R, 'alu', theme)
  }

  function pulley(m, x, y, r, o = {}) {
    const X = m.x(x)
    const Y = m.y(y)
    const R = o.px ? r : m.s(r)
    if (o.mount !== undefined) {
      const Ym = m.y(o.mount)
      stroke({ color: colors.ink, width: 1.4 })
      ctx.beginPath()
      ctx.moveTo(X, Ym)
      ctx.lineTo(X, Y)
      ctx.stroke()
    }
    addShape(X - R, Y - R, 2 * R, 2 * R)
    steelDisk(X, Y, R)
    ctx.beginPath()
    ctx.arc(X, Y, R * 0.78, 0, Math.PI * 2)
    stroke({ color: colors.steel, width: 1 })
    ctx.stroke()
    craft.sphere(ctx, X, Y, Math.max(2.5, R * 0.14), 'dark', theme, { line: 'strong' })
  }

  const GEAR_MATS = ['steelHi', 'steel', 'alu', 'dark']

  /**
   * Spur gear face-on, centre (x, y), pitch radius r. `angle` (degrees, counter-clockwise)
   * turns it, so `angle: omega * t * 180 / Math.PI` spins it. Returns the gear for gearMesh,
   * with pt(deg) on the pitch circle (where the teeth meet, the rim speed is ωr).
   */
  function gear(m, x, y, r, o = {}) {
    const X = m.x(x)
    const Y = m.y(y)
    const R = o.px ? r : m.s(r)
    const teeth = Math.max(8, Math.round(+o.teeth || Math.min(36, Math.max(8, R / 3))))
    const angle = +o.angle || 0
    const mat = GEAR_MATS.includes(o.mat) ? o.mat : 'steelHi'
    const prof = gearProfile(X, Y, R, teeth, angle)
    addShape(X - prof.outer, Y - prof.outer, 2 * prof.outer, 2 * prof.outer, BODY)
    craft.gear(ctx, X, Y, R, prof.pts, prof.root, mat, theme, { holes: o.holes === false ? 0 : o.holes, angle })
    if (o.label) label(m, x, y, o.label, { offset: prof.outer + 4, background: false })
    const rw = o.px ? r / (m.s(1) || 1) : r
    const pt = (deg) => [x + rw * Math.cos((deg * Math.PI) / 180), y + rw * Math.sin((deg * Math.PI) / 180)]
    return { x, y, r: rw, outer: (rw * prof.outer) / R, teeth, angle, pt }
  }

  /**
   * A second gear meshing with `g` (from v.gear): its centre lies in direction `dir` (degrees),
   * tooth count follows the radius ratio, and its rotation is set so the teeth interleave and
   * it turns the other way at n1/n2 the rate. The radius is snapped to a whole tooth count.
   */
  function gearMesh(m, g, r, o = {}) {
    if (!g || !(g.r > 0) || !(g.teeth > 0)) throw new Error('v.gearMesh 的第二个参数要写 v.gear 返回的齿轮')
    if (!(r > 0)) throw new Error('v.gearMesh 的半径要是正数')
    const dir = +o.dir || 0
    const teeth = Math.max(8, Math.round((g.teeth * r) / g.r))
    const r2 = (g.r * teeth) / g.teeth
    const a = (dir * Math.PI) / 180
    const cx = g.x + (g.r + r2) * Math.cos(a)
    const cy = g.y + (g.r + r2) * Math.sin(a)
    return gear(m, cx, cy, r2, { ...o, px: false, teeth, angle: gearMeshAngle(g.angle, g.teeth, teeth, dir) })
  }

  /**
   * Parachute: (x, y) is where the lines gather; the canopy (width w) sits above it.
   * `h` dome height (default 0.42 w), `drop` from the attach point up to the rim
   * (default 0.75 w), `gores` panels (default 7), `angle` leans it about the attach point.
   */
  function parachute(m, x, y, w, o = {}) {
    if (!(w > 0)) throw new Error('v.parachute 的伞宽要是正数')
    const X = m.x(x)
    const Y = m.y(y)
    const W = m.s(w)
    const H = m.s(o.h > 0 ? +o.h : 0.42 * w)
    const drop = m.s(o.drop > 0 ? +o.drop : 0.75 * w)
    const f = parachuteFrame(W, H, drop, o.gores || 7)
    const a = (-(+o.angle || 0) * Math.PI) / 180
    const ca = Math.cos(a)
    const sa = Math.sin(a)
    const P = ([px, py]) => [X + px * ca - py * sa, Y + px * sa + py * ca]
    const outline = f.canopy.map(P)
    const rim = f.rim.map(P)
    const hem = f.hem.map(P)
    const apex = P(f.apex)
    const k = craft.craftTokens(theme)
    ctx.save()
    ctx.strokeStyle = k.strong.color
    ctx.lineWidth = 0.7
    ctx.setLineDash([])
    ctx.beginPath()
    for (const [rx, ry] of rim) {
      ctx.moveTo(rx, ry)
      ctx.lineTo(X, Y)
    }
    ctx.stroke()
    ctx.restore()
    craft.canopy(ctx, outline, rim, hem, apex, theme)
    metalRing(X, Y, 2.8, 1.3)
    const xs = outline.map((p) => p[0])
    const ys = outline.map((p) => p[1])
    addShape(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), BODY)
    addShape(X - 3, Y - 3, 6, 6)
    const world = ([px, py]) => [m.ix(px), m.iy(py)]
    if (o.label) label(m, ...world(apex), o.label, { place: 'above', offset: 6, background: false })
    return { attach: [x, y], apex: world(apex), left: world(rim[0]), right: world(rim[rim.length - 1]) }
  }

  /** Ring eye (spring-scale hanger): metal annulus, outline strong. */
  function metalRing(X, Y, R, r) {
    if (!(R > r && r >= 0)) return
    const k = craft.craftTokens(theme)
    const g = ctx.createLinearGradient(0, Y - R, 0, Y + R)
    for (const [off, c] of k.materials.steelHi.stops) g.addColorStop(off, c)
    ctx.beginPath()
    ctx.arc(X, Y, R, 0, Math.PI * 2)
    ctx.arc(X, Y, r, 0, Math.PI * 2, true)
    ctx.fillStyle = g
    ctx.fill('evenodd')
    ctx.strokeStyle = k.strong.color
    ctx.lineWidth = k.strong.width
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.arc(X, Y, R, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(X, Y, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  /**
   * Spring scale. `(x, y)` is the ring; `angle` (degrees from +x, counterclockwise) points from the ring toward the hook.
   * Hook position comes from springHook in lesson/instruments.ts.
   * Scale numbers stay upright. Returns the hook in world coordinates.
   */
  function springScale(m, x, y, o = {}) {
    const angle = o.angle === undefined ? -90 : +o.angle
    const max = o.max > 0 ? +o.max : 5
    const value = Number.isFinite(+o.value) ? +o.value : 0
    const length = o.length > 0 ? +o.length : 1.6
    const divisions = o.divisions > 1 ? Math.round(+o.divisions) : Math.round(max / (max <= 5 ? 0.1 : 0.2))
    const hooked = springHook(x, y, angle, length, value, max)
    const fraction = hooked.fraction
    const a = (angle * Math.PI) / 180
    const ux = Math.cos(a)
    const uy = Math.sin(a)
    const nx = -uy
    const ny = ux
    const P = (along, side) => [x + along * ux + side * nx, y + along * uy + side * ny]
    const w = length * 0.2
    const top = length * 0.1
    const bot = length
    craft.solidPoly(ctx, [P(top, -w / 2), P(top, w / 2), P(bot, w / 2), P(bot, -w / 2)].map(([px, py]) => [m.x(px), m.y(py)]), 'steelHi', theme, { line: 'strong' })
    const s0 = top + length * 0.08
    const s1 = bot - length * 0.06
    const sw = w * 0.42
    path(m, [P(s0, -sw / 2), P(s0, sw / 2), P(s1, sw / 2), P(s1, -sw / 2)], { close: true, fill: colors.stage || colors.enamel, color: colors.steel, width: 0.8 })
    const per = max / Math.max(1, divisions)
    const majorEvery = Math.max(1, Math.round(1 / per))
    for (let i = 0; i <= divisions; i++) {
      const t = s0 + ((s1 - s0) * i) / Math.max(1, divisions)
      const major = i % majorEvery === 0
      const tick0 = P(t, -sw / 2)
      const tick1 = P(t, -sw / 2 + (major ? sw * 0.85 : sw * 0.4))
      line(m, tick0[0], tick0[1], tick1[0], tick1[1], { color: colors.ink, width: major ? 1.15 : 0.7 })
      if (major) {
        const lab = P(t, sw * 0.95)
        const shown = Math.round(((max * i) / divisions) * 1000) / 1000
        text(m, lab[0], lab[1], String(shown), { size: 11, color: colors.ink, plain: true })
      }
    }
    const along = s0 + (s1 - s0) * fraction
    const pL = P(along, -w * 0.62)
    const pR = P(along, w * 0.35)
    line(m, pL[0], pL[1], pR[0], pR[1], { color: o.color || colors.velocity, width: 1.7 })
    const coils = []
    const c0 = top + length * 0.05
    const nCoil = 8
    coils.push(P(c0, 0))
    const span = Math.max(length * 0.04, along - c0)
    for (let i = 0; i < nCoil; i++) coils.push(P(c0 + (span * (i + 0.5)) / nCoil, (i % 2 ? 1 : -1) * w * 0.22))
    coils.push(P(c0 + span, 0))
    path(m, coils, { color: colors.graphite, width: 1.1 })
    metalRing(m.x(x), m.y(y), Math.abs(m.s(w * 0.28)), Math.abs(m.s(w * 0.11)))
    const hook = [hooked.x, hooked.y]
    line(m, P(bot, 0)[0], P(bot, 0)[1], hook[0], hook[1], { color: colors.ink, width: 1.5 })
    circle(m, hook[0] + ux * w * 0.16, hook[1] + uy * w * 0.16, w * 0.16, { color: colors.ink, width: 1.3 })
    const corners = [P(top, -w / 2), P(top, w / 2), P(bot, w / 2), P(bot, -w / 2), hook, [x, y]]
    const sx = corners.map((p) => m.x(p[0]))
    const sy = corners.map((p) => m.y(p[1]))
    addShape(Math.min(...sx) - 6, Math.min(...sy) - 6, Math.max(...sx) - Math.min(...sx) + 12, Math.max(...sy) - Math.min(...sy) + 12, 3)
    if (o.label) label(m, x, y, String(o.label))
    return { hook, fraction, angle, max }
  }

  /**
   * Electrometer: ball, rod, needle. Angle is degrees from the rod, `60 * value/max`
   * (lesson/instruments.ts electrometerDegrees). `deflection` is used only when `value` is omitted.
   */
  function electrometer(m, x, y, o = {}) {
    const max = o.max > 0 ? +o.max : 1
    const valueNum = o.value !== undefined && o.value !== null && Number.isFinite(+o.value) ? +o.value : undefined
    const deflection = Number.isFinite(+o.deflection) ? +o.deflection : 0
    const deg = electrometerDegrees(valueNum, max, deflection)
    const H = o.h > 0 ? +o.h : 1.15
    const W = H * 0.55
    const bot = y - H * 0.38
    const top = y + H * 0.22
    craft.glassRect(ctx, m.x(x - W / 2), m.y(top), Math.abs(m.s(W)), Math.abs(m.y(bot) - m.y(top)), theme)
    const capH = Math.max(3, Math.abs(m.s(H * 0.05)))
    craft.solidRect(ctx, m.x(x - W / 2) - 1, m.y(top) - capH, Math.abs(m.s(W)) + 2, capH, 'steel', theme, { band: 0, r: 1, line: 'strong' })
    craft.solidRect(ctx, m.x(x - W / 2) - 1, m.y(bot), Math.abs(m.s(W)) + 2, capH, 'steel', theme, { band: 0, r: 1, line: 'strong' })
    const ballY = y + H * 0.62
    const pivotY = top - H * 0.04
    line(m, x, pivotY, x, ballY - H * 0.1, { color: colors.ink, width: 1.4 })
    craft.sphere(ctx, m.x(x), m.y(ballY), Math.abs(m.s(H * 0.09)), 'steelHi', theme, { line: 'strong' })
    const rad = (deg * Math.PI) / 180
    const nLen = H * 0.7
    line(m, x, pivotY, x + nLen * Math.sin(rad), pivotY + nLen * Math.cos(rad), { color: o.color || colors.velocity, width: 1.5 })
    circle(m, x, pivotY, H * 0.025, { fill: colors.ink, color: colors.ink })
    const gy = bot - H * 0.06
    line(m, x, bot, x, gy, { color: colors.ink, width: 1.1 })
    for (let i = 0; i < 3; i++) {
      const yy = gy - H * 0.04 - i * H * 0.045
      const hw = H * 0.16 * (1 - i * 0.28)
      line(m, x - hw, yy, x + hw, yy, { color: colors.ink, width: 1.1 })
    }
    if (o.label) label(m, x + W * 0.85, (top + bot) / 2, String(o.label))
    const xs = [m.x(x - W / 2), m.x(x + W / 2)]
    const ys = [m.y(ballY + H * 0.12), m.y(gy - H * 0.16)]
    addShape(Math.min(...xs) - 4, Math.min(...ys) - 4, Math.abs(xs[1] - xs[0]) + 8, Math.abs(ys[1] - ys[0]) + 8, 3)
    return { angle: deg, ball: [x, ballY] }
  }

  const BOX_MATS = ['steel', 'steelHi', 'alu', 'dark']

  /**
   * Instrument housing: bottom-centre at (x, y), like v.block, but a case rather than a mass.
   * A recessed front panel, corner screws, an optional printed name, brass posts on top and a
   * small dark screen. `style: 'frame'` drops the panel and screws and draws an open housing
   * (a room, a chassis seen in section). Returns the centre, the top edge and each terminal.
   */
  function box(m, x, y, w, h, o = {}) {
    if (!(w > 0 && h > 0)) throw new Error('v.box 的宽和高要是正数')
    const X = m.x(x - w / 2)
    const Y = m.y(y + h)
    const W = m.s(w)
    const H = m.sy(h)
    const frame = o.style === 'frame'
    const mat = BOX_MATS.includes(o.mat) ? o.mat : 'steel'
    addShape(X, Y, W, H, BODY)
    if (!frame && o.shadow !== false && restsOn(X, X + W, Y + H)) craft.contactShadow(ctx, X + 2, X + W - 2, Y + H, theme)
    const band = Math.min(H * 0.14, 6)
    const margin = Math.min(W, H) * 0.1
    const k = craft.craftTokens(theme)
    if (frame) {
      // An open housing: four walls and the shadow inside them, so the stage shows through the middle.
      const t = Math.max(3, Math.min(8, Math.min(W, H) * 0.09))
      const tone = k.materials[mat]
      const innerW = Math.max(0, W - 2 * t)
      const innerH = Math.max(0, H - 2 * t)
      ctx.fillStyle = tone.stops[0][1]
      ctx.fillRect(X, Y, W, t)
      ctx.fillRect(X, Y + H - t, W, t)
      ctx.fillRect(X, Y + t, t, innerH)
      ctx.fillRect(X + W - t, Y + t, t, innerH)
      ctx.fillStyle = tone.top
      ctx.fillRect(X, Y, W, Math.min(band, t))
      ctx.fillStyle = night() ? 'rgba(0,0,0,0.5)' : 'rgba(30,40,52,0.2)'
      ctx.fillRect(X + t, Y + t, Math.min(5, t), innerH)
      ctx.fillRect(X + t, Y + H - t - Math.min(4, t), innerW, Math.min(4, t))
      ctx.beginPath()
      ctx.rect(X, Y, W, H)
      ctx.rect(X + t, Y + t, innerW, innerH)
      ctx.strokeStyle = k.strong.color
      ctx.lineWidth = k.strong.width
      ctx.setLineDash([])
      ctx.stroke()
      ctx.save()
      ctx.globalAlpha *= night() ? 0.55 : 0.9
      ctx.strokeStyle = k.bevel
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.moveTo(X + 1.4, Y + 1.2)
      ctx.lineTo(X + W - 1.4, Y + 1.2)
      ctx.moveTo(X + t + 1.4, Y + t + 1.2)
      ctx.lineTo(X + W - t - 1.4, Y + t + 1.2)
      ctx.stroke()
      ctx.restore()
    } else {
      craft.solidRect(ctx, X, Y, W, H, mat, theme, { r: 3, band })
    }
    if (!frame && W > 30 && H > 22) {
      const px = X + margin
      const py = Y + band + margin * 0.6
      const pw = W - margin * 2
      const ph = H - band - margin * 1.5
      if (pw > 8 && ph > 8) {
        craft.solidRect(ctx, px, py, pw, ph, night() ? 'steel' : 'dark', theme, { r: 1.5, band: 0, line: 'strong', rim: false })
        ctx.save()
        ctx.globalAlpha *= night() ? 0.85 : 0.8
        ctx.strokeStyle = k.bevel
        ctx.lineWidth = night() ? 1 : 0.6
        ctx.beginPath()
        ctx.moveTo(px + 1.5, py + 1)
        ctx.lineTo(px + pw - 1.5, py + 1)
        ctx.stroke()
        ctx.restore()
      }
      const sr = Math.min(2, Math.max(1.3, Math.min(W, H) * 0.035))
      for (const [sx, sy] of [
        [X + margin * 0.45, Y + H - margin * 0.5],
        [X + W - margin * 0.45, Y + H - margin * 0.5],
      ]) {
        if (sy > py + ph + sr) craft.screw(ctx, sx, sy, sr, theme)
      }
    }
    if (o.display && W > 36 && H > 26) {
      const dw = Math.min(W * 0.42, 64)
      const dh = Math.min(H * 0.32, 26)
      const dx = X + W - margin - dw
      const dy = Y + band + margin
      ctx.save()
      ctx.fillStyle = night() ? '#10141A' : '#1C242C'
      ctx.beginPath()
      ctx.roundRect(dx, dy, dw, dh, 1.5)
      ctx.fill()
      ctx.globalAlpha *= night() ? 0.25 : 0.5
      ctx.strokeStyle = '#9FE7C8'
      ctx.lineWidth = 0.7
      ctx.beginPath()
      ctx.moveTo(dx + 3, dy + dh * 0.62)
      ctx.lineTo(dx + dw * 0.35, dy + dh * 0.62)
      ctx.lineTo(dx + dw * 0.5, dy + dh * 0.3)
      ctx.lineTo(dx + dw * 0.7, dy + dh * 0.74)
      ctx.lineTo(dx + dw - 3, dy + dh * 0.74)
      ctx.stroke()
      ctx.restore()
    }
    if (o.label) {
      const onPanel = !frame && W > 30 && H > 22
      // Night body text, not the grey print tone, so a name on the dark panel stays readable.
      const ink = onPanel ? (night() ? colors.ink : 'rgba(226,231,238,0.8)') : k.print
      pendingTexts.push([X + (o.display ? W * 0.34 : W / 2), Y + H * 0.58, String(o.label), { size: Math.min(13, H * 0.28), color: ink }])
    }
    const n = Math.max(0, Math.round(+o.terminals || 0))
    const terminals = []
    if (n > 0 && n < 9) {
      const span = W * Math.min(0.7, 0.16 * n + 0.1)
      for (let i = 0; i < n; i++) {
        const px = X + (W - span) / 2 + (n === 1 ? span / 2 : (span * i) / (n - 1))
        const py = Y - 1
        craft.solidRect(ctx, px - 2.4, py - 7, 4.8, 8, 'brass', theme, { r: 1, band: 1.4, line: 'strong', rim: false })
        craft.disc(ctx, px, py - 7, 3.1, 'brass', theme)
        terminals.push([m.ix(px), m.iy(py - 7)])
      }
    } else if (n >= 9) throw new Error('v.box 的接线柱最多 8 个')
    if (!frame) surface(X, X + W, Y)
    return { center: [x, y + h / 2], top: [x, y + h], left: [x - w / 2, y + h / 2], right: [x + w / 2, y + h / 2], terminals }
  }

  /**
   * A solid wedge of any outline: triangle, trapezoid, a non-right-angled ramp. Vertices in
   * world coordinates; the highest edge takes the lit band. `dash` draws the ghost of an
   * earlier position. Returns every edge with a point-at-fraction and its outward normal, so
   * a block or a force arrow can be seated on any face. `angleLabel` marks one corner.
   */
  function wedge(m, pts, o = {}) {
    const frame = wedgeFrame(pts)
    const px = frame.pts.map(([x, y]) => [m.x(x), m.y(y)])
    const top = frame.edges[frame.topEdge]
    const ghost = o.dash || o.ghost
    if (ghost) {
      ctx.beginPath()
      px.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y)))
      ctx.closePath()
      stroke({ color: colors.steel, width: 1.2, dash: [4, 4] })
      ctx.stroke()
      ctx.setLineDash([])
    } else {
      const xs = px.map((p) => p[0])
      const ys = px.map((p) => p[1])
      addShape(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), BODY)
      const grounded = frame.edges.find((e) => Math.abs(e.a[1] - e.b[1]) < 1e-6 && e.normal[1] < 0)
      if (grounded && o.shadow !== false) {
        const [gx1, gx2] = [m.x(grounded.a[0]), m.x(grounded.b[0])].sort((a, b) => a - b)
        craft.contactShadow(ctx, gx1, gx2, m.y(grounded.a[1]), theme)
        surface(gx1, gx2, m.y(grounded.a[1]))
      }
      craft.solidPoly(ctx, px, BOX_MATS.includes(o.mat) ? o.mat : 'steel', theme, { bandEdge: [top.i, (top.i + 1) % px.length], band: 5 })
    }
    if (o.angleLabel) {
      const i = o.at == null ? frame.edges.findIndex((e) => e.normal[1] < -0.2) : +o.at
      const e = frame.edges[(i + frame.edges.length) % frame.edges.length]
      const prev = frame.edges[(e.i + frame.edges.length - 1) % frame.edges.length]
      const bis = [-(prev.dir[0]) + e.dir[0], -(prev.dir[1]) + e.dir[1]]
      const bl = Math.hypot(bis[0], bis[1]) || 1
      const apex = px[e.i]
      const r = 22
      // Measured in screen space between the two neighbouring vertices, so the arc always
      // spans the interior corner whatever the view's axis orientation.
      const nPts = px.length
      const toPrev = px[(e.i + nPts - 1) % nPts]
      const toNext = px[(e.i + 1) % nPts]
      const a0 = Math.atan2(toPrev[1] - apex[1], toPrev[0] - apex[0])
      const a1 = Math.atan2(toNext[1] - apex[1], toNext[0] - apex[0])
      let sweep = a1 - a0
      while (sweep > Math.PI) sweep -= 2 * Math.PI
      while (sweep <= -Math.PI) sweep += 2 * Math.PI
      ctx.beginPath()
      ctx.arc(apex[0], apex[1], r, a0, a0 + sweep, sweep < 0)
      stroke({ color: colors.graphite, width: 1 })
      ctx.stroke()
      const inward = [bis[0] / bl, bis[1] / bl]
      pendingTexts.push([apex[0] + inward[0] * m.s(1) * 0.42, apex[1] - inward[1] * m.s(1) * 0.42, String(o.angleLabel), { size: 13, color: colors.ink }])
    }
    if (o.label) {
      const cx = frame.pts.reduce((s, p) => s + p[0], 0) / frame.pts.length
      const cy = frame.pts.reduce((s, p) => s + p[1], 0) / frame.pts.length
      label(m, cx, cy, String(o.label), { background: false })
    }
    const edges = frame.edges.map((e) => ({ ...e, px: { a: px[e.i], b: px[(e.i + 1) % px.length] } }))
    return { pts: frame.pts, edges, top: top.i }
  }

  /**
   * A cuboid in cabinet projection: front face in true size, receding edges at 45° and half
   * length. (x, y) is the front-bottom-left corner; w, h, d are width, height, depth. Faces are
   * lit top, front, then side. `hidden` dashes the three edges you would not see, `cut` draws
   * the diagonal section through the top-left and bottom-right edges, `loop` lays a flat coil
   * on the top face. Returns every corner and a projector P(x, y, z) in world coordinates.
   */
  function slab(m, x, y, w, h, d, o = {}) {
    const k = m.s(1)
    const frame = slabFrame(w * k, h * k, d * k)
    const P = (px, py, pz) => {
      const [dx, dy] = frame.project(px * k, py * k, pz * k)
      return [x + dx / k, y + dy / k]
    }
    const corner = (i) => P(frame.corners[i].x / k, frame.corners[i].y / k, frame.corners[i].z / k)
    const face = (ids) => ids.map((i) => corner(i))
    const poly = (ids) => face(ids).map(([wx, wy]) => [m.x(wx), m.y(wy)])
    const bounds = frame.corners.map((c) => [m.x(x) + c.px, m.y(y) - c.py])
    const bxs = bounds.map((p) => p[0])
    const bys = bounds.map((p) => p[1])
    addShape(Math.min(...bxs), Math.min(...bys), Math.max(...bxs) - Math.min(...bxs), Math.max(...bys) - Math.min(...bys), BODY)
    if (o.shadow !== false) {
      const foot = [bounds[0], bounds[1], bounds[5], bounds[4]]
      craft.contactShadow(ctx, Math.min(...foot.map((p) => p[0])), Math.max(...foot.map((p) => p[0])), Math.max(...foot.map((p) => p[1])), theme, { ry: 3 })
    }
    const mat = BOX_MATS.includes(o.mat) ? o.mat : 'steel'
    // Side a step darker, top a step lighter, so the three faces separate in both themes.
    const shadeOf = { steel: 'cap', steelHi: 'steel', alu: 'steel', dark: 'insul' }
    craft.solidPoly(ctx, poly(frame.faces.side), shadeOf[mat] || 'cap', theme, { bandEdge: [2, 3], band: 4, line: 'none' })
    craft.solidPoly(ctx, poly(frame.faces.front), mat, theme, { bandEdge: [3, 2], band: 4, line: 'none' })
    craft.solidPoly(ctx, poly(frame.faces.top), 'steelHi', theme, { line: 'none' })
    const kc = craft.craftTokens(theme)
    const outline = (ids, dash) => {
      ctx.beginPath()
      poly(ids).forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y)))
      ctx.closePath()
      ctx.setLineDash(dash ? [3, 3] : [])
      ctx.strokeStyle = dash ? kc.soft.color : kc.soft.color
      ctx.lineWidth = kc.soft.width
      ctx.stroke()
      ctx.setLineDash([])
    }
    const big = w * h * k * k > 1600
    ctx.save()
    ctx.strokeStyle = big ? kc.soft.color : kc.strong.color
    ctx.lineWidth = big ? kc.soft.width : kc.strong.width
    ctx.lineJoin = 'round'
    ctx.beginPath()
    for (const ids of [frame.faces.front, frame.faces.side, frame.faces.top]) {
      poly(ids).forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y)))
      ctx.closePath()
    }
    ctx.stroke()
    ctx.restore()
    if (o.hidden) outline([4, 6, 7, 5], true)
    if (o.cut) {
      ctx.save()
      ctx.globalAlpha *= night() ? 0.45 : 0.55
      craft.paintedPoly(ctx, poly(frame.cut), night() ? '#8AA0B4' : '#C5D0DA', theme, { line: 'strong' })
      ctx.restore()
      // M N P Q sit outside the four corners of the section, in the ordinary label face.
      const names = o.cutLabels === false ? [] : Array.isArray(o.cutLabels) ? o.cutLabels : ['M', 'N', 'P', 'Q']
      const cutPx = poly(frame.cut)
      const centroid = cutPx.reduce((s, p) => [s[0] + p[0], s[1] + p[1]], [0, 0]).map((v) => v / cutPx.length)
      names.forEach((name, i) => {
        if (i >= cutPx.length || name == null || name === false || String(name).trim() === '') return
        const p = cutPx[i]
        const dx = p[0] - centroid[0]
        const dy = p[1] - centroid[1]
        const len = Math.hypot(dx, dy) || 1
        label(m, m.ix(p[0] + (dx / len) * 16), m.iy(p[1] + (dy / len) * 16), String(name), { size: 13, color: colors.ink, background: false })
      })
    }
    let loop = null
    if (o.loop) {
      const spec = typeof o.loop === 'object' ? o.loop : {}
      const ell = slabLoop(frame, w * k, h * k, d * k, { u: spec.u, v: spec.v, ru: spec.r ? spec.r * k : spec.ru, rv: spec.r ? spec.r * k : spec.rv })
      const toScreen = ([dx, dy]) => [m.x(x) + dx, m.y(y) - dy]
      craft.loopEllipse(ctx, toScreen(ell.center), [ell.rx[0], -ell.rx[1]], [ell.rz[0], -ell.rz[1]], theme, colors.charge)
      const centre = P((spec.u ?? 0.5) * w, h, (spec.v ?? 0.5) * d)
      loop = { center: centre }
    }
    if (o.label) label(m, ...P(w / 2, h * 0.45, 0), String(o.label), { background: false })
    const mid = (ids) => {
      const f = face(ids)
      return [f.reduce((s, p) => s + p[0], 0) / f.length, f.reduce((s, p) => s + p[1], 0) / f.length]
    }
    return {
      corners: frame.corners.map((_, i) => corner(i)),
      front: mid(frame.faces.front),
      side: mid(frame.faces.side),
      top: mid(frame.faces.top),
      P,
      loop,
    }
  }

  /**
   * A gloved hand closed on a rope or rod end at (x, y). `dir` (or a number of degrees) says
   * which way the wrist runs: 'right', 'left', 'up', 'down'. Drawn in the matte fabric tone so
   * it sits with the cold-grey apparatus instead of introducing a skin colour.
   */
  function hand(m, x, y, o = {}) {
    const named = { right: 0, left: 180, up: 90, down: -90 }
    const dir = o.dir == null ? 0 : named[o.dir] ?? +o.dir
    if (!Number.isFinite(dir)) throw new Error('v.hand 的方向取 right、left、up、down，或一个角度')
    const size = o.size > 0 ? +o.size : 36
    const X = m.x(x)
    const Y = m.y(y)
    const f = handFrame(dir, size)
    const S = (p) => [X + p[0], Y + p[1]]
    const all = [...f.palm, ...f.cuff, ...f.thumb, ...f.fingers.flat()]
    const xs = all.map((p) => X + p[0])
    const ys = all.map((p) => Y + p[1])
    addShape(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), BODY)
    // The rope passes behind the fingers: visible on both sides of the fist, hidden across it.
    if (o.rope !== false) {
      const { dir: rd, from, to, front } = f.rope
      const at = (t) => [X + rd[0] * t, Y + rd[1] * t]
      ctx.save()
      ctx.strokeStyle = colors.graphite
      ctx.lineWidth = 1.6
      ctx.lineCap = 'butt'
      ctx.setLineDash([])
      ctx.beginPath()
      for (const [a, b] of [[from, front[0]], [front[1], to]]) {
        const p0 = at(a)
        const p1 = at(b)
        ctx.moveTo(p0[0], p0[1])
        ctx.lineTo(p1[0], p1[1])
      }
      ctx.stroke()
      ctx.restore()
    }
    craft.fist(ctx, { palm: f.palm.map(S), fingers: f.fingers.map((g) => g.map(S)), thumb: f.thumb.map(S), cuff: f.cuff.map(S) }, theme)
    if (o.label) label(m, m.ix(X + f.wrist[0] * size), m.iy(Y + f.wrist[1] * size), String(o.label), { place: 'above', offset: 6, background: false })
    return { grip: [x, y], dir }
  }

  /**
   * Laser pointer, side on, aperture at (x, y), aimed along `angle` degrees. Dark anodised body,
   * a knurled grip band, a tail cap and a button; `on` lights the aperture with the single accent.
   */
  function laser(m, x, y, angle, o = {}) {
    const a = +angle || 0
    if ('length' in o && !(o.length > 0)) throw new Error('v.laser 的长度要是正数')
    const len = o.length > 0 ? Math.abs(m.s(o.length)) : 96
    const X = m.x(x)
    const Y = m.y(y)
    const f = laserFrame(a, len)
    const S = (p) => [X + p[0], Y + p[1]]
    const body = f.body.map(S)
    const xs = [...body, ...f.cap.map(S)].map((p) => p[0])
    const ys = [...body, ...f.cap.map(S)].map((p) => p[1])
    addShape(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), BODY)
    craft.solidPoly(ctx, body, 'dark', theme, { line: 'strong' })
    craft.solidPoly(ctx, f.cap.map(S), 'steel', theme, { line: 'strong' })
    const gripPx = f.grip.map(S)
    ctx.save()
    ctx.beginPath()
    body.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])))
    ctx.closePath()
    ctx.clip()
    ctx.strokeStyle = craft.craftTokens(theme).bevel
    ctx.globalAlpha *= night() ? 0.35 : 0.8
    ctx.lineWidth = 0.7
    const g0 = gripPx[0]
    const g1 = gripPx[1]
    const gl = Math.hypot(g1[0] - g0[0], g1[1] - g0[1]) || 1
    ctx.beginPath()
    for (let s = 1.5; s < gl; s += 2.6) {
      const t = s / gl
      ctx.moveTo(g0[0] + (g1[0] - g0[0]) * t, g0[1] + (g1[1] - g0[1]) * t)
      ctx.lineTo(gripPx[3][0] + (gripPx[2][0] - gripPx[3][0]) * t, gripPx[3][1] + (gripPx[2][1] - gripPx[3][1]) * t)
    }
    ctx.stroke()
    ctx.restore()
    craft.solidPoly(ctx, f.button.map(S), 'rubber', theme, { line: 'strong' })
    const aper = S(f.aperture)
    const nose = craft.craftTokens(theme)
    ctx.beginPath()
    ctx.arc(aper[0], aper[1], 2.6, 0, Math.PI * 2)
    ctx.fillStyle = night() ? '#0E1114' : '#2A3038'
    ctx.fill()
    ctx.lineWidth = 0.6
    ctx.strokeStyle = nose.strong.color
    ctx.stroke()
    if (o.on) {
      const lc = lightColor(o.lambda || 650)
      withGlow(lc, 9, () => {
        ctx.beginPath()
        ctx.arc(aper[0] + f.dir[0] * 1.5, aper[1] + f.dir[1] * 1.5, 1.7, 0, Math.PI * 2)
        ctx.fillStyle = lc
        ctx.fill()
      })
    }
    if (o.label) label(m, m.ix(X - f.dir[0] * len * 0.5), m.iy(Y - f.dir[1] * len * 0.5), String(o.label), { offset: 12, background: false })
    const rad = (a * Math.PI) / 180
    return { aperture: [x, y], dir: [Math.cos(rad), Math.sin(rad)], angle: a }
  }

  /** Pixel polygon bounds, registered as one body for the layout check. */
  function noteBody(pts) {
    const xs = pts.map((p) => p[0])
    const ys = pts.map((p) => p[1])
    addShape(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), BODY)
  }

  /**
   * Plough side on, pulled toward +x (`flip: true` for −x), share tip on the ground at (x, y).
   * `kind: 'curved'` (曲辕犁, default) arches a short beam down to a low hitch just ahead of the
   * share; `'straight'` (直辕犁) runs a long horizontal beam forward, `length` (world) past the tip.
   * `size` is the handle height in px (default 72). Returns {tip, hitch, handle}; the traces start at `hitch`.
   */
  function plow(m, x, y, o = {}) {
    const kind = o.kind == null ? 'curved' : o.kind
    if ('size' in o && !(o.size > 0)) throw new Error('v.plow 的尺寸要是正数')
    const H = o.size > 0 ? +o.size : 72
    const L = o.length > 0 ? Math.abs(m.s(o.length)) : undefined
    const f = plowFrame(kind, H, L, !!o.flip)
    const X = m.x(x)
    const Y = m.y(y)
    const S = (p) => [X + p[0], Y + p[1]]
    const parts = [f.beam, f.standard, f.stilt, f.grip, f.sole, f.share, f.moldboard].map((part) => part.map(S))
    noteBody(parts.flat())
    const sole = parts[4].map((p) => p[0])
    if (o.shadow !== false && restsOn(Math.min(...sole), Math.max(...sole), Y)) craft.contactShadow(ctx, Math.min(...sole) + 1, Math.max(...sole) - 1, Y, theme)
    craft.solidPoly(ctx, parts[2], 'steel', theme, { line: 'strong' })
    craft.solidPoly(ctx, parts[1], 'steel', theme, { line: 'strong' })
    craft.solidPoly(ctx, parts[4], 'steel', theme, { line: 'strong' })
    craft.solidPoly(ctx, parts[0], 'steelHi', theme, { line: 'strong' })
    craft.solidPoly(ctx, parts[3], 'rubber', theme, { line: 'strong' })
    craft.solidPoly(ctx, parts[6], 'steelHi', theme, { line: 'strong' })
    craft.solidPoly(ctx, parts[5], 'dark', theme, { line: 'strong' })
    const hitch = S(f.hitch)
    metalRing(hitch[0], hitch[1], 2.8, 1.3)
    const world = (p) => [m.ix(p[0]), m.iy(p[1])]
    if (o.label) label(m, ...world(S([(f.handle[0] + f.hitch[0]) / 2, -H * 1.05])), String(o.label), { place: 'above', offset: 6, background: false })
    return { tip: [x, y], hitch: world(hitch), handle: world(S(f.handle)) }
  }

  /**
   * Electrospray emitter (发射极) side on: needle tip at (x, y), aimed along `angle` degrees
   * (default 0, to the right). Metal barrel, conical head, capillary needle, dark insulating
   * cap at the back where the lead attaches. `length` is the body length (world; default 72 px).
   * Returns {tip, back, dir}: the droplet path starts at `tip`, the supply lead at `back`.
   */
  function emitter(m, x, y, o = {}) {
    const a = +o.angle || 0
    if ('length' in o && !(o.length > 0)) throw new Error('v.emitter 的长度要是正数')
    const len = o.length > 0 ? Math.abs(m.s(o.length)) : 72
    const f = emitterFrame(a, len)
    const X = m.x(x)
    const Y = m.y(y)
    const S = (p) => [X + p[0], Y + p[1]]
    const barrel = f.barrel.map(S)
    noteBody([...barrel, ...f.cap.map(S), ...f.needle.map(S)])
    craft.solidPoly(ctx, barrel, 'alu', theme, { line: 'strong' })
    craft.solidPoly(ctx, f.cap.map(S), 'insul', theme, { line: 'strong' })
    craft.solidPoly(ctx, f.cone.map(S), 'steelHi', theme, { line: 'strong' })
    craft.solidPoly(ctx, f.needle.map(S), 'steel', theme, { line: 'strong' })
    const world = (p) => [m.ix(p[0]), m.iy(p[1])]
    const back = world(S(f.back))
    if (o.label) label(m, ...world(S([(f.back[0] + f.tip[0]) / 2, (f.back[1] + f.tip[1]) / 2])), String(o.label), { offset: Math.max(10, len * 0.18), background: false })
    const rad = (a * Math.PI) / 180
    return { tip: [x, y], back, dir: [Math.cos(rad), Math.sin(rad)], angle: a }
  }

  /**
   * Back cover (背罩) of an entry capsule: a convex shell, rim centre at (x, y), rim width `w`
   * (world). `h` crown height (default 0.42 w). An eye on the crown takes the
   * parachute line. Returns {apex, left, right, rim}; hang the probe (`v.box` or `v.block`) under `rim`.
   */
  function backshell(m, x, y, w, o = {}) {
    if (!(w > 0)) throw new Error('v.backshell 的宽要是正数')
    const W = m.s(w)
    const H = m.s(o.h > 0 ? +o.h : 0.42 * w)
    const f = backshellFrame(W, H)
    const X = m.x(x)
    const Y = m.y(y)
    const S = (p) => [X + p[0], Y + p[1]]
    const outline = f.outline.map(S)
    noteBody(outline)
    craft.solidPoly(ctx, outline, 'steelHi', theme, { line: 'auto' })
    const k = craft.craftTokens(theme)
    ctx.save()
    ctx.beginPath()
    outline.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])))
    ctx.closePath()
    ctx.clip()
    // The cone turns away from the light toward both sides.
    const xs = outline.map((p) => p[0])
    const x0 = Math.min(...xs)
    const x1 = Math.max(...xs)
    const side = ctx.createLinearGradient(x0, 0, x1, 0)
    const edge = night() ? 'rgba(0,0,0,0.34)' : 'rgba(30,40,52,0.18)'
    side.addColorStop(0, edge)
    side.addColorStop(0.3, 'rgba(0,0,0,0)')
    side.addColorStop(0.7, 'rgba(0,0,0,0)')
    side.addColorStop(1, edge)
    ctx.fillStyle = side
    ctx.fillRect(x0, Y - H - 4, x1 - x0, H + 4)
    ctx.strokeStyle = k.seam
    ctx.lineWidth = 0.8
    ctx.setLineDash([])
    for (const seam of f.seams) {
      ctx.beginPath()
      seam.map(S).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])))
      ctx.stroke()
    }
    ctx.restore()
    craft.solidPoly(ctx, f.lip.map(S), 'dark', theme, { line: 'strong' })
    craft.solidPoly(ctx, f.crown.map(S), 'steel', theme, { line: 'strong' })
    const apex = S(f.apex)
    metalRing(apex[0], apex[1] - 2.6, 2.8, 1.3)
    const world = (p) => [m.ix(p[0]), m.iy(p[1])]
    if (o.label) label(m, ...world(S([f.right[0], -H * 0.5])), String(o.label), { place: 'right', offset: 6, background: false })
    return { apex: world([apex[0], apex[1] - 5.4]), left: world(S(f.left)), right: world(S(f.right)), rim: [x, y] }
  }

  /**
   * Inflated airbag on a bench, bottom centre at (x, y), width `w` (world). `h` height
   * (default 0.6 w). `press` (world) dents the top by that much at `at` (world, from the
   * centre), for the moment a head hits it. Returns {top, left, right}: `top` is the surface
   * point above `at`, where a falling object meets the bag.
   */
  function airbag(m, x, y, w, o = {}) {
    if (!(w > 0)) throw new Error('v.airbag 的宽要是正数')
    if ('press' in o && !(+o.press >= 0)) throw new Error('v.airbag 的 press 要是不小于 0 的数')
    const W = m.s(w)
    const H = m.s(o.h > 0 ? +o.h : 0.6 * w)
    const f = airbagFrame(W, H, m.s(+o.press || 0), m.s(+o.at || 0))
    const X = m.x(x)
    const Y = m.y(y)
    const S = (p) => [X + p[0], Y + p[1]]
    const outline = f.outline.map(S)
    const base = f.base.map(S)
    noteBody([...outline, ...base])
    if (o.shadow !== false && restsOn(base[0][0], base[1][0], Y)) craft.contactShadow(ctx, base[0][0] + 1, base[1][0] - 1, Y, theme)
    craft.pillow(ctx, outline, f.seams.map((s) => s.map(S)), theme)
    craft.solidPoly(ctx, base, 'dark', theme, { line: 'strong' })
    const world = (p) => [m.ix(p[0]), m.iy(p[1])]
    if (o.label) label(m, ...world(S(f.right)), String(o.label), { place: 'right', offset: 6, background: false })
    return { top: world(S(f.top)), left: world(S(f.left)), right: world(S(f.right)) }
  }

  /**
   * Split air conditioner. `kind: 'indoor'` (default): wall unit centred on (x, y), outlet and
   * louver underneath. `'outdoor'`: unit standing on the ground at (x, y), fan grille, side
   * vents, rubber feet and two brass pipe valves on the right. `w` width (world; default 160 px),
   * `fan` turns the blades (degrees). Returns {center, top, left, right, ports, air, airDir}.
   */
  function aircon(m, x, y, o = {}) {
    if ('w' in o && !(o.w > 0)) throw new Error('v.aircon 的宽要是正数')
    const W = o.w > 0 ? Math.abs(m.s(o.w)) : 160
    const f = airconFrame(o.kind == null ? 'indoor' : o.kind, W)
    const X = m.x(x)
    const Y = m.y(y)
    const b = f.body
    noteBody([[X + b.x, Y + b.y], [X + b.x + b.w, Y + b.y + b.h + (f.feet ? f.feet[0].h : 0)]])
    const world = (p) => [m.ix(X + p[0]), m.iy(Y + p[1])]
    if (f.kind === 'indoor') {
      craft.solidRect(ctx, X + b.x, Y + b.y, b.w, b.h, 'steelHi', theme, { r: Math.min(8, b.h * 0.22), band: Math.min(5, b.h * 0.12) })
      const ol = f.outlet
      craft.solidRect(ctx, X + ol.x, Y + ol.y, ol.w, ol.h, 'dark', theme, { r: 1.5, band: 0, line: 'strong' })
      craft.solidPoly(ctx, f.louver.map((p) => [X + p[0], Y + p[1]]), 'steel', theme, { line: 'strong' })
      ctx.beginPath()
      ctx.arc(X + b.x + b.w * 0.88, Y + b.y + b.h * 0.42, Math.max(1.4, b.h * 0.045), 0, Math.PI * 2)
      ctx.fillStyle = night() ? '#7FA8B4' : '#5E7480'
      ctx.fill()
      const port = f.ports[0]
      craft.solidRect(ctx, X + port[0] - 3, Y + port[1] - 1, 6, Math.max(6, b.h * 0.18), 'brass', theme, { r: 1, band: 0, line: 'strong' })
    } else {
      if (o.shadow !== false && restsOn(X + b.x, X + b.x + b.w, Y)) craft.contactShadow(ctx, X + b.x + 2, X + b.x + b.w - 2, Y, theme)
      for (const ft of f.feet) craft.solidRect(ctx, X + ft.x, Y + ft.y, ft.w, ft.h, 'rubber', theme, { r: 1, band: 0, line: 'strong' })
      craft.solidRect(ctx, X + b.x, Y + b.y, b.w, b.h, 'steel', theme, { r: 3, band: Math.min(5, b.h * 0.06) })
      const vt = f.vents
      const k = craft.craftTokens(theme)
      ctx.save()
      ctx.strokeStyle = night() ? 'rgba(0,0,0,0.55)' : 'rgba(38,43,50,0.32)'
      ctx.lineWidth = 1.2
      ctx.setLineDash([])
      ctx.beginPath()
      for (let yy = Y + vt.y + 2; yy < Y + vt.y + vt.h; yy += 4.2) {
        ctx.moveTo(X + vt.x, yy)
        ctx.lineTo(X + vt.x + vt.w, yy)
      }
      ctx.stroke()
      ctx.strokeStyle = k.bevel
      ctx.globalAlpha *= night() ? 0.2 : 0.7
      ctx.lineWidth = 0.6
      ctx.beginPath()
      for (let yy = Y + vt.y + 3.2; yy < Y + vt.y + vt.h; yy += 4.2) {
        ctx.moveTo(X + vt.x, yy)
        ctx.lineTo(X + vt.x + vt.w, yy)
      }
      ctx.stroke()
      ctx.restore()
      craft.fanGrille(ctx, X + f.grille.c[0], Y + f.grille.c[1], f.grille.r, theme, +o.fan || 0)
      for (const p of f.ports) craft.solidRect(ctx, X + p[0], Y + p[1] - 3, 7, 6, 'brass', theme, { r: 1, band: 0, line: 'strong' })
    }
    if (o.label) label(m, ...world([0, b.y]), String(o.label), { place: 'above', offset: 6, background: false })
    const ports = f.ports.map((p) => world(f.kind === 'indoor' ? [p[0], p[1] + Math.max(6, b.h * 0.18)] : [p[0] + 7, p[1]]))
    return {
      center: world([0, b.y + b.h / 2]),
      top: world([0, b.y]),
      left: world([b.x, b.y + b.h / 2]),
      right: world([b.x + b.w, b.y + b.h / 2]),
      ports,
      air: world(f.air),
      airDir: [f.airDir[0], -f.airDir[1]],
    }
  }

  /** Right-angle incline from (x, y) rising to the right over w × h (physical). */
  function incline(m, x, y, w, h, o = {}) {
    const flip = !!o.flip
    const A = [m.x(x), m.y(y)]
    const B = [m.x(x + w), m.y(y)]
    const C = flip ? [m.x(x), m.y(y + h)] : [m.x(x + w), m.y(y + h)]
    const tri = [A, B, C]
    craft.contactShadow(ctx, A[0], B[0], A[1], theme)
    craft.solidPoly(ctx, tri, 'steel', theme, { bandEdge: flip ? [1, 2] : [0, 2], band: 5 })
    const vh = Math.abs(A[1] - C[1])
    const base = Math.abs(B[0] - A[0])
    if (vh > 50 && base > 80) {
      // end plate on the vertical face; the middle of the slope face stays empty for force arrows
      const capW = Math.max(6, Math.min(9, vh * 0.06))
      const capX = flip ? A[0] : B[0] - capW
      ctx.save()
      ctx.beginPath()
      tri.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)))
      ctx.closePath()
      ctx.clip()
      craft.endCap(ctx, capX, C[1], capW, vh, theme)
      ctx.restore()
      const soft = craft.craftTokens(theme).soft
      ctx.beginPath()
      tri.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)))
      ctx.closePath()
      ctx.strokeStyle = soft.color
      ctx.lineWidth = soft.width
      ctx.setLineDash([])
      ctx.stroke()
    }
    surface(A[0], B[0], A[1])
    const apex = flip ? B : A
    const ang = Math.atan2(Math.abs(C[1] - A[1]), Math.abs(B[0] - A[0]))
    stroke({ color: colors.graphite, width: 1 })
    ctx.beginPath()
    if (flip) ctx.arc(apex[0], apex[1], 26, Math.PI + ang, Math.PI, true)
    else ctx.arc(apex[0], apex[1], 26, -ang, 0)
    ctx.stroke()
    if (o.angleLabel) {
      const mid = ang / 2
      const lx = apex[0] + (flip ? -1 : 1) * Math.cos(mid) * 38
      const ly = apex[1] - Math.sin(mid) * 38
      pendingTexts.push([lx, ly, String(o.angleLabel), { size: 13, color: colors.ink }])
    }
  }

  function cylinder(m, x, y, w, h, piston, o = {}) {
    const X = m.x(x)
    const W = m.s(w)
    const Yb = m.y(y)
    const Yt = m.y(y + h)
    const Yp = m.y(piston)
    const wall = 5
    craft.solidRect(ctx, X - wall, Yb, W + wall * 2, wall, 'steel', theme, { band: 1.5, r: 1, line: 'strong' })
    craft.solidRect(ctx, X - wall, Yt, wall, Yb - Yt, 'steel', theme, { band: 1.5, r: 1, line: 'strong', rim: false })
    craft.solidRect(ctx, X + W, Yt, wall, Yb - Yt, 'steel', theme, { band: 1.5, r: 1, line: 'strong', rim: false })
    // gas
    const n = o.molecules ?? 18
    const temp = o.temp ?? 1
    if (n > 0) {
      ambient = true
      const now = performance.now() / 1000
      ctx.fillStyle = colors.graphite
      for (let i = 0; i < n; i++) {
        const fx = (Math.sin(i * 12.9898) * 43758.5453) % 1
        const fy = (Math.sin(i * 78.233) * 12345.678) % 1
        const sp = 0.6 + Math.abs(fx) * temp
        const px = X + 6 + (W - 12) * (0.5 + 0.5 * Math.sin(now * sp * 1.7 + i * 2.1))
        const py = Yp + 10 + (Yb - Yp - 16) * (0.5 + 0.5 * Math.sin(now * sp * 1.3 + i * 3.7 + fy * 6))
        ctx.beginPath()
        ctx.arc(px, py, 1.8, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    // piston + rod
    const rodH = o.rod ?? 40
    craft.solidRect(ctx, X + W / 2 - 4, Yp - 10 - rodH, 8, rodH, 'alu', theme, { band: 0, r: 1, line: 'strong', brush: false })
    steelRect(X, Yp - 10, W, 10)
    addShape(X - wall, Yt, W + wall * 2, Yb - Yt)
    if (o.heat) {
      ambient = true
      const now = performance.now() / 1000
      stroke({ color: colors.force, width: 1.3 })
      for (let k = 0; k < 3; k++) {
        const cx = X + W * (0.25 + k * 0.25)
        ctx.beginPath()
        for (let s = 0; s <= 20; s++) {
          const yy = Yb + wall + 8 + s * 1.3
          const xx = cx + Math.sin(s * 0.7 - now * 6 + k) * 3
          s ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy)
        }
        ctx.stroke()
      }
    }
  }
