import { useEffect, useState } from 'react'
import { LessonView } from './components/LessonView'

declare global {
  interface Window {
    /** Lesson source injected by the headless renderer. Absent in normal use. */
    __GENUI_PREVIEW__?: string
  }
}

function previewSource(): string | null {
  if (typeof window === 'undefined') return null
  const src = window.__GENUI_PREVIEW__
  return typeof src === 'string' && src.length > 0 ? src : null
}

// Lazy: the lesson sources together are several MB, so each one loads only when picked.
const files = import.meta.glob(['../../lessons/*.md', '../../generated/*.md', '../../generated-grok/*/*.md'], {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

// Ids keep runs apart: gen-<name> for generated/, grok-<run>-<name> for generated-grok/<run>/.
function idOf(path: string): string {
  const parts = path.split('/')
  const name = parts.pop()!.replace(/\.md$/, '')
  if (path.includes('/generated-grok/')) return `grok-${parts.pop()}-${name}`
  return path.includes('/generated/') ? `gen-${name}` : name
}

const lessons = Object.entries(files)
  .map(([path, load]) => ({ id: idOf(path), load }))
  .sort((a, b) => a.id.localeCompare(b.id))

const fromHash = () => decodeURIComponent(location.hash.slice(1))

export function App() {
  const [id, setId] = useState(() => fromHash() || lessons[0]?.id || '')
  const [loaded, setLoaded] = useState<{ id: string; source: string } | null>(null)

  useEffect(() => {
    const onHash = () => setId(fromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const lesson = lessons.find((l) => l.id === id) ?? lessons[0]
  useEffect(() => {
    if (!lesson || previewSource()) return
    let alive = true
    lesson.load().then((source) => alive && setLoaded({ id: lesson.id, source }))
    return () => {
      alive = false
    }
  }, [lesson])

  const preview = previewSource()
  if (preview) {
    return (
      <div className="app">
        <header className="topbar">
          <span className="brand">物理题可视化 · 预览</span>
        </header>
        <LessonView key="preview" source={preview} />
      </div>
    )
  }

  const source = loaded && loaded.id === lesson?.id ? loaded.source : null

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">物理题可视化 · 原型</span>
        <select
          aria-label="选择课件"
          value={lesson?.id ?? ''}
          onChange={(e) => (location.hash = encodeURIComponent(e.target.value))}
        >
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {l.id}
            </option>
          ))}
        </select>
      </header>
      {!lesson ? <p>lessons/ 目录下还没有课件。</p> : source !== null ? <LessonView key={lesson.id} source={source} /> : null}
    </div>
  )
}
