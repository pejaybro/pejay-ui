# TimeRangePicker Component

A styled form input component optimized for Tailwind.

---

## Usage

```tsx
import { TimeRangePicker } from "@/pejay-ui/components/form";

<TimeRangePicker
  label="Shift Duration"
  value={range}
  onChange={setRange}
/>
```

---

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `{ start: string, end: string }` | — | Time range selector values. |
