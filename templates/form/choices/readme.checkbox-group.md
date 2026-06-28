# CheckboxGroup Component

A styled form input component optimized for Tailwind.

---

## Usage

```tsx
import { CheckboxGroup } from "@/pejay-ui/components/form";

<CheckboxGroup
  label="Hobbies"
  options={[{ label: "Sports", value: "sports" }, { label: "Music", value: "music" }]}
  value={hobbies}
  onChange={setHobbies}
/>
```

---

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `options` | `Array<{ label: string, value: string }>` | — | Option items list. |
| `value` | `string[]` | — | Selected values list. |
