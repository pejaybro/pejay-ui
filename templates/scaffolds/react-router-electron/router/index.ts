import { createHashRouter, RouteObject } from "react-router-dom";
import { ELECTRON_PATH } from "./path";
import { ElectronAppLayout } from "./layouts/electron-app.layout";
import { ElectronErrorLayout } from "./layouts/error.layout";
import { ElectronGuard } from "./guards/electron.guard";

/**
 * Hash-based router configuration for Electron desktop applications.
 *
 * NOTE: Electron apps must use `createHashRouter` instead of `createBrowserRouter`
 * because local file protocol (`file://`) and packaged assets (`dist/index.html`)
 * do not support HTML5 pushState URL rewrites.
 */
const electronRoutes: RouteObject[] = [
  {
    Component: ElectronGuard,
    children: [
      {
        Component: ElectronAppLayout,
        ErrorBoundary: ElectronErrorLayout,
        children: [
          {
            path: ELECTRON_PATH.root(),
            lazy: async () => {
              const mod = await import("../routes/page-root");
              return { Component: mod.default };
            },
          },
          {
            path: ELECTRON_PATH.dashboard(),
            lazy: async () => {
              const mod = await import("../routes/page-root");
              return { Component: mod.default };
            },
          },
          {
            path: ELECTRON_PATH.settings(),
            lazy: async () => {
              const mod = await import("../routes/page-settings");
              return { Component: mod.default };
            },
          },
          {
            path: ELECTRON_PATH.database(),
            lazy: async () => {
              const mod = await import("../routes/page-db");
              return { Component: mod.default };
            },
          },
        ],
      },
    ],
  },
];

export const electronRouter = createHashRouter(electronRoutes);
