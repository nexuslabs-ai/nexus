import CssBaseline from '@mui/material/CssBaseline'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'

import App from './App'
import { APPEARANCE_STORAGE_KEY, defaultAppearance } from './appearance-state'
import { createNexusAppearance } from './components/nexus/components/appearance/provider'
import { TooltipProvider as NexusTooltipProvider } from './components/nexus/components/tooltip'

import './nexus.css'

const theme = createTheme({
  colorSchemes: { dark: true },
  cssVariables: { colorSchemeSelector: 'class' },
})

const { NexusAppearanceProvider } = createNexusAppearance({
  storageKey: APPEARANCE_STORAGE_KEY,
  defaultState: defaultAppearance,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NexusAppearanceProvider>
        <NexusTooltipProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </NexusTooltipProvider>
      </NexusAppearanceProvider>
    </ThemeProvider>
  </StrictMode>,
)
