// 生成组件库快照 src/lesson/components.lock.json。
// 快照里有不兼容改动时拒绝写入，除非传 --allow-breaking。规则见 CLAUDE.md「组件库兼容规则」。
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { COMPONENTS } from '../src/lesson/components'
import { buildSnapshot, diffSnapshots, type Snapshot } from '../src/lesson/compat'

const LOCK = fileURLToPath(new URL('../src/lesson/components.lock.json', import.meta.url))
const allowBreaking = process.argv.includes('--allow-breaking')

const current = buildSnapshot(COMPONENTS)

if (existsSync(LOCK)) {
  const locked = JSON.parse(readFileSync(LOCK, 'utf8')) as Snapshot
  const { breaking, changes } = diffSnapshots(locked, current)
  if (breaking.length > 0) {
    if (!allowBreaking) {
      console.error('拒绝更新快照：组件库有不兼容的改动，老课件会坏掉：')
      for (const p of breaking) console.error(`  - ${p}`)
      console.error('先用 genui patch 或脚本迁移 lessons/ 里的课件；确认迁移完成后，再加 --allow-breaking 重新运行。')
      process.exit(1)
    }
    console.warn('警告：使用了 --allow-breaking，以下不兼容的改动将写入快照：')
    for (const p of breaking) console.warn(`  - ${p}`)
  }
  for (const c of changes) console.log(`变更：${c}`)
}

writeFileSync(LOCK, JSON.stringify(current, null, 2) + '\n')
console.log(`已更新 ${LOCK}`)
