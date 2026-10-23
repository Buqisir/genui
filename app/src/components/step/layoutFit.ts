import { useLayoutEffect, useState, useSyncExternalStore, type RefObject } from 'react'
import { CANVAS_MAX, CANVAS_MIN, FIT_STAGES, colGap, columnWidths, groupTop, rowGeom, soloWidth, type LayoutKind } from './layout'

/**
 * Desktop layout fitting (plans/lesson-board-spec.md 3.2, 3.3). Everything the step can show is already
 * in the DOM from the first sentence (components not reached yet are `visibility: hidden`, so they keep their
 * room), so one measurement per step gives the final-state size of both columns. From it we fix, once:
 * column widths, the canvas height, the vertical offsets that centre the two columns on each other, and the
 * top of the whole group (G1). Nothing is recomputed per sentence, so nothing moves while the step is read.
 *
 * Safety net: heights are kept as a running maximum for the step (a "ratchet"), so a component that grows
 * later can only move the group once, never back and forth.
 */
export const DESKTOP_QUERY = '(min-width: 1024px)'

const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP_QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
export function useDesktop(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true,
  )
}

export interface FitArgs {
  desktop: boolean
  /** A step is on the board (not the cover or the end page). */
  active: boolean
  kind: LayoutKind
  /** Changes when a different step (or the same step again) is entered. */
  stepKey: string
}

interface Peak {
  L: number
  R: number
  span: number
  extra: number
}

const VARS = ['--lw', '--rc', '--cg', '--ltop', '--rtop', '--gh', '--gtop']
const S5 = 24

export interface FitResult {
  /** Height to give the canvas component, or undefined when the layout does not size it. */
  canvasH: number | undefined
}

export function useLayoutFit(refs: { root: RefObject<HTMLElement | null>; main: RefObject<HTMLElement | null>; work: RefObject<HTMLElement | null> }, a: FitArgs): FitResult {
  const [ch, setCh] = useState(300)

  useLayoutEffect(() => {
    const root = refs.root.current
    const main = refs.main.current
    const work = refs.work.current
    const clear = () => {
      root?.style.removeProperty('--k')
      root?.removeAttribute('data-dn')
      VARS.forEach((v) => work?.style.removeProperty(v))
    }
    if (!root || !main || !work || !a.desktop || !a.active) {
      clear()
      return
    }
    const peaks = new Map<string, Peak>()
    const set = (el: HTMLElement, name: string, v: string) => {
      if (el.style.getPropertyValue(name) !== v) el.style.setProperty(name, v)
    }

    const fit = () => {
      let H = main.clientHeight
      const W = main.clientWidth
      if (W <= 0 || H <= 0) return
      const cg = colGap(window.innerWidth)
      const leftIn = work.querySelector<HTMLElement>(':scope > .sl-cols > .sl-left > .sl-colin')
      const rightIn = work.querySelector<HTMLElement>(':scope > .sl-cols > .sl-right > .sl-colin')
      const spanEl = work.querySelector<HTMLElement>(':scope > .sl-span')
      const scene = leftIn?.querySelector<HTMLElement>(':scope > .sl-scene') ?? null
      const solo = !leftIn
      const hasCols = !!(leftIn || rightIn)

      let L = 0
      let R = 0
      let spanH = 0
      let extra = 0
      let lw = 0
      let rc = 0
      let geo: ReturnType<typeof rowGeom> | null = null
      let c = 0
      let stage = 0
      for (; stage < FIT_STAGES.length; stage++) {
        const st = FIT_STAGES[stage]
        set(root, '--k', String(st.k))
        if (root.getAttribute('data-dn') !== String(st.dn)) root.setAttribute('data-dn', String(st.dn))
        const B = parseFloat(getComputedStyle(root).fontSize) || 16
        H = main.clientHeight // tighter stages also shrink the gap above the main area
        // fill: the Fill component splits its own card/options halves, so it gets the two column widths too
        const wd = solo && a.kind !== 'fill' ? { lw: 0, rc: soloWidth(a.kind, W, B) } : columnWidths(a.kind, W, B, cg)
        lw = wd.lw
        rc = wd.rc
        set(work, '--lw', `${lw}px`)
        set(work, '--rc', `${rc}px`)
        set(work, '--cg', `${cg}px`)
        // natural sizes in this stage, raised to the largest seen for this step
        const key = `${W}x${H}:${stage}`
        const pk = peaks.get(key) ?? { L: 0, R: 0, span: 0, extra: 0 }
        const sw = scene?.offsetHeight ?? 0
        pk.L = Math.max(pk.L, leftIn ? leftIn.offsetHeight - sw : 0)
        pk.R = Math.max(pk.R, rightIn ? rightIn.offsetHeight : 0)
        pk.span = Math.max(pk.span, spanEl ? spanEl.offsetHeight : 0)
        if (scene) pk.extra = Math.max(pk.extra, Math.max(0, sw - Number(scene.dataset.h || 0)))
        peaks.set(key, pk)
        ;({ L, R, span: spanH, extra } = pk)

        const rowAvail = H - (spanH && hasCols ? spanH + S5 : 0)
        const pic = (h: number) =>
          rowGeom({ left: L, right: R, picture: scene ? h : 0, gap: 0, bar: scene ? extra : 0, topAlign: a.kind === 'fill' })
        const row = (h: number) => (solo ? { lt: 0, rt: 0, h: R } : pic(h))
        // the tallest the canvas can be: what is left of the row, and not taller than the column is wide
        const cmax = Math.max(CANVAS_MIN, CANVAS_MAX)
        c = scene ? Math.max(CANVAS_MIN, Math.min(cmax, Math.floor(rowAvail - L - extra))) : 0
        let g = row(c)
        while (g.h > rowAvail + 0.5 && scene && c > CANVAS_MIN) {
          c -= 4
          g = row(c)
        }
        geo = g
        const total = (spanH && hasCols ? spanH + S5 : spanH) + g.h
        if (total <= H + 0.5) break
        if (stage === FIT_STAGES.length - 1) break
      }
      if (!geo) return
      const gh = (spanH && hasCols ? spanH + S5 : spanH) + geo.h
      set(work, '--ltop', `${Math.round(geo.lt * 10) / 10}px`)
      set(work, '--rtop', `${Math.round(geo.rt * 10) / 10}px`)
      set(work, '--gh', `${Math.round(gh)}px`)
      set(work, '--gtop', `${Math.round(groupTop(H, gh) * 10) / 10}px`)
      if (scene) setCh((prev) => (prev === c ? prev : c))
    }

    fit()
    const ro = new ResizeObserver(() => fit())
    ro.observe(main)
    work.querySelectorAll('.sl-comp').forEach((el) => ro.observe(el))
    let alive = true
    document.fonts?.ready.then(() => alive && fit())
    return () => {
      alive = false
      ro.disconnect()
    }
  }, [refs.root, refs.main, refs.work, a.desktop, a.active, a.kind, a.stepKey])

  return { canvasH: a.desktop ? ch : undefined }
}
