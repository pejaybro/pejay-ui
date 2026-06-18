# TanStack Router Learning Roadmap

This document summarizes everything covered so far and acts as a long-term reference for deciding what to learn, what to use, and what to avoid.

---

# Section 1 - Topics Covered vs Topics Remaining

## ✅ Topics Covered

### Routing Fundamentals

```txt
File-Based Routing

Root Route

Route Hierarchy

Layouts

Nested Routes

Auth Layout

Main Layout

Error Layout

Outlet
```

---

### Navigation

```txt
<Link />

useNavigate()

router.navigate()

redirect()

Route.useNavigate()
```

---

### Route Parameters

```txt
Route.useParams()

Dynamic Routes

$id Routes
```

Examples:

```txt
/users/$id

/patients/$id

/invoices/$id
```

---

### Search Parameters

```txt
validateSearch()

Route.useSearch()

Search Param Navigation

Typed Search Params
```

Examples:

```txt
?page=1

?search=john

?status=active
```

---

### Route Guards

```txt
beforeLoad()

Public Route

Private Route

Auth Checks

Permission Checks
```

---

### Data Loading

```txt
loader()

ensureQueryData()

Route.useLoaderData()

loaderDeps()
```

---

### TanStack Query Integration

```txt
useSuspenseQuery()

Query Prefetching

Query Cache

Loader + Query Integration
```

---

### Loading States

```txt
pendingComponent

pendingMs

pendingMinMs
```

---

### Context

```txt
createRootRouteWithContext()

Route.useRouteContext()
```

---

### Router Utilities

```txt
useRouter()

useRouterState()

router.invalidate()

useMatchRoute()
```

---

### Code Splitting

```txt
Auto Route Splitting

React.lazy()

Suspense

Manual Component Splitting
```

---

### Error Handling

```txt
errorComponent

notFoundComponent
```

---

## 🔶 Topics Remaining

These are useful but not required for most CRM/Admin projects.

### SSR

```txt
TanStack Start

Hydration

Dehydration

Streaming
```

Useful for:

```txt
Marketing Sites

SEO Driven Apps

Public Facing Platforms
```

---

### Route Masking

```txt
Modal URLs

Overlay URLs

Wizard URLs
```

Rarely needed.

---

### View Transitions

```txt
Animated Route Transitions
```

Nice UX feature.

Not business critical.

---

### Custom History

```txt
Memory History

Hash History

Custom Browser History
```

Mostly niche.

---

### Advanced Route Preloading

```txt
router.preloadRoute()

Preload Strategies
```

Performance optimization.

---

# Section 2 - Must Know vs Can Skip

## Must Know

These will be used almost daily.

### Core Routing

```txt
File-Based Routing

Layouts

Outlet

Nested Routes
```

---

### Navigation

```txt
<Link />

useNavigate()

redirect()
```

---

### Route Data

```txt
Route.useParams()

Route.useSearch()

validateSearch()
```

---

### Authentication

```txt
beforeLoad()

Public Routes

Private Routes
```

---

### Query Integration

```txt
loader()

ensureQueryData()

useSuspenseQuery()
```

---

### Loading States

```txt
pendingComponent
```

---

### Context

```txt
createRootRouteWithContext()
```

---

## Learn Soon

Useful in medium to large applications.

```txt
Route.useRouteContext()

router.invalidate()

useRouter()

useRouterState()

loaderDeps()

notFoundComponent()
```

---

## Can Skip Initially

You may never need these.

```txt
Route Masking

Custom History

View Transitions

SSR

Streaming

Hydration

Dehydration
```

Learn only if a project demands it.

---

# Section 3 - Feature Usage By Project Type

## CRM / Admin Panel

Examples:

```txt
Prime Hearing

Fleet Nexa

ERP

Internal Dashboard
```

Recommended:

