import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import './nxds.css'
import { NxdsAppearanceProvider } from './components/nxds/components/appearance/provider'
import { defaultAppearance } from './appearance-state'

createRoot(document.getElementById('root')!).render(
  <NxdsAppearanceProvider storageKey="nxds-appearance" defaultState={defaultAppearance}>
  <StrictMode>
    <App />
  </StrictMode>
  </NxdsAppearanceProvider>,
)
