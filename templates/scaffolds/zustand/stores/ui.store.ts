import { createStore } from "../core/create-store";

/*
 * ============================================================================
 * UI Store — selector / re-render demo store
 * ============================================================================
 *
 * This store has MANY independent flags that update often. It exists to teach
 * when to use selectors and useShallow correctly.
 *
 * WHEN TO USE selective selectors (one field per line):
 *   - Component only needs ONE value (e.g. just sidebarOpen)
 *   - Best performance — re-renders only when that field changes
 *
 *   const sidebarOpen = useUiStore((s) => s.sidebarOpen);
 *
 * WHEN TO USE useShallow (multiple fields, one subscription):
 *   - Component needs SEVERAL fields from the same store
 *   - You want one selector instead of 4 separate useUiStore calls
 *   - Fields update independently but you read them together in UI
 *
 *   const { sidebarOpen, modalOpen } = useUiStore(
 *     useShallow((s) => ({ sidebarOpen: s.sidebarOpen, modalOpen: s.modalOpen }))
 *   );
 *
 * WHEN TO AVOID useShallow:
 *   - You only need ONE primitive field — plain selector is simpler and enough
 *   - You select the ENTIRE store — useShallow does not help:
 *       useUiStore()  // bad — re-renders on every UI change
 *   - Derived values are expensive — prefer useMemo in component or a dedicated hook
 *
 * WHEN TO AVOID object selectors WITHOUT useShallow:
 *   - NEVER do this — new object every time = re-render every time:
 *
 *   const { sidebarOpen, modalOpen } = useUiStore((s) => ({
 *     sidebarOpen: s.sidebarOpen,
 *     modalOpen: s.modalOpen,
 *   })); // ❌ broken — always re-renders
 *
 * See hooks/useUi.ts for side-by-side examples.
 * ============================================================================
 */

export type UiPanel = "none" | "settings" | "notifications";

type UiState = {
  sidebarOpen: boolean;
  modalOpen: boolean;
  searchOpen: boolean;
  activePanel: UiPanel;
  notificationsCount: number;

  toggleSidebar: () => void;
  openModal: () => void;
  closeModal: () => void;
  toggleSearch: () => void;
  setActivePanel: (panel: UiPanel) => void;
  setNotificationsCount: (count: number) => void;
};

export const useUiStore = createStore<UiState>(
  (set) => ({
    sidebarOpen: true,
    modalOpen: false,
    searchOpen: false,
    activePanel: "none",
    notificationsCount: 0,

    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    openModal: () => set({ modalOpen: true }),
    closeModal: () => set({ modalOpen: false }),
    toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
    setActivePanel: (panel) => set({ activePanel: panel }),
    setNotificationsCount: (count) => set({ notificationsCount: count }),
  }),
  {
    name: "ui",
    devtools: true,
    resetOnLogout: true,
  },
);
