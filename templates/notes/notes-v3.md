# TanStack Router - Advanced / Overlooked APIs

These APIs are not used every day like:

```tsx
Route.useParams()
Route.useSearch()
useNavigate()
```

but become very useful in larger applications.

---

# useRouter()

Provides access to the router instance from inside React components.

```tsx
import { useRouter } from "@tanstack/react-router";

export default function MyPage() {
  const router = useRouter();

  return <></>;
}
```

---

## Common Usage

### Navigate Programmatically

```tsx
router.navigate({
  to: "/users",
});
```

Usually you'll use:

```tsx
const navigate = useNavigate();
```

instead.

But router navigation is useful when you need access to other router APIs as well.

---

### Invalidate Router

Force loaders to rerun.

```tsx
await router.invalidate();
```

Useful after:

```txt
Login
Logout
Location Change
Permission Change
```

Example:

```tsx
const handleLogout = async () => {
  await logout();

  await router.invalidate();
};
```

This causes active route loaders to re-evaluate.

---

### Access Current Router State

```tsx
console.log(router.state);
```

Contains:

```txt
Current Location
Current Matches
Pending Navigation
Loaded Routes
```

Mostly useful for debugging.

---

# useRouterState()

Subscribe to router state updates.

```tsx
import { useRouterState } from "@tanstack/react-router";

const routerState = useRouterState();
```

---

## Example

```tsx
const routerState = useRouterState();

console.log(routerState.location.pathname);
```

Current route:

```txt
/users/123
```

---

## Loading Indicator Example

Global loading bar.

```tsx
const isLoading = useRouterState({
  select: (state) =>
    state.status === "pending",
});
```

Example:

```tsx
return (
  <>
    {isLoading && <TopProgressBar />}
  </>
);
```

Useful for:

```txt
NProgress
Top Loaders
Global Skeletons
```

---

# Route.useRouteContext()

Read route context.

Route Context is provided when creating the router.

Example:

```tsx
const router = createRouter({
  routeTree,
  context: {
    auth,
    queryClient,
  },
});
```

---

Read inside route:

```tsx
const context =
  Route.useRouteContext();
```

Result:

```tsx
context.auth
context.queryClient
```

---

## Example

```tsx
const { auth } =
  Route.useRouteContext();

if (!auth.user) {
  return null;
}
```

---

# Route.useMatch()

Access current route match information.

```tsx
const match = Route.useMatch();
```

Contains information about:

```txt
Route
Params
Search
Location
```

Useful when building:

```txt
Breadcrumbs
Debug Panels
Route-aware Components
```

---

# Route.useLoaderDeps()

Used when route loaders depend on values.

Example:

```tsx
loaderDeps: ({ search }) => ({
  search: search.search,
});
```

Read later:

```tsx
const deps =
  Route.useLoaderDeps();
```

Useful for advanced loader patterns.

Not commonly needed in CRUD applications.

---

# Route.useLoaderData()

Read value returned by loader.

Route:

```tsx
loader: async () => {
  return {
    title: "Users",
  };
}
```

Component:

```tsx
const data =
  Route.useLoaderData();
```

Result:

```tsx
data.title
```

---

## When To Use

Good for:

```txt
Page Metadata
Simple Route Data
Non-query Data
```

---

## When Not To Use

If you're already using:

```tsx
useSuspenseQuery()
```

then usually prefer:

```tsx
Loader
 ↓
ensureQueryData()

Component
 ↓
useSuspenseQuery()
```

to leverage caching and invalidation.

---

# Route.useParams()

Read URL params.

URL:

```txt
/users/123
```

Route:

```txt
/users/$id
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

# Route.useSearch()

Read validated search params.

URL:

```txt
/users?search=john&type=active
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

Fully typed.

---

# Route.useNavigate()

Route-scoped navigation helper.

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

Useful when navigation should stay relative to the current route.

---

# useCanGoBack() (Common Pattern)

TanStack doesn't provide a dedicated hook.

Typical implementation:

```tsx
const canGoBack =
  window.history.length > 1;
```

or

```tsx
router.history.canGoBack()
```

depending on router/history setup.

Useful for:

```txt
Back Buttons
Mobile Navigation
Drawers
```

---

# useMatchRoute()

Check if a route matches.

```tsx
const matchRoute =
  useMatchRoute();
```

Example:

```tsx
const isUsersPage =
  matchRoute({
    to: "/users",
  });
```

Useful for:

```txt
Sidebar Active States
Menu Highlighting
Conditional UI
```

---

# Practical Daily Usage

For most CRM/Admin applications:

```tsx
Route.useParams()
Route.useSearch()

useNavigate()

useSuspenseQuery()

redirect()

<Link />
<Outlet />
```

will cover roughly:

```txt
90% of routing needs
```

---

# APIs Usually Needed Later

As application complexity grows:

```tsx
useRouter()

useRouterState()

Route.useRouteContext()

useMatchRoute()

Route.useLoaderData()
```

become more useful.

---

# Recommended Learning Order

Level 1

```tsx
<Link />
<Outlet />

Route.useParams()

Route.useSearch()

useNavigate()

redirect()
```

---

Level 2

```tsx
Loader

pendingComponent

useSuspenseQuery()

ensureQueryData()
```

---

Level 3

```tsx
useRouter()

useRouterState()

Route.useRouteContext()

useMatchRoute()
```

---

Level 4

```tsx
Custom History

Router Invalidation

Advanced Loader Dependencies

Router State Observers
```

Most enterprise CRUD/CRM applications rarely need to go beyond Level 3.
