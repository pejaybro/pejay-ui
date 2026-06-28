import { useCallback, type ComponentType } from "react";
import { useOverlay } from "./useOverlay";

/**
 * Like `useFormPanel` but opens the component inside a centered MODAL
 * instead of a side panel. Injects `close` automatically.
 */
export function useModalForm() {
  const { openModal } = useOverlay();

  return useCallback(
    <P extends { close: () => void }>(
      Component: ComponentType<P>,
      props: Omit<P, "close">,
    ) => {
      openModal(({ close }) => (
        <Component {...({ ...props, close } as P)} />
      ));
    },
    [openModal],
  );
}
