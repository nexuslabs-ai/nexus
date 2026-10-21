import { TooltipProvider } from '@acme/ui'
import { ThemeProvider } from 'next-themes'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'

import App from './App'
import { NxdsAppearanceProvider } from './appearance'

import './index.css'
import './nxds.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
      <NxdsAppearanceProvider>
        <TooltipProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TooltipProvider>
      </NxdsAppearanceProvider>
    </ThemeProvider>
  </StrictMode>,
)
