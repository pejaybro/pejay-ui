# TanStack Router - Advanced Features & Overlooked APIs

This document covers TanStack Router features that are often missed during the initial learning phase but become extremely valuable in medium-to-large applications.

---

# 1. beforeLoad()

One of the most important TanStack Router features.

Runs before:

```txt
Component Render
Loader Execution
Route Entry
```

Example:

```tsx
export const Route = createFileRoute("/_app")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
      });
    }
  },
});
```

---

## Common Uses

```txt
Authentication
Authorization
Feature Flags
Role Checks
Tenant Validation
Subscription Checks
```

---

## Benefits

```txt
✓ Prevents unnecessary API calls
✓ Prevents component mounting
✓ Centralized access control
✓ Better than component-level guards
```

---

# 2. createRootRouteWithContext()

Provides globally typed router context.

Example:

```tsx
interface RouterContext {
  auth: AuthStore;
  queryClient: QueryClient;
}
```

Root Route:

```tsx
export const Route =
  createRootRouteWithContext<
    RouterContext
  >()({
    component: RootLayout,
  });
```

---

## Why Use It?

Provides type-safe access to:

```txt
Authentication
Query Client
API Services
Application Services
```

throughout your routing tree.

---

# 3. Route.useRouteContext()

Read router context inside a route.

Example:

```tsx
const context =
  Route.useRouteContext();
```

Access:

```tsx
context.auth
context.queryClient
```

---

## Use Cases

```txt
Current User
Permissions
Query Client Access
Application Services
```

---

# 4. Route.useParams()

Read route parameters.

Route:

```txt
/users/$id
```

URL:

```txt
/users/123
```

Usage:

```tsx
const { id } =
  Route.useParams();
```

Result:

```tsx
id === "123"
```

---

## Common Usage

```txt
Detail Pages
Edit Pages
Nested Resources
```

Examples:

```txt
/patient/123
/invoice/456
/user/789
```

---

# 5. Route.useSearch()

Read validated search parameters.

URL:

```txt
/users?search=john&type=active
```

Validation:

```tsx
validateSearch: (search) => ({
  search:
    typeof search.search === "string"
      ? search.search
      : "",

  type:
    typeof search.type === "string"
      ? search.type
      : "",
})
```

Usage:

```tsx
const search =
  Route.useSearch();
```

Result:

```tsx
{
  search: "john",
  type: "active",
}
```

---

## Why It's Powerful

After validation:

```tsx
search.search
search.type
```

are fully typed.

No:

```tsx
searchParams.get()
Number()
Boolean()
```

scattered across components.

---

# 6. Route.useLoaderData()

Reads the value returned by a route loader.

Route:

```tsx
loader: async () => {
  return {
    title: "Users",
  };
}
```

Usage:

```tsx
const data =
  Route.useLoaderData();
```

Result:

```tsx
data.title
```

---

## Best For

```txt
Page Metadata
Simple Route Data
Configuration Data
Non-Query Information
```

---

## Usually Not Needed When Using TanStack Query

Preferred pattern:

```txt
Loader
 ↓
ensureQueryData()

Component
 ↓
useSuspenseQuery()
```

This leverages:

```txt
Caching
Invalidation
Refetching
Mutations
```

---

# 7. useRouter()

Access the router instance.

Example:

```tsx
const router =
  useRouter();
```

---

## Common Uses

### Navigation

```tsx
router.navigate({
  to: "/users",
});
```

### Reload Route Data

```tsx
await router.invalidate();
```

### Access Router State

```tsx
router.state
```

---

# 8. router.invalidate()

Forces active route loaders to rerun.

Example:

```tsx
await router.invalidate();
```

---

## Useful After

```txt
Login
Logout
Location Change
Role Change
Permission Updates
```

Think:

```txt
QueryClient.invalidateQueries()

but for route loaders.
```

---

# 9. useRouterState()

Subscribe to router state updates.

Example:

```tsx
const state =
  useRouterState();
```

---

## Global Loading Indicator

```tsx
const isPending =
  useRouterState({
    select: (state) =>
      state.status === "pending",
  });
```

Usage:

```tsx
{
  isPending &&
  <TopLoader />
}
```

---

## Great For

