import type { StepComponent } from '../registry'
import { Choice } from './Choice'
import { Def } from './Def'
import { Homework } from './Homework'
import { Result } from './Result'
import { Stem } from './Stem'
import { Work } from './Work'
import './text.css'

/** Stem, Choice, Work, Def, Result, Homework. */
export const TEXT_PARTS: Record<string, StepComponent> = { Stem, Choice, Work, Def, Result, Homework }
