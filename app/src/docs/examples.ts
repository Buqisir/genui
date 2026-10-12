import { validateSource } from '../../scripts/validate'
import { lessonFences } from './index'

/** Run the lesson validator on every ```lesson fence in a doc. */
export function validateLessonFences(markdown: string) {
  return lessonFences(markdown).map((source) => validateSource(source))
}
