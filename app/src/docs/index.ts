// Progressive docs: small files under docs/ are the source of truth.
// Region bodies, in manifest order, reassemble syntax-spec.md byte for byte.
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'
import { COMPONENTS, type PropSpec } from '../lesson/components'

const here = dirname(fileURLToPath(import.meta.url))
export const repoRoot = resolve(here, '../../..')
export const docsRoot = join(repoRoot, 'docs')
export const specPath = join(repoRoot, 'syntax-spec.md')

const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export interface RegionRef {
  region: string
  file: string
}

export interface Region {
  id: string
  body: string
}

export interface Doc {
  id: string
  layer: 'L1' | 'L2'
  title: string
  component?: string
  related: string[]
  /** Path relative to docs/, with forward slashes. */
  file: string
  text: string
  regions: Region[]
  bytes: number
}

export function kindLabel(kind: PropSpec['kind']): string {
  return Array.isArray(kind) ? kind.join(' 或 ') : kind
}

/** Markdown table of one component's props, in COMPONENTS order. */
export function propsTable(component: string): string {
  const spec = COMPONENTS[component]
  if (!spec) throw new Error(`未知组件 ${component}`)
  const header = '| 属性 | 类型 | 必填 | 说明 |'
  const rule = '| --- | --- | --- | --- |'
  const rows = Object.entries(spec).map(([name, ps]) => {
    const req = ps.required ? '是' : ''
    return `| ${name} | ${kindLabel(ps.kind)} | ${req} | ${ps.doc} |`
  })
  return [header, rule, ...rows].join('\n')
}

function propsRe() {
  return /<!-- props:([A-Za-z][A-Za-z0-9]*) -->\n([\s\S]*?)\n<!-- \/props -->/g
}

function regionRe() {
  return /<!-- region:([a-z0-9-]+) -->\n([\s\S]*?)\n<!-- \/region -->/g
}

/** Replace every props block with the table generated from COMPONENTS. */
export function fillProps(text: string): string {
  return text.replace(propsRe(), (_full, name: string) => `<!-- props:${name} -->\n${propsTable(name)}\n<!-- /props -->`)
}

export function extractRegions(text: string): Region[] {
  return [...text.matchAll(regionRe())].map((m) => ({ id: m[1], body: m[2] }))
}

/** ```lesson fenced blocks, in order. The fence body includes its trailing newline when present. */
export function lessonFences(markdown: string): string[] {
  return [...markdown.matchAll(/```lesson\r?\n([\s\S]*?)```/g)].map((m) => m[1])
}

export function loadManifest(text?: string): RegionRef[] {
  const raw = text ?? readFileSync(join(docsRoot, 'manifest.yaml'), 'utf8')
  const data = parse(raw)
  if (!Array.isArray(data)) throw new Error('manifest.yaml 应为列表')
  return data.map((item, i) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error(`manifest[${i}] 不是对象`)
    const region = (item as { region?: unknown }).region
    const file = (item as { file?: unknown }).file
    if (typeof region !== 'string' || typeof file !== 'string') throw new Error(`manifest[${i}] 缺少 region 或 file`)
    return { region, file }
  })
}

function docFiles(): string[] {
  const files: string[] = []
  for (const dir of ['cards', 'ref']) {
    let names: string[] = []
    try {
      names = readdirSync(join(docsRoot, dir))
    } catch {
      continue
    }
    for (const name of names) if (name.endsWith('.md')) files.push(`${dir}/${name}`)
  }
  files.sort()
  return files
}

function asString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined
}

export function parseDoc(file: string, text: string): { doc: Doc | null; problems: string[] } {
  const problems: string[] = []
  const where = file
  if (!text.startsWith('---\n')) {
    problems.push(`${where} 缺少 YAML 头`)
    return { doc: null, problems }
  }
  const end = text.indexOf('\n---\n', 4)
  if (end < 0) {
    problems.push(`${where} 的 YAML 头没有结束`)
    return { doc: null, problems }
  }
  let data: unknown
  try {
    data = parse(text.slice(4, end))
  } catch (e) {
    problems.push(`${where} 的 YAML 头无法解析：${e instanceof Error ? e.message : String(e)}`)
    return { doc: null, problems }
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    problems.push(`${where} 的 YAML 头应为对象`)
    return { doc: null, problems }
  }
  const rec = data as Record<string, unknown>
  const allowed = new Set(['id', 'layer', 'title', 'component', 'related'])
  for (const key of Object.keys(rec)) {
    if (!allowed.has(key)) problems.push(`${where} 的头信息有未知字段 ${key}`)
  }
  const id = asString(rec.id)
  const layer = asString(rec.layer)
  const title = asString(rec.title)
  const stem = file.slice(file.lastIndexOf('/') + 1, -3)
  if (!id || !ID_RE.test(id)) problems.push(`${where} 的 id 应为 kebab-case`)
  else if (id !== stem) problems.push(`${where} 的 id（${id}）与文件名不符`)
  if (layer !== 'L1' && layer !== 'L2') problems.push(`${where} 的 layer 应为 L1 或 L2`)
  else if ((layer === 'L1' && !file.startsWith('cards/')) || (layer === 'L2' && !file.startsWith('ref/'))) {
    problems.push(`${where} 的 layer ${layer} 与目录不符`)
  }
  if (!title || !title.trim()) problems.push(`${where} 缺少 title`)
  let component: string | undefined
  if (rec.component !== undefined) {
    if (typeof rec.component !== 'string') problems.push(`${where} 的 component 应为字符串`)
    else if (!COMPONENTS[rec.component]) problems.push(`${where} 的 component ${rec.component} 不在校验器里`)
    else component = rec.component
  }
  let related: string[] = []
  if (rec.related === undefined) related = []
  else if (!Array.isArray(rec.related) || rec.related.some((x) => typeof x !== 'string')) {
    problems.push(`${where} 的 related 应为字符串列表`)
  } else related = rec.related as string[]

  const regions = extractRegions(text)
  const seen = new Set<string>()
  for (const r of regions) {
    if (!ID_RE.test(r.id)) problems.push(`${where} 的区域 id ${r.id} 不是 kebab-case`)
    if (seen.has(r.id)) problems.push(`${where} 的区域 ${r.id} 重复`)
    seen.add(r.id)
    if (!r.body.endsWith('\n')) problems.push(`${where} 的区域 ${r.id} 正文应以换行结束`)
  }
  const props = [...text.matchAll(propsRe())].map((m) => m[1])
  if (component) {
    if (props.length !== 1 || props[0] !== component) problems.push(`${where} 应有且仅有一块 <!-- props:${component} -->`)
  } else if (props.length) problems.push(`${where} 没有 component，不应有属性表`)

  if (!id || (layer !== 'L1' && layer !== 'L2') || !title) return { doc: null, problems }
  return {
    doc: {
      id,
      layer,
      title,
      component,
      related,
      file,
      text,
      regions,
      bytes: Buffer.byteLength(text, 'utf8'),
    },
    problems,
  }
}

