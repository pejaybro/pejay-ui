import { useShallow, pickState } from "../core/selectors";
import { useUiStore } from "../stores/ui.store";

/*
 * ============================================================================
 * useUi — selector patterns for the UI store
 * ============================================================================
 */

/** ✅ Pattern A — single field. Use when component needs only one value. */
export function useSidebarOpen() {
  return useUiStore((s) => s.sidebarOpen);
}

/**
 * ✅ Pattern B — useShallow with inline object.
 * Use when component needs multiple fields and you want one subscription.
 */
export function useUiShell() {
  return useUiStore(
    useShallow((s) => ({
      sidebarOpen: s.sidebarOpen,
      modalOpen: s.modalOpen,
      searchOpen: s.searchOpen,
    })),
  );
}

/**
 * ✅ Pattern C — useShallow + pickState helper.
 * Same as Pattern B but cleaner when picking many keys by name.
 */
export function useUiPanelState() {
  return useUiStore(
    useShallow(pickState(["activePanel", "notificationsCount"])),
  );
}

/**
 * ✅ Pattern D — separate selectors (like useOne.ts).
 * Alternative to useShallow — multiple subscriptions, still correct.
 * Prefer when you only need 2 fields and want zero shallow overhead.
 */
export function useUiModal() {
  const modalOpen = useUiStore((s) => s.modalOpen);
  const openModal = useUiStore((s) => s.openModal);
  const closeModal = useUiStore((s) => s.closeModal);
  return { modalOpen, openModal, closeModal };
}

/*
 * ❌ ANTI-PATTERN — do not copy (shown for learning only)
 *
 * export function useUiShellBroken() {
 *   return useUiStore((s) => ({
 *     sidebarOpen: s.sidebarOpen,
 *     modalOpen: s.modalOpen,
 *   }));
 * }
 *
 * Why broken: returns a new object reference every render → re-renders
 * even when sidebarOpen and modalOpen did not change.
 *
 * Fix: wrap with useShallow (see useUiShell above).
 */
