// Sandbox runtime, part: per-frame render, message handling, ready signal.
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
        gear,
        gearMesh,
        parachute,
        box,
        wedge,
        slab,
        hand,
        laser,
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
