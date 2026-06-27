# pejay-ui Project File Tree Map

This document acts as a static map of the codebase structure.

```
pejay-ui/
├── .agents/
│   ├── AGENTS.md                  # Custom coding guidelines
│   ├── OVERLAYS.md                # AppProvider overlay documentation
│   └── PROJECT_MAP.md             # This file map
├── bin/
│   └── cli.js                     # Core CLI commands (init, add, remove, status)
├── registry/                      # Component/Scaffold registration metadata
│   ├── buttons.json
│   ├── dropdowns.json
│   ├── forms.json
│   ├── layouts.json
│   ├── overlays.json
│   ├── scaffolds.json
│   └── toast.json
├── templates/                     # Source component templates and boilerplates
│   ├── button/                    # Button components (Button, tooltip)
│   ├── form/                      # Input fields (email, file, time, date, checkbox, etc.)
│   ├── layouts/                   # Dashboard layouts (sidebar, app layouts)
│   ├── overlays/                  # Portal overlays
│   ├── select-dropdown/           # Select & Multiselect inputs
│   ├── toast/                     # Lightweight global toast system (store, UI, types)
│   ├── scaffolds/                 # Boilerplate clients (axios, react-router, tanstack, redux, rtk-query)
│   ├── scripts/                   # Setup scripts (setup.bat, setup.ps1)
│   └── notes/                     # Markdown roadmap files & documentation
├── utils/
│   └── cn.ts                      # Tailwind merge/clsx classnames utility
├── .gitignore
├── .npmignore
├── LICENSE
├── package.json
├── README.md
└── tsconfig.json
```
