# TanStack Router + TanStack Query Integration

This document covers:

```txt
Loader
ensureQueryData()
useSuspenseQuery()
pendingComponent
Complete Route Lifecycle
```

These concepts are the foundation of most production TanStack Router applications.

---

# Why Use Loaders With TanStack Query?

Without a loader:

```txt
Navigate
 ↓
Component Mounts
 ↓
useSuspenseQuery()
 ↓
Request Starts
 ↓
Data Arrives
```

The request only starts after the component renders.

---

With a loader:

```txt
Navigate
 ↓
Loader Runs First
 ↓
Query Starts
 ↓
Data Cached
 ↓
Component Mounts
```

The route prepares data before rendering.

---

# ensureQueryData()

The most common loader pattern.

Example:

```tsx
export const Route = createFileRoute(
  "/_app/users/$id"
)({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      apiQueries.users.detail(params.id)
    ),

  component: UserDetails,
});
```

---

## What Does It Do?

Think:

```txt
If Data Exists In Cache
 ↓
Return Cached Data

Else
 ↓
Fetch Data
 ↓
Save To Cache
 ↓
Return Data
```

---

## Benefits

```txt
✓ Uses Query Cache

✓ Avoids Duplicate Requests

✓ Faster Navigation

✓ Works With Suspense

✓ Integrates Naturally With Mutations
```

---

# Complete Example

Query Factory:

```tsx
export const userQueries = {
  detail: (id: string) =>
    queryOptions({
      queryKey: ["user", id],

      queryFn: () =>
        UserService.getById(id),
    }),
};
```

---

Route:

```tsx
export const Route = createFileRoute(
  "/_app/users/$id"
)({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      userQueries.detail(params.id)
    ),

  component: UserDetails,
});
```

---

Component:

```tsx
export default function UserDetails() {
  const { id } =
    Route.useParams();

  const { data } =
    useSuspenseQuery(
      userQueries.detail(id)
    );

  return (
    <div>
      {data.name}
    </div>
  );
}
```

---

# Important Question

Why call:

```tsx
useSuspenseQuery(
  userQueries.detail(id)
)
```

again inside the component?

Didn't the loader already fetch the data?

---

Answer:

```txt
Loader
 ↓
Puts Data Into Cache

Component
 ↓
Reads Data From Cache
```

No second request occurs.

The component is simply reading cached data.

---

# Request Lifecycle

First Visit:

```txt
Navigate
 ↓
Loader Runs
 ↓
ensureQueryData()
 ↓
API Request
 ↓
Query Cache Updated
 ↓
Component Mounts
 ↓
useSuspenseQuery()
 ↓
Reads Cache
```

---

Second Visit:

```txt
Navigate
 ↓
Loader Runs
 ↓
Cache Already Exists
 ↓
No Request
 ↓
Component Mounts
 ↓
useSuspenseQuery()
 ↓
Reads Cache
```

---

# pendingComponent

Provides route-level loading UI.

Example:

```tsx
export const Route = createFileRoute(
  "/_app/users/$id"
)({
  pendingComponent:
    UserSkeleton,

  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      userQueries.detail(params.id)
    ),

  component: UserDetails,
});
```

---

# What Happens?

```txt
Navigate
 ↓
Loader Starts
 ↓
Data Not Ready
 ↓
pendingComponent Appears
 ↓
Data Arrives
 ↓
Real Component Renders
```

---

# Why Suspense Works So Well Here

Component:

```tsx
const { data } =
  useSuspenseQuery(
    userQueries.detail(id)
  );
```

Normally Suspense would wait for the query.

But:

```txt
Loader
 ↓
Already Loaded Query
 ↓
Cache Ready
 ↓
Suspense Instantly Resolves
```

Meaning:

```txt
Less Loading
Less Flicker
Better UX
```

---

# useQuery vs useSuspenseQuery

## useQuery

```tsx
const {
  data,
  isLoading,
  error,
} = useQuery(
  userQueries.detail(id)
);
```

Requires handling:

```tsx
if (isLoading) {
  return <Loader />;
}
```

---

## useSuspenseQuery

```tsx
const { data } =
  useSuspenseQuery(
    userQueries.detail(id)
  );
```

No:

```tsx
isLoading
```

No:

```tsx
if (loading)
```

No:

```tsx
if (data)
```

Suspense guarantees data exists.

---

# Typical TanStack Router Setup

Route:

```tsx
export const Route = createFileRoute(
  "/_app/users/$id"
)({
  pendingComponent:
    UserSkeleton,

  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      userQueries.detail(params.id)
    ),

  component: UserDetails,
});
```

---

Component:

```tsx
export default function UserDetails() {
  const { id } =
    Route.useParams();

  const { data } =
    useSuspenseQuery(
      userQueries.detail(id)
    );

  return (
    <div>{data.name}</div>
  );
}
```

This is probably the most common enterprise TanStack Router pattern.

---

# When To Use Route.useLoaderData()

Example:

```tsx
loader: async () => ({
  pageTitle: "Users",
});
```

Component:

```tsx
const data =
  Route.useLoaderData();
```

Good for:

```txt
Metadata
Configuration
Simple Route Information
```

---

# When To Use useSuspenseQuery()

Good for:

```txt
API Data
Server Data
CRUD Screens
Tables
Detail Pages
Dashboards
```

---

# Complete Mental Model

```txt
URL
 ↓
Route Match
 ↓
beforeLoad()
 ↓
loader()
 ↓
ensureQueryData()
 ↓
Query Cache Filled
 ↓
pendingComponent
 ↓
Component Mounts
 ↓
useSuspenseQuery()
 ↓
Reads Cached Data
```

---

# Recommended Pattern For CRM Apps

```tsx
beforeLoad()
```

for:

```txt
Auth
Permissions
Roles
```

---

```tsx
loader()
```

for:

```txt
Prefetching Queries
```

---

```tsx
ensureQueryData()
```

for:

```txt
Cache Population
```

---

```tsx
pendingComponent()
```

for:

```txt
Page Skeletons
```

---

```tsx
useSuspenseQuery()
```

for:

```txt
Reading Data
```

---

# Final Rule

If a page needs server data:

```txt
Route
 ↓
loader()
 ↓
ensureQueryData()
 ↓
useSuspenseQuery()
```

If a page only needs route information:

```txt
Route
 ↓
loader()
 ↓
Route.useLoaderData()
```

This distinction alone will help keep TanStack Router applications clean and predictable.
