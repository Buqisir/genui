// 组件库快照与兼容性比较。供 scripts/lock-components.ts 和 components.lock.test.ts 共用。
// 规则见 仓库根目录 CLAUDE.md「组件库兼容规则」。

import type { PropKind, PropSpec } from './components'

export interface PropSnapshot {
  kind: PropKind[]
  required: boolean
}

// component -> prop -> PropSnapshot；组件名、属性名、kind 都已排序
export type Snapshot = Record<string, Record<string, PropSnapshot>>

export interface SnapshotDiff {
  // 不兼容的改动：老课件可能因此坏掉，默认拒绝写入快照
  breaking: string[]
  // 兼容的改动（新增组件、新增可选属性、放宽类型等）：快照需要更新
  changes: string[]
}

export const RULES_HINT = 'CLAUDE.md「组件库兼容规则」'

export function buildSnapshot(components: Record<string, Record<string, PropSpec>>): Snapshot {
  const out: Snapshot = {}
  for (const comp of Object.keys(components).sort()) {
    const props: Record<string, PropSnapshot> = {}
    const specs = components[comp]
    for (const prop of Object.keys(specs).sort()) {
      const spec = specs[prop]
      const kinds = Array.isArray(spec.kind) ? spec.kind : [spec.kind]
      props[prop] = { kind: [...new Set(kinds)].sort(), required: spec.required === true }
    }
    out[comp] = props
  }
  return out
}

export function diffSnapshots(locked: Snapshot, current: Snapshot): SnapshotDiff {
  const breaking: string[] = []
  const changes: string[] = []

  for (const comp of Object.keys(locked).sort()) {
    if (!(comp in current)) {
      breaking.push(`组件 ${comp} 被删除或改名了。老课件还在用它：不要删组件，见 ${RULES_HINT}`)
      continue
    }
    const lockedProps = locked[comp]
    const currentProps = current[comp]
    for (const prop of Object.keys(lockedProps).sort()) {
      const was = lockedProps[prop]
      const now = currentProps[prop]
      if (!now) {
        breaking.push(`组件 ${comp} 的属性 ${prop} 被删除或改名了。老课件还在用它：不要删属性，见 ${RULES_HINT}`)
        continue
      }
      const droppedKinds = was.kind.filter((k) => !now.kind.includes(k))
      if (droppedKinds.length > 0) {
        breaking.push(
          `组件 ${comp} 的属性 ${prop} 不再接受 ${droppedKinds.map((k) => `'${k}'`).join('、')}（原来接受 ${was.kind.join(' | ')}）。类型只能放宽，不能收窄，见 ${RULES_HINT}`,
        )
      }
      if (!was.required && now.required) {
        breaking.push(`组件 ${comp} 的属性 ${prop} 原来是可选的，现在改成了必填。老课件里没有它，见 ${RULES_HINT}`)
      }
      const widenedKinds = now.kind.filter((k) => !was.kind.includes(k))
      if (widenedKinds.length > 0) {
        changes.push(`组件 ${comp} 的属性 ${prop} 类型放宽，新增接受 ${widenedKinds.map((k) => `'${k}'`).join('、')}`)
      }
      if (was.required && !now.required) {
        changes.push(`组件 ${comp} 的属性 ${prop} 不再必填`)
      }
    }
    for (const prop of Object.keys(currentProps).sort()) {
      if (prop in lockedProps) continue
      const now = currentProps[prop]
      if (now.required) {
        breaking.push(`新增的属性 ${comp}.${prop} 是必填的。老课件里没有它，新属性必须可选，见 ${RULES_HINT}`)
      } else {
        changes.push(`新增了 ${comp}.${prop}`)
      }
    }
  }

  for (const comp of Object.keys(current).sort()) {
    if (!(comp in locked)) changes.push(`新增了组件 ${comp}`)
  }

  return { breaking, changes }
}
