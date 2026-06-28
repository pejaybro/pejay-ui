# Hotkeys Overlay & Event Manager

A general-purpose, dynamic keyboard shortcut manager for React. It automatically handles platform normalization (e.g. converting `ctrl` to `⌘` on macOS) and ignores triggers while typing in form fields by default. It also features a built-in help overlay (triggered by `Shift + ?`) that dynamically catalogs every hotkey currently active in your application tree.

---

## Installation & Setup

1. Add the component via CLI:
   ```bash
   npx pejay-ui add hotkeys
   ```

2. Wrap your application layout inside `HotkeyProvider`:
   ```tsx
   import { HotkeyProvider } from "@/pejay-ui/hotkeys";

   export default function App() {
     return (
       <HotkeyProvider>
         <YourApp />
       </HotkeyProvider>
     );
   }
   ```

---

## Defining Your Own Key Combinations

You register shortcuts inside any functional component using the `useHotkey` hook. The registration automatically cleans up (unmounts) when the hosting component unmounts.

```tsx
import { useHotkey } from "@/pejay-ui/hotkeys";

export function SalesDashboard() {
  useHotkey("ctrl+s", (event) => {
    // 1. The callback initiates your action
    console.log("Triggered custom dashboard save!");
  }, {
    category: "Dashboard Actions", // Visual category grouping in the help overlay
    description: "Save dashboard layout"
  });

  return <div>Sales Dashboard</div>;
}
```

---

## Triggering Button Clicks via Hotkeys

When connecting a hotkey to a button, you have two options depending on your setup:

### Option A — Call the click handler directly (Recommended)
Trigger the function logic directly without worrying about the DOM:

```tsx
import { useHotkey } from "@/pejay-ui/hotkeys";

export function SaveDashboardPage() {
  const handleSave = () => {
    console.log("Saving dashboard data...");
  };

  // Directly call the handler function in the callback
  useHotkey("ctrl+s", () => handleSave(), {
    category: "Dashboard",
    description: "Save dashboard data"
  });

  return <button onClick={handleSave}>Save Dashboard</button>;
}
```

### Option B — Simulate a click on the DOM element (Using Refs)
If you want to simulate a physical mouse-click on the button (to trigger hover/active CSS styles or native click propagation), use a React `ref`:

```tsx
import { useRef } from "react";
import { useHotkey } from "@/pejay-ui/hotkeys";

export function DashboardPage() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Programmatically click the DOM element in the callback
  useHotkey("ctrl+s", () => {
    buttonRef.current?.click();
  }, {
    category: "Dashboard",
    description: "Save dashboard data"
  });

  return <button ref={buttonRef} onClick={() => console.log("DOM Clicked!")}>Save Dashboard</button>;
}
```

---

## Hook API Reference

### `useHotkey(keys, callback, options)`

```ts
function useHotkey(
  keys: string,
  callback: (event: KeyboardEvent) => void,
  options?: UseHotkeyOptions
)
```

### The `options` Object

The 3rd parameter is an options object that configures how the hotkey behaves and how it displays inside the `Shift + ?` help overlay:

| Property | Type | Default | Description |
|:---|:---|:---|:---|
| **`description`** | `string` | *raw keys* | The human-readable action label shown next to keys in the help dialog. E.g. `"Submit and save current form"`. |
| **`category`** | `string` | `"General"` | Groups the shortcut under a specific visual header category in the help dialog. E.g. `"Form Actions"`. |
| **`enabledInInputs`** | `boolean` | `false` | If `true`, the hotkey triggers even if the user is typing inside text inputs, textareas, or select dropdowns. E.g. set to `true` for global overlays like `Escape`. |
| **`disabled`** | `boolean` | `false` | If `true`, the hotkey is temporarily deactivated. Useful for checking conditions like `disabled: !isFormDirty` or `disabled: isSubmitting`. |

---

## Supported Modifier Keys & Formats

Specify your key combos in lowercase separated by `+`:

| Format | Output (macOS) | Output (Windows/Linux) |
|:---|:---|:---|
| `ctrl+enter` | `⌘ + Enter` | `Ctrl + Enter` |
| `alt+arrowleft` | `⌥ + ←` | `Alt + ←` |
| `shift+n` | `⇧ + N` | `Shift + N` |
| `escape` | `Esc` | `Esc` |
