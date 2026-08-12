import { createStore } from "../core/create-store";
import { resetStoresOnLogout } from "../core/reset-store";

export type User = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = createStore<AuthState>(
  (set) => ({
    user: null,

    login: (user) => set({ user }),

    logout: () => resetStoresOnLogout(),
  }),
  {
    name: "auth",
    persist: true,
    storage: "local",
    devtools: true,
    immer: true,
    resetOnLogout: true,
  },
);

/*
# NOTE: storage: "local"

Auth uses localStorage — user stays logged in across browser restarts
until logout(). Use storage: "session" if login should end when the tab closes.

Only stores with resetOnLogout: true are cleared.
Persisted stores with resetOnLogout: false keep their localStorage data
and rehydrate on next login / page refresh.

Usage in a component:

import { useAuthStore } from "@/zustand/auth.store";

const user = useAuthStore((s) => s.user);
const login = useAuthStore((s) => s.login);
const logout = useAuthStore((s) => s.logout);

login({ id: "1", name: "Jane", email: "jane@example.com" });
logout(); // clears auth + other resetOnLogout stores only
*/
