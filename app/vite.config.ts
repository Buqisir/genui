import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { buildRuntime, runtimeWatchFiles } from './src/sim/buildRuntime'

const runtimeVirtualId = 'virtual:sandbox-runtime'
const runtimeResolvedId = '\0' + runtimeVirtualId

function sandboxRuntime(): Plugin {
  return {
    name: 'sandbox-runtime',
    resolveId(id) {
      if (id === runtimeVirtualId) return runtimeResolvedId
    },
    load(id) {
      if (id !== runtimeResolvedId) return null
      const source = buildRuntime()
      for (const file of runtimeWatchFiles()) this.addWatchFile(file)
      return `export default ${JSON.stringify(source)}`
    },
  }
}

const lessonDirs = [resolve(__dirname, '../lessons'), resolve(__dirname, '../generated'), resolve(__dirname, '../generated-grok')]

// Lesson folders sit outside the Vite root, so files added there are not watched by default
// and the eager glob in App.tsx would keep a stale list until restart.
function watchLessons(): Plugin {
  return {
    name: 'watch-lessons',
    configureServer(server) {
      server.watcher.add(lessonDirs)
      const reload = (file: string) => {
        // Per-attempt drafts under .attempts/ are not lessons; reloading on each would disrupt viewers.
        if (!lessonDirs.some((d) => file.startsWith(d)) || !file.endsWith('.md') || file.includes('/.attempts/')) return
        const app = server.moduleGraph.getModuleById(resolve(__dirname, 'src/App.tsx'))
        if (app) server.moduleGraph.invalidateModule(app)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', reload)
      server.watcher.on('unlink', reload)
    },
  }
}

export default defineConfig({
  plugins: [react(), watchLessons(), sandboxRuntime()],
  server: { fs: { allow: ['..'] } },
})
