import { createStore } from "../core/create-store";

type DraftState = {
  draft: string;
  setDraft: (draft: string) => void;
  clearDraft: () => void;
};

export const useDraftStore = createStore<DraftState>(
  (set) => ({
    draft: "",
    setDraft: (draft) => set({ draft }),
    clearDraft: () => set({ draft: "" }),
  }),
  {
    name: "draft",
    persist: true,
    storage: "session",
    devtools: true,
    resetOnLogout: false,
  },
);

/*
# NOTE: storage: "session"

Draft uses sessionStorage — survives page refresh within the same tab,
but is cleared when the tab/browser session ends. Good for form drafts,
wizard steps, or temporary UI state you do not want in localStorage.

Compare:
  auth  → storage: "local"   — login survives browser restart
  theme → storage: "local"   — preference survives browser restart
  draft → storage: "session" — tab-scoped only
*/
