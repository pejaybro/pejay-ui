# Custom Scrollbar & Global Smooth Scroll Provider

This module provides two complementary ways to add **smooth lerp-momentum scrolling** and **auto-vanishing floating scrollbars** — for both **vertical and horizontal** axes — to any React + Tailwind CSS application:

1. **`<CustomScrollArea>`** — Local component wrapper for specific containers (sidebars, modal bodies, dropdowns, code viewers, etc.).
2. **`<GlobalScrollProvider>`** — App-wide provider called **once** in `App.tsx` that automatically injects smooth scrolling and floating scrollbars into every scrollable element (pages, modals, popups, dropdowns, context menus, portals) with **zero JSX wrapping**.

Both components automatically show a vertical bar when content overflows vertically, a horizontal bar when content overflows horizontally, or both simultaneously with a corner gap applied automatically.

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

Wrap your root component once inside `App.tsx`:

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
    <CustomScrollArea>
      <div>Your long scrollable content here...</div>
    </CustomScrollArea>
  );
}
```

#### **Component Wrapper Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `hideDelay` | `number` | `1800` | Idle time (ms) before scrollbar fades out |
| `fadeDurationMs` | `number` | `700` | Fade transition opacity duration (ms) |
| `thumbWidth` | `string` | `"w-1.5"` | Tailwind class for vertical thumb thickness |
| `thumbHoverWidth` | `string` | `"w-2"` | Vertical thumb thickness when hovered or dragging |
| `thumbColor` | `string` | `"bg-chalk-40"` | Tailwind color class for idle thumb |
| `thumbHoverColor` | `string` | `"bg-chalk-70"` | Tailwind color class when hovered or dragging |
| `smoothWheel` | `boolean` | `true` | Enables silky 60fps lerp momentum wheel scrolling |

---

## 3. Scrolling Behaviour

| Input | Result |
| :--- | :--- |
| Mouse wheel (`deltaY`) | Vertical scroll |
| Trackpad two-finger swipe (`deltaX`) | Horizontal scroll |
| `Shift` + Mouse wheel | Horizontal scroll |
| Drag vertical thumb | Vertical scroll (1:1 direct) |
| Drag horizontal thumb | Horizontal scroll (1:1 direct) |

Both bars auto-appear on scroll or mouse-move and fade out after `hideDelay` ms of idle. Hovering or dragging a thumb keeps it visible and expands it slightly for easier grab.

When both axes are scrollable at the same time, a corner gap is applied automatically so the two thumbs never overlap.
