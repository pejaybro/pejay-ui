# Button & Tooltip Components

A highly flexible button component with built-in loading states, visual style presets (variants), size options, prefix/suffix icon slots, and hover tooltip support.

---

## 1. Button Usage & API

```tsx
import { Button } from "@/pejay-ui/components/button";

// Basic Button
<Button onClick={handleClick}>Click Me</Button>

// Custom Styling & Icons
<Button variant="danger" size="lg" icon={TrashIcon} loading={isDeleting}>
  Delete Record
</Button>
```

### Component Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | — | Text or elements inside the button. |
| `variant` | `ButtonVariant` | `"primary"` | Visual preset theme style. (See options below) |
| `rounded` | `"none" \| "sm" \| "md" \| "lg" \| "full"` | `"lg"` | Controls the button border radius. |
| `disableHoverEffect` | `boolean` | `false` | Removes hover/active style transforms (keeps it static). |
| `isLoading` | `boolean` | `false` | Displays a loading spinner and disables clicks. |
| `loader` | `ReactNode` | — | Custom loading component override. |
| `fullWidth` | `boolean` | `false` | Sets button width to `w-full` (100% parent container width). |
| `tooltipContent` | `ReactNode \| string` | — | Display a hover tooltip panel with this content. |

---

## 2. Visual Variants & Color Palette Reference

We categorize button variants into 3 distinct styling structures. Colors are predefined and tailored for dark/light contrast:

### A. Solid Variants (Filled background, white/black text)
* **`primary`** : Sky Blue (`bg-sky-500` $\rightarrow$ hover `bg-sky-600` $\rightarrow$ active `bg-sky-700`)
* **`danger`** : Red (`bg-red-600` $\rightarrow$ hover `bg-red-700` $\rightarrow$ active `bg-red-800`)
* **`success`** : Emerald (`bg-emerald-600` $\rightarrow$ hover `bg-emerald-700` $\rightarrow$ active `bg-emerald-800`)
* **`warning`** : Amber (`bg-amber-500` $\rightarrow$ hover `bg-amber-600` $\rightarrow$ active `bg-amber-700`)
* **`black`** : Black (`bg-black` $\rightarrow$ hover `bg-black/80` $\rightarrow$ active `bg-black/70`)
* **`white`** : White (`bg-white`, text black $\rightarrow$ hover `bg-white/80` $\rightarrow$ active `bg-white/70`)

---

### B. Soft Variants (Always-visible colored tint background + matching text color)
*Soft variants use `bg-current` opacity mappings, meaning the background tint color automatically inherits and matches the text color:*
* **`primary-soft`** / **`soft`** : Sky Blue text + 10% opacity Sky Blue background.
* **`danger-soft`** : Red text + 10% opacity Red background.
* **`success-soft`** : Emerald text + 10% opacity Emerald background.
* **`warning-soft`** : Amber text + 10% opacity Amber background.
* **`black-soft`** : Black text + 10% opacity Black background.
* **`white-soft`** : White text + 10% opacity White background.

---

### C. Ghost Variants (Transparent background $\rightarrow$ fades in soft tint on hover)
* **`primary-ghost`** : Sky Blue text.
* **`danger-ghost`** : Red text.
* **`success-ghost`** : Emerald text.
* **`warning-ghost`** : Amber text.
* **`black-ghost`** : Black text.
* **`white-ghost`** : White text.

---

## 3. Tooltip Component

A standalone utility to show extra info bubbles on hover for any parent component.

```tsx
import { Tooltip } from "@/pejay-ui/components/overlays/tooltip";

<Tooltip content="Upload CSV file" placement="bottom">
  <div className="p-2 border rounded">Hover Over Me</div>
</Tooltip>
```
