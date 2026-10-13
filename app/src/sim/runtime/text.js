// Sandbox runtime, part: typography: fonts, subscripts, measuring and drawing text runs.
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
