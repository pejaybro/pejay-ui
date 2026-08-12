import { createStore } from "../core/create-store";

type ThemeState = {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
};

export const useThemeStore = createStore<ThemeState>(
  (set) => ({
    theme: "light",

    setTheme: (theme) => set({ theme }),

    toggleTheme: () =>
      set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
  }),
  {
    name: "theme",
    persist: true,
    storage: "local",
    devtools: true,
    resetOnLogout: false,
  },
);

/*
# NOTE: survives logout — localStorage

theme uses storage: "local" (default). Survives logout, browser restart,
and rehydrates on every page load.
*/
