# RangeSlider Component

A styled form input component optimized for Tailwind.

---

## Usage

```tsx
import { RangeSlider } from "@/pejay-ui/components/form";

<RangeSlider
  min={0}
  max={100}
  value={val}
  onChange={setVal}
/>
```

---

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `min` | `number` | `0` | Minimum range. |
| `max` | `number` | `100` | Maximum range. |
