# Zustand Store Scaffold

A structured Zustand setup for React apps. Stores are created through a single `createStore` helper that composes middleware from options — no manual `persist(immer(devtools(...)))` nesting.

Install via CLI (once registered):

```bash
npx pjdev2d-cli add zustand-client
```

Files land in `src/zustand/`.

---

## Folder Structure

```
zustand/
├── core/
│   ├── create-store.ts    # Composes middleware from options
│   ├── middleware.ts        # Atomic Zustand wrappers
│   ├── reset-store.ts       # Global reset registry
│   ├── selectors.ts         # useShallow + pickState helpers
│   ├── storage.ts           # local / session / custom persist storage
│   └── index.ts
├── stores/
│   ├── auth.store.ts        # persist → localStorage
│   ├── theme.store.ts       # persist → localStorage, survives logout
│   ├── draft.store.ts       # persist → sessionStorage demo
│   ├── one.store.ts         # Non-persisted session store
│   └── ui.store.ts          # Selector / re-render demo store
├── hooks/
│   ├── useOne.ts            # Optional convenience hook
│   └── useUi.ts             # Selector pattern examples
├── index.ts                 # Public exports
└── README.md
```

| Layer | Purpose |
|-------|---------|
| `core/` | Infrastructure — edit rarely |
| `stores/` | Business stores — edit often |
| `hooks/` | Reusable selector bundles for components |

---

## How It Works (Big Picture)

```
Component
    ↓ calls hook / store action
stores/*.store.ts
    ↓ uses
core/create-store.ts
    ↓ composes
core/middleware.ts  →  zustand create()
    ↓ auto-registers
core/reset-store.ts
```

**Key idea:** Developers write store logic + an options object. `create-store.ts` handles middleware order and reset registration internally.

---

## `core/create-store.ts` — The Heart

### What it does

1. Takes your state + actions function
2. Takes an options object (`persist`, `devtools`, `immer`)
3. Composes middleware in a fixed order
4. Returns a Zustand hook (e.g. `useAuthStore`)
5. Optionally registers a reset function when `resetOnLogout: true`

### Options

```typescript
type CreateStoreOptions = {
  name: string;              // required — persist key + devtools name
  persist?: boolean;         // enable persistence
  storage?: "local" | "session" | PersistStorage; // default: "local"
  devtools?: boolean;        // Redux DevTools integration
  immer?: boolean;           // draft-style state updates
  resetOnLogout?: boolean;   // reset on logout (default: false)
};
```

### Per-store storage (`storage` option)

Only applies when `persist: true`. Default is `"local"` (localStorage).

| Value | Browser API | When to use |
|-------|-------------|-------------|
| `"local"` | `localStorage` | Auth, theme, preferences — survives browser restart |
| `"session"` | `sessionStorage` | Form drafts, wizard steps — cleared when tab closes |
| custom `PersistStorage` | Your adapter | IndexedDB, cookies, encrypted storage |

```typescript
// localStorage (default)
createStore(initializer, { name: "auth", persist: true, storage: "local" });

// sessionStorage
createStore(initializer, { name: "draft", persist: true, storage: "session" });

// omit storage — same as "local"
createStore(initializer, { name: "theme", persist: true });
```

### Middleware order (fixed)

Applied inside → out:

```
your logic  →  immer  →  persist  →  devtools  →  create()
```

Order is fixed so every store behaves consistently. Developers never choose the order manually.

### Example

```typescript
export const useAuthStore = createStore<AuthState>(
  (set) => ({
    user: null,
    login: (user) => set({ user }),
    logout: () => resetAllStores(),
  }),
  {
    name: "auth",
    persist: true,
    devtools: true,
    immer: true,
  },
);
```

