import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';

import { CONSOLE_APPEARANCE } from './app/appearance-config';
import { router } from './app/router';
import { queryClient } from './lib/query-client';

import './App.css';

// Start the MSW mock API outside React (dev only) so it is intercepting before
// the first request fires. The worker script lives at /mockServiceWorker.js.
async function enableMocking() {
  if (!import.meta.env.DEV) return;
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element #root not found');
  }
  createRoot(rootElement).render(
    <StrictMode>
      <CONSOLE_APPEARANCE.NexusAppearanceProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </CONSOLE_APPEARANCE.NexusAppearanceProvider>
    </StrictMode>
  );
});
