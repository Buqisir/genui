// Outlines for round and necked vessels. Areas are not volumes: a lesson that
// needs V writes it in <Define>. Polygons are sampled in physical coordinates
// (y up) and wound the same way, so a nonzero fill is their union.
// `wall` is the glass thickness and `lip` how far an open end is carved past
// the rim (both in the same length unit as the part). The cavity used for
// hit-tests stops at the rim; the draw cavity continues through the opening.

function vesselNum(v, d) {
  return typeof v === 'number' && Number.isFinite(v) ? v : d
}

function vesselRect(x1, y1, x2, y2) {
  const xa = Math.min(x1, x2)
  const xb = Math.max(x1, x2)
  const ya = Math.min(y1, y2)
  const yb = Math.max(y1, y2)
  return [
    [xa, ya],
    [xb, ya],
    [xb, yb],
    [xa, yb],
  ]
}

function vesselCircle(cx, cy, r, n) {
  const pts = []
  const N = n || 72
  for (let i = 0; i < N; i++) {
    const a = (2 * Math.PI * i) / N
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  return pts
}

export function insidePolygon(x, y, poly) {
  let w = 0
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0]
    const yi = poly[i][1]
    const xj = poly[j][0]
    const yj = poly[j][1]
    if (yi > y !== yj > y) {
      const xint = ((y - yi) * (xj - xi)) / (yj - yi) + xi
      if (x < xint) w++
    }
  }
  return w % 2 === 1
}

export function insideAny(x, y, polys) {
  for (const p of polys) if (p && p.length >= 3 && insidePolygon(x, y, p)) return true
  return false
}

function flaskPart(spec, wall, lip) {
  const cx = vesselNum(spec.cx, 0)
  const cy = vesselNum(spec.cy, 0)
  const r = Math.abs(vesselNum(spec.r, 0))
  const neck = spec.neck || {}
  const half = Math.abs(vesselNum(neck.w, r * 0.25)) / 2
  const h = Math.abs(vesselNum(neck.h, r))
  const open = spec.open !== false
  const halfChord = Math.min(half, r * 0.999)
  const chord = Math.sqrt(Math.max(r * r - halfChord * halfChord, 0))
  const yTop = cy + r + h
  const inset = Math.min(r * 0.12, chord * 0.5)
  const yBot = cy + chord - inset
  const cap = open ? lip : 0
  // The cap is part of the glass either way; an open mouth carves it back off.
  const glassTop = yTop + wall
  const cavity = [vesselCircle(cx, cy, Math.max(r, 1e-6), 72), vesselRect(cx - half, yBot, cx + half, yTop)]
  const draw = [vesselCircle(cx, cy, Math.max(r, 1e-6), 72), vesselRect(cx - half, yBot, cx + half, yTop + cap)]
  const glass = [vesselCircle(cx, cy, r + wall, 72), vesselRect(cx - half - wall, yBot, cx + half + wall, glassTop)]
  const openings = [{ x: cx, y: yTop, w: half * 2, side: 'top', open }]
  return { cavity, draw, glass, openings }
}

function bottlePart(spec, wall, lip) {
  const x1 = Math.min(vesselNum(spec.x1, 0), vesselNum(spec.x2, 0))
  const x2 = Math.max(vesselNum(spec.x1, 0), vesselNum(spec.x2, 0))
  const y1 = Math.min(vesselNum(spec.y1, 0), vesselNum(spec.y2, 0))
  const y2 = Math.max(vesselNum(spec.y1, 0), vesselNum(spec.y2, 0))
  const neck = spec.neck || {}
  const half = Math.abs(vesselNum(neck.w, (x2 - x1) * 0.25)) / 2
  const h = Math.abs(vesselNum(neck.h, 0))
  const shoulder = Math.max(vesselNum(spec.shoulder, 0), 0)
  const open = spec.open !== false
  const cx = (x1 + x2) / 2
  const yNeck = y2 + shoulder
  const yTop = yNeck + h
  const cap = open ? lip : 0
  const poly = (top) => [
    [x1, y1],
    [x2, y1],
    [x2, y2],
    [cx + half, yNeck],
    [cx + half, top],
    [cx - half, top],
    [cx - half, yNeck],
    [x1, y2],
  ]
  const glass = [
    [x1 - wall, y1 - wall],
    [x2 + wall, y1 - wall],
    [x2 + wall, y2],
    [cx + half + wall, yNeck],
    [cx + half + wall, yTop + wall],
    [cx - half - wall, yTop + wall],
    [cx - half - wall, yNeck],
    [x1 - wall, y2],
  ]
  return {
    cavity: [poly(yTop)],
    draw: [poly(yTop + cap)],
    glass: [glass],
    openings: [{ x: cx, y: yTop, w: half * 2, side: 'top', open }],
  }
}

function jarArc(cx, y, r, h, samples) {
  const pts = []
  if (h <= r + 1e-9) {
    const N = samples
    for (let i = 0; i <= N; i++) {
      const a = Math.PI - (Math.PI * i) / N
      pts.push([cx + r * Math.cos(a), y + h * Math.sin(a)])
    }
    return pts
  }
  const sideTop = y + (h - r)
  const N = samples
  pts.push([cx - r, y])
  pts.push([cx - r, sideTop])
  for (let i = 1; i < N; i++) {
    const a = Math.PI - (Math.PI * i) / N
    pts.push([cx + r * Math.cos(a), sideTop + r * Math.sin(a)])
  }
  pts.push([cx + r, sideTop])
  pts.push([cx + r, y])
  return pts
}

