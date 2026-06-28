# DateRangePicker Component

A styled form input component optimized for Tailwind.

---

## Usage

```tsx
import { DateRangePicker } from "@/pejay-ui/components/form";

<DateRangePicker
  label="Booking Duration"
  value={range}
  onChange={setRange}
/>
```

---

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `{ start: Date, end: Date }` | — | Date range values. |
