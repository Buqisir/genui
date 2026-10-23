import type { StepComponent } from '../registry'
import { Conclude } from './ConcludeChain'
import { Fill } from './Fill'
import { Lab } from './Lab'
import './interactive.css'

/** Fill, Lab, Conclude. */
export const INTERACTIVE_PARTS: Record<string, StepComponent> = { Fill, Lab, Conclude }
