# Input (Text) Component

A styled form input component optimized for Tailwind.

---

## Usage

```tsx
import { Input } from "@/pejay-ui/components/form";

<Input
  label="User Name"
  placeholder="Enter your user name"
  prefix={<UserIcon size={16} />}
/>
```

---

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | — | Label text displayed above the input. |
| `error` | `string` | — | Validation error text that highlights borders red. |
| `prefix` | `ReactNode` | — | Component to render on the left side of the input field. |
| `suffix` | `ReactNode` | — | Component to render on the right side of the input field. |
