import type { BaseQueryFn } from "@reduxjs/toolkit/query";

export interface ElectronBaseQueryArgs {
  channel: string;
  args?: any;
}

// Helper checking if running in Electron environment
export const isElectronEnv = (): boolean => {
  return typeof window !== "undefined" && Boolean((window as any).electronAPI);
};

export const electronBaseQuery = (): BaseQueryFn<
  ElectronBaseQueryArgs | string,
  unknown,
  { message: string }
> => {
  return async (arg: ElectronBaseQueryArgs | string) => {
    const channel = typeof arg === "string" ? arg : arg.channel;
    const channelArgs = typeof arg === "string" ? undefined : arg.args;

    if (!isElectronEnv()) {
      console.warn(`[RTK Query Electron] Browser fallback mode for channel: "${channel}"`);
      if (channel === "ping") {
        return { data: "pong (web mock)" };
      }
      if (channel === "demo:get-all") {
        return {
          data: [
            { id: 1, demo: "Mock Record 1", created_at: new Date().toISOString() },
            { id: 2, demo: "Mock Record 2", created_at: new Date().toISOString() },
          ],
        };
      }
      return { data: null };
    }

    try {
      const electronAPI = (window as any).electronAPI;
      let result: any;

      if (channel === "ping") {
        result = await electronAPI.ping();
      } else if (channel.startsWith("demo:")) {
        const action = channel.replace("demo:", "");
        if (action === "get-all") result = await electronAPI.demo.getAll();
        else if (action === "get-by-id") result = await electronAPI.demo.getById(channelArgs);
        else if (action === "create") result = await electronAPI.demo.create(channelArgs);
        else if (action === "update") result = await electronAPI.demo.update(channelArgs.id, channelArgs.demo);
        else if (action === "delete") result = await electronAPI.demo.deleteById(channelArgs);
      } else {
        throw new Error(`Unhandled Electron IPC channel: ${channel}`);
      }

      return { data: result };
    } catch (error: any) {
      return {
        error: { message: error?.message || "Electron IPC invocation error" },
      };
    }
  };
};
