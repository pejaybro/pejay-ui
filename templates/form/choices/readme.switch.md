# Switch Component

A styled form input component optimized for Tailwind.

---

## Usage

```tsx
import { Switch } from "@/pejay-ui/components/form";

<Switch
  label="Enable Notifications"
  checked={isEnabled}
  onChange={setIsEnabled}
/>
```

---

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | — | Helper label text. |
| `checked` | `boolean` | `false` | Toggles checkbox status on/off. |
