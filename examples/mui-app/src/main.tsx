import CssBaseline from '@mui/material/CssBaseline'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'

import App from './App'
import { APPEARANCE_STORAGE_KEY, defaultAppearance } from './appearance-state'
import { createNxdsAppearance } from './components/nxds/components/appearance/provider'

import './nxds.css'

const theme = createTheme({
  colorSchemes: { dark: true },
  cssVariables: { colorSchemeSelector: 'class' },
})

const { NxdsAppearanceProvider } = createNxdsAppearance({
  storageKey: APPEARANCE_STORAGE_KEY,
  defaultState: defaultAppearance,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NxdsAppearanceProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NxdsAppearanceProvider>
    </ThemeProvider>
  </StrictMode>,
)
