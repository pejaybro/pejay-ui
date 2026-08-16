# Popover Overlay Component

A versatile, floating popover container built on Floating UI. Anchor custom filter cards, settings menus, interactive mini-modals, or action lists to any button or trigger element.

---

## Features

- **Smart Edge Detection & Auto-Flip**: Automatically detects screen boundaries. If opened with `bottom` placement but hits the bottom edge of the viewport, it flips seamlessly to open `top`.
- **Dynamic Placements**: Supports `top`, `bottom`, `left`, and `right` alongside aligned variants (`bottom-start`, `bottom-end`, etc.).
- **Click-Outside & Escape Dismissal**: Automatically closes when clicking outside or pressing Escape.
- **Portal Rendering**: Uses `FloatingPortal` by default to render outside parent DOM trees, avoiding clipping issues in `overflow: hidden` containers.
- **Render Props Support**: Exposes `{ close, open, toggle, isOpen }` to both the trigger and popover content for easy close buttons and conditional states.
- **Controlled & Uncontrolled**: Use standalone with zero configuration or control open state externally via `isOpen` and `onOpenChange`.

---

## 1. Quick Start

```tsx
import { Popover } from "@/pejay-ui/components/overlays";

export function SimpleExample() {
  return (
    <Popover
      placement="bottom"
      content={
        <div className="p-4 w-64 flex flex-col gap-2">
          <h4 className="text-sm font-semibold">Settings</h4>
          <p className="text-xs text-slate-400">Configure your table preferences.</p>
        </div>
      }
    >
      <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium">
        Open Popover
      </button>
    </Popover>
  );
}
```

---

## 2. Component Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode \| ((props: PopoverRenderProps) => ReactNode)` | — | The trigger element that opens/toggles the popover. |
| `content` | `ReactNode \| ((props: PopoverRenderProps) => ReactNode)` | — | Content rendered inside the floating card. |
| `placement` | `"top" \| "bottom" \| "left" \| "right" \| "bottom-start" \| ...` | `"bottom"` | Desired alignment relative to the trigger. |
| `direction` | `"top" \| "bottom" \| "left" \| "right" \| ...` | `"bottom"` | Alias for `placement`. |
| `offset` | `number` | `8` | Gap in pixels between the trigger and the popover. |
| `isOpen` | `boolean` | — | Controlled open state. |
| `defaultOpen` | `boolean` | `false` | Initial open state when uncontrolled. |
| `onOpenChange` | `(open: boolean) => void` | — | Callback fired when the open state changes. |
| `disabled` | `boolean` | `false` | Disables toggle interactions. |
| `showArrow` | `boolean` | `false` | Renders an indicator arrow pointing at the trigger. |
| `usePortal` | `boolean` | `true` | Renders floating popover inside a React Portal. |
| `modal` | `boolean` | `false` | Traps focus inside the popover like a dialog. |
| `closeOnInsideClick` | `boolean` | `false` | Automatically closes when any element inside the popover is clicked. |
| `fullWidth` | `boolean` | `false` | Stretches trigger wrapper to `w-full`. |
| `className` | `string` | — | Custom Tailwind / CSS classes for the popover container. |
| `wrapperClassName` | `string` | — | Custom CSS classes for the trigger wrapper element. |

---

## 3. Render Props Interface (`PopoverRenderProps`)

When passing a function as `children` or `content`, you receive:

```ts
interface PopoverRenderProps {
  close: () => void;   // Closes the popover
  open: () => void;    // Opens the popover
  toggle: () => void;  // Toggles the popover open state
  isOpen: boolean;     // Current open state
}
```

---

## 4. Examples & Use Cases

### A. Filter & Settings Dropdown Card

Use `content` with an interactive card to build table filters, date presets, or mini forms:

```tsx
import { useState } from "react";
import { Filter, Check } from "lucide-react";
import { Popover } from "@/pejay-ui/components/overlays";

export function TableFilterPopover() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <Popover
      placement="bottom-start"
      content={({ close }) => (
        <div className="p-3 w-64 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
            <span className="text-xs font-semibold text-white">Filter Categories</span>
            <button
              onClick={close}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Done
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {["All", "Groceries", "Transport", "Utilities"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <span>{cat}</span>
                {selectedCategory === cat && <Check size={13} className="text-blue-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    >
      {({ isOpen }) => (
        <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${isOpen ? "border-blue-500 text-blue-400 bg-blue-500/10" : "border-slate-700 text-slate-300"}`}>
          <Filter size={13} />
          <span>Filters ({selectedCategory})</span>
        </button>
      )}
    </Popover>
  );
}
```

---

### B. Action Menu (Auto-close on Click)

Pass `closeOnInsideClick={true}` to automatically dismiss the popover when a menu option is selected:

```tsx
import { MoreVertical, Edit2, Trash2, Share2 } from "lucide-react";
import { Popover } from "@/pejay-ui/components/overlays";

export function ActionMenu() {
  return (
    <Popover
      placement="bottom-end"
      closeOnInsideClick
      content={
        <div className="py-1 min-w-[140px] flex flex-col">
          <button
            onClick={() => console.log("Edit")}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Edit2 size={13} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => console.log("Share")}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>
          <button
            onClick={() => console.log("Delete")}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      }
    >
      <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
        <MoreVertical size={16} />
      </button>
    </Popover>
  );
}
```

---

### C. Direction Options (`top`, `bottom`, `left`, `right`)

```tsx
<Popover placement="top" content={<p className="p-2 text-xs">Opens Top</p>}>
  <button>Top</button>
</Popover>

<Popover placement="bottom" content={<p className="p-2 text-xs">Opens Bottom</p>}>
  <button>Bottom</button>
</Popover>

<Popover placement="left" content={<p className="p-2 text-xs">Opens Left</p>}>
  <button>Left</button>
</Popover>

<Popover placement="right" content={<p className="p-2 text-xs">Opens Right</p>}>
  <button>Right</button>
</Popover>
```
