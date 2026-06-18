# Understanding `loader()` + `Route.useLoaderData()` + `useSuspenseQuery()`

This is one of the most important concepts in TanStack Router.

A common misunderstanding is:

```txt
"My component knows the ID.
How does the loader know which data to preload?"
```

The answer is:

```txt
The loader does NOT get information from the component.

The loader runs BEFORE the component is rendered.
```

---

# The Key Idea

When a URL is visited:

```txt
/users/123
```

TanStack Router already knows:

```txt
Current Route
Current Params
Current Search Params
Router Context
```

before any component mounts.

Because of that:

```txt
Loader
↓
already has access to params.id
```

without needing anything from the page component.

---

# Actual Request Flow

Suppose the user navigates to:

```txt
/users/123
```

TanStack Router performs the following steps:

```txt
1. Match Route
   ↓

2. Extract Route Params
   ↓

3. params.id = "123"
   ↓

4. Run Loader
   ↓

5. Loader Uses params.id
   ↓

6. Data Fetched
   ↓

7. Data Stored In Query Cache
   ↓

8. Component Mounts
   ↓

9. useSuspenseQuery Reads Cached Data
```

The important thing to remember:

```txt
The loader already knows the ID before the component exists.
```

---

# Why Is The ID Passed Again Inside useSuspenseQuery()?

A very common question:

```txt
The loader already fetched user 123.

Why do I pass id again inside useSuspenseQuery()?
```

Because TanStack Query identifies data using:

```txt
queryKey
```

Example:

```txt
["user", "123"]
```

The loader:

```txt
Fetches data
Stores it under a query key
```

The component:

```txt
Looks for that same query key
Reads the cached result
```

The component is NOT making another request.

It is simply asking:

```txt
"Do we already have data for user 123?"
```

The answer is:

```txt
Yes
```

because the loader already populated the cache.

---

# Mental Model

Think of the loader as:

```txt
Loader
↓
"Fetch user 123 and place it in cache."
```

Think of the component as:

```txt
Component
↓
"Give me user 123 from cache."
```

The component is not telling the loader what to fetch.

The loader already knew because:

```txt
URL
↓
Route Params
↓
params.id
```

were available before rendering started.

---

# Important Distinction

Incorrect mental model:

```txt
Component
↓
Gets ID
↓
Tells Loader What To Fetch
```

This never happens.

---

Correct mental model:

```txt
URL
↓
Route Match
↓
Params Extracted
↓
Loader Runs
↓
Data Cached
↓
Component Mounts
↓
Component Reads Cache
```

This is how TanStack Router actually works.

---

# What Information Can A Loader Access?

A loader can access:

```txt
Route Params

Search Params

Router Context

Current Location
```

Examples:

```txt
params.id

search.page

search.search

context.queryClient

context.auth

location.pathname
```

This means loaders can make decisions and preload data before any page component renders.

---

# Complete Lifecycle

The complete lifecycle for a typical detail page looks like:

```txt
URL
↓
Route Match
↓
Extract Params
↓
beforeLoad()
↓
loader()
↓
Fetch Data
↓
Populate Query Cache
↓
pendingComponent (if needed)
↓
Component Mounts
↓
useSuspenseQuery()
↓
Reads Cached Data
↓
UI Renders
```

---

# Final Rule To Remember

```txt
Loader Fetches Data

Component Reads Data
```

or

```txt
Loader
↓
Populate Cache

Component
↓
Consume Cache
```

Once this mental model clicks, TanStack Router + TanStack Query becomes much easier to reason about.