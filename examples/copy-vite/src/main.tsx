import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'

const params = new URLSearchParams(window.location.search)
const withNexus = !params.has('no-nexus')

// A host that marks its own dark theme on <html>, as next-themes does.
if (params.has('data-theme')) {
  document.documentElement.dataset.theme = 'dark'
  document.documentElement.style.colorScheme = 'dark'
}

if (!withNexus) {
  await import('./index.css')
} else if (params.has('nexus-only')) {
  await import('./components/nexus/nexus.css')
} else if (params.has('nexus-first')) {
  await import('./components/nexus/nexus.css')
  await import('./index.css')
} else {
  await import('./index.css')
  await import('./components/nexus/nexus.css')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App withNexus={withNexus} />
  </StrictMode>,
)
