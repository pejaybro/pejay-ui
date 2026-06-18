# TanStack Router Notes

## Navigation APIs

### `<Link>`

Use when navigation is triggered by user interaction.

```tsx
<Link to="/users">
  Users
</Link>
```

Benefits:

* Accessible
* Supports Ctrl+Click / Open in New Tab
* Preferred for menus and navigation links
* Supports prefetching in TanStack Router

Use for:

* Sidebar items
* Navbar links
* Menu navigation

---

### `useNavigate()`

Use when navigation happens from code.

```tsx
const navigate = useNavigate();

navigate({
  to: "/users",
});
```

Common use cases:

* Login success
* Form submit
* Search/filter actions
* Button click navigation

Example:

```tsx
const handleLogin = async () => {
  await login();

  navigate({
    to: "/dashboard",
  });
};
```

---

### `router.navigate()`

Use outside React components.

```tsx
router.navigate({
  to: "/login",
});
```

Useful in:

* Utility functions
* Services
* Auth helpers

Example:

```tsx
export async function logout(router: Router) {
  localStorage.removeItem("token");

  router.navigate({
    to: "/login",
  });
}
```

---

### `redirect()`

Used inside:

* loader
* beforeLoad
* guards

Example:

```tsx
throw redirect({
  to: "/login",
});
```

Common auth guard pattern:

```tsx
export function PrivateRoute({ context }) {
  if (!context.auth.isAuthenticated) {
    throw redirect({
      to: "/login",
    });
  }
}
```

---

## Quick Navigation Rules

```txt
User clicks link?
    -> <Link>

Code decides navigation?
    -> useNavigate()

Outside React component?
    -> router.navigate()

Guard/Loader blocks access?
    -> redirect()
```

---

# Code Splitting

## What Is Code Splitting?

Without splitting:

```txt
main.js
├── Dashboard
├── Users
├── Reports
├── Settings
└── Modals
```

Everything downloads immediately.

---

With splitting:

```txt
main.js
users.chunk.js
reports.chunk.js
settings.chunk.js
history-drawer.chunk.js
```

Files download only when needed.

Benefits:

* Smaller initial bundle
* Faster first load
* Better performance
* Better Lighthouse scores

---

# Auto Route Splitting

Handled by TanStack Router.

Routes become separate chunks automatically.

Example:

```txt
/users
/reports
/settings
```

Each route gets its own JS chunk.

Advantages:

* Almost zero setup
* Recommended approach
* Easy maintenance

---

# Manual Component Splitting

Useful for large components inside a route.

Example:

```tsx
import { lazy } from "react";

const HistoryDrawer = lazy(
  () => import("./HistoryDrawer")
);
```

Render:

```tsx
<Suspense fallback={<div>Loading...</div>}>
  <HistoryDrawer />
</Suspense>
```

---

## Good Candidates For Manual Splitting

* Rich Text Editors
* PDF Viewers
* Maps
* Analytics Charts
* Large Modals
* Drawers
* Multi-step Wizards

Examples:

```tsx
const PdfViewer = lazy(() => import("./PdfViewer"));
const NotesDrawer = lazy(() => import("./NotesDrawer"));
const AnalyticsChart = lazy(() => import("./AnalyticsChart"));
```

---

## Bad Candidates

Avoid splitting:

* Button
* Input
* Small Forms
* Small Cards
* Table Rows

The overhead usually outweighs the benefits.

---

## CRM Recommendation

For projects like:

* Prime Hearing
* Fleet Nexa

Use:

```txt
Auto Route Splitting -> YES

Manual Splitting ->
Only for heavy components
```

---

# Suspense + React.lazy

Example:

```tsx
const HistoryDrawer = lazy(
  () => import("./HistoryDrawer")
);

<Suspense fallback={<DrawerSkeleton />}>
  <HistoryDrawer />
</Suspense>
```

Flow:

```txt
Component requested
    ↓
Chunk not downloaded
    ↓
Fallback shown
    ↓
Chunk arrives
    ↓
Component renders
```

Works exactly the same in:

* React Router
* TanStack Router

---

# Route.useLoaderData()

Purpose:

Read data returned by a route loader.

---

## Example

Route:

```tsx
export const Route = createFileRoute("/users/$id")({
  loader: async ({ params }) => {
    return {
      id: params.id,
      name: "John",
    };
  },

  component: UserPage,
});
```

Component:

```tsx
export default function UserPage() {
  const data = Route.useLoaderData();

  return (
    <>
      <div>{data.id}</div>
      <div>{data.name}</div>
    </>
  );
}
```

---

## Loader Flow

```txt
Navigate
    ↓
Run Loader
    ↓
Store Result
    ↓
Render Component
    ↓
useLoaderData()
```

---

# Loader + TanStack Query

Common pattern:

```tsx
loader: ({ context, params }) =>
  context.queryClient.ensureQueryData(
    apiQueries.users.detail(params.id)
  )
```

Then component:

```tsx
const { id } = Route.useParams();

const { data } = useSuspenseQuery(
  apiQueries.users.detail(id)
);
```

---

## Why Not Use useLoaderData Here?

Because TanStack Query already provides:

* Cache
* Refetching
* Invalidation
* Mutations
* Background updates

Loader simply pre-populates the cache.

---

# Route Hooks Cheat Sheet

## URL Params

```tsx
const { id } = Route.useParams();
```

Reads:

```txt
/users/123
```

Result:

```tsx
id = "123"
```

---

## Search Params

```tsx
const search = Route.useSearch();
```

Reads:

```txt
/users?search=john&type=active
```

Result:

```tsx
{
  search: "john",
  type: "active"
}
```

---

## Loader Data

```tsx
const data = Route.useLoaderData();
```

Reads:

```tsx
return {...}
```

from the route loader.

---

## Query Data

```tsx
const { data } = useSuspenseQuery(...)
```

Reads:

```txt
TanStack Query Cache
```

and provides caching, invalidation, refetching, and mutations.

---

# Mental Model

```txt
Route.useParams()
    ↓
URL Params

Route.useSearch()
    ↓
URL Search Params

Route.useLoaderData()
    ↓
Loader Return Value

useSuspenseQuery()
    ↓
TanStack Query Cache
```

For CRUD/CRM projects, the most common combination is:

```tsx
Route.useParams()
Route.useSearch()
useSuspenseQuery()
```

with loaders used primarily for prefetching query data.
