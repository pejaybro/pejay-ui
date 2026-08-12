# Electron TanStack Query Scaffold

A specialized TanStack Query setup designed specifically for **Electron Desktop Applications**.

## Key Features
- **IPC Invocation Bridge**: Replaces REST fetch with IPC queries over `window.electronAPI`.
- **Desktop Query Caching**: Optimized `refetchOnWindowFocus: false` and custom `gcTime` settings tailored for desktop apps.
- **Graceful Web Mocking**: Falls back to mock data when developing UI in pure web browser dev mode.
- **Pre-built IPC Queries & Mutations**: Included query factories and mutation hooks for SQLite database CRUD and window controls.
