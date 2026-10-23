import { useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { num } from '../lesson/expr'
import { motionPayload } from '../lesson/motion'
import { opticsPayload } from '../lesson/optics'
import type { Props } from '../lesson/parse'
import { namesIn, reducedMotion, useScopeFor, useStore, valueKey } from '../lesson/store'
import { PlayGate } from './step/playGate'
import { loadSandboxFonts } from '../sim/fonts'
import runtime from 'virtual:sandbox-runtime'
import { colorOf, palette, useTheme } from '../theme'
import { formatNumber, Sym, Value } from './controls'
import { Rich } from './rich'

const CSP =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:"

const escapeScript = (code: string) => code.replace(/<\/(script)/gi, '<\\/$1')

export function buildSrcdoc(code: string): string {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<style>html,body{margin:0;height:100%;overflow:hidden;background:transparent}canvas{display:block}</style>
</head><body><canvas id="c"></canvas>
<script>${escapeScript(runtime)}</script>
<script>${escapeScript(code)}</script>
<script>window.__simReady()</script>
</body></html>`
}

interface Mark {
  t: number | string
  label: string
  color?: string
}

interface HudItem {
  symbol?: string
  label?: string
  expr: string
  unit?: string
  digits?: number
  format?: string
}

interface LegendItem {
  kind: string
  label: string
  symbol?: string
}

const SPEEDS = [0.5, 1, 2]
const HOLD_MS = 1200
const AUTOPLAY_DELAY_MS = 600

function LegendSwatch({ kind }: { kind: string }) {
  const theme = useTheme()
  if (kind === 'strobe') {
    const c = colorOf('velocity', theme)
    return (
      <svg width="22" height="8" aria-hidden>
        {[3, 11, 19].map((x, i) => (
          <circle key={x} cx={x} cy={4} r={2.2} fill={c} opacity={0.35 + i * 0.3} />
        ))}
      </svg>
    )
  }
  const dashed = kind.endsWith('-dash')
  const c = colorOf(kind.replace('-dash', ''), theme)
  return (
    <svg width="18" height="8" aria-hidden>
      <line x1="1" y1="4" x2="17" y2="4" stroke={c} strokeWidth="2" strokeDasharray={dashed ? '3 3' : undefined} strokeLinecap="round" />
    </svg>
  )
}

export function Legend({ items }: { items: LegendItem[] }) {
  if (!items.length) return null
  return (
    <div className="legend">
      {items.map((it, i) => (
        <span className="legend-item" key={i}>
          <LegendSwatch kind={it.kind} />
          {it.symbol && <Sym text={it.symbol} color={it.kind.replace('-dash', '')} />}
          <Rich text={it.label} html />
        </span>
      ))}
    </div>
  )
}

/** Header for scenes without a clock (circuits, force diagrams): readings, title, legend. */
export function StageHead({ props, aside }: { props: Props; aside?: ReactNode }) {
  const hud = (Array.isArray(props.hud) ? props.hud : []) as HudItem[]
  const legend = (Array.isArray(props.legend) ? props.legend : []) as LegendItem[]
  const store = useStore()
  const scope = useScopeFor(namesIn(hud.map((h) => h.expr)))
  if (!hud.length && !legend.length && !aside && typeof props.title !== 'string') return null
  return (
    <div className="stage-head">
      <div className="hud">
        {hud.map((h, i) => (
          <div className={i === 0 ? 'hud-item primary' : 'hud-item'} key={i}>
            {h.symbol && <Sym text={h.symbol} />}
            {h.symbol && <span className="hud-eq">=</span>}
            {h.label && <span className="hud-label">{h.label}</span>}
            <Value value={store.reading(h.expr, scope)} unit={h.unit} digits={h.digits} format={h.format} />
          </div>
        ))}
        {typeof props.title === 'string' && (
          <div className={hud.length ? 'hud-status' : 'stage-title'}>
            <Rich text={props.title} html />
          </div>
        )}
      </div>
      {aside ? (
        <div className="stage-aside">
          <Legend items={legend} />
          {aside}
        </div>
      ) : (
        <Legend items={legend} />
      )}
    </div>
  )
}

// Sub-second clips (an AC period of 0.02 s) need more places, or 0.005 s shows as 0.01.
const tDigits = (duration: number) =>
  duration >= 1000 ? 0 : duration >= 100 ? 1 : duration >= 1 || !(duration > 0) ? 2 : Math.min(6, 2 + Math.ceil(-Math.log10(duration)))
const fmtT = (v: number, duration: number) => v.toFixed(tDigits(duration))

export function Sim({ props, body, still = false }: { props: Props; body: string; still?: boolean }) {
  const store = useStore()
  const theme = useTheme()
  // In a step lesson the scene waits for its sentence (gate.open) and plays once from t = 0 each time it opens or the step is re-entered.
  const gate = useContext(PlayGate)
  const frame = useRef<HTMLIFrameElement>(null)
  const figureRef = useRef<HTMLElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [localT, setLocalT] = useState(0)
  // Autoplay loops with a short hold at the end until the student takes the controls.
  const [auto, setAuto] = useState(() => !still && !gate && props.autoplay !== false && !reducedMotion())

  const timeParam = !still && typeof props.time === 'string' ? props.time : null
  const names = (Array.isArray(props.params) ? props.params : []) as string[]
  const marks = (!still && Array.isArray(props.marks) ? props.marks : []) as Mark[]
  const hudItems = (Array.isArray(props.hud) ? props.hud : []) as HudItem[]
  const legend = (Array.isArray(props.legend) ? props.legend : []) as LegendItem[]
  const timeUnit = typeof props.timeUnit === 'string' ? props.timeUnit : 's'

  const scope = useScopeFor([
    ...names,
    ...(timeParam ? [timeParam] : []),
    ...namesIn([props.duration, props.playSeconds, props.step, marks.map((m) => m.t), hudItems.map((h) => h.expr)]),
  ])

  const duration = Math.max(num(props.duration, scope, 5), 0.001)
  const height = typeof props.height === 'number' ? props.height : 280
  // Physical time per wall-clock second at 1×. Long processes (orbits, slow
  // heating) are compressed to roughly 15 s of playback unless the lesson says otherwise.
  const playSeconds = num(props.playSeconds, scope, NaN)
  const rate = Number.isFinite(playSeconds) && playSeconds > 0 ? duration / playSeconds : duration > 30 ? duration / 15 : 1
  const step = num(props.step, scope, NaN)
  const t = timeParam ? (scope[timeParam] ?? 0) : localT

  // Motion and optics payloads carry whole sampled trajectories; rebuild the key only when a value changes, not every frame.
  const paramValues = names.map((n) => scope[n])
  const paramsKey = useMemo(
    () => JSON.stringify(Object.fromEntries(names.map((n, i) => [n, opticsPayload(motionPayload(paramValues[i]))]))),
    [names.join('\n'), ...paramValues], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const srcdoc = useMemo(() => buildSrcdoc(body), [body])
  const colors = useMemo(() => palette(theme), [theme])

  useEffect(() => {
    if (timeParam) store.clocks.add(timeParam)
  }, [store, timeParam])

  const tRef = useRef(t)
  tRef.current = t
  const ownT = useRef(t)
  const setT = (v: number) => {
    const clamped = Math.min(Math.max(v, 0), duration)
    ownT.current = clamped
    if (timeParam) store.set({ [timeParam]: clamped })
    else setLocalT(clamped)
  }

  // A preset or question moved the shared clock: stop and let the student look.
  useEffect(() => {
    if (!timeParam || Math.abs(t - ownT.current) < 1e-9) return
    ownT.current = t
    setAuto(false)
    setPlaying(false)
  }, [t, timeParam])
  const setTRef = useRef(setT)
  setTRef.current = setT

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return
      const msg = e.data
      if (!msg || msg.source !== 'genui-sim') return
      if (msg.type === 'ready' || msg.type === 'ok') {
        if (msg.type === 'ready') setReady(true)
        setError(null)
      } else if (msg.type === 'error') {
        setError(String(msg.message))
        setPlaying(false)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    setReady(false)
  }, [srcdoc])

  useEffect(() => {
    if (!ready) return
    let alive = true
    loadSandboxFonts().then((fonts) => {
      if (alive && fonts.length) frame.current?.contentWindow?.postMessage({ source: 'genui-host', fonts }, '*')
    })
    return () => {
      alive = false
    }
  }, [ready])

  const metaFor = () => ({ duration, rate, timeUnit, playing, marks: marks.map((m) => ({ t: num(m.t, scope, NaN), label: m.label, color: m.color })) })
  // Parameters go across only when they change: cloning them every frame cost more than drawing.
  useEffect(() => {
    if (!ready) return
    frame.current?.contentWindow?.postMessage({ source: 'genui-host', colors, theme, params: JSON.parse(paramsKey), t, meta: metaFor() }, '*')
  }, [ready, paramsKey, colors, theme]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!ready) return
    frame.current?.contentWindow?.postMessage({ source: 'genui-host', t, meta: metaFor() }, '*')
  }, [ready, t, playing]) // eslint-disable-line react-hooks/exhaustive-deps

  // Changing a parameter replays from t = 0 so the new situation unfolds from the start.
  const lastParams = useRef(paramsKey)
  useEffect(() => {
    if (lastParams.current === paramsKey) return
    lastParams.current = paramsKey
    if (still) return
    setTRef.current(0)
    if (gate && !gate.open) setPlaying(false)
    else if (!reducedMotion()) setPlaying(true)
  }, [paramsKey, still]) // eslint-disable-line react-hooks/exhaustive-deps

  // Step lesson: hold at t = 0 until the gate opens, then play once (no looping); again when the step is re-entered.
  const gateOpen = gate ? gate.open : null
  const gateEpoch = gate?.epoch
  useEffect(() => {
    if (gateOpen === null || still) return
    setTRef.current(0)
    setPlaying(gateOpen && ready && !reducedMotion())
  }, [gateOpen, gateEpoch, ready, still])

  useEffect(() => {
    if (!auto || !ready || still) return
    const el = figureRef.current
    if (!el) return
    let timer = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(timer)
        if (entry.isIntersecting) timer = window.setTimeout(() => setPlaying(true), AUTOPLAY_DELAY_MS)
        else setPlaying(false)
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => {
      clearTimeout(timer)
      io.disconnect()
    }
  }, [auto, ready, still])

  // A clip the student started keeps its playing state off screen but stops advancing until it is back in view.
  const [onScreen, setOnScreen] = useState(true)
  useEffect(() => {
    const el = figureRef.current
    if (!el || still || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [still])

  useEffect(() => {
    if (!playing || !onScreen) return
    let raf = 0
    let hold = 0
    let last = performance.now()
    const loop = (now: number) => {
      // Clamp dt so a backgrounded tab doesn't jump to the end on return.
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      let next = tRef.current + dt * speed * rate
      if (next >= duration) {
        if (props.loop) next = 0
        else if (auto) {
          setTRef.current(duration)
          hold = window.setTimeout(() => {
            setTRef.current(0)
            last = performance.now()
            raf = requestAnimationFrame(loop)
          }, HOLD_MS)
          return
        } else {
          setTRef.current(duration)
          setPlaying(false)
          return
        }
      }
      setTRef.current(next)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(hold)
    }
  }, [playing, onScreen, speed, duration, rate, props.loop, auto])

  const takeOver = () => setAuto(false)
  const togglePlay = () => {
    takeOver()
    if (!playing && t >= duration - 1e-6) setT(0)
    setPlaying(!playing)
  }

  // A reading that swings through zero (a wave's displacement at a mark) lands on 1e-16 rather
  // than 0. Measured against its size over the whole clip, such leftovers read as 0.
  const hudExprs = hudItems.map((h) => h.expr).join('\n')
  const hudRoots = useMemo(
    () => [...store.paramRoots(namesIn(hudItems.map((h) => h.expr)))].filter((n) => n !== timeParam),
    [store, hudExprs, timeParam], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const hudRootKey = hudRoots.map((n) => valueKey(scope[n])).join('|')
  const hudScale = useMemo(() => {
    const out = hudItems.map(() => 0)
    if (!timeParam || !hudItems.length) return out
    const start = performance.now()
    const n = 48
    for (let i = 0; i <= n && performance.now() - start < 30; i++) {
      const at = store.scopeWith({ [timeParam]: (duration * i) / n })
      hudItems.forEach((h, k) => {
        const v = num(h.expr, at, NaN)
        if (Number.isFinite(v)) out[k] = Math.max(out[k], Math.abs(v))
      })
    }
    return out
  }, [store, hudRootKey, hudExprs, timeParam, duration]) // eslint-disable-line react-hooks/exhaustive-deps
  const settle = (v: number, i: number) => (hudScale[i] > 0 && Math.abs(v) < hudScale[i] * 1e-9 ? 0 : v)

  const resolvedMarks = marks.map((m) => ({ ...m, mt: num(m.t, scope, NaN) })).filter((m) => Number.isFinite(m.mt))
  const eps = duration / 400
  const current = [...resolvedMarks].reverse().find((m) => t >= m.mt - eps)
  const atMark = resolvedMarks.find((m) => Math.abs(t - m.mt) < eps)
  const hud: HudItem[] = hudItems.length ? hudItems : still ? [] : [{ symbol: 't', expr: '', unit: timeUnit }]

  return (
    <figure ref={figureRef} className={still ? 'sim still' : 'sim'}>
      <div className="stage">
        {(hud.length > 0 || legend.length > 0 || typeof props.title === 'string') && (
          <div className="stage-head">
            <div className="hud">
              {hud.map((h, i) => (
                <div className={i === 0 ? 'hud-item primary' : 'hud-item'} key={i}>
                  {h.symbol && <Sym text={h.symbol} />}
                  {h.symbol && <span className="hud-eq">=</span>}
                  {h.label && <span className="hud-label">{h.label}</span>}
                  {h.expr ? (
                    <Value value={settle(store.reading(h.expr, scope), i)} unit={h.unit} digits={h.digits} format={h.format} />
                  ) : (
                    <Value value={Number(fmtT(t, duration))} unit={h.unit} digits={tDigits(duration)} />
                  )}
                </div>
              ))}
              {!still && (
                <div className="hud-status">
                  <i className={playing ? 'live' : ''} />
                  {playing ? '播放中' : '已暂停'}
                  {current && (
                    <>
                      <span className="dot-sep">·</span>
                      <Rich text={current.label} html />
                      {/* Between marks the caption names the last moment passed, so say how long ago. */}
                      {!atMark && t - current.mt > eps && (
                        <span className="hud-since num">
                          +{fmtT(t - current.mt, duration)} {timeUnit}
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
              {still && typeof props.title === 'string' && <div className="stage-title">{props.title}</div>}
            </div>
            <Legend items={legend} />
          </div>
        )}
        <div className="stage-canvas" style={{ height }}>
          <iframe
            ref={frame}
            title={String(props.title ?? (still ? '示意图' : '动画'))}
            sandbox="allow-scripts"
            referrerPolicy="no-referrer"
            srcDoc={srcdoc}
            style={{ height }}
          />
          {error && (
            <div className="sim-error" role="alert">
              {still ? '示意图' : '动画'}出错：{error}
            </div>
          )}
        </div>
        {typeof props.note === 'string' && (
          <div className="stage-note">
            <Rich text={props.note} html />
          </div>
        )}
      </div>
      {!still && (
        <Transport
          t={t}
          duration={duration}
          playing={playing}
          ready={ready}
          marks={resolvedMarks}
          atMark={atMark?.mt}
          speed={speed}
          rate={rate}
          timeUnit={timeUnit}
          onToggle={togglePlay}
          onReset={() => {
            takeOver()
            setPlaying(false)
            setT(0)
          }}
          onSeek={(v) => {
            takeOver()
            setPlaying(false)
            setT(v)
          }}
          step={
            Number.isFinite(step) && step > 0
              ? {
                  label: typeof props.stepLabel === 'string' ? props.stepLabel : '下一步',
                  onStep: () => {
                    takeOver()
                    setPlaying(false)
                    // Snap to the next whole step so repeated clicks land on 1, 2, 3 … steps.
                    setT(Math.min(duration, (Math.floor(t / step + 1e-6) + 1) * step))
                  },
                }
              : undefined
          }
          onSpeed={(s) => {
            takeOver()
            setSpeed(s)
          }}
        />
      )}
    </figure>
  )
}

const playIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
    <path d="M3.5 2.2v9.6L11.6 7z" fill="currentColor" />
  </svg>
)
const pauseIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
    <rect x="3" y="2.5" width="2.8" height="9" rx="0.8" fill="currentColor" />
    <rect x="8.2" y="2.5" width="2.8" height="9" rx="0.8" fill="currentColor" />
  </svg>
)
const resetIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
    <path d="M3.2 5.2A4.3 4.3 0 1 1 2.8 8.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M2.4 2.6v3h3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

interface TransportProps {
  t: number
  duration: number
  playing: boolean
  ready: boolean
  marks: (Mark & { mt: number })[]
  atMark?: number
  speed: number
  rate: number
  timeUnit: string
  onToggle: () => void
  onReset: () => void
  onSeek: (t: number) => void
  onSpeed: (s: number) => void
  step?: { label: string; onStep: () => void }
}

function Transport(p: TransportProps) {
  const theme = useTheme()
  const pct = (v: number) => (v / p.duration) * 100
  const scaled = p.rate !== 1 || p.timeUnit !== 's'
  // Three significant figures without padding zeros, so slow clips read 0.0025 / 0.005 / 0.01 rather than two "0.01" buttons.
  const compact = (v: number) => {
    const c = Number(v.toPrecision(3))
    return c >= 1e-3 && c < 1e5 ? String(c) : formatNumber(c)
  }
  const speedLabel = (s: number) => (scaled ? `${compact(p.rate * s)} ${p.timeUnit}/s` : `${s}×`)

  const captionsRef = useRef<HTMLDivElement>(null)
  const [railW, setRailW] = useState(560)
  useEffect(() => {
    const el = captionsRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => el.clientWidth > 0 && setRailW(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Hide a caption that would collide with one already shown; its tick stays. The
  // active mark claims its space first so it never lands on top of a neighbour.
  const activeIdx = p.atMark === undefined ? -1 : p.marks.findIndex((m) => Math.abs(m.mt - (p.atMark as number)) < 1e-9)
  // Captions near either end of the rail hang inward instead of spilling onto the buttons.
  const aligns = p.marks.map(() => 'center' as 'center' | 'start' | 'end')
  const spans = p.marks.map((m, i) => {
    // Estimated caption width in px (11px label, 5px gap, 10.5px mono time, 6px breathing room) as a share of the rail.
    const px = [...m.label].reduce((w, ch) => w + (ch.charCodeAt(0) > 0x2e80 ? 11 : 6.2), 0) + 5 + fmtT(m.mt, p.duration).length * 6.4 + 6
    const half = (px / railW) * 50
    const x = pct(m.mt)
    if (x - half < 0) {
      aligns[i] = 'start'
      return [x - 1, x + 2 * half]
    }
    if (x + half > 100) {
      aligns[i] = 'end'
      return [x - 2 * half, x + 1]
    }
    return [x - half, x + half]
  })
  const shift = { center: 'translateX(-50%)', start: 'translateX(-6px)', end: 'translateX(calc(-100% + 6px))' }
  // A caption that collides on the rail's row moves up to a second row; only when both rows are
  // taken is it hidden (its tick stays). Rows don't depend on playback, so captions never jump.
  // The t = 0 caption yields to later marks: the start is where every replay begins anyway.
  const order = p.marks.map((_, i) => i).sort((a, b) => Number(p.marks[a].mt <= 0) - Number(p.marks[b].mt <= 0))
  const apart = (i: number, j: number) => spans[i][0] > spans[j][1] || spans[i][1] < spans[j][0]
  const rows = p.marks.map(() => -1)
  for (const i of order) rows[i] = [0, 1].find((r) => rows.every((rj, j) => rj !== r || apart(i, j))) ?? -1
  // The mark the clock sits on is always readable: it takes the upper row from whatever it hits there.
  if (activeIdx >= 0 && rows[activeIdx] < 0) {
    rows.forEach((r, j) => r === 1 && !apart(activeIdx, j) && (rows[j] = -1))
    rows[activeIdx] = 1
  }
  const captions = rows.map((r) => r >= 0)
  const twoRows = rows.includes(1)

  return (
    <div className="transport">
      <button className="tp-play" onClick={p.onToggle} disabled={!p.ready} aria-label={p.playing ? '暂停' : '播放'}>
        {p.playing ? pauseIcon : playIcon}
      </button>
      <button className="tp-reset" onClick={p.onReset} aria-label="回到开始">
        {resetIcon}
      </button>
      {p.step && (
        <button className="tp-step" onClick={p.step.onStep} disabled={p.t >= p.duration - 1e-9}>
          {p.step.label}
        </button>
      )}
      <div className="tp-track">
        <div className={twoRows ? 'tp-captions two-rows' : 'tp-captions'} ref={captionsRef}>
          {p.marks.map((m, i) => {
            const active = p.atMark !== undefined && Math.abs(m.mt - p.atMark) < 1e-9
            return captions[i] ? (
              <button
                key={i}
                className={`tp-caption ${active ? 'active' : ''} ${rows[i] === 1 ? 'upper' : ''}`}
                style={{ left: `${pct(m.mt)}%`, transform: shift[aligns[i]], '--mark': colorOf(m.color ?? 'force', theme) } as CSSProperties}
                onClick={() => p.onSeek(m.mt)}
              >
                <Rich text={m.label} html />
                <span className="num">{fmtT(m.mt, p.duration)}</span>
              </button>
            ) : null
          })}
        </div>
        <div className="tp-rail">
          <div className="tp-fill" style={{ width: `${pct(p.t)}%` }} />
          {p.marks.map((m, i) => (
            <i key={i} className="tp-tick" style={{ left: `${pct(m.mt)}%` }} />
          ))}
          <div
            className={`tp-thumb ${p.atMark !== undefined ? 'at-mark' : ''}`}
            style={{ left: `${pct(p.t)}%`, '--mark': colorOf(p.marks.find((m) => m.mt === p.atMark)?.color ?? 'force', theme) } as CSSProperties}
          />
          <input
            type="range"
            aria-label="时间进度"
            min={0}
            max={p.duration}
            step={p.duration / 1000}
            value={p.t}
            aria-valuetext={`${fmtT(p.t, p.duration)} ${p.timeUnit}`}
            onChange={(e) => p.onSeek(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="segmented small" role="radiogroup" aria-label="播放速度">
        {SPEEDS.map((s) => (
          <button key={s} className={s === p.speed ? 'active' : ''} aria-checked={s === p.speed} role="radio" onClick={() => p.onSpeed(s)}>
            {speedLabel(s)}
          </button>
        ))}
      </div>
    </div>
  )
}
