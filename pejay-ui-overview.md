# pejay-ui: Project Overview & Reference Document

This document is a comprehensive guide to the `pejay-ui` codebase. It is designed to be shared with AI systems to help them write marketing copy, documentation, tutorial blogs, landing pages, or social media content about `pejay-ui`.

---

## 1. What is pejay-ui?

**pejay-ui** is a lightweight, developer-first Command Line Interface (CLI) tool designed for React developers. Similar in philosophy to Shadcn UI, it allows developers to initialize, add, and remove premium React components directly into their source code. 

Instead of installing heavy npm packages that bloat the `node_modules` directory and restrict styling customization, `pejay-ui` injects raw, highly customizable Tailwind CSS components, layouts, overlays, and API client templates directly into the project's source tree (under `src/pejay-ui`).

### Core Philosophy
- **Full Ownership**: Developers own the code. They can modify the injected files as they please.
- **Zero Bloat**: Only download the code you need.
- **Modern Tech Stack**: Tailored for **React**, **Tailwind CSS**, **TypeScript** (with automatic fallback to **JavaScript** transpilation), and animation libraries like **Motion** (Framer Motion).
- **Plug-and-Play Scaffolds**: Beyond basic inputs and buttons, it scaffolds entire client setups (e.g., TanStack Query, Redux Store, Axios clients, Routing boilerplate).

---

## 2. Key Features & CLI Capabilities

