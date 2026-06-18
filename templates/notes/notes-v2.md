# React Router vs TanStack Router

## Philosophy

### React Router

Focuses on:

```txt
Routing
Navigation
Loaders
Actions
```

Type safety is limited and often requires manual typing.

---

### TanStack Router

Focuses on:

```txt
Routing
Type Safety
Search Params
Loaders
TanStack Query Integration
```

Everything revolves around strongly typed routes.

---

# Route Definition

## React Router

```tsx
{
  path: "/users/:id",
  Component: UserDetails,
}
```

or

```tsx
<Route
  path="/users/:id"
  element={<UserDetails />}
/>
```

---

## TanStack Router

```tsx
export const Route = createFileRoute(
  "/users/$id"
)({
  component: UserDetails,
});
```

---

# Route Params

URL:

```txt
/users/123
```

---

## React Router

```tsx
import { useParams } from "react-router-dom";

const { id } = useParams();
```

Return type:

```tsx
{
  id?: string;
}
```

Usually requires manual validation.

---

## TanStack Router

```tsx
const { id } = Route.useParams();
```

Return type:

```tsx
{
  id: string;
}
```

Fully typed from route definition.

---

# Search Params

URL:

```txt
/users?search=john&type=active
```

---

## React Router

Read:

```tsx
const [searchParams] =
  useSearchParams();

const search =
  searchParams.get("search");

const type =
  searchParams.get("type");
```

Return:

```tsx
string | null
```

every time.

---

Write:

```tsx
setSearchParams({
  search: "john",
  type: "active",
});
```

---

## TanStack Router

Route:

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

Read:

```tsx
const search = Route.useSearch();
```

Result:

```tsx
{
  search: string;
  type: string;
}
```

Write:

```tsx
navigate({
  search: {
    search: "john",
    type: "active",
  },
});
```

---

# Navigation

## React Router

### Link

```tsx
<Link to="/users">
  Users
</Link>
```

---

### useNavigate

```tsx
const navigate =
  useNavigate();

navigate("/users");
```

---

### Navigate Component

```tsx
<Navigate
  to="/login"
  replace
/>
```

Often used for redirects.

---

## TanStack Router

### Link

```tsx
<Link to="/users">
  Users
</Link>
```

---

### useNavigate

```tsx
const navigate =
  useNavigate();

navigate({
  to: "/users",
});
```

---

### router.navigate

```tsx
router.navigate({
  to: "/users",
});
```

Useful outside React components.

---

### redirect

```tsx
throw redirect({
  to: "/login",
});
```

Common in guards and loaders.

---

# Loader Data

## React Router

Loader:

```tsx
loader: async () => {
  return {
    name: "John",
  };
}
```

Read:

```tsx
const data =
  useLoaderData();
```

---

## TanStack Router

Loader:

```tsx
loader: async () => {
  return {
    name: "John",
  };
}
```

Read:

```tsx
const data =
  Route.useLoaderData();
```

---

# Route Context

## React Router

No route-specific hook.

Usually:

```tsx
Context API
Redux
Zustand
```

---

## TanStack Router

```tsx
const context =
  Route.useRouteContext();
```

Accesses route context directly.

---

# Route Matching

## React Router

```tsx
const match =
  useMatch("/users/:id");
```

---

## TanStack Router

```tsx
const match =
  Route.useMatch();
```

Route-aware and typed.

---

# Common Route Hooks

## React Router

```tsx
useParams()
useSearchParams()
useNavigate()
useLocation()
useLoaderData()
useMatches()
useMatch()
```

---

## TanStack Router

```tsx
Route.useParams()
Route.useSearch()
Route.useLoaderData()
Route.useRouteContext()
Route.useMatch()

useNavigate()
useRouter()
useRouterState()
```

---

# Query Integration

## React Router

Typical pattern:

```tsx
const { id } =
  useParams();

const { data } =
  useSuspenseQuery(
    apiQueries.users.detail(id)
  );
```

No special integration.

---

## TanStack Router

Loader:

```tsx
loader:
  ({ context, params }) =>
    context.queryClient
      .ensureQueryData(
        apiQueries.users.detail(
          params.id
        )
      )
```

Component:

```tsx
const { id } =
  Route.useParams();

const { data } =
  useSuspenseQuery(
    apiQueries.users.detail(id)
  );
```

Perfect prefetch integration.

---

# Guards

## React Router

Common pattern:

```tsx
function PrivateRoute() {
  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
      />
    );
  }

  return <Outlet />;
}
```

---

## TanStack Router

Common pattern:

```tsx
export function PrivateRoute({
  context,
}) {
  if (
    !context.auth
      .isAuthenticated
  ) {
    throw redirect({
      to: "/login",
    });
  }
}
```

---

# Code Splitting

## React Router

Route level:

```tsx
lazy: async () => {
  const module =
    await import(
      "./users"
    );

  return {
    Component:
      module.default,
  };
}
```

Manual.

---

## TanStack Router

Route level:

```txt
Auto Route Splitting
```

via plugin/build tooling.

No manual imports needed.

---

# Component Splitting

Both use React.lazy.

```tsx
const HistoryDrawer =
  lazy(() =>
    import(
      "./HistoryDrawer"
    )
  );
```

with:

```tsx
<Suspense
  fallback={
    <Loading />
  }
>
  <HistoryDrawer />
</Suspense>
```

No difference.

---

# Type Safety

## React Router

```tsx
navigate(
  `/users/${id}`
);
```

No route validation.

---

## TanStack Router

```tsx
navigate({
  to: "/users/$id",

  params: {
    id: "123",
  },
});
```

Compile-time validation.

---

# Search Param Type Safety

## React Router

```tsx
searchParams.get(
  "page"
);
```

Returns:

```tsx
string | null
```

Must manually parse.

---

## TanStack Router

```tsx
const search =
  Route.useSearch();
```

Already validated.

```tsx
search.page
search.type
```

Strongly typed.

---

# Most Common APIs

## React Router Daily Usage

```tsx
useParams()
useSearchParams()
useNavigate()
useLoaderData()

<Link />
<Outlet />
<Navigate />
```

---

## TanStack Router Daily Usage

```tsx
Route.useParams()
Route.useSearch()

useNavigate()

Route.useLoaderData()

useSuspenseQuery()

<Link />
<Outlet />

redirect()
```

---

# Recommended Mental Model

## React Router

```txt
URL
 ↓
useParams

URL Search Params
 ↓
useSearchParams

Loader
 ↓
useLoaderData
```

---

## TanStack Router

```txt
URL Params
 ↓
Route.useParams()

Search Params
 ↓
Route.useSearch()

Loader Data
 ↓
Route.useLoaderData()

Query Cache
 ↓
useSuspenseQuery()
```

---

# Which To Choose?

## React Router

Choose when:

* Small to medium apps
* Simpler requirements
* Team already familiar with React Router
* Type safety is not a major concern

---

## TanStack Router

Choose when:

* Large applications
* CRM/Admin Panels
* Heavy use of TanStack Query
* Strong TypeScript usage
* Complex search params
* Need route-level type safety

Examples:

```txt
Prime Hearing
Fleet Nexa
ERP
CRM
Analytics Dashboards
```

These are ideal candidates for TanStack Router.
