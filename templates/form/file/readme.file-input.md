# FileInput Component

A styled form input component optimized for Tailwind.

---

## Usage

```tsx
import { FileInput } from "@/pejay-ui/components/form";

<FileInput
  label="Upload Resume"
  accept=".pdf,.docx"
  onChange={(files) => console.log(files)}
/>
```

---

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `multiple` | `boolean` | `false` | Allows multiple file select upload. |
| `accept` | `string` | — | Accepted file formats. |
