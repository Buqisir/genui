// Sandbox runtime, part: shared imports, frame state, layout bookkeeping, messaging, history sampling.
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
    gearProfile,
    gearMeshAngle,
    parachuteFrame,
    wedgeFrame,
    slabFrame,
    slabLoop,
    handFrame,
    laserFrame,
    plowFrame,
    emitterFrame,
    backshellFrame,
    airbagFrame,
    airconFrame,
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
