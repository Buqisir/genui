// Sandbox runtime, part: motion marks and ambient effects: waves, strobe, trail, events, particles, stars.
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
