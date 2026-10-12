// Usage: node scripts/zj-newcomp.mjs <out-dir>
// For each Zhejiang gap problem, report whether the generated lesson uses the component built for that gap.
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const expect = {
  'zj-01': ['E 翻倒/重心', /\btip\b|v\.com\b/],
  'zj-02': ['E 浮力加速系', /aFrame/],
  'zj-03': ['A1 组合轨道+C3 细管', /\btrack\b/],
  'zj-04': ['A1 组合轨道+C3 细管', /\btrack\b/],
  'zj-05': ['C6 有限波列', /v\.waves?\b|\bsources\b/],
  'zj-06': ['A5 导体电场', /conductors/],
  'zj-07': ['A5 导体电场', /conductors/],
  'zj-08': ['A4 点电荷场', /fields[\s\S]{0,400}?\bQ\s*:/],
  'zj-09': ['A4 点电荷场', /fields[\s\S]{0,400}?\bQ\s*:/],
  'zj-10': ['B5 电桥用 Wiring', /<Wiring/],
  'zj-11': ['B3 恒流源', /currentSource/],
  'zj-12': ['C4 蹄形磁铁', /v\.magnet|v\.radialField/],
  'zj-13': ['C1 螺绕环/线圈', /v\.toroid|v\.solenoid/],
  'zj-14': ['A3 定轴转动', /\baxis\b/],
  'zj-15': ['A3 定轴转动', /\baxis\b/],
  'zj-16': ['B4 二极管', /\bdiode\b/],
  'zj-17': ['A2 光路', /<Optics|v\.optics/],
  'zj-18': ['A2 光路', /<Optics|v\.optics/],
  'zj-19': ['C2 衍射图样', /<Fringes|v\.fringes/],
  'zj-20': ['C5 变截面容器', /v\.vessel/],
  'zj-21': ['C7 光电管', /phototube/],
  'zj-22': ['C8 实测折线', /\bpoints\s*:/],
  'zj-23': ['D1 多用电表', /multimeter/],
  'zj-24': ['D2 弹簧测力计', /springScale/],
  'zj-25': ['D5 油膜', /oilFilm/],
  'zj-26': ['B1 变压器', /transformer/],
  'zj-27': ['B2 单刀双掷', /spdt|position\s*:/],
}

const dir = process.argv[2]
if (!dir) { console.error('usage: node scripts/zj-newcomp.mjs <out-dir>'); process.exit(1) }
let used = 0, total = 0
console.log('| 题目 | 缺口 | 用了新组件 |\n|---|---|:-:|')
for (const [id, [gap, re]] of Object.entries(expect)) {
  const f = join(dir, `${id}.md`)
  if (!existsSync(f)) { console.log(`| ${id} | ${gap} | 无产物 |`); continue }
  total++
  const ok = re.test(readFileSync(f, 'utf8'))
  if (ok) used++
  console.log(`| ${id} | ${gap} | ${ok ? '✓' : '✗'} |`)
}
console.log(`\n缺口题用了对应新组件：${used}/${total}`)
