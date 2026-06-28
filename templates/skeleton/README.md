# Skeleton Shimmer Loader Component

A fluid skeleton component with built-in shimmery transitions to represent load state structures.

---

## Installation

```bash
npx pejay-ui add skeleton
```

---

## Usage

```tsx
import { Skeleton } from "@/pejay-ui/components/skeleton";

// 1. Circle skeleton placeholder (e.g. Profile Avatar)
<Skeleton variant="circle" width={48} height={48} />

// 2. Text line skeleton (default width 75%)
<Skeleton variant="text" />

// 3. Rectangular block (e.g. Card Preview container)
<Skeleton variant="rect" width="100%" height={200} />
```

---

## Component API Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **`variant`** | `"text" \| "circle" \| "rect"` | `"rect"` | Mapped preset shape. |
| **`width`** | `string \| number` | — | Direct width style (e.g. `'100%'`, `'48px'`, or `48` for px value). |
| **`height`** | `string \| number` | — | Direct height style (e.g. `'16px'`, or `16` for px value). |
| **`className`** | `string` | — | Custom Tailwind class overrides. |

---

## Edge Cases & Best Practices

1. **Accessibility (Screen Readers):**
   * *Edge Case:* Screen readers will try to read empty skeleton elements or interpret their background animations as text contents.
   * *Solution:* The Skeleton component includes `aria-hidden="true"` by default to ensure screen readers skip loading skeletons, maintaining screen reader accessibility clean.
2. **Cumulative Layout Shift (CLS):**
   * *Edge Case:* If the loaded content has different sizes or margins than the placeholder skeleton, elements on the screen will shift abruptly when loading finishes.
   * *Solution:* Always match the `width` and `height` properties of your skeletons exactly to the sizes of the components they represent.
3. **Responsive Fluid Widths:**
   * *Edge Case:* Hardcoded pixel widths might overflow container boundaries on mobile devices.
   * *Solution:* Pass responsive class names (e.g. `className="w-full md:w-48"`) instead of fixed `width` properties where layout widths need to adapt dynamically.
