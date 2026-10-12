// Build and check the progressive docs tree.
// Usage: npx tsx scripts/docs.ts build|check|list
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  assembleSpec,
  docsRoot,
  fillProps,
  loadDocs,
  loadManifest,
  specPath,
  staleProblems,
  structureProblems,
} from '../src/docs/index'

function die(messages: string[]): never {
  for (const m of messages) console.error(m)
  process.exit(1)
}

function build() {
  const docs = loadDocs()
  const manifest = loadManifest()
  const structural = structureProblems(docs, manifest)
  if (structural.length) die(structural)
  let propsUpdated = 0
  for (const doc of docs) {
    const next = fillProps(doc.text)
    if (next !== doc.text) {
      writeFileSync(join(docsRoot, doc.file), next)
      propsUpdated++
    }
  }
  const fresh = loadDocs()
  const spec = assembleSpec(fresh, manifest)
  const prev = readFileSync(specPath, 'utf8')
  if (prev !== spec) writeFileSync(specPath, spec)
  const bytes = Buffer.byteLength(spec, 'utf8')
  console.log(`syntax-spec.md ${bytes} 字节${prev === spec ? '（未改）' : ''}`)
  console.log(`属性表更新 ${propsUpdated} 份，文档 ${fresh.length} 份`)
}

function check() {
  const docs = loadDocs()
  const manifest = loadManifest()
  const problems = [...structureProblems(docs, manifest), ...staleProblems(docs, manifest)]
  if (problems.length) die(problems)
  console.log(`ok  ${docs.length} 份文档，syntax-spec.md ${Buffer.byteLength(assembleSpec(docs, manifest), 'utf8')} 字节`)
}

function list() {
  for (const doc of loadDocs()) console.log(`${doc.id}\t${doc.layer}\t${doc.title}\t${doc.bytes}`)
}

const cmd = process.argv[2]
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isMain) {
  if (cmd === 'build') build()
  else if (cmd === 'check') check()
  else if (cmd === 'list') list()
  else {
    console.error('用法: npx tsx scripts/docs.ts build|check|list')
    process.exit(1)
  }
}