The CLI is written in Node.js (in [cli.js](file:///C:/1.CODE/pejay-ui/bin/cli.js)) using `commander`, `fs-extra`, and `inquirer`. It provides the following key capabilities:

1. **Project Initialization (`npx pejay-ui init`)**:
   - Creates a local configuration file `pejay-ui.json` in the user's project root directory.
   - Configures the base output directory (default: `src/pejay-ui`) and sets up tracking for installed components.

2. **Component & Category Installation (`npx pejay-ui add <name>`)**:
   - **Single Component**: Installs a specific component (e.g. `npx pejay-ui add form/input`).
   - **Category-Wide Actions**: Installs an entire category (e.g. `npx pejay-ui add form --all` or selectively choosing via interactive check-boxes `npx pejay-ui add form --select`).
   - **Dependency Graph Resolution**: If a component depends on another component or helper utility, `pejay-ui` traverses and resolves dependencies, queuing them in topological order for installation.

3. **Smart Environment Adaptation**:
   - **TypeScript & JavaScript Support**: The templates are written in TypeScript (`.ts`/`.tsx`). If the target project doesn't have a `tsconfig.json`, the CLI automatically compiles/transpiles the code to JavaScript (`.js`/`.jsx`) using `@babel/core` and `@babel/preset-typescript`.
   - **Relative Import Rewriting**: Automatically rewrites import aliases (like `@/utils/cn` or `@/pejay-ui`) into correct relative paths based on where the component is placed relative to the base directory and utilities directory.
   - **Dependency Auto-Installation**: Checks the project's `package.json` for required peer dependencies (e.g. `lucide-react`, `motion`, `@floating-ui/react`, `@tanstack/react-query`). If missing, it automatically installs them using the project's detected package manager (`npm`, `yarn`, or `pnpm`).
   - **Automatic Exports (Indexing)**: Automatically builds and updates category-level and global `index.ts`/`index.js` files, making imports clean and consolidated (e.g., `import { Button, Input } from "@/pejay-ui/components"`).

4. **Safe Removal (`npx pejay-ui remove <name>`)**:
   - Safely deletes the files associated with the component.
   - Re-builds/re-generates index files to clean up exports.
   - **Garbage Collection**: Checks if common helper utilities (like class-merging `cn.ts`) or npm packages are still being used by other installed components. If not, it prompts the user to delete or uninstall them.

5. **Local Status Tracker (`npx pejay-ui status`)**:
   - Scans the registry and the local `pejay-ui.json` to show a styled dashboard of available components and their installation status (e.g., `[✔] Installed` in green or `[ ] Uninstalled`).

---

## 3. Directory Structure

```
pejay-ui/
├── bin/
│   └── cli.js            # Main CLI execution logic
├── registry/             # JSON registry files defining component metadata
│   ├── buttons.json
│   ├── dropdowns.json
│   ├── forms.json
│   └── ...
├── templates/            # Component templates (React + TypeScript)
│   ├── button/
│   ├── form/
│   ├── layouts/
│   ├── scaffolds/
│   └── ...
├── utils/                # Standard utility templates shared across components
│   └── cn.ts             # Tailwind class merging utility
├── package.json          # Node package definition
└── README.md             # Developer instruction manual
```

---

## 4. Catalog of Registry Components

Here are the premium components and scaffolds currently provided by `pejay-ui`:

### A. Buttons
- **`button`**: Modern, highly interactive button component with hover actions, loading states, and variant themes.

### B. Form Inputs (Forms & Pickers)
- **Inputs**: `form/input`, `form/amount-input`, `form/email-input`, `form/file-input`, `form/number-input`, `form/password-input`, `form/phone-input`, `form/url-input`.
- **Selections**: `form/checkbox`, `form/checkbox-group`, `form/radio`, `form/radio-group`, `form/switch`, `form/range-slider`.
- **Advanced Text**: `form/textarea`.
- **Date & Time Pickers**: `form/date-picker`, `form/date-range-picker`, `form/time-picker`, `form/time-range-picker` (provides highly polished date/time input pickers).

### C. Dropdowns & Selects
- **`dropdown/select-input`**: Sleek custom single select drop-down menus.
- **`dropdown/multiselect-input`**: Multi-select dropdown menus with tag views.

### D. Overlays & Context
- **`overlays/portal`**: Renders React components out-of-document flow (perfect for modals/dropdowns).
- **`overlays/tooltip`**: Animated floating tooltips powered by `@floating-ui/react`.
- **`overlays/scrollbar`**: Provides `<CustomScrollArea>` (component wrapper) and `<GlobalScrollProvider>` (app-wide root provider) for silky smooth 60fps lerp momentum scrolling and auto-vanishing custom scrollbars with native CSS suppression.
- **`toast`**: Fully animated notification system (includes a localized usage guide `README.md`).

### E. Layouts
- **`layouts/lv1`**: A ready-to-go premium layout preset with sidebar, header navigation, and content wrapper.

### F. Feedback & Micro-indicators
- **`spinner`**: Premium progress indicators (comes with 9 styled spinner variants).
- **`skeleton`**: Sleek loading state presets.

### G. Client Scaffolds & Boilerplate Templates
These templates allow developers to quickly set up API configurations, State Management, and Routing libraries in seconds:
- **`tanstack-query-client`**: Pre-configured React Query client setup.
- **`react-router-dom-client`**: Frontend routing configuration wrapper.
- **`axios-client`**: Custom Axios instance template with pre-configured interceptors.
- **`redux-store-client`**: Redux Toolkit state management store configuration.
- **`rtk-query-client`**: Redux Toolkit Query API service setup.

---

## 5. Ideal Prompts & Writing Instructions for Content AIs

If you are using this document to prompt another AI to write about `pejay-ui`, here are suggested prompts:

### Blog/Article Generation Prompt:
> *"Write a 1200-word developer tutorial/blog post detailing 'How pejay-ui simplifies UI component styling in React compared to traditional component libraries'. Focus on features like clean tailwind styling, the zero-dependency-bloat codebase, developer ownership, the CLI's automatic TS-to-JS compilation capability, and code indexing exports."*

### Landing Page Copy Prompt:
> *"Write conversion-focused copy for the pejay-ui landing page. Create a catchy headline, a list of unique value propositions (Developer Ownership, Auto-indexing, Smart JS/TS compiler, API Client Scaffolding), and descriptions for interactive commands (`init`, `add`, `remove`, `status`)."*

### Social Media/Twitter Thread Prompt:
> *"Write a engaging 5-tweet thread launching pejay-ui. Focus on how it matches the Shadcn UI flow but brings localized scaffolds (like Tanstack-query and RTK-query clients) and rich-animated inputs out of the box."*
