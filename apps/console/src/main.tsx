import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { RouterProvider } from '@tanstack/react-router';

import { CONSOLE_APPEARANCE } from './app/appearance-config';
import { router } from './app/router';

import './App.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

createRoot(rootElement).render(
  <StrictMode>
    <CONSOLE_APPEARANCE.NexusAppearanceProvider>
      <RouterProvider router={router} />
    </CONSOLE_APPEARANCE.NexusAppearanceProvider>
  </StrictMode>
);
