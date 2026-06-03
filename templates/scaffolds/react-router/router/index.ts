import { createBrowserRouter, RouteObject } from "react-router-dom";
import { PATH } from "./path";
import { PublicRoute } from "./guards/public.route";
import { PrivateRoute } from "./guards/private.route";
import { AuthLayout } from "./layouts/auth.layout";
import { ErrorLayout } from "./layouts/error.layout";
import { MainLayout } from "./layouts/main.layout";

const PublicRoutes: RouteObject[] = [
  {
    Component: PublicRoute,
    children: [
      {
        Component: AuthLayout,
        ErrorBoundary: ErrorLayout,
        children: [
          {
            path: PATH.page_auth(),
            lazy: async () => {
              const module = await import("../routes/page-auth");
              return { Component: module.default };
            },
          },
        ],
      },
    ],
  },
];

const PrivateRoutes: RouteObject[] = [
  {
    Component: PrivateRoute,
    children: [
      {
        Component: MainLayout,
        ErrorBoundary: ErrorLayout,
        children: [
          {
            path: PATH.page_root(),
            ErrorBoundary: ErrorLayout,
            lazy: async () => {
              const module = await import("../routes/page-root");
              return { Component: module.default };
            },
          },
          {
            path: PATH.page_one(),
            ErrorBoundary: ErrorLayout,
            lazy: async () => {
              const module = await import("../routes/page-one");
              return { Component: module.default };
            },
          },
          {
            path: PATH.page_two(),
            ErrorBoundary: ErrorLayout,
            lazy: async () => {
              const module = await import("../routes/page-two");
              return { Component: module.default };
            },
          },
        ],
      },
    ],
  },
];

const NotFoundRoutes: RouteObject[] = [
  {
    path: PATH.not_found(), // Wildcard catch-all must be at the end of the root array
    lazy: async () => {
      const module = await import("../routes/not-found");
      return { Component: module.default };
    },
  },
];

export const router = createBrowserRouter([
  ...PublicRoutes,
  ...PrivateRoutes,
  ...NotFoundRoutes,
]);

/* 

currently i am using new way of using react-router version like
Component: PrivateLayout,
lazy: async () => ...

the old way is 

{
  path: "/",
  element: (
    <PublicRoute>
      <AuthLayout />
    </PublicRoute>
  ),
  children: [
    {
      path: PATHS.LOGIN,
      element: <Login />,
    },
  ],
}



| Feature              | `errorElement`                    | `ErrorBoundary`            |
| -------------------- | --------------------------------- | -------------------------- |
| What you pass        | React Element                     | Component Function         |
| Syntax               | `errorElement: <ErrorPage />`     | `ErrorBoundary: ErrorPage` |
| Requires JSX         | Yes                               | No                         |
| Works in `.ts` file  | No (unless `React.createElement`) | Yes                        |
| React Router version | v6.4+                             | Newer preferred API        |


---------------------------------------------------------------------------

# ANCHOR : 2 ways to show the error boundry page data 


# NOTE : WAY-1 inside layout i.e inplace of outlet
 {
        path: PATH.page_two(),
        ErrorBoundary: ErrorLayout,
        lazy: async () => {
          const module = await import("../routes/page-two");
          return { Component: module.default };
        },
      },

---------------------------------------------------------------------------

      # NOTE : WAY-2 replace entire layout with error boundary
       {
    Component: AuthLayout,
    ErrorBoundary: ErrorLayout,
    children: [
      {
        path: PATH.page_auth(),
        lazy: async () => {
          const module = await import("../routes/page-auth");
          return { Component: module.default };
        },
      },
    ],
  },

---------------------------------------------------------------------------

# NOTE : DYNAMIC PAGE TITLES (SEO BEST PRACTICE)
To set browser tab titles dynamically on page transitions, create a custom hook and call it inside your page route components:

```typescript
import { useEffect } from "react";

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const original = document.title;
    document.title = `${title} | My App`;
    return () => {
      document.title = original;
    };
  }, [title]);
}

// In routes/page-one.tsx:
// useDocumentTitle("Analytics Page");
```

---------------------------------------------------------------------------

# NOTE : ROUTE-LEVEL SUSPENSE VS. COMPONENT-LEVEL SKELETONS

1. **Why we place `<Suspense>` at the very top (wrapping `<RouterProvider>`):**
   - **Code Chunk Loading:** Because we lazy-load routes (`lazy: async () => ...`), React Router has to download the page's `.js` chunk file from the server when navigating.
   - **Preventing UI Freezes:** If you click a link and do not have a top-level Suspense boundary, the app will freeze or flicker on the old page until the file download finishes. 
   - **Best Practice:** Wrap the router in `<Suspense fallback={<TopBarProgressBar />} />` so the user gets instant progress feedback when clicking links.

2. **Why we use Component-level skeletons:**
   - **Data Loading:** Once the page code is downloaded and mounted, your API data fetching starts.
   - **Interactive UI:** This is where you render custom skeleton loaders inside your page components while waiting for TanStack Query data, offering a premium and localized loading layout.
 */


