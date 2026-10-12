// Material tokens for the B+ apparatus style. Pure data so the sandbox runtime,
// SVG components and (later) the 3D scene all read the same values.
// Light comes from above: top faces brightest, fronts darken toward the floor,
// a thin bounce rim sits on the bottom edge.

export type CraftTheme = 'light' | 'night'
export type MaterialName = 'steel' | 'steelHi' | 'alu' | 'rubber' | 'insul' | 'dark' | 'brass' | 'cap'

export interface MaterialTone {
  /** Visible top face / chamfer band. */
  top: string
  /** Front-face gradient stops, top to bottom (left to right when `horiz`). */
  stops: [number, string][]
  horiz?: boolean
  /** Dark materials get weaker highlights. */
  dim?: boolean
}

export interface CraftTokens {
  /** Small parts and edges that must read clearly. */
  strong: { color: string; width: number }
  /** Large bodies: shape comes from shading, the outline only closes it. */
  soft: { color: string; width: number }
  seam: string
  bevel: string
  glint: number
  rim: number
  print: string
  contact: string
  ambient: string
  screwHead: string
  screwSlot: string
  glass: { stops: [number, string][]; top: string; edge: string; foot: string }
  materials: Record<MaterialName, MaterialTone>
}

const light: CraftTokens = {
  strong: { color: 'rgba(38,43,50,0.82)', width: 0.9 },
  soft: { color: 'rgba(38,43,50,0.42)', width: 0.75 },
  seam: 'rgba(38,43,50,0.16)',
  bevel: '#FFFFFF',
  glint: 0.7,
  rim: 0.45,
  print: 'rgba(38,43,50,0.52)',
  contact: 'rgba(25,30,38,0.38)',
  ambient: 'rgba(25,30,38,0.16)',
  screwHead: '#EEF0F2',
  screwSlot: 'rgba(38,43,50,0.6)',
  glass: {
    stops: [
      [0, 'rgba(232,242,246,0.55)'],
      [0.55, 'rgba(206,224,231,0.32)'],
      [1, 'rgba(180,204,212,0.42)'],
    ],
    top: 'rgba(236,246,248,0.75)',
    edge: 'rgba(70,100,108,0.55)',
    foot: 'rgba(120,170,170,0.6)',
  },
  materials: {
    steel: { top: '#F2F4F6', stops: [[0, '#E8EBEE'], [0.5, '#DCE0E5'], [0.84, '#CBD0D6'], [1, '#B6BCC4']] },
    steelHi: { top: '#FFFFFF', stops: [[0, '#F8F9FA'], [0.5, '#EEF0F3'], [0.86, '#DDE1E6'], [1, '#C8CDD4']] },
    alu: { top: '#F6F7F8', stops: [[0, '#EEF0F2'], [0.4, '#D8DCE1'], [0.5, '#E9ECEF'], [0.6, '#D2D7DC'], [1, '#BCC2C9']] },
    rubber: { top: '#4C5159', stops: [[0, '#3F444B'], [0.6, '#2C3036'], [1, '#1C1F23']], dim: true },
    insul: { top: '#41464D', stops: [[0, '#353A40'], [1, '#1D2024']], dim: true },
    dark: { top: '#565C65', stops: [[0, '#3C4149'], [1, '#2B2F35']], dim: true },
    brass: {
      top: '#F1DFAE',
      stops: [[0, '#8A6526'], [0.3, '#D9B867'], [0.42, '#F6E6B8'], [0.62, '#C79D4C'], [1, '#7F5C22']],
      horiz: true,
    },
    cap: { top: '#E3E6EA', stops: [[0, '#D3D7DC'], [1, '#B4BAC2']], horiz: true },
  },
}

const night: CraftTokens = {
  strong: { color: 'rgba(226,231,238,0.62)', width: 0.9 },
  soft: { color: 'rgba(226,231,238,0.26)', width: 0.75 },
  seam: 'rgba(0,0,0,0.35)',
  bevel: 'rgba(255,255,255,0.42)',
  glint: 0.35,
  rim: 0.18,
  print: 'rgba(226,231,238,0.5)',
  contact: 'rgba(0,0,0,0.6)',
  ambient: 'rgba(0,0,0,0.32)',
  screwHead: '#5A5F67',
  screwSlot: 'rgba(0,0,0,0.65)',
  glass: {
    stops: [
      [0, 'rgba(150,190,205,0.22)'],
      [0.55, 'rgba(110,150,165,0.14)'],
      [1, 'rgba(90,130,145,0.22)'],
    ],
    top: 'rgba(170,205,215,0.3)',
    edge: 'rgba(170,215,225,0.5)',
    foot: 'rgba(110,190,190,0.55)',
  },
  materials: {
    steel: { top: '#4B5058', stops: [[0, '#3C4148'], [0.5, '#34383F'], [0.84, '#2B2F35'], [1, '#22252A']] },
    steelHi: { top: '#5C616A', stops: [[0, '#4B5058'], [0.5, '#42464D'], [0.86, '#373B41'], [1, '#2D3035']] },
    alu: { top: '#555A62', stops: [[0, '#474C53'], [0.4, '#383C43'], [0.5, '#454A51'], [0.6, '#353940'], [1, '#2A2D33']] },
    rubber: { top: '#2A2D32', stops: [[0, '#202327'], [1, '#121417']], dim: true },
    insul: { top: '#2C2F34', stops: [[0, '#222529'], [1, '#141619']], dim: true },
    dark: { top: '#33373D', stops: [[0, '#25282D'], [1, '#191B1F']], dim: true },
    brass: {
      top: '#B89A5C',
      stops: [[0, '#5C4318'], [0.3, '#9C7F3E'], [0.42, '#C8AE72'], [0.62, '#8E6F31'], [1, '#553E16']],
      horiz: true,
    },
    cap: { top: '#50555D', stops: [[0, '#454A51'], [1, '#30343A']], horiz: true },
  },
}

export function craftTokens(theme: CraftTheme): CraftTokens {
  return theme === 'night' ? night : light
}
