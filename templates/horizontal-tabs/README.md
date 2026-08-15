# HorizontalTabMenu Component

A scrollable horizontal tab bar with left/right arrow navigation and optional icon support. Tabs are defined in a separate config file — the component reads from it directly.

---

## Installation

```bash
npx pejay-ui add horizontal-tabs
```

---

## Files Installed

```
your-project/
└── src/pejay-ui/components/horizontal-tabs/
    ├── horizontal-tab-menu.tsx     ← component (do not edit)
    └── horizontal-tabs.config.ts  ← your tab definitions (edit this)
```

---

## Setup

Open `horizontal-tabs.config.ts` and define your tabs:

```ts
import { LayoutDashboard, Bell, type LucideIcon } from "lucide-react";

export interface HorizontalTabItem {
  id: string;
  name: string;
  icon?: LucideIcon;
}

export const MY_TABS: HorizontalTabItem[] = [
  { id: "tab-1", name: "Tab 1", icon: LayoutDashboard },
  { id: "tab-2", name: "Tab 2" },
];
```

Then drop the component anywhere:

```tsx
import { HorizontalTabMenu } from "@/pejay-ui/components/horizontal-tabs";

<HorizontalTabMenu />
```

---

## Arrow Navigation Mode

By default arrows scroll the tab strip. Pass `features={{ arrowNavigation: true }}` to make arrows cycle the active tab instead.

```tsx
<HorizontalTabMenu features={{ arrowNavigation: true }} />
```

---

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `features` | `HorizontalTabMenuFeatures` | `{}` | Optional feature flags. |

### `HorizontalTabMenuFeatures`

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `arrowNavigation` | `boolean` | `false` | `true` → arrows cycle active tab. `false` → arrows scroll the strip. |

---

## `HorizontalTabItem` (defined in config)

| Key | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | ✅ | Unique identifier. |
| `name` | `string` | ✅ | Label shown on the tab button. |
| `icon` | `LucideIcon` | — | Optional Lucide icon rendered left of the name. |

---

## Behaviour Notes

- **First tab active by default** — no setup needed.
- **Config-driven** — add, remove, or reorder tabs in `horizontal-tabs.config.ts` only.
- **Auto-scroll** — the active tab scrolls into view automatically on activation.
- **Arrow visibility** — arrows dim and become non-interactive when there is nothing to scroll (Option A) or at the first/last tab (Option B).
