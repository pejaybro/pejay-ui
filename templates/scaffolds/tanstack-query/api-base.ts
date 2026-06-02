/* 
#ANCHOR : TYPE:1 VITE PROJECT
const BASE_URL = import.meta.env.VITE_API_URL; 

Environment variables must start with VITE_ to be exposed to client-side code in Vite.

---------------------------------------------------------

#ANCHOR : TYPE:2 NEXT.JS / NON-VITE PROJECTS
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

Environment variables must start with NEXT_PUBLIC_ to be available in Next.js browser code.

---------------------------------------------------------
#ANCHOR 
Vite doesn't automatically provide Node's process.env in browser code.

| Framework       | Access Method       | Public Prefix    |
| --------------- | ------------------- | ---------------- |
| Next.js         | `process.env.X`     | `NEXT_PUBLIC_`   |
| Vite            | `import.meta.env.X` | `VITE_`          |
| Node.js Backend | `process.env.X`     | No prefix needed |

*/

export const API_CONFIG = {
  // NOTE: Change this BASE_URL to match your actual API endpoint
  baseUrl: "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
} as const;

export const QUERY_CLIENT_CONFIG = {
  defaultOptions: {
    queries: {
      // # NOTE: Global TanStack Query configurations
      retry: 3,                    // Automatically retries failed requests 3 times on failure
      refetchOnWindowFocus: false,  // Refetches stale active queries when the browser tab gets focused
      staleTime: 1000 * 60 * 5,    // Data is considered fresh for 5 minutes (prevents duplicate requests)
    },
  },
} as const;

/*
# NOTE: HOW AND WHERE TO USE QUERY_CLIENT_CONFIG

This configuration is imported and passed when initializing the QueryClient at the root of your application (e.g., in App.tsx, main.tsx, or layout.tsx):

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QUERY_CLIENT_CONFIG } from "./api-base";

const queryClient = new QueryClient(QUERY_CLIENT_CONFIG);

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```
*/