function jarPart(spec, wall, lip) {
  const cx = vesselNum(spec.cx, 0)
  const y = vesselNum(spec.y, 0)
  const r = Math.abs(vesselNum(spec.r, 0))
  const h = Math.abs(vesselNum(spec.h, r))
  const inner = jarArc(cx, y, Math.max(r, 1e-6), Math.max(h, 1e-6), 28)
  const outer = jarArc(cx, y, r + wall, h + wall, 28)
  const left = inner[0][0]
  const right = inner[inner.length - 1][0]
  const draw = [...inner, [right, y - lip], [left, y - lip]]
  const oLeft = outer[0][0]
  const oRight = outer[outer.length - 1][0]
  const glass = [...outer, [oRight, y - wall], [oLeft, y - wall]]
  return {
    cavity: [inner],
    draw: [draw],
    glass: [glass],
    openings: [{ x: cx, y, w: 2 * r, side: 'bottom', open: true }],
  }
}

function capillaryPart(spec, wall, lip) {
  const x = vesselNum(spec.x, 0)
  const yb = Math.min(vesselNum(spec.y1, 0), vesselNum(spec.y2, 0))
  const yt = Math.max(vesselNum(spec.y1, 0), vesselNum(spec.y2, 0))
  const half = Math.abs(vesselNum(spec.w, 0.1)) / 2
  return {
    cavity: [vesselRect(x - half, yb, x + half, yt)],
    draw: [vesselRect(x - half, yb - lip, x + half, yt + lip)],
    glass: [vesselRect(x - half - wall, yb, x + half + wall, yt)],
    openings: [
      { x, y: yt, w: half * 2, side: 'top', open: true },
      { x, y: yb, w: half * 2, side: 'bottom', open: true },
    ],
  }
}

function axisPart(spec, wall, lip) {
  const x1 = Math.min(vesselNum(spec.x1, 0), vesselNum(spec.x2, 0))
  const x2 = Math.max(vesselNum(spec.x1, 0), vesselNum(spec.x2, 0))
  const y1 = Math.min(vesselNum(spec.y1, 0), vesselNum(spec.y2, 0))
  const y2 = Math.max(vesselNum(spec.y1, 0), vesselNum(spec.y2, 0))
  const open = spec.open
  const ext = { left: 0, right: 0, top: 0, bottom: 0 }
  if (open === 'left') ext.left = lip
  else if (open === 'right') ext.right = lip
  else if (open === 'top') ext.top = lip
  else if (open === 'bottom') ext.bottom = lip
  const openings = []
  if (open === 'top') openings.push({ x: (x1 + x2) / 2, y: y2, w: x2 - x1, side: 'top', open: true })
  else if (open === 'bottom') openings.push({ x: (x1 + x2) / 2, y: y1, w: x2 - x1, side: 'bottom', open: true })
  else if (open === 'left') openings.push({ x: x1, y: (y1 + y2) / 2, w: y2 - y1, side: 'left', open: true })
  else if (open === 'right') openings.push({ x: x2, y: (y1 + y2) / 2, w: y2 - y1, side: 'right', open: true })
  return {
    cavity: [vesselRect(x1, y1, x2, y2)],
    draw: [vesselRect(x1 - ext.left, y1 - ext.bottom, x2 + ext.right, y2 + ext.top)],
    glass: [vesselRect(x1 - wall, y1 - wall, x2 + wall, y2 + wall)],
    openings,
  }
}

/** Mirror a built part about y = yc (an inverted bottle or flask: neck pointing down). */
function flipPart(part, yc) {
  const fy = (pts) => pts.map(([x, y]) => [x, 2 * yc - y]).reverse()
  return {
    cavity: part.cavity.map(fy),
    draw: part.draw.map(fy),
    glass: part.glass.map(fy),
    openings: part.openings.map((o) => ({ ...o, y: 2 * yc - o.y, side: o.side === 'top' ? 'bottom' : o.side === 'bottom' ? 'top' : o.side })),
  }
}

export function vesselLayout(parts, wall, lip) {
  const thickness = Math.max(vesselNum(wall, 0), 0)
  const openLip = lip == null ? thickness : Math.max(vesselNum(lip, thickness), thickness)
  const built = []
  const openings = []
  for (const p of parts || []) {
    if (!p || typeof p !== 'object') continue
    let part = null
    if (p.flask) {
      part = flaskPart(p.flask, thickness, openLip)
      if (p.flask.down === true) part = flipPart(part, vesselNum(p.flask.cy, 0))
    } else if (p.bottle) {
      part = bottlePart(p.bottle, thickness, openLip)
      if (p.bottle.down === true) part = flipPart(part, (vesselNum(p.bottle.y1, 0) + vesselNum(p.bottle.y2, 0)) / 2)
    }
    else if (p.jar) part = jarPart(p.jar, thickness, openLip)
    else if (p.capillary) part = capillaryPart(p.capillary, thickness, openLip)
    else if (p.x1 != null && p.y1 != null) part = axisPart(p, thickness, openLip)
    if (!part) continue
    built.push(part)
    for (const o of part.openings) openings.push(o)
  }
  const mouth = openings.find((o) => o.side === 'top') || openings[0] || null
  return { parts: built, openings, mouth }
}

/** True when (x, y) is inside the union of the cavities, not counting the open lip. */
export function cavityContains(parts, x, y, wall) {
  const layout = vesselLayout(parts, wall || 0, wall || 0)
  return insideAny(
    x,
    y,
    layout.parts.flatMap((p) => p.cavity),
  )
}

export function installVesselGlobals(g) {
  Object.assign(g, {
    vesselNum,
    vesselRect,
    vesselCircle,
    insidePolygon,
    insideAny,
    flaskPart,
    bottlePart,
    jarArc,
    jarPart,
    capillaryPart,
    axisPart,
    vesselLayout,
    cavityContains,
  })
}
