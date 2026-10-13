// Sandbox runtime, part: painted parts, solenoid, toroid, magnet, radial field.
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
