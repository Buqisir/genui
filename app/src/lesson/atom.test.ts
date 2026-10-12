import { describe, expect, it } from 'vitest'
import { readNames, schematicNetlist, solveWiring, type SchematicNode } from './circuit'
import { photoCurrent, photoLaw, photonEnergyEv, H_J_S, E_COULOMB, HC_EV_NM } from './phototube'
import { bohrRadiusNm, hydrogenEn, orbitRows, outsideCaption, placeSpectrum, wavelengthNm } from './spectrum'
import { validateLesson } from './validate'

function solve(source: SchematicNode, load: SchematicNode, scope: Record<string, number> = {}) {
  const net = schematicNetlist(source, load, scope)
  const res = solveWiring(net.parts, net.wires, scope)
  const by: Record<string, number> = {}
  for (const r of readNames(net.parts)) {
    const v = res.parts[r.id]?.[r.q]
    if (v === undefined) throw new Error(`missing ${r.name}`)
    by[r.name] = v
  }
  return { by, res }
}

const lesson = (body: string) => ['---', 'title: t', 'demo: true', '---', body].join('\n')
const msgs = (body: string) => validateLesson(lesson(body)).errors.map((e) => e.message).join('\n')

describe('hydrogen spectrum', () => {
  it('places the Balmer lines within 1 nm of Hα Hβ Hγ Hδ', () => {
    const want: [number, number][] = [
      [3, 656],
      [4, 486],
      [5, 434],
      [6, 410],
    ]
    for (const [n, nm] of want) {
      const got = wavelengthNm(hydrogenEn(n) - hydrogenEn(2))
      expect(Math.abs(got - nm)).toBeLessThan(1)
    }
  })

  it('keeps lines off the visible axis as a count, not a drawn position', () => {
    const lines = [3, 4, 5, 6].map((n, index) => ({
      index,
      label: `H${n}`,
      nm: wavelengthNm(hydrogenEn(n) - hydrogenEn(2)),
    }))
    lines.push({ index: 4, label: 'L', nm: wavelengthNm(hydrogenEn(2) - hydrogenEn(1)) })
    const { inside, outside } = placeSpectrum(lines, { from: 380, to: 760 })
    expect(inside.map((l) => l.label)).toEqual(['H6', 'H5', 'H4', 'H3'])
    expect(outsideCaption(outside)).toBe('另有 1 条在紫外区')
    expect(inside.every((l) => l.region === '可见')).toBe(true)
  })
})

describe('Bohr orbits', () => {
  it('uses r_n = n² r₁, and compresses the drawing to be linear in n', () => {
    expect(bohrRadiusNm(3) / bohrRadiusNm(1)).toBe(9)
    expect(bohrRadiusNm(1)).toBeCloseTo(0.053, 6)
    const rows = orbitRows(
      [1, 2, 3, 4].map((n) => ({ n, E: hydrogenEn(n) })),
      116,
    )
    expect(rows[2].ratio).toBe(9)
    expect(rows[3].rho / rows[0].rho).toBeCloseTo(4, 6)
    expect(rows[3].rho / rows[0].rho).toBeLessThan(rows[3].ratio)
    expect(rows.map((r) => r.rho)).toEqual([...rows].sort((a, b) => a.rho - b.rho).map((r) => r.rho))
  })
})

