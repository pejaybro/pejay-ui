# Spinner Loading Component

A versatile suite of 9 distinct SVG and HTML loader animation styles with size scaling presets.

---

## Installation

```bash
npx pejay-ui add spinner
```

---

## Usage

All variants dynamically inherit their color from their text color context using `currentColor` classes (so placing `<Spinner />` inside a primary button will automatically color it white/blue).

```tsx
import { Spinner } from "@/pejay-ui/components/spinner";

// Classic loading ring (Default)
<Spinner variant="ring" size="md" />

// Three pulsing dots
<Spinner variant="dots" size="sm" />

// Dual circular ripple wave
<Spinner variant="ripple" size="lg" className="text-violet-600" />
```

---

## Component API Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **`variant`** | `"ring" \| "dots" \| "pulse" \| "bars" \| "orbit" \| "ripple" \| "dots-ring" \| "dots-step" \| "text-dots"` | `"ring"` | The layout structure and animation keyframe preset style. |
| **`size`** | `"sm" \| "md" \| "lg"` | `"md"` | Standard scaling presets: `sm` (16px), `md` (24px), `lg` (36px). |
| **`className`** | `string` | — | Additional CSS classes for color inheritance or custom styling. |

---

## Edge Cases & Best Practices

1. **Color Visibility:**
   * *Edge Case:* Spinners inherit their color via `currentColor`. If placed inside an element with no text color defined on a dark or colored backdrop, the spinner may become invisible.
   * *Solution:* Explicitly apply a text color class to the spinner or its parent container (e.g. `text-white` or `className="text-sky-500"`).
2. **Layout Sizing & Shift:**
   * *Edge Case:* Swapping layout text directly with a spinner can trigger layout changes if sizes are not fixed.
   * *Solution:* Align spinners inside fixed-height flex containers (like the `h-9 inline-flex` button) to guarantee smooth, jitter-free loading transitions.