Equivalent manual Zustand (what you **don't** have to write):

```typescript
create(
  devtools(
    persist(
      immer((set) => ({ ... })),
      { name: "auth" }
    ),
    { name: "auth" }
  )
);
```

---

## `core/middleware.ts` — Atomic Wrappers Only

Each function wraps **one** Zustand middleware:

| Helper | Zustand middleware | Purpose |
|--------|-------------------|---------|
| `withDevtools(fn, name)` | `devtools` | Debug in Redux DevTools |
| `withPersist(fn, name)` | `persist` | Save state to `localStorage` |
| `withImmer(fn)` | `immer` | Mutate draft state safely |

**Rule:** No combination helpers like `withPersistImmer()`. Combinations don't scale. Only `create-store.ts` composes them.

---

## `core/reset-store.ts` — Selective Reset on Logout

### Problem

On logout you need to clear **session** stores (auth, cached API data) but keep **preference** stores (theme, drafts, UI settings) in `localStorage`.

### Solution

Only stores with `resetOnLogout: true` register a reset callback:

```typescript
// Inside create-store.ts (when resetOnLogout: true)
registerReset(options.name, () => {
  store.setState(initialState, true);
});
```

### Usage

```typescript
// auth.store.ts
logout: () => resetStoresOnLogout(),
```

### Which stores reset?

| Store | `persist` | `storage` | `resetOnLogout` | On logout |
|-------|-----------|-----------|-----------------|-----------|
| `auth` | ✅ | `local` | ✅ | `user → null` in localStorage |
| `one` | ❌ | — | ✅ | Memory cleared |
| `theme` | ✅ | `local` | ❌ | Unchanged in localStorage |
| `draft` | ✅ | `session` | ❌ | Unchanged until tab closes |

### Flow

```
User clicks Logout
    → logout() runs
    → resetStoresOnLogout()
    → only resetOnLogout: true stores reset
    → auth.user = null, one.oneData = null
    → theme stays "dark" in localStorage ✅

User logs in again
    → auth restored from login action
    → theme rehydrates from localStorage automatically
```

Persisted stores with `resetOnLogout: false` are never touched on logout. Zustand `persist` rehydrates them from `localStorage` on every page load.

### Debug which stores will reset

```typescript
import { getLogoutResetStoreNames } from "@/zustand";

getLogoutResetStoreNames(); // ["auth", "one"]
```

---

## Example Stores

### `stores/auth.store.ts` — Persisted

| Option | Value | Why |
|--------|-------|-----|
| `persist` | `true` | Keep user logged in across page refresh |
| `devtools` | `true` | Debug auth flow |
| `immer` | `true` | Safe nested updates if user object grows |
| `resetOnLogout` | `true` | Clear session on logout |

```typescript
const user = useAuthStore((s) => s.user);
const login = useAuthStore((s) => s.login);
const logout = useAuthStore((s) => s.logout);

login({ id: "1", name: "Jane", email: "jane@example.com" });
logout(); // clears auth + one only — theme survives
```

### `stores/theme.store.ts` — Persisted, Survives Logout

| Option | Value | Why |
|--------|-------|-----|
| `persist` | `true` | Save theme to localStorage |
| `devtools` | `true` | Debug |
| `resetOnLogout` | `false` | Keep theme after logout |

```typescript
const theme = useThemeStore((s) => s.theme);
const toggleTheme = useThemeStore((s) => s.toggleTheme);

// User sets dark mode → logout → login again → still dark
```

### `stores/one.store.ts` — Non-Persisted

| Option | Value | Why |
|--------|-------|-----|
| `devtools` | `true` | Debug data fetching |
| `persist` | `false` | Fresh data on each session |
| `resetOnLogout` | `true` | Clear cached data on logout |

Mirrors the Redux `one.slice` pattern: `oneData`, `status`, `isLoading`, `isError`, `error`, `meta`.

```typescript
const oneData = useOneStore((s) => s.oneData);
const setOne = useOneStore((s) => s.setOne);
const setIsLoading = useOneStore((s) => s.setIsLoading);
```

#### Async fetch (no thunks needed)

Add async actions directly in the store:

```typescript
fetchOne: async () => {
  set({ isLoading: true, status: oneStatus.loading });
  try {
    const res = await fetch("/api/one");
    const data = await res.json();
    set({ oneData: data, isLoading: false, status: oneStatus.success });
  } catch (e) {
    set({
      isError: true,
      error: String(e),
      status: oneStatus.error,
      isLoading: false,
    });
  }
},
```

Unlike Redux, async logic lives inside the store — no `createAsyncThunk` or extra reducers.

---

## `hooks/useOne.ts` — Optional Convenience Hook

Bundles common selectors so components don't repeat them:

```typescript
const { oneData, isLoading, setOne } = useOne();
```

Equivalent to:

```typescript
const oneData = useOneStore((s) => s.oneData);
const isLoading = useOneStore((s) => s.isLoading);
const setOne = useOneStore((s) => s.setOne);
```

Create similar hooks (`useAuth`, `useUi`) when multiple components need the same bundle of state + actions.

---

## `core/selectors.ts` + `stores/ui.store.ts` — Avoiding Unnecessary Re-renders

Zustand re-renders a component when the **value returned by your selector** changes (`Object.is` compare).

### The problem

```typescript
// ❌ BAD — new object every render → re-renders every time
const { sidebarOpen, modalOpen } = useUiStore((s) => ({
  sidebarOpen: s.sidebarOpen,
  modalOpen: s.modalOpen,
}));
```

Even if `sidebarOpen` and `modalOpen` did not change, the selector returns a **new object reference**, so React re-renders anyway.

### The fix — `useShallow`

```typescript
import { useUiStore, useShallow } from "@/zustand";

// ✅ GOOD — re-renders only when sidebarOpen OR modalOpen actually change
const { sidebarOpen, modalOpen } = useUiStore(
  useShallow((s) => ({
    sidebarOpen: s.sidebarOpen,
    modalOpen: s.modalOpen,
  })),
);
```

### `pickState` helper — cleaner multi-field picks

```typescript
import { useUiStore, useShallow, pickState } from "@/zustand";

const { activePanel, notificationsCount } = useUiStore(
  useShallow(pickState(["activePanel", "notificationsCount"])),
);
```

### When to use what

| Pattern | Use when | Avoid when |
|---------|----------|------------|
| `(s) => s.oneField` | Single field needed | You need 5+ fields (too many subscriptions) |
| `useShallow` + object | Multiple fields, one subscription | Only 1 field — plain selector is simpler |
| Separate selectors per field | 2–3 fields, max clarity | Many fields — verbose |
| `useUiShell()` hook | Same bundle reused across components | One-off read in a single component |
| `useUiStore()` no selector | Never in production UI | Always — re-renders on every store change |

### `ui.store.ts` demo store

| Field | Purpose |
|-------|---------|
| `sidebarOpen` | Layout flag — updates often |
| `modalOpen` | Overlay flag |
| `searchOpen` | Search bar toggle |
| `activePanel` | Which side panel is open |
| `notificationsCount` | Badge count |

`resetOnLogout: true` — UI state clears on logout (fresh shell per session).

### Ready-made hooks (`hooks/useUi.ts`)

```typescript
import {
  useSidebarOpen,   // Pattern A — single field
  useUiShell,         // Pattern B — useShallow object
  useUiPanelState,  // Pattern C — useShallow + pickState
  useUiModal,         // Pattern D — separate selectors
} from "@/zustand";

function Sidebar() {
  const sidebarOpen = useSidebarOpen();
  return <aside className={sidebarOpen ? "open" : "closed"} />;
}

function AppShell() {
  const { sidebarOpen, modalOpen, searchOpen } = useUiShell();
  // only re-renders when one of these three changes
}
```

---

## Using Stores in Components

### Selective subscribe (recommended)

Only re-renders when the selected slice changes:

```typescript
const user = useAuthStore((s) => s.user);
const sidebarOpen = useUiStore((s) => s.sidebarOpen);
```

### Multiple fields — use `useShallow`

```typescript
const { sidebarOpen, modalOpen } = useUiStore(
  useShallow((s) => ({ sidebarOpen: s.sidebarOpen, modalOpen: s.modalOpen })),
);
```

### Full store subscribe (avoid in hot paths)

Re-renders on **any** state change:

```typescript
const { user, login, logout } = useAuthStore(); // subscribes to everything
```

### No Provider needed

Unlike Redux, Zustand needs no `<Provider>`. Import the hook and use it anywhere.

---

## Creating a New Store

1. Create `stores/theme.store.ts`:

```typescript
import { createStore } from "../core/create-store";

type ThemeState = {
  theme: "light" | "dark";
  toggleTheme: () => void;
};

export const useThemeStore = createStore<ThemeState>(
  (set) => ({
    theme: "light",
    toggleTheme: () =>
      set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
  }),
  {
    name: "theme",
    persist: true,
    devtools: true,
  },
);
```

2. Export from `index.ts`:

```typescript
export { useThemeStore } from "./stores/theme.store";
```

3. Use in a component:

```typescript
import { useThemeStore } from "@/zustand";

const theme = useThemeStore((s) => s.theme);
const toggleTheme = useThemeStore((s) => s.toggleTheme);
```

Reset is automatic — `logout()` via `resetAllStores()` clears it too.

---

## Choosing Store Options

| `persist` | `storage` | `resetOnLogout` | Example |
|------------|-----------|-----------------|---------|
| Auth / session | ✅ | `local` | ✅ | `auth.store.ts` |
| Theme / preferences | ✅ | `local` | ❌ | `theme.store.ts` |
| Form drafts / wizard | ✅ | `session` | ❌ | `draft.store.ts` |
| UI / modals | ❌ | — | ✅ | `ui.store.ts` |
| API / fetched data | ❌ | — | ✅ | `one.store.ts` |

**Rule of thumb:**
- `persist: true` + `storage: "local"` → survives browser restart
- `persist: true` + `storage: "session"` → tab-scoped only
- `persist: true` + `resetOnLogout: false` → survives logout
- `resetOnLogout: true` → cleared on `resetStoresOnLogout()` (logout)

---

## Zustand vs Redux Scaffold (This Project)

| Redux | Zustand equivalent |
|-------|-------------------|
| `store.ts` + `Provider` | Not needed |
| `slices/one.slice.ts` | `stores/one.store.ts` |
| `createAsyncThunk` | Async function inside store |
| `useSelector` | `useStore((s) => s.field)` |
| `useDispatch` | Call action from store directly |
| `redux-persist` | `persist: true` option |
| Combine reducers | Each store is independent |

---

## Public API (`index.ts`)

```typescript
import {
  createStore,
  resetStoresOnLogout,
  useAuthStore,
  useOneStore,
  useThemeStore,
  useUiStore,
  useShallow,
  pickState,
  useUiShell,
  oneStatus,
} from "@/zustand";
```

| Export | Description |
|--------|-------------|
| `createStore` | Factory to create new stores |
| `resetStoresOnLogout` | Reset only `resetOnLogout: true` stores |
| `resetAllStores` | Alias for `resetStoresOnLogout` |
| `getLogoutResetStoreNames` | List stores that reset on logout |
| `useShallow` | Shallow compare for multi-field selectors |
| `pickState` | Build a selector that picks keys by name |
| `CreateStoreOptions` | Options type |
| `useAuthStore` | Auth hook |
| `useOneStore` | One data hook |
| `useThemeStore` | Theme hook (survives logout) |
| `useUiStore` | UI shell hook (selector demo) |
| `useUiShell` | Pre-built shallow selector for layout flags |
| `useSidebarOpen` | Single-field selector example |
| `oneStatus` | Status constants |
| `OneStatus` | Status type |
| `UiPanel` | UI panel type |
| `User` | Auth user type |

---

## Quick Reference

```bash
# Install (when registered in CLI)
npx pjdev2d-cli add zustand-client
```

```typescript
// Create store
createStore(initializer, { name: "my-store", persist: true, devtools: true });

// Read one field
const value = useMyStore((s) => s.value);

// Read multiple fields (shallow)
const { a, b } = useMyStore(useShallow((s) => ({ a: s.a, b: s.b })));

// Update state
useMyStore.getState().setValue("hello");

// Logout — reset session stores only (auth, one, etc.)
resetStoresOnLogout();
```

---

## Edge Cases & Production Notes

Things to be aware of when using this scaffold in real apps.

### SSR / Next.js

`localStorage` and `sessionStorage` do not exist on the server. Persisted stores will fail or behave unexpectedly during server-side rendering.

- Use stores only inside **`"use client"`** components (Next.js App Router).
- Do not call `useAuthStore` or other persisted hooks in Server Components.
- For SSR-heavy apps, consider a custom storage adapter with `typeof window !== "undefined"` guards, or skip persist on the server and rehydrate on the client.

### Rehydration flash

Persisted stores load from storage **asynchronously**. On the first render you may briefly see default state before stored data appears:

```
user: null  →  (flash)  →  user: { name: "Jane" }
```

Wait for hydration before rendering auth-gated UI:

```typescript
const hasHydrated = useAuthStore.persist?.hasHydrated?.();

if (!hasHydrated) {
  return null; // or a loading skeleton
}

const user = useAuthStore((s) => s.user);
```

This is normal Zustand persist behavior, not a bug in the template.

### Unique `name` per store

The `name` option is used as:

- The **persist key** in `localStorage` / `sessionStorage`
- The **Redux DevTools** store label
- The **logout reset registry** key

Two stores with the same `name` will collide in storage and reset logic. Always use a unique `name` per store (e.g. `"auth"`, `"theme"`, `"draft"`).

### `immer` peer dependency

Stores with `immer: true` (e.g. `auth.store.ts`) rely on Zustand's immer middleware, which requires the `immer` package:

```bash
npm install immer
```

Install it in your app when you use `immer: true` in any store options.

### `localStorage` security

Do **not** store sensitive data in persisted stores without careful consideration:

| OK in persist | Avoid in persist |
|---------------|------------------|
| Theme preference | Auth tokens / JWT |
| UI layout flags | API secrets |
| Non-sensitive user profile (name, avatar) | Passwords, refresh tokens |

`localStorage` is readable by any script on the page (XSS risk). Prefer **httpOnly cookies** for tokens. If you persist auth state, store only what is safe to expose client-side, and keep tokens out of Zustand persist when possible.

### JSON serialization limits

Browser storage only holds JSON-serializable data. These do not round-trip correctly:

- `Date` objects (become strings — parse manually after rehydrate)
- `Map`, `Set`, `undefined`
- Functions (actions are recreated from your store initializer — not loaded from storage)

Keep persisted state as plain objects, strings, numbers, and booleans.


