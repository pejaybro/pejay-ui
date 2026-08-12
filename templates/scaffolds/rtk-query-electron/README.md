# Electron RTK Query Scaffold

A specialized Redux Toolkit Query (RTK Query) setup designed specifically for **Electron Desktop Applications**.

## Key Features
- **Custom `electronBaseQuery`**: Replaces HTTP `fetchBaseQuery` with an IPC channel invocation engine over `window.electronAPI`.
- **Desktop Optimization**: `refetchOnFocus: false` to prevent redundant IPC calls during window switching.
- **Graceful Browser Fallback**: Built-in mock data for testing UI in web browser dev mode.
- **Pre-configured Endpoints & Hooks**: Auto-generated hooks for SQLite database CRUD (`useGetAllDemoQuery`, `useCreateDemoMutation`, etc.) and system IPC.
