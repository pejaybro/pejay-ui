# pejay-ui

A lightweight CLI tool to initialize, add, and remove React UI components in your projects.

## Core Commands

### 1. Initialize Configuration
```bash
npx pejay-ui init
```

### 2. Add Component
```bash
npx pejay-ui add <component-name-or-category> [options]
```

**Options:**
- `--all`: Install all components in the specified category.
- `--select`: Interactively select which components to install from the specified category.

**Examples:**
- Install a single component directly:
  ```bash
  npx pejay-ui add form/input
  ```
- Install all components in a category (e.g., `form`):
  ```bash
  npx pejay-ui add form --all
  ```
- Select specific components to install from a category (e.g., `form`):
  ```bash
  npx pejay-ui add form --select
  ```
  *(Note: Running `npx pejay-ui add <category>` without options will default to the interactive selection prompt).*

**Automatic Exports (Auto-Indexing):**
Installing components automatically generates or updates `index.ts` (or `index.js`) files at:
1. The category level (e.g., `src/pejay-ui/components/form/index.ts`)
2. The global components level (`src/pejay-ui/components/index.ts`)

This allows you to easily import multiple components:
```typescript
import { Input, Checkbox, AmountInput } from "@/pejay-ui/components";
```

### 3. Remove Component
```bash
npx pejay-ui remove <component-name>
```

### 4. Check Components Status
```bash
npx pejay-ui status
```

Lists all available components categorized, showing their local installation status:
- Installed components are marked with a green `[✔]`.
- Uninstalled components are marked with `[ ]`.

---

## Available Components & Scaffolds

### Buttons
```bash
npx pejay-ui add button
```

### Form Inputs
```bash
npx pejay-ui add form/input
npx pejay-ui add form/amount-input
npx pejay-ui add form/checkbox
npx pejay-ui add form/checkbox-group
npx pejay-ui add form/email-input
npx pejay-ui add form/file-input
npx pejay-ui add form/number-input
npx pejay-ui add form/password-input
npx pejay-ui add form/phone-input
npx pejay-ui add form/radio
npx pejay-ui add form/radio-group
npx pejay-ui add form/range-slider
npx pejay-ui add form/switch
npx pejay-ui add form/textarea
npx pejay-ui add form/url-input
```

### Date & Time Pickers
```bash
npx pejay-ui add form/date-picker
npx pejay-ui add form/date-range-picker
npx pejay-ui add form/time-picker
npx pejay-ui add form/time-range-picker
```

### Dropdowns & Selects
```bash
npx pejay-ui add dropdown/select-input
npx pejay-ui add dropdown/multiselect-input
```

### Layouts
```bash
npx pejay-ui add layouts/lv1
```

### Scaffolds & Templates
```bash
npx pejay-ui add tanstack-query-client
npx pejay-ui add react-router-client
npx pejay-ui add tanstack-router-client
npx pejay-ui add axios-client
npx pejay-ui add redux-store-client
npx pejay-ui add rtk-query-client
```
