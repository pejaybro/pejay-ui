# pejay-ui Custom Coding Guidelines

These rules are specific to the `pejay-ui` project workspace and must be followed by AI coding assistants.

## 1. Exclude Test / Demo Directories
- **Never modify or reference** `others/`, `demo/`, or `test-app/` folders during core CLI edits.
- These folders are for local sandbox testing only and should remain isolated from published package files.

## 2. Component Templating Rules
- **Relative Imports Only**: All code inside `templates/` (e.g. Button, Form inputs) must use relative imports (`./` or `../`). Do not use absolute path aliases (e.g. `@/`) to ensure they import cleanly when copied into the user's project.
- **Utility Mappings**: When templates require common utility modules (like class-merging `cn.ts`), specify them in the registry JSON files under the `"utils"` property.
- **JavaScript Compatibility**: Ensure the CLI can automatically transpile TypeScript templates (`.ts`/`.tsx`) to JavaScript (`.js`/`.jsx`) using `@babel/core` if the target project doesn't have a `tsconfig.json`.

## 3. CLI Command Lifecycles
- **Index Generation**: When adding or removing components, the CLI must automatically build/rebuild category-level and global `index.ts`/`index.js` files in the user's destination directory.
- **Garbage Collection**: On component removal, check the dependencies of other installed components. Prompt the user to uninstall unused npm packages or delete unused helper utility files if they are no longer needed.
