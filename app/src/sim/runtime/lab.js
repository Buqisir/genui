// Sandbox runtime, part: lab apparatus (formulas match src/sim/apparatus.ts).
  // ---------- lab apparatus. Formulas match src/sim/apparatus.ts ----------

  const HALL_OPP = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }

  /** Thin metal plate seen edge-on, any direction: dark part, lit along its upper side. */
  function plateBar(X1, Y1, X2, Y2, thick) {
    const len = Math.hypot(X2 - X1, Y2 - Y1)
    if (len < 1) return
    let nx = -(Y2 - Y1) / len
    let ny = (X2 - X1) / len
    if (ny > 0) {
      nx = -nx
      ny = -ny
    }
    const h = thick / 2
    const pts = [[X1 + nx * h, Y1 + ny * h], [X2 + nx * h, Y2 + ny * h], [X2 - nx * h, Y2 - ny * h], [X1 - nx * h, Y1 - ny * h]]
    craft.solidPoly(ctx, pts, 'dark', theme, { bandEdge: [0, 1], band: Math.min(2, thick * 0.3), line: 'strong' })
  }

  function drawPlatePair(m, pair, o) {
    const flip = o.signs === 'flip'
    const segs = [
      [pair.top, flip ? '−' : '+'],
      [pair.bot, flip ? '+' : '−'],
    ]
    const mids = segs.map(([seg]) => {
      const X1 = m.x(seg[0][0])
      const Y1 = m.y(seg[0][1])
      const X2 = m.x(seg[1][0])
      const Y2 = m.y(seg[1][1])
      return [(X1 + X2) / 2, (Y1 + Y2) / 2, X1, Y1, X2, Y2]
    })
    segs.forEach(([, sign], idx) => {
      const [mx, my, X1, Y1, X2, Y2] = mids[idx]
      const len = Math.hypot(X2 - X1, Y2 - Y1)
      if (len < 1) return
      plateBar(X1, Y1, X2, Y2, 6)
      const nStep = Math.max(1, Math.ceil(len / 8))
      for (let i = 0; i <= nStep; i++) addShape(X1 + ((X2 - X1) * i) / nStep - 3, Y1 + ((Y2 - Y1) * i) / nStep - 3, 6, 6)
      if (o.signs === false) return
      const other = mids[1 - idx]
      let nx = -(Y2 - Y1) / len
      let ny = (X2 - X1) / len
      if ((mx - other[0]) * nx + (my - other[1]) * ny < 0) {
        nx = -nx
        ny = -ny
      }
      // Midpoint, off the plate, so end-point letters (A、B、C) are not covered.
      pendingTexts.push([mx + nx * 16, my + ny * 16, sign, { size: 15, color: colors.ink }])
    })
  }

  /**
   * Demountable lab transformer. The U stands on the base; each bobbin wraps one
   * leg and rests on the bottom bar, with iron left showing above the coil.
   * The yoke is the core's outer width and lies on the leg tops (or is lifted).
   * Tap posts sit on the terminal strip, under the yoke. Side-view laminations
   * run parallel to the core outline (平行于铁芯轮廓): vertical in the legs,
   * horizontal in the bar and the yoke.
   */
  function transformerLab(m, x, y, o) {
    const lay = labTransformerLayout(o)
    const X = m.x(x)
    const Y = m.y(y)
    const at = (dx, dy) => [m.ix(X + dx), m.iy(Y + dy)]
    const L = X - lay.outerHalf
    const R = X + lay.outerHalf
    const top = Y + lay.legTop
    const bot = Y + lay.legBot
    const bar = Y + lay.barTop
    const innerL = X + lay.legCX[0] + lay.legW / 2
    const innerR = X + lay.legCX[1] - lay.legW / 2
    const kc = craft.craftTokens(theme)
    // Silicon-steel stack: a shade darker than the steel base so the core reads as its own part.
    const ironStops = night()
      ? [[0, '#555A62'], [0.5, '#43474E'], [1, '#2F3237']]
      : [[0, '#C3C8CE'], [0.5, '#A9AEB6'], [1, '#8D939B']]
    const ironGrad = (y0, y1) => {
      const g = ctx.createLinearGradient(0, y0, 0, y1)
      for (const [off, c] of ironStops) g.addColorStop(off, c)
      return g
    }
    const lamSeam = night() ? 'rgba(0,0,0,0.45)' : 'rgba(38,43,50,0.26)'
    const lamGlint = night() ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.45)'
    // Enamelled copper seen side-on: lit a little left of centre, dark at both edges.
    const copperStops = night()
      ? [[0, '#4E220C'], [0.25, '#A85A30'], [0.4, '#C27A4E'], [0.62, '#934A24'], [1, '#4E220C']]
      : [[0, '#7A3214'], [0.25, '#D27442'], [0.4, '#EFA272'], [0.62, '#C0602F'], [1, '#7A3214']]
    const copperLine = night() ? 'rgba(0,0,0,0.35)' : 'rgba(90,30,10,0.32)'
    const lamLines = (draw) => {
      for (const [color, dx] of [[lamSeam, 0], [lamGlint, 1]]) {
        ctx.strokeStyle = color
        ctx.lineWidth = 0.7
        ctx.beginPath()
        draw(dx)
        ctx.stroke()
      }
    }
    const iron = () => {
      ctx.beginPath()
      ctx.moveTo(L, top)
      ctx.lineTo(L, bot)
      ctx.lineTo(R, bot)
      ctx.lineTo(R, top)
      ctx.lineTo(innerR, top)
      ctx.lineTo(innerR, bar)
      ctx.lineTo(innerL, bar)
      ctx.lineTo(innerL, top)
      ctx.closePath()
    }
    const base = lay.base
    craft.ambientShadow(ctx, X + base.x0, X + base.x1, Y + base.y1 + 5, theme)
    for (const fx of [base.x0 + 14, base.x1 - 22]) craft.solidRect(ctx, X + fx, Y + base.y1, 8, 5, 'rubber', theme, { band: 0, r: 1, rim: false, line: 'none' })
    craft.solidRect(ctx, X + base.x0, Y + base.y0, base.x1 - base.x0, base.y1 - base.y0, 'steel', theme, { r: 1.5 })
    iron()
    ctx.fillStyle = ironGrad(top, bot)
    ctx.fill('evenodd')
    ctx.save()
    iron()
    ctx.clip('evenodd')
    lamLines((d) => {
      for (const cx of lay.legCX) {
        const xL = X + cx - lay.legW / 2
        const xR = X + cx + lay.legW / 2
        for (let lx = xL + 4; lx < xR - 2; lx += 4) {
          ctx.moveTo(lx + d, top + 2)
          ctx.lineTo(lx + d, bar - 1)
        }
      }
      for (let hy = bar + 4; hy < bot - 2; hy += 4) {
        ctx.moveTo(L + 3, hy + d)
        ctx.lineTo(R - 3, hy + d)
      }
    })
    ctx.restore()
    iron()
    ctx.strokeStyle = kc.strong.color
    ctx.lineWidth = kc.strong.width
    ctx.setLineDash([])
    ctx.stroke()
    const yoke = lay.yoke
    const yx = X + yoke.x0
    const yy = Y + yoke.dy - yoke.h / 2
    const yw = yoke.x1 - yoke.x0
    ctx.fillStyle = ironGrad(yy, yy + yoke.h)
    ctx.fillRect(yx, yy, yw, yoke.h)
    lamLines((d) => {
      for (let hy = yy + 4; hy < yy + yoke.h - 2; hy += 4) {
        ctx.moveTo(yx + 4, hy + d)
        ctx.lineTo(yx + yw - 4, hy + d)
      }
    })
    ctx.strokeStyle = kc.bevel
    ctx.globalAlpha = kc.glint
    ctx.lineWidth = 0.9
    ctx.beginPath()
    ctx.moveTo(yx + 1, yy + 0.6)
    ctx.lineTo(yx + yw - 1, yy + 0.6)
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.strokeStyle = kc.strong.color
    ctx.lineWidth = kc.strong.width
    ctx.strokeRect(yx, yy, yw, yoke.h)
    if (!lay.yokeOn) pendingLabels.push([X, yy, '横梁', { place: 'above', offset: 4, size: 12, background: false }])
    const stripH = lay.coil.strip
    const flangeH = 8
    for (const cx of lay.legCX) {
      const x0 = X + cx - lay.legW / 2 - lay.coil.over
      const y0 = Y + lay.coil.y0
      const w = lay.legW + lay.coil.over * 2
      const y1 = Y + lay.coil.y1
      const wy0 = y0 + stripH
      const wy1 = y1 - flangeH
      const gc = ctx.createLinearGradient(x0 + 4, 0, x0 + w - 4, 0)
      for (const [off, c] of copperStops) gc.addColorStop(off, c)
      ctx.fillStyle = gc
      ctx.fillRect(x0 + 4, wy0, w - 8, wy1 - wy0)
      stroke({ color: copperLine, width: 0.8 })
      ctx.beginPath()
      for (let ty = wy0 + 4; ty < wy1 - 2; ty += 4) {
        ctx.moveTo(x0 + 5, ty)
        ctx.lineTo(x0 + w - 5, ty)
      }
      ctx.stroke()
      ctx.strokeStyle = kc.strong.color
      ctx.lineWidth = kc.strong.width
      ctx.strokeRect(x0 + 4, wy0, w - 8, wy1 - wy0)
      craft.solidRect(ctx, x0, y1 - flangeH, w, flangeH, 'insul', theme, { band: 1.5, r: 0.8, line: 'strong', rim: false })
      craft.solidRect(ctx, x0, y0, w, stripH, 'insul', theme, { band: 2, r: 1, line: 'strong' })
    }
    for (const p of [...lay.taps1, ...lay.taps2]) {
      const px = X + p.dx
      const py = Y + p.dy
      // Post near the strip's top edge, turns number in the lower half, so the number never sits on the post.
      if (p.used) {
        const g = ctx.createRadialGradient(px - 1.6, py - 1.8, 0.5, px, py, 4.8)
        g.addColorStop(0, night() ? '#FFE29A' : '#FFE7A3')
        g.addColorStop(1, colors.charge)
        ctx.beginPath()
        ctx.arc(px, py, 4.8, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
        stroke({ color: colors.ink, width: 1.6 })
        ctx.stroke()
      } else {
        craft.sphere(ctx, px, py, 4.8, 'steelHi', theme, { line: 'strong' })
      }
      addShape(px - 6, py - 6, 12, 12)
      pendingTexts.push([px, py + 13.5, String(p.turns), { size: 9, color: p.used ? colors.charge : night() ? colors.ink : '#F3F5F7', baseline: 'middle' }])
    }
    const topY = Math.min(yy, top) - 16
    addShape(X + base.x0, topY, base.x1 - base.x0, Y + base.y1 + 8 - topY, BACKDROP)
    const pack = (posts) => posts.map((p) => ({ turns: p.turns, at: at(p.dx, p.dy), used: p.used }))
    return {
      p: [at(lay.used1[0].dx, lay.used1[0].dy), at(lay.used1[1].dx, lay.used1[1].dy)],
      s: [at(lay.used2[0].dx, lay.used2[0].dy), at(lay.used2[1].dx, lay.used2[1].dy)],
      taps1: pack(lay.taps1),
      taps2: pack(lay.taps2),
      yoke: { on: lay.yokeOn, at: at(lay.yoke.dx, lay.yoke.dy) },
      open: lay.open,
    }
  }

  function niceStep(len) {
    const raw = Math.abs(len) / 8 || 1
    const p = 10 ** Math.floor(Math.log10(raw))
    const e = raw / p
    const m = e < 1.5 ? 1 : e < 3.5 ? 2 : e < 7.5 ? 5 : 10
    return m * p
  }

  function sampleWire(m, x1, x2, y, o) {
    o = o || {}
    if (!(Math.abs(x2 - x1) > 1e-9)) throw new Error('金属丝的两端不能重合')
    const thick = wireThickness(o.d, o.scale)
    const u = (px) => px / (Math.abs(m.s(1)) || 1)
    const left = Math.min(x1, x2)
    const right = Math.max(x1, x2)
    const board = { x: left - u(18), y: y - u(30), w: right - left + u(36), h: u(52) }
    {
      const BX = Math.min(m.x(board.x), m.x(board.x + board.w))
      const BY = Math.min(m.y(board.y), m.y(board.y + board.h))
      const BW = Math.abs(m.s(board.w))
      const BH = Math.abs(m.s(board.h))
      craft.solidRect(ctx, BX, BY, BW, BH, 'steel', theme, { band: 4, r: 4 })
      for (const [sx, sy] of [[BX + 7, BY + 10], [BX + BW - 7, BY + 10], [BX + 7, BY + BH - 7], [BX + BW - 7, BY + BH - 7]]) craft.screw(ctx, sx, sy, 1.9, theme)
      addShape(BX, BY, BW, BH)
    }
    stroke({ color: colors.ink, width: thick })
    ctx.beginPath()
    ctx.moveTo(m.x(x1), m.y(y))
    ctx.lineTo(m.x(x2), m.y(y))
    ctx.stroke()
    const stepPx = Math.max(8, Math.abs(m.s(right - left)) / 24)
    for (let s = 0; s <= Math.abs(m.s(right - left)); s += stepPx) addShape(m.x(left) + s - 2, m.y(y) - thick, 4, thick * 2 + 2)
    const clips = []
    if (o.clips !== false) {
      for (const cx of [x1, x2]) {
        const px = m.x(cx)
        const py = m.y(y)
        stroke({ color: colors.ink, width: 1.4 })
        ctx.beginPath()
        ctx.moveTo(px, py - 11)
        ctx.lineTo(px, py + 11)
        ctx.stroke()
        craft.sphere(ctx, px, py - 11, 5, 'brass', theme, { line: 'strong' })
        addShape(px - 7, py - 18, 14, 32)
        clips.push([cx, y])
      }
    }
    if (o.ruler !== false) ruler(m, left, right, y - u(46), { step: o.step > 0 ? o.step : niceStep(right - left), minor: o.minor, unit: o.unit || '', body: true })
    if (o.label) label(m, (x1 + x2) / 2, y + u(18), o.label, { place: 'above', background: false })
    return {
      ends: [
        [x1, y],
        [x2, y],
      ],
      clips,
      d: Number(o.d) > 0 ? Number(o.d) : null,
    }
  }

  function oilFilm(m, x, y, o) {
    const geom = oilFilmGeometry(o)
    const g = geom.grid
    const half = (geom.paper / 2) * g
    let minX = x - half
    let maxX = x + half
    let minY = y - half
    let maxY = y + half
    for (const p of geom.outline) {
      minX = Math.min(minX, x + p[0])
      maxX = Math.max(maxX, x + p[0])
      minY = Math.min(minY, y + p[1])
      maxY = Math.max(maxY, y + p[1])
    }
    const i0 = Math.floor((minX - x) / g)
    const i1 = Math.ceil((maxX - x) / g)
    const j0 = Math.floor((minY - y) / g)
    const j1 = Math.ceil((maxY - y) / g)
    ctx.save()
    ctx.globalAlpha = night() ? 0.34 : 0.28
    ctx.fillStyle = colors.field
    for (const c of geom.cells) {
      const Ytop = m.y(y + (c.j + 1) * g)
      ctx.fillRect(m.x(x + c.i * g), Ytop, m.s(g), m.y(y + c.j * g) - Ytop)
    }
    ctx.restore()
    stroke({ color: colors.steel, width: 0.7 })
    ctx.beginPath()
    for (let i = i0; i <= i1; i++) {
      ctx.moveTo(m.x(x + i * g), m.y(y + j0 * g))
      ctx.lineTo(m.x(x + i * g), m.y(y + j1 * g))
    }
    for (let j = j0; j <= j1; j++) {
      ctx.moveTo(m.x(x + i0 * g), m.y(y + j * g))
      ctx.lineTo(m.x(x + i1 * g), m.y(y + j * g))
    }
    ctx.stroke()
    stroke({ color: colors.ink, width: 1.15 })
    ctx.strokeRect(m.x(x - half), m.y(y + half), m.s(half * 2), m.y(y - half) - m.y(y + half))
    const pts = geom.outline.map(([px, py]) => [x + px, y + py])
    ctx.beginPath()
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(m.x(px), m.y(py)) : ctx.moveTo(m.x(px), m.y(py))))
    ctx.closePath()
    ctx.save()
    ctx.globalAlpha = night() ? 0.16 : 0.08
    ctx.fillStyle = colors.ink
    ctx.fill()
    ctx.restore()
    stroke({ color: colors.ink, width: 1.6 })
    ctx.stroke()
    addShape(m.x(minX), m.y(maxY), m.x(maxX) - m.x(minX), m.y(minY) - m.y(maxY), BACKDROP)
    return { count: geom.count, area: geom.area, exact: geom.exact, grid: g, cells: geom.cells }
  }

  function centripetalDemo(m, x, y, o) {
    o = o || {}
    const m1 = o.m1 == null ? 1 : Number(o.m1)
    const m2 = o.m2 == null ? 1 : Number(o.m2)
    const r1 = o.r1 == null ? 1 : Number(o.r1)
    const r2 = o.r2 == null ? 1 : Number(o.r2)
    const ratioW = o.omegaRatio == null ? 1 : Number(o.omegaRatio)
    const read = centripetalReadings(m1, r1, m2, r2, ratioW, o.readings)
    const X = m.x(x)
    const Y = m.y(y)
    const at = (dx, dy) => [m.ix(X + dx), m.iy(Y + dy)]
    const tower = [-78, 78]
    const armY = -56
    const armLen = 92
    const rMax = Math.max(r1, r2, 1e-9)
    const u = [r1 / rMax, r2 / rMax]
    const baseY0 = 30
    const baseY1 = 58
    craft.ambientShadow(ctx, X - 168, X + 168, Y + baseY1, theme)
    craft.solidRect(ctx, X - 168, Y + baseY0, 336, baseY1 - baseY0, 'steel', theme, { band: 4, r: 2 })
    for (const sx of [X - 158, X + 158]) craft.screw(ctx, sx, Y + baseY0 + 14, 1.9, theme)
    // hand crank on the right end of the base
    const crankY = Y + (baseY0 + baseY1) / 2
    const kc = craft.craftTokens(theme)
    stroke({ color: kc.strong.color, width: 2 })
    ctx.beginPath()
    ctx.moveTo(X + 146, crankY)
    ctx.lineTo(X + 170, crankY)
    ctx.lineTo(X + 170, crankY - 14)
    ctx.stroke()
    craft.sphere(ctx, X + 170, crankY - 20, 5.5, 'insul', theme, { line: 'strong' })
    for (const [i, cx] of tower.entries()) {
      craft.solidRect(ctx, X + cx - 3, Y + armY, 6, baseY0 - armY, 'alu', theme, { band: 0, r: 1, line: 'strong', brush: false, rim: false })
      const dir = i === 0 ? -1 : 1
      const xBall = cx + dir * u[i] * armLen
      const a1 = Math.min(X + cx, X + xBall)
      craft.solidRect(ctx, a1, Y + armY - 2, Math.abs(xBall - cx), 4, 'alu', theme, { band: 0, r: 1, line: 'strong', brush: false, rim: false })
      const rad = 6 + 4 * ((i === 0 ? m1 : m2) / Math.max(m1, m2, 1e-9))
      craft.sphere(ctx, X + xBall, Y + armY, rad, 'steelHi', theme, { line: 'strong' })
      addShape(X + xBall - rad, Y + armY - rad, rad * 2, rad * 2, BODY)
    }
    const cap = 8
    const stripeH = 8
    const sleeveX = [-46, 46]
    const lightBand = night() ? colors.ink : colors.enamel
    for (const [i, sx] of sleeveX.entries()) {
      const n = i === 0 ? read.n1 : read.n2
      const shown = Math.max(0, Math.min(cap, n))
      const top = Y + armY - cap * stripeH
      const bot = Y + armY
      craft.solidRect(ctx, X + sx - 7, top, 14, bot - top, 'steelHi', theme, { band: 0, r: 1, line: 'none', rim: false })
      for (let k = 0; k < cap; k++) {
        const y1 = bot - (k + 1) * stripeH
        const full = k + 1 <= shown
        const partial = !full && k < shown
        if (!full && !partial) continue
        const h = partial ? (shown - k) * stripeH : stripeH
        ctx.fillStyle = k % 2 === 0 ? colors.force : lightBand
        ctx.fillRect(X + sx - 6, bot - k * stripeH - h, 12, h)
      }
      stroke({ color: colors.ink, width: 1.1 })
      ctx.strokeRect(X + sx - 7, top, 14, bot - top)
      const txt = Math.abs(n - Math.round(n)) < 0.05 ? String(Math.round(n)) : n.toFixed(1)
      pendingTexts.push([X + sx + (i === 0 ? -12 : 12), (top + bot) / 2, txt, { size: 12, color: colors.ink, align: i === 0 ? 'right' : 'left' }])
    }
    const pRad = read.pulley.map((rel) => Math.max(8, 24 * rel))
    const py = Y + 14
    for (const [i, cx] of tower.entries()) {
      craft.disc(ctx, X + cx, py, pRad[i], 'alu', theme)
      ctx.beginPath()
      ctx.arc(X + cx, py, pRad[i], 0, Math.PI * 2)
      stroke({ color: kc.strong.color, width: kc.strong.width })
      ctx.stroke()
      craft.screw(ctx, X + cx, py, 2.4, theme)
    }
    const belt = (r1p, r2p) => {
      const x1 = X + tower[0]
      const x2 = X + tower[1]
      const dist = Math.abs(x2 - x1)
      if (!(dist > Math.abs(r1p - r2p) + 2)) return
      const base = 0
      const theta = Math.acos(Math.min(1, Math.max(-1, (r1p - r2p) / dist)))
      const aA = base + theta
      const aB = base - theta
      stroke({ color: night() ? colors.graphite : kc.materials.rubber.stops[1][1], width: 2 })
      ctx.beginPath()
      ctx.moveTo(x1 + r1p * Math.cos(aA), py + r1p * Math.sin(aA))
      ctx.lineTo(x2 + r2p * Math.cos(aA), py + r2p * Math.sin(aA))
      ctx.moveTo(x1 + r1p * Math.cos(aB), py + r1p * Math.sin(aB))
      ctx.lineTo(x2 + r2p * Math.cos(aB), py + r2p * Math.sin(aB))
      ctx.stroke()
      const arcAway = (cx, r, away) => {
        let d = aB - aA
        while (d <= -Math.PI) d += Math.PI * 2
        while (d > Math.PI) d -= Math.PI * 2
        const alt = d - Math.sign(d || 1) * Math.PI * 2
        const score = (sweep) => Math.cos(aA + sweep / 2 - away)
        const sweep = score(d) >= score(alt) ? d : alt
        ctx.beginPath()
        for (let i = 0; i <= 28; i++) {
          const a = aA + (sweep * i) / 28
          const px = cx + r * Math.cos(a)
          const yy = py + r * Math.sin(a)
          i ? ctx.lineTo(px, yy) : ctx.moveTo(px, yy)
        }
        ctx.stroke()
      }
      arcAway(x1, r1p, Math.PI)
      arcAway(x2, r2p, 0)
    }
    belt(pRad[0], pRad[1])
    addShape(X - 190, Y + armY - cap * stripeH - 8, 390, baseY1 - armY + cap * stripeH + 24, BACKDROP)
    return {
      ...read,
      balls: [at(tower[0] - u[0] * armLen, armY), at(tower[1] + u[1] * armLen, armY)],
    }
  }

  function crt(m, x, y, o) {
    o = o || {}
    const def = crtDeflection(o.Ux, o.Uy, o)
    const R = Number(o.screen) > 0 ? Number(o.screen) : 0.85
    const x0 = x - 4.65
    const x1 = x - 3.3
    const x2 = x - R * 0.62
    const neck = 0.26
    const mouth = R * 0.9
    const halfH = (wx) => (wx <= x1 ? neck : neck + ((mouth - neck) * (wx - x1)) / (x2 - x1))
    ctx.beginPath()
    ctx.moveTo(m.x(x0), m.y(y + neck))
    ctx.lineTo(m.x(x1), m.y(y + neck))
    ctx.lineTo(m.x(x2), m.y(y + mouth))
    ctx.lineTo(m.x(x2), m.y(y - mouth))
    ctx.lineTo(m.x(x1), m.y(y - neck))
    ctx.lineTo(m.x(x0), m.y(y - neck))
    ctx.closePath()
    // Evacuated glass envelope: faint tinted body, glass-edge outline, a highlight along the top.
    const kc = craft.craftTokens(theme)
    {
      const Yt = m.y(y + mouth)
      const Yb = m.y(y - mouth)
      const g = ctx.createLinearGradient(0, Yt, 0, Yb)
      for (const [off, c] of kc.glass.stops) g.addColorStop(off, c)
      ctx.fillStyle = g
      ctx.fill()
      stroke({ color: kc.glass.edge, width: 1.3 })
      ctx.stroke()
      ctx.save()
      ctx.globalAlpha *= night() ? 0.35 : 0.85
      stroke({ color: '#FFFFFF', width: 1.1 })
      ctx.beginPath()
      ctx.moveTo(m.x(x0) + 3, m.y(y + neck) + 2)
      ctx.lineTo(m.x(x1), m.y(y + neck) + 2)
      ctx.lineTo(m.x(x2) - 3, m.y(y + mouth) + 3)
      ctx.stroke()
      ctx.restore()
    }
    // filament and gun
    stroke({ color: colors.charge, width: 1.4 })
    ctx.beginPath()
    const f0 = x0 + 0.18
    for (let i = 0; i <= 8; i++) {
      const fx = f0 + i * 0.07
      const fy = y + (i % 2 === 0 ? -0.08 : 0.08)
      i ? ctx.lineTo(m.x(fx), m.y(fy)) : ctx.moveTo(m.x(fx), m.y(fy))
    }
    ctx.stroke()
    craft.solidRect(ctx, m.x(x0 + 0.78), m.y(y + 0.12), m.s(0.16), m.y(y - 0.12) - m.y(y + 0.12), 'steel', theme, { band: 1.5, r: 1, line: 'strong' })
    label(m, (x0 + x1) / 2, y + neck, '电子枪', { place: 'above', offset: 8, background: false })
    label(m, f0 + 0.2, y - neck, '金属丝', { place: 'below', offset: 8, background: false, size: 12 })
    // YY′ plates, vertical deflection. Uy > 0 makes the upper plate positive.
    const yx = x1 + 0.38 * (x2 - x1)
    const yGap = halfH(yx) * 0.62
    const yLen = Math.min(0.62, (x2 - x1) * 0.28)
    // Deflection plates: dark metal strips with a lit top edge, like v.plates.
    const plate = (xa, ya, xb, yb) => {
      const X1 = Math.min(m.x(xa), m.x(xb))
      const W = Math.abs(m.x(xb) - m.x(xa))
      craft.solidRect(ctx, X1, m.y(ya) - 1.8, W, 3.6, 'dark', theme, { band: 0, r: 0.8, line: 'strong', rim: false })
      ctx.save()
      ctx.globalAlpha *= night() ? 0.3 : 0.6
      stroke({ color: '#FFFFFF', width: 0.6 })
      ctx.beginPath()
      ctx.moveTo(X1 + 1, m.y(ya) - 1.2)
      ctx.lineTo(X1 + W - 1, m.y(ya) - 1.2)
      ctx.stroke()
      ctx.restore()
    }
    plate(yx - yLen / 2, y + yGap, yx + yLen / 2, y + yGap)
    plate(yx - yLen / 2, y - yGap, yx + yLen / 2, y - yGap)
    const uy = Number(o.Uy) || 0
    if (uy) {
      pendingTexts.push([m.x(yx - yLen / 2) - 8, m.y(y + yGap), uy > 0 ? '+' : '−', { size: 14, color: colors.ink }])
      pendingTexts.push([m.x(yx - yLen / 2) - 8, m.y(y - yGap), uy > 0 ? '−' : '+', { size: 14, color: colors.ink }])
    }
    label(m, yx, y + halfH(yx), 'Y', { place: 'above', offset: 6, background: false })
    label(m, yx, y - halfH(yx), 'Y′', { place: 'below', offset: 6, background: false })
    // XX′ plates, horizontal deflection, drawn in slight perspective (near plate lower).
    const xx = x1 + 0.7 * (x2 - x1)
    const xh = halfH(xx)
    plate(xx - 0.16, y - xh * 0.22, xx + 0.16, y - xh * 0.22)
    plate(xx - 0.22, y + xh * 0.28, xx + 0.22, y + xh * 0.28)
    const ux = Number(o.Ux) || 0
    if (ux) {
      pendingTexts.push([m.x(xx + 0.24), m.y(y + xh * 0.28), ux > 0 ? '+' : '−', { size: 14, color: colors.ink }])
      pendingTexts.push([m.x(xx + 0.2), m.y(y - xh * 0.22), ux > 0 ? '−' : '+', { size: 14, color: colors.ink }])
    }
    label(m, xx, y + xh, 'X', { place: 'above', offset: 4, background: false, size: 12 })
    label(m, xx, y - xh * 0.55, 'X′', { place: 'above', offset: 2, background: false, size: 12 })
    stroke({ color: colors.steel, width: 1, dash: [4, 3] })
    ctx.beginPath()
    ctx.moveTo(m.x(x0 + 0.95), m.y(y))
    ctx.lineTo(m.x(x - R * 0.15), m.y(y))
    ctx.stroke()
    ctx.setLineDash([])
    // screen
    ctx.beginPath()
    ctx.arc(m.x(x), m.y(y), m.s(R), 0, Math.PI * 2)
    ctx.fillStyle = night() ? '#14151A' : '#1C1E24'
    ctx.fill()
    // steel bezel round the phosphor screen
    stroke({ color: kc.materials.steel.stops[2][1], width: 3 })
    ctx.stroke()
    stroke({ color: kc.strong.color, width: kc.strong.width })
    ctx.beginPath()
    ctx.arc(m.x(x), m.y(y), m.s(R) + 1.5, 0, Math.PI * 2)
    ctx.stroke()
    stroke({ color: night() ? '#6B6C70' : '#8E9094', width: 0.7 })
    ctx.beginPath()
    ctx.moveTo(m.x(x - R * 0.7), m.y(y))
    ctx.lineTo(m.x(x + R * 0.7), m.y(y))
    ctx.moveTo(m.x(x), m.y(y - R * 0.7))
    ctx.lineTo(m.x(x), m.y(y + R * 0.7))
    ctx.stroke()
    let sx = def.x
    let sy = def.y
    const reach = Math.hypot(sx, sy)
    const lim = R * 0.9
    if (reach > lim) {
      sx *= lim / reach
      sy *= lim / reach
    }
    const spotX = m.x(x + sx)
    const spotY = m.y(y + sy)
    withGlow(colors.field, 12, () => {
      ctx.beginPath()
      ctx.arc(spotX, spotY, 4.2, 0, Math.PI * 2)
      ctx.fillStyle = colors.field
      ctx.fill()
    })
    addShape(m.x(x0), m.y(y + R + 0.2), m.x(x + R) - m.x(x0), m.y(y - R - 0.2) - m.y(y + R + 0.2), BACKDROP)
    label(m, x + R, y, '荧光屏', { place: 'right', offset: 8, background: false })
    return { spot: [x + sx, y + sy], x: def.x, y: def.y, k: def.k }
  }

  function hall(m, x, y, o) {
    o = o || {}
    const pol = hallPolarity(o.B, o.I, o.carrier)
    const w = Number(o.w) > 0 ? Number(o.w) : 1.8
    const h = Number(o.h) > 0 ? Number(o.h) : 1.05
    if (!(w > 0) || !(h > 0)) throw new Error('霍尔片的宽和高应为正数')
    const t = Number(o.t) > 0 ? Number(o.t) : Math.min(w, h) * 0.16
    const skew = Math.max(8, Math.min(18, Math.abs(m.s(t)) * 0.9))
    const dx = skew * 0.75
    const dy = -skew * 0.55
    const x0 = m.x(x - w / 2)
    const x1 = m.x(x + w / 2)
    const top = m.y(y + h / 2)
    const bot = m.y(y - h / 2)
    const kc = craft.craftTokens(theme)
    const hi = kc.materials.steelHi
    const quad = (pts, fill) => {
      ctx.beginPath()
      pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)))
      ctx.closePath()
      ctx.fillStyle = fill
      ctx.fill()
      stroke({ color: kc.strong.color, width: kc.strong.width })
      ctx.stroke()
    }
    // Lit like every other solid: bright top, front shading down, side in shadow.
    const side = ctx.createLinearGradient(0, top + dy, 0, bot)
    side.addColorStop(0, hi.stops[hi.stops.length - 2][1])
    side.addColorStop(1, hi.stops[hi.stops.length - 1][1])
    const topFill = hi.top
    const front = ctx.createLinearGradient(0, top, 0, bot)
    for (const [off, c] of hi.stops) front.addColorStop(off, c)
    quad(
      [
        [x1, top],
        [x1 + dx, top + dy],
        [x1 + dx, bot + dy],
        [x1, bot],
      ],
      side,
    )
    quad(
      [
        [x0, top],
        [x1, top],
        [x1 + dx, top + dy],
        [x0 + dx, top + dy],
      ],
      topFill,
    )
    quad(
      [
        [x0, top],
        [x1, top],
        [x1, bot],
        [x0, bot],
      ],
      front,
    )
    ctx.save()
    ctx.globalAlpha *= night() ? 0.35 : 0.9
    stroke({ color: kc.bevel, width: 0.8 })
    ctx.beginPath()
    ctx.moveTo(x0 + 1, top + 1)
    ctx.lineTo(x1 - 1, top + 1)
    ctx.stroke()
    ctx.restore()
    addShape(x0, top + dy, x1 - x0 + dx, bot - top, BODY)
    const padX = w * 0.16
    const padY = h * 0.18
    const along = {
      right: [x - w / 2 + padX, y, x + w / 2 - padX, y],
      left: [x + w / 2 - padX, y, x - w / 2 + padX, y],
      up: [x, y - h / 2 + padY, x, y + h / 2 - padY],
      down: [x, y + h / 2 - padY, x, y - h / 2 + padY],
    }[o.I]
    arrow(m, along[0], along[1], along[2], along[3], { color: colors.charge, width: 1.8, head: 9 })
    const ax = m.x(along[0])
    const ay = m.y(along[1])
    const bx2 = m.x(along[2])
    const by2 = m.y(along[3])
    addShape(Math.min(ax, bx2) - 8, Math.min(ay, by2) - 8, Math.abs(bx2 - ax) + 16, Math.abs(by2 - ay) + 16, 2)
    const iAt = [along[0] + (along[2] - along[0]) * 0.22, along[1] + (along[3] - along[1]) * 0.22]
    const bx = x0 - 22
    const by = (top + bot) / 2
    stroke({ color: colors.field, width: 1.4 })
    ctx.beginPath()
    if (o.B === 'out') {
      ctx.arc(bx, by, 7, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(bx, by, 1.7, 0, Math.PI * 2)
      ctx.fillStyle = colors.field
      ctx.fill()
    } else {
      ctx.moveTo(bx - 5, by - 5)
      ctx.lineTo(bx + 5, by + 5)
      ctx.moveTo(bx - 5, by + 5)
      ctx.lineTo(bx + 5, by - 5)
      ctx.stroke()
    }
    addShape(bx - 12, by - 12, 24, 24, 3)
    pendingLabels.push([bx, by, 'B', { place: 'left', offset: 10, size: 13, color: colors.field, background: false }])
    label(m, iAt[0], iAt[1], 'I', { place: o.I === 'up' ? 'below' : 'above', offset: 8, size: 14, color: colors.charge, background: false })
    const px = 16 / (Math.abs(m.s(1)) || 1)
    const extra = dx / (Math.abs(m.s(1)) || 1)
    const spot = {
      top: [x, y + h / 2 + px],
      bottom: [x, y - h / 2 - px],
      left: [x - w / 2 - px, y],
      right: [x + w / 2 + extra + px * 0.35, y],
    }
    pendingTexts.push([m.x(spot[pol.positive][0]), m.y(spot[pol.positive][1]), '+', { size: 16, color: colors.ink }])
    pendingTexts.push([m.x(spot[pol.negative][0]), m.y(spot[pol.negative][1]), '−', { size: 16, color: colors.ink }])
    for (const side of [pol.positive, pol.negative]) addShape(m.x(spot[side][0]) - 12, m.y(spot[side][1]) - 12, 24, 24, 4)
    label(m, x + w / 2, y - h / 2, o.carrier === 'hole' ? '空穴' : '电子', { place: 'below-right', offset: 28, background: false })
    return { positive: pol.positive, negative: pol.negative, UH: pol.UH }
  }

  /**
   * Cyclotron seen from above: D-shaped boxes of radius R either side of a gap
   * (`gap`, physical units) with a uniform field inside, an AC source across them,
   * and the ion source near the centre. Returns the textbook trajectory, where the
   * k-th half-turn has radius r1·√k (equal energy gain per gap crossing):
   *   at(h)    position after h half-turns (each half-turn takes T/2 whatever the
   *            speed; gap crossings are treated as instant)
   *   upTo(h)  polyline of the path travelled so far (gap crossings included)
   *   points   the whole polyline
   *   radius(k), halfTurns
   */
  function cyclotron(m, cx, cy, R, o = {}) {
    const g = o.gap ?? R * 0.12
    const r1 = o.r1 ?? R * 0.16
    const s = o.sense === -1 || o.sense === 'cw' ? -1 : 1
    const radius = (k) => r1 * Math.sqrt(Math.max(1, k))
    // Every half-turn's centre lies (2−√2)·r1 … r1 off the starting line, on the same
    // side. Starting the ion that far below the D centre keeps all centres within
    // 0.21·r1 of it, so the spiral fills the D evenly and the last half-turn fits when
    // r1·√N + 0.21·r1 ≤ 0.96·R. Lessons can compute the same count in a Define:
    // floor((0.96*R/r1 - 0.21)^2).
    const y0 = cy - s * r1 * (3 - Math.SQRT2) / 2
    const maxN = Math.max(1, Math.min(400, Math.floor((0.96 * R / r1 - 0.21) ** 2)))
    const N = Math.max(1, Math.min(o.halfTurns ?? maxN, maxN))
    const ys = [y0]
    for (let k = 0; k < N; k++) ys.push(ys[k] + (k % 2 === 0 ? 2 : -2) * s * radius(k + 1))
    const at = (h) => {
      if (!(h > 0)) return [cx, y0]
      const hh = Math.min(h, N)
      const k = Math.min(N - 1, Math.floor(hh))
      const f = hh - k
      const r = radius(k + 1)
      const right = k % 2 === 0
      const ccx = cx + (right ? g / 2 : -g / 2)
      const ccy = ys[k] + (right ? s : -s) * r
      const th = s * ((right ? -0.5 : 0.5) * Math.PI + Math.PI * f)
      return [ccx + r * Math.cos(th), ccy + r * Math.sin(th)]
    }
    const upTo = (h) => {
      const hh = Math.min(Math.max(h, 0), N)
      const out = [[cx, y0]]
      for (let k = 0; k < Math.ceil(hh); k++) {
        for (let i = 0; i <= 32 && k + i / 32 <= hh; i++) out.push(at(k + i / 32))
      }
      out.push(at(hh))
      return out
    }
    const points = upTo(N)

    // The Ds: metal shells (filled), field marks clipped inside, flat edges facing the gap.
    const half = (side) => {
      const ox = cx + (side * g) / 2
      const pts = []
      for (let i = 0; i <= 48; i++) {
        const a = -Math.PI / 2 + (Math.PI * i) / 48
        pts.push([ox + side * R * Math.cos(a), cy + R * Math.sin(a)])
      }
      return pts
    }
    for (const side of [-1, 1]) {
      const pts = half(side)
      ctx.beginPath()
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(m.x(x), m.y(y)) : ctx.moveTo(m.x(x), m.y(y))))
      ctx.closePath()
      const kc = craft.craftTokens(theme)
      const hi = kc.materials.steelHi
      const g2 = ctx.createLinearGradient(0, m.y(cy + R), 0, m.y(cy - R))
      for (const [off, c] of hi.stops) g2.addColorStop(off, c)
      ctx.fillStyle = g2
      ctx.fill()
      stroke({ color: kc.strong.color, width: 1.1 })
      ctx.stroke()
      ctx.save()
      ctx.clip()
      ctx.globalAlpha *= night() ? 0.3 : 0.9
      stroke({ color: kc.bevel, width: 1.2 })
      ctx.beginPath()
      pts.slice(24).forEach(([x, y], i) => (i ? ctx.lineTo(m.x(x), m.y(y)) : ctx.moveTo(m.x(x), m.y(y))))
      ctx.stroke()
      ctx.restore()
      field(m, 0, 0, 0, 0, { points: pts, dir: o.dir || 'in', step: o.step || 30, border: false, color: o.color })
      const [lx, ly] = [cx + side * (g / 2 + R * Math.cos(Math.PI / 4)), cy + R * Math.sin(Math.PI / 4)]
      pendingLabels.push([m.x(lx), m.y(ly), side < 0 ? 'D_1' : 'D_2', { place: side < 0 ? 'above-left' : 'above-right', offset: 4, background: false }])
    }
    // Gap field: arrows show which way the alternating field points right now.
    if (o.e) {
      const sign = o.e > 0 ? 1 : -1
      for (const k of [-0.5, 0, 0.5]) {
        const Y = m.y(cy + k * R)
        const X = m.x(cx)
        const L = Math.max(6, (m.s(g) - 4) / 2)
        arrowPx(X - sign * L, Y, X + sign * L, Y, { color: colors.field, width: 1.3, head: 6 })
      }
    }
    // AC source below, wired to the bottom of each D.
    const Xs = m.x(cx)
    const Ys = m.y(cy - R) + 38
    const Yb = m.y(cy - R)
    stroke({ color: colors.ink, width: 1.4 })
    ctx.beginPath()
    for (const side of [-1, 1]) {
      const Xd = m.x(cx + (side * g) / 2) + side * 10
      ctx.moveTo(Xs + side * 12, Ys)
      ctx.lineTo(Xd, Ys)
      ctx.lineTo(Xd, Yb + 1)
    }
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(Xs, Ys, 12, 0, Math.PI * 2)
    ctx.fillStyle = colors.stage || colors.enamel
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    for (let i = 0; i <= 20; i++) {
      const X = Xs - 7 + (14 * i) / 20
      const Y = Ys - 3.5 * Math.sin((2 * Math.PI * i) / 20)
      i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y)
    }
    ctx.stroke()
    addShape(Xs - 12, Ys - 12, 24, 24)
    if (o.sourceLabel !== false) pendingLabels.push([Xs, Ys, String(o.sourceLabel ?? '交流电源'), { place: 'right', offset: 16, background: false, size: 12 }])
    ctx.beginPath()
    ctx.arc(m.x(cx), m.y(y0), 3, 0, Math.PI * 2)
    ctx.fillStyle = colors.charge
    ctx.fill()
    return { at, upTo, points, radius, halfTurns: N }
  }

  /** Wave y = fn(x); `dots` lists x positions of medium particles drawn as enamel beads. */
  function wave(m, fn, x1, x2, o = {}) {
    const n = o.samples || 240
    const pts = []
    for (let i = 0; i <= n; i++) {
      const x = x1 + ((x2 - x1) * i) / n
      pts.push([x, fn(x)])
    }
    path(m, pts, { color: o.color || colors.ink, width: o.width || 1.5 })
    // Labels keep off the waveform the same way they keep off rays.
    let run = 8
    for (let i = 0; i < pts.length; i++) {
      const X = m.x(pts[i][0])
      const Y = m.y(pts[i][1])
      if (i) run += Math.hypot(X - m.x(pts[i - 1][0]), Y - m.y(pts[i - 1][1]))
      if (run >= 8 && Number.isFinite(X + Y)) {
        addShape(X - 2, Y - 2, 4, 4)
        run = 0
      }
    }
    // `dots: true` (or a count) spreads medium particles evenly; an array gives their x positions.
    const count = o.dots === true ? 13 : typeof o.dots === 'number' && o.dots > 1 ? Math.round(o.dots) : 0
    const dots = Array.isArray(o.dots) ? o.dots : Array.from({ length: count }, (_, i) => x1 + ((x2 - x1) * i) / (count - 1))
    for (const x of dots) {
      const X = m.x(x)
      const Y = m.y(fn(x))
      ctx.beginPath()
      ctx.arc(X, Y, 4.2, 0, Math.PI * 2)
      ctx.fillStyle = colors.enamel
      ctx.fill()
      stroke({ color: colors.ink, width: 1.3 })
      ctx.stroke()
      addShape(X - 5, Y - 5, 10, 10)
    }
  }

  /**
   * Finite wave trains and their superposition. Each source is
   * {x, v, amp, lambda, phase, dir: 1 | -1 | 'both', start, cycles, shape}.
   * shape 'pulse' or 'half' is one half-wave of width λ/2; 'sine' runs for
   * `cycles` wavelengths (omit cycles and the source keeps going). The train
   * is zero ahead of x ± v(t − start). sum draws Σ yi, parts draws each train.
   * wall: {x, kind: 'fixed' | 'free'} adds one image reflection (not a second bounce).
   * Returns {y(x), yi(i, x)} at time t (the sim clock when t is omitted).
   */
  function waves(m, sources, x1, x2, o = {}) {
    const time = o.t == null ? t : o.t
    const field = waveField(sources, time, { wall: o.wall })
    const n = o.samples > 1 ? o.samples : 400
    const span = x2 - x1
    const sample = (fn) => {
      const pts = []
      for (let i = 0; i <= n; i++) {
        const x = x1 + (span * i) / n
        const y = fn(x)
        pts.push([x, Number.isFinite(y) ? y : 0])
      }
      return pts
    }
    const list = Array.isArray(sources) ? sources : []
    const dx = Math.abs(span) / Math.max(n, 1)
    let slopeCap = 0
    for (const s of list) {
      const A = Math.abs(+(s && s.amp) || 0)
      const lam = Math.abs(+(s && s.lambda) || 0) || 1
      slopeCap += (A * 2 * Math.PI) / lam
    }
    // A continuous train (plus one image) stays under this. A source edge, where
    // the medium starts at a nonzero displacement, is a step — don't stroke it.
    const jumpAt = Math.max(slopeCap, 1e-4) * 4 * dx
    const pieces = (pts) => {
      const out = []
      let cur = []
      const eps = 1e-4
      for (let i = 0; i < pts.length; i++) {
        const y = pts[i][1]
        const prev = i ? pts[i - 1][1] : 0
        const next = i + 1 < pts.length ? pts[i + 1][1] : 0
        if (cur.length && Math.abs(y - cur[cur.length - 1][1]) > jumpAt) {
          out.push(cur)
          cur = []
        }
        if (Math.abs(y) < eps && Math.abs(prev) < eps && Math.abs(next) < eps) {
          if (cur.length) out.push(cur)
          cur = []
          continue
        }
        cur.push(pts[i])
      }
      if (cur.length) out.push(cur)
      return out
    }
    const strokeTrain = (pts, opt) => {
      for (const seg of pieces(pts)) {
        if (seg.length < 2) continue
        path(m, seg, opt)
        let run = 8
        for (let i = 0; i < seg.length; i++) {
          const X = m.x(seg[i][0])
          const Y = m.y(seg[i][1])
          if (i) run += Math.hypot(X - m.x(seg[i - 1][0]), Y - m.y(seg[i - 1][1]))
          if (run >= 8 && Number.isFinite(X + Y)) {
            addShape(X - 2, Y - 2, 4, 4)
            run = 0
          }
        }
      }
    }
    const partColors = [colors.velocity, colors.force, colors.charge, colors.field, colors.accel]
    const drawParts = o.parts === true
    const drawSum = o.sum !== false
    if (drawParts) {
      for (let i = 0; i < list.length; i++) {
        strokeTrain(sample((x) => field.yi(i, x)), { color: partColors[i % partColors.length], width: 1.15, dash: [5, 4] })
      }
    }
    if (drawSum) strokeTrain(sample(field.y), { color: o.color || colors.ink, width: o.width || (drawParts ? 2.2 : 1.6) })
    const count = o.dots === true ? 13 : typeof o.dots === 'number' && o.dots > 1 ? Math.round(o.dots) : 0
    const dots = Array.isArray(o.dots) ? o.dots : count ? Array.from({ length: count }, (_, i) => x1 + (span * i) / (count - 1 || 1)) : []
    for (const x of dots) {
      const y = field.y(x)
      if (!Number.isFinite(y)) continue
      const X = m.x(x)
      const Y = m.y(y)
      ctx.beginPath()
      ctx.arc(X, Y, 4.2, 0, Math.PI * 2)
      ctx.fillStyle = colors.enamel
      ctx.fill()
      stroke({ color: colors.ink, width: 1.3 })
      ctx.stroke()
      addShape(X - 5, Y - 5, 10, 10)
    }
    return { y: (x) => field.y(x), yi: (i, x) => field.yi(i, x) }
  }
