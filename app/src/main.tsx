import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/noto-serif-sc/600.css'
import '@fontsource/noto-serif-sc/900.css'
import '@fontsource/noto-sans-sc/400.css'
import '@fontsource/noto-sans-sc/500.css'
import '@fontsource/noto-sans-sc/700.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/700.css'
import '@fontsource/source-serif-4/400-italic.css'
import '@fontsource/inter/300.css'
import 'katex/dist/katex.min.css'
import './styles.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
