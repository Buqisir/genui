import { describe, expect, it } from 'vitest'
import { getDoc, lessonFences } from '../docs/index'
import { TOOL_SCHEMAS, runTool, toolSchemas } from './tools'

describe('function tools', () => {
  it('exports strict OpenAI tool schemas, without render unless asked', () => {
    const names = TOOL_SCHEMAS.map((t) => t.function.name)
    expect(names).toEqual(['get_doc', 'search_docs', 'validate', 'check_layout'])
    expect(toolSchemas({ render: true }).map((t) => t.function.name)).toContain('render')
    for (const tool of toolSchemas({ render: true })) {
      expect(tool.type).toBe('function')
      expect(tool.function.name).toMatch(/^[a-z_]+$/)
      expect(tool.function.description.length).toBeGreaterThan(8)
      const params = tool.function.parameters
      expect(params.type).toBe('object')
      expect(params.additionalProperties).toBe(false)
      expect(params.required.length).toBeGreaterThan(0)
      for (const key of params.required) {
        expect(params.properties[key]?.type).toBe('string')
        expect(params.properties[key]?.description.length).toBeGreaterThan(0)
      }
      expect(Object.keys(params.properties).sort()).toEqual([...params.required].sort())
    }
  })

  it('reads, searches and validates a card example without throwing', async () => {
    const index = await runTool('get_doc', { id: 'index' })
    expect(index).toContain('选型路由表')
    const missing = await runTool('get_doc', { id: 'no-such-doc' })
    expect(missing).toContain('没有这份文档')
    const hits = await runTool('search_docs', { query: '单刀双掷' })
    expect(hits).toContain('circuit')
    const plot = getDoc('plot')
    expect(plot).toBeTruthy()
    const example = lessonFences(plot!.text)[0]
    const ok = await runTool('validate', { lesson: example })
    expect(ok).toMatch(/校验通过|0 个错误/)
    const bad = await runTool('validate', { lesson: '---\ntitle: t\n---\n' })
    expect(bad).toContain('读 genui docs')
    expect(bad).toContain('structure')
    const layout = await runTool('check_layout', { lesson: example })
    expect(layout.length).toBeGreaterThan(0)
    const unknown = await runTool('nope', {})
    expect(unknown).toContain('没有这个工具')
    const wrong = await runTool('get_doc', { query: 'index' })
    expect(wrong).toContain('参数不对')
  })
})