```txt
File Routing

beforeLoad()

Route.useParams()

Route.useSearch()

validateSearch()

loader()

ensureQueryData()

useSuspenseQuery()

pendingComponent()

createRootRouteWithContext()

router.invalidate()
```

Avoid:

```txt
SSR

Streaming

Route Masking
```

Usually unnecessary.

---

## Basic CRUD App

Examples:

```txt
Task Manager

Inventory App

Simple Employee App
```

Recommended:

```txt
File Routing

Route.useParams()

useNavigate()

useSuspenseQuery()
```

Optional:

```txt
loader()

ensureQueryData()
```

Avoid:

```txt
Complex Context Setup

Route Masking

Advanced Router State
```

---

## Large Enterprise App

Examples:

```txt
ERP

Multi-Tenant SaaS

Healthcare Platform

Finance Platform
```

Recommended:

```txt
Everything From CRM Section

+
loaderDeps()

useRouterState()

useMatchRoute()

Route Preloading

Permission-Based beforeLoad()
```

---

## Public Website

Examples:

```txt
Marketing Website

Landing Pages

Documentation Site
```

Recommended:

```txt
SSR

Streaming

Hydration

Route Preloading
```

TanStack Router alone is usually not enough.

Consider:

```txt
TanStack Start
Next.js
```

depending on requirements.

---

# Section 4 - Features That Are Commonly Overused

These are powerful but often unnecessary.

---

## Overusing Loaders

Bad:

```txt
Every Route Has Loader
```

Good:

```txt
Loader Only When Data Is Needed Before Render
```

---

## Overusing Context

Bad:

```txt
Everything In Router Context
```

Good:

```txt
Auth

Query Client

Core Application Services
```

Only.

---

## Overusing Search Params

Bad:

```txt
Every Form State In URL
```

Good:

```txt
Pagination

Filtering

Sorting

Search
```

Only store sharable page state.

---

## Overusing Manual Code Splitting

Bad:

```txt
Split Every Component
```

Good:

```txt
Large Drawers

Charts

Editors

PDF Viewers
```

Let route splitting handle most cases.

---

## Overusing useRouterState

Bad:

```txt
Tracking Everything Through Router State
```

Good:

```txt
Global Loading

Route Analytics

Navigation Monitoring
```

---

## Overusing beforeLoad

Bad:

```txt
API Calls

Business Logic

Complex Data Processing
```

Good:

```txt
Authentication

Authorization

Route Entry Checks
```

---

# Section 5 - My Recommended Architecture

For your style of projects:

```txt
src/
├─ routes/
├─ pages/
├─ layouts/
├─ components/
├─ services/
├─ queries/
├─ mutations/
├─ mappers/
└─ router/
```

---

Routes:

```txt
Only Routing Logic
```

Example:

```txt
loader()

beforeLoad()

validateSearch()

pendingComponent()
```

---

Pages:

```txt
UI + Query Usage
```

Example:

```txt
Route.useParams()

Route.useSearch()

useSuspenseQuery()
```

---

Services:

```txt
API Calls Only
```

---

Queries:

```txt
queryOptions()

Query Keys

Query Factories
```

---

# Section 6 - What Makes TanStack Router Worth It?

If someone asked:

```txt
Why not stay with React Router?
```

My answer would be:

```txt
Typed Params

Typed Search Params

beforeLoad()

Route Context

Query Integration

File Routing

Auto Route Splitting
```

These features remove a lot of boilerplate that tends to accumulate in larger React Router applications.

---

# Final Advice

Master these first:

```txt
1. File Routing

2. Layout Hierarchy

3. beforeLoad()

4. Route.useParams()

5. Route.useSearch()

6. validateSearch()

7. loader()

8. ensureQueryData()

9. useSuspenseQuery()

10. pendingComponent()

11. createRootRouteWithContext()
```

If you can comfortably build a CRUD screen using those 11 concepts, you're already operating at a level where most real-world TanStack Router applications will feel familiar.

Everything beyond that should be learned when a project actually requires it, not because the feature exists.
