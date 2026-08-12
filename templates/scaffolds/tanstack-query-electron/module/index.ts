import { queryOptions } from "@tanstack/react-query";
import { isElectronEnv } from "../client";

export interface DemoEntity {
  id: number;
  demo: string;
  created_at?: string;
  updated_at?: string;
}

export const ElectronSystemQueries = {
  /**
   * Query option for fetching desktop system info via IPC
   */
  getSystemInfo: () =>
    queryOptions({
      queryKey: ["electron", "system-info"],
      queryFn: async () => {
        if (!isElectronEnv()) {
          return { ping: "pong (web mock)", isElectron: false };
        }
        const ping = await (window as any).electronAPI.ping();
        return { ping, isElectron: true };
      },
    }),
};

export const ElectronDbQueries = {
  /**
   * Query option for fetching all demo records from SQLite DB
   */
  getAllDemo: () =>
    queryOptions({
      queryKey: ["electron", "db", "demo"],
      queryFn: async () => {
        if (!isElectronEnv()) {
          return [
            { id: 1, demo: "Mock Record 1", created_at: new Date().toISOString() },
            { id: 2, demo: "Mock Record 2", created_at: new Date().toISOString() },
          ] as DemoEntity[];
        }
        return await (window as any).electronAPI.demo.getAll();
      },
    }),

  /**
   * Query option for fetching a single demo record by ID
   */
  getDemoById: (id: number) =>
    queryOptions({
      queryKey: ["electron", "db", "demo", id],
      queryFn: async () => {
        if (!isElectronEnv()) {
          return { id, demo: `Mock Record ${id}` } as DemoEntity;
        }
        return await (window as any).electronAPI.demo.getById(id);
      },
      enabled: Boolean(id),
    }),
};
