# DatePicker Component

A styled form input component optimized for Tailwind.

---

## Usage

```tsx
import { DatePicker } from "@/pejay-ui/components/form";

<DatePicker
  label="Date of Birth"
  value={birthDate}
  onChange={setBirthDate}
/>
```

---

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `Date` | — | Selected date object. |
| `onChange` | `(date: Date) => void` | — | Callback when date is selected. |
