# RadioGroup Component

A styled form input component optimized for Tailwind.

---

## Usage

```tsx
import { RadioGroup } from "@/pejay-ui/components/form";

<RadioGroup
  label="Preferred Mode"
  options={[{ label: "Dark", value: "dark" }, { label: "Light", value: "light" }]}
  value={theme}
  onChange={setTheme}
/>
```

---

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `options` | `Array<{ label: string, value: string }>` | — | Group items lists. |
