// Drives the gaokao demo lesson with real mouse/keyboard input (slider drags, arrow
// keys, radio clicks, scrubbing, show/hide buttons) and checks the readouts.
// Needs the dev server on :5317. Figures are found by their titles in lessons/_demo-gaokao.md.
// Usage: node scripts/interact-gaokao.mjs [night] → shots/interact/*.png + printed checks
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const night = process.argv[2] === 'night'
const out = 'shots/interact'
mkdirSync(out, { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
await p.goto('http://localhost:5317/#_demo-gaokao')
await p.waitForTimeout(1800)
if (night) {
  await p.getByRole('button', { name: /夜光/ }).first().click()
  await p.waitForTimeout(500)
}
const tag = night ? 'n' : 'l'
// Canvas blocks carry their title on the iframe, SVG blocks on aria-label or as text.
const F = (title) =>
  p.locator(`figure:has(iframe[title^="${title}"]), figure:has([aria-label^="${title}"]), figure:has-text("${title}")`).first()
const fig = {
  field: F('磁场区域'),
  gate: F('遮光条通过光电门'),
  drop: F('小球两次通过光电门'),
  cyc: F('回旋加速器（俯视）'),
  knot: F('结点 O 受力'),
  slope: F('斜面上加速下滑的物块'),
  dyn: F('M 点受力与矢量三角形'),
  dynScene: F('绳的位置'),
  dynPlot: F('两段绳的张力随 θ 变化'),
  levels: F('氢原子能级图'),
  wiring: F('电流表外接、滑动变阻器限流'),
  wiring2: F('其他实物元件'),
  wiring3: F('分压接法 + 电流表外接'),
}
const shot = async (f, name) => {
  await f.scrollIntoViewIfNeeded()
  await p.waitForTimeout(350)
  await f.screenshot({ path: `${out}/${tag}-${name}.png` })
}
const checks = []
const check = (name, ok, detail = '') => checks.push(`${ok ? '✓' : '✗'} ${name}${detail ? '  ' + detail : ''}`)

// Real slider input: click on the track near the target, then nudge with arrow keys.
async function slide(name, target) {
  const el = p.locator(`#param-${name}`)
  await el.scrollIntoViewIfNeeded()
  const box = await el.boundingBox()
  const [min, max] = await el.evaluate((e) => [Number(e.min), Number(e.max)])
  const f = (target - min) / (max - min)
  await p.mouse.click(box.x + 8 + f * (box.width - 16), box.y + box.height / 2)
  for (let k = 0; k < 60; k++) {
    const v = Number(await el.inputValue())
    if (Math.abs(v - target) < 1e-9) break
    await el.press(v < target ? 'ArrowRight' : 'ArrowLeft')
  }
  await p.waitForTimeout(250)
  return Number(await el.inputValue())
}
const radio = async (group, label) => {
  const r = p.getByRole('radiogroup', { name: group, exact: true }).getByRole('radio', { name: label, exact: true })
  await r.scrollIntoViewIfNeeded()
  await r.click()
  await p.waitForTimeout(250)
}
// Drag the time scrubber of a figure to fraction f with the mouse.
async function scrub(g, f) {
  const r = g.locator('input[aria-label="时间进度"]')
  await r.scrollIntoViewIfNeeded()
  const box = await r.boundingBox()
  await p.mouse.move(box.x + 4, box.y + box.height / 2)
  await p.mouse.down()
  await p.mouse.move(box.x + 6 + f * (box.width - 12), box.y + box.height / 2, { steps: 8 })
  await p.mouse.up()
  await p.waitForTimeout(400)
}
const pause = async (g) => {
  const btn = g.getByRole('button', { name: '暂停' })
  if (await btn.count()) await btn.click()
}

// --- 二、异形磁场：four shapes
for (const s of ['圆形', '圆环', '三角形', '扇形']) {
  await radio('区域形状', s)
  await shot(fig.field, `field-${s}`)
}

// --- 光电门：before / in beam / after, then double the speed
await pause(fig.gate)
for (const [f, nm] of [[0.2, 'before'], [0.62, 'inbeam'], [0.95, 'after']]) {
  await scrub(fig.gate, f)
  await shot(fig.gate, `gate-v05-${nm}`)
}
check('滑块速度改成 1.0', (await slide('vs', 1.0)) === 1.0)
await pause(fig.gate)
await scrub(fig.gate, 0.95)
await shot(fig.gate, 'gate-v10-after')

// --- 小球竖直下落、反弹，两次穿过水平光束：滑块 + 点关键时刻
check('光电门高度改成 0.3', (await slide('hg', 0.3)) === 0.3)
check('反弹系数改成 0.9', (await slide('eb', 0.9)) === 0.9)
await pause(fig.drop)
{
  const g = 9.8
  const tI = Math.sqrt((2 * 0.97) / g)
  const tP1 = Math.sqrt((2 * 0.7) / g)
  const vr = 0.9 * g * tI
  const tP2 = tI + (vr - Math.sqrt(vr * vr - 2 * g * 0.27)) / g
  for (const [mark, want] of [['第一次遮光', tP1], ['第二次遮光', tP2]]) {
    await fig.drop.locator('button.tp-caption', { hasText: mark }).click()
    await p.waitForTimeout(300)
    const t = Number(await fig.drop.locator('input[aria-label="时间进度"]').inputValue())
    check(`点「${mark}」跳到 t=${want.toFixed(3)} s`, Math.abs(t - want) < 1e-3, `实际 ${t.toFixed(3)}`)
    await shot(fig.drop, `drop-${mark}`)
  }
  await scrub(fig.drop, tI / (tI * 1.9))
  await shot(fig.drop, 'drop-collision')
  await scrub(fig.drop, 0.999)
  await shot(fig.drop, 'drop-end')
}

// --- 回旋加速器：单步前进半周，qU = 1 MeV（15 次过缝）vs 3 MeV（5 次），出口速度不变
{
  const hudText = async (key) => (await fig.cyc.locator('.hud-item', { hasText: key }).innerText()).replace(/\s+/g, ' ')
  // The range input snaps its value to duration/1000; the drawn thumb shows the real time
  // (CSS keeps ~6 significant digits of its left %).
  const tNow = async () => {
    const left = await fig.cyc.locator('.tp-thumb').evaluate((e) => parseFloat(e.style.left))
    const dur = Number(await fig.cyc.locator('input[aria-label="时间进度"]').getAttribute('max'))
    return Math.round((left / 100) * dur * 1e9) / 1e9
  }
  const stepBtn = fig.cyc.getByRole('button', { name: '前进半周' })
  await pause(fig.cyc)
  await fig.cyc.getByRole('button', { name: '回到开始' }).click()
  check('回旋：重置后过缝 0 次', /过缝次数 0\b/.test(await hudText('过缝次数')), await hudText('过缝次数'))
  for (let k = 0; k < 3; k++) await stepBtn.click()
  await p.waitForTimeout(300)
  check('回旋：点 3 次「前进半周」到 t = 3', Math.abs((await tNow()) - 3) < 1e-9, `实际 ${await tNow()}`)
  check('回旋：过缝 3 次', /过缝次数 3\b/.test(await hudText('过缝次数')), await hudText('过缝次数'))
  check('回旋：Ek = 3.0 MeV', /3\.0\s*MeV/.test(await hudText('MeV')), await hudText('MeV'))
  await shot(fig.cyc, 'cyc-1MeV-step3')
  await scrub(fig.cyc, 0.9)
  const tMid = await tNow()
  await stepBtn.click()
  await p.waitForTimeout(200)
  check('回旋：从中间拖到的时刻点「前进半周」对齐到下一个整半周', Math.abs((await tNow()) - (Math.floor(tMid) + 1)) < 1e-4, `${tMid.toFixed(3)} → ${await tNow()}`)
  while (!(await stepBtn.isDisabled())) await stepBtn.click()
  await p.waitForTimeout(300)
  check('回旋：最后一步停在 t = 15，按钮变灰', Math.abs((await tNow()) - 15) < 1e-9, `t=${await tNow()}`)
  check('回旋：qU=1 MeV 出口 v = 5.36', /5\.36/.test(await hudText('m/s')), await hudText('m/s'))
  await shot(fig.cyc, 'cyc-1MeV-end')
  await radio('每次过缝获得的动能 qU', '3 MeV')
  await pause(fig.cyc)
  await scrub(fig.cyc, 0.5)
  await shot(fig.cyc, 'cyc-3MeV-mid')
  await scrub(fig.cyc, 1)
  check('回旋：qU=3 MeV 过缝 5 次', /过缝次数 5\b/.test(await hudText('过缝次数')), await hudText('过缝次数'))
  check('回旋：qU=3 MeV 出口 v 仍是 5.36', /5\.36/.test(await hudText('m/s')), await hudText('m/s'))
  await shot(fig.cyc, 'cyc-3MeV-end')
}

// --- 结点矢量三角形：α = 10°, 37°, 70°
for (const a of [10, 37, 70]) {
  check(`α 拖到 ${a}°`, (await slide('alpha', a)) === a)
  const r = (a * Math.PI) / 180
  const note = await fig.knot.locator('.stage-note').textContent()
  const [TA, TB] = [10 / Math.cos(r), 10 * Math.tan(r)].map((x) => x.toFixed(2))
  check(`  α=${a}° 解出 T_A=${TA}、T_B=${TB}`, note.includes(`A = ${TA} N`) && note.includes(`B = ${TB} N`), note.trim())
  await shot(fig.knot, `knot-${a}`)
}
{
  const note = await fig.slope.locator('.stage-note').textContent()
  const N = 10 * Math.cos(Math.PI / 6)
  const a = 5 - 0.2 * N
  check(`斜面：ΣF = ma 解出 N=${N.toFixed(2)}、a=${a.toFixed(2)}`, note.includes(`N = ${N.toFixed(2)} N`) && note.includes(`a = ${a.toFixed(2)} m/s²`), note.trim())
  await shot(fig.slope, 'slope-solved')
}

// --- 动态平衡：拖 θ，三角形的第三个顶点要落在辅助圆上，圆和画幅不动；预设跳到 T₁ 最大
{
  const svg = fig.dyn.locator('svg[role="img"]')
  const frame = async () => {
    const c = svg.locator('circle.fd-aux')
    const [cx, cy, r] = await Promise.all(['cx', 'cy', 'r'].map(async (k) => Number(await c.getAttribute(k))))
    const lines = await svg.locator('.fd-triangle > g:has(polygon) > line').evaluateAll((ls) => ls.map((l) => [Number(l.getAttribute('x1')), Number(l.getAttribute('y1'))]))
    return { cx, cy, r, lines, vb: await svg.getAttribute('viewBox'), text: await svg.textContent() }
  }
  const frames = {}
  for (const th of [0, 15, 30, 60, 90]) {
    check(`θ 拖到 ${th}°`, (await slide('thM', th)) === th)
    frames[th] = await frame()
    await shot(fig.dyn, `dyn-${th}`)
    await shot(fig.dynScene, `dyn-scene-${th}`)
  }
  const f0 = frames[0]
  check('辅助圆和画幅在拖动时不动', Object.values(frames).every((f) => Math.abs(f.cx - f0.cx) < 0.01 && Math.abs(f.cy - f0.cy) < 0.01 && Math.abs(f.r - f0.r) < 0.01 && f.vb === f0.vb), Object.values(frames).map((f) => f.vb).join(' | '))
  for (const th of [15, 30, 60, 90]) {
    const f = frames[th]
    const [x, y] = f.lines[2] ?? [NaN, NaN]
    check(`θ=${th}° 时 T₁、T₂ 的交点在辅助圆上`, Math.abs(Math.hypot(x - f.cx, y - f.cy) - f.r) < 0.5, `偏差 ${(Math.hypot(x - f.cx, y - f.cy) - f.r).toFixed(2)} px`)
  }
  const want = (th) => [Math.sin(((120 - th) * Math.PI) / 180) / Math.sin((120 * Math.PI) / 180), Math.sin((th * Math.PI) / 180) / Math.sin((120 * Math.PI) / 180)]
  for (const th of [30, 90]) {
    const [t1, t2] = want(th).map((x) => x.toFixed(2))
    check(`θ=${th}° 受力图读数 T₁=${t1}、T₂=${t2}`, frames[th].text.includes(`${t1} mg`) && frames[th].text.includes(`${t2} mg`))
  }
  await p.getByRole('button', { name: /最大：MN 水平/ }).click()
  await p.waitForTimeout(700)
  check('点「T₁ 最大：MN 水平」θ 变成 30°', Number(await p.locator('#param-thM').inputValue()) === 30)
  check('状态显示 MN 水平', (await p.getByText(/MN 水平：T.*最大/).count()) > 0)
  await shot(fig.dynPlot, 'dyn-plot-peak')
  check('α 改成 150°', (await slide('alM', 150)) === 150)
  await p.getByRole('button', { name: /最大：MN 水平/ }).click()
  await p.waitForTimeout(700)
  check('α=150° 时 T₁ 最大在 θ=60°', Number(await p.locator('#param-thM').inputValue()) === 60)
  const f = await frame()
  check('α=150° 辅助圆仍然经过交点', Math.abs(Math.hypot(f.lines[2][0] - f.cx, f.lines[2][1] - f.cy) - f.r) < 0.5)
  await shot(fig.dyn, 'dyn-a150-peak')
  await shot(fig.dynScene, 'dyn-scene-a150-peak')
}

// --- 能级图：every transition × the three metals, read the worked readout
const expectDE = { '4→3': 0.66, '4→2': 2.55, '4→1': 12.75, '3→2': 1.89, '3→1': 12.09, '2→1': 10.2 }
const metals = { '钠 2.29 eV': 2.29, '锌 3.34 eV': 3.34, '钨 4.54 eV': 4.54 }
for (const [metal, W] of Object.entries(metals)) {
  await radio('金属逸出功 W₀', metal)
  for (const [tr, dE] of Object.entries(expectDE)) {
    await radio('选中的跃迁', tr)
    const text = await fig.levels.locator('.stage-note').innerText()
    const shown = Number((text.match(/= ([\d.]+) eV，λ/) || [])[1])
    const okPE = dE >= W ? text.includes('能使该金属发生光电效应') : text.includes('不能使该金属发生光电效应')
    const count = Object.values(expectDE).filter((x) => x >= W).length
    check(`${metal} ${tr}`, Math.abs(shown - dE) < 0.006 && okPE && text.includes(`其中 ${count} 种`), `ΔE=${shown} 光电效应判断${okPE ? '对' : '错'}`)
  }
  await radio('选中的跃迁', '4→1')
  await shot(fig.levels, `levels-${W}-4to1`)
}
await radio('选中的跃迁', '3→2')
await shot(fig.levels, 'levels-4.54-3to2')
{
  const text = await fig.levels.locator('.stage-note').innerText()
  const strokes = await fig.levels.locator('.el-photon path').evaluateAll((els) => els.map((e) => e.getAttribute('stroke')))
  check(
    '能级图：可见光只有 4→2、3→2 两条，波浪线颜色不同',
    strokes.length === 2 && strokes[0] !== strokes[1] && text.includes('2 种是可见光（4→2、3→2）') && text.includes('可见光 · 红光'),
    strokes.join(' / '),
  )
}

// --- 实物连线：needle angles must match I and U
const needleFrac = async (g, idx, galv = false) =>
  g.locator('line.wr-needle').nth(idx).evaluate((l, g) => {
    const x1 = +l.getAttribute('x1'), y1 = +l.getAttribute('y1'), x2 = +l.getAttribute('x2'), y2 = +l.getAttribute('y2')
    const a = (Math.atan2(y1 - y2, x2 - x1) * 180) / Math.PI
    return g ? (90 - a) / 50 : (140 - a) / 100
  }, galv)
const meterCount = async (g) => g.locator('line.wr-needle').count()
await radio('开关', '闭合')
for (const s of [0, 0.5, 1]) {
  check(`滑片拖到 ${s}`, (await slide('slide', s)) === s)
  // Solved circuit: E = 3 V, r = 0.5 Ω, ammeter 0.1 Ω, Rx = 5 Ω, AP = 20s Ω; voltmeter not yet wired.
  const I = 3 / (0.5 + 0.1 + 5 + 20 * s)
  const fA = await needleFrac(fig.wiring, 0)
  const fV = await needleFrac(fig.wiring, 1)
  check(`  电流表读数 I=${I.toFixed(3)} A`, Math.abs(fA - Math.min(1.06, I / 0.6)) < 0.01, `指针=${(fA * 0.6).toFixed(3)} A`)
  check('  电压表未接线时读 0', Math.abs(fV) < 0.01, `指针比例=${fV.toFixed(3)}`)
  await shot(fig.wiring, `wiring-slide-${s}`)
}
await fig.wiring.getByRole('button', { name: '显示答案连线' }).click()
await p.waitForTimeout(300)
{
  const s = 1
  const Rp = (5 * 3000) / 3005
  const U = (3 / (0.6 + 20 * s + Rp)) * Rp
  const fV = await needleFrac(fig.wiring, 1)
  check(`显示答案线后电压表 U=${U.toFixed(2)} V`, Math.abs(fV - U / 3) < 0.01, `指针=${(fV * 3).toFixed(2)} V`)
  check('答案线是 2 根虚线', (await fig.wiring.locator('path.wr-wire.answer').count()) === 2)
}
await shot(fig.wiring, 'wiring-answers')
await radio('开关', '断开')
check('断开后两表都回零', Math.abs(await needleFrac(fig.wiring, 0)) < 0.01 && Math.abs(await needleFrac(fig.wiring, 1)) < 0.01)
await shot(fig.wiring, 'wiring-open')
await shot(fig.wiring2, 'wiring2-open')
await radio('开关', '闭合')
check('闭合后灵敏电流计偏 0.6', Math.abs((await needleFrac(fig.wiring2, 0, true)) - 0.6) < 0.01)
await shot(fig.wiring2, 'wiring2-closed')
await fig.wiring.getByRole('button', { name: '隐藏答案连线' }).click()
await p.waitForTimeout(300)
check('隐藏后答案线消失', (await fig.wiring.locator('path.wr-wire.answer').count()) === 0)
check('meter count', (await meterCount(fig.wiring)) === 2)

// --- 分压接法逐根接线：按钮一根根接，读数跟着电路真实变化
{
  const g = fig.wiring3
  const btn = (name) => g.getByRole('button', { name, exact: true })
  const count = async () => (await g.locator('.wiring-count').innerText()).replace(/\s+/g, '')
  const readout = async () => {
    const t = await p.locator('.readout:has-text("测量值")').innerText()
    return [...t.matchAll(/(-?[\d.]+|—)\s*(A|V|Ω)/g)].map((m) => (m[1] === '—' ? NaN : Number(m[1])))
  }
  // Loaded divider: E = 3 V, r = 0.5 Ω, R0 = 20 Ω, Rx = 5 Ω, RA = 0.1 Ω, RV = 3 kΩ.
  const model = (sd, wk) => {
    const RxV = wk >= 8 ? (5 * 3000) / 3005 : 5
    const RL = 0.1 + RxV
    const Rlo = 20 * sd
    const Rp = wk >= 6 ? (Rlo * RL) / (Rlo + RL) : Rlo
    const I = wk >= 3 ? 3 / (0.5 + 20 * (1 - sd) + Rp) : 0
    const IA = wk >= 6 ? (I * Rp) / RL : 0
    return { IA, UV: wk >= 8 ? IA * RxV : 0 }
  }
  check('分压：初始已接 8/8 根', (await count()) === '已接8/8根')
  check('分压：全部接好时「下一根」不可按', await btn('下一根').isDisabled())
  await btn('从头接').click()
  await p.waitForTimeout(200)
  check('分压：从头接后 0 根导线', (await g.locator('path.wr-wire').count()) === 0 && (await count()) === '已接0/8根')
  check('分压：0 根时「上一根」不可按', await btn('上一根').isDisabled())
  await shot(g, 'divider-0')
  const sd = await slide('sd', 0.6)
  const seen = []
  for (let k = 1; k <= 8; k++) {
    await btn('下一根').click()
    await p.waitForTimeout(150)
    const [I, U] = await readout()
    const m = model(sd, k)
    const fA = await needleFrac(g, 1)
    const fV = await needleFrac(g, 0)
    seen.push(I)
    const ok =
      (await g.locator('path.wr-wire').count()) === k &&
      (await g.locator('path.wr-wire.current').getAttribute('data-step')) === String(k) &&
      (await g.locator('.wr-badge').count()) === k &&
      (await g.locator('.wiring-caption').innerText()).startsWith(`第 ${k} 根`) &&
      Math.abs(I - m.IA) < 6e-5 &&
      Math.abs(U - m.UV) < 6e-4 &&
      Math.abs(fA - m.IA / 0.6) < 0.01 &&
      Math.abs(fV - m.UV / (k >= 7 ? 3 : 15)) < 0.01
    check(`分压：第 ${k} 根`, ok, `I=${I} U=${U}（模型 ${m.IA.toFixed(4)} / ${m.UV.toFixed(3)}）`)
    if ([3, 6, 8].includes(k)) await shot(g, `divider-${k}`)
  }
  check('分压：第 6 根前电流表一直为 0', seen.slice(0, 5).every((v) => v === 0) && seen[5] > 0)
  check('分压：接上电压表后电流表读数略增（外接误差）', seen[7] > seen[6] && seen[7] - seen[6] < 0.001, `${seen[6]} → ${seen[7]}`)
  const [, , R] = await readout()
  check('分压：R_测 = R_x∥R_V ≈ 4.99 Ω', Math.abs(R - (5 * 3000) / 3005) < 0.006, `R=${R}`)
  await btn('上一根').click()
  await p.waitForTimeout(150)
  check('分压：退回一根后电压表回零、R_测 显示 —', Number.isNaN((await readout())[2]) && Math.abs(await needleFrac(g, 0)) < 0.01)
  await btn('全部接好').click()
  await p.waitForTimeout(150)
  await slide('sd', 0)
  check('分压：滑片在 A 端时两表为 0', (await readout()).slice(0, 2).every((v) => v === 0))
  await radio('开关 S', '断开')
  check('分压：断开开关两表回零', Math.abs(await needleFrac(g, 1)) < 0.01)
  await radio('开关 S', '闭合')
  await slide('sd', 0.6)
}

// --- 十、气体分子：温度滑块、预设、悬停直方图、暂停、从同一速率弛豫
{
  const gas = p.locator('figure.gas-box')
  const g1 = gas.nth(0)
  const g2 = gas.nth(1)
  const reading = async (g) => (await g.locator('.gas-reading .num').first().innerText()).replace(/\s+/g, ' ')
  const numsOf = (s) => (s.match(/\d+(\.\d+)?/g) ?? []).map(Number)
  const hudT = async (g) => Number(await g.locator('.hud-item.primary .num').innerText())
  const clock = async (g) => numsOf(await g.locator('.wiring-count').innerText())
  // Theory for O₂ (31.998 u): v_p = √(2kT/m), mean = √(8kT/πm)
  const th = (T) => {
    const kTm = (1.380649e-23 * T) / (31.998 * 1.6605390666e-27)
    return { vp: Math.sqrt(2 * kTm), mean: Math.sqrt((8 * kTm) / Math.PI) }
  }
  const lit = (g) =>
    g.locator('canvas').evaluate((c) => {
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
      let n = 0
      for (let i = 3; i < d.length; i += 4) if (d[i] > 200) n++
      return n
    })
  await g1.scrollIntoViewIfNeeded()
  await p.waitForTimeout(1200)
  check('气体：默认 T = 373 K 且自动播放', (await hudT(g1)) === 373 && (await g1.getByRole('button', { name: '暂停' }).count()) === 1)
  check('气体：画出 25 档柱子（每格 100 m/s）和两条曲线', (await g1.locator('.gas-bar').count()) === 25 && (await g1.locator('.gas-theory path, .gas-compare path').count()) === 2)
  check('气体：温度拖到 600 K', (await slide('Tg', 600)) === 600 && (await hudT(g1)) === 600)
  await p.waitForTimeout(1500)
  {
    const [mean, , vp] = numsOf(await reading(g1))
    const t = th(600)
    check('气体：600 K 理论最概然速率', Math.abs(vp - t.vp) < 1, `${vp} vs ${t.vp.toFixed(1)}`)
    check('气体：600 K 统计平均速率接近理论', Math.abs(mean - t.mean) / t.mean < 0.08, `${mean} vs ${t.mean.toFixed(1)}`)
  }
  await p.getByRole('button', { name: '0 ℃', exact: true }).click()
  // The preset sits in the side panel; clicking may scroll the box away, which pauses it.
  await g1.scrollIntoViewIfNeeded()
  await p.waitForTimeout(1500)
  check('气体：预设 0 ℃ → 273 K', (await hudT(g1)) === 273)
  await g1.getByRole('button', { name: '暂停' }).click()
  const c0 = (await clock(g1))[0]
  await p.waitForTimeout(600)
  check('气体：暂停后时间不走', (await clock(g1))[0] === c0, `t=${c0}`)
  await shot(g1, 'gas-273')
  const before = await lit(g1)
  const bar = g1.locator('.gas-bar').nth(3).locator('rect').first()
  const bb = await bar.boundingBox()
  await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height - 4)
  await p.waitForTimeout(250)
  const hov = await reading(g1)
  const after = await lit(g1)
  check('气体：悬停第 4 档 → 显示 300–400 m/s 的实际与理论占比', /^300–400 m\/s：实际 \d+ 个/.test(hov), hov.slice(0, 40))
  check('气体：悬停时盒子里其他速率的分子变暗', after < before * 0.7, `${before} → ${after}`)
  await shot(g1, 'gas-hover')
  await p.mouse.move(5, 5)
  await p.waitForTimeout(200)
  check('气体：移开鼠标恢复统计读数', (await reading(g1)).startsWith('统计'))

  await g2.scrollIntoViewIfNeeded()
  await p.waitForTimeout(300)
  {
    const [mean, rms] = numsOf(await reading(g2))
    check('气体（同速率出发）：开始时平均速率 = 方均根速率', mean === rms && (await g2.getByRole('button', { name: '播放' }).count()) === 1, `${mean} / ${rms}`)
  }
  await shot(g2, 'gas-same-0')
  await g2.getByRole('button', { name: '播放' }).click()
  await p.waitForTimeout(8000)
  {
    const [mean, rms, , thMean] = numsOf(await reading(g2))
    const [, coll] = await clock(g2)
    check('气体（同速率出发）：碰撞后平均速率落到理论值', Math.abs(mean - thMean) / thMean < 0.04 && rms === 517, `${mean} vs ${thMean}，rms ${rms}`)
    check('气体（同速率出发）：平均每个分子碰撞多次', coll > 5, `${coll} 次`)
  }
  await shot(g2, 'gas-same-8s')
  await g2.getByRole('button', { name: '重新开始' }).click()
  await p.waitForTimeout(300)
  {
    const [mean, rms] = numsOf(await reading(g2))
    check('气体（同速率出发）：重新开始回到单一速率并暂停', mean === rms && (await clock(g2))[0] === 0 && (await g2.getByRole('button', { name: '播放' }).count()) === 1)
  }
}

// --- 十一、运动积分：读数要和线性阻力的解析解一致（课件里没有写解析解）
{
  const sim = F('有阻力（实心）与无阻力（虚影）同时抛出')
  const plot = F('v–t 图：上升段比下降段陡')
  const vals = async () => {
    const t = await p.locator('.readout:has-text("上升时间")').innerText()
    return [...t.matchAll(/(-?[\d.]+)\s*(s|m\/s|m)\b/g)].map((m) => Number(m[1]))
  }
  const exact = (k, v0, g = 10) => {
    if (k === 0) return { up: v0 / g, H: (v0 * v0) / (2 * g) }
    return { up: Math.log(1 + (k * v0) / g) / k, H: v0 / k - (g / (k * k)) * Math.log(1 + (k * v0) / g) }
  }
  await sim.scrollIntoViewIfNeeded()
  await p.waitForTimeout(600)
  {
    const [up, down, H, vb] = await vals()
    const e = exact(0.4, 20)
    check('运动：k=0.4 上升时间 = ln(1+kv₀/g)/k', Math.abs(up - e.up) < 0.006, `${up} vs ${e.up.toFixed(3)}`)
    check('运动：k=0.4 最大高度与解析解一致', Math.abs(H - e.H) < 0.006, `${H} vs ${e.H.toFixed(3)}`)
    check('运动：有阻力时下降比上升慢、落回速度小于 v₀', down > up && vb < 20, `t下=${down} v=${vb}`)
  }
  check('运动：拖抛出速度到 25', (await slide('vu', 25)) === 25)
  await p.waitForTimeout(300)
  {
    const [up, , H] = await vals()
    const e = exact(0.4, 25)
    check('运动：v₀=25 读数跟着重新积分', Math.abs(up - e.up) < 0.006 && Math.abs(H - e.H) < 0.006, `${up}/${H} vs ${e.up.toFixed(3)}/${e.H.toFixed(3)}`)
  }
  await p.getByRole('button', { name: '无阻力', exact: true }).click()
  await p.waitForTimeout(900)
  {
    const [up, down, H, vb] = await vals()
    check('运动：预设无阻力 → 上升下降各 2.5 s、H = 31.25 m、落回 25 m/s', up === 2.5 && down === 2.5 && Math.abs(H - 31.25) < 0.006 && vb === 25, `${up} ${down} ${H} ${vb}`)
  }
  await p.getByRole('button', { name: '阻力较大', exact: true }).click()
  await p.waitForTimeout(900)
  {
    const vals2 = (await plot.locator('.plot-values').innerText()).match(/-?\d+(\.\d+)?/g) ?? []
    check('运动：v–t 图两条曲线都有游标读数', vals2.length === 2 && (await plot.locator('.cursor-dot').count()) === 2, vals2.join(' / '))
  }
  await shot(sim, 'motion-sim')
  await shot(plot, 'motion-plot')
}

// --- 十二、板块模型：课件只写受力，时刻和摩擦力要和手算公式一致
{
  const sim = F('木板 B 在拉力下运动')
  const fd = F('物块 A 受力（随时刻变化）')
  const plot = F('v–t 图：共同加速，然后分开')
  const times = async () => {
    const t = await p.locator('.readout:has-text("木板开始运动")').innerText()
    return [...t.matchAll(/(-?[\d.]+)\s*(s|N)\b/g)].map((m) => Number(m[1]))
  }
  const want = (k, mu1, mu2) => [(mu2 * 30) / k, ((mu1 + mu2) * 30) / k]
  await sim.scrollIntoViewIfNeeded()
  await pause(sim)
  {
    const [t1, t2] = await times()
    const [w1, w2] = want(4, 0.4, 0.1)
    check('板块：默认 t₁ = μ₂(m+M)g/k = 0.75 s、t₂ = (μ₁+μ₂)(m+M)g/k = 3.75 s', t1 === w1 && t2 === w2, `${t1} / ${t2}`)
  }
  check('板块：μ₁ 拖到 0.2', (await slide('mu1', 0.2)) === 0.2)
  check('板块：μ₂ 拖到 0.2', (await slide('mu2', 0.2)) === 0.2)
  {
    const [t1, t2] = await times()
    const [w1, w2] = want(4, 0.2, 0.2)
    check(`板块：t₁=${w1}、t₂=${w2} 跟着重算`, Math.abs(t1 - w1) < 0.006 && Math.abs(t2 - w2) < 0.006, `${t1} / ${t2}`)
  }
  for (const [frac, label, f] of [[0.1, '都不动', 0], [0.42, '一起加速', null], [0.8, '相对滑动', 2]]) {
    await scrub(sim, frac)
    const tk = Number(await sim.locator('input[aria-label="时间进度"]').inputValue())
    const note = await fd.innerText()
    const expect = f ?? (tk > 1.5 ? (4 * tk - 6) / 3 : 0)
    const shown = Number((note.match(/f\s*=\s*(-?[\d.]+)/) ?? [])[1])
    check(`板块：t=${tk.toFixed(2)} s（${label}）A 受摩擦力 ${expect.toFixed(2)} N`, Math.abs(shown - expect) < 0.006, `显示 ${shown}`)
    await shot(sim, `plank-${label}`)
    await shot(fd, `plank-fd-${label}`)
  }
  await shot(plot, 'plank-plot')
}

// --- 十三、纸带由受力驱动的运动打出：逐差法 a 和反推的 μ 要和手算一致
{
  const tape = F('物块 A 拖动的纸带')
  const read = async () => {
    const text = await tape.innerText()
    const a = Number(([...text.matchAll(/a\s*=\s*[^=\n]*?=\s*(-?[\d.]+)\s*m\/s²/g)].pop() ?? [])[1])
    const mu = Number(((await p.locator('.readout:has-text("由加速度反推")').innerText()).match(/μ\s*=?\s*(-?[\d.]+)/) ?? [])[1])
    return { a, mu, text }
  }
  for (const [mu, mB] of [[0.3, 0.3], [0.2, 0.5]]) {
    check(`纸带：μ 拖到 ${mu}`, (await slide('muT', mu)) === mu)
    check(`纸带：m_B 拖到 ${mB}`, (await slide('mB', mB)) === mB)
    const want = (mB * 10 - mu * 5) / (0.5 + mB)
    const r = await read()
    check(`纸带：逐差法 a = ${want.toFixed(2)} m/s²，反推 μ = ${mu}`, Math.abs(r.a - want) < 0.01 && Math.abs(r.mu - mu) < 0.001, `a=${r.a} μ=${r.mu}`)
    await shot(tape, `tape-mu${mu}-mB${mB}`)
  }
}

// --- 十四、电容器放电：读数要和 RC 放电的解析解一致（课件里没有写 e^(−t/RC)）
{
  const circ = F('电容器放电（S 在 t = 0 由 1 掷向 2）')
  const plot = F('放电电流 I–t 图')
  const vals = async () => {
    const t = await p.locator('.readout:has-text("开始放电时的电流")').innerText()
    return [...t.matchAll(/(-?[\d.]+)\s*(mA|s|mC)\b/g)].map((m) => Number(m[1]))
  }
  const noteOf = async (unit) => Number(((await circ.innerText()).match(new RegExp(`(-?[\\d.]+)\\s*${unit}`)) ?? [])[1])
  for (const [Cu, Rk, tc] of [[470, 2, 1], [1000, 4, 5]]) {
    check(`电容：C 拖到 ${Cu} μF`, (await slide('Cu', Cu)) === Cu)
    check(`电容：R 拖到 ${Rk} kΩ`, (await slide('Rk', Rk)) === Rk)
    check(`电容：时刻拖到 ${tc} s`, (await slide('tc', tc)) === tc)
    const tau = Rk * Cu / 1000
    const [I0, tHalf, dQ, Q] = await vals()
    check(`电容：I₀ = E/R = ${(8 / Rk).toFixed(3)} mA`, Math.abs(I0 - 8 / Rk) < 0.0015, `${I0}`)
    check(`电容：t½ = RC·ln2 = ${(tau * Math.LN2).toFixed(3)} s`, Math.abs(tHalf - tau * Math.LN2) < 0.0015, `${tHalf}`)
    const wantQ = (Cu * 8) / 1000 * (1 - Math.exp(-tc / tau))
    check(`电容：0–${tc} s 放出 ${wantQ.toFixed(3)} mC，充满 ${(Cu * 8 / 1000).toFixed(3)} mC`, Math.abs(dQ - wantQ) < 0.0015 && Math.abs(Q - Cu * 8 / 1000) < 1e-9, `${dQ} / ${Q}`)
    const UC = await noteOf('V(?!\\w)')
    const IA = await noteOf('mA')
    const wantU = 8 * Math.exp(-tc / tau)
    check(`电容：电路图上 U_C = ${wantU.toFixed(2)} V、I = ${(wantU / Rk).toFixed(3)} mA`, Math.abs(UC - wantU) < 0.006 && Math.abs(IA - wantU / Rk) < 0.0015, `${UC} V / ${IA} mA`)
    await shot(circ, `cap-${Cu}-${Rk}`)
    await shot(plot, `cap-plot-${Cu}-${Rk}`)
  }
}

// --- 十五、断电自感：断开瞬间灯泡电流反向、大小等于线圈原来的电流
{
  const circ = F('S 在 t = 0.1 s 闭合，t = 1.2 s 断开')
  const plot = F('灯泡电流与线圈电流')
  const read = async () => {
    const t = await p.locator('.readout:has-text("断开瞬间灯泡电流")').innerText()
    return [...t.matchAll(/(-?[\d.]+)\s*A\b/g)].map((m) => Number(m[1]))
  }
  // Thevenin seen by the coil: E·R/(R + r) behind R∥r; τ = L/(r_L + R∥r) while S is closed.
  const want = (rL) => {
    const Eth = (6 * 10) / 10.5
    const Rth = (10 * 0.5) / 10.5
    const tau = 0.5 / (rL + Rth)
    const IL = (t) => (Eth / (rL + Rth)) * (1 - Math.exp(-(t - 0.1) / tau))
    return { on: (Eth - Rth * IL(1.1)) / 10, flash: -IL(1.2) }
  }
  for (const [rL, flashes] of [[2, true], [20, false]]) {
    check(`自感：r_L 拖到 ${rL} Ω`, (await slide('rL', rL)) === rL)
    const [on, flash] = await read()
    const w = want(rL)
    check(`自感：r_L=${rL} 断开前 I_A = ${w.on.toFixed(2)} A、断开瞬间 ${w.flash.toFixed(2)} A`, Math.abs(on - w.on) < 0.006 && Math.abs(flash - w.flash) < 0.006, `${on} / ${flash}`)
    const status = await p.locator('.status:has-text("灯泡电阻")').first().innerText()
    check(`自感：r_L=${rL} ${flashes ? '闪亮一下' : '逐渐熄灭'}`, status.includes(flashes ? '闪亮' : '逐渐熄灭'), status.trim())
  }
  check('自感：r_L 拖回 2 Ω', (await slide('rL', 2)) === 2)
  for (const [ts, glow] of [[0.05, false], [1.205, true]]) {
    check(`自感：时刻拖到 ${ts} s`, (await slide('ts', ts)) === ts)
    const n = await circ.locator('.circuit-glow').count()
    check(`自感：t=${ts} s 灯泡${glow ? '发光' : '不亮'}`, glow ? n > 0 : n === 0, `glow ${n}`)
    await shot(circ, `self-${ts}`)
  }
  await shot(plot, 'self-plot')
}

// --- 十六、导体棒：收尾速度、电荷和焦耳热都由受力 + 电路积分出来
{
  const sim = F('导体棒在水平导轨上运动')
  const circ = F('导体棒的等效电路')
  const plot = F('速度趋向收尾速度')
  const text = () => p.locator('.readout:has-text("收尾速度")').innerText()
  const numAfter = async (label) => Number(((await text()).match(new RegExp(label + '\\s*(-?[\\d.]+)')) ?? [])[1])
  const L = 0.5
  const mass = 0.2
  const r = 0.1
  await pause(sim)
  for (const [B, Fb, R] of [[1, 0.4, 0.4], [0.8, 0.2, 0.2]]) {
    check(`导体棒：B 拖到 ${B} T`, (await slide('Bb', B)) === B)
    check(`导体棒：F 拖到 ${Fb} N`, (await slide('Fb', Fb)) === Fb)
    check(`导体棒：R 拖到 ${R} Ω`, (await slide('Rbar', R)) === R)
    const Rtot = R + r
    const vm = (Fb * Rtot) / (B * B * L * L)
    const gotVm = await numAfter('收尾速度')
    check(`导体棒：收尾速度 = F(R+r)/(B²L²) = ${vm.toFixed(3)} m/s`, Math.abs(gotVm - vm) < 0.0015, `${gotVm}`)
    await scrub(sim, 0.35)
    const x = await numAfter('此刻位移')
    const vel = await numAfter('此刻速度')
    const I = await numAfter('此刻电流')
    const q = await numAfter('通过的电荷量')
    const Q = await numAfter('焦耳热')
    const wantI = (B * L * vel) / Rtot
    check(`导体棒：电荷量 q = BLx/(R+r)`, Math.abs(q - (B * L * x) / Rtot) < 0.002, `${q}`)
    check(`导体棒：焦耳热 Q = Fx − ½mv²`, Math.abs(Q - (Fb * x - 0.5 * mass * vel * vel)) < 0.002, `${Q}`)
    check(`导体棒：读出的电流 = BLv/(R+r)`, Math.abs(I - wantI) < 0.002, `${I} vs ${wantI}`)
    const shown = [...(await circ.innerText()).matchAll(/(-?[\d.]+)\s*A/g)].map((m) => Number(m[1]))
    check(`导体棒：电路图上的电流也是 ${wantI.toFixed(3)} A`, shown.length > 0 && shown.every((a) => Math.abs(a - wantI) < 0.0025), shown.join(' / '))
  }
  await shot(sim, 'rod-sim')
  await shot(circ, 'rod-circuit')
  await shot(plot, 'rod-plot')
}

// --- 十七、双棒：总动量守恒，共同速度 = m1 v0 / (m1 + m2)
{
  const sim = F('两根棒在导轨上滑向共同速度')
  const text = () => p.locator('.readout:has-text("总动量")').innerText()
  const numAfter = async (label) => Number(((await text()).match(new RegExp(label + '\\s*(-?[\\d.]+)')) ?? [])[1])
  await pause(sim)
  for (const [m2, v0] of [[0.2, 2], [0.4, 1]]) {
    check(`双棒：B 的质量拖到 ${m2} kg`, (await slide('m2b', m2)) === m2)
    check(`双棒：初速拖到 ${v0} m/s`, (await slide('vA0', v0)) === v0)
    const momentum = 0.1 * v0
    const common = momentum / (0.1 + m2)
    const vc = await numAfter('共同速度')
    check(`双棒：共同速度 = ${common.toFixed(3)} m/s`, Math.abs(vc - common) < 0.0015, `${vc}`)
    for (const frac of [0.2, 0.75]) {
      await scrub(sim, frac)
      const P = await numAfter('总动量')
      check(`双棒：进度 ${frac} 时总动量仍是 ${momentum}`, Math.abs(P - momentum) < 0.0015, `${P}`)
    }
  }
  // Late in the run the current has died away; step back so the force arrows and the loop current are visible.
  await scrub(sim, 0.06)
  await shot(sim, 'pair-sim')
  await shot(F('双棒等效电路'), 'pair-circuit')
}

// --- 十八、示波管：偏移、偏转角、屏上落点都来自积分
{
  const sim = F('示波管：偏转电场与荧光屏')
  const plot = F('纵向偏移随时间')
  const text = () => p.locator('.readout:has-text("出电场时的偏移")').innerText()
  const numAfter = async (label) => Number(((await text()).match(new RegExp(label + '[\\s\\S]*?(-?[\\d.]+)')) ?? [])[1])
  const q = 1, m = 1, d = 0.8, L = 1, D = 2
  await pause(sim)
  for (const [U, v0] of [[2, 2], [1, 2.5]]) {
    check(`示波管：电压拖到 ${U} V`, (await slide('Up', U)) === U)
    check(`示波管：初速拖到 ${v0} m/s`, (await slide('vTube', v0)) === v0)
    const y = -(q * U * L * L) / (2 * m * d * v0 * v0)
    const tan = -(q * U * L) / (m * d * v0 * v0)
    const Y = (L / 2 + D) * tan
    const gotY = await numAfter('出电场时的偏移')
    const gotTan = await numAfter('偏转角正切')
    const gotScr = await numAfter('屏上偏移')
    check(`示波管：出电场 y = qUL²/(2mdv²) = ${y}`, Math.abs(gotY - y) < 0.0015, `${gotY}`)
    check(`示波管：tanθ = ${tan}`, Math.abs(gotTan - tan) < 0.0015, `${gotTan}`)
    check(`示波管：屏上 Y = (L/2+D)·tanθ = ${Y}`, Math.abs(gotScr - Y) < 0.0015, `${gotScr}`)
  }
  check('示波管：电压回到 2 V', (await slide('Up', 2)) === 2)
  check('示波管：初速回到 2 m/s', (await slide('vTube', 2)) === 2)
  await scrub(sim, 0.55)
  await shot(sim, 'tube-sim')
  await shot(plot, 'tube-plot')
  check('示波管：电压拖到 4 V', (await slide('Up', 4)) === 4)
  const status = await p.locator('.status').filter({ hasText: '极板' }).first().innerText()
  check('示波管：电压过大打到极板', status.includes('极板'), status.trim())
  await scrub(sim, 0.92)
  await shot(sim, 'tube-hit')
}

// --- 十九、圆形磁场：对准圆心射入，出射沿半径
{
  const sim = F('圆形磁场：对准圆心射入')
  const plot = F('磁场中的轨迹')
  const text = () => p.locator('.readout:has-text("在磁场中的时间")').innerText()
  const numAfter = async (label) => Number(((await text()).match(new RegExp(label + '[\\s\\S]*?(-?[\\d.]+)')) ?? [])[1])
  await pause(sim)
  for (const [v, B] of [[2, 1], [1, 1]]) {
    check(`圆形磁场：速度拖到 ${v} m/s`, (await slide('vIon', v)) === v)
    check(`圆形磁场：B 拖到 ${B} T`, (await slide('Bion', B)) === B)
    const R = 1
    const r = (1 * v) / (1 * B)
    const theta = 2 * Math.atan(R / r)
    const dt = (theta * 1) / (1 * B)
    const gotTh = await numAfter('偏转角')
    const gotT = await numAfter('在磁场中的时间')
    const gotR = await numAfter('轨道半径')
    const x = await numAfter('出射点 x')
    const y = await numAfter('出射点 y')
    const vx = await numAfter('出射速度 vx')
    const vy = await numAfter('出射速度 vy')
    check(`圆形磁场：θ = ${(theta * 180 / Math.PI).toFixed(2)}°（tan(θ/2) = R/r）`, Math.abs(gotTh - (theta * 180) / Math.PI) < 0.05, `${gotTh}`)
    check(`圆形磁场：t = θm/(qB) = ${dt.toFixed(4)} s`, Math.abs(gotT - dt) < 0.0015, `${gotT}`)
    check(`圆形磁场：轨道半径 = ${r}`, Math.abs(gotR - r) < 0.0015, `${gotR}`)
    check('圆形磁场：出射速度沿半径', Math.abs(x * vy - y * vx) < 0.003, `${x * vy - y * vx}`)
    const tIn = (2 - R) / v
    const tEnd = 4
    await scrub(sim, Math.min(0.92, (tIn + dt + 0.08) / tEnd))
    await shot(sim, `ion-v${v}-B${B}`)
  }
  await shot(plot, 'ion-plot')
}

// --- 二十、气缸：挡板卡住的活塞。离开、碰上、等容、等压、做功都来自气柱组件
{
  const tube = F('带挡板的气缸')
  const plot = F('气体的 p–V 图')
  const text = () => p.locator('.readout:has-text("离开下挡板")').innerText()
  const numAfter = async (label) => Number(((await text()).match(new RegExp(label + '[\\s\\S]*?(-?[\\d.]+)')) ?? [])[1])
  const leave = await numAfter('离开下挡板')
  const hit = await numAfter('碰上上挡板')
  check('气缸：离开下挡板的温度是 330 K', Math.abs(leave - 330) < 0.05, `${leave}`)
  check('气缸：碰上上挡板的温度是 495 K', Math.abs(hit - 495) < 0.05, `${hit}`)
  check('气缸：温度拖到 315 K', (await slide('Tk', 315)) === 315)
  const p315 = await numAfter('气体压强')
  const L315 = await numAfter('气柱长度')
  check('气缸：贴着下挡板时 p 与 T 成正比（315 K → 1.05×10⁵ Pa）', Math.abs(p315 - 1.05e5) < 50, `${p315}`)
  check('气缸：贴着下挡板时气柱长度不变', Math.abs(L315 - 0.2) < 1e-4, `${L315}`)
  check('气缸：温度拖到 400 K', (await slide('Tk', 400)) === 400)
  const p400 = await numAfter('气体压强')
  check('气缸：两挡板之间压强保持 1.1×10⁵ Pa', Math.abs(p400 - 1.1e5) < 50, `${p400}`)
  check('气缸：温度拖到 450 K', (await slide('Tk', 450)) === 450)
  const p450 = await numAfter('气体压强')
  check('气缸：450 K 仍是同一个等压值', Math.abs(p450 - 1.1e5) < 50, `${p450}`)
  check('气缸：温度拖到 600 K', (await slide('Tk', 600)) === 600)
  const W = await numAfter('气体做功')
  const U = await numAfter('内能变化')
  const Q = await numAfter('吸收热量')
  check('气缸：顶到上挡板后做功 110 J', Math.abs(W - 110) < 0.05, `${W}`)
  check('气缸：内能增加 500 J', Math.abs(U - 500) < 0.05, `${U}`)
  check('气缸：吸热等于 ΔU + W', Math.abs(Q - (U + W)) < 0.05, `${Q}`)
  await shot(tube, 'cylinder')
  await shot(plot, 'cylinder-pv')
}

// --- 二十一、U 形管灌水银：p·L 不变，高度差等于压强差
{
  const tube = F('U 形管灌水银')
  const plot = F('封闭气体的 p–V')
  const text = () => p.locator('.readout:has-text("液面高度差")').innerText()
  const numAfter = async (label) => Number(((await text()).match(new RegExp(label + '[\\s\\S]*?(-?[\\d.]+)')) ?? [])[1])
  check('U 形管：再灌 0 cm', (await slide('dHg', 0)) === 0)
  const p0 = await numAfter('气体压强')
  const L0 = await numAfter('气柱长度')
  const h0 = await numAfter('液面高度差')
  check('U 形管：未灌入时 p·L = 1500', Math.abs(p0 * L0 - 1500) < 0.05, `${p0}×${L0}`)
  check('U 形管：未灌入时两侧液面一样高', Math.abs(h0) < 0.01, `${h0}`)
  check('U 形管：再灌 25 cm', (await slide('dHg', 25)) === 25)
  const p1 = await numAfter('气体压强')
  const L1 = await numAfter('气柱长度')
  const h1 = await numAfter('液面高度差')
  check('U 形管：灌入后 p·L 仍是 1500', Math.abs(p1 * L1 - 1500) < 0.05, `${p1}×${L1}`)
  check('U 形管：液面高度差等于气体压强减大气压', Math.abs(h1 - (p1 - 75)) < 0.02, `${h1} vs ${p1 - 75}`)
  await shot(tube, 'utube')
  await shot(plot, 'utube-pv')
}

const blockErrors = await p.$$eval('.sim-error, .block-error', (els) => els.map((e) => e.textContent.trim()))
console.log(checks.join('\n'))
const allErrors = [...errors, ...blockErrors]
console.log('errors:', allErrors.join(' | ') || 'none')
await b.close()
if (allErrors.length || checks.some((c) => c.startsWith('✗'))) process.exitCode = 1
