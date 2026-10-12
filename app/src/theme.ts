import { createContext, useContext } from 'react'

// Single source for the 格致 palette. CSS custom properties in styles.css mirror
// these values; the sandbox and SVG components read them from here because they
// cannot see the page's stylesheet.

export type ThemeName = 'light' | 'night'

/** Physical quantities own colour; everything else is ink on enamel. */
export const KINDS = ['velocity', 'force', 'accel', 'charge', 'field'] as const
export type Kind = (typeof KINDS)[number]

const base = {
  light: {
    enamel: '#FFFFFF',
    bezel: '#F1F2F5',
    hairline: '#E1E4E8',
    steel: '#9AA0A8',
    graphite: '#5D636C',
    ink: '#1F2329',
    stage: '#F1F2F5',
    card: '#FFFFFF',
    velocity: '#1F4FD8',
    force: '#E23D28',
    accel: '#A62C77',
    charge: '#C98A00',
    field: '#0E9C85',
  },
  night: {
    enamel: '#1C1D21',
    bezel: '#16171A',
    hairline: '#2A2B30',
    steel: '#6B6C70',
    graphite: '#9A9A98',
    ink: '#F2F2F0',
    stage: '#0F1013',
    card: '#0F1013',
    velocity: '#6E9BFF',
    force: '#FF6B52',
    accel: '#E07AB8',
    charge: '#FFC53D',
    field: '#6FF0C8',
  },
}

export type Palette = Record<string, string>

/**
 * Colours handed to the sandbox and SVG components. Legacy names (blue, red…)
 * stay valid so older lessons keep rendering; they map onto physical kinds.
 */
export function palette(theme: ThemeName): Palette {
  const b = base[theme]
  return {
    ...b,
    // legacy aliases
    text: b.ink,
    muted: b.graphite,
    border: b.steel,
    bg: b.stage,
    panel: b.bezel,
    blue: b.velocity,
    red: b.force,
    purple: b.accel,
    orange: b.charge,
    green: b.field,
    gray: b.steel,
    // glow halos used for trails and pulses
    velocityGlow: theme === 'night' ? '#6E9BFF' : '#1F4FD8',
    forceGlow: theme === 'night' ? '#FF6B52' : '#E23D28',
    chargeGlow: theme === 'night' ? '#FFC53D' : '#C98A00',
    fieldGlow: theme === 'night' ? '#6FF0C8' : '#0E9C85',
  }
}

const SERIES_ALIAS: Record<string, string> = {
  blue: 'velocity',
  red: 'force',
  purple: 'accel',
  orange: 'charge',
  green: 'field',
  gray: 'steel',
}

export const COLOR_NAMES = [...KINDS, 'ink', 'steel', 'graphite', ...Object.keys(SERIES_ALIAS)]

/** Resolve a lesson colour name to a CSS colour for the given theme. */
export function colorOf(name: string | undefined, theme: ThemeName, fallback = 'ink'): string {
  const p = base[theme] as Record<string, string>
  const key = name ? (SERIES_ALIAS[name] ?? name) : fallback
  return p[key] ?? p[fallback]
}

export const SERIES_ORDER = ['velocity', 'force', 'field', 'accel', 'charge', 'steel']

export const ThemeContext = createContext<ThemeName>('light')
export const useTheme = () => useContext(ThemeContext)

export const EASE = 'cubic-bezier(.2,.8,.2,1)'

/** JS twin of EASE for rAF tweens (cubic-bezier(.2,.8,.2,1) solved numerically). */
export function ease(t: number): number {
  if (t <= 0) return 0
  if (t >= 1) return 1
  const x1 = 0.2
  const y1 = 0.8
  const x2 = 0.2
  const y2 = 1
  const bx = (s: number) => 3 * x1 * s * (1 - s) ** 2 + 3 * x2 * s * s * (1 - s) + s ** 3
  const by = (s: number) => 3 * y1 * s * (1 - s) ** 2 + 3 * y2 * s * s * (1 - s) + s ** 3
  let lo = 0
  let hi = 1
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (bx(mid) < t) lo = mid
    else hi = mid
  }
  return by((lo + hi) / 2)
}
