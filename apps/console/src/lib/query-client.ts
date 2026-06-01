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
    },
  },
});
