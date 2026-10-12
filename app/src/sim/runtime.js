// Sandbox runtime. Runs inside <iframe sandbox="allow-scripts" srcdoc>, before
// the lesson's own code. The parent page owns the clock; this side turns
// (t, params) into a frame. Ambient effects (event pulses, current particles)
// keep their own wall-clock loop so they move even while the clock is paused.
;(() => {
  // Shared formulas are built from the TS modules. See __genuiShared.
  const {
    solenoidFrame,
    solenoidPolarity,
    helixSample,
    toroidCCW,
    coreSpan,
    solenoidLocalLines,
    fieldLinesFromPoles,
    gapLines,
    barFrame,
    horseshoeGeom,
    horseshoeFrame,
    radialArrows,
    radialPoles,
    hallPolarity,
    mulberry32,
    polygonArea,
    pointInPoly,
    cellFraction,
    coverageCount,
    oilFilmGeometry,
    centripetalReadings,
    crtDeflection,
    platesAtFrame,
    platePair,
    pickTap,
    labTransformerLayout,
    wireThickness,
    springHook,
    electrometerDegrees,
    lightColorCss,
    craft,
  } = globalThis.__genuiShared
  const lightColor = (lambdaNm) => lightColorCss(+lambdaNm)

  const canvas = document.getElementById('c')
  const ctx = canvas.getContext('2d')
  const DT = 1 / 240
  const HIST_EVERY = 4 // record a state every 4 steps (1/60 s) for v.at() on stepped sims
  const MAX_STEPS = 240 * 600

  let def = null
  let params = {}
  let paramsKey = ''
  let t = 0
  let colors = {}
  let theme = 'light'
  let meta = { duration: 1, rate: 1, timeUnit: 's', playing: false, marks: [] }
  let cache = null
  let hist = []
  // Resize and font events can fire before the host's first message; drawing then
  // would run the lesson with empty params and report a bogus error.
  let gotParams = false
  let failed = false
  let cssW = 0
  let cssH = 0
  let frameLabels = []
  // Shapes drawn this frame; labels are placed after draw() returns so they can
  // avoid every shape and always sit on top, whatever order the lesson draws in.
  let frameShapes = []
  let pendingTexts = []
  let pendingLabels = []
  // Surfaces drawn this frame ([X1, X2, Y] in px); bodies resting on one get a contact shadow.
  let frameSurfaces = []
  let pendingEvents = []
  let ambient = false
  let ambientRaf = 0
  // Layout diagnostics. Off unless the host sets __GENUI_LAYOUT__ before load.
  // When off, shapeTag and layoutFrame stay null and nothing below changes a pixel.
  let shapeTag = null
  let layoutFrame = null
  let layoutView = null
  let layoutLabelTexts = []
  let layoutLabelTag = ''
  const layoutOn = () => globalThis.__GENUI_LAYOUT__ === true

  // Stroked lines (v.line, v.path, field lines) for the layout report only: they are not
  // obstacles for label placement, so recording them changes nothing on screen.
  function noteStroke(pts, width, extra) {
    if (!layoutFrame || pts.length < 2) return
    const step = Math.max(1, Math.floor(pts.length / 60))
    const kept = []
    for (let i = 0; i < pts.length; i += step) kept.push([Math.round(pts[i][0] * 10) / 10, Math.round(pts[i][1] * 10) / 10])
    const last = pts[pts.length - 1]
    if (kept[kept.length - 1][0] !== last[0] || kept[kept.length - 1][1] !== last[1]) kept.push([last[0], last[1]])
    layoutFrame.strokes.push(Object.assign({ tag: shapeTag || '图形', width: width || 1, pts: kept }, extra))
  }

  // weight: what covering the whole shape costs a label that cannot avoid everything. Bodies
  // (balls, planets, blocks) 3, vectors 1, background field marks 0.3.
  const addShape = (x, y, w, h, weight = 1) => {
    if (w * h < cssW * cssH * 0.3) {
      const shape = { x, y, w, h, weight }
      if (shapeTag) shape.tag = shapeTag
      frameShapes.push(shape)
    }
    if (layoutFrame) noteOutside(x, y, w, h, weight)
  }

  // How much of a box hangs off each edge. Depth (px), not area, so a corner
  // reports the side it actually left the canvas by.
  function noteOutside(x, y, w, h, weight) {
    if (!(w > 0) || !(h > 0) || !Number.isFinite(x + y + w + h)) return
    const x2 = x + w
    const y2 = y + h
    const inside = Math.max(0, Math.min(x2, cssW) - Math.max(x, 0)) * Math.max(0, Math.min(y2, cssH) - Math.max(y, 0))
    const left = x >= 0 ? 0 : Math.min(w, -x)
    const right = x2 <= cssW ? 0 : Math.min(w, x2 - cssW)
    const top = y >= 0 ? 0 : Math.min(h, -y)
    const bottom = y2 <= cssH ? 0 : Math.min(h, y2 - cssH)
    const tag = shapeTag || '图形'
    const geom = layoutFrame.geom
    let g = geom[tag]
    if (!g) geom[tag] = g = { area: 0, out: 0, weight: weight ?? 1, left: 0, right: 0, top: 0, bottom: 0, x0: x, y0: y, x1: x2, y1: y2 }
    g.x0 = Math.min(g.x0, x)
    g.y0 = Math.min(g.y0, y)
    g.x1 = Math.max(g.x1, x2)
    g.y1 = Math.max(g.y1, y2)
    g.area += w * h
    g.out += w * h - inside
    if ((weight ?? 1) > g.weight) g.weight = weight ?? 1
    if (left > g.left) g.left = left
    if (right > g.right) g.right = right
    if (top > g.top) g.top = top
    if (bottom > g.bottom) g.bottom = bottom
  }

  function noteLabel(text, ax, ay, box, wasClear, overlap, backed) {
    const labelArea = Math.max(box.w * box.h, 1)
    const groups = {}
    for (let i = 0; i < frameShapes.length; i++) {
      const p = frameShapes[i]
      const area = overlap(p, box)
      if (!(area > 0)) continue
      const tag = p.tag || '图形'
      const pw = Math.max(p.w * p.h, 1)
      let g = groups[tag]
      if (!g) groups[tag] = g = { hit: 0, shape: 0, weight: p.weight ?? 1, piece: 0, pieceArea: 0 }
      g.hit += area
      g.shape += pw
      if ((p.weight ?? 1) > g.weight) g.weight = p.weight ?? 1
      const frac = area / pw
      if (frac > g.piece) {
        g.piece = frac
        g.pieceArea = pw
      }
    }
    const overlaps = []
    for (const tag in groups) {
      const g = groups[tag]
      overlaps.push({
        tag,
        weight: g.weight,
        labelFrac: Math.min(1, g.hit / labelArea),
        shapeFrac: Math.min(1, g.hit / Math.max(g.shape, 1)),
        pieceFrac: g.piece,
        pieceArea: g.pieceArea,
      })
    }
    const labelHits = []
    for (let i = 0; i < frameLabels.length; i++) {
      const p = frameLabels[i]
      const area = overlap(p, box)
      if (!(area > 0)) continue
      const smaller = Math.max(Math.min(p.w * p.h, labelArea), 1)
      labelHits.push({ text: layoutLabelTexts[i] || '', frac: Math.min(1, area / smaller) })
    }
    layoutFrame.labels.push({
      text: String(text),
      tag: layoutLabelTag,
      backed: !!backed,
      box: { x: box.x, y: box.y, w: box.w, h: box.h },
      anchor: { x: ax, y: ay },
      clear: !!wasClear,
      anchorOut: ax < -4 || ay < -4 || ax > cssW + 4 || ay > cssH + 4,
      overlaps,
      labelHits,
    })
    layoutLabelTexts.push(String(text))
  }

  function callLabel(name, args) {
    let raw = null
    if (name === 'v.dim') raw = args[5]
    else if (name === 'v.label' || name === 'v.text' || name === 'v.event') raw = args[3]
    else if (args.length) {
      const o = args[args.length - 1]
      if (o && typeof o === 'object' && !Array.isArray(o)) raw = o.label
    }
    if (typeof raw !== 'string' && typeof raw !== 'number') return ''
    const s = String(raw)
    return s.length > 24 ? s.slice(0, 24) + '…' : s
  }

  function tagCall(name, fn) {
    return function (...args) {
      if (shapeTag) return fn.apply(this, args)
      const label = callLabel(name, args)
      shapeTag = label ? name + '「' + label + '」' : name
      try {
        return fn.apply(this, args)
      } finally {
        shapeTag = null
      }
    }
  }

  function tagApi(api) {
    for (const key of Object.keys(api)) {
      if (typeof api[key] === 'function') api[key] = tagCall('v.' + key, api[key])
    }
  }
  const BODY = 3
  const BACKDROP = 0.3

  const post = (msg) => parent.postMessage({ source: 'genui-sim', ...msg }, '*')

  // A <Motion> named in `params` arrives as samples; turn it back into functions of
  // time (ball.y(t), ball.state(t)) by linear interpolation between samples.
  function motionOf(m) {
    const n = m.t.length
    const index = (time) => {
      let lo = 0
      let hi = n - 1
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1
        if (m.t[mid] <= time) lo = mid
        else hi = mid - 1
      }
      return lo
    }
    const value = (time, i) => {
      const tt = Math.min(Math.max(+time || 0, 0), m.end)
      const k = index(tt)
      const col = m.s[i]
      if (k >= n - 1 || m.t[k + 1] === m.t[k]) return col[k]
      const f = (tt - m.t[k]) / (m.t[k + 1] - m.t[k])
      return col[k] + (col[k + 1] - col[k]) * f
    }
    const o = { tEnd: m.end, events: m.events || {} }
    if (m.fields) o.fields = m.fields
    if (m.track) o.track = m.track
    m.vars.forEach((v, i) => {
      o[v] = (time) => value(time, i)
    })
    o.state = (time) => {
      const out = { t: Math.min(Math.max(+time || 0, 0), m.end) }
      m.vars.forEach((v, i) => (out[v] = value(time, i)))
      return out
    }
    return o
  }
  const hydrate = (raw) => {
    if (!raw || typeof raw !== 'object') return raw
    const isMotion = (v) => v && typeof v === 'object' && v.__motion
    // Keep the very object when there is nothing to convert (validation wraps it in a Proxy).
    if (!Object.keys(raw).some((k) => isMotion(raw[k]))) return raw
    const out = {}
    for (const k of Object.keys(raw)) out[k] = raw[k] && typeof raw[k] === 'object' && raw[k].__motion ? motionOf(raw[k]) : raw[k]
    return out
  }
  window.__hydrate = hydrate

  window.sim = (d) => {
    if (!d || typeof d.draw !== 'function') throw new Error('sim() 需要提供 draw(ctx, s, v)')
    if (typeof d.at !== 'function' && !(typeof d.init === 'function' && typeof d.step === 'function')) {
      throw new Error('sim() 需要提供 at(t, p)，或者 init(p) + step(s, dt, p)')
    }
    def = d
  }

  // Static, parameter-driven drawing: the state is just the parameters.
  window.figure = (d) => {
    if (!d || typeof d.draw !== 'function') throw new Error('figure() 需要提供 draw(ctx, p, v)')
    window.sim({ at: (_t, p) => p, draw: (c, p, v) => d.draw(c, p, v) })
  }

  function stateAt(time) {
    if (def.at) return def.at(time, params)
    if (!cache || time < cache.t - 1e-9) {
      cache = { t: 0, s: def.init(params), n: 0 }
      hist = [cache.s]
    }
    let n = 0
    while (cache.t + DT <= time + 1e-9 && n++ < MAX_STEPS) {
      cache.s = def.step(cache.s, DT, params)
      cache.t += DT
      if (++cache.n % HIST_EVERY === 0) hist.push(cache.s)
    }
    return cache.s
  }

  /** State at an earlier time, for trails and strobe dots. */
  function sampleAt(time) {
    if (def.at) return def.at(Math.max(0, time), params)
    if (!hist.length) return stateAt(time)
    const i = Math.max(0, Math.min(hist.length - 1, Math.round(time / (DT * HIST_EVERY))))
    return hist[i]
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1
    cssW = document.documentElement.clientWidth
    cssH = document.documentElement.clientHeight
    canvas.width = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)
    canvas.style.width = cssW + 'px'
    canvas.style.height = cssH + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  // ---------- typography ----------

  const FAMILY = {
    sans: '-apple-system, "PingFang SC", "Noto Sans SC", "Helvetica Neue", sans-serif',
    mono: '"GZ Mono", "JetBrains Mono", ui-monospace, Menlo, "PingFang SC", monospace',
    sym: '"GZ Symbol", "Source Serif 4", "Times New Roman", "PingFang SC", serif',
  }
  const font = (size = 13, weight = 500, fam = 'sans') =>
    `${fam === 'sym' ? 'italic ' : ''}${fam === 'sym' ? 400 : weight} ${size}px ${FAMILY[fam] || FAMILY.sans}`

  const CJK = /[\u2E80-\u9FFF\u3000-\u303F\uFF00-\uFFEF]/
  const LETTER = /[A-Za-zα-ωΑ-ΩΔ∆]/

  // `U_R`, `v_0`, `R_{AB}` render as subscripts, matching the SVG components.
  const SUB = /_\{([^}]*)\}|_([A-Za-z0-9\u4e00-\u9fff]+)/g

  /**
   * Splits a label into typographic runs: single-letter physical symbols in
   * italic serif, numbers/units/ASCII in mono, CJK in sans. A lone letter that
   * follows a number ("0.60 m") is a unit and stays upright.
   */
  function segments(str, plain) {
    const out = []
    const pushText = (s) => {
      if (plain) {
        out.push({ t: s, f: 'sans', sub: false })
        return
      }
      let i = 0
      while (i < s.length) {
        const ch = s[i]
        if (CJK.test(ch)) {
          let j = i
          while (j < s.length && CJK.test(s[j])) j++
          out.push({ t: s.slice(i, j), f: 'sans', sub: false })
          i = j
          continue
        }
        if (LETTER.test(ch)) {
          let j = i
          while (j < s.length && LETTER.test(s[j])) j++
          let word = s.slice(i, j)
          const isDelta = (word[0] === 'Δ' || word[0] === '∆') && word.length === 2
          const prev = s.slice(0, i).replace(/\s+$/, '')
          const afterNumber = /[0-9.]$/.test(prev) || /\/$/.test(prev)
          const next = s[j]
          const unitish = next === '/' || next === '²' || next === '³' || next === '⁻'
          if ((word.length === 1 || isDelta) && !afterNumber && !unitish) {
            while (j < s.length && /[′'₀-₉]/.test(s[j])) j++
            word = s.slice(i, j)
            out.push({ t: word, f: 'sym', sub: false })
          } else out.push({ t: word, f: 'mono', sub: false })
          i = j
          continue
        }
        let j = i
        while (j < s.length && !CJK.test(s[j]) && !LETTER.test(s[j])) j++
        out.push({ t: s.slice(i, j), f: 'mono', sub: false })
        i = j
      }
    }
    let last = 0
    for (const m of str.matchAll(SUB)) {
      if (m.index > last) pushText(str.slice(last, m.index))
      const sub = m[1] ?? m[2]
      out.push({ t: sub, f: CJK.test(sub) ? 'sans' : 'mono', sub: true })
      last = m.index + m[0].length
    }
    if (last < str.length) pushText(str.slice(last))
    return out
  }

  const sizeOf = (seg, size) => (seg.sub ? Math.round(size * 0.7) : seg.f === 'sym' ? Math.round(size * 1.12) : seg.f === 'mono' ? Math.round(size * 0.94) : size)

  function measureSegs(segs, size, weight) {
    let w = 0
    for (const seg of segs) {
      ctx.font = font(sizeOf(seg, size), weight, seg.f)
      w += ctx.measureText(seg.t).width
    }
    return w
  }

  /** Draws runs with left edge at X and vertical middle at Y. */
  function fillSegs(segs, X, Y, size, weight) {
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    let x = X
    for (const seg of segs) {
      ctx.font = font(sizeOf(seg, size), weight, seg.f)
      ctx.fillText(seg.t, x, seg.sub ? Y + size * 0.3 : Y)
      x += ctx.measureText(seg.t).width
    }
  }

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

  // Head size is in pixels and independent of line width, so short or thick
  // vectors keep a readable shaft.
  function arrow(m, x1, y1, x2, y2, o = {}) {
    arrowPx(m.x(x1), m.y(y1), m.x(x2), m.y(y2), o)
  }

  /**
   * Physical vector: colour comes from its kind (velocity, force, accel, field,
   * charge). Label sits beyond the head, e.g. 'v 0.80'.
   */
  function vec(m, x, y, dx, dy, o = {}) {
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
      if (o.shadow !== false) craft.contactShadow(ctx, -W / 2 + 1, W / 2 - 1, 0, theme)
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

  // ---------- motion ----------

  /** Equal-time dots behind a moving object; older dots fade. */
  function strobe(m, fn, o = {}) {
    const every = o.every || meta.duration / 14
    const from = o.from ?? 0
    const to = Math.min(o.to ?? t, t)
    const c = kindColor(o.kind || 'velocity')
    const r = o.r || 3
    const times = []
    for (let k = from; k <= to - every * 0.25 + 1e-9 && times.length < 400; k += every) times.push(k)
    times.forEach((time, i) => {
      const pos = fn(sampleAt(time), time)
      if (!pos) return
      ctx.globalAlpha = 0.25 + 0.6 * ((i + 1) / times.length)
      withGlow(c, 6, () => {
        ctx.beginPath()
        ctx.arc(m.x(pos[0]), m.y(pos[1]), r, 0, Math.PI * 2)
        ctx.fillStyle = c
        ctx.fill()
      })
    })
    ctx.globalAlpha = 1
  }

  /** Continuous path traced so far, brightening toward the head. */
  function trail(m, fn, o = {}) {
    const from = o.from ?? 0
    const to = Math.min(o.to ?? t, t)
    if (to <= from) return
    const n = o.samples || 160
    const c = kindColor(o.kind || 'velocity')
    const pts = []
    for (let i = 0; i <= n; i++) {
      const time = from + ((to - from) * i) / n
      const pos = fn(sampleAt(time), time)
      if (pos) pts.push([m.x(pos[0]), m.y(pos[1])])
    }
    const fade = o.fade !== false
    withClip(clipPolyPx(m, o.clip), () =>
      withGlow(c, o.glow ?? 10, () => {
        stroke({ color: c, width: o.width || 2.2 })
        for (let i = 1; i < pts.length; i++) {
          ctx.globalAlpha = fade ? 0.12 + 0.88 * (i / pts.length) ** 1.4 : 1
          ctx.beginPath()
          ctx.moveTo(pts[i - 1][0], pts[i - 1][1])
          ctx.lineTo(pts[i][0], pts[i][1])
          ctx.stroke()
        }
      }),
    )
    ctx.globalAlpha = 1
    if (o.every) strobe(m, fn, { every: o.every, from, to, kind: o.kind, r: o.r || 2.6 })
  }

  function rings(X, Y, c, o = {}) {
    ambient = true
    const now = performance.now() / 1000
    const period = o.period || 1.4
    const maxR = o.radius || 30
    for (let k = 0; k < 2; k++) {
      const ph = ((now / period + k * 0.5) % 1 + 1) % 1
      ctx.globalAlpha = (1 - ph) * 0.55
      ctx.beginPath()
      ctx.arc(X, Y, 6 + ph * maxR, 0, Math.PI * 2)
      stroke({ color: c, width: 1.4 })
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    withGlow(c, 12, () => {
      ctx.beginPath()
      ctx.arc(X, Y, o.core || 5, 0, Math.PI * 2)
      ctx.fillStyle = c
      ctx.fill()
    })
  }

  function pulse(m, x, y, o = {}) {
    rings(m.x(x), m.y(y), kindColor(o.kind || 'force'), o)
  }

  /**
   * A moment worth noticing (impact, ignition, common velocity). Near time `at`
   * it pulses where it happens and shows a caption chip with the time. When several
   * are live in one frame only the latest moment is shown (see flushEvents).
   */
  function event(m, x, y, text, o = {}) {
    const at = o.at ?? t
    const win = o.window ?? Math.max(meta.duration * 0.08, (meta.rate || 1) * 0.5)
    const eps = meta.duration / 400
    if (t < at - eps || t > at + win) return false
    const c = kindColor(o.kind || 'force')
    const X = m.x(x)
    const Y = m.y(y)
    const unit = meta.timeUnit || 's'
    // Same places as the timeline captions, so a 0.02 s AC period shows 0.0050 s rather than 0.01 s.
    const d = meta.duration
    const digits = o.digits ?? (d >= 1000 ? 0 : d >= 100 ? 1 : d >= 1 || !(d > 0) ? 2 : Math.min(6, 2 + Math.ceil(-Math.log10(d))))
    pendingEvents.push({
      at,
      ring: o.pulse !== false ? () => rings(X, Y, c, o) : null,
      label: [X, Y, String(text), { chip: true, color: c, place: o.place || 'above-left', offset: o.offset ?? 18, size: 13, trailing: o.time === false ? '' : at.toFixed(digits) + ' ' + unit }],
    })
    return true
  }

  /**
   * An earlier event still inside its display window (3.90 s 碰前 while 4.30 s 落地 fires)
   * would stack its chip on the new one; only the events at the latest moment are drawn.
   */
  function flushEvents() {
    if (!pendingEvents.length) return
    const latest = Math.max(...pendingEvents.map((e) => e.at))
    const eps = meta.duration / 400
    for (const e of pendingEvents) {
      if (e.at < latest - eps) continue
      if (e.ring) e.ring()
      pendingLabels.push(e.label)
    }
  }

  /** Dots streaming along a polyline (current, gas flow, photons). Speed in px/s. */
  function particles(m, pts, o = {}) {
    if (pts.length < 2) return
    const speed = o.speed ?? 40
    if (!speed) return
    ambient = true
    const gap = o.gap || 18
    const c = kindColor(o.kind || 'charge')
    const segs = []
    let total = 0
    for (let i = 0; i < pts.length - 1; i++) {
      const A = [m.x(pts[i][0]), m.y(pts[i][1])]
      const B = [m.x(pts[i + 1][0]), m.y(pts[i + 1][1])]
      const L = Math.hypot(B[0] - A[0], B[1] - A[1])
      segs.push([A, B, L, total])
      total += L
    }
    const offset = (((performance.now() / 1000) * speed) % gap + gap) % gap
    withGlow(c, 6, () => {
      ctx.fillStyle = c
      for (let d = offset; d < total; d += gap) {
        const s = segs.find((g) => d >= g[3] && d <= g[3] + g[2]) || segs[segs.length - 1]
        const k = (d - s[3]) / (s[2] || 1)
        const X = s[0][0] + (s[1][0] - s[0][0]) * k
        const Y = s[0][1] + (s[1][1] - s[0][1]) * k
        ctx.beginPath()
        ctx.arc(X, Y, o.r || 2.2, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }

  /** Star field for night stages; positions are stable per canvas size. */
  function stars(o = {}) {
    if (!night()) return
    const n = o.count || 60
    for (let i = 0; i < n; i++) {
      const fx = Math.abs((Math.sin(i * 91.17) * 43758.5453) % 1)
      const fy = Math.abs((Math.sin(i * 17.31) * 24634.6345) % 1)
      const a = 0.15 + Math.abs((Math.sin(i * 3.7) * 1000) % 1) * 0.45
      ctx.fillStyle = `rgba(255,255,255,${a})`
      ctx.fillRect(fx * cssW, fy * cssH, i % 7 === 0 ? 1.6 : 1, i % 7 === 0 ? 1.6 : 1)
    }
  }

  /** Painted part (magnet halves, pole shoes): flat colour lit like the metals. */
  function painted(m, pts, fill) {
    craft.paintedPoly(ctx, pts.map(([x, y]) => [m.x(x), m.y(y)]), fill, theme, { line: 'strong' })
  }

  function polePaint() {
    // N red / S blue are the conventional pole colours, not theme inks.
    return { N: night() ? '#FF6B5C' : '#D23B32', S: night() ? '#6B93FF' : '#2A5BD7' }
  }

  function howMany(field, fallback, cap) {
    if (field === true) return fallback
    const n = Math.round(Number(field))
    return Number.isFinite(n) && n > 0 ? Math.min(cap || 8, n) : 0
  }

  function arrowMid(m, pts, sign, color, len) {
    if (!pts || pts.length < 2) return
    const mid = Math.floor(pts.length / 2)
    const i0 = Math.max(0, mid - 1)
    const i1 = Math.min(pts.length - 1, mid + 1)
    const a = sign > 0 ? pts[i0] : pts[i1]
    const b = sign > 0 ? pts[i1] : pts[i0]
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const mag = Math.hypot(dx, dy) || 1
    const L = len || Math.min(mag * 0.45, 0.35)
    const mx = (pts[i0][0] + pts[i1][0]) / 2
    const my = (pts[i0][1] + pts[i1][1]) / 2
    arrow(m, mx - (dx / mag) * L * 0.5, my - (dy / mag) * L * 0.5, mx + (dx / mag) * L * 0.5, my + (dy / mag) * L * 0.5, { color, width: 1.15, head: 7 })
  }

  function currentMark(m, x, y, out, rad) {
    const X = m.x(x)
    const Y = m.y(y)
    const r = rad || 6.5
    ctx.beginPath()
    ctx.arc(X, Y, r, 0, Math.PI * 2)
    ctx.fillStyle = colors.stage || colors.enamel
    ctx.fill()
    stroke({ color: colors.ink, width: 1.35 })
    ctx.stroke()
    if (out) {
      ctx.beginPath()
      ctx.arc(X, Y, Math.max(1.4, r * 0.28), 0, Math.PI * 2)
      ctx.fillStyle = colors.ink
      ctx.fill()
    } else {
      stroke({ color: colors.ink, width: 1.35 })
      ctx.beginPath()
      ctx.moveTo(X - r * 0.52, Y - r * 0.52)
      ctx.lineTo(X + r * 0.52, Y + r * 0.52)
      ctx.moveTo(X - r * 0.52, Y + r * 0.52)
      ctx.lineTo(X + r * 0.52, Y - r * 0.52)
      ctx.stroke()
    }
    addShape(X - r, Y - r, 2 * r, 2 * r)
  }

  function splitRuns(samples, wantFront) {
    const runs = []
    let cur = null
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i]
      const on = wantFront ? s.front : !s.front
      if (on) {
        if (!cur) {
          cur = []
          if (i > 0) cur.push(samples[i - 1])
        }
        cur.push(s)
      } else if (cur) {
        cur.push(s)
        runs.push(cur)
        cur = null
      }
    }
    if (cur && cur.length > 1) runs.push(cur)
    return runs
  }

  /**
   * Solenoid in side view, wound from end 1 (x1, y1) to end 2 (x2, y2).
   * sense +1 (right-handed): near (solid) half descends toward the right of the axis.
   * Polarity is the right-hand rule; labels and field lines follow it.
   */
  function solenoid(m, x1, y1, x2, y2, o = {}) {
    const frame = solenoidFrame(x1, y1, x2, y2, o)
    if (!frame) throw new Error('v.solenoid 的两端不能重合')
    const { at, r, turns, sense, phase, len, pol, px, py, term, exitN, reach } = frame
    const core = frame.core
    const ux = frame.axis.ux
    const uy = frame.axis.uy
    const current = Number(o.current) || 0
    if (!(r > 0)) throw new Error('v.solenoid 的半径 r 应为正数')
    const fc = colors.field
    const cc = colors.charge
    const count = howMany(o.field, 3, 6)

    if (count && pol.northEnd) {
      for (const ln of solenoidLocalLines(count, pol.northEnd)) {
        if (ln.kind !== 'out') continue
        const pts = ln.pts.map(([u, n]) => at(u, n * r))
        path(m, pts, { color: fc, width: 1.15 })
        arrowMid(m, pts, ln.sign, fc, r * 0.42)
      }
    }

    if (core) {
      const hw = r * 0.34
      const poly = [at(core.from, hw), at(core.to, hw), at(core.to, -hw), at(core.from, -hw)]
      const top = at((core.from + core.to) / 2, hw)
      const bot = at((core.from + core.to) / 2, -hw)
      const kc = craft.craftTokens(theme)
      const g = ctx.createLinearGradient(m.x(top[0]), m.y(top[1]), m.x(bot[0]), m.y(bot[1]))
      for (const [off, c] of kc.materials.steel.stops) g.addColorStop(off, c)
      path(m, poly, { fill: g, color: kc.strong.color, width: kc.strong.width })
      ctx.save()
      ctx.globalAlpha *= night() ? 0.35 : 0.9
      const e1 = at(core.from, hw * 0.82)
      const e2 = at(core.to, hw * 0.82)
      line(m, e1[0], e1[1], e2[0], e2[1], { color: kc.bevel, width: 0.8 })
      ctx.restore()
    }

    const samples = []
    const N = turns * 28
    for (let i = 0; i <= N; i++) {
      const u = i / N
      const h = helixSample(u, turns, sense, phase)
      samples.push({ u, n: h.n, front: h.front, p: at(u, h.n * r) })
    }
    ctx.save()
    ctx.globalAlpha = night() ? 0.5 : 0.42
    for (const run of splitRuns(samples, false)) path(m, run.map((s) => s.p), { color: cc, width: 1.25, dash: [4, 3] })
    ctx.restore()

    if (count && pol.northEnd) {
      for (const ln of solenoidLocalLines(count, pol.northEnd)) {
        if (ln.kind !== 'in') continue
        const pts = ln.pts.map(([u, n]) => at(u, n * r))
        path(m, pts, { color: fc, width: 1.2 })
        arrowMid(m, pts, ln.sign, fc, r * 0.55)
      }
    }

    for (const run of splitRuns(samples, true)) path(m, run.map((s) => s.p), { color: cc, width: 1.85 })

    if (current) {
      const fronts = splitRuns(samples, true)
      const want = Math.min(3, fronts.length)
      for (let k = 0; k < want; k++) {
        const run = fronts[Math.min(fronts.length - 1, Math.round(((k + 0.5) * fronts.length) / want - 0.5))]
        let atP = run[0]
        for (const s of run) if (Math.abs(s.n) < Math.abs(atP.n)) atP = s
        const i = Math.max(0, run.indexOf(atP))
        const prev = run[Math.max(0, i - 1)]
        const next = run[Math.min(run.length - 1, i + 1)]
        let vx = next.p[0] - prev.p[0]
        let vy = next.p[1] - prev.p[1]
        if (current < 0) {
          vx = -vx
          vy = -vy
        }
        const mag = Math.hypot(vx, vy) || 1
        const L = r * 0.62
        arrow(m, atP.p[0] - (vx / mag) * L * 0.5, atP.p[1] - (vy / mag) * L * 0.5, atP.p[0] + (vx / mag) * L * 0.5, atP.p[1] + (vy / mag) * L * 0.5, { color: colors.ink, width: 1.35, head: 7 })
      }
    }

    const t1 = at(0, reach)
    const t2 = at(1, reach)
    if (term !== 'none') {
      const e1 = at(0, exitN * r)
      const e2 = at(1, exitN * r)
      line(m, e1[0], e1[1], t1[0], t1[1], { color: colors.ink, width: 1.4 })
      line(m, e2[0], e2[1], t2[0], t2[1], { color: colors.ink, width: 1.4 })
      for (const p of [t1, t2]) craft.sphere(ctx, m.x(p[0]), m.y(p[1]), 3.4, 'brass', theme, { line: 'strong' })
    }

    if (o.labels && pol.northEnd) {
      const put = (end, letter) => {
        const sign = end === 2 ? 1 : -1
        const p = at(end === 2 ? 1 : 0, 0)
        const ox = ux * sign
        const oy = uy * sign
        const place = Math.abs(ox) >= Math.abs(oy) ? (ox >= 0 ? 'right' : 'left') : oy >= 0 ? 'above' : 'below'
        label(m, p[0] + ox * r * 0.15, p[1] + oy * r * 0.15, letter, { place, size: 15, weight: 700, offset: 8 })
      }
      put(pol.northEnd, 'N')
      put(pol.southEnd, 'S')
    }

    const corners = [at(-0.02, r * 1.05), at(1.02, r * 1.05), at(1.02, -r * 1.05), at(-0.02, -r * 1.05)]
    const xs = corners.map((p) => m.x(p[0]))
    const ys = corners.map((p) => m.y(p[1]))
    addShape(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))

    const end = (e) => (e === 1 ? at(0, 0) : e === 2 ? at(1, 0) : null)
    return { north: end(pol.northEnd), south: end(pol.southEnd), terminals: [t1, t2], axis: { ux, uy }, pt: (u) => at(u, 0) }
  }

  /**
   * Toroid seen face-on. sense +1 and current > 0: near wire runs inner → outer
   * toward counter-clockwise, outer mark is ⊗, and B inside the ring is clockwise.
   */
  function toroid(m, cx, cy, R, o = {}) {
    const r = o.r > 0 ? o.r : R * 0.28
    if (!(R > r) || !(r > 0)) throw new Error('v.toroid 的环半径 R 要大于管半径 r，且两者为正')
    const turns = Math.max(6, Math.min(36, Math.round(o.turns || 18)))
    const sense = o.sense < 0 ? -1 : 1
    const current = Number(o.current) || 0
    const ccw = toroidCCW(sense, current)
    const gap = Math.max(0, Math.min(160, Number(o.gap) || 0)) * (Math.PI / 180)
    const gapAt = (Number(o.gapAt) || 0) * (Math.PI / 180)
    const inGap = (th) => {
      if (!(gap > 0)) return false
      let d = Math.abs((((th - gapAt) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI))
      if (d > Math.PI) d = 2 * Math.PI - d
      return d < gap / 2
    }
    const X = m.x(cx)
    const Y = m.y(cy)
    // Iron ring core: light steel lit from above, same outline as other solids.
    const kc = craft.craftTokens(theme)
    const ringFill = ctx.createLinearGradient(0, Y - Math.abs(m.s(R + r)), 0, Y + Math.abs(m.s(R + r)))
    for (const [off, c] of kc.materials.steelHi.stops) ringFill.addColorStop(off, c)
    if (!(gap > 0.02)) {
      ctx.beginPath()
      ctx.arc(X, Y, Math.abs(m.s(R + r)), 0, Math.PI * 2)
      ctx.arc(X, Y, Math.abs(m.s(R - r)), 0, Math.PI * 2, true)
      ctx.fillStyle = ringFill
      ctx.fill('evenodd')
      stroke({ color: kc.strong.color, width: kc.strong.width })
      ctx.beginPath()
      ctx.arc(X, Y, Math.abs(m.s(R + r)), 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(X, Y, Math.abs(m.s(R - r)), 0, Math.PI * 2)
      ctx.stroke()
    } else {
      const a0 = gapAt + gap / 2
      const sweep = 2 * Math.PI - gap
      const n = Math.max(24, Math.ceil((sweep * Math.abs(m.s(R))) / 8))
      const outer = []
      const inner = []
      for (let i = 0; i <= n; i++) {
        const a = a0 + (sweep * i) / n
        outer.push([cx + (R + r) * Math.cos(a), cy + (R + r) * Math.sin(a)])
        inner.push([cx + (R - r) * Math.cos(a), cy + (R - r) * Math.sin(a)])
      }
      path(m, [...outer, ...inner.reverse()], { close: true, fill: ringFill, color: kc.strong.color, width: kc.strong.width })
    }

    const cc = colors.charge
    const sh = sense * r * 0.42
    for (let i = 0; i < turns; i++) {
      const th = (2 * Math.PI * i) / turns
      if (inGap(th)) continue
      const urx = Math.cos(th)
      const ury = Math.sin(th)
      const utx = -Math.sin(th)
      const uty = Math.cos(th)
      const innerP = [cx + urx * (R - r), cy + ury * (R - r)]
      const outerP = [cx + urx * (R + r), cy + ury * (R + r)]
      const shift = (p, s) => [p[0] + utx * s, p[1] + uty * s]
      const back = [shift(innerP, sh * 0.25), shift(outerP, -sh)]
      const front = [shift(innerP, -sh * 0.25), shift(outerP, sh)]
      ctx.save()
      ctx.globalAlpha = 0.4
      path(m, back, { color: cc, width: 1.15, dash: [3, 3] })
      ctx.restore()
      path(m, front, { color: cc, width: 1.7 })
    }
    if (current) {
      let arrows = 0
      const stride = Math.max(1, Math.floor(turns / 3))
      for (let i = stride; i < turns && arrows < 3; i += stride) {
        const th = (2 * Math.PI * i) / turns
        if (inGap(th)) continue
        const urx = Math.cos(th)
        const ury = Math.sin(th)
        const utx = -Math.sin(th)
        const uty = Math.cos(th)
        const shift = (p, s) => [p[0] + utx * s, p[1] + uty * s]
        const innerP = [cx + urx * (R - r * 0.2), cy + ury * (R - r * 0.2)]
        const outerP = [cx + urx * (R + r * 0.2), cy + ury * (R + r * 0.2)]
        const frontA = shift(innerP, -sh * 0.2)
        const frontB = shift(outerP, sh * 0.45)
        const a = current > 0 ? frontA : frontB
        const b = current > 0 ? frontB : frontA
        const mxp = (a[0] + b[0]) / 2
        const myp = (a[1] + b[1]) / 2
        const vx = b[0] - a[0]
        const vy = b[1] - a[1]
        const mag = Math.hypot(vx, vy) || 1
        const L = r * 0.95
        arrow(m, mxp - (vx / mag) * L * 0.5, myp - (vy / mag) * L * 0.5, mxp + (vx / mag) * L * 0.5, myp + (vy / mag) * L * 0.5, { color: colors.ink, width: 1.45, head: 7 })
        arrows++
      }
      const outerOut = sense * Math.sign(current) < 0
      const pitch = (2 * Math.PI) / turns
      for (const base of [Math.PI / 2, (3 * Math.PI) / 2]) {
        const th = base + pitch * 0.5
        if (inGap(th)) continue
        currentMark(m, cx + Math.cos(th) * (R + r + 0.06), cy + Math.sin(th) * (R + r + 0.06), outerOut, 6)
        currentMark(m, cx + Math.cos(th) * (R - r - 0.06), cy + Math.sin(th) * (R - r - 0.06), !outerOut, 6)
      }
    }

    const nArr = howMany(o.field, 4, 8)
    if (nArr && ccw) {
      for (let i = 0; i < nArr; i++) {
        const th = (2 * Math.PI * (i + 0.5)) / nArr
        if (inGap(th)) continue
        const x = cx + R * Math.cos(th)
        const y = cy + R * Math.sin(th)
        const tx = -Math.sin(th) * ccw
        const ty = Math.cos(th) * ccw
        const L = Math.min(R * 0.3, r * 1.05)
        arrow(m, x - tx * L, y - ty * L, x + tx * L * 0.35, y + ty * L * 0.35, { color: colors.field, width: 1.35, head: 8 })
      }
      if (gap > 0.04) {
        const x = cx + R * Math.cos(gapAt)
        const y = cy + R * Math.sin(gapAt)
        const tx = -Math.sin(gapAt) * ccw
        const ty = Math.cos(gapAt) * ccw
        const L = R * gap * 0.45
        arrow(m, x - tx * L, y - ty * L, x + tx * L, y + ty * L, { color: colors.field, width: 1.35, head: 8 })
      }
    }
    addShape(X - Math.abs(m.s(R + r)), Y - Math.abs(m.s(R + r)), Math.abs(m.s(R + r)) * 2, Math.abs(m.s(R + r)) * 2)
    return { ccw }
  }

  /**
   * Bar or horseshoe magnet. N half is red, S half is blue. Field lines are
   * traced from a two-pole model (bar) or across the gap (horseshoe).
   */
  function magnet(m, x, y, o = {}) {
    const kind = o.kind === 'horseshoe' || o.kind === 'U' || o.kind === 'u' ? 'horseshoe' : 'bar'
    const w = o.w > 0 ? o.w : kind === 'bar' ? 2.2 : 1.6
    const h = o.h > 0 ? o.h : kind === 'bar' ? 0.48 : 1.45
    if (!(w > 0) || !(h > 0)) throw new Error('v.magnet 的 w、h 应为正数')
    const paint = polePaint()
    const count = howMany(o.field, kind === 'bar' ? 6 : 5, 8)
    const letter = (px, py, str) => text(m, px, py, str, { size: 15, color: '#FFFFFF', weight: 700, plain: true })
    if (kind === 'bar') {
      const f = barFrame(x, y, w, h, o.north || 'right', o.angle || 0)
      if (count) {
        for (const pts of fieldLinesFromPoles(f.north, f.south, count)) {
          path(m, pts, { color: colors.field, width: 1.15 })
          arrowMid(m, pts, 1, colors.field, Math.min(w, h) * 0.35)
        }
      }
      const corner = (lx, ly) => [x + lx * f.ux + ly * f.px, y + lx * f.uy + ly * f.py]
      const half = (x0, x1, fill) => painted(m, [corner(x0, h / 2), corner(x1, h / 2), corner(x1, -h / 2), corner(x0, -h / 2)], fill)
      half(0, w / 2, paint.N)
      half(-w / 2, 0, paint.S)
      const nL = corner(w / 4, 0)
      const sL = corner(-w / 4, 0)
      letter(nL[0], nL[1], 'N')
      letter(sL[0], sL[1], 'S')
      const box = [corner(-w / 2, -h / 2), corner(w / 2, h / 2)].map((p) => [m.x(p[0]), m.y(p[1])])
      addShape(Math.min(box[0][0], box[1][0]), Math.min(box[0][1], box[1][1]), Math.abs(box[1][0] - box[0][0]), Math.abs(box[1][1] - box[0][1]), BODY)
      return { north: f.north, south: f.south }
    }
    const f = horseshoeFrame(x, y, w, h, o.north === 'right' ? 'right' : 'left', o.angle || 0)
    const origin = f.map([0, 0])
    const out = f.map([0, -1])
    const normal = [out[0] - origin[0], out[1] - origin[1]]
    if (count) {
      for (const pts of gapLines(f.north, f.south, normal, count)) {
        path(m, pts, { color: colors.field, width: 1.15 })
        arrowMid(m, pts, 1, colors.field, f.t * 0.8)
      }
    }
    const arc = (ax, ay, rad, a0, a1, n) => {
      const pts = []
      for (let i = 0; i <= n; i++) {
        const a = a0 + ((a1 - a0) * i) / n
        pts.push([ax + rad * Math.cos(a), ay + rad * Math.sin(a)])
      }
      return pts
    }
    const leftLocal = [[-f.R, f.yb], [-f.R, f.Cy], ...arc(0, f.Cy, f.R, Math.PI, Math.PI / 2, 16).slice(1), ...arc(0, f.Cy, f.Ri, Math.PI / 2, Math.PI, 14).slice(1), [-f.Ri, f.yb]]
    const rightLocal = [[f.R, f.yb], [f.R, f.Cy], ...arc(0, f.Cy, f.R, 0, Math.PI / 2, 16).slice(1), ...arc(0, f.Cy, f.Ri, Math.PI / 2, 0, 14).slice(1), [f.Ri, f.yb]]
    const northLeft = o.north !== 'right'
    painted(m, leftLocal.map(f.map), northLeft ? paint.N : paint.S)
    painted(m, rightLocal.map(f.map), northLeft ? paint.S : paint.N)
    const ly = f.yb + Math.min(f.t * 1.5, Math.max(0.05, f.Cy - f.yb) * 0.45)
    const lx = f.R - f.t / 2
    const lL = f.map([-lx, ly])
    const rL = f.map([lx, ly])
    letter(lL[0], lL[1], northLeft ? 'N' : 'S')
    letter(rL[0], rL[1], northLeft ? 'S' : 'N')
    addShape(m.x(x) - Math.abs(m.s(f.R)) - 4, m.y(y) - Math.abs(m.s(f.H / 2)) - 4, Math.abs(m.s(f.R)) * 2 + 8, Math.abs(m.s(f.H)) + 8, BODY)
    return { north: f.north, south: f.south }
  }

  /**
   * Radial field in an annular gap. Shoes: B leaves the N shoe, enters the core,
   * and comes out into the S shoe. Ring: every arrow has the same radial sense.
   */
  function radialField(m, cx, cy, rIn, rOut, o = {}) {
    if (!(rOut > rIn) || !(rIn >= 0)) throw new Error('v.radialField 需要 0 ≤ rIn < rOut')
    const opts = o || {}
    const poles = radialPoles(cx, cy, rIn, rOut, opts)
    const pack = radialArrows(opts)
    const paint = polePaint()
    const shoe = poles.shoe
    const northRight = opts.north === 'right'
    const span = ((opts.span ?? 130) * Math.PI) / 180
    const half = span / 2
    if (poles.layout === 'ring') {
      const innerNorth = poles.north[0] === cx && poles.north[1] === cy
      ctx.beginPath()
      ctx.arc(m.x(cx), m.y(cy), Math.abs(m.s(rOut + shoe)), 0, Math.PI * 2)
      ctx.arc(m.x(cx), m.y(cy), Math.abs(m.s(rOut)), 0, Math.PI * 2, true)
      ctx.fillStyle = innerNorth ? paint.S : paint.N
      ctx.fill('evenodd')
      stroke({ color: colors.ink, width: 1.2 })
      ctx.beginPath()
      ctx.arc(m.x(cx), m.y(cy), Math.abs(m.s(rOut + shoe)), 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(m.x(cx), m.y(cy), Math.abs(m.s(rOut)), 0, Math.PI * 2)
      ctx.stroke()
      circle(m, cx, cy, rIn, { fill: innerNorth ? paint.N : paint.S, color: colors.ink, width: 1.2 })
      text(m, cx, cy, innerNorth ? 'N' : 'S', { size: Math.max(12, Math.min(18, Math.abs(m.s(rIn)) * 0.7)), color: '#FFFFFF', weight: 700, plain: true })
      text(m, cx + (rOut + shoe * 0.5), cy, innerNorth ? 'S' : 'N', { size: 14, color: '#FFFFFF', weight: 700, plain: true })
    } else {
      const sector = (a0, a1) => {
        const n = 20
        const outer = []
        const inner = []
        for (let i = 0; i <= n; i++) {
          const a = a0 + ((a1 - a0) * i) / n
          outer.push([cx + (rOut + shoe) * Math.cos(a), cy + (rOut + shoe) * Math.sin(a)])
          inner.push([cx + rOut * Math.cos(a), cy + rOut * Math.sin(a)])
        }
        return [...outer, ...inner.reverse()]
      }
      painted(m, sector(Math.PI - half, Math.PI + half), northRight ? paint.S : paint.N)
      painted(m, sector(-half, half), northRight ? paint.N : paint.S)
      const iron = night() ? '#5C6168' : '#CDD1D7'
      if (opts.core !== false) painted(m, Array.from({ length: 64 }, (_, i) => [cx + rIn * Math.cos((i / 64) * Math.PI * 2), cy + rIn * Math.sin((i / 64) * Math.PI * 2)]), iron)
      else circle(m, cx, cy, rIn, { color: colors.steel, width: 1.1, dash: [4, 3] })
      const lAng = Math.PI
      const rAng = 0
      const lr = rOut + shoe * 0.48
      text(m, cx + lr * Math.cos(lAng), cy + lr * Math.sin(lAng), northRight ? 'S' : 'N', { size: 14, color: '#FFFFFF', weight: 700, plain: true })
      text(m, cx + lr * Math.cos(rAng), cy + lr * Math.sin(rAng), northRight ? 'N' : 'S', { size: 14, color: '#FFFFFF', weight: 700, plain: true })
    }

    const gapW = rOut - rIn
    const innerR = rIn + gapW * 0.2
    const outerR = rOut - gapW * 0.16
    for (const a of pack.arrows) {
      const r0 = a.outward ? innerR : outerR
      const r1 = a.outward ? outerR : innerR
      arrow(m, cx + r0 * Math.cos(a.theta), cy + r0 * Math.sin(a.theta), cx + r1 * Math.cos(a.theta), cy + r1 * Math.sin(a.theta), { color: colors.field, width: 1.2, head: 7 })
    }

    if (opts.coil && typeof opts.coil === 'object') {
      const ang = ((opts.coil.angle || 0) * Math.PI) / 180
      const ca = Math.cos(ang)
      const sa = Math.sin(ang)
      const hw = (opts.coil.w > 0 ? opts.coil.w : rIn + rOut) / 2
      const hh = (opts.coil.h > 0 ? opts.coil.h : hw) / 2
      const corner = (sx, sy) => [cx + sx * hw * ca - sy * hh * sa, cy + sx * hw * sa + sy * hh * ca]
      path(m, [corner(1, 1), corner(-1, 1), corner(-1, -1), corner(1, -1)], { close: true, color: colors.ink, width: 1.6 })
      const cur = opts.coil.current === undefined ? 1 : Number(opts.coil.current) || 0
      if (cur) {
        const rad = Math.max(5, Math.min(8, Math.abs(m.s(gapW)) * 0.22))
        currentMark(m, corner(1, 0)[0], corner(1, 0)[1], cur > 0, rad)
        currentMark(m, corner(-1, 0)[0], corner(-1, 0)[1], cur < 0, rad)
      }
    }

    const outer = Math.abs(m.s(rOut + shoe + 0.05))
    addShape(m.x(cx) - outer, m.y(cy) - outer, outer * 2, outer * 2, BACKDROP)
    return { north: poles.north, south: poles.south, core: poles.core }
  }

  function render() {
    if (!def || !gotParams || !cssW || !cssH) return
    try {
      ambient = false
      ctx.clearRect(0, 0, cssW, cssH)
      frameLabels = []
      frameShapes = []
      pendingTexts = []
      pendingLabels = []
      frameSurfaces = []
      pendingEvents = []
      shapeTag = null
      layoutView = null
      layoutLabelTexts = []
      layoutFrame = layoutOn() ? { labels: [], texts: [], geom: {}, strokes: [], t } : null
      if (layoutFrame) {
        // Remember which v call queued each deferred label; they are placed after draw returns.
        for (const list of [pendingLabels, pendingTexts]) {
          list.push = function (item) {
            if (!item.tag && shapeTag) item.tag = shapeTag
            return Array.prototype.push.call(this, item)
          }
        }
      }
      const s = stateAt(t)
      // draw often reads `p` the way at(t, p) does; make that the same params object as v.p.
      window.p = params
      const api = {
        t,
        p: params,
        width: cssW,
        height: cssH,
        color: colors,
        theme,
        night: night(),
        duration: meta.duration,
        at: sampleAt,
        view,
        line,
        path,
        circle,
        ellipse,
        rect,
        arrow,
        vec,
        label,
        text,
        dim,
        ruler: (m, x1, x2, y, o = {}) => ruler(m, x1, x2, y, { body: true, ...o }),
        axisX,
        ground,
        wall,
        cart,
        car,
        block,
        ball,
        com,
        spring,
        springScale,
        electrometer,
        rope,
        pulley,
        incline,
        cylinder,
        tube,
        vessel,
        conveyor,
        bar,
        photon,
        element,
        planet,
        orbit,
        satellite,
        field,
        efield,
        regions,
        rails,
        plates,
        platesAt,
        ray,
        optics,
        track,
        photogate,
        wire,
        sampleWire,
        transformer,
        oilFilm,
        centripetalDemo,
        crt,
        hall,
        cyclotron,
        solenoid,
        toroid,
        magnet,
        radialField,
        wave,
        waves,
        lightColor,
        strobe,
        trail,
        pulse,
        event,
        particles,
        stars,
      }
      if (layoutFrame) tagApi(api)
      def.draw(ctx, s, api, params)
      flushEvents()
      if (!layoutFrame) {
        for (const [X, Y, str, o] of pendingTexts) drawText(X, Y, str, o)
      } else {
        for (const item of pendingTexts) {
          shapeTag = item.tag || 'v.text'
          drawText(item[0], item[1], item[2], item[3])
          shapeTag = null
        }
      }
      // Event chips are the headline of a moment, so they claim space before vector labels.
      for (const item of pendingLabels) {
        const [X, Y, str, o] = item
        layoutLabelTag = item.tag || ''
        if (o.chip) placeLabel(X, Y, str, o)
      }
      // A region the lesson already labels by hand keeps only the hand-placed name.
      const named = new Set(pendingLabels.filter(([, , , o]) => !o.auto).map(([, , str]) => str.trim()))
      for (const item of pendingLabels) {
        const [X, Y, str, o] = item
        layoutLabelTag = item.tag || ''
        if (!o.chip && !(o.auto && named.has(str.trim()))) placeLabel(X, Y, str, o)
      }
      layoutLabelTag = ''
      if (layoutFrame) {
        const geom = []
        for (const tag in layoutFrame.geom) geom.push(Object.assign({ tag }, layoutFrame.geom[tag]))
        layoutFrame.geom = geom
        layoutFrame.view = layoutView
        layoutFrame.cssW = cssW
        layoutFrame.cssH = cssH
        layoutFrame.t = t
        if (!globalThis.__GENUI_LAYOUT_LOG__) globalThis.__GENUI_LAYOUT_LOG__ = []
        globalThis.__GENUI_LAYOUT_LOG__.push(layoutFrame)
        layoutFrame = null
        shapeTag = null
      }
      if (failed) {
        failed = false
        post({ type: 'ok' })
      }
    } catch (e) {
      ambient = false
      failed = true
      post({ type: 'error', message: String((e && e.message) || e) })
    }
    scheduleAmbient()
  }

  function scheduleAmbient() {
    if (!ambient || ambientRaf) return
    ambientRaf = requestAnimationFrame(() => {
      ambientRaf = 0
      render()
    })
  }

  window.addEventListener('message', (e) => {
    if (e.source !== parent) return
    const msg = e.data
    if (!msg || msg.source !== 'genui-host') return
    if (Array.isArray(msg.fonts)) {
      Promise.all(
        msg.fonts.map((f) => {
          try {
            const face = new FontFace(f.family, f.data, { weight: f.weight, style: f.style, unicodeRange: f.unicodeRange })
            document.fonts.add(face)
            return face.load()
          } catch {
            return null
          }
        }),
      ).then(render, render)
      return
    }
    if (msg.colors) colors = msg.colors
    if (msg.theme) theme = msg.theme
    if (msg.meta) meta = msg.meta
    if (msg.params) {
      gotParams = true
      const key = JSON.stringify(msg.params)
      if (key !== paramsKey) {
        paramsKey = key
        params = hydrate(msg.params)
        cache = null
      }
    }
    if (typeof msg.t === 'number') t = msg.t
    if (ambientRaf) {
      cancelAnimationFrame(ambientRaf)
      ambientRaf = 0
    }
    render()
  })

  window.addEventListener('resize', () => {
    resize()
    render()
  })

  window.addEventListener('error', (e) => post({ type: 'error', message: e.message }))

  window.__simReady = () => {
    resize()
    if (!def) post({ type: 'error', message: '课件代码没有调用 sim({...}) 或 figure({...})' })
    else post({ type: 'ready' })
  }
})()
