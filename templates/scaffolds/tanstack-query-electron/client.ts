/**
 * Electron IPC Client wrapper for TanStack Query.
 * Interacts with Electron IPC handlers (window.electronAPI) instead of REST fetch.
 */

// Helper checking if running in Electron environment
export const isElectronEnv = (): boolean => {
  return typeof window !== "undefined" && Boolean((window as any).electronAPI);
};

export async function ipcRequest<T = any>(
  invoker: () => Promise<T>,
  fallbackValue?: T,
): Promise<T> {
  if (!isElectronEnv()) {
    console.warn(
      "[ipcRequest] window.electronAPI is not available. Using fallback mode.",
    );
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    throw new Error(
      "Electron IPC bridge (window.electronAPI) is not available in browser mode.",
    );
  }
  return await invoker();
}

/**
 * Universal Electron IPC Client
 */
export const ipcClient = {
  /**
   * Safely invokes an IPC method with parameters
   */
  invoke: <T = any>(apiFn: () => Promise<T>, fallback?: T): Promise<T> => {
    return ipcRequest(apiFn, fallback);
  },

  /**
   * Performs an IPC Query action
   */
  query: <T = any>(apiFn: () => Promise<T>, fallback?: T): Promise<T> => {
    return ipcRequest(apiFn, fallback);
  },

  /**
   * Performs an IPC Mutation action
   */
  mutate: <T = any>(apiFn: () => Promise<T>, fallback?: T): Promise<T> => {
    return ipcRequest(apiFn, fallback);
  },
} as const;
