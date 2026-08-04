# Custom Scrollbar & Global Smooth Scroll Provider

This component module provides two complementary ways to add **smooth momentum scrolling** and **auto-vanishing floating scrollbars** to any React + Tailwind CSS application:

1. **`<CustomScrollArea>`**: Local component wrapper for specific containers (e.g. sidebars, modal bodies, dropdowns, code viewers).
2. **`<GlobalScrollProvider>`**: App-wide provider called ONCE in `App.tsx` that automatically injects smooth scrolling into 100% of scrollable elements (pages, modals, popups, dropdowns, context menus, portals) with ZERO JSX wrapping.

---

## 1. CRITICAL STEP: Native Scrollbar Suppression CSS

### **Why this CSS is Important:**
Native browser scrollbars (WebKit / Firefox) render their own rigid scrollbar tracks. To allow custom floating scrollbars or global momentum providers to render cleanly without double scrollbars or flickering, you **MUST** suppress native scrollbars in your project's main stylesheet.

### **Where to place this CSS:**
Paste the snippet below into your main CSS file (e.g. `src/index.css` or `src/style/scrollbar.css`):

```css
/* ─────────────────────────────────────────────────────────────
   GLOBAL NATIVE SCROLLBAR SUPPRESSION (Required for pejay-ui scrollbars)
   Hides native browser scrollbars app-wide so custom scrollbars
   and smooth momentum providers can render cleanly.
   ───────────────────────────────────────────────────────────── */

* {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

*::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}
```

---

## 2. Usage Instructions

### **A. Using the Global Provider (Recommended — Call ONCE in `App.tsx`)**

Wrap your root component ONCE inside `App.tsx`:

```tsx
import { RouterProvider } from "react-router-dom";
import { GlobalScrollProvider } from "@/src/pejay-ui/components";

function App() {
  return (
    <GlobalScrollProvider>
      <RouterProvider router={router} />
    </GlobalScrollProvider>
  );
}

export default App;
```

#### **Global Provider Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `hideDelay` | `number` | `1800` | Delay (ms) before auto-hiding scrollbar when idle |
| `fadeDurationMs` | `number` | `700` | Fade transition opacity duration (ms) |

---

### **B. Using the Local Component Wrapper (`<CustomScrollArea>`)**

Wrap any specific scrollable container directly:

```tsx
import { CustomScrollArea } from "@/src/pejay-ui/components";

function MyPage() {
  return (
    <CustomScrollArea className="h-96 w-full p-4">
      <div>Your long scrollable content here...</div>
    </CustomScrollArea>
  );
}
```

#### **Component Wrapper Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `hideDelay` | `number` | `1800` | Idle time (ms) before fade-out |
| `fadeDurationMs` | `number` | `700` | Fade transition opacity duration (ms) |
| `thumbWidth` | `string` | `"w-1.5"` | Tailwind class for default thumb width |
| `thumbHoverWidth` | `string` | `"w-2"` | Tailwind class for hovered/dragged thumb width |
| `thumbColor` | `string` | `"bg-chalk-40"` | Tailwind color class for thumb |
| `thumbHoverColor` | `string` | `"bg-chalk-70"` | Tailwind color class when hovered |
| `smoothWheel` | `boolean` | `true` | Enables silky 60fps lerp momentum wheel scrolling |