```txt
Progress Bars
Global Skeletons
Route Loading Indicators
Analytics Tracking
```

---

# 10. loaderDeps()

Specify values that should trigger loader re-execution.

Example:

```tsx
loaderDeps: ({ search }) => ({
  search: search.search,
  page: search.page,
})
```

---

## Why Use It?

Without it:

```txt
Search Changes
 ↓
Loader Might Not Rerun
```

With it:

```txt
Search Changes
 ↓
Loader Reruns
```

---

## Best For

```txt
Tables
Filters
Pagination
Search Screens
```

---

# 11. Route.useNavigate()

Route-scoped navigation helper.

Example:

```tsx
const navigate =
  Route.useNavigate();
```

Usage:

```tsx
navigate({
  search: {
    page: 2,
  },
});
```

---

## Best For

```txt
Updating Search Params
Relative Navigation
Pagination
Filtering
```

---

# 12. useMatchRoute()

Determine if a route matches.

Example:

```tsx
const matchRoute =
  useMatchRoute();
```

Usage:

```tsx
const isUsersPage =
  matchRoute({
    to: "/users",
  });
```

---

## Great For

```txt
Sidebar Active States
Menu Highlighting
Conditional UI
```

---

# 13. Route Preloading

Manual route prefetching.

Example:

```tsx
router.preloadRoute({
  to: "/reports",
});
```

or

```tsx
<Link
  to="/reports"
  preload="intent"
/>
```

---

## Benefit

```txt
Hover Link
 ↓
Route Downloads
 ↓
Instant Navigation
```

---

# 14. pendingComponent

Route-level loading UI.

Example:

```tsx
export const Route =
  createFileRoute("/users")({
    pendingComponent:
      UsersSkeleton,
  });
```

Shown while:

```txt
Loader Running
Route Loading
Navigation Pending
```

---

# 15. pendingMs

Delay pendingComponent appearance.

Example:

```tsx
pendingMs: 300
```

Behavior:

```txt
<300ms
 ↓
No Skeleton

>300ms
 ↓
Show Skeleton
```

---

## Prevents

```txt
Loading Flicker
```

for very fast requests.

---

# 16. pendingMinMs

Minimum display duration for pendingComponent.

Example:

```tsx
pendingMinMs: 500
```

Behavior:

```txt
Skeleton Appears
 ↓
Remains Visible For 500ms
 ↓
Content Displays
```

---

## Prevents

```txt
Flashy Loading States
```

---

# 17. notFoundComponent

Route-specific 404 handling.

Example:

```tsx
export const Route =
  createFileRoute("/users")({
    notFoundComponent:
      UserNotFound,
  });
```

---

## Great For

```txt
Patient Not Found
Invoice Not Found
User Not Found
Record Not Found
```

---

# 18. Search Param Validation

One of TanStack Router's strongest features.

Example:

```tsx
validateSearch: (search) => ({
  page:
    Number(search.page ?? 1),

  search:
    typeof search.search === "string"
      ? search.search
      : "",
})
```

---

## Benefit

After validation:

```tsx
const search =
  Route.useSearch();
```

Result:

```tsx
search.page
search.search
```

are already typed.

---

# Recommended Learning Order

## Level 1 - Daily Usage

```tsx
<Link />
<Outlet />

Route.useParams()

Route.useSearch()

useNavigate()

redirect()
```

---

## Level 2 - Most Useful Features

```tsx
beforeLoad()

loader()

pendingComponent

ensureQueryData()

useSuspenseQuery()
```

---

## Level 3 - Intermediate

```tsx
createRootRouteWithContext()

Route.useRouteContext()

useRouter()

useRouterState()

router.invalidate()
```

---

## Level 4 - Advanced

```tsx
loaderDeps()

useMatchRoute()

Route Preloading

pendingMs

pendingMinMs

notFoundComponent
```

---

# Features That Usually Win Over React Router Users

```txt
1. Route.useSearch() + validateSearch()

2. beforeLoad()

3. createRootRouteWithContext()

4. Route.useParams()

5. Automatic Route Type Safety
```

These are typically the features that make larger TanStack Router applications feel significantly cleaner and easier to maintain than equivalent React Router implementations.
