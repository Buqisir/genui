// 组件库兼容性检查：对照 components.lock.json，老课件用到的组件和属性不能被删、改名或收窄。
// 规则见 /home/user/genui/CLAUDE.md「组件库兼容规则」。
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { COMPONENTS } from './components'
import { buildSnapshot, diffSnapshots, RULES_HINT, type Snapshot } from './compat'

const LOCK_PATH = fileURLToPath(new URL('./components.lock.json', import.meta.url))
const UPDATE_HINT = '，运行 cd app && npm run lock:components 更新快照'

describe('组件库兼容性（对照 components.lock.json）', () => {
  const locked = JSON.parse(readFileSync(LOCK_PATH, 'utf8')) as Snapshot
  const { breaking, changes } = diffSnapshots(locked, buildSnapshot(COMPONENTS))

  it('没有不兼容的改动（不能删组件、删属性、改名、收窄类型、可选改必填）', () => {
    expect(breaking.join('\n')).toBe('')
  })

  it('快照是最新的（新增的组件或属性已写入快照）', () => {
    expect(changes.map((c) => c + UPDATE_HINT).join('\n')).toBe('')
  })
})

describe('diffSnapshots', () => {
  const base: Snapshot = {
    Circuit: {
      load: { kind: ['number', 'expr'], required: false },
      name: { kind: ['string'], required: true },
    },
    Param: {
      value: { kind: ['number'], required: true },
      min: { kind: ['number'], required: false },
    },
  }
  const clone = (s: Snapshot): Snapshot => JSON.parse(JSON.stringify(s))

  it('完全相同：没有任何问题', () => {
    expect(diffSnapshots(base, clone(base))).toEqual({ breaking: [], changes: [] })
  })

  it('组件被删除或改名：不兼容', () => {
    const after = clone(base)
    delete after.Circuit
    const { breaking, changes } = diffSnapshots(base, after)
    expect(breaking).toEqual([
      `组件 Circuit 被删除或改名了。老课件还在用它：不要删组件，见 ${RULES_HINT}`,
    ])
    expect(changes).toEqual([])
  })

  it('属性被删除或改名：不兼容，消息点名属性', () => {
    const after = clone(base)
    delete after.Circuit.load
    const { breaking } = diffSnapshots(base, after)
    expect(breaking).toEqual([
      `组件 Circuit 的属性 load 被删除或改名了。老课件还在用它：不要删属性，见 ${RULES_HINT}`,
    ])
  })

  it('类型收窄（去掉 expr）：不兼容', () => {
    const after = clone(base)
    after.Circuit.load.kind = ['number']
    const { breaking } = diffSnapshots(base, after)
    expect(breaking).toHaveLength(1)
    expect(breaking[0]).toContain("组件 Circuit 的属性 load 不再接受 'expr'")
  })

  it('类型放宽（加上 string）：兼容，记为快照变更', () => {
    const after = clone(base)
    after.Param.value.kind = ['number', 'string']
    const { breaking, changes } = diffSnapshots(base, after)
    expect(breaking).toEqual([])
    expect(changes).toEqual(["组件 Param 的属性 value 类型放宽，新增接受 'string'"])
  })

  it('可选改成必填：不兼容', () => {
    const after = clone(base)
    after.Param.min.required = true
    const { breaking } = diffSnapshots(base, after)
    expect(breaking).toEqual([
      `组件 Param 的属性 min 原来是可选的，现在改成了必填。老课件里没有它，见 ${RULES_HINT}`,
    ])
  })

  it('必填改成可选：兼容，记为快照变更', () => {
    const after = clone(base)
    after.Param.value.required = false
    const { breaking, changes } = diffSnapshots(base, after)
    expect(breaking).toEqual([])
    expect(changes).toEqual(['组件 Param 的属性 value 不再必填'])
  })

  it('老组件新增必填属性：不兼容', () => {
    const after = clone(base)
    after.Circuit.mode = { kind: ['string'], required: true }
    const { breaking } = diffSnapshots(base, after)
    expect(breaking).toEqual([
      `新增的属性 Circuit.mode 是必填的。老课件里没有它，新属性必须可选，见 ${RULES_HINT}`,
    ])
  })

  it('老组件新增可选属性：兼容，记为快照变更', () => {
    const after = clone(base)
    after.Circuit.foo = { kind: ['string'], required: false }
    const { breaking, changes } = diffSnapshots(base, after)
    expect(breaking).toEqual([])
    expect(changes).toEqual(['新增了 Circuit.foo'])
  })

  it('新增组件：兼容，记为快照变更；新组件的必填属性不算不兼容（老课件不可能用它）', () => {
    const after = clone(base)
    after.Variant = {
      label: { kind: ['string'], required: true },
    }
    const { breaking, changes } = diffSnapshots(base, after)
    expect(breaking).toEqual([])
    expect(changes).toEqual(['新增了组件 Variant'])
  })

  it('buildSnapshot：单个 kind 包成数组，kind 与键排序，required 默认 false', () => {
    const snap = buildSnapshot({
      Zed: { b: { kind: ['string', 'number'], doc: '' }, a: { kind: 'boolean', required: true, doc: '' } },
      Alpha: { x: { kind: 'expr', doc: '' } },
    })
    expect(Object.keys(snap)).toEqual(['Alpha', 'Zed'])
    expect(Object.keys(snap.Zed)).toEqual(['a', 'b'])
    expect(snap.Zed.a).toEqual({ kind: ['boolean'], required: true })
    expect(snap.Zed.b).toEqual({ kind: ['number', 'string'], required: false })
    expect(snap.Alpha.x).toEqual({ kind: ['expr'], required: false })
  })
})
