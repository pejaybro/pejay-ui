/**
 * Global TanStack Query Configuration optimized for Electron Desktop Applications.
 */

export const QUERY_CLIENT_ELECTRON_CONFIG = {
  defaultOptions: {
    queries: {
      // Retries once on failure for local IPC / SQLite queries
      retry: 1,
      // Refetch on window focus is disabled for Electron desktop apps to prevent unnecessary IPC calls on tab switch
      refetchOnWindowFocus: false,
      // Keep data fresh for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Keep unused data in cache for 10 minutes
      gcTime: 1000 * 60 * 10,
    },
    mutations: {
      retry: 0,
    },
  },
} as const;

/*
# NOTE: HOW TO INITIALIZE IN YOUR ELECTRON APP (e.g., App.tsx or main.tsx)

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QUERY_CLIENT_ELECTRON_CONFIG } from "./tanstack-query-electron/api-base";

const queryClient = new QueryClient(QUERY_CLIENT_ELECTRON_CONFIG);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourAppRoutes />
    </QueryClientProvider>
  );
}
```
*/
