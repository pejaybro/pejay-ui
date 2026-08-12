import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isElectronEnv } from "./client";
import type { DemoEntity } from "./module";

export const useElectronDbMutations = () => {
  const queryClient = useQueryClient();

  /**
   * Mutation for inserting a new record into SQLite DB via IPC
   */
  const createDemo = useMutation({
    mutationFn: async (data: { demo: string }) => {
      if (!isElectronEnv()) {
        return { id: Date.now(), demo: data.demo } as DemoEntity;
      }
      return await (window as any).electronAPI.demo.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["electron", "db", "demo"] });
    },
  });

  /**
   * Mutation for updating an existing record in SQLite DB via IPC
   */
  const updateDemo = useMutation({
    mutationFn: async ({ id, demo }: { id: number; demo: string }) => {
      if (!isElectronEnv()) {
        return { id, demo } as DemoEntity;
      }
      return await (window as any).electronAPI.demo.update(id, { demo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["electron", "db", "demo"] });
    },
  });

  /**
   * Mutation for deleting a record from SQLite DB via IPC
   */
  const deleteDemo = useMutation({
    mutationFn: async (id: number) => {
      if (!isElectronEnv()) {
        return true;
      }
      return await (window as any).electronAPI.demo.deleteById(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["electron", "db", "demo"] });
    },
  });

  return {
    createDemo,
    updateDemo,
    deleteDemo,
  };
};

export const useElectronWindowControls = () => {
  return {
    minimize: () => {
      if (isElectronEnv()) (window as any).electronAPI.minimize();
    },
    maximize: () => {
      if (isElectronEnv()) (window as any).electronAPI.maximize();
    },
    close: () => {
      if (isElectronEnv()) (window as any).electronAPI.close();
    },
  };
};
