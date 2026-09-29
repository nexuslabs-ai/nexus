import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'

const params = new URLSearchParams(window.location.search)
const withNexus = !params.has('no-nexus')

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
    <App withNexus={withNexus} withProvider={params.has('provider')} />
  </StrictMode>,
)