describe('phototube', () => {
  const W = 2
  const lambda = 500
  const law = photoLaw({ lambda, W, Isat: 1e-4 })

  it('computes Uc = (hν − W)/e from wavelength or frequency', () => {
    const energy = HC_EV_NM / lambda
    expect(law.energy).toBeCloseTo(energy, 8)
    expect(law.Uc).toBeCloseTo(energy - W, 8)
    expect(law.Ek).toBeCloseTo(energy - W, 8)
    const nu = (energy * E_COULOMB) / H_J_S
    const byNu = photoLaw({ nu, W, Isat: 1e-4 })
    expect(byNu.Uc).toBeCloseTo(law.Uc, 6)
    expect(photonEnergyEv({ nu })).toBeCloseTo(energy, 6)
  })

  it('follows the three schematic segments, and is dark below threshold', () => {
    expect(photoCurrent(-law.Uc - 0.2, law)).toBe(0)
    expect(photoCurrent(0.4, law)).toBeCloseTo(law.Isat, 8)
    const mid = -law.Uc / 2
    expect(photoCurrent(mid, law)).toBeCloseTo(law.Isat * (mid + law.Uc) / law.Uc, 8)
    const dark = photoLaw({ lambda: 700, W, Isat: 1e-4 })
    expect(dark.dark).toBe(true)
    expect(dark.Uc).toBe(0)
    expect(dark.Ek).toBe(0)
    expect(photoCurrent(2, dark)).toBe(0)
    expect(photoCurrent(-1, dark)).toBe(0)
  })

  // Potentiometer: battery across R1 then (R2 ∥ phototube). R2 keeps both
  // electrodes in one component, so the open-tube voltage is the divider voltage.
  const pot = (s: number, extra: Record<string, unknown> = {}) =>
    solve(
      { type: 'battery', emf: 4, r: 0 },
      {
        series: [
          { type: 'resistor', R: s * 1000 + 1 },
          {
            parallel: [
              { type: 'resistor', R: (1 - s) * 1000 + 1 },
              { type: 'phototube', lambda, W, Isat: 1e-4, read: { I: 'I', U: 'U', Uc: 'Uc', Ek: 'Ek' }, ...extra },
            ],
          },
        ],
      },
    )

  it('gives I = 0 beyond Uc, Isat in forward bias, and the straight segment between', () => {
    const cut = pot(0)
    expect(cut.res.warnings).toEqual([])
    expect(cut.by.Uc).toBeCloseTo(law.Uc, 6)
    expect(cut.by.Ek).toBeCloseTo(law.Ek, 6)
    expect(cut.by.I).toBeCloseTo(0, 8)
    expect(cut.by.U).toBeLessThan(-law.Uc)

    const lin = pot(0.92)
    expect(lin.res.warnings).toEqual([])
    expect(lin.by.U).toBeGreaterThan(-law.Uc)
    expect(lin.by.U).toBeLessThan(0)
    expect(lin.by.I).toBeCloseTo(photoCurrent(lin.by.U, law), 6)
    expect(lin.by.I).toBeGreaterThan(0)
    expect(lin.by.I).toBeLessThan(law.Isat)

    const sat = pot(0.15, { reverse: true })
    expect(sat.res.warnings).toEqual([])
    expect(sat.by.U).toBeGreaterThan(-1e-4)
    expect(sat.by.I).toBeCloseTo(law.Isat, 6)
  })

  it('draws no photocurrent when the light is below the work function', () => {
    const dark = solve(
      { type: 'battery', emf: 4, r: 0 },
      {
        series: [
          { type: 'resistor', R: 100 },
          {
            parallel: [
              { type: 'resistor', R: 100 },
              { type: 'phototube', lambda: 700, W, Isat: 1e-4, reverse: true, read: { I: 'I', U: 'U', Uc: 'Uc', Ek: 'Ek' } },
            ],
          },
        ],
      },
    )
    expect(dark.res.warnings).toEqual([])
    expect(dark.by.I).toBeCloseTo(0, 8)
    expect(dark.by.Uc).toBe(0)
    expect(dark.by.Ek).toBe(0)
  })
})

describe('atom validator', () => {
  const tube = (extra: string) =>
    `<Circuit source={{type: "battery", emf: 2}} load={{type: "phototube", ${extra}, read: {I: "I", U: "U", Uc: "Uc", Ek: "Ek"}}} />`

  it('accepts a spectrum, orbits and a phototube', () => {
    const errors = msgs(`
      <EnergyLevels spectrum={{from: 300, to: 800, series: "visible"}} orbits absorption transitions={[{from: 3, to: 2, label: "H"}]} select={0} />
      ${tube('lambda: 500, W: 2, Isat: 1e-6')}
    `)
    expect(errors).toBe('')
  })

  it('rejects a phototube with both colours of light, a repeat, and a bad read', () => {
    expect(msgs(tube('nu: 5e14, lambda: 500, W: 2, Isat: 1e-6'))).toContain('nu')
    expect(msgs(tube('W: 2, Isat: 1e-6'))).toContain('nu')
    expect(msgs(tube('lambda: 500, Isat: 1e-6'))).toContain('逸出功')
    expect(msgs(tube('lambda: 500, W: 2'))).toContain('Isat')
    expect(msgs(`<Circuit source={{type: "battery", emf: 2}} load={{repeat: 2, item: {type: "phototube", lambda: 500, W: 2, Isat: 1e-6}}} />`)).toContain('repeat')
    expect(msgs('<Circuit source={{type: "battery", emf: 2}} load={{type: "phototube", lambda: 500, W: 2, Isat: 1e-6, read: {Q: "q"}}} />')).toContain('read')
    expect(msgs('<EnergyLevels spectrum={{series: "lyman"}} />')).toContain('series')
  })
})
