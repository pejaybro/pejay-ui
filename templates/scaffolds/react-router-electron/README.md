# Electron React Router Scaffold

A specialized React Router setup using **Hash Routing** (`createHashRouter`) designed specifically for **Electron Desktop Applications**.

## Why Hash Routing (`createHashRouter`)?
Standard browser routers (`createBrowserRouter`) rely on HTML5 `pushState`, which requires server-side URL rewrites. In packaged Electron apps running on local file system paths (`file:///app/dist/index.html`), page refreshes or sub-route navigation fail without Hash routing. `createHashRouter` uses hash-based URLs (`/#/dashboard`, `/#/settings`) which work 100% reliably in Electron production builds.

## Included Features
- **Frameless Titlebar & Window Controls**: Pre-configured IPC window control handlers (`minimize`, `maximize`, `close`).
- **Desktop Sidebar Navigation Layout**: Flexible desktop app layout with active route highlighting.
- **Electron Route Guard & Error Boundaries**: Desktop-optimized error boundary layouts.
