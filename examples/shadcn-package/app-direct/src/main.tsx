import { TooltipProvider } from '@acme/ui'
import { TooltipProvider as NexusTooltipProvider } from './components/nexus/components/tooltip'
import { ThemeProvider } from 'next-themes'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'

import App from './App'
import { NexusAppearanceProvider } from './appearance'

import './index.css'
import './nexus.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
      <NexusAppearanceProvider>
        <TooltipProvider>
          <NexusTooltipProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </NexusTooltipProvider>
        </TooltipProvider>
      </NexusAppearanceProvider>
    </ThemeProvider>
  </StrictMode>,
)
