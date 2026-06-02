import { QueryClient } from '@tanstack/react-query';

/**
 * Shared query client. Modules fetch through the MSW mock API (`src/mocks`), so
 * the defaults favour stable demo data over aggressive refetching.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      // The mock API is deterministic — a request either succeeds or 404s, and a
      // retry never changes that. Skipping retries makes error states (e.g. an
      // unknown contact id) render instantly instead of after react-query's
      // backoff. Revisit when a real, transient-failure-prone backend lands.
      retry: false,
    },
  },
});
