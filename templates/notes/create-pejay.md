# pejay-ui CLI — How It Works

`pejay-ui` is a published npm CLI package that lets you add React UI components
directly into your project source code — similar to how **shadcn/ui** works.

```sh
npx pejay-ui init
npx pejay-ui add button
npx pejay-ui remove button
```

---

## Architecture Overview

```
pejay-ui/
├── bin/
│   └── cli.js            ← CLI entry point (commander + inquirer)
├── templates/
│   ├── button/           ← Component source files
│   ├── form/             ← Form component templates
│   ├── select-dropdown/  ← Dropdown templates
│   └── scaffolds/        ← Full feature scaffolds (router, query client)
│       ├── react-router/
│       └── tanstack-query/
├── utils/
│   └── cn.ts             ← Shared utility (copied on first component install)
├── registry.json         ← Component manifest / dependency graph
└── package.json
```

---

## Key Dependencies

| Package | Role |
|---|---|
| `commander` | Parses CLI commands (`init`, `add`, `remove`) and arguments |
| `inquirer` | Interactive y/n confirmation prompts (used during `remove`) |
| `fs-extra` | File copying, JSON read/write, directory creation |
| `@babel/core` + `@babel/preset-typescript` | Transpiles `.tsx/.ts` → `.jsx/.js` for non-TypeScript projects |

---

## How Each Command Works

### `npx pejay-ui init`

Creates a `pejay-ui.json` config file in your project root:

```json
{
  "baseDir": "src/pejay-ui",
  "installed": {}
}
```

All components will be copied into `src/pejay-ui/components/` and utils into `src/pejay-ui/utils/`.

---

### `npx pejay-ui add <component>`

This is the core command. Here's what happens step by step:

#### 1. Dependency Resolution (Topological Sort)
```
add "form/checkbox-group"
  → registry says it depends on "form/checkbox"
  → installQueue = ["form/checkbox", "form/checkbox-group"]
```
Uses a recursive `resolveDependencies()` + `visited` Set to avoid duplicates and respect install order.

#### 2. Peer Dependency Check
Reads your project's `package.json` and checks if required npm packages are missing.
Auto-detects your package manager:
```
yarn.lock   → yarn add ...
pnpm-lock.yaml → pnpm add ...
(default)   → npm install ...
```

#### 3. Copy Utilities
Copies `utils/cn.ts` (or `.js` for JS projects) into `src/pejay-ui/utils/` — only if it doesn't already exist.

#### 4. Copy Component Files
- Reads template files from the `templates/` directory
- Rewrites `@/utils/cn` import paths to relative paths that work at the copy destination
- **TypeScript projects** → files are copied as-is (`.tsx` / `.ts`)
- **JavaScript projects** → files are transpiled via Babel to `.jsx` / `.js`

#### 5. Track Installation State
Updates `pejay-ui.json` with what was installed:
```json
{
  "installed": {
    "button": {
      "files": ["components/button/Button.tsx", "components/button/tooltip.tsx"],
      "utils": ["cn.ts"]
    }
  }
}
```

---

### `npx pejay-ui remove <component>`

#### 1. Deletes Component Files
Reads the file list from `pejay-ui.json` and removes each tracked file.

#### 2. Smart Utility Cleanup
Counts how many other installed components use each utility.
If a utility is **only used by the removed component**, it prompts:
```
? Remove utility "cn.ts"? (y/N)
```

#### 3. Smart Package Uninstall
Same logic for npm packages — if a `peerDependency` is no longer needed by any other component, it prompts:
```
? Uninstall unused packages: clsx, tailwind-merge? (y/N)
```

#### 4. Updates `pejay-ui.json`
Removes the component's entry from `installed`.

---

## The Registry (`registry.json`)

Each entry defines a component's metadata:

```json
"form/date-picker": {
  "name": "DatePicker",
  "category": "form",
  "files": ["templates/form/date-picker.tsx"],
  "utils": ["cn.ts"],
  "peerDependencies": ["clsx", "tailwind-merge", "lucide-react", "@floating-ui/react"],
  "dependencies": ["select-dropdown/select-input"]
}
```

| Field | Description |
|---|---|
| `category` | Sub-folder under `components/` where files land |
| `files` | Template paths to copy (file or directory) |
| `utils` | Utility files from `utils/` to copy alongside |
| `peerDependencies` | npm packages that must be installed in the target project |
| `dependencies` | Other pejay-ui components that must be installed first |

**Special category — `scaffold`:** Instead of going into `src/pejay-ui/components/`,
scaffold components copy directly into `src/<targetDirName>/`:
```json
"tanstack-query-client": {
  "category": "scaffold",
  "targetDirName": "tanstack-query",
  "files": ["templates/scaffolds/tanstack-query"]
}
```

---

## Available Components

### Form
| Command | Component |
|---|---|
| `add form/input` | Input |
| `add form/amount-input` | AmountInput |
| `add form/checkbox` | Checkbox |
| `add form/checkbox-group` | CheckboxGroup *(auto-installs Checkbox)* |
| `add form/date-picker` | DatePicker *(auto-installs SelectInput)* |
| `add form/date-range-picker` | DateRangePicker *(auto-installs SelectInput)* |
| `add form/email-input` | EmailInput |
| `add form/file-input` | FileInput |
| `add form/number-input` | NumberInput |
| `add form/password-input` | PasswordInput |
| `add form/phone-input` | PhoneInput |
| `add form/radio` | Radio |
| `add form/radio-group` | RadioGroup *(auto-installs Radio)* |
| `add form/range-slider` | RangeSlider |
| `add form/switch` | Switch |
| `add form/textarea` | Textarea |
| `add form/time-picker` | TimePicker *(auto-installs SelectInput)* |
| `add form/time-range-picker` | TimeRangePicker *(auto-installs SelectInput)* |
| `add form/url-input` | UrlInput |

### Dropdowns
| Command | Component |
|---|---|
| `add dropdown/select-input` | SelectInput |
| `add dropdown/multiselect-input` | MultiselectInput |

### Button
| Command | Component |
|---|---|
| `add button` | Button + Tooltip |

### Scaffolds
| Command | What it does |
|---|---|
| `add tanstack-query-client` | Copies full TanStack Query setup into `src/tanstack-query/` |
| `add react-router-client` | Copies full React Router setup into `src/react-router/` |

---

## Publishing a New Version

```sh
# 1. Bump version
npm version patch   # 1.2.2 → 1.2.3
npm version minor   # 1.2.2 → 1.3.0
npm version major   # 1.2.2 → 2.0.0

# 2. Publish
npm publish
```

Live on npm: [npmjs.com/package/pejay-ui](https://www.npmjs.com/package/pejay-ui)
