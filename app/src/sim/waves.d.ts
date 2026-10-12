export function rayY(src: Record<string, unknown>, dirSign: number, x: number, t: number): number

export function sourceY(src: Record<string, unknown>, x: number, t: number, wall?: { x: number; kind?: string }): number

export function waveField(
  sources: readonly Record<string, unknown>[] | undefined,
  t: number,
  opts?: { wall?: { x: number; kind?: string } },
): { y: (x: number) => number; yi: (i: number, x: number) => number }

export function waveFront(src: Record<string, unknown>, t: number, dirSign?: number): number | null

export function installWaveGlobals(g: typeof globalThis): void
