import { create, type StateCreator } from "zustand";
import { withDevtools, withImmer, withPersist } from "./middleware";
import { registerReset } from "./reset-store";
import type { PersistStorageOption } from "./storage";

export type CreateStoreOptions = {
  /** Used as persist key and devtools store name */
  name: string;
  persist?: boolean;
  devtools?: boolean;
  immer?: boolean;
  /**
   * Storage backend when persist: true.
   * - "local"   → localStorage (default)
   * - "session" → sessionStorage
   * - custom    → Zustand PersistStorage adapter
   */
  storage?: PersistStorageOption;
  /**
   * When true, this store is reset when resetStoresOnLogout() runs.
   * Stores with persist + resetOnLogout: false keep their storage data across logout.
   */
  resetOnLogout?: boolean;
};

function composeMiddleware<T>(
  initializer: StateCreator<T, [], []>,
  options: CreateStoreOptions,
): StateCreator<T, [], []> {
  let fn: StateCreator<T, any[], any[]> = initializer;

  // Inner → outer: immer → persist → devtools
  if (options.immer) {
    fn = withImmer(fn);
  }
  if (options.persist) {
    fn = withPersist(fn, options.name, options.storage ?? "local");
  }
  if (options.devtools) {
    fn = withDevtools(fn, options.name);
  }

  return fn as StateCreator<T, [], []>;
}

export function createStore<T>(
  initializer: StateCreator<T, [], []>,
  options: CreateStoreOptions,
) {
  const composed = composeMiddleware(initializer, options);
  const store = create<T>()(composed);

  if (options.resetOnLogout) {
    const initialState = store.getState();
    registerReset(options.name, () => {
      store.setState(initialState, true);
    });
  }

  return store;
}
