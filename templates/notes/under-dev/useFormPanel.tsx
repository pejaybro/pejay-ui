import { useCallback, type ComponentType } from "react";
import { useOverlay } from "./useOverlay";

export function useFormPanel() {
  const { openSidePanel } = useOverlay();

  return useCallback(
    <P extends { close: () => void }>(
      Component: ComponentType<P>,
      props: Omit<P, "close">,
    ) => {
      openSidePanel(({ close }) => (
        <Component {...({ ...props, close } as P)} />
      ));
    },
    [openSidePanel],
  );
}
