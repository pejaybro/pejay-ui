import {
  createJSONStorage,
  type PersistStorage,
  type StorageValue,
} from "zustand/middleware";

/** Built-in browser storage backends */
export type PersistStorageType = "local" | "session";

/** Built-in name or a custom Zustand PersistStorage adapter */
export type PersistStorageOption =
  | PersistStorageType
  | PersistStorage<StorageValue<unknown>>;

const isBuiltinStorage = (
  storage: PersistStorageOption,
): storage is PersistStorageType =>
  storage === "local" || storage === "session";

/**
 * Resolve a storage option to a Zustand persist storage adapter.
 *
 * - "local"   → localStorage  (default — survives browser restart)
 * - "session" → sessionStorage (cleared when tab/browser session ends)
 * - custom    → pass your own PersistStorage (IndexedDB, cookies, etc.)
 */
export function resolvePersistStorage(storage: PersistStorageOption = "local") {
  if (!isBuiltinStorage(storage)) {
    return storage;
  }

  return createJSONStorage(() =>
    storage === "session" ? sessionStorage : localStorage,
  );
}
