# Popover Overlay Component

A floating popover container built on Floating UI. Anchor custom filter cards, settings menus, mini-modals, or action lists to any button or trigger element.

---

## Usage

```tsx
import { Popover } from "@/pejay-ui/components/overlays/popover";

<Popover
  placement="bottom"
  content={
    <div className="p-3 w-56 flex flex-col gap-2">
      <h4 className="text-xs font-semibold">Filter Settings</h4>
      <p className="text-[11px] text-slate-400">Configure your options.</p>
    </div>
  }
>
  <button className="px-3 py-1.5 border rounded-lg text-xs">Open</button>
</Popover>
```

---

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode \| ((props) => ReactNode)` | — | The trigger element. |
| `content` | `ReactNode \| ((props) => ReactNode)` | — | Content rendered inside the floating card. |
| `placement` | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | Desired alignment (auto-flips if screen space is constrained). |
| `offset` | `number` | `8` | Spacing between trigger and popover in px. |
| `isOpen` | `boolean` | — | Controlled open state. |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial open state. |
| `onOpenChange` | `(open: boolean) => void` | — | Callback fired when open state changes. |
| `closeOnInsideClick` | `boolean` | `false` | Auto-close when clicking an item inside the popover. |
| `usePortal` | `boolean` | `true` | Render inside a React portal. |
| `className` | `string` | — | Additional CSS classes for popover container. |
