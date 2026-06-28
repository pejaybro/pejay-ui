# Select Dropdown Components

A set of highly accessible single and multi-select dropdown fields with built-in search filtering, custom option templates, keyboard support, and async loading spinners.

---

## 1. Single Select Dropdown (`SelectInput`)

```tsx
import { SelectInput } from "@/pejay-ui/components/select-dropdown";

const options = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2" }
];

<SelectInput
  label="Select Project"
  options={options}
  value={value}
  onChange={setValue}
  searchable
  placeholder="Choose a project..."
/>
```

---

## 2. Multi-Select Dropdown (`MultiSelectInput`)

Supports selecting multiple items, rendering selected items as dismissible badges inside the input field.

```tsx
import { MultiSelectInput } from "@/pejay-ui/components/select-dropdown";

<MultiSelectInput
  label="Select Tags"
  options={options}
  value={values}
  onChange={setValues}
  searchable
  maxSelected={5}
/>
```

---

## 3. Component API Props

### Shared Dropdown Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | — | Label text shown above the select field. |
| `options` | `Array<{ label: string; value: string; disabled?: boolean }>` | — | The option items list. |
| `placeholder` | `string` | `"Select..."` | Helper placeholder shown when empty. |
| `searchable` | `boolean` | `false` | Enables filter search input inside the dropdown. |
| `loading` | `boolean` | `false` | Shows a spinner overlay inside the list box. |
| `disabled` | `boolean` | `false` | Disables toggle dropdown interactions. |
| `error` | `string` | — | Highlights the input border in red with a text alert. |
| `renderOption` | `(option: Option) => ReactNode` | — | Optional custom renderer callback to style list options. |
| `renderValue` | `(selected: Option \| Option[]) => ReactNode` | — | Optional custom renderer callback to style selected values inside the header. |
