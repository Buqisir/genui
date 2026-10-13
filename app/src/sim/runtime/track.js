// Sandbox runtime, part: rail tracks, photogates, timer, wire, transformer.
  // Rail profile along polylines: flat body, lit band at the running surface,
  // bevel and seam lines, soft far edge. Joints are filled so bends stay closed.
  function railStrips(strips, T) {
    const k = craft.craftTokens(theme)
    const mat = k.materials.steel
    const body = mat.stops[Math.floor(mat.stops.length / 2)][1]
    const off = (S, d) => S.P.map((pt, i) => [pt[0] + S.N[i][0] * d, pt[1] + S.N[i][1] * d])
    const poly = (A, B, fill) => {
      ctx.beginPath()
      A.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y)))
      for (let i = B.length - 1; i >= 0; i--) ctx.lineTo(B[i][0], B[i][1])
      ctx.closePath()
      ctx.fillStyle = fill
      ctx.fill()
    }
    const run = (A, color, width, alpha = 1) => {
      ctx.save()
      ctx.globalAlpha *= alpha
      ctx.strokeStyle = color
      ctx.lineWidth = width
      ctx.setLineDash([])
      ctx.lineJoin = 'round'
      ctx.beginPath()
      A.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y)))
      ctx.stroke()
      ctx.restore()
    }
    const band = Math.min(3, T * 0.35)
    for (const S of strips) {
      const far = off(S, T)
      poly(S.P, far, body)
      // darken toward the far edge
      poly(off(S, T * 0.6), far, 'rgba(25,30,38,' + (night() ? 0.18 : 0.08) + ')')
      poly(S.P, off(S, band), mat.top)
    }
    for (let i = 1; i < strips.length; i++) {
      const a = strips[i - 1]
      const b = strips[i]
      const J = a.P[a.P.length - 1]
      const J2 = b.P[0]
      if (Math.hypot(J[0] - J2[0], J[1] - J2[1]) > 1.5) continue
      const qa = off(a, T)[a.P.length - 1]
      const qb = off(b, T)[0]
      ctx.beginPath()
      ctx.moveTo(J[0], J[1])
      ctx.lineTo(qa[0], qa[1])
      ctx.lineTo(qb[0], qb[1])
      ctx.closePath()
      ctx.fillStyle = body
      ctx.fill()
      run([qa, qb], k.soft.color, k.soft.width)
    }
    for (const S of strips) {
      run(off(S, 0.7), k.bevel, 0.9, night() ? 0.4 : 1)
      run(off(S, band), k.seam, 0.6)
      run(off(S, band + 0.9), k.bevel, 0.6, k.glint)
      run(off(S, T), k.soft.color, k.soft.width)
      run(S.P, k.strong.color, 1.1)
    }
    const first = strips[0]
    const last = strips[strips.length - 1]
    run([first.P[0], off(first, T)[0]], k.soft.color, k.soft.width)
    run([last.P[last.P.length - 1], off(last, T)[last.P.length - 1]], k.soft.color, k.soft.width)
  }

  /**
   * Track made of straight and circular pieces, hatched on the solid side
   * (right of the direction of travel, so a left-to-right floor is hatched below and
   * a counter-clockwise arc is hatched outside). Pieces:
   *   {line: [x1, y1, x2, y2]}  {arc: [cx, cy, r, fromDeg, toDeg]}  (+ hatch:false / flip / pipe)
   * `pipe: true` (or o.pipe) draws two walls and no hatch; at(s) stays on the centerline.
   * `pieces` may be a <Motion track> object (`v.track(m, p.ball)`), using its `.track`.
   * Returns {length, at(s) -> [x, y, angleRad]} in physical units for placing a body.
   */
  function track(m, pieces, o = {}) {
    if (pieces && typeof pieces === 'object' && !Array.isArray(pieces) && Array.isArray(pieces.track)) pieces = pieces.track
    const segs = []
    let total = 0
    for (const pc of pieces || []) {
      let L = 0
      let at
      if (pc.line) {
        const [x1, y1, x2, y2] = pc.line
        L = Math.hypot(x2 - x1, y2 - y1)
        const a = Math.atan2(y2 - y1, x2 - x1)
        at = (s) => [x1 + (x2 - x1) * (s / (L || 1)), y1 + (y2 - y1) * (s / (L || 1)), a]
      } else if (pc.arc) {
        const [cx, cy, r, d1, d2] = pc.arc
        const a1 = (d1 * Math.PI) / 180
        const a2 = (d2 * Math.PI) / 180
        L = Math.abs(a2 - a1) * r
        const dirn = Math.sign(a2 - a1) || 1
        at = (s) => {
          const a = a1 + (dirn * s) / r
          return [cx + r * Math.cos(a), cy + r * Math.sin(a), a + (dirn * Math.PI) / 2]
        }
      } else continue
      segs.push({ pc, L, at, start: total })
      total += L
    }
    const point = (s) => {
      const k = Math.max(0, Math.min(total, s))
      const sg = segs.find((g) => k <= g.start + g.L + 1e-9) || segs[segs.length - 1]
      return sg ? sg.at(k - sg.start) : [0, 0, 0]
    }
    const color = o.color || colors.ink
    const strips = []
    for (const sg of segs) {
      const pxLen = sg.pc.line ? Math.hypot(m.x(sg.pc.line[2]) - m.x(sg.pc.line[0]), m.y(sg.pc.line[3]) - m.y(sg.pc.line[1])) : Math.abs(m.s(sg.L))
      const n = Math.max(2, Math.ceil(pxLen / 4))
      const P = []
      for (let i = 0; i <= n; i++) {
        const [x, y] = sg.at((sg.L * i) / n)
        P.push([m.x(x), m.y(y)])
      }
      // v.ball has no default radius (the lesson passes one, in physical units). A pipe's
      // screen gap defaults to 18px: about a 14px ball plus 4px of clearance.
      const piped = !!(sg.pc.pipe || o.pipe)
      if (piped) {
        const half = (o.pipeWidth ?? 18) / 2
        const walls = [1, -1].map((sign) =>
          P.map((pt, i) => {
            const prev = P[Math.max(0, i - 1)]
            const next = P[Math.min(P.length - 1, i + 1)]
            let tx = next[0] - prev[0]
            let ty = next[1] - prev[1]
            const d = Math.hypot(tx, ty) || 1
            tx /= d
            ty /= d
            // Screen y points down; (-ty, tx) is the right-hand normal of travel.
            return [pt[0] + -ty * sign * half, pt[1] + tx * sign * half]
          }),
        )
        for (const Q of walls) {
          stroke({ color, width: o.width || 1.6, dash: sg.pc.dash })
          ctx.beginPath()
          Q.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y)))
          ctx.stroke()
          ctx.setLineDash([])
          for (let i = 0; i < Q.length; i += 2) addShape(Q[i][0] - 2, Q[i][1] - 2, 4, 4)
        }
      } else if (sg.pc.hatch !== false && o.hatch !== false && !sg.pc.dash && !o.color) {
        // Solid side as a lit rail profile instead of hatching.
        const side = (sg.pc.flip ? -1 : 1) * (o.flip ? -1 : 1)
        const N = P.map((pt, i) => {
          const prev = P[Math.max(0, i - 1)]
          const next = P[Math.min(P.length - 1, i + 1)]
          const d = Math.hypot(next[0] - prev[0], next[1] - prev[1]) || 1
          return [(-(next[1] - prev[1]) / d) * side, ((next[0] - prev[0]) / d) * side]
        })
        strips.push({ P, N })
        for (let i = 0; i < P.length; i += 2) addShape(P[i][0] - 2, P[i][1] - 2, 4, 4)
      } else {
        if (sg.pc.hatch !== false && o.hatch !== false) {
          const side = (sg.pc.flip ? -1 : 1) * (o.flip ? -1 : 1)
          stroke({ color: colors.steel, width: 1 })
          ctx.beginPath()
          let acc = 4
          for (let i = 1; i < P.length; i++) {
            const dx = P[i][0] - P[i - 1][0]
            const dy = P[i][1] - P[i - 1][1]
            const d = Math.hypot(dx, dy)
            if (!d) continue
            acc += d
            if (acc < 9) continue
            acc = 0
            const tx = dx / d
            const ty = dy / d
            // Screen y points down, so the right-hand normal of travel is (-ty, tx).
            const nx = -ty * side
            const ny = tx * side
            ctx.moveTo(P[i][0] + nx, P[i][1] + ny)
            ctx.lineTo(P[i][0] + (nx - tx) * 5.5, P[i][1] + (ny - ty) * 5.5)
          }
          ctx.stroke()
        }
        stroke({ color, width: o.width || 1.6, dash: sg.pc.dash })
        ctx.beginPath()
        P.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y)))
        ctx.stroke()
        ctx.setLineDash([])
        for (let i = 0; i < P.length; i += 2) addShape(P[i][0] - 2, P[i][1] - 2, 4, 4)
      }
    }
    if (strips.length) railStrips(strips, o.thick || 8)
    for (const mk of o.marks || []) {
      const [x, y] = mk.s !== undefined ? point(mk.s) : [mk.x, mk.y]
      ctx.beginPath()
      ctx.arc(m.x(x), m.y(y), 2.6, 0, Math.PI * 2)
      ctx.fillStyle = colors.ink
      ctx.fill()
      if (mk.label) label(m, x, y, mk.label, { place: mk.place || 'above', offset: 7, background: false })
    }
    // A ball of radius r resting on a one-sided piece sits r off the line, toward the body side.
    const place = (st, r) => {
      if (!st || !st.side) return [st.x, st.y]
      const a = ((st.normalDir || 0) * Math.PI) / 180
      return [st.x + r * Math.cos(a), st.y + r * Math.sin(a)]
    }
    return { length: total, at: point, place }
  }

  /**
   * Photogate seen from the side: housings above y2 and below y1, light beam
   * between them. A flag passing between y1 and y2 cuts the beam; pass
   * `blocked: true` to light the beam up. `horizontal: true` turns the gate so the
   * beam runs across at height `x` from `y1` to `y2` (read the arguments as y, x1, x2),
   * for a ball falling or rising through it.
   */
  function photogate(m, x, y1, y2, o = {}) {
    if (o.horizontal) return photogateAcross(m, x, Math.min(y1, y2), Math.max(y1, y2), o)
    const X = m.x(x)
    const Yt = m.y(Math.max(y1, y2))
    const Yb = m.y(Math.min(y1, y2))
    const w = o.size || 18
    const hh = 10
    const back = o.back === 'left' ? -1 : 1
    // Housings and the back bar form a fork (コ) that opens toward the passing flag.
    const bx = back > 0 ? X + w / 2 - 4 : X - w / 2
    craft.solidRect(ctx, bx, Yt - hh, 4, Yb - Yt + 2 * hh, 'dark', theme, { band: 0, r: 1, line: 'strong', rim: false })
    for (const Y of [Yt - hh, Yb]) {
      craft.solidRect(ctx, X - w / 2, Y, w, hh, 'dark', theme, { band: Y === Yb ? 0 : 2, r: 2, line: 'strong' })
      addShape(X - w / 2, Y, w, hh)
    }
    for (const [Y, d] of [[Yt, 1], [Yb, -1]]) {
      ctx.beginPath()
      ctx.arc(X, Y + d * 1.5, 1.6, 0, Math.PI * 2)
      ctx.fillStyle = o.blocked ? colors.charge : night() ? '#4A4F57' : '#8E959E'
      ctx.fill()
    }
    // status LED on the upper housing: lit only while the beam is blocked
    withGlow(colors.charge, o.blocked ? 8 : 0, () => {
      ctx.beginPath()
      ctx.arc(X - back * (w / 2 - 4.5), Yt - hh / 2, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = o.blocked ? colors.charge : night() ? '#2A2D32' : '#5E646D'
      ctx.fill()
    })
    const c = o.blocked ? colors.charge : colors.steel
    withGlow(c, o.blocked ? 10 : 0, () => {
      stroke({ color: c, width: o.blocked ? 2 : 1.2, dash: o.blocked ? [] : [3, 3] })
      ctx.beginPath()
      ctx.moveTo(X, Yt)
      ctx.lineTo(X, Yb)
      ctx.stroke()
      ctx.setLineDash([])
    })
    if (o.post !== undefined) {
      // The stand is mounted beside the track, i.e. behind the slider in side view:
      // paint it under whatever is already drawn, whichever order the lesson uses.
      ctx.save()
      ctx.globalCompositeOperation = 'destination-over'
      stroke({ color: colors.ink, width: 1.4 })
      ctx.beginPath()
      ctx.moveTo(X, Yb + hh)
      ctx.lineTo(X, m.y(o.post))
      ctx.stroke()
      ctx.restore()
    }
    if ('time' in o) timerBox(X + (back > 0 ? w / 2 : -w / 2), Yt - hh, o, back)
    if (o.label) pendingLabels.push([X, Yt - hh, String(o.label), { place: o.place || 'above', offset: 6, background: false }])
  }

  function photogateAcross(m, y, x1, x2, o) {
    const Y = m.y(y)
    const Xl = m.x(x1)
    const Xr = m.x(x2)
    const w = o.size || 18
    const hh = 10
    const side = o.back === 'left' ? -1 : 1
    for (const X of [Xl - hh, Xr]) {
      craft.solidRect(ctx, X, Y - w / 2, hh, w, 'dark', theme, { band: 2, r: 2, line: 'strong' })
      addShape(X, Y - w / 2, hh, w)
    }
    // The fork's back bar sits behind the ball's path in side view.
    ctx.save()
    ctx.globalCompositeOperation = 'destination-over'
    craft.solidRect(ctx, Xl - hh, Y + w / 2 - 4, Xr - Xl + 2 * hh, 4, 'dark', theme, { band: 0, r: 1, line: 'none', rim: false })
    ctx.restore()
    for (const [X, d] of [[Xl, 1], [Xr, -1]]) {
      ctx.beginPath()
      ctx.arc(X + d * 1.5, Y, 2, 0, Math.PI * 2)
      ctx.fillStyle = colors.charge
      ctx.fill()
    }
    const c = o.blocked ? colors.charge : colors.steel
    withGlow(c, o.blocked ? 10 : 0, () => {
      stroke({ color: c, width: o.blocked ? 2 : 1.2, dash: o.blocked ? [] : [3, 3] })
      ctx.beginPath()
      ctx.moveTo(Xl, Y)
      ctx.lineTo(Xr, Y)
      ctx.stroke()
      ctx.setLineDash([])
    })
    const Xs = side > 0 ? Xr + hh / 2 : Xl - hh / 2
    if (o.post !== undefined) {
      ctx.save()
      ctx.globalCompositeOperation = 'destination-over'
      stroke({ color: colors.ink, width: 1.4 })
      ctx.beginPath()
      ctx.moveTo(Xs, Y + w / 2)
      ctx.lineTo(Xs, m.y(o.post))
      ctx.stroke()
      ctx.restore()
    }
    if ('time' in o) timerBox(side > 0 ? Xr + hh : Xl - hh, Y - w / 2, o, side)
    if (o.label) pendingLabels.push([side > 0 ? Xl - hh : Xr + hh, Y, String(o.label), { place: o.place || (side > 0 ? 'left' : 'right'), offset: 6, background: false }])
  }

  /**
   * Digital timer (数字计时器) wired to a photogate: shows `time` (seconds, or a
   * ready-made string). null/NaN shows dashes, i.e. nothing measured yet.
   */
  function timerBox(X0, Y0, o, side0) {
    const v = o.time
    // Nothing measured yet: an idle outline reading 待测, not a black display that looks broken.
    const idle = typeof v !== 'string' && (v === null || v === undefined || !Number.isFinite(v))
    const str = typeof v === 'string' ? v : idle ? '待测' : `${v.toFixed(o.digits ?? 3)} s`
    ctx.font = font(12, 600, idle ? 'sans' : 'mono')
    const tw = Math.max(58, ctx.measureText(str).width + 16)
    const th = 22
    const labelW = o.timeLabel ? measureSegs(segments(String(o.timeLabel)), 12, 500) + 6 : 0
    // Beside the gate on its back side, else the other side, else higher up: the first spot
    // where the display and its label cover nothing already drawn (a track, a cart).
    const spots = [[side0, 0], [-side0, 0], [side0, th + 10], [-side0, th + 10]].map(([s, up]) => {
      const bx = s > 0 ? X0 + 16 : X0 - 16 - tw
      const by = Y0 - th - 14 - up
      const lx = s > 0 ? bx : bx - labelW
      return { s, bx, by, box: { x: lx, y: by, w: tw + labelW, h: th } }
    })
    const spot = spots.find((p) => !frameShapes.some((q) => hit(q, p.box))) || spots[0]
    const { s: side, bx, by } = spot
    stroke({ color: colors.steel, width: 1 })
    ctx.beginPath()
    ctx.moveTo(X0, Y0 + 3)
    ctx.bezierCurveTo(X0 + side * 10, Y0 - 4, side > 0 ? bx - 6 : bx + tw + 6, by + th / 2, side > 0 ? bx : bx + tw, by + th / 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.roundRect(bx, by, tw, th, 4)
    if (idle) {
      ctx.fillStyle = colors.stage || colors.enamel
      ctx.fill()
      stroke({ color: colors.steel, width: 1, dash: [3, 3] })
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = colors.steel
    } else {
      ctx.fillStyle = night() ? '#05060A' : colors.ink
      ctx.fill()
      stroke({ color: night() ? colors.steel : colors.ink, width: 1 })
      ctx.stroke()
      ctx.fillStyle = night() ? colors.ink : colors.enamel
    }
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(str, bx + tw / 2, by + th / 2 + 0.5)
    addShape(bx, by, tw, th)
    if (o.timeLabel) pendingTexts.push([side > 0 ? bx + tw + 6 : bx - 6, by + th / 2, String(o.timeLabel), { size: 12, color: colors.graphite, align: side > 0 ? 'left' : 'right' }])
  }

  /**
   * Long straight wire seen end-on: ⊙ (current out of the page) or ⊗ (into it),
   * with concentric field circles whose arrows follow the right-hand rule.
   */
  function wire(m, x, y, o = {}) {
    const X = m.x(x)
    const Y = m.y(y)
    const out = o.dir !== 'in'
    const fc = o.color || colors.field
    const radii = o.rings ?? [26, 44, 64]
    for (const [k, R] of radii.entries()) {
      ctx.save()
      ctx.globalAlpha = 0.9 - k * 0.18
      withGlow(fc, 6, () => {
        stroke({ color: fc, width: 1.2 })
        ctx.beginPath()
        ctx.arc(X, Y, R, 0, Math.PI * 2)
        ctx.stroke()
      })
      ctx.restore()
      // Out of the page → counter-clockwise on screen, i.e. decreasing canvas angle.
      const a = -Math.PI / 4 + k * 2.1
      const s = out ? -1 : 1
      const px = X + R * Math.cos(a)
      const py = Y + R * Math.sin(a)
      const tx = -Math.sin(a) * s
      const ty = Math.cos(a) * s
      headPx(px + tx * 4, py + ty * 4, tx, ty, 9, fc)
    }
    const r = o.r || 9
    // The wire's end face is a lit disc; the ⊙/⊗ mark and its ring stay ink so the symbol reads.
    craft.sphere(ctx, X, Y, r, 'steelHi', theme, { line: 'none' })
    ctx.beginPath()
    ctx.arc(X, Y, r, 0, Math.PI * 2)
    stroke({ color: colors.ink, width: 1.4 })
    ctx.stroke()
    if (out) {
      ctx.beginPath()
      ctx.arc(X, Y, 2.4, 0, Math.PI * 2)
      ctx.fillStyle = colors.ink
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.moveTo(X - r * 0.55, Y - r * 0.55)
      ctx.lineTo(X + r * 0.55, Y + r * 0.55)
      ctx.moveTo(X - r * 0.55, Y + r * 0.55)
      ctx.lineTo(X + r * 0.55, Y - r * 0.55)
      ctx.stroke()
    }
    addShape(X - r, Y - r, 2 * r, 2 * r)
    if (o.label) pendingLabels.push([X, Y, String(o.label), { place: o.place || 'below-right', offset: r + 2, background: false }])
  }

  /**
   * Iron-core transformer: square core, primary coil on the left limb and
   * secondary on the right, turns drawn in proportion (n1, n2). Size in px.
   * Returns the four terminal points in physical units: {p: [top, bottom], s: [top, bottom]}.
   */
  function transformer(m, x, y, o = {}) {
    if (o.style === 'lab') return transformerLab(m, x, y, o)
    const X = m.x(x)
    const Y = m.y(y)
    const W = o.w || 120
    const H = o.h || 110
    const T = 14
    const L = X - W / 2
    const R = X + W / 2
    const top = Y - H / 2
    const bot = Y + H / 2
    ctx.save()
    const kc = craft.craftTokens(theme)
    const g = ctx.createLinearGradient(0, top, 0, bot)
    for (const [off, c] of kc.materials.steel.stops) g.addColorStop(off, c)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.rect(L, top, W, H)
    ctx.rect(L + T, top + T, W - 2 * T, H - 2 * T)
    ctx.fill('evenodd')
    // lit top edges of the outer frame and the window's lower sill
    ctx.fillStyle = kc.materials.steel.top
    ctx.fillRect(L, top, W, 3)
    ctx.fillRect(L + T, bot - T, W - 2 * T, 3)
    ctx.strokeStyle = kc.strong.color
    ctx.lineWidth = kc.strong.width
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.rect(L, top, W, H)
    ctx.rect(L + T, top + T, W - 2 * T, H - 2 * T)
    ctx.stroke()
    ctx.restore()
    addShape(L, top, W, H)
    const n1 = o.n1 || 1
    const n2 = o.n2 || 1
    const most = Math.max(n1, n2)
    const span = H - 2 * T - 12
    const turns = (n) => Math.max(3, Math.min(14, Math.round((12 * n) / most)))
    const terms = {}
    for (const [side, n, key] of [[-1, n1, 'p'], [1, n2, 's']]) {
      const k = turns(n)
      const limb = side < 0 ? L : R - T
      const pitch = span / k
      const y0 = top + T + 6
      const ext = 5
      // Outer edge of the limb: both leads leave from here so they never cross the core.
      const outer = side < 0 ? limb - ext : limb + T + ext
      const inner = side < 0 ? limb + T + ext : limb - ext
      const cc = o.coilColor || colors.charge
      ctx.save()
      ctx.globalAlpha = 0.35
      stroke({ color: cc, width: 1.6 })
      ctx.beginPath()
      for (let i = 0; i < k; i++) {
        ctx.moveTo(inner, y0 + pitch * (i + 0.5))
        ctx.lineTo(outer, y0 + pitch * (i + 1))
      }
      ctx.stroke()
      ctx.restore()
      withGlow(cc, 6, () => {
        stroke({ color: cc, width: 1.8 })
        ctx.beginPath()
        for (let i = 0; i < k; i++) {
          ctx.moveTo(outer, y0 + pitch * i)
          ctx.lineTo(inner, y0 + pitch * (i + 0.5))
        }
        ctx.stroke()
      })
      const yTop = y0
      const yBot = y0 + pitch * k
      const reach = o.leads ?? 26
      const outX = side < 0 ? L - reach : R + reach
      stroke({ color: colors.ink, width: 1.4 })
      ctx.beginPath()
      ctx.moveTo(outer, yTop)
      ctx.lineTo(outX, yTop)
      ctx.moveTo(outer, yBot)
      ctx.lineTo(outX, yBot)
      ctx.stroke()
      for (const ty of [yTop, yBot]) {
        ctx.beginPath()
        ctx.arc(outX, ty, 3, 0, Math.PI * 2)
        ctx.fillStyle = colors.stage || colors.enamel
        ctx.fill()
        stroke({ color: colors.ink, width: 1.4 })
        ctx.stroke()
      }
      terms[key] = [[m.ix(outX), m.iy(yTop)], [m.ix(outX), m.iy(yBot)]]
    }
    const lab1 = o.label1 ?? 'n_1'
    const lab2 = o.label2 ?? 'n_2'
    const wide = (s) => (s ? measureSegs(segments(String(s)), 13, 500) : 0)
    // Names like 原线圈 / 副线圈 do not fit side by side in the core window; they go under each limb instead.
    const inside = wide(lab1) + wide(lab2) + 28 <= W - 2 * T
    for (const [lab, side] of [[lab1, -1], [lab2, 1]]) {
      if (!lab) continue
      if (inside) pendingTexts.push([side < 0 ? L + T + 10 : R - T - 10, Y, String(lab), { size: 13, color: colors.ink, align: side < 0 ? 'left' : 'right' }])
      else pendingTexts.push([side < 0 ? L + T / 2 : R - T / 2, bot + 13, String(lab), { size: 13, color: colors.ink }])
    }
    return terms
  }
