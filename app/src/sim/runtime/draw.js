// Sandbox runtime, part: view mapping and primitives: line, path, circle, rect, arrow, vec, label, text.
  // ---------- coordinates & primitives ----------

  function view({ xmin, xmax, ymin, ymax, pad = 20, equal = false }) {
    let kx = (cssW - pad * 2) / (xmax - xmin)
    let ky = (cssH - pad * 2) / (ymax - ymin)
    let ox = pad
    let oy = pad
    if (equal) {
      const k = Math.min(kx, ky)
      ox += ((xmax - xmin) * (kx - k)) / 2
      oy += ((ymax - ymin) * (ky - k)) / 2
      kx = ky = k
    }
    const mapping = {
      x: (x) => ox + (x - xmin) * kx,
      ix: (X) => xmin + (X - ox) / kx,
      y: (y) => cssH - oy - (y - ymin) * ky,
      iy: (Y) => ymin + (cssH - oy - Y) / ky,
      s: (len) => len * kx,
      sy: (len) => len * ky,
    }
    if (layoutOn()) layoutView = { xmin, xmax, ymin, ymax, ox, oy, kx, ky }
    return mapping
  }

  const kindColor = (k) => colors[k] || k || colors.ink
  const night = () => theme === 'night'

  function withGlow(color, blur, fn) {
    if (!night() || !blur) return fn()
    ctx.save()
    ctx.shadowColor = color
    ctx.shadowBlur = blur
    fn()
    ctx.restore()
  }

  // Plot series take `dash: true`, so authors write that here too; a bare number is one dash length.
  function dashOf(d) {
    if (Array.isArray(d)) return d.filter((x) => Number.isFinite(x) && x >= 0)
    if (d === true) return [6, 4]
    if (typeof d === 'number' && d > 0) return [d, d]
    return []
  }

  function stroke(o = {}) {
    ctx.strokeStyle = o.color || colors.ink
    ctx.lineWidth = o.width || 1.6
    ctx.setLineDash(dashOf(o.dash))
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  function line(m, x1, y1, x2, y2, o = {}) {
    withGlow(o.color, o.glow, () => {
      stroke(o)
      ctx.beginPath()
      ctx.moveTo(m.x(x1), m.y(y1))
      ctx.lineTo(m.x(x2), m.y(y2))
      ctx.stroke()
      ctx.setLineDash([])
    })
    if (layoutFrame) noteStroke([[m.x(x1), m.y(y1)], [m.x(x2), m.y(y2)]], o.width || 1.6)
  }

  function path(m, pts, o = {}) {
    if (!pts.length) return
    withGlow(o.color, o.glow, () => {
      stroke(o)
      ctx.beginPath()
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(m.x(x), m.y(y)) : ctx.moveTo(m.x(x), m.y(y))))
      if (o.close) ctx.closePath()
      if (o.fill) {
        ctx.fillStyle = o.fill
        ctx.fill()
      }
      if (!o.fill || o.color || o.outline) ctx.stroke()
      ctx.setLineDash([])
    })
    if (layoutFrame && (!o.fill || o.color || o.outline)) {
      const px = pts.map(([x, y]) => [m.x(x), m.y(y)])
      if (o.close) px.push(px[0])
      noteStroke(px, o.width || 1.6)
    }
  }

  // Shapes are outlined unless `fill` is given, so `{color}` alone draws a ring/frame
  // (orbits, field regions) rather than a solid disk.
  function finish(o) {
    if (o.fill) {
      ctx.fillStyle = o.fill
      ctx.fill()
    }
    if (!o.fill || o.outline || o.color) {
      stroke({ color: o.outline || o.color || colors.ink, width: o.width || 1.6, dash: o.dash })
      ctx.stroke()
      ctx.setLineDash([])
    }
  }

  function circle(m, x, y, r, o = {}) {
    const R = o.px ? r : m.s(r)
    if (o.fill) addShape(m.x(x) - R, m.y(y) - R, 2 * R, 2 * R)
    withGlow(o.color || o.fill, o.glow, () => {
      ctx.beginPath()
      ctx.arc(m.x(x), m.y(y), R, 0, Math.PI * 2)
      finish(o)
    })
  }

  // `from`, `to` and `rot` are degrees counter-clockwise from +x in the view's y-up frame, like every
  // other angle in a lesson; the canvas wants radians clockwise on screen, so both are flipped here.
  function ellipse(m, cx, cy, rx, ry, o = {}) {
    const rad = Math.PI / 180
    const arc = o.from !== undefined || o.to !== undefined
    const from = arc ? -(o.from ?? 0) * rad : 0
    const to = arc ? -(o.to ?? 360) * rad : Math.PI * 2
    withGlow(o.color, o.glow, () => {
      ctx.beginPath()
      ctx.ellipse(m.x(cx), m.y(cy), Math.abs(m.s(rx)), Math.abs(m.sy(ry)), -(o.rot || 0) * rad, from, to, arc)
      finish(o)
    })
  }

  function rect(m, x, y, w, h, o = {}) {
    const X = m.x(x)
    const Y = m.y(y + h)
    const Wd = m.s(w)
    const Ht = m.sy(h)
    if (o.fill) addShape(X, Y, Wd, Ht)
    ctx.beginPath()
    ctx.roundRect(X, Y, Wd, Ht, o.radius ?? 4)
    finish(o)
  }

  function arrowPx(X1, Y1, X2, Y2, o = {}) {
    const len = Math.hypot(X2 - X1, Y2 - Y1)
    if (len < 1) return
    const head = Math.min(o.head || 9, len * 0.45)
    const ux = (X2 - X1) / len
    const uy = (Y2 - Y1) / len
    const c = o.color || colors.ink
    withGlow(c, o.glow, () => {
      stroke({ ...o, color: c })
      ctx.beginPath()
      ctx.moveTo(X1, Y1)
      ctx.lineTo(X2 - ux * head * 0.8, Y2 - uy * head * 0.8)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(X2, Y2)
      ctx.lineTo(X2 - ux * head - uy * head * 0.42, Y2 - uy * head + ux * head * 0.42)
      ctx.lineTo(X2 - ux * head + uy * head * 0.42, Y2 - uy * head - ux * head * 0.42)
      ctx.closePath()
      ctx.fillStyle = c
      ctx.fill()
    })
    // Small boxes along the shaft keep labels off arrows without the
    // bounding box of a diagonal arrow blocking a whole region.
    for (let s = 0; s < len - head; s += 8) addShape(X1 + ux * s - 2, Y1 + uy * s - 2, 4, 4, o.weight)
    addShape(X2 - 3, Y2 - 3, 6, 6, o.weight)
  }

  /** Bare arrowhead with its tip at (X, Y), for direction marks along curves. */
  function headPx(X, Y, ux, uy, size, color, weight) {
    withGlow(color, 6, () => {
      ctx.beginPath()
      ctx.moveTo(X, Y)
      ctx.lineTo(X - ux * size - uy * size * 0.45, Y - uy * size + ux * size * 0.45)
      ctx.lineTo(X - ux * size * 0.72, Y - uy * size * 0.72)
      ctx.lineTo(X - ux * size + uy * size * 0.45, Y - uy * size - ux * size * 0.45)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
    })
    addShape(X - size / 2, Y - size / 2, size, size, weight)
  }

  // `of` says which quantity the arrow draws (signed, an expression over the lesson's names).
  // Browsers ignore it. The validator's sandbox sets window.__arrowLog, and each arrow with
  // `of` appends its world-space vector there, so simcheck can compare directions across states.
  function noteArrow(dx, dy, o) {
    if (typeof o.of === 'string' && window.__arrowLog) window.__arrowLog.push({ of: o.of, dx, dy })
  }

  // Head size is in pixels and independent of line width, so short or thick
  // vectors keep a readable shaft.
  function arrow(m, x1, y1, x2, y2, o = {}) {
    noteArrow(x2 - x1, y2 - y1, o)
    arrowPx(m.x(x1), m.y(y1), m.x(x2), m.y(y2), o)
  }

  /**
   * Physical vector: colour comes from its kind (velocity, force, accel, field,
   * charge). Label sits beyond the head, e.g. 'v 0.80'.
   */
  function vec(m, x, y, dx, dy, o = {}) {
    noteArrow(dx, dy, o)
    const c = kindColor(o.kind || 'velocity')
    const X1 = m.x(x)
    const Y1 = m.y(y)
    let X2 = m.x(x + dx)
    let Y2 = m.y(y + dy)
    const len = Math.hypot(X2 - X1, Y2 - Y1)
    if (len < 0.5) return
    const min = o.min ?? 14
    if (len < min) {
      X2 = X1 + ((X2 - X1) / len) * min
      Y2 = Y1 + ((Y2 - Y1) / len) * min
    }
    arrowPx(X1, Y1, X2, Y2, { color: c, width: o.width || 2, dash: o.dash, glow: 8 })
    if (o.label) {
      const horizontal = Math.abs(X2 - X1) >= Math.abs(Y2 - Y1)
      const place = o.place || (horizontal ? (X2 > X1 ? 'right' : 'left') : Y2 < Y1 ? 'above' : 'below')
      pendingLabels.push([X2, Y2, String(o.label), { color: c, place, offset: 6, size: o.size || 13, background: false }])
    }
  }

  const hit = (a, b) => a.x < b.x + b.w + 2 && b.x < a.x + a.w + 2 && a.y < b.y + b.h + 2 && b.y < a.y + a.h + 2

  function label(m, x, y, text, o = {}) {
    pendingLabels.push([m.x(x), m.y(y), String(text), o])
  }

  function placeLabel(ax, ay, text, o) {
    // An empty name (e.g. label: '' from a lesson) would still claim a slot and push real labels away.
    if (!String(text ?? '').trim()) return
    const size = o.size || 13
    const weight = o.weight || 500
    const segs = segments(text, o.plain)
    const chip = !!o.chip
    const padX = chip ? 12 : 5
    const extraW = chip ? 16 : 0
    const w = measureSegs(segs, size, weight) + padX * 2 + extraW + (o.trailing ? measureSegs(segments(o.trailing), size - 1, 500) + 10 : 0)
    const h = chip ? size + 14 : size + 8
    const d = o.offset ?? 8
    const prefer = {
      center: [-w / 2, -h / 2],
      above: [-w / 2, -h - d],
      below: [-w / 2, d],
      right: [d, -h / 2],
      left: [-w - d, -h / 2],
      'above-left': [-w - d * 0.5, -h - d],
      'above-right': [d * 0.5, -h - d],
      'below-left': [-w - d * 0.5, d],
      'below-right': [d * 0.5, d],
    }
    const order = [o.place || 'above', 'above', 'right', 'left', 'below']
    const extra = [
      [d, -h - d],
      [-w - d, -h - d],
      [d, d],
      [-w - d, d],
      [-w / 2, -h * 2 - d],
      [-w / 2, h + d],
    ]
    // An event chip is tied to its spot by the pulse ring and its coloured dot, so it may step
    // further out rather than cover the bodies and letters the event is about.
    const far = chip
      ? [1, 2].flatMap((k) => {
          const D = d + k * (h + 6)
          return [
            [-w / 2, -h - D],
            [-w - D * 0.5, -h - D],
            [D * 0.5, -h - D],
            [D, -h / 2],
            [-w - D, -h / 2],
            [-w / 2, D],
            [-w - D * 0.5, D],
            [D * 0.5, D],
          ]
        })
      : []
    // An event anchored inside a body (a ball's centre) measures its offsets from that body's
    // edges too; offsets from the anchor alone may never leave a large body.
    const host = chip
      ? frameShapes.find((s) => (s.weight ?? 1) >= 3 && ax >= s.x && ax <= s.x + s.w && ay >= s.y && ay <= s.y + s.h)
      : null
    const around = host
      ? [
          [host.x + host.w / 2 - w / 2, host.y - h - d],
          [host.x + host.w + d, ay - h / 2],
          [host.x - w - d, ay - h / 2],
          [host.x + host.w / 2 - w / 2, host.y + host.h + d],
          [host.x + host.w + d * 0.5, host.y - h - d],
          [host.x - w - d * 0.5, host.y - h - d],
          [host.x + host.w + d * 0.5, host.y + host.h + d],
          [host.x - w - d * 0.5, host.y + host.h + d],
        ].map(([x, y]) => [x - ax, y - ay])
      : []
    const candidates = [...order.map((k) => prefer[k] || prefer.above), ...around, ...extra, ...far].map(([dx, dy]) => ({
      x: Math.min(Math.max(ax + dx, 2), cssW - w - 2),
      y: Math.min(Math.max(ay + dy, 2), cssH - h - 2),
      w,
      h,
    }))
    // The spot an event chip is about (under its pulse ring) stays visible whatever else gives way.
    const guard = chip ? { x: ax - 13, y: ay - 13, w: 26, h: 26, weight: 12 } : null
    const free = (b) => !frameLabels.some((p) => hit(p, b))
    const clear = (b) => free(b) && !frameShapes.some((p) => hit(p, b)) && !(guard && hit(guard, b))
    const overlap = (a, b) =>
      Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y))
    // Fraction of each shape covered, times its weight: hiding a whole arrowhead or ball costs more
    // than sitting inside a large body or over background field marks.
    const shapes = guard ? [...frameShapes, guard] : frameShapes
    const cost = (b, i) => shapes.reduce((sum, p) => sum + (overlap(p, b) / Math.max(p.w * p.h, 1)) * (p.weight ?? 1), 0) + i * 0.02
    let box = candidates.find(clear)
    if (!box) {
      const pool = candidates.map((b, i) => [b, i]).filter(([b]) => free(b))
      box = pool.length ? pool.reduce((best, cur) => (cost(cur[0], cur[1]) < cost(best[0], best[1]) ? cur : best))[0] : candidates[0]
    }
    if (layoutFrame) noteLabel(text, ax, ay, box, clear(box), overlap, chip || o.background !== false)
    frameLabels.push(box)
    if (chip) {
      const bg = night() ? '#F2F2F0' : '#1F2329'
      const fg = night() ? '#121212' : '#FFFFFF'
      ctx.save()
      ctx.shadowColor = 'rgba(0,0,0,0.18)'
      ctx.shadowBlur = 12
      ctx.shadowOffsetY = 4
      ctx.fillStyle = bg
      ctx.beginPath()
      ctx.roundRect(box.x, box.y, box.w, box.h, box.h / 2)
      ctx.fill()
      ctx.restore()
      const cy = box.y + box.h / 2
      ctx.fillStyle = o.color || colors.force
      ctx.beginPath()
      ctx.arc(box.x + padX + 3.5, cy, 3.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = fg
      fillSegs(segs, box.x + padX + extraW, cy + 0.5, size, 600)
      if (o.trailing) {
        const tx = box.x + padX + extraW + measureSegs(segs, size, 600) + 10
        ctx.globalAlpha = 0.6
        fillSegs(segments(o.trailing), tx, cy + 0.5, size - 1, 500)
        ctx.globalAlpha = 1
      }
      return box
    }
    if (o.background !== false) {
      ctx.fillStyle = o.background || colors.stage || colors.bg
      ctx.globalAlpha = 0.86
      ctx.beginPath()
      ctx.roundRect(box.x, box.y, box.w, box.h, 5)
      ctx.fill()
      ctx.globalAlpha = 1
    }
    ctx.fillStyle = o.color || colors.ink
    fillSegs(segs, box.x + padX, box.y + box.h / 2 + 0.5, size, weight)
    return box
  }

  function text(m, x, y, str, o = {}) {
    const item = [m.x(x), m.y(y), String(str), o]
    if (layoutOn()) item.tag = shapeTag || (str ? 'v.text「' + String(str).slice(0, 24) + '」' : 'v.text')
    pendingTexts.push(item)
  }

  function drawText(X, Y, str, o) {
    const size = o.size || 12
    const weight = o.weight || 500
    const segs = segments(str, o.plain)
    const w = measureSegs(segs, size, weight)
    const align = o.align || 'center'
    const left = align === 'center' ? X - w / 2 : align === 'right' || align === 'end' ? X - w : X
    const base = o.baseline || 'middle'
    const mid = base === 'top' ? Y + size / 2 : base === 'bottom' || base === 'alphabetic' ? Y - size / 2 : Y
    ctx.fillStyle = o.color || colors.graphite
    fillSegs(segs, left, mid, size, weight)
    addShape(left - 2, mid - size / 2 - 2, w + 4, size + 4)
    if (layoutFrame) layoutFrame.texts.push({ text: String(str), tag: shapeTag || '', x: left, y: mid - size / 2, w, h: size })
  }
