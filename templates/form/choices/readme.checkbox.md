# Checkbox Component

A styled form input component optimized for Tailwind.

---

## Usage

```tsx
import { Checkbox } from "@/pejay-ui/components/form";

<Checkbox
  label="I agree to terms"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
/>
```

---

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | — | Description text displayed next to the checkbox box. |
| `checked` | `boolean` | `false` | Checked state. |