export function loadDocs(): Doc[] {
  const docs: Doc[] = []
  for (const file of docFiles()) {
    const { doc, problems } = parseDoc(file, readFileSync(join(docsRoot, file), 'utf8'))
    if (!doc) throw new Error(problems.join('\n') || `${file} 无法解析`)
    docs.push(doc)
  }
  return docs
}

export function getDoc(id: string): Doc | undefined {
  return loadDocs().find((d) => d.id === id)
}

export function assembleSpec(docs?: Doc[], manifest?: RegionRef[]): string {
  const list = docs ?? loadDocs()
  const man = manifest ?? loadManifest()
  const bodies = new Map<string, string>()
  for (const doc of list) for (const r of doc.regions) bodies.set(r.id, r.body)
  return man.map((m) => {
    const body = bodies.get(m.region)
    if (body === undefined) throw new Error(`清单中的区域 ${m.region} 不存在`)
    return body
  }).join('')
}

/** Front matter, ids, and region coverage. Empty means the tree is well-formed. */
export function structureProblems(docs = loadDocs(), manifest = loadManifest()): string[] {
  const problems: string[] = []
  const seenDoc = new Map<string, string>()
  const seenRegion = new Map<string, string>()
  for (const doc of docs) {
    const { problems: one } = parseDoc(doc.file, doc.text)
    problems.push(...one)
    const prev = seenDoc.get(doc.id)
    if (prev) problems.push(`文档 id ${doc.id} 重复（${prev} 与 ${doc.file}）`)
    seenDoc.set(doc.id, doc.file)
    for (const r of doc.regions) {
      const at = seenRegion.get(r.id)
      if (at) problems.push(`区域 ${r.id} 重复（${at} 与 ${doc.file}）`)
      seenRegion.set(r.id, doc.file)
    }
    for (const rel of doc.related) {
      if (!ID_RE.test(rel)) problems.push(`${doc.file} 的 related 含非法 id ${rel}`)
    }
  }
  const listed = new Map<string, string>()
  for (const m of manifest) {
    if (!ID_RE.test(m.region)) problems.push(`manifest 的区域 id ${m.region} 不是 kebab-case`)
    if (listed.has(m.region)) problems.push(`manifest 里区域 ${m.region} 列出了多次`)
    listed.set(m.region, m.file)
    const found = seenRegion.get(m.region)
    if (!found) problems.push(`manifest 中的区域 ${m.region} 没有出现在任何文档里`)
    else if (found !== m.file) problems.push(`区域 ${m.region} 在 manifest 里属于 ${m.file}，实际在 ${found}`)
  }
  for (const [id, file] of seenRegion) {
    if (!listed.has(id)) problems.push(`区域 ${id} 在 ${file} 中，但不在 manifest.yaml`)
  }
  const ids = new Set(docs.map((d) => d.id))
  for (const doc of docs) {
    for (const rel of doc.related) if (!ids.has(rel)) problems.push(`${doc.id} 的 related 指向不存在的 ${rel}`)
  }
  return [...new Set(problems)]
}

/** Generated spec and props tables differ from what build would write. */
export function staleProblems(docs = loadDocs(), manifest = loadManifest()): string[] {
  const problems: string[] = []
  let assembled: string
  try {
    assembled = assembleSpec(docs, manifest)
  } catch (e) {
    problems.push(e instanceof Error ? e.message : String(e))
    assembled = ''
  }
  let onDisk = ''
  try {
    onDisk = readFileSync(specPath, 'utf8')
  } catch {
    problems.push('找不到 syntax-spec.md')
  }
  if (assembled && onDisk !== assembled) problems.push('syntax-spec.md 与区域拼接不一致')
  for (const doc of docs) {
    if (fillProps(doc.text) !== doc.text) problems.push(`${doc.file} 的属性表不是由 components.ts 生成的`)
  }
  return problems
}
