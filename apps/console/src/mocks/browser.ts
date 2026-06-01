import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

/**
 * Browser MSW worker. Started (dev-only) in `main.tsx` before React mounts, so
 * the mock API is intercepting before any module fires its first request.
 */
export const worker = setupWorker(...handlers);
