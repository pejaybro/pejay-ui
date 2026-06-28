# Tooltip Overlay Component

A standalone utility wrapper to show visual popover info bubbles when hovering over any child element.

---

## Usage

```tsx
import { Tooltip } from "@/pejay-ui/components/overlays/tooltip";

<Tooltip content="Upload CSV data file" placement="bottom">
  <button className="p-2 border rounded">Upload</button>
</Tooltip>
```

---

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | — | The target element that triggers the tooltip on hover. |
| `content` | `string` | — | Text inside the tooltip bubble. |
| `placement` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Tooltip popover alignment relative to the trigger. |
| `className` | `string` | — | Additional CSS classes for custom visual overrides. |
