import type { StateCreator } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  resolvePersistStorage,
  type PersistStorageOption,
} from "./storage";

type AnyStateCreator<T> = StateCreator<T, any[], any[]>;

/** Redux DevTools — wrap only, no combinations */
export const withDevtools = <T>(fn: AnyStateCreator<T>, name: string) =>
  devtools(fn as never, { name });

/** Persist to a storage backend — wrap only, no combinations */
export const withPersist = <T>(
  fn: AnyStateCreator<T>,
  name: string,
  storage: PersistStorageOption = "local",
) =>
  persist(fn as never, {
    name,
    storage: resolvePersistStorage(storage),
  });

/** Immer draft updates — wrap only */
export const withImmer = <T>(fn: AnyStateCreator<T>) => immer(fn as never);
