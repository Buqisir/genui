import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { COMPONENTS } from '../lesson/components'
import { validateLessonFences } from './examples'
import {
  assembleSpec,
  docsRoot,
  fillProps,
  lessonFences,
  loadDocs,
  loadManifest,
  specPath,
  staleProblems,
  structureProblems,
} from './index'

/**
 * 没有单独组件卡的组件。正文已经落在别的卡的规范原文里。
 * Define 只有名字和表达式，和参数、颜色、表达式放在 params 卡。
 */
const CARD_ALLOW: Record<string, string> = {
  Define: '正文在 params 卡（<Define> 很短，和参数、颜色、表达式写在一起）',
}

describe('progressive docs', () => {
  const docs = loadDocs()
  const manifest = loadManifest()

  it('reassembles syntax-spec.md byte for byte', () => {
    expect(structureProblems(docs, manifest)).toEqual([])
    const file = readFileSync(specPath)
    const got = Buffer.from(assembleSpec(docs, manifest), 'utf8')
    expect(Buffer.compare(got, file)).toBe(0)
  })

  it('props tables match components.ts', () => {
    for (const doc of docs) expect(doc.text, doc.file).toBe(fillProps(doc.text))
    expect(staleProblems(docs, manifest)).toEqual([])
  })

  it('every component has one card, or is allow-listed', () => {
    for (const name of Object.keys(CARD_ALLOW)) expect(COMPONENTS, name).toHaveProperty(name)
    for (const name of Object.keys(COMPONENTS)) {
      const cards = docs.filter((d) => d.component === name).map((d) => d.id)
      if (name in CARD_ALLOW) expect(cards, CARD_ALLOW[name]).toEqual([])
      else expect(cards, name).toHaveLength(1)
    }
  })

  it('cards stay within the size budget', () => {
    for (const doc of docs.filter((d) => d.layer === 'L1')) expect(doc.bytes, doc.id).toBeLessThanOrEqual(7500)
  })

  it('related ids exist', () => {
    const ids = new Set(docs.map((d) => d.id))
    for (const doc of docs) for (const rel of doc.related) expect(ids.has(rel), `${doc.id} -> ${rel}`).toBe(true)
  })

  it('extracts lesson fences', () => {
    const sample = '前文\n```lesson\n---\nid: a\n---\n```\n后文\n```lesson\n第二段\n```\n'
    expect(lessonFences(sample)).toEqual(['---\nid: a\n---\n', '第二段\n'])
  })

  it('lesson fence helper runs the lesson validator', () => {
    const results = validateLessonFences('```lesson\n不是课件\n```\n')
    expect(results).toHaveLength(1)
    expect(results[0].errors.length).toBeGreaterThan(0)
  })

  it('every card has a minimal example that validates cleanly', () => {
    for (const doc of docs.filter((d) => d.layer === 'L1')) {
      const results = validateLessonFences(doc.text)
      expect(results.length, doc.id).toBeGreaterThan(0)
      for (const r of results) {
        expect(r.errors, doc.id).toEqual([])
        expect(r.warnings, doc.id).toEqual([])
      }
    }
  })

  it('every card is named in the entry page and every ref is reachable from a card', () => {
    const index = readFileSync(join(docsRoot, 'index.md'), 'utf8')
    const cards = docs.filter((d) => d.layer === 'L1')
    for (const doc of cards) expect(index.includes(`\`${doc.id}\``), doc.id).toBe(true)
    // planned 只列尚未实现的组件，不该把模型引过去。
    for (const doc of docs.filter((d) => d.layer === 'L2' && d.id !== 'planned')) {
      const reachable = cards.some((c) => c.related.includes(doc.id) || c.text.includes(`\`${doc.id}\``))
      expect(reachable, doc.id).toBe(true)
    }
  })
})
