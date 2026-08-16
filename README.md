# pejay-ui

A lightweight CLI tool to initialize, add, and remove React UI components, layouts, overlays, and client scaffolding templates in your projects.

## Core Commands

### 1. Initialize Configuration
```bash
npx pejay-ui init
```

### 2. Add Component / Layout / Scaffold / Utility
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
  npx pejay-ui add utilities/clipboard
  ```
- Install a specific layout variant:
  ```bash
  npx pejay-ui add layouts/vr-1
  ```
- Install all components in a category (e.g., `form`, `layouts`, `overlays`, or `utilities`):
  ```bash
  npx pejay-ui add form --all
  npx pejay-ui add layouts --all
  npx pejay-ui add overlays --all
  npx pejay-ui add utilities --all
  ```
- Select specific components to install from a category (e.g., `form` or `layouts`):
  ```bash
  npx pejay-ui add form --select
  npx pejay-ui add layouts
  ```
  *(Note: Running `npx pejay-ui add <category>` without options defaults to an interactive selection prompt).*

**Automatic Exports (Auto-Indexing):**
Installing components automatically generates or updates `index.ts` (or `index.js`) files at:
1. The category level (e.g., `src/pejay-ui/components/form/index.ts`)
2. The global components level (`src/pejay-ui/components/index.ts`)

This allows you to easily import multiple components clean and cleanly:
```typescript
import { Input, Checkbox, AmountInput } from "@/pejay-ui/components";
```

**Component-Specific Documentation (READMEs):**
Certain components (like `toast`, `popover`, `spinner`, `skeleton`, `horizontal-tabs`, layout variants, and utilities) ship with localized `README.md` guides. When installed, the CLI copies their detailed usage documentation directly into the component's folder so you have reference docs right next to the source code.

**Overwrite Protection:**
To prevent accidentally overwriting any custom modifications you have made to your components, the CLI checks if the component is already tracked in `pejay-ui.json` or if its files already exist in your workspace. It will ask for confirmation before overwriting:
```
? Component '<name>' is already present in your project. Overwriting it will discard any local changes you have made. Do you want to proceed and overwrite it? (y/N)
```
- Choosing **No** safely skips the installation, preserving your local changes.
- Choosing **Yes** overwrites the files with a fresh copy of the template.

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

## Available Components, Layouts & Scaffolds

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
*(Supports category-wide commands: `npx pejay-ui add form --all` or `npx pejay-ui add form --select`)*

### Date & Time Pickers
```bash
npx pejay-ui add form/date-picker
npx pejay-ui add form/date-range-picker
npx pejay-ui add form/time-picker
npx pejay-ui add form/time-range-picker
```
*(Supports category-wide commands: `npx pejay-ui add form --all` or `npx pejay-ui add form --select`)*

### Dropdowns & Selects
```bash
npx pejay-ui add dropdown/select-input
npx pejay-ui add dropdown/multiselect-input
```
*(Supports category-wide commands: `npx pejay-ui add dropdown --all` or `npx pejay-ui add dropdown --select`)*

### Horizontal Tabs
```bash
npx pejay-ui add horizontal-tab-menu
```
*(Supports category-wide commands: `npx pejay-ui add horizontal-tabs --all` or `npx pejay-ui add horizontal-tabs --select`)*

### Layouts
```bash
npx pejay-ui add layouts/vr-1  # Collapsible & Resizable Sidebar
npx pejay-ui add layouts/vr-2  # Dual Sidebar (Left + Right)
npx pejay-ui add layouts/vr-3  # Left Sidebar with Mobile Drawer / Fullscreen Overlay
npx pejay-ui add layouts/vr-4  # Top Nav with Mobile Left Slide Drawer
npx pejay-ui add layouts/vr-5  # Bottom Nav with Bottom Slide Drawer
```
*(Supports category-wide commands: `npx pejay-ui add layouts --all` or `npx pejay-ui add layouts --select`)*

### Overlays
```bash
npx pejay-ui add overlays/portal
npx pejay-ui add overlays/tooltip
npx pejay-ui add overlays/popover
npx pejay-ui add overlays/scrollbar
```
*(Supports category-wide commands: `npx pejay-ui add overlays --all` or `npx pejay-ui add overlays --select`)*

### Panels & Modals
```bash
npx pejay-ui add panels
```

### Hotkeys & Keyboard Shortcuts
```bash
npx pejay-ui add hotkeys
```

### Toast
```bash
npx pejay-ui add toast
```
*(Includes a localized `README.md` guide copied directly into your components folder).*

### Spinners
```bash
npx pejay-ui add spinner
```
*(Includes a localized `README.md` showing all 9 spinner styles).*

### Skeletons
```bash
npx pejay-ui add skeleton
```
*(Includes a localized `README.md` showing all skeleton presets).*

### Utilities
```bash
npx pejay-ui add utilities/clipboard
npx pejay-ui add utilities/sanitize
npx pejay-ui add utilities/formater-datetime
npx pejay-ui add utilities/formater-phonenumber
```
*(Supports category-wide commands: `npx pejay-ui add utilities --all` or `npx pejay-ui add utilities --select`)*

### Scaffolds & Client Templates
```bash
npx pejay-ui add tanstack-query-client
npx pejay-ui add tanstack-query-electron-client
npx pejay-ui add react-router-client
npx pejay-ui add react-router-electron-client
npx pejay-ui add tanstack-router-client
npx pejay-ui add axios-client
npx pejay-ui add redux-store-client
npx pejay-ui add rtk-query-client
npx pejay-ui add rtk-query-electron-client
npx pejay-ui add zustand-client
```
*(Supports category-wide commands: `npx pejay-ui add scaffold --all` or `npx pejay-ui add scaffold --select`)*
