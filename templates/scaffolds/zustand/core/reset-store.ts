type ResetEntry = {
  name: string;
  reset: () => void;
};

const resetters = new Map<string, ResetEntry>();

/** Called internally by createStore when resetOnLogout: true */
export function registerReset(name: string, reset: () => void) {
  resetters.set(name, { name, reset });
}

/** Reset only stores opted in via resetOnLogout: true (e.g. auth, session cache) */
export function resetStoresOnLogout() {
  resetters.forEach(({ reset }) => reset());
}

/** @deprecated Use resetStoresOnLogout — kept for backwards compatibility */
export const resetAllStores = resetStoresOnLogout;

/** List store names that will reset on logout */
export function getLogoutResetStoreNames() {
  return Array.from(resetters.keys());
}
