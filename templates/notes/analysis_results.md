# Codebase Scaffold Audit & Analysis

This document provides a comprehensive structural and architectural analysis of the scaffold templates in `pejay-ui` (`templates/scaffolds/`). All scaffolds are ready-to-use boilerplate templates designed to be easily injected into react-based projects using the CLI.

---

## 1. Axios Scaffold (`axios-client`)
* **Target Directory**: `src/axios/`
* **Peer Dependencies**: `axios`
* **Files**:
  * `index.ts`: Configures the base `axiosInstance` with a local port 5001 base URL and default configurations.
  * `interceptors.ts`: Configures standard request and response interceptors.
  * `request.ts`: Implements a type-safe wrapper over `axios` queries with customized `CustomAxiosRequestConfig` options (such as `skipErrorToast`).
  * `endpoints.ts`: Declarative endpoint configurations helper (`createResourceEndpoints`).
  * `api/one.api.ts` & `index.ts`: Implements API wrapper services mapping HTTP verbs (GET, POST, PUT, DELETE, and multipart/form-data POST) using endpoints.

### 💡 Notable Architectural Design Patterns
* **Token Injection & Eject Pattern**: Setup function allows on-demand ejection of previous interceptors to prevent interceptor duplication when token state resets.
* **Multipart uploads**: Out-of-the-box helper configuration for `multipart/form-data` uploading.
* **Commented Best Practice Guides**: Includes detailed code comments discussing error handling strategies (global vs. screen-specific alerts like 400 Validation, 422 Forms, 409 Conflicts).

---

## 2. React Router Scaffold (`react-router-client`)
* **Target Directory**: `src/react-router/`
* **Peer Dependencies**: `react-router-dom`
* **Files**:
  * `router/index.ts`: Builds the route hierarchy using the modern object-based router syntax (`createBrowserRouter`).
  * `router/path.ts`: Declares route path constants.
  * `router/guards/private.route.tsx` & `public.route.tsx`: Authentication routing guards.
  * `router/layouts/`: Base layout wrapper components (`auth.layout.tsx`, `error.layout.tsx`, `main.layout.tsx`).
  * `routes/`: Subfolders representing each page boundary with lazy component imports.
  * `hook/useRouterSearch.ts`: Utility hook for robust search parameter reading.

### 💡 Notable Architectural Design Patterns
* **Route Guards without Paths**: Centralizes auth decisions using pathless routes (layout routes) that encapsulate authentication checks before child route components mount.
* **Target Restoration Pattern**: कमेंट-दस्तावेज demonstrates how the private route guard passes `redirectTo` in query parameters, allowing the login flow to restore user navigation state seamlessly.
* **SEO & Static Prerendering (V7)**: Extensive documentation within route components illustrating route meta configurations and Nginx deployment configurations for serving pre-rendered static HTML structures.

---

## 3. Redux Store Scaffold (`redux-store-client`)
* **Target Directory**: `src/redux-store/`
* **Peer Dependencies**: `@reduxjs/toolkit`, `react-redux`, `redux-persist`
* **Files**:
  * `store.ts`: Configures store via `configureStore` with middleware handling to bypass serialization warnings for `redux-persist` actions.
  * `reducers.ts`: Combines slices, setting up selective slice persistence configurations.
  * `slices/`: Example RTK slices (`one.slice.ts` & `two.slice.ts`) containing state declarations, actions, and reducers.
  * `selector/`: Selectors implementing memoized state reading.

### 💡 Notable Architectural Design Patterns
* **Bypassing Redux-Persist Serialization Warnings**: Custom configureStore config overrides standard serialization check constraints to allow redux-persist lifecycle actions (`FLUSH`, `REHYDRATE`, etc.) without throwing warnings.
* **Slice-Level Persistence Configuration**: Configured to show developers how to selectively persist specific slices using `storageLocal` instead of forcing entire store persistence.

---

## 4. RTK Query Scaffold (`rtk-query-client`)
* **Target Directory**: `src/rtk-query/`
* **Peer Dependencies**: `@reduxjs/toolkit`, `react-redux`
* **Files**:
  * `baseApi.ts`: Initial API framework setup using `createApi` and injecting custom base queries.
  * `baseQuery.ts`: Configures base query parameters.
  * `queryTags.ts`: Declarative cache tag declarations.
  * `middlewares.ts`: RTK query middleware definitions.
  * `endpoints/`: Route query endpoint modules.

### 💡 Notable Architectural Design Patterns
* **Centralized Cache Tag Management**: Centralizes tag types in a single array mapping configuration to prevent magic strings and cache invalidation issues.
* **Ready-to-Plug Store Middleware**: Clear documentation showing how to connect RTK Query's reducer and middleware inside the primary Redux root store.

---

## 5. TanStack Query Scaffold (`tanstack-query-client`)
* **Target Directory**: `src/tanstack-query/`
* **Peer Dependencies**: `@tanstack/react-query`
* **Files**:
  * `client.ts`: Configures a custom type-safe `apiClient` wrapper around the web fetch API.
  * `api-base.ts`: Standard configuration settings.
  * `api-queries.ts` / `api-mutations.ts`: API query hooks.
  * `module/`: Modular services, mutations, queries, mappers, and cache keys configuration.

### 💡 Notable Architectural Design Patterns
* **Type-Safe API Wrapper Client**: Provides custom `.get()`, `.post()`, `.put()`, `.patch()`, and `.delete()` wrappers on `fetch` with automated JSON serialization guards.
* **Separation of Concerns**: Structures files with clean mappers (decoupling API responses from UI representations) and query key factories (avoiding string typos).

---

## 6. TanStack Router Scaffold (`tanstack-router-client`)
* **Target Directory**: `src/tanstack-router/`
* **Peer Dependencies**: `@tanstack/react-router`
* **Files**:
  * `router.ts`: Initializes Tanstack `createRouter` and configures defaults.
  * `routes/`: File-based route trees (`__root.tsx`, `_app.tsx`, `_auth.tsx`).
  * `layout/`: UI layouts (`app.layout.tsx`, `auth.layout.tsx`, etc.).
  * `page/`: Visual target pages.

### 💡 Notable Architectural Design Patterns
* **Intent-Based Preloading**: Uses `defaultPreload: "intent"` to preload route bundles and datasets immediately when a user hovers over a link, maximizing perceived UI responsiveness.
* **TypeScript Route Declaration Merging**: Employs TypeScript interface merging (`Register`) to ensure global route tree parameters are fully typed across the application.

---

## 🛠️ Verification & Quality Assessment

* **Relative Imports**: All internal template files reference other module files using relative imports (`./` or `../`). They do not depend on absolute webpack/vite aliases (e.g. `@/`), making them immediately compatible with any folder structure they are copied into.
* **Code Cleanliness**: Types are cleanly defined, variables are appropriately scoped, and hooks clean up event listeners on unmount.
* **Documentation Quality**: Comments explain the architectural "Why" (e.g., Suspense vs Component Skeletons, SEO Nginx server setup) instead of just repeating what the code does. This is extremely helpful for developers installing these scaffolds.
