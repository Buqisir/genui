export interface VesselOpening {
  x: number
  y: number
  w: number
  side: string
  open?: boolean
}

export interface VesselPartGeom {
  cavity: number[][][]
  draw: number[][][]
  glass: number[][][]
  openings: VesselOpening[]
}

export function insidePolygon(x: number, y: number, poly: readonly (readonly number[])[]): boolean

export function insideAny(x: number, y: number, polys: readonly (readonly (readonly number[])[])[]): boolean

export function vesselLayout(
  parts: readonly Record<string, unknown>[] | undefined,
  wall?: number,
  lip?: number,
): { parts: VesselPartGeom[]; openings: VesselOpening[]; mouth: VesselOpening | null }

export function cavityContains(parts: readonly Record<string, unknown>[] | undefined, x: number, y: number, wall?: number): boolean

export function installVesselGlobals(g: typeof globalThis): void
